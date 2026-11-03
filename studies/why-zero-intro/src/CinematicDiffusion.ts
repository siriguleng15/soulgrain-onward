import {Color,HalfFloatType,Mesh,OrthographicCamera,PlaneGeometry,RGBAFormat,Scene,ShaderMaterial,Texture,UnsignedByteType,Vector2,WebGLRenderer,WebGLRenderTarget} from 'three';
import {quadVertex} from './shaders.ts';

const fragment=`
varying vec2 vUv;
uniform sampler2D uInput;
uniform vec2 uDirection;
vec4 source(vec2 uv){
  vec4 s=texture2D(uInput,uv);
  return s;
}
void main(){
  vec4 c=source(vUv)*.227027;
  c+=(source(vUv+uDirection*1.384615)+source(vUv-uDirection*1.384615))*.316216;
  c+=(source(vUv+uDirection*3.230769)+source(vUv-uDirection*3.230769))*.070270;
  gl_FragColor=c;
}`;

/** Two small HDR targets for optical highlight diffusion; no full-size blur chain. */
export class CinematicDiffusion {
  private readonly a:WebGLRenderTarget;
  private readonly b:WebGLRenderTarget;
  private readonly scene=new Scene();
  private readonly camera=new OrthographicCamera(-1,1,1,-1,0,1);
  private readonly material=new ShaderMaterial({vertexShader:quadVertex,fragmentShader:fragment,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{uInput:{value:null},uDirection:{value:new Vector2()}}});
  private width=1;
  private height=1;
  constructor(private readonly renderer:WebGLRenderer){
    const type=renderer.extensions.has('EXT_color_buffer_float')?HalfFloatType:UnsignedByteType;
    this.a=new WebGLRenderTarget(1,1,{format:RGBAFormat,type,depthBuffer:false});
    this.b=this.a.clone();
    const quad=new Mesh(new PlaneGeometry(2,2),this.material);quad.frustumCulled=false;this.scene.add(quad);
  }
  get texture(){return this.b.texture;}
  resize(width:number,height:number){
    this.width=Math.max(1,Math.round(width/3));this.height=Math.max(1,Math.round(height/3));
    this.a.setSize(this.width,this.height);this.b.setSize(this.width,this.height);
  }
  render(input:Texture){
    const r=this.renderer,previous=r.getRenderTarget(),auto=r.autoClear,clear=r.getClearColor(new Color()),alpha=r.getClearAlpha();
    r.autoClear=true;r.setClearColor(0,1);
    this.material.uniforms.uInput.value=input;
    this.material.uniforms.uDirection.value.set(1.4/this.width,0);
    r.setRenderTarget(this.a);r.render(this.scene,this.camera);
    this.material.uniforms.uInput.value=this.a.texture;
    this.material.uniforms.uDirection.value.set(0,1.4/this.height);
    r.setRenderTarget(this.b);r.render(this.scene,this.camera);
    r.setRenderTarget(previous);r.autoClear=auto;r.setClearColor(clear,alpha);
  }
  dispose(){this.a.dispose();this.b.dispose();this.material.dispose();}
}
