/** Build only the advertising page for an isolated static-preview subdirectory.
 * node scripts/build-onward-ad-preview.mjs /tmp/onward-ad-preview /soulgrain-onward/onward-ad-v1/
 */
import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();const out=path.resolve(process.argv[2]??'/tmp/onward-ad-preview');
const base=process.argv[3]??'/soulgrain-onward/onward-ad-v1/';
if(!out.startsWith('/tmp/')&&!out.startsWith(root+'/preview-build/'))throw Error('Output must be a dedicated /tmp or preview-build subdirectory');
if(!base.startsWith('/')||!base.endsWith('/'))throw Error('Base must be an absolute path ending with /');
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.ad-preview.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
await mkdir(out+'/assets/onward-ad-v1',{recursive:true});
for(const name of ['onward-ad-v1.glb','cuff-structure.json'])await cp(root+'/public/assets/onward-ad-v1/'+name,out+'/assets/onward-ad-v1/'+name);
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=onward-ad.html"><title>SOULGRAIN ONWARD</title><a href="onward-ad.html">进入 ONWARD 三维叙事</a></html>\n');
await writeFile(out+'/.nojekyll','');
console.log('Independent preview built:',out,'base:',base);
