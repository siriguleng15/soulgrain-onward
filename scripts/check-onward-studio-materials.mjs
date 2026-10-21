/** Regression checks for the advertising-only V8 normal-map repair.
 * Node 24 + existing project dependencies; no browser, source asset writes,
 * texture readback, or model generation.
 * Run: node scripts/check-onward-studio-materials.mjs
 */
import assert from 'node:assert/strict';
import {
  Texture,
  MeshStandardMaterial,
  RepeatWrapping,
  MirroredRepeatWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
} from 'three';
import { StudioMaterials, createWeaveNormalPixels } from '../src/advertising/scene/StudioMaterials.ts';

let checks = 0;
function pass(name) {
  checks++;
  console.log('PASS', name);
}
function close(actual, expected, epsilon = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} differs from ${expected}`);
}
function normalTexture(name = 'Neutral_canvas_weave', width = 128, height = 128) {
  const image = { width, height, data: new Uint8Array(width * height * 4) };
  for (let i = 3; i < image.data.length; i += 4) image.data[i] = 255;
  const texture = new Texture(image);
  texture.name = name;
  return texture;
}

// Validate the encoded pixel payload independently of the helper's summary.
// A black normal map would fail these conditions even if metadata claimed valid.
const tile = createWeaveNormalPixels();
assert.equal(tile.data.byteLength, 128 * 128 * 4);
assert.equal(tile.stats.size, 128);
let minZ = Infinity;
let maxLengthError = 0;
const sum = [0, 0, 0];
for (let i = 0; i < tile.data.length; i += 4) {
  const n = [0, 1, 2].map(channel => tile.data[i + channel] / 255 * 2 - 1);
  assert.equal(tile.data[i + 3], 255);
  assert.ok(n[2] > .98, `Normal at pixel ${i / 4} faces inward or tilts too far`);
  minZ = Math.min(minZ, n[2]);
  maxLengthError = Math.max(maxLengthError, Math.abs(Math.hypot(...n) - 1));
  n.forEach((value, axis) => { sum[axis] += value; });
}
const mean = sum.map(value => value / (128 * 128));
assert.ok(Math.abs(mean[0]) < .005 && Math.abs(mean[1]) < .005);
assert.ok(maxLengthError < .008);
close(minZ, tile.stats.minimumDecodedZ);
close(maxLengthError, tile.stats.maximumUnitLengthError);
mean.forEach((value, axis) => close(value, tile.stats.meanDecodedNormal[axis]));
pass('Generated pixels encode outward, nearly unit normals with neutral mean XY');
for (const size of [0, 16, 33, 127, 128.5]) assert.throws(() => createWeaveNormalPixels(size));
pass('Invalid normal tile dimensions fail explicitly');

const repair = new StudioMaterials();
const bad = normalTexture();
bad.wrapS = RepeatWrapping;
bad.wrapT = MirroredRepeatWrapping;
bad.magFilter = LinearFilter;
bad.minFilter = LinearMipmapLinearFilter;
bad.anisotropy = 4;
bad.offset.set(0, -11);
bad.repeat.set(12, 12);
bad.center.set(.4, .6);
bad.rotation = .15;
bad.channel = 1;
bad.flipY = false;
bad.generateMipmaps = true;
bad.updateMatrix();
bad.matrixAutoUpdate = false;
const badImage = bad.image;
const badPixels = bad.image.data.slice();
const art = new Texture({ width: 1, height: 1 });
art.offset.set(.13, .4);
art.repeat.set(.75, 1.2);
const body = new MeshStandardMaterial({
  map: art,
  normalMap: bad,
  roughness: .7,
  metalness: .02,
  color: 0x23384e,
});
body.name = 'Body_Canvas';
body.normalScale.set(.18, .23);
const originalColor = body.color.toArray();
const normalScale = body.normalScale.toArray();
assert.equal(repair.apply(body), true);
const replacement = body.normalMap;
assert.notEqual(replacement, bad);
assert.equal(body.map, art);
assert.deepEqual(body.color.toArray(), originalColor);
assert.equal(body.roughness, .7);
assert.equal(body.metalness, .02);
assert.deepEqual(body.normalScale.toArray(), normalScale);
assert.equal(body.transparent, false);
assert.deepEqual(art.offset.toArray(), [.13, .4]);
assert.deepEqual(art.repeat.toArray(), [.75, 1.2]);
for (const property of ['wrapS', 'wrapT', 'magFilter', 'minFilter', 'anisotropy', 'rotation', 'channel', 'flipY', 'generateMipmaps', 'matrixAutoUpdate']) {
  assert.equal(replacement[property], bad[property], property);
}
for (const property of ['offset', 'repeat', 'center', 'matrix']) {
  assert.deepEqual(replacement[property].toArray(), bad[property].toArray(), property);
}
assert.equal(replacement.colorSpace, NoColorSpace);
assert.equal(bad.image, badImage);
assert.deepEqual(bad.image.data, badPixels);
pass('Known defect repaired without changing artwork, color, roughness, normal strength, UV or sampler transforms');

for (const texture of [
  normalTexture('Different_Normal'),
  normalTexture('neutral_canvas_weave'),
  normalTexture('Neutral_canvas_weave', 64, 128),
  normalTexture('Neutral_canvas_weave', 128, 64),
  normalTexture('Neutral_canvas_weave', 256, 256),
]) {
  const material = new MeshStandardMaterial({ normalMap: texture });
  const version = material.version;
  assert.equal(repair.apply(material), false);
  assert.equal(material.normalMap, texture);
  assert.equal(material.version, version);
}
const unmapped = new MeshStandardMaterial();
assert.equal(repair.apply(unmapped), false);
assert.equal(unmapped.normalMap, null);
pass('Other image identities, dimensions, and unmapped materials are untouched');

assert.equal(repair.apply(body), false);
assert.equal(body.normalMap, replacement);
const second = new MeshStandardMaterial({ normalMap: bad });
second.name = 'Collar_Canvas';
assert.equal(repair.apply(second), true);
assert.equal(second.normalMap, replacement);
assert.equal(repair.apply(second), false);
assert.equal(repair.info().repairedMaterials, 2);
assert.equal(repair.info().replacementTextures, 1);
assert.equal(repair.info().generatedPixelsBytes, 65536);
assert.deepEqual(repair.info().names, ['Body_Canvas', 'Collar_Canvas']);
pass('Repeated apply is idempotent; materials sharing a source reuse one replacement');

// Separate source texture instances may have different sampling transforms.
// Their tiny wrappers share the generated pixels but have independent lifetime.
const anotherBad = normalTexture();
anotherBad.repeat.set(3, 5);
const third = new MeshStandardMaterial({ normalMap: anotherBad });
third.name = 'Inner_Lining';
assert.equal(repair.apply(third), true);
assert.notEqual(third.normalMap, replacement);
assert.deepEqual(third.normalMap.repeat.toArray(), [3, 5]);
assert.equal(third.normalMap.image.data, replacement.image.data);
let replacementDisposals = 0;
let originalDisposals = 0;
for (const texture of [replacement, third.normalMap]) texture.addEventListener('dispose', () => replacementDisposals++);
for (const texture of [bad, anotherBad, art]) texture.addEventListener('dispose', () => originalDisposals++);
let materialDisposals = 0;
for (const material of [body, second, third]) material.addEventListener('dispose', () => materialDisposals++);
repair.dispose();
assert.equal(replacementDisposals, 2);
assert.equal(originalDisposals, 0);
assert.equal(materialDisposals, 0);
assert.equal(repair.info().replacementTextures, 0);
assert.equal(bad.image, badImage);
assert.deepEqual(bad.image.data, badPixels);
repair.dispose();
assert.equal(replacementDisposals, 2);
assert.equal(originalDisposals, 0);
pass('Disposal releases generated textures exactly once and never disposes original artwork, source images or materials');
console.log(JSON.stringify({ passed: checks, normalValidation: tile.stats }, null, 2));
