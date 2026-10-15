"""Run with Blender: blender -b -t 1 --python modeling/v3/validate_model.py"""
import bpy,bmesh,json,hashlib
from pathlib import Path
from mathutils.bvhtree import BVHTree
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'modeling/v3'
(OUT/'validation.json').unlink(missing_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'soulgrain_onward_v3_shape_study.blend'))
deps=bpy.context.evaluated_depsgraph_get()
report={'source_hash_unchanged':hashlib.sha256((ROOT/'public/assets/soulgrain_onward_template_white_preview.glb').read_bytes()).hexdigest()==bpy.context.scene['source_glb_sha256'],'new_parts':{},'intersections':{}}
for name in ['L_FoldDownCuff','L_FoldDownTongue','R_FoldDownCuff','R_FoldDownTongue']:
 o=bpy.data.objects[name];ev=o.evaluated_get(deps);m=ev.to_mesh();bm=bmesh.new();bm.from_mesh(m)
 item={'vertices':len(m.vertices),'non_manifold_edges':sum(not e.is_manifold for e in bm.edges),'zero_area_faces':sum(f.calc_area()<1e-14 for f in bm.faces)}
 # Exclude adjacent triangles sharing vertices; check disjoint surface patches.
 bmesh.ops.triangulate(bm,faces=list(bm.faces))
 bm.faces.ensure_lookup_table();bm.verts.index_update();bm.faces.index_update()
 tree=BVHTree.FromBMesh(bm,epsilon=0.0)
 face_vertices=[set(v.index for v in f.verts) for f in bm.faces]
 item['self_intersection_triangle_pairs']=sum(i<j and not face_vertices[i]&face_vertices[j] for i,j in tree.overlap(tree))
 assert item['self_intersection_triangle_pairs']==0,(name,item)
 report['new_parts'][name]=item
 assert item['non_manifold_edges']==0 and item['zero_area_faces']==0,(name,item)
 bm.free();ev.to_mesh_clear()
# Intersection count includes genuine sewn/root contact. Do not confuse it with
# a global guarantee that no cloth layers touch anywhere.
for side in ['L','R']:
 names=[side+'_FoldDownCuff',side+'_FoldDownTongue']
 trees=[BVHTree.FromObject(bpy.data.objects[n],deps,epsilon=0.000001) for n in names]
 report['intersections'][side+'_cuff_vs_tongue_faces']=len(trees[0].overlap(trees[1]))
 assert report['intersections'][side+'_cuff_vs_tongue_faces']==0
 for name,tree in zip(names,trees):
  crossings={}
  for other in bpy.context.scene.objects:
   if other.type!='MESH' or not other.name.startswith(side+'_') or 'FoldDown' in other.name: continue
   count=len(tree.overlap(BVHTree.FromObject(other,deps,epsilon=0.0000001)))
   if count: crossings[other.name]=count
  report['intersections'][name+'_vs_base']=crossings
  assert not crossings,(name,crossings)
assert report['source_hash_unchanged']
# Verify the exported deliverable loads independently, not only the .blend scene.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/soulgrain_onward_v3_shape_study.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
report['glb_roundtrip_meshes']=len(meshes)
assert len(meshes)==56
assert not any(o.type in ['LIGHT','CAMERA'] for o in bpy.context.scene.objects)
report['glb_has_textures']=any(m.node_tree and any(n.type=='TEX_IMAGE' for n in m.node_tree.nodes) for m in bpy.data.materials)
assert not report['glb_has_textures']
(OUT/'validation.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
