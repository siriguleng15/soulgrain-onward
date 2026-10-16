"""V4, authored independently: verified original -> native seam extrusion + native tongue reshape.
blender -b -t 4 --python-exit-code 1 --python modeling/v4/build_from_original.py
No V3 modules, GLBs or projects are read. Neutral study, no photo textures.
"""
import bpy,bmesh,hashlib,json,math,sys
from pathlib import Path
from mathutils import Matrix,Vector
R=Path(__file__).resolve().parents[2];O=R/'modeling/v4';O.mkdir(exist_ok=True)
S=Path('/tmp/onward-original/generic_converse_style_sneakers.glb')
H='af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
assert S.is_file(),'Restore original source first; no fallback is allowed.'
assert hashlib.sha256(S.read_bytes()).hexdigest()==H,'Original source hash mismatch: STOP'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(S))
body=bpy.data.objects['CONVERSE_Nuovo.1_0'];laces=bpy.data.objects['Sweep_Nuovo_0']
for obj in [body,laces]:
 m=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4)
 for v in obj.data.vertices:v.co=m@v.co
for obj in list(bpy.context.scene.objects):
 if obj not in [body,laces]:bpy.data.objects.remove(obj,do_unlink=True)
# The source contains UV-split duplicate vertices. Weld only coincident seams;
# vertex positions are unchanged before the explicit shape edits below.
for obj in [body,laces]:
 bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=2e-7);bm.to_mesh(obj.data);bm.free()
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
islands=list(bpy.context.selected_objects)
tongue=next(o for o in islands if max(v.co.z for v in o.data.vertices)>.14)
body=max(islands,key=lambda o:len(o.data.vertices));lining=next(o for o in islands if o not in [body,tongue])
body.name='NativeShoeBody';tongue.name='ReshapedNativeTongue';lining.name='NativeInnerLining';laces.name='NativeLacesAndHardware'
mat=bpy.data.materials.new('Uniform neutral grey');mat.use_nodes=True
shader=mat.node_tree.nodes['Principled BSDF'];shader.inputs['Base Color'].default_value=(.58,.58,.58,1);shader.inputs['Roughness'].default_value=.68
mat.diffuse_color=(.58,.58,.58,1)
for obj in [body,tongue,lining,laces]:
 obj.data.materials.clear();obj.data.materials.append(mat)
# Remove unused original texture datablocks from the derivative .blend.
# The verified original remains untouched on disk.
for material in list(bpy.data.materials):
 if material!=mat:bpy.data.materials.remove(material)
for image in list(bpy.data.images):bpy.data.images.remove(image)
# Original toe/sole/heel geometry remains native. Add rubber depth in the
# downward direction, keeping the shoe/sole attachment at the source height.
for obj in [body,lining]:
 for v in obj.data.vertices:
  if v.co.z<0:v.co.z*=1.22
root_z=.088
bm=bmesh.new();bm.from_mesh(body.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,root_z),plane_no=(0,0,1),clear_outer=True)
cut=[e for e in bm.edges if e.is_boundary and all(abs(v.co.z-root_z)<1e-6 for v in e.verts)]
adj={}
for edge in cut:
 a,b=edge.verts;adj.setdefault(a,[]).append(b);adj.setdefault(b,[]).append(a)
ends=[v for v,neighbors in adj.items() if len(neighbors)==1]
assert len(ends)==2 and all(len(v)<=2 for v in adj.values()),'Expected one native open U seam'
ordered=[];previous=None;current=min(ends,key=lambda v:v.co.y)
while True:
 ordered.append(current.co.copy());nexts=[v for v in adj[current] if v!=previous]
 if not nexts:break
 previous,current=current,nexts[0]
assert len(ordered)==len(adj)
bm.to_mesh(body.data);bm.free()
# Actual source seam, not a cylinder/ellipse approximation. Arc-length sampling
# stays on the native cut edges; the cuff root matches the shoe exactly.
d=[0.0]
for a,b in zip(ordered,ordered[1:]):d.append(d[-1]+(b-a).length)
def seam(u):
 length=u*d[-1]
 for i in range(len(d)-1):
  if length<=d[i+1]:return ordered[i].lerp(ordered[i+1],(length-d[i])/(d[i+1]-d[i]))
 return ordered[-1].copy()
def gaussian(x,c,w):return math.exp(-((x-c)/w)**2)
def cuff_point(u,t):
 p=seam(u);prev=seam(max(0,u-.001));nxt=seam(min(1,u+.001));tangent=(nxt-prev).normalized()
 normal=Vector((tangent.y,-tangent.x,0)).normalized()
 if normal.dot(Vector((p.x-.073,p.y-.006,0)))<0:normal=-normal
 back=max(0,min(1,(p.x-.026)/.090))
 shoulder=.104+.010*back+.0018*math.sin(u*4.7)
 hem=.040+.020*back-.004*gaussian(u,.17,.12)+.003*gaussian(u,.77,.10)
 if t<.20:
  z=root_z+(shoulder-root_z)*t/.20;outward=0
 elif t<.55:
  a=(t-.20)/.35*math.pi;outward=.006*(1-math.cos(a));z=shoulder+.006*math.sin(a)
 else:
  q=(t-.55)/.45
  z=shoulder+(hem-shoulder)*q
  outward=.012+.009*q
  # Nonperiodic diagonal cloth compression, varying around the native quarter.
  wrinkle=(.0038*gaussian(q,.28+.10*u,.12)-.0022*gaussian(q,.48-.08*u,.13)+.0032*gaussian(q,.73+.05*math.sin(u*5),.12))*math.sin(math.pi*q)
  outward+=wrinkle*(.5+.5*math.sin(math.pi*u))
  z+=.0026*gaussian(q,.65,.22)*math.sin(u*5.3+.4)
 point=p+normal*outward;point.z=z
 edge=(gaussian(u,0,.11)+gaussian(u,1,.11))
 if t>.55:
  q=(t-.55)/.45;point.x-=.024*edge*q**1.4
  point.y+=(1 if p.y>.006 else -1)*.003*edge*q
 return point
U=96;T=56
verts=[cuff_point(i/U,j/T) for j in range(T+1) for i in range(U+1)]
faces=[]
for j in range(T):
 for i in range(U):
  a=j*(U+1)+i;faces.append((a,a+1,a+U+2,a+U+1))
mesh=bpy.data.meshes.new('NativeBoundaryExtrusion');mesh.from_pydata(verts,[],faces);mesh.update()
cuff=bpy.data.objects.new('SourceSeamFoldedCuff',mesh);bpy.context.collection.objects.link(cuff);mesh.materials.append(mat)
cuff['construction']='Extruded from actual original quarter cut seam; root coordinates coincide with the source body'
cuff['thickness_m']=.0016
sub=cuff.modifiers.new('Cloth curvature','SUBSURF');sub.levels=1
solid=cuff.modifiers.new('Canvas thickness','SOLIDIFY');solid.thickness=.0016;solid.offset=0;solid.use_even_offset=True
# The source lining is lowered to the newly folded ankle root, avoiding a
# second upright high-top shell inside the new fold.
bm=bmesh.new();bm.from_mesh(lining.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,root_z+.001),plane_no=(0,0,1),clear_outer=True)
bm.to_mesh(lining.data);bm.free()
# Deform the original tongue's actual mesh and rounded perimeter, rather than
# generating a rectangular replacement sheet. Native lower vamp stays intact.
native=[v.co.copy() for v in tongue.data.vertices]
levels=[]
for i in range(25):
 z=.060+i*(.150-.060)/24;points=[v.x for v in native if abs(v.z-z)<.008]
 levels.append(sum(points)/len(points) if points else (levels[-1] if levels else 0))
path=[Vector(p) for p in [(-.009,.060),(.021,.086),(.044,.105),(.040,.115),(.018,.112),(-.008,.089),(-.034,.059)]]
def center(t):
 f=t*(len(path)-1);i=min(int(f),len(path)-2);q=f-i
 a,b,c,d=[path[max(0,min(len(path)-1,k))] for k in [i-1,i,i+1,i+2]]
 return .5*(2*b+(-a+c)*q+(2*a-5*b+4*c-d)*q*q+(-a+3*b-3*c+d)*q*q*q)
for v,old in zip(tongue.data.vertices,native):
 if old.z<=.060:continue
 h=max(0,min(1,(old.z-.060)/(.1499-.060)))
 i=min(int(h*24),23);f=h*24-i;baseline=levels[i]*(1-f)+levels[i+1]*f
 p=center(h);width=1+.70*(h*h*(3-2*h))
 y=.006+(old.y-.006)*width
 # Preserve some original cross-sectional curvature, plus a soft diagonal
 # compression at the free folded portion; there is no flat billboard surface.
 camber=(old.x-baseline)*.20
 target=Vector((p.x+camber,y,p.y+.0018*(1-min(1,((y-.006)/.040)**2))))
 blend=min(1,h/.20);blend=blend*blend*(3-2*blend)
 v.co=old.lerp(target,blend)
 if h>.65:v.co.z-=.0018*gaussian(h,.86,.14)*(y-.006)/.040
sub=tongue.modifiers.new('Original tongue smoothing','SUBSURF');sub.levels=2
solid=tongue.modifiers.new('Tongue fabric thickness','SOLIDIFY');solid.thickness=.0020;solid.offset=0
# Remove only lace portions that would occupy the now-folded collar region.
# Original lower laces and their hardware are retained as real source mesh.
bm=bmesh.new();bm.from_mesh(laces.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,root_z),plane_no=(0,0,1),clear_outer=True)
bm.to_mesh(laces.data);bm.free()
# Gravity relaxation is performed on the native-derived fabric, not used as
# an accuracy claim. Fixed points represent the stiff ankle seam / lacing.
scene=bpy.context.scene
for collider in [body,lining,laces]:
 collider.modifiers.new('Static shoe collision','COLLISION')
 collider.collision.thickness_outer=.0007;collider.collision.thickness_inner=.0007
 collider.collision.use_culling=False
rest_objects=[];relax_log=[]
def relax(obj,weights,label):
 group=obj.vertex_groups.new(name='Structural seam pins')
 for i,w in enumerate(weights):
  if w:group.add([i],w,'REPLACE')
 # Native tongue benefits from one real subdivision before the cloth solve.
 if obj==tongue:
  obj.modifiers['Original tongue smoothing'].levels=1
  bpy.context.view_layer.objects.active=obj
  bpy.ops.object.modifier_apply(modifier='Original tongue smoothing')
 rest=obj.copy();rest.data=obj.data.copy();rest.name='REST_'+label;rest['reference_only']=True
 bpy.context.collection.objects.link(rest);rest.hide_render=True;rest.hide_set(True);rest_objects.append(rest)
 cloth=obj.modifiers.new('Controlled gravity relaxation','CLOTH')
 bpy.context.view_layer.objects.active=obj
 while list(obj.modifiers).index(cloth)>0:bpy.ops.object.modifier_move_up(modifier=cloth.name)
 settings=cloth.settings;settings.quality=10;settings.mass=.20
 settings.vertex_group_mass=group.name;settings.pin_stiffness=1
 settings.tension_stiffness=40;settings.compression_stiffness=35;settings.shear_stiffness=25;settings.bending_stiffness=.35
 settings.air_damping=3
 collision=cloth.collision_settings;collision.use_collision=True;collision.distance_min=.0008;collision.collision_quality=8
 collision.use_self_collision=True;collision.self_distance_min=.001;collision.self_friction=6
 cloth.point_cache.frame_start=1;cloth.point_cache.frame_end=24
 scene.frame_set(1)
 for frame in range(1,25):
  scene.frame_set(frame);bpy.context.view_layer.update()
  evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=evaluated.to_mesh();evaluated.to_mesh_clear()
  if frame%6==0:print('RELAX',label,frame,flush=True)
 bpy.ops.object.modifier_apply(modifier=cloth.name)
 # Reject large raw solver displacement: open imported collision shells are
 # not a reliable physical garment fixture. Only a bounded sculpt adjustment
 # is accepted, and all fully pinned source coordinates are restored exactly.
 limit=.0025 if obj==cuff else .0030
 maximum=0
 for vertex,base in zip(obj.data.vertices,rest.data.vertices):
  delta=vertex.co-base.co;maximum=max(maximum,delta.length)
  pin=max((g.weight for g in vertex.groups if g.group==group.index),default=0)
  if pin>.95:vertex.co=base.co
  else:vertex.co=base.co+delta*min(.22,limit/max(delta.length,1e-12))
 relax_log.append({'part':label,'frames':24,'gravity':list(scene.gravity),'collision_margin_m':.0008,'pins':'estimated structural constraints, not measured physical data','raw_max_displacement_m':maximum,'accepted_displacement_limit_m':limit,'method':'raw free simulation rejected; bounded solver-driven sculpt adjustment, not calibrated cloth physics'})
 scene.frame_set(1)
weights=[]
for j in range(T+1):
 t=j/T;w=1 if t<=.20 else max(0,1-(t-.20)/.12)
 weights.extend([w]*(U+1))
if '--experimental-relax' in sys.argv:relax(cuff,weights,'OriginalSeamCuff')
cuff.modifiers.new('Relaxed cuff collision','COLLISION');cuff.collision.thickness_outer=.0008;cuff.collision.thickness_inner=.0008
weights=[]
for old in native:
 h=max(0,min(1,(old.z-.060)/(.1499-.060)))
 w=1 if old.z<=.062 else .85*gaussian(h,.43,.12)
 weights.append(w)
if '--experimental-relax' in sys.argv:relax(tongue,weights,'OriginalTongue')
(O/'cloth-relaxation.json').write_text(json.dumps({'enabled':'--experimental-relax' in sys.argv,'results':relax_log,'note':'Free cloth solve produced invalid geometry and is excluded from the default deliverable. Default uses source-derived sculpted surfaces.'},indent=2))
# Read positions from the solved native seam grid, for holes and hardware.
def solved_cuff(u,t):
 x=max(0,min(U-.000001,u*U));y=max(0,min(T-.000001,t*T));i=int(x);j=int(y);a=x-i;b=y-j
 points=cuff.data.vertices
 lo=points[j*(U+1)+i].co.lerp(points[j*(U+1)+i+1].co,a)
 hi=points[(j+1)*(U+1)+i].co.lerp(points[(j+1)*(U+1)+i+1].co,a)
 return lo.lerp(hi,b)
# Structural eyelets through the new folded flaps; neutral material, not logos.
helpers=[]
for side,u in [('A',.055),('B',.945)]:
 for index,t in enumerate([.63,.73,.83,.93],1):
  point=solved_cuff(u,t);du=solved_cuff(u+.0001,t)-solved_cuff(u-.0001,t);dt=solved_cuff(u,t+.0001)-solved_cuff(u,t-.0001)
  n=du.cross(dt).normalized()
  if n.dot(Vector((point.x-.073,point.y-.006,0)))<0:n=-n
  rotation=n.to_track_quat('Z','Y').to_euler()
  # Remove real cloth faces around the aperture before thickening. The
  # subdivided boundary is rounded beneath the rolled metal rim. This avoids
  # a fragile exact boolean on a thin deformed cloth shell.
  positions=[v.co.copy() for v in cuff.data.vertices]
  remaining=[]
  for face in cuff.data.polygons:
   center=sum((positions[i] for i in face.vertices),Vector())/len(face.vertices)
   difference=center-point
   radial=(difference-n*difference.dot(n)).length
   if radial<.00165 and abs(difference.dot(n))<.003:continue
   remaining.append(tuple(face.vertices))
  replacement=bpy.data.meshes.new('Native cloth with eyelet aperture')
  replacement.from_pydata(positions,[],remaining);replacement.update();replacement.materials.append(mat)
  old=cuff.data;cuff.data=replacement
  if old.users==0:bpy.data.meshes.remove(old)
  bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=10,major_radius=.0022,minor_radius=.00050,location=point+n*.0008,rotation=rotation)
  rim=bpy.context.object;rim.name=f'GreyEyelet_{side}_{index}';rim.data.materials.append(mat)
# Preserve the editable source cage before local volumetric repair of the
# native tongue. The original folded vamp has local offset-shell overlaps.
control=tongue.copy();control.data=tongue.data.copy();control.name='CONTROL_NativeTongue';control['reference_only']=True
bpy.context.collection.objects.link(control);control.hide_render=True;control.hide_set(True)
bpy.context.view_layer.objects.active=tongue
for modifier in list(tongue.modifiers):bpy.ops.object.modifier_apply(modifier=modifier.name)
tongue.data.remesh_voxel_size=.0006; tongue.data.remesh_voxel_adaptivity=0
bpy.ops.object.voxel_remesh()
# No collapsing simplifier follows the repair: it caused thin folded layers
# to cross. Shape-preserving retopology must be reviewed manually later.
tongue['local_repair']='0.6 mm voxel union of folded native tongue offsets; editable source cage retained'
models=[o for o in bpy.context.scene.objects if o.type=='MESH' and o not in helpers and not o.get('reference_only')]
for obj in models:
 for p in obj.data.polygons:p.use_smooth=True
 obj['source_sha256']=H
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='MILLIMETERS'
scene['credit']='theunclerulez / Generic Converse style Sneakers / CC BY 4.0'
scene['source_sha256']=H
scene['scope']='V4 neutral single-shoe review, native original source only; not an approved reconstruction'
scene['basis']='Original source mesh; no V3 script/project/GLB read'
deps=bpy.context.evaluated_depsgraph_get();inventory=[]
for obj in models:
 e=obj.evaluated_get(deps);m=e.to_mesh();bm=bmesh.new();bm.from_mesh(m)
 inventory.append({'name':obj.name,'vertices':len(m.vertices),'triangles':sum(len(f.vertices)-2 for f in m.polygons),'non_manifold_edges':sum(not edge.is_manifold for edge in bm.edges),'dimensions_m':list(e.dimensions)})
 bm.free();e.to_mesh_clear()
(O/'parts.json').write_text(json.dumps(inventory,indent=2))
(O/'native-seam.json').write_text(json.dumps({'cut_height_m':root_z,'original_cut_vertices':[list(p) for p in ordered],'resampled_root':[list(seam(i/U)) for i in range(U+1)],'unmodified_root_samples_gap_m':0.0,'note':'Source cut-edge interpolation; root coincident geometrically, separate editable fabric object.'},indent=2))
bpy.ops.object.select_all(action='DESELECT')
for obj in models:obj.select_set(True)
bpy.context.view_layer.objects.active=body
out=R/'public/assets/soulgrain_onward_v4_original_review.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_extras=True)
assert hashlib.sha256(S.read_bytes()).hexdigest()==H
# Independent neutral studio; excludes helpers/floor/lights from the GLB.
scene.render.engine='CYCLES';scene.cycles.samples=12 if '--draft' in sys.argv else 64;scene.cycles.use_denoising=False
scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=50 if '--draft' in sys.argv else 100
scene.world=bpy.data.worlds.new('Grey studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.14,.15,.17,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
scene.view_settings.view_transform='AgX'
def light(name,position,power,width):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=width
 obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=position;obj.rotation_euler=(Vector((0,.006,.04))-obj.location).to_track_quat('-Z','Y').to_euler()
light('Soft key',(-.35,-.35,.55),11,.45);light('Fill',(.15,.35,.30),6,.4);light('Rear rim',(.35,-.15,.4),7,.3)
bpy.ops.mesh.primitive_plane_add(size=20,location=(0,0,-.025));floor=bpy.context.object;floor.name='STUDIO_NOT_EXPORTED'
floormat=bpy.data.materials.new('Studio matte');floormat.diffuse_color=(.10,.11,.13,1);floor.data.materials.append(floormat)
data=bpy.data.cameras.new('Review camera');cam=bpy.data.objects.new('Review camera',data);scene.collection.objects.link(cam);scene.camera=cam;data.type='ORTHO'
views=[('01_side_left',(0,-1,.10)),('02_side_right',(0,1,.10)),('03_three_quarter',(-.75,-1,.42)),('04_front',(-1,0,.27)),('05_top_front',(-.30,0,1)),('06_rear',(1,-.20,.30))]
center_target=Vector((.002,.006,.050))
P=O/'previews';P.mkdir(exist_ok=True)
for name,direction in views:
 cam.location=center_target+Vector(direction);cam.rotation_euler=(center_target-cam.location).to_track_quat('-Z','Y').to_euler();data.ortho_scale=.42 if name=='05_top_front' else .35
 bpy.context.view_layer.update();scene.render.filepath=str(P/(name+'.png'))
 if '--skip-render' not in sys.argv:bpy.ops.render.render(write_still=True)
cam.location=center_target+Vector((-.75,-1,.42));cam.rotation_euler=(center_target-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.wm.save_as_mainfile(filepath=str(O/'soulgrain_onward_v4_original_review.blend'),compress=True)
print('V4_COMPLETE',out,'BYTES',out.stat().st_size)
