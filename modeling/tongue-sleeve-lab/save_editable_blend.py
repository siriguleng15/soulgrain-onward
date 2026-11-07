"""Blender background: only save the new chapter derivative, never source files."""
import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;ASSETS=ROOT/'public/tongue-sleeve-lab/assets';OUTPUT=HERE/'user-hand-cuff-prepared.blend'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.file_preview_type='NONE'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.import_scene.gltf(filepath=str(ASSETS/'user-hand-parts.glb'))
parts=list(bpy.context.scene.objects);collection=bpy.data.collections.new('01_Separated_User_Hand_And_Robe');bpy.context.scene.collection.children.link(collection)
for obj in parts:
 for old in list(obj.users_collection):old.objects.unlink(obj)
 collection.objects.link(obj)
 if obj.name=='Hand_Skin':obj.hide_render=True;obj.hide_set(True);obj['role']='Unrigged source-exterior reference, not a second visible hand'
bpy.ops.import_scene.gltf(filepath=str(ASSETS/'user-hand-rig.glb'))
rigged=[o for o in bpy.context.scene.objects if o not in parts];rig_collection=bpy.data.collections.new('02_User_Hand_22_Joint_Rig');bpy.context.scene.collection.children.link(rig_collection)
for obj in rigged:
 for old in list(obj.users_collection):old.objects.unlink(obj)
 rig_collection.objects.link(obj)
# Blender imports glTF Y-up -> Z-up. Gem frames are constructed in glTF
# coordinates, then transformed through exactly the same basis.
from mathutils import Vector,Matrix
layout=json.loads((ASSETS/'cuff-medallion-bindings.json').read_text());blob=(ASSETS/'user-hand-parts.glb').read_bytes()
import struct,numpy as np
n=struct.unpack_from('<I',blob,12)[0];g=json.loads(blob[20:20+n]);bin_data=blob[28+n:]
def read(i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];cnt={'VEC3':3,'SCALAR':1}[a['type']];return np.frombuffer(bin_data,'<f4' if a['componentType']==5126 else '<u4',a['count']*cnt,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,cnt)
node=next(x for x in g['nodes'] if x['name']=='Horseshoe_Cuff');primitive=g['meshes'][node['mesh']]['primitives'][0];p=read(primitive['attributes']['POSITION']);f=read(primitive['indices']).reshape(-1,3);vertices=[];faces=[]
def to_blender(v):return (v[0],-v[2],v[1])
for anchor in layout['anchors']:
 tri=p[f[anchor['triangle']]];center=(tri*np.asarray(anchor['barycentric'])[:,None]).sum(0);normal=np.cross(tri[1]-tri[0],tri[2]-tri[0]);normal/=np.linalg.norm(normal);x=tri[1]-tri[0];x/=np.linalg.norm(x);y=np.cross(normal,x);center+=normal*anchor['clearance'];r=anchor['radius'];start=len(vertices)
 for size,z in [(1,0),(1,.3),(.56,.72)]:
  for j in range(10):
   a=j/10*np.pi*2;v=center+r*(size*np.cos(a)*x+size*np.sin(a)*y+z*normal);vertices.append(to_blender(v))
 for k in range(2):
  for j in range(10):faces.extend([(start+k*10+j,start+k*10+(j+1)%10,start+(k+1)*10+j),(start+k*10+(j+1)%10,start+(k+1)*10+(j+1)%10,start+(k+1)*10+j)])
 for j in range(1,9):faces.append((start+20,start+20+j,start+21+j))
mesh=bpy.data.meshes.new('Persistent_785_Gem_Facets');mesh.from_pydata(vertices,[],faces);mesh.update();stones=bpy.data.objects.new('Same_Silver_Medallion_785',mesh);collection.objects.link(stones);stones['binding_file']='public/tongue-sleeve-lab/assets/cuff-medallion-bindings.json';stones['note']='785 recovered artwork positions, approximately 75mm outer diameter. Runtime uses persistent barycentric surface bindings.'
material=bpy.data.materials.new('Silver_Rhinestones');material.use_nodes=True;bsdf=material.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(.87,.90,.95,1);bsdf.inputs['Metallic'].default_value=.78;bsdf.inputs['Roughness'].default_value=.19;mesh.materials.append(material)
for obj in collection.objects:
 if obj.name=='Robe_UnderCuff':obj['assumption']='Hidden robe cloth reconstructed from cuff boundaries, not scanned manufacturing geometry'
 if obj.name=='Horseshoe_Cuff':obj['separation']='Original exterior, independent topology; do not replace it with a flat decal'
scene=bpy.context.scene;scene['source_hand_sha256']=g['extras']['sourceSHA256'];scene['stage']='Asset preparation + FK rig; chapter contact/flip animation not yet authored';scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
cuff=bpy.data.objects.get('Horseshoe_Cuff');world=stones.matrix_world.copy();stones.parent=cuff;stones.matrix_world=world
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.context.scene.objects:
 if obj.type=='ARMATURE' or obj.name in {'Horseshoe_Cuff','Robe_Sleeve','Robe_UnderCuff','User_Hand_Skinned','Same_Silver_Medallion_785'}:obj.select_set(True)
 elif obj.type=='MESH':obj.hide_render=True
bpy.ops.export_scene.gltf(filepath=str(ASSETS/'user-hand-cuff-prepared.glb'),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT));print('SAVED_DERIVED_ONLY',OUTPUT)
