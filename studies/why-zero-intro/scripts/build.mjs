import {spawnSync} from 'node:child_process';
import {cp,mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve(process.argv[2]??'/tmp/why-zero-v2-release'),base=process.argv[3]??'/soulgrain-onward/why-zero-opening-v2/';
if(!out.startsWith('/tmp/')&&!out.startsWith('/workspace/why-zero-preview-'))throw Error('Build into an isolated /tmp directory');
for(const args of[['node_modules/typescript/bin/tsc','--noEmit'],['node_modules/vite/bin/vite.js','build','--base',base,'--outDir',out,'--emptyOutDir']]){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status)process.exit(r.status);}
await mkdir(out+'/research',{recursive:true});await cp('README.zh-CN.md',out+'/research/README.zh-CN.md');await cp('docs/AUDIT.zh-CN.md',out+'/research/AUDIT.zh-CN.md');await cp('docs',out+'/research/docs',{recursive:true});
// The old proof remains at its V1 URL, not copied into the new preview.
await rm(out+'/verification',{recursive:true,force:true});
const git=args=>spawnSync('git',args,{encoding:'utf8'}).stdout.trim();
await writeFile(out+'/preview-info.json',JSON.stringify({sourceCommit:git(['rev-parse','HEAD']),sourceBranch:git(['branch','--show-current']),builtAt:new Date().toISOString(),scope:'Independent opening-only reference study V2. Soulgrain pages/assets and V1 preview untouched.',referenceAccess:'Two user-supplied recordings decoded and visually inspected. Website and official article remain blocked by CONNECT 403.',referenceVisualAuditCompleted:true,pixelIdentical:false,physicalIPadSafariTested:false,handLicense:'MIT derivative / immersive-web webxr-input-profiles; editable Blender source included',iceSource:'New generated material, not reference-site texture or recording frames',entry:'index.html'},null,2)+'\n');
const archive=spawnSync('python3',['scripts/package-source.py',out+'/source-project.zip'],{stdio:'inherit'});if(archive.status)process.exit(archive.status);
await writeFile(out+'/.nojekyll','');console.log(out);
