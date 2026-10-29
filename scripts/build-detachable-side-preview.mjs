/** An isolated addition only. Original model/site/previous previews are read-only. */
import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/tmp/onward-detachable-side-preview'),base=process.argv[3]??'/soulgrain-onward/onward-side-unfold/';
if(!out.startsWith('/tmp/')&&!out.startsWith(root+'/preview-build/'))throw Error('Use isolated output');
if(base!=='./'&&(!base.startsWith('/')||!base.endsWith('/')))throw Error('Invalid base');
const built=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.detachable-side.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});if(built.status!==0)process.exit(built.status??1);
await cp(root+'/public/detachable-side-panel',out+'/detachable-side-panel',{recursive:true});
await mkdir(out+'/reference-model-v10',{recursive:true});for(const file of ['corrected.glb','model-data.json'])await cp(root+'/public/reference-model-v10/'+file,out+'/reference-model-v10/'+file);
await mkdir(out+'/pattern-engineering/data',{recursive:true});for(const file of ['pattern-mm.json','pattern-corrected.jpg','clasp-design.json'])await cp(root+'/public/pattern-engineering/data/'+file,out+'/pattern-engineering/data/'+file);
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=detachable-side.html"><title>ONWARD · 拆片与展开</title><a href="detachable-side.html">打开侧片展开研究页</a></html>\n');await writeFile(out+'/.nojekyll','');console.log('Isolated side-panel preview:',out,base);
