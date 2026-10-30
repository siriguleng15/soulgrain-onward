/** Editable source package only. Published preview remains the direct viewing path.
 * Explicit allow-list avoids bundling credentials, unrelated models or dependencies.
 */
import {cp,readFile,writeFile,mkdir,mkdtemp,readdir,rm,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root=process.cwd();
const supplied=process.argv[2];
if(!supplied)throw Error('Usage: node scripts/package-immersive-showcase.mjs /tmp/<isolated-build>');
const out=path.resolve(supplied);
if(!out.startsWith('/tmp/')||out==='/tmp')throw Error('Package output must be an isolated /tmp build directory.');
if(!(await stat(path.join(out,'immersive-showcase.html'))).isFile())throw Error('Supply an existing isolated showcase build.');
const archiveName='ONWARD-immersive-v1-source.zip';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const models=[
  ['public/assets/onward-ad-v1/onward-ad-v1.glb','1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'],
  ['public/assets/onward-ad-v1/cuff-structure.json','7d313b066c1007f05c4edabfdd92fd51aff78e61df91841b76080ef6209dd085'],
];
for(const[file,expected]of models)if(digest(await readFile(path.join(root,file)))!==expected)throw Error('Original asset hash changed: '+file);
const scratch=await mkdtemp('/tmp/onward-immersive-source-');
const folder='ONWARD-immersive-v1-source',destination=path.join(scratch,folder);
try{
  await mkdir(destination,{recursive:true});
  const allowed=[
    'immersive-showcase.html','vite.immersive-showcase.config.ts',
    'scripts/build-immersive-showcase.mjs','scripts/package-immersive-showcase.mjs',
    'src/immersive-showcase','src/vite-env.d.ts',
    'src/advertising/geometry/CuffCurve.ts','src/advertising/geometry/CuffMaterial.ts',
    'src/advertising/scene/StudioMaterials.ts','src/advertising/types.ts',
    'package.json','package-lock.json','research/immersive-showcase',
    ...models.map(([file])=>file),
  ];
  for(const file of allowed){await mkdir(path.dirname(path.join(destination,file)),{recursive:true});await cp(path.join(root,file),path.join(destination,file),{recursive:true});}
  const config={compilerOptions:{target:'ES2022',lib:['ES2022','DOM','DOM.Iterable'],module:'ESNext',skipLibCheck:true,moduleResolution:'bundler',allowImportingTsExtensions:true,resolveJsonModule:true,isolatedModules:true,noEmit:true,strict:true,noUnusedLocals:true,noUnusedParameters:true},include:['src']};
  await writeFile(path.join(destination,'tsconfig.json'),JSON.stringify(config,null,2)+'\n');
  await mkdir(path.join(destination,'public/immersive-showcase'),{recursive:true});
  await cp(path.join(root,'research/immersive-showcase/README.zh-CN.md'),path.join(destination,'public/immersive-showcase/research-readme.md'));
  await writeFile(path.join(destination,'README.zh-CN.md'),`# Soulgrain ONWARD / NIGHTFALL — 可编辑展示源码包\n\n这是源码与必要资产包，**不是解压后直接双击的离线网页**。直接查看请使用在线预览：\n\nhttps://siriguleng15.github.io/soulgrain-onward/onward-immersive/immersive-showcase.html\n\n## 本地运行与独立构建\n\n需要 Node.js 22.12+（或 20.19+）与 npm。保留仓库原始 package.json 和锁文件；依赖可能包含本展示未使用的项目组件。不要使用原项目的 npm run build 命令，因为此包只包含独立展示所需的源文件。\n\n\`\`\`bash\nnpm ci\nnpx tsc --noEmit\nnpx vite --host 127.0.0.1 --open /immersive-showcase.html\n\`\`\`\n\n生成相对路径的独立静态页面（Linux / macOS）：\n\n\`\`\`bash\nnode scripts/build-immersive-showcase.mjs /tmp/onward-immersive-build ./\npython3 -m http.server 4521 --bind 127.0.0.1 --directory /tmp/onward-immersive-build\n\`\`\`\n\n浏览器打开 http://127.0.0.1:4521/immersive-showcase.html 。在线网页已经提供实时三维体验，不要求访客安装开发环境。\n\n## 包内范围与限制\n\n- 包含独立页面、TypeScript 源码、Three.js 翻筒与织物法线复用模块、构建配置和必要彩色 GLB / 翻筒结构 JSON。\n- 不包含 node_modules、Git 凭据、其他网站及工作台源码、原 Blender 工程、重复截图或录屏。完整测试、截图与过程视频由在线审核页提供。\n- 模型是彩色 V8 广告派生资产，保留早期绳状扣袢；它不是后期真实裁片研究中的扁平 PU 扣件系统。源字节 SHA-256 见 package-manifest.json。\n- 参考网站访问阻断、有限贴图细节、翻筒几何展开与 iPad Safari 尚未实机测试等边界见 research/immersive-showcase/README.zh-CN.md。\n- 基础鞋模改编自 theunclerulez 的 Generic “Converse style” Sneakers（CC BY 4.0）；Soulgrain 已修改几何与材质。来源：https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244 ，许可证：https://creativecommons.org/licenses/by/4.0/ 。用户品牌图案和原有模型的权利不因打包而改变。\n`);
  await writeFile(path.join(destination,'README.zh-CN.md'),'\n研究说明中的完整 QA 命令仅适用于完整 Git 仓库；本精简源码包未包含验证脚本和额外原始 V8 审计模型。包内支持前端运行、TypeScript 检查和独立构建，完整证据请查看在线审核页。\n',{flag:'a'});
  const files=[];
  async function walk(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const absolute=path.join(directory,entry.name);if(entry.isSymbolicLink())throw Error('Unexpected symbolic link');if(entry.isDirectory())await walk(absolute);else if(entry.isFile()){const bytes=await readFile(absolute);files.push({file:path.relative(destination,absolute).split(path.sep).join('/'),bytes:bytes.length,sha256:digest(bytes)});}}}
  await walk(destination);files.sort((a,b)=>a.file.localeCompare(b.file));
  const git=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
  const manifest={format:'Soulgrain immersive editable source package',createdAt:new Date().toISOString(),sourceCommit:git.status===0?git.stdout.trim():null,scope:'Editable source and selected unchanged assets, not an offline prebuilt site. Source commit is repository HEAD at packaging time.',preview:'https://siriguleng15.github.io/soulgrain-onward/onward-immersive/immersive-showcase.html',originalV8SHA256:'9d28c469089cb039fd17393db7e84d7c46def77db4eeb04aa05deed8a32c6f63',files};
  await writeFile(path.join(destination,'package-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  const zip=spawnSync('zip',['-q','-r',path.join(scratch,archiveName),folder],{cwd:scratch,encoding:'utf8'});if(zip.status!==0)throw Error(zip.stderr||'zip command failed');
  await cp(path.join(scratch,archiveName),path.join(out,archiveName));
  const archive=await readFile(path.join(out,archiveName));
  console.log(JSON.stringify({file:path.join(out,archiveName),bytes:archive.length,sha256:digest(archive),sourceFiles:files.length,models:models.map(([file,sha256])=>({file,sha256}))},null,2));
}finally{await rm(scratch,{recursive:true,force:true});}
