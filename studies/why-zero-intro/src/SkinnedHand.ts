import {Bone,Color,Euler,Group,Mesh,MeshPhysicalMaterial,Quaternion,SkinnedMesh,Texture,Vector3} from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';

export type HandPose='open'|'reach'|'humanReach'|'clench'|'defiant';
type Joint={bone:Bone;rest:Quaternion;axis:Vector3;value:number;name:string};
const curls:Record<HandPose,number[][]>={
  open:[[.10,.12,.1],[.05,.08,.04],[.18,.22,.12],[.65,.9,.45],[.8,1.2,.45]],
  reach:[[.22,.28,.2],[.09,.12,.08],[.42,.50,.22],[.72,.70,.35],[.92,.80,.4]],
  humanReach:[[.16,.22,.1],[.06,.12,.06],[.30,.3,.12],[.55,.45,.20],[.65,.55,.25]],
  clench:[[.75,.8,.6],[.85,1.65,.85],[.85,1.8,.85],[.9,1.85,.85],[1.0,1.8,.8]],
  defiant:[[.75,.8,.6],[.9,1.8,.95],[.0,.035,.02],[.95,1.8,.9],[1.05,1.75,.8]],
};
const fingers=['thumb','index-finger','middle-finger','ring-finger','pinky-finger'];

/** A single rest mesh and skeleton, continuously posed; never swaps gesture models. */
export class SkinnedHand {
  readonly root=new Group();
  readonly joints:Joint[]=[];
  readonly uniforms={uIce:{value:0},uWristFade:{value:1}};
  readonly material:MeshPhysicalMaterial;
  readonly targetTip=new Vector3();
  private index!:Bone;
  private middle!:Bone;
  private smoothedTip=new Vector3();
  private initialized=false;
  private targetRotation=new Quaternion();

  constructor(source:Group,readonly human=false,skin?:Texture){
    const model=clone(source);
    this.root.add(model);model.updateMatrixWorld(true);
    const bones=new Map<string,Bone>();
    model.traverse(n=>{if(n instanceof Bone)bones.set(n.name,n);});
    const wrist=bones.get('wrist');
    if(!wrist)throw Error('Narrative hand is missing its wrist bone');
    for(const finger of fingers){
      let parent:Bone=wrist;
      const parts=finger==='thumb'?['metacarpal','phalanx-proximal','phalanx-distal','tip']:['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
      for(const part of parts){const b=bones.get(finger+'-'+part);if(b){parent.attach(b);parent=b;}}
    }
    model.updateMatrixWorld(true);
    for(const [name,bone]of bones){
      if(!name.includes('phalanx')&&!name.includes('metacarpal'))continue;
      const axis=new Vector3(name.includes('metacarpal')?1:0,0,name.includes('phalanx')?1:0).applyQuaternion(bone.getWorldQuaternion(new Quaternion()).invert());
      this.joints.push({bone,rest:bone.quaternion.clone(),axis,value:0,name});
    }
    this.index=bones.get('index-finger-tip')!;this.middle=bones.get('middle-finger-tip')!;
    if(!this.index||!this.middle)throw Error('Narrative hand has no fingertip joints');
    this.material=new MeshPhysicalMaterial({color:new Color(human?'#9a6e5f':'#48a823'),metalness:0,roughness:human?.51:.39,clearcoat:human?.02:.18,clearcoatRoughness:.4,transparent:true,opacity:0,envMapIntensity:human?.15:.24});
    this.material.onBeforeCompile=s=>{
      Object.assign(s.uniforms,this.uniforms);
      s.uniforms.uSkin={value:skin??null};
      s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHandLocal;');
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHandLocal=position;');
      s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vHandLocal;uniform float uIce,uWristFade;uniform sampler2D uSkin;');
      s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float y=vHandLocal.y;
        float veins=sin(vHandLocal.z*170.+sin(y*65.))*sin(y*111.);
        float icy=pow(.5+.5*sin((y+veins*.002)*140.),6.)*.55+smoothstep(.005,.048,y)*.65;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.18,.62,.68),min(1.,icy)*uIce);
        diffuseColor.rgb*=1.+veins*${human?'.018':'.008'};
        ${human?'float skinTone=texture2D(uSkin,vHandLocal.zy*vec2(11.,5.)+vec2(.4,.6)).r;diffuseColor.rgb*=.90+skinTone*.13;':''}
        ${human?`float crease=exp(-pow((y+.078)/.0012,2.))*exp(-pow((vHandLocal.z+.012)/.012,2.))+exp(-pow((y+.104)/.0010,2.))*exp(-pow((vHandLocal.z+.012)/.012,2.));
        crease+=exp(-pow((y+.081)/.0013,2.))*exp(-pow((vHandLocal.z-.012)/.012,2.))+exp(-pow((y+.11)/.0011,2.))*exp(-pow((vHandLocal.z-.016)/.011,2.));
        diffuseColor.rgb*=1.-crease*.18;`:''}
        diffuseColor.a*=mix(1.,1.-smoothstep(.015,.085,y),uWristFade);
      `);
      if(human)s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        float skinHeight=texture2D(uSkin,vHandLocal.zy*vec2(11.,5.)+vec2(.4,.6)).r;
        vec3 q0=dFdx(-vViewPosition),q1=dFdy(-vViewPosition);
        vec3 s1=cross(q1,normal),s2=cross(normal,q0);
        float det=dot(q0,s1);
        vec3 surfaceGradient=sign(det)*.002*(dFdx(skinHeight)*s1+dFdy(skinHeight)*s2);
        normal=normalize(abs(det)*normal-surfaceGradient);
      `);
    };
    this.material.customProgramCacheKey=()=> 'narrative-hand-v3-'+human;
    model.traverse(n=>{
      if(!(n instanceof Mesh))return;
      // Match normals across duplicated export vertices, without changing skin topology.
      const g=n.geometry;
      if(!g.userData.smoothNarrativeNormals){
        g.computeVertexNormals();
        const p=g.getAttribute('position'),normal=g.getAttribute('normal'),map=new Map<string,number[]>();
        const key=(i:number)=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
        for(let i=0;i<p.count;i++){const k=key(i),sum=map.get(k)??[0,0,0];sum[0]+=normal.getX(i);sum[1]+=normal.getY(i);sum[2]+=normal.getZ(i);map.set(k,sum);}
        for(let i=0;i<p.count;i++){const sum=map.get(key(i))!,l=Math.hypot(...sum)||1;normal.setXYZ(i,sum[0]/l,sum[1]/l,sum[2]/l);}
        normal.needsUpdate=true;g.userData.smoothNarrativeNormals=true;
      }
      n.material=this.material;n.frustumCulled=false;if(n instanceof SkinnedMesh)n.normalizeSkinWeights();
    });
    model.rotation.y=Math.PI/2;
  }

  update(dt:number,tip:Vector3,rotation:Euler,scale:number,pose:HandPose,amount:number,opacity:number,ice:number,wristFade:number,defiance=0){
    this.root.visible=opacity>.001;
    if(!this.root.visible)return;
    const k=1-Math.exp(-Math.min(dt,.1)*18);
    this.uniforms.uIce.value=ice;this.uniforms.uWristFade.value=wristFade;
    this.material.opacity=opacity;
    for(const joint of this.joints){
      const finger=fingers.findIndex(n=>joint.name.startsWith(n));
      const part=joint.name.includes('proximal')?0:joint.name.includes('intermediate')?1:2;
      let value=0;
      if(joint.name.includes('metacarpal')){
        value=finger===0?-.23-amount*.28-defiance*.30:(finger-2)*.025;
      }else{
        const normal=curls[pose][finger][part];
        value=-(normal+(curls.clench[finger][part]-normal)*amount);
      }
      joint.value+=(value-joint.value)*k;
      joint.bone.quaternion.copy(joint.rest).multiply(new Quaternion().setFromAxisAngle(joint.axis,joint.value));
    }
    this.targetRotation.setFromEuler(rotation);
    if(!this.initialized){this.root.quaternion.copy(this.targetRotation);this.smoothedTip.copy(tip);this.initialized=true;}
    this.root.quaternion.slerp(this.targetRotation,k);
    this.smoothedTip.lerp(tip,k);this.targetTip.copy(tip);
    this.root.scale.set((this.human?1:-1)*scale,scale,scale);
    this.root.position.set(0,0,0);this.root.updateMatrixWorld(true);
    const anchor=this.index.getWorldPosition(new Vector3()).lerp(this.middle.getWorldPosition(new Vector3()),defiance);
    this.root.position.copy(this.smoothedTip).sub(anchor);this.root.updateMatrixWorld(true);
  }
  state(){return{visible:this.root.visible,opacity:this.material.opacity,root:this.root.position.toArray(),index:this.index.getWorldPosition(new Vector3()).toArray(),middle:this.middle.getWorldPosition(new Vector3()).toArray(),joints:this.joints.filter(j=>j.name.includes('proximal')).map(j=>({name:j.name,angle:j.value}))};}
}
