/** Browser integration QA, not a real Safari/device test.
 * Vite must already be serving. CHROME_PATH may override Chromium.
 * node scripts/check-onward-ad.mjs http://127.0.0.1:4195
 */
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const origin=process.argv[2]??'http://127.0.0.1:4195';
const profile=await mkdtemp(path.join(tmpdir(),'onward-ad-qa-'));
const chrome=spawn(process.env.CHROME_PATH??'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let socket;const checks=[];const errors=[];
async function until(fn,limit=45000){const start=Date.now();while(Date.now()-start<limit){try{if(await fn())return;}catch{}await sleep(80);}throw Error('Timed out waiting for browser');}
try{
 let port;await until(async()=>{try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];return !!port;}catch{return false;}});
 const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r);
 let serial=0;const pending=new Map();
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 socket.onmessage=e=>{const data=JSON.parse(e.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(data.error):p.resolve(data.result);}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.text);else if(data.method==='Runtime.consoleAPICalled'&&data.params.type==='error')errors.push(data.params.args.map(a=>a.value??a.description).join(' '));};
 const evaluate=async(expression,awaitPromise=false)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const snap=()=>evaluate('window.__onwardAd.snapshot()');
 const finish=async()=>{await evaluate('window.__onwardAd.seek(100);true');await sleep(90);};
 const navigate=async id=>{await evaluate(`window.__onwardAd.navigate('${id}');true`);};
 const check=(name,extra={})=>{checks.push({name,passed:true,...extra});console.log('PASS',name);};
 await call('Page.enable');await call('Runtime.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:960,height:720,deviceScaleFactor:1,mobile:false});
 await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await call('Page.navigate',{url:origin+'/onward-ad.html?review=1'});await until(()=>evaluate('!!window.__onwardAd'));
 assert.equal((await snap()).node,'ROOT');assert.equal(await evaluate('document.querySelectorAll("[data-branch]:disabled").length'),7);
 check('V8 asset loaded; ROOT visible; B–H honestly disabled');
 await evaluate('document.querySelector("#ad-home").click();true');assert.equal((await snap()).controlsEnabled,true);check('Current-node navigation keeps orbit enabled');
 const before=await snap();
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:500,y:460,id:1}]});
 for(let i=1;i<=6;i++)await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:500+15*i,y:460-6*i,id:1}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);
 const dragged=await snap();assert.equal(dragged.node,'ROOT');assert.ok(dragged.camera.some((v,i)=>Math.abs(v-before.camera[i])>.001));assert.equal(await evaluate('scrollY'),0);check('Single-finger orbit without accidental selection or page scrolling');
 const dist=s=>Math.hypot(...s.camera.map((v,i)=>v-s.orbitTarget[i]));
 const d0=dist(dragged);
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:450,y:430,id:2},{x:610,y:430,id:3}]});
 for(let i=1;i<=6;i++)await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:450-8*i,y:430,id:2},{x:610+8*i,y:430,id:3}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(150);
 assert.ok(dist(await snap())<d0);assert.equal((await snap()).node,'ROOT');check('Two-finger pinch zoom without triggering cuff selection');
 await evaluate("window.__onwardAd.canonical('ROOT');true");await sleep(120);
 const p=await evaluate('window.__onwardAd.projectCuff()');
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:4}]});await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await until(async()=> (await snap()).target==='A1');await finish();assert.equal((await snap()).node,'A1');check('Touch raycast on actual cuff enters A1');
 await navigate('A1.1');await evaluate('window.__onwardAd.seek(2.7);true');const midway=await snap();assert.ok(midway.state.unfold>.35&&midway.state.unfold<.65);await finish();assert.equal((await snap()).node,'A1.1');assert.equal((await snap()).state.unfold,1);check('Continuous, geometry-driven cuff unfold reaches rectangular state');
 await sleep(250);assert.equal((await snap()).node,'A1.1');assert.equal((await snap()).busy,false);check('Node waits for input; no automatic story advance');
 await navigate('A1.1.1');await evaluate('window.__onwardAd.seek(9.5);true');const parallel=await snap();assert.ok(parallel.state.wrap>0&&parallel.state.wrap<1);assert.ok(parallel.state.unfold>0&&parallel.state.unfold<1);assert.ok(parallel.state.copy>.99);check('Right-side assembly and original cuff return run simultaneously');
 await finish();assert.equal((await snap()).state.unfold,0);assert.equal((await snap()).state.wrap,1);assert.equal((await snap()).node,'A1.1.1');check('Complete V8 shoe restored beside white ger');
 await navigate('A1.1.1.1');await evaluate('window.__onwardAd.seek(2.8);true');assert.ok((await snap()).state.notes>1&&(await snap()).state.notes<3);await finish();assert.equal((await snap()).state.notes,4);check('User-triggered sequential cultural annotations');
 await navigate('A1.1');await finish();assert.equal((await snap()).state.copy,0);assert.equal((await snap()).state.unfold,1);check('Parent navigation restores correct mesh/camera state');
 await navigate('A1.1.1');await evaluate('window.__onwardAd.seek(8.2);true');await navigate('ROOT');await finish();assert.equal((await snap()).node,'ROOT');assert.equal((await snap()).state.copy,0);assert.equal((await snap()).state.unfold,0);check('Interrupt during assembly returns cleanly to ROOT');
 await navigate('A1');await navigate('A1.1');await navigate('ROOT');await finish();assert.equal((await snap()).node,'ROOT');assert.equal((await snap()).busy,false);check('Rapid navigation: latest destination wins');
 await navigate('A1');await finish();await navigate('A1.1');await finish();
 await evaluate('document.querySelector("#ad-replay").click();true');await navigate('ROOT');await finish();await sleep(300);assert.equal((await snap()).target,'ROOT');check('Replay cancellation cannot restart a stale child node');
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await until(()=>evaluate('document.querySelector("#ad-motion").textContent==="动态 减"'));assert.equal(await evaluate('document.querySelector("#ad-motion").textContent'),'动态 减');
 const y0=(await snap()).state.yaw;await sleep(500);assert.equal((await snap()).state.yaw,y0);check('System reduced-motion preference stops idle rotation');
 const perf=await evaluate('window.__onwardAd.performance()');assert.ok(perf.pixelRatio<=1.25);check('Coarse-pointer rendering resolution capped',perf);
 await call('Emulation.setDeviceMetricsOverride',{width:720,height:960,deviceScaleFactor:1,mobile:false});await sleep(200);assert.equal(await evaluate('document.documentElement.scrollWidth>innerWidth'),false);check('Portrait viewport has no horizontal document overflow');
 assert.deepEqual(errors,[]);check('No JavaScript exceptions or shader compile errors');
 // Error branches get separate reloads and are excluded from the clean-scene assertion above.
 await evaluate('document.querySelector("canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext();true');await until(()=>evaluate('!document.querySelector("#ad-overlay").hidden&& !document.querySelector("#ad-retry").hidden'));
 check('WebGL context loss produces an explicit reload recovery state');
 await call('Network.enable');await call('Network.setBlockedURLs',{urls:['*onward-ad-v1.glb*']});await call('Page.reload',{ignoreCache:true});
 await until(()=>evaluate('!document.querySelector("#ad-retry")?.hidden && document.querySelector("#ad-load-text")?.textContent.includes("未能载入")'));
 assert.equal(await evaluate('document.querySelector("#onward-ad").dataset.loaded'),undefined);check('Missing GLB produces an explicit error and never a substitute shoe');
 const result={testedAt:new Date().toISOString(),environment:'Linux Chromium + SwiftShader; simulated coarse-pointer/touch viewports. NOT physical iPad Safari.',checks,performance:perf};
 await writeFile('previews/interactive-ad-v1/verification.json',JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({passed:checks.length,performance:perf},null,2));
}finally{socket?.close();chrome.kill('SIGTERM');}
