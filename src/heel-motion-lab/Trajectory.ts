import {CubicBezierCurve3,Vector3} from 'three';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';
import {smooth} from './motion.ts';
import {directorWideShot} from './DirectorShot.ts';

/** Shoe-local route. X points to the heel; -X is the toe. */
export function localTrajectory(surface:HeelSurface,params:Parameters,_u:number,offsets:Map<number,Vector3>){
 const xAxis=new Vector3(1,0,0),tilt=params.direction*Math.PI/180,startAngle=Math.PI+.17;
 const coil=(s:number)=>{
  const angle=startAngle+Math.PI*2*params.turns*s+.09*Math.sin(s*Math.PI*3);
  const r=params.radius*(.84+.16*smooth(s/.20))*(1+.13*Math.sin(s*5.5+.4)+.055*Math.sin(s*13));
  // Immediately travel toward -X (the toe); never grow a rearward hook.
  // Preserve the approved angle, positive Y/Z winding, and default toe end.
  const startX=surface.lower.x-.16,span=startX+1.53;
  return new Vector3(startX-span*params.pitch*(2.3*s/(1+1.3*s))+.04*Math.sin(s*Math.PI*3),-.08+r*Math.cos(angle)+.10*Math.sin(s*9),r*.88*Math.sin(angle)).applyAxisAngle(xAxis,tilt);
 };
 const points=[surface.upper.clone(),surface.middle.clone(),surface.lower.clone()];
 // Keep the approved positive Y/Z winding; only the lead bows inward.
 // Both ends match their actual surface/coil tangent.
 // The old pair of tightly spaced controls reversed the vertical direction.
 const a=coil(0),tangent=coil(.0001).sub(a).normalize();
 const lead=new CubicBezierCurve3(surface.lower.clone(),surface.lower.clone().addScaledVector(surface.exitTangent,.15),a.clone().addScaledVector(tangent,-.16),a);
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
export function flightControls(points:Vector3[],aspect=1){
 const start=points.at(-1)!,tangent=start.clone().sub(points.at(-2)!).normalize();
 const shot=directorWideShot(1,aspect),forward=shot.target.clone().sub(shot.position).normalize();
 const right=new Vector3().crossVectors(forward,new Vector3(0,1,0)).normalize(),up=new Vector3().crossVectors(right,forward).normalize();
 // Perspective does the enlargement. The physical strip width stays unchanged.
 // Last section lies in a real plane 0.80u in front of the authored camera.
 const point=(x:number,y:number)=>shot.position.clone().addScaledVector(forward,.80/Math.min(1,aspect)).addScaledVector(right,x).addScaledVector(up,y);
 const upper=point(-.05,.14),end=point(-.10,-.20);
 const approach=new CubicBezierCurve3(start,start.clone().addScaledVector(tangent,1.5),upper.clone().addScaledVector(up,.08),upper);
 const presentation=new CubicBezierCurve3(upper,upper.clone().addScaledVector(up,-.11).addScaledVector(right,-.02),end.clone().addScaledVector(up,.11).addScaledVector(right,.01),end);
 return{points:[...Array.from({length:8},(_,i)=>approach.getPoint((i+1)/8)),...Array.from({length:6},(_,i)=>presentation.getPoint((i+1)/6))],presentationStart:points.length+7,towardViewer:forward.negate()};
}
