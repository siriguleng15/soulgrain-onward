import bpy
from pathlib import Path
p=Path('/workspace/artifacts/soulgrain-geometry-repair-01-03-20261111/delivery/Soulgrain_Stage_C_REVIEW.blend');bpy.ops.wm.open_mainfile(filepath=str(p),load_ui=False,use_scripts=False)
for name in ['WORK_Shoe_TEST_V3','WORK_GEO_TONGUE_CONTINUOUS_FRONT_BACK','REPAIR_CUFF_NEW_INNER']:
 o=bpy.data.objects[name];m=o.data;print(name,'customnormals',m.has_custom_normals)
 for at in m.attributes:
  print('ATTR',at.name,at.domain,at.data_type,len(at.data),[(x.identifier,x.type,x.array_length if hasattr(x,'array_length') else None) for x in at.data[0].bl_rna.properties if x.identifier!='rna_type'] if len(at.data) else [])
