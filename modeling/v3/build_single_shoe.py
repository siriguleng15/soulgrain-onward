"""Blender 4.3: structure-only, photo-informed ONWARD review study.
Run from any directory: blender -b -t 2 --python modeling/v3/build_model.py
No source GLB, website files, texture, logo or brand pattern is modified.
"""
import bpy, bmesh, math, json, hashlib, struct, sys
from pathlib import Path
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'modeling/v3/single'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'public/assets/soulgrain_onward_template_white_preview.glb'
TARGET = ROOT / 'public/assets/soulgrain_onward_v3_single_review.glb'
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
    for v in obj.data.vertices:
        v.co = world @ v.co
        # Reproportion the whole assembled source, including laces and eyelets.
        v.co.y=.006+(v.co.y-.006)*1.10
        if v.co.z > .035: v.co.z=.035+(v.co.z-.035)*.77
        if v.co.z < 0: v.co.z*=1.18

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
old_tongue = [o for o in parts if max(v.co.z for v in o.data.vertices) > 0.12]
assert len(old_tongue) == 1 and len(old_tongue[0].data.vertices) == 347
bpy.data.objects.remove(old_tongue[0], do_unlink=True)
parts.remove(old_tongue[0])
roles = {0:'RubberToeCap',1:'UpperOuter',3:'UpperInner',4:'Outsole',5:'HeelRubber',6:'HeelSeam',7:'FoxingInner',8:'ToeTrim',9:'LiningInner',10:'HeelSeamInner',11:'CollarBinding',12:'BottomBindingInner',13:'LiningOuter',14:'HeelBinding',15:'HeelDetailA',16:'HeelDetailB',17:'BottomBindingOuter',18:'TopBindingA',19:'TopBindingB',20:'TopBindingC',21:'TopBindingD',22:'TopBindingE',23:'TopBindingRear',24:'FoxingOuter',25:'ToeDetail'}
for obj in parts:
    suffix = obj.name.rsplit('.',1)[-1]
    index = int(suffix) if suffix.isdigit() else 0
    finish(obj, 'L_' + roles[index])
finish(laces, 'L_LacesAndEyelets')
# The source is an auxiliary mesh: proportions and the sole package are rebuilt below.

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
    theta=-2.08+4.16*u
    # The neck varies in height and radius around the ankle; the quarter-to-cuff
    # junction sits in the upper seam region, rather than hanging above it.
    root=.085+.004*math.cos(theta)
    shoulder=.108+.006*math.cos(theta)+.002*math.sin(2*theta)
    hem=.042+.017*(math.cos(theta)+1)/2+.003*math.sin(3*theta+.3)
    r=.006
    if v < .20:
        z=root+(shoulder-root)*v/.20; radial=0
    elif v < .58:
        a=(v-.20)/.38*math.pi
        z=shoulder+r*math.sin(a);radial=r*(1-math.cos(a))
    else:
        t=(v-.58)/.42
        z=shoulder+(hem-shoulder)*t
        radial=.012+.007*t*t
        # Broad uneven cloth folds, modelled into the outer drape surface.
        radial+=.0022*math.sin(t*math.pi*3.2+.7*math.sin(theta))*math.sin(math.pi*t)**2
        z+=.002*math.sin(2.4*theta+t*3)*math.sin(math.pi*t)
    rx=.049+radial*(1+.10*math.sin(theta))
    ry=.037+radial*.70
    x=.075+rx*math.cos(theta)+.002*math.sin(3*theta)*v*v-.045*v*v*(abs(theta)/2.08)**7
    y=.006+ry*math.sin(theta)+.010*v*v*(abs(theta)/2.08)**7*(1 if theta>0 else -1)
    return (x,y,z)
cuff_obj=sheet('L_FoldDownCuff',36,88,cuff,.0015)
# Smooth interpolating profile for a tongue that starts beneath the laces,
# rises, turns over and drapes forward. Widths are fitted from all six views.
profile=[(-.073,.018,.021),(-.042,.022,.021),(-.002,.031,.021),(.045,.058,.021),(.075,.090,.024),(.060,.113,.030),(.032,.101,.035),(.005,.080,.038),(-.023,.060,.036)]
def catmull(t):
    s=t*(len(profile)-1); i=min(int(s),len(profile)-2); f=s-i
    p0=Vector(profile[max(i-1,0)]);p1=Vector(profile[i]);p2=Vector(profile[i+1]);p3=Vector(profile[min(i+2,len(profile)-1)])
    return .5*((2*p1)+(-p0+p2)*f+(2*p0-5*p1+4*p2-p3)*f*f+(-p0+3*p1-3*p2+p3)*f*f*f)
def tongue(v,u):
    x,z,w=catmull(v); side=2*u-1
    # Rounded terminal corners and a shallow transverse fabric crown.
    taper=1-.12*max(0,(v-.9)/.1)*abs(side)**4
    x+=.013*side**4*max(0,(v-.88)/.12)
    z+=.0015*(1-side*side)+.0012*math.sin(v*math.pi*4+side)*side*side*max(0,(v-.6)/.4)
    return (x,.006+side*w*taper,z)
tongue_obj=sheet('L_FoldDownTongue',72,24,tongue,.0018)
# Replace the old narrow/uneven sole package with a photo-proportioned rubber
# perimeter. The outline is an asymmetric interpolated last, not a box/cylinder.
for o in list(bpy.context.scene.objects):
    if o.name in ['L_Outsole','L_FoxingOuter','L_FoxingInner','L_HeelRubber','L_BottomBindingInner','L_BottomBindingOuter','L_HeelBinding']:
        bpy.data.objects.remove(o,do_unlink=True)
cap=bpy.data.objects['L_RubberToeCap']
bm=bmesh.new();bm.from_mesh(cap.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,.003),plane_no=(0,0,1),clear_inner=True,clear_outer=False)
bm.to_mesh(cap.data);bm.free()
outline=[(-.138,.006),(-.132,-.020),(-.112,-.039),(-.073,-.044),(-.018,-.039),(.055,-.033),(.115,-.031),(.134,-.018),(.138,.006),(.132,.031),(.110,.042),(.040,.045),(-.030,.051),(-.095,.054),(-.127,.039)]
def sole_xy(t):
    q=t*len(outline);i=int(q)%len(outline);f=q-int(q)
    a,b,c,d=[Vector(outline[j%len(outline)]) for j in [i-1,i,i+1,i+2]]
    return .5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f)
N=160
rubber_profile=[(-.024,.992),(-.0235,.997),(-.022,1.0),(-.010,1.0),(-.009,.997),(-.008,.997),(-.007,1.0),(.009,1.0),(.011,.998),(.012,.994)]
vv=[]
for z,scale in rubber_profile:
    for i in range(N):
        xy=sole_xy(i/N);vv.append((xy.x*scale,.006+(xy.y-.006)*scale,z))
ff=[]
for r in range(len(rubber_profile)-1):
    for i in range(N):
        j=(i+1)%N;ff.append((r*N+i,r*N+j,(r+1)*N+j,(r+1)*N+i))
ff.extend([tuple(range(N-1,-1,-1)),tuple((len(rubber_profile)-1)*N+i for i in range(N))])
mesh=bpy.data.meshes.new('Photo fitted rubber sole perimeter');mesh.from_pydata(vv,[],ff);mesh.update()
sole=bpy.data.objects.new('L_RebuiltRubberSole',mesh);bpy.context.collection.objects.link(sole);finish(sole,sole.name)
bm=bmesh.new();bm.from_mesh(mesh);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(mesh);bm.free()
for face in mesh.polygons:
    if len(face.vertices)>4:face.use_smooth=False

# The upper lace rows sit inside the folded region in the reference. Shorten
# the inherited lace arrangement at its hidden throat, rather than letting it
# pass through the new folded cuff.
bm=bmesh.new();bm.from_mesh(laces.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=0.0000001)
cut=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,.080),plane_no=(0,0,1),clear_outer=True,clear_inner=False)
cut_edges=[e for e in cut['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_boundary]
if cut_edges:bmesh.ops.holes_fill(bm,edges=cut_edges,sides=0)
bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(laces.data);bm.free()
# Join the collar root to the actual deformed quarter surface with a shaped
# inner seam/lining bridge. This makes the cuff a sewn continuation of the shoe,
# not an isolated sleeve. The join is intentionally seated into the shell.
attachment_points=[]
for i in range(89):
    u=i/88;theta=-2.08+4.16*u;root=Vector(cuff(0,u))
    # Smooth continuous quarter seam; the lower edge is seated inside the
    # existing side/heel panels, 12 mm below the collar root.
    attachment_points.append(Vector((.075+.055*math.cos(theta),.006+.035*math.sin(theta),root.z-.012)))
def attachment(v,u):
    s=u*88;i=min(int(s),87);q=s-i
    source=attachment_points[i].lerp(attachment_points[i+1],q)
    return tuple(source.lerp(Vector(cuff(0,u)),v))
join=sheet('L_QuarterToCuffSeam',4,88,attachment,.0008)
join.modifiers.remove(join.modifiers['Soft fabric edge'])
join['purpose']='Quarter-to-cuff physical lining bridge, intentionally seated at both boundaries'

# Functional eyelet holes and raised rolled rims in both front cuff flaps.
# These are structural hardware, with the same neutral study material.
for side,u in [('Outer',.04),('Inner',.96)]:
    for index,v in enumerate([.66,.74,.82,.90],1):
        point=Vector(cuff(v,u))
        dv=Vector(cuff(v+.0001,u))-Vector(cuff(v-.0001,u))
        du=Vector(cuff(v,u+.0001))-Vector(cuff(v,u-.0001))
        normal=dv.cross(du).normalized()
        if normal.dot(Vector((point.x-.075,point.y-.006,0)))<0:normal=-normal
        rotation=normal.to_track_quat('Z','Y').to_euler()
        bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=.0018,depth=.008,location=point,rotation=rotation)
        cutter=bpy.context.object;cutter.name=f'HELPER_eyelet_{side}_{index}'
        cutter['construction_helper']=True;cutter.hide_render=True;cutter.hide_set(True)
        boolean=cuff_obj.modifiers.new(f'Eyelet hole {side} {index}','BOOLEAN');boolean.operation='DIFFERENCE';boolean.solver='EXACT';boolean.object=cutter
        bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=10,major_radius=.0023,minor_radius=.00055,location=point+normal*.0008,rotation=rotation)
        finish(bpy.context.object,f'L_CuffEyelet{side}{index}')

# Seat inherited shell fragments on the rebuilt footbed plane. Leaving the
# old below-sole tails creates visible shards in the new foxing wall.
source_names={'L_'+name for name in roles.values()}|{'L_LacesAndEyelets'}
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH' or obj.name not in source_names:continue
    bm=bmesh.new();bm.from_mesh(obj.data)
    bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,.012),plane_no=(0,0,1),clear_inner=True,clear_outer=False)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(obj.data);bm.free()
    obj['footbed_seating_plane_m']=.012

model_objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and not o.get('construction_helper')]
# Keep exact source file as the authoritative comparison; blend metadata records it.
scene=bpy.context.scene
scene['source_glb_sha256']=SOURCE_HASH
scene['source_credit']='theunclerulez / Generic Converse style Sneakers / CC BY 4.0'
scene['reference_notice']='Single complete shoe candidate fitted to six uncalibrated photographs. Visual similarity still requires review; not an approved replica.'
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
scene.render.engine='CYCLES';scene.cycles.samples=12 if '--draft' in sys.argv else 64
scene.cycles.use_denoising=False
scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=50 if '--draft' in sys.argv else 100
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
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.024))
floor=bpy.context.object;floor.name='STUDIO_FLOOR_NOT_EXPORTED'
floor_mat=bpy.data.materials.new('Studio floor');floor_mat.diffuse_color=(.07,.085,.11,1);floor.data.materials.append(floor_mat)
cam_data=bpy.data.cameras.new('Review camera');cam=bpy.data.objects.new('Review camera',cam_data);scene.collection.objects.link(cam);scene.camera=cam;cam_data.type='ORTHO';cam_data.ortho_scale=.48
center=Vector((.005,.006,.052))
views=[('01_side_toe_left',(0,-1,.10)),('02_side_toe_right',(0,1,.10)),('03_front_three_quarter',(-.75,-1,.40)),('04_front',(-1,0,.28)),('05_top_front',(-.32,0,1)),('06_rear',(1,-.18,.35))]
cam_data.ortho_scale=.35
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'soulgrain_onward_v3_single_review.blend'))
for name,direction in views:
    cam_data.ortho_scale=.43 if name=='05_top_front' else .35
    cam.location=center+Vector(direction);cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(RENDER/(name+'.png'))
    if '--skip-render' not in sys.argv: bpy.ops.render.render(write_still=True)
cam.location=center+Vector((-.75,-1,.4));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'soulgrain_onward_v3_single_review.blend'))
print('SINGLE_REVIEW_COMPLETE',str(TARGET))
