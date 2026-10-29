"""Stabilise material crease orientation without rebuilding source/photo fits.

The analytic circular crease is an explicit geometric orientation constraint,
not a recovered manufacturing fold. Paper coordinates, IDs, topology and trim
variants remain immutable. Repeated runs skip matching stabilised pose buffers.
"""
from pathlib import Path
import json, math, hashlib, struct
import numpy as np
from scipy.sparse import coo_matrix, diags
from scipy.sparse.linalg import splu
VERSION='analytic-two-fold-normal-v4-whole-paper'

def pose_hash(frames):
    h=hashlib.sha256()
    for f in sorted(frames,key=lambda f:f['formedAmount']):
        h.update(struct.pack('<d',float(f['formedAmount'])))
        h.update(np.asarray(f['positions'],dtype='<f8').tobytes())
    return h.hexdigest()

def identity_hash(d):
    keep={k:d[k] for k in ['source','flatMm','vertexIds','indices','trimmedIndices','excludedIndices','fullIndices','sourceTriangleIds','provenance','trimVariants','flatDisplayPositions','flatDisplayMatrix','formationPinWeights','fold','wrappedHypothesis']}
    return hashlib.sha256(json.dumps(keep,separators=(',',':'),sort_keys=True).encode()).hexdigest()

def stabilise(path):
    path=Path(path);d=json.loads(path.read_text());before_id=identity_hash(d)
    marker=d['validation'].get('creaseOrientationStabilization',{})
    if marker.get('version')==VERSION and marker.get('outputPoseSha256')==pose_hash(d['unfoldSamples']) and marker.get('immutableIdentitySha256')==before_id:
        print('CREASE already stabilised; immutable identity and output pose hashes match.',flush=True)
        return d
    n=d['source']['sourceVertexCount'];q=np.asarray(d['flatMm'],float).reshape(-1,2)[:n]
    faces=np.asarray(d['source']['originalTriangleIndices'],int).reshape(-1,3)
    scale=float(d['display']['mmToModelScale']);M=np.asarray(d['flatDisplayMatrix'],float).reshape(4,4,order='F');params=d['fold']
    a=math.radians(params['hingeAngleDeg']);ca,sa=math.cos(a),math.sin(a)
    contact_line=np.asarray(d['wrappedHypothesis']['contactLineFlatMm'],float)
    contact_y=np.interp(q[:,0],contact_line[:,0],contact_line[:,1])
    wrap_depth=np.maximum(0,contact_y-q[:,1]);wrap_width=float(d['wrappedHypothesis']['radiusMm'])*math.pi/2
    vertex_hinge_distance=-(q[:,0]-params['hingeXmm'])*sa+(q[:,1]-params['hingeYmm'])*ca
    under_vertices=(wrap_depth>0)&(vertex_hinge_distance<0)
    def fold_world(points,p):
        out=np.c_[points,np.zeros(len(points))]
        if p:
            dx=points[:,0]-params['hingeXmm'];dy=points[:,1]-params['hingeYmm'];along=dx*ca+dy*sa;dd=-dx*sa+dy*ca
            theta=math.radians(params['foldAngleDeg'])*p;width=params['bendWidthMm'];r=width/theta;aa=theta*np.clip(dd,0,width)/width
            across=r*np.sin(aa)+np.maximum(0,dd-width)*np.cos(theta);depth=r*(1-np.cos(aa))+np.maximum(0,dd-width)*math.sin(theta);use=dd>0
            out[use,0]=params['hingeXmm']+along[use]*ca-across[use]*sa;out[use,1]=params['hingeYmm']+along[use]*sa+across[use]*ca;out[use,2]=depth[use]
        return out@M[:3,:3].T+M[:3,3]
    def analytic_fold(p):
        reference=fold_world(q,p)
        if p:
            theta=p*math.pi/2;radius=wrap_width/theta;aa=theta*np.minimum(wrap_depth,wrap_width)/wrap_width;tail=np.maximum(0,wrap_depth-wrap_width)
            down=radius*np.sin(aa)+tail*math.cos(theta);inward=radius*(1-np.cos(aa))+tail*math.sin(theta)
            contact=fold_world(np.c_[q[:,0],contact_y],p)
            wrapped=contact-M[:3,1][None,:]*down[:,None]+M[:3,2][None,:]*inward[:,None]
            reference[under_vertices]=wrapped[under_vertices]
        return reference
    rest=q[faces];ra=rest[:,1]-rest[:,0];rb=rest[:,2]-rest[:,0];det=ra[:,0]*rb[:,1]-ra[:,1]*rb[:,0]
    g0=np.c_[(ra[:,1]-rb[:,1])/det,rb[:,1]/det,-ra[:,1]/det];g1=np.c_[(rb[:,0]-ra[:,0])/det,-rb[:,0]/det,ra[:,0]/det]
    G=coo_matrix((np.stack([g0,g1],axis=1).ravel(),(np.repeat(np.arange(len(faces)*2),3),np.stack([faces,faces],axis=1).ravel())),shape=(len(faces)*2,n)).tocsc()
    weights=np.repeat(np.maximum(abs(det)/2,.02),2);B=(G.T@diags(weights)).tocsc();pin=np.asarray(d.get('formationPinWeights',np.full(n,.0003)),float).copy()
    vertex_distance=-(q[:,0]-params['hingeXmm'])*sa+(q[:,1]-params['hingeYmm'])*ca
    relaxed_vertex_band=(vertex_distance>=-1)&(vertex_distance<=params['bendWidthMm']+2)
    pin[relaxed_vertex_band]=np.minimum(pin[relaxed_vertex_band],.0003)
    factor=splu((B@G+diags(pin)).tocsc())
    centres=rest.mean(1);dd=-(centres[:,0]-params['hingeXmm'])*sa+(centres[:,1]-params['hingeYmm'])*ca
    cuff_triangles=dd>-.5
    lower_triangles=(centres[:,1]<np.interp(centres[:,0],contact_line[:,0],contact_line[:,1]))&(dd<0)
    crease=np.ones(len(faces),dtype=bool)
    orientation_bias=1.0
    def grad(p):return (G@p).reshape(-1,2,3).transpose(0,2,1)/scale
    old_formed=np.asarray(d['formedPositions']).reshape(-1,3)[:n].copy();input_hash=pose_hash(d['unfoldSamples']);adjustments=[]
    for sample in d['unfoldSamples']:
        p=sample['formedAmount']
        if p==0:
            sample['positions']=d['flatDisplayPositions'].copy();continue
        values=np.asarray(sample['positions']).reshape(-1,3)[:n].copy();target=values.copy()
        U,_,V=np.linalg.svd(grad(analytic_fold(p)),full_matrices=False);Rref=U@V;nref=np.cross(Rref[:,:,0],Rref[:,:,1])
        for _ in range(90):
            F=grad(values);F[crease]+=orientation_bias*Rref[crease]
            U,_,V=np.linalg.svd(F,full_matrices=False);R=U@V
            wrong=((np.cross(R[:,:,0],R[:,:,1])*nref).sum(1)<0)&crease
            U[wrong,:,1]*=-1;R=U@V
            values=factor.solve(B@(R.transpose(0,2,1).reshape(-1,3)*scale)+target*pin[:,None])
        full=np.empty((len(d['vertexIds']),3));full[:n]=values
        for i,provenance in enumerate(d['provenance'][n:],n):
            full[i]=np.asarray(provenance['barycentric'])@values[provenance['sourceVertexIndices']]
        assert np.isfinite(full).all();sample['positions']=full.ravel().tolist()
        delta=np.linalg.norm(values-target,axis=1)
        adjustments.append({'formedAmount':p,'rmsAdjustmentModelUnits':float(np.sqrt(np.mean(delta**2))),'maximumAdjustmentModelUnits':float(delta.max())})
    attached=next(f for f in d['unfoldSamples'] if f['formedAmount']==1)
    d['formedPositions']=attached['positions'].copy()
    # Independent edge-inverse metrics, separate from the gradient solve above.
    allflat=np.asarray(d['flatMm']).reshape(-1,2);active=np.asarray(d['trimmedIndices']).reshape(-1,3);r=allflat[active]
    inv=np.linalg.inv(np.stack((r[:,1]-r[:,0],r[:,2]-r[:,0]),axis=2))
    def field(p):
        current=np.asarray(p).reshape(-1,3)[active]
        return np.stack((current[:,1]-current[:,0],current[:,2]-current[:,0]),axis=2)@inv/scale
    def metric(p):
        F=field(p);s=np.linalg.svd(F,compute_uv=False);hi=s[:,0];lo=s[:,1];area=lo*hi
        return {'triangles':len(active),'finite':bool(np.isfinite(F).all()),'minimumPrincipalStretch':float(lo.min()),'maximumPrincipalStretch':float(hi.max()),'minimumAreaRatio':float(area.min()),'maximumAreaRatio':float(area.max()),'degenerateTriangles':int((area<1e-7).sum()),'percentOfTrianglesAbove10PercentStrain':float(np.mean((lo<.9)|(hi>1.1))*100),'warning':'Relative to assumed uniform model display scale. Not a validated physical cloth law or manufacture.'}
    frames=sorted(d['unfoldSamples'],key=lambda f:f['formedAmount']);pose_bounds=[{'formedAmount':f['formedAmount'],**metric(f['positions'])}for f in frames]
    mids=[];quarter=[];continuous_lower=float('inf');continuous_upper=0.;interval_diagnostics=[]
    for a,b in zip(frames,frames[1:]):
        pa=np.asarray(a['positions']);pb=np.asarray(b['positions']);delta=field(pb)-field(pa)
        lipschitz=np.linalg.svd(delta,compute_uv=False)[:,0]
        singular_samples=[]
        for t in [0,.25,.5,.75,1]:
            p=pa+(pb-pa)*t;singular_samples.append(np.linalg.svd(field(p),compute_uv=False))
            if t in [.25,.5,.75]:
                row={'formedAmount':a['formedAmount']+(b['formedAmount']-a['formedAmount'])*t,'intervalFraction':t,**metric(p)}
                quarter.append(row)
                if t==.5:mids.append(row)
        sampled=np.stack(singular_samples)
        # Every t is <=1/8 away from one of the five samples. Weyl's
        # singular-value perturbation bound certifies the entire linear segment.
        low=sampled[:,:,1].min(axis=0)-lipschitz/8
        high=sampled[:,:,0].max(axis=0)+lipschitz/8
        continuous_lower=min(continuous_lower,float(low.min()));continuous_upper=max(continuous_upper,float(high.max()))
        worst=int(low.argmin());tri=active[worst];interval_diagnostics.append({'from':a['formedAmount'],'to':b['formedAmount'],'lower':float(low.min()),'upper':float(high.max()),'sampledMinimum':float(sampled[:,:,1].min()),'worstTriangle':worst,'worstFlatVertices':allflat[tri].tolist(),'worstVertexIds':tri.tolist()})
    diagnostics={'version':VERSION,'inputPoseSha256':input_hash,'continuousLower':continuous_lower,'continuousUpper':continuous_upper,'keyMetrics':pose_bounds,'quarterMetrics':quarter,'intervals':interval_diagnostics,'relaxedCreaseVertices':int(relaxed_vertex_band.sum()),'all65SampleMinimum':min(x['minimumPrincipalStretch']for x in pose_bounds+quarter),'all65SampleMaximum':max(x['maximumPrincipalStretch']for x in pose_bounds+quarter)}
    Path('/tmp/panel-crease-latest-diagnostics.json').write_text(json.dumps(diagnostics,indent=2)+'\n')
    if continuous_lower<=0:
        Path('/tmp/panel-crease-failed-candidate.json').write_text(json.dumps(d,separators=(',',':'))+'\n')
        print('CREASE_FAILED_DIAGNOSTIC',json.dumps({k:v for k,v in diagnostics.items()if k not in ['keyMetrics','quarterMetrics','intervals']}),flush=True)
        raise AssertionError('A material triangle may still collapse between poses; /tmp/panel-crease-latest-diagnostics.json and failed candidate saved.')
    displacement=np.linalg.norm(np.asarray(d['formedPositions']).reshape(-1,3)[:n]-old_formed,axis=1)
    marker={'version':VERSION,'method':'Whole-paper polar-frame bias +1.0 analytic two-fold references; reject opposite-normal polar branches; 90 sparse local/global iterations per nonflat pose','normalReference':'Analytic cuff crease plus 90-degree under-sole wrap from stored hypotheses; geometric orientation constraints, not measured cloth normals','isPhysicalClothSolver':False,'creaseTriangles':int(crease.sum()),'cuffReferenceTriangles':int(cuff_triangles.sum()),'underSoleReferenceTriangles':int(lower_triangles.sum()),'normalReferenceBias':orientation_bias,'relaxedCreaseVertices':int(relaxed_vertex_band.sum()),'creaseVertexPinCap':.0003,'inputPoseSha256':input_hash,'outputPoseSha256':pose_hash(d['unfoldSamples']),'immutableIdentitySha256':before_id,'attachedAdjustmentRmsModelUnits':float(np.sqrt(np.mean(displacement**2))),'attachedAdjustmentMaximumModelUnits':float(displacement.max()),'perPoseAdjustments':adjustments}
    v=d['validation'];v['creaseOrientationStabilization']=marker;v['attachedMetric']=metric(d['formedPositions']);v['flatMetric']=metric(d['flatDisplayPositions']);v['poseMetricBounds']=pose_bounds;v['interpolatedMidpointMetricBounds']=mids;v['interpolatedQuarterMetricBounds']=quarter
    v['continuousLinearSegmentMetricBounds']={'minimumSingularValueLowerBound':continuous_lower,'maximumSingularValueUpperBound':continuous_upper,'method':'Per-triangle Weyl perturbation bound from 0,1/4,1/2,3/4,1 samples; positions linear between stored poses; positive lower bound excludes rank-collapse throughout each segment.','doesNotCheckSelfIntersectionsOrContact':True}
    if 'geometricRegularization'in v:v['geometricRegularization']['fitResidualAppliesTo']='Initial attached regularisation before the separately reported crease-orientation adjustment.'
    assumption='Crease normals are regularised toward the explicitly assumed analytic fold orientation to prevent opposite local branches and interpolation collapse; no recovered manufacturing/contact process is claimed.'
    if assumption not in d['assumptions']:d['assumptions'].append(assumption)
    assert identity_hash(d)==before_id
    assert next(f for f in d['unfoldSamples']if f['formedAmount']==0)['positions']==d['flatDisplayPositions']
    tmp=path.with_suffix('.stabilized.tmp');tmp.write_text(json.dumps(d,separators=(',',':'))+'\n');tmp.replace(path)
    (path.parent/'panel-validation.json').write_text(json.dumps(v,indent=2)+'\n')
    print('CREASE_STABILISED',json.dumps({'vertices':len(d['vertexIds']),'poses':len(frames),'minKeyAndMid':min(x['minimumPrincipalStretch']for x in pose_bounds+mids),'maxKeyAndMid':max(x['maximumPrincipalStretch']for x in pose_bounds+mids),'continuousMinimumSingularLowerBound':continuous_lower,'continuousMaximumSingularUpperBound':continuous_upper,'attachedAdjustmentRmsModelUnits':marker['attachedAdjustmentRmsModelUnits'],'panelDataSha256':hashlib.sha256(path.read_bytes()).hexdigest()}),flush=True)
    return d

# British spelling above keeps the numerical implementation distinct from the
# CLI helper name used by the builder and editable project documentation.
stabilize=stabilise
if __name__=='__main__':
    import sys
    stabilise(Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).resolve().parents[2]/'public/detachable-side-panel/panel-data.json')
