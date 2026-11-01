import {AmbientLight,Color,DirectionalLight,Euler,Group,HalfFloatType,Mesh,MeshBasicMaterial,OrthographicCamera,PerspectiveCamera,PlaneGeometry,RepeatWrapping,RGBAFormat,Raycaster,Scene,ShaderMaterial,SphereGeometry,Texture,TextureLoader,UnsignedByteType,Vector2,Vector3,WebGLRenderer,WebGLRenderTarget} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SkinnedHand} from './SkinnedHand.ts';
import {CoinOrbit} from './CoinOrbit.ts';
import {PetalField} from './PetalField.ts';
import {quadVertex} from './shaders.ts';
import {connectionFragment,handComposite} from './handSceneShaders.ts';

const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const smooth=(a:number,b:number,v:number)=>{const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

/** Scroll/chapter state plus real pointer-reactive skinned meshes; no video player. */
export class HandNarrative {
  readonly scene=new Scene();
  readonly camera=new PerspectiveCamera(32,1,.05,30);
  readonly orbit=new CoinOrbit();
  readonly petals=new PetalField();
  readonly raycaster=new Raycaster();
  readonly pointer=new Vector2(.5,.5);
  readonly pointerTarget=new Vector2(.5,.5);
  readonly target=new Mesh(new SphereGeometry(.15,20,16),new MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  readonly ring:Mesh;
  readonly light=new DirectionalLight(0xfff9f1,2.4);
  readonly fill=new DirectionalLight(0xa4e4e9,.4);
  readonly ambient=new AmbientLight(0xe1f4eb,.25);
  private targetRT:WebGLRenderTarget;
  private readonly screen=new Scene();
  private readonly screenCamera=new OrthographicCamera(-1,1,1,-1,0,1);
  private readonly composite:ShaderMaterial;
  private readonly ringMaterial:ShaderMaterial;
  green?:SkinnedHand;
  human?:SkinnedHand;
  ready=false;
  error?:string;
  progress=0;
  targetProgress=0;
  hold=0;
  holding=false;
  pressed=false;
  hovered=false;
  time=0;
  private width=1;
  private height=1;
  private aspect=1;

  constructor(private renderer:WebGLRenderer,environment:Texture){
    this.scene.environment=environment;
    this.camera.position.z=3.6;
    this.light.position.set(-2.5,4,2.4);this.fill.position.set(3,-1,3);
    this.scene.add(this.light,this.fill,this.ambient,this.orbit.group,this.petals.mesh,this.target);
    this.target.position.set(0,0,.5);
    this.ringMaterial=new ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:connectionFragment,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{uHold:{value:0},uHover:{value:0},uTime:{value:0}}});
    this.ring=new Mesh(new PlaneGeometry(.43,.43),this.ringMaterial);this.ring.position.copy(this.target.position);this.ring.renderOrder=100;this.scene.add(this.ring);
    this.targetRT=new WebGLRenderTarget(1,1,{format:RGBAFormat,type:renderer.extensions.has('EXT_color_buffer_float')?HalfFloatType:UnsignedByteType,depthBuffer:true});
    this.composite=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:handComposite,depthWrite:false,depthTest:false,transparent:true,toneMapped:false,uniforms:{uScene:{value:this.targetRT.texture},uGarden:{value:null},uGardenAspect:{value:16/9},uPointer:{value:this.pointer},uTexel:{value:new Vector2()},uAspect:{value:1},uTime:{value:0},uProgress:{value:0},uHold:{value:0},uAlpha:{value:0}}});
    const quad=new Mesh(new PlaneGeometry(2,2),this.composite);quad.frustumCulled=false;this.screen.add(quad);
  }

  async load(modelUrl:string,gardenUrl:string,skinUrl:string){
    try{
      const [gltf,garden,skin]=await Promise.all([new GLTFLoader().loadAsync(modelUrl),new TextureLoader().loadAsync(gardenUrl),new TextureLoader().loadAsync(skinUrl)]);
      skin.wrapS=skin.wrapT=RepeatWrapping;
      this.green=new SkinnedHand(gltf.scene as Group,false);this.human=new SkinnedHand(gltf.scene as Group,true,skin);
      this.scene.add(this.green.root,this.human.root);
      this.composite.uniforms.uGarden.value=garden;
      this.composite.uniforms.uGardenAspect.value=garden.image.width/garden.image.height;
      this.ready=true;
    }catch(error){this.error=String(error);}
  }
  resize(width:number,height:number){
    this.width=width;this.height=height;this.aspect=width/height;this.camera.aspect=this.aspect;this.camera.updateProjectionMatrix();
    const size=this.renderer.getDrawingBufferSize(new Vector2());this.targetRT.setSize(size.x,size.y);
    this.composite.uniforms.uAspect.value=this.aspect;this.composite.uniforms.uTexel.value.set(1/size.x,1/size.y);
    this.release();
  }
  reset(){this.progress=this.targetProgress=0;this.hold=0;this.release();this.pointerTarget.set(.5,.5);this.pointer.copy(this.pointerTarget);}
  jump(value:number){this.targetProgress=Math.min(3.5,Math.max(0,value));this.release();}
  scroll(delta:number){if(Math.abs(delta)>.001)this.jump(this.targetProgress+delta*.0018);}
  next(){this.jump(this.targetProgress<.7?1.25:this.targetProgress<1.8?2.1:3.4);}
  move(x:number,y:number){
    this.pointerTarget.set(clamp(x),clamp(y));
    this.hovered=this.hit(x,y);
    if(this.holding&&!this.hovered)this.release();
  }
  down(x:number,y:number){
    this.move(x,y);this.pressed=true;
    this.holding=this.progress>3.08&&this.hovered;
    return this.holding;
  }
  release(){this.holding=false;this.pressed=false;}
  private hit(x:number,y:number){
    if(this.progress<3.08)return false;
    this.camera.updateMatrixWorld();this.target.updateMatrixWorld(true);
    this.raycaster.setFromCamera(new Vector2(x*2-1,y*2-1),this.camera);
    return this.raycaster.intersectObject(this.target,false).length>0;
  }

  update(dt:number,active:boolean){
    if(!this.ready||!this.green||!this.human||!active)return;
    this.time+=dt;
    const damping=1-Math.exp(-Math.min(dt,.1)*9);
    this.progress+=(this.targetProgress-this.progress)*damping;
    this.pointer.lerp(this.pointerTarget,1-Math.exp(-Math.min(dt,.1)*18));
    const holdTarget=this.holding?1:0;
    this.hold+=(holdTarget-this.hold)*(1-Math.exp(-Math.min(dt,.1)*(this.holding?3.4:6)));
    const p=this.progress,reach=smooth(1.85,2.8,p),appearance=smooth(.22,.75,p);
    const night=smooth(.12,.8,this.hold),defiance=smooth(.28,.78,this.hold);
    const mx=(this.pointer.x-.5)*2,my=(this.pointer.y-.5)*2;
    const idle=Math.sin(this.time*.7)*.025;
    const exploreTip=new Vector3(mx*this.aspect*.30+.10,.54+my*.18+idle,.30);
    const leftTip=new Vector3(-.17+mx*.055,.10+my*.04,.45);
    const greenTip=exploreTip.lerp(leftTip,reach).lerp(new Vector3(-.50,.40,.55),defiance);
    const exploreRotation=new Euler(.10+my*.18,.08+mx*.4,2.72+mx*.16);
    const rotation=new Euler(lerp(exploreRotation.x,2.0,reach),lerp(exploreRotation.y,.06,reach),lerp(exploreRotation.z,1.95,reach));
    rotation.z=lerp(rotation.z,2.80,defiance);rotation.y=lerp(rotation.y,-.25,defiance);rotation.x=lerp(rotation.x,.12,defiance);
    this.green.update(dt,greenTip,rotation,lerp(lerp(7.5,5.6,reach),8,defiance),defiance>.1?'defiant':reach>.3?'reach':'open',this.pressed&&!this.holding&&reach<.7?.58:Math.max(0,.1-my*.15)*(1-reach)*(1-defiance),appearance,lerp(.32,0,reach),1-reach,defiance);
    const rightTip=new Vector3(.22+mx*.06,-.10+my*.04,.44).lerp(new Vector3(.30,-.03,.52),defiance);
    this.human.update(dt,rightTip,new Euler(.06,.1+mx*.05,-1.98),5.35,'humanReach',0,smooth(2.0,2.7,p),0,0);
    this.orbit.update(this.time,smooth(.5,.95,p)*(1-smooth(1.65,2.1,p)),mx*.17,my*.08,this.aspect);
    this.petals.update(this.time,smooth(2.0,2.75,p),this.aspect);
    this.ring.visible=p>3.08;this.target.visible=true;
    this.ring.scale.setScalar(1+this.hold*.3);
    this.ringMaterial.uniforms.uHold.value=this.hold;this.ringMaterial.uniforms.uHover.value=this.hovered?1:0;
    this.ringMaterial.uniforms.uTime.value=this.time;
    this.light.color.copy(new Color(0xfff9f1)).lerp(new Color(0xff6c4d),night);
    this.light.intensity=lerp(2.4,1.9,night);this.ambient.intensity=lerp(.25,.08,night);
    this.fill.color.copy(new Color(0xa4e4e9)).lerp(new Color(0xa7314f),night);
    const u=this.composite.uniforms;u.uTime.value=this.time;u.uProgress.value=p;u.uHold.value=night;
  }

  render(alpha:number){
    if(!this.ready||alpha<=.001)return;
    const r=this.renderer,previous=r.getRenderTarget(),auto=r.autoClear;
    const clearColor=r.getClearColor(new Color()),clearAlpha=r.getClearAlpha();
    r.setRenderTarget(this.targetRT);r.setClearColor(0,0);r.clear();r.render(this.scene,this.camera);
    r.setRenderTarget(null);r.autoClear=false;this.composite.uniforms.uAlpha.value=alpha;r.render(this.screen,this.screenCamera);
    r.autoClear=auto;r.setClearColor(clearColor,clearAlpha);r.setRenderTarget(previous);
  }
  state(){
    return{ready:this.ready,error:this.error??null,progress:this.progress,targetProgress:this.targetProgress,chapter:this.progress<.25?'belief':this.progress<1.8?'hands':this.progress<2.75?'college':this.progress<3.08?'creation':'connection',pointer:this.pointer.toArray(),targetPointer:this.pointerTarget.toArray(),holding:this.holding,hold:this.hold,hovered:this.hovered,green:this.green?.state(),human:this.human?.state(),coins:this.orbit.state(),petals:this.petals.mesh.count,field:[this.width,this.height],sceneType:'3D skinned hands, orbiting discs, instanced petals, independently generated environment plate'};
  }
}
