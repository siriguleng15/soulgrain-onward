from pathlib import Path
import sys,copy,json,struct,numpy as np
R=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(R/'../onward-tongue-v5-1/python'),'/workspace/artifacts/glb-transfer-01-audit','/workspace/artifacts/glb-texture-transfer-v1/python']
from audit_glb import GLB
SRC=Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb')
class Writer:
 def __init__(self):self.g=GLB(SRC);self.doc=copy.deepcopy(self.g.doc);self.blob=bytearray(self.g.bin)
 def add(self,raw,target=None):
  while len(self.blob)%4:self.blob.append(0)
  v={'buffer':0,'byteOffset':len(self.blob),'byteLength':len(raw)}
  if target:v['target']=target
  self.doc['bufferViews'].append(v);self.blob.extend(raw);return len(self.doc['bufferViews'])-1
 def accessor(self,a,kind='SCALAR',component=5125):
  a=np.asarray(a,dtype='<u4' if component==5125 else '<f4');b={'bufferView':self.add(a.tobytes(),34963 if kind=='SCALAR' else 34962),'componentType':component,'count':len(a),'type':kind}
  if kind=='VEC3':b.update(min=a.min(0).tolist(),max=a.max(0).tolist())
  self.doc['accessors'].append(b);return len(self.doc['accessors'])-1
 def split_body(self,groups):
  data=np.load('/workspace/artifacts/onward-tongue-v5-1/data/source-body.npz');length=np.r_[0,np.cumsum(data['primitiveLengths'])];parts={k:[] for k in groups}
  for i,pr in enumerate(self.g.doc['meshes'][0]['primitives']):
   old=self.g.accessor(pr['indices']).reshape(-1,3);a,b=length[i:i+2]
   for name,mask in groups.items():
    sub=old[mask[a:b]]
    if len(sub):x=copy.deepcopy(pr);x['indices']=self.accessor(sub.reshape(-1));parts[name].append(x)
  first=True
  for name,prims in parts.items():
   if not prims:continue
   if first:self.doc['meshes'][0].update(name=name,primitives=prims);first=False
   else:self.node_mesh(name,prims)
 def node_mesh(self,name,prims,parent=0,extras=None):
  self.doc['meshes'].append({'name':name,'primitives':prims});self.doc['nodes'].append({'name':name,'mesh':len(self.doc['meshes'])-1,'extras':extras or {}});idx=len(self.doc['nodes'])-1;self.doc['nodes'][parent].setdefault('children',[]).append(idx);return idx
 def write(self,path):
  while len(self.blob)%4:self.blob.append(0)
  self.doc['buffers'][0]['byteLength']=len(self.blob);raw=json.dumps(self.doc,separators=(',',':'),allow_nan=False).encode();raw+=b' '*((-len(raw))%4);path.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(raw)+len(self.blob))+struct.pack('<I4s',len(raw),b'JSON')+raw+struct.pack('<I4s',len(self.blob),b'BIN\0')+self.blob)
