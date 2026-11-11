import {phase,smooth} from './construction.ts';
export {INTRO_DURATION} from './timeline.ts';
/** Absolute-time display state; no timers, accumulated transforms or source edits. */
export function geometryWorld(time:number,reduced=false){
 const transition=smooth(phase(time,1.40,2.25));
 const age=time-1.48;
 const impact=age>=0&&age<1.1?Math.exp(-age*7.5):0;
 const ring=phase(time,1.48,2.58);
 const flash=reduced?0:.42*Math.exp(-Math.pow((time-1.51)/.055,2));
 return {transition,wire:transition,flash,ringScale:.18+ring*2.3,ringOpacity:reduced?0:impact*.62,grid:smooth(phase(time,1.50,2.65)),zoom:reduced?1:1-.055*impact,shake:reduced?0:Math.sin(age*49)*impact*.005,phase:time<1.4?'material':time<2.65?'impact':'geometry'};
}
