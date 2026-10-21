import { MeshDepthMaterial, MeshDistanceMaterial, MeshStandardMaterial, RGBADepthPacking, Vector3 } from 'three';
import type { Material } from 'three';
import { CuffCurve } from './CuffCurve';

const declarations = `
attribute vec3 _sg_param;
attribute vec3 _sg_flat;
attribute vec3 _sg_normal;
uniform sampler2D sgRest;
uniform sampler2D sgCurve;
uniform float sgSamples;
uniform float sgUnfold;
uniform float sgLift;
uniform float sgWhite;
uniform float sgOpacity;
uniform float sgWrap;
uniform float sgClasp;
varying vec2 sgCoord;
vec4 sgSample(sampler2D tex, float s) {
 float f = clamp(s,0.0,1.0)*(sgSamples-1.0);
 float i = floor(f); float w=fract(f);
 return mix(texture2D(tex,vec2((i+.5)/sgSamples,.5)),texture2D(tex,vec2((min(i+1.0,sgSamples-1.0)+.5)/sgSamples,.5)),w);
}
vec3 sgT(float a){return vec3(cos(a),0.0,sin(a));}
vec3 sgN(float a){return vec3(-sin(a),0.0,cos(a));}
vec3 sgDeform(vec3 p){
 if(sgUnfold<.000001 && sgLift<.000001)return p;
 vec4 rest=sgSample(sgRest,_sg_param.x);vec4 curve=sgSample(sgCurve,_sg_param.x);
 vec3 d=p-rest.xyz;
 vec3 local=vec3(dot(d,sgT(rest.w)),dot(d,sgN(rest.w)),d.y);
 local=mix(local,_sg_flat,sgUnfold);
 if(sgClasp>.5){
  float ang=sgLift*.85;
  vec2 q=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*vec2(local.x,local.y-.0018);
  local.z+=max(-local.x,0.0)*sin(ang)*.24;
  local.x=q.x;local.y=q.y+.0018;
 }
 return curve.xyz+sgT(curve.w)*local.x+sgN(curve.w)*local.y+vec3(0.0,local.z,0.0)+vec3(0.0,.015,.014)*sgUnfold;
}
vec3 sgDeformNormal(vec3 normal){
 if(sgUnfold<.000001 && sgLift<.000001)return normal;
 vec4 rest=sgSample(sgRest,_sg_param.x);vec4 curve=sgSample(sgCurve,_sg_param.x);
 vec3 local=vec3(dot(normal,sgT(rest.w)),dot(normal,sgN(rest.w)),normal.y);
 local=normalize(mix(local,_sg_normal,sgUnfold));
 if(sgClasp>.5){float a=sgLift*.85;local.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*local.xy;}
 return normalize(sgT(curve.w)*local.x+sgN(curve.w)*local.y+vec3(0.0,local.z,0.0));
}
`;
// Coverage stays in the opaque render pass. At opacity=1 there is no
// stochastic discard, so the assembled wall has proper opaque depth occlusion.
// The same opening and coverage are applied to color and shadow passes.
const fragmentDeclarations = `
uniform float sgWhite;
uniform float sgOpacity;
uniform float sgWrap;
varying vec2 sgCoord;
bool sgDoorCut() {
 float opening=smoothstep(.70,.98,sgWrap);
 float halfWidth=.055*smoothstep(0.0,.40,opening);
 float upperEdge=mix(1.02,.66,opening);
 return opening>.00001 && abs(sgCoord.x-.5)<halfWidth && sgCoord.y>upperEdge;
}
`;

const transformedVertex = `
#include <begin_vertex>
sgCoord=_sg_param.xy;
transformed=sgDeform(position);
#ifdef USE_ALPHAHASH
 vPosition=transformed;
#endif
`;

export class CuffMaterial {
  readonly uniforms;
  readonly materials: Material[] = [];

  constructor(readonly curve: CuffCurve, readonly demonstration = false) {
    this.uniforms = {
      sgRest: { value: curve.restTexture },
      sgCurve: { value: curve.texture },
      sgSamples: { value: curve.meta.sampleCount },
      sgUnfold: { value: 0 }, sgLift: { value: 0 },
      sgWhite: { value: 0 }, sgOpacity: { value: 1 },
      sgWrap: { value: 0 }, sgClasp: { value: 0 },
    };
  }

  attach(source: MeshStandardMaterial, clasp = false) {
    const material = source.clone();
    const uniforms = { ...this.uniforms, sgClasp: { value: clasp ? 1 : 0 } };

    if (this.demonstration) {
      // Alpha blending made the inner and outer cloth layers sort like a
      // transparent shell. Hashed coverage fades without transparent sorting.
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.alphaTest = 0;
      material.alphaHash = true;
    }

    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = declarations + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        '#include <beginnormal_vertex>\nobjectNormal=sgDeformNormal(objectNormal);',
      );
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', transformedVertex);
      shader.fragmentShader = fragmentDeclarations + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.74,.72,.67),sgWhite);',
      );
      if (this.demonstration) {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <alphatest_fragment>',
          'if(sgDoorCut())discard;\ndiffuseColor.a=clamp(sgOpacity,0.0,1.0);\n#include <alphatest_fragment>',
        );
        // The translated wall becomes felt; the blue source retains its V8
        // roughness, metalness and corrected weave normal map at sgWhite=0.
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <roughnessmap_fragment>',
          '#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.92,sgWhite);',
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <metalnessmap_fragment>',
          '#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,0.0,sgWhite);',
        );
      }
    };
    material.customProgramCacheKey = () => `onward-cuff-solid-v2-${clasp}-${this.demonstration}`;
    this.materials.push(material);
    return material;
  }

  depth(clasp = false) {
    const material = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
    this.patchDepth(material, clasp);
    return material;
  }

  distance(clasp = false) {
    const material = new MeshDistanceMaterial();
    this.patchDepth(material, clasp);
    return material;
  }

  private patchDepth(material: MeshDepthMaterial | MeshDistanceMaterial, clasp: boolean) {
    material.alphaHash = this.demonstration;
    material.transparent = false;
    material.depthWrite = true;
    material.onBeforeCompile = shader => {
      Object.assign(shader.uniforms, this.uniforms, { sgClasp: { value: clasp ? 1 : 0 } });
      shader.vertexShader = declarations + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', transformedVertex);
      if (this.demonstration) {
        shader.fragmentShader = fragmentDeclarations + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <alphatest_fragment>',
          'if(sgDoorCut())discard;\ndiffuseColor.a=clamp(sgOpacity,0.0,1.0);\n#include <alphatest_fragment>',
        );
      }
    };
    material.customProgramCacheKey = () => `onward-cuff-solid-shadow-v2-${clasp}-${this.demonstration}`;
    this.materials.push(material);
  }

  set(unfold: number, lift: number, white = 0, opacity = 1, wrap = 0) {
    this.uniforms.sgUnfold.value = unfold;
    this.uniforms.sgLift.value = lift;
    this.uniforms.sgWhite.value = white;
    this.uniforms.sgOpacity.value = opacity;
    this.uniforms.sgWrap.value = wrap;
    this.curve.update(unfold, wrap);
  }

  point(s: number, out = new Vector3()) {
    this.curve.point(s, out);
    out.y += this.curve.meta.height / 2 + .015;
    out.z += .014;
    return out;
  }

  dispose() {
    this.materials.forEach(material => material.dispose());
    this.curve.dispose();
  }
}
