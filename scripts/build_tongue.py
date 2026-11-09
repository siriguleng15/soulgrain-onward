from pathlib import Path
import sys,json,io,numpy as np
R=Path(__file__).resolve().parents[1];sys.path[:0]=[str(R/'python'),'/workspace/artifacts/glb-texture-transfer-v1/python']
import cv2,triangle,trimesh
from shapely.geometry import Polygon
from shapely import contains_xy
from scipy.ndimage import map_coordinates,distance_transform_edt,gaussian_filter
from scipy.interpolate import CubicSpline,PchipInterpolator
from trimesh.ray.ray_pyembree import RayMeshIntersector
from PIL import Image
q=np.load(R/'data/source-body.npz');p=q['positions'];f=q['faces'];uv=q['uv'];mat=q['material'];ch=np.load(R/'data/source-chart.npz');mask=ch['mask'].astype('u1');H=len(mask);O,N,T,W=[ch[k] for k in ['O','N','T','W']];T0,T1,W0,W1=[float(ch[k]) for k in ['T0','T1','W0','W1']]
contours,hier=cv2.findContours(mask,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE);outeridx=max(range(len(contours)),key=lambda i:cv2.contourArea(contours[i]));holes=[c for i,c in enumerate(contours) if hier[0,i,3]==outeridx and cv2.contourArea(c)>600]
def coords(c):
 a=cv2.approxPolyDP(c,.65,True).reshape(-1,2).astype('f8');return np.column_stack([W0+a[:,0]/(H-1)*(W1-W0),T1-a[:,1]/(H-1)*(T1-T0)])
outer=coords(contours[outeridx]);holeloops=[coords(c) for c in holes];polygon=Polygon(outer,holeloops);assert polygon.is_valid
# Boundary points are retained by Triangle's Y option. Exactly two existing holes survive.
verts=[];segments=[];off=0
for loop in [outer]+holeloops:
 verts.extend(loop);segments.extend([[off+i,off+(i+1)%len(loop)] for i in range(len(loop))]);off+=len(loop)
data={'vertices':np.array(verts),'segments':np.array(segments),'holes':np.array([np.asarray(Polygon(h).representative_point().coords)[0] for h in holeloops])}
mesh2=triangle.triangulate(data,'pq22a0.000008Y');a=mesh2['vertices'];ff=mesh2['triangles'].astype('i4');signed=np.cross(a[ff[:,1]]-a[ff[:,0]],a[ff[:,2]]-a[ff[:,0]]);ff[signed<0]=ff[signed<0,::-1]
height=ch['depth'].copy();validmask=mask.astype(bool)&np.isfinite(height);nearest=distance_transform_edt(~validmask,return_distances=False,return_indices=True);height[~validmask]=height[tuple(nearest[:,~validmask])];height=gaussian_filter(height,.65)
field=np.load('/workspace/artifacts/glb-material-finish-v4/reports/tongue-surface-field.npz');rr,cc=np.meshgrid(np.linspace(0,767,H),np.linspace(0,767,H),indexing='ij');basefield=map_coordinates(field['base'],[rr,cc],order=1,mode='nearest');height=np.clip(height,basefield-.0005,basefield+.010)
def sample(field,wt,order=1):
 row=(T1-wt[:,1])/(T1-T0)*(H-1);col=(wt[:,0]-W0)/(W1-W0)*(H-1);return map_coordinates(field,[row,col],order=order,mode='nearest')
hh=sample(height,a);front=O+a[:,1,None]*T+a[:,0,None]*W+hh[:,None]*N
# Pick the upper perimeter chain. This joins the continuous under-lace leg to the preserved folded outline.
left=np.argmin(np.linalg.norm(outer-np.array([-.26,.15]),axis=1));right=np.argmin(np.linalg.norm(outer-np.array([.23,.24]),axis=1));chain1=[];k=left
while True:
 chain1.append(k)
 if k==right:break
 k=(k+1)%len(outer)
chain2=[];k=left
while True:
 chain2.append(k)
 if k==right:break
 k=(k-1)%len(outer)
chain=np.array(max([chain1,chain2],key=lambda ids:outer[ids,1].mean()),dtype='i4')
if a[chain[0],0]>a[chain[-1],0]:chain=chain[::-1]
A=front[chain];steps=np.linalg.norm(np.diff(a[chain],axis=0),axis=1);u=np.r_[0,np.cumsum(steps)];u/=u[-1];zcenter=float(np.median(A[:,2]));rootx=-.595;rootz=zcenter+(u-.5)*.22
ray=RayMeshIntersector(trimesh.Trimesh(p,f,process=False));orig=np.column_stack([np.full(len(u),rootx),np.full(len(u),.1),rootz]);ti,ri,loc=ray.intersects_id(orig,np.tile([0,-1,0],(len(u),1)),multiple_hits=True,return_locations=True);cross=np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]]);fn=cross/np.maximum(np.linalg.norm(cross,axis=1)[:,None],1e-30);rooty=np.full(len(u),-.14)
for j in range(len(u)):
 ids=np.flatnonzero((ri==j)&(loc[:,1]<-.10)&(loc[:,1]>-.19)&(fn[ti,1]>.35))
 if len(ids):rooty[j]=loc[ids[np.argmax(loc[ids,1])],1]-.001
rooty=np.polyval(np.polyfit(u,rooty,2),u)
root=np.column_stack([np.full(len(u),rootx),rooty,rootz]);centroids=p[f].mean(1);rootCandidate=(centroids[:,0]>-.66)&(centroids[:,0]<-.54)&(centroids[:,1]<-.105)&(centroids[:,1]>-.22)&(abs(centroids[:,2])<.18)&(fn[:,1]>.35)&(mat==0);rootFaces=np.flatnonzero(rootCandidate);rootSurface,rootDistance,rootTriangle=trimesh.proximity.closest_point(trimesh.Trimesh(p,f[rootFaces],process=False),root);rootSourceFace=rootFaces[rootTriangle];root=rootSurface+fn[rootSourceFace]*.0003;rootBary=trimesh.triangles.points_to_barycentric(p[f[rootSourceFace]],rootSurface)
third=np.column_stack([np.full(len(u),-.01),.26+.035*(u-.5),zcenter+(u-.5)*.42]);fourth=np.column_stack([np.full(len(u),-.16),.09+np.zeros(len(u)),zcenter+(u-.5)*.34]);fifth=np.column_stack([np.full(len(u),-.36),-.115+np.zeros(len(u)),zcenter+(u-.5)*.28])
from scipy.ndimage import gaussian_filter1d
smoothA=np.column_stack([np.polyval(np.polyfit(u,A[:,k],3),u) for k in range(3)]);knots=np.stack([A,A+T*.005-N*.025,A+T*.002-N*.050,smoothA-T*.030-N*.070,third,fourth,fifth,root]);param=np.array([0,.055,.12,.20,.37,.58,.80,1.]);r=np.unique(np.r_[np.linspace(0,1,110),param]);basis=np.column_stack([W,T,N]);local=(knots-O)@basis;extension=O+PchipInterpolator(param,local,axis=0)(r)@basis.T
points=front.tolist();extids=np.empty((len(r),len(chain)),'i4');extids[0]=chain
for i in range(1,len(r)):
 extids[i]=np.arange(len(points),len(points)+len(chain));points.extend(extension[i])
faces=ff.tolist();roles=[0]*len(ff)
for i in range(len(r)-1):
 for j in range(len(chain)-1):
  v0,v1,v2,v3=extids[i,j],extids[i,j+1],extids[i+1,j+1],extids[i+1,j];faces.extend([[v0,v1,v2],[v0,v2,v3]]);roles.extend([1,1])
front=np.asarray(points,dtype='f8');faces=np.asarray(faces,'i4');roles=np.array(roles,'u1')
# Projection can place adjacent root samples on the same actual vamp vertex. Merge that exact contact, not the protected shoe.
_,first,inverse=np.unique(front,axis=0,return_index=True,return_inverse=True);order=np.argsort(first);rev=np.empty(len(order),'i4');rev[order]=np.arange(len(order));remap=rev[inverse];front=front[first[order]];faces=remap[faces];extids=remap[extids];chain=remap[chain];nonzero=np.linalg.norm(np.cross(front[faces[:,1]]-front[faces[:,0]],front[faces[:,2]]-front[faces[:,0]]),axis=1)>1e-14;faces=faces[nonzero];roles=roles[nonzero]
# Geometric normals orient the front, reverse normals orient the back. True rim walls close every edge, including both holes.
vm=trimesh.Trimesh(front,faces,process=False);vertexnorm=vm.vertex_normals;thickness=.0055;back=front-vertexnorm*thickness;back[:len(a)]=O+a[:,1,None]*T+a[:,0,None]*W+(sample(basefield,a)-thickness)[:,None]*N;back[chain]=front[chain]-(N+T)/np.linalg.norm(N+T)*thickness;npfront=len(front);allp=np.concatenate([front,back]);allf=np.concatenate([faces,faces[:,::-1]+npfront]);allrole=np.r_[roles,np.full(len(faces),2,'u1')]
edges=np.concatenate([faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]]);sortededges=np.sort(edges,axis=1);_,ei,count=np.unique(sortededges,axis=0,return_inverse=True,return_counts=True);boundary=edges[count[ei]==1];rims=[]
for x,y in boundary:rims.extend([[y,x,x+npfront],[y,x+npfront,y+npfront]])
allf=np.concatenate([allf,np.array(rims,'i4')]);allrole=np.r_[allrole,np.full(len(rims),3,'u1')]
baseuv=np.zeros((npfront,2),'f4');baseuv[:len(a)]=np.column_stack([(a[:,0]-W0)/(W1-W0),(T1-a[:,1])/(T1-T0)])
for i in range(1,len(r)):baseuv[extids[i]]=np.column_stack([u,np.full(len(u),r[i])])
alluv=np.concatenate([baseuv,baseuv]);assert np.isfinite(allp).all() and np.isfinite(alluv).all();tongue=trimesh.Trimesh(allp,allf,process=False)
# Explicit local change envelope: old tongue skin and immediate backing only. No protected part is moved or re-UVed.
c=p[f].mean(1);d=c-O;wt=np.column_stack([d@W,d@T]);h=d@N;expected=sample(height,wt);within=contains_xy(polygon.buffer(.004),wt[:,0],wt[:,1]);audit=np.load('/workspace/artifacts/onward-structure-audit-20261109/data/inspection-mesh.npz');oldlabel=audit['labels'][:len(f)];oldtongue=(oldlabel==6);backing=within&(h>expected-np.where(wt[:,1]>.10,.15,.065))&(h<expected+.065)&(c[:,1]>.03)&(c[:,0]<.21)&np.isin(mat,[0,9]);protected=np.isin(oldlabel,[1,2,3,4,5,7,8]);remove=(oldtongue|backing)&~protected;assert not np.any(remove&protected)
# Keep lace triangles exactly, split only for a debug visibility node. Uncertain low surfaces remain with the shoe body.
rgb=audit['centroidRGB'][:len(f)];lacezone=(c[:,0]>-.63)&(c[:,0]<.10)&(c[:,1]>-.16)&(c[:,1]<.31)&(c[:,1]>.65*c[:,0]+.115)&(abs(c[:,2])<.235);lace=lacezone&(~remove)&(mat==0)
np.savez_compressed(R/'data/tongue-rebuilt.npz',positions=allp.astype('f4'),faces=allf,uv=alluv,role=allrole,normals=tongue.vertex_normals.astype('f4'),frontVertexCount=npfront,frontFaceCount=len(faces),upperVertexCount=len(a),foldBoundary=chain,rootFront=extids[-1],rootAnchorSurface=rootSurface,rootAnchorSourceFace=rootSourceFace,rootAnchorBarycentric=rootBary,thickness=thickness,extensionIds=extids,extensionParam=r,sourceRemove=remove,debugLace=lace)
# Faithful surface-color/MR resampling into a new tongue-only chart; original embedded images remain untouched.
for name,key in [('tongue-front-basecolor.png','rgb'),('tongue-front-metallic-roughness.png','mr')]:
 arr=ch[key].copy();arr[~mask.astype(bool)]=arr[tuple(nearest[:,~mask.astype(bool)])];Image.fromarray(arr).save(R/'data'/name)
report={'status':'V5.1 test; root seam position requires confirmation','sourceUpperReference':'V4 sampled shape, two original holes, edge outline and color/material values','holes':len(holeloops),'frontVertices':npfront,'triangles':len(allf),'thicknessModelUnits':thickness,'rootLineBounds':[root.min(0).tolist(),root.max(0).tolist()],'rootConfidence':'provisional throat/vamp surface attachment; no factory pattern provided','foldBoundaryVertexCount':len(chain),'watertight':bool(tongue.is_watertight),'windingConsistent':bool(tongue.is_winding_consistent),'connectedComponents':len(tongue.split(only_watertight=False)),'sourceFacesRemoved':int(remove.sum()),'sourceFacesRemovedByMaterial':{int(m):int((remove&(mat==m)).sum()) for m in np.unique(mat)},'removedFaceCentroidBounds':[c[remove].min(0).tolist(),c[remove].max(0).tolist()],'debugLaceTrianglesNoShapeEdits':int(lace.sum()),'UVPolicy':'All retained V4 geometry keeps exact original attributes and image bytes. Reconstructed tongue has a dedicated UV chart resampled from V4, no redesigned artwork; new hidden leg/back have separate UV and plain matching cloth.','noOtherDesignChanges':True}
(R/'reports/construction.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)
