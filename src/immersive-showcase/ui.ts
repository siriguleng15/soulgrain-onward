export type PartId='cuff'|'tongue'|'pattern'|'clasps'|'heel'|'aglets'|'logo';
export type Quality='high'|'balanced'|'low';
export type ShowcaseMode='story'|'free';
export interface PartMeta {title?:string;eyebrow?:string;description?:string;material?:string;canUnfold?:boolean;unfolded?:boolean;}
export interface ShowcaseCallbacks {
 onPart:(part:PartId)=>void;onHome:()=>void;onMode:(mode:ShowcaseMode)=>void;
 onSkipIntro:()=>void;onRetry:()=>void;onFold?:(unfold:boolean)=>void;
 onQuality:(quality:Quality)=>void;onMotion:(enabled:boolean)=>void;
 onResetCamera?:()=>void;onReplayIntro?:()=>void;
}
export const PARTS:readonly {id:PartId;number:string;title:string;english:string;description:string;material:string;canUnfold?:boolean}[]=[
 {id:'cuff',number:'01',title:'翻筒',english:'THE FOLD',description:'两道横向缝线，让织物的起伏有了节奏。贴近看，再沿着原有结构展开。',material:'深藏蓝织物 / 绗缝 / 红色包边',canUnfold:true},
 {id:'tongue',number:'02',title:'鞋舌',english:'A QUIET RADIANCE',description:'紫色绒面承接细小光点。原图中的排钻，成为鞋舌上的一道清晰印记。',material:'紫色绒面 / 排钻 / 银色饰边'},
 {id:'pattern',number:'03',title:'鞋面纹样',english:'A LANGUAGE IN LINES',description:'星月、云线与蒙古纹样，从原始图稿进入鞋面。熟悉的符号，在行走中获得新的语境。',material:'深蓝帆布 / 米白印花'},
 {id:'clasps',number:'04',title:'双扣连接',english:'TWO POINTS. ONE CONNECTION.',description:'两枚金属扣头与柔性扣袢，连接翻筒与鞋身。光线掠过，让细小起伏变得可读。',material:'金属扣头 / 现有模型中的连接扣袢'},
 {id:'heel',number:'05',title:'后跟回纹',english:'THE REVERSE SIGNATURE',description:'转到鞋后，红色回纹皮条显露出来。一道鲜明的竖向线条，收住整体轮廓。',material:'红色 PU 皮条 / 米白回纹 / 缝线'},
 {id:'aglets',number:'06',title:'鞋带头',english:'THE FINAL PUNCTUATION',description:'深蓝纹样与银色端帽，把表达延伸到鞋带末端。留一点光，给最小的细节。',material:'纹样包覆 / 金属圈 / 银色端帽'},
 {id:'logo',number:'07',title:'后跟标识',english:'CARRY THE NAME',description:'Soulgrain、Onward、Nightfall。产品的名字，留在每一步最后显露的位置。',material:'后跟标识 / 橡胶围底'},
];
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));

/** DOM presentation only. The scene retains sole ownership of camera and
 * geometry state; rapid button changes are never queued into a UI timeline. */
export class ShowcaseUI {
 readonly root:HTMLElement;readonly canvasHost:HTMLDivElement;
 readonly chapterSections:HTMLElement[];
 private readonly callbacks:ShowcaseCallbacks;
 private readonly menu:HTMLDialogElement;
 private readonly focusPanel:HTMLElement;
 private focus?:PartId;private mode:ShowcaseMode='story';private motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 private ready=false;private intro=0;private previousFocus?:HTMLElement;
 private readonly keydown=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!this.menu.open&&this.focus)this.callbacks.onHome();};
 constructor(host:HTMLElement,callbacks:ShowcaseCallbacks){
  this.root=host;this.callbacks=callbacks;host.classList.add('sgx-app');host.dataset.state='loading';host.dataset.mode='story';host.dataset.chapter='0';host.setAttribute('aria-busy','true');
  host.innerHTML=`
   <a class="sgx-skip-link" href="#sgx-parts">跳至产品探索</a>
   <div class="sgx-atmosphere" aria-hidden="true"></div><div class="sgx-grain" aria-hidden="true"></div>
   <div class="sgx-canvas" data-ui="canvas"></div><div class="sgx-edge-light" aria-hidden="true"></div>
   <header class="sgx-header"><button class="sgx-brand" data-ui="home" aria-label="Soulgrain · 回到整鞋">SOULGRAIN<span>™</span></button><span class="sgx-edition"><i aria-hidden="true"></i> ONWARD / NIGHTFALL</span><button class="sgx-menu-trigger" data-ui="menu" aria-haspopup="dialog" aria-label="打开体验设置与素材署名"><span>INDEX</span><b aria-hidden="true">＋</b></button></header>
   <main class="sgx-story" aria-label="Soulgrain Onward 产品篇章">
    <section class="sgx-chapter sgx-chapter-hero" data-scroll-chapter="0" aria-labelledby="sgx-hero-title"><p class="sgx-runline">SOULGRAIN — INDEPENDENT FOOTWEAR — CHAPTER 01</p><div class="sgx-wordfield" aria-hidden="true">ONWARD</div><div class="sgx-hero-copy"><span class="sgx-kicker">FIRST EXPRESSION / NIGHTFALL</span><h1 id="sgx-hero-title">暗夜之中，<br><em>仍然向前。</em></h1><p>以蒙古元素为起点，<br>让文化走入日常。</p><button class="sgx-editorial-link" data-ui="discover">进入细节 <span aria-hidden="true">↘</span></button></div><span class="sgx-coordinate" aria-hidden="true">FORM / MEMORY / MOTION</span></section>
    <section class="sgx-chapter sgx-chapter-material" data-scroll-chapter="1" aria-labelledby="sgx-material-title"><div class="sgx-chapter-copy"><span class="sgx-kicker">02 / IN THE DETAILS</span><h2 id="sgx-material-title">让光线，<br>读懂材质。</h2><p>深藏蓝的织物，紫色的绒面。<br>金属与细小光点，等待一次靠近。</p><button class="sgx-editorial-link" data-ui="material-focus">探索鞋舌 <span aria-hidden="true">↗</span></button></div><span class="sgx-material-rail" aria-hidden="true">CANVAS &nbsp; / &nbsp; VELVET &nbsp; / &nbsp; METAL &nbsp; / &nbsp; LIGHT</span></section>
    <section class="sgx-chapter sgx-chapter-explore" data-scroll-chapter="2" aria-labelledby="sgx-explore-title"><div class="sgx-chapter-copy"><span class="sgx-kicker">03 / YOUR PERSPECTIVE</span><h2 id="sgx-explore-title">从你的角度，<br>继续探索。</h2><p>旋转，靠近，选择一个部位。<br>每处细节，都有自己的线索。</p><button class="sgx-editorial-link" data-ui="explore-free">自由观察 <span aria-hidden="true">↗</span></button></div><p class="sgx-explore-mark" aria-hidden="true">ROOTED IN SOUL.<br>BUILT TO MOVE.</p></section>
   </main>
   <div class="sgx-part-hint" data-ui="part-hint" aria-hidden="true"><span></span>点击鞋子上的部位</div>
   <aside class="sgx-focus" data-ui="focus" aria-label="产品部位详情" hidden><div class="sgx-focus-top"><button data-ui="focus-back" class="sgx-label-button">← 整鞋</button><span data-ui="focus-index">01 / 07</span><button class="sgx-icon-button" data-ui="focus-close" aria-label="关闭部位详情">×</button></div><p class="sgx-kicker" data-ui="focus-eyebrow"></p><h2 data-ui="focus-title"></h2><p class="sgx-focus-copy" data-ui="focus-description"></p><p class="sgx-focus-material" data-ui="focus-material"></p><div class="sgx-focus-actions"><button class="sgx-action" data-ui="fold" hidden>展开翻筒 <span aria-hidden="true">↗</span></button><button class="sgx-text-button" data-ui="focus-reset">重置视角</button></div><div class="sgx-focus-pagination"><button data-ui="previous" aria-label="查看上一个部位">← <span>PREV</span></button><span>EXPLORE THE OBJECT</span><button data-ui="next" aria-label="查看下一个部位"><span>NEXT</span> →</button></div></aside>
   <footer class="sgx-footer"><div class="sgx-footer-top"><div class="sgx-chapter-indicator"><span data-ui="chapter-number">01</span><i aria-hidden="true"></i><span data-ui="chapter-label">THE SILHOUETTE</span></div><p data-ui="gesture">滚动探索 · 拖动旋转 · 双指缩放</p><button class="sgx-mode" data-ui="mode" aria-pressed="false">自由观察 <span aria-hidden="true">↗</span></button></div><nav id="sgx-parts" class="sgx-parts" aria-label="选择产品部位">${PARTS.map(part=>`<button data-part="${part.id}" aria-pressed="false"><span>${part.number}</span>${part.title}</button>`).join('')}</nav><div class="sgx-scroll-progress" aria-hidden="true"><i data-ui="scroll-progress"></i></div></footer>
   <div class="sgx-arrival" data-ui="arrival" aria-live="off"><span class="sgx-arrival-label" data-ui="arrival-label">A CONSTELLATION OF DETAILS</span><div class="sgx-arrival-track"><i data-ui="intro-progress"></i></div><button data-ui="skip-intro" disabled>跳过开场 <span aria-hidden="true">↗</span></button></div>
   <div class="sgx-loading" data-ui="loading" role="status" aria-live="polite"><span class="sgx-loading-top">SOULGRAIN / ONWARD</span><div class="sgx-loading-name" aria-hidden="true">N<span>↑</span>GHTFALL</div><p data-ui="load-title">每一处细节，正在靠近。</p><div class="sgx-load-track"><i data-ui="load-progress"></i></div><div class="sgx-load-caption"><span data-ui="load-message">准备三维空间</span><span data-ui="load-percent">00%</span></div><button class="sgx-action" data-ui="retry" hidden>重新加载 ↗</button><small>真实三维模型 · 请稍候</small></div>
   <dialog class="sgx-menu" data-ui="menu-dialog" aria-labelledby="sgx-menu-title"><div class="sgx-menu-top"><span class="sgx-kicker">SOULGRAIN / EXPERIENCE INDEX</span><button class="sgx-icon-button" data-ui="menu-close" aria-label="关闭体验设置">×</button></div><h2 id="sgx-menu-title">选择你的观察方式。</h2><div class="sgx-menu-grid"><div><h3>THE OBJECT</h3><nav aria-label="全部产品部位">${PARTS.map(part=>`<button data-menu-part="${part.id}"><span>${part.number}</span>${part.title}<b aria-hidden="true">↗</b></button>`).join('')}</nav></div><div class="sgx-settings"><h3>THE EXPERIENCE</h3><label for="sgx-quality">画面质量</label><select id="sgx-quality" data-ui="quality"><option value="high">完整 · HIGH</option><option value="balanced" selected>均衡 · BALANCED</option><option value="low">轻量 · LOW</option></select><button class="sgx-setting-row" data-ui="motion" aria-pressed="${this.motion}"><span>环境动态</span><strong data-ui="motion-label">${this.motion?'开启':'关闭'}</strong></button><button class="sgx-setting-row" data-ui="replay-intro"><span>重看开场</span><strong>↗</strong></button><div class="sgx-edition-note"><span>01 / NIGHTFALL</span><p>当前展示配色。</p><span class="sgx-pending">02 / DAYTIME</span><p>设计尚未确定，暂不开放切换。</p></div><details class="sgx-credits"><summary>资产说明与署名</summary><p data-ui="asset-note">展示沿用仓库现有 Nightfall 彩色资产及原贴图，保留其中的连接扣袢结构。最新平皮条定位研究另行保留。</p><a href="https://siriguleng15.github.io/soulgrain-onward/onward-clasp-derivation/detachable-side.html" target="_blank" rel="noopener noreferrer">打开扣件与裁片研究 ↗</a><p>基础鞋模改编自 <a href="https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244" target="_blank" rel="noopener noreferrer">theunclerulez · Generic “Converse style” Sneakers</a>，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>。Soulgrain 版本已修改几何与材质。</p></details></div></div></dialog>
   <p class="sgx-sr-only" role="status" aria-live="polite" data-ui="status"></p>
  `;
  this.canvasHost=this.el<HTMLDivElement>('canvas');this.menu=this.el<HTMLDialogElement>('menu-dialog');this.focusPanel=this.el('focus');this.chapterSections=[...host.querySelectorAll<HTMLElement>('[data-scroll-chapter]')];
  this.el('home').onclick=()=>callbacks.onHome();this.el('menu').onclick=()=>this.openMenu();this.el('menu-close').onclick=()=>this.menu.close();
  this.menu.addEventListener('click',e=>{if(e.target===this.menu)this.menu.close();});this.menu.addEventListener('close',()=>this.previousFocus?.focus());
  for(const button of host.querySelectorAll<HTMLButtonElement>('[data-part]'))button.onclick=()=>callbacks.onPart(button.dataset.part as PartId);
  for(const button of host.querySelectorAll<HTMLButtonElement>('[data-menu-part]'))button.onclick=()=>{this.menu.close();callbacks.onPart(button.dataset.menuPart as PartId);};
  this.el('focus-back').onclick=this.el('focus-close').onclick=()=>callbacks.onHome();
  this.el('previous').onclick=()=>this.adjacent(-1);this.el('next').onclick=()=>this.adjacent(1);
  this.el('focus-reset').onclick=()=>callbacks.onResetCamera?.();
  this.el('fold').onclick=()=>callbacks.onFold?.(this.el('fold').dataset.unfolded!=='true');
  this.el('skip-intro').onclick=()=>{if(this.ready)callbacks.onSkipIntro();};this.el('retry').onclick=()=>callbacks.onRetry();
  this.el('mode').onclick=()=>callbacks.onMode(this.mode==='story'?'free':'story');this.el('explore-free').onclick=()=>callbacks.onMode('free');
  this.el('discover').onclick=()=>this.chapterSections[1].scrollIntoView({behavior:this.motion?'smooth':'auto'});
  this.el('material-focus').onclick=()=>callbacks.onPart('tongue');
  this.el<HTMLSelectElement>('quality').onchange=e=>callbacks.onQuality((e.target as HTMLSelectElement).value as Quality);
  this.el('motion').onclick=()=>callbacks.onMotion(!this.motion);
  this.el('replay-intro').onclick=()=>{this.menu.close();callbacks.onReplayIntro?.();};
  document.addEventListener('keydown',this.keydown);
 }
 private el<T extends HTMLElement=HTMLElement>(name:string){return this.root.querySelector<T>(`[data-ui="${name}"]`)!;}
 private adjacent(direction:number){const index=Math.max(0,PARTS.findIndex(part=>part.id===this.focus)),part=PARTS[(index+direction+PARTS.length)%PARTS.length];this.callbacks.onPart(part.id);}
 private openMenu(){this.previousFocus=document.activeElement as HTMLElement;this.menu.showModal();}
 setLoading(){this.ready=false;this.intro=0;this.root.dataset.state='loading';this.root.setAttribute('aria-busy','true');this.el('loading').removeAttribute('aria-hidden');this.el('load-title').textContent='每一处细节，正在靠近。';this.el<HTMLButtonElement>('retry').hidden=true;this.el<HTMLButtonElement>('skip-intro').disabled=true;this.setFocus(undefined);this.setMode('story');this.updateLoad(0);}
 updateLoad(progress:number){const p=clamp(progress);this.el('load-progress').style.transform=`scaleX(${p})`;this.el('load-percent').textContent=String(Math.round(p*100)).padStart(2,'0')+'%';this.el('load-message').textContent=p>=1?'布置灯光与材质':'载入 Nightfall 真实三维资产';}
 setReady(){this.ready=true;this.root.dataset.state='intro';this.el<HTMLButtonElement>('skip-intro').disabled=false;this.el('loading').setAttribute('aria-hidden','true');this.el('status').textContent='模型已加载。可跳过开场进入产品探索。';}
 setIntroProgress(progress:number){this.intro=clamp(progress);this.root.style.setProperty('--intro-progress',String(this.intro));this.el('intro-progress').style.transform=`scaleX(${this.intro})`;this.el('arrival-label').textContent=this.intro<.42?'A CONSTELLATION OF DETAILS':this.intro<.82?'TAKING FORM. MOVING FORWARD.':'SOULGRAIN / ONWARD';if(this.ready&&this.intro>=1){this.root.dataset.state='ready';this.root.setAttribute('aria-busy','false');this.el('status').textContent='Nightfall 已就绪。滚动浏览，或选择一个部位近看。';}}
 setFocus(part:PartId|undefined,meta:PartMeta={}){this.focus=part;this.root.dataset.focus=part??'';this.focusPanel.hidden=!part;this.root.classList.toggle('sgx-has-focus',Boolean(part));for(const button of this.root.querySelectorAll<HTMLButtonElement>('[data-part]'))button.setAttribute('aria-pressed',String(button.dataset.part===part));if(!part)return;
  const item=PARTS.find(p=>p.id===part)!;this.el('focus-index').textContent=`${item.number} / 07`;this.el('focus-eyebrow').textContent=meta.eyebrow??item.english;this.el('focus-title').textContent=meta.title??item.title;this.el('focus-description').textContent=meta.description??item.description;this.el('focus-material').textContent=meta.material??item.material;
  const unfold=meta.canUnfold??item.canUnfold??false,fold=this.el<HTMLButtonElement>('fold');fold.hidden=!unfold;fold.dataset.unfolded=String(Boolean(meta.unfolded));fold.innerHTML=meta.unfolded?'收回翻筒 <span aria-hidden="true">↘</span>':'展开翻筒 <span aria-hidden="true">↗</span>';this.el('status').textContent=`已聚焦${meta.title??item.title}。可拖动观察、查看相邻部位或返回整鞋。`;
 }
 setMode(mode:ShowcaseMode){this.mode=mode;this.root.dataset.mode=mode;document.body.classList.toggle('sgx-free',mode==='free');this.el('mode').setAttribute('aria-pressed',String(mode==='free'));this.el('mode').innerHTML=mode==='free'?'返回篇章 <span aria-hidden="true">↙</span>':'自由观察 <span aria-hidden="true">↗</span>';this.el('gesture').textContent=mode==='free'?'拖动旋转 · 双指 / 滚轮缩放 · 点击部位':'滚动探索 · 拖动旋转 · 双指缩放';}
 setChapter(index:number,progress=0){index=Math.max(0,Math.min(2,Math.floor(index)));this.root.dataset.chapter=String(index);this.el('chapter-number').textContent='0'+(index+1);this.el('chapter-label').textContent=['THE SILHOUETTE','IN THE DETAILS','YOUR PERSPECTIVE'][index];this.el('scroll-progress').style.transform=`scaleX(${clamp((index+clamp(progress))/3)})`;}
 setQuality(quality:Quality){this.el<HTMLSelectElement>('quality').value=quality;this.root.dataset.quality=quality;}
 setMotion(enabled:boolean){this.motion=enabled;this.el('motion').setAttribute('aria-pressed',String(enabled));this.el('motion-label').textContent=enabled?'开启':'关闭';this.root.dataset.motion=enabled?'on':'off';}
 setAssetNote(note:string){this.el('asset-note').textContent=note;}
 setTransitioning(busy:boolean){this.root.dataset.transitioning=String(busy);}
 showError(message:string){this.root.dataset.state='error';this.root.setAttribute('aria-busy','false');this.el('loading').removeAttribute('aria-hidden');this.el('load-title').textContent='三维空间暂时未能打开。';this.el('load-message').textContent=message;this.el<HTMLButtonElement>('retry').hidden=false;this.el('status').textContent=message;}
 getState(){return{ready:this.ready,introProgress:this.intro,focus:this.focus??null,mode:this.mode,state:this.root.dataset.state,chapter:Number(this.root.dataset.chapter),quality:this.root.dataset.quality,motion:this.motion};}
 dispose(){document.removeEventListener('keydown',this.keydown);this.menu.close();document.body.classList.remove('sgx-free');this.root.replaceChildren();}
}
