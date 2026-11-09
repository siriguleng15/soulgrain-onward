from common import *
import hashlib
src=R/'output/SOULGRAIN-V5.2-no-laces-two-panel-tongue.glb';g=GLB(src);root=g.doc['extras']['assemblyNode'];ids=[root]+g.doc['nodes'][root]['children'];meshids=[g.doc['nodes'][i]['mesh'] for i in ids if 'mesh' in g.doc['nodes'][i]];meshes=[copy.deepcopy(g.doc['meshes'][i]) for i in meshids];accs=sorted({a for m in meshes for p in m['primitives'] for a in [p['indices'],*p['attributes'].values()]});mats=sorted({p['material'] for m in meshes for p in m['primitives']});texs=sorted({t['index'] for i in mats for k,t in g.doc['materials'][i].get('pbrMetallicRoughness',{}).items() if k.endswith('Texture')});ims=sorted({g.doc['textures'][i]['source'] for i in texs});views=sorted({g.doc['accessors'][i]['bufferView'] for i in accs}|{g.doc['images'][i]['bufferView'] for i in ims});maps=[{x:i for i,x in enumerate(z)} for z in [ids,meshids,accs,mats,texs,ims,views]];nm,mm,am,matm,tm,im,vm=maps
blob=bytearray();doc={'asset':{'version':'2.0','generator':'Soulgrain V5.2 isolated two sewn patterns TEST'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[],'meshes':meshes,'accessors':[],'bufferViews':[],'materials':[],'textures':[],'images':[],'samplers':copy.deepcopy(g.doc['samplers']),'buffers':[{}],'extras':{'sourceFullAssetSHA256':hashlib.sha256(g.raw).hexdigest(),'scope':'identical tongue assembly extracted from full test GLB'}}
for i in ids:
 n=copy.deepcopy(g.doc['nodes'][i]);
 if 'children' in n:n['children']=[nm[k] for k in n['children']]
 if 'mesh' in n:n['mesh']=mm[n['mesh']]
 doc['nodes'].append(n)
for i in views:
 while len(blob)%4:blob.append(0)
 b=copy.deepcopy(g.doc['bufferViews'][i]);o=b.get('byteOffset',0);b.update(buffer=0,byteOffset=len(blob));blob.extend(g.bin[o:o+b['byteLength']]);doc['bufferViews'].append(b)
for i in accs:a=copy.deepcopy(g.doc['accessors'][i]);a['bufferView']=vm[a['bufferView']];doc['accessors'].append(a)
for i in ims:a=copy.deepcopy(g.doc['images'][i]);a['bufferView']=vm[a['bufferView']];doc['images'].append(a)
for i in texs:a=copy.deepcopy(g.doc['textures'][i]);a['source']=im[a['source']];doc['textures'].append(a)
for i in mats:
 a=copy.deepcopy(g.doc['materials'][i])
 for k,t in a.get('pbrMetallicRoughness',{}).items():
  if k.endswith('Texture'):t['index']=tm[t['index']]
 doc['materials'].append(a)
for m in meshes:
 for p in m['primitives']:p['indices']=am[p['indices']];p['attributes']={k:am[a] for k,a in p['attributes'].items()};p['material']=matm[p['material']]
while len(blob)%4:blob.append(0)
doc['buffers'][0]['byteLength']=len(blob);js=json.dumps(doc,separators=(',',':'),allow_nan=False).encode();js+=b' '*((-len(js))%4);out=R/'output/SOULGRAIN-V5.2-tongue-only.glb';out.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(js)+len(blob))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob);print(out.stat().st_size,hashlib.sha256(out.read_bytes()).hexdigest())
