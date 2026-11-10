# ---------- V2.2: runtime-only, real-triangle semantic display workbench ----------
# GPU batches/CPU triangle caches are the temporary display meshes. They never
# enter bpy.data, the scene graph, export, undo data, or the original mesh.
from bpy.props import FloatVectorProperty
from mathutils import Matrix
from contextlib import contextmanager

@contextmanager
def v22_view_context():
    windows=bpy.context.window_manager.windows
    match=next(((w,a) for w in windows for a in w.screen.areas if a.type=='VIEW_3D'),None)
    if match:
        w,a=match;region=next((r for r in a.regions if r.type=='WINDOW'),None)
        with bpy.context.temp_override(window=w,area=a,region=region):yield
    else:yield

def sync_edit():
    for o in bpy.context.scene.objects:
        if o.type=='MESH' and o.mode=='EDIT':o.update_from_editmode()

_V22_BASE_MODEGUARD=_mode_guard
def _mode_guard():
    with v22_view_context():return _V22_BASE_MODEGUARD()

V22_VERSION='2.2.0'
V22_BLOCK=8192
V22_LAYOUT='_sgo_v22_layout'
V22_RECOVERY='_sgo_v22_display_recovery'
V22_GROUPS=[('UPPER','鞋身（含后跟）',(0,-1.15,0)),('CUFF','翻筒',(0,.95,.8)),('TONGUE','鞋舌',(-.3,0,1.2)),('SOLING','鞋底',(0,1.1,-.7)),('HARDWARE','鞋眼 / 五金',(1.05,0,.6)),('LACE','鞋带',(-1.1,0,.4)),('DECORATION','缝线 / 装饰',(1.1,-1,.05))]
_V22=None
_V22_BASE_SESSION=ensure_session
_V22_BASE_SAFE=safe_work
_V22_BASE_REGISTER=register
_V22_BASE_UNREGISTER=unregister
_V22_BASE_APPLY=apply_visibility
_V22_BASE_MANUAL=_manual_transaction
_V22_BASE_MARK=mark_cache_changed
_V22_BASE_PREVIEW=preview
_V22_BASE_EXPORT=export_payload
_V22_BASE_SAVE=_save_execute
_V22_BASE_ROOT_DRAW=SGO2_PT_root.draw
_V22_BASE_MANAGER_DRAW=SGO2_PT_manager.draw
_V22_BASE_ROW_DRAW=SGO2_UL_tree.draw_item
_V22_BASE_DATA_DRAW=SGO2_PT_data.draw
_V22_BASE_SELECT_CLASS=SGO2_OT_select.execute
_V22_BASE_OBJECT_EXEC=_object_execute
_V22_BASE_PICK_EXEC=_pick_execute

class V22Display:
    def __init__(self):
        self.active=False;self.building=False;self.history=False;self.session=uuid.uuid4().hex
        self.snapshot=None;self.geom={};self.fragments={};self.queue=set();self.moved={}
        self.dirty=set();self.seen={};self.vis=None;self.layout=None;self.shader=None
        self.handlers=[];self.anim={};self.last_report={};self.last_refresh=0.;self.error=''
        self.rebuilt=0;self.total=0;self.started=0.;self.ready=False;self.viewport=[]
        self.suspended=False;self.guard=False

def ensure_session(refresh=False):
    r=_V22_BASE_SESSION(refresh);d=display22()
    if V22_RECOVERY in bpy.context.scene and not d.active and not d.guard:
        d.guard=True
        try:v22_recover_saved_view()
        finally:d.guard=False
    return r

def safe_work():
    m=_V22_BASE_SAFE();v=m.get('v22',{});p=Path(bpy.data.filepath).resolve()
    if str(p)==v.get('input_work_path') or p.name==v.get('input_work_name'):
        raise ValueError('不能写入 V2.2 升级前的工程；请使用新的工作文件')
    return m

def display22():
    global _V22
    if _V22 is None:_V22=V22Display()
    return _V22

def v22_group_codes(m=None):
    rows=catalog(m);keys={x['key']:x for x in rows.values()};known={x[0] for x in V22_GROUPS};out={}
    for code,row in rows.items():
        key=row['key'];seen=set()
        while key and key not in known and key not in seen:
            seen.add(key);key=keys.get(key,{}).get('parent','HARDWARE' if key=='V2_CUFF_EYELETS' else '')
        out[code]=key if code!=0 and key in known else None
    return out

def v22_settings_changed(self,context):
    d=display22()
    if d.active:
        d.history=True
        if context:context.scene.sgo_v22_message='展示设置改变：正在从真实标签同步；锚点保持不变。'

def v22_offset_changed(self,context):
    d=display22()
    if not d.active:return
    # Offsets only affect draw transforms; never rebuild source or display geometry.
    d.anim.clear();v22_redraw()

def v22_redraw():
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':area.tag_redraw()

def v22_component_rows():
    sc=bpy.context.scene
    if not len(sc.sgo_v22_groups):
        for key,name,offset in V22_GROUPS:
            row=sc.sgo_v22_groups.add();row.key=key;row.label=name;row.offset=offset;row.expanded=True
    return {row.key:row for row in sc.sgo_v22_groups}

def v22_make_layout(obs):
    saved=json.loads(bpy.context.scene.get(V22_LAYOUT,'{}'))
    if saved.get('asset_id')==meta()['asset_id']:
        return saved
    primary=max(obs.values(),key=lambda o:len(o.data.polygons))
    basis=np.asarray(primary.matrix_world.to_quaternion().to_matrix(),dtype='f8')
    corners=np.asarray([tuple(o.matrix_world@Vector(c)) for o in obs.values() for c in o.bound_box],dtype='f8')
    projected=corners@basis
    lo=projected.min(axis=0);hi=projected.max(axis=0)
    layout={'asset_id':meta()['asset_id'],'basis':basis.tolist(),'span':float(max(hi-lo)),
            'center':(basis@((lo+hi)/2)).tolist(),'axes':'原模型旋转轴：左侧 -Y；上方 +Z；前方 -X；不使用屏幕方向'}
    if layout['span']<=1e-8:raise ValueError('整鞋尺寸为零，不能建立固定锚点')
    bpy.context.scene[V22_LAYOUT]=json.dumps(layout,ensure_ascii=False)
    return layout

def v22_offset(group):
    d=display22();row=v22_component_rows()[group]
    return np.asarray(d.layout['basis'])@np.asarray(row.offset,dtype='f8')*d.layout['span']*bpy.context.scene.sgo_v22_distance

def v22_capture():
    snap={'objects':{uid:{'hidden':hidden_array(o).copy(),'selected':selected_ids(o).copy()} for uid,o in objects().items()},'active_uid':bpy.context.active_object.get('_sgo_object_id') if bpy.context.active_object else None,'select_mode':tuple(bpy.context.tool_settings.mesh_select_mode)};snap['view']=view_state();snap['mode']=bpy.context.mode
    snap['editing']=[o.get('_sgo_object_id') for o in bpy.context.objects_in_mode_unique_data if o.type=='MESH']
    snap['active_colors']={uid:o.data.color_attributes.active_color.name if o.data.color_attributes.active_color else None for uid,o in objects().items()};snap['preview']=bpy.context.scene.sgo_preview
    snap['selected_objects']=[o.get('_sgo_object_id') for o in bpy.context.selected_objects if o.get('_sgo_object_id')]
    snap['object_hidden']={uid:o.hide_get() for uid,o in objects().items()}
    snap['shading']=[]
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                space=area.spaces.active;snap['shading'].append((space,space.shading.type,space.shading.color_type))
    return snap

def v22_encode_recovery(snap):
    # Stored only as an emergency display recovery record; no source attributes.
    return json.dumps({'asset_id':meta()['asset_id'],'view':snap['view'],
      'objects':{uid:{'hidden':np.flatnonzero(x['hidden']).tolist(),'selected':x['selected'].tolist()} for uid,x in snap['objects'].items()},
      'active_uid':snap['active_uid'],'select_mode':list(snap['select_mode']),'mode':snap['mode'],
      'selected_objects':snap['selected_objects'],'object_hidden':snap['object_hidden'],'editing':snap['editing'],'active_colors':snap['active_colors'],'preview':snap['preview']},separators=(',',':'))

def v22_restore_snapshot(snap):
    obs=objects();put_view(snap['view'])
    # Face visibility is a view-only property. Do not restore any labels/colors/UV.
    for uid,x in snap['objects'].items():
        o=obs[uid];hidden=x['hidden'];sel=np.zeros(len(hidden),bool);sel[x['selected']]=True
        if len(hidden)!=len(o.data.polygons):raise ValueError('显示恢复发现拓扑数量不一致：'+o.name)
        if o.mode=='EDIT':
            bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table()
            for f in bm.faces:
                f.hide_set(bool(hidden[f.index]));f.select_set(bool(sel[f.index] and not hidden[f.index]))
            bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
        else:
            o.data.polygons.foreach_set('hide',hidden);o.data.polygons.foreach_set('select',sel&~hidden);o.data.update()
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    selection=snap.get('editing',[]) if snap['mode']=='EDIT_MESH' else snap['selected_objects']
    for uid in selection:
        if uid in obs:obs[uid].hide_set(False);obs[uid].select_set(True)
    if snap['active_uid'] in obs:bpy.context.view_layer.objects.active=obs[snap['active_uid']]
    if snap['mode']=='EDIT_MESH' and selection:bpy.ops.object.mode_set(mode='EDIT')
    for uid,state in snap['object_hidden'].items():
        if uid in obs:obs[uid].hide_set(state if obs[uid].mode!='EDIT' else False)
    for uid,name in snap.get('active_colors',{}).items():
        if name and obs[uid].data.color_attributes.get(name):obs[uid].data.color_attributes.active_color=obs[uid].data.color_attributes[name]
    bpy.context.scene.sgo_preview=snap.get('preview',True)
    bpy.context.tool_settings.mesh_select_mode=snap['select_mode']
    for space,typ,col in snap.get('shading',[]):
        try:space.shading.type=typ;space.shading.color_type=col
        except ReferenceError:pass
    for e in rt().entries.values():e['visible_codes']=None
    rebuild_rows()

def v22_recover_saved_view():
    sc=bpy.context.scene
    if V22_RECOVERY not in sc:return False
    data=json.loads(sc[V22_RECOVERY]);obs=objects()
    if data['asset_id']!=meta()['asset_id']:raise ValueError('应急显示记录版本不匹配，请保留文件并检查')
    for uid,x in data['objects'].items():
        n=len(obs[uid].data.polygons);hidden=np.zeros(n,bool);ix=np.asarray(x['hidden'],dtype='i4')
        if ix.size and (ix.min()<0 or ix.max()>=n):raise ValueError('应急显示面 ID 超出范围')
        hidden[ix]=True;x['hidden']=hidden;x['selected']=np.asarray(x['selected'],dtype='i4')
    data['shading']=[];v22_restore_snapshot(data);sc.pop(V22_RECOVERY,None)
    sc.sgo_v22_message='已恢复上次异常退出前的显示状态；真实标签未改动。';return True

def v22_read_geometry(o):
    o.update_from_editmode() if o.mode=='EDIT' else None
    me=o.data;me.calc_loop_triangles()
    co=array(me.vertices,'co',3,'f4');mw=np.asarray(o.matrix_world,dtype='f8')
    world=(co@mw[:3,:3].T+mw[:3,3]).astype('f4')
    tri=array(me.loop_triangles,'vertices',3,'i4');face=array(me.loop_triangles,'polygon_index',dtype='i4')
    if not np.array_equal(face_ids(me),np.arange(len(me.polygons),dtype='i4')):raise ValueError('稳定面 ID 失效')
    if np.any(np.diff(face)<0):order=np.argsort(face,kind='stable');tri=tri[order];face=face[order]
    bounds=np.searchsorted(face,np.arange(0,len(me.polygons)+V22_BLOCK,V22_BLOCK))
    return {'world':world,'tri':tri,'face':face,'bounds':bounds,'uid':o['_sgo_object_id'],'name':o.name,
            'native_hidden':hidden_array(o)&np.isin(get_entry(o)['p'],list(visible_codes()))}

def v22_eligible(e):
    sc=bpy.context.scene;groups=v22_component_rows();mapping=v22_group_codes(rt().m)
    maxcode=max(catalog(rt().m));lut=np.full(maxcode+1,-1,'i4');names=[x[0] for x in V22_GROUPS]
    for code,key in mapping.items():
        if key and groups[key].expanded:lut[code]=names.index(key)
    safe=(e['p']>=0)&(e['p']<=maxcode);group=np.full(len(e['p']),-1,'i4');group[safe]=lut[e['p'][safe]]
    eligible=(group>=0)&(e['i']==0)&((e['s']==HUMAN)|((e['s']==AUTO)&sc.sgo_v22_include_auto))
    return group,eligible

def v22_filter_sources():
    d=display22()
    if not d.active:return _V22_BASE_APPLY()
    ensure_edit_for_visibility();vis=visible_codes()
    for uid,e in rt().entries.items():
        if uid not in d.geom:continue
        o=e['object'];group,eligible=v22_eligible(e);g=d.geom[uid]
        moved=eligible&np.isin(e['p'],list(vis))&~g['native_hidden'];d.moved[uid]=moved
        managed=~np.isin(e['p'],list(vis))&(e['i']==0)
        desired=g['native_hidden']|managed|moved;cur=hidden_array(o);changed=np.flatnonzero(cur!=desired)
        bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table()
        for i in changed:bm.faces[int(i)].hide_set(bool(desired[i]))
        if len(changed):bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
        e['managed_hide']=desired;e['visible_codes']=vis.copy()
    rebuild_rows()

def apply_visibility(force_all=False):
    d=display22()
    if not d.active:return _V22_BASE_APPLY(force_all)
    # Updates the reversible source filter, but never draws a speculative commit.
    v22_filter_sources();d.history=True

def mark_cache_changed(o,indices=None,values=None):
    _V22_BASE_MARK(o,indices,values)
    d=display22()
    if d.active:
        if indices is None:d.history=True
        else:d.dirty.update((o['_sgo_object_id'],int(i)) for i in np.unique(np.asarray(indices)//V22_BLOCK))

def v22_schedule(reconcile=False):
    d=display22()
    if not d.active:return
    r=ensure_session(refresh=reconcile);vis=visible_codes();mapping=v22_group_codes(r.m);names=[x[0] for x in V22_GROUPS]
    for uid,e in r.entries.items():
        group,eligible=v22_eligible(e)
        mask=eligible&np.isin(e['p'],list(vis))&~d.geom[uid]['native_hidden']
        # Two arrays provide a byte-exact per-face display revision. No hashing guesses.
        shown=np.where(mask,group,-1).astype('i4');codes=np.where(mask,e['p'],0).astype('i4')
        old=d.seen.get(uid)
        if old is None:dirty=set(range((len(shown)+V22_BLOCK-1)//V22_BLOCK))
        else:dirty=set(np.unique(np.flatnonzero((old[0]!=shown)|(old[1]!=codes))//V22_BLOCK).tolist())
        dirty.update(block for u,block in d.dirty if u==uid)
        for block in dirty:d.queue.add((uid,block))
        d.seen[uid]=(shown,codes)
    d.dirty.clear();d.vis=vis;d.history=False
    v22_filter_sources()
    if d.queue:bpy.context.scene.sgo_v22_message=f'正在同步展示：{len(d.queue):,} 个缓存块（每块最多 {V22_BLOCK:,} 个源面）。'

def v22_rebuild_chunk(uid,block):
    d=display22();g=d.geom[uid];shown,codes=d.seen[uid];start,end=g['bounds'][block:block+2]
    polys=g['face'][start:end];tri=g['tri'][start:end];group_per_tri=shown[polys];part=codes[polys]
    palette=catalog(rt().m);old={key:d.fragments.pop(key) for key in list(d.fragments) if key[:2]==(uid,block)}
    for gi in np.unique(group_per_tri):
        if gi<0:continue
        group=V22_GROUPS[int(gi)][0];keep=group_per_tri==gi;fid=polys[keep].copy();pos=g['world'][tri[keep]].copy()
        normals=np.cross(pos[:,1]-pos[:,0],pos[:,2]-pos[:,0]);normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-20)
        light=.4+.6*np.abs(normals@np.asarray((.32,-.45,.83),'f4'))
        rgb=np.empty((len(fid),3),'f4')
        for code in np.unique(part[keep]):rgb[part[keep]==code]=palette[int(code)]['color']
        rgba=np.ones((len(fid),3,4),'f4');rgba[:,:,:3]=(rgb*light[:,None])[:,None,:]
        key=(uid,block,group);prior=old.get(key)
        frag={'namespace':'__SGO_V22_DISPLAY__','session':d.session,'source_object_id':uid,'source_face_ids':fid,
              'positions':pos.reshape(-1,3),'colors':rgba.reshape(-1,4),'group':group,'batch':None}
        d.fragments[key]=frag
        # Animate newly arriving actual triangles only, without moving old triangles.
        if not d.building and bpy.context.scene.sgo_v22_animate:
            previous=prior['source_face_ids'] if prior else np.empty(0,'i4');added=~np.isin(fid,previous)
            if added.any() and added.sum()+sum(len(a['ids']) for a in d.anim.values())<=bpy.context.scene.sgo_v22_animation_limit:
                d.anim[key]={'ids':fid[added],'start':time.perf_counter(),'positions':pos[added].reshape(-1,3).copy(),'colors':rgba[added].reshape(-1,4).copy(),'batch':None}
    for key in old:
        if key not in d.fragments:d.anim.pop(key,None)
        elif key in d.anim and not np.isin(d.anim[key]['ids'],d.fragments[key]['source_face_ids']).all():d.anim.pop(key,None)
    d.rebuilt+=1

def v22_pump(budget=.045):
    d=display22();t=time.perf_counter()
    while d.active and d.queue and time.perf_counter()-t<budget:
        uid,block=d.queue.pop();v22_rebuild_chunk(uid,block)
    if d.active and not d.queue:
        d.ready=True;d.building=False
        count=sum(len(x['source_face_ids']) for x in d.fragments.values())
        mem=v22_memory_bytes();d.last_report={'display_triangles':count,'cache_blocks':len(d.fragments),'rebuilt_blocks_total':d.rebuilt,'cpu_cache_bytes':mem,'session':d.session,'source_objects':len(d.geom)}
        bpy.context.scene.sgo_v22_message=f'展示已同步：{count:,} 个真实三角面；{len(d.fragments)} 个缓存片段；CPU 缓存 {mem/2**20:.1f} MiB。'
    v22_redraw()

def v22_flush():
    d=display22()
    if not d.active:return
    if d.history or d.dirty:v22_schedule(reconcile=d.history)
    while d.queue:v22_pump(10.)
    return d.last_report

def v22_memory_bytes():
    d=display22();total=0
    for g in d.geom.values():total+=sum(v.nbytes for v in g.values() if isinstance(v,np.ndarray))
    for f in d.fragments.values():total+=sum(v.nbytes for v in f.values() if isinstance(v,np.ndarray))
    for x in d.seen.values():total+=sum(a.nbytes for a in x)
    return total

def v22_post_verified():
    d=display22()
    if not d.active:return
    try:
        v22_schedule();v22_pump(.08)
        if bpy.app.background:v22_flush()
    except Exception as exc:
        # A display failure must never turn a VERIFIED annotation into a false failure.
        v22_exit(validate_source=False);bpy.context.scene.sgo_v22_message='标签已通过回读；展示失败，已退出并恢复显示：'+str(exc)

def _manual_transaction(context,code,operation,issue_value=None):
    result=_V22_BASE_MANUAL(context,code,operation,issue_value)
    if result=={'FINISHED'} and json.loads(context.scene['_sgo_v21_last_assignment'])['state']=='VERIFIED':v22_post_verified()
    return result

# Reuse V2.1.1's transactional writer for growth too: exact payload/FID/color
# readback + atomic rollback precede any display update.
def v22_growth_confirm(self,context):
    r=ensure_session();p=r.pending
    try:
        if not p:raise ValueError('没有扩展预览')
        if p['params']!=grow_params() or p['target']!=int(context.scene.sgo_target):raise ValueError('参数或目标改变，请重新预览')
        refresh_preview_selection(force=True)
        if p.get('selection_error'):raise ValueError(p['selection_error'])
        state=p['candidate_set'];ix=state.final.copy();stats=p['edit_stats'];o=p['object']
        if not len(ix) or len(ix)>200000:raise ValueError('最终选区为空或超过 20 万面')
        if stats['foreign'] or stats['blocked_faces'] or stats['blocked']['target_locked']:raise ValueError('跨对象、锁定、问题或其他人工分类保护冲突；整次未写入')
        if len(state.added) and (p.get('review_signature')!=state.signature or not context.scene.sgo_v21_accept_added):raise ValueError('请复核本次人工补选并勾选确认')
        _V1_VALIDATE();r.entries.pop(p['uid'],None);e=get_entry(o)
        if label_revision(e)!=p['revision']:raise ValueError('预览后真实标签变化，请重新预览')
        blocked,bad=final_selection_protection(o,ix,p['target'])
        if bad.size or blocked['target_locked'] or foreign_selected_objects(o) or not np.array_equal(selected_ids(o),ix):raise ValueError('实时保护或选区变化，整次未写入')
        r.pending=None
        try:result=_manual_transaction(context,p['target'],'GROWTH_CONFIRM')
        except Exception:r.pending=p;raise
        _set_added_review(False);context.scene.sgo_v2_grow_message=f'已回读验证 {len(ix):,} 面；保留 {len(state.retained):,}，排除 {len(state.excluded):,}，补充 {len(state.added):,}。展示仅在真实写入验证后更新。'
        return result
    except Exception as exc:return report_error(self,exc)

def preview(on=True):
    d=display22()
    if d.active and not on:raise ValueError('分解工作台使用语义颜色；请先退出，再切换原始 PBR 外观。')
    return _V22_BASE_PREVIEW(on)

def v22_begin():
    d=display22();no_pending()
    if d.active:raise ValueError('已经进入工作台')
    m=safe_work()
    if V22_RECOVERY in bpy.context.scene:v22_recover_saved_view()
    if not m.get('v22'):raise ValueError('先另存 V2.2 新工作副本，保留 V2.1.1')
    _V1_VALIDATE();ensure_session(refresh=True);v22_component_rows();obs=objects();d.snapshot=v22_capture()
    bpy.context.scene[V22_RECOVERY]=v22_encode_recovery(d.snapshot)
    d.layout=v22_make_layout(obs);d.started=time.perf_counter();d.active=True;d.building=True
    try:
        triangles=sum(len(o.data.polygons) for o in obs.values())
        if triangles>bpy.context.scene.sgo_v22_face_limit:raise ValueError('源面规模超出安全上限；请检查模型或明确提高上限')
        # Conservative estimate includes positions/colors, CPU and GPU cache, source tables.
        estimate=triangles*320
        if estimate>bpy.context.scene.sgo_v22_memory_mb*2**20:raise ValueError('预计展示缓存超过内存预算；未隐藏源面，请提高预算或减少源规模')
        for uid,o in obs.items():d.geom[uid]=v22_read_geometry(o)
        exact_triangles=sum(len(g['tri']) for g in d.geom.values())
        if exact_triangles>bpy.context.scene.sgo_v22_face_limit or exact_triangles*320>bpy.context.scene.sgo_v22_memory_mb*2**20:raise ValueError('实际三角化显示规模超出预算，已取消并恢复显示')
        preview(True);ensure_edit_for_visibility();v22_schedule();d.total=len(d.queue)
        v22_attach_draw();return d
    except Exception:
        v22_exit(validate_source=False);raise

def v22_exit(validate_source=True):
    global _V22
    d=display22()
    if not d.active:return
    d.active=False
    for handle in d.handlers:
        try:bpy.types.SpaceView3D.draw_handler_remove(handle,'WINDOW')
        except (ValueError,ReferenceError):pass
    d.handlers.clear();snap=d.snapshot
    try:
        if snap:v22_restore_snapshot(snap)
        bpy.context.scene.pop(V22_RECOVERY,None)
        if validate_source:_V1_VALIDATE()
    finally:
        d.geom.clear();d.fragments.clear();d.queue.clear();d.seen.clear();d.moved.clear();d.anim.clear();d.shader=None
        d.ready=False;d.building=False;d.snapshot=None
        v22_redraw()
    bpy.context.scene.sgo_v22_message='已退出；进入前的显示、选择、管理器过滤和视图着色已恢复。真实标签保留。'

def v22_batch(fragment,shader):
    if fragment.get('batch') is None:
        from gpu_extras.batch import batch_for_shader
        fragment['batch']=batch_for_shader(shader,'TRIS',{'pos':fragment['positions'],'color':fragment['colors']})
    return fragment['batch']

def v22_draw_3d():
    d=display22()
    if not d.active or d.building or not d.ready:return
    try:
        import gpu
        from gpu_extras.batch import batch_for_shader
        if d.shader is None:d.shader=gpu.shader.from_builtin('FLAT_COLOR')
        previous_state=(gpu.state.depth_test_get(),gpu.state.depth_mask_get(),gpu.state.blend_get());sh=d.shader;gpu.state.depth_test_set('LESS_EQUAL');gpu.state.depth_mask_set(True);gpu.state.blend_set('NONE');sh.bind();now=time.perf_counter()
        for key,f in tuple(d.fragments.items()):
            offset=v22_offset(f['group']);anim=d.anim.get(key);t=(now-anim['start'])/.55 if anim else 2.
            gpu.matrix.push()
            try:
                gpu.matrix.multiply_matrix(Matrix.Translation(Vector(offset)))
                # Final mesh remains accurate; transient newly arriving triangles are
                # masked from the final batch until their independent animation ends.
                if anim and t<1:
                    if 'static' not in anim:
                        mask=~np.isin(f['source_face_ids'],anim['ids']);anim['static']={'positions':f['positions'].reshape(-1,3,3)[mask].reshape(-1,3),'colors':f['colors'].reshape(-1,3,4)[mask].reshape(-1,4),'batch':None}
                    if len(anim['static']['positions']):v22_batch(anim['static'],sh).draw(sh)
                else:v22_batch(f,sh).draw(sh);d.anim.pop(key,None)
            finally:gpu.matrix.pop()
            if anim and t<1:
                smooth=max(0.,t);smooth=smooth*smooth*(3-2*smooth);gpu.matrix.push()
                try:gpu.matrix.multiply_matrix(Matrix.Translation(Vector(offset*smooth)));v22_batch(anim,sh).draw(sh)
                finally:gpu.matrix.pop()
        if bpy.context.scene.sgo_v22_guides:
            sh2=gpu.shader.from_builtin('UNIFORM_COLOR');origin=d.layout['center'];points=[]
            for key,row in v22_component_rows().items():
                if row.expanded and any(f['group']==key for f in d.fragments.values()):points.extend([origin,(np.asarray(origin)+v22_offset(key)).tolist()])
            if points:batch=batch_for_shader(sh2,'LINES',{'pos':points});sh2.bind();sh2.uniform_float('color',(.45,.45,.45,1));batch.draw(sh2)
    except Exception as exc:
        d.error=str(exc);d.suspended=True
        # Disable the draw layer immediately; timer exits and restores source visibility.
    finally:
        try:gpu.state.depth_mask_set(previous_state[1]);gpu.state.depth_test_set(previous_state[0]);gpu.state.blend_set(previous_state[2])
        except Exception:pass

def v22_draw_labels():
    d=display22()
    if not d.active or not d.ready or not bpy.context.scene.sgo_v22_names:return
    try:
        import blf
        from bpy_extras.view3d_utils import location_3d_to_region_2d
        region=bpy.context.region;rv=bpy.context.region_data
        for key,row in v22_component_rows().items():
            count=sum(len(f['source_face_ids']) for f in d.fragments.values() if f['group']==key)
            if not count:continue
            p=location_3d_to_region_2d(region,rv,Vector(np.asarray(d.layout['center'])+v22_offset(key)))
            if p:blf.position(0,p.x,p.y,0);blf.size(0,14);blf.color(0,1,1,1,1);blf.draw(0,f'{row.label} · {count:,} 三角面 [临时展示]')
    except Exception as exc:d.error='名称绘制：'+str(exc)

def v22_attach_draw():
    if bpy.app.background:return
    d=display22()
    d.handlers=[bpy.types.SpaceView3D.draw_handler_add(v22_draw_3d,(),'WINDOW','POST_VIEW'),bpy.types.SpaceView3D.draw_handler_add(v22_draw_labels,(),'WINDOW','POST_PIXEL')]

def v22_tick():
    with v22_view_context():return _v22_tick_in_context()

def _v22_tick_in_context():
    d=display22()
    try:
        if not d.active:
            if META in bpy.context.scene and V22_RECOVERY in bpy.context.scene:v22_recover_saved_view()
            return .4
        if d.suspended:raise RuntimeError(d.error or '视口显示层中止')
        if not rt().job:
            if d.history or d.dirty:v22_schedule(reconcile=d.history)
            if d.queue:v22_pump()
            if any(o.mode!='EDIT' for o in objects().values()):ensure_edit_for_visibility();v22_filter_sources()
        if d.anim:v22_redraw()
    except Exception as exc:
        try:v22_exit(validate_source=False)
        except Exception:pass
        bpy.context.scene.sgo_v22_message='工作台安全退出，真实标签未改动：'+str(exc)
    return .04 if d.active and (d.queue or d.anim) else .4

@persistent
def v22_history(*args):
    d=display22()
    if d.active:d.history=True;d.anim.clear()

@persistent
def v22_save_pre(*args):
    # Native Save/Save As also leave workbench first. GPU data never serializes.
    if display22().active:
        with v22_view_context():v22_exit(validate_source=False)

@persistent
def v22_load_pre(*args):
    if display22().active:
        with v22_view_context():v22_exit(validate_source=False)

@persistent
def v22_load_post(*args):
    global _V22
    _V22=V22Display()
    if META in bpy.context.scene and V22_RECOVERY in bpy.context.scene:
        # Blender exposes EDIT flags before its live BMesh exists during load_post.
        # Recover on the next initialized UI tick/session read, not inside load_post.
        bpy.context.scene.sgo_v22_message='发现应急显示记录；视口初始化后将自动恢复隐藏和选区。'

class SGO22_Group(bpy.types.PropertyGroup):
    key:StringProperty();label:StringProperty()
    offset:FloatVectorProperty(name='模型坐标偏移（整鞋尺寸倍数）',size=3,default=(0,0,0),min=-10,max=10,update=v22_offset_changed)
    expanded:BoolProperty(name='展开显示',default=True,update=v22_settings_changed)

class SGO22_OT_copy(bpy.types.Operator,ExportHelper):
    bl_idname='sgo_v22.save_copy';bl_label='另存 V2.2 工作副本（保留 V2.1.1）';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):
        p=Path(bpy.data.filepath);self.filepath=str(p.with_name(p.stem+'_V2_2_WORK.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            no_pending()
            if display22().active:v22_exit()
            m=_V1_VALIDATE();src=Path(bpy.data.filepath).resolve();dest=Path(self.filepath).expanduser().resolve()
            protected={m['source_name'],src.name}|{m.get(k,{}).get('input_work_name','') for k in ['v2','v21','v22']}
            if dest.exists() or dest.name in protected or dest.suffix.lower()!='.blend':raise ValueError('必须选择尚不存在、名称不同的 .blend；不会覆盖任何旧工程')
            before=_annotation_hashes(m);sha=hashlib.sha256(src.read_bytes()).hexdigest()
            m['v22']={'version':V22_VERSION,'input_work_path':str(src),'input_work_name':src.name,'input_sha256':sha,'temporary_display':'runtime triangle/GPU caches only; no source topology edits'}
            put_meta(m);bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            if before!=_annotation_hashes(m) or hashlib.sha256(src.read_bytes()).hexdigest()!=sha:raise ValueError('副本校验未通过；请保留输入工程')
            invalidate();ensure_session(refresh=True);context.scene.sgo_v22_message='V2.2 新副本已建立；所有真实标签、源面 ID、UV 和 PBR 保留。';return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO22_OT_enter(bpy.types.Operator):
    bl_idname='sgo_v22.enter';bl_label='进入分解工作台';bl_options={'REGISTER'}
    def execute(self,context):
        try:
            v22_begin();v22_flush();return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)
    def invoke(self,context,event):
        try:
            d=v22_begin();self._timer=context.window_manager.event_timer_add(.05,window=context.window);context.window_manager.modal_handler_add(self);context.window_manager.progress_begin(0,max(d.total,1));return {'RUNNING_MODAL'}
        except Exception as exc:return report_error(self,exc)
    def modal(self,context,event):
        d=display22()
        if event.type=='ESC' or not d.active:
            if d.active:v22_exit()
            context.window_manager.event_timer_remove(self._timer);context.window_manager.progress_end();return {'CANCELLED'}
        if event.type=='TIMER':
            try:v22_pump();context.window_manager.progress_update(d.total-len(d.queue))
            except Exception as exc:v22_exit(validate_source=False);context.window_manager.event_timer_remove(self._timer);context.window_manager.progress_end();return report_error(self,exc)
            if not d.queue:context.window_manager.event_timer_remove(self._timer);context.window_manager.progress_end();return {'FINISHED'}
        return {'PASS_THROUGH'}

class SGO22_OT_exit(bpy.types.Operator):
    bl_idname='sgo_v22.exit';bl_label='退出工作台并恢复进入前显示'
    def execute(self,context):
        try:no_pending();v22_exit();return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO22_OT_component(bpy.types.Operator):
    bl_idname='sgo_v22.component';bl_label='组件展示位置（不修改标签）'
    key:StringProperty();action:EnumProperty(items=[('TOGGLE','展开 / 原位',''),('ONLY','只展开当前组件',''),('ALL','展开全部',''),('HOME','全部原位',''),('RESET','默认排列',''),('FRAME','框显分解展示','')])
    def execute(self,context):
        try:
            no_pending();ensure_session();rows=v22_component_rows();mapping=v22_group_codes();codes=subtree(self.key) if self.key in rt().tree else set();groups={mapping[c] for c in codes if mapping.get(c)}
            if self.action=='TOGGLE':
                state=not all(rows[g].expanded for g in groups)
                for g in groups:rows[g].expanded=state
            elif self.action=='ONLY':
                for g,row in rows.items():row.expanded=g in groups
            elif self.action in {'ALL','HOME'}:
                for row in rows.values():row.expanded=self.action=='ALL'
            elif self.action=='RESET':
                for key,name,offset in V22_GROUPS:rows[key].offset=offset;rows[key].expanded=True
                context.scene.sgo_v22_distance=1.
            elif self.action=='FRAME':
                d=display22()
                if not d.active:raise ValueError('请先进入工作台')
                center=Vector(d.layout['center']);span=d.layout['span']*(1+2*context.scene.sgo_v22_distance)
                for screen in bpy.data.screens:
                    for area in screen.areas:
                        if area.type=='VIEW_3D':area.spaces.active.region_3d.view_location=center;area.spaces.active.region_3d.view_distance=span*1.5
            if display22().active:v22_schedule();v22_pump(.08)
            return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO22_OT_refresh(bpy.types.Operator):
    bl_idname='sgo_v22.refresh';bl_label='校验真实数据并同步展示'
    def execute(self,context):
        try:no_pending();_V1_VALIDATE();display22().history=True;v22_flush();return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO22_PT_workbench(bpy.types.Panel):
    bl_label='动态语义分解工作台 · V2.2';bl_idname='SGO22_PT_workbench';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    @classmethod
    def poll(cls,context):return SGO2_PT_manager.poll(context)
    def draw(self,context):
        l=self.layout;sc=context.scene;d=display22()
        l.label(text='源网格不移动；临时展示不可选、不会导出。',icon='LOCKED')
        if not meta(sc).get('v22'):l.operator('sgo_v22.save_copy',icon='DUPLICATE');return
        if not d.active:l.operator('sgo_v22.enter',icon='OUTLINER_OB_GROUP_INSTANCE')
        else:
            l.operator('sgo_v22.exit',icon='LOOP_BACK');op=l.operator('sgo_v22.component',text='框显周围展示');op.action='FRAME'
            l.label(text='UNKNOWN 与问题面留在原位；问题面不自动移走。')
        l.prop(sc,'sgo_v22_distance',text='总分解距离');l.prop(sc,'sgo_v22_include_auto',text='同时展示自动候选（否则仅人工）');l.prop(sc,'sgo_v22_animate',text='新归属飞行动画（大批量自动跳过）')
        row=l.row(align=True);row.prop(sc,'sgo_v22_names',text='名称');row.prop(sc,'sgo_v22_guides',text='引导线')
        row=l.row(align=True);op=row.operator('sgo_v22.component',text='展开全部');op.action='ALL';op=row.operator('sgo_v22.component',text='恢复全部原位');op.action='HOME'
        l.prop(sc,'sgo_v22_group',text='调整一级组件');rows=v22_component_rows();row=rows.get(sc.sgo_v22_group)
        if row:l.prop(row,'expanded');l.prop(row,'offset',text='固定锚点 X / Y / Z')
        op=l.operator('sgo_v22.component',text='自动排列 / 恢复默认排列');op.action='RESET'
        l.label(text='子分类共享一级组件锚点；不会随面数变化重新排列。')
        l.operator('sgo_v22.refresh',icon='FILE_REFRESH')
        box=l.box();box.prop(sc,'sgo_v22_memory_mb',text='展示缓存预算 MiB');box.prop(sc,'sgo_v22_face_limit',text='源面安全上限');box.prop(sc,'sgo_v22_animation_limit',text='动画三角面上限')
        if d.building:l.label(text=f'构建缓存：剩余 {len(d.queue)} 块；Esc 可取消。')
        for line in sc.sgo_v22_message.split('；')[:3]:l.label(text=line[:68])

def _object_execute(self,context):
    try:
        no_pending()
        if display22().active:v22_exit()
        return _V22_BASE_OBJECT_EXEC(self,context)
    except Exception as exc:return report_error(self,exc)

def _pick_execute(self,context):
    result=_V22_BASE_PICK_EXEC(self,context)
    if result=={'FINISHED'} and display22().active:
        ensure_edit_for_visibility();v22_filter_sources()
    return result

def v22_select_class(self,context):
    try:
        if display22().active:
            no_pending();ensure_session();mapping=v22_group_codes();groups={mapping[c] for c in subtree(self.key) if mapping.get(c)};rows=v22_component_rows()
            for key in groups:rows[key].expanded=False
            v22_schedule();v22_pump(.08)
        return _V22_BASE_SELECT_CLASS(self,context)
    except Exception as exc:return report_error(self,exc)

def v22_root_draw(self,context):
    if META not in context.scene or not meta(context.scene).get('v2'):
        return _V22_BASE_ROOT_DRAW(self,context)
    l=self.layout;sc=context.scene;l.label(text='真实面级标注 + 临时视觉分解，不正式切割。',icon='INFO')
    if not meta(sc).get('v22'):
        l.label(text='先另存新副本，不覆盖 V2.1.1。',icon='LOCKED');l.operator('sgo_v22.save_copy',icon='DUPLICATE')
    row=l.row(align=True);row.operator('sgo.frame',text='框显原鞋');row.operator('sgo.object_mode',text='退出并选对象' if display22().active else '返回对象选择')
    if not rt().ready:l.operator('sgo_v2.refresh',text='读取标签与零件管理器',icon='FILE_REFRESH')
    for line in sc.sgo_message.split('；')[:3]:l.label(text=line[:64])

def v22_data_draw(self,context):
    l=self.layout;sc=context.scene
    l.operator('sgo.auto_candidates',text='重新生成自动候选（保留人工与锁定）',icon='GEOMETRY_NODES');l.operator('sgo.toggle_preview',icon='MATERIAL');l.operator('sgo.validate');l.operator('sgo_v22.save_copy',icon='DUPLICATE');l.operator('sgo.save_work',icon='FILE_TICK');l.operator('sgo.export_json',icon='EXPORT');l.operator('sgo.import_json',icon='IMPORT');l.prop(sc,'sgo_replace_manual',text='导入时替换已有人工标签')
    if sc.sgo_replace_manual:l.label(text='已开启人工替换；导入前先保存。',icon='ERROR')
    if locked_codes():l.label(text='导入前须解除锁定；不会绕过锁定写入。',icon='LOCKED')

def v22_row_draw(self,context,layout,data,item,icon,active_data,active_propname,index):
    _V22_BASE_ROW_DRAW(self,context,layout,data,item,icon,active_data,active_propname,index)
    if display22().active and item.key not in {'UNKNOWN','SHOE'}:
        op=layout.operator('sgo_v22.component',text='',icon='ORIENTATION_GLOBAL',emboss=False);op.key=item.key;op.action='TOGGLE'
        op=layout.operator('sgo_v22.component',text='',icon='PIVOT_BOUNDBOX',emboss=False);op.key=item.key;op.action='ONLY'

def v22_save_execute(self,context):
    try:
        if not meta().get('v22'):raise ValueError('先另存 V2.2 新副本，不覆盖当前 V2.1.1 文件')
        if display22().active:v22_exit()
        # V2.2 may be derived directly from V2 without a v21 save marker.
        no_pending();return _V1_SAVE(self,context)
    except Exception as exc:return report_error(self,exc)

def export_payload():
    data=_V22_BASE_EXPORT();data['tool_version']=V22_VERSION
    data['display_only_workbench']={'serialized_geometry':False,'formal_split':False}
    return data

V22_CLASSES=[SGO22_Group,SGO22_OT_copy,SGO22_OT_enter,SGO22_OT_exit,SGO22_OT_component,SGO22_OT_refresh,SGO22_PT_workbench]
V22_PROPS=['sgo_v22_groups','sgo_v22_group','sgo_v22_distance','sgo_v22_include_auto','sgo_v22_animate','sgo_v22_names','sgo_v22_guides','sgo_v22_memory_mb','sgo_v22_face_limit','sgo_v22_animation_limit','sgo_v22_message']
V22_HANDLERS=[(bpy.app.handlers.undo_post,v22_history),(bpy.app.handlers.redo_post,v22_history),(bpy.app.handlers.save_pre,v22_save_pre),(bpy.app.handlers.load_pre,v22_load_pre),(bpy.app.handlers.load_post,v22_load_post)]

def register():
    global _V22
    _V22_BASE_REGISTER();_V22=V22Display()
    for cls in V22_CLASSES:bpy.utils.register_class(cls)
    bpy.types.Scene.sgo_v22_groups=CollectionProperty(type=SGO22_Group)
    bpy.types.Scene.sgo_v22_group=EnumProperty(items=[(key,name,'所有子类共享固定偏移') for key,name,offset in V22_GROUPS],default='UPPER')
    bpy.types.Scene.sgo_v22_distance=FloatProperty(default=1,min=.1,max=3,update=v22_offset_changed)
    bpy.types.Scene.sgo_v22_include_auto=BoolProperty(default=True,update=v22_settings_changed)
    bpy.types.Scene.sgo_v22_animate=BoolProperty(default=False)
    bpy.types.Scene.sgo_v22_names=BoolProperty(default=True,update=v22_offset_changed)
    bpy.types.Scene.sgo_v22_guides=BoolProperty(default=False,update=v22_offset_changed)
    bpy.types.Scene.sgo_v22_memory_mb=IntProperty(default=768,min=128,max=2048)
    bpy.types.Scene.sgo_v22_face_limit=IntProperty(default=2000000,min=1000,max=5000000)
    bpy.types.Scene.sgo_v22_animation_limit=IntProperty(default=2000,min=100,max=10000)
    bpy.types.Scene.sgo_v22_message=StringProperty(default='固定锚点只改变临时三角面显示；不改变源模型。')
    SGO2_OT_growth_confirm.execute=v22_growth_confirm;SGO2_OT_select.execute=v22_select_class;SGO_OT_save.execute=v22_save_execute
    SGO2_PT_root.draw=v22_root_draw;SGO2_PT_root.bl_label='Soulgrain V2.2 · 语义标注与动态分解'
    SGO2_UL_tree.draw_item=v22_row_draw;SGO2_PT_data.draw=v22_data_draw
    for handlers,fn in V22_HANDLERS:
        if fn not in handlers:handlers.append(fn)
    if not bpy.app.background:bpy.app.timers.register(v22_tick,first_interval=.5,persistent=True)
    registry={'runtime':rt,'cleanup':unregister}
    bpy._sgo_v2_registration=registry;bpy.app.driver_namespace['SGO_V2_REGISTRATION']=registry

def unregister():
    global _V22
    if display22().active:
        with v22_view_context():v22_exit(validate_source=False)
    if bpy.app.timers.is_registered(v22_tick):bpy.app.timers.unregister(v22_tick)
    for handlers,fn in V22_HANDLERS:
        if fn in handlers:handlers.remove(fn)
    for name in V22_PROPS:
        if hasattr(bpy.types.Scene,name):delattr(bpy.types.Scene,name)
    for cls in reversed(V22_CLASSES):
        if getattr(cls,'is_registered',False):bpy.utils.unregister_class(cls)
    SGO2_PT_root.draw=_V22_BASE_ROOT_DRAW;SGO2_UL_tree.draw_item=_V22_BASE_ROW_DRAW;SGO2_PT_data.draw=_V22_BASE_DATA_DRAW
    _V22_BASE_UNREGISTER();_V22=None
