import './style.css';
import {AmbientLight,DirectionalLight,Mesh,NoToneMapping,OrthographicCamera,PlaneGeometry,PMREMGenerator,Scene,ShaderMaterial,SRGBColorSpace,Vector2,WebGLRenderer} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {FrostPipeline} from './FrostPipeline.ts';
import type {Quality} from './FrostPipeline.ts';
import {Narrative} from './Narrative.ts';
import type {Phase} from './Narrative.ts';
import {Countdown} from './Countdown.ts';
import {GuideHand} from './GuideHand.ts';
import {NextScene} from './NextScene.ts';
import {recognizeZero} from './gesture.ts';
import type {Point,GestureResult} from './gesture.ts';
import {quadVertex,backdropFragment} from './shaders.ts';
import {HandNarrative} from './HandNarrative.ts';
import {createHandStudioEnvironment} from './HandStudioEnvironment.ts';

const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;

class FrostDemo {
  readonly renderer:WebGLRenderer;
  readonly pipeline:FrostPipeline;
  readonly scene=new Scene();
  readonly overlay=new Scene();
  readonly camera=new OrthographicCamera(-1,1,1,-1,.01,20);
  readonly narrative:Narrative;
  readonly hand=new GuideHand();
  readonly countdown=new Countdown();
  readonly nextScene=new NextScene();
  readonly post:HandNarrative;
  readonly backdrop=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:backdropFragment,depthWrite:false,depthTest:false,uniforms:{uTime:{value:0},uDawn:{value:0}}});
  private width=0;
  private height=0;
  private aspect=1;
  private pointer:number|null=null;
  private postPointer:number|null=null;
  private postLastY=0;
  private postStartY=0;
  private postStartX=0;
  private postScrubbing=false;
  private postContact=false;
  private points:Point[]=[];
  private lastUv?:Vector2;
  private handOpacity=0;
  private guideTime=0;
  private frame=0;
  private last=0;
  private hidden=document.hidden;
  private contextLost=false;
  private loading=true;
  private pendingSkip=false;
  private frameTimes:number[]=[];
  private lastPanel=0;
  private uiKey='';
  private message='';
  private messageUntil=0;
  private readonly coreOnly=new URLSearchParams(location.search).get('stage')==='core';
  private quality:Quality=matchMedia('(pointer:coarse)').matches?'balanced':'high';
  private lastGesture?:GestureResult;
  private phaseHistory:{phase:Phase;time:number}[]=[];
  private benchmark?:{start:number;frames:number[]};
  private benchmarkResult?:unknown;
  private observer:ResizeObserver;
  onFrame?:()=>void;

  constructor(){
    this.renderer=new WebGLRenderer({alpha:false,antialias:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=SRGBColorSpace;
    this.renderer.toneMapping=NoToneMapping;
    this.renderer.info.autoReset=false;
    this.renderer.setClearColor(0x205d49,1);
    this.camera.position.z=5;
    const canvas=this.renderer.domElement;
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','按住鼠标或用一根手指画一个闭合的零，松开验证。');
    el('stage').append(canvas);
    this.pipeline=new FrostPipeline(this.renderer);
    const backdrop=new Mesh(new PlaneGeometry(2,2),this.backdrop);
    backdrop.frustumCulled=false;backdrop.renderOrder=-100;
    this.scene.add(backdrop,this.nextScene.group);
    this.overlay.add(this.countdown.group);
    const light=new DirectionalLight(0xfff4c5,2);light.position.set(-2,3,4);
    this.scene.add(new AmbientLight(0xffffff,.8),light);
    const room=new RoomEnvironment(),pmrem=new PMREMGenerator(this.renderer),environment=pmrem.fromScene(room,.04);
    this.scene.environment=environment.texture;
    this.hand.scene.environment=environment.texture;
    this.post=new HandNarrative(this.renderer,createHandStudioEnvironment(this.renderer).texture);
    pmrem.dispose();room.dispose();
    this.narrative=new Narrative(phase=>{
      this.phaseHistory.push({phase,time:this.narrative?.time??0});
      if(phase==='guide')this.pointer=null;
      this.updateUi(true);
    });
    this.bind();this.resize();
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(el('stage'));
    (window as unknown as {__frostDemo:FrostDemo}).__frostDemo=this;
    this.frame=requestAnimationFrame(this.loop);
    void this.loadAssets();
  }

  private async loadAssets(){
    const font=Promise.all([document.fonts.load('700 100px "Zero Sans"'),document.fonts.load('400 80px "Zero Serif"'),document.fonts.load('italic 300 80px "Zero Serif"')]).then(()=>this.countdown.refreshAtlas());
    await Promise.allSettled([
      this.pipeline.loadPhoto(import.meta.env.BASE_URL+'assets/frost-study-v2.webp'),
      this.coreOnly?Promise.resolve():this.hand.load(import.meta.env.BASE_URL+'assets/hand-refined-v2.glb'),
      this.coreOnly?Promise.resolve():this.post.load(import.meta.env.BASE_URL+'assets/green-glove-v5.glb',import.meta.env.BASE_URL+'assets/landscape-v5.webp',import.meta.env.BASE_URL+'assets/skin-v3.webp',import.meta.env.BASE_URL+'assets/hand-anatomical-v5.glb'),
      font,
    ]);
    this.loading=false;
    el('loading').hidden=true;
    if(this.pipeline.photoError||(!this.coreOnly&&(this.hand.error||this.post.error))){
      el('error').hidden=false;
      el('error').textContent='部分研究资产未加载成功，当前为降级显示。请重新加载页面。'+(this.pipeline.photoError??this.hand.error??this.post.error);
    }
    this.restart();
    const initial=new URLSearchParams(location.search).get('stage');
    if(this.pendingSkip||initial==='core'||initial==='hand'||initial==='gesture')this.narrative.guide();
    if(initial==='hands'||initial==='creation'){this.narrative.post();this.post.jump(initial==='creation'?3.4:1.25);this.post.progress=this.post.targetProgress;}
  }

  private bind(){
    const canvas=this.renderer.domElement;
    canvas.addEventListener('pointerdown',this.down,{passive:false});
    canvas.addEventListener('pointermove',this.move,{passive:false});
    canvas.addEventListener('pointerup',this.up);
    canvas.addEventListener('pointercancel',this.cancel);
    canvas.addEventListener('lostpointercapture',this.cancel);
    canvas.addEventListener('pointerleave',()=>{this.hand.leavePointer();if(this.postPointer===null)this.post.pointerTarget.set(.5,.5);});
    canvas.addEventListener('wheel',event=>{if(this.narrative.phase==='done'){event.preventDefault();this.post.scroll(event.deltaY);}},{passive:false});
    canvas.addEventListener('keydown',event=>{
      if(this.narrative.phase!=='done')return;
      if(['ArrowDown','ArrowRight','PageDown'].includes(event.code)){event.preventDefault();this.post.scroll(230);}
      if(['ArrowUp','ArrowLeft','PageUp'].includes(event.code)){event.preventDefault();this.post.scroll(-230);}
      if(event.code==='End'){event.preventDefault();this.post.jump(3.4);}
    });
    canvas.addEventListener('contextmenu',event=>event.preventDefault());
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();this.contextLost=true;
      el('error').hidden=false;el('error').textContent='图形上下文暂时中断，请重新加载此页面。';
    });
    document.addEventListener('visibilitychange',()=>{this.hidden=document.hidden;this.last=0;if(this.hidden)this.abortStroke();});
    window.addEventListener('blur',()=>this.abortStroke());
    el('restart').onclick=el('again').onclick=()=>this.restart();
    el('to-hands').onclick=()=>{if(!this.loading){this.abortStroke();this.narrative.post();this.post.jump(1.25);}};
    el('story-next').onclick=()=>this.post.progress>3.1?this.post.jump(1.25):this.post.next();
    el('story-back').onclick=()=>this.post.jump(this.post.targetProgress>2.5?1.25:0);
    el('story-menu-toggle').onclick=()=>{el('story-menu').hidden=!el('story-menu').hidden;};
    for(const button of document.querySelectorAll<HTMLButtonElement>('[data-chapter]'))button.onclick=()=>{this.post.jump(Number(button.dataset.chapter));el('story-menu').hidden=true;};
    el('skip').onclick=()=>{
      if(this.loading){this.pendingSkip=true;return;}
      this.abortStroke();this.pipeline.reset();this.guideTime=0;this.narrative.guide();
    };
    el('debug-toggle').onclick=()=>{const panel=el('debug');panel.hidden=!panel.hidden;el('debug-toggle').setAttribute('aria-expanded',String(!panel.hidden));};
    el('debug-close').onclick=()=>{el('debug').hidden=true;el('debug-toggle').setAttribute('aria-expanded','false');};
    el<HTMLSelectElement>('quality').value=this.quality;
    el('quality').onchange=()=>{this.quality=el<HTMLSelectElement>('quality').value as Quality;this.resize(true);};
    el('benchmark').onclick=()=>{this.benchmark={start:performance.now(),frames:[]};el('benchmark').textContent='正在采样，请继续操作…';};
    el('export-report').onclick=()=>{
      const blob=new Blob([JSON.stringify(this.getState(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='zero-opening-v2-diagnostics.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
    };
  }

  private resize(force=false){
    const width=innerWidth,height=innerHeight;
    if(!force&&width===this.width&&height===this.height&&this.renderer.domElement.width>1)return;
    this.abortStroke();this.width=width;this.height=height;this.aspect=width/height;
    this.camera.left=-this.aspect;this.camera.right=this.aspect;this.camera.top=1;this.camera.bottom=-1;this.camera.updateProjectionMatrix();
    this.pipeline.resize(width,height,this.quality);
    this.post?.resize(width,height);
  }
  private location(event:PointerEvent){const r=this.renderer.domElement.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top,t:performance.now()};}
  private uv(p:Point){return new Vector2(p.x/this.width,1-p.y/this.height);}

  private down=(event:PointerEvent)=>{
    if(this.loading||(event.pointerType==='mouse'&&event.button!==0))return;
    if(this.narrative.phase==='done'){
      if(this.postPointer!==null){this.post.release();this.postPointer=null;return;}
      event.preventDefault();this.postPointer=event.pointerId;this.postLastY=this.postStartY=event.clientY;this.postStartX=event.clientX;this.postScrubbing=false;
      this.postContact=this.post.down(event.clientX/this.width,1-event.clientY/this.height);
      try{this.renderer.domElement.setPointerCapture(event.pointerId);}catch{}
      return;
    }
    if(this.pointer!==null){this.abortStroke();return;}
    if(!this.narrative.drawing())return;
    event.preventDefault();this.pointer=event.pointerId;this.points=[];this.lastUv=undefined;this.message='';
    // Existing melt marks remain in the same heat buffer; a new attempt is not a hard cut.
    this.acceptPoint(this.location(event));
    try{this.renderer.domElement.setPointerCapture(event.pointerId);}catch{}
  };
  private move=(event:PointerEvent)=>{
    this.hand.setPointer(event.clientX/this.width,1-event.clientY/this.height);
    if(this.narrative.phase==='done'){
      this.post.move(event.clientX/this.width,1-event.clientY/this.height);
      if(event.pointerId===this.postPointer){
        event.preventDefault();
        const dragY=Math.abs(event.clientY-this.postStartY),dragX=Math.abs(event.clientX-this.postStartX);
        if(event.pointerType==='touch'&&!this.postContact&&(this.postScrubbing||(dragY>12&&dragY>dragX*1.1))){
          this.postScrubbing=true;this.post.scroll((this.postLastY-event.clientY)*2.5);
        }
        this.postLastY=event.clientY;
      }
      return;
    }
    if(event.pointerId!==this.pointer)return;
    event.preventDefault();
    const coalesced=event.getCoalescedEvents?.()??[event];
    for(const point of coalesced.length?coalesced:[event])this.acceptPoint(this.location(point));
  };
  private acceptPoint(p:Point){
    if(this.points.length&&Math.hypot(p.x-this.points.at(-1)!.x,p.y-this.points.at(-1)!.y)<1)return;
    this.points.push(p);
    if(this.points.length>5000)this.points=this.points.filter((_,i)=>i===0||i%2===0||i===this.points.length-1);
    const uv=this.uv(p);
    this.pipeline.stroke(this.lastUv??uv,uv);this.lastUv=uv;
    this.pipeline.finalMaterial.uniforms.uPointer.value.copy(uv);
  }
  private up=(event:PointerEvent)=>{
    if(event.pointerId===this.postPointer){this.postPointer=null;this.post.release();try{this.renderer.domElement.releasePointerCapture(event.pointerId);}catch{}return;}
    if(event.pointerId!==this.pointer)return;
    this.acceptPoint(this.location(event));this.pointer=null;
    try{if(this.renderer.domElement.hasPointerCapture(event.pointerId))this.renderer.domElement.releasePointerCapture(event.pointerId);}catch{}
    this.lastGesture=recognizeZero(this.points,Math.max(58,Math.min(this.width,this.height)*.08));
    if(this.lastGesture.valid){
      this.pipeline.finalMaterial.uniforms.uCenter.value.copy(this.uv(this.lastGesture.center));
      this.narrative.success();
    }else{
      this.message=this.lastGesture.reason;this.messageUntil=this.narrative.time+2.8;
      this.pipeline.cool();this.narrative.invalid();
    }
  };
  private cancel=(event:PointerEvent)=>{if(event.pointerId===this.pointer||event.pointerId===this.postPointer)this.abortStroke();};
  private abortStroke(){
    const postId=this.postPointer;this.postPointer=null;this.post?.release();
    if(postId!==null)try{this.renderer.domElement.releasePointerCapture(postId);}catch{}
    const id=this.pointer;this.pointer=null;this.points=[];this.lastUv=undefined;
    if(id!==null){
      try{if(this.renderer.domElement.hasPointerCapture(id))this.renderer.domElement.releasePointerCapture(id);}catch{}
      this.pipeline?.cool();this.narrative?.invalid();
    }
  }

  restart(){
    this.abortStroke();this.pipeline.reset();this.lastGesture=undefined;this.message='';
    this.phaseHistory=[];this.guideTime=0;this.handOpacity=0;
    this.post.reset();
    this.narrative.restart();this.pipeline.finalMaterial.uniforms.uCenter.value.set(.5,.5);
    this.updateUi(true);
  }
  private updateUi(force=false){
    if(!this.narrative)return;
    const phase=this.narrative.phase,message=this.narrative.time<this.messageUntil?this.message:'',key=phase+message;
    if(!force&&key===this.uiKey)return;
    this.uiKey=key;el('app').dataset.state=phase;
    el('story-hud').hidden=phase!=='done';
    el('end-copy').hidden=!['transition','done'].includes(phase);
    el('skip').hidden=!['countdown','shattering'].includes(phase);
    el('phase').textContent=['countdown','shattering'].includes(phase)?'01 / ARRIVAL':['guide','drawing'].includes(phase)?'02 / FROST UNLOCK':phase==='done'?'04 / YOU BELIEVED':'03 / THE THAW';
    el('hint').textContent=message||'按住冰面画一个完整的零，松开手指验证。';
  }

  private loop=(timestamp:number)=>{
    this.frame=requestAnimationFrame(this.loop);
    if(this.hidden||this.contextLost){this.last=0;return;}
    const actual=this.last?timestamp-this.last:16.67,dt=actual/1000;
    this.last=timestamp;this.frameTimes.push(actual);if(this.frameTimes.length>180)this.frameTimes.shift();
    if(this.benchmark){
      this.benchmark.frames.push(actual);
      if(performance.now()-this.benchmark.start>10000){
        const a=[...this.benchmark.frames].sort((a,b)=>a-b);
        this.benchmarkResult={samples:a.length,medianFrameMs:a[Math.floor(a.length*.5)],p95FrameMs:a[Math.floor(a.length*.95)],environment:navigator.userAgent,pipeline:this.renderInfo()};
        this.benchmark=undefined;el('benchmark').textContent='重新采样 10 秒';
      }
    }
    if(!this.loading)this.narrative.update(dt);
    const v=this.narrative.values,phase=this.narrative.phase;
    const postActive=phase==='done';
    this.post.update(dt,postActive);
    if(phase==='guide'||phase==='drawing')this.guideTime+=dt;
    this.handOpacity+=(v.hand-this.handOpacity)*(1-Math.exp(-dt*12));
    this.hand.update(this.guideTime,this.coreOnly?0:this.handOpacity,this.aspect,dt);
    this.countdown.update(v.number,v.shatter,this.narrative.time,this.aspect,this.guideTime);
    this.overlay.visible=!this.loading&&!['melting','transition','done'].includes(phase);
    this.nextScene.update(this.narrative.time,v.orb);
    const titleOpacity=Math.max(0,(v.dawn-.78)/.22)*(1-v.orb);
    const storyProgress=this.post.progress;
    el('end-copy').style.opacity=String(titleOpacity*Math.max(0,1-storyProgress*2.8));
    el('end-copy').style.pointerEvents=postActive&&storyProgress>.3?'none':'';
    el('again').hidden=postActive;
    el('college-copy').style.opacity=String(postActive?Math.max(0,Math.min((storyProgress-1.5)/.30,(2.65-storyProgress)/.35,1)):0);
    el('college-copy').style.transform='translateY('+((1.8-storyProgress)*70)+'px)';
    const college=el('college-copy').querySelector<HTMLElement>('.college-word')!,land=el('college-copy').querySelector<HTMLElement>('.land-word')!;
    college.style.opacity=String(Math.max(0,Math.min(1,(storyProgress-1.65)/.25)));
    land.style.opacity=String(Math.max(0,Math.min(1,(storyProgress-2.0)/.25)));
    land.style.transform='translateY('+Math.max(0,(2.25-storyProgress)*65)+'px)';
    el('job-copy').style.opacity=String(postActive?Math.max(0,Math.min((storyProgress-2.35)/.25,(3.2-storyProgress)/.25,1)):0);
    el('hold-copy').hidden=!postActive||storyProgress<3.1;
    el('story-ruler-label').textContent=storyProgress>2.5?'-75 BZ':'-100 BZ';
    el('story-next').textContent=storyProgress>3.1?'Replay the hands':'Continue exploring';
    el('reward').style.opacity=String(v.orb);
    this.backdrop.uniforms.uTime.value=this.narrative.time;
    this.backdrop.uniforms.uDawn.value=v.dawn;
    const u=this.pipeline.finalMaterial.uniforms;
    u.uFreeze.value=v.freeze;u.uMelt.value=v.melt;u.uDawn.value=v.dawn;u.uFlash.value=v.flash;
    u.uGuideTime.value=this.guideTime;u.uGuidance.value=this.handOpacity;
    u.uPointerActive.value=this.pointer!==null?1:0;
    this.renderer.info.reset();
    if(!postActive||!this.post.ready){
      this.pipeline.render(this.scene,this.camera,this.hand.scene,dt,this.narrative.time);
      const clear=this.renderer.autoClear;this.renderer.autoClear=false;
      this.renderer.clearDepth();this.renderer.render(this.overlay,this.camera);this.renderer.autoClear=clear;
    }
    if(postActive)this.post.render(1);
    this.updateUi();this.onFrame?.();
    if(timestamp-this.lastPanel>350){this.lastPanel=timestamp;if(!el('debug').hidden)el('stats').textContent=JSON.stringify(this.getState(),null,2);}
  };

  private renderInfo(){
    const opening=this.pipeline.info();
    if(this.narrative.phase==='done'&&this.post.ready)return{active:'hand-narrative',quality:opening.quality,buffer:opening.buffer,passes:'Anatomical scene + depth target, two reduced-size diffusion passes, depth focus / mist / refraction composite, sharp spatial contact overlay',visibleSkinnedHands:Number(!!this.post.green?.root.visible)+Number(!!this.post.human?.root.visible),petalInstances:this.post.petals.mesh.count,openingPassesSuspended:true};
    return{active:'frost',...opening};
  }
  getState(){
    const a=[...this.frameTimes].sort((a,b)=>a-b),v=this.narrative?.values;
    return{version:'hand-match-v5',experience:this.post.state(),phase:this.narrative?.phase,time:this.narrative?.time,guideTime:this.guideTime,loading:this.loading,
      values:{number:v?.number,freeze:v?.freeze,shatter:v?.shatter,melt:v?.melt,dawn:v?.dawn,flash:v?.flash,hand:v?.hand,orb:v?.orb},
      gesture:this.lastGesture??null,activePointer:this.pointer,strokePoints:this.points.length,
      hand:{ready:this.hand.ready,opacity:this.handOpacity,error:this.hand.error??null,asset:'MIT WebXR hand / refined editable derivative'},
      render:{...this.renderInfo(),calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles},
      frameMs:{median:a[Math.floor(a.length*.5)]??0,p95:a[Math.floor(a.length*.95)]??0},benchmark:this.benchmarkResult??null,
      history:this.phaseHistory,contextLost:this.contextLost,userAgent:navigator.userAgent};
  }
}

try{new FrostDemo();}catch(error){el('error').hidden=false;el('error').textContent='WebGL 演示暂时无法启动：'+String(error);}
