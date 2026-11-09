from pathlib import Path
import sys,json,copy,struct,hashlib,numpy as np
R=Path(__file__).resolve().parents[1];sys.path.insert(0,'/workspace/artifacts/glb-transfer-01-audit');from audit_glb import GLB
SRC=Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb');g=GLB(SRC);doc=copy.deepcopy(g.doc);blob=bytearray(g.bin);data=np.load(R/'data/tongue-rebuilt.npz');remove=data['sourceRemove'];lace=data['debugLace'];body=np.load(R/'data/source-body.npz');lens=body['primitiveLengths'];lens=np.r_[0,np.cumsum(lens)]
def append(raw,target=None):
 while len(blob)%4:blob.append(0)
 view={'buffer':0,'byteOffset':len(blob),'byteLength':len(raw)}
 if target:view['target']=target
 doc['bufferViews'].append(view);blob.extend(raw);return len(doc['bufferViews'])-1
def acc(a,kind,component=5126,target=34962):
 a=np.asarray(a,dtype='<f4' if component==5126 else '<u4');v={'bufferView':append(a.tobytes(),target),'componentType':component,'count':len(a),'type':kind}
 if kind=='VEC3' and component==5126:v.update(min=a.min(0).tolist(),max=a.max(0).tolist())
 doc['accessors'].append(v);return len(doc['accessors'])-1
bodyprims=[];laceprims=[]
for i,pr in enumerate(doc['meshes'][0]['primitives']):
 old=g.accessor(pr['indices']).reshape(-1,3);start,end=lens[i:i+2]
 for dst,sel in [(bodyprims,~remove[start:end]&~lace[start:end]),(laceprims,lace[start:end])]:
  if not sel.any():continue
  new=copy.deepcopy(pr);new['indices']=acc(old[sel].reshape(-1),'SCALAR',5125,34963);dst.append(new)
doc['meshes'][0]['primitives']=bodyprims;doc['meshes'][0]['name']='GEO_V4_PROTECTED_BODY_LOCAL_TONGUE_REMOVAL'
doc['meshes'].append({'name':'DEBUG_V4_LACES_UNCHANGED_GEOMETRY','primitives':laceprims});doc['nodes'].append({'name':'DEBUG_LACES_VISIBILITY_ONLY','mesh':len(doc['meshes'])-1,'extras':{'purpose':'Visibility grouping only; no shape or UV edit. Not a complete physical lace segmentation.','bindTranslation':[0,0,0]}});laceNode=len(doc['nodes'])-1;doc['nodes'][0]['children'].append(laceNode)
for name in ['tongue-front-basecolor.png','tongue-front-metallic-roughness.png']:
 doc['images'].append({'name':'V51_'+name,'mimeType':'image/png','bufferView':append((R/'data'/name).read_bytes())});doc['textures'].append({'source':len(doc['images'])-1,'sampler':0})
material=copy.deepcopy(doc['materials'][9]);material['name']='MAT_TONGUE_V4_APPEARANCE_RESAMPLED';material['pbrMetallicRoughness']['baseColorTexture']['index']=len(doc['textures'])-2;material['pbrMetallicRoughness']['metallicRoughnessTexture']['index']=len(doc['textures'])-1;doc['materials'].append(material);frontMat=len(doc['materials'])-1
def linear(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
doc['materials'].append({'name':'MAT_TONGUE_HIDDEN_MATCHED_V4_CLOTH','pbrMetallicRoughness':{'baseColorFactor':[linear(7/255),linear(21/255),linear(83/255),1],'roughnessFactor':244/255,'metallicFactor':0},'doubleSided':False,'extras':{'source':'V4 cloth color and roughness; hidden/back material final confirmation pending','noOtherPartArtworkCopied':True}});hiddenMat=len(doc['materials'])-1
p=data['positions'];f=data['faces'];n=data['normals'];u=data['uv'];role=data['role'];upperCount=int(data['upperVertexCount']);fv=int(data['frontVertexCount']);attrs={'POSITION':acc(p,'VEC3'),'NORMAL':acc(n,'VEC3'),'TEXCOORD_0':acc(u,'VEC2')};prims=[]
rimUpper=(role==3)&np.all((f%fv)<upperCount,axis=1)
for name,sel,m in [('upperFront',role==0,frontMat),('hiddenContinuousFront',role==1,hiddenMat),('back',role==2,hiddenMat)]:
 if sel.any():prims.append({'attributes':attrs.copy(),'indices':acc(f[sel].reshape(-1),'SCALAR',5125,34963),'material':m,'extras':{'surfaceRole':name}})
rf=f[role==3];rp=p[rf].reshape(-1,3);rn=np.cross(rp.reshape(-1,3,3)[:,1]-rp.reshape(-1,3,3)[:,0],rp.reshape(-1,3,3)[:,2]-rp.reshape(-1,3,3)[:,0]);rn/=np.maximum(np.linalg.norm(rn,axis=1)[:,None],1e-30);rn=np.repeat(rn,3,axis=0);quads=len(rf)//2;grid=int(np.ceil(np.sqrt(quads)));tile=np.array([[[.05,.05],[.95,.05],[.95,.95]],[[.05,.05],[.95,.95],[.05,.95]]]);ruv=np.empty((len(rf),3,2),'f4')
for i in range(quads):ruv[i*2:i*2+2]=(tile+np.array([i%grid,i//grid]))/grid
rimattrs={'POSITION':acc(rp,'VEC3'),'NORMAL':acc(rn,'VEC3'),'TEXCOORD_0':acc(ruv.reshape(-1,2),'VEC2')};prims.append({'attributes':rimattrs,'indices':acc(np.arange(len(rp)),'SCALAR',5125,34963),'material':hiddenMat,'extras':{'surfaceRole':'rimSeparateUVIslands','chart':'padded non-overlapping quad islands; no zero-area UV'}})
doc['meshes'].append({'name':'GEO_TONGUE_CONTINUOUS_SHELL_V5_1','primitives':prims,'extras':{'thickness':float(data['thickness']),'twoOriginalHolesRetained':True,'oneConnectedPhysicalShell':True}});doc['nodes'].append({'name':'TONGUE_ASSEMBLY_V5_1','children':[],'extras':{'bindTranslation':[0,0,0],'rootSeamStatus':'PROVISIONAL_REQUIRES_CONFIRMATION','foldControllerReady':True}});assembly=len(doc['nodes'])-1;doc['nodes'].append({'name':'GEO_TONGUE_CONTINUOUS_FRONT_BACK','mesh':len(doc['meshes'])-1,'extras':{'semanticPartId':'tongue.continuous','upperSurfaceUV':'V4 appearance captured into independent chart; original V4 UV streams preserved in protected body','frontAndBackConnected':True}});tongueNode=len(doc['nodes'])-1;doc['nodes'][assembly]['children'].append(tongueNode);doc['nodes'][0]['children'].append(assembly)
doc['nodes'].append({'name':'ANCHOR_TONGUE_ROOT_PROVISIONAL','translation':data['positions'][data['rootFront']].mean(0).astype(float).tolist(),'extras':{'status':'test attachment inferred from throat geometry; confirm factory seam before animation','sourceGLBSHA256':hashlib.sha256(g.raw).hexdigest()}});anchor=len(doc['nodes'])-1;doc['nodes'][0]['children'].append(anchor)
doc['asset']['generator']='Soulgrain V5.1 tongue-only structural TEST';doc.setdefault('extras',{}).update({'version':'5.1 TEST','sourceV4SHA256':hashlib.sha256(g.raw).hexdigest(),'scope':'Tongue shell and necessary local removal only; other geometry and original images preserved.','pendingConfirmation':['Exact root seam and hidden back fabric specification'],'debugLaceNode':laceNode,'tongueAssemblyNode':assembly,'tongueMeshNode':tongueNode,'rootAnchorNode':anchor})
while len(blob)%4:blob.append(0)
doc['buffers'][0]['byteLength']=len(blob);js=json.dumps(doc,separators=(',',':'),allow_nan=False).encode();js+=b' '*((-len(js))%4);out=R/'output/SOULGRAIN-V5.1-tongue-structure-test.glb';out.write_bytes(struct.pack('<4sII',b'glTF',2,28+len(js)+len(blob))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(blob),b'BIN\0')+blob)
(R/'reports/export.json').write_text(json.dumps({'file':str(out),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'nodes':len(doc['nodes']),'tongueNode':tongueNode,'assemblyNode':assembly,'laceNode':laceNode,'imagesEmbedded':len(doc['images']),'originalImagesBytePreserved':len(g.doc['images']),'sourceOriginalFileUnchanged':True},indent=2));print('Exported',out,flush=True)
