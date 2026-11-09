from pathlib import Path
import sys,copy,json,struct,numpy as np
R=Path(__file__).resolve().parents[1];sys.path.insert(0,'/workspace/artifacts/glb-transfer-01-audit');from audit_glb import GLB
g=GLB(Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb'));doc=copy.deepcopy(g.doc);blob=bytearray(g.bin);q=np.load(R/'data/tongue-rebuilt.npz');rm=q['sourceRemove'];lace=q['debugLace'];length=np.r_[0,np.cumsum(np.load(R/'data/source-body.npz')['primitiveLengths'])];groups=[[],[],[]]
def indices(a):
 while len(blob)%4:blob.append(0)
 raw=a.astype('<u4').reshape(-1).tobytes();doc['bufferViews'].append({'buffer':0,'byteOffset':len(blob),'byteLength':len(raw),'target':34963});blob.extend(raw);doc['accessors'].append({'bufferView':len(doc['bufferViews'])-1,'componentType':5125,'count':a.size,'type':'SCALAR'});return len(doc['accessors'])-1
for i,pr in enumerate(doc['meshes'][0]['primitives']):
 f=g.accessor(pr['indices']).reshape(-1,3);a,b=length[i:i+2]
 for j,sel in enumerate([~rm[a:b]&~lace[a:b],lace[a:b],rm[a:b]]):
  if sel.any():p=copy.deepcopy(pr);p['indices']=indices(f[sel]);groups[j].append(p)
doc['meshes'][0]['primitives']=groups[0]
for name,prims in [('DEBUG_LACES_VISIBILITY_ONLY',groups[1]),('TONGUE_REFERENCE_PATCH_V4',groups[2])]:
 doc['meshes'].append({'name':name,'primitives':prims});doc['nodes'].append({'name':name,'mesh':len(doc['meshes'])-1,'extras':{'inspectionOnly':True,'notAnExistingPhysicalPart':True}});doc['nodes'][0]['children'].append(len(doc['nodes'])-1)
while len(blob)%4:blob.append(0)
doc['buffers'][0]['byteLength']=len(blob);js=json.dumps(doc,separators=(',',':')).encode();js+=b' '*((-len(js))%4);out=R/'data/V4-debug-reference.glb';out.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(js)+len(blob))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob);print('Reference derivative only; original V4 untouched',flush=True)
