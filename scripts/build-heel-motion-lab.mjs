/** Build only the independent lab. Never invokes a source-model or production-site exporter. */
import {build} from 'vite';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,readFile,writeFile,cp,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out='/tmp/heel-motion-lab-v1-build';
execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'-p',path.join(root,'tsconfig.heel-motion-lab.json')],{cwd:root,stdio:'inherit'});
const asset='public/assets/onward-ad-v1/onward-ad-v1.glb',source=await readFile(path.join(root,asset));
const sha=createHash('sha256').update(source).digest('hex');
if(sha!=='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4')throw Error('Source model changed; refusing to build');
await build({root,configFile:path.join(root,'vite.heel-motion-lab.config.ts'),build:{outDir:out}});
await mkdir(path.join(out,'assets/onward-ad-v1'),{recursive:true});await copyFile(path.join(root,asset),path.join(out,'assets/onward-ad-v1/onward-ad-v1.glb'));
try{await access(path.join(root,'public/heel-motion-lab'));await cp(path.join(root,'public/heel-motion-lab'),path.join(out,'heel-motion-lab'),{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile(path.join(out,'heel-lab-build.json'),JSON.stringify({sourceCommit:'eabb19a9d7b55c661e0c7e392e6ea415aab430d7',codeCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),revision:'tangent-flow-heel-macro-v4',sourceModel:asset,sourceSHA256:sha,sourceBytes:source.length,entry:'heel-motion-lab.html',scope:'Independent lab only; approved preview prefix heel-motion-lab-v1; no production changes'},null,2)+'\n');
console.log('Independent build:',out+'/heel-motion-lab.html');
