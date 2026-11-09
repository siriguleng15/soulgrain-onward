import bpy,sys,json
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[1];kind=sys.argv[sys.argv.index('--')+1];src=R/('data/V4-debug-reference.glb' if kind=='V4' else 'output/SOULGRAIN-V5.1-tongue-structure-test.glb')
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(src),import_pack_images=True)
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True;s.render.threads_mode='FIXED';s.render.threads=8;s.render.resolution_x=1500;s.render.resolution_y=1100;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX';s.view_settings.exposure=-.45
w=bpy.data.worlds.new('Matched comparison studio');w.use_nodes=True;w.node_tree.nodes['Background'].inputs['Color'].default_value=(.16,.19,.25,1);w.node_tree.nodes['Background'].inputs['Strength'].default_value=.7;s.world=w
for loc,power,size in [((-1,-2,3),620,3),((2,1,2),450,2),((0,2,.5),340,2)]:
 d=bpy.data.lights.new('Softbox','AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new('Softbox',d);s.collection.objects.link(o);o.location=loc;o.rotation_euler=(-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Matched camera');d.type='ORTHO';cam=bpy.data.objects.new('Matched camera',d);s.collection.objects.link(cam);s.camera=cam
meshes=[o for o in bpy.data.objects if o.type=='MESH'];tongue=[o for o in meshes if ('TONGUE_REFERENCE_PATCH' in o.name if kind=='V4' else 'GEO_TONGUE_CONTINUOUS' in o.name)];laces=[o for o in meshes if 'DEBUG_LACES' in o.name];assert len(tongue)==1,(kind,[o.name for o in meshes]);cloth=tongue[0]
def raw(v):return Vector((v[0],-v[2],v[1]))
views={'quarter':((0,0,-.01),(-3.8,-5.7,3.1),2.27),'front':((-.19,.13,0),(-2.07,2.025,-.789),1.36),'back':((-.20,.13,0),(2.07,-2.025,.789),1.36),'side':((-.21,.13,0),(0,.14,5.7),1.36),'leg':((-.22,.08,0),(-2.3,2.3,2.5),1.36),'under-laces':((-.25,.08,0),(-2.8,2.6,2.6),1.65)}
logs=[]
def render(label,view):
 target,offset,scale=views[view]
 if view=='quarter':target=Vector(target);offset=Vector(offset)
 else:target=raw(target);offset=raw(offset)
 cam.location=target+offset;cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();d.ortho_scale=scale;s.render.filepath=str(R/'images'/f'{kind}-{label}.png');bpy.ops.render.render(write_still=True);logs.append({'file':f'{kind}-{label}.png','camera':view,'source':str(src),'sameLighting':True,'geometryHidden':[o.name for o in meshes if o.hide_render]});(R/'reports'/f'render-{kind}.json').write_text(json.dumps(logs,indent=2))
quick='--quick' in sys.argv
if not quick:render('assembled','quarter');render('tongue-front-in-shoe','front')
for o in laces:o.hide_render=True
if not quick:render('laces-hidden','under-laces')
for o in meshes:o.hide_render=o not in tongue
if not quick:render('isolated-front','front')
render('isolated-back','back');render('isolated-side-thickness','side')
if kind=='V51' and not quick:
 cloth.location=Vector((0,-.8,.18))
 for o in meshes:o.hide_render=False
 render('exploded','quarter');cloth.location=Vector((0,0,0));render('restored','quarter')
print('Comparison renders complete',kind,flush=True)
