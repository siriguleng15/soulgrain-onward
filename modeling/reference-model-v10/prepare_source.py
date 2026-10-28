"""Read-only import/audit preparation for the uploaded xiezitu.glb.

blender -b --python modeling/reference-model-v10/prepare_source.py -- --source PATH
All working geometry is written under /tmp; the uploaded GLB is never saved over.
"""
from pathlib import Path
import sys, hashlib, json
import bpy
import numpy as np
from mathutils import Vector

args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
ROOT = Path(__file__).resolve().parents[2]
source = Path(args[args.index('--source')+1]) if '--source' in args else ROOT/'public/reference-model-v10/xiezitu-original.glb'
expected = 'b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897'
assert hashlib.sha256(source.read_bytes()).hexdigest() == expected
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
assert len(objects) == 1, 'This repair recipe is tied to the supplied single-mesh source.'
obj = objects[0]
vertices = np.array([obj.matrix_world@v.co for v in obj.data.vertices])
faces = np.array([list(p.vertices) for p in obj.data.polygons])
np.save('/tmp/xiezitu-v.npy', vertices)
np.save('/tmp/xiezitu-f.npy', faces)
for mat in obj.data.materials:
    mat.use_nodes = True
    bs = mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (.36,.44,.52,1)
    bs.inputs['Roughness'].default_value = .72
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 12
scene.cycles.use_denoising = True
scene.render.resolution_x = 1000
scene.render.resolution_y = 750
scene.render.resolution_percentage = 100
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.45,.45,.45,1)
scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .7
points = [obj.matrix_world@Vector(p) for p in obj.bound_box]
center = sum(points, Vector())/8
for name, offset, energy, size in [('Key',(-2,-3,4),400,4),('Fill',(2,3,2),250,3)]:
    data = bpy.data.lights.new(name,'AREA');data.energy = energy;data.shape='DISK';data.size=size
    light = bpy.data.objects.new(name,data);scene.collection.objects.link(light)
    light.location = center+Vector(offset)
    light.rotation_euler = (center-light.location).to_track_quat('-Z','Y').to_euler()
data = bpy.data.cameras.new('AuditCamera');data.type='ORTHO'
camera = bpy.data.objects.new('AuditCamera',data);scene.collection.objects.link(camera);scene.camera=camera
camera.location=center+Vector((-1,0,.15)).normalized()*5
camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
data.ortho_scale=2.2
bpy.ops.wm.save_as_mainfile(filepath='/tmp/xiezitu-inspection.blend')
print(json.dumps({'sourceSha256':expected,'vertices':len(vertices),'triangles':len(faces),'coordinateSpace':'Blender world X-length Y-side Z-up; uncalibrated model units'},indent=2))
