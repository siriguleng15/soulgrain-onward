import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Edition } from './product';
const ProductStage = lazy(() => import('./components/ProductStage'));
const designLabUrl = `${import.meta.env.BASE_URL}design-lab.html`;
gsap.registerPlugin(ScrollTrigger);
const details = [
  ['01', '蒙古纹样', 'HERITAGE IN EVERY LINE', '从传统的秩序与节奏中寻找灵感，让文化记忆走入当代街头。', 'pattern'],
  ['02', '鞋舌', 'A QUIET SIGNATURE', '藏于轮廓之中的品牌表达。比例、织物与触感，等待真实设计揭晓。', 'tongue'],
  ['03', '水晶饰布', 'LIGHT, RECONSIDERED', '在光线与步伐之间，探索材质的另一种表情。', 'crystal'],
  ['04', '后跟皮条', 'ROOTED IN MOVEMENT', '从后跟延伸的设计线索，让每一步都带着来处。', 'heel'],
  ['05', '鞋带头', 'THE FINAL PUNCTUATION', '细节不是附加，而是完整表达的最后一笔。', 'lace'],
];
export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const [edition, setEdition] = useState<Edition>(() => {
    try { return sessionStorage.getItem('soulgrain-edition') === 'day' ? 'day' : 'night'; }
    catch { return 'night'; }
  });
  useEffect(() => { try { sessionStorage.setItem('soulgrain-edition', edition); } catch { /* Browsing still works when storage is unavailable. */ } }, [edition]);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.hero-reveal', { y: 45, opacity: 0, duration: 1.3, stagger: .16, ease: 'power3.out' });
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => gsap.from(el, { y: 32, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 91%', once: true } }));
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  return <div ref={root} className={`site ${edition === 'day' ? 'daylight' : ''}`}>
    <a className="skip-link" href="#collection">跳至产品展示</a>
    <header className="header"><a href="#" className="wordmark" aria-label="SoulGrain 首页">SOULGRAIN<span>™</span></a><nav aria-label="主导航"><a href="#collection">作品 <span>01</span></a><a href="#details">设计档案</a><a href={designLabUrl}>3D工作台 <span>↗</span></a><a href="#philosophy">品牌精神 <span>↗</span></a></nav><span className="header-label">INDEPENDENT FOOTWEAR LABEL</span></header>
    <main>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-glow" aria-hidden="true"/><div className="particles" aria-hidden="true">{Array.from({length: 18}, (_, i) => <i key={i} style={{left: `${(i * 43 + 7) % 100}%`, top: `${(i * 29 + 11) % 100}%`, animationDelay: `${i * -.7}s`}}/>)}</div><div className="hero-top hero-reveal"><span><i className="status-dot"/> NEW PERSPECTIVES. ANCIENT ROOTS.</span><span>内在有根 · 步履向前</span></div>
      <div className="hero-content"><p className="eyebrow hero-reveal">SOULGRAIN / FIRST CHAPTER</p><h1 id="hero-title" className="hero-reveal">ONWARD<span className="title-star">✳</span></h1><div className="hero-bottom hero-reveal"><p className="hero-chinese">灵魂有来处。<br/><span>脚步无边界。</span></p><div className="hero-description"><p>蒙古族传统的精神底色，<br/>与当代街头的自由表达。</p><a className="text-link" href="#collection">探索 ONWARD <span>↘</span></a></div></div></div>
      <div className="hero-footer"><span>DESIGNED TO CARRY A STORY.</span><a href="#collection">SCROLL TO DISCOVER <span>↓</span></a><span>001 — ∞</span></div></section>
      <section id="collection" className="collection section"><div className="section-heading" data-reveal><span className="eyebrow">01 / THE SILHOUETTE</span><span className="small-label">ORIGINAL HIGH-TOP CANVAS</span></div><div className="product-heading" data-reveal><h2>传统为根。<br/><em>向前而生。</em></h2><p>ONWARD 高帮帆布鞋<br/><span>一双鞋，一段尚在展开的旅程。</span></p></div><Suspense fallback={<div className="stage-loading">展示舞台加载中…</div>}><ProductStage edition={edition} reduced={reduced}/></Suspense><div className="stage-caption"><span>ONWARD — DESIGN STUDY</span><span>真实三维白模 / 非最终配色与纹样</span></div><p className="model-credit">测试白模改编自 <a href="https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244" target="_blank" rel="noreferrer">theunclerulez · Generic “Converse style” Sneakers</a>，采用 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a> 许可。材质已修改为测试白模；非 SoulGrain 最终原创鞋型。</p></section>
      <div className="design-lab-entry" data-reveal><div><span className="eyebrow">YOUR ONWARD / 3D DESIGN LAB</span><h3>探索你的 ONWARD。</h3><p>翻起或折下鞋筒，试穿属于你的颜色与印花。</p></div><a className="design-lab-link" href={designLabUrl}>进入3D设计工作台 <span aria-hidden="true">↗</span></a></div>
      <section id="details" className="details section"><div className="section-heading" data-reveal><span className="eyebrow">02 / THE ANATOMY</span><span className="small-label">NOTHING IS INCIDENTAL</span></div><div className="details-intro" data-reveal><h2>每处细节，<br/><em>都有回响。</em></h2><p>以五个设计切面，阅读 ONWARD。<br/>以下为材质与设计档案占位，非鞋款实物或最终纹样。</p></div><div className="detail-list">{details.map(([number, title, subtitle, description, motif]) => <article className="detail" key={number} data-reveal><span className="detail-number">/{number}</span><div className={`material-study ${motif}`} aria-hidden="true"><div/><span>DESIGN STUDY</span></div><div className="detail-copy"><span className="eyebrow">{subtitle}</span><h3>{title}</h3><p>{description}</p></div><span className="detail-asset">素材待导入 <span>↗</span></span></article>)}</div></section>
      <section id="editions" className="editions section"><div className="section-heading" data-reveal><span className="eyebrow">03 / TWO EXPRESSIONS</span><span className="small-label">SAME SOUL. DIFFERENT LIGHT.</span></div><div className="edition-layout" data-reveal><div><h2>昼夜之间，<br/><em>自有本色。</em></h2><p className="edition-description">一种精神，两种光线。<br/>切换页面氛围，探索 ONWARD 的双重表达。</p><div className="edition-switch" role="group" aria-label="选择昼夜版本"><button aria-pressed={edition === 'night'} onClick={() => setEdition('night')}><span className="swatch night"/>Nightfall <span>01</span></button><button aria-pressed={edition === 'day'} onClick={() => setEdition('day')}><span className="swatch day"/>Daylight <span>02</span></button></div><p className="edition-disclaimer">两种模式共用同一测试白模，仅切换背景与灯光；非正式配色。</p></div><div className="edition-art" aria-hidden="true"><div className="eclipse"/><span>{edition === 'night' ? 'NIGHTFALL' : 'DAYLIGHT'}</span><small>{edition === 'night' ? '静夜藏锋' : '向光而行'}</small></div></div></section>
      <section id="philosophy" className="philosophy section"><span className="eyebrow" data-reveal>04 / THE SPIRIT OF SOULGRAIN</span><p className="manifesto" data-reveal>我们从来处汲取力量，<br/>向未知迈出脚步。<br/><span>让文化成为日常，<br/>让每一步，都有灵魂。</span></p><div className="closing" data-reveal><span>ROOTED IN SOUL.</span><h2>ONWARD<span>↗</span></h2><span>BUILT TO MOVE FORWARD.</span></div></section>
    </main><footer><a className="wordmark" href="#">SOULGRAIN<span>™</span></a><p>内在有根 · 步履向前</p><span>© {new Date().getFullYear()} SOULGRAIN</span><a href="#">BACK TO TOP ↑</a></footer>
  </div>;
}
