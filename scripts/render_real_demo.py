import bpy,sys,json,importlib.util,numpy as np
from pathlib import Path
from mathutils import Vector
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');spec=importlib.util.spec_from_file_location('studio_render',R/'delivery/soulgrain_repair_studio_v3.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register();bpy.ops.wm.open_mainfile(filepath=str(R/'delivery/Soulgrain_REPAIR_STUDIO_V3_DEMO.blend'),load_ui=False,use_scripts=False);data=a.sr3_guard();orig=bpy.context.scene;scene=bpy.data.scenes.new('DIAGNOSTIC_RENDER_ONLY');bpy.context.window.scene=scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.render.resolution_x=1280;scene.render.resolution_y=960;scene.world=bpy.data.worlds.new('RenderWorld');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6
# Mesh copies preserve exact original coordinates and triangle connectivity;
# only their diagnostic material changes in this unsaved render-only scene.
def mat(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1);m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.75;return m
base=mat('DIAG_SOURCE',(.24,.32,.40));unknown=mat('DIAG_UNKNOWN',(.52,.12,.33));orange=mat('DIAG_PENDING',(.98,.29,.035));copies={}
for obj in orig.objects:
 if obj.type!='MESH' or obj.get('sr3_role') in ['GUIDE','SELECTOR']:continue
 clone=obj.copy();clone.data=obj.data.copy();clone.parent=None;clone.matrix_world=obj.matrix_world.copy();scene.collection.objects.link(clone);clone.hide_set(False);clone.hide_render=False;clone.data.materials.clear();clone.data.materials.append(orange if obj.get('sr3_role')=='PREVIEW' else base)
 if obj.get('_sgo_object_id'):
  clone.data.materials.append(unknown);pp=a.array(obj.data.attributes[a.P].data,'value');clone.data.polygons.foreach_set('material_index',(pp==0).astype('i4'))
 copies[obj.name]=clone
for loc,power in [((1,-3,3),450),((2,3,2),350)]:
 obj=bpy.data.objects.new('Light',bpy.data.lights.new('Light','AREA'));scene.collection.objects.link(obj);obj.location=loc;obj.data.energy=power;obj.data.size=3;obj.rotation_euler=(-obj.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.objects.new('Camera',bpy.data.cameras.new('Camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO'
previews={key:copies[next(o.name for o in orig.objects if o.get('sr3_object_uuid')==data['tasks'][value]['active_preview'])] for key,value in data['demo_tasks'].items()}
for key in ['rear','cap']:
 patch=previews[key];v=a.array(patch.data.vertices,'co',3,'f4');center=v.mean(0);scale=max(float(np.ptp(v,axis=0).max())*2.0,.065);delta=np.asarray(data['tasks'][data['demo_tasks'][key]]['normal'])+np.array([.16,0,.15]) if key=='rear' else np.array([-1,-.6,.22]);cam.location=Vector(center+delta);cam.rotation_euler=(Vector(center)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
 for phase in ['before','preview']:
  for name,o in copies.items():o.hide_render=o==previews['rear'] or o==previews['cap']
  patch.hide_render=phase=='before';scene.render.filepath=str(R/'renders'/f'{key}_{phase}.png');bpy.ops.render.render(write_still=True)
for o in previews.values():o.hide_render=False
cam.location=(2.1,-3,1.3);cam.rotation_euler=(Vector((-.05,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=2.25;scene.render.filepath=str(R/'renders/whole_real_model_candidates.png');bpy.ops.render.render(write_still=True)
print('REAL_MODEL_DIAGNOSTIC_RENDERS_PASS',flush=True)
