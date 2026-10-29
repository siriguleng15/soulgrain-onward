export type Vec3=readonly[number,number,number];
export interface PanelData {
  schemaVersion:number;
  source:{paperProjectSha256:string;correctedModelSha256:string;sourceVertexCount:number;sourceTriangleCount:number;[key:string]:unknown};
  units:unknown;
  flatMm:number[];
  vertexIds:(number|string)[];
  indices:number[];
  formedPositions:number[];
  flatDisplayPositions:number[];
  trimmedIndices:number[];
  excludedIndices:number[];
  sourceTriangleIds:number[] | {trimmed:number[];excluded:number[]};
  fullIndices?:number[];
  flatDisplayMatrix?:number[];
  observedMask:boolean[];
  confidence:string[];
  unfoldSamples?:{formedAmount:number;positions:number[]}[];
  display:{mmToModelScale:number;[key:string]:unknown};
  validation:Record<string,unknown>;
  replacementMask:Record<string,number[]> | {meshPath:string;meshName:string;removedTriangles:number[];keptTriangles?:number[];triangleCount?:number;geometrySignature?:string}[];
  [key:string]:unknown;
}
export interface PanelSelection {triangle:number;barycentric:[number,number,number];flatMm:[number,number];vertexIds:(number|string)[];confidence:string[];}
export function validatePanelData(data:PanelData){
 const n=data.flatMm.length/2;
 if(!Number.isInteger(n)||n<3||data.vertexIds.length!==n||data.formedPositions.length!==n*3||data.flatDisplayPositions.length!==n*3)throw Error('完整侧片的顶点身份或位置缓冲不一致。');
 const indices=data.trimmedIndices??data.indices;
 if(indices.length%3||indices.some(i=>!Number.isInteger(i)||i<0||i>=n))throw Error('侧片三角形身份不完整。');
 if(!data.flatMm.every(Number.isFinite)||!data.formedPositions.every(Number.isFinite)||!data.flatDisplayPositions.every(Number.isFinite))throw Error('侧片包含无效坐标。');
 if(!data.unfoldSamples?.length||data.unfoldSamples.some(p=>p.positions.length!==n*3||!p.positions.every(Number.isFinite)))throw Error('缺少同一张侧片的连续展开姿态。');
 const frames=[...data.unfoldSamples].sort((a,b)=>a.formedAmount-b.formedAmount);
 if(frames[0].formedAmount!==0||frames.at(-1)!.formedAmount!==1)throw Error('展开姿态缺少端点。');
 if(frames[0].positions.some((v,i)=>v!==data.flatDisplayPositions[i]))throw Error('展开终点不是原始裁片平面。');
 if(frames.at(-1)!.positions.some((v,i)=>v!==data.formedPositions[i]))throw Error('展开起点不是成鞋侧片。');
}
