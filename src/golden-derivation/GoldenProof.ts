import {BufferGeometry,CanvasTexture,DoubleSide,Float32BufferAttribute,Group,Line,LineBasicMaterial,Matrix4,Mesh,MeshBasicMaterial,PlaneGeometry,SRGBColorSpace,SphereGeometry,Vector3} from 'three';
import {Construction,PHI,PROOF_STARTS,ARC_START,ARC_END,goldenArcs,phase,pathOf,proofState} from './construction.ts';
import {DrawPath} from './DrawPath.ts';

/** Ruler/compass construction on the same 3D plane as the shoe's two anchors.
 * Labels are geometry, never a screen-space image of a finished diagram. */
export class GoldenProof {
 readonly root=new Group();readonly lines:DrawPath[]=[];readonly textures:CanvasTexture[]=[];
 private groups:{root:Group;unit:DrawPath;diagonal:DrawPath;extension:DrawPath;compass:DrawPath;rectangle:DrawPath;cuts:DrawPath[];squares:DrawPath[];dimensions:DrawPath[];labels:Mesh[];radii:Mesh[];m:Mesh;o:Mesh;radius:Line;highlight:Mesh}[]=[];
 constructor(readonly c:Construction){
  for(let k=0;k<2;k++){
   const root=new Group();this.root.add(root);
   const color=k?'#c5a4ff':'#efbd63';
   const map=(x:number,y:number)=>c.local(x,y,k===1).add(new Vector3(0,0,.004));
   const draw=(points:Vector3[],width=1.5,col=color)=>{const line=new DrawPath(pathOf(points),col,width).attach(root);this.lines.push(line);return line;};
   const label=(text:string,x:number,y:number,width=.12)=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#101b27';ctx.fillRect(0,0,512,128);ctx.font='600 68px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=k?'#d0bfff':'#f2cb86';ctx.fillText(text,256,65);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;this.textures.push(texture);
    const mesh=new Mesh(new PlaneGeometry(width,width*128/512),new MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:DoubleSide,toneMapped:false}));
    mesh.position.copy(map(x,y)).add(new Vector3(0,0,.004));
    // Keep text upright for the construction overview, including the mirrored group.
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(c.e,c.v.clone().negate(),new Vector3().crossVectors(c.e,c.v.clone().negate())));
    root.add(mesh);return mesh;
   };
   const unit=draw([map(0,0),map(1,0),map(1,1),map(0,1),map(0,0)],2);
   const diagonal=draw([map(.5,1),map(1,0)],2,'#61d8e6');
   const extension=draw([map(1,1),map(PHI,1)],2);
   const angle=Math.atan2(-1,.5),d=Math.sqrt(5)/2;
   const compass=draw(Array.from({length:81},(_,i)=>map(.5+d*Math.cos(angle*(1-i/80)),1+d*Math.sin(angle*(1-i/80)))),1.8,'#61d8e6');
   const rectangle=draw([map(0,0),map(PHI,0),map(PHI,1),map(0,1),map(0,0)],1.7);
   const dimensions:DrawPath[]=[];
   for(const [x0,y0,x1,y1] of [[0,-.11,PHI,-.11],[0,1.13,1,1.13],[1,1.13,PHI,1.13],[-.12,0,-.12,1]]){
    dimensions.push(draw([map(x0,y0),map(x1,y1)],1));
    const horizontal=y0===y1;
    for(const[x,y]of[[x0,y0],[x1,y1]])dimensions.push(draw(horizontal?[map(x,y-.025),map(x,y+.025)]:[map(x-.025,y),map(x+.025,y)],1));
   }
   const labels=[label('1.618 = φ',PHI/2,-.17,.17),label('1.000',.5,1.20),label('0.618',1+(PHI-1)/2,1.20),label('1.000',-.28,.5,.10),label('M',.5,1.07,.06),label('√5 / 2',.82,.49,.14)];
   const arcs=goldenArcs(),cuts:DrawPath[]=[],squares:DrawPath[]=[],radii:Mesh[]=[];
   for(let i=0;i<arcs.length;i++){
    const [x,y,s]=arcs[i].square;
    squares.push(draw([map(x,y),map(x+s,y),map(x+s,y+s),map(x,y+s),map(x,y)],1.25));
    // Only the NEW dividing edge is drawn on each recursive step.
    const edge=i%4===0?[map(x+s,y),map(x+s,y+s)]:i%4===1?[map(x,y),map(x+s,y)]:i%4===2?[map(x,y),map(x,y+s)]:[map(x,y+s),map(x+s,y+s)];
    cuts.push(draw(edge,2.1));
    radii.push(label(`r${i}=${s.toFixed(3)}`,x+s*.5,y+s*.53,Math.min(.13,s*c.height*.8)));
   }
   const marker=(col:string)=>{const m=new Mesh(new SphereGeometry(.0035,12,8),new MeshBasicMaterial({color:col}));root.add(m);return m;};
   const m=marker('#8fe4da');m.position.copy(map(.5,1));const o=marker(color);
   const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(new Float32Array(6),3));
   const radius=new Line(geometry,new LineBasicMaterial({color:'#61d8e6',transparent:true,opacity:1,depthWrite:false}));root.add(radius);
   const highlight=new Mesh(new PlaneGeometry(1,1),new MeshBasicMaterial({color,transparent:true,opacity:.13,depthWrite:false,side:DoubleSide}));root.add(highlight);
   highlight.quaternion.copy(labels[0].quaternion);
   this.groups.push({root,unit,diagonal,extension,compass,rectangle,cuts,squares,dimensions,labels,radii,m,o,radius,highlight});
  }
 }
 update(t:number){
  const c=this.c,arcs=goldenArcs();
  this.groups.forEach((g,k)=>{
   const local=t-PROOF_STARTS[k],current=proofState(t),active=current.group===k&&local<24;
   g.root.visible=local>0;
   g.unit.set(phase(local,0,.8),local<5?.95:.22);
   g.diagonal.set(phase(local,.9,1.6),local<3.7?.9:0);
   g.compass.set(phase(local,1.7,2.7),local<4?.6:0);
   g.extension.set(phase(local,2,2.8),local<5?.9:0);
   g.rectangle.set(phase(local,2.7,3.7),active?.95:.32);
   g.dimensions.forEach(d=>d.set(phase(local,3.4,4.3),active&&local<13?.85:.20));
   g.labels.forEach((m,i)=>{m.visible=i<4?active&&local>=3.7&&local<13:active&&local>=.9&&local<3.7;});
   g.m.visible=local>=.9&&local<3.7;
   const tracing=active&&local>=ARC_START&&local<ARC_END;
   const index=tracing?current.arcIndex:current.cutIndex;
   for(let i=0;i<arcs.length;i++){
    const elapsed=local-(5+i);
    g.cuts[i].set(phase(elapsed,.15,.8),active?.85:.18);
    g.squares[i].set(phase(elapsed,0,.45),active&&i===index?.55:0);
    g.radii[i].visible=active&&local>=5&&local<13&&i<=index&&i<4;
   }
   g.highlight.visible=active&&local>=5&&local<ARC_END;
   const a=arcs[index],[x,y,s]=a.square;
   g.highlight.position.copy(c.local(x+s/2,y+s/2,k===1)).add(new Vector3(0,0,.002));g.highlight.scale.set(s*c.height,s*c.height,1);
   const seed=active&&local>=1.7&&local<2.7;g.o.visible=tracing;g.radius.visible=tracing||seed;
   if(tracing||seed){
    const center=c.local(seed?.5:a.center.x,seed?1:a.center.y,k===1).add(new Vector3(0,0,.008));
    const angle=seed?Math.atan2(-1,.5)*(1-phase(local,1.7,2.7)):a.a+(a.b-a.a)*current.arcFraction;
    const tip=c.local((seed?.5:a.center.x)+Math.cos(angle)*(seed?Math.sqrt(5)/2:a.radius),(seed?1:a.center.y)+Math.sin(angle)*(seed?Math.sqrt(5)/2:a.radius),k===1).add(new Vector3(0,0,.008));
    g.o.position.copy(center);const attr=g.radius.geometry.getAttribute('position');attr.setXYZ(0,center.x,center.y,center.z);attr.setXYZ(1,tip.x,tip.y,tip.z);attr.needsUpdate=true;g.radius.geometry.computeBoundingSphere();
   }
  });
 }
 resize(w:number,h:number){this.lines.forEach(l=>l.resize(w,h));}
 dispose(){this.groups.forEach(g=>{g.radius.geometry.dispose();(Array.isArray(g.radius.material)?g.radius.material:[g.radius.material]).forEach(m=>m.dispose());});this.lines.forEach(l=>l.dispose());this.textures.forEach(t=>t.dispose());}
}
