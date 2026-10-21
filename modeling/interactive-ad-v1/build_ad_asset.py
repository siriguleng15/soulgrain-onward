"""Advertising-only V8 derivative: exact rest mesh + developable cuff fields.

Blender 5.2.2 --background --threads 4 --python this_file.py
Never runs a shoe-generation script and never saves over a V7/V8 asset.
"""
import bpy,math,json,hashlib,sys,bisect
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
P=Path(__file__).resolve().parent;R=P.parents[1];OUT=R/'public/assets/onward-ad-v1';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=R/'modeling/finished-shoe-v8/soulgrain_onward_finished_v8.blend'
v8=R/'public/assets/soulgrain_onward_finished_v8.glb'
source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest();assert hashlib.sha256(v8.read_bytes()).hexdigest()=='9d28c469089cb039fd17393db7e84d7c46def77db4eeb04aa05deed8a32c6f63'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));bpy.context.preferences.filepaths.save_version=0
models=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in models:
 if o.data.shape_keys:
  for k in o.data.shape_keys.key_blocks:k.value=0
  o.shape_key_clear()
shaft=bpy.data.objects['Convertible_Shaft']
# Recover garment parameters from the exact, documented V8 material mapping.
lookup=bpy.data.objects.new('AD_UV_LOOKUP',shaft.data.copy())
for poly in lookup.data.polygons:
 if lookup.data.materials[poly.material_index].name not in ['Collar_Canvas','Collar_Outer_Canvas']:continue
 for li in poly.loop_indices:
  u,v=lookup.data.uv_layers.active.data[li].uv
  lookup.data.uv_layers.active.data[li].uv=(u/1.75,v/1.65+.38)
sys.path.insert(0,str(R/'modeling/finished-shoe-v8'))
from surface_tools import Surface
surface=Surface(lookup,['Collar_Canvas'])
world_tree=BVHTree.FromPolygons(surface.poses[0],surface.ids,all_triangles=True)
def param_of(p):
 q,_,index,_=world_tree.find_nearest(p)
 tri=[surface.poses[0][i] for i in surface.ids[index]]
 uv=barycentric_transform(q,*tri,*surface.uv[index]);return max(0,min(1,uv.x)),max(.38,min(1,uv.y))

N=256;centres=[surface.sample(i/(N-1),.75)[0] for i in range(N)];angles=[];arc=[0.]
for i in range(N):
 d=centres[min(N-1,i+1)]-centres[max(0,i-1)];a=math.atan2(d.y,d.x)
 if angles:
  while a-angles[-1]>math.pi:a-=math.tau
  while a-angles[-1]<-math.pi:a+=math.tau
 angles.append(a)
 if i:arc.append(arc[-1]+(centres[i]-centres[i-1]).xy.length)
def lerp_values(values,s):
 f=max(0,min(N-1,s*(N-1)));i=min(int(f),N-2);return values[i]*(1-(f-i))+values[i+1]*(f-i)
anchor_index=round(.18*(N-1));anchor_s=anchor_index/(N-1);anchor=centres[anchor_index].copy();anchor_angle=angles[anchor_index]
HEIGHT=.071
def basis(s):
 a=lerp_values(angles,s);t=Vector((math.cos(a),math.sin(a),0));n=Vector((math.sin(a),-math.cos(a),0));return lerp_values(centres,s),t,n
# Derive both seam stations from the V8 stitch-channel meshes, not new artwork.
quilt=bpy.data.objects['Quilt_Seam_Channels'];seams=[]
for row in range(2):
 values=[]
 for j in range(161):
  point=sum((quilt.data.vertices[row*1288+j*8+k].co for k in range(8)),Vector())/8
  s,v=param_of(point);values.append((s,v))
 values.sort();seams.append(values)
def seam_at(which,s):
 data=seams[which];xs=[p[0] for p in data];at=bisect.bisect_right(xs,s)
 if at==0:return data[0][1]
 if at>=len(data):return data[-1][1]
 a,b=data[at-1],data[at];w=(s-a[0])/max(1e-9,b[0]-a[0]);return a[1]*(1-w)+b[1]*w
def flat_section(s,v):
 if v<.504:
  a=max(0,min(1,(v-.38)/.124))*math.pi
  return -.002*(1+math.cos(a)),HEIGHT/2+.002*math.sin(a),0.
 knots=[.504,seam_at(0,s),seam_at(1,s),1.]
 k=max(0,min(2,bisect.bisect_right(knots,v)-1));q=(k+(v-knots[k])/max(1e-6,knots[k+1]-knots[k]))/3
 q=max(0,min(1,q));puff=.0014*math.sin(math.pi*3*q)**2
 slope=.0014*3*math.pi*math.sin(6*math.pi*q)/HEIGHT
 return puff,HEIGHT*(.5-q),slope
def sample_curve(progress):
 theta=[(a-anchor_angle)*(1-progress) for a in angles]
 # Rotate original anchor tangent gently into the final horizontal datum.
 theta=[a+anchor_angle*(1-progress) for a in theta]
 curve=[Vector((0,0,centres[i].z*(1-progress)+anchor.z*progress)) for i in range(N)]
 for i in range(1,N):
  d=arc[i]-arc[i-1];a=(theta[i]+theta[i-1])*.5
  curve[i].x=curve[i-1].x+d*math.cos(a);curve[i].y=curve[i-1].y+d*math.sin(a)
 shift=anchor-curve[anchor_index]
 for p in curve:p.x+=shift.x;p.y+=shift.y
 return curve,theta

# Vertex field = s, attachment v, flag. Flat = coordinates in (tangent,
# outward normal, vertical); no UV, material or rest-position changes.
fields={};stats=[]
def register(o,params,rigid_pivots=None):
 mesh=o.data;mesh.update();par=[];flat=[];norm=[]
 mids={}
 if rigid_pivots is None:
  for i,(s,v) in enumerate(params):
   key=(round(s,5),round(v,5));mids.setdefault(key,[]).append(mesh.vertices[i].co)
  mids={k:sum(values,Vector())/len(values) for k,values in mids.items()}
 for i,(s,v) in enumerate(params):
  p=mesh.vertices[i].co;c,t,n=basis(s);puff,z,slope=flat_section(s,v)
  if rigid_pivots is not None:
   pivot=rigid_pivots[i];delta=p-pivot
   dx=delta.dot(t);dn=puff+.001+delta.dot(n);dz=z+delta.z
  else:
   mid=mids[(round(s,5),round(v,5))];shell=(p-mid).dot(n)
   dx=0.;dn=puff+shell;dz=z
  vertex_n=mesh.vertices[i].normal.copy();sign=1 if vertex_n.dot(n)>=0 else -1
  if rigid_pivots is not None:
   normal=Vector((vertex_n.dot(t),vertex_n.dot(n),vertex_n.z)).normalized()
  else:normal=Vector((0,sign,sign*slope)).normalized()
  par.append((s,v,1));flat.append((dx,dn,dz));norm.append(tuple(normal))
 for name,values in [('_sg_param',par),('_sg_flat',flat),('_sg_normal',norm)]:
  attr=mesh.attributes.get(name) or mesh.attributes.new(name=name,type='FLOAT_VECTOR',domain='POINT')
  for item,value in zip(attr.data,values):item.vector=value
 o['adActor']='clasp' if 'Clasp' in o.name else 'cuff'
 fields[o.name]=(par,flat,norm);stats.append({'name':o.name,'vertices':len(mesh.vertices),'faces':len(mesh.polygons),'actor':o['adActor']})

def extract(o,face_indices,name):
 mesh=o.data;mesh.update();normal_data=[n.vector.copy() for n in mesh.corner_normals];uv=mesh.uv_layers.active
 remap={};vertices=[];faces=[];uvs=[];normals=[];mi=[]
 for pi in face_indices:
  poly=mesh.polygons[pi];face=[];coords=[]
  for li in poly.loop_indices:
   old=mesh.loops[li].vertex_index
   if old not in remap:remap[old]=len(vertices);vertices.append(mesh.vertices[old].co.copy())
   face.append(remap[old]);coords.append(uv.data[li].uv.copy());normals.append(normal_data[li])
  faces.append(face);uvs.append(coords);mi.append(poly.material_index)
 result=bpy.data.meshes.new(name);result.from_pydata(vertices,[],faces);result.update()
 for m in mesh.materials:result.materials.append(m)
 layer=result.uv_layers.new(name='SurfaceUV')
 for poly,coords,index in zip(result.polygons,uvs,mi):
  poly.material_index=index;poly.use_smooth=True
  for li,co in zip(poly.loop_indices,coords):layer.data[li].uv=co
 result.normals_split_custom_set(normals)
 obj=bpy.data.objects.new(name,result);bpy.context.collection.objects.link(obj)
 return obj,sorted(remap,key=remap.get)
def split(o,mask,name,param_list,pivots=None):
 moving=[p.index for p in o.data.polygons if mask(p)];moving_set=set(moving)
 other=[p.index for p in o.data.polygons if p.index not in moving_set]
 piece,ids=extract(o,moving,name)
 register(piece,[param_list[i] for i in ids],[pivots[i] for i in ids] if pivots else None)
 fixed,_=extract(o,other,o.name+'_Fixed');fixed['adActor']='shoe'
 bpy.data.objects.remove(o,do_unlink=True)

params=[None]*len(shaft.data.vertices)
for poly in lookup.data.polygons:
 if lookup.data.materials[poly.material_index].name not in ['Collar_Canvas','Collar_Outer_Canvas']:continue
 for li in poly.loop_indices:params[lookup.data.loops[li].vertex_index]=tuple(lookup.data.uv_layers.active.data[li].uv)
split(shaft,lambda p:shaft.data.materials[p.material_index].name in ['Collar_Canvas','Collar_Outer_Canvas'],'AD_Cuff_Shell',params)

for name,limit in [('Garment_Binding',4104),('Garment_Stitching',3520)]:
 o=bpy.data.objects[name];params=[(0,0)]*len(o.data.vertices);pivots=[Vector()]*len(o.data.vertices)
 if name=='Garment_Binding':
  groups=[(0,151),(1208,181),(2656,181)]
 else:groups=[(i*16,2) for i in range(220)]
 for group_index,(offset,count) in enumerate(groups):
  for j in range(count):
   idx=offset+j*8;center=sum((o.data.vertices[idx+k].co for k in range(8)),Vector())/8
   if name=='Garment_Binding':s,v=(j/150,1.) if group_index==0 else (0. if group_index==1 else 1.,j/180)
   elif group_index<144:
    side=0 if group_index<72 else 1;segment=group_index%72
    s,v=(.021 if side==0 else .979),.07+segment*.0127+j*.0062
   else:s,v=.025+(group_index-144)*.0124+j*.006,.981
   for k in range(8):params[idx+k]=(s,v);pivots[idx+k]=center
 split(o,lambda p:all(i<limit for i in p.vertices) and sum(params[i][1] for i in p.vertices)/len(p.vertices)>.383,'AD_'+name,params,pivots)

o=bpy.data.objects['Quilt_Seam_Channels'];params=[];pivots=[]
for row in range(2):
 for j in range(161):
  center=sum((o.data.vertices[row*1288+j*8+k].co for k in range(8)),Vector())/8;s,v=param_of(center)
  params.extend([(s,v)]*8);pivots.extend([center]*8)
register(o,params,pivots)

o=bpy.data.objects['Convertible_Upper_Eyelets'];params=[];pivots=[]
for side in [.032,.968]:
 for q in [.15,.33,.51,.69,.87]:
  center=sum((o.data.vertices[len(params)+k].co for k in range(320)),Vector())/320
  params.extend([(side,.38+.62*(.2+.8*q))]*320);pivots.extend([center]*320)
register(o,params,pivots)

o=bpy.data.objects['Cuff_Artwork_Borders'];params=[];pivots=[]
for vertex in o.data.vertices:
 s,v=param_of(vertex.co);params.append((s,v));pivots.append(vertex.co.copy())
register(o,params,pivots)

o=bpy.data.objects['Mongolian_Clasp_Loops'];params=[];pivots=[]
assert len(o.data.vertices)==2250
for s,v in [(.16,.73),(.16,.88)]:
 p,n=surface.sample(s,v);p+=n*.0013
 params.extend([(s,v)]*1125);pivots.extend([p]*1125)
register(o,params,pivots)
bpy.data.objects.remove(lookup,do_unlink=True)

# Save the source rest model and geometric construction metadata. All custom
# vectors are local frame coordinates; the metadata curve is explicitly Y-up.
to_yup=lambda p:[p.x,p.z,-p.y]
metadata={'version':1,'sourceCommit':'b169dde54caf700d2557dcfbafad6024c6ffe50b','sourceGLBSha256':hashlib.sha256(v8.read_bytes()).hexdigest(),'sourceBlendSha256':source_hash,'sampleCount':N,'anchorIndex':anchor_index,'height':HEIGHT,'length':arc[-1],'centerline':[to_yup(p) for p in centres],'angles':[-a for a in angles],'arc':arc,'anchor':to_yup(anchor),'seams':seams,'actors':stats,'method':'Arc-length-preserving horizontal centreline unbending; quilt channels define aligned thirds; exact V8 rest positions/UV/materials. The advertising release at the fold seam is an analytical decomposition, not a claim that the production cuff detaches.'}
(OUT/'cuff-structure.json').write_text(json.dumps(metadata,separators=(',',':')))
models=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in models:
 if 'adActor' not in o:o['adActor']='shoe'
 o['sourceCommit']=metadata['sourceCommit']
 for image in bpy.data.images:
  if image.size[0]>0 and not image.packed_file:
   try:image.pack()
   except RuntimeError:pass

# glTF transforms known positions/normals, but not arbitrary custom attributes.
# Bake the standard axis conversion explicitly and export already-Y-up data.
B2G=Matrix.Rotation(-math.pi/2,4,'X')
rest={o.name:[v.co.copy() for v in o.data.vertices] for o in models}
for o in models:o.data.transform(B2G)
bpy.ops.object.select_all(action='DESELECT')
for o in models:o.select_set(True)
bpy.context.view_layer.objects.active=models[0]
bpy.ops.export_scene.gltf(filepath=str(OUT/'onward-ad-v1.glb'),export_format='GLB',export_yup=False,export_apply=False,use_selection=True,export_extras=True,export_attributes=True,export_morph=False)
# Restore editable Z-up project; add three inspectable Blender endpoint poses.
for o in models:
 o.data.transform(B2G.inverted())
 for v,p in zip(o.data.vertices,rest[o.name]):v.co=p
 if o.name not in fields:continue
 o.shape_key_add(name='Basis');par,flat,_=fields[o.name]
 for amount in [1/3,2/3,1.]:
  curve,theta=sample_curve(amount);key=o.shape_key_add(name=f'AD_Unroll_{round(amount*100):03}')
  for i,vertex in enumerate(key.data):
   s,v,_=par[i];c,t,n=basis(s);d=rest[o.name][i]-c;base=Vector((d.dot(t),d.dot(n),d.z));local=base.lerp(Vector(flat[i]),amount)
   at=lerp_values(theta,s);T=Vector((math.cos(at),math.sin(at),0));Nn=Vector((math.sin(at),-math.cos(at),0))
   vertex.co=lerp_values(curve,s)+T*local.x+Nn*local.y+Vector((0,0,local.z))+Vector((0,-.014,.015))*amount
  key.value=0
bpy.context.scene['advertising_source']='V8 rest appearance unchanged; shader deformation fields and Blender review poses added in derivative only.'
bpy.ops.wm.save_as_mainfile(filepath=str(P/'onward_ad_v1_editable.blend'),compress=True)
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==source_hash
print('AD_ASSET_READY', (OUT/'onward-ad-v1.glb').stat().st_size, 'bytes',len(stats),'moving objects',flush=True)
