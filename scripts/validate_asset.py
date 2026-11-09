from pathlib import Path
import sys,json,hashlib,numpy as np
R=Path(__file__).resolve().parents[1];sys.path[:0]=['/workspace/artifacts/glb-transfer-01-audit','/workspace/artifacts/glb-texture-transfer-v1/python']
from audit_glb import GLB
import trimesh
from trimesh.ray.ray_pyembree import RayMeshIntersector
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree
v4=GLB(Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb'));out=R/'output/SOULGRAIN-V5.1-tongue-structure-test.glb';v5=GLB(out);q=np.load(R/'data/tongue-rebuilt.npz');p=q['positions'];f=q['faces'];u=q['uv'];roles=q['role'];M=trimesh.Trimesh(p,f,process=False);area=trimesh.triangles.area(p[f]);frontcount=int(q['frontFaceCount']);fv=int(q['frontVertexCount']);upper=int(q['upperVertexCount'])
assert np.isfinite(p).all() and np.isfinite(u).all();assert M.is_watertight and M.is_winding_consistent
edges=np.sort(np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]),axis=1);ue,count=np.unique(edges,axis=0,return_counts=True);G=coo_matrix((np.ones(len(ue)),(ue[:,0],ue[:,1])),shape=(len(p),len(p))).tocsr();cc,labels=connected_components(G,directed=False)
assert cc==1 and not np.any(count!=2) and not np.any(area<=0)
dn=np.linalg.norm(p[:fv]-p[fv:],axis=1)
# UVs are dedicated and finite; degenerate back/rim mappings are reported separately.
uvt=u[f];uva=np.cross(uvt[:,1]-uvt[:,0],uvt[:,2]-uvt[:,0]);uvstats=[]
tmesh=v5.doc['meshes'][v5.doc['nodes'][v5.doc['extras']['tongueMeshNode']]['mesh']]
for pr in tmesh['primitives']:
 puv=v5.accessor(pr['attributes']['TEXCOORD_0']);pidx=v5.accessor(pr['indices']).reshape(-1,3);ut=puv[pidx];ua=np.cross(ut[:,1]-ut[:,0],ut[:,2]-ut[:,0]);uvstats.append({'role':pr['extras']['surfaceRole'],'triangles':len(pidx),'zeroAreaUV':int((abs(ua)<1e-12).sum()),'uvMin':ut.min((0,1)).tolist(),'uvMax':ut.max((0,1)).tolist()})
# Confirm every original attribute stream and texture byte payload is retained exactly.
oldattrs=sorted({a for m in v4.doc['meshes'] for pr in m['primitives'] for a in pr['attributes'].values()})
attrsEqual=all(np.array_equal(v4.accessor(i),v5.accessor(i)) for i in oldattrs)
def imageBytes(g,i):
 b=g.doc['bufferViews'][g.doc['images'][i]['bufferView']];o=b.get('byteOffset',0);return g.bin[o:o+b['byteLength']]
imagesEqual=all(imageBytes(v4,i)==imageBytes(v5,i) for i in range(len(v4.doc['images'])))
materialsEqual=v4.doc['materials']==v5.doc['materials'][:len(v4.doc['materials'])]
source=np.load(R/'data/source-body.npz');remove=q['sourceRemove'];lace=q['debugLace'];lengths=np.r_[0,np.cumsum(source['primitiveLengths'])];protected=np.load('/workspace/artifacts/onward-structure-audit-20261109/data/inspection-mesh.npz')['labels'][:len(remove)]
assert not np.any(remove&np.isin(protected,[1,2,3,4,5,7,8]))
newbody=v5.doc['meshes'][0]['primitives'];laceMesh=v5.doc['meshes'][v5.doc['nodes'][v5.doc['extras']['debugLaceNode']]['mesh']]['primitives'];retainedCorrect=True
for i,pr in enumerate(v4.doc['meshes'][0]['primitives']):
 old=v4.accessor(pr['indices']).reshape(-1,3);a,b=lengths[i:i+2];actual=[]
 for coll in [newbody,laceMesh]:
  for np_ in coll:
   if np_['material']==pr['material']:actual.append(v5.accessor(np_['indices']).reshape(-1,3))
 # Preserve oriented triangle multiset across the optional debug display split.
 def key(x):return np.sort(np.ascontiguousarray(x,dtype='<u4').view([('a','<u4'),('b','<u4'),('c','<u4')]).ravel())
 retainedCorrect &= bool(np.array_equal(key(old[~remove[a:b]]),key(np.concatenate(actual))))
eyesEqual=all(v4.doc['meshes'][i]==v5.doc['meshes'][i] and v4.doc['nodes'][i]==v5.doc['nodes'][i] for i in range(1,11))
assert attrsEqual and imagesEqual and materialsEqual and retainedCorrect and eyesEqual
# Inner/outer shell clearance sampling: local normal segments should reach the corresponding back.
rng=np.random.default_rng(51);sample=rng.choice(fv,min(1800,fv),replace=False);direction=p[sample+fv]-p[sample];norm=np.linalg.norm(direction,axis=1);direction/=norm[:,None];ray=RayMeshIntersector(M);ti,ri,loc=ray.intersects_id(p[sample]+direction*.00005,direction,multiple_hits=False,return_locations=True);distance=np.linalg.norm(loc-p[sample[ri]],axis=1)
normalRay={'samples':len(sample),'hits':len(ri),'distanceQuantiles':np.quantile(distance,[0,.05,.5,.95,1]).tolist(),'shorterThan0_001':int((distance<.001).sum()),'shortHits':[{'vertex':int(sample[ri[k]]),'point':p[sample[ri[k]]].tolist(),'distance':float(distance[k]),'targetFaceRole':int(roles[ti[k]])} for k in np.flatnonzero(distance<.001)],'interpretation':'Sampled front-to-back interior ray distances; this is not an exhaustive self-intersection certificate.'}
# Nearest source surface reference bounds (vertex distance is an upper bound, not exact surface distance).
tree=cKDTree(source['positions']);root=p[q['rootFront']];rootdist,_=tree.query(root);geo={'vertices':len(p),'triangles':len(f),'components':int(cc),'watertight':bool(M.is_watertight),'windingConsistent':bool(M.is_winding_consistent),'boundaryEdges':int((count==1).sum()),'nonmanifoldEdges':int((count>2).sum()),'zeroAreaTriangles':int((area==0).sum()),'finitePositionsNormalsUV':bool(np.isfinite(p).all() and np.isfinite(M.vertex_normals).all() and np.isfinite(u).all()),'genus':int((2-M.euler_number)/2),'intendedHoles':2,'pairedFrontBackDistanceQuantiles':np.quantile(dn,[0,.05,.5,.95,1]).tolist(),'thicknessUnits':'uncalibrated model units; no millimeter claim','rootNearestV4VertexDistanceQuantiles':np.quantile(rootdist,[0,.5,.95,1]).tolist(),'rootSeamStatus':'provisional, not a confirmed factory seam','normalRaySampling':normalRay}
geo['rootToActualVampAnchorDistanceQuantiles']=np.quantile(np.linalg.norm(root-q['rootAnchorSurface'],axis=1),[0,.5,.95,1]).tolist();geo['rootSeamStatus']='Provisional seam location; physically attached to actual vamp triangle coordinates, with barycentric reference data.'
scope={'retainedV4SpatialTrianglesNormalsUVExact':retainedCorrect and attrsEqual,'protectedSemanticRegionsTrianglesRemoved':int((remove&np.isin(protected,[1,2,3,4,5,7,8])).sum()),'original18ImagesByteIdentical':imagesEqual,'original10MaterialsIdentical':materialsEqual,'tenIndependentEyeletsUntouched':eyesEqual,'removedOldTongueFaces':int(remove.sum()),'laceShapeChanged':False,'laceDisplaySplitOnly':True,'newTongueUVPolicy':'Retopologized visible tongue uses a dedicated V4 appearance chart. It does not claim the original exposed UV coordinates are unchanged. Protected body retains exact original UVs.','sourceV4Unchanged':hashlib.sha256(v4.raw).hexdigest()=='64a95f4d579dc5bd221cbb50d06ebf5b89be2f1ec69eb18394ac9175a65f160d'}
report={'testAsset':out.name,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'geometry':geo,'uv':uvstats,'scope':scope,'knownLimitations':['No unfolding animation or production rig is certified in this stage.','Root seam and hidden back material need confirmation.','Source body pre-existing defects outside tongue scope are retained.','No exhaustive triangle-pair collision certificate.']}
(R/'reports/validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
