export interface Point {x:number;y:number;t?:number;}
export interface GestureResult {valid:boolean;reason:string;closure:number;roundness:number;radialCV:number;turns:number;directionConsistency:number;aspect:number;length:number;points:number;center:Point;}
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
function resample(input:Point[],count=96){const lengths=[0];for(let i=1;i<input.length;i++)lengths.push(lengths.at(-1)!+dist(input[i-1],input[i]));const total=lengths.at(-1)!,out:Point[]=[];let j=1;for(let i=0;i<count;i++){const s=total*i/(count-1);while(j<lengths.length-1&&lengths[j]<s)j++;const a=input[j-1],b=input[j],t=(s-lengths[j-1])/Math.max(.0001,lengths[j]-lengths[j-1]);out.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}return{out,total};}
/** Independent ellipse-normalized shape analysis; not code from Why Zero. */
export function recognizeZero(input:Point[],minimumExtent=68):GestureResult{
 const empty:GestureResult={valid:false,reason:'请画一个完整的零',closure:1,roundness:0,radialCV:1,turns:0,directionConsistency:0,aspect:0,length:0,points:input.length,center:{x:0,y:0}};
 if(input.length<12)return empty;
 const{out:p,total}=resample(input),cx=p.reduce((a,q)=>a+q.x,0)/p.length,cy=p.reduce((a,q)=>a+q.y,0)/p.length;
 const w=Math.max(...p.map(q=>q.x))-Math.min(...p.map(q=>q.x)),h=Math.max(...p.map(q=>q.y))-Math.min(...p.map(q=>q.y)),diag=Math.hypot(w,h);
 let xx=0,yy=0,xy=0;for(const q of p){const x=q.x-cx,y=q.y-cy;xx+=x*x;yy+=y*y;xy+=x*y;}xx/=p.length;yy/=p.length;xy/=p.length;
 const angle=.5*Math.atan2(2*xy,xx-yy),c=Math.cos(angle),s=Math.sin(angle),root=Math.sqrt((xx-yy)**2+4*xy*xy),major=Math.sqrt(Math.max(.01,(xx+yy+root)/2)),minor=Math.sqrt(Math.max(.01,(xx+yy-root)/2));
 let q=p.map(a=>({x:((a.x-cx)*c+(a.y-cy)*s)/major,y:(-(a.x-cx)*s+(a.y-cy)*c)/minor}));
 // Mild filtering removes sampling jitter without turning corners into circles.
 for(let k=0;k<2;k++)q=q.map((a,i)=>i<2||i>q.length-3?a:{x:(q[i-1].x+2*a.x+q[i+1].x)/4,y:(q[i-1].y+2*a.y+q[i+1].y)/4});
 let perimeter=0,area=0,rotation=0,absolute=0;const radii=q.map(a=>Math.hypot(a.x,a.y));
 for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];perimeter+=dist(a,b);area+=a.x*b.y-b.x*a.y;if(i<q.length-1){let d=Math.atan2(b.y,b.x)-Math.atan2(a.y,a.x);while(d>Math.PI)d-=2*Math.PI;while(d< -Math.PI)d+=2*Math.PI;rotation+=d;absolute+=Math.abs(d);}}
 const mean=radii.reduce((a,b)=>a+b,0)/radii.length,cv=Math.sqrt(radii.reduce((a,b)=>a+(b-mean)**2,0)/radii.length)/mean;
 const result:GestureResult={valid:false,reason:'再试一次，画得圆一些',closure:dist(input[0],input.at(-1)!)/Math.max(1,diag),roundness:Math.min(1,2*Math.PI*Math.abs(area)/(perimeter*perimeter)),radialCV:cv,turns:rotation/(2*Math.PI),directionConsistency:Math.abs(rotation)/Math.max(.001,absolute),aspect:minor/major,length:total,points:input.length,center:{x:cx,y:cy}};
 if(Math.min(w,h)<minimumExtent||total<minimumExtent*3){result.reason='画大一点，让零的轮廓更清晰';return result;}
 if(result.aspect<.36){result.reason='不要太扁，试着画一个完整的零';return result;}
 if(result.closure>.23){result.reason='把起点与终点连起来';return result;}
 if(Math.abs(result.turns)<.82||Math.abs(result.turns)>1.22||result.directionConsistency<.72){result.reason='沿一个方向绕完整一圈';return result;}
 if(result.roundness<.87||result.radialCV>.24)return result;
 result.valid=true;result.reason='零已闭合';return result;
}
