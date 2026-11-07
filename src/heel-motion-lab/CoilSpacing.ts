import type {Vector3} from 'three';

const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*t*(10+t*(-15+6*t));};

/** A small heelward trim of the V1.8 visible coils, in shoe-local units.
 * +X projects slightly downward in the approved final shoe pose. Both ends
 * have zero displacement and derivative, preserving the heel and toe joins.
 * This is NOT supplied to HeelReaction, so the approved shoe motion is frozen.
 */
export function coilSpacingOffset(s:number){
 return(.10+.065*ease((s-.50)/.16))*ease(s/.14)*(1-ease((s-.84)/.16));
}

export function refineCoilSpacing(points:Vector3[],start:number,segments:number,scale=1){
 const weight=Math.max(0,Math.min(1,scale));
 for(let i=0;i<=segments;i++)points[start+i].x+=weight*coilSpacingOffset(i/segments);
}
