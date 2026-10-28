/** Provisional side-photo registration. Pixel scale is a camera-fit parameter,
 * NOT a ruler: the photograph is oblique and has no independent metric scale. */
import type { DeformationParams, PatternMesh, SurfaceAnchor, Vec2, Vec3 } from './types.ts';
import { anchorAtTriangle, barycentric2D } from './mapping.ts';
import { createReferenceEvaluator } from './deformation.ts';

export interface PhotoRegistration {
  /** photoX = originXPx - pixelsPerMmX * formedX */
  originXPx: number;
  /** photoY = originYPx - pixelsPerMmY * formedY */
  originYPx: number;
  pixelsPerMmX: number;
  pixelsPerMmY: number;
  widthPx: number;
  heightPx: number;
  assumption: string;
}
export interface PhotoLandmark {
  id: string;
  photoPx: Vec2;
  enabled: boolean;
  confidence: 'assumed';
  note: string;
}
export const PHOTO_LANDMARKS: readonly PhotoLandmark[] = [
  {id:'E01',photoPx:[877,540],enabled:true,confidence:'assumed',note:'Assumed lowest visible turned-cuff eyelet; identity is unverified.'},
  {id:'E02',photoPx:[846,469],enabled:true,confidence:'assumed',note:'Assumed turned-cuff eyelet correspondence.'},
  {id:'E03',photoPx:[818,400],enabled:true,confidence:'assumed',note:'Assumed turned-cuff eyelet correspondence.'},
  {id:'E04',photoPx:[785,330],enabled:true,confidence:'assumed',note:'Assumed turned-cuff eyelet correspondence.'},
  {id:'E05',photoPx:[760,259],enabled:true,confidence:'assumed',note:'Assumed highest visible turned-cuff eyelet correspondence.'},
  {id:'E06',photoPx:[719,209],enabled:false,confidence:'assumed',note:'Ambiguous partly hidden neck/rim eyelet; excluded from fitting.'},
  {id:'E07',photoPx:[679,273],enabled:true,confidence:'assumed',note:'Assumed upper laced-body eyelet correspondence.'},
  {id:'E08',photoPx:[641,331],enabled:true,confidence:'assumed',note:'Assumed laced-body eyelet correspondence.'},
  {id:'E09',photoPx:[577,384],enabled:true,confidence:'assumed',note:'Assumed laced-body eyelet correspondence.'},
  {id:'E10',photoPx:[517,428],enabled:true,confidence:'assumed',note:'Assumed laced-body eyelet correspondence.'},
  {id:'E11',photoPx:[459,466],enabled:true,confidence:'assumed',note:'Assumed laced-body eyelet correspondence.'},
  {id:'E12',photoPx:[399,487],enabled:true,confidence:'assumed',note:'Assumed laced-body eyelet correspondence.'},
  {id:'E13',photoPx:[359,511],enabled:true,confidence:'assumed',note:'Partly hidden forefoot eyelet, visually estimated; relatively uncertain.'},
];

export const DEFAULT_PHOTO_REGISTRATION: Readonly<PhotoRegistration> = {
  originXPx:1194.51801232, originYPx:794.97252730,
  pixelsPerMmX:3.62713332, pixelsPerMmY:4.13137166,
  widthPx:1280,heightPx:894,
  assumption:'Independent X/Y orthographic display scales fitted to assumed eyelet correspondences. This is an illustrative camera registration, not a metric calibration or recovered physical camera. Perspective and hidden lasting areas remain unresolved.',
};

/** One low-distortion folding hypothesis fitted to the same eyelets. No
 * Gaussian shape correction is applied. These are hypotheses, not factory data. */
export const PHOTO_DEFORMATION_HYPOTHESIS: Readonly<DeformationParams> = {
  hingeXmm:100, hingeYmm:144.41562128, hingeAngleDeg:-10.28880149,
  foldAngleDeg:-176.70347315,bendWidthMm:12.92461026,
  heelWrapDeg:0,heelWrapLengthMm:80,sideDepthMm:0,landmarkStrength:0,
  assumption:'Provisional circular-band fold fitted to 12 assumed eyelet matches in one oblique photograph. The hinge was NOT observed on the paper. No sewing, lasting, layer contact or hidden-region recovery has been verified; this does not recover the complete shoe silhouette.',
};

function validateRegistration(r:PhotoRegistration) {
  if(![r.originXPx,r.originYPx,r.pixelsPerMmX,r.pixelsPerMmY,r.widthPx,r.heightPx].every(Number.isFinite)||r.pixelsPerMmX<=0||r.pixelsPerMmY<=0||r.widthPx<=0||r.heightPx<=0)throw Error('Invalid photograph registration. Scales and image dimensions must be finite and positive.');
}
export function worldToPhoto(point:Vec2|Vec3,r:PhotoRegistration=DEFAULT_PHOTO_REGISTRATION):[number,number] {
  validateRegistration(r);return[r.originXPx-r.pixelsPerMmX*point[0],r.originYPx-r.pixelsPerMmY*point[1]];
}
export function photoToWorld(point:Vec2,r:PhotoRegistration=DEFAULT_PHOTO_REGISTRATION):[number,number] {
  validateRegistration(r);return[(r.originXPx-point[0])/r.pixelsPerMmX,(r.originYPx-point[1])/r.pixelsPerMmY];
}
/** Compatible with ThreeView.setReferencePhoto({frameMm,mirrorX:true}). */
export function photoProjectionFrame(r:PhotoRegistration=DEFAULT_PHOTO_REGISTRATION):[number,number,number,number] {
  validateRegistration(r);return[(r.originXPx-r.widthPx)/r.pixelsPerMmX,r.originXPx/r.pixelsPerMmX,(r.originYPx-r.heightPx)/r.pixelsPerMmY,r.originYPx/r.pixelsPerMmY];
}
export function signedHingeDistance(point:Vec2,params:DeformationParams) {
  const a=params.hingeAngleDeg*Math.PI/180;return-(point[0]-params.hingeXmm)*Math.sin(a)+(point[1]-params.hingeYmm)*Math.cos(a);
}
export type SurfaceLayer='body'|'cuff';
export interface PhotoProjectionCandidate {anchor:SurfaceAnchor;layer:SurfaceLayer;creaseBand:boolean;depthMm:number}
export interface PhotoProjectionResult {
  anchor:SurfaceAnchor|null;
  candidates:PhotoProjectionCandidate[];
  requestedLayer:SurfaceLayer|'any';
  ambiguous:boolean;
  warnings:string[];
}
/** Orthographic inverse projection can hit both fabric layers. Every returned
 * anchor retains a real triangle + barycentric identity; no nearest-point
 * fallback is used. Visible-most means smallest Z for the side camera at -Z.
 * 'body'/'cuff' are classifications relative to the assumed hinge only. */
export function projectPhotoToSurface(mesh:PatternMesh,positionsMm:ArrayLike<number>,photoPx:Vec2,registration:PhotoRegistration,params:DeformationParams,layer:SurfaceLayer|'any'='any'):PhotoProjectionResult {
  if(positionsMm.length!==mesh.flatMm.length/2*3)throw Error('Photo projection requires the same source mesh topology.');
  const xy=photoToWorld(photoPx,registration),candidates:PhotoProjectionCandidate[]=[];
  for(let i=0;i<mesh.indices.length;i+=3){
    const ids=[mesh.indices[i],mesh.indices[i+1],mesh.indices[i+2]];
    const p=ids.map(id=>[positionsMm[id*3],positionsMm[id*3+1]] as Vec2);
    const bary=barycentric2D(xy,p[0],p[1],p[2]);
    if(!bary||bary.some(v=>v< -1e-8||v>1+1e-8))continue;
    const b=bary.map(v=>Math.max(0,Math.min(1,v))),s=b.reduce((a,v)=>a+v,0);
    const anchor=anchorAtTriangle(mesh,positionsMm,i/3,b.map(v=>v/s) as [number,number,number]);
    const d=signedHingeDistance(anchor.flatMm,params),materialLayer:SurfaceLayer=d>0?'cuff':'body';
    if(layer!=='any'&&materialLayer!==layer)continue;
    // A point on a common triangle edge is one material location, not two.
    if(candidates.some(c=>Math.hypot(c.anchor.flatMm[0]-anchor.flatMm[0],c.anchor.flatMm[1]-anchor.flatMm[1])<1e-6))continue;
    candidates.push({anchor,layer:materialLayer,creaseBand:d>0&&d<params.bendWidthMm,depthMm:anchor.formedMm[2]});
  }
  candidates.sort((a,b)=>a.depthMm-b.depthMm);
  const warnings:string[]=[];
  if(!candidates.length)warnings.push(`No ${layer==='any'?'material':layer} triangle projects to this photograph pixel. The point remains unmapped; no nearby point was substituted.`);
  if(candidates.length>1)warnings.push(`${candidates.length} material points share this photograph projection. The selected point is nearest the side camera within the requested layer; hidden-layer identity still requires validation.`);
  if(candidates[0]?.creaseBand)warnings.push('The selected point lies in the assumed bend band, whose physical construction is unverified.');
  warnings.push('Inverse projection depends on the unverified fold and photograph registration; it is not a measured installation coordinate.');
  return{anchor:candidates[0]?.anchor??null,candidates,requestedLayer:layer,ambiguous:candidates.length>1,warnings};
}

export function eyeletResiduals(mesh:PatternMesh,params:DeformationParams,registration:PhotoRegistration,landmarks:readonly PhotoLandmark[]=PHOTO_LANDMARKS) {
  const evaluate=createReferenceEvaluator(mesh,1,params);
  const points=landmarks.map(l=>{
    const hole=mesh.pattern.holes.find(h=>h.id===l.id);
    const predictedPhotoPx=hole?worldToPhoto(evaluate(hole.center),registration):null;
    const residualPx=predictedPhotoPx?Math.hypot(predictedPhotoPx[0]-l.photoPx[0],predictedPhotoPx[1]-l.photoPx[1]):null;
    return{...l,predictedPhotoPx,residualPx,referenceOnly:true,note:`${l.note} Hole centre is empty space, not a fabric anchor.`};
  });
  const fitted=points.filter(p=>p.enabled&&p.residualPx!==null),rmsPx=fitted.length?Math.sqrt(fitted.reduce((s,p)=>s+p.residualPx!**2,0)/fitted.length):null;
  return{points,count:fitted.length,rmsPx,maxPx:fitted.length?Math.max(...fitted.map(p=>p.residualPx!)):null,
    validationStatus:'in-sample provisional fit; no independent photo validation',
    warning:'Residuals describe agreement with manually estimated and unverified eyelet matches, not full-silhouette or manufacturing accuracy.'};
}
