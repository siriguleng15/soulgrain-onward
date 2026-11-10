from pathlib import Path
import os,sys,json
R=Path(__file__).resolve().parents[1];sys.path.insert(0,str(R/'scripts'))
from repair_common import *
a,source_scene,scene,sources,work=create_base();plan=json.loads((R/'reports/stage-A-plan.json').read_text());report={'stage':'A','source_patch_plan':'stage-A-plan.json','created_objects':[],'deleted_from_work':[],'status':'LOCAL_REPAIR_CHECKED__JOINT_AND_UV_REVIEW_PENDING'}
for row in plan['patches']:
 if row['name']=='REPAIR_TOECAP_THICKNESS_BAND':
  report['deleted_from_work']+=delete_source_faces(work,sources,row['replaced_source_cap_face_indices'],'Rebuild only the measured cap vertical/thickness band. Cap top, sole, all UNKNOWN and original archive retained.');ob=new_patch(row['name'])
 else:ob=new_patch(row['name'])
 report['created_objects'].append({'name':ob.name,'vertices':len(ob.data.vertices),'triangles':len(ob.data.polygons),'new_faces':ob['repair_added_faces']})
report['source_protection']=verify_source(a,scene,sources);report['remaining_work_protection']=verify_remaining_work(a,sources,work);save_stage('A',report)
