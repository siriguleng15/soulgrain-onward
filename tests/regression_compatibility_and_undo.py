import bpy,bmesh,importlib.util,json,sys,time,hashlib,traceback
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');spec=importlib.util.spec_from_file_location('sgo2_extra',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
report={'blender':bpy.app.version_string,'checks':[],'timings':{}}
def save(): (R/'reports/compatibility-and-undo.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def check(name,ok):
 report['checks'].append({'name':name,'passed':bool(ok)});save();print('PASS' if ok else 'FAIL',name,flush=True);assert ok,name
def reject(name,fn):
 try:r=fn();ok=r=={'CANCELLED'}
 except (ValueError,RuntimeError):ok=True
 check(name,ok)
try:
 bpy.ops.wm.open_mainfile(filepath='/workspace/artifacts/soulgrain-semantic-v2/tests/verification-v2.blend',use_scripts=False,load_ui=False);a.register();a.ensure_session(refresh=True)
 # Work only in memory on this synthetic-label V2 regression file, never in the V1 or original.
 o=bpy.data.objects['New_minus_eyelet_1'];bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.context.scene.sgo_object=o['_sgo_object_id'];bpy.ops.sgo.enter_face_mode();a.set_selected_ids(o,np.array([0,1,2],'i4'));bpy.context.scene.sgo_target='23';pre=a.read_labels(o.data)
 bpy.ops.ed.undo_push(message='V2 test before manual assignment');check('manual batch operation',bpy.ops.sgo.assign_selected()=={'FINISHED'});bpy.ops.ed.undo_push(message='V2 test after manual assignment')
 def codes():return a.read_labels(bpy.data.objects['New_minus_eyelet_1'].data)[0][:3]
 check('manual selected face assignment exact',np.all(codes()==23));bpy.ops.ed.undo();check('native undo restores exact prior labels',np.array_equal(codes(),pre[0][:3]));bpy.ops.ed.redo();check('native redo restores assigned labels',np.all(codes()==23));a.ensure_session(refresh=True)
 # Unknown and issue marking, then lock prevents issue changes.
 o=bpy.data.objects['New_minus_eyelet_1'];a.set_selected_ids(o,np.array([0,1,2],'i4'));check('explicit UNKNOWN assignment',bpy.ops.sgo.assign_selected(unknown=True)=={'FINISHED'} and np.all(a.read_labels(o.data)[0][:3]==0))
 bpy.context.scene.sgo_issue_type='2';check('fused boundary issue marker',bpy.ops.sgo.mark_issue()=={'FINISHED'} and np.all(a.read_labels(o.data)[3][:3]==2))
 bpy.ops.sgo_v2.lock_part(key='UNKNOWN');before=a._annotation_hashes(a.meta());reject('locked issue operation rejected',lambda:bpy.ops.sgo.mark_issue(clear=True));check('locks protect issue markers too',a._annotation_hashes(a.meta())==before);bpy.ops.sgo_v2.lock_part(clear_all=True)
 check('issue clear requires explicit user action',bpy.ops.sgo.mark_issue(clear=True)=={'FINISHED'} and np.all(a.read_labels(o.data)[3][:3]==0))
 # Native growth confirmation and undo on an actual independent eyelet object.
 a.set_selected_ids(o,np.array([20],'i4'));bpy.context.scene.sgo_target='60';bpy.context.scene.sgo_v2_respect_semantics=False;bpy.context.scene.sgo_v2_max_faces=30;bpy.context.scene.sgo_v2_radius=50
 check('actual eyelet seed growth preview',bpy.ops.sgo_v2.grow_preview()=={'FINISHED'});ix=a.rt().pending['indices'].copy();old=a.read_labels(o.data);bpy.ops.ed.undo_push(message='V2 test before growth confirmation');check('actual growth confirmation',bpy.ops.sgo_v2.grow_confirm()=={'FINISHED'});bpy.ops.ed.undo_push(message='V2 test after growth confirmation')
 bpy.ops.ed.undo();o=bpy.data.objects['New_minus_eyelet_1'];check('growth native undo restores candidate labels',all(np.array_equal(x[ix],y[ix]) for x,y in zip(a.read_labels(o.data),old)));bpy.ops.ed.redo();o=bpy.data.objects['New_minus_eyelet_1'];check('growth native redo restores human candidates',np.all(a.read_labels(o.data)[0][ix]==60) and np.all(a.read_labels(o.data)[1][ix]==a.HUMAN))
 a.ensure_session(refresh=True);bpy.ops.sgo.object_mode();payload=a.export_payload();before=a._annotation_hashes(a.meta())
 legacy=json.loads(Path('/workspace/artifacts/soulgrain-semantic-v1/tests/work-v1-verified.semantics.json').read_text());check('V1 legacy JSON imports into V2',isinstance(a.import_payload(legacy),int));check('legacy import preserves newer human labels',a._annotation_hashes(a.meta())==before)
 bad=json.loads(json.dumps(payload));bad['objects'][-1]['mesh_signature']['position']='wrong';reject('bad mesh revision JSON rejected atomically',lambda:a.import_payload(bad));check('bad import makes zero writes',a._annotation_hashes(a.meta())==before)
 # Locked AUTO faces must survive reclassification; HUMAN UNKNOWN must too.
 bpy.ops.sgo_v2.lock_part(key='UPPER');locked_before={uid:tuple(x.copy() for x in a.read_labels(obj.data)) for uid,obj in a.objects().items()};t=time.perf_counter();check('automatic classifier still runs',bpy.ops.sgo.auto_candidates()=={'FINISHED'});report['timings']['automatic_candidates_seconds']=round(time.perf_counter()-t,4)
 lock=a.locked_codes();protected=True
 for uid,obj in a.objects().items():
  old=locked_before[uid];new=a.read_labels(obj.data);mask=(old[1]==a.HUMAN)|np.isin(old[0],list(lock));protected &= all(np.array_equal(x[mask],y[mask]) for x,y in zip(old,new))
 check('auto preserves all HUMAN and locked faces',protected);bpy.ops.sgo_v2.lock_part(clear_all=True)
 check('original/PBR toggle is non destructive',bpy.ops.sgo.toggle_preview()=={'FINISHED'} and bool(a.validate()));check('preview toggle preserves geometry UV and PBR',bpy.ops.sgo.toggle_preview()=={'FINISHED'} and bool(a.validate()))
 # Render panel contracts with a layout recorder. This is NOT a claim of GUI rendering.
 class Layout:
  def __getattr__(self,name):
   if name in ['row','column','box','split']:return lambda *args,**kw:Layout()
   if name=='operator':return lambda id,*args,**kw: type('OperatorProps',(),{})()
   return lambda *args,**kw:None
 for cls in [a.SGO2_PT_root,a.SGO2_PT_manager,a.SGO2_PT_inspector,a.SGO2_PT_growth,a.SGO2_PT_data]:cls.draw(type('Panel',(),{'layout':Layout()})(),bpy.context)
 for i,row in enumerate(bpy.context.scene.sgo_v2_rows):a.SGO2_UL_tree.draw_item(None,bpy.context,Layout(),bpy.context.scene,row,0,bpy.context.scene,'sgo_v2_row_index',i)
 check('all panel and tree draw callbacks execute against real metadata',True)
 # Test raw-source create path independently; no semantic fixture or V1 input is saved.
 src=Path(a.meta()['source_path']);srcsha=hashlib.sha256(src.read_bytes()).hexdigest();a.unregister();bpy.ops.wm.open_mainfile(filepath=str(src),use_scripts=False,load_ui=False);a.register();dest=R/'tests'/('raw-source-v2-'+str(time.time_ns())+'.blend');check('raw original can create distinct new V2 copy',bpy.ops.sgo.create_workcopy(filepath=str(dest))=={'FINISHED'} and bool(a.meta().get('v2')));check('raw source original SHA unchanged',hashlib.sha256(src.read_bytes()).hexdigest()==srcsha);check('raw V2 geometry UV PBR validates',bool(a.validate()))
 report['status']='passed';report['undo_scope']='Blender native undo/redo in background with explicit checkpoints. GUI keyboard shortcuts not exercised.';save();print('EXTRA_TEST_COMPLETE',flush=True)
except Exception:
 report['status']='failed';report['error']=traceback.format_exc();save();traceback.print_exc();sys.exit(1)
