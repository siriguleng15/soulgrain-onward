import type { DeformationParams, LandmarkConstraint, MeshValidation, PatternData } from './types.ts';
import type { FactoryPoint, ManufacturingSettings, PointAssessment } from './factory.ts';
import { assessFactoryPoint, manufacturingSettings } from './factory.ts';

export interface SnapshotInput {
  pattern: PatternData;
  points: FactoryPoint[];
  params?: DeformationParams;
  constraints?: LandmarkConstraint[];
  manufacturing?: Partial<ManufacturingSettings>;
  validation?: MeshValidation | Record<string,unknown>;
  provenance?: unknown;
  uncertainties?: string[];
  uncertaintyMm?: number|null;
  vertexIds?: ArrayLike<number>;
  indices?: ArrayLike<number>;
  flatMm?: ArrayLike<number>;
  formedMm?: ArrayLike<number>;
  meshConstruction?: unknown;
  registration?: unknown;
  strapDesign?: unknown;
}
export interface ProjectSnapshot {
  schemaVersion:1;
  project:'SoulGrain ONWARD real-pattern engineering';
  createdAt:string;
  units:'mm';
  status:'research-reference-not-production';
  pattern:PatternData;
  points:Array<FactoryPoint & {assessment:PointAssessment}>;
  deformation:DeformationParams|null;
  constraints:LandmarkConstraint[];
  manufacturing:ManufacturingSettings;
  validation:unknown;
  provenance:unknown;
  uncertainties:string[];
  uncertaintyMm:number|null;
  vertexIdentity:{vertexIds:number[];triangleIndices:number[];flatMm:number[];formedMm:number[];exactMeshIncluded:boolean;construction:unknown;anchorConvention:string};
  registration:unknown;
  strapDesign:unknown;
}

function clone<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T;}
export function createProjectSnapshot(input:SnapshotInput):ProjectSnapshot{
  return {schemaVersion:1,project:'SoulGrain ONWARD real-pattern engineering',createdAt:new Date().toISOString(),units:'mm',status:'research-reference-not-production',
    pattern:clone(input.pattern),points:input.points.map(point=>({...clone(point),assessment:assessFactoryPoint(input.pattern,point,input)})),
    deformation:input.params?clone(input.params):null,constraints:clone(input.constraints??[]),manufacturing:manufacturingSettings(input.manufacturing),
    validation:clone(input.validation??null),provenance:clone(input.provenance??null),
    uncertainties:[...new Set(['纸样影像标定与轮廓提取存在测量误差。','三维形变包含照片无法唯一确定的隐藏结构假设。','扣心表面投影不是PU公母扣安装孔。','缝份、PU裁切、扣合重叠与缝制参数未确认时不得生产使用。',...(input.uncertainties??[])])],
    uncertaintyMm:input.uncertaintyMm??null,
    vertexIdentity:{vertexIds:Array.from(input.vertexIds??[]),triangleIndices:Array.from(input.indices??[]),flatMm:Array.from(input.flatMm??[]),formedMm:Array.from(input.formedMm??[]),exactMeshIncluded:!!input.flatMm&&!!input.indices&&!!input.vertexIds,construction:clone(input.meshConstruction??null),anchorConvention:'triangle index into triangleIndices; three barycentric weights refer to that exact immutable triangle; flat millimetres remain the original paper pattern'},
    registration:clone(input.registration??null),strapDesign:clone(input.strapDesign??null)};
}

export function exportCoordinateJSON(snapshot:ProjectSnapshot){return JSON.stringify(snapshot,null,2)+'\n';}
const mm=(n:number|null|undefined)=>n===null||n===undefined||!Number.isFinite(n)?'待确认':n.toFixed(1);
function csv(value:unknown){let s=value===null||value===undefined?'':String(value);if(/^[=+@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export function exportCoordinateCSV(snapshot:ProjectSnapshot){
  const rows:unknown[][]=[['用途','研究定位参考，非生产定稿'],['单位','mm'],['测量不确定度_mm',snapshot.uncertaintyMm??'未确定'],
    ['点编号','点名称','点类型','所属层','裁片X_mm','裁片Y_mm','三维X_mm','三维Y_mm','三维Z_mm','三角形ID','重心w0','重心w1','重心w2','距裁断边_mm','状态','警告']];
  for(const p of snapshot.points){const a=p.anchor;rows.push([p.id,p.label,p.kind,p.layer??'unknown',a?mm(a.flatMm[0]):'',a?mm(a.flatMm[1]):'',a?mm(a.formedMm[0]):'',a?mm(a.formedMm[1]):'',a?mm(a.formedMm[2]):'',a?.triangle??'',...(a?.barycentric??['','','']),mm(p.assessment.boundaryDistanceMm),p.assessment.status,p.assessment.warnings.join('；')]);}
  rows.push(['缝份_mm',snapshot.manufacturing.seamAllowanceMm??'未确认'],['固定端缝接半径_mm',snapshot.manufacturing.fixedFootprintRadiusMm??'未确认'],['PU宽_mm',snapshot.manufacturing.puWidthMm??'未确认'],['扣合重叠_mm',snapshot.manufacturing.overlapMm??'未确认'],['扣头外观直径_mm',snapshot.manufacturing.snapDiameterMm??'未设定']);
  return '\uFEFF'+rows.map(row=>row.map(csv).join(',')).join('\r\n')+'\r\n';
}

export interface FactorySVGOptions {
  params?:DeformationParams;
  manufacturing?:Partial<ManufacturingSettings>;
  uncertaintyMm?:number|null;
  title?:string;
  provenance?:unknown;
}
const xml=(v:unknown)=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
const number=(v:number)=>Number(v.toFixed(6)).toString();
function path(points:readonly (readonly [number,number])[],closed=false){return points.length?points.map((p,i)=>`${i?'L':'M'}${number(p[0])},${number(p[1])}`).join(' ')+(closed?' Z':''):'';}

/** Physical SVG millimetres preserve the calibrated pattern. Coordinate table
 * is rounded for reading, while the separate JSON retains source precision. */
export function createFactorySVG(pattern:PatternData,points:FactoryPoint[],options:FactorySVGOptions={}){
  const margin=12,top=20,tableTop=top+pattern.bounds.height+15;
  const width=Math.max(pattern.bounds.width+margin*2,290),height=tableTop+Math.max(90,points.length*8+48);
  const settings=manufacturingSettings(options.manufacturing);
  const checks=points.map(p=>assessFactoryPoint(pattern,p,options));
  const rows=points.map((p,i)=>{
    const a=p.anchor,c=p.kind==='snap-projection'?'#ae660d':p.kind==='body-fixed'?'#165e9e':'#8551a5';
    return `<g fill="${c}"><text x="12" y="${tableTop+13+i*8}">${xml(p.id)}</text><text x="40" y="${tableTop+13+i*8}">${xml(p.label)}</text><text x="115" y="${tableTop+13+i*8}">${a?xml(mm(a.flatMm[0])):'未映射'}</text><text x="145" y="${tableTop+13+i*8}">${a?xml(mm(a.flatMm[1])):'未映射'}</text><text x="178" y="${tableTop+13+i*8}">${checks[i].status==='invalid'?'不可安装':checks[i].status==='unmapped'?'未绑定':'待实物验证'}${p.kind==='snap-projection'?' · 仅扣心投影':''}</text></g>`;
  }).join('');
  const marker=points.map((p,i)=>{
    if(!p.anchor)return '';
    const [x,y]=p.anchor.flatMm,c=p.kind==='snap-projection'?'#ae660d':p.kind==='body-fixed'?'#165e9e':'#8551a5';
    return `<g id="point-${xml(p.id)}" stroke="${c}" fill="none"><circle cx="${number(x)}" cy="${number(y)}" r="1.8" stroke-width=".35"/><path d="M${number(x-3)},${number(y)}h6 M${number(x)},${number(y-3)}v6" stroke-width=".2"/><g transform="translate(${number(x+3)} ${number(y+3)}) scale(1 -1)"><text fill="${c}" stroke="none" font-size="3.2">${xml(p.id)}</text></g><title>${xml(checks[i].warnings.join('；'))}</title></g>`;
  }).join('');
  const linework=pattern.structureLines.map(line=>`<path id="${xml(line.id)}" d="${path(line.points)}" fill="none" stroke="${line.kind==='seam'?'#637784':'#c17b23'}" stroke-width=".25" stroke-dasharray="${line.kind==='seam'?'2 1':'4 1.5'}"><title>${xml(line.interpretation??line.kind)}</title></path>`).join('');
  const holework=pattern.holes.map(h=>`<circle id="${xml(h.id)}" cx="${number(h.center[0])}" cy="${number(h.center[1])}" r="${number(h.radiusMm)}" fill="white" stroke="${h.role==='eyelet'?'#2f657d':'#98907e'}" stroke-width=".25"><title>${xml(h.id+' · '+h.role)}</title></circle>`).join('');
  const noteY=tableTop+18+points.length*8;
  const missing=[settings.seamAllowanceMm===null?'缝份':null,settings.fixedFootprintRadiusMm===null?'固定端缝接范围':null,settings.puWidthMm===null?'PU宽':null,settings.overlapMm===null?'扣合重叠':null].filter(Boolean).join('／');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${number(width)}mm" height="${number(height)}mm" viewBox="0 0 ${number(width)} ${number(height)}" role="img" aria-label="研究定位参考，非生产定稿">
<title>${xml(options.title??'SoulGrain ONWARD · 裁片反向定位参考')}</title>
<desc>原始裁片毫米轮廓保持不变。图样坐标显示至0.1mm不代表相同测量精度。扣心投影不是公母扣安装孔。所有形变假设和工艺参数须实物确认。</desc>
<metadata>${xml(JSON.stringify({units:'mm',productionReady:false,uncertaintyMm:options.uncertaintyMm??null,manufacturing:settings,deformation:options.params??null,provenance:options.provenance??null,pointWarnings:checks}))}</metadata>
<rect width="100%" height="100%" fill="white"/><g font-family="Arial, PingFang SC, sans-serif" fill="#1d3347" font-size="3.2"><text x="12" y="8" font-size="4.2">SOULGRAIN · ONWARD</text><text x="12" y="14" fill="#ab4f24">研究定位参考 · 非生产定稿</text>
<g transform="translate(${number(margin-pattern.bounds.min[0])} ${number(top+pattern.bounds.max[1])}) scale(1 -1)"><path id="original-cut-outline" d="${path(pattern.boundary,true)}" fill="#f6f9fb" stroke="#193e59" stroke-width=".35"/>${linework}${holework}${marker}</g>
<path d="M12 ${number(tableTop-7)}h100 m-100 -2v4 m100 -4v4" fill="none" stroke="#1d3347" stroke-width=".25"/><text x="12" y="${number(tableTop-9)}">100 mm 校验标尺 · 打印100%，不要适应纸张</text>
<text x="12" y="${number(tableTop+5)}">编号</text><text x="40" y="${number(tableTop+5)}">点位</text><text x="115" y="${number(tableTop+5)}">X / mm</text><text x="145" y="${number(tableTop+5)}">Y / mm</text><text x="178" y="${number(tableTop+5)}">工程状态</text>${rows}
<g font-size="3" fill="#7c563b"><text x="12" y="${number(noteY)}">测量不确定度：${options.uncertaintyMm===null||options.uncertaintyMm===undefined?'尚未确定':xml(mm(options.uncertaintyMm))+' mm（输入值，不含全部形变误差）'}；三维隐藏结构仍含假设。</text><text x="12" y="${number(noteY+6)}">未确认工艺参数：${xml(missing||'已输入，仅为研究参数，仍须打样验证')}。</text><text x="12" y="${number(noteY+12)}">扣头外观直径 ${xml(mm(settings.snapDiameterMm))} mm；不得作为PU宽度、搭接量或裁切余量。</text><text x="12" y="${number(noteY+18)}">详尽逐点风险、三角形身份与重心坐标见配套JSON；投影多义点不得直接转为钻孔。</text></g></g></svg>`;
}
