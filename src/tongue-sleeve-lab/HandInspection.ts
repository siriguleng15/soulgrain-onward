import {Bone,Group,Quaternion,Vector3,Box3} from 'three';
export const FINGERS=['thumb','index-finger','middle-finger','ring-finger','pinky-finger'] as const;
export type Finger=typeof FINGERS[number];
/** Rest-based FK for asset inspection. No dt smoothing, pose mesh swaps or
 * hierarchy changes. Grasp/palm/snap authoring still requires contact poses.
 */
export class HandInspection {
 readonly bones=new Map<string,Bone>();
 private readonly rest=new Map<Bone,Quaternion>();
 private readonly axes=new Map<Bone,Vector3>();
 readonly curls:Record<Finger,number>={'thumb':0,'index-finger':0,'middle-finger':0,'ring-finger':0,'pinky-finger':0};
 constructor(readonly root:Group){
  root.updateMatrixWorld(true);root.traverse(o=>{if(o instanceof Bone){this.bones.set(o.name,o);this.rest.set(o,o.quaternion.clone());}});
  for(const[name,bone]of this.bones)if(/_(1|2|3)$/.test(name))this.axes.set(bone,name.startsWith('thumb')?new Vector3(.65,.18,-.30).normalize():new Vector3(1,0,0));

 }
 setCurl(finger:Finger,value:number){
  if(!Number.isFinite(value))return;this.curls[finger]=Math.max(0,Math.min(1,value));
  const prefix=finger.split('-')[0];
  for(const[name,bone]of this.bones){if(!name.startsWith(prefix+'_'))continue;const axis=this.axes.get(bone);if(!axis)continue;
   const amount=name.endsWith('_2')?1.25:name.endsWith('_1')?1.05:.65;
   bone.quaternion.copy(this.rest.get(bone)!).multiply(new Quaternion().setFromAxisAngle(axis,this.curls[finger]*amount));
  }
  this.root.updateMatrixWorld(true);
 }
 reset(){for(const[bone,q]of this.rest)bone.quaternion.copy(q);for(const finger of FINGERS)this.curls[finger]=0;this.root.updateMatrixWorld(true);}
 palmBounds(){const box=new Box3();for(const[name,bone]of this.bones)if(name!=='wrist')box.expandByPoint(bone.getWorldPosition(new Vector3()));return box.expandByScalar(.35);}
}
