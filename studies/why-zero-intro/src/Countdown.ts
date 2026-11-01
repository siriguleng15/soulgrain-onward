import {BufferGeometry,CanvasTexture,DoubleSide,Float32BufferAttribute,Group,Mesh,ShaderMaterial,Vector3} from 'three';
import {noise} from './shaders.ts';

const vertex=`attribute vec3 aCenter,aSeed;uniform float uBreak,uWord;varying vec2 vUv;varying float vDissolve;void main(){
  vUv=uv;vec3 p=position,local=p-aCenter;
  float t=max(0.,uBreak-aSeed.x*.28)/.72;
  float angle=t*(aSeed.y-.5)*4.;mat2 r=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  local.xy=r*local.xy;local*=1.-min(.6,t*.4);
  p=aCenter+local+vec3((aSeed.x-.5)*.24,(aSeed.y-.5)*.20,aSeed.z*.12)*t*t;
  vDissolve=t;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`;
const fragment=`uniform sampler2D uAtlas;uniform float uDigit,uBreak,uAlpha,uWord;varying vec2 vUv;varying float vDissolve;${noise}
void main(){
  vec2 uv=vUv;
  uv+=(vec2(fbm(uv*15.),fbm(uv*15.+9.))-.5)*.04*uWord;
  float a=texture2D(uAtlas,vec2((uv.x+uDigit)/14.,uv.y)).a;
  float erosion=fbm(uv*43.+uDigit*11.);
  a*=uWord>0.?smoothstep(.22,.43,erosion):1.;
  a*=1.-smoothstep(.25,1.,vDissolve+erosion*.3);
  a*=uAlpha;
  if(a<.015)discard;
  gl_FragColor=vec4(1.,1.,1.,a);
}`;

function geometry(){
  const pos:number[]=[],uv:number[]=[],centers:number[]=[],seeds:number[]=[],nx=20,ny=26;
  let seed=12;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)for(const tri of [[[0,0],[1,0],[1,1]],[[0,0],[1,1],[0,1]]]){
    const c=new Vector3();
    for(const [a,b] of tri)c.add(new Vector3((x+a)/nx-.5,(y+b)/ny-.5,0).multiplyScalar(1/3));
    const s=[random(),random(),random()];
    for(const [a,b] of tri){pos.push((x+a)/nx-.5,(y+b)/ny-.5,0);uv.push((x+a)/nx,(y+b)/ny);centers.push(...c.toArray());seeds.push(...s);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(pos,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setAttribute('aCenter',new Float32BufferAttribute(centers,3));g.setAttribute('aSeed',new Float32BufferAttribute(seeds,3));return g;
}

export class Countdown {
  readonly group=new Group();
  private readonly digits=new Group();
  private readonly word=new Group();
  private readonly materials:ShaderMaterial[]=[];
  private readonly canvas=document.createElement('canvas');
  private readonly texture:CanvasTexture;

  constructor(){
    this.canvas.width=3584;this.canvas.height=384;
    this.texture=new CanvasTexture(this.canvas);this.refreshAtlas();
    this.group.add(this.digits,this.word);
    for(let i=0;i<6;i++){
      const isWord=i>=2,m=new ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,transparent:true,depthWrite:false,depthTest:false,side:DoubleSide,uniforms:{uAtlas:{value:this.texture},uDigit:{value:isWord?10+i-2:9},uBreak:{value:0},uAlpha:{value:1},uWord:{value:isWord?1:0}}});
      this.materials.push(m);
      const mesh=new Mesh(geometry(),m);mesh.frustumCulled=false;
      mesh.position.x=isWord?(i-2)*.54:(i-.5)*.56;
      mesh.scale.set(.70,1.10,1);(isWord?this.word:this.digits).add(mesh);
    }
    this.word.position.x=-.28;this.word.scale.setScalar(1.4);
  }
  refreshAtlas(){
    const c=this.canvas.getContext('2d')!;c.clearRect(0,0,this.canvas.width,this.canvas.height);c.fillStyle='white';c.font='800 330px "Zero Sans",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';
    for(const [i,char] of [...'0123456789ZERO'].entries())c.fillText(char,i*256+128,202,252);
    if(this.texture)this.texture.needsUpdate=true;
  }
  update(number:number,shatter:number,time:number,aspect:number,guideAge:number){
    const n=Math.max(0,Math.min(99,Math.ceil(number)));
    this.materials[0].uniforms.uDigit.value=Math.floor(n/10);this.materials[1].uniforms.uDigit.value=n%10;
    this.digits.visible=shatter<.75;this.word.visible=shatter>.12&&guideAge<1.6;
    for(let i=0;i<6;i++){
      const m=this.materials[i],word=i>=2;
      m.uniforms.uBreak.value=word?Math.max(0,guideAge-.3)/1.4:shatter;
      m.uniforms.uAlpha.value=word?Math.min(1,Math.max(0,(shatter-.12)*4)):1;
    }
    this.group.visible=guideAge<1.8;
    this.group.scale.setScalar(aspect>.9?.36:.28);
    this.group.position.set(-aspect+(aspect>.9?.275:.23),-.83,.1);
  }
  dispose(){this.texture.dispose();this.group.traverse(n=>{if(n instanceof Mesh)n.geometry.dispose();});for(const m of this.materials)m.dispose();}
}
