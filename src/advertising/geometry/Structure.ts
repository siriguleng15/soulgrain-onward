import { BufferAttribute, BufferGeometry, CylinderGeometry, DoubleSide, DynamicDrawUsage, Group, InstancedMesh, Matrix4, Mesh, MeshStandardMaterial, Quaternion, TorusGeometry, Vector3 } from 'three';
import { CuffCurve } from './CuffCurve';

const UP = new Vector3(0, 1, 0);
const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Intersections of the two actual textile diagonal families with its upper
 * datum. Every secondary roof seat bisects a measured top-belt interval. */
export function structureSeats() {
  const textureV = (.504 - .38) * 1.65;
  const period = .25; const slope = 313 / 307;
  const primary: number[] = [];
  for (const sign of [-1, 1]) for (let k = -12; k < 12; k++) {
    const u = (sign === 1 ? 0 : period) + sign * slope * textureV + k * period;
    if (u > .015 && u < 1.735) primary.push(u / 1.75);
  }
  primary.sort((a, b) => a - b);
  const seats = [...primary];
  for (let i = 0; i < primary.length; i++) {
    const next = i + 1 < primary.length ? primary[i + 1] : primary[0] + 1;
    seats.push(((primary[i] + next) / 2) % 1);
  }
  return { primary, all: seats.sort((a, b) => a - b) };
}

export class Structure {
  readonly group = new Group();
  readonly crown = new Group();
  readonly rods: InstancedMesh;
  readonly roof: Mesh<BufferGeometry, MeshStandardMaterial>;
  readonly lattice: InstancedMesh;
  readonly belts: Mesh<TorusGeometry, MeshStandardMaterial>[] = [];
  readonly door = new Group();
  readonly seats = structureSeats();
  private readonly crownMaterials: MeshStandardMaterial[] = [];
  private readonly latticeLines: { s0: number; s1: number; q0: number; q1: number }[] = [];
  private readonly matrix = new Matrix4(); private readonly rotation = new Quaternion();
  private readonly center = new Vector3(); private readonly length = new Vector3();
  private readonly roofPosition: Float32Array;
  private readonly roofSegments = 64; private readonly roofRows = 10;
  private oldSignature = '';
  private readonly rodMaterial: MeshStandardMaterial;
  private readonly latticeMaterial: MeshStandardMaterial;
  private readonly beltMaterial: MeshStandardMaterial;
  private ringProgress = 0;
  constructor(readonly curve: CuffCurve, readonly demonstration: boolean) {
    const white = 0xddd9cd;
    this.rodMaterial = new MeshStandardMaterial({ color: white, roughness: .53, metalness: .05, transparent: true });
    this.latticeMaterial = new MeshStandardMaterial({ color: 0xc8c3b5, roughness: .68, transparent: true });
    this.beltMaterial = new MeshStandardMaterial({ color: 0xa9a697, roughness: .77, transparent: true });
    this.rods = new InstancedMesh(new CylinderGeometry(.0011, .0014, 1, 10), this.rodMaterial, this.seats.all.length);
    this.rods.instanceMatrix.setUsage(DynamicDrawUsage); this.rods.frustumCulled = false; this.rods.castShadow = true; this.group.add(this.rods);
    const ringMat = new MeshStandardMaterial({ color: white, roughness: .44, metalness: .12, transparent: true });
    for (const [radius, y] of [[.020, .0013], [.0225, -.0013]]) {
      const material = ringMat.clone(); this.crownMaterials.push(material);
      material.onBeforeCompile = shader => {
        shader.uniforms.sgReveal = { value: this.ringProgress };
        material.userData.shader = shader;
        shader.vertexShader = 'varying vec3 sgLocal;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsgLocal=position;');
        shader.fragmentShader = 'varying vec3 sgLocal;uniform float sgReveal;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif((atan(sgLocal.y,sgLocal.x)+3.14159265)/6.2831853>sgReveal)discard;');
      };
      const mesh = new Mesh(new TorusGeometry(radius, .0014, 12, 96), material); mesh.rotation.x = -Math.PI / 2; mesh.position.y = y; mesh.castShadow = true; this.crown.add(mesh);
    }
    // Radial braces in the crown leave an open, structurally legible skylight.
    for (let i = 0; i < 4; i++) {
      const beam = new Mesh(new CylinderGeometry(.00065, .00065, .037, 8), ringMat.clone());
      beam.rotation.z = Math.PI / 2; beam.rotation.y = i * Math.PI / 4; this.crown.add(beam); this.crownMaterials.push(beam.material);
    }
    this.group.add(this.crown);
    const roofGeometry = new BufferGeometry(); const width = this.roofSegments + 1;
    this.roofPosition = new Float32Array(width * (this.roofRows + 1) * 3);
    roofGeometry.setAttribute('position', new BufferAttribute(this.roofPosition, 3));
    const indices: number[] = [];
    for (let j = 0; j < this.roofRows; j++) for (let i = 0; i < this.roofSegments; i++) {
      const a = j * width + i; indices.push(a, a + 1, a + width, a + 1, a + width + 1, a + width);
    }
    roofGeometry.setIndex(indices);
    this.roof = new Mesh(roofGeometry, new MeshStandardMaterial({ color: 0xe4e1d8, roughness: .84, side: DoubleSide, transparent: true, opacity: 0 }));
    this.roof.castShadow = this.roof.receiveShadow = true;this.roof.frustumCulled = false;this.group.add(this.roof);
    // Khana strips cross at stable half-bay stations; they are volumetric rods.
    const cells = 14, rows = 3;
    for (let sign of [-1, 1]) for (let i = -rows; i < cells + rows; i++) for (let j = 0; j < 6; j++) {
      const q0 = j / 6, q1 = (j + 1) / 6;
      const s0 = i / cells + sign * q0 * rows / cells;
      const s1 = i / cells + sign * q1 * rows / cells;
      if (s0 < 0 || s0 > 1 || s1 < 0 || s1 > 1) continue;
      // A real opening in the front wall also clears the frame strips.
      if ((s0 + s1) / 2 > .445 && (s0 + s1) / 2 < .555 && (q0 + q1) / 2 > .32) continue;
      this.latticeLines.push({ s0, s1, q0, q1 });
    }
    this.lattice = new InstancedMesh(new CylinderGeometry(.00072, .00072, 1, 6), this.latticeMaterial, this.latticeLines.length);
    this.lattice.instanceMatrix.setUsage(DynamicDrawUsage);this.lattice.frustumCulled = false;this.group.add(this.lattice);
    for (let i = 1; i <= 2; i++) {
      const belt = new Mesh(new TorusGeometry(1, .0009, 8, 96), this.beltMaterial);belt.rotation.x = Math.PI / 2;this.belts.push(belt);this.group.add(belt);
    }
    for (const [x, y, h, w] of [[-.021, 0, .048, .0015], [.021, 0, .048, .0015], [0, .024, .042, .0015]]) {
      const bar = new Mesh(new CylinderGeometry(w, w, h, 8), ringMat.clone());bar.position.set(x, y, 0);if (x === 0) bar.rotation.z = Math.PI / 2;this.door.add(bar);
    }
    this.group.add(this.door);
  }
  private seat(s: number, q = 0, outward = 0) {
    const point = this.curve.point(s); const a = this.curve.theta(s);
    point.y += this.curve.meta.height * (.5 - q) + .015;
    point.z += .014;
    point.x += -Math.sin(a) * outward;point.z += Math.cos(a) * outward;
    return point;
  }
  crownCenter() { return this.curve.center.clone().add(new Vector3(0, this.curve.meta.height / 2 + .058, .014)); }
  private instance(mesh: InstancedMesh, index: number, start: Vector3, end: Vector3, growth = 1, radius = 1) {
    this.length.subVectors(end, start); const len = this.length.length() * Math.max(.00001, growth);
    this.rotation.setFromUnitVectors(UP, this.length.normalize());this.center.copy(start).addScaledVector(this.length, len / 2);
    this.matrix.compose(this.center, this.rotation, new Vector3(radius, len, radius));mesh.setMatrixAt(index, this.matrix);
  }
  update(reveal: number, rodGrowth: number, opacity: number, wrap: number, cover: number, lattice: number) {
    this.group.visible = opacity > .001;
    if (!this.group.visible) return;
    const signature = [reveal, rodGrowth, opacity, wrap, cover, lattice, this.curve.revision].map(x=>x.toFixed(4)).join(',');if(signature===this.oldSignature)return;this.oldSignature=signature;
    this.ringProgress = reveal;
    const crownCenter = this.crownCenter(); this.crown.position.copy(crownCenter);
    for (const material of this.crownMaterials) {
      material.opacity = opacity * reveal;
      if (material.userData.shader) material.userData.shader.uniforms.sgReveal.value = reveal;
    }
    this.crown.scale.setScalar(1 + .45 * wrap);
    this.rodMaterial.opacity = opacity;
    this.seats.all.forEach((s, i) => {
      const angle = (s - .5) * Math.PI * 2;
      const top = crownCenter.clone().add(new Vector3(Math.sin(angle) * .021 * (1 + .45 * wrap), 0, Math.cos(angle) * .021 * (1 + .45 * wrap)));
      const end = this.seat(s, 0, .001);
      const growth = clamp(rodGrowth * 1.4 - i / this.seats.all.length * .4);
      this.instance(this.rods, i, top, end, growth);
    });this.rods.instanceMatrix.needsUpdate = true;
    this.roof.material.opacity = opacity * cover;
    for (let j = 0; j <= this.roofRows; j++) for (let i = 0; i <= this.roofSegments; i++) {
      const s = i / this.roofSegments, t = j / this.roofRows;
      const angle = (s - .5) * Math.PI * 2;
      const top = crownCenter.clone().add(new Vector3(Math.sin(angle) * .021 * (1 + .45 * wrap), 0, Math.cos(angle) * .021 * (1 + .45 * wrap)));
      const bottom = this.seat(s, 0, .001);const point = top.lerp(bottom, t);
      point.y += Math.sin(Math.PI * t) * .0014;
      this.roofPosition.set(point.toArray(), (j * (this.roofSegments + 1) + i) * 3);
    }
    this.roof.geometry.attributes.position.needsUpdate = true;this.roof.geometry.computeVertexNormals();
    this.lattice.visible = this.demonstration && lattice > .001;
    this.latticeMaterial.opacity = opacity * lattice;
    for (let i = 0; i < this.latticeLines.length; i++) {
      const line = this.latticeLines[i];this.instance(this.lattice, i, this.seat(line.s0, line.q0, .0022), this.seat(line.s1, line.q1, .0022));
    }this.lattice.instanceMatrix.needsUpdate = true;
    const radius = this.curve.meta.length * 1.7 / (2 * Math.PI);
    this.beltMaterial.opacity = opacity * clamp((wrap - .65) / .35);
    this.belts.forEach((belt, i) => {
      belt.visible = this.demonstration && wrap > .65;belt.position.copy(this.curve.center);belt.position.z += .014;
      belt.position.y += this.curve.meta.height * (.5 - (i + 1) / 3) + .015;
      // Scale only the major radius, maintaining fine belt thickness visually.
      belt.scale.set(radius + .0016, radius + .0016, 1);
    });
    this.door.visible = this.demonstration && wrap > .85;
    this.door.position.copy(this.curve.center).add(new Vector3(0, .0035, radius + .016));
    this.door.scale.setScalar(clamp((wrap - .85) / .15));
  }
  dispose() {
    this.group.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});
  }
}
