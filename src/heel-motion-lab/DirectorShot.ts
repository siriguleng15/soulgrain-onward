import {Vector3} from 'three';
import {INTRO_END,segment,smooth} from './motion.ts';
import type {Pose} from './Surface.ts';

/** Authored camera frame, also used by the real 3D ribbon presentation.
 * Independent of OrbitControls: inspecting the scene never billboards the strip. */
export function directorWideShot(u:number,aspect:number){
 const fit=aspect<1?Math.min(1.7,1/Math.sqrt(aspect)):1;
 return{position:new Vector3(4.9-.15*u,2.65+.12*u,8).multiplyScalar(fit),target:new Vector3(-.12,.15,-.15*u),framing:0};
}

/** One deterministic camera track: whole shoe → heel → slow pullback. */
export function heelDirectorShot(pose:Pose,heel:Vector3|undefined,aspect:number){
 const u=pose.outbound,p=pose.p,fit=aspect<1?Math.min(1.7,1/Math.sqrt(aspect)):1;
 const wide=directorWideShot(u,aspect),widePosition=wide.position,wideTarget=wide.target;
 if(!heel)return{position:widePosition,target:wideTarget,framing:0};
 const macroTarget=heel.clone().applyMatrix4(pose.matrix).add(new Vector3(0,-.16,0));
 const macroOffset=new Vector3(2.65,.35,1.15).multiplyScalar(fit);
 if(p<INTRO_END){const zoom=smooth(p/.09);return{position:widePosition.clone().lerp(macroTarget.clone().add(macroOffset),zoom),target:wideTarget.clone().lerp(macroTarget,zoom),framing:0};}
 // Let the first strip appear in close-up before opening the composition.
 const back=segment(p,.12,.43),target=macroTarget.lerp(wideTarget,back);
 const offset=macroOffset.lerp(widePosition.clone().sub(wideTarget),back);
 return{position:target.clone().add(offset),target,framing:0};
}
