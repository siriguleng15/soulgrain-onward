/** Deterministic recording of the REAL interactive WebGL timeline.
 * Start Vite and Chromium with --remote-debugging-port=9237 first.
 * This is an animation review replay, not a hardware FPS benchmark.
 * node scripts/record-onward-ad.mjs http://127.0.0.1:4195 http://127.0.0.1:9237
 */
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {once} from 'node:events';
const origin=process.argv[2]??'http://127.0.0.1:4195';const endpoint=process.argv[3]??'http://127.0.0.1:9237';
const tabs=await(await fetch(endpoint+'/json/list')).json();const ws=new WebSocket(tabs[0].webSocketDebuggerUrl);await once(ws,'open');let serial=0;const pending=new Map();const errors=[];
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
ws.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(data.error):p.resolve(data.result);}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params);};
const evaluate=async(expression,awaitPromise=false)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const out='previews/interactive-ad-v1';await mkdir(out,{recursive:true});
await call('Page.enable');await call('Runtime.enable');await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
const metrics=async(w,h)=>{await call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});await sleep(90);};
await metrics(1024,768);await call('Page.navigate',{url:origin+'/onward-ad.html?review=1'});
for(let i=0;i<240;i++){if(await evaluate('!!window.__onwardAd && document.querySelector("#ad-overlay").hidden'))break;await sleep(200);}
if(!await evaluate('!!window.__onwardAd'))throw Error('Advertisement did not load');
await evaluate("window.__onwardAd.canonical('ROOT');window.__onwardAd.stop();true");
const sourceCommit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
const fps=24;let clock=0,frames=0;const shots=[];
const encoder=spawn('ffmpeg',['-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',out+'/full-path-review.mp4'],{stdio:['pipe','ignore','pipe']});let encoderLog='';encoder.stderr.on('data',data=>encoderLog+=data);
async function frame(t){await evaluate(`window.__onwardAd.seek(${t},${clock});true`);const r=await call('Page.captureScreenshot',{format:'jpeg',quality:89,captureBeyondViewport:false});if(!encoder.stdin.write(Buffer.from(r.data,'base64')))await once(encoder.stdin,'drain');frames++;clock+=1/fps;}
async function shot(name,t){await metrics(1366,1024);await evaluate(`window.__onwardAd.seek(${t},${clock});true`);const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(r.data,'base64'));shots.push(name+'.png');await metrics(1024,768);}
async function segment(id,hold=0,markers=[]){
 if(id!=='ROOT')await evaluate('document.querySelector("#ad-action").click();window.__onwardAd.seek(0);true');
 const duration=id==='ROOT'?2.3:await evaluate('window.__onwardAd.snapshot().duration');console.log('Recording',id,duration);
 let marker=0;
 for(let i=0;i<=Math.ceil(duration*fps);i++){
  const t=Math.min(duration,i/fps);await frame(t);
  while(markers[marker]&&t>=markers[marker][0]){await shot(markers[marker][1],t);marker++;}
 }
 for(let i=0;i<hold*fps;i++)await frame(duration);
 console.log('Completed',id,'total frames',frames);
}
try{
 await segment('ROOT',.3,[[1.5,'01-root']]);
 await segment('A1',.7,[[2.6,'02-cuff-focus']]);
 await segment('A1.1',.8,[[5.4,'03-cuff-unfolded']]);
 await segment('A1.1.1',1,[[5.2,'04-toono-and-uni'],[6.3,'05-clasp-lift'],[10,'06-ger-assembly'],[17.2,'07-shoe-and-ger']]);
 await segment('A1.1.1.1',1.8,[[5.9,'08-cultural-notes']]);
 encoder.stdin.end();const [code]=await once(encoder,'close');if(code!==0)throw Error(encoderLog);
 await writeFile(out+'/recording.json',JSON.stringify({method:'Real WebGL application, existing GSAP story timeline sampled deterministically; actual DOM action clicks between nodes. Not real-time hardware performance footage.',sourceCommit,fps,width:1024,height:768,frames,duration:frames/fps,screenshots:shots,screenshotSize:[1366,1024],errors},null,2)+'\n');
 if(errors.length)throw Error('Runtime errors occurred during recording');console.log('RECORDED',frames/fps,'seconds',shots);
}finally{ws.close();if(!encoder.killed)encoder.kill('SIGTERM');}
