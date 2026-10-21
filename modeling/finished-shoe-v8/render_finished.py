"""Render the saved finished model for visual QA; never saves over the blend."""
import bpy,sys,math
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parent;R=P.parents[1]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
quick='--quick' in args
bpy.ops.wm.open_mainfile(filepath=str(P/'soulgrain_onward_finished_v8.blend'))
models=[o for o in bpy.context.scene.objects if o.type=='MESH']
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=20 if quick else 48;s.cycles.use_denoising=True;s.cycles.max_bounces=5
s.render.resolution_x=1100 if quick else 1536;s.render.resolution_y=820 if quick else 1152;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
s.world=bpy.data.worlds.new('Finished shoe studio');s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.65,.67,.72,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.2
target=Vector((0,.0065,.065))
for label,loc,power,size in [('Key',(-.22,-.35,.46),6,.4),('Fill',(-.07,.35,.25),3,.4),('Rim',(.3,-.04,.32),4,.3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=label;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(target-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=3,location=(0,0,-.0225));floor=bpy.context.object
m=bpy.data.materials.new('QA white');m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.8,.8,.8,1);m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.85;floor.data.materials.append(m)
bpy.ops.object.camera_add();cam=bpy.context.object;s.camera=cam;cam.data.type='ORTHO';cam.data.clip_start=.001;cam.data.clip_end=100
views=[('side',(0,-1,.035)),('three-quarter',(-.82,-1,.45)),('rear',(.95,-.3,.18)),('top',(-.2,-.3,1))]
dest=R/'previews/v8-finished-reference';dest.mkdir(parents=True,exist_ok=True)
for mode,value in [('folded',0),('upright',1)]:
 for o in models:
  if o.data.shape_keys:o.data.shape_keys.key_blocks['Shaft_Upright'].value=value
 bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();pts=[]
 for o in models:
  e=o.evaluated_get(dg);mesh=e.to_mesh();pts.extend(o.matrix_world@v.co for v in mesh.vertices);e.to_mesh_clear()
 lo=Vector([min(p[i] for p in pts) for i in range(3)]);hi=Vector([max(p[i] for p in pts) for i in range(3)]);center=(lo+hi)/2
 for name,d in views:
  key=mode+'-'+name
  targets=[a for a in args if not a.startswith('--')]
  if targets and key not in targets:continue
  cam.location=center+Vector(d).normalized()*.8;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
  rot=cam.rotation_euler.to_matrix().transposed();ps=[rot@(p-center) for p in pts]
  w=max(p.x for p in ps)-min(p.x for p in ps);h=max(p.y for p in ps)-min(p.y for p in ps)
  cam.data.ortho_scale=max(w,h*s.render.resolution_x/s.render.resolution_y)*1.16
  s.render.filepath=str(dest/(key+'.png'));bpy.ops.render.render(write_still=True);print('VIEW_READY',key,flush=True)
