"""Bake a continuous, non-rigid horseshoe-cuff performance from approved parts.
Read source geometry only; output a new half-float morph cache + UV contract.
No geometry replacement, transparency trick, or duplicated medallion.
"""
from pathlib import Path
import json,struct,hashlib
import numpy as np
from scipy.interpolate import LinearNDInterpolator,NearestNDInterpolator
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/tongue-motion-lab/assets';HERE=Path(__file__).resolve().parent
OUT.mkdir(parents=True,exist_ok=True)

def load(path):
 d=path.read_bytes();n=struct.unpack_from('<I',d,12)[0];g=json.loads(d[20:20+n]);blob=d[28+n:]
 def read(i):
  a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];n={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']];return np.frombuffer(blob,{5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],a['count']*n,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,n).copy()
 return g,read,hashlib.sha256(d).hexdigest()
def normals(p,f,fallback=None):
 n=np.zeros_like(p);face=np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]])
 for k in range(3):np.add.at(n,f[:,k],face)
 lengths=np.linalg.norm(n,axis=1,keepdims=True);bad=lengths[:,0]<1e-14;n/=np.maximum(lengths,1e-20)
 if fallback is not None:n[bad]=fallback[bad]
 return n

def smooth(a,b,x):
 q=np.clip((x-a)/(b-a),0,1);return q*q*(3-2*q)
def hermite(a,b,ma,mb,t,length):
 return (2*t**3-3*t*t+1)*a+(t**3-2*t*t+t)*ma*length+(-2*t**3+3*t*t)*b+(t**3-t*t)*mb*length

def tongue_st(name,uv):
 if name=='Tongue_Reverse_Canvas':return uv[:,0]/1.3,(1-uv[:,1])/4
 if name=='Tongue_Canvas':
  q=(766-uv[:,1]*853)/628;left=280-70*q;right=500+62*q;return 1-(1280*uv[:,0]-left-15)/(right-left-30),.46+.54*q
 return .5+(uv[:,0]-.68)*.19/.065,(.9-uv[:,1])*.46*.19/.06

def main():
 shoe,read,shoe_sha=load(ROOT/'public/assets/onward-ad-v1/onward-ad-v1.glb');parts,pread,parts_sha=load(ROOT/'public/tongue-sleeve-lab/assets/user-hand-parts.glb');bindings=json.loads((ROOT/'public/tongue-sleeve-lab/assets/cuff-medallion-bindings.json').read_text());spec=json.loads((ROOT/'modeling/tongue-sleeve-lab/separation-spec.json').read_text())
 tongue=[]
 for i,prim in enumerate(shoe['meshes'][shoe['nodes'][4]['mesh']]['primitives']):
  p=read(prim['attributes']['POSITION']).astype(float);n=read(prim['attributes']['NORMAL']).astype(float);uv=read(prim['attributes']['TEXCOORD_0']).astype(float);f=read(prim['indices']).reshape(-1,3);name=shoe['materials'][prim['material']]['name'];s,t=tongue_st(name,uv);tongue.append({'p':p,'n':n,'f':f,'s':s,'t':t,'primitive':i,'name':name})
 # A source-derived surface sampler joins body/root to the returning tongue.
 # Lookup remains a function of the original UVs rather than guessed screen points.
 samplers=[]
 for item in [tongue[2],tongue[0]]:
  st=np.column_stack([item['s'],item['t']]);rounded=np.round(st,6);quality=item['n'][:,1]*.8-item['n'][:,0]*.6;order=np.lexsort((-quality,rounded[:,1],rounded[:,0]));unique,first=np.unique(rounded[order],axis=0,return_index=True);idx=order[first];values=np.column_stack([item['p'][idx],item['n'][idx]]);samplers.append((LinearNDInterpolator(unique,values),NearestNDInterpolator(unique,values)))
 def sample(s,t):
  s=np.clip(np.asarray(s),0,1);t=np.clip(np.asarray(t),0,1);st=np.column_stack([s,t]);result=np.zeros((len(s),6))
  for mask,(linear,nearest) in zip([t<.46,t>=.46],samplers):
   values=linear(st[mask]);missing=~np.isfinite(values).all(1)
   if missing.any():values[missing]=nearest(st[mask][missing])
   result[mask]=values
  result[:,3:]/=np.maximum(np.linalg.norm(result[:,3:],axis=1,keepdims=True),1e-12);return result
 arc_t=np.linspace(.46,1,1001);arc_points=sample(np.full(len(arc_t),.5),arc_t)[:,:3];arc_distance=np.concatenate([[0],np.cumsum(np.linalg.norm(np.diff(arc_points,axis=0),axis=1))]);arc_total=float(arc_distance[-1]);arc_fraction=arc_distance/arc_total;arc_scale=.1075/arc_total;source_root=arc_points[0]
 def design_t(y):return np.where(y<.0505,y/.0505*.46,np.interp(np.clip((y-.0505)/.1075,0,1),arc_fraction,arc_t))
 def design_y(t):return np.where(t<.46,t/.46*.0505,.0505+np.interp(t,arc_t,arc_fraction)*.1075)
 def half_width(y):return .043+.0085*np.sqrt(np.clip(y/.158,0,1))
 tongue_height=.135;root_x=.0183;center_z=-.0065;wrist_x=root_x+.0505
 hand_node=next(node for node in parts['nodes'] if node['name']=='Hand_Skin');hand_pr=parts['meshes'][hand_node['mesh']]['primitives'][0];hand_p=pread(hand_pr['attributes']['POSITION']).astype(float);hand_f=pread(hand_pr['indices']).reshape(-1,3)
 palm_region=(hand_p[:,2]>=.0505)&(hand_p[:,2]<=.158)&(abs(hand_p[:,0])<=.0325);palm_q=np.clip((hand_p[:,2]-.0505)/.1075,0,1);palm_support=.1023+(tongue_height-.1023)*smooth(0,.22,palm_q)+.0015*np.sin(palm_q*np.pi);wrist_y=float((palm_support[palm_region]-hand_p[palm_region,1]).max())+.0006
 def flat_surface(s,t,wide=True):
  y=design_y(t);q=np.clip((y-.0505)/.1075,0,1);w=half_width(y)*2 if wide else np.full(len(t),.065);corner=.017*np.abs(2*s-1)**6*smooth(.115,.158,y);y_end=y-corner
  x=root_x-(y_end-.0505);height=.1023+(tongue_height-.1023)*smooth(0,.22,q)+.0015*np.sin(q*np.pi);z=center_z+(.5-s)*w
  p=np.column_stack([x,height,z]);root=t<.46
  p[root]=sample(s[root],t[root])[:,:3] # Foot-connected section remains attached.
  blend=smooth(.46,.50,t);original=sample(s,t)[:,:3];p=original*(1-blend[:,None])+p*blend[:,None]
  return p
 def installed_surface(s,t,wide=True):
  value=sample(s,t);p=value[:,:3].copy();n=value[:,3:];y=design_y(t);center=sample(np.full(len(t),.5),t)[:,:3]
  if wide:
   edge0=sample(np.zeros(len(t)),t)[:,:3];edge1=sample(np.ones(len(t)),t)[:,:3];source_width=np.maximum(abs(edge0[:,2]-edge1[:,2]),.040);ratio=np.where(t>=.46,half_width(y)*2/source_width,1)
   p[:,2]=center[:,2]+(p[:,2]-center[:,2])*ratio*np.where(t>=.46,.90,1)
  free=t>=.46;p[free,:2]=source_root[:2]+(p[free,:2]-source_root[:2])*arc_scale
  blend=smooth(.46,.50,t);p=value[:,:3]*(1-blend[:,None])+p*blend[:,None]
  return p,n
 # Preserve the approved source mesh; animate only derivative morph targets.
 cache=bytearray();sections={}
 def store(name,array,dtype='<f2'):
  arr=np.asarray(array,dtype=dtype);offset=len(cache);cache.extend(arr.tobytes());sections[name]={'offset':offset,'bytes':arr.nbytes,'shape':list(arr.shape),'type':dtype}
 for item in tongue:
  p,n,f,s,t=(item[k] for k in ['p','n','f','s','t']);lift=flat_surface(s,t,False);installed,ni=installed_surface(s,t,True)
  # Keep the original shell thickness and both surfaces when lifting.
  reverse=sample(s,t);shell=(p-reverse[:,:3]);shell_blend=smooth(.46,.50,t);lift+=shell*(1-shell_blend[:,None])+np.column_stack([np.zeros(len(t)),np.sum(shell*reverse[:,3:],axis=1),np.zeros(len(t))])*shell_blend[:,None]
  installed+=shell;root_mask=t<.46;lift[root_mask]=p[root_mask];installed[root_mask]=p[root_mask]
  for name,positions in [('lift',lift),('installed',installed)]:
   out_normal=normals(positions,f,n);out_normal[root_mask]=n[root_mask];dtype='<f4' if item['primitive']==2 else '<f2';store(f'tongue-{item["primitive"]}-{name}-p',positions,dtype);store(f'tongue-{item["primitive"]}-{name}-n',out_normal,dtype)
 # Tongue-end eyelets keep their actual local relationship while lifting.
 from scipy.spatial import cKDTree
 reverse=tongue[0];tree=cKDTree(reverse['p']);eyelets=[]
 for pi,prim in enumerate(shoe['meshes'][shoe['nodes'][5]['mesh']]['primitives']):
  ep=read(prim['attributes']['POSITION']).astype(float);en=read(prim['attributes']['NORMAL']).astype(float);ef=read(prim['indices']).reshape(-1,3);_,nearest=tree.query(ep);es=reverse['s'][nearest];et=reverse['t'][nearest];delta=ep-reverse['p'][nearest];base_n=reverse['n'][nearest]
  lift=flat_surface(es,et,False);lift[:,1]+=np.sum(delta*base_n,axis=1);final,fn=installed_surface(es,et,True);final+=delta
  for name,positions in [('lift',lift),('installed',final)]:store(f'eyelet-{pi}-{name}-p',positions);store(f'eyelet-{pi}-{name}-n',normals(positions,ef,en))
  eyelets.append(pi)
 # Existing tongue trim/stitches share nodes with other garment parts.
 # Move only connected components confirmed close to the tongue surface.
 from scipy.sparse import coo_matrix
 from scipy.sparse.csgraph import connected_components
 followers=[];reverse_lift=flat_surface(reverse['s'],reverse['t'],False);reverse_inst,_=installed_surface(reverse['s'],reverse['t'],True);reverse_lift_n=normals(reverse_lift,reverse['f'],reverse['n']);reverse_inst_n=normals(reverse_inst,reverse['f'],reverse['n'])
 def rotate_offsets(delta,a,b):
  axis=np.cross(a,b);dot=np.sum(a*b,axis=1);first=np.cross(axis,delta);return delta+first+np.cross(axis,first)/np.maximum((1+dot)[:,None],1e-5)
 for ni in [13,14]:
  for pi,pr in enumerate(shoe['meshes'][shoe['nodes'][ni]['mesh']]['primitives']):
   fp=read(pr['attributes']['POSITION']).astype(float);fn=read(pr['attributes']['NORMAL']).astype(float);ff=read(pr['indices']).reshape(-1,3);distance,near=tree.query(fp);edges=np.concatenate([ff[:,[0,1]],ff[:,[1,2]],ff[:,[2,0]]]);graph=coo_matrix((np.ones(len(edges)),(edges[:,0],edges[:,1])),shape=(len(fp),len(fp)));count,labels=connected_components(graph,directed=False);moving=np.zeros(len(fp),dtype=bool)
   for component in range(count):
    mask=labels==component
    if distance[mask].mean()<(.001 if ni==13 else .0008) and np.quantile(distance[mask],.95)<.0015:moving[mask]=True
   if not moving.any():continue
   ids=near[moving];delta=fp[moving]-reverse['p'][ids];prefix=f'follower-{ni}-{pi}'
   for kind,target,tn in [('lift',reverse_lift,reverse_lift_n),('installed',reverse_inst,reverse_inst_n)]:
    positions=fp.copy();positions[moving]=target[ids]+rotate_offsets(delta,reverse['n'][ids],tn[ids]);out_n=fn.copy();out_n[moving]=normals(positions,ff,fn)[moving];store(prefix+'-'+kind+'-p',positions,'<f4');store(prefix+'-'+kind+'-n',out_n,'<f4')
   followers.append({'node':ni,'primitive':pi,'prefix':prefix,'movingVertices':int(moving.sum()),'totalVertices':len(fp)})
 # Pinch target is bound to an actual end triangle on the same source topology.
 rp=reverse;uv=np.column_stack([rp['s'],rp['t']]);tri=uv[rp['f']];point=np.array([.5,.988]);a2,b2,c2=tri[:,0],tri[:,1],tri[:,2];e1=b2-a2;e2=c2-a2;det=e1[:,0]*e2[:,1]-e1[:,1]*e2[:,0];ok=abs(det)>1e-12;off=point-a2;u2=np.divide(off[:,0]*e2[:,1]-off[:,1]*e2[:,0],det,out=np.zeros(len(det)),where=ok);v2=np.divide(e1[:,0]*off[:,1]-e1[:,1]*off[:,0],det,out=np.zeros(len(det)),where=ok);ids=np.flatnonzero(ok&(u2>=-1e-6)&(v2>=-1e-6)&(u2+v2<=1.000001));assert len(ids);fi=int(ids[0]);weights=np.clip([1-u2[fi]-v2[fi],u2[fi],v2[fi]],0,1);weights/=weights.sum();grip={'id':'real-tongue-end-grip','triangle':fi,'barycentric':weights.tolist(),'clearance':0}
 # Raw cuff coordinates and exact existing medallion bindings.
 node=next(n for n in parts['nodes'] if n['name']=='Horseshoe_Cuff');prim=parts['meshes'][node['mesh']]['primitives'][0];p=pread(prim['attributes']['POSITION']).astype(float);n=pread(prim['attributes']['NORMAL']).astype(float);faces=pread(prim['indices']).reshape(-1,3);origin=np.array(parts['extras']['rawOrigin']);scale=parts['extras']['rawToMetres'];raw=p/scale+origin;theta=np.arctan2(raw[:,1]-spec['frontAngleCenter'][1],raw[:,0]-spec['frontAngleCenter'][0]);co=spec['frontFourierCoefficients'];front=np.full(len(p),co[0])
 for k in range(1,4):front+=co[2*k-1]*np.cos(k*theta)+co[2*k]*np.sin(k*theta)
 a,b,c=spec['backPlaneZCoefficients'];back=a+b*raw[:,0]+c*raw[:,1]+spec['backOffset'];front_d=-(front-origin[2])*scale;back_d=-(back-origin[2])*scale;d=-p[:,2];dc=-bindings['centerLocal'][2];cx=bindings['centerLocal'][0];lo,hi=dc-.040,dc+.040;center_y=.0991;base_y=center_y+d-dc
 width0=-(p[:,0]-cx)+.001;source_abs=np.where(width0>=0,width0.max(),-width0.min());v=np.clip((d-front_d)/np.maximum(back_d-front_d,.02),0,1);guess=np.clip(base_y,0,.158)
 # Inside the 75mm medallion all in-plane derivatives stay exactly 1.
 hw=half_width(guess);absx=abs(width0);edge=smooth(.0395,source_abs,absx);mapped=np.sign(width0)*(.0395+(hw-.0395)*np.clip((absx-.0395)/np.maximum(source_abs-.0395,1e-5),0,1));width=np.where(absx<.0395,width0,width0*(1-edge)+mapped*edge);u=np.clip(.5-width/.103,0,1)
 y=base_y.copy();top=d<lo;bottom=d>hi;top_edge=.005*(1-(2*u-1)**2);bottom_edge=.158-.017*abs(2*u-1)**6
 top_t=np.clip((d-front_d)/np.maximum(lo-front_d,.001),0,1);bottom_t=np.clip((d-hi)/np.maximum(back_d-hi,.001),0,1)
 y[top]=hermite(top_edge[top],center_y-.040,1,1,top_t[top],lo-front_d[top]);y[bottom]=hermite(center_y+.040,bottom_edge[bottom],1,.25,bottom_t[bottom],back_d[bottom]-hi)
 y=np.clip(y,0,.158);
 # Correct only the non-artwork margins to the nominal 103 x 158 mm bounds.
 for sign in [-1,1]:
  extent=float((width*sign).max());mask=width*sign>.0395;width[mask]=sign*(.0395+(width[mask]*sign-.0395)*(.0515-.0395)/(extent-.0395))
 minimum=float(y.min());mask=y<.055;y[mask]=.055*(y[mask]-minimum)/(.055-minimum);u=np.clip(.5-width/.103,0,1);uv=np.column_stack([u,y/.158]);store('cuff-uv',uv,'<f4')
 # Paired surfaces remain a thin closed-section fabric instead of collapsing
 # the entire tube into a singular zero-thickness sheet.
 layer=.0014*np.tanh((p[:,1]-.026)*150)
 from scipy.spatial import ConvexHull,Delaunay
 from scipy.ndimage import distance_transform_edt,gaussian_filter,maximum_filter
 from scipy.interpolate import RegularGridInterpolator
 hand_node=next(node for node in parts['nodes'] if node['name']=='Hand_Skin');hand_pr=parts['meshes'][hand_node['mesh']]['primitives'][0];hand_p=pread(hand_pr['attributes']['POSITION']).astype(float)
 gx=np.linspace(-.075,.075,151);gz=np.linspace(-.020,.185,206);height=np.full((len(gx),len(gz)),-np.inf);ix=np.clip(np.round((hand_p[:,0]-gx[0])/(gx[1]-gx[0])).astype(int),0,len(gx)-1);iz=np.clip(np.round((hand_p[:,2]-gz[0])/(gz[1]-gz[0])).astype(int),0,len(gz)-1);np.maximum.at(height,(ix,iz),hand_p[:,1]);missing=~np.isfinite(height);nearest=distance_transform_edt(missing,return_distances=False,return_indices=True);height[missing]=height[tuple(nearest[:,missing])];height=gaussian_filter(maximum_filter(height,size=3),1.2)
 hx,hz=np.meshgrid(gx,gz,indexing='ij');projection=hand_p[:,[0,2]];hull=ConvexHull(projection);inside=Delaunay(projection[hull.vertices]).find_simplex(np.column_stack([hx.ravel(),hz.ravel()])).reshape(hx.shape)>=0;outside=distance_transform_edt(~inside,sampling=(gx[1]-gx[0],gz[1]-gz[0]));blend=1-smooth(0,.012,outside);baseline=tongue_height-wrist_y+.0017;support=baseline+(height+.0018-baseline)*blend;roof=RegularGridInterpolator((gx,gz),support,bounds_error=False,fill_value=baseline)
 hand_tri=hand_p[hand_f];hand_centers=hand_tri[:,:,[0,2]].mean(1);hand_tree=cKDTree(hand_centers)
 def constrain_to_hand(position,shift=np.zeros(3)):
  result=position.copy()
  for begin in range(0,len(position),4096):
   end=min(begin+4096,len(position));query=position[begin:end][:,[0,2]]-shift[[0,2]];_,ids=hand_tree.query(query,k=64);tri=hand_tri[ids];a=tri[:,:,0];e=tri[:,:,1]-a;v=tri[:,:,2]-a;delta=query[:,None,:]-a[:,:,[0,2]];det=e[:,:,0]*v[:,:,2]-e[:,:,2]*v[:,:,0];valid=abs(det)>1e-14;u=np.divide(delta[:,:,0]*v[:,:,2]-delta[:,:,1]*v[:,:,0],det,out=np.zeros_like(det),where=valid);w=np.divide(e[:,:,0]*delta[:,:,1]-e[:,:,2]*delta[:,:,0],det,out=np.zeros_like(det),where=valid);inside=valid&(u>=0)&(w>=0)&(u+w<=1);height=a[:,:,1]+u*e[:,:,1]+w*v[:,:,1];height=np.where(inside,height,-np.inf).max(1)+shift[1];floor=height+.0018+layer[begin:end];result[begin:end,1]=np.maximum(result[begin:end,1],floor)
  return result
 flat=constrain_to_hand(np.column_stack([width,roof(np.column_stack([width,y]))+layer,y]));pose_names=[];poses=[]
 # Arc integration makes every longitudinal row follow a different rotation.
 # An explicit distributed twist returns the decorated outside facing up.
 distance=np.clip(d,0,.145);grid=np.linspace(0,.15,257)
 for step in range(17):
  progress=step/16;e=progress*progress*(3-2*progress);q=grid/.15;theta_curve=np.pi*e+.45*np.sin(np.pi*progress)*np.sin(q*np.pi*1.4+.5);theta_curve*=.85+.15*smooth(0,.20,q);theta_curve=(1-e)*theta_curve+e*np.pi*e
  dy=np.sin(theta_curve);dz=-np.cos(theta_curve);cy=np.concatenate([[0],np.cumsum((dy[1:]+dy[:-1])*.5*np.diff(grid))]);cz=np.concatenate([[0],np.cumsum((dz[1:]+dz[:-1])*.5*np.diff(grid))]);angle=np.interp(distance,grid,theta_curve);twist=np.pi*e+.45*np.sin(np.pi*progress)*np.sin(distance/.15*np.pi);ct,st=np.cos(twist),np.sin(twist);ca,sa=np.cos(angle),np.sin(angle)
  residual=p[:,1]-.026;positions=np.column_stack([p[:,0]*ct-residual*st,np.interp(distance,grid,cy)+.026+(p[:,0]*st+residual*ct)*ca,np.interp(distance,grid,cz)+(p[:,0]*st+residual*ct)*sa]);positions[:,2]+=np.where(d<0,p[:,2]*(1-e),0)
  # Source -> rolling cuff -> full reference-shaped layered cloth.
  flatten=smooth(.58,1,progress);positions=positions*(1-flatten)+flat*flatten
  if progress>.55:
   lower=roof(positions[:,[0,2]])+layer;correction=np.maximum(0,lower-positions[:,1]);positions[:,1]+=correction*smooth(.55,.8,progress)
  if progress>=.65:positions=constrain_to_hand(positions)
  if step==0:positions=p.copy()
  poses.append(positions);pose_names.append('flip-'+str(step))
 # After the fingers recede, cloth settles row-by-row onto the raised tongue.
 s=u;t=design_t(y);target_flat_world=flat_surface(s,t,True);target_inst_world,normal_inst=installed_surface(s,t,True);source_center=sample(np.full(len(t),.5),t)[:,:3];free=t>=.46;target_inst_world[free,2]=source_center[free,2]+(target_inst_world[free,2]-source_center[free,2])/.90
 # Surface offsets are normal to the source tongue, not a floating image board.
 target_inst_world+=normal_inst*(.0018+layer)[:,None]
 target_flat_local=np.column_stack([target_flat_world[:,2]-center_z,target_flat_world[:,1]-wrist_y+.0018+layer,wrist_x-target_flat_world[:,0]])
 target_inst_local=np.column_stack([target_inst_world[:,2]-center_z,target_inst_world[:,1]-wrist_y,wrist_x-target_inst_world[:,0]])
 withdraw_steps=12
 for step in range(1,withdraw_steps+1):
  progress=step/withdraw_steps;threshold=.142-.155*progress;released=smooth(-.008,.008,y-threshold);position=flat*(1-released[:,None])+target_flat_local*released[:,None];position[:,1]+=.006*np.sin(released*np.pi)*np.sin(v*np.pi);position=constrain_to_hand(position,np.array([.007*np.sin(progress*np.pi),.008*np.sin(progress*np.pi),-.155*progress]));poses.append(position);pose_names.append('withdraw-'+str(step))
 poses.append(target_inst_local);pose_names.append('installed')
 for i,position in enumerate(poses):store(f'cuff-{i}-p',position);store(f'cuff-{i}-n',n if i==0 else normals(position,faces,n))
 # Source-derived centerline, grip samples and authoring reference for runtime.
 table_t=np.linspace(0,1,201);table=sample(np.full(len(table_t),.5),table_t);lift_table=flat_surface(np.full(len(table_t),.5),table_t,False)
 metadata={'version':1,'sourceShoeSHA256':shoe_sha,'sourcePartsSHA256':parts_sha,'cuffVertices':len(p),'flipSteps':16,'withdrawSteps':withdraw_steps,'flatPose':16+withdraw_steps,'installedPose':17+withdraw_steps,'cuffPoses':pose_names,'sections':sections,'cuffUV':'Final blueprint coordinates; stable on the same original topology','physicalDesignMm':{'height':158,'width':103,'medallion':75},'palmPose':{'position':[wrist_x,wrist_y,center_z],'rotationY':-np.pi/2},'tongueHeight':tongue_height,'rootX':root_x,'centerZ':center_z,'tongueTable':{'t':table_t.tolist(),'source':table.tolist(),'lift':lift_table.tolist()},'sameSilverInstances':785,'tongueGripAnchor':grip,'eyeletPrimitives':eyelets,'followers':followers,'sourceFreeArcLengthMetres':arc_total,'nominalFreeArcLengthMetres':.1075,'fittedFreeArcLengthMetres':float(np.linalg.norm(np.diff(installed_surface(np.full(len(arc_t),.5),arc_t)[0],axis=0),axis=1).sum()),'handSupport':'Actual uploaded hand upper envelope, pre-baked support projection','note':'Art-directed continuous deformation cache, not real-time cloth simulation. Hand collision and silhouette require visual review.'}
 output=OUT/'tongue-cuff-morphs.f16';output.write_bytes(cache);metadata['cacheSHA256']=hashlib.sha256(cache).hexdigest();metadata['cacheBytes']=len(cache);(OUT/'motion-contract.json').write_text(json.dumps(metadata,separators=(',',':'))+'\n')
 # Independently measure final flat medallion center arrangement against artwork.
 layout=np.array([a['artworkCenter'] for a in bindings['anchors']]);diameter=.075;art_center=np.array([626.5,626.5]);points=json.loads((ROOT/'modeling/finished-shoe-v8/rhinestone-points.json').read_text())['stones'];extent=max(np.linalg.norm(np.array([r['x'],r['y']])-art_center)+r['radius_px'] for r in points);artscale=diameter/(2*extent);errors=[]
 for a,xy in zip(bindings['anchors'],layout):
  point=(flat[faces[a['triangle']]]*np.array(a['barycentric'])[:,None]).sum(0);expected=np.array([.001-(xy[0]-626.5)*artscale,.0991+(xy[1]-626.5)*artscale]);errors.append(np.linalg.norm(point[[0,2]]-expected))
 report={'passed':bool(max(errors)<.001),'poses':len(poses),'cacheBytes':len(cache),'finalFlatMedallionMaxCenterErrorMetres':max(errors),'flatBoundsMetres':[flat.min(0).tolist(),flat.max(0).tolist()],'sourceTopologyUnchanged':True,'sameExistingBindingIDs':len(bindings['anchors']),'method':'Integrated rolling centerline + distributed twist + layered reference fit; row-wise support release; source-sampled installed surface'};(HERE/'bake-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));assert report['passed']
if __name__=='__main__':main()
