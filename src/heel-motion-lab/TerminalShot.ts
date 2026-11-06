import {CubicBezierCurve3,Vector3} from 'three';
import {directorFrame} from './CameraFrame.ts';

/** Only the terminal flight changes. The approved local coil stays untouched. */
export function terminalFlightControls(points:Vector3[],aspect=1){
 const start=points.at(-1)!,tangent=start.clone().sub(points.at(-2)!).normalize();
 const frame=directorFrame(aspect),depth=.9/Math.min(1,aspect),tan=Math.tan(17*Math.PI/180);
 const point=(x:number,y:number,d:number)=>frame.position.clone().addScaledVector(frame.forward,d).addScaledVector(frame.right,x*d*tan*aspect).addScaledVector(frame.up,y*d*tan);
 // Sweep under the foreground, then lift the leading edge UP and slightly
 // toward the lens. The same physical-width strip presents its broad face.
 const lower=point(-.64,-.62,depth),upper=point(-.60,.60,depth-.025);
 const corner=point(-.45,.72,4.5);
 // First clear the shoe above its silhouette, then descend through a left
 // corridor. Every close-flight control stays left of the product.
 const departure=new CubicBezierCurve3(start,start.clone().addScaledVector(tangent,.35).addScaledVector(frame.up,1.3),corner.clone().addScaledVector(frame.up,.1).addScaledVector(frame.forward,.7),corner);
 const approach=new CubicBezierCurve3(corner,corner.clone().addScaledVector(frame.up,-.1).addScaledVector(frame.forward,-.7),lower.clone().addScaledVector(frame.up,-.15),lower);
 const presentation=new CubicBezierCurve3(lower,lower.clone().addScaledVector(frame.up,.11).addScaledVector(frame.right,.02),upper.clone().addScaledVector(frame.up,-.11).addScaledVector(frame.forward,.02),upper);
 return{points:[...Array.from({length:4},(_,i)=>departure.getPoint((i+1)/4)),...Array.from({length:4},(_,i)=>approach.getPoint((i+1)/4)),...Array.from({length:6},(_,i)=>presentation.getPoint((i+1)/6))],presentationStart:points.length+7,towardViewer:frame.forward.negate()};
}
