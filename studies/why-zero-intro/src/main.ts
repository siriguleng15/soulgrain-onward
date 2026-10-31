import './style.css';
import {ACESFilmicToneMapping,AmbientLight,DirectionalLight,Group,Mesh,MeshPhysicalMaterial,OrthographicCamera,PlaneGeometry,PMREMGenerator,Scene,ShaderMaterial,SRGBColorSpace,TorusGeometry,Vector2,WebGLRenderer} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FrostPipeline} from './FrostPipeline.ts';
import type {Quality} from './FrostPipeline.ts';
import {Narrative} from './Narrative.ts';
import type {Phase} from './Narrative.ts';
import {Countdown} from './Countdown.ts';
import {GuideHand} from './GuideHand.ts';
import {recognizeZero} from './gesture.ts';
import type {Point,GestureResult} from './gesture.ts';
import {quadVertex,backdropFragment} from './shaders.ts';

const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
class FrostDemo{
 readonly renderer:WebGLRenderer;readonly pipeline:FrostPipeline;readonly scene=new Scene();readonly camera=new OrthographicCamera(-1,1,1,-1,.01,20);
 readonly narrative:Narrative;readonly hand=new GuideHand();readonly countdown=new Countdown();readonly orb=new Group();readonly orbMaterial=new MeshPhysicalMaterial({color:0x3fbd23,metalness:.5,roughness:.17,clearcoat:1,transparent:true,opacity:0});
 readonly backdrop=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:backdropFragment,depthWrite:false,depthTest:false,uniforms:{uTime:{value:0},uDawn:{value:0}}});
 private width=0;private height=0;private aspect=1;private pointer:number|null=null;private points:Point[]=[];private lastUv?:Vector2;private handOpacity=0;
 private frame=0;private last=0;private hidden=document.hidden;private disposed=false;private contextLost=false;private frameTimes:number[]=[];private lastPanel=0;private uiKey='';private message='';private messageUntil=0;
 private readonly coreOnly=new URLSearchParams(location.search).get('stage')==='core';
 private quality:Quality=matchMedia('(pointer:coarse)').matches?'balanced':'high';private lastGesture?:GestureResult;private phaseHistory:{phase:Phase;time:number}[]=[];
 onFrame?:()=>void;
 private benchmark?:{start:number;frames:number[]};private benchmarkResult?:unknown;private observer:ResizeObserver;
 constructor(){
  this.renderer=new WebGLRenderer({alpha:false,antialias:false,powerPreference:'high-performance'});this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.setClearColor(0xb3d58d,1);this.camera.position.z=5;
  const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','使用鼠标或单指画一个完整的零，融化冰面。');el('stage').append(canvas);
  this.pipeline=new FrostPipeline(this.renderer);
  const backdrop=new Mesh(new PlaneGeometry(2,2),this.backdrop);backdrop.frustumCulled=false;backdrop.renderOrder=-100;this.scene.add(backdrop,this.countdown.group);
  const ring=new Mesh(new TorusGeometry(.37,.10,36,128),this.orbMaterial);ring.rotation.x=.5;this.orb.add(ring);this.scene.add(this.orb);
  const light=new DirectionalLight(0xe4ffd3,4);light.position.set(-2,3,4);this.scene.add(new AmbientLight(0x8cad6c,1.5),light);
  const room=new RoomEnvironment(),pmrem=new PMREMGenerator(this.renderer),environment=pmrem.fromScene(room,.04);this.scene.environment=environment.texture;this.hand.scene.environment=environment.texture;pmrem.dispose();room.dispose();
  this.narrative=new Narrative(phase=>{this.phaseHistory.push({phase,time:this.narrative?.time??0});if(phase==='guide')this.pointer=null;this.updateUi(true);});
  this.bind();this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(el('stage'));
  if(!this.coreOnly)void this.hand.load(import.meta.env.BASE_URL+'assets/hand-right.glb');this.pipeline.finalMaterial.uniforms.uStyle.value=this.coreOnly?0:1;
  const initial=new URLSearchParams(location.search).get('stage');if(initial==='core'||initial==='hand'||initial==='gesture')this.narrative.guide();
  (window as unknown as{__frostDemo:FrostDemo}).__frostDemo=this;this.frame=requestAnimationFrame(this.loop);
 }
 private bind(){const canvas=this.renderer.domElement;canvas.addEventListener('pointerdown',this.down,{passive:false});canvas.addEventListener('pointermove',this.move,{passive:false});canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancel);canvas.addEventListener('lostpointercapture',this.cancel);canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;el('error').hidden=false;el('error').textContent='图形上下文暂时中断，请重新加载此页面。';});
  document.addEventListener('visibilitychange',()=>{this.hidden=document.hidden;this.last=0;if(this.hidden)this.abortStroke();});
  el('restart').onclick=el('again').onclick=()=>this.restart();el('skip').onclick=()=>{this.abortStroke();this.pipeline.reset();this.narrative.guide();};
  el('debug-toggle').onclick=()=>{const panel=el('debug');panel.hidden=!panel.hidden;el('debug-toggle').setAttribute('aria-expanded',String(!panel.hidden));};el('debug-close').onclick=()=>{el('debug').hidden=true;el('debug-toggle').setAttribute('aria-expanded','false');};
  el<HTMLSelectElement>('quality').value=this.quality;el('quality').onchange=()=>{this.quality=el<HTMLSelectElement>('quality').value as Quality;this.resize(true);};el('benchmark').onclick=()=>{this.benchmark={start:performance.now(),frames:[]};el('benchmark').textContent='正在采样，请继续操作…';};el('export-report').onclick=()=>{const blob=new Blob([JSON.stringify(this.getState(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='frost-unlock-diagnostics.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);};
 }
 private resize(force=false){const width=innerWidth,height=innerHeight;if(!force&&width===this.width&&height===this.height&&this.renderer.domElement.width>1)return;this.abortStroke();this.width=width;this.height=height;this.aspect=width/height;this.camera.left=-this.aspect;this.camera.right=this.aspect;this.camera.top=1;this.camera.bottom=-1;this.camera.updateProjectionMatrix();this.pipeline.resize(width,height,this.quality);}
 private location(event:PointerEvent){const r=this.renderer.domElement.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top,t:performance.now()};}
 private uv(p:Point){return new Vector2(p.x/this.width,1-p.y/this.height);}
 private down=(event:PointerEvent)=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  if(this.pointer!==null){this.abortStroke();return;}
  if(!this.narrative.drawing())return;
  event.preventDefault();this.pointer=event.pointerId;this.points=[];this.lastUv=undefined;this.pipeline.reset();this.message='';this.acceptPoint(this.location(event));
  try{this.renderer.domElement.setPointerCapture(event.pointerId);}catch{/* pointer was cancelled */}
 };
 private move=(event:PointerEvent)=>{if(event.pointerId!==this.pointer)return;event.preventDefault();const coalesced=event.getCoalescedEvents?.()??[event];for(const point of coalesced.length?coalesced:[event])this.acceptPoint(this.location(point));};
 private acceptPoint(p:Point){if(this.points.length&&Math.hypot(p.x-this.points.at(-1)!.x,p.y-this.points.at(-1)!.y)<1)return;this.points.push(p);const uv=this.uv(p);this.pipeline.stroke(this.lastUv??uv,uv);this.lastUv=uv;}
 private up=(event:PointerEvent)=>{
  if(event.pointerId!==this.pointer)return;this.acceptPoint(this.location(event));this.pointer=null;
  try{if(this.renderer.domElement.hasPointerCapture(event.pointerId))this.renderer.domElement.releasePointerCapture(event.pointerId);}catch{/* released by browser */}
  this.lastGesture=recognizeZero(this.points,Math.max(58,Math.min(this.width,this.height)*.08));
  if(this.lastGesture.valid){this.pipeline.finalMaterial.uniforms.uCenter.value.copy(this.uv(this.lastGesture.center));this.narrative.success();}else{this.message=this.lastGesture.reason;this.messageUntil=this.narrative.time+2.8;this.pipeline.cool();this.narrative.invalid();}
 };
 private cancel=(event:PointerEvent)=>{if(event.pointerId===this.pointer)this.abortStroke();};
 private abortStroke(){const id=this.pointer;this.pointer=null;this.points=[];this.lastUv=undefined;if(id!==null){try{if(this.renderer.domElement.hasPointerCapture(id))this.renderer.domElement.releasePointerCapture(id);}catch{}this.pipeline?.cool();this.narrative?.invalid();}}
 restart(){this.abortStroke();this.pipeline.reset();this.lastGesture=undefined;this.message='';this.phaseHistory=[];this.narrative.restart();this.pipeline.finalMaterial.uniforms.uCenter.value.set(.5,.5);this.updateUi(true);}
 private updateUi(force=false){if(!this.narrative)return;const phase=this.narrative.phase,message=this.narrative.time<this.messageUntil?this.message:'',key=phase+message;if(!force&&key===this.uiKey)return;this.uiKey=key;el('app').dataset.state=phase;el('end-copy').hidden=!['transition','done'].includes(phase);el('skip').hidden=!['countdown','shattering'].includes(phase);el('phase').textContent=['countdown','shattering'].includes(phase)?'01 / ARRIVAL':['guide','drawing'].includes(phase)?'02 / FROST UNLOCK':phase==='done'?'04 / AN OPEN SPACE':'03 / THE THAW';
  if(['guide','drawing'].includes(phase)){el('eyebrow').textContent='ONE CONTINUOUS GESTURE';el('title').textContent='Draw nothing. Open everything.';el('hint').textContent=message||'按住冰面，画一个完整的零。松开手指，看看会发生什么。';}
  else if(['countdown','shattering'].includes(phase)){el('eyebrow').textContent='A MOMENT BEFORE THE THAW';el('title').innerHTML='Everything begins<br>with nothing.';el('hint').textContent='从九十九，到一个新的开始。';}
 }
 private loop=(timestamp:number)=>{
  if(this.disposed)return;this.frame=requestAnimationFrame(this.loop);if(this.hidden||this.contextLost){this.last=0;return;}
  const actual=this.last?timestamp-this.last:16.67,dt=actual/1000;this.last=timestamp;this.frameTimes.push(actual);if(this.frameTimes.length>180)this.frameTimes.shift();
  if(this.benchmark){this.benchmark.frames.push(actual);if(performance.now()-this.benchmark.start>10000){const a=[...this.benchmark.frames].sort((a,b)=>a-b);this.benchmarkResult={samples:a.length,medianFrameMs:a[Math.floor(a.length*.5)],p95FrameMs:a[Math.floor(a.length*.95)],environment:navigator.userAgent,pipeline:this.pipeline.info()};this.benchmark=undefined;el('benchmark').textContent='重新采样 10 秒';}}
  this.narrative.update(dt);const v=this.narrative.values;this.countdown.update(v.number,v.shatter,this.narrative.time,this.aspect);this.handOpacity+=(v.hand-this.handOpacity)*(1-Math.exp(-dt*12));this.hand.update(this.narrative.time,this.coreOnly?0:this.handOpacity,this.aspect);
  const contact=this.hand.contact;if(contact)this.pipeline.finalMaterial.uniforms.uContact.value.set(.5+contact.x/this.aspect*.5,.5+contact.y*.5);this.pipeline.finalMaterial.uniforms.uContactOpacity.value=this.coreOnly?0:this.handOpacity;
  this.orb.visible=v.orb>.001;this.orbMaterial.opacity=v.orb;this.orb.position.set(this.aspect>.95?.70:0,this.aspect>.95?0:-.10,.25);this.orb.rotation.set(.55+Math.sin(this.narrative.time*.3)*.05,this.narrative.time*.22,.22);this.orb.scale.setScalar(.7+v.orb*.5);
  el('end-copy').style.opacity=String(v.dawn);this.backdrop.uniforms.uTime.value=this.narrative.time;this.backdrop.uniforms.uDawn.value=v.dawn;
  Object.assign(this.pipeline.finalMaterial.uniforms.uMelt,{value:v.melt});this.pipeline.finalMaterial.uniforms.uDawn.value=v.dawn;this.pipeline.finalMaterial.uniforms.uFlash.value=v.flash;
  this.pipeline.render(this.scene,this.camera,this.hand.scene,dt,this.narrative.time);this.updateUi();this.onFrame?.();
  if(timestamp-this.lastPanel>350){this.lastPanel=timestamp;if(!el('debug').hidden)el('stats').textContent=JSON.stringify(this.getState(),null,2);}
 };
 getState(){const a=[...this.frameTimes].sort((a,b)=>a-b);return{phase:this.narrative?.phase,time:this.narrative?.time,values:{number:this.narrative?.values.number,shatter:this.narrative?.values.shatter,melt:this.narrative?.values.melt,dawn:this.narrative?.values.dawn,flash:this.narrative?.values.flash,hand:this.narrative?.values.hand,orb:this.narrative?.values.orb},gesture:this.lastGesture??null,activePointer:this.pointer,strokePoints:this.points.length,hand:{ready:this.hand.ready,opacity:this.handOpacity,error:this.hand.error??null,asset:'MIT / immersive-web generic-hand'},render:this.pipeline.info(),frameMs:{median:a[Math.floor(a.length*.5)]??0,p95:a[Math.floor(a.length*.95)]??0},benchmark:this.benchmarkResult??null,history:this.phaseHistory,contextLost:this.contextLost,userAgent:navigator.userAgent};}
}
try{new FrostDemo();}catch(error){el('error').hidden=false;el('error').textContent='WebGL 演示暂时无法启动：'+String(error);}
