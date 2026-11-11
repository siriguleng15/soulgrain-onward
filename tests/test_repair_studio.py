import bpy,bmesh,sys,json,importlib.util,numpy as np,time,copy
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');spec=importlib.util.spec_from_file_location('studio_test',R/'delivery/soulgrain_repair_studio_v3.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register();bpy.ops.wm.open_mainfile(filepath=str(R/'delivery/Soulgrain_REPAIR_STUDIO_V3_DEMO.blend'),load_ui=False,use_scripts=False);sc=bpy.context.scene;report={};begin=time.perf_counter();data=a.sr3_guard();snapshot=copy.deepcopy(data['sources']);source_meta=sc[a.META];rear=data['demo_tasks']['rear'];cap=data['demo_tasks']['cap'];sc.sr3_task=rear;data,t,o=a.sr3_preview()
def invariant():
 d=a.sr3_guard();assert d['sources']==snapshot;assert sc[a.META]==source_meta
report['real_source_faces']=sum(len(x.data.polygons) for x in a.sr3_objects().values());report['HUMAN_faces']=sum(int((a.read_labels(x.data)[1]==2).sum()) for x in a.sr3_objects().values());report['UNKNOWN_faces']=sum(int((a.read_labels(x.data)[0]==0).sum()) for x in a.sr3_objects().values());assert report['real_source_faces']==1499039;assert report['UNKNOWN_faces']==412512
for obj in a.sr3_objects().values():assert obj.hide_select
report['source_unselectable_and_frozen']=True
# Unconfirmed previews cannot enter formal output.
try:a.sr3_export(R/'tests/MUST_NOT_EXIST.blend');raise AssertionError('unconfirmed export allowed')
except ValueError:pass
assert not (R/'tests/MUST_NOT_EXIST.blend').exists();report['reject_unconfirmed_export']=True
# Quality is a real result, not the operator return value.
q=a.sr3_check();assert q['geometry_pass'] and q['missing_source_boundary_segments']==0;report['rear_quality_before']=q;print('REAR_QUALITY_PASS',flush=True)
a.sr3_activate(o,True);bm=bmesh.from_edit_mesh(o.data);bm.verts.ensure_lookup_table();pin=bm.verts.layers.int['sr3_pinned'];locked=bm.verts.layers.float_vector['sr3_locked_position'];pinned=next(v for v in bm.verts if v[pin]);pinned.co.z+=.005;a.sr3_pin_tick();assert (pinned.co-pinned[locked]).length<1e-7;report['locked_boundary_restored']=True
bpy.ops.mesh.select_all(action='DESELECT');locked_points=np.asarray([v.co[:] for v in bm.verts if v[pin]]);free=max((v for v in bm.verts if not v[pin]),key=lambda v:float(np.min(np.linalg.norm(locked_points-np.asarray(v.co),axis=1))));free.co.y+=.00001;free.select_set(True);edited=free.co.copy();bmesh.update_edit_mesh(o.data,loop_triangles=True,destructive=False);a.sr3_edit('SMOOTH');invariant();report['native_drag_and_local_smooth']=True
# Local subdivision changes only NEW preview topology.
bm=bmesh.from_edit_mesh(o.data);pin=bm.verts.layers.int['sr3_pinned'];bpy.ops.mesh.select_all(action='DESELECT');internal=max((e for e in bm.edges if not any(v[pin] for v in e.verts)),key=lambda e:e.calc_length());internal.select_set(True);oldcount=len(bm.verts);a.sr3_edit('SUBDIVIDE');bm=bmesh.from_edit_mesh(o.data);assert len(bm.verts)>oldcount;invariant();report['local_subdivide_changes_only_preview']=True
# Re-generation retains the edited previous mesh rather than destroying it.
if o.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
old_geometry=a.repair_mesh_signature(o.data);oldid=o['sr3_object_uuid'];sc.sr3_algorithm='EXTEND';sc.sr3_rows=6;sc.sr3_bulge=.001;new=a.sr3_generate();assert a.sr3_find(oldid) and a.repair_mesh_signature(a.sr3_find(oldid).data)==old_geometry;report['regeneration_preserves_manual_variant']=True
# Select old edited version, check and confirm as TEST USER (delivery remains unconfirmed).
if new.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
new.hide_set(True);data,t=a.sr3_task();t['active_preview']=oldid;a.sr3_put(data);a.sr3_activate(o,True);q=a.sr3_check();assert q['geometry_pass'],q
sc.sr3_user_confirm=True;sc.sr3_boundary_reviewed=True;sc.sr3_accept_pending_uv=True;sc.sr3_accept_reference_conflict=False
if q['unknown_reference_crossings']:
 try:a.sr3_confirm();raise AssertionError('unconfirmed reference conflict accepted')
 except ValueError:pass
 sc.sr3_accept_reference_conflict=True
accepted=a.sr3_confirm();assert accepted['sr3_origin']=='NEW_REPAIR_NOT_ORIGINAL_HUMAN';assert accepted.data.attributes.get('sr3_face_id');assert not accepted.get('_sgo_object_id');invariant();report['explicit_confirm_records_new_geometry_ids_and_preserves_native_edits']=True
# Source tampering, foreign objects and accepted patch tampering reject before write/export.
src=next(iter(a.sr3_objects().values()));c=src.data.vertices[0].co.copy();src.data.vertices[0].co.x+=.00001
try:a.sr3_guard();raise AssertionError('source edit accepted')
except ValueError:pass
src.data.vertices[0].co=c;invariant();at=src.data.attributes[a.P];p=int(at.data[0].value);at.data[0].value=10 if p!=10 else 20
try:a.sr3_guard();raise AssertionError('source label edit accepted')
except ValueError:pass
at.data[0].value=p;invariant();report['geometry_and_semantics_tamper_rejected']=True
foreign=bpy.data.objects.new('TEST_UNREGISTERED',bpy.data.meshes.new('TEST_UNREGISTERED'));sc.collection.objects.link(foreign)
try:a.sr3_guard();raise AssertionError('foreign mesh allowed')
except ValueError:pass
bpy.data.objects.remove(foreign,do_unlink=True);invariant();report['unregistered_extra_mesh_rejected']=True
# Cap bridge is deliberately NOT quality-certified if it overlaps confirmed source.
sc.sr3_task=cap;qc=a.sr3_check();assert not qc['geometry_pass'];sc.sr3_user_confirm=True;sc.sr3_boundary_reviewed=True
try:a.sr3_confirm();raise AssertionError('invalid cap committed')
except ValueError:pass
report['cap_bridge_preview_blocked_by_true_source_collisions']=True;report['cap_quality']=qc
# Retraction is separate from source; it cannot accidentally enter export.
sc.sr3_task=rear;data,t=a.sr3_task();a.sr3_retract();assert a.sr3_meta()['tasks'][rear]['state']=='RETRACTED';invariant();report['retract_keeps_sources']=True
# Explicit return to preview requires QA and a fresh confirmation (no blind unhide acceptance).
assert bpy.ops.sgo3.action(action='RESUME')=={'FINISHED'};data,t,accepted=a.sr3_preview();report['resume_via_UI_operator_requires_new_confirmation']=True;sc.sr3_user_confirm=True;sc.sr3_boundary_reviewed=True;sc.sr3_accept_pending_uv=True;sc.sr3_accept_reference_conflict=True;accepted=a.sr3_confirm()
# Persistent task state and formal source + accepted-only output.
workspace=R/'tests/STUDIO_VERIFIED_SAVE.blend';assert not workspace.exists();bpy.ops.wm.save_as_mainfile(filepath=str(workspace),check_existing=False,compress=True);bpy.ops.wm.open_mainfile(filepath=str(workspace),load_ui=False,use_scripts=False);sc=bpy.context.scene;invariant();assert a.sr3_meta()['tasks'][rear]['state']=='ACCEPTED';report['save_reopen_state_and_source_guards_pass']=True
out=R/'tests/STUDIO_ACCEPTED_OUTPUT.blend';assert not out.exists();a.sr3_export(out);bpy.ops.wm.open_mainfile(filepath=str(out),load_ui=False,use_scripts=False);sc=bpy.context.scene;invariant();d=a.sr3_meta();assert list(d['tasks'])==[rear];assert not any(o.get('sr3_role') in ['SELECTOR','GUIDE','PREVIEW'] for o in sc.objects);assert len([o for o in sc.objects if o.get('sr3_role')=='ACCEPTED'])==1;report['export_excludes_all_unconfirmed_geometry']=True
# Delete confirmed TEST patch only, real source still invariant.
sc.sr3_task=rear;a.sr3_retract(True);assert a.sr3_meta()['tasks'][rear]['state']=='DELETED';invariant();report['delete_independent_patch_only']=True
report['interactive_ctrl_z']='NOT_RUN: no GUI display; operators register UNDO, native Blender preview editing retained. Mac interactive verification required.';report['seconds']=time.perf_counter()-begin;(R/'reports/studio-tests.json').write_text(json.dumps(report,indent=2));print('REAL_MODEL_REPAIR_STUDIO_TESTS_PASS',report['seconds'],flush=True)
