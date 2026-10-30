import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile,copyFile,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {openBrowser,pause,visibleTargets} from './lib/reveal-browser.mjs';
const url=process.argv.find(x=>x.startsWith('http'))??'http://127.0.0.1:4740/pattern-reveal.html';
const out=process.env.REVEAL_PROOF_DIR??'public/pattern-reveal/verification';await mkdir(out,{recursive:true});
const checks=[],check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name+' '+JSON.stringify(detail));console.log('PASS',name);};
const digest=b=>createHash('sha256').update(b).digest('hex');
check('Original GLB and original print remain unchanged',digest(await readFile('public/assets/onward-ad-v1/onward-ad-v1.glb'))==='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'&&digest(await readFile('modeling/finished-shoe-v8/references/02-body-print.jpg'))==='8d4e2348bc93c09a2fa16b1178fff32f7e4dbba490073d5c7e8e439104952d90',null);
const b=await openBrowser(url);
try{
 const {run,wait,shot,mouse,cdp}=b;
 await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false)');await b.settled();
 const state=()=>run('window.__onwardShowcase.getRevealState()');
 const initial=await state();check('Desktop starts with clean navy body and exactly three audited targets',initial.mode==='explore'&&initial.allUniform===0&&initial.targetCount===3,initial);
 const provenance=await run('(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal;return{source:s.getState().sourceModelSHA,patched:r.bindings.map(b=>({owner:b.mesh.parent?.name,material:b.material.name,normal:b.material.normalMap?.name,roughness:b.material.roughness,metalness:b.material.metalness,transparent:b.material.transparent,depthWrite:b.material.depthWrite,hasMap:!!b.material.map,arrivalKey:b.material.customProgramCacheKey()})),drawCalls:s.renderer.info.render.calls,triangles:s.renderer.info.render.triangles,programs:s.renderer.info.programs.length};})()');
 check('Reveal preserves original PBR, weave normals and the arrival shader chain',provenance.patched.every(p=>p.normal==='SG_Validated_Tangent_Weave'&&p.hasMap&&!p.transparent&&p.depthWrite&&Math.abs(p.roughness-.7)<1e-5&&p.metalness===0&&p.arrivalKey.includes('immersive-arrival')&&p.arrivalKey.includes('pattern-window')),provenance);
 const bytes=await readFile('public/assets/onward-ad-v1/onward-ad-v1.glb'),jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength)),binStart=28+jsonLength;
 const rawHash=id=>{const a=gltf.accessors[id],v=gltf.bufferViews[a.bufferView],size=({5121:1,5123:2,5125:4,5126:4})[a.componentType],dim=({SCALAR:1,VEC2:2,VEC3:3,VEC4:4})[a.type];assert.ok(!v.byteStride||v.byteStride===size*dim);const start=binStart+(v.byteOffset??0)+(a.byteOffset??0);return digest(bytes.subarray(start,start+a.count*dim*size));};
 const expected=[];for(const n of gltf.nodes.filter(n=>['Shoe_Body','Original_Vamp'].includes(n.name)))for(const p of gltf.meshes[n.mesh].primitives){const material=gltf.materials[p.material].name;if(!['Body_Canvas','Body_Inner_Canvas'].includes(material))continue;expected.push({owner:n.name,material,position:rawHash(p.attributes.POSITION),uv:rawHash(p.attributes.TEXCOORD_0),index:rawHash(p.indices)});}
 const runtime=await run('(async()=>{const hash=async a=>{const b=a.array;return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new Uint8Array(b.buffer,b.byteOffset,b.byteLength))),x=>x.toString(16).padStart(2,"0")).join("");};return Promise.all(window.__onwardShowcase.reveal.bindings.map(async b=>({material:b.material.name,position:await hash(b.mesh.geometry.getAttribute("position")),uv:await hash(b.mesh.geometry.getAttribute("uv")),index:await hash(b.mesh.geometry.index),indirect:b.mesh.geometry.boundsTree.indirect})));})()');
 check('Indirect ray acceleration preserves exact source positions, UVs and triangle indices',runtime.length===3&&runtime.every(r=>r.indirect&&expected.some(e=>e.material===r.material&&e.position===r.position&&e.uv===r.uv&&e.index===r.index)),runtime);
 await shot(out+'/01-default-navy.png');
 let candidates=await run(visibleTargets);check('Surface coordinates come from ray-verified real target geometry',candidates.length>5,{candidates:candidates.length});
 candidates.sort((a,b)=>Math.hypot(a.x-960,a.y-620)-Math.hypot(b.x-960,b.y-620));const point=candidates[0];
 await mouse(point.x,point.y);await wait('window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().opacity>.98','local reveal');
 await shot(out+'/02-cursor-local.png');
 const local=await state();check('Mouse reveals a feathered local window at the actual body hit',local.valid&&local.radius>70&&local.region&&Math.hypot(local.center[0]-point.x,local.center[1]-point.y)<2,local);
 const compileBefore=await run('window.__onwardShowcase.reveal.bindings.map(b=>b.compiles)');
 const priorFrame=await run('window.__onwardShowcase.scene.renderedFrames');
 await mouse(point.x+35,point.y+4);await wait(`window.__onwardShowcase.scene.renderedFrames>${priorFrame}`,'mouse movement displayed');const moving=await state();await wait('(()=>{const s=window.__onwardShowcase.getRevealState();return Math.hypot(s.center[0]-s.pointer[0],s.center[1]-s.pointer[1])<2;})()','inertia converges');const following=await state();
 check('Cursor smoothing stays bounded and converges without a delayed jump',Math.hypot(moving.center[0]-moving.pointer[0],moving.center[1]-moving.pointer[1])<=14.1&&Math.hypot(following.center[0]-following.pointer[0],following.center[1]-following.pointer[1])<2,{moving:moving.center,pointer:moving.pointer,following:following.center});
 await run('(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal;window.__leaveSamples=[];window.__priorFrame=s.events.onFrame;s.events.onFrame=()=>{window.__priorFrame?.();window.__leaveSamples.push({opacity:r.uniforms.sgpOpacity.value,radius:r.uniforms.sgpRadius.value});};})()');
 await mouse(50,50);await wait('window.__onwardShowcase.getRevealState().opacity<.002','window fades');
 const fadeSamples=await run('(()=>{window.__onwardShowcase.scene.events.onFrame=window.__priorFrame;return window.__leaveSamples;})()');
 check('Leaving the shoe shrinks and fades back to plain fabric',fadeSamples.some(s=>s.opacity>0&&s.opacity<.99)&&(await state()).radius<1,{samples:fadeSamples,final:await state()});
 await run('document.querySelector("[data-reveal=all]").click()');await wait('window.__onwardShowcase.getRevealState().allUniform===1','unveil all');await shot(out+'/03-unveil-all.png');
 check('UNVEIL ALL restores original print without replacing geometry',(await state()).mode==='all'&&await run('document.querySelector("[data-reveal=all]").getAttribute("aria-pressed")==="true"'),await state());
 await run('document.querySelector("[data-reveal=all]").click()');await wait('window.__onwardShowcase.getRevealState().allUniform===0','restore exploration');
 check('Repeated toggling returns to exploration',(await state()).mode==='explore',null);
 check('Pointer motion and toggling do not recompile materials',JSON.stringify(compileBefore)===JSON.stringify(await run('window.__onwardShowcase.reveal.bindings.map(b=>b.compiles)')),compileBefore);
 if(!process.argv.includes('--quick')){
  await mouse(point.x,point.y);await wait('window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().opacity>.98','region gate');
  const gated=await state();check('Local reveal does not copy through overlapping UVs onto the opposite side',gated.region==='outer'&&gated.targets.find(t=>t.region==='inner').gate===0,gated.targets);
  const occluder=await run('(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal,p=s.projectPart("clasps");for(let x=p.x-80;x<p.x+80;x+=7)for(let y=p.y-90;y<p.y+90;y+=7){if(document.elementFromPoint(x,y)!==s.renderer.domElement)continue;const h=r.probe(x,y);if(h&&!h.eligible&&/Clasp|Eyelet|Lace/.test(h.object+" "+h.material))return{x,y,hit:h};}return null;})()');
  check('Full-shoe ray includes real foreground hardware and laces',!!occluder,occluder);
  await mouse(occluder.x,occluder.y);await wait('!window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().opacity<.002','occlusion fade');
  check('Foreground hardware blocks activation on the body behind it',!(await state()).valid,await state());
  await mouse(point.x,point.y);await wait('window.__onwardShowcase.getRevealState().valid','motion test hit');
  const stationary=await state();await run('window.__onwardShowcase.setMotion(true)');await wait(`window.__onwardShowcase.getRevealState().rayCount>${stationary.rayCount+3}`,'stationary mouse updated');
  const animated=await state();check('Stationary pointer is revalidated while the model moves',animated.pointerEvents===stationary.pointerEvents&&animated.rayCount>stationary.rayCount&&JSON.stringify(animated.hitPoint)!==JSON.stringify(stationary.hitPoint),{before:stationary.hitPoint,after:animated.hitPoint,rayTimes:animated.rayTiming});
  await run('window.__onwardShowcase.setMotion(false)');await mouse(40,200);
  // All seven original part journeys complete naturally; no seek-based completion.
  for(const id of['tongue','clasps','heel','aglets','logo','pattern','cuff']){
   await run(`window.__onwardShowcase.selectPart('${id}')`);await wait('!window.__onwardShowcase.getState().isTransitioning','natural '+id);
   const pose=await run(`(()=>{const s=window.__onwardShowcase.scene,p=s.partPose('${id}',0);return{focus:s.focusPart,error:s.camera.position.distanceTo(p.position)};})()`);
   check('Original detail remains available: '+id,pose.focus===id&&pose.error<1e-5,pose);
  }
  await run('window.__onwardShowcase.selectPart("pattern")');await wait('!window.__onwardShowcase.getState().isTransitioning','clean fabric macro');await shot(out+'/07-clean-fabric-detail.png');
  await run('window.__onwardShowcase.setAll(true)');await wait('window.__onwardShowcase.getRevealState().allUniform===1','macro full print');await shot(out+'/08-original-print-detail.png');await run('window.__onwardShowcase.setAll(false)');
  await run('window.__onwardShowcase.selectPart("cuff")');await wait('!window.__onwardShowcase.getState().isTransitioning','cuff returns');
  await run('window.__onwardShowcase.setUnfold(1)');await wait('window.__onwardShowcase.getState().unfold>.999&&!window.__onwardShowcase.getState().isTransitioning','cuff opens');
  check('Reveal pauses during the original GPU cuff expansion',(await state()).pauseReason==='cuff-unfolded'&&!(await state()).valid,await state());await shot(out+'/04-cuff-preserved.png');
  await run('window.__onwardShowcase.home()');await wait('!window.__onwardShowcase.getState().isTransitioning','home');
  await run('window.__onwardShowcase.setQuality("balanced")');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1180,height:820,deviceScaleFactor:2,mobile:true});await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await wait('window.__onwardShowcase.getRevealState().touchFallback&&window.__onwardShowcase.getRevealState().allUniform===1','touch full pattern');
  await shot(out+'/05-ipad-full-pattern.png');check('Tablet defaults to full print and preserves one live canvas',(await state()).mode==='touch-full'&&await run('document.querySelectorAll(".sgx-canvas canvas").length===1'),await state());
  const cam=await run('window.__onwardShowcase.setMode("free");window.__onwardShowcase.scene.camera.position.toArray()');
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:700,y:430,id:1}]});
  for(let i=1;i<=6;i++)await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:700+i*15,y:430-i*4,id:1}]});
  await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(200);
  const after=await run('window.__onwardShowcase.scene.camera.position.toArray()');check('Touch rotation remains owned by OrbitControls',Math.hypot(...after.map((n,i)=>n-cam[i]))>.02,{before:cam,after});
  await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});await b.settled();await shot(out+'/06-phone-full-pattern.png');
  check('Phone layout and full-pattern fallback stay usable',await run('document.documentElement.scrollWidth<=innerWidth+1')&&(await state()).allUniform===1,null);
  const pixelMapping=await run('(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.getRevealState();return{css:r.css,buffer:r.buffer,pixelRatio:s.renderer.getPixelRatio(),devicePixelRatio};})()');
  check('Shader uses capped drawing-buffer pixels rather than raw device pixel ratio',Math.abs(pixelMapping.buffer[0]-Math.floor(pixelMapping.css[0]*pixelMapping.pixelRatio))<=1&&Math.abs(pixelMapping.buffer[1]-Math.floor(pixelMapping.css[1]*pixelMapping.pixelRatio))<=1&&pixelMapping.pixelRatio<pixelMapping.devicePixelRatio,pixelMapping);
 }
 check('No application, shader or resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
 const report={testedAt:new Date().toISOString(),url,environment:'Linux Chromium / SwiftShader; viewport and touch emulation, NOT physical iPad Safari.',checks,point,performance:await state(),bundleURLs:await run('[...document.scripts].map(s=>s.src)'),limitations:['Software rendering timings are not target-device GPU performance.','Lithos reference was blocked by proxy CONNECT403.']};
 await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length,out}));
 try{await copyFile(out+'/failure.json','/tmp/onward-reveal-initial-harness-failure.json');await unlink(out+'/failure.json');}catch(e){if(e.code!=='ENOENT')throw e;}
}catch(e){await writeFile(out+'/failure.json',JSON.stringify({error:String(e),checks,errors:b.errors,requests:b.requests},null,2));throw e;}finally{b.close();}
