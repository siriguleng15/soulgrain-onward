"""Only downsample an 8192px texture in the DERIVED web GLB; geometry is byte-exact."""
from pathlib import Path
from PIL import Image
import json,struct,io,hashlib
R=Path(__file__).resolve().parents[1];folder=R/'public/golden-derivation/soul-v1-3';raw=(folder/'soul-new.glb').read_bytes();l=struct.unpack_from('<I',raw,12)[0];d=json.loads(raw[20:20+l]);binary=raw[28+l:];replace={};changes=[]
for image in d.get('images',[]):
 i=image.get('bufferView');view=d['bufferViews'][i];payload=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']];im=Image.open(io.BytesIO(payload))
 if max(im.size)<=4096:continue
 old=im.size;im.thumbnail((4096,4096),Image.Resampling.LANCZOS);b=io.BytesIO();im.save(b,format='PNG',compress_level=6);replace[i]=b.getvalue();changes.append({'name':image.get('name'),'from':list(old),'to':list(im.size),'source_sha256':hashlib.sha256(payload).hexdigest(),'web_sha256':hashlib.sha256(b.getvalue()).hexdigest()})
new=bytearray()
for i,view in enumerate(d['bufferViews']):
 start=view.get('byteOffset',0);length=view['byteLength'];new+=b'\x00'*((-len(new))%4);view['byteOffset']=len(new);payload=replace.get(i,binary[start:start+length]);view['byteLength']=len(payload);new+=payload
 if i not in replace:assert payload==binary[start:start+length]
d['buffers'][0]['byteLength']=len(new);js=json.dumps(d,separators=(',',':')).encode();js+=b' '*((-len(js))%4);new+=b'\0'*((-len(new))%4);out=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(new))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(new),0x004E4942)+new;(folder/'soul-new-web.glb').write_bytes(out);report={'source_blend_unchanged':True,'export_glb_sha256':hashlib.sha256(raw).hexdigest(),'web_glb_sha256':hashlib.sha256(out).hexdigest(),'web_glb_bytes':len(out),'geometry_uv_index_normal_buffer_views_byte_identical':True,'material_definitions_unchanged':True,'texture_changes':changes};(R/'research/golden-derivation/soul-v1-3/web-export.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
