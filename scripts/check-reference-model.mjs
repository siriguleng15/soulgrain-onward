/** Actual V10 product-data/browser checks. Chromium touch emulation is NOT Safari. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const repo=process.cwd(),asset=path.join(repo,'public/reference-model-v10');
const out=asset+'/verification',scratch='/tmp/onward-model-v10-qa-'+Date.now(),downloads=scratch+'/downloads';
const url=process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4327/soulgrain-onward/onward-model-v10/reference-model.html';
await mkdir(out,{recursive:true});await mkdir(downloads,{recursive:true});
const checks=[],errors=[],failedRequests=[],badResponses=[],downloadEvents=[];
const check=(name,passed,detail)=>{checks.push({name,passed,detail:structuredClone(detail)});if(!passed)throw Error(name+': '+JSON.stringify(detail));console.log('PASS',name);};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function glbDoc(bytes){assert.equal(bytes.toString('utf8',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);return JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));}
const meta=JSON.parse(await readFile(asset+'/model-data.json','utf8'));
const original=await readFile(asset+'/'+(meta.sourceFile??'xiezitu-original.glb'));
const corrected=await readFile(asset+'/'+(meta.correctedFile??'corrected.glb'));
const doc=glbDoc(corrected);
check('Uploaded original bytes preserved',digest(original)===meta.sourceSha256,{bytes:original.length,sha256:digest(original)});
check('Runtime geometry matches published identity',digest(corrected)===meta.correctedSha256,{bytes:corrected.length,sha256:digest(corrected)});
const roles=doc.nodes.filter(n=>n.mesh!==undefined).map(n=>({name:n.name,role:n.extras?.bridgeRole}));
check('Actual mesh has explicit cloth/excluded semantics',roles.some(n=>n.role==='body')&&roles.some(n=>n.role==='cuff')&&roles.some(n=>n.role==='excluded'),roles);
check('Display scale not mislabeled physical millimetres',/uncalibrated|未标定/.test(meta.units+' '+meta.scaleNote),{units:meta.units,scaleNote:meta.scaleNote});
const staticBridge=JSON.parse(await readFile(asset+'/bridge-data.json','utf8'));
check('Static bridge model hash agrees with runtime GLB',staticBridge.modelSha256===meta.correctedSha256,{actual:staticBridge.modelSha256,expected:meta.correctedSha256});
if(staticBridge.fittedPaperShell){
 const shell=staticBridge.fittedPaperShell,paper=JSON.parse(await readFile('public/pattern-engineering/exports/ONWARD-project.json','utf8'));
 check('Fitted shell retains original real-paper coordinates and triangle identities',JSON.stringify(shell.sourceFlatMm)===JSON.stringify(paper.vertexIdentity.flatMm)&&JSON.stringify(shell.sourceTriangleIndices)===JSON.stringify(paper.vertexIdentity.triangleIndices)&&JSON.stringify(shell.sourceVertexIds)===JSON.stringify(paper.vertexIdentity.vertexIds),{vertices:shell.sourceVertexCount,triangles:shell.sourceTriangleCount});
 check('Fitted shell draws only explicitly mapped cloth triangles',shell.visibleTriangleIndices.length>0&&shell.visibleTriangleIndices.every(id=>shell.mappedVertexMask[id]&&shell.actualPositionsModelUnits[id]!==null),{mapped:shell.mappedVertexCount,total:shell.sourceVertexCount,drawnTriangles:shell.visibleOriginalTriangleIds.length,sourceTriangles:shell.sourceTriangleCount});
 check('Unmapped model projections remain null',shell.actualPositionsModelUnits.every((p,i)=>shell.mappedVertexMask[i]?p!==null:p===null),{unmapped:shell.sourceVertexCount-shell.mappedVertexCount});
}
const port=9243;
const browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+scratch+'/profile','about:blank'],{stdio:['ignore','ignore','ignore']});
let ws;
try{
 let pages;
 for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}
 if(!pages)throw Error('Chromium CDP did not start');
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let sequence=0;const pending=new Map();
 ws.onmessage=message=>{const d=JSON.parse(message.data);if(d.id){const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);else if(d.method==='Network.loadingFailed')failedRequests.push(d.params);else if(d.method==='Network.responseReceived'&&d.params.response.status>=400)badResponses.push({url:d.params.response.url,status:d.params.response.status});else if(d.method?.startsWith('Browser.download'))downloadEvents.push(d);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;};
 const waitFor=async(expression,label,timeout=30000)=>{const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await run(expression))return;await pause(150);}throw Error('Timed out: '+label+' / '+await run('document.body.innerText.slice(0,1200)'));};
 const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
 const camera=preset=>run(`document.querySelector('[data-camera="${preset}"]').click()`);
 const tab=async n=>{await run(`document.querySelector('[data-tab="${n}"]').click()`);await pause(200);};
 const shot=async name=>{await run('scrollTo(0,0)');await pause(180);const image=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(image.data,'base64'));};
 const tap=async(x,y)=>{await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(120);};
 const screenPoint=async world=>run(`(()=>{const lab=window.__referenceModel,p=lab.view.camera.position.clone().set(...${JSON.stringify(world)}).project(lab.view.camera),r=lab.view.canvas().getBoundingClientRect();return{x:r.left+(p.x*.5+.5)*r.width,y:r.top+(.5-p.y*.5)*r.height};})()`);
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');
 await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await cdp('Page.navigate',{url});
 await waitFor('Boolean(window.__referenceModel)','actual model boot',60000);
 await waitFor('window.__referenceModel.getState().scene.triangles>0','actual geometry rendered',20000);
 const boot=await run('window.__referenceModel.getState()');
 check('Actual corrected product GLB boots and renders',boot.mode==='corrected'&&!boot.loading&&boot.scene.triangles>10000,{scene:boot.scene});
 await shot('01-corrected-quarter-ipad-chromium');
 await camera('top');await pause(250);await shot('02-corrected-tongue-top-ipad-chromium');
 const beforeSourceCamera=await run('({position:window.__referenceModel.view.camera.position.toArray(),quaternion:window.__referenceModel.view.camera.quaternion.toArray(),zoom:window.__referenceModel.view.camera.zoom})');
 await click('mode-source');await waitFor('window.__referenceModel.getState().mode==="source"&&!window.__referenceModel.getState().loading','source comparison load');await pause(250);
 const afterSourceCamera=await run('({position:window.__referenceModel.view.camera.position.toArray(),quaternion:window.__referenceModel.view.camera.quaternion.toArray(),zoom:window.__referenceModel.view.camera.zoom})');
 check('Source/corrected comparison retains same camera',JSON.stringify(beforeSourceCamera)===JSON.stringify(afterSourceCamera),{before:beforeSourceCamera,after:afterSourceCamera});
 check('Original preview does not reuse corrected paper bridge',await run('window.__referenceModel.getBridge()===undefined'),null);
 check('Source comparison cannot export corrected triangle IDs as source IDs',await run('document.getElementById("export-pairs").disabled&&document.getElementById("save-pair").disabled'),null);
 await shot('03-original-tongue-top-ipad-chromium');
 await click('mode-corrected');await waitFor('window.__referenceModel.getState().mode==="corrected"&&!window.__referenceModel.getState().loading','corrected comparison reload');
 await camera('quarter');await pause(200);
 const canvas=await run('(()=>{const r=window.__referenceModel.view.canvas().getBoundingClientRect();return{x:r.x+r.width*.5,y:r.y+r.height*.45};})()');
 const orbitBefore=await run('window.__referenceModel.view.camera.position.toArray()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x,y:canvas.y,id:1}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x+65,y:canvas.y+12,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(200);
 const orbitAfter=await run('window.__referenceModel.view.camera.position.toArray()');check('Single-finger orbit changes actual model camera',JSON.stringify(orbitBefore)!==JSON.stringify(orbitAfter),{before:orbitBefore,after:orbitAfter});
 const zoomBefore=await run('window.__referenceModel.view.camera.zoom');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x-30,y:canvas.y,id:1},{x:canvas.x+30,y:canvas.y,id:2}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x-65,y:canvas.y,id:1},{x:canvas.x+65,y:canvas.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(200);
 const zoomAfter=await run('window.__referenceModel.view.camera.zoom');check('Two-finger pinch zoom changes model camera',zoomAfter!==zoomBefore,{before:zoomBefore,after:zoomAfter});
 await tab(1);await pause(200);
 check('Final effect photo overlay and locked camera enabled',await run('!document.getElementById("photo-overlay").classList.contains("hidden")&&!window.__referenceModel.view.controls.enabled'),null);
 await shot('04-final-photo-overlay-ipad-chromium');
 await click('photo-plain');check('Original shoe photo can replace annotated final photo',await run('document.getElementById("photo-overlay").src.includes("03-shoe-side-original")'),null);await click('photo-plain');
 await tab(2);await pause(200);
 const exampleSummary=await run('(()=>{const s=window.__referenceModel.getState();return{examples:s.examples?.length??0,installationPairs:s.pairs.length,mappedInstallationPairs:s.pairs.filter(p=>p.pair.paper&&p.pair.actual).length};})()');
 check('Visible cloth examples remain separate from installation targets',exampleSummary.examples>0&&exampleSummary.installationPairs===staticBridge.points.length,exampleSummary);
 const found=await run(`(()=>{const lab=window.__referenceModel,example=lab.getState().examples?.find(e=>e.pair.paper&&e.pair.actual);if(example)return{flat:example.pair.paper.flatMm,pair:example.pair};const bridge=lab.getBridge();for(let y=55;y<240;y+=8)for(let x=25;x<240;x+=8){const pair=bridge.paperToModel([x,y]);if(pair.paper&&pair.actual)return{flat:[x,y],pair};}return null;})()`);
 check('Visible paper point reaches actual labelled cloth',!!found,found?.pair??null);
 const svgPoint=await run(`(()=>{const l=window.__referenceModel,s=l.paperView.svg,p=new DOMPoint(${found.flat[0]},${JSON.stringify(JSON.parse(await readFile('public/pattern-engineering/data/pattern-mm.json','utf8')).bounds.height)}-${found.flat[1]}).matrixTransform(s.getScreenCTM());return{x:p.x,y:p.y};})()`);
 await tap(svgPoint.x,svgPoint.y);
 const selected=await run('window.__referenceModel.getState().selected');
 check('Touch paper pick keeps real paper + actual model independent IDs',!!selected?.pair?.paper&&!!selected.pair.actual&&selected.pair.paper.triangle>=0&&selected.pair.actual.triangle>=0,{pair:selected?.pair});
 const actualScreen=await screenPoint(selected.pair.actual.modelPosition);await tap(actualScreen.x,actualScreen.y);
 const reverse=await run('window.__referenceModel.getState().selected');
 check('Touch actual cloth pick maps back to same paper location',reverse?.label==='模型选点'&&Math.hypot(reverse.pair.paper.flatMm[0]-selected.pair.paper.flatMm[0],reverse.pair.paper.flatMm[1]-selected.pair.paper.flatMm[1])<.2,{before:selected.pair.paper.flatMm,after:reverse?.pair?.paper?.flatMm});
 const blocked=await run('window.__referenceModel.getBridge().photoToModel([774.121565,373.342457],"any")');
 check('Foreground snap/PU target does not invent a hidden cloth anchor',blocked.anchor===null,blocked);
 const outside=await run('window.__referenceModel.getBridge().photoToModel([-10000,-10000],"any")');check('Outside photograph remains unmapped',outside.anchor===null,outside);
 const beforeSaved=await run('window.__referenceModel.getState().pairs.length');await click('save-pair');const pairCount=await run('window.__referenceModel.getState().pairs.length');check('Manual pair keeps independent identities',pairCount===beforeSaved+1,{before:beforeSaved,points:pairCount});
 await shot('05-paper-model-linked-pick-ipad-chromium');
 const shellState=await run('window.__referenceModel.getState()');
 if(staticBridge.fittedPaperShell){
  check('Matching actual model/paper shell identity is enabled',shellState.shellAvailable&&!shellState.shellStale,{shell:shellState.scene.shell});
  await click('shell-visible');await click('shell-flat');await pause(200);await click('shell-fit');await pause(200);await click('shell-flat');
  await waitFor('window.__referenceModel.getState().scene.shell.progress===0','last shell animation reaches flat',12000);
  const flat=await run('window.__referenceModel.getState().scene.shell');check('Rapid shell animation interruption: last target wins',flat.progress===0&&flat.sourceVertices===staticBridge.fittedPaperShell.sourceVertexCount,flat);
  const shellAnimation=await run(`(async()=>{const lab=window.__referenceModel;let stamps=[],last=performance.now(),live=true;const f=t=>{stamps.push(t-last);last=t;if(live)requestAnimationFrame(f);};requestAnimationFrame(f);const begin=performance.now();await lab.view.animateShellTo(1,1200);live=false;stamps.sort((a,b)=>a-b);return{elapsedMs:performance.now()-begin,frames:stamps.length,medianFrameMs:stamps[Math.floor(stamps.length/2)],p95FrameMs:stamps[Math.floor(stamps.length*.95)],progress:lab.view.info().shell.progress};})()`);
  check('Same-source shell display interpolation reaches actual model',shellAnimation.progress===1,shellAnimation);
  check('Shell interpolation leaves authoritative paper coordinates unchanged',await run(`JSON.stringify(Array.from(window.__referenceModel.getBridge().paperMesh.flatMm))===${JSON.stringify(JSON.stringify(staticBridge.fittedPaperShell.sourceFlatMm))}`),{sourceVertices:staticBridge.fittedPaperShell.sourceVertexCount});
  await shot('06-same-paper-shell-fit-ipad-chromium');
  await run('(()=>{const e=document.getElementById("reg-originXPx");e.value=String(Number(e.value)+1);e.dispatchEvent(new Event("change"));})()');
  check('Registration edits invalidate stale fitted shell',await run('window.__referenceModel.getState().shellStale&&!window.__referenceModel.getState().shellAvailable'),null);
  await click('reset-registration');check('Restoring exact registration re-enables shell',await run('window.__referenceModel.getState().shellAvailable&&!window.__referenceModel.getState().shellStale'),null);
 }
 await click('export-pairs');await click('paper-svg');await pause(500);
 const files=await readdir(downloads);check('Pair JSON and paper SVG actually download',files.includes('ONWARD-paper-photo-model-bridge.json')&&files.includes('ONWARD-paper-model-reference.svg'),files);
 const exported=JSON.parse(await readFile(downloads+'/ONWARD-paper-photo-model-bridge.json','utf8'));
 check('Export keeps both coordinate systems and unverified status',exported.productionReady===false&&exported.paperUnits==='mm'&&exported.modelUnits===meta.units&&exported.correctedModelSha256===meta.correctedSha256&&exported.anchorModel==='corrected'&&exported.points.length===pairCount,{status:exported.status,paperUnits:exported.paperUnits,modelUnits:exported.modelUnits,anchorModel:exported.anchorModel,points:exported.points.length});
 const links=await run('Array.from(document.querySelectorAll(".downloads a")).filter(a=>a.hasAttribute("download")).map(a=>({href:a.href,label:a.textContent}))');
 for(const link of links){const response=await fetch(link.href,{method:'HEAD'});check('Download target available: '+link.label,response.ok,{status:response.status,url:link.href,contentLength:response.headers.get('content-length')});}
  check('Normal application assets have no failed requests',failedRequests.length===0&&badResponses.filter(r=>!r.url.endsWith('/favicon.ico')).length===0,{failedRequests,badResponses});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});await tab(0);await camera('top');await pause(200);await shot('07-corrected-tongue-desktop');
 // Missing-load diagnostic is performed after normal functional screenshots.
 await cdp('Network.setBlockedURLs',{urls:['*source-preview.glb*']});await click('mode-source');await waitFor('!window.__referenceModel.getState().loading','blocked model load error',10000);
 check('Model fetch failure presents retry instead of silent success',await run('!document.getElementById("retry").classList.contains("hidden")&&document.getElementById("load-text").textContent.includes("未能载入")'),await run('document.getElementById("load-text").textContent'));
 await cdp('Network.setBlockedURLs',{urls:[]});await click('retry');await waitFor('!window.__referenceModel.getState().loading&&document.getElementById("load-mask").classList.contains("hidden")','retry actual load',30000);
 check('Retry recovers actual GLB after transient load failure',await run('window.__referenceModel.getState().scene.loaded'),null);
 check('No uncaught browser exceptions',errors.length===0,errors);
 const report={testedAt:new Date().toISOString(),url,environment:'Linux Chromium headless with SwiftShader software WebGL;1024×768 touch events and1440×1000 desktop. This is NOT physical iPad hardware or Safari.',checks,errors,failedRequests,badResponses,downloadEvents,sourceModelSha256:meta.sourceSha256,correctedModelSha256:meta.correctedSha256,limitations:['Browser functionality and numerical correspondence do not prove real manufacturing or photo/physical accuracy.','Only explicitly labelled photo-visible cloth participates. Hidden or hardware-obscured paper stays unmapped.','Software WebGL timing is not real iPad GPU performance.','A blocked source-model request is intentional during the final retry diagnostic.']};
 await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({checks:checks.length,passed:checks.every(c=>c.passed),errors:errors.length,screenshots:out,downloads:files},null,2));
}catch(error){await writeFile(out+'/browser-validation-failure.json',JSON.stringify({testedAt:new Date().toISOString(),url,error:String(error),checks,errors,failedRequests,badResponses},null,2)+'\n');throw error;}
finally{ws?.close();browser.kill('SIGTERM');}
