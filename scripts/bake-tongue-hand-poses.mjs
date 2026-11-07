/** Author contact poses on the user's mesh; no borrowed hand or animation. */
import { readFile, writeFile } from 'node:fs/promises';
import { Bone, Quaternion, Vector3, SkinnedMesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const root = new URL('../', import.meta.url), bytes = await readFile(new URL('public/tongue-sleeve-lab/assets/user-hand-rig.glb', root)), gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
const scene = gltf.scene, bones = new Map();
let mesh;
scene.traverse(o => { if (o instanceof Bone)
    bones.set(o.name, o); if (o instanceof SkinnedMesh)
    mesh = o; });
if (!mesh)
    throw Error('Missing uploaded user hand skin');
const rest = Object.fromEntries([...bones].map(([n, b]) => [n, b.quaternion.toArray()])), spec = JSON.parse(await readFile(new URL('modeling/tongue-sleeve-lab/separation-report.json', root), 'utf8'));
function reset() { for (const [n, b] of bones)
    b.quaternion.fromArray(rest[n]); scene.updateMatrixWorld(true); }
function finger(name, amount) { for (let i = 1; i <= 3; i++) {
    const b = bones.get(name + '_' + i), axis = name === 'thumb' ? new Vector3(.65, .18, -.30).normalize() : new Vector3(1, 0, 0);
    b.quaternion.fromArray(rest[b.name]).multiply(new Quaternion().setFromAxisAngle(axis, amount * [1.05, 1.25, .65][i - 1]));
} scene.updateMatrixWorld(true); }
function capture() { return Object.fromEntries([...bones].map(([n, b]) => [n, b.quaternion.toArray()])); }
function apply(pose) { for (const [n, q] of Object.entries(pose))
    bones.get(n).quaternion.fromArray(q); scene.updateMatrixWorld(true); }
function closest(raw) { const p = new Vector3(...raw).sub(new Vector3(...spec.rawOrigin)).multiplyScalar(spec.rawToMetres), attribute = mesh.geometry.getAttribute('position'); let best = Infinity, id = 0; for (let i = 0; i < attribute.count; i++) {
    const d = new Vector3().fromBufferAttribute(attribute, i).distanceToSquared(p);
    if (d < best) {
        best = d;
        id = i;
    }
} return id; }
const pads = { index: closest([-.035, .062, .840]), middle: closest([.055, -.065, .938]), thumb: closest([-.244, -.162, .510]), palm: closest([.055, -.19, .45]) };
function point(id) { scene.updateMatrixWorld(true); return mesh.getVertexPosition(id, new Vector3()).applyMatrix4(mesh.matrixWorld); }
function ccdThumb(target) {
    for (let iter = 0; iter < 120; iter++) {
        for (let j = 3; j >= 1; j--) {
            scene.updateMatrixWorld(true);
            const bone = bones.get('thumb_' + j), at = bone.getWorldPosition(new Vector3()), end = point(pads.thumb), from = end.sub(at).normalize(), to = target.clone().sub(at).normalize();
            if (from.lengthSq() < .2 || to.lengthSq() < .2)
                continue;
            const rotation = new Quaternion().setFromUnitVectors(from, to), parent = bone.parent.getWorldQuaternion(new Quaternion());
            rotation.premultiply(parent.clone().invert()).multiply(parent);
            bone.quaternion.premultiply(rotation);
            const angle = bone.quaternion.angleTo(new Quaternion()), limit = j === 1 ? 1.9 : j === 2 ? 1.65 : 1.3;
            if (angle > limit)
                bone.quaternion.slerp(new Quaternion(), 1 - limit / angle);
        }
        if (point(pads.thumb).distanceTo(target) < .00012)
            break;
    }
    return point(pads.thumb).distanceTo(target);
}
reset();
const poses = { open: capture() };
for (const n of ['index', 'middle', 'ring', 'pinky'])
    finger(n, .08);
finger('thumb', .07);
poses.entry = capture();
function contact(which) { let best; for (const curl of [.65, .75, .85, .95, 1.05, 1.15, 1.25, 1.35]) {
    reset();
    finger(which, curl);
    // Slight MCP adduction brings the fingertip toward the thumb, avoiding
    // solving the pinch solely by folding the index into a tight hook.
    if (which === 'index') {
        bones.get('index_1').quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -.12));
        scene.updateMatrixWorld(true);
    }
    for (const other of ['index', 'middle', 'ring', 'pinky'])
        if (other !== which)
            finger(other, which === 'middle' ? .45 : .25);
    const target = point(pads[which]).add(new Vector3(0, -.002, 0));
    const error = ccdThumb(target), candidate = { pose: capture(), error, curl, pad: point(pads[which]).toArray(), thumb: point(pads.thumb).toArray() };
    if (!best || error + curl * .0003 < best.error + best.curl * .0003)
        best = candidate;
} return best; }
const pinch = contact('index'), snap = contact('middle');
poses.pinch = pinch.pose;
poses.snapReady = snap.pose;
reset();
finger('middle', 1.4);
finger('thumb', .18);
finger('index', .3);
finger('ring', .75);
finger('pinky', .8);
poses.snapRelease = capture();
reset();
for (const f of ['index', 'middle', 'ring', 'pinky'])
    finger(f, .12);
finger('thumb', .15);
poses.relax = capture();
const result = { source: 'User hand modle.glb, approved separated mesh + project-authored 22-joint rig', sourceRigSHA256: JSON.parse(await readFile(new URL('modeling/tongue-sleeve-lab/rig-report.json', root), 'utf8')).sha256, pads, poses, pinchContact: { errorMetres: pinch.error, indexCurl: pinch.curl, plannedPadGapMetres: .002 }, snapContact: { errorMetres: snap.error, middleCurl: snap.curl }, scope: 'Authored contact poses and FK data; skin interpenetration still needs rendered review' };
await writeFile(new URL('public/tongue-motion-lab/assets/hand-contact-poses.json', root), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ pads, pinch: result.pinchContact, snap: result.snapContact }, null, 2));
apply(poses.open);
