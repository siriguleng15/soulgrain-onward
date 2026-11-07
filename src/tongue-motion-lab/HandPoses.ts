import { Bone, Group, Quaternion, SkinnedMesh, Vector3 } from 'three';
export interface PoseData {
    sourceRigSHA256: string;
    pads: {
        index: number;
        middle: number;
        thumb: number;
        palm: number;
    };
    poses: Record<string, Record<string, [
        number,
        number,
        number,
        number
    ]>>;
    pinchContact: {
        errorMetres: number;
        plannedPadGapMetres: number;
    };
    snapContact: {
        errorMetres: number;
    };
}
/** Absolute FK reconstruction. Skin vertices are from the uploaded hand. */
export class HandPoses {
    readonly bones = new Map<string, Bone>();
    private readonly qa = new Quaternion();
    private readonly qb = new Quaternion();
    constructor(readonly root: Group, readonly mesh: SkinnedMesh, readonly data: PoseData) {
        root.traverse(o => {
            if (o instanceof Bone)
                this.bones.set(o.name, o);
        });
        if (this.bones.size !== 22)
            throw Error('Unexpected user-hand rig');
    }
    apply(from: string, to = from, t = 0) {
        const a = this.data.poses[from], b = this.data.poses[to];
        if (!a || !b)
            throw Error('Missing authored hand pose');
        for (const [name, bone] of this.bones) {
            bone.quaternion.copy(this.qa.fromArray(a[name])).slerp(this.qb.fromArray(b[name]), Math.max(0, Math.min(1, t)));
        }
    }
    release(progress: number) {
        const a = this.data.poses.pinch, b = this.data.poses.open, delays: Record<string, number> = { thumb: 0, index: .035, middle: .10, ring: .17, pinky: .24 };
        for (const [name, bone] of this.bones) {
            const delay = delays[name.split('_')[0]] ?? 0, raw = Math.max(0, Math.min(1, (progress - delay) / (1 - delay))), t = raw * raw * (3 - 2 * raw);
            bone.quaternion.copy(this.qa.fromArray(a[name])).slerp(this.qb.fromArray(b[name]), t);
        }
    }
    padLocal(which: keyof PoseData['pads']) { return this.mesh.getVertexPosition(this.data.pads[which], new Vector3()); }
    padWorld(which: keyof PoseData['pads']) { return this.padLocal(which).applyMatrix4(this.mesh.matrixWorld); }
}
