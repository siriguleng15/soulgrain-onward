import {CatmullRomCurve3,Matrix4,Quaternion,Vector3} from 'three';
import {clamp,growthParameter,segment} from './motion.ts';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';
export class MotionPath {
 points:Vector3[]=[];curve=new CatmullRomCurve3();offsets=new Map<number,Vector3>();
 samples:Vector3[]=[];tangents:Vector3[]=[];widths:Vector3[]=[];normals:Vector3[]=[];
 length=1;tipLength=0;frameError=0;minimumFrameDot=1;restLength=1;reversals=0;
 readonly count=600;
 update(surface:HeelSurface,params:Parameters,pose:Matrix4,u:number){
  const peel=segment(u,0,.18);
  const local:Vector3[]=[surface.lower.clone(),surface.middle.clone().add(new Vector3(.44*peel,0,.02*peel)),surface.upper.clone().add(new Vector3(.95*peel,.04*peel,.06*peel)),new Vector3(2.55,1.12,.18)];
  const coilStart=local.length,loops=32;
  for(let i=0;i<=loops;i++){const s=i/loops,angle=Math.PI*2*params.turns*s+.09*Math.sin(s*Math.PI*3),r=params.radius*(1+.13*Math.sin(s*5.5+.4)+.055*Math.sin(s*13));
   const point=new Vector3(1.83-3.55*params.pitch*s+.12*Math.sin(s*Math.PI*3),.04+r*Math.cos(angle)+.10*Math.sin(s*9),r*.88*Math.sin(angle));
   point.applyAxisAngle(new Vector3(1,0,0),params.direction*Math.PI/180);local.push(point);}
  const coilEnd=local.length-1;
  this.points=local.map((p,i)=>p.add(this.offsets.get(i)??new Vector3()).applyMatrix4(pose));
  // Fixed director-space flight target. Orbit inspection never changes the authored trajectory.
  for(const p of[new Vector3(-2.15,1.35,.4),new Vector3(-1.1,.9,2.6),new Vector3(1.2,.75,4.8),new Vector3(3.55,1.85,6.05)])this.points.push(p.add(this.offsets.get(this.points.length)??new Vector3()));
  this.curve=new CatmullRomCurve3(this.points,false,'centripetal',.5);this.curve.arcLengthDivisions=1200;this.curve.updateArcLengths();
  const lengths=this.curve.getLengths(1200),total=lengths[lengths.length-1];this.length=total;this.restLength=surface.length;
  const t=growthParameter(u,2/(this.points.length-1),coilStart/(this.points.length-1),(coilStart+loops/2)/(this.points.length-1),coilEnd/(this.points.length-1));
  const f=t*1200,i=Math.floor(f);this.tipLength=(lengths[i]??total)+((lengths[Math.min(1200,i+1)]??total)-(lengths[i]??total))*(f-i);
  this.tipLength=Math.max(surface.length,this.tipLength);
  this.samples=this.curve.getSpacedPoints(this.count);this.tangents=[];this.widths=[];this.normals=[];this.frameError=0;this.minimumFrameDot=1;this.reversals=0;
  let previousT=new Vector3(),width=new Vector3(0,0,-1).transformDirection(pose);
  for(let k=0;k<=this.count;k++){
   const tangent=this.curve.getTangentAt(k/this.count).normalize();
   if(k===0)width.addScaledVector(tangent,-width.dot(tangent)).normalize();
   else{const dot=clamp(previousT.dot(tangent),-1,1);if(dot<-.99999){this.reversals++;/* Explicit cusp policy: use the previous width as the 180-degree rotation axis. */}else width.applyQuaternion(new Quaternion().setFromUnitVectors(previousT,tangent));width.addScaledVector(tangent,-width.dot(tangent)).normalize();}
   const twist=params.twist*Math.PI/180*Math.sin(k/this.count*Math.PI*1.45)*(k/this.count);
   const b=width.clone().applyAxisAngle(tangent,twist),n=new Vector3().crossVectors(tangent,b).normalize();
   if(k)this.minimumFrameDot=Math.min(this.minimumFrameDot,b.dot(this.widths[k-1]));
   this.frameError=Math.max(this.frameError,Math.abs(tangent.dot(b)),Math.abs(b.length()-1),Math.abs(n.length()-1));
   this.tangents.push(tangent);this.widths.push(b);this.normals.push(n);previousT=tangent;
  }
 }
 at(distance:number){const f=clamp(distance/this.length)*this.count,i=Math.min(this.count-1,Math.floor(f)),w=f-i;
  return{point:this.samples[i].clone().lerp(this.samples[i+1],w),b:this.widths[i].clone().lerp(this.widths[i+1],w).normalize(),n:this.normals[i].clone().lerp(this.normals[i+1],w).normalize()};
 }
 setOffset(index:number,axis:'x'|'y'|'z',value:number){if(index<3||index>=this.points.length-2)return;const offset=this.offsets.get(index)?.clone()??new Vector3();offset[axis]=clamp(value,-1.5,1.5);this.offsets.set(index,offset);}
}
