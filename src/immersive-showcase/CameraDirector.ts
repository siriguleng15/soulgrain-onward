import {PerspectiveCamera,Vector3} from 'three';
import type {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export interface CameraPose {position:Vector3;target:Vector3;framing:number;vertical?:number;}
const smooth=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
/** One camera owner, starting each command from the actual live orbit state. */
export class CameraDirector {
 private from?:CameraPose;private to?:CameraPose;private elapsed=0;private duration=1;private framing=0;private vertical=0;private width=1;private height=1;
 generation=0;moving=false;
 constructor(readonly camera:PerspectiveCamera,readonly controls:OrbitControls){}
 resize(w:number,h:number){this.width=w;this.height=h;this.camera.aspect=w/h;this.applyFraming(this.framing,this.vertical);}
 private applyFraming(value:number,vertical=0){this.framing=value;this.vertical=vertical;const wide=this.width/this.height>1.12;if(wide||vertical)this.camera.setViewOffset(this.width,this.height,wide?-value*this.width:0,vertical*this.height,this.width,this.height);else this.camera.clearViewOffset();this.camera.updateProjectionMatrix();}
 capture():CameraPose{return{position:this.camera.position.clone(),target:this.controls.target.clone(),framing:this.framing,vertical:this.vertical};}
 begin(pose:CameraPose,duration=1.65){this.generation++;this.from=this.capture();this.to={position:pose.position.clone(),target:pose.target.clone(),framing:pose.framing,vertical:pose.vertical??0};this.duration=Math.max(.001,duration);this.elapsed=0;this.moving=true;}
 cancel(){this.generation++;this.moving=false;this.from=undefined;this.to=undefined;}
 apply(pose:CameraPose){this.camera.position.copy(pose.position);this.controls.target.copy(pose.target);this.applyFraming(pose.framing,pose.vertical??0);const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;}
 seek(progress:number){if(!this.from||!this.to)return;progress=Math.max(0,Math.min(1,progress));this.elapsed=progress*this.duration;const t=smooth(progress);this.apply({position:this.from.position.clone().lerp(this.to.position,t),target:this.from.target.clone().lerp(this.to.target,t),framing:this.from.framing+(this.to.framing-this.from.framing)*t,vertical:(this.from.vertical??0)+((this.to.vertical??0)-(this.from.vertical??0))*t});if(progress>=1)this.moving=false;}
 update(dt:number){if(!this.moving)return;this.elapsed+=dt;this.seek(this.elapsed/this.duration);}
 getState(){return{generation:this.generation,moving:this.moving,progress:Math.min(1,this.elapsed/this.duration),position:this.camera.position.toArray(),target:this.controls.target.toArray(),framing:this.framing,vertical:this.vertical};}
}
