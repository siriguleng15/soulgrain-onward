"""Real-shoe regression; synthetic manual test labels stay in isolated work files."""
import bpy,bmesh,importlib.util,sys,json,time,hashlib,traceback
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');INPUT=Path('/workspace/artifacts/soulgrain-semantic-v2/tests/verification-v2.blend');start=time.perf_counter()
report={'blender':bpy.app.version_string,'checks':[],'timings':{},'fixture':'Actual soul.blend geometry with V2 cloud regression annotations; not the user Mac work file.'}
def flush(): (R/'reports/editable-preview.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
def check(n,x,detail=None):
 row={'name':n,'passed':bool(x)}
 if detail is not None:row['detail']=detail
 report['checks'].append(row);flush();print('PASS' if x else 'FAIL',n,detail or '',flush=True);assert x,n
def reject(n,fn):
 try:r=fn();ok=r=={'CANCELLED'}
 except (ValueError,RuntimeError):ok=True
 check(n,ok)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def o():return bpy.data.objects['New_minus_eyelet_1']
def labels():return a.read_labels(o().data)
def colors(obj=None):
 obj=obj or o()
 if obj.mode=='EDIT':
  bm=bmesh.from_edit_mesh(obj.data);c=bm.loops.layers.color.get(a.COLOR);return np.asarray([tuple(l[c]) for f in bm.faces for l in f.loops],'f4')
 return a.array(obj.data.color_attributes[a.COLOR].data,'color',4,'f4')
def same(x,y):return all(np.array_equal(u,v) for u,v in zip(x,y))
def choose(ids):a.set_selected_ids(o(),np.asarray(ids,'i4'));return a.refresh_preview_selection(force=True)
def preview(seed=100):
 a.set_selected_ids(o(),np.array([seed],'i4'));assert bpy.ops.sgo_v2.grow_preview()=={'FINISHED'};return a.rt().pending
def all_faces():return np.arange(len(o().data.polygons),dtype='i4')
def set_values(index,p,s,issue=0):
 bm=bmesh.from_edit_mesh(o().data);bm.faces.ensure_lookup_table();f=bm.faces[index]
 for name,value in [(a.P,p),(a.S,s),(a.I,issue)]:f[bm.faces.layers.int[name]]=value
 f[bm.faces.layers.float[a.C]]=0 if p==0 else .8
 bmesh.update_edit_mesh(o().data,loop_triangles=False,destructive=False)
try:
 disksha=sha(INPUT);bpy.ops.wm.open_mainfile(filepath=str(INPUT),use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('v21',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['v21']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True)
 meta_before=a.meta();ann_before=a._annotation_hashes(meta_before);src=Path(meta_before['source_path']);srcsha=sha(src)
 reject('V2 source save cannot overwrite existing work',lambda:bpy.ops.sgo.save_work())
 reject('Save As refuses existing work path',lambda:bpy.ops.sgo_v22.save_copy(filepath=str(INPUT)))
 dest=R/'tests'/('preview-work-'+str(time.time_ns())+'.blend');check('V2 work copied safely to new V2.1 file',bpy.ops.sgo_v22.save_copy(filepath=str(dest))=={'FINISHED'})
 check('all V2 labels and stable UUIDs retained',ann_before==a._annotation_hashes(a.meta()) and a.meta()['parts']==meta_before['parts'] and list(a.meta()['objects'])==list(meta_before['objects']))
 check('old V2 disk SHA unchanged',sha(INPUT)==disksha)
 bpy.ops.object.select_all(action='DESELECT');o().select_set(True);bpy.context.view_layer.objects.active=o();bpy.context.scene.sgo_object=o()['_sgo_object_id'];bpy.ops.sgo.enter_face_mode()
 bpy.context.scene.sgo_target='60';bpy.context.scene.sgo_v2_respect_semantics=False;bpy.context.scene.sgo_v2_max_faces=60;bpy.context.scene.sgo_v2_radius=100;bpy.context.scene.sgo_v2_angle=40;bpy.context.scene.sgo_v2_seed_angle=80
 old=labels();oldcolors=colors();p=preview();original=p['indices'].copy();check('real growth yields editable original candidates',len(original)>5)
 check('original candidate set is immutable',not p['indices'].flags.writeable and not p['candidate_set'].original_mask.flags.writeable)
 keep=original[::2];stats=choose(keep);check('trim counts match exact set arithmetic',stats['retained']==len(keep) and stats['excluded']==len(original)-len(keep) and stats['added']==0 and stats['final']==len(keep))
 check('manual trimming changes no ownership state or colors',same(labels(),old) and np.array_equal(colors(),oldcolors))
 # Native selection undo/redo before commit must not discard the original proposal.
 choose(original);bpy.ops.ed.undo_push(message='V2.1 before trim');choose(keep);bpy.ops.ed.undo_push(message='V2.1 after trim');bpy.ops.ed.undo();check('selection undo preserves pending proposal',a.rt().pending is not None)
 stats=a.refresh_preview_selection(force=True);check('selection undo updates live counts',not a.rt().pending.get('selection_error') and stats['final']==len(original))
 bpy.ops.ed.redo();stats=a.refresh_preview_selection(force=True);check('selection redo restores trimmed set',stats['final']==len(keep) and np.array_equal(a.selected_ids(o()),keep))
 old=labels();oldcolors=colors();bpy.ops.ed.undo_push(message='V2.1 before trimmed commit');check('trimmed selection confirms without recomputation',bpy.ops.sgo_v2.grow_confirm()=={'FINISHED'});bpy.ops.ed.undo_push(message='V2.1 after trimmed commit')
 actual=labels();mask=np.ones(len(actual[0]),bool);mask[keep]=False;loops=np.repeat(mask,3)
 check('only retained faces assigned HUMAN target',np.all(actual[0][keep]==60) and np.all(actual[1][keep]==a.HUMAN))
 check('excluded and all other labels states confidence issues unchanged',all(np.array_equal(x[mask],y[mask]) for x,y in zip(old,actual)))
 check('excluded and all other preview colors unchanged',np.array_equal(colors()[loops],oldcolors[loops]))
 bpy.ops.ed.undo();check('trim confirmation native undo restores labels and colors',same(labels(),old) and np.array_equal(colors(),oldcolors));bpy.ops.ed.redo();check('trim confirmation native redo restores final target',np.all(labels()[0][keep]==60))
 a.ensure_session(refresh=True)
 # Manual supplementation: exact warnings and set-specific acknowledgement.
 p=preview(400);original=p['indices'].copy();old=labels();oldcolors=colors();allowed=np.flatnonzero((old[1]!=a.HUMAN)&(old[3]==0)&~np.isin(all_faces(),original));extras=allowed[-2:];check('supplement test faces lie outside original candidates',len(extras)==2)
 state_id=id(p['candidate_set']);engine_start=p['engine'].start
 for cut in range(1,5):stats=choose(np.r_[original[cut:],extras[:1]])
 check('repeated trim and add uses same proposal with no recompute',id(a.rt().pending['candidate_set'])==state_id and a.rt().pending['engine'].start==engine_start)
 check('retained excluded added and final counts update',stats['retained']==len(original)-4 and stats['excluded']==4 and stats['added']==1 and stats['final']==len(original)-3)
 reject('unreviewed manual additions cannot confirm',lambda:bpy.ops.sgo_v2.grow_confirm());check('unreviewed rejection is atomic',same(labels(),old) and np.array_equal(colors(),oldcolors))
 bpy.context.scene.sgo_v21_accept_added=True;check('review tied to exact current selection',p['review_signature']==p['candidate_set'].signature and bpy.context.scene.sgo_v21_accept_added)
 choose(np.r_[original[4:],extras[1:]]);check('same-count different addition resets acknowledgement',not bpy.context.scene.sgo_v21_accept_added and p['review_signature'] is None)
 reject('stale reviewed selection cannot authorize changed additions',lambda:bpy.ops.sgo_v2.grow_confirm())
 bpy.context.scene.sgo_v21_accept_added=True;final=p['candidate_set'].final.copy();check('trim plus reviewed additions confirm',bpy.ops.sgo_v2.grow_confirm()=={'FINISHED'})
 actual=labels();mask=np.ones(len(actual[0]),bool);mask[final]=False
 check('final union retained plus additions assigned and no other data changed',np.all(actual[0][final]==60) and np.all(actual[1][final]==a.HUMAN) and all(np.array_equal(x[mask],y[mask]) for x,y in zip(old,actual)))
 check('removed original faces keep exact colors with additions present',np.array_equal(colors()[np.repeat(mask,3)],oldcolors[np.repeat(mask,3)]))
 # Prepare labelled protection cases in memory, not by changing any geometry.
 a.ensure_session(refresh=True);set_values(2290,0,a.AUTO,1);set_values(2291,0,a.HUMAN);set_values(2292,72,a.AUTO)
 v=a.view_state();v['locked']=[72];a.put_view(v)
 p=preview(700);base=p['indices'].copy();old=labels();oldcolors=colors()
 for index,key in [(0,'manual_other'),(2291,'manual_other'),(2290,'issue'),(2292,'locked')]:
  stats=choose(np.r_[base,index]);check('live protection count '+key+' face '+str(index),stats['blocked'][key]>0 and stats['blocked_faces']>0)
  bpy.context.scene.sgo_v21_accept_added=True;reject('protected supplementation rejected '+str(index),lambda:bpy.ops.sgo_v2.grow_confirm());check('protected rejection zero writes '+str(index),same(labels(),old) and np.array_equal(colors(),oldcolors))
 # A newly protected target is also checked at commit, not just when growth began.
 choose(base);v=a.view_state();v['locked'].append(60);a.put_view(v);reject('late target lock checked at commit',lambda:bpy.ops.sgo_v2.grow_confirm());v['locked']=[72];a.put_view(v)
 choose(base);check('removing protected additions allows original candidate commit',bpy.ops.sgo_v2.grow_confirm()=={'FINISHED'})
 v=a.view_state();v['locked']=[];a.put_view(v)
 # Selection empty and semantic revision changes must fail closed.
 p=preview(900);old=labels();choose([]);reject('empty trimmed selection cannot commit',lambda:bpy.ops.sgo_v2.grow_confirm());check('empty rejection makes zero writes',same(labels(),old));bpy.ops.sgo_v2.grow_cancel()
 p=preview(900);old=labels();set_values(2288,71,a.AUTO);reject('stale semantic revision still rejected',lambda:bpy.ops.sgo_v2.grow_confirm());bpy.ops.sgo_v2.grow_cancel()
 # Two real objects: clear foreign pre-selections during preview and restore on cancel.
 bpy.ops.sgo.object_mode();other=bpy.data.objects['New_minus_eyelet_2'];bpy.ops.object.select_all(action='DESELECT');o().select_set(True);other.select_set(True);bpy.context.view_layer.objects.active=o();bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,False,True)
 a.set_selected_ids(o(),np.array([1100],'i4'));a.set_selected_ids(other,np.array([50,51],'i4'));before_a=a.selected_ids(o()).copy();before_b=a.selected_ids(other).copy();old_all=a._annotation_hashes(a.meta());oldcolors=colors()
 check('multi-object preview starts',bpy.ops.sgo_v2.grow_preview()=={'FINISHED'});p=a.rt().pending;check('other pre-selections cleared while preview is pending',len(a.selected_ids(other))==0)
 choose(p['indices'][::2]);a.set_selected_ids(other,np.array([52],'i4'));stats=a.refresh_preview_selection(force=True);check('foreign object selections detected',stats['foreign']==[{'object':other.name,'faces':1}]);reject('foreign object faces never silently submitted',lambda:bpy.ops.sgo_v2.grow_confirm())
 # Native temporary hiding is restored as well, so the pre-preview seed can be reselected.
 bm=bmesh.from_edit_mesh(o().data);bm.faces.ensure_lookup_table();bm.faces[1100].hide_set(True);bmesh.update_edit_mesh(o().data,loop_triangles=False,destructive=False)
 check('cancel editable preview',bpy.ops.sgo_v2.grow_cancel()=={'FINISHED'})
 check('cancel restores full pre-preview selection across both objects',np.array_equal(a.selected_ids(o()),before_a) and np.array_equal(a.selected_ids(other),before_b))
 check('cancel restores seed temporary visibility',not a.hidden_array(o())[1100])
 check('cancel preserves every face attribute and preview color',old_all==a._annotation_hashes(a.meta()) and np.array_equal(colors(),oldcolors))
 # Parameter change retains V2 invalidation semantics and restores the snapshot.
 a.set_selected_ids(other,np.empty(0,'i4'));p=preview(1200);choose(p['indices'][::2]);bpy.context.scene.sgo_v2_angle=41;check('parameter change still cancels preview safely',a.rt().pending is None and np.array_equal(a.selected_ids(o()),[1200]))
 # Old features and final persistent V2.1 file remain functional.
 bpy.ops.sgo.object_mode();check('source geometry UV normals PBR and textures unchanged',bool(a.validate()))
 check('manager hierarchy and semantic counts retained',sum(a.ensure_session(refresh=True).hist.values())==1499039 and {10,11,12,13,14,70}<=a.subtree('UPPER'))
 check('original and preview material toggles retained',bpy.ops.sgo.toggle_preview()=={'FINISHED'} and bpy.ops.sgo.toggle_preview()=={'FINISHED'} and bool(a.validate()))
 payload=a.export_payload();check('V1 schema retained by V2.1 export',payload['schema']==a.SCHEMA and payload['tool_version']=='2.2.0')
 ann=a._annotation_hashes(a.meta());check('JSON import preserves annotations',isinstance(a.import_payload(payload),int) and a._annotation_hashes(a.meta())==ann)
 check('save only V2.1 copy',bpy.ops.sgo.save_work()=={'FINISHED'});path=bpy.data.filepath;bpy.ops.wm.open_mainfile(filepath=path,use_scripts=False,load_ui=False);a.ensure_session(refresh=True);check('V2.1 reload persists all confirmed annotations',a._annotation_hashes(a.meta())==ann)
 check('input V2 and original soul.blend disk hashes unchanged',sha(INPUT)==disksha and sha(src)==srcsha)
 report.update(status='passed',seconds=round(time.perf_counter()-start,3),source_sha256=srcsha,v2_input_sha256=disksha,work_file=path,source_faces=1499039);flush();print('EDITABLE_PREVIEW_COMPLETE',flush=True)
except Exception:
 report['status']='failed';report['error']=traceback.format_exc();flush();traceback.print_exc();sys.exit(1)
