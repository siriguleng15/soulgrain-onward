import {
  ACESFilmicToneMapping, Box3, DirectionalLight, Group, HemisphereLight, Material,
  Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, Scene, ShadowMaterial, SRGBColorSpace, Texture, Vector3, WebGLRenderer,
} from 'three';
import type { WebGLRenderTarget } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type Surface = { key: string; material: MeshStandardMaterial; supportsPrint: boolean };
function usableUV(mesh: Mesh) {
  const uv=mesh.geometry.getAttribute('uv');
  if(!uv||uv.count<3)return false;
  const u=uv.getX(0),v=uv.getY(0);let x=false,y=false;
  for(let i=1;i<uv.count;i++){x ||= Math.abs(uv.getX(i)-u)>1e-6;y ||= Math.abs(uv.getY(i)-v)>1e-6;if(x&&y)return true;}
  return false;
}

export class ReviewScene {
  readonly renderer: WebGLRenderer;
  readonly scene=new Scene();
  readonly camera=new PerspectiveCamera(34,1,.002,12);
  readonly controls: OrbitControls;
  readonly display=new Group();
  asset?:Group;
  readonly morphMeshes:Mesh[]=[];
  private readonly environment:WebGLRenderTarget;
  private readonly observer:ResizeObserver;
  private readonly defaultCamera=new Vector3();
  private readonly defaultTarget=new Vector3();
  private frame=0;private disposed=false;private suspended=false;private generation=0;
  private floor:Mesh<PlaneGeometry,ShadowMaterial>;
  constructor(readonly host:HTMLElement,onContextFailure:()=>void){
    this.renderer=new WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});
    this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
    this.renderer.setClearColor(0x080e1b,0);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;
    const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','ONWARD鞋型，单指拖动旋转，双指缩放。');
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.suspended=true;cancelAnimationFrame(this.frame);this.frame=0;onContextFailure();});
    canvas.addEventListener('webglcontextrestored',onContextFailure);
    host.append(canvas);this.controls=new OrbitControls(this.camera,canvas);this.controls.enablePan=false;this.controls.enableDamping=true;this.controls.dampingFactor=.13;this.controls.rotateSpeed=.7;this.controls.zoomSpeed=.7;this.controls.maxPolarAngle=Math.PI*.93;
    this.controls.addEventListener('change',()=>this.invalidate());
    const room=new RoomEnvironment();const pmrem=new PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(room,.04,.1,100,{size:256});this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.45;pmrem.dispose();room.dispose();
    this.scene.add(new HemisphereLight(0xc5d6ee,0x17253b,.55));
    const key=new DirectionalLight(0xfff4e5,2.6);key.position.set(-.26,.45,.35);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-.3,right:.3,top:.3,bottom:-.3,near:.02,far:2});key.shadow.normalBias=.00018;key.shadow.bias=-.00001;this.scene.add(key);
    const fill=new DirectionalLight(0xc8d9ef,.7);fill.position.set(.2,.12,-.3);this.scene.add(fill);
    const rim=new DirectionalLight(0xc9d6e9,1.2);rim.position.set(.32,.28,.03);this.scene.add(rim);
    this.floor=new Mesh(new PlaneGeometry(3,3),new ShadowMaterial({opacity:.35}));this.floor.rotation.x=-Math.PI/2;this.floor.receiveShadow=true;this.floor.position.y=-.0005;this.scene.add(this.floor,this.display);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
    document.addEventListener('visibilitychange',()=>{this.suspended=document.hidden;if(!this.suspended){this.renderer.shadowMap.needsUpdate=true;this.invalidate();}});
  }
  invalidate(){
    if(this.frame||this.disposed||this.suspended||this.renderer.getContext().isContextLost())return;
    this.frame=requestAnimationFrame(()=>{this.frame=0;this.controls.update();this.renderer.render(this.scene,this.camera);});
  }
  private resize(){
    const r=this.host.getBoundingClientRect();const ratio=Math.max(1,Math.min(devicePixelRatio||1,1.5,Math.sqrt(2_600_000/Math.max(1,r.width*r.height))));
    this.renderer.setPixelRatio(ratio);this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/Math.max(1,r.height);this.camera.updateProjectionMatrix();
    if(this.asset)this.fit();this.invalidate();
  }
  async load(url:string,progress:(n:number)=>void){
    const generation=++this.generation;
    const gltf=await new GLTFLoader().loadAsync(url,e=>{if(generation===this.generation&&e.total)progress(e.loaded/e.total);});
    if(generation!==this.generation||this.disposed){this.disposeAsset(gltf.scene);return false;}
    if(this.asset){this.display.remove(this.asset);this.disposeAsset(this.asset);}this.asset=gltf.scene;this.morphMeshes.length=0;
    this.display.position.set(0,0,0);this.display.scale.setScalar(1);this.display.add(this.asset);this.display.updateMatrixWorld(true);
    const bounds=new Box3().setFromObject(this.asset);if(bounds.isEmpty())throw Error('The asset contains no visible mesh');
    const size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    const scale=.30/Math.max(size.x,size.y,size.z);this.display.scale.setScalar(scale);this.display.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    this.asset.traverse(node=>{if(!(node instanceof Mesh))return;node.castShadow=node.receiveShadow=true;if(node.morphTargetDictionary&&node.morphTargetInfluences)this.morphMeshes.push(node);
      const materials=Array.isArray(node.material)?node.material:[node.material];for(const material of materials){if(material instanceof MeshStandardMaterial&&material.map){material.map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());material.map.needsUpdate=true;}}});
    this.display.updateMatrixWorld(true);this.fit();this.renderer.shadowMap.needsUpdate=true;this.invalidate();return true;
  }
  surfaces(){
    const surfaces=new Map<MeshStandardMaterial,Surface>();
    this.asset?.traverse(node=>{if(!(node instanceof Mesh))return;const uv=usableUV(node);for(const material of Array.isArray(node.material)?node.material:[node.material]){if(!(material instanceof MeshStandardMaterial))continue;const previous=surfaces.get(material);if(previous){previous.supportsPrint ||= uv;continue;}let key=material.name||'Neutral_Surface';let count=2;while([...surfaces.values()].some(p=>p.key===key))key=`${material.name||'Surface'} ${count++}`;surfaces.set(material,{key,material,supportsPrint:uv});}});
    return [...surfaces.values()];
  }
  fit(){
    if(!this.asset)return;this.display.updateMatrixWorld(true);const bounds=new Box3().setFromObject(this.display),size=bounds.getSize(new Vector3());
    const center=bounds.getCenter(new Vector3());const radius=size.length()/2;const aspect=Math.max(.55,this.camera.aspect);const halfFov=this.camera.fov*Math.PI/360;const distance=radius/Math.sin(Math.min(halfFov,Math.atan(Math.tan(halfFov)*aspect)))*1.12;
    this.defaultTarget.copy(center);this.defaultTarget.y+=size.y*.03;this.defaultCamera.copy(this.defaultTarget).add(new Vector3(-.72,.43,1).normalize().multiplyScalar(distance));
    this.controls.minDistance=radius*1.0;this.controls.maxDistance=distance*3;this.reset();
  }
  reset(){this.controls.target.copy(this.defaultTarget);this.camera.position.copy(this.defaultCamera);this.controls.update();this.invalidate();}
  setShape(value:number){for(const mesh of this.morphMeshes){const index=mesh.morphTargetDictionary?.Shaft_Upright;if(index!==undefined&&mesh.morphTargetInfluences)mesh.morphTargetInfluences[index]=value;}this.renderer.shadowMap.needsUpdate=true;this.invalidate();}
  hasShape(){return this.morphMeshes.some(mesh=>mesh.morphTargetDictionary?.Shaft_Upright!==undefined);}
  info(){let meshes=0;this.asset?.traverse(node=>{if(node instanceof Mesh)meshes++;});return{meshes,materials:this.surfaces().length,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,pixelRatio:this.renderer.getPixelRatio(),camera:this.camera.position.toArray(),target:this.controls.target.toArray(),hasShape:this.hasShape()};}
  private disposeAsset(asset:Group){const materials=new Set<Material>(),textures=new Set<Texture>();asset.traverse(node=>{if(!(node instanceof Mesh))return;node.geometry.dispose();for(const material of Array.isArray(node.material)?node.material:[node.material]){materials.add(material);for(const value of Object.values(material))if(value instanceof Texture)textures.add(value);}});textures.forEach(texture=>texture.dispose());materials.forEach(material=>material.dispose());}
  dispose(){this.disposed=true;this.generation++;cancelAnimationFrame(this.frame);this.observer.disconnect();this.controls.dispose();if(this.asset)this.disposeAsset(this.asset);this.environment.dispose();this.floor.geometry.dispose();this.floor.material.dispose();this.renderer.dispose();}
}
