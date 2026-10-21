import { gsap } from 'gsap';
import type { NodeId, NarrativeState, CuffMetadata } from '../types';
import { tree } from '../tree';

export const initialState=():NarrativeState=>({
  unfold:0,claspLift:0,roof:0,rods:0,copy:0,wrap:0,white:0,cover:0,lattice:0,leftStructure:0,notes:0,
  shoeX:.02,demoX:0,demoY:0,demoZ:0,yaw:-.22,
  cameraX:-.24,cameraY:.16,cameraZ:.46,targetX:0,targetY:.063,targetZ:0,framing:.12,focusLight:0,
});
export class Narrative {
  readonly state=initialState();
  node:NodeId='ROOT';target:NodeId='ROOT';busy=false;
  timeline?:gsap.core.Timeline;
  private token=0;private resolveCurrent?:(completed:boolean)=>void;
  reduced=false;
  constructor(readonly meta:CuffMetadata,readonly onChange:()=>void,readonly onComplete:()=>void){}
  private base(id:NodeId):Partial<NarrativeState>{
    const root=initialState();const center=this.meta.anchor[0]-this.meta.arc[this.meta.anchorIndex]+this.meta.length/2;
    const whole={...root,yaw:Math.round(this.state.yaw/(Math.PI*2))*Math.PI*2-.22};
    const focus={...root,yaw:Math.round(this.state.yaw/(Math.PI*2))*Math.PI*2,shoeX:0,cameraX:.025,cameraY:.130,cameraZ:.325,targetX:.080,targetY:.087,targetZ:.04,framing:.21,focusLight:1};
    const flat={...focus,unfold:1,shoeX:-.01,cameraX:center-.01,cameraY:.142,cameraZ:.40,targetX:center-.01,targetY:.093,targetZ:.052,framing:0};
    const bottom=this.meta.anchor[1]-this.meta.height/2+.015;
    const pair={...focus,shoeX:-.145,cameraX:-.09,cameraY:.22,cameraZ:.81,targetX:-.006,targetY:.055,targetZ:0,framing:0,
      copy:1,wrap:1,white:1,cover:.93,lattice:1,roof:1,rods:1,leftStructure:0,demoX:.18-center,demoY:-.0228-bottom*.75,demoZ:-this.meta.anchor[2]-.014};
    if(id==='ROOT')return whole;if(id==='A1')return focus;if(id==='A1.1')return flat;
    return {...pair,notes:id==='A1.1.1.1'?4:0,cameraZ:id==='A1.1.1.1'?.90:.81,cameraY:id==='A1.1.1.1'?.24:.22,framing:id==='A1.1.1.1'?-.06:0};
  }
  go(id:NodeId,replay=false):Promise<boolean>{
    if(this.busy&&id===this.target&&!replay)return Promise.resolve(false);
    if(id===this.node&&!this.busy&&!replay)return Promise.resolve(false);
    const from=this.node;this.cancel();const token=++this.token;
    this.target=id;this.busy=true;this.onChange();
    return new Promise(resolve=>{
      this.resolveCurrent=resolve;
      const speed=this.reduced ? .38 : 1;
      const tl=gsap.timeline({onUpdate:()=>this.onChange(),onComplete:()=>{
        if(token!==this.token)return;this.node=id;this.busy=false;this.timeline=undefined;this.resolveCurrent=undefined;this.onComplete();resolve(true);
      }});this.timeline=tl;
      const pose=this.base(id);
      const ordinary=()=>{tl.to(this.state,{...pose,duration:(id==='A1.1'?5.4:2.6)*speed,ease:'power3.inOut'},0);};
      if(id==='A1.1.1'&&from==='A1.1'&&!replay){
        const center=this.meta.anchor[0]-this.meta.arc[this.meta.anchorIndex]+this.meta.length/2;
        tl.to(this.state,{cameraX:center-.02,cameraY:.185,cameraZ:.48,targetY:.13,duration:2.8*speed,ease:'power2.inOut'},0);
        tl.to(this.state,{leftStructure:1,duration:.6*speed},.2*speed);
        tl.to(this.state,{roof:1,duration:1.7*speed,ease:'power2.inOut'},.5*speed);
        tl.to(this.state,{rods:1,duration:3.3*speed,ease:'power2.out'},2.1*speed);
        tl.to(this.state,{claspLift:1,duration:1.25*speed,ease:'power2.inOut'},5.1*speed);
        tl.set(this.state,{demoX:this.state.shoeX,demoY:.0006,demoZ:.0018,wrap:0,white:0,cover:0,lattice:0},6.3*speed);
        tl.to(this.state,{copy:1,duration:1.0*speed,ease:'sine.inOut'},6.4*speed);
        tl.to(this.state,{demoX:pose.demoX,demoY:pose.demoY,demoZ:pose.demoZ,wrap:1,duration:5.3*speed,ease:'power2.inOut'},7.0*speed);
        // These tracks deliberately overlap: yurt formation and shoe return.
        tl.to(this.state,{unfold:0,claspLift:0,shoeX:pose.shoeX,duration:5.3*speed,ease:'power2.inOut'},7.0*speed);
        tl.to(this.state,{leftStructure:0,duration:1.9*speed,ease:'sine.inOut'},7.0*speed);
        tl.to(this.state,{white:1,duration:3.5*speed,ease:'sine.inOut'},8.5*speed);
        tl.to(this.state,{lattice:1,duration:1.9*speed},9*speed);
        tl.to(this.state,{cover:.93,duration:2.4*speed,ease:'sine.inOut'},10.3*speed);
        tl.to(this.state,{cameraX:pose.cameraX,cameraY:pose.cameraY,cameraZ:pose.cameraZ,targetX:pose.targetX,targetY:pose.targetY,targetZ:pose.targetZ,framing:0,duration:6.5*speed,ease:'power2.inOut'},6.6*speed);
        tl.to(this.state,{focusLight:.68,duration:2.4*speed,ease:'sine.inOut'},13.4*speed);
        tl.to({}, {duration:1.4*speed},15.8*speed);
      }else if(id==='A1.1.1.1'&&from==='A1.1.1'){
        tl.to(this.state,{framing:-.06,cameraZ:pose.cameraZ,cameraY:pose.cameraY,duration:1.4*speed,ease:'power2.inOut'},0);
        tl.to(this.state,{notes:4,duration:5.8*speed,ease:'none'},.1*speed);
      }else ordinary();
    });
  }
  async replay(){const id=this.node;const parent=tree[id].parent;if(parent){const completed=await this.go(parent);if(completed&&!this.busy&&this.node===parent)await this.go(id);}else{this.onComplete();}}
  cancel(){this.token++;this.timeline?.kill();this.timeline=undefined;this.resolveCurrent?.(false);this.resolveCurrent=undefined;this.busy=false;}
  pause(){this.timeline?.pause();}resume(){this.timeline?.resume();}
  canonical(id:NodeId){this.cancel();Object.assign(this.state,this.base(id));this.node=this.target=id;this.onComplete();}
  dispose(){this.cancel();}
}
