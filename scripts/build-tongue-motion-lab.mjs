/** Build only the independent tongue animation lab. No site publication. */
import { build } from 'vite';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url)), out = '/tmp/tongue-motion-lab-v1-build';
execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', path.join(root, 'tsconfig.tongue-motion-lab.json')], { cwd: root, stdio: 'inherit' });
const contract = JSON.parse(await readFile(path.join(root, 'public/tongue-motion-lab/assets/motion-contract.json'), 'utf8'));
const handPose = JSON.parse(await readFile(path.join(root, 'public/tongue-motion-lab/assets/hand-contact-poses.json'), 'utf8'));
for (const [file, sha] of [['public/tongue-sleeve-lab/assets/user-hand-rig.glb', handPose.sourceRigSHA256], ['public/assets/onward-ad-v1/onward-ad-v1.glb', contract.sourceShoeSHA256], ['public/tongue-sleeve-lab/assets/user-hand-parts.glb', contract.sourcePartsSHA256], ['public/tongue-motion-lab/assets/tongue-cuff-morphs.f16', contract.cacheSHA256]])
    if (createHash('sha256').update(await readFile(path.join(root, file))).digest('hex') !== sha)
        throw Error('Asset contract mismatch: ' + file);
await build({ root, configFile: path.join(root, 'vite.tongue-motion-lab.config.ts') });
await mkdir(path.join(out, 'assets/onward-ad-v1'), { recursive: true });
await copyFile(path.join(root, 'public/assets/onward-ad-v1/onward-ad-v1.glb'), path.join(out, 'assets/onward-ad-v1/onward-ad-v1.glb'));
await mkdir(path.join(out, 'tongue-sleeve-lab/assets'), { recursive: true });
for (const name of ['user-hand-parts.glb', 'user-hand-rig.glb', 'cuff-medallion-bindings.json'])
    await copyFile(path.join(root, 'public/tongue-sleeve-lab/assets', name), path.join(out, 'tongue-sleeve-lab/assets', name));
await cp(path.join(root, 'public/tongue-motion-lab'), path.join(out, 'tongue-motion-lab'), { recursive: true });
await writeFile(path.join(out, 'tongue-motion-build.json'), JSON.stringify({ sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), branch: execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(), chapterDuration: 19, sourceShoeSHA256: contract.sourceShoeSHA256, sourcePartsSHA256: contract.sourcePartsSHA256, scope: 'Isolated local chapter. No push, deployment or production changes.' }, null, 2) + '\n');
console.log('Local tongue animation build:', out);
