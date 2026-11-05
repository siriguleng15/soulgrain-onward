import {BufferAttribute,BufferGeometry,Matrix4,Mesh,Vector3} from 'three';
import contract from '../../.agents/skills/onward-asset-contract/references/asset-contract.json';
export const SOURCE_SHA=contract.expected.sha256;
export const SOURCE_URL='assets/onward-ad-v1/onward-ad-v1.glb';
export const SOURCE_CENTER=new Vector3(...contract.expected.displayNormalization.center as [number,number,number]);
export const SOURCE_SCALE=contract.expected.displayNormalization.scale;
export const normalize=(p:Vector3)=>p.sub(SOURCE_CENTER).multiplyScalar(SOURCE_SCALE);
export function fingerprint(geometry:BufferGeometry){let h=2166136261;for(const a of [...Object.values(geometry.attributes),geometry.index]){if(!a)continue;const data=new Uint8Array(a.array.buffer,a.array.byteOffset,a.array.byteLength);for(const x of data)h=Math.imul(h^x,16777619);}return(h>>>0).toString(16);}
/** Interpolate actual source triangles in its original UV chart, not a fitted rectangle. */
export class HeelSurface {
 private p;private uv;private normals;private triangles:{ids:number[];uv:number[][]}[]=[];
 readonly lower=new Vector3();readonly upper=new Vector3();readonly middle=new Vector3();readonly length:number;
 constructor(readonly source:Mesh){
  const g=source.geometry;this.p=g.getAttribute('position');this.uv=g.getAttribute('uv');this.normals=g.getAttribute('normal');
  const ix=g.index!;for(let i=0;i<ix.count;i+=3){const ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)];this.triangles.push({ids,uv:ids.map(k=>[this.uv.getX(k),this.uv.getY(k)])});}
  this.lower.copy(this.sample(0,.5));this.upper.copy(this.sample(1,.5));this.middle.copy(this.sample(.5,.5));
  let length=0,previous=this.lower.clone();for(let i=1;i<=60;i++){const q=this.sample(i/60,.5);length+=q.distanceTo(previous);previous=q;}this.length=length;
 }
 sample(s:number,v:number,out=new Vector3(),normal=false){
  const u=.14576271176338196+v*(.9152542352676392-.14576271176338196),w=.823437511920929-s*(.823437511920929-.1734374761581421);
  for(const t of this.triangles){const[[ax,ay],[bx,by],[cx,cy]]=t.uv,den=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy),a=((by-cy)*(u-cx)+(cx-bx)*(w-cy))/den,b=((cy-ay)*(u-cx)+(ax-cx)*(w-cy))/den,c=1-a-b;
   if(Math.min(a,b,c)>=-1e-5){out.set(0,0,0);const attr=normal?this.normals:this.p;for(let k=0;k<3;k++)out.addScaledVector(new Vector3().fromBufferAttribute(attr,t.ids[k]),[a,b,c][k]);return normal?out.normalize():normalize(out);}}
  throw Error(`原皮条 UV 范围外：${s},${v}`);
 }
 sourceParam(p:Vector3){return{s:Math.max(0,Math.min(1,(p.y-.007)/.095)),v:Math.max(0,Math.min(1,(.0005-p.z)/.014))};}
 /** A derived clone only; source vertices and UVs never change. */
 clone(source:Mesh){
  const geometry=source.geometry.clone(),position=geometry.getAttribute('position') as BufferAttribute;
  position.setUsage(35048);const rest:Vector3[]=[],map:{s:number;v:number;offset:Vector3}[]=[];
  for(let i=0;i<position.count;i++){const raw=new Vector3().fromBufferAttribute(position,i),p=normalize(raw.clone()),param=this.sourceParam(raw),base=this.sample(param.s,param.v);rest.push(p);map.push({...param,offset:p.clone().sub(base)});}
  return{geometry,rest,map};
 }
 exactVertexError(){let maximum=0;for(let i=0;i<this.p.count;i++){const raw=new Vector3().fromBufferAttribute(this.p,i),q=this.sourceParam(raw);maximum=Math.max(maximum,this.sample(q.s,q.v).distanceTo(normalize(raw)));}return maximum;}
}
export type Pose=ReturnType<typeof import('./motion.ts').evaluate>;
export function transformDirection(v:Vector3,m:Matrix4){return v.clone().transformDirection(m);}
