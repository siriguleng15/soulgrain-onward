"""Blender 4.3: structure-only, photo-informed ONWARD review study.
Run from any directory: blender -b -t 2 --python modeling/v3/build_model.py
No source GLB, website files, texture, logo or brand pattern is modified.
"""
import bpy, bmesh, math, json, hashlib, struct, sys
from pathlib import Path
from mathutils import Vector, Matrix
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'modeling/v3'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'public/assets/soulgrain_onward_template_white_preview.glb'
TARGET = ROOT / 'public/assets/soulgrain_onward_v3_shape_study.glb'
RENDER = OUT / 'previews'
RENDER.mkdir(exist_ok=True)
SOURCE_HASH = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
originals = [o for o in bpy.context.scene.objects if o.type == 'MESH']
# Keep the first shoe in its original metric, Z-up coordinates, without the pair's pose.
body = next(o for o in originals if o.name == 'ONWARD_TEMPLATE_Nuovo.1_0')
laces = next(o for o in originals if o.name == 'LACES_TEMPLATE_Nuovo_0')
for obj in [body, laces]:
    world = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = Matrix.Identity(4)
    for v in obj.data.vertices: v.co = world @ v.co
for obj in list(bpy.context.scene.objects):
    if obj not in [body, laces]: bpy.data.objects.remove(obj, do_unlink=True)
# Decompose the source's existing disconnected surfaces, not arbitrary box cuts.
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
parts = list(bpy.context.selected_objects)
white = bpy.data.materials.new('Untextured neutral white study')
white.diffuse_color = (0.72, 0.72, 0.72, 1)
white.use_nodes = True
bsdf = white.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = (0.72, 0.72, 0.72, 1)
bsdf.inputs['Roughness'].default_value = 0.72

def finish(obj, name):
    obj.name = name
    obj.data.materials.clear(); obj.data.materials.append(white)
    for face in obj.data.polygons: face.use_smooth = True
    return obj

# Source tongue is the uniquely tall disconnected fabric island (347 vertices).
old_tongue = [o for o in parts if max(v.co.z for v in o.data.vertices) > 0.14]
assert len(old_tongue) == 1 and len(old_tongue[0].data.vertices) == 347
bpy.data.objects.remove(old_tongue[0], do_unlink=True)
parts.remove(old_tongue[0])
roles = {0:'RubberToeCap',1:'UpperOuter',3:'UpperInner',4:'Outsole',5:'HeelRubber',6:'HeelSeam',7:'FoxingInner',8:'ToeTrim',9:'LiningInner',10:'HeelSeamInner',11:'CollarBinding',12:'BottomBindingInner',13:'LiningOuter',14:'HeelBinding',15:'HeelDetailA',16:'HeelDetailB',17:'BottomBindingOuter',18:'TopBindingA',19:'TopBindingB',20:'TopBindingC',21:'TopBindingD',22:'TopBindingE',23:'TopBindingRear',24:'FoxingOuter',25:'ToeDetail'}
for obj in parts:
    suffix = obj.name.rsplit('.',1)[-1]
    index = int(suffix) if suffix.isdigit() else 0
    finish(obj, 'L_' + roles[index])
finish(laces, 'L_LacesAndEyelets')
# Preserve all base geometry below the cuff. Source shell remains structurally intact.

def sheet(name, rows, cols, function, thickness):
    verts = [function(i/rows, j/cols) for i in range(rows+1) for j in range(cols+1)]
    faces = [(i*(cols+1)+j,(i+1)*(cols+1)+j,(i+1)*(cols+1)+j+1,i*(cols+1)+j+1) for i in range(rows) for j in range(cols)]
    mesh = bpy.data.meshes.new(name+'Surface'); mesh.from_pydata(verts, [], faces); mesh.update()
    obj = bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    finish(obj,name)
    # Editable cloth midsurface, actual closed thickness in export.
    sub = obj.modifiers.new('Smooth folded cloth curvature','SUBSURF'); sub.levels=1; sub.render_levels=1
    thick = obj.modifiers.new('Physical fabric thickness','SOLIDIFY'); thick.thickness=thickness; thick.offset=0; thick.use_even_offset=True
    bevel = obj.modifiers.new('Soft fabric edge','BEVEL'); bevel.width=0.00045; bevel.segments=2
    obj['construction'] = 'Parametric cloth midsurface, subdivision, closed solid thickness and edge bevel'
    obj['nominal_thickness_m'] = thickness
    return obj

def cuff(v,u):
    theta = -1.95 + 3.90*u
    # Inner rise, 6 mm-radius return fold, then outward/downward drape.
    # The fold radius exceeds the 2.4 mm shell thickness, avoiding offsets
    # crossing themselves at the crown (a sharp cubic apex is unsuitable).
    hem=.069+.012*(math.cos(theta)+1)/2
    if v < .2:
        z=.108+.017*v/.2
        radial=0
    elif v < .6:
        a=(v-.2)/.4*math.pi
        z=.125+.006*math.sin(a)
        radial=.006*(1-math.cos(a))
    else:
        t=(v-.6)/.4
        z=.125+(hem-.125)*t
        radial=.012+.006*t*t
    rx,ry=.052+radial,.038+radial*.75
    # Low amplitude geometry folds; no printed texture or decorative pattern.
    wrinkle=.00035*math.sin(3*theta+v*5)*math.sin(math.pi*v)**2
    x=.075+(rx+wrinkle)*math.cos(theta)
    y=.006+(ry+wrinkle)*math.sin(theta)
    z+=.0006*math.cos(2*theta)*math.sin(math.pi*v)
    return (x,y,z)
cuff_obj=sheet('L_FoldDownCuff',28,72,cuff,.0024)
# Smooth interpolating profile for a tongue that starts beneath the laces,
# rises, turns over and drapes forward. Widths are fitted from all six views.
profile=[(-.073,.019,.020),(-.042,.024,.019),(-.002,.036,.019),(.035,.062,.019),(.063,.093,.020),(.078,.126,.023),(.054,.132,.032),(.025,.109,.037),(-.005,.086,.039),(-.035,.060,.034)]
def catmull(t):
    s=t*(len(profile)-1); i=min(int(s),len(profile)-2); f=s-i
    p0=Vector(profile[max(i-1,0)]);p1=Vector(profile[i]);p2=Vector(profile[i+1]);p3=Vector(profile[min(i+2,len(profile)-1)])
    return .5*((2*p1)+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)
def tongue(v,u):
    x,z,w=catmull(v); side=2*u-1
    # Rounded terminal corners and a shallow transverse fabric crown.
    taper=1-.12*max(0,(v-.9)/.1)*abs(side)**4
    x+=.010*side**4*max(0,(v-.88)/.12)
    z+=.0025*(1-side*side)+.00035*math.sin(v*math.pi*5)*side*side
    return (x,.006+side*w*taper,z)
tongue_obj=sheet('L_FoldDownTongue',72,24,tongue,.0018)
# Duplicate the completed shoe, preserving separate editable objects.
left=[o for o in bpy.context.scene.objects if o.type=='MESH']
for obj in left:
    copy=obj.copy();copy.data=obj.data.copy();bpy.context.collection.objects.link(copy)
    copy.name='R_'+obj.name[2:]
    copy.location.y=-.15
    copy.location.x=.025
    # A small pair presentation rotation only; structure remains mirrored in width.
    for v in copy.data.vertices: v.co.y=.012-v.co.y
    # Recalculate normals after the reflected coordinates.
    bm=bmesh.new();bm.from_mesh(copy.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(copy.data);bm.free()

model_objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
# Keep exact source file as the authoritative comparison; blend metadata records it.
scene=bpy.context.scene
scene['source_glb_sha256']=SOURCE_HASH
scene['source_credit']='theunclerulez / Generic Converse style Sneakers / CC BY 4.0'
scene['reference_notice']='Six uncalibrated photographs; approximate shape study, not a production-last model.'
scene['scope']='Neutral white geometry only. No logo, pattern, clasp, crystal, final color.'

# Evaluate modifier geometry and report useful QA rather than claiming perfect CAD.
inventory=[]
deps=bpy.context.evaluated_depsgraph_get()
for obj in model_objects:
    evaluated=obj.evaluated_get(deps); mesh=evaluated.to_mesh()
    bm=bmesh.new();bm.from_mesh(mesh)
    inventory.append({'name':obj.name,'vertices':len(mesh.vertices),'triangles':sum(len(f.vertices)-2 for f in mesh.polygons),'non_manifold_edges':sum(not e.is_manifold for e in bm.edges),'dimensions_m':[round(v,6) for v in evaluated.dimensions], 'thickness_m':obj.get('nominal_thickness_m')})
    bm.free();evaluated.to_mesh_clear()
bpy.ops.object.select_all(action='DESELECT')
for o in model_objects:o.select_set(True)
bpy.context.view_layer.objects.active=tongue_obj
bpy.ops.export_scene.gltf(filepath=str(TARGET),export_format='GLB',use_selection=True,export_apply=True,export_yup=True,export_extras=True)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_HASH
comparison = {}
for version,path in [('V2',SOURCE),('V3',TARGET)]:
    blob=path.read_bytes();length=struct.unpack_from('<I',blob,12)[0]
    document=json.loads(blob[20:20+length]);accessors=document['accessors']
    primitives=[p for m in document['meshes'] for p in m['primitives']]
    comparison[version]={'file':path.name,'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'mesh_objects':len(document['meshes']),'vertices':sum(accessors[p['attributes']['POSITION']]['count'] for p in primitives),'triangles':sum(accessors[p['indices']]['count']//3 for p in primitives),'images':len(document.get('images',[]))}
(OUT/'comparison.json').write_text(json.dumps(comparison,indent=2))
(OUT/'parts.json').write_text(json.dumps({'source_sha256':SOURCE_HASH,'objects':inventory},indent=2))

# Neutral studio rig, independent of the website. No textures from the photos.
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.cycles.use_denoising=False
scene.render.resolution_x=1100;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Neutral studio');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.14,.18,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
scene.view_settings.view_transform='AgX'
def area(name,loc,power,size):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,-.06,.06))-o.location).to_track_quat('-Z','Y').to_euler()
area('Key softbox',(-.3,-.4,.6),12,.5)
area('Fill softbox',(.2,.35,.35),8,.4)
area('Rim softbox',(.4,-.1,.5),10,.3)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.021))
floor=bpy.context.object;floor.name='STUDIO_FLOOR_NOT_EXPORTED'
floor_mat=bpy.data.materials.new('Studio floor');floor_mat.diffuse_color=(.07,.085,.11,1);floor.data.materials.append(floor_mat)
cam_data=bpy.data.cameras.new('Review camera');cam=bpy.data.objects.new('Review camera',cam_data);scene.collection.objects.link(cam);scene.camera=cam;cam_data.type='ORTHO';cam_data.ortho_scale=.48
center=Vector((.03,-.065,.065))
views=[('01_front_three_quarter',(-.6,-.7,.36)),('02_outer_side',(0,-1,.14)),('03_inner_side',(0,1,.14)),('04_front',(-1,0,.18)),('05_rear',(1,0,.2)),('06_top',(-.15,0,1))]
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'soulgrain_onward_v3_shape_study.blend'))
# Side and single shoe views focus on the left shoe to avoid the other obscuring it.
right=[o for o in model_objects if o.name.startswith('R_')]
for name,direction in views:
    single=name not in ['01_front_three_quarter','06_top']
    for o in right:o.hide_render=single
    target=Vector((.01,.006,.065)) if single else center
    cam.location=target+Vector(direction);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    cam_data.ortho_scale=.35 if single else .48
    scene.render.filepath=str(RENDER/(name+'.png'))
    if '--skip-render' not in sys.argv: bpy.ops.render.render(write_still=True)
for o in right:o.hide_render=False
cam.location=center+Vector((-.6,-.7,.36));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam_data.ortho_scale=.48
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'soulgrain_onward_v3_shape_study.blend'))
print('V3_COMPLETE',str(TARGET))
