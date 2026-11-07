#!/usr/bin/env python3
"""Read-only source inspection; writes only the chapter's new audit JSON."""
import hashlib,json,struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCES={'shoe':('public/assets/onward-ad-v1/onward-ad-v1.glb','1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'),'hand':('public/tongue-sleeve-lab/assets/user-hand-original.glb','9608397f034b054b914c78f7bbf2a01404496045f2fc37d55efadf027c3b7637')}
COUNTS={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16};FORMATS={5120:'b',5121:'B',5122:'h',5123:'H',5125:'I',5126:'f'}

def inspect(relative,expected):
 data=(ROOT/relative).read_bytes();sha=hashlib.sha256(data).hexdigest();assert sha==expected,relative
 magic,version,total=struct.unpack_from('<III',data);assert magic==0x46546c67 and version==2 and total==len(data)
 offset=12;chunks={}
 while offset<len(data):
  size,kind=struct.unpack_from('<II',data,offset);chunks[kind]=data[offset+8:offset+8+size];offset+=8+size
 gltf=json.loads(chunks[0x4e4f534a]);binary=chunks.get(0x004e4942,b'');parents={child:i for i,n in enumerate(gltf.get('nodes',[])) for child in n.get('children',[])}
 def accessor(index):
  a=gltf['accessors'][index];assert 'sparse' not in a,'Sparse accessor needs a dedicated check'
  view=gltf['bufferViews'][a['bufferView']];fmt='<'+FORMATS[a['componentType']]*COUNTS[a['type']];size=struct.calcsize(fmt);start=view.get('byteOffset',0)+a.get('byteOffset',0);stride=view.get('byteStride',size)
  packed=b''.join(binary[start+i*stride:start+i*stride+size] for i in range(a['count']))
  return{'count':a['count'],'type':a['type'],'componentType':a['componentType'],'normalized':a.get('normalized',False),'minimum':a.get('min'),'maximum':a.get('max'),'sha256':hashlib.sha256(packed).hexdigest()},[struct.unpack_from(fmt,packed,i*size) for i in range(a['count'])]
 nodes=[];triangles=0;render_vertices=0
 for ni,node in enumerate(gltf.get('nodes',[])):
  if 'mesh' not in node:continue
  primitives=[]
  for pi,primitive in enumerate(gltf['meshes'][node['mesh']]['primitives']):
   attrs={name:accessor(ai)[0] for name,ai in primitive['attributes'].items()};count=attrs['POSITION']['count'];render_vertices+=count
   index=accessor(primitive['indices'])[0] if 'indices' in primitive else None;faces=(index['count'] if index else count)//3 if primitive.get('mode',4)==4 else 0;triangles+=faces
   material=gltf.get('materials',[])[primitive['material']] if 'material' in primitive else {}
   item={'primitive':pi,'material':material.get('name'),'vertices':count,'triangles':faces,'attributes':attrs,'index':index,'morphTargetCount':len(primitive.get('targets',[]))}
   if 'WEIGHTS_0' in primitive['attributes']:
    info,values=accessor(primitive['attributes']['WEIGHTS_0']);factor={5121:255,5123:65535}.get(info['componentType'],1) if info['normalized'] else 1
    item['skinWeightMaximumSumError']=max(abs(sum(row)/factor-1) for row in values)
    joints=accessor(primitive['attributes']['JOINTS_0'])[1];item['maximumJointIndex']=max(max(row) for row in joints)
   primitives.append(item)
  nodes.append({'node':ni,'name':node.get('name'),'parent':parents.get(ni),'authoredTransform':{k:node[k] for k in ['matrix','translation','rotation','scale'] if k in node},'extras':node.get('extras',{}),'primitives':primitives})
 skins=[{'name':skin.get('name'),'joints':[{'node':j,'name':gltf['nodes'][j].get('name'),'parent':gltf['nodes'][parents[j]].get('name') if j in parents else None} for j in skin['joints']]} for skin in gltf.get('skins',[])]
 return{'path':relative,'sha256':sha,'bytes':len(data),'nodeCount':len(gltf.get('nodes',[])),'meshCount':len(gltf.get('meshes',[])),'renderVertexCount':render_vertices,'triangles':triangles,'skins':skins,'animations':[{'name':a.get('name'),'channels':len(a.get('channels',[]))} for a in gltf.get('animations',[])],'meshes':nodes,'materials':gltf.get('materials',[])}

def main():
 assets={name:inspect(*source) for name,source in SOURCES.items()};hand=assets['hand'];assert len(hand['skins'])==0 and hand['renderVertexCount']==103488
 report={'baseline':'0bbbc8245ef574b73be3e7a7f842190e5af9277a','phase':'01-asset-preparation','finalReferencesReceived':True,'assets':assets,'findings':{'handRig':'New user-provided Mongolian-robe hand is authoritative: one connected unskinned mesh, no UV, no animation. Earlier anatomical candidate must not replace its hand or clothing.','sleeve':'Separate the existing horseshoe cuff from the hand plus remaining robe sleeve; preserve the robe below it.','tongue':'Keep all tongue geometry. Clear only Tongue_Reverse_Canvas artwork and old decorative overlays in chapter-owned runtime state.','oldRhinestones':785,'oldRhinestoneLayoutStatus':'Existing reference08 visually matches the latest supplied full internal ornament; preserve its layout and calibrate 75mm outer diameter.','clothDeformation':'Source hand and shoe have no skeleton or morph targets; create derived cuff deformation and a real finger rig without replacing the user hand.','missing':[]},'passed':True}
 path=ROOT/'research/tongue-sleeve-v1/asset-audit.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 for name,asset in assets.items():print(name,asset['sha256'],asset['triangles'],'triangles',asset['renderVertexCount'],'render vertices')
 print('PASS: original shoe and authoritative user-hand SHA. Cuff separation, rigging and choreography still require validation.')

if __name__=='__main__':main()
