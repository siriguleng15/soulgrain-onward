"""Read-only SOUL.NEW -> separate GLB. Never save the source .blend."""
from pathlib import Path
import bpy,json,hashlib,numpy as np
R=Path('/workspace/golden-geometry-world-soul-v1-3');source=Path('/workspace/artifacts/soulgrain-geometry-repair-01-03-20261111/inputs/SOUL.NEW.blend');out=R/'public/golden-derivation/soul-v1-3/soul-new.glb';before=hashlib.sha256(source.read_bytes()).hexdigest();assert before=='725756904a0c71ee9c927b3e39332655c4cd175d3b9d55d0272ae70adb105183';bpy.ops.wm.open_mainfile(filepath=str(source),load_ui=False,use_scripts=False)
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
def ar(items,prop,w=1,dtype='f4'):
 x=np.empty(len(items)*w,dtype);items.foreach_get(prop,x);return x.reshape(-1,w) if w>1 else x
def sig(o):
 me=o.data;return {'position':hashlib.sha256(ar(me.vertices,'co',3).tobytes()).hexdigest(),'indices':hashlib.sha256(ar(me.loops,'vertex_index',1,'i4').tobytes()).hexdigest(),'uv':{u.name:hashlib.sha256(ar(u.data,'uv',2).tobytes()).hexdigest() for u in me.uv_layers},'mat':hashlib.sha256(ar(me.polygons,'material_index',1,'i4').tobytes()).hexdigest(),'semantic':{a.name:hashlib.sha256(ar(a.data,'value',1,'f4' if a.data_type=='FLOAT' else 'i4').tobytes()).hexdigest() for a in me.attributes if a.domain=='FACE' and a.data_type in ['FLOAT','INT'] and a.name.startswith('sgo_')}}
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];signatures={o.name:sig(o) for o in meshes};rows=[]
for o in meshes:
 me=o.data;v=ar(me.vertices,'co',3);m=np.asarray(o.matrix_world);w=v@m[:3,:3].T+m[:3,3];g=w[:,[0,2,1]];g[:,2]*=-1
 rows.append({'name':o.name,'uid':o.get('_sgo_object_id'),'vertices':len(v),'faces':len(me.polygons),'materials':[m.name if m else None for m in me.materials],'worldBoundsYUp':[g.min(0).tolist(),g.max(0).tolist()],'modifiers':[(m.name,m.type) for m in o.modifiers]})
props=bpy.ops.export_scene.gltf.get_rna_type().properties;options={'filepath':str(out),'export_format':'GLB','export_yup':True,'export_animations':False,'export_apply':False,'export_extras':False,'export_materials':'EXPORT','export_cameras':False,'export_lights':False,'use_selection':False,'use_visible':False,'use_renderable':False}
if 'export_vertex_color' in props:options['export_vertex_color']='NONE'
if 'export_all_vertex_colors' in props:options['export_all_vertex_colors']=False
bpy.ops.export_scene.gltf(**options)
after={o.name:sig(o) for o in meshes};print('SIGNATURE_DIFFERENCES',{name:[k for k,v in val.items() if after[name][k]!=v] for name,val in signatures.items() if val!=after[name]},flush=True);assert signatures==after;assert before==hashlib.sha256(source.read_bytes()).hexdigest();report={'source':{'name':source.name,'bytes':source.stat().st_size,'sha256':before},'output':{'file':'soul-v1-3/soul-new.glb','bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},'meshes':rows,'source_geometry_uv_semantics_unchanged':True,'source_file_unchanged':True,'source_saved':False,'original_materials_exported':True,'semantic_preview_vertex_colors_exported':False};(R/'research/golden-derivation/soul-v1-3/export.json').write_text(json.dumps(report,indent=2));print('SOUL_WEB_EXPORT',json.dumps(report),flush=True)
