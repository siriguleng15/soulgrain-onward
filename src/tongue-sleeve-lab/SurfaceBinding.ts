import {Matrix4,Mesh,Quaternion,Vector3} from 'three';

export interface SurfaceAnchor {id:string;triangle:number;barycentric:[number,number,number];clearance:number;}
/** One persistent identity attached to a real triangle. Mesh.getVertexPosition
 * includes morph targets and skinning in Three.js, so it can also track a
 * fingertip pad. Update the authored pose root's world matrices before a batch
 * evaluation. This does not replace contact or cloth animation authoring.
 */
export class SurfaceBinding {
 readonly anchor:Readonly<SurfaceAnchor>;private readonly ids:[number,number,number];
 readonly mesh:Mesh;
 private readonly geometry;private readonly index;private readonly count:number;
 constructor(mesh:Mesh,anchor:SurfaceAnchor){
  this.mesh=mesh;
  const weights=anchor.barycentric;
  if(!anchor.id||!Number.isInteger(anchor.triangle)||anchor.triangle<0||!weights.every(Number.isFinite)||weights.some(w=>w<0||w>1)||Math.abs(weights.reduce((a,b)=>a+b,0)-1)>1e-8||!Number.isFinite(anchor.clearance))throw Error('表面绑定参数无效');
  this.anchor=Object.freeze({...anchor,barycentric:Object.freeze([...weights]) as unknown as [number,number,number]});
  this.geometry=mesh.geometry;this.index=this.geometry.index;this.count=this.geometry.getAttribute('position').count;
  const first=anchor.triangle*3,limit=this.index?.count??this.count;if(first+2>=limit)throw Error('绑定三角形超出表面范围');
  this.ids=[0,1,2].map(i=>this.index?this.index.getX(first+i):first+i) as [number,number,number];
 }
 evaluate(){
  const g=this.mesh.geometry,first=this.anchor.triangle*3;
  if(g!==this.geometry||g.index!==this.index||g.getAttribute('position').count!==this.count||this.ids.some((id,i)=>(this.index?this.index.getX(first+i):first+i)!==id))throw Error('绑定后拓扑身份已变化，禁止静默投影到另一张网格');
  this.mesh.updateWorldMatrix(true,false);
  const vertices=this.ids.map(id=>this.mesh.getVertexPosition(id,new Vector3()).applyMatrix4(this.mesh.matrixWorld));
  const edgeA=vertices[1].clone().sub(vertices[0]),edgeB=vertices[2].clone().sub(vertices[0]),normal=new Vector3().crossVectors(edgeA,edgeB);
  if(normal.lengthSq()<1e-20)throw Error('绑定三角形退化，需修正动画资产');normal.normalize();
  const position=new Vector3();vertices.forEach((v,i)=>position.addScaledVector(v,this.anchor.barycentric[i]));position.addScaledVector(normal,this.anchor.clearance);
  const tangent=edgeA.normalize(),bitangent=new Vector3().crossVectors(normal,tangent).normalize();
  const uv=g.getAttribute('uv');if(uv){
   const a=this.ids[0],b=this.ids[1],c=this.ids[2],du1=uv.getX(b)-uv.getX(a),dv1=uv.getY(b)-uv.getY(a),du2=uv.getX(c)-uv.getX(a),dv2=uv.getY(c)-uv.getY(a),den=du1*dv2-du2*dv1;
   if(Math.abs(den)>1e-12){tangent.copy(vertices[1]).sub(vertices[0]).multiplyScalar(dv2).addScaledVector(vertices[2].clone().sub(vertices[0]),-dv1).divideScalar(den).normalize();bitangent.crossVectors(normal,tangent).normalize();}
  }
  const quaternion=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(tangent,bitangent,normal));
  return{id:this.anchor.id,position,normal,quaternion};
 }
}

export function bindUniqueSurfaceAnchors(mesh:Mesh,anchors:SurfaceAnchor[]){
 const ids=new Set<string>();return anchors.map(anchor=>{if(ids.has(anchor.id))throw Error('烫钻或接触点身份重复：'+anchor.id);ids.add(anchor.id);return new SurfaceBinding(mesh,anchor);});
}
