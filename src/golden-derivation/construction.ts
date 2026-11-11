import { Vector2, Vector3 } from 'three';
import {INTRO_DURATION,DERIVATION_DURATION} from './timeline.ts';
export {INTRO_DURATION,derivationTime} from './timeline.ts';

export const SOURCE_SHA='ec49238d7ece89fccadf6b777bc71550c1de881bb582b0150cdf7e5cb6081e16';
export const SOURCE_BLEND_SHA='725756904a0c71ee9c927b3e39332655c4cd175d3b9d55d0272ae70adb105183';
export const SOURCE_FILE='soul-v1-3/soul-new-web.glb';
export const CONSTRUCTION_FILE='soul-v1-3/construction.json';
export const PHI=(1+Math.sqrt(5))/2;
export const DURATION=DERIVATION_DURATION+INTRO_DURATION;
export const ANIMATION_VERSION='1.3';
export const PROOF_STARTS=[20,44] as const;
export const ARC_START=14.2, ARC_END=23.8;
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{v=clamp(v);return v*v*v*(10+v*(-15+v*6));};
export const phase=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const DERIVATION_SHOTS=[
 {at:0,end:3.3,id:'origin',label:'01 起点',en:'A POINT OF DEPARTURE',text:'镜头推进缝线下端。'},
 {at:3.3,end:9,id:'axis',label:'02 主线',en:'FINDING THE AXIS',text:'从鞋头侧面起点向后跟顶端延伸，经过切点时点亮。'},
 {at:9,end:12,id:'tangent',label:'03 切线',en:'THE POINT OF CONTACT',text:'从切点向下绘制短线；完成约 70% 时，镜头移向翻筒。'},
 {at:12,end:17,id:'cuff',label:'04 交汇',en:'LINES IN CONVERSATION',text:'两条翻筒分区线从后跟向前延伸，与短线同步交汇。'},
 {at:17,end:20,id:'frame',label:'05 构图',en:'A HIDDEN FRAME',text:'回到整体构图，再以切点为中心靠近、转向。'},
 {at:20,end:44,id:'spiral-a',label:'06 第一组推导',en:'CONSTRUCTING THE GOLDEN RATIO / I',text:'单位正方形 → 中点作圆 → 黄金矩形 → 递归分割 → 逐段圆弧。'},
 {at:44,end:68,id:'spiral-b',label:'07 第二组推导',en:'CONSTRUCTING THE GOLDEN RATIO / II',text:'从青色短线的下端起笔，镜像重复相同的数学作图步骤。'},
 {at:68,end:73,id:'return',label:'08 全貌',en:'EVERY LINE BELONGS',text:'镜头回到起始视角，保留完整推导。'},
] as const;
export const SHOTS=[
 {at:0,end:1.4,id:'material',label:'01 原貌',en:'BEFORE THE GEOMETRY',text:'SOUL.NEW 原材质鞋模。'},
 {at:1.4,end:INTRO_DURATION,id:'world',label:'02 几何世界',en:'ENTER THE GEOMETRY',text:'从真实材质，进入线与比例的世界。'},
 ...DERIVATION_SHOTS.map((s,i)=>({...s,at:s.at+INTRO_DURATION,end:s.end+INTRO_DURATION,label:String(i+3).padStart(2,'0')+s.label.slice(2)})),
];
export function shotAt(t:number){return [...SHOTS].reverse().find(s=>t>=s.at)??SHOTS[0];}
export interface Path {points:Vector3[];lengths:number[];length:number}
export function pathOf(points:Vector3[]):Path{
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+points[i].distanceTo(points[i-1]));
 return{points,lengths,length:lengths.at(-1)??0};
}
export function pathSample(path:Path,p:number){
 const d=clamp(p)*path.length;let lo=0,hi=path.lengths.length-1;
 while(lo<hi){const m=(lo+hi)>>>1;if(path.lengths[m]<d)lo=m+1;else hi=m;}
 const i=Math.max(1,lo),a=path.points[i-1],b=path.points[i];
 return {point:a.clone().lerp(b,(d-path.lengths[i-1])/Math.max(1e-12,path.lengths[i]-path.lengths[i-1])),tangent:b.clone().sub(a).normalize()};
}
export function straight(a:Vector3,b:Vector3,count=160){return pathOf(Array.from({length:count+1},(_,i)=>a.clone().lerp(b,i/count)));}
export interface GoldenArc {center:Vector2;radius:number;a:number;b:number;square:[number,number,number]}
/** Quarter circles in recursive golden squares: a construction spiral, not a
 * falsely labelled exact logarithmic spiral. Adjacent tangents are continuous. */
export function goldenArcs(count=8):GoldenArc[]{
 let x=0,y=0,w=PHI,h=1;const arcs:GoldenArc[]=[];
 for(let i=0;i<count;i++){
  const s=Math.min(w,h);let sx=x,sy=y,cx:number,cy:number;
  if(i%4===0){x+=s;w-=s;cx=sx+s;cy=sy;}
  else if(i%4===1){sy=y+h-s;h-=s;cx=sx;cy=sy;}
  else if(i%4===2){sx=x+w-s;w-=s;cx=sx;cy=sy+s;}
  else{y+=s;h-=s;cx=sx+s;cy=sy+s;}
  const a=Math.PI-i*Math.PI/2;arcs.push({center:new Vector2(cx,cy),radius:s,a,b:a-Math.PI/2,square:[sx,sy,s]});
 }
 return arcs;
}
/** Allocate time to small arcs too, so the camera does not spin through the
 * inner turns in the last two frames of a constant-distance reveal. */
export function spiralProgress(time:number){
 const arcs=goldenArcs(),weights=arcs.map(a=>a.radius**.3),sum=weights.reduce((a,b)=>a+b,0);
 const length=arcs.reduce((s,a)=>s+a.radius,0);let used=0,travel=0;
 for(let i=0;i<arcs.length;i++){
  const slot=weights[i]/sum;
  if(time<=used+slot)return (travel+arcs[i].radius*clamp((time-used)/slot))/length;
  used+=slot;travel+=arcs[i].radius;
 }
 return 1;
}
/** One clock drives construction, compass and camera, including reverse seeks. */
export function proofState(t:number){
 const group=t<PROOF_STARTS[1]?0:1,local=t-PROOF_STARTS[group];
 const progress=spiralProgress(phase(local,ARC_START,ARC_END));
 const arcs=goldenArcs(),total=arcs.reduce((n,a)=>n+a.radius,0);
 let arcIndex=0,travel=0;
 while(arcIndex<arcs.length-1&&travel+arcs[arcIndex].radius<progress*total-1e-10)travel+=arcs[arcIndex++].radius;
 const arcFraction=clamp((progress*total-travel)/arcs[arcIndex].radius);
 const cutIndex=Math.min(7,Math.max(0,Math.floor(local-5)));
 const stage=local<0?'waiting':local<.9?'unit':local<1.7?'midpoint':local<2.7?'compass':local<5?'ratio':local<13?'partition':local<ARC_START?'prepare':local<ARC_END?'arc':'complete';
 return{group,local,progress,arcIndex,arcFraction,cutIndex,stage};
}
export function proofCaption(t:number){
 const s=proofState(t),n=s.cutIndex,r=PHI**-n;
 const prefix=s.group?'第二组 · ':'第一组 · ';
 const info:Record<string,[string,string]>={
  unit:['01 / 单位正方形','先作边长为 1 的正方形。'],
  midpoint:['02 / 中点与对角线','底边中点 M → 对角顶点：d = √(1² + 0.5²) = √5 / 2'],
  compass:['03 / 圆规延长底边','以 M 为圆心、d 为半径转至底边延长线。'],
  ratio:['04 / 黄金矩形','φ = 1/2 + √5/2 = 1.618034…；φ − 1 = 1/φ ≈ 0.618'],
  partition:[`05 / 分割正方形 ${n+1} / 8`,`边长 r${n} = φ⁻${n} = ${r.toFixed(3)}；余下矩形仍满足 长 / 宽 = φ`],
  prepare:['06 / 圆弧作图','每个正方形内，以对应顶角 O 为圆心、边长 r 为半径。'],
  arc:[`06 / 第 ${s.arcIndex+1} 段圆弧`,`O${s.arcIndex} 为圆心；r${s.arcIndex} = ${(PHI**-s.arcIndex).toFixed(3)}；转过 ${(90*s.arcFraction).toFixed(0)}° / 90°`],
  complete:['07 / 作图完成','8 段相切的 90° 圆弧依次连接；相邻半径之比为 φ。'],
 };
 const [title,detail]=info[s.stage]??['',''];return{...s,title:prefix+title,detail};
}
export interface ConstructionData {
 revision:string;
 sourceBlendSha256:string;
 sourceBounds:[number[],number[]];
 calibration:{contactEyeletNumber:number;eyelets:{numberFromToe:number;point:number[]}[];secondSpiralStart:string};
 sourceSha256:string;seam:{points:number[][];anchors:unknown[]};
 frame:{origin:number[];axis:number[];down:number[];height:number;depth:number};
 landmarks:Record<string,number[]>;notes:string[];validation:Record<string,unknown>;
}
export class Construction {
 readonly seam:Path;readonly axis:Path;readonly cross:Path;readonly cuff:Path[];
 readonly golden:Path[]=[];readonly divisions:Path[][]=[];
 readonly a:Vector3;readonly b:Vector3;readonly p:Vector3;readonly q:Vector3;
 readonly e:Vector3;readonly v:Vector3;readonly height:number;
 constructor(readonly data:ConstructionData){
  this.seam=pathOf(data.seam.points.map(p=>new Vector3(...p as [number,number,number])));
  const vec=(key:string)=>new Vector3(...data.landmarks[key] as [number,number,number]);
  this.a=vec('toe');this.b=vec('heel');this.p=new Vector3(...data.frame.origin as [number,number,number]);
  this.e=new Vector3(...data.frame.axis as [number,number,number]);this.v=new Vector3(...data.frame.down as [number,number,number]);
  this.height=data.frame.height;this.q=this.p.clone().addScaledVector(this.v,this.height);
  this.axis=straight(this.a,this.b);this.cross=straight(this.p,this.q);
  this.cuff=[.5,1].map(d=>{const end=this.p.clone().addScaledVector(this.v,this.height*d);const start=end.clone().addScaledVector(this.e,(this.b.x-end.x)/this.e.x+.035);return straight(start,end);});
  for(let k=0;k<2;k++){
   const map=(x:number,y:number)=>this.local(x,y,k===1);
   const arcs=goldenArcs(),points:Vector3[]=[],divisions:Path[]=[];
   for(const arc of arcs){
    for(let n=0;n<=100;n++){if(points.length&&n===0)continue;const a=arc.a+(arc.b-arc.a)*n/100;points.push(map(arc.center.x+Math.cos(a)*arc.radius,arc.center.y+Math.sin(a)*arc.radius));}
    const[x,y,s]=arc.square;divisions.push(pathOf([map(x,y),map(x+s,y),map(x+s,y+s),map(x,y+s),map(x,y)]));
   }
   this.golden.push(pathOf(points));this.divisions.push(divisions);
  }
 }
 local(x:number,y:number,opposite=false){
  // Reflect across the midline: the second start is Q on P's short edge.
  // A half-turn wrongly puts it at the far corner, as happened in V1.
  if(opposite)y=1-y;
  return this.p.clone().addScaledVector(this.e,x*this.height).addScaledVector(this.v,y*this.height);
 }
 rectangle(){return pathOf([this.local(0,0),this.local(PHI,0),this.local(PHI,1),this.local(0,1),this.local(0,0)]);}
}
