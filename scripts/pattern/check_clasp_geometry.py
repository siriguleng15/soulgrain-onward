"""Extract this user's drawn clasp construction from immutable reference pixels.

Pillow/NumPy/SciPy only. No inference of physical millimetres from a screenshot.
Run from repository root: python3 scripts/pattern/check_clasp_geometry.py
"""
from pathlib import Path
import json, math, hashlib
import numpy as np
from PIL import Image
from scipy import ndimage
from scipy.spatial import ConvexHull
from scipy.optimize import least_squares

ROOT=Path(__file__).resolve().parents[2]
REF=ROOT/'public/pattern-engineering/references'
OUT=ROOT/'public/pattern-engineering/data/clasp-design.json'
PHI=(1+math.sqrt(5))/2

def image(name):
 return np.asarray(Image.open(REF/name).convert('RGB')).astype(float)

def rounded(v):
 if isinstance(v,bool):return v
 if isinstance(v,np.ndarray):return [rounded(n) for n in v.tolist()]
 if isinstance(v,(np.floating,float)):return round(float(v),6)
 if isinstance(v,(np.integer,int)):return int(v)
 if isinstance(v,dict):return {k:rounded(n) for k,n in v.items()}
 if isinstance(v,(list,tuple)):return [rounded(n) for n in v]
 return v

def fit_circle(mask):
 y,x=np.where(mask);pts=np.c_[x,y];hull=pts[ConvexHull(pts).vertices]
 def residual(p):return np.hypot(hull[:,0]-p[0],hull[:,1]-p[1])-p[2]
 fit=least_squares(residual,[x.mean(),y.mean(),24]);cx,cy,r=fit.x
 return {'center':[cx,cy],'radiusPx':r,'hullCircleRmsPx':np.sqrt(np.mean(fit.fun**2)),
         'bluePixelCount':len(pts),'method':'Blue interior convex hull least-squares circle; guide-line occlusion retained as missing data',
         'pixelOutlineUncertaintyPx':1.5}

def oriented_rectangle(pts):
 best=None
 for angle in np.linspace(-.60,-.35,2501):
  e=np.array([np.cos(angle),np.sin(angle)]);n=np.array([-e[1],e[0]])
  u=pts@e;v=pts@n;area=np.ptp(u)*np.ptp(v)
  if best is None or area<best[0]:best=(area,angle,u.min(),u.max(),v.min(),v.max())
 _,angle,u0,u1,v0,v1=best;e=np.array([np.cos(angle),np.sin(angle)]);n=np.array([-e[1],e[0]])
 a=e*u0+n*(v0+v1)/2;b=e*u1+n*(v0+v1)/2
 return {'bodyEnd':a,'cuffEnd':b,'midpoint':(a+b)/2,'axisUnit':e,'angleDeg':np.degrees(angle),
         'lengthPx':u1-u0,'widthPx':v1-v0,
         'corners':[e*u+n*v for u,v in [(u0,v0),(u1,v0),(u1,v1),(u0,v1)]],
         'method':'Minimum-area oriented rectangle fitted to both white PU halves, excluding blue button occlusion'}

def fit_lines(mask):
 y,x=np.where(mask);pts=np.c_[x,y].astype(float);remaining=pts.copy();lines=[]
 for index in range(5):
  best=None
  for slope in np.arange(-.62,-.38,.0005):
   b=remaining[:,1]-slope*remaining[:,0];bins=np.bincount(np.round(b).astype(int),minlength=1600)
   bins=np.convolve(bins,np.ones(3),'same');at=np.argmax(bins)
   if best is None or bins[at]>best[0]:best=(bins[at],slope,float(at))
  _,m,b=best
  for _ in range(3):
   residual=(remaining[:,1]-m*remaining[:,0]-b)/np.sqrt(1+m*m);q=remaining[np.abs(residual)<1.7]
   m,b=np.polyfit(q[:,0],q[:,1],1)
  residual=(q[:,1]-m*q[:,0]-b)/np.sqrt(1+m*m)
  lines.append({'slope':m,'intercept':b,'angleDeg':np.degrees(np.arctan(m)),
                'rmsPx':np.sqrt(np.mean(residual**2)),'supportPixels':len(q),
                'supportX':[q[:,0].min(),q[:,0].max()]})
  remaining=remaining[np.abs((remaining[:,1]-m*remaining[:,0]-b)/np.sqrt(1+m*m))>3]
 lines.sort(key=lambda line:line['intercept'])
 for line,name in zip(lines,['topConnection','upperStrapGuide','firstCuffSeamExtension','lowerStrapGuide','secondCuffSeamExtension']):line['id']=name
 sub=pts[(pts[:,0]>565)&(pts[:,0]<675)&(pts[:,1]>420)&(pts[:,1]<600)];best=None
 for m in np.arange(1.5,2.2,.0005):
  offsets=sub[:,1]-m*sub[:,0];bins=np.bincount(np.round(offsets+1200).astype(int),minlength=2000);bins=np.convolve(bins,np.ones(3),'same');at=bins.argmax()
  if best is None or bins[at]>best[0]:best=(bins[at],m,float(at-1200))
 _,m,b=best
 for _ in range(3):
  q=sub[np.abs((sub[:,1]-m*sub[:,0]-b)/np.sqrt(1+m*m))<1.3];m,b=np.polyfit(q[:,0],q[:,1],1)
 residual=(q[:,1]-m*q[:,0]-b)/np.sqrt(1+m*m)
 boundary={'id':'bodyAttachmentBoundary','slope':m,'intercept':b,'angleDeg':np.degrees(np.arctan(m)),
           'rmsPx':np.sqrt(np.mean(residual**2)),'supportPixels':len(q),'supportY':[q[:,1].min(),q[:,1].max()]}
 return lines,boundary

def intersection(a,b):
 x=(b['intercept']-a['intercept'])/(a['slope']-b['slope']);return np.array([x,a['slope']*x+a['intercept']])

def line_dist(line,p):return abs(p[1]-line['slope']*p[0]-line['intercept'])/np.sqrt(1+line['slope']**2)

def golden_arcs(count=8):
 x=y=0.;w=PHI;h=1.;result=[]
 for i in range(count):
  s=min(w,h);side=i%4
  if side==0:sx,sy=x,y;x+=s;w-=s;cx,cy=sx+s,sy
  elif side==1:sx,sy=x,y+h-s;h-=s;cx,cy=sx,sy
  elif side==2:sx,sy=x+w-s,y;w-=s;cx,cy=sx,sy+s
  else:sx,sy=x,y;y+=s;h-=s;cx,cy=sx+s,sy+s
  a=math.pi-i*math.pi/2;b=a-math.pi/2
  result.append({'index':i+1,'square':[sx,sy,s], 'center':[cx,cy],'radius':s,
                 'startAngle':a,'endAngle':b,'start':[cx+s*math.cos(a),cy+s*math.sin(a)],'end':[cx+s*math.cos(b),cy+s*math.sin(b)]})
 return result

def fit_template(filename,boundary,lines,mirrored):
 # Orientation comes from the pixel-fitted inserted white reference's convex
 # hull, not from the prescribed location of either clasp.
 original=image('06-design-midlines.jpg');inserted=image(filename);yy,xx=np.indices(original.shape[:2])
 mask=(np.median(inserted-original,axis=2)>50)&(xx>500)&(xx<960)&(yy>250)&(yy<635)
 lab,_=ndimage.label(mask);areas=np.bincount(lab.ravel());keep=np.flatnonzero(areas>25);keep=keep[keep!=0];y,x=np.where(np.isin(lab,keep))
 raw=oriented_rectangle(np.c_[x,y]);angle=math.radians(raw['angleDeg']);e=np.array([math.cos(angle),math.sin(angle)]);n=np.array([-e[1],e[0]])
 # The outer inserted picture includes labels/padding; detect its INNER drawn
 # rectangle after rotation. These search windows bracket visible frame lines,
 # not a forced nominal ratio. Green painted pixels are excluded by saturation.
 from scipy.ndimage import map_coordinates
 U=np.arange(280,601,.25);V=np.arange(640,846,.25);Y,X=np.meshgrid(V,U,indexing='ij')
 PX=e[0]*X+n[0]*Y;PY=e[1]*X+n[1]*Y
 colors=np.stack([map_coordinates(inserted[:,:,k],[PY,PX],order=1,mode='nearest') for k in range(3)],2)
 gray=colors.mean(2);spread=np.ptp(colors,axis=2);edges={}
 for name,axis,lo,hi,alonglo,alonghi in [('left',1,292,305,670,820),('right',1,580,591,670,820),('top',0,648,658,310,575),('bottom',0,824,836,310,575)]:
  vals=U if axis else V;along=V if axis else U;sl=(along>alonglo)&(along<alonghi)
  g=gray[sl,:] if axis else gray[:,sl];sat=spread[sl,:] if axis else spread[:,sl]
  # A robust per-column median suppresses labels, circle arcs and shoe texture.
  import warnings
  with warnings.catch_warnings():
   warnings.simplefilter('ignore');profile=np.nanmedian(np.where(sat<35,g,np.nan),axis=0 if axis else 1)
  choose=(vals>lo)&(vals<hi);candidate=vals[choose];segment=profile[choose]
  edges[name]=float(candidate[np.nanargmin(segment)])
 u0,u1,v0,v1=[edges[k] for k in ['left','right','top','bottom']]
 measured_w=u1-u0;measured_h=v1-v0
 scale=(PHI*measured_w+measured_h)/(PHI*PHI+1)
 origin=e*u0+n*v0
 def project(p):
  q=np.array(p).copy()
  if mirrored:q[1]=1-q[1]
  return origin+(e*q[0]+n*q[1])*scale
 arcs=golden_arcs();corners=[origin+(e*p[0]+n*p[1])*scale for p in [[0,0],[PHI,0],[PHI,1],[0,1]]]
 fourth=project(arcs[3]['end']);fifth=project(arcs[4]['center'])
 return {'id':'opposite' if mirrored else 'first','reference':filename,'mirroredY':mirrored,
  'canonicalSize':[PHI,1],'origin':origin,'axisX':e,'axisY':n,'scalePxPerUnit':scale,'angleDeg':raw['angleDeg'],
  'innerFrameObservedAligned':edges,'observedAspect':measured_w/measured_h,
  'fittedAspect':PHI,'fitSizeResidualPx':[PHI*scale-measured_w,scale-measured_h],
  'corners':corners,'fourthArcEndPhoto':fourth,'fifthArcFullCircleCenterPhoto':fifth,
  'fifthArcFullCircleDiameterPx':2*arcs[4]['radius']*scale,
  'frameAgreementPx':{'top':[line_dist(lines[0],p) for p in corners[:2]],
                      'bottom':[line_dist(lines[-1],p) for p in corners[2:]],
                      'left':[line_dist(boundary,p) for p in [corners[0],corners[3]]]},
  'fitUncertaintyPx':2,'canonicalArcs':arcs}

def main():
 a=image('06-design-midlines.jpg');r,g,b=a.transpose(2,0,1);yy,xx=np.indices(r.shape)
 green=(g>130)&(g-r>70)&(g-b>50)&(xx>280)&(xx<1200)&(yy>100)&(yy<650)
 lines,boundary=fit_lines(green)
 a=image('11-design-centers.jpg');r,g,b=a.transpose(2,0,1)
 blue=(b>140)&(g>100)&(r<140)&(b-r>60)&(xx>700)&(xx<900)
 circles=[fit_circle(blue&(yy>lo)&(yy<hi)) for lo,hi in [(330,410),(420,490)]]
 a=image('12-design-final-straps.jpg');r,g,b=a.transpose(2,0,1)
 white=(r>230)&(g>230)&(b>230)&(xx>550)&(xx<1030)&(yy>250)&(yy<570)
 lab,_=ndimage.label(white);areas=np.bincount(lab.ravel());parts=[]
 for ident in np.flatnonzero(areas>1000):
  if ident==0:continue
  y,x=np.where(lab==ident);parts.append((np.c_[x,y],float(np.mean(y+.5*x))))
 strips=[oriented_rectangle(np.concatenate([p for p,k in parts if (k<810)==upper])) for upper in [True,False]]
 observed=[]
 for i,(circle,strip) in enumerate(zip(circles,strips),1):
  c=np.array(circle['center']);observed.append({'id':f'clasp-{i}','centerPhoto':c,'radiusPhotoPx':circle['radiusPx'],
    'circleFit':circle,'bodyFixedEndPhoto':strip['bodyEnd'],'cuffFixedEndPhoto':strip['cuffEnd'],
    'strip':strip,'circleToStripMidpointErrorPx':np.linalg.norm(c-strip['midpoint']),
    'bodyBoundaryDistancePx':line_dist(boundary,strip['bodyEnd']),
    'physical':{'snapAppearanceDiameterMm':12,'puWidthMm':None,'overlapMm':None,'bodySeamAllowanceMm':None,'cuffSeamAllowanceMm':None,'maleInstallCenterPatternMm':None,'femaleInstallCenterPatternMm':None,
      'status':'Photo observation only; 12 mm is a preset appearance diameter, not a global screenshot scale or PU width.'}})
 common_angle=np.mean([np.arctan(lines[k]['slope']) for k in [1,3]])
 e=np.array([np.cos(common_angle),np.sin(common_angle)]);m=np.tan(common_angle);strict=[]
 for item in observed:
  c=item['centerPhoto'];guide={'slope':m,'intercept':c[1]-m*c[0]};A=intersection(guide,boundary);B=2*c-A
  strict.append({'id':item['id'],'centerPhoto':c,'bodyFixedEndPhoto':A,'cuffFixedEndPhoto':B,
                 'axisUnit':e,'angleDeg':np.degrees(common_angle),
                 'observedBodyEndShiftPx':np.linalg.norm(A-item['bodyFixedEndPhoto']),
                 'observedCuffEndShiftPx':np.linalg.norm(B-item['cuffFixedEndPhoto'])})
 templates=[fit_template('07-design-spiral-first.jpg',boundary,lines,False),fit_template('09-design-spiral-mirror.jpg',boundary,lines,True)]
 for template,clasp in zip(templates,observed):
  c=clasp['centerPhoto'];template['observedCenterToFourthEndPx']=np.linalg.norm(c-template['fourthArcEndPhoto'])
  template['observedCenterToFifthCircleCenterPx']=np.linalg.norm(c-template['fifthArcFullCircleCenterPhoto'])
  template['fifthCircleToObservedDiameterRatio']=template['fifthArcFullCircleDiameterPx']/(2*clasp['radiusPhotoPx'])
 result={'schemaVersion':1,'units':'photo-px','photoSize':[1280,894],'photoReference':'03-shoe-side-original.jpg',
  'sourceFiles':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in REF.glob('*.jpg') if f.name.startswith(('03-','04-','05-','06-','07-','08-','09-','10-','11-','12-'))},
  'defaultLayout':'observed','frame':{'lines':lines,'bodyBoundary':boundary,
    'tangentIntersection':intersection(lines[0],boundary),'toeConnectionPoint':[319,569],
    'toeConnectionPointMethod':'Digitized user-painted toe-side endpoint, uncertainty approximately 3 photo pixels; not a factory datum','boundaryIntersections':{l['id']:intersection(l,boundary) for l in lines},
    'semanticRoles':{'topConnection':'Connects body toe-side region and cuff upper-right; yellow tangent annotation is a graphical construction, not a measured curvature constraint.',
      'firstCuffSeamExtension':'First original cuff seam extended toward the body boundary','secondCuffSeamExtension':'Second original cuff seam extended toward body boundary'}},
  'observed':{'clasps':observed,'axisDifferenceDeg':abs(strips[0]['angleDeg']-strips[1]['angleDeg'])},
  'constraintCandidate':{'userConfirmed':False,'enabledByDefault':False,'purpose':'Optional test of the written parallel-axis / exact midpoint rules; not a replacement of user observed design','clasps':strict},
  'golden':{'phi':PHI,'kind':'Recursive golden-rectangle quarter-circle construction; not an exact logarithmic spiral',
    'templates':templates,'numberingIssue':'Confirmed by the user: use the photographed blue button center, meaning the center of the complete circle supporting arc 5. It is not the endpoint of arc 4. Measured blue centers remain the placement authority despite the fitted-template residual.',
    'centerDefinition':{'userConfirmed':True,'confirmedDefinition':'fifth-arc-supporting-circle-center','defaultCenterSource':'observed-blue-circle',
      'confirmation':'以图中蓝色扣心为准，即第五段完整圆的圆心','confirmationDate':'2026-10-28',
      'note':'The confirmation resolves the geometric meaning, not the remaining hand-drawing and template-fit errors. No observed blue center is moved to enforce ideal geometry.'},
    'physicalScaleIssue':'No global millimetres-per-pixel is inferred. The source cloth and hardware are not a calibrated fronto-parallel plane.'},
  'manufacturing':{'physicalInputRequired':['puWidthMm','overlapMm','bodySeamAllowanceMm','cuffSeamAllowanceMm'],
    'snapMaleFemaleCenters':'Two contacts at an overlap may map to different original cloth points; each needs its own surface identity. A single visible pixel does not establish both.',
    'cutLengthRule':'bodyPiece = measured body-end-to-snap surface arc + overlap/2 + body sew allowance; cuffPiece = cuff arc + overlap/2 + cuff sew allowance. Symmetric overlap is a named assumption, not supplied manufacturing fact.'},
  'warnings':['All extracted values are screenshot pixels with anti-aliasing/hand-drawing uncertainty, not factory dimensions.',
    'Source drawn PU axes are not exactly parallel and blue button centers are not exactly the fitted full-strip midpoints. Default preserves the observed artwork.',
    'Green construction lines are not a strict orthogonal rectangle; simultaneous three-edge coincidence has finite residual.',
    'Only the final assembled 3D surface/triangle identity can supply reversible pattern-mm mapping; photo coordinates alone are not a paper pattern.']}
 OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(rounded(result),ensure_ascii=False,indent=2)+'\n')
 assert result['observed']['axisDifferenceDeg']>3 and result['observed']['axisDifferenceDeg']<4
 assert all(c['circleFit']['hullCircleRmsPx']<.5 for c in observed)
 assert all(c['physical']['puWidthMm'] is None for c in observed)
 assert all(np.linalg.norm(np.array(c['centerPhoto'])-(np.array(c['bodyFixedEndPhoto'])+np.array(c['cuffFixedEndPhoto']))/2)<1e-8 for c in strict)
 print('WROTE',OUT)
 print(json.dumps(rounded({'centers':[c['centerPhoto'] for c in observed], 'axisDifferenceDeg':result['observed']['axisDifferenceDeg'],
  'midpointErrorPx':[c['circleToStripMidpointErrorPx'] for c in observed],
  'goldenFrameAspect':[t['observedAspect'] for t in templates],
  'fourthEndVsBlueCenterPx':[t['observedCenterToFourthEndPx'] for t in templates],
  'fifthCircleCenterVsBlueCenterPx':[t['observedCenterToFifthCircleCenterPx'] for t in templates]}),indent=2))

if __name__=='__main__':main()
