"""Verified, geometry-preserving C -> C semantic epoch migration. No classification."""
import bpy,sys,json,hashlib,uuid,base64,io,copy,importlib.util,numpy as np
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');OLD=Path('/workspace/artifacts/soulgrain-geometry-repair-01-03-20261111')
spec=importlib.util.spec_from_file_location('sgo_repair23',R/'delivery/soulgrain_semantic_v2_3_repair.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register()
ROOT=OLD/'inputs/SOUL.NEW.blend';JSON=OLD/'inputs/soul_SGO_V2_1_1_WORK_V2_2_WORK.semantics.2.json';INPUT=OLD/'delivery/Soulgrain_Stage_C_REVIEW.blend';OUTPUT=R/'delivery/Soulgrain_C_SEMANTIC_V2_3_CHECK.blend'
assert not OUTPUT.exists();assert hashlib.sha256(ROOT.read_bytes()).hexdigest()=='725756904a0c71ee9c927b3e39332655c4cd175d3b9d55d0272ae70adb105183';assert hashlib.sha256(INPUT.read_bytes()).hexdigest()=='3e91b772b242dc6d02867f8a524c9e16841636a5bc946e57509d877a800f1449'
inputs_before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT,JSON,INPUT]}
bpy.ops.wm.open_mainfile(filepath=str(ROOT),load_ui=False,use_scripts=False)
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
def b64chunks(raw):
 text=base64.b64encode(raw).decode();return [text[j:j+512] for j in range(0,len(text),512)]
source_meta=copy.deepcopy(a.meta());root={};archive={'schema':'soulgrain.original-face-label-archive/1','source_sha256':inputs_before[str(ROOT)],'source_asset_id':source_meta['asset_id'],'objects':{}}
for uid,o in a.objects(source_meta).items():
 me=o.data;fid=a.face_ids(me);assert len(np.unique(fid))==len(fid);labels=a.read_labels(me);row={'name':o.name,'fid':fid,'v':a.array(me.vertices,'co',3,'f4'),'f':a.array(me.loops,'vertex_index').reshape(-1,3),'labels':labels,'mat':a.array(me.polygons,'material_index'),'uv':{u.name:a.array(u.data,'uv',2,'f4').reshape(-1,3,2) for u in me.uv_layers},'world':np.asarray(o.matrix_world).copy()};root[uid]=row
 buf=io.BytesIO();np.savez_compressed(buf,fid=fid,p=labels[0],s=labels[1],c=labels[2],i=labels[3]);archive['objects'][uid]={'name':o.name,'face_count':len(fid),'encoding':'npz-base64','data_chunks':b64chunks(buf.getvalue()),'labels_hashes':[a.digest(x) for x in labels],'face_ids_hash':a.digest(fid),'source_geometry':a.repair_mesh_signature(me)}
# The source JSON is corroborating data, not silently applied by old face index.
raw_json=JSON.read_bytes();parsed=json.loads(raw_json);assert parsed['asset_id']==source_meta['asset_id']
for item in parsed['objects']:
 uid=item['object_id'];src=root[uid];decoded=a.decode_runs(item['runs'],len(src['fid']),{int(p['code']) for p in source_meta['parts']});assert np.array_equal(decoded[0],src['labels'][0]);assert np.array_equal(decoded[1],src['labels'][1]);assert np.array_equal(decoded[3],src['labels'][3]);assert np.allclose(decoded[2],src['labels'][2],atol=0.000051,rtol=0)
# Account for every removed original face using real A/B/C change records.
retired={uid:set() for uid in root};retirement_records=[]
for stage in 'ABC':
 rec=json.loads((OLD/'reports'/('stage-'+stage+'-result.json')).read_text())
 for entry in rec['deleted_from_work']:
  uid=entry['object_id'];source_rows=np.asarray(entry['source_face_ids'],'i4');ids=root[uid]['fid'][source_rows];assert not (retired[uid]&set(ids.tolist()));retired[uid].update(ids.tolist());retirement_records.append({'stage':stage,'source_object_id':uid,'source_face_ids':ids.tolist(),'reason':entry['reason']})
bpy.ops.wm.open_mainfile(filepath=str(INPUT),load_ui=False,use_scripts=False);sc=bpy.context.scene
if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
assert a.META not in sc
geometry_before={o.name:{'mesh':a.repair_mesh_signature(o.data),'object':a.object_signature(o)} for o in sc.objects if o.type=='MESH'};resources_before=a.resource_signature()
asset=str(uuid.uuid5(uuid.NAMESPACE_URL,'soulgrain-repair-semantics:2.3:'+inputs_before[str(INPUT)]));epoch=str(uuid.uuid5(uuid.UUID(asset),'verified-current-topology-v1'));m={'schema':a.REPAIR_SCHEMA,'asset_id':asset,'repair_epoch':epoch,'source_path':str(INPUT),'source_name':INPUT.name,'source_sha256':inputs_before[str(INPUT)],'objects':{},'parts':copy.deepcopy(source_meta['parts']),'hierarchy':copy.deepcopy(source_meta['hierarchy']),'resources':resources_before,'issue_notes':[],'source_issue_notes':copy.deepcopy(source_meta.get('issue_notes',[])),'v2':{'version':'2.3.0'},'v21':{'version':'2.3.0'},'v22':{'version':'2.3.0','temporary_display':'runtime-only verified-current-epoch triangle caches'}}
parts_by_key={p['key']:p for p in m['parts']};new_parts=[(2010,'REPAIR_UPPER_LINING','鞋身内衬（新增修复）','UPPER',[.02,.56,.72]),(2011,'REPAIR_LINING_A','新增内衬 A（Y<−0.03）','REPAIR_UPPER_LINING',[.02,.48,.73]),(2012,'REPAIR_LINING_B','新增内衬 B','REPAIR_UPPER_LINING',[.04,.72,.70]),(2013,'REPAIR_FOOTBED','足床（新增修复）','REPAIR_UPPER_LINING',[.12,.57,.43])]
for code,key,name,parent,color in new_parts:
 assert code not in [p['code'] for p in m['parts']];part={'code':code,'key':key,'name':name,'parent':parent,'color':color,'id':str(uuid.uuid5(uuid.UUID(asset),'part:'+key))};part['parent_id']=parts_by_key[parent]['id'] if parent in parts_by_key else next(x['id'] for x in m['hierarchy'] if x['key']==parent);m['parts'].append(part);parts_by_key[key]=part
assignment={'REPAIR_SOLE_REAR_A':(1,22,'A1: actual rear-corner patch, task-defined sidewall; not user-confirmed source faces'),'REPAIR_SOLE_REAR_B':(1,22,'A1: actual rear-corner patch, task-defined sidewall; not user-confirmed source faces'),'REPAIR_TOECAP_THICKNESS_BAND':(1,23,'A2: actual measured cap thickness band'),'REPAIR_UPPER_CONFIRMED_LOCAL_HOLES':(2,10,'B1: new triangles at original HUMAN upper boundary; CONFIRMED refers to boundary, not new HUMAN status'),'REPAIR_UPPER_CONTINUOUS_LINING_FOOTBED':(2,None,'B2: explicit repair_new_surface_region, reverified against original B construction recipe'),'REPAIR_CUFF_NEW_INNER':(3,32,'C2: reconstructed inner, task defined; deep folds still incomplete'),'REPAIR_CUFF_RETURN_EDGES':(3,33,'C2: partial trial return strips; not fully joined or accepted')}
counts={'inherited_faces':0,'inherited_human':0,'inherited_unknown':0,'new_faces':0,'retired_faces':0,'retired_human':0};proof=[];seen=set()
def putattr(me,name,typ,values):
 at=me.attributes.get(name)
 if at:
  assert at.domain=='FACE' and at.data_type==typ,(me.name,name)
 else:at=me.attributes.new(name=name,type=typ,domain='FACE')
 at.data.foreach_set('value',np.asarray(values).ravel())
for ob in sorted(sc.objects,key=lambda o:o.name):
 if ob.type!='MESH':continue
 print('MIGRATE_OBJECT',ob.name,flush=True)
 me=ob.data;n=len(me.polygons);sourceuid=ob.get('repair_source_object_id');currentid=str(uuid.uuid5(uuid.UUID(asset),('inherited:'+sourceuid) if sourceuid else ('new:'+ob.name)));assert currentid not in seen;seen.add(currentid)
 if sourceuid:
  src=root[sourceuid];fid=a.face_ids(me).copy();order=np.argsort(src['fid']);at=np.searchsorted(src['fid'][order],fid);assert (at<len(order)).all();lookup=order[at];assert np.array_equal(src['fid'][lookup],fid) and len(np.unique(fid))==n;v=a.array(me.vertices,'co',3,'f4');f=a.array(me.loops,'vertex_index').reshape(-1,3);labels=a.read_labels(me)
  assert np.array_equal(v[f],src['v'][src['f'][lookup]]);assert all(np.array_equal(x,y[lookup]) for x,y in zip(labels,src['labels']));assert np.array_equal(a.array(me.polygons,'material_index'),src['mat'][lookup]);assert all(np.array_equal(a.array(me.uv_layers[name].data,'uv',2,'f4').reshape(-1,3,2),u[lookup]) for name,u in src['uv'].items());assert np.array_equal(np.asarray(ob.matrix_world),src['world'])
  missing=set(src['fid'].tolist())-set(fid.tolist());assert missing==retired[sourceuid];assert not ((src['labels'][0]==0)&np.isin(src['fid'],list(missing))).any();counts['inherited_faces']+=n;counts['inherited_human']+=int((labels[1]==a.HUMAN).sum());counts['inherited_unknown']+=int((labels[0]==0).sum());counts['retired_faces']+=len(missing);counts['retired_human']+=int(((src['labels'][1]==a.HUMAN)&np.isin(src['fid'],list(missing))).sum());origin=np.zeros(n,'i4');task=np.zeros(n,'i4');rindex=np.full(n,-1,'i4');mirrors=[x.copy() for x in labels];prov={'kind':'VERIFIED_INHERITED','source_object_id':sourceuid,'basis':'Exact source UID + source FID lookup; bit-exact triangle coordinates, UV, material indices and P/S/C/I; all UNKNOWN preserved'};proof.append({'name':ob.name,'current_object_id':currentid,'source_object_id':sourceuid,'surviving':n,'retired':len(missing),'source_mapping_hash':a.digest(fid),'geometry_uv_labels_exact':True,'retired_list_agrees_with_A_B_C':True})
 else:
  assert ob.name in assignment;taskno,part,basis=assignment[ob.name];payload=OLD/'reports'/(ob.name+'.npz');q=np.load(payload);v=a.array(me.vertices,'co',3,'f4');f=a.array(me.loops,'vertex_index').reshape(-1,3);assert np.array_equal(v,q['v']) and np.array_equal(f,q['f']);assert a.array(me.attributes['repair_is_new'].data,'value').tolist()==[1]*n
  if part is None:
   region=a.array(me.attributes['repair_new_surface_region'].data,'value');cent=v[f].mean(1);norm=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]]);norm/=np.maximum(np.linalg.norm(norm,axis=1,keepdims=True),1e-10);expected=np.where((cent[:,2]<-.20)&(norm[:,2]>.55),3,np.where(cent[:,1]<-.03,1,2));assert np.array_equal(region,expected);pp=np.choose(region-1,[2011,2012,2013]).astype('i4')
  else:pp=np.full(n,part,'i4')
  labels=[pp,np.full(n,a.REPAIR_PENDING,'i4'),np.zeros(n,'f4'),np.zeros(n,'i4')];fid=np.full(n,-1,'i4');origin=np.ones(n,'i4');task=np.full(n,taskno,'i4');rindex=np.arange(n,dtype='i4');mirrors=[np.full(n,-1,'i4'),np.full(n,-1,'i4'),np.zeros(n,'f4'),np.full(n,-1,'i4')];prov={'kind':'NEW_REPAIR','task':'ABC'[taskno-1],'basis':basis,'geometry_source':'exact versioned construction payload','construction_name':ob.name,'construction_sha256':hashlib.sha256(payload.read_bytes()).hexdigest(),'face_mapping':'sgor_construction_face = verified payload triangle row; sgo_source_face = -1, never an original face','human_confirmation_inherited':False};counts['new_faces']+=n
  for name,typ,val in zip([a.P,a.S,a.C,a.I],['INT','INT','FLOAT','INT'],labels):putattr(me,name,typ,val)
 print('GEOMETRY_PROOF_DONE',ob.name,flush=True)
 for name,typ,val in [(a.FID,'INT',fid),(a.RFID,'INT',np.arange(n,dtype='i4')),(a.ORIGIN,'INT',origin),(a.TASK,'INT',task),(a.RINDEX,'INT',rindex)]+[(k,t,val) for k,t,val in zip([a.ROOT_P,a.ROOT_S,a.ROOT_C,a.ROOT_I],['INT','INT','FLOAT','INT'],mirrors)]:putattr(me,name,typ,val)
 print('ATTRIBUTES_DONE',ob.name,flush=True)
 oldcolor=me.color_attributes.active_color.name if me.color_attributes.active_color else None;a.attrs(me);ob['_sgo_object_id']=currentid;ob['sgor_original_source_object_id']=sourceuid or '';ob['sgor_provenance']=json.dumps(prov,ensure_ascii=False);m['objects'][currentid]={'source_name':ob.name,'mesh_name':me.name,'mesh':a.repair_mesh_signature(me),'object':a.object_signature(ob),'original_active_color':oldcolor,'original_source_object_id':sourceuid,'lineage_hashes':a.repair_identity_hashes(me),'provenance':prov}
for textname,data in [('SGOR_ORIGINAL_SEMANTICS.json',json.dumps({'encoding':'utf8-base64-chunks','original_sha256':inputs_before[str(JSON)],'data_chunks':b64chunks(raw_json)},indent=2)),('SGOR_SOURCE_LABEL_ARCHIVE.json',json.dumps(archive,indent=2)),('SGOR_RETIRED_ORIGINAL_FACES.json',json.dumps(retirement_records,indent=2))]:
 print('WRITE_ARCHIVE',textname,len(data),flush=True)
 assert textname not in bpy.data.texts;text=bpy.data.texts.new(textname);text.write(data)
archive_hashes={name:hashlib.sha256(bpy.data.texts[name].as_string().encode()).hexdigest() for name in ['SGOR_ORIGINAL_SEMANTICS.json','SGOR_SOURCE_LABEL_ARCHIVE.json','SGOR_RETIRED_ORIGINAL_FACES.json']}
assert counts=={'inherited_faces':1281758,'inherited_human':164407,'inherited_unknown':412512,'new_faces':79892,'retired_faces':217281,'retired_human':193853},counts
m['migration']={'version':'2.3.0','epoch':epoch,'root_asset_id':source_meta['asset_id'],'root_sha256':inputs_before[str(ROOT)],'root_json_sha256':inputs_before[str(JSON)],'repair_input_sha256':inputs_before[str(INPUT)],'method':'Verified exact source-face lookup; no nearest-neighbor, no automatic source classification','archive_hashes':archive_hashes,'protected_filenames':['SOUL.NEW.blend','soul.blend','soul_SGO_V1_WORK.blend','soul_SGO_V2_WORK.blend','soul_SGO_V2_1_1_WORK.blend','soul_SGO_V2_1_1_WORK_V2_2_WORK.blend']+['Soulgrain_Stage_'+s+'_REVIEW.blend' for s in 'ABC'],**counts}
sc.name='C_SEMANTIC_V2_3_CHECK';sc['REPAIR_NOTICE']='语义兼容副本：原面逐一验证继承；新增面为施工归属待验收。UNKNOWN 不重分类；几何仍是部分修复检查版。';a.put_meta(m);a.put_view({'hidden':[],'locked':[],'collapsed':['HARDWARE'],'solo':None,'solo_hidden':[]});sc.sgo_object=max(m['objects'],key=lambda uid:m['objects'][uid]['mesh']['faces']);sc.sgo_target='10';sc.sgo_r23_include_pending=True
# Safe name must be established in memory for guard initialization. This is a
# new output only; no input is saved or overwritten.
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT),compress=True,check_existing=False,relative_remap=False)
for ob in a.objects(m).values():a.recolor(ob.data,m)
a.invalidate();a.ensure_session(refresh=True);a.preview(True);a.validate();sc.sgo_message='已验证继承 1,281,758 原面；79,892 新修复面为待验收，非原始 HUMAN。';a.validate()
assert resources_before==a.resource_signature()
for ob in a.objects(m).values():assert geometry_before[ob.name]['mesh']==a.repair_mesh_signature(ob.data) and geometry_before[ob.name]['object']==a.object_signature(ob)
bpy.data.texts.new('先读我_语义兼容说明').write('此工程应使用 Soulgrain Semantic V2.3 修复兼容插件。原 V2.2 不支持真实修复后的拓扑。原面按真实源对象和源面 ID 验证继承；新面状态 3 只是施工归属，不是原人工确认。原始全部 UNKNOWN 保留且冻结。零件管理器可隐藏、单独查看和动态分解；展开新增修复由独立开关控制。原文件和原插件未覆盖；B/C 几何仍有待修区域。')
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT),compress=True,check_existing=False,relative_remap=False)
for path,before in inputs_before.items():assert hashlib.sha256(Path(path).read_bytes()).hexdigest()==before
report={'output':OUTPUT.name,'bytes':OUTPUT.stat().st_size,'sha256':hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),'counts':counts,'proof':proof,'geometry_uv_pbr_transforms_unchanged_by_migration':True,'new_pending_not_human':True,'all_source_inputs_unchanged':True,'original_plugin_sha256':hashlib.sha256(Path('/workspace/artifacts/soulgrain-semantic-v2-2/scripts/soulgrain_semantic_v2_2.py').read_bytes()).hexdigest()};(R/'reports/migration-verification.json').write_text(json.dumps(report,indent=2));print('VERIFIED_C_MIGRATION_PASS',json.dumps(report['counts']),report['bytes'],flush=True)
