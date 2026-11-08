import './style.css';
import{DerivationScene}from'./Scene.ts';
import{DURATION,SHOTS,shotAt,proofCaption}from'./construction.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
 <header><a class="brand" href="#" aria-label="Soulgrain">SOULGRAIN<span>ONWARD / GEOMETRY STUDY 01</span></a><div class="edition">THE HIDDEN PROPORTION <i>φ</i></div><span id="identity">SOURCE / VERIFYING</span></header>
 <main>
  <section id="stage" aria-label="三维鞋模推导演示">
   <div id="scene"></div>
   <div class="eyebrow">FROM A SINGLE SEAM<br><span>一条缝线，展开比例的秩序。</span></div>
   <div class="chapter"><span id="chapter-en"></span><h1 id="chapter-title"></h1><p id="chapter-detail"></p></div>
   <div id="proof-card" hidden aria-live="off"><span id="proof-title"></span><p id="proof-detail"></p></div>
   <div class="view-hint"><span id="owner">导演镜头</span><b>拖动旋转 · 双指缩放</b></div>
   <div id="loading" role="status"><span class="loader-symbol">φ</span><p id="loading-text">正在读取模型…</p></div>
   <div id="error" hidden role="alert"><p id="error-text"></p><button id="retry">重新载入</button></div>
  </section>
  <section class="transport" aria-label="动画控制">
   <div class="timeline-row"><span id="clock">00.0</span><input id="timeline" type="range" min="0" max="${DURATION}" step="0.01" value="0" aria-label="动画进度"><span class="duration">01:13</span></div>
   <div class="controls">
    <div class="playback"><button id="play" class="primary" disabled>播放</button><button id="pause" disabled>暂停</button><button id="replay" disabled>重播</button><button id="reverse" disabled>倒放</button><button id="reset" disabled>复位</button></div>
    <div class="options"><label class="speed">速度<select id="speed" aria-label="播放速度"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="3">3×</option></select></label><button id="director" disabled>导演镜头</button><button id="free" disabled>自由观察</button><button id="settings" aria-expanded="false">图层</button></div>
   </div>
   <div id="layers" hidden><label><input type="checkbox" id="guides" checked> 推导线条</label><label><input type="checkbox" id="seam" checked> 缝线基准</label><p>三维线条与原鞋体独立；原 GLB、UV 和几何保持不变。</p></div>
  </section>
  <nav aria-label="分镜定位">${SHOTS.map((s,i)=>`<button data-shot="${i}" disabled><span>${String(i+1).padStart(2,'0')}</span>${s.label.slice(3)}</button>`).join('')}</nav>
  <footer><span>SOULGRAIN / DESIGN IN MOTION</span><span>实时 3D · 原始 xiezitu 模型 · 双黄金螺旋</span><a href="./golden-derivation/review.html">查看验证画面 ↗</a></footer>
 </main>`;
const get=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const lab=new DerivationScene(get('scene'),update);
function update(){
 const s=lab.snapshot(),shot=shotAt(s.time),proof=proofCaption(s.time);get('proof-card').hidden=s.time<20||s.time>=68;get('proof-title').textContent=proof.title;get('proof-detail').textContent=proof.detail;get('clock').textContent=s.time.toFixed(1).padStart(4,'0');get<HTMLInputElement>('timeline').value=String(s.time);
 get('chapter-en').textContent=shot.en;get('chapter-title').textContent=shot.label;get('chapter-detail').textContent=shot.text;
 get('owner').textContent=s.cameraOwner==='director'?'导演镜头':'自由观察 / 已暂停';get('play').textContent=s.playing?'正在播放':'播放';get('play').classList.toggle('active',s.playing);
 document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach((b,i)=>{b.classList.toggle('current',SHOTS[i].id===shot.id);b.setAttribute('aria-current',SHOTS[i].id===shot.id?'step':'false');});
 get('identity').textContent=s.verified?'V1.2 / ORIGINAL GLB VERIFIED':'SOURCE / VERIFYING';
}
get('play').onclick=()=>lab.play();get('pause').onclick=()=>lab.pause();get('replay').onclick=()=>{lab.reset();lab.play();};get('reverse').onclick=()=>lab.play(true);get('reset').onclick=()=>lab.reset();
get<HTMLInputElement>('timeline').oninput=e=>{const time=Number((e.target as HTMLInputElement).value);lab.pause();lab.seek(time);};
get<HTMLSelectElement>('speed').onchange=e=>{lab.speed=Number((e.target as HTMLSelectElement).value);};
get('director').onclick=()=>lab.directorView();get('free').onclick=()=>lab.free();
get('settings').onclick=()=>{const hidden=!get('layers').hidden;get('layers').hidden=hidden;get('settings').setAttribute('aria-expanded',String(!hidden));};
get<HTMLInputElement>('guides').onchange=e=>lab.setGuides((e.target as HTMLInputElement).checked);
get<HTMLInputElement>('seam').onchange=e=>lab.setSeam((e.target as HTMLInputElement).checked);
document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach(b=>b.onclick=()=>{lab.pause();lab.directorView();lab.seek(SHOTS[Number(b.dataset.shot)].at);});
get('retry').onclick=()=>location.reload();
get('scene').addEventListener('lab-context',(event)=>{const lost=(event as CustomEvent).detail==='lost';get('error').hidden=!lost;get('error-text').textContent='三维上下文已暂停；恢复后会保留当前进度。也可以重新载入。';});
get('stage').addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement)return;if(e.code==='Space'){e.preventDefault();lab.playing?lab.pause():lab.play();}if(e.key==='ArrowRight'){lab.pause();lab.seek(lab.time+.5);}if(e.key==='ArrowLeft'){lab.pause();lab.seek(lab.time-.5);}});
let rejected=false;
lab.load(import.meta.env.BASE_URL,text=>get('loading-text').textContent=text).then(()=>{
 get('loading').hidden=true;document.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.disabled=false);update();
 const q=new URLSearchParams(location.search);if(q.has('t'))lab.seek(Number(q.get('t'))||0);
 if(q.get('autoplay')==='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)lab.play();
}).catch(e=>{rejected=true;get('loading').hidden=true;get('error').hidden=false;get('error-text').textContent=String(e instanceof Error?e.message:e);});
// Reproducible browser QA and frame capture; all controls call the same scene.
Object.assign(window,{__goldenLab:{lab,state:()=>({...lab.snapshot(),rejected}),seek:(t:number)=>lab.seek(t),dispose:()=>lab.dispose()}});
window.addEventListener('pagehide',()=>lab.pause());
