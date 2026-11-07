"""Small glTF 2 writer for independently editable derived mesh parts."""
import json,struct
import numpy as np

def write_glb(path,parts,extras):
 blob=bytearray();views=[];accessors=[];meshes=[];nodes=[]
 materials=[{'name':'Robe_White_Canvas','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[.89,.87,.83,1],'roughnessFactor':.79,'metallicFactor':0}},
 {'name':'User_Hand_White','doubleSided':False,'pbrMetallicRoughness':{'baseColorFactor':[.94,.92,.89,1],'roughnessFactor':.58,'metallicFactor':0}},
 {'name':'Horseshoe_White_Canvas','doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':[.94,.92,.88,1],'roughnessFactor':.75,'metallicFactor':0}}]
 def add(array,kind,target):
  nonlocal blob
  arr=np.asarray(array);arr=arr.astype('<u4' if target==34963 else '<f4');data=arr.tobytes();start=len(blob);blob.extend(data);blob.extend(b'\0'*((-len(blob))%4));views.append({'buffer':0,'byteOffset':start,'byteLength':len(data),'target':target})
  count=arr.shape[0] if arr.ndim>1 else len(arr);entry={'bufferView':len(views)-1,'componentType':5125 if target==34963 else 5126,'count':count,'type':kind}
  if kind=='VEC3' and target==34962:entry.update(min=arr.min(0).astype(float).tolist(),max=arr.max(0).astype(float).tolist())
  accessors.append(entry);return len(accessors)-1
 for i,part in enumerate(parts):
  pos=add(part['positions'],'VEC3',34962);normal=add(part['normals'],'VEC3',34962);uv=add(part['uv'],'VEC2',34962);indices=add(part['faces'].reshape(-1),'SCALAR',34963)
  meshes.append({'name':part['name'],'primitives':[{'attributes':{'POSITION':pos,'NORMAL':normal,'TEXCOORD_0':uv},'indices':indices,'material':part['material']}]})
  nodes.append({'name':part['name'],'mesh':i,'extras':part.get('extras',{})})
 gltf={'asset':{'version':'2.0','generator':'Soulgrain non-destructive cuff separation'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors,'extras':extras}
 text=json.dumps(gltf,separators=(',',':')).encode();text+=b' '*((-len(text))%4);total=12+8+len(text)+8+len(blob)
 path.write_bytes(struct.pack('<III',0x46546c67,2,total)+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(blob),0x004e4942)+blob)
