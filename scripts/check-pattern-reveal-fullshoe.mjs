import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {openBrowser,pause,visibleTargets} from './lib/reveal-browser.mjs';
const url=process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4742/pattern-reveal.html',quick=process.argv.includes('--quick');
const out=process.env.REVEAL_PROOF_DIR??'public/pattern-reveal-fullshoe/verification';await mkdir(out,{recursive:true});
const checks=[],check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name+' '+JSON.stringify(detail));console.log('PASS',name);};
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=await readFile('public/assets/onward-ad-v1/onward-ad-v1.glb'),length=bytes.readUInt32LE(12),g=JSON.parse(bytes.subarray(20,20+length)),bin=28+length;
const accessor=id=>{const a=g.accessors[id],v=g.bufferViews[a.bufferView],size=({5121:1,5123:2,5125:4,5126:4})[a.componentType]*({SCALAR:1,VEC2:2,VEC3:3,VEC4:4})[a.type];assert.ok(!v.byteStride||v.byteStride===size);const start=bin+(v.byteOffset??0)+(a.byteOffset??0);return hash(bytes.subarray(start,start+a.count*size));};
const expected=g.meshes.flatMap(m=>m.primitives.map(p=>({material:g.materials[p.material].name,position:accessor(p.attributes.POSITION),uv:accessor(p.attributes.TEXCOORD_0),index:accessor(p.indices)})));
check('Original GLB and ALL embedded artwork remain byte-identical',hash(bytes)==='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4',{bytes:bytes.length,embeddedImages:g.images.length});

// Compare actual PNG pixels, independently of the material/controller state.
const pixels=(plain,all,local,points)=>{
 const code=`import sys,json\nfrom PIL import Image\nimport numpy as np\nd=json.load(sys.stdin)\na=np.array(Image.open(d['plain']).convert('RGB')).astype(float);b=np.array(Image.open(d['all']).convert('RGB')).astype(float)\nscored=[]\nfor p in d['points']:\n x,y=round(p['x']),round(p['y']);box=(slice(max(0,y-2),y+3),slice(max(0,x-2),x+3));score=float(np.abs(a[box]-b[box]).mean());scored.append((score,p))\nscore,p=max(scored,key=lambda x:x[0]);result={'score':score,'point':p}\nif d['local']:\n c=np.array(Image.open(d['local']).convert('RGB')).astype(float);x,y=round(p['x']),round(p['y']);box=(slice(y-2,y+3),slice(x-2,x+3));result['localError']=float(np.abs(c[box]-b[box]).mean());result['outsideChanges']=int(((np.abs(c-a).mean(2)>4)&(((np.indices(a.shape[:2])[1]-x)**2+(np.indices(a.shape[:2])[0]-y)**2)>145**2)).sum())\nprint(json.dumps(result))`;
 const r=spawnSync('python3',['-c',code],{input:JSON.stringify({plain,all,local,points}),encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
};
let b;
try{
 b=await openBrowser(url,{width:1280,height:900,port:Number(process.env.REVEAL_TEST_PORT??9583)});const{run,wait,mouse,shot,cdp}=b,state=()=>run('window.__onwardShowcase.getRevealState()');
 await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false);window.__onwardShowcase.setQuality("balanced")');await b.settled();
 const initial=await state();
 check('Desktop conceals artwork across the WHOLE shoe, not just the body',initial.mode==='explore'&&initial.allUniform===0&&initial.targetCount===17&&initial.mappedPrimitives===16&&['cuff','tongue','border','heel','logo','aglets','clasps','rhinestones','shaft','outer','inner','vamp'].every(r=>initial.targets.some(t=>t.region===r)),initial);
 const data=await run('(async()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal;const digest=async a=>{const b=a.array;return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new Uint8Array(b.buffer,b.byteOffset,b.byteLength))),n=>n.toString(16).padStart(2,"0")).join("");};let meshes=[];s.asset.traverse(o=>{if(o.isMesh)meshes.push(o);});return{buffers:await Promise.all(meshes.map(async m=>({material:(Array.isArray(m.material)?m.material[0]:m.material).name,position:await digest(m.geometry.getAttribute("position")),uv:await digest(m.geometry.getAttribute("uv")),index:await digest(m.geometry.index),indirect:m.geometry.boundsTree.indirect}))),materials:r.bindings.map(b=>({name:b.material.name,hasMap:!!b.material.map,arrival:b.material.customProgramCacheKey().includes("immersive-arrival"),normal:b.material.normalMap?.name,roughness:b.material.roughness,metalness:b.material.metalness,opaque:!b.material.transparent&&b.material.depthWrite,customDepth:!!b.mesh.customDepthMaterial})),calls:s.renderer.info.render.calls,programs:s.renderer.info.programs.length};})()');
 check('All 42 mesh position/UV/index buffers retain exact source identities',data.buffers.length===42&&data.buffers.every(r=>r.indirect&&expected.some(e=>e.material===r.material&&e.position===r.position&&e.uv===r.uv&&e.index===r.index)),{meshes:data.buffers.length});
 check('Original PBR, weave, arrival/focus and GPU-cuff shader chains remain composed',data.materials.every(m=>m.arrival&&m.opaque&&(m.name==='Rhinestone_Silver'||m.hasMap))&&data.materials.filter(m=>/Canvas|Heel_Strip/.test(m.name)).every(m=>m.normal==='SG_Validated_Tangent_Weave'),data.materials);
 check('Raised rhinestone artwork has matching masked SHADOW coverage',data.materials.some(m=>m.name==='Rhinestone_Silver'&&m.customDepth),null);
 await shot(out+'/01-default-whole-shoe.png');
 const focus=async(id)=>{await mouse(30,180);await run('window.__onwardShowcase.setAll(false);window.__onwardShowcase.setMotion(true)');await run(`window.__onwardShowcase.selectPart('${id}')`);await wait('!window.__onwardShowcase.getState().isTransitioning','natural '+id);await run('window.__onwardShowcase.setMotion(false)');await pause(450);await b.settled();};
 // Each target is verified from its real projected triangles, then compared in
 // three actual rendered states, including a real mouse-driven local window.
 const explore=async(id,regions,prefix)=>{
  if(id)await focus(id);await mouse(30,180);await run('window.__onwardShowcase.setAll(false)');await wait('window.__onwardShowcase.getRevealState().allUniform===0&&window.__onwardShowcase.getRevealState().opacity<.002','plain');
  await shot(out+'/'+prefix+'-plain.png');
  const points=(await run(visibleTargets)).filter(p=>regions.includes(p.region));check(id+' has genuine visible artwork hit coordinates',points.length>0,{points:points.length});
  await run('document.querySelector("[data-reveal=all]").click()');await wait('window.__onwardShowcase.getRevealState().allUniform===1','all');await shot(out+'/'+prefix+'-all.png');
  const measured=pixels(out+'/'+prefix+'-plain.png',out+'/'+prefix+'-all.png',null,points),p=measured.point;
  check(id+' actually conceals/restores its source artwork in rendered pixels',measured.score>3,measured);
  await run('document.querySelector("[data-reveal=all]").click()');await wait('window.__onwardShowcase.getRevealState().allUniform===0','explore');await mouse(p.x,p.y);await wait('window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().opacity>.998','hover '+id);await shot(out+'/'+prefix+'-local.png');
  const local=pixels(out+'/'+prefix+'-plain.png',out+'/'+prefix+'-all.png',out+'/'+prefix+'-local.png',[p]);
  check(id+' local mouse window restores the original print at its center',local.localError<Math.max(8,local.score*.3),{...local,state:await state()});
  check(id+' reveal remains local instead of leaking through shared UVs',local.outsideChanges<5000,{outsideChangedPixels:local.outsideChanges});
  return p;
 };
 const root=await explore(null,['outer','vamp'],'02-body');
 await shot(out+'/02-cursor-whole-shoe.png');await run('window.__onwardShowcase.setAll(true)');await wait('window.__onwardShowcase.getRevealState().allUniform===1','full');await shot(out+'/03-unveil-whole-shoe.png');
 await run('window.__onwardShowcase.setAll(false)');await wait('window.__onwardShowcase.getRevealState().allUniform===0','reset');
 const cuffPoints=(await run(visibleTargets)).filter(p=>p.region==='cuff');const cuffPoint=cuffPoints.sort((a,b)=>Math.hypot(a.x-1100,a.y-420)-Math.hypot(b.x-1100,b.y-420))[0];
 check('Whole view exposes real cuff coordinates for the expanded effect',!!cuffPoint,{points:cuffPoints.length});await mouse(cuffPoint.x,cuffPoint.y);await wait('window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().opacity>.998','whole-shoe cuff window');await shot(out+'/02-cursor-whole-shoe.png');
 const compiles=(await state()).targets.map(t=>t.compiles);
 for(let i=0;i<5;i++){await mouse(root.x+i*5,root.y+i*2);await b.settled();}
 await wait('(()=>{const s=window.__onwardShowcase.getRevealState();return Math.hypot(s.center[0]-s.pointer[0],s.center[1]-s.pointer[1])<2;})()','inertia');const follow=await state();
 check('Cursor inertia remains bounded and all 17 materials stay compiled',Math.hypot(follow.center[0]-follow.pointer[0],follow.center[1]-follow.pointer[1])<2&&JSON.stringify(compiles)===JSON.stringify(follow.targets.map(t=>t.compiles)),{compiles,rayTiming:follow.rayTiming});
 await mouse(30,180);await wait('window.__onwardShowcase.getRevealState().opacity<.002','exit');check('Leaving the shoe returns the entire visible surface to the clean state',(await state()).radius<1,await state());
 if(!quick){
  await explore('cuff',['cuff','border'],'04-cuff');
  await explore('tongue',['rhinestones'],'05-tongue');
  await explore('clasps',['clasps'],'06-clasps');
  await explore('aglets',['aglets'],'07-aglets');
  await explore('heel',['heel'],'08-heel');
  await explore('logo',['logo'],'09-logo');
  // Confirm continuous ownership across neighboring surfaces without the V1
  // body-only gate. Every source mesh can activate the same single window.
  await focus('pattern');
  const hardware=await run('(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal;for(let y=200;y<innerHeight-170;y+=12)for(let x=450;x<innerWidth-60;x+=12){if(document.elementFromPoint(x,y)!==s.renderer.domElement)continue;const p=r.probe(x,y);if(p&&/Eyelets|Laces/.test(p.material))return{x,y,hit:p};}return null;})()');
  check('Whole-shoe picking includes real foreground hardware',!!hardware,hardware);await mouse(hardware.x,hardware.y);await wait('window.__onwardShowcase.getRevealState().valid','hardware window');
  check('Window continues across hardware instead of dropping at the old body-only boundary',(await state()).region==='surface',await state());
  await focus('cuff');await run('window.__onwardShowcase.setMotion(true);window.__onwardShowcase.setUnfold(1)');await wait('window.__onwardShowcase.getState().unfold>.999&&!window.__onwardShowcase.getState().isTransitioning','GPU cuff unfolds');
  await shot(out+'/10-cuff-unfolded.png');check('GPU cuff retains its continuous deformation while local picking is paused',(await state()).pauseReason==='cuff-unfolded',await state());
  await run('window.__onwardShowcase.setAll(true)');await wait('window.__onwardShowcase.getRevealState().allUniform===1','unfolded full');check('UNVEIL ALL works on the unfolded cuff without losing its source map',(await state()).allUniform===1,null);
  await run('window.__onwardShowcase.setUnfold(0)');await wait('window.__onwardShowcase.getState().unfold<.001&&!window.__onwardShowcase.getState().isTransitioning','refold');
  await run('window.__onwardShowcase.replayIntro()');await wait('window.__onwardShowcase.getState().introProgress===1','original particle arrival');check('Existing particle opening and all seven detail journeys remain usable',await run('window.__onwardShowcase.scene.parts.size===7&&window.__onwardShowcase.getState().mode==="story"'),null);
 }
 check('Desktop has no shader, JavaScript or asset-load errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});b.close();b=undefined;
 if(!quick){
  b=await openBrowser(url,{width:1180,height:820,touch:true,port:9584});const{run,wait,cdp}=b;
  await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false);window.__onwardShowcase.setMode("free")');await b.settled();const cold=await run('window.__onwardShowcase.getRevealState()');
  check('iPad-size cold start shows ALL artwork including the raised medallion',cold.touchFallback&&cold.allUniform===1&&cold.targetCount===17,cold);
  check('Touch devices still skip reveal raycasts and BVH allocations',cold.rayCount===0&&cold.acceleratedMeshes===0,cold);
  await b.shot(out+'/11-ipad-full-pattern.png');
  const start=await run('window.__onwardShowcase.scene.camera.position.toArray()');
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:700,y:430,id:1}]});for(let i=1;i<=5;i++)await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:700-i*28,y:430+i*7,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(350);
  const end=await run('window.__onwardShowcase.scene.camera.position.toArray()');check('Single-finger touch still rotates the real shoe',Math.hypot(...end.map((v,i)=>v-start[i]))>.05,{start,end});
  const distance=()=>run('window.__onwardShowcase.scene.camera.position.distanceTo(window.__onwardShowcase.scene.controls.target)');const before=await distance();
  await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:570,y:430,id:1},{x:650,y:430,id:2}]});for(let i=1;i<=5;i++)await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:570-i*12,y:430,id:1},{x:650+i*12,y:430,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);const after=await distance();check('Two-finger pinch remains available',after<before,{before,after});
  check('Touch interaction has no errors or reveal ray work',b.errors.length===0&&b.requests.length===0&&await run('window.__onwardShowcase.getRevealState().rayCount===0'),{errors:b.errors,requests:b.requests});b.close();b=undefined;
  b=await openBrowser(url,{width:390,height:844,touch:true,port:9585});await b.run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false)');await b.settled();await b.shot(out+'/12-phone-full-pattern.png');check('Phone layout retains full-pattern fallback without horizontal overflow',await b.run('window.__onwardShowcase.getRevealState().allUniform===1&&document.documentElement.scrollWidth<=innerWidth+1'),null);check('Phone rendering has no errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
 }
}finally{
 b?.close();await writeFile(out+'/fullshoe-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,checks,environment:'Linux Chromium / SwiftShader, CDP desktop mouse and touch emulation; not a physical iPad or Safari. PNG differences measure actual rendered output, not shader-uniform assertions alone.'},null,2)+'\n');
}
console.log(JSON.stringify({passed:true,checks:checks.length,out}));
