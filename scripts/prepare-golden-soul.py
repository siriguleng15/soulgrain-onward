"""Read actual exported GLB; create NEW barycentric anchors, never classify a face."""
import bpy,json,hashlib,struct,sys,numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('/workspace/golden-geometry-world-soul-v1-3');folder=R/'public/golden-derivation/soul-v1-3';raw=(folder/'soul-new-web.glb').read_bytes();ln=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+ln]);binary=memoryview(raw)[28+ln:];dtypes={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'};width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def accessor(i):
 a=doc['accessors'][i];b=doc['bufferViews'][a['bufferView']];w=width[a['type']];assert b.get('byteStride',w*np.dtype(dtypes[a['componentType']]).itemsize)==w*np.dtype(dtypes[a['componentType']]).itemsize;return np.frombuffer(binary,dtypes[a['componentType']],count=a['count']*w,offset=b.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,w)
all_vertices=[];face_count=0
for node in doc['nodes']:
 if 'mesh' not in node:continue
 assert not any(k in node for k in ['matrix','rotation','translation','scale'])
 for p in doc['meshes'][node['mesh']]['primitives']:
  all_vertices.append(accessor(p['attributes']['POSITION']));face_count+=doc['accessors'][p['indices']]['count']//3
bounds=[np.min(np.concatenate(all_vertices),axis=0).tolist(),np.max(np.concatenate(all_vertices),axis=0).tolist()];verts=[];normals=[];faces=[];references=[];vertex_ranges=[];offset=0
for node in doc['nodes']:
 if node.get('name') not in ['Shoe_TEST_V3','DEBUG_LACES_VISIBILITY_ONLY']:continue
 for pi,p in enumerate(doc['meshes'][node['mesh']]['primitives']):
  v=accessor(p['attributes']['POSITION']);f=accessor(p['indices']).astype('i4').reshape(-1,3);verts.append(v);normals.append(accessor(p['attributes']['NORMAL']));faces.append(f+offset);references += [(node['name'],pi,j,f[j].tolist()) for j in range(len(f))];vertex_ranges.append((offset,offset+len(v),node['name'],pi));offset+=len(v)
v=np.concatenate(verts);n=np.concatenate(normals);f=np.concatenate(faces);tree=BVHTree.FromPolygons(v.tolist(),f.tolist(),all_triangles=True)
def hit(x,y):
 pt,no,fi,distance=tree.ray_cast(Vector((float(x),float(y),2)),Vector((0,0,-1)),4)
 if pt is None or pt.z<.12:raise ValueError('New SOUL front surface missing at '+str((x,y)))
 p=np.asarray(pt,'f8');triangle=v[f[fi]].astype('f8');a,b,c=triangle;u=b-a;w=c-a;q=p-a;vv=np.dot(u,u);ww=np.dot(w,w);vw=np.dot(u,w);uq=np.dot(u,q);wq=np.dot(w,q);det=vv*ww-vw*vw;s=(ww*uq-vw*wq)/det;t=(vv*wq-vw*uq)/det;bary=np.array([1-s-t,s,t]);point=bary@triangle;normal=bary@n[f[fi]];normal/=np.linalg.norm(normal);name,pi,local,ids=references[fi];return {'node':name,'primitive':pi,'triangle':local,'ids':ids,'barycentric':bary.tolist(),'point':point.tolist(),'normal':normal.tolist()}
old=json.loads((R/'public/golden-derivation/construction.json').read_text());controls=np.asarray(old['seam']['controlsXY']);px=old['calibration']['eyelets'][3]['point'][0];toe=np.asarray(old['landmarks']['toe'][:2]);heel=np.asarray(old['landmarks']['heel'][:2]);band=np.flatnonzero((abs(v[:,0]-heel[0])<.006)&(v[:,2]>.15));hi=int(band[np.argmax(v[band,1])]);heel=v[hi,:2].astype('f8');lo,upper,node_name,primitive=next(row for row in vertex_ranges if row[0]<=hi<row[1]);heel_anchor={'node':node_name,'primitive':primitive,'vertex':hi-lo,'point':v[hi].tolist()};slope=(heel[1]-toe[1])/(heel[0]-toe[0]);p=np.array([px,toe[1]+(px-toe[0])*slope]);x=np.linspace(controls[0,0],controls[-1,0],241)
# Preserve the approved 2D design relationship, but project every anchor anew.
# Smooth cubic Hermite interpolation with a compact tangent fit around P.
y=np.interp(x,controls[:,0],controls[:,1]);dx=.001
seed=lambda t:float(np.interp(t,controls[:,0],controls[:,1]));delta=slope-(seed(px+dx)-seed(px-dx))/(2*dx);off=p[1]-seed(px);q=(x-px)/.075;y+=(off+delta*(x-px))*np.maximum(0,1-q*q)**3
anchors=[hit(a,b) for a,b in zip(x,y)];seam=[(np.asarray(a['point'])+np.asarray(a['normal'])*.0025).tolist() for a in anchors];eyelets=[]
for e in old['calibration']['eyelets']:
 cx,cy=e['point'][:2];rim=[]
 for r in [.020,.030,.042]:
  for angle in np.linspace(0,2*np.pi,16,endpoint=False):
   try:rim.append(hit(cx+np.cos(angle)*r,cy+np.sin(angle)*r))
   except ValueError:pass
 if len(rim)<3:raise ValueError('Eyelet cue has no reliable SOUL rim neighborhood')
 eyelets.append({'numberFromToe':e['numberFromToe'],'point':[cx,cy,float(np.median([a['point'][2] for a in rim]))],'rimSurfaceAnchors':rim,'method':'hole-center spatial cue (not a face), constrained by newly projected actual SOUL rim neighborhood; visually reviewed'})
e=(heel-p)/np.linalg.norm(heel-p);down=np.array([e[1],-e[0]]);depth=float(bounds[1][2]+.013);lift=lambda z:[float(z[0]),float(z[1]),depth];source=json.loads((R/'research/golden-derivation/soul-v1-3/export.json').read_text());data={'revision':'soul-1.3','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBlendSha256':source['source']['sha256'],'sourceBounds':bounds,'sourceTriangles':face_count,'sourceVertices':sum(len(a) for a in all_vertices),'calibration':{'contactEyeletNumber':4,'eyelets':eyelets,'secondSpiralStart':'cyan lower endpoint Q','countingDirection':'toe to shoe opening, visible laced row only; cuff eyelets excluded','heelSurfaceVertex':heel_anchor},'seam':{'points':seam,'anchors':anchors,'controlsXY':controls.tolist()},'landmarks':{'toe':lift(toe),'heel':lift(heel),'contact':lift(p)},'frame':{'origin':lift(p),'axis':[*e.tolist(),0],'down':[*down.tolist(),0],'height':.365,'depth':depth},'notes':['New GLB exported from read-only SOUL.NEW.blend; all original source triangles retained.','Every seam anchor and eyelet cue references the new SOUL GLB, no old source face IDs reused.','Side design coordinates are a visual design calibration, not measured manufacturing dimensions.','Euclidean golden-ratio construction is on a separate plane, not a geodesic claim.'],'validation':{'surfaceAnchors':len(anchors),'allFrontSurface':all(a['point'][2]>.12 for a in anchors),'minimumDepth':min(a['point'][2] for a in anchors),'maximumDepth':max(a['point'][2] for a in anchors),'sourceModelSaved':False,'sourceSemanticLabelsChanged':False}}
(folder/'construction.json').write_text(json.dumps(data,ensure_ascii=False,indent=2));(folder/'asset-manifest.json').write_text(json.dumps(source,indent=2));print('NEW_SOUL_CONSTRUCTION',json.dumps({k:data[k] for k in ['sourceTriangles','sourceVertices','sourceBounds','validation']}),flush=True)
