import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {browser,pause} from './browser.mjs';

const base=process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4763/';
const touch=process.argv.includes('--touch'),phone=process.argv.includes('--phone');
const width=phone?390:1030,height=phone?844:606;
const out=process.env.PROOF_DIR??'public/verification-v3/'+(phone?'phone':touch?'tablet':'desktop');
await mkdir(out,{recursive:true});
const u=new URL(base);u.searchParams.set('stage','hands');
const b=await browser(u.toString(),{width,height,touch});
const checks=[],check=(name,passed,detail)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name);console.log('PASS',name);};
try{
  const {run,wait,cdp,shot}=b,state=()=>run('window.__frostDemo.getState().experience');
  await wait('!window.__frostDemo.getState().loading&&window.__frostDemo.getState().experience.ready','all narrative assets');
  await pause(700);
  check('Direct hand entry reaches a rendered, interactive skinned hand',(await state()).chapter==='hands'&&(await state()).green.visible,await state());
  const a=await state();await shot(out+'/01-hand.png');
  const start=(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]}):cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});
  const move=(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]}):cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'left',buttons:touch?1:0});
  const end=(x,y)=>touch?cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}):cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1});
  if(touch)await start(width*.25,height*.45);
  await move(width*.78,height*.47);await pause(850);
  const tracked=await state();
  check('Actual pointer input changes the 3D hand position',Math.hypot(...tracked.green.root.map((v,i)=>v-a.green.root[i]))>.05,{before:a.green.root,after:tracked.green.root});
  if(!touch)await start(width*.78,height*.45);
  await pause(650);
  const clenched=await state();
  const angle=s=>s.green.joints.find(j=>j.name==='index-finger-phalanx-proximal').angle;
  check('Pressing actually articulates the finger joints',Math.abs(angle(clenched)-angle(a))>.18,{before:angle(a),after:angle(clenched)});
  await shot(out+'/02-pointer-grip.png');await end(width*.78,height*.45);await pause(600);
  check('Release restores the relaxed gesture',Math.abs(angle(await state())-angle(a))<.15,null);
  const orbit=(await state()).coins.positions;await pause(500);
  check('Orbiting objects continue to move in three dimensions',(await state()).coins.visible&&Math.hypot(...(await state()).coins.positions[0].map((v,i)=>v-orbit[0][i]))>.01,null);

  const scrub=async target=>{
    const delta=target-(await state()).targetProgress;
    if(touch){const x=width*.38,y=height*.8;await start(x,y);for(let i=1;i<=10;i++)await move(x,y-delta/(.0018*2.5)*i/10);await end(x,y-delta/(.0018*2.5));}
    else await cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x:width*.5,y:height*.6,deltaX:0,deltaY:delta/.0018});
    await wait(`Math.abs(window.__frostDemo.getState().experience.progress-${target})<.015`,'scroll camera settling');
  };
  await scrub(2.1);
  check('Real scroll or swipe reaches the College transition',(await state()).chapter==='college',await state());
  await shot(out+'/03-college.png');
  await scrub(3.4);
  check('Both skinned hands enter the Creation composition',(await state()).green.visible&&(await state()).human.visible&&(await state()).chapter==='connection',await state());
  await shot(out+'/04-creation.png');
  await start(width*.5,height*.5);
  await wait('window.__frostDemo.getState().experience.hold>.82','real 3D raycast hold');
  const held=await state();
  check('The 3D center target accepts a genuine held input',held.holding&&held.hold>.82,held);
  const index=held.green.joints.find(j=>j.name==='index-finger-phalanx-proximal').angle;
  const middle=held.green.joints.find(j=>j.name==='middle-finger-phalanx-proximal').angle;
  check('Hold changes the actual finger pose, not just a screen overlay',Math.abs(index)>Math.abs(middle)+.4,{index,middle});
  await shot(out+'/05-held-night.png');await end(width*.5,height*.5);
  await wait('window.__frostDemo.getState().experience.hold<.035','release restores daylight');
  check('Release restores the scene without advancing beyond the recording',(await state()).chapter==='connection'&&!(await state()).holding,null);
  await shot(out+'/06-release.png');
  await start(width*.5,height*.5);await pause(200);
  if(touch)await cdp('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});else await run('window.dispatchEvent(new Event("blur"))');
  await wait('!window.__frostDemo.getState().experience.holding','cancel releases contact');
  check('Interrupted contact cannot leave the dark hold state stuck',!(await state()).holding,null);
  const tap=async selector=>{const p=await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()`);assert.ok(p.hit,selector+' is covered');await start(p.x,p.y);await end(p.x,p.y);};
  await tap('#story-menu-toggle');await tap('[data-chapter="1.25"]');
  await wait('window.__frostDemo.getState().experience.chapter==="hands"','chapter navigation');
  check('Visible chapter controls return to the interactive hand',(await state()).chapter==='hands',null);
  check('No viewport overflow',await run('document.documentElement.scrollWidth<=innerWidth'),null);
  check('No shader, JavaScript, or failed-resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
}finally{
  b.close();await writeFile(out+'/hand-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url:u.toString(),width,height,touch,checks,environment:'Linux Chromium / SwiftShader, actual CDP input. Not physical iPad Safari. No narrative-progress or shader-uniform injection.'},null,2)+'\n');
}
console.log(JSON.stringify({passed:true,checks:checks.length,out}));
