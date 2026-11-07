import { BufferAttribute, DataUtils, Mesh } from 'three';
export interface CacheSection {
    offset: number;
    bytes: number;
    shape: number[];
    type: string;
}
export interface MotionContract {
    cacheSHA256: string;
    cacheBytes: number;
    sourceShoeSHA256: string;
    sourcePartsSHA256: string;
    cuffVertices: number;
    flipSteps: number;
    withdrawSteps: number;
    flatPose: number;
    installedPose: number;
    cuffPoses: string[];
    sections: Record<string, CacheSection>;
    palmPose: {
        position: [
            number,
            number,
            number
        ];
        rotationY: number;
    };
    tongueHeight: number;
    followers: {
        node: number;
        primitive: number;
        prefix: string;
        movingVertices: number;
        totalVertices: number;
    }[];
    centerZ: number;
    rootX: number;
    tongueGripAnchor: {
        id: string;
        triangle: number;
        barycentric: [
            number,
            number,
            number
        ];
        clearance: number;
    };
}
export class MorphCache {
    constructor(readonly data: ArrayBuffer, readonly contract: MotionContract) { }
    read(name: string) {
        const s = this.contract.sections[name];
        if (!s)
            throw Error('Missing morph section ' + name);
        if (s.offset + s.bytes > this.data.byteLength)
            throw Error('Truncated morph cache');
        if (s.type === '<f4')
            return new Float32Array(this.data.slice(s.offset, s.offset + s.bytes));
        const bits = new Uint16Array(this.data, s.offset, s.bytes / 2), output = new Float32Array(bits.length);
        for (let i = 0; i < bits.length; i++)
            output[i] = DataUtils.fromHalfFloat(bits[i]);
        return output;
    }
    install(mesh: Mesh, names: string[], clone = true) {
        const g = clone ? mesh.geometry.clone() : mesh.geometry, count = g.getAttribute('position').count;
        g.morphTargetsRelative = false;
        g.morphAttributes.position = [];
        g.morphAttributes.normal = [];
        for (const name of names) {
            const p = this.read(name + '-p'), n = this.read(name + '-n');
            if (p.length !== count * 3 || n.length !== count * 3)
                throw Error('Morph topology mismatch ' + name);
            const pa = new BufferAttribute(p, 3), na = new BufferAttribute(n, 3);
            pa.name = na.name = name;
            g.morphAttributes.position.push(pa);
            g.morphAttributes.normal.push(na);
        }
        mesh.geometry = g;
        mesh.updateMorphTargets();
        mesh.frustumCulled = false;
    }
    static weights(mesh: Mesh, a: number, b: number, mix: number) {
        const weights = mesh.morphTargetInfluences;
        if (!weights)
            return;
        weights.fill(0);
        weights[a] = 1 - mix;
        weights[b] = (weights[b] ?? 0) + mix;
    }
}
