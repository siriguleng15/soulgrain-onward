"""Soulgrain semantic annotation V1. No cutting, no PBR/UV edits.
Run in Blender's Text Editor, or install as a legacy add-on.
"""
bl_info = {"name": "Soulgrain 面级语义标注 V1", "author": "Codex", "version": (1, 0, 0), "blender": (4, 2, 0), "location": "3D 视图 > N > Soulgrain", "category": "Mesh"}
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
    unknown:BoolProperty(default=False,options={'HIDDEN'})
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
    clear:BoolProperty(default=False,options={'HIDDEN'})
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
        box=l.box();box.label(text='人工面级纠错（优先）');box.prop(sc,'sgo_object',text='编辑对象');box.operator('sgo.pick_object',text='选择此对象');box.operator('sgo.enter_face_mode',icon='FACESEL');box.prop(sc,'sgo_target',text='正确归属');box.operator('sgo.assign_selected',icon='CHECKMARK');op=box.operator('sgo.assign_selected',text='所选面设为 UNKNOWN');op.unknown=True;row=box.row(align=True);row.operator('ed.undo',text='撤销',icon='LOOP_BACK');row.operator('ed.redo',text='重做',icon='LOOP_FORWARDS')
        row=box.row(align=True);row.operator('sgo.select_label',text='选同类面');op=row.operator('sgo.select_label',text='仅看当前归属');op.isolate=True;box.operator('sgo.show_all',icon='HIDE_OFF')
        box=l.box();box.label(text='跨面 / 融合问题：只标记，不切割');box.prop(sc,'sgo_issue_type',text='问题');box.operator('sgo.mark_issue');op=box.operator('sgo.mark_issue',text='确认后解除所选问题标记');op.clear=True
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

if __name__=='__main__':register()
