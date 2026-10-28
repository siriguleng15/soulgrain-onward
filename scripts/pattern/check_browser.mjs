/** Actual Chromium smoke test. iPad viewport/touch emulation is NOT Safari. */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const repo=process.cwd(),out=path.join(repo,'public/pattern-engineering/verification');
const scratch='/tmp/onward-pattern-browser-qa-'+Date.now(),downloads=scratch+'/downloads';
await mkdir(out,{recursive:true});await mkdir(downloads,{recursive:true});
const timingsOnly=process.argv.includes('--timings-only');
const port=9238,url=process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4326/soulgrain-onward/onward-pattern/pattern-lab.html';
const browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+scratch+'/profile','about:blank'],{stdio:['ignore','ignore','ignore']});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let ws;
try{
  let info;for(let i=0;i<100;i++){try{const r=await fetch('http://127.0.0.1:'+port+'/json');info=await r.json();break;}catch{await pause(100);}}
  if(!info)throw Error('Chromium CDP did not start');
  const target=info.find(t=>t.type==='page');ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
  let sequence=0;const pending=new Map(),errors=[],failedRequests=[],downloadsEvents=[];
  ws.onmessage=message=>{const data=JSON.parse(message.data);if(data.id){const p=pending.get(data.id);if(p){pending.delete(data.id);data.error?p.reject(Error(JSON.stringify(data.error))):p.resolve(data.result);}}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);else if(data.method==='Network.loadingFailed')failedRequests.push(data.params);else if(data.method?.startsWith('Browser.download'))downloadsEvents.push(data);};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text+' '+(r.exceptionDetails.exception?.description??''));return r.result.value;};
  await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Network.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await cdp('Page.navigate',{url});
  for(let i=0;i<150;i++){if(await run('Boolean(window.__patternLab)'))break;await pause(100);}
  if(!await run('Boolean(window.__patternLab)'))throw Error('App did not finish: '+await run('document.body.innerText'));
  if(timingsOnly){
    await run('window.__patternLab.setPhase(2)');await pause(400);
    const measurements={};
    for(const on of [true,false]){
      await run(`(()=>{const el=document.getElementById('wireframe');if(el.checked!==${on})el.click();window.__patternLab.view.setProgress(0);})()`);await pause(300);
      const timing=await run(`(async()=>{const lab=window.__patternLab,wireframeChecked=document.getElementById('wireframe').checked;let times=[],last=performance.now(),active=true;const f=t=>{times.push(t-last);last=t;if(active)requestAnimationFrame(f);};requestAnimationFrame(f);const start=performance.now();await lab.view.animateTo(1,1600);active=false;times.sort((a,b)=>a-b);return{wireframeChecked,durationMs:performance.now()-start,frames:times.length,medianFrameMs:times[Math.floor(times.length/2)],p95FrameMs:times[Math.floor(times.length*.95)],renderer:lab.view.renderer.getContext().getParameter(lab.view.renderer.getContext().RENDERER)};})()`);
      if(timing.wireframeChecked!==on)throw Error('Wireframe state did not match requested benchmark');
      measurements[on?'wireframeOn':'wireframeOff']=timing;
    }
    const report=JSON.parse(await readFile(out+'/browser-validation.json','utf8'));
    report.performance={...report.performance,...measurements};report.performanceTestedAt=new Date().toISOString();report.performanceStateEvidence='Each timed sample reads actual #wireframe.checked immediately before animation. Initial sample explicitly enables wireframe; second explicitly disables it.';
    await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(measurements,null,2));
    process.exitCode=0;
  }else{
  const checks=[];const check=(name,passed,detail)=>{checks.push({name,passed,detail});if(!passed)throw Error(name+': '+JSON.stringify(detail));};
  const screenshot=async name=>{const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(r.data,'base64'));};
  const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
  const stage=async n=>{await run(`document.querySelector('[data-phase="${n}"]').click()`);await pause(300);};
  const tap=async(x,y)=>{await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(100);};
  const initial=await run('({width:innerWidth,height:innerHeight,touch:navigator.maxTouchPoints,info:window.__patternLab.view.info(),calibration:window.__patternLab.mesh.pattern.calibration})');
  check('Real calibrated pattern boot',initial.info.vertexCount>8000&&initial.info.triangleCount>15000,initial.info);
  await screenshot('01-calibration-ipad-chromium');
  await stage(1);
  const flatPoint=await run(`(()=>{const lab=window.__patternLab;const svg=lab.flatView.svg;const p=new DOMPoint(80,lab.mesh.bounds.height-120).matrixTransform(svg.getScreenCTM());return{x:p.x,y:p.y};})()`);
  await tap(flatPoint.x,flatPoint.y);
  const selection=await run('window.__patternLab.getState().selection');
  check('Touch 2D selection maps to same source millimetres',selection&&Math.hypot(selection.flatMm[0]-80,selection.flatMm[1]-120)<.01,selection);
  const threePoint=await run(`(()=>{const lab=window.__patternLab,s=lab.getState().selection,p=lab.view.projectPoint(s.formedMm),r=lab.view.canvas().getBoundingClientRect();return{x:p.x+r.left,y:p.y+r.top};})()`);
  await tap(threePoint.x,threePoint.y);
  const selection3=await run('window.__patternLab.getState().selection');
  check('Touch 3D hit returns corresponding flat point',Math.hypot(selection3.flatMm[0]-80,selection3.flatMm[1]-120)<.5,selection3);
  const svgBefore=await run('window.__patternLab.flatView.svg.getAttribute("viewBox")');
  const box=await run('(()=>{const r=window.__patternLab.flatView.svg.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()');
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x-35,y:box.y,id:1},{x:box.x+35,y:box.y,id:2}]});
  await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x-65,y:box.y,id:1},{x:box.x+65,y:box.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const svgAfter=await run('window.__patternLab.flatView.svg.getAttribute("viewBox")');
  check('Two-finger SVG zoom',svgBefore!==svgAfter,{before:svgBefore,after:svgAfter});await click('reset-flat');
  await stage(2);await screenshot('02-fold-controls-ipad-chromium');
  const cpuProgress=await run(`(()=>{const view=window.__patternLab.view,times=[];for(let i=0;i<20;i++){const start=performance.now();view.setProgress(i/19);times.push(performance.now()-start);}view.setProgress(0);times.sort((a,b)=>a-b);return{updates:20,totalMs:times.reduce((a,b)=>a+b,0),medianMs:times[10],maxMs:times.at(-1)};})()`);
  const idleRaf=await run(`new Promise(resolve=>{const values=[];let last=performance.now(),start=last;const tick=t=>{values.push(t-last);last=t;if(t-start<1000)requestAnimationFrame(tick);else{values.sort((a,b)=>a-b);resolve({frames:values.length,medianMs:values[Math.floor(values.length/2)],p95Ms:values[Math.floor(values.length*.95)]});}};requestAnimationFrame(tick);})`);
  await run(`(()=>{const el=document.getElementById('wireframe');if(!el.checked)el.click();})()`);
  const performance=await run(`(async()=>{const lab=window.__patternLab,wireframeChecked=document.getElementById('wireframe').checked;let times=[],last=performance.now(),active=true;const f=t=>{times.push(t-last);last=t;if(active)requestAnimationFrame(f);};requestAnimationFrame(f);const start=performance.now();await lab.view.animateTo(1,1200);active=false;times.sort((a,b)=>a-b);return{wireframeChecked,durationMs:performance.now()-start,frames:times.length,medianFrameMs:times[Math.floor(times.length/2)],p95FrameMs:times[Math.floor(times.length*.95)],renderer:lab.view.renderer.getContext().getParameter(lab.view.renderer.getContext().RENDERER)};})()`);
  console.log('Animation timing',JSON.stringify(performance));
  check('Continuous animation reaches formed endpoint',await run('Math.abs(window.__patternLab.getState().progress-1)<1e-9'),performance);
  await click('unfold');await pause(150);await click('fold');await pause(150);await click('unfold');
  for(let i=0;i<80;i++){if(await run('window.__patternLab.getState().progress===0'))break;await pause(100);}
  const cancelled=await run('window.__patternLab.getState()');
  check('Rapid animation interruption: last requested target wins',cancelled.progress===0&&cancelled.validation.flatReturnErrorMm===0,{progress:cancelled.progress,returnError:cancelled.validation.flatReturnErrorMm});
  await click('wireframe');
  const performanceWithoutWireframe=await run(`(async()=>{const lab=window.__patternLab,wireframeChecked=document.getElementById('wireframe').checked;let times=[],last=performance.now(),active=true;const f=t=>{times.push(t-last);last=t;if(active)requestAnimationFrame(f);};requestAnimationFrame(f);const start=performance.now();await lab.view.animateTo(1,1200);active=false;times.sort((a,b)=>a-b);return{wireframeChecked,durationMs:performance.now()-start,frames:times.length,medianFrameMs:times[Math.floor(times.length/2)],p95FrameMs:times[Math.floor(times.length*.95)]};})()`);
  console.log('Without wireframe',JSON.stringify(performanceWithoutWireframe));
  await screenshot('02b-formed-three-quarter-ipad-chromium');
  const canvasBox=await run('(()=>{const r=window.__patternLab.view.canvas().getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()');
  const zoomBefore=await run('window.__patternLab.view.camera.zoom');
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvasBox.x-35,y:canvasBox.y,id:1},{x:canvasBox.x+35,y:canvasBox.y,id:2}]});
  await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvasBox.x-65,y:canvasBox.y,id:1},{x:canvasBox.x+65,y:canvasBox.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const zoomAfter=await run('window.__patternLab.view.camera.zoom');check('Two-finger Three.js zoom',zoomBefore!==zoomAfter,{before:zoomBefore,after:zoomAfter});
  await stage(3);await pause(500);await screenshot('03-photo-overlay-ipad-chromium');
  await stage(4);await run('document.querySelector("[data-step=\\"9\\"]").click()');await screenshot('04-clasp-process-ipad-chromium');
  for(let step=1;step<=9;step++){await run(`document.querySelector('[data-step="${step}"]').click()`);const text=await run('document.getElementById("step-explanation").textContent');check('Clasp process step '+step,text.length>15,text);}
  await click('guides');await click('clasps');await click('spirals');await click('guides');await click('clasps');await click('spirals');
  await stage(5);await click('project-points');
  const mapped=await run('window.__patternLab.getState().points');check('All observed fixed ends and separate snap projections bind',mapped.length===8&&mapped.every(p=>p.anchor),mapped.map(p=>({id:p.id,triangle:p.anchor?.triangle,flatMm:p.anchor?.flatMm})));
  const ids=JSON.stringify(mapped.map(p=>[p.anchor.triangle,p.anchor.barycentric,p.anchor.flatMm]));await run('window.__patternLab.setProgress(0)');
  const flattened=await run('window.__patternLab.getState().points');check('Locked material identity survives unfold',ids===JSON.stringify(flattened.map(p=>[p.anchor.triangle,p.anchor.barycentric,p.anchor.flatMm])),{points:flattened.length});
  await screenshot('05-reverse-mapping-ipad-chromium');
  await run('window.__patternLab.setProgress(1)');
  const snap=await run('window.__patternLab.snapshot()');await writeFile(scratch+'/project.json',JSON.stringify(snap));
  check('Project contains exact immutable mesh and provenance',snap.vertexIdentity.exactMeshIncluded&&snap.vertexIdentity.flatMm.length===initial.info.vertexCount*2&&snap.provenance.blueSnapCenterUserConfirmed===true,{vertices:snap.vertexIdentity.vertexIds.length,triangles:snap.vertexIdentity.triangleIndices.length/3});
  await cdp('DOM.enable');const doc=await cdp('DOM.getDocument');const input=await cdp('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#import-project'});await cdp('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[scratch+'/project.json']});await pause(500);
  const restored=await run('window.__patternLab.getState()');check('JSON project file selection/import restores anchors',restored.points.every(p=>p.anchor)&&!await run('document.getElementById("toast").textContent.includes("无法恢复")'),{points:restored.points.length});
  const badSnapshot=structuredClone(snap);badSnapshot.pattern.boundary[0][0]+=1;await writeFile(scratch+'/wrong-source.json',JSON.stringify(badSnapshot));await cdp('DOM.setFileInputFiles',{nodeId:input.nodeId,files:[scratch+'/wrong-source.json']});await pause(200);
  check('Mismatched source pattern import rejected',await run('/不一致|不同|不匹配/.test(document.getElementById("toast").textContent)'),await run('document.getElementById("toast").textContent'));
  for(const id of ['export-svg','export-json','export-csv','flat-png']){await click(id);await pause(id==='flat-png'?1500:250);}
  await stage(4);await run('document.querySelector("[data-step=\\"9\\"]").click()');await click('photo-png');await pause(1500);
  const files=await readdir(downloads);check('SVG / JSON / CSV / high-resolution PNG downloads', ['ONWARD-factory-reference.svg','ONWARD-pattern-project.json','ONWARD-points-mm.csv','ONWARD-pattern-view.png','ONWARD-clasp-process-9.png'].every(f=>files.includes(f)),files);
  const flatPng=await readFile(downloads+'/ONWARD-pattern-view.png'),claspPng=await readFile(downloads+'/ONWARD-clasp-process-9.png');
  check('PNG exports contain requested pixel dimensions',flatPng.readUInt32BE(16)===2400&&claspPng.readUInt32BE(16)===2560,{flat:[flatPng.readUInt32BE(16),flatPng.readUInt32BE(20)],clasp:[claspPng.readUInt32BE(16),claspPng.readUInt32BE(20)]});
  const exportedSvg=await readFile(downloads+'/ONWARD-factory-reference.svg','utf8');check('Factory SVG has physical mm and nonproduction notice',exportedSvg.includes('width="')&&exportedSvg.includes('mm"')&&exportedSvg.includes('非生产定稿'),{bytes:exportedSvg.length});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});await stage(5);await pause(300);await screenshot('06-desktop-overview');
  check('No uncaught browser exceptions',errors.length===0,errors);
  const report={testedAt:new Date().toISOString(),url,environment:'Chromium headless Linux with SwiftShader software rendering; 1024×768 touch emulation and 1440×1000 desktop. NOT real iPad hardware or Safari.',checks,performance:{wireframeOn:performance,wireframeOff:performanceWithoutWireframe,cpuProgressUpdates:cpuProgress,idleRaf},errors,failedRequests,downloadEvents:downloadsEvents.map(e=>({method:e.method,params:e.params})),sourceUnchanged:await run('window.__patternLab.getState().validation.referenceBoundaryErrorMm===0'),limitations:['Frame timing is headless CPU/software rendering and does not establish real iPad performance.','Browser tests prove interaction and numerical correspondence, not physical manufacturing or silhouette accuracy.','Screenshots visibly show lasting-edge and full-body silhouette mismatch; only assumed eyelet correspondence is fitted.','Button exports and stage navigation are invoked through the real DOM; touch selection and pinch gestures use CDP touch events.']};
  await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:checks.length,passed:checks.every(c=>c.passed),performance,errors:errors.length,downloads:files},null,2));
  }
}finally{ws?.close();browser.kill('SIGTERM');}
