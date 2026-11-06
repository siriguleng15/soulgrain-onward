import {BufferAttribute,BufferGeometry,DynamicDrawUsage,Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import type {Parameters,Mode} from './motion.ts';
import type {MotionPath} from './Path.ts';
import {smooth} from './motion.ts';
/** Both debug modes share the very same vertex buffers and center path. */
export class Ribbon {
 readonly group=new Group();readonly solid:Mesh;readonly outline:Mesh;
 readonly geometry=new BufferGeometry();readonly outlineGeometry=new BufferGeometry();
 readonly material=new MeshStandardMaterial({color:0xb8192c,roughness:.36,metalness:.06});
 readonly segments=300;readonly across=12;readonly centers:Vector3[]=[];
 private positions:Float32Array;private normals:Float32Array;private uvs:Float32Array;
 mode:Mode='solid-ribbon';
 constructor(){
  const rows=this.segments+1,cols=this.across+1;this.positions=new Float32Array(rows*cols*2*3);this.normals=new Float32Array(this.positions.length);this.uvs=new Float32Array(rows*cols*2*2);
  const position=new BufferAttribute(this.positions,3).setUsage(DynamicDrawUsage),normal=new BufferAttribute(this.normals,3).setUsage(DynamicDrawUsage);
  const uv=new BufferAttribute(this.uvs,2).setUsage(DynamicDrawUsage);
  for(const g of[this.geometry,this.outlineGeometry]){g.setAttribute('position',position);g.setAttribute('normal',normal);g.setAttribute('uv',uv);}
  const indices:number[]=[],outline:number[]=[];
  const quad=(a:number,b:number,c:number,d:number,edge:boolean)=>{indices.push(a,b,c,b,d,c);if(edge)outline.push(a,b,c,b,d,c);};
  const layer=rows*cols;
  for(let i=0;i<this.segments;i++)for(let j=0;j<this.across;j++){
   const a=i*cols+j,b=a+cols,edge=j===0||j===this.across-1||i===0||i===this.segments-1;
   quad(a,a+1,b,b+1,edge);quad(a+layer,b+layer,a+layer+1,b+layer+1,edge);
  }
  for(let i=0;i<this.segments;i++)for(const j of[0,this.across]){const a=i*cols+j,b=a+cols;if(j===0)quad(a,b,a+layer,b+layer,true);else quad(a,a+layer,b,b+layer,true);}
  for(let j=0;j<this.across;j++){quad(j,j+layer,j+1,j+1+layer,true);const a=this.segments*cols+j;quad(a,a+1,a+layer,a+1+layer,true);}
  this.geometry.setIndex(indices);this.outlineGeometry.setIndex(outline);
  this.solid=new Mesh(this.geometry,this.material);this.outline=new Mesh(this.outlineGeometry,this.material);
  for(const m of[this.solid,this.outline]){m.castShadow=false;m.frustumCulled=false;}
  this.group.add(this.solid,this.outline);this.setMode(this.mode);
 }
 setMode(mode:Mode){this.mode=mode;this.solid.visible=mode==='solid-ribbon';this.outline.visible=!this.solid.visible;}
 update(path:MotionPath,params:Parameters,release:number,startEdge:(v:number)=>Vector3){
  const start=path.restLength,length=Math.max(0,path.tipLength-start);this.group.visible=length>.00005&&release>.000001;this.centers.length=0;
  if(!this.group.visible)return;
  const rows=this.segments+1,cols=this.across+1,layer=rows*cols,first=path.at(start);
  const offsets=Array.from({length:cols},(_,j)=>startEdge(j/this.across).sub(first.point.clone().addScaledVector(first.b,params.width*(j/this.across-.5))));
  for(let i=0;i<=this.segments;i++){
   const distance=length*i/this.segments,f=path.at(start+distance),join=Math.exp(-distance*7);this.centers.push(f.point.clone().addScaledVector(offsets[this.across/2],join));
   // A very short emerging strip stays thin; it cannot pop up as a thick cap.
   const h=params.thickness*smooth(distance/Math.max(.12,params.thickness*6));
   for(let j=0;j<=this.across;j++)for(let side=0;side<2;side++){
    const p=f.point.clone().addScaledVector(f.b,params.width*(j/this.across-.5)).addScaledVector(f.n,(side?1:-1)*h/2).addScaledVector(offsets[j],join);
    p.toArray(this.positions,((i*cols+j)+side*layer)*3);
    // Arc length in width units, anchored to the heel rather than normalized
    // to the growing tip. Artwork transforms account for the source aspect.
    const uvIndex=((i*cols+j)+side*layer)*2;this.uvs[uvIndex]=j/this.across;this.uvs[uvIndex+1]=distance/params.width;
   }
  }
  this.geometry.getAttribute('position').needsUpdate=true;this.geometry.getAttribute('uv').needsUpdate=true;this.geometry.computeVertexNormals();
 }
 stats(){return{mode:this.mode,sharedVertexBuffers:this.geometry.getAttribute('position')===this.outlineGeometry.getAttribute('position'),vertices:this.positions.length/3,solidTriangles:this.geometry.index!.count/3,outlineTriangles:this.outlineGeometry.index!.count/3,tip:this.centers.at(-1)?.toArray()??null};}
 dispose(){this.geometry.dispose();this.outlineGeometry.dispose();this.material.dispose();}
}
