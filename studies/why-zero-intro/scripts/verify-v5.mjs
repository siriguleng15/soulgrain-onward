import {spawn} from 'node:child_process';
import {pause} from './browser.mjs';
const directory=process.argv[2]??'/workspace/why-zero-preview-v5-local',port=4785,url='http://127.0.0.1:'+port+'/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',directory],{stdio:'ignore'});
const command=(args,env={})=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(args.join(' ')+' exited '+code)));});
try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await pause(50);}if(!ready)throw Error('Verification server did not start');
  // Software rendering is shared: sequential browsers avoid CPU-contention
  // turning pose-settling into a wall-clock timeout.
  await command(['scripts/check-hand-narrative.mjs',url],{PROOF_DIR:'public/verification-v5/desktop'});
  await command(['scripts/check-hand-narrative.mjs',url,'--touch'],{PROOF_DIR:'public/verification-v5/tablet'});
  await command(['scripts/check-hand-narrative.mjs',url,'--touch','--phone'],{PROOF_DIR:'public/verification-v5/phone'});
  await command(['scripts/check-hand-narrative.mjs',url,'--touch'],{PROOF_DIR:'public/verification-v5/byte-optics',DISABLE_FLOAT_RT:'1'});
  await command(['scripts/check-browser.mjs',url,'--touch'],{PROOF_DIR:'public/verification-v5/opening'});
  await command(['scripts/check-resilience.mjs',url],{PROOF_DIR:'public/verification-v5'});
  if(process.argv.includes('--film'))await command(['scripts/record-v5.mjs',url]);
}finally{server.kill('SIGTERM');}
