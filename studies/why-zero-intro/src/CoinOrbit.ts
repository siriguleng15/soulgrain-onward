import {CanvasTexture,CircleGeometry,DoubleSide,Group,LatheGeometry,Mesh,MeshBasicMaterial,MeshPhysicalMaterial,SRGBColorSpace,Vector2} from 'three';

/** Independently drawn glyphs on real discs; rounded rims catch the softbox light. */
export class CoinOrbit {
  readonly group=new Group();
  private readonly coins:Group[]=[];
  private readonly materials:(MeshBasicMaterial|MeshPhysicalMaterial)[]=[];
  constructor(){
    const rim=new LatheGeometry([
      new Vector2(0,-.011),new Vector2(.121,-.011),new Vector2(.129,-.009),
      new Vector2(.133,-.004),new Vector2(.133,.004),new Vector2(.129,.009),
      new Vector2(.121,.011),new Vector2(0,.011),
    ],64);
    for(let i=0;i<6;i++){
      const c=document.createElement('canvas');c.width=c.height=256;
      const ctx=c.getContext('2d')!;ctx.clearRect(0,0,256,256);ctx.fillStyle=['#88712c','#308665','#1c3043','#ad3030','#384b31','#41808b'][i];
      ctx.font=(i===2?'italic ':'')+'bold 142px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
      if(i===1){for(let y=0;y<2;y++)for(let x=0;x<2;x++)ctx.fillRect(62+x*70,62+y*70,60,60);}
      else if(i===4){ctx.beginPath();ctx.ellipse(128,143,58,66,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(145,54);ctx.rotate(.5);ctx.beginPath();ctx.ellipse(0,0,13,26,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(187,110,22,0,Math.PI*2);ctx.fill();}
      else ctx.fillText(['G','','∞','T','','a'][i],128,137);
      const texture=new CanvasTexture(c);texture.colorSpace=SRGBColorSpace;
      const icon=new MeshBasicMaterial({map:texture,transparent:true,side:DoubleSide,depthWrite:false});
      const shell=new MeshPhysicalMaterial({color:0xf8f7f0,roughness:.28,metalness:.025,clearcoat:.3,transparent:true,opacity:0});
      this.materials.push(shell,icon);
      const coin=new Group(),disc=new Mesh(rim,shell);disc.rotation.x=Math.PI/2;
      const face=new Mesh(new CircleGeometry(.111,48),icon);face.position.z=.0116;
      const back=face.clone();back.position.z=-.0116;back.rotation.y=Math.PI;
      coin.add(disc,face,back);this.group.add(coin);this.coins.push(coin);
    }
  }
  update(time:number,opacity:number,x:number,y:number,aspect:number){
    this.group.visible=opacity>.001;
    for(let i=0;i<6;i++){
      const angle=time*.24+i*Math.PI/3;
      const coin=this.coins[i];
      // The ring occupies the lower-left wrist space, leaving the open palm readable.
      const orbitX=Math.cos(angle)*.67,orbitY=Math.sin(angle)*.63;
      coin.position.set(x-.12+(orbitX*.93+orbitY*.18)*Math.min(1,aspect),y-.20+orbitY*.94-orbitX*.16,Math.sin(angle+.6)*.34+.10);
      coin.rotation.set(Math.sin(angle+.8)*1.03,Math.cos(angle-.3)*.78,time*.10+i*.63);
      coin.scale.setScalar(.82+Math.sin(angle+.6)*.13);
    }
    for(const m of this.materials)m.opacity=opacity;
  }
  state(){return{visible:this.group.visible,positions:this.coins.map(c=>c.position.toArray())};}
}
