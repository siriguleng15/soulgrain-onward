import './design-lab.css';
import {
  ACESFilmicToneMapping, Box3, CanvasTexture, Color, DirectionalLight, Group,
  HemisphereLight, Mesh, MeshStandardMaterial, PCFSoftShadowMap, PerspectiveCamera, PMREMGenerator,
  PlaneGeometry, RepeatWrapping, Scene, ShadowMaterial, SRGBColorSpace,
  Texture, Vector3, WebGLRenderer,
} from 'three';
import type { WebGLRenderTarget } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const MODEL_URL = `${import.meta.env.BASE_URL}assets/soulgrain_onward_refined_v7.glb`;
const SHAFT_TARGET = 'Shaft_Upright';
const labels: Record<string, string> = {
  Body_Canvas: '鞋身帆布', Body_Inner_Canvas: '鞋身内侧',
  Collar_Outer_Canvas: '鞋筒外面（展开可见）', Collar_Canvas: '鞋筒内面（翻下可见）',
  Tongue_Canvas: '鞋舌正面', Tongue_Reverse_Canvas: '鞋舌背面',
  Rubber_Toe: '橡胶鞋头', Rubber_Foxing: '鞋底橡胶围条', Rubber_Outsole: '外底',
  Laces: '鞋带', Eyelets: '金属鞋眼', Heel_Strip: '后跟条', Canvas_Trim: '帆布包边',
  Stitching: '缝线', Inner_Lining: '内衬',
};
const canvasPartNames = new Set(['Body_Canvas', 'Body_Inner_Canvas', 'Collar_Outer_Canvas', 'Collar_Canvas', 'Tongue_Canvas', 'Tongue_Reverse_Canvas', 'Heel_Strip', 'Canvas_Trim', 'Inner_Lining']);
const root = document.querySelector<HTMLDivElement>('#design-lab')!;
root.innerHTML = `
  <header class="lab-header">
    <a class="brand" href="${import.meta.env.BASE_URL}" aria-label="返回 SoulGrain 网站">SOULGRAIN<sup>™</sup></a>
    <span class="header-note">ONWARD / SHAPE & MATERIAL STUDY</span>
  </header>
  <main class="lab-layout">
    <section class="viewport" aria-label="可旋转的三维鞋型">
      <div class="stage-title"><p class="eyebrow">SoulGrain · 前进</p><h1>ONWARD</h1><p>一只鞋，无数种表达。<br>旋转观察鞋型，为每个部件选择自己的色彩。</p></div>
      <div id="stage"></div>
      <div id="stage-message" class="stage-message" role="status" aria-live="polite"><span id="stage-status">正在加载立体鞋型…</span><button id="retry" hidden>重新加载页面</button></div>
      <div class="stage-bottom"><span class="gesture-note"><strong>拖动旋转 · 双指缩放</strong><br>鼠标滚轮也可调整距离</span><button id="reset-view" disabled>恢复视角 ↗</button></div>
    </section>
    <aside class="controls-panel" aria-label="部件外观编辑">
      <p class="eyebrow">YOUR INTERPRETATION</p><h2 class="panel-heading">鞋型工作台</h2>
      <p class="panel-intro">同一只鞋，两种形态。翻起或折下鞋筒与鞋舌，再为每个部件选择自己的颜色和印花。</p>
      <section class="control-section shape-section"><span class="control-label"><span class="step-number">01</span>鞋筒与鞋舌形态</span><div class="shape-switch" role="group" aria-label="切换同一鞋模的形态"><button id="mode-folded" type="button" aria-pressed="true" disabled>外翻折下</button><button id="mode-upright" type="button" aria-pressed="false" disabled>高帮展开</button></div><p class="shape-note" id="shape-status" role="status" aria-live="polite">同一模型切换形态，颜色与印花始终保留。</p></section>
      <section class="control-section"><label class="control-label" for="part"><span class="step-number">02</span>选择部件</label><select id="part" disabled><option>等待模型加载</option></select><p class="selected-name" id="part-name"></p></section>
      <section class="control-section"><label class="control-label" for="part-color"><span class="step-number">03</span>部件颜色</label><div class="color-row"><div class="color-input-wrap"><input type="color" id="part-color" value="#dad8d1" disabled aria-label="选择部件颜色"></div><input id="color-code" class="color-code" aria-label="十六进制颜色" value="#DAD8D1" maxlength="7" spellcheck="false" disabled></div><div class="swatches">${[['#e4e0d7','暖白'],['#242a35','墨蓝'],['#595b61','岩灰'],['#83748e','烟紫'],['#9e383e','暗红'],['#b9a88c','沙色']].map(([color,label]) => `<button class="swatch" data-color="${color}" style="--swatch:${color}" aria-label="${label}" title="${label}" disabled></button>`).join('')}</div></section>
      <section class="control-section"><span class="control-label"><span class="step-number">04</span>试穿印花</span><input class="file-input" type="file" id="print-file" accept="image/png,image/jpeg,image/webp" disabled><label for="print-file" class="upload-label">＋ 选择本地图片<span>JPG / PNG / WebP · 图片仅在此设备处理</span></label><p class="print-hint" id="print-note">印花沿部件 UV 展开，不改变立体形状。帆布部件的效果最适合观察图案。</p><div class="pattern-controls" id="pattern-controls" hidden><label class="range-row" for="print-scale"><span>重复</span><input id="print-scale" type="range" min="0.25" max="8" step="0.05" value="1"><output id="scale-output">1.0×</output></label><label class="range-row" for="print-angle"><span>旋转</span><input id="print-angle" type="range" min="-180" max="180" step="1" value="0"><output id="angle-output">0°</output></label></div><button class="small-button" id="clear-print" disabled>移除此部件印花</button><p class="material-note">颜色会与图片叠加。想保留原图颜色，可将部件设为白色。</p></section>
      <section class="control-section"><button class="primary-action" id="export-glb" disabled>下载当前设计 · GLB ↓</button><a class="action-link" href="${MODEL_URL}" download="soulgrain_onward_refined_v7.glb">下载本版双形态基础鞋模</a><button class="reset-styles" id="reset-styles" disabled>恢复所有部件的初始外观</button><p class="export-note">GLB 保留当前形态、颜色、印花与两个形态的数据，可继续旋转查看或导入 Blender 编辑。不会更改服务器上的模型。</p></section>
      <p class="toast" id="notice" role="status" aria-live="polite"></p>
      <footer class="credit"><p>鞋型研究版本 · 尚待实物对照精修<br>此工作台用于形状与材质预览，不代表最终量产设计。</p><p>基础模型：theunclerulez · <a href="https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244" target="_blank" rel="noreferrer">Generic “Converse style” Sneakers</a>，<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>。已修改几何和材质。</p></footer>
    </aside>
  </main>`;

const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const stage = el<HTMLDivElement>('stage');
const message = el<HTMLDivElement>('stage-message');
const status = el<HTMLSpanElement>('stage-status');
const notice = el<HTMLParagraphElement>('notice');
const partSelect = el<HTMLSelectElement>('part');
const colorInput = el<HTMLInputElement>('part-color');
const colorCode = el<HTMLInputElement>('color-code');
const fileInput = el<HTMLInputElement>('print-file');
const scaleInput = el<HTMLInputElement>('print-scale');
const angleInput = el<HTMLInputElement>('print-angle');
const clearPrint = el<HTMLButtonElement>('clear-print');
const exportButton = el<HTMLButtonElement>('export-glb');
const resetView = el<HTMLButtonElement>('reset-view');
const resetStyles = el<HTMLButtonElement>('reset-styles');
const foldedButton = el<HTMLButtonElement>('mode-folded');
const uprightButton = el<HTMLButtonElement>('mode-upright');
const retry = el<HTMLButtonElement>('retry');
retry.addEventListener('click', () => location.reload());

type Part = { material: MeshStandardMaterial; initialColor: Color; initialMap: Texture | null; print: CanvasTexture | null; repeat: number; angle: number; imageName: string; supportsPrint: boolean; };
const parts = new Map<string, Part>();
const morphMeshes: Mesh[] = [];
type ShapeMode = 'folded' | 'upright';
let shapeMode: ShapeMode = 'folded';
let selected = '';
let renderer: WebGLRenderer;
let controls: OrbitControls;
let camera: PerspectiveCamera;
let model: Group;
let scene: Scene;
let environmentTarget: WebGLRenderTarget | undefined;
let frame = 0;
let disposed = false;
let hidden = false;
let modelLoaded = false;
let sphereRadius = 1;
let fittedDistance = 0;
const initialCamera = new Vector3();
const initialTarget = new Vector3();
const originalModelPosition = new Vector3();

function failure(text: string) {
  status.textContent = text;
  message.hidden = false;
  retry.hidden = false;
}

function invalidate() {
  if (frame || disposed || hidden || !renderer || renderer.getContext().isContextLost()) return;
  frame = requestAnimationFrame(() => { frame = 0; renderer.render(scene, camera); });
}

function activePart() { return parts.get(selected); }
function applyShapeMode(targetModel: Group, mode: ShapeMode) {
  targetModel.traverse(node => {
    if (!(node instanceof Mesh) || !node.morphTargetInfluences) return;
    const target = node.morphTargetDictionary?.[SHAFT_TARGET];
    if (target !== undefined) node.morphTargetInfluences[target] = mode === 'upright' ? 1 : 0;
  });
}
function selectShapeMode(mode: ShapeMode) {
  if (!modelLoaded || mode === shapeMode) return;
  applyShapeMode(model, mode);
  shapeMode = mode;
  foldedButton.setAttribute('aria-pressed', String(mode === 'folded'));
  uprightButton.setAttribute('aria-pressed', String(mode === 'upright'));
  el('shape-status').textContent = mode === 'upright' ? '当前：高帮展开。颜色与印花保持不变。' : '当前：外翻折下。颜色与印花保持不变。';
  stage.dataset.shapeMode = mode;
  renderer.shadowMap.needsUpdate = true;
  invalidate();
}
function hasUsableUVs(mesh: Mesh) {
  const uv = mesh.geometry.getAttribute('uv');
  if (!uv || !uv.count) return false;
  const firstU = uv.getX(0), firstV = uv.getY(0);
  let variedU = false, variedV = false;
  for (let index = 1; index < uv.count; index++) {
    variedU ||= Math.abs(uv.getX(index) - firstU) > 1e-6;
    variedV ||= Math.abs(uv.getY(index) - firstV) > 1e-6;
    if (variedU && variedV) return true;
  }
  return false;
}
function colorHex(material: MeshStandardMaterial) { return `#${material.color.getHexString()}`; }
function setColor(hex: string) {
  const part = activePart();
  if (!part || !/^#[0-9a-f]{6}$/i.test(hex)) return;
  part.material.color.set(hex);
  colorInput.value = hex;
  colorCode.value = hex.toUpperCase();
  invalidate();
}
function updatePrint(part: Part) {
  if (!part.print) return;
  const radians = part.angle * Math.PI / 180;
  const cosine = Math.cos(radians), sine = Math.sin(radians);
  part.print.repeat.set(part.repeat, part.repeat);
  // glTF texture transforms have no center property: bake rotation around the
  // fabric's center into offset so the downloaded GLB matches this preview.
  part.print.center.set(0, 0);
  part.print.offset.set(
    .5 - part.repeat * (cosine + sine) * .5,
    .5 - part.repeat * (cosine - sine) * .5,
  );
  part.print.rotation = radians;
  part.print.updateMatrix();
  invalidate();
}
function reflectSelection() {
  const part = activePart();
  if (!part) return;
  const hex = colorHex(part.material);
  colorInput.value = hex;
  colorCode.value = hex.toUpperCase();
  el('part-name').textContent = selected;
  scaleInput.value = String(part.repeat);
  angleInput.value = String(part.angle);
  el('scale-output').textContent = `${part.repeat.toFixed(1)}×`;
  el('angle-output').textContent = `${part.angle}°`;
  el('pattern-controls').hidden = !part.print;
  clearPrint.disabled = !part.print;
  fileInput.disabled = !part.supportsPrint;
  const uploadLabel = document.querySelector<HTMLLabelElement>('.upload-label')!;
  uploadLabel.classList.toggle('unavailable', !part.supportsPrint);
  uploadLabel.setAttribute('aria-disabled', String(!part.supportsPrint));
  el('print-note').textContent = !part.supportsPrint ? '此部件尚未制作可用的印花 UV，目前支持改色。请选择鞋身、鞋筒或鞋舌试穿印花。' : part.print ? `当前图片：${part.imageName}。图片仅保留在此页面，导出后嵌入 GLB。` : canvasPartNames.has(selected) ? '印花沿帆布 UV 展开，不改变立体形状。接缝处的图案对齐仍需在 Blender 中精修。' : '此部件也可试穿印花；不同部件的 UV 比例可能不同。';
}

partSelect.addEventListener('change', () => { selected = partSelect.value; reflectSelection(); notice.textContent = ''; });
foldedButton.addEventListener('click', () => selectShapeMode('folded'));
uprightButton.addEventListener('click', () => selectShapeMode('upright'));
colorInput.addEventListener('input', () => setColor(colorInput.value));
colorCode.addEventListener('change', () => { const hex = colorCode.value.startsWith('#') ? colorCode.value : `#${colorCode.value}`; if (/^#[0-9a-f]{6}$/i.test(hex)) setColor(hex); else { reflectSelection(); notice.textContent = '请输入六位颜色值，例如 #E4E0D7。'; } });
document.querySelectorAll<HTMLButtonElement>('.swatch').forEach(button => button.addEventListener('click', () => setColor(button.dataset.color!)));
scaleInput.addEventListener('input', () => { const part = activePart(); if (!part) return; part.repeat = Number(scaleInput.value); el('scale-output').textContent = `${part.repeat.toFixed(1)}×`; updatePrint(part); });
angleInput.addEventListener('input', () => { const part = activePart(); if (!part) return; part.angle = Number(angleInput.value); el('angle-output').textContent = `${part.angle}°`; updatePrint(part); });

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  const key = selected;
  const part = parts.get(key);
  fileInput.value = '';
  if (!file || !part || !part.supportsPrint) return;
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { notice.textContent = '请选择 JPG、PNG 或 WebP 图片。'; return; }
  if (file.size > 24 * 1024 * 1024) { notice.textContent = '请选择小于 24 MB 的图片，方便 iPad 处理。'; return; }
  notice.textContent = '正在准备印花…';
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建图片画布');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.flipY = false;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    part.print?.dispose();
    part.print = texture;
    part.material.map = texture;
    part.material.needsUpdate = true;
    part.repeat = 1; part.angle = 0; part.imageName = file.name;
    updatePrint(part);
    if (selected === key) reflectSelection();
    notice.textContent = `已应用到${labels[key] ?? key}。图片没有上传。`;
    invalidate();
  } catch { notice.textContent = '无法读取这张图片，请尝试 JPG 或 PNG。'; }
  finally { URL.revokeObjectURL(url); }
});
clearPrint.addEventListener('click', () => {
  const part = activePart();
  if (!part) return;
  part.print?.dispose(); part.print = null;
  part.material.map = part.initialMap;
  part.material.needsUpdate = true;
  part.imageName = ''; part.repeat = 1; part.angle = 0;
  reflectSelection(); invalidate(); notice.textContent = '已移除此部件印花。';
});
resetStyles.addEventListener('click', () => {
  parts.forEach(part => {
    part.material.color.copy(part.initialColor);
    part.print?.dispose(); part.print = null;
    part.material.map = part.initialMap; part.material.needsUpdate = true;
    part.repeat = 1; part.angle = 0; part.imageName = '';
  });
  reflectSelection(); invalidate(); notice.textContent = '所有部件已恢复初始外观。';
});
resetView.addEventListener('click', () => {
  camera.position.copy(initialCamera); controls.target.copy(initialTarget); controls.update(); invalidate();
});

exportButton.addEventListener('click', async () => {
  if (!modelLoaded) return;
  exportButton.disabled = true;
  const exportedMode = shapeMode;
  notice.textContent = '正在将当前形态、材质与印花打包为 GLB…';
  try {
    const exporter = new GLTFExporter();
    const exportModel = model.clone(true);
    applyShapeMode(exportModel, exportedMode);
    exportModel.position.copy(originalModelPosition);
    exportModel.updateMatrix();
    const result = await exporter.parseAsync(exportModel, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
    if (!(result instanceof ArrayBuffer)) throw new Error('未能生成二进制 GLB');
    const blob = new Blob([result], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `soulgrain-onward-${exportedMode}-my-design.glb`; anchor.style.display = 'none';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    notice.textContent = `设计已导出（${(result.byteLength / 1024 / 1024).toFixed(1)} MB）。默认显示${exportedMode === 'upright' ? '高帮展开' : '外翻折下'}，保留双形态数据。`;
  } catch (error) { console.error(error); notice.textContent = '导出未完成。可减少印花数量后重试，原模型不会受影响。'; }
  finally { exportButton.disabled = false; }
});

async function init() {
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
  } catch { failure('当前浏览器无法使用 WebGL。请在支持 WebGL 的 Safari 或 Chrome 中打开。'); return; }
  scene = new Scene();
  camera = new PerspectiveCamera(36, 1, .001, 100);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = .9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', '立体鞋子：单指或鼠标拖动旋转，双指或滚轮缩放');
  renderer.domElement.setAttribute('tabindex', '0');
  renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); failure('3D 画面已暂停，可能是设备暂时释放了图形资源。请重新加载继续。'); });
  renderer.domElement.addEventListener('webglcontextrestored', () => location.reload());
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; controls.enablePan = false;
  controls.rotateSpeed = .65; controls.zoomSpeed = .8;
  controls.minPolarAngle = .08; controls.maxPolarAngle = Math.PI * .91;
  controls.addEventListener('change', invalidate);
  const room = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer);
  try {
    environmentTarget = pmrem.fromScene(room, .04, .1, 100, { size: 256 });
    scene.environment = environmentTarget.texture;
    scene.environmentIntensity = .55;
    stage.dataset.environment = 'studio';
  } catch (error) {
    console.warn('Studio reflection unavailable; retaining direct lights.', error);
    stage.dataset.environment = 'direct';
  } finally {
    pmrem.dispose();
    room.dispose();
  }
  scene.add(new HemisphereLight(0xf1f4f8, 0x76787b, .85));
  const key = new DirectionalLight(0xfff7ed, 1.9); scene.add(key);
  const fill = new DirectionalLight(0xebf0f8, .95); scene.add(fill);
  const rim = new DirectionalLight(0xeff1ff, 1.1); scene.add(rim);
  const resize = () => {
    const width = stage.clientWidth, height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    if (modelLoaded) {
      const nextDistance = sphereRadius / Math.sin(camera.fov * Math.PI / 360) * Math.max(1, 1 / camera.aspect) * 1.08;
      camera.position.sub(controls.target).multiplyScalar(nextDistance / fittedDistance).add(controls.target);
      initialCamera.sub(initialTarget).normalize().multiplyScalar(nextDistance).add(initialTarget);
      fittedDistance = nextDistance;
      controls.minDistance = sphereRadius * 1.35;
      controls.maxDistance = Math.max(nextDistance * 2, sphereRadius * 6);
      controls.update();
    }
    invalidate();
  };
  new ResizeObserver(resize).observe(stage); resize();
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; if (!hidden) invalidate(); });
  new IntersectionObserver(entries => { hidden = document.hidden || !entries[0].isIntersecting; if (!hidden) invalidate(); }).observe(stage);

  try {
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL, (event) => {
      if (event.total > 0) status.textContent = `正在加载立体鞋型 ${Math.min(99, Math.round(event.loaded / event.total * 100))}%`;
    });
    model = gltf.scene;
    originalModelPosition.copy(model.position);
    const cloned = new Map<string, MeshStandardMaterial>();
    let meshCount = 0;
    model.traverse(node => {
      if (!(node instanceof Mesh)) return;
      meshCount++;
      if (node.morphTargetInfluences && node.morphTargetDictionary?.[SHAFT_TARGET] !== undefined) morphMeshes.push(node);
      node.castShadow = true; node.receiveShadow = true;
      const supportsPrint = hasUsableUVs(node);
      const materialArray = Array.isArray(node.material) ? node.material : [node.material];
      const replacements = materialArray.map(source => {
        if (!(source instanceof MeshStandardMaterial)) return source;
        let material = cloned.get(source.uuid);
        if (material) {
          const part = parts.get(material.name);
          if (part) part.supportsPrint &&= supportsPrint;
        }
        if (!material) {
          const name = source.name.replace(/\.\d+$/, '') || node.name;
          const existing = parts.get(name);
          if (existing) { existing.supportsPrint &&= supportsPrint; cloned.set(source.uuid, existing.material); return existing.material; }
          material = source.clone();
          material.name = name;
          cloned.set(source.uuid, material);
          parts.set(name, { material, initialColor: material.color.clone(), initialMap: material.map, print: null, repeat: 1, angle: 0, imageName: '', supportsPrint });
        }
        return material;
      });
      node.material = Array.isArray(node.material) ? replacements : replacements[0];
    });
    if (!morphMeshes.length) {
      failure('此文件未包含鞋筒双形态数据，暂时无法切换。请检查双形态模型文件。');
      return;
    }
    applyShapeMode(model, 'folded');
    const box = new Box3().setFromObject(model, true);
    applyShapeMode(model, 'upright');
    box.union(new Box3().setFromObject(model, true));
    applyShapeMode(model, 'folded');
    if (box.isEmpty()) throw new Error('模型不包含可见网格');
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    model.position.sub(center);
    scene.add(model);
    const maxSize = Math.max(size.x, size.y, size.z);
    sphereRadius = size.length() / 2;
    const halfFov = camera.fov * Math.PI / 360;
    const distance = sphereRadius / Math.sin(halfFov) * Math.max(1, 1 / camera.aspect) * 1.08;
    fittedDistance = distance;
    camera.near = maxSize * .005; camera.far = maxSize * 100; camera.updateProjectionMatrix();
    initialTarget.set(0, -size.y * .02, 0);
    initialCamera.set(-1.2, .7, 1.65).normalize().multiplyScalar(distance).add(initialTarget);
    camera.position.copy(initialCamera); controls.target.copy(initialTarget);
    controls.minDistance = sphereRadius * 1.35; controls.maxDistance = Math.max(distance * 2, sphereRadius * 6);
    controls.update();
    const floor = new Mesh(new PlaneGeometry(maxSize * 8, maxSize * 8), new ShadowMaterial({ opacity: .2 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -size.y / 2 - maxSize * .012; floor.receiveShadow = true; scene.add(floor);
    key.position.set(-maxSize * 1.5, maxSize * 2.4, maxSize * 2.1); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -maxSize;
    key.shadow.camera.right = key.shadow.camera.top = maxSize; key.shadow.camera.near = maxSize * .1;
    key.shadow.camera.far = maxSize * 8; key.shadow.bias = -0.0002; key.shadow.normalBias = maxSize * .002;
    fill.position.set(-maxSize * 1.7, 0, maxSize * 1.7);
    rim.position.set(maxSize * .5, maxSize * 2, -maxSize * 2);
    const known = Object.keys(labels);
    const names = [...parts.keys()].sort((a, b) => (known.indexOf(a) < 0 ? 99 : known.indexOf(a)) - (known.indexOf(b) < 0 ? 99 : known.indexOf(b)));
    partSelect.replaceChildren(...names.map(name => { const option = document.createElement('option'); option.value = name; option.textContent = labels[name] ?? name; return option; }));
    selected = names.includes('Body_Canvas') ? 'Body_Canvas' : names[0]; partSelect.value = selected;
    document.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>('#part, #part-color, #color-code, #print-file, .swatch, #reset-view, #reset-styles, #export-glb, #mode-folded, #mode-upright').forEach(input => input.disabled = false);
    reflectSelection(); message.hidden = true; modelLoaded = true;
    renderer.shadowMap.needsUpdate = true;
    stage.dataset.loaded = 'true'; stage.dataset.parts = String(parts.size); stage.dataset.meshes = String(meshCount);
    stage.dataset.shapeMode = shapeMode; stage.dataset.morphMeshes = String(morphMeshes.length);
    invalidate();
  } catch (error) { console.error(error); failure('鞋型未能加载。请检查网络后重新加载；页面不会用其他鞋型替代。'); }
}

window.addEventListener('pagehide', (event) => { if (!event.persisted) { disposed = true; cancelAnimationFrame(frame); controls?.dispose(); environmentTarget?.dispose(); renderer?.dispose(); } });
void init();
