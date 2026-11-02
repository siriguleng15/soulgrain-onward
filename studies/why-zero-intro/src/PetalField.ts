import {BufferGeometry,Color,DoubleSide,Float32BufferAttribute,InstancedMesh,MeshPhysicalMaterial,Object3D} from 'three';

/** A cupped, asymmetric petal: rounded lip and folded root, rather than a flat triangle. */
function petal(){
  const pos:number[]=[],indices:number[]=[],uv:number[]=[],w=8,h=10;
  for(let y=0;y<=h;y++)for(let x=0;x<=w;x++){
    const v=y/h,u=x/w*2-1,width=Math.pow(Math.sin(v*Math.PI),.56)*(1+.10*u);
    const lip=.007*Math.exp(-Math.pow((v-.80)/.20,2))*(1-u*u);
    pos.push(u*width*.036,(v-.5)*.083-lip,.018*u*u+.013*Math.sin(v*Math.PI)+.007*u*v);uv.push(x/w,v);
  }
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=y*(w+1)+x;indices.push(a,a+1,a+w+1,a+1,a+w+2,a+w+1);}
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export class PetalField {
  readonly mesh:InstancedMesh;
  private readonly dummy=new Object3D();
  private readonly material=new MeshPhysicalMaterial({color:0xf4a5bc,roughness:.69,side:DoubleSide,transparent:true,opacity:0,depthWrite:false});
  constructor(){
    this.mesh=new InstancedMesh(petal(),this.material,70);this.mesh.frustumCulled=false;
    for(let i=0;i<70;i++)this.mesh.setColorAt(i,new Color().setHSL(.93+(i%5)*.007,.48+(i%3)*.08,.61+(i%7)*.025));
  }
  update(time:number,opacity:number,aspect:number){
    this.mesh.visible=opacity>.001;if(!this.mesh.visible)return;this.material.opacity=opacity;
    for(let i=0;i<70;i++){
      const f=(i*.61803399)%1,depth=(i*.381966)%1;
      const x=(((f+time*(.012+depth*.012))%1)*2-1)*aspect*1.6;
      const y=1.65-((i*.417+time*(.085+depth*.07))%3.3);
      this.dummy.position.set(x+Math.sin(time*.36+i)*.15,y,depth*1.8-.65);
      this.dummy.rotation.set(time*.42+i,time*.23+i*2,time*.21+i*4);
      // Far petals stay delicate; near ones no longer obscure the fingertip interaction.
      this.dummy.scale.setScalar(.42+depth*.95);
      this.dummy.updateMatrix();this.mesh.setMatrixAt(i,this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate=true;
  }
}
