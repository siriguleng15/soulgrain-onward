"""UV evaluation on the actual V7 mesh, including both endpoint poses.
No V3/V4/V5/V6/V7 generation script is executed by this finishing pipeline.
"""
import bpy, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform

MORPH='Shaft_Upright'

class Surface:
 def __init__(self,obj,material_names):
  self.obj=obj;mesh=obj.data;mesh.calc_loop_triangles();uv=mesh.uv_layers.active
  self.ids=[];self.uv=[];self.vertices=[]
  for tri in mesh.loop_triangles:
   if mesh.materials[tri.material_index].name not in material_names:continue
   us=[Vector((*uv.data[i].uv,0)) for i in tri.loops]
   if (us[1]-us[0]).cross(us[2]-us[0]).length<1e-12:continue
   self.ids.append(tuple(tri.vertices));self.uv.append(us)
   self.vertices.extend(us)
  self.tree=BVHTree.FromPolygons(self.vertices,[tuple(range(i*3,i*3+3)) for i in range(len(self.ids))],all_triangles=True)
  self.poses=[[v.co.copy() for v in mesh.vertices]]
  key=mesh.shape_keys and mesh.shape_keys.key_blocks.get(MORPH)
  self.poses.append([v.co.copy() for v in key.data] if key else self.poses[0])
 def sample(self,s,t,pose=0):
  q,_,idx,_=self.tree.find_nearest(Vector((s,t,0)))
  tri=[self.poses[pose][i] for i in self.ids[idx]]
  point=barycentric_transform(q,*self.uv[idx],*tri)
  normal=(tri[1]-tri[0]).cross(tri[2]-tri[0]).normalized()
  return point,normal
 def frame(self,s,t,pose=0):
  p,n=self.sample(s,t,pose)
  a=(self.sample(s+.0005,t,pose)[0]-self.sample(s-.0005,t,pose)[0]).normalized()
  b=n.cross(a).normalized()
  return p,a,b,n

class Builder:
 def __init__(self,name,materials,morph=False):
  self.name=name;self.materials=materials;self.morph=morph
  self.v=[];self.up=[];self.faces=[];self.uv=[];self.mi=[];self.smooth=[]
 def add(self,vertices,faces,uv=None,material=0,upright=None,smooth=True):
  off=len(self.v);self.v.extend(vertices);self.up.extend(upright if upright is not None else vertices)
  for i,f in enumerate(faces):
   self.faces.append(tuple(off+k for k in f));self.mi.append(material);self.smooth.append(smooth)
   self.uv.append(uv[i] if uv else [(0,0)]*len(f))
 def finish(self):
  mesh=bpy.data.meshes.new(self.name);mesh.from_pydata(self.v,[],self.faces);mesh.update()
  obj=bpy.data.objects.new(self.name,mesh);bpy.context.collection.objects.link(obj)
  for m in self.materials:mesh.materials.append(m)
  uv=mesh.uv_layers.new(name='SurfaceUV')
  for p,coords,mi,smooth in zip(mesh.polygons,self.uv,self.mi,self.smooth):
   p.material_index=mi;p.use_smooth=smooth
   for loop,co in zip(p.loop_indices,coords):uv.data[loop].uv=co
  if self.morph:
   obj.shape_key_add(name='Basis');key=obj.shape_key_add(name=MORPH)
   for v,p in zip(key.data,self.up):v.co=p
   key.value=0
  obj['part']=self.name;obj['finish_version']='V8 from unchanged V7 base geometry'
  return obj

def tube(points,radius,sides=10):
 vs=[];fs=[];uvs=[]
 for j,p in enumerate(points):
  tangent=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized()
  ref=Vector((0,0,1)) if abs(tangent.z)<.95 else Vector((1,0,0))
  a=tangent.cross(ref).normalized();b=tangent.cross(a).normalized()
  for i in range(sides):vs.append(p+radius*(math.cos(i*math.tau/sides)*a+math.sin(i*math.tau/sides)*b))
 for j in range(len(points)-1):
  for i in range(sides):
   fs.append((j*sides+i,j*sides+(i+1)%sides,(j+1)*sides+(i+1)%sides,(j+1)*sides+i))
   uvs.append([(i/sides,j/(len(points)-1)),((i+1)/sides,j/(len(points)-1)),((i+1)/sides,(j+1)/(len(points)-1)),(i/sides,(j+1)/(len(points)-1))])
 return vs,fs,uvs

def stone(frame,radius,height=.00045,sides=8):
 p,a,b,n=frame;vs=[]
 for rad,h in [(radius,0),(radius*.92,height*.48),(radius*.53,height)]:
  for k in range(sides):
   angle=math.tau*k/sides
   vs.append(p+rad*(a*math.cos(angle)+b*math.sin(angle))+n*h)
 fs=[]
 for j in range(2):
  for k in range(sides):fs.append((j*sides+k,j*sides+(k+1)%sides,(j+1)*sides+(k+1)%sides,(j+1)*sides+k))
 fs.append(tuple(range(2*sides,3*sides)));fs.append(tuple(reversed(range(sides))))
 return vs,fs
