"""Re-render the current V4 .blend; never rebuild/alter shoe geometry."""
import bpy,sys
from pathlib import Path
from mathutils import Vector
O=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(O/'soulgrain_onward_v4_original_review.blend'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=False
scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100
views=[('01_side_left',(0,-1,.10)),('02_side_right',(0,1,.10)),('03_three_quarter',(-.75,-1,.42)),('04_front',(-1,0,.27)),('05_top_front',(-.30,0,1)),('06_rear',(1,-.20,.30))]
cam=scene.camera;target=Vector((.002,.006,.050))
for name,d in views:
 cam.location=target+Vector(d);cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=.42 if name=='05_top_front' else .35
 scene.render.filepath=str(O/'previews'/(name+'.png'));bpy.ops.render.render(write_still=True)
cam.location=target+Vector((-.75,-1,.42));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(O/'soulgrain_onward_v4_original_review.blend'),compress=True)
print('V4_SIX_FULL_VIEWS_COMPLETE')
