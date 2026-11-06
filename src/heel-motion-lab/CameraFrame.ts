import {Vector3} from 'three';

/** Shared authored frame; never taken from the live inspection camera. */
export function directorWideShot(u:number,aspect:number){
 const fit=aspect<1?Math.min(1.7,1/Math.sqrt(aspect)):1;
 return{position:new Vector3(4.9-.15*u,2.65+.12*u,8).multiplyScalar(fit),target:new Vector3(-.12,.15,-.15*u),framing:0};
}

export function directorFrame(aspect=1){
 const shot=directorWideShot(1,aspect),forward=shot.target.clone().sub(shot.position).normalize();
 const right=new Vector3().crossVectors(forward,new Vector3(0,1,0)).normalize();
 return{...shot,forward,right,up:new Vector3().crossVectors(right,forward).normalize()};
}

export function terminalShoeShift(aspect:number){
 const frame=directorFrame(aspect),portrait=Math.max(0,1-Math.min(1,aspect));
 return frame.right.multiplyScalar(1.6*Math.min(1,aspect)).addScaledVector(frame.forward,3.5+6*portrait);
}
