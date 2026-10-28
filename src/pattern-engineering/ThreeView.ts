/** Millimetre thin-sheet view. One indexed surface is updated in place.
 * Source 2D coordinates never move; picking carries triangle identity and
 * barycentric weights, rather than inferring an inverse from a screenshot.
 */
import {
  AmbientLight, Box3, BufferAttribute, BufferGeometry, DirectionalLight,
  DoubleSide, DynamicDrawUsage, Group, LineBasicMaterial, LineSegments,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, PlaneGeometry,
  Raycaster, Scene, SphereGeometry, Sprite, SpriteMaterial, CanvasTexture,
  SRGBColorSpace, TextureLoader, Triangle, Vector2, Vector3, WebGLRenderer,
} from 'three';
import type { Texture } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type Mm2 = readonly [number, number];
export type Mm3 = readonly [number, number, number];
export type Barycentric3 = readonly [number, number, number];
export type SurfaceAnchor = { triangle: number; barycentric: Barycentric3 };
export type ThreePick = SurfaceAnchor & { flatMm: [number, number]; formedMm: [number, number, number] };
export type ThinMeshInput = {
  flatMm: ArrayLike<number>;
  positionsMm?: ArrayLike<number>;
  indices: ArrayLike<number>;
};
export type SurfaceLandmark = SurfaceAnchor & { id: string; label?: string; color?: string; radiusMm?: number };
export type CameraPreset = 'flat' | 'side' | 'three-quarter';
export type ProjectionFrame = readonly [number, number, number, number]; // left, right, bottom, top, world mm
export type ThreeViewOptions = {
  onPick?: (pick: ThreePick) => void;
  onError?: (error: Error) => void;
  onContextState?: (lost: boolean) => void;
  onCameraChange?: () => void;
  onProgress?: (progress: number) => void;
};
export type ReferencePhoto = { url: string; frameMm: ProjectionFrame; opacity?: number; mirrorX?: boolean };

export class ThreeView {
  readonly scene = new Scene();
  readonly camera = new OrthographicCamera(-150, 150, 150, -150, .1, 10000);
  readonly renderer: WebGLRenderer;
  readonly controls: OrbitControls;
  readonly sheetMaterial = new MeshStandardMaterial({ color: 0x2366b8, roughness: .86, metalness: 0, side: DoubleSide });
  readonly surfaceGroup = new Group();
  private readonly ray = new Raycaster();
  private readonly observer: ResizeObserver;
  private readonly options: ThreeViewOptions;
  private readonly gridGroup = new Group();
  private readonly markers = new Group();
  private readonly sourceCoords: number[] = [];
  private readonly indices: number[] = [];
  private readonly markerSphere = new SphereGeometry(1, 12, 8);
  private readonly selectedMarker: Mesh<SphereGeometry, MeshBasicMaterial>;
  private readonly selectedMaterial = new MeshBasicMaterial({ color: 0xf2a332, depthTest: false });
  private mesh?: Mesh<BufferGeometry, MeshStandardMaterial>;
  private wire?: LineSegments<BufferGeometry, LineBasicMaterial>;
  private positions?: BufferAttribute;
  private currentMm = new Float64Array();
  private edgeIndices: number[] = [];
  private wirePositions?: BufferAttribute;
  private landmarks: SurfaceLandmark[] = [];
  private landmarkObjects: Mesh<SphereGeometry, MeshBasicMaterial>[] = [];
  private selected?: SurfaceAnchor;
  private deform?: (progress: number) => ArrayLike<number>;
  private progress = 0;
  private frame = 0;
  private preset: CameraPreset = 'three-quarter';
  private projectionFrame?: ProjectionFrame;
  private mirrorProjection = true;
  private lastWidth = 0;
  private lastHeight = 0;
  private contextLost = false;
  private disposed = false;
  private hidden = document.hidden;
  private pointer?: { x: number; y: number; id: number; moved: boolean };
  private activePointers = new Set<number>();
  private selectionGesture = false;
  private photo?: Mesh<PlaneGeometry, MeshBasicMaterial>;
  private photoTexture?: Texture;
  private photoGeneration = 0;
  private animationFrame = 0;
  private animationToken = 0;
  private animationResolve?: (completed: boolean) => void;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private readonly visibility = () => {
    this.hidden = document.hidden;
    if (!this.hidden) this.invalidate();
  };

  constructor(readonly host: HTMLElement, options: ThreeViewOptions = {}) {
    this.options = options;
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.outputColorSpace = SRGBColorSpace;
    const canvas = this.renderer.domElement;
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', '毫米单位三维鞋面薄片。单指旋转，双指缩放；轻点表面与二维裁片同步定位。');
    host.append(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = !this.reduced.matches;
    this.controls.dampingFactor = .15;
    this.controls.rotateSpeed = .7;
    this.controls.zoomSpeed = .75;
    this.controls.minZoom = .3;
    this.controls.maxZoom = 8;
    this.controls.addEventListener('change', () => { this.invalidate(); this.options.onCameraChange?.(); });
    this.scene.add(new AmbientLight(0xffffff, 1.45));
    const key = new DirectionalLight(0xffffff, 1.6); key.position.set(-250, 380, -450);
    const fill = new DirectionalLight(0xb8d1ff, .6); fill.position.set(300, 120, 300);
    this.scene.add(key, fill, this.surfaceGroup, this.gridGroup, this.markers);
    this.selectedMarker = new Mesh(this.markerSphere, this.selectedMaterial);
    this.selectedMarker.scale.setScalar(2.1); this.selectedMarker.visible = false;
    this.selectedMarker.renderOrder = 8; this.scene.add(this.selectedMarker);
    canvas.addEventListener('pointerdown', this.pointerDown);
    canvas.addEventListener('pointermove', this.pointerMove);
    canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointercancel', this.pointerCancel);
    canvas.addEventListener('webglcontextlost', this.lost);
    canvas.addEventListener('webglcontextrestored', this.restored);
    document.addEventListener('visibilitychange', this.visibility);
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
  }

  /** A new paper import may replace the mesh. Animation never invokes this. */
  setMesh(input: ThinMeshInput) {
    if (input.flatMm.length % 2 || input.indices.length % 3) throw new Error('裁片顶点或三角索引格式错误。');
    const count = input.flatMm.length / 2;
    if (!count || input.indices.length < 3) throw new Error('真实裁片网格为空。');
    this.cancelAnimation(); this.deform = undefined; this.progress = 0; this.selected = undefined; this.setLandmarks([]);
    const vertices = new Float32Array(count * 3);
    this.currentMm = new Float64Array(count * 3);
    this.sourceCoords.length = 0; this.indices.length = 0;
    for (let i = 0; i < count; i++) {
      const x = input.flatMm[i * 2], y = input.flatMm[i * 2 + 1];
      if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('裁片毫米坐标包含无效值。');
      this.sourceCoords.push(x, y);
      vertices.set([x, y, 0], i * 3);
    }
    for (let i = 0; i < input.indices.length; i++) {
      const index = input.indices[i];
      if (!Number.isInteger(index) || index < 0 || index >= count) throw new Error('裁片三角索引超出范围。');
      this.indices.push(index);
    }
    if (this.mesh) { this.surfaceGroup.remove(this.mesh); this.mesh.geometry.dispose(); }
    if (this.wire) { this.surfaceGroup.remove(this.wire); this.wire.geometry.dispose(); this.wire.material.dispose(); }
    const geometry = new BufferGeometry();
    this.positions = new BufferAttribute(vertices, 3).setUsage(DynamicDrawUsage);
    geometry.setAttribute('position', this.positions);
    geometry.setAttribute('uv', new BufferAttribute(new Float32Array(this.sourceCoords), 2));
    geometry.setIndex(new BufferAttribute(new Uint32Array(this.indices), 1));
    geometry.computeVertexNormals(); geometry.computeBoundingSphere();
    this.mesh = new Mesh(geometry, this.sheetMaterial);
    this.mesh.name = 'SameTopology_ThinUpper'; this.mesh.frustumCulled = false;
    this.surfaceGroup.add(this.mesh);
    const edges = new Set<string>(); this.edgeIndices = [];
    for (let i = 0; i < this.indices.length; i += 3) for (const [a, b] of [[this.indices[i], this.indices[i+1]], [this.indices[i+1], this.indices[i+2]], [this.indices[i+2], this.indices[i]]]) {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (!edges.has(key)) { edges.add(key); this.edgeIndices.push(a, b); }
    }
    const wireGeometry = new BufferGeometry();
    this.wirePositions = new BufferAttribute(new Float32Array(this.edgeIndices.length * 3), 3).setUsage(DynamicDrawUsage);
    wireGeometry.setAttribute('position', this.wirePositions);
    this.wire = new LineSegments(wireGeometry, new LineBasicMaterial({ color: 0x153857, transparent: true, opacity: .3, depthWrite: false }));
    this.wire.visible = false; this.surfaceGroup.add(this.wire);
    this.updatePositions(input.positionsMm ?? vertices);
    this.buildGrid(); this.fit();
  }

  /** Bind the analytical constraint model; no coordinates are accumulated. */
  setDeformer(fn: (progress: number) => ArrayLike<number>) { this.deform = fn; }

  setProgress(progress: number) {
    if (!this.deform) throw new Error('尚未绑定可追踪的裁片形变函数。');
    this.progress = Math.max(0, Math.min(1, progress));
    this.updatePositions(this.deform(this.progress));
    this.options.onProgress?.(this.progress);
  }

  /** Keep BufferGeometry, vertex identity and triangle order throughout. */
  updatePositions(mm: ArrayLike<number>) {
    if (!this.mesh || !this.positions) throw new Error('请先载入真实裁片网格。');
    if (mm.length !== this.positions.array.length) throw new Error('形变顶点数量与原裁片不同，已拒绝切换网格。');
    const target = this.positions.array as Float32Array;
    for (let i = 0; i < mm.length; i++) {
      if (!Number.isFinite(mm[i])) throw new Error('形变包含无效坐标。');
      target[i] = mm[i];
      this.currentMm[i] = mm[i];
    }
    this.positions.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals(); this.mesh.geometry.computeBoundingSphere();
    if (this.wirePositions && this.wire?.visible) {
      const wire = this.wirePositions.array as Float32Array;
      for (let i = 0; i < this.edgeIndices.length; i++) {
        const k = this.edgeIndices[i] * 3;
        wire[i*3] = target[k]; wire[i*3+1] = target[k+1]; wire[i*3+2] = target[k+2];
      }
      this.wirePositions.needsUpdate = true;
    }
    this.updateMarkers(); this.updatePhotoDepth(); this.invalidate();
  }

  /** One cancellable fold/unfold track. Last requested destination wins. */
  animateTo(target: number, durationMs = 1400): Promise<boolean> {
    this.cancelAnimation();
    const token = ++this.animationToken, from = this.progress;
    const to = Math.max(0, Math.min(1, target));
    if (this.reduced.matches || durationMs <= 0) { this.setProgress(to); return Promise.resolve(true); }
    return new Promise(resolve => {
      this.animationResolve = resolve;
      const start = performance.now();
      const tick = (stamp: number) => {
        if (token !== this.animationToken || this.disposed) { resolve(false); return; }
        const t = Math.max(0, Math.min(1, (stamp-start)/durationMs));
        const smooth = t*t*(3-2*t); this.setProgress(from+(to-from)*smooth);
        if (t < 1) this.animationFrame = requestAnimationFrame(tick);
        else { this.animationFrame = 0; this.animationResolve = undefined; resolve(true); }
      };
      this.animationFrame = requestAnimationFrame(tick);
    });
  }
  cancelAnimation() { this.animationToken++; cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; this.animationResolve?.(false); this.animationResolve = undefined; }

  setSelection(anchor?: SurfaceAnchor) { this.selected = anchor; this.updateMarkers(); this.invalidate(); }
  setLandmarks(landmarks: SurfaceLandmark[]) {
    for (const object of this.landmarkObjects) { this.markers.remove(object); object.material.dispose(); }
    this.landmarkObjects = []; this.landmarks = landmarks.map(point => ({ ...point }));
    for (const point of this.landmarks) {
      const object = new Mesh(this.markerSphere, new MeshBasicMaterial({ color: point.color ?? '#d87526', depthTest: false }));
      object.scale.setScalar(point.radiusMm ?? 1.6); object.renderOrder = 7;
      object.userData.landmarkId = point.id; this.landmarkObjects.push(object); this.markers.add(object);
    }
    this.updateMarkers(); this.invalidate();
  }

  anchorPoint(anchor: SurfaceAnchor): ThreePick | undefined {
    if (!this.positions || !Number.isInteger(anchor.triangle) || anchor.triangle < 0 || anchor.triangle*3+2 >= this.indices.length) return;
    const weights = anchor.barycentric;
    if (weights.some(w => !Number.isFinite(w) || w < -.00001) || Math.abs(weights[0]+weights[1]+weights[2]-1) > .0001) return;
    const flat: [number, number] = [0,0], formed: [number, number, number] = [0,0,0];
    for (let k=0;k<3;k++) {
      const i = this.indices[anchor.triangle*3+k], w = weights[k];
      flat[0] += this.sourceCoords[i*2]*w; flat[1] += this.sourceCoords[i*2+1]*w;
      formed[0] += this.currentMm[i*3]*w; formed[1] += this.currentMm[i*3+1]*w; formed[2] += this.currentMm[i*3+2]*w;
    }
    return { triangle: anchor.triangle, barycentric: [...weights], flatMm: flat, formedMm: formed };
  }

  setWireframe(show: boolean) { if (this.wire) this.wire.visible = show; if(show&&this.currentMm.length)this.updatePositions(this.currentMm);this.invalidate(); }
  setGrid(show: boolean) { this.gridGroup.visible = show; this.invalidate(); }
  setColor(color: string) { this.sheetMaterial.color.set(color); this.invalidate(); }
  setOpacity(opacity: number) {
    const alpha = Math.max(0, Math.min(1, opacity));
    this.sheetMaterial.opacity = alpha; this.sheetMaterial.transparent = alpha < .999;
    this.sheetMaterial.depthWrite = alpha >= .999; this.sheetMaterial.needsUpdate = true;
    this.invalidate();
  }
  setInteractionEnabled(enabled: boolean) { this.controls.enabled = enabled; }

  setCameraPreset(preset: CameraPreset) {
    this.preset = preset; this.projectionFrame = undefined; this.fit();
  }
  /** Photo registration must supply its independently calibrated world frame. */
  setProjectionFrame(frame: ProjectionFrame, mirrorX = true) {
    const [left,right,bottom,top] = frame;
    if (![left,right,bottom,top].every(Number.isFinite) || right <= left || top <= bottom) throw new Error('照片投影毫米框无效。');
    this.projectionFrame = [...frame]; this.mirrorProjection = mirrorX;
    this.preset = mirrorX ? 'side' : 'flat'; this.applyProjectionFrame();
  }

  async setReferencePhoto(photo?: ReferencePhoto) {
    const token = ++this.photoGeneration;
    if (this.photo) { this.scene.remove(this.photo); this.photo.geometry.dispose(); this.photo.material.dispose(); this.photo = undefined; }
    this.photoTexture?.dispose(); this.photoTexture = undefined;
    if (!photo) { this.invalidate(); return; }
    try {
      const texture = await new TextureLoader().loadAsync(photo.url);
      if (token !== this.photoGeneration || this.disposed) { texture.dispose(); return; }
      texture.colorSpace = SRGBColorSpace; this.photoTexture = texture;
      const [left,right,bottom,top] = photo.frameMm;
      const material = new MeshBasicMaterial({ map: texture, transparent: true, opacity: photo.opacity ?? .7, side: DoubleSide, depthWrite: false, toneMapped: false });
      this.photo = new Mesh(new PlaneGeometry(right-left,top-bottom),material);
      this.photo.position.set((left+right)/2,(bottom+top)/2,0);
      this.photo.scale.x = photo.mirrorX === false ? 1 : -1;
      this.photo.renderOrder = -2; this.scene.add(this.photo); this.updatePhotoDepth(); this.invalidate();
    } catch (error) { if(token===this.photoGeneration&&!this.disposed)this.options.onError?.(new Error(`原始成鞋照片未载入：${String(error)}`)); }
  }
  setPhotoOpacity(opacity: number) { if (this.photo) this.photo.material.opacity=Math.max(0,Math.min(1,opacity)); this.invalidate(); }

  projectPoint(point: Mm3) {
    this.camera.updateMatrixWorld();
    const p = new Vector3(...point).project(this.camera);
    return { x:(p.x*.5+.5)*this.lastWidth, y:(.5-p.y*.5)*this.lastHeight, visible:p.z>=-1&&p.z<=1&&Math.abs(p.x)<=1&&Math.abs(p.y)<=1 };
  }
  canvas() { return this.renderer.domElement; }
  info() { return { vertexCount:this.sourceCoords.length/2, triangleCount:this.indices.length/3, progress:this.progress, pixelRatio:this.renderer.getPixelRatio(), preset:this.preset, contextLost:this.contextLost, photoVisible:!!this.photo, sameTopology:true }; }

  fit() {
    if (!this.mesh) return;
    if (this.projectionFrame) { this.applyProjectionFrame(); return; }
    const bounds = new Box3().setFromBufferAttribute(this.positions!);
    const center = bounds.getCenter(new Vector3()), size = bounds.getSize(new Vector3());
    const extent = Math.max(size.x,size.y,size.z,10), distance=Math.max(600,extent*4);
    const direction = this.preset==='flat'?new Vector3(0,0,1):this.preset==='side'?new Vector3(0,0,-1):new Vector3(.64,.22,-1).normalize();
    this.controls.target.copy(center); this.camera.position.copy(center).addScaledVector(direction,distance);
    this.camera.up.set(0,1,0); this.camera.lookAt(center); this.camera.updateMatrixWorld();
    this.camera.zoom=1;
    const points:Vector3[]=[];
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])points.push(new Vector3(x,y,z).applyMatrix4(this.camera.matrixWorldInverse));
    const width=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x));
    const height=Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y));
    this.frustum(Math.max(width,10)*1.1,Math.max(height,10)*1.1);
    this.controls.update(); this.updatePhotoDepth(); this.invalidate();
  }

  private frustum(width:number,height:number) {
    const aspect=Math.max(.05,this.lastWidth/Math.max(1,this.lastHeight));
    const h=Math.max(height,width/aspect),w=h*aspect;
    this.camera.left=-w/2;this.camera.right=w/2;this.camera.top=h/2;this.camera.bottom=-h/2;
    this.camera.updateProjectionMatrix();
  }
  private applyProjectionFrame() {
    const [left,right,bottom,top]=this.projectionFrame!;
    const center=new Vector3((left+right)/2,(bottom+top)/2,0);
    this.camera.position.copy(center).add(new Vector3(0,0,this.mirrorProjection?-1200:1200));
    this.controls.target.copy(center);this.camera.up.set(0,1,0);this.camera.zoom=1;this.camera.lookAt(center);
    this.frustum(right-left,top-bottom);this.controls.update();this.updatePhotoDepth();this.invalidate();
  }
  private updateMarkers() {
    const selected=this.selected&&this.anchorPoint(this.selected);
    this.selectedMarker.visible=!!selected;
    if(selected)this.selectedMarker.position.set(...selected.formedMm);
    this.landmarks.forEach((anchor,i)=>{const point=this.anchorPoint(anchor),object=this.landmarkObjects[i];object.visible=!!point;if(point)object.position.set(...point.formedMm);});
  }
  private updatePhotoDepth() {
    if(!this.photo||!this.positions)return;
    const bounds=new Box3().setFromBufferAttribute(this.positions);
    const back=this.camera.position.z<this.controls.target.z;
    this.photo.position.z=back?bounds.max.z+15:bounds.min.z-15;
  }
  private resize() {
    const rect=this.host.getBoundingClientRect();
    this.lastWidth=Math.max(1,rect.width);this.lastHeight=Math.max(1,rect.height);
    this.renderer.setPixelRatio(Math.max(1,Math.min(devicePixelRatio||1,1.5,Math.sqrt(2_400_000/(this.lastWidth*this.lastHeight)))));
    this.renderer.setSize(this.lastWidth,this.lastHeight,false);
    if(this.mesh)this.fit();else this.frustum(300,300);
    this.invalidate();
  }
  private invalidate() {
    if(this.frame||this.disposed||this.hidden||this.contextLost)return;
    this.frame=requestAnimationFrame(()=>{this.frame=0;this.controls.update();this.renderer.render(this.scene,this.camera);});
  }
  private clearGroup(group:Group) {
    for(const object of [...group.children]){group.remove(object);const obj=object as Mesh;if(!(object instanceof Sprite))obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose();if(object instanceof Sprite)object.material.map?.dispose();}
  }
  private buildGrid() {
    this.clearGroup(this.gridGroup);
    if(!this.sourceCoords.length)return;
    const xs=this.sourceCoords.filter((_,i)=>i%2===0),ys=this.sourceCoords.filter((_,i)=>i%2===1);
    const maxX=Math.ceil(Math.max(...xs)/10)*10,maxY=Math.ceil(Math.max(...ys)/10)*10;
    const minX=Math.floor(Math.min(...xs)/10)*10,minY=Math.floor(Math.min(...ys)/10)*10;
    const positions:number[]=[];
    for(let x=minX;x<=maxX;x+=10)positions.push(x,minY,.5,x,maxY,.5);
    for(let y=minY;y<=maxY;y+=10)positions.push(minX,y,.5,maxX,y,.5);
    const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(positions),3));
    const lines=new LineSegments(geometry,new LineBasicMaterial({color:0x879caf,transparent:true,opacity:.22,depthWrite:false}));this.gridGroup.add(lines);
    for(const [text,x,y]of [['0',minX,minY],['10 mm',minX+10,minY],['X / mm',maxX+8,minY],['Y / mm',minX,maxY+8]]as const){const label=this.label(text);label.position.set(x,y,1);this.gridGroup.add(label);}
  }
  private label(text:string) {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const context=canvas.getContext('2d')!;
    context.font='28px sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillStyle='#53687d';context.fillText(text,128,32);
    const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;
    const sprite=new Sprite(new SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(24,6,1);return sprite;
  }

  private pointerDown=(event:PointerEvent)=>{
    this.activePointers.add(event.pointerId);
    if(this.activePointers.size===1){this.pointer={x:event.clientX,y:event.clientY,id:event.pointerId,moved:false};this.selectionGesture=true;}
    else{this.selectionGesture=false;if(this.pointer)this.pointer.moved=true;}
  };
  private pointerMove=(event:PointerEvent)=>{if(this.pointer?.id===event.pointerId&&Math.hypot(event.clientX-this.pointer.x,event.clientY-this.pointer.y)>6)this.pointer.moved=true;};
  private pointerUp=(event:PointerEvent)=>{
    const pointer=this.pointer;
    if(pointer&&pointer.id===event.pointerId&&!pointer.moved&&this.selectionGesture&&this.activePointers.size===1)this.pick(event.clientX,event.clientY);
    this.activePointers.delete(event.pointerId);if(!this.activePointers.size){this.pointer=undefined;this.selectionGesture=false;}
  };
  private pointerCancel=(event:PointerEvent)=>{this.activePointers.delete(event.pointerId);this.pointer=undefined;this.selectionGesture=false;};
  private pick(x:number,y:number) {
    if(!this.mesh||!this.positions||this.contextLost)return;
    const rect=this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(new Vector2((x-rect.left)/rect.width*2-1,1-(y-rect.top)/rect.height*2),this.camera);
    const landmark=this.ray.intersectObjects(this.landmarkObjects,false)[0];
    if(landmark){const index=this.landmarkObjects.indexOf(landmark.object as Mesh<SphereGeometry,MeshBasicMaterial>);const result=this.anchorPoint(this.landmarks[index]);if(result){this.setSelection(result);this.options.onPick?.(result);return;}}
    const hit=this.ray.intersectObject(this.mesh,false)[0];if(!hit||hit.faceIndex==null||!hit.face)return;
    const a=new Vector3().fromBufferAttribute(this.positions,hit.face.a),b=new Vector3().fromBufferAttribute(this.positions,hit.face.b),c=new Vector3().fromBufferAttribute(this.positions,hit.face.c);
    const bary=new Triangle(a,b,c).getBarycoord(hit.point,new Vector3());if(!bary)return;
    const result=this.anchorPoint({triangle:hit.faceIndex,barycentric:[bary.x,bary.y,bary.z]});
    if(result){this.setSelection(result);this.options.onPick?.(result);}
  }
  private lost=(event:Event)=>{event.preventDefault();this.contextLost=true;cancelAnimationFrame(this.frame);this.frame=0;this.cancelAnimation();this.options.onContextState?.(true);this.options.onError?.(new Error('WebGL上下文已丢失，请重新加载恢复三维显示；二维原始数据仍保留。'));};
  private restored=()=>{this.contextLost=false;this.options.onContextState?.(false);this.invalidate();};

  dispose() {
    this.disposed=true;this.photoGeneration++;this.cancelAnimation();cancelAnimationFrame(this.frame);
    this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);
    const canvas=this.renderer.domElement;
    canvas.removeEventListener('pointerdown',this.pointerDown);canvas.removeEventListener('pointermove',this.pointerMove);canvas.removeEventListener('pointerup',this.pointerUp);canvas.removeEventListener('pointercancel',this.pointerCancel);canvas.removeEventListener('webglcontextlost',this.lost);canvas.removeEventListener('webglcontextrestored',this.restored);
    this.controls.dispose();this.mesh?.geometry.dispose();this.wire?.geometry.dispose();this.wire?.material.dispose();
    this.sheetMaterial.dispose();this.markerSphere.dispose();this.selectedMaterial.dispose();
    this.landmarkObjects.forEach(object=>object.material.dispose());this.clearGroup(this.gridGroup);
    this.photo?.geometry.dispose();this.photo?.material.dispose();this.photoTexture?.dispose();
    this.renderer.dispose();canvas.remove();
  }
}
