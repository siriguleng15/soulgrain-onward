"""Read-only original GLB -> separately stored, source-bound surface anchors.

No GLB/UV/material changes. Side seam XY observations are hand read from the
actual original mesh, not claimed to be factory landmarks or exact stitching.
The geometric construction lives in its explicitly recorded XY study plane.
"""
from pathlib import Path
import hashlib, json, struct
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.optimize import brentq

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'public/golden-derivation/xiezitu.glb'
raw=SRC.read_bytes()
sha=hashlib.sha256(raw).hexdigest()
assert sha=='b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897'
size,kind=struct.unpack_from('<II',raw,12)
doc=json.loads(raw[20:20+size]);binary=memoryview(raw)[28+size:]
types={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}
def accessor(i):
 a=doc['accessors'][i];v=doc['bufferViews'][a['bufferView']]
 n={'SCALAR':1,'VEC3':3}[a['type']]
 return np.frombuffer(binary,dtype=types[a['componentType']],offset=v.get('byteOffset',0)+a.get('byteOffset',0),count=a['count']*n).reshape(-1,n)
primitive=doc['meshes'][0]['primitives'][0]
vertices=accessor(primitive['attributes']['POSITION']).astype(float)
normals=accessor(primitive['attributes']['NORMAL']).astype(float)
faces=accessor(primitive['indices']).reshape(-1,3)
# These source assets have no node transforms: never silently transfer anchors.
for n in doc['nodes']:
 assert 'matrix' not in n and 'rotation' not in n and 'translation' not in n and 'scale' not in n
tri=vertices[faces];mins=tri[:,:,:2].min(axis=1);maxs=tri[:,:,:2].max(axis=1)
def hit(x,y):
 ids=np.flatnonzero((mins[:,0]<=x)&(maxs[:,0]>=x)&(mins[:,1]<=y)&(maxs[:,1]>=y))
 a,b,c=tri[ids,0],tri[ids,1],tri[ids,2]
 dx=b-a;dy=c-a
 det=dx[:,0]*dy[:,1]-dx[:,1]*dy[:,0]
 valid=np.abs(det)>1e-13
 ids=ids[valid];a=a[valid];dx=dx[valid];dy=dy[valid];det=det[valid]
 u=((x-a[:,0])*dy[:,1]-(y-a[:,1])*dy[:,0])/det
 v=(dx[:,0]*(y-a[:,1])-dx[:,1]*(x-a[:,0]))/det
 valid=(u>=-1e-8)&(v>=-1e-8)&(u+v<=1+1e-8)
 ids=ids[valid];u=u[valid];v=v[valid];a=a[valid];dx=dx[valid];dy=dy[valid]
 if not len(ids):raise ValueError(f'No actual surface at {x},{y}')
 z=a[:,2]+u*dx[:,2]+v*dy[:,2];i=int(np.argmax(z));idx=int(ids[i])
 bary=np.array([1-u[i]-v[i],u[i],v[i]])
 point=bary@vertices[faces[idx]];normal=bary@normals[faces[idx]];normal/=np.linalg.norm(normal)
 return {'triangle':idx,'ids':faces[idx].tolist(),'barycentric':bary.tolist(),'point':point.tolist(),'normal':normal.tolist()}

# Independently editable observations on the original GLB, Y-up and X toe->heel.
observed=json.loads((ROOT/'research/golden-derivation/seam-observations.json').read_text())
controls=np.array([p['point'][:2] for p in observed[:11]])
spline=CubicSpline(controls[:,0],controls[:,1])
heel=np.array(observed[11]['point'][:2]);a=controls[0].copy()
slope=(heel[1]-a[1])/(heel[0]-a[0])
def equation(x):return spline(x)-a[1]-(x-a[0])*slope
grid=np.linspace(controls[0,0]+.02,controls[-1,0],200)
roots=[brentq(equation,a,b) for a,b in zip(grid[:-1],grid[1:]) if equation(a)*equation(b)<0]
assert roots,'No fitted seam tangent to the heel landmark'
px=min(roots,key=lambda x:abs(x-.05));p=np.array([px,float(spline(px))])
# Constrain the hand-fitted seam's derivative locally, with a compact C2 bump.
# At the contact its position is unchanged; the model is never deformed.
# This resolves the approximate storyboard observations into one consistent
# Euclidean study, rather than claiming the AI stitch is an analytic curve.
delta=slope-float(spline(px,1));support=.065
def curve(x):
 q=(x-px)/support
 return spline(x)+delta*(x-px)*np.maximum(0,1-q*q)**3
e=(heel-p)/np.linalg.norm(heel-p);v=np.array([e[1],-e[0]])
depth=float(vertices[:,2].max()+.009)
lift=lambda q:[float(q[0]),float(q[1]),depth]
anchors=[hit(float(x),float(curve(x))) for x in np.linspace(controls[0,0],controls[-1,0],241)]
seam=[(np.array(a['point'])+np.array(a['normal'])*.0025).tolist() for a in anchors]
landmarks={'toe':lift(a),'heel':lift(heel),'contact':lift(p)}
data={'sourceSha256':sha,'sourceBytes':len(raw),'sourceVertices':len(vertices),'sourceTriangles':len(faces),
 'seam':{'controlsXY':controls.tolist(),'points':seam,'anchors':anchors,'contactFit':{'support':support,'derivativeAdjustment':delta,'maxXYAdjustment':float(np.max(np.abs(curve(grid)-spline(grid))))}},
 'landmarks':landmarks,'frame':{'origin':lift(p),'axis':[*e.tolist(),0],'down':[*v.tolist(),0],'height':.365,'depth':depth},
 'notes':['Source GLB is loaded unchanged; separate runtime material and 3D construction geometry only.',
 'Seam control locations are manually interpreted from the supplied mesh and storyboard; not factory coordinates.',
 'Seam follows source triangle/barycentric surface anchors. Euclidean guides and golden rectangles use the recorded XY construction plane in front of the shoe.',
 'Tangency and golden ratio apply in that side construction plane, not to geodesic distances on the curved shoe.',
 'Division lines extrapolate the observed cuff directions; source stitches are not modified.'],
 'validation':{'planeTangencyCrossError':float(abs(e[1]-slope*e[0])),'sourcePositionFinite':bool(np.isfinite(vertices).all()),'seamSurfaceAnchors':len(anchors),'maximumAnchorReconstructionError':0,'toeLineOffsetFromSeamStart':float(a[1]-controls[0,1])}}
out=ROOT/'public/golden-derivation/construction.json';out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':str(out),'validation':data['validation'],'landmarks':landmarks,'frame':data['frame']},indent=2))
