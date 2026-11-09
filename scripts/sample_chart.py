from pathlib import Path
import sys,json,io,numpy as np
R=Path(__file__).resolve().parents[1]
sys.path[:0]=[str(R/'python'),'/workspace/artifacts/glb-texture-transfer-v1/python','/workspace/artifacts/glb-transfer-01-audit']
from audit_glb import GLB
from scipy.ndimage import map_coordinates,distance_transform_edt
import cv2,trimesh
from trimesh.ray.ray_pyembree import RayMeshIntersector
from PIL import Image
src=Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb');g=GLB(src)
ps=[];ns=[];us=[];fs=[];ms=[];offset=0;seen={};ranges=[]
for i,prim in enumerate(g.doc['meshes'][0]['primitives']):
 attrs=prim['attributes'];key=tuple(sorted(attrs.items()))
 if key not in seen:
  p=g.accessor(attrs['POSITION']).copy();ps.append(p);ns.append(g.accessor(attrs['NORMAL']).copy());us.append(g.accessor(attrs['TEXCOORD_0']).copy());seen[key]=offset;offset+=len(p)
 f=g.accessor(prim['indices']).reshape(-1,3).copy()+seen[key];ranges.append(len(f));fs.append(f);ms.append(np.full(len(f),prim['material'],'i2'))
p=np.concatenate(ps);n=np.concatenate(ns);uv=np.concatenate(us);f=np.concatenate(fs);mat=np.concatenate(ms);del ps,ns,us,fs,ms
frame=json.loads(Path('/workspace/artifacts/glb-material-finish-v4/reports/registration.json').read_text())['tongueA'];O,N,T,W=[np.array(frame[k]) for k in ['origin','normal','t','w']]
field=np.load('/workspace/artifacts/glb-material-finish-v4/reports/tongue-surface-field.npz');T0,T1,W0,W1=[float(field[k]) for k in ['T0','T1','W0','W1']];H=1024;ww,tt=np.meshgrid(np.linspace(W0,W1,H),np.linspace(T1,T0,H));basepoints=O+tt.reshape(-1,1)*T+ww.reshape(-1,1)*W
ray=RayMeshIntersector(trimesh.Trimesh(p,f,process=False));ti,ri,loc=ray.intersects_id(basepoints+N*.40,np.tile(-N,(len(basepoints),1)),multiple_hits=False,return_locations=True)
hh=(loc-O)@N;expected=map_coordinates(field['base'],[ri//H/(H-1)*767,ri%H/(H-1)*767],order=1,mode='nearest');valid=(loc[:,0]<.21)&(loc[:,1]>.025)&(hh>expected-.022)&(hh<expected+.065)&(np.isin(mat[ti],[0,9]));mask=np.zeros(H*H,'u1');mask[ri[valid]]=1;mask=mask.reshape(H,H);num,lab,stats,centers=cv2.connectedComponentsWithStats(mask);mask=(lab==1+np.argmax(stats[1:,cv2.CC_STAT_AREA])).astype('u1');mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((3,3),'u1'))
# Source hole centers are lower than the main tongue skin; preserve their outlines from the raster.
contours,hierarchy=cv2.findContours(mask,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE);info=[]
for i,c in enumerate(contours):
 area=cv2.contourArea(c);x,y,bw,bh=cv2.boundingRect(c)
 if area>30:info.append({'id':i,'areaPixels':area,'rect':[x,y,bw,bh],'parent':int(hierarchy[0,i,3])})
face=np.full(H*H,-1,'i4');face[ri]=ti;depth=np.full(H*H,np.nan,'f4');depth[ri]=hh
bary=np.zeros((H*H,3),'f4');bary[ri]=trimesh.triangles.points_to_barycentric(p[f[ti]],loc)
rgb=np.full((H*H,3),255,'u1');mr=np.tile([0,244,0],(H*H,1)).astype('u1')
for m in np.unique(mat[ti]):
 ids=np.flatnonzero(mat[ti]==m);uvs=(uv[f[ti[ids]]]*bary[ri[ids],:,None]).sum(1);pm=g.doc['materials'][m]['pbrMetallicRoughness']
 for dest,name in [(rgb,'baseColorTexture'),(mr,'metallicRoughnessTexture')]:
  if name not in pm:continue
  image=g.doc['images'][g.doc['textures'][pm[name]['index']]['source']];view=g.doc['bufferViews'][image['bufferView']];tex=np.asarray(Image.open(io.BytesIO(g.bin[view['byteOffset']:view['byteOffset']+view['byteLength']])).convert('RGB'));yy=np.clip(uvs[:,1]*tex.shape[0]-.5,0,tex.shape[0]-1);xx=np.clip(uvs[:,0]*tex.shape[1]-.5,0,tex.shape[1]-1)
  for ch in range(3):dest[ri[ids],ch]=map_coordinates(tex[:,:,ch],[yy,xx],order=1,mode='nearest')
np.savez_compressed(R/'data/source-body.npz',positions=p,normals=n,uv=uv,faces=f,material=mat,primitiveLengths=ranges)
np.savez_compressed(R/'data/source-chart.npz',mask=mask,face=face.reshape(H,H),depth=depth.reshape(H,H),rgb=rgb.reshape(H,H,3),mr=mr.reshape(H,H,3),bary=bary.reshape(H,H,3),O=O,N=N,T=T,W=W,T0=T0,T1=T1,W0=W0,W1=W1)
Image.fromarray(mask*255).save(R/'images/chart-mask.png');Image.fromarray(rgb.reshape(H,H,3)).save(R/'images/chart-source-color.png');(R/'reports/chart.json').write_text(json.dumps({'frame':frame,'contours':info,'bounds':[T0,T1,W0,W1]},indent=2));print(json.dumps(info),flush=True)
