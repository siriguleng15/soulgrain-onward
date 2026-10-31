import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile} from 'node:fs/promises';
export const pause=ms=>new Promise(r=>setTimeout(r,ms));
export async function browser(url,{width=1280,height=800,touch=false}={}){
 const profile=await mkdtemp('/tmp/frost-browser-'),errors=[],requests=[];let socket;
 const process=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--ignore-certificate-errors','--use-angle=swiftshader','--enable-unsafe-swiftshader',...(!touch?['--blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4']:[]),'--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
 try{
  let port;for(let i=0;i<100;i++){try{port=Number((await readFile(profile+'/DevToolsActivePort','utf8')).split('\n')[0]);break;}catch{await pause(100);}}if(!port)throw Error('Browser startup failed');
  const pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let seq=0;const pending=new Map();socket.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value??a.description));else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)requests.push({url:m.params.response.url,status:m.params.response.status});};
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
  const wait=async(expression,label,timeout=45000)=>{const until=Date.now()+timeout;while(Date.now()<until){if(await run(expression))return;await pause(100);}throw Error('Timed out '+label+' '+await run('document.body.innerText.slice(-600)'));};
  const shot=async path=>{const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path,Buffer.from(r.data,'base64'));};
  await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});await cdp('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:5});await cdp('Page.navigate',{url});
  await wait('!!window.__frostDemo||!!(document.getElementById("error")&&!document.getElementById("error").hidden)','application');if(await run('!document.getElementById("error").hidden'))throw Error(await run('document.getElementById("error").textContent'));
  return{run,wait,shot,cdp,errors,requests,close(){socket?.close();process.kill('SIGTERM');}};
 }catch(e){socket?.close();process.kill('SIGTERM');throw e;}
}
