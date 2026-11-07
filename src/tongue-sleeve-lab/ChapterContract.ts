export const STORY_DURATION=19;
export const SNAP_TIME=14.5;
export const SHOTS=[
 {id:'00',title:'素帆布初始展示',start:0,end:1.8},
 {id:'01',title:'带烫钻的马蹄袖登场',start:1.8,end:3.6},
 {id:'02',title:'捏取并抬平鞋舌',start:3.6,end:6},
 {id:'03',title:'手掌摊开贴合',start:6,end:7.8},
 {id:'04',title:'同一袖面连续翻转',start:7.8,end:10.8},
 {id:'05',title:'手抽离，袖面与烫钻留存',start:10.8,end:13},
 {id:'06',title:'白布与银钻停留',start:13,end:14},
 {id:'07',title:'响指准备与释放',start:14,end:14.5},
 {id:'08',title:'非烫钻区域转为水晶饰布',start:14.5,end:16.8},
 {id:'09',title:'手退场与恢复整鞋机位',start:16.8,end:19},
] as const;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const progress=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
/** Timeline contract only. Geometry and poses require the final design refs.
 * No dt filter/integration: reverse seeking reconstructs the same event state.
 */
export function chapterAt(seconds:number){
 if(!Number.isFinite(seconds))throw Error('章节时间必须为有限值');
 const t=Math.max(0,Math.min(STORY_DURATION,seconds));
 return{time:t,shot:SHOTS.find(s=>t<s.end)??SHOTS.at(-1)!,
  lift:progress(t,3.6,6),palm:progress(t,6,7.8),sleeveFlip:progress(t,7.8,10.8),withdrawal:progress(t,10.8,13),
  snapOccurred:t>=SNAP_TIME,crystalFront:t<SNAP_TIME?0:progress(t,SNAP_TIME,16.8),returnCamera:progress(t,16.8,19),
  terminalHeld:t===STORY_DURATION,silverBindingOwner:'single-sleeve-surface' as const,
 };
}

export interface FinalTongueDesign {
 referenceConfirmed:boolean;
 nominalSizeMm:{height:number;width:number};
 nominalMedallionDiameterMm:number;
 outlineSvg:string|null;
 rootEdge:string|null;
 seamPaths:string[];
 rhinestoneLayout:string|null;
 crystalZones:string[];
}
export const REFERENCE_DESIGN:FinalTongueDesign={referenceConfirmed:true,nominalSizeMm:{height:158,width:103},nominalMedallionDiameterMm:75,outlineSvg:'tongue-sleeve-lab/assets/final-tongue-outline.svg',rootEdge:'concave-top-edge; fitting pending',seamPaths:['horizontal-seam'],rhinestoneLayout:'modeling/finished-shoe-v8/rhinestone-points.json',crystalZones:['upper-cloth','lower-cloth-except-silver']};
export function requireFinalDesign(design:FinalTongueDesign){
 if(!design.referenceConfirmed||!design.outlineSvg||!design.rootEdge||!design.rhinestoneLayout||design.crystalZones.length===0){
  throw Error('缺少已确认的最终设计图、根部、烫钻排版或水晶区域，不能用旧鞋舌替代制作成品动画');
 }
 return design;
}
