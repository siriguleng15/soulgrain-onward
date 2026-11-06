import {CatmullRomCurve3,Quaternion,Vector3} from 'three';
import {clamp,DURATION,INTRO_END,feedEase,growthParameter,segment} from './motion.ts';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';
import {flightControls,localTrajectory} from './Trajectory.ts';

interface Sample{position:Vector3;quaternion:Quaternion;force:Vector3;torque:Vector3;angularVelocity:Vector3;angle:number;}
/**
 * Deterministic advertising inertia, NOT a leather/rigid-body simulation.
 * A fixed-step table is rebuilt only when the authored geometry changes.
 * Scrubbing and return sample the same table, never integrate frame deltas.
 */
export class HeelReaction {
 private samples:Sample[]=[];private signature='';readonly steps=480;
 readonly pivot=new Vector3();readonly axis=new Vector3(0,0,1);
 rebuild(surface:HeelSurface,params:Parameters,offsets:Map<number,Vector3>,pivot=new Vector3()){
  const key=JSON.stringify([params,pivot.toArray(),[...offsets].map(([i,p])=>[i,...p.toArray()])]);
  if(key===this.signature)return;this.signature=key;this.samples=[];
  this.pivot.copy(pivot);
  const position=new Vector3(),velocity=new Vector3(),quaternion=new Quaternion(),omega=new Vector3();
  const dt=DURATION*(1-INTRO_END)*.74/this.steps;
  const shape=localTrajectory(surface,params,0,offsets),points=[...shape.points];
  for(const point of flightControls())points.push(point.add(offsets.get(points.length)??new Vector3()));
  const curve=new CatmullRomCurve3(points,false,'centripetal',.5),end=points.length-1;
  curve.arcLengthDivisions=1200;const lengths=curve.getLengths(),total=lengths[lengths.length-1];
  const arcAt=(t:number)=>{const f=t*1200,k=Math.floor(f);return(lengths[k]??total)+((lengths[Math.min(1200,k+1)]??total)-(lengths[k]??total))*(f-k);};
  const restLength=arcAt(2/end),feedEnd=arcAt(shape.coilStart/end);
  // The lower attachment pulls along the departing ribbon. As requested,
  // consider only its horizontal component in the initial shoe side frame.
  // A rightward pull below the midpoint gives r × F with positive Z (CCW).
  const tangent=curve.getTangent(2/end).normalize(),horizontal=new Vector3(tangent.x,0,0);
  const lever=surface.lower.clone().sub(pivot);
  let previousLength=restLength,angle=0;
  for(let i=0;i<=this.steps;i++){
   const u=i/this.steps;
   const t=growthParameter(u,2/end,shape.coilStart/end,(shape.coilStart+shape.loops/2)/end,shape.coilEnd/end);
   const length=u<=.11/.74?restLength+(feedEnd-restLength)*feedEase(u/(.11/.74)):arcAt(t);
   const feedSpeed=i?Math.max(0,(length-previousLength)/dt):0;previousLength=length;
   const force=horizontal.clone().multiplyScalar(feedSpeed),torque=new Vector3().crossVectors(lever,force);
   torque.x=torque.y=0;
   if(i){
    // The sign comes from the attachment's moment, not an opposing-winding
    // convention. Gain and damping are advertising timing parameters, not SI physics.
    const drive=this.axis.clone().multiplyScalar(1.8*torque.z);
    omega.addScaledVector(drive.clone().sub(omega),dt/ .62);
    angle+=omega.z*dt;quaternion.setFromAxisAngle(this.axis,angle);
    const retreat=segment(u,.10,.85),target=new Vector3(-.45*retreat,-.10*retreat,-1.95*retreat);
    velocity.addScaledVector(target.sub(position).multiplyScalar(9).addScaledVector(velocity,-5),dt);position.addScaledVector(velocity,dt);
   }
   this.samples.push({position:position.clone(),quaternion:quaternion.clone(),force,torque,angularVelocity:omega.clone(),angle});
  }
 }
 at(u:number){
  if(!this.samples.length)return{position:new Vector3(),quaternion:new Quaternion(),force:new Vector3(),torque:new Vector3(),angularVelocity:new Vector3(),angle:0};
  const f=clamp(u)*this.steps,i=Math.min(this.steps-1,Math.floor(f)),w=f-i,a=this.samples[i],b=this.samples[i+1];
  return{position:a.position.clone().lerp(b.position,w),quaternion:a.quaternion.clone().slerp(b.quaternion,w),force:a.force.clone().lerp(b.force,w),torque:a.torque.clone().lerp(b.torque,w),angularVelocity:a.angularVelocity.clone().lerp(b.angularVelocity,w),angle:a.angle+(b.angle-a.angle)*w};
 }
}
