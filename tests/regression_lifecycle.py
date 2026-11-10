import bpy,importlib.util,json,hashlib,sys,time
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');rows=[]
def check(n,x):
 rows.append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
def loadmodule(name):
 s=importlib.util.spec_from_file_location(name,R/'scripts/soulgrain_semantic_v2_2.py');m=importlib.util.module_from_spec(s);sys.modules[name]=m;s.loader.exec_module(m);return m
work=Path('/workspace/artifacts/soulgrain-semantic-v2/tests/verification-v2.blend');bpy.ops.wm.open_mainfile(filepath=str(work),use_scripts=False,load_ui=False);m=loadmodule('v2first');m.register();before=m._annotation_hashes(m.meta());m.ensure_session(refresh=True)
check('V2 registry lives outside driver namespace too',getattr(bpy,'_sgo_v2_registration',None) is not None)
bpy.ops.wm.open_mainfile(filepath=str(work),use_scripts=False,load_ui=False)
m2=loadmodule('v2second');m2.register();m2.ensure_session(refresh=True)
check('rerun new script module after loading a blend succeeds',m2._annotation_hashes(m2.meta())==before)
for kind in ['load_post','undo_post','redo_post']:
 check('exactly one V2 '+kind+' handler',sum(f.__name__ in ['_v2_load_handler','_v2_history_handler'] for f in getattr(bpy.app.handlers,kind))==1)
m2.unregister();check('all V2 child classes and properties unregister',not m2.SGO2_TreeRow.is_registered and not hasattr(bpy.types.Scene,'sgo_v2_rows') and not hasattr(bpy,'_sgo_v2_registration'))
m2.register();check('same module re-enables safely',m2._annotation_hashes(m2.meta())==before)
from bpy.utils import previews
pc=previews.new();png=R/'tests/test_actual_palette.png';png.write_bytes(m2.palette_png(m2.catalog()[11]['color']));pc.load('actual',str(png),'IMAGE');check('Blender preview API loads generated palette PNG','actual' in pc);previews.remove(pc)
# Semantic selection is separate from ownership and works across original objects.
import numpy as np
bpy.ops.sgo_v2.select_part(key='V2_CUFF_EYELETS');check('manager selects visible semantic family across actual objects',sum(len(m2.selected_ids(o)) for o in bpy.context.objects_in_mode_unique_data)==m2.rt().tree['V2_CUFF_EYELETS']['count'])
bpy.ops.sgo_v2.view_part(key='UNKNOWN',action='SOLO');check('UNKNOWN solo filters actual mesh faces',all(np.array_equal(m2.hidden_array(e['object']),e['p']!=0) for e in m2.rt().entries.values()));bpy.ops.sgo.object_mode()
# Pending preview must invalidate on target change and cannot be saved or refreshed.
o=bpy.data.objects['New_minus_eyelet_1'];bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.context.scene.sgo_object=o['_sgo_object_id'];bpy.ops.sgo.enter_face_mode()
m2.set_selected_ids(o,np.array([30],'i4'));bpy.context.scene.sgo_target='60';bpy.context.scene.sgo_v2_respect_semantics=False;bpy.context.scene.sgo_v2_max_faces=30;bpy.ops.sgo_v2.grow_preview()
try:m2.export_payload();ok=False
except ValueError:ok=True
check('pending preview cannot be exported as confirmed data',ok)
bpy.context.scene.sgo_target='23';check('target change cancels pending and restores seed',m2.rt().pending is None and np.array_equal(m2.selected_ids(o),[30]))
check('lifecycle and preview leave all annotations unchanged',m2._annotation_hashes(m2.meta())==before)
(R/'reports/lifecycle.json').write_text(json.dumps({'blender':bpy.app.version_string,'checks':rows,'status':'passed'},ensure_ascii=False,indent=2));print('LIFECYCLE_COMPLETE',flush=True)
