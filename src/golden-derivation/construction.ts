import { Vector2, Vector3 } from 'three';

export const SOURCE_SHA='b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897';
export const PHI=(1+Math.sqrt(5))/2;
export const DURATION=43;
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{v=clamp(v);return v*v*v*(10+v*(-15+v*6));};
export const phase=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
export const SHOTS=[
 {at:0,end:3.3,id:'origin',label:'01 起点',en:'A POINT OF DEPARTURE',text:'镜头推进缝线下端。'},
 {at:3.3,end:9,id:'axis',label:'02 主线',en:'FINDING THE AXIS',text:'从鞋头侧面起点向后跟顶端延伸，经过切点时点亮。'},
 {at:9,end:12,id:'tangent',label:'03 切线',en:'THE POINT OF CONTACT',text:'从切点向下绘制短线；完成约 70% 时，镜头移向翻筒。'},
 {at:12,end:17,id:'cuff',label:'04 交汇',en:'LINES IN CONVERSATION',text:'两条翻筒分区线从后跟向前延伸，与短线同步交汇。'},
 {at:17,end:20,id:'frame',label:'05 构图',en:'A HIDDEN FRAME',text:'回到整体构图，再以切点为中心靠近、转向。'},
 {at:20,end:29,id:'spiral-a',label:'06 第一螺旋',en:'THE GOLDEN PROPORTION / I',text:'黄金矩形逐级分割。生长端居中，切线沿画面纵向。'},
 {at:29,end:38,id:'spiral-b',label:'07 第二螺旋',en:'THE GOLDEN PROPORTION / II',text:'从矩形另一端开始，以相同镜头规则绘制第二组。'},
 {at:38,end:43,id:'return',label:'08 全貌',en:'EVERY LINE BELONGS',text:'镜头回到起始视角，保留完整推导。'},
] as const;
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
export interface ConstructionData {
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
  if(opposite){x=PHI-x;y=1-y;}
  return this.p.clone().addScaledVector(this.e,x*this.height).addScaledVector(this.v,y*this.height);
 }
 rectangle(){return pathOf([this.local(0,0),this.local(PHI,0),this.local(PHI,1),this.local(0,1),this.local(0,0)]);}
}
