import { PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { Construction, phase, smooth, pathSample, spiralProgress } from './construction.ts';

export interface Pose {position:Vector3;target:Vector3;up:Vector3;quaternion:Quaternion;scale:number}
const Y=new Vector3(0,1,0),Z=new Vector3(0,0,1);
export class CameraDirector {
 private dummy=new PerspectiveCamera();
 constructor(readonly construction:Construction){}
 pose(target:Vector3,distance:number,up=Y,direction=Z):Pose{
  const position=target.clone().addScaledVector(direction,distance);
  this.dummy.position.copy(position);this.dummy.up.copy(up);this.dummy.lookAt(target);
  return{position,target:target.clone(),up:up.clone(),quaternion:this.dummy.quaternion.clone(),scale:distance};
 }
 mix(a:Pose,b:Pose,t:number):Pose{
  t=smooth(t);return{position:a.position.clone().lerp(b.position,t),target:a.target.clone().lerp(b.target,t),up:a.up.clone().lerp(b.up,t).normalize(),quaternion:a.quaternion.clone().slerp(b.quaternion,t),scale:a.scale+(b.scale-a.scale)*t};
 }
 evaluate(t:number,aspect:number,world:(p:Vector3)=>Vector3,vector:(p:Vector3)=>Vector3):Pose{
  // Fit the 1.90-unit source length inside a narrow portrait viewport too.
  const c=this.construction,wideDistance=Math.max(2.62,3.45/Math.max(.42,aspect));
  const wide=this.pose(new Vector3(0,.015,0),wideDistance);
  const p=world(c.p),origin=this.pose(world(c.a),1.08);
  if(t<3.3)return this.mix(wide,origin,phase(t,.35,2.8));
  if(t<9)return this.mix(origin,wide,phase(t,3.5,8.8));
  const contact=this.pose(p,1.12),crossEnd=this.pose(world(pathSample(c.cross,.7).point),1.32);
  if(t<10.4)return this.mix(wide,contact,phase(t,9,10.4));
  if(t<12)return this.mix(contact,crossEnd,phase(t,10.4,12));
  const cuffStart=this.pose(world(c.cuff[0].points[0].clone().lerp(c.cuff[1].points[0],.5)),1.52);
  if(t<13.1)return this.mix(crossEnd,cuffStart,phase(t,12,13.1));
  const cuffTip=pathSample(c.cuff[0],phase(t,12.8,17)).point.lerp(pathSample(c.cuff[1],phase(t,12.8,17)).point,.5);
  const follow=this.pose(world(cuffTip),1.68);
  if(t<17)return this.mix(cuffStart,follow,phase(t,13.1,14));
  if(t<18.4)return this.mix(follow,wide,phase(t,17,18.4));
  const roll=vector(c.v).normalize();
  const startA=this.pose(p,1.18,roll,Z);
  if(t<21)return this.mix(wide,startA,phase(t,18.4,21));
  const trace=(k:number,time:number)=>{
   const progress=spiralProgress(time),sample=pathSample(c.golden[k],progress),target=world(sample.point),up=vector(sample.tangent).normalize();
   // A source-plane normal view preserves exact screen-vertical tangents.
   // Zoom is bounded, the existing GLB never approaches the near plane.
   return this.pose(target,1.18-.52*smooth(time),up,Z);
  };
  const endA=trace(0,1),startB=trace(1,0);
  if(t<28.8)return trace(0,phase(t,21,28.8));
  if(t<30)return this.mix(endA,startB,phase(t,28.8,30));
  if(t<37.8)return trace(1,phase(t,30,37.8));
  return this.mix(trace(1,1),wide,phase(t,37.8,42.8));
 }
}
