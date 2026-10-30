import {Color,MathUtils,Mesh,MeshStandardMaterial,Raycaster,Vector2,Vector3} from 'three';
import type {Intersection} from 'three';
import {RevealMaterials,owner,profileFor} from './RevealMaterials.ts';
import type {ArtworkBinding,Region} from './RevealMaterials.ts';
import {MeshBVH,acceleratedRaycast} from 'three-mesh-bvh';
import type {MeshBVHOptions} from 'three-mesh-bvh';
import type {ShowcaseExtension,ShowcaseScene} from '../immersive-showcase/Scene.ts';

const approach=(value:number,target:number,dt:number,tau:number)=>Math.abs(value-target)<.001?target:MathUtils.lerp(value,target,1-Math.exp(-dt/tau));
// 0.8.3 supports indirect at runtime (MeshBVH.js / buildTree.js), but omits it
// from its declaration. Explicitly retain indices instead of the default sort.
const bvhOptions:MeshBVHOptions&{indirect:boolean}={indirect:true,maxLeafTris:12};

/** Whole-shoe artwork: all mapped primitives plus the real rhinestone relief.
 * Input changes uniforms; the original map, UV transform, PBR and depth remain intact.
 */
export class CursorReveal implements ShowcaseExtension {
 readonly bindings:ArtworkBinding[]=[];
 private materialExtension?:RevealMaterials;private lastShadowAll=-1;private reliefShadowActive=false;
 readonly uniforms={
  sgpBase:{value:new Color('#0D2740')},sgpAll:{value:0},sgpCenter:{value:new Vector2()},
  sgpCss:{value:new Vector2(1,1)},sgpBuffer:{value:new Vector2(1,1)},
  sgpRadius:{value:0},sgpOpacity:{value:0},sgpHitDepth:{value:0},sgpDepthBand:{value:.1},
 };
 private scene?:ShowcaseScene;
 private occluders:Mesh[]=[];
 private readonly originalRaycasts=new Map<Mesh,Mesh['raycast']>();
 private readonly trees=new Set<Mesh['geometry']>();
 private accelerationBuildMs=0;
 private readonly ray=new Raycaster();private readonly ndc=new Vector2();private readonly viewPoint=new Vector3();
 private readonly pointer=new Vector2();private readonly center=new Vector2();
 private pointerInside=false;private dragging=false;private initialized=false;private valid=false;private strength=0;private movedAt=0;
 private hit?:Intersection;private hitRegion?:Region|'surface';private pauseReason='loading';
 private rayTimes:number[]=[];private rayCount=0;private pointerEvents=0;private lastFrameMs=0;
 private readonly fineQuery=matchMedia('(hover: hover) and (pointer: fine)');
 private readonly mobileDevice=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 touchFallback=this.mobileDevice||!this.fineQuery.matches;unveilAll=false;

 onLoaded(scene:ShowcaseScene){
  this.scene=scene;
  let velvet;scene.asset!.traverse(node=>{if(node instanceof Mesh)for(const m of Array.isArray(node.material)?node.material:[node.material])if(m instanceof MeshStandardMaterial&&m.name==='Tongue_Reverse_Canvas')velvet=m.map;});
  if(!velvet)throw Error('原始无字紫绒纹理缺失，未生成替代鞋舌。');
  this.materialExtension=new RevealMaterials(this.uniforms,velvet);
  scene.asset!.traverse(node=>{
   if(!(node instanceof Mesh))return;
   if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();this.occluders.push(node);
   for(const material of Array.isArray(node.material)?node.material:[node.material]){
    if(!(material instanceof MeshStandardMaterial))continue;
    const profile=profileFor(node,material);if(!profile)continue;
    const binding:ArtworkBinding={mesh:node,material,region:profile.region,profile,gate:{value:1},compiles:0};
    this.materialExtension!.attach(binding);this.bindings.push(binding);
   }
  });
  const mapped=this.occluders.flatMap(n=>Array.isArray(n.material)?n.material:[n.material]).filter(m=>m instanceof MeshStandardMaterial&&m.map);
  if(mapped.length!==16||this.bindings.length!==17||mapped.some(m=>!this.bindings.some(b=>b.material===m)))throw Error('整鞋纹样覆盖校验失败，存在遗漏的原始贴图图元。');
  if(!this.touchFallback)this.accelerate();
  this.uniforms.sgpAll.value=this.touchFallback?1:0;
  this.ray.firstHitOnly=true;
  const canvas=scene.renderer.domElement;
  canvas.addEventListener('pointermove',this.move,{passive:true});
  canvas.addEventListener('pointerenter',this.move,{passive:true});
  canvas.addEventListener('pointerleave',this.leave);
  canvas.addEventListener('pointerdown',this.down,true);
  window.addEventListener('pointerup',this.up);window.addEventListener('pointercancel',this.up);
  window.addEventListener('blur',this.blur);document.addEventListener('visibilitychange',this.visibility);
  this.fineQuery.addEventListener('change',this.inputChanged);
 }
 private accelerate(){
  if(this.originalRaycasts.size)return;const start=performance.now();
  for(const node of this.occluders){if(!node.geometry.boundsTree){node.geometry.boundsTree=new MeshBVH(node.geometry,bvhOptions);this.trees.add(node.geometry);}this.originalRaycasts.set(node,node.raycast);node.raycast=acceleratedRaycast;}
  this.accelerationBuildMs=performance.now()-start;
 }
 private inputChanged=()=>{this.touchFallback=this.mobileDevice||!this.fineQuery.matches;if(!this.touchFallback)this.accelerate();this.leave();};
 private move=(event:PointerEvent)=>{
  if(event.pointerType!=='mouse'||this.touchFallback)return;
  this.pointer.set(event.clientX,event.clientY);this.pointerInside=true;this.movedAt=performance.now();this.pointerEvents++;
  if(!this.initialized){this.center.copy(this.pointer);this.strength=0;this.uniforms.sgpOpacity.value=0;this.uniforms.sgpRadius.value=0;this.initialized=true;}
 };
 private leave=()=>{this.pointerInside=false;this.valid=false;this.initialized=false;};
 private blur=()=>{this.dragging=false;this.leave();};
 private visibility=()=>{if(document.hidden)this.leave();};
 private down=(event:PointerEvent)=>{if(event.pointerType==='mouse')this.dragging=true;};
 private up=()=>{this.dragging=false;};
 setAll(value:boolean){this.unveilAll=value;}
 toggleAll(){this.unveilAll=!this.unveilAll;}
 private paused(scene:ShowcaseScene){return scene.introProgress<1?'intro':scene.unfold>.00001?'cuff-unfolded':scene.isTransitioning?'camera-or-cloth-transition':this.dragging?'drag':document.hidden?'hidden':'';}
 update(scene:ShowcaseScene,dt:number){
  const all=this.touchFallback||this.unveilAll;
  this.uniforms.sgpAll.value=approach(this.uniforms.sgpAll.value,all?1:0,dt,.065);
  if(this.pointerInside){
   this.center.lerp(this.pointer,1-Math.exp(-dt/.038));
   const gap=this.center.distanceTo(this.pointer);if(gap>14)this.center.lerp(this.pointer,1-14/gap);
  }
  this.pauseReason=this.paused(scene);
  const target=!all&&!this.pauseReason&&this.pointerInside&&this.valid?1:0;
  this.strength=approach(this.strength,target,dt,target? .075:.095);
  this.uniforms.sgpOpacity.value=this.strength;
  const rect=scene.renderer.domElement.getBoundingClientRect();
  this.uniforms.sgpRadius.value=MathUtils.clamp(Math.min(rect.width,rect.height)*.125,76,132)*this.strength;
  this.uniforms.sgpCenter.value.set(this.center.x-rect.left,rect.bottom-this.center.y);
  return !this.touchFallback&&(Math.abs(this.uniforms.sgpAll.value-(all?1:0))>.001||this.strength>.001||(!all&&this.pointerInside&&performance.now()-this.movedAt<150));
 }
 /** Run after current camera/orbit/product transforms, once per displayed frame. */
 beforeRender(scene:ShowcaseScene){
  const canvas=scene.renderer.domElement,rect=canvas.getBoundingClientRect();
  this.uniforms.sgpCss.value.set(rect.width,rect.height);scene.renderer.getDrawingBufferSize(this.uniforms.sgpBuffer.value);
  scene.scene.updateMatrixWorld(true);scene.camera.updateMatrixWorld(true);
  this.materialExtension!.cameraUniforms.sgpView.value.copy(scene.camera.matrixWorldInverse);
  this.materialExtension!.cameraUniforms.sgpProjection.value.copy(scene.camera.projectionMatrix);
  this.updateReliefShadow(scene);
  this.valid=false;this.hit=undefined;this.hitRegion=undefined;
  if(this.touchFallback||this.unveilAll||this.pauseReason)return;
  // Retain the last visible patch while the window shrinks away. Invalid hits
  // never acquire a new patch or depth, and the main PBR depth test stays active.
  if(!this.pointerInside)return;
  if(document.elementFromPoint(this.pointer.x,this.pointer.y)!==canvas)return;
  scene.scene.updateMatrixWorld(true);scene.camera.updateMatrixWorld(true);
  const start=performance.now();const hit=this.intersect(this.center.x,this.center.y);this.lastFrameMs=performance.now()-start;
  this.rayTimes.push(this.lastFrameMs);if(this.rayTimes.length>90)this.rayTimes.shift();this.rayCount++;
  this.hit=hit;
  if(!hit)return;
  const binding=this.bindingFor(hit);
  this.valid=true;this.hitRegion=binding?.region??'surface';
  this.viewPoint.copy(hit.point).applyMatrix4(scene.camera.matrixWorldInverse);this.uniforms.sgpHitDepth.value=-this.viewPoint.z;
  const pixelWorld=2*this.uniforms.sgpHitDepth.value*Math.tan(MathUtils.degToRad(scene.camera.fov/2))/rect.height;
  this.uniforms.sgpDepthBand.value=Math.max(.045,pixelWorld*132*.8);
  // One window crosses material boundaries. Main depth testing and the hit
  // depth band select the visible sheet, independently of shared/repeated UVs.
 }
 private updateReliefShadow(scene:ShowcaseScene){
  // Only the real raised medallion changes opaque coverage. Its depth shader
  // projects into the MAIN camera, so no stale symbol shadows remain on velvet.
  // Refresh static shadows during a full reveal transition or a nearby window;
  // ordinary mouse exploration elsewhere adds no shadow-render work.
  const relief=this.bindings.find(b=>b.profile.kind==='relief')!;
  if(!relief.mesh.geometry.boundingSphere)relief.mesh.geometry.computeBoundingSphere();
  const sphere=relief.mesh.geometry.boundingSphere!,p=this.viewPoint.copy(sphere.center).applyMatrix4(relief.mesh.matrixWorld),distance=scene.camera.position.distanceTo(p);p.project(scene.camera);
  const rect=scene.renderer.domElement.getBoundingClientRect();
  const centerX=(p.x*.5+.5)*rect.width,centerY=(p.y*.5+.5)*rect.height;
  const worldRadius=sphere.radius*relief.mesh.matrixWorld.getMaxScaleOnAxis();
  const pixels=worldRadius/Math.max(.01,distance)*rect.height/(2*Math.tan(MathUtils.degToRad(scene.camera.fov/2)));
  const active=this.strength>.001&&this.uniforms.sgpAll.value<1&&Math.hypot(centerX-this.uniforms.sgpCenter.value.x,centerY-this.uniforms.sgpCenter.value.y)<pixels+this.uniforms.sgpRadius.value;
  if(active||this.reliefShadowActive||this.lastShadowAll!==this.uniforms.sgpAll.value)scene.renderer.shadowMap.needsUpdate=true;
  this.reliefShadowActive=active;this.lastShadowAll=this.uniforms.sgpAll.value;
 }
 private bindingFor(hit:Intersection){return this.bindings.find(b=>b.mesh===hit.object&&(!Array.isArray(b.mesh.material)||b.mesh.material[hit.face?.materialIndex??0]===b.material));}
 private intersect(clientX:number,clientY:number){
  const scene=this.scene!,rect=scene.renderer.domElement.getBoundingClientRect();
  this.ndc.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);
  this.ray.setFromCamera(this.ndc,scene.camera);
  return this.ray.intersectObjects(this.occluders,false)[0];
 }
 /** Read-only geometric probe used by integration checks; never alters appearance. */
 probe(x:number,y:number){
  const scene=this.scene;if(!scene?.ready)return null;
  scene.scene.updateMatrixWorld(true);scene.camera.updateMatrixWorld(true);const hit=this.intersect(x,y);if(!hit)return null;
  const b=this.bindingFor(hit);return{eligible:true,artwork:Boolean(b),region:b?.region??'surface',object:hit.object.name,owner:owner(hit.object),material:(Array.isArray((hit.object as Mesh).material)?((hit.object as Mesh).material as MeshStandardMaterial[])[hit.face?.materialIndex??0]:((hit.object as Mesh).material as MeshStandardMaterial)).name,point:hit.point.toArray(),uv:hit.uv?.toArray(),distance:hit.distance};
 }
 getState(){const times=[...this.rayTimes].sort((a,b)=>a-b);return{
  mode:this.touchFallback?'touch-full':this.unveilAll?'all':'explore',touchFallback:this.touchFallback,all:this.unveilAll,
  allUniform:this.uniforms.sgpAll.value,valid:this.valid,pauseReason:this.pauseReason,inside:this.pointerInside,
  center:this.center.toArray(),pointer:this.pointer.toArray(),radius:this.uniforms.sgpRadius.value,opacity:this.strength,
  region:this.hitRegion??null,hitObject:this.hit?.object.name??null,hitPoint:this.hit?.point.toArray()??null,
  depth:this.uniforms.sgpHitDepth.value,depthBand:this.uniforms.sgpDepthBand.value,
  scope:'whole-shoe',mappedPrimitives:16,reliefPrimitives:1,targetCount:this.bindings.length,targets:this.bindings.map(b=>({mesh:b.mesh.name,owner:owner(b.mesh),material:b.material.name,region:b.region,base:b.profile.base,kind:b.profile.kind??'flat',gate:b.gate.value,compiles:b.compiles})),
  occluderCount:this.occluders.length,rayCount:this.rayCount,pointerEvents:this.pointerEvents,acceleration:'Per-instance indirect BVH; original UV/position/index buffers retained',acceleratedMeshes:this.originalRaycasts.size,accelerationBuildMs:this.accelerationBuildMs,
  rayTiming:{lastMs:this.lastFrameMs,medianMs:times[Math.floor(times.length/2)]??0,p95Ms:times[Math.floor(times.length*.95)]??0,samples:times.length},
  buffer:this.uniforms.sgpBuffer.value.toArray(),css:this.uniforms.sgpCss.value.toArray(),baseSRGB:'#0D2740',
 };}
 dispose(){const c=this.scene?.renderer.domElement;c?.removeEventListener('pointermove',this.move);c?.removeEventListener('pointerenter',this.move);c?.removeEventListener('pointerleave',this.leave);c?.removeEventListener('pointerdown',this.down,true);window.removeEventListener('pointerup',this.up);window.removeEventListener('pointercancel',this.up);window.removeEventListener('blur',this.blur);document.removeEventListener('visibilitychange',this.visibility);this.fineQuery.removeEventListener('change',this.inputChanged);this.materialExtension?.dispose();for(const[m,original]of this.originalRaycasts)m.raycast=original;for(const g of this.trees)delete g.boundsTree;this.originalRaycasts.clear();this.trees.clear();this.occluders=[];this.bindings.length=0;}
}
