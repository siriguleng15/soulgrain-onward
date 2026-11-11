from pathlib import Path
import ast,json
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');s=(R/'delivery/soulgrain_semantic_v2_3_repair.py').read_text();s=s.rsplit("if __name__=='__main__':register()",1)[0];s=s.replace('"name": "Soulgrain Semantic V2.3 修复资产兼容版"','"name": "Soulgrain Repair Studio V3.0 鞋底修补 MVP"').replace('"version": (2, 3, 0)','"version": (3, 0, 0)');extension=(R/'scripts/studio_extension.py').read_text()
def function_text(source,name):
 node=next(n for n in ast.parse(source).body if isinstance(n,ast.FunctionDef) and n.name==name);return '\n'.join(source.splitlines()[node.lineno-1:node.end_lineno])+'\n'
common='import bpy,numpy as np,hashlib,json\n'+''.join(function_text(s,name) for name in ['array','digest','material_signature','resource_signature','object_signature'])+function_text(extension,'sr3_transfer_digest')
s=s.replace('Soulgrain Semantic V2.2: runtime semantic exploded workbench. No cutting or PBR/UV edits.','Soulgrain Repair Studio V3.0: editable independent repair layers; original source is read-only.')
s+='\nSR3_EXPORT_COMMON='+repr(common)+'\n'+extension;p=R/'delivery/soulgrain_repair_studio_v3.py';p.write_text(s);compile(s,str(p),'exec');print('STUDIO_BUILT',len(s.splitlines()),flush=True)
