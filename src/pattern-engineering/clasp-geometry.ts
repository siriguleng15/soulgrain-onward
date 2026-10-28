/** Geometry read from the user's actual construction drawings.
 * Coordinates here are ORIGINAL PHOTO PIXELS, not paper millimetres.
 * Default observed placement never silently enables the optional correction.
 */
export type Point2 = [number, number];
export interface FittedLine {
  id: string;
  slope: number;
  intercept: number;
  angleDeg: number;
  rmsPx: number;
  supportPixels: number;
  supportX?: Point2;
  supportY?: Point2;
}
export interface ObservedStrip {
  bodyEnd: Point2;
  cuffEnd: Point2;
  midpoint: Point2;
  axisUnit: Point2;
  angleDeg: number;
  lengthPx: number;
  widthPx: number;
  corners: Point2[];
  method: string;
}
export interface PhysicalClaspInputs {
  snapAppearanceDiameterMm: number;
  puWidthMm: number | null;
  overlapMm: number | null;
  bodySeamAllowanceMm: number | null;
  cuffSeamAllowanceMm: number | null;
  maleInstallCenterPatternMm: Point2 | null;
  femaleInstallCenterPatternMm: Point2 | null;
  status: string;
}
export interface ObservedClasp {
  id: string;
  centerPhoto: Point2;
  radiusPhotoPx: number;
  bodyFixedEndPhoto: Point2;
  cuffFixedEndPhoto: Point2;
  circleToStripMidpointErrorPx: number;
  bodyBoundaryDistancePx: number;
  strip: ObservedStrip;
  circleFit: { center: Point2; radiusPx: number; hullCircleRmsPx: number; pixelOutlineUncertaintyPx: number };
  physical: PhysicalClaspInputs;
}
export interface CandidateClasp {
  id: string;
  centerPhoto: Point2;
  bodyFixedEndPhoto: Point2;
  cuffFixedEndPhoto: Point2;
  axisUnit: Point2;
  angleDeg: number;
  observedBodyEndShiftPx: number;
  observedCuffEndShiftPx: number;
}
export interface GoldenArc {
  index: number;
  square: [number, number, number];
  center: Point2;
  radius: number;
  startAngle: number;
  endAngle: number;
  start: Point2;
  end: Point2;
}
export interface GoldenTemplate {
  id: string;
  reference: string;
  mirroredY: boolean;
  canonicalSize: Point2;
  origin: Point2;
  axisX: Point2;
  axisY: Point2;
  scalePxPerUnit: number;
  angleDeg: number;
  observedAspect: number;
  fittedAspect: number;
  fitSizeResidualPx: Point2;
  fitUncertaintyPx: number;
  corners: Point2[];
  fourthArcEndPhoto: Point2;
  fifthArcFullCircleCenterPhoto: Point2;
  fifthArcFullCircleDiameterPx: number;
  observedCenterToFourthEndPx: number;
  observedCenterToFifthCircleCenterPx: number;
  fifthCircleToObservedDiameterRatio: number;
  frameAgreementPx: { top: Point2; bottom: Point2; left: Point2 };
  canonicalArcs: GoldenArc[];
}
export interface ClaspDesign {
  schemaVersion: 1;
  units: 'photo-px';
  photoSize: Point2;
  photoReference: string;
  sourceFiles: Record<string, string>;
  defaultLayout: 'observed';
  frame: {
    lines: FittedLine[];
    bodyBoundary: FittedLine;
    tangentIntersection: Point2;
    toeConnectionPoint: Point2;
    toeConnectionPointMethod: string;
    boundaryIntersections: Record<string, Point2>;
    semanticRoles: Record<string, string>;
  };
  observed: { clasps: ObservedClasp[]; axisDifferenceDeg: number };
  constraintCandidate: {
    userConfirmed: boolean;
    enabledByDefault: false;
    purpose: string;
    clasps: CandidateClasp[];
  };
  golden: { phi: number; kind: string; templates: GoldenTemplate[]; numberingIssue: string; physicalScaleIssue: string;
    centerDefinition: { userConfirmed: true; confirmedDefinition: 'fifth-arc-supporting-circle-center';
      defaultCenterSource: 'observed-blue-circle'; confirmation: string; confirmationDate: string; note: string } };
  manufacturing: { physicalInputRequired: string[]; snapMaleFemaleCenters: string; cutLengthRule: string };
  warnings: string[];
}

export const PHI = (1 + Math.sqrt(5)) / 2;
export type ClaspProcessStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const CLASP_PROCESS_STEPS: readonly { step: ClaspProcessStep; reference: string; title: string; explanation: string }[] = [
  { step: 1, reference: '04-design-regions.jpg', title: '两个安装区域', explanation: '区分鞋身与翻筒；区域标记沿用原图，不据此推断隐藏缝制结构。' },
  { step: 2, reference: '05-design-framework.jpg', title: '结构线建立框架', explanation: '保留前端连接线、翻筒缝线延长线与左侧边界的像素拟合关系。黄色切点是设计图注释，尚非实测三维相切约束。' },
  { step: 3, reference: '06-design-midlines.jpg', title: '两条辅助定位线', explanation: '显示方向辅助线与安装边界的两个交点；手绘线不被重新正交化。' },
  { step: 4, reference: '07-design-spiral-first.jpg', title: '第一组黄金圆弧构图', explanation: '按原图拟合旋转等比模板；轨迹由递归正方形的四分之一圆弧组成，并非精确对数螺旋。' },
  { step: 5, reference: '08-design-center-first.jpg', title: '第一颗蓝色扣心', explanation: '采用原图蓝色扣心。用户确认其几何含义为第五段圆弧所依托完整圆的圆心；保留拟合模板的剩余误差。' },
  { step: 6, reference: '09-design-spiral-mirror.jpg', title: '反向模板定位第二组', explanation: '按原图使用反向圆弧模板；第二枚扣心仍取图中观测值，不强行吸附到拟合圆心。' },
  { step: 7, reference: '10-design-center-second.jpg', title: '第二颗蓝色扣心', explanation: '第二枚蓝色扣心采用原图观测值；不将手绘扣心强行吸附到拟合模板的圆心。' },
  { step: 8, reference: '11-design-centers.jpg', title: '两颗扣心对照', explanation: '同时保留两颗蓝色扣心，单独查看中心位置与框架的关系。12 mm 只表示预设外观直径。' },
  { step: 9, reference: '12-design-final-straps.jpg', title: '完整皮条与待确认工艺', explanation: '默认复现最终白条。两条观测长轴相差约 3.33°，与严格平行、中点规则存在差异；校正候选另列且未经定稿。' },
] as const;
const round = (value: number) => Number(value.toFixed(4));
export const photoToNormalized = (p: Point2, size: Point2 = [1280, 894]): Point2 => [p[0] / size[0], p[1] / size[1]];
export const normalizedToPhoto = (p: Point2, size: Point2 = [1280, 894]): Point2 => [p[0] * size[0], p[1] * size[1]];
export function intersectPhotoLines(a: Pick<FittedLine, 'slope' | 'intercept'>, b: Pick<FittedLine, 'slope' | 'intercept'>): Point2 | null {
  const d = a.slope - b.slope;
  if (Math.abs(d) < 1e-10) return null;
  const x = (b.intercept - a.intercept) / d;
  return [x, a.slope * x + a.intercept];
}
export function distanceToPhotoLine(p: Point2, line: Pick<FittedLine, 'slope' | 'intercept'>): number {
  return Math.abs(p[1] - line.slope * p[0] - line.intercept) / Math.hypot(1, line.slope);
}
export function templatePointToPhoto(template: GoldenTemplate, point: Point2): Point2 {
  const p: Point2 = [point[0], template.mirroredY ? 1 - point[1] : point[1]];
  return [template.origin[0] + (template.axisX[0] * p[0] + template.axisY[0] * p[1]) * template.scalePxPerUnit,
    template.origin[1] + (template.axisX[1] * p[0] + template.axisY[1] * p[1]) * template.scalePxPerUnit];
}
export function photoPointToTemplate(template: GoldenTemplate, point: Point2): Point2 {
  const d: Point2 = [(point[0] - template.origin[0]) / template.scalePxPerUnit, (point[1] - template.origin[1]) / template.scalePxPerUnit];
  // Data bases are independently fitted orthonormal axes. Solving the actual
  // 2x2 basis also remains correct after six-decimal JSON serialization.
  const determinant = template.axisX[0] * template.axisY[1] - template.axisX[1] * template.axisY[0];
  if (Math.abs(determinant) < 1e-10) throw new Error('Invalid golden template basis');
  const x = (d[0] * template.axisY[1] - d[1] * template.axisY[0]) / determinant;
  let y = (template.axisX[0] * d[1] - template.axisX[1] * d[0]) / determinant;
  if (template.mirroredY) y = 1 - y;
  return [x, y];
}
export function goldenQuarterArcs(count = 8): GoldenArc[] {
  if (!Number.isInteger(count) || count < 1 || count > 24) throw new Error('Arc count must be 1–24');
  let x = 0, y = 0, w = PHI, h = 1;
  const arcs: GoldenArc[] = [];
  for (let i = 0; i < count; i++) {
    const s = Math.min(w, h); let sx = x, sy = y, cx: number, cy: number;
    if (i % 4 === 0) { x += s; w -= s; cx = sx + s; cy = sy; }
    else if (i % 4 === 1) { sy = y + h - s; h -= s; cx = sx; cy = sy; }
    else if (i % 4 === 2) { sx = x + w - s; w -= s; cx = sx; cy = sy + s; }
    else { y += s; h -= s; cx = sx + s; cy = sy + s; }
    const a = Math.PI - i * Math.PI / 2, b = a - Math.PI / 2;
    arcs.push({ index: i + 1, square: [sx, sy, s], center: [cx, cy], radius: s, startAngle: a, endAngle: b,
      start: [cx + s * Math.cos(a), cy + s * Math.sin(a)], end: [cx + s * Math.cos(b), cy + s * Math.sin(b)] });
  }
  return arcs;
}
export function goldenArcPhotoPath(template: GoldenTemplate, arc: GoldenArc): string {
  const a = templatePointToPhoto(template, arc.start), b = templatePointToPhoto(template, arc.end);
  const radius = arc.radius * template.scalePxPerUnit;
  return `M${a.map(round).join(' ')} A${round(radius)} ${round(radius)} 0 0 ${template.mirroredY ? 1 : 0} ${b.map(round).join(' ')}`;
}
export function photoFrameworkSegments(design: ClaspDesign): { id: string; start: Point2; end: Point2 }[] {
  return design.frame.lines.map((line, i) => {
    const start = i === 0 ? design.frame.toeConnectionPoint : design.frame.boundaryIntersections[line.id];
    const x = line.supportX?.[1] ?? 1180;
    return { id: line.id, start, end: [x, line.slope * x + line.intercept] };
  });
}

export interface SurfaceCutInput {
  /** True surface arc along the candidate strap; not projected screen length. */
  bodyAnchorToSnapArcMm: number | null;
  cuffAnchorToSnapArcMm: number | null;
  puWidthMm: number | null;
  overlapMm: number | null;
  bodySeamAllowanceMm: number | null;
  cuffSeamAllowanceMm: number | null;
  symmetricOverlapConfirmed: boolean;
  surfaceAssumptionsVerified: boolean;
}
export function cutPlan(input: SurfaceCutInput) {
  const issues: string[] = [];
  for (const key of ['bodyAnchorToSnapArcMm', 'cuffAnchorToSnapArcMm', 'puWidthMm', 'overlapMm', 'bodySeamAllowanceMm', 'cuffSeamAllowanceMm'] as const) {
    const value = input[key];
    if (value === null || !Number.isFinite(value) || value < 0 || ((key === 'puWidthMm' || key.includes('Arc')) && value === 0)) issues.push(`待确认：${key}`);
  }
  if (!input.symmetricOverlapConfirmed) issues.push('未确认公母件对称重叠结构');
  if (!input.surfaceAssumptionsVerified) issues.push('三维形变及安装面仍需实物验证');
  const body = input.bodyAnchorToSnapArcMm, cuff = input.cuffAnchorToSnapArcMm;
  const completeSurfaceArcMm = body !== null && cuff !== null ? body + cuff : null;
  const specified = !issues.some(issue => issue.startsWith('待确认')) && input.symmetricOverlapConfirmed;
  return { completeSurfaceArcMm,
    bodyPieceCutMm: specified ? body! + input.overlapMm! / 2 + input.bodySeamAllowanceMm! : null,
    cuffPieceCutMm: specified ? cuff! + input.overlapMm! / 2 + input.cuffSeamAllowanceMm! : null,
    bodySnapDistanceFromSewnAnchorMm: body,
    cuffSnapDistanceFromSewnAnchorMm: cuff,
    snapDistanceFromOverlapTipMm: specified ? input.overlapMm! / 2 : null,
    productionReady: specified && input.surfaceAssumptionsVerified,
    issues };
}

/** Vector overlay in the ORIGINAL 1280x894 photograph coordinate system.
 * Callers decide whether to include the original image. Default is observed.
 * The optional correction is always marked as a candidate, never factory data.
 */
export interface ClaspOverlayOptions { guides?: boolean; spirals?: boolean; clasps?: boolean; straps?: boolean; candidate?: boolean; diagnostic?: boolean; processStep?: ClaspProcessStep }
export function claspOverlaySvg(design: ClaspDesign, options: ClaspOverlayOptions = {}): string {
  const show = { guides: true, spirals: true, clasps: true, straps: true, candidate: false, diagnostic: false, ...options };
  const step = show.processStep;
  const p = (point: Point2) => point.map(round).join(',');
  const elements: string[] = [];
  if (step === 1 && show.guides) elements.push('<g fill="#eff8f7" font-family="sans-serif" font-size="24"><text x="610" y="459">① 鞋身固定区域</text><text x="949" y="211">② 翻筒固定区域</text></g>');
  if (show.guides && step !== 1) {
    for (const line of photoFrameworkSegments(design)) {
      if (step === 2 && (line.id === 'upperStrapGuide' || line.id === 'lowerStrapGuide')) continue;
      elements.push(`<path d="M${p(line.start)} L${p(line.end)}" fill="none" stroke="#37ca77" stroke-width="2"/>`);
    }
    const line = design.frame.bodyBoundary;
    const top = design.frame.boundaryIntersections[design.frame.lines[0].id], bottom = design.frame.boundaryIntersections[design.frame.lines.at(-1)!.id];
    elements.push(`<path d="M${p(top)} L${p(bottom)}" fill="none" stroke="#37ca77" stroke-width="2" data-boundary-angle="${line.angleDeg}"/>`);
    if (step && step >= 3) for (const id of ['upperStrapGuide', 'lowerStrapGuide']) {
      const point = design.frame.boundaryIntersections[id];
      elements.push(`<circle cx="${point[0]}" cy="${point[1]}" r="6" fill="none" stroke="#f5dc57" stroke-width="2"/>`);
    }
  }
  if (show.spirals && (!step || (step >= 4 && step <= 7))) for (const [index, template] of design.golden.templates.entries()) {
    if (step && step <= 5 && index !== 0) continue;
    elements.push(`<path d="M${template.corners.map(p).join(' L')} Z" fill="none" stroke="#bf93e8" stroke-width="1.4" stroke-dasharray="5 4"/>`);
    for (const arc of template.canonicalArcs) elements.push(`<path d="${goldenArcPhotoPath(template, arc)}" fill="none" stroke="#bf93e8" stroke-opacity=".9" stroke-width="${arc.index === 5 ? 2.5 : 1.4}"/>`);
    if (show.diagnostic || (step !== undefined && step >= 5)) {
      elements.push(`<circle cx="${template.fifthArcFullCircleCenterPhoto[0]}" cy="${template.fifthArcFullCircleCenterPhoto[1]}" r="${template.fifthArcFullCircleDiameterPx / 2}" fill="none" stroke="#ffc665" stroke-width="1.5" stroke-dasharray="3 3"/>`);
      if (show.diagnostic) elements.push(`<circle cx="${template.fourthArcEndPhoto[0]}" cy="${template.fourthArcEndPhoto[1]}" r="3" fill="#f09b5e"/>`);
      const center = template.fifthArcFullCircleCenterPhoto;
      elements.push(`<path d="M${round(center[0]-5)} ${round(center[1])}h10 M${round(center[0])} ${round(center[1]-5)}v10" stroke="#ffc665" stroke-width="1.5" data-role="fifth-supporting-circle-center"/>`);
    }
  }
  for (const [index, observed] of design.observed.clasps.entries()) {
    if (step && (step < 5 || (step <= 6 && index !== 0))) continue;
    const chosen = show.candidate ? design.constraintCandidate.clasps.find(c => c.id === observed.id)! : observed;
    if (show.straps && (!step || step >= 9)) {
      let corners = observed.strip.corners;
      if (show.candidate) {
        const a = chosen.bodyFixedEndPhoto, b = chosen.cuffFixedEndPhoto;
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const nx = -(b[1] - a[1]) / length * observed.strip.widthPx / 2, ny = (b[0] - a[0]) / length * observed.strip.widthPx / 2;
        corners = [[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]];
      }
      elements.push(`<path d="M${corners.map(p).join(' L')} Z" fill="#f4f1e7" fill-opacity=".66" stroke="#d6d0c1" stroke-width="1.5"/>`);
    }
    if (show.clasps) elements.push(`<circle cx="${observed.centerPhoto[0]}" cy="${observed.centerPhoto[1]}" r="${observed.radiusPhotoPx}" fill="#4ac2e7" fill-opacity=".6" stroke="#c3d7de" stroke-width="2" data-preset-diameter-mm="12"/>`);
  }
  if (show.candidate) elements.push('<text x="70" y="820" fill="#ffd58d" font-size="22" font-family="sans-serif" data-role="unconfirmed-candidate">约束校正候选 · 未经定稿 · 不作为工厂数据</text>');
  return elements.join('\n');
}

/** Returns vector fragments for the eight observed process milestones plus
 * the final-strap result (step 9).
 * Use the matching original reference to audit the overlay, or the unchanged
 * clean side photograph to see the reconstruction without baked-in marks.
 */
export function claspProcessOverlaySvg(design: ClaspDesign, step: ClaspProcessStep, options: Omit<ClaspOverlayOptions, 'processStep'> = {}): string {
  if (!CLASP_PROCESS_STEPS.some(item => item.step === step)) throw new Error('Clasp process step must be 1–9');
  return claspOverlaySvg(design, { ...options, processStep: step });
}
