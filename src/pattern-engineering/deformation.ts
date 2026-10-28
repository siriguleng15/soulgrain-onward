import type { DeformationParams, LandmarkConstraint, MeshValidation, PatternData, PatternMesh, Vec2, Vec3 } from './types.ts';
import { mapFlatToSurface } from './mapping.ts';

const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(t:number)=>{t=clamp(t);return t*t*(3-2*t);};
const radians=(n:number)=>n*Math.PI/180;

/** Recommendation is explicitly a hypothesis to be edited, not a recovered
 * factory folding line. The two transverse marks remain independent features. */
export function RecommendedDeformationParams(pattern:PatternData):DeformationParams {
  const H=pattern.bounds.height,W=pattern.bounds.width;
  const transverse=pattern.structureLines.filter(line=>line.points.length>1).map(line=>{
    const xs=line.points.map(p=>p[0]),ys=line.points.map(p=>p[1]);
    const meanY=ys.reduce((a,b)=>a+b,0)/ys.length,meanX=xs.reduce((a,b)=>a+b,0)/xs.length;
    const left=line.points.reduce((a,b)=>a[0]<b[0]?a:b),right=line.points.reduce((a,b)=>a[0]>b[0]?a:b);
    return{line,meanY,meanX,span:Math.max(...xs)-Math.min(...xs),rise:Math.max(...ys)-Math.min(...ys),angle:Math.atan2(right[1]-left[1],right[0]-left[0])*180/Math.PI};
  }).filter(l=>l.meanY>H*.55&&l.meanX<W*.65&&l.span>W*.18&&l.rise<H*.25).sort((a,b)=>b.meanY-a.meanY).slice(0,2);
  let hingeYmm=H*.62,hingeXmm=W*.2,hingeAngleDeg=0,bendWidthMm=12;
  let assumption='Fold hinge at 62% of cut height is an unverified hypothesis; no manufacturing fold line was identified.';
  if(transverse.length===2){
    const spacing=Math.abs(transverse[0].meanY-transverse[1].meanY);
    hingeYmm=Math.min(transverse[0].meanY,transverse[1].meanY)-spacing;
    hingeXmm=transverse[1].meanX;hingeAngleDeg=(transverse[0].angle+transverse[1].angle)/2;
    bendWidthMm=clamp(spacing*.35,6,16);
    assumption=`Hinge extrapolated one transverse-mark interval (${spacing.toFixed(2)} mm) below the lower mark. The marks themselves are NOT treated as the manufacturing hinge; physical verification is required.`;
  }
  return{hingeXmm,hingeYmm,hingeAngleDeg,foldAngleDeg:180,bendWidthMm,heelWrapDeg:55,heelWrapLengthMm:Math.min(80,W*.30),sideDepthMm:0,landmarkStrength:0,assumption};
}

interface Curve { x:Float64Array; z:Float64Array; theta:Float64Array; width:number; }
function makeHeelCurve(width:number,params:DeformationParams,progress:number):Curve {
  const count=512,x=new Float64Array(count+1),z=new Float64Array(count+1),theta=new Float64Array(count+1);
  const wrap=clamp(params.heelWrapLengthMm,1,width),angle=radians(clamp(params.heelWrapDeg,-135,135))*progress;
  const step=width/count;
  const turn=(u:number)=>angle*(1-smooth(u/wrap));
  for(let i=0;i<=count;i++)theta[i]=turn(i*step);
  for(let i=1;i<=count;i++){
    const mid=turn((i-.5)*step);
    x[i]=x[i-1]+Math.cos(mid)*step;z[i]=z[i-1]+Math.sin(mid)*step;
  }
  const baseline=z[count];for(let i=0;i<=count;i++)z[i]-=baseline;
  return{x,z,theta,width};
}
function curveAt(curve:Curve,u:number) {
  if(u<0){const angle=curve.theta[0];return[curve.x[0]+u*Math.cos(angle),curve.z[0]+u*Math.sin(angle),angle];}
  if(u>curve.width){const angle=curve.theta[512],d=u-curve.width;return[curve.x[512]+d*Math.cos(angle),curve.z[512]+d*Math.sin(angle),angle];}
  const f=clamp(u/curve.width)*512,i=Math.min(511,Math.floor(f)),t=f-i;
  const lerp=(a:Float64Array)=>a[i]*(1-t)+a[i+1]*t;
  return [lerp(curve.x),lerp(curve.z),lerp(curve.theta)];
}

/** A circular crease band followed by a rigid upper panel. Along each normal
 * section of a straight hinge, arc length is preserved analytically. */
function foldedPoint(point:Vec2,params:DeformationParams,progress:number):Vec3 {
  const alpha=radians(params.hingeAngleDeg),ca=Math.cos(alpha),sa=Math.sin(alpha);
  const dx=point[0]-params.hingeXmm,dy=point[1]-params.hingeYmm;
  const along=dx*ca+dy*sa,d=-dx*sa+dy*ca;
  const theta=radians(clamp(params.foldAngleDeg,-220,220))*progress;
  if(d<=0||Math.abs(theta)<1e-9)return[point[0],point[1],0];
  const width=Math.max(.5,params.bendWidthMm),radius=width/theta;
  const inBand=Math.min(d,width),angle=theta*inBand/width;
  const across=radius*Math.sin(angle)+Math.max(0,d-width)*Math.cos(theta);
  const depth=radius*(1-Math.cos(angle))+Math.max(0,d-width)*Math.sin(theta);
  return[params.hingeXmm+along*ca-across*sa,params.hingeYmm+along*sa+across*ca,depth];
}

function basePoint(point:Vec2,params:DeformationParams,progress:number,curve:Curve,mesh:PatternMesh):[number,number,number] {
  const folded=foldedPoint(point,params,progress);
  const [cx,cz,theta]=curveAt(curve,folded[0]);
  // A swept side sheet adds heel wrap, not an unrelated shoe mesh. Layer
  // offset and any optional bow can introduce measurable metric distortion.
  const bow=params.sideDepthMm*progress*Math.sin(Math.PI*clamp(point[0]/mesh.bounds.width))*Math.sin(Math.PI*clamp(point[1]/mesh.bounds.height));
  return[cx-folded[2]*Math.sin(theta),folded[1],cz+folded[2]*Math.cos(theta)+bow];
}

function solve(matrix:number[][],values:number[]) {
  const n=values.length,a=matrix.map((row,i)=>[...row,values[i]]);
  for(let c=0;c<n;c++){
    let best=c;for(let r=c+1;r<n;r++)if(Math.abs(a[r][c])>Math.abs(a[best][c]))best=r;
    if(Math.abs(a[best][c])<1e-12)return null;
    [a[c],a[best]]=[a[best],a[c]];
    const d=a[c][c];for(let k=c;k<=n;k++)a[c][k]/=d;
    for(let r=0;r<n;r++){if(r===c)continue;const f=a[r][c];for(let k=c;k<=n;k++)a[r][k]-=f*a[c][k];}
  }
  return a.map(row=>row[n]);
}

const usableConstraints=(constraints:readonly LandmarkConstraint[])=>constraints.filter(c=>c.enabled!==false&&(c.weight??1)>0&&c.flatMm.every(Number.isFinite)&&c.formedMm.every(Number.isFinite));
function kernel(a:Vec2,b:LandmarkConstraint){const r=Math.max(2,b.radiusMm);return Math.exp(-((a[0]-b.flatMm[0])**2+(a[1]-b.flatMm[1])**2)/(2*r*r));}

/** Always evaluates from the original immutable millimetre coordinates.
 * Repeated expand/fold cycles never integrate previous vertex positions. */
export function createReferenceEvaluator(mesh:PatternMesh,progress:number,params:DeformationParams,constraints:readonly LandmarkConstraint[]=[]):(point:Vec2)=>[number,number,number] {
  const p=clamp(progress);
  if(p===0)return(point:Vec2)=>[point[0],point[1],0];
  const curve=makeHeelCurve(mesh.bounds.width,params,p);
  const active=usableConstraints(constraints),strength=clamp(params.landmarkStrength)*p;
  if(!active.length||strength===0)return(point:Vec2)=>basePoint(point,params,p,curve,mesh);
  const fullCurve=p===1?curve:makeHeelCurve(mesh.bounds.width,params,1);
  const residuals=active.map(c=>{const base=basePoint(c.flatMm,params,1,fullCurve,mesh);return c.formedMm.map((v,k)=>v-base[k]);});
  const matrix=active.map((a,i)=>active.map((b,j)=>kernel(a.flatMm,b)+(i===j?.025/Math.max(.01,a.weight??1):0)));
  const weights=[0,1,2].map(k=>solve(matrix,residuals.map(r=>r[k])));
  if(weights.some(w=>w===null))return(point:Vec2)=>basePoint(point,params,p,curve,mesh);
  return(q:Vec2)=>{
    const result=basePoint(q,params,p,curve,mesh);
    for(let j=0;j<active.length;j++){
      const influence=kernel(q,active[j])*strength;
      for(let k=0;k<3;k++)result[k]+=weights[k]![j]*influence;
    }
    return result;
  };
}

export function deformMesh(mesh:PatternMesh,progress:number,params:DeformationParams,constraints:readonly LandmarkConstraint[]=[]):Float64Array {
  const n=mesh.flatMm.length/2,result=new Float64Array(n*3),evaluate=createReferenceEvaluator(mesh,progress,params,constraints);
  for(let i=0;i<n;i++)result.set(evaluate([mesh.flatMm[i*2],mesh.flatMm[i*2+1]]),i*3);
  return result;
}

/** Reference features, including a hole's empty centre, may be evaluated by
 * the continuous field. This does NOT make the centre an installable surface. */
export function getReferencePointPosition(mesh:PatternMesh,point:Vec2,progress:number,params:DeformationParams,constraints:readonly LandmarkConstraint[]=[]):[number,number,number] {
  return createReferenceEvaluator(mesh,progress,params,constraints)(point);
}

export function getConstraintResiduals(mesh:PatternMesh,positionsMm:ArrayLike<number>,constraints:readonly LandmarkConstraint[],params?:DeformationParams,progress=1) {
  const evaluate=params?createReferenceEvaluator(mesh,progress,params,constraints):null;
  return constraints.map(c=>{
    const anchor=mapFlatToSurface(mesh,positionsMm,c.flatMm);
    let predicted:readonly number[]|null=anchor?.formedMm??null;
    if(!predicted&&evaluate)predicted=evaluate(c.flatMm);
    if(!predicted){
      const hole=mesh.pattern.holes.find(h=>Math.hypot(c.flatMm[0]-h.center[0],c.flatMm[1]-h.center[1])<Math.max(.01,h.radiusMm*.15));
      const ids=hole&&mesh.holeVertexIds.find(h=>h.id===hole.id)?.indices;
      if(ids?.length){const center=[0,0,0];for(const id of ids)for(let k=0;k<3;k++)center[k]+=positionsMm[id*3+k]/ids.length;predicted=center;}
    }
    const residualMm=predicted?Math.hypot(...predicted.map((v,k)=>v-c.formedMm[k])):null;
    return{id:c.id,enabled:c.enabled!==false&&(c.weight??1)>0,confidence:c.confidence??'assumed',residualMm,mapped:anchor!==null,
      onSurface:anchor!==null,referenceOnly:anchor===null,referencePredictionMm:anchor===null?predicted:null,
      note:anchor===null?'Reference-field prediction only. A hole centre or off-pattern point is not an installable material surface.':undefined};
  });
}

/** Discrete surface metric diagnostics, NOT cloth stress or contact analysis. */
export function getMeshValidation(mesh:PatternMesh,positionsMm:ArrayLike<number>):MeshValidation {
  if(positionsMm.length!==mesh.flatMm.length/2*3)throw Error('Position buffer does not match the source vertex identities.');
  let finite=true,principalStretchMin=Infinity,principalStretchMax=0,areaRatioMin=Infinity,areaRatioMax=0,degenerateTriangles=0,projectedOrientationReversals=0;
  for(let i=0;i<positionsMm.length;i++)if(!Number.isFinite(positionsMm[i]))finite=false;
  for(let i=0;i<mesh.indices.length;i+=3){
    const ids=[mesh.indices[i],mesh.indices[i+1],mesh.indices[i+2]];
    const a=ids.map(id=>[mesh.flatMm[id*2],mesh.flatMm[id*2+1]]);
    const b=ids.map(id=>[positionsMm[id*3],positionsMm[id*3+1],positionsMm[id*3+2]]);
    const dx1=a[1][0]-a[0][0],dy1=a[1][1]-a[0][1],dx2=a[2][0]-a[0][0],dy2=a[2][1]-a[0][1],det=dx1*dy2-dx2*dy1;
    if(Math.abs(det)<1e-12){degenerateTriangles++;continue;}
    const u=b[1].map((v,k)=>v-b[0][k]),v=b[2].map((n,k)=>n-b[0][k]);
    const f0=u.map((n,k)=>(n*dy2-v[k]*dy1)/det),f1=u.map((n,k)=>(v[k]*dx1-n*dx2)/det);
    const c00=f0.reduce((s,n)=>s+n*n,0),c11=f1.reduce((s,n)=>s+n*n,0),c01=f0.reduce((s,n,k)=>s+n*f1[k],0);
    const trace=c00+c11,disc=Math.sqrt(Math.max(0,(c00-c11)**2+4*c01*c01));
    const low=Math.sqrt(Math.max(0,(trace-disc)/2)),high=Math.sqrt(Math.max(0,(trace+disc)/2));
    const area=low*high;
    principalStretchMin=Math.min(principalStretchMin,low);principalStretchMax=Math.max(principalStretchMax,high);areaRatioMin=Math.min(areaRatioMin,area);areaRatioMax=Math.max(areaRatioMax,area);
    if(area<1e-7)degenerateTriangles++;
    if((u[0]*v[1]-u[1]*v[0])*Math.sign(det)<-1e-10)projectedOrientationReversals++;
  }
  let referenceBoundaryErrorMm=0;
  const source=mesh.pattern.boundary;
  for(let i=0;i<mesh.boundaryVertexIds.length;i++){
    const id=mesh.boundaryVertexIds[i],sourcePoint=source[mesh.boundarySourceIndices[i]];referenceBoundaryErrorMm=Math.max(referenceBoundaryErrorMm,Math.hypot(mesh.flatMm[id*2]-sourcePoint[0],mesh.flatMm[id*2+1]-sourcePoint[1]));
  }
  const flat=deformMesh(mesh,0,RecommendedDeformationParams(mesh.pattern));let flatReturnErrorMm=0;
  for(let i=0;i<mesh.flatMm.length/2;i++)flatReturnErrorMm=Math.max(flatReturnErrorMm,Math.hypot(flat[i*3]-mesh.flatMm[i*2],flat[i*3+1]-mesh.flatMm[i*2+1],flat[i*3+2]));
  const maximumPrincipalStrain=Math.max(Math.abs(principalStretchMin-1),Math.abs(principalStretchMax-1));
  const warnings=[...mesh.construction.warnings,'No cloth material law, seam sewing/contact solver or triangle self-intersection test is applied.','Projected orientation reversals include the intentionally turned-down cuff; they are not proof of inverted cloth.'];
  if(maximumPrincipalStrain>.05)warnings.push('Discrete principal strain exceeds 5%; this shape must not be treated as an inextensible, production-validated paper folding.');
  if(degenerateTriangles)warnings.push(`${degenerateTriangles} deformed triangles are degenerate or nearly collapsed.`);
  return{vertices:mesh.flatMm.length/2,triangles:mesh.indices.length/3,finite,referenceBoundaryErrorMm,principalStretchMin,principalStretchMax,maximumPrincipalStrain,areaRatioMin,areaRatioMax,degenerateTriangles,projectedOrientationReversals,selfIntersectionCheck:'not-performed',flatReturnErrorMm,warnings};
}
