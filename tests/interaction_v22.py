import bpy,sys,importlib.util,json,time,traceback
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'blender':bpy.app.version_string}
def check(n,x):
 report['checks'].append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
try:
 work=json.loads((R/'reports/real-model.json').read_text())['test_file'];bpy.ops.wm.open_mainfile(filepath=work,use_scripts=False,load_ui=False)
 spec=importlib.util.spec_from_file_location('interact22',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['interact22']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True);ann=a._annotation_hashes(a.meta());bpy.ops.sgo_v22.enter()
 bpy.ops.sgo_v2.select_part(key='CUFF');d=a.display22();check('manager select returns CUFF group in place',not a.v22_component_rows()['CUFF'].expanded and all(f['group']!='CUFF' for f in d.fragments.values()))
 count=sum(len(a.selected_ids(o)) for o in a.objects().values());check('manager selects actual visible CUFF source faces',count>0 and count==a.rt().tree['CUFF']['count'])
 check('manager selection changes no semantic labels',a._annotation_hashes(a.meta())==ann)
 bpy.ops.sgo.object_mode();check('object-mode button exits rather than being forced back into Edit',not d.active and bpy.context.mode=='OBJECT')
 check('object-mode exit frees all display fragments',not d.fragments and not d.geom)
 bpy.ops.sgo_v22.enter();o=bpy.data.objects['Shoe_TEST_V3'];bpy.context.scene.sgo_object=o['_sgo_object_id'];bpy.ops.sgo.pick_object()
 check('explicit object pick immediately retains working native face mode',o.mode=='EDIT' and bpy.context.active_object==o)
 check('source and annotation validation after interaction switches',a._annotation_hashes(a.meta())==ann and bool(a.validate()))
 bpy.ops.sgo_v22.exit();a.unregister();report['status']='passed'
except Exception:report.update(status='failed',error=traceback.format_exc());traceback.print_exc()
(R/'reports/interaction-v22.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if report['status']!='passed':sys.exit(1)
