"""Read a new, fused reference shoe without reshaping it; derive editable surface regions.

Blender 5.2.2:
  blender --background --factory-startup --python segment_base.py -- \
    --source /tmp/onward-new-source/already.glb \
    --output /tmp/onward-new-source/segmented.blend --render

Every original triangle surface is retained exactly once. Boundary triangles may be
locally subdivided into coplanar triangles to avoid jagged colour outlines. No source
vertex is moved; source vertex/face indices remain as mesh attributes.
Region outlines are spatial design masks estimated from this specific shoe, not
claims of recovered factory patterns or original separate construction components.
"""
from __future__ import annotations
import argparse, hashlib, json, math, sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Matrix, Vector

SOURCE_SHA256 = '43653b568a738b04513ca34dd0a23025f6f03072e7c20aa962581e4d400e2d80'
REGIONS = [
 ('Body_Canvas',(.03,.24,.61)),('Rubber_Midsole',(.88,.82,.63)),
 ('Rubber_Toe',(.40,.51,.56)),('Toe_Cap',(.93,.94,.97)),
 ('Sole_Stripe',(.04,.07,.15)),('Outsole',(.12,.11,.10)),
 ('Eyestay_Canvas',(.04,.62,.75)),('Collar_Outer_Canvas',(.12,.55,.18)),
 ('Collar_Lining',(.15,.22,.10)),('Collar_Red_Piping',(.75,.02,.05)),
 ('Tongue_Reverse_Canvas',(.48,.06,.70)),('Tongue_Canvas',(.84,.27,.69)),
 ('Laces',(.98,.50,.06)),('Metal_Eyelets',(.52,.56,.62)),
 ('Vent_Eyelets',(.52,.56,.62)),
]
RID={name:i for i,(name,_) in enumerate(REGIONS)}


def interp(x, xp, fp):
 return np.interp(x, xp, fp)


def classify(points, normals):
 """Face-centroid masks follow the visible toe seam, throat and curved cuff hem."""
 x,y,z=points.T; nx,ny,nz=normals.T; ay=np.abs(y)
 result=np.full(len(x),RID['Body_Canvas'],np.int32)
 # The top edge of the foxing rises toward the rounded toe; it is not a
 # horizontal box mask. The diamond moulding belongs to the toe bumper.
 foxing=.0325+.012*np.clip((-.057-x)/.09,0,1)
 sole=z<foxing
 result[sole]=RID['Rubber_Midsole']
 result[sole&(x<-.063)]=RID['Rubber_Toe']
 result[sole&(z<.0012)&(nz<-.65)]=RID['Outsole']
 stripe=.0166+.0013*np.clip((x-.05)/.10,0,1)
 # The narrow blue side stripe is an added conforming ribbon in the finish
 # step; a centroid colour mask on long source triangles would look jagged.
 # The cap's rear edge runs back on both sides and forward across its crown.
 toe_join=-.110+.047*np.clip(ay/.051,0,1.18)**1.8
 result[(~sole)&(x<toe_join)&(z<.062)]=RID['Toe_Cap']
 # Follow the sweeping lacing/throat line rather than adding a straight band.
 throat=interp(x,[-.105,-.09,-.073,-.056,-.039,-.021,0,.022,.040],
                   [.044,.056,.061,.067,.069,.081,.103,.123,.136])
 band=(~sole)&(x>-.108)&(x<.044)&(z>throat-.010)&(z<throat+.0035)&(ay>.019)
 result[band]=RID['Eyestay_Canvas']
 # Cuff lower outline descends diagonally then turns toward the heel.
 hem=interp(x,[.014,.025,.038,.050,.061,.067,.080,.100,.125,.153],
                 [.126,.111,.093,.074,.055,.051,.055,.064,.070,.074])
 cuff=(x>.013)&(z>hem-.0006)&(z>.049)
 result[cuff]=RID['Collar_Outer_Canvas']
 radial=nx*(x-.074)+ny*y
 result[cuff&(radial<-.008)&(z>.090)]=RID['Collar_Lining']
 # Narrow existing lip surfaces; these do not add or move geometry.
 piping=cuff&(np.abs(z-hem)<.0016)&(ay>.020)
 result[piping]=RID['Collar_Red_Piping']
 # The folded tongue is the high central sheet in front of the cuff.
 tongue_profile=interp(x,[-.061,-.050,-.040,-.030,-.020,-.010,0,.010,.020,.029],
                         [.069,.075,.081,.089,.098,.109,.124,.138,.145,.140])
 tongue_width=interp(x,[-.061,-.050,-.025,0,.018,.028,.032],[.017,.034,.041,.041,.040,.030,.024])
 tongue=(x>-.060)&(x<.032)&(ay<tongue_width)&(z>tongue_profile-.0065-.016*(ay/.035)**2)&(z>.064)
 tongue &= (~cuff)|((ay<tongue_width)&(x<.030))
 # The near-root wedge belongs to the same uninterrupted tongue sheet. Extend
 # only canvas/eyestay pixels here; never consume the green cuff body.
 root_patch=(x>-.004)&(x<.032)&(ay<.048)&(z>.105+.8*x)&(~cuff)
 root_patch &= (result==RID['Body_Canvas'])|(result==RID['Eyestay_Canvas'])
 tongue |= root_patch
 result[tongue]=RID['Tongue_Reverse_Canvas']
 tongue_slope=interp(x,[-.061,-.050,-.040,-.030,-.020,-.010,0,.010,.020,.029],
                      [.4,.6,.7,.85,1.0,1.3,1.55,1.0,-.2,-.7])
 outward=nz-tongue_slope*nx+(.032*y/.035**2)*ny
 result[tongue&(outward<-.50)]=RID['Tongue_Canvas']
 # Forefoot lace bridges are a limited raised central field. Behind them the
 # large folded tongue occludes most lacing and remains its own region.
 lace_profile=interp(x,[-.099,-.091,-.084,-.078,-.071,-.065,-.059,-.050],
                       [.052,.058,.059,.061,.066,.066,.070,.074])
 bridges=np.zeros(len(x),bool)
 for centre,width,slant in [(-.086,.0040,-.0022),(-.070,.0040,.0020),(-.0565,.0034,-.0014)]:
  bridges |= np.abs(x-centre-slant*np.sin(y/.027*math.pi/2))<width
 laces=bridges&(x>-.096)&(x<-.050)&(ay<.027)&(z>lace_profile-.0020)&(~tongue)&(~sole)
 result[laces]=RID['Laces']
 # Real raised rings: local circular masks around observed eyelet centres.
 # Masks do not label the surrounding cloth or invent through-holes.
 cuff_centres=[(.0365,.1210),(.0453,.1058),(.0541,.0900),(.0630,.0748)]
 for cx,cz in cuff_centres:
  r=np.sqrt(((x-cx)/1.03)**2+((z-cz)/.98)**2)
  ring=(r<.0050)&(r>.00135)&(ay>.032)&cuff
  result[ring]=RID['Metal_Eyelets']
 for cx,cz in [(.0222,.0424),(.0568,.0407)]:
  r=np.sqrt((x-cx)**2+(z-cz)**2)
  result[(r<.00445)&(r>.00135)&(ay>.030)&(~sole)&(~cuff)]=RID['Vent_Eyelets']
 return result


def refine_boundaries(positions, normals, faces, tolerance=.00035):
 """Split only crossed material boundaries, never alter the source surface.

 New positions are edge midpoints on the original triangles. Custom smooth
 normals interpolate from the original vertices. Per-source-face area is
 verified independently after splitting, so this is not remeshing/smoothing.
 """
 source_count=len(positions)
 original_area=np.linalg.norm(np.cross(positions[faces[:,1]]-positions[faces[:,0]],positions[faces[:,2]]-positions[faces[:,0]]),axis=1)*.5
 active=faces.copy();parents=np.arange(len(faces),dtype=np.int32)
 output=[];parent_output=[]
 for depth in range(9):
  labels=classify(positions,normals)
  vl=labels[active];cc=classify(positions[active].mean(1),normals[active].mean(1))
  edge=np.maximum.reduce([np.linalg.norm(positions[active[:,0]]-positions[active[:,1]],axis=1),np.linalg.norm(positions[active[:,1]]-positions[active[:,2]],axis=1),np.linalg.norm(positions[active[:,2]]-positions[active[:,0]],axis=1)])
  crossed=(np.any(vl!=vl[:,0,None],axis=1)|(cc!=vl[:,0]))&(edge>tolerance)
  output.append(active[~crossed]);parent_output.append(parents[~crossed])
  if not np.any(crossed):break
  split=active[crossed];pr=parents[crossed]
  edges=np.stack([split[:,[0,1]],split[:,[1,2]],split[:,[2,0]]],axis=1).reshape(-1,2);edges.sort(axis=1)
  unique,inverse=np.unique(edges,axis=0,return_inverse=True)
  start=len(positions);mid=(positions[unique[:,0]]+positions[unique[:,1]])*.5
  mn=normals[unique[:,0]]+normals[unique[:,1]];mn/=np.maximum(np.linalg.norm(mn,axis=1,keepdims=True),1e-12)
  positions=np.vstack([positions,mid]);normals=np.vstack([normals,mn]);mi=(inverse+start).reshape(-1,3)
  active=np.stack([np.c_[split[:,0],mi[:,0],mi[:,2]],np.c_[mi[:,0],split[:,1],mi[:,1]],np.c_[mi[:,2],mi[:,1],split[:,2]],np.c_[mi[:,0],mi[:,1],mi[:,2]]],axis=1).reshape(-1,3)
  parents=np.repeat(pr,4)
 else:
  output.append(active);parent_output.append(parents)
 faces=np.vstack(output);parents=np.concatenate(parent_output)
 areas=np.linalg.norm(np.cross(positions[faces[:,1]]-positions[faces[:,0]],positions[faces[:,2]]-positions[faces[:,0]]),axis=1)*.5
 coverage=np.bincount(parents,weights=areas,minlength=len(original_area))
 error=float(np.max(np.abs(coverage-original_area)))
 assert error<1e-9,('Source surface area changed',error)
 assert len(np.unique(parents))==len(original_area)
 print('BOUNDARY_SUBDIVISION',len(positions)-source_count,'new points',len(faces),'triangles; max source face area error',error,flush=True)
 return positions,normals,faces,parents,{'new_boundary_points':len(positions)-source_count,'boundary_tolerance_m':tolerance,'max_source_face_area_error_m2':error,'source_faces_all_covered':True}


def make_uv(name, p):
 """UVs are continuous within each original face; no geometry is displaced."""
 x,y,z=p.T
 if name.startswith('Collar_'):
  u=(np.arctan2(y,x-.074)+math.pi)/(2*math.pi)
  v=(z-.047)/.103
 elif name.startswith('Tongue_'):
  # Normalized U across the tongue and V from its low front end to high root.
  u=(y-y.min())/max(float(np.ptp(y)),1e-7)
  v=(x-x.min())/max(float(np.ptp(x)),1e-7)
 elif name in {'Rubber_Midsole','Sole_Stripe','Outsole','Rubber_Toe'}:
  u=(np.arctan2(y,x)+math.pi)/(2*math.pi)
  v=z/.036
 elif name=='Laces':
  u=(y+.03)/.06;v=(x+.10)/.06
 else:
  u=(x+.15)/.30;v=z/.15
 return np.c_[u,v].astype(np.float32)


def studio(out):
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.device='CPU';s.cycles.samples=20;s.cycles.use_denoising=True
 s.render.resolution_x=1100;s.render.resolution_y=800;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.film_transparent=False
 s.world=bpy.data.worlds.new('Segmentation inspection');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.11,.13,.17,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.6
 s.view_settings.view_transform='AgX'
 for pos,power,size in [((-.2,-.3,.55),32,.35),((.25,.15,.4),24,.3),((-.3,.3,.22),16,.25)]:
  data=bpy.data.lights.new('Debug softbox','AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(data.name,data);s.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,.07))-o.location).to_track_quat('-Z','Y').to_euler()
 data=bpy.data.cameras.new('Segmentation camera');cam=bpy.data.objects.new(data.name,data);s.collection.objects.link(cam);s.camera=cam;data.type='ORTHO';data.ortho_scale=.365
 for name,position in [('side-negative',(0,-.6,.125)),('three-quarter',(-.42,-.48,.28)),('top',(-.02,-.001,.6))]:
  cam.location=position;cam.rotation_euler=(Vector((0,0,.07))-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)


def main():
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 ap=argparse.ArgumentParser();ap.add_argument('--source',default='/tmp/onward-new-source/already.glb');ap.add_argument('--output',default='/tmp/onward-new-source/segmented.blend');ap.add_argument('--preview-dir',default='/tmp/onward-new-source/segmentation');ap.add_argument('--render',action='store_true');a=ap.parse_args(args)
 source=Path(a.source);output=Path(a.output);out=Path(a.preview_dir);out.mkdir(parents=True,exist_ok=True);output.parent.mkdir(parents=True,exist_ok=True)
 assert hashlib.sha256(source.read_bytes()).hexdigest()==SOURCE_SHA256,'Unexpected base asset; inspect before applying this shoe-specific segmentation.'
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(source));objects=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert len(objects)==1
 original=objects[0];mesh=original.data
 positions=np.empty(len(mesh.vertices)*3,np.float32);mesh.vertices.foreach_get('co',positions);positions=positions.reshape(-1,3)
 matrix=np.array(original.matrix_world,dtype=np.float64);positions=(positions@matrix[:3,:3].T+matrix[:3,3]).astype(np.float32)
 lo=positions.min(0);hi=positions.max(0);offset=np.array([(lo[0]+hi[0])*.5,(lo[1]+hi[1])*.5,lo[2]])
 scale=.30/(hi[0]-lo[0]);positions=((positions-offset)*scale).astype(np.float32)
 corner_normals=np.empty(len(mesh.corner_normals)*3,np.float32);mesh.corner_normals.foreach_get('vector',corner_normals);corner_normals=corner_normals.reshape(-1,3)
 # GLB supplies a single smooth normal per source vertex; read actual custom
 # corner normals instead of Blender's independently recomputed vertex normal.
 vertex_normals=np.zeros((len(mesh.vertices),3),np.float32);loop_indices=np.empty(len(mesh.loops),np.int32);mesh.loops.foreach_get('vertex_index',loop_indices);vertex_normals[loop_indices]=corner_normals
 vertex_normals=vertex_normals@np.linalg.inv(matrix[:3,:3]);vertex_normals/=np.maximum(np.linalg.norm(vertex_normals,axis=1,keepdims=True),1e-12)
 faces=np.empty(len(mesh.loops),np.int32);mesh.loops.foreach_get('vertex_index',faces);faces=faces.reshape(-1,3);assert len(faces)==765646 and len(positions)==382667
 source_vertex_count=len(positions);source_triangle_count=len(faces)
 positions,vertex_normals,faces,face_parents,subdivision=refine_boundaries(positions,vertex_normals,faces)
 centre=positions[faces].mean(1);normals=vertex_normals[faces].mean(1);region=classify(centre,normals)
 collection=bpy.data.collections.new('NEW_SOURCE_BASE_SURFACES');bpy.context.scene.collection.children.link(collection)
 records=[];total=0
 for i,(name,color) in enumerate(REGIONS):
  selected=np.flatnonzero(region==i);sf=faces[selected]
  if not len(sf):continue
  ids,inverse=np.unique(sf,return_inverse=True);vp=positions[ids];fp=inverse.reshape(-1,3)
  data=bpy.data.meshes.new(name+'_source_triangles');data.from_pydata(vp.tolist(),[],fp.tolist());data.update()
  for poly in data.polygons:poly.use_smooth=True
  data.normals_split_custom_set_from_vertices(vertex_normals[ids].tolist())
  loop_vid=np.empty(len(data.loops),np.int32);data.loops.foreach_get('vertex_index',loop_vid)
  uv=make_uv(name,vp);loop_uv=uv[loop_vid].copy()
  # Unwrap circumferential seam per face, not by stretching across U=0/1.
  if name.startswith('Collar_') or name in {'Rubber_Midsole','Sole_Stripe','Outsole','Rubber_Toe'}:
   u=loop_uv[:,0].reshape(-1,3);wrap=np.ptp(u,axis=1)>.5;u[wrap]=np.where(u[wrap]<.5,u[wrap]+1,u[wrap])
  data.uv_layers.new(name='UVMap').data.foreach_set('uv',loop_uv.ravel())
  data.attributes.new('source_vertex_index','INT','POINT').data.foreach_set('value',np.where(ids<source_vertex_count,ids,-1).astype(np.int32))
  data.attributes.new('source_face_index','INT','FACE').data.foreach_set('value',face_parents[selected].astype(np.int32))
  mat=bpy.data.materials.new(name);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.64;mat.diffuse_color=(*color,1)
  if 'Eyelets' in name:bs.inputs['Metallic'].default_value=.8;bs.inputs['Roughness'].default_value=.28
  data.materials.append(mat);obj=bpy.data.objects.new(name,data);collection.objects.link(obj);obj['source']='already.glb';obj['region_method']='spatial outline mask; original surface retained, boundary-only coplanar subdivision';obj['source_sha256']=SOURCE_SHA256
  records.append({'name':name,'vertices':len(ids),'triangles':len(sf),'bounds':[vp.min(0).tolist(),vp.max(0).tolist()],'uv_bounds':[uv.min(0).tolist(),uv.max(0).tolist()]});total+=len(sf)
 bpy.data.objects.remove(original,do_unlink=True)
 if mesh.users==0:bpy.data.meshes.remove(mesh)
 for obj in list(bpy.data.objects):
  if obj.type=='EMPTY':bpy.data.objects.remove(obj,do_unlink=True)
 assert total==len(faces)
 result={'source':str(source),'source_sha256':SOURCE_SHA256,'source_vertex_count':source_vertex_count,'source_triangle_count':source_triangle_count,'output_triangle_count':total,'boundary_subdivision':subdivision,'scale_to_0_30_m':float(scale),'source_world_offset':offset.tolist(),'normalized_bounds':[positions.min(0).tolist(),positions.max(0).tolist()],'axes':'X-negative toe; Y-negative outer side; Z-up, floor=0','regions':records,'warning':'Surface regions cut from a single fused source shell. They are not recovered original factory components; region boundaries and UVs need visual review.'}
 (out/'regions.json').write_text(json.dumps(result,indent=2)+'\n')
 bpy.context.scene['source_sha256']=SOURCE_SHA256;bpy.context.scene['source_triangles_retained']=total;bpy.context.scene['shoe_length_m']=.30
 bpy.ops.wm.save_as_mainfile(filepath=str(output),compress=True);print('SEGMENTED',json.dumps(result),flush=True)
 if a.render:studio(out)

if __name__=='__main__':main()
