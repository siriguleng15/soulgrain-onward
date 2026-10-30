import {Color,Matrix4,MeshDepthMaterial,MeshStandardMaterial,RGBADepthPacking,ShaderChunk} from 'three';
import type {Mesh,Object3D,Texture} from 'three';

export type Region='outer'|'inner'|'vamp'|'shaft'|'tongue'|'cuff'|'border'|'heel'|'logo'|'aglets'|'clasps'|'rhinestones';
export interface ArtworkProfile {region:Region;base:string;kind?:'velvet'|'aglet'|'relief';}
export interface ArtworkBinding {mesh:Mesh;material:MeshStandardMaterial;region:Region;profile:ArtworkProfile;gate:{value:number};compiles:number;}

/** Resolve semantic GLTF owners, including the child meshes of multi-material nodes. */
export function owner(node:Object3D){let p:Object3D|null=node;while(p){if(typeof p.userData.part==='string')return p.userData.part;if(p.parent?.type==='Group'&&p.parent.userData.adActor)return p.parent.name;if(p.userData.adActor)return p.name;p=p.parent;}return node.name;}

/** Every mapped source primitive is represented; plain hardware/soles still
 * activate the window, but retain their original unprinted finish. */
export function profileFor(mesh:Mesh,material:MeshStandardMaterial):ArtworkProfile|undefined{
 switch(material.name){
  case'Body_Canvas':return{region:owner(mesh)==='Shoe_Body'?'outer':owner(mesh)==='Original_Vamp'?'vamp':owner(mesh)==='Convertible_Tongue'?'tongue':'shaft',base:'#0D2740'};
  case'Body_Inner_Canvas':return{region:owner(mesh)==='Shoe_Body'?'inner':'shaft',base:'#0D2740'};
  case'Collar_Outer_Canvas':case'Collar_Canvas':return{region:'cuff',base:'#172e61'};
  case'Tongue_Canvas':case'Tongue_Reverse_Canvas':return{region:'tongue',base:'#220b47',kind:'velvet'};
  case'Cuff_Border':return{region:'border',base:'#102541'};
  case'Heel_Strip':return{region:'heel',base:'#931522'};
  case'Heel_Logo':return{region:'logo',base:'#eee9df'};
  case'Aglet_Artwork':return{region:'aglets',base:'#142b50',kind:'aglet'};
  case'Clasp_Engraved_Head':return{region:'clasps',base:'#9f9584'};
  case'Rhinestone_Silver':return{region:'rhinestones',base:'#eee9df',kind:'relief'};
 }
}

const maskDeclarations=`
uniform float sgpAll;uniform vec2 sgpCenter;uniform vec2 sgpCss;uniform vec2 sgpBuffer;
uniform float sgpRadius;uniform float sgpOpacity;uniform float sgpHitDepth;uniform float sgpDepthBand;uniform float sgpRegion;
float sgpWindow(vec2 pixel,float depth){
 float r=max(sgpRadius,0.001);
 float disk=1.0-smoothstep(r*0.56,r,length(pixel-sgpCenter));
 float depthGate=1.0-smoothstep(sgpDepthBand*0.6,sgpDepthBand,abs(depth-sgpHitDepth));
 return clamp(max(sgpAll,disk*sgpOpacity*sgpRegion*depthGate),0.0,1.0);
}
`;
const reliefVertex=`uniform mat4 sgpView;uniform mat4 sgpProjection;varying vec4 sgpClip;varying float sgpMainDepth;\n`;
const reliefProject=`#include <project_vertex>
 vec4 sgpMainView=sgpView*modelMatrix*vec4(transformed,1.0);
 sgpClip=sgpProjection*sgpMainView;sgpMainDepth=-sgpMainView.z;
`;
const reliefFragment=`varying vec4 sgpClip;varying float sgpMainDepth;\n`;
// Opaque, subpixel coverage: the relief itself is an actual 785-stone mesh,
// not a color map. Conceal its fragments (and shadow fragments) to reveal the
// original velvet below. Never flatten, move, replace or edit those vertices.
const reliefCoverage=`
 if(sgpAll<0.99999){
 vec2 sgpMainPixel=(sgpClip.xy/sgpClip.w*0.5+0.5)*sgpCss;
 float sgpCoverage=sgpWindow(sgpMainPixel,sgpMainDepth);
 if(sgpCoverage<=0.00001)discard;
 if(sgpCoverage<0.99999&&sgpCoverage<fract(sin(dot(floor(sgpMainPixel),vec2(12.9898,78.233)))*43758.5453))discard;
 }
`;

export class RevealMaterials {
 readonly cameraUniforms={sgpView:{value:new Matrix4()},sgpProjection:{value:new Matrix4()}};
 private readonly ownedDepth:MeshDepthMaterial[]=[];
 private readonly originalDepth=new Map<Mesh,Mesh['customDepthMaterial']>();
 constructor(private readonly uniforms:Record<string,{value:unknown}>,private readonly velvet:Texture){}
 attach(binding:ArtworkBinding){
  const {material,profile}=binding,previous=material.onBeforeCompile,oldKey=material.customProgramCacheKey();
  const fabric=['Body_Canvas','Body_Inner_Canvas','Collar_Canvas','Collar_Outer_Canvas'].includes(material.name);
  const clean=profile.kind==='velvet'?'texture2D(sgpCleanVelvet,vMapUv).rgb':profile.kind==='aglet'?`
   mix(mix(sgpBase,vec3(0.44,0.46,0.48),smoothstep(0.679,0.683,vMapUv.y)),
       vec3(0.855,0.799,0.687),smoothstep(0.719,0.723,vMapUv.y))`:fabric?`sgpBase*sgpFiber(vMapUv)`:'sgpBase';
  const mapChunk=ShaderChunk.map_fragment.replace('diffuseColor *= sampledDiffuseColor;',`
   if(sgpAll<0.99999){
   float sgpVisible=sgpWindow(gl_FragCoord.xy*sgpCss/sgpBuffer,vViewPosition.z);
   sampledDiffuseColor.rgb=mix(${clean},sampledDiffuseColor.rgb,sgpVisible);
   }
   diffuseColor *= sampledDiffuseColor;`);
  if(mapChunk===ShaderChunk.map_fragment)throw Error('Three.js 颜色采样阶段不匹配。');
  material.onBeforeCompile=(shader,renderer)=>{
   previous.call(material,shader,renderer);binding.compiles++;
   Object.assign(shader.uniforms,this.uniforms,this.cameraUniforms,{sgpBase:{value:new Color(profile.base)},sgpRegion:binding.gate,sgpCleanVelvet:{value:this.velvet}});
   shader.fragmentShader=maskDeclarations+`uniform vec3 sgpBase;uniform sampler2D sgpCleanVelvet;
   // Small, antialiased thread variation in the clean cloth only. The original
   // normal map, material parameters and revealed photograph are untouched.
   float sgpFiber(vec2 uv){
    vec2 thread=uv*1200.0;
    vec2 limit=1.0-smoothstep(vec2(0.3),vec2(1.2),fwidth(thread));
    vec2 weave=cos(thread*6.2831853)*limit;
    return 1.0+0.025*(weave.x+weave.y);
   }\n`+shader.fragmentShader;
   if(profile.kind==='relief'){
    shader.vertexShader=reliefVertex+shader.vertexShader.replace('#include <project_vertex>',reliefProject);
    shader.fragmentShader=reliefFragment+shader.fragmentShader.replace('#include <alphatest_fragment>',reliefCoverage+'\n#include <alphatest_fragment>');
   }else shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',mapChunk);
  };
  material.customProgramCacheKey=()=>oldKey+'-sg-pattern-window-fullshoe-v2-'+(profile.kind??'flat')+(fabric?'-cloth':'-solid');material.needsUpdate=true;
  material.userData.sgpRevealRegion=binding.region;material.userData.sgpCleanBase=profile.base;
  if(profile.kind==='relief')this.attachDepth(binding);
 }
 private attachDepth(binding:ArtworkBinding){
  const depth=new MeshDepthMaterial({depthPacking:RGBADepthPacking,side:binding.material.side});
  depth.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,this.uniforms,this.cameraUniforms,{sgpRegion:binding.gate});
   shader.vertexShader=reliefVertex+shader.vertexShader.replace('#include <project_vertex>',reliefProject);
   shader.fragmentShader=maskDeclarations+reliefFragment+shader.fragmentShader.replace('#include <alphatest_fragment>',reliefCoverage+'\n#include <alphatest_fragment>');
  };
  depth.customProgramCacheKey=()=> 'sg-pattern-window-relief-shadow-v2';
  this.originalDepth.set(binding.mesh,binding.mesh.customDepthMaterial);binding.mesh.customDepthMaterial=depth;this.ownedDepth.push(depth);
 }
 dispose(){for(const[mesh,depth]of this.originalDepth)mesh.customDepthMaterial=depth;for(const depth of this.ownedDepth)depth.dispose();this.originalDepth.clear();this.ownedDepth.length=0;}
}
