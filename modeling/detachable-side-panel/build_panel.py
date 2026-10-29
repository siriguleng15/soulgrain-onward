#!/usr/bin/env python3
"""A complete, pattern-owned removable panel; not an unwrap of AI triangle IDs.

All poses retain one material topology. The flat rest is exactly the calibrated
paper. A source-side photograph and visible AI cloth constrain the attached
pose. Unobserved depth is completed and explicitly labelled assumed.
"""
from pathlib import Path
import json, math, hashlib, importlib.util
import numpy as np
from scipy.interpolate import RBFInterpolator
from scipy.spatial import cKDTree
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/detachable-side-panel';OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('v10_bridge_tools',ROOT/'modeling/reference-model-v10/build_bridge.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
PAPER=ROOT/'public/pattern-engineering/exports/ONWARD-project.json'
MODEL=ROOT/'public/reference-model-v10/corrected.glb'
rawpaper=PAPER.read_bytes();project=json.loads(rawpaper);pattern=project['pattern']
sourceflat=np.asarray(project['vertexIdentity']['flatMm'],float).reshape(-1,2)
sourcefaces=np.asarray(project['vertexIdentity']['triangleIndices'],int).reshape(-1,3)
params=project['deformation'];W,H=pattern['bounds']['width'],pattern['bounds']['height']
modelraw,doc,binary=helper.read_glb(MODEL)
meta=json.loads((ROOT/'public/reference-model-v10/model-data.json').read_text());reg,right,up,forward=helper.registration(meta)
parts=helper.primitives(doc,binary);helper.prepare(parts,reg,right,up,forward)
SCALE=.0064
ORIGIN=np.array([.80,-.235,.255]);xaxis=-right*SCALE;yaxis=up*SCALE;zaxis=forward*SCALE
M=np.eye(4);M[:3,:3]=np.array([xaxis,yaxis,zaxis]).T;M[:3,3]=ORIGIN
alpha=math.radians(params['hingeAngleDeg']);ca,sa=math.cos(alpha),math.sin(alpha)

def fold(points,p):
    q=np.c_[points,np.zeros(len(points))]
    if p==0:return q
    dx=points[:,0]-params['hingeXmm'];dy=points[:,1]-params['hingeYmm']
    along=dx*ca+dy*sa;d=-dx*sa+dy*ca
    theta=math.radians(params['foldAngleDeg'])*p;width=params['bendWidthMm'];radius=width/theta
    band=np.minimum(np.maximum(d,0),width);angle=theta*band/width
    across=radius*np.sin(angle)+np.maximum(0,d-width)*math.cos(theta)
    depth=radius*(1-np.cos(angle))+np.maximum(0,d-width)*math.sin(theta)
    use=d>0
    q[use,0]=params['hingeXmm']+along[use]*ca-across[use]*sa
    q[use,1]=params['hingeYmm']+along[use]*sa+across[use]*ca
    q[use,2]=depth[use]
    return q

def display(points3):return points3@M[:3,:3].T+ORIGIN

def paperphoto(points3):return np.c_[1194.51801232-points3[:,0]*3.62713332,794.97252730-points3[:,1]*4.13137166]

basefold=fold(sourceflat,1);basephoto=paperphoto(basefold)
# The sole contact is independent of the old eyelet-only camera fit. Anchor
# its observed image position before extending the cuff warp into the body.
solePhoto=np.array([[230,546],[335,574],[500,575],[680,571],[825,566],[980,558],[1125,540],[1207,523]],float)
xs=np.array([0,22,54,91,129,167,205,239,269.],float)
px=1194.51801232-xs*3.62713332
sole_y=np.interp(px,solePhoto[:,0],solePhoto[:,1])
photoCut=np.c_[xs,(794.97252730-sole_y)/4.13137166]

# Four material boundary correspondences supplement the existing eyelet fit.
# They are manual single-photo constraints, never recovered seam measurements.
landmarks=[]
photoeye=[[877,540],[846,469],[818,400],[785,330],[760,259],[719,209],[679,273],[641,331],[577,384],[517,428],[459,466],[399,487],[359,511]]
for h,target in zip([h for h in pattern['holes'] if h['role']=='eyelet'],photoeye):
    if h['id']=='E06':continue
    landmarks.append({'id':h['id'],'flatMm':h['center'],'photoPx':target,'kind':'assumed-eyelet-photo-correspondence'})
boundary=np.asarray(pattern['boundary'],float)
for key,q,target in [('cuff-free-heel',[0,243],[1207,413]),('cuff-free-front',[126,255],[871,590]),('cuff-hinge-heel',[18,160],[1113,140]),('cuff-hinge-front',[149,156],[703,218])]:
    station=boundary[np.argmin(np.linalg.norm(boundary-q,axis=1))]
    landmarks.append({'id':key,'flatMm':station.tolist(),'photoPx':target,'kind':'manual-outline-hypothesis'})
for q,target in zip(photoCut,np.c_[px,sole_y]):
    landmarks.append({'id':'sole-contact-'+str(len(landmarks)),'flatMm':q.tolist(),'photoPx':target.tolist(),'kind':'photo-estimated-sole-contact-not-cut-line'})
control=np.array([l['flatMm']for l in landmarks]);desired=np.array([l['photoPx']for l in landmarks])
residual=desired-paperphoto(fold(control,1))
# Smooth compact registration correction; no changes are made to flat material.
warp=RBFInterpolator(control,residual,kernel='thin_plate_spline',smoothing=8)
photo=basephoto+warp(sourceflat)
hingedistance=-(sourceflat[:,0]-params['hingeXmm'])*sa+(sourceflat[:,1]-params['hingeYmm'])*ca
layers=np.where(hingedistance>0,'cuff','body')
# Surface observations are depth-only, so photographed order is retained.
cloud={}
for role in ['body','cuff']:
    vertices=[]
    for part in parts:
        if part['role']==role:
            centers=part['vertices'].mean(axis=1)
            normals=np.cross(part['vertices'][:,1]-part['vertices'][:,0],part['vertices'][:,2]-part['vertices'][:,0])
            use=(normals@forward<0)&(centers[:,2]>.015)
            vertices.append(centers[use])
    v=np.concatenate(vertices);px=helper.project(v,reg,right,up)
    cloud[role]=(cKDTree(px),v@forward)

# Fit a robust low-frequency surface per layer. Exact first-hit samples retain
# observation provenance, but no single occlusion discontinuity pins the cloth.
def poly_features(points):
    x=(points[:,0]-800)/500;y=(points[:,1]-350)/300
    return np.c_[np.ones(len(x)),x,y,x*x,x*y,y*y]
coefficients={}
for role in ['body','cuff']:
    tree,z=cloud[role];X=poly_features(tree.data)
    weights=np.ones(len(z));coef=np.linalg.lstsq(X,z,rcond=None)[0]
    for _ in range(8):
        residual_z=z-X@coef;scale=max(.003,np.median(np.abs(residual_z))*1.4826)
        weights=np.minimum(1.,2.5*scale/np.maximum(np.abs(residual_z),1e-12))
        coef=np.linalg.lstsq(X*weights[:,None],z*weights,rcond=None)[0]
    coefficients[role]=coef
bodydepth=poly_features(photo)@coefficients['body'];cuffdepth=poly_features(photo)@coefficients['cuff']
d=np.maximum(0,hingedistance);t=np.minimum(1,d/params['bendWidthMm']);blend=t*t*(3-2*t)
crease_depth=basefold[:,2]*SCALE
# Keep the analytic circular crease instead of collapsing the two layers onto
# one fitted depth plane. Both ends join their corresponding smooth shell.
depths=bodydepth+crease_depth+blend*(cuffdepth-bodydepth-crease_depth)
observed=np.zeros(len(sourceflat),dtype=bool);status=[];observed_residual=[]
for i,(pixel,role)in enumerate(zip(photo,layers)):
    hit=helper.hit_photo(pixel,role,parts,reg,right,up,forward)
    if hit:
        observed[i]=True;status.append('source-visible-surface-constrained')
        observed_residual.append(abs(depths[i]-np.array(hit[0]['modelPosition'])@forward))
    else:status.append('inferred-smooth-surface-completion')
formed=right[None,:]*((photo[:,0]-reg['originXPx'])/reg['pixelsPerUnitX'])[:,None]+up[None,:]*((reg['originYPx']-photo[:,1])/reg['pixelsPerUnitY'])[:,None]+forward[None,:]*(depths-.002)[:,None]

# Two explicit sole hypotheses. Default follows the photo sole top pulled back
# to paper-body coordinates; the actual long pencil reference remains separate.
solePhoto=np.array([[230,546],[335,574],[500,575],[680,571],[825,566],[980,558],[1125,540],[1207,523]],float)
xs=np.array([0,22,54,91,129,167,205,239,269.],float)
px=1194.51801232-xs*3.62713332
sole_y=np.interp(px,solePhoto[:,0],solePhoto[:,1])
photoCut=np.c_[xs,(794.97252730-sole_y)/4.13137166]
pencil=np.array(next(l['points']for l in pattern['structureLines']if l['id']=='lower-attachment-reference'))
pencil=np.r_[[[0,pencil[0,1]]],pencil,[[W,pencil[-1,1]]]]
variants=[('traced-lower-pencil-reference',pencil,'PROVISIONAL DEFAULT: observed lower pencil reference. Its physical meaning as sole/lasting boundary is unverified and awaits confirmation.'),('full-source-no-exclusion',None,'Entire unchanged real paper, with no assumed sole exclusion.'),('photo-inferred-sole-top',photoCut,'DIAGNOSTIC alternative only: photograph sole upper edge pulled back through provisional body registration. This is not the measured physical lasting cut.')]
# Preserve unobserved paper length by wrapping it inside the retained sole,
# rather than deleting 53–65 mm or compressing the material onto a 17 mm line.
# Eight millimetres is an adjustable geometric hypothesis, NOT measured radius.
wrapRadiusMm=8.
contactY=np.interp(sourceflat[:,0],photoCut[:,0],photoCut[:,1]);wrapped=(sourceflat[:,1]<contactY)&(hingedistance<0)
contactFlat=np.c_[sourceflat[:,0],contactY];contactPhoto=paperphoto(fold(contactFlat,1))+warp(contactFlat)
contactPhoto[:,1]=np.interp(contactPhoto[:,0],solePhoto[:,0],solePhoto[:,1])
contactDepth=poly_features(contactPhoto)@coefficients['body']
contact=right[None,:]*((contactPhoto[:,0]-reg['originXPx'])/reg['pixelsPerUnitX'])[:,None]+up[None,:]*((reg['originYPx']-contactPhoto[:,1])/reg['pixelsPerUnitY'])[:,None]+forward[None,:]*(contactDepth-.002)[:,None]
q=np.maximum(0,contactY-sourceflat[:,1]);angle=np.minimum(math.pi/2,q/wrapRadiusMm)
down=wrapRadiusMm*np.sin(angle);inward=wrapRadiusMm*(1-np.cos(angle))+np.maximum(0,q-wrapRadiusMm*math.pi/2)
formed[wrapped]=(contact-up[None,:]*(down*SCALE)[:,None]+forward[None,:]*(inward*SCALE)[:,None])[wrapped]
for i in np.flatnonzero(wrapped):status[i]='inferred-under-sole-wrap'
# Local/global as-rigid-as-possible rest-metric regularisation. The original
# paper, not arbitrary AI tessellation, controls this new panel's rest shape.
# This is geometric regularisation only; no cloth law/contact is claimed.
from scipy.sparse import coo_matrix,diags
from scipy.sparse.linalg import splu
resttri=sourceflat[sourcefaces];ra=resttri[:,1]-resttri[:,0];rb=resttri[:,2]-resttri[:,0]
rdet=ra[:,0]*rb[:,1]-ra[:,1]*rb[:,0]
g0=np.c_[(ra[:,1]-rb[:,1])/rdet,rb[:,1]/rdet,-ra[:,1]/rdet]
g1=np.c_[(rb[:,0]-ra[:,0])/rdet,-rb[:,0]/rdet,ra[:,0]/rdet]
rows=np.repeat(np.arange(len(sourcefaces)*2),3);cols=np.stack([sourcefaces,sourcefaces],axis=1).ravel();values=np.stack([g0,g1],axis=1).ravel()
G=coo_matrix((values,(rows,cols)),shape=(len(sourcefaces)*2,len(sourceflat))).tocsc()
weights=np.repeat(np.maximum(np.abs(rdet)/2,.02),2);wg=diags(weights);softPin=.0003
# Material metric remains the prior; measured-view attachment anchors prevent
# the sole wrap and eyelets from drifting out through the retained shoe.
pinWeights=np.full(len(sourceflat),softPin)
pinWeights[wrapped]=.012
pinWeights[np.abs(sourceflat[:,1]-contactY)<5]=.025
for h in pattern['holes']:
    if h['role']=='eyelet':pinWeights[np.linalg.norm(sourceflat-np.asarray(h['center']),axis=1)<4]=.012
for landmark in landmarks:
    if landmark['kind']=='manual-outline-hypothesis':pinWeights[np.linalg.norm(sourceflat-np.asarray(landmark['flatMm']),axis=1)<8]=.008
L=G.T@wg@G+diags(pinWeights);factor=splu(L.tocsc());B=(G.T@wg).tocsc()
attachmentTarget=formed.copy()
for iteration in range(120):
    gradient=(G@formed).reshape(-1,2,3).transpose(0,2,1)/SCALE
    U,singular,V=np.linalg.svd(gradient,full_matrices=False)
    rotations=(U@V).transpose(0,2,1).reshape(-1,3)*SCALE
    formed=factor.solve(B@rotations+attachmentTarget*pinWeights[:,None])
attachmentDistance=np.linalg.norm(formed-attachmentTarget,axis=1)
arap={'method':'120 local/global rest-gradient SVD projections with sparse global solve','softAttachmentPin':softPin,'restAreaWeightFloorMm2':.02,'sourceTargetRmsDistanceModelUnits':float(np.sqrt(np.mean(attachmentDistance**2))),'sourceTargetMaximumDistanceModelUnits':float(attachmentDistance.max()),'sourceTargetDisplacementRelativeToShoeLength':float(np.sqrt(np.mean(attachmentDistance**2))/1.90169072),'isPhysicalClothSolver':False}
print('ARAP',json.dumps(arap),flush=True)



flat=sourceflat.tolist();ids=list(project['vertexIdentity']['vertexIds']);provenance=[{'sourceVertex':int(i)}for i in range(len(sourceflat))]
lookup={(round(p[0],10),round(p[1],10)):i for i,p in enumerate(flat)}

def bary(point,triangle):
    a,b,c=sourceflat[sourcefaces[triangle]];basis=np.array([b-a,c-a]).T
    uv=np.linalg.solve(basis,np.asarray(point)-a);return np.array([1-uv.sum(),uv[0],uv[1]])

def vertex(point,tri):
    key=tuple(round(float(x),10)for x in point)
    if key in lookup:return lookup[key]
    i=len(flat);lookup[key]=i;flat.append([float(point[0]),float(point[1])]);ids.append('cut:'+str(i));weights=bary(point,tri)
    provenance.append({'sourceTriangle':int(tri),'sourceVertexIndices':sourcefaces[tri].tolist(),'barycentric':weights.tolist()})
    return i

def clip(poly,fn,positive=True):
    if not poly:return []
    out=[]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        da,db=fn(a),fn(b);ina=da>=-1e-10 if positive else da<=1e-10;inb=db>=-1e-10 if positive else db<=1e-10
        if ina:out.append(a)
        if ina!=inb:
            t=da/(da-db);out.append(np.asarray(a)+(np.asarray(b)-a)*t)
    return out

def triangles(poly,tri):
    if len(poly)<3:return []
    indices=[vertex(p,tri)for p in poly];out=[]
    for k in range(1,len(indices)-1):
        face=[indices[0],indices[k],indices[k+1]];p=np.array([flat[i]for i in face]);area=np.cross(p[1]-p[0],p[2]-p[0])
        if abs(area)>1e-10:out.append(face if area>0 else face[::-1])
    return out

trimVariants=[]
for name,line,note in variants:
    vis=[];excluded=[];vsource=[];esource=[]
    if line is None:
        trimVariants.append({'id':name,'label':'完整原裁片／不排除鞋底区域','lineFlatMm':[],'indices':sourcefaces.ravel().tolist(),'excludedIndices':[],'sourceTriangleIds':list(range(len(sourcefaces))),'excludedSourceTriangleIds':[],'assumption':note,'validatedPhysicalSoleBoundary':False})
        continue
    for tri,sourceids in enumerate(sourcefaces):
        poly=[p.copy()for p in sourceflat[sourceids]];xmin,xmax=min(p[0]for p in poly),max(p[0]for p in poly)
        knots=line[(line[:,0]>=xmin)&(line[:,0]<=xmax),0]
        heights=np.interp(np.r_[xmin,xmax,knots],line[:,0],line[:,1])
        if min(p[1]for p in poly)>max(heights)+1e-9:
            vis.append(sourceids.tolist());vsource.append(tri);continue
        if max(p[1]for p in poly)<min(heights)-1e-9:
            excluded.append(sourceids.tolist());esource.append(tri);continue
        limits=[xmin,*[float(x)for x in knots if xmin+1e-9<x<xmax-1e-9],xmax]
        for low,high in zip(limits,limits[1:]):
            slab=clip(clip(poly,lambda p:p[0]-low),lambda p:high-p[0])
            if len(slab)<3:continue
            yl,yh=np.interp([low,high],line[:,0],line[:,1]);slope=(yh-yl)/max(high-low,1e-20)
            fn=lambda p:p[1]-(yl+slope*(p[0]-low))
            a,b=triangles(clip(slab,fn),tri),triangles(clip(slab,fn,False),tri)
            vis.extend(a);vsource.extend([tri]*len(a));excluded.extend(b);esource.extend([tri]*len(b))
    trimVariants.append({'id':name,'label':('照片推断鞋底包裹线'if name.startswith('photo')else'纸样下方铅笔参考线'),'lineFlatMm':line.tolist(),'indices':np.array(vis).ravel().tolist(),'excludedIndices':np.array(excluded).ravel().tolist(),'sourceTriangleIds':vsource,'excludedSourceTriangleIds':esource,'assumption':note,'validatedPhysicalSoleBoundary':False})
    print('TRIM',name,len(vis),len(excluded),flush=True)

# Conform clipped triangle boundaries. A piecewise-linear cut can split an
# edge on one source triangle while a neighbouring entirely-retained triangle
# still uses the unsplit edge. Refine only the involved triangles; immutable
# source coordinates/IDs remain untouched, and every new point records its
# original source-triangle barycentrics.
def conform_variant(variant):
    if not variant['lineFlatMm']:
        return {'id':variant['id'],'refinedTriangles':0,'newInteriorVertices':0,'splitEdges':0}
    allfaces=np.asarray(variant['indices']+variant['excludedIndices'],dtype=int).reshape(-1,3)
    used=np.unique(allfaces);points=np.asarray(flat)[used];tree=cKDTree(points)
    edges=np.unique(np.sort(np.concatenate([allfaces[:,[0,1]],allfaces[:,[1,2]],allfaces[:,[2,0]]]),axis=1),axis=0)
    split={}
    for a,b in edges:
        pa,pb=np.asarray(flat[a]),np.asarray(flat[b]);ab=pb-pa;l2=ab@ab
        if l2<1e-18:continue
        local=tree.query_ball_point((pa+pb)/2,math.sqrt(l2)/2+1e-8)
        candidates=[]
        for k in local:
            j=int(used[k])
            if j==a or j==b:continue
            aq=points[k]-pa;t=float(aq@ab/l2)
            if 1e-9<t<1-1e-9 and np.linalg.norm(aq-t*ab)<1e-8:
                candidates.append((t,j))
        if candidates:split[(int(a),int(b))]=[j for _,j in sorted(candidates)]
    before=len(flat);refined=0
    for indexkey,sourcekey in [('indices','sourceTriangleIds'),('excludedIndices','excludedSourceTriangleIds')]:
        output=[];sources=[]
        for face,source in zip(np.asarray(variant[indexkey],dtype=int).reshape(-1,3),variant[sourcekey]):
            perimeter=[];changed=False
            for a,b in zip(face,np.roll(face,-1)):
                perimeter.append(int(a));extra=split.get((min(int(a),int(b)),max(int(a),int(b))),[])
                if extra:
                    perimeter.extend(extra if a<b else extra[::-1]);changed=True
            if not changed:output.append(face.tolist());sources.append(source);continue
            center=vertex(np.asarray([flat[i]for i in face]).mean(0),source)
            if center>=before:provenance[center]['derivedKind']='conforming-clipped-triangle-centroid'
            for a,b in zip(perimeter,perimeter[1:]+perimeter[:1]):
                xyz=np.array([flat[center],flat[a],flat[b]])
                orient=float(np.cross(xyz[1]-xyz[0],xyz[2]-xyz[0]))
                if abs(orient)>1e-12:
                    output.append([center,a,b] if orient>0 else [center,b,a]);sources.append(source)
            refined+=1
        variant[indexkey]=np.asarray(output,dtype=int).ravel().tolist();variant[sourcekey]=sources
    return {'id':variant['id'],'refinedTriangles':refined,'newInteriorVertices':len(flat)-before,'splitEdges':len(split)}
conformance=[conform_variant(v)for v in trimVariants]
print('CONFORM',json.dumps(conformance),flush=True)

flat=np.asarray(flat);N=len(flat);newformed=np.zeros((N,3));newformed[:len(sourceflat)]=formed
for i,prov in enumerate(provenance[len(sourceflat):],len(sourceflat)):
    newformed[i]=np.asarray(prov['barycentric'])@formed[prov['sourceVertexIndices']]
observed=np.r_[observed,np.zeros(N-len(sourceflat),bool)]
status.extend(['derived-edge-intersection']*(N-len(sourceflat)))
# Every appended point follows its immutable original triangle barycentrics.
def interpolate_original(values):
    result=np.empty((N,3));result[:len(sourceflat)]=values
    for i,prov in enumerate(provenance[len(sourceflat):],len(sourceflat)):
        result[i]=np.asarray(prov['barycentric'])@values[prov['sourceVertexIndices']]
    return result

base_full=display(fold(sourceflat,1));delta=formed-base_full
samples=[]
for j in range(17):
    p=1-j/16;weight=p*p*(3-2*p)
    values=display(fold(sourceflat,p))+delta*weight
    if p not in (0,1):
        # The raw fading correction is only a target. Per-pose metric solve
        # prevents an under-sole wrap from collapsing halfway through release.
        poseTarget=values.copy()
        for iteration in range(120):
            gradient=(G@values).reshape(-1,2,3).transpose(0,2,1)/SCALE
            U,singular,V=np.linalg.svd(gradient,full_matrices=False)
            rotations=(U@V).transpose(0,2,1).reshape(-1,3)*SCALE
            values=factor.solve(B@rotations+poseTarget*pinWeights[:,None])
    if p==0:values=display(np.c_[sourceflat,np.zeros(len(sourceflat))])
    positions=interpolate_original(values)
    samples.append({'formedAmount':p,'positions':positions.ravel().tolist()})
flatDisplay=display(np.c_[flat,np.zeros(N)])
samples[-1]['positions']=flatDisplay.ravel().tolist()
# Match attached endpoint exactly, independent of interpolation roundoff.
samples[0]['positions']=newformed.ravel().tolist()

# Derived base removes both front cloth skins and fused same-side detail in the
# selected anatomical regions. Opposite side, tongue, laces and sole remain.
bodypoly=np.array([[270,553],[323,476],[420,447],[508,417],[579,373],[651,311],[703,242],[741,376],[766,458],[815,563]],float)
cuffpoly=np.array([[700,218],[1115,127],[1214,416],[870,596]],float)
tonguepoly=np.array([[300,355],[331,291],[430,220],[625,132],[698,164],[650,235],[540,300],[465,365],[360,414]],float)
def inside(points,poly):
    x,y=points[:,0],points[:,1];out=np.zeros(len(points),bool)
    for a,b in zip(poly,np.roll(poly,1,axis=0)):
        out^=((a[1]>y)!=(b[1]>y))&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1]+1e-30)+a[0])
    return out
replacement=[]
for part in parts:
    centers=part['vertices'].mean(axis=1);pixels=helper.project(centers,reg,right,up)
    nearfront=(centers[:,2]>-.055)&(centers[:,1]>-.235)
    region=(inside(pixels,bodypoly.mean(0)+(bodypoly-bodypoly.mean(0))*1.055)|inside(pixels,cuffpoly.mean(0)+(cuffpoly-cuffpoly.mean(0))*1.055))&nearfront
    if part['role']in['body','cuff']:mask=nearfront
    elif part['name']=='Footwear_Details_Unclassified':mask=region
    elif part['name']=='Tongue_Flap_And_Local_Repairs':mask=region&~inside(pixels,tonguepoly)
    else:mask=np.zeros(len(centers),bool)
    replacement.append({'meshPath':part['meshPath'],'meshName':part['name'],'geometrySignature':part['geometrySignature'],'triangleCount':len(centers),'removedTriangles':np.flatnonzero(mask).tolist(),'keptTriangles':np.flatnonzero(~mask).tolist(),'purpose':'Derived same-side opening; sole/opposite side/tongue protected. Fused local hardware is removed with original surface and not treated as cloth.'})

# Discrete geometry metrics against immutable millimetre rest (model visualscale).
def metrics(pos,indices):
    f=np.array(indices).reshape(-1,3);q=flat[f];r=np.asarray(pos).reshape(-1,3)[f]/SCALE
    a=q[:,1]-q[:,0];b=q[:,2]-q[:,0];det=a[:,0]*b[:,1]-a[:,1]*b[:,0]
    u=r[:,1]-r[:,0];v=r[:,2]-r[:,0]
    f0=(u*b[:,1,None]-v*a[:,1,None])/det[:,None];f1=(v*a[:,0,None]-u*b[:,0,None])/det[:,None]
    c00=(f0*f0).sum(1);c11=(f1*f1).sum(1);c01=(f0*f1).sum(1);disc=np.sqrt(np.maximum(0,(c00-c11)**2+4*c01*c01))
    lo=np.sqrt(np.maximum(0,(c00+c11-disc)/2));hi=np.sqrt(np.maximum(0,(c00+c11+disc)/2));area=lo*hi
    return {'triangles':len(f),'finite':bool(np.isfinite(r).all()),'minimumPrincipalStretch':float(lo.min()),'maximumPrincipalStretch':float(hi.max()),'minimumAreaRatio':float(area.min()),'maximumAreaRatio':float(area.max()),'degenerateTriangles':int(np.sum(area<1e-7)),'percentOfTrianglesAbove10PercentStrain':float(np.mean((lo<.9)|(hi>1.1))*100),'warning':'Model display scale is assumed. This metric is relative to that display scale, not a validated real cloth strain law.'}
def area(indices):
    q=flat[np.array(indices,dtype=int).reshape(-1,3)];return float(np.abs(np.cross(q[:,1]-q[:,0],q[:,2]-q[:,0])).sum()/2)
sourcearea=float(np.abs(np.cross(sourceflat[sourcefaces[:,1]]-sourceflat[sourcefaces[:,0]],sourceflat[sourcefaces[:,2]]-sourceflat[sourcefaces[:,0]])).sum()/2)
for variant in trimVariants:
    variant['visibleAreaMm2']=area(variant['indices']);variant['excludedAreaMm2']=area(variant['excludedIndices']);variant['partitionAreaErrorMm2']=abs(variant['visibleAreaMm2']+variant['excludedAreaMm2']-sourcearea)
    assert variant['partitionAreaErrorMm2']<1e-6
main=trimVariants[0]
validation={'sourceVertexCount':len(sourceflat),'sourceTriangleCount':len(sourcefaces),'vertexCountWithExactTrimIntersections':N,'originalCoordinatesAndIdsUnchanged':True,'fullSourceAreaMm2':sourcearea,'flatMaximumErrorMm':0.,'smoothDepthObservedSampleRmsModelUnits':float(np.sqrt(np.mean(np.array(observed_residual)**2))),'allVisiblePanelVerticesFinite':bool(np.isfinite(newformed).all()),'visiblePanelHasNoUnmappedVertices':True,'observedOriginalVertexCount':int(observed[:len(sourceflat)].sum()),'completedOriginalVertexCount':int(len(sourceflat)-observed[:len(sourceflat)].sum()),'trimPhysicalBoundaryValidated':False,'restoredFlatState':'Uniform rigid display transform of immutable millimetre paper, exact per source vertex; not AI-mesh unwrapping.','geometricRegularization':arap,'clippingTopology':conformance,'attachedMetric':metrics(newformed,main['indices']),'flatMetric':metrics(flatDisplay,main['indices']),'removedOriginalAiTriangles':sum(len(m['removedTriangles'])for m in replacement),'keptOriginalAiTriangles':sum(len(m['keptTriangles'])for m in replacement),'selfIntersectionTest':'not-performed','productionReady':False}
validation['poseMetricBounds']=[{'formedAmount':sample['formedAmount'],**metrics(sample['positions'],main['indices'])} for sample in samples]
report={'schemaVersion':1,'source':{'paperProjectSha256':hashlib.sha256(rawpaper).hexdigest(),'correctedModelSha256':hashlib.sha256(modelraw).hexdigest(),'originalVertexCount':len(sourceflat),'sourceVertexCount':len(sourceflat),'sourceTriangleCount':len(sourcefaces),'originalFlatMm':sourceflat.ravel().tolist(),'originalTriangleIndices':sourcefaces.ravel().tolist(),'originalVertexIds':project['vertexIdentity']['vertexIds']},'units':{'flat':'mm','formed':'uncalibrated-model-unit','scaleNote':'Uniform display scale only; model physical dimensions have not been calibrated.'},'flatMm':flat.ravel().tolist(),'vertexIds':ids,'provenance':provenance,'indices':main['indices'],'trimmedIndices':main['indices'],'excludedIndices':main['excludedIndices'],'fullIndices':main['indices']+main['excludedIndices'],'sourceTriangleIds':main['sourceTriangleIds'],'formedPositions':newformed.ravel().tolist(),'flatDisplayPositions':flatDisplay.ravel().tolist(),'flatDisplayMatrix':M.ravel(order='F').tolist(),'display':{'mmToModelScale':SCALE,'flatOriginModel':ORIGIN.tolist(),'matrixColumnMajor':True},'observedMask':observed.tolist(),'confidence':status,'trimVariants':trimVariants,'defaultTrimId':main['id'],'unfoldSamples':samples,'inferredWrappedMask':np.r_[wrapped,np.zeros(N-len(sourceflat),bool)].tolist(),'wrappedHypothesis':{'radiusMm':wrapRadiusMm,'contactLineFlatMm':photoCut.tolist(),'source':'Unobserved under-sole geometric completion, not an observed manufacturing fold or lasting line.'},'fold':params,'formationPinWeights':pinWeights.tolist(),'attachmentConstraints':landmarks,'replacementMask':replacement,'validation':validation,'assumptions':['The AI source does not possess paper-compatible topology. The displayed shoe side is explicitly replaced with this complete, paper-owned independent panel before detach animation.','Flat rest shape, cut boundary and eyelet topology come from the existing calibrated paper mesh; the original AI triangles remain a separate source asset.','Visible source cloth constrains a robust smooth depth field; samples are not pinned through occlusion discontinuities. Other vertices are same-layer inferred completions.','The traced lower pencil line is only a provisional default exclusion. Full-paper and photo-inferred diagnostic variants remain available; no physical sole cut is certified.','Every analytic circular crease target is rest-metric regularised using the same material topology; adjacent samples form a continuous animation, not a validated cloth/contact simulation.','Physical sewing, exact hidden wrap, actual model scale and self-intersections remain unverified.'],'productionReady':False}
(OUT/'panel-data.tmp').write_text(json.dumps(report,separators=(',',':'))+'\n');(OUT/'panel-data.tmp').replace(OUT/'panel-data.json')
(OUT/'panel-validation.json').write_text(json.dumps(validation,indent=2)+'\n')
(OUT/'replacement-mask.json').write_text(json.dumps({'modelSha256':report['source']['correctedModelSha256'],'meshes':replacement},separators=(',',':'))+'\n')
print(json.dumps(validation,indent=2),flush=True)

# Reuse the complete fitted panel, then stabilise crease orientation for
# interpolation. This final pass does not rebuild source/photo observations.
from stabilize_crease import stabilize
stabilize(OUT/'panel-data.json')
