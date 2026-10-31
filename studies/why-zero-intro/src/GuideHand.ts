import {AmbientLight,Bone,Color,DirectionalLight,Group,Mesh,MeshPhysicalMaterial,Quaternion,Scene,SkinnedMesh,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export class GuideHand {
 readonly scene=new Scene();readonly root=new Group();ready=false;error?:string;
 get contact(){return this.tip?.getWorldPosition(new Vector3());}
 private tip?:Bone;private readonly materials:MeshPhysicalMaterial[]=[];private readonly flex:{bone:Bone;rest:Quaternion;axis:Vector3;amount:number}[]=[];
 constructor(){this.scene.add(this.root);const key=new DirectionalLight(0xf2ffd2,4);key.position.set(-2,3,5);const rim=new DirectionalLight(0xcaff4a,3);rim.position.set(2,-1,-1);this.scene.add(new AmbientLight(0xb6d58d,1.2),key,rim);}
 async load(url:string){try{const gltf=await new GLTFLoader().loadAsync(url),model=gltf.scene;this.root.add(model);model.updateMatrixWorld(true);const bones=new Map<string,Bone>();model.traverse(n=>{if(n instanceof Bone)bones.set(n.name,n);});const wrist=bones.get('wrist');
   if(wrist)for(const finger of['thumb','index-finger','middle-finger','ring-finger','pinky-finger']){const names=finger==='thumb'?['metacarpal','phalanx-proximal','phalanx-distal','tip']:['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];let parent:Bone=wrist;for(const name of names){const bone=bones.get(finger+'-'+name);if(!bone)continue;parent.attach(bone);parent=bone;}}
   model.updateMatrixWorld(true);
   for(const[name,bone]of bones){if(!name.includes('phalanx'))continue;const amount=name.startsWith('index')?.10:name.startsWith('thumb')?.35:name.includes('proximal')?1.0:name.includes('intermediate')?1.12:.55;const axis=new Vector3(0,0,1).applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert());this.flex.push({bone,rest:bone.quaternion.clone(),axis,amount});}
   model.traverse(n=>{if(n instanceof Mesh){const m=new MeshPhysicalMaterial({color:new Color('#5cbb21'),metalness:.16,roughness:.24,clearcoat:.7,clearcoatRoughness:.24,transparent:true,opacity:0,depthWrite:true});n.material=m;n.frustumCulled=false;this.materials.push(m);if(n instanceof SkinnedMesh)n.normalizeSkinWeights();}});
   this.tip=bones.get('index-finger-tip');if(!this.tip)throw Error('Hand asset has no index fingertip joint');model.rotation.y=-Math.PI/2;this.root.scale.setScalar(2.75);this.ready=true;
  }catch(e){this.error=String(e);this.ready=false;}}
 update(time:number,opacity:number,aspect:number){if(!this.ready||!this.tip)return;this.root.visible=opacity>.002;if(!this.root.visible)return;
  const loop=(time*.23)%1,theta=-Math.PI/2-loop*Math.PI*2;const r=.25;
  const target=new Vector3(Math.cos(theta)*r,Math.sin(theta)*r*1.28+(aspect<1?.42:.32),.6);
  this.root.rotation.z=Math.PI-.38+Math.sin(theta)*.05;
  for(const f of this.flex)f.bone.quaternion.copy(f.rest).multiply(new Quaternion().setFromAxisAngle(f.axis,-f.amount*(1+Math.sin(time*1.2)*.025)));
  this.root.updateMatrixWorld(true);const point=this.tip.getWorldPosition(new Vector3());this.root.position.add(target.sub(point));this.root.updateMatrixWorld(true);
  for(const m of this.materials)m.opacity=opacity*.94;
 }
 dispose(){this.scene.traverse(n=>{if(n instanceof Mesh)n.geometry.dispose();});for(const m of this.materials)m.dispose();}
}
