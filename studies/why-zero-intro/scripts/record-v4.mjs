import {browser} from './browser.mjs';
import {mkdir,mkdtemp,writeFile,copyFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

// Review sampling, not a real-time performance benchmark. Only actual input events
// change chapters, pointer position, finger pose or the contact-hold state.
const url=new URL(process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4764/');
url.searchParams.set('stage','hands');
const out=process.env.PROOF_DIR??'public/verification-v4',fps=24;
await mkdir(out,{recursive:true});
const frames=await mkdtemp('/workspace/why-zero-film-v4-');
const b=await browser(url.toString(),{width:1030,height:606});
try{
  const {run,wait,cdp}=b;let frame=0,pressed=false;
  const checks=[],check=(name,passed,detail=null)=>{checks.push({name,passed:!!passed,detail});assert.ok(passed,name);};
  const state=()=>run('window.__frostDemo.getState().experience');
  await wait('!window.__frostDemo.getState().loading&&window.__frostDemo.getState().experience.ready','all V4 assets');
  await run('cancelAnimationFrame(window.__frostDemo.frame);window.__frostDemo.frame=0');
  const move=(x,y)=>cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:pressed?'left':'none',buttons:pressed?1:0});
  const down=async(x,y)=>{await move(x,y);pressed=true;await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});};
  const up=async(x,y)=>{pressed=false;await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1});};
  const capture=async()=>{
    await run(`(()=>{const s=window.__frostDemo;s.last=${frame*1000/fps};s.loop(${(frame+1)*1000/fps});cancelAnimationFrame(s.frame);})()`);
    const image=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:false});
    await writeFile(frames+'/'+String(frame++).padStart(4,'0')+'.jpg',Buffer.from(image.data,'base64'));
    if(frame%48===0)console.log('FRAME',frame,await run('window.__frostDemo.getState().experience.chapter'));
  };
  const hold=async count=>{for(let i=0;i<count;i++)await capture();};
  const snapshot=async name=>copyFile(frames+'/'+String(frame-1).padStart(4,'0')+'.jpg',out+'/'+name+'.jpg');
  const scrollTo=async progress=>{const delta=progress-(await state()).targetProgress;await cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x:515,y:303,deltaX:0,deltaY:delta/.0018});};
  await hold(36);
  const initial=await state();check('Direct entry opens interactive hands',initial.chapter==='hands'&&initial.green.visible);
  let openAngle=initial.green.joints.find(j=>j.name==='index-finger-phalanx-proximal').angle;
  for(let i=0;i<96;i++){
    const x=515+210*Math.sin(i/22),y=285+65*Math.cos(i/26);
    await move(x,y);
    if(i===40)await down(x,y);
    if(i===68)await up(x,y);
    await capture();
    if(i===31){await snapshot('cursor-hand');const s=await state();check('Real pointer motion moves the hand',Math.hypot(...s.green.root.map((v,n)=>v-initial.green.root[n]))>.04);}
    if(i===63){await snapshot('grip');const s=await state();check('Press articulates actual finger joints',Math.abs(s.green.joints.find(j=>j.name==='index-finger-phalanx-proximal').angle-openAngle)>.18);}
  }
  await scrollTo(2.1);await hold(60);await snapshot('college');
  check('Real wheel advances to text transition',(await state()).chapter==='college');
  await scrollTo(3.4);await hold(54);await snapshot('connection');await snapshot('video-poster');
  check('Real wheel reaches both hands',(await state()).chapter==='connection'&&(await state()).human.visible);
  await move(515,303);await down(515,303);await hold(66);await snapshot('held-night');
  const held=await state();check('Real center raycast hold changes state',held.holding&&held.hold>.9);
  const index=held.green.joints.find(j=>j.name==='index-finger-phalanx-proximal').angle;
  const middle=held.green.joints.find(j=>j.name==='middle-finger-phalanx-proximal').angle;
  check('Hold changes the actual hand skeleton',Math.abs(index)>Math.abs(middle)+.4,{index,middle});
  await up(515,303);await hold(48);await snapshot('released');
  check('Release restores daylight without leaving the recorded scope',(await state()).hold<.02&&(await state()).chapter==='connection');
  check('No JavaScript, shader or failed-resource errors',b.errors.length===0&&b.requests.length===0,{errors:b.errors,requests:b.requests});
  const file=out+'/hand-interaction-v4.mp4';
  const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',frames+'/%04d.jpg','-c:v','libx264','-preset','medium','-crf','19','-vf','scale=in_range=full:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-movflags','+faststart',file],{encoding:'utf8'});
  assert.equal(encoded.status,0,encoded.stderr);
  const report={testedAt:new Date().toISOString(),url:url.toString(),fps,frames:frame,duration:frame/fps,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),passed:true,checks,method:'Actual CDP mouse movement, press/release, wheel input and 3D target hold drive the production controller. Fixed 24fps review-clock sampling only; no progress, joint pose or shader-uniform injection. Encoded frame rate is not live device performance. Linux Chromium / SwiftShader; not physical iPad Safari.',finalState:await state()};
  await writeFile(out+'/video-validation.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:true,checks:checks.length,frames:frame,duration:frame/fps,file}));
}finally{b.close();}
