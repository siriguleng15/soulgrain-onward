import {Matrix4,Quaternion,Vector3} from 'three';
import type {HeelReaction} from './Reaction.ts';
export const DURATION=30;
export const INTRO_END=.10;
export const OUTBOUND_END=.82;
/** Camera introduction and the existing action use separate time domains. */
export const actionToProgress=(p:number)=>INTRO_END+(1-INTRO_END)*p;
export const actionProgress=(p:number)=>clamp((p-INTRO_END)/(1-INTRO_END));
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(x:number)=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const segment=(x:number,a:number,b:number)=>smooth((x-a)/(b-a));
export type Mode='rectangular-outline'|'solid-ribbon';
export type View='director'|'side'|'rear'|'above';
export interface Parameters {radius:number;turns:number;pitch:number;width:number;thickness:number;twist:number;direction:number;}
export const DEFAULTS:Parameters={radius:1.15,turns:2,pitch:1,width:.18,thickness:.012,twist:110,direction:0};
export function phase(p:number){if(p<INTRO_END)return'后跟特写推进';const a=actionProgress(p);return a<.11?'顺势出带':a<.35?'第一圈':a<.59?'第二圈':a<.74?'鞋头绕行':a<.785?'近镜冲刺':a<OUTBOUND_END?'带面展示':a<.99999?'连续返回':'已复位';}
/** Pure pose from a scalar: no accumulated integration, including the delayed recoil. */
export function evaluate(p:number,reaction?:HeelReaction){
 p=clamp(p);const a=actionProgress(p),outbound=a<=OUTBOUND_END?a/OUTBOUND_END:1-smooth((a-OUTBOUND_END)/(1-OUTBOUND_END));
 const release=segment(outbound,0,.18);
 const response=reaction?.at(outbound),translation=response?.position??new Vector3(),quaternion=response?.quaternion??new Quaternion(),pivot=reaction?.pivot.clone()??new Vector3();
 // T(translation) T(midpoint) R T(-midpoint): the heel is the force point,
 // never the rotation origin. Source geometry stays in its existing coordinates.
 const position=translation.clone().add(pivot).sub(pivot.clone().applyQuaternion(quaternion));
 const matrix=new Matrix4().compose(position,quaternion,new Vector3(1,1,1));
 return{p,outbound,release,position,translation,pivot,quaternion,matrix,response,phase:phase(p)};
}
