import {CubicBezierCurve3,Vector3} from 'three';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';

/** Shoe-local route. X points to the heel; -X is the toe. */
export function localTrajectory(surface:HeelSurface,params:Parameters,_u:number,offsets:Map<number,Vector3>){
 const xAxis=new Vector3(1,0,0),tilt=params.direction*Math.PI/180,startAngle=Math.PI+.17;
 const coil=(s:number)=>{
  const angle=startAngle+Math.PI*2*params.turns*s+.09*Math.sin(s*Math.PI*3);
  const r=params.radius*(1+.13*Math.sin(s*5.5+.4)+.055*Math.sin(s*13));
  return new Vector3(2.02-3.55*params.pitch*s+.12*Math.sin(s*Math.PI*3),-.08+r*Math.cos(angle)+.10*Math.sin(s*9),r*.88*Math.sin(angle)).applyAxisAngle(xAxis,tilt);
 };
 const points=[surface.upper.clone(),surface.middle.clone(),surface.lower.clone()];
 // Keep the approved positive Y/Z winding; only the lead bows inward.
 // Both ends match their actual surface/coil tangent.
 // The old pair of tightly spaced controls reversed the vertical direction.
 const a=coil(0),tangent=coil(.0001).sub(a).normalize();
 const lead=new CubicBezierCurve3(surface.lower.clone(),surface.lower.clone().addScaledVector(surface.exitTangent,.45),a.clone().addScaledVector(tangent,-.55),a);
 for(let i=1;i<6;i++)points.push(lead.getPoint(i/6));
 const coilStart=points.length,loops=32;
 for(let i=0;i<=loops;i++)points.push(coil(i/loops));
 const coilEnd=points.length-1,endAngle=startAngle+Math.PI*2*params.turns;
 // Continue around the FOREFOOT until the tip is above the toe. This is still
 // in shoe coordinates, so it follows the approved shoe pose, not world-up.
 const topAngle=(Math.floor(endAngle/(Math.PI*2))+1)*Math.PI*2;
 const tail=points.at(-1)!.clone().applyAxisAngle(xAxis,-tilt),r0=Math.hypot(tail.y+.08,tail.z/.88);
 for(let i=1;i<=8;i++){
  const s=i/8,angle=endAngle+(topAngle-endAngle)*s,r=r0+(.85*params.radius/1.15-r0)*s;
  points.push(new Vector3(tail.x+(-1.42-tail.x)*s,-.08+r*Math.cos(angle),r*.88*Math.sin(angle)).applyAxisAngle(xAxis,tilt));
 }
 const toeEnd=points.length-1;
 return{points:points.map((p,i)=>p.add(offsets.get(i)??new Vector3())),coilStart,loops,coilEnd,toeEnd};
}

/** C1 departure from above the toe into a lens-space sprint. Debug orbit
 * never steers this authored endpoint. No extra outward world-space loop. */
export function flightControls(points:Vector3[]){
 const start=points.at(-1)!,tangent=start.clone().sub(points.at(-2)!).normalize();
 const end=new Vector3(3.55,1.85,6.05);
 const flight=new CubicBezierCurve3(start,start.clone().addScaledVector(tangent,1.8),end.clone().sub(new Vector3(.9,.5,1.2)),end);
 return Array.from({length:8},(_,i)=>flight.getPoint((i+1)/8));
}
