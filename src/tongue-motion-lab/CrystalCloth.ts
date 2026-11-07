import { DoubleSide, MeshPhysicalMaterial, SRGBColorSpace, Texture, TextureLoader } from 'three';
import type { MeshStandardMaterial } from 'three';
/** The crystal front changes the cloth's own PBR response. Silver stays an
 * entirely separate, persistent instance mesh and never enters this shader. */
export class CrystalCloth {
    readonly material: MeshPhysicalMaterial;
    readonly front = { value: 0 };
    readonly textures: Texture[] = [];
    private constructor(base: MeshStandardMaterial, color: Texture, normal: Texture, roughness: Texture) {
        this.textures = [color, normal, roughness];
        color.colorSpace = SRGBColorSpace;
        this.material = new MeshPhysicalMaterial({ color: 0xe4e1d9, roughness: .87, metalness: 0, normalMap: base.normalMap, normalScale: base.normalScale, side: DoubleSide, clearcoat: .7, clearcoatRoughness: .23 });
        this.material.name = 'Persistent_Cuff_Cloth_To_Blue_Crystal';
        this.material.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, { sgCrystalFront: this.front, sgCrystalColor: { value: color }, sgCrystalNormal: { value: normal }, sgCrystalRoughness: { value: roughness } });
            shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 sgClothUv;').replace('#include <uv_vertex>', '#include <uv_vertex>\nsgClothUv = uv;');
            shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
    varying vec2 sgClothUv;uniform float sgCrystalFront;uniform sampler2D sgCrystalColor;uniform sampler2D sgCrystalNormal;uniform sampler2D sgCrystalRoughness;`)
                .replace('#include <map_fragment>', `#include <map_fragment>
    float sgMix = sgCrystalFront <= 0.0 ? 0.0 : (sgCrystalFront >= 1.0 ? 1.0 : 1.0 - smoothstep(mix(.3196,1.0,sgCrystalFront) - .035,mix(.3196,1.0,sgCrystalFront) + .035,sgClothUv.y));
    float sgSeam = 1.0 - smoothstep(.0015,.0045,abs(sgClothUv.y - .31962025));
    diffuseColor.rgb = mix(diffuseColor.rgb,texture2D(sgCrystalColor,sgClothUv).rgb,sgMix);
    diffuseColor.rgb = mix(diffuseColor.rgb,vec3(.44),sgSeam * (.10 + .65 * sgMix));`)
                .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor,texture2D(sgCrystalRoughness,sgClothUv).r,sgMix);roughnessFactor=mix(roughnessFactor,.88,sgSeam);')
                .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor,.24,sgMix)*(1.0-sgSeam);')
                .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
    #ifdef USE_NORMALMAP_TANGENTSPACE
    vec3 sgFacetN = texture2D(sgCrystalNormal,sgClothUv).xyz * 2.0 - 1.0;
    normal = normalize(mix(normal,normalize(tbn * sgFacetN),sgMix));
    #endif`)
                .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\nmaterial.clearcoat *= sgMix*(1.0-sgSeam);');
        };
        this.material.customProgramCacheKey = () => 'sg-tongue-crystal-v1';
    }
    static async load(base: MeshStandardMaterial) { const loader = new TextureLoader(), url = import.meta.env.BASE_URL + 'tongue-motion-lab/assets/'; const textures = await Promise.all(['crystal-color.png', 'crystal-normal.png', 'crystal-roughness.png'].map(n => loader.loadAsync(url + n))); return new CrystalCloth(base, textures[0], textures[1], textures[2]); }
    set(progress: number) { this.front.value = Math.max(0, Math.min(1, progress)); }
    dispose() {
        this.material.dispose();
        for (const t of this.textures)
            t.dispose();
    }
}
