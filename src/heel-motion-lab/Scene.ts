import {ACESFilmicToneMapping,Box3,BufferAttribute,BufferGeometry,DirectionalLight,GridHelper,Group,HemisphereLight,InstancedMesh,Line,LineBasicMaterial,Matrix4,Mesh,MeshBasicMaterial,MeshStandardMaterial,PerspectiveCamera,PMREMGenerator,Raycaster,Scene,SphereGeometry,SRGBColorSpace,Vector2,Vector3,WebGLRenderer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {StudioMaterials} from '../advertising/scene/StudioMaterials.ts';
import {CameraDirector} from '../immersive-showcase/CameraDirector.ts';
import {DEFAULTS,DURATION,actionToProgress,clamp,evaluate,phase,smooth} from './motion.ts';
import type {Mode,Parameters,View} from './motion.ts';
import {SOURCE_CENTER,SOURCE_SCALE,SOURCE_SHA,SOURCE_URL,fingerprint} from './Surface.ts';
import {HeelActor} from './HeelActor.ts';
import {MotionPath} from './Path.ts';
import {Ribbon} from './Ribbon.ts';
import {HeelReaction} from './Reaction.ts';
import {heelDirectorShot} from './DirectorShot.ts';

interface Events{ready():void;change():void;error(message:string):void;point(index:number):void;}
export class HeelLab {
 readonly scene=new Scene();readonly shoe=new Group();readonly normalized=new Group();readonly camera=new PerspectiveCamera(34,1,.04,100);
 readonly renderer:WebGLRenderer;readonly controls:OrbitControls;readonly director:CameraDirector;readonly path=new MotionPath();readonly ribbon=new Ribbon();
 readonly params:Parameters={...DEFAULTS};actor?:HeelActor;asset?:Group;ready=false;error?:string;verifiedSHA:string|null=null;
 readonly reaction=new HeelReaction();
 progress=0;playing=false;speed=1;cameraOwner:'director'|'free'|'inspection'='director';view:View='director';guides=false;selected=10;
 private repairs=new StudioMaterials();private abort=new AbortController();private dirty=true;private renderNeeded=true;private frame=0;private last=0;private uiAt=0;private observer:ResizeObserver;
 private originals=new Map<Mesh,{fingerprint:string;visible:boolean;matrix:number[]}>();private sourceBox=new Box3();private contextLost=false;private disposed=false;
 private returnTrack?:{fromU:number;fromP:number;time:number;duration:number;cameraPosition:Vector3;cameraTarget:Vector3};private lastRendered=0;private intervals:number[]=[];
 private guideLine:Line;private handles:InstancedMesh;private selectedHandle:Mesh;private ray=new Raycaster();private pointer=new Vector2();private down?:{x:number;y:number};
 private pmremTarget;private stageGrid:GridHelper;private risk={bboxWarnings:0,nearPlaneWarnings:0,minimumCameraDepth:0};
 constructor(readonly host:HTMLElement,readonly events:Events){
  this.renderer=new WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.setClearColor(0x090f18);
  const canvas=this.renderer.domElement;canvas.style.cssText='width:100%;height:100%;display:block;touch-action:none';canvas.setAttribute('aria-label','Heel Motion Lab 三维场景，拖动自由旋转，双指缩放');host.append(canvas);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enablePan=true;this.controls.enableDamping=true;this.controls.dampingFactor=.13;this.controls.minDistance=1.2;this.controls.maxDistance=24;this.controls.enabled=false;
  this.director=new CameraDirector(this.camera,this.controls);this.controls.addEventListener('change',this.cameraChanged);
  const generator=new PMREMGenerator(this.renderer),room=new RoomEnvironment();this.pmremTarget=generator.fromScene(room,.04,.1,100,{size:128});this.scene.environment=this.pmremTarget.texture;this.scene.environmentIntensity=.65;generator.dispose();room.dispose();
  this.scene.add(new HemisphereLight(0xc9d9f3,0x171018,1.15));
  for(const[position,color,intensity]of[[[-3,6,7],0xf3e9d9,3.1],[[4,3,-5],0xa4c4f2,3.7],[[1,1,6],0xffffff,.6]] as const){const light=new DirectionalLight(color,intensity);light.position.fromArray(position);this.scene.add(light);}
  this.shoe.name='Original_Shoe_Runtime_Pose';this.normalized.scale.setScalar(SOURCE_SCALE);this.normalized.position.copy(SOURCE_CENTER).multiplyScalar(-SOURCE_SCALE);this.shoe.add(this.normalized);this.scene.add(this.shoe,this.ribbon.group);
  this.stageGrid=new GridHelper(18,36,0x30445d,0x172638);this.stageGrid.position.y=-1.6;(this.stageGrid.material as LineBasicMaterial).transparent=true;(this.stageGrid.material as LineBasicMaterial).opacity=.22;this.scene.add(this.stageGrid);
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(601*3),3));this.guideLine=new Line(geometry,new LineBasicMaterial({color:0x6b9ea7,transparent:true,opacity:.65}));this.guideLine.frustumCulled=false;this.scene.add(this.guideLine);
  this.handles=new InstancedMesh(new SphereGeometry(.035,8,6),new MeshBasicMaterial({color:0xa5c4cf}),64);this.handles.count=0;this.handles.frustumCulled=false;this.scene.add(this.handles);
  this.selectedHandle=new Mesh(new SphereGeometry(.058,12,8),new MeshBasicMaterial({color:0xf1c29c}));this.scene.add(this.selectedHandle);
  this.setGuides(false);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.director.apply(this.directorPose());
  canvas.addEventListener('pointerdown',this.pointerDown,true);canvas.addEventListener('pointerup',this.pointerUp);canvas.addEventListener('pointercancel',this.pointerCancel);canvas.addEventListener('webglcontextlost',this.lost);canvas.addEventListener('webglcontextrestored',this.restored);document.addEventListener('visibilitychange',this.visibility);
  this.frame=requestAnimationFrame(this.loop);
 }
 async load(){try{
  const response=await fetch(import.meta.env.BASE_URL+SOURCE_URL,{signal:this.abort.signal});if(!response.ok)throw Error(`模型加载失败 HTTP ${response.status}`);const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==23873476)throw Error('模型字节长度不符，停止套用锚点');
  if(globalThis.crypto?.subtle){this.verifiedSHA=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');if(this.verifiedSHA!==SOURCE_SHA)throw Error('源 GLB SHA 校验失败');}
  const gltf=await new GLTFLoader().parseAsync(bytes,'');if(this.disposed)return;this.asset=gltf.scene;
  this.asset.traverse(o=>{if(!(o instanceof Mesh))return;const source=Array.isArray(o.material)?o.material:[o.material];const prepared=source.map(m=>{if(!(m instanceof MeshStandardMaterial))return m;const material=m.clone();this.repairs.apply(material);return material;});o.material=Array.isArray(o.material)?prepared:prepared[0];});
  const panel=this.asset.getObjectByName('Finished_Heel_Leather'),sewing=this.asset.getObjectByName('Heel_Leather_Stitching');if(!(panel instanceof Mesh)||!(sewing instanceof Mesh))throw Error('缺少原皮条或缝线，不创建替代鞋模');
  for(const name of['Finished_Heel_Leather','Heel_Leather_Stitching','Heel_Seam_Stitch','Finished_Heel_Logo']){const m=this.asset.getObjectByName(name);if(!(m instanceof Mesh))throw Error('缺少契约节点 '+name);m.updateMatrix();this.originals.set(m,{fingerprint:fingerprint(m.geometry),visible:m.visible,matrix:m.matrix.toArray()});}
  this.normalized.add(this.asset);this.scene.updateMatrixWorld(true);this.sourceBox.setFromObject(this.shoe);this.actor=new HeelActor(panel,sewing);if(this.actor.restError>1e-6)throw Error('原表面映射误差超过契约');this.scene.add(this.actor.group);this.ready=true;this.dirty=true;this.updateGeometry();this.events.ready();
 }catch(e){if(!this.disposed){this.error=String(e);this.events.error(this.error);}}}
 private resize(){const r=this.host.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.25:1.5,Math.sqrt(1800000/(w*h))));this.renderer.setSize(w,h,false);this.director.resize(w,h);this.dirty=true;this.renderNeeded=true;}
 get pose(){const p=this.returnTrack ? actionToProgress(.74*this.returnTrack.fromU*(1-smooth(this.returnTrack.time/this.returnTrack.duration))) : this.progress;return evaluate(p,this.reaction);}
 directorPose(){
  if(this.returnTrack){const end=heelDirectorShot(evaluate(1,this.reaction),this.actor?.surface.middle,this.camera.aspect),w=smooth(this.returnTrack.time/this.returnTrack.duration);return{position:this.returnTrack.cameraPosition.clone().lerp(end.position,w),target:this.returnTrack.cameraTarget.clone().lerp(end.target,w),framing:0};}
  return heelDirectorShot(this.pose,this.actor?.surface.focus,this.camera.aspect);
 }
 private updateGeometry(){if(!this.actor)return;this.reaction.rebuild(this.actor.surface,this.params,this.path.offsets);const pose=this.pose;this.shoe.position.copy(pose.position);this.shoe.quaternion.copy(pose.quaternion);this.shoe.updateMatrixWorld(true);
  this.path.update(this.actor.surface,this.params,pose.matrix,pose.outbound);this.actor.update(pose);this.ribbon.update(this.path,this.params,pose.release,v=>this.actor!.edge(pose,v));
  const attr=this.guideLine.geometry.getAttribute('position');for(let i=0;i<this.path.samples.length;i++)this.path.samples[i].toArray(attr.array as Float32Array,i*3);attr.needsUpdate=true;
  const matrix=new Matrix4();this.handles.count=this.path.points.length;for(let i=0;i<this.path.points.length;i++)this.handles.setMatrixAt(i,matrix.makeTranslation(...this.path.points[i].toArray()));this.handles.instanceMatrix.needsUpdate=true;this.selectedHandle.position.copy(this.path.points[this.selected]??this.path.points[3]);
  this.dirty=false;this.renderNeeded=true;
 }
 advance(dt:number){if(!this.ready)return;
  if(this.returnTrack&&this.playing){this.returnTrack.time+=dt*this.speed;this.progress=this.returnTrack.fromP+(1-this.returnTrack.fromP)*clamp(this.returnTrack.time/this.returnTrack.duration);if(this.returnTrack.time>=this.returnTrack.duration){this.returnTrack=undefined;this.progress=1;this.playing=false;}this.dirty=true;}
  else if(this.playing){this.progress=clamp(this.progress+dt*this.speed/DURATION);if(this.progress>=1)this.playing=false;this.dirty=true;}
  if(this.dirty)this.updateGeometry();
 }
 private render(){if(this.cameraOwner==='director'&&!this.director.moving)this.director.apply(this.directorPose());this.controls.enabled=this.cameraOwner!=='director'&&!this.director.moving;this.renderer.render(this.scene,this.camera);this.renderNeeded=false;}
 private loop=(timestamp:number)=>{this.frame=0;if(this.disposed||document.hidden)return;const dt=this.last?Math.max(0,(timestamp-this.last)/1000):0;this.last=timestamp;this.advance(dt);const moving=this.director.moving;this.director.update(dt);if(moving)this.renderNeeded=true;this.controls.enabled=this.cameraOwner!=='director'&&!this.director.moving;if(this.controls.enabled)this.controls.update();const interval=1000/60;
  if(!this.contextLost&&(this.renderNeeded||this.playing||moving)&&timestamp-this.lastRendered>=interval){this.render();if(this.lastRendered)this.intervals.push(timestamp-this.lastRendered);if(this.intervals.length>120)this.intervals.shift();this.lastRendered=timestamp;if(timestamp-this.uiAt>80){this.events.change();this.uiAt=timestamp;}}
  this.frame=requestAnimationFrame(this.loop);
 };
 seek(p:number){this.playing=false;this.returnTrack=undefined;this.progress=clamp(p);this.dirty=true;this.advance(0);this.events.change();}
 play(){if(!this.ready)return;if(this.progress>=1){this.progress=0;this.returnTrack=undefined;this.dirty=true;}this.playing=true;this.events.change();}
 pause(){this.playing=false;this.events.change();}
 replay(){this.seek(0);this.play();}
 returnToHeel(){if(!this.ready)return;const u=this.pose.outbound;if(this.cameraOwner==='director')this.director.cancel();this.returnTrack={fromU:u,fromP:this.progress,time:0,duration:4.5,cameraPosition:this.camera.position.clone(),cameraTarget:this.controls.target.clone()};this.playing=true;this.events.change();}
 cancel(){this.playing=false;this.returnTrack=undefined;if(this.cameraOwner==='director')this.director.cancel();this.progress=0;this.dirty=true;this.advance(0);this.events.change();}
 setParameter(key:keyof Parameters,value:number){const limits:Record<keyof Parameters,[number,number]>={radius:[.85,1.8],turns:[1,3],pitch:[.6,1.35],width:[.07,.34],thickness:[.003,.04],twist:[0,360],direction:[-35,35]};if(!Number.isFinite(value))return;this.params[key]=clamp(value,...limits[key]);this.dirty=true;this.advance(0);this.events.change();}
 setMode(mode:Mode){this.ribbon.setMode(mode);this.renderNeeded=true;this.events.change();}
 setGuides(show:boolean){this.guides=show;this.guideLine.visible=show;this.handles.visible=show;this.selectedHandle.visible=show;this.renderNeeded=true;}
 selectPoint(index:number){this.selected=Math.round(clamp(index,3,Math.max(3,this.path.points.length-3)));if(this.path.points[this.selected])this.selectedHandle.position.copy(this.path.points[this.selected]);this.renderNeeded=true;this.events.point(this.selected);}
 editPoint(axis:'x'|'y'|'z',value:number){if(!Number.isFinite(value))return;this.path.setOffset(this.selected,axis,value);this.dirty=true;this.advance(0);this.events.change();}
 resetPath(){this.path.offsets.clear();Object.assign(this.params,DEFAULTS);this.dirty=true;this.advance(0);this.events.change();}
 setView(view:View){this.view=view;this.cameraOwner=view==='director'?'director':'inspection';this.controls.enabled=false;const positions={side:new Vector3(0,1.2,9.5),rear:new Vector3(9.2,1.5,.2),above:new Vector3(4.5,6.8,7.2)};const pose=view==='director'?this.directorPose():{position:positions[view],target:new Vector3(0,.1,-.25),framing:0};if(this.camera.position.distanceTo(pose.position)+this.controls.target.distanceTo(pose.target)<1e-7){this.director.cancel();this.director.apply(pose);}else this.director.begin(pose,.85);this.events.change();}
 diagnostics(){const pose=this.pose,inverse=pose.matrix.clone().invert();let bbox=0,near=0,minDepth=Infinity;const forward=new Vector3();this.camera.getWorldDirection(forward);
  for(let i=0;i<this.ribbon.centers.length;i+=4){const point=this.ribbon.centers[i],local=point.clone().applyMatrix4(inverse),arc=(this.path.tipLength-this.path.restLength)*i/this.ribbon.segments;if(arc>.6&&pose.release>.98&&this.sourceBox.containsPoint(local))bbox++;const depth=point.clone().sub(this.camera.position).dot(forward);minDepth=Math.min(minDepth,depth);if(depth<this.camera.near+this.params.width)near++;}
  this.risk={bboxWarnings:bbox,nearPlaneWarnings:near,minimumCameraDepth:Number.isFinite(minDepth)?minDepth:0};return this.risk;
 }
 integrity(){return[...this.originals].map(([m,s])=>({name:m.name,geometryUnchanged:fingerprint(m.geometry)===s.fingerprint,localMatrixUnchanged:JSON.stringify(m.matrix.toArray())===JSON.stringify(s.matrix),visible:m.visible,expectedVisible:s.visible}));}
 getState(){const pose=this.pose;return{revision:'tangent-flow-heel-macro-v4',duration:DURATION,ready:this.ready,error:this.error??null,progress:this.progress,playing:this.playing,speed:this.speed,phase:this.returnTrack?'连续返回':phase(this.progress),outbound:pose.outbound,release:pose.release,cameraOwner:this.cameraOwner,view:this.view,camera:this.camera.position.toArray(),target:this.controls.target.toArray(),directorMoving:this.director.moving,parameters:{...this.params},mode:this.ribbon.mode,guides:this.guides,sourceSHA:SOURCE_SHA,browserVerifiedSHA:this.verifiedSHA,shoe:{position:this.shoe.position.toArray(),quaternion:this.shoe.quaternion.toArray()},reaction:pose.response?{force:pose.response.force.toArray(),torque:pose.response.torque.toArray(),angularVelocity:pose.response.angularVelocity.toArray(),method:'deterministic longitudinal-axis advertising inertia'}:null,actor:this.actor?.getState(),ribbon:this.ribbon.stats(),path:{sourceEdge:'lower',controlPoints:this.path.points.map(p=>p.toArray()),offsets:[...this.path.offsets].map(([i,p])=>({i,offset:p.toArray()})),frameError:this.path.frameError,minimumFrameDot:this.path.minimumFrameDot,reversals:this.path.reversals,length:this.path.length,tipLength:this.path.tipLength},risk:this.diagnostics(),drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,pixelRatio:this.renderer.getPixelRatio(),meanFrameInterval:this.intervals.reduce((a,b)=>a+b,0)/Math.max(1,this.intervals.length),contextLost:this.contextLost};}
 // Deterministic recording/test hook: real WebGL render at an exact time; not a video player.
 renderAt(p:number){this.seek(p);this.render();return this.getState();}
 private pointerDown=(e:PointerEvent)=>{if(!this.ready)return;this.cameraOwner='free';this.director.cancel();this.controls.enabled=true;this.down={x:e.clientX,y:e.clientY};this.events.change();};
 private pointerUp=(e:PointerEvent)=>{const down=this.down;this.down=undefined;if(!this.guides||!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObject(this.handles)[0];if(hit?.instanceId!==undefined)this.selectPoint(hit.instanceId);};
 private cameraChanged=()=>{this.renderNeeded=true;};
 private pointerCancel=()=>{this.down=undefined;};
 private lost=(e:Event)=>{e.preventDefault();this.contextLost=true;this.pause();this.events.error('WebGL 上下文中断，请重新加载实验室。');};
 private restored=()=>{this.events.error('上下文已恢复，请重新加载以完整重建资源。');};
 private visibility=()=>{this.last=0;if(!document.hidden&&!this.frame)this.frame=requestAnimationFrame(this.loop);};
 dispose(){this.disposed=true;this.abort.abort();cancelAnimationFrame(this.frame);this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.pointerDown,true);c.removeEventListener('pointerup',this.pointerUp);c.removeEventListener('pointercancel',this.pointerCancel);c.removeEventListener('webglcontextlost',this.lost);c.removeEventListener('webglcontextrestored',this.restored);this.controls.dispose();this.actor?.dispose();this.ribbon.dispose();this.guideLine.geometry.dispose();(this.guideLine.material as LineBasicMaterial).dispose();this.handles.geometry.dispose();(this.handles.material as MeshBasicMaterial).dispose();this.selectedHandle.geometry.dispose();(this.selectedHandle.material as MeshBasicMaterial).dispose();this.repairs.dispose();this.pmremTarget.dispose();this.asset?.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.stageGrid.geometry.dispose();(this.stageGrid.material as LineBasicMaterial).dispose();this.renderer.dispose();c.remove();}
}
