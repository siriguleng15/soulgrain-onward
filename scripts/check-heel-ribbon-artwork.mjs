/** Pure texture-transform checks. The synthetic image is not product artwork. */
import assert from 'node:assert/strict';
import {ClampToEdgeWrapping,RepeatWrapping,SRGBColorSpace,Texture,Vector2} from 'three';
import {configureArtwork} from '../src/heel-motion-lab/RibbonArtwork.ts';

const limits={maxAnisotropy:4,maxTextureSize:8192};
const texture=configureArtwork(new Texture(),573,2048,limits);
assert.equal(texture.colorSpace,SRGBColorSpace);
assert.equal(texture.flipY,false);
assert.equal(texture.wrapS,ClampToEdgeWrapping);
assert.equal(texture.wrapT,RepeatWrapping);
assert.equal(texture.anisotropy,4);
// No lengthwise stretching: a full original occupies its real aspect ratio.
const aspect=2048/573;
assert.ok(Math.abs(new Vector2(.5,aspect).applyMatrix3(texture.matrix).y-1)<1e-12);
assert.ok(Math.abs(new Vector2(.5,aspect/2).applyMatrix3(texture.matrix).y-.5)<1e-12);
assert.equal(new Vector2(0,0).applyMatrix3(texture.matrix).x,0);
assert.equal(new Vector2(1,0).applyMatrix3(texture.matrix).x,1);
assert.equal(new Vector2(.5,0).applyMatrix3(texture.matrix).y,0);
assert.throws(()=>configureArtwork(new Texture(),0,2048,limits),/尺寸无效/);
assert.throws(()=>configureArtwork(new Texture(),573,1.5,limits),/尺寸无效/);
assert.throws(()=>configureArtwork(new Texture(),573,2048,{...limits,maxTextureSize:1024}),/未自动缩放原稿/);
texture.dispose();
console.log('PASS: original aspect ratio, top-to-tip mapping, color space, wrap and device limits');
