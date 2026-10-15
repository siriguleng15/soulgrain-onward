import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Mesh, PerspectiveCamera, Vector3 } from 'three';
import { assetUrl, productAssets, type Edition } from '../product';

type Controls = ComponentRef<typeof OrbitControls>;
const MODEL_DIRECTION = new Vector3(1, 0.65, 1.5).normalize();

function ShoeScene({ url, edition, reduced, reset, onReady }: {
  url: string; edition: Edition; reduced: boolean; reset: number;
  onReady: () => void;
}) {
  const { scene } = useGLTF(url);
  const controls = useRef<Controls>(null);
  const { camera, size, invalidate } = useThree();
  // Clone the hierarchy only: all original vertex data and materials remain intact.
  const model = useMemo(() => {
    const object = scene.clone(true);
    object.updateMatrixWorld(true);
    const box = new Box3().setFromObject(object);
    const dimensions = box.getSize(new Vector3());
    const longest = Math.max(dimensions.x, dimensions.y, dimensions.z);
    if (!Number.isFinite(longest) || longest <= 0) throw new Error('模型边界无效');
    const scale = 3 / longest;
    const center = box.getCenter(new Vector3());
    const normalized = dimensions.multiplyScalar(scale);
    object.traverse(node => { if (node instanceof Mesh) { node.castShadow = true; node.receiveShadow = true; } });
    return { object, scale, offset: center.multiplyScalar(-scale), radius: normalized.length() / 2, height: normalized.y };
  }, [scene]);
  const distance = useMemo(() => {
    const vertical = (camera as PerspectiveCamera).fov * Math.PI / 180;
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * size.width / Math.max(size.height, 1));
    return model.radius / Math.sin(Math.min(vertical, horizontal) / 2) * 1.12;
  }, [camera, size.width, size.height, model.radius]);

  useLayoutEffect(() => {
    const perspective = camera as PerspectiveCamera;
    perspective.position.copy(MODEL_DIRECTION).multiplyScalar(distance);
    perspective.near = model.radius / 100;
    perspective.far = distance * 20;
    perspective.lookAt(0, 0, 0);
    perspective.updateProjectionMatrix();
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    invalidate();
  }, [camera, distance, model.radius, reset, invalidate]);
  useEffect(() => { onReady(); }, [onReady]);


  const day = edition === 'day';
  return <>
    <color attach="background" args={[day ? '#d9dce0' : '#080e1b']}/>
    <hemisphereLight args={[day ? '#ffffff' : '#d9e7ff', '#33415a', day ? 0.9 : 0.65]}/>
    <directionalLight position={[3, 5, 4]} intensity={day ? 2 : 2.2} color="#fff5eb"/>
    <directionalLight position={[-4, 2, 1]} intensity={day ? 0.7 : 0.8} color="#b9cfff"/>
    <directionalLight position={[1, 3, -4]} intensity={1.2} color={day ? '#ffffff' : '#d0c6ef'}/>
    <group position={model.offset} scale={model.scale}><primitive object={model.object}/></group>
    <ContactShadows key={edition} position={[0, -model.height / 2 - 0.22, 0]} scale={6} opacity={day ? 0.22 : 0.3} blur={2.5} far={1.5} resolution={256} frames={1} color={day ? '#3b4658' : '#000000'}/>
    <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping={!reduced} dampingFactor={0.12}
      minDistance={model.radius * 1.35} maxDistance={distance * 2.2} minPolarAngle={0.12} maxPolarAngle={Math.PI * 0.8}
      rotateSpeed={0.65} zoomSpeed={0.7}/>
  </>;
}

// Listen before the suspended GLB finishes loading as well as during interaction.
function ContextGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onLost]);
  return null;
}

class ModelBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}
export default function ProductStage({ edition, reduced }: { edition: Edition; reduced: boolean }) {
  const { model } = productAssets[edition];
  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'lost'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [reset, setReset] = useState(0);
  const ready = useCallback(() => setStatus('ready'), []);
  const failed = useCallback(() => setStatus('error'), []);
  const lost = useCallback(() => setStatus('lost'), []);
  useEffect(() => { setSupported(supportsWebGL()); }, []);
  const retry = () => {
    if (model) useGLTF.clear(assetUrl(model));
    setStatus('loading'); setSupported(supportsWebGL()); setAttempt(value => value + 1);
  };
  const unavailable = supported === false || !model;
  const error = status === 'error' || status === 'lost';
  return <div className="product-stage real-model-stage" data-model-status={unavailable ? 'unsupported' : status}>
    {supported && model && !error && <ModelBoundary key={`${model}-${attempt}`} onError={failed}>
      <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [4, 3, 6], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        fallback={<div className="stage-placeholder"><p>无法创建 WebGL 画布，请更新浏览器或重试。</p></div>}
        aria-label="ONWARD 测试白模，含两只鞋。单指拖动旋转，双指缩放。">
        <ContextGuard onLost={lost}/><Suspense fallback={null}>
          <ShoeScene url={assetUrl(model)} edition={edition} reduced={reduced} reset={reset} onReady={ready}/>
        </Suspense>
      </Canvas>
    </ModelBoundary>}
    {(supported === null || unavailable || error) && <div className="stage-placeholder" role={error ? 'alert' : 'status'}>
      <span className="stage-tag">ONWARD / WHITE MODEL STUDY</span>
      <h3>{error ? status === 'lost' ? '3D 显示已中断' : '模型暂时无法载入' : unavailable ? '此设备暂无法显示 3D' : '正在准备展示舞台…'}</h3>
      <p>{error ? status === 'lost' ? 'WebGL 上下文丢失，请恢复展示。' : '请检查网络、GLB 路径与文件格式后重试。' : unavailable ? '请使用支持 WebGL 2 的 Safari，或检查浏览器图形设置。' : '正在检测 WebGL 2 支持。'}</p>
      {(error || unavailable) && <button className="stage-button" onClick={retry}>重新加载 3D</button>}
    </div>}
    {status === 'loading' && supported && !unavailable && <div className="model-loading-overlay" role="status"><span className="model-loading">正在加载真实 3D 白模…</span></div>}
    {status === 'ready' && !unavailable && <div className="model-toolbar"><p className="model-notice">单指拖动旋转 · 双指缩放<br/>白模测试 / 非最终配色与纹样</p><button className="stage-button" onClick={() => setReset(value => value + 1)}>恢复默认视角</button></div>}
    <span className="stage-corner top-left">SG—02 / WHITE MODEL</span><span className="stage-corner bottom-right">{edition === 'night' ? 'NIGHTFALL / 01' : 'DAYLIGHT / 02'}</span>
  </div>;
}
