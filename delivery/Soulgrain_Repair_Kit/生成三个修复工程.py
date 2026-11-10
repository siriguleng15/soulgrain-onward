"""Blender 5.2 LTS, stdlib + bundled NumPy/bpy only. No network requests."""
import bpy,os,sys,json,hashlib,shutil,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parent
SOURCE_SHA='725756904a0c71ee9c927b3e39332655c4cd175d3b9d55d0272ae70adb105183'
def build(source,output):
 source=Path(source).expanduser().resolve();output=Path(output).expanduser().resolve()
 if not source.is_file():raise RuntimeError('未找到 SOUL.NEW.blend。')
 if hashlib.sha256(source.read_bytes()).hexdigest()!=SOURCE_SHA:raise RuntimeError('源文件 SHA-256 不匹配。只接受本轮原始 Release，不能套用到别的标注工程。')
 for rel,digest in json.loads((ROOT/'payload-sha256.json').read_text()).items():
  if hashlib.sha256((ROOT/rel).read_bytes()).hexdigest()!=digest:raise RuntimeError('修复补丁损坏或版本不符：'+rel)
 output.mkdir(parents=True,exist_ok=True)
 for stage in 'ABC':
  if (output/('Soulgrain_Stage_'+stage+'.blend')).exists():raise RuntimeError('输出目录已有阶段工程，请选一个新的空文件夹，绝不覆盖。')
 inp=ROOT/'inputs/SOUL.NEW.blend';inp.parent.mkdir(exist_ok=True)
 if inp.exists():
  if hashlib.sha256(inp.read_bytes()).hexdigest()!=SOURCE_SHA:raise RuntimeError('补丁包 inputs 内文件不符，未覆盖。')
 else:shutil.copy2(source,inp)
 os.environ['SOULGRAIN_REPAIR_OUTPUT']=str(output);sys.path.insert(0,str(ROOT/'scripts'))
 # Reject a previously loaded different repair helper, rather than use stale data.
 old=sys.modules.get('repair_common')
 if old is not None and Path(old.__file__).resolve()!=ROOT/'scripts/repair_common.py':raise RuntimeError('当前 Blender 已加载另一份修复包，请重启 Blender 后再运行。')
 for stage in 'ABC':
  print('正在生成独立阶段',stage,flush=True);runpy.run_path(str(ROOT/'scripts'/('apply_'+stage+'.py')),run_name='__soulgrain_replay__')
 assert hashlib.sha256(source.read_bytes()).hexdigest()==SOURCE_SHA
 (output/'完成说明.txt').write_text('A、B、C 为累计的真实几何检查副本，均含完整源归档场景。B 上部内衬/鞋眼/包边待修；C 部分间隙及收口待修。不是整鞋最终验收版。原文件未覆盖。',encoding='utf-8')
 return output
class SGO_REPLAY_OT_build(bpy.types.Operator):
 bl_idname='sgo_repair.build_three_checkpoints';bl_label='生成 A、B、C 独立工程';bl_description='按已验证补丁生成三个新文件；不覆盖源文件或现有输出'
 filepath:bpy.props.StringProperty(name='选择原始 SOUL.NEW.blend',subtype='FILE_PATH')
 filter_glob:bpy.props.StringProperty(default='*.blend',options={'HIDDEN'})
 def invoke(self,context,event):
  self.filepath=bpy.data.filepath or 'SOUL.NEW.blend';context.window_manager.fileselect_add(self);return {'RUNNING_MODAL'}
 def execute(self,context):
  try:
   # Opening the script itself marks a .blend dirty. Check real geometry/UV/
   # labels instead of rejecting that harmless Text change or discarding work.
   if not bpy.data.filepath or Path(bpy.data.filepath).resolve()!=Path(self.filepath).resolve():raise RuntimeError('请先在 Blender 打开原始 SOUL.NEW.blend，再载入本脚本；不能从另一个未保存工程直接切换。')
   if context.object and context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
   import numpy as np
   def arr(coll,key,width=1,dtype='i4'):
    out=np.empty(len(coll)*width,dtype=dtype);coll.foreach_get(key,out);return out
   for item in json.loads((ROOT/'source-guard.json').read_text()):
    ob=bpy.data.objects.get(item['name'])
    if ob is None or ob.type!='MESH':raise RuntimeError('当前工程对象不符：'+item['name'])
    me=ob.data;values={'v':arr(me.vertices,'co',3,'f4'),'f':arr(me.loops,'vertex_index'),'mat':arr(me.polygons,'material_index'),'uv':arr(me.uv_layers[0].data,'uv',2,'f4') if me.uv_layers else np.empty(0,dtype='f4')}
    for key,attr in [('p','sgo_part'),('s','sgo_status'),('c','sgo_confidence'),('i','sgo_issue'),('fid','sgo_source_face')]:values[key]=arr(me.attributes[attr].data,'value',dtype='f4' if key=='c' else 'i4')
    for key,value in values.items():
     if hashlib.sha256(value.tobytes()).hexdigest()!=item['sha256'][key]:raise RuntimeError('当前工程存在未保存的网格/UV/标注变化，先另存工作，未执行修复：'+item['name']+' '+key)
   sys.path.insert(0,str(ROOT/'scripts'));import source_reader
   guard=json.loads((ROOT/'source-resource-guard.json').read_text());current=source_reader.resource_signature()
   for name,signature in guard['objects'].items():
    if source_reader.object_signature(bpy.data.objects[name])!=signature:raise RuntimeError('对象变换或材质槽有未保存变化，未执行修复：'+name)
   for kind in ['materials','images']:
    for name,value in guard['resources'][kind].items():
     if current[kind].get(name)!=value:raise RuntimeError('材质/贴图有变化或跨版本校验不符，未执行修复：'+name)
   import datetime
   folder=ROOT/('RESULTS_'+datetime.datetime.now().strftime('%Y%m%d_%H%M%S'));build(self.filepath,folder);self.report({'INFO'},'已生成三个独立工程：'+str(folder));return {'FINISHED'}
  except Exception as exc:self.report({'ERROR'},str(exc));print('未完成：',exc,flush=True);return {'CANCELLED'}
class SGO_REPLAY_PT_panel(bpy.types.Panel):
 bl_label='Soulgrain 真实修复补丁';bl_idname='SGO_REPLAY_PT_panel';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Soulgrain 修复'
 def draw(self,context):
  col=self.layout.column();col.label(text='仅接受指定原始 Release，绝不覆盖。');col.label(text='B、C 为部分完成检查版。');col.operator(SGO_REPLAY_OT_build.bl_idname,icon='FILE_BLEND')
def register():
 for cls in (SGO_REPLAY_OT_build,SGO_REPLAY_PT_panel):
  old=getattr(bpy.types,cls.__name__,None)
  if old:bpy.utils.unregister_class(old)
  bpy.utils.register_class(cls)
if __name__=='__main__':register();print('工具已就绪：三维视图 → N → Soulgrain 修复。')
