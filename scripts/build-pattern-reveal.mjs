import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/tmp/onward-pattern-reveal-build'),base=process.argv[3]??'/soulgrain-onward/onward-pattern-reveal/';
if(!out.startsWith('/tmp/'))throw Error('Use an isolated /tmp output');
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.pattern-reveal.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});if(result.status)process.exit(result.status);
await mkdir(out+'/assets/onward-ad-v1',{recursive:true});
for(const file of['onward-ad-v1.glb','cuff-structure.json'])await cp(root+'/public/assets/onward-ad-v1/'+file,out+'/assets/onward-ad-v1/'+file);
for(const[from,to]of[['public/pattern-reveal','pattern-reveal'],['research/pattern-reveal','pattern-reveal/research']]){try{await access(root+'/'+from);await cp(root+'/'+from,out+'/'+to,{recursive:true});}catch(error){if(error.code!=='ENOENT')throw error;}}
const revision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}),branch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'});
await writeFile(out+'/preview-info.json',JSON.stringify({sourceCommit:revision.stdout.trim(),sourceBranch:branch.stdout.trim(),builtAt:new Date().toISOString(),modelSHA256:'1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4',entry:'pattern-reveal.html',physicalIPadSafariTested:false,scope:'Independent pattern reveal preview. Original Nightfall preview preserved.'},null,2)+'\n');
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=pattern-reveal.html"><title>SOULGRAIN / UNVEIL</title><a href="pattern-reveal.html">打开蒙古纹样揭示体验</a></html>');await writeFile(out+'/.nojekyll','');
console.log('Independent reveal build:',out,base);
