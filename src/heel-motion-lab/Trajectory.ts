import {Vector3} from 'three';
import type {Parameters} from './motion.ts';
import type {HeelSurface} from './Surface.ts';

/** Shoe-local authored motion: X points toward the heel, Y upward. */
export function localTrajectory(surface:HeelSurface,params:Parameters,_u:number,offsets:Map<number,Vector3>){
 // Traverse the real strip FROM ITS TOP TO ITS BOTTOM. Only the bottom feeds
 // the extension. No control point of the red lead is above the bottom edge.
 const points=[
  surface.upper.clone(),
  surface.middle.clone(),
  surface.lower.clone(),
  // Fixed tangent lead-in: the ribbon feeds down, without a preliminary hinge.
  surface.lower.clone().addScaledVector(surface.exitTangent,.25).add(new Vector3(.012,0,0)),
  surface.lower.clone().add(new Vector3(.35,-(.30+.28*params.radius),-.12))
 ];
 const coilStart=points.length,loops=32;
 for(let i=0;i<=loops;i++){
  const s=i/loops,angle=Math.PI+.17+Math.PI*2*params.turns*s+.09*Math.sin(s*Math.PI*3);
  const r=params.radius*(1+.13*Math.sin(s*5.5+.4)+.055*Math.sin(s*13));
  const point=new Vector3(2.02-3.55*params.pitch*s+.12*Math.sin(s*Math.PI*3),-.08+r*Math.cos(angle)+.10*Math.sin(s*9),r*.88*Math.sin(angle));
  point.applyAxisAngle(new Vector3(1,0,0),params.direction*Math.PI/180);points.push(point);
 }
 return{points:points.map((p,i)=>p.add(offsets.get(i)??new Vector3())),coilStart,loops,coilEnd:points.length-1};
}

/** Locked lens-space endpoint, independent of the debug camera. */
export function flightControls(){return[new Vector3(-2.15,1.35,.4),new Vector3(-1.1,.9,2.6),new Vector3(1.2,.75,4.8),new Vector3(3.55,1.85,6.05)];}

/** Round the departing tangent toward the lens instead of reversing it at
 * the coil/world-space junction when the shoe turns in its side plane. */
export function departureTurn(points:Vector3[]){
 const end=points.at(-1)!,tangent=end.clone().sub(points.at(-2)!).normalize();
 const up=new Vector3(0,1,0).addScaledVector(tangent,-tangent.y).normalize(),radius=.7;
 return Array.from({length:8},(_,i)=>{const angle=Math.PI*(i+1)/8;return end.clone().addScaledVector(tangent,radius*Math.sin(angle)).addScaledVector(up,radius*(1-Math.cos(angle)));});
}
