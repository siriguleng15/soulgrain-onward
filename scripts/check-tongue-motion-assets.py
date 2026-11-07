#!/usr/bin/env python3
"""Numerical validation of the actual morph cache and approved asset identities."""
from pathlib import Path
import json,hashlib,sys
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'modeling/tongue-motion-lab'));from build_motion import load
OUT=ROOT/'public/tongue-motion-lab/verification';ASSET=ROOT/'public/tongue-motion-lab/assets'
def main():
 m=json.loads((ASSET/'motion-contract.json').read_text());data=(ASSET/'tongue-cuff-morphs.f16').read_bytes();assert hashlib.sha256(data).hexdigest()==m['cacheSHA256'];assert len(data)==m['cacheBytes']
 for name,s in m['sections'].items():
  arr=np.frombuffer(data,dtype=s['type'],count=s['bytes']//np.dtype(s['type']).itemsize,offset=s['offset']);assert np.isfinite(arr).all(),name
 def read(name):
  s=m['sections'][name];return np.frombuffer(data,dtype=s['type'],count=s['bytes']//np.dtype(s['type']).itemsize,offset=s['offset']).astype(float).reshape(s['shape'])
 sg,sr,ss=load(ROOT/'public/assets/onward-ad-v1/onward-ad-v1.glb');pg,pr,ps=load(ROOT/'public/tongue-sleeve-lab/assets/user-hand-parts.glb');assert ss==m['sourceShoeSHA256']=='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4';assert ps==m['sourcePartsSHA256']=='4322c0c2b1f613ba152ee742f3ca9d69f98c97c6a71cab3eaf4fabebbad53798'
 root_pr=sg['meshes'][sg['nodes'][4]['mesh']]['primitives'][2];root_p=sr(root_pr['attributes']['POSITION']);assert np.array_equal(root_p,read('tongue-2-lift-p'));assert np.array_equal(root_p,read('tongue-2-installed-p'))
 for f in m['followers']:
  prim=sg['meshes'][sg['nodes'][f['node']]['mesh']]['primitives'][f['primitive']];p=sr(prim['attributes']['POSITION'])
  for kind in ['lift','installed']:assert np.any(p!=read(f['prefix']+'-'+kind+'-p'),axis=1).sum()<=f['movingVertices']
 c0=read('cuff-0-p');c8=read('cuff-8-p');x=c0-c0.mean(0);y=c8-c8.mean(0);u,_,v=np.linalg.svd(x.T@y);rotation=u@v;residual=float(np.sqrt(np.mean(np.sum((x@rotation-y)**2,axis=1))));assert residual>.002,'Flip is only a rigid rotation'
 bindings=json.loads((ROOT/'public/tongue-sleeve-lab/assets/cuff-medallion-bindings.json').read_text());cuff_node=next(n for n in pg['nodes'] if n['name']=='Horseshoe_Cuff');cuff_pr=pg['meshes'][cuff_node['mesh']]['primitives'][0];faces=pr(cuff_pr['indices']).reshape(-1,3);skin_node=next(n for n in pg['nodes'] if n['name']=='Hand_Skin');skin_pr=pg['meshes'][skin_node['mesh']]['primitives'][0];hp=pr(skin_pr['attributes']['POSITION']).astype(float);hf=pr(skin_pr['indices']).reshape(-1,3);tri=hp[hf];a,b,c=tri[:,0],tri[:,1],tri[:,2];e=b-a;v=c-a;det=e[:,0]*v[:,2]-e[:,2]*v[:,0];valid=abs(det)>1e-14;cover=read('cuff-16-p');clearances=[]
 for anchor in bindings['anchors'][::2]:
  point=(cover[faces[anchor['triangle']]]*np.asarray(anchor['barycentric'])[:,None]).sum(0);d=point-a;u=np.divide(d[:,0]*v[:,2]-d[:,2]*v[:,0],det,out=np.zeros(len(det)),where=valid);w=np.divide(e[:,0]*d[:,2]-e[:,2]*d[:,0],det,out=np.zeros(len(det)),where=valid);mask=valid&(u>=0)&(w>=0)&(u+w<=1)
  if mask.any():top=(a[:,1]+u*e[:,1]+w*v[:,1])[mask].max();clearances.append(float(point[1]-top))
 print('HAND_SUPPORT_CLEARANCE',len(clearances),min(clearances),max(clearances),np.quantile(clearances,[0,.05,.5,.95,1]),flush=True);assert len(clearances)>50;assert min(clearances)>-.001,'Cloth penetrates hand at bound ornament positions'
 crystal=Image.open(ASSET/'crystal-color.png');assert crystal.size==(1024,1024);colors=np.unique(np.asarray(crystal).reshape(-1,3),axis=0);assert len(colors)>512 and np.asarray(crystal).reshape(-1,3).std(0)[2]>20,'Crystal is only a flat color';facet_normal=np.asarray(Image.open(ASSET/'crystal-normal.png'));assert facet_normal[:,:,:2].std()>15,'Crystal lacks actual facet-normal relief'
 poses=json.loads((ASSET/'hand-contact-poses.json').read_text());assert poses['pinchContact']['errorMetres']<.0002;assert poses['snapContact']['errorMetres']<.0002
 report={'passed':True,'sourceShoeSHA256':ss,'sourcePartsSHA256':ps,'cacheSHA256':m['cacheSHA256'],'finiteCache':True,'sourceTopologyRetained':True,'footConnectedTongueRootExactlyPinned':True,'tongueTrimFollowers':m['followers'],'nonRigidBestFitResidualMetres':residual,'handRoofChecks':len(clearances),'minimumClothHeightAboveHandMetres':min(clearances),'maximumClothHeightAboveHandMetres':max(clearances),'crystalUniqueColors':len(colors),'sourceFreeArcMetres':m['sourceFreeArcLengthMetres'],'fittedFreeArcMetres':m['fittedFreeArcLengthMetres'],'pinchPoseErrorMetres':poses['pinchContact']['errorMetres'],'snapPoseErrorMetres':poses['snapContact']['errorMetres'],'note':'Numerical checks at sampled ornament positions; not a complete cloth collision proof or factory dimensional certification.'};OUT.mkdir(exist_ok=True,parents=True);(OUT/'asset-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
