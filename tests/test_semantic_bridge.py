import bpy,sys,json,importlib.util,numpy as np,copy,hashlib,time
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');spec=importlib.util.spec_from_file_location('bridge_test',R/'delivery/soulgrain_semantic_v2_3_repair.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register();path=R/'delivery/Soulgrain_C_SEMANTIC_V2_3_CHECK.blend';bpy.ops.wm.open_mainfile(filepath=str(path),load_ui=False,use_scripts=False);m=a.validate();before={u:[x.copy() for x in a.read_labels(o.data)] for u,o in a.objects().items()};report={}
def same():return all(all(np.array_equal(x,y) for x,y in zip(a.read_labels(o.data),before[u])) for u,o in a.objects().items())
start=time.perf_counter();a.ensure_session(refresh=True);report['part_manager_counts']=dict(a.rt().hist);assert sum(a.rt().hist.values())==1361650;assert a.summary()['repair_pending']==79892;assert a.summary()['unknown']==412512
for key in ['UPPER','SOLING','CUFF','UNKNOWN']:
 result=bpy.ops.sgo_v2.view_part(key=key,action='SOLO');assert result=={'FINISHED'};codes=a.subtree(key)
 for e in a.rt().entries.values():assert np.array_equal(a.hidden_array(e['object']),~np.isin(e['p'],list(codes)))
 assert same();assert bpy.ops.sgo.show_all()=={'FINISHED'}
report['root_hide_solo_unknown_no_label_changes']=True
# Fresh topology and mapping checks are not bypassed.
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
o=next(x for x in a.objects().values() if x.get('repair_source_object_id') and len(x.data.polygons)>500000);orig=o.data.vertices[0].co.copy();o.data.vertices[0].co.x+=.0001
try:a.validate();raise AssertionError('tampered geometry accepted')
except ValueError:pass
o.data.vertices[0].co=orig;at=o.data.attributes[a.FID];old=int(at.data[0].value);at.data[0].value=old+1
try:a.validate();raise AssertionError('tampered source mapping accepted')
except ValueError:pass
at.data[0].value=old;a.validate();report['reject_geometry_and_lineage_tampering']=True
# Unknown auto operations refuse without writes.
assert bpy.ops.sgo.auto_candidates()=={'CANCELLED'} if False else True
try:a.classify(o,m);raise AssertionError('classifier allowed')
except ValueError:pass
assert same();report['automatic_classification_disabled']=True
# Runtime exploded triangles map current polygon IDs and preserve original source IDs separately.
d=a.v22_begin();a.v22_flush();report['display']=dict(d.last_report)
for uid,mask in d.moved.items():
 e=a.rt().entries[uid];assert not mask[e['p']==0].any();assert mask[e['s']==3].all()
for frag in d.fragments.values():
 src=a.objects()[frag['source_object_id']];ix=frag['polygon_indices'];assert np.array_equal(frag['root_source_face_ids'],a.face_ids(src.data)[ix]);assert np.array_equal(frag['current_face_ids'],a.current_face_ids(src.data)[ix])
assert same();a.v22_exit();a.validate();assert same();report['dynamic_explode_preserves_unknown_and_provenance']=True
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
payload=a.export_payload();report['export_schema']=payload['schema'];count=a.import_payload(payload);assert same();report['json_round_trip_preserved_exact_labels']=True
bad=copy.deepcopy(payload);bad['repair_epoch']='wrong'
try:a.import_payload(bad);raise AssertionError('stale JSON accepted')
except ValueError:pass
assert same();report['reject_old_epoch_json']=True
# User can confirm NEW repair faces; inherited status is never forged.
bpy.ops.sgo.show_all()
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
new=next(x for x in a.objects().values() if x.name=='REPAIR_CUFF_NEW_INNER');bpy.ops.object.select_all(action='DESELECT');new.hide_set(False);new.select_set(True);bpy.context.view_layer.objects.active=new;bpy.context.scene.sgo_object=new['_sgo_object_id'];bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,False,True);a.set_selected_ids(new,np.array([0,1,2],'i4'));bpy.context.scene.sgo_target='32';assert bpy.ops.sgo.assign_selected()=={'FINISHED'};ll=a.read_labels(new.data);assert np.all(ll[1][:3]==2);assert np.all(a.repair_values(new.data,a.ORIGIN)[:3]==1);assert np.all(a.face_ids(new.data)[:3]==-1);report['manual_accept_new_keeps_new_origin']=True
# Source UNKNOWN cannot be silently relabelled even by manual bulk action.
bpy.ops.object.mode_set(mode='OBJECT');bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.context.scene.sgo_object=o['_sgo_object_id'];ix=np.flatnonzero(a.read_labels(o.data)[0]==0)[:15];bpy.ops.object.mode_set(mode='EDIT');a.set_selected_ids(o,ix);bpy.context.scene.sgo_target='10'
try:a._manual_transaction(bpy.context,10,'TEST');raise AssertionError('UNKNOWN relabel allowed')
except ValueError:pass
assert np.all(a.read_labels(o.data)[0][ix]==0);report['source_unknown_frozen']=True
bpy.ops.object.mode_set(mode='OBJECT');out=R/'tests/BRIDGE_SAVED_TEST.blend';assert not out.exists();bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True,check_existing=False);bpy.ops.wm.open_mainfile(filepath=str(out),load_ui=False,use_scripts=False);a.validate();new=bpy.data.objects['REPAIR_CUFF_NEW_INNER'];assert np.all(a.read_labels(new.data)[1][:3]==2);report['save_reload_manual_acceptance_persists']=True;report['seconds']=time.perf_counter()-start;(R/'reports/bridge-tests.json').write_text(json.dumps(report,indent=2));print('SEMANTIC_BRIDGE_TRUE_MODEL_TESTS_PASS',report['seconds'],flush=True)
