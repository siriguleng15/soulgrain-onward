import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace, UnsignedByteType } from 'three';
import type { MeshStandardMaterial } from 'three';
import { createWeaveNormalPixels } from '../advertising/scene/StudioMaterials.ts';
/** Chapter-only unprinted fabric, with a woven base and tangent relief. */
export class PlainCanvas {
    readonly normal: DataTexture;
    readonly color: DataTexture;
    constructor() {
        const size = 128, normal = createWeaveNormalPixels(size);
        this.normal = new DataTexture(normal.data, size, size, RGBAFormat, UnsignedByteType);
        const pixels = new Uint8Array(size * size * 4);
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                const i = (y * size + x) * 4, a = x / size * Math.PI * 32, b = y / size * Math.PI * 32, noise = Math.sin(x * 17.13 + y * 61.7) * Math.sin(y * 5.7 - x * 31.3), value = Math.round(233 + 9 * Math.sin(a) * Math.cos(b) + 4 * noise);
                pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
                pixels[i + 3] = 255;
            }
        this.color = new DataTexture(pixels, size, size, RGBAFormat, UnsignedByteType);
        this.color.colorSpace = SRGBColorSpace;
        for (const t of [this.normal, this.color]) {
            t.wrapS = t.wrapT = RepeatWrapping;
            t.repeat.set(20, 20);
            t.generateMipmaps = true;
            t.minFilter = LinearMipmapLinearFilter;
            t.magFilter = LinearFilter;
            t.needsUpdate = true;
        }
    }
    apply(material: MeshStandardMaterial) { material.map = this.color; material.normalMap = this.normal; material.normalScale.set(.65, .65); material.roughness = .86; }
    dispose() { this.normal.dispose(); this.color.dispose(); }
}
