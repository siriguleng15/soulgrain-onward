import {spawn} from 'node:child_process';
import {pause} from './browser.mjs';
const directory=process.argv[2]??'/workspace/why-zero-preview-v3-local',port=4764,url='http://127.0.0.1:'+port+'/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',directory],{stdio:'ignore'});
const command=(args,env={})=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...env}});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(args.join(' ')+' exited '+code)));});
try{
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await pause(50);}if(!ready)throw Error('Verification server did not start');
  const handResults=await Promise.allSettled([
    command(['scripts/check-hand-narrative.mjs',url]),
    command(['scripts/check-hand-narrative.mjs',url,'--touch']),
    command(['scripts/check-hand-narrative.mjs',url,'--touch','--phone']),
  ]);
  for(const result of handResults)if(result.status==='rejected')throw result.reason;
  await command(['scripts/check-browser.mjs',url,'--touch'],{PROOF_DIR:'public/verification-v3/opening'});
  await command(['scripts/check-resilience.mjs',url],{PROOF_DIR:'public/verification-v3'});
  if(process.argv.includes('--film'))await command(['scripts/record-v3.mjs',url]);
}finally{server.kill('SIGTERM');}
