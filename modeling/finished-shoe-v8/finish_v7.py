"""Finish the approved V7 shoe, without rebuilding its garment geometry.

Blender 5.2.2 --background --threads 4 --python finish_v7.py
All original vertex coordinates, topology and endpoint keys are verified intact.
"""
import bpy, bmesh, math, sys, json, hashlib, struct
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
P=Path(__file__).resolve().parent;R=P.parents[1]
sys.path.insert(0,str(P))
from surface_tools import Surface,Builder,tube,stone,MORPH

SOURCE=R/'modeling/refined-shoe/soulgrain_onward_refined_v7.blend'
SOURCE_HASH='d1ed797ba3bc93b9335100c0bac9bf8e4522e11bd6436c3a2544decb4f58443e'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_HASH
bpy.ops.wm.open_mainfile(filepath=str(SOURCE));bpy.context.preferences.filepaths.save_version=0
original=[o for o in bpy.context.scene.objects if o.type=='MESH']
def geometry_digest(o):
 h=hashlib.sha256()
 for v in o.data.vertices:h.update(struct.pack('<fff',*v.co))
 for p in o.data.polygons:h.update(struct.pack('<'+'I'*len(p.vertices),*p.vertices))
 if o.data.shape_keys:
  for k in o.data.shape_keys.key_blocks:
   for v in k.data:h.update(struct.pack('<fff',*v.co))
 return h.hexdigest()
before={o.name:geometry_digest(o) for o in original}
shaft=bpy.data.objects['Convertible_Shaft'];tongue=bpy.data.objects['Convertible_Tongue']
outer=Surface(shaft,['Body_Canvas','Body_Inner_Canvas','Collar_Outer_Canvas'])
inside=Surface(shaft,['Collar_Canvas'])
reverse=Surface(tongue,['Tongue_Reverse_Canvas'])
front=Surface(tongue,['Tongue_Canvas'])
print('V7 surfaces indexed',flush=True)

def lin(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def color(hex):return tuple(lin(int(hex[i:i+2],16)/255) for i in [0,2,4])+(1,)
def mat(name,hex='ffffff',rough=.7,metal=0):
 m=bpy.data.materials.get(name) or bpy.data.materials.new(name);m.use_nodes=True
 b=m.node_tree.nodes.get('Principled BSDF');c=color(hex);m.diffuse_color=c
 for link in list(b.inputs['Base Color'].links):m.node_tree.links.remove(link)
 b.inputs['Base Color'].default_value=c;b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
 return m
def artwork(m,filename):
 image=bpy.data.images.load(str(P/filename),check_existing=True);image.colorspace_settings.name='sRGB'
 image.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;tex.extension='REPEAT';tex.label='Supplied artwork · unchanged image'
 m.node_tree.links.new(tex.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 return image

for name in ['Body_Canvas','Body_Inner_Canvas']:
 artwork(mat(name), 'references/02-body-print.jpg')
for name in ['Collar_Canvas','Collar_Outer_Canvas']:
 artwork(mat(name,rough=.6),'textures/cuff-reconstructed.png')
for name in ['Tongue_Canvas','Tongue_Reverse_Canvas']:
 artwork(mat(name,rough=.83),'textures/tongue-velvet-reconstructed.png' if name=='Tongue_Reverse_Canvas' and (P/'textures/tongue-velvet-reconstructed.png').exists() else 'references/07-tongue-front-back.jpg')
for name in ['Rubber_Toe','Rubber_Foxing','Rubber_Outsole']:mat(name,'eee7d8',.72)
mat('Laces','eee4cf',.88);mat('Eyelets','b8b6ae',.25,.84)
artwork(mat('Heel_Strip',rough=.43),'references/04-heel-leather.jpg')
mat('Canvas_Trim','b51b2c',.6);mat('Stitching','e5d6bb',.88);mat('Inner_Lining','13253c',.94)
red=mat('Red_Rubber_Piping','bd152b',.5)
navy=mat('Foxing_Navy_Stripe','122b42',.64)
silver=mat('Hardware_Silver','b9b7b0',.24,.88)
cord=mat('Clasp_Cream_Cord','e9dfc9',.8)
crystal=mat('Rhinestone_Silver','edece7',.18,.68)
pearls=mat('Border_Studs','f1eadb',.22,.34)
aglet=mat('Aglet_Artwork',rough=.38);artwork(aglet,'references/06-aglet-artwork.jpg')
badge=mat('Heel_Logo',rough=.72);artwork(badge,'references/09-heel-logo.jpg')
border=mat('Cuff_Border',rough=.75);artwork(border,'references/01-overall.jpg')
button=mat('Clasp_Engraved_Head',rough=.3,metal=.72);artwork(button,'references/01-overall.jpg')

# The instep under the folded flap is printed blue canvas in the reference.
bpy.data.objects['Original_Vamp'].data.materials[0]=bpy.data.materials['Body_Canvas']
tongue.data.materials.append(bpy.data.materials['Body_Canvas'])
for poly in tongue.data.polygons:
 if sum(tongue.data.uv_layers.active.data[i].uv.y for i in poly.loop_indices)/len(poly.loop_indices)<.46:
  poly.material_index=len(tongue.data.materials)-1
# Re-UV only; never move an original vertex or shape-key position.
for o in original:
 uv=o.data.uv_layers.active
 if not uv:continue
 for poly in o.data.polygons:
  name=o.data.materials[poly.material_index].name
  for li in poly.loop_indices:
   p=o.data.vertices[o.data.loops[li].vertex_index].co
   old=uv.data[li].uv.copy();s,t=old
   if o.name=='Original_Vamp':
    uv.data[li].uv=((p.x+.095)/.19,(p.y-.0065)/.19+.35)
   elif o==tongue and name=='Body_Canvas':
    uv.data[li].uv=((s-.5)*.065/.19+.68,t/.46*.06/.19+.10)
   elif name in ['Body_Canvas','Body_Inner_Canvas']:
    uv.data[li].uv=((p.x+.095)/.19,p.z/.19-.03)
   elif name in ['Collar_Canvas','Collar_Outer_Canvas']:
    uv.data[li].uv=(s*1.75,(t-.38)*1.65)
   elif o==tongue and name=='Tongue_Canvas':
    # Interior of the exact left panel; keep the supplied Mongolian glyphs.
    q=max(0,min(1,(t-.46)/.54));y=766-q*628;left=280-70*q;right=500+62*q
    # In the front view (-X), screen-right is -Y. Reverse s here so the
    # supplied letters read in their original orientation, never mirrored.
    uv.data[li].uv=((left+15+(1-s)*(right-left-30))/1280,1-y/853)
   elif o==tongue and name=='Tongue_Reverse_Canvas':
    # Blank purple cloth below the printed diagram's medallion. The actual
    # medallion is reconstructed as separate stones, not baked into this map.
    uv.data[li].uv=(s*1.3,t*4) if (P/'textures/tongue-velvet-reconstructed.png').exists() else ((801+s*198)/1280,1-(745-t*190)/853)

# Existing moulded lip receives the red rubber accent; no silhouette edits.
bpy.data.objects['Rubber_Foxing_Moulded_Lip'].data.materials[0]=red

def collision_tree(objects,allowed=None):
 vs=[];fs=[]
 for o in objects:
  mesh=o.data;mesh.calc_loop_triangles();offset=len(vs);vs.extend(v.co.copy() for v in mesh.vertices)
  for tr in mesh.loop_triangles:
   if allowed is None or mesh.materials[tr.material_index].name in allowed:fs.append(tuple(offset+i for i in tr.vertices))
 return BVHTree.FromPolygons(vs,fs,all_triangles=True)
body=bpy.data.objects['Shoe_Body']
lower_tree=collision_tree([body,shaft],{'Body_Canvas','Body_Inner_Canvas','Rubber_Foxing','Rubber_Outsole','Rubber_Toe'})
body_tree=collision_tree([body])
def hit_y(x,z):
 p,n,_,_=lower_tree.ray_cast(Vector((x,-.3,z)),Vector((0,1,0)))
 if p is None:p,n,_,_=lower_tree.find_nearest(Vector((x,-.035,z)))
 if n.y>0:n=-n
 return p,n.normalized()
def hit_heel(y,z):
 p,n,_,_=lower_tree.ray_cast(Vector((.4,y,z)),Vector((-1,0,0)))
 if p is None:p,n,_,_=lower_tree.find_nearest(Vector((.13,y,z)))
 return p,Vector((1,0,0))

def grid_patch(builder,rows,cols,fn,uvfn,matindex=0,up=None):
 vs=[];ups=[];fs=[];uvs=[]
 for j in range(rows+1):
  for i in range(cols+1):
   a=i/cols;b=j/rows;vs.append(fn(a,b));ups.append(up(a,b) if up else vs[-1])
 for j in range(rows):
  for i in range(cols):
   f=(j*(cols+1)+i,j*(cols+1)+i+1,(j+1)*(cols+1)+i+1,(j+1)*(cols+1)+i)
   fs.append(f);uvs.append([uvfn(k%(cols+1)/cols,k//(cols+1)/rows) for k in f])
 builder.add(vs,fs,uvs,matindex,ups)

# A real narrow heel leather panel conformed to the lower quarter, under cuff.
heel=Builder('Finished_Heel_Leather',[bpy.data.materials['Heel_Strip']])
def hp(a,b):
 p,n=hit_heel(.0065+(a-.5)*.014,.007+b*.095)
 return p+n*.00045
grid_patch(heel,60,12,hp,lambda a,b:((86+a*454)/590,1-(1054-b*832)/1280))
heel_obj=heel.finish();heel_obj['estimated']='Width and stitch allowance estimated from overall reference; rear view not supplied.'
# Actual cream stitches on both leather margins.
sew=Builder('Heel_Leather_Stitching',[bpy.data.materials['Stitching']])
for a in [.035,.965]:
 for j in range(34):
  points=[hp(a,(j+.10)/34)+Vector((.00012,0,0)),hp(a,(j+.63)/34)+Vector((.00012,0,0))]
  vs,fs,uvs=tube(points,.00013,6);sew.add(vs,fs,uvs)
sew.finish()

# Navy foxing stripe follows real radial sections of the source rubber wall.
stripe=Builder('Finished_Foxing_Stripe',[navy])
def stripe_p(a,b):
 direction=Vector((math.cos(a*math.tau),math.sin(a*math.tau),0));z=-.0092+b*.0029
 center=Vector((0,.0065,z));p,n,_,_=body_tree.ray_cast(center+direction*.5,-direction)
 return p+direction*.00055 if p is not None else center+direction*.045
grid_patch(stripe,10,320,stripe_p,lambda a,b:(a,b));stripe_obj=stripe.finish()
bm=bmesh.new();bm.from_mesh(stripe_obj.data)
bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.calc_center_median().x<-.086],context='FACES')
bm.to_mesh(stripe_obj.data);bm.free()

# Printed heel badge follows the rubber, rather than floating behind the shoe.
logo=Builder('Finished_Heel_Logo',[badge])
def logo_p(a,b):
 p,n=hit_heel(.0065+(a-.5)*.045,-.0114+b*.0143);return p+n*.0012
grid_patch(logo,6,32,logo_p,lambda a,b:((14+a*1252)/1280,1-(543-b*399)/640))
logo.finish()

# Two blue/ivory artwork sleeves with separate metal rims and rounded caps.
tips=Builder('Finished_Lace_Aglets',[aglet,silver])
for end in [Vector((-.036,-.0385,.013)),Vector((-.045,.0515,.019))]:
 axis=Vector((.001,0,.008)).normalized();a=Vector((0,-1,0));b=axis.cross(a).normalized();length=.023
 # Main cylinder, UV matches the supplied unfolded artwork.
 vs=[];fs=[];uvs=[]
 for j in range(25):
  t=j/24
  for k in range(33):vs.append(end+axis*(length*t)+.00245*(a*math.cos(k*math.tau/32)+b*math.sin(k*math.tau/32)))
 for j in range(24):
  for k in range(32):
   fs.append((j*33+k,j*33+k+1,(j+1)*33+k+1,(j+1)*33+k))
   uvs.append([((u+.25)%1,1-(1212-v*1190)/1280) for u,v in [(k/32,j/24),((k+1)/32,j/24),((k+1)/32,(j+1)/24),(k/32,(j+1)/24)]])
 tips.add(vs,fs,uvs)
 for start,stop in [(.96,1.02),(.225,.263)]:
  points=[end+axis*(length*start),end+axis*(length*stop)]
  v,f,u=tube(points,.00254,32);tips.add(v,f,u,1)
 # Hemisphere below the ivory band; closes the cylinder with real geometry.
 v=[];f=[]
 for j in range(9):
  theta=j/8*math.pi/2;rad=.00245*math.cos(theta);h=-.00245*math.sin(theta)
  for k in range(32):v.append(end+axis*h+rad*(a*math.cos(k*math.tau/32)+b*math.sin(k*math.tau/32)))
 for j in range(8):
  for k in range(32):f.append((j*32+k,j*32+(k+1)%32,(j+1)*32+(k+1)%32,(j+1)*32+k))
 tips.add(v,f,material=1)
tips.finish()

# Source-derived stones, individually faceted but merged into one draw object.
data=json.loads((P/'rhinestone-points.json').read_text());diamonds=Builder('Tongue_Rhinestone_Medallion',[crystal],True)
for record in data['stones']:
 # v is nonuniform in physical arc length on the returning tongue. A compact
 # .14 range here gives a near-circular 44mm medallion, not a long UV oval.
 s=.5+(record['x']-627)/1254*.68;t=.81+(627-record['y'])/1254*.14
 frames=[]
 for pose in [0,1]:
  p,a,b,n=reverse.frame(s,t,pose);frames.append((p+n*.00007,a,b,n))
 radius=max(.00030,min(.00052,record['radius_px']*.000038))
 vs,fs=stone(frames[0],radius,.00038);up,_=stone(frames[1],radius,.00038)
 diamonds.add(vs,fs,upright=up,smooth=False)
gem_obj=diamonds.finish();gem_obj['rhinestones']=len(data['stones']);gem_obj['layout_source']='User reference 08, raster centre readings'
studs=Builder('Tongue_Border_Studs',[pearls],True)
stations=[(.11,.70+i*.019) for i in range(13)]+[(.89,.70+i*.019) for i in range(13)]+[(.17+i*.066,.941) for i in range(11)]
for s,t in stations:
 f=[]
 for pose in [0,1]:
  p,a,b,n=reverse.frame(s,t,pose);f.append((p+n*.00007,a,b,n))
 v,fs=stone(f[0],.00080,.00055,12);up,_=stone(f[1],.00080,.00055,12)
 studs.add(v,fs,upright=up)
studs.finish()

# Two strips of the actual meander border from the overall reference.
trim=Builder('Cuff_Artwork_Borders',[border],True)
for vc in [.513,.975]:
 def pos(a,b,pose=0):
  p,n=inside.sample(a,vc+(b-.5)*.019,pose);return p+n*.00010
 def border_uv(a,b):
  u=(a*2)%1
  # Crop is a tilted quadrilateral in the original image; no art regenerated.
  x=828+u*333+(b-.5)*2;y=230-u*77+(b-.5)*10
  return x/1280,1-y/895
 grid_patch(trim,2,240,lambda a,b:pos(a,b,0),border_uv,up=lambda a,b:pos(a,b,1))
trim.finish()

# Visible clasp construction is estimated from the one supplied side photo.
# Buttons stay on the shoe. The cuff loops release and travel with the cuff
# in the upright pose; they are not stretched into impossible long fasteners.
cords=Builder('Mongolian_Clasp_Loops',[cord,bpy.data.materials['Stitching']],True)
heads=Builder('Mongolian_Clasp_Heads',[button,silver])
for index,(su,tv,hx,hz) in enumerate([(.16,.73,.035,.059),(.16,.88,.046,.036)]):
 body_p,body_n=hit_y(hx,hz);A=body_p+body_n*.0016
 B,a0,b0,n0=inside.frame(su,tv,0);B=B+n0*.0013
 U,a1,b1,n1=inside.frame(su,tv,1);U=U+n1*.0013
 def lifted(p):
  d=p-B;return U+a1*d.dot(a0)+b1*d.dot(b0)+n1*d.dot(n0)
 axis=(B-A).normalized();side=body_n.cross(axis).normalized()
 # Paired, gently draped cords; small bow clears the layered textile.
 for sign in [-1,1]:
  points=[]
  for j in range(49):
   t=j/48;p=A.lerp(B,t)+side*(sign*.0017)+Vector((0,-.0010*math.sin(math.pi*t),0))
   points.append(p)
  v,f,u=tube(points,.00080,10);up,_,_=tube([lifted(p) for p in points],.00080,10)
  cords.add(v,f,u,upright=up)
 # Stitched rectangular cuff tab, a formed cloth patch rather than a box.
 along=(B-A).normalized();patch_v=[]
 for j in range(5):
  for k in range(5):patch_v.append(B+along*((j/4-.3)*.0075)+side*((k/4-.5)*.006)+n0*(.00045+.00015*math.sin(k*math.pi/4)))
 patch_f=[(j*5+k,j*5+k+1,(j+1)*5+k+1,(j+1)*5+k) for j in range(4) for k in range(4)]
 cords.add(patch_v,patch_f,upright=[lifted(p) for p in patch_v])
 for sign in [-1,1]:
  for j in range(5):
   points=[B+along*((j/5-.3)*.0075)+side*(sign*.0025)+n0*.00075,B+along*(((j+.6)/5-.3)*.0075)+side*(sign*.0025)+n0*.00075]
   v,f,u=tube(points,.00012,6);up,_,_=tube([lifted(p) for p in points],.00012,6);cords.add(v,f,u,1,up)
 # Lens-shaped, rolled metal head; photo detail on its actual curved face.
 p=A+body_n*.0001;right=Vector((1,0,0));vertical=body_n.cross(right).normalized()
 radius=.0044;v=[];f=[];uv=[]
 for j in range(9):
  rr=radius*j/8;h=.00165*(1-(j/8)**2)
  for k in range(48):
   angle=math.tau*k/48;v.append(p+right*(rr*math.cos(angle))+vertical*(rr*math.sin(angle))+body_n*h)
 for j in range(8):
  for k in range(48):
   face=(j*48+k,j*48+(k+1)%48,(j+1)*48+(k+1)%48,(j+1)*48+k);f.append(face);coords=[]
   for idx in face:
    row=idx//48;angle=(idx%48)*math.tau/48;r=row/8
    coords.append(((833+r*21*math.cos(angle))/1280,1-(446-r*21*math.sin(angle))/895))
   uv.append(coords)
 heads.add(v,f,uv)
 ring=[p+right*(radius*math.cos(k*math.tau/64))+vertical*(radius*math.sin(k*math.tau/64)) for k in range(65)]
 v,f,u=tube(ring,.00033,8);heads.add(v,f,u,1)
cords.finish();heads.finish()

assert before=={o.name:geometry_digest(o) for o in original},'Original V7 geometry was changed'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==SOURCE_HASH
scene=bpy.context.scene;scene['finish']='V8 finished reference appearance; V7 garment unchanged; artwork from supplied files; reconstructed fabric repeat and estimated accessory dimensions.'
scene['clasp_pose']='Folded fastened / upright released cuff loops; discrete design poses, not physical cloth simulation.'
for image in bpy.data.images:
 if image.size[0]>0 and not image.packed_file:
  try:image.pack()
  except RuntimeError:pass
models=[o for o in scene.objects if o.type=='MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in models:o.select_set(True)
bpy.context.view_layer.objects.active=body
out=R/'public/assets/soulgrain_onward_finished_v8.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_apply=False,export_extras=True,export_texcoords=True,export_morph=True,export_morph_normal=True)
# Open the editable project in material preview, so it presents the finished
# surface rather than the old solid-grey viewport. All images are packed.
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.shading.type='MATERIAL'
   area.spaces.active.region_3d.view_location=Vector((0,.0065,.075))
   area.spaces.active.region_3d.view_distance=.43
   area.spaces.active.region_3d.view_rotation=(-Vector((-.82,-1,.45))).to_track_quat('-Z','Y')
bpy.ops.wm.save_as_mainfile(filepath=str(P/'soulgrain_onward_finished_v8.blend'),compress=True)
(P/'geometry-preservation.json').write_text(json.dumps({'base_blend_sha256':SOURCE_HASH,'original_geometry_unchanged':True,'original_objects':before,'rhinestone_count':len(data['stones']),'output_glb_bytes':out.stat().st_size},indent=2))
print('V8_READY',out.stat().st_size,'bytes',len(models),'meshes',flush=True)
