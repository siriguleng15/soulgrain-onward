# ---------- V2.3 repair-epoch bridge: additive to the unchanged V2.2 tool ----------
import base64,zlib,copy
REPAIR_SCHEMA='soulgrain.repaired-face-semantics/2.3'
REPAIR_PENDING=3
RFID='sgo_face_id'
ORIGIN='sgor_origin'
TASK='sgor_task'
RINDEX='sgor_construction_face'
ROOT_P='sgor_original_part';ROOT_S='sgor_original_status';ROOT_C='sgor_original_confidence';ROOT_I='sgor_original_issue'
IMMUTABLE_ATTRS=[(FID,'INT'),(RFID,'INT'),(ORIGIN,'INT'),(TASK,'INT'),(RINDEX,'INT'),(ROOT_P,'INT'),(ROOT_S,'INT'),(ROOT_C,'FLOAT'),(ROOT_I,'INT')]
LEGACY_VALIDATE=validate
LEGACY_QUICK=quick_guard
LEGACY_EXPORT=export_payload
LEGACY_IMPORT=import_payload
LEGACY_MANUAL=_manual_transaction
LEGACY_AUTO=_auto_execute
LEGACY_GROW_JOB=make_growth_job
LEGACY_CLASSIFY=classify
LEGACY_V22_ELIGIBLE=v22_eligible
LEGACY_INSPECTION=_inspection_report
LEGACY_SUMMARY=summary
LEGACY_ROOT_DRAW=v22_root_draw
LEGACY_DATA_DRAW=v22_data_draw
LEGACY_GROW_DRAW=SGO2_PT_growth.draw
LEGACY_INSPECT_DRAW=SGO2_PT_inspector.draw
LEGACY_ROW_DRAW=v22_row_draw
LEGACY_V22_CHUNK=v22_rebuild_chunk
LEGACY_REGISTER=register
LEGACY_UNREGISTER=unregister

def repaired(m=None):
    return (m or meta()).get('schema')==REPAIR_SCHEMA

def repair_values(me,name):
    if me.is_editmode:
        bm=bmesh.from_edit_mesh(me);layer=(bm.faces.layers.float if name==ROOT_C else bm.faces.layers.int).get(name)
        if layer is None:raise ValueError('缺少来源属性：'+name)
        return np.fromiter((f[layer] for f in bm.faces),dtype='f4' if name==ROOT_C else 'i4',count=len(bm.faces))
    return array(me.attributes[name].data,'value',dtype='f4' if name==ROOT_C else 'i4')

def current_face_ids(me):
    return repair_values(me,RFID) if me.attributes.get(RFID) else face_ids(me)

def repair_mesh_signature(me):
    # Persisted data protects normals across Mac/Linux; evaluated corner-normal
    # caches are diagnostics, not an identity key. No geometry/UV check is skipped.
    d=mesh_signature(me);d.pop('normals');normal={'smooth_faces':digest(array(me.polygons,'use_smooth',dtype='bool')),'has_custom_normals':bool(me.has_custom_normals),'attributes':{}}
    for name in ['custom_normal','sharp_face','sharp_edge']:
        at=me.attributes.get(name)
        if at:
            width=2 if at.data_type=='INT16_2D' else 1;dtype='bool' if at.data_type=='BOOLEAN' else 'i4'
            values=array(at.data,'value',width,dtype)
            # Blender drops an all-false sharp flag layer on Edit/Object switches.
            # Absent and explicitly false have identical normal semantics.
            if at.data_type=='BOOLEAN' and not values.any():continue
            normal['attributes'][name]={'domain':at.domain,'type':at.data_type,'hash':digest(values)}
    d['persisted_normals']=normal;return d

def repair_identity_hashes(me):return {name:digest(repair_values(me,name)) for name,_ in IMMUTABLE_ATTRS}

def _repair_require_identity(o):
    m=meta()
    if not repaired(m):
        if not np.array_equal(face_ids(o.data),np.arange(len(o.data.polygons),dtype='i4')):raise ValueError('源面 ID 已失效')
        return
    uid=o.get('_sgo_object_id');entry=m['objects'].get(uid)
    if not entry:raise ValueError('对象不属于已验证修复版本')
    for name,typ in IMMUTABLE_ATTRS:
        at=o.data.attributes.get(name)
        if not at or at.domain!='FACE' or at.data_type!=typ:raise ValueError('来源字段缺失或类型不符：'+o.name+' '+name)
    if repair_identity_hashes(o.data)!=entry['lineage_hashes']:raise ValueError('稳定面 ID / 来源映射 / 原标签镜像发生改变：'+o.name)

def _repair_require_selection_identity(o,indices,source_fids):
    if not repaired():
        if not np.array_equal(source_fids,indices):raise ValueError('当前源面 ID 与固定拓扑不匹配，未写入')
    else:
        _repair_require_identity(o)
        if not np.array_equal(source_fids,repair_values(o.data,FID)[indices]):raise ValueError('所选面来源映射不一致')

def repair_validate(m=None,all_resources=True):
    m=m or safe_work()
    if not repaired(m):return LEGACY_VALIDATE(m,all_resources)
    sync_edit();errors=[]
    if m.get('repair_epoch')!=m.get('migration',{}).get('epoch'):raise ValueError('修复资产版本记录不一致')
    for uid,o in objects(m).items():
        try:
            for name,typ in [(P,'INT'),(S,'INT'),(C,'FLOAT'),(I,'INT')]:
                at=o.data.attributes.get(name)
                if not at or at.domain!='FACE' or at.data_type!=typ:raise ValueError('标签属性类型不匹配：'+name)
            if not o.data.color_attributes.get(COLOR):raise ValueError('预览颜色属性缺失')
            if repair_mesh_signature(o.data)!=m['objects'][uid]['mesh']:raise ValueError('几何 / 拓扑 / UV / 材质面索引 / 原始法线设置已变化')
            if object_signature(o)!=m['objects'][uid]['object']:raise ValueError('父级 / 变换 / 材质槽已变化')
            _repair_require_identity(o)
            pp,ss,cc,ii=read_labels(o.data);origin=repair_values(o.data,ORIGIN);rp=repair_values(o.data,ROOT_P)
            if not np.isin(pp,list(catalog(m))).all() or not np.isin(ss,[0,1,2,3]).all():raise ValueError('分类或来源状态无效')
            if not np.isfinite(cc).all() or ((cc<0)|(cc>1)).any() or not np.isin(ii,[0,1,2,3]).all():raise ValueError('置信值或问题标记无效')
            if ((ii!=0)&(pp!=0)).any():raise ValueError('待处理语义面必须为 UNKNOWN')
            if ((origin==0)&(rp==0)&(pp!=0)).any():raise ValueError('源 UNKNOWN 不允许重新归类')
            if ((origin==0)&(ss==REPAIR_PENDING)).any() or ((origin==1)&~np.isin(ss,[HUMAN,REPAIR_PENDING])).any():raise ValueError('新增 / 继承状态混淆')
        except Exception as exc:errors.append(o.name+'：'+str(exc))
    for textname,expected in m['migration']['archive_hashes'].items():
        text=bpy.data.texts.get(textname)
        if text is None or hashlib.sha256(text.as_string().encode()).hexdigest()!=expected:errors.append('源语义档案缺失或改变：'+textname)
    if all_resources:
        now=resource_signature()
        for typ in ['materials','images']:
            for name,expected in m['resources'][typ].items():
                if now[typ].get(name)!=expected:errors.append('原始 PBR / 图像资源改变：'+name)
    if errors:raise ValueError('修复版本校验未通过；未绕过拓扑检查。\n'+'\n'.join(errors[:5]))
    return m

def quick_guard(o):
    if not repaired():return LEGACY_QUICK(o)
    if o.mode=='EDIT':o.update_from_editmode()
    m=safe_work();b=m['objects'].get(o.get('_sgo_object_id'))
    if not b or repair_mesh_signature(o.data)!=b['mesh']:raise ValueError('当前几何 / UV / 法线设置与已验证修复版本不符')
    if object_signature(o)!=b['object']:raise ValueError('对象变换或材质绑定改变')
    _repair_require_identity(o);return m

# All V2/V2.1/V2.2 entry points now share the actual repair-aware guard.
validate=repair_validate
_V1_VALIDATE=repair_validate

def classify(o,m):
    if repaired(m):raise ValueError('修复检查工程禁止自动重识别；UNKNOWN 保持 UNKNOWN')
    return LEGACY_CLASSIFY(o,m)

def _auto_execute(self,context):
    if META in context.scene and repaired():return report_error(self,ValueError('当前修复版本禁用自动候选，不重新分类 UNKNOWN'))
    return LEGACY_AUTO(self,context)

def make_growth_job():
    if repaired():raise ValueError('本修复验收工程禁用智能扩展重分类；保留 UNKNOWN。可显式检查和确认新增修复面。')
    return LEGACY_GROW_JOB()

def _manual_transaction(context,code,operation,issue_value=None):
    m=safe_work()
    if not repaired(m):return LEGACY_MANUAL(context,code,operation,issue_value)
    o=explicit_mesh(context);ix=selected_ids(o)
    if len(ix):
        frozen=(repair_values(o.data,ORIGIN)[ix]==0)&(repair_values(o.data,ROOT_P)[ix]==0)
        if code!=0 and frozen.any():raise ValueError('选区含原始 UNKNOWN；本修复验收版本禁止改类，整次未写入')
    result=LEGACY_MANUAL(context,code,operation,issue_value)
    if result=={'FINISHED'}:
        record=json.loads(context.scene['_sgo_v21_last_assignment']);record.update(current_face_ids=current_face_ids(o.data)[ix].tolist(),origin=repair_values(o.data,ORIGIN)[ix].tolist(),original_source_object_id=m['objects'][o['_sgo_object_id']].get('original_source_object_id'),repair_epoch=m['repair_epoch']);context.scene['_sgo_v21_last_assignment']=json.dumps(record,ensure_ascii=False)
    return result

def summary(m=None):
    m=m or meta();d=LEGACY_SUMMARY(m)
    if repaired(m):
        pending=confirmed=0
        for o in objects(m).values():
            pp,ss,cc,ii=read_labels(o.data);origin=repair_values(o.data,ORIGIN);pending+=int(((origin==1)&(ss==REPAIR_PENDING)).sum());confirmed+=int(((origin==1)&(ss==HUMAN)).sum())
        d.update(repair_pending=pending,repair_confirmed=confirmed,original_inherited_faces=m['migration']['inherited_faces'],source_retired_human=m['migration']['retired_human'])
    return d

def _inspection_report(o,ix,origin='INSPECT'):
    d=LEGACY_INSPECTION(o,ix,origin)
    if not repaired():return d
    kinds=repair_values(o.data,ORIGIN)[ix];d['repair_origins']={'inherited':int((kinds==0).sum()),'new':int((kinds==1).sum())};d['repair_pending']=int((read_labels(o.data)[1][ix]==REPAIR_PENDING).sum())
    if d.get('detail'):
        i=int(ix[0]);row=meta()['objects'][o['_sgo_object_id']];d['detail'].update(current_face_id=int(current_face_ids(o.data)[i]),origin='VERIFIED_INHERITED' if kinds[0]==0 else 'NEW_REPAIR',original_source_object_id=row.get('original_source_object_id'),task=int(repair_values(o.data,TASK)[i]),construction_face=int(repair_values(o.data,RINDEX)[i]),evidence=row.get('provenance',{}).get('basis','精确源面映射'))
    return d

def v22_eligible(e):
    if not repaired():return LEGACY_V22_ELIGIBLE(e)
    group,eligible=LEGACY_V22_ELIGIBLE(e)
    if bpy.context.scene.sgo_r23_include_pending:eligible|=(group>=0)&(e['i']==0)&(e['s']==REPAIR_PENDING)
    return group,eligible

def v22_rebuild_chunk(uid,block):
    LEGACY_V22_CHUNK(uid,block)
    if repaired():
        o=objects()[uid];cf=current_face_ids(o.data);root=face_ids(o.data)
        for key,frag in display22().fragments.items():
            if key[:2]==(uid,block):
                ix=frag['polygon_indices'];frag['current_face_ids']=cf[ix].copy();frag['root_source_face_ids']=root[ix].copy();frag['repair_epoch']=meta()['repair_epoch']

def _repair_pack(a):
    a=np.asarray(a,dtype='f4' if np.asarray(a).dtype.kind=='f' else 'i4');raw=a.tobytes();return {'dtype':a.dtype.str,'count':len(a),'sha256':hashlib.sha256(raw).hexdigest(),'encoding':'zlib-base64','data':base64.b64encode(zlib.compress(raw,6)).decode()}

def _repair_unpack(x,n,dtype):
    if x.get('encoding')!='zlib-base64' or x.get('count')!=n or np.dtype(x.get('dtype'))!=np.dtype(dtype):raise ValueError('来源数组格式或长度不符')
    decoder=zlib.decompressobj();raw=decoder.decompress(base64.b64decode(x['data'],validate=True),n*4+1)
    if len(raw)!=n*4 or not decoder.eof or decoder.unused_data or decoder.unconsumed_tail or hashlib.sha256(raw).hexdigest()!=x['sha256']:raise ValueError('来源数组校验失败或压缩数据超限')
    return np.frombuffer(raw,dtype=dtype).copy()

def export_payload():
    if not repaired():return LEGACY_EXPORT()
    no_pending();m=validate();data={'schema':REPAIR_SCHEMA,'tool_version':'2.3.0','asset_id':m['asset_id'],'repair_epoch':m['repair_epoch'],'source_sha256':m['source_sha256'],'root_source_sha256':m['migration']['root_sha256'],'parts':copy.deepcopy(m['parts']),'hierarchy':copy.deepcopy(m['hierarchy']),'migration':copy.deepcopy(m['migration']),'objects':[],'summary':summary(m),'formal_boundary_certified':False,'split_authorized':False,'status_meaning':{'0':'unassigned','1':'inherited_auto_candidate','2':'human_confirmed (origin still distinguishes inherited/new)','3':'new_repair_task_attribution_PENDING_HUMAN_ACCEPTANCE'},'v2_ui_state':view_state()}
    for uid,o in objects(m).items():
        labels=read_labels(o.data);entry=m['objects'][uid]
        data['objects'].append({'object_id':uid,'current_name':o.name,'face_count':len(labels[0]),'mesh_signature':entry['mesh'],'object_signature':entry['object'],'lineage_hashes':entry['lineage_hashes'],'provenance':entry['provenance'],'identity_attributes':{name:_repair_pack(repair_values(o.data,name)) for name,_ in IMMUTABLE_ATTRS},'runs':encode_runs(labels),'confidence_float32':_repair_pack(labels[2])})
    return data

def import_payload(data,replace_manual=False):
    if not repaired():return LEGACY_IMPORT(data,replace_manual)
    no_pending();m=validate()
    for key,value in [('schema',REPAIR_SCHEMA),('asset_id',m['asset_id']),('repair_epoch',m['repair_epoch']),('source_sha256',m['source_sha256'])]:
        if data.get(key)!=value:raise ValueError('JSON 修复版本 / 资产来源不符，未导入任何数据：'+key)
    if data.get('migration')!=m['migration'] or data.get('parts')!=m['parts'] or data.get('hierarchy')!=m['hierarchy']:raise ValueError('来源档案 / 稳定零件字典不匹配')
    if locked_codes():raise ValueError('有锁定分类，不允许批量导入覆盖')
    obs=objects(m);rows=data.get('objects',[])
    if len(rows)!=len(obs) or {x.get('object_id') for x in rows}!=set(obs):raise ValueError('对象集合不符')
    prepared=[];skipped=0
    for row in rows:
        uid=row['object_id'];o=obs[uid];entry=m['objects'][uid];n=len(o.data.polygons)
        if row.get('face_count')!=n or any(row.get(k)!=entry[v] for k,v in [('mesh_signature','mesh'),('object_signature','object'),('lineage_hashes','lineage_hashes'),('provenance','provenance')]):raise ValueError('拓扑 / UV / 来源版本不符：'+o.name)
        for name,typ in IMMUTABLE_ATTRS:
            incoming=_repair_unpack(row['identity_attributes'][name],n,'f4' if typ=='FLOAT' else 'i4')
            if not np.array_equal(incoming,repair_values(o.data,name)):raise ValueError('来源面映射不符：'+o.name+' '+name)
        pp=np.zeros(n,'i4');ss=np.zeros(n,'i4');cc=np.zeros(n,'f4');ii=np.zeros(n,'i4');cursor=0
        for run in row['runs']:
            if len(run)!=6 or not all(isinstance(x,int) and not isinstance(x,bool) for x in run):raise ValueError('标签分段格式无效')
            a,count,p,s,c,i=run
            if a!=cursor or count<=0 or a+count>n or p not in catalog(m) or s not in [0,1,2,3] or not 0<=c<=10000 or i not in [0,1,2,3] or (i!=0 and p!=0):raise ValueError('标签分段越界或无效')
            pp[a:a+count]=p;ss[a:a+count]=s;cc[a:a+count]=c/10000;ii[a:a+count]=i;cursor+=count
        if cursor!=n:raise ValueError('标签没有完整覆盖当前版本')
        exact_c=_repair_unpack(row['confidence_float32'],n,'f4')
        if not np.isfinite(exact_c).all() or ((exact_c<0)|(exact_c>1)).any() or not np.array_equal(np.rint(exact_c*10000).astype('i4'),np.rint(cc*10000).astype('i4')):raise ValueError('精确置信值与分段校验不符')
        cc=exact_c
        origin=repair_values(o.data,ORIGIN);rp=repair_values(o.data,ROOT_P);new=[pp,ss,cc,ii]
        if ((origin==0)&(rp==0)&(pp!=0)).any():raise ValueError('JSON 试图改变源 UNKNOWN，整次拒绝')
        if ((origin==0)&(ss==3)).any() or ((origin==1)&~np.isin(ss,[2,3])).any():raise ValueError('新增修复与继承状态混淆')
        old=read_labels(o.data);protect=old[1]==HUMAN;skipped+=int(protect.sum())
        for a,b in zip(new,old):a[protect]=b[protect]
        prepared.append((o,old,new))
    was_edit=bpy.context.mode=='EDIT_MESH'
    if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
    try:
        for o,old,new in prepared:write_labels(o.data,new);recolor(o.data,m)
        for o,old,new in prepared:
            if not all(np.array_equal(a,b) for a,b in zip(read_labels(o.data),new)):raise ValueError('真实面属性回读失败')
    except Exception:
        for o,old,new in prepared:
            for name,value in zip([P,S,C,I],old):o.data.attributes[name].data.foreach_set('value',value)
            o.data.update();recolor(o.data,m)
        raise
    finally:
        if was_edit:bpy.ops.object.mode_set(mode='EDIT')
    invalidate();ensure_session(refresh=True);apply_visibility();return skipped

def repair_pending_hist():
    r=rt();key=(r.asset,r.revision,tuple((u,id(e)) for u,e in r.entries.items()))
    if getattr(r,'repair_pending_hist_key',None)!=key:
        hist=collections.Counter()
        for e in r.entries.values():
            vals,counts=np.unique(e['p'][e['s']==3],return_counts=True);hist.update(dict(zip(vals.tolist(),counts.tolist())))
        r.repair_pending_hist_key=key;r.repair_pending_hist_cache=dict(hist)
    return r.repair_pending_hist_cache

def repair_root_draw(self,context):
    if META not in context.scene or not repaired():return LEGACY_ROOT_DRAW(self,context)
    l=self.layout;l.label(text='修复资产 V2.3 · 来源已核验',icon='CHECKMARK');l.label(text='UNKNOWN 冻结；新面归属 ≠ 原始人工确认',icon='LOCKED');l.label(text='B/C 几何仍部分完成，语义兼容不等于结构验收')
    row=l.row(align=True);row.operator('sgo.frame',text='框显原鞋');row.operator('sgo.object_mode',text='返回对象选择');l.operator('sgo_v2.refresh',text='读取零件管理器 / 刷新真实统计')
    if rt().ready:
        pending=sum(repair_pending_hist().values());l.label(text=f'原面继承 {meta()["migration"]["inherited_faces"]:,} · 新面待验收 {pending:,}')
    for line in context.scene.sgo_message.split('；')[:2]:l.label(text=line[:68])

def repair_data_draw(self,context):
    if not repaired():return LEGACY_DATA_DRAW(self,context)
    l=self.layout;l.label(text='自动候选 / 智能重分类已禁用',icon='LOCKED');l.operator('sgo.toggle_preview');l.operator('sgo.validate',text='校验当前拓扑、来源、UV 与材质');l.operator('sgo_r23.save_copy',icon='DUPLICATE');l.operator('sgo.save_work');l.operator('sgo.export_json',text='导出修复版本 JSON（含映射）');l.operator('sgo.import_json',text='导入本修复版本 JSON');l.label(text='原 V2.2 JSON 不能套用到新拓扑；人工标签批量导入保护。')

def repair_grow_draw(self,context):
    if not repaired():return LEGACY_GROW_DRAW(self,context)
    self.layout.label(text='本检查版不运行自动扩展，UNKNOWN 保留。',icon='LOCKED');self.layout.label(text='可在网格检查中逐面验收新增修复。')

def repair_inspector_draw(self,context):
    LEGACY_INSPECT_DRAW(self,context)
    if not repaired():return
    l=self.layout;l.label(text='状态 3 = 新增修复 / 施工归属 / 待人工验收',icon='INFO')
    d=json.loads(context.scene.get('_sgo_v2_inspection','{}'));detail=d.get('detail')
    if detail and detail.get('origin'):
        box=l.box();box.label(text='当前稳定面 ID：'+str(detail['current_face_id']));box.label(text='原面精确继承' if detail['origin']=='VERIFIED_INHERITED' else '新增修复：不是源面，也不是继承 HUMAN')
        if detail['origin']=='VERIFIED_INHERITED':box.label(text='原对象：'+str(detail['original_source_object_id']));box.label(text='原面 ID：'+str(detail['source_face_id']))
        else:box.label(text=f'施工任务 {detail["task"]} · 补片面 {detail["construction_face"]}');box.label(text=detail.get('evidence','')[:68])
    if 'repair_origins' in d:l.label(text=f'选择：继承 {d["repair_origins"]["inherited"]:,} / 新增 {d["repair_origins"]["new"]:,} / 待验收 {d["repair_pending"]:,}')

def repair_row_draw(self,context,layout,data,item,icon,active_data,active_propname,index):
    LEGACY_ROW_DRAW(self,context,layout,data,item,icon,active_data,active_propname,index)
    if META in context.scene and repaired() and rt().ready:
        codes=rt().tree.get(item.key,{}).get('codes',[]);n=sum(repair_pending_hist().get(c,0) for c in codes)
        if n:layout.label(text=f'待验 {n:,}',icon='TIME')

class SGO_R23_PT_lineage(bpy.types.Panel):
    bl_label='修复来源与验收';bl_idname='SGO_R23_PT_lineage';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    @classmethod
    def poll(cls,context):return META in context.scene and repaired(meta(context.scene))
    def draw(self,context):
        l=self.layout;m=meta();l.label(text='资产版本：'+m['repair_epoch'][:16]);l.label(text=f'继承原面 {m["migration"]["inherited_faces"]:,} / 新修复 {m["migration"]["new_faces"]:,}');l.label(text=f'旧几何已退休 HUMAN {m["migration"]["retired_human"]:,}：保留归档，不伪贴新面');l.prop(context.scene,'sgo_r23_include_pending',text='分解展示新增修复（仍为待验收）');l.label(text='独立于“自动候选”开关；UNKNOWN 始终不展开。');l.operator('sgo_r23.save_copy',text='另存验收工作副本')

class SGO_R23_OT_copy(bpy.types.Operator,ExportHelper):
    bl_idname='sgo_r23.save_copy';bl_label='另存 V2.3 验收工作工程';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):self.filepath=str(Path(bpy.data.filepath).with_name(Path(bpy.data.filepath).stem+'_WORK.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            m=validate();no_pending();src=Path(bpy.data.filepath).resolve();dest=Path(self.filepath).expanduser().resolve()
            if dest.exists() or dest==src or dest.suffix.lower()!='.blend' or dest.name in m['migration']['protected_filenames']:raise ValueError('请选择全新的 .blend 文件名，不覆盖旧工程')
            if display22().active:v22_exit()
            if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False,compress=True);context.scene.sgo_message='已另存修复验收工作副本；来源和人工数据未改变。';return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

REPAIR_CLASSES=[SGO_R23_OT_copy,SGO_R23_PT_lineage]
def register():
    LEGACY_REGISTER()
    for cls in REPAIR_CLASSES:bpy.utils.register_class(cls)
    bpy.types.Scene.sgo_r23_include_pending=BoolProperty(name='展开新增修复（待验收）',default=True,update=v22_settings_changed)
    SGO2_PT_root.draw=repair_root_draw;SGO2_PT_root.bl_label='Soulgrain V2.3 · 修复资产语义管理';SGO2_PT_data.draw=repair_data_draw;SGO2_PT_growth.draw=repair_grow_draw;SGO2_PT_inspector.draw=repair_inspector_draw;SGO2_UL_tree.draw_item=repair_row_draw
    # Native state=3 is never labelled automatic or original HUMAN.
    registration={'runtime':rt,'cleanup':unregister};bpy._sgo_v2_registration=registration;bpy.app.driver_namespace['SGO_V2_REGISTRATION']=registration

def unregister():
    for cls in reversed(REPAIR_CLASSES):
        if getattr(cls,'is_registered',False):bpy.utils.unregister_class(cls)
    if hasattr(bpy.types.Scene,'sgo_r23_include_pending'):del bpy.types.Scene.sgo_r23_include_pending
    SGO2_PT_growth.draw=LEGACY_GROW_DRAW;SGO2_PT_inspector.draw=LEGACY_INSPECT_DRAW
    LEGACY_UNREGISTER()

if __name__=='__main__':register()
