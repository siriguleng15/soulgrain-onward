import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Points,
  ShaderMaterial,
} from 'three';

export type ArrivalQuality = 'high' | 'balanced' | 'low';

/** These are visual hand-off times, not additional product shape states. */
export const ARRIVAL_TIMING = {
  constellationStart: .02,
  constellationComplete: .20,
  surfaceStart: .34,
  surfaceComplete: .79,
  productStart: .68,
  productComplete: .98,
  durationSeconds: 5.2,
} as const;

const clamp = (value:number, minimum=0, maximum=1) => Math.max(minimum, Math.min(maximum, value));

/** Stable, deliberately non-cryptographic seed. The same sampled surface and
 * index always produce the same path; replay never integrates prior frames. */
function noise(index:number, salt:number) {
  let value = (Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 7, 0x27d4eb2d)) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

const vertexShader = /* glsl */`
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  attribute vec3 aScatter;
  attribute vec3 aConstellation;
  attribute vec4 aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float p = clamp(uProgress, 0.0, 1.0);
    float constellation = smoothstep(0.02, 0.20, p);
    float gathering = smoothstep(0.34, 0.79, p);
    vec3 transformed = mix(aScatter, aConstellation, constellation);
    transformed = mix(transformed, position, gathering);

    // A small continuous flow, strongest between the two formations. The
    // target is the actual supplied surface, rather than an invented shoe.
    float freeFlow = 1.0 - gathering;
    float arc = sin(gathering * 3.14159265359);
    transformed.x += sin(uTime * 0.31 + aSeed.x * 14.0) * freeFlow * 0.035;
    transformed.y += cos(uTime * 0.25 + aSeed.y * 11.0) * freeFlow * 0.035;
    transformed.z += sin(aSeed.x * 9.0 + gathering * 3.14159265359) * arc * 0.24;
    transformed.x += cos(aSeed.y * 8.0 + gathering * 3.14159265359) * arc * 0.10;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float perspective = 4.4 / max(0.6, -mvPosition.z);
    float size = (1.75 + aSeed.z * 2.10) * mix(0.92, 1.10, gathering);
    gl_PointSize = clamp(size * perspective * uPixelRatio, 0.7 * uPixelRatio, 4.0 * uPixelRatio);

    float twinkle = 0.88 + 0.12 * sin(uTime * (0.32 + aSeed.z * 0.25) + aSeed.w * 24.0);
    float handoff = 1.0 - smoothstep(0.70, 0.98, p);
    vAlpha = (0.48 + aSeed.w * 0.45) * twinkle * handoff;
    vColor = mix(vec3(0.38, 0.68, 0.93), vec3(0.91, 0.97, 1.0), aSeed.z);
  }
`;

const fragmentShader = /* glsl */`
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 xy = gl_PointCoord * 2.0 - 1.0;
    float radiusSquared = dot(xy, xy);
    if (radiusSquared > 1.0) discard;
    float disc = exp(-3.2 * radiusSquared) * (1.0 - smoothstep(0.35, 1.0, radiusSquared));
    float alpha = disc * vAlpha * uOpacity;
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(vColor, alpha);
    #include <colorspace_fragment>
  }
`;

/** A short, skippable particle arrival over a genuine sampled product surface.
 *
 * surfacePositions must already be in the display scene's coordinate system
 * (the present showcase normalises shoe length to approximately three units).
 * The diamond formation is an original abstract rhythm inspired by the
 * product's geometric construction; it is not an asserted historical motif.
 * No product image, pre-rendered clip or reference-site asset is used.
 */
export class ParticleArrival {
  readonly group = new Group();
  readonly points:Points<BufferGeometry, ShaderMaterial>;
  readonly capacity:number;
  readonly sourcePointCount:number;
  private quality:ArrivalQuality = 'high';
  private progress = 0;
  private reducedMotion = false;
  private opacity = 1;
  private disposed = false;

  constructor(surfacePositions:Float32Array, count=9000) {
    if (surfacePositions.length < 9 || surfacePositions.length % 3 !== 0 || !surfacePositions.every(Number.isFinite)) {
      throw new Error('Particle arrival requires finite sampled 3D product positions.');
    }
    if (!Number.isFinite(count) || count < 1) throw new Error('Particle count must be positive.');
    this.sourcePointCount = surfacePositions.length / 3;
    this.capacity = Math.max(1, Math.min(16000, Math.floor(count)));
    const target = new Float32Array(this.capacity * 3);
    const scatter = new Float32Array(this.capacity * 3);
    const constellation = new Float32Array(this.capacity * 3);
    const seeds = new Float32Array(this.capacity * 4);

    const center = [0, 0, 0];
    for (let i=0; i<this.sourcePointCount; i++) for (let axis=0; axis<3; axis++) center[axis] += surfacePositions[i*3+axis] / this.sourcePointCount;

    for (let i=0; i<this.capacity; i++) {
      // Input may itself be area-weighted. A stable permutation avoids showing
      // only an input prefix when quality is reduced to a smaller draw range.
      const sourceIndex = Math.min(this.sourcePointCount-1, Math.floor(noise(i, 1) * this.sourcePointCount));
      for (let axis=0; axis<3; axis++) target[i*3+axis] = surfacePositions[sourceIndex*3+axis];
      const s0=noise(i, 2), s1=noise(i, 3), s2=noise(i, 4), s3=noise(i, 5);
      seeds.set([s0,s1,s2,s3],i*4);
      scatter.set([
        center[0]+(s0-.5)*8.6,
        center[1]+(s1-.5)*5.1,
        center[2]-1.0+(s2-.5)*5.8,
      ],i*3);

      // Four nested diamond paths with restrained depth: an open constellation,
      // not a solid glowing logo or a newly invented product ornament.
      const ring = i % 4;
      const size = 1.47-ring*.23;
      const t=s3*4, edge=Math.floor(t), w=t-edge;
      const corners=[[0,1],[1,0],[0,-1],[-1,0],[0,1]];
      const a=corners[edge], b=corners[edge+1];
      constellation.set([
        center[0]+(a[0]+(b[0]-a[0])*w)*size+(s1-.5)*.012,
        center[1]+(a[1]+(b[1]-a[1])*w)*size*.61+(s2-.5)*.012,
        center[2]-.15+(ring-1.5)*.045+Math.sin(s3*Math.PI*4)*.11,
      ],i*3);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position',new BufferAttribute(target,3));
    geometry.setAttribute('aScatter',new BufferAttribute(scatter,3));
    geometry.setAttribute('aConstellation',new BufferAttribute(constellation,3));
    geometry.setAttribute('aSeed',new BufferAttribute(seeds,4));
    const material = new ShaderMaterial({
      uniforms:{uProgress:{value:0},uTime:{value:0},uPixelRatio:{value:1},uOpacity:{value:1}},
      vertexShader,fragmentShader,transparent:true,depthTest:true,depthWrite:false,
      blending:AdditiveBlending,toneMapped:false,
    });
    this.points = new Points(geometry,material);
    this.points.name = 'ONWARD_Actual_Surface_Particle_Arrival';
    this.points.frustumCulled = false; // Scatter extends beyond final shoe bounds.
    this.points.renderOrder = 2;
    this.group.name = 'ONWARD_Particle_Arrival';
    this.group.userData = {source:'actual supplied 3D product surface samples',formation:'original abstract diamond constellation',replay:'absolute progress; no accumulated simulation'};
    this.group.add(this.points);
    this.setQuality('high');
  }

  update(progress:number, timeSeconds:number, reducedMotion=false) {
    if (this.disposed) return;
    if (!Number.isFinite(progress) || !Number.isFinite(timeSeconds)) return;
    this.progress = clamp(progress);
    this.reducedMotion = reducedMotion;
    this.points.material.uniforms.uProgress.value = this.progress;
    this.points.material.uniforms.uTime.value = Math.max(0,timeSeconds);
    this.group.visible = !reducedMotion && this.progress < 1 && this.opacity > 0;
  }

  setQuality(quality:ArrivalQuality) {
    this.quality = quality;
    const requested = quality==='high'?9000:quality==='balanced'?2800:1200;
    this.points.geometry.setDrawRange(0,Math.min(this.capacity,requested));
  }

  setPixelRatio(value:number) {
    if (Number.isFinite(value)) this.points.material.uniforms.uPixelRatio.value = clamp(value,.5,2);
  }

  setOpacity(value:number) {
    if (!Number.isFinite(value)) return;
    this.opacity = clamp(value);
    this.points.material.uniforms.uOpacity.value = this.opacity;
    this.group.visible = !this.reducedMotion && this.progress < 1 && this.opacity > 0;
  }

  getState() {
    const p=this.progress;
    return {
      progress:p,quality:this.quality,capacity:this.capacity,
      activeCount:this.points.geometry.drawRange.count,sourcePointCount:this.sourcePointCount,
      visible:this.group.visible,reducedMotion:this.reducedMotion,opacity:this.opacity,
      phase:p<.02?'field':p<.34?'constellation':p<.79?'surface':p<1?'handoff':'complete',
      accumulation:false,preRenderedMedia:false,
    };
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.group.removeFromParent();
  }
}
