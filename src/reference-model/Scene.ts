import {ACESFilmicToneMapping,AmbientLight,Box3,BufferAttribute,BufferGeometry,Color,DirectionalLight,DoubleSide,DynamicDrawUsage,Group,HemisphereLight,Material,Mesh,MeshBasicMaterial,MeshStandardMaterial,OrthographicCamera,Raycaster,Scene,SphereGeometry,SRGBColorSpace,Texture,Vector2,Vector3,WebGLRenderer} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {interpolateFittedShell} from './bridge.ts';
import type {FittedPaperShell} from './bridge.ts';

export type ModelPoint=readonly[number,number,number];
export type CameraPreset='side'|'front'|'top'|'quarter';
export interface PhotoFrame {originPx:readonly[number,number];right:ModelPoint;up:ModelPoint;scale:readonly[number,number];size?:readonly[number,number]}
export interface Pick {mesh:Mesh;triangle:number;point:Vector3;}
export interface SceneOptions {onPick?:(pick:Pick)=>void;onError?:(message:string)=>void;}

/** Keeps GLTF coordinates intact. Camera framing is visual, never a metric rescale. */
export class ModelScene {
  readonly scene=new Scene();readonly camera=new OrthographicCamera(-1,1,1,-1,.001,10000);
  readonly renderer:WebGLRenderer;readonly controls:OrbitControls;readonly markerGroup=new Group();
  asset?:Group;
  private readonly observer:ResizeObserver;private frame=0;private generation=0;private disposed=false;private contextLost=false;
  private readonly ray=new Raycaster();private readonly pointerNdc=new Vector2();private pointer?:{id:number;x:number;y:number;moved:boolean};private pointers=new Set<number>();
  private preset:CameraPreset='quarter';private photoFrame?:PhotoFrame;private width=1;private height=1;private extent=1;
  private tongueNames:string[]=[];private tongueIntensity=0;private wire=false;private opacity=1;
  private shell?:FittedPaperShell;private shellMesh?:Mesh<BufferGeometry,MeshBasicMaterial>;private shellWire?:Mesh<BufferGeometry,MeshBasicMaterial>;private shellProgress=1;private shellVisible=false;private shellBounds?:Box3;
  private animation=0;private animationGeneration=0;private animationResolve?: (completed:boolean)=>void;
  private readonly reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private materials=new Map<MeshStandardMaterial,{emissive:Color;emissiveIntensity:number;opacity:number;transparent:boolean}>();
  private readonly sphere=new SphereGeometry(1,16,10);private markerMaterial=new MeshBasicMaterial({color:0xde9b37,depthTest:false});
  private visibility=()=>{if(!document.hidden)this.invalidate();};
  constructor(readonly host:HTMLElement,readonly options:SceneOptions={}){
    this.renderer=new WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.setClearColor(0xf4f3ee,0);
    const canvas=this.renderer.domElement;canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none;';canvas.tabIndex=0;canvas.setAttribute('aria-label','实际鞋子模型。单指旋转，双指缩放，轻点表面与裁片对照。');host.append(canvas);
    this.controls=new OrbitControls(this.camera,canvas);this.controls.enablePan=true;this.controls.enableDamping=true;this.controls.dampingFactor=.15;this.controls.rotateSpeed=.65;this.controls.zoomSpeed=.7;this.controls.minZoom=.3;this.controls.maxZoom=8;this.controls.addEventListener('change',()=>this.invalidate());
    this.scene.add(new HemisphereLight(0xffffff,0x768391,1.7),new AmbientLight(0xffffff,.25));
    for(const [color,power,position] of [[0xfff5e8,2.5,[-3,5,4]],[0xe3edff,1.2,[3,2,-4]],[0xffffff,.8,[4,4,1]]] as const){const light=new DirectionalLight(color,power);light.position.set(position[0],position[1],position[2]);this.scene.add(light);}
    this.scene.add(this.markerGroup);
    canvas.addEventListener('pointerdown',this.down);canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerup',this.up);canvas.addEventListener('pointercancel',this.cancel);canvas.addEventListener('webglcontextlost',this.lost);canvas.addEventListener('webglcontextrestored',this.restored);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);document.addEventListener('visibilitychange',this.visibility);this.resize();
  }
  async load(url:string,onProgress?:(ratio:number)=>void){
    this.cancelShellAnimation();
    const hadAsset=!!this.asset;
    const generation=++this.generation;const gltf=await new GLTFLoader().loadAsync(url,e=>{if(generation===this.generation&&e.total)onProgress?.(e.loaded/e.total);});
    if(generation!==this.generation||this.disposed){this.disposeAsset(gltf.scene);return false;}
    if(this.asset){this.scene.remove(this.asset);this.disposeAsset(this.asset);}this.materials.clear();this.asset=gltf.scene;
    this.asset.traverse(node=>{if(!(node instanceof Mesh))return;const source=Array.isArray(node.material)?node.material:[node.material];const clones=source.map(m=>m.clone());node.material=Array.isArray(node.material)?clones:clones[0];for(const m of clones){if(m instanceof MeshStandardMaterial){m.side=DoubleSide;this.materials.set(m,{emissive:m.emissive.clone(),emissiveIntensity:m.emissiveIntensity,opacity:m.opacity,transparent:m.transparent});if(m.map)m.map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());}}});
    this.scene.add(this.asset);this.asset.updateMatrixWorld(true);const box=new Box3().setFromObject(this.asset);if(box.isEmpty())throw Error('模型中没有可显示的网格。');this.extent=Math.max(...box.getSize(new Vector3()).toArray());this.setTongueHighlight(this.tongueIntensity,this.tongueNames);this.setWireframe(this.wire);this.setOpacity(this.opacity);this.markers([]);if(!hadAsset||this.photoFrame)this.fit();else this.invalidate();return true;
  }
  setCameraPreset(preset:CameraPreset){this.preset=preset;this.photoFrame=undefined;this.controls.enabled=true;this.fit();}
  setPhotoFrame(frame:PhotoFrame){
    if(![...frame.originPx,...frame.right,...frame.up,...frame.scale].every(Number.isFinite)||frame.scale.some(v=>v<=0))throw Error('照片配准参数无效。');
    this.photoFrame=frame;this.controls.enabled=false;this.applyPhotoFrame();
  }
  private applyPhotoFrame(){
    const f=this.photoFrame;if(!f||!this.asset)return;const r=new Vector3(...f.right).normalize(),u=new Vector3(...f.up).normalize(),d=r.clone().cross(u).normalize();
    if(Math.abs(r.dot(u))>.001||d.lengthSq()<.9)throw Error('照片坐标基必须为正交单位方向。');
    const size=f.size??[1280,894],center=new Box3().setFromObject(this.asset).getCenter(new Vector3());
    const target=r.clone().multiplyScalar((size[0]/2-f.originPx[0])/f.scale[0]).addScaledVector(u,(f.originPx[1]-size[1]/2)/f.scale[1]).addScaledVector(d,center.dot(d));
    this.camera.position.copy(target).addScaledVector(d,this.extent*5);this.camera.up.copy(u);this.controls.target.copy(target);this.camera.zoom=1;this.camera.lookAt(target);
    let w=size[0]/f.scale[0],h=size[1]/f.scale[1];const photoAspect=size[0]/size[1],aspect=this.width/this.height;
    if(aspect>photoAspect)w*=aspect/photoAspect;else h*=photoAspect/aspect;
    this.camera.left=-w/2;this.camera.right=w/2;this.camera.top=h/2;this.camera.bottom=-h/2;this.camera.updateProjectionMatrix();this.controls.update();this.invalidate();
  }
  fit(){
    if(!this.asset)return;if(this.photoFrame){this.applyPhotoFrame();return;}const bounds=new Box3().setFromObject(this.asset);if(this.shellVisible&&this.shellBounds)bounds.union(this.shellBounds);const center=bounds.getCenter(new Vector3());
    const direction=this.preset==='side'?new Vector3(0,.06,1):this.preset==='front'?new Vector3(-1,.1,0):this.preset==='top'?new Vector3(0,1,.0001):new Vector3(-.7,.4,1).normalize();
    this.camera.position.copy(center).addScaledVector(direction,this.extent*5);this.controls.target.copy(center);this.camera.up.set(0,1,0);if(this.preset==='top')this.camera.up.set(0,0,-1);this.camera.zoom=1;this.camera.lookAt(center);this.camera.updateMatrixWorld();
    const corners:Vector3[]=[];for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z])corners.push(new Vector3(x,y,z).applyMatrix4(this.camera.matrixWorldInverse));
    let w=(Math.max(...corners.map(p=>p.x))-Math.min(...corners.map(p=>p.x)))*1.12,h=(Math.max(...corners.map(p=>p.y))-Math.min(...corners.map(p=>p.y)))*1.12;
    const aspect=this.width/this.height;h=Math.max(h,w/aspect,.01);w=h*aspect;this.camera.left=-w/2;this.camera.right=w/2;this.camera.top=h/2;this.camera.bottom=-h/2;this.camera.updateProjectionMatrix();this.controls.update();this.invalidate();
  }
  setTongueHighlight(intensity:number,names:string[]=[]){this.tongueNames=names;this.tongueIntensity=Math.max(0,Math.min(1,intensity));this.asset?.traverse(node=>{if(!(node instanceof Mesh))return;const isTongue=names.some(name=>node.name===name)||/tongue|鞋舌/i.test(node.name);for(const m of Array.isArray(node.material)?node.material:[node.material]){if(!(m instanceof MeshStandardMaterial))continue;const initial=this.materials.get(m);if(!initial)continue;m.emissive.copy(initial.emissive);m.emissiveIntensity=initial.emissiveIntensity;if(isTongue&&this.tongueIntensity>0){m.emissive.set('#c77720');m.emissiveIntensity=this.tongueIntensity*.4;}}});this.invalidate();}
  setOpacity(value:number){this.opacity=Math.max(.1,Math.min(1,value));for(const[m,initial]of this.materials){m.opacity=initial.opacity*this.opacity;m.transparent=initial.transparent||this.opacity<.999;m.depthWrite=this.opacity>.999;m.needsUpdate=true;}this.invalidate();}
  setWireframe(show:boolean){this.wire=show;for(const m of this.materials.keys())m.wireframe=show;this.invalidate();}
  /** The drawing subset uses the original paper index identities. No missing
   * material is extrapolated onto the AI mesh. Flat units are display units. */
  setFittedShell(shell?:FittedPaperShell){
    this.cancelShellAnimation();
    if(this.shellMesh){this.scene.remove(this.shellMesh);this.shellMesh.geometry.dispose();this.shellMesh.material.dispose();this.shellMesh=undefined;}
    if(this.shellWire){this.scene.remove(this.shellWire);this.shellWire.material.dispose();this.shellWire=undefined;}
    this.shell=undefined;this.shellBounds=undefined;
    if(!shell){this.invalidate();return;}
    const positions=interpolateFittedShell(shell,1),flat=interpolateFittedShell(shell,0);
    if(shell.visibleTriangleIndices.length%3||shell.visibleOriginalTriangleIds.length*3!==shell.visibleTriangleIndices.length)throw Error('映射裁片的绘制三角形身份不完整。');
    if(shell.mappedVertexMask.filter(Boolean).length!==shell.mappedVertexCount)throw Error('映射顶点计数与实际命中记录不一致。');
    for(let t=0;t<shell.visibleOriginalTriangleIds.length;t++){const original=shell.visibleOriginalTriangleIds[t];if(!Number.isInteger(original)||original<0||original>=shell.sourceTriangleCount||[0,1,2].some(k=>shell.visibleTriangleIndices[t*3+k]!==shell.sourceTriangleIndices[original*3+k]))throw Error('裁片绘制子集与源三角形身份不一致。');}
    const bounds=new Box3();
    for(const id of shell.visibleTriangleIndices){if(!Number.isInteger(id)||id<0||id>=shell.sourceVertexCount||!shell.mappedVertexMask[id])throw Error('未映射顶点不能组成贴合裁片。');bounds.expandByPoint(new Vector3(flat[id*3],flat[id*3+1],flat[id*3+2]));bounds.expandByPoint(new Vector3(positions[id*3],positions[id*3+1],positions[id*3+2]));}
    const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(positions,3).setUsage(DynamicDrawUsage));geometry.setIndex(new BufferAttribute(new Uint32Array(shell.visibleTriangleIndices),1));geometry.computeBoundingSphere();
    const material=new MeshBasicMaterial({color:0x159bb1,transparent:true,opacity:.38,side:DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    this.shellMesh=new Mesh(geometry,material);this.shellMesh.name='SamePaperIdentity_VisibleClothSubset';this.shellMesh.renderOrder=5;this.shellMesh.frustumCulled=false;
    this.shellWire=new Mesh(geometry,new MeshBasicMaterial({color:0x12667f,transparent:true,opacity:.22,wireframe:true,depthWrite:false,side:DoubleSide}));this.shellWire.renderOrder=6;this.shellWire.frustumCulled=false;
    this.scene.add(this.shellMesh,this.shellWire);this.shell=shell;this.shellBounds=bounds;this.shellProgress=1;this.setShellVisible(this.shellVisible);this.invalidate();
  }
  setShellVisible(show:boolean){this.shellVisible=!!show;if(this.shellMesh)this.shellMesh.visible=this.shellVisible;if(this.shellWire)this.shellWire.visible=this.shellVisible;this.invalidate();}
  setShellProgress(progress:number){if(!this.shell||!this.shellMesh)return;this.shellProgress=Math.max(0,Math.min(1,progress));const positions=interpolateFittedShell(this.shell,this.shellProgress);const attr=this.shellMesh.geometry.getAttribute('position') as BufferAttribute;(attr.array as Float32Array).set(positions);attr.needsUpdate=true;this.invalidate();}
  cancelShellAnimation(){++this.animationGeneration;cancelAnimationFrame(this.animation);this.animation=0;this.animationResolve?.(false);this.animationResolve=undefined;}
  animateShellTo(target:number,duration=1800,onProgress?:(progress:number)=>void):Promise<boolean>{
    this.cancelShellAnimation();if(!this.shell)return Promise.resolve(false);
    const from=this.shellProgress,to=Math.max(0,Math.min(1,target)),generation=this.animationGeneration;
    if(this.reduced.matches||duration<=0){this.setShellProgress(to);onProgress?.(to);return Promise.resolve(true);}
    return new Promise(resolve=>{this.animationResolve=resolve;const start=performance.now();const tick=(time:number)=>{if(generation!==this.animationGeneration||this.disposed){resolve(false);return;}const t=Math.max(0,Math.min(1,(time-start)/duration)),smooth=t*t*(3-2*t);this.setShellProgress(from+(to-from)*smooth);onProgress?.(this.shellProgress);if(t<1)this.animation=requestAnimationFrame(tick);else{this.animation=0;this.animationResolve=undefined;resolve(true);}};this.animation=requestAnimationFrame(tick);});
  }
  markers(points:{position:ModelPoint;color?:string;radius?:number}[]){for(const child of[...this.markerGroup.children]){this.markerGroup.remove(child);const marker=child as Mesh<SphereGeometry,MeshBasicMaterial>;marker.material.dispose();}for(const point of points){const marker=new Mesh(this.sphere,new MeshBasicMaterial({color:point.color??'#de9b37',depthTest:false}));marker.position.set(...point.position);marker.scale.setScalar(point.radius??this.extent*.005);marker.renderOrder=8;this.markerGroup.add(marker);}this.invalidate();}
  showPoint(point?:ModelPoint){this.markers(point?[{position:point}]:[]);}
  info(){return{loaded:!!this.asset,preset:this.photoFrame?'photo':this.preset,triangles:this.renderer.info.render.triangles,drawCalls:this.renderer.info.render.calls,pixelRatio:this.renderer.getPixelRatio(),extent:this.extent,unit:'source-model-coordinates',shell:this.shell?{sourceVertices:this.shell.sourceVertexCount,mappedVertices:this.shell.mappedVertexCount,drawnTriangles:this.shell.visibleOriginalTriangleIds.length,sourceTriangles:this.shell.sourceTriangleCount,visible:this.shellVisible,progress:this.shellProgress}:null};}
  canvas(){return this.renderer.domElement;}
  private resize(){const box=this.host.getBoundingClientRect();this.width=Math.max(1,box.width);this.height=Math.max(1,box.height);this.renderer.setPixelRatio(Math.max(1,Math.min(devicePixelRatio||1,1.5,Math.sqrt(2_000_000/(this.width*this.height)))));this.renderer.setSize(this.width,this.height,false);this.fit();this.invalidate();}
  invalidate(){if(this.frame||this.disposed||document.hidden||this.contextLost)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.controls.update();this.renderer.render(this.scene,this.camera);});}
  private down=(e:PointerEvent)=>{this.pointers.add(e.pointerId);if(this.pointers.size===1)this.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};else if(this.pointer)this.pointer.moved=true;};
  private move=(e:PointerEvent)=>{if(this.pointer?.id===e.pointerId&&Math.hypot(e.clientX-this.pointer.x,e.clientY-this.pointer.y)>6)this.pointer.moved=true;};
  private up=(e:PointerEvent)=>{const pick=this.pointer?.id===e.pointerId&&!this.pointer.moved&&this.pointers.size===1;this.pointers.delete(e.pointerId);if(!this.pointers.size)this.pointer=undefined;if(!pick||!this.asset)return;const rect=this.renderer.domElement.getBoundingClientRect();this.pointerNdc.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.camera.updateMatrixWorld();this.ray.setFromCamera(this.pointerNdc,this.camera);const hit=this.ray.intersectObject(this.asset,true).find(h=>h.object instanceof Mesh&&h.faceIndex!=null);if(hit&&hit.object instanceof Mesh&&hit.faceIndex!=null)this.options.onPick?.({mesh:hit.object,triangle:hit.faceIndex,point:hit.point});};
  private cancel=(e:PointerEvent)=>{this.pointers.delete(e.pointerId);this.pointer=undefined;};
  private lost=(e:Event)=>{e.preventDefault();this.contextLost=true;this.cancelShellAnimation();cancelAnimationFrame(this.frame);this.frame=0;this.options.onError?.('三维上下文已暂停，请重新载入页面恢复。');};
  private restored=()=>{this.options.onError?.('三维上下文已恢复，请重新载入当前模型。');};
  private disposeAsset(asset:Group){const materials=new Set<Material>(),textures=new Set<Texture>();asset.traverse(o=>{if(!(o instanceof Mesh))return;o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof Texture)textures.add(value);}});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  dispose(){this.disposed=true;this.generation++;this.cancelShellAnimation();this.setFittedShell();cancelAnimationFrame(this.frame);this.observer.disconnect();this.controls.dispose();this.asset&&this.disposeAsset(this.asset);this.sphere.dispose();this.markerMaterial.dispose();this.renderer.dispose();document.removeEventListener('visibilitychange',this.visibility);const c=this.renderer.domElement;c.removeEventListener('pointerdown',this.down);c.removeEventListener('pointermove',this.move);c.removeEventListener('pointerup',this.up);c.removeEventListener('pointercancel',this.cancel);c.removeEventListener('webglcontextlost',this.lost);c.removeEventListener('webglcontextrestored',this.restored);c.remove();}
}
