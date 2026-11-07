#!/usr/bin/env python3
"""Repeatable numerical checks, including source-surface coverage per triangle."""
from pathlib import Path
import hashlib,json,struct
import numpy as np
ROOT=Path(__file__).resolve().parents[1];ART=ROOT/'public/tongue-sleeve-lab/assets';MODEL=ROOT/'modeling/tongue-sleeve-lab';OUT=ROOT/'public/tongue-sleeve-lab/verification'

def glb(path):
 d=path.read_bytes();n=struct.unpack_from('<I',d,12)[0];g=json.loads(d[20:20+n]);return g,d[28+n:],d

def accessor(g,b,i):
 a=g['accessors'][i];v=g['bufferViews'][a['bufferView']];cnt={'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16,'SCALAR':1}[a['type']];return np.frombuffer(b,{5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],a['count']*cnt,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(-1,cnt)

def mesh(g,b,name):
 node=next(x for x in g['nodes'] if x.get('name')==name);prim=g['meshes'][node['mesh']]['primitives'][0];p=accessor(g,b,prim['attributes']['POSITION']);f=accessor(g,b,prim['indices']).reshape(-1,3);return p,f,prim

def areas(p,f):return np.linalg.norm(np.cross(p[f[:,1]]-p[f[:,0]],p[f[:,2]]-p[f[:,0]]),axis=1)/2

def main():
 sg,sb,sd=glb(ROOT/'public/assets/onward-ad-v1/onward-ad-v1.glb');bg,bb,bd=glb(ART/'shoe-tongue-blank.glb');hg,hb,hd=glb(ART/'user-hand-original.glb');dg,db,dd=glb(ART/'user-hand-parts.glb');rg,rb,rd=glb(ART/'user-hand-rig.glb')
 assert hashlib.sha256(sd).hexdigest()=='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4';assert hashlib.sha256(hd).hexdigest()=='9608397f034b054b914c78f7bbf2a01404496045f2fc37d55efadf027c3b7637';assert sb==bb,'Shoe source binary changed'
 for i,(sm,bm) in enumerate(zip(sg['meshes'],bg['meshes'])):
  for j,(sp,bp) in enumerate(zip(sm['primitives'],bm['primitives'])):
   assert sp['attributes']==bp['attributes'] and sp['indices']==bp['indices']
   assert sp['material']==bp['material'] or (i==sg['nodes'][4]['mesh'] and j==0)
 target=bg['materials'][bg['meshes'][bg['nodes'][4]['mesh']]['primitives'][0]['material']];assert 'baseColorTexture'not in target['pbrMetallicRoughness'];assert 4 in bg['scenes'][0]['nodes'],'Tongue was removed'
 sp,sf,_=mesh(hg,hb,hg['nodes'][0].get('name'));sp=sp.astype(float);source_area=areas(sp,sf);coverage=np.zeros(len(sf));origin=np.array(dg['extras']['rawOrigin']);scale=dg['extras']['rawToMetres'];worst_plane=0;worst_bary=0
 for name in ['Hand_Skin','Robe_Sleeve','Horseshoe_Cuff']:
  p,f,pr=mesh(dg,db,name);p=p.astype(float)/scale+origin;refs=np.load(MODEL/(name.lower()+'-source-faces.npy'));assert len(refs)==len(f);coverage+=np.bincount(refs,weights=areas(p,f),minlength=len(sf))
  source=sp[sf[refs]];a=source[:,0];e=source[:,1]-a;v=source[:,2]-a;n=np.cross(e,v);norm=np.linalg.norm(n,axis=1);unit=n/np.maximum(norm[:,None],1e-20)
  for k in range(3):
   point=p[f[:,k]]-a;plane=abs((point*unit).sum(1));worst_plane=max(worst_plane,float(plane.max()));ee=(e*e).sum(1);vv=(v*v).sum(1);ev=(e*v).sum(1);ep=(e*point).sum(1);vp=(v*point).sum(1);den=ee*vv-ev*ev;u=(vv*ep-ev*vp)/den;w=(ee*vp-ev*ep)/den;worst_bary=max(worst_bary,float(np.maximum.reduce([-u,-w,u+w-1]).max()))
 assert worst_plane<3e-7;assert worst_bary<.002 # Float32 on the smallest source triangles.
 area_error=float(abs(coverage-source_area).sum()/source_area.sum());assert area_error<2e-6,'Original source surface coverage lost or duplicated'
 dp,df,_=mesh(dg,db,'Hand_Skin');rp,rf,rprim=mesh(rg,rb,'User_Hand_Skinned');assert np.array_equal(dp,rp) and np.array_equal(df,rf),'Rig replaced original hand mesh'
 weights=accessor(rg,rb,rprim['attributes']['WEIGHTS_0']);assert abs(weights.sum(1)-1).max()<1e-6;assert len(rg['skins'][0]['joints'])==22
 layout=json.loads((ART/'cuff-medallion-bindings.json').read_text());assert layout['derivedCuffSHA256']==hashlib.sha256(dd).hexdigest();assert len({a['id'] for a in layout['anchors']})==785
 cp,cf,_=mesh(dg,db,'Horseshoe_Cuff');min_up=1
 for a in layout['anchors']:
  w=np.array(a['barycentric']);assert np.min(w)>=0 and abs(w.sum()-1)<1e-8;assert a['triangle']<len(cf);tri=cp[cf[a['triangle']]];normal=np.cross(tri[1]-tri[0],tri[2]-tri[0]);normal/=np.linalg.norm(normal);min_up=min(min_up,float(normal[1]));assert normal[1]>.5
 report={'passed':True,'sourceShoeSHA256':hashlib.sha256(sd).hexdigest(),'sourceHandSHA256':hashlib.sha256(hd).hexdigest(),'blankShoeBINExactlyUnchanged':True,'blankTongueGeometryAndUVUnchanged':True,'originalTongueNodePreserved':True,'onlyReversePrimitiveMaterialChanged':True,'perSourceTriangleAreaCoverageRelativeError':area_error,'maxDerivedPointDistanceFromOriginalFaceRawUnits':worst_plane,'maxFloatBarycentricExcursion':worst_bary,'rigHandPositionsAndIndicesExactlyPreserved':True,'authoredJoints':22,'persistentSilverAnchors':785,'minimumDorsalAnchorNormalY':min_up,'interpretation':'Numerical asset preparation checks, not contact animation, final design fitting or iPad Safari certification.'}
 OUT.mkdir(exist_ok=True,parents=True);(OUT/'asset-validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
