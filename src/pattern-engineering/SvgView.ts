/** The left-hand view always draws the original millimetre paper coordinates.
 * Zooming and overlays never rescale the calibration or move source vertices. */
import type { PatternData, PatternMesh, SurfaceAnchor, Vec2 } from './types.ts';
import type { FactoryPoint } from './factory.ts';
const NS='http://www.w3.org/2000/svg';
const node=<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string|number>={})=>{
  const e=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;
};
const linePath=(points:readonly Vec2[],close=false)=>points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ')+(close?' Z':'');
const inside=(point:Vec2,ring:readonly Vec2[])=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++)if((ring[i][1]>point[1])!==(ring[j][1]>point[1])&&point[0]<(ring[j][0]-ring[i][0])*(point[1]-ring[i][1])/(ring[j][1]-ring[i][1])+ring[i][0])hit=!hit;return hit;};
export interface SvgViewOptions {onPick?:(point:[number,number])=>void;onViewChange?:()=>void;baseUrl?:string;}
export class SvgView {
  readonly svg=node('svg',{role:'img','aria-label':'原始裁片毫米坐标。拖动平移，双指缩放，轻点面料与三维同步。'});
  private root=node('g');private imageLayer=node('g');private gridLayer=node('g');private lineLayer=node('g');private meshLayer=node('g');private traceLayer=node('g');private pointsLayer=node('g');private selectionLayer=node('g');
  private image?:SVGImageElement;private view:[number,number,number,number];private base:[number,number,number,number];
  private pointers=new Map<number,{x:number;y:number}>();private gesture?:{startView:[number,number,number,number];center:[number,number];distance:number;startClient:[number,number];moved:boolean};
  private observer:ResizeObserver;
  constructor(readonly host:HTMLElement,readonly pattern:PatternData,readonly options:SvgViewOptions={}){
    const {width:w,height:h}=pattern.bounds;this.base=[-17,-17,w+34,h+34];this.view=[...this.base];
    this.svg.style.cssText='width:100%;height:100%;display:block;touch-action:none;user-select:none;';this.svg.tabIndex=0;
    const title=node('title');title.textContent='SoulGrain ONWARD · 原始纸样毫米轮廓';this.svg.append(title);
    this.svg.append(node('rect',{x:-10000,y:-10000,width:20000,height:20000,fill:'#fbfcfd'}));
    this.root.setAttribute('transform',`translate(0 ${h}) scale(1 -1)`);this.svg.append(this.root);
    this.root.append(this.imageLayer,this.gridLayer);
    const outline=node('path',{d:linePath(pattern.boundary,true),fill:'#dbe9f7','fill-opacity':'.58',stroke:'#184b7a','stroke-width':'.65','vector-effect':'non-scaling-stroke'});
    this.root.append(outline,this.meshLayer,this.lineLayer,this.traceLayer,this.pointsLayer,this.selectionLayer);
    this.buildImage();this.buildGrid();this.buildLines();this.buildTrace();this.traceLayer.style.display='none';this.meshLayer.style.display='none';
    for(const hole of pattern.holes){
      const e=hole.boundary?.length?node('path',{d:linePath(hole.boundary,true)}):node('circle',{cx:hole.center[0],cy:hole.center[1],r:hole.radiusMm});
      e.setAttribute('fill',hole.role==='eyelet'?'#fff':'#e3d8bf');e.setAttribute('stroke',hole.role==='eyelet'?'#315779':'#9b855c');e.setAttribute('stroke-width','.35');e.setAttribute('vector-effect','non-scaling-stroke');
      const t=node('title');t.textContent=`${hole.id} · ${hole.center.map(x=>x.toFixed(2)).join(', ')} mm · ${hole.role==='eyelet'?'鞋眼孔':'用途待确认的纸样标记'}`;e.append(t);this.root.append(e);
      this.label(this.root,hole.id,[hole.center[0]+2,hole.center[1]+2],'#375671',2.5);
    }
    this.label(this.root,'O · 0, 0 mm',[0,-8],'#6d8394',3.2);this.label(this.root,'x →',[w-8,-8],'#6d8394',3.2);this.label(this.root,'y ↑',[-14,h-4],'#6d8394',3.2);
    this.svg.addEventListener('pointerdown',this.down);this.svg.addEventListener('pointermove',this.move);this.svg.addEventListener('pointerup',this.up);this.svg.addEventListener('pointercancel',this.cancel);this.svg.addEventListener('wheel',this.wheel,{passive:false});this.host.append(this.svg);
    this.observer=new ResizeObserver(()=>this.applyView());this.observer.observe(host);this.applyView();
  }
  private label(parent:SVGElement,text:string,p:Vec2,color:string,size=3){const t=node('text',{x:0,y:0,transform:`translate(${p[0]} ${p[1]}) scale(1 -1)`,fill:color,'font-size':size,'font-family':'Inter, Arial, PingFang SC, sans-serif','pointer-events':'none'});t.textContent=text;parent.append(t);return t;}
  private buildImage(){
    const c=this.pattern.calibration as {rectifiedImage?:{file:string;boundsMm:{x:number;y:number;width:number;height:number}}}|undefined;const r=c?.rectifiedImage;if(!r)return;
    this.image=node('image',{x:r.boundsMm.x,y:-r.boundsMm.y-r.boundsMm.height,width:r.boundsMm.width,height:r.boundsMm.height,transform:'scale(1 -1)',opacity:0,preserveAspectRatio:'none'});
    this.image.setAttribute('href',(this.options.baseUrl??`${import.meta.env.BASE_URL}pattern-engineering/data/`)+r.file);this.imageLayer.append(this.image);
  }
  private buildGrid(){
    const {width:w,height:h}=this.pattern.bounds;
    for(let x=0;x<=w;x+=10){this.gridLayer.append(node('path',{d:`M${x} 0 V${h}`,stroke:x%50===0?'#b4c6d5':'#dce5ed','stroke-width':x%50===0?.22:.12,'pointer-events':'none'}));if(x%50===0)this.label(this.gridLayer,String(x),[x+1,-3],'#7a8fa1',2.7);}
    for(let y=0;y<=h;y+=10){this.gridLayer.append(node('path',{d:`M0 ${y} H${w}`,stroke:y%50===0?'#b4c6d5':'#dce5ed','stroke-width':y%50===0?.22:.12,'pointer-events':'none'}));if(y%50===0)this.label(this.gridLayer,String(y),[-8,y+1],'#7a8fa1',2.7);}
  }
  private buildLines(){for(const l of this.pattern.structureLines){const e=node('path',{d:linePath(l.points),fill:'none',stroke:l.kind==='seam'?'#406b8a':'#c28335','stroke-width':'.5','stroke-dasharray':l.kind==='seam'?'2 1':'4 1','vector-effect':'non-scaling-stroke','pointer-events':'none'});const t=node('title');t.textContent=l.interpretation??l.id;e.append(t);this.lineLayer.append(e);}}
  private buildTrace(){const trace=this.pattern.traceComparison as {annotationBoundaryMm?:Vec2[]}|undefined;if(!trace?.annotationBoundaryMm)return;const e=node('path',{d:linePath(trace.annotationBoundaryMm,true),fill:'none',stroke:'#b44f75','stroke-width':'.65','stroke-dasharray':'2 1','vector-effect':'non-scaling-stroke','pointer-events':'none'});const title=node('title');title.textContent='C轮廓暂按手写267×262mm缩放，仅作独立对照，不改变B网格标定。';e.append(title);this.traceLayer.append(e);}
  setImageOpacity(value:number){this.image?.setAttribute('opacity',String(Math.max(0,Math.min(1,value))));}
  setGrid(show:boolean){this.gridLayer.style.display=show?'':'none';}
  setLines(show:boolean){this.lineLayer.style.display=show?'':'none';}
  setTraceComparison(show:boolean){this.traceLayer.style.display=show?'':'none';}
  setMesh(mesh:PatternMesh){const edges=new Set<string>();const segments:string[]=[];for(let t=0;t<mesh.indices.length;t+=3)for(const [a,b] of [[mesh.indices[t],mesh.indices[t+1]],[mesh.indices[t+1],mesh.indices[t+2]],[mesh.indices[t+2],mesh.indices[t]]]){const k=a<b?`${a}:${b}`:`${b}:${a}`;if(edges.has(k))continue;edges.add(k);segments.push(`M${mesh.flatMm[2*a]} ${mesh.flatMm[2*a+1]}L${mesh.flatMm[2*b]} ${mesh.flatMm[2*b+1]}`);}this.meshLayer.replaceChildren(node('path',{d:segments.join(''),fill:'none',stroke:'#367db3','stroke-width':'.22',opacity:'.5','vector-effect':'non-scaling-stroke','pointer-events':'none'}));}
  setWireframe(show:boolean){this.meshLayer.style.display=show?'':'none';}
  setSelection(anchor?:SurfaceAnchor|Vec2){this.selectionLayer.replaceChildren();if(!anchor)return;const p:Vec2=Array.isArray(anchor)?anchor as unknown as Vec2:(anchor as SurfaceAnchor).flatMm;const marker=node('g',{'pointer-events':'none'});marker.append(node('circle',{cx:p[0],cy:p[1],r:2.4,fill:'#e9a433',stroke:'white','stroke-width':'.8'}),node('path',{d:`M${p[0]-5} ${p[1]}h10 M${p[0]} ${p[1]-5}v10`,stroke:'#b36d0c','stroke-width':'.5'}));this.label(marker,`${p[0].toFixed(1)}, ${p[1].toFixed(1)}`,[p[0]+4,p[1]+5],'#946000',3.5);this.selectionLayer.append(marker);}
  setPoints(points:FactoryPoint[]){this.pointsLayer.replaceChildren();for(const p of points){if(!p.anchor)continue;const [x,y]=p.anchor.flatMm;const color=p.kind==='snap-projection'?'#c18220':p.layer==='cuff'?'#8956a5':'#12698d';const e=node('circle',{cx:x,cy:y,r:p.kind==='snap-projection'?1.7:2,fill:color,stroke:'white','stroke-width':'.5','pointer-events':'none'});const t=node('title');t.textContent=`${p.id} · ${p.label} · 研究投影，待实物验证`;e.append(t);this.pointsLayer.append(e);this.label(this.pointsLayer,p.id,[x+2.5,y+2.5],color,3);}}
  reset(){this.view=[...this.base];this.applyView();}
  exportSVG(){return new XMLSerializer().serializeToString(this.svg);}
  private applyView(){this.svg.setAttribute('viewBox',this.view.join(' '));this.options.onViewChange?.();}
  private svgPoint(x:number,y:number):[number,number]{const p=this.svg.createSVGPoint();p.x=x;p.y=y;const m=this.svg.getScreenCTM();if(!m)return [0,0];const q=p.matrixTransform(m.inverse());return[q.x,q.y];}
  private begin(){const p=[...this.pointers.values()];if(!p.length)return;const c:[number,number]=p.length>1?[(p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2]:[p[0].x,p[0].y];const hadMoved=this.gesture?.moved??false;this.gesture={startView:[...this.view],center:this.svgPoint(...c),startClient:c,distance:p.length>1?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0,moved:hadMoved||p.length>1};}
  private down=(e:PointerEvent)=>{if(e.button!==0&&e.pointerType==='mouse')return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.svg.setPointerCapture(e.pointerId);this.begin();};
  private move=(e:PointerEvent)=>{if(!this.pointers.has(e.pointerId)||!this.gesture)return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...this.pointers.values()],g=this.gesture,c:[number,number]=p.length>1?[(p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2]:[p[0].x,p[0].y];const displacement=Math.hypot(c[0]-g.startClient[0],c[1]-g.startClient[1]);if(displacement>5||p.length>1)g.moved=true;if(!g.moved)return;
    const scale=p.length>1&&g.distance>0?Math.max(.12,Math.min(8,g.distance/Math.max(5,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)))):1;const width=Math.max(25,Math.min(this.base[2]*8,g.startView[2]*scale));const k=width/g.startView[2];const height=g.startView[3]*k;const box=this.svg.getBoundingClientRect(),s=Math.min(box.width/g.startView[2],box.height/g.startView[3]);const dx=(c[0]-g.startClient[0])/s*k,dy=(c[1]-g.startClient[1])/s*k;
    this.view=[g.center[0]-(g.center[0]-g.startView[0])*k-dx,g.center[1]-(g.center[1]-g.startView[1])*k-dy,width,height];this.applyView();};
  private up=(e:PointerEvent)=>{if(!this.pointers.has(e.pointerId))return;const pick=this.pointers.size===1&&!this.gesture?.moved;this.pointers.delete(e.pointerId);try{this.svg.releasePointerCapture(e.pointerId);}catch{/* already released */}if(pick){const s=this.svgPoint(e.clientX,e.clientY);const p:[number,number]=[s[0],this.pattern.bounds.height-s[1]];if(inside(p,this.pattern.boundary))this.options.onPick?.(p);}if(this.pointers.size)this.begin();else this.gesture=undefined;};
  private cancel=(e:PointerEvent)=>{this.pointers.delete(e.pointerId);if(this.pointers.size)this.begin();else this.gesture=undefined;};
  private wheel=(e:WheelEvent)=>{e.preventDefault();const p=this.svgPoint(e.clientX,e.clientY),v=this.view;const width=Math.max(25,Math.min(this.base[2]*8,v[2]*Math.exp(Math.max(-.3,Math.min(.3,e.deltaY*.001))))),k=width/v[2];this.view=[p[0]-(p[0]-v[0])*k,p[1]-(p[1]-v[1])*k,width,v[3]*k];this.applyView();};
  dispose(){this.observer.disconnect();this.svg.removeEventListener('pointerdown',this.down);this.svg.removeEventListener('pointermove',this.move);this.svg.removeEventListener('pointerup',this.up);this.svg.removeEventListener('pointercancel',this.cancel);this.svg.removeEventListener('wheel',this.wheel);this.svg.remove();this.pointers.clear();}
}
