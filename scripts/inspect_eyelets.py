from pathlib import Path
import sys,json,io,hashlib,numpy as np
R=Path(__file__).resolve().parents[1];sys.path[:0]=['/workspace/artifacts/glb-transfer-01-audit','/workspace/artifacts/glb-texture-transfer-v1/python']
from audit_glb import GLB
from PIL import Image
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
g=GLB(Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb'));q=np.load('/workspace/artifacts/onward-tongue-v5-1/data/source-body.npz');p=q['positions'];f=q['faces'];uv=q['uv'];m=q['material'];c=p[f].mean(1);ids=np.flatnonzero(m==0);prim=g.doc['materials'][0]['pbrMetallicRoughness'];image=g.doc['images'][g.doc['textures'][prim['metallicRoughnessTexture']['index']]['source']];view=g.doc['bufferViews'][image['bufferView']];tex=np.asarray(Image.open(io.BytesIO(g.bin[view['byteOffset']:view['byteOffset']+view['byteLength']])).convert('RGB'));u=uv[f[ids]].mean(1);ix=np.clip((u[:,0]*tex.shape[1]).astype('i4'),0,tex.shape[1]-1);iy=np.clip((u[:,1]*tex.shape[0]).astype('i4'),0,tex.shape[0]-1);mr=np.zeros((len(f),3),'u1');mr[ids]=tex[iy,ix];region=(c[:,0]>-.64)&(c[:,0]<.18)&(c[:,1]>-.19)&(c[:,1]<.36)&(abs(c[:,2])<.33);metal=region&(m==0)&(mr[:,2]>100);points=c[metal];pairs=cKDTree(points).query_pairs(.010,output_type='ndarray');n,lab=connected_components(coo_matrix((np.ones(len(pairs)),(pairs[:,0],pairs[:,1])),shape=(len(points),len(points))).tocsr(),directed=False);groups=[]
for k in np.argsort(np.bincount(lab))[::-1]:
 pts=points[lab==k]
 if len(pts)<6:continue
 groups.append({'count':len(pts),'center':pts.mean(0).tolist(),'bounds':[pts.min(0).tolist(),pts.max(0).tolist()]})
(R/'reports/front-eyelet-candidates.json').write_text(json.dumps(groups,indent=2));np.savez_compressed(R/'data/metal-mask.npz',metal=metal,mr=mr);print(json.dumps(groups,indent=2))
