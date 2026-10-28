/** Isolated review build; never copies existing site or model assets. */
import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/tmp/onward-reference-model-preview'),base=process.argv[3]??'/soulgrain-onward/onward-model-v10/';
if(!out.startsWith('/tmp/')&&!out.startsWith(root+'/preview-build/'))throw Error('Use isolated output');
if(base!=='./'&&(!base.startsWith('/')||!base.endsWith('/')))throw Error('Invalid base');
const r=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.reference-model.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});
if(r.status!==0)process.exit(r.status??1);
await mkdir(out,{recursive:true});
await cp(root+'/public/reference-model-v10',out+'/reference-model-v10',{recursive:true});
await mkdir(out+'/pattern-engineering/data',{recursive:true});await mkdir(out+'/pattern-engineering/references',{recursive:true});
for(const file of ['pattern-mm.json','pattern-corrected.jpg','clasp-design.json'])await cp(root+'/public/pattern-engineering/data/'+file,out+'/pattern-engineering/data/'+file);
for(const file of ['03-shoe-side-original.jpg','12-design-final-straps.jpg'])await cp(root+'/public/pattern-engineering/references/'+file,out+'/pattern-engineering/references/'+file);
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=reference-model.html"><title>ONWARD 模型与裁片桥接</title><a href="reference-model.html">打开模型审核</a></html>\n');
await writeFile(out+'/.nojekyll','');console.log('Isolated actual-model preview:',out,base);
