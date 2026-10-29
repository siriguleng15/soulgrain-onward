#!/usr/bin/env python3
"""Trace the user's photographed construction onto the accepted same-topology panel.

All placements start with the immutable observed-blue-centre design, not a new
idealised layout. Surface references use ORIGINAL paper triangle IDs and barycentric
weights. Photo-projected footprints are distinct from verified sewn contact areas.
"""
from pathlib import Path
import hashlib, json, math
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/detachable-side-panel/clasp-derivation.json'
PANEL = ROOT / 'public/detachable-side-panel/panel-data.json'
DESIGN = ROOT / 'public/pattern-engineering/data/clasp-design.json'
MODEL = ROOT / 'public/reference-model-v10/model-data.json'
panel = json.loads(PANEL.read_text()); design = json.loads(DESIGN.read_text())
reg = json.loads(MODEL.read_text())['photoRegistration']
flat = np.asarray(panel['flatMm'], float).reshape(-1, 2)
world = np.asarray(panel['formedPositions'], float).reshape(-1, 3)
faces = np.asarray(panel['source']['originalTriangleIndices'], int).reshape(-1, 3)
right, up, forward = [np.asarray(reg[k], float) for k in ['rightWorld', 'upWorld', 'viewDirectionWorld']]
photo = np.c_[reg['originXPx'] + world @ right * reg['pixelsPerUnitX'],
              reg['originYPx'] - world @ up * reg['pixelsPerUnitY']]
tri_photo = photo[faces]; tri_flat = flat[faces]; tri_world = world[faces]
base = tri_photo[:, 0]
edge = np.stack((tri_photo[:, 1] - base, tri_photo[:, 2] - base), axis=2)
determinant = np.linalg.det(edge); inverse = np.linalg.pinv(edge)
normal = np.cross(tri_world[:, 1]-tri_world[:, 0], tri_world[:, 2]-tri_world[:, 0])
normal /= np.maximum(1e-20, np.linalg.norm(normal, axis=1))[:, None]
fold = panel['fold']; angle = math.radians(fold['hingeAngleDeg'])
hinge_distance = -(flat[:, 0]-fold['hingeXmm'])*math.sin(angle)+(flat[:, 1]-fold['hingeYmm'])*math.cos(angle)
is_cuff = hinge_distance[faces].mean(axis=1) > fold['bendWidthMm']/2
region_masks = {'body': ~is_cuff, 'cuff': is_cuff, 'visible': np.ones(len(faces), bool)}
# Positive source triangle normal is paper BACK in the accepted world frame.
side = {'body': 1, 'cuff': -1}
tri_bbox_min = tri_photo.min(axis=1); tri_bbox_max = tri_photo.max(axis=1)
anchor_count = 0; mapped_residuals = []; gaps = []

def serial(value):
    if isinstance(value, (bool, np.bool_)): return bool(value)
    if isinstance(value, np.ndarray): return [serial(x) for x in value.tolist()]
    if isinstance(value, (np.floating, float)):
        assert math.isfinite(value); return float(value)
    if isinstance(value, (np.integer, int)): return int(value)
    if isinstance(value, dict): return {k:serial(v) for k,v in value.items()}
    if isinstance(value, (list, tuple)): return [serial(v) for v in value]
    return value

def bary_for(i, px):
    uv = inverse[i] @ (np.asarray(px)-base[i])
    return np.array([1-uv.sum(), uv[0], uv[1]])

def make_anchor(i, bary, requested=None):
    global anchor_count
    bary = np.asarray(bary, float)
    bary[np.abs(bary) < 1e-10] = 0
    bary = np.clip(bary, 0, 1); bary /= bary.sum()
    region = 'cuff' if is_cuff[i] else 'body'
    px = bary @ tri_photo[i]; xyz = bary @ tri_world[i]
    residual = 0.0 if requested is None else float(np.linalg.norm(px-requested))
    mapped_residuals.append(residual); anchor_count += 1
    return {'ids': faces[i].tolist(), 'triangle': int(i), 'barycentric': bary.tolist(),
            'flatMm': (bary @ tri_flat[i]).tolist(), 'region': region,
            'materialSide': side[region], 'normalSign': -side[region],
            'photoPx': px.tolist(), 'requestedPhotoPx': px.tolist() if requested is None else list(requested),
            'projectionResidualPx': residual,
            'confidence': 'exact-photo-projection-on-assumed-formed-panel',
            'formedModelPosition': xyz.tolist()}

def map_photo(px, region='visible'):
    px = np.asarray(px, float)
    uv = np.einsum('nij,nj->ni', inverse, px-base)
    bary = np.c_[1-uv.sum(axis=1), uv]
    hits = np.flatnonzero((bary.min(axis=1) >= -1e-8) & (np.abs(determinant)>1e-8) & region_masks[region])
    if len(hits) == 0: return None
    depth = np.einsum('ni,i->n', np.einsum('ni,nij->nj', bary[hits], tri_world[hits]), forward)
    chosen = int(hits[np.argmin(depth)])
    return make_anchor(chosen, bary[chosen], px)

def map_flat(q, region=None):
    q = np.asarray(q, float); a = tri_flat[:,0]; e = np.stack((tri_flat[:,1]-a,tri_flat[:,2]-a),axis=2)
    det = np.linalg.det(e); inv = np.linalg.pinv(e); uv=np.einsum('nij,nj->ni',inv,q-a)
    bary=np.c_[1-uv.sum(1),uv]
    hits=np.flatnonzero((bary.min(1)>=-1e-8)&(abs(det)>1e-10))
    if region is not None: hits=hits[region_masks[region][hits]]
    if not len(hits): return None
    return make_anchor(int(hits[0]),bary[hits[0]])

def sample_polyline(points, spacing=3.5, closed=False):
    pts=np.asarray(points,float)
    if closed: pts=np.vstack((pts,pts[0]))
    result=[]
    for j,(a,b) in enumerate(zip(pts[:-1],pts[1:])):
        steps=max(1,int(math.ceil(np.linalg.norm(b-a)/spacing)))
        result.extend(a+(b-a)*t for t in np.linspace(0,1,steps+1)[0 if j==0 else 1:])
    return result

paths=[]
def add_path(id, stage, kind, px, region='visible', closed=False, **meta):
    points=[]; connected=[]; previous=None; missing=[]; sheet_changes=0
    for j,p in enumerate(px):
        ref=map_photo(p,region)
        if ref is None:
            missing.append({'sampleIndex':j,'photoPx':list(p)}); previous=None; continue
        at=len(points); points.append(ref)
        if previous is not None:
            old=points[previous]
            distance=float(np.linalg.norm(np.asarray(ref['formedModelPosition'])-old['formedModelPosition']))
            # A projected curve can cross a physical cuff/body edge. Keep both
            # surface traces, but never draw an unexplained straight bridge.
            if old['region']==ref['region'] and distance < .09: connected.append([previous,at])
            else: sheet_changes+=1
        previous=at
    result={'id':id,'stage':stage,'type':kind,'points':points,'segments':connected,'closed':closed,
            'mapping':{'requestedSamples':len(px),'mappedSamples':len(points),'unmappedSamples':len(missing),
                       'sheetTransitionBreaks':sheet_changes,'gaps':missing,
                       'gapsAreNotMaterial':True},**meta}
    paths.append(result)
    if missing: gaps.append({'path':id,'missingSamples':len(missing),'requestedSamples':len(px)})
    return result

def line_points(a,b): return sample_polyline([a,b])

def clip_convex(subject, clip):
    p=[np.array(x,float)for x in subject];c=np.asarray(clip,float)
    area=np.sum(c[:,0]*np.roll(c[:,1],-1)-c[:,1]*np.roll(c[:,0],-1))
    sign=1 if area>=0 else -1
    def cross(a,b):return a[0]*b[1]-a[1]*b[0]
    for a,b in zip(c,np.roll(c,-1,axis=0)):
        if not p:break
        out=[]
        for old,new in zip(p[-1:]+p[:-1],p):
            so=sign*cross(b-a,old-a);sn=sign*cross(b-a,new-a)
            if (so>=-1e-8)!=(sn>=-1e-8):
                t=so/(so-sn);out.append(old+(new-old)*t)
            if sn>=-1e-8:out.append(new)
        p=out
    return p

def polygon_area(p):
    p=np.asarray(p,float)
    return abs(float(np.sum(p[:,0]*np.roll(p[:,1],-1)-p[:,1]*np.roll(p[:,0],-1))))/2 if len(p)>2 else 0

coverage=[]
def add_coverage(id,clasp,half,polygon,region):
    polygon=np.asarray(polygon,float);lo=polygon.min(axis=0);hi=polygon.max(axis=0)
    # Ignore edge-on fold slivers. These footprints belong to the requested
    # body/cuff material sheet, not every self-overlapping projected triangle.
    facing=normal@forward
    mask=region_masks[region] & (abs(determinant)>1e-8)
    mask &= (facing > .15) if region=='body' else (facing < -.15)
    mask &= np.all(tri_bbox_min<=hi+1e-8,axis=1)&np.all(tri_bbox_max>=lo-1e-8,axis=1)
    vertices=[];indices=[];area=0.;photo_area=0.;source_tris=[]
    for i in np.flatnonzero(mask):
        clipped=clip_convex(tri_photo[i],polygon)
        if len(clipped)<3 or polygon_area(clipped)<1e-8:continue
        refs=[make_anchor(int(i),bary_for(i,p),p)for p in clipped]
        start=len(vertices);vertices.extend(refs)
        for j in range(1,len(refs)-1):indices.extend([start,start+j,start+j+1])
        area+=polygon_area([a['flatMm']for a in refs]);photo_area+=polygon_area(clipped);source_tris.append(int(i))
    target_area=polygon_area(polygon)
    result={'id':id,'clasp':clasp,'half':half,'materialSide':side[region],'normalSign':-side[region],
            'region':region,'vertices':vertices,'indices':indices,'areaFlatMm2':area,
            'photoPolygon':polygon.tolist(),'photoPolygonAreaPx2':target_area,'mappedPhotoAreaPx2':photo_area,
            'uncoveredPhotoAreaPx2':max(0,target_area-photo_area),'photoAreaCoverageFraction':photo_area/target_area,
            'sourceTriangles':source_tris,
            'meaning':'Photo-projected footprint on the assumed formed material; not verified full contact, seam allowance, adhesive area or PU cutting outline.',
            'productionReady':False}
    assert len(indices)%3==0 and area>0
    coverage.append(result)
    return result

# Regions traced from the same photographed layout; no raster is loaded into
# the renderer. The cuffs/eyelet seam lines below are the source construction.
region_body=[[319,569],[346,511],[439,478],[529,440],[625,366],[716,276],[819,554],[704,560],[547,574],[418,578]]
region_cuff=[[700,218],[1115,127],[1214,416],[870,596]]
add_path('region-body',0,'region',sample_polyline(region_body,closed=True),'body',True,label='① 鞋身固定区',provenance='Digitised schematic region boundary in user reference; not factory cut edge.')
add_path('region-cuff',0,'region',sample_polyline(region_cuff,closed=True),'cuff',True,label='② 翻筒固定区',provenance='Cuff corner observation already used by accepted attached-panel fit.')
frame=design['frame'];lines={x['id']:x for x in frame['lines']};keypoints=[]
def add_key(id,label,role,px,region,stage,**meta):
    ref=map_photo(px,region)
    if ref is None:raise RuntimeError(f'Key point {id} has no actual {region} surface at {px}; do not silently clamp.')
    result={'id':id,'label':label,'role':role,'stage':stage,'surface':ref,**meta};keypoints.append(result);return ref

T=frame['tangentIntersection'];P=frame['toeConnectionPoint'];base_end=frame['boundaryIntersections']['secondCuffSeamExtension']
add_key('P','P · 前端连接点','construction',P,'body',1)
add_key('T','T · 图示切点','construction',T,'body',1,geometricNote='User-drawn tangent annotation; not certified 3D differential tangency.')
add_path('top-connection',1,'framework',line_points(P,[1113,lines['topConnection']['slope']*1113+lines['topConnection']['intercept']]))
add_path('left-boundary',1,'framework',line_points(T,base_end),'body')
for id in ['firstCuffSeamExtension','secondCuffSeamExtension']:
    l=lines[id];a=frame['boundaryIntersections'][id];x=l.get('supportX',[0,1170])[1]
    add_path(id,1,'framework',line_points(a,[x,l['slope']*x+l['intercept']]))
for j,id in enumerate(['upperStrapGuide','lowerStrapGuide']):
    l=lines[id];a=frame['boundaryIntersections'][id];x=l.get('supportX',[0,1170])[1]
    add_path(id,2,'guide',line_points(a,[x,l['slope']*x+l['intercept']]))
    add_key('G'+str(j+1),'G'+str(j+1)+' · 辅助线交点','construction',a,'body',2)

for j,t in enumerate(design['golden']['templates']):
    stage=3 if j==0 else 5;kind='first'if j==0 else'opposite'
    def project(q):
        x,y=q;y=1-y if t['mirroredY']else y
        return np.asarray(t['origin'])+t['scalePxPerUnit']*(np.asarray(t['axisX'])*x+np.asarray(t['axisY'])*y)
    add_path('golden-rectangle-'+kind,stage,'golden-rectangle',sample_polyline(t['corners'],closed=True),closed=True,templateId=t['id'],aspect=t['fittedAspect'])
    for arc in t['canonicalArcs'][:5]:
        count=max(15,int(math.ceil(abs(arc['endAngle']-arc['startAngle'])*arc['radius']*t['scalePxPerUnit']/2.8)))
        pts=[project(np.asarray(arc['center'])+arc['radius']*np.array([math.cos(a),math.sin(a)]))for a in np.linspace(arc['startAngle'],arc['endAngle'],count+1)]
        add_path('spiral-'+kind+'-'+str(arc['index']),stage,'spiral-'+kind,pts,arcIndex=arc['index'],templateId=t['id'])
        sx,sy,s=arc['square'];squares=[project(q)for q in [[sx,sy],[sx+s,sy],[sx+s,sy+s],[sx,sy+s]]]
        add_path('golden-square-'+kind+'-'+str(arc['index']),stage,'golden-rectangle',sample_polyline(squares,closed=True),closed=True,arcIndex=arc['index'],templateId=t['id'],isSubdivision=True)
    fifth=t['canonicalArcs'][4];pts=[project(np.asarray(fifth['center'])+fifth['radius']*np.array([math.cos(a),math.sin(a)]))for a in np.linspace(0,2*math.pi,65)]
    add_path('fifth-full-circle-'+kind,4 if j==0 else 6,'support-circle-'+kind,pts,closed=True,
             templateId=t['id'],fittedCenterPhoto=t['fifthArcFullCircleCenterPhoto'],
             observedCenterPhoto=design['observed']['clasps'][j]['centerPhoto'],
             observedCenterResidualPx=t['observedCenterToFifthCircleCenterPx'],
             note='Supporting full circle for arc 5. Authoritative blue centre remains the user-observed one, not silently moved to template centre.')
    add_path('template-to-observed-centre-'+kind,4 if j==0 else 6,'center-link',line_points(t['fifthArcFullCircleCenterPhoto'],design['observed']['clasps'][j]['centerPhoto']))

clasps=[]
for j,c in enumerate(design['observed']['clasps']):
    label=str(j+1);px=np.asarray(c['centerPhoto']);b=np.asarray(c['bodyFixedEndPhoto']);f=np.asarray(c['cuffFixedEndPhoto']);axis=np.asarray(c['strip']['axisUnit']);perp=np.array([-axis[1],axis[0]]);width=c['strip']['widthPx'];r=c['radiusPhotoPx']
    cb=add_key('C'+label+'B','C'+label+'B · 鞋身扣心投影','snap-projection',px,'body',4 if j==0 else 6,clasp=c['id'],isInstallCenter=False)
    cc=add_key('C'+label,'C'+label+' · 可见四合扣心','snap-center',px,'cuff',4 if j==0 else 6,clasp=c['id'],isInstallCenter=False)
    be=add_key('B'+label,'B'+label+' · 鞋身固定端','fixed-end',b,'body',8,clasp=c['id'])
    fe=add_key('F'+label,'F'+label+' · 翻筒固定端','fixed-end',f,'cuff',8,clasp=c['id'])
    poly=np.asarray(c['strip']['corners']);signed=(poly-px)@axis
    # Clip the observed full rectangle at the authoritative blue centre. The
    # true PU overlap is unknown: these are projected half footprints only.
    far=1500.;split_body=[px-perp*far-axis*far,px+perp*far-axis*far,px+perp*far,px-perp*far]
    split_cuff=[px-perp*far,px+perp*far,px+perp*far+axis*far,px-perp*far+axis*far]
    bp=clip_convex(poly,split_body);fp=clip_convex(poly,split_cuff)
    body_cov=add_coverage(c['id']+'-body',c['id'],'body',bp,'body')
    cuff_cov=add_coverage(c['id']+'-cuff',c['id'],'cuff',fp,'cuff')
    circle=[px+r*np.array([math.cos(a),math.sin(a)])for a in np.linspace(0,2*math.pi,73)[:-1]]
    add_coverage(c['id']+'-snap-body',c['id'],'snap-body',circle,'body')
    add_coverage(c['id']+'-snap-cuff',c['id'],'snap-cuff',circle,'cuff')
    closed_center=np.asarray(cc['formedModelPosition']);body_center=np.asarray(cb['formedModelPosition'])
    radius_model=r/math.sqrt(reg['pixelsPerUnitX']*reg['pixelsPerUnitY'])
    clasps.append({'id':c['id'],'number':j+1,'centerPhoto':c['centerPhoto'],'bodyEndPhoto':b.tolist(),'cuffEndPhoto':f.tolist(),
        'bodySurface':cb,'cuffSurface':cc,'bodyEndSurface':be,'cuffEndSurface':fe,
        'radiusModelUnits':radius_model,'radiusPhotoPx':r,'snapAppearanceDiameterMm':12,
        'strip':c['strip'],'bodyCoverageId':body_cov['id'],'cuffCoverageId':cuff_cov['id'],
        'closureLayerGapModelUnits':float(np.linalg.norm(closed_center-body_center)),
        'puWidthMm':None,'overlapMm':None,'maleInstallCenterPatternMm':None,'femaleInstallCenterPatternMm':None,
        'physical':c['physical'],'footprintMeaning':'Projection of photo-defined PU onto separate body/cuff material sheets. A loose PU free end at the snap is not a sewn cloth point.',
        'actualCutLengthsKnown':False})

source={'panelDataSha256':hashlib.sha256(PANEL.read_bytes()).hexdigest(),'claspDesignSha256':hashlib.sha256(DESIGN.read_bytes()).hexdigest(),
        'correctedModelSha256':panel['source']['correctedModelSha256'],'paperProjectSha256':panel['source']['paperProjectSha256']}
assert source['panelDataSha256']=='c7409caba44e6b1ee42abd905e0d2933e88bf15f597096ee89f8f1ec9e8a6b2a','Accepted panel changed; re-review before deriving.'
validation={'allAnchorIdsWithinOriginalPaper':True,'originalPaperVertexCount':panel['source']['sourceVertexCount'],'originalTriangleCount':len(faces),
            'anchorsGenerated':anchor_count,'maximumProjectionResidualPx':max(mapped_residuals),'unmappedPathSamples':sum(x['missingSamples']for x in gaps),
            'pathsWithGaps':gaps,'coverage':[{k:c[k]for k in ['id','materialSide','areaFlatMm2','photoPolygonAreaPx2','mappedPhotoAreaPx2','uncoveredPhotoAreaPx2','photoAreaCoverageFraction']}for c in coverage],
            'fixedEndAndCentresAllHaveActualSurfaceReferences':True,'nearestSurfaceClampingUsed':False,
            'materialConvention':{'body':{'materialSide':1,'normalSign':-1},'cuff':{'materialSide':-1,'normalSign':1}},
            'productionReady':False,'selfIntersectionAndContactValidated':False}
result={'schemaVersion':1,'source':source,'photoRegistration':reg,'photoSize':design['photoSize'],
        'units':{'flat':'mm','photo':'px','model':'uncalibrated model units'},
        'centerDefinition':design['golden']['centerDefinition'],'golden':design['golden'],
        'paths':paths,'keypoints':keypoints,'coverage':coverage,'clasps':clasps,'validation':validation,
        'assumptions':[
          'The accepted formed panel and photographed design are manually registered geometric references, not a recovered manufacture.',
          'Observed blue button centres have authority; fitted golden-template residuals are shown instead of silently snapping to ideal centres.',
          'Photo-projective body/cuff footprints are not certified contact areas, glue masks, stitched areas, seam allowances or PU cutting patterns.',
          'Body is paper front; outward folded cuff is paper back. Both sides use the same source triangles and opposite normal offsets after unfolding.',
          '12 mm is the supplied appearance preset. PU width, real overlap, actual male/female installation centres and cutting lengths remain unmeasured.',
          'Unmapped construction samples at holes/outside the panel are explicit gaps, not silently clamped cloth points.',
          'The full-rectangle photographed strips have slightly different axes; the unconfirmed parallel correction is not used.'
        ],'productionReady':False}
OUT.write_text(json.dumps(serial(result),ensure_ascii=False,separators=(',',':'))+'\n')
print(json.dumps({'file':str(OUT),'bytes':OUT.stat().st_size,'source':source,'paths':len(paths),'keypoints':len(keypoints),
                  'coverage':len(coverage),'validation':validation},ensure_ascii=False,indent=2))
