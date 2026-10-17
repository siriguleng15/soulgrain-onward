"""One original-source shoe, one UV garment, folded/upright shape keys.
Run with Blender 5.2.2 --background --threads 4 --python this_file.py.
No generated V3/V4/V5 model is imported. Source SHA-256 is mandatory.
Only new V7 outputs are written; existing models remain untouched.
The cloth pattern is an estimate from photographs, not a scanned garment.
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
colors={'Body_Canvas':(.47,.47,.47,1),'Body_Inner_Canvas':(.47,.47,.47,1),'Collar_Canvas':(.51,.51,.51,1),'Collar_Outer_Canvas':(.47,.47,.47,1),'Tongue_Canvas':(.51,.51,.51,1),'Tongue_Reverse_Canvas':(.51,.51,.51,1),'Rubber_Toe':(.68,.68,.68,1),'Rubber_Foxing':(.64,.64,.64,1),'Rubber_Outsole':(.51,.51,.51,1),'Laces':(.72,.72,.72,1),'Eyelets':(.48,.51,.54,1),'Heel_Strip':(.49,.49,.49,1),'Canvas_Trim':(.53,.53,.53,1),'Stitching':(.63,.63,.63,1),'Inner_Lining':(.39,.39,.39,1)}
for name,color in colors.items():
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=color
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=color;bs.inputs['Roughness'].default_value=.80 if 'Rubber' not in name else .66
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
for name in ['Body_Canvas','Body_Inner_Canvas','Collar_Canvas','Collar_Outer_Canvas','Tongue_Canvas','Tongue_Reverse_Canvas','Heel_Strip','Canvas_Trim','Inner_Lining']:
 m=materials[name];nodes=m.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
 mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(12,12,1);uv=nodes.new('ShaderNodeTexCoord')
 normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.18
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

# The old tall quarter and clipped tongue are not the design foundation.
# Only the genuine foot below the instep is kept; the canvas above is one
# continuous tailored panel, from source cut edge to the extra-high free hem.
sys.path.insert(0,str(O))
from source_details import (native_lace_anchors,clean_lace_scraps,
    enhance_source_details,create_eyelets,create_draped_lace_ends,_cut_eyelet_holes)
from lace_fit import fit_native_lace_returns
from mathutils.bvhtree import BVHTree
from functools import lru_cache
from mathutils.geometry import barycentric_transform
ROOT_Z=.045
BASE=.38
HINGE_T=.46
Y0=.0065
MORPH='Shaft_Upright'

def source_normals(obj):
 mesh=obj.data;mesh.calc_loop_triangles()
 coords=[v.co.copy() for v in mesh.vertices]
 triangles=[tuple(t.vertices) for t in mesh.loop_triangles]
 normals=[[mesh.corner_normals[i].vector.copy() for i in t.loops] for t in mesh.loop_triangles]
 return BVHTree.FromPolygons(coords,triangles,all_triangles=True),coords,triangles,normals

source_body_normals=source_normals(body)
source_tongue_normals=source_normals(native_tongue)

def blend_root_normals(obj,reference):
 """Match shading across the attached cut seam; never change its shape."""
 tree,coords,triangles,normals=reference;mesh=obj.data;custom=[]
 for loop in mesh.loops:
  p=mesh.vertices[loop.vertex_index].co;n=mesh.corner_normals[loop.index].vector.copy()
  weight=1-smooth(abs(p.z-ROOT_Z)/.003)
  if weight>0:
   point,_,idx,distance=tree.find_nearest(p)
   a,b,c=[coords[i] for i in triangles[idx]]
   if (b-a).cross(c-a).length>1e-12:
    target=barycentric_transform(point,a,b,c,*normals[idx]).normalized()
    if target.dot(n)<0:target=-target
    n=n.lerp(target,weight).normalized()
  custom.append(n)
 mesh.normals_split_custom_set(custom)

def cut_above(obj,z):
 bm=bmesh.new();bm.from_mesh(obj.data)
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,z),plane_no=(0,0,1),clear_outer=True)
 bm.to_mesh(obj.data);bm.free()

def section(obj,z):
 bm=bmesh.new();bm.from_mesh(obj.data)
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,z),plane_no=(0,0,1),clear_outer=True)
 es=[e for e in bm.edges if e.is_boundary and all(abs(v.co.z-z)<1e-6 for v in e.verts)];adj={}
 for e in es:
  for v in e.verts:adj.setdefault(v,[]).append(e.other_vert(v))
 components=[];remaining=set(adj)
 while remaining:
  first=next(iter(remaining));stack=[first];comp={first}
  while stack:
   for nxt in adj[stack.pop()]:
    if nxt not in comp:comp.add(nxt);stack.append(nxt)
  remaining-=comp;ends=[v for v in comp if len(adj[v])==1]
  cur=min(ends,key=lambda v:v.co.y) if ends else first;start=cur;prev=None;pts=[]
  while True:
   pts.append(cur.co.copy());ns=[n for n in adj[cur] if n!=prev and n!=start]
   if not ns:break
   prev,cur=cur,ns[0]
  components.append((pts,len(ends)==0))
 bm.free();return max(components,key=lambda c:len(c[0]))

def poly_sample(points,t):
 lengths=[0.]
 for a,b in zip(points,points[1:]):lengths.append(lengths[-1]+(b-a).length)
 length=max(0,min(1,t))*lengths[-1]
 for i in range(len(points)-1):
  if lengths[i+1]>=length:return points[i].lerp(points[i+1],(length-lengths[i])/max(1e-12,lengths[i+1]-lengths[i]))
 return points[-1].copy()

body_sections={z:section(body,z)[0] for z in [.045,.055,.065,.075,.085,.095,.105]}
tongue_sections={z:section(native_tongue,z)[0] for z in [.045,.055,.065,.075,.085,.095,.105]}

def at_height(sections,s,z):
 levels=sorted(sections)
 if z<=levels[0]:return poly_sample(sections[levels[0]],s)
 for lo,hi in zip(levels,levels[1:]):
  if lo<=z<=hi:return poly_sample(sections[lo],s).lerp(poly_sample(sections[hi],s),(z-lo)/(hi-lo))
 p=poly_sample(sections[levels[-1]],s);p.z=z;return p

# Smooth open-U pattern around the ankle, broad enough for a real tongue.
# The last source quarter ended in a narrow lace slit: retaining that slit
# all the way up was the cause of the V6 pinched, spatula-like tongue.
ankle=[]
for i in range(25):
 q=i/24;ankle.append(Vector((.026+(.086-.026)*q,Y0-.0345-.001*math.sin(math.pi*q),0)))
for i in range(1,65):
 angle=-math.pi/2+math.pi*i/64
 ankle.append(Vector((.086+.030*math.cos(angle),Y0+.0345*math.sin(angle),0)))
for i in range(1,25):
 q=i/24;ankle.append(Vector((.086+(.026-.086)*q,Y0+.0345+.0008*math.sin(math.pi*q),0)))

def hinge(s):
 p=poly_sample(ankle,s);p.z=.093+.012*math.sin(math.pi*s)**.65;return p

def lower_quarter(s,q):
 top=hinge(s);z=ROOT_Z+(top.z-ROOT_Z)*q
 original=at_height(body_sections,s,z)
 target=Vector((top.x,top.y,z))
 blend=smooth((z-.064)/max(.012,top.z-.064))
 p=original.lerp(target,blend);p.z=z
 # Open the throat ahead of the lace returns. The original narrow quarter
 # crossed the wide native straps when lofted into the new high panel.
 front=g(s,0,.10)+g(s,1,.10)
 p.x+=.009*front*smooth((z-ROOT_Z)/.010)*(1-smooth((z-.069)/.012))
 # Local textile relaxation, no blanket sinusoidal sleeve.
 relax=.0008*math.sin(s*13+.7)*g(z,.077,.012)*math.sin(math.pi*s)
 tangent=poly_sample(ankle,min(1,s+.02))-poly_sample(ankle,max(0,s-.02));n=Vector((tangent.y,-tangent.x,0)).normalized()
 return p+n*relax

def outward(s):
 a=poly_sample(ankle,min(1,s+.025))-poly_sample(ankle,max(0,s-.025))
 return Vector((a.y,-a.x,0)).normalized()

def seam_levels(s):
 back=math.sin(math.pi*s)
 return .50-.17*back+.014*g(s,.37,.10)-.010*g(s,.74,.12),.77-.08*back-.015*g(s,.61,.12)

def cuff_folded(s,t):
 p=hinge(s);n=outward(s)
 r=.0038+.0012*math.sin(math.pi*s)
 turn=.20
 if t<=turn:
  theta=math.pi*t/turn
  return p+n*(r*(1-math.cos(theta)))+Vector((0,0,r*math.sin(theta)))
 q=(t-turn)/(1-turn)
 # The lower FRONT corners really reach down near the foxing. The rear hem
 # stays higher: this is a diagonal garment panel, not a circular ring.
 hem=.0125+.0425*math.sin(math.pi*s)**.72+.0015*math.sin(s*11)*math.sin(math.pi*s)
 z=p.z+(hem-p.z)*q
 seam1,seam2=seam_levels(s)
 # Two broad padded zones with actual recessed stitch channels.
 channel1=g(q,seam1,.075);channel2=g(q,seam2,.075)
 puff=.0018*(1-channel1)*(1-channel2)*smooth(q/.15)*(1-.20*smooth((q-.91)/.09))
 # Broad, shallow quilt channels leave enough curvature radius for the
 # thickness on the reverse. Tight V6 grooves folded the inner shell back
 # through itself and made the cloth look like stacked rubber tubes.
 out=2*r+.0035*q+puff-.00030*(channel1+channel2)
 out+=.00055*math.sin(s*15+.7)*g(q,.80,.24)*math.sin(math.pi*s)
 # Sparse broad pressure creases: the rear and each side collapse
 # differently. These are shape deformations, never a printed fold image.
 out-=.00070*g(s,.40,.080)*g(q,.45+.24*(s-.4),.13)
 out-=.00085*g(s,.66,.085)*g(q,.73-.25*(s-.66),.12)
 out-=.00065*g(s,.18,.070)*g(q,.54+.4*(s-.18),.13)
 out-=.00060*g(s,.83,.075)*g(q,.63-.35*(s-.83),.14)
 point=p+n*out;point.z=z
 front=g(s,0,.27)+g(s,1,.27)
 point.x+=.045*front*q**1.06
 point.y+=.0008*math.sin(s*8+.5)*q*q
 return point

def cuff_upright(s,t):
 p=hinge(s);n=outward(s)
 top=.200+.0045*math.sin(math.pi*s)-.002*g(s,.12,.17)
 p.z=p.z+(top-p.z)*t
 p.x-=.006*t
 p+=n*(.002*t+.0009*math.sin(s*10+.3)*g(t,.65,.28))
 # The untied quarters open a little, rather than clamping the tongue.
 p.y-=.004*math.cos(math.pi*s)*(g(s,0,.2)+g(s,1,.2))*smooth(t/.4)
 return p

def shaft(s,v,up=False):
 if v<=BASE:return lower_quarter(s,v/BASE)
 t=(v-BASE)/(1-BASE)
 return cuff_upright(s,t) if up else cuff_folded(s,t)
shaft_fold=lambda s,v:shaft(s,v,False)
shaft_up=lambda s,v:shaft(s,v,True)

def shaft_thickness(s,v):
 if v<=BASE:return .00115
 t=(v-BASE)/(1-BASE)
 q=max(0,(t-.20)/.80)
 seam1,seam2=seam_levels(s)
 # Real inner padding; the upright outer printed face remains smooth.
 border=smooth(s/.10)*smooth((1-s)/.10)*smooth((1-t)/.055)
 quilting=(1-.5*g(q,seam1,.075))*(1-.5*g(q,seam2,.075))
 return .0011+.00065*border*quilting*smooth(t/.23)

# Reconstruct the WHOLE long tongue, keeping only its fitted native toe-vamp.
# The lower instep uses the genuine source sections. Above the laces it opens
# smoothly into a nearly constant-width textile, not a narrow-necked apron.
TONGUE_Z=.102
source_center={z:min(p.x for p in pts) for z,pts in tongue_sections.items()}

def tongue_lower(s,q):
 z=ROOT_Z+(TONGUE_Z-ROOT_Z)*q
 native=at_height(tongue_sections,s,z)
 u=s*2-1
 center_x=at_height(tongue_sections,.5,z).x
 flat=Vector((center_x+.0035*u*u,Y0+u*.0325,z))
 a=smooth((z-.064)/.033)
 p=native.lerp(flat,a);p.z=z
 # The original tongue passes under the quarter, inside its lacing gate.
 # Keep that layer order while opening into the broad free tongue.
 clearance=smooth((z-ROOT_Z)/.009)*(1-smooth((z-.088)/.014))
 p.y=Y0+(p.y-Y0)*(1-.11*clearance)
 p.x+=.0018*clearance
 return p

def tongue_fold(s,v):
 if v<=HINGE_T:return tongue_lower(s,v/HINGE_T)
 t=(v-HINGE_T)/(1-HINGE_T);u=s*2-1
 # Trim the cloth pattern along its curved centreline to round the end.
 # Adding XYZ offsets at the last corner made the edge double back and
 # caused the thickness to intersect. This monotone reparameterisation
 # gives a real rounded outline without reversing any longitudinal row.
 corner=1-math.sqrt(max(0,1-(max(0,abs(u)-.72)/.28)**2))
 t-=.075*corner*smooth((t-.76)/.24)
 # Same wide cloth, with a compact returning roll just above the throat.
 p0=tongue_lower(s,1);root_x=at_height(tongue_sections,.5,TONGUE_Z).x
 nodes=[Vector((root_x,TONGUE_Z)),Vector((root_x+.001,.110)),Vector((root_x-.010,.113)),Vector((-.010,.091)),Vector((-.031,.062)),Vector((-.046,.046))]
 f=t*(len(nodes)-1);i=min(int(f),len(nodes)-2);a=f-i
 pa,pb,pc,pd=[nodes[max(0,min(len(nodes)-1,k))] for k in [i-1,i,i+1,i+2]]
 c=.5*(2*pb+(-pa+pc)*a+(2*pa-5*pb+4*pc-pd)*a*a+(-pa+3*pb-3*pc+pd)*a*a*a)
 # Rounded rectangular free corners, never a pointed oval.
 width=.0325+.0015*smooth(t/.35)-.0015*smooth((t-.90)/.10)
 p=Vector((c.x+.0035*u*u*(1-smooth(t/.22)),Y0+u*width,c.y))
 # Soft transverse camber: broad canvas drapes over the laces.
 p.x-=.0045*(1-u*u)*g(t,.65,.35)
 p.z+=.0030*(1-u*u)*g(t,.65,.30)+.0008*math.sin(3*u+.6)*g(t,.80,.16)
 if t<.1:p=p0.lerp(p,smooth(t/.10));p.z=c.y
 return p

def tongue_up(s,v):
 if v<=HINGE_T:return tongue_lower(s,v/HINGE_T)
 t=(v-HINGE_T)/(1-HINGE_T);u=s*2-1
 corner=1-math.sqrt(max(0,1-(max(0,abs(u)-.72)/.28)**2))
 t-=.065*corner*smooth((t-.76)/.24)
 p0=tongue_lower(s,1)
 # A tall, gently cupped tongue close to the open shaft, not a free flat slab.
 z=TONGUE_Z+(.209-TONGUE_Z)*t-.0025*u*u*smooth(t/.7)
 x=p0.x-.004*t+.0018*(1-u*u)*math.sin(math.pi*t)
 y=Y0+u*(.0325+.0008*math.sin(math.pi*t))
 return Vector((x,y,z))

def tongue_thickness(s,v):
 u=2*s-1
 # The bound rounded tip is canvas, with padding tapering out before the
 # corner return. A thick offset at the very corner would invert its shell.
 return (.0012+.0008*(1-u*u)*smooth((v-HINGE_T)/.18))*(1-.55*smooth((v-.86)/.14))

def normal(fn,s,t):
 ds=fn(min(1,s+.0004),t)-fn(max(0,s-.0004),t)
 dt=fn(s,min(1,t+.0004))-fn(s,max(0,t-.0004))
 return ds.cross(dt).normalized()

def material(obj,name):obj.data.materials.clear();obj.data.materials.append(materials[name])
def uv_project(obj):
 uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='SurfaceUV')
 for poly in obj.data.polygons:
  for li in poly.loop_indices:
   p=obj.data.vertices[obj.data.loops[li].vertex_index].co;uv.data[li].uv=((p.x+.13)/.265,(p.z+.023)/.24)

cut_above(laces,.069);removed=clean_lace_scraps(laces)
lower_eyes=native_lace_anchors(body,laces)
lower_eyes=[(p,n,.0026) for p,n,_ in lower_eyes]
print('LACE_RETURN_FIT',fit_native_lace_returns(laces),flush=True)
print('LACE_CLEANUP',removed,'LOWER_EYES',[(list(p),list(n)) for p,n,r in lower_eyes],flush=True)
cut_above(body,ROOT_Z);cut_above(lining,ROOT_Z);cut_above(native_tongue,ROOT_Z)
material(lining,'Inner_Lining');material(native_tongue,'Tongue_Canvas');material(laces,'Laces')
for obj in [lining,native_tongue,laces]:uv_project(obj)
# Native outsole/toe remain actual original meshes. True moulded channel.
bm=bmesh.new();bm.from_mesh(body.data)
for z in [-.0138,-.0110,-.0104,-.0091,-.0085,.0068,.032]:
 bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,z),plane_no=(0,0,1))
for v in bm.verts:
 f=smooth((v.co.z+.0110)/.0006)*(1-smooth((v.co.z+.0091)/.0006))
 if f:
  d=Vector((v.co.x-.005,v.co.y-Y0,0)).normalized();v.co-=d*.00045*f
for v in bm.verts:v.co.x+=.018*((v.co.y-Y0)/.045)**2
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(-.072,0,0),plane_no=(1,0,0))
for v in bm.verts:v.co.x-=.018*((v.co.y-Y0)/.045)**2
bm.to_mesh(body.data);bm.free()
for name in ['Body_Canvas','Body_Inner_Canvas','Rubber_Toe','Rubber_Foxing','Rubber_Outsole']:body.data.materials.append(materials[name])
for poly in body.data.polygons:
 p=sum((body.data.vertices[i].co for i in poly.vertices),Vector())/len(poly.vertices)
 poly.material_index=4 if p.z<-.0138 else 3 if p.z<.0068 else 2 if p.x+.018*((p.y-Y0)/.045)**2<-.072 and p.z<.032 else 0 if p.y<Y0 else 1
 poly.use_smooth=True
uv_project(body)
_cut_eyelet_holes(body,lower_eyes)

# Parametric cloth with one shared cut pattern/topology for both poses. Bake
# Subsurf/Solidify on BOTH endpoints, then add shape keys: modifiers cannot
# silently discard the morph targets during glTF export.
def add_key(obj,points):
 assert len(points)==len(obj.data.vertices)
 obj.shape_key_add(name='Basis');key=obj.shape_key_add(name=MORPH)
 for v,p in zip(key.data,points):v.co=p
 key.value=0

def panel(name,fn,up,rows,cols,roles,thickness,holes,kind):
 params=[(i/cols,j/rows) for j in range(rows+1) for i in range(cols+1)]
 points=[fn(s,t) for s,t in params];faces=[];face_uv=[];indices=[];removed=set()
 for j in range(rows):
  for i in range(cols):
   a=j*(cols+1)+i;ids=(a,a+1,a+cols+2,a+cols+1)
   mid=sum((points[k] for k in ids),Vector())/4
   skip=False
   for center,n,radius in holes:
    d=mid-center
    if abs(d.dot(n))<.0045 and (d-n*d.dot(n)).length<radius:skip=True;break
   if skip:removed.add((j,i))
 # A diagonal-only meeting of two holes leaves a four-face thickness edge
 # after Solidify. Join that tiny diagonal by removing its closest cell.
 changed=True
 while changed:
  changed=False
  for j in range(rows-1):
   for i in range(cols-1):
    cells=[(j,i),(j,i+1),(j+1,i),(j+1,i+1)]
    flags=[c in removed for c in cells]
    if flags in ([True,False,False,True],[False,True,True,False]):
     candidates=[c for c in cells if c not in removed]
     def distance(cell):
      jj,ii=cell;mid=fn((ii+.5)/cols,(jj+.5)/rows)
      return min((mid-center).length_squared for center,_,_ in holes)
     removed.add(min(candidates,key=distance));changed=True
 for j in range(rows):
  for i in range(cols):
   if (j,i) in removed:continue
   a=j*(cols+1)+i;ids=(a,a+1,a+cols+2,a+cols+1)
   faces.append(ids);face_uv.append([params[k] for k in ids])
   s=(i+.5)/cols;t=(j+.5)/rows
   indices.append((0 if s<.5 else 2) if kind=='shaft' and t<BASE else 4 if kind=='shaft' else 0)
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(points,[],faces);mesh.update()
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
 for role in roles:mesh.materials.append(materials[role])
 uv=mesh.uv_layers.new(name='SurfaceUV')
 for p,uvs,idx in zip(mesh.polygons,face_uv,indices):
  p.material_index=idx;p.use_smooth=True
  for li,co in zip(p.loop_indices,uvs):uv.data[li].uv=co
 group=obj.vertex_groups.new(name='Cloth_padding')
 max_thickness=.0035 if kind=='shaft' else .0021
 for i,(s,t) in enumerate(params):group.add([i],min(1,thickness(s,t)/max_thickness),'REPLACE')
 sub=obj.modifiers.new('Tailored smooth canvas','SUBSURF');sub.levels=1;sub.render_levels=1
 solid=obj.modifiers.new('Real layered textile','SOLIDIFY');solid.thickness=max_thickness;solid.offset=1 if kind=='tongue' else -1;solid.use_even_offset=False;solid.vertex_group=group.name;solid.thickness_vertex_group=0;solid.material_offset=1;solid.material_offset_rim=1
 dg=bpy.context.evaluated_depsgraph_get();dg.update()
 folded=bpy.data.meshes.new_from_object(obj.evaluated_get(dg),depsgraph=dg)
 for v,(s,t) in zip(mesh.vertices,params):v.co=up(s,t)
 mesh.update();dg.update();upright=bpy.data.meshes.new_from_object(obj.evaluated_get(dg),depsgraph=dg)
 assert len(folded.vertices)==len(upright.vertices)
 assert all(tuple(a.vertices)==tuple(b.vertices) for a,b in zip(folded.polygons,upright.polygons))
 target=[v.co.copy() for v in upright.vertices];bpy.data.meshes.remove(upright)
 obj.modifiers.clear();obj.data=folded;bpy.data.meshes.remove(mesh);add_key(obj,target)
 return obj

# Five descending eyelets on each upper flap, not the old four-eye ring.
cuff_eye_params=[(s,BASE+(1-BASE)*(.20+.80*q)) for s in [.032,.968] for q in [.15,.33,.51,.69,.87]]
tongue_eye_params=[(.18,.966),(.82,.966)]

def holes_for(fn,params,r):return [(fn(s,t),normal(fn,s,t),r) for s,t in params]
upper_holes=holes_for(shaft_fold,cuff_eye_params,.00260)
shaft_holes=upper_holes+[(p,n,r+.00008) for p,n,r in lower_eyes]
shaft_obj=panel('Convertible_Shaft',shaft_fold,shaft_up,112,96,['Body_Canvas','Inner_Lining','Body_Inner_Canvas','Inner_Lining','Collar_Outer_Canvas','Collar_Canvas'],shaft_thickness,shaft_holes,'shaft')
tongue_obj=panel('Convertible_Tongue',tongue_fold,tongue_up,112,80,['Tongue_Reverse_Canvas','Tongue_Canvas'],tongue_thickness,holes_for(tongue_fold,tongue_eye_params,.0022),'tongue')

# One hardware object per garment, with corresponding endpoint positions.
def morph_eyes(name,fn,up,params,r,thickness):
 def anchors(surface):
  side=1 if fn==tongue_fold else -1
  return [(surface(s,t)+normal(surface,s,t)*thickness(s,t)*.5*side,normal(surface,s,t),r) for s,t in params]
 obj=create_eyelets(anchors(fn),materials['Eyelets'],name)
 tmp=create_eyelets(anchors(up),materials['Eyelets'],name+'_UP_TEMP')
 add_key(obj,[v.co.copy() for v in tmp.data.vertices]);bpy.data.objects.remove(tmp,do_unlink=True)
 return obj
morph_eyes('Convertible_Upper_Eyelets',shaft_fold,shaft_up,cuff_eye_params,.0026,shaft_thickness)
morph_eyes('Convertible_Tongue_Eyelets',tongue_fold,tongue_up,tongue_eye_params,.0022,tongue_thickness)
create_eyelets(lower_eyes,materials['Eyelets'],'Lower_Shoe_Eyelets')
enhance_source_details(body,laces,materials,add_eyelets=False,add_bow=False)
create_draped_lace_ends(lower_eyes,materials['Laces'],body)

# Rolled binding, two quilt seam channels, real interrupted stitching. New
# curves are sampled from the same cloth pattern in both endpoint poses.
def tube_points(points,radius,sides=8):
 verts=[];faces=[];uvs=[]
 for j,p in enumerate(points):
  tangent=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized()
  ref=Vector((0,0,1)) if abs(tangent.z)<.94 else Vector((0,1,0))
  a=tangent.cross(ref).normalized();b=tangent.cross(a).normalized()
  for k in range(sides):verts.append(p+radius*(math.cos(k*math.tau/sides)*a+math.sin(k*math.tau/sides)*b))
 for j in range(len(points)-1):
  for k in range(sides):
   faces.append((j*sides+k,j*sides+(k+1)%sides,(j+1)*sides+(k+1)%sides,(j+1)*sides+k))
   uvs.append(((k/sides,j/(len(points)-1)),((k+1)/sides,j/(len(points)-1)),((k+1)/sides,(j+1)/(len(points)-1)),(k/sides,(j+1)/(len(points)-1))))
 faces.extend([tuple(range(sides-1,-1,-1)),tuple((len(points)-1)*sides+k for k in range(sides))]);uvs.extend([[(k/sides,0) for k in range(sides)],[(k/sides,1) for k in range(sides)]])
 return verts,faces,uvs

def tubes(name,segments,mat,morph=True):
 vs=[];fs=[];uvs=[];target=[]
 for points,up,radius in segments:
  v,f,uv=tube_points(points,radius);offset=len(vs);vs.extend(v);fs.extend([tuple(i+offset for i in poly) for poly in f]);uvs.extend(uv)
  target.extend(tube_points(up,radius)[0] if up is not None else v)
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update();obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);material(obj,mat)
 uv=mesh.uv_layers.new(name='SurfaceUV')
 for p,co in zip(mesh.polygons,uvs):
  p.use_smooth=True
  for li,u in zip(p.loop_indices,co):uv.data[li].uv=u
 if morph:add_key(obj,target)
 return obj

def inner_point(fn,thickness,s,t,extra=.00012):
 side=1 if fn in [tongue_fold,tongue_up] else -1
 return fn(s,t)+normal(fn,s,t)*(thickness(s,t)+extra)*side
def binding_point(fn,thickness,s,t):
 side=1 if fn in [tongue_fold,tongue_up] else -1
 return fn(s,t)+normal(fn,s,t)*thickness(s,t)*.5*side
bindings=[];stitches=[];quilts=[]
for fn,up,thickness in [(shaft_fold,shaft_up,shaft_thickness),(tongue_fold,tongue_up,tongue_thickness)]:
 bindings.append(([binding_point(fn,thickness,i/150,1) for i in range(151)],[binding_point(up,thickness,i/150,1) for i in range(151)],.00065))
 for s in [0,1]:bindings.append(([binding_point(fn,thickness,s,j/180) for j in range(181)],[binding_point(up,thickness,s,j/180) for j in range(181)],.00050))
 for s in [.021,.979]:
  for j in range(72):
   a=.07+j*.0127;b=a+.0062
   if b>.99:break
   stitches.append(([inner_point(fn,thickness,s,a),inner_point(fn,thickness,s,b)],[inner_point(up,thickness,s,a),inner_point(up,thickness,s,b)],.00011))
 for i in range(76):
  a=.025+i*.0124;b=a+.006
  stitches.append(([inner_point(fn,thickness,a,.981),inner_point(fn,thickness,b,.981)],[inner_point(up,thickness,a,.981),inner_point(up,thickness,b,.981)],.00011))
# Wide padded partitions: stitch location is a stable garment coordinate.
for index in [0,1]:
 params=[]
 for i in range(161):
  s=.045+.91*i/160;q=seam_levels(s)[index];t=BASE+(1-BASE)*(.20+.80*q);params.append((s,t))
 quilts.append(([inner_point(shaft_fold,shaft_thickness,s,t) for s,t in params],[inner_point(shaft_up,shaft_thickness,s,t) for s,t in params],.00019))
tubes('Garment_Binding',bindings,'Canvas_Trim')
tubes('Garment_Stitching',stitches,'Stitching')
tubes('Quilt_Seam_Channels',quilts,'Stitching')
# Back seam strip actually follows the new quarter, never a floating plate.
back=[];backup=[]
for j in range(61):
 v=BASE*j/60
 p=shaft_fold(.5,v);p+=normal(shaft_fold,.5,v)*.0006;back.append(p)
 backup.append(back[-1].copy())
tubes('Heel_Seam_Stitch',[(back,backup,.00022)],'Heel_Strip')

for obj in bpy.context.scene.objects:
 if obj.type=='MESH':
  obj['part']=obj.name;obj['independent_color_and_print']=True
  obj['construction']='One assembled shoe; shared cloth cut pattern, independent semantic materials and two endpoint poses'
  for poly in obj.data.polygons:poly.use_smooth=True
for obj,reference in [(body,source_body_normals),(shaft_obj,source_body_normals),(native_tongue,source_tongue_normals),(tongue_obj,source_tongue_normals)]:
 blend_root_normals(obj,reference)
models=[o for o in bpy.context.scene.objects if o.type=='MESH']
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene['source_sha256']=HASH
scene['credit']='theunclerulez / Generic Converse style Sneakers / CC BY 4.0; source foot retained, quarters/tongue/lace details rebuilt; source artwork removed'
scene['design']='V7 reference refinement: continuous full quarter, five upper eyes, two padded seam bands, continuous wide tongue. Two estimated poses, not a cloth simulation.'
bpy.ops.object.select_all(action='DESELECT')
for obj in models:obj.select_set(True)
bpy.context.view_layer.objects.active=body
out=R/'public/assets/soulgrain_onward_refined_v7.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=False,export_extras=True,export_texcoords=True,export_morph=True,export_morph_normal=True)
bpy.ops.wm.save_as_mainfile(filepath=str(O/'soulgrain_onward_refined_v7.blend'),compress=True)
assert hashlib.sha256(S.read_bytes()).hexdigest()==HASH
print('V7_READY',out.stat().st_size,flush=True)
