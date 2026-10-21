"""Read-only binary/embedded-artwork/morph validation of an actual GLB file.
Visual review remains separate; passing this is not a claim of shoe accuracy.
"""
import hashlib,json,math,struct,sys
from pathlib import Path
P=Path(__file__).resolve().parent;R=P.parents[1]
file=Path(sys.argv[1]) if len(sys.argv)>1 else R/'public/assets/soulgrain_onward_finished_v8.glb'
data=file.read_bytes();magic,version,length=struct.unpack_from('<III',data)
assert magic==0x46546c67 and version==2 and length==len(data)
json_length,kind=struct.unpack_from('<II',data,12);assert kind==0x4e4f534a
g=json.loads(data[20:20+json_length]);start=20+json_length
bin_length,kind=struct.unpack_from('<II',data,start);assert kind==0x004e4942
binary=memoryview(data)[start+8:start+8+bin_length]
assert len(g['buffers'])==1 and 'uri' not in g['buffers'][0]
assert all('bufferView' in im and 'uri' not in im for im in g['images'])
def vectors(index):
 a=g['accessors'][index]
 assert a['componentType']==5126 and a['type']=='VEC3'
 if 'bufferView' in a:
  v=g['bufferViews'][a['bufferView']];first=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',12)
  assert first+(a['count']-1)*stride+12<=len(binary)
  result=[struct.unpack_from('<fff',binary,first+i*stride) for i in range(a['count'])]
 else:result=[(0.,0.,0.)]*a['count']
 if 'sparse' in a:
  s=a['sparse'];indices=s['indices'];values=s['values'];code={5121:'B',5123:'H',5125:'I'}[indices['componentType']]
  off=g['bufferViews'][indices['bufferView']].get('byteOffset',0)+indices.get('byteOffset',0)
  val=g['bufferViews'][values['bufferView']].get('byteOffset',0)+values.get('byteOffset',0)
  size=struct.calcsize(code)
  for i in range(s['count']):
   at=struct.unpack_from('<'+code,binary,off+i*size)[0];assert at<a['count']
   result[at]=struct.unpack_from('<fff',binary,val+i*12)
 return result
morph_count=0;vertices=0
for m in g['meshes']:
 for primitive in m['primitives']:
  vs=vectors(primitive['attributes']['POSITION']);vertices+=len(vs)
  assert all(math.isfinite(x) and abs(x)<.5 for v in vs for x in v),'Invalid base position'
  for target in primitive.get('targets',[]):
   delta=vectors(target['POSITION']);assert len(delta)==len(vs)
   assert all(math.isfinite(a+b) and abs(a+b)<.5 for v,d in zip(vs,delta) for a,b in zip(v,d)),'Invalid upright pose'
   morph_count+=1
names={m['name'] for m in g['materials']}
assert {'Body_Canvas','Collar_Canvas','Tongue_Canvas','Tongue_Reverse_Canvas','Aglet_Artwork','Heel_Logo','Clasp_Cream_Cord','Rhinestone_Silver'}<=names
assert morph_count>=20
source=R/'public/assets/soulgrain_onward_refined_v7.glb'
assert hashlib.sha256(source.read_bytes()).hexdigest()=='d3a6e4dc4746aa1558a6bf5c010c679cdb48ec34129b9d14d4739203ea289b6e'
print(json.dumps({'file':file.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'materials':len(names),'embedded_images':len(g['images']),'primitive_vertices':vertices,'morph_primitives':morph_count,'finite_base_and_upright_positions':True,'v7_source_unchanged':True},indent=2))
