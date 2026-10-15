import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const stage = document.querySelector('#stage');
const status = document.querySelector('#status');
const selector = document.querySelector('#view');
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' }); }
catch { status.textContent = '无法创建 WebGL 2，请检查 Safari 图形支持。'; stage.setAttribute('aria-busy', 'false'); }
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor('#dedfe1');
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = false;
  const ambient = new THREE.HemisphereLight(0xffffff, 0x636777, 1.5);
  scene.add(ambient);
  for (const [position, intensity] of [[[3, 4, 3], 2.2], [[-3, 2, -2], 1.2]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(...position); scene.add(light);
  }
  const views = [[0,.1,1], [0,.1,-1], [-.75,.4,1], [-1,.28,0], [-.32,1,0], [1,.35,.18]];
  let model, radius = 1, distance = 6, disposed = false;
  function render() { if (!disposed) renderer.render(scene, camera); }
  controls.addEventListener('change', render);
  function fit() {
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    distance = radius / Math.sin(Math.min(vertical, horizontal) / 2) * 1.12;
    controls.minDistance = radius * 1.2; controls.maxDistance = distance * 2.5;
    camera.near = radius / 100; camera.far = distance * 25; camera.updateProjectionMatrix();
    camera.position.copy(new THREE.Vector3(...views[Number(selector.value)]).normalize().multiplyScalar(distance));
    controls.target.set(0, 0, 0); controls.update(); render();
  }
  new ResizeObserver(() => {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height; fit();
  }).observe(stage);
  const loader = new GLTFLoader();
  let generation = 0;
  function release(object) {
    object.traverse(node => { if (node.isMesh) { node.geometry.dispose(); for (const material of [node.material].flat()) material.dispose(); } });
  }
  async function load(url, name) {
    const current = ++generation;
    stage.setAttribute('aria-busy', 'true'); status.textContent = '正在加载 ' + name + '…';
    try {
      const result = await loader.loadAsync(url);
      if (current !== generation) { release(result.scene); return; }
      const box = new THREE.Box3().setFromObject(result.scene);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) throw Error('模型边界无效');
      if (model) { scene.remove(model); release(model); }
      model = new THREE.Group(); model.add(result.scene);
      result.scene.position.sub(sphere.center);
      radius = sphere.radius; scene.add(model); fit();
      let meshes = 0; result.scene.traverse(n => { if (n.isMesh) meshes++; });
      stage.dataset.meshes = String(meshes);
      status.textContent = name + ' 已载入 · ' + meshes + ' 个网格。请按各角度检查轮廓，加载成功不代表形状验收通过。';
    } catch (error) { if (current === generation) status.textContent = '加载失败：' + error.message; }
    finally { if (current === generation) stage.setAttribute('aria-busy', 'false'); }
  }
  document.querySelector('#reset').onclick = () => { selector.value = '2'; fit(); };
  selector.onchange = fit;
  document.querySelector('#file').onchange = async event => {
    const file = event.target.files[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    await load(url, file.name); URL.revokeObjectURL(url);
  };
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); disposed = true;
    status.textContent = 'WebGL 上下文丢失，请刷新此检查页面重新加载。';
  });
  load('/assets/soulgrain_onward_v3_single_review.glb', '单鞋照片拟合候选');
}
