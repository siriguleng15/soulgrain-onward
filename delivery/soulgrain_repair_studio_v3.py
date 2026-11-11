"""Soulgrain Repair Studio V3.0: editable independent repair layers; original source is read-only.
Run in Blender's Text Editor, or install as a legacy add-on.
"""
bl_info = {"name": "Soulgrain Repair Studio V3.0 鞋底修补 MVP", "author": "Codex", "version": (3, 0, 0), "blender": (5, 2, 0), "location": "3D 视图 > N > Soulgrain", "category": "Mesh"}
import bpy, bmesh, json, hashlib, uuid, os, time
from pathlib import Path
from mathutils import Vector
import numpy as np
from bpy.props import StringProperty, EnumProperty, BoolProperty
from bpy_extras.io_utils import ExportHelper, ImportHelper

SCHEMA = "soulgrain.face-semantics/1.0"
META = "_sgo_v1_meta"
P, S, C, I, FID = "sgo_part", "sgo_status", "sgo_confidence", "sgo_issue", "sgo_source_face"
COLOR = "SGO_V1_PREVIEW_ONLY"
AUTO, HUMAN = 1, 2
# code, semantic key, Chinese name, parent key, display color
BASE_PARTS = [
 (0,"UNKNOWN","UNKNOWN 未识别 / 待确认","",(1,.015,.50)),
 (10,"UPPER","鞋身：未细分","SHOE",(.05,.34,.92)),
 (11,"UPPER_SIDE_A","鞋帮侧 A（原坐标 Y<0）","UPPER",(.03,.30,.9)),
 (12,"UPPER_SIDE_B","鞋帮侧 B（原坐标 Y>0）","UPPER",(.02,.66,.92)),
 (13,"VAMP","前鞋面 / 布面鞋头","UPPER",(.07,.75,.6)),
 (14,"HEEL","后跟鞋身","UPPER",(.15,.37,.62)),
 (20,"SOLING","鞋底组件：未细分","SHOE",(.3,.62,.05)),
 (21,"OUTSOLE","外底 / 底面","SOLING",(.13,.32,.025)),
 (22,"SIDEWALL","鞋底侧墙","SOLING",(.48,.75,.10)),
 (23,"TOE_CAP","橡胶包头","SOLING",(.98,.40,.035)),
 (24,"FOXING","硫化围条","SOLING",(.95,.70,.03)),
 (25,"RED_ACCENT","红色装饰带（表面区域）","FOXING",(.92,.04,.025)),
 (30,"CUFF","翻筒：未细分","SHOE",(.41,.055,.8)),
 (31,"CUFF_OUTER","翻筒外表面","CUFF",(.54,.08,.9)),
 (32,"CUFF_INNER","翻筒内表面","CUFF",(.73,.30,.9)),
 (33,"CUFF_EDGE","翻筒边缘","CUFF",(.35,.025,.42)),
 (40,"TONGUE","鞋舌：未细分","SHOE",(.03,.76,.88)),
 (41,"TONGUE_FRONT","鞋舌外观面候选","TONGUE",(.04,.60,.82)),
 (42,"TONGUE_BACK","鞋舌背面候选","TONGUE",(.02,.30,.43)),
 (43,"TONGUE_EDGE","鞋舌边缘 / 厚度","TONGUE",(.08,.85,.6)),
 (44,"TONGUE_DECOR","鞋舌装饰区域","TONGUE",(.72,.60,.04)),
 (50,"LACE","鞋带（仅确定的面）","SHOE",(.97,.86,.035)),
 (60,"EYELET","孔圈：未细分","HARDWARE",(.04,.72,.13)),
 (70,"HEEL_STRIP","后跟皮条 / 回纹条","HEEL",(.67,.17,.08)),
 (71,"CLASP","扣件","HARDWARE",(.62,.53,.20)),
 (72,"STRAP","连接带","HARDWARE",(.58,.37,.05)),
 (80,"STITCH","缝线 / 包边区域","DECORATION",(.84,.82,.58)),
 (90,"DECORATION","其他已确认装饰","SHOE",(.48,.48,.48)),
]
# Immutable audit fingerprints are inserted below during packaging, not inferred from names.
AUDITED = {'DEBUG_LACES_VISIBILITY_ONLY': {'position': 'b29437249b559f9e4b682bf1df722bc2bd4c7f5a866a19dc96dcfb34a8c85952', 'loops': '0d65d73c79ca71a025b6aa754ae64a6a3ce0bddc20ae7255025f0fbc3ad60e5d'}, 'GEO_TONGUE_CONTINUOUS_FRONT_BACK': {'position': 'd7082bb70a6e6cee5c0e810ffacd1d554dc56f78f1b95f3c6845b25d230271a3', 'loops': '41720f611dd1e78be04daab7b0c50558d75257c4c4013014af43680d8fa8edca'}, 'New_minus_eyelet_1': {'position': '9f0fbdd4c08ab86de9309866b3fc695bab2cb244ab24b5c31c3d65188f17d87c', 'loops': 'c639143919f6314dd362f3f9900f5da41f83cdbbb951599faf4199b44769d4de'}, 'New_minus_eyelet_2': {'position': '27868498736294c791ce64bce386bafbfa3265817b1796238ee7f5cd96a1ceb6', 'loops': 'c639143919f6314dd362f3f9900f5da41f83cdbbb951599faf4199b44769d4de'}, 'New_minus_eyelet_3': {'position': 'fe33fb309a409936a9c4f8ea8a549229261fb71f9c70a044b9e32325339209b9', 'loops': 'c639143919f6314dd362f3f9900f5da41f83cdbbb951599faf4199b44769d4de'}, 'New_minus_eyelet_4': {'position': '22668a5622fd79fb6b4c790c4c3527b09c77a74af0b0b0699eb8060a57ba2ac3', 'loops': 'c639143919f6314dd362f3f9900f5da41f83cdbbb951599faf4199b44769d4de'}, 'New_minus_eyelet_5': {'position': 'f23583a4e5ec23438ef42980e7406dbab2a70050356f538cbf1415b3db6c3c98', 'loops': 'c639143919f6314dd362f3f9900f5da41f83cdbbb951599faf4199b44769d4de'}, 'Preserved_plus_eyelet_1': {'position': '89357bbd85d317b58fc359aa2b677bf226ce524d10d05d661dcee88b12035fd6', 'loops': '67f0e0f047aa30ed564ec276c55971d673270408a8dad4e861125ec259b11e1b'}, 'Preserved_plus_eyelet_2': {'position': '57f6a3fcc2ee07b8047ecd64f596558b5ea242cc89406cbe44f0dcd7f8025725', 'loops': '67f0e0f047aa30ed564ec276c55971d673270408a8dad4e861125ec259b11e1b'}, 'Preserved_plus_eyelet_3': {'position': '7ebc7a382f288822fcf2aa138fe7152236a2f623e6a3f54f1a0d91419086d868', 'loops': '67f0e0f047aa30ed564ec276c55971d673270408a8dad4e861125ec259b11e1b'}, 'Preserved_plus_eyelet_4': {'position': '6efdf41c69b83b6d179e5b135d2ed4918c7adea0cd61b7561c09aabb523f001c', 'loops': '67f0e0f047aa30ed564ec276c55971d673270408a8dad4e861125ec259b11e1b'}, 'Preserved_plus_eyelet_5': {'position': '5c6b4691ed586d7af8716de34290a5a37b4149fdd734b540c7b270883a1bc4a0', 'loops': '67f0e0f047aa30ed564ec276c55971d673270408a8dad4e861125ec259b11e1b'}, 'Shoe_TEST_V3': {'position': 'a8fdd0660dfd8378fb8a86740462c64c7790f4e7efda18843850cec70d39f2fa', 'loops': '263b564e58a82f6234764857f6c4a61239b649d44255859a34bb037a2ded8ce8'}}
_SPACE_STATE = {}
_ENUM_CACHE = {}
_OBJECT_ENUM_CACHE = {}

def digest(a):
    return hashlib.sha256(np.ascontiguousarray(a).tobytes()).hexdigest()

def array(collection, prop, width=1, dtype='i4'):
    a=np.empty(len(collection)*width,dtype=dtype); collection.foreach_get(prop,a)
    return a.reshape(-1,width) if width>1 else a

def uv_signatures(me):
    if me.is_editmode:
        bm=bmesh.from_edit_mesh(me);result={};count=sum(len(f.loops) for f in bm.faces)*2
        for u in me.uv_layers:
            name=str(u.name)
            layer=bm.loops.layers.uv.get(name)
            if layer is None:raise ValueError('UV 层缺失：'+name)
            values=np.fromiter((v for f in bm.faces for loop in f.loops for v in loop[layer].uv),dtype='f4',count=count)
            result[name]=digest(values)
        return result
    return {u.name:digest(array(u.data,'uv',2,'f4')) for u in me.uv_layers}

def mesh_signature(me):
    return {
      'vertices':len(me.vertices),'edges':len(me.edges),'faces':len(me.polygons),
      'position':digest(array(me.vertices,'co',3,'f4')),
      'edges_hash':digest(array(me.edges,'vertices',2)),
      'loops':digest(array(me.loops,'vertex_index')),
      'poly_start':digest(array(me.polygons,'loop_start')),
      'poly_total':digest(array(me.polygons,'loop_total')),
      'material_index':digest(array(me.polygons,'material_index')),
      'uv':uv_signatures(me),
      'normals':digest(array(me.corner_normals,'vector',3,'f4')),
    }

def material_signature(mat):
    if mat is None: return None
    nodes=[];links=[]
    if mat.use_nodes and mat.node_tree:
        for n in mat.node_tree.nodes:
            row={'name':n.name,'type':n.bl_idname,'inputs':{}}
            if hasattr(n,'image'):row['image']=n.image.name if n.image else None
            for k in ['extension','interpolation','projection','uv_map','operation','blend_type']:
                if hasattr(n,k):row[k]=getattr(n,k)
            for s in n.inputs:
                if not hasattr(s,'default_value'):continue
                x=s.default_value
                if isinstance(x,(str,int,float,bool)):row['inputs'][s.identifier]=x
                elif hasattr(x,'__len__'):
                    try:row['inputs'][s.identifier]=list(x)
                    except TypeError:pass
            nodes.append(row)
        links=sorted((l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier) for l in mat.node_tree.links)
    return hashlib.sha256(json.dumps({'nodes':nodes,'links':links,'diffuse':list(mat.diffuse_color)},sort_keys=True).encode()).hexdigest()

def resource_signature():
    mats={m.name:material_signature(m) for m in bpy.data.materials}
    ims={}
    for im in bpy.data.images:
        if im.source=='VIEWER':continue
        ims[im.name]={'source':im.source,'path':im.filepath,'size':list(im.size),'colorspace':im.colorspace_settings.name,'packed':hashlib.sha256(bytes(im.packed_file.data)).hexdigest() if im.packed_file else None}
    return {'materials':mats,'images':ims}

def object_signature(o):
    return {'parent':o.parent.name if o.parent else None,'matrix_world':[list(r) for r in o.matrix_world],
            'matrix_local':[list(r) for r in o.matrix_local],
            'materials':[[s.link,s.material.name if s.material else None] for s in o.material_slots]}

def meta(scene=None):
    sc=scene or bpy.context.scene
    if META not in sc:raise ValueError('请先点击“建立标注工作副本”。原工程不会被直接标注。')
    return json.loads(sc[META])

def put_meta(m,scene=None):
    (scene or bpy.context.scene)[META]=json.dumps(m,ensure_ascii=False,separators=(',',':'))
    _ENUM_CACHE.clear()

def safe_work():
    m=meta();path=Path(bpy.data.filepath).resolve()
    if not bpy.data.filepath or str(path)==m['source_path'] or path.name==m['source_name']:
        raise ValueError('当前不是安全的标注工作文件。请建立不同文件名的工作副本。')
    return m

def objects(m=None):
    m=m or meta();meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];ids=[o.get('_sgo_object_id') for o in meshes]
    if any(x is None for x in ids) or len(ids)!=len(set(ids)):raise ValueError('发现新增网格、缺失身份或重复对象 ID；请撤销对象复制后再标注')
    lookup={o.get('_sgo_object_id'):o for o in meshes}
    missing=set(m['objects'])-set(lookup)
    if missing:raise ValueError('源对象缺失或身份丢失，已停止操作。')
    return {uid:lookup[uid] for uid in m['objects']}

def sync_edit():
    for o in bpy.context.objects_in_mode_unique_data:
        if o.type=='MESH':o.update_from_editmode()

def validate(m=None, all_resources=True):
    m=m or safe_work();sync_edit();errors=[]
    for uid,o in objects(m).items():
        for name,typ in [(P,'INT'),(S,'INT'),(C,'FLOAT'),(I,'INT'),(FID,'INT')]:
            at=o.data.attributes.get(name)
            if not at or at.domain!='FACE' or at.data_type!=typ:errors.append(o.name+'：标注属性缺失或类型不匹配 '+name)
        if not o.data.color_attributes.get(COLOR):errors.append(o.name+'：专用预览属性缺失')
        if not o.data.attributes.get(FID) or not np.array_equal(face_ids(o.data),np.arange(len(o.data.polygons),dtype='i4')):errors.append(o.name+'：源面 ID 已失效')
        if mesh_signature(o.data)!=m['objects'][uid]['mesh']:errors.append(o.name+'：几何 / UV / 法线 / 材质面索引已变化')
        if object_signature(o)!=m['objects'][uid]['object']:errors.append(o.name+'：父级 / 位置 / 材质绑定已变化')
    if all_resources and resource_signature()!=m['resources']:errors.append('原始材质节点或贴图资源已变化')
    if errors:raise ValueError('版本保护检查未通过；请撤销几何编辑或重新打开工作文件。\n'+'\n'.join(errors[:5]))
    return m

def attrs(me):
    for name,typ in [(P,'INT'),(S,'INT'),(C,'FLOAT'),(I,'INT'),(FID,'INT')]:
        a=me.attributes.get(name)
        if a and (a.domain!='FACE' or a.data_type!=typ):raise ValueError('同名属性类型冲突：'+name)
        if not a:me.attributes.new(name=name,type=typ,domain='FACE')
    if not me.color_attributes.get(COLOR):me.color_attributes.new(name=COLOR,type='BYTE_COLOR',domain='CORNER')

def face_ids(me):
    if me.is_editmode:
        bm=bmesh.from_edit_mesh(me);layer=bm.faces.layers.int.get(FID)
        if layer is None:raise ValueError('源面 ID 属性缺失')
        return np.fromiter((f[layer] for f in bm.faces),dtype='i4',count=len(bm.faces))
    return array(me.attributes[FID].data,'value')

def read_labels(me):
    if me.is_editmode:
        bm=bmesh.from_edit_mesh(me);layers=[bm.faces.layers.float.get(n) if n==C else bm.faces.layers.int.get(n) for n in [P,S,C,I]]
        if any(x is None for x in layers):raise ValueError('标注属性缺失')
        return [np.fromiter((f[layer] for f in bm.faces),dtype='f4' if name==C else 'i4',count=len(bm.faces)) for name,layer in zip([P,S,C,I],layers)]
    return [array(me.attributes[n].data,'value',dtype='f4' if n==C else 'i4') for n in [P,S,C,I]]

def write_labels(me,labels):
    for name,a in zip([P,S,C,I],labels):me.attributes[name].data.foreach_set('value',np.asarray(a).reshape(-1))
    me.update()

def catalog(m=None):return {int(x['code']):x for x in (m or meta())['parts']}

def recolor(me,m=None):
    m=m or meta();part=array(me.attributes[P].data,'value');starts=array(me.polygons,'loop_start');total=array(me.polygons,'loop_total')
    perface=np.empty((len(part),4),'f4');perface[:]=(1,.015,.50,1)
    for code,row in catalog(m).items():perface[part==code]=[*row['color'],1]
    colors=np.repeat(perface,total,axis=0);me.color_attributes[COLOR].data.foreach_set('color',colors.reshape(-1));me.color_attributes.active_color=me.color_attributes[COLOR];me.update()

def preview(on=True):
    m=safe_work()
    for o in objects(m).values():
        if on:o.data.color_attributes.active_color=o.data.color_attributes[COLOR]
        else:
            old=m['objects'][o['_sgo_object_id']]['original_active_color']
            if old and o.data.color_attributes.get(old):o.data.color_attributes.active_color=o.data.color_attributes[old]
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type!='VIEW_3D':continue
            space=area.spaces.active;key=space.as_pointer()
            if on:
                _SPACE_STATE.setdefault(key,(space.shading.type,space.shading.color_type));space.shading.type='SOLID';space.shading.color_type='VERTEX'
            else:
                old=_SPACE_STATE.pop(key,None)
                if old:space.shading.type,space.shading.color_type=old
                else:space.shading.type='MATERIAL'
            area.tag_redraw()
    bpy.context.scene.sgo_preview=on

def part_items(self,context):
    if not context or META not in context.scene:return [('0','UNKNOWN 未识别','先建立工作副本')]
    m=meta(context.scene);key=m['asset_id']
    if key not in _ENUM_CACHE:_ENUM_CACHE[key]=[(str(x['code']),x['name'],x['key']+' | '+x['id']) for x in m['parts']]
    return _ENUM_CACHE[key]

def active_mesh(context):
    o=context.active_object
    if not o or o.type!='MESH' or not o.get('_sgo_object_id'):raise ValueError('请先选择一个已纳入工作副本的网格对象。')
    return o

def explicit_mesh(context):
    m=safe_work();obs=objects(m);uid=context.scene.sgo_object;o=obs.get(uid)
    if o is None:raise ValueError('明确的编辑对象无效，请在面板中重新选择')
    active=context.active_object
    if active!=o:raise ValueError('编辑对象为 '+o.name+'，实际活动对象为 '+(active.name if active else '无')+'；未写入。请点“选择该编辑对象”或“采用当前活动对象”。')
    return o

def report_error(op,e):op.report({'ERROR'},str(e));return {'CANCELLED'}

def classify(o,m):
    """Conservative local geometry rules, not an online AI/model service."""
    me=o.data;n=len(me.polygons);labels=np.zeros(n,'i4');conf=np.zeros(n,'f4');issues=np.zeros(n,'i4')
    name=m['objects'][o['_sgo_object_id']]['source_name'];sig=mesh_signature(me);known=AUDITED.get(name,{})
    if known.get('position')!=sig['position'] or known.get('loops')!=sig['loops']:
        return labels,conf,issues,'未匹配已审计网格指纹，保留 UNKNOWN；可正常人工标注'
    if name.startswith(('New_minus_eyelet_','Preserved_plus_eyelet_')):
        code=next(x['code'] for x in m['parts'] if x.get('source_object_id')==o['_sgo_object_id']);labels[:]=code;conf[:]=.99
        return labels,conf,issues,'已审计的独立翻筒孔圈；仍是自动候选'
    if name=='DEBUG_LACES_VISIBILITY_ONLY':
        return labels,conf,issues,'调试组含融合面及碎片，不把整个对象认定为完整鞋带'
    centers=array(me.polygons,'center',3,'f4');normals=array(me.polygons,'normal',3,'f4');mat=array(me.polygons,'material_index')
    starts=array(me.polygons,'loop_start');totals=array(me.polygons,'loop_total');lv=array(me.loops,'vertex_index');positions=array(me.vertices,'co',3,'f4')
    def predict(p,n,mi):
        x,y,z=p.T;nx,ny,nz=n.T;a=np.zeros(len(p),'i4');c=np.zeros(len(p),'f4')
        def setpart(mask,code,value):a[mask]=code;c[mask]=value
        if name=='GEO_TONGUE_CONTINUOUS_FRONT_BACK':
            setpart(np.ones(len(p),bool),40,.92)
            setpart((mi==0)&((nz>.25)|(nx<-.35)),41,.88)
            setpart((mi==1)&((nz<-.3)|(nx>.4)),42,.80)
            # Side walls are not inferred merely from a narrow spatial strip.
        elif name=='Shoe_TEST_V3':
            finish=(mi==9);cloth=(mi>=0)&(mi<=6)
            setpart(finish&(z<-.40)&(nz<-.50),21,.84)
            setpart(finish&(z<-.30)&(abs(nz)<.65),22,.80)
            setpart(finish&(x<-.58)&(z>-.31)&(nz>.40),23,.86)
            outer=cloth&(abs(y)>.22)&(z>-.29)&(z<.19)&(ny*np.sign(y)>.35)&(x>-.60)&(x<.70)
            setpart(outer&(y<0),11,.82);setpart(outer&(y>0),12,.82)
            setpart(cloth&(x<-.48)&(z>-.26)&(nz>.35)&(abs(y)<.22),13,.76)
            setpart(cloth&(x>.62)&(z>-.30)&(z<.20)&(nx>.35),14,.82)
            cuff=(mi==8)&(x>.03)&(z>-.37)
            radial=nx*(x-.35)+ny*y
            setpart(cuff,30,.81);setpart(cuff&(radial>.045),31,.90)
        return a,c
    labels,conf=predict(centers,normals,mat)
    looplabels,_=predict(positions[lv],np.repeat(normals,totals,axis=0),np.repeat(mat,totals))
    lo=np.minimum.reduceat(looplabels,starts);hi=np.maximum.reduceat(looplabels,starts)
    cross=(lo!=hi);labels[cross]=0;conf[cross]=0;issues[cross]=1
    # Real mesh edge adjacency adjusts confidence. It does not imply a physical cut.
    edgeids=array(me.loops,'edge_index');faces=np.repeat(np.arange(n,dtype='i4'),totals);order=np.argsort(edgeids,kind='stable');ecount=np.bincount(edgeids,minlength=len(me.edges));estart=np.r_[0,np.cumsum(ecount)[:-1]];double=np.flatnonzero(ecount==2)
    if len(double):
        a=faces[order[estart[double]]];b=faces[order[estart[double]+1]];same=(labels[a]==labels[b])&(labels[a]!=0);different=(labels[a]!=labels[b])&(labels[a]!=0)&(labels[b]!=0)
        bonus=np.zeros(n,'f4');np.add.at(bonus,a[same],.012);np.add.at(bonus,b[same],.012);np.add.at(bonus,a[different],-.03);np.add.at(bonus,b[different],-.03);conf=np.clip(conf+bonus,0,.97)
    return labels,conf,issues,'已结合审计指纹、材质、位置、法线及面邻接生成候选；未认证为正式边界'

def summary(m=None):
    m=m or meta();result={'faces':0,'unknown':0,'manual':0,'auto':0,'issues':0,'parts':{}}
    sync_edit()
    for uid,o in objects(m).items():
        p,s,c,i=read_labels(o.data);result['faces']+=len(p);result['unknown']+=int((p==0).sum());result['manual']+=int((s==HUMAN).sum());result['auto']+=int((s==AUTO).sum());result['issues']+=int((i!=0).sum())
        codes,counts=np.unique(p,return_counts=True)
        for code,count in zip(codes,counts):result['parts'][str(int(code))]=result['parts'].get(str(int(code)),0)+int(count)
    return result

def encode_runs(labels):
    p,s,c,i=labels;n=len(p)
    if not n:return []
    cf=np.rint(c*10000).astype('i4');change=(np.diff(p)!=0)|(np.diff(s)!=0)|(np.diff(cf)!=0)|(np.diff(i)!=0);start=np.r_[0,np.flatnonzero(change)+1];end=np.r_[start[1:],n]
    return [[int(a),int(b-a),int(p[a]),int(s[a]),int(cf[a]),int(i[a])] for a,b in zip(start,end)]

def decode_runs(runs,n,valid_codes):
    p=np.zeros(n,'i4');s=np.zeros(n,'i4');c=np.zeros(n,'f4');i=np.zeros(n,'i4');cursor=0
    for r in runs:
        if len(r)!=6 or not all(isinstance(v,int) and not isinstance(v,bool) for v in r):raise ValueError('JSON 分段格式无效')
        start,count,part,status,cf,issue=r
        if start!=cursor or count<=0 or start+count>n or part not in valid_codes or status not in (0,AUTO,HUMAN) or not 0<=cf<=10000 or issue not in (0,1,2,3):raise ValueError('JSON 面段越界、标签或状态无效')
        if issue and part!=0:raise ValueError('存在待处理问题的面必须保持 UNKNOWN')
        p[start:start+count]=part;s[start:start+count]=status;c[start:start+count]=cf/10000;i[start:start+count]=issue;cursor+=count
    if cursor!=n:raise ValueError('JSON 没有完整覆盖所有源面')
    return p,s,c,i

def export_payload():
    m=validate();stat=summary(m);data={'schema':SCHEMA,'tool_version':'1.0.0','asset_id':m['asset_id'],'source_sha256':m['source_sha256'],'resource_signature_hash':hashlib.sha256(json.dumps(m['resources'],sort_keys=True).encode()).hexdigest(),'hierarchy':m.get('hierarchy',[]),'created_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'parts':m['parts'],'objects':[],'summary':stat,
       'status_meaning':{'0':'unassigned','1':'automatic_candidate','2':'human_confirmed'},
       'issue_meaning':{'0':'none','1':'boundary_crosses_face_or_candidate_threshold','2':'fused_geometry','3':'needs_local_rebuild_or_review'},
       'encoding':'runs=[start,count,part_code,status,confidence_times_10000,issue]',
       'formal_boundary_certified':False,'split_authorized':False,
       'annotation_complete':stat['unknown']==0 and stat['issues']==0 and stat['manual']==stat['faces'],
       'note':'Draft face ownership, not permission to split. Source-face indexes are valid only for the recorded mesh/UV/version signatures.'}
    for uid,o in objects(m).items():
        entry=m['objects'][uid];labels=read_labels(o.data)
        pp,ss,cc,ii=labels
        if not np.isin(pp,list(catalog(m))).all() or not np.isin(ss,[0,AUTO,HUMAN]).all() or not np.isfinite(cc).all() or np.any((cc<0)|(cc>1)) or not np.isin(ii,[0,1,2,3]).all() or np.any((ii!=0)&(pp!=0)):raise ValueError('面级标签或问题状态无效：'+o.name)
        data['objects'].append({'object_id':uid,'source_name':entry['source_name'],'current_name':o.name,'mesh_signature':entry['mesh'],'object_signature':entry['object'],'source_face_id_hash':digest(face_ids(o.data)),'face_count':len(o.data.polygons),'runs':encode_runs(labels)})
    data['issue_notes']=m.get('issue_notes',[])
    return data

def import_payload(data,replace_manual=False):
    m=validate()
    if data.get('schema')!=SCHEMA or data.get('asset_id')!=m['asset_id'] or data.get('source_sha256')!=m['source_sha256']:raise ValueError('JSON 来源 / 模型版本不匹配，未导入任何数据')
    if data.get('resource_signature_hash')!=hashlib.sha256(json.dumps(m['resources'],sort_keys=True).encode()).hexdigest():raise ValueError('JSON 材质 / 贴图资源版本不匹配')
    localparts=catalog(m);incoming={int(p['code']):p for p in data.get('parts',[])}
    if set(localparts)!=set(incoming) or any(localparts[k]['id']!=incoming[k]['id'] for k in localparts):raise ValueError('零件 ID 字典不匹配')
    obs=objects(m);rows=data.get('objects',[])
    if len(rows)!=len(obs) or {x['object_id'] for x in rows}!=set(obs):raise ValueError('JSON 对象集合不匹配')
    prepared=[]
    for row in rows:
        uid=row['object_id'];o=obs[uid]
        if row['mesh_signature']!=m['objects'][uid]['mesh'] or row['object_signature']!=m['objects'][uid]['object'] or row['face_count']!=len(o.data.polygons):raise ValueError('对象拓扑 / UV / 位置版本不匹配：'+o.name)
        if row['source_face_id_hash']!=digest(face_ids(o.data)):raise ValueError('源面 ID 已失效：'+o.name)
        prepared.append((o,decode_runs(row['runs'],row['face_count'],set(localparts))))
    # Validate every row before making any change; import is transactional.
    was_edit=bpy.context.mode=='EDIT_MESH'
    if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
    skipped=0
    try:
        for o,new in prepared:
            old=read_labels(o.data);protect=(old[1]==HUMAN) if not replace_manual else np.zeros(len(old[0]),bool)
            skipped+=int(protect.sum())
            for a,b in zip(new,old):a[protect]=b[protect]
            write_labels(o.data,new);recolor(o.data,m)
        # Keep older local issue notes and imported notes for traceability.
        notes=m.get('issue_notes',[])
        for note in data.get('issue_notes',[]):
            if note not in notes:notes.append(note)
        m['issue_notes']=notes;put_meta(m)
    finally:
        if was_edit:bpy.ops.object.mode_set(mode='EDIT')
    return skipped

class SGO_OT_create(bpy.types.Operator,ExportHelper):
    bl_idname='sgo.create_workcopy';bl_label='建立标注工作副本';bl_description='另存新的工作工程；不会覆盖 soul.blend';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):
        src=Path(bpy.data.filepath)
        if not bpy.data.filepath:return report_error(self,ValueError('请先打开原始 soul.blend。'))
        self.filepath=str(src.with_name(src.stem+'_SGO_V1_WORK.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            if META in context.scene:raise ValueError('当前已经是标注工作工程；请使用“保存工作工程”。')
            source=Path(bpy.data.filepath).resolve();dest=Path(self.filepath).expanduser().resolve()
            if not source.is_file():raise ValueError('请先打开源 .blend 工程')
            if dest==source or dest.name==source.name or dest.suffix.lower()!='.blend':raise ValueError('工作副本必须使用不同文件名，并以 .blend 结尾')
            if dest.exists():raise ValueError('该文件已存在；请选择新的工作文件名，避免覆盖')
            for o in context.scene.objects:
                if o.type=='MESH' and o.data.users>1:raise ValueError('发现共用 Mesh 的实例；V1 不自动复制或分离这些网格：'+o.name)
            if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
            srcsha=hashlib.sha256(source.read_bytes()).hexdigest();asset=str(uuid.uuid5(uuid.NAMESPACE_URL,'soulgrain:'+srcsha))
            # Switch the current file to a distinct copy before adding annotation data.
            bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            # Retain orphan material datablocks in the WORK copy without changing PBR nodes.
            for material in bpy.data.materials:
                if material.users==0:material.use_fake_user=True
            m={'schema':SCHEMA,'asset_id':asset,'source_path':str(source),'source_name':source.name,'source_sha256':srcsha,'objects':{},'parts':[],'resources':resource_signature(),'issue_notes':[]}
            for code,key,name,parent,color in BASE_PARTS:m['parts'].append({'code':code,'key':key,'name':name,'parent':parent,'color':list(color),'id':str(uuid.uuid5(uuid.UUID(asset),'part:'+key))})
            for o in sorted(context.scene.objects,key=lambda x:x.name):
                if o.type!='MESH':continue
                uid=str(uuid.uuid5(uuid.UUID(asset),'object:'+o.name));o['_sgo_object_id']=uid
                old=o.data.color_attributes.active_color.name if o.data.color_attributes.active_color else None
                m['objects'][uid]={'source_name':o.name,'mesh_name':o.data.name,'mesh':mesh_signature(o.data),'object':object_signature(o),'original_active_color':old}
                if o.name.startswith(('New_minus_eyelet_','Preserved_plus_eyelet_')):
                    code=1000+sum('source_object_id' in x for x in m['parts']);m['parts'].append({'code':code,'key':'CUFF_EYELET_'+o.name,'name':'独立翻筒孔圈 · '+o.name,'parent':'HARDWARE','color':[.055,.73,.12],'id':str(uuid.uuid5(uuid.UUID(asset),'existing-part:'+uid)),'source_object_id':uid})
                attrs(o.data);o.data.attributes[FID].data.foreach_set('value',np.arange(len(o.data.polygons),dtype='i4'))
            m['hierarchy']=[{'key':'SHOE','name':'单只鞋（左右脚待确认）','parent':None,'id':str(uuid.uuid5(uuid.UUID(asset),'group:SHOE'))},{'key':'HARDWARE','name':'五金件','parent':'SHOE','id':str(uuid.uuid5(uuid.UUID(asset),'group:HARDWARE'))}]
            ids={x['key']:x['id'] for x in m['parts']+m['hierarchy']}
            for x in m['parts']+m['hierarchy']:x['parent_id']=ids.get(x.get('parent'))
            put_meta(m);context.scene.sgo_target='0'
            biggest=max(objects(m).values(),key=lambda o:len(o.data.polygons));context.scene.sgo_object=biggest['_sgo_object_id'];context.view_layer.objects.active=biggest;biggest.select_set(True)
            for o in objects(m).values():recolor(o.data,m)
            preview(True);frame_view(context);validate(m);bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            context.scene.sgo_message='工作副本已创建。可运行自动候选，或直接选择面人工指定。'
            return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_auto(bpy.types.Operator):
    bl_idname='sgo.auto_candidates';bl_label='生成 / 更新自动候选';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        was_edit=context.mode=='EDIT_MESH'
        try:
            m=validate();
            if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
            obs=list(objects(m).values());context.window_manager.progress_begin(0,len(obs));kept=0
            try:
                for j,o in enumerate(obs):
                    old=read_labels(o.data);p,c,i,note=classify(o,m);s=np.full(len(p),AUTO,'i4');locked=old[1]==HUMAN;kept+=int(locked.sum())
                    new=[p,s,c,i]
                    for a,b in zip(new,old):a[locked]=b[locked]
                    write_labels(o.data,new);recolor(o.data,m);context.window_manager.progress_update(j+1)
            finally:context.window_manager.progress_end()
            preview(True);context.scene.sgo_message=f'候选已更新；保留 {kept:,} 个人工确认面。洋红色仍是 UNKNOWN。'
            context.scene['_sgo_stats']=json.dumps(summary(m));return {'FINISHED'}
        except Exception as e:return report_error(self,e)
        finally:
            if was_edit and context.object and context.object.mode=='OBJECT':bpy.ops.object.mode_set(mode='EDIT')

class SGO_OT_enter(bpy.types.Operator):
    bl_idname='sgo.enter_face_mode';bl_label='进入面选择';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:
            safe_work();active_mesh(context)
            if context.mode!='EDIT_MESH':
                bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='DESELECT')
            context.tool_settings.mesh_select_mode=(False,False,True);context.scene.sgo_message='现在可框选 B、套索或点选面，然后点击“指定所选面”。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_assign(bpy.types.Operator):
    bl_idname='sgo.assign_selected';bl_label='指定所选面';bl_options={'REGISTER','UNDO'}
    unknown:BoolProperty(default=False,options={'HIDDEN','SKIP_SAVE'})
    def execute(self,context):
        try:
            m=safe_work();active_mesh(context)
            if context.mode!='EDIT_MESH':raise ValueError('请先进入面选择模式，并选中要修正的面')
            # Mesh sync validates source geometry; face edits below remain native BMesh undo steps.
            validate(m,all_resources=False);code=0 if self.unknown else int(context.scene.sgo_target);row=catalog(m)[code];count=blocked=0
            for o in context.objects_in_mode_unique_data:
                if o.type!='MESH' or not o.get('_sgo_object_id'):continue
                bm=bmesh.from_edit_mesh(o.data);lp=bm.faces.layers.int.get(P);ls=bm.faces.layers.int.get(S);li=bm.faces.layers.int.get(I);lc=bm.faces.layers.float.get(C);col=bm.loops.layers.color.get(COLOR)
                for f in bm.faces:
                    if not f.select or f.hide:continue
                    if f[li] and code!=0:blocked+=1;continue
                    f[lp]=code;f[ls]=HUMAN;f[lc]=0.0 if code==0 else 1.0
                    for loop in f.loops:loop[col]=[*row['color'],1]
                    count+=1
                bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
            if not count and not blocked:raise ValueError('没有选中可见的网格面')
            context.scene.sgo_message=f'已人工指定 {count:,} 面；{blocked:,} 面仍有待处理标记，需先确认并解除。Ctrl/Command+Z 撤销。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_issue(bpy.types.Operator):
    bl_idname='sgo.mark_issue';bl_label='标记所选面待处理';bl_options={'REGISTER','UNDO'}
    clear:BoolProperty(default=False,options={'HIDDEN','SKIP_SAVE'})
    def execute(self,context):
        try:
            m=safe_work();active_mesh(context)
            if context.mode!='EDIT_MESH':raise ValueError('请先在面选择模式中选面')
            validate(m,all_resources=False);issue=0 if self.clear else int(context.scene.sgo_issue_type);count=0
            for o in context.objects_in_mode_unique_data:
                if o.type!='MESH' or not o.get('_sgo_object_id'):continue
                bm=bmesh.from_edit_mesh(o.data);lp=bm.faces.layers.int.get(P);ls=bm.faces.layers.int.get(S);li=bm.faces.layers.int.get(I);lc=bm.faces.layers.float.get(C);col=bm.loops.layers.color.get(COLOR)
                for f in bm.faces:
                    if not f.select or f.hide:continue
                    f[li]=issue;f[lp]=0;f[ls]=HUMAN;f[lc]=0
                    for l in f.loops:l[col]=(1,.015,.5,1)
                    count+=1
                bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
            if not count:raise ValueError('没有选中可见面')
            context.scene.sgo_message=f'{count:,} 面已'+('解除问题标记，仍为人工 UNKNOWN，可重新指定。' if self.clear else '标为待处理 UNKNOWN；不会执行切面或重建。');return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_select(bpy.types.Operator):
    bl_idname='sgo.select_label';bl_label='选择当前归属的面';bl_options={'REGISTER','UNDO'}
    isolate:BoolProperty(default=False,options={'HIDDEN'})
    def execute(self,context):
        try:
            m=safe_work();o=active_mesh(context)
            if context.mode!='EDIT_MESH':bpy.ops.object.mode_set(mode='EDIT')
            context.tool_settings.mesh_select_mode=(False,False,True);bm=bmesh.from_edit_mesh(o.data);lp=bm.faces.layers.int.get(P);code=int(context.scene.sgo_target);count=0
            # Native selection/hide changes only; no face is removed.
            if not any(f[lp]==code for f in bm.faces):raise ValueError('当前对象没有此归属的面；未隐藏模型')
            for f in bm.faces:
                match=f[lp]==code
                if self.isolate:f.hide_set(not match)
                elif match:f.hide_set(False)
                f.select_set(match)
                count+=int(match)
            if self.isolate:
                for other in objects(m).values():
                    if other!=o and other.mode!='EDIT':other.hide_set(True)
            bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False);context.scene.sgo_message=f'当前对象匹配 {count:,} 面。隔离仅作用于显示，点击“显示全部”恢复。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_show_all(bpy.types.Operator):
    bl_idname='sgo.show_all';bl_label='显示全部 / 取消隔离';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:
            m=safe_work()
            for o in objects(m).values():
                o.hide_set(False)
                if o.mode=='EDIT':
                    bm=bmesh.from_edit_mesh(o.data)
                    for f in bm.faces:f.hide_set(False)
                    bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
                else:
                    o.data.polygons.foreach_set('hide',np.zeros(len(o.data.polygons),bool));o.data.update()
            return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_preview(bpy.types.Operator):
    bl_idname='sgo.toggle_preview';bl_label='切换分区颜色 / 原始 PBR'
    def execute(self,context):
        try:preview(not context.scene.sgo_preview);return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_check(bpy.types.Operator):
    bl_idname='sgo.validate';bl_label='统计 / 检查版本与保护数据'
    def execute(self,context):
        try:
            m=validate();stat=summary(m);context.scene['_sgo_stats']=json.dumps(stat);context.scene.sgo_message=f'保护检查通过；{stat["unknown"]:,} UNKNOWN，{stat["manual"]:,} 人工面，{stat["issues"]:,} 待处理面。';self.report({'INFO'},context.scene.sgo_message);return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_save(bpy.types.Operator):
    bl_idname='sgo.save_work';bl_label='保存工作工程（含人工标注）'
    def execute(self,context):
        try:
            validate();was_edit=context.mode=='EDIT_MESH'
            if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,check_existing=False,relative_remap=False)
            if was_edit:bpy.ops.object.mode_set(mode='EDIT')
            context.scene.sgo_message='人工标注已保存在当前工作 .blend；原始工程未覆盖。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_export(bpy.types.Operator,ExportHelper):
    bl_idname='sgo.export_json';bl_label='导出语义草稿 JSON';filename_ext='.json'
    filter_glob:StringProperty(default='*.json',options={'HIDDEN'})
    def invoke(self,context,event):
        self.filepath=str(Path(bpy.data.filepath).with_suffix('.semantics.json'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            data=export_payload();dest=Path(self.filepath).expanduser().resolve()
            if dest.suffix.lower()!='.json':raise ValueError('请选择 .json 文件')
            if str(dest)==meta()['source_path']:raise ValueError('不能覆盖源工程')
            temp=dest.with_name(dest.name+'.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8');os.replace(temp,dest);context.scene.sgo_message='JSON 草稿已导出；UNKNOWN / 自动候选不会被认证为正式切割边界。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_import(bpy.types.Operator,ImportHelper):
    bl_idname='sgo.import_json';bl_label='载入语义 JSON';filename_ext='.json'
    filter_glob:StringProperty(default='*.json',options={'HIDDEN'})
    bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:
            data=json.loads(Path(self.filepath).read_text(encoding='utf-8'));skipped=import_payload(data,context.scene.sgo_replace_manual);context.scene.sgo_message=f'JSON 已载入；保护了 {skipped:,} 个已有人工面。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

def object_items(self,context):
    if not context or META not in context.scene:return [('none','请先创建工作副本','')]
    m=meta(context.scene);key=m['asset_id']
    if key not in _OBJECT_ENUM_CACHE:
        names={'Shoe_TEST_V3':'主体（鞋身 / 鞋底 / 翻筒）','DEBUG_LACES_VISIBILITY_ONLY':'鞋带调试组（不完整）','GEO_TONGUE_CONTINUOUS_FRONT_BACK':'已有鞋舌对象'}
        _OBJECT_ENUM_CACHE[key]=[(uid,names.get(row['source_name'],row['source_name']),row['source_name']) for uid,row in m['objects'].items()]
    return _OBJECT_ENUM_CACHE[key]

def frame_view(context):
    obs=objects();points=[o.matrix_world@Vector(p) for o in obs.values() for p in o.bound_box]
    lo=Vector(tuple(min(p[k] for p in points) for k in range(3)));hi=Vector(tuple(max(p[k] for p in points) for k in range(3)))
    for area in context.screen.areas if context.screen else []:
        if area.type=='VIEW_3D':
            region=area.spaces.active.region_3d;region.view_location=(lo+hi)/2;region.view_distance=max((hi-lo).length*1.25,.01);area.tag_redraw()

class SGO_OT_frame(bpy.types.Operator):
    bl_idname='sgo.frame';bl_label='框显整鞋'
    def execute(self,context):
        try:safe_work();frame_view(context);return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_OT_object_mode(bpy.types.Operator):
    bl_idname='sgo.object_mode';bl_label='返回对象选择';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
        return {'FINISHED'}

class SGO_OT_pick(bpy.types.Operator):
    bl_idname='sgo.pick_object';bl_label='选择编辑对象';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:
            m=safe_work();o=objects(m)[context.scene.sgo_object]
            if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);context.view_layer.objects.active=o;context.scene.sgo_message='已选择 '+o.name+'；下一步点击“进入面选择”。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO_PT_panel(bpy.types.Panel):
    bl_label='Soulgrain 语义标注 V1';bl_idname='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    def draw(self,context):
        l=self.layout;sc=context.scene
        if META not in sc:
            l.label(text='先打开 soul.blend，再建立工作副本。',icon='INFO');l.operator('wm.open_mainfile',text='打开原始 soul.blend',icon='FILE_FOLDER').use_scripts=False;l.operator('sgo.create_workcopy',icon='DUPLICATE');l.label(text='不会切割、删除或覆盖原工程。');return
        l.label(text='本阶段只标注，不正式拆分。',icon='LOCKED');l.operator('sgo.auto_candidates',icon='GEOMETRY_NODES');l.operator('sgo.toggle_preview',icon='MATERIAL')
        row=l.row(align=True);row.operator('sgo.frame',text='框显整鞋');row.operator('sgo.object_mode',text='返回对象选择')
        box=l.box();box.label(text='人工面级纠错（优先）');box.prop(sc,'sgo_object',text='编辑对象');box.operator('sgo.pick_object',text='选择此对象');box.operator('sgo.enter_face_mode',icon='FACESEL');box.prop(sc,'sgo_target',text='正确归属');op=box.operator('sgo.assign_selected',icon='CHECKMARK');op.unknown=False;box.operator('sgo_v21.assign_unknown',text='所选面设为 UNKNOWN');row=box.row(align=True);row.operator('ed.undo',text='撤销',icon='LOOP_BACK');row.operator('ed.redo',text='重做',icon='LOOP_FORWARDS')
        row=box.row(align=True);row.operator('sgo.select_label',text='选同类面');op=row.operator('sgo.select_label',text='仅看当前归属');op.isolate=True;box.operator('sgo.show_all',icon='HIDE_OFF')
        box=l.box();box.label(text='跨面 / 融合问题：只标记，不切割');box.prop(sc,'sgo_issue_type',text='问题');op=box.operator('sgo.mark_issue');op.clear=False;op=box.operator('sgo.mark_issue',text='确认后解除所选问题标记');op.clear=True
        box=l.box();box.label(text='持久化与检查');box.operator('sgo.validate',icon='CHECKMARK');box.operator('sgo.save_work',icon='FILE_TICK');box.operator('sgo.export_json',icon='EXPORT');box.operator('sgo.import_json',icon='IMPORT');box.prop(sc,'sgo_replace_manual',text='导入时替换已有人工标签')
        if sc.sgo_replace_manual:box.label(text='已开启覆盖人工标签；导入前请保存。',icon='ERROR')
        if '_sgo_stats' in sc:
            stat=json.loads(sc['_sgo_stats']);l.label(text=f'人工 {stat["manual"]:,} / 总面 {stat["faces"]:,}');l.label(text=f'UNKNOWN {stat["unknown"]:,}，问题 {stat["issues"]:,}')
        if sc.sgo_message:
            box=l.box()
            for line in sc.sgo_message.split('；'):box.label(text=line[:65])

CLASSES=[SGO_OT_frame,SGO_OT_object_mode,SGO_OT_pick,SGO_OT_create,SGO_OT_auto,SGO_OT_enter,SGO_OT_assign,SGO_OT_issue,SGO_OT_select,SGO_OT_show_all,SGO_OT_preview,SGO_OT_check,SGO_OT_save,SGO_OT_export,SGO_OT_import,SGO_PT_panel]
def register():
    for cls in CLASSES:
        identifier=(cls.bl_idname.split('.')[0].upper()+'_OT_'+cls.bl_idname.split('.')[1]) if '.' in cls.bl_idname else cls.bl_idname
        old=getattr(bpy.types,identifier,None)
        if old:
            try:bpy.utils.unregister_class(old)
            except RuntimeError:pass
        bpy.utils.register_class(cls)
    bpy.types.Scene.sgo_object=EnumProperty(name='编辑对象',items=object_items)
    bpy.types.Scene.sgo_target=EnumProperty(name='零件归属',items=part_items)
    bpy.types.Scene.sgo_issue_type=EnumProperty(name='待处理类型',items=[('1','分界穿过面 / 候选边界不明确','需人工判断是否需要将来切面'),('2','真实零件融合','未来局部修复边界'),('3','需要局部重建 / 复核','保留外观和原 UV，暂不施工')],default='1')
    bpy.types.Scene.sgo_preview=BoolProperty(default=False)
    bpy.types.Scene.sgo_replace_manual=BoolProperty(default=False)
    bpy.types.Scene.sgo_message=StringProperty(default='')

def unregister():
    for prop in ['sgo_object','sgo_target','sgo_issue_type','sgo_preview','sgo_replace_manual','sgo_message']:
        if hasattr(bpy.types.Scene,prop):delattr(bpy.types.Scene,prop)
    for cls in reversed(CLASSES):
        identifier=(cls.bl_idname.split('.')[0].upper()+'_OT_'+cls.bl_idname.split('.')[1]) if '.' in cls.bl_idname else cls.bl_idname
        old=getattr(bpy.types,identifier,None)
        if old:bpy.utils.unregister_class(old)
    _ENUM_CACHE.clear();_SPACE_STATE.clear()



# =================== V2: compatible extension of the V1 schema ===================
# Face attribute names, object IDs, metadata key and JSON schema above stay unchanged.
import math, heapq, zlib, struct, tempfile, collections
from bpy.props import IntProperty, FloatProperty, FloatVectorProperty, CollectionProperty
from bpy.app.handlers import persistent
V2_VIEW='_sgo_v2_view'
_V1_VALIDATE=validate
_V1_SAFE=safe_work
_V1_REGISTER=register
_V1_UNREGISTER=unregister
_V1_IMPORT=import_payload
_V1_EXPORT=export_payload
_V1_CREATE=SGO_OT_create.execute
_V1_SAVE=SGO_OT_save.execute
_BOOTSTRAP=False
_RUNTIME=None

class V2Runtime:
    def __init__(self):
        self.asset=None;self.m=None;self.entries={};self.hist={};self.tree={};self.rows=[]
        self.ready=False;self.error='';self.graph=None;self.pending=None;self.job=None
        self.revision=0;self.refresh_needed=False;self.refresh_scheduled=False
        self.timer_guard=False;self.icons=None;self.icon_cache={};self.icon_dir=None
        self.performance={};self.closed=False
    def clear_cache(self):
        self.entries.clear();self.hist.clear();self.graph=None;self.ready=False;self.revision+=1
    def shutdown(self):
        if self.job:self.job['engine'].cancel_requested=True
        if self.pending:
            try:cancel_pending()
            except Exception:pass
        if self.icons:
            try:
                from bpy.utils import previews
                previews.remove(self.icons)
            except Exception:pass
            self.icons=None
        self.closed=True


def rt():
    global _RUNTIME
    if _RUNTIME is None or _RUNTIME.closed:_RUNTIME=V2Runtime()
    return _RUNTIME

def safe_work():
    m=_V1_SAFE()
    if _BOOTSTRAP:return m
    v=m.get('v2')
    if not v:raise ValueError('这是 V1 工作工程。请先“另存 V2 工作副本并升级”，不会覆盖 V1。')
    p=Path(bpy.data.filepath).resolve()
    if str(p)==v.get('input_work_path') or p.name==v.get('input_work_name'):
        raise ValueError('不能在 V1 原工作文件中写入。请使用新的 V2 文件名。')
    v21=m.get('v21',{})
    if str(p)==v21.get('input_work_path') or p.name==v21.get('input_work_name'):
        raise ValueError('不能覆盖升级前的 V2 工作文件，请使用新的 V2.1 文件名。')
    return m

def view_state():
    raw=bpy.context.scene.get(V2_VIEW,'{}')
    try:v=json.loads(raw)
    except Exception:v={}
    for k,default in [('hidden',[]),('locked',[]),('collapsed',[]),('solo',None),('solo_hidden',[])]:v.setdefault(k,default)
    return v

def put_view(v):
    bpy.context.scene[V2_VIEW]=json.dumps(v,separators=(',',':'))

def subtree(key):
    node=rt().tree.get(key)
    if node is None:raise ValueError('零件树记录已失效，请刷新统计')
    return set(node['codes'])

def locked_codes():return set(view_state()['locked'])

def visible_codes():
    v=view_state();allcodes=set(catalog(rt().m or meta()))
    if v['solo'] and v['solo'] in rt().tree:return subtree(v['solo'])-set(v['solo_hidden'])
    return allcodes-set(v['hidden'])

def no_pending():
    if rt().job:raise ValueError('扩展正在计算，请先取消或等待完成')
    if rt().pending:raise ValueError('存在扩展预览；请先确认或取消，再进行此操作')

def invalidate():
    r=rt();r.clear_cache();r.refresh_needed=True

def _counts_from_entries():
    r=rt();h=collections.Counter()
    for e in r.entries.values():
        h.update(e['hist'])
    r.hist=dict(h)

def get_entry(o):
    r=rt();uid=o.get('_sgo_object_id');e=r.entries.get(uid)
    if e is not None and e['mesh_ptr']==o.data.as_pointer() and len(e['p'])==len(o.data.polygons):return e
    pp,ss,cc,ii=read_labels(o.data)
    e={'uid':uid,'object':o,'mesh_ptr':o.data.as_pointer(),'p':pp,'s':ss,'c':cc,'i':ii,'managed_hide':None,'indices':{},'visible_codes':None,'hist':dict(zip(*[x.tolist() for x in np.unique(pp,return_counts=True)]))}
    r.entries[uid]=e;return e

def entry_indices(e,codes):
    # A single vectorized pass on the relevant object; does not scan other objects.
    codes=tuple(sorted(codes));cached=e['indices'].get(codes)
    if cached is None:
        cached=np.flatnonzero(np.isin(e['p'],codes)).astype('i4');e['indices'][codes]=cached
    return cached

def _pretty_part(row):
    name=row['name'];key=row['key']
    if row.get('source_object_id'):
        raw=key.removeprefix('CUFF_EYELET_')
        if raw.startswith('Preserved_plus_eyelet_'):return '翻筒孔圈 A-'+raw.rsplit('_',1)[-1]
        if raw.startswith('New_minus_eyelet_'):return '翻筒孔圈 B-'+raw.rsplit('_',1)[-1]
    return name

def build_tree():
    r=rt();m=r.m;parts=catalog(m);nodes={}
    roots=m.get('hierarchy') or [dict(key='SHOE',name='整只鞋',parent=None,id=''),dict(key='HARDWARE',name='五金件',parent='SHOE',id='')]
    for x in roots:nodes[x['key']]={'key':x['key'],'name':x['name'],'parent':x.get('parent'),'code':None,'color':None,'id':x.get('id',''),'children':[]}
    group_names={'SHOE':'整只鞋','UPPER':'鞋身（含全部子类）','SOLING':'鞋底组件','CUFF':'翻筒','TONGUE':'鞋舌','DECORATION':'装饰','HEEL':'后跟鞋身'}
    for code,p in parts.items():
        parent=p.get('parent') or 'SHOE'
        if parent==p['key']:parent='SHOE'
        nodes[p['key']]={'key':p['key'],'name':_pretty_part(p),'parent':parent,'code':code,'color':p['color'],'id':p['id'],'children':[]}
    native=[p for p in parts.values() if p.get('source_object_id')]
    if native:
        nodes['V2_CUFF_EYELETS']={'key':'V2_CUFF_EYELETS','name':'独立翻筒孔圈','parent':'HARDWARE','code':None,'color':None,'id':'','children':[]}
        for p in native:nodes[p['key']]['parent']='V2_CUFF_EYELETS'
    for key,node in list(nodes.items()):
        parent=node['parent']
        if parent and parent not in nodes:node['parent']='SHOE'
    for key,node in list(nodes.items()):
        if node['parent']:nodes[node['parent']]['children'].append(key)
    # A category with children gets an explicit self leaf: hide-self and hide-subtree differ.
    for key,node in list(nodes.items()):
        if node['children'] and node['code'] is not None:
            selfkey=key+'::SELF';nodes[selfkey]={'key':selfkey,'name':node['name']+'（本类）','parent':key,'code':node['code'],'color':node['color'],'id':node['id'],'children':[]}
            node['children'].insert(0,selfkey);node['own_code']=node['code'];node['code']=None;node['name']=group_names.get(key,node['name'])
    for key,node in nodes.items():
        if key in group_names and node['children']:node['name']=group_names[key]
    def fill(key,path):
        if key in path:raise ValueError('分类层级出现循环：'+key)
        n=nodes[key];codes=set() if n['code'] is None else {n['code']}
        for child in n['children']:codes.update(fill(child,path|{key}))
        n['codes']=sorted(codes);n['count']=sum(r.hist.get(c,0) for c in codes);return codes
    fill('SHOE',set());r.tree=nodes

def rebuild_rows():
    r=rt()
    if not r.m or not r.tree:return
    sc=bpy.context.scene;search=sc.sgo_v2_search.strip().casefold();v=view_state();collapsed=set(v['collapsed']);wanted=set()
    if search:
        for key,n in r.tree.items():
            if search in (n['name']+' '+key+' '+n['id']).casefold():
                q=key
                while q and q not in wanted:wanted.add(q);q=r.tree[q]['parent']
    rows=[]
    def walk(key,depth):
        n=r.tree[key]
        if search and key not in wanted:return
        rows.append((key,depth))
        if search or key not in collapsed:
            for child in n['children']:walk(child,depth+1)
    walk('SHOE',0);sc.sgo_v2_rows.clear();vis=visible_codes();locked=locked_codes()
    for key,depth in rows:
        n=r.tree[key];row=sc.sgo_v2_rows.add();row.key=key;row.label=n['name'];row.depth=depth;row.face_count=n['count'];row.is_group=bool(n['children']);row.expanded=key not in collapsed;row.code=n['code'] if n['code'] is not None else -1
        activecodes={c for c in n['codes'] if r.hist.get(c,0)>0} or set(n['codes']);row.visible=bool(activecodes&vis);row.mixed=bool(activecodes&vis) and not activecodes<=vis;row.locked=set(n['codes'])<=locked;row.partial_lock=bool(set(n['codes'])&locked) and not row.locked
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':area.tag_redraw()

def ensure_session(refresh=False):
    m=safe_work();r=rt()
    if r.asset!=m['asset_id']:
        r.clear_cache();r.asset=m['asset_id'];r.m=m
    if refresh or not r.ready:
        sync_edit();r.entries.clear();r.m=m
        for o in objects(m).values():get_entry(o)
        _counts_from_entries();build_tree();r.ready=True;r.refresh_needed=False;rebuild_rows()
    return r

def mark_cache_changed(o,indices=None,values=None):
    r=rt();e=r.entries.get(o['_sgo_object_id'])
    if e is not None and indices is not None and values is not None:
        oldv,oldc=np.unique(e['p'][indices],return_counts=True);newv,newc=np.unique(values[0],return_counts=True)
        for code,n in zip(oldv,oldc):e['hist'][int(code)]=e['hist'].get(int(code),0)-int(n)
        for code,n in zip(newv,newc):e['hist'][int(code)]=e['hist'].get(int(code),0)+int(n)
        for k,a in zip(['p','s','c','i'],values):e[k][indices]=a
        e['indices'].clear();e['visible_codes']=None
    else:r.entries.pop(o['_sgo_object_id'],None);get_entry(o)
    r.revision+=1;_counts_from_entries();build_tree();rebuild_rows()

def quick_guard(o):
    m=safe_work();baseline=m['objects'].get(o.get('_sgo_object_id'))
    if not baseline:raise ValueError('当前对象不在源版本中')
    if o.mode=='EDIT':o.update_from_editmode()
    me=o.data;b=baseline['mesh']
    if (len(me.vertices),len(me.edges),len(me.polygons))!=(b['vertices'],b['edges'],b['faces']):raise ValueError('拓扑数量变化，停止标注')
    for name,typ in [(P,'INT'),(S,'INT'),(C,'FLOAT'),(I,'INT'),(FID,'INT')]:
        a=me.attributes.get(name)
        if not a or a.domain!='FACE' or a.data_type!=typ:raise ValueError('面级属性失效：'+name)
    for field,collection,prop,width in [('position',me.vertices,'co',3),('edges_hash',me.edges,'vertices',2),('loops',me.loops,'vertex_index',1),('material_index',me.polygons,'material_index',1)]:
        if digest(array(collection,prop,width,'f4' if field=='position' else 'i4'))!=b[field]:raise ValueError('几何或材质面索引改变，请先撤销相关编辑')
    if object_signature(o)!=baseline['object']:raise ValueError('对象变换、父级或材质绑定改变')
    return m

def selected_ids(o):
    if o.mode=='EDIT':
        bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();return np.fromiter((f.index for f in bm.faces if f.select and not f.hide),dtype='i4')
    mask=array(o.data.polygons,'select',dtype='bool')&~array(o.data.polygons,'hide',dtype='bool');return np.flatnonzero(mask).astype('i4')

def hidden_array(o):
    if o.mode=='EDIT':return np.fromiter((f.hide for f in bmesh.from_edit_mesh(o.data).faces),dtype='bool',count=len(o.data.polygons))
    return array(o.data.polygons,'hide',dtype='bool')

def ensure_edit_for_visibility():
    m=safe_work();obs=list(objects(m).values());editing={o['_sgo_object_id'] for o in obs if o.mode=='EDIT'}
    if len(editing)==len(obs):return
    active=bpy.context.view_layer.objects.active
    if active not in obs:active=max(obs,key=lambda o:len(o.data.polygons))
    if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs:o.hide_set(False);o.select_set(True)
    bpy.context.view_layer.objects.active=active;bpy.ops.object.mode_set(mode='EDIT');bpy.context.tool_settings.mesh_select_mode=(False,False,True)
    for o in obs:
        if o['_sgo_object_id'] not in editing:
            bm=bmesh.from_edit_mesh(o.data)
            for f in bm.faces:f.select_set(False)
            bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)

def apply_visibility(force_all=False):
    r=ensure_session();t=time.perf_counter();vis=visible_codes()
    filtering=bool(view_state()['hidden'] or view_state()['solo']) and not force_all
    if filtering:ensure_edit_for_visibility()
    for uid,e in r.entries.items():
        o=e['object'];n=len(e['p'])
        last=e.get('visible_codes');changed_codes=(vis^last) if last is not None else set(e['hist'])
        if not force_all and last is not None and not any(e['hist'].get(c,0) for c in changed_codes):continue
        managed=np.zeros(n,bool) if force_all else ~np.isin(e['p'],list(vis));current=hidden_array(o)
        old=e['managed_hide']
        if old is None:old=managed.copy() if filtering else np.zeros(n,bool)
        desired=managed
        changed=np.flatnonzero(current!=desired)
        if o.mode=='EDIT':
            bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table()
            for i in changed:bm.faces[int(i)].hide_set(bool(desired[i]))
            if len(changed):bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)
        elif len(changed):o.data.polygons.foreach_set('hide',desired);o.data.update()
        o.hide_set(bool(desired.all()) if o.mode!='EDIT' else False);e['managed_hide']=managed;e['visible_codes']=vis.copy()
    rebuild_rows();r.performance['last_visibility_seconds']=time.perf_counter()-t


def _search_update(self,context):
    if rt().ready:rebuild_rows()

def _mode_guard():
    r=rt()
    if r.closed:return None
    try:
        if META not in bpy.context.scene or not meta().get('v2'):return .4
        if r.pending:
            refresh_preview_selection()
        if r.refresh_needed and not r.job and not r.pending:
            ensure_session(refresh=True);apply_visibility()
        if r.ready and not r.job and not r.timer_guard and (view_state()['hidden'] or view_state()['solo']):
            if not any(a.type=='FILE_BROWSER' for w in bpy.context.window_manager.windows for a in w.screen.areas):
                obs=list(objects(r.m).values())
                if any(o.mode!='EDIT' for o in obs):
                    r.timer_guard=True
                    try:ensure_edit_for_visibility();apply_visibility()
                    finally:r.timer_guard=False
    except Exception as e:
        bpy.context.scene.sgo_message=str(e)
    return .4

@persistent
def _v2_history_handler(*args):
    r=rt()
    bpy.context.scene.pop('_sgo_v2_inspection',None)
    if r.pending:
        # Selection undo must remain editable. RNA object pointers may be replaced:
        # rebind by UUID and revalidate on the next poll/confirmation, never write labels here.
        r.pending['context_dirty']=True
        r.pending['review_signature']=None
    if r.job:r.job['engine'].cancel_requested=True
    r.clear_cache();r.refresh_needed=True

@persistent
def _v2_load_handler(*args):
    global _RUNTIME
    if _RUNTIME:_RUNTIME.shutdown()
    _RUNTIME=V2Runtime();_RUNTIME.refresh_needed=True

# ---------- Edge-adjacency graph and bounded, cancellable seed growth ----------
class FaceGraph:
    def __init__(self):pass
    @classmethod
    def from_mesh(cls,o,exact_seams=True):
        t=time.perf_counter();quick_guard(o);me=o.data;n=len(me.polygons)
        if n>2_000_000:raise ValueError('单对象超过 200 万面；V2 停止建图，避免超出安全范围')
        g=cls();g.uid=o['_sgo_object_id'];g.n=n;g.exact_seams=exact_seams
        p=array(me.vertices,'co',3,'f4');g.diagonal=float(np.linalg.norm(np.ptp(p,axis=0)))
        g.centers=array(me.polygons,'center',3,'f4');g.normals=array(me.polygons,'normal',3,'f4');g.mat=array(me.polygons,'material_index')
        normal_lengths=np.linalg.norm(g.normals,axis=1);g.valid_normals=normal_lengths>.5
        g.normals/=np.maximum(normal_lengths[:,None],1e-12)
        lv=array(me.loops,'vertex_index');starts=array(me.polygons,'loop_start');totals=array(me.polygons,'loop_total')
        nxt=np.arange(len(lv),dtype='i4')+1;nxt[starts+totals-1]=starts
        if exact_seams:_,group=np.unique(p,axis=0,return_inverse=True)
        else:group=np.arange(len(p),dtype='i4')
        a=group[lv].astype('uint64');b=group[lv[nxt]].astype('uint64');keys=(np.minimum(a,b)<<np.uint64(32))|np.maximum(a,b)
        order=np.argsort(keys,kind='stable');sortedkeys=keys[order];beg=np.r_[0,np.flatnonzero(sortedkeys[1:]!=sortedkeys[:-1])+1];end=np.r_[beg[1:],len(order)];cnt=end-beg
        poly=np.repeat(np.arange(n,dtype='i4'),totals);pair=beg[cnt==2];i1=order[pair];i2=order[pair+1];fa=poly[i1];fb=poly[i2]
        good=(fa!=fb)&(a[i1]!=b[i1]);fa=fa[good];fb=fb[good];i1=i1[good];i2=i2[good]
        rawmin1=np.minimum(lv[i1],lv[nxt[i1]]);rawmin2=np.minimum(lv[i2],lv[nxt[i2]]);rawmax1=np.maximum(lv[i1],lv[nxt[i1]]);rawmax2=np.maximum(lv[i2],lv[nxt[i2]])
        bridges=(rawmin1!=rawmin2)|(rawmax1!=rawmax2)
        row=np.concatenate([fa,fb]);col=np.concatenate([fb,fa]);ix=np.argsort(row,kind='stable');counts=np.bincount(row,minlength=n)
        g.offset=np.r_[0,np.cumsum(counts,dtype='i8')];g.neighbors=col[ix].astype('i4');rr=row[ix]
        g.dot=np.einsum('ij,ij->i',g.normals[rr],g.normals[g.neighbors]).astype('f4')
        g.length=np.linalg.norm(g.centers[rr]-g.centers[g.neighbors],axis=1).astype('f4')
        g.info={'faces':n,'adjacentUndirectedEdges':len(fa),'exactCoincidentSeamBridges':int(bridges.sum()),'blockedNonmanifoldEdgeGroups':int((cnt>2).sum()),'isolatedFaces':int((counts==0).sum()),'buildSeconds':time.perf_counter()-t,'diagonalModelUnits':g.diagonal,'policy':'Only shared full edges; optional exact endpoint coincidences. No nearest-neighbor jump, no geometry weld.'}
        g.info['retainedArrayBytes']=sum(x.nbytes for x in [g.centers,g.normals,g.mat,g.valid_normals,g.offset,g.neighbors,g.dot,g.length])
        return g

class GrowStepper:
    """Pure array engine; preview never writes face ownership."""
    def __init__(self,graph,seeds,p,s,issues,target,locked,visible,allowed_semantics,params):
        self.g=graph;self.params=dict(params);self.seeds=np.unique(np.asarray(seeds,dtype='i4'));self.target=int(target)
        if not len(self.seeds):raise ValueError('先选一个面或少量种子面')
        if len(self.seeds)>params['max_faces']:raise ValueError('种子面数超过安全上限，请减少种子')
        self.cancel_requested=False;self.done=False;self.cancelled=False;self.reason='';self.start=time.perf_counter();self.heap=[];self.result=[];self.popped=0
        self.eligible=graph.valid_normals.copy()&visible&(issues==0)&~np.isin(p,list(locked))
        self.eligible&=~((s==HUMAN)&(p!=target))
        if target in locked:raise ValueError('目标零件已锁定，请先解锁')
        if not self.eligible[self.seeds].all():raise ValueError('种子包含隐藏、锁定、未解决问题或人工确认的其他零件；请先手动修正种子')
        if params['respect_semantics']:
            semantic_ok=np.isin(p,[0]+list(allowed_semantics));semantic_ok[self.seeds]=True;self.eligible&=semantic_ok
        # A global normal envelope prevents slow normal drift over smooth fused surfaces.
        seedn=graph.normals[self.seeds];rounded=np.round(seedn*25).astype('i4');_,ind=np.unique(rounded,axis=0,return_index=True);seedn=seedn[ind]
        if len(seedn)>32:seedn=seedn[np.linspace(0,len(seedn)-1,32,dtype='i4')]
        normal_ok=np.zeros(graph.n,bool);cos_global=math.cos(math.radians(params['seed_angle']))
        for first in range(0,graph.n,32768):
            last=min(first+32768,graph.n);normal_ok[first:last]=np.max(graph.normals[first:last]@seedn.T,axis=1)>=cos_global
        normal_ok[self.seeds]=True;self.eligible&=normal_ok
        self.dist=np.full(graph.n,np.inf,'f4');self.closed=np.zeros(graph.n,bool)
        for f in self.seeds:self.dist[f]=0;heapq.heappush(self.heap,(0.,int(f)))
        self.radius=graph.diagonal*params['radius_percent']/100.;self.cos_step=math.cos(math.radians(params['angle']))
        self.stops=collections.Counter();self.started=time.perf_counter()
    def step(self,seconds=.015):
        if self.done:return
        if self.cancel_requested:self.done=True;self.cancelled=True;self.reason='用户取消';return
        deadline=time.perf_counter()+seconds;g=self.g
        while self.heap and time.perf_counter()<deadline:
            if self.cancel_requested:self.done=True;self.cancelled=True;self.reason='用户取消';return
            if time.perf_counter()-self.started>self.params['max_seconds']:
                self.done=True;self.reason='达到时间上限（局部候选）';break
            distance,u=heapq.heappop(self.heap)
            if self.closed[u]:continue
            self.closed[u]=True;self.popped+=1
            if distance>self.radius:self.stops['distance']+=1;continue
            self.result.append(u)
            if len(self.result)>=self.params['max_faces']:
                self.done=True;self.reason='达到面数上限（局部候选）';break
            for j in range(int(g.offset[u]),int(g.offset[u+1])):
                v=int(g.neighbors[j])
                if self.closed[v]:continue
                if not self.eligible[v]:self.stops['protected_or_semantic_or_normal']+=1;continue
                if g.dot[j]<self.cos_step:self.stops['local_normal_angle']+=1;continue
                if not self.params['cross_material'] and g.mat[u]!=g.mat[v]:self.stops['material_boundary']+=1;continue
                nd=distance+max(float(g.length[j]),1e-9)
                if nd>self.radius:self.stops['distance']+=1;continue
                if nd<float(self.dist[v]):self.dist[v]=nd;heapq.heappush(self.heap,(nd,v))
        if not self.heap and not self.done:self.done=True;self.reason='前沿停止：可达范围或保护边界'
    def finish(self):
        while not self.done:self.step(.04)
        return np.asarray(self.result,dtype='i4')
    def stats(self):return {'candidateFaces':len(self.result),'processedFaces':self.popped,'seconds':time.perf_counter()-self.start,'stopReason':self.reason,'barrierCounts':dict(self.stops),'cancelled':self.cancelled}


def grow_params(sc=None):
    sc=sc or bpy.context.scene
    return {'angle':float(sc.sgo_v2_angle),'seed_angle':float(sc.sgo_v2_seed_angle),'radius_percent':float(sc.sgo_v2_radius),'max_faces':int(sc.sgo_v2_max_faces),'max_seconds':float(sc.sgo_v2_max_seconds),'cross_material':bool(sc.sgo_v2_cross_material),'respect_semantics':bool(sc.sgo_v2_respect_semantics),'exact_seams':bool(sc.sgo_v2_exact_seams)}

def growth_allowed_codes(code):
    m=rt().m;parts=catalog(m);row=parts[code];key=row['key'];allowed=set()
    if key in rt().tree:allowed|=subtree(key)
    else:allowed.add(code)
    parent=row.get('parent');bykey={p['key']:p for p in parts.values()}
    while parent and parent in bykey:
        allowed.add(int(bykey[parent]['code']));parent=bykey[parent].get('parent')
    return allowed

def label_revision(e):
    h=hashlib.sha256()
    for k in ['p','s','c','i']:h.update(e[k].tobytes())
    return h.hexdigest()

def set_selected_ids(o,indices):
    if o.mode!='EDIT':raise ValueError('请保持面编辑模式')
    bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();wanted=np.zeros(len(bm.faces),bool);wanted[indices]=True
    for f in bm.faces:
        val=bool(wanted[f.index]) and not f.hide
        if f.select!=val:f.select_set(val)
    bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False)

class EditableCandidateSet:
    """Immutable C plus mutable S. R=C∩S, X=C−S, A=S−C; indices belong to one fixed mesh revision."""
    def __init__(self,face_count,original):
        self.face_count=int(face_count);self.original=np.unique(np.asarray(original,dtype='i4'))
        if len(self.original) and (self.original[0]<0 or self.original[-1]>=face_count):raise ValueError('原始候选面索引越界')
        self.original.flags.writeable=False
        self.original_mask=np.zeros(face_count,bool);self.original_mask[self.original]=True;self.original_mask.flags.writeable=False
        self.update(self.original)
    def update(self,selected):
        selected=np.unique(np.asarray(selected,dtype='i4'))
        if len(selected) and (selected[0]<0 or selected[-1]>=self.face_count):raise ValueError('选区已不属于本次固定网格版本')
        mask=np.zeros(self.face_count,bool);mask[selected]=True
        self.final=selected;inside=self.original_mask[selected]
        self.retained=selected[inside];self.added=selected[~inside];self.excluded=self.original[~mask[self.original]]
        self.signature=digest(selected)
        return self
    def counts(self):
        return {'original':len(self.original),'retained':len(self.retained),'excluded':len(self.excluded),'added':len(self.added),'final':len(self.final)}

def capture_preview_context():
    records={}
    for o in bpy.context.objects_in_mode_unique_data:
        if o.type!='MESH':continue
        uid=o.get('_sgo_object_id')
        if not uid:raise ValueError('请先退出其他非鞋模网格的编辑模式，再开始本次预览')
        records[uid]={'selected':selected_ids(o).copy(),'hidden':hidden_array(o).copy(),'faces':len(o.data.polygons)}
    return {'objects':records,'active':bpy.context.active_object.get('_sgo_object_id'),'select_mode':tuple(bpy.context.tool_settings.mesh_select_mode)}

def restore_preview_context(p):
    failures=[];obs=objects(meta());snap=p['selection_before']
    for uid,rec in snap['objects'].items():
        o=obs.get(uid)
        if o is None or len(o.data.polygons)!=rec['faces']:
            failures.append(uid);continue
        try:
            _repair_require_identity(o)
            if o.mode=='EDIT':
                bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();hide=rec['hidden']
                for f in bm.faces:
                    if f.hide!=bool(hide[f.index]):f.hide_set(bool(hide[f.index]))
                set_selected_ids(o,rec['selected'])
            else:
                wanted=np.zeros(rec['faces'],bool);wanted[rec['selected']]=True
                o.data.polygons.foreach_set('hide',rec['hidden']);o.data.polygons.foreach_set('select',wanted);o.data.update()
        except (ValueError,ReferenceError,RuntimeError):failures.append(o.name)
    if snap['active'] in obs:bpy.context.view_layer.objects.active=obs[snap['active']]
    bpy.context.tool_settings.mesh_select_mode=snap['select_mode']
    return failures

def _set_added_review(value):
    r=rt();r.review_ui_guard=True
    try:bpy.context.scene.sgo_v21_accept_added=value
    finally:r.review_ui_guard=False

def final_selection_protection(o,indices,target):
    # Read live BMesh data, not the cached classifier arrays. Never silently skip protected faces.
    bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();lp=bm.faces.layers.int.get(P);ls=bm.faces.layers.int.get(S);li=bm.faces.layers.int.get(I)
    if any(x is None for x in [lp,ls,li]):raise ValueError('保护属性缺失，停止确认')
    locked=locked_codes();blocked={'locked':0,'issue':0,'manual_other':0,'hidden':0,'target_locked':int(target in locked)}
    bad=[]
    for i in indices:
        f=bm.faces[int(i)];why=False
        if f[lp] in locked:blocked['locked']+=1;why=True
        if f[li]!=0:blocked['issue']+=1;why=True
        if f[ls]==HUMAN and f[lp]!=target:blocked['manual_other']+=1;why=True
        if f.hide:blocked['hidden']+=1;why=True
        if why:bad.append(int(i))
    return blocked,np.asarray(bad,'i4')

def foreign_selected_objects(o):
    # O(number of edit objects) when no foreign selections; Blender exposes live BMesh counts.
    result=[]
    for other in bpy.context.objects_in_mode_unique_data:
        if other.type=='MESH' and other!=o:
            count=int(other.data.total_face_sel)
            if count:result.append({'object':other.name,'faces':count})
    return result

def refresh_preview_selection(force=False):
    r=rt();p=r.pending
    if not p:return None
    if not force and time.perf_counter()<p.get('next_poll',0):return p.get('edit_stats')
    started=time.perf_counter()
    try:
        ensure_session(refresh=r.refresh_needed);o=objects(r.m).get(p['uid'])
        if o is None or o.mode!='EDIT':raise ValueError('请保持原预览对象的面编辑模式')
        if tuple(bpy.context.tool_settings.mesh_select_mode)!=(False,False,True):raise ValueError('请切回面选择模式，再继续修剪')
        if len(bmesh.from_edit_mesh(o.data).faces)!=p['candidate_set'].face_count:raise ValueError('面数改变，不能继续此预览；请撤销几何操作')
        p['object']=o;state=p['candidate_set'];previous=state.signature;state.update(selected_ids(o))
        dirty=p.get('context_dirty',False)
        if dirty and label_revision(get_entry(o))!=p['revision']:raise ValueError('预览期间归属数据改变，请取消后重新预览；未写入本次归属')
        p.pop('context_dirty',None)
        if state.signature!=previous or dirty:
            p['review_signature']=None;_set_added_review(False)
        blocked,bad=final_selection_protection(o,state.final,p['target']);foreign=foreign_selected_objects(o)
        stats={**state.counts(),'blocked':blocked,'blocked_faces':len(bad),'foreign':foreign,'updated_utc':time.strftime('%H:%M:%S',time.gmtime())}
        stats['valid']=not bad.size and not blocked['target_locked'] and not foreign and 0<len(state.final)<=200000
        p['edit_stats']=stats;p['selection_error']='';p['blocked_indices']=bad
    except (ValueError,ReferenceError,RuntimeError) as e:
        p['selection_error']=str(e);p['review_signature']=None;_set_added_review(False)
    elapsed=time.perf_counter()-started;p['poll_seconds']=elapsed
    # Only a pending proposal is polled. Adapt to keep the million-face scan duty cycle bounded.
    p['next_poll']=time.perf_counter()+max(.35,min(2.,elapsed*4.))
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':area.tag_redraw()
    return p.get('edit_stats')

def _added_review_changed(self,context):
    if getattr(rt(),'review_ui_guard',False):return
    p=rt().pending
    if not p:return
    requested=self.sgo_v21_accept_added
    refresh_preview_selection(force=True)
    if requested and not p.get('selection_error') and p.get('edit_stats',{}).get('valid') and len(p['candidate_set'].added):
        p['review_signature']=p['candidate_set'].signature;_set_added_review(True)
    else:p['review_signature']=None;_set_added_review(False)

def cancel_pending(restore=True):
    r=rt();p=r.pending
    if not p:return
    r.pending=None
    failures=[]
    if restore:
        try:failures=restore_preview_context(p)
        except (ReferenceError,ValueError,RuntimeError):failures=['选择上下文失效']
    _set_added_review(False)
    bpy.context.scene.sgo_v2_grow_message='扩展预览已取消；恢复预览前选择，面级归属没有改变。' if not failures else '已取消且未改归属；部分选择无法安全恢复，请撤销几何/对象编辑。'

def make_growth_job():
    r=ensure_session();no_pending();o=explicit_mesh(bpy.context)
    if o.mode!='EDIT':raise ValueError('请先进入面选择模式，并选择少量种子面')
    if tuple(bpy.context.tool_settings.mesh_select_mode)!=(False,False,True):raise ValueError('请先进入面选择模式')
    quick_guard(o);seeds=selected_ids(o)
    if not len(seeds):raise ValueError('当前编辑对象没有选中种子面；请先选择正确的编辑对象')
    # Fetch the active object's actual attributes once, to exclude stale external edits.
    r.entries.pop(o['_sgo_object_id'],None);e=get_entry(o);_counts_from_entries();build_tree();rebuild_rows()
    selection_before=capture_preview_context();params=grow_params();code=int(bpy.context.scene.sgo_target)
    if code==0:raise ValueError('智能扩展需要具体目标分类；UNKNOWN 请使用手动指定')
    if r.graph is None or r.graph.uid!=e['uid'] or r.graph.exact_seams!=params['exact_seams']:
        r.graph=FaceGraph.from_mesh(o,params['exact_seams'])
    engine=GrowStepper(r.graph,seeds,e['p'],e['s'],e['i'],code,locked_codes(),~hidden_array(o),growth_allowed_codes(code),params)
    return {'engine':engine,'object':o,'object_name':o.name,'uid':e['uid'],'selection_before':selection_before,'seed_selection':seeds.copy(),'target':code,'params':params,'revision':label_revision(e),'graph_info':dict(r.graph.info),'started':time.perf_counter()}

def publish_growth_preview(job):
    r=rt();engine=job['engine']
    if engine.cancelled:
        restore_preview_context(job)
        bpy.context.scene.sgo_v2_grow_message='计算已取消，没有归属写入。';return
    indices=np.asarray(engine.result,dtype='i4')
    if not len(indices):raise ValueError('没有可扩展候选；检查保护边界、角度和距离设置')
    state=EditableCandidateSet(len(job['object'].data.polygons),indices)
    job['indices']=state.original;job['candidate_set']=state;job['review_signature']=None;r.pending=job
    for uid in job['selection_before']['objects']:
        o=objects()[uid];set_selected_ids(o,indices if uid==job['uid'] else np.empty(0,'i4'))
    _set_added_review(False);refresh_preview_selection(force=True)
    r.performance['last_growth']={**engine.stats(),'graph':job['graph_info']}
    bpy.context.scene.sgo_v2_grow_message=f'原始候选 {len(indices):,} 面；可框选/套索减选、补选并反复调整，不必重算。橙色为最终待确认选择，尚未改归属。'

def _growth_setting_changed(self,context):
    r=rt()
    if r.job:r.job['engine'].cancel_requested=True
    if r.pending:cancel_pending()

def _preset_changed(self,context):
    values={'CAUTIOUS':(12,30,8,20000),'STANDARD':(20,45,15,50000),'WIDE':(30,60,25,100000)}
    a,b,c,d=values[self.sgo_v2_preset];self.sgo_v2_angle=a;self.sgo_v2_seed_angle=b;self.sgo_v2_radius=c;self.sgo_v2_max_faces=d

# ---------- Safe migration and V1-compatible write operations ----------
def _annotation_hashes(m):
    sync_edit();result={}
    for uid,o in objects(m).items():
        result[uid]={'labels':[digest(a) for a in read_labels(o.data)],'face_ids':digest(face_ids(o.data))}
    return result

def _init_v2_metadata(input_path=None,input_sha=None):
    m=meta();m['v2']={'version':'2.0.0','input_work_path':str(input_path) if input_path else None,'input_work_name':Path(input_path).name if input_path else None,'input_sha256':input_sha,'migrated_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    m['v21']={'version':'2.1.1','input_work_path':None,'input_work_name':None}
    put_meta(m);put_view({'hidden':[],'locked':[],'collapsed':[],'solo':None,'solo_hidden':[]});rt().clear_cache();rt().m=m
    # Rebuild only the derived preview colors, including V1 byte colors written in Edit Mode.
    # Face ownership, confidence, source IDs, UV and PBR resources remain unchanged.
    for o in objects(m).values():recolor(o.data,m)
    ensure_session(refresh=True)
    return m

class SGO2_OT_upgrade(bpy.types.Operator,ExportHelper):
    bl_idname='sgo_v2.upgrade_work';bl_label='另存 V2 工作副本并升级';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):
        p=Path(bpy.data.filepath);stem=p.stem.replace('_V1','_V2')
        if stem==p.stem:stem+='_V2'
        self.filepath=str(p.with_name(stem+'.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            m=_V1_SAFE();no_pending();_V1_VALIDATE(m);src=Path(bpy.data.filepath).resolve();dest=Path(self.filepath).expanduser().resolve()
            if src==dest or src.name==dest.name or dest.name==m['source_name'] or dest.suffix.lower()!='.blend':raise ValueError('请为 V2 选择不同的新文件名，不得覆盖 V1 或 soul.blend')
            if dest.exists():raise ValueError('目标文件已存在；请选择新的 V2 文件名')
            before=_annotation_hashes(m);disksha=hashlib.sha256(src.read_bytes()).hexdigest();was_edit=context.mode=='EDIT_MESH'
            if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            m=_init_v2_metadata(src,disksha)
            if before!=_annotation_hashes(m):raise ValueError('升级后标注哈希不一致，停止继续操作；原 V1 未写入')
            _V1_VALIDATE(m);bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            if hashlib.sha256(src.read_bytes()).hexdigest()!=disksha:raise ValueError('V1 输入文件发生外部变化，请检查')
            context.scene.sgo_message='V2 副本已建立；V1 标签、ID、人工状态和问题记录逐项一致。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

def _create_v2_invoke(self,context,event):
    if not bpy.data.filepath:return report_error(self,ValueError('先打开 soul.blend，或打开已有 V1 工作工程'))
    p=Path(bpy.data.filepath);self.filepath=str(p.with_name(p.stem+'_SGO_V2_WORK.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}

def _create_v2_execute(self,context):
    global _BOOTSTRAP
    try:
        _BOOTSTRAP=True;result=_V1_CREATE(self,context)
        if result=={'FINISHED'}:
            _init_v2_metadata();bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,check_existing=False,relative_remap=False)
        return result
    finally:_BOOTSTRAP=False


def _bm_preview_color(rgb):
    # BYTE_COLOR BMesh layers expose sRGB bytes; Mesh.color exposes scene-linear values.
    # Convert once before writing, so manual/automatic colors and the legend agree.
    return [12.92*v if v<=.0031308 else 1.055*(v**(1/2.4))-.055 for v in rgb]+[1.]

def _face_payload(o,indices):
    bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table()
    layers=[bm.faces.layers.float.get(n) if n==C else bm.faces.layers.int.get(n) for n in [P,S,C,I,FID]];col=bm.loops.layers.color.get(COLOR)
    if any(x is None for x in layers) or col is None:raise ValueError('真实面属性或预览层缺失，未写入')
    values=[np.fromiter((bm.faces[int(i)][layer] for i in indices),dtype='f4' if n==C else 'i4') for n,layer in zip([P,S,C,I,FID],layers)]
    counts=np.fromiter((len(bm.faces[int(i)].loops) for i in indices),'i4')
    colors=np.fromiter((v for i in indices for loop in bm.faces[int(i)].loops for v in loop[col]),'f4').reshape(-1,4)
    return {'values':values[:4],'fids':values[4],'loop_counts':counts,'colors':colors}

def _write_face_payload(o,indices,values,colors):
    bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();layers=[bm.faces.layers.float.get(n) if n==C else bm.faces.layers.int.get(n) for n in [P,S,C,I]];col=bm.loops.layers.color.get(COLOR);offset=0
    for j,i in enumerate(indices):
        f=bm.faces[int(i)]
        for layer,value in zip(layers,values):f[layer]=float(value[j]) if layer==layers[2] else int(value[j])
        for loop in f.loops:loop[col]=colors[offset];offset+=1
    bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False);o.update_from_editmode()

def _verify_face_payload(o,indices,expected,fids,colors,exact_color=False):
    # Independent read-back from actual BMesh layers, never the runtime cache.
    actual=_face_payload(o,indices)
    if not np.array_equal(actual['fids'],fids):raise ValueError('源面 ID 回读不一致')
    for name,x,y in zip([P,S,C,I],actual['values'],expected):
        bad=np.flatnonzero(x!=y)
        if len(bad):raise ValueError(name+' 回读失败；源面 ID '+str(int(fids[int(bad[0])]))+'，实际 '+str(x[int(bad[0])])+'，期望 '+str(y[int(bad[0])]))
    if not (np.array_equal(actual['colors'],colors) if exact_color else np.allclose(actual['colors'],colors,atol=1/255+1e-7,rtol=0)):
        raise ValueError('真实角点预览颜色回读失败')
    return actual

def _manual_transaction(context,code,operation,issue_value=None):
    context.scene['_sgo_v21_last_assignment']=json.dumps({'state':'VALIDATING','operation':operation,'target_code':code})
    m=safe_work();no_pending();ensure_session();o=explicit_mesh(context)
    context.scene.pop('_sgo_v2_inspection',None)
    if context.mode!='EDIT_MESH' or o.mode!='EDIT' or tuple(context.tool_settings.mesh_select_mode)!=(False,False,True):raise ValueError('请在明确的编辑对象上进入面选择模式')
    quick_guard(o);ix=selected_ids(o)
    if not len(ix):raise ValueError('指定的编辑对象 '+o.name+' 没有选中可见面；其他对象的选区不会代替它')
    before=_face_payload(o,ix);locked=locked_codes()
    if code in locked or np.isin(before['values'][0],list(locked)).any():raise ValueError('本次选区/目标包含锁定分类；整次未写入')
    if issue_value is None and code!=0 and (before['values'][3]!=0).any():raise ValueError('本次选区包含未解决问题面；整次未写入，请先处理问题')
    _repair_require_selection_identity(o,ix,before['fids'])
    ignored=foreign_selected_objects(o);n=len(ix);row=catalog(m)[code]
    record={'state':'PREPARED','operation':operation,'object_id':o['_sgo_object_id'],'object_name':o.name,'source_face_ids':before['fids'].tolist(),'target_code':code,'target_part_id':row['id'],'target_name':row['name'],'faces':n,'ignored_other_objects':ignored,'utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
    expected=[np.full(n,code,'i4'),np.full(n,HUMAN,'i4'),np.full(n,0 if code==0 else 1,'f4'),before['values'][3].copy() if issue_value is None else np.full(n,issue_value,'i4')]
    target_colors=np.tile(np.asarray(_bm_preview_color(row['color']),'f4'),(int(before['loop_counts'].sum()),1));changed=False
    try:
        context.scene['_sgo_v21_last_assignment']=json.dumps(record,ensure_ascii=False)
        # Refresh the target's real baseline before incremental statistics; don't trust stale cache.
        rt().entries.pop(o['_sgo_object_id'],None);get_entry(o);_counts_from_entries()
        changed=True;_write_face_payload(o,ix,expected,target_colors)
        actual=_verify_face_payload(o,ix,expected,before['fids'],target_colors)
        mark_cache_changed(o,ix,actual['values']);apply_visibility()
        actual=_verify_face_payload(o,ix,expected,before['fids'],target_colors)
        context.scene['_sgo_v2_inspection']=json.dumps(_inspection_report(o,ix,'WRITE_VERIFY'),ensure_ascii=False)
        record.update(state='VERIFIED',readback_hashes=[digest(v) for v in actual['values']],source_face_id_hash=digest(actual['fids']))
        context.scene['_sgo_v21_last_assignment']=json.dumps(record,ensure_ascii=False)
        hidden=int(hidden_array(o)[ix].sum());ignored_count=sum(x['faces'] for x in ignored)
        context.scene.sgo_message=f'真实回读验证成功：{o.name} · {n:,} 面 → {row["name"]}（{code}）；其他对象 {ignored_count:,} 个残留选中面未处理。'
        if hidden:context.scene.sgo_message+=f'；其中 {hidden:,} 面被当前分类过滤隐藏，标签已验证。'
        return {'FINISHED'}
    except Exception as error:
        record.update(state='REJECTED',error=str(error))
        if changed:
            try:
                # Restore through a separate implementation so a failing writer cannot suppress rollback.
                bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();layers=[bm.faces.layers.float.get(z) if z==C else bm.faces.layers.int.get(z) for z in [P,S,C,I]];col=bm.loops.layers.color.get(COLOR);offset=0
                for j,i in enumerate(ix):
                    f=bm.faces[int(i)]
                    for k,layer in enumerate(layers):f[layer]=float(before['values'][k][j]) if k==2 else int(before['values'][k][j])
                    for loop in f.loops:loop[col]=before['colors'][offset];offset+=1
                bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False);o.update_from_editmode()
                # Direct exact comparison remains available even when the commit verifier is faulty.
                restored=_face_payload(o,ix)
                if not all(np.array_equal(x,y) for x,y in zip(restored['values'],before['values'])) or not np.array_equal(restored['colors'],before['colors']) or not np.array_equal(restored['fids'],before['fids']):raise ValueError('回滚真实数据比对失败')
                invalidate();ensure_session(refresh=True);apply_visibility();set_selected_ids(o,ix);record['state']='ROLLED_BACK'
            except Exception as rollback_error:
                record.update(state='ROLLBACK_FAILED',rollback_error=str(rollback_error))
        context.scene.pop('_sgo_v2_inspection',None);context.scene['_sgo_v21_last_assignment']=json.dumps(record,ensure_ascii=False)
        raise ValueError('写入失败，'+('已回读确认完整回滚' if record['state']=='ROLLED_BACK' else '未显示成功，请重新打开最后有效副本' if changed else '未写入')+'：'+str(error))

def _manual_execute(self,context):
    try:return _manual_transaction(context,0 if self.unknown else int(context.scene.sgo_target),'ASSIGN_UNKNOWN' if self.unknown else 'ASSIGN_LABEL')
    except Exception as e:return _manual_failure(self,context,e)

def _manual_failure(op,context,error):
    record=json.loads(context.scene.get('_sgo_v21_last_assignment','{}'))
    if record.get('state') not in {'ROLLED_BACK','ROLLBACK_FAILED'}:record['state']='REJECTED'
    record['error']=str(error);context.scene['_sgo_v21_last_assignment']=json.dumps(record,ensure_ascii=False)
    context.scene.pop('_sgo_v2_inspection',None);context.scene.sgo_message='本次未成功写入：'+str(error)
    return report_error(op,error)

def _issue_execute(self,context):
    try:return _manual_transaction(context,0,'CLEAR_ISSUE' if self.clear else 'MARK_ISSUE',0 if self.clear else int(context.scene.sgo_issue_type))
    except Exception as e:return _manual_failure(self,context,e)


def _auto_execute(self,context):
    was_edit=context.mode=='EDIT_MESH'
    try:
        no_pending();m=_V1_VALIDATE();ensure_session();locked=locked_codes()
        if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
        preserved=0;obs=list(objects(m).values());context.window_manager.progress_begin(0,len(obs))
        try:
            for j,o in enumerate(obs):
                old=read_labels(o.data);pp,cc,ii,note=classify(o,m);new=[pp,np.full(len(pp),AUTO,'i4'),cc,ii];protect=(old[1]==HUMAN)|np.isin(old[0],list(locked));preserved+=int(protect.sum())
                for a,b in zip(new,old):a[protect]=b[protect]
                write_labels(o.data,new);recolor(o.data,m);context.window_manager.progress_update(j+1)
        finally:context.window_manager.progress_end()
        invalidate();ensure_session(refresh=True);preview(True)
        if was_edit or view_state()['hidden'] or view_state()['solo']:ensure_edit_for_visibility()
        apply_visibility();context.scene.sgo_message=f'自动候选更新；人工/锁定保护 {preserved:,} 面。';return {'FINISHED'}
    except Exception as e:return report_error(self,e)
    finally:
        if was_edit and context.object and context.object.mode=='OBJECT':bpy.ops.object.mode_set(mode='EDIT')


def export_payload():
    no_pending();data=_V1_EXPORT();data['tool_version']='2.1.1';data['v2_ui_state']=view_state();data['formal_boundary_certified']=False;data['split_authorized']=False;return data

def import_payload(data,replace_manual=False):
    no_pending();ensure_session()
    if locked_codes():raise ValueError('当前有锁定分类。为防止文件覆盖锁定零件，请先解除锁定再导入；人工保护仍默认开启。')
    result=_V1_IMPORT(data,replace_manual);invalidate();ensure_session(refresh=True);apply_visibility();return result

def _save_execute(self,context):
    try:
        no_pending();m=safe_work()
        if not m.get('v21'):raise ValueError('请先“另存 V2.1 工作副本”，保留当前 V2 工程；不会覆盖旧文件。')
        return _V1_SAVE(self,context)
    except Exception as e:return report_error(self,e)


def _check_execute(self,context):
    try:
        no_pending();_V1_VALIDATE();r=ensure_session(refresh=True);apply_visibility();context.scene.sgo_message=f'版本保护检查通过；统计已刷新，共 {sum(r.hist.values()):,} 面。';return {'FINISHED'}
    except Exception as e:return report_error(self,e)


def _show_execute(self,context):
    try:
        no_pending();ensure_session();v=view_state();v.update(hidden=[],solo=None,solo_hidden=[]);put_view(v);apply_visibility(force_all=True);context.scene.sgo_message='已恢复所有分类显示；锁定设置保持不变。';return {'FINISHED'}
    except Exception as e:return report_error(self,e)


def _object_execute(self,context):
    try:
        no_pending();_show_execute(self,context)
        if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
        return {'FINISHED'}
    except Exception as e:return report_error(self,e)


def _pick_execute(self,context):
    try:
        no_pending();r=ensure_session();o=objects(r.m)[context.scene.sgo_object]
        if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);context.view_layer.objects.active=o
        if view_state()['hidden'] or view_state()['solo']:ensure_edit_for_visibility();apply_visibility()
        context.scene.pop('_sgo_v2_inspection',None);context.scene.sgo_message='当前编辑对象：'+o.name;return {'FINISHED'}
    except Exception as e:return report_error(self,e)


class SGO2_OT_refresh(bpy.types.Operator):
    bl_idname='sgo_v2.refresh';bl_label='刷新实际零件统计';bl_description='读取真实面级标签，更新缓存、树、颜色图例和数量'
    def execute(self,context):
        try:
            no_pending();_V1_VALIDATE(all_resources=False);ensure_session(refresh=True);apply_visibility();context.scene.sgo_message='统计来自当前面级属性；已刷新。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_tree_fold(bpy.types.Operator):
    bl_idname='sgo_v2.tree_fold';bl_label='展开 / 折叠子分类'
    key:StringProperty()
    def execute(self,context):
        try:
            ensure_session();v=view_state();s=set(v['collapsed']);s.symmetric_difference_update({self.key});v['collapsed']=sorted(s);put_view(v);rebuild_rows();return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_focus(bpy.types.Operator):
    bl_idname='sgo_v2.focus_part';bl_label='设为当前标注目标';bl_description='只选择分类，不改任何面级归属'
    key:StringProperty()
    def execute(self,context):
        try:
            ensure_session();n=rt().tree[self.key];code=n.get('code') if n.get('code') is not None else n.get('own_code')
            if code is not None:context.scene.sgo_target=str(code)
            context.scene.sgo_message='当前分类：'+n['name']+'；未重分配网格面。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_view(bpy.types.Operator):
    bl_idname='sgo_v2.view_part';bl_label='分类可见性';bl_description='眼睛切换本行范围；父行包含子分类，子行“本类”只影响单个标签'
    key:StringProperty();action:EnumProperty(items=[('TOGGLE','显示/隐藏',''),('SOLO','单独查看',''),('CLEAR_SOLO','退出单独查看','')])
    def execute(self,context):
        try:
            no_pending();ensure_session();v=view_state()
            if self.action=='CLEAR_SOLO':v['solo']=None;v['solo_hidden']=[]
            elif self.action=='SOLO':
                if v['solo']==self.key:v['solo']=None;v['solo_hidden']=[]
                else:v['solo']=self.key;v['solo_hidden']=[]
            else:
                codes=subtree(self.key)
                if v['solo']:
                    if not codes&subtree(v['solo']):raise ValueError('当前为单独查看模式。请退出单独查看，或点击本行的单独查看按钮切换。')
                    field='solo_hidden'
                else:field='hidden'
                hidden=set(v[field])
                if codes<=hidden:hidden-=codes
                else:hidden|=codes
                v[field]=sorted(hidden)
            put_view(v);apply_visibility();return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_lock(bpy.types.Operator):
    bl_idname='sgo_v2.lock_part';bl_label='锁定 / 解锁分类';bl_description='锁定只阻止误标注，不隐藏、不改变归属；父行作用于所有子分类'
    key:StringProperty();clear_all:BoolProperty(default=False)
    def execute(self,context):
        try:
            no_pending();ensure_session();v=view_state();locked=set(v['locked'])
            if self.clear_all:locked.clear()
            else:
                codes=subtree(self.key)
                if codes<=locked:locked-=codes
                else:locked|=codes
            v['locked']=sorted(locked);put_view(v);rebuild_rows();return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_select(bpy.types.Operator):
    bl_idname='sgo_v2.select_part';bl_label='选中本分类的可见面';bl_description='父行包括子分类。只选择，不写标签；隐藏的面不会被悄悄选中'
    key:StringProperty();active_only:BoolProperty(default=False)
    def execute(self,context):
        try:
            no_pending();r=ensure_session();codes=subtree(self.key);vis=visible_codes();codes&=vis
            if not codes:raise ValueError('该分类当前被隐藏。请先显示或单独查看')
            matches=[]
            for e in r.entries.values():
                if self.active_only and e['object']!=context.active_object:continue
                ix=entry_indices(e,codes)
                if len(ix):matches.append((e['object'],ix))
            if not matches:raise ValueError('没有已分配到该分类的面')
            if view_state()['hidden'] or view_state()['solo']:ensure_edit_for_visibility()
            elif any(o.mode!='EDIT' for o,ix in matches):
                if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
                bpy.ops.object.select_all(action='DESELECT')
                for o,ix in matches:o.hide_set(False);o.select_set(True)
                context.view_layer.objects.active=max(matches,key=lambda x:len(x[1]))[0];bpy.ops.object.mode_set(mode='EDIT');context.tool_settings.mesh_select_mode=(False,False,True)
            context.view_layer.objects.active=max(matches,key=lambda x:len(x[1]))[0]
            context.scene.sgo_object=context.view_layer.objects.active['_sgo_object_id']
            matching={o['_sgo_object_id']:ix for o,ix in matches}
            for o in context.objects_in_mode_unique_data:
                if o.type=='MESH' and o.get('_sgo_object_id'):set_selected_ids(o,matching.get(o['_sgo_object_id'],np.empty(0,'i4')))
            n=r.tree[self.key];code=n.get('code') if n.get('code') is not None else n.get('own_code')
            if code is not None:context.scene.sgo_target=str(code)
            context.scene.sgo_message=f'已选中 {sum(len(ix) for o,ix in matches):,} 个可见匹配面；归属未改变。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)


def _select_v1_execute(self,context):
    try:
        ensure_session();code=int(context.scene.sgo_target);key=catalog(rt().m)[code]['key'];selfkey=key+'::SELF'
        if selfkey in rt().tree:key=selfkey
        if self.isolate:return bpy.ops.sgo_v2.view_part(key=key,action='SOLO')
        return bpy.ops.sgo_v2.select_part(key=key,active_only=True)
    except Exception as e:return report_error(self,e)

# ---------- Inspection and reviewed growth commit ----------
def _inspection_report(o,ix,origin='SELECTION'):
    if o.mode=='EDIT':
        bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();keys=[P,S,C,I,FID];layers=[bm.faces.layers.float.get(k) if k==C else bm.faces.layers.int.get(k) for k in keys]
        values=np.asarray([[bm.faces[int(i)][layer] for layer in layers] for i in ix],dtype='f8');hidden=sum(bm.faces[int(i)].hide for i in ix)
    else:
        pp,ss,cc,ii=read_labels(o.data);values=np.column_stack([pp[ix],ss[ix],cc[ix],ii[ix],face_ids(o.data)[ix]]);hidden=int(array(o.data.polygons,'hide',dtype='bool')[ix].sum())
    codes,counts=np.unique(values[:,0].astype('i4'),return_counts=True);states,stcounts=np.unique(values[:,1].astype('i4'),return_counts=True)
    detail=None
    if len(ix)==1:detail={'object':o.name,'object_id':o['_sgo_object_id'],'face_index':int(ix[0]),'source_face_id':int(values[0,4]),'code':int(values[0,0]),'status':int(values[0,1]),'confidence':float(values[0,2]),'issue':int(values[0,3])}
    return {'objects':[{'object':o.name,'object_id':o['_sgo_object_id'],'faces':len(ix)}],'faces':len(ix),'parts':dict(zip(codes.tolist(),counts.tolist())),'states':dict(zip(states.tolist(),stcounts.tolist())),'issues':int((values[:,3]!=0).sum()),'mean_confidence':float(values[:,2].mean()),'detail':detail,'origin':origin,'hidden':int(hidden),'updated_utc':time.strftime('%H:%M:%S',time.gmtime())}

class SGO21_OT_use_active(bpy.types.Operator):
    bl_idname='sgo_v21.use_active';bl_label='采用当前活动对象为编辑对象'
    def execute(self,context):
        try:
            no_pending();o=active_mesh(context)
            if o.get('_sgo_object_id') not in objects():raise ValueError('不属于当前受保护工程')
            context.scene.sgo_object=o['_sgo_object_id'];context.scene.pop('_sgo_v2_inspection',None);context.scene.sgo_message='已明确编辑对象：'+o.name+'；未改标签。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO21_OT_assign_unknown(bpy.types.Operator):
    bl_idname='sgo_v21.assign_unknown';bl_label='所选面改为 UNKNOWN';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:return _manual_transaction(context,0,'ASSIGN_UNKNOWN')
        except Exception as e:return _manual_failure(self,context,e)

class SGO2_OT_inspect(bpy.types.Operator):
    bl_idname='sgo_v2.inspect_selected';bl_label='检查选中面（含多面统计）';bl_description='扫描当前选择一次；显示真实对象、零件 ID、人工状态、置信度及问题，不持续遍历整只鞋'
    def execute(self,context):
        try:
            ensure_session();o=explicit_mesh(context);ix=selected_ids(o)
            if not len(ix):raise ValueError('明确的编辑对象没有选中可见面')
            context.scene['_sgo_v2_inspection']=json.dumps(_inspection_report(o,ix),ensure_ascii=False);context.scene.sgo_message=f'已检查 {o.name} 的 {len(ix):,} 个实际选中面；修改选择后请再次检查。';return {'FINISHED'}
        except Exception as e:context.scene.pop('_sgo_v2_inspection',None);return report_error(self,e)

class SGO2_OT_growth_preview(bpy.types.Operator):
    bl_idname='sgo_v2.grow_preview';bl_label='智能扩展预览';bl_description='只生成并高亮候选，不写入标签；可取消。确认后才记为人工标签'
    _timer=None;_job=None
    def execute(self,context):
        try:
            if rt().pending:cancel_pending()
            self._job=make_growth_job();rt().job=self._job
            if bpy.app.background:
                self._job['engine'].finish();rt().job=None;publish_growth_preview(self._job);return {'FINISHED'}
            self._timer=context.window_manager.event_timer_add(.04,window=context.window);context.window_manager.modal_handler_add(self);context.scene.sgo_v2_grow_message='正在扩展；可旋转观察，按 Esc 或点取消中止。';return {'RUNNING_MODAL'}
        except Exception as e:rt().job=None;return report_error(self,e)
    def modal(self,context,event):
        try:
            if event.type=='ESC':self._job['engine'].cancel_requested=True
            if event.type=='TIMER' or self._job['engine'].cancel_requested:
                engine=self._job['engine'];engine.step(.012);context.scene.sgo_v2_grow_message=f'计算候选 {len(engine.result):,} 面；归属尚未写入。'
                for area in context.screen.areas:
                    if area.type=='VIEW_3D':area.tag_redraw()
                if engine.done:
                    if self._timer:context.window_manager.event_timer_remove(self._timer);self._timer=None
                    rt().job=None;publish_growth_preview(self._job);return {'CANCELLED'} if engine.cancelled else {'FINISHED'}
            if event.type in {'G','S','R','E','X','DEL'}:return {'RUNNING_MODAL'}
            return {'PASS_THROUGH'}
        except Exception as e:
            if self._timer:context.window_manager.event_timer_remove(self._timer);self._timer=None
            rt().job=None;return report_error(self,e)
    def cancel(self,context):
        if self._job:self._job['engine'].cancel_requested=True
        if self._timer:context.window_manager.event_timer_remove(self._timer);self._timer=None
        rt().job=None

class SGO2_OT_growth_cancel(bpy.types.Operator):
    bl_idname='sgo_v2.grow_cancel';bl_label='取消计算 / 取消预览';bl_description='不写入任何面级归属；取消预览时恢复种子选择'
    def execute(self,context):
        if rt().job:rt().job['engine'].cancel_requested=True;context.scene.sgo_v2_grow_message='已请求取消，等待当前小步结束。'
        else:cancel_pending()
        return {'FINISHED'}

class SGO21_OT_refresh_selection(bpy.types.Operator):
    bl_idname='sgo_v21.refresh_selection';bl_label='立即刷新修剪统计';bl_description='读取当前原生面选择，不重新运行扩展，不写入任何归属'
    def execute(self,context):
        if not rt().pending:return report_error(self,ValueError('请先生成扩展预览'))
        refresh_preview_selection(force=True);return {'FINISHED'}

class SGO21_OT_save_copy(bpy.types.Operator,ExportHelper):
    bl_idname='sgo_v21.save_copy';bl_label='另存 V2.1 工作副本（保留当前文件）';filename_ext='.blend'
    filter_glob:StringProperty(default='*.blend',options={'HIDDEN'})
    def invoke(self,context,event):
        src=Path(bpy.data.filepath);stem=src.stem.replace('_V2','_V2_1')
        if stem==src.stem:stem+='_V2_1'
        self.filepath=str(src.with_name(stem+'.blend'));context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
    def execute(self,context):
        try:
            no_pending();m=_V1_VALIDATE();src=Path(bpy.data.filepath).resolve();dest=Path(self.filepath).expanduser().resolve()
            if src==dest or src.name==dest.name or dest.suffix.lower()!='.blend' or dest.name==m['source_name']:raise ValueError('必须使用不同的新 .blend 文件名')
            if dest.exists():raise ValueError('目标文件已存在，不会覆盖；请使用新文件名')
            before=_annotation_hashes(m);disksha=hashlib.sha256(src.read_bytes()).hexdigest();was_edit=context.mode=='EDIT_MESH'
            if was_edit:bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            # No schema/attribute migration and no preview recolor: copy existing data verbatim.
            m['v21']={'version':'2.1.1','input_work_path':str(src),'input_work_name':src.name,'input_sha256':disksha}
            put_meta(m);invalidate();ensure_session(refresh=True)
            if before!=_annotation_hashes(m):raise ValueError('副本标签不一致，停止使用；输入工程未写入')
            _V1_VALIDATE(m);bpy.ops.wm.save_as_mainfile(filepath=str(dest),check_existing=False,relative_remap=False)
            if hashlib.sha256(src.read_bytes()).hexdigest()!=disksha:raise ValueError('输入工程发生外部变化，请检查')
            if was_edit or view_state()['hidden'] or view_state()['solo']:ensure_edit_for_visibility();apply_visibility()
            context.scene.sgo_message='V2.1 副本已另存；旧工程、现有标签、UUID 和配置均保留。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

class SGO2_OT_growth_confirm(bpy.types.Operator):
    bl_idname='sgo_v2.grow_confirm';bl_label='确认扩展并写入人工标注';bl_options={'REGISTER','UNDO'}
    def execute(self,context):
        try:
            r=ensure_session();p=r.pending
            if not p:raise ValueError('没有已完成的扩展预览')
            if p['params']!=grow_params() or p['target']!=int(context.scene.sgo_target):raise ValueError('参数或目标改变，请重新预览')
            refresh_preview_selection(force=True)
            if p.get('selection_error'):raise ValueError(p['selection_error'])
            state=p['candidate_set'];ix=state.final.copy();stats=p['edit_stats'];o=p['object']
            if stats['foreign']:raise ValueError('选中了其他对象的面；本次预览只提交原对象，请先取消其他对象的选择')
            if not len(ix):raise ValueError('最终选区为空；没有写入，请保留部分面或取消预览')
            if len(ix)>200000:raise ValueError('最终选区超过 20 万面安全上限，请分批标注')
            if stats['blocked_faces'] or stats['blocked']['target_locked']:raise ValueError('最终选区含锁定、待处理或其他零件人工标签；整次拒绝写入，请排除保护面')
            if len(state.added) and (p.get('review_signature')!=state.signature or not context.scene.sgo_v21_accept_added):raise ValueError('存在原始候选以外的人工补选；请检查提示并勾选“已检查本次补选”后确认')
            _V1_VALIDATE();r.entries.pop(p['uid'],None);e=get_entry(o)
            if label_revision(e)!=p['revision']:raise ValueError('预览之后面级数据发生变化，请重新预览')
            if not np.array_equal(selected_ids(o),ix) or foreign_selected_objects(o):raise ValueError('校验期间选区改变，未写入；请重新检查选区')
            code=p['target'];blocked,bad=final_selection_protection(o,ix,code)
            if bad.size or blocked['target_locked']:raise ValueError('当前保护边界已改变；整次拒绝写入')
            bm=bmesh.from_edit_mesh(o.data);bm.faces.ensure_lookup_table();lp=bm.faces.layers.int.get(P);ls=bm.faces.layers.int.get(S);lc=bm.faces.layers.float.get(C);li=bm.faces.layers.int.get(I);col=bm.loops.layers.color.get(COLOR);color=_bm_preview_color(catalog(r.m)[code]['color'])
            for i in ix:
                f=bm.faces[int(i)];f[lp]=code;f[ls]=HUMAN;f[lc]=1.;f[li]=0
                for loop in f.loops:loop[col]=color
            retained=len(state.retained);added=len(state.added);excluded=len(state.excluded)
            bmesh.update_edit_mesh(o.data,loop_triangles=False,destructive=False);r.pending=None;_set_added_review(False)
            mark_cache_changed(o,ix,[np.full(len(ix),code,'i4'),np.full(len(ix),HUMAN,'i4'),np.ones(len(ix),'f4'),np.zeros(len(ix),'i4')]);apply_visibility();context.scene['_sgo_v2_inspection']=json.dumps(_inspection_report(o,ix,'GROWTH_VERIFY'),ensure_ascii=False);context.scene.sgo_v2_grow_message=f'已确认 {len(ix):,} 面（保留 {retained:,}，补充 {added:,}）；排除的 {excluded:,} 面及其他面保持原标签和颜色。';return {'FINISHED'}
        except Exception as e:return report_error(self,e)

# ---------- Actual-config color icons (never edits PBR materials) ----------
def _png_chunk(tag,body):return struct.pack('>I',len(body))+tag+body+struct.pack('>I',zlib.crc32(tag+body)&0xffffffff)
def palette_png(color):
    def srgb(v):return 12.92*v if v<=.0031308 else 1.055*(v**(1/2.4))-.055
    rgb=bytes(max(0,min(255,round(srgb(float(c))*255))) for c in color);row=b'\x00'+(rgb+b'\xff')*24;raw=row*24
    return b'\x89PNG\r\n\x1a\n'+_png_chunk(b'IHDR',struct.pack('>IIBBBBB',24,24,8,6,0,0,0))+_png_chunk(b'IDAT',zlib.compress(raw))+_png_chunk(b'IEND',b'')

def color_icon(color):
    if color is None or bpy.app.background:return 0
    r=rt();key=tuple(float(x) for x in color)
    if key in r.icon_cache:return r.icon_cache[key]
    from bpy.utils import previews
    if r.icons is None:r.icons=previews.new();r.icon_dir=Path(tempfile.mkdtemp(prefix='soulgrain-v2-palette-'))
    name=hashlib.sha256(repr(key).encode()).hexdigest()[:16];path=r.icon_dir/(name+'.png');path.write_bytes(palette_png(key));r.icons.load(name,str(path),'IMAGE');r.icon_cache[key]=r.icons[name].icon_id;return r.icon_cache[key]

class SGO2_TreeRow(bpy.types.PropertyGroup):
    key:StringProperty();label:StringProperty();depth:IntProperty();face_count:IntProperty();code:IntProperty(default=-1)
    is_group:BoolProperty();expanded:BoolProperty();visible:BoolProperty();mixed:BoolProperty();locked:BoolProperty();partial_lock:BoolProperty()

class SGO2_UL_tree(bpy.types.UIList):
    bl_idname='SGO2_UL_tree'
    def draw_item(self,context,layout,data,item,icon,active_data,active_propname,index):
        row=layout.row(align=True)
        if item.depth:row.separator(factor=.55*min(item.depth,4))
        if item.is_group:op=row.operator('sgo_v2.tree_fold',text='',icon='TRIA_DOWN' if item.expanded else 'TRIA_RIGHT',emboss=False);op.key=item.key
        else:row.label(text='',icon='BLANK1')
        n=rt().tree.get(item.key,{})
        if item.code>=0:row.label(text='',icon_value=color_icon(catalog(rt().m)[item.code]['color']))
        else:
            colors=[]
            for c in n.get('codes',[]):
                col=catalog(rt().m)[c]['color']
                if col not in colors:colors.append(col)
                if len(colors)==2:break
            for col in colors:row.label(text='',icon_value=color_icon(col))
        op=row.operator('sgo_v2.focus_part',text=item.label,emboss=False);op.key=item.key
        row.label(text=f'{item.face_count:,}')
        sub=row.row(align=True);solo=view_state()['solo'];inside=not solo or bool(set(n.get('codes',[]))&subtree(solo));sub.enabled=inside
        op=sub.operator('sgo_v2.view_part',text='半' if item.mixed else '',icon='HIDE_OFF' if item.visible else 'HIDE_ON',emboss=False);op.key=item.key;op.action='TOGGLE'
        op=row.operator('sgo_v2.view_part',text='',icon='SOLO_ON' if solo==item.key else 'SOLO_OFF',emboss=False);op.key=item.key;op.action='SOLO'
        op=row.operator('sgo_v2.select_part',text='',icon='FACESEL',emboss=False);op.key=item.key
        op=row.operator('sgo_v2.lock_part',text='半' if item.partial_lock else '',icon='LOCKED' if item.locked or item.partial_lock else 'UNLOCKED',emboss=False);op.key=item.key

class SGO2_PT_root(bpy.types.Panel):
    bl_label='Soulgrain V2.2 · 语义标注与动态分解';bl_idname='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    def draw(self,context):
        l=self.layout;sc=context.scene
        if META not in sc:
            l.label(text='先打开原模型，或已有 V1 工作文件。',icon='INFO');l.operator('wm.open_mainfile',text='打开 Blender 工程').use_scripts=False;l.operator('sgo.create_workcopy',text='从原模型建立 V2 工作副本');return
        if not meta(sc).get('v2'):
            l.label(text='检测到 V1 标签：先另存，保留原文件。',icon='LOCKED');l.operator('sgo_v2.upgrade_work',icon='DUPLICATE');return
        l.label(text='只做语义标注，不正式切割。',icon='INFO')
        if not meta(sc).get('v21'):
            l.label(text='已兼容载入 V2；保存前先另存新副本。',icon='INFO');l.operator('sgo_v21.save_copy',icon='DUPLICATE')
        row=l.row(align=True);row.operator('sgo.frame',text='框显整鞋');row.operator('sgo.object_mode',text='返回对象选择')
        if not rt().ready:l.operator('sgo_v2.refresh',text='读取标签并启动零件管理器',icon='FILE_REFRESH')
        if sc.sgo_message:
            for line in sc.sgo_message.split('；')[:3]:l.label(text=line[:64])

class SGO2_PT_manager(bpy.types.Panel):
    bl_label='零件管理器';bl_idname='SGO2_PT_manager';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    @classmethod
    def poll(cls,context):return META in context.scene and bool(meta(context.scene).get('v2'))
    def draw(self,context):
        l=self.layout;sc=context.scene
        if not rt().ready:l.operator('sgo_v2.refresh');return
        l.prop(sc,'sgo_v2_search',text='',icon='VIEWZOOM');l.template_list('SGO2_UL_tree','parts',sc,'sgo_v2_rows',sc,'sgo_v2_row_index',rows=11)
        l.label(text='颜色来自真实配置；父行含子类，“本类”单独控制。')
        if view_state()['solo']:
            op=l.operator('sgo_v2.view_part',text='退出单独查看，恢复之前的多重隐藏');op.action='CLEAR_SOLO'
        row=l.row(align=True);row.operator('sgo.show_all',text='恢复全部显示',icon='HIDE_OFF');op=row.operator('sgo_v2.lock_part',text='解除全部锁定',icon='UNLOCKED');op.clear_all=True
        l.operator('sgo_v2.refresh',text='刷新标签与面数',icon='FILE_REFRESH')

class SGO2_PT_inspector(bpy.types.Panel):
    bl_label='网格检查与人工纠错';bl_idname='SGO2_PT_inspector';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    @classmethod
    def poll(cls,context):return SGO2_PT_manager.poll(context)
    def draw(self,context):
        l=self.layout;sc=context.scene;l.prop(sc,'sgo_object',text='明确的编辑对象');l.operator('sgo.pick_object',text='选择该编辑对象');l.operator('sgo_v21.use_active',text='采用当前活动对象为编辑对象');l.operator('sgo.enter_face_mode',icon='FACESEL');l.label(text='检查、指定只处理此对象；其他选区不写入。');l.operator('sgo_v2.inspect_selected',icon='VIEWZOOM')
        if '_sgo_v2_inspection' in sc:
            report=json.loads(sc['_sgo_v2_inspection']);box=l.box();box.label(text=('写入后真实回读：' if report.get('origin') in {'WRITE_VERIFY','GROWTH_VERIFY'} else '最近检查：')+f'{report["faces"]:,} 面 · {report["updated_utc"]}')
            box.label(text='选择变化后请重新检查；撤销会清除此记录。')
            if report.get('hidden'):box.label(text=f'其中 {report["hidden"]} 面当前被分类过滤隐藏')
            detail=report.get('detail')
            if detail and rt().m:
                part=catalog(rt().m).get(detail['code']);box.label(text='对象：'+detail['object']);box.label(text='源面 ID：'+str(detail['source_face_id']))
                if part:
                    box.label(text=part['name'],icon_value=color_icon(part['color']));box.label(text=part['id'])
                box.label(text=('人工确认' if detail['status']==HUMAN else '自动候选' if detail['status']==AUTO else '修复待验收' if detail['status']==3 else '未指定')+f' · 置信 {detail["confidence"]:.3f}')
                box.label(text='问题：'+{0:'无记录',1:'分界跨面 / 候选冲突',2:'融合几何',3:'需局部重建/复核'}.get(detail['issue'],'未知'))
            elif rt().m:
                parts=catalog(rt().m)
                for code,count in sorted(report['parts'].items(),key=lambda x:-x[1])[:10]:
                    p=parts.get(int(code));box.label(text=f'{p["name"] if p else code}：{count:,}',icon_value=color_icon(p['color']) if p else 0)
                box.label(text='人工 '+str(report['states'].get(str(HUMAN),0))+' 面；问题 '+str(report['issues'])+' 面')
                for row in report['objects'][:4]:box.label(text=row['object']+f'：{row["faces"]:,}')
        l.prop(sc,'sgo_target',text='正确归属');op=l.operator('sgo.assign_selected',icon='CHECKMARK');op.unknown=False;l.operator('sgo_v21.assign_unknown',text='所选面改为 UNKNOWN')
        row=l.row(align=True);row.operator('ed.undo',text='撤销',icon='LOOP_BACK');row.operator('ed.redo',text='重做',icon='LOOP_FORWARDS')
        box=l.box();box.prop(sc,'sgo_issue_type',text='问题');op=box.operator('sgo.mark_issue');op.clear=False;op=box.operator('sgo.mark_issue',text='确认后解除问题标记');op.clear=True

class SGO2_PT_growth(bpy.types.Panel):
    bl_label='智能区域扩展（先预览后确认）';bl_idname='SGO2_PT_growth';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain'
    @classmethod
    def poll(cls,context):return SGO2_PT_manager.poll(context)
    def draw(self,context):
        l=self.layout;sc=context.scene;l.label(text='仅沿当前编辑对象扩展；先选少量种子。');l.prop(sc,'sgo_target',text='目标归属');l.prop(sc,'sgo_v2_preset',text='强度');l.prop(sc,'sgo_v2_angle',text='相邻法线角度');l.prop(sc,'sgo_v2_seed_angle',text='偏离种子法线');l.prop(sc,'sgo_v2_radius',text='沿网格距离（尺寸%）');l.prop(sc,'sgo_v2_max_faces',text='最多候选面');l.prop(sc,'sgo_v2_max_seconds',text='计算时间上限 / 秒');l.prop(sc,'sgo_v2_cross_material',text='允许跨材质边界');l.prop(sc,'sgo_v2_respect_semantics',text='尊重其他自动候选分类');l.prop(sc,'sgo_v2_exact_seams',text='连接端点完全重合的 UV / 法线缝')
        l.label(text='人工其他零件、锁定和问题面始终受保护。',icon='LOCKED')
        p=rt().pending
        row=l.row();row.enabled=rt().job is None;row.operator('sgo_v2.grow_preview',text='重新计算（丢弃当前修剪）' if p else '智能扩展预览',icon='VIEWZOOM')
        if p:
            box=l.box();box.label(text='可用原生框选/套索反复减选和补选。',icon='FACESEL')
            box.label(text='本次对象：'+p['object_name'])
            stats=p.get('edit_stats',{})
            if stats:
                box.label(text=f'原始 {stats["original"]:,} ｜ 保留 {stats["retained"]:,} ｜ 排除 {stats["excluded"]:,}')
                box.label(text=f'补充 {stats["added"]:,} ｜ 最终将标注 {stats["final"]:,} 面')
                box.label(text='选区统计自动更新 · '+stats['updated_utc']+' UTC')
                if stats['added']:
                    alert=box.column();alert.alert=True;alert.label(text=f'人工补选 {stats["added"]:,} 面越过原候选边界！',icon='ERROR')
                    alert.label(text='需复核位置；自动法线/距离限制不代表补选安全。')
                    alert.prop(sc,'sgo_v21_accept_added',text='已检查本次补选（选区变化后重置）')
                if stats['blocked_faces'] or stats['blocked']['target_locked']:
                    warn=box.column();warn.alert=True;warn.label(text=f'保护冲突 {stats["blocked_faces"]:,} 面：无法确认',icon='LOCKED')
                    b=stats['blocked'];warn.label(text=f'锁定 {b["locked"]} · 问题 {b["issue"]} · 人工其他类 {b["manual_other"]}')
                    if b['target_locked']:warn.label(text='目标分类已锁定')
                if stats['foreign']:
                    warn=box.column();warn.alert=True;warn.label(text='误选其他对象；请先减选，不能跨对象确认。',icon='ERROR')
                if not stats['final']:box.label(text='最终选区为空；保留一些面或取消。',icon='INFO')
                if stats['final']>200000:box.label(text='超过最终 20 万面上限，请分批。',icon='ERROR')
            if p.get('selection_error'):
                warn=box.column();warn.alert=True;warn.label(text=p['selection_error'][:70],icon='ERROR')
            box.operator('sgo_v21.refresh_selection',icon='FILE_REFRESH')
        row=l.row();row.enabled=bool(p and rt().job is None and not p.get('selection_error') and p.get('edit_stats',{}).get('valid') and (not len(p['candidate_set'].added) or p.get('review_signature')==p['candidate_set'].signature))
        row.operator('sgo_v2.grow_confirm',text='确认最终选区并写入人工标注',icon='CHECKMARK')
        l.operator('sgo_v2.grow_cancel',icon='CANCEL')
        for text in sc.sgo_v2_grow_message.split('；')[:4]:l.label(text=text[:64])

class SGO2_PT_data(bpy.types.Panel):
    bl_label='数据管理（V1 兼容）';bl_idname='SGO2_PT_data';bl_parent_id='SGO_PT_semantics';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain';bl_options={'DEFAULT_CLOSED'}
    @classmethod
    def poll(cls,context):return SGO2_PT_manager.poll(context)
    def draw(self,context):
        l=self.layout;sc=context.scene;l.operator('sgo.auto_candidates',text='重新生成自动候选（保留人工与锁定）',icon='GEOMETRY_NODES');l.operator('sgo.toggle_preview',icon='MATERIAL');l.operator('sgo.validate');l.operator('sgo_v21.save_copy',icon='DUPLICATE');l.operator('sgo.save_work',icon='FILE_TICK');l.operator('sgo.export_json',icon='EXPORT');l.operator('sgo.import_json',icon='IMPORT');l.prop(sc,'sgo_replace_manual',text='导入时替换已有人工标签')
        if sc.sgo_replace_manual:l.label(text='已开启人工替换；导入前先保存。',icon='ERROR')
        if locked_codes():l.label(text='导入前须解除锁定；不会绕过锁定写入。',icon='LOCKED')

V2_CLASSES=[SGO2_TreeRow,SGO2_OT_upgrade,SGO2_OT_refresh,SGO2_OT_tree_fold,SGO2_OT_focus,SGO2_OT_view,SGO2_OT_lock,SGO2_OT_select,SGO21_OT_use_active,SGO21_OT_assign_unknown,SGO2_OT_inspect,SGO2_OT_growth_preview,SGO2_OT_growth_cancel,SGO2_OT_growth_confirm,SGO21_OT_refresh_selection,SGO21_OT_save_copy,SGO2_UL_tree,SGO2_PT_manager,SGO2_PT_inspector,SGO2_PT_growth,SGO2_PT_data]
CLASSES=[c for c in CLASSES if c is not SGO_PT_panel]+[SGO2_PT_root]
V2_PROPS=['sgo_v2_rows','sgo_v2_row_index','sgo_v2_search','sgo_v2_angle','sgo_v2_seed_angle','sgo_v2_radius','sgo_v2_max_faces','sgo_v2_max_seconds','sgo_v2_cross_material','sgo_v2_respect_semantics','sgo_v2_exact_seams','sgo_v2_preset','sgo_v2_grow_message','sgo_v21_accept_added']

def _class_identifier(cls):
    name=getattr(cls,'bl_idname','')
    return name.split('.')[0].upper()+'_OT_'+name.split('.')[1] if '.' in name else name or cls.__name__

def register():
    global _RUNTIME
    # driver_namespace is cleared by loading .blend files; the Python module survives.
    previous=getattr(bpy,'_sgo_v2_registration',None) or bpy.app.driver_namespace.get('SGO_V2_REGISTRATION')
    if previous:
        old=previous['runtime']()
        if old.job:raise RuntimeError('请先取消当前扩展计算，再重新运行或安装工具')
        previous['cleanup']()
    _RUNTIME=V2Runtime()
    # Replace the existing V1 operators without changing their IDs or data format.
    SGO_OT_create.invoke=_create_v2_invoke;SGO_OT_create.execute=_create_v2_execute
    SGO_OT_assign.execute=_manual_execute;SGO_OT_issue.execute=_issue_execute;SGO_OT_auto.execute=_auto_execute
    SGO_OT_save.execute=_save_execute;SGO_OT_check.execute=_check_execute;SGO_OT_show_all.execute=_show_execute
    SGO_OT_object_mode.execute=_object_execute;SGO_OT_pick.execute=_pick_execute;SGO_OT_select.execute=_select_v1_execute
    _V1_REGISTER()
    # Child panels are registered only after their parent and row type exist.
    for cls in V2_CLASSES:
        existing=cls if getattr(cls,'is_registered',False) else getattr(bpy.types,_class_identifier(cls),None)
        if existing:
            try:bpy.utils.unregister_class(existing)
            except RuntimeError:pass
        bpy.utils.register_class(cls)
    bpy.types.Scene.sgo_v2_rows=CollectionProperty(type=SGO2_TreeRow)
    bpy.types.Scene.sgo_v2_row_index=IntProperty(default=0)
    bpy.types.Scene.sgo_v2_search=StringProperty(name='按名称 / 键 / ID 搜索',default='',update=_search_update)
    bpy.types.Scene.sgo_v2_angle=FloatProperty(name='相邻法线角度',default=20,min=1,max=85,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_seed_angle=FloatProperty(name='偏离种子法线',default=45,min=5,max=85,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_radius=FloatProperty(name='沿网格距离（对象对角线%）',default=15,min=.2,max=100,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_max_faces=IntProperty(name='最多候选面',default=50000,min=10,max=200000,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_max_seconds=FloatProperty(name='计算时间上限',default=8,min=.5,max=30,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_cross_material=BoolProperty(name='允许跨材质边界',default=False,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_respect_semantics=BoolProperty(name='尊重其他自动候选分类',default=True,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_exact_seams=BoolProperty(name='连接端点完全重合的 UV / 法线缝',default=True,update=_growth_setting_changed)
    bpy.types.Scene.sgo_v2_preset=EnumProperty(name='强度',items=[('CAUTIOUS','保守','较小角度和距离'),('STANDARD','标准','保留默认保护'),('WIDE','较宽范围','仍需人工复核，不取消保护')],default='STANDARD',update=_preset_changed)
    bpy.types.Scene.sgo_v2_grow_message=StringProperty(default='先选择少量种子，再预览。候选尚未确认时不保存归属。')
    bpy.types.Scene.sgo_v21_accept_added=BoolProperty(name='已检查本次补选',default=False,update=_added_review_changed)
    bpy.types.Scene.sgo_target=EnumProperty(name='目标归属',items=part_items,update=_growth_setting_changed)
    for handler,fn in [(bpy.app.handlers.undo_post,_v2_history_handler),(bpy.app.handlers.redo_post,_v2_history_handler),(bpy.app.handlers.load_post,_v2_load_handler)]:
        if fn not in handler:handler.append(fn)
    if not bpy.app.background and not bpy.app.timers.is_registered(_mode_guard):bpy.app.timers.register(_mode_guard,first_interval=.5,persistent=True)
    registration={'runtime':rt,'cleanup':unregister}
    bpy.app.driver_namespace['SGO_V2_REGISTRATION']=registration;bpy._sgo_v2_registration=registration
    # Add-on startup uses _RestrictContext; defer all scene reads to the timer/UI.
    rt().refresh_needed=True


def unregister():
    global _RUNTIME
    if _RUNTIME and _RUNTIME.job:raise RuntimeError('请先取消当前扩展计算，再停用工具')
    if _RUNTIME:_RUNTIME.shutdown()
    if bpy.app.timers.is_registered(_mode_guard):bpy.app.timers.unregister(_mode_guard)
    for handler,fn in [(bpy.app.handlers.undo_post,_v2_history_handler),(bpy.app.handlers.redo_post,_v2_history_handler),(bpy.app.handlers.load_post,_v2_load_handler)]:
        if fn in handler:handler.remove(fn)
    for name in V2_PROPS:
        if hasattr(bpy.types.Scene,name):delattr(bpy.types.Scene,name)
    for cls in reversed(V2_CLASSES):
        old=cls if getattr(cls,'is_registered',False) else getattr(bpy.types,_class_identifier(cls),None)
        if old:
            try:bpy.utils.unregister_class(old)
            except RuntimeError:pass
    _V1_UNREGISTER();bpy.app.driver_namespace.pop('SGO_V2_REGISTRATION',None)
    if hasattr(bpy,'_sgo_v2_registration'):delattr(bpy,'_sgo_v2_registration')
    _RUNTIME=None



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
    _repair_require_identity(o)
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
        frag={'namespace':'__SGO_V22_DISPLAY__','session':d.session,'source_object_id':uid,'polygon_indices':fid,
              'positions':pos.reshape(-1,3),'colors':rgba.reshape(-1,4),'group':group,'batch':None}
        d.fragments[key]=frag
        # Animate newly arriving actual triangles only, without moving old triangles.
        if not d.building and bpy.context.scene.sgo_v22_animate:
            previous=prior['polygon_indices'] if prior else np.empty(0,'i4');added=~np.isin(fid,previous)
            if added.any() and added.sum()+sum(len(a['ids']) for a in d.anim.values())<=bpy.context.scene.sgo_v22_animation_limit:
                d.anim[key]={'ids':fid[added],'start':time.perf_counter(),'positions':pos[added].reshape(-1,3).copy(),'colors':rgba[added].reshape(-1,4).copy(),'batch':None}
    for key in old:
        if key not in d.fragments:d.anim.pop(key,None)
        elif key in d.anim and not np.isin(d.anim[key]['ids'],d.fragments[key]['polygon_indices']).all():d.anim.pop(key,None)
    d.rebuilt+=1

def v22_pump(budget=.045):
    d=display22();t=time.perf_counter()
    while d.active and d.queue and time.perf_counter()-t<budget:
        uid,block=d.queue.pop();v22_rebuild_chunk(uid,block)
    if d.active and not d.queue:
        d.ready=True;d.building=False
        count=sum(len(x['polygon_indices']) for x in d.fragments.values())
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
                        mask=~np.isin(f['polygon_indices'],anim['ids']);anim['static']={'positions':f['positions'].reshape(-1,3,3)[mask].reshape(-1,3),'colors':f['colors'].reshape(-1,3,4)[mask].reshape(-1,4),'batch':None}
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
            count=sum(len(f['polygon_indices']) for f in d.fragments.values() if f['group']==key)
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


SR3_EXPORT_COMMON="import bpy,numpy as np,hashlib,json\ndef array(collection, prop, width=1, dtype='i4'):\n    a=np.empty(len(collection)*width,dtype=dtype); collection.foreach_get(prop,a)\n    return a.reshape(-1,width) if width>1 else a\ndef digest(a):\n    return hashlib.sha256(np.ascontiguousarray(a).tobytes()).hexdigest()\ndef material_signature(mat):\n    if mat is None: return None\n    nodes=[];links=[]\n    if mat.use_nodes and mat.node_tree:\n        for n in mat.node_tree.nodes:\n            row={'name':n.name,'type':n.bl_idname,'inputs':{}}\n            if hasattr(n,'image'):row['image']=n.image.name if n.image else None\n            for k in ['extension','interpolation','projection','uv_map','operation','blend_type']:\n                if hasattr(n,k):row[k]=getattr(n,k)\n            for s in n.inputs:\n                if not hasattr(s,'default_value'):continue\n                x=s.default_value\n                if isinstance(x,(str,int,float,bool)):row['inputs'][s.identifier]=x\n                elif hasattr(x,'__len__'):\n                    try:row['inputs'][s.identifier]=list(x)\n                    except TypeError:pass\n            nodes.append(row)\n        links=sorted((l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier) for l in mat.node_tree.links)\n    return hashlib.sha256(json.dumps({'nodes':nodes,'links':links,'diffuse':list(mat.diffuse_color)},sort_keys=True).encode()).hexdigest()\ndef resource_signature():\n    mats={m.name:material_signature(m) for m in bpy.data.materials}\n    ims={}\n    for im in bpy.data.images:\n        if im.source=='VIEWER':continue\n        ims[im.name]={'source':im.source,'path':im.filepath,'size':list(im.size),'colorspace':im.colorspace_settings.name,'packed':hashlib.sha256(bytes(im.packed_file.data)).hexdigest() if im.packed_file else None}\n    return {'materials':mats,'images':ims}\ndef object_signature(o):\n    return {'parent':o.parent.name if o.parent else None,'matrix_world':[list(r) for r in o.matrix_world],\n            'matrix_local':[list(r) for r in o.matrix_local],\n            'materials':[[s.link,s.material.name if s.material else None] for s in o.material_slots]}\ndef sr3_transfer_digest(o):\n    me=o.data;fields={'position':digest(array(me.vertices,'co',3,'f4')),'edges':digest(array(me.edges,'vertices',2)),'loops':digest(array(me.loops,'vertex_index')),'poly_start':digest(array(me.polygons,'loop_start')),'poly_total':digest(array(me.polygons,'loop_total')),'material_index':digest(array(me.polygons,'material_index')),'smooth':digest(array(me.polygons,'use_smooth',dtype='bool')),'uv':{u.name:digest(array(u.data,'uv',2,'f4')) for u in me.uv_layers},'object':object_signature(o),'attributes':{}}\n    for at in me.attributes:\n        if at.domain=='FACE' and at.data_type in ['INT','FLOAT'] and at.name.startswith(('sgo_','sgor_','repair_','sr3_')):\n            fields['attributes'][at.name]=digest(array(at.data,'value',dtype='f4' if at.data_type=='FLOAT' else 'i4'))\n        elif at.name in ['custom_normal','sharp_face','sharp_edge']:\n            width=2 if at.data_type=='INT16_2D' else 1;val=array(at.data,'value',width,'bool' if at.data_type=='BOOLEAN' else 'i4')\n            if at.data_type=='BOOLEAN' and not val.any():continue\n            fields['attributes'][at.name]=digest(val)\n    return fields\n"
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
