import { Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { DISPLAY_SCALE, SHOE_CENTER } from '../tongue-sleeve-lab/Sources.ts';
const ease = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
interface Pose {
    position: Vector3;
    quaternion: Quaternion;
    target: Vector3;
    up: Vector3;
}
function world(p: number[]) { return new Vector3().fromArray(p).sub(new Vector3(...SHOE_CENTER)).multiplyScalar(DISPLAY_SCALE); }
function pose(position: number[], target: number[], up = [0, 1, 0]): Pose { const p = world(position), t = world(target); return { position: p, quaternion: new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(p, t, new Vector3(...up))), target: t, up: new Vector3(...up) }; }
const whole = pose([-.285, .210, .335], [-.005, .065, -.0065]);
const intro = pose([-.25, .205, .31], [-.04, .08, -.0065]);
const entry = pose([-.35, .30, .47], [-.08, .09, -.0065]);
const close = pose([-.205, .190, .230], [-.055, .094, -.0065]);
const top = pose([.02, .72, -.0065], [.02, .09, -.0065], [-1, 0, 0]);
const snap = pose([.045, .780, -.0065], [.045, .090, -.0065], [-1, 0, 0]);
function blend(a: Pose, b: Pose, t: number) { const v = ease(t), position = a.position.clone().lerp(b.position, v), target = a.target.clone().lerp(b.target, v), up = a.up.clone().lerp(b.up, v).normalize(); return { position, target, up, quaternion: new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(position, target, up)) }; }
export function cameraAt(t: number) {
    if (t < 1.8)
        return blend(whole, intro, t / 1.8);
    if (t < 3.4)
        return blend(intro, entry, (t - 1.8) / 1.6);
    if (t < 5.2)
        return blend(entry, close, (t - 3.4) / 1.8);
    if (t < 7.4)
        return blend(close, top, (t - 5.2) / 2.2);
    if (t < 11.5)
        return top;
    if (t < 13.5)
        return blend(top, snap, (t - 11.5) / 2);
    if (t < 16.8)
        return snap;
    return blend(snap, whole, (t - 16.8) / 2.2);
}
export class CameraDirector {
    owner: 'director' | 'user' | 'handoff' = 'director';
    private transition?: {
        start: number;
        position: Vector3;
        quaternion: Quaternion;
    };
    readonly target = new Vector3();
    constructor(readonly camera: PerspectiveCamera) { }
    user() { this.owner = 'user'; this.transition = undefined; }
    restore() { this.owner = 'handoff'; this.transition = { start: performance.now(), position: this.camera.position.clone(), quaternion: this.camera.quaternion.clone() }; }
    apply(t: number, immediate = false) {
        if (this.owner === 'user' && !immediate)
            return;
        const raw = cameraAt(t), factor = Math.max(1, 1.2 / this.camera.aspect), p = { ...raw, position: raw.target.clone().add(raw.position.clone().sub(raw.target).multiplyScalar(factor)) };
        this.target.copy(p.target);
        this.camera.up.copy(p.up);
        if (immediate) {
            this.owner = 'director';
            this.transition = undefined;
        }
        if (this.owner === 'handoff' && this.transition) {
            const amount = ease((performance.now() - this.transition.start) / 380);
            this.camera.position.copy(this.transition.position).lerp(p.position, amount);
            this.camera.quaternion.copy(this.transition.quaternion).slerp(p.quaternion, amount);
            if (amount === 1) {
                this.owner = 'director';
                this.transition = undefined;
            }
        }
        else {
            this.camera.position.copy(p.position);
            this.camera.quaternion.copy(p.quaternion);
        }
        this.camera.updateMatrixWorld(true);
    }
}
