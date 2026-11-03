import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.argv[2]??'/tmp/why-zero-v5-release'),base=process.argv[3]??'/soulgrain-onward/why-zero-hand-match-v5/';
if(!out.startsWith('/tmp/')&&!out.startsWith('/workspace/why-zero-preview-'))throw Error('Build into an isolated /tmp directory');
for(const args of[['node_modules/typescript/bin/tsc','--noEmit'],['node_modules/vite/bin/vite.js','build','--base',base,'--outDir',out,'--emptyOutDir']]){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status)process.exit(r.status);}
await mkdir(out+'/research',{recursive:true});await cp('README.zh-CN.md',out+'/research/README.zh-CN.md');await cp('docs/AUDIT.zh-CN.md',out+'/research/AUDIT.zh-CN.md');await cp('docs',out+'/research/docs',{recursive:true});
// The old proof remains at its V1 URL, not copied into the new preview.
await rm(out+'/verification',{recursive:true,force:true});
await rm(out+'/verification-v2',{recursive:true,force:true});
await rm(out+'/verification-v3',{recursive:true,force:true});
await rm(out+'/verification-v4',{recursive:true,force:true});
const git=args=>spawnSync('git',args,{encoding:'utf8'}).stdout.trim();
await writeFile(out+'/preview-info.json',JSON.stringify({sourceCommit:git(['rev-parse','HEAD']),sourceBranch:git(['branch','--show-current']),builtAt:new Date().toISOString(),scope:'Anatomical V5: UV-authored hand, anatomical joint axes, real depth optics, reversible mist and staged held refraction. All previous previews and Soulgrain assets unchanged.',referenceAccess:'Two user-supplied recordings decoded and visually inspected. Website and official article remain blocked by CONNECT 403.',referenceVisualAuditCompleted:true,pixelIdentical:false,physicalIPadSafariTested:false,handLicense:'Anatomical hand: Elena FF / CC BY-SA 4.0 derivative with source and editable Blender file; earlier opening guide: MIT WebXR derivative',scene:'Canonical anatomical skinned actors, preserved UV/PBR maps, real depth optics, independent generated 2.5D landscape; spatial garden remains experimental',entry:'index.html',handEntry:'?stage=hands',creationEntry:'?stage=creation'},null,2)+'\n');
const archive=spawnSync('python3',['scripts/package-source.py',out+'/source-project.zip'],{stdio:'inherit'});if(archive.status)process.exit(archive.status);
await writeFile(out+'/.nojekyll','');console.log(out);
