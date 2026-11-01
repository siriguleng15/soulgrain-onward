import {BufferGeometry,Color,Float32BufferAttribute,Group,Mesh,MeshPhysicalMaterial} from 'three';

/** A small four-point reward star, not the former unrelated jade torus. */
export class NextScene {
  readonly group=new Group();
  private readonly material=new MeshPhysicalMaterial({color:new Color('#f3d257'),metalness:.55,roughness:.25,clearcoat:.6,transparent:true,opacity:0});
  constructor(){
    const p:number[]=[],outer=[[0,.065],[.018,.018],[.055,0],[.018,-.018],[0,-.065],[-.018,-.018],[-.055,0],[-.018,.018]];
    for(let i=0;i<8;i++){
      const a=outer[i],b=outer[(i+1)%8];p.push(0,0,.020,a[0],a[1],0,b[0],b[1],0);p.push(0,0,-.012,b[0],b[1],0,a[0],a[1],0);
    }
    const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(p,3));geometry.computeVertexNormals();this.group.add(new Mesh(geometry,this.material));
  }
  update(time:number,opacity:number){this.group.visible=opacity>.001;this.material.opacity=opacity;this.group.rotation.y=Math.sin(time*.6)*.55;this.group.position.set(0,0,.5);}
}
