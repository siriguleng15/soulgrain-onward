import bpy,importlib.util,sys,json,time,traceback,struct
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'blender':bpy.app.version_string}
def check(n,x):report['checks'].append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
try:
 work=json.loads((R/'reports/real-model.json').read_text())['test_file'];bpy.ops.wm.open_mainfile(filepath=work,use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('export22',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['export22']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True);bpy.ops.sgo_v22.enter();ann=a._annotation_hashes(a.meta());dest=R/'tests'/('export-isolation-'+str(time.time_ns())+'.glb')
 bpy.ops.export_scene.gltf(filepath=str(dest),export_format='GLB',export_materials='NONE',export_animations=False,export_extras=False,use_visible=False,use_selection=False,export_apply=False)
 raw=dest.read_bytes();size,tag=struct.unpack_from('<II',raw,12);g=json.loads(raw[20:20+size]);names=[n.get('name','') for n in g['nodes']];tri=sum(g['accessors'][p['indices']]['count']//3 for me in g['meshes'] for p in me['primitives'])
 check('GLB export contains exactly original 13 source meshes',len(g['meshes'])==13)
 check('GLB has all 1499039 source triangles despite display filtering',tri==1499039)
 check('no runtime display namespace enters GLB nodes',all('__SGO_V22' not in n for n in names))
 check('export changes no semantic arrays or source invariants',a._annotation_hashes(a.meta())==ann and bool(a.validate()))
 report.update(status='passed',triangles=tri,source_meshes=len(g['meshes']),materials_exported=False,artifact_delivered=False)
except Exception:report.update(status='failed',error=traceback.format_exc());traceback.print_exc()
(R/'reports/export-isolation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if report['status']!='passed':sys.exit(1)
