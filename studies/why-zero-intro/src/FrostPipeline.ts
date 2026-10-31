import {Color,HalfFloatType,LinearFilter,Mesh,OrthographicCamera,PlaneGeometry,RepeatWrapping,RGBAFormat,Scene,ShaderMaterial,UnsignedByteType,Vector2,Vector4,WebGLRenderTarget} from 'three';
import type {Camera,WebGLRenderer} from 'three';
import {quadVertex,iceTexture,strokeFragment,blurFragment,frostFragment} from './shaders.ts';
export type Quality='high'|'balanced'|'low';
const target=(w:number,h:number,float=false)=>new WebGLRenderTarget(w,h,{minFilter:LinearFilter,magFilter:LinearFilter,format:RGBAFormat,type:float?HalfFloatType:UnsignedByteType,depthBuffer:false});
export class FrostPipeline{
 readonly sharp=target(1,1);readonly hand=target(1,1);
 private readonly blurA=target(1,1);private readonly blurB=target(1,1);private ice=target(768,768);
 private fields:[WebGLRenderTarget,WebGLRenderTarget];private current=0;
 private readonly scene=new Scene();private readonly camera=new OrthographicCamera(-1,1,1,-1,0,1);private readonly quad=new Mesh(new PlaneGeometry(2,2));
 private readonly segments=Array.from({length:24},()=>new Vector4());private queue:Vector4[]=[];private dirty=false;
 private width=1;private height=1;private aspect=1;private fieldSize=384;quality:Quality='balanced';readonly floatField:boolean;
 readonly fieldMaterial:ShaderMaterial;readonly blurMaterial:ShaderMaterial;readonly finalMaterial:ShaderMaterial;
 private readonly iceMaterial=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:iceTexture,depthTest:false,depthWrite:false,toneMapped:false});
 constructor(readonly renderer:WebGLRenderer){
  this.sharp.depthBuffer=true;this.hand.depthBuffer=true;
  this.scene.add(this.quad);this.quad.frustumCulled=false;
  this.floatField=renderer.extensions.has('EXT_color_buffer_float');this.fields=[target(384,384,this.floatField),target(384,384,this.floatField)];
  this.fieldMaterial=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:strokeFragment,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{uPrevious:{value:this.fields[0].texture},uTexel:{value:new Vector2(1/384,1/384)},uDt:{value:0},uDecay:{value:0},uAspect:{value:1},uRadius:{value:.014},uCount:{value:0},uSegments:{value:this.segments}}});
  this.blurMaterial=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:blurFragment,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{uMap:{value:this.sharp.texture},uDirection:{value:new Vector2()}}});
  this.finalMaterial=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:frostFragment,depthTest:false,depthWrite:false,uniforms:{uSharp:{value:this.sharp.texture},uBlur:{value:this.blurB.texture},uIce:{value:this.ice.texture},uField:{value:this.fields[0].texture},uHand:{value:this.hand.texture},uTime:{value:0},uAspect:{value:1},uMelt:{value:0},uDawn:{value:0},uFlash:{value:0},uExposure:{value:1},uCenter:{value:new Vector2(.5,.5)},uIceTexel:{value:new Vector2(1/768,1/768)},uFieldTexel:{value:new Vector2(1/384,1/384)}}});
  Object.assign(this.finalMaterial.uniforms,{uStyle:{value:1},uContact:{value:new Vector2(.5,.5)},uContactOpacity:{value:0}});
  this.generateIce(768);this.clear();
 }
 private pass(material:ShaderMaterial,out:WebGLRenderTarget|null){this.quad.material=material;this.renderer.setRenderTarget(out);this.renderer.render(this.scene,this.camera);}
 private generateIce(size:number){this.ice.setSize(size,size);this.ice.texture.wrapS=this.ice.texture.wrapT=RepeatWrapping;this.pass(this.iceMaterial,this.ice);this.renderer.setRenderTarget(null);}
 resize(cssWidth:number,cssHeight:number,q:Quality){
  this.width=cssWidth;this.height=cssHeight;this.aspect=cssWidth/cssHeight;this.quality=q;
  const budget=q==='high'?2_000_000:q==='balanced'?1_150_000:650_000,cap=q==='high'?1.5:q==='balanced'?1.1:.8,dpr=Math.min(devicePixelRatio||1,cap,Math.sqrt(budget/(cssWidth*cssHeight)));
  this.renderer.setPixelRatio(dpr);this.renderer.setSize(cssWidth,cssHeight,false);const size=this.renderer.getDrawingBufferSize(new Vector2()),w=size.x,h=size.y;
  this.sharp.setSize(w,h);this.hand.setSize(w,h);this.blurA.setSize(Math.max(1,w>>2),Math.max(1,h>>2));this.blurB.setSize(Math.max(1,w>>2),Math.max(1,h>>2));
  const field=q==='high'?512:q==='balanced'?384:256;if(field!==this.fieldSize){this.fieldSize=field;for(const t of this.fields)t.setSize(field,field);this.generateIce(q==='high'?1024:q==='balanced'?768:512);}
  this.fieldMaterial.uniforms.uTexel.value.set(1/field,1/field);this.fieldMaterial.uniforms.uAspect.value=this.aspect;this.fieldMaterial.uniforms.uRadius.value=Math.max(7,Math.min(12,Math.min(cssWidth,cssHeight)*.016))/cssHeight;
  this.finalMaterial.uniforms.uAspect.value=this.aspect;this.finalMaterial.uniforms.uIceTexel.value.set(1/this.ice.width,1/this.ice.height);this.finalMaterial.uniforms.uFieldTexel.value.set(1/field,1/field);this.clear();
 }
 clear(){this.reset();}
 reset(){this.queue=[];this.dirty=false;this.current=0;const old=this.renderer.getRenderTarget(),alpha=this.renderer.getClearAlpha(),color=this.renderer.getClearColor(new Color());this.renderer.setClearColor(0,1);for(const t of this.fields){this.renderer.setRenderTarget(t);this.renderer.clear();}this.renderer.setRenderTarget(old);this.renderer.setClearColor(color,alpha);this.fieldMaterial.uniforms.uDecay.value=0;this.finalMaterial.uniforms.uField.value=this.fields[0].texture;}
 stroke(a:Vector2,b:Vector2){this.queue.push(new Vector4(a.x,a.y,b.x,b.y));this.dirty=true;this.fieldMaterial.uniforms.uDecay.value=0;}
 cool(){this.fieldMaterial.uniforms.uDecay.value=.26;}
 updateField(dt:number){
  if(!this.dirty&&this.queue.length===0)return;const count=Math.min(24,this.queue.length);for(let i=0;i<count;i++)this.segments[i].copy(this.queue.shift()!);
  const material=this.fieldMaterial;material.uniforms.uPrevious.value=this.fields[this.current].texture;material.uniforms.uCount.value=count;material.uniforms.uDt.value=Math.min(dt,.05);
  this.pass(material,this.fields[1-this.current]);this.current=1-this.current;this.finalMaterial.uniforms.uField.value=this.fields[this.current].texture;
 }
 render(background:Scene,camera:Camera,hand:Scene,dt:number,time:number){
  const r=this.renderer;r.setRenderTarget(this.sharp);r.setClearColor(0x8ab64b,1);r.clear();r.render(background,camera);
  r.setRenderTarget(this.hand);r.setClearColor(0,0);r.clear();r.render(hand,camera);
  this.updateField(dt);this.blurMaterial.uniforms.uMap.value=this.sharp.texture;this.blurMaterial.uniforms.uDirection.value.set(2/this.sharp.width,0);this.pass(this.blurMaterial,this.blurA);
  this.blurMaterial.uniforms.uMap.value=this.blurA.texture;this.blurMaterial.uniforms.uDirection.value.set(0,2/this.sharp.height);this.pass(this.blurMaterial,this.blurB);
  this.finalMaterial.uniforms.uTime.value=time;this.pass(this.finalMaterial,null);
 }
 info(){return{quality:this.quality,buffer:[this.sharp.width,this.sharp.height],field:[this.fieldSize,this.fieldSize],floatField:this.floatField,queue:this.queue.length,passes:'sharp scene, hand, heat ping-pong, horizontal blur, vertical blur, frost composite'};}
 dispose(){for(const t of[this.sharp,this.hand,this.blurA,this.blurB,this.ice,...this.fields])t.dispose();for(const m of[this.fieldMaterial,this.blurMaterial,this.finalMaterial,this.iceMaterial])m.dispose();this.quad.geometry.dispose();}
}
