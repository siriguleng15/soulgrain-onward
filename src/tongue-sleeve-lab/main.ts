import './style.css';
import {AssetScene} from './AssetScene.ts';
import {FINGERS} from './HandInspection.ts';
import type {Finger} from './HandInspection.ts';
const names=['拇指','食指','中指','无名指','小指'];
const app=document.getElementById('app')!;
app.innerHTML=`<header><div><b>SOULGRAIN</b><small>ONWARD / TONGUE × HORSESHOE CUFF</small></div><span>阶段 01 · 资产分离与银钻绑定</span><small id="status" role="status">正在核验源资产…</small></header>
<main><section class="viewport"><div id="stage"></div><div class="stage-label" id="stage-label">原鞋舌几何保留 · 章内翻面空白布处理</div><div class="stage-bottom">拖动旋转 · 双指缩放<span>INSPECTION CAMERA</span></div><div id="error" role="alert" hidden></div></section>
<aside><div class="notice"><strong>输入已收到 · 先处理资产</strong><p>先保留鞋舌几何并清理翻面图案；使用用户新提供的连体蒙古袍手模，拆出马蹄袖，同时保留手和下方袍袖。可检查拆袖、手指关节与袖面弯曲绑定；19秒接触演出尚未制作完成。</p></div>
<section><h2>源资产</h2><div class="tabs"><button data-kind="shoe" aria-pressed="true">鞋子</button><button data-kind="hand">蒙古袍手模</button></div><p id="source-summary"></p><button id="frame">重新取景</button></section>
<section id="shoe-tools"><h2>鞋舌图元隔离</h2><label class="check"><input id="blank-tongue" type="checkbox" checked>鞋舌翻面空白布</label><label>查看部件<select id="primitive"><option value="all">完整鞋子</option></select></label><p class="hint">Convertible_Tongue 同时含鞋舌正／背面与 Body_Canvas。必须逐图元检查，不能直接隐藏整个父节点。</p></section>
<section id="hand-tools" hidden><h2>手部资产</h2><label>部件检查<select id="hand-view"><option value="assembled">组装 · 带银钻马蹄袖</option><option value="without-cuff">拆袖 · 保留手与蒙古袍袖</option><option value="cuff-only">单独马蹄袖与银钻</option><option value="source">原始连体模型对照</option></select></label><label class="check"><input type="checkbox" id="silver" checked>显示同一套银色烫钻</label><div class="tabs"><button data-view="top">外表面</button><button data-view="side">侧面</button><button data-view="quarter">斜侧</button></div><label>袖面弯曲／银钻绑定测试 <input id="cuff-bend" type="range" min="0" max="1" step="0.01" value="0"></label><p class="hint">此项验证同一套银钻跟随真实网格弯曲，不代表已完成翻袖分镜。</p><p id="rig-notice"></p><div id="finger-controls">${FINGERS.map((finger,i)=>`<label>${names[i]}<input type="range" min="0" max="1" step="0.01" value="0" data-finger="${finger}" aria-label="${names[i]}屈曲"></label>`).join('')}<label class="check"><input id="bones" type="checkbox">显示现有骨骼</label><button id="reset-hand">恢复原始手姿</button></div><p class="hint">分离马蹄袖、补充手指骨骼后才开始接触和翻袖动作；不以裸手替换该模型。</p></section>
<section><h2>本章制作约束</h2><p>同一袖面与同一套银钻贯穿翻袖、留存和水晶变化。14.5 秒响指前，水晶覆盖必须为零。</p><p>原 GLB、UV、纹理及其他章节保持原样。最终轮廓和水晶区域已按新图记录；装鞋贴合仍需制作验证。</p></section>
<footer>本章主手模：用户提供 hand modle.glb。原文件独立保留。</footer></aside></main>`;
let lab:AssetScene;
const status=document.getElementById('status')!,primitive=document.getElementById('primitive') as HTMLSelectElement;
function sync(){if(!lab)return;if(lab.contextLost)status.textContent='图形上下文暂时丢失，等待浏览器恢复…';else if(lab.ready)status.textContent=Object.keys(lab.verified).length===4?'源资产与派生袖面 SHA 已核验':'模型已载入 · SHA 由构建脚本核验';const hand=lab.kind==='hand';document.getElementById('shoe-tools')!.hidden=hand;document.getElementById('hand-tools')!.hidden=!hand;
 document.getElementById('finger-controls')!.hidden=!lab.hand;document.getElementById('rig-notice')!.textContent=lab.hand?'用户手模新建 22 关节 · 确定性姿态测试':'手、袍袖和马蹄袖已分离；袖口下缺失布面已补为袍袖。原模型没有骨骼，抓取绑定尚在制作。';
 for(const b of app.querySelectorAll<HTMLButtonElement>('[data-kind]'))b.setAttribute('aria-pressed',String(b.dataset.kind===lab.kind));
 document.getElementById('stage-label')!.textContent=hand?'用户蒙古袍手模 · 拆袖后仍保留袍袖 · 银钻绑定真实袖面':'原鞋舌几何保留 · 章内翻面空白布处理';
 document.getElementById('source-summary')!.textContent=hand?(lab.hand?`${lab.hand.bones.size} 根骨骼`:'用户手模派生分离 / 785 颗同一银钻 / 直径约 75 mm'):'原 ONWARD 彩色 GLB / '+lab.entries.length+' 个材质图元';
}
lab=new AssetScene(document.getElementById('stage')!,sync);
for(const button of app.querySelectorAll<HTMLButtonElement>('[data-kind]'))button.onclick=()=>lab.setKind(button.dataset.kind as 'shoe'|'hand');
document.getElementById('hand-view')!.onchange=e=>lab.setHandView((e.target as HTMLSelectElement).value as import('./CuffActor.ts').HandView);
document.getElementById('cuff-bend')!.oninput=e=>lab.setBend(Number((e.target as HTMLInputElement).value));
document.getElementById('silver')!.onchange=e=>lab.setSilver((e.target as HTMLInputElement).checked);for(const button of app.querySelectorAll<HTMLButtonElement>('[data-view]'))button.onclick=()=>lab.viewFrom(button.dataset.view as 'quarter'|'top'|'side');
document.getElementById('blank-tongue')!.onchange=e=>lab.setTongueBlank((e.target as HTMLInputElement).checked);primitive.onchange=()=>lab.select(primitive.value);document.getElementById('frame')!.onclick=()=>lab.frameSubject();
for(const input of app.querySelectorAll<HTMLInputElement>('[data-finger]'))input.oninput=()=>lab.setCurl(input.dataset.finger as Finger,Number(input.value));
document.getElementById('bones')!.onchange=e=>{if(lab.helper){lab.helper.visible=(e.target as HTMLInputElement).checked;lab.setCurl('thumb',lab.hand?.curls.thumb??0);}};
document.getElementById('reset-hand')!.onclick=()=>{lab.resetHand();for(const input of app.querySelectorAll<HTMLInputElement>('[data-finger]'))input.value='0';};
const api={lab,state:()=>lab.state(),setCurl:(finger:Finger,value:number)=>lab.setCurl(finger,value),resetHand:()=>lab.resetHand(),setKind:(kind:'shoe'|'hand')=>lab.setKind(kind)};
(window as unknown as{__tongueAssets:typeof api}).__tongueAssets=api;
void lab.load().then(()=>{status.textContent=Object.keys(lab.verified).length===4?'源资产与派生袖面 SHA 已核验':'源资产已载入（完整 SHA 见构建检查）';
 for(const entry of lab.entries.filter(e=>[4,5,27,28].includes(e.node))){const option=document.createElement('option');option.value=entry.key;option.textContent=`${entry.nodeName} · ${entry.material}`;primitive.append(option);}sync();
}).catch(error=>{status.textContent='资产检查失败';const el=document.getElementById('error')!;el.hidden=false;el.textContent=String(error);});
window.addEventListener('pagehide',()=>lab.dispose(),{once:true});
