import {Matrix4,Quaternion,Vector3} from 'three';
import type {HeelReaction} from './Reaction.ts';
export const DURATION=30;
export const INTRO_END=.10;
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
export function phase(p:number){if(p<INTRO_END)return'后跟特写推进';const a=actionProgress(p);return a<.11?'顺势出带':a<.35?'第一圈':a<.59?'第二圈':a<.74?'近镜冲刺':a<.80?'终态停留':a<.99999?'连续返回':'已复位';}
/** Pure pose from a scalar: no accumulated integration, including the delayed recoil. */
export function evaluate(p:number,reaction?:HeelReaction){
 p=clamp(p);const a=actionProgress(p),outbound=a<=.74?a/.74:a<=.8?1:1-smooth((a-.8)/.2);
 const release=segment(outbound,0,.18);
 const response=reaction?.at(outbound),position=response?.position??new Vector3(),quaternion=response?.quaternion??new Quaternion();
 const matrix=new Matrix4().compose(position,quaternion,new Vector3(1,1,1));
 return{p,outbound,release,position,quaternion,matrix,response,phase:phase(p)};
}
/** Short smooth acceleration, steady feed, and a soft stop. */
export function feedEase(t:number):number{
 t=clamp(t);const ramp=.16;
 if(t<ramp)return(t/2-ramp/(2*Math.PI)*Math.sin(Math.PI*t/ramp))/(1-ramp);
 if(t>1-ramp)return 1-feedEase(1-t);
 return(t-ramp/2)/(1-ramp);
}
export function growthParameter(u:number,restEnd:number,coilStart:number,coilHalf:number,coilEnd:number){
 const keys=[[0,restEnd],[.11/.74,coilStart],[.35/.74,coilHalf],[.59/.74,coilEnd],[1,1]];
 for(let i=1;i<keys.length;i++)if(u<=keys[i][0]){const [a,v]=keys[i-1],[b,w]=keys[i];return v+(w-v)*smooth((u-a)/(b-a));}
 return 1;
}
