import {
  DataTexture,
  NoColorSpace,
  RGBAFormat,
  UnsignedByteType,
} from 'three';
import type { MeshStandardMaterial, Texture } from 'three';

const BAD_IMAGE_NAME = 'Neutral_canvas_weave';
const TILE_SIZE = 128;

export interface WeaveNormalStats {
  size: number;
  minimumDecodedZ: number;
  meanDecodedNormal: [number, number, number];
  maximumUnitLengthError: number;
}

/** A periodic, tangent-space thread relief. Values encode normals, not a height
 * image: a flat point is approximately (128, 128, 255), never black. */
export function createWeaveNormalPixels(size = TILE_SIZE) {
  if (!Number.isInteger(size) || size < 32 || size % 16 !== 0) {
    throw new Error('Weave normal tile size must be a multiple of 16, at least 32.');
  }
  const data = new Uint8Array(size * size * 4);
  const sums = [0, 0, 0];
  let minimumDecodedZ = 1;
  let maximumUnitLengthError = 0;
  const threads = 16;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + .5) / size * Math.PI * 2 * threads;
      const v = (y + .5) / size * Math.PI * 2 * threads;
      // Derivatives of a continuous woven height field; small slopes keep the
      // existing material.normalScale in charge of the final relief strength.
      const nx = Math.sin(u) * (.10 + .025 * Math.cos(v));
      const ny = Math.sin(v) * (.10 + .025 * Math.cos(u));
      const inverseLength = 1 / Math.hypot(nx, ny, 1);
      const offset = (y * size + x) * 4;
      const normal = [nx * inverseLength, ny * inverseLength, inverseLength];
      const decoded = normal.map((component, axis) => {
        const encoded = Math.round((component * .5 + .5) * 255);
        data[offset + axis] = encoded;
        const value = encoded / 255 * 2 - 1;
        sums[axis] += value;
        return value;
      });
      data[offset + 3] = 255;
      minimumDecodedZ = Math.min(minimumDecodedZ, decoded[2]);
      maximumUnitLengthError = Math.max(maximumUnitLengthError, Math.abs(Math.hypot(...decoded) - 1));
    }
  }
  const count = size * size;
  const stats: WeaveNormalStats = {
    size,
    minimumDecodedZ,
    meanDecodedNormal: sums.map(value => value / count) as [number, number, number],
    maximumUnitLengthError,
  };
  if (minimumDecodedZ < .98 || Math.abs(stats.meanDecodedNormal[0]) > .005 || Math.abs(stats.meanDecodedNormal[1]) > .005) {
    throw new Error('Generated cloth normal tile failed its outward/neutral normal checks.');
  }
  return { data, stats };
}

/** Advertising-only repair of one verified V8 export defect.
 *
 * The embedded image named Neutral_canvas_weave is a 128x128 RGB PNG of 473
 * bytes whose every channel is zero. Its normal decodes toward -Z, incorrectly
 * turning the cloth shading inward. The source GLB/Blender files stay intact.
 * Only that exact image identity and dimensions are replaced; other normal
 * maps, artwork, UV transforms, roughness, normal strength and mesh data stay.
 */
export class StudioMaterials {
  private readonly pixels = createWeaveNormalPixels();
  private readonly replacements = new Map<Texture, DataTexture>();
  private readonly repaired = new WeakSet<MeshStandardMaterial>();
  private readonly materialNames: string[] = [];

  apply(material: MeshStandardMaterial) {
    if (this.repaired.has(material)) return false;
    const original = material.normalMap;
    const image = original?.image as { width?: number; height?: number } | undefined;
    if (!original || original.name !== BAD_IMAGE_NAME || image?.width !== TILE_SIZE || image.height !== TILE_SIZE) {
      return false;
    }
    let replacement = this.replacements.get(original);
    if (!replacement) {
      replacement = new DataTexture(this.pixels.data, TILE_SIZE, TILE_SIZE, RGBAFormat, UnsignedByteType);
      replacement.name = 'SG_Validated_Tangent_Weave';
      replacement.colorSpace = NoColorSpace;
      replacement.mapping = original.mapping;
      replacement.channel = original.channel;
      replacement.wrapS = original.wrapS;
      replacement.wrapT = original.wrapT;
      replacement.magFilter = original.magFilter;
      replacement.minFilter = original.minFilter;
      replacement.anisotropy = original.anisotropy;
      replacement.offset.copy(original.offset);
      replacement.repeat.copy(original.repeat);
      replacement.center.copy(original.center);
      replacement.rotation = original.rotation;
      replacement.matrix.copy(original.matrix);
      replacement.matrixAutoUpdate = original.matrixAutoUpdate;
      replacement.flipY = original.flipY;
      replacement.generateMipmaps = original.generateMipmaps;
      replacement.unpackAlignment = 1;
      replacement.needsUpdate = true;
      this.replacements.set(original, replacement);
    }
    material.normalMap = replacement;
    material.userData.sgNormalRepair = 'V8 black Neutral_canvas_weave replaced only in advertising runtime';
    material.needsUpdate = true;
    this.repaired.add(material);
    this.materialNames.push(material.name);
    return true;
  }

  info() {
    return {
      repairedMaterials: this.materialNames.length,
      names: [...this.materialNames],
      replacementTextures: this.replacements.size,
      generatedPixelsBytes: this.pixels.data.byteLength,
      normalValidation: this.pixels.stats,
    };
  }

  dispose() {
    for (const texture of this.replacements.values()) texture.dispose();
    this.replacements.clear();
  }
}
