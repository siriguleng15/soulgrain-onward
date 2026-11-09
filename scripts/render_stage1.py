import bpy,json
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1];bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(R/'output/SOULGRAIN-V5.2-stage1-no-laces.glb'),import_pack_images=True)
for o in bpy.data.objects:
 if 'OLD_TONGUE_REFERENCE_ONLY' in o.name:o.hide_render=True
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True;s.render.threads_mode='FIXED';s.render.threads=8;s.render.resolution_x=1500;s.render.resolution_y=1100;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX';s.view_settings.exposure=-.45;w=bpy.data.worlds.new('Studio');w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(.16,.19,.25,1);w.node_tree.nodes['Background'].inputs['Strength'].default_value=.7;s.world=w
for loc,power,size in [((-1,-2,3),620,3),((2,1,2),450,2),((0,2,.5),350,2)]:
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Softbox',d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Camera');d.type='ORTHO';cam=bpy.data.objects.new('Camera',d);s.collection.objects.link(cam);s.camera=cam
for name,target,offset,scale in [('quarter',(0,0,0),(-3.8,-5.7,3.1),2.27),('front',(-.20,0,.05),(-4,0,1.8),1.65),('opening',(-.23,0,.03),(-.5,0,4),1.40),('opposite',(0,0,0),(-3.8,5.7,3.1),2.27)]:
 target=Vector(target);cam.location=target+Vector(offset);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();d.ortho_scale=scale;s.render.filepath=str(R/'images'/f'stage1-{name}.png');bpy.ops.render.render(write_still=True)
