import bpy,sys,importlib.util,json,time,traceback,hashlib
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'blender':bpy.app.version_string}
def check(n,x):
 report['checks'].append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
try:
 src=json.loads((R/'reports/real-model.json').read_text())['test_file'];bpy.ops.wm.open_mainfile(filepath=src,use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('sgo22_lifecycle',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['sgo22_lifecycle']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True)
 work=R/'tests'/('lifecycle-v22-'+str(time.time_ns())+'.blend');bpy.ops.sgo_v22.save_copy(filepath=str(work));body=bpy.data.objects['Shoe_TEST_V3'];bpy.context.scene.sgo_object=body['_sgo_object_id'];bpy.ops.sgo.pick_object();bpy.ops.sgo.enter_face_mode();bpy.context.tool_settings.mesh_select_mode=(False,False,True)
 pp,ss,cc,ii=a.read_labels(body.data);ix=np.flatnonzero((pp==0)&(ii==0))[-50:-30];a.set_selected_ids(body,ix)
 # A pre-existing native H hide must survive entering and exiting the workbench.
 import bmesh
 bm=bmesh.from_edit_mesh(body.data);bm.faces.ensure_lookup_table()
 for i in ix[:3]:bm.faces[int(i)].hide_set(True)
 bmesh.update_edit_mesh(body.data,loop_triangles=False,destructive=False)
 hidden={u:a.hidden_array(o).copy() for u,o in a.objects().items()};ann=a._annotation_hashes(a.meta());bpy.ops.sgo_v22.enter();d=a.display22()
 check('pre-existing native H faces remain hidden and not displayed',a.hidden_array(body)[ix[:3]].all() and not d.moved[body['_sgo_object_id']][ix[:3]].any())
 # Transaction rollback cannot publish a transient false assignment to the display.
 uid=body['_sgo_object_id'];target=ix[3:5];a.set_selected_ids(body,target);bpy.context.scene.sgo_target='10';before_frag={k:f['source_face_ids'].copy() for k,f in d.fragments.items()};verifier=a._verify_face_payload
 def fail(*args,**kw):raise ValueError('TEST native readback verification failure')
 a._verify_face_payload=fail
 try:bpy.ops.sgo.assign_selected(unknown=False);failed=False
 except RuntimeError:failed=True
 a._verify_face_payload=verifier;a.v22_flush()
 check('injected readback failure rolls back real source labels',failed and a._annotation_hashes(a.meta())==ann)
 check('failed commit never moves rejected faces to a proxy',all(np.array_equal(d.fragments[k]['source_face_ids'],ids) for k,ids in before_frag.items()))
 payload=a.export_payload();a.import_payload(payload);a.v22_flush();check('JSON roundtrip compatible while workbench active',a._annotation_hashes(a.meta())==ann and len(d.fragments)>0)
 try:bpy.ops.sgo.toggle_preview();rejected=False
 except RuntimeError:rejected=True
 check('PBR preview switch safely requires exit while workbench active',rejected and d.active)
 # Native Ctrl-S route, not just the custom save button.
 check('native save exits workbench and restores display first',bpy.ops.wm.save_as_mainfile(filepath=str(work),check_existing=False,relative_remap=False)=={'FINISHED'} and not d.active and a.V22_RECOVERY not in bpy.context.scene)
 check('native save does not change intended semantic data',a._annotation_hashes(a.meta())==ann)
 check('native save restores exact H visibility',all(np.array_equal(a.hidden_array(a.objects()[u]),v) for u,v in hidden.items()))
 # Simulate a recovery file captured BEFORE save_pre (e.g. crash/autosave).
 bpy.ops.sgo_v22.enter();recovery=R/'tests'/('simulated-recovery-'+str(time.time_ns())+'.blend');bpy.app.handlers.save_pre.remove(a.v22_save_pre)
 bpy.ops.wm.save_as_mainfile(filepath=str(recovery),check_existing=False,relative_remap=False);bpy.app.handlers.save_pre.append(a.v22_save_pre)
 check('synthetic crash file actually contains emergency display marker',a.V22_RECOVERY in bpy.context.scene)
 bpy.ops.wm.open_mainfile(filepath=str(recovery),use_scripts=False,load_ui=False);a.ensure_session(refresh=True)
 check('load recovery removes stale display state and marker',not a.display22().active and a.V22_RECOVERY not in bpy.context.scene)
 check('recovery restores exact pre-entry hidden arrays',all(np.array_equal(a.hidden_array(a.objects()[u]),v) for u,v in hidden.items()))
 check('recovery preserves all real semantic annotations',a._annotation_hashes(a.meta())==ann)
 check('source geometry UV PBR identities validate after recovery',bool(a.validate()))
 # GPU/display error fallback releases caches and keeps the committed model.
 bpy.ops.sgo_v22.enter();d=a.display22();d.suspended=True;d.error='TEST GPU interruption';a.v22_tick()
 check('display failure exits safely and frees runtime caches',not d.active and not d.fragments and not d.geom)
 check('display failure changes no source labels',a._annotation_hashes(a.meta())==ann)
 check('display failure restores source H state',all(np.array_equal(a.hidden_array(a.objects()[u]),v) for u,v in hidden.items()))
 # Independent-module re-run while active must cleanup old callbacks exactly once.
 bpy.ops.sgo_v22.enter();spec=importlib.util.spec_from_file_location('sgo22_rerun',R/'scripts/soulgrain_semantic_v2_2.py');other=importlib.util.module_from_spec(spec);sys.modules['sgo22_rerun']=other;spec.loader.exec_module(other);other.register();other.ensure_session(refresh=True)
 check('re-run new script cleans old active display layer',not d.active and other.V22_RECOVERY not in bpy.context.scene)
 check('exactly one lifecycle handler after re-run',all(sum(f.__name__==fn.__name__ for f in collection)==1 for collection,fn in other.V22_HANDLERS))
 check('re-run preserves semantic labels and source invariants',other._annotation_hashes(other.meta())==ann and bool(other.validate()))
 report['status']='passed';print('LIFECYCLE_V22_COMPLETE',flush=True)
except Exception:report.update(status='failed',error=traceback.format_exc());traceback.print_exc()
(R/'reports/lifecycle-v22.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if report['status']!='passed':sys.exit(1)
