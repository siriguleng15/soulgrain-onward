import {BoxGeometry,BufferGeometry,CanvasTexture,Color,CylinderGeometry,DoubleSide,Float32BufferAttribute,Group,InstancedMesh,LatheGeometry,Mesh,MeshStandardMaterial,Object3D,PlaneGeometry,ShaderMaterial,SRGBColorSpace,TorusGeometry,UnsignedByteType,Vector2} from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const hash=(x:number)=>{const r=Math.sin(x*127.1+31.7)*43758.5453;return r-Math.floor(r);};
const wave=(x:number,z:number)=>Math.sin(x*.71+z*.53)*.55+Math.sin(x*1.73-z*.81)*.25+Math.sin(x*3.1+z*2.3)*.12;

/** Independent scene geometry. No screenshot, original-site model or copied texture is used. */
export class GardenEnvironment {
  readonly group=new Group();
  readonly pond:Reflector;
  private readonly materials:MeshStandardMaterial[]=[];
  private readonly flowers:InstancedMesh;
  private readonly flowerMaterial:MeshStandardMaterial;
  private readonly flowerTexture:CanvasTexture;
  private readonly flowerTime={value:0};
  private readonly waterTime={value:0};
  private readonly waterHold={value:0};
  private readonly waterAlpha={value:0};
  private readonly dummy=new Object3D();

  constructor(){
    this.group.name='Original procedural meadow / pond / fluted columns';
    this.group.visible=false;
    const terrain=new MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0,transparent:true,opacity:0});
    this.materials.push(terrain);
    const ground=new Mesh(this.terrain(),terrain);ground.name='Continuous meadow and recessed pond bed';
    this.group.add(ground);

    const stone=new MeshStandardMaterial({color:0xd9d7c7,roughness:.78,metalness:0,transparent:true,opacity:0});
    this.materials.push(stone);
    stone.onBeforeCompile=s=>{
      s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vMarble;');
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMarble=position;');
      s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vMarble;');
      s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        float grain=sin(vMarble.x*111.+sin(vMarble.y*32.)*3.)*sin(vMarble.y*175.+vMarble.z*93.);
        float vein=pow(.5+.5*sin(vMarble.y*18.+vMarble.x*31.+sin(vMarble.z*20.)*2.),12.);
        diffuseColor.rgb*=.94+.045*grain-.075*vein;
      `);
    };
    stone.customProgramCacheKey=()=> 'original-garden-marble-v4';
    const columnGeometry=this.column();
    for(const [x,z,tilt]of [[-1.59,-4.8,.055],[1.43,-4.8,-.055]]){
      const column=new Mesh(columnGeometry,stone);column.position.set(x,-.90,z);column.scale.setScalar(.83);column.rotation.z=tilt;column.name='Fluted column with layered acanthus capital';this.group.add(column);
    }

    this.flowerTexture=this.flowerAtlas();
    this.flowerMaterial=new MeshStandardMaterial({map:this.flowerTexture,alphaTest:.27,side:DoubleSide,roughness:.88,metalness:0,transparent:true,opacity:0,depthWrite:true});
    this.materials.push(this.flowerMaterial);
    this.flowerMaterial.onBeforeCompile=s=>{
      s.uniforms.uGardenTime=this.flowerTime;
      s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uGardenTime;');
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        float phase=instanceMatrix[3].x*2.1+instanceMatrix[3].z*1.3;
        transformed.x+=sin(uGardenTime*.55+phase)*.06*uv.y*uv.y;
        transformed.z+=cos(uGardenTime*.43+phase)*.022*uv.y*uv.y;
      `);
    };
    this.flowerMaterial.customProgramCacheKey=()=> 'original-garden-flowers-v4';
    // Two intersecting cards give each clump actual depth without thousands of draw calls.
    const a=new PlaneGeometry(.32,.44,1,4);a.translate(0,.22,0);
    const b=a.clone();b.rotateY(Math.PI*.5);
    const flowerGeometry=mergeGeometries([a,b])!;a.dispose();b.dispose();
    const count=3000;
    this.flowers=new InstancedMesh(flowerGeometry,this.flowerMaterial,count);this.flowers.name='3000 original seeded meadow clumps';this.flowers.frustumCulled=false;
    for(let i=0;i<count;i++){
      const x=(hash(i*6.11)-.5)*22,z=-.2-hash(i*9.2+1)*17;
      const pond=((x-.18)/3.8)**2+((z+2.55)/2.12)**2;
      // Keep the actual water surface unobstructed. Concentrate pink/purple beds behind it.
      const water=pond<1.08&&z>-4.7;
      const s=water?0:.35+hash(i*2.7)*.7;
      this.dummy.position.set(x,this.height(x,z)+.012,z);this.dummy.rotation.set(0,hash(i*3.14)*Math.PI,0);this.dummy.scale.setScalar(s);this.dummy.updateMatrix();this.flowers.setMatrixAt(i,this.dummy.matrix);
      const color=new Color().setHSL(.94+(hash(i+7)-.5)*.07,.21+hash(i+19)*.22,.50+hash(i+12)*.21);
      if(i%5===0)color.setRGB(.9,.86,.56);
      if(i%7===0)color.setRGB(.68,.73,.59);
      this.flowers.setColorAt(i,color);
    }
    this.group.add(this.flowers);

    this.pond=new Reflector(new PlaneGeometry(12,7),{textureWidth:512,textureHeight:256,clipBias:.003,multisample:0,color:0xa8c2ba});
    this.pond.name='Live planar reflection pond / 512 by 256';
    this.pond.rotation.x=-Math.PI/2;this.pond.position.set(.1,-1.18,-2.8);
    // Byte target supports Safari devices lacking EXT_color_buffer_float.
    this.pond.getRenderTarget().texture.type=UnsignedByteType;
    const water=this.pond.material as ShaderMaterial;
    water.transparent=true;water.depthWrite=true;
    water.uniforms.uGardenTime=this.waterTime;water.uniforms.uGardenHold=this.waterHold;water.uniforms.uGardenAlpha=this.waterAlpha;
    water.vertexShader=water.vertexShader.replace('void main()', 'varying vec2 vWater;\nvoid main()').replace('gl_Position =', 'vWater=position.xy;\n\tgl_Position =');
    water.fragmentShader=`
      uniform vec3 color;uniform sampler2D tDiffuse;
      uniform float uGardenTime,uGardenHold,uGardenAlpha;
      varying vec4 vUv;varying vec2 vWater;
      void main(){
        vec4 project=vUv;
        vec2 ripples=vec2(sin(vWater.y*31.+uGardenTime*.72)+sin(vWater.x*14.-vWater.y*23.+uGardenTime*.43),cos(vWater.y*27.+uGardenTime*.51));
        project.xy+=ripples*.0018*project.w;
        vec4 reflection=texture2DProj(tDiffuse,project);
        vec3 sky=mix(vec3(.22,.42,.39),vec3(.40,.63,.59),.5+.5*sin(vWater.y*2.5));
        sky=mix(sky,vec3(.22,.09,.11),uGardenHold*.8);
        vec3 result=mix(sky,reflection.rgb,.62*reflection.a);
        float shimmer=pow(max(0.,sin(vWater.y*110.+sin(vWater.x*22.+uGardenTime*.21)*2.)),18.);
        result+=vec3(.035,.045,.035)*shimmer*(1.-uGardenHold*.65);
        gl_FragColor=vec4(result,uGardenAlpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `;
    this.group.add(this.pond);
  }

  private height(x:number,z:number){
    const pond=((x-.18)/3.8)**2+((z+2.55)/2.12)**2+.035*Math.sin(x*3.5)+.024*Math.sin(z*6.);
    const bank=smooth(.87,1.16,pond);
    const rise=smooth(4.6,17,-z);
    return -1.43+bank*(.32+wave(x,z)*.085)+rise*(.39+wave(x*.3,z*.4)*.36);
  }

  private terrain(){
    const positions:number[]=[],colors:number[]=[],indices:number[]=[],nx=144,nz=112;
    const grass=new Color(),dry=new Color(0x666347),green=new Color(0x4d6346);
    for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){
      const x=(i/nx-.5)*28,z=1-j/nz*24,y=this.height(x,z);
      positions.push(x,y,z);
      const n=clamp(.5+wave(x*2,z*2)*.6);grass.copy(green).lerp(dry,n).multiplyScalar(.84+hash(i*101+j*79)*.26);
      colors.push(grass.r,grass.g,grass.b);
    }
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}
    const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('color',new Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }

  private column(){
    const pieces:BufferGeometry[]=[];
    const add=(g:BufferGeometry,x=0,y=0,z=0)=>{g.translate(x,y,z);g.deleteAttribute('uv');pieces.push(g);};
    const radial=120,vertical=24,positions:number[]=[],indices:number[]=[];
    for(let j=0;j<=vertical;j++)for(let i=0;i<=radial;i++){
      const t=j/vertical,angle=i/radial*Math.PI*2;
      const radius=(.143-.012*t+.006*Math.sin(t*Math.PI))*(1-.07*Math.pow(.5+.5*Math.cos(angle*20),3));
      positions.push(Math.cos(angle)*radius,.17+t*1.68,Math.sin(angle)*radius);
    }
    for(let j=0;j<vertical;j++)for(let i=0;i<radial;i++){const a=j*(radial+1)+i;indices.push(a,a+radial+1,a+1,a+1,a+radial+1,a+radial+2);}
    const shaft=new BufferGeometry();shaft.setAttribute('position',new Float32BufferAttribute(positions,3));shaft.setIndex(indices);shaft.computeVertexNormals();add(shaft);
    const base=new LatheGeometry([[.215,0],[.215,.04],[.19,.045],[.19,.065],[.171,.08],[.174,.105],[.16,.13],[.15,.17]].map(p=>new Vector2(...p as [number,number])),80);add(base);
    add(new BoxGeometry(.46,.055,.46),0,-.026,0);
    add(new CylinderGeometry(.18,.149,.15,64),0,1.9,0);
    const torus=(r:number,tube:number,y:number)=>{const g=new TorusGeometry(r,tube,8,80);g.rotateX(Math.PI/2);add(g,0,y,0);};
    torus(.17,.018,1.83);torus(.20,.016,2.02);torus(.225,.018,2.11);
    add(new BoxGeometry(.48,.045,.48),0,2.145,0);add(new BoxGeometry(.43,.035,.43),0,2.105,0);
    // Curved acanthus leaves built as surface patches, rather than a plain cylinder capital.
    for(let tier=0;tier<2;tier++)for(let k=0;k<10;k++){
      const angle=k/10*Math.PI*2+tier*Math.PI/10,leaf:number[]=[],idx:number[]=[],w=6,h=10;
      for(let j=0;j<=h;j++)for(let i=0;i<=w;i++){
        const t=j/h,u=i/w*2-1;
        const width=Math.sin(t*Math.PI)*(.045+tier*.006)*(1+.13*Math.cos(t*26));
        const r=.15+.080*Math.sin(t*Math.PI*.72)+Math.abs(u)*.008;
        const a=angle+u*width/r;
        leaf.push(Math.cos(a)*r,1.87+tier*.10+t*.17,Math.sin(a)*r);
      }
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=j*(w+1)+i;idx.push(a,a+w+1,a+1,a+1,a+w+1,a+w+2);}
      const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(leaf,3));g.setIndex(idx);g.computeVertexNormals();add(g);
    }
    const g=mergeGeometries(pieces)!;for(const p of pieces)p.dispose();return g;
  }

  private flowerAtlas(){
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
    const c=canvas.getContext('2d')!;c.clearRect(0,0,256,512);
    // Original seeded paint strokes. Clumps retain internal transparency and slender stems.
    for(let i=0;i<16;i++){
      const x=30+hash(i*4.7)*196,top=30+hash(i*7.3)*320,base=245+hash(i*3.4)*100;
      c.strokeStyle=i%3?'#6b8050':'#899c64';c.lineWidth=1.8;c.beginPath();c.moveTo(base,512);c.quadraticCurveTo(x+18,top+180,x,top);c.stroke();
      for(let j=0;j<6;j++){
        const yy=top+90+j*37,xx=x+(base-x)*(yy-top)/(512-top),side=j%2?-1:1;
        c.fillStyle='#7c9562';c.beginPath();c.ellipse(xx+side*9,yy,12,3.5,side*.5,0,Math.PI*2);c.fill();
      }
      const colors=['#b36a9b','#94558b','#cb7bb0','#dec3cc','#b18fc0'];
      for(let j=0;j<22;j++){
        const a=hash(i*71+j*19)*Math.PI*2,r=Math.sqrt(hash(i*29+j*23))*14;
        const xx=x+Math.cos(a)*r,yy=top+Math.sin(a)*r+(i%4===0?j*2:0);
        c.fillStyle=colors[(i+j)%colors.length];c.beginPath();c.ellipse(xx,yy,3+hash(j+19)*2,2.3+hash(j+3)*2,a,0,Math.PI*2);c.fill();
      }
    }
    const t=new CanvasTexture(canvas);t.colorSpace=SRGBColorSpace;t.anisotropy=2;return t;
  }

  update(time:number,appearance:number,hold:number){
    const visible=appearance>.001;this.group.visible=visible;if(!visible)return;
    const opacity=clamp(appearance);
    for(const m of this.materials){m.opacity=opacity;m.depthWrite=opacity>.97;}
    this.flowerTime.value=time;this.waterTime.value=time;this.waterHold.value=hold;this.waterAlpha.value=opacity;
  }

  state(){return{type:'independent 3D terrain / fluted columns / instanced flowerbeds / live planar pond reflection',flowerInstances:this.flowers.count,reflection:[512,256],visible:this.group.visible};}

  dispose(){
    const geometry=new Set<BufferGeometry>();this.group.traverse(o=>{if(o instanceof Mesh)geometry.add(o.geometry);});
    for(const g of geometry)g.dispose();for(const m of this.materials)m.dispose();this.flowerTexture.dispose();this.pond.dispose();
  }
}
