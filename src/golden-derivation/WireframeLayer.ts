import {DoubleSide,Material,Mesh,MeshBasicMaterial} from 'three';
/** Same source positions and indices, separate runtime material/mesh only. */
export class WireframeLayer {
 readonly material=new MeshBasicMaterial({color:'#f2f5ff',wireframe:true,side:DoubleSide,transparent:true,opacity:0,depthTest:false,depthWrite:false,toneMapped:false});
 readonly display:Mesh[]=[];
 private originals:{mesh:Mesh;material:Material|Material[]}[]=[];
 private clones=new Map<Material,Material>();
 private initial=new Map<Material,{opacity:number;transparent:boolean;depthWrite:boolean;visible:boolean}>();
 amount=0;
 constructor(readonly source:Mesh[]){
  this.material.name='SOUL_RUNTIME_WIREFRAME_ONLY';
  for(const mesh of source){
   this.originals.push({mesh,material:mesh.material});
   const copy=(m:Material)=>{
    if(!this.clones.has(m)){const c=m.clone();this.clones.set(m,c);this.initial.set(c,{opacity:c.opacity,transparent:c.transparent,depthWrite:c.depthWrite,visible:c.visible});}
    return this.clones.get(m)!;
   };
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(copy):copy(mesh.material);
   const wire=new Mesh(mesh.geometry,this.material);wire.name='SOUL_DISPLAY_ONLY_WIRE';wire.userData.soulDisplayOnly=true;wire.frustumCulled=mesh.frustumCulled;wire.renderOrder=1;wire.visible=false;mesh.add(wire);this.display.push(wire);
  }
 }
 set(amount:number,opacity=.08){
  this.amount=Math.max(0,Math.min(1,amount));
  for(const [material,base]of this.initial){
   const transparent=this.amount>0?true:base.transparent;
   if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
   material.opacity=base.opacity*(1-this.amount);material.visible=base.visible&&this.amount<1;material.depthWrite=this.amount===0?base.depthWrite:false;
  }
  this.material.opacity=opacity*this.amount;for(const wire of this.display)wire.visible=this.amount>0;
 }
 snapshot(){return{amount:this.amount,lineOpacity:this.material.opacity,sourceMeshes:this.source.length,displayMeshes:this.display.length,sharedSourceGeometry:this.display.every((m,i)=>m.geometry===this.source[i].geometry),sourceTriangles:this.source.reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.getAttribute('position').count)/3,0)};}
 dispose(){for(const wire of this.display)wire.removeFromParent();for(const row of this.originals)row.mesh.material=row.material;for(const m of this.clones.values())m.dispose();this.material.dispose();}
}
