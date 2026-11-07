"""Project the approved 785-stone layout onto the actual separated cuff.
No white paper decal, no source alteration. Persistent triangle/barycentric IDs.
"""
from pathlib import Path
import json,hashlib,struct
import numpy as np
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;OUT=ROOT/'public/tongue-sleeve-lab/assets'

def main():
 path=OUT/'user-hand-parts.glb';data=path.read_bytes();size=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+size]);blob=data[28+size:]
 def read(i):
  a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];count={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']];dt={5126:'<f4',5125:'<u4'}[a['componentType']]
  return np.frombuffer(blob,dt,a['count']*count,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,count)
 node=next(n for n in g['nodes'] if n['name']=='Horseshoe_Cuff');prim=g['meshes'][node['mesh']]['primitives'][0];p=read(prim['attributes']['POSITION']).astype(float);f=read(prim['indices']).reshape(-1,3);tri=p[f];a,b,c=tri[:,0],tri[:,1],tri[:,2];edge1=b-a;edge2=c-a
 determinant=edge1[:,0]*edge2[:,2]-edge2[:,0]*edge1[:,2];valid=abs(determinant)>1e-12
 source=ROOT/'modeling/finished-shoe-v8/rhinestone-points.json';layout=json.loads(source.read_text());points=np.array([[s['x'],s['y']] for s in layout['stones']]);r=np.array([s['radius_px'] for s in layout['stones']]);center=np.array([626.5,626.5]);extent=np.max(np.linalg.norm(points-center,axis=1)+r);scale=.075/(2*extent)
 raw_origin=np.array(g['extras']['rawOrigin']);raw_scale=g['extras']['rawToMetres'];center_raw=np.array([-.008,0,-.225]);center_local=(center_raw-raw_origin)*raw_scale
 anchors=[];miss=[]
 for i,(point,radius) in enumerate(zip(points,r)):
  # +Z means fingers. Dorsal view has +X screen right and -Z artwork down.
  x=center_local[0]+(point[0]-center[0])*scale;z=center_local[2]-(point[1]-center[1])*scale
  dx=x-a[:,0];dz=z-a[:,2];u=np.divide(dx*edge2[:,2]-edge2[:,0]*dz,determinant,out=np.zeros(len(a)),where=valid);v=np.divide(edge1[:,0]*dz-dx*edge1[:,2],determinant,out=np.zeros(len(a)),where=valid);ok=valid&(u>=-1e-6)&(v>=-1e-6)&(u+v<=1.000001)
  ids=np.flatnonzero(ok)
  if not len(ids):miss.append(i);continue
  y=a[ids,1]+u[ids]*edge1[ids,1]+v[ids]*edge2[ids,1];j=int(ids[np.argmax(y)]);weights=np.clip([1-u[j]-v[j],u[j],v[j]],0,1);weights/=weights.sum()
  anchors.append({'id':f'silver-{i:04d}','triangle':j,'barycentric':weights.tolist(),'clearance':.00013,'radius':float(radius*scale),'artworkCenter':point.tolist()})
 assert not miss,f'Cannot bind stones to real cuff surface: {miss}'
 result={'sourceLayout':'modeling/finished-shoe-v8/rhinestone-points.json','sourceLayoutSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'derivedCuffSHA256':hashlib.sha256(data).hexdigest(),'stoneCount':len(anchors),'outerDiameterMetres':.075,'layoutRaster1254x1254':'Matches user supplied circular silver artwork; raster digitization preserves 785 recovered centers. Not a factory count.','cuffCenterRaw':center_raw.tolist(),'centerLocal':center_local.tolist(),'anchors':anchors}
 (OUT/'cuff-medallion-bindings.json').write_text(json.dumps(result,separators=(',',':'))+'\n');print(json.dumps({k:v for k,v in result.items() if k!='anchors'},indent=2))
if __name__=='__main__':main()
