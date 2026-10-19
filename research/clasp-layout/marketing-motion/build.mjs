// Reuse the existing hand trace and preset C, rather than creating another shoe.
import fs from 'node:fs/promises';
import '../shoe-trace.js';
import '../geometry-data.js';

const T = globalThis.ShoeTrace;
const C = globalThis.ClaspGeometry.presets.find(p => p.id === 'C');
const n = x => Number(x.toFixed(4));
const path = (name, cls = 'ink') => `<path class="${cls}" d="${T.paths[name]}"/>`;
const line = (a,b,cls) => `<path class="${cls}" d="M${n(a.x)} ${n(a.y)}L${n(b.x)} ${n(b.y)}"/>`;
const dot = (p,cls,r=3.5) => `<circle class="${cls}" cx="${n(p.x)}" cy="${n(p.y)}" r="${r}"/>`;
const G = [{x:458.5,y:404},{x:426,y:476.5}];
const E = T.eyelets.slice(1,4);
const gsap = (await fs.readFile(new URL('../../../node_modules/gsap/dist/gsap.min.js', import.meta.url),'utf8')).replace(/[ \t]+$/gm,'').trimEnd()+'\n';
await fs.mkdir(new URL('assets/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('assets/gsap.min.js',import.meta.url),gsap);
const eyelets = T.eyelets.map((e,i)=>`<ellipse class="eyelet ink" data-eye="${i}" cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.angle} ${e.x} ${e.y})"/>`).join('');
const scans = E.map(e=>`<ellipse class="eye-scan draw" cx="${e.x}" cy="${e.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.angle} ${e.x} ${e.y})"/>`).join('');
const straps = C.clasps.map((c,i)=>`<g class="clasp" transform="translate(${n(c.x)} ${n(c.y)}) rotate(${c.angle})">
  <path class="clasp-axis draw" d="M-88 0H94"/>
  <rect class="strap" x="-89" y="-9" width="169" height="18" rx="2.5"/>
  <path class="strap-detail draw" d="M-80 -5H68M-80 5H68"/>
  <circle class="head" cx="80" cy="0" r="12"/>
  <circle class="head-detail draw" cx="80" cy="0" r="6.5"/>
  <path class="dimension draw" d="M-80 25V35M80 25V35M-80 30H80"/>
  <text class="dimension" x="0" y="51" text-anchor="middle">L 160 u</text>
 </g>`).join('');
const guideLines=G.map((g,i)=>{
 const c=C.clasps[i]; const dx=c.x-g.x,dy=c.y-g.y;
 const end={x:c.x+dx*.65,y:c.y+dy*.65};
 return line(g,end,'parallel draw')+dot(c,'cross-dot',4)+`<circle class="cross-ring" cx="${n(c.x)}" cy="${n(c.y)}" r="14"/>`;
}).join('');
const endState = `
<svg id="drawing" width="1920" height="1080" viewBox="0 0 1920 1080" aria-label="从原始鞋面结构推演双扣的动画" data-layout-ignore>
 <defs><clipPath id="drawing-window"><rect x="0" y="0" width="1920" height="995"/></clipPath></defs><g clip-path="url(#drawing-window)">
 <g id="camera"><g transform="translate(140 -60) scale(1.4)" stroke-linecap="round" stroke-linejoin="round">
  <g class="shoe-surfaces">${path('body','surface')}${path('tongue','surface')}${path('cuffOuter','surface')}</g>
  <g class="shoe-lines">${['body','tongue','cuffOuter','soleUpper','soleLower','foxingStripe','toeCap','foxingFrontSeam','tongueFold'].map(k=>path(k)).join('')}</g>
  <g class="seams">${['cuffSplitUpper','cuffSplitLower','cuffBoundary','cuffEyeletRear','cuffEyeletFront','bodyPanelSeam','heelSeam','cuffInnerFold'].map(k=>path(k)).join('')}</g>
  <g class="eyelets">${eyelets}</g>
  <g id="construction">
   <g class="eye-focus">${scans}${E.map(e=>dot(e,'eye-centre',2.8)).join('')}
    ${line(E[0],E[1],'gap-link draw')}${line(E[1],E[2],'gap-link draw')}
   </g>
   <g class="gap-marks">${G.map((g,i)=>dot(g,'gap-dot',4)+`<text x="${g.x-53}" y="${g.y+3}">G${i+1}</text>`).join('')}</g>
   <g class="seam-focus">${path('cuffSplitUpper','seam-light draw')}${line({x:148,y:344},{x:398,y:459},'seam-chord draw')}</g>
   <path class="boundary draw" d="M600 270L418 650"/>
   ${guideLines}
   <g class="angle-note"><text x="184" y="398">同向 · 24.70°</text><path d="M190 409L285 452"/></g>
  </g>
  <g id="clasps">${straps}</g>
 </g></g></g>
</svg>`;
const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>SoulGrain ONWARD · 连接，自成风格</title>
<style>
@font-face{font-family:'PingFang SC';src:local('PingFang SC'),local('Noto Sans CJK SC')}
@font-face{font-family:'SG Display';src:local('Nimbus Sans Narrow'),local('Arial Narrow')}
@font-face{font-family:'Nimbus Mono PS';src:local('Nimbus Mono PS')}
*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#080e1b;color:#e9eaf0;font-family:Arial,'PingFang SC',sans-serif}
#film{position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(ellipse at 56% 58%,#191b32 0,transparent 62%),#080e1b}
.scene-content{width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:65px 100px 42px}
.masthead{display:flex;justify-content:space-between;align-items:baseline;position:relative;z-index:2}
.brand{font-size:29px;letter-spacing:.22em;font-weight:600}.edition{font-size:19px;color:#b5bece;letter-spacing:.13em}
.narrative{height:160px;position:relative;z-index:2;margin-top:30px}.chapter{position:absolute;top:0;left:0}.chapter .number{display:block;font-size:19px;letter-spacing:.16em;color:#aea0cf;margin-bottom:17px}.chapter h1{font-size:46px;font-weight:400;letter-spacing:.035em;line-height:1.3;margin:0}
.ending{position:absolute;top:0;left:0}.ending .onward{font-family:'SG Display',sans-serif;font-size:82px;font-weight:400;letter-spacing:.075em;margin:0;line-height:1}.ending p{font-size:30px;letter-spacing:.12em;margin:18px 0 0;color:#b5bece}
.spacer{flex:1}.footer{position:relative;z-index:2;display:flex;justify-content:space-between;font-size:20px;letter-spacing:.07em;color:#b5bece}
#drawing{position:absolute;inset:0;z-index:1}.surface{fill:#101a2c;stroke:none}.ink{fill:none;stroke:#e9eaf0;stroke-width:1.65}.seams path{fill:none;stroke:#7f899d;stroke-width:1.35}.eyelet{stroke:#b5bece;stroke-width:1.6;fill:#080e1b}
.draw{fill:none}.eye-scan{stroke:#e9eaf0;stroke-width:3}.eye-centre,.gap-dot,.cross-dot{fill:#d8c9ff}.gap-link{stroke:#aea0cf;stroke-width:1.3}.gap-marks text{font:16px 'Nimbus Mono PS',monospace;fill:#d8c9ff}.seam-light{stroke:#aea0cf;stroke-width:2.8}.seam-chord{stroke:#d8c9ff;stroke-width:1.1;stroke-dasharray:4 5}.boundary{stroke:#b5bece;stroke-width:1;stroke-dasharray:5 5}.parallel{stroke:#aea0cf;stroke-width:1.7}.cross-ring{fill:none;stroke:#aea0cf;stroke-width:1}.angle-note{fill:#d8c9ff;font:17px Arial,'PingFang SC',sans-serif}.angle-note path{fill:none;stroke:#aea0cf;stroke-width:1}
.clasp-axis{stroke:#aea0cf;stroke-width:1}.strap{fill:#d9dce6;stroke:#e9eaf0;stroke-width:1.3}.strap-detail{stroke:#8b90a1;stroke-width:.65}.head{fill:#aea0cf;stroke:#eee7ff;stroke-width:1.4}.head-detail{stroke:#797186;stroke-width:.9}.dimension{fill:#c4cbda;stroke:none;font:15px 'Nimbus Mono PS',monospace}.dimension.draw{fill:none;stroke:#b5bece;stroke-width:.8}
.scale-note{position:absolute;right:110px;top:163px;z-index:2;color:#e9eaf0;font-size:21px;line-height:1.7;letter-spacing:.04em}.scale-note .small{font-size:19px;color:#b5bece}.scale-note .data{font-family:'Nimbus Mono PS',monospace;font-size:25px;color:#d8c9ff}
</style></head><body>
<div id="film" class="clip" data-composition-id="onward-connection" data-start="0" data-duration="24" data-width="1920" data-height="1080" data-track-index="0">
 ${endState}
 <div class="scene-content"><div class="top">
  <header class="masthead"><div class="brand">SOULGRAIN™</div><div class="edition">ONWARD / 前进 &nbsp; · &nbsp; DESIGN IN MOTION</div></header>
  <div class="narrative">
   <div class="chapter c1"><span class="number">01 / THE ORIGINAL LINES</span><h1>从鞋本来的线条出发。</h1></div>
   <div class="chapter c2"><span class="number">02 / FIND THE RHYTHM</span><h1>在孔与孔之间，寻找节奏。</h1></div>
   <div class="chapter c3"><span class="number">03 / EXTEND THE CONNECTION</span><h1>沿着缝线的方向，延伸连接。</h1></div>
   <div class="chapter c4"><span class="number">04 / SHAPED BY DESIGN</span><h1>位置循结构，尺度由设计调校。</h1></div>
   <div class="ending"><h1 class="onward">ONWARD.</h1><p>让连接，自成风格。</p></div>
  </div></div><div class="spacer"></div>
  <footer class="footer"><span>基于手绘结构的设计推演 · 非生产纸样</span><span>SOULGRAIN / CONNECTION STUDY 01</span></footer>
 </div>
 <div class="scale-note"><div>两端定位点中心距 / 扣身宽 / 圆头半径</div><div class="data">L 160 &nbsp; W 18 &nbsp; r 12</div><div class="small">u = 描图坐标单位；尺度为设计选择</div></div>
</div>
<script src="assets/gsap.min.js"></script>
<script>
window.__timelines=window.__timelines||{};
const tl=gsap.timeline({paused:true});
window.__timelines['onward-connection']=tl;
// CSS is the fully visible static layout. GSAP owns all animation state.
// The ?static flag is only for reviewing that layout before motion.
if(!new URLSearchParams(location.search).has('static')){
 document.querySelectorAll('.ink,.seams path,.draw').forEach(p=>{if(p.getTotalLength){const l=p.getTotalLength();p.style.strokeDasharray=l+' '+l;p.style.strokeDashoffset=l;}});
 const trace=(sel,time,duration,stagger=0)=>tl.to(sel,{strokeDashoffset:0,duration,stagger,ease:'power2.inOut'},time);
 gsap.set('.chapter,.ending,.scale-note,.eye-centre,.gap-marks,.cross-dot,.cross-ring,.angle-note,.dimension:not(.draw)',{opacity:0});
 gsap.set('.strap,.head',{opacity:0});
 gsap.set('.surface',{opacity:0});
 tl.from('.masthead',{opacity:0,y:14,duration:1,ease:'power3.out'},.2);
 tl.from('.footer',{opacity:0,duration:1.1},1.7);
 const chapter=(sel,start,end)=>{tl.fromTo(sel,{opacity:0,y:15},{opacity:1,y:0,duration:.7,ease:'power3.out'},start);tl.to(sel,{opacity:0,y:-10,duration:.45,ease:'power2.in'},end);};
 chapter('.c1',.4,4.1);chapter('.c2',4.6,8.0);chapter('.c3',8.5,12.2);chapter('.c4',12.7,18.2);
 trace('.shoe-lines .ink',.45,2.6,.07);trace('.seams path',1.2,2.4,.065);trace('.eyelet',2.2,1.2,.07);
 tl.to('.surface',{opacity:1,duration:2,ease:'sine.inOut'},1.0);
 tl.to('#camera',{scale:1.35,x:-150,y:-30,svgOrigin:'0 0',duration:2.5,ease:'power2.inOut'},3.5);
 trace('.eye-scan',4.8,.9,.2);tl.to('.eye-centre',{opacity:1,duration:.35,stagger:.2},5.2);
 trace('.gap-link',6.1,.8,.22);tl.fromTo('.gap-marks',{opacity:0,scale:.95},{opacity:1,scale:1,svgOrigin:'440 440',duration:.55,ease:'power3.out'},7.2);
 trace('.seam-light',8.5,.9);trace('.seam-chord',9.0,.7);trace('.boundary',9.2,1.2);
 tl.to('.angle-note',{opacity:1,duration:.7},9.2);trace('.parallel',9.7,1.25,.35);
 tl.to('.cross-dot',{opacity:1,duration:.3,stagger:.35},10.7);
 tl.fromTo('.cross-ring',{opacity:0,attr:{r:25}},{opacity:.9,attr:{r:14},duration:.65,stagger:.35,ease:'power3.out'},10.65);
 trace('.clasp-axis',12.4,.6,.3);
 tl.fromTo('.strap',{opacity:0,attr:{width:0,height:1,y:-.5}},{opacity:1,attr:{width:169,height:18,y:-9},duration:1.2,stagger:.4,ease:'power3.inOut'},13.1);
 tl.fromTo('.head',{opacity:0,attr:{r:0}},{opacity:1,attr:{r:12},duration:.65,stagger:.4,ease:'back.out(1.2)'},14.05);
 trace('.strap-detail,.head-detail',14.5,.8,.09);trace('.dimension.draw',15,.7,.2);
 tl.to('.dimension:not(.draw)',{opacity:1,duration:.5},15.4);
 tl.to('.scale-note',{opacity:1,duration:.8},15.2);
 tl.to('#construction,.dimension,.clasp-axis,.scale-note',{opacity:0,duration:1.1,ease:'sine.inOut'},17.7);
 tl.to('#camera',{scale:1,x:0,y:0,svgOrigin:'0 0',duration:2.6,ease:'power2.inOut'},17.8);
 tl.fromTo('.ending',{opacity:0,y:20},{opacity:1,y:0,duration:1.2,ease:'power3.out'},19.2);
 // Hold the final frame; duration is explicit and finite.
 tl.to({}, {duration:.01},23.99);
 tl.seek(0);
}else{
 gsap.set('.chapter,#construction,.dimension,.clasp-axis,.scale-note',{opacity:0});
}
window.OnwardMotion={timeline:tl,duration:24,sourcePreset:'C'};
</script></body></html>`;
await fs.writeFile(new URL('index.html',import.meta.url),html.replace(/[ \t]+$/gm,''));
console.log('Generated 24s film from the original ShoeTrace and existing preset C.');
