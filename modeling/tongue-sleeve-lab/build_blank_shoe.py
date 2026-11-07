"""Derive a blank reverse tongue without removing the tongue or touching source.
The BIN chunk (every source vertex, UV, image) stays byte-for-byte identical.
Old stud/medallion nodes remain accessible in a separate reference scene.
"""
from pathlib import Path
import json,hashlib,struct,copy
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/tongue-sleeve-lab/assets';HERE=Path(__file__).resolve().parent
src=ROOT/'public/assets/onward-ad-v1/onward-ad-v1.glb';data=src.read_bytes();sha=hashlib.sha256(data).hexdigest();assert sha=='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'
n=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+n]);tail=data[20+n:];tongue=next(x for x in g['nodes'] if x.get('name')=='Convertible_Tongue');primitives=g['meshes'][tongue['mesh']]['primitives'];targets=[]
for index,p in enumerate(primitives):
 material=g['materials'][p['material']]
 if material['name']=='Tongue_Reverse_Canvas':
  new=copy.deepcopy(material);new['name']='Chapter_Tongue_Reverse_Blank_Canvas';pbr=new['pbrMetallicRoughness'];pbr.pop('baseColorTexture',None);pbr['baseColorFactor']=[.78,.74,.68,1];new.setdefault('extras',{})['sourceMaterial']=material['name'];p['material']=len(g['materials']);g['materials'].append(new);targets.append(index)
assert targets==[0]
decor=[i for i,node in enumerate(g['nodes']) if node.get('name') in ['Tongue_Border_Studs','Tongue_Rhinestone_Medallion']]
for scene in g['scenes']:scene['nodes']=[n for n in scene.get('nodes',[]) if n not in decor]
for node in g['nodes']:
 if 'children'in node:node['children']=[n for n in node['children'] if n not in decor]
g['scenes'].append({'name':'Original_Tongue_Decor_Reference_Not_Initial_Chapter','nodes':decor});g['scene']=0;g.setdefault('extras',{})['chapterDerivation']={'sourceSHA256':sha,'purpose':'Only reverse tongue base color removed; old decorations retained in reference scene','sourceBINUnchanged':True}
text=json.dumps(g,separators=(',',':')).encode();text+=b' '*((-len(text))%4);out=OUT/'shoe-tongue-blank.glb';out.write_bytes(struct.pack('<III',0x46546c67,2,20+len(text)+len(tail))+struct.pack('<II',len(text),0x4e4f534a)+text+tail)
report={'sourceSHA256':sha,'derivedSHA256':hashlib.sha256(out.read_bytes()).hexdigest(),'sourceBINUnchanged':True,'tongueGeometryUVNormalsAndIndicesUnchanged':True,'targetNode':'Convertible_Tongue','targetPrimitive':0,'blankMaterial':'Chapter_Tongue_Reverse_Blank_Canvas','originalDecorationReferenceNodes':decor,'note':'Chapter asset only. Other body printing intentionally unchanged at this preparation stage.'};(HERE/'blank-tongue-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
