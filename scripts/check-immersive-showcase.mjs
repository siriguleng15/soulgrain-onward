/** Independent source + actual WebGL interaction verification.
 * Linux Chromium / SwiftShader and emulated touch are NOT physical iPad Safari.
 * Run against the isolated showcase build, never the production site.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,copyFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const repo=process.cwd(),out=path.join(repo,'public/immersive-showcase/verification');
const url=process.argv.find(arg=>arg.startsWith('http'))??'http://127.0.0.1:4510/immersive-showcase.html';
const scratch='/tmp/onward-immersive-qa-'+Date.now(),profile=scratch+'/profile';
const checks=[],errors=[],failedRequests=[],badResponses=[],requests=new Map();
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail:structuredClone(detail)});assert.ok(passed,name+': '+JSON.stringify(detail));console.log('PASS',name);};
const distance=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]));
await mkdir(out,{recursive:true});await mkdir(profile,{recursive:true});
async function archivePreviousFailure(){try{await copyFile(out+'/browser-validation-failure.json',scratch+'/previous-failure.json');await unlink(out+'/browser-validation-failure.json');}catch(error){if(error.code!=='ENOENT')throw error;}}

const sourceSpecs=[
 ['public/assets/soulgrain_onward_finished_v8.glb','9d28c469089cb039fd17393db7e84d7c46def77db4eeb04aa05deed8a32c6f63'],
 ['public/assets/onward-ad-v1/onward-ad-v1.glb','1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'],
 ['public/assets/onward-ad-v1/cuff-structure.json','7d313b066c1007f05c4edabfdd92fd51aff78e61df91841b76080ef6209dd085'],
];
const sources=[];
for(const[file,expected]of sourceSpecs){const bytes=await readFile(path.join(repo,file));sources.push({file,bytes:bytes.length,sha256:digest(bytes)});assert.equal(digest(bytes),expected,file);}
check('Confirmed V8 model and advertising-derived source bytes remain unchanged',true,sources);
const glbBytes=await readFile(path.join(repo,sourceSpecs[1][0]));
assert.equal(glbBytes.readUInt32LE(0),0x46546c67);assert.equal(glbBytes.readUInt32LE(4),2);
const document=JSON.parse(glbBytes.subarray(20,20+glbBytes.readUInt32LE(12)).toString('utf8'));
const triangles=document.meshes.reduce((sum,mesh)=>sum+mesh.primitives.reduce((n,p)=>n+(p.indices!==undefined?document.accessors[p.indices].count/3:document.accessors[p.attributes.POSITION].count/3),0),0);
const primitives=document.meshes.flatMap(mesh=>mesh.primitives),named=document.nodes.filter(node=>node.mesh!==undefined);
check('Actual source contains textured PBR shoe geometry rather than a display-video substitute',triangles>400000&&primitives.every(p=>p.attributes.POSITION!==undefined)&&primitives.some(p=>p.attributes.TEXCOORD_0!==undefined)&&document.images.length>=9&&document.materials.length>=25,{triangles,meshNodes:named.length,primitives:primitives.length,materials:document.materials.length,embeddedImages:document.images.length,animations:document.animations?.length??0});
const partSelectors={cuff:/AD_Cuff_Shell/,tongue:/Convertible_Tongue|Tongue_Rhinestone_Medallion/,pattern:/Convertible_Shaft_Fixed|Original_Vamp|Shoe_Body/,clasps:/Mongolian_Clasp_Heads|Mongolian_Clasp_Loops/,heel:/Finished_Heel_Leather/,aglets:/Finished_Lace_Aglets/,logo:/Finished_Heel_Logo/};
const partNodes=Object.fromEntries(Object.entries(partSelectors).map(([id,rule])=>[id,named.filter(n=>rule.test(n.name)).map(n=>n.name)]));
check('All seven exploration targets are backed by existing named source meshes',Object.values(partNodes).every(nodes=>nodes.length>0),partNodes);
const metadata=JSON.parse(await readFile(path.join(repo,sourceSpecs[2][0]),'utf8'));
check('Cuff deformation metadata preserves its confirmed V8 source and continuous curve samples',metadata.sourceGLBSha256===sourceSpecs[0][1]&&metadata.sourceCommit==='b169dde54caf700d2557dcfbafad6024c6ffe50b'&&metadata.sampleCount===metadata.centerline.length&&metadata.sampleCount>=128,{sourceGLBSha256:metadata.sourceGLBSha256,sourceCommit:metadata.sourceCommit,sampleCount:metadata.sampleCount,lengthModelUnits:metadata.length});
const staticReport={testedAt:new Date().toISOString(),sources,checks:[...checks],scope:'Read-only original model audit. Does not certify real-world shoe/material manufacturing.'};
await writeFile(out+'/source-validation.json',JSON.stringify(staticReport,null,2)+'\n');
if(process.argv.includes('--static-only')){console.log(JSON.stringify({passed:true,checks:checks.length,staticOnly:true}));process.exit(0);}

const port=9473;
const chrome=spawn(process.env.CHROME_PATH??'/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
let socket;
try{
 let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}
 assert.ok(pages,'Chromium CDP starts');socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let sequence=0;const pending=new Map();
 socket.onmessage=e=>{const message=JSON.parse(e.data);if(message.id){const item=pending.get(message.id);if(!item)return;pending.delete(message.id);message.error?item.reject(Error(JSON.stringify(message.error))):item.resolve(message.result);}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails);else if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')errors.push({console:message.params.args.map(a=>a.value??a.description).join(' ')});else if(message.method==='Network.requestWillBeSent')requests.set(message.params.requestId,message.params.request);else if(message.method==='Network.loadingFailed')failedRequests.push({...message.params,url:requests.get(message.params.requestId)?.url});else if(message.method==='Network.responseReceived'&&message.params.response.status>=400)badResponses.push({status:message.params.response.status,url:message.params.response.url});};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;};
 const waitFor=async(expression,label,timeout=60000)=>{const until=Date.now()+timeout;while(Date.now()<until){if(await run(expression))return;await pause(150);}throw Error('Timed out: '+label+' / '+await run('document.body.innerText.slice(0,1000)'));};
 const settle=()=>run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const shot=async name=>{await settle();const screenshot=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(screenshot.data,'base64'));};
 const tap=async(x,y)=>{await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(100);};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await cdp('Page.navigate',{url});
 await waitFor('Boolean(window.__onwardShowcase)','production showcase API');
 const api=await run('Object.keys(window.__onwardShowcase)');
 check('Real showcase exposes scene, input, intro and review controls',api.includes('getState')&&api.includes('selectPart')&&api.includes('skipIntro'),api);
 await waitFor('window.__onwardShowcase.getState().ready||window.__onwardShowcase.getState().loadingError','confirmed Nightfall model and embedded textures',90000);
 const state=()=>run('window.__onwardShowcase.getState()');
 const click=ui=>run(`document.querySelector('[data-ui="${ui}"]').click()`);
 const finish=async()=>{await settle();await waitFor('!window.__onwardShowcase.getState().isTransitioning','natural completion of current camera and cloth narrative (no seek)',120000);await settle();if(await run('window.__onwardShowcase.getState().isTransitioning'))await waitFor('!window.__onwardShowcase.getState().isTransitioning','resized camera natural completion',120000);};
 const recordVideo=async()=>{
  await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await settle();
  await run('window.__onwardShowcase.setQuality("balanced");window.__onwardShowcase.setMotion(true);window.__onwardShowcase.setScrollProgress(0);window.__onwardShowcase.replayIntro();scrollTo({top:0,behavior:"instant"})');
  const framesDir=scratch+'/review-frames';await mkdir(framesDir,{recursive:true});let frameIndex=0;const keyframes=[];
  await run('(()=>{const s=window.__onwardShowcase.scene;cancelAnimationFrame(s.frame);s.frame=0;s.last=0;s.clock=0;})()');
  const captureFrame=async()=>{await run(`(()=>{const s=window.__onwardShowcase.scene;s.last=${frameIndex*1000/12};s.lastRender=-Infinity;s.loop(${(frameIndex+1)*1000/12});cancelAnimationFrame(s.frame);s.frame=0;})()`);await settle();const frame=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(framesDir+'/'+String(frameIndex++).padStart(4,'0')+'.png',Buffer.from(frame.data,'base64'));};
  const frames=async count=>{for(let i=0;i<count;i++)await captureFrame();};
  await frames(64);check('Recorded intro naturally reaches its real completion',await run('window.__onwardShowcase.getState().introProgress===1'),{frames:64});await frames(12);
  const checkPose=async(id,unfold=0)=>{const pose=await run(`(()=>{const s=window.__onwardShowcase.scene,p=s.partPose('${id}',${unfold});return{part:s.focusPart,unfold:s.unfold,position:s.camera.position.toArray(),target:s.controls.target.toArray(),expectedPosition:p.position.toArray(),expectedTarget:p.target.toArray(),moving:s.isTransitioning,progress:s.director.getState().progress};})()`);check(`Recorded ${id} / unfold${unfold} reaches production narrative endpoint`,pose.part===id&&!pose.moving&&pose.progress>=.999&&distance(pose.position,pose.expectedPosition)<1e-5&&distance(pose.target,pose.expectedTarget)<1e-5&&Math.abs(pose.unfold-unfold)<1e-5,pose);keyframes.push({part:id,unfold,frameIndex:frameIndex-1,pose});};
  const cameraSegment=async part=>{await run(`window.__onwardShowcase.selectPart('${part}')`);await frames(24);await checkPose(part);};
  await cameraSegment('cuff');
  await run('window.__onwardShowcase.setUnfold(1)');await frames(26);await checkPose('cuff',1);await frames(12);
  await run('window.__onwardShowcase.setUnfold(0)');await frames(26);await checkPose('cuff',0);
  await cameraSegment('tongue');await cameraSegment('heel');await cameraSegment('logo');
  await run('window.__onwardShowcase.home()');await frames(24);const home=await state();check('Recorded return naturally restores the complete shoe',home.mode==='story'&&home.focusPart===null&&!home.isTransitioning&&home.unfold===0,{camera:home.camera,mode:home.mode,unfold:home.unfold});
  const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','12','-i',framesDir+'/%04d.png','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out+'/showcase-exploration.mp4'],{encoding:'utf8'});assert.equal(encoded.status,0,encoded.stderr);
  await copyFile(framesDir+'/0070.png',out+'/showcase-process-poster.png');await copyFile(framesDir+'/0049.png',out+'/02-particle-shoe-arrival.png');
  const openFrame=keyframes.find(k=>k.part==='cuff'&&k.unfold===1);await copyFile(framesDir+'/'+String(openFrame.frameIndex).padStart(4,'0')+'.png',out+'/11-cuff-structural-unfold.png');
  await run('(()=>{const s=window.__onwardShowcase.scene;s.last=0;s.frame=requestAnimationFrame(s.loop);})()');
  return{file:'showcase-exploration.mp4',frames:frameIndex,fps:12,durationSeconds:frameIndex/12,keyframes,method:'Actual WebGL-rendered frames driven by the unmodified Scene.loop at synthetic12fps timestamps. Standard replayIntro/selectPart/setUnfold/home APIs run the production easing and coupled camera/cloth animation. No seekTransition/seekUnfold or forced director completion is used. The normal RAF is paused only while capturing; encoded12fps is NOT real-time performance.'};
 };

 const boot=await state();
 check('Loaded scene displays the confirmed real model with all seven actual mesh targets',boot.ready&&boot.sourceModelSHA===sourceSpecs[1][1]&&boot.parts.length===7&&boot.parts.every(p=>p.meshes>0),boot);
 check('Verified invalid cloth normals are repaired at runtime without changing source artwork',boot.normalRepair.repairedMaterials>=9&&boot.normalRepair.replacementTextures>0&&boot.normalRepair.replacementTextures<=boot.normalRepair.repairedMaterials&&boot.normalRepair.normalValidation.minimumDecodedZ>.98,boot.normalRepair);
 if(process.argv.includes('--detail-review')){
  await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(true);window.__onwardShowcase.home()');await finish();
  await run('window.__onwardShowcase.selectPart("cuff")');await finish();
  const firstNaturalCamera=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("cuff",0);return{position:s.camera.position.toArray(),target:s.controls.target.toArray(),expectedPosition:p.position.toArray(),expectedTarget:p.target.toArray(),progress:s.director.getState().progress,moving:s.isTransitioning};})()');
  check('Cold story-to-cuff camera reaches its real endpoint without seek completion',!firstNaturalCamera.moving&&firstNaturalCamera.progress>=.999&&distance(firstNaturalCamera.position,firstNaturalCamera.expectedPosition)<1e-5&&distance(firstNaturalCamera.target,firstNaturalCamera.expectedTarget)<1e-5,firstNaturalCamera);
  await shot('04-cuff-material-closeup');
  await run('window.__onwardShowcase.home()');await finish();
 }
 if(process.argv.includes('--video-only')){
  const bundleURLs=await run('[...document.scripts].map(s=>s.src).concat([...document.querySelectorAll("link[rel=stylesheet]")].map(s=>s.href)).filter(Boolean)');
  const bundles=await Promise.all(bundleURLs.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,'Review application bundle '+url);return{url,sha256:digest(Buffer.from(await response.arrayBuffer()))};}));
  await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(true);window.__onwardShowcase.home()');await finish();
  const resizeStart=await run('(()=>{window.__onwardShowcase.selectPart("tongue");const s=window.__onwardShowcase.scene;return{generation:s.director.generation,moving:s.director.moving,progress:s.director.getState().progress};})()');const generationBefore=resizeStart.generation;
  await cdp('Emulation.setDeviceMetricsOverride',{width:768,height:1024,deviceScaleFactor:1,mobile:false});await finish();
  const actualResize=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("tongue",0);return{viewport:[innerWidth,innerHeight],generation:s.director.generation,hasJourney:Boolean(s.director.from&&s.director.to),position:s.camera.position.toArray(),target:s.controls.target.toArray(),expectedPosition:p.position.toArray(),expectedTarget:p.target.toArray(),progress:s.director.getState().progress,moving:s.isTransitioning};})()');
  check('Genuine landscape-to-portrait resize retargets and naturally completes the active camera',resizeStart.moving&&resizeStart.progress===0&&actualResize.hasJourney&&actualResize.generation>generationBefore&&!actualResize.moving&&actualResize.progress>=.999&&distance(actualResize.position,actualResize.expectedPosition)<1e-5&&distance(actualResize.target,actualResize.expectedTarget)<1e-5,{resizeStart,...actualResize});
  const video=await recordVideo();check('Natural production-timeline movie has no JavaScript or shader errors',errors.length===0&&failedRequests.length===0&&badResponses.length===0,{errors,failedRequests,badResponses});
  await writeFile(out+'/video-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,sources,bundles,checks,video,errors,failedRequests,badResponses,environment:'Linux Chromium / SwiftShader. Synthetic12fps review frames; NOT real-time GPU or iPad Safari performance.'},null,2)+'\n');
  await archivePreviousFailure();throw Object.assign(new Error('Visual-only captures complete'),{visualOnly:true});
 }
 if(process.argv.includes('--layout-only')){
  await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.scene.setMotion(false)');
  const bundleURLs=await run('[...document.scripts].map(s=>s.src).concat([...document.querySelectorAll("link[rel=stylesheet]")].map(s=>s.href)).filter(Boolean)');
  const bundles=await Promise.all(bundleURLs.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,'Review application bundle '+url);return{url,sha256:digest(Buffer.from(await response.arrayBuffer()))};}));
  const layouts=[];
  for(const[width,height,id,name]of[[768,1024,'cuff','14-portrait-cuff-detail'],[768,1024,'tongue','15-portrait-tongue-detail'],[390,844,'cuff','16-mobile-cuff-detail']]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await settle();
   await run(`window.__onwardShowcase.selectPart('${id}')`);await finish();await pause(450);await shot(name);
   layouts.push(await run(`(()=>{const s=window.__onwardShowcase.scene,r=document.querySelector('[data-ui="focus"]').getBoundingClientRect(),c=document.querySelector('[data-ui="focus-close"]').getBoundingClientRect(),target=s.partPose('${id}',0).target.project(s.camera);return{width:innerWidth,height:innerHeight,part:'${id}',panel:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,bottomInset:innerHeight-r.bottom},close:{left:c.left,top:c.top,right:c.right,bottom:c.bottom},target:{x:(target.x*.5+.5)*innerWidth,y:(-.5*target.y+.5)*innerHeight},scrollWidth:document.documentElement.scrollWidth};})()`));
  }
  check('Final tablet portrait panels use the bottom layout with wide readable copy',layouts.filter(l=>l.width===768).every(l=>Math.abs(l.panel.left-l.width*.06)<2&&l.panel.width>l.width*.8&&l.panel.top>l.height*.4&&Math.abs(l.panel.bottomInset-106)<4),layouts.filter(l=>l.width===768));
  check('Narrow layouts preserve product focal centers above the detail panel',layouts.every(l=>l.target.y+18<l.panel.top),layouts.map(l=>({part:l.part,viewport:[l.width,l.height],target:l.target,panelTop:l.panel.top})));
  check('Close controls stay visible and no narrow viewport has horizontal document overflow',layouts.every(l=>l.scrollWidth<=l.width+1&&l.close.left>=0&&l.close.right<=l.width&&l.close.top>=l.panel.top&&l.close.bottom<=l.panel.bottom),layouts);
  check('Final portrait CSS has no JavaScript, shader or asset request failures',errors.length===0&&failedRequests.length===0&&badResponses.length===0,{errors,failedRequests,badResponses});
  await writeFile(out+'/final-layout-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,sources,bundles,functionalBaseline:'browser-validation.json',landscapeReview:'detail-review-validation.json',videoReport:'video-validation.json',revision:'Current responsive layout matches the camera aspect ratio <=1.12.',checks,layouts,errors,failedRequests,badResponses,environment:'Linux Chromium + SwiftShader and emulated touch viewports. NOT actual iPad Safari.'},null,2)+'\n');
  throw Object.assign(new Error('Visual-only captures complete'),{visualOnly:true});
 }
 const provenance=await run(`(()=>{const s=window.__onwardShowcase.scene,r=s.surfaceSamples,asset=s.asset;let sourceError=0,targetError=0;for(let i=0;i<r.references.length;i++){const ref=r.references[i],mesh=asset.getObjectByName(ref.mesh),attr=mesh.geometry.getAttribute('position'),p=[0,0,0];for(let k=0;k<3;k++)for(let a=0;a<3;a++)p[a]+=attr.array[ref.ids[k]*3+a]*ref.barycentric[k];for(let a=0;a<3;a++){sourceError=Math.max(sourceError,Math.abs(p[a]-ref.sourcePosition[a]));targetError=Math.max(targetError,Math.abs((p[a]-r.normalization.center[a])*r.normalization.scale-r.positions[i*3+a]));}}const source=new Set();for(let i=0;i<r.positions.length;i+=3)source.add([r.positions[i],r.positions[i+1],r.positions[i+2]].join(','));const actual=s.particles.points.geometry.getAttribute('position');let unrelatedTargets=0;for(let i=0;i<actual.count;i++)if(!source.has([actual.getX(i),actual.getY(i),actual.getZ(i)].join(',')))unrelatedTargets++;return{references:r.references.length,sourceError,targetError,sourceTriangleCount:r.sourceTriangleCount,sourceSamples:r.positions.length/3,gpuTargets:actual.count,unrelatedTargets};})()`);
 check('Actual particle targets are barycentric samples of the unchanged source shoe mesh',provenance.references>=100&&provenance.sourceError<1e-7&&provenance.targetError<5e-7&&provenance.unrelatedTargets===0&&provenance.gpuTargets>=2800,provenance);
 await run('window.__onwardShowcase.replayIntro();window.__onwardShowcase.seekIntro(.24)');await settle();await shot('01-particle-constellation');
 const arrival=await state();check('Replay shows a real GPU particle formation without changing product source geometry',arrival.introProgress<1&&arrival.particles.visible&&arrival.particles.activeCount>0&&arrival.particles.preRenderedMedia===false,arrival.particles);
 await run('window.__onwardShowcase.seekIntro(.64)');await settle();await shot('02-particle-shoe-arrival');
 await click('skip-intro');await settle();
 const skipped=await state();check('Skippable opening reaches clean real-time product state',skipped.introProgress===1&&!skipped.particles.visible&&await run('document.querySelector("#app, #immersive-showcase, .sgx-app").dataset.state==="ready"'),skipped);
 await shot('03-nightfall-hero');
 const actualRender=await run('(()=>{const s=window.__onwardShowcase.scene;let maps=0,visibleMeshes=0;s.asset.traverse(o=>{if(o.isMesh){visibleMeshes++;for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map)maps++;}});return{maps,visibleMeshes,frames:s.renderedFrames,drawCalls:s.renderer.info.render.calls,triangles:s.renderer.info.render.triangles,textures:s.renderer.info.memory.textures};})()');
 check('Product hold actually renders textured PBR mesh draws rather than video frames',actualRender.maps>=15&&actualRender.visibleMeshes>=25&&actualRender.frames>0&&actualRender.drawCalls>10&&actualRender.triangles>400000,actualRender);
 if(process.argv.includes('--detail-review')){
  await run('window.__onwardShowcase.replayIntro();window.__onwardShowcase.seekIntro(.78)');await settle();await shot('02-particle-shoe-arrival');
  await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.scene.setMotion(false)');
  const finalBundleURLs=await run('[...document.scripts].map(s=>s.src).concat([...document.querySelectorAll("link[rel=stylesheet]")].map(s=>s.href)).filter(Boolean)');
  const finalBundles=await Promise.all(finalBundleURLs.map(async url=>{const response=await fetch(url);assert.equal(response.status,200,'Review application bundle '+url);return{url,sha256:digest(Buffer.from(await response.arrayBuffer()))};}));
  await run('window.__onwardShowcase.setMotion(true)');
  const cameras=[];
  const detailNames={cuff:'04-cuff-material-closeup',tongue:'05-velvet-rhinestone-closeup',pattern:'10-printed-canvas-closeup',clasps:'09-dual-clasp-closeup',heel:'07-heel-pu-pattern-closeup',aglets:'08-metal-aglet-closeup',logo:'06-heel-logo-closeup'};
  for(const id of['cuff','tongue','pattern','clasps','heel','aglets','logo']){
   await run(`window.__onwardShowcase.selectPart('${id}')`);await finish();await shot(detailNames[id]);
   cameras.push(await run(`(()=>{const s=window.__onwardShowcase.scene,p=s.partPose('${id}',0);return{id:'${id}',position:s.camera.position.toArray(),target:s.controls.target.toArray(),expectedPosition:p.position.toArray(),expectedTarget:p.target.toArray(),moving:s.isTransitioning,progress:s.director.getState().progress,naturalCompletion:true};})()`));
   if(id==='cuff'){const c=cameras[0];check('Story-to-cuff camera naturally finishes despite scrollbar layout changes',!c.moving&&c.progress>=.999&&distance(c.position,c.expectedPosition)<1e-5&&distance(c.target,c.expectedTarget)<1e-5,c);}
  }
  check('Final composition reaches all seven exact finite part-camera poses',cameras.length===7&&cameras.every(c=>!c.moving&&c.position.every(Number.isFinite)&&distance(c.position,c.expectedPosition)<1e-5&&distance(c.target,c.expectedTarget)<1e-5),cameras);
  await run('window.__onwardShowcase.home()');await finish();
  await run('window.__onwardShowcase.selectPart("tongue")');
  await cdp('Emulation.setDeviceMetricsOverride',{width:768,height:1024,deviceScaleFactor:1,mobile:false});await finish();
  const resizedPose=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("tongue",0);return{position:s.camera.position.toArray(),target:s.controls.target.toArray(),expectedPosition:p.position.toArray(),expectedTarget:p.target.toArray(),progress:s.director.getState().progress,moving:s.isTransitioning};})()');
  check('Viewport resize during a real camera journey retargets and naturally completes',!resizedPose.moving&&resizedPose.progress>=.999&&distance(resizedPose.position,resizedPose.expectedPosition)<1e-5&&distance(resizedPose.target,resizedPose.expectedTarget)<1e-5,resizedPose);
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await finish();
  await run('window.__onwardShowcase.selectPart("heel");window.__onwardShowcase.selectPart("aglets");window.__onwardShowcase.selectPart("logo")');await finish();
  const finalNav=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("logo",0);return{part:s.focusPart,position:s.camera.position.toArray(),expectedPosition:p.position.toArray(),progress:s.director.getState().progress,moving:s.isTransitioning};})()');
  check('Rapid navigation naturally reaches the last requested part pose',finalNav.part==='logo'&&!finalNav.moving&&finalNav.progress>=.999&&distance(finalNav.position,finalNav.expectedPosition)<1e-5,finalNav);
  await run('window.__onwardShowcase.selectPart("tongue");window.__onwardShowcase.home()');await finish();
  check('Returning during a camera move naturally restores story ownership',(await state()).mode==='story'&&(await state()).focusPart===null&&!(await state()).isTransitioning,(await state()).camera);
  await run('window.__onwardShowcase.selectPart("cuff")');await finish();
  await run('window.__onwardShowcase.setUnfold(1)');await finish();await shot('11-cuff-structural-unfold');
  const unfoldedPose=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("cuff",1);return{unfold:s.unfold,position:s.camera.position.toArray(),expectedPosition:p.position.toArray(),moving:s.isTransitioning};})()');
  check('Cuff narrative naturally completes the open geometry and final camera',unfoldedPose.unfold>.999&&!unfoldedPose.moving&&distance(unfoldedPose.position,unfoldedPose.expectedPosition)<1e-5,unfoldedPose);
  await run('window.__onwardShowcase.setUnfold(0)');await finish();
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await finish();
  const cuffFocus=await run('(()=>{const s=window.__onwardShowcase.scene,p=s.partPose("cuff",0);return{distance:p.position.distanceTo(p.target),target:p.target.toArray(),offset:p.position.clone().sub(p.target).toArray()};})()');
  check('Refined closed cuff composition uses the closer detail camera',cuffFocus.distance<2.85,cuffFocus);
  await run('window.__onwardShowcase.setMotion(false)');
  const layouts=[];
  for(const[width,height,id,name]of[[768,1024,'cuff','14-portrait-cuff-detail'],[768,1024,'tongue','15-portrait-tongue-detail'],[1032,1376,'cuff','17-large-tablet-cuff-detail'],[390,844,'cuff','16-mobile-cuff-detail']]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await settle();await run(`window.__onwardShowcase.selectPart('${id}')`);await finish();await pause(450);await shot(name);
   layouts.push(await run(`(()=>{const s=window.__onwardShowcase.scene,r=document.querySelector('[data-ui="focus"]').getBoundingClientRect(),c=document.querySelector('[data-ui="focus-close"]').getBoundingClientRect(),t=s.partPose('${id}',0).target.project(s.camera);return{width:innerWidth,height:innerHeight,part:'${id}',panel:{left:r.left,top:r.top,bottom:r.bottom,width:r.width,bottomInset:innerHeight-r.bottom},close:{left:c.left,right:c.right,top:c.top,bottom:c.bottom},targetY:(-.5*t.y+.5)*innerHeight,scrollWidth:document.documentElement.scrollWidth};})()`));
  }
  check('Tablet portrait detail panels match the camera aspect layout including 1032px',layouts.filter(l=>l.width>=768).every(l=>Math.abs(l.panel.left-l.width*.06)<2&&l.panel.width>l.width*.8&&l.panel.top>l.height*.4&&Math.abs(l.panel.bottomInset-106)<4),layouts.filter(l=>l.width>=768));
  check('All narrow focal centers and close controls stay clear of the bottom panel',layouts.every(l=>l.targetY+18<l.panel.top&&l.scrollWidth<=l.width+1&&l.close.left>=0&&l.close.right<=l.width&&l.close.top>=l.panel.top&&l.close.bottom<=l.panel.bottom),layouts);
  check('Supplementary closeup views have no JavaScript or shader errors',errors.length===0,errors);
  const video=process.argv.includes('--video')?await recordVideo():undefined;
  check('Final rendered review contains no JavaScript or shader errors',errors.length===0,errors);
  await writeFile(out+'/detail-review-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,sources,finalBundles,layouts,completionMethod:'All functional camera assertions above wait for natural scene time; no seekTransition completion. The movie advances the unchanged Scene.loop using production APIs; no seek completion is used there either.',functionalBaselineBundle:'immersive-showcase-tlowneda.js',functionalBaseline:'browser-validation.json',checks,video,errors,failedRequests,badResponses,environment:'Linux Chromium / SwiftShader. 768×1024,1032×1376 and390×844 viewport + touch emulation, NOT real iPad/iPhone Safari.',scope:'Supplementary visual review at narrow portrait sizes; not a device-performance result.'},null,2)+'\n');
  throw Object.assign(new Error('Visual-only captures complete'),{visualOnly:true});
 }
 if(process.argv.includes('--visual-only')){
  await run('window.__onwardShowcase.scene.setMotion(false)');
  for(const[id,name]of[['cuff','04-cuff-material-closeup'],['tongue','05-velvet-rhinestone-closeup'],['heel','07-heel-pu-pattern-closeup'],['aglets','08-metal-aglet-closeup'],['clasps','09-dual-clasp-closeup'],['pattern','10-printed-canvas-closeup'],['logo','06-heel-logo-closeup']]){await run(`window.__onwardShowcase.selectPart('${id}')`);await finish();await shot(name);}
  await run('window.__onwardShowcase.selectPart("cuff")');await finish();await run('window.__onwardShowcase.seekUnfold(1)');await settle();await shot('11-cuff-structural-unfold');
  await writeFile(out+'/visual-boot-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,sources,checks,errors,failedRequests,badResponses,scope:'First visual boot and focus review only, not full interaction acceptance.',environment:'Linux Chromium / SwiftShader, not real iPad Safari.'},null,2)+'\n');
  await archivePreviousFailure();throw Object.assign(new Error('Visual-only captures complete'),{visualOnly:true});
 }

 await run('window.__onwardShowcase.scene.setMotion(false);window.__onwardShowcase.home()');await finish();
 const originalCamera=(await state()).camera.position;
 await cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x:80,y:160,deltaX:0,deltaY:700});await pause(450);await settle();
 const scrolled=await state(),scrollY=await run('window.scrollY');
 check('Actual desktop scrolling moves the three-dimensional camera through product chapters',scrollY>100&&distance(originalCamera,scrolled.camera.position)>.03,{scrollY,before:originalCamera,after:scrolled.camera.position});
 await run('window.scrollTo({top:0,left:0,behavior:"instant"});window.__onwardShowcase.scene.setScrollProgress(0);window.__onwardShowcase.home()');await finish();
 // Exercise replay from a detail/free state before the native story gesture.
 await run('window.__onwardShowcase.selectPart("cuff")');await finish();
 await run('window.__onwardShowcase.replayIntro();window.__onwardShowcase.skipIntro()');await settle();
 const replayInput=await run('(()=>{const s=window.__onwardShowcase.scene;return{mode:s.mode,focusPart:s.focusPart??null,zoom:s.controls.enableZoom,action:s.renderer.domElement.style.touchAction};})()');
 check('Replay from detail restores story touch ownership and leaves zoom for free inspection',replayInput.mode==='story'&&replayInput.focusPart===null&&replayInput.zoom===false&&replayInput.action==='pan-y',replayInput);
 const storyTouch=await run('(()=>{const r=window.__onwardShowcase.scene.renderer.domElement.getBoundingClientRect();return{x:r.x+r.width*.64,y:r.y+r.height*.65};})()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:storyTouch.x,y:storyTouch.y,id:21}]});
 for(let i=1;i<=6;i++){await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:storyTouch.x,y:storyTouch.y-i*35,id:21}]});await pause(30);}
 await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(400);
 const storyTouchState=await state(),storyTouchScroll=await run('window.scrollY');
 check('Story mode keeps native vertical touch scrolling available over the 3D canvas',storyTouchScroll>50&&storyTouchState.mode==='story'&&storyTouchState.focusPart===null,{scrollY:storyTouchScroll,mode:storyTouchState.mode,focusPart:storyTouchState.focusPart});
 await run('window.__onwardShowcase.setMode("free")');await settle();
 const freeCamera=(await state()).camera.position;await run('window.scrollBy(0,250)');await pause(200);
 check('Free observation releases camera ownership from page scrolling',(await state()).mode==='free'&&distance(freeCamera,(await state()).camera.position)<.005,{before:freeCamera,after:(await state()).camera.position});
 await run('window.scrollTo({top:0,left:0,behavior:"instant"});window.__onwardShowcase.scene.setScrollProgress(0);window.__onwardShowcase.home()');await finish();
 const pick=await run(`(()=>{const s=window.__onwardShowcase.scene,p=s.projectPart('cuff');for(const dx of[0,-12,12,-24,24,-36,36])for(const dy of[0,-12,12,-24,24]){const x=p.x+dx,y=p.y+dy;if(document.elementFromPoint(x,y)?.tagName==='CANVAS'&&[[0,0],[-6,0],[6,0],[0,-6],[0,6]].every(([a,b])=>s.pick(x+a,y+b)==='cuff'))return{x,y,interiorRadiusPixels:6};}return null;})()`);
 assert.ok(pick,'Visible cuff has a real source-mesh hit target');
 await tap(pick.x,pick.y);await waitFor('window.__onwardShowcase.getState().focusPart==="cuff"','real cuff raycast click');await finish();
 check('Actual finger tap on cuff geometry enters a part-focused camera state',(await state()).focusPart==='cuff',{tap:pick,camera:(await state()).camera});
 await shot('04-cuff-material-closeup');
 await run('window.__onwardShowcase.scene.setMotion(true)');
 const liveBefore=(await state()).camera.position;
 await run('window.__onwardShowcase.selectPart("tongue")');
 const liveAfter=(await state()).camera.position;
 check('Part transitions start from the live current camera instead of teleporting',distance(liveBefore,liveAfter)<.02,{before:liveBefore,immediateAfter:liveAfter});
 await finish();await shot('05-velvet-rhinestone-closeup');
 const focused=await state();check('Tongue detail holds its own scene and does not automatically advance',focused.focusPart==='tongue'&&!focused.isTransitioning,focused);await pause(350);assert.equal((await state()).focusPart,'tongue');
 await run('window.__onwardShowcase.selectPart("heel");window.__onwardShowcase.selectPart("aglets");window.__onwardShowcase.selectPart("logo")');await finish();
 check('Rapid part navigation gives the last request sole camera ownership',(await state()).focusPart==='logo'&&!(await state()).isTransitioning,(await state()).camera);
 await shot('06-heel-logo-closeup');
 await run('window.__onwardShowcase.selectPart("heel")');await finish();await shot('07-heel-pu-pattern-closeup');
 await run('window.__onwardShowcase.selectPart("aglets")');await finish();await shot('08-metal-aglet-closeup');
 await run('window.__onwardShowcase.selectPart("clasps")');await finish();await shot('09-dual-clasp-closeup');
 await run('window.__onwardShowcase.selectPart("pattern")');await finish();await shot('10-printed-canvas-closeup');
 await run('window.__onwardShowcase.selectPart("cuff")');await finish();
 const geometryIdentity=await run('(()=>{const s=window.__onwardShowcase.scene;return[...s.parts.get("cuff")].map(m=>({name:m.name,uuid:m.geometry.uuid,positions:Array.from(m.geometry.getAttribute("position").array)}));})()');
 await click('fold');await waitFor('window.__onwardShowcase.getState().unfold>.15','continuous cuff release');
 const intermediate=await state();check('Cuff expansion contains intermediate continuous geometry state',intermediate.unfold>.1&&intermediate.unfold<1,intermediate);await finish();
 const open=await state();check('Supported cuff deformation reaches a stable expanded state',open.focusPart==='cuff'&&open.unfold>.999&&!open.isTransitioning,open);await shot('11-cuff-structural-unfold');
 const unchanged=await run('(()=>{const s=window.__onwardShowcase.scene;return[...s.parts.get("cuff")].map(m=>({name:m.name,uuid:m.geometry.uuid,positions:Array.from(m.geometry.getAttribute("position").array)}));})()');
 check('Cuff expansion retains the same source geometry and GPU deformation identity',JSON.stringify(geometryIdentity)===JSON.stringify(unchanged),{meshes:geometryIdentity.length,unfold:open.unfold,method:'Existing continuous curvature field; not a substituted rectangle or video'});
 await run('window.__onwardShowcase.home()');await finish();check('Returning to the whole shoe restores the closed structure and scene state',(await state()).focusPart===null&&(await state()).unfold<1e-6,(await state()));
 await run('window.__onwardShowcase.setMode("free");window.__onwardShowcase.scene.setMotion(false)');await settle();
 const canvas=await run('(()=>{const r=window.__onwardShowcase.scene.renderer.domElement.getBoundingClientRect();return{x:r.x+r.width*.58,y:r.y+r.height*.53};})()');
 const orbitBefore=(await state()).camera.position;
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x,y:canvas.y,id:1}]});
 for(let i=1;i<=5;i++)await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x+i*15,y:canvas.y-i*4,id:1}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);
 const orbitAfter=(await state()).camera.position;
 check('Actual single-finger drag rotates the real product view without triggering a part',distance(orbitBefore,orbitAfter)>.03&&(await state()).focusPart===null,{before:orbitBefore,after:orbitAfter});
 const cameraDistance=s=>distance(s.camera.position,s.camera.target),zoomBefore=cameraDistance(await state());
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x-35,y:canvas.y,id:2},{x:canvas.x+35,y:canvas.y,id:3}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x-75,y:canvas.y,id:2},{x:canvas.x+75,y:canvas.y,id:3}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);
 check('Actual two-finger pinch zooms the product while preserving free mode',cameraDistance(await state())<zoomBefore&&(await state()).mode==='free',{before:zoomBefore,after:cameraDistance(await state())});await shot('12-free-product-inspection');
 const quality=[];
 for(const q of['high','balanced','low']){await run(`window.__onwardShowcase.setQuality('${q}')`);const s=await state();quality.push({quality:s.quality,count:s.particles.activeCount,pixelRatio:s.pixelRatio,drawCalls:s.drawCalls,triangles:s.triangles});}
 check('Quality levels reduce actual particle draw range and cap device sampling',quality.map(q=>q.count).join(',')==='9000,2800,1200'&&quality.every(q=>q.pixelRatio>0&&q.pixelRatio<=1.75)&&quality[2].pixelRatio<=quality[0].pixelRatio,quality);
 await run('window.__onwardShowcase.setQuality("balanced")');
 await cdp('Emulation.setDeviceMetricsOverride',{width:768,height:1024,deviceScaleFactor:1,mobile:false});await pause(150);await settle();
 check('Portrait touch viewport retains usable controls without horizontal document overflow',await run('document.documentElement.scrollWidth<=innerWidth+1'),{viewport:[768,1024],scrollWidth:await run('document.documentElement.scrollWidth')});await shot('13-portrait-touch-layout');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:1,mobile:false});await settle();
 await cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await waitFor('window.__onwardShowcase.getState().motion===false','reduced-motion preference');
 await run('window.__onwardShowcase.replayIntro()');await settle();const reduced=await state();
 check('Reduced-motion preference skips particle arrival and stops ornamental motion',reduced.motion===false&&reduced.introProgress===1&&!reduced.particles.visible,reduced.particles);
 const rotationBefore=await run('window.__onwardShowcase.scene.product.rotation.toArray()');await pause(500);const rotationAfter=await run('window.__onwardShowcase.scene.product.rotation.toArray()');assert.deepEqual(rotationAfter,rotationBefore);
 const honest=await run('(()=>{const t=document.querySelector("[data-ui=asset-note]").textContent,menu=document.querySelector("[data-ui=menu-dialog]").textContent;return{note:t,daytimePending:/DAYTIME/.test(menu)&&/尚未确定|暂不开放/.test(menu),hasCredit:menu.includes("CC BY 4.0"),hasEngineeringLink:!!document.querySelector("a[href*=onward-clasp-derivation]")};})()');
 check('Unconfirmed Daytime and later PU structure are not passed off as completed product states',honest.daytimePending&&honest.hasCredit&&honest.hasEngineeringLink&&/扣袢|研究|现有/.test(honest.note),honest);
 check('Clean experience has no uncaught JavaScript or shader errors',errors.length===0,errors);
 check('All model, texture and application GET requests loaded successfully',failedRequests.length===0&&badResponses.filter(r=>!r.url.endsWith('/favicon.ico')).length===0,{failedRequests,badResponses});
 const cleanErrors=[...errors],cleanFailed=[...failedRequests],cleanBad=[...badResponses],performance=await state();
 const video=process.argv.includes('--video')?await recordVideo():undefined;

 // Deliberate recovery probes happen after the clean-scene assertions and are
 // kept separate from performance / missing-resource evidence.
 await run('window.__onwardShowcase.scene.renderer.getContext().getExtension("WEBGL_lose_context").loseContext()');
 await waitFor('window.__onwardShowcase.getState().contextLost===true','WebGL loss state');
 check('Context loss offers an explicit recovery action instead of a false substitute product',await run('document.querySelector("[data-ui=retry]").hidden===false&&document.querySelector(".sgx-app").dataset.state==="error"'),null);
 await cdp('Network.setBlockedURLs',{urls:['*onward-ad-v1.glb*']});await cdp('Page.reload',{ignoreCache:true});
 await waitFor('Boolean(document.querySelector("[data-ui=retry]")&&!document.querySelector("[data-ui=retry]").hidden)','missing model error',60000);
 const missing=await state();check('Missing real model stops loading and exposes retry without fabricating a replacement',!missing.ready&&!!missing.loadingError,{ready:missing.ready,loadingError:missing.loadingError});
 await cdp('Network.setBlockedURLs',{urls:[]});await click('retry');await waitFor('window.__onwardShowcase?.getState().ready','retry loads the actual model',90000);
 check('Retry recovers the confirmed model with one live WebGL canvas',await run('document.querySelectorAll(".sgx-canvas canvas").length===1')&&(await state()).sourceModelSHA===sourceSpecs[1][1],{canvasCount:await run('document.querySelectorAll(".sgx-canvas canvas").length')});
 const result={testedAt:new Date().toISOString(),url,environment:'Linux Chromium headless + SwiftShader software WebGL and emulated touch. NOT physical iPad Safari.',sources,checks,performance,video,errors:cleanErrors,failedRequests:cleanFailed,badResponses:cleanBad,deliberateFailureEvents:{errors:errors.slice(cleanErrors.length),failedRequests:failedRequests.slice(cleanFailed.length),badResponses:badResponses.slice(cleanBad.length)},limitations:['Software WebGL timings are not physical iPad or production GPU performance.','The source has finite texture/macro detail and early cord clasps, not the later flat PU system.','Cuff expansion is a geometric display deformation, not cloth/contact simulation.']};
 await writeFile(out+'/browser-validation.json',JSON.stringify(result,null,2)+'\n');await archivePreviousFailure();
 console.log(JSON.stringify({passed:true,checks:checks.length,out,performance:{quality:performance.quality,drawCalls:performance.drawCalls,triangles:performance.triangles,pixelRatio:performance.pixelRatio}},null,2));
} catch(error){if(error.visualOnly){console.log('VISUAL CAPTURES COMPLETE');}else{await writeFile(out+'/browser-validation-failure.json',JSON.stringify({testedAt:new Date().toISOString(),url,error:String(error),checks,errors,failedRequests,badResponses},null,2)+'\n');throw error;}}
finally{socket?.close();chrome.kill('SIGTERM');}
