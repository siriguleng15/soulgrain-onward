from common import *
import triangle,trimesh
from scipy.interpolate import PchipInterpolator,CubicSpline
from shapely.geometry import Polygon
import patterns
D=patterns.patterns;unit=1/15.8
def prepare(outline,seam,holes=None):
 outline=np.asarray(outline);dense=[]
 for a,b in zip(outline,np.roll(outline,-1,axis=0)):
  n=max(1,int(np.ceil(np.linalg.norm(b-a)/.18)));dense.extend(a+(b-a)*t/n for t in range(n))
 outline=np.asarray(dense);segments=np.column_stack([np.arange(len(outline)),np.roll(np.arange(len(outline)),-1)]);verts=outline.copy()
 if holes is not None:
  for center in holes:
   th=np.linspace(0,2*np.pi,65)[:-1];circle=np.asarray(center)+.275*np.column_stack([np.cos(th),np.sin(th)]);off=len(verts);verts=np.vstack([verts,circle]);segments=np.vstack([segments,np.column_stack([off+np.arange(64),off+np.roll(np.arange(64),-1)])])
 data={'vertices':verts,'segments':segments}
 if holes is not None:data['holes']=np.asarray(holes)
 out=triangle.triangulate(data,'pq25a0.055Y');xy=out['vertices'];f=out['triangles'];sgn=np.cross(xy[f[:,1]]-xy[f[:,0]],xy[f[:,2]]-xy[f[:,0]]);f[sgn<0]=f[sgn<0,::-1];ids=np.array([np.argmin(np.linalg.norm(xy-point,axis=1)) for point in seam]);assert np.max(np.linalg.norm(xy[ids]-seam,axis=1))<1e-8;return xy,f,ids
fa,ff,fs=prepare(D['front'],D['frontSeam']);ba,bf,bs=prepare(D['back'],D['backSeam'],D['holes'])
# Stable anatomical surface: full-width under-lace deck, then lateral wrapping under the existing quarters.
profile=PchipInterpolator([0,.16,.26,.42,.63,.82,1],[-.735,-.70,-.62,-.47,-.25,-.035,.125]);instep=PchipInterpolator([-.95,-.85,-.65,-.58,-.48,-.36,-.27,-.17,-.065,.045,.155,.23],[-.29,-.22,-.16,-.145,-.12,-.105,-.078,-.012,.066,.14,.208,.26])
def front_surface(xy):
 w=xy[:,0]*unit;v=xy[:,1];u=np.clip(xy[:,0]/4.45,-1,1);vmax=23.30-.42*(1-u*u);s=np.clip(v/vmax,0,1);x=profile(s);x+=.13*(abs(w)/.54)**2*(1-s)**2;yc=instep(x)-.072;half=.090+.050*np.clip((x+.6)/.8,0,1);excess=np.maximum(abs(w)-half,0);angle=1.46*np.tanh(excess/(.105*1.46));z=np.sign(w)*(np.minimum(abs(w),half)+.105*np.sin(angle));drop=.004*np.minimum(abs(w)/half,1)**2+.105*(1-np.cos(angle))+.65*np.maximum(excess-.105*1.46,0);capacity=yc+.385;drop=capacity*np.tanh(drop/capacity);y=yc-drop;return np.column_stack([x,y,z])
fp=front_surface(fa);seamp=fp[fs]
# Back panel rises inside the collar, folds continuously, and exposes its reverse face in front of the lacing.
knots=np.array([[.125,float(instep(.125)-.018)],[.16,.42],[.07,.48],[.0,.45],[-.17,.30],[-.31,.15],[-.40,.07]])
ss=np.array([0,.20,.32,.38,.60,.82,1]);curve=PchipInterpolator(ss,knots,axis=0)
def back_surface(xy):
 w=xy[:,0]*unit;u=np.clip(xy[:,0]/4.45,-1,1);vmin=.40*(1-u*u);s=np.clip((xy[:,1]-vmin)/(15.8-vmin),0,1);center=curve(s);z=w;drop=.004*(np.minimum(abs(w)/(.31),1))**2
 base=np.column_stack([center[:,0],center[:,1]-drop,z]);target=np.column_stack([np.interp(xy[:,0],np.asarray(D['backSeam'])[:,0],seamp[:,0]),np.interp(xy[:,0],np.asarray(D['backSeam'])[:,0],seamp[:,1]),np.interp(xy[:,0],np.asarray(D['backSeam'])[:,0],seamp[:,2])]);at0=np.column_stack([np.full(len(w),knots[0,0]),np.full(len(w),knots[0,1])-drop,w]);blend=np.clip(1-s/.19,0,1)**2;base+=(target-at0)*blend[:,None];return base
bp=back_surface(ba);bp[bs]=seamp
# Stitch the two confirmed pattern edges into one continuous mid-surface with independent semantic regions.
p=fp.tolist();bmap=np.full(len(bp),-1,'i4');bmap[bs]=fs
for i,point in enumerate(bp):
 if bmap[i]<0:bmap[i]=len(p);p.append(point)
p=np.asarray(p);f=np.vstack([ff,bmap[bf]]).astype('i4');part=np.r_[np.zeros(len(ff),'u1'),np.ones(len(bf),'u1')];uv=np.zeros((len(p),2),'f4');uv[:len(fp)]=fa/np.array([20.,25.])+[.5,0]
for i in range(len(bp)):
 if i not in set(bs.tolist()):uv[bmap[i]]=ba[i]/np.array([12.,17.])+[.5,0]
mid=trimesh.Trimesh(p,f,process=False);assert mid.is_winding_consistent
norm=mid.vertex_normals;thickness=.0048;pv=np.vstack([p+norm*thickness/2,p-norm*thickness/2]);fv=len(p);faces=np.vstack([f,f[:,::-1]+fv]);parts=np.r_[part,part];side=np.r_[np.zeros(len(f),'u1'),np.ones(len(f),'u1')];uv2=np.vstack([uv,uv]);edges=np.vstack([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]);e=np.sort(edges,axis=1);_,inv,count=np.unique(e,axis=0,return_inverse=True,return_counts=True);boundary=edges[count[inv]==1];rim=[]
for a,b in boundary:rim.extend([[b,a,a+fv],[b,a+fv,b+fv]])
faces=np.vstack([faces,np.array(rim)]);parts=np.r_[parts,np.full(len(rim),2,'u1')];side=np.r_[side,np.full(len(rim),2,'u1')];solid=trimesh.Trimesh(pv,faces,process=False);assert solid.is_watertight and solid.is_winding_consistent
holeCenters=[];holeU=[];holeV=[];holeNormals=[]
for hole in np.asarray(D['holes']):
 center=back_surface(hole[None])[0];du=(back_surface((hole+[.01,0])[None])[0]-back_surface((hole-[.01,0])[None])[0])/.02;dv=(back_surface((hole+[0,.01])[None])[0]-back_surface((hole-[0,.01])[None])[0])/.02;normal=-np.cross(du,dv);normal/=np.linalg.norm(normal);holeCenters.append(center);holeU.append(du);holeV.append(dv);holeNormals.append(normal)
# Actual zigzag overlock, taken around the back pattern's outside edge, excluding the sewn top edge.
edge2d=np.asarray(D['back'])[65-1:];edge2d=np.vstack([edge2d,np.asarray(D['backSeam'])[0]]);lengths=np.r_[0,np.cumsum(np.linalg.norm(np.diff(edge2d,axis=0),axis=1))];arcs=np.arange(0,lengths[-1],.20);path2d=np.column_stack([np.interp(arcs,lengths,edge2d[:,k]) for k in range(2)]);tangent=np.gradient(path2d,axis=0);tangent/=np.maximum(np.linalg.norm(tangent,axis=1)[:,None],1e-12);inward=np.column_stack([-tangent[:,1],tangent[:,0]]);offset=np.where(np.arange(len(path2d))%2,.13,.018);zig2d=path2d+inward*offset[:,None];zig3d=back_surface(zig2d);du=(back_surface(zig2d+[.005,0])-back_surface(zig2d-[.005,0]))/.01;dv=(back_surface(zig2d+[0,.005])-back_surface(zig2d-[0,.005]))/.01;nvis=-np.cross(du,dv);nvis/=np.maximum(np.linalg.norm(nvis,axis=1)[:,None],1e-12);zig3d+=nvis*(thickness/2+.00065)
np.savez_compressed(R/'data/two-panels.npz',positions=pv.astype('f4'),faces=faces,uv=uv2,normals=solid.vertex_normals.astype('f4'),part=parts,side=side,midPositions=p,midFaces=f,midPart=part,frontPattern=fa,backPattern=ba,frontTriangles=ff,backTriangles=bf,backVertexMap=bmap,seam=fs,frontVertexCount=fv,thickness=thickness,holeCenters=holeCenters,holeU=holeU,holeV=holeV,holeNormals=holeNormals,zigzag=zig3d)
Path(R/'reports/panels.json').write_text(json.dumps({'patternAssemblyConfirmed':True,'source':'User supplied front shoe photograph and two actual paper patterns','frontFanTowardToe':True,'sewnEdgeVertices':len(fs),'frontPatternVertices':len(fa),'backPatternVertices':len(ba),'tongueTriangles':len(faces),'watertight':bool(solid.is_watertight),'windingConsistent':bool(solid.is_winding_consistent),'connectedComponents':len(solid.split(only_watertight=False)),'holes':2,'thicknessModelUnits':thickness,'frontFinishedSurface':'closed cloth, drafting slits closed','frontCoverage':'full width between eyestays; no original lace geometry used as deformation scaffold','photoMetricLimit':'Pattern proportions traced from perspective photos; no factory-scale unfolding certification'},ensure_ascii=False,indent=2));print('Built',len(pv),len(faces),solid.is_watertight,flush=True)
