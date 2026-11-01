import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {browser,pause} from './browser.mjs';

const base=process.argv[2]??'http://127.0.0.1:4762/';
const checks=[];
const check=(name,pass,detail)=>{checks.push({name,passed:!!pass,detail});assert.ok(pass,name);console.log('PASS',name);};
let b=await browser(base+'?stage=hand&byte-field',{width:1030,height:606,touch:true});
try{
  const {run,wait,cdp}=b,state=()=>run('window.__frostDemo.getState()');
  await wait('!window.__frostDemo.getState().loading','assets');
  check('Unsigned-byte heat-field fallback loads real assets',(await state()).render.floatField===false&&(await state()).hand.ready&&(await state()).render.photoReady,(await state()).render);
  const touch=(type,points)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:points});
  await touch('touchStart',[{x:500,y:280,id:1}]);
  await touch('touchMove',[{x:530,y:300,id:1}]);
  await touch('touchCancel',[]);
  check('Pointer cancellation returns to a valid idle state',(await state()).phase==='guide'&&(await state()).activePointer===null,null);
  await touch('touchStart',[{x:500,y:280,id:1}]);
  await touch('touchStart',[{x:500,y:280,id:1},{x:550,y:300,id:2}]);
  check('Two fingers cancel the stroke rather than accidentally unlock',(await state()).activePointer===null&&(await state()).phase==='guide',null);
  await touch('touchEnd',[]);
  await touch('touchStart',[{x:500,y:280,id:1}]);
  await run('const q=document.getElementById("quality");q.value="low";q.dispatchEvent(new Event("change",{bubbles:true}))');
  check('A quality change safely cancels captured input',(await state()).activePointer===null&&(await state()).render.field[0]===256,(await state()).render);
  await touch('touchEnd',[]);
  await touch('touchStart',[{x:500,y:280,id:1}]);
  await cdp('Emulation.setDeviceMetricsOverride',{width:630,height:840,deviceScaleFactor:1,mobile:true});
  await wait('innerWidth===630&&window.__frostDemo.getState().activePointer===null','viewport rotation cancels input');
  await touch('touchEnd',[]);
  check('Viewport rotation preserves a non-unlocked scene',(await state()).phase==='guide',await state());
  const draw=async()=>{
    await touch('touchStart',[{x:435,y:420,id:1}]);
    for(let i=1;i<=64;i++){const a=i/64*Math.PI*2;await touch('touchMove',[{x:315+120*Math.cos(a),y:420+150*Math.sin(a),id:1}]);}
    await touch('touchEnd',[]);
  };
  await draw();
  check('A real finger zero still unlocks after rotation in byte/low mode',(await state()).gesture?.valid,(await state()).gesture);
  const tap=async id=>{const p=await run(`(()=>{const r=document.getElementById(${JSON.stringify(id)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await touch('touchStart',[{...p,id:1}]);await touch('touchEnd',[]);};
  await tap('restart');await tap('skip');
  await pause(4300);
  const after=await state();
  check('Restart during thaw prevents an old completion callback from advancing',after.phase==='guide'&&after.values.melt===0&&after.values.dawn===0&&after.gesture===null,after);
  check('Byte/resize/restart path has no rendering or resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();}

b=await browser(base+'?stage=core',{width:390,height:844,touch:true});
try{
  await b.wait('!window.__frostDemo.getState().loading','core assets');
  const state=await b.run('window.__frostDemo.getState()');
  check('The direct core entry works without downloading a hand model',state.phase==='guide'&&!state.hand.ready&&state.render.photoReady,state);
  check('Direct mobile entry has no render or resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{b.close();const out=process.env.PROOF_DIR??'public/verification-v2';await mkdir(out,{recursive:true});await writeFile(out+'/resilience-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url:base,checks,environment:'Linux Chromium / SwiftShader with actual CDP touch input. Not physical iPad Safari.'},null,2)+'\n');}
console.log(JSON.stringify({passed:true,checks:checks.length}));
