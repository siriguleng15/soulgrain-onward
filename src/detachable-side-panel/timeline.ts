import type {PanelData} from './data.ts';
export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
export const STAGES=[
 {id:'attached',at:0,label:'01 · 成鞋侧面',detail:'这张独立侧片已置入鞋模。原裁片的顶点与孔位身份始终保留。'},
 {id:'released',at:.24,label:'02 · 侧片拆离',detail:'侧片沿外侧抬起，与鞋身分离；鞋底包裹范围留在排除带中。'},
 {id:'unfold',at:.57,label:'03 · 翻筒展开',detail:'同一张网格解除翻折与曲面贴合，连续回到原始裁片平面。'},
 {id:'flat',at:.84,label:'04 · 完整平铺',detail:'除鞋底包裹带之外，所有保留三角形使用原裁片毫米坐标。'},
 {id:'compare',at:1,label:'05 · 叠合校验',detail:'从实际侧片平铺后的顶点提取轮廓，与原纸样叠合；不替换另一张模型。'},
] as const;
export const stageAt=(p:number)=>p<.12?STAGES[0]:p<.3?STAGES[1]:p<.8?STAGES[2]:p<.9?STAGES[3]:STAGES[4];
/** Adjacent analytic-fold samples share the full immutable source identity. */
export class PanelEvaluator {
 readonly data:PanelData;
 readonly frames;
 readonly output:Float32Array;
 readonly raw:Float64Array;
 readonly translation=[0,0,0];
 constructor(data:PanelData){this.data=data;this.frames=[...data.unfoldSamples!].sort((a,b)=>a.formedAmount-b.formedAmount);this.output=new Float32Array(data.formedPositions.length);this.raw=new Float64Array(data.formedPositions.length);}
 evaluate(progress:number){
  const p=clamp(progress),formedAmount=1-smooth((p-.28)/.52),frames=this.frames;
  let low=0;while(low<frames.length-2&&frames[low+1].formedAmount<formedAmount)low++;
  const a=frames[low],b=frames[low+1],t=clamp((formedAmount-a.formedAmount)/Math.max(1e-12,b.formedAmount-a.formedAmount));
  const radius=this.data.display.mmToModelScale;
  // Release precedes unrolling. This is a rigid scene translation only; it
  // never changes the paper metric or the canonical flat endpoint.
  const lift=smooth(p/.24),spread=smooth((p-.23)/.57);
  this.translation[0]=spread*1.85;this.translation[1]=spread*.03;this.translation[2]=lift*.43+spread*.08;
  for(let i=0;i<this.raw.length;i++){
   let value=formedAmount===0?this.data.flatDisplayPositions[i]:formedAmount===1?this.data.formedPositions[i]:a.positions[i]+(b.positions[i]-a.positions[i])*t;
   this.raw[i]=value;this.output[i]=value+this.translation[i%3];
  }
  return{positions:this.output,canonicalPositions:this.raw,translation:this.translation,formedAmount,comparisonOpacity:smooth((p-.86)/.14),scale:radius};
 }
}
export class NarrativePlayback {
 private frame=0;private token=0;playing=false;private from=0;private target=1;private started=0;private duration=12000;private resolver?:(done:boolean)=>void;
 readonly getProgress:()=>number;readonly update:(p:number)=>void;readonly onPlaying:(value:boolean)=>void;
 constructor(getProgress:()=>number,update:(p:number)=>void,onPlaying:(value:boolean)=>void){this.getProgress=getProgress;this.update=update;this.onPlaying=onPlaying;}
 stop(){this.token++;cancelAnimationFrame(this.frame);this.frame=0;this.playing=false;this.onPlaying(false);this.resolver?.(false);this.resolver=undefined;}
 playTo(target=1,duration=12000){if(!Number.isFinite(target))return Promise.resolve(false);if(!Number.isFinite(duration)||duration<=0)duration=12000;this.stop();const from=this.getProgress();this.from=from;this.target=clamp(target);this.duration=Math.max(1,duration*Math.abs(this.target-from));this.started=performance.now();this.playing=true;this.onPlaying(true);const token=this.token;
  return new Promise<boolean>(resolve=>{this.resolver=resolve;const tick=(time:number)=>{if(token!==this.token)return;const t=clamp((time-this.started)/this.duration);this.update(this.from+(this.target-this.from)*t);if(t<1)this.frame=requestAnimationFrame(tick);else{this.frame=0;this.playing=false;this.onPlaying(false);this.resolver=undefined;resolve(true);}};this.frame=requestAnimationFrame(tick);});
 }
}
