import { InstancedMesh, Matrix3, Matrix4, Mesh, Quaternion, Vector3 } from 'three';
import type { CuffBindings } from '../tongue-sleeve-lab/CuffActor.ts';
/** Allocation-free evaluation of the same persistent barycentric anchors.
 * The slow, independently tested SurfaceBinding remains the reference check.
 * Only rigid/uniform chapter transforms are accepted; UV or topology changes
 * invalidate the batch rather than silently moving an ornament elsewhere. */
export class SilverSurfaceBatch {
    private readonly geometry;
    private readonly index;
    private readonly uv;
    private readonly vertexCount;
    private readonly vertices: Uint32Array;
    private readonly derivatives: Float64Array;
    private readonly a = new Vector3();
    private readonly b = new Vector3();
    private readonly c = new Vector3();
    private readonly e = new Vector3();
    private readonly f = new Vector3();
    private readonly n = new Vector3();
    private readonly tangent = new Vector3();
    private readonly bitangent = new Vector3();
    private readonly position = new Vector3();
    private readonly scale = new Vector3();
    private readonly temp = new Vector3();
    private readonly inverse = new Matrix4();
    private readonly basis = new Matrix4();
    private readonly instance = new Matrix4();
    private readonly normalMatrix = new Matrix3();
    private readonly rotation = new Quaternion();
    private readonly active: Int32Array;
    private readonly amounts: Float64Array;
    private activeCount = 0;
    private baseWeight = 1;
    constructor(readonly mesh: Mesh, readonly stones: InstancedMesh, readonly root: Mesh['parent'], readonly layout: CuffBindings) {
        this.geometry = mesh.geometry;
        this.index = this.geometry.index;
        this.uv = this.geometry.getAttribute('uv');
        this.vertexCount = this.geometry.getAttribute('position').count;
        this.vertices = new Uint32Array(layout.anchors.length * 3);
        this.derivatives = new Float64Array(layout.anchors.length * 3);
        this.active = new Int32Array(mesh.morphTargetInfluences?.length ?? 0);
        this.amounts = new Float64Array(this.active.length);
        const ids = new Set<string>();
        for (let i = 0; i < layout.anchors.length; i++) {
            const anchor = layout.anchors[i];
            if (ids.has(anchor.id))
                throw Error('Duplicate persistent silver identity');
            ids.add(anchor.id);
            const first = anchor.triangle * 3;
            if (!this.index || first + 2 >= this.index.count)
                throw Error('Invalid silver triangle');
            const a = this.index.getX(first), b = this.index.getX(first + 1), c = this.index.getX(first + 2);
            this.vertices.set([a, b, c], i * 3);
            const du1 = this.uv.getX(b) - this.uv.getX(a), dv1 = this.uv.getY(b) - this.uv.getY(a), du2 = this.uv.getX(c) - this.uv.getX(a), dv2 = this.uv.getY(c) - this.uv.getY(a);
            this.derivatives.set([dv2, dv1, du1 * dv2 - du2 * dv1], i * 3);
        }
    }
    private vertex(id: number, target: Vector3) { const g = this.geometry; target.fromBufferAttribute(g.getAttribute('position'), id).multiplyScalar(this.baseWeight); for (let i = 0; i < this.activeCount; i++)
        target.addScaledVector(this.temp.fromBufferAttribute(g.morphAttributes.position![this.active[i]], id), this.amounts[i]); return target; }
    update() {
        const g = this.mesh.geometry;
        if (g !== this.geometry || g.index !== this.index || g.getAttribute('uv') !== this.uv || g.getAttribute('position').count !== this.vertexCount)
            throw Error('Silver binding topology or UV identity changed');
        if (g.morphTargetsRelative)
            throw Error('Silver batch expects absolute cached poses');
        this.root!.updateWorldMatrix(true, false);
        this.mesh.updateWorldMatrix(true, false);
        this.inverse.copy(this.root!.matrixWorld).invert();
        this.normalMatrix.getNormalMatrix(this.mesh.matrixWorld);
        this.mesh.getWorldScale(this.scale);
        if (Math.max(this.scale.x, this.scale.y, this.scale.z) - Math.min(this.scale.x, this.scale.y, this.scale.z) > 1e-8)
            throw Error('Non-uniform cuff transforms need rebinding');
        const worldScale = this.scale.x;
        this.activeCount = 0;
        this.baseWeight = 1;
        for (let i = 0; i < (this.mesh.morphTargetInfluences?.length ?? 0); i++) {
            const amount = this.mesh.morphTargetInfluences![i];
            if (amount !== 0) {
                this.active[this.activeCount] = i;
                this.amounts[this.activeCount++] = amount;
                this.baseWeight -= amount;
            }
        }
        for (let i = 0; i < this.layout.anchors.length; i++) {
            const anchor = this.layout.anchors[i], offset = i * 3;
            this.vertex(this.vertices[offset], this.a);
            this.vertex(this.vertices[offset + 1], this.b);
            this.vertex(this.vertices[offset + 2], this.c);
            this.e.copy(this.b).sub(this.a);
            this.f.copy(this.c).sub(this.a);
            this.n.crossVectors(this.e, this.f);
            if (this.n.lengthSq() < 1e-24)
                throw Error('Degenerate silver-bound cloth triangle');
            this.n.normalize();
            const weights = anchor.barycentric;
            this.position.copy(this.a).multiplyScalar(weights[0]).addScaledVector(this.b, weights[1]).addScaledVector(this.c, weights[2]).addScaledVector(this.n, anchor.clearance).applyMatrix4(this.mesh.matrixWorld);
            const den = this.derivatives[offset + 2];
            if (Math.abs(den) > 1e-12)
                this.tangent.copy(this.e).multiplyScalar(this.derivatives[offset]).addScaledVector(this.f, -this.derivatives[offset + 1]).divideScalar(den);
            else
                this.tangent.copy(this.e);
            this.tangent.transformDirection(this.mesh.matrixWorld);
            this.n.applyMatrix3(this.normalMatrix).normalize();
            this.bitangent.crossVectors(this.n, this.tangent).normalize();
            this.basis.makeBasis(this.tangent, this.bitangent, this.n);
            this.rotation.setFromRotationMatrix(this.basis);
            const radius = anchor.radius * worldScale;
            this.instance.compose(this.position, this.rotation, this.scale.setScalar(radius)).premultiply(this.inverse);
            this.stones.setMatrixAt(i, this.instance);
        }
        this.stones.instanceMatrix.needsUpdate = true;
    }
}
