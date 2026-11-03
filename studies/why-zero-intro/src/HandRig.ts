import {Bone,Quaternion,Vector3} from 'three';

export type HandPose='open'|'reach'|'humanReach'|'clench'|'defiant';
export type HandJoint={bone:Bone;rest:Quaternion;restPosition:Vector3;axis:Vector3;spreadAxis:Vector3;rollAxis:Vector3;value:number;spread:number;roll:number;name:string};
const fingers=['thumb','index-finger','middle-finger','ring-finger','pinky-finger'];
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.min(1,Math.max(0,t));

/** Authored joint rotations in radians, not unrelated replacement pose meshes. */
export const HAND_POSES:Record<HandPose,number[][]>={
  open:[[.42,.38,.18],[.045,.09,.04],[.08,.17,.08],[.16,.30,.12],[.24,.42,.18]],
  reach:[[.35,.45,.20],[.10,.22,.10],[.29,.53,.24],[.39,.70,.30],[.52,.84,.35]],
  humanReach:[[.32,.30,.16],[.07,.19,.09],[.25,.95,.38],[.32,1.18,.52],[.43,1.25,.56]],
  clench:[[.95,.75,.42],[1.12,1.54,.72],[1.16,1.55,.72],[1.18,1.55,.74],[1.22,1.50,.72]],
  defiant:[[1.08,.68,.40],[1.18,1.48,.68],[.025,.045,.02],[1.20,1.52,.71],[1.25,1.48,.70]],
};
const relaxed=[[.62,.65,.3],[.08,.12,.06],[.24,.36,.16],[.65,.95,.42],[.84,1.18,.48]];
const humanHeld=[[.25,.30,.14],[.11,.22,.10],[.16,.29,.12],[.22,.40,.18],[.30,.50,.22]];

/**
 * Rest-derived anatomical axes. In particular the thumb bends around its own
 * oblique hinge, rather than the global Z hinge shared by the four fingers.
 * Must be built before the display model's Y rotation is applied.
 */
export class HandRig {
  readonly joints:HandJoint[]=[];
  private readonly qFlex=new Quaternion();
  private readonly qSpread=new Quaternion();
  private readonly qRoll=new Quaternion();

  constructor(bones:Map<string,Bone>,readonly human=false,readonly anatomical=false){
    const wrist=bones.get('wrist');
    if(!wrist)throw Error('Hand rig requires a wrist');
    for(const finger of fingers){
      let parent=wrist;
      const parts=finger==='thumb'?['metacarpal','phalanx-proximal','phalanx-distal','tip']:['metacarpal','phalanx-proximal','phalanx-intermediate','phalanx-distal','tip'];
      for(const part of parts){const b=bones.get(finger+'-'+part);if(b){parent.attach(b);parent=b;}}
    }
    wrist.updateWorldMatrix(true,true);
    // Recover the palm plane from actual anatomical joint centers. This works
    // for both the older WebXR cage and the new anatomically proportioned hand.
    const at=(name:string)=>bones.get(name)?.getWorldPosition(new Vector3());
    const palmRoot=wrist.getWorldPosition(new Vector3());
    const middle=at('middle-finger-phalanx-proximal');
    const index=at('index-finger-phalanx-proximal');
    const pinky=at('pinky-finger-phalanx-proximal');
    const longitudinal=middle?.clone().sub(palmRoot).normalize()??new Vector3(0,-1,0);
    const across=index&&pinky?pinky.clone().sub(index).normalize():new Vector3(0,0,1);
    const palmNormal=new Vector3().crossVectors(across,longitudinal).normalize();
    if(palmNormal.lengthSq()<.5)palmNormal.set(1,0,0);
    if(palmNormal.x<0)palmNormal.negate();
    const oppositionAxis=longitudinal.clone().negate();
    for(const [name,bone]of bones){
      if(!name.includes('phalanx')&&!name.includes('metacarpal'))continue;
      const inv=bone.getWorldQuaternion(new Quaternion()).invert();
      const child=bone.children.find(n=>n instanceof Bone) as Bone|undefined;
      const tangent=child?child.getWorldPosition(new Vector3()).sub(bone.getWorldPosition(new Vector3())).normalize():longitudinal.clone();
      // Negative flexion bends every phalanx into the same palm, while each
      // oblique thumb/finger hinge remains perpendicular to its own centerline.
      const hinge=new Vector3().crossVectors(tangent,palmNormal).normalize();
      if(hinge.lengthSq()<.5)hinge.set(0,0,1);
      this.joints.push({bone,rest:bone.quaternion.clone(),restPosition:bone.position.clone(),axis:hinge.applyQuaternion(inv),spreadAxis:palmNormal.clone().applyQuaternion(inv),rollAxis:oppositionAxis.clone().applyQuaternion(inv),value:0,spread:0,roll:0,name});
    }
  }

  update(dt:number,pose:HandPose,press:number,defiance:number,openness:number){
    const k=1-Math.exp(-Math.min(dt,.1)*18);
    for(const j of this.joints){
      const finger=fingers.findIndex(n=>j.name.startsWith(n)),meta=j.name.includes('metacarpal');
      const part=j.name.includes('proximal')?0:j.name.includes('intermediate')?1:finger===0?1:2;
      let flex=0,spread=0,roll=0;
      if(meta){
        if(finger===0){
          spread=this.human?-.23:pose==='open'?lerp(-.68,-.48,openness):-.26;
          spread-=press*.20+(this.human?-.10:.38)*defiance;
          // Opposition turns the thumb pad toward the palm during a grasp.
          roll=(this.human?-.65:.08)+press*.20+defiance*(this.human?.10:.12);
        }else{
          const spreads=this.human?[0,0,-.015,.035,.065]:[0,-.045,-.012,.030,.065];
          spread=spreads[finger]*(pose==='open'?lerp(.35,1,openness):1)*(1-press*.7);
          if(this.human)spread+=defiance*(finger-1)*.018;
        }
      }else{
        let angle=HAND_POSES[pose][finger][part];
        if(pose==='open')angle=lerp(relaxed[finger][part],angle,openness);
        if(pose==='defiant')angle=lerp(HAND_POSES.reach[finger][part],angle,defiance);
        if(this.human&&pose==='humanReach')angle=lerp(angle,humanHeld[finger][part],defiance);
        flex=-lerp(angle,HAND_POSES.clench[finger][part],press);
      }
      j.value+=(flex-j.value)*k;j.spread+=(spread-j.spread)*k;j.roll+=(roll-j.roll)*k;
      this.qFlex.setFromAxisAngle(j.axis,j.value);this.qSpread.setFromAxisAngle(j.spreadAxis,j.spread);this.qRoll.setFromAxisAngle(j.rollAxis,j.roll);
      j.bone.position.copy(j.restPosition);
      if(!this.anatomical&&!this.human&&(meta||j.name.includes('proximal')))j.bone.position.z*=.80;
      j.bone.quaternion.copy(j.rest).multiply(this.qSpread).multiply(this.qRoll).multiply(this.qFlex);
    }
  }
}
