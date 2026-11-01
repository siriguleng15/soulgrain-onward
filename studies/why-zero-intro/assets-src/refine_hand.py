"""Editable derivative of the MIT generic WebXR hand; never uses reference-site assets.
Run with Blender 5.2: blender -b --python assets-src/refine_hand.py
"""
import bpy, bmesh, json, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
LONG_ARM = '--long-arm' in sys.argv
TAG = 'hand-long-v3' if LONG_ARM else 'hand-refined-v2'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'public/assets/hand-right.glb'))
mesh = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
bpy.context.view_layer.objects.active = mesh
mesh.select_set(True)
bm = bmesh.new()
bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=.000001)
# The licensed hand is capped at its wrist. Make one controlled cut at that cap,
# then extend only this new boundary (never the UV seam duplicates).
centroid = sum((v.co for v in bm.verts), Vector()) / len(bm.verts)
armature = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
wrist_local = mesh.matrix_world.inverted() @ armature.matrix_world @ armature.data.bones['wrist'].head_local
delta = wrist_local - centroid
axis = max(range(3), key=lambda i: abs(delta[i]))
outward = Vector((0, 0, 0))
outward[axis] = 1 if delta[axis] >= 0 else -1
cap = max(v.co.dot(outward) for v in bm.verts)
plane = outward * (cap - .008)
bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), plane_co=plane, plane_no=outward, clear_outer=True, dist=.000001)
edges = [e for e in bm.edges if e.is_boundary]
vertices = list({v for e in edges for v in e.verts})
if vertices:
    center = sum((v.co for v in vertices), Vector()) / len(vertices)
    centroid = sum((v.co for v in bm.verts), Vector()) / len(bm.verts)
    direction = outward
    # The only open boundary is the wrist. Extend it as a continuous weighted sleeve.
    wrist = mesh.vertex_groups.get('wrist')
    layer = bm.verts.layers.deform.verify()
    old = vertices
    for i in range(1, 6):
        new = []
        for v in vertices:
            p = center + (v.co - center) * (1 + i * (.07 if LONG_ARM else .012)) + direction * ((.036 if LONG_ARM else .011) * i)
            n = bm.verts.new(p)
            if wrist:
                n[layer][wrist.index] = 1.0
            new.append(n)
        mapping = dict(zip(vertices, range(len(vertices))))
        for e in edges:
            a, b = [mapping[v] for v in e.verts]
            bm.faces.new((old[a], old[b], new[b], new[a]))
        old = new
    for edge in bm.edges:
        edge.smooth = True
    for face in bm.faces:
        face.smooth = True
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.normal_update()
    bm.to_mesh(mesh.data)
bm.free()
mesh.data.update()
# The reference has a fuller, gloved silhouette than the lean WebXR base.
# Inflate the finger cross sections while retaining their centerlines and skin weights.
groups = {g.index: g.name for g in mesh.vertex_groups}
armature = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
to_mesh = mesh.matrix_world.inverted() @ armature.matrix_world
heads = {b.name: to_mesh @ b.head_local for b in armature.data.bones}
for v in mesh.data.vertices:
    influences = [(a.weight, groups[a.group]) for a in v.groups if 'phalanx' in groups[a.group]]
    if not influences:
        continue
    weight, name = max(influences)
    if 'proximal' in name:
        next_name = name.replace('proximal', 'distal' if name.startswith('thumb') else 'intermediate')
    elif 'intermediate' in name:
        next_name = name.replace('intermediate', 'distal')
    else:
        next_name = name.replace('phalanx-distal', 'tip')
    if name not in heads or next_name not in heads:
        continue
    a, b = heads[name], heads[next_name]
    axis_vector = b - a
    t = min(1.0, max(0.0, (v.co - a).dot(axis_vector) / max(.000001, axis_vector.length_squared)))
    centerline = a + axis_vector * t
    amount = .12 if name.startswith('thumb') else .32
    v.co += (v.co - centerline) * amount * min(1, sum(w for w, _ in influences))
sub = mesh.modifiers.new('Editable surface refinement', 'SUBSURF')
sub.subdivision_type = 'CATMULL_CLARK'
sub.levels = 2
sub.render_levels = 2
while mesh.modifiers.find(sub.name) > 0:
    bpy.ops.object.modifier_move_up(modifier=sub.name)
for p in mesh.data.polygons:
    p.use_smooth = True
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / ('assets-src/' + TAG + '.blend')))
# Apply subdivision before the armature, interpolating weights in the rest state.
bpy.ops.object.modifier_apply(modifier=sub.name)
for p in mesh.data.polygons:
    p.use_smooth = True
if mesh.data.has_custom_normals:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()
bpy.ops.export_scene.gltf(filepath=str(ROOT / ('public/assets/' + TAG + '.glb')), export_format='GLB', export_animations=False, export_apply=False)
report = {'base': 'MIT immersive-web/webxr-input-profiles generic-hand/right.glb', 'vertices': len(mesh.data.vertices), 'faces': len(mesh.data.polygons), 'wristBoundaryEdges': len(edges), 'editableSource': 'assets-src/' + TAG + '.blend', 'forearmExtensionMetres': .18 if LONG_ARM else .055}
(ROOT / ('assets-src/hand-long-report.json' if LONG_ARM else 'assets-src/hand-report.json')).write_text(json.dumps(report, indent=2) + '\n')
print('HAND_REPORT', json.dumps(report))
