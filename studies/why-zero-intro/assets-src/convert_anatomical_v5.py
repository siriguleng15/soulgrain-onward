"""Editable CC BY-SA 4.0 derivative of Elena FF's Rigged hand.
Rebuild: blender -b --python assets-src/convert_anatomical_v5.py
The input JSON is the original GLB's open pose evaluated in Three.js, preserving
vertex/index identity, original UVs and skin weights. Blender imports the source
control rig with an incompatible rest pose; rebuilding the deform rig avoids it.
Source and license are retained in anatomical-v5-source/LICENSE.txt.
"""
import bpy,bmesh,json,math,hashlib
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets-src/anatomical-v5-source'
data=json.loads((SRC/'open-pose.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
S=.060
original={b['name']:b for b in data['bones']}
origin=Vector(original['handR_02']['position'])
# Source world coordinates are Y-up, palm thickness X. Rotate 180deg about X
# so fingers point -Y, then convert Y-up glTF to Z-up Blender coordinates.
def convert(p):
 d=(Vector(p)-origin)*S
 return Vector((d.x,d.z,-d.y))
positions=[convert(p) for p in data['positions']]
tri=data['triangles'];faces=[tuple(tri[i:i+3]) for i in range(0,len(tri),3)]
g=bpy.data.meshes.new('Anatomical hand source topology / original UVs')
g.from_pydata(positions,[],faces);g.update()
mesh=bpy.data.objects.new('Anatomical_Skin_V5',g);bpy.context.collection.objects.link(mesh)
uv=g.uv_layers.new(name='UVMap')
for polygon in g.polygons:
 for loop in polygon.loop_indices:
  value=data['uv'][g.loops[loop].vertex_index]
  # glTF has V-down texture coordinates; Blender has V-up. The exporter
  # reverses this again. Omitting this flip causes repeated nails on the palm.
  uv.data[loop].uv=(value[0],1-value[1])
material=bpy.data.materials.new('Anatomical_Skin_V5_AuthoredUV');material.use_nodes=True
nodes=material.node_tree.nodes;links=material.node_tree.links;pbr=nodes.get('Principled BSDF')
def texture(name,path,noncolor=False):
 n=nodes.new('ShaderNodeTexImage');n.label=name;n.image=bpy.data.images.load(str(path));n.image.pack()
 if noncolor:n.image.colorspace_settings.name='Non-Color'
 return n
albedo=texture('Original authored skin and nails',SRC/'albedo.jpg')
links.new(albedo.outputs['Color'],pbr.inputs['Base Color'])
rough=texture('Original packed material',SRC/'metal-roughness.png',True);split=nodes.new('ShaderNodeSeparateColor');split.mode='RGB';links.new(rough.outputs['Color'],split.inputs['Color']);links.new(split.outputs['Green'],pbr.inputs['Roughness'])
pbr.inputs['Metallic'].default_value=0;pbr.inputs['IOR'].default_value=1.42;pbr.inputs['Specular IOR Level'].default_value=.36
spec=texture('Original specular',SRC/'specular.png',True)
# KHR_materials_specular samples alpha. Preserve it through Blender export.
links.new(spec.outputs['Alpha'],pbr.inputs['Specular IOR Level'])
mesh.data.materials.append(material)
# Canonical independently editable deform rig, aligned with the original pivots.
rig_data=bpy.data.armatures.new('Anatomical canonical deform rig V5');rig=bpy.data.objects.new('Anatomical_Rig_V5',rig_data);bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
map_names={'pulseR_01':'wrist','handR_02':'wrist'}
heads={'wrist':Vector((0,0,0)),'forearm-bend':Vector((0,0,0))}
parents={}
prefixes=[('thumb','thumb'),('index','index-finger'),('middle','middle-finger'),('ring','ring-finger'),('pinky','pinky-finger')]
for source,target in prefixes:
 def find(prefix):
  return next(k for k in original if k.startswith(prefix))
 if source=='thumb':
  source_keys=[find('thumb_baseR_'),find('thumb_01R_'),find('thumb_02R_'),find('thumb_03R_')]
  targets=['thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-terminal']
  tip_key=find('thumb_03R_end_')
 else:
  source_keys=[find(source+'_baseR_'),find(source+'_01R_'),find(source+'_02R_'),find(source+'_03R_')]
  targets=[target+'-metacarpal',target+'-phalanx-proximal',target+'-phalanx-intermediate',target+'-phalanx-distal']
  tip_key=find(source+'_03R_end_')
 parent='wrist'
 for key,name in zip(source_keys,targets):
  map_names[key]=name;heads[name]=convert(original[key]['position']);parents[name]=parent;parent=name
 tip_name=target+'-tip';heads[tip_name]=convert(original[tip_key]['position']);parents[tip_name]=parent
for name,head in heads.items():
 b=rig_data.edit_bones.new(name);b.head=head;b.tail=head+Vector((0,0,.008));b.roll=0
for name,parent in parents.items():rig_data.edit_bones[name].parent=rig_data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');rig.select_set(False)
bpy.context.view_layer.objects.active=mesh;mesh.select_set(True)
for name in heads:mesh.vertex_groups.new(name=name)
for i,(indices,weights) in enumerate(zip(data['skinIndex'],data['skinWeight'])):
 sums={}
 for index,w in zip(indices,weights):
  if w<=0:continue
  key=data['bones'][index]['name'];name=map_names.get(key,'wrist');sums[name]=sums.get(name,0)+w
 total=sum(sums.values()) or 1
 for name,w in sums.items():mesh.vertex_groups[name].add([i],w/total,'REPLACE')
# Cut the hidden original cap near the wrist and extend its actual boundary.
bm=bmesh.new();bm.from_mesh(mesh.data)
bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.0000001)
cut=.0045
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,cut),plane_no=(0,0,1),clear_outer=True,dist=.0000001)
edges=[e for e in bm.edges if e.is_boundary];boundary=list({v for e in edges for v in e.verts})
# The single wrist loop contains original skin geometry; no hand shape is replaced.
# Density of the cut loop is uneven: use its bounding-box center, not a
# vertex-count-weighted mean, which skewed the old tube by several millimetres.
center=Vector(((min(v.co.x for v in boundary)+max(v.co.x for v in boundary))*.5,
               (min(v.co.y for v in boundary)+max(v.co.y for v in boundary))*.5,cut))
radius_x=(max(v.co.x for v in boundary)-min(v.co.x for v in boundary))*.5
radius_y=(max(v.co.y for v in boundary)-min(v.co.y for v in boundary))*.5

def ease(value):
 value=max(0,min(1,value));return value*value*(3-2*value)
layer=bm.verts.layers.deform.verify();uvlayer=bm.loops.layers.uv.get('UVMap')
wrist=mesh.vertex_groups['wrist'].index;forearm=mesh.vertex_groups['forearm-bend'].index
for v in bm.verts:
 t=max(0,min(1,(v.co.z+.003)/.022));t=t*t*(3-2*t)
 w=v[layer].get(wrist,0)
 if w>0:v[layer][wrist]=w*(1-t);v[layer][forearm]=w*t
old=boundary;lookup={v:i for i,v in enumerate(boundary)}
# Match the wrist rim exactly using the author's own boundary skin colors, then
# continue them onto a new cylindrical forearm atlas (never project nail areas).
source_pixels=list(albedo.image.pixels);iw,ih=albedo.image.size
samples=[];rough_samples=[]
rough_pixels=list(rough.image.pixels)
for edge in edges:
 for face in edge.link_faces:
  for loop in face.loops:
   if loop.vert not in edge.verts:continue
   co=loop.vert.co-center;theta=math.atan2(co.y,co.x)
   u,v=loop[uvlayer].uv
   ix=max(0,min(iw-1,int(u*iw)));iy=max(0,min(ih-1,int(v*ih)))
   rgb=source_pixels[(iy*iw+ix)*4:(iy*iw+ix)*4+3]
   samples.append((theta,rgb))
   rough_samples.append((theta,rough_pixels[(iy*iw+ix)*4+1]))
width,height=256,512
average=[sum(p[1][c] for p in samples)/len(samples) for c in range(3)]
colors=[];rough_colors=[]
rough_average=sum(v for _,v in rough_samples)/len(rough_samples)
for x in range(width):
 theta=(x/(width-1))*2*math.pi-math.pi
 nearest=sorted(samples,key=lambda p:abs(math.atan2(math.sin(theta-p[0]),math.cos(theta-p[0]))))[:3]
 colors.append([sum(p[1][c] for p in nearest)/len(nearest) for c in range(3)])
 near_rough=sorted(rough_samples,key=lambda p:abs(math.atan2(math.sin(theta-p[0]),math.cos(theta-p[0]))))[:3]
 rough_colors.append(sum(v for _,v in near_rough)/len(near_rough))
pixels=[]
for y in range(height):
 t=y/(height-1);fade=min(1,t/.045);fade=fade*fade*(3-2*fade)
 for x in range(width):
  detail=1+.0035*fade*math.sin(x*.71+y*.83)*math.sin(y*.39-x*.13)
  pixels.extend([(colors[x][c]*(1-fade)+average[c]*fade)*detail for c in range(3)]+[1])
forearm_image=bpy.data.images.new('Elena wrist-color continuation / derived atlas',width,height,alpha=True)
forearm_image.colorspace_settings.name='sRGB';forearm_image.pixels.foreach_set(pixels)
forearm_image.filepath_raw=str(SRC/'forearm-continuation.png');forearm_image.file_format='PNG';forearm_image.save();forearm_image.pack()
forearm_material=bpy.data.materials.new('Anatomical_Forearm_V5_AuthoredUV');forearm_material.use_nodes=True
fp=forearm_material.node_tree.nodes.get('Principled BSDF');ft=forearm_material.node_tree.nodes.new('ShaderNodeTexImage');ft.image=forearm_image
forearm_material.node_tree.links.new(ft.outputs['Color'],fp.inputs['Base Color'])
# Continue the boundary's actual roughness as well as color. A constant .72
# roughness next to the author's packed G channel created a visible BRDF seam.
rough_image=bpy.data.images.new('Elena wrist roughness continuation / derived atlas',width,height,alpha=True)
rough_image.colorspace_settings.name='Non-Color'
rough_values=[]
for y in range(height):
 fade=ease((y/(height-1))/.065)
 for x in range(width):
  v=rough_colors[x]*(1-fade)+rough_average*fade
  rough_values.extend([v,v,v,1])
rough_image.pixels.foreach_set(rough_values);rough_image.filepath_raw=str(SRC/'forearm-roughness.png');rough_image.file_format='PNG';rough_image.save();rough_image.pack()
fr=forearm_material.node_tree.nodes.new('ShaderNodeTexImage');fr.image=rough_image
fs=forearm_material.node_tree.nodes.new('ShaderNodeSeparateColor');fs.mode='RGB'
forearm_material.node_tree.links.new(fr.outputs['Color'],fs.inputs['Color'])
forearm_material.node_tree.links.new(fs.outputs['Green'],fp.inputs['Roughness'])
# Source specular map's alpha is opaque: Blender's .5 exports glTF factor1.
fp.inputs['Specular IOR Level'].default_value=.5
mesh.data.materials.append(forearm_material)

# Preserve the exact authored rim. Transition the added surface to an actual
# ellipse within 23mm; old radial extrusion retained the source's box-shaped
# cross section all the way to the elbow. Its 150 angular samples have a maximum
# gap under8degrees, so no topology-changing angular resampling is needed.
ring_distances=[.0012,.0025,.0045,.0075,.011,.016,.023,.032,.044,.060,.080,.105,.135,.170,.210,.255,.305,.360,.410,.460]
ellipse_error=[]
for distance in ring_distances:
 t=distance/.46;blend=ease(distance/.023)
 fill=ease(distance/.24)
 rx=radius_x*(1+.38*fill);ry=radius_y*(1+.34*fill)
 curve_x=.0017*math.sin(t*math.pi)*ease(distance/.07)
 curve_y=-.0012*math.sin(t*math.pi*.7)*ease(distance/.08)
 new=[]
 for vertex in boundary:
  radial=vertex.co-center
  angle=math.atan2(radial.y/radius_y,radial.x/radius_x)
  ellipse=Vector((rx*math.cos(angle),ry*math.sin(angle),0))
  cross=radial*(1-blend)+ellipse*blend
  p=center+Vector((cross.x+curve_x,cross.y+curve_y,distance))
  n=bm.verts.new(p)
  # Continue the source wrist's blend continuously across the material seam.
  # Switching the first added ring straight to100%forearm caused a hard bend.
  influence=ease((p.z+.003)/.022)
  n[layer][wrist]=1-influence;n[layer][forearm]=influence
  new.append(n)
  if blend==1:
   ellipse_error.append(abs(((p.x-center.x-curve_x)/rx)**2+((p.y-center.y-curve_y)/ry)**2-1))
 for edge in edges:
  a,b=[lookup[v] for v in edge.verts];face=bm.faces.new((old[a],old[b],new[b],new[a]))
  face.material_index=1
  phase=[]
  for loop in face.loops:
   co=loop.vert.co-center;angle=math.atan2(co.y,co.x)
   phase.append((angle+math.pi)/(2*math.pi))
  if max(phase)-min(phase)>.5:phase=[u+1 if u<.5 else u for u in phase]
  for loop,u in zip(face.loops,phase):
   loop[uvlayer].uv=(u,max(0,min(1,(loop.vert.co.z-cut)/.46)))
 old=new
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
for edge in bm.edges:edge.smooth=True
for f in bm.faces:f.smooth=True
bm.to_mesh(mesh.data);bm.free();mesh.data.update()
modifier=mesh.modifiers.new('Canonical skin binding','ARMATURE');modifier.object=rig
# Light subdivision preserves the original sculpted silhouette and the authored UV atlas.
sub=mesh.modifiers.new('Editable anatomical smoothing','SUBSURF');sub.levels=1;sub.render_levels=1
while mesh.modifiers.find(sub.name)>0:bpy.ops.object.modifier_move_up(modifier=sub.name)
for p in mesh.data.polygons:p.use_smooth=True
mesh.parent=rig
rig['anatomicalV5']=True;mesh['anatomicalV5']=True
rig['license']='CC-BY-SA-4.0';rig['author']='Elena FF';rig['source']='https://sketchfab.com/3d-models/rigged-hand-eae97cc2a742413cb5338ab942b12c1e'
bpy.context.scene['anatomicalV5']=True
# Save the complete editable mesh cage, UVs, packed images, modifier and bones.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'assets-src/hand-anatomical-v5.blend'))
# Runtime retains the original artist's ~29k-triangle hand resolution.
# The editable .blend keeps subdivision1 for optional offline refinement.
sub.levels=0
mesh.modifiers.remove(sub)
for p in mesh.data.polygons:p.use_smooth=True
if mesh.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/hand-anatomical-v5.glb'),export_format='GLB',export_animations=False,export_apply=False,export_extras=True)
report={'license':'CC-BY-SA-4.0','author':'Elena FF','source':rig['source'],'asset':'public/assets/hand-anatomical-v5.glb','editable':'assets-src/hand-anatomical-v5.blend','generator':'assets-src/convert_anatomical_v5.py','originalVertexCount':len(data['positions']),'vertices':len(mesh.data.vertices),'faces':len(mesh.data.polygons),'bones':list(heads),'sourceToCanonical':map_names,'canonicalHeadsBlender':{k:list(v) for k,v in heads.items()},'canonicalConvention':'glTF arm +Y / fingers -Y / palm thickness X / width Z; Blender arm +Z','uvCorrection':'Original glTF V converted to Blender 1-V; exporter converts back. Authored hand UVs preserved. Added forearm uses a separate derived cylindrical atlas sampled from original wrist boundary colors.','forearmLengthMetres':.46,'forearmCrossSection':'Exact authored rim then real elliptical sections after23mm; bbox-centered, smooth edge normals and continuous new-ring skin weights','forearmRingCount':len(ring_distances),'ellipseEquationMaxError':max(ellipse_error),'forearmBoundarySamples':len(boundary),'forearmBRDFContinuation':'Authored boundary albedo and roughness sampled into separate derivative atlases; glTF specular factor1 matches opaque source specular alpha','middleTipFromWristMetres':heads['middle-finger-tip'].length,'sourceOpenPose':'Three.js evaluated original Open/Close animation at time 0; original vertex identity/UV/skin weights retained.'}
output=ROOT/'public/assets/hand-anatomical-v5.glb';report['sha256']=hashlib.sha256(output.read_bytes()).hexdigest();(ROOT/'assets-src/hand-anatomical-v5-report.json').write_text(json.dumps(report,indent=2)+'\n')
print('ANATOMICAL_REPORT',json.dumps(report))
