/** Isolated local asset workbench. No model export, site build or deployment. */
import {build} from 'vite';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFile,mkdir,readFile,writeFile,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),out='/tmp/tongue-sleeve-lab-v1-build';
execFileSync(process.execPath,[path.join(root,'node_modules/typescript/bin/tsc'),'-p',path.join(root,'tsconfig.tongue-sleeve-lab.json')],{cwd:root,stdio:'inherit'});
const audit=JSON.parse(await readFile(path.join(root,'research/tongue-sleeve-v1/asset-audit.json'),'utf8'));
for(const asset of Object.values(audit.assets)){const bytes=await readFile(path.join(root,asset.path));if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('Source asset changed: '+asset.path);}
await build({root,configFile:path.join(root,'vite.tongue-sleeve-lab.config.ts')});
await mkdir(path.join(out,'assets/onward-ad-v1'),{recursive:true});await copyFile(path.join(root,'public/assets/onward-ad-v1/onward-ad-v1.glb'),path.join(out,'assets/onward-ad-v1/onward-ad-v1.glb'));
await cp(path.join(root,'public/tongue-sleeve-lab'),path.join(out,'tongue-sleeve-lab'),{recursive:true});
await copyFile(path.join(root,'research/tongue-sleeve-v1/asset-audit.json'),path.join(out,'tongue-sleeve-lab/asset-audit.json'));
await writeFile(path.join(out,'tongue-lab-build.json'),JSON.stringify({phase:'01-asset-preparation',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),finalReferencesReceived:true,narrativeImplemented:false,entry:'tongue-sleeve-lab.html',assets:Object.fromEntries(Object.entries(audit.assets).map(([k,a])=>[k,{path:a.path,sha256:a.sha256}])),scope:'Local inspection only. No push, deployment, production-page changes or source-model modification.'},null,2)+'\n');
console.log('Local asset workbench:',path.join(out,'tongue-sleeve-lab.html'));
