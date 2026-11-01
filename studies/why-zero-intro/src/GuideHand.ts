import {AmbientLight,Bone,Color,DirectionalLight,Group,Mesh,MeshPhysicalMaterial,Quaternion,Scene,SkinnedMesh,Vector2,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

export class GuideHand {
  readonly scene=new Scene();
  readonly root=new Group();
  ready=false;
  error?:string;
  private tip?:Bone;
  private cursor=new Vector2(.5,.5);private cursorAt=-100000;private follow=0;
  setPointer(x:number,y:number){this.cursor.set(x,y);this.cursorAt=performance.now();}
  leavePointer(){this.cursorAt=-100000;}
  private readonly materials:MeshPhysicalMaterial[]=[];
  private readonly flex:{bone:Bone;rest:Quaternion;axis:Vector3;amount:number}[]=[];
  get contact(){return this.tip?.getWorldPosition(new Vector3());}

  constructor(){
    this.scene.add(this.root);
    const key=new DirectionalLight(0xeaffbc,1.65);key.position.set(-2,3,5);
    const fill=new DirectionalLight(0x9bfff1,.55);fill.position.set(3,-2,3);
    const rim=new DirectionalLight(0x45dd7b,1.0);rim.position.set(1,1,-2);
    this.scene.add(new AmbientLight(0xd6edd4,.25),key,fill,rim);
  }

  async load(url:string){
    try{
      const gltf=await new GLTFLoader().loadAsync(url),model=gltf.scene;
      this.root.add(model);model.updateMatrixWorld(true);
      const bones=new Map<string,Bone>();
      model.traverse(n=>{if(n instanceof Bone)bones.set(n.name,n);});
      const wrist=bones.get('wrist');
      if(wrist)for(const finger of ['thumb','index-finger','middle-finger','ring-finger','pinky-finger']){
        const names=finger==='thumb'?['metacarpal','phalanx-proximal','phalanx-distal','tip']:['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
        let parent:Bone=wrist;
        for(const name of names){const bone=bones.get(finger+'-'+name);if(!bone)continue;parent.attach(bone);parent=bone;}
      }
      model.updateMatrixWorld(true);
      for(const [name,bone] of bones){
        if(name==='thumb-metacarpal'){
          this.flex.push({bone,rest:bone.quaternion.clone(),axis:new Vector3(1,0,0).applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert()),amount:-.9});
        }
        if(!name.includes('phalanx'))continue;
        const amount=name.startsWith('index')?.025:name.startsWith('thumb')?(name.includes('proximal')?.82:.8):name.includes('proximal')?.75:name.includes('intermediate')?1.85:.95;
        const axis=new Vector3(0,0,1).applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert());
        this.flex.push({bone,rest:bone.quaternion.clone(),axis,amount});
      }
      model.traverse(n=>{
        if(!(n instanceof Mesh))return;
        const m=new MeshPhysicalMaterial({color:new Color('#6ab73b'),metalness:.02,roughness:.34,clearcoat:.42,clearcoatRoughness:.25,transparent:true,opacity:0,envMapIntensity:.35});
        m.onBeforeCompile=shader=>{
          shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHandLocal;');
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHandLocal=position;');
          shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vHandLocal;');
          shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
            float vHandY=vHandLocal.y;
            float ragged=sin(vHandLocal.x*195.+sin(vHandLocal.z*125.)*1.8)*.006+sin(vHandLocal.z*240.+cos(vHandY*90.))*.002;
            float band=pow(.5+.5*sin((vHandY+ragged)*145.+.5),7.)*.48;
            float wristIce=smoothstep(-.004+ragged,.035+ragged,vHandY);
            diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.70,.79),max(band,wristIce));
            diffuseColor.a*=1.-smoothstep(.055,.12,vHandY);
          `);
        };
        m.customProgramCacheKey=()=> 'frozen-hand-v2';
        n.material=m;n.frustumCulled=false;this.materials.push(m);
        if(n instanceof SkinnedMesh)n.normalizeSkinWeights();
      });
      this.tip=bones.get('index-finger-tip');
      if(!this.tip)throw Error('Hand asset has no index fingertip joint');
      model.rotation.y=Math.PI/2;
      this.root.scale.set(-8.8,8.8,8.8);
      this.ready=true;
    }catch(error){this.error=String(error);this.ready=false;}
  }

  update(guideTime:number,opacity:number,aspect:number,dt=1/60){
    if(!this.ready||!this.tip)return;
    this.root.visible=opacity>.002;
    if(!this.root.visible)return;
    const cycle=guideTime%3.8,progress=Math.min(1,cycle/2.6),theta=progress*Math.PI*2;
    const radius=aspect<.8?.43:.80;
    const target=new Vector3(Math.sin(theta)*radius,Math.cos(theta)*radius-(1-opacity)*.6,.6);
    this.follow+=((performance.now()-this.cursorAt<1300?1:0)-this.follow)*(1-Math.exp(-dt*12));
    target.lerp(new Vector3((this.cursor.x-.5)*aspect*1.7,(this.cursor.y-.5)*1.7,.6),this.follow*.80);
    this.root.rotation.set(0,.06+Math.sin(theta)*.12,Math.PI-.08+Math.sin(theta)*.11);
    for(const f of this.flex){const sign=f.bone.name.includes('phalanx')?-1:1;f.bone.quaternion.copy(f.rest).multiply(new Quaternion().setFromAxisAngle(f.axis,sign*f.amount*(1+Math.sin(guideTime*1.8)*.012)));}
    this.root.updateMatrixWorld(true);
    const point=this.tip.getWorldPosition(new Vector3());
    this.root.position.add(target.sub(point));this.root.updateMatrixWorld(true);
    for(const m of this.materials)m.opacity=opacity*.95;
  }

  dispose(){this.scene.traverse(n=>{if(n instanceof Mesh)n.geometry.dispose();});for(const m of this.materials)m.dispose();}
}
