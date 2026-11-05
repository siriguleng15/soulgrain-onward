import {Euler,Matrix4,Quaternion,Vector3} from 'three';
export const DURATION=26;
export const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(x:number)=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const segment=(x:number,a:number,b:number)=>smooth((x-a)/(b-a));
export type Mode='rectangular-outline'|'solid-ribbon';
export type View='director'|'side'|'rear'|'above';
export interface Parameters {radius:number;turns:number;pitch:number;width:number;thickness:number;twist:number;direction:number;}
export const DEFAULTS:Parameters={radius:1.15,turns:2,pitch:1,width:.18,thickness:.012,twist:110,direction:0};
export function phase(p:number){return p<.11?'抽离':p<.35?'第一圈':p<.59?'第二圈':p<.74?'近镜冲刺':p<.80?'终态停留':p<.99999?'连续返回':'已复位';}
/** Pure pose from a scalar: no accumulated integration, including the delayed recoil. */
export function evaluate(p:number){
 p=clamp(p);const outbound=p<=.74?p/.74:p<=.8?1:1-smooth((p-.8)/.2);
 const release=segment(outbound,0,.18),pull=clamp((outbound-.14)/.78);
 // Delayed, gently overshooting step response; explicit time makes seek reversible.
 const recoil=1-Math.exp(-5*pull)*(Math.cos(3.8*pull)+.32*Math.sin(3.8*pull));
 const position=new Vector3(-.4*recoil,.25*recoil,-2.4*recoil);
 const rotation=new Euler(.26*recoil,-.65*recoil,-.62*recoil+.12*Math.sin(pull*Math.PI*2)*Math.exp(-3*pull));
 const quaternion=new Quaternion().setFromEuler(rotation),matrix=new Matrix4().compose(position,quaternion,new Vector3(1,1,1));
 return{p,outbound,release,recoil,position,quaternion,matrix,phase:phase(p)};
}
export function growthParameter(u:number,restEnd:number,coilStart:number,coilHalf:number,coilEnd:number){
 const keys=[[0,restEnd],[.11/.74,coilStart],[.35/.74,coilHalf],[.59/.74,coilEnd],[1,1]];
 for(let i=1;i<keys.length;i++)if(u<=keys[i][0]){const [a,v]=keys[i-1],[b,w]=keys[i];return v+(w-v)*smooth((u-a)/(b-a));}
 return 1;
}
