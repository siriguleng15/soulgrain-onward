// Optional authoring tool: use an already-running Chromium CDP instance.
// The interactive HTML itself has no dependency on Node or Chromium.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const pageUrl=process.argv[2]||'http://127.0.0.1:4184/';
const endpoint=process.argv[3]||'http://127.0.0.1:9237';
const pages=await (await fetch(endpoint+'/json/list')).json();
const page=pages.find(p=>p.type==='page');
if(!page)throw Error('Open a Chromium page with remote debugging enabled first.');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
const waiting=new Map();let nextId=0;
socket.onmessage=e=>{const r=JSON.parse(e.data);if(!r.id)return;const w=waiting.get(r.id);waiting.delete(r.id);r.error?w.reject(r.error):w.resolve(r.result);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;waiting.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const exports=path.join(root,'exports');

try{
 await call('Page.enable');await call('Page.navigate',{url:pageUrl});
 let ready=false;
 for(let i=0;i<100;i++){
  try{ready=await evaluate('document.readyState==="complete" && globalThis.ClaspStudy?.catalog().length===9');}catch{}
  if(ready)break;await new Promise(r=>setTimeout(r,100));
 }
 if(!ready)throw Error('Nine-scheme page did not become ready.');
 await fs.mkdir(exports,{recursive:true});
 for(const ext of ['svg','png']){
  const archive=path.join(exports,'overview-A-D.'+ext);
  try{await fs.access(archive);}catch{await fs.copyFile(path.join(exports,'overview.'+ext),archive);}
 }
 const catalog=await evaluate('ClaspStudy.catalog()'),states=[],svgs=[];
 for(const item of catalog){
  await evaluate(`ClaspStudy.choose(${JSON.stringify(item.id)})`);
  states.push(await evaluate('ClaspStudy.getState()'));
  if(item.advanced){
   await fs.writeFile(path.join(exports,`scheme-${item.id}.svg`),await evaluate('ClaspStudy.drawingSvg({guides:true,clasps:true,points:false})'));
   await fs.writeFile(path.join(exports,`scheme-${item.id}-clean.svg`),await evaluate('ClaspStudy.drawingSvg({guides:false,clasps:true,points:false})'));
   await fs.writeFile(path.join(exports,`story-${item.id}.svg`),await evaluate('ClaspStudy.storySvg()'));
  }
  svgs.push(await fs.readFile(path.join(exports,`scheme-${item.id}.svg`),'utf8'));
 }
 await fs.writeFile(path.join(exports,'presets-A-I.json'),JSON.stringify(states,null,2)+'\n');
 const panels=svgs.map((svg,i)=>{
  const x=40+(i%3)*1230,y=166+Math.floor(i/3)*810,item=catalog[i];
  const body=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>')).replaceAll('id="','id="panel'+i+'-');
  const status=states[i].layoutValidation;
  const note=status.errors.length?'干涉负例：保留研究，不推荐当前布局':status.warnings.length?'有净空警告：需要纸样复核':'二维初筛无额外警告：仍需样鞋验证';
  return `<g><rect x="${x}" y="${y}" width="1190" height="765" fill="#fff" stroke="#d8d7cf"/><text x="${x+23}" y="${y+40}" font-size="23" fill="#294e50">${escape(item.id+' / '+item.shortName)}${item.advanced?' · 新增实验':' · 第一轮'}</text><svg x="${x+12}" y="${y+64}" width="1166" height="620" viewBox="60 185 1110 590">${body}</svg><text x="${x+23}" y="${y+730}" font-size="17" fill="${status.errors.length||status.warnings.length?'#9d5139':'#697574'}">${escape(note)}</text></g>`;
 }).join('');
 const overview=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3730 2690" width="3730" height="2690"><title>SoulGrain ONWARD 蒙古扣九方案比较</title><style>text{font-family:'Noto Sans CJK SC',sans-serif}</style><rect width="3730" height="2690" fill="#f3f1eb"/><text x="40" y="65" font-size="36" fill="#26383a">SoulGrain / ONWARD — 前进</text><text x="40" y="111" font-size="20" fill="#697574">保留 A–D · 增量研究 E–I · 从结构种子、可验证关系到视觉取舍，不以公式名称替代设计理由</text>${panels}<text x="40" y="2618" font-size="18" fill="#697574">u 是原图坐标，不是毫米。E 有净空警告、F 保留冲突负例；G 为辅助双圆，实体扣头并不相交；I 与 H 属于相近视觉家族。</text><text x="40" y="2651" font-size="18" fill="#697574">文化灵感来自蒙古族服饰连接结构；本轮数学方法是当代构图选择。全部方案均未定稿，不能直接作为生产纸样。</text></svg>`;
 await fs.writeFile(path.join(exports,'overview.svg'),overview);
 console.log('Exported E–I, five new stories, A–I JSON and nine-scheme overview; A–D artwork and first overview preserved.');
}finally{socket.close();}
