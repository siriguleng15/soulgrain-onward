"""Rebuild the MIT WebXR hand as a smooth, continuously weighted studio hand.

The wrist of the MIT input is deliberately box shaped. V3 extended that box.
V4 rounds the existing wrist and transitions it into a tapered elliptical arm.
No reference-site mesh, texture, screenshot or extracted geometry is used.

Run: blender -b --python assets-src/refine_hand_v4.py
"""
import bpy
import bmesh
import hashlib
import json
import math
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
TAG = 'hand-studio-v4'
BASE = ROOT / 'public/assets/hand-right.glb'

def ease(t):
    t = min(1.0, max(0.0, t))
    return t * t * (3.0 - 2.0 * t)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(BASE))
mesh = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
armature = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
# Independent wrist-pivoted arm controller. It is a sibling, not a parent, of
# the original wrist, so animating this bone never changes the hand pose.
bpy.context.view_layer.objects.active = armature
armature.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
original_wrist = armature.data.edit_bones['wrist']
arm_bone = armature.data.edit_bones.new('forearm-bend')
arm_bone.head = original_wrist.head.copy()
arm_bone.tail = original_wrist.tail.copy()
arm_bone.roll = original_wrist.roll
bpy.ops.object.mode_set(mode='OBJECT')
armature.select_set(False)
bpy.context.view_layer.objects.active = mesh
mesh.select_set(True)
forearm_group = mesh.vertex_groups.new(name='forearm-bend')

# Work in the untouched input's local rest coordinates: z is arm longitudinal,
# x is palm thickness and y is palm width. The skeleton is not transformed.
bm = bmesh.new()
bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=.000001)
cap_z = max(v.co.z for v in bm.verts)
cut_z = cap_z - .008
bmesh.ops.bisect_plane(
    bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces),
    plane_co=(0, 0, cut_z), plane_no=(0, 0, 1), clear_outer=True,
    dist=.000001,
)
boundary = list({v for e in bm.edges if e.is_boundary for v in e.verts})
# Intersections of the triangulated cap can produce nearly duplicate samples.
bmesh.ops.remove_doubles(bm, verts=boundary, dist=.00022)
edges = [e for e in bm.edges if e.is_boundary]
boundary = list({v for e in edges for v in e.verts})
cx = (min(v.co.x for v in boundary) + max(v.co.x for v in boundary)) * .5
cy = (min(v.co.y for v in boundary) + max(v.co.y for v in boundary)) * .5
half_x = (max(v.co.x for v in boundary) - min(v.co.x for v in boundary)) * .5
half_y = (max(v.co.y for v in boundary) - min(v.co.y for v in boundary)) * .5

# Round the palm-to-wrist surface, beginning behind the metacarpals. This
# removes the original cap's flat x face without touching finger centerlines.
for v in bm.verts:
    t = ease((v.co.z - .034) / (cut_z - .034))
    if t <= 0:
        continue
    dx, dy = v.co.x - cx, v.co.y - cy
    angle = math.atan2(dy / half_y, dx / half_x)
    target_x = cx + .0143 * math.cos(angle)
    target_y = cy + .0268 * math.sin(angle)
    v.co.x += (target_x - v.co.x) * t
    v.co.y += (target_y - v.co.y) * t

angles = [math.atan2((v.co.y - cy) / .0268, (v.co.x - cx) / .0143) for v in boundary]
layer = bm.verts.layers.deform.verify()
wrist = mesh.vertex_groups['wrist']
mapping = dict(zip(boundary, range(len(boundary))))
old = boundary
ring_count = 19
base_arm_length = .245
arm_length = .45
fixed_wrist_rings = 8
fixed_wrist_distance = base_arm_length * fixed_wrist_rings / ring_count
for ring in range(1, ring_count + 1):
    t = ring / ring_count
    # Preserve the complete wrist transition and its first eight arm rings.
    # Only the distal arm is lengthened to continue beyond the camera frame.
    distance = base_arm_length * t if ring <= fixed_wrist_rings else fixed_wrist_distance + (arm_length - fixed_wrist_distance) * (ring - fixed_wrist_rings) / (ring_count - fixed_wrist_rings)
    # Wrist stays narrow; the forearm fills gradually and is never a cone.
    fill = ease(t / .85)
    radius_x = .0143 + .0087 * fill
    radius_y = .0268 + .0138 * fill
    # A subtle anatomical curve prevents a mechanical straight tube.
    shift_x = -.0033 * math.sin(t * math.pi * .7)
    shift_y = -.0028 * ease(t)
    new = []
    for angle in angles:
        n = bm.verts.new((
            cx + shift_x + radius_x * math.cos(angle),
            cy + shift_y + radius_y * math.sin(angle),
            cut_z + distance,
        ))
        n[layer][wrist.index] = 1.0
        new.append(n)
    for edge in edges:
        i, j = [mapping[v] for v in edge.verts]
        bm.faces.new((old[i], old[j], new[j], new[i]))
    old = new
# Keep the wrist end open: it extends outside the camera frame; capping would
# introduce a new high-valence surface that can cause subdivision pinching.
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
for e in bm.edges:
    e.smooth = True
for f in bm.faces:
    f.smooth = True
bm.normal_update()
bm.to_mesh(mesh.data)
bm.free()
mesh.data.update()

# Add glove-like fullness only PERPENDICULAR to each segment. V3 inflated the
# clamped end of the segment too, lengthening fingers and bulging the joints.
groups = {g.index: g.name for g in mesh.vertex_groups}
to_mesh = mesh.matrix_world.inverted() @ armature.matrix_world
heads = {b.name: to_mesh @ b.head_local for b in armature.data.bones}
for vertex in mesh.data.vertices:
    influences = [(a.weight, groups[a.group]) for a in vertex.groups if 'phalanx' in groups[a.group]]
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
    axis = (b - a).normalized()
    perpendicular = vertex.co - a - axis * (vertex.co - a).dot(axis)
    fullness = (.14 if name.startswith('thumb') else .24) * min(1, sum(w for w, _ in influences))
    vertex.co += perpendicular * fullness

# A 45mm continuous skinning transition carries the independent forearm
# rotation through the wrist. Preserve all original finger weights; only the
# wrist's original influence is divided between the two wrist-pivoted bones.
for vertex in mesh.data.vertices:
    blend = ease((vertex.co.z - .045) / .045)
    if blend <= 0:
        continue
    wrist_weight = next((g.weight for g in vertex.groups if g.group == wrist.index), 0.0)
    if wrist_weight <= 0:
        continue
    mesh.vertex_groups['wrist'].add([vertex.index], wrist_weight * (1 - blend), 'REPLACE')
    forearm_group.add([vertex.index], wrist_weight * blend, 'REPLACE')

for polygon in mesh.data.polygons:
    polygon.use_smooth = True
sub = mesh.modifiers.new('Editable studio surface refinement', 'SUBSURF')
sub.subdivision_type = 'CATMULL_CLARK'
sub.levels = 2
sub.render_levels = 2
while mesh.modifiers.find(sub.name) > 0:
    bpy.ops.object.modifier_move_up(modifier=sub.name)

# Save the editable low-resolution cage + rig + live refinement modifier.
blend_path = ROOT / ('assets-src/' + TAG + '.blend')
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
bpy.ops.object.modifier_apply(modifier=sub.name)
for polygon in mesh.data.polygons:
    polygon.use_smooth = True
if mesh.data.has_custom_normals:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()

output = ROOT / ('public/assets/' + TAG + '.glb')
bpy.ops.export_scene.gltf(
    filepath=str(output), export_format='GLB', export_animations=False,
    export_apply=False,
)
report = {
    'base': 'MIT immersive-web/webxr-input-profiles generic-hand/right.glb',
    'baseSHA256': hashlib.sha256(BASE.read_bytes()).hexdigest(),
    'assetSHA256': hashlib.sha256(output.read_bytes()).hexdigest(),
    'asset': 'public/assets/' + TAG + '.glb',
    'editableSource': 'assets-src/' + TAG + '.blend',
    'generator': 'assets-src/refine_hand_v4.py',
    'vertices': len(mesh.data.vertices),
    'faces': len(mesh.data.polygons),
    'bones': [b.name for b in armature.data.bones],
    'restSkeletonChanged': False,
    'additionalController': {
        'bone': 'forearm-bend',
        'parent': None,
        'restMatrix': 'Identical to original wrist; the original 25 bones are unchanged',
        'influence': 'Only original wrist weights, smoothly split over Blender-local z=0.045..0.090 m',
        'pivotBlenderLocal': list(armature.data.bones['forearm-bend'].head_local),
        'recommendedAxis': 'Raw loaded glTF +X BEFORE the runtime model.rotation.y=PI/2. Transform (1,0,0) through inverse forearm.getWorldQuaternion() to bone-local Y. The mirrored green-hand runtime uses -1.42 * defiance radians; original wrist and fingers stay fixed.',
        'boneLocalAxisForRawGLTFX': list((armature.data.bones['forearm-bend'].matrix_local.inverted().to_3x3() @ Vector((1, 0, 0))).normalized()),
    },
    'roundedWristBoundarySamples': len(boundary),
    'forearmRings': ring_count,
    'forearmExtensionMetres': arm_length,
    'unchangedProximalArmRings': fixed_wrist_rings,
    'notes': 'Rounded original rectangular wrist; elliptical taper and continuous wrist skin weights; perpendicular-only finger fullness. Independent derivative, not original-site asset.',
}
(ROOT / 'assets-src/hand-studio-v4-report.json').write_text(json.dumps(report, indent=2) + '\n')
print('HAND_STUDIO_V4', json.dumps(report))
