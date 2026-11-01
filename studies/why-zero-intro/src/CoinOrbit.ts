import {CanvasTexture,CircleGeometry,CylinderGeometry,DoubleSide,Group,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,SRGBColorSpace} from 'three';

/** Original small vector glyphs on genuine, bevel-edged three-dimensional discs. */
export class CoinOrbit {
  readonly group=new Group();
  private readonly coins:Group[]=[];
  private readonly materials:(MeshBasicMaterial|MeshPhysicalMaterial)[]=[];
  constructor(){
    for(let i=0;i<6;i++){
      const c=document.createElement('canvas');c.width=c.height=256;
      const ctx=c.getContext('2d')!;ctx.clearRect(0,0,256,256);ctx.fillStyle=['#88712c','#308665','#1c3043','#ad3030','#384b31','#41808b'][i];
      ctx.font=(i===2?'italic ':'')+'bold 142px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      if(i===1){for(let y=0;y<2;y++)for(let x=0;x<2;x++)ctx.fillRect(62+x*70,62+y*70,60,60);}
      else if(i===4){ctx.beginPath();ctx.ellipse(128,143,58,66,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(145,54);ctx.rotate(.5);ctx.beginPath();ctx.ellipse(0,0,13,26,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(187,110,22,0,Math.PI*2);ctx.fill();}
      else ctx.fillText(['G','','∞','T','','a'][i],128,137);
      const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;
      const icon=new MeshBasicMaterial({map:texture,transparent:true,side:DoubleSide,depthWrite:false});
      const shell=new MeshPhysicalMaterial({color:0xf8f7f0,roughness:.25,metalness:.08,clearcoat:.5,transparent:true,opacity:0});
      this.materials.push(shell,icon);
      const coin=new Group(),disc=new Mesh(new CylinderGeometry(.105,.105,.015,48,1),shell);
      disc.rotation.x=Math.PI/2;
      const face=new Mesh(new CircleGeometry(.086,48),icon);face.position.z=.008;
      coin.add(disc,face);this.group.add(coin);this.coins.push(coin);
    }
  }
  update(time:number,opacity:number,x:number,y:number,aspect:number){
    this.group.visible=opacity>.001;
    for(let i=0;i<6;i++){
      const angle=time*.32+i*Math.PI/3,r=.65;
      const coin=this.coins[i];
      coin.position.set(x+Math.cos(angle)*r*Math.min(1,aspect),y+Math.sin(angle)*r*.78,Math.sin(angle)*.35+.15);
      coin.rotation.set(Math.sin(angle)*.65,Math.cos(angle)*.65,time*.12+i*.5);
      coin.scale.setScalar(.75+Math.sin(angle)*.12);
    }
    for(const m of this.materials)m.opacity=opacity;
  }
  state(){return{visible:this.group.visible,positions:this.coins.map(c=>c.position.toArray())};}
}
