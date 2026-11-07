/** Standalone build only. No production output, old preview or GLB rewrites. */
import{spawnSync}from'node:child_process';
import{cp,mkdir,writeFile}from'node:fs/promises';
import path from'node:path';
const root=process.cwd(),out=path.resolve(process.argv[2]??'/tmp/xiezitu-golden-v1-build'),base=process.argv[3]??'./';
if(!out.startsWith('/tmp/')&&!out.startsWith(root+'/preview-build/'))throw Error('Isolated output required');
if(base!=='./'&&(!base.startsWith('/')||!base.endsWith('/')))throw Error('Invalid base');
const r=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.golden-derivation.config.ts','--base',base,'--outDir',out,'--emptyOutDir'],{stdio:'inherit'});
if(r.status!==0)process.exit(r.status??1);
await mkdir(out,{recursive:true});await cp(root+'/public/golden-derivation',out+'/golden-derivation',{recursive:true});
await writeFile(out+'/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=golden-derivation.html"><title>SOULGRAIN 黄金比例推导</title><a href="golden-derivation.html">进入实时三维推导</a></html>\n');
await writeFile(out+'/.nojekyll','');console.log('Independent preview:',out);
