import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.argv[2]??'/tmp/why-zero-release'),base=process.argv[3]??'/soulgrain-onward/why-zero-opening-study/';
if(!out.startsWith('/tmp/')&&!out.startsWith('/workspace/why-zero-preview-'))throw Error('Build into an isolated /tmp directory');
for(const args of[['node_modules/typescript/bin/tsc','--noEmit'],['node_modules/vite/bin/vite.js','build','--base',base,'--outDir',out,'--emptyOutDir']]){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status)process.exit(r.status);}
await mkdir(out+'/research',{recursive:true});await cp('README.zh-CN.md',out+'/research/README.zh-CN.md');await cp('docs/AUDIT.zh-CN.md',out+'/research/AUDIT.zh-CN.md');await cp('docs',out+'/research/docs',{recursive:true});
const git=args=>spawnSync('git',args,{encoding:'utf8'}).stdout.trim();await writeFile(out+'/preview-info.json',JSON.stringify({sourceCommit:git(['rev-parse','HEAD']),sourceBranch:git(['branch','--show-current']),builtAt:new Date().toISOString(),scope:'Independent opening-only technical study. Original Soulgrain pages and assets untouched.',referenceAccess:'Both reference site and Codrops article blocked by CONNECT 403',originalVisualComparisonCompleted:false,physicalIPadSafariTested:false,handLicense:'MIT / immersive-web webxr-input-profiles',entry:'index.html'},null,2)+'\n');await writeFile(out+'/.nojekyll','');console.log(out);
