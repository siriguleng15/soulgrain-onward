"""Blender 4.3 source audit; no V3 source or geometry is imported."""
import bpy,json,hashlib,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'modeling/v4';OUT.mkdir(exist_ok=True)
ORIGINAL=Path('/tmp/onward-original/generic_converse_style_sneakers.glb')
EXPECTED='af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
def read(path):
 data=path.read_bytes();assert data[:4]==b'glTF'
 length=struct.unpack_from('<I',data,12)[0];document=json.loads(data[20:20+length]);offset=20+length
 size,kind=struct.unpack_from('<II',data,offset);assert kind==0x004e4942
 return document,data[offset+8:offset+8+size]
def accessor_hash(doc,binary,index):
 a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
 widths={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16};bytes_per={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}
 width=widths[a['type']]*bytes_per[a['componentType']];stride=v.get('byteStride',width);start=v.get('byteOffset',0)+a.get('byteOffset',0)
 raw=b''.join(binary[start+i*stride:start+i*stride+width] for i in range(a['count']))
 return {'count':a['count'],'type':a['type'],'componentType':a['componentType'],'sha256':hashlib.sha256(raw).hexdigest()}
assert hashlib.sha256(ORIGINAL.read_bytes()).hexdigest()==EXPECTED
report={'original_sha256':EXPECTED,'files':{},'primitive_comparison':[]}
docs=[]
for key,path in [('original',ORIGINAL),('white',ROOT/'public/assets/soulgrain_onward_template_white_preview.glb')]:
 doc,buf=read(path);docs.append((doc,buf));primitives=[]
 for mesh in doc['meshes']:
  for p in mesh['primitives']:
   primitives.append({'name':mesh.get('name'),'attributes':{n:accessor_hash(doc,buf,i) for n,i in p['attributes'].items()},'indices':accessor_hash(doc,buf,p['indices'])})
 report['files'][key]={'bytes':path.stat().st_size,'mesh_count':len(doc['meshes']),'primitives':primitives,'materials':doc.get('materials',[]),'images':[{'mimeType':im.get('mimeType'),'embedded_bytes':doc['bufferViews'][im['bufferView']]['byteLength'] if 'bufferView'in im else None} for im in doc.get('images',[])],'nodes':doc.get('nodes',[])}
for a,b in zip(report['files']['original']['primitives'],report['files']['white']['primitives']):
 report['primitive_comparison'].append({'original_name':a['name'],'white_name':b['name'],'indices_identical':a['indices']==b['indices'],'attribute_comparison':{n:a['attributes'][n]==b['attributes'].get(n) for n in a['attributes']}})
report['hierarchy_transforms_identical_excluding_names']=[{k:v for k,v in n.items() if k!='name'} for n in docs[0][0].get('nodes',[])]==[{k:v for k,v in n.items() if k!='name'} for n in docs[1][0].get('nodes',[])]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ORIGINAL))
report['blender_read_success']=True
report['blender_meshes']=[]
for o in bpy.context.scene.objects:
 if o.type=='MESH':report['blender_meshes'].append({'name':o.name,'vertices':len(o.data.vertices),'polygons':len(o.data.polygons),'dimensions':list(o.dimensions),'materials':[m.name for m in o.data.materials]})
report['texture_images']=[{'name':im.name,'size':list(im.size),'channels':im.channels} for im in bpy.data.images if im.type=='IMAGE']
(OUT/'source-audit.json').write_text(json.dumps(report,indent=2))
print('SOURCE_IMPORT_OK',report['blender_meshes'])
print('BINARY_COMPARISON',report['primitive_comparison'])
