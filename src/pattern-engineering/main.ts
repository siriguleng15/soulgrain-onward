import './style.css';
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, LineDashedMaterial, Group, Vector3 } from 'three';
import type { PatternData, PatternMesh, SurfaceAnchor, LandmarkConstraint, DeformationParams } from './types.ts';
import { buildPatternMesh } from './mesh.ts';
import { deformMesh, getMeshValidation, getConstraintResiduals, createReferenceEvaluator } from './deformation.ts';
import { mapFlatToSurface, mapAnchor } from './mapping.ts';
import { SvgView } from './SvgView.ts';
import { ThreeView } from './ThreeView.ts';
import { DEFAULT_PHOTO_REGISTRATION, PHOTO_DEFORMATION_HYPOTHESIS, PHOTO_LANDMARKS, worldToPhoto, photoToWorld, photoProjectionFrame, projectPhotoToSurface, eyeletResiduals } from './photo-fit.ts';
import type { ClaspDesign, ClaspProcessStep } from './clasp-geometry.ts';
import { CLASP_PROCESS_STEPS, claspProcessOverlaySvg } from './clasp-geometry.ts';
import type { FactoryPoint, ManufacturingSettings } from './factory.ts';
import { assessFactoryPoint } from './factory.ts';
import { createFactorySVG, createProjectSnapshot, exportCoordinateJSON, exportCoordinateCSV } from './exports.ts';
import { restoreProject } from './project-state.ts';

const ROOT = import.meta.env.BASE_URL + 'pattern-engineering/';
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const num = (n: number | null, digits = 1) => n !== null && Number.isFinite(n) ? n.toFixed(digits) : '—';
const esc = (s: unknown) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const fpath = (p: readonly (readonly number[])[], closed = false) => p.map((v,i) => `${i?'L':'M'}${v[0].toFixed(3)} ${v[1].toFixed(3)}`).join(' ') + (closed?' Z':'');
const PHASES = [
  ['标定与轮廓', '真实纸样，先建立尺度', '原始照片按 10 mm 网格纠正透视。左侧可叠加校正照片、数字化轮廓与独立手绘图；不把手绘标注强制作为纸样尺寸。'],
  ['对应网格', '每个顶点都有不可变的二维身份', '三角网格来自真实不规则轮廓与孔边界。薄片的二维／三维共享顶点索引；轻点任意一侧面料，另一侧同步定位。孔洞没有面料，不会吸附到附近顶点。'],
  ['展开与翻折', '同一张网格，连续形变', '调整进度或播放展开。平面位置始终从原始毫米坐标重新计算，不迭代变形。当前翻折轴、弯曲宽度和后跟包覆均为可编辑假设，不是已验证的工厂工序。'],
  ['成鞋校准', '照片只能约束可见投影', '默认形态按假设的鞋眼对应关系拟合。可查看照片透明叠加，或先点左侧裁片、再点右侧照片新增校准点；仅凭单张照片不能唯一恢复深度、缝合和隐藏区域。'],
  ['扣件推导', '严格保留你的定位过程', '从鞋身与翻筒的原有线条建立框架，再分别放置正反方向黄金矩形四分圆构图。以你确认的蓝色扣心为准，即第五段圆弧对应完整圆的圆心。'],
  ['反向定位', '把安装参考点带回原裁片', '先按当前成鞋假设投影并锁定扣位，再展开查看同一三角形上的位置。无命中的点保持未映射；扣心的布面投影不能自动当作 PU 公母扣安装孔。'],
];

async function load<T>(path: string): Promise<T> {
  const r = await fetch(ROOT + path); if (!r.ok) throw new Error(`${path} 载入失败 (${r.status})`); return r.json();
}
function save(name: string, data: string | Blob, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
let toastTimer = 0;
function toast(message: string) { $('toast').textContent = message; $('toast').classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = window.setTimeout(() => $('toast').classList.add('hidden'), 6500); }
const slider = (id:string,label:string,min:number,max:number,step:number,value:number) => `<label class="control-row" for="${id}">${label}<output id="${id}-out">${value}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
const check = (id:string,label:string,checked=false) => `<label><input id="${id}" type="checkbox" ${checked?'checked':''}>${label}</label>`;

async function start() {
  const [pattern, design, digitValidation, manifest] = await Promise.all([
    load<PatternData>('data/pattern-mm.json'), load<ClaspDesign>('data/clasp-design.json'), load<Record<string,unknown>>('data/digitization-validation.json'), load<unknown>('references/manifest.json'),
  ]);
  let phase = 0, progress = 0, params:DeformationParams = { ...PHOTO_DEFORMATION_HYPOTHESIS };
  let registration = { ...DEFAULT_PHOTO_REGISTRATION }, constraints:LandmarkConstraint[] = [];
  let selection:SurfaceAnchor | undefined, processStep:ClaspProcessStep = 1, editPhoto = false, anchorsStale = false;
  let manufacturing:ManufacturingSettings = { seamAllowanceMm:null, fixedFootprintRadiusMm:null, puWidthMm:null, overlapMm:null, snapDiameterMm:12 };
  let points:FactoryPoint[] = [];
  for (const c of design.observed.clasps) {
    points.push({id:c.id+'-B',label:c.id+' 鞋身固定端',kind:'body-fixed',layer:'body',anchor:null,photoPixel:c.bodyFixedEndPhoto});
    points.push({id:c.id+'-C',label:c.id+' 翻筒固定端',kind:'cuff-fixed',layer:'cuff',anchor:null,photoPixel:c.cuffFixedEndPhoto});
    for (const layer of ['body','cuff'] as const) points.push({id:c.id+'-S-'+layer,label:c.id+' 扣心·'+(layer==='body'?'鞋身':'翻筒')+'投影',kind:'snap-projection',layer,anchor:null,photoPixel:c.centerPhoto});
  }
  const calibration = pattern.calibration as Record<string,any>;
  $('app').innerHTML = `<header><div><div class="brand">SOULGRAIN / ONWARD</div><h1>真实裁片 · 可逆形变与扣件定位</h1></div><div class="status-tag">工程研究 V1 · 待实物验证</div></header>
  <nav class="phase-nav" aria-label="工程研究阶段">${PHASES.map((p,i)=>`<button data-phase="${i}" class="${i===0?'active':''}"><span class="num">0${i+1}</span>${p[0]}</button>`).join('')}</nav>
  <section class="intro"><div><h2 id="phase-title"></h2><p id="phase-description"></p></div><div class="phase-label" id="phase-label"></div></section>
  <main><div class="workspace">
    <section class="pane"><div class="pane-head"><span>01 / 原始裁片 · mm</span><span class="meta" id="flat-meta">X → / Y ↑</span></div><div class="canvas-wrap"><div id="flat-host"></div></div><div class="tool-row"><button id="reset-flat">复位视图</button><button id="flat-svg">当前视图 SVG</button><button id="flat-png">高清 PNG</button></div><p class="pane-caption">原点：裁断轮廓外接框左下角。单指平移、双指缩放；轻点面料建立同步位置。</p></section>
    <section class="pane"><div class="pane-head"><span id="right-title">02 / 原始纸样</span><span class="meta" id="right-meta">SOURCE</span></div><div class="canvas-wrap"><div id="three-host" class="hidden"></div><div id="source-host" class="source-wrap"><img id="source-image" src="${ROOT}data/calibration-source-overlay.jpg" alt="原始纸样上的网格标定和轮廓叠加"></div><div id="photo-host" class="hidden"></div></div><div class="tool-row" id="right-tools"><button id="camera-side">照片侧视</button><button id="camera-3d">三维观察</button><button id="toggle-photo-edit">照片上加校准点</button><button id="photo-png">导出推导 PNG</button></div><p class="pane-caption" id="right-caption"></p></section>
    <aside class="controls">
      <div class="control-group"><h3>图层与对照</h3><div class="checks">${check('grid','10 mm 网格',true)}${check('lines','纸样结构参考线',true)}${check('wireframe','共享三角网格')}${check('trace','C 图独立描线对照')}${check('guides','几何辅助线',true)}${check('clasps','扣头与皮条',true)}</div>${slider('image-opacity','校正照片叠加',0,1,.05,.35)}<p class="note">C 图按自身 267 × 262 mm 标注显示，不能据此改动纸样。</p></div>
      <div class="control-group" data-phases="2,3,5"><h3>展开／翻折 <span class="eyebrow">HYPOTHESIS</span></h3>${slider('progress','成形进度',0,1,.01,0)}<div class="export-row"><button class="primary" id="fold">成形</button><button id="unfold">完整展开</button></div>${slider('hingeYmm','假设翻折轴 Y / mm',90,200,.1,params.hingeYmm)}${slider('hingeAngleDeg','翻折轴方向 / °',-30,25,.1,params.hingeAngleDeg)}${slider('foldAngleDeg','翻折角 / °',-190,0,.1,params.foldAngleDeg)}${slider('bendWidthMm','弯曲带宽 / mm',4,35,.1,params.bendWidthMm)}${slider('heelWrapDeg','后跟包覆 / °',0,90,1,params.heelWrapDeg)}<p class="note">深度、缝合、隐藏区域尚未唯一确定。改变参数后请重新投影扣位。</p></div>
      <div class="control-group" data-phases="3"><h3>成鞋照片对照</h3>${slider('photo-opacity','照片透明度',0,1,.05,.6)}${slider('mesh-opacity','蓝色薄片透明度',.1,1,.05,.55)}<div class="small-fields">${[['originXPx','照片原点 X'],['originYPx','照片原点 Y'],['pixelsPerMmX','水平 px/mm'],['pixelsPerMmY','垂直 px/mm']].map(([id,label])=>`<label>${label}<input type="number" id="reg-${id}" value="${registration[id as keyof typeof registration]}" step=".01"></label>`).join('')}</div><p class="note" id="photo-fit-note"></p><div class="warning">px/mm 仅用于照片配准，不是实物比例尺。鞋底连接边与完整侧轮廓尚未校准。</div>${slider('landmarkStrength','人工约束强度',0,1,.05,0)}<div id="constraint-list"></div><button id="clear-constraints">清除人工约束</button></div>
      <div class="control-group" data-phases="4"><h3>你的推导顺序</h3><div class="clasp-step">${CLASP_PROCESS_STEPS.map(s=>`<button data-step="${s.step}">${s.step===9?'结果':'0'+s.step}</button>`).join('')}</div><p class="step-annotation" id="step-explanation"></p><div class="checks" style="margin-top:12px">${check('spirals','黄金矩形／四分圆',true)}${check('original-process','显示对应原始过程图')}${check('candidate','平行／中点校正候选（未定稿）')}</div><div class="warning">12 mm 仅为预设扣头外观直径。图中皮条宽度、搭接量与实际裁切长度均未确认。</div><button id="story-svg">导出当前推导 SVG</button></div>
      <div class="control-group" data-phases="5"><h3>锁定原裁片身份</h3><button id="project-points" class="primary">投影并锁定扣位</button><p class="note" id="projection-note">未投影。先确认成鞋假设，再锁定每个点的三角形身份。</p><div class="small-fields" style="margin-top:12px">${[['puWidthMm','PU宽 / mm'],['overlapMm','扣合重叠 / mm'],['seamAllowanceMm','缝份 / mm'],['fixedFootprintRadiusMm','固定端缝接半径 / mm']].map(([id,label])=>`<label>${label}<input type="number" id="mfg-${id}" placeholder="待确认" min="0" step=".1"></label>`).join('')}</div><p class="note">未知参数保持空白，不推算量产裁切尺寸。金色虚线仅为两段皮条轴线，圆为 12 mm 外观大小参考；不是公母件安装结构。</p></div>
    </aside></div>
  <section class="metrics"><div class="metric"><span>网格校准后的外接尺寸 / mm</span><strong>${num(pattern.bounds.width)} × ${num(pattern.bounds.height)}</strong><span>保留真实不规则轮廓；不强制缩放为 267 × 262。</span></div><div class="metric"><span>留出网格交点 RMS / mm</span><strong>${num(calibration.heldOutRmsMm,3)}</strong><span>仅网格模型残差，不代表裁片或生产精度。</span></div><div class="metric"><span>固定拓扑</span><strong id="mesh-metric">构建中</strong><span id="mesh-sub">同一二维顶点身份 → 三维位置</span></div><div class="metric"><span>完全展开回原坐标 / mm</span><strong id="return-metric">—</strong><span id="strain-metric">形变应变检查中</span></div></section>
  <section class="bottom"><article class="card"><h2>双向定位与工厂参考</h2><div class="point-table-wrap"><table><thead><tr><th>点位</th><th>X / mm</th><th>Y / mm</th><th>三角形</th><th>状态</th></tr></thead><tbody id="point-table"></tbody></table></div><p class="note" id="selected-point">轻点任一视图中的面料，查看对应位置。孔中心不是可绑定的表面点。</p><div class="export-row"><button id="export-svg" class="primary">定位图 SVG</button><button id="export-json">完整工程 JSON</button><button id="export-csv">毫米坐标 CSV</button><label class="file-label">恢复工程<input id="import-project" type="file" accept="application/json,.json"></label></div><p class="note">导出包含当前参数、源图标定、三角身份和风险。坐标小数位不代表测量精度。</p></article>
  <article class="card"><h2>验证与未解决项</h2><pre id="validation-text"></pre><ul class="validation-list"><li>单张照片不能唯一确定实际缝合、深度和遮挡关系。</li><li>横向参考线并非已验证翻折线；当前折弯轴为拟合假设。</li><li>没有完整缝份、PU 宽、重叠量与安装孔数据，禁止直接量产。</li><li>未执行布料碰撞／自交和真实缝合模拟。</li></ul><details><summary>查看原始资料与独立校验文件</summary><p><a href="${ROOT}data/pattern.svg" target="_blank">毫米裁片 SVG</a> · <a href="${ROOT}data/pattern-mm.json" target="_blank">原始几何 JSON</a> · <a href="${ROOT}data/digitization-validation.json" target="_blank">数字化校验</a> · <a href="${ROOT}data/mesh-validation.json" target="_blank">网格校验</a> · <a href="${ROOT}data/clasp-design.json" target="_blank">扣件源坐标</a> · <a href="${ROOT}references/manifest.json" target="_blank">12 张原图与校验值</a> · <a href="${ROOT}exports/ONWARD-reference.svg" target="_blank">默认假设定位图</a> · <a href="${ROOT}exports/ONWARD-project.json" download>默认工程文件</a> · <a href="${ROOT}exports/ONWARD-engineering-source.zip" download>源码与成果包</a></p></details><div id="point-warnings" class="warning hidden"></div></article></section></main><footer>SOULGRAIN ONWARD · 基于真实裁片的二维／三维几何研究。原始鞋模、官网与设计工作台保持不变。<br>视图中的蓝色薄片是可调形变假设；本页不声明一比一制造工艺还原，也不输出未经验证的量产尺寸。</footer><div class="toast hidden" id="toast" role="status" aria-live="polite"></div>`;

  const mesh:PatternMesh = buildPatternMesh(pattern, {maxEdgeMm:4});
  let positions = deformMesh(mesh, progress, params, constraints);
  const flatView = new SvgView($('flat-host'), pattern, {baseUrl:ROOT+'data/',onPick:p=>{
    const a = mapFlatToSurface(mesh,positions,p); if (!a) { toast('该位置没有网格面料，可能在孔内或裁片外。'); return; } select(a);
  }});
  flatView.setMesh(mesh); flatView.setImageOpacity(.35);
  const view = new ThreeView($('three-host'), {onPick:select,onError:e=>toast(e.message),onProgress:t=>{
    progress = t; ($('progress') as HTMLInputElement).value=String(t); $('progress-out').textContent=num(t*100,0)+'%'; updateSelection();
  }});
  view.setMesh({flatMm:mesh.flatMm,indices:mesh.indices,positionsMm:positions});
  const featureGroup = new Group(), installationGroup = new Group(); view.scene.add(featureGroup, installationGroup);
  const sourceBefore = Array.from(mesh.flatMm);
  const indicesBefore = Array.from(mesh.indices);
  view.setDeformer(t=>{positions=deformMesh(mesh,t,params,constraints);return positions;});
  $('mesh-metric').textContent = `${mesh.flatMm.length/2} / ${mesh.indices.length/3}`;
  $('mesh-sub').textContent = '顶点 / 三角形；保留固定索引与源坐标';
  let photoSequence = 0;

  function select(anchor:SurfaceAnchor) { selection = mapAnchor(mesh,positions,anchor); updateSelection(); }
  function updateSelection() {
    if (selection) {
      selection = mapAnchor(mesh,positions,selection); flatView.setSelection(selection); view.setSelection(selection);
      $('selected-point').textContent = `三角形 ${selection.triangle} · 重心 (${selection.barycentric.map(x=>num(x,4)).join(', ')})\n裁片 (${selection.flatMm.map(x=>num(x,2)).join(', ')}) mm → 当前三维 (${selection.formedMm.map(x=>num(x,2)).join(', ')}) mm`;
    }
    updateFeatures(); updateInstallationReferences();
  }
  function updateInstallationReferences() {
    for(const object of [...installationGroup.children]){installationGroup.remove(object);const line=object as Line;line.geometry.dispose();(line.material as LineBasicMaterial).dispose();}
    if(phase!==5||!($('clasps') as HTMLInputElement).checked)return;
    const at=(id:string)=>{const p=points.find(p=>p.id===id);return p?.anchor?mapAnchor(mesh,positions,p.anchor):null;};
    for(const c of design.observed.clasps){
      for(const [suffix,snap] of [['B','S-body'],['C','S-cuff']]){const a=at(c.id+'-'+suffix),b=at(c.id+'-'+snap);if(!a||!b)continue;const geometry=new BufferGeometry().setAttribute('position',new Float32BufferAttribute([...a.formedMm,...b.formedMm],3));const line=new Line(geometry,new LineDashedMaterial({color:0xe7b45c,dashSize:2,gapSize:1,depthTest:false}));line.computeLineDistances();line.renderOrder=8;installationGroup.add(line);}
      const a=at(c.id+'-S-cuff');if(!a)continue;const ids=[0,1,2].map(k=>mesh.indices[a.triangle*3+k]);const p=ids.map(id=>new Vector3(positions[id*3],positions[id*3+1],positions[id*3+2]));const u=p[1].clone().sub(p[0]).normalize(),normal=u.clone().cross(p[2].clone().sub(p[0])).normalize(),v=normal.clone().cross(u).normalize();const coords:number[]=[];for(let k=0;k<=64;k++){const t=k/64*Math.PI*2;const q=new Vector3(...a.formedMm).addScaledVector(u,6*Math.cos(t)).addScaledVector(v,6*Math.sin(t));coords.push(q.x,q.y,q.z);}const circle=new Line(new BufferGeometry().setAttribute('position',new Float32BufferAttribute(coords,3)),new LineBasicMaterial({color:0xe7b45c,depthTest:false}));circle.renderOrder=8;installationGroup.add(circle);
    }
  }
  function updateFeatures() {
    for (const object of [...featureGroup.children]) { featureGroup.remove(object); const line=object as Line; line.geometry.dispose(); (line.material as LineBasicMaterial).dispose(); }
    if (!(($('lines') as HTMLInputElement).checked)) return;
    const evaluate = createReferenceEvaluator(mesh,progress,params,constraints);
    for (const line of pattern.structureLines) {
      const v:number[]=[]; for(let i=1;i<line.points.length;i++){const a=line.points[i-1],b=line.points[i];const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let k=0;k<n;k++){const t=k/n,p=evaluate([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);v.push(p[0],p[1],p[2]-.15);}} const last=evaluate(line.points.at(-1)!);v.push(...last);
      featureGroup.add(new Line(new BufferGeometry().setAttribute('position',new Float32BufferAttribute(v,3)),new LineBasicMaterial({color:line.kind==='seam'?0x77b9e5:0xe7b36c,transparent:true,opacity:.85})));
    }
  }
  function refreshGeometry(markStale = true) {
    view.cancelAnimation(); positions=deformMesh(mesh,progress,params,constraints); view.setProgress(progress);
    if (markStale && points.some(p=>p.anchor)) { anchorsStale=true; $('projection-note').textContent='参数已改变：保留旧三角形绑定，请重新投影核对照片扣位。'; }
    updateSelection(); updateValidation(); renderPoints(); if (editPhoto || phase===4) renderPhoto();
  }
  function updateValidation() {
    const validation=getMeshValidation(mesh,positions), flat=deformMesh(mesh,0,params,constraints);
    let drift=0; for(let i=0;i<mesh.flatMm.length/2;i++)drift=Math.max(drift,Math.abs(flat[i*3]-sourceBefore[i*2]),Math.abs(flat[i*3+1]-sourceBefore[i*2+1]),Math.abs(flat[i*3+2]));
    const sourceUnchanged=sourceBefore.every((x,i)=>x===mesh.flatMm[i])&&indicesBefore.every((x,i)=>x===mesh.indices[i]);
    $('return-metric').textContent = num(drift,6);
    $('strain-metric').textContent = '当前主伸长范围 '+num(validation.principalStretchMin,3)+'–'+num(validation.principalStretchMax,3)+'（1 为等长）';
    const residuals=eyeletResiduals(mesh,params,registration);
    $('photo-fit-note').textContent = `假设鞋眼对应 ${residuals.count} 点：投影 RMS ${num(residuals.rmsPx,1)} px，最大 ${num(residuals.maxPx,1)} px。不能代表整片轮廓已拟合。`;
    $('validation-text').textContent = `源坐标／索引未改变：${sourceUnchanged?'是':'否'}\n有限坐标：${validation.finite?'是':'否'}；退化三角形：${validation.degenerateTriangles}\n回平面误差：${num(drift,9)} mm\n主伸长：${num(validation.principalStretchMin,4)} – ${num(validation.principalStretchMax,4)}\n未执行碰撞／自交验证。\n鞋眼投影 RMS：${num(residuals.rmsPx,1)} px（人工假设对应）\n人工约束：${constraints.length}；扣位绑定${anchorsStale?'需重新核对':'为当前参数下研究投影'}。`;
  }
  function renderPoints() {
    const formed=deformMesh(mesh,1,params,constraints);
    const displayPoints=points.map(p=>({...p,anchor:p.anchor?mapAnchor(mesh,positions,p.anchor):null}));
    flatView.setPoints(displayPoints); view.setLandmarks(displayPoints.filter(p=>p.anchor).map(p=>({...p.anchor!,id:p.id,label:p.id,color:p.kind==='body-fixed'?'#e0962f':p.kind==='cuff-fixed'?'#a365c4':'#16a6b4',radiusMm:p.kind==='snap-projection'?1.2:1.9})));updateInstallationReferences();
    $('point-table').innerHTML=points.map(p=>{const a=p.anchor?mapAnchor(mesh,formed,p.anchor):null;const assessment=assessFactoryPoint(pattern,{...p,anchor:a},{params,manufacturing}); return `<tr data-point="${p.id}"><td>${esc(p.id)}</td><td class="mono">${a?num(a.flatMm[0]):'—'}</td><td class="mono">${a?num(a.flatMm[1]):'—'}</td><td class="mono">${a?a.triangle:'—'}</td><td>${assessment.status==='unmapped'?'未映射':assessment.status==='invalid'?'不可安装':'待验证'}</td></tr>`;}).join('');
  }
  function markParameters() {
    for(const key of ['hingeYmm','hingeAngleDeg','foldAngleDeg','bendWidthMm','heelWrapDeg','landmarkStrength'] as const){($<HTMLInputElement>(key)).value=String(params[key]);$(key+'-out').textContent=num(params[key],1);}
  }
  function photoShell(content:string) { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 894" role="img" aria-label="原始成鞋照片与几何参考"><image href="${ROOT}references/03-shoe-side-original.jpg" width="1280" height="894"/>${content}</svg>`; }
  function renderPhoto() {
    if (phase===4) {
      const original=($('original-process') as HTMLInputElement).checked;
      const step=CLASP_PROCESS_STEPS.find(s=>s.step===processStep)!;
      let content=claspProcessOverlaySvg(design,processStep,{guides:($('guides') as HTMLInputElement).checked,spirals:($('spirals') as HTMLInputElement).checked,clasps:($('clasps') as HTMLInputElement).checked,straps:($('clasps') as HTMLInputElement).checked,candidate:($('candidate') as HTMLInputElement).checked});
      if(original) content=`<image href="${ROOT}references/${step.reference}" width="1280" height="894"/>`;
      $('photo-host').innerHTML=photoShell(content); $('step-explanation').textContent=step.title+'。'+step.explanation;
      document.querySelectorAll('[data-step]').forEach(b=>b.classList.toggle('active',Number((b as HTMLElement).dataset.step)===processStep));
    } else {
      const xy=(id:number):[number,number]=>worldToPhoto([positions[id*3],positions[id*3+1],positions[id*3+2]],registration);
      const boundary=Array.from(mesh.boundaryVertexIds).map(xy);
      let paths=`<path d="${fpath(boundary,true)}" fill="#318cce" fill-opacity=".12" stroke="#62bdff" stroke-width="2"/>`;
      for(const c of constraints){const pixel=worldToPhoto(c.formedMm,registration);paths+=`<circle cx="${pixel[0]}" cy="${pixel[1]}" r="5" fill="#f7b847"/><text x="${pixel[0]+8}" y="${pixel[1]}" fill="white" font-size="13">${esc(c.id)}</text>`;}
      for(const lm of PHOTO_LANDMARKS){const p=(lm as any).photoPixel ?? (lm as any).photoPx;if(p)paths+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="none" stroke="#efb448" stroke-width="1.5"/>`;}
      $('photo-host').innerHTML=photoShell(paths);
    }
  }
  async function showPhotoInThree() {
    const seq=++photoSequence;
    if(phase===3&&!editPhoto){view.setProjectionFrame(photoProjectionFrame(registration),true);view.setOpacity(Number(($('mesh-opacity') as HTMLInputElement).value));await view.setReferencePhoto({url:ROOT+'references/03-shoe-side-original.jpg',frameMm:photoProjectionFrame(registration),opacity:Number(($('photo-opacity') as HTMLInputElement).value),mirrorX:true});if(seq!==photoSequence)return;}
    else {await view.setReferencePhoto();view.setOpacity(1);}
  }
  function setPhase(next:number) {
    phase=next;editPhoto=false;view.cancelAnimation(); $('phase-title').textContent=PHASES[phase][1];$('phase-description').textContent=PHASES[phase][2];$('phase-label').textContent=`STAGE 0${phase+1} / 06`;
    document.querySelectorAll('[data-phase]').forEach(b=>b.classList.toggle('active',Number((b as HTMLElement).dataset.phase)===phase));
    document.querySelectorAll<HTMLElement>('[data-phases]').forEach(el=>el.classList.toggle('hidden',!el.dataset.phases!.split(',').includes(String(phase))));
    $('source-host').classList.toggle('hidden',phase!==0);$('photo-host').classList.toggle('hidden',phase!==4);$('three-host').classList.toggle('hidden',phase===0||phase===4);
    $('toggle-photo-edit').classList.toggle('hidden',phase!==3);$('photo-png').classList.toggle('hidden',phase!==4);$('camera-side').classList.toggle('hidden',phase===0||phase===4);$('camera-3d').classList.toggle('hidden',phase===0||phase===4);
    $('right-title').textContent=phase===0?'02 / 原始纸样 · 网格审计':phase===4?'02 / 原图上的扣件推导':'02 / 共享拓扑 · 蓝色薄片';
    $('right-meta').textContent=phase===0?'SOURCE / 1920 × 2560':phase===4?'PHOTO PIXELS':'SAME VERTEX ID';
    $('right-caption').textContent=phase===0?'青色为网格交点，轮廓与标定拟合均可追溯。原图保留完整尺寸。':phase===4?'源图像素与裁片毫米属于两个坐标系统；没有实测照片比例尺。':phase===3?'照片为单一视角，形变和深度含假设。照片上加点会影响局部伸长，请检查应变。':'单指旋转、双指缩放。轻点表面同步定位；没有鞋底，也不依靠纹理掩盖几何。';
    if(phase===1){progress=0;view.setProgress(0);view.setCameraPreset('flat');($('wireframe') as HTMLInputElement).checked=true;flatView.setWireframe(true);view.setWireframe(true);}
    if(phase>=2){($('wireframe') as HTMLInputElement).checked=false;flatView.setWireframe(false);view.setWireframe(false);}
    if(phase===2){view.setCameraPreset('three-quarter');}
    if(phase===3||phase===5){progress=1;view.setProgress(1);view.setCameraPreset('side');}
    if(phase===4){renderPhoto();} void showPhotoInThree(); refreshGeometry(false);
  }
  function snapshot() {
    const formed=deformMesh(mesh,1,params,constraints);
    return createProjectSnapshot({pattern,points:points.map(p=>({...p,anchor:p.anchor?mapAnchor(mesh,formed,p.anchor):null})),params,constraints,manufacturing,validation:getMeshValidation(mesh,formed),provenance:{manifest,digitization:digitValidation,blueSnapCenterUserConfirmed:true},registration,strapDesign:design,vertexIds:mesh.vertexIds,indices:mesh.indices,flatMm:mesh.flatMm,formedMm:formed,meshConstruction:mesh.construction,uncertainties:['照片鞋眼对应为人工假设，不能据其残差确认整片形态。','翻折带与后跟包覆可调但未经工厂验证。',...(anchorsStale?['形变参数已变更，扣位尚未重新投影。']:[])]});
  }
  function projectPoints() {
    view.cancelAnimation();progress=1;view.setProgress(1);positions=deformMesh(mesh,1,params,constraints);
    let hits=0;points=points.map(p=>{const result=projectPhotoToSurface(mesh,positions,p.photoPixel!,registration,params,p.layer==='unknown'?'any':p.layer!);if(result.anchor)hits++;return{...p,anchor:result.anchor,ambiguity:result.warnings};});
    anchorsStale=false;renderPoints();updateSelection();$('projection-note').textContent=`已绑定 ${hits}/${points.length} 个表面投影。其余保持未映射；所有位置须实物验证。展开后绑定身份不变。`;toast(`已锁定 ${hits}/${points.length} 个参考点。未命中面料的点不会自动吸附。`);
  }

  document.querySelectorAll<HTMLButtonElement>('[data-phase]').forEach(b=>b.onclick=()=>setPhase(Number(b.dataset.phase)));
  document.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b=>b.onclick=()=>{processStep=Number(b.dataset.step) as ClaspProcessStep;renderPhoto();});
  for(const id of ['grid','lines','wireframe','trace','guides','clasps','spirals','original-process','candidate']) ($<HTMLInputElement>(id)).onchange=()=>{flatView.setGrid(($('grid') as HTMLInputElement).checked);flatView.setLines(($('lines') as HTMLInputElement).checked);flatView.setWireframe(($('wireframe') as HTMLInputElement).checked);flatView.setTraceComparison(($('trace') as HTMLInputElement).checked);view.setGrid(($('grid') as HTMLInputElement).checked);view.setWireframe(($('wireframe') as HTMLInputElement).checked);updateFeatures();if(phase===4)renderPhoto();};
  ($<HTMLInputElement>('image-opacity')).oninput=()=>{const v=Number(($('image-opacity') as HTMLInputElement).value);$('image-opacity-out').textContent=num(v*100,0)+'%';flatView.setImageOpacity(v);};
  ($<HTMLInputElement>('progress')).oninput=()=>{view.cancelAnimation();progress=Number(($('progress') as HTMLInputElement).value);view.setProgress(progress);updateValidation();};
  for(const key of ['hingeYmm','hingeAngleDeg','foldAngleDeg','bendWidthMm','heelWrapDeg','landmarkStrength'] as const)($<HTMLInputElement>(key)).oninput=()=>{params[key]=Number(($<HTMLInputElement>(key)).value);$(key+'-out').textContent=num(params[key]);refreshGeometry();};
  for(const key of ['originXPx','originYPx','pixelsPerMmX','pixelsPerMmY'] as const)($<HTMLInputElement>('reg-'+key)).onchange=()=>{const value=Number(($<HTMLInputElement>('reg-'+key)).value);if(!Number.isFinite(value)||(key.startsWith('pixels')&&(value<.1||value>30))||Math.abs(value)>10000){toast('照片配准参数无效。');return;}registration[key]=value;refreshGeometry();void showPhotoInThree();};
  for(const key of ['puWidthMm','overlapMm','seamAllowanceMm','fixedFootprintRadiusMm'] as const)($<HTMLInputElement>('mfg-'+key)).onchange=()=>{const text=($<HTMLInputElement>('mfg-'+key)).value;const value=text===''?null:Number(text);if(value!==null&&(!Number.isFinite(value)||value<0||value>100)){toast('请填写有效的工艺尺寸。');return;}manufacturing[key]=value;renderPoints();};
  $('reset-flat').onclick=()=>flatView.reset();
  $('camera-side').onclick=()=>{view.setCameraPreset('side');if(phase===3&&!editPhoto)view.setProjectionFrame(photoProjectionFrame(registration),true);};
  $('camera-3d').onclick=()=>{view.setCameraPreset('three-quarter');};
  $('fold').onclick=()=>{void view.animateTo(1,1800).then(()=>updateValidation());};
  $('unfold').onclick=()=>{void view.animateTo(0,1800).then(()=>updateValidation());};
  $('project-points').onclick=projectPoints;
  ($<HTMLInputElement>('photo-opacity')).oninput=()=>{const v=Number(($<HTMLInputElement>('photo-opacity')).value);$('photo-opacity-out').textContent=num(v);view.setPhotoOpacity(v);};
  ($<HTMLInputElement>('mesh-opacity')).oninput=()=>{const v=Number(($<HTMLInputElement>('mesh-opacity')).value);$('mesh-opacity-out').textContent=num(v);view.setOpacity(v);};
  $('toggle-photo-edit').onclick=()=>{editPhoto=!editPhoto;view.cancelAnimation();$('photo-host').classList.toggle('hidden',!editPhoto);$('three-host').classList.toggle('hidden',editPhoto);if(editPhoto){renderPhoto();toast('先轻点左侧裁片选择校准位置，再点右侧照片。只约束投影 X/Y；深度保留当前假设。');}else void showPhotoInThree();};
  $('photo-host').onclick=e=>{if(!editPhoto||phase!==3)return;if(!selection){toast('请先在左侧裁片选择一个面料点。');return;}const svg=$('photo-host').querySelector('svg')!,matrix=svg.getScreenCTM();if(!matrix)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());if(p.x<0||p.x>1280||p.y<0||p.y>894)return;const xy=photoToWorld([p.x,p.y],registration),formed=mapAnchor(mesh,deformMesh(mesh,1,params,constraints),selection);const id='K'+(constraints.length+1);constraints.push({id,flatMm:selection.flatMm,formedMm:[xy[0],xy[1],formed.formedMm[2]],radiusMm:35,weight:1,confidence:'photo-estimated',description:'人工指定照片投影；深度沿用假设，不能视为实测。'});params.landmarkStrength=.5;markParameters();renderConstraints();refreshGeometry();toast('已加入人工照片约束。请检查主伸长与邻近变形；它不构成真实缝合验证。');};
  function renderConstraints(){const residual=getConstraintResiduals(mesh,deformMesh(mesh,1,params,constraints),constraints,params);$('constraint-list').innerHTML=constraints.map((c,i)=>`<div class="constraint-row"><span>${esc(c.id)} · ${num(c.flatMm[0])}, ${num(c.flatMm[1])} mm · ${(residual[i] as any)?.residualMm?num((residual[i] as any).residualMm):'假设'}</span><button data-delete-constraint="${i}">删除</button></div>`).join('');}
  $('constraint-list').onclick=e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-delete-constraint]');if(b){constraints.splice(Number(b.dataset.deleteConstraint),1);renderConstraints();refreshGeometry();}};
  $('clear-constraints').onclick=()=>{constraints=[];params.landmarkStrength=0;markParameters();renderConstraints();refreshGeometry();};
  $('point-table').onclick=e=>{const row=(e.target as HTMLElement).closest<HTMLElement>('[data-point]');const point=points.find(p=>p.id===row?.dataset.point);if(!point)return;if(point.anchor)select(point.anchor);else toast('此点尚未命中对应面料，不输出坐标。');const assessment=assessFactoryPoint(pattern,point,{params,manufacturing});$('point-warnings').textContent=point.label+'：'+assessment.warnings.join('；');$('point-warnings').classList.remove('hidden');};
  $('export-svg').onclick=()=>save('ONWARD-factory-reference.svg',createFactorySVG(pattern,snapshot().points,{params,manufacturing,provenance:{source:pattern.source,anchorsStale}}),'image/svg+xml');
  $('export-json').onclick=()=>save('ONWARD-pattern-project.json',exportCoordinateJSON(snapshot()),'application/json');
  $('export-csv').onclick=()=>save('ONWARD-points-mm.csv',exportCoordinateCSV(snapshot()),'text/csv;charset=utf-8');
  $('flat-svg').onclick=()=>save('ONWARD-pattern-view.svg',flatView.exportSVG(),'image/svg+xml');
  $('story-svg').onclick=()=>save('ONWARD-clasp-process-'+processStep+'.svg',photoShell(claspProcessOverlaySvg(design,processStep,{guides:true,spirals:true,clasps:true,straps:processStep===9})),'image/svg+xml');
  $('flat-png').onclick=()=>void png(flatView.exportSVG(),'ONWARD-pattern-view.png',2400);
  $('photo-png').onclick=()=>void png($('photo-host').querySelector('svg')!.outerHTML,'ONWARD-clasp-process-'+processStep+'.png',2560);
  ($<HTMLInputElement>('import-project')).onchange=async()=>{
    const file=($<HTMLInputElement>('import-project')).files?.[0];if(!file)return;
    try{
      if(file.size>30_000_000)throw Error('工程文件过大。');
      const restored=restoreProject(JSON.parse(await file.text()),mesh,points);
      view.cancelAnimation();
      params=restored.params;constraints=restored.constraints;points=restored.points;registration=restored.registration;manufacturing=restored.manufacturing;anchorsStale=false;
      for(const key of ['originXPx','originYPx','pixelsPerMmX','pixelsPerMmY'] as const)($<HTMLInputElement>('reg-'+key)).value=String(registration[key]);
      for(const key of ['puWidthMm','overlapMm','seamAllowanceMm','fixedFootprintRadiusMm'] as const)($<HTMLInputElement>('mfg-'+key)).value=manufacturing[key]===null?'':String(manufacturing[key]);
      markParameters();renderConstraints();refreshGeometry(false);void showPhotoInThree();
      $('projection-note').textContent='已恢复工程绑定，原始裁片几何保持不变；请结合照片复核。';
      toast('工程已恢复，原始裁片几何保持不变。');
    }catch(e){toast('无法恢复：'+String(e));}
  };

  async function png(svgText:string,name:string,width:number){try{const doc=new DOMParser().parseFromString(svgText,'image/svg+xml');const svg=doc.documentElement;for(const image of svg.querySelectorAll('image')){const href=image.getAttribute('href');if(!href||href.startsWith('data:'))continue;const r=await fetch(new URL(href,location.href));if(!r.ok)throw Error('原图载入失败');const blob=await r.blob();const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);});image.setAttribute('href',data);}const box=(svg.getAttribute('viewBox')??'0 0 1280 894').split(/[ ,]+/).map(Number);const height=Math.round(width*box[3]/box[2]);svg.setAttribute('width',String(width));svg.setAttribute('height',String(height));const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);try{const img=new Image();await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(Error('SVG 光栅化失败'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);const png=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG 编码失败')),'image/png'));save(name,png);toast('高清 PNG 已生成。');}finally{URL.revokeObjectURL(url);}}catch(e){toast('导出失败：'+String(e)+'，可先导出 SVG。');}}
  markParameters();renderPoints();setPhase(0);
  (window as any).__patternLab={mesh,view,flatView,getState:()=>({phase,progress,params:{...params},registration:{...registration},selection,points,constraints,anchorsStale,validation:getMeshValidation(mesh,positions)}),setPhase,projectPoints,snapshot,selectFlat:(p:[number,number])=>{const a=mapFlatToSurface(mesh,positions,p);if(a)select(a);return a;},setProgress:(t:number)=>view.setProgress(t)};
}

start().catch(error=>{console.error(error);$('app').innerHTML=`<div class="error-box"><h1>研究页未能完成载入</h1><p>${esc(String(error))}</p><p>源图和纸样不会因此改变。请刷新重试，或直接查看 <a href="${ROOT}data/pattern.svg">毫米裁片 SVG</a>。</p><button onclick="location.reload()">重新载入</button></div>`;});
