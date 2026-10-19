// Optional functional checks against a running page and Chromium CDP.
// No production code, model, or exported artwork is written by this test.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const pageUrl=process.argv[2]||'http://127.0.0.1:4184/';
const endpoint=process.argv[3]||'http://127.0.0.1:9237';
const tabs=await(await fetch(endpoint+'/json/list')).json();
const socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
let counter=0;const pending=new Map(),exceptions=[];
socket.onmessage=e=>{const r=JSON.parse(e.data);if(r.id){const p=pending.get(r.id);pending.delete(r.id);r.error?p.reject(r.error):p.resolve(r.result);}else if(r.method==='Runtime.exceptionThrown')exceptions.push(r.params);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++counter;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async(expression,awaitPromise=false)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
async function waitFor(expression){for(let i=0;i<100;i++){try{if(await evaluate(expression))return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Timeout: '+expression);}
const state=()=>evaluate('ClaspStudy.getState()');

try{
 await call('Page.enable');await call('Runtime.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:1024,height:1366,deviceScaleFactor:1,mobile:true});
 await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await call('Page.navigate',{url:pageUrl});
 await waitFor('document.readyState==="complete" && globalThis.ClaspStudy?.catalog().length===9');
 assert.equal(await evaluate('document.querySelectorAll("#scheme-tabs button").length'),9);
 const original=JSON.parse(await fs.readFile(path.join(root,'exports/presets.json'),'utf8'));
 for(const id of 'ABCDEFGHI'){
  await evaluate(`document.querySelector('[data-scheme="${id}"]').click();document.querySelector('.workspace').scrollIntoView()`);
  const initial=await state();assert.equal(initial.scheme,id);
  assert.equal(initial.layoutValidation.valid,id!=='F',id+' expected screening state');
  assert.equal(initial.clasps.length,2);
  if('ABCD'.includes(id))assert.deepEqual(initial.clasps,original.find(p=>p.scheme===id).clasps,'Original coordinates must not change');
  for(const toggle of ['show-guides','show-clasps']){
   await evaluate(`document.querySelector('#${toggle}').click()`);
   const count=await evaluate(toggle==='show-guides'?'document.querySelectorAll("#design-svg #mathematical-construction").length':'document.querySelectorAll("#design-svg .buckle-group").length');
   assert.equal(count,0);await evaluate(`document.querySelector('#${toggle}').click()`);
  }
  const nextAngle=initial.clasps[0].angle+4;
  await evaluate(`{const input=document.getElementById('angle');input.value=${nextAngle};input.dispatchEvent(new Event('change',{bubbles:true}));}`);
  assert.ok(Math.abs((await state()).clasps[0].angle-nextAngle)<1e-8);
  if('EFGHI'.includes(id))assert.equal((await state()).manuallyEdited,true);
  await evaluate('ClaspStudy.reset()');
  const position=await evaluate(`(()=>{const c=ClaspStudy.getState().clasps[0],s=document.querySelector('#design-svg'),p=s.createSVGPoint();p.x=c.x;p.y=c.y;const q=p.matrixTransform(s.getScreenCTM());return {x:q.x,y:q.y,scroll:scrollY}})()`);
  await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:position.x,y:position.y,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:position.x+12,y:position.y+7,id:1}]});
  await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok((await state()).clasps[0].x>initial.clasps[0].x+5,id+' touch drag');
  assert.equal(await evaluate('scrollY'),position.scroll,'Dragging a clasp must not scroll the page');
  await evaluate('ClaspStudy.reset()');
  console.log(id+': switching, defaults, guide/clasp visibility, angle edit, touch drag and reset passed');
 }
 // The independent first-round comparison must retain its fixed parameters.
 await evaluate(`ClaspStudy.choose('H');document.querySelector('#show-baseline').click();document.querySelector('#baseline-select').value='C';document.querySelector('#baseline-select').dispatchEvent(new Event('change'))`);
 const before=await evaluate('document.querySelector("#baseline-compare").innerHTML');
 await evaluate(`ClaspStudy.setClasp(0,{x:530})`);
 assert.equal(await evaluate('document.querySelector("#baseline-compare").innerHTML'),before);
 assert.equal(await evaluate('document.querySelectorAll("#current-compare .buckle-group").length'),2);
 await evaluate('ClaspStudy.reset()');
 // New exports through real buttons into a fresh directory, never stale files.
 const downloads=await fs.mkdtemp('/tmp/clasp-round2-download-');
 await call('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
 for(const id of 'EFGHI'){
  await evaluate(`ClaspStudy.choose('${id}')`);
  for(const [button,suffix] of [['export-svg','layout.svg'],['export-png','layout.png'],['export-json','coordinates.json']]){
   await evaluate(`document.querySelector('#${button}').click()`);
   const filename=path.join(downloads,`SoulGrain-ONWARD-${id}-${suffix}`);let data;
   for(let i=0;i<70;i++){try{data=await fs.readFile(filename);break;}catch{await new Promise(r=>setTimeout(r,100));}}
   assert.ok(data?.length>100,'Missing download: '+filename);
   if(suffix.endsWith('.png')){assert.equal(data.readUInt32BE(16),3840);assert.equal(data.readUInt32BE(20),2041);}
   if(suffix.endsWith('.svg')){assert.ok(!data.toString().includes('<image'));assert.ok(!data.toString().includes('NaN'));}
   if(suffix.endsWith('.json')){const r=JSON.parse(data);assert.equal(r.scheme,id);assert.ok(r.advancedExperiment.analysis);}
  }
 }
 for(const [width,height] of [[1366,1024],[390,844]]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
  await evaluate('window.scrollTo(0,0)');
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Viewport overflow');
 }
 assert.equal(exceptions.length,0,JSON.stringify(exceptions));
 console.log('PASS: A–I; unchanged A–D coordinates; comparison isolation; 15 real SVG/PNG/JSON downloads; tablet/mobile layout; no JS exceptions.');
}finally{socket.close();}
