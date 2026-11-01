import {browser} from './browser.mjs';
import {mkdir,mkdtemp,writeFile,copyFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const url=process.argv[2]??'http://127.0.0.1:4763/',out='public/verification-v3',fps=24;
await mkdir(out,{recursive:true});
const frames=await mkdtemp('/workspace/why-zero-film-v3-'),b=await browser(url,{width:1030,height:606,touch:true});
try{
  const {run,wait,cdp}=b;let frame=0,pressed=false;
  await wait('!window.__frostDemo.getState().loading&&window.__frostDemo.getState().experience.ready','complete assets');
  await run('cancelAnimationFrame(window.__frostDemo.frame);window.__frostDemo.frame=0');
  const move=(x,y)=>cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:pressed?'left':'none',buttons:pressed?1:0});
  const down=async(x,y)=>{await move(x,y);pressed=true;await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});};
  const up=async(x,y)=>{pressed=false;await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',buttons:0,clickCount:1});};
  const click=async id=>{const p=await run(`(()=>{const r=document.getElementById(${JSON.stringify(id)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await down(p.x,p.y);await up(p.x,p.y);};
  const capture=async()=>{
    await run(`(()=>{const s=window.__frostDemo;s.last=${frame*1000/fps};s.loop(${(frame+1)*1000/fps});cancelAnimationFrame(s.frame);})()`);
    const image=await cdp('Page.captureScreenshot',{format:'jpeg',quality:94,captureBeyondViewport:false});
    await writeFile(frames+'/'+String(frame++).padStart(4,'0')+'.jpg',Buffer.from(image.data,'base64'));
    if(frame%48===0)console.log('FRAME',frame,await run('window.__frostDemo.getState().phase+" / "+window.__frostDemo.getState().experience.chapter'));
  };
  const hold=async count=>{for(let i=0;i<count;i++)await capture();};
  const wheel=deltaY=>cdp('Input.dispatchMouseEvent',{type:'mouseWheel',x:515,y:303,deltaX:0,deltaY});
  const touch=(type,x,y)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  const restartPoint=await run('(()=>{const r=document.getElementById("restart").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');
  await touch('touchStart',restartPoint.x,restartPoint.y);await touch('touchEnd');await hold(164);await hold(32);
  await touch('touchStart',645,303);assert.equal(await run('window.__frostDemo.getState().phase'),'drawing');
  for(let i=1;i<=64;i++){const a=i/64*2*Math.PI;await touch('touchMove',515+130*Math.cos(a),303+142*Math.sin(a));await capture();}
  await touch('touchEnd');assert.equal(await run('window.__frostDemo.getState().gesture?.valid'),true);
  await hold(96);await hold(18);
  await wheel(700);
  for(let i=0;i<120;i++){
    const x=515+200*Math.sin(i/20),y=285+65*Math.cos(i/25);
    await move(x,y);if(i===48)await down(x,y);if(i===72)await up(x,y);await capture();
  }
  await wheel(450);await hold(72);await wheel(740);await hold(72);
  await move(515,303);await hold(36);
  await down(515,303);await hold(60);
  assert.ok(await run('window.__frostDemo.getState().experience.hold>.9'));
  await up(515,303);await hold(48);
  assert.ok(await run('window.__frostDemo.getState().experience.hold<.02'));
  assert.equal(b.errors.length,0,JSON.stringify(b.errors));assert.equal(b.requests.length,0,JSON.stringify(b.requests));
  const file=out+'/full-interaction-v3.mp4';
  const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',frames+'/%04d.jpg','-c:v','libx264','-preset','medium','-crf','19','-vf','scale=in_range=full:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-movflags','+faststart',file],{encoding:'utf8'});
  assert.equal(encoded.status,0,encoded.stderr);
  for(const [index,name]of [[0,'countdown'],[210,'draw-zero'],[365,'belief'],[420,'cursor-hand'],[445,'grip'],[540,'college'],[630,'creation'],[660,'connection'],[720,'held-night'],[770,'released']])await copyFile(frames+'/'+String(index).padStart(4,'0')+'.jpg',out+'/'+name+'.jpg');
  await copyFile(frames+'/0630.jpg',out+'/video-poster.jpg');
  const clip=spawnSync('ffmpeg',['-y','-loglevel','error','-ss','16.4','-i',file,'-c:v','libx264','-preset','veryfast','-crf','19','-pix_fmt','yuv420p','-color_range','tv','-movflags','+faststart',out+'/hand-interaction-v3.mp4'],{encoding:'utf8'});assert.equal(clip.status,0,clip.stderr);
  const report={testedAt:new Date().toISOString(),url,fps,frames:frame,duration:frame/fps,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),passed:true,method:'Actual CDP finger drawing, then mouse movement, presses, scroll-wheel and 3D target hold drive the production controller. Fixed 24fps review-clock sampling only; no progress, joint pose or shader uniform injection. This encoded frame rate is not physical device performance. Linux Chromium / SwiftShader, not iPad Safari.',finalState:await run('window.__frostDemo.getState().experience')};
  await writeFile(out+'/video-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,frames:frame,duration:frame/fps,file}));
}finally{b.close();}
