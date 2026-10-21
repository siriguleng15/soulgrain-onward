export type NodeId = 'ROOT' | 'A1' | 'A1.1' | 'A1.1.1' | 'A1.1.1.1';
export type Point3 = [number, number, number];
export interface CuffMetadata {
  version: number; sampleCount: number; anchorIndex: number; height: number; length: number;
  centerline: Point3[]; angles: number[]; arc: number[]; anchor: Point3;
  seams: [number, number][][]; sourceCommit: string; sourceGLBSha256: string;
  actors: {name: string; vertices: number; faces: number; actor: string}[];
}
export interface NarrativeState {
  unfold: number; claspLift: number; roof: number; rods: number; copy: number; wrap: number;
  white: number; cover: number; lattice: number; leftStructure: number; notes: number;
  shoeX: number; demoX: number; demoY: number; demoZ: number; yaw: number;
  cameraX: number; cameraY: number; cameraZ: number; targetX: number; targetY: number; targetZ: number;
  framing: number; focusLight: number;
}
export interface StoryNode {
  id: NodeId; parent: NodeId | null; index: string; title: string; description: string;
  next: NodeId | null; action: string; duration: number;
}
