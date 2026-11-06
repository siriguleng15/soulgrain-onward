import {CatmullRomCurve3,Matrix4,Quaternion,Vector3} from 'three';
import {clamp,smooth} from './motion.ts';
import {continuousFeed} from './Feed.ts';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';
import {localTrajectory} from './Trajectory.ts';
import {terminalFlightControls} from './TerminalShot.ts';
export class MotionPath {
 points:Vector3[]=[];curve=new CatmullRomCurve3();offsets=new Map<number,Vector3>();
 samples:Vector3[]=[];tangents:Vector3[]=[];widths:Vector3[]=[];normals:Vector3[]=[];
 length=1;tipLength=0;frameError=0;minimumFrameDot=1;restLength=1;reversals=0;presentationLength=0;
 routeIndices={coilStart:0,coilHalf:0,coilEnd:0,toeEnd:0,presentationStart:0};
 readonly count=600;
 update(surface:HeelSurface,params:Parameters,pose:Matrix4,u:number,aspect=1){
  const{points:local,coilStart,loops,coilEnd,toeEnd}=localTrajectory(surface,params,u,this.offsets);
  this.points=local.map(p=>p.applyMatrix4(pose));
  const flight=terminalFlightControls(this.points,aspect),presentationStart=flight.presentationStart;
  this.routeIndices={coilStart,coilHalf:coilStart+loops/2,coilEnd,toeEnd,presentationStart};
  // Fixed director-space flight target. Orbit inspection never changes the authored trajectory.
  for(const p of flight.points)this.points.push(p.add(this.offsets.get(this.points.length)??new Vector3()));
  this.curve=new CatmullRomCurve3(this.points,false,'centripetal',.5);this.curve.arcLengthDivisions=1200;this.curve.updateArcLengths();
  const lengths=this.curve.getLengths(1200),total=lengths[lengths.length-1];this.length=total;
  const arcAt=(t:number)=>{const f=t*1200,i=Math.floor(f);return(lengths[i]??total)+((lengths[Math.min(1200,i+1)]??total)-(lengths[i]??total))*(f-i);};
  // Exact control-point boundary of the lower end, not an assumed old rest length.
  this.restLength=arcAt(2/(this.points.length-1));
  const end=this.points.length-1;
  this.presentationLength=arcAt(presentationStart/end);
  const toeS=arcAt(toeEnd/end)/total,heroS=this.presentationLength/total;
  this.tipLength=continuousFeed(u,[this.restLength,arcAt(coilStart/end),arcAt((coilStart+loops/2)/end),arcAt(coilEnd/end),arcAt(toeEnd/end),arcAt(presentationStart/end),total]);
  this.tipLength=Math.max(this.restLength,this.tipLength);
  this.samples=this.curve.getSpacedPoints(this.count);this.tangents=[];this.widths=[];this.normals=[];this.frameError=0;this.minimumFrameDot=1;this.reversals=0;
  let previousT=new Vector3(),width=new Vector3(0,0,-1).transformDirection(pose);
  for(let k=0;k<=this.count;k++){
   const tangent=this.curve.getTangentAt(k/this.count).normalize();
   if(k===0)width.addScaledVector(tangent,-width.dot(tangent)).normalize();
   else{const dot=clamp(previousT.dot(tangent),-1,1);if(dot<-.99999){this.reversals++;/* Explicit cusp policy: use the previous width as the 180-degree rotation axis. */}else width.applyQuaternion(new Quaternion().setFromUnitVectors(previousT,tangent));width.addScaledVector(tangent,-width.dot(tangent)).normalize();}
   const rollS=Math.min(k/this.count,heroS),twist=params.twist*Math.PI/180*Math.sin(rollS*Math.PI*1.45)*rollS;
   const b=width.clone().applyAxisAngle(tangent,twist),n=new Vector3().crossVectors(tangent,b).normalize();
   if(k)this.minimumFrameDot=Math.min(this.minimumFrameDot,b.dot(this.widths[k-1]));
   this.frameError=Math.max(this.frameError,Math.abs(tangent.dot(b)),Math.abs(b.length()-1),Math.abs(n.length()-1));
   this.tangents.push(tangent);this.widths.push(b);this.normals.push(n);previousT=tangent;
  }
  // Transport the presentation frame BACK from its authored endpoint.
  // Projecting the camera normal independently at every point flips by PI
  // where the approach tangent crosses the view ray. Backward transport has
  // no such singularity, and preserves the planar face at the lens.
  const desiredWidths:Vector3[]=[],startFrame=Math.floor(toeS*this.count);
  let back=new Vector3().crossVectors(flight.towardViewer,this.tangents[this.count]).normalize();
  for(let k=this.count;k>=startFrame;k--){
   const t=this.tangents[k];if(k<this.count)back.applyQuaternion(new Quaternion().setFromUnitVectors(this.tangents[k+1],t));
   back.addScaledVector(t,-back.dot(t)).normalize();desiredWidths[k]=back.clone();
  }
  // Blend forward surface frames with backward presentation frames using an
  // explicitly unwrapped roll. Orbit inspection never changes either frame.
  let previousAngle:number|undefined;
  for(let k=0;k<=this.count;k++){
   const s=k/this.count;if(s<toeS)continue;
   const t=this.tangents[k],b=this.widths[k],desired=desiredWidths[k];
   let angle=Math.atan2(t.dot(new Vector3().crossVectors(b,desired)),b.dot(desired));
   if(previousAngle!==undefined)angle+=Math.round((previousAngle-angle)/(2*Math.PI))*2*Math.PI;
   previousAngle=angle;
   b.applyAxisAngle(t,angle*smooth((s-toeS)/(heroS-toeS)));this.normals[k].crossVectors(t,b).normalize();
  }
  this.minimumFrameDot=1;
  for(let k=0;k<=this.count;k++){
   if(k)this.minimumFrameDot=Math.min(this.minimumFrameDot,this.widths[k].dot(this.widths[k-1]));
   this.frameError=Math.max(this.frameError,Math.abs(this.tangents[k].dot(this.widths[k])),Math.abs(this.widths[k].length()-1),Math.abs(this.normals[k].length()-1));
  }
 }
 at(distance:number){const f=clamp(distance/this.length)*this.count,i=Math.min(this.count-1,Math.floor(f)),w=f-i;
  // Evaluate the spline itself, not its coarse debug polyline. Linear point
  // interpolation produced visible little hinges under the new macro camera.
  const s=clamp(distance/this.length),tangent=this.curve.getTangentAt(s).normalize(),b=this.widths[i].clone().lerp(this.widths[i+1],w);
  b.addScaledVector(tangent,-b.dot(tangent)).normalize();
  return{point:this.curve.getPointAt(s),b,n:new Vector3().crossVectors(tangent,b).normalize()};
 }
 setOffset(index:number,axis:'x'|'y'|'z',value:number){if(index<3||index>=this.points.length-2)return;const offset=this.offsets.get(index)?.clone()??new Vector3();offset[axis]=clamp(value,-1.5,1.5);this.offsets.set(index,offset);}
}
