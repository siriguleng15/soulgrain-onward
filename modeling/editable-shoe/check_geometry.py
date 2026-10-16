"""Read-only validation of newly exported/editable cloth; source data never edited."""
import bpy,math,json,sys,time
from mathutils.bvhtree import BVHTree
from pathlib import Path
project=Path(__file__).with_name('soulgrain_onward_editable_v5.blend')
bpy.ops.wm.open_mainfile(filepath=str(project))
depsgraph=bpy.context.evaluated_depsgraph_get()

def sub(a,b):return tuple(x-y for x,y in zip(a,b))
def cross(a,b):return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def dot(a,b):return sum(x*y for x,y in zip(a,b))
def segment_enters_triangle(p,q,a,b,c):
 # Proper interior crossing; ignore boundary/adjacent/coplanar contacts.
 direction=sub(q,p);e1=sub(b,a);e2=sub(c,a);h=cross(direction,e2);det=dot(e1,h)
 if abs(det)<1e-19:return False
 inv=1.0/det;s=sub(p,a);u=inv*dot(s,h)
 if not 1e-5<u<1-1e-5:return False
 r=cross(s,e1);v=inv*dot(direction,r)
 if v<1e-5 or u+v>1-1e-5:return False
 t=inv*dot(e2,r)
 return 1e-5<t<1-1e-5

def qa(obj):
 start=time.time();evaluated=obj.evaluated_get(depsgraph);mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
 pts=[tuple(obj.matrix_world@v.co) for v in mesh.vertices]
 faces=[tuple(t.vertices) for t in mesh.loop_triangles]
 edges={}
 for p in mesh.polygons:
  ids=list(p.vertices)
  for a,b in zip(ids,ids[1:]+ids[:1]):
   key=tuple(sorted((a,b)));edges[key]=edges.get(key,0)+1
 areas=[.5*math.sqrt(dot(cross(sub(pts[f[1]],pts[f[0]]),sub(pts[f[2]],pts[f[0]])),cross(sub(pts[f[1]],pts[f[0]]),sub(pts[f[2]],pts[f[0]])))) for f in faces]
 tree=BVHTree.FromPolygons(pts,faces,all_triangles=True,epsilon=1e-10)
 pairs=[(i,j) for i,j in tree.overlap(tree) if i<j and set(faces[i]).isdisjoint(faces[j])]
 true=[]
 for i,j in pairs:
  ta=[pts[k] for k in faces[i]];tb=[pts[k] for k in faces[j]]
  hit=any(segment_enters_triangle(ta[k],ta[(k+1)%3],*tb) for k in range(3)) or any(segment_enters_triangle(tb[k],tb[(k+1)%3],*ta) for k in range(3))
  if hit:true.append((i,j))
 truepts=[pts[v] for ij in true for i in ij for v in faces[i]]
 result={'vertices':len(pts),'triangles':len(faces),'boundary_edges':sum(n==1 for n in edges.values()),'nonmanifold_edges':sum(n!=2 for n in edges.values()),'zero_area_triangles':sum(a<1e-14 for a in areas),'smallest_triangle_area_m2':min(areas),'nonadjacent_bvh_contacts':len(pairs),'proper_self_crossings':len(true),'crossing_bounds':[[min(p[k] for p in truepts),max(p[k] for p in truepts)] for k in range(3)] if truepts else None,'elapsed_s':round(time.time()-start,2)}
 evaluated.to_mesh_clear();return result
result={'project':str(project),'project_bytes':project.stat().st_size,'project_mtime':project.stat().st_mtime,'blender':bpy.app.version_string,'panels':{}}
for name in ['Folded_Collar','Folded_Tongue']:
 result['panels'][name]=qa(bpy.data.objects[name]);print('QA_PANEL',name,json.dumps(result['panels'][name]),flush=True)
assert all(all(panel[k]==0 for k in ['boundary_edges','nonmanifold_edges','zero_area_triangles','proper_self_crossings']) for panel in result['panels'].values()),'Fabric geometry requires correction'
print('QA_END',flush=True)
