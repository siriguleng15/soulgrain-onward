"""Separate the user's cuff without replacing the hand or remaining robe.

Only writes derived assets. Boundary fields follow the actual hem curvature.
The newly exposed under-cuff robe is an explicit reconstruction, not scanned
manufacturing geometry. Source exterior triangle area is conserved.
"""
from pathlib import Path
import hashlib,json,struct
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from glb_writer import write_glb

ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;OUT=ROOT/'public/tongue-sleeve-lab/assets'

def source_mesh():
 path=OUT/'user-hand-original.glb';data=path.read_bytes();sha=hashlib.sha256(data).hexdigest();assert sha=='9608397f034b054b914c78f7bbf2a01404496045f2fc37d55efadf027c3b7637'
 size=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+size]);blob=data[28+size:]
 def read(i):
  a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];dt={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']];n={'VEC3':3,'SCALAR':1}[a['type']]
  return np.frombuffer(blob,dtype=dt,count=a['count']*n,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,n)
 primitive=g['meshes'][0]['primitives'][0]
 return read(primitive['attributes']['POSITION']).astype(float),read(primitive['attributes']['NORMAL']).astype(float),read(primitive['indices']).reshape(-1,3),sha

class Builder:
 def __init__(self,name,vertices,normals,faces,mask):
  self.name=name;ids,inverse=np.unique(faces[mask],return_inverse=True);self.positions=vertices[ids].tolist();self.normals=normals[ids].tolist();self.faces=inverse.reshape(-1,3).tolist();self.source_faces=np.flatnonzero(mask).tolist();self.lookup={tuple(np.round(vertices[i],9)):j for j,i in enumerate(ids)}
 def polygon(self,polygon,source_face):
  if len(polygon)<3:return
  ids=[]
  for vertex in polygon:
   key=tuple(np.round(vertex[:3],9));index=self.lookup.get(key)
   if index is None:
    index=len(self.positions);self.lookup[key]=index;self.positions.append(vertex[:3].tolist());n=vertex[3:6];self.normals.append((n/max(np.linalg.norm(n),1e-12)).tolist())
   ids.append(index)
  for i in range(1,len(ids)-1):
   if len({ids[0],ids[i],ids[i+1]})==3:self.faces.append([ids[0],ids[i],ids[i+1]]);self.source_faces.append(int(source_face))
 def arrays(self):return np.asarray(self.positions),np.asarray(self.normals),np.asarray(self.faces,dtype=np.uint32)

def clip(polygon,field,positive):
 result=[]
 for i,a in enumerate(polygon):
  b=polygon[(i+1)%len(polygon)];va=a[field]*(1 if positive else -1);vb=b[field]*(1 if positive else -1);inside=va>=0
  if inside:result.append(a)
  if inside!=(vb>=0):result.append(a+(b-a)*(va/(va-vb)))
 return result

def boundary_loops(faces):
 edges=np.sort(np.concatenate([faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]]),axis=1);edges,counts=np.unique(edges,axis=0,return_counts=True);adj={}
 for a,b in edges[counts==1]:adj.setdefault(int(a),[]).append(int(b));adj.setdefault(int(b),[]).append(int(a))
 assert all(len(v)==2 for v in adj.values()),'Cut boundary is not a closed loop'
 remaining=set(adj);loops=[]
 while remaining:
  first=min(remaining);walk=[first];previous=-1;current=first
  while True:
   options=adj[current];nxt=options[0] if options[0]!=previous else options[1]
   if nxt==first:break
   assert nxt not in walk,'Self-intersecting boundary traversal';walk.append(nxt);previous,current=current,nxt
  remaining.difference_update(walk);loops.append(walk)
 return loops

def orient_ring(points):
 area=np.sum(points[:,0]*np.roll(points[:,1],-1)-points[:,1]*np.roll(points[:,0],-1))
 if area<0:points=points[::-1]
 return np.roll(points,-int(np.argmin(points[:,0])),axis=0)

def resample(points,n=192):
 closed=np.concatenate([points,points[:1]]);length=np.linalg.norm(np.diff(closed,axis=0),axis=1);u=np.concatenate([[0],np.cumsum(length)]);u/=u[-1]
 return np.column_stack([np.interp(np.arange(n)/n,u,closed[:,k]) for k in range(3)]),u[:-1]

def normals_for(p,f):
 n=np.zeros_like(p);face=np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]])
 for k in range(3):np.add.at(n,f[:,k],face)
 return n/np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)

def robe_bridge(back,front):
 back=orient_ring(back);front=orient_ring(front);a,ua=resample(back);b,ub=resample(front);rings=[back];parameters=[ua]
 for t in np.linspace(0,1,13)[1:-1]:
  p=a*(1-t)+b*t;center=p.mean(0);p[:,:2]=center[:2]+(p[:,:2]-center[:2])*(1-.16*np.sin(np.pi*t));rings.append(p);parameters.append(np.arange(len(p))/len(p))
 rings.append(front);parameters.append(ub);vertices=np.concatenate(rings);starts=np.cumsum([0]+[len(r) for r in rings]);faces=[];uv=[]
 for k,ring in enumerate(rings):uv.extend([[float(u),k/(len(rings)-1)] for u in parameters[k]])
 for k in range(len(rings)-1):
  pa,pb=parameters[k],parameters[k+1];na,nb=len(pa),len(pb);i=j=0
  while i<na or j<nb:
   next_a=pa[(i+1)%na] if i+1<na else 1;next_b=pb[(j+1)%nb] if j+1<nb else 1
   if i<na and (j>=nb or next_a<=next_b):faces.append([starts[k]+i%na,starts[k]+(i+1)%na,starts[k+1]+j%nb]);i+=1
   else:faces.append([starts[k]+i%na,starts[k+1]+(j+1)%nb,starts[k+1]+j%nb]);j+=1
 f=np.asarray(faces,dtype=np.uint32);return vertices,normals_for(vertices,f),f,np.asarray(uv)

def area(p,f):return float(np.linalg.norm(np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]]),axis=1).sum()/2)

def main():
 vertices,normals,faces,sha=source_mesh();spec=json.loads((HERE/'separation-spec.json').read_text());assert spec['sourceSHA256']==sha
 a,b,c=spec['backPlaneZCoefficients'];back=vertices[:,2]-(a+b*vertices[:,0]+c*vertices[:,1]+spec['backOffset'])
 theta=np.arctan2(vertices[:,1]-spec['frontAngleCenter'][1],vertices[:,0]-spec['frontAngleCenter'][0]);co=spec['frontFourierCoefficients'];front_z=np.full(len(vertices),co[0])
 for k in range(1,4):front_z+=co[2*k-1]*np.cos(k*theta)+co[2*k]*np.sin(k*theta)
 front=vertices[:,2]-front_z
 masks={'Hand_Skin':front[faces].min(1)>=0,'Robe_Sleeve':back[faces].max(1)<=0,'Horseshoe_Cuff':(back[faces].min(1)>=0)&(front[faces].max(1)<=0)}
 builders={name:Builder(name,vertices,normals,faces,mask) for name,mask in masks.items()};handled=np.logical_or.reduce(list(masks.values()));data=np.column_stack([vertices,normals,back,front])
 for fi in np.flatnonzero(~handled):
  polygon=[data[i].copy() for i in faces[fi]]
  builders['Hand_Skin'].polygon(clip(polygon,7,True),fi);builders['Robe_Sleeve'].polygon(clip(polygon,6,False),fi)
  builders['Horseshoe_Cuff'].polygon(clip(clip(polygon,6,True),7,False),fi)
 arrays={name:builder.arrays() for name,builder in builders.items()}
 # An implicit cut can graze folds at the cuff lip. Those disconnected caps
 # belong to the cuff, not to extra floating fragments of the hand.
 hp,hn,hf=arrays['Hand_Skin'];edges=np.concatenate([hf[:,[0,1]],hf[:,[1,2]],hf[:,[2,0]]]);graph=coo_matrix((np.ones(len(edges)),(edges[:,0],edges[:,1])),shape=(len(hp),len(hp)))
 nc,labels=connected_components(graph,directed=False);main_label=int(np.argmax(np.bincount(labels)));keep=labels[hf[:,0]]==main_label;fold_caps=int((~keep).sum())
 if fold_caps:
  cp,cn,cf=arrays['Horseshoe_Cuff'];cap_faces=hf[~keep]+len(cp);p=np.concatenate([cp,hp]);n=np.concatenate([cn,hn]);f=np.concatenate([cf,cap_faces])
  _,ids,inverse=np.unique(np.round(p,9),axis=0,return_index=True,return_inverse=True);wp,wn,wf=p[ids],n[ids],inverse[f];used,remap=np.unique(wf,return_inverse=True);arrays['Horseshoe_Cuff']=(wp[used],wn[used],remap.reshape(-1,3).astype(np.uint32))
  ids,inverse=np.unique(hf[keep],return_inverse=True);arrays['Hand_Skin']=(hp[ids],hn[ids],inverse.reshape(-1,3).astype(np.uint32))
  hand_sources=np.asarray(builders['Hand_Skin'].source_faces);builders['Horseshoe_Cuff'].source_faces.extend(hand_sources[~keep].tolist());builders['Hand_Skin'].source_faces=hand_sources[keep].tolist()
 source_area=area(vertices,faces);split_area=sum(area(p,f) for p,n,f in arrays.values());assert abs(split_area-source_area)/source_area<1e-9,'Original exterior area was lost'
 hand=arrays['Hand_Skin'];robe=arrays['Robe_Sleeve'];cuff=arrays['Horseshoe_Cuff'];hand_loops=boundary_loops(hand[2]);robe_loops=boundary_loops(robe[2]);cuff_loops=boundary_loops(cuff[2]);assert len(hand_loops)==len(robe_loops)==1 and len(cuff_loops)==2
 front_ring=hand[0][hand_loops[0]];back_ring=robe[0][robe_loops[0]];bridge=robe_bridge(back_ring,front_ring)
 ring=front_ring;next_ring=np.roll(ring,-1,axis=0);weights=np.linalg.norm(next_ring-ring,axis=1);origin=((ring+next_ring)/2*weights[:,None]).sum(0)/weights.sum();scale=spec['scaleToMetres']
 parts=[];metadata={}
 for name,(p,n,f) in arrays.items():
  uv=np.column_stack([(p[:,0]-vertices[:,0].min())/np.ptp(vertices[:,0]),(p[:,2]-cuff[0][:,2].min())/np.ptp(cuff[0][:,2])]);position=(p-origin)*scale
  parts.append({'name':name,'positions':position,'normals':n,'faces':f,'uv':uv,'material':1 if name=='Hand_Skin' else 2 if name=='Horseshoe_Cuff' else 0,'extras':{'source':'user hand modle.glb','preservedSourceExterior':True,'role':name}})
  metadata[name]={'vertices':len(p),'triangles':len(f),'boundaryLoops':len(boundary_loops(f)),'sourceExterior':True}
  np.save(HERE/(name.lower()+'-source-faces.npy'),np.asarray(builders[name].source_faces,dtype=np.uint32))
 p,n,f,uv=bridge;parts.append({'name':'Robe_UnderCuff','positions':(p-origin)*scale,'normals':n,'faces':f,'uv':uv,'material':0,'extras':{'sourceExterior':False,'assumption':'Reconstructed hidden robe sleeve under the removable cuff, not bare wrist'}})
 metadata['Robe_UnderCuff']={'vertices':len(p),'triangles':len(f),'sourceExterior':False,'purpose':'Hand remains dressed in the Mongolian robe after the horseshoe cuff is removed'}
 extras={'sourceSHA256':sha,'rawOrigin':origin.tolist(),'rawToMetres':scale,'segmentation':'curvature-guided original hem boundaries','underCuffRobeReconstructed':True,'sameCuffIdentityThroughoutAnimation':True}
 write_glb(OUT/'user-hand-parts.glb',parts,extras)
 report={'passed':True,**extras,'foldCapTrianglesAssignedToCuff':fold_caps,'sourceVertices':len(vertices),'sourceTriangles':len(faces),'sourceAreaRaw':source_area,'separatedSourceAreaRaw':split_area,'relativeExteriorAreaError':abs(split_area-source_area)/source_area,'parts':metadata,'derivedAsset':'public/tongue-sleeve-lab/assets/user-hand-parts.glb','derivedSHA256':hashlib.sha256((OUT/'user-hand-parts.glb').read_bytes()).hexdigest(),'status':'Separated editable parts. Rigging, sleeve animation, final blue material and contact choreography are not yet complete.'}
 (HERE/'separation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
