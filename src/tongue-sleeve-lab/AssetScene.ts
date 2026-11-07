import {ACESFilmicToneMapping,Box3,DirectionalLight,Group,HemisphereLight,Mesh,MeshStandardMaterial,PerspectiveCamera,PMREMGenerator,Scene,SkeletonHelper,SkinnedMesh,SRGBColorSpace,Vector3,WebGLRenderer} from 'three';
import type {Object3D} from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {StudioMaterials} from '../advertising/scene/StudioMaterials.ts';
import {DISPLAY_SCALE,SHOE_CENTER,SOURCES} from './Sources.ts';
import {HandInspection} from './HandInspection.ts';
import {CuffActor} from './CuffActor.ts';
import type {CuffBindings,HandView} from './CuffActor.ts';
import rigReport from '../../modeling/tongue-sleeve-lab/rig-report.json';
import separation from '../../modeling/tongue-sleeve-lab/separation-report.json';
import type {Finger} from './HandInspection.ts';

interface Entry {key:string;node:number;primitive:number;nodeName:string;material:string;mesh:Mesh;visible:boolean;}
export class AssetScene {
 readonly scene=new Scene();readonly camera=new PerspectiveCamera(35,1,.02,100);readonly renderer:WebGLRenderer;readonly controls:OrbitControls;
 readonly shoeRoot=new Group();readonly handRoot=new Group();hand?:HandInspection;helper?:SkeletonHelper;ready=false;kind:'shoe'|'hand'='shoe';selection='all';contextLost=false;
 readonly entries:Entry[]=[];readonly verified:Record<string,string>={};
 cuffActor?:CuffActor;private rawHand?:Object3D;handView:HandView='assembled';
 blankTongue=true;private readonly reverseMaterials=new Map<MeshStandardMaterial,{map:MeshStandardMaterial['map'];color:number}>();
 private readonly repair=new StudioMaterials();private readonly abort=new AbortController();private readonly originals=new Map<Mesh,string>();
 private readonly observer:ResizeObserver;private frame=0;private disposed=false;private dirty=true;private environment;
 constructor(readonly host:HTMLElement,readonly changed:()=>void){
  this.renderer=new WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.outputColorSpace=SRGBColorSpace;this.renderer.toneMapping=ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.renderer.setClearColor(0x090f18);
  const canvas=this.renderer.domElement;canvas.style.cssText='display:block;width:100%;height:100%;touch-action:none';canvas.setAttribute('aria-label','资产检查三维场景，拖动旋转、双指缩放');host.append(canvas);canvas.addEventListener('webglcontextlost',this.onContextLost);canvas.addEventListener('webglcontextrestored',this.onContextRestored);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.enableDamping=true;this.controls.minDistance=.5;this.controls.maxDistance=30;this.controls.addEventListener('change',this.invalidate);
  const pmrem=new PMREMGenerator(this.renderer),room=new RoomEnvironment();this.environment=pmrem.fromScene(room,.04);this.scene.environment=this.environment.texture;this.scene.environmentIntensity=.5;pmrem.dispose();room.dispose();
  this.scene.add(new HemisphereLight(0xdbe8ff,0x181018,.8));for(const position of[[-4,6,7],[5,3,-4]]){const light=new DirectionalLight(0xe6ecff,1.65);light.position.fromArray(position);this.scene.add(light);}
  this.shoeRoot.scale.setScalar(DISPLAY_SCALE);this.shoeRoot.position.fromArray(SHOE_CENTER).multiplyScalar(-DISPLAY_SCALE);this.handRoot.scale.setScalar(DISPLAY_SCALE);this.scene.add(this.shoeRoot,this.handRoot);
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();this.frame=requestAnimationFrame(this.loop);
 }
 async load(){
  const data=await Promise.all((['shoe','hand'] as const).map(async kind=>{
   const source=SOURCES[kind],response=await fetch(import.meta.env.BASE_URL+source.url,{signal:this.abort.signal});if(!response.ok)throw Error(kind+' HTTP '+response.status);
   const buffer=await response.arrayBuffer();if(globalThis.crypto?.subtle){const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),n=>n.toString(16).padStart(2,'0')).join('');if(sha!==source.sha256)throw Error(kind+' 源文件散列不符');this.verified[kind]=sha;}
   const gltf=await new GLTFLoader().parseAsync(buffer,'');return{kind,gltf};
  }));
  if(this.disposed)return;
  for(const{kind,gltf}of data){
   gltf.scene.traverse(object=>{if(!(object instanceof Mesh))return;this.originals.set(object,this.fingerprint(object));
    const original=Array.isArray(object.material)?object.material:[object.material];const copies=original.map(m=>{const copy=m.clone();if(copy instanceof MeshStandardMaterial)this.repair.apply(copy);return copy;});object.material=Array.isArray(object.material)?copies:copies[0];
    if(kind==='shoe'){
     let ancestor:Object3D|null=object;let node:number|undefined;
     while(ancestor){const association=gltf.parser.associations.get(ancestor);if(association?.nodes!==undefined){node=association.nodes;break;}ancestor=ancestor.parent;}
     const primitiveReference=gltf.parser.associations.get(object) as {primitives?:number}|undefined;
     const primitive=primitiveReference?.primitives??0,nodeName=node===undefined?object.name:gltf.parser.json.nodes[node].name;
     this.entries.push({key:`${node}:${primitive}`,node:node??-1,primitive,nodeName,material:copies.map(m=>m.name).join(' / '),mesh:object,visible:object.visible});
    }
   });
   if(kind==='shoe')this.shoeRoot.add(gltf.scene);else{
    let bones=0;gltf.scene.traverse(o=>{if(o.type==='Bone')bones++;});this.handRoot.add(gltf.scene);this.rawHand=gltf.scene;
    if(bones){this.handRoot.updateWorldMatrix(true,true);this.hand=new HandInspection(gltf.scene);this.helper=new SkeletonHelper(this.handRoot);this.helper.visible=false;this.scene.add(this.helper);}
    else {gltf.scene.scale.setScalar(separation.rawToMetres);gltf.scene.position.fromArray(separation.rawOrigin).multiplyScalar(-separation.rawToMetres);gltf.scene.visible=false;}
   }
  }
  const [partsResponse,bindingResponse]=await Promise.all(['user-hand-parts.glb','cuff-medallion-bindings.json'].map(name=>fetch(import.meta.env.BASE_URL+'tongue-sleeve-lab/assets/'+name,{signal:this.abort.signal})));
  if(!partsResponse.ok||!bindingResponse.ok)throw Error('派生马蹄袖资产加载失败');
  const partsBuffer=await partsResponse.arrayBuffer(),layout=await bindingResponse.json() as CuffBindings;
  if(globalThis.crypto?.subtle){const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',partsBuffer)),v=>v.toString(16).padStart(2,'0')).join('');if(sha!==layout.derivedCuffSHA256||sha!==separation.derivedSHA256)throw Error('派生袖面与烫钻绑定不匹配');this.verified.derivedCuff=sha;}
  const parts=await new GLTFLoader().parseAsync(partsBuffer,'');const rigResponse=await fetch(import.meta.env.BASE_URL+'tongue-sleeve-lab/assets/user-hand-rig.glb',{signal:this.abort.signal});if(!rigResponse.ok)throw Error('手指蒙皮加载失败');const rigBytes=await rigResponse.arrayBuffer();
  if(globalThis.crypto?.subtle){const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',rigBytes)),v=>v.toString(16).padStart(2,'0')).join('');if(sha!==rigReport.sha256)throw Error('手部骨骼资产核验失败');this.verified.handRig=sha;}
  const rig=await new GLTFLoader().parseAsync(rigBytes,'');this.cuffActor=new CuffActor(parts.scene,layout,rig.scene);this.handRoot.add(this.cuffActor.root);this.handRoot.scale.setScalar(DISPLAY_SCALE);this.hand=new HandInspection(rig.scene);this.helper=new SkeletonHelper(rig.scene);this.helper.visible=false;this.scene.add(this.helper);
  for(const entry of this.entries)if(entry.node===4&&entry.material==='Tongue_Reverse_Canvas'){
   const material=entry.mesh.material;if(material instanceof MeshStandardMaterial)this.reverseMaterials.set(material,{map:material.map,color:material.color.getHex()});
  }
  this.ready=true;this.setTongueBlank(true);this.setKind('shoe');this.changed();
 }
 setHandView(view:HandView){this.handView=view;if(this.rawHand)this.rawHand.visible=view==='source';if(this.cuffActor){this.cuffActor.root.visible=view!=='source';this.cuffActor.setView(view);}this.frameSubject();this.dirty=true;this.changed();}
 setBend(value:number){this.cuffActor?.setBend(value);this.dirty=true;this.changed();}
 setSilver(value:boolean){this.cuffActor?.setSilver(value);this.dirty=true;this.changed();}
 viewFrom(view:'quarter'|'top'|'side'|'bottom'){const direction=view==='quarter'?undefined:view==='top'?new Vector3(0,1,0):view==='bottom'?new Vector3(0,-1,0):new Vector3(1,0,0);const up=view==='top'?new Vector3(0,0,-1):view==='bottom'?new Vector3(0,0,1):new Vector3(0,1,0);this.frameSubject(direction,up);}
 private fingerprint(mesh:Mesh){let h=2166136261;for(const a of[...Object.values(mesh.geometry.attributes),mesh.geometry.index])if(a){const bytes=new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength);for(const v of bytes)h=Math.imul(h^v,16777619);}return(h>>>0).toString(16);}
 setKind(kind:'shoe'|'hand'){this.kind=kind;this.shoeRoot.visible=kind==='shoe';this.handRoot.visible=kind==='hand';if(this.helper)this.helper.visible=false;this.frameSubject();this.dirty=true;this.changed();}
 select(key:string){this.selection=key;for(const entry of this.entries)entry.mesh.visible=entry.visible&&(key==='all'||entry.key===key)&&(!this.blankTongue||![27,28].includes(entry.node));this.frameSubject();this.changed();}
 setTongueBlank(blank:boolean){this.blankTongue=blank;for(const[material,original]of this.reverseMaterials){material.map=blank?null:original.map;material.color.setHex(blank?0xe4ded2:original.color);material.needsUpdate=true;}this.select(this.selection);this.dirty=true;}
 frameSubject(direction?:Vector3,up=new Vector3(0,1,0)){if(!this.ready)return;this.camera.up.copy(up);this.scene.updateMatrixWorld(true);let bounds:Box3;
  if(this.kind==='hand')bounds=this.cuffActor&&this.handView==='cuff-only'?new Box3().setFromObject(this.cuffActor.cuff):new Box3().setFromObject(this.handRoot);
  else{const entry=this.entries.find(e=>e.key===this.selection);bounds=new Box3().setFromObject(entry?.mesh??this.shoeRoot);}
  const center=bounds.getCenter(new Vector3()),dir=(direction??(this.kind==='hand'?new Vector3(1,1.5,1.3):new Vector3(-1.5,.8,1.6))).clone().normalize(),right=new Vector3().crossVectors(up,dir).normalize(),vertical=new Vector3().crossVectors(dir,right).normalize(),tan=Math.tan(this.camera.fov*Math.PI/360)*.82;let distance=.3;
  for(const x of[bounds.min.x,bounds.max.x])for(const y of[bounds.min.y,bounds.max.y])for(const z of[bounds.min.z,bounds.max.z]){const v=new Vector3(x,y,z).sub(center),depth=v.dot(dir);distance=Math.max(distance,depth+Math.abs(v.dot(vertical))/tan,depth+Math.abs(v.dot(right))/(tan*this.camera.aspect));}
  this.controls.target.copy(center);this.camera.position.copy(center).addScaledVector(dir,distance);this.camera.lookAt(center);this.controls.update();this.dirty=true;
 }
 setCurl(finger:Finger,value:number){this.hand?.setCurl(finger,value);this.handRoot.updateMatrixWorld(true);this.handRoot.traverse(o=>{if(o instanceof SkinnedMesh)o.computeBoundingBox();});this.dirty=true;this.changed();}
 resetHand(){this.hand?.reset();this.dirty=true;this.changed();}
 private resize(){const r=this.host.getBoundingClientRect();this.renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));this.camera.aspect=r.width/Math.max(1,r.height);this.camera.updateProjectionMatrix();this.dirty=true;}
 private onContextLost=(event:Event)=>{event.preventDefault();this.contextLost=true;this.changed();};
 private onContextRestored=()=>{this.contextLost=false;this.dirty=true;this.changed();};
 private invalidate=()=>{this.dirty=true;};
 private loop=()=>{if(this.disposed)return;this.controls.update();if(this.dirty&&!this.contextLost){this.renderer.render(this.scene,this.camera);this.dirty=false;}this.frame=requestAnimationFrame(this.loop);};
 state(){return{phase:'01-asset-preparation',ready:this.ready,contextLost:this.contextLost,kind:this.kind,selection:this.selection,verified:{...this.verified},cameraOwner:'inspection',blankTongue:this.blankTongue,cuff:this.cuffActor?.state(),boneCount:this.hand?.bones.size??0,curls:{...this.hand?.curls},entries:this.entries.map(({key,node,primitive,nodeName,material,mesh})=>({key,node,primitive,nodeName,material,vertices:mesh.geometry.getAttribute('position').count})),sourceGeometryUnchanged:[...this.originals].every(([mesh,hash])=>this.fingerprint(mesh)===hash),drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles};}
 dispose(){this.disposed=true;this.abort.abort();cancelAnimationFrame(this.frame);this.observer.disconnect();this.controls.dispose();this.helper?.dispose();this.cuffActor?.dispose();this.repair.dispose();this.environment.dispose();this.scene.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.renderer.domElement.removeEventListener('webglcontextlost',this.onContextLost);this.renderer.domElement.removeEventListener('webglcontextrestored',this.onContextRestored);this.renderer.dispose();this.renderer.domElement.remove();}
}
