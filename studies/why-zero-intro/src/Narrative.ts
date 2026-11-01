import {gsap} from 'gsap';

export type Phase = 'countdown' | 'shattering' | 'guide' | 'drawing' | 'melting' | 'transition' | 'done';

/** Visible-time clock. Every entry kills the old one-shot timeline. */
export class Narrative {
  phase: Phase = 'countdown';
  time = 0;
  phaseTime = 0;
  generation = 0;
  readonly values = {number:99, freeze:0, shatter:0, melt:0, dawn:0, flash:0, hand:0, orb:0};
  private timeline?: gsap.core.Timeline;

  constructor(private readonly changed: (phase:Phase)=>void) { this.restart(); }
  private set(phase:Phase) { this.phase=phase; this.phaseTime=0; this.changed(phase); }

  restart() {
    this.timeline?.kill();
    const generation=++this.generation;
    Object.assign(this.values,{number:99,freeze:0,shatter:0,melt:0,dawn:0,flash:0,hand:0,orb:0});
    this.time=0;
    this.set('countdown');
    this.timeline=gsap.timeline({paused:true,onComplete:()=>{if(generation===this.generation)this.guide();}})
      .to(this.values,{number:0,duration:5.7,ease:'power1.in'},0)
      .to(this.values,{freeze:1,duration:3.7,ease:'power1.inOut'},2.2)
      .call(()=>this.set('shattering'),[],5.55)
      .to(this.values,{shatter:1,duration:1.05,ease:'power1.inOut'},5.55);
  }

  guide() {
    this.timeline?.kill();
    this.timeline=undefined;
    Object.assign(this.values,{number:0,freeze:1,shatter:1,hand:0});
    this.set('guide');
  }
  drawing() {
    if(this.phase!=='guide')return false;
    this.set('drawing');
    // The recording keeps the guiding hand visible while the user draws.
    this.values.hand=1;
    return true;
  }
  invalid() { if(this.phase==='drawing'){this.set('guide');this.values.hand=1;} }

  success() {
    if(this.phase!=='drawing')return;
    this.timeline?.kill();
    this.set('melting');
    const generation=this.generation;
    this.timeline=gsap.timeline({paused:true,onComplete:()=>{
      if(generation!==this.generation)return;
      this.set('done');this.timeline=undefined;
    }})
      .to(this.values,{hand:0,duration:.45,ease:'power1.in'},0)
      .to(this.values,{melt:1,duration:1.7,ease:'power2.inOut'},.05)
      .to(this.values,{flash:1,duration:.5,ease:'power2.in'},.48)
      .to(this.values,{flash:0,duration:1.0,ease:'power1.out'},1.25)
      .call(()=>this.set('transition'),[],1.4)
      .to(this.values,{dawn:1,duration:1.8,ease:'power1.inOut'},1.25)
      .to(this.values,{orb:1,duration:.45,ease:'power2.out'},1.5)
      .to(this.values,{orb:0,duration:.65,ease:'power1.inOut'},2.6)
      .to({}, {duration:.3},3.2);
  }

  update(dt:number) {
    this.time+=dt;this.phaseTime+=dt;
    const timeline=this.timeline;
    if(timeline)timeline.time(Math.min(timeline.duration(),timeline.time()+dt));
    if(this.phase==='guide')this.values.hand=Math.min(1,this.values.hand+dt*1.25);
  }
  dispose() {this.timeline?.kill();}
}
