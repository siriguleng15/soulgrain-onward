import assert from 'node:assert/strict';
import {mkdir,mkdtemp,writeFile,copyFile,readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {openBrowser,visibleTargets} from './lib/reveal-browser.mjs';
const url=process.argv[2]??'http://127.0.0.1:4740/pattern-reveal.html',out='public/pattern-reveal/verification';
await mkdir(out,{recursive:true});const frames=await mkdtemp('/tmp/onward-reveal-film-'),checks=[];
const b=await openBrowser(url,{width:1280,height:900});
try{
 const {run,cdp,mouse}=b;let frame=0;
 await run('window.__onwardShowcase.skipIntro();window.__onwardShowcase.setMotion(false);window.__onwardShowcase.setQuality("balanced");window.__onwardShowcase.setMode("free")');await b.settled();
 let points=await run(visibleTargets);points=points.filter(p=>p.region==='outer');assert.ok(points.length>4);
 points.sort((a,b)=>Math.hypot(a.x-870,a.y-565)-Math.hypot(b.x-870,b.y-565));const first=points[0];
 const next=points.filter(p=>Math.abs(p.x-first.x)>40).sort((a,b)=>Math.abs(a.y-first.y)-Math.abs(b.y-first.y))[0]??points.at(-1);
 await run('(()=>{const s=window.__onwardShowcase.scene;cancelAnimationFrame(s.frame);s.frame=0;s.last=0;s.clock=0;})()');
 const capture=async()=>{
  await run(`(()=>{const s=window.__onwardShowcase.scene;s.last=${frame*1000/15};s.lastRender=-Infinity;s.loop(${(frame+1)*1000/15});cancelAnimationFrame(s.frame);s.frame=0;})()`);
  const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(frames+'/'+String(frame++).padStart(4,'0')+'.png',Buffer.from(r.data,'base64'));
 };
 const hold=async n=>{for(let i=0;i<n;i++)await capture();};
 const clickAll=async()=>{const p=await run('(()=>{const r=document.querySelector("[data-reveal=all]").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()');await mouse(p.x,p.y);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,x:p.x,y:p.y});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,x:p.x,y:p.y});};
 await mouse(400,160);await hold(12);
 for(let i=0;i<60;i++){const t=(Math.sin(i/59*Math.PI*2-Math.PI/2)+1)/2;await mouse(first.x+(next.x-first.x)*t,first.y+(next.y-first.y)*t);await capture();}
 const local=await run('window.__onwardShowcase.getRevealState()');checks.push({name:'Actual mouse events drive the production surface reveal',passed:local.rayCount>20&&local.pointerEvents>40,detail:local});assert.ok(checks.at(-1).passed);
 await mouse(30,180);await hold(16);
 const faded=await run('window.__onwardShowcase.getRevealState()');checks.push({name:'Production window naturally shrinks away',passed:faded.opacity<.002,detail:faded.opacity});assert.ok(checks.at(-1).passed);
 await clickAll();await hold(18);
 const all=await run('window.__onwardShowcase.getRevealState()');checks.push({name:'Real UNVEIL ALL click restores the original printed state',passed:all.mode==='all'&&all.allUniform===1});assert.ok(checks.at(-1).passed);await hold(12);
 await clickAll();await hold(18);assert.equal(await run('window.__onwardShowcase.getRevealState().allUniform'),0);
 for(let i=0;i<24;i++){const t=i/23;await mouse(next.x+(first.x-next.x)*t,next.y+(first.y-next.y)*t);await capture();}
 await mouse(30,180);await hold(16);
 checks.push({name:'No shader, JavaScript or resource failures during the real-input film',passed:b.errors.length===0&&b.requests.length===0,detail:{errors:b.errors,requests:b.requests}});assert.ok(checks.at(-1).passed);
 const video=out+'/pattern-reveal-demo.mp4';const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','15','-i',frames+'/%04d.png','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',video],{encoding:'utf8'});assert.equal(encoded.status,0,encoded.stderr);
 await copyFile(frames+'/0045.png',out+'/video-poster.png');
 const hash=createHash('sha256').update(await readFile(video)).digest('hex');
 await writeFile(out+'/video-validation.json',JSON.stringify({testedAt:new Date().toISOString(),url,checks,frames:frame,fps:15,durationSeconds:frame/15,sha256:hash,method:'Actual CDP mouse movements and button clicks drive the unmodified reveal controller and Scene.loop at deterministic 15fps review timestamps. No direct mask-uniform edits. This recording is not a real-time performance benchmark.',environment:'Linux Chromium / SwiftShader with desktop mouse capability emulation, not physical iPad Safari.'},null,2)+'\n');
 console.log(JSON.stringify({passed:true,frames:frame,duration:frame/15,video,sha256:hash}));
}finally{b.close();}
