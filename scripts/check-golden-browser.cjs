/** Actual WebGL, transport, camera, context and touch regression. */
const {chromium,devices}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const root=process.cwd(),out=root+'/public/golden-derivation/verification';fs.mkdirSync(out,{recursive:true});
const url=process.env.GOLDEN_URL||'http://127.0.0.1:4561/golden-derivation.html';
let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const page=await ctx.newPage(),errors=[],failed=[];page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>failed.push(r.url()));
 async function loaded(p){await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__goldenLab?.state().ready||window.__goldenLab?.state().rejected,null,{timeout:120000});assert.equal(await p.evaluate(()=>window.__goldenLab.state().rejected),false);}
 async function state(p=page){return p.evaluate(()=>window.__goldenLab.state());}
 async function seek(t,p=page){await p.evaluate(t=>window.__goldenLab.seek(t),t);await p.waitForFunction(()=>window.__goldenLab.state().drawRevision===window.__goldenLab.state().revision);}
 await loaded(page);assert.equal((await state()).verified,true);assert.equal((await state()).sourceGeometry[0].vertices,696427);assert.equal(await page.locator('canvas').count(),1);
 const initial=await state();
 const stills=[[0,'01-original'],[3.2,'02-origin-macro'],[8.9,'03-axis-contact'],[11.8,'04-cross-growing'],[16.9,'05-cuff-intersection'],[18.4,'06-whole-framework'],[24.5,'07-golden-frame'],[36,'08-first-spiral'],[61,'09-second-spiral'],[73,'10-complete'],[20.7,'17-unit-square'],[21.6,'18-midpoint'],[22.4,'19-compass-extension'],[25.9,'20-first-square-cut'],[28.9,'21-recursive-cuts'],[32.9,'22-all-square-cuts'],[49,'23-second-frame'],[53.9,'24-second-cuts']];
 for(const[t,name]of stills){await seek(t);await page.screenshot({path:out+'/'+name+'.png'});}
 let maxTip=0,maxTangent=0;
 for(const[a,b]of[[34.22,43.78],[58.22,67.78]])for(let i=0;i<=20;i++){
  await seek(a+(b-a)*i/20);const s=await state();assert.ok(s.camera.every(Number.isFinite));
  maxTip=Math.max(maxTip,Math.hypot(s.tracking.tipNdc[0],s.tracking.tipNdc[1]));maxTangent=Math.max(maxTangent,s.tracking.tangentHorizontalFraction);
 }assert.ok(maxTip<1e-9);assert.ok(maxTangent<1e-8);
 // Deterministic forward/backward seeks, independent of previous state.
 await seek(37.25);const once=await state();for(const t of[73,0,53,9,37.25])await seek(t);const twice=await state();
 for(const key of['camera','quaternion','guideCounts','proofCounts','proof','assetMatrix'])assert.deepEqual(twice[key],once[key]);
 await page.locator('#reset').click();assert.deepEqual((await state()).camera,initial.camera);assert.deepEqual((await state()).assetMatrix,initial.assetMatrix);
 await page.locator('#speed').selectOption('3');assert.equal((await state()).speed,3);
 await page.locator('#play').click();await page.waitForFunction(()=>window.__goldenLab.state().time>.25);await page.locator('#pause').click();const paused=(await state()).time;await page.waitForTimeout(180);assert.equal((await state()).time,paused);
 await page.locator('#timeline').evaluate(el=>{el.value='15.25';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal((await state()).time,15.25);
 await page.locator('#reverse').click();await page.waitForFunction(()=>window.__goldenLab.state().time<15);await page.locator('#pause').click();
 for(let i=0;i<3;i++){await page.locator('#replay').click();await page.waitForFunction(()=>window.__goldenLab.state().time>.05);await page.locator('#reset').click();assert.equal((await state()).time,0);}
 await seek(72.8);await page.locator('#play').click();await page.waitForFunction(()=>window.__goldenLab.state().time===73);assert.equal((await state()).playing,false);await page.waitForTimeout(150);assert.equal((await state()).time,73);
 await seek(36);const beforeHandoff=await state();await page.locator('#free').click();const afterHandoff=await state();for(const k of['camera','quaternion'])for(let i=0;i<beforeHandoff[k].length;i++)assert.ok(Math.abs(beforeHandoff[k][i]-afterHandoff[k][i])<1e-10);
 const rect=await page.locator('canvas').boundingBox();await page.mouse.move(rect.x+rect.width*.55,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.65,rect.y+rect.height*.55,{steps:8});await page.mouse.up();assert.equal((await state()).cameraOwner,'user');assert.equal((await state()).playing,false);
 await page.locator('#director').click();await page.waitForFunction(()=>!window.__goldenLab.state().cameraTransition);assert.equal((await state()).cameraOwner,'director');assert.ok((await state()).tracking.tangentHorizontalFraction<1e-8);
 // On-demand renderer: a paused scene must stop submitting frames.
 const frames=await page.evaluate(()=>window.__goldenLab.lab.renderer.info.render.frame);await page.waitForTimeout(160);assert.equal(await page.evaluate(()=>window.__goldenLab.lab.renderer.info.render.frame),frames);
 await page.evaluate(()=>{window.__goldenLab.testExtension=window.__goldenLab.lab.renderer.getContext().getExtension('WEBGL_lose_context');window.__goldenLab.testExtension.loseContext();});
 await page.waitForFunction(()=>window.__goldenLab.state().contextLost);assert.equal((await state()).playing,false);
 await page.waitForTimeout(150);await page.evaluate(()=>window.__goldenLab.testExtension.restoreContext());await page.waitForFunction(()=>!window.__goldenLab.state().contextLost);await seek(10);assert.equal(await page.locator('canvas').count(),1);
 // Actual touch events on an iPad-size browser; not an iPad Safari claim.
 const touch=await browser.newContext({...devices['iPad Pro 11'],browserName:undefined,viewport:{width:1194,height:834}}),ipad=await touch.newPage();await loaded(ipad);await seek(18.4,ipad);
 const cdp=await touch.newCDPSession(ipad),r=await ipad.locator('canvas').boundingBox(),x=r.x+r.width*.5,y=r.y+r.height*.48,touchBefore=await state(ipad);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*13,y:y+i*3}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await state(ipad)).cameraOwner,'user');assert.ok((await state(ipad)).camera.some((v,i)=>Math.abs(v-touchBefore.camera[i])>.01));
 const zoom=await ipad.evaluate(()=>window.__goldenLab.lab.camera.zoom);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x-45,y},{id:2,x:x+45,y}]});for(let i=1;i<=5;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x-45-i*8,y},{id:2,x:x+45+i*8,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok(Math.abs(await ipad.evaluate(()=>window.__goldenLab.lab.camera.zoom)-zoom)>.01);
 await ipad.locator('#director').click();await ipad.waitForFunction(()=>!window.__goldenLab.state().cameraTransition);await seek(73,ipad);await ipad.screenshot({path:out+'/11-ipad-layout.png',fullPage:true});
 const mobile=await browser.newContext({...devices['iPhone 13'],browserName:undefined}),phone=await mobile.newPage();await loaded(phone);await seek(73,phone);assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const phoneBounds=await phone.evaluate(()=>{const l=window.__goldenLab.lab,c=l.camera;const q=[[-.951,-.446,-.379],[.951,.449,.390]];return q.map(([x,y,z])=>{const p=l.construction.p.clone().set(x,y,z).project(c);return p.toArray();});});assert.ok(phoneBounds.every(p=>Math.abs(p[0])<.95&&Math.abs(p[1])<.95));
 await phone.screenshot({path:out+'/12-phone-layout.png',fullPage:true});
 const failureContext=await browser.newContext(),failure=await failureContext.newPage();await failure.route('**/golden-derivation/xiezitu.glb',r=>r.fulfill({status:503,body:'test failure'}));await failure.goto(url);await failure.waitForFunction(()=>window.__goldenLab?.state().rejected);assert.equal(await failure.locator('#error').isVisible(),true);await failure.unroute('**/golden-derivation/xiezitu.glb');await failure.locator('#retry').click();await failure.waitForFunction(()=>window.__goldenLab?.state().ready,null,{timeout:120000});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const report={passed:true,animationVersion:'1.2',duration:73,standardConstructionStages:true,url,sourceSha256:initial.sourceSha256,sourceVertices:696427,sourceTriangles:1393074,realWebGL:true,maxGrowingTipNdcError:maxTip,maxTangentHorizontalFraction:maxTangent,desktopSeekPauseReplayReverseReset:true,finalHeldNoAutoReverse:true,threeTimesSpeed:true,sourceTransformPreserved:true,mouseOrbitAndDirectorHandoff:true,pausedRenderStops:true,contextLossAndRestore:true,touchRotateAndPinch:true,phoneLayoutNoHorizontalOverflow:true,loadingFailureAndRetry:true,singleCanvas:true,errors,failed,environment:'Linux Chromium / SwiftShader. iPad and phone are device emulation, not physical Safari tests.'};
 fs.writeFileSync(out+'/browser-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
