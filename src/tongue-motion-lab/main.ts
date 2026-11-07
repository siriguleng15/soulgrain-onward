import './style.css';
import { MotionScene } from './MotionScene.ts';
import { SHOTS } from '../tongue-sleeve-lab/ChapterContract.ts';
const app = document.getElementById('app')!;
app.innerHTML = `<header><div><b>SOULGRAIN</b><small>ONWARD / NIGHTFALL</small></div><span>TONGUE MOTION LAB <em>V1.1</em></span><small id="status" role="status">正在载入鞋模、手部与连续形变…</small></header>
<main><section class="viewport"><div id="stage"></div><div class="scene-top">02 — TONGUE / THE HORSESHOE CUFF</div><div id="error" role="alert" hidden></div><div class="scene-bottom"><div><small id="shot-number">SHOT 00</small><h1 id="shot-title">素帆布初始展示</h1></div><span id="camera-label">导演镜头</span></div></section>
<aside><section><div class="section-head"><h2>时间轴</h2><output id="time">0.00 / 19.00 s</output></div><div class="row"><button id="play" class="primary">播放</button><button id="pause">暂停</button><button id="replay">重播</button></div><label for="timeline">动画进度</label><input id="timeline" type="range" min="0" max="19" step=".01" value="0" aria-label="动画进度"><div class="row small-row"><select id="speed" aria-label="播放速度"><option value=".25">0.25×</option><option value=".5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="3">3×</option></select><button id="reverse">独立倒放</button><button id="reset">取消／复位</button></div></section>
<section><h2>分镜定位</h2><div class="shots">${SHOTS.map(s => `<button data-time="${s.id === '09' ? 19 : s.start}" data-shot="${s.id}"><span>${s.id}</span>${s.title}</button>`).join('')}</div></section>
<section><h2>镜头</h2><p>拖动鞋子进入自由观察，双指或滚轮缩放；拖动时间轴可从任意角度检查动作。</p><button id="director">恢复导演镜头</button><label class="check"><input type="checkbox" id="wire">显示袖面网格</label></section>
<section class="metrics"><h2>接触与状态检查</h2><p id="metric">正在准备</p><p>银钻从手登场时已经存在。响指只改变周围布面，结尾定格，倒放由独立按钮控制。</p></section>
<footer>独立动画实验室 · 艺术审核版本<br>原始鞋模、手模和正式页面保持原样。<br>逐段形变为预制动画，不是实时布料物理模拟。</footer></aside></main>`;
let lab: MotionScene;
const slider = document.getElementById('timeline') as HTMLInputElement, status = document.getElementById('status')!;
function sync() {
    if (!lab)
        return;
    const s = lab.state();
    if (!s.ready)
        status.textContent = s.loadingStage + ' · ' + (s.loadedBytes / 1048576).toFixed(1) + ' MB';
    document.getElementById('time')!.textContent = s.time.toFixed(2) + ' / 19.00 s';
    if (document.activeElement !== slider)
        slider.value = String(s.time);
    document.getElementById('shot-number')!.textContent = 'SHOT ' + s.shot.id;
    document.getElementById('shot-title')!.textContent = s.shot.title;
    document.getElementById('camera-label')!.textContent = s.cameraOwner === 'user' ? (s.playing ? '自由观察 · 播放中' : '自由观察 · 已暂停') : s.cameraOwner === 'handoff' ? '返回导演镜头' : '导演镜头';
    document.getElementById('play')!.textContent = s.playing ? (s.direction > 0 ? '正向播放' : '倒放中') : '播放';
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-shot]'))
        button.setAttribute('aria-current', String(button.dataset.shot === s.shot.id));
    const contact = s.time >= 3.6 && s.time <= 6 ? `模型捏取点距离：食指 ${s.gripContactMm.indexGripMm.toFixed(2)} mm / 拇指 ${s.gripContactMm.thumbGripMm.toFixed(2)} mm` : '逐帧观察：可暂停、倒看并自由旋转';
    document.getElementById('metric')!.textContent = `${contact}。银钻 ${s.silverCount}，水晶进度 ${Math.round(s.crystalFront * 100)}%。`;
    if (s.contextLost)
        status.textContent = '图形上下文丢失 · 已暂停';
    else if (s.ready)
        status.textContent = 'LIVE 3D / 独立章节';
}
for (const field of app.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('button,input,select'))
    field.disabled = true;
async function start() {
    lab = new MotionScene(document.getElementById('stage')!, sync);
    document.getElementById('play')!.onclick = () => lab.play(1);
    document.getElementById('pause')!.onclick = () => lab.pause();
    document.getElementById('replay')!.onclick = () => lab.replay();
    document.getElementById('reverse')!.onclick = () => lab.play(-1);
    document.getElementById('reset')!.onclick = () => lab.reset();
    document.getElementById('director')!.onclick = () => lab.restoreCamera();
    slider.oninput = () => lab.seek(Number(slider.value));
    document.getElementById('speed')!.onchange = e => lab.speed = Number((e.target as HTMLSelectElement).value);
    document.getElementById('wire')!.onchange = e => {
        if (lab.ready) {
            lab.crystal.material.wireframe = (e.target as HTMLInputElement).checked;
            lab.renderAt(lab.time);
        }
    };
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-time]'))
        button.onclick = () => lab.seek(Number(button.dataset.time));
    const api = { lab, state: () => lab.state(), renderAt: (t: number, director = false) => { lab.pause(); lab.renderAt(t, director); return lab.revision; }, play: (direction = 1) => lab.play(direction), pause: () => lab.pause(), reset: () => lab.reset() };
    (window as unknown as {
        __tongueMotion: typeof api;
    }).__tongueMotion = api;
    await lab.load();
    sync();
    for (const field of app.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('button,input,select'))
        field.disabled = false;
    if (new URLSearchParams(location.search).get('autoplay') !== '0' && !matchMedia('(prefers-reduced-motion:reduce)').matches)
        lab.play();
    window.addEventListener('pagehide', () => lab.dispose(), { once: true });
}
void start().catch(error => { if (lab)
    lab.ready = false; status.textContent = '章节加载失败'; const el = document.getElementById('error')!; el.hidden = false; el.textContent = String(error); });
