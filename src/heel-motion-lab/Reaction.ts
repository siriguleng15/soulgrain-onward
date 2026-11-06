import {CatmullRomCurve3,Quaternion,Vector3} from 'three';
import {clamp,DURATION,INTRO_END,growthParameter,segment} from './motion.ts';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';
import {flightControls,localTrajectory} from './Trajectory.ts';

interface Sample{position:Vector3;quaternion:Quaternion;force:Vector3;torque:Vector3;angularVelocity:Vector3;}
/**
 * Deterministic advertising inertia, NOT a leather/rigid-body simulation.
 * A fixed-step table is rebuilt only when the authored geometry changes.
 * Scrubbing and return sample the same table, never integrate frame deltas.
 */
export class HeelReaction {
 private samples:Sample[]=[];private signature='';readonly steps=480;
 rebuild(surface:HeelSurface,params:Parameters,offsets:Map<number,Vector3>){
  const key=JSON.stringify([params,[...offsets].map(([i,p])=>[i,...p.toArray()])]);
  if(key===this.signature)return;this.signature=key;this.samples=[];
  const position=new Vector3(),velocity=new Vector3(),quaternion=new Quaternion(),omega=new Vector3();
  const dt=DURATION*(1-INTRO_END)*.74/this.steps,axis=new Vector3(),delta=new Quaternion();
  let previousWinding=0;
  for(let i=0;i<=this.steps;i++){
   const u=i/this.steps,shape=localTrajectory(surface,params,u,offsets),points=[...shape.points];
   for(const point of flightControls())points.push(point.add(offsets.get(points.length)??new Vector3()));
   const curve=new CatmullRomCurve3(points,false,'centripetal',.5),end=points.length-1;
   const t=growthParameter(u,2/end,shape.coilStart/end,(shape.coilStart+shape.loops/2)/end,shape.coilEnd/end);
   // Keep the path force available for inspection. Art direction now locks
   // the shoe to its heel-to-toe X axis; transverse torque is not applied.
   const tip=curve.getPoint(t),tangent=curve.getTangent(t).normalize();
   const force=tip.sub(shape.points[2]).normalize().multiplyScalar(.72).addScaledVector(tangent,.28).normalize();
   const torque=new Vector3();
   const winding=clamp((t*end-shape.coilStart)/shape.loops);
   const rollRate=i?(winding-previousWinding)*Math.PI*2*params.turns/dt:0;previousWinding=winding;
   if(i){
    // Longitudinal roll only, retaining the damped delay and reversible table.
    const drive=new Vector3(-.36*rollRate,0,0);
    omega.addScaledVector(drive.clone().sub(omega),dt/ .62);
    const angle=omega.length()*dt;if(angle>1e-12){axis.copy(omega).normalize();delta.setFromAxisAngle(axis,angle);quaternion.multiply(delta).normalize();}
    const retreat=segment(u,.10,.85),target=new Vector3(-.45*retreat,-.10*retreat,-1.95*retreat);
    velocity.addScaledVector(target.sub(position).multiplyScalar(9).addScaledVector(velocity,-5),dt);position.addScaledVector(velocity,dt);
   }
   this.samples.push({position:position.clone(),quaternion:quaternion.clone(),force,torque,angularVelocity:omega.clone()});
  }
 }
 at(u:number){
  if(!this.samples.length)return{position:new Vector3(),quaternion:new Quaternion(),force:new Vector3(),torque:new Vector3(),angularVelocity:new Vector3()};
  const f=clamp(u)*this.steps,i=Math.min(this.steps-1,Math.floor(f)),w=f-i,a=this.samples[i],b=this.samples[i+1];
  return{position:a.position.clone().lerp(b.position,w),quaternion:a.quaternion.clone().slerp(b.quaternion,w),force:a.force.clone().lerp(b.force,w),torque:a.torque.clone().lerp(b.torque,w),angularVelocity:a.angularVelocity.clone().lerp(b.angularVelocity,w)};
 }
}
