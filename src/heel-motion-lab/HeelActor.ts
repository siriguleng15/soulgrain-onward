import {BufferAttribute,DynamicDrawUsage,Group,Mesh,MeshStandardMaterial,Vector3} from 'three';
import {HeelSurface,normalize} from './Surface.ts';
import type {Pose} from './Surface.ts';
/** Advertising-only clones. The real source meshes, materials and UVs remain intact. */
export class HeelActor {
 readonly group=new Group();readonly surface:HeelSurface;
 private copies:{source:Mesh;mesh:Mesh;rest:Vector3[];normals:Vector3[]}[]=[];
 maxRestError=0;readonly restError:number;
 constructor(readonly panel:Mesh,readonly sewing:Mesh){
  this.surface=new HeelSurface(panel);this.restError=this.surface.exactVertexError();
  for(const source of[panel,sewing]){
   const derived=this.surface.clone(source),material=(source.material as MeshStandardMaterial).clone(),mesh=new Mesh(derived.geometry,material);
   const normal=source.geometry.getAttribute('normal'),normals=Array.from({length:normal.count},(_,i)=>new Vector3().fromBufferAttribute(normal,i));
   (mesh.geometry.getAttribute('normal') as BufferAttribute).setUsage(DynamicDrawUsage);
   mesh.name=source.name+'_Lab_Derived';mesh.frustumCulled=false;this.group.add(mesh);this.copies.push({source,mesh,rest:derived.rest,normals});
  }
 }
 update(pose:Pose){
  const active=pose.release>1e-8;this.group.visible=active;this.panel.visible=this.sewing.visible=!active;this.maxRestError=0;
  // Keep the real leather and its sewing on the exact source surface. Only
  // the independent red extension grows; the product does not cock up first.
  for(const copy of this.copies){const positions=copy.mesh.geometry.getAttribute('position'),normals=copy.mesh.geometry.getAttribute('normal');
   for(let i=0;i<positions.count;i++){
    const point=copy.rest[i].clone().applyMatrix4(pose.matrix),normal=copy.normals[i].clone().applyQuaternion(pose.quaternion);
    positions.setXYZ(i,point.x,point.y,point.z);normals.setXYZ(i,normal.x,normal.y,normal.z);
    this.maxRestError=Math.max(this.maxRestError,point.distanceTo(new Vector3().fromBufferAttribute(positions,i)));
   }
   positions.needsUpdate=true;normals.needsUpdate=true;
  }
 }
 sourcePoint(source:Mesh,index:number){return normalize(new Vector3().fromBufferAttribute(source.geometry.getAttribute('position'),index));}
 edge(pose:Pose,v:number){return this.surface.sample(0,v).applyMatrix4(pose.matrix);}
 getState(){return{surfaceMode:'source-locked-flow',originalPanelVisible:this.panel.visible,originalSewingVisible:this.sewing.visible,derivedVisible:this.group.visible,exactRestSurfaceError:this.restError,maxRestError:this.maxRestError};}
 dispose(){for(const c of this.copies){c.mesh.geometry.dispose();(c.mesh.material as MeshStandardMaterial).dispose();}}
}
