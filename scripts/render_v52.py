import bpy,sys,json,hashlib
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1];isv4='--v4' in sys.argv;prefix='V4' if isv4 else 'V52';src=Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb') if isv4 else R/'output/SOULGRAIN-V5.2-no-laces-two-panel-tongue.glb';sourcehash=hashlib.sha256(src.read_bytes()).hexdigest();bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(src),import_pack_images=True);s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True;s.render.threads_mode='FIXED';s.render.threads=8;s.render.resolution_x=1500;s.render.resolution_y=1100;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX';s.view_settings.exposure=-.45;world=bpy.data.worlds.new('Matched studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(.16,.19,.25,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7;s.world=world
for loc,power,size in [((-1,-2,3),620,3),((2,1,2),450,2),((0,2,.5),350,2)]:
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Softbox',d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Matched camera');d.type='ORTHO';cam=bpy.data.objects.new('Matched camera',d);s.collection.objects.link(cam);s.camera=cam
meshes=[o for o in bpy.data.objects if o.type=='MESH'];front=[o for o in meshes if 'PNL_FRONT' in o.name];back=[o for o in meshes if 'PNL_BACK' in o.name];tongue=[o for o in meshes if any(k in o.name for k in ['PNL_FRONT','PNL_BACK','GEO_TONGUE_THICKNESS','GEO_TONGUE_SILVER','DEC_CONTINUOUS'])];assert isv4 or (front and back)
views={'quarter':((0,0,0),(-3.8,-5.7,3.1),2.27),'front':((-.20,0,.05),(-4,0,1.8),1.65),'opening':((-.23,0,.03),(-.5,0,4),1.40),'side':((-.2,0,.05),(0,-4,.1),1.75),'isolated':((-.20,0,.02),(-2.3,-3.8,4),1.9),'cloth-front':((-.19,0,.28),(-2.5,.0,2.4),1.05),'seam':((.12,0,.27),(0,-3,.35),.64),'opposite':((0,0,0),(-3.8,5.7,3.1),2.27)};log=[]
def render(label,v):
 target,offset,scale=views[v];target=Vector(target);cam.location=target+Vector(offset);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();d.ortho_scale=scale;s.render.filepath=str(R/'images'/f'{prefix}-{label}.png');bpy.ops.render.render(write_still=True);log.append({'file':f'{prefix}-{label}.png','sourceSHA256':sourcehash,'camera':v,'hidden':[o.name for o in meshes if o.hide_render]});(R/f'reports/render-{prefix}.json').write_text(json.dumps(log,indent=2))
if '--quick' in sys.argv:
 s.cycles.samples=8;s.render.resolution_percentage=65;render('quick-quarter','quarter');render('quick-opening','opening');sys.exit(0)
for name in ['quarter','front','opening','opposite']:render(name,name)
if isv4:sys.exit(0)
for o in tongue:o.hide_render=o not in front
render('flat-front-panel-on-shoe','opening')
for o in meshes:o.hide_render=o not in tongue
render('isolated-whole','isolated');render('side-thickness','side');render('isolated-back','opposite');render('sewn-connection','seam')
for o in meshes:o.hide_render=False
for o in tongue:o.location.y-=.70;o.location.z+=.20
render('exploded','quarter')
for o in tongue:o.location.y+=.70;o.location.z-=.20
render('restored','quarter')
for o in meshes:o.hide_render=o not in tongue
for o in tongue:o.hide_render=o not in back and not('GEO_TONGUE_SILVER' in o.name or 'DEC_CONTINUOUS' in o.name)
render('back-panel-two-holes','cloth-front')
for o in tongue:o.hide_render=o not in front
render('front-fan-panel-only','isolated')
print('Final views rendered',flush=True)
