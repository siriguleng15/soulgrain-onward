"""Comparable actual geometry renders; no image substitution or model saving."""
from pathlib import Path
import bpy, sys
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/reference-model-v10/verification'
OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'public/reference-model-v10/onward-model-v10-editable.blend'))
scene=bpy.context.scene
source=bpy.data.objects['Uploaded_Xiezitu_Original_HQ']
corrected=bpy.data.objects['ONWARD_Corrected_HighResolution']
cap=bpy.data.objects.get('Tongue_Original_Position_Snap_Cap')
models=[source,corrected]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1050;scene.render.resolution_percentage=100
scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.7,.72,.75,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.55
for obj in [o for o in scene.objects if o.type=='MESH']:
    obj.hide_render=True
pts=[o.matrix_world@Vector(p) for o in models for p in o.bound_box]
low=Vector([min(p[i] for p in pts) for i in range(3)]);high=Vector([max(p[i] for p in pts) for i in range(3)]);center=(low+high)*.5
for name,offset,energy,size in [('Key',(-2,-3,4),450,4),('Fill',(2,3,2),300,4),('Rim',(2,-1,3),180,2)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=center+Vector(offset);obj.rotation_euler=(center-obj.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('ReviewCamera');data.type='ORTHO';camera=bpy.data.objects.new('ReviewCamera',data);scene.collection.objects.link(camera);scene.camera=camera
for view,direction in [('top',(0,0,1)),('side',(0,-1,.12)),('quarter',(-.9,-1,.65))]:
    camera.location=center+Vector(direction).normalized()*5
    camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    rot=camera.rotation_euler.to_matrix().transposed();projected=[rot@(p-center) for p in pts]
    width=max(p.x for p in projected)-min(p.x for p in projected);height=max(p.y for p in projected)-min(p.y for p in projected)
    data.ortho_scale=max(width,height*1400/1050)*1.12
    for name,obj in [('source',source),('corrected',corrected)]:
        if '--corrected-only' in args and name=='source':continue
        source.hide_render=True;corrected.hide_render=True;obj.hide_render=False
        if cap:cap.hide_render=(name!='corrected')
        scene.render.filepath=str(OUT/(name+'-'+view+'.png'))
        bpy.ops.render.render(write_still=True)
        print('RENDER',name,view,flush=True)
