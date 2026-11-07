"""Author a new, project-owned finger rig for the uploaded user's hand surface.
This does not substitute an anatomical third-party hand. Source GLB is read only.
"""
from pathlib import Path
import json,struct,hashlib
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra
ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent;OUT=ROOT/'public/tongue-sleeve-lab/assets'
CHAINS={
 'thumb':[[0,-.15,.27],[-.13,-.15,.38],[-.22,-.145,.46],[-.255,-.14,.525]],
 'index':[[-.02,-.015,.48],[-.022,.02,.65],[-.03,.052,.76],[-.035,.06,.839]],
 'middle':[[.068,-.07,.49],[.065,-.06,.69],[.05,-.06,.83],[.053,-.06,.937]],
 'ring':[[.16,-.095,.46],[.16,-.09,.68],[.15,-.085,.82],[.147,-.09,.93]],
 'pinky':[[.23,-.165,.42],[.235,-.16,.58],[.23,-.15,.71],[.224,-.15,.795]],
}

def main():
 src=OUT/'user-hand-parts.glb';data=src.read_bytes();n=struct.unpack_from('<I',data,12)[0];g=json.loads(data[20:20+n]);blob=data[28+n:];node=next(x for x in g['nodes'] if x['name']=='Hand_Skin');primitive=g['meshes'][node['mesh']]['primitives'][0]
 def read(i):
  a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];count={'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']];return np.frombuffer(blob,'<f4' if a['componentType']==5126 else '<u4',a['count']*count,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,count)
 p=read(primitive['attributes']['POSITION']).copy();normal=read(primitive['attributes']['NORMAL']).copy();uv=read(primitive['attributes']['TEXCOORD_0']).copy();faces=read(primitive['indices']).reshape(-1,3).copy();origin=np.array(g['extras']['rawOrigin']);scale=g['extras']['rawToMetres'];raw=p/scale+origin
 e=np.concatenate([faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]]);e=np.unique(np.sort(e,axis=1),axis=0);length=np.linalg.norm(raw[e[:,0]]-raw[e[:,1]],axis=1);graph=coo_matrix((length,(e[:,0],e[:,1])),shape=(len(raw),len(raw))).tocsr();seeds=[int(np.argmin(np.linalg.norm(raw-np.array(v[-1]),axis=1))) for v in CHAINS.values()];dist=dijkstra(graph,directed=False,indices=seeds)
 # Geodesics stop a nearby neighboring finger stealing weights across an air gap.
 likelihood=np.exp(-(dist-dist.min(0))*75);likelihood/=likelihood.sum(0)
 weights=np.zeros((len(raw),22));bones=[{'name':'wrist','parent':None,'position':([.006776,-.138807,.100741]-origin).tolist()},{'name':'palm','parent':0,'position':([.04,-.09,.38]-origin).tolist()}];heads=[np.array(b['position'])*scale for b in bones]
 base_weight=np.clip((raw[:,2]-.40)/.18,0,1);weights[:,0]=np.clip((.30-raw[:,2])/.18,0,1);weights[:,1]=1-weights[:,0]
 for fi,(name,chain) in enumerate(CHAINS.items()):
  chain=np.asarray(chain);start=len(bones)
  for j in range(4):bones.append({'name':name+('_tip' if j==3 else '_'+str(j+1)),'parent':1 if j==0 else len(bones)-1,'position':((chain[j]-origin)*scale).tolist()});heads.append((chain[j]-origin)*scale)
  # Thumb starts at the palm, other fingers blend in closer to the knuckles.
  strength=np.clip((-raw[:,0]-.035)/.12,0,1)*np.clip((raw[:,2]-.23)/.12,0,1) if name=='thumb' else base_weight
  amount=likelihood[fi]*strength
  nearest=np.zeros(len(raw));best=np.full(len(raw),np.inf);distance=[0];lengths=np.linalg.norm(np.diff(chain,axis=0),axis=1);distance.extend(np.cumsum(lengths))
  for j in range(3):
   edge=chain[j+1]-chain[j];t=np.clip((raw-chain[j])@edge/(edge@edge),0,1);d=np.linalg.norm(raw-(chain[j]+t[:,None]*edge),axis=1);mask=d<best;nearest[mask]=distance[j]+t[mask]*lengths[j];best[mask]=d[mask]
  # Smooth skin weights across each articulated knuckle.
  w=np.zeros((len(raw),3));w[:,0]=1
  for j in [1,2]:
   t=np.clip((nearest-distance[j]+.045)/.09,0,1);w[:,:j]*=(1-t[:,None]);w[:,j]=t
  for j in range(3):weights[:,start+j]=amount*w[:,j]
 total=weights[:,2:].sum(1);weights[:,0:2]*=(1-total[:,None]);weights/=weights.sum(1,keepdims=True)
 joints=np.argsort(weights,axis=1)[:,-4:];skin=np.take_along_axis(weights,joints,axis=1);skin/=skin.sum(1,keepdims=True)
 binary=bytearray();views=[];access=[]
 def add(array,kind,component,target=None):
  arr=np.asarray(array,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[component]);start=len(binary);binary.extend(arr.tobytes());binary.extend(b'\0'*((-len(binary))%4));view={'buffer':0,'byteOffset':start,'byteLength':arr.nbytes}
  if target:view['target']=target
  views.append(view);a={'bufferView':len(views)-1,'componentType':component,'count':len(arr),'type':kind}
  if kind=='VEC3':a.update(min=arr.min(0).astype(float).tolist(),max=arr.max(0).astype(float).tolist())
  access.append(a);return len(access)-1
 attrs={'POSITION':add(p,'VEC3',5126,34962),'NORMAL':add(normal,'VEC3',5126,34962),'TEXCOORD_0':add(uv,'VEC2',5126,34962),'JOINTS_0':add(joints,'VEC4',5123,34962),'WEIGHTS_0':add(skin,'VEC4',5126,34962)};idx=add(faces.reshape(-1),'SCALAR',5125,34963)
 inverse=np.repeat(np.eye(4)[None],len(bones),axis=0);inverse[:,:3,3]=-np.asarray(heads);ib=add(inverse.transpose(0,2,1).reshape(-1,16),'MAT4',5126)
 nodes=[]
 for i,b in enumerate(bones):
  # All rest rotations are identity. Local +X curls +Z fingers toward palm -Y.
  absolute=np.asarray(heads[i]);parent=b['parent'];local=absolute if parent is None else absolute-heads[parent];nodes.append({'name':b['name'],'translation':local.tolist(),'children':[j for j,c in enumerate(bones) if c['parent']==i]})
 nodes.append({'name':'User_Hand_Skinned','mesh':0,'skin':0});meta={'sourceSHA256':g['extras']['sourceSHA256'],'derivedHandPositionSHA256':hashlib.sha256(p.tobytes()).hexdigest(),'method':'Project-authored 22-joint finger rig, geodesic finger segmentation and smooth joint weights; no third-party hand mesh','rawOrigin':origin.tolist(),'rawToMetres':scale,'boneNames':[b['name'] for b in bones],'requiresContactPoseArtReview':True}
 doc={'asset':{'version':'2.0','generator':'Soulgrain user hand rig authoring'},'scene':0,'scenes':[{'nodes':[0,len(bones)]}],'nodes':nodes,'skins':[{'name':'User_Hand_22_Joints','skeleton':0,'joints':list(range(len(bones))),'inverseBindMatrices':ib}],'meshes':[{'name':'User_Hand_Skinned','primitives':[{'attributes':attrs,'indices':idx,'material':0}]}],'materials':[g['materials'][1]],'bufferViews':views,'accessors':access,'buffers':[{'byteLength':len(binary)}],'extras':meta};text=json.dumps(doc,separators=(',',':')).encode();text+=b' '*((-len(text))%4);out=OUT/'user-hand-rig.glb';out.write_bytes(struct.pack('<III',0x46546c67,2,12+8+len(text)+8+len(binary))+struct.pack('<II',len(text),0x4e4f534a)+text+struct.pack('<II',len(binary),0x004e4942)+binary)
 report={**meta,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'vertices':len(p),'triangles':len(faces),'maxWeightsPerVertex':4,'weightSumMaxError':float(abs(skin.sum(1)-1).max())};(HERE/'rig-report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
