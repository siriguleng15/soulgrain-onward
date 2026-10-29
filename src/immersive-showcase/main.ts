import './style.css';
import {ShowcaseScene} from './Scene.ts';
import {ShowcaseUI} from './ui.ts';
import type {PartId,Quality,ShowcaseMode} from './ui.ts';
const host=document.getElementById('app')!;
let scene:ShowcaseScene|undefined,ui:ShowcaseUI,lastIntro=-1,lastFocus:string|undefined,lastBusy:boolean|undefined;
function synchronize(){if(!scene)return;if(scene.introProgress!==lastIntro){ui.setIntroProgress(scene.introProgress);lastIntro=scene.introProgress;}const focus=`${scene.focusPart??''}:${scene.unfold>.5}`;if(focus!==lastFocus){ui.setFocus(scene.focusPart,{unfolded:scene.unfold>.5});lastFocus=focus;}const busy=scene.isTransitioning;if(busy!==lastBusy){ui.setTransitioning(busy);lastBusy=busy;}}
function selectPart(id:PartId){const result=scene?.selectPart(id);synchronize();return result??false;}
function home(){scene?.home();ui.setFocus(undefined);synchronize();}
function setMode(mode:ShowcaseMode){scene?.setMode(mode);ui.setMode(mode);synchronize();}
function replayIntro(){lastIntro=-1;window.scrollTo({top:0,behavior:'instant'});scene?.replayIntro();ui.setFocus(undefined);ui.setMode('story');ui.setReady();synchronize();}
function setQuality(q:Quality){scene?.setQuality(q);ui.setQuality(q);}
function setMotion(enabled:boolean){scene?.setMotion(enabled);ui.setMotion(enabled);synchronize();}
ui=new ShowcaseUI(host,{onPart:selectPart,onHome:home,onMode:setMode,onSkipIntro:()=>{scene?.skipIntro();synchronize();},onRetry:()=>void start(),onFold:unfold=>{scene?.setUnfold(unfold?1:0);synchronize();},onQuality:setQuality,onMotion:setMotion,onResetCamera:()=>{if(scene?.focusPart)selectPart(scene.focusPart);else home();},onReplayIntro:replayIntro});
function scrollState(){const range=Math.max(1,document.documentElement.scrollHeight-innerHeight),progress=Math.max(0,Math.min(1,scrollY/range)),chapter=Math.min(2,Math.floor(progress*3));scene?.setScrollProgress(progress);ui.setChapter(chapter,Math.min(1,progress*3-chapter));}
window.addEventListener('scroll',scrollState,{passive:true});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');reduced.addEventListener('change',()=>setMotion(!reduced.matches));
async function start(){const previousQuality=scene?.quality,previousMotion=scene?.motion;scene?.dispose();ui.setLoading();lastIntro=-1;lastFocus=undefined;lastBusy=undefined;
 try{scene=new ShowcaseScene(ui.canvasHost,{onReady:()=>{ui.setReady();ui.setQuality(scene!.quality);ui.setMotion(scene!.motion);synchronize();},onPart:id=>ui.setFocus(id),onMode:mode=>ui.setMode(mode),onLoad:p=>ui.updateLoad(p),onError:message=>ui.showError(message),onFrame:synchronize});
  if(previousQuality)scene.setQuality(previousQuality);if(previousMotion!==undefined)scene.setMotion(previousMotion);
  ui.setAssetNote('当前体验使用已确认的 V8 Nightfall 彩色资产及原贴图。保留该版本的双绳扣袢；最近的平皮条、四合扣定位和裁片研究见独立入口。仅展示原资产可支持的翻筒展开，不将其称为真实布料物理模拟。');
  const lab={get scene(){return scene;},ui,getState:()=>scene?.getState(),selectPart,home,skipIntro:()=>{scene?.skipIntro();synchronize();},replayIntro,setMode,setQuality,setMotion,setUnfold:(v:number)=>scene?.setUnfold(v),setScrollProgress:(p:number)=>scene?.setScrollProgress(p),seekIntro:(p:number)=>{if(scene){scene.introPaused=true;scene.seekIntro(p);synchronize();}},seekTransition:(p:number)=>{scene?.seekTransition(p);synchronize();},seekUnfold:(v:number)=>{scene?.seekUnfold(v);synchronize();},projectPart:(id:PartId)=>scene?.projectPart(id)};
  (window as unknown as{__onwardShowcase:typeof lab}).__onwardShowcase=lab;scrollState();await scene.load();
 }catch(error){ui.showError(String(error));}
}
void start();
