/** All geometry in this module uses millimetres, including the 3-D surface. */
export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];
export type Barycentric = readonly [number, number, number];

export interface PatternHole {
  id: string;
  center: Vec2;
  radiusMm: number;
  boundary?: Vec2[];
  role: 'eyelet' | 'internal-mark' | string;
  confidence?: number | string;
  sourcePixels?: Vec2;
  throughHole?: boolean;
}
export interface PatternLine {
  id: string;
  kind: 'seam' | 'fold-reference' | 'reference' | string;
  points: Vec2[];
  confidence?: number | string;
  interpretation?: string;
}
export interface PatternData {
  schemaVersion: number;
  units: 'mm';
  coordinateSystem?: Record<string, unknown>;
  bounds: { min: Vec2; max: Vec2; width: number; height: number };
  boundary: Vec2[];
  holes: PatternHole[];
  structureLines: PatternLine[];
  calibration?: Record<string, unknown>;
  [key: string]: unknown;
}
export interface PatternMesh {
  /** Immutable reference coordinates. Callers must not modify this buffer. */
  readonly flatMm: Float64Array;
  readonly indices: Uint32Array;
  readonly vertexIds: Uint32Array;
  readonly boundaryVertexIds: Uint32Array;
  readonly boundarySourceIndices: Uint32Array;
  readonly holeVertexIds: ReadonlyArray<{ id: string; indices: Uint32Array }>;
  readonly pattern: PatternData;
  readonly bounds: PatternData['bounds'];
  readonly construction: {
    method: string;
    maxEdgeMm: number;
    refinementRounds: number;
    holeChordErrorMm: number;
    collinearCleanupToleranceMm: number;
    qualityEdgeFlips: number;
    warnings: string[];
  };
}
export interface SurfaceAnchor {
  triangle: number;
  barycentric: Barycentric;
  flatMm: [number, number];
  formedMm: [number, number, number];
}
export interface LandmarkConstraint {
  id: string;
  flatMm: Vec2;
  formedMm: Vec3;
  radiusMm: number;
  weight?: number;
  enabled?: boolean;
  confidence?: 'assumed' | 'photo-estimated' | 'measured';
  description?: string;
}
export interface DeformationParams {
  /** A fold axis is an explicit assumption, not either drawn cross seam. */
  hingeXmm: number;
  hingeYmm: number;
  hingeAngleDeg: number;
  foldAngleDeg: number;
  bendWidthMm: number;
  heelWrapDeg: number;
  heelWrapLengthMm: number;
  sideDepthMm: number;
  landmarkStrength: number;
  assumption: string;
}
export interface MeshValidation {
  vertices: number;
  triangles: number;
  finite: boolean;
  referenceBoundaryErrorMm: number;
  principalStretchMin: number;
  principalStretchMax: number;
  maximumPrincipalStrain: number;
  areaRatioMin: number;
  areaRatioMax: number;
  degenerateTriangles: number;
  projectedOrientationReversals: number;
  selfIntersectionCheck: 'not-performed';
  flatReturnErrorMm: number;
  warnings: string[];
}
