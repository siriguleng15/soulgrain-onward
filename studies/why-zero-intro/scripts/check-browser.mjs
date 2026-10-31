import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {browser,pause} from './browser.mjs';
const url=process.argv.find(x=>x.startsWith('http'))??'http://127.0.0.1:4760/',touch=process.argv.includes('--touch'),portrait=process.argv.includes('--phone'),out=process.env.PROOF_DIR??'public/verification/'+(portrait?'phone':touch?'tablet':'desktop');await mkdir(out,{recursive:true});
const checks=[],check=(name,pass,detail)=>{checks.push({name,passed:!!pass,detail});assert.ok(pass,name+' '+JSON.stringify(detail));console.log('PASS',name);};
const width=portrait?390:touch?1024:1280,height=portrait?844:touch?768:800,b=await browser(url,{width,height,touch});
try{
 const{run,wait,shot,cdp}=b,state=()=>run('window.__frostDemo.getState()');
 await shot(out+'/01-initial.png');
 await wait('window.__frostDemo.getState().phase==="guide"','countdown and shattering finish naturally');
 check('Count and shattering advance to guide without forced state injection',(await state()).history.some(x=>x.phase==='countdown')&&(await state()).history.some(x=>x.phase==='shattering'),(await state()).history);
 await wait('window.__frostDemo.getState().hand.ready||window.__frostDemo.getState().hand.error','licensed hand');check('Real skinned hand loads from the local licensed asset',(await state()).hand.ready,(await state()).hand);
 await wait('window.__frostDemo.getState().hand.opacity>.9','guide hand fades in');await shot(out+'/02-frost-hand.png');
 const start=async(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]}):cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
 const move=async(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]}):cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'left',buttons:1});
 const end=async(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}):cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1});
 const center={x:width*.5,y:height*.44},rx=Math.min(width*.25,height*.20),ry=rx*1.12;
 // First demonstrate that a line really melts the material but cannot unlock.
 await start(center.x-rx,center.y);for(let i=1;i<=20;i++)await move(center.x-rx+2*rx*i/20,center.y+Math.sin(i*.3)*3);await shot(out+'/03-melt-groove.png');await end(center.x+rx,center.y);
 await wait('window.__frostDemo.getState().phase==="guide"','invalid stroke feedback');const invalid=await state();check('An actual line gesture is rejected',invalid.gesture&&!invalid.gesture.valid,invalid.gesture);
 await run('window.__frostDemo.onFrame=()=>{const s=window.__frostDemo,d=s.getState();if(d.values.melt>.12){cancelAnimationFrame(s.frame);window.__meltFrame=d;s.onFrame=undefined;}}');
 const draw=async()=>{await start(center.x+rx,center.y);for(let i=1;i<=100;i++){const a=i/100*Math.PI*2;await move(center.x+Math.cos(a)*rx,center.y+Math.sin(a)*ry);if(i===70)await shot(out+'/04-drawn-zero.png');}await end(center.x+rx,center.y);};
 await draw();const valid=await state();check('A real '+(touch?'finger':'mouse')+' zero passes geometry validation',valid.gesture?.valid,valid.gesture);check('Success enters the thaw instead of replacing the page',valid.phase==='melting'||valid.phase==='transition'||valid.phase==='done',valid.phase);
 await wait('!!window.__meltFrame','real rendered melt midpoint');await shot(out+'/05-radial-thaw.png');await run('window.__frostDemo.last=0;window.__frostDemo.frame=requestAnimationFrame(window.__frostDemo.loop)');await wait('window.__frostDemo.getState().phase==="done"','independent transition');await shot(out+'/06-next-scene.png');
 const done=await state();check('Melt and dawn reach a continuous completed state',done.values.melt===1&&done.values.dawn===1&&done.history.some(x=>x.phase==='transition'),done);
 const tap=async id=>{const p=await run(`(()=>{const e=document.getElementById(${JSON.stringify(id)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})()`);assert.ok(p.hit,id+' is blocked');await start(p.x,p.y);await end(p.x,p.y);};
 await tap('restart');await wait('window.__frostDemo.getState().phase==="countdown"','restart');check('Visible restart clears the prior gesture',(await state()).gesture===null,null);
 await tap('skip');await wait('window.__frostDemo.getState().phase==="guide"','skip opening');check('Visible skip enters an interactive guide',(await state()).phase==='guide',null);
 await start(center.x,center.y);await move(center.x+20,center.y+20);await cdp(touch?'Input.dispatchTouchEvent':'Input.dispatchMouseEvent',touch?{type:'touchCancel',touchPoints:[]}:{type:'mouseReleased',x:center.x+20,y:center.y+20,button:'left',buttons:0});if(!touch)await run('window.dispatchEvent(new Event("blur"))');
 check('Interrupted input never unlocks the next scene',(await state()).phase!=='melting'&&(await state()).phase!=='done',await state());
 await tap('debug-toggle');check('Debug panel serializes actual scene and gesture diagnostics',await run('!document.getElementById("debug").hidden'),null);await wait('document.getElementById("stats").textContent.includes("phase")','live diagnostics');check('Debug panel has readable live data',await run('document.getElementById("stats").textContent.includes("phase")'),null);
 check('No overflow on the target viewport',await run('document.documentElement.scrollWidth<=innerWidth'),null);
 check('No shader, JavaScript or resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();await writeFile(out+'/browser-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,width,height,touch,checks,environment:'Linux Chromium / SwiftShader with real CDP input events. Touch is simulated, not physical iPad Safari. A real rendered melt midpoint is paused via the debug frame hook for its screenshot, then resumed; no mask uniforms are injected.'},null,2)+'\n');}
console.log(JSON.stringify({passed:true,checks:checks.length,out}));
