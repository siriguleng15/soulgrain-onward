/** node scripts/build-model-review-preview.mjs /tmp/onward-v9-preview /soulgrain-onward/onward-v9/ */
import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const out=path.resolve(process.argv[2]??'/tmp/onward-v9-preview');
const base=process.argv[3]??'/soulgrain-onward/onward-v9/';
if(!out.startsWith('/tmp/')&&!out.startsWith(root+'/preview-build/'))throw Error('Use an isolated /tmp or preview-build output directory');
if(!base.startsWith('/')||!base.endsWith('/'))throw Error('Base must start and end with /');
const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.model-review.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
await mkdir(out+'/assets',{recursive:true});
await cp(root+'/public/assets/soulgrain_onward_refined_v9.glb',out+'/assets/soulgrain_onward_refined_v9.glb');
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=model-review.html"><title>SOULGRAIN ONWARD</title><a href="model-review.html">进入新鞋型审核</a></html>\n');
await writeFile(out+'/.nojekyll','');
console.log('Independent model review built:',out,'base:',base);
