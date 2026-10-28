/** Isolated build: never includes or changes the existing site or shoe models. */
import { spawnSync } from 'node:child_process';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const out = path.resolve(process.argv[2] ?? '/tmp/onward-pattern-preview');
const base = process.argv[3] ?? '/soulgrain-onward/onward-pattern/';
if (!out.startsWith('/tmp/') && !out.startsWith(root + '/preview-build/')) throw Error('Use an isolated build directory');
if (base !== './' && (!base.startsWith('/') || !base.endsWith('/'))) throw Error('Invalid base');
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--config', 'vite.pattern-preview.config.ts', '--base', base, '--outDir', out, '--emptyOutDir'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await mkdir(out + '/pattern-engineering', { recursive: true });
await cp(root + '/public/pattern-engineering', out + '/pattern-engineering', { recursive: true });
await writeFile(out + '/index.html', '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=pattern-lab.html"><title>ONWARD 裁片工程研究</title><a href="pattern-lab.html">进入裁片工程研究</a></html>\n');
await writeFile(out + '/.nojekyll', '');
console.log('Isolated pattern research build:', out, base);
