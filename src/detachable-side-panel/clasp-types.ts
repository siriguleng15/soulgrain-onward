import type {PanelData} from './data.ts';

export interface ClaspSurfaceSample {
 ids:[number,number,number];
 barycentric:[number,number,number];
 materialSide:1|-1;
 normalSign?:number;
 flatMm:[number,number];
 region:'body'|'cuff';
 photoPx?:[number,number];
 projectionResidualPx?:number;
 triangle?:number;
 confidence?:string;
 [key:string]:unknown;
}
export interface ClaspDerivationPath {
 id:string;stage:number;type:string;points:ClaspSurfaceSample[];
 segments?:[number,number][];closed?:boolean;arcIndex?:number;
 [key:string]:unknown;
}
export interface ClaspCoverage {
 id:string;clasp:string;half:'body'|'cuff'|'snap-body'|'snap-cuff';
 materialSide:1|-1;vertices:ClaspSurfaceSample[];indices:number[];
 areaFlatMm2?:number;[key:string]:unknown;
}
export interface ClaspKeypoint {
 id:string;label:string;role:string;surface:ClaspSurfaceSample;
 stage?:number;revealAt?:number;[key:string]:unknown;
}
export interface ClaspAssembly {
 id:string;centerPhoto:[number,number];bodyEndPhoto:[number,number];cuffEndPhoto:[number,number];
 bodySurface:ClaspSurfaceSample;cuffSurface:ClaspSurfaceSample;
 bodyEndSurface:ClaspSurfaceSample;cuffEndSurface:ClaspSurfaceSample;
 radiusModelUnits:number;snapAppearanceDiameterMm:number;
 [key:string]:unknown;
}
export interface ClaspDerivationData {
 schemaVersion:number;paths:ClaspDerivationPath[];coverage:ClaspCoverage[];
 keypoints:ClaspKeypoint[];clasps:ClaspAssembly[];
 source?:Record<string,unknown>;validation?:Record<string,unknown>;
 assumptions?:unknown[];[key:string]:unknown;
}

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const claspSmooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
/** Stages replay the supplied construction images. They are not a claim that
 * hand-drawn lines satisfy every mathematical constraint without residual. */
export const CLASP_STAGES=[
 {id:'regions',at:0,label:'01 · 两个固定区域',detail:'先识别鞋身与翻筒，保留你给出的两个安装区域。'},
 {id:'framework',at:.15,label:'02 · 缝线定位框架',detail:'由鞋身端点连接翻筒方向，建立切点示意和侧边界。'},
 {id:'guides',at:.27,label:'03 · 延伸与中线',detail:'延伸翻筒两条结构线，再画出皮条轴线的定位参考。'},
 {id:'spiral-first',at:.40,label:'04 · 第一组黄金螺旋',detail:'按原图的黄金矩形分割，依次绘出五段四分之一圆弧。'},
 {id:'center-first',at:.50,label:'05 · 第一颗扣心',detail:'第五段支撑圆帮助解释定位；实测蓝色扣心仍是最终位置依据。'},
 {id:'spiral-opposite',at:.60,label:'06 · 反向黄金螺旋',detail:'按原图翻转的方向重画第二组矩形与圆弧，不另行改布局。'},
 {id:'center-second',at:.71,label:'07 · 第二颗扣心',detail:'标出第二个支撑圆和蓝色扣心，保留手绘拟合的偏差。'},
 {id:'both-centers',at:.78,label:'08 · 两颗扣心确认',detail:'对照两颗扣心、皮条方向及固定端，确认几何关系。'},
 {id:'straps',at:1,label:'09 · 皮条、四合扣与覆盖',detail:'显现两组皮条、扣件和材料覆盖投影；可继续拆离并检查正反面。'},
] as const;
export const claspStageAt=(progress:number)=>progress<.10?CLASP_STAGES[0]:progress<.23?CLASP_STAGES[1]:progress<.30?CLASP_STAGES[2]:progress<.46?CLASP_STAGES[3]:progress<.52?CLASP_STAGES[4]:progress<.68?CLASP_STAGES[5]:progress<.74?CLASP_STAGES[6]:progress<.82?CLASP_STAGES[7]:CLASP_STAGES[8];

const windows:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[
 [0,.10],[.10,.23],[.23,.30],[.30,.46],[.46,.52],[.52,.68],[.68,.74],[.74,.82],[.82,1],
];
export function claspStageReveal(progress:number,stage:number){const [a,b]=windows[Math.max(0,Math.min(8,stage))];return clamp((progress-a)/Math.max(.001,b-a));}
export function claspPathReveal(progress:number,path:ClaspDerivationPath){
 if(/spiral-first|spiral-opposite/.test(path.type)||path.type==='golden-rectangle'){
  const stage=path.stage,phase=claspStageReveal(progress,stage);
  if(path.type==='golden-rectangle'&&path.arcIndex===undefined)return clamp(phase/.12);
  const index=Math.max(1,Math.min(5,path.arcIndex??1)),slot=clamp((phase-.12)/.88)*5-(index-1);
  return path.type==='golden-rectangle'?clamp(slot*3):clamp((slot-.25)/.75);
 }
 return claspStageReveal(progress,path.stage);
}
export function claspPointReveal(progress:number,point:ClaspKeypoint){
 if(point.revealAt!==undefined)return claspSmooth((progress-point.revealAt)/.045);
 const stage=point.stage??(/C2|clasp-2|second/.test(point.id)?6:/C1|clasp-1|first/.test(point.id)?4:/B[12]|F[12]|fixed|end/.test(point.id)?8:1);
 return claspSmooth(claspStageReveal(progress,stage)*2);
}
export const claspCoverageReveal=(progress:number)=>claspSmooth((progress-.82)/.12);
export const claspHardwareReveal=(progress:number)=>claspSmooth((progress-.86)/.14);
export const claspGuideOpacity=(progress:number)=>1-.66*claspSmooth((progress-.82)/.18);

export function validateClaspDerivationData(data:ClaspDerivationData,panel:PanelData){
 if(!data?.paths?.length||!data.coverage?.length||data.clasps?.length!==2)throw Error('扣件推导缺少路径、覆盖或两组安装数据。');
 const n=panel.vertexIds.length;
 const sample=(s:ClaspSurfaceSample)=>{if(s.ids?.length!==3||s.barycentric?.length!==3||s.ids.some(i=>!Number.isInteger(i)||i<0||i>=n)||s.barycentric.some(v=>!Number.isFinite(v)||v<-.00001||v>1.00001)||Math.abs(s.barycentric.reduce((a,b)=>a+b,0)-1)>1e-6||![1,-1].includes(s.materialSide))throw Error('扣件映射点丢失原裁片三角形身份。');};
 for(const p of data.paths)for(const s of p.points)sample(s);
 for(const c of data.coverage){for(const s of c.vertices)sample(s);if(c.indices.length%3||c.indices.some(i=>!Number.isInteger(i)||i<0||i>=c.vertices.length))throw Error('扣件覆盖区域三角拓扑不完整。');}
 for(const p of data.keypoints)sample(p.surface);
}
