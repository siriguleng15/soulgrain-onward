import bpy,importlib.util,sys,json
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');spec=importlib.util.spec_from_file_location('sigdebug',R/'delivery/soulgrain_semantic_v2_3_repair.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register();bpy.ops.wm.open_mainfile(filepath=str(R/'delivery/Soulgrain_C_SEMANTIC_V2_3_CHECK.blend'),load_ui=False,use_scripts=False);m=a.meta();bpy.ops.sgo_v2.view_part(key='SOLING',action='SOLO');bpy.ops.sgo.show_all();bpy.ops.object.mode_set(mode='OBJECT')
for uid,o in a.objects().items():
 before=m['objects'][uid]['mesh'];now=a.repair_mesh_signature(o.data);diff={k:[before[k],now[k]] for k in before if before[k]!=now[k]}
 if diff:print(o.name,json.dumps(diff),flush=True)
