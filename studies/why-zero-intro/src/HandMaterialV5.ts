import {
  Color, DataTexture, LinearFilter, LinearMipmapLinearFilter, MeshPhysicalMaterial,
  NoColorSpace, RedFormat, RepeatWrapping, ShaderChunk, SRGBColorSpace, Texture,
  UnsignedByteType,
} from 'three';

export interface HandSurfaceMaps {
  /** Color maps use authored hand UVs and are decoded from sRGB exactly once. */
  albedo?:Texture;
  normal?:Texture;
  roughness?:Texture;
  specularIntensity?:Texture;
  specularFactor?:number;
  roughnessFactor?:number;
  ao?:Texture;
  /** Keep false for the legacy hand, whose micro detail uses rest-space projection. */
  authoredUV?:boolean;
  role?:'skin'|'nail';
  gloveSurface?:boolean;
}

export type HandMaterialUniforms={uIce:{value:number};uWristFade:{value:number}};

let microTexture:DataTexture|undefined;

/** Tiny original, tileable height field; shared by both hands, not generated per frame. */
function pores(){
  if(microTexture)return microTexture;
  const size=256,data=new Uint8Array(size*size);
  const fract=(x:number)=>x-Math.floor(x);
  const hash=(x:number,y:number)=>fract(Math.sin(x*127.1+y*311.7+19.17)*43758.5453);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    // Two scales of pores and fine, broken skin furrows. No broad periodic bands.
    const a=hash(x,y),b=hash(Math.floor(x/3),Math.floor(y/3));
    const furrow=Math.pow(Math.max(0,Math.cos(x*.43+Math.sin(y*.27)*1.4)),18);
    data[y*size+x]=Math.round(255*Math.max(0,Math.min(1,.43+a*.23+b*.13-furrow*.07)));
  }
  const texture=new DataTexture(data,size,size,RedFormat,UnsignedByteType);
  texture.name='Original seeded skin pore micro-height / V5';
  texture.colorSpace=NoColorSpace;texture.wrapS=texture.wrapT=RepeatWrapping;
  texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter;
  texture.generateMipmaps=true;texture.needsUpdate=true;
  microTexture=texture;
  return texture;
}

/**
 * A single-pass PBR material. The scattering term is a bounded wrapped-diffuse
 * approximation, not a claim of measured or screen-space subsurface scattering.
 * Three's specular BRDF, environment lighting, clearcoat and normal mapping stay
 * intact. Interaction changes uniforms only; the program is compiled once.
 */
export function createHandMaterial(human:boolean,skin?:Texture,maps:HandSurfaceMaps={}){
  const nail=maps.role==='nail';
  if(maps.albedo)maps.albedo.colorSpace=SRGBColorSpace;
  for(const map of [maps.normal,maps.roughness,maps.specularIntensity,maps.ao])if(map)map.colorSpace=NoColorSpace;
  const authored=!!maps.authoredUV;
  const uniforms:HandMaterialUniforms={uIce:{value:0},uWristFade:{value:1}};
  const material=new MeshPhysicalMaterial({
    name:human?(nail?'Anatomical nail / V5':'Anatomical skin / V5'):'Lime / cyan translucent studio hand / V5',
    color:new Color(maps.albedo?'#ffffff':human?(nail?'#c69c8c':'#b9957d'):'#3a9c24'),
    map:maps.albedo??null,normalMap:maps.normal??null,roughnessMap:maps.roughness??null,aoMap:maps.ao??null,
    metalness:0,roughness:maps.roughnessFactor??(maps.roughness?1:nail?.30:human?.49:.34),
    ior:human?1.42:1.46,specularIntensity:maps.specularFactor??(human?.48:.72),specularIntensityMap:maps.specularIntensity??null,
    clearcoat:nail?.11:human?.025:.18,clearcoatRoughness:human?.38:.29,
    sheen:human&&!nail?.055:0,sheenColor:new Color('#b99b86'),sheenRoughness:.85,
    envMapIntensity:human?.38:.48,transparent:true,opacity:0,
  });
  if(maps.normal)material.normalScale.setScalar(nail?.25:.62);
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    shader.uniforms.uHandMicro={value:skin??pores()};
    shader.vertexShader=shader.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec3 vHandRest;varying vec3 vHandRestNormal;varying vec2 vHandUV;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>\nvHandRest=position;vHandRestNormal=normal;vHandUV=uv;${human||maps.gloveSurface?'':'\ntransformed+=normal*(.0012*(1.-smoothstep(.018,.075,position.y)));'}`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vHandRest;varying vec3 vHandRestNormal;varying vec2 vHandUV;
      uniform float uIce,uWristFade;uniform sampler2D uHandMicro;
      vec2 handMicroUV(){return ${authored?'vHandUV*vec2(20.,20.)':'vHandRest.zy*vec2(115.,83.)'};}
    `);

    // Add the shallow scattering lobe at the light, so it follows actual light
    // direction and intensity rather than acting as constant emissive paint.
    const original='reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );';
    const scatter=human?(nail?.035:.19):.27;
    const tint=human?'vec3(1.0,.48,.29)':'vec3(.22,.88,.70)';
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_physical_pars_fragment>',ShaderChunk.lights_physical_pars_fragment.replace(original,`
      float handNL=dot(geometryNormal,directLight.direction);
      float handWrap=clamp((handNL+.38)/1.38,0.,1.);
      vec3 handTint=mix(vec3(1.),${tint},pow(1.-saturate(handNL),2.)*.65);
      vec3 handSubsurface=${human?'material.diffuseColor*handTint':'mix(material.diffuseColor*handTint,vec3(.025,.18,.15),pow(1.-saturate(handNL),2.)*.65)'};
      reflectedLight.directDiffuse += directLight.color
        * (BRDF_Lambert(material.diffuseColor)*saturate(handNL)*(1.-${scatter.toFixed(3)})
        + BRDF_Lambert(handSubsurface)*handWrap*${scatter.toFixed(3)});
    `));

    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float handMicro=texture2D(uHandMicro,handMicroUV()).r;
      ${human?`
        // Authored albedo contains anatomy. Only a tiny local chromatic change
        // is added; it cannot turn skin into a noisy or striped material.
        diffuseColor.rgb*=1.+(handMicro-.5)*${nail?'.010':'.026'};
      `:`
        float wrist=smoothstep(-.016,.075,vHandRest.y);
        float palmSide=1.-smoothstep(.16,.88,abs(vHandRestNormal.x));
        float cyan=clamp(wrist*.72+palmSide*.12,0.,.82)*clamp(uIce*2.5,0.,1.);
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.10,.38,.29),cyan);
      `}
      diffuseColor.a*=mix(1.,1.-smoothstep(.018,.11,vHandRest.y),uWristFade);
    `);

    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      roughnessFactor=clamp(roughnessFactor+(texture2D(uHandMicro,handMicroUV()).r-.5)*${human?'.065':'.018'},.21,.82);
    `);
    if(!nail)shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float microHeight=texture2D(uHandMicro,handMicroUV()).r;
      vec3 handQ0=dFdx(-vViewPosition),handQ1=dFdy(-vViewPosition);
      vec3 handS1=cross(handQ1,normal),handS2=cross(normal,handQ0);
      float handDet=dot(handQ0,handS1);
      vec3 handGradient=sign(handDet)*${human?'.00014':'.000018'}*(dFdx(microHeight)*handS1+dFdy(microHeight)*handS2);
      normal=normalize(abs(handDet)*normal-handGradient);
    `);
  };
  material.customProgramCacheKey=()=>`hand-v5-${human}-${nail}-${authored}-${!!maps.specularIntensity}-${!!maps.gloveSurface}`;
  material.userData.scattering='Bounded wrapped diffuse approximation, not measured SSS';
  return{material,uniforms};
}
