import './style.css';
import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace, Texture } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { ReviewScene } from './ReviewScene';
import type { Surface } from './ReviewScene';

const sourceURL='https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/682cf319ffe5dc4169fc28a95fc527f77b6a7e35/already.glb';
const finishedURL=`${import.meta.env.BASE_URL}assets/soulgrain_onward_refined_v9.glb`;
const labels:Record<string,string>={Body_Canvas:'鞋身帆布',Body_Inner_Canvas:'鞋身内侧',Collar_Canvas:'翻筒布面',Collar_Outer_Canvas:'鞋筒外面',Tongue_Canvas:'鞋舌正面',Tongue_Reverse_Canvas:'鞋舌背面',Rubber_Toe:'橡胶鞋头',Rubber_Foxing:'鞋底围条',Rubber_Outsole:'外底',Laces:'鞋带',Eyelets:'金属鞋眼',Heel_Strip:'后跟皮条',Canvas_Trim:'包边',Stitching:'缝线',Inner_Lining:'内衬',Red_Rubber_Piping:'红色橡胶包边',Foxing_Navy_Stripe:'鞋底藏蓝围线',Hardware_Silver:'鞋带头金属端帽',Aglet_Artwork:'鞋带头印花',Heel_Logo:'后跟Logo',Cuff_Border:'翻筒饰边',Clasp_Cream_Cord:'蒙古扣绳袢',Clasp_Engraved_Head:'蒙古扣圆头',Rhinestone_Silver:'鞋舌烫钻',Border_Studs:'鞋舌饰钉',Neutral_Surface:'底模表面'};
function label(key:string){const normalized=key.replace(/^V9[_ -]*/i,'');return labels[key]??labels[normalized]??normalized.replaceAll('_',' ');}
const root=document.querySelector<HTMLDivElement>('#model-review')!;
root.innerHTML=`
<header><span class="brand">SOULGRAIN<sup>™</sup></span><span class="header-label">ONWARD / SHAPE & MATERIAL REVIEW</span></header>
<main class="layout">
<section class="viewport" aria-label="可交互的新鞋型审核舞台"><div id="stage"></div><div class="stage-heading"><p class="eyebrow">SOULGRAIN · 前进</p><h1>ONWARD</h1><p id="view-description">新鞋型 · 成品外观审核</p></div><div class="message" id="stage-message" role="status" aria-live="polite"><span id="stage-status">正在加载真实三维鞋型…</span><button id="retry" type="button" hidden>重新加载</button></div><div class="stage-bottom"><span class="gesture">单指拖动旋转 · 双指缩放<br>桌面可使用鼠标与滚轮</span><button id="reset-view" disabled>恢复视角 ↗</button></div></section>
<aside class="panel" aria-label="鞋型与材质审核"><p class="eyebrow">FORM / SURFACE / DETAIL</p><h2>新鞋型审核</h2><p class="intro">从新的立体鞋型出发，检查轮廓与细节。颜色、印花可独立调整，鞋体形状保持不变。</p>
<div class="model-switch" role="group" aria-label="选择查看版本"><button id="mode-finished" data-mode="finished" aria-pressed="true">成品外观 · V9</button><button id="mode-source" data-mode="source" aria-pressed="false">新底模 · 白模</button></div>
<section class="control shape" id="shape-controls" hidden><span class="control-label"><span>01</span>鞋筒形态</span><div class="shape-buttons"><button id="shape-folded" aria-pressed="true">外翻折下</button><button id="shape-upright" aria-pressed="false">高帮展开</button></div></section>
<section class="control"><label class="control-label" for="part"><span>01</span>选择部件</label><select id="part" disabled><option>等待模型加载</option></select><p class="part-id" id="part-name"></p></section>
<section class="control"><label class="control-label" for="part-color"><span>02</span>部件颜色</label><div class="color-row"><input id="part-color" type="color" value="#d6d6d6" aria-label="选择部件颜色" disabled><input id="color-code" value="#D6D6D6" maxlength="7" aria-label="六位十六进制颜色" spellcheck="false" disabled></div><div class="swatches">${[['#eee8dc','暖白'],['#12263d','藏青'],['#b5162b','绯红'],['#34204e','深紫'],['#9ca0a4','银灰'],['#242830','墨黑']].map(([color,name])=>`<button class="swatch" data-color="${color}" style="--swatch:${color}" aria-label="${name}" disabled></button>`).join('')}</div></section>
<section class="control"><span class="control-label"><span>03</span>替换部件印花</span><input id="print-file" type="file" accept="image/png,image/jpeg,image/webp" disabled><label class="upload" id="upload-label" for="print-file">＋ 选择本地图片<span>JPG / PNG / WebP · 仅在当前设备处理</span></label><p class="note" id="print-note">图片沿部件表面铺排，不改变鞋型。</p><div id="pattern-controls" hidden><label class="range-row" for="print-scale"><span>重复</span><input id="print-scale" type="range" min="0.25" max="8" step="0.05" value="1"><output id="scale-output">1.0×</output></label><label class="range-row" for="print-angle"><span>旋转</span><input id="print-angle" type="range" min="-180" max="180" step="1" value="0"><output id="angle-output">0°</output></label></div><button class="small-action" id="clear-print" disabled>恢复此部件原印花</button><p class="note">颜色与图片叠加。保留图片原色时，请将部件颜色设为白色。</p></section>
<section class="control"><button class="primary" id="export-glb" disabled><span>下载当前设计 · GLB</span><span>↓</span></button><a class="download-source" id="download-original" href="${finishedURL}" download="soulgrain_onward_refined_v9.glb">下载未编辑的本版模型 ↗</a><button class="small-action" id="reset-styles" disabled>恢复全部原始外观</button><p class="note">下载保留当前材质、图片和模型数据，可导入 Blender 继续编辑。</p></section>
<p class="toast" id="notice" role="status" aria-live="polite"></p><footer>独立设计审核页 · 尚未替换官网、设计工作台或交互广告。<br>新鞋型基础：用户提供的 already.glb；成品图案与部件参考由用户提供。<br>本页用于外观审核，不代表生产纸样或最终量产尺寸。</footer></aside></main>`;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const message=el('stage-message'),status=el('stage-status'),notice=el('notice');
const select=el<HTMLSelectElement>('part'),colorInput=el<HTMLInputElement>('part-color'),codeInput=el<HTMLInputElement>('color-code');
const fileInput=el<HTMLInputElement>('print-file'),scaleInput=el<HTMLInputElement>('print-scale'),angleInput=el<HTMLInputElement>('print-angle');
const exportButton=el<HTMLButtonElement>('export-glb'),clearPrint=el<HTMLButtonElement>('clear-print');
type Part=Surface&{initialColor:Color;initialMap:Texture|null;print:CanvasTexture|null;repeat:number;angle:number;imageName:string};
let view:ReviewScene;let selected='';let mode:'finished'|'source'='finished';let loading=false;let exporting=false;let generation=0;let uploadGeneration=0;let shape=0;let lastExportBytes=0;let reloadRequired=false;
const parts=new Map<string,Part>();
function current(){return parts.get(selected);}
function failure(text:string,reload=false){reloadRequired ||= reload;status.textContent=text;message.hidden=false;el('retry').hidden=false;}
function setEnabled(enabled:boolean){for(const id of ['part','part-color','color-code','reset-view','reset-styles','export-glb']){(el(id) as HTMLInputElement|HTMLButtonElement).disabled=!enabled;}document.querySelectorAll<HTMLButtonElement>('.swatch').forEach(b=>b.disabled=!enabled);}
function reflect(){const part=current();if(!part)return;colorInput.value=`#${part.material.color.getHexString()}`;codeInput.value=colorInput.value.toUpperCase();el('part-name').textContent=part.key;fileInput.disabled=!part.supportsPrint||loading;el('upload-label').classList.toggle('unavailable',fileInput.disabled);el('upload-label').setAttribute('aria-disabled',String(fileInput.disabled));clearPrint.disabled=!part.print;el('pattern-controls').hidden=!part.print;scaleInput.value=String(part.repeat);angleInput.value=String(part.angle);el('scale-output').textContent=`${part.repeat.toFixed(1)}×`;el('angle-output').textContent=`${part.angle}°`;el('print-note').textContent=!part.supportsPrint?'此表面暂支持改色，请选择带有印花展开的部件。':part.print?`当前图片：${part.imageName}`:'印花沿部件表面铺排，不改变鞋型。';}
function setColor(hex:string){const part=current();if(!part||loading||!/^#[0-9a-f]{6}$/i.test(hex))return;part.material.color.set(hex);reflect();view.invalidate();}
function transformPrint(part:Part){if(!part.print)return;const r=part.angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r);part.print.repeat.set(part.repeat,part.repeat);part.print.center.set(0,0);part.print.offset.set(.5-part.repeat*(c+s)*.5,.5-part.repeat*(c-s)*.5);part.print.rotation=r;part.print.updateMatrix();view.invalidate();}
function restorePart(part:Part,all=false){part.print?.dispose();part.print=null;part.material.map=part.initialMap;part.material.needsUpdate=true;part.repeat=1;part.angle=0;part.imageName='';if(all)part.material.color.copy(part.initialColor);}
async function load(next:'finished'|'source'){
  if(exporting)return;const token=++generation;++uploadGeneration;loading=true;mode=next;root.dataset.loaded='false';root.dataset.mode=mode;message.hidden=false;el('retry').hidden=true;status.textContent='正在加载真实三维鞋型…';notice.textContent='';setEnabled(false);fileInput.disabled=true;clearPrint.disabled=true;el('shape-controls').hidden=true;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  const url=mode==='source'?sourceURL:finishedURL;
  try{
    const loaded=await view.load(url,ratio=>{if(token===generation)status.textContent=`正在加载真实三维鞋型… ${Math.round(ratio*100)}%`;});if(token!==generation||!loaded)return;
    parts.forEach(part=>part.print?.dispose());parts.clear();select.replaceChildren();
    for(const surface of view.surfaces()){const part:Part={...surface,initialColor:surface.material.color.clone(),initialMap:surface.material.map,print:null,repeat:1,angle:0,imageName:''};parts.set(surface.key,part);const option=document.createElement('option');option.value=surface.key;option.textContent=label(surface.key);select.append(option);}
    selected=parts.keys().next().value??'';if(!selected)throw Error('No editable material');select.value=selected;loading=false;setEnabled(true);reflect();shape=0;el('shape-controls').hidden=!view.hasShape();el('shape-folded').setAttribute('aria-pressed','true');el('shape-upright').setAttribute('aria-pressed','false');
    el('view-description').textContent=mode==='source'?'新底模 · 原始白模对照':'新鞋型 · 成品外观审核';
    const download=el<HTMLAnchorElement>('download-original');download.href=url;download.download=mode==='source'?'already.glb':'soulgrain_onward_refined_v9.glb';message.hidden=true;root.dataset.loaded='true';view.invalidate();
  }catch(error){if(token!==generation)return;loading=false;console.error(error);failure(mode==='source'?'原始白模暂未载入，请检查网络后重试。':'成品鞋模暂未载入，请检查网络后重试，也可选择新底模查看。');}
}
select.addEventListener('change',()=>{selected=select.value;reflect();notice.textContent='';});
colorInput.addEventListener('input',()=>setColor(colorInput.value));
codeInput.addEventListener('change',()=>{const hex=codeInput.value.startsWith('#')?codeInput.value:`#${codeInput.value}`;if(/^#[0-9a-f]{6}$/i.test(hex))setColor(hex);else{reflect();notice.textContent='请输入六位颜色值，例如 #12263D。';}});
document.querySelectorAll<HTMLButtonElement>('.swatch').forEach(b=>b.addEventListener('click',()=>setColor(b.dataset.color!)));
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.mode!==mode||!root.dataset.loaded||root.dataset.loaded==='false')void load(b.dataset.mode as 'finished'|'source');}));
el('retry').addEventListener('click',()=>{if(!view||reloadRequired)location.reload();else void load(mode);});el('reset-view').addEventListener('click',()=>view.reset());
scaleInput.addEventListener('input',()=>{const part=current();if(part){part.repeat=Number(scaleInput.value);transformPrint(part);reflect();}});angleInput.addEventListener('input',()=>{const part=current();if(part){part.angle=Number(angleInput.value);transformPrint(part);reflect();}});
clearPrint.addEventListener('click',()=>{const part=current();if(part){++uploadGeneration;restorePart(part);reflect();view.invalidate();notice.textContent='已恢复此部件原印花。';}});
el('reset-styles').addEventListener('click',()=>{++uploadGeneration;parts.forEach(part=>restorePart(part,true));reflect();view.invalidate();notice.textContent='已恢复所有部件的原始外观。';});
for(const [id,value]of [['shape-folded',0],['shape-upright',1]] as const)el(id).addEventListener('click',()=>{shape=value;view.setShape(value);el('shape-folded').setAttribute('aria-pressed',String(!value));el('shape-upright').setAttribute('aria-pressed',String(!!value));});
fileInput.addEventListener('change',async()=>{
  const file=fileInput.files?.[0],part=current(),token=++uploadGeneration,assetGeneration=generation;fileInput.value='';if(!file||!part||!part.supportsPrint||loading)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){notice.textContent='请选择 JPG、PNG 或 WebP 图片。';return;}if(file.size>24*1024*1024){notice.textContent='请选择小于24 MB的图片，方便iPad处理。';return;}
  const url=URL.createObjectURL(file);notice.textContent='正在准备印花…';
  try{const image=new Image();image.src=url;await image.decode();if(token!==uploadGeneration||assetGeneration!==generation)return;const ratio=Math.min(1,2048/Math.max(image.naturalWidth,image.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const context=canvas.getContext('2d');if(!context)throw Error('No image canvas');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;texture.flipY=false;texture.wrapS=texture.wrapT=RepeatWrapping;texture.anisotropy=Math.min(4,view.renderer.capabilities.getMaxAnisotropy());part.print?.dispose();part.print=texture;part.material.map=texture;part.material.needsUpdate=true;part.repeat=1;part.angle=0;part.imageName=file.name;transformPrint(part);if(current()===part)reflect();notice.textContent=`已应用到${label(part.key)}，图片没有上传。`;
  }catch{if(token===uploadGeneration)notice.textContent='无法读取这张图片，请尝试 JPG 或 PNG。';}finally{URL.revokeObjectURL(url);}
});
exportButton.addEventListener('click',async()=>{
  if(!view.asset||loading||exporting)return;exporting=true;exportButton.disabled=true;document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.disabled=true);notice.textContent='正在打包当前设计…';
  try{const result=await new GLTFExporter().parseAsync(view.asset,{binary:true,onlyVisible:true,includeCustomExtensions:true});if(!(result instanceof ArrayBuffer))throw Error('No GLB output');lastExportBytes=result.byteLength;const url=URL.createObjectURL(new Blob([result],{type:'model/gltf-binary'}));const a=document.createElement('a');a.href=url;a.download=mode==='source'?'soulgrain_onward_new_source_edited.glb':'soulgrain_onward_v9_edited.glb';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60_000);notice.textContent='GLB已生成。Safari可能打开文件预览，可使用分享菜单存储到“文件”。';}
  catch(error){console.error(error);notice.textContent='GLB打包失败，请减少图片尺寸后重试。';}finally{exporting=false;exportButton.disabled=false;document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.disabled=false);}
});
try{
  view=new ReviewScene(el('stage'),()=>failure('三维显示已暂停，请重新加载页面恢复。',true));void load(new URLSearchParams(location.search).get('model')==='source'?'source':'finished');
  if(import.meta.env.DEV||new URLSearchParams(location.search).has('review'))Object.assign(window,{__onwardReview:{snapshot:()=>({mode,loading,selected,parts:[...parts.values()].map(part=>({key:part.key,supportsPrint:part.supportsPrint,color:`#${part.material.color.getHexString()}`,uploaded:!!part.print,repeat:part.repeat,angle:part.angle})),shape,lastExportBytes,...view.info()}),load}});
  window.addEventListener('pagehide',event=>{if(!event.persisted){++generation;++uploadGeneration;parts.forEach(part=>part.print?.dispose());view.dispose();}});
}catch(error){console.error(error);failure('此浏览器暂时无法启动三维显示，请使用支持 WebGL 的 Safari 或桌面浏览器。',true);}
