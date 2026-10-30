import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile,access} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/tmp/onward-fullshoe-build'),base=process.argv[3]??'/soulgrain-onward/onward-pattern-reveal-fullshoe/';
if(!out.startsWith('/tmp/'))throw Error('Use an isolated /tmp output');
const built=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.pattern-reveal.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});if(built.status)process.exit(built.status);
await mkdir(out+'/assets/onward-ad-v1',{recursive:true});
for(const f of['onward-ad-v1.glb','cuff-structure.json'])await cp(root+'/public/assets/onward-ad-v1/'+f,out+'/assets/onward-ad-v1/'+f);
for(const[from,to]of[['public/pattern-reveal-fullshoe','pattern-reveal'],['research/pattern-reveal-fullshoe','pattern-reveal/research']]){try{await access(root+'/'+from);await cp(root+'/'+from,out+'/'+to,{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}}
const sourceCommit=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),sourceBranch=spawnSync('git',['branch','--show-current'],{encoding:'utf8'}).stdout.trim();
await writeFile(out+'/preview-info.json',JSON.stringify({sourceCommit,sourceBranch,builtAt:new Date().toISOString(),scope:'Whole-shoe artwork reveal. Previous body-only preview and original Nightfall preserved.',mappedPrimitives:16,reliefPrimitives:1,modelSHA256:'1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4',entry:'pattern-reveal.html',physicalIPadSafariTested:false},null,2)+'\n');
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=pattern-reveal.html"><title>SOULGRAIN / UNVEIL — WHOLE SHOE</title><a href="pattern-reveal.html">打开整鞋纹样揭示体验</a></html>');await writeFile(out+'/.nojekyll','');
console.log('Independent full-shoe reveal:',out,base);
