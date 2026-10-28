/** A photograph joins two independent surfaces. No AI vertex is presented as
 * a vertex of the real cutting pattern. Source paper coordinates remain mm;
 * actual GLB coordinates remain explicitly uncalibrated model units. */
import { Matrix4, Mesh, Object3D, Raycaster, Triangle, Vector3 } from 'three';
import type { BufferGeometry, Intersection } from 'three';
import type { Barycentric, DeformationParams, LandmarkConstraint, PatternData, PatternMesh, SurfaceAnchor, Vec2, Vec3 } from '../pattern-engineering/types.ts';
import { buildPatternMesh } from '../pattern-engineering/mesh.ts';
import { deformMesh } from '../pattern-engineering/deformation.ts';
import { mapFlatToSurface } from '../pattern-engineering/mapping.ts';
import { DEFAULT_PHOTO_REGISTRATION, PHOTO_DEFORMATION_HYPOTHESIS, projectPhotoToSurface, worldToPhoto, signedHingeDistance } from '../pattern-engineering/photo-fit.ts';
import type { PhotoRegistration, SurfaceLayer } from '../pattern-engineering/photo-fit.ts';

export interface ModelPhotoRegistration {
  widthPx: number;
  heightPx: number;
  originXPx: number;
  originYPx: number;
  pixelsPerUnitX: number;
  pixelsPerUnitY: number;
  /** photoX = originXPx + dot(modelWorld,rightWorld)*pixelsPerUnitX */
  rightWorld: Vec3;
  /** photoY = originYPx - dot(modelWorld,upWorld)*pixelsPerUnitY */
  upWorld: Vec3;
  /** From camera toward model, orthogonal to right and up. */
  viewDirectionWorld: Vec3;
  units: 'model-unit';
  assumption: string;
  fitResidualPx?: number | null;
  modelSha256?: string;
}
export type ClothRole = SurfaceLayer | 'excluded' | 'unknown';
export type LayerRequest = SurfaceLayer | 'any';
export interface ModelAnchor {
  meshPath: string;
  meshName: string;
  triangle: number;
  geometryVertexIndices: [number, number, number];
  barycentric: [number, number, number];
  modelPosition: [number, number, number];
  geometrySignature: string;
  role: SurfaceLayer;
  units: 'model-unit';
}
export interface ModelProjection {
  anchor: ModelAnchor | null;
  candidateCount: number;
  ambiguous: boolean;
  warnings: string[];
}
export interface BridgePair {
  schemaVersion: 1;
  paper: SurfaceAnchor | null;
  photoPixel: [number, number] | null;
  actual: ModelAnchor | null;
  layer: LayerRequest;
  /** Numerical projection agreement only, NOT registration accuracy. */
  projectionResidualPx: number | null;
  registrationFitResidualPx: number | null;
  confidence: 'unverified-photo-bridge';
  productionReady: false;
  warnings: string[];
}
export interface ModelBridgeOptions {
  paperMesh?: PatternMesh;
  paperParams?: DeformationParams;
  paperRegistration?: PhotoRegistration;
  paperConstraints?: readonly LandmarkConstraint[];
  /** Explicit face classification takes precedence over exported GLB extras. */
  roleForFace?: (mesh: Mesh, faceIndex: number) => ClothRole;
}
export interface ModelBridge {
  readonly paperMesh: PatternMesh;
  readonly paperPositions: Float64Array;
  readonly registration: ModelPhotoRegistration;
  paperToModel: (flatMm: Vec2, layer?: LayerRequest) => BridgePair;
  modelToPaper: (anchor: ModelAnchor, layer?: LayerRequest) => BridgePair;
  photoToModel: (pixel: Vec2, layer?: LayerRequest) => ModelProjection;
  makeAnchor: (mesh: Mesh, faceIndex: number, worldPoint: Vec3) => ModelAnchor | null;
  mapModelAnchor: (anchor: ModelAnchor) => ModelAnchor | null;
  modelToPhoto: (point: Vec3) => [number, number];
  dispose: () => void;
}

const finite = (n: number) => Number.isFinite(n);
const v3 = (v: Vec3) => new Vector3(v[0], v[1], v[2]);
function validateRegistration(r: ModelPhotoRegistration) {
  if (![r.widthPx,r.heightPx,r.originXPx,r.originYPx,r.pixelsPerUnitX,r.pixelsPerUnitY,...r.rightWorld,...r.upWorld,...r.viewDirectionWorld].every(finite) || r.widthPx <= 0 || r.heightPx <= 0 || r.pixelsPerUnitX <= 0 || r.pixelsPerUnitY <= 0) throw Error('模型照片配准参数无效。');
  const right=v3(r.rightWorld),up=v3(r.upWorld),forward=v3(r.viewDirectionWorld);
  if ([right,up,forward].some(v=>Math.abs(v.length()-1)>1e-5) || Math.max(Math.abs(right.dot(up)),Math.abs(right.dot(forward)),Math.abs(up.dot(forward)))>1e-5) throw Error('模型照片配准方向必须是正交单位向量。');
}
export function modelWorldToPhoto(point: Vec3, r: ModelPhotoRegistration): [number, number] {
  validateRegistration(r);const p=v3(point);
  return [r.originXPx+p.dot(v3(r.rightWorld))*r.pixelsPerUnitX,r.originYPx-p.dot(v3(r.upWorld))*r.pixelsPerUnitY];
}
/** World point on the plane through world origin; depth is independent. */
export function photoToModelPlane(pixel: Vec2, r: ModelPhotoRegistration): [number,number,number] {
  validateRegistration(r);
  const p=v3(r.rightWorld).multiplyScalar((pixel[0]-r.originXPx)/r.pixelsPerUnitX).addScaledVector(v3(r.upWorld),(r.originYPx-pixel[1])/r.pixelsPerUnitY);
  return [p.x,p.y,p.z];
}
function roleName(value: unknown): ClothRole {
  return value==='body'||value==='cuff'||value==='excluded'?value:'unknown';
}
/** Names are conservative fallbacks, never a proximity-based cloth guess. */
export function exportedClothRole(mesh: Mesh, faceIndex: number): ClothRole {
  const own=roleName(mesh.userData.bridgeRole??mesh.userData.bridge_role??mesh.userData.clothRole);
  if (own!=='unknown') return own;
  const g=mesh.geometry as BufferGeometry, indexOffset=faceIndex*3;
  const group=g.groups.find(group=>indexOffset>=group.start&&indexOffset<group.start+group.count);
  const material=Array.isArray(mesh.material)?mesh.material[group?.materialIndex??0]:mesh.material;
  const materialRole=roleName(material?.userData?.bridgeRole??material?.userData?.bridge_role);
  if(materialRole!=='unknown')return materialRole;
  const name=(mesh.name+' '+(material?.name??'')).toLowerCase();
  if(/tongue|lace|eyelet|snap|buckle|strap|pu[_ -]|sole|rubber|lining|binding|stitch|piping|hardware/.test(name))return 'excluded';
  if(/cuff.*(canvas|cloth|shell)|(?:canvas|cloth|shell).*cuff|翻筒面料/.test(name))return 'cuff';
  if(/(?:body|upper|quarter).*(?:canvas|cloth|shell)|(?:canvas|cloth|shell).*(?:body|upper|quarter)|鞋身面料/.test(name))return 'body';
  return 'unknown';
}
function geometrySignature(geometry: BufferGeometry) {
  const p=geometry.getAttribute('position'),index=geometry.getIndex();
  // A stable lightweight buffer fingerprint prevents restoring unrelated IDs.
  let hash=2166136261;
  for(const array of [p.array,index?.array]){
    if(!array)continue;
    const bytes=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);
    for(let i=0;i<bytes.length;i++)hash=Math.imul(hash^bytes[i],16777619)>>>0;
  }
  return `${p.count}:${index?.count??p.count}:${hash.toString(16).padStart(8,'0')}`;
}
function triangleIds(geometry: BufferGeometry, triangle: number): [number,number,number] | null {
  const index=geometry.getIndex(),position=geometry.getAttribute('position'),count=index?.count??position?.count??0;
  if(!Number.isInteger(triangle)||triangle<0||triangle*3+2>=count)return null;
  return [0,1,2].map(k=>index?index.getX(triangle*3+k):triangle*3+k) as [number,number,number];
}
function normalizeBarycentric(values: Barycentric): [number,number,number] | null {
  if(!values.every(finite)||Math.abs(values[0]+values[1]+values[2]-1)>1e-5||values.some(x=>x< -1e-5||x>1+1e-5))return null;
  const clamped=values.map(x=>Math.max(0,Math.min(1,x))),sum=clamped.reduce((a,b)=>a+b,0);
  return clamped.map(x=>x/sum) as [number,number,number];
}
export function createModelBridge(pattern: PatternData, actual: Object3D, registration: ModelPhotoRegistration, options: ModelBridgeOptions={}): ModelBridge {
  validateRegistration(registration);actual.updateMatrixWorld(true);
  const paperMesh=options.paperMesh??buildPatternMesh(pattern,{maxEdgeMm:4});
  const params=options.paperParams??{...PHOTO_DEFORMATION_HYPOTHESIS},paperRegistration=options.paperRegistration??{...DEFAULT_PHOTO_REGISTRATION};
  const paperPositions=deformMesh(paperMesh,1,params,options.paperConstraints??[]);
  const roleForFace=options.roleForFace??exportedClothRole;
  const meshes:Mesh[]=[],paths=new Map<Mesh,string>(),objects=new Map<string,Mesh>(),signatures=new Map<Mesh,string>();
  function collect(object:Object3D,path:string){
    if(object instanceof Mesh && object.geometry?.getAttribute('position')){meshes.push(object);paths.set(object,path);objects.set(path,object);signatures.set(object,geometrySignature(object.geometry));}
    object.children.forEach((child,i)=>collect(child,path+'/'+i));
  }
  collect(actual,'root');
  const raycaster=new Raycaster();
  // The far distance covers arbitrary source normalization without inventing mm.
  let radius=1;
  for(const mesh of meshes){mesh.geometry.computeBoundingSphere();const sphere=mesh.geometry.boundingSphere;if(sphere){const center=sphere.center.clone().applyMatrix4(mesh.matrixWorld);const scale=mesh.matrixWorld.getMaxScaleOnAxis();radius=Math.max(radius,center.length()+sphere.radius*scale);}}
  const far=radius*4+1,forward=v3(registration.viewDirectionWorld);
  const baseWarning='照片桥接依赖未验证的裁片形变与模型相机配准；AI 模型单位未获实物尺度校准。';
  function makeAnchor(mesh:Mesh,faceIndex:number,worldPoint:Vec3):ModelAnchor|null{
    const path=paths.get(mesh),ids=triangleIds(mesh.geometry,faceIndex);if(!path||!ids)return null;
    const role=roleForFace(mesh,faceIndex);if(role!=='body'&&role!=='cuff')return null;
    const attr=mesh.geometry.getAttribute('position'),vertices=ids.map(id=>new Vector3().fromBufferAttribute(attr,id));
    const local=v3(worldPoint).applyMatrix4(new Matrix4().copy(mesh.matrixWorld).invert());
    const b=new Triangle(...vertices as [Vector3,Vector3,Vector3]).getBarycoord(local,new Vector3());if(!b)return null;
    const bary=normalizeBarycentric([b.x,b.y,b.z]);if(!bary)return null;
    const p=new Vector3();vertices.forEach((v,i)=>p.addScaledVector(v,bary[i]));p.applyMatrix4(mesh.matrixWorld);
    return {meshPath:path,meshName:mesh.name,triangle:faceIndex,geometryVertexIndices:ids,barycentric:bary,modelPosition:[p.x,p.y,p.z],geometrySignature:signatures.get(mesh)!,role,units:'model-unit'};
  }
  function mapModelAnchor(anchor:ModelAnchor):ModelAnchor|null{
    const mesh=objects.get(anchor.meshPath);if(!mesh||signatures.get(mesh)!==anchor.geometrySignature)return null;
    const ids=triangleIds(mesh.geometry,anchor.triangle),bary=normalizeBarycentric(anchor.barycentric);if(!ids||!bary||ids.some((id,i)=>id!==anchor.geometryVertexIndices[i]))return null;
    const role=roleForFace(mesh,anchor.triangle);if(role!=='body'&&role!=='cuff'||role!==anchor.role)return null;
    actual.updateMatrixWorld(true);const attr=mesh.geometry.getAttribute('position'),p=new Vector3();ids.forEach((id,i)=>p.addScaledVector(new Vector3().fromBufferAttribute(attr,id),bary[i]));p.applyMatrix4(mesh.matrixWorld);
    return {...anchor,barycentric:bary,modelPosition:[p.x,p.y,p.z]};
  }
  function photoToModel(pixel:Vec2,layer:LayerRequest='any'):ModelProjection{
    if(!pixel.every(finite)||pixel[0]<0||pixel[0]>registration.widthPx||pixel[1]<0||pixel[1]>registration.heightPx)return{anchor:null,candidateCount:0,ambiguous:false,warnings:['位置不在源照片范围内。',baseWarning]};
    actual.updateMatrixWorld(true);const origin=v3(photoToModelPlane(pixel,registration)).addScaledVector(forward,-far);raycaster.set(origin,forward);raycaster.near=0;raycaster.far=far*2;
    const hits=raycaster.intersectObjects(meshes,false) as Intersection<Mesh>[];
    // A visible PU strip or eyelet is not transparent engineering evidence.
    // Never ray through excluded geometry and silently claim the hidden cloth
    // is the material observed in the photograph.
    const first=hits.find(hit=>hit.faceIndex!==undefined&&hit.faceIndex!==null);
    if(first){
      const firstRole=roleForFace(first.object,first.faceIndex!);
      if(firstRole!=='body'&&firstRole!=='cuff'||layer!=='any'&&firstRole!==layer){
        return{anchor:null,candidateCount:0,ambiguous:false,warnings:[`照片射线首先命中${firstRole==='excluded'?'扣件、鞋带、鞋舌或其他排除结构':firstRole==='unknown'?'未分类结构':'另一层面料'}；未将其后方不可见面料当作已观察安装面。`,baseWarning]};
      }
    }
    const anchors:ModelAnchor[]=[];
    for(const hit of hits){if(hit.faceIndex===undefined||hit.faceIndex===null)continue;const role=roleForFace(hit.object,hit.faceIndex);if(role!=='body'&&role!=='cuff'||layer!=='any'&&role!==layer)continue;const anchor=makeAnchor(hit.object,hit.faceIndex,[hit.point.x,hit.point.y,hit.point.z]);if(!anchor)continue;if(anchors.some(a=>a.meshPath===anchor.meshPath&&Math.hypot(...a.modelPosition.map((x,k)=>x-anchor.modelPosition[k]))<1e-7))continue;anchors.push(anchor);}
    const warnings=[baseWarning];if(!anchors.length)warnings.unshift('射线没有命中已明确标记的该层面料；不吸附到鞋带、皮条、孔眼或未知表面。');if(anchors.length>1)warnings.unshift(`该照片像素命中 ${anchors.length} 个面料表面；当前选择所请求层最靠近相机的一面。`);
    return{anchor:anchors[0]??null,candidateCount:anchors.length,ambiguous:anchors.length>1,warnings};
  }
  function pair(paper:SurfaceAnchor|null,pixel:Vec2|null,projection:ModelProjection,layer:LayerRequest,additional:string[]=[]):BridgePair{
    const q=projection.anchor&&pixel?modelWorldToPhoto(projection.anchor.modelPosition,registration):null;
    return{schemaVersion:1,paper,photoPixel:pixel?[pixel[0],pixel[1]]:null,actual:projection.anchor,layer,projectionResidualPx:q&&pixel?Math.hypot(q[0]-pixel[0],q[1]-pixel[1]):null,registrationFitResidualPx:registration.fitResidualPx??null,confidence:'unverified-photo-bridge',productionReady:false,warnings:[...additional,...projection.warnings,'数值投影残差仅检查同一相机计算自洽，不表示实物定位误差。']};
  }
  function paperToModel(flatMm:Vec2,layer:LayerRequest='any'):BridgePair{
    const paper=mapFlatToSurface(paperMesh,paperPositions,flatMm);
    if(!paper)return pair(null,null,{anchor:null,candidateCount:0,ambiguous:false,warnings:['裁片此处没有面料，可能位于孔内或轮廓外。']},layer);
    const pixel=worldToPhoto(paper.formedMm,paperRegistration);
    const requested=layer==='any'?(signedHingeDistance(flatMm,params)>0?'cuff':'body'):layer;
    const actualProjection=photoToModel(pixel,requested);
    return pair(paper,pixel,actualProjection,requested,['裁片三角形与 AI 模型三角形是两个独立身份，不可互换。']);
  }
  function modelToPaper(anchor:ModelAnchor,layer:LayerRequest='any'):BridgePair{
    const current=mapModelAnchor(anchor);
    if(!current)return pair(null,null,{anchor:null,candidateCount:0,ambiguous:false,warnings:['模型三角形身份已失效，需重新点选。']},layer);
    const pixel=modelWorldToPhoto(current.modelPosition,registration),requested=layer==='any'?current.role:layer;
    const paperHit=projectPhotoToSurface(paperMesh,paperPositions,pixel,paperRegistration,params,requested);
    const visible=photoToModel(pixel,requested);
    const hidden=!visible.anchor||Math.hypot(...visible.anchor.modelPosition.map((n,k)=>n-current.modelPosition[k]))>1e-6*Math.max(1,radius);
    return pair(paperHit.anchor,pixel,{anchor:current,candidateCount:1,ambiguous:false,warnings:[...paperHit.warnings,...(hidden?['当前三维选点从源照片相机方向被遮挡或并非首个可见面；其裁片对应仅是未验证投影，不能据此确认隐藏安装位置。']:[]),baseWarning]},requested);
  }
  return{paperMesh,paperPositions,registration,paperToModel,modelToPaper,photoToModel,makeAnchor,mapModelAnchor,modelToPhoto:p=>modelWorldToPhoto(p,registration),dispose:()=>{meshes.length=0;paths.clear();objects.clear();signatures.clear();}};
}

/** Serialized visible-shell audit from build_bridge.py --shell. The original
 * paper buffers remain authoritative; the render subset carries source IDs. */
export interface FittedPaperShell {
  sourceVertexIds: number[];
  sourceFlatMm: number[];
  sourceTriangleIndices: number[];
  flatDisplayModelUnits: number[];
  actualPositionsModelUnits: ([number,number,number] | null)[];
  mappedVertexMask: boolean[];
  mappedVertexCount: number;
  visibleOriginalTriangleIds: number[];
  visibleTriangleIndices: number[];
  sourceVertexCount: number;
  sourceTriangleCount: number;
  warnings: string[];
}
/** A display interpolation only, not a reconstructed sewing process. Unmapped
 * vertices stay in their flat display frame and must not be drawn as fitted. */
export function interpolateFittedShell(shell: FittedPaperShell, progress: number): Float32Array {
  const n=shell.sourceVertexCount;
  if(!Number.isInteger(n)||n<1||shell.flatDisplayModelUnits.length!==n*3||shell.actualPositionsModelUnits.length!==n||shell.mappedVertexMask.length!==n)throw Error('裁片映射壳层顶点身份不完整。');
  if(!Number.isFinite(progress))throw Error('展开进度无效。');
  const t=Math.max(0,Math.min(1,progress)),positions=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const actual=shell.actualPositionsModelUnits[i];
    if(shell.mappedVertexMask[i]&&!actual)throw Error('映射壳层命中标记与实际坐标不一致。');
    for(let k=0;k<3;k++){
      const flat=shell.flatDisplayModelUnits[i*3+k],target=shell.mappedVertexMask[i]?actual![k]:flat;
      if(!Number.isFinite(flat)||!Number.isFinite(target))throw Error('映射壳层含无效坐标。');
      positions[i*3+k]=flat+(target-flat)*t;
    }
  }
  return positions;
}
/** Resolve a drawn subset triangle back to its original real-paper identity. */
export function shellPickToPaper(shell:FittedPaperShell,drawnTriangle:number,weights:Barycentric):{triangle:number;barycentric:[number,number,number];flatMm:[number,number]}|null{
  if(!Number.isInteger(drawnTriangle)||drawnTriangle<0||drawnTriangle>=shell.visibleOriginalTriangleIds.length)return null;
  const bary=normalizeBarycentric(weights);if(!bary)return null;
  const triangle=shell.visibleOriginalTriangleIds[drawnTriangle],ids=[0,1,2].map(k=>shell.sourceTriangleIndices[triangle*3+k]);
  if(ids.some((id,k)=>!Number.isInteger(id)||id!==shell.visibleTriangleIndices[drawnTriangle*3+k]))return null;
  const p:[number,number]=[0,0];ids.forEach((id,k)=>{p[0]+=shell.sourceFlatMm[id*2]*bary[k];p[1]+=shell.sourceFlatMm[id*2+1]*bary[k];});
  if(!p.every(Number.isFinite))return null;
  return{triangle,barycentric:bary,flatMm:p};
}
