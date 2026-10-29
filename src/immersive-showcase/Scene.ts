import {
 ACESFilmicToneMapping,Box3,CatmullRomCurve3,DirectionalLight,FogExp2,Group,
 HemisphereLight,Mesh,MeshStandardMaterial,PCFSoftShadowMap,PerspectiveCamera,
 PlaneGeometry,PMREMGenerator,Scene,ShadowMaterial,SRGBColorSpace,Vector3,WebGLRenderer,Raycaster,Vector2,
} from 'three';
import type {WebGLRenderTarget,Object3D} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {CuffCurve} from '../advertising/geometry/CuffCurve.ts';
import {CuffMaterial} from '../advertising/geometry/CuffMaterial.ts';
import {StudioMaterials} from '../advertising/scene/StudioMaterials.ts';
import type {CuffMetadata} from '../advertising/types.ts';
import {CameraDirector} from './CameraDirector.ts';
import type {CameraPose} from './CameraDirector.ts';
import {ParticleArrival,ARRIVAL_TIMING} from './ParticleArrival.ts';
import {attachArrival,meshBounds,sampleProductSurface} from './surface.ts';
import type {RevealMaterial} from './surface.ts';
import type {PartId,Quality,ShowcaseMode} from './ui.ts';
export const SOURCE_MODEL_SHA='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4';
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(n:number)=>{n=clamp(n);return n*n*(3-2*n);};
const PART_IDS:PartId[]=['cuff','tongue','pattern','clasps','heel','aglets','logo'];
interface Events {onReady():void;onPart(part:PartId):void;onMode(mode:ShowcaseMode):void;onError(message:string):void;onLoad(progress:number):void;onFrame?():void;}
function labels(node:Object3D){let n:Object3D|null=node,s='';while(n){s+=' '+n.name+' '+String(n.userData.part??'')+' '+String(n.userData.adActor??'');n=n.parent;}return s;}
function classify(mesh:Mesh):PartId|undefined{
 const name=labels(mesh),materials=(Array.isArray(mesh.material)?mesh.material:[mesh.material]).map(m=>m.name).join(' ');
 if(/Heel_Logo/.test(name))return'logo';if(/Heel_Leather|Heel_Seam/.test(name))return'heel';if(/Aglets/.test(name))return'aglets';if(/Clasp/.test(name))return'clasps';if(/Tongue/.test(name))return'tongue';if(/AD_Cuff|AD_Garment|Cuff_Artwork|Upper_Eyelets|Quilt_Seam/.test(name))return'cuff';if(/Body_Canvas|Body_Inner_Canvas/.test(materials))return'pattern';return undefined;
}
async function fetchModel(url:string,onLoad:(p:number)=>void,signal?:AbortSignal){
 const response=await fetch(url,{signal});if(!response.ok)throw Error(`模型载入失败（${response.status}）`);const total=Number(response.headers.get('content-length'))||23_870_000,reader=response.body?.getReader();
 let bytes:ArrayBuffer;if(!reader)bytes=await response.arrayBuffer();else{const chunks:Uint8Array[]=[];let loaded=0;for(;;){const r=await reader.read();if(r.done)break;chunks.push(r.value);loaded+=r.value.length;onLoad(Math.min(.88,loaded/total*.88));}const joined=new Uint8Array(loaded);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}bytes=joined.buffer;}
 const digest=await crypto.subtle.digest('SHA-256',bytes),sha=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(sha!==SOURCE_MODEL_SHA)throw Error('展示资产版本校验失败，未套用错误的结构动画。');return bytes;
}
export class ShowcaseScene {
 readonly scene=new Scene();readonly product=new Group();readonly normalized=new Group();
 readonly camera=new PerspectiveCamera(32,1,.02,80);readonly renderer:WebGLRenderer;readonly controls:OrbitControls;readonly director:CameraDirector;
 readonly parts=new Map<PartId,Mesh[]>();asset?:Group;particles?:ParticleArrival;surfaceSamples?:ReturnType<typeof sampleProductSurface>;cuff?:CuffMaterial;
 ready=false;loadingError?:string;introProgress=0;focusPart?:PartId;mode:ShowcaseMode='story';quality:Quality;motion=true;unfold=0;renderedFrames=0;
 private materials:RevealMaterial[]=[];private repairs=new StudioMaterials();private environment?:WebGLRenderTarget;private observer:ResizeObserver;
 private key:DirectionalLight;private fill:DirectionalLight;private rim:DirectionalLight;private floor:Mesh<PlaneGeometry,ShadowMaterial>;
 private abortController=new AbortController();private hoverAt=0;private frame=0;private last=0;private clock=0;private lastRender=0;private renderedAt:number[]=[];private disposed=false;private contextLost=false;
 introPaused=false;private introElapsed=0;private scrollProgress=0;private yaw=0;private width=1;private height=1;private loadGeneration=0;
 private unfoldMotion?:{from:number;to:number;elapsed:number;duration:number};private sourceCenter=new Vector3();private sourceScale=1;
 private ray=new Raycaster();private ndc=new Vector2();private pointerDown=new Map<number,{x:number;y:number;moved:boolean}>();
 private readonly coarse=matchMedia('(pointer:coarse)').matches;
 private readonly cameraCurve=new CatmullRomCurve3([new Vector3(-3.45,1.7,6.15),new Vector3(-2.45,2.3,5.8),new Vector3(2.6,1.5,5.9),new Vector3(-3.1,2.2,6.1)]);
 private readonly targetCurve=new CatmullRomCurve3([new Vector3(0,.12,0),new Vector3(.22,.28,0),new Vector3(.25,.32,0),new Vector3(0,.1,0)]);
 constructor(readonly host:HTMLElement,readonly events:Events){
  this.quality=this.coarse?'balanced':'high';this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.renderer=new WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.02;
  this.renderer.setClearColor(0x030812,0);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
  const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Soulgrain Onward 真实三维鞋模。拖动旋转，双指缩放，点击部位近看。');canvas.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y;';host.append(canvas);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enablePan=false;this.controls.enableDamping=true;this.controls.dampingFactor=.11;this.controls.rotateSpeed=.46;this.controls.zoomSpeed=.7;this.controls.minDistance=.9;this.controls.maxDistance=16;this.controls.minPolarAngle=.12;this.controls.maxPolarAngle=Math.PI*.89;this.controls.enabled=false;this.controls.enableZoom=false;
  this.director=new CameraDirector(this.camera,this.controls);this.scene.fog=new FogExp2(0x050a14,.018);this.scene.add(new HemisphereLight(0xc1d8f7,0x0b0b19,.68));
  const room=new RoomEnvironment(),pmrem=new PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(room,.025,.1,100,{size:256});this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.65;pmrem.dispose();room.dispose();
  this.key=new DirectionalLight(0xfff2e7,3.4);this.key.position.set(-3.5,5,5);this.key.castShadow=true;this.key.shadow.camera.left=-4;this.key.shadow.camera.right=4;this.key.shadow.camera.top=3;this.key.shadow.camera.bottom=-3;this.key.shadow.camera.near=.1;this.key.shadow.camera.far=22;this.key.shadow.normalBias=.015;this.key.shadow.bias=-.0002;
  this.fill=new DirectionalLight(0x9ec9ff,1.35);this.fill.position.set(3,2,-5);this.rim=new DirectionalLight(0xdcefff,3.5);this.rim.position.set(2,4,-2.5);this.scene.add(this.key,this.fill,this.rim);
  this.floor=new Mesh(new PlaneGeometry(25,25),new ShadowMaterial({opacity:.3}));this.floor.rotation.x=-Math.PI/2;this.floor.position.y=-1.12;this.floor.receiveShadow=true;this.scene.add(this.floor);
  this.product.name='Nightfall_Original_Design_Display';this.normalized.name='Uniform_Display_Normalization';this.product.add(this.normalized);this.scene.add(this.product);
  for(const id of PART_IDS)this.parts.set(id,[]);this.setQuality(this.quality);this.resize();this.director.apply(this.storyPose());
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
  canvas.addEventListener('pointerdown',this.down,true);this.inputMode();canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancelPointer);
  canvas.addEventListener('webglcontextlost',this.lost);canvas.addEventListener('webglcontextrestored',this.restored);document.addEventListener('visibilitychange',this.visibility);
  this.loop= this.loop.bind(this);this.frame=requestAnimationFrame(this.loop);
 }
 async load(){const generation=++this.loadGeneration;this.loadingError=undefined;
  try{
   const base=import.meta.env.BASE_URL+'assets/onward-ad-v1/';
   const[bytes,meta]=await Promise.all([fetchModel(base+'onward-ad-v1.glb',p=>{if(generation===this.loadGeneration&&!this.disposed)this.events.onLoad(p);},this.abortController.signal),fetch(base+'cuff-structure.json',{signal:this.abortController.signal}).then(async r=>{if(!r.ok)throw Error('翻筒结构数据载入失败');return r.json()as Promise<CuffMetadata>;})]);
   const gltf=await new GLTFLoader().parseAsync(bytes,base);if(generation!==this.loadGeneration)return;
   const asset=gltf.scene;asset.updateMatrixWorld(true);const bounds=new Box3().setFromObject(asset);this.sourceCenter=bounds.getCenter(new Vector3());this.sourceScale=3.4/bounds.getSize(new Vector3()).x;
   this.surfaceSamples=sampleProductSurface(asset,this.sourceCenter,this.sourceScale,9000);this.particles=new ParticleArrival(this.surfaceSamples.positions,9000);this.particles.setQuality(this.quality);this.particles.setPixelRatio(this.renderer.getPixelRatio());this.product.add(this.particles.group);
   this.cuff=new CuffMaterial(new CuffCurve(meta));
   asset.traverse(node=>{if(!(node instanceof Mesh))return;const part=classify(node);if(part)this.parts.get(part)!.push(node);node.castShadow=node.receiveShadow=true;
    const originals=Array.isArray(node.material)?node.material:[node.material];const prepared=originals.map(source=>{if(!(source instanceof MeshStandardMaterial))return source;let material=source.clone();this.repairs.apply(material);if(material.map)material.map.anisotropy=Math.min(8,this.renderer.capabilities.getMaxAnisotropy());if(node.geometry.hasAttribute('_sg_param'))material=this.cuff!.attach(material,/Mongolian_Clasp_Loops/.test(labels(node)));this.materials.push(attachArrival(material,part));return material;});node.material=Array.isArray(node.material)?prepared:prepared[0];
    if(node.geometry.hasAttribute('_sg_param')){node.frustumCulled=false;node.customDepthMaterial=this.cuff!.depth(/Mongolian_Clasp_Loops/.test(labels(node)));}
   });
   this.asset=asset;this.normalized.position.copy(this.sourceCenter).multiplyScalar(-this.sourceScale);this.normalized.scale.setScalar(this.sourceScale);this.normalized.add(asset);
   if(PART_IDS.some(id=>!this.parts.get(id)!.length))throw Error('展示资产缺少独立部位，未创建虚假的探索目标。');
   this.ready=true;this.events.onLoad(1);this.replayIntro();this.events.onReady();this.renderer.shadowMap.needsUpdate=true;
  }catch(error){if(this.disposed||generation!==this.loadGeneration)return;this.loadingError=String(error);this.events.onError(this.loadingError);}
 }
 private resize(){
  const previousAspect=this.width/this.height,rect=this.host.getBoundingClientRect();
  this.width=Math.max(1,rect.width);this.height=Math.max(1,rect.height);
  const aspect=this.width/this.height,cap=this.quality==='high'?1.75:this.quality==='balanced'?1.3:1,budget=this.quality==='high'?3_800_000:2_200_000;
  const dpr=Math.min(devicePixelRatio||1,cap,Math.sqrt(budget/(this.width*this.height)));
  this.renderer.setPixelRatio(Math.max(.85,dpr));this.renderer.setSize(this.width,this.height,false);this.particles?.setPixelRatio(this.renderer.getPixelRatio());this.director.resize(this.width,this.height);
  if(!this.ready||this.mode!=='free')return;
  // Entering free mode hides the page scrollbar. That small layout resize must
  // not cancel the camera journey which the same interaction just started.
  const changesLayout=(previousAspect>1.12)!==(aspect>1.12);
  if(!changesLayout&&Math.abs(aspect-previousAspect)<.04)return;
  if(this.director.moving&&this.focusPart){
   this.director.begin(this.partPose(this.focusPart,this.unfoldMotion?.to??this.unfold),this.motion?1.2:.15);
   return;
  }
  const oldFit=Math.max(1,1.12/previousAspect),newFit=Math.max(1,1.12/aspect);
  this.camera.position.sub(this.controls.target).multiplyScalar(newFit/oldFit).add(this.controls.target);this.director.cancel();this.controls.update();
  const pose=this.director.capture();pose.framing=this.focusPart&&aspect>1.12?-.12:0;pose.vertical=this.focusPart&&aspect<=1.12?.17:0;this.director.apply(pose);
 }
 private portrait(distance:Vector3){return distance.multiplyScalar(Math.max(1,1.12/(this.width/this.height)));}
 private storyPose():CameraPose{const p=this.scrollProgress,position=this.portrait(this.cameraCurve.getPoint(p)),target=this.targetCurve.getPoint(p);return{position,target,framing:this.width/this.height>1.12?.14:0};}
 private localPoint(id:PartId){const nodes=this.parts.get(id)!;this.product.updateMatrixWorld(true);
  if(id==='tongue'){const gems=nodes.filter(n=>/Rhinestone/.test(labels(n)));if(gems.length)return meshBounds(gems).getCenter(new Vector3());}
  if(id==='clasps'){const heads=nodes.filter(n=>/Clasp_Heads/.test(labels(n)));if(heads.length)return meshBounds(heads).getCenter(new Vector3());}
  if(id==='aglets'){const bounds=new Box3(),point=new Vector3();for(const mesh of nodes){const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++)if(p.getZ(i)>0)bounds.expandByPoint(point.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld));}if(!bounds.isEmpty())return bounds.getCenter(new Vector3());}
  return meshBounds(nodes).getCenter(new Vector3());}
 partPose(id:PartId,unfoldTarget=this.unfold):CameraPose{
  const target=this.localPoint(id);let offset:Vector3;
  if(id==='cuff'){target.copy(this.sourceToWorld(new Vector3(.085,.087,.043)));offset=new Vector3(-.4,.7,2.65);if(unfoldTarget>.01&&this.cuff){const flat=this.cuff.curve.center.clone();flat.y+=this.cuff.curve.meta.height/2+.015;flat.z+=.014;target.lerp(this.sourceToWorld(flat),unfoldTarget);offset.lerp(new Vector3(-.4,1.25,5.2),unfoldTarget);}}
  else if(id==='tongue')offset=new Vector3(-1.15,1.35,2.7);else if(id==='pattern'){target.copy(this.sourceToWorld(new Vector3(-.014,.028,.044)));offset=new Vector3(-.35,.45,3.25);}else if(id==='clasps')offset=new Vector3(-.55,.35,1.85);else if(id==='heel'){const bounds=meshBounds(this.parts.get(id)!);target.y=bounds.min.y+(bounds.max.y-bounds.min.y)*.28;offset=new Vector3(2.55,.28,.32);}else if(id==='logo')offset=new Vector3(2.3,.32,.12);else offset=new Vector3(-.65,.55,1.8);
  offset.applyQuaternion(this.product.quaternion);this.portrait(offset);return{target,position:target.clone().add(offset),framing:this.width/this.height>1.12?-.12:0,vertical:this.width/this.height<=1.12?.17:0};
 }
 private sourceToWorld(point:Vector3){return this.product.localToWorld(point.sub(this.sourceCenter).multiplyScalar(this.sourceScale));}
 selectPart(id:PartId){if(!this.ready||!PART_IDS.includes(id))return false;this.skipIntro();this.focusPart=id;this.mode='free';this.controls.enabled=true;this.controls.enableZoom=true;this.unfoldMotion={from:this.unfold,to:0,elapsed:0,duration:this.motion?1.35:.15};this.director.begin(this.partPose(id,0),this.motion?1.7:.15);this.inputMode();this.events.onMode(this.mode);this.events.onPart(id);return true;}
 home(){if(!this.ready)return;this.skipIntro();this.focusPart=undefined;this.mode='story';this.controls.enabled=true;this.controls.enableZoom=false;this.unfoldMotion={from:this.unfold,to:0,elapsed:0,duration:this.motion?1.35:.15};this.director.begin(this.storyPose(),this.motion?1.7:.15);this.inputMode();this.events.onMode(this.mode);}
 setMode(mode:ShowcaseMode){if(!this.ready)return;this.skipIntro();this.mode=mode;if(mode==='free'){this.director.cancel();this.controls.enableZoom=true;}else{this.focusPart=undefined;this.controls.enableZoom=false;this.director.begin(this.storyPose(),this.motion?1.7:.15);}this.controls.enabled=true;this.inputMode();if(mode==='story')this.unfoldMotion={from:this.unfold,to:0,elapsed:0,duration:this.motion?1.35:.15};this.events.onMode(mode);}
 setScrollProgress(p:number){if(!Number.isFinite(p))return;this.scrollProgress=clamp(p);}
 setUnfold(value:number){if(!this.ready)return false;if(this.focusPart!=='cuff')this.selectPart('cuff');const target=clamp(value);this.unfoldMotion={from:this.unfold,to:target,elapsed:0,duration:this.motion?2.1:.15};this.director.begin(this.partPose('cuff',target),this.motion?2.1:.15);return true;}
 setQuality(q:Quality){if(!['high','balanced','low'].includes(q))return;this.quality=q;this.particles?.setQuality(q);const size=q==='high'?1536:q==='balanced'?1024:512;this.key.shadow.mapSize.set(size,size);this.key.shadow.map?.dispose();this.key.shadow.map=null;this.renderer.shadowMap.enabled=q!=='low'&&this.introProgress>=.98;this.resize();this.renderer.shadowMap.needsUpdate=true;}
 setMotion(enabled:boolean){this.motion=enabled;if(!enabled){this.skipIntro();if(this.director.moving)this.director.seek(1);if(this.unfoldMotion)this.seekUnfold(this.unfoldMotion.to);}}
 replayIntro(){if(!this.ready)return;this.focusPart=undefined;this.mode='story';this.controls.enableZoom=false;this.inputMode();this.unfold=0;this.unfoldMotion=undefined;this.cuff?.set(0,0);this.yaw=0;this.product.rotation.set(0,0,0);this.product.position.set(0,0,0);this.director.cancel();this.director.apply(this.storyPose());this.introElapsed=0;this.introPaused=false;this.introProgress=this.motion?0:1;this.controls.enabled=this.introProgress===1;this.renderer.shadowMap.enabled=false;this.seekIntro(this.introProgress);this.events.onMode(this.mode);}
 seekIntro(progress:number){this.introProgress=clamp(progress);this.introElapsed=this.introProgress*ARRIVAL_TIMING.durationSeconds;this.materials.forEach(r=>r.reveal.value=smooth((this.introProgress-ARRIVAL_TIMING.productStart)/(ARRIVAL_TIMING.productComplete-ARRIVAL_TIMING.productStart)));this.particles?.update(this.introProgress,this.clock,!this.motion);if(this.introProgress>=1){this.controls.enabled=true;this.renderer.shadowMap.enabled=this.quality!=='low';this.renderer.shadowMap.needsUpdate=true;}}
 skipIntro(){this.introPaused=false;this.seekIntro(1);this.inputMode();}
 seekUnfold(value:number){this.unfoldMotion=undefined;this.unfold=clamp(value);this.cuff?.set(this.unfold,this.unfold*.7);if(this.focusPart==='cuff'){this.director.cancel();this.director.apply(this.partPose('cuff',this.unfold));}this.renderer.shadowMap.needsUpdate=true;}
 seekTransition(p:number){this.director.seek(clamp(p));}
 projectPart(id:PartId){const point=id==='cuff'?this.sourceToWorld(new Vector3(.077,.078,.045)):this.localPoint(id),p=point.clone().project(this.camera);return{x:(p.x*.5+.5)*this.width,y:(-.5*p.y+.5)*this.height,world:point.toArray(),visible:p.z>-1&&p.z<1};}
 private pick(clientX:number,clientY:number){if(!this.asset||this.introProgress<1)return;const rect=this.renderer.domElement.getBoundingClientRect();this.ndc.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.ndc,this.camera);const hits=this.ray.intersectObjects([...this.parts.values()].flat(),false);for(const hit of hits){const id=classify(hit.object as Mesh);if(id==='cuff'&&this.unfold>.01)continue;if(id)return id;}}
 private inputMode(){const action=this.mode==='free'?'none':'pan-y';this.host.style.touchAction=action;this.renderer.domElement.style.touchAction=action;this.controls.enableRotate=true;}
 private down=(e:PointerEvent)=>{for(const p of this.pointerDown.values())p.moved=true;this.pointerDown.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:this.pointerDown.size>0});if(this.ready&&this.introProgress>=1){this.director.cancel();if(e.pointerType==='touch'&&this.mode==='story'){if(this.pointerDown.size>1){this.mode='free';this.controls.enableZoom=true;this.inputMode();this.events.onMode('free');}else this.controls.enableRotate=false;}}};
 private move=(e:PointerEvent)=>{const down=this.pointerDown.get(e.pointerId);if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down.moved=true;if(e.pointerType!=='touch'&&this.ready&&this.introProgress===1){this.director.cancel();this.unfoldMotion=undefined;if(this.mode!=='free'){this.mode='free';this.controls.enableZoom=true;this.inputMode();this.events.onMode(this.mode);}}}else if(!down&&e.pointerType==='mouse'&&this.ready){if(performance.now()-this.hoverAt<80)return;this.hoverAt=performance.now();this.renderer.domElement.style.cursor=this.pick(e.clientX,e.clientY)?'pointer':'grab';}};
 private up=(e:PointerEvent)=>{const p=this.pointerDown.get(e.pointerId);const pick=p&&!p.moved&&this.pointerDown.size===1;this.pointerDown.delete(e.pointerId);if(!this.pointerDown.size)this.controls.enableRotate=true;if(!pick)return;const part=this.pick(e.clientX,e.clientY);if(part)this.selectPart(part);};
 private cancelPointer=(e:PointerEvent)=>{this.pointerDown.delete(e.pointerId);if(!this.pointerDown.size)this.controls.enableRotate=true;};
 private lost=(e:Event)=>{e.preventDefault();this.contextLost=true;this.events.onError('图形上下文暂时中断，请重新载入体验。');};
 private restored=()=>{this.contextLost=false;this.events.onError('图形上下文已恢复，请重新加载以重建材质。');};
 private visibility=()=>{if(!document.hidden&&!this.frame&&!this.disposed){this.last=0;this.frame=requestAnimationFrame(this.loop);}};
 private loop(timestamp:number){this.frame=0;if(this.disposed||document.hidden)return;const dt=this.last?Math.min(.3,(timestamp-this.last)/1000):0;this.last=timestamp;this.clock+=dt;
  if(this.ready){if(this.introProgress<1&&!this.introPaused)this.seekIntro(Math.min(1,(this.introElapsed+dt)/ARRIVAL_TIMING.durationSeconds));
   if(this.unfoldMotion){const m=this.unfoldMotion;m.elapsed+=dt;const p=smooth(m.elapsed/m.duration);this.unfold=m.from+(m.to-m.from)*p;this.cuff?.set(this.unfold,this.unfold*.7);if(m.elapsed>=m.duration)this.unfoldMotion=undefined;this.renderer.shadowMap.needsUpdate=true;}
   this.director.update(dt);if(!this.director.moving&&this.mode==='story'&&!this.focusPart&&this.introProgress>=1){const desired=this.storyPose(),current=this.director.capture(),t=1-Math.exp(-dt*4);this.director.apply({position:current.position.lerp(desired.position,t),target:current.target.lerp(desired.target,t),framing:desired.framing});}
   if(this.motion&&this.mode==='story'&&!this.focusPart&&this.introProgress>=1&&!this.director.moving){this.yaw+=dt*.045;this.product.rotation.y=this.yaw;this.product.rotation.z=Math.sin(this.clock*.3)*.012;this.product.position.y=Math.sin(this.clock*.65)*.025;this.renderer.shadowMap.needsUpdate=true;}
   this.particles?.update(this.introProgress,this.clock,!this.motion);for(const r of this.materials){const target=this.focusPart&&r.part!==this.focusPart? .68:1;r.focus.value+=(target-r.focus.value)*(1-Math.exp(-dt*5));}
   if(this.motion){this.key.position.x=-3.5+Math.sin(this.clock*.18)*.4;this.rim.intensity=3.5+Math.sin(this.clock*.55)*.12;}
  }
  this.controls.update();const active=this.director.moving||Boolean(this.unfoldMotion)||this.introProgress<1||this.pointerDown.size>0,interval=active?1000/(this.coarse?40:60):1000/24;
  if(!this.contextLost&&timestamp-this.lastRender>=interval){this.renderer.render(this.scene,this.camera);this.lastRender=timestamp;this.renderedFrames++;this.renderedAt.push(timestamp);if(this.renderedAt.length>80)this.renderedAt.shift();this.events.onFrame?.();}
  this.frame=requestAnimationFrame(this.loop);
 }
 get isTransitioning(){return this.director.moving||Boolean(this.unfoldMotion);}
 getState(){const timings=this.renderedAt.slice(1).map((n,i)=>n-this.renderedAt[i]);return{ready:this.ready,loadingError:this.loadingError??null,introProgress:this.introProgress,focusPart:this.focusPart??null,mode:this.mode,unfold:this.unfold,isTransitioning:this.director.moving||Boolean(this.unfoldMotion),camera:this.director.getState(),quality:this.quality,particleCount:this.particles?.getState().activeCount??0,particles:this.particles?.getState(),pixelRatio:this.renderer.getPixelRatio(),drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,renderedFrames:this.renderedFrames,sourceModelSHA:SOURCE_MODEL_SHA,productReveal:this.materials[0]?.reveal.value??0,renderedParticleCount:this.particles?.group.visible?(this.particles.getState().activeCount):0,normalRepair:this.repairs.info(),parts:PART_IDS.map(id=>({id,meshes:this.parts.get(id)?.length??0,screen:this.ready?this.projectPart(id):null})),normalization:{center:this.sourceCenter.toArray(),scale:this.sourceScale},contextLost:this.contextLost,motion:this.motion,softwareIndependentFrameIntervals:timings,surfaceSampling:this.surfaceSamples?{method:this.surfaceSamples.method,count:this.surfaceSamples.positions.length/3,sourceTriangleCount:this.surfaceSamples.sourceTriangleCount,references:this.surfaceSamples.references}:undefined};}
 dispose(){this.disposed=true;this.abortController.abort();this.loadGeneration++;cancelAnimationFrame(this.frame);this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);const canvas=this.renderer.domElement;canvas.removeEventListener('pointerdown',this.down,true);canvas.removeEventListener('pointermove',this.move);canvas.removeEventListener('pointerup',this.up);canvas.removeEventListener('pointercancel',this.cancelPointer);canvas.removeEventListener('webglcontextlost',this.lost);canvas.removeEventListener('webglcontextrestored',this.restored);this.controls.dispose();this.particles?.dispose();this.cuff?.dispose();this.repairs.dispose();this.environment?.dispose();this.scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.renderer.dispose();this.renderer.forceContextLoss();canvas.remove();}
}
