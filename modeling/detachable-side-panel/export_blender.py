"""Editable pattern-driven side panel, rest shoe and continuous shape-key clip.

Input paper/model data remain read-only. glTF units are display/source units,
not independently calibrated physical metres or millimetres.
  blender -b -t 4 --python modeling/detachable-side-panel/export_blender.py
"""
from pathlib import Path
import bpy, json, math, hashlib, sys, importlib.util, faulthandler
faulthandler.dump_traceback_later(45,repeat=True)
import numpy as np
from mathutils import Vector, Quaternion
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/detachable-side-panel';OUT.mkdir(parents=True,exist_ok=True)
DATA=OUT/'panel-data.json'
panel_data_sha256=hashlib.sha256(DATA.read_bytes()).hexdigest()
d=json.loads(DATA.read_text());source=ROOT/'public/reference-model-v10/corrected.glb'
assert hashlib.sha256(source.read_bytes()).hexdigest()==d['source']['correctedModelSha256']
frames=sorted(d['unfoldSamples'],key=lambda f:f['formedAmount'])
formed=np.asarray(d['formedPositions'],dtype=float).reshape(-1,3)
flat=np.asarray(d['flatMm'],dtype=float).reshape(-1,2)
indices=np.asarray(d['trimmedIndices'],dtype=int).reshape(-1,3)
assert len(formed)==len(flat)==len(d['vertexIds'])
assert frames[0]['formedAmount']==0 and frames[-1]['formedAmount']==1

def bpy_points(v):
    a=np.asarray(v,dtype=float).reshape(-1,3)
    return np.c_[a[:,0],-a[:,2],a[:,1]]

def object_mesh(name,p,f):
    m=bpy.data.meshes.new(name+'_Mesh');m.from_pydata(p,[],f);m.update()
    o=bpy.data.objects.new(name,m);bpy.context.scene.collection.objects.link(o)
    for poly in m.polygons:poly.use_smooth=True
    return o

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source),merge_vertices=False)
source_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
# Verify the retained original triangle order before using any removal mask.
spec=importlib.util.spec_from_file_location('source_glb_audit',ROOT/'modeling/reference-model-v10/build_bridge.py')
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
_,doc,binary=audit.read_glb(source);parts=audit.primitives(doc,binary)
replacement=d.get('replacementMask',{})
if isinstance(replacement,list):replacement={k:item['removedTriangles'] for item in replacement for k in [item['meshPath'],item['meshName']]}
removal_report=[]
for part in parts:
    obj=bpy.data.objects.get(part['name'])
    if obj is None:raise RuntimeError('Missing imported original object '+part['name'])
    mask=replacement.get(part['meshPath'],replacement.get(part['name'],[]))
    original=list(obj.data.polygons)
    assert len(original)==len(part['indices']),('triangle order count',obj.name,len(original),len(part['indices']))
    for ti in np.linspace(0,len(original)-1,min(25,len(original)),dtype=int):
        actual=np.array([(obj.matrix_world@obj.data.vertices[j].co)[:]for j in original[ti].vertices])
        expected=bpy_points(part['positions'][part['indices'][ti]])
        # Verify geometric triangle identity independently of imported vertex IDs.
        assert np.linalg.norm(actual.mean(axis=0)-expected.mean(axis=0))<2e-5,('triangle order mismatch',obj.name,int(ti))
    if mask:
        drop=set(mask);vertices=[v.co[:]for v in obj.data.vertices]
        faces=[list(poly.vertices)for i,poly in enumerate(original)if i not in drop]
        mats=list(obj.data.materials)
        mesh=bpy.data.meshes.new(obj.name+'_Retained_After_Side_Separation');mesh.from_pydata(vertices,[],faces);mesh.update()
        for m in mats:mesh.materials.append(m)
        for p in mesh.polygons:p.use_smooth=True
        obj.data=mesh
    for m in obj.data.materials:
        if m:m.use_backface_culling=True
    obj['source_model_sha256']=d['source']['correctedModelSha256']
    obj['role']='rest-shoe-after-side-panel-replacement'
    removal_report.append({'name':obj.name,'sourceTriangles':len(original),'removedTriangles':len(mask),'retainedTriangles':len(obj.data.polygons)})

panel=object_mesh('ONWARD_Detachable_Real_Pattern_Side',bpy_points(formed).tolist(),indices.tolist())
mat=bpy.data.materials.new('Pattern_Side_Study_Navy');mat.use_nodes=True
bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.035,.11,.20,1);bs.inputs['Roughness'].default_value=.72
panel.data.materials.append(mat)
for name,values in [('_PAPER_VERTEX_INDEX',np.arange(len(flat),dtype=np.float32)),('_PAPER_X_MM',flat[:,0]),('_PAPER_Y_MM',flat[:,1])]:
    attr=panel.data.attributes.new(name=name,type='FLOAT',domain='POINT')
    attr.data.foreach_set('value',np.asarray(values,dtype=np.float32))
panel['paper_attribute_note']='Exported _PAPER_VERTEX_INDEX resolves split GLB vertices back to panel-data.json; _PAPER_X_MM and _PAPER_Y_MM are immutable flat references, not physical model scale.'
panel['role']='independent-real-pattern-driven-shoe-side'
panel['panel_data_sha256']=panel_data_sha256
panel['source_paper_sha256']=d['source']['paperProjectSha256']
panel['identity_note']='Full immutable paper IDs and clipped-edge barycentric provenance are stored in the included panel-data.json text block.'
panel['physical_note']='Flat endpoint is exact against the digitised paper. Attached fit and sole coverage are hypotheses, not verified sewing/lasting.'
hardware=[]
hardware_path=OUT/'hardware-data.json'
if hardware_path.exists():
    hardware_data=json.loads(hardware_path.read_text())
    assert hardware_data['sourceModelSha256']==d['source']['correctedModelSha256']
    for piece in hardware_data['pieces']:
        xyz=bpy_points(piece['positions']);faces=np.arange(len(xyz)).reshape(-1,3).tolist()
        obj=object_mesh(piece['name'],xyz.tolist(),faces)
        obj.location=Vector(bpy_points(piece['pivot'])[0]);obj.rotation_mode='QUATERNION'
        material=bpy.data.materials.new(piece['name']+'_Original_Patch');material.use_nodes=True
        shader=material.node_tree.nodes['Principled BSDF'];shader.inputs['Base Color'].default_value=(*piece['color'],1);shader.inputs['Roughness'].default_value=piece['roughness'];shader.inputs['Metallic'].default_value=piece['metalness'];obj.data.materials.append(material)
        obj['role']='original-source-connector-patch-separated-before-cloth'
        hardware.append((obj,piece))
print('BASE_GEOMETRY_READY',flush=True)
base=panel.shape_key_add(name='Attached_Basis',from_mix=False)
keys=[]
for i,pose in enumerate(frames[:-1]):
    key=panel.shape_key_add(name='Unfold_f'+format(pose['formedAmount'],'.4f'),from_mix=False)
    key.data.foreach_set('co',bpy_points(pose['positions']).astype(np.float32).ravel())
    keys.append(key)

print('MORPH_KEYS_READY',len(keys),flush=True)

def smooth(t):
    t=max(0,min(1,t));return t*t*(3-2*t)
scene=bpy.context.scene;scene.render.fps=24;scene.frame_start=1;scene.frame_end=289
# Bulk layered-action FCurves avoid repeatedly evaluating a dense scene while
# authoring thousands of shape-key samples. Sampling still matches the viewer.
T=scene.frame_end-scene.frame_start+1
shape_values=np.zeros((T,len(keys)));locations=np.zeros((T,3))
hardware_values={o.name:{'location':np.zeros((T,3)),'rotation_quaternion':np.zeros((T,4)),'scale':np.zeros((T,3))}for o,_ in hardware}
for frame in range(scene.frame_start,scene.frame_end+1):
    row=frame-scene.frame_start;p=row/(T-1);f=1-smooth((p-.28)/.52)
    low=0
    while low<len(frames)-2 and frames[low+1]['formedAmount']<f:low+=1
    a,b=frames[low],frames[low+1];t=max(0,min(1,(f-a['formedAmount'])/max(1e-12,b['formedAmount']-a['formedAmount'])))
    for i in range(len(keys)):shape_values[row,i]=(1-t if i==low else t if i==low+1 else 0)
    spread=smooth((p-.23)/.57);lift=smooth(p/.24)
    locations[row]=[spread*1.85,-(lift*.43+spread*.08),spread*.03]
    release=smooth((p-.035)/.115);away=smooth((p-.13)/.11)
    for obj,piece in hardware:
        pivot=bpy_points(piece['pivot'])[0];axis=Vector(bpy_points(piece['axis'])[0])
        values=hardware_values[obj.name]
        values['rotation_quaternion'][row]=list(Quaternion(axis,piece['sign']*release*.5))
        values['location'][row]=pivot+[0,-(release*.055+away*.32),away*.27]
        values['scale'][row]=1-away

def curves(target,id_type,channels,name):
    target.animation_data_create();action=bpy.data.actions.new(name)
    slot=action.slots.new(id_type=id_type,name=name);layer=action.layers.new('Continuous source-identity animation')
    strip=layer.strips.new(type='KEYFRAME');bag=strip.channelbag(slot,ensure=True)
    target.animation_data.action=action;target.animation_data.action_slot=slot
    times=np.arange(scene.frame_start,scene.frame_end+1,dtype=float)
    for data_path,index,values in channels:
        fc=bag.fcurves.new(data_path,index=index);fc.keyframe_points.add(T)
        fc.keyframe_points.foreach_set('co',np.c_[times,values].ravel())
        for point in fc.keyframe_points:point.interpolation='LINEAR'
        fc.update()
curves(panel.data.shape_keys,'KEY',[(key.path_from_id('value'),0,shape_values[:,i])for i,key in enumerate(keys)],'ONWARD_Same_Panel_Unfold')
curves(panel,'OBJECT',[('location',axis,locations[:,axis])for axis in range(3)],'ONWARD_Panel_Separation')
for obj,_ in hardware:
    channels=[(path,axis,values[:,axis])for path,values in hardware_values[obj.name].items()for axis in range(values.shape[1])]
    curves(obj,'OBJECT',channels,obj.name+'_Release')
print('BULK_CURVES_READY',flush=True)
scene.frame_set(1)

# All source data and assumptions travel inside the editable project.
text=bpy.data.texts.load(str(DATA));text.name='panel-data.json'
readme=bpy.data.texts.new('READ-ME.txt');readme.write('ONWARD detachable side study. Original paper millimetres are immutable. The blue panel replaces the indicated AI shoe-side triangles and uses the same mesh for attachment, separation, unfolding and flat comparison. Bottom sole-covered band is an explicit assumption. Scene frames 1..289 contain the continuous clip. Nothing here proves recovered factory sewing, physical scale or contact mechanics. See panel-data.json and validation reports.\n')
scene['panel_data_sha256']=panel_data_sha256
scene['source_model_sha256']=d['source']['correctedModelSha256']
scene['paper_project_sha256']=d['source']['paperProjectSha256']
scene['units_note']='Display/source model units. Real-paper rest coordinates are recorded separately in millimetres; no physical shoe scale is asserted.'
print('EMBEDDED_SOURCE_READY',flush=True)
# Review camera and lights are editable and are not added to the GLB export.
center=Vector((.8,0,.15));camera_data=bpy.data.cameras.new('Side_Unfold_Review_Camera');camera_data.type='ORTHO';camera_data.ortho_scale=4.9
camera=bpy.data.objects.new(camera_data.name,camera_data);scene.collection.objects.link(camera);camera.location=center+Vector((-.1,-8,2));camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler();scene.camera=camera
for name,offset,power,size in [('Key',(-2,-3,4),400,4),('Fill',(3,-1,2),200,3)]:
    ld=bpy.data.lights.new(name,'AREA');ld.energy=power;ld.size=size;o=bpy.data.objects.new(name,ld);scene.collection.objects.link(o);o.location=center+Vector(offset);o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
for o in scene.objects:o.select_set(False)
for o,_ in hardware:o.hide_render=True;o.hide_set(True)
export_hardware='--with-reference-connectors' in sys.argv
for o in source_objects+[panel]+([o for o,_ in hardware] if export_hardware else []):o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=panel
print('EXPORT_BEGIN',flush=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'detachable-side.glb'),export_format='GLB',use_selection=True,export_extras=True,export_attributes=True,export_texcoords=False,export_normals=True,export_materials='EXPORT',export_animations=True,export_animation_mode='SCENE',export_force_sampling=True,export_morph=True,export_morph_normal=True,export_morph_animation=True)
print('GLB_WRITTEN',flush=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'detachable-side-editable.blend'),compress=True)
report={'panelDataSha256':panel_data_sha256,'sourceModelSha256':d['source']['correctedModelSha256'],'paperProjectSha256':d['source']['paperProjectSha256'],'panelVertices':len(formed),'panelTriangles':len(indices),'shapeKeyPoseCount':len(keys)+1,'originalConnectorPieces':len(hardware),'connectorsIncludedInGlb':export_hardware,'animationFrames':289,'fps':24,'restShoe':removal_report,'productionReady':False,'files':{name:{'bytes':(OUT/name).stat().st_size,'sha256':hashlib.sha256((OUT/name).read_bytes()).hexdigest()}for name in ['detachable-side.glb','detachable-side-editable.blend']}}
(OUT/'editable-export-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('EDITABLE_EXPORT',json.dumps(report),flush=True)
