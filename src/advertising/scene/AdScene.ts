import {
  ACESFilmicToneMapping, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  PCFSoftShadowMap, PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial, SRGBColorSpace,
  Vector3, WebGLRenderer,
} from 'three';
import type { Material, Object3D, WebGLRenderTarget } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CameraRig } from './CameraRig';
import { CuffCurve } from '../geometry/CuffCurve';
import { CuffMaterial } from '../geometry/CuffMaterial';
import { Structure } from '../geometry/Structure';
import type { CuffMetadata, NarrativeState } from '../types';

function actorOf(object: Object3D): string {
  let node: Object3D | null = object;
  while(node){if(node.userData.adActor)return node.userData.adActor;node=node.parent;}return 'shoe';
}
export class AdScene {
  readonly scene = new Scene();readonly shoe = new Group();readonly demo = new Group();
  readonly renderer: WebGLRenderer;readonly rig: CameraRig;
  readonly hitTargets: Object3D[]=[];
  original!: CuffMaterial;copy!: CuffMaterial;leftStructure!: Structure;rightStructure!: Structure;
  metadata!: CuffMetadata;
  private target?: WebGLRenderTarget;
  private readonly key: DirectionalLight;private readonly fill: DirectionalLight;
  private readonly rim: DirectionalLight;
  private readonly resources: Material[]=[];
  private currentRatio: number;
  loaded = false;lost = false;
  constructor(readonly container: HTMLElement, readonly contextLost: () => void) {
    this.renderer=new WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
    this.renderer.setClearColor(0x070d19,1);
    this.currentRatio=Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.25:1.5);
    this.renderer.setPixelRatio(this.currentRatio);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    const canvas=this.renderer.domElement;canvas.setAttribute('aria-label','ONWARD三维叙事空间。单指旋转，双指缩放。');canvas.tabIndex=0;
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.lost=true;contextLost();});
    canvas.addEventListener('webglcontextrestored',()=>{this.lost=false;contextLost();});
    container.append(canvas);this.rig=new CameraRig(canvas);
    const room=new RoomEnvironment();const pmrem=new PMREMGenerator(this.renderer);
    this.target=pmrem.fromScene(room,.035,.1,100,{size:256});this.scene.environment=this.target.texture;this.scene.environmentIntensity=.48;
    pmrem.dispose();room.dispose();
    this.scene.add(new HemisphereLight(0xb7c8e5,0x1a2339,.60));
    this.key=new DirectionalLight(0xfff4e6,2.8);this.key.position.set(-.26,.48,.36);this.key.castShadow=true;
    this.key.shadow.mapSize.set(1024,1024);this.key.shadow.camera.left=-.55;this.key.shadow.camera.right=.55;this.key.shadow.camera.top=.48;this.key.shadow.camera.bottom=-.22;
    this.key.shadow.camera.near=.02;this.key.shadow.camera.far=2;this.key.shadow.normalBias=.0005;this.key.shadow.bias=-.00005;this.scene.add(this.key);
    this.fill=new DirectionalLight(0xc8d9f5,.9);this.fill.position.set(.12,.16,-.3);this.scene.add(this.fill);
    this.rim=new DirectionalLight(0xb7a6db,1.6);this.rim.position.set(.33,.29,.04);this.scene.add(this.rim);
    this.scene.add(this.shoe,this.demo);
    const floor=new Mesh(new PlaneGeometry(4,4),new ShadowMaterial({opacity:.22}));floor.rotation.x=-Math.PI/2;floor.position.y=-.0228;floor.receiveShadow=true;this.scene.add(floor);
  }
  async load(progress:(ratio:number)=>void) {
    const base=`${import.meta.env.BASE_URL}assets/onward-ad-v1/`;
    const [gltf,meta]=await Promise.all([
      new GLTFLoader().loadAsync(base+'onward-ad-v1.glb',e=>{if(e.total)progress(e.loaded/e.total);}),
      fetch(base+'cuff-structure.json').then(r=>{if(!r.ok)throw Error('结构数据未能加载');return r.json() as Promise<CuffMetadata>;}),
    ]);
    this.metadata=meta;this.original=new CuffMaterial(new CuffCurve(meta));this.copy=new CuffMaterial(new CuffCurve(meta,true),true);
    const original=gltf.scene;original.updateMatrixWorld(true);
    const copies: Mesh[]=[];
    original.traverse(node=>{
      if(!(node instanceof Mesh))return;
      node.castShadow=node.receiveShadow=true;
      if(!node.geometry.hasAttribute('_sg_param'))return;
      const role=actorOf(node);this.hitTargets.push(node);
      const materials=Array.isArray(node.material)?node.material:[node.material];
      const newMaterials=materials.map(material=>material instanceof MeshStandardMaterial?this.original.attach(material,role==='clasp'):material);
      node.material=Array.isArray(node.material)?newMaterials:newMaterials[0];
      node.customDepthMaterial=this.original.depth(role==='clasp');node.customDistanceMaterial=this.original.distance(role==='clasp');
      // The echo is the same mesh and same UVs, sharing geometry/textures.
      const echo=node.clone(false);echo.matrix.copy(node.matrixWorld);echo.matrix.decompose(echo.position,echo.quaternion,echo.scale);
      const copyMaterials=materials.map(material=>material instanceof MeshStandardMaterial?this.copy.attach(material,role==='clasp'):material);
      echo.material=Array.isArray(node.material)?copyMaterials:copyMaterials[0];
      echo.customDepthMaterial=this.copy.depth(role==='clasp');echo.customDistanceMaterial=this.copy.distance(role==='clasp');
      echo.castShadow=echo.receiveShadow=true;echo.frustumCulled=false;copies.push(echo);
      node.frustumCulled=false;
    });
    this.shoe.add(original);copies.forEach(copy=>this.demo.add(copy));
    this.leftStructure=new Structure(this.original.curve,false);this.rightStructure=new Structure(this.copy.curve,true);
    this.shoe.add(this.leftStructure.group);this.demo.add(this.rightStructure.group);
    this.copy.set(1,0,0,0,0);this.demo.visible=false;this.loaded=true;progress(1);
    this.renderer.shadowMap.needsUpdate=true;
  }
  apply(state:NarrativeState,time:number,reduced:boolean) {
    if(!this.loaded)return;
    this.shoe.position.set(state.shoeX,reduced?0:Math.sin(time*.49)*.00045,0);this.shoe.rotation.y=state.yaw;
    this.original.set(state.unfold,state.claspLift);
    this.copy.set(1,0,state.white,state.copy,state.wrap);
    this.demo.visible=state.copy>.001;
    this.demo.position.set(state.demoX,state.demoY,state.demoZ);this.demo.scale.y=1-.25*state.wrap;
    this.leftStructure.update(state.roof,state.rods,state.leftStructure,0,0,0);
    this.rightStructure.update(state.roof,state.rods,state.copy,state.wrap,state.cover,state.lattice);
    const breath=reduced?0:Math.sin(time*.63)*.025;
    this.key.intensity=2.8+state.focusLight*.45+breath;
    this.fill.intensity=.9-state.focusLight*.14;
    this.rim.intensity=1.6+state.focusLight*.25+breath*.5;
  }
  render(){if(!this.lost)this.renderer.render(this.scene,this.rig.camera);}
  resize(state:NarrativeState){const r=this.container.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.rig.resize(r.width,r.height,state.framing);}
  lowerResolution(){if(this.currentRatio<=.85)return false;this.currentRatio=Math.max(.85,this.currentRatio-.15);this.renderer.setPixelRatio(this.currentRatio);return true;}
  info(){return {drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,pixelRatio:this.currentRatio,textures:this.renderer.info.memory.textures};}
  cuffAnchor(){return new Vector3(.088,.072,.046).applyMatrix4(this.shoe.matrixWorld);}
  dispose(){
    this.original?.dispose();this.copy?.dispose();this.leftStructure?.dispose();this.rightStructure?.dispose();this.resources.forEach(m=>m.dispose());
    this.target?.dispose();this.rig.dispose();this.renderer.dispose();
    this.scene.traverse(node=>{if(node instanceof Mesh){node.geometry.dispose();const ms=Array.isArray(node.material)?node.material:[node.material];ms.forEach(m=>m.dispose());}});
  }
}
