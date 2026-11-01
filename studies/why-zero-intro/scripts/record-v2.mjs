import {browser} from './browser.mjs';
import {mkdir,mkdtemp,writeFile,copyFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const url=process.argv[2]??'http://127.0.0.1:4762/',out='public/verification-v2',fps=24;
await mkdir(out,{recursive:true});
const frames=await mkdtemp('/workspace/why-zero-film-v2-');
const b=await browser(url,{width:1030,height:606,touch:true});
try{
  const {run,wait,cdp}=b;
  let frame=0;
  await wait('!window.__frostDemo.getState().loading&&window.__frostDemo.getState().hand.ready','complete v2 assets');
  await run('cancelAnimationFrame(window.__frostDemo.frame);window.__frostDemo.frame=0');
  const touch=(type,x,y)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  const click=async id=>{const p=await run(`(()=>{const r=document.getElementById(${JSON.stringify(id)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await touch('touchStart',p.x,p.y);await touch('touchEnd');};
  const capture=async()=>{
    await run(`(()=>{const s=window.__frostDemo;s.last=${frame*1000/fps};s.loop(${(frame+1)*1000/fps});cancelAnimationFrame(s.frame);})()`);
    const image=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:false});
    await writeFile(frames+'/'+String(frame++).padStart(4,'0')+'.jpg',Buffer.from(image.data,'base64'));
    if(frame%48===0)console.log('CAPTURE',frame,await run('window.__frostDemo.getState().phase'));
  };
  const hold=async n=>{for(let i=0;i<n;i++)await capture();};
  await click('restart');
  await hold(164);
  assert.equal(await run('window.__frostDemo.getState().phase'),'guide');
  await hold(80);
  await touch('touchStart',650,303);
  for(let i=1;i<=72;i++){
    const angle=i/72*Math.PI*2;
    await touch('touchMove',515+135*Math.cos(angle),303+140*Math.sin(angle));
    await capture();
  }
  await touch('touchEnd');
  assert.equal(await run('window.__frostDemo.getState().gesture.valid'),true);
  await hold(114);
  assert.equal(await run('window.__frostDemo.getState().phase'),'done');
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));
  assert.equal(b.requests.length,0,JSON.stringify(b.requests));
  const file=out+'/opening-v2-review.mp4';
  const encode=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',frames+'/%04d.jpg','-c:v','libx264','-preset','medium','-crf','19','-vf','scale=in_range=full:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-movflags','+faststart',file],{encoding:'utf8'});
  assert.equal(encode.status,0,encode.stderr);
  await copyFile(frames+'/0215.jpg',out+'/video-poster.jpg');
  // These are real rendered frames from the same controller, not source-video overlays.
  for(const [index,name] of [[0,'countdown-99'],[72,'frost-front'],[143,'shattering-zero'],[215,'pointing-hand'],[290,'drawn-zero'],[329,'radial-thaw'],[355,'white-flash'],[375,'reward-star'],[420,'you-believed']])
    await copyFile(frames+'/'+String(index).padStart(4,'0')+'.jpg',out+'/'+name+'.jpg');
  const validation={testedAt:new Date().toISOString(),url,width:1030,height:606,frames:frame,fps,duration:frame/fps,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),gesture:await run('window.__frostDemo.getState().gesture'),passed:true,method:'Real CDP finger events and the visible restart control drive the production controller. Capture steps its visible-time clock at 24 fps for an inspectable motion record. No success API, no shader uniform injection, no reference video playing in the scene. This is not a hardware frame-rate benchmark; Linux Chromium / SwiftShader, not physical iPad Safari.',codec:'H.264 / yuv420p / limited range / faststart'};
  await writeFile(out+'/video-validation.json',JSON.stringify(validation,null,2)+'\n');
  console.log(JSON.stringify({passed:true,frames:frame,duration:frame/fps,file}));
}finally{b.close();}
