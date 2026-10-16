"""Original-source single shoe with UV-mapped, replaceable material regions.
No V3/V4 files or scripts read. Blender 5.2.2. Outputs new assets only.
"""
import bpy,bmesh,math,hashlib,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[2];O=Path(__file__).resolve().parent
S=Path('/workspace/onward-readonly-inspection-20261017/source/generic_converse_style_sneakers.glb')
HASH='af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
if not S.exists():
 S=Path('/tmp/onward-editable-original.glb')
 with S.open('wb') as f:
  for i in range(1,6):f.write((R/f'generic_converse_style_sneakers.glb.part{i:02}').read_bytes())
assert hashlib.sha256(S.read_bytes()).hexdigest()==HASH
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(S))
body=bpy.data.objects['CONVERSE_Nuovo.1_0'];laces=bpy.data.objects['Sweep_Nuovo_0']
for obj in [body,laces]:
 matrix=obj.matrix_world.copy();obj.parent=None;obj.matrix_world=Matrix.Identity(4)
 for v in obj.data.vertices:v.co=matrix@v.co
for o in list(bpy.context.scene.objects):
 if o not in [body,laces]:bpy.data.objects.remove(o,do_unlink=True)
for o in [body,laces]:
 bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=2e-7);bm.to_mesh(o.data);bm.free()
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
islands=list(bpy.context.selected_objects);native_tongue=next(o for o in islands if max(v.co.z for v in o.data.vertices)>.14)
body=max(islands,key=lambda o:len(o.data.vertices));lining=next(o for o in islands if o not in [body,native_tongue])
body.name='Shoe_Body';lining.name='Inner_Lining';native_tongue.name='Original_Vamp';laces.name='Original_Lower_Laces'
# Clear imported colors / all branding textures, keeping geometry only.
for o in [body,lining,native_tongue,laces]:o.data.materials.clear()
for m in list(bpy.data.materials):bpy.data.materials.remove(m)
for im in list(bpy.data.images):bpy.data.images.remove(im)
materials={}
colors={'Body_Canvas':(.50,.49,.46,1),'Body_Inner_Canvas':(.50,.49,.46,1),'Collar_Canvas':(.55,.54,.51,1),'Tongue_Canvas':(.55,.54,.51,1),'Rubber_Toe':(.82,.82,.79,1),'Rubber_Foxing':(.76,.76,.72,1),'Rubber_Outsole':(.58,.58,.54,1),'Laces':(.84,.82,.76,1),'Eyelets':(.48,.51,.54,1),'Heel_Strip':(.63,.61,.56,1),'Canvas_Trim':(.60,.58,.53,1),'Stitching':(.83,.81,.75,1),'Inner_Lining':(.44,.43,.40,1)}
for name,color in colors.items():
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=color
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=color;bs.inputs['Roughness'].default_value=.72 if 'Rubber' not in name else .56
 if name=='Eyelets':bs.inputs['Metallic'].default_value=.82;bs.inputs['Roughness'].default_value=.29
 materials[name]=m
# Cloth microstructure is small and neutral; no source logos or colored artwork.
image=bpy.data.images.new('Neutral_canvas_weave',width=128,height=128,alpha=False)
pixels=[]
for y in range(128):
 for x in range(128):
  a=2*math.pi*x/8;b=2*math.pi*y/8
  pixels.extend((.5+.028*math.cos(a)*math.sin(b),.5+.028*math.sin(a)*math.cos(b),.999,1))
image.pixels=pixels;image.colorspace_settings.name='Non-Color';image.pack()
for name in ['Body_Canvas','Body_Inner_Canvas','Collar_Canvas','Tongue_Canvas','Heel_Strip','Canvas_Trim','Inner_Lining']:
 m=materials[name];nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
 mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(12,12,1);uv=nodes.new('ShaderNodeTexCoord')
 normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.33
 links=m.node_tree.links;links.new(uv.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],tex.inputs['Vector']);links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])

def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
def g(x,c,w):return math.exp(-((x-c)/w)**2)
def warp(p):
 p=p.copy();f=smooth((p.z-.055)/.060)*max(0,min(1,(.122-p.x)/.075))**1.5
 p.x-=.018*f;p.z-=.010*f
 if p.z<-.011:p.z=-.011+(p.z+.011)*1.15
 return p
for o in [body,lining,native_tongue,laces]:
 for v in o.data.vertices:v.co=warp(v.co)
# Keep native ankle opening and actually attach the new returning mantle to it.
bm=bmesh.new();bm.from_mesh(body.data);boundary=[e for e in bm.edges if e.is_boundary];adj={}
for e in boundary:
 for v in e.verts:adj.setdefault(v,[]).append(e.other_vert(v))
# High rim follows source top edge, excluding front vertical lace edges.
rim_vertices={v for v in adj if v.co.z>.101 and v.co.x>.025}
rim_edges=[e for e in boundary if all(v in rim_vertices for v in e.verts)]
adj2={}
for e in rim_edges:
 for v in e.verts:adj2.setdefault(v,[]).append(e.other_vert(v))
ends=[v for v,n in adj2.items() if len(n)==1];assert len(ends)==2
start=min(ends,key=lambda v:v.co.y);rim=[];prev=None;cur=start
while True:
 rim.append(cur.co.copy());n=[v for v in adj2[cur] if v!=prev]
 if not n:break
 prev,cur=cur,n[0]
# Exclude lower descending source front eyelet edges; preserve the actual saddle.
while len(rim)>3 and rim[0].z<.104:rim.pop(0)
while len(rim)>3 and rim[-1].z<.104:rim.pop()
bm.free()
def sample_poly(points,t):
 lengths=[0]
 for a,b in zip(points,points[1:]):lengths.append(lengths[-1]+(b-a).length)
 f=t*lengths[-1]
 for i in range(len(points)-1):
  if lengths[i+1]>=f:return points[i].lerp(points[i+1],(f-lengths[i])/max(1e-12,lengths[i+1]-lengths[i]))
 return points[-1].copy()
def cuff(s,t):
 p=sample_poly(rim,s);d=sample_poly(rim,min(1,s+.045))-sample_poly(rim,max(0,s-.045));n=Vector((d.y,-d.x,0)).normalized()
 r=.0050+.0010*math.sin(s*5+.5)
 if t<=.28:
  a=math.pi*t/.28;out=r*(1-math.cos(a));z=p.z+r*math.sin(a);q=0
 else:
  q=(t-.28)/.72
  hem=.028+.034*math.sin(math.pi*s)**.5-.028*g(s,.24,.10)-.025*g(s,.77,.09)+.002*math.sin(s*9+.5)
  z=p.z+(hem-p.z)*q
  back=math.sin(math.pi*s)**.6
  fold1=.22+.25*s+.10*math.sin(s*9);fold2=.75+.15*math.sin(s*6+1)
  wr=(.0055*g(q,fold1,.20)-.0025*g(q,fold1+.20,.12)+.0015*g(q,fold2,.13)*(g(s,.2,.17)+g(s,.8,.17)))*back
  out=2*r+.006*q+wr
  z+=.0025*math.sin(s*9+.7)*g(q,.7,.22)
 point=p+n*out;point.z=z
 front=g(s,0,.30)+g(s,1,.30)
 point.x+=.032*front*q**1.18
 # Lateral asymmetry, relaxed front free corners and rear diagonal folds.
 point.y+=.0015*math.sin(2*math.pi*s+.7)*q*q
 return point

def material(obj,name):obj.data.materials.clear();obj.data.materials.append(materials[name])
def uv_project(obj):
 uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='SurfaceUV')
 for p in obj.data.polygons:
  for li in p.loop_indices:
   co=obj.data.vertices[obj.data.loops[li].vertex_index].co
   uv.data[li].uv=((co.x+.13)/.265,(co.z+.023)/.17)
def cut_above(obj,z):
 bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,z),plane_no=(0,0,1),clear_outer=True);bm.to_mesh(obj.data);bm.free()
# Retain lower original tongue/vamp, source laces; folded apron conceals tie.
cut_above(native_tongue,.036);material(native_tongue,'Body_Canvas');uv_project(native_tongue)
cut_above(laces,.069);material(laces,'Laces');uv_project(laces)
material(lining,'Inner_Lining');uv_project(lining)
# Actual native vamp cut boundary used as the new tongue's fixed root.
bm=bmesh.new();bm.from_mesh(native_tongue.data)
root_points=sorted({tuple(v.co) for e in bm.edges if e.is_boundary for v in e.verts if abs(v.co.z-.036)<1e-5},key=lambda p:p[1]);root=[Vector(p) for p in root_points];bm.free();assert len(root)>2
root_center=sample_poly(root,.5)
path=[Vector(p) for p in [(root_center.x,.036),(-.014,.068),(.020,.104),(.020,.118),(.006,.117),(-.020,.085),(-.058,.047)]]
def center(t):
 f=t*(len(path)-1);i=min(int(f),len(path)-2);q=f-i;a,b,c,d=[path[max(0,min(len(path)-1,k))] for k in [i-1,i,i+1,i+2]]
 return .5*(2*b+(-a+c)*q+(2*a-5*b+4*c-d)*q*q+(-a+3*b-3*c+d)*q*q*q)
def tongue(u,t):
 v=abs(u);rounding=.045*(1-math.sqrt(max(0,1-((max(0,v-.70)/.30))**2)))
 t=t*(1-rounding);p=center(t);half=.026+.011*smooth(t/.60)-.003*smooth((t-.88)/.12)
 pos=Vector((p.x,.0065+u*half,p.y))
 pos.z+=.0020*(1-u*u)*smooth((t-.42)/.22)*(1-smooth((t-.90)/.10))
 pos.z+=.0012*math.sin(u*4+.8)*g(t,.79,.13)
 start=sample_poly(root,(u+1)/2);a=smooth(t/.15);target_z=pos.z;pos=start.lerp(pos,a);pos.z=target_z
 return pos

def make_panel(name,fn,rows,columns,mat,holes):
 vertices=[fn(i/columns,j/rows) for j in range(rows+1) for i in range(columns+1)]
 faces=[];coords=[]
 centers=[(fn(s,t),radius) for s,t,radius in holes]
 for j in range(rows):
  for i in range(columns):
   a=j*(columns+1)+i;ids=(a,a+1,a+columns+2,a+columns+1);mid=sum((vertices[k] for k in ids),Vector())/4
   if any((mid-c).length<rad for c,rad in centers):continue
   faces.append(ids);coords.append(((i/columns,j/rows),((i+1)/columns,j/rows),((i+1)/columns,(j+1)/rows),(i/columns,(j+1)/rows)))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);material(obj,mat)
 uv=mesh.uv_layers.new(name='SurfaceUV')
 for poly,face_uv in zip(mesh.polygons,coords):
  for li,co in zip(poly.loop_indices,face_uv):uv.data[li].uv=co
 sub=obj.modifiers.new('Fabric curvature','SUBSURF');sub.levels=1;sub.render_levels=1
 solid=obj.modifiers.new('Real canvas thickness','SOLIDIFY');solid.thickness=.0014;solid.offset=0;solid.use_even_offset=False
 for p in mesh.polygons:p.use_smooth=True
 return obj
cuff_holes=[(s,t,.0030) for s in [.060,.940] for t in [.37,.55,.73,.90]]
collar=make_panel('Folded_Collar',cuff,96,128,'Collar_Canvas',cuff_holes)
tongue_fn=lambda s,t:tongue(s*2-1,t)
tongue_holes=[(.19,.94,.0026),(.81,.94,.0026)]
apron=make_panel('Folded_Tongue',tongue_fn,96,72,'Tongue_Canvas',tongue_holes)
apron.modifiers['Real canvas thickness'].thickness=.0012

def surface_normal(fn,s,t):
 a=fn(min(1,s+.0005),t)-fn(max(0,s-.0005),t);b=fn(s,min(1,t+.0005))-fn(s,max(0,t-.0005));n=a.cross(b).normalized()
 return -n if fn is cuff else n
for label,fn,holes in [('Cuff',cuff,cuff_holes),('Tongue',tongue_fn,tongue_holes)]:
 for i,(s,t,radius) in enumerate(holes):
  n=surface_normal(fn,s,t);p=fn(s,t)
  bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=10,major_radius=.0035 if label=='Cuff' else .0030,minor_radius=.00065 if label=='Cuff' else .00060,location=p+n*.00065,rotation=n.to_track_quat('Z','Y').to_euler())
  o=bpy.context.object;o.name=f'{label}_Eyelet_{i+1:02}';material(o,'Eyelets')
  for f in o.data.polygons:f.use_smooth=True
# Split faces along actual color-region boundaries to avoid jagged per-face
# centroid changes. The lower-body surface is retained; this creates clean edges.
bm=bmesh.new();bm.from_mesh(body.data)
for z in [-.0138,.0068,.032]:
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,z),plane_no=(0,0,1))
for v in bm.verts:v.co.x+=.018*((v.co.y-.0065)/.045)**2
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(-.072,0,0),plane_no=(1,0,0))
for v in bm.verts:v.co.x-=.018*((v.co.y-.0065)/.045)**2
bm.to_mesh(body.data);bm.free()
# Neutral semantic material regions on genuine native source geometry.
for name in ['Body_Canvas','Body_Inner_Canvas','Rubber_Toe','Rubber_Foxing','Rubber_Outsole','Eyelets']:body.data.materials.append(materials[name])
for f in body.data.polygons:
 p=sum((body.data.vertices[i].co for i in f.vertices),Vector())/len(f.vertices)
 idx=4 if p.z<-.0138 else 3 if p.z<.0068 else 2 if p.x+.018*((p.y-.0065)/.045)**2<-.072 and p.z<.032 else 0 if p.y<.0065 else 1
 f.material_index=idx
 f.use_smooth=True
uv_project(body)
# Keep a genuinely separate, narrow back seam strip, not a branded heel plate.
def strip(s,t):
 z=.009+t*.102;x=.130-.011*smooth((z-.015)/.1)
 return Vector((x+.001,.0065+(s-.5)*.0055,z))
heel=make_panel('Heel_Backstay',strip,48,6,'Heel_Strip',[])
heel.modifiers['Real canvas thickness'].thickness=.0008

def line(name,points,mat,radius=.00045):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=1;curve.bevel_depth=radius;curve.bevel_resolution=2
 spline=curve.splines.new('POLY');spline.points.add(len(points)-1)
 for dst,p in zip(spline.points,points):dst.co=(*p,1)
 obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);curve.materials.append(materials[mat]);return obj
# Rolled textile binding follows real free edges, not a disconnected torus.
for fn,label in [(cuff,'Collar'),(tongue_fn,'Tongue')]:
 line(label+'_Hem_Binding',[fn(i/160,1) for i in range(161)],'Canvas_Trim',.00065)
 for s in [0,1]:line(label+f'_Front_Binding_{s}',[fn(s,j/120) for j in range(121)],'Canvas_Trim',.00055)
# Fine discontinuous seam stitches at cloth borders, merged into one object.
stitches=[]
for fn in [cuff,tongue_fn]:
 for s in [.018,.982]:
  for j in range(50):
   a=.35+j*.012;b=a+.006
   if b>.98:break
   n=surface_normal(fn,s,(a+b)/2)
   stitches.append(line('Stitch',[fn(s,a)+n*.0010,fn(s,b)+n*.0010],'Stitching',.00012))
 for i in range(74):
  a=.025+i*.0125;b=a+.006
  n=surface_normal(fn,(a+b)/2,.978)
  stitches.append(line('Stitch',[fn(a,.978)+n*.001,fn(b,.978)+n*.001],'Stitching',.00012))
# Lace free tips below the folded tongue, retained in the assembled shoe.
for side in [-1,1]:
 points=[Vector((-.008,.0065+side*.023,.067)),Vector((-.025,.0065+side*.029,.056)),Vector((-.034,.0065+side*.031,.035)),Vector((-.035,.0065+side*.030,.018))]
 line('Lace_Tip',points,'Laces',.0010)
# Convert only new curve objects, preserve named editable material regions.
for o in list(bpy.context.scene.objects):
 if o.type=='CURVE':
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
# Merge identical stitch materials into one object to reduce mobile draw calls.
stitch_meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith('Stitch')]
if stitch_meshes:
 bpy.ops.object.select_all(action='DESELECT')
 for o in stitch_meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=stitch_meshes[0];bpy.ops.object.join();bpy.context.object.name='Canvas_Stitching'
for o in bpy.context.scene.objects:
 if o.type=='MESH':
  o['part']=o.name;o['shape_locked_in_configurator']=True
  for f in o.data.polygons:f.use_smooth=True
models=[o for o in bpy.context.scene.objects if o.type=='MESH']
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene['source_sha256']=HASH
scene['credit']='theunclerulez / Generic Converse style Sneakers / CC BY 4.0; source geometry modified, source colors removed'
scene['design']='Single assembled, folded collar and tongue, individually replaceable UV materials. Shape estimated from six photos.'
bpy.ops.object.select_all(action='DESELECT')
for o in models:o.select_set(True)
bpy.context.view_layer.objects.active=body
out=R/'public/assets/soulgrain_onward_editable_v5.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=True,export_extras=True,export_texcoords=True)
print('EDITABLE_GLB_READY',str(out),out.stat().st_size,flush=True)
# Editable source project only; no modification of original source file.
bpy.ops.wm.save_as_mainfile(filepath=str(O/'soulgrain_onward_editable_v5.blend'),compress=True)
assert hashlib.sha256(S.read_bytes()).hexdigest()==HASH
# Private working checks for visual iteration, never delivered instead of GLB.
if '--render' in sys.argv:
 scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=False;scene.cycles.max_bounces=3
 scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.5
 scene.render.resolution_x=900;scene.render.resolution_y=680;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('Working studio');scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.16,.17,.20,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.5
 bpy.ops.mesh.primitive_plane_add(size=3,location=(0,0,-.023));floor=bpy.context.object;floor.data.materials.append(materials['Inner_Lining'])
 for location,energy,size in [((-.3,-.35,.6),12,.5),((.2,.3,.4),8,.5),((.4,-.1,.3),7,.3)]:
  bpy.ops.object.light_add(type='AREA',location=location);o=bpy.context.object;o.data.energy=energy;o.data.size=size;o.rotation_euler=(Vector((0,0,.05))-o.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=.35
 D=Path('/workspace/onward-v5-working');D.mkdir(exist_ok=True)
 for name,direction in [('side',(0,-1,.10)),('three-quarter',(-.8,-1,.48)),('rear',(1,-.2,.28)),('top',(-.1,0,1))]:
  target=Vector((0,.006,.05));cam.location=target+Vector(direction);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.40 if name=='top' else .35
  scene.render.filepath=str(D/(name+'.png'));bpy.ops.render.render(write_still=True)
print('EDITABLE_BUILD_COMPLETE',flush=True)
