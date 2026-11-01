import {BufferGeometry,Color,DoubleSide,Float32BufferAttribute,InstancedMesh,MeshPhysicalMaterial,Object3D} from 'three';

function petal(){
  const pos:number[]=[],indices:number[]=[],uv:number[]=[],w=8,h=9;
  for(let y=0;y<=h;y++)for(let x=0;x<=w;x++){
    const v=y/h,u=x/w*2-1,width=Math.pow(Math.sin(v*Math.PI),.56);
    pos.push(u*width*.045,(v-.5)*.115,.023*u*u+.016*Math.sin(v*Math.PI));uv.push(x/w,v);
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=y*(w+1)+x;indices.push(a,a+1,a+w+1,a+1,a+w+2,a+w+1);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export class PetalField {
  readonly mesh:InstancedMesh;
  private readonly dummy=new Object3D();
  private readonly material=new MeshPhysicalMaterial({color:0xf285b1,roughness:.7,side:DoubleSide,transparent:true,opacity:0,depthWrite:false});
  constructor(){this.mesh=new InstancedMesh(petal(),this.material,70);this.mesh.frustumCulled=false;for(let i=0;i<70;i++)this.mesh.setColorAt(i,new Color().setHSL(.92+(i%5)*.006,.52+(i%3)*.1,.54+(i%7)*.035));}
  update(time:number,opacity:number,aspect:number){
    this.mesh.visible=opacity>.001;if(!this.mesh.visible)return;this.material.opacity=opacity;
    for(let i=0;i<70;i++){
      const f=(i*.61803399)%1,depth=(i*.381966)%1;
      const x=(((f+time*(.018+depth*.016))%1)*2-1)*aspect*1.8;
      const y=1.75-((i*.417+time*(.12+depth*.08))%3.5);
      this.dummy.position.set(x+Math.sin(time*.4+i)*.1,y,depth*2.2-.6);
      this.dummy.rotation.set(time*.5+i,time*.27+i*2,time*.33+i*4);
      this.dummy.scale.setScalar(.45+depth*1.5);
      this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate=true;
  }
}
