import {gsap} from 'gsap';
export type Phase='countdown'|'shattering'|'guide'|'drawing'|'melting'|'transition'|'done';
export class Narrative {
 phase:Phase='countdown';time=0;phaseTime=0;generation=0;
 readonly values={number:99,shatter:0,melt:0,dawn:0,flash:0,hand:0,orb:0};
 private timeline?:gsap.core.Timeline;
 constructor(private readonly changed:(phase:Phase)=>void){this.restart();}
 private set(phase:Phase){this.phase=phase;this.phaseTime=0;this.changed(phase);}
 restart(){this.timeline?.kill();this.generation++;Object.assign(this.values,{number:99,shatter:0,melt:0,dawn:0,flash:0,hand:0,orb:0});this.time=0;this.set('countdown');const generation=this.generation;
  this.timeline=gsap.timeline({paused:true,onComplete:()=>{if(generation===this.generation)this.guide();}}).to(this.values,{number:0,duration:4.2,ease:'power1.inOut'}).call(()=>this.set('shattering'),[],3.7).to(this.values,{shatter:1,duration:1.4,ease:'power2.in'},3.7);
 }
 guide(){this.timeline?.kill();this.set('guide');this.values.shatter=1;this.values.number=0;this.values.hand=0;this.timeline=undefined;}
 drawing(){if(this.phase!=='guide')return false;this.set('drawing');this.values.hand=0;return true;}
 invalid(){if(this.phase!=='drawing')return;this.set('guide');this.values.hand=0;}
 success(){if(this.phase!=='drawing')return;this.timeline?.kill();this.set('melting');this.values.hand=0;const generation=this.generation;
  this.timeline=gsap.timeline({paused:true,onComplete:()=>{if(generation===this.generation){this.set('done');this.timeline=undefined;}}}).to(this.values,{flash:.8,duration:.3,ease:'power2.out'}).to(this.values,{flash:0,duration:1.3},.3).to(this.values,{melt:1,duration:2.8,ease:'power2.inOut'},.12).call(()=>this.set('transition'),[],2.6).to(this.values,{dawn:1,orb:1,duration:1.9,ease:'power2.inOut'},2.6);
 }
 update(dt:number){this.time+=dt;this.phaseTime+=dt;const timeline=this.timeline;if(timeline)timeline.time(Math.min(timeline.duration(),timeline.time()+dt));if(this.phase==='guide'&&this.phaseTime>.25)this.values.hand=Math.min(1,this.values.hand+dt*1.6);}
 dispose(){this.timeline?.kill();}
}
