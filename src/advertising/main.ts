import './style.css';
import { Vector3 } from 'three';
import { AdScene } from './scene/AdScene';
import { Narrative } from './narrative/Narrative';
import { AdUI } from './ui/AdUI';
import { PartInteraction } from './interaction/PartInteraction';
import type { NodeId } from './types';
import { isNode } from './tree';

const root=document.querySelector<HTMLElement>('#onward-ad')!;
const ui=new AdUI(root);
let scene:AdScene;let narrative:Narrative;let raf=0;let lastFrame=0;let hidden=false;let lastTouch=0;let shadowStamp=0;
let reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let dirty=true;let disposed=false;let samples:number[]=[];let frameTimes:number[]=[];let intervals:number[]=[];let rendererName='unknown';
const coarse=matchMedia('(pointer:coarse)').matches;
const goto=(id:NodeId)=>{
  if(!narrative||!scene.loaded||id===narrative.node&&!narrative.busy)return Promise.resolve(false);
  scene.rig.capture(narrative.state);scene.rig.controls.enabled=false;
  return narrative.go(id);
};
const updateUI=()=>{if(!narrative)return;scene.rig.controls.enabled=!narrative.busy;ui.update(narrative.target,narrative.busy,narrative.timeline?.progress()??0);};
const completed=()=>{
  scene.rig.controls.enabled=true;scene.rig.apply(narrative.state);dirty=true;updateUI();
  history.replaceState({node:narrative.node},'',`#${narrative.node}`);
};
const updateOverlays=()=>{
  const hotspot=scene.rig.project(scene.cuffAnchor());ui.hotspotAt(hotspot.x+40,hotspot.y-30,hotspot.visible);
  const crown=scene.rightStructure.crownCenter();
  const center=scene.copy.curve.center;
  const anchors=[center.clone().add(new Vector3(-.05,0,.06)),center.clone().add(new Vector3(.035,.065,.04)),crown,center.clone().add(new Vector3(.05,-.01,.06))];
  scene.demo.updateMatrixWorld(true);
  ui.notes(narrative.state.notes,anchors.map(p=>scene.rig.project(p.applyMatrix4(scene.demo.matrixWorld))),scene.rig.width,scene.rig.height);
};
const animate=(stamp:number)=>{
  if(disposed)return;raf=requestAnimationFrame(animate);
  if(hidden||!scene.loaded||scene.lost)return;
  const fps=coarse?(narrative.busy||stamp-lastTouch<1800?30:20):narrative.busy?60:30;const step=1000/fps;
  if(stamp-lastFrame<step-.6)return;
  if(reduced&&!narrative.busy&&!dirty&&stamp-lastTouch>1800){lastFrame=stamp;return;}
  const actualInterval=stamp-lastFrame;const dt=Math.min(.07,actualInterval/1000);lastFrame=stamp;
  intervals.push(actualInterval);if(intervals.length>120)intervals.shift();
  if(narrative.node==='ROOT'&&!narrative.busy&&!reduced&&stamp-lastTouch>3500)narrative.state.yaw+=dt*.075;
  if(narrative.busy)scene.rig.apply(narrative.state);else scene.rig.controls.update(dt);
  scene.apply(narrative.state,stamp/1000,reduced);
  if((narrative.busy||narrative.node==='ROOT')&&stamp-shadowStamp>95){scene.renderer.shadowMap.needsUpdate=true;shadowStamp=stamp;}
  const before=performance.now();scene.render();const elapsed=performance.now()-before;dirty=false;
  frameTimes.push(elapsed);if(frameTimes.length>300)frameTimes.shift();
  samples.push(Math.min(250,actualInterval)/step);
  if(samples.length>=30){const avg=samples.reduce((a,b)=>a+b)/samples.length;if(avg>1.55&&scene.lowerResolution())scene.resize(narrative.state);samples=[];}
  updateOverlays();
  if(narrative.busy)updateUI();
};
async function start(){
  try{
    scene=new AdScene(ui.canvasHost,()=>{narrative?.pause();ui.failure('三维画面已暂停。请重新加载恢复图形上下文。');});
    const gl=scene.renderer.getContext();const debug=gl.getExtension('WEBGL_debug_renderer_info');rendererName=debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'WebGL2';
    await scene.load(value=>ui.loading(value));
    narrative=new Narrative(scene.metadata,updateUI,completed);narrative.reduced=reduced;
    scene.rig.apply(narrative.state);scene.resize(narrative.state);ui.motion(reduced);ui.ready();
    ui.bind(goto,()=>void narrative.replay(),()=>{reduced=!reduced;narrative.reduced=reduced;dirty=true;ui.motion(reduced);});
    new PartInteraction(scene,()=>narrative.node==='ROOT'&&!narrative.busy,()=>goto('A1'));
    scene.rig.controls.addEventListener('change',()=>{dirty=true;});
    scene.rig.controls.addEventListener('start',()=>{dirty=true;lastTouch=performance.now();});
    scene.rig.controls.addEventListener('end',()=>{lastTouch=performance.now();scene.rig.capture(narrative.state);});
    new ResizeObserver(()=>{scene.resize(narrative.state);dirty=true;}).observe(ui.canvasHost);
    document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)narrative.pause();else{dirty=true;lastFrame=performance.now();narrative.resume();}});
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;narrative.reduced=reduced;dirty=true;ui.motion(reduced);});
    window.addEventListener('popstate',()=>{const id=location.hash.slice(1);if(isNode(id))goto(id);});
    root.dataset.loaded='true';updateUI();raf=requestAnimationFrame(animate);
    if(import.meta.env.DEV||new URLSearchParams(location.search).has('review')){
      Object.assign(window,{__onwardAd:{
        navigate:goto,
        seek:(seconds:number,clock=seconds)=>{narrative.timeline?.pause(seconds,false);if(narrative.node==='ROOT'&&!narrative.busy)narrative.state.yaw=-.22+clock*.075;scene.rig.apply(narrative.state);scene.apply(narrative.state,clock,reduced);scene.renderer.shadowMap.needsUpdate=true;scene.render();updateOverlays();updateUI();},
        resume:()=>narrative.resume(),canonical:(id:NodeId)=>{narrative.canonical(id);scene.rig.apply(narrative.state);scene.renderer.shadowMap.needsUpdate=true;},
        snapshot:()=>({node:narrative.node,target:narrative.target,busy:narrative.busy,state:Object.fromEntries(Object.entries(narrative.state).filter(([,value])=>typeof value==='number')),camera:scene.rig.camera.position.toArray(),orbitTarget:scene.rig.controls.target.toArray(),controlsEnabled:scene.rig.controls.enabled,duration:narrative.timeline?.duration()??0}),
        performance:()=>({renderer:rendererName,...scene.info(),sampleCount:frameTimes.length,meanFrameIntervalMs:intervals.reduce((a,b)=>a+b,0)/Math.max(1,intervals.length),meanSubmitMs:frameTimes.reduce((a,b)=>a+b,0)/Math.max(1,frameTimes.length),coarse,realSafari:false}),
        projectCuff:()=>scene.rig.project(scene.cuffAnchor()),
        geometry:()=>({length:scene.metadata.length,height:scene.metadata.height,seats:scene.rightStructure.seats,source:scene.metadata.sourceCommit}),
        stop:()=>{narrative.pause();cancelAnimationFrame(raf);},
      }});
    }
    window.addEventListener('pagehide',e=>{if(e.persisted){hidden=true;narrative.pause();return;}disposed=true;cancelAnimationFrame(raf);narrative.dispose();scene.dispose();});
    window.addEventListener('pageshow',()=>{hidden=false;dirty=true;lastFrame=performance.now();narrative.resume();});
  }catch(error){console.error(error);ui.failure('三维空间未能载入。请检查网络或 WebGL 支持后重试；原鞋模不会被替代。');}
}
void start();
