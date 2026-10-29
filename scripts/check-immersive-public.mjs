/** Verify the published isolated preview with real HTTP bytes and Chromium WebGL.
 * This is a deployment smoke test, supplementary to the full local interaction suite.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,mkdtemp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const entry=process.argv[2]??'https://siriguleng15.github.io/soulgrain-onward/onward-immersive/immersive-showcase.html';
const expectedCommit=process.argv[3];
const output=process.argv[4]??'/tmp/onward-immersive-public-proof';
assert.ok(output.startsWith('/tmp/'),'Use an isolated proof directory');await mkdir(output,{recursive:true});
const checks=[],errors=[],responses=[],digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name);console.log('PASS',name);};
const base=new URL('./',entry),pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const get=async(relative)=>{const url=new URL(relative,base),response=await fetch(url,{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200,String(url));const bytes=Buffer.from(await response.arrayBuffer());return{url:String(url),bytes,status:response.status,sha256:digest(bytes)};};
const html=await get('immersive-showcase.html'),infoResponse=await get('preview-info.json'),info=JSON.parse(infoResponse.bytes.toString());
check('Public entry and provenance identify the isolated release',(!expectedCommit||info.sourceCommit===expectedCommit)&&info.entry==='immersive-showcase.html',{entry:html.url,info});
const model=await get('assets/onward-ad-v1/onward-ad-v1.glb');
check('Public GLB is byte-identical to the confirmed colored source',model.sha256==='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4',{bytes:model.bytes.length,sha256:model.sha256});
const bundlePath=html.bytes.toString().match(/<script[^>]*src="([^"]+)"/)?.[1];assert.ok(bundlePath);
const bundle=await get(bundlePath);check('Public entry serves its real compiled scene bundle',bundle.bytes.length>500000,{url:bundle.url,sha256:bundle.sha256});
for(const relative of['immersive-showcase/review.html','immersive-showcase/verification/browser-validation.json','immersive-showcase/verification/detail-review-validation.json','immersive-showcase/verification/final-layout-validation.json','immersive-showcase/verification/showcase-exploration.mp4','ONWARD-immersive-v1-source.zip']){
 const result=await get(relative);check('Published review artifact: '+relative,result.bytes.length>0,{url:result.url,bytes:result.bytes.length,sha256:result.sha256});
}
const profile=await mkdtemp('/tmp/onward-public-chrome-'),port=9537;
const chrome=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let socket;
try{
 let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}assert.ok(pages,'Chromium starts');
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let sequence=0;const pending=new Map();socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description));else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)responses.push({url:m.params.response.url,status:m.params.response.status});};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text);return result.result.value;};
 const wait=async(expression,label)=>{const until=Date.now()+120000;while(Date.now()<until){if(await run(expression))return;await pause(250);}throw Error('Timed out: '+label);};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:entry});
 await wait('window.__onwardShowcase?.getState().ready&&window.__onwardShowcase.getState().renderedFrames>3','public textured model');await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false)');
 await wait('window.__onwardShowcase.getState().productReveal===1&&window.__onwardShowcase.getState().triangles>400000&&window.__onwardShowcase.getState().drawCalls>10','public opaque PBR draw');
 const state=await run('window.__onwardShowcase.getState()');
 check('Published browser runs real PBR geometry and all seven part targets',state.ready&&state.parts.length===7&&state.triangles>400000&&state.productReveal===1,{parts:state.parts.map(p=>({id:p.id,meshes:p.meshes})),drawCalls:state.drawCalls,triangles:state.triangles,sourceModelSHA:state.sourceModelSHA});
 await run('window.__onwardShowcase.selectPart("cuff")');await wait('!window.__onwardShowcase.getState().isTransitioning','public cuff camera');
 const focused=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("cuff",0);return{positionError:s.camera.position.distanceTo(p.position),targetError:s.controls.target.distanceTo(p.target),focus:s.focusPart};})()');
 check('Published first part camera completes naturally through the layout change',focused.focus==='cuff'&&focused.positionError<1e-5&&focused.targetError<1e-5,focused);
 await run('window.__onwardShowcase.setUnfold(1)');await wait('window.__onwardShowcase.getState().unfold>.999&&!window.__onwardShowcase.getState().isTransitioning','public continuous cuff unfold');
 check('Published scene reaches the supported cuff expansion',(await run('window.__onwardShowcase.getState().unfold'))>.999,null);
 await run('window.__onwardShowcase.home()');await wait('!window.__onwardShowcase.getState().isTransitioning','public return');
 await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const screenshot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(output+'/public-preview.png',Buffer.from(screenshot.data,'base64'));
 check('Published scene has no uncaught or shader errors and no HTTP failures',errors.length===0&&responses.length===0,{errors,responses});
 await writeFile(output+'/public-preview-validation.json',JSON.stringify({testedAt:new Date().toISOString(),entry,info,checks,environment:'Linux Chromium / SwiftShader. Certificate errors ignored only in this test browser for the execution proxy; Node HTTP byte checks used normal TLS. Not physical iPad Safari.',scope:'Deployment smoke test. Full interaction and final composition checks are linked separately.'},null,2)+'\n');
 console.log(JSON.stringify({passed:true,checks:checks.length,output}));
}finally{socket?.close();chrome.kill('SIGTERM');}
