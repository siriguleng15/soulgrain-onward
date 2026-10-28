/** Validate a complete snapshot before a caller changes any live state.
 * Imported surface coordinates are never trusted: an anchor is reconstructed
 * from the current immutable mesh and its validated triangle/barycentric ID.
 */
import type { DeformationParams, LandmarkConstraint, PatternMesh, Vec2, Vec3 } from './types.ts';
import type { FactoryPoint, ManufacturingSettings } from './factory.ts';
import type { PhotoRegistration } from './photo-fit.ts';
import { DEFAULT_PHOTO_REGISTRATION } from './photo-fit.ts';
import { deformMesh } from './deformation.ts';
import { mapAnchor, mapFlatToSurface } from './mapping.ts';

export interface RestoredProject {
  params: DeformationParams;
  constraints: LandmarkConstraint[];
  points: FactoryPoint[];
  registration: PhotoRegistration;
  manufacturing: ManufacturingSettings;
}

type Fields = Record<string, unknown>;
const fields = (value: unknown, label: string): Fields => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(`${label}格式无效。`);
  return value as Fields;
};
function finite(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error(`${label}超出有效范围。`);
  return value;
}
function text(value: unknown, max: number, label: string): string {
  if (typeof value !== 'string' || value.length > max) throw Error(`${label}格式无效。`);
  return value;
}
function vector(value: unknown, length: number, bound: number, label: string): number[] {
  if (!Array.isArray(value) || value.length !== length) throw Error(`${label}维数无效。`);
  return value.map(v => finite(v, -bound, bound, label));
}
function exactArray(value: unknown, expected: ArrayLike<number>, label: string) {
  if (!Array.isArray(value) || value.length !== expected.length || value.some((v, i) => v !== expected[i])) throw Error(`${label}与当前原始裁片不一致，不能恢复绑定。`);
}

export function restoreProject(data: unknown, mesh: PatternMesh, currentPoints: FactoryPoint[]): RestoredProject {
  const input = fields(data, '工程');
  if (input.project !== 'SoulGrain ONWARD real-pattern engineering' || input.schemaVersion !== 1 || input.units !== 'mm' || input.status !== 'research-reference-not-production') throw Error('不是本研究页的毫米工程文件。');
  const pattern = fields(input.pattern, '原始裁片');
  if (pattern.units !== 'mm' || JSON.stringify(pattern.boundary) !== JSON.stringify(mesh.pattern.boundary)) throw Error('原始裁断轮廓与当前工程不一致。');
  const identity = fields(input.vertexIdentity, '网格身份');
  if (identity.exactMeshIncluded !== true) throw Error('工程未包含完整原始网格，不能恢复绑定。');
  exactArray(identity.triangleIndices, mesh.indices, '三角索引');
  exactArray(identity.flatMm, mesh.flatMm, '原始毫米坐标');
  exactArray(identity.vertexIds, mesh.vertexIds, '顶点身份');

  const p = fields(input.deformation, '形变参数');
  const width = mesh.bounds.width, height = mesh.bounds.height;
  const params: DeformationParams = {
    hingeXmm: finite(p.hingeXmm, -width, 2 * width, '翻折轴X'),
    hingeYmm: finite(p.hingeYmm, -height, 2 * height, '翻折轴Y'),
    hingeAngleDeg: finite(p.hingeAngleDeg, -180, 180, '翻折轴方向'),
    foldAngleDeg: finite(p.foldAngleDeg, -360, 360, '翻折角'),
    bendWidthMm: finite(p.bendWidthMm, 2, 100, '弯曲带宽'),
    heelWrapDeg: finite(p.heelWrapDeg, -135, 135, '后跟包覆角'),
    heelWrapLengthMm: finite(p.heelWrapLengthMm, 1, 2 * width, '后跟包覆长度'),
    sideDepthMm: finite(p.sideDepthMm, -100, 100, '侧面深度'),
    landmarkStrength: finite(p.landmarkStrength, 0, 1, '人工约束强度'),
    assumption: text(p.assumption, 4000, '形变假设说明'),
  };

  if (!Array.isArray(input.constraints) || input.constraints.length > 40) throw Error('人工约束数量无效，最多40个。');
  const ids = new Set<string>();
  const constraints: LandmarkConstraint[] = input.constraints.map(value => {
    const c = fields(value, '人工约束');
    const id = text(c.id, 100, '校准点编号');
    if (!id || ids.has(id)) throw Error('校准点编号为空或重复。');
    ids.add(id);
    if (c.enabled !== undefined && typeof c.enabled !== 'boolean') throw Error('校准点开关无效。');
    const confidence = c.confidence ?? 'assumed';
    if (confidence !== 'assumed' && confidence !== 'photo-estimated' && confidence !== 'measured') throw Error('校准点依据类型无效。');
    return {
      id,
      flatMm: vector(c.flatMm, 2, 10000, '校准点裁片坐标') as unknown as Vec2,
      formedMm: vector(c.formedMm, 3, 10000, '校准点三维坐标') as unknown as Vec3,
      radiusMm: finite(c.radiusMm, 2, 200, '校准点影响半径'),
      weight: c.weight === undefined ? 1 : finite(c.weight, 0, 10, '校准点权重'),
      enabled: c.enabled === undefined ? true : c.enabled as boolean,
      confidence,
      ...(c.description === undefined ? {} : { description: text(c.description, 4000, '校准点说明') }),
    };
  });

  // Only the original reference mesh decides whether a point is real fabric.
  const flat = deformMesh(mesh, 0, params);
  for (const constraint of constraints) if (!mapFlatToSurface(mesh, flat, constraint.flatMm)) throw Error(`校准点 ${constraint.id} 位于裁片外或孔内，没有对应面料。`);

  const r = input.registration === null || input.registration === undefined ? DEFAULT_PHOTO_REGISTRATION : fields(input.registration, '照片配准');
  const registration: PhotoRegistration = {
    originXPx: finite(r.originXPx, -10000, 10000, '照片原点X'),
    originYPx: finite(r.originYPx, -10000, 10000, '照片原点Y'),
    pixelsPerMmX: finite(r.pixelsPerMmX, .1, 30, '照片水平显示比例'),
    pixelsPerMmY: finite(r.pixelsPerMmY, .1, 30, '照片垂直显示比例'),
    widthPx: finite(r.widthPx, 1280, 1280, '照片原始宽度'),
    heightPx: finite(r.heightPx, 894, 894, '照片原始高度'),
    assumption: text(r.assumption, 4000, '照片配准假设说明'),
  };

  const m = fields(input.manufacturing, '工艺参数');
  const dimension = (key: string) => m[key] === null ? null : finite(m[key], 0, 100, key);
  if (m.snapDiameterMm !== 12) throw Error('本研究的预设扣头外观直径为12mm，不能从工程文件改变。');
  const manufacturing: ManufacturingSettings = {
    seamAllowanceMm: dimension('seamAllowanceMm'),
    fixedFootprintRadiusMm: dimension('fixedFootprintRadiusMm'),
    puWidthMm: dimension('puWidthMm'),
    overlapMm: dimension('overlapMm'),
    snapDiameterMm: 12,
  };

  if (!Array.isArray(input.points) || input.points.length !== currentPoints.length) throw Error('定位点列表与当前工程不一致。');
  const formed = deformMesh(mesh, 1, params, constraints);
  if (!formed.every(Number.isFinite)) throw Error('形变结果包含无效坐标，未恢复工程。');
  const points = currentPoints.map((point, i): FactoryPoint => {
    const source = fields((input.points as unknown[])[i], '定位点');
    if (source.id !== point.id || source.kind !== point.kind || source.layer !== point.layer) throw Error('定位点身份或所属层不一致。');
    let anchor: FactoryPoint['anchor'] = null;
    if (source.anchor !== null) {
      const a = fields(source.anchor, '表面绑定');
      const triangle = finite(a.triangle, 0, mesh.indices.length / 3 - 1, '三角形编号');
      if (!Number.isInteger(triangle)) throw Error('三角形编号不是整数。');
      const barycentric = vector(a.barycentric, 3, 1.000001, '三角形重心坐标') as [number, number, number];
      anchor = mapAnchor(mesh, formed, { triangle, barycentric });
    }
    const ambiguity = source.ambiguity === undefined ? undefined : source.ambiguity;
    if (ambiguity !== undefined && (!Array.isArray(ambiguity) || ambiguity.length > 30 || ambiguity.some(v => typeof v !== 'string' || v.length > 4000))) throw Error('定位风险说明格式无效。');
    return { ...point, photoPixel:point.photoPixel ? [...point.photoPixel] : undefined, anchor, ambiguity:ambiguity ? [...ambiguity as string[]] : undefined };
  });
  return { params, constraints, points, registration, manufacturing };
}
