"""CC BY-SA 4.0 glove derivative of Elena FF's anatomical hand.

The human source GLB/Blender file is never overwritten. A closed voxel union
removes overlapping nail layers and the hard material-boundary silhouette;
weights are transferred from the original rest surface onto this fixed mesh.
Run: blender -b --python assets-src/create_green_glove_v5.py
"""
import bpy, bmesh, hashlib, json, math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets-src/hand-anatomical-v5.blend'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
source=next(o for o in bpy.context.scene.objects if o.type=='MESH')
source.name='Original anatomical weight-transfer surface / not exported'
for modifier in list(source.modifiers):
    source.modifiers.remove(modifier)
source.hide_render=True
source.hide_set(True)

glove=bpy.data.objects.new('Green_Glove_V5',source.data.copy())
bpy.context.collection.objects.link(glove)
glove.matrix_world=source.matrix_world.copy()
for group in source.vertex_groups:
    glove.vertex_groups.new(name=group.name)
bpy.context.view_layer.objects.active=glove
bpy.ops.object.select_all(action='DESELECT')
glove.select_set(True)

# Cap only the distant open forearm end before voxel remeshing. It is outside
# every audited composition. The source hand mesh remains untouched.
bm=bmesh.new();bm.from_mesh(glove.data)
boundary=[e for e in bm.edges if e.is_boundary]
if boundary:
    bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(glove.data);bm.free();glove.data.update()

# Inflate in rest-space before the union. This gives the latex glove its own
# shell volume and joins layered nail/skin surfaces instead of displacing two
# coincident surfaces independently in the runtime shader.
for vertex in glove.data.vertices:
    t=max(0,min(1,(vertex.co.z-.012)/.055))
    amount=.00085*(1-t)+.00025*t
    vertex.co+=vertex.normal*amount
glove.data.update()

voxel=glove.modifiers.new('Closed continuous glove union','REMESH')
voxel.mode='VOXEL';voxel.voxel_size=.00070;voxel.adaptivity=.12
voxel.use_smooth_shade=True
bpy.ops.object.modifier_apply(modifier=voxel.name)

smooth=glove.modifiers.new('Remove nail grooves / retain finger silhouette','SMOOTH')
smooth.factor=.66;smooth.iterations=5
bpy.ops.object.modifier_apply(modifier=smooth.name)

triangles=sum(max(0,len(p.vertices)-2) for p in glove.data.polygons)
if triangles>88000:
    decimate=glove.modifiers.new('Runtime triangle budget','DECIMATE')
    decimate.ratio=88000/triangles
    bpy.ops.object.modifier_apply(modifier=decimate.name)

# Layout creation is explicit so Blender transfers matching named groups.
for group in source.vertex_groups:
    if not glove.vertex_groups.get(group.name):glove.vertex_groups.new(name=group.name)
transfer=glove.modifiers.new('Original anatomical skin weights','DATA_TRANSFER')
transfer.object=source;transfer.use_vert_data=True
transfer.data_types_verts={'VGROUP_WEIGHTS'}
transfer.vert_mapping='POLYINTERP_NEAREST'
transfer.layers_vgroup_select_src='ALL';transfer.layers_vgroup_select_dst='NAME'
transfer.mix_mode='REPLACE';transfer.mix_factor=1
bpy.ops.object.modifier_apply(modifier=transfer.name)

# glTF's four weighted influences are normalized before export.
missing=0;weight_error=0
for vertex in glove.data.vertices:
    weights=sorted([(g.group,g.weight) for g in vertex.groups if g.weight>1e-7],key=lambda p:p[1],reverse=True)[:4]
    if not weights:
        missing+=1;weights=[(glove.vertex_groups['forearm-bend' if vertex.co.z>.02 else 'wrist'].index,1)]
    total=sum(w for _,w in weights)
    for group in list(vertex.groups):glove.vertex_groups[group.group].remove([vertex.index])
    for index,weight in weights:glove.vertex_groups[index].add([vertex.index],weight/total,'REPLACE')
    weight_error=max(weight_error,abs(sum(g.weight for g in vertex.groups)-1))

for layer in list(glove.data.uv_layers):glove.data.uv_layers.remove(layer)
glove.data.materials.clear()
material=bpy.data.materials.new('Green glove / original latex shading supplied by runtime')
material.diffuse_color=(.08,.42,.025,1)
material.use_nodes=True
principled=material.node_tree.nodes.get('Principled BSDF')
principled.inputs['Base Color'].default_value=(.08,.42,.025,1)
principled.inputs['Roughness'].default_value=.34
glove.data.materials.append(material)
for face in glove.data.polygons:
    face.material_index=0;face.use_smooth=True
if glove.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
armature=glove.modifiers.new('Canonical continuous skinning','ARMATURE');armature.object=rig
glove.parent=rig
for obj in [rig,glove]:
    obj['anatomicalV5']=True;obj['gloveV5']=True
    obj['license']='CC-BY-SA-4.0';obj['author']='Elena FF'
    obj['source']='https://sketchfab.com/3d-models/rigged-hand-eae97cc2a742413cb5338ab942b12c1e'
    obj['modifications']='Independent closed voxel-union glove, rest-space shell and transferred canonical skin weights'

# Keep the weight source in the editable project, but export only the glove.
blend=ROOT/'assets-src/green-glove-v5.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True);glove.select_set(True)
bpy.context.view_layer.objects.active=glove
output=ROOT/'public/assets/green-glove-v5.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_animations=False,export_apply=False,export_extras=True)

bm=bmesh.new();bm.from_mesh(glove.data)
boundary_count=sum(e.is_boundary for e in bm.edges)
nonmanifold=sum(not e.is_manifold for e in bm.edges)
bm.free()
report={
    'source':'Elena FF / Rigged hand', 'license':'CC-BY-SA-4.0',
    'sourceBlend':'assets-src/hand-anatomical-v5.blend',
    'asset':'public/assets/green-glove-v5.glb','editable':'assets-src/green-glove-v5.blend',
    'generator':'assets-src/create_green_glove_v5.py',
    'vertices':len(glove.data.vertices),'triangles':sum(max(0,len(p.vertices)-2) for p in glove.data.polygons),
    'boneCount':len(rig.data.bones),'voxelSizeMetres':.00070,
    'boundaryEdges':boundary_count,'nonManifoldEdges':nonmanifold,
    'unweightedVerticesRecovered':missing,'maxWeightSumError':weight_error,
    'runtimeVertexOffsetRequired':False,
    'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),
    'humanAssetUnchanged':True,
}
(ROOT/'assets-src/green-glove-v5-report.json').write_text(json.dumps(report,indent=2)+'\n')
print('GREEN_GLOVE_REPORT',json.dumps(report))
