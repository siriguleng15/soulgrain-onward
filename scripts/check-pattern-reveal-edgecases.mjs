import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {openBrowser,pause,visibleTargets} from './lib/reveal-browser.mjs';
const url=process.argv[2]??'http://127.0.0.1:4740/pattern-reveal.html',legacy=process.argv[3]??'http://127.0.0.1:4741/immersive-showcase.html',out='public/pattern-reveal/verification';await mkdir(out,{recursive:true});
const checks=[],check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name);console.log('PASS',name);};
let b=await openBrowser(url);
try{
 const{run,wait,cdp,mouse}=b;await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false);window.__onwardShowcase.setMode("free")');await b.settled();
 const baseColor=await run('window.__onwardShowcase.reveal.uniforms.sgpBase.value.getHexString()');check('Actual linear PBR base color corresponds to source sRGB #0D2740',baseColor==='0d2740',baseColor);
 let targets=[];
 for(let attempt=0;attempt<3&&!targets.length;attempt++){
  await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:840,y:420});
  for(let i=1;i<=8;i++)await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:840-i*70,y:420});
  await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:280,y:420});await pause(300);await b.settled();
  targets=(await run(visibleTargets)).filter(p=>p.region==='inner');
 }
 check('Real mouse orbit exposes the opposite audited body surface',targets.length>0,{visibleInnerPoints:targets.length});
 const p=targets[Math.floor(targets.length/2)];await mouse(p.x,p.y);await wait('window.__onwardShowcase.getRevealState().valid&&window.__onwardShowcase.getRevealState().region==="inner"','opposite side hit');
 const opposite=await run('window.__onwardShowcase.getRevealState()');check('Opposite-side reveal blocks the original side despite shared UVs',opposite.targets.find(t=>t.region==='outer').gate===0,opposite);await b.shot(out+'/09-opposite-side-local.png');
 await run('window.__onwardShowcase.replayIntro()');await wait('window.__onwardShowcase.getState().introProgress===1','existing particle intro naturally finishes');
 check('Replay preserves arrival hand-off and original story input ownership',await run('window.__onwardShowcase.getState().mode==="story"&&window.__onwardShowcase.scene.renderer.domElement.style.touchAction==="pan-y"'),null);
 check('Mouse-orbit and replay edge cases have no shader or runtime errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();}
b=await openBrowser(url,{width:1180,height:820,touch:true});
try{
 const{run,wait,cdp}=b;await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false);window.__onwardShowcase.setMode("free")');await b.settled();
 const cold=await run('window.__onwardShowcase.getRevealState()');check('Cold tablet load starts fully printed without a reveal interaction',cold.touchFallback&&cold.allUniform===1&&cold.rayCount===0,cold);
 check('Cold touch devices skip the reveal acceleration build and its memory cost',cold.acceleratedMeshes===0&&cold.accelerationBuildMs===0,cold);
 const before=await run('window.__onwardShowcase.scene.camera.position.distanceTo(window.__onwardShowcase.scene.controls.target)');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:570,y:430,id:1},{x:650,y:430,id:2}]});
 for(let i=1;i<=5;i++)await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:570-i*12,y:430,id:1},{x:650+i*12,y:430,id:2}]});
 await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(250);
 const after=await run('window.__onwardShowcase.scene.camera.position.distanceTo(window.__onwardShowcase.scene.controls.target)');check('Actual two-finger pinch retains product zoom',after<before,{before,after});
 check('Touch fallback spends no CPU on reveal raycasts',await run('window.__onwardShowcase.getRevealState().rayCount===0'),null);
 check('Cold tablet has no shader or runtime errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();}
b=await openBrowser(legacy);
try{
 const{run,wait}=b;await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false)');await b.settled();
 const old=await run('(()=>{const s=window.__onwardShowcase.scene;let patched=0,printed=0;s.asset.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.sgpRevealRegion)patched++;if(m.name==="Body_Canvas"&&m.map)printed++;}});return{patched,printed,parts:s.parts.size,extraControl:!!document.querySelector("[data-reveal=all]")};})()');
 check('Original Nightfall entry stays fully printed with no reveal controller',old.patched===0&&old.printed>0&&!old.extraControl&&old.parts===7,old);
 await run('window.__onwardShowcase.selectPart("cuff")');await wait('!window.__onwardShowcase.getState().isTransitioning','legacy cuff camera');await run('window.__onwardShowcase.setUnfold(1)');await wait('window.__onwardShowcase.getState().unfold>.999&&!window.__onwardShowcase.getState().isTransitioning','legacy cuff unfold');
 check('Shared scene hook leaves original cuff animation functional',await run('window.__onwardShowcase.getState().unfold===1'),null);
 check('Original entry has no shader or runtime errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();}
await writeFile(out+'/compatibility-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,legacy,checks,environment:'Linux Chromium / SwiftShader. Real CDP mouse/touch events, not physical iPad Safari.'},null,2)+'\n');
console.log(JSON.stringify({passed:true,checks:checks.length}));
