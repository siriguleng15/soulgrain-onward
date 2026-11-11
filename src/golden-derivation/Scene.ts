import {
 ACESFilmicToneMapping,AmbientLight,BufferGeometry,DirectionalLight,Group,HemisphereLight,
 Mesh,MeshBasicMaterial,OrthographicCamera,Scene,SphereGeometry,SRGBColorSpace,
 TorusGeometry,Vector3,WebGLRenderer,Texture,Material,
} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Construction,DURATION,phase,smooth,pathSample,spiralProgress,SOURCE_SHA,SOURCE_BLEND_SHA,SOURCE_FILE,CONSTRUCTION_FILE,shotAt,proofState,PROOF_STARTS,ARC_START,ARC_END,ANIMATION_VERSION,INTRO_DURATION,derivationTime} from './construction.ts';
import {geometryWorld} from './GeometryWorld.ts';
import {WireframeLayer} from './WireframeLayer.ts';
import type{ConstructionData}from'./construction.ts';
import {DrawPath} from './DrawPath.ts';
import {GoldenProof} from './GoldenProof.ts';
import {CameraDirector} from './CameraDirector.ts';
import type{Pose}from'./CameraDirector.ts';

export class DerivationScene {
 readonly scene=new Scene();readonly root=new Group();readonly guides=new Group();
 readonly camera=new OrthographicCamera(-1,1,1,-1,.015,40);readonly renderer:WebGLRenderer;controls:OrbitControls;
 construction!:Construction;director!:CameraDirector;ready=false;playing=false;time=0;speed=1;direction=1;
 cameraOwner:'director'|'user'='director';verified=false;contextLost=false;revision=0;drawRevision=-1;
 private lines:DrawPath[]=[];private seam!:DrawPath;private axis!:DrawPath;private cross!:DrawPath;private cuff:DrawPath[]=[];
 private spirals:DrawPath[]=[];
 private contact=new Group();private endDots:Mesh[]=[];private tip:Mesh;
 private proof!:GoldenProof;
 private observer:ResizeObserver;private raf=0;private last=0;private dirty=true;private disposed=false;private asset?:Group;
 private width=1;private height=1;private showGuides=true;private showSeam=true;
 private sourceMeshes:Mesh[]=[];private wire?:WireframeLayer;private presentation:'story'|'material'|'wire'='story';
 readonly reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private transition?:{from:Pose;start:number};private hiddenPlaying=false;
 private onChange:()=>void;
 constructor(readonly host:HTMLElement,onChange:()=>void){
  this.onChange=onChange;this.renderer=new WebGLRenderer({antialias:true,powerPreference:'default'});
  this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.13;this.renderer.setClearColor('#080f18',1);
  const canvas=this.renderer.domElement;canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';canvas.tabIndex=0;canvas.setAttribute('aria-label','SOUL.NEW 原材质、几何线框与黄金比例推导。拖动旋转，双指缩放。');host.append(canvas);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enabled=false;this.controls.enableDamping=false;this.controls.enablePan=false;this.controls.minZoom=.1;this.controls.maxZoom=5;this.controls.rotateSpeed=.65;this.controls.zoomSpeed=.6;
  // The capture listener transfers camera ownership before OrbitControls reads
  // pointerdown. No director writes can race with a mouse/touch drag.
  canvas.addEventListener('pointerdown',this.takeControl,true);canvas.addEventListener('wheel',this.takeControl,{capture:true,passive:true});this.controls.addEventListener('change',this.invalidate);
  canvas.addEventListener('webglcontextlost',this.lost);canvas.addEventListener('webglcontextrestored',this.restored);
  this.scene.add(this.root);this.root.add(this.guides);
  this.scene.add(new HemisphereLight('#e0efff','#152133',2),new AmbientLight('#dce8ff',.28));
  for(const[color,intensity,p]of[['#fff4de',3.5,[-2,3,4]],['#8dbce9',1.7,[2,.4,-1]],['#edf8ff',2,[-1,1,-3]]]as const){const light=new DirectionalLight(color,intensity);light.position.set(p[0],p[1],p[2]);this.scene.add(light);}
  const ring=new Mesh(new TorusGeometry(.013,.0015,8,48),new MeshBasicMaterial({color:'#ff8c87',depthTest:true}));
  const dot=new Mesh(new SphereGeometry(.004,16,12),new MeshBasicMaterial({color:'#ffd5b8'}));this.contact.add(ring,dot);this.guides.add(this.contact);
  this.tip=new Mesh(new SphereGeometry(.0035,14,10),new MeshBasicMaterial({color:'#ffedbe'}));this.guides.add(this.tip);
  this.observer=new ResizeObserver(this.resize);this.observer.observe(host);document.addEventListener('visibilitychange',this.visibility);this.resize();
 }
 async load(base:string,onProgress:(text:string)=>void){
  onProgress('正在校验原始鞋模…');
  const sourceUrl=(window as Window&{GOLDEN_SOUL_MODEL_URL?:string}).GOLDEN_SOUL_MODEL_URL??base+'golden-derivation/'+SOURCE_FILE;
  const [source,data]=await Promise.all([
   fetch(sourceUrl).then(r=>{if(!r.ok)throw Error('鞋模读取失败：'+r.status);return r.arrayBuffer();}),
   fetch(base+'golden-derivation/'+CONSTRUCTION_FILE).then(r=>{if(!r.ok)throw Error('定位数据读取失败');return r.json() as Promise<ConstructionData>;})
  ]);
  if(!crypto.subtle)throw Error('请通过 HTTPS 或本机 localhost 打开预览，以校验原始鞋模。');
  const digest=await crypto.subtle.digest('SHA-256',source);const sha=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  if(sha!==SOURCE_SHA||data.sourceSha256!==sha)throw Error('模型身份与当前缝线定位不一致，已停止加载。');
  if(data.revision!=='soul-1.3'||data.sourceBlendSha256!==SOURCE_BLEND_SHA||data.calibration?.contactEyeletNumber!==4)throw Error('SOUL.NEW 定位数据不一致，已停止加载。');this.verified=true;
  onProgress('正在建立三维推导…');
  const gltf=await new GLTFLoader().parseAsync(source,'');if(this.disposed)return;
  this.asset=gltf.scene;this.asset.traverse(o=>{if(o instanceof Mesh)this.sourceMeshes.push(o);});
  this.wire=new WireframeLayer(this.sourceMeshes);
  this.root.add(this.asset);this.construction=new Construction(data);this.director=new CameraDirector(this.construction);
  this.createConstruction();this.ready=true;this.seek(0);onProgress('');
 }
 private createConstruction(){
  const c=this.construction;
  const line=(path:typeof c.axis,color:string,width=2.1)=>{const l=new DrawPath(path,color,width).attach(this.guides);this.lines.push(l);return l;};
  this.seam=line(c.seam,'#ff6f7b',2.3);this.axis=line(c.axis,'#57d5ae',2.3);this.cross=line(c.cross,'#5bd8f8',2.5);
  this.cuff=c.cuff.map(p=>line(p,'#57d5ae',2.3));
  this.proof=new GoldenProof(c);this.guides.add(this.proof.root);this.proof.resize(this.width,this.height);
  this.spirals=c.golden.map((p,i)=>line(p,i?'#c5a4ff':'#efbd63',2.8));

  for(const p of[c.a,c.b]){const dot=new Mesh(new SphereGeometry(.0055,12,8),new MeshBasicMaterial({color:'#a8e5cd'}));dot.position.copy(p);this.guides.add(dot);this.endDots.push(dot);}
  this.contact.position.copy(c.p);this.lines.forEach(l=>l.resize(this.width,this.height));

 }
 seek(t:number){this.time=Math.max(0,Math.min(DURATION,t));this.revision++;this.apply();this.invalidate();this.onChange();}
 private apply(){
  if(!this.ready)return;const t=derivationTime(this.time),c=this.construction;
  const world=geometryWorld(this.time,this.reducedMotion);this.wire?.set(this.presentation==='story'?world.wire:this.presentation==='wire'?1:0,.08-.038*smooth(phase(t,17,20))+.025*smooth(phase(t,68,73)));
  const roll=1.12*smooth(phase(t,19.2,21))*(1-smooth(phase(t,68,72.8)));
  this.root.quaternion.setFromAxisAngle(new Vector3(0,0,1),roll);
  // Rotate about the contact point, not the object origin.
  this.root.position.copy(c.p).sub(c.p.clone().applyQuaternion(this.root.quaternion));this.root.updateMatrixWorld(true);
  this.seam.set(smooth(phase(t,0,1.9)),this.showSeam?.9:0);
  const axis=phase(t,3.3,9);this.axis.set(axis);
  const cross= t<12? .7*phase(t,10,12):.7+.3*phase(t,12,17);this.cross.set(cross);
  this.cuff.forEach(p=>p.set(phase(t,12.8,17)));
  const hitProgress=c.a.distanceTo(c.p)/c.axis.length;
  const contact=smooth((axis-hitProgress)/.055);this.contact.visible=contact>0;this.contact.scale.setScalar(contact);
  this.endDots[0].visible=t>=3.3;this.endDots[1].visible=t>=9;
  this.proof.update(t);
  const progress=PROOF_STARTS.map(start=>spiralProgress(phase(t,start+ARC_START,start+ARC_END)));
  this.spirals.forEach((p,k)=>p.set(progress[k],k===0&&t>=44?.40:1));
  this.tip.visible=false;
  let current:typeof c.axis|undefined,amount=0;
  if(t>=3.3&&t<9){current=c.axis;amount=axis;}
  else if(t>=10&&t<12.8){current=c.cross;amount=cross;}
  else if(t>=12.8&&t<17){current=c.cuff[0];amount=phase(t,12.8,17);}
  else if(t>=34.2&&t<43.8){current=c.golden[0];amount=progress[0];}
  else if(t>=58.2&&t<67.8){current=c.golden[1];amount=progress[1];}
  if(current){this.tip.visible=true;this.tip.position.copy(pathSample(current,amount).point);}
  this.guides.visible=this.showGuides&&this.time>=INTRO_DURATION;
  if(this.cameraOwner==='director')this.applyCamera();
 }
 private directorPose(){
  const pose=this.director.evaluate(derivationTime(this.time),this.width/this.height,p=>this.root.localToWorld(p.clone()),p=>p.clone().applyQuaternion(this.root.quaternion));
  if(this.time<INTRO_DURATION){const w=geometryWorld(this.time,this.reducedMotion);pose.scale*=w.zoom;pose.position.x+=w.shake;pose.position.y+=w.shake*.4;}
  return pose;
 }
 private applyCamera(){
  if(!this.ready)return;let pose=this.directorPose();
  if(this.transition){const t=(performance.now()-this.transition.start)/650;if(t>=1)this.transition=undefined;else pose=this.director.mix(this.transition.from,pose,t);}
  this.camera.position.copy(pose.position);this.camera.quaternion.copy(pose.quaternion);this.camera.up.copy(pose.up);this.camera.zoom=1/pose.scale;this.camera.updateProjectionMatrix();this.controls.target.copy(pose.target);this.camera.updateMatrixWorld();
 }
 private takeControl=()=>{
  if(!this.ready)return;this.playing=false;
  if(this.cameraOwner==='director'){
   // OrbitControls caches its camera-up basis in the constructor. Our trace
   // director rolls that up vector, so reconstruct the public control object
   // at handoff; do not mutate Three.js private quaternion fields.
   const target=this.controls.target.clone();this.controls.removeEventListener('change',this.invalidate);this.controls.dispose();
   this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=false;this.controls.enablePan=false;this.controls.minZoom=.1;this.controls.maxZoom=5;this.controls.rotateSpeed=.65;this.controls.zoomSpeed=.6;this.controls.target.copy(target);this.controls.update();this.controls.addEventListener('change',this.invalidate);
  }
  this.cameraOwner='user';this.controls.enabled=true;this.transition=undefined;this.onChange();this.invalidate();
 };
 free(){this.takeControl();}
 directorView(){
  if(!this.ready)return;
  if(this.cameraOwner==='user')this.transition={start:performance.now(),from:{position:this.camera.position.clone(),target:this.controls.target.clone(),quaternion:this.camera.quaternion.clone(),up:this.camera.up.clone(),scale:1/this.camera.zoom}};
  this.cameraOwner='director';this.controls.enabled=false;this.invalidate();this.onChange();
 }
 play(reverse=false){if(!this.ready||this.contextLost)return;this.directorView();this.direction=reverse?-1:1;if(!reverse&&this.time>=DURATION)this.seek(0);this.playing=true;this.last=performance.now();this.invalidate();this.onChange();}
 pause(){this.playing=false;this.onChange();}
 reset(){this.pause();this.transition=undefined;this.cameraOwner='director';this.controls.enabled=false;this.seek(0);}
 setGuides(v:boolean){this.showGuides=v;this.apply();this.invalidate();}
 setSeam(v:boolean){this.showSeam=v;this.apply();this.invalidate();}
 setPresentation(mode:'story'|'material'|'wire'){this.presentation=mode;this.apply();this.invalidate();this.onChange();}
 private resize=()=>{
  const r=this.host.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5,Math.sqrt(1_750_000/(this.width*this.height))));this.renderer.setSize(this.width,this.height,false);
  const extent=Math.tan(37*Math.PI/360);this.camera.left=-extent*this.width/this.height;this.camera.right=extent*this.width/this.height;this.camera.top=extent;this.camera.bottom=-extent;this.camera.updateProjectionMatrix();this.lines.forEach(l=>l.resize(this.width,this.height));this.proof?.resize(this.width,this.height);if(this.ready&&this.cameraOwner==='director')this.applyCamera();this.invalidate();
 };
 invalidate=()=>{this.dirty=true;if(!this.raf&&!this.disposed&&!this.contextLost&&!document.hidden)this.raf=requestAnimationFrame(this.tick);};
 private tick=(now:number)=>{
  this.raf=0;if(this.disposed||this.contextLost||document.hidden)return;
  if(this.playing){const dt=Math.max(0,(now-this.last)/1000);this.time=Math.max(0,Math.min(DURATION,this.time+dt*this.speed*this.direction));this.revision++;this.apply();this.dirty=true;this.onChange();if((this.direction<0&&this.time===0)||(this.direction>0&&this.time===DURATION)){this.playing=false;this.onChange();}}
  this.last=now;if(this.transition&&this.cameraOwner==='director'){this.applyCamera();this.dirty=true;}
  if(this.dirty){this.renderer.render(this.scene,this.camera);this.drawRevision=this.revision;this.dirty=false;}
  if(this.playing||this.transition)this.raf=requestAnimationFrame(this.tick);
 };
 private visibility=()=>{if(document.hidden){this.hiddenPlaying=this.playing;this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;}else{this.last=performance.now();if(this.hiddenPlaying&&!this.contextLost)this.playing=true;this.hiddenPlaying=false;this.invalidate();}this.onChange();};
 private lost=(e:Event)=>{e.preventDefault();this.contextLost=true;this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;this.host.dispatchEvent(new CustomEvent('lab-context',{detail:'lost'}));this.onChange();};
 private restored=()=>{this.contextLost=false;this.invalidate();this.host.dispatchEvent(new CustomEvent('lab-context',{detail:'restored'}));this.onChange();};
 snapshot(){
  const t=derivationTime(this.time),trace=t>=34.2&&t<43.8?0:t>=58.2&&t<67.8?1:-1;
  let tracking=null;
  if(this.ready&&trace>=0){const progress=spiralProgress(phase(t,trace?58.2:34.2,trace?67.8:43.8)),s=pathSample(this.construction.golden[trace],progress);const p=this.root.localToWorld(s.point.clone()).project(this.camera),delta=this.root.localToWorld(s.point.clone().addScaledVector(s.tangent,.0001)).project(this.camera).sub(p);tracking={tipNdc:p.toArray(),tangentHorizontalFraction:Math.abs(delta.x)/Math.hypot(delta.x,delta.y)};}
  return{ready:this.ready,constructionVersion:ANIMATION_VERSION,geometryVersion:this.ready?this.construction.data.revision:null,proof:proofState(t),derivationTime:t,world:geometryWorld(this.time,this.reducedMotion),wireframe:this.wire?.snapshot(),presentation:this.presentation,sourceFile:SOURCE_FILE,sourceBlendSha256:SOURCE_BLEND_SHA,reducedMotion:this.reducedMotion,duration:DURATION,placement:this.ready?{eyelet:this.construction.data.calibration.contactEyeletNumber,eyeletPoint:this.construction.data.calibration.eyelets.find(e=>e.numberFromToe===4)?.point,contact:this.construction.p.toArray(),firstStart:this.construction.golden[0].points[0].toArray(),secondStart:this.construction.golden[1].points[0].toArray()}:null,time:this.time,playing:this.playing,speed:this.speed,cameraOwner:this.cameraOwner,cameraTransition:!!this.transition,verified:this.verified,contextLost:this.contextLost,revision:this.revision,drawRevision:this.drawRevision,shot:shotAt(this.time).id,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,dpr:this.renderer.getPixelRatio(),tracking,sourceSha256:SOURCE_SHA,assetMatrix:this.asset?.matrix.toArray(),camera:this.camera.position.toArray(),quaternion:this.camera.quaternion.toArray(),sourceGeometry:this.sourceMeshes.map(o=>({name:o.name,vertices:o.geometry.getAttribute('position').count,triangles:(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3})),proofCounts:this.proof?.lines.map(l=>l.line.geometry.instanceCount),guideCounts:this.lines.map(l=>l.line.geometry.instanceCount)};
 }
 dispose(){
  this.disposed=true;cancelAnimationFrame(this.raf);this.observer.disconnect();this.controls.dispose();document.removeEventListener('visibilitychange',this.visibility);
  const canvas=this.renderer.domElement;canvas.removeEventListener('pointerdown',this.takeControl,true);canvas.removeEventListener('wheel',this.takeControl,true);canvas.removeEventListener('webglcontextlost',this.lost);canvas.removeEventListener('webglcontextrestored',this.restored);
  this.wire?.dispose();this.lines.forEach(l=>l.dispose());this.proof?.dispose();const geometries=new Set<BufferGeometry>(),materials=new Set<Material>(),textures=new Set<Texture>();this.root.traverse(o=>{if(o instanceof Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const v of Object.values(m))if(v instanceof Texture)textures.add(v);}}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());this.renderer.dispose();canvas.remove();
 }
}
