import {Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import type {MotionPath} from './Path.ts';
import {HeelSurface,normalize} from './Surface.ts';
import type {Pose} from './Surface.ts';
import type {Parameters} from './motion.ts';
/** Advertising-only clones. The real source meshes, materials and UVs remain intact. */
export class HeelActor {
 readonly group=new Group();readonly surface:HeelSurface;
 private copies:{source:Mesh;mesh:Mesh;rest:Vector3[];map:{s:number;v:number;offset:Vector3;offsetB:number;offsetN:number;offsetT:number}[]}[]=[];
 maxRestError=0;readonly restError:number;
 constructor(readonly panel:Mesh,readonly sewing:Mesh){
  this.surface=new HeelSurface(panel);this.restError=this.surface.exactVertexError();
  for(const source of[panel,sewing]){
   const derived=this.surface.clone(source),material=(source.material as MeshStandardMaterial).clone(),mesh=new Mesh(derived.geometry,material);
   const map=derived.map.map(m=>{const b=new Vector3(0,0,-1),n=this.surface.sample(m.s,m.v,new Vector3(),true),t=new Vector3().crossVectors(n,b).normalize();return{...m,offsetB:m.offset.dot(b),offsetN:m.offset.dot(n),offsetT:m.offset.dot(t)};});
   mesh.name=source.name+'_Lab_Derived';mesh.frustumCulled=false;this.group.add(mesh);this.copies.push({source,mesh,rest:derived.rest,map});
  }
 }
 update(path:MotionPath,pose:Pose,params:Parameters){
  const r=pose.release,active=r>1e-8;this.group.visible=active;this.panel.visible=this.sewing.visible=!active;
  this.maxRestError=0;if(!active){for(const copy of this.copies){const a=copy.mesh.geometry.getAttribute('position');for(let i=0;i<a.count;i++){const p=copy.rest[i].clone().applyMatrix4(pose.matrix);a.setXYZ(i,p.x,p.y,p.z);this.maxRestError=Math.max(this.maxRestError,p.distanceTo(new Vector3().fromBufferAttribute(a,i)));}a.needsUpdate=true;}return;}
  for(const copy of this.copies){const positions=copy.mesh.geometry.getAttribute('position');
   for(let i=0;i<positions.count;i++){
    const map=copy.map[i],rest=copy.rest[i].clone().applyMatrix4(pose.matrix),frame=path.at(path.restLength*map.s);
    const base=frame.point.clone().addScaledVector(frame.b,params.width*(map.v-.5));
    // Sewing gets the same surface field, including its source surface offset.
    if(copy.source===this.sewing){
     const tn=new Vector3().crossVectors(frame.b,frame.n).normalize();
     base.addScaledVector(frame.b,map.offsetB).addScaledVector(frame.n,-map.offsetN).addScaledVector(tn,map.offsetT);
    }
    // Width direction in the source is -Z. Smoothly change the actual surface, not UVs.
    const p=rest.lerp(base,r);p.toArray(positions.array as Float32Array,i*3);
   }
   positions.needsUpdate=true;copy.mesh.geometry.computeVertexNormals();
  }
 }
 sourcePoint(source:Mesh,index:number){return normalize(new Vector3().fromBufferAttribute(source.geometry.getAttribute('position'),index));}
 edge(path:MotionPath,pose:Pose,params:Parameters,v:number){const rest=this.surface.sample(1,v).applyMatrix4(pose.matrix),frame=path.at(path.restLength),motion=frame.point.clone().addScaledVector(frame.b,params.width*(v-.5));return rest.lerp(motion,pose.release);}
 getState(){return{originalPanelVisible:this.panel.visible,originalSewingVisible:this.sewing.visible,derivedVisible:this.group.visible,exactRestSurfaceError:this.restError,maxRestError:this.maxRestError};}
 dispose(){for(const c of this.copies){c.mesh.geometry.dispose();(c.mesh.material as MeshStandardMaterial).dispose();}}
}
