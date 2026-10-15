import { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, useGLTF } from '@react-three/drei';
import { assetUrl, productAssets, type Edition } from '../product';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <Center><primitive object={scene} /></Center>;
}
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="stage-placeholder"><h3>模型暂时无法载入</h3><p>请检查素材路径、格式与纹理文件。</p></div> : this.props.children; }
}
function supportsWebGL() {
  try { const canvas = document.createElement('canvas'); const gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); if (!gl) return false; gl.getExtension('WEBGL_lose_context')?.loseContext(); return true; } catch { return false; }
}
export default function ProductStage({ edition, reduced }: { edition: Edition; reduced: boolean }) {
  const assets = productAssets[edition];
  const [supported, setSupported] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => { setSupported(supportsWebGL()); }, []);
  useEffect(() => { setImageFailed(false); }, [edition]);
  const modelReady = Boolean(assets.model && supported);
  return <div className="product-stage">
    <div className="stage-grid" aria-hidden="true"/><div className="orbit orbit-one" aria-hidden="true"/><div className="orbit orbit-two" aria-hidden="true"/>
    {modelReady ? <ModelBoundary key={assets.model}><Canvas dpr={[1, 1.5]} frameloop={reduced ? 'demand' : 'always'} camera={{ position: [3, 2, 5], fov: 40 }} fallback={<p>此设备无法显示 3D，请使用产品图片。</p>}><ambientLight intensity={1.5}/><directionalLight position={[4, 6, 3]} intensity={3}/><pointLight position={[-3, 2, -2]} color="#9c83e9" intensity={8}/><Suspense fallback={null}><Model url={assetUrl(assets.model!)}/></Suspense><OrbitControls makeDefault enablePan={false} minDistance={1.5} maxDistance={10} autoRotate={false}/></Canvas></ModelBoundary> : assets.image && !imageFailed ? <img className="product-image" src={assetUrl(assets.image)} onError={() => setImageFailed(true)} alt={`SoulGrain ONWARD ${edition === 'night' ? 'Nightfall' : 'Daylight'} 真实鞋款`}/> : <div className="stage-placeholder"><span className="stage-cross">＋</span><span className="stage-tag">PRODUCT ARCHIVE / 001</span><h3>为真实之作，<br/>留一席之地。</h3><p>真实鞋款素材待导入</p><span className="stage-note">3D MODEL · GLB / GLTF · READY</span></div>}
    {modelReady && <p className="model-notice">拖动旋转 · 双指缩放<br/>若模型未显示，请检查素材路径及浏览器控制台。</p>}
    <span className="stage-corner top-left">SG—01</span><span className="stage-corner bottom-right">{edition === 'night' ? 'NIGHTFALL / 01' : 'DAYLIGHT / 02'}</span>
  </div>;
}
