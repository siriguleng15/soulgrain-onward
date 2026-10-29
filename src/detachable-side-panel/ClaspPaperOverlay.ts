/** Paper-owned coverage and annotations. Back-face coordinates deliberately
 * use the same immutable paper axes; exports are research diagrams, not
 * automatically mirrored factory cutting/printing templates. */
import type {PatternData} from '../pattern-engineering/types.ts';
import type {ClaspCoverage,ClaspDerivationData,ClaspKeypoint} from './clasp-types.ts';
import {claspCoverageReveal,claspPointReveal} from './clasp-types.ts';

export type ClaspPaperFace='front'|'back'|'both';
const NS='http://www.w3.org/2000/svg';
const esc=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const node=<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={})=>{const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
const number=(n:number)=>Number(n.toFixed(6));
const sideMatches=(side:number,face:ClaspPaperFace)=>face==='both'||side===(face==='front'?1:-1);
const colour=(side:number)=>side===1?'#b67d2d':'#8b65aa';
const roleText=(half:string)=>half==='body'?'鞋身端皮条':half==='cuff'?'翻筒端皮条':half==='snap-body'?'鞋身扣件投影':'翻筒扣件投影';
const xy=(p:readonly number[])=>p.map(number).join(' ');
const ringPath=(ring:readonly(readonly number[])[])=>ring.map((p,i)=>(i?'L':'M')+xy(p)).join(' ')+'Z';
function coveragePath(c:ClaspCoverage){const out:string[]=[];for(let i=0;i<c.indices.length;i+=3){const ids=c.indices.slice(i,i+3);out.push(ringPath(ids.map(id=>c.vertices[id].flatMm)));}return out.join(' ');}
function coverageBoundary(c:ClaspCoverage){
 const edges=new Map<string,{a:readonly number[];b:readonly number[];count:number}>();
 const key=(q:readonly number[])=>q.map(x=>x.toFixed(7)).join(',');
 for(let i=0;i<c.indices.length;i+=3)for(let j=0;j<3;j++){
  const a=c.vertices[c.indices[i+j]].flatMm,b=c.vertices[c.indices[i+(j+1)%3]].flatMm,ka=key(a),kb=key(b),k=ka<kb?ka+'|'+kb:kb+'|'+ka,old=edges.get(k);
  if(old)old.count++;else edges.set(k,{a,b,count:1});
 }
 return[...edges.values()].filter(e=>e.count===1).map(e=>'M'+xy(e.a)+'L'+xy(e.b)).join(' ');
}
function pointLabel(p:ClaspKeypoint,index:number){
 // Leaders keep the coordinate marker exact while moving text off the tiny
 // cap/strip footprints. Labels never replace or round the source anchor.
 const q=p.surface.flatMm,dx=index%2===0?5:-5,dy=4+(index%3)*2.4;
 return{x:q[0]+dx,y:q[1]+dy,anchor:dx>0?'start':'end'};
}

export class ClaspPaperOverlay {
 readonly group=node('g',{'data-layer':'clasp-paper-coverage','aria-label':'皮条与扣件在原裁片正反面的覆盖投影'});
 private readonly coverageGroups:{data:ClaspCoverage;group:SVGGElement}[]=[];
 private readonly pointGroups:{data:ClaspKeypoint;group:SVGGElement}[]=[];
 private progress=0;private face:ClaspPaperFace='both';private coverageShown=true;private annotationsShown=true;

 constructor(readonly svgRoot:SVGGElement,readonly data:ClaspDerivationData,readonly pattern:PatternData,readonly onPick?:(id:string)=>void){
  for(const c of data.coverage){
   const color=colour(c.materialSide),g=node('g',{'data-coverage-id':c.id,'data-material-side':c.materialSide,'data-half':c.half,'pointer-events':'none'});
   const fill=node('path',{d:coveragePath(c),fill:color,'fill-opacity':c.half.startsWith('snap')?'.17':'.28',stroke:'none'});
   const outline=node('path',{d:coverageBoundary(c),fill:'none',stroke:color,'stroke-width':'.5','stroke-dasharray':c.materialSide===-1?'2 1':'none','vector-effect':'non-scaling-stroke'});
   const title=node('title');title.textContent=`${c.id} · ${roleText(c.half)} · ${c.materialSide===1?'正面':'反面'} · 数字裁片参考面积 ${c.areaFlatMm2?.toFixed(2)??'待校核'} mm²`;
   g.append(fill,outline,title);this.coverageGroups.push({data:c,group:g});this.group.append(g);
  }
  for(const[p,index]of data.keypoints.map((p,i)=>[p,i]as const)){
   const color=colour(p.surface.materialSide),g=node('g',{'data-keypoint-id':p.id,'data-material-side':p.surface.materialSide,role:'button',tabindex:'0','aria-label':`${p.label}：${p.surface.materialSide===1?'正面':'反面'}坐标 ${p.surface.flatMm.map(x=>x.toFixed(2)).join(', ')} 毫米`});
   const[x,y]=p.surface.flatMm,label=pointLabel(p,index);
   g.append(node('path',{d:`M${x} ${y}L${label.x} ${label.y}`,fill:'none',stroke:color,'stroke-width':'.3','pointer-events':'none'}),node('circle',{cx:x,cy:y,r:1.25,fill:'#fff',stroke:color,'stroke-width':'.7','vector-effect':'non-scaling-stroke'}));
   const t=node('text',{transform:`translate(${label.x} ${label.y}) scale(1 -1)`,fill:color,'font-family':'Inter, Arial, PingFang SC, sans-serif','font-size':3.1,'text-anchor':label.anchor,'paint-order':'stroke',stroke:'#fafbf7','stroke-width':'.85','stroke-linejoin':'round'});t.textContent=p.id;g.append(t);
   const title=node('title');title.textContent=`${p.id} · ${p.role} · ${xy(p.surface.flatMm)} mm · 三角形 ${p.surface.triangle??'—'} · ${p.surface.confidence??'形变映射参考'}`;g.append(title);
   const select=(e:Event)=>{e.stopPropagation();this.onPick?.(p.id);};g.addEventListener('click',select);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(e);}});
   this.pointGroups.push({data:p,group:g});this.group.append(g);
  }
  svgRoot.append(this.group);this.update();
 }

 setProgress(progress:number){this.progress=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));this.update();}
 setFace(face:ClaspPaperFace){this.face=face;this.update();}
 setCoverage(show:boolean){this.coverageShown=show;this.update();}
 setAnnotations(show:boolean){this.annotationsShown=show;this.update();}
 private update(){
  const coverageAlpha=claspCoverageReveal(this.progress);
  for(const{data:c,group}of this.coverageGroups){const show=this.coverageShown&&coverageAlpha>0&&sideMatches(c.materialSide,this.face);group.style.display=show?'':'none';group.setAttribute('opacity',String(coverageAlpha));}
  for(const{data:p,group}of this.pointGroups){const alpha=claspPointReveal(this.progress,p),show=this.annotationsShown&&alpha>0&&sideMatches(p.surface.materialSide,this.face);group.style.display=show?'':'none';group.setAttribute('opacity',String(alpha));group.setAttribute('tabindex',show?'0':'-1');}
  this.group.setAttribute('data-face',this.face);this.group.setAttribute('data-progress',String(this.progress));
 }
 getState(){return{face:this.face,progress:this.progress,coverageShown:this.coverageShown,annotationsShown:this.annotationsShown,visibleCoverageIds:this.coverageGroups.filter(x=>x.group.style.display!=='none').map(x=>x.data.id),visibleKeypointIds:this.pointGroups.filter(x=>x.group.style.display!=='none').map(x=>x.data.id)};}

 /** Export the completed reference rather than an accidentally half-drawn
  * frame. Both sides remain in common source axes and are clearly separated. */
 exportSVG(face:ClaspPaperFace='both'){
  const W=this.pattern.bounds.width,H=this.pattern.bounds.height,pad=13,gap=15,faces:('front'|'back')[]=face==='both'?['front','back']:[face];
  const diagramWidth=W+pad*2,width=diagramWidth*faces.length+gap*(faces.length-1),tableTop=H+43;
  const selectedPoints=this.data.keypoints.filter(p=>sideMatches(p.surface.materialSide,face)),selectedCoverage=this.data.coverage.filter(c=>sideMatches(c.materialSide,face));
  const rows=Math.max(selectedPoints.length,selectedCoverage.length),height=tableTop+Math.max(52,rows*5.5)+39;
  const shapes:string[]=[];
  for(const[f,index]of faces.map((f,i)=>[f,i]as const)){
   const side=f==='front'?1:-1,origin=index*(diagramWidth+gap)+pad,coverage=this.data.coverage.filter(c=>c.materialSide===side),points=this.data.keypoints.filter(p=>p.surface.materialSide===side);
   shapes.push(`<text x="${origin}" y="12" font-size="4.5">${f==='front'?'正面 · 鞋身安装':'反面 · 翻筒安装'}</text><text x="${origin}" y="18" font-size="2.8">原裁片共同坐标；${f==='back'?'反面图未自动镜像，不是生产印制版':'底部排除与工艺边界仍待实物确认'}</text>`);
   shapes.push(`<g transform="translate(${origin} ${H+25}) scale(1 -1)"><path d="${ringPath(this.pattern.boundary)}" fill="#f5f8f8" stroke="#5e7c90" stroke-width=".3"/>`);
   for(const h of this.pattern.holes)shapes.push(h.boundary?.length?`<path d="${ringPath(h.boundary)}" fill="${h.role==='eyelet'?'white':'#e3d8bf'}" stroke="#8298a5" stroke-width=".2"/>`:`<circle cx="${h.center[0]}" cy="${h.center[1]}" r="${h.radiusMm}" fill="${h.role==='eyelet'?'white':'#e3d8bf'}" stroke="#8298a5" stroke-width=".2"/>`);
   for(const l of this.pattern.structureLines)shapes.push(`<path d="${l.points.map((p,i)=>(i?'L':'M')+xy(p)).join(' ')}" fill="none" stroke="#a3adb1" stroke-width=".2" stroke-dasharray="2 1"/>`);
   for(const c of coverage)shapes.push(`<g data-coverage-id="${esc(c.id)}" data-material-side="${c.materialSide}" data-flat-area-mm2="${c.areaFlatMm2??''}"><path d="${coveragePath(c)}" fill="${colour(side)}" fill-opacity=".24" stroke="none"/><path d="${coverageBoundary(c)}" fill="none" stroke="${colour(side)}" stroke-width=".35"${side===-1?' stroke-dasharray="2 1"':''}/></g>`);
   for(const[p,i]of points.map((p,i)=>[p,i]as const)){const[x,y]=p.surface.flatMm,label=pointLabel(p,i);shapes.push(`<g data-keypoint-id="${esc(p.id)}" data-material-side="${p.surface.materialSide}" data-x-mm="${x}" data-y-mm="${y}"><circle cx="${x}" cy="${y}" r="1" fill="white" stroke="${colour(side)}" stroke-width=".4"/><path d="M${x} ${y}L${label.x} ${label.y}" stroke="${colour(side)}" stroke-width=".2"/><text transform="translate(${label.x} ${label.y}) scale(1 -1)" text-anchor="${label.anchor}" fill="${colour(side)}" font-size="3">${esc(p.id)}</text></g>`);}
   shapes.push('</g>');
  }
  shapes.push(`<text x="${pad}" y="${tableTop}" font-size="3.6">关键点 · 原裁片毫米坐标</text><text x="${Math.max(width*.52,120)}" y="${tableTop}" font-size="3.6">覆盖面积 · 数字曲面映射参考</text>`);
  for(const[p,i]of selectedPoints.map((p,i)=>[p,i]as const))shapes.push(`<text x="${pad}" y="${tableTop+7+i*5.5}" font-size="2.8">${esc(p.label)} · ${p.surface.materialSide===1?'正':'反'} · (${p.surface.flatMm[0].toFixed(3)}, ${p.surface.flatMm[1].toFixed(3)})</text>`);
  for(const[c,i]of selectedCoverage.map((c,i)=>[c,i]as const))shapes.push(`<text x="${Math.max(width*.52,120)}" y="${tableTop+7+i*5.5}" font-size="2.8">${esc(c.id)} · ${c.materialSide===1?'正':'反'} · ${c.areaFlatMm2?.toFixed(3)??'待校核'} mm²</text>`);
  shapes.push(`<text x="${pad}" y="${height-19}" font-size="3">定位研究，非工厂定稿。12mm 为四合扣预设外观直径，不是皮条宽度、重叠量或模型全局比例。</text><text x="${pad}" y="${height-13}" font-size="2.7">原裁片坐标未改；隐藏构形、材料伸缩、PU 裁切、公母扣重叠与安装面仍待实物验证。</text><text x="${pad}" y="${height-7}" font-size="2.3">Panel SHA-256: ${esc(this.data.source?.panelDataSha256??'参见源 JSON')}</text>`);
  const metadata={schemaVersion:1,units:'mm',coordinateSystem:'Original immutable paper axes for both faces; back diagram is not automatically mirrored.',face,source:this.data.source,coverage:selectedCoverage.map(c=>({id:c.id,clasp:c.clasp,half:c.half,materialSide:c.materialSide,areaFlatMm2:c.areaFlatMm2,vertices:c.vertices.map(v=>({flatMm:v.flatMm,ids:v.ids,barycentric:v.barycentric,triangle:v.triangle})),indices:c.indices})),keypoints:selectedPoints,productionReady:false};
  return`<svg xmlns="${NS}" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}"><title>SoulGrain ONWARD · 皮条与四合扣正反面定位研究</title><desc>由同一侧片的三角形重心坐标追溯到原裁片。面积为数字参考，非实际生产尺寸认证。</desc><metadata>${esc(JSON.stringify(metadata))}</metadata><rect width="100%" height="100%" fill="white"/><g font-family="Arial, PingFang SC, sans-serif" fill="#294f66">${shapes.join('')}</g></svg>`;
 }
 dispose(){this.group.remove();}
}
