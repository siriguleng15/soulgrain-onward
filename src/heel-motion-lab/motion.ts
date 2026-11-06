import {Matrix4,Quaternion,Vector3} from 'three';
import type {HeelReaction} from './Reaction.ts';
import {terminalShoeShift} from './CameraFrame.ts';
export const OUTBOUND_END=.82;
export const LEGACY_DURATION=30;
export const DURATION=LEGACY_DURATION*(.10+.90*OUTBOUND_END);
export const INTRO_END=3/DURATION;
/** Camera introduction and the existing action use separate time domains. */
export const actionToProgress=(p:number)=>INTRO_END+(1-INTRO_END)*p/OUTBOUND_END;
export const actionProgress=(p:number)=>clamp((p-INTRO_END)/(1-INTRO_END))*OUTBOUND_END;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(x:number)=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const segment=(x:number,a:number,b:number)=>smooth((x-a)/(b-a));
export type Mode='rectangular-outline'|'solid-ribbon';
export type View='director'|'side'|'rear'|'above';
export interface Parameters {radius:number;turns:number;pitch:number;width:number;thickness:number;twist:number;direction:number;}
export const DEFAULTS:Parameters={radius:1.15,turns:2,pitch:1,width:.18,thickness:.012,twist:110,direction:0};
export function phase(p:number){if(p>=1)return'终态定格';if(p<INTRO_END)return'后跟特写推进';const a=actionProgress(p);return a<.11?'顺势出带':a<.35?'第一圈':a<.59?'第二圈':a<.74?'鞋头绕行':a<.785?'近镜冲刺':'上翘展面';}
/** Pure pose from a scalar: no accumulated integration, including the delayed recoil. */
export function evaluate(p:number,reaction?:HeelReaction,aspect=1){
 p=clamp(p);const outbound=actionProgress(p)/OUTBOUND_END;
 const release=segment(outbound,0,.18);
 const response=reaction?.at(outbound),translation=response?.position??new Vector3(),quaternion=response?.quaternion??new Quaternion(),pivot=reaction?.pivot.clone()??new Vector3();
 const layoutShift=terminalShoeShift(aspect).multiplyScalar(segment(outbound,.74/OUTBOUND_END,.785/OUTBOUND_END));
 translation.add(layoutShift);
 // T(translation) T(midpoint) R T(-midpoint): the heel is the force point,
 // never the rotation origin. Source geometry stays in its existing coordinates.
 const position=translation.clone().add(pivot).sub(pivot.clone().applyQuaternion(quaternion));
 const matrix=new Matrix4().compose(position,quaternion,new Vector3(1,1,1));
 return{p,outbound,release,position,translation,layoutShift,pivot,quaternion,matrix,response,phase:phase(p)};
}
