"""Deterministic digitization of the supplied factory paper photograph.

Uses the photographed 10 mm mat grid, not the 267 x 262 mm sketch annotation.
This is image metrology with explicitly bounded assumptions, not a verified
factory cutting file. Original photographs are never overwritten.

Python dependencies: numpy, scipy, Pillow, opencv-python-headless.
"""
from pathlib import Path
import sys, json, math, hashlib, html
from collections import defaultdict

try:
    import cv2
except ImportError:
    sys.path.insert(0, '/tmp/onward-pattern-deps')
    import cv2
import numpy as np
from scipy.optimize import least_squares
from scipy.ndimage import gaussian_filter1d
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'public/pattern-engineering/data'
SOURCE = ROOT/'public/pattern-engineering/references/01-pattern-original.jpg'
TRACE = ROOT/'public/pattern-engineering/references/02-trace-reference.jpg'
PX_PER_MM = 4
MARGIN_MM = 10
EXPECTED_SHA256 = '6050af66bf614145cf530a24a3ee9c03ac850b3f9519a10cc024b13e30f21ac0'


def project(points, matrix):
    return cv2.perspectiveTransform(np.asarray(points, np.float64).reshape(-1,1,2), matrix).reshape(-1,2)


def paper_contour(image):
    """GrabCut removes narrow white mat strokes attached to the paper edge.

    Initial brightness alone would mistake the white mat grid for the paper.
    The conservative foreground/background seeds stay >20 px from that edge.
    The final 5 px opening removes 1-3 px grid filaments; it is included in the
    declared outline uncertainty and never interpreted as recovered notches.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mask = (gray > 135).astype(np.uint8)*255
    mask = cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))
    mask = cv2.morphologyEx(mask,cv2.MORPH_OPEN,np.ones((11,11),np.uint8))
    contours,_ = cv2.findContours(mask,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    rough = np.zeros_like(gray)
    cv2.drawContours(rough,[max(contours,key=cv2.contourArea)],-1,255,-1)
    grab = np.zeros_like(gray)
    grab[cv2.dilate(rough,np.ones((41,41),np.uint8))>0] = cv2.GC_PR_BGD
    grab[rough>0] = cv2.GC_PR_FGD
    grab[cv2.erode(rough,np.ones((61,61),np.uint8))>0] = cv2.GC_FGD
    cv2.setRNGSeed(27)
    cv2.grabCut(image,grab,None,np.zeros((1,65),np.float64),np.zeros((1,65),np.float64),5,cv2.GC_INIT_WITH_MASK)
    clean = np.where((grab==1)|(grab==3),255,0).astype(np.uint8)
    # This edge is visibly inside x=23 px. The small x<18 filament is a mat
    # grid stroke, not a real extension of the supplied paper.
    clean[:600,:18] = 0
    clean = cv2.morphologyEx(clean,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5)))
    contours,_ = cv2.findContours(clean,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    contour = max(contours,key=cv2.contourArea)
    filled=np.zeros_like(gray);cv2.drawContours(filled,[contour],-1,255,-1)
    return contour.reshape(-1,2),filled


def bright_centroid(values):
    values=np.maximum(np.asarray(values,dtype=float)-110,0)
    if values.max(initial=0)<50 or np.count_nonzero(values>values.max()*.5)>10:
        return None
    return float(np.dot(np.arange(len(values)),values)/values.sum())


def detect_grid(gray,paper):
    edge=cv2.Canny(gray,70,170)
    edge[cv2.dilate(paper,np.ones((35,35),np.uint8))>0]=0
    raw=cv2.HoughLinesP(edge,1,np.pi/1800,90,minLineLength=150,maxLineGap=12)
    if raw is None: raise RuntimeError('No photographed grid lines detected')
    vertical=defaultdict(list);horizontal=defaultdict(list)
    for x1,y1,x2,y2 in raw.reshape(-1,4):
        if abs(y2-y1)>150 and abs((x2-x1)/(y2-y1))<.04:
            a=(x2-x1)/(y2-y1);b=x1-a*y1;k=round((a*1000+b-22)/62)
            if 0<=k<=30:vertical[k].append((a,b))
        if abs(x2-x1)>150 and abs((y2-y1)/(x2-x1))<.025:
            a=(y2-y1)/(x2-x1);b=y1-a*x1;k=round((a*1000+b+5)/62)
            if 0<=k<=33:horizontal[k].append((a,b))
    def fit(families,is_vertical):
        result={}
        for k,seeds in families.items():
            a,b=np.median(seeds,axis=0);points=[]
            for t in range(20,1990 if is_vertical else 1900,17):
                q=a*t+b;u,v=(int(round(q)),t) if is_vertical else (t,int(round(q)))
                if u<10 or u>=1910 or v<10 or v>=2010 or paper[v-8:v+9,u-8:u+9].max()>0:continue
                values=gray[v,u-7:u+8] if is_vertical else gray[v-7:v+8,u]
                c=bright_centroid(values)
                if c is not None:points.append((t,(u if is_vertical else v)-7+c))
            points=np.asarray(points)
            if len(points)<6:continue
            keep=np.ones(len(points),bool)
            for _ in range(3):
                a,b=np.polyfit(points[keep,0],points[keep,1],1)
                residual=points[:,1]-(a*points[:,0]+b);keep=np.abs(residual)<2.5
            result[k]=(float(a),float(b))
        return result
    v=fit(vertical,True);h=fit(horizontal,False)
    # Missing family seeds are interpolated only to SEARCH for actual white
    # pixels. They do not enter the calibration as synthetic observations.
    for family,indices in [(v,range(31)),(h,range(1,33))]:
        keys=sorted(family)
        for k in indices:
            if k not in family:
                family[k]=tuple(float(np.interp(k,keys,[family[z][axis] for z in keys])) for axis in range(2))
    points=[]
    for i,(a,b) in sorted(v.items()):
        for j,(d,e) in sorted(h.items()):
            yy=(d*b+e)/(1-d*a);xx=a*yy+b
            if not(20<xx<1900 and 20<yy<2000):continue
            x,y=int(round(xx)),int(round(yy))
            if paper[y-20:y+21,x-20:x+21].max()>0:continue
            xp=[];yp=[]
            for t in [-18,-14,-10,10,14,18]:
                row=int(round(yy+t));col=int(round(a*row+b))
                c=bright_centroid(gray[row,col-7:col+8])
                if c is not None:xp.append(col-7+c-a*t)
                col=int(round(xx+t));row=int(round(d*col+e))
                c=bright_centroid(gray[row-7:row+8,col])
                if c is not None:yp.append(row-7+c-d*t)
            if len(xp)<4 or len(yp)<4:continue
            points.append([i,j,float(np.median(xp)),float(np.median(yp))])
    points=np.asarray(points)
    holdout=((points[:,0].astype(int)*7+points[:,1].astype(int)*3)%5==0)
    physical=points[:,:2]*10
    homography,_=cv2.findHomography(physical[~holdout],points[~holdout,2:],method=0)
    pixel_residual=np.linalg.norm(project(physical,homography)-points[:,2:],axis=1)
    mm_residual=np.linalg.norm(project(points[:,2:],np.linalg.inv(homography))-physical,axis=1)
    if len(points)<150 or int(holdout.sum())<25:
        raise RuntimeError('Too few independent photographed grid crossings')
    return points,holdout,homography,pixel_residual,mm_residual


def circular_holes(image,paper,matrix):
    # Approximate manual seed readings of the 13 visible lacing punches and
    # four interior punches; final centres/radii are measured from local pixels.
    # White mat lines visible THROUGH holes split some dark discs, so local
    # closing reconnects those observed circular outlines instead of dropping
    # the last two lacing punches or the lower left interior punch.
    eyelets=[(750,460),(773,575),(801,692),(829,810),(862,927),(900,1038),
        (958,1145),(1028,1232),(1120,1299),(1222,1348),(1332,1390),(1449,1428),(1559,1470)]
    internal=[(656,788),(658,1283),(826,1556),(974,1539)]
    gray=cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
    holes=[]
    for role,seeds in [('eyelet',eyelets),('internal-mark',internal)]:
        for i,(sx,sy) in enumerate(seeds):
            radius=26;x0=sx-radius;y0=sy-radius
            tile=(gray[y0:sy+radius+1,x0:sx+radius+1]<125).astype(np.uint8)*255
            tile=cv2.morphologyEx(tile,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7)))
            contours,_=cv2.findContours(tile,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
            candidates=[]
            for c in contours:
                a=cv2.contourArea(c)
                if not(130<a<650):continue
                m=cv2.moments(c)
                if not m['m00']:continue
                center=np.array([m['m10']/m['m00']+x0,m['m01']/m['m00']+y0])
                distance=np.linalg.norm(center-[sx,sy])
                if distance<12:candidates.append((distance,c,center))
            if not candidates: raise RuntimeError(f'Punch seed not verified in source pixels: {sx},{sy}')
            _,c,center=min(candidates,key=lambda a:a[0])
            boundary=c.reshape(-1,2)+[x0,y0]
            target=project([center],matrix)[0];curve=project(boundary,matrix)
            observed=float(np.median(np.linalg.norm(curve-target,axis=1)))
            holes.append({'id':f'{"E" if role=="eyelet" else "M"}{i+1:02d}',
                'center':target.tolist(),'radiusMm':observed,'role':role,
                'boundary':curve.tolist(),'sourcePixels':center.tolist(),
                'confidence':'high' if role=='eyelet' else 'observed-hole-function-unconfirmed',
                'note':'Paper punch radius observed from image; not final metal eyelet or snap diameter.' if role=='eyelet' else 'Observed interior punch; reference/ventilation/fixing function not established.'})
    return holes


# Pixel readings of the actual drawn/slot centre lines. Their FUNCTION is not
# asserted as a recovered manufacturing instruction. The source remains visible.
SOURCE_LINES=[
    ('cuff-crossline-1','fold-reference',[(66,685),(173,665),(290,644),(416,620),(540,595),(675,560),(808,519),(875,497)],'Two upper drawn/slot references; assumed cuff construction reference, exact stitch/fold function unverified.'),
    ('cuff-crossline-2','fold-reference',[(118,832),(245,807),(381,778),(520,742),(661,704),(796,663),(908,635)],'Second upper reference; continuous photo-guided reading across printed/slit gaps.'),
    ('eyelet-inner-reference','seam',[(641,380),(660,455),(682,550),(704,655),(731,764),(762,874),(800,985),(850,1091),(918,1194),(1000,1287),(1101,1355),(1220,1413),(1363,1467),(1495,1517),(1561,1565),(1587,1637),(1606,1748),(1622,1851)],'Visible inner pencil/slot line along throat. Drawn line is observed; precise sewing allowance/function must be confirmed.'),
    ('eyelet-outer-reference','reference',[(29,535),(180,522),(335,498),(485,457),(635,407),(740,375),(801,384),(835,427),(859,505),(877,597),(900,700),(931,815),(971,946),(1022,1067),(1093,1166),(1183,1233),(1293,1282),(1423,1327),(1555,1376),(1642,1426),(1690,1505),(1719,1607),(1741,1720)],'Visible inset perimeter pencil line; retained independently of physical cut outline.'),
    ('heel-inset-reference','seam',[(79,505),(115,661),(172,839),(239,1050),(286,1266),(301,1404),(288,1527),(260,1656),(253,1772),(270,1881)],'Visible heel-side pencil/slot line; exact stitch/cutting semantics unverified.'),
    ('lower-attachment-reference','reference',[(285,1884),(480,1858),(700,1839),(930,1818),(1160,1804),(1390,1781),(1600,1760),(1723,1736)],'Visible long lower pencil reference; sole attachment/lasting allowance is not validated.'),
    ('toe-cross-reference','reference',[(1494,1519),(1584,1475),(1705,1422)],'Visible short diagonal pencil/slot reference at front return.'),
]


def path(points,closed=False):
    if not len(points):return ''
    return 'M '+' L '.join(f'{float(x):.4f},{float(y):.4f}' for x,y in points)+(' Z' if closed else '')


def separate_trace_comparison(factory_boundary):
    """Preserve C's independent hand trace; do not reshape B to agree with it."""
    image=cv2.imread(str(TRACE));b,g,r=cv2.split(image.astype(np.int16))
    beige=((r-g>4)&(g-b>4)&(g>180)).astype(np.uint8)*255
    beige[:210]=0;beige[815:]=0;beige[:,:80]=0;beige[:,705:]=0
    contours,_=cv2.findContours(beige,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    c=cv2.approxPolyDP(max(contours,key=cv2.contourArea),1.2,True).reshape(-1,2)
    low=c.min(0);high=c.max(0);size=high-low
    annotation=np.c_[(c[:,0]-low[0])/size[0]*267,(high[1]-c[:,1])/size[1]*262]
    annotation=np.vstack([annotation,annotation[0]])
    def sample(poly):
        out=[]
        for a,b in zip(poly,poly[1:]):
            n=max(1,math.ceil(float(np.linalg.norm(b-a))/.4))
            out.extend(a+(b-a)*(i/n) for i in range(n))
        return np.asarray(out)
    a=sample(factory_boundary);b=sample(annotation)
    dist=np.r_[cKDTree(a).query(b)[0],cKDTree(b).query(a)[0]]
    (OUT/'trace-reference-pixels.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 894"><title>Independent user-drawn trace C, screenshot pixels only</title><image href="../references/02-trace-reference.jpg" width="1280" height="894"/><path d="{path(c,True)}" fill="none" stroke="#1886b9" stroke-width="1.5"/></svg>\n')
    return {'boundaryPixels':np.vstack([c,c[0]]).tolist(),'boundsPixels':{'min':low.tolist(),'max':high.tolist()},
        'annotationBoundaryMm':annotation.tolist(),
        'annotationScalingAssumption':'C alone is provisionally scaled to its handwritten 267 x 262 mm annotation ONLY for comparison; it does not calibrate or alter B.',
        'annotationScaledShapeComparison':{'meanNearestBoundaryDistanceMm':float(dist.mean()),'rmsMm':float(np.sqrt(np.mean(dist**2))),
            'maximumMm':float(dist.max()),'samplingStepMm':.4,'meaning':'Conditional discrepancy between grid-calibrated B and annotation-scaled C; not a metrology error against a verified ground truth.'}}


def write_svg(pattern,image_info):
    w=pattern['bounds']['width'];h=pattern['bounds']['height']
    outline=path(pattern['boundary'],True)
    pieces=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.4f}mm" height="{h:.4f}mm" viewBox="0 0 {w:.4f} {h:.4f}">',
        '<title>SoulGrain ONWARD photographed paper · nominal millimetre reference</title>',
        '<desc>10 mm photographed grid calibrated; image-derived outline, not a verified production cutting file. Interior line semantics and allowances require factory confirmation.</desc>',
        f'<g transform="translate(0 {h:.5f}) scale(1 -1)">',f'<path id="original-cut-outline" d="{outline}" fill="none" stroke="#176b89" stroke-width="0.25"/>']
    for hole in pattern['holes']:
        x,y=hole['center'];color='#182c4a' if hole['role']=='eyelet' else '#c17a22'
        pieces.append(f'<circle id="{hole["id"]}" cx="{x:.4f}" cy="{y:.4f}" r="{hole["radiusMm"]:.4f}" fill="none" stroke="{color}" stroke-width="0.2"/>')
    for line in pattern['structureLines']:
        color='#a04a83' if line['kind']=='fold-reference' else '#65778b'
        pieces.append(f'<path id="{line["id"]}" d="{path(line["points"])}" fill="none" stroke="{color}" stroke-width="0.18" stroke-dasharray="1.5 1"/>')
    pieces.append('</g></svg>');(OUT/'pattern.svg').write_text('\n'.join(pieces)+'\n')
    raw=pattern['sourceBoundaryPixels'];rawpath=path(raw,True)
    (OUT/'pattern-raw-pixels.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1920 2560"><title>Unrectified original photograph and extracted physical cut outline</title><image href="../references/01-pattern-original.jpg" width="1920" height="2560"/><path d="{rawpath}" fill="none" stroke="#ed3f4f" stroke-width="2"/></svg>\n')
    bx=image_info['boundsMm'];iw=bx['width'];ih=bx['height'];x=bx['x'];y=bx['y']
    svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {iw} {ih}" width="{iw}mm" height="{ih}mm">',
        f'<g transform="translate(0 {h}) scale(1 -1)">',
        f'<image href="pattern-corrected.jpg" x="{x}" y="{y}" width="{iw}" height="{ih}" transform="translate(0 {h}) scale(1 -1)"/>',
        f'<path d="{outline}" fill="none" stroke="#e72b51" stroke-width=".4"/>']
    for hole in pattern['holes']:
        x,y=hole['center'];svg.append(f'<circle cx="{x}" cy="{y}" r="{hole["radiusMm"]+1}" fill="none" stroke="#00a0b0" stroke-width=".3"/>')
    svg.append('</g></svg>');(OUT/'pattern-overlay.svg').write_text('\n'.join(svg)+'\n')


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==EXPECTED_SHA256, 'Unexpected source photograph; recalibrate rather than reuse these source-specific readings.'
    image=cv2.imread(str(SOURCE));assert image is not None and image.shape[:2]==(2560,1920)
    raw,mask=paper_contour(image)
    grid,hold,H,pxres,mmres=detect_grid(cv2.cvtColor(image,cv2.COLOR_BGR2GRAY),mask)
    grid_to_source=H;source_to_grid=np.linalg.inv(H)
    raw_grid=project(raw,source_to_grid)
    selected=(raw[:,1]>1800)&(raw[:,0]>350)&(raw[:,0]<1500)
    bottom=raw_grid[selected]
    initial=np.polyfit(bottom[:,0],bottom[:,1],1)
    fit=least_squares(lambda q:bottom[:,1]-(q[0]*bottom[:,0]+q[1]),initial,loss='soft_l1',f_scale=.2)
    angle=-math.atan(float(fit.x[0]));cos=math.cos(angle);sin=math.sin(angle)
    rotate=np.array([[cos,-sin,0],[sin,cos,0],[0,0,1]])
    before_origin=project(raw,rotate@source_to_grid)
    low=before_origin.min(0);high=before_origin.max(0);w,h=high-low
    origin=np.array([[1,0,-low[0]],[0,-1,high[1]],[0,0,1]])
    source_to_mm=origin@rotate@source_to_grid
    boundary_source=cv2.approxPolyDP(raw.reshape(-1,1,2),1.25,True).reshape(-1,2)
    boundary=project(boundary_source,source_to_mm)
    # Preserve a conventional CCW path in the y-up coordinates.
    area=.5*np.sum(boundary[:,0]*np.roll(boundary[:,1],-1)-boundary[:,1]*np.roll(boundary[:,0],-1))
    if area<0:boundary=boundary[::-1];boundary_source=boundary_source[::-1]
    boundary=np.vstack([boundary,boundary[0]])
    raw_closed=np.vstack([boundary_source,boundary_source[0]])
    mm_to_source=np.linalg.inv(source_to_mm)
    holes=circular_holes(image,mask,source_to_mm)
    structure=[{'id':identifier,'kind':kind,'points':project(points,source_to_mm).tolist(),
        'sourcePixels':[list(p) for p in points],'confidence':'manual-photo-reading-medium',
        'interpretation':meaning} for identifier,kind,points,meaning in SOURCE_LINES]
    image_rect={'file':'pattern-corrected.jpg','boundsMm':{'x':-10,'y':-10,'width':float(w+20),'height':float(h+20)},'pixelsPerMm':PX_PER_MM,
        'imageTopMapsTo':'maximum y, SVG y-up parent requires local image y-flip'}
    width=int(math.ceil((w+20)*PX_PER_MM));height=int(math.ceil((h+20)*PX_PER_MM))
    mm_to_raster=np.array([[PX_PER_MM,0,10*PX_PER_MM],[0,-PX_PER_MM,(h+10)*PX_PER_MM],[0,0,1]])
    corrected=cv2.warpPerspective(image,mm_to_raster@source_to_mm,(width,height),flags=cv2.INTER_CUBIC,borderMode=cv2.BORDER_CONSTANT,borderValue=(38,42,45))
    cv2.imwrite(str(OUT/'pattern-corrected.jpg'),corrected,[cv2.IMWRITE_JPEG_QUALITY,96])
    grid_records=[{'column':int(p[0]),'row':int(p[1]),'gridMm':(p[:2]*10).tolist(),'sourcePixels':p[2:].tolist(),
        'split':'held-out' if test else 'fit','residualPixels':float(px),'residualMm':float(mm)} for p,test,px,mm in zip(grid,hold,pxres,mmres)]
    calibration={'method':'Single projective homography fitted to photographed 10 mm grid crossings; paper bottom orientation rotated only.',
        'nominalGridStepMm':10,'sourceSizePixels':[1920,2560],
        'sourceToMm':source_to_mm.tolist(),'mmToSource':mm_to_source.tolist(),
        'gridMmToSource':grid_to_source.tolist(),'sourceToGridMm':source_to_grid.tolist(),
        'paperRotationDegrees':math.degrees(angle),'rectifiedImage':image_rect,
        'fitCount':int((~hold).sum()),'heldOutCount':int(hold.sum()),
        'fitRmsMm':float(np.sqrt(np.mean(mmres[~hold]**2))),
        'heldOutRmsMm':float(np.sqrt(np.mean(mmres[hold]**2))),
        'maximumGridResidualMm':float(mmres.max()),'gridPoints':grid_records,
        'absoluteAccuracyVerified':False,'outlineReviewEnvelopeMm':2.0,
        'uncertaintyNote':'2 mm is a conservative visual review envelope, not a statistical confidence interval or measured factory tolerance. Mat pitch, paper flatness, camera distortion and internal-line semantics have not been independently measured.'}
    independent_trace=separate_trace_comparison(boundary)
    pattern={'schemaVersion':1,'units':'mm','coordinateSystem':{'origin':'outer-boundary bounding box lower-left','x':'right','y':'up'},
        'bounds':{'min':[0,0],'max':[float(w),float(h)],'width':float(w),'height':float(h)},
        'boundary':boundary.tolist(),'sourceBoundaryPixels':raw_closed.tolist(),'holes':holes,'structureLines':structure,
        'calibration':calibration,'source':{'file':'../references/01-pattern-original.jpg','sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest()},
        'traceComparison':{'file':'../references/02-trace-reference.jpg','annotationMm':[267,262],**independent_trace,
            'digitizedGridBoundsMm':[float(w),float(h)],'differenceMm':[float(w-267),float(h-262)],
            'usedAsScaleConstraint':False,'note':'The handwritten 267 x 262 mm annotation is a cross-check only. It is not used to rescale or change the photographed factory outline.'},
        'productionStatus':'REFERENCE_ONLY_NEEDS_PHYSICAL_VALIDATION',
        'allowances':{'seamAllowanceMm':None,'foldAllowanceMm':None,'note':'Handwritten marks and inset lines do not establish a uniform verified allowance.'}}
    (OUT/'pattern-mm.json').write_text(json.dumps(pattern,ensure_ascii=False,indent=2)+'\n')
    write_svg(pattern,image_rect)
    # Actual original-image overlay used for visual metrology review.
    overlay=image.copy();cv2.polylines(overlay,[raw_closed.astype(np.int32)],True,(55,35,230),2)
    for hole in holes:
        x,y=hole['sourcePixels'];cv2.circle(overlay,(round(x),round(y)),18,(170,145,0),2)
    for p,test in zip(grid,hold):
        x,y=p[2:];cv2.circle(overlay,(round(x),round(y)),4,(15,180,240) if test else (240,140,15),-1)
    cv2.imwrite(str(OUT/'calibration-source-overlay.jpg'),overlay,[cv2.IMWRITE_JPEG_QUALITY,94])
    roundtrip=project(project(boundary_source,source_to_mm),mm_to_source)
    validation={'source':'01-pattern-original.jpg','sourceSha256':pattern['source']['sha256'],
        'gridPointsObserved':len(grid),'fitCount':calibration['fitCount'],'heldOutCount':calibration['heldOutCount'],
        'fitRmsMm':calibration['fitRmsMm'],'heldOutRmsMm':calibration['heldOutRmsMm'],
        'maxGridResidualMm':calibration['maximumGridResidualMm'],
        'boundaryVertexCount':len(boundary)-1,'paperBoundsMm':[float(w),float(h)],
        'referenceAnnotationMm':[267,262],'differenceNotForcedAwayMm':[float(w-267),float(h-262)],
        'sourceMappingRoundTripMaxPixels':float(np.linalg.norm(roundtrip-boundary_source,axis=1).max()),
        'observedEyelets':sum(q['role']=='eyelet' for q in holes),'interiorPunchesFunctionUnknown':sum(q['role']=='internal-mark' for q in holes),
        'boundarySimplificationTolerancePixels':1.25,'gridCoordinateModel':'10 mm nominal mat grid; single homography only; no lens-distortion fitting',
        'outlineExtraction':'Brightness-seeded GrabCut, narrow-grid-filament suppression, full irregular contour; no fitting to shoe photo or traced sketch',
        'productionReady':False,'reviewEnvelopeMm':2.0,
        'limitations':['No physical measurement of mat pitch or paper flatness.','One photo cannot prove absolute dimensional accuracy.','Pencil/slot line semantics and seam/fold allowances need factory confirmation.','The separate hand trace annotation differs from grid measurement and is not forced into agreement.']}
    (OUT/'digitization-validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(validation,ensure_ascii=False,indent=2),flush=True)


if __name__=='__main__':main()
