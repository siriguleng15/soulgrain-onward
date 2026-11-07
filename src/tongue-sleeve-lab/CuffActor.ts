import {DataTexture,RGBAFormat,UnsignedByteType,RepeatWrapping,LinearFilter,LinearMipmapLinearFilter,BufferGeometry,Float32BufferAttribute,Group,InstancedMesh,Matrix4,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {createWeaveNormalPixels} from '../advertising/scene/StudioMaterials.ts';
import type {SurfaceAnchor} from './SurfaceBinding.ts';
import {bindUniqueSurfaceAnchors} from './SurfaceBinding.ts';
export interface StoneAnchor extends SurfaceAnchor {radius:number;artworkCenter:[number,number];}
export interface CuffBindings {stoneCount:number;outerDiameterMetres:number;derivedCuffSHA256:string;anchors:StoneAnchor[];}
export type HandView='assembled'|'without-cuff'|'cuff-only'|'source';
function cutStone(){
 const points:number[]=[],indices:number[]=[];const rings=[[1,0],[1,.30],[.56,.72]],steps=10;
 for(const[r,z]of rings)for(let i=0;i<steps;i++){const a=i/steps*Math.PI*2;points.push(Math.cos(a)*r,Math.sin(a)*r,z);}
 for(let j=0;j<2;j++)for(let i=0;i<steps;i++){const a=j*steps+i,b=j*steps+(i+1)%steps,c=(j+1)*steps+i,d=(j+1)*steps+(i+1)%steps;indices.push(a,b,c,b,d,c);}
 for(let i=1;i<steps-1;i++)indices.push(20,20+i,20+i+1);
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(points,3));g.setIndex(indices);const faceted=g.toNonIndexed();faceted.computeVertexNormals();g.dispose();return faceted;
}
/** The uploaded hand, remaining robe and removable cuff keep distinct identity.
 * Stones are instantiated once and follow real cuff triangles, including CPU
 * deformations. View switches only help asset validation; they aren't a flip.
 */
export class CuffActor {
 readonly root=new Group();private readonly weave:DataTexture;readonly cuff:Mesh;readonly hand:Mesh;readonly robe:Mesh;readonly underRobe:Mesh;readonly stones:InstancedMesh;
 readonly bindings;readonly restPositions:Float32Array;readonly restNormals:Float32Array;deformation=0;private readonly axialStart:number;private readonly axialLength:number;view:HandView='assembled';showSilver=true;
 constructor(readonly model:Group,readonly layout:CuffBindings,rig?:Group){
  const get=(name:string)=>{const mesh=model.getObjectByName(name);if(!(mesh instanceof Mesh))throw Error('派生手模缺少 '+name);return mesh;};
  this.cuff=get('Horseshoe_Cuff');const sourceHand=get('Hand_Skin');const rigged=rig?.getObjectByName('User_Hand_Skinned');if(rig&&!(rigged instanceof Mesh))throw Error('派生手指骨骼缺少蒙皮网格');this.hand=rigged instanceof Mesh?rigged:sourceHand;if(rig){model.add(rig);sourceHand.visible=false;}this.robe=get('Robe_Sleeve');this.underRobe=get('Robe_UnderCuff');this.root.name='User_Hand_Robe_Cuff_Actor';this.root.add(model);
  this.cuff.geometry=this.cuff.geometry.clone();this.restPositions=new Float32Array(this.cuff.geometry.getAttribute('position').array);this.restNormals=new Float32Array(this.cuff.geometry.getAttribute('normal').array);this.cuff.geometry.computeBoundingBox();const bounds=this.cuff.geometry.boundingBox!;this.axialStart=bounds.max.z;this.axialLength=bounds.max.z-bounds.min.z;
  const pixels=createWeaveNormalPixels();this.weave=new DataTexture(pixels.data,128,128,RGBAFormat,UnsignedByteType);this.weave.name='Chapter_Derived_White_Cloth_Weave';this.weave.wrapS=this.weave.wrapT=RepeatWrapping;this.weave.repeat.set(9,13);this.weave.magFilter=LinearFilter;this.weave.minFilter=LinearMipmapLinearFilter;this.weave.generateMipmaps=true;this.weave.needsUpdate=true;
  for(const cloth of[this.cuff,this.robe,this.underRobe]){const material=cloth.material;if(material instanceof MeshStandardMaterial){material.normalMap=this.weave;material.normalScale.set(.42,.42);material.needsUpdate=true;}}
  this.bindings=bindUniqueSurfaceAnchors(this.cuff,layout.anchors);
  const material=new MeshStandardMaterial({color:0xf1f4fa,metalness:.78,roughness:.19});material.name='Persistent_Silver_Rhinestones';
  this.stones=new InstancedMesh(cutStone(),material,layout.anchors.length);this.stones.name='Same_Silver_Medallion_785';this.stones.frustumCulled=false;this.root.add(this.stones);this.updateStones();
 }
 stoneFrame(index:number){
  const frame=this.bindings[index].evaluate(),scale=Math.cbrt(Math.abs(this.root.matrixWorld.determinant()));
  // Layout radii and clearance are in metres; the isolated scene normalizes
  // all product actors. SurfaceBinding itself returns a world-space offset.
  frame.position.addScaledVector(frame.normal,this.layout.anchors[index].clearance*(scale-1));
  return{...frame,radius:this.layout.anchors[index].radius*scale};
 }
 updateStones(){
  this.root.updateWorldMatrix(true,true);const worldScale=this.root.getWorldScale(new Vector3());if(Math.max(worldScale.x,worldScale.y,worldScale.z)-Math.min(worldScale.x,worldScale.y,worldScale.z)>1e-8)throw Error('袖面 actor 只支持统一场景缩放；形变应修改真实几何');const inverse=this.root.matrixWorld.clone().invert(),m=new Matrix4(),s=new Vector3();
  for(let i=0;i<this.bindings.length;i++){const binding=this.stoneFrame(i),radius=binding.radius;m.compose(binding.position,binding.quaternion,s.set(radius,radius,radius)).premultiply(inverse);this.stones.setMatrixAt(i,m);}
  this.stones.instanceMatrix.needsUpdate=true;
 }
 /** A modest continuous bend for verifying skin/stone binding. It is
  * deliberately not presented as the authored horseshoe-cuff flip shot. */
 setBend(value:number){
  this.deformation=Math.max(0,Math.min(1,value));const p=this.cuff.geometry.getAttribute('position'),n=this.cuff.geometry.getAttribute('normal');
  if(this.deformation===0){(p.array as Float32Array).set(this.restPositions);(n.array as Float32Array).set(this.restNormals);}
  else{const curvature=this.deformation*1.35/this.axialLength,radius=1/curvature,cy=.026;
   for(let i=0;i<p.count;i++){const x=this.restPositions[i*3],y=this.restPositions[i*3+1],z=this.restPositions[i*3+2],length=this.axialStart-z,angle=length*curvature,cos=Math.cos(angle),sin=Math.sin(angle);p.setXYZ(i,x,cy+radius*(1-cos)+(y-cy)*cos,this.axialStart-radius*sin+(y-cy)*sin);}
   this.cuff.geometry.computeVertexNormals();
  }
  p.needsUpdate=true;n.needsUpdate=true;this.cuff.geometry.computeBoundingBox();this.cuff.geometry.computeBoundingSphere();this.updateStones();
 }
 setView(view:HandView){this.view=view;this.cuff.visible=view!=='without-cuff';for(const mesh of[this.hand,this.robe,this.underRobe])mesh.visible=view!=='cuff-only';this.stones.visible=this.showSilver&&this.cuff.visible;}
 setSilver(value:boolean){this.showSilver=value;this.stones.visible=value&&this.cuff.visible;}
 state(){return{view:this.view,bindingTestBend:this.deformation,stoneCount:this.layout.stoneCount,medallionOuterDiameterMm:this.layout.outerDiameterMetres*1000,silverIdentity:this.stones.uuid,cuffIdentity:this.cuff.uuid,parts:[this.hand,this.robe,this.underRobe,this.cuff].map(o=>({name:o.name,visible:o.visible,vertices:o.geometry.getAttribute('position').count})),underCuffReconstruction:'robe cloth, not bare skin',animationComplete:false};}
 dispose(){this.weave.dispose();this.stones.geometry.dispose();(this.stones.material as MeshStandardMaterial).dispose();}
}
