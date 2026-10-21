import { DataTexture, FloatType, NearestFilter, RGBAFormat, Vector3 } from 'three';
import type { CuffMetadata } from '../types';

export class CuffCurve {
  readonly restTexture: DataTexture;
  readonly texture: DataTexture;
  private readonly data: Float32Array;
  private readonly rest: Float32Array;
  private readonly drift: Float32Array;
  revision = 0;
  private lastUnfold = -1;
  private lastWrap = -1;
  readonly center: Vector3;
  readonly panelHeight: number;
  constructor(readonly meta: CuffMetadata, readonly demonstration = false) {
    this.panelHeight = meta.height;
    this.data = new Float32Array(meta.sampleCount * 4);
    this.rest = new Float32Array(meta.sampleCount * 4);
    this.drift = new Float32Array(meta.sampleCount * 2);
    for (let i = 0; i < meta.sampleCount; i++) this.rest.set([...meta.centerline[i], meta.angles[i]], i * 4);
    this.restTexture = this.makeTexture(this.rest);
    this.texture = this.makeTexture(this.data);
    const start = meta.anchor[0] - meta.arc[meta.anchorIndex];
    this.center = new Vector3(start + meta.length / 2, meta.anchor[1], meta.anchor[2]);
    // Integration truncation correction keeps the zero pose exactly V8.
    let x = 0, z = 0; const positions: [number, number][] = [];
    for (let i = 0; i < meta.sampleCount; i++) {
      if (i) { const ds = meta.arc[i] - meta.arc[i - 1]; const a = (meta.angles[i] + meta.angles[i - 1]) / 2; x += ds * Math.cos(a); z += ds * Math.sin(a); }
      positions.push([x, z]);
    }
    const anchor = positions[meta.anchorIndex];
    for (let i = 0; i < meta.sampleCount; i++) {
      this.drift[i * 2] = meta.centerline[i][0] - (positions[i][0] + meta.anchor[0] - anchor[0]);
      this.drift[i * 2 + 1] = meta.centerline[i][2] - (positions[i][1] + meta.anchor[2] - anchor[1]);
    }
    this.update(0, 0);
  }
  private makeTexture(data: Float32Array) {
    const texture = new DataTexture(data, this.meta.sampleCount, 1, RGBAFormat, FloatType);
    texture.minFilter = texture.magFilter = NearestFilter;
    texture.generateMipmaps = false; texture.needsUpdate = true; return texture;
  }
  update(unfold: number, wrap: number) {
    if (Math.abs(unfold - this.lastUnfold) < 1e-7 && Math.abs(wrap - this.lastWrap) < 1e-7) return;
    this.lastUnfold = unfold; this.lastWrap = wrap; this.revision++;
    const m = this.meta; const n = m.sampleCount;
    if (this.demonstration) {
      const circumferenceScale = 1 + .7 * wrap;
      const k = Math.PI * 2 * wrap / (m.length * circumferenceScale);
      const halfAngle = Math.PI * wrap;
      const sinc = Math.abs(halfAngle) < 1e-4 ? 1 - halfAngle * halfAngle / 6 : Math.sin(halfAngle) / halfAngle;
      for (let i = 0; i < n; i++) {
        const u = (m.arc[i] - m.length / 2) * circumferenceScale;
        const a = k * u;
        const x = Math.abs(k) < 1e-5 ? u : Math.sin(a) / k;
        const z = Math.abs(k) < 1e-5 ? 0 : (Math.cos(a) - sinc) / k;
        this.data.set([this.center.x + x, this.center.y, this.center.z + z, -a], i * 4);
      }
    } else {
      let x = 0, z = 0;
      for (let i = 0; i < n; i++) {
        const a = m.angles[i] * (1 - unfold);
        if (i) { const ds = m.arc[i] - m.arc[i - 1]; const angle = (a + m.angles[i - 1] * (1 - unfold)) / 2; x += ds * Math.cos(angle); z += ds * Math.sin(angle); }
        this.data.set([x, m.centerline[i][1] * (1 - unfold) + m.anchor[1] * unfold, z, a], i * 4);
      }
      const dx = m.anchor[0] - this.data[m.anchorIndex * 4]; const dz = m.anchor[2] - this.data[m.anchorIndex * 4 + 2];
      for (let i = 0; i < n; i++) {
        this.data[i * 4] += dx + this.drift[i * 2] * (1 - unfold);
        this.data[i * 4 + 2] += dz + this.drift[i * 2 + 1] * (1 - unfold);
      }
    }
    this.texture.needsUpdate = true;
  }
  point(s: number, out = new Vector3()) {
    const f = Math.max(0, Math.min(this.meta.sampleCount - 1, s * (this.meta.sampleCount - 1)));
    const i = Math.min(this.meta.sampleCount - 2, Math.floor(f)); const w = f - i;
    return out.set(this.data[i * 4] * (1 - w) + this.data[(i + 1) * 4] * w, this.data[i * 4 + 1] * (1 - w) + this.data[(i + 1) * 4 + 1] * w, this.data[i * 4 + 2] * (1 - w) + this.data[(i + 1) * 4 + 2] * w);
  }
  theta(s: number) { const i = Math.round(Math.max(0, Math.min(1, s)) * (this.meta.sampleCount - 1)); return this.data[i * 4 + 3]; }
  dispose() { this.restTexture.dispose(); this.texture.dispose(); }
}
