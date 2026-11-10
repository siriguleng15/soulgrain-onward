"""Real 1,499,039-face asset; all mutations restricted to a new test work file."""
import bpy,bmesh,importlib.util,sys,json,time,traceback,hashlib,resource
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'timings':{},'blender':bpy.app.version_string,'platform':sys.platform}
def flush(): (R/'reports/real-model.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def check(name,ok):
 report['checks'].append({'name':name,'passed':bool(ok)});flush();print('PASS' if ok else 'FAIL',name,flush=True);assert ok,name
def timed(name,fn):
 t=time.perf_counter();r=fn();report['timings'][name]=round(time.perf_counter()-t,4);return r
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def reject(name,fn):
 try:result=fn();okay=result=={'CANCELLED'}
 except (ValueError,RuntimeError):okay=True
 check(name,okay)
def shown_ids(uid,group):return np.concatenate([f['source_face_ids'] for k,f in a.display22().fragments.items() if k[0]==uid and f['group']==group]) if any(k[0]==uid and f['group']==group for k,f in a.display22().fragments.items()) else np.empty(0,'i4')
def body_now():return bpy.data.objects['Shoe_TEST_V3']
def select(ids):a.set_selected_ids(body_now(),np.asarray(ids,'i4'));bpy.context.view_layer.objects.active=body_now();bpy.context.scene.sgo_object=body_now()['_sgo_object_id']
try:
 source=json.loads(Path('/workspace/artifacts/soulgrain-semantic-v2-1/reports/manual-hotfix.json').read_text())['test_file'];source_sha=sha(source)
 original=Path('/workspace/artifacts/onward-modular-asset-audit-20261110/inputs/soul.blend');orig_sha=sha(original)
 bpy.ops.wm.open_mainfile(filepath=source,use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('sgo22_test',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['sgo22_test']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True)
 ann0=a._annotation_hashes(a.meta());dest=R/'tests'/('real-v22-'+str(time.time_ns())+'.blend')
 check('V2.1.1 existing HUMAN labels can be read',bool(a.rt().ready) and sum(int((e['s']==2).sum()) for e in a.rt().entries.values())>0)
 reject('refuses overwrite of V2.1.1 source copy',lambda:bpy.ops.sgo_v22.save_copy(filepath=source))
 check('new V2.2 work created',bpy.ops.sgo_v22.save_copy(filepath=str(dest))=={'FINISHED'})
 check('copy preserves all source semantic arrays',a._annotation_hashes(a.meta())==ann0)
 report['test_file']=str(dest);body=body_now();uid=body['_sgo_object_id'];sc=bpy.context.scene
 bpy.ops.sgo.object_mode();bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body;sc.sgo_object=uid;bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,False,True)
 initial=a.read_labels(body.data);ix=np.flatnonzero((initial[0]==0)&(initial[3]==0))[:100];select(ix)
 before_objects=set(bpy.data.objects);before_meshes=set(bpy.data.meshes);before_resources=a.resource_signature();before_hide={u:a.hidden_array(o).copy() for u,o in a.objects().items()};before_view=a.view_state();before_ann=a._annotation_hashes(a.meta())
 check('enter real dynamic workbench',timed('initial_enter_seconds',lambda:bpy.ops.sgo_v22.enter())=={'FINISHED'})
 d=a.display22();report['initial_display']=dict(d.last_report)
 check('all 13 actual mesh objects enter native face selection',len(bpy.context.objects_in_mode_unique_data)==13)
 check('no temporary object or mesh enters bpy.data',set(bpy.data.objects)==before_objects and set(bpy.data.meshes)==before_meshes)
 check('enter does not alter semantic values',a._annotation_hashes(a.meta())==before_ann)
 check('UNKNOWN remains visible at source coordinates',all(not np.any(a.hidden_array(e['object'])[(e['p']==0)&~d.geom[u]['native_hidden']]) for u,e in a.rt().entries.items()))
 check('classified actual triangles exist at surrounding fixed anchors',all(any(f['group']==g for f in d.fragments.values()) for g in ['UPPER','CUFF','TONGUE','SOLING','HARDWARE']))
 check('classified eligible source faces are hidden',all(np.all(a.hidden_array(e['object'])[d.moved[u]]) for u,e in a.rt().entries.items()))
 anchors={key:a.v22_offset(key).copy() for key,_,_ in a.V22_GROUPS};groups=a.v22_group_codes();check('subcategories use common anatomical parent anchor',groups[11]==groups[14]==groups[70]=='UPPER' and groups[25]=='SOLING')
 geometry_ok=True
 for (u,block,g),f in d.fragments.items():
  geo=d.geom[u];start,end=geo['bounds'][block:block+2];polys=geo['face'][start:end];take=np.isin(polys,f['source_face_ids']);expected=geo['world'][geo['tri'][start:end][take]].reshape(-1,3)
  geometry_ok &= np.array_equal(f['positions'],expected)
 check('every display vertex equals real source triangle coordinates',geometry_ok)
 # Manual 100-face write; independent residual object selection must remain untouched.
 foreign=bpy.data.objects['DEBUG_LACES_VISIBILITY_ONLY'];foreignix=np.flatnonzero(~a.hidden_array(foreign))[:9];a.set_selected_ids(foreign,foreignix);foreign_before=a.read_labels(foreign.data)
 old_frag={k:id(v) for k,v in d.fragments.items()};old_rebuilt=d.rebuilt;select(ix);sc.sgo_target='10'
 check('100 UNKNOWN faces assigned through verified native transaction',timed('assign100_with_display_seconds',lambda:bpy.ops.sgo.assign_selected(unknown=False))=={'FINISHED'})
 check('actual 100 sgo_part values HUMAN UPPER',np.all(a.read_labels(body_now().data)[0][ix]==10) and np.all(a.read_labels(body_now().data)[1][ix]==2))
 expected=[x.copy() for x in initial];expected[0][ix]=10;expected[1][ix]=2;expected[2][ix]=1;check('100-face transaction leaves every other source body face attribute unchanged',all(np.array_equal(x,y) for x,y in zip(a.read_labels(body_now().data),expected)))
 check('actual readback record VERIFIED exact stable face IDs',json.loads(sc['_sgo_v21_last_assignment'])['state']=='VERIFIED' and json.loads(sc['_sgo_v21_last_assignment'])['source_face_ids']==ix.tolist())
 check('100 new source faces hidden only after committed labels',a.hidden_array(body_now())[ix].all())
 check('all 100 added to UPPER display by stable IDs',np.isin(ix,shown_ids(uid,'UPPER')).all())
 check('new labels do not change any anchor',all(np.array_equal(a.v22_offset(k),v) for k,v in anchors.items()))
 affected={(uid,int(b)) for b in np.unique(ix//a.V22_BLOCK)}
 check('unrelated component blocks retain same cache objects',all(id(d.fragments[k])==v for k,v in old_frag.items() if k[:2] not in affected and k in d.fragments))
 check('incremental update rebuilds only affected source blocks',d.rebuilt-old_rebuilt==len(affected))
 report['incremental_rebuilt_blocks']=d.rebuilt-old_rebuilt
 check('foreign editing residual labels untouched',all(np.array_equal(x,y) for x,y in zip(a.read_labels(foreign.data),foreign_before)))
 # Preview cancellation and final write.
 a.set_selected_ids(foreign,np.empty(0,'i4'));pp,ss,cc,ii=a.read_labels(body_now().data);seeds=np.flatnonzero((pp==0)&(ii==0)&~a.hidden_array(body_now()))[100:110];select(seeds[:1]);sc.sgo_v2_max_faces=40;sc.sgo_v2_radius=5
 before_growth=a._annotation_hashes(a.meta());display_before=sorted((k,hashlib.sha256(f['source_face_ids'].tobytes()).hexdigest()) for k,f in d.fragments.items())
 check('real graph growth preview on UNKNOWN source',timed('growth_preview_seconds',lambda:bpy.ops.sgo_v2.grow_preview())=={'FINISHED'})
 a.v22_flush();check('growth preview leaves all true labels unchanged',a._annotation_hashes(a.meta())==before_growth)
 check('growth preview does not move candidate display prematurely',sorted((k,hashlib.sha256(f['source_face_ids'].tobytes()).hexdigest()) for k,f in d.fragments.items())==display_before)
 candidates=a.rt().pending['candidate_set'].original.copy();trim=candidates[::2];select(trim);a.refresh_preview_selection(force=True)
 check('trimmed growth final confirmation passes',timed('growth_commit_display_seconds',lambda:bpy.ops.sgo_v2.grow_confirm())=={'FINISHED'})
 check('growth final faces are real HUMAN UPPER and displayed',np.all(a.read_labels(body_now().data)[0][trim]==10) and np.isin(trim,shown_ids(uid,'UPPER')).all())
 check('growth confirmation uses full native VERIFIED transaction',json.loads(sc['_sgo_v21_last_assignment'])['operation']=='GROWTH_CONFIRM' and json.loads(sc['_sgo_v21_last_assignment'])['state']=='VERIFIED')
 # Undo/redo semantic change and dynamic output, native Blender undo checkpoints.
 pp,ss,cc,ii=a.read_labels(body_now().data);undoix=np.flatnonzero((pp==0)&(ii==0)&~a.hidden_array(body_now()))[300:305];select(undoix);bpy.ops.ed.undo_push(message='V22 before semantic change');bpy.ops.sgo.assign_selected(unknown=False);bpy.ops.ed.undo_push(message='V22 after semantic change')
 check('before undo five new faces present',np.isin(undoix,shown_ids(uid,'UPPER')).all())
 bpy.ops.ed.undo();a.v22_flush();body=body_now();sc=bpy.context.scene
 check('native undo true labels return UNKNOWN',np.all(a.read_labels(body.data)[0][undoix]==0))
 check('native undo removes display triangles and unhides central UNKNOWN',not np.isin(undoix,shown_ids(uid,'UPPER')).any() and not a.hidden_array(body)[undoix].any())
 bpy.ops.ed.redo();a.v22_flush();body=body_now();sc=bpy.context.scene
 check('native redo returns labels and accurate display',np.all(a.read_labels(body.data)[0][undoix]==10) and np.isin(undoix,shown_ids(uid,'UPPER')).all())
 # AUTO-only toggle cannot hide unresolved/HUMAN UNKNOWN; manual UPPER survives.
 sc.sgo_v22_include_auto=False;a.v22_flush();check('HUMAN only displays exclusively resolved HUMAN faces',all(np.all(a.get_entry(a.objects()[k[0]])['s'][f['source_face_ids']]==2) for k,f in d.fragments.items()))
 check('100 manual faces remain visible in HUMAN-only setting',np.isin(ix,shown_ids(uid,'UPPER')).all())
 sc.sgo_v22_include_auto=True;a.v22_flush()
 # Locked target + issue source protection; no bypass by manual selection.
 pp,ss,cc,ii=a.read_labels(body.data);guardix=np.flatnonzero((pp==0)&(ii==0)&~a.hidden_array(body))[400:402];select(guardix)
 bpy.ops.sgo_v2.lock_part(key='UPPER');before_guard=a._annotation_hashes(a.meta());reject('locked target cannot be labeled in workbench',lambda:bpy.ops.sgo.assign_selected(unknown=False));check('locked rejection changes no labels',a._annotation_hashes(a.meta())==before_guard);bpy.ops.sgo_v2.lock_part(key='UPPER')
 sc.sgo_issue_type='2';check('mark fused issue remains UNKNOWN',bpy.ops.sgo.mark_issue(clear=False)=={'FINISHED'});check('issue faces stay visible centrally and never moved',not a.hidden_array(body)[guardix].any() and not d.moved[uid][guardix].any())
 reject('problem-marked faces cannot be assigned concrete part',lambda:bpy.ops.sgo.assign_selected(unknown=False))
 # Manager compatibility, subgroup hierarchy and local positions.
 bpy.ops.sgo_v2.view_part(key='UPPER',action='TOGGLE');a.v22_flush();check('manager hide UPPER removes all child display triangles',not any(f['group']=='UPPER' for f in d.fragments.values()))
 bpy.ops.sgo_v2.view_part(key='UPPER',action='TOGGLE');a.v22_flush();check('manager restore rebuilds UPPER display',np.isin(ix,shown_ids(uid,'UPPER')).all())
 bpy.ops.sgo_v22.component(key='UPPER',action='TOGGLE');a.v22_flush();check('in-place component unhides true faces without ownership change',not a.hidden_array(body)[ix].any() and np.all(a.read_labels(body.data)[0][ix]==10))
 bpy.ops.sgo_v22.component(key='UPPER',action='ONLY');a.v22_flush();check('only expand current parent group',all(f['group']=='UPPER' for f in d.fragments.values()))
 bpy.ops.sgo_v22.component(action='ALL');a.v22_flush();old_offset=a.v22_offset('UPPER').copy();old_ids={k:id(v) for k,v in d.fragments.items()};sc.sgo_v22_distance=1.5
 check('distance changes draw transform only without cache rebuild',np.allclose(a.v22_offset('UPPER'),old_offset*1.5) and all(id(d.fragments[k])==v for k,v in old_ids.items()))
 # Independent invariants and exit restoration.
 check('all source geometry normals UV material indices stable IDs unchanged',bool(timed('full_integrity_check_seconds',lambda:a.validate())))
 check('PBR and embedded textures identical to pre-entry',a.resource_signature()==before_resources)
 postlabels=a._annotation_hashes(a.meta());check('normal workbench exit',timed('exit_seconds',lambda:bpy.ops.sgo_v22.exit())=={'FINISHED'})
 check('exit restores pre-entry exact face hide arrays',all(np.array_equal(a.hidden_array(a.objects()[u]),h) for u,h in before_hide.items()))
 check('exit restores pre-entry manager filters and original edit object',a.view_state()==before_view and {o.name for o in bpy.context.objects_in_mode_unique_data}=={'Shoe_TEST_V3'})
 check('exit retains all intended semantic updates',a._annotation_hashes(a.meta())==postlabels)
 check('exit removes runtime geometry without bpy.data pollution',not a.display22().geom and not a.display22().fragments and set(bpy.data.objects)==before_objects and set(bpy.data.meshes)==before_meshes)
 # Memory guard, animations and persistence.
 sc.sgo_v22_memory_mb=128;reject('low memory budget cancels safely before source filtering',lambda:bpy.ops.sgo_v22.enter());check('memory refusal restores original face hide arrays',not a.display22().active and all(np.array_equal(a.hidden_array(a.objects()[u]),h) for u,h in before_hide.items()));sc.sgo_v22_memory_mb=768
 bpy.ops.sgo_v22.enter();sc.sgo_v22_animate=True;pp,ss,cc,ii=a.read_labels(body_now().data);animix=np.flatnonzero((pp==0)&(ii==0)&~a.hidden_array(body_now()))[500:503];select(animix);sc.sgo_target='10';bpy.ops.sgo.assign_selected(unknown=False)
 check('optional animation has independent temporary positions only',bool(a.display22().anim) and np.all(a.read_labels(body_now().data)[0][animix]==10))
 ann_save=a._annotation_hashes(a.meta());check('save automatically exits transient workbench',bpy.ops.sgo.save_work()=={'FINISHED'} and not a.display22().active)
 bpy.ops.wm.open_mainfile(filepath=str(dest),use_scripts=False,load_ui=False);a.ensure_session(refresh=True)
 check('saved labels persist exactly after reopen',a._annotation_hashes(a.meta())==ann_save)
 check('no recovery marker runtime meshes or workbench state serialized',a.V22_RECOVERY not in bpy.context.scene and len(a.objects())==13 and not a.display22().active)
 check('reopened model still validates geometry UV PBR stable IDs',bool(a.validate()))
 check('V2.1.1 input bytes remain exactly unchanged',sha(source)==source_sha);check('immutable original soul.blend bytes remain unchanged',sha(original)==orig_sha)
 # Re-registration cleanup, active workbench unload.
 bpy.ops.sgo_v22.enter();a.unregister();check('unregister frees display runtime and face recovery marker',a.V22_RECOVERY not in bpy.context.scene and not hasattr(bpy.types.Scene,'sgo_v22_groups'))
 a.register();a.ensure_session(refresh=True);check('same script can re-register and read labels',a._annotation_hashes(a.meta())==ann_save)
 report.update(status='passed',total_faces=sum(len(o.data.polygons) for o in a.objects().values()),max_rss_kib=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,source_work_sha256=source_sha,original_sha256=orig_sha,native_undo='Actual Blender background undo/redo with explicit checkpoints, not Mac GUI shortcuts');flush();print('REAL_MODEL_COMPLETE',flush=True)
except Exception:report['status']='failed';report['error']=traceback.format_exc();flush();traceback.print_exc();sys.exit(1)
