/** The two user-corrected visual relationships, on the actual rendered model. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 await page.goto(process.env.GOLDEN_URL||'http://127.0.0.1:4566/golden-derivation.html');
 await page.waitForFunction(()=>window.__goldenLab?.state().ready||window.__goldenLab?.state().rejected,null,{timeout:120000});
 const s=await page.evaluate(()=>window.__goldenLab.state());assert.ok(s.ready);assert.equal(s.constructionVersion,'1.1');assert.equal(s.placement.eyelet,4);assert.ok(Math.abs(s.placement.contact[0]-s.placement.eyeletPoint[0])<1e-12);assert.ok(s.placement.contact[1]<s.placement.eyeletPoint[1]);
 await page.evaluate(()=>{const l=window.__goldenLab.lab;l.seek(18.4);l.free();l.camera.position.set(0,.02,3);l.camera.up.set(0,1,0);l.camera.lookAt(0,.02,0);l.camera.zoom=1/1.9;l.controls.target.set(0,.02,0);l.camera.updateProjectionMatrix();l.camera.updateMatrixWorld();l.invalidate();});
 async function labels(mode){return page.evaluate(mode=>{
  document.querySelectorAll('.qa-label').forEach(n=>n.remove());const l=window.__goldenLab.lab,c=l.construction,host=document.getElementById('stage'),w=l.renderer.domElement.clientWidth,h=l.renderer.domElement.clientHeight;
  const mark=(text,point,color,dy=-26)=>{const p=l.root.localToWorld(point.clone()).project(l.camera),el=document.createElement('span');el.className='qa-label';el.textContent=text;el.style.cssText=`position:absolute;left:${(p.x+1)/2*w}px;top:${(1-p.y)/2*h+dy}px;transform:translateX(-50%);color:${color};background:#07101fe8;border:1px solid ${color};border-radius:13px;padding:1px 7px;font:13px Arial;z-index:20;white-space:nowrap`;host.append(el);return{x:(p.x+1)/2*w,y:(1-p.y)/2*h};};
  if(mode==='contact'){
   for(const e of c.data.calibration.eyelets)mark(String(e.numberFromToe),c.p.clone().fromArray(e.point),'#f4c47e',-27);
   const p=mark('P / 第4孔下方',c.p,'#ff929b',10);const e=c.data.calibration.eyelets.find(e=>e.numberFromToe===4);const ep=c.p.clone().fromArray(e.point).project(l.camera);return{contact:p,fourth:{x:(ep.x+1)/2*w,y:(1-ep.y)/2*h}};
  }
  return{first:mark('S1 / 第一起点',c.golden[0].points[0],'#f8bf61',-28),second:mark('S2 / 青线下端',c.golden[1].points[0],'#c4acff',10)};
 },mode);}
 const out='public/golden-derivation/verification';const contact=await labels('contact');assert.ok(Math.abs(contact.contact.x-contact.fourth.x)<.01);assert.ok(contact.contact.y>contact.fourth.y);
 await page.waitForFunction(()=>window.__goldenLab.state().drawRevision===window.__goldenLab.state().revision);await page.locator('#stage').screenshot({path:out+'/15-fourth-eyelet-contact.png'});
 await page.evaluate(()=>window.__goldenLab.seek(43));const starts=await labels('starts');assert.ok(starts.second.x>starts.first.x);assert.ok(starts.second.y>starts.first.y);await page.waitForFunction(()=>window.__goldenLab.state().drawRevision===window.__goldenLab.state().revision);await page.locator('#stage').screenshot({path:out+'/16-same-short-edge-starts.png'});
 const report={passed:true,revision:'1.1',counting:'visible laced eyelets, toe toward shoe opening',fourthEyeletUnderContact:true,contactProjection:contact,secondStartDiagonallyBelowFirst:true,startProjections:starts,placement:s.placement,modelSha256:s.sourceSha256,environment:'Actual WebGL in Linux Chromium / SwiftShader; numbered labels are QA annotations only.'};fs.writeFileSync(out+'/placement-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
