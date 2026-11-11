# ---------- Soulgrain Repair Studio V3.0: bounded, independently versioned layers ----------
import math
from mathutils.bvhtree import BVHTree
STUDIO_META='_sgo_repair_studio_v3'
STUDIO_SCHEMA='soulgrain.repair-layers/3.0'
_SR3_CACHE={}
_SR3_BASE_OBJECTS=objects
_SR3_BASE_VALIDATE=validate
_SR3_BASE_QUICK=quick_guard
_SR3_BASE_MANUAL=_manual_transaction
_SR3_BASE_AUTO=_auto_execute
_SR3_BASE_GROW=make_growth_job
_SR3_BASE_REGISTER=register
_SR3_BASE_UNREGISTER=unregister
_SR3_BASE_INSPECT_DRAW=SGO2_PT_inspector.draw
_SR3_BASE_ROOT_DRAW=SGO2_PT_root.draw
_SR3_BASE_DATA_DRAW=SGO2_PT_data.draw
_SR3_BASE_GROW_DRAW=SGO2_PT_growth.draw

def sr3_active():return STUDIO_META in bpy.context.scene

def sr3_meta():
    if not sr3_active():raise ValueError('先另存并初始化 V3 修复工作副本，源文件不直接施工')
    return json.loads(bpy.context.scene[STUDIO_META])

def sr3_put(m):bpy.context.scene[STUDIO_META]=json.dumps(m,ensure_ascii=False,separators=(',',':'))

def sr3_objects(m=None):
    m=m or meta()
    if not sr3_active():return _SR3_BASE_OBJECTS(m)
    registry=sr3_meta();expected=set(m['objects']);result={};task_objects={u for t in registry['tasks'].values() for u in t['object_ids']}
    seen=set()
    for o in bpy.context.scene.objects:
        if o.type!='MESH':continue
        uid=o.get('_sgo_object_id')
        if uid in expected:
            if uid in result:raise ValueError('源对象 UUID 重复，停止修复')
            result[uid]=o;continue
        own=o.get('sr3_object_uuid')
        if not own or own not in task_objects or own in seen:raise ValueError('有未登记 / 复制的额外网格：'+o.name)
        seen.add(own)
    if set(result)!=expected:raise ValueError('冻结源对象集合缺失')
    return result
objects=sr3_objects

def sr3_attribute(o,name):
    at=o.data.attributes[name]
    if o.mode=='EDIT' and at.domain in ['POINT','FACE','EDGE']:
        bm=bmesh.from_edit_mesh(o.data);items={'POINT':bm.verts,'FACE':bm.faces,'EDGE':bm.edges}[at.domain]
        kind='float_vector' if at.data_type=='FLOAT_VECTOR' else 'float' if at.data_type=='FLOAT' else 'int';layer=getattr(items.layers,kind).get(name)
        if layer is None:raise ValueError('编辑属性缺失：'+name)
        if kind=='float_vector':return np.asarray([x[layer][:] for x in items],'f4')
        return np.fromiter((x[layer] for x in items),dtype='f4' if kind=='float' else 'i4',count=len(items))
    return array(at.data,'vector' if at.data_type=='FLOAT_VECTOR' else 'value',3 if at.data_type=='FLOAT_VECTOR' else 1,'f4' if at.data_type in ['FLOAT','FLOAT_VECTOR'] else 'i4')

def sr3_snapshot(o):
    if o.mode=='EDIT':o.update_from_editmode()
    semantic_attrs={at.name:digest(sr3_attribute(o,at.name)) for at in o.data.attributes if at.domain=='FACE' and at.data_type in ['INT','FLOAT'] and at.name.startswith(('sgo_','sgor_','repair_'))}
    return {'mesh':repair_mesh_signature(o.data),'object':object_signature(o),'labels':[digest(x) for x in read_labels(o.data)],'face_ids':digest(face_ids(o.data)),'semantic_attributes':semantic_attrs,'modifiers':[[m.name,m.type,str(m.show_viewport),str(m.show_render),[[p.identifier,str(getattr(m,p.identifier))] for p in m.bl_rna.properties if not p.is_readonly and p.type in ['INT','FLOAT','BOOLEAN','ENUM','STRING']]] for m in o.modifiers],'constraints':[[c.name,c.type,float(c.influence)] for c in o.constraints],'shape_keys':{k.name:digest(array(k.data,'co',3,'f4')) for k in o.data.shape_keys.key_blocks} if o.data.shape_keys else {}}

def sr3_guard(all_resources=True):
    data=sr3_meta();sync_edit()
    if data['source_meta_sha256']!=hashlib.sha256(bpy.context.scene[META].encode()).hexdigest():raise ValueError('原语义元数据被修改，未写入修复')
    obs=sr3_objects()
    for uid,o in obs.items():
        if sr3_snapshot(o)!=data['sources'][uid]:raise ValueError('冻结源几何 / UV / 标签 / 法线设置或变换已变：'+o.name+'；请撤销该操作，不能确认补片')
    for name,expected in meta().get('migration',{}).get('archive_hashes',{}).items():
        if name not in bpy.data.texts or hashlib.sha256(bpy.data.texts[name].as_string().encode()).hexdigest()!=expected:raise ValueError('源语义档案改变：'+name)
    for task in data['tasks'].values():
        if task['state']=='ACCEPTED':
            o=sr3_find(task['accepted_object'])
            if o is None or repair_mesh_signature(o.data)!=task['accepted_geometry_hash'] or object_signature(o)!=task['accepted_object_signature'] or not o.data.attributes.get('sr3_face_id') or digest(array(o.data.attributes['sr3_face_id'].data,'value'))!=task['accepted_face_id_hash']:raise ValueError('已确认补片发生变化，需撤销误操作或明确建立新的预览版本')
    if all_resources:
        current=resource_signature()
        for typ in ['materials','images']:
            for key,val in data['resources'][typ].items():
                if current[typ].get(key)!=val:raise ValueError('源 PBR / 纹理改变：'+key)
    return data

def validate(m=None,all_resources=True):
    if sr3_active():sr3_guard(all_resources);return m or safe_work()
    return _SR3_BASE_VALIDATE(m,all_resources)
_V1_VALIDATE=validate

def quick_guard(o):
    if sr3_active():sr3_guard(False);return safe_work()
    return _SR3_BASE_QUICK(o)

def _manual_transaction(context,code,operation,issue_value=None):
    if sr3_active():raise ValueError('V3 修复工作台源标签只读；请编辑独立补面预览，不重新标注原网格')
    return _SR3_BASE_MANUAL(context,code,operation,issue_value)

def _auto_execute(self,context):
    if sr3_active():return report_error(self,ValueError('V3 禁止重新识别源网格或 UNKNOWN'))
    return _SR3_BASE_AUTO(self,context)

def make_growth_job():
    if sr3_active():raise ValueError('V3 只修复，不运行原网格自动扩展分类')
    return _SR3_BASE_GROW()

def sr3_new_object(name,co,faces=(),edges=(),task=None,role='PREVIEW'):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(np.asarray(co).tolist(),list(edges),list(faces));mesh.update();ob=bpy.data.objects.new(name,mesh);bpy.context.scene.collection.objects.link(ob);ob['sr3_object_uuid']=str(uuid.uuid4());ob['sr3_role']=role
    if task:ob['sr3_task_uuid']=task['uuid'];task['object_ids'].append(ob['sr3_object_uuid'])
    if role=='PREVIEW':
        mat=bpy.data.materials.get('SR3_UV_PENDING_AMBER')
        if mat is None:
            mat=bpy.data.materials.new('SR3_UV_PENDING_AMBER');mat.diffuse_color=(1,.3,.025,1);mat.use_nodes=True;mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(1,.3,.025,1)
        mesh.materials.append(mat);col=mesh.color_attributes.new(name='SR3_PREVIEW_ONLY',type='BYTE_COLOR',domain='CORNER');col.data.foreach_set('color',np.tile(np.array([1,.3,.025,1],'f4'),(len(mesh.loops),1)).ravel());mesh.color_attributes.active_color=col
    return ob

def sr3_find(uid):return next((o for o in bpy.context.scene.objects if o.get('sr3_object_uuid')==uid),None)

def sr3_task():
    data=sr3_meta();key=bpy.context.scene.sr3_task
    if key not in data['tasks']:raise ValueError('先建立一个局部修复任务')
    return data,data['tasks'][key]

def sr3_add_task(data,target,kind='USER_SCOPE'):
    uid=str(uuid.uuid4());p=catalog()[int(target)];task={'uuid':uid,'target_code':int(target),'target_part_id':p['id'],'target_name':p['name'],'kind':kind,'state':'SCOPE','object_ids':[],'variants':[],'active_preview':None,'guides':[],'boundaries':[],'algorithm':None,'parameters':{},'boundary_reviewed':False,'human_commit':False,'uv_status':'PENDING','quality':None,'history':[]};data['tasks'][uid]=task;bpy.context.scene.sr3_task=uid;return task

def sr3_activate(o,edit=True,edge=False):
    if display22().active:v22_exit()
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.hide_select=False;o.select_set(True);bpy.context.view_layer.objects.active=o
    if edit:bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,True,False) if edge else (True,False,False)

def sr3_initialize(dest):
    src=Path(bpy.data.filepath).resolve();dest=Path(dest).expanduser().resolve()
    if not src.is_file() or dest.exists() or src==dest or src.name==dest.name or dest.suffix.lower()!='.blend':raise ValueError('请选择全新的工作文件名，不覆盖任何输入')
    if sr3_active():raise ValueError('当前已是 V3 工作台；可直接继续或另存工作副本')
    sync_edit()
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    m=meta();obs=_SR3_BASE_OBJECTS(m)
    if repaired(m):_SR3_BASE_VALIDATE(m)
    else:
        # The V2.2 cached normal hash is not portable. All persisted geometry,
        # UV, face-ID and material fields must still match its original baseline.
        for uid,o in obs.items():
            now=mesh_signature(o.data);old=m['objects'][uid]['mesh'];assert np.array_equal(face_ids(o.data),np.arange(len(o.data.polygons),dtype='i4'))
            for key,value in old.items():
                if key!='normals' and now[key]!=value:raise ValueError('V2.2 源几何 / UV 版本不符：'+o.name+' '+key)
    source_meta_string=bpy.context.scene[META];data={'schema':STUDIO_SCHEMA,'workspace_uuid':str(uuid.uuid4()),'source_file':str(src),'source_filename':src.name,'source_file_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'source_meta_sha256':hashlib.sha256(source_meta_string.encode()).hexdigest(),'source_asset_id':m['asset_id'],'sources':{u:sr3_snapshot(o) for u,o in obs.items()},'resources':resource_signature(),'tasks':{},'source_note':'Frozen in-memory snapshot at work-copy creation; no original face/UV/label edits'}
    bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False,compress=True);sr3_put(data)
    for o in obs.values():o.hide_select=True
    bpy.context.scene.sgo_target='20';sr3_guard();bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False,compress=True);return data

def sr3_codes(code):
    rows=catalog();keys={p['key']:p for p in rows.values()};target=rows[int(code)]['key'];result={int(code)}
    for n,p in rows.items():
        key=p.get('parent');seen=set()
        while key and key not in seen:
            if key==target:result.add(n);break
            seen.add(key);key=keys.get(key,{}).get('parent')
    return result

def sr3_scope():
    data=sr3_guard();target=int(bpy.context.scene.sgo_target)
    if target==0:raise ValueError('UNKNOWN 只能参考，不能作为已确认的待修零件')
    task=sr3_add_task(data,target);codes=sr3_codes(target);co=[];faces=[];source_slots=[];source_polys=[];source_fids=[];vertex_slots=[];vertex_ids=[];sources=list(sr3_objects().items());offset=0
    for slot,(uid,o) in enumerate(sources):
        p,s,c,i=read_labels(o.data);mask=np.isin(p,list(codes))&(i==0)&((s==HUMAN)|(bpy.context.scene.sr3_include_candidates&np.isin(s,[AUTO,REPAIR_PENDING])));idx=np.flatnonzero(mask)
        if not len(idx):continue
        vv=array(o.data.vertices,'co',3,'f4');ff=array(o.data.loops,'vertex_index').reshape(-1,3)[idx];used,inv=np.unique(ff.ravel(),return_inverse=True);world=np.asarray(o.matrix_world);xyz=vv[used]@world[:3,:3].T+world[:3,3];co.extend(xyz.tolist());faces.extend((inv.reshape(-1,3)+offset).tolist());source_slots.extend([slot]*len(idx));source_polys.extend(idx.tolist());source_fids.extend(face_ids(o.data)[idx].tolist());vertex_slots.extend([slot]*len(used));vertex_ids.extend(used.tolist());offset+=len(used)
        if len(faces)>120000:raise ValueError('范围副本超过 12 万面，先选择更细的已标注子部件')
    if not faces:raise ValueError('该分类没有可用 HUMAN 面；AUTO/修复待验收仅在明确勾选后作为约束参考')
    proxy=sr3_new_object('SR3_SCOPE_'+task['uuid'][:8],co,faces,task=task,role='SELECTOR');proxy.display_type='WIRE';proxy.show_in_front=True
    for name,domain,val in [('sr3_source_slot','FACE',source_slots),('sr3_source_polygon','FACE',source_polys),('sr3_source_fid','FACE',source_fids),('sr3_vertex_source_slot','POINT',vertex_slots),('sr3_vertex_source_vertex','POINT',vertex_ids)]:at=proxy.data.attributes.new(name=name,type='INT',domain=domain);at.data.foreach_set('value',np.asarray(val,'i4'))
    task.update(selector=proxy['sr3_object_uuid'],source_uids=[u for u,o in sources],selector_position_hash=digest(array(proxy.data.vertices,'co',3,'f4')),selector_mesh_signature=repair_mesh_signature(proxy.data),selector_transform=[list(row) for row in proxy.matrix_world],selector_mapping_hashes={at.name:digest(sr3_attribute(proxy,at.name)) for at in proxy.data.attributes if at.name.startswith('sr3_')});sr3_put(data);sr3_activate(proxy,True,True);bpy.ops.mesh.select_all(action='DESELECT');return proxy

def sr3_order_chains(edges):
    adj={}
    for a,b in edges:adj.setdefault(int(a),[]).append(int(b));adj.setdefault(int(b),[]).append(int(a))
    if any(len(n)>2 for n in adj.values()):raise ValueError('边界有分叉 / 多层重叠；请补充约束，只选单一路径')
    unused=set(adj);chains=[]
    while unused:
        seed=next(iter(unused));component=set([seed]);stack=[seed]
        while stack:
            for v in adj[stack.pop()]:
                if v not in component:component.add(v);stack.append(v)
        ends=sorted(v for v in component if len(adj[v])==1);closed=not ends
        if not closed and len(ends)!=2:raise ValueError('边界端点不完整')
        start=ends[0] if ends else min(component);path=[start];prev=-1
        while True:
            opts=[x for x in adj[path[-1]] if x!=prev]
            if not opts:break
            nxt=opts[0]
            if nxt==start:break
            prev=path[-1];path.append(nxt)
            if len(path)>len(component):raise ValueError('边界排序失败')
        if len(path)!=len(component):raise ValueError('边界不连续，不能自动填面')
        chains.append({'vertices':path,'closed':closed});unused-=component
    return chains

def sr3_detect():
    data,task=sr3_task();sr3_guard();o=sr3_find(task.get('selector'))
    if o is None or o.mode!='EDIT':raise ValueError('点击“指定局部范围”，在只读范围副本上选边或框选相邻面')
    o.update_from_editmode()
    current=repair_mesh_signature(o.data);changed=[k for k,v in task['selector_mesh_signature'].items() if k!='persisted_normals' and current.get(k)!=v];badmap=[name for name,val in task['selector_mapping_hashes'].items() if not o.data.attributes.get(name) or digest(sr3_attribute(o,name))!=val]
    if changed or badmap or [list(row) for row in o.matrix_world]!=task['selector_transform']:raise ValueError('范围副本几何 / 来源映射被改变：'+str(changed)+str(badmap))
    bm=bmesh.from_edit_mesh(o.data);bm.verts.ensure_lookup_table();bm.edges.ensure_lookup_table();bm.faces.ensure_lookup_table()
    selected=[e for e in bm.edges if e.select and not e.hide] if bpy.context.tool_settings.mesh_select_mode[1] else [e for e in bm.edges if len(e.link_faces)==1 and any(f.select for f in e.link_faces)]
    if not selected:raise ValueError('没有局部边界。请选一条开链 / 闭环，或框选缺损边缘旁的面')
    if len(selected)>512:raise ValueError('本地边界上限 512 边；请缩小范围')
    vv=array(o.data.vertices,'co',3,'f4');selected_vertices=np.unique([v.index for e in selected for v in e.verts]);unique_points,first,inv=np.unique(vv[selected_vertices],axis=0,return_index=True,return_inverse=True);representatives=selected_vertices[first];canonical={int(v):int(c) for v,c in zip(selected_vertices,inv)};edge_pairs=np.unique(np.sort(np.asarray([(canonical[e.verts[0].index],canonical[e.verts[1].index]) for e in selected]),axis=1),axis=0);chains=sr3_order_chains(edge_pairs.tolist());slots=sr3_attribute(o,'sr3_vertex_source_slot');vids=sr3_attribute(o,'sr3_vertex_source_vertex');obs=sr3_objects();boundaries=[]
    for chain in chains:
        refs=[{'source_object_id':task['source_uids'][int(slots[representatives[i]])],'source_vertex_id':int(vids[representatives[i]])} for i in chain['vertices']];bounds={'uuid':str(uuid.uuid4()),'closed':chain['closed'],'points':unique_points[chain['vertices']].tolist(),'vertex_references':refs,'kind':'EXPLICIT_SOURCE_EDGE_SELECTION','intent':'UNCONFIRMED: may be shoe opening, eyelet, semantic boundary or UV seam'};boundaries.append(bounds)
    task['source_edge_references']=[{'source_object_id':task['source_uids'][int(slots[e.verts[0].index])],'source_vertex_ids':[int(vids[v.index]) for v in e.verts]} for e in selected];task['virtual_equal_coordinate_join_only']=len(unique_points)<len(selected_vertices)
    faces=set(f.index for e in selected for f in e.link_faces);sf=sr3_attribute(o,'sr3_source_fid');ss=sr3_attribute(o,'sr3_source_slot');task['reference_faces']=[{'source_object_id':task['source_uids'][int(ss[i])],'source_face_id':int(sf[i])} for i in sorted(faces)];normal=np.asarray([bm.faces[i].normal[:] for i in sorted(faces)]).sum(0);normal/=max(np.linalg.norm(normal),1e-12);task['normal']=normal.tolist();task.update(boundaries=boundaries,state='BOUNDARY',boundary_reviewed=False,detection={'candidate_chains':len(chains),'selected_edges':len(selected),'warning':'仅是建议；标签/UV 截边、鞋眼、鞋口不自动视为缺损。用户须确认边界意图。'});sr3_put(data);return task['detection']

def sr3_resample(points,n):
    points=np.asarray(points,'f8');length=np.r_[0,np.cumsum(np.linalg.norm(np.diff(points,axis=0),axis=1))]
    if length[-1]<1e-10:raise ValueError('引导线长度为零')
    t=np.linspace(0,length[-1],n);return np.c_[*[np.interp(t,length,points[:,k]) for k in range(3)]]

def sr3_make_guide():
    data,task=sr3_task();sr3_guard()
    if len(task['boundaries'])!=1 or task['boundaries'][0]['closed']:raise ValueError('延伸补面需要一条明确的开放源边界')
    p=np.asarray(task['boundaries'][0]['points'],'f8');a=p[0];b=p[-1];t=np.linspace(0,1,7);guide=a[None]*(1-t[:,None])+b[None]*t[:,None];guide[:,2]+=np.sin(np.pi*t)*bpy.context.scene.sr3_guide_height;obj=sr3_new_object('SR3_GUIDE_'+task['uuid'][:8],guide,edges=[(j,j+1) for j in range(6)],task=task,role='GUIDE');task['guides'].append(obj['sr3_object_uuid']);task['history'].append({'event':'GUIDE_PROPOSAL','note':'Proposed contour, not confirmed source geometry'});sr3_put(data);sr3_activate(obj,True);return obj

def sr3_bridge_grid(A,B,rows,bulge=0.,normal=(0,0,1),collapse_ends=False):
    A=np.asarray(A,'f8');B=np.asarray(B,'f8')
    def knots(p):
        t=np.r_[0.,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))]
        if t[-1]<1e-10:raise ValueError('边界过短')
        return t/t[-1]
    ka=knots(A);kb=knots(B);tt=np.unique(np.r_[ka,kb])
    if len(tt)>512:raise ValueError('边界控制点超过 512，不自动简化真实边界')
    A=np.c_[*[np.interp(tt,ka,A[:,k]) for k in range(3)]];B=np.c_[*[np.interp(tt,kb,B[:,k]) for k in range(3)]];n=len(tt)
    if collapse_ends:
        if max(np.linalg.norm(A[0]-B[0]),np.linalg.norm(A[-1]-B[-1]))>1e-5:raise ValueError('引导端点必须接回源边界；请修正端点，不自动猜测闭合')
        B[0]=A[0];B[-1]=A[-1]
    co=[];faces=[]
    for j,t in enumerate(np.linspace(0,1,rows+1)):co.extend(((1-t)*A+t*B+np.asarray(normal)*bulge*4*t*(1-t)*np.sin(np.pi*tt[:,None])).tolist())
    for j in range(rows):
        for k in range(n-1):faces.append([j*n+k,j*n+k+1,(j+1)*n+k+1,(j+1)*n+k])
    co=np.asarray(co,'f8');pinned=np.zeros(len(co),'i4');pinned[:n]=1
    if not collapse_ends:pinned[-n:]=1
    else:pinned[np.arange(rows+1)*n]=1;pinned[np.arange(rows+1)*n+n-1]=1
    # Merge only exact collapsed endpoint copies in NEW geometry, never the source.
    vv,first,inv=np.unique(co,axis=0,return_index=True,return_inverse=True);new=[]
    for f in faces:
        f=[int(inv[i]) for i in f];ff=[]
        for x in f:
            if x not in ff:ff.append(x)
        if len(ff)>=3:new.append(ff)
    lock=np.zeros(len(vv),'i4');np.maximum.at(lock,inv,pinned);return vv,new,lock

def sr3_generate():
    data,task=sr3_task();sr3_guard();sc=bpy.context.scene;algorithm=sc.sr3_algorithm;bound=task['boundaries']
    if not bound:raise ValueError('先检测 / 指定真实局部边界')
    if display22().active:v22_exit()
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    rows=int(sc.sr3_rows);normal=np.asarray(task.get('normal',[0,0,1]),'f8')
    if algorithm=='HOLE':
        if len(bound)!=1 or not bound[0]['closed']:raise ValueError('小洞填充要求单一明确闭环；开链须先画目标轮廓')
        ring=np.asarray(bound[0]['points'],'f8');bm=bmesh.new();verts=[bm.verts.new(tuple(p)) for p in ring];ed=[bm.edges.new((verts[i],verts[(i+1)%len(verts)])) for i in range(len(verts))];bmesh.ops.triangle_fill(bm,edges=ed,use_beauty=True);bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=1,use_grid_fill=True);bm.verts.ensure_lookup_table();bm.verts.index_update();co=np.asarray([v.co[:] for v in bm.verts]);faces=[[v.index for v in f.verts] for f in bm.faces];bm.free();pins=np.zeros(len(co),'i4')
        for k,p in enumerate(co):
            for a,b in zip(ring,np.roll(ring,-1,axis=0)):
                d=b-a;t=np.clip(np.dot(p-a,d)/max(np.dot(d,d),1e-20),0,1)
                if np.linalg.norm(p-(a+t*d))<1e-6:pins[k]=1;break
    elif algorithm=='BRIDGE':
        if len(bound)!=2 or any(b['closed'] for b in bound):raise ValueError('桥接需要两条明确开链；多层重叠或闭环须补充约束')
        A=np.asarray(bound[0]['points']);B=np.asarray(bound[1]['points'])
        if sc.sr3_reverse_second:B=B[::-1]
        co,faces,pins=sr3_bridge_grid(A,B,rows,sc.sr3_bulge,normal)
    else:
        if len(bound)!=1 or bound[0]['closed']:raise ValueError('轮廓延伸要求一条源开链和已编辑目标引导')
        guide=sr3_find(task['guides'][-1]) if task['guides'] else None
        if guide is None:raise ValueError('先创建并调整局部目标引导线；不会盲目闭合')
        guide.update_from_editmode() if guide.mode=='EDIT' else None;paths=sr3_order_chains(array(guide.data.edges,'vertices',2).tolist());
        if len(paths)!=1 or paths[0]['closed'] or len(paths[0]['vertices'])!=len(guide.data.vertices):raise ValueError('引导线必须为单一连续开链；请修复控制线连接')
        B=array(guide.data.vertices,'co',3,'f4')[paths[0]['vertices']];gw=np.asarray(guide.matrix_world);B=B@gw[:3,:3].T+gw[:3,3];co,faces,pins=sr3_bridge_grid(bound[0]['points'],B,rows,sc.sr3_bulge,normal,True)
    if len(faces)>20000 or len(co)>25000:raise ValueError('新增预览超过局部安全上限，减少段数')
    fn=np.asarray([np.cross(np.asarray(co)[f[1]]-np.asarray(co)[f[0]],np.asarray(co)[f[2]]-np.asarray(co)[f[0]]) for f in faces]).sum(0)
    if np.dot(fn,normal)<0:faces=[list(reversed(f)) for f in faces]
    if sc.sr3_flip:faces=[list(reversed(f)) for f in faces]
    old=sr3_find(task.get('active_preview'))
    if old:old.hide_set(True) # Preserve manual work as a selectable prior variant.
    ob=sr3_new_object('SR3_PREVIEW_'+task['uuid'][:8]+'_'+str(len(task['variants'])+1),co,faces,task=task);pin=ob.data.attributes.new(name='sr3_pinned',type='INT',domain='POINT');pin.data.foreach_set('value',pins);pos=ob.data.attributes.new(name='sr3_locked_position',type='FLOAT_VECTOR',domain='POINT');pos.data.foreach_set('vector',np.asarray(co,'f4').ravel());ob['sr3_boundary_lock']=True;ob['sr3_initial_control_positions']=json.dumps(np.asarray(co).tolist());ob['sr3_initial_face_count']=len(faces);ob['sr3_generated_position_hash']=digest(array(ob.data.vertices,'co',3,'f4'));task['variants'].append(ob['sr3_object_uuid']);task['initial_control_positions']=np.asarray(co).tolist();task['initial_preview_faces']=[list(f) for f in faces];task.update(active_preview=ob['sr3_object_uuid'],state='PREVIEW',algorithm=algorithm,parameters={'rows':rows,'bulge':sc.sr3_bulge,'reverse_second':sc.sr3_reverse_second,'flip':sc.sr3_flip},quality=None,uv_status='PENDING');task['history'].append({'event':'GENERATE_PREVIEW','variant':ob['sr3_object_uuid'],'source_unchanged':True});sr3_put(data);sr3_activate(ob,True);return ob

def sr3_pin_tick():
    if not sr3_active():return .4
    try:
        data=sr3_meta()
        for task in data['tasks'].values():
            o=sr3_find(task.get('active_preview'))
            if o is None or task['state']!='PREVIEW' or not o.get('sr3_boundary_lock'):continue
            if o.mode=='EDIT':
                bm=bmesh.from_edit_mesh(o.data);pin=bm.verts.layers.int.get('sr3_pinned');locked=bm.verts.layers.float_vector.get('sr3_locked_position');changed=False
                if pin and locked:
                    for v in bm.verts:
                        if v[pin]:
                            if (v.co-v[locked]).length>1e-8:v.co=v[locked];changed=True
                            if v.select:v.select_set(False);changed=True
                    if changed:bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
    except (RuntimeError,ReferenceError):pass
    return .25

def sr3_preview():
    data,task=sr3_task();o=sr3_find(task.get('active_preview'))
    if o is None or task['state']!='PREVIEW':raise ValueError('先生成独立补面预览')
    return data,task,o

def sr3_edit(action):
    data,task,o=sr3_preview();sr3_guard();sr3_activate(o,True);bm=bmesh.from_edit_mesh(o.data);pins=bm.verts.layers.int.get('sr3_pinned');free=[v for v in bm.verts if v.select and not (o.get('sr3_boundary_lock') and pins and v[pins])]
    if action=='SMOOTH':
        if not free:raise ValueError('先选预览内部控制点；锁定边界不会平滑')
        bmesh.ops.smooth_vert(bm,verts=free,factor=.4,use_axis_x=True,use_axis_y=True,use_axis_z=True)
    elif action=='SUBDIVIDE':
        edges=[e for e in bm.edges if e.select and not any(v[pins] for v in e.verts)]
        if not edges:raise ValueError('先选内部边；边界不自动加密')
        if len(bm.faces)+len(edges)*4>20000:raise ValueError('局部加密超过安全面数上限')
        bmesh.ops.subdivide_edges(bm,edges=edges,cuts=1,use_grid_fill=True)
    bmesh.update_edit_mesh(o.data,loop_triangles=True,destructive=action=='SUBDIVIDE');task['quality']=None;task['history'].append({'event':action,'native_selected_only':True});sr3_put(data)

def sr3_geometry(o):
    if o.mode=='EDIT':o.update_from_editmode()
    me=o.data;me.calc_loop_triangles();v=array(me.vertices,'co',3,'f4');mw=np.asarray(o.matrix_world);v=v@mw[:3,:3].T+mw[:3,3];tri=array(me.loop_triangles,'vertices',3);poly=array(me.loop_triangles,'polygon_index');return v,tri,poly

def sr3_segment_hit(a,b,t,eps=1e-8):
    d=b-a;e1=t[1]-t[0];e2=t[2]-t[0];h=np.cross(d,e2);det=np.dot(e1,h)
    if abs(det)<1e-12*max(np.linalg.norm(d)*np.linalg.norm(e1)*np.linalg.norm(e2),1e-20):return False
    inv=1/det;s=a-t[0];u=inv*np.dot(s,h);q=np.cross(s,e1);v=inv*np.dot(d,q);w=inv*np.dot(e2,q)
    inside=eps<u<1-eps and eps<v<1-eps and u+v<1-eps and eps<w<1-eps
    if not inside:return False
    area2=np.linalg.norm(np.cross(e1,e2));margin=min(u*area2/max(np.linalg.norm(e2),1e-20),v*area2/max(np.linalg.norm(e1),1e-20),(1-u-v)*area2/max(np.linalg.norm(e2-e1),1e-20),min(w,1-w)*np.linalg.norm(d))
    return margin>1e-7 # geometric model-unit contact tolerance, above float32 roundoff

def sr3_boundary_coverage(task,v,edges):
    # Expected source contours must remain represented by NEW patch boundary edges.
    # Arc-length split knots are allowed; a missing or shifted edge is not.
    missing=0;gaps=[]
    for b in task['boundaries']:
        pts=np.asarray(b['points'],'f8');pairs=list(zip(pts[:-1],pts[1:]))
        if b['closed']:pairs.append((pts[-1],pts[0]))
        for a,z in pairs:
            d=z-a;dd=np.dot(d,d)
            if dd<1e-20:continue
            t=(v-a)@d/dd;distance=np.linalg.norm(v-(a+t[:,None]*d),axis=1);ok=(distance<1e-6)&(t>=-1e-5)&(t<=1+1e-5);intervals=[]
            for x,y in edges:
                if ok[x] and ok[y]:intervals.append(sorted([float(t[x]),float(t[y])]))
            end=0.
            for x,y in sorted(intervals):
                if x>end+1e-4:break
                end=max(end,y)
            if end<1-1e-4:missing+=1;gaps.append({'from':a.tolist(),'to':z.tolist()})
    return missing,gaps[:20]

def sr3_coplanar_overlap_area(A,B):
    norm=np.cross(A[1]-A[0],A[2]-A[0]);nl=np.linalg.norm(norm)
    if nl<1e-14 or np.max(np.abs((B-A[0])@(norm/nl)))>1e-7:return 0.
    axis=int(np.argmax(np.abs(norm)));a=np.delete(A,axis,1);b=np.delete(B,axis,1);cross=lambda x,y:float(x[0]*y[1]-x[1]*y[0]);orientation=1 if cross(b[1]-b[0],b[2]-b[0])>=0 else -1;poly=list(a)
    for x,y in zip(b,np.roll(b,-1,axis=0)):
        prev=poly;poly=[]
        if not prev:break
        for start,end in zip(prev,prev[1:]+prev[:1]):
            ds=orientation*cross(y-x,start-x);de=orientation*cross(y-x,end-x);ins=ds>=-1e-12;ine=de>=-1e-12
            if ins!=ine and abs(ds-de)>1e-20:poly.append(start+(end-start)*ds/(ds-de))
            if ine:poly.append(end)
    return abs(sum(cross(x,y) for x,y in zip(poly,poly[1:]+poly[:1])))*.5 if len(poly)>=3 else 0.

class SR3ComputationLimit(RuntimeError):pass

def sr3_local_pairs(A,B,start,same=False):
    # Bounded streaming AABB candidates: no unbounded BVH overlap-pair list.
    blo=B.min(1);bhi=B.max(1);count=0
    for j,t in enumerate(A):
        if time.perf_counter()-start>8:raise SR3ComputationLimit('局部交叉检查时间预算已到')
        idx=np.flatnonzero((bhi>=t.min(0)-1e-9).all(1)&(blo<=t.max(0)+1e-9).all(1))
        for k in idx:
            if same and k<=j:continue
            count+=1
            if count>100000 or time.perf_counter()-start>8:raise SR3ComputationLimit('局部相交候选超出安全上限')
            yield j,int(k)

def sr3_disk_topology(vertex_count,faces,edges,counts):
    used=np.unique(faces);parent=np.arange(vertex_count)
    def find(a):
        while parent[a]!=a:parent[a]=parent[parent[a]];a=int(parent[a])
        return a
    def join(a,b):
        a=find(int(a));b=find(int(b))
        if a!=b:parent[a]=b
    for a,b in edges:join(a,b)
    components=len({find(int(x)) for x in used});boundary=edges[counts==1];adj={}
    for a,b in boundary:adj.setdefault(int(a),[]).append(int(b));adj.setdefault(int(b),[]).append(int(a))
    unseen=set(adj);loops=0
    while unseen:
        loops+=1;todo=[unseen.pop()]
        while todo:
            for n in adj[todo.pop()]:
                if n in unseen:unseen.remove(n);todo.append(n)
    return {'connected_components':components,'boundary_components':loops,'pinched_boundary_vertices':sum(len(x)!=2 for x in adj.values()),'loose_vertices':vertex_count-len(used)}

def sr3_quality(o,check_source=True):
    start=time.perf_counter();data=sr3_guard();v,f,poly=sr3_geometry(o)
    if not len(f):raise ValueError('预览没有面；请撤销删除或生成新候选')
    if len(f)>40000:raise ValueError('质量检查最多 4 万局部三角面；请减少预览密度')
    area=np.linalg.norm(np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]]),axis=1)*.5;edges=np.sort(np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]),1);keys,cnt=np.unique(edges,axis=0,return_counts=True);selfpairs=[];complete=True;triangles=v[f];topology=sr3_disk_topology(len(v),f,keys,cnt)
    try:
        for ai,bi in sr3_local_pairs(triangles,triangles,start,True):
            if np.intersect1d(f[ai],f[bi]).size:continue
            aa=triangles[ai];bb=triangles[bi]
            if any(sr3_segment_hit(aa[j],aa[(j+1)%3],bb) or sr3_segment_hit(bb[j],bb[(j+1)%3],aa) for j in range(3)) or sr3_coplanar_overlap_area(aa,bb)>1e-12:selfpairs.append([ai,bi])
            if len(selfpairs)>2000:complete=False;break
    except SR3ComputationLimit:complete=False
    source_cross=[];unknown_cross=[];coplanar=0;duplicate_source=[];reference_faces=0
    if check_source:
        lo=v.min(0)-1e-5;hi=v.max(0)+1e-5
        references=list(sr3_objects().items())+[(task['accepted_object'],sr3_find(task['accepted_object'])) for task in data['tasks'].values() if task['state']=='ACCEPTED' and task['accepted_object']!=o.get('sr3_object_uuid')]
        for uid,src in references:
            is_original=uid in data['sources'];sig=data['sources'][uid]['mesh'] if is_original else repair_mesh_signature(src.data);cachekey=(uid,sig['position'],sig['loops']);cached=_SR3_CACHE.get(cachekey)
            if cached is None:
                sv,st,sp=sr3_geometry(src);labels=read_labels(src.data) if is_original else [np.ones(len(src.data.polygons),'i4'),np.full(len(src.data.polygons),HUMAN,'i4')];fid=face_ids(src.data) if is_original else array(src.data.attributes['sr3_face_id'].data,'value');cached=(sv,st,sp,labels[0],labels[1],fid)
                if sum(x.nbytes for row in _SR3_CACHE.values() for x in row)+sum(x.nbytes for x in cached)>256*1024*1024:raise ValueError('只读参考缓存超过 256 MiB；另开更小的修复工作区')
                _SR3_CACHE[cachekey]=cached
            sv,st,source_poly,part,status,source_fid=cached;co=sv[st];mask=(co.max(1)>=lo).all(1)&(co.min(1)<=hi).all(1);idx=np.flatnonzero(mask);reference_faces+=len(idx)
            if reference_faces>50000:complete=False;break
            if not len(idx):continue
            try:
                for ni,ri in sr3_local_pairs(triangles,sv[st[idx]],start):
                    aa=v[f[ni]];bb=sv[st[idx[ri]]];proper=any(sr3_segment_hit(aa[j],aa[(j+1)%3],bb) or sr3_segment_hit(bb[j],bb[(j+1)%3],aa) for j in range(3))
                    if proper:
                        record={'preview_triangle':int(ni),'source_object_id':uid,'source_face_id':int(source_fid[source_poly[idx[ri]]])};(source_cross if part[source_poly[idx[ri]]]!=0 and status[source_poly[idx[ri]]]==HUMAN else unknown_cross).append(record)
                    else:
                        overlap=sr3_coplanar_overlap_area(aa,bb)
                        if overlap>1e-12:
                            coplanar+=1
                            if part[source_poly[idx[ri]]]!=0 and status[source_poly[idx[ri]]]==HUMAN:duplicate_source.append({'preview_triangle':int(ni),'source_object_id':uid,'source_face_id':int(source_fid[source_poly[idx[ri]]]),'overlap_area':overlap})
                            else:unknown_cross.append({'preview_triangle':int(ni),'source_object_id':uid,'source_face_id':int(source_fid[source_poly[idx[ri]]]),'type':'COPLANAR_AREA_OVERLAP'})
                    if len(source_cross)+len(unknown_cross)>2000 or time.perf_counter()-start>8:complete=False;break
            except SR3ComputationLimit:complete=False
            if not complete:break
    # Exact-coordinate duplicate triangles are never accepted as a repair.
    _,coord_ids=np.unique(v,axis=0,return_inverse=True);canonical=np.sort(coord_ids[f],axis=1);_,freq=np.unique(canonical,axis=0,return_counts=True);duplicate=int((freq-1).sum())
    data0,task0=sr3_task();missing_boundary,gaps=sr3_boundary_coverage(task0,v,keys[cnt==1]);reference_normal=np.asarray(task0.get('normal',[0,0,0]),'f8');fn=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]]);fn/=np.maximum(np.linalg.norm(fn,axis=1,keepdims=True),1e-12);reversed_normals=int((fn@reference_normal<-.25).sum()) if np.linalg.norm(reference_normal)>.5 else 0
    pinned=0.;me=o.data
    if me.attributes.get('sr3_pinned') and me.attributes.get('sr3_locked_position'):
        pins=sr3_attribute(o,'sr3_pinned').astype(bool);locked=sr3_attribute(o,'sr3_locked_position');local=array(me.vertices,'co',3,'f4');pinned=float(np.linalg.norm(v[pins]-locked[pins],axis=1).max()) if pins.any() else 0.
    report={'patch_topology':topology,'missing_source_boundary_segments':missing_boundary,'boundary_gap_examples':gaps,'duplicate_triangles':duplicate,'opposed_reference_normals':reversed_normals,'triangles':len(f),'quads':int((array(me.polygons,'loop_total')==4).sum()),'degenerate':int((area<1e-12).sum()),'nonmanifold_edges_over_two':int((cnt>2).sum()),'open_boundary_edges':int((cnt==1).sum()),'nonadjacent_self_intersections':len(selfpairs),'source_crossings':source_cross[:100],'unknown_reference_crossings':unknown_cross[:100],'coplanar_area_overlap_count':coplanar,'known_surface_overlap_count':len(duplicate_source),'known_surface_overlap_examples':duplicate_source[:50],'known_source_crossing_count':len(source_cross),'unconfirmed_reference_conflict_count':len(unknown_cross),'pinned_boundary_max_displacement':pinned,'reference_triangles':reference_faces,'complete_within_budget':complete,'uv_status':'CONSTRUCTION_ONLY' if len(me.uv_layers) else 'PENDING','seconds':time.perf_counter()-start,'geometry_hash':repair_mesh_signature(me),'geometric_contact_tolerance_model_units':1e-7,'reference_cache_bytes':sum(x.nbytes for row in _SR3_CACHE.values() for x in row),'source_unchanged':True};report['geometry_pass']=complete and topology=={'connected_components':1,'boundary_components':1,'pinched_boundary_vertices':0,'loose_vertices':0} and missing_boundary==0 and duplicate==0 and reversed_normals==0 and report['degenerate']==0 and report['nonmanifold_edges_over_two']==0 and not selfpairs and not source_cross and not duplicate_source and pinned<1e-6;return report

def sr3_check():
    data,task,o=sr3_preview();task['quality']=sr3_quality(o);task['uv_status']=task['quality']['uv_status'];sr3_put(data);return task['quality']

def sr3_confirm():
    data,task,o=sr3_preview();sc=bpy.context.scene
    if not sc.sr3_user_confirm or not sc.sr3_boundary_reviewed:raise ValueError('必须明确确认本次边界意图及预览；未加入正式修复层')
    q=sr3_quality(o)
    if not q['geometry_pass']:raise ValueError('质量检查未通过或超出预算，未确认；请人工调整 / 缩小范围')
    if q['unknown_reference_crossings'] and not sc.sr3_accept_reference_conflict:raise ValueError('补片与 UNKNOWN 参考面相交；先复核，不能默认 UNKNOWN 错误或删除它')
    if q['uv_status']!='USER_REVIEWED' and not sc.sr3_accept_pending_uv:raise ValueError('新面 UV 待处理 / 仅施工 UV；需明确允许进入检查层，不伪装纹理完成')
    if o.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    n=len(o.data.polygons);at=o.data.attributes.get('sr3_face_id') or o.data.attributes.new(name='sr3_face_id',type='INT',domain='FACE');at.data.foreach_set('value',np.arange(n,dtype='i4'));o['sr3_geometry_epoch']=str(uuid.uuid4());o['sr3_origin']='NEW_REPAIR_NOT_ORIGINAL_HUMAN';o['sr3_role']='ACCEPTED';o.name='SR3_REPAIR_'+task['uuid'][:8];o.hide_select=True;task.update(state='ACCEPTED',human_commit=True,boundary_reviewed=True,quality=q,accepted_object=o['sr3_object_uuid'],accepted_face_id_hash=digest(array(at.data,'value')),accepted_geometry_hash=repair_mesh_signature(o.data),accepted_object_signature=object_signature(o),parameters={**task['parameters'],'UV_pending_acknowledged':bool(sc.sr3_accept_pending_uv),'UNKNOWN_reference_conflict_reviewed':bool(sc.sr3_accept_reference_conflict)});task['user_edit_record']={'initial_generation_positions':json.loads(o['sr3_initial_control_positions']),'final_vertex_positions':array(o.data.vertices,'co',3,'f4').tolist(),'final_world_matrix':[list(r) for r in o.matrix_world],'topology_changed_since_generation':len(o.data.polygons)!=o['sr3_initial_face_count'] or len(o.data.vertices)!=len(json.loads(o['sr3_initial_control_positions'])),'record_scope':'actual final editable preview, no original-face ancestry claimed'};task['history'].append({'event':'EXPLICIT_CONFIRM','geometry_epoch':o['sr3_geometry_epoch'],'manual_edits_preserved':True});sr3_put(data);sr3_guard();return o

def sr3_retract(delete=False):
    data,task=sr3_task();sr3_guard();o=sr3_find(task.get('accepted_object') or task.get('active_preview'))
    if o is None:raise ValueError('没有可撤销的独立补片')
    if o.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    if delete:
        uid=o['sr3_object_uuid'];assert uid in task['object_ids'] and not o.get('_sgo_object_id');task['object_ids'].remove(uid);bpy.data.objects.remove(o,do_unlink=True);task['state']='DELETED'
    else:o.hide_set(True);task['state']='RETRACTED'
    task['history'].append({'event':'DELETE_LAYER' if delete else 'RETRACT_LAYER','source_unchanged':True});sr3_put(data);sr3_guard()

def sr3_transfer_digest(o):
    me=o.data;fields={'position':digest(array(me.vertices,'co',3,'f4')),'edges':digest(array(me.edges,'vertices',2)),'loops':digest(array(me.loops,'vertex_index')),'poly_start':digest(array(me.polygons,'loop_start')),'poly_total':digest(array(me.polygons,'loop_total')),'material_index':digest(array(me.polygons,'material_index')),'smooth':digest(array(me.polygons,'use_smooth',dtype='bool')),'uv':{u.name:digest(array(u.data,'uv',2,'f4')) for u in me.uv_layers},'object':object_signature(o),'attributes':{}}
    for at in me.attributes:
        if at.domain=='FACE' and at.data_type in ['INT','FLOAT'] and at.name.startswith(('sgo_','sgor_','repair_','sr3_')):
            fields['attributes'][at.name]=digest(array(at.data,'value',dtype='f4' if at.data_type=='FLOAT' else 'i4'))
        elif at.name in ['custom_normal','sharp_face','sharp_edge']:
            width=2 if at.data_type=='INT16_2D' else 1;val=array(at.data,'value',width,'bool' if at.data_type=='BOOLEAN' else 'i4')
            if at.data_type=='BOOLEAN' and not val.any():continue
            fields['attributes'][at.name]=digest(val)
    return fields

def sr3_export(dest):
    import tempfile,subprocess
    data=sr3_guard();dest=Path(dest).expanduser().resolve()
    if dest.exists() or dest.suffix.lower()!='.blend' or dest.name==data['source_filename']:raise ValueError('请选择新的导出文件名，不覆盖原工程')
    accepted=[t for t in data['tasks'].values() if t['state']=='ACCEPTED']
    if not accepted:raise ValueError('尚无明确确认的补面；未导出正式模型')
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    expected={u:sr3_transfer_digest(o) for u,o in sr3_objects().items()};expected.update({t['accepted_object']:sr3_transfer_digest(sr3_find(t['accepted_object'])) for t in accepted});source_path=bpy.data.filepath
    # Isolated writer avoids Blender 5.2.2 libraries.write(Scene) crashes.
    # All cleanup runs in a private file/process, never in the user's live scene.
    with tempfile.TemporaryDirectory(prefix='soulgrain_export_') as folder:
        tmp=Path(folder);copyfile=tmp/'workspace_copy.blend';manifest=tmp/'manifest.json';script=tmp/'write_confirmed.py';receipt=tmp/'receipt.json';bpy.ops.wm.save_as_mainfile(filepath=str(copyfile),copy=True,compress=True,check_existing=False,relative_remap=False)
        if bpy.data.filepath!=source_path:raise ValueError('Blender copy-save unexpectedly changed current path; export stopped')
        manifest.write_text(json.dumps({'scene':bpy.context.scene.name,'expected':expected,'accepted':[t['accepted_object'] for t in accepted],'output':str(dest),'receipt':str(receipt)},ensure_ascii=False))
        script.write_text(SR3_EXPORT_COMMON+SR3_EXPORT_WORKER)
        result=subprocess.run([bpy.app.binary_path,'--background','--factory-startup','--disable-autoexec',str(copyfile),'--python-exit-code','21','--python',str(script),'--',str(manifest)],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,timeout=90,text=True)
        if result.returncode or not receipt.exists() or not dest.exists():raise ValueError('独立导出未完成；工作台未改：'+result.stdout[-1800:])
        proof=json.loads(receipt.read_text())
        if not proof.get('verified') or proof['expected']!=expected:raise ValueError('导出面级数据回读不符；请保留工作台并检查输出')
    sr3_guard();return dest

SR3_EXPORT_WORKER = r"""
import sys,copy
from pathlib import Path
m=json.loads(Path(sys.argv[sys.argv.index('--')+1]).read_text());sc=bpy.data.scenes[m['scene']];bpy.context.window.scene=sc;data=json.loads(sc['_sgo_repair_studio_v3']);source_meta=sc['_sgo_v1_meta'];sourceids=set(data['sources']);accepted=set(m['accepted'])
def verify():
    found={}
    for o in sc.objects:
        u=o.get('_sgo_object_id') or o.get('sr3_object_uuid')
        if u in m['expected']:found[u]=sr3_transfer_digest(o)
    assert found==m['expected'],'Geometry/UV/face-ID/labels/transform changed in output'
    now=resource_signature()
    for kind in ['materials','images']:
        for name,val in data['resources'][kind].items():assert now[kind].get(name)==val,'PBR changed: '+name
    for name,val in json.loads(source_meta).get('migration',{}).get('archive_hashes',{}).items():assert hashlib.sha256(bpy.data.texts[name].as_string().encode()).hexdigest()==val
    return found
verify()
registered={u for t in data['tasks'].values() for u in t['object_ids']}
for o in list(sc.objects):
    own=o.get('sr3_object_uuid')
    if own and own not in accepted:
        assert own in registered,'Unregistered temporary object';mesh=o.data if o.type=='MESH' else None;bpy.data.objects.remove(o,do_unlink=True)
        if mesh and mesh.users==0:bpy.data.meshes.remove(mesh)
for other in list(bpy.data.scenes):
    if other!=sc:bpy.data.scenes.remove(other)
data['tasks']={k:{**t,'object_ids':[t['accepted_object']],'variants':[t['accepted_object']],'guides':[]} for k,t in data['tasks'].items() if t['state']=='ACCEPTED'}
sc['_sgo_repair_studio_v3']=json.dumps(data,ensure_ascii=False,separators=(',',':'));sc['sr3_task']=next(iter(data['tasks']))
for name in data['resources']['materials']:
    if bpy.data.materials.get(name):bpy.data.materials[name].use_fake_user=True
for name in data['resources']['images']:
    if bpy.data.images.get(name):bpy.data.images[name].use_fake_user=True
for name in json.loads(source_meta).get('migration',{}).get('archive_hashes',{}):bpy.data.texts[name].use_fake_user=True
verify();assert not Path(m['output']).exists();bpy.ops.wm.save_as_mainfile(filepath=m['output'],check_existing=False,compress=True,relative_remap=False);bpy.ops.wm.open_mainfile(filepath=m['output'],load_ui=False,use_scripts=False);sc=bpy.context.scene;data=json.loads(sc['_sgo_repair_studio_v3']);found=verify();assert all(not o.get('sr3_role') or o.get('sr3_role')=='ACCEPTED' for o in sc.objects);Path(m['receipt']).write_text(json.dumps({'verified':True,'expected':found}));print('ISOLATED_EXPORT_VERIFIED',flush=True)
"""

class SGO3_OT_initialize(bpy.types.Operator,ExportHelper):
    bl_idname='sgo3.initialize';bl_label='另存并建立 V3 只读源工作台';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):
        if not bpy.data.filepath:return report_error(self,ValueError('先打开 SOUL.NEW.blend 或 C 语义兼容工程'))
        self.filepath=str(Path(bpy.data.filepath).with_name(Path(bpy.data.filepath).stem+'_REPAIR_STUDIO_V3_WORK.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:sr3_initialize(self.filepath);context.scene.sr3_message='已另存工作台；源几何与标签冻结，只在独立层施工。';return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO3_OT_action(bpy.types.Operator):
    bl_idname='sgo3.action';bl_label='局部修复操作';bl_options={'REGISTER','UNDO'}
    action:StringProperty()
    def execute(self,context):
        try:
            if self.action=='SCOPE':o=sr3_scope();context.scene.sr3_message='已建立只读源范围副本；只选缺角边界，原网格不可选。'
            elif self.action=='DETECT':context.scene.sr3_message=json.dumps(sr3_detect(),ensure_ascii=False)
            elif self.action=='GUIDE':sr3_make_guide();context.scene.sr3_message='引导线是提案；原生 G 拖点，端点接回源边界。'
            elif self.action=='GENERATE':sr3_generate();context.scene.sr3_user_confirm=False;context.scene.sr3_message='橙色临时补片可原生编辑；尚未进入正式修复层。旧手改候选保留。'
            elif self.action=='EDIT':data,task,o=sr3_preview();sr3_activate(o,True);context.scene.sr3_message='仅编辑新增预览：G 拖点 / X 删错面 / Ctrl+Z 撤销。锁定边界不改源。'
            elif self.action=='LOCK':data,task,o=sr3_preview();o['sr3_boundary_lock']=not o.get('sr3_boundary_lock',True);sr3_pin_tick();context.scene.sr3_message='边界约束已'+('锁定' if o['sr3_boundary_lock'] else '解锁（确认时仍检查接合偏移）')
            elif self.action in ['SMOOTH','SUBDIVIDE']:sr3_edit(self.action);context.scene.sr3_message='已仅调整预览中的所选内部区域；没有重算整块补片。'
            elif self.action=='QA':q=sr3_check();context.scene.sr3_message=f'检查：{q["triangles"]} 三角面，退化 {q["degenerate"]}，自交 {q["nonadjacent_self_intersections"]}，已确认源穿插 {len(q["source_crossings"])}，UV {q["uv_status"]}。'
            elif self.action=='CONFIRM':sr3_confirm();context.scene.sr3_message='本次明确确认后已进入独立修复层；新增面不是原始 HUMAN。'
            elif self.action in ['RETRACT','DELETE']:sr3_retract(self.action=='DELETE');context.scene.sr3_message='已撤销 / 删除本任务独立补片；源几何和标注未动。'
            elif self.action=='RESUME':
                data=sr3_guard();data,t=sr3_task();o=sr3_find(t.get('accepted_object') or t.get('active_preview'))
                if o is None or t['state'] not in ['ACCEPTED','RETRACTED']:raise ValueError('只能将已确认 / 已撤回的独立补片转回预览')
                t.update(state='PREVIEW',active_preview=o['sr3_object_uuid'],human_commit=False,quality=None);o['sr3_role']='PREVIEW';t['history'].append({'event':'RESUME_EDITABLE_PREVIEW','requires_new_confirmation':True});sr3_put(data);sr3_activate(o,True)
                for name in ['sr3_user_confirm','sr3_boundary_reviewed','sr3_accept_pending_uv','sr3_accept_reference_conflict']:setattr(context.scene,name,False)
                context.scene.sr3_message='已回到可编辑预览；正式输出暂不包含它，修改后需重新检查与确认。'
            elif self.action=='TOGGLE':
                data,t=sr3_task();o=sr3_find(t.get('accepted_object') or t.get('active_preview'))
                if o is None:raise ValueError('该任务还没有补片')
                o.hide_set(not o.hide_get())
            elif self.action=='UV':
                data,t,o=sr3_preview()
                if o.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
                me=o.data;v=array(me.vertices,'co',3,'f4');center=v.mean(0);_,_,basis=np.linalg.svd(v-center,full_matrices=False);xy=(v-center)@basis[:2].T;xy=(xy-xy.min(0))/np.maximum(np.ptp(xy,axis=0),1e-8);uv=me.uv_layers.get('SR3_CONSTRUCTION_UV') or me.uv_layers.new(name='SR3_CONSTRUCTION_UV');uv.data.foreach_set('uv',xy[array(me.loops,'vertex_index')].astype('f4').ravel());t['uv_status']='CONSTRUCTION_ONLY';t['quality']=None;sr3_put(data);context.scene.sr3_message='仅生成新面施工 UV；没有转移原纹样，仍需人工纹理处理。'
            elif self.action=='PREVIOUS':
                data,t=sr3_task();n=t['variants'].index(t['active_preview']);old=sr3_find(t['active_preview']);old.hide_set(True);t['active_preview']=t['variants'][(n-1)%len(t['variants'])];t['state']='PREVIEW';sr3_put(data);sr3_activate(sr3_find(t['active_preview']),True)
            else:raise ValueError('未知操作')
            return {'FINISHED'}
        except Exception as exc:context.scene.sr3_message='未写入：'+str(exc);return report_error(self,exc)

class SGO3_OT_export(bpy.types.Operator,ExportHelper):
    bl_idname='sgo3.export';bl_label='导出已确认修复版工程';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):self.filepath=str(Path(bpy.data.filepath).with_name(Path(bpy.data.filepath).stem+'_ACCEPTED.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:sr3_export(self.filepath);context.scene.sr3_message='已导出源模型 + 明确确认补片；未确认预览、引导和范围副本均未写入正式文件。';return {'FINISHED'}
        except Exception as exc:return report_error(self,exc)

class SGO3_OT_task_pick(bpy.types.Operator):
    bl_idname='sgo3.pick_task';bl_label='选择修复任务';task_uuid:StringProperty()
    def execute(self,context):
        context.scene.sr3_task=self.task_uuid
        for name in ['sr3_user_confirm','sr3_boundary_reviewed','sr3_accept_pending_uv','sr3_accept_reference_conflict']:setattr(context.scene,name,False)
        return {'FINISHED'}

class SGO3_PT_studio(bpy.types.Panel):
    bl_label='几何修复工作台 · V3.0 MVP';bl_idname='SGO3_PT_studio';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    def draw(self,context):
        l=self.layout;sc=context.scene
        if META not in sc:l.label(text='先打开真实 SOUL 语义工程。');return
        if not sr3_active():l.operator('sgo3.initialize',icon='DUPLICATE');l.label(text='独立工作副本；源拓扑、UV、PBR、标签只读。');return
        l.label(text='MVP：后跟局部补片 / 包头双轮廓桥接',icon='INFO');l.label(text='源面不删除、不移动；UNKNOWN 只作参考。',icon='LOCKED');l.prop(sc,'sgo_target',text='待修部件');l.prop(sc,'sr3_include_candidates',text='允许已有 AUTO / 待验收面作为约束参考')
        def button(action,text,icon='NONE'):
            op=l.operator('sgo3.action',text=text,icon=icon);op.action=action
        button('SCOPE','1 指定局部范围（只读范围副本）','FACESEL');button('DETECT','2 检测所选边界（只给建议）','VIEWZOOM');l.prop(sc,'sr3_algorithm',text='补面方案');l.prop(sc,'sr3_rows',text='曲面段数');l.prop(sc,'sr3_bulge',text='初始弧度');l.prop(sc,'sr3_guide_height',text='提案引导高度');l.prop(sc,'sr3_reverse_second',text='反转第二条边界顺序');l.prop(sc,'sr3_flip',text='翻转新面法线');button('GUIDE','3 开链：创建 / 编辑目标引导');button('GENERATE','4 生成新候选（保留旧手改）','MESH_GRID');button('EDIT','调整预览：原生拖点 / 删错面','EDITMODE_HLT');button('LOCK','切换边界锁定');button('SMOOTH','仅平滑选中的内部控制点');button('SUBDIVIDE','仅加密选中的内部边');button('PREVIOUS','切换到上一个候选');button('UV','新面施工 UV（不是原图集转移）');button('QA','5 检查源保护、穿插、边界及 UV','CHECKMARK');l.prop(sc,'sr3_boundary_reviewed',text='已核实边界意图，不是正常开口 / 语义截边');l.prop(sc,'sr3_accept_pending_uv',text='允许 UV 待处理进入检查层');l.prop(sc,'sr3_accept_reference_conflict',text='已复核与未确认参考的局部冲突');l.prop(sc,'sr3_user_confirm',text='我确认当前补片进入独立修复层');button('CONFIRM','6 确认本次修复（重新检查）','CHECKMARK');button('RETRACT','撤销本次补片（可回退）');button('RESUME','撤回后重新编辑预览');button('DELETE','删除本任务补片（不删源）');button('TOGGLE','显示 / 隐藏本任务修复层');l.operator('sgo3.export',icon='EXPORT');l.operator('wm.save_as_mainfile',text='另存整个工作台（含未确认预览）')
        box=l.box();box.label(text='已有修复任务')
        for key,t in list(sr3_meta()['tasks'].items())[-8:]:op=box.operator('sgo3.pick_task',text=t['target_name']+' '+t['state']+' '+key[:8]);op.task_uuid=key
        for text in sc.sr3_message.split('；')[:4]:l.label(text=text[:72])
        l.label(text='内衬生成、四层剖切和纹样烘焙：后续版本，不在 MVP。')

_SR3_CLASSES=[SGO3_OT_initialize,SGO3_OT_action,SGO3_OT_export,SGO3_OT_task_pick,SGO3_PT_studio]
_SR3_PROPS=['sr3_task','sr3_message','sr3_algorithm','sr3_rows','sr3_bulge','sr3_guide_height','sr3_flip','sr3_reverse_second','sr3_include_candidates','sr3_boundary_reviewed','sr3_user_confirm','sr3_accept_pending_uv','sr3_accept_reference_conflict']

def sr3_inspector_draw(self,context):
    if sr3_active():self.layout.label(text='源标签只读；使用“几何修复工作台”的局部范围副本。',icon='LOCKED');return
    _SR3_BASE_INSPECT_DRAW(self,context)

def sr3_root_draw(self,context):
    if not sr3_active():return _SR3_BASE_ROOT_DRAW(self,context)
    self.layout.label(text='Repair Studio V3 · 源模型与 HUMAN 冻结',icon='LOCKED');self.layout.label(text='圈范围 → 生成候选 → 手工调整 → 检查 → 明确确认');self.layout.operator('sgo.frame',text='框显源鞋');self.layout.label(text='正式补片在下方“几何修复工作台”管理。')

def sr3_data_draw(self,context):
    if not sr3_active():return _SR3_BASE_DATA_DRAW(self,context)
    self.layout.operator('sgo.toggle_preview',text='源零件颜色 / 原 PBR');self.layout.operator('sgo.validate',text='验证冻结源、标签和材质');self.layout.label(text='源标签只读；不会重新识别 UNKNOWN。',icon='LOCKED')

def sr3_grow_draw(self,context):
    if not sr3_active():return _SR3_BASE_GROW_DRAW(self,context)
    self.layout.label(text='V3 不做源语义扩展分类；转入几何修复。',icon='LOCKED')

def register():
    _SR3_BASE_REGISTER()
    for cls in _SR3_CLASSES:bpy.utils.register_class(cls)
    bpy.types.Scene.sr3_task=StringProperty(default='');bpy.types.Scene.sr3_message=StringProperty(default='先选部件、局部边界，再预览；未经确认不进入输出。');bpy.types.Scene.sr3_algorithm=EnumProperty(items=[('HOLE','小洞闭环填充','单一闭环，非鞋口或正常孔'),('EXTEND','源开链 + 目标引导','缺角与轮廓延伸'),('BRIDGE','双开链曲面桥接','包头厚度侧壁')],default='EXTEND');bpy.types.Scene.sr3_rows=IntProperty(default=8,min=2,max=32);bpy.types.Scene.sr3_bulge=FloatProperty(default=0,min=-.05,max=.05);bpy.types.Scene.sr3_guide_height=FloatProperty(default=.02,min=-.1,max=.1)
    for name in ['sr3_flip','sr3_reverse_second','sr3_include_candidates','sr3_boundary_reviewed','sr3_user_confirm','sr3_accept_pending_uv','sr3_accept_reference_conflict']:setattr(bpy.types.Scene,name,BoolProperty(default=False))
    SGO2_PT_inspector.draw=sr3_inspector_draw;SGO2_PT_root.draw=sr3_root_draw;SGO2_PT_data.draw=sr3_data_draw;SGO2_PT_growth.draw=sr3_grow_draw
    if not bpy.app.background:bpy.app.timers.register(sr3_pin_tick,first_interval=.3,persistent=True)
    registration={'runtime':rt,'cleanup':unregister};bpy._sgo_v2_registration=registration;bpy.app.driver_namespace['SGO_V2_REGISTRATION']=registration

def unregister():
    if bpy.app.timers.is_registered(sr3_pin_tick):bpy.app.timers.unregister(sr3_pin_tick)
    for cls in reversed(_SR3_CLASSES):
        if getattr(cls,'is_registered',False):bpy.utils.unregister_class(cls)
    for name in _SR3_PROPS:
        if hasattr(bpy.types.Scene,name):delattr(bpy.types.Scene,name)
    _SR3_BASE_UNREGISTER()

if __name__=='__main__':register()
