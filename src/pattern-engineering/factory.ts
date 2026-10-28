import type { DeformationParams, PatternData, SurfaceAnchor, Vec2 } from './types.ts';

/** A snap centre projected onto cloth is a reference, never an automatic drill. */
export interface FactoryPoint {
  id: string;
  label: string;
  kind: 'body-fixed' | 'cuff-fixed' | 'snap-projection';
  anchor: SurfaceAnchor | null;
  photoPixel?: [number, number];
  layer?: 'body' | 'cuff' | 'unknown';
  ambiguity?: string[];
}

export interface ManufacturingSettings {
  seamAllowanceMm: number | null;
  fixedFootprintRadiusMm: number | null;
  puWidthMm: number | null;
  overlapMm: number | null;
  /** Preset head appearance diameter; unrelated to width or overlap. */
  snapDiameterMm: number | null;
}

export interface PointAssessment {
  id: string;
  status: 'unmapped' | 'invalid' | 'review';
  productionReady: false;
  boundaryDistanceMm: number | null;
  signedBoundaryDistanceMm: number | null;
  nearestSeamDistanceMm: number | null;
  assumedFoldDistanceMm: number | null;
  insideDeclaredHole: string | null;
  warnings: string[];
}

export interface AssessmentOptions {
  params?: DeformationParams;
  manufacturing?: Partial<ManufacturingSettings>;
  uncertaintyMm?: number | null;
}

export function manufacturingSettings(input: Partial<ManufacturingSettings> = {}): ManufacturingSettings {
  return {
    seamAllowanceMm: input.seamAllowanceMm ?? null,
    fixedFootprintRadiusMm: input.fixedFootprintRadiusMm ?? null,
    puWidthMm: input.puWidthMm ?? null,
    overlapMm: input.overlapMm ?? null,
    snapDiameterMm: input.snapDiameterMm === undefined ? 12 : input.snapDiameterMm,
  };
}

export function distanceToSegment(point: Vec2, a: Vec2, b: Vec2) {
  const dx=b[0]-a[0], dy=b[1]-a[1], square=dx*dx+dy*dy;
  const t=square ? Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/square)) : 0;
  return Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy);
}

export function distanceToPolyline(point: Vec2, line: readonly Vec2[], closed=false) {
  if (!line.length) return Infinity;
  if (line.length===1) return Math.hypot(point[0]-line[0][0],point[1]-line[0][1]);
  let result=Infinity;
  for(let i=1;i<line.length;i++) result=Math.min(result,distanceToSegment(point,line[i-1],line[i]));
  if(closed) result=Math.min(result,distanceToSegment(point,line[line.length-1],line[0]));
  return result;
}

export function insideOutline(point: Vec2, ring: readonly Vec2[]) {
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}

/** Installation checks are conditional on declared manufacturing dimensions.
 * A low geometric residual never certifies an assumed forming process. */
export function assessFactoryPoint(pattern: PatternData, point: FactoryPoint, options: AssessmentOptions={}): PointAssessment {
  const result: PointAssessment={id:point.id,status:'review',productionReady:false,boundaryDistanceMm:null,signedBoundaryDistanceMm:null,
    nearestSeamDistanceMm:null,assumedFoldDistanceMm:null,insideDeclaredHole:null,warnings:[]};
  const anchor=point.anchor;
  if(!anchor){result.status='unmapped';result.warnings.push('尚未绑定原裁片三角形；不输出安装坐标。');return result;}
  const p=anchor.flatMm;
  if(!p.every(Number.isFinite)||!anchor.formedMm.every(Number.isFinite)||!Number.isInteger(anchor.triangle)||anchor.triangle<0||
    anchor.barycentric.some(n=>!Number.isFinite(n)||n< -1e-8||n>1+1e-8)||Math.abs(anchor.barycentric.reduce((a,b)=>a+b,0)-1)>1e-7){
    result.status='invalid';result.warnings.push('无效的顶点身份／重心坐标绑定；需重新选择。');return result;
  }
  const distance=distanceToPolyline(p,pattern.boundary,true);
  const inside=insideOutline(p,pattern.boundary)||distance<1e-8;
  result.boundaryDistanceMm=distance;result.signedBoundaryDistanceMm=inside?distance:-distance;
  if(!inside){result.status='invalid';result.warnings.push('点位于原始裁断轮廓外，不可作为裁片固定点。');}
  const settings=manufacturingSettings(options.manufacturing);
  const unknown:string[]=[];
  for(const [key,name] of [['seamAllowanceMm','缝份宽度'],['fixedFootprintRadiusMm','固定端缝接范围'],['puWidthMm','PU皮条宽度'],['overlapMm','公母扣重叠量']] as const){
    const value=settings[key];
    if(value===null) unknown.push(name);
    else if(!Number.isFinite(value)||value<0){result.status='invalid';result.warnings.push(`${name}参数无效。`);}
  }
  if(settings.seamAllowanceMm!==null&&settings.seamAllowanceMm>=0&&distance<settings.seamAllowanceMm){
    result.warnings.push('点位进入已输入的缝份带；缝份边界和缝制方式需实物确认。');
  }
  if(settings.fixedFootprintRadiusMm!==null&&settings.fixedFootprintRadiusMm>=0&&distance<settings.fixedFootprintRadiusMm){
    result.warnings.push('已输入的固定端缝接范围可能跨出裁断边缘。');
  }
  for(const hole of pattern.holes){
    const d=Math.hypot(p[0]-hole.center[0],p[1]-hole.center[1]);
    const through=hole.role==='eyelet'||hole.throughHole;
    if(through&&d<hole.radiusMm){result.insideDeclaredHole=hole.id;result.status='invalid';result.warnings.push(`点落入已声明的孔位 ${hole.id}，没有可固定的面料。`);}
    else if(through&&settings.fixedFootprintRadiusMm!==null&&d<hole.radiusMm+settings.fixedFootprintRadiusMm){
      result.warnings.push(`固定端缝接范围可能与孔位 ${hole.id} 干涉。`);
    }
    else if(!through&&d<Math.max(hole.radiusMm,1.5)) result.warnings.push(`点靠近纸样标记 ${hole.id}；该标记用途尚不能自动解释为鞋面开孔。`);
  }
  const seams=pattern.structureLines.filter(line=>line.kind==='seam');
  if(seams.length) result.nearestSeamDistanceMm=Math.min(...seams.map(line=>distanceToPolyline(p,line.points)));
  if(result.nearestSeamDistanceMm!==null&&settings.fixedFootprintRadiusMm!==null&&result.nearestSeamDistanceMm<settings.fixedFootprintRadiusMm){
    result.warnings.push('固定端缝接范围跨越纸样已读出的缝线，请核对缝制顺序。');
  }
  if(options.params){
    const a=options.params.hingeAngleDeg*Math.PI/180;
    result.assumedFoldDistanceMm=Math.abs(-(p[0]-options.params.hingeXmm)*Math.sin(a)+(p[1]-options.params.hingeYmm)*Math.cos(a));
    if(result.assumedFoldDistanceMm<=options.params.bendWidthMm/2+(settings.fixedFootprintRadiusMm??0)){
      result.warnings.push('点靠近当前假设的翻折带；安装后折叠及扣合干涉待实物验证。');
    }
  }
  if(point.kind==='snap-projection') result.warnings.push('此点只是扣心向面料的表面投影，不是PU公母扣安装孔；两段PU上的扣心需另行标定。');
  if(!point.layer||point.layer==='unknown'||point.ambiguity?.length) result.warnings.push(...(point.ambiguity?.length?point.ambiguity:['照片投影可能对应多层面料，未确认所属裁片区域。']));
  if(unknown.length) result.warnings.push(`${unknown.join('、')}未确认，不可据此生成量产裁切尺寸。`);
  if(options.uncertaintyMm===null||options.uncertaintyMm===undefined) result.warnings.push('原图标定及轮廓测量总不确定度尚未确定。');
  else if(!Number.isFinite(options.uncertaintyMm)||options.uncertaintyMm<0){result.status='invalid';result.warnings.push('测量不确定度输入无效，不能据此解释坐标精度。');}
  else if(distance<options.uncertaintyMm){result.warnings.push('点到裁断边的距离小于输入的测量不确定度。');}
  result.warnings.push('三维折叠／隐藏结构包含未验证假设，所有点均须实物复核。');
  return result;
}

/** Cut lengths are intentionally unavailable until actual distances to the
 * mating centre and cut-edge setbacks are established. The two setbacks sum
 * to overlap; 12 mm head diameter does not supply any of these dimensions. */
export function calculatePUCutLengths(input: {
  bodySurfaceToSnapMm: number|null; cuffSurfaceToSnapMm: number|null;
  bodySnapSetbackMm: number|null; cuffSnapSetbackMm: number|null;
  bodyFixedFoldAllowanceMm: number|null; cuffFixedFoldAllowanceMm: number|null;
}) {
  const values=Object.values(input);
  if(values.some(v=>v===null||!Number.isFinite(v)||v<0)) return {bodyCutMm:null,cuffCutMm:null,overlapMm:null,status:'待实物测量曲面长度、扣心到切端距离和固定端折返余量'};
  return {bodyCutMm:input.bodySurfaceToSnapMm!+input.bodySnapSetbackMm!+input.bodyFixedFoldAllowanceMm!,
    cuffCutMm:input.cuffSurfaceToSnapMm!+input.cuffSnapSetbackMm!+input.cuffFixedFoldAllowanceMm!,
    overlapMm:input.bodySnapSetbackMm!+input.cuffSnapSetbackMm!,status:'按用户输入工艺参数计算，仍需打样验证'};
}
