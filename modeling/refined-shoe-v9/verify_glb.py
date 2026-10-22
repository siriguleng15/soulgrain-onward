"""Read-only checks of the exported V9 GLB and its real embedded normal pixels."""
from pathlib import Path
import struct, json, io, math, hashlib
from PIL import Image

P=Path(__file__).resolve().parent
R=P.parents[1]
f=R/'public/assets/soulgrain_onward_refined_v9.glb'
b=f.read_bytes()
magic,version,size=struct.unpack_from('<III',b)
assert magic==0x46546c67 and version==2 and size==len(b)
length,kind=struct.unpack_from('<II',b,12)
assert kind==0x4e4f534a
j=json.loads(b[20:20+length]);binary_start=28+length
components={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}
counts={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def values(index):
    a=j['accessors'][index];view=j['bufferViews'][a['bufferView']]
    fmt,width=components[a['componentType']];n=counts[a['type']]
    offset=binary_start+view.get('byteOffset',0)+a.get('byteOffset',0)
    stride=view.get('byteStride',width*n)
    if stride==width*n:
        return struct.iter_unpack('<'+fmt*n,b[offset:offset+a['count']*stride])
    return (struct.unpack_from('<'+fmt*n,b,offset+i*stride) for i in range(a['count']))
triangles=0;vertices=0;uv_primitives=0
for mesh in j['meshes']:
    for p in mesh['primitives']:
        assert p.get('mode',4)==4
        a=j['accessors'][p['attributes']['POSITION']];n=a['count'];vertices+=n
        assert all(math.isfinite(v) for bound in [a['min'],a['max']] for v in bound)
        assert 'NORMAL' in p['attributes']
        indices=j['accessors'][p['indices']];assert indices['count']%3==0
        triangles+=indices['count']//3
        assert max(v[0] for v in values(p['indices']))<n
        if 'TEXCOORD_0' in p['attributes']:
            uv_primitives+=1
            assert all(math.isfinite(v) for co in values(p['attributes']['TEXCOORD_0']) for v in co)
        assert not p.get('targets'), 'No upright state is supplied by this new source'
normal_ids={j['textures'][m['normalTexture']['index']]['source'] for m in j['materials'] if 'normalTexture' in m}
normal_results=[]
for index in normal_ids:
    im=j['images'][index];view=j['bufferViews'][im['bufferView']]
    offset=binary_start+view.get('byteOffset',0)
    pixels=Image.open(io.BytesIO(b[offset:offset+view['byteLength']])).convert('RGB')
    extrema=pixels.getextrema();assert extrema[2][0]>=250 and extrema[0][0]>100
    normal_results.append({'name':im.get('name'),'size':pixels.size,'ranges':extrema})
materials=[m.get('name') for m in j['materials']]
assert all(m.get('alphaMode','OPAQUE')=='OPAQUE' for m in j['materials'])
assert len(j['meshes'])==26 and len(materials)>=22 and uv_primitives>=len(j['meshes'])
for required in ['Body_Canvas','Collar_Outer_Canvas','Tongue_Reverse_Canvas','Heel_Logo','Clasp_Engraved_Head','Rhinestone_Silver']:
    assert required in materials
base=json.loads((P/'segmentation-validation.json').read_text())
assert base['boundary_subdivision']['source_faces_all_covered']
result={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'meshes':len(j['meshes']),
    'vertices_including_uv_and_normal_splits':vertices,'triangles':triangles,'materials':materials,
    'primitives_with_uv':uv_primitives,'normal_images':normal_results,'all_materials_opaque':True,
    'upright_targets':False,'checks':'GLB container, index bounds, finite UVs, embedded normal pixels, required editable regions, opaque surfaces, source face coverage'}
(P/'glb-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
