import {Bone,Euler,Group,Mesh,MeshPhysicalMaterial,MeshStandardMaterial,Quaternion,SkinnedMesh,Texture,Vector3} from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {createHandMaterial} from './HandMaterialV5.ts';

import {HandRig} from './HandRig.ts';
import type {HandPose} from './HandRig.ts';
export type {HandPose} from './HandRig.ts';

/** A single rest mesh and skeleton, continuously posed; never swaps gesture models. */
export class SkinnedHand {
  readonly root=new Group();
  readonly rig:HandRig;
  readonly glove:boolean;
  get joints(){return this.rig.joints;}
  readonly uniforms={uIce:{value:0},uWristFade:{value:1}};
  readonly material:MeshPhysicalMaterial;
  private readonly surfaces:ReturnType<typeof createHandMaterial>[]=[];
  readonly targetTip=new Vector3();
  private index!:Bone;
  private middle!:Bone;
  private smoothedTip=new Vector3();
  private initialized=false;
  private targetRotation=new Quaternion();
  private forearm?:{bone:Bone;rest:Quaternion;axis:Vector3;value:number};

  constructor(source:Group,readonly human=false,skin?:Texture){
    const model=clone(source);
    this.root.add(model);model.updateMatrixWorld(true);
    const bones=new Map<string,Bone>();
    model.traverse(n=>{if(n instanceof Bone)bones.set(n.name,n);});
    const wrist=bones.get('wrist');
    if(!wrist)throw Error('Narrative hand is missing its wrist bone');
    const forearm=bones.get('forearm-bend');
    if(forearm)this.forearm={bone:forearm,rest:forearm.quaternion.clone(),axis:new Vector3(1,0,0).applyQuaternion(forearm.getWorldQuaternion(new Quaternion()).invert()),value:0};
    let anatomical=source.userData.anatomicalV5===true;
    source.traverse(n=>{if(n.userData.anatomicalV5===true)anatomical=true;});
    let glove=source.userData.gloveV5===true;
    source.traverse(n=>{if(n.userData.gloveV5===true)glove=true;});
    this.glove=glove;
    this.rig=new HandRig(bones,human,anatomical);
    this.index=bones.get('index-finger-tip')!;this.middle=bones.get('middle-finger-tip')!;
    if(!this.index||!this.middle)throw Error('Narrative hand has no fingertip joints');
    const primary=createHandMaterial(human,skin,{gloveSurface:glove});
    primary.uniforms.uIce=this.uniforms.uIce;primary.uniforms.uWristFade=this.uniforms.uWristFade;
    this.material=primary.material;this.surfaces.push(primary);
    const materialCache=new Map<string,MeshPhysicalMaterial>();
    model.traverse(n=>{
      if(!(n instanceof Mesh))return;
      // The anatomical export already carries continuous hand/forearm normals
      // across its material split. Recomputing each primitive would break that seam.
      const g=n.geometry;
      if(!anatomical&&!g.userData.smoothNarrativeNormals){
        g.computeVertexNormals();
        const p=g.getAttribute('position'),normal=g.getAttribute('normal'),map=new Map<string,number[]>();
        const key=(i:number)=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
        for(let i=0;i<p.count;i++){const k=key(i),sum=map.get(k)??[0,0,0];sum[0]+=normal.getX(i);sum[1]+=normal.getY(i);sum[2]+=normal.getZ(i);map.set(k,sum);}
        for(let i=0;i<p.count;i++){const sum=map.get(key(i))!,l=Math.hypot(...sum)||1;normal.setXYZ(i,sum[0]/l,sum[1]/l,sum[2]/l);}
        normal.needsUpdate=true;g.userData.smoothNarrativeNormals=true;
      }
      const original=Array.isArray(n.material)?n.material[0]:n.material;
      if(human&&original instanceof MeshStandardMaterial&&(original.map||/nail/i.test(original.name))){
        let replacement=materialCache.get(original.uuid);
        if(!replacement){
          const surface=createHandMaterial(true,skin,{albedo:original.map??undefined,normal:original.normalMap??undefined,roughness:original.roughnessMap??undefined,roughnessFactor:original.roughness,ao:original.aoMap??undefined,specularIntensity:original instanceof MeshPhysicalMaterial?original.specularIntensityMap??undefined:undefined,specularFactor:original instanceof MeshPhysicalMaterial?original.specularIntensity:undefined,authoredUV:!!g.getAttribute('uv'),role:/nail/i.test(original.name)?'nail':'skin'});
          surface.uniforms.uIce=this.uniforms.uIce;surface.uniforms.uWristFade=this.uniforms.uWristFade;
          this.surfaces.push(surface);replacement=surface.material;materialCache.set(original.uuid,replacement);
        }
        n.material=replacement;
      }else n.material=this.material;
      n.frustumCulled=false;if(n instanceof SkinnedMesh)n.normalizeSkinWeights();
    });
    model.rotation.y=Math.PI/2;
  }

  update(dt:number,tip:Vector3,rotation:Euler,scale:number,pose:HandPose,amount:number,opacity:number,ice:number,wristFade:number,defiance=0,openness=1){
    this.root.visible=opacity>.001;
    if(!this.root.visible)return;
    const k=1-Math.exp(-Math.min(dt,.1)*18);
    if(this.forearm){
      const arm=this.forearm;
      arm.value+=((this.human?.20:-1.42*defiance)-arm.value)*k;
      arm.bone.quaternion.copy(arm.rest).multiply(new Quaternion().setFromAxisAngle(arm.axis,arm.value));
    }
    this.uniforms.uIce.value=ice;this.uniforms.uWristFade.value=wristFade;
    for(const surface of this.surfaces)surface.material.opacity=opacity;
    this.rig.update(dt,pose,amount,defiance,openness);
    this.targetRotation.setFromEuler(rotation);
    if(!this.initialized){this.root.quaternion.copy(this.targetRotation);this.smoothedTip.copy(tip);this.initialized=true;}
    this.root.quaternion.slerp(this.targetRotation,k);
    this.smoothedTip.lerp(tip,k);this.targetTip.copy(tip);
    const breadth=this.rig.anatomical?(this.human?1.10:1.23):1;
    this.root.scale.set((this.human?1:-1)*scale*breadth,scale,scale);
    this.root.position.set(0,0,0);this.root.updateMatrixWorld(true);
    const anchor=this.index.getWorldPosition(new Vector3()).lerp(this.middle.getWorldPosition(new Vector3()),this.human?0:defiance);
    this.root.position.copy(this.smoothedTip).sub(anchor);this.root.updateMatrixWorld(true);
  }
  state(){return{visible:this.root.visible,anatomical:this.rig.anatomical,glove:this.glove,opacity:this.material.opacity,root:this.root.position.toArray(),index:this.index.getWorldPosition(new Vector3()).toArray(),middle:this.middle.getWorldPosition(new Vector3()).toArray(),surfaces:this.surfaces.map(s=>({name:s.material.name,authoredAlbedo:!!s.material.map,roughnessFactor:s.material.roughness})),joints:this.joints.filter(j=>j.name.includes('proximal')).map(j=>({name:j.name,angle:j.value}))};}
}
