import type { NodeId } from '../types';
import { branches, pathTo, tree } from '../tree';

export class AdUI {
  readonly canvasHost:HTMLDivElement;
  readonly hotspot:HTMLButtonElement;
  readonly overlay:HTMLDivElement;
  private readonly title:HTMLHeadingElement;
  private readonly index:HTMLElement;
  private readonly description:HTMLElement;
  private readonly action:HTMLButtonElement;
  private readonly parent:HTMLButtonElement;
  private readonly crumbs:HTMLElement;
  private readonly progress:HTMLElement;
  private readonly status:HTMLElement;
  private readonly drawer:HTMLDialogElement;
  private current:NodeId='ROOT';private busy=false;private initialized=false;
  private requested:(id:NodeId)=>void=()=>{};
  constructor(readonly root:HTMLElement) {
    root.innerHTML=`
      <div id="ad-canvas" class="ad-canvas"></div><div class="ad-vignette" aria-hidden="true"></div>
      <header class="ad-header"><button class="ad-brand" id="ad-brand" aria-label="SOULGRAIN · 回到整鞋">SOULGRAIN<sup>™</sup></button><span class="ad-edition">ONWARD / NIGHTFALL</span><button class="ad-menu" id="ad-menu" aria-haspopup="dialog">探索目录 <span aria-hidden="true">＋</span></button></header>
      <main class="ad-editorial" aria-label="产品叙事"><p class="ad-index" id="ad-index">ONWARD / NIGHTFALL</p><h1 id="ad-title">向前。<br>也向来处。</h1><p class="ad-description" id="ad-description">一双鞋，一段可以亲自展开的故事。</p></main>
      <button class="ad-hotspot" id="ad-hotspot" aria-label="聚焦翻筒"><span class="ad-hotspot-dot" aria-hidden="true"></span><span>翻筒 <b aria-hidden="true">↗</b></span></button>
      <div class="ad-annotations" id="ad-annotations" aria-label="蒙古包与翻筒的结构注释">
        <svg id="ad-leaders" aria-hidden="true"><g>${[0,1,2,3].map(i=>`<path id="ad-leader-${i}"/><circle id="ad-pin-${i}" r="2.4"/>`).join('')}</g></svg>
        ${[['哈那','交叉格架，形成围墙的骨架。'],['乌尼','连接围墙上缘与顶部的杆件。'],['陶脑','顶部圆形结构，汇聚乌尼。'],['横向束带','两道翻筒缝线，对应横向约束的设计联系。']].map(([name,text],i)=>`<div class="ad-note" id="ad-note-${i}" style="--note:${i}"><span class="ad-note-number">0${i+1}</span><h2>${name}</h2><p>${text}</p></div>`).join('')}
      </div>
      <footer class="ad-footer"><div class="ad-location"><nav id="ad-crumbs" aria-label="当前叙事路径"></nav><p class="ad-gesture" id="ad-gesture">单指旋转 · 双指缩放 · 点选翻筒</p></div><div class="ad-actions"><button class="ad-back" id="ad-back" hidden>← 返回上一层</button><button class="ad-action" id="ad-action">探索翻筒 <span aria-hidden="true">↗</span></button></div><div class="ad-utilities"><button id="ad-home" aria-label="回到整鞋">整鞋</button><button id="ad-replay" aria-label="重新演示当前节点">回放</button><button id="ad-motion" aria-pressed="true">动态 开</button></div></footer>
      <div class="ad-progress" aria-hidden="true"><div id="ad-progress"></div></div><p id="ad-status" class="ad-sr-only" role="status" aria-live="polite"></p>
      <div class="ad-overlay" id="ad-overlay" role="status" aria-live="polite"><p class="ad-loading-brand">SOULGRAIN™</p><h2>每一处，皆有来处。</h2><div class="ad-loading-line"><span id="ad-load-progress"></span></div><p id="ad-load-text">正在准备 Nightfall 三维空间…</p><button id="ad-retry" hidden>重新加载</button></div>
      <dialog class="ad-drawer" id="ad-drawer"><div class="ad-drawer-heading"><p>探索 ONWARD</p><button id="ad-close-menu" aria-label="关闭探索目录">×</button></div><p class="ad-drawer-intro">从一个部件，进入一段设计。</p><nav aria-label="产品叙事分支">${branches.map(branch=>`<button data-branch="${branch.id}" ${branch.available?'':'disabled'}><span>${branch.id}</span><strong>${branch.name}</strong><small>${branch.available?branch.subtitle:'待拓展'}</small>${branch.available?'<b aria-hidden="true">↗</b>':''}</button>`).join('')}</nav><p class="ad-drawer-footnote">本版开放翻筒完整篇章。<br>其余分支保留结构，尚未演出。</p><details class="ad-credits"><summary>素材署名</summary><p>基础鞋模改编自 <a href="https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244" target="_blank" rel="noopener noreferrer">theunclerulez · Generic “Converse style” Sneakers</a>，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>。SoulGrain 已修改几何与材质，本广告另增几何动画数据。</p></details></dialog>
    `;
    const el=<T extends HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
    this.canvasHost=el('ad-canvas');this.hotspot=el('ad-hotspot');this.overlay=el('ad-overlay');
    this.title=el('ad-title');this.index=el('ad-index');this.description=el('ad-description');this.action=el('ad-action');this.parent=el('ad-back');
    this.crumbs=el('ad-crumbs');this.progress=el('ad-progress');this.status=el('ad-status');this.drawer=el('ad-drawer');
    this.action.onclick=()=>this.requested(tree[this.current].next??'ROOT');
    this.parent.onclick=()=>this.requested(tree[this.current].parent??'ROOT');
    el('ad-brand').onclick=()=>this.requested('ROOT');this.hotspot.onclick=()=>this.requested('A1');el('ad-home').onclick=()=>this.requested('ROOT');
    el('ad-menu').onclick=()=>this.drawer.showModal();el('ad-close-menu').onclick=()=>this.drawer.close();
    this.drawer.addEventListener('click',event=>{if(event.target===this.drawer)this.drawer.close();});
    root.querySelector('[data-branch="A"]')!.addEventListener('click',()=>{this.drawer.close();this.requested('A1');});
    this.crumbs.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-node]');if(button)this.requested(button.dataset.node as NodeId);});
    el('ad-retry').onclick=()=>location.reload();
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!this.drawer.open)this.requested(tree[this.current].parent??'ROOT');});
  }
  bind(navigate:(id:NodeId)=>void,replay:()=>void,motion:()=>void) {
    this.requested=navigate;this.root.querySelector('#ad-replay')!.addEventListener('click',replay);this.root.querySelector('#ad-motion')!.addEventListener('click',motion);
  }
  loading(ratio:number){(this.root.querySelector('#ad-load-progress') as HTMLElement).style.transform=`scaleX(${ratio})`;this.root.querySelector('#ad-load-text')!.textContent=ratio<1?`正在载入 Nightfall · ${Math.round(ratio*100)}%`:'正在布置灯光与材质…';}
  ready(){this.overlay.classList.add('is-ready');setTimeout(()=>{this.overlay.hidden=true;},700);}
  failure(message:string){this.overlay.hidden=false;this.overlay.classList.remove('is-ready');this.root.querySelector('#ad-load-text')!.textContent=message;(this.root.querySelector('#ad-retry') as HTMLButtonElement).hidden=false;}
  update(id:NodeId,busy:boolean,progress:number){
    this.progress.style.transform=`scaleX(${busy?progress:0})`;this.root.classList.toggle('is-narrating',busy);
    if(!this.initialized||this.current!==id||this.busy!==busy){
      this.initialized=true;
      this.current=id;this.busy=busy;const node=tree[id];this.root.dataset.node=id;this.root.dataset.busy=String(busy);
      this.title.innerHTML=node.title.split('\n').join('<br>');this.index.textContent=node.index;this.description.innerHTML=node.description.split('\n').join('<br>');
      this.root.dataset.chapter=id==='ROOT'?'root':id==='A1'?'focus':id==='A1.1'?'flat':'pair';
      this.action.innerHTML=`${node.action}<span aria-hidden="true">${node.next?'↗':'↺'}</span>`;this.action.disabled=busy;
      this.parent.hidden=!node.parent;this.parent.disabled=false;
      (this.root.querySelector('#ad-replay') as HTMLButtonElement).disabled=busy||id==='ROOT';
      this.crumbs.innerHTML=pathTo(id).map((n,i)=>`${i?'<span aria-hidden="true">/</span>':''}<button data-node="${n}" ${n===id?'aria-current="step"':''}>${n==='ROOT'?'整鞋':n}</button>`).join('');
      this.status.textContent=busy?`正在演示：${node.index}`:`${node.index}。演示完成，可继续探索。`;
    }
    this.hotspot.hidden=id!=='ROOT'||busy;
  }
  hotspotAt(x:number,y:number,visible:boolean){const width=this.canvasHost.clientWidth,height=this.canvasHost.clientHeight;this.hotspot.style.left=`${Math.max(14,Math.min(width-155,x))}px`;this.hotspot.style.top=`${Math.max(90,Math.min(height-130,y))}px`;this.hotspot.style.visibility=visible?'visible':'hidden';}
  motion(reduced:boolean){const b=this.root.querySelector('#ad-motion')!;b.setAttribute('aria-pressed',String(!reduced));b.textContent=reduced?'动态 减':'动态 开';}
  notes(amount:number,points:{x:number;y:number}[],width:number,height:number){
    const layer=this.root.querySelector<HTMLElement>('#ad-annotations')!;layer.style.visibility=amount>.01?'visible':'hidden';
    for(let i=0;i<4;i++){
      const alpha=Math.max(0,Math.min(1,amount-i));const note=this.root.querySelector<HTMLElement>('#ad-note-'+i)!;note.style.opacity=String(alpha);note.style.transform=`translateY(${(1-alpha)*10}px)`;
      const endX=width*.825,endY=height*(.24+i*.16);const start=points[i]??{x:0,y:0};
      const path=this.root.querySelector<SVGPathElement>('#ad-leader-'+i)!;path.setAttribute('d',`M${start.x},${start.y} L${endX-24},${endY} H${endX-5}`);path.style.opacity=String(alpha*.65);
      const pin=this.root.querySelector<SVGCircleElement>('#ad-pin-'+i)!;pin.setAttribute('cx',String(start.x));pin.setAttribute('cy',String(start.y));pin.style.opacity=String(alpha);
    }
  }
}
