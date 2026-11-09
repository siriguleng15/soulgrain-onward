from pathlib import Path
import sys,json,struct,copy,hashlib
R=Path(__file__).resolve().parents[1];sys.path.insert(0,'/workspace/artifacts/glb-transfer-01-audit');from audit_glb import GLB
src=R/'output/SOULGRAIN-V5.1-tongue-structure-test.glb';g=GLB(src);mesh=copy.deepcopy(g.doc['meshes'][g.doc['nodes'][g.doc['extras']['tongueMeshNode']]['mesh']]);accs=sorted({i for p in mesh['primitives'] for i in [p['indices'],*p['attributes'].values()]});mats=sorted({p['material'] for p in mesh['primitives']});texs=sorted({t['index'] for i in mats for k,t in g.doc['materials'][i].get('pbrMetallicRoughness',{}).items() if k.endswith('Texture')});ims=sorted({g.doc['textures'][i]['source'] for i in texs});views=sorted({g.doc['accessors'][i]['bufferView'] for i in accs}|{g.doc['images'][i]['bufferView'] for i in ims});am={x:i for i,x in enumerate(accs)};mm={x:i for i,x in enumerate(mats)};tm={x:i for i,x in enumerate(texs)};im={x:i for i,x in enumerate(ims)};vm={x:i for i,x in enumerate(views)};blob=bytearray();doc={'asset':{'version':'2.0','generator':'Soulgrain V5.1 isolated continuous tongue TEST'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'TONGUE_ASSEMBLY_V5_1','mesh':0}],'meshes':[mesh],'accessors':[],'bufferViews':[],'materials':[],'textures':[],'images':[],'samplers':copy.deepcopy(g.doc['samplers']),'buffers':[{}],'extras':{'scope':'Isolated tongue, identical geometry to full V5.1 test asset','sourceFullAssetSHA256':hashlib.sha256(g.raw).hexdigest(),'rootSeamStatus':'provisional'}}
for old in views:
 while len(blob)%4:blob.append(0)
 b=g.doc['bufferViews'][old];o=b.get('byteOffset',0);new=copy.deepcopy(b);new.update(byteOffset=len(blob),buffer=0);blob.extend(g.bin[o:o+b['byteLength']]);doc['bufferViews'].append(new)
for i in accs:a=copy.deepcopy(g.doc['accessors'][i]);a['bufferView']=vm[a['bufferView']];doc['accessors'].append(a)
for i in ims:a=copy.deepcopy(g.doc['images'][i]);a['bufferView']=vm[a['bufferView']];doc['images'].append(a)
for i in texs:a=copy.deepcopy(g.doc['textures'][i]);a['source']=im[a['source']];doc['textures'].append(a)
for i in mats:
 a=copy.deepcopy(g.doc['materials'][i])
 for k,t in a.get('pbrMetallicRoughness',{}).items():
  if k.endswith('Texture'):t['index']=tm[t['index']]
 doc['materials'].append(a)
for p in mesh['primitives']:p['indices']=am[p['indices']];p['attributes']={k:am[v] for k,v in p['attributes'].items()};p['material']=mm[p['material']]
while len(blob)%4:blob.append(0)
doc['buffers'][0]['byteLength']=len(blob);js=json.dumps(doc,separators=(',',':'),allow_nan=False).encode();js+=b' '*((-len(js))%4);out=R/'output/SOULGRAIN-V5.1-tongue-only.glb';out.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(js)+len(blob))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob);print(out.stat().st_size,hashlib.sha256(out.read_bytes()).hexdigest())
