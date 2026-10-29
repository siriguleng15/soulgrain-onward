/** The two original PU/snap surface patches are retained from the corrected
 * GLB, using the user's photographed strip polygons solely as selection ROIs.
 * No replacement bar or invented fastening coordinate is generated. */
import {BufferGeometry,Float32BufferAttribute,Group,Mesh,MeshStandardMaterial,DoubleSide,Vector3,Quaternion} from 'three';
import {smooth} from './timeline.ts';
export interface ClaspObservation {id:string;centerPhoto:[number,number];radiusPhotoPx:number;strip:{axisUnit:[number,number];corners:[number,number][];bodyEnd:[number,number];cuffEnd:[number,number]};}
export interface ClaspPhotoData {observed:{clasps:ClaspObservation[]};}
export interface HardwareVisibility {sourceModelSha256:string;allowedTriangles?:{mesh:string;triangle:number}[];sourceTriangles?:{mesh:string;triangle:number}[];}
export interface PhotoReg {originXPx:number;originYPx:number;pixelsPerUnitX:number;pixelsPerUnitY:number;rightWorld:[number,number,number];upWorld:[number,number,number];viewDirectionWorld:[number,number,number];}
const inside=(p:number[],ring:number[][])=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++)if((ring[i][1]>p[1])!==(ring[j][1]>p[1])&&p[0]<(ring[j][0]-ring[i][0])*(p[1]-ring[i][1])/(ring[j][1]-ring[i][1])+ring[i][0])hit=!hit;return hit;};
interface Piece {group:Group;pivot:Vector3;axis:Vector3;sign:number;material:MeshStandardMaterial;}
export class HardwareLayer {
 readonly group=new Group();readonly pieces:Piece[]=[];triangles=0;sourceTriangles:{mesh:string;triangle:number;clasp:string;part:string}[]=[];
 constructor(asset:Group,reg:PhotoReg,design:ClaspPhotoData,visibility?:HardwareVisibility){
  const allowed=visibility?new Set((visibility.allowedTriangles??visibility.sourceTriangles??[]).map(x=>x.mesh+':'+x.triangle)):undefined;
  this.group.name='OriginalGLB_PU_And_Snaps_Released_Separately';const right=new Vector3(...reg.rightWorld),up=new Vector3(...reg.upWorld),forward=new Vector3(...reg.viewDirectionWorld);
  asset.updateMatrixWorld(true);
  for(const clasp of design.observed.clasps){const buckets=new Map<string,{points:number[];normals:number[];source:{mesh:string;triangle:number;clasp:string;part:string}[]}>();for(const name of['body-half','cuff-half','cap'])buckets.set(name,{points:[],normals:[],source:[]});
   const axis2=clasp.strip.axisUnit;
   asset.traverse(node=>{if(!(node instanceof Mesh)||!/Footwear_Details_Unclassified/.test(node.name))return;const index=node.geometry.getIndex(),attr=node.geometry.getAttribute('position');if(!index)return;const a=new Vector3(),b=new Vector3(),c=new Vector3(),center=new Vector3(),normal=new Vector3();
    for(let t=0;t<index.count/3;t++){if(allowed&&!allowed.has(node.name+':'+t))continue;a.fromBufferAttribute(attr,index.getX(t*3)).applyMatrix4(node.matrixWorld);b.fromBufferAttribute(attr,index.getX(t*3+1)).applyMatrix4(node.matrixWorld);c.fromBufferAttribute(attr,index.getX(t*3+2)).applyMatrix4(node.matrixWorld);normal.copy(b).sub(a).cross(new Vector3().copy(c).sub(a)).normalize();if(normal.dot(forward)>-.03)continue;center.copy(a).add(b).add(c).multiplyScalar(1/3);if(center.z<.12)continue;const pixel=[reg.originXPx+center.dot(right)*reg.pixelsPerUnitX,reg.originYPx-center.dot(up)*reg.pixelsPerUnitY];if(!inside(pixel,clasp.strip.corners))continue;const dx=pixel[0]-clasp.centerPhoto[0],dy=pixel[1]-clasp.centerPhoto[1],isCap=Math.hypot(dx,dy)<clasp.radiusPhotoPx*.95,side=dx*axis2[0]+dy*axis2[1],name=isCap?'cap':side<0?'body-half':'cuff-half',bucket=buckets.get(name)!;for(const[j,p]of[a,b,c].entries()){bucket.points.push(p.x,p.y,p.z);const na=node.geometry.getAttribute('normal'),n=na?new Vector3().fromBufferAttribute(na,index.getX(t*3+j)).transformDirection(node.matrixWorld):normal;bucket.normals.push(n.x,n.y,n.z);}bucket.source.push({mesh:node.name,triangle:t,clasp:clasp.id,part:name});}
   });
   for(const[name,bucket]of buckets){if(!bucket.points.length)continue;const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(bucket.points,3));geometry.setAttribute('normal',new Float32BufferAttribute(bucket.normals,3));geometry.computeBoundingBox();const bounds=geometry.boundingBox!,center=bounds.getCenter(new Vector3()),pivot=center.clone();
    // The source half keeps its original shape; pivots are its own outer end.
    const dir=right.clone().multiplyScalar(axis2[0]).addScaledVector(up,-axis2[1]).normalize();let extreme=name==='body-half'?Infinity:-Infinity;for(let i=0;i<bucket.points.length;i+=3){const p=new Vector3(bucket.points[i],bucket.points[i+1],bucket.points[i+2]),dot=p.dot(dir);if(name==='body-half'?dot<extreme:dot>extreme){extreme=dot;pivot.copy(p);}}
    const positions=geometry.getAttribute('position');for(let i=0;i<positions.count;i++)positions.setXYZ(i,positions.getX(i)-pivot.x,positions.getY(i)-pivot.y,positions.getZ(i)-pivot.z);
    const material=new MeshStandardMaterial({color:name==='cap'?0xbec7ca:0xe4e1d8,roughness:name==='cap'?.34:.68,metalness:name==='cap'?.65:0,side:DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const mesh=new Mesh(geometry,material);mesh.name=`Original_${clasp.id}_${name}`;const group=new Group();group.position.copy(pivot);group.add(mesh);this.group.add(group);this.pieces.push({group,pivot,axis:dir.clone().cross(forward).normalize(),sign:name==='body-half'?1:-1,material});this.sourceTriangles.push(...bucket.source);this.triangles+=bucket.points.length/9;
   }
  }
 }
 setProgress(progress:number){const release=smooth((progress-.035)/.115),away=smooth((progress-.13)/.11);for(const p of this.pieces){p.group.quaternion.copy(new Quaternion().setFromAxisAngle(p.axis,p.sign*release*.5));p.group.position.copy(p.pivot).add(new Vector3(0,away*.27,release*.055+away*.32));p.material.opacity=1-away;p.material.transparent=away>0;p.material.depthWrite=away<.999;p.group.visible=away<.999;}this.group.visible=progress<.24;}
 dispose(){for(const piece of this.pieces)piece.group.traverse(node=>{if(node instanceof Mesh)node.geometry.dispose();});for(const p of this.pieces)p.material.dispose();this.group.removeFromParent();}
}
