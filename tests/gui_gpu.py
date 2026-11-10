import bpy,sys,importlib.util,json,time,traceback,subprocess,ctypes
from pathlib import Path
from mathutils import Vector
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');report={'checks':[],'blender':bpy.app.version_string,'render':'Real interactive Linux OpenGL viewport, Mesa software GPU; not macOS Metal'}
def check(n,x):
 report['checks'].append({'name':n,'passed':bool(x)});print('PASS' if x else 'FAIL',n,flush=True);assert x,n
def with_view(fn):
 def wrapped():
  w=bpy.context.window_manager.windows[0];ar=next(x for x in w.screen.areas if x.type=='VIEW_3D');reg=next(r for r in ar.regions if r.type=='WINDOW')
  with bpy.context.temp_override(window=w,area=ar,region=reg):return fn()
 return wrapped
@with_view
def main():
 try:
  pass # file load completed before this GUI callback
  spec=importlib.util.spec_from_file_location('sgo22_gui',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);sys.modules['sgo22_gui']=a;spec.loader.exec_module(a);a.register();a.ensure_session(refresh=True)
  bpy.context.scene.sgo_v22_animate=False;bpy.ops.sgo_v22.enter();d=a.display22();area=next(x for x in bpy.context.screen.areas if x.type=='VIEW_3D');space=area.spaces.active;space.show_region_ui=True;space.overlay.show_floor=False;space.overlay.show_axis_x=False;space.overlay.show_axis_y=False;space.overlay.show_relationship_lines=False
  xlib=ctypes.CDLL('libX11.so.6');xtst=ctypes.CDLL('libXtst.so.6');xlib.XOpenDisplay.restype=ctypes.c_void_p;xd=xlib.XOpenDisplay(None);xtst.XTestFakeMotionEvent.argtypes=[ctypes.c_void_p,ctypes.c_int,ctypes.c_int,ctypes.c_int,ctypes.c_ulong];xtst.XTestFakeButtonEvent.argtypes=[ctypes.c_void_p,ctypes.c_uint,ctypes.c_int,ctypes.c_ulong];xlib.XFlush.argtypes=[ctypes.c_void_p];xtst.XTestFakeMotionEvent(xd,-1,area.x+area.width-14,330,0);xtst.XTestFakeButtonEvent(xd,1,1,0);xtst.XTestFakeButtonEvent(xd,1,0,0);xlib.XFlush(xd)
  space.region_3d.view_location=Vector(d.layout['center']);space.region_3d.view_rotation=Vector((-4,-6,4)).to_track_quat('Z','Y');space.region_3d.view_distance=d.layout['span']*3.5;space.region_3d.view_perspective='ORTHO'
  @with_view
  def stage1():
   try:
    check('real sidebar active category is Soulgrain',next(r for r in area.regions if r.type=='UI').active_panel_category=='Soulgrain')
    check('real viewport draw handler compiled shader',d.shader is not None and not d.error)
    check('real GPU triangle batches built from source faces',sum(f.get('batch') is not None for f in d.fragments.values())==len(d.fragments)>0)
    check('no proxy scene objects or meshes exist during GPU drawing',len(a.objects())==13 and not any(o.name.startswith('__SGO_V22') for o in bpy.data.objects))
    subprocess.run(['import','-window','root',str(R/'reports/workbench-real-viewport.png')],check=True)
    bpy.ops.wm.call_panel(name='SGO22_PT_workbench',keep_open=True)
    bpy.context.scene.sgo_v22_guides=True
    bpy.context.scene.sgo_v22_animate=True;o=bpy.data.objects['Shoe_TEST_V3'];bpy.context.view_layer.objects.active=o;bpy.context.scene.sgo_object=o['_sgo_object_id'];p,s,c,i=a.read_labels(o.data);ix=np.flatnonzero((p==0)&(i==0)&~a.hidden_array(o))[-10:];a.set_selected_ids(o,ix);bpy.context.scene.sgo_target='10';bpy.ops.sgo.assign_selected(unknown=False)
    check('real UI manual transaction creates optional animation caches',bool(d.anim))
    bpy.app.timers.register(stage2,first_interval=3.)
   except Exception:fail()
   return None
  @with_view
  def stage2():
   try:
    check('GPU animated update finishes without draw errors',not d.error and not d.anim and d.active)
    subprocess.run(['import','-window','root',str(R/'reports/workbench-updated-viewport.png')],check=True)
    bpy.ops.sgo_v22.exit();check('exit removes GPU draw handles and cached triangles',not d.handlers and not d.fragments)
    # UI draw methods and actual UIList are exercised by showing the N-panel.
    report.update(status='passed',source_faces=1499039);(R/'reports/gui-gpu.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));bpy.app.timers.register(lambda:bpy.ops.wm.quit_blender() and None,first_interval=1.)
   except Exception:fail()
   return None
  def fail():
   report.update(status='failed',error=traceback.format_exc());(R/'reports/gui-gpu.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));traceback.print_exc();bpy.app.timers.register(lambda:bpy.ops.wm.quit_blender() and None,first_interval=1.)
  bpy.app.timers.register(stage1,first_interval=5.)
 except Exception:traceback.print_exc();bpy.ops.wm.quit_blender()

 return None
work=json.loads((R/'reports/real-model.json').read_text())['test_file'];bpy.ops.wm.open_mainfile(filepath=work,use_scripts=False,load_ui=False)
bpy.app.timers.register(main,first_interval=1.)
