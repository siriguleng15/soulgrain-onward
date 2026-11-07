import { ACESFilmicToneMapping, BufferAttribute, DirectionalLight, DoubleSide, Group, HemisphereLight, Matrix4, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Quaternion, Scene, ShadowMaterial, SkinnedMesh, SRGBColorSpace, Vector3, WebGLRenderer } from 'three';
import type { Object3D } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { StudioMaterials } from '../advertising/scene/StudioMaterials.ts';
import { CuffActor } from '../tongue-sleeve-lab/CuffActor.ts';
import type { CuffBindings } from '../tongue-sleeve-lab/CuffActor.ts';
import { SurfaceBinding } from '../tongue-sleeve-lab/SurfaceBinding.ts';
import { DISPLAY_SCALE, SHOE_CENTER, SOURCES } from '../tongue-sleeve-lab/Sources.ts';
import { chapterAt, STORY_DURATION } from '../tongue-sleeve-lab/ChapterContract.ts';
import { MorphCache } from './MorphCache.ts';
import type { MotionContract } from './MorphCache.ts';
import { HandPoses } from './HandPoses.ts';
import type { PoseData } from './HandPoses.ts';
import { CrystalCloth } from './CrystalCloth.ts';
import { PlainCanvas } from './PlainCanvas.ts';
import { SilverSurfaceBatch } from './SilverSurfaceBatch.ts';
import { CameraDirector } from './CameraDirector.ts';
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const segment = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
function bezier(a: Vector3, b: Vector3, c: Vector3, d: Vector3, t: number) { return a.clone().multiplyScalar((1 - t) ** 3).addScaledVector(b, 3 * (1 - t) ** 2 * t).addScaledVector(c, 3 * (1 - t) * t * t).addScaledVector(d, t ** 3); }
async function digest(buffer: ArrayBuffer) {
    if (!crypto.subtle)
        return '';
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buffer)), v => v.toString(16).padStart(2, '0')).join('');
}
export class MotionScene {
    readonly scene = new Scene();
    readonly camera = new PerspectiveCamera(35, 1, .025, 60);
    readonly renderer: WebGLRenderer;
    controls: OrbitControls;
    readonly director: CameraDirector;
    readonly product = new Group();
    readonly handGroup = new Group();
    readonly clothGroup = new Group();
    ready = false;
    playing = false;
    time = 0;
    direction = 1;
    speed = 1;
    contextLost = false;
    verified: Record<string, string> = {};
    actor!: CuffActor;
    private silverBatch!: SilverSurfaceBatch;
    hand!: HandPoses;
    crystal!: CrystalCloth;
    contract!: MotionContract;
    grip!: SurfaceBinding;
    readonly tongues: Mesh[] = [];
    readonly eyelets: Mesh[] = [];
    readonly followers: Mesh[] = [];
    private followerNodes = new Map<string, Mesh>();
    revision = 0;
    drawRevision = -1;
    loadedBytes = 0;
    loadingStage = "载入模型与形变";
    private allShoe: Mesh[] = [];
    private abort = new AbortController();
    private frame = 0;
    private disposed = false;
    private last = 0;
    private dirty = true;
    private observer: ResizeObserver;
    private repair = new StudioMaterials();
    private plain = new PlainCanvas();
    private environment;
    private pinchEndPosition = new Vector3();
    private pinchEndRotation = new Quaternion();
    private palmPosition = new Vector3();
    private palmRotation = new Quaternion();
    private metrics = { indexGripMm: 0, thumbGripMm: 0, padGapMm: 0 };
    private renderDurations: number[] = [];
    constructor(readonly host: HTMLElement, readonly changed: () => void) {
        this.renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = .98;
        this.renderer.setClearColor(0x080e17);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        const canvas = this.renderer.domElement;
        canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
        canvas.setAttribute('aria-label', '鞋舌与马蹄袖实时三维动画，可拖动旋转、双指缩放');
        host.append(canvas);
        canvas.addEventListener('pointerdown', this.takeCamera, true);
        canvas.addEventListener('webglcontextlost', this.lost);
        canvas.addEventListener('webglcontextrestored', this.restored);
        this.director = new CameraDirector(this.camera);
        this.controls = this.createControls();
        const pmrem = new PMREMGenerator(this.renderer), room = new RoomEnvironment();
        this.environment = pmrem.fromScene(room, .035);
        this.scene.environment = this.environment.texture;
        this.scene.environmentIntensity = .55;
        pmrem.dispose();
        room.dispose();
        this.scene.add(new HemisphereLight(0xcadcf2, 0x17141c, .5));
        const key = new DirectionalLight(0xf0f4ff, 1.8);
        key.position.set(-3, 7, 5);
        key.castShadow = true;
        const coarse = matchMedia('(pointer:coarse)').matches;
        key.shadow.mapSize.setScalar(coarse ? 1024 : 2048);
        Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .1, far: 25 });
        key.shadow.bias = -.00012;
        key.shadow.normalBias = .005;
        key.shadow.radius = 3;
        this.scene.add(key);
        const rim = new DirectionalLight(0x82bdf1, 1.25);
        rim.position.set(5, 3, -5);
        this.scene.add(rim);
        const fill = new DirectionalLight(0xffffff, .45);
        fill.position.set(-5, 2, -2);
        this.scene.add(fill);
        this.product.name = 'Chapter_Only_Product_Root';
        this.product.scale.setScalar(DISPLAY_SCALE);
        this.product.position.fromArray(SHOE_CENTER).multiplyScalar(-DISPLAY_SCALE);
        this.scene.add(this.product);
        const ground = new Mesh(new PlaneGeometry(200, 200), new ShadowMaterial({ color: 0x000000, opacity: .08, side: DoubleSide }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -.95;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.observer = new ResizeObserver(() => this.resize());
        this.observer.observe(host);
        this.resize();
        document.addEventListener('visibilitychange', this.visibility);
        this.frame = requestAnimationFrame(this.loop);
    }
    private async bytes(path: string, sha?: string) {
        const response = await fetch(import.meta.env.BASE_URL + path, { signal: this.abort.signal });
        if (!response.ok)
            throw Error(path + ' HTTP ' + response.status);
        const data = await response.arrayBuffer();
        this.loadedBytes += data.byteLength;
        this.changed();
        if (sha) {
            const actual = await digest(data);
            if (actual && actual !== sha)
                throw Error('资产SHA不符：' + path);
            this.verified[path] = actual || 'build-verified';
        }
        return data;
    }
    private async json<T>(path: string) { return JSON.parse(new TextDecoder().decode(await this.bytes(path))) as T; }
    async load() {
        const asset = 'tongue-sleeve-lab/assets/', motion = 'tongue-motion-lab/assets/';
        this.contract = await this.json<MotionContract>(motion + 'motion-contract.json');
        const [shoeBytes, partBytes, rigBytes, layout, poses, cacheBytes] = await Promise.all([this.bytes(SOURCES.shoe.url, this.contract.sourceShoeSHA256), this.bytes(asset + 'user-hand-parts.glb', this.contract.sourcePartsSHA256), this.bytes(asset + 'user-hand-rig.glb'), this.json<CuffBindings>(asset + 'cuff-medallion-bindings.json'), this.json<PoseData>(motion + 'hand-contact-poses.json'), this.bytes(motion + 'tongue-cuff-morphs.f16', this.contract.cacheSHA256)]);
        if (this.disposed)
            return;
        const rigHash = await digest(rigBytes);
        if (rigHash && rigHash !== poses.sourceRigSHA256)
            throw Error('手部骨骼与接触姿态源不一致');
        this.verified[asset + 'user-hand-rig.glb'] = rigHash || 'build-verified';
        const loader = new GLTFLoader(), [shoe, parts, rig] = await Promise.all([loader.parseAsync(shoeBytes, ''), loader.parseAsync(partBytes, ''), loader.parseAsync(rigBytes, '')]);
        if (this.disposed)
            return;
        const blankNames = new Set(['Body_Canvas', 'Body_Inner_Canvas', 'Collar_Outer_Canvas', 'Collar_Canvas', 'Canvas_Trim', 'Inner_Lining', 'Tongue_Reverse_Canvas', 'Tongue_Canvas', 'Cuff_Border']);
        shoe.scene.traverse(o => {
            if (!(o instanceof Mesh))
                return;
            this.allShoe.push(o);
            o.castShadow = o.receiveShadow = true;
            const originals = Array.isArray(o.material) ? o.material : [o.material];
            const copies = originals.map(m => {
                const copy = m.clone();
                if (copy instanceof MeshStandardMaterial) {
                    this.repair.apply(copy);
                    if (blankNames.has(copy.name)) {
                        copy.map = null;
                        copy.color.setHex(copy.name.startsWith('Tongue') ? 0xe4ded2 : 0x112e49);
                        copy.roughness = .86;
                        this.plain.apply(copy);
                    }
                }
                return copy;
            });
            o.material = Array.isArray(o.material) ? copies : copies[0];
            let parent: Object3D | null = o, node = -1;
            while (parent) {
                const a = shoe.parser.associations.get(parent);
                if (a?.nodes !== undefined) {
                    node = a.nodes;
                    break;
                }
                parent = parent.parent;
            }
            const primitive = (shoe.parser.associations.get(o) as {
                primitives?: number;
            } | undefined)?.primitives ?? 0;
            if ([27, 28].includes(node))
                o.visible = false;
            if (node === 4)
                this.tongues[primitive] = o;
            if (node === 5)
                this.eyelets[primitive] = o;
            if ([13, 14].includes(node))
                this.followerNodes.set(`${node}:${primitive}`, o);
        });
        this.product.add(shoe.scene);
        this.actor = new CuffActor(parts.scene, layout, rig.scene);
        const silver = this.actor.stones.material;
        if (silver instanceof MeshStandardMaterial) {
            silver.color.setHex(0xd9dee4);
            silver.metalness = 1;
            silver.roughness = .21;
            silver.envMapIntensity = .8;
        }
        this.product.add(this.actor.root);
        this.actor.root.add(this.handGroup, this.clothGroup);
        this.handGroup.add(rig.scene, this.actor.robe, this.actor.underRobe);
        this.clothGroup.add(this.actor.cuff);
        this.actor.root.traverse(o => {
            if (o instanceof Mesh) {
                o.castShadow = o.receiveShadow = true;
                o.frustumCulled = false;
            }
        });
        if (!(this.actor.hand instanceof SkinnedMesh))
            throw Error('手指动画缺少用户手模蒙皮');
        this.hand = new HandPoses(rig.scene, this.actor.hand, poses);
        const skinMaterial = this.actor.hand.material;
        if (skinMaterial instanceof MeshStandardMaterial) {
            skinMaterial.color.setHex(0xd5d0c9);
            skinMaterial.roughness = .64;
        }
        this.loadingStage = '准备连续形变与材质';
        this.changed();
        const cache = new MorphCache(cacheBytes, this.contract);
        for (let i = 0; i < this.tongues.length; i++)
            cache.install(this.tongues[i], [`tongue-${i}-lift`, `tongue-${i}-installed`]);
        for (let i = 0; i < this.eyelets.length; i++)
            cache.install(this.eyelets[i], [`eyelet-${i}-lift`, `eyelet-${i}-installed`]);
        for (const f of this.contract.followers) {
            const mesh = this.followerNodes.get(`${f.node}:${f.primitive}`);
            if (!mesh)
                throw Error('Missing tongue follower');
            cache.install(mesh, [f.prefix + '-lift', f.prefix + '-installed']);
            this.followers.push(mesh);
        }
        cache.install(this.actor.cuff, this.contract.cuffPoses.map((_, i) => `cuff-${i}`), false);
        this.actor.cuff.geometry.setAttribute('uv', new BufferAttribute(cache.read('cuff-uv'), 2));
        this.silverBatch = new SilverSurfaceBatch(this.actor.cuff, this.actor.stones, this.actor.root, layout);
        this.grip = new SurfaceBinding(this.tongues[0], this.contract.tongueGripAnchor);
        this.crystal = await CrystalCloth.load(this.actor.cuff.material as MeshStandardMaterial);
        this.actor.cuff.material = this.crystal.material;
        this.actor.cuff.receiveShadow = false;
        this.loadingStage = '预热 GPU 着色器';
        this.changed();
        this.product.updateMatrixWorld(true);
        await this.renderer.compileAsync(this.scene, this.camera);
        if (this.disposed)
            return;
        this.palmPosition.fromArray(this.contract.palmPose.position);
        this.palmRotation.setFromAxisAngle(new Vector3(0, 1, 0), this.contract.palmPose.rotationY);
        this.ready = true;
        this.setTongue(1, 0);
        this.hand.apply('pinch');
        this.product.updateMatrixWorld(true);
        const gripEnd = this.grip.evaluate();
        const end = this.pinchTransform(gripEnd.position, gripEnd.normal);
        this.pinchEndPosition.copy(end.position);
        this.pinchEndRotation.copy(end.rotation);
        this.renderAt(0, true);
        this.changed();
    }
    private setTongue(lift: number, installed: number) {
        for (const mesh of [...this.tongues, ...this.eyelets, ...this.followers]) {
            const weights = mesh.morphTargetInfluences!;
        weights[0] = lift * (1 - installed);
        // Initial canvas and final cloth share the same fitted tongue shape.
        // The untouched source geometry is retained only as protected input.
        weights[1] = 1 - weights[0];
        }
    }
    private pinchTransform(pointWorld: Vector3, normal: Vector3) {
        const point = this.product.worldToLocal(pointWorld.clone()), n = normal.clone().normalize();
        if (n.y < 0)
            n.negate();
        const direction = new Vector3(1, 0, 0).addScaledVector(n, -n.x).normalize();
        if (direction.lengthSq() < .3)
            direction.set(0, 1, 0);
        const across = new Vector3().crossVectors(n, direction).normalize(), rotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(across, n, direction));
        const pad = this.hand.padLocal('index').applyQuaternion(rotation);
        const position = point.addScaledVector(n, .001).sub(pad);
        return { position, rotation };
    }
    renderAt(seconds: number, forceDirector = false) {
        if (!this.ready || this.disposed)
            return;
        const t = Math.max(0, Math.min(STORY_DURATION, seconds));
        this.time = t;
        const story = chapterAt(t), lift = segment(t, 3.6, 6), install = segment(t, 16.8, 19), flip = segment(t, 7.8, 10.8), withdraw = segment(t, 10.8, 13);
        this.setTongue(lift, install);
        // Pose reconstruction is independent of playback direction and history.
        if (t < 3.6)
            this.hand.apply('entry', 'pinch', segment(t, 2.8, 3.6));
        else if (t < 6)
            this.hand.apply('pinch');
        else if (t < 7.8)
            this.hand.release(segment(t, 6.25, 7.1));
        else if (t < 13.3)
            this.hand.apply('open', 'relax', segment(t, 12.7, 13.3));
        else if (t < 14)
            this.hand.apply('relax');
        else if (t < 14.38)
            this.hand.apply('relax', 'snapReady', segment(t, 14, 14.35));
        else if (t < 14.5)
            this.hand.apply('snapReady', 'snapRelease', segment(t, 14.38, 14.5));
        else
            this.hand.apply('snapRelease', 'relax', segment(t, 14.5, 15.2));
        this.product.updateMatrixWorld(true);
        const binding = this.grip.evaluate(), contact = this.pinchTransform(binding.position, binding.normal);
        let position: Vector3, rotation: Quaternion;
        if (t < 3.6) {
            const a = segment(t, 1.8, 3.6), start = new Vector3(-.32, .18, .10);
            position = bezier(start, new Vector3(-.25, .22, .04), contact.position.clone().add(new Vector3(-.05, .02, .02)), contact.position, a);
            rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2).slerp(contact.rotation, a);
        }
        else if (t <= 6) {
            position = contact.position;
            rotation = contact.rotation;
        }
        else if (t < 7.8) {
            const a = segment(t, 6, 7.8);
            position = bezier(this.pinchEndPosition, this.pinchEndPosition.clone().add(new Vector3(-.025, .12, -.07)), this.palmPosition.clone().add(new Vector3(-.03, .075, -.10)), this.palmPosition, a);
            rotation = this.pinchEndRotation.clone().slerp(this.palmRotation, a);
        }
        else {
            position = this.palmPosition.clone().add(new Vector3(.155 * withdraw, .008 * Math.sin(withdraw * Math.PI), .007 * Math.sin(withdraw * Math.PI)));
            rotation = this.palmRotation.clone();
            if (t >= 14.38 && t < 14.8)
                rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), .06 * Math.sin(segment(t, 14.38, 14.8) * Math.PI)));
            const exit = segment(t, 16.8, 18.5);
            position.add(new Vector3(.23 * exit, .04 * exit, .02 * exit));
        }
        this.handGroup.position.copy(position);
        this.handGroup.quaternion.copy(rotation);
        this.handGroup.visible = t > 1.8 && t < 18.5;
        if (t < 7.8) {
            this.clothGroup.position.copy(position);
            this.clothGroup.quaternion.copy(rotation);
        }
        else {
            this.clothGroup.position.copy(this.palmPosition);
            this.clothGroup.quaternion.copy(this.palmRotation);
        }
        this.actor.cuff.visible = t > 1.8;
        this.actor.stones.visible = t > 1.8;
        if (t <= 7.8)
            MorphCache.weights(this.actor.cuff, 0, 0, 0);
        else if (t < 10.8) {
            const frame = flip * this.contract.flipSteps, a = Math.floor(frame);
            MorphCache.weights(this.actor.cuff, a, Math.min(this.contract.flipSteps, a + 1), frame - a);
        }
        else if (t < 13) {
            const frame = this.contract.flipSteps + withdraw * this.contract.withdrawSteps, a = Math.floor(frame);
            MorphCache.weights(this.actor.cuff, a, Math.min(this.contract.flatPose, a + 1), frame - a);
        }
        else
            MorphCache.weights(this.actor.cuff, this.contract.flatPose, this.contract.installedPose, install);
        for (const eyelet of this.eyelets)
            eyelet.visible = flip < .65;
        this.crystal.set(story.crystalFront);
        this.product.updateMatrixWorld(true);
        this.silverBatch.update();
        const index = this.hand.padWorld('index'), thumb = this.hand.padWorld('thumb'), g = this.grip.evaluate();
        this.metrics = { indexGripMm: index.distanceTo(g.position) / DISPLAY_SCALE * 1000, thumbGripMm: thumb.distanceTo(g.position) / DISPLAY_SCALE * 1000, padGapMm: index.distanceTo(thumb) / DISPLAY_SCALE * 1000 };
        if (forceDirector) {
            this.director.owner = 'director';
            this.controls.enabled = false;
        }
        this.director.apply(t, forceDirector);
        this.revision++;
        this.dirty = true;
        this.changed();
    }
    play(direction = 1) {
        if (!this.ready)
            return;
        this.direction = direction;
        if (direction > 0 && this.time >= 19)
            this.renderAt(0);
        this.playing = true;
        this.last = performance.now();
        this.changed();
    }
    pause() { this.playing = false; this.changed(); }
    replay() { this.pause(); this.renderAt(0, true); this.play(1); }
    reset() { this.pause(); this.renderAt(0, true); }
    seek(time: number) { this.pause(); this.renderAt(time); }
    restoreCamera() { this.controls.enabled = false; this.director.restore(); this.dirty = true; }
    private createControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enabled = false;
        controls.enableDamping = true;
        controls.minDistance = .6;
        controls.maxDistance = 20;
        controls.addEventListener('change', () => {
            if (this.director.owner === 'user')
                this.dirty = true;
        });
        return controls;
    }
    private takeCamera = () => {
        if (!this.ready || this.director.owner === 'user')
            return;
        this.pause();
        const position = this.camera.position.clone(), rotation = this.camera.quaternion.clone(), target = this.director.target.clone();
        this.camera.up.set(0, 1, 0).applyQuaternion(rotation).normalize();
        this.controls.dispose();
        this.controls = this.createControls();
        this.controls.target.copy(target);
        this.camera.position.copy(position);
        this.camera.quaternion.copy(rotation);
        this.director.user();
        this.controls.enabled = true;
        this.controls.update();
    };
    private visibility = () => {
        if (document.hidden)
            this.pause();
        this.last = performance.now();
    };
    private lost = (event: Event) => { event.preventDefault(); this.contextLost = true; this.pause(); this.changed(); };
    private restored = () => { this.environment.dispose(); const pmrem = new PMREMGenerator(this.renderer), room = new RoomEnvironment(); this.environment = pmrem.fromScene(room, .035); this.scene.environment = this.environment.texture; pmrem.dispose(); room.dispose(); this.renderer.shadowMap.needsUpdate = true; this.contextLost = false; this.dirty = true; this.changed(); };
    private resize() { const rect = this.host.getBoundingClientRect(); this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia('(pointer:coarse)').matches ? 1.15 : 1.5)); this.renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false); this.camera.aspect = rect.width / Math.max(1, rect.height); this.camera.updateProjectionMatrix(); if (this.ready && this.director.owner !== 'user')
        this.director.apply(this.time); this.dirty = true; }
    private loop = (now: number) => {
        if (this.disposed)
            return;
        const dt = this.last ? Math.max(0, (now - this.last) / 1000) : 0;
        this.last = now;
        if (this.ready && this.playing && !this.contextLost) {
            const next = this.time + dt * this.speed * this.direction;
            this.renderAt(next);
            if (this.direction > 0 ? next >= 19 : next <= 0)
                this.pause();
        }
        if (this.director.owner === 'user')
            this.controls.update();
        else if (this.director.owner === 'handoff') {
            this.director.apply(this.time);
            this.dirty = true;
        }
        if (this.dirty && !this.contextLost && this.ready) {
            const start = performance.now();
            this.renderer.render(this.scene, this.camera);
            this.drawRevision = this.revision;
            this.renderDurations.push(performance.now() - start);
            if (this.renderDurations.length > 120)
                this.renderDurations.shift();
            this.dirty = false;
        }
        this.frame = requestAnimationFrame(this.loop);
    };
    state() { return { ready: this.ready, revision: this.revision, drawRevision: this.drawRevision, loadedBytes: this.loadedBytes, loadingStage: this.loadingStage, time: this.time, playing: this.playing, direction: this.direction, speed: this.speed, shot: chapterAt(this.time).shot, crystalFront: this.crystal?.front.value ?? 0, cameraOwner: this.director.owner, handVisible: this.handGroup.visible, cuffVisible: this.actor?.cuff.visible, silverCount: this.actor?.layout.stoneCount ?? 0, silverIdentity: this.actor?.stones.uuid, cuffIdentity: this.actor?.cuff.uuid, silverMaterial: this.actor ? (Array.isArray(this.actor.stones.material) ? this.actor.stones.material[0].uuid : this.actor.stones.material.uuid) : null, gripContactMm: { ...this.metrics }, contextLost: this.contextLost, sourceShoeMeshes: this.allShoe.length, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, meanRenderSubmissionMs: this.renderDurations.reduce((a, b) => a + b, 0) / Math.max(1, this.renderDurations.length), verified: { ...this.verified } }; }
    dispose() {
        this.disposed = true;
        this.abort.abort();
        cancelAnimationFrame(this.frame);
        document.removeEventListener('visibilitychange', this.visibility);
        this.observer.disconnect();
        this.controls.dispose();
        this.crystal?.dispose();
        this.actor?.dispose();
        this.repair.dispose();
        this.plain.dispose();
        this.environment.dispose();
        this.scene.traverse(o => {
            if (o instanceof Mesh) {
                o.geometry.dispose();
                for (const m of Array.isArray(o.material) ? o.material : [o.material])
                    m.dispose();
                if (o instanceof SkinnedMesh)
                    o.skeleton.dispose();
            }
        });
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
