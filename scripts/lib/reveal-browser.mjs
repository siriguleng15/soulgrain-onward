import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function openBrowser(url,{width=1440,height=1000,touch=false,port=9581}={}){
 const profile=await mkdtemp('/tmp/onward-reveal-browser-'),errors=[],requests=[];
 // Headless Linux has no physical pointer device. Configure Blink's desktop
 // mouse capabilities explicitly; mobile profiles instead use CDP touch emulation.
 const chrome=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors','--use-angle=swiftshader','--enable-unsafe-swiftshader',...(!touch?['--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4']:[]),'--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 let socket;
 try{
  let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}if(!pages)throw Error('Chromium did not start');
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let seq=0;const pending=new Map();socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description));else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)requests.push({url:m.params.response.url,status:m.params.response.status});};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
  const wait=async(expression,label,timeout=120000)=>{const until=Date.now()+timeout;while(Date.now()<until){if(await run(expression))return;await pause(100);}throw Error('Timed out: '+label+' / '+await run('document.body.innerText.slice(-700)'));};
  const settled=()=>run('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  const shot=async file=>{await settled();const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(file,Buffer.from(r.data,'base64'));};
  const mouse=(x,y)=>cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});
  await cdp('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:5});await cdp('Page.navigate',{url});
  await wait('window.__onwardShowcase?.getState().ready||window.__onwardShowcase?.getState().loadingError','real model');
  const s=await run('window.__onwardShowcase.getState()');if(!s.ready)throw Error(JSON.stringify(s.loadingError));
  return{cdp,run,wait,shot,mouse,settled,errors,requests,close(){socket?.close();chrome.kill('SIGTERM');}};
 }catch(e){socket?.close();chrome.kill('SIGTERM');throw e;}
}
/** Project samples from existing target triangles and verify actual visibility. */
export const visibleTargets=`(()=>{const s=window.__onwardShowcase.scene,r=window.__onwardShowcase.reveal,out=[];s.scene.updateMatrixWorld(true);s.camera.updateMatrixWorld(true);const point=s.controls.target.clone();for(const b of r.bindings){const g=b.mesh.geometry,p=g.getAttribute('position'),idx=g.index,n=idx?idx.count:p.count;for(let k=0;k<n;k+=Math.max(3,Math.floor(n/55/3)*3)){point.set(0,0,0);for(let j=0;j<3;j++){const i=idx?idx.getX(Math.min(k+j,n-1)):k+j;point.x+=p.getX(i)/3;point.y+=p.getY(i)/3;point.z+=p.getZ(i)/3;}point.applyMatrix4(b.mesh.matrixWorld).project(s.camera);const x=(point.x*.5+.5)*innerWidth,y=(-point.y*.5+.5)*innerHeight;if(x<30||y<170||x>innerWidth-40||y>innerHeight-170||document.elementFromPoint(x,y)!==s.renderer.domElement)continue;const hit=r.probe(x,y);if(hit?.eligible&&hit.region===b.region)out.push({x,y,region:b.region,hit});}}return out;})()`;
