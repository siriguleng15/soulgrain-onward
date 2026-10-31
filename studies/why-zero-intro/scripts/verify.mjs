import {spawn} from 'node:child_process';
import {pause} from './browser.mjs';
const directory=process.argv[2]??'/tmp/why-zero-local',port=4761,url='http://127.0.0.1:'+port+'/';
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1','--directory',directory],{stdio:'ignore'});
const command=args=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,args,{stdio:'inherit'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(Error(args.join(' ')+' exited '+code)));});
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await pause(50);}if(!ready)throw Error('Owned test server did not start');
 await Promise.all([command(['scripts/check-browser.mjs',url]),command(['scripts/check-browser.mjs',url,'--touch']),command(['scripts/check-browser.mjs',url,'--touch','--phone'])]);
 if(process.argv.includes('--film'))await command(['scripts/record.mjs',url]);
}finally{server.kill('SIGTERM');}
