"""Render the new shoe for visual review; never save over its model project."""
import bpy, sys, math
from pathlib import Path
from mathutils import Vector
P=Path(__file__).resolve().parent
R=P.parents[1]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
bpy.ops.wm.open_mainfile(filepath=str(P/'soulgrain_onward_refined_v9.blend'))
s=bpy.context.scene
models=[o for o in s.objects if o.type=='MESH']
s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=32 if '--quick' in args else 72
s.cycles.use_denoising=True;s.cycles.max_bounces=6
s.render.resolution_x=1200 if '--quick' in args else 1600
s.render.resolution_y=900 if '--quick' in args else 1200
s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG'
s.view_settings.view_transform='AgX'
s.world=bpy.data.worlds.new('V9 Product Studio');s.world.use_nodes=True
s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.3,.35,.44,1)
s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.12
target=Vector((0,0,.072))
for label,loc,power,size in [('Key',(-.25,-.35,.48),3.8,.36),('Fill',(-.05,.35,.28),1.7,.38),('Rim',(.3,-.06,.35),4.8,.28)]:
    d=bpy.data.lights.new(label,'AREA');d.energy=power;d.shape='DISK';d.size=size
    o=bpy.data.objects.new(label,d);s.collection.objects.link(o);o.location=loc
    o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.0002));floor=bpy.context.object
m=bpy.data.materials.new('Studio floor');m.use_nodes=True
bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.023,.031,.047,1)
bs.inputs['Roughness'].default_value=.8;floor.data.materials.append(m)
d=bpy.data.cameras.new('V9 review camera');cam=bpy.data.objects.new(d.name,d);s.collection.objects.link(cam);s.camera=cam
d.type='ORTHO';d.clip_start=.001;d.clip_end=100
points=[o.matrix_world@Vector(c) for o in models for c in o.bound_box]
lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)]);center=(lo+hi)/2
dest=R/'previews/v9-refined-source';dest.mkdir(parents=True,exist_ok=True)
views=[('side',(0,-1,.06)),('three-quarter',(-.82,-1,.45)),('rear',(.95,-.3,.22)),('top',(-.1,-.12,1)),('inner',(0,1,.1)),('front',(-1,-.04,.18))]
requested=[a for a in args if not a.startswith('--')]
for name,direction in views:
    if requested and name not in requested:continue
    cam.location=center+Vector(direction).normalized()*.8
    cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
    rot=cam.rotation_euler.to_matrix().transposed();ps=[rot@(p-center) for p in points]
    w=max(p.x for p in ps)-min(p.x for p in ps);h=max(p.y for p in ps)-min(p.y for p in ps)
    cam.data.ortho_scale=max(w,h*s.render.resolution_x/s.render.resolution_y)*1.12
    s.render.filepath=str(dest/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('V9_VIEW',name,flush=True)
