"""Read-only comparison of V8 and the derived advertising Blender project."""
import bpy,hashlib,json
from pathlib import Path
P=Path(__file__).resolve().parent;R=P.parents[1]
def snapshot(file):
 bpy.ops.wm.open_mainfile(filepath=str(file));faces=[];positions=[];objects=[]
 for obj in bpy.context.scene.objects:
  if obj.type!='MESH':continue
  mesh=obj.data;uv=mesh.uv_layers.active;objects.append(obj.name)
  positions.extend(tuple(round(v,6) for v in vertex.co) for vertex in mesh.vertices)
  for poly in mesh.polygons:
   corners=[]
   for li in poly.loop_indices:
    co=mesh.vertices[mesh.loops[li].vertex_index].co;tex=uv.data[li].uv if uv else (0,0)
    corners.append(tuple(round(float(v),5) for v in (*co,*tex)))
   # Cyclic order is irrelevant to split-object identity; geometry and UVs are compared.
   faces.append((mesh.materials[poly.material_index].name,tuple(sorted(corners))))
 textures={im.name:hashlib.sha256(im.packed_file.data).hexdigest() for im in bpy.data.images if im.packed_file}
 return {'objects':len(objects),'faces':len(faces),'faceDigest':hashlib.sha256(repr(sorted(faces)).encode()).hexdigest(),'bounds':[[min(p[i] for p in positions),max(p[i] for p in positions)] for i in range(3)],'textures':textures}
source=snapshot(R/'modeling/finished-shoe-v8/soulgrain_onward_finished_v8.blend')
derivative=snapshot(P/'onward_ad_v1_editable.blend')
assert source['faces']==derivative['faces'];assert source['faceDigest']==derivative['faceDigest'];assert source['bounds']==derivative['bounds'];assert source['textures']==derivative['textures']
result={'method':'Read-only per-face comparison: material name, rest positions and UVs rounded to 5 decimal places; exact packed image SHA256. Runtime construction deformation is separate.','source':source,'derivative':derivative,'restGeometryUVMaterialsAndTexturesMatch':True}
(R/'previews/interactive-ad-v1/source-verification.json').write_text(json.dumps(result,indent=2)+'\n');print('V8_REST_IDENTITY_VERIFIED',source['objects'],derivative['objects'],source['faces'],flush=True)
