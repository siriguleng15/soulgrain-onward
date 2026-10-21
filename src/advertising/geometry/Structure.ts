import {
  BoxGeometry, BufferAttribute, BufferGeometry, CylinderGeometry, DataTexture,
  DynamicDrawUsage, Group, InstancedMesh, LinearFilter, LinearMipmapLinearFilter, Matrix4, Mesh, MeshDepthMaterial,
  MeshDistanceMaterial, MeshStandardMaterial, Quaternion, RepeatWrapping,
  RGBAFormat, RGBADepthPacking, TorusGeometry, Vector3,
} from 'three';
import { CuffCurve } from './CuffCurve';

const UP = new Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const CROWN_SEAT = .0153;
const DOOR_HALF_ANGLE = TAU * .061;

/** Intersections of the two actual textile diagonal families with its upper
 * datum. Every secondary roof seat bisects a measured top-belt interval. */
export function structureSeats() {
  const textureV = (.504 - .38) * 1.65;
  const period = .25;
  const slope = 313 / 307;
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

/** The architectural echo shares the cuff's moving curve. The completed
 * building is solid felt over a timber frame; it is not a translucent cage. */
export class Structure {
  readonly group = new Group();
  readonly crown = new Group();
  readonly rods: InstancedMesh;
  readonly roof: Mesh<BufferGeometry, MeshStandardMaterial>;
  readonly lattice: InstancedMesh;
  readonly belts: Mesh<TorusGeometry, MeshStandardMaterial>[] = [];
  readonly door = new Group();
  readonly seats = structureSeats();
  private readonly eave: Mesh<BufferGeometry, MeshStandardMaterial>;
  private readonly floor: Mesh<CylinderGeometry, MeshStandardMaterial>;
  private readonly crownMaterials: MeshStandardMaterial[] = [];
  private readonly doorMaterials: MeshStandardMaterial[] = [];
  private readonly latticeLines: { s0: number; s1: number; q0: number; q1: number }[] = [];
  private readonly matrix = new Matrix4();
  private readonly rotation = new Quaternion();
  private readonly center = new Vector3();
  private readonly length = new Vector3();
  private readonly roofPosition: Float32Array;
  private readonly eavePosition: Float32Array;
  private readonly roofSegments = 80;
  private readonly roofRows = 12;
  private readonly feltMap: DataTexture;
  private readonly rodMaterial: MeshStandardMaterial;
  private readonly latticeMaterial: MeshStandardMaterial;
  private readonly beltMaterial: MeshStandardMaterial;
  private readonly ringReveal = { value: 0 };
  private oldSignature = '';

  constructor(readonly curve: CuffCurve, readonly demonstration: boolean) {
    this.feltMap = this.makeFeltGrain();
    const timber = 0xd8cdb8;
    this.rodMaterial = this.material(timber, .64);
    this.latticeMaterial = this.material(0xc9bda5, .79);
    this.beltMaterial = this.material(0xa69b86, .93);

    // Flat faces catch a narrow light edge, unlike the previous wire-like rods.
    this.rods = new InstancedMesh(new BoxGeometry(.00135, 1, .00175), this.rodMaterial, this.seats.all.length);
    this.rods.instanceMatrix.setUsage(DynamicDrawUsage);
    this.rods.frustumCulled = false;
    this.shadows(this.rods, this.rodMaterial);
    this.group.add(this.rods);

    for (const [radius, y] of [[.0160, -.0005], [.0138, .0012]]) {
      const material = this.material(0xd6cbb8, .63);
      this.crownMaterials.push(material);
      this.angularReveal(material);
      const mesh = new Mesh(new TorusGeometry(radius, .00125, 12, 96), material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = y;
      this.shadows(mesh, material, true);
      this.crown.add(mesh);
    }
    // The open crown remains readable once the felt roof is closed.
    for (let i = 0; i < 4; i++) {
      const material = this.material(0xcfc4af, .72);
      const beam = new Mesh(new BoxGeometry(.0255, .00135, .00145), material);
      beam.rotation.y = i * Math.PI / 4;
      this.crownMaterials.push(material);
      this.shadows(beam, material);
      this.crown.add(beam);
    }
    this.group.add(this.crown);

    const roofGeometry = new BufferGeometry();
    const grid = (this.roofSegments + 1) * (this.roofRows + 1);
    this.roofPosition = new Float32Array(grid * 2 * 3);
    const roofUV = new Float32Array(grid * 2 * 2);
    for (let layer = 0; layer < 2; layer++) for (let j = 0; j <= this.roofRows; j++) for (let i = 0; i <= this.roofSegments; i++) {
      roofUV.set([i / this.roofSegments * 7, j / this.roofRows * 2], (layer * grid + j * (this.roofSegments + 1) + i) * 2);
    }
    roofGeometry.setAttribute('position', new BufferAttribute(this.roofPosition, 3).setUsage(DynamicDrawUsage));
    roofGeometry.setAttribute('uv', new BufferAttribute(roofUV, 2));
    const indices: number[] = [];
    const width = this.roofSegments + 1;
    for (let j = 0; j < this.roofRows; j++) for (let i = 0; i < this.roofSegments; i++) {
      const a = j * width + i, b = a + grid;
      indices.push(a, a + width, a + 1, a + 1, a + width, a + width + 1);
      indices.push(b, b + 1, b + width, b + 1, b + width + 1, b + width);
    }
    // Close both felt edges: thickness remains visible at crown and eave.
    for (let i = 0; i < this.roofSegments; i++) {
      const a = i, b = this.roofRows * width + i;
      indices.push(a, a + 1, a + grid, a + 1, a + grid + 1, a + grid);
      indices.push(b, b + grid, b + 1, b + 1, b + grid, b + grid + 1);
    }
    for (const edge of [0, this.roofSegments]) for (let j = 0; j < this.roofRows; j++) {
      const a = j * width + edge;
      indices.push(a, a + grid, a + width, a + width, a + grid, a + grid + width);
    }
    roofGeometry.setIndex(indices);
    const felt = this.material(0xdad5c8, .92);
    felt.bumpMap = this.feltMap;
    felt.bumpScale = .00013;
    this.roof = new Mesh(roofGeometry, felt);
    this.roof.frustumCulled = false;
    this.shadows(this.roof, felt);
    this.group.add(this.roof);

    // A folded felt lap, rather than a weightless single-polygon roof edge.
    const eaveGeometry = new BufferGeometry();
    this.eavePosition = new Float32Array(width * 4 * 3);
    const eaveIndices: number[] = [];
    for (let i = 0; i < this.roofSegments; i++) for (let side = 0; side < 4; side++) {
      const a = i * 4 + side, b = i * 4 + (side + 1) % 4;
      eaveIndices.push(a, b, a + 4, b, b + 4, a + 4);
    }
    eaveGeometry.setAttribute('position', new BufferAttribute(this.eavePosition, 3).setUsage(DynamicDrawUsage));
    eaveGeometry.setIndex(eaveIndices);
    const eaveMaterial = this.material(0xc9c1af, .94);
    this.eave = new Mesh(eaveGeometry, eaveMaterial);
    this.eave.frustumCulled = false;
    this.shadows(this.eave, eaveMaterial);
    this.group.add(this.eave);

    const cells = 14, rows = 3;
    for (const sign of [-1, 1]) for (let i = -rows; i < cells + rows; i++) for (let j = 0; j < 6; j++) {
      const q0 = j / 6, q1 = (j + 1) / 6;
      const s0 = i / cells + sign * q0 * rows / cells;
      const s1 = i / cells + sign * q1 * rows / cells;
      if (s0 < 0 || s0 > 1 || s1 < 0 || s1 > 1) continue;
      if ((s0 + s1) / 2 > .441 && (s0 + s1) / 2 < .559 && (q0 + q1) / 2 > .30) continue;
      this.latticeLines.push({ s0, s1, q0, q1 });
    }
    this.lattice = new InstancedMesh(new BoxGeometry(.0010, 1, .00145), this.latticeMaterial, this.latticeLines.length);
    this.lattice.instanceMatrix.setUsage(DynamicDrawUsage);
    this.lattice.frustumCulled = false;
    this.shadows(this.lattice, this.latticeMaterial);
    this.group.add(this.lattice);

    const radius = this.curve.meta.length * 1.7 / TAU;
    for (let i = 0; i < 2; i++) {
      // Model at its true radius. Scaling a radius-1 torus previously collapsed
      // its tube thickness, leaving barely visible lines across the entrance.
      const geometry = new TorusGeometry(radius + .002, .00065, 8, 96, TAU - DOOR_HALF_ANGLE * 2);
      geometry.scale(1, 1, 2.25);
      const belt = new Mesh(geometry, this.beltMaterial);
      belt.rotation.x = Math.PI / 2;
      belt.rotation.z = Math.PI / 2 + DOOR_HALF_ANGLE;
      this.shadows(belt, this.beltMaterial);
      this.belts.push(belt);
      this.group.add(belt);
    }

    const frameMat = this.material(0xc7baa0, .78);
    const panelMat = this.material(0xd0c6b2, .86);
    const recessMat = this.material(0xb2a78f, .89);
    this.doorMaterials.push(frameMat, panelMat, recessMat);
    const addBox = (w: number, h: number, d: number, x: number, y: number, z: number, material: MeshStandardMaterial, parent = this.door) => {
      const mesh = new Mesh(new BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      this.shadows(mesh, material);
      parent.add(mesh);
    };
    // Jambs terminate at the floor; a sill and recessed panel give the opening
    // depth. This replaces the floating U-shaped, cylindrical "chair" frame.
    addBox(.0028, .0506, .0050, -.0220, .0253, 0, frameMat);
    addBox(.0028, .0506, .0050, .0220, .0253, 0, frameMat);
    addBox(.0468, .0032, .0054, 0, .0492, 0, frameMat);
    addBox(.0440, .0018, .0060, 0, .0009, -.0001, frameMat);
    addBox(.0394, .0460, .0017, 0, .0246, -.0023, panelMat);
    for (const y of [.0137, .0357]) addBox(.0334, .0185, .0006, 0, y, -.00125, recessMat);
    for (const x of [-.0173, .0173]) addBox(.0014, .0440, .0012, x, .0246, -.0008, panelMat);
    addBox(.0358, .0015, .0012, 0, .0246, -.0008, frameMat);
    this.group.add(this.door);

    const floorMaterial = this.material(0xa39b8a, .94);
    this.floor = new Mesh(new CylinderGeometry(radius - .0018, radius - .0018, .0018, 80), floorMaterial);
    this.shadows(this.floor, floorMaterial);
    this.group.add(this.floor);
  }

  private material(color: number, roughness: number) {
    // Coverage changes only during construction. At opacity=1 the surface is
    // completely opaque and writes normal depth; no back-side scaffold leaks.
    return new MeshStandardMaterial({ color, roughness, metalness: 0, alphaHash: true, transparent: false, depthWrite: true });
  }

  private makeFeltGrain() {
    const size = 128;
    const pixels = new Uint8Array(size * size * 4);
    let seed = 0x84a2f3;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const grain = (seed >>> 24) / 255 - .5;
      const weave = ((x % 3 === 0 ? 1 : 0) + (y % 4 === 0 ? 1 : 0)) * 4;
      const value = Math.round(128 + grain * 22 + weave);
      pixels.set([value, value, value, 255], (y * size + x) * 4);
    }
    const texture = new DataTexture(pixels, size, size, RGBAFormat);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }

  private angularReveal(material: MeshStandardMaterial) {
    material.onBeforeCompile = shader => {
      shader.uniforms.sgRingReveal = this.ringReveal;
      shader.vertexShader = 'varying vec3 sgRingLocal;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsgRingLocal=position;');
      shader.fragmentShader = 'varying vec3 sgRingLocal;uniform float sgRingReveal;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif((atan(sgRingLocal.y,sgRingLocal.x)+3.14159265)/6.2831853>sgRingReveal)discard;');
    };
    material.customProgramCacheKey = () => 'onward-ger-crown-sector-v2';
  }

  private shadows(mesh: Mesh, source: MeshStandardMaterial, angular = false) {
    mesh.castShadow = mesh.receiveShadow = true;
    const coverage = source.userData.coverage ?? { value: 1 };
    source.userData.coverage = coverage;
    const patch = (material: MeshDepthMaterial | MeshDistanceMaterial) => {
      material.alphaHash = true;
      material.onBeforeCompile = shader => {
        shader.uniforms.sgCoverage = coverage;
        shader.fragmentShader = 'uniform float sgCoverage;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a*=sgCoverage;\n#include <alphatest_fragment>');
        if (angular) {
          shader.uniforms.sgRingReveal = this.ringReveal;
          shader.vertexShader = 'varying vec3 sgRingLocal;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nsgRingLocal=position;');
          shader.fragmentShader = 'varying vec3 sgRingLocal;uniform float sgRingReveal;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif((atan(sgRingLocal.y,sgRingLocal.x)+3.14159265)/6.2831853>sgRingReveal)discard;');
        }
      };
      material.customProgramCacheKey = () => `onward-ger-shadow-coverage-v2-${angular}`;
    };
    const depth = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
    const distance = new MeshDistanceMaterial();
    patch(depth);patch(distance);
    mesh.customDepthMaterial = depth;
    mesh.customDistanceMaterial = distance;
  }

  private coverage(material: MeshStandardMaterial, value: number) {
    material.opacity = clamp(value);
    if (material.userData.coverage) material.userData.coverage.value = material.opacity;
    material.visible = material.opacity > .001;
  }

  private seat(s: number, q = 0, outward = 0) {
    const point = this.curve.point(s);
    const angle = this.curve.theta(s);
    point.y += this.curve.meta.height * (.5 - q) + .015;
    point.z += .014;
    point.x -= Math.sin(angle) * outward;
    point.z += Math.cos(angle) * outward;
    return point;
  }

  crownCenter() {
    return this.curve.center.clone().add(new Vector3(0, this.curve.meta.height / 2 + .058, .014));
  }

  private instance(mesh: InstancedMesh, index: number, start: Vector3, end: Vector3, growth = 1) {
    this.length.subVectors(end, start);
    const len = this.length.length() * Math.max(.00001, growth);
    this.rotation.setFromUnitVectors(UP, this.length.normalize());
    this.center.copy(start).addScaledVector(this.length, len / 2);
    this.matrix.compose(this.center, this.rotation, new Vector3(1, len, 1));
    mesh.setMatrixAt(index, this.matrix);
  }

  update(reveal: number, rodGrowth: number, opacity: number, wrap: number, cover: number, lattice: number) {
    this.group.visible = opacity > .001;
    if (!this.group.visible) return;
    const signature = [reveal, rodGrowth, opacity, wrap, cover, lattice, this.curve.revision].map(value => value.toFixed(4)).join(',');
    if (signature === this.oldSignature) return;
    this.oldSignature = signature;
    const finish = clamp(cover / .93);
    const crownScale = 1 + .12 * wrap;
    this.ringReveal.value = reveal;
    const crownCenter = this.crownCenter();
    this.crown.position.copy(crownCenter);
    this.crown.scale.setScalar(crownScale);
    for (const material of this.crownMaterials) this.coverage(material, opacity * reveal);
    this.coverage(this.rodMaterial, opacity);

    this.seats.all.forEach((s, i) => {
      const angle = (s - .5) * TAU;
      const top = crownCenter.clone().add(new Vector3(Math.sin(angle) * CROWN_SEAT * crownScale, 0, Math.cos(angle) * CROWN_SEAT * crownScale));
      const end = this.seat(s, 0, .0003);
      const growth = clamp(rodGrowth * 1.4 - i / this.seats.all.length * .4);
      this.instance(this.rods, i, top, end, growth);
    });
    this.rods.instanceMatrix.needsUpdate = true;

    this.coverage(this.roof.material, opacity * finish);
    this.coverage(this.eave.material, opacity * finish);
    const grid = (this.roofSegments + 1) * (this.roofRows + 1);
    for (let j = 0; j <= this.roofRows; j++) for (let i = 0; i <= this.roofSegments; i++) {
      const s = i / this.roofSegments, t = j / this.roofRows;
      const angle = (s - .5) * TAU;
      const top = crownCenter.clone().add(new Vector3(Math.sin(angle) * CROWN_SEAT * crownScale, 0, Math.cos(angle) * CROWN_SEAT * crownScale));
      const bottom = this.seat(s, 0, .0023);
      const base = top.lerp(bottom, t);
      // Low-amplitude felt drape is geometric; paired surfaces supply real
      // thickness. Roof lies above rafters instead of sharing their centreline.
      const drape = Math.sin(Math.PI * t) * (.0010 + .00022 * Math.sin(s * TAU * 14));
      const at = (j * (this.roofSegments + 1) + i) * 3;
      this.roofPosition.set([base.x, base.y + .0023 + drape, base.z], at);
      this.roofPosition.set([base.x, base.y + .0009 + drape, base.z], at + grid * 3);
    }
    this.roof.geometry.attributes.position.needsUpdate = true;
    this.roof.geometry.computeVertexNormals();
    for (let i = 0; i <= this.roofSegments; i++) {
      const s = i / this.roofSegments;
      for (let corner = 0; corner < 4; corner++) {
        const outer = corner < 2;
        const point = this.seat(s, 0, outer ? .0025 : .0011);
        point.y += corner === 0 || corner === 3 ? .0023 : -.0032;
        this.eavePosition.set(point.toArray(), (i * 4 + corner) * 3);
      }
    }
    this.eave.geometry.attributes.position.needsUpdate = true;
    this.eave.geometry.computeVertexNormals();

    this.lattice.visible = this.demonstration && lattice > .001;
    this.coverage(this.latticeMaterial, opacity * lattice);
    const latticeOffset = .0021 * (1 - finish) - .0018 * finish;
    for (let i = 0; i < this.latticeLines.length; i++) {
      const line = this.latticeLines[i];
      this.instance(this.lattice, i, this.seat(line.s0, line.q0, latticeOffset), this.seat(line.s1, line.q1, latticeOffset));
    }
    this.lattice.instanceMatrix.needsUpdate = true;

    const finalRadius = this.curve.meta.length * 1.7 / TAU;
    const radius = this.curve.meta.length * (1 + .7 * wrap) / (TAU * Math.max(.001, wrap));
    const closure = smooth(.90, 1, wrap);
    this.coverage(this.beltMaterial, opacity * closure);
    this.belts.forEach((belt, i) => {
      belt.visible = this.demonstration && closure > .001;
      belt.position.copy(this.curve.center);
      belt.position.z = this.curve.point(.5).z - radius + .014;
      belt.position.y += this.curve.meta.height * (.5 - (i + 1) / 3) + .015;
      belt.scale.setScalar((radius + .002) / (finalRadius + .002));
    });

    const doorway = smooth(.84, 1, wrap);
    this.door.visible = this.demonstration && doorway > .001;
    this.door.position.copy(this.curve.center);
    this.door.position.y += -this.curve.meta.height / 2 + .015;
    this.door.position.z = this.curve.point(.5).z - radius * (1 - Math.cos(TAU * .055)) + .014 + .0006;
    for (const material of this.doorMaterials) this.coverage(material, opacity * doorway);
    this.floor.visible = this.demonstration && closure * finish > .001;
    this.floor.position.copy(this.curve.center).add(new Vector3(0, -this.curve.meta.height / 2 + .0159, 0));
    this.floor.position.z = this.curve.point(.5).z - radius + .014;
    this.floor.scale.set(radius / finalRadius, 1, radius / finalRadius);
    this.coverage(this.floor.material, opacity * closure * finish);
  }

  dispose() {
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<MeshStandardMaterial | MeshDepthMaterial | MeshDistanceMaterial>();
    this.group.traverse(object => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      if (object.customDepthMaterial) materials.add(object.customDepthMaterial as MeshDepthMaterial);
      if (object.customDistanceMaterial) materials.add(object.customDistanceMaterial as MeshDistanceMaterial);
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    this.feltMap.dispose();
  }
}
