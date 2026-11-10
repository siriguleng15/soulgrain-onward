import bpy,json,sys,traceback
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'blender':bpy.app.version_string,'checks':[],'preferences_saved':False}
def check(n,x):report['checks'].append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
try:
 check('install standalone V2.2 addon ZIP',bpy.ops.preferences.addon_install(filepath=str(R/'Soulgrain_Semantic_V2_2_Addon.zip'),overwrite=True)=={'FINISHED'})
 check('enable V2.2 in restricted addon context',bpy.ops.preferences.addon_enable(module='soulgrain_semantic_v2_2')=={'FINISHED'})
 check('V2.2 and inherited V2.1.1 UI properties registered',hasattr(bpy.types.Scene,'sgo_v22_groups') and hasattr(bpy.types.Scene,'sgo_v21_accept_added'))
 check('registered panel title is V2.2',bpy.types.SGO_PT_semantics.bl_label.startswith('Soulgrain V2.2'))
 check('disable cleans all V2.2 properties',bpy.ops.preferences.addon_disable(module='soulgrain_semantic_v2_2')=={'FINISHED'} and not hasattr(bpy.types.Scene,'sgo_v22_groups'))
 report['status']='passed'
except Exception:report.update(status='failed',error=traceback.format_exc());traceback.print_exc()
(R/'reports/addon-install.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
if report['status']!='passed':sys.exit(1)
