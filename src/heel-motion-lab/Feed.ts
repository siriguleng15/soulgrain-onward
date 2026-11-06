import {clamp,OUTBOUND_END} from './motion.ts';

/** C1 monotone Hermite in physical arc length. Only the two outer ends stop;
 * internal knots retain a shared positive velocity (no braking each lap). */
export function continuousFeed(u:number,distances:number[]){
 const times=[0,.11/OUTBOUND_END,.35/OUTBOUND_END,.59/OUTBOUND_END,.74/OUTBOUND_END,1];
 const h=times.slice(1).map((t,i)=>t-times[i]);
 const slopes=h.map((dt,i)=>(distances[i+1]-distances[i])/dt);
 const m=times.map((_,i)=>{
  if(i===0||i===times.length-1)return 0;
  if(slopes[i-1]*slopes[i]<=0)return 0;
  const a=2*h[i]+h[i-1],b=h[i]+2*h[i-1];
  return(a+b)/(a/slopes[i-1]+b/slopes[i]);
 });
 u=clamp(u);let i=0;while(i<times.length-2&&u>times[i+1])i++;
 const t=(u-times[i])/h[i],t2=t*t,t3=t2*t;
 return(2*t3-3*t2+1)*distances[i]+(t3-2*t2+t)*h[i]*m[i]+(-2*t3+3*t2)*distances[i+1]+(t3-t2)*h[i]*m[i+1];
}
