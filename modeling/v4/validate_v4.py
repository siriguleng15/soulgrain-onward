"""Independent checks of the derivative .blend and actual exported GLB."""
import bpy,bmesh,json,hashlib
import numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path(__file__).resolve().parents[2];O=R/'modeling/v4'
(O/'validation.json').unlink(missing_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(O/'soulgrain_onward_v4_original_review.blend'))
H='af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
assert hashlib.sha256(Path('/tmp/onward-original/generic_converse_style_sneakers.glb').read_bytes()).hexdigest()==H
report={'verified_original_source':H,'new_fabric':{},'visual_similarity_approved':False}
deps=bpy.context.evaluated_depsgraph_get()
def segment_inside_triangle(p,q,a,b,c):
 p,q,a,b,c=[np.asarray(v,dtype=np.float64) for v in (p,q,a,b,c)]
 direction=q-p;edge1=b-a;edge2=c-a;cross=np.cross(direction,edge2);det=np.dot(edge1,cross)
 if abs(det)<1e-10*np.linalg.norm(direction)*np.linalg.norm(edge1)*np.linalg.norm(edge2):return False
 inv=1/det;relative=p-a;u=np.dot(relative,cross)*inv
 helper=np.cross(relative,edge1);v=np.dot(direction,helper)*inv;t=np.dot(edge2,helper)*inv
 eps=1e-4
 return eps<u<1-eps and eps<v and u+v<1-eps and eps<t<1-eps
def proper_cross(a,b):
 return any(segment_inside_triangle(a[i],a[(i+1)%3],*b) or segment_inside_triangle(b[i],b[(i+1)%3],*a) for i in range(3))
for name in ['SourceSeamFoldedCuff','ReshapedNativeTongue']:
 obj=bpy.data.objects[name];evaluated=obj.evaluated_get(deps);mesh=evaluated.to_mesh();bm=bmesh.new();bm.from_mesh(mesh)
 item={'vertices':len(mesh.vertices),'non_manifold_edges':sum(not e.is_manifold for e in bm.edges),'zero_area_faces':sum(f.calc_area()<1e-14 for f in bm.faces)}
 bmesh.ops.triangulate(bm,faces=list(bm.faces));bm.faces.ensure_lookup_table();bm.verts.index_update();bm.faces.index_update()
 tree=BVHTree.FromBMesh(bm,epsilon=0.0);vertices=[set(v.index for v in f.verts) for f in bm.faces]
 pairs=[(i,j) for i,j in tree.overlap(tree) if i<j and not vertices[i]&vertices[j]]
 item['bvh_contact_pairs']=len(pairs)
 item['proper_self_crossings']=sum(proper_cross([v.co for v in bm.faces[i].verts],[v.co for v in bm.faces[j].verts]) for i,j in pairs)
 report['new_fabric'][name]=item;bm.free();evaluated.to_mesh_clear()
seam=json.loads((O/'native-seam.json').read_text())['resampled_root'];actual=bpy.data.objects['SourceSeamFoldedCuff'].data.vertices
report['root_check_scope']='Unmodified control cage samples, not the subdivided exported boundary'
report['root_sample_max_displacement_m']=max((actual[i].co-Vector(p)).length for i,p in enumerate(seam))
# Load exported GLB independently: catches missing/removed fabric and helpers.
bpy.ops.wm.read_factory_settings(use_empty=True)
path=R/'public/assets/soulgrain_onward_v4_original_review.glb'
bpy.ops.import_scene.gltf(filepath=str(path))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
report['exported_mesh_count']=len(meshes);report['exported_mesh_names']=[o.name for o in meshes]
report['exported_bytes']=path.stat().st_size;report['exported_sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
report['has_image_textures']=any(n.type=='TEX_IMAGE' for m in bpy.data.materials if m.node_tree for n in m.node_tree.nodes)
assert len(meshes)==13 and not report['has_image_textures']
assert not any(o.type in ['CAMERA','LIGHT'] for o in bpy.context.scene.objects)
for key in ['SourceSeamFoldedCuff','ReshapedNativeTongue']:
 o=bpy.data.objects[key];assert max(o.dimensions)>.05,'Fabric collapsed / missing in actual exported mesh'
(O/'validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
# Findings are written before failure to make diagnosis reviewable.
assert all(not any(p[k] for k in ['non_manifold_edges','zero_area_faces','proper_self_crossings']) for p in report['new_fabric'].values()),'New fabric geometry still needs correction; see validation.json'
assert report['root_sample_max_displacement_m']<.00001
