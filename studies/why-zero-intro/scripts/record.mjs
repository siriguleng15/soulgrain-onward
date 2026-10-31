import {browser} from './browser.mjs';
import {mkdir,mkdtemp,writeFile,copyFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const url=process.argv[2]??'http://127.0.0.1:4760/',out='public/verification',fps=12;
await mkdir(out,{recursive:true});const frames=await mkdtemp('/tmp/frost-film-'),b=await browser(url,{width:1024,height:768,touch:true});
try{
 const{run,wait,cdp}=b;let frame=0;
 await wait('window.__frostDemo.getState().hand.ready','hand asset');await run('cancelAnimationFrame(window.__frostDemo.frame);window.__frostDemo.frame=0');
 const touch=(type,x,y)=>cdp('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
 const click=async id=>{const p=await run(`(()=>{const e=document.getElementById(${JSON.stringify(id)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await touch('touchStart',p.x,p.y);await touch('touchEnd');};
 const capture=async()=>{await run(`(()=>{const s=window.__frostDemo;s.last=${frame*1000/fps};s.loop(${(frame+1)*1000/fps});cancelAnimationFrame(s.frame);})()`);const r=await cdp('Page.captureScreenshot',{format:'jpeg',quality:92,captureBeyondViewport:false});await writeFile(frames+'/'+String(frame++).padStart(4,'0')+'.jpg',Buffer.from(r.data,'base64'));};
 const hold=async n=>{for(let i=0;i<n;i++)await capture();};
 await click('restart');await hold(64);assert.equal(await run('window.__frostDemo.getState().phase'),'guide');await hold(17);
 await touch('touchStart',666,337);for(let i=1;i<=48;i++){const a=i/48*2*Math.PI;await touch('touchMove',512+154*Math.cos(a),337+173*Math.sin(a));await capture();}await touch('touchEnd');
 assert.equal(await run('window.__frostDemo.getState().gesture.valid'),true);await hold(59);assert.equal(await run('window.__frostDemo.getState().phase'),'done');
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));assert.equal(b.requests.length,0,JSON.stringify(b.requests));
 const file=out+'/opening-review.mp4',r=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',frames+'/%04d.jpg','-c:v','libx264','-preset','veryfast','-crf','20','-vf','scale=in_range=full:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-movflags','+faststart',file],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);await copyFile(frames+'/0095.jpg',out+'/video-poster.jpg');
 await writeFile(out+'/video-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,frames:frame,fps,duration:frame/fps,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),gesture:await run('window.__frostDemo.getState().gesture'),passed:true,method:'Real CDP touch events and visible restart control drive the production loop at deterministic review timestamps. No uniform injection. Encoded FPS is not hardware performance. Linux Chromium / SwiftShader, not physical Safari.'},null,2)+'\n');console.log(JSON.stringify({passed:true,frames:frame,duration:frame/fps,file}));
}finally{b.close();}
