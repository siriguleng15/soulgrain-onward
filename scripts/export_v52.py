from common import *
import trimesh,hashlib
from PIL import Image
w=Writer();q=np.load(R/'data/two-panels.npz');clean=np.load(R/'data/cleanup.npz');remove=clean['laces']|clean['oldTongue'];w.split_body({'V4_BODY_NO_LACES_TONGUE_OPENING_CLEANED':~remove});doc=w.doc
doc['nodes'].append({'name':'TONGUE_TWO_SEWN_PATTERNS_V5_2','children':[],'extras':{'structure':'front fan toward toe; narrow edge sewn to back top, confirmed by user','isInspectionAssembly':True}});assembly=len(doc['nodes'])-1;doc['nodes'][0]['children'].append(assembly)
patch=Path('/workspace/artifacts/glb-material-finish-v4/textures/B-source-blue-cloth.png');texture=patch.read_bytes();doc['images'].append({'name':'V4_original_blue_canvas_patch','mimeType':'image/png','bufferView':w.add(texture)});doc['textures'].append({'source':len(doc['images'])-1,'sampler':0});texid=len(doc['textures'])-1
def linear(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
avg=np.asarray(Image.open(patch).convert('RGB')).mean((0,1))/255;target=np.array([7,21,83])/255;factor=[linear(t)/max(linear(a),1e-7) for t,a in zip(target,avg)];doc['materials'].append({'name':'MAT_V52_NAVY_CANVAS_V4_MATCH','pbrMetallicRoughness':{'baseColorFactor':[min(v,1) for v in factor]+[1],'baseColorTexture':{'index':texid},'roughnessFactor':.955,'metallicFactor':0},'doubleSided':False});clothmat=len(doc['materials'])-1
doc['materials'].append({'name':'MAT_V52_WHITE_OVERLOCK','pbrMetallicRoughness':{'baseColorFactor':[linear(251/255),linear(245/255),linear(225/255),1],'roughnessFactor':.94,'metallicFactor':0}});threadmat=len(doc['materials'])-1
p=q['positions'];f=q['faces'];normal=q['normals'];part=q['part'];fv=int(q['frontVertexCount']);fa=q['frontPattern'];ba=q['backPattern'];bmap=q['backVertexMap'];faUV=np.zeros((fv,2),'f4');faUV[:len(fa)]=fa/.45;baUV=np.zeros((fv,2),'f4');baUV[bmap]=ba/.45;posacc=w.accessor(p,'VEC3',5126);nacc=w.accessor(normal,'VEC3',5126)
for name,role,uv in [('PNL_FRONT_FAN_AND_FLAT_LACING_DECK',0,faUV),('PNL_BACK_FOLD_ROUNDED_TWO_HOLES',1,baUV)]:
  attrs={'POSITION':posacc,'NORMAL':nacc,'TEXCOORD_0':w.accessor(np.vstack([uv,uv]),'VEC2',5126)};pr=[{'attributes':attrs,'indices':w.accessor(f[part==role].reshape(-1)),'material':clothmat}];w.node_mesh(name,pr,assembly,{'patternPart':'front' if role==0 else 'back','paperPatternSource':'user supplied and assembly confirmed'})
# Thickness UVs are independent padded edge-quad islands.
rf=f[part==2];rp=p[rf].reshape(-1,3);rn=np.cross(rp.reshape(-1,3,3)[:,1]-rp.reshape(-1,3,3)[:,0],rp.reshape(-1,3,3)[:,2]-rp.reshape(-1,3,3)[:,0]);rn/=np.maximum(np.linalg.norm(rn,axis=1)[:,None],1e-20);rn=np.repeat(rn,3,axis=0);nq=len(rf)//2;grid=int(np.ceil(np.sqrt(nq)));tile=np.array([[[.05,.05],[.95,.05],[.95,.95]],[[.05,.05],[.95,.95],[.05,.95]]]);ruv=np.vstack([(tile+[i%grid,i//grid])/grid for i in range(nq)]).reshape(-1,2);attrs={'POSITION':w.accessor(rp,'VEC3',5126),'NORMAL':w.accessor(rn,'VEC3',5126),'TEXCOORD_0':w.accessor(ruv,'VEC2',5126)};w.node_mesh('GEO_TONGUE_THICKNESS_AND_HOLE_WALLS',[{'attributes':attrs,'indices':w.accessor(np.arange(len(rp))),'material':clothmat}],assembly)
def solid_node(name,points,faces,material):
 mesh=trimesh.Trimesh(points,faces,process=False);assert np.isfinite(points).all();attrs={'POSITION':w.accessor(points,'VEC3',5126),'NORMAL':w.accessor(mesh.vertex_normals,'VEC3',5126)};w.node_mesh(name,[{'attributes':attrs,'indices':w.accessor(np.asarray(faces).reshape(-1)),'material':material}],assembly)
for index,(center,du,dv,n) in enumerate(zip(q['holeCenters'],q['holeU'],q['holeV'],q['holeNormals'])):
 U=du/np.linalg.norm(du);V=dv/np.linalg.norm(dv);vscale=np.linalg.norm(dv)/np.linalg.norm(du);profile=np.array([[1,.003],[1.12,.005],[1.65,.005],[1.80,.0025],[1.72,-.002],[1.1,-.003],[1,-.001]]);th=np.linspace(0,2*np.pi,65)[:-1];points=[]
 for radius,depth in profile:
  points.extend(center+.0174*radius*(np.cos(th)[:,None]*U+vscale*np.sin(th)[:,None]*V)+depth*n)
 faces=[];nr=len(profile)
 for j in range(nr):
  for k in range(64):a=j*64+k;b=j*64+(k+1)%64;c=((j+1)%nr)*64+(k+1)%64;d=((j+1)%nr)*64+k;faces.extend([[a,b,c],[a,c,d]])
 points=np.asarray(points);faces=np.array(faces);mesh=trimesh.Trimesh(points,faces,process=False)
 if mesh.volume<0:faces=faces[:,::-1]
 solid_node(f'GEO_TONGUE_SILVER_EYELET_{index+1}',points,faces,7)
path=q['zigzag'];tangent=np.gradient(path,axis=0);tangent/=np.maximum(np.linalg.norm(tangent,axis=1)[:,None],1e-20);rings=[]
for point,tan in zip(path,tangent):
 ref=np.array([0,0,1.])
 if abs(tan@ref)>.9:ref=np.array([0,1.,0])
 U=np.cross(tan,ref);U/=np.linalg.norm(U);V=np.cross(tan,U);theta=np.arange(8)/8*2*np.pi;rings.extend(point+.0009*(np.cos(theta)[:,None]*U+np.sin(theta)[:,None]*V))
tf=[]
for j in range(len(path)-1):
 for k in range(8):a=j*8+k;b=j*8+(k+1)%8;c=(j+1)*8+(k+1)%8;d=(j+1)*8+k;tf.extend([[a,b,c],[a,c,d]])
rings=np.asarray(rings);start=len(rings);rings=np.vstack([rings,path[0],path[-1]])
for k in range(8):tf.extend([[start,(k+1)%8,k],[start+1,(len(path)-1)*8+k,(len(path)-1)*8+(k+1)%8]])
tf=np.asarray(tf);mesh=trimesh.Trimesh(rings,tf,process=False)
if mesh.volume<0:tf=tf[:,::-1]
solid_node('DEC_CONTINUOUS_WHITE_ZIGZAG_OVERLOCK',rings,tf,threadmat)
doc['asset']['generator']='Soulgrain V5.2 USER TWO-PATTERN TONGUE; actual lace removal';doc.setdefault('extras',{}).update({'version':'V5.2 test','sourceV4SHA256':hashlib.sha256(w.g.raw).hexdigest(),'notBasedOnRejectedV51Geometry':True,'assemblyNode':assembly,'knownLaceGeometryActuallyDeleted':True,'fusedEyeletJunctionNeedsReview':True,'frontBackPatternAssemblyUserConfirmed':True,'websiteChanged':False});out=R/'output/SOULGRAIN-V5.2-no-laces-two-panel-tongue.glb';w.write(out);report={'file':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'tongueAssemblyNode':assembly,'removedOriginalFaces':int(remove.sum()),'preservedOriginalImages':len(w.g.doc['images']),'sourceV4Unchanged':hashlib.sha256(SRC.read_bytes()).hexdigest()==doc['extras']['sourceV4SHA256']};(R/'reports/export.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
