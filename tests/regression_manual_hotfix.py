import bpy,bmesh,importlib.util,sys,json,hashlib,time,traceback,types
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'blender':bpy.app.version_string,'timings':{}}
def flush(): (R/'reports/manual-hotfix.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def check(n,x):
 report['checks'].append({'name':n,'passed':bool(x)});flush();print('PASS' if x else 'FAIL',n,flush=True);assert x,n
def reject(n,fn):
 try:r=fn();ok=r=={'CANCELLED'}
 except (ValueError,RuntimeError):ok=True
 check(n,ok)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def payload():return a._face_payload(body,ix)
def equal(x,y):return all(np.array_equal(p,q) for p,q in zip(x['values'],y['values'])) and np.array_equal(x['colors'],y['colors']) and np.array_equal(x['fids'],y['fids'])
try:
 source=Path('/workspace/artifacts/soulgrain-semantic-v2/tests/verification-v2.blend');oldsha=sha(source);bpy.ops.wm.open_mainfile(filepath=str(source),use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('manual_fix',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['manual_fix']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True)
 dest=R/'tests'/('manual-hotfix-'+str(time.time_ns())+'.blend');check('new V2.1 copy created',bpy.ops.sgo_v22.save_copy(filepath=str(dest))=={'FINISHED'})
 body=bpy.data.objects['Shoe_TEST_V3'];eye=bpy.data.objects['New_minus_eyelet_2'];bpy.ops.object.select_all(action='DESELECT');body.select_set(True);eye.select_set(True);bpy.context.view_layer.objects.active=body;bpy.context.scene.sgo_object=body['_sgo_object_id'];bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,False,True)
 pp,ss,cc,ii=a.read_labels(body.data);ix=np.flatnonzero((pp==0)&(ii==0))[:15];a.set_selected_ids(body,ix);a.set_selected_ids(eye,np.arange(23,dtype='i4'));other_before=a.read_labels(eye.data);other_colors=a._face_payload(eye,np.arange(23,dtype='i4'))['colors'].copy()
 check('explicit UNKNOWN operation',bpy.ops.sgo_v21.assign_unknown()=={'FINISHED'});check('15 real UNKNOWN HUMAN faces issue zero',np.all(payload()['values'][0]==0) and np.all(payload()['values'][1]==2) and np.all(payload()['values'][3]==0))
 check('inspector scope excludes other object remnants',bpy.ops.sgo_v2.inspect_selected()=={'FINISHED'} and json.loads(bpy.context.scene['_sgo_v2_inspection'])['faces']==15)
 # Reconstruct the WM UI history that triggered old V2's sticky bool bug.
 bpy.context.window_manager.operator_properties_last('sgo.assign_selected').unknown=True;bpy.context.scene.sgo_target='10'
 calls=[]
 class Layout:
  def __getattr__(self,n):
   if n in ['row','column','box','split']:return lambda *args,**kw:Layout()
   if n=='operator':
    def op(id,*args,**kw):p=types.SimpleNamespace();calls.append((id,p));return p
    return op
   return lambda *args,**kw:None
 a.SGO2_PT_inspector.draw(type('Panel',(),{'layout':Layout()})(),bpy.context)
 normal=next(p for name,p in calls if name=='sgo.assign_selected');check('normal UI button explicitly disables UNKNOWN',normal.unknown is False)
 check('UNKNOWN UI button is separate operator',any(n=='sgo_v21.assign_unknown' for n,p in calls))
 prop=bpy.ops.sgo.assign_selected.get_rna_type().properties['unknown'];check('UNKNOWN flag cannot inherit saved UI properties',prop.is_skip_save)
 t=time.perf_counter();check('15 selected UNKNOWN assigned through real normal UI payload',bpy.ops.sgo.assign_selected(unknown=normal.unknown)=={'FINISHED'});report['timings']['assign_15_body_faces_seconds']=round(time.perf_counter()-t,4)
 actual=payload();check('all 15 actual sgo_part values are UPPER',np.array_equal(actual['values'][0],np.full(15,10)))
 check('actual states confidence issues valid',np.all(actual['values'][1]==2) and np.all(actual['values'][2]==1) and np.all(actual['values'][3]==0))
 expected=np.asarray(a._bm_preview_color(a.catalog()[10]['color']));check('real selected corner colors match blue UPPER',np.allclose(actual['colors'],expected,atol=1/255+1e-7))
 check('23 foreign selected faces labels and colors untouched',all(np.array_equal(x,y) for x,y in zip(a.read_labels(eye.data),other_before)) and np.array_equal(a._face_payload(eye,np.arange(23,dtype='i4'))['colors'],other_colors))
 record=json.loads(bpy.context.scene['_sgo_v21_last_assignment']);check('transaction records exact object source IDs target and VERIFIED status',record['state']=='VERIFIED' and record['object_id']==body['_sgo_object_id'] and record['source_face_ids']==ix.tolist() and record['target_code']==10 and record['faces']==15)
 check('success count is 15 not 38 and mentions untouched remnants','15 面' in bpy.context.scene.sgo_message and '23 个残留' in bpy.context.scene.sgo_message)
 ins=json.loads(bpy.context.scene['_sgo_v2_inspection']);check('inspection auto refreshed from real data',ins['parts']=={'10':15} and ins['states']=={'2':15} and ins['origin']=='WRITE_VERIFY')
 e=a.get_entry(body);check('manager cache and hist equal actual face data',np.all(e['p'][ix]==10) and e['hist'][10]==int((a.read_labels(body.data)[0]==10).sum()))
 # Mismatched explicit/active object refuses to write instead of guessing.
 before=payload();bpy.context.scene.sgo_object=eye['_sgo_object_id'];reject('explicit object mismatch rejected',lambda:bpy.ops.sgo.assign_selected(unknown=False));check('mismatch leaves all target data and colors unchanged',equal(payload(),before));check('failed action clears stale inspector','_sgo_v2_inspection' not in bpy.context.scene)
 check('adopt active object explicit UI action',bpy.ops.sgo_v21.use_active()=={'FINISHED'} and bpy.context.scene.sgo_object==body['_sgo_object_id'])
 # Single face and native Undo/Redo.
 a.set_selected_ids(body,ix[:1]);bpy.context.scene.sgo_target='12';before=payload();bpy.ops.ed.undo_push(message='before hotfix single correction');bpy.ops.sgo.assign_selected(unknown=False);bpy.ops.ed.undo_push(message='after hotfix single correction');check('single face actual correction',a.read_labels(body.data)[0][ix[0]]==12)
 bpy.ops.ed.undo();body=bpy.data.objects['Shoe_TEST_V3'];check('native undo restores actual data and colors',equal(payload(),before));bpy.ops.ed.redo();body=bpy.data.objects['Shoe_TEST_V3'];check('native redo restores corrected actual part',a.read_labels(body.data)[0][ix[0]]==12)
 a.ensure_session(refresh=True)
 # Runtime cache poison cannot replace native data as the source of truth.
 a.get_entry(body)['p'][ix]=0;a.set_selected_ids(body,ix);bpy.context.scene.sgo_target='10';bpy.ops.sgo.assign_selected(unknown=False);check('stale cache corrected from real data',np.all(a.get_entry(body)['p'][ix]==10) and np.all(payload()['values'][0]==10))
 # Inject real failures to prove transaction rollback, including partial native writes.
 before=payload();writer=a._write_face_payload
 def partial(o,ids,vals,cols):
  writer(o,ids[:1],[x[:1] for x in vals],cols[:3]);raise RuntimeError('TEST injected partial writer failure')
 a._write_face_payload=partial;bpy.context.scene.sgo_target='11';reject('partial write failure rejects success',lambda:bpy.ops.sgo.assign_selected(unknown=False));a._write_face_payload=writer
 check('partial write fully rolled back in actual data and colors',equal(payload(),before));check('rollback recorded and no false success',json.loads(bpy.context.scene['_sgo_v21_last_assignment'])['state']=='ROLLED_BACK')
 def wrong(o,ids,vals,cols):
  bad=[x.copy() for x in vals];bad[0][0]=0;writer(o,ids,bad,cols)
 a._write_face_payload=wrong;reject('real attribute mismatch caught by read-back',lambda:bpy.ops.sgo.assign_selected(unknown=False));a._write_face_payload=writer;check('readback mismatch restores all data',equal(payload(),before))
 cache_fn=a.mark_cache_changed
 def cache_fail(*args,**kw):raise RuntimeError('TEST injected cache failure')
 a.mark_cache_changed=cache_fail;reject('post-write cache failure does not report success',lambda:bpy.ops.sgo.assign_selected(unknown=False));a.mark_cache_changed=cache_fn;check('cache failure also rolls back native attributes and colors',equal(payload(),before))
 # Visibility cycle then manual write, preserving only explicit target scope.
 bpy.ops.sgo_v2.view_part(key='UPPER',action='TOGGLE');bpy.ops.sgo.show_all();a.set_selected_ids(body,ix);bpy.context.scene.sgo_target='10';bpy.ops.sgo.assign_selected(unknown=False);check('manual assignment works after hide and restore',np.all(payload()['values'][0]==10))
 # Manual and smart expansion share fresh actual data and a coherent explicit object.
 bpy.context.scene.sgo_target='10';bpy.context.scene.sgo_v2_max_faces=30;bpy.context.scene.sgo_v2_radius=5;a.set_selected_ids(body,ix[:1]);check('growth starts after manual write',bpy.ops.sgo_v2.grow_preview()=={'FINISHED'});p=a.rt().pending;retained=p['indices'][::2].copy();a.set_selected_ids(body,retained);a.refresh_preview_selection(force=True);check('trimmed growth confirms after manual write',bpy.ops.sgo_v2.grow_confirm()=={'FINISHED'});check('actual growth result remains target HUMAN',np.all(a.read_labels(body.data)[0][retained]==10) and np.all(a.read_labels(body.data)[1][retained]==2))
 a.set_selected_ids(body,ix);bpy.context.scene.sgo_target='11';bpy.ops.sgo.assign_selected(unknown=False);check('manual write works immediately after growth',np.all(payload()['values'][0]==11))
 check('post-sequence source geometry UV normals PBR face IDs validate',bool(a.validate()))
 ann=a._annotation_hashes(a.meta());check('save isolated hotfix work',bpy.ops.sgo.save_work()=={'FINISHED'});path=bpy.data.filepath;bpy.ops.wm.open_mainfile(filepath=path,use_scripts=False,load_ui=False);a.ensure_session(refresh=True);body=bpy.data.objects['Shoe_TEST_V3'];check('saved blend reopens with identical real annotation arrays',a._annotation_hashes(a.meta())==ann);check('15 face labels persist on disk',np.all(a.read_labels(body.data)[0][ix]==11))
 check('legacy V2 input unchanged on disk',sha(source)==oldsha);check('reopened source geometry and resources validate',bool(a.validate()))
 report.update(status='passed',test_file=path,source_faces=1499039,explicit_scope='Shoe_TEST_V3',native_undo='Background native undo with explicit checkpoints, not physical Mac shortcut testing');flush();print('MANUAL_HOTFIX_COMPLETE',flush=True)
except Exception:
 report['status']='failed';report['error']=traceback.format_exc();flush();traceback.print_exc();sys.exit(1)
