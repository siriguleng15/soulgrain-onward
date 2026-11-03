import {AmbientLight,Color,DepthTexture,DirectionalLight,Euler,Group,HalfFloatType,Mesh,MeshBasicMaterial,OrthographicCamera,PerspectiveCamera,PlaneGeometry,PointLight,Quaternion,RepeatWrapping,RGBAFormat,Raycaster,Scene,ShaderMaterial,SphereGeometry,Texture,TextureLoader,UnsignedByteType,UnsignedShortType,Vector2,Vector3,WebGLRenderer,WebGLRenderTarget} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {SkinnedHand} from './SkinnedHand.ts';
import {CoinOrbit} from './CoinOrbit.ts';
import {PetalField} from './PetalField.ts';
import {GardenEnvironment} from './GardenEnvironment.ts';
import {CinematicDiffusion} from './CinematicDiffusion.ts';
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
  private readonly spatialGarden=new URLSearchParams(location.search).get('environment')==='spatial';
  readonly garden=this.spatialGarden?new GardenEnvironment():undefined;
  readonly raycaster=new Raycaster();
  readonly pointer=new Vector2(.5,.5);
  readonly pointerTarget=new Vector2(.5,.5);
  readonly target=new Mesh(new SphereGeometry(.15,20,16),new MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  readonly ring:Mesh;
  readonly light=new DirectionalLight(0xfff9f1,1.65);
  readonly fill=new DirectionalLight(0xc6edf0,.62);
  readonly ambient=new AmbientLight(0xe1f4eb,.36);
  private targetRT:WebGLRenderTarget;
  private readonly optics:CinematicDiffusion;
  private readonly cyanRim=new DirectionalLight(0x75d6df,.35);
  private readonly skinBounce=new PointLight(0xffe1c3,1.25,5,2);
  private readonly screen=new Scene();
  private readonly contactOverlay=new Scene();
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
  private contactTime=0;
  private width=1;
  private height=1;
  private aspect=1;
  private readonly poseRotation=new Quaternion();
  private readonly screenRoll=new Quaternion();
  private readonly rollAxis=new Vector3(0,0,1);

  constructor(private renderer:WebGLRenderer,environment:Texture){
    this.scene.environment=environment;
    this.camera.position.z=3.6;
    this.light.position.set(3.5,4.5,3.2);this.fill.position.set(-2.2,1.0,3);this.cyanRim.position.set(-.8,-1.8,2.2);
    this.skinBounce.position.set(1.2,.2,1.7);
    this.scene.add(this.light,this.fill,this.ambient,this.cyanRim,this.skinBounce,this.orbit.group,this.petals.mesh,this.target);
    this.target.position.set(0,0,.5);if(this.garden){this.garden.update(0,0,0);this.scene.add(this.garden.group);}
    this.ringMaterial=new ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:connectionFragment,transparent:true,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{uHold:{value:0},uHover:{value:0},uTime:{value:0}}});
    this.ring=new Mesh(new PlaneGeometry(.34,.34),this.ringMaterial);this.ring.position.copy(this.target.position);this.ring.renderOrder=100;this.contactOverlay.add(this.ring);
    this.targetRT=new WebGLRenderTarget(1,1,{format:RGBAFormat,type:renderer.extensions.has('EXT_color_buffer_float')?HalfFloatType:UnsignedByteType,depthBuffer:true});
    this.targetRT.depthTexture=new DepthTexture(1,1,UnsignedShortType);
    this.optics=new CinematicDiffusion(renderer);
    this.composite=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:handComposite,depthWrite:false,depthTest:false,transparent:true,toneMapped:false,uniforms:{uScene:{value:this.targetRT.texture},uBloom:{value:this.optics.texture},uDepth:{value:this.targetRT.depthTexture},uCameraNear:{value:.05},uCameraFar:{value:30},uFocusDistance:{value:3.1},uSpatialGarden:{value:this.spatialGarden?1:0},uGarden:{value:null},uGardenAspect:{value:16/9},uPointer:{value:this.pointer},uTexel:{value:new Vector2()},uAspect:{value:1},uTime:{value:0},uProgress:{value:0},uHold:{value:0},uCharge:{value:0},uMist:{value:0},uAlpha:{value:0}}});
    const quad=new Mesh(new PlaneGeometry(2,2),this.composite);quad.frustumCulled=false;this.screen.add(quad);
  }

  async load(modelUrl:string,gardenUrl:string,skinUrl:string,humanUrl=modelUrl){
    try{
      const loader=new GLTFLoader(),greenAsset=loader.loadAsync(modelUrl);
      const [gltf,human,garden,skin]=await Promise.all([greenAsset,humanUrl===modelUrl?greenAsset:loader.loadAsync(humanUrl),new TextureLoader().loadAsync(gardenUrl),new TextureLoader().loadAsync(skinUrl)]);
      skin.wrapS=skin.wrapT=RepeatWrapping;
      this.green=new SkinnedHand(gltf.scene as Group,false);this.human=new SkinnedHand(human.scene as Group,true,skin);
      this.scene.add(this.green.root,this.human.root);
      this.composite.uniforms.uGarden.value=garden;
      this.composite.uniforms.uGardenAspect.value=garden.image.width/garden.image.height;
      this.ready=true;
    }catch(error){this.error=String(error);}
  }
  resize(width:number,height:number){
    this.width=width;this.height=height;this.aspect=width/height;this.camera.aspect=this.aspect;this.camera.updateProjectionMatrix();
    const size=this.renderer.getDrawingBufferSize(new Vector2());this.targetRT.setSize(size.x,size.y);this.optics.resize(size.x,size.y);
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
  release(){this.holding=false;this.pressed=false;this.contactTime=0;}
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
    if(this.holding)this.contactTime+=Math.min(dt,.1);
    const holdTarget=this.holding?clamp(this.contactTime/1.65):0;
    this.hold+=(holdTarget-this.hold)*(1-Math.exp(-Math.min(dt,.1)*(this.holding?14:6)));
    const p=this.progress,reach=smooth(1.85,2.8,p),appearance=smooth(.22,.75,p);
    const night=smooth(.08,.70,this.hold),defiance=smooth(.14,.56,this.hold),charge=smooth(.65,.99,this.hold);
    const mx=(this.pointer.x-.5)*2,my=(this.pointer.y-.5)*2;
    const idle=Math.sin(this.time*.7)*.025;
    // Reference: a diagonal, open palm rises from lower left, rather than a vertical peace sign.
    const exploreTip=new Vector3(mx*this.aspect*.28+.48,.63+my*.15+idle,.30);
    const leftTip=new Vector3(-.12+mx*.055,-.065+my*.04,.45);
    const greenTip=exploreTip.lerp(leftTip,reach).lerp(new Vector3(-.49,.37,.55+charge*.055),defiance);
    const exploreRotation=new Euler(.15+my*.16,.12+mx*.4,2.22+mx*.16);
    const rotation=new Euler(lerp(exploreRotation.x,1.10,reach),lerp(exploreRotation.y,.34,reach),lerp(exploreRotation.z,1.45,reach));
    rotation.z=lerp(rotation.z,3.08,defiance);rotation.y=lerp(rotation.y,-.36,defiance);rotation.x=lerp(rotation.x,.52,defiance);
    // Screen-space wrist roll preserves the measured fingertip anchor while bringing
    // the relaxed green forearm in from the left, as in the recorded composition.
    this.poseRotation.setFromEuler(rotation);
    this.screenRoll.setFromAxisAngle(this.rollAxis,-.56*reach*(1-defiance));
    rotation.setFromQuaternion(this.poseRotation.premultiply(this.screenRoll));
    this.green.update(dt,greenTip,rotation,lerp(lerp(7.7,6.8,reach),4.8,defiance)*(1+charge*.40),defiance>.1?'defiant':reach>.3?'reach':'open',this.pressed&&!this.holding&&reach<.7?.58:Math.max(0,.1-my*.15)*(1-reach)*(1-defiance),appearance,lerp(.48,.34,reach)*(1-charge*.25),1-reach,defiance,.70-my*.45);
    const rightTip=new Vector3(.16+mx*.06,-.12+my*.04,.44).lerp(new Vector3(.20,.12,.52+charge*.035),defiance);
    this.human.update(dt,rightTip,new Euler(lerp(.08,.22,defiance),.18+mx*.05,lerp(-1.75,-1.92,defiance)),5.5*(1+charge*.15),'humanReach',0,smooth(2.0,2.7,p),0,0,defiance);
    this.orbit.update(this.time,smooth(.5,.95,p)*(1-smooth(1.65,2.1,p)),mx*.17,my*.08,this.aspect);
    this.petals.update(this.time,smooth(2.0,2.75,p),this.aspect);
    this.garden?.update(this.time,smooth(2.0,2.75,p),night);
    this.ring.visible=p>3.08;this.target.visible=true;
    this.ring.scale.setScalar(1+this.hold*.3);
    this.ringMaterial.uniforms.uHold.value=this.hold;this.ringMaterial.uniforms.uHover.value=this.hovered?1:0;
    this.ringMaterial.uniforms.uTime.value=this.time;
    this.light.color.copy(new Color(0xfff9f1)).lerp(new Color(0xff6c4d),night);
    this.light.intensity=lerp(1.65,.85,night)*(1-charge*.44);this.ambient.intensity=lerp(.36,.10,night);
    this.scene.environmentIntensity=lerp(1,.24,charge);
    this.cyanRim.intensity=lerp(.35,.08,night);
    this.skinBounce.color.copy(new Color(0xffe1c3)).lerp(new Color(0xff502b),night);
    this.skinBounce.intensity=lerp(1.25,2.35,night);
    this.fill.color.copy(new Color(0xa4e4e9)).lerp(new Color(0xa7314f),night);
    const u=this.composite.uniforms;u.uTime.value=this.time;u.uProgress.value=p;u.uHold.value=night;
    u.uCharge.value=charge;u.uMist.value=p<1.8?1-smooth(.35,1.10,p):0;
  }

  render(alpha:number){
    if(!this.ready||alpha<=.001)return;
    const r=this.renderer,previous=r.getRenderTarget(),auto=r.autoClear;
    const clearColor=r.getClearColor(new Color()),clearAlpha=r.getClearAlpha();
    r.setRenderTarget(this.targetRT);r.setClearColor(0,0);r.clear();r.render(this.scene,this.camera);
    this.optics.render(this.targetRT.texture);
    r.setRenderTarget(null);r.autoClear=false;this.composite.uniforms.uAlpha.value=alpha;r.render(this.screen,this.screenCamera);
    // The spatial contact cue remains optically sharp and independently hit-testable.
    // It is not part of the hand/petal depth-of-field convolution.
    if(this.ring.visible){r.clearDepth();r.render(this.contactOverlay,this.camera);}
    r.autoClear=auto;r.setClearColor(clearColor,clearAlpha);r.setRenderTarget(previous);
  }
  state(){
    return{opticsTarget:this.targetRT.texture.type===UnsignedByteType?'rgba8':'rgba16f',ready:this.ready,error:this.error??null,progress:this.progress,targetProgress:this.targetProgress,chapter:this.progress<.25?'belief':this.progress<1.8?'hands':this.progress<2.75?'college':this.progress<3.08?'creation':'connection',pointer:this.pointer.toArray(),targetPointer:this.pointerTarget.toArray(),holding:this.holding,hold:this.hold,charge:smooth(.65,.99,this.hold),mist:this.composite.uniforms.uMist.value,contactSeconds:this.contactTime,hovered:this.hovered,green:this.green?.state(),human:this.human?.state(),coins:this.orbit.state(),petals:this.petals.mesh.count,field:[this.width,this.height],sceneType:this.spatialGarden?'3D skinned hands, discs, instanced petals, experimental modeled garden / columns / reflective pond':'Anatomical skinned hands, real depth optics, discs/petals and independent 2.5D landscape',garden:this.garden?.state()??null};
  }
}
