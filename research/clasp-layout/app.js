(() => {
 'use strict';
 const G=globalThis.ClaspGeometry,T=globalThis.ShoeTrace,A=globalThis.StudyAssets;
 const $=id=>document.getElementById(id),clone=o=>JSON.parse(JSON.stringify(o));
 const fmt=(n,p=2)=>Number(n).toFixed(p),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 let scheme=G.presets.find(p=>p.id==='C'),items=clone(scheme.clasps),selected=0,history=[];
 const opts={guides:true,clasps:true,points:false,source:false};
 const style=`text{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Noto Sans CJK SC',sans-serif}.svg-label{font-size:11px;paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round;fill:#60536a}.svg-small{font-size:9px;fill:#65716e}.geom-guide{fill:none;stroke:#85709b;stroke-width:1.4;stroke-dasharray:5 4}.extension-guide{fill:none;stroke:#b16445;stroke-width:1.4;stroke-dasharray:8 5}.anchor-dot{fill:#fff;stroke:#2c6a72;stroke-width:1.3}.center-mark{stroke:#8d5d3a;stroke-width:1}.selection-ring{fill:none;stroke:none;pointer-events:none}.buckle-group.selected .selection-ring{stroke:#47858a;stroke-width:1.4;stroke-dasharray:4 3}`;
 const line=(a,b,cls='geom-guide')=>`<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
 const text=(p,s,cls='svg-label')=>`<text class="${cls}" x="${p.x}" y="${p.y}">${esc(s)}</text>`;
 const dot=(p,r=3,color='#85709b')=>`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${color}"/>`;
 const shoe=(id='main')=>T.markup.replace('id="shoe-original"',`id="shoe-original-${id}"`);
 function guideMarkup(p=scheme){
  const d=G.boundaryVector,n=G.boundaryNormal,extended=(a,v,before,after)=>line(G.add(a,G.mul(v,before)),G.add(a,G.mul(v,after)),'extension-guide');
  let s=line(G.boundaryStart,G.boundaryEnd)+text({x:611,y:266},'R₀ (600,270)')+text({x:425,y:676},'R₁ (418,650)');
  const stations=p.guides.stations||p.clasps.map(c=>G.validate(c).boundaryT);
  stations.forEach(t=>{const q=G.atBoundary(t);s+=line(G.add(q,G.mul(n,-9)),G.add(q,G.mul(n,9)))+text(G.add(q,{x:18,y:-10}),`t=${fmt(t,3)}`);});
  if(p.id==='A'){
   const a=G.atBoundary(1/(G.phi*G.phi)),b=G.atBoundary(1/G.phi);
   s+=text({x:655,y:214},'φ=(1+√5)/2 ≈ 1.618034')+text({x:655,y:234},'R(φ⁻²), R(φ⁻¹) · 仅约束中点站位');
   s+=line(a,b)+dot(a)+dot(b);
  }else if(p.id==='B'){
   const sp=G.spiral;const pts=sp.polyline(-.65,.75,150);
   s+=`<polyline class="geom-guide" stroke-dasharray="none" points="${pts.map(p=>p.x+','+p.y).join(' ')}"/>`+dot(sp.center)+text(G.add(sp.center,{x:7,y:-8}),'C · 螺线极点');
   [0,sp.delta].forEach((t,i)=>{const q=sp.pointAt(t),a=sp.tangentAngle(t)*Math.PI/180,v={x:Math.cos(a)*34,y:Math.sin(a)*34},n={x:Math.cos(a-Math.PI/2)*45,y:Math.sin(a-Math.PI/2)*45};s+=line(q,sp.center)+line(G.sub(q,v),G.add(q,v),'extension-guide')+line(G.sub(q,n),G.add(q,n))+text({x:690,y:i?560:360},`法线 ${fmt(p.clasps[i].angle)}° / 切线 ${fmt(sp.tangentAngle(t))}°`);});
   const f=G.fibonacciReference;
   s+=`<g transform="translate(991 214)"><g transform="scale(6)">${f.squares.map(([x,y,l])=>`<rect x="${x}" y="${y}" width="${l}" height="${l}" fill="none" stroke="#c1b6cb" stroke-width=".18"/>`).join('')}<path d="${f.path}" fill="none" stroke="#85709b" stroke-width=".22"/></g><text x="-12" y="96" class="svg-small">Fibonacci 圆弧近似 ≠ 对数螺线</text></g>`;
  }else if(p.id==='C'){
   const S=G.structureLines.find(s=>s.id==='cuffSplit'),v=G.sub(S.points[1],S.points[0]);s+=extended(S.points[0],v,-.08,2.05);
   p.guides.gaps.forEach((q,i)=>{s+=extended(q,v,-.18,.82)+dot(q,3,'#b16445')+text(G.add(q,{x:-112,y:-17}),`G${i+1} 孔间中点`);});
   s+=text({x:680,y:219},`扣轴 ∥ S · ${fmt(G.seamAngle,3)}°`);
  }else{
   const S=G.structureLines.find(s=>s.id==='soleDatum'),v=G.sub(S.points[1],S.points[0]);s+=line(S.points[0],S.points[1],'extension-guide')+text({x:675,y:678},`T · ${fmt(G.soleAngle,3)}°`);
   p.clasps.forEach(c=>s+=extended(c,v,-.20,.20));
   s+=text({x:680,y:219},'同尺寸 / 平行方向 / 留白 · 无黄金比例主张');
  }
  return `<g id="mathematical-construction">${s}</g>`;
 }
 function buckleMarkup(c,i,interactive=false){
  const L=c.length,W=c.width,r=c.headRadius;
  const classes=`buckle-group${interactive&&selected===i?' selected':''}`;
  const attrs=interactive?` data-index="${i}" tabindex="0" role="button" aria-label="扣件${i+1}，中心${fmt(c.x)},${fmt(c.y)}，可拖动或用方向键调整"`:'';
  return `<g class="${classes}"${attrs} transform="translate(${c.x} ${c.y}) rotate(${c.angle})"><rect class="selection-ring" x="${-L/2-W/2-8}" y="${-Math.max(W/2,r)-8}" width="${L+W/2+r+16}" height="${Math.max(W,2*r)+16}" rx="4"/><rect x="${-L/2-W/2}" y="${-W/2}" width="${L+W/2}" height="${W}" rx="2.5" fill="#ded7cb" stroke="#66594b" stroke-width="1.8"/><circle cx="${L/2}" cy="0" r="${r}" fill="#f1ede5" stroke="#66594b" stroke-width="1.8"/><circle cx="${L/2}" cy="0" r="${r*.37}" fill="none" stroke="#897761" stroke-width="1"/><circle class="anchor-dot" cx="${-L/2}" cy="0" r="2.8"/><circle class="anchor-dot" cx="${L/2}" cy="0" r="2.8"/><path class="center-mark" d="M-4 0H4M0-4V4" fill="none"/><text x="${-L/2+3}" y="${-Math.max(r,W/2)-9}" class="svg-small" transform="rotate(${-c.angle} ${-L/2+3} ${-Math.max(r,W/2)-9})">${i+1}</text></g>`;
 }
 function pointsMarkup(){return `<g id="reference-keypoints">${T.keypoints.map(p=>dot(p,2.5,'#287d87')+text(G.add(p,{x:6,y:-8}),`${p.id} (${p.x},${p.y})`)).join('')}</g>`;}
 function modified(){return items.some((c,i)=>Object.keys(c).some(k=>typeof c[k]==='number'&&Math.abs(c[k]-scheme.clasps[i][k])>1e-6));}
 function metadata(){return {brand:'SoulGrain',product:'ONWARD / 前进',scheme:scheme.id,schemeName:scheme.name,coordinateSystem:G.coordinateSystem,disclaimer:G.disclaimer,traceUncertainty:G.traceUncertainty,formula:scheme.formula,designChoices:scheme.rationale,manuallyEdited:modified(),clasps:clone(items),anchors:items.map(G.anchors),metrics:G.metrics(items),validation:items.map(c=>G.validate(c)),layoutValidation:G.validateLayout(items),sourceImageSize:T.source,geometryVersion:G.version};}
 function svgContent(settings={}){
  const o={...opts,...settings};
  const check=G.validateLayout(items),risk=check.errors.length?' · 存在干涉，需修正':check.warnings.length?' · 存在靠缝／净空警告，需复核':'';
  return `<rect x="60" y="185" width="1110" height="590" fill="#fff"/>${shoe()}${o.source?`<g id="reference-overlay" opacity=".27"><image href="${A.shoeImage}" x="0" y="0" width="1280" height="894"/></g>`:''}${o.guides?guideMarkup():''}${o.points?pointsMarkup():''}${o.clasps?items.map((c,i)=>buckleMarkup(c,i,!!o.interactive)).join(''):''}<text class="svg-small" x="78" y="762">SOULGRAIN / ONWARD · ${scheme.id} · ${modified()?'手动调整 / 约束见数据':'预设方案'} · 原图坐标 u，非 mm，非生产纸样${risk}</text>`;
 }
 function drawingSvg(settings={}){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${T.viewBox}" width="2220" height="1180" role="img"><title>SoulGrain ONWARD — ${scheme.id} ${esc(scheme.shortName)}</title><desc>${esc(G.disclaimer+' '+scheme.rationale)}</desc><metadata>${esc(JSON.stringify(metadata()))}</metadata><defs><style>${style}</style></defs>${svgContent({...settings,source:false,interactive:false})}</svg>`;}
 function renderEditor(){const c=items[selected];['x','y','angle','length','width','headRadius'].forEach(k=>{const e=$(k);if(e)e.value=fmt(c[k],k==='angle'?2:1);if($(k+'-range'))$(k+'-range').value=c[k];});[0,1].forEach(i=>$('select-'+i).setAttribute('aria-pressed',String(i===selected)));$('undo').disabled=!history.length;}
 function setSelection(i){selected=i;renderEditor();document.querySelectorAll('#design-svg .buckle-group').forEach((el,j)=>el.classList.toggle('selected',j===i));}
 function metricsRender(){
  const m=G.metrics(items),checks=items.map(c=>G.validate(c)),t=m.stationT;
  const rows=[['中点间距',fmt(m.centerDistance)+' u','二维欧氏距离'],['R 上投影站位',fmt(t[0],4)+' / '+fmt(t[1],4),'t=((M−R₀)·d)/(d·d)'],['角度差',fmt(m.deltaAngle)+'°','α₂−α₁，屏幕顺时针'],['锚点距比 L₂/L₁',fmt(m.lengthRatio,4),'不是视觉美学评分'],['双中心均值 G',`(${fmt(m.centerOfTwo.x)}, ${fmt(m.centerOfTwo.y)})`,'仅几何平均，不是质量或视觉重心'],['参考边界长度',fmt(m.boundaryLength)+' u','原手绘上拟合的 R 弦长']];
  $('metrics-grid').innerHTML=rows.map(([name,value,note])=>`<div class="metric"><span>${name}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
  $('coordinate-rows').innerHTML=items.map((c,i)=>{const a=G.anchors(c);return `<tr><td>${i+1}</td><td>(${fmt(c.x)}, ${fmt(c.y)})</td><td>${fmt(c.angle)}°</td><td>(${fmt(a.cuff.x)}, ${fmt(a.cuff.y)})</td><td>(${fmt(a.body.x)}, ${fmt(a.body.y)})</td></tr>`;}).join('');
  const layout=G.validateLayout(items), pairIssue=layout.pairGaps.some(p=>p.clearance<4);
  $('clearance-list').innerHTML=checks.map((v,i)=>`<div class="clearance-row ${v.errors.length||v.warnings.length?'warn':''}"><strong>扣件 ${i+1} · ${v.errors.length?'需修正':v.warnings.length?'需复核':'二维筛查通过'}</strong><small>${v.errors.concat(v.warnings).map(esc).join('<br>')||'两端分属两布片；当前符号避开图示鞋眼。'}</small><small>最近鞋眼净距 ${fmt(v.clearances.nearestEye.clearance)}u；完整扣形至缝线净距 ${fmt(v.clearances.footprintSeam)}u</small></div>`).join('')+(pairIssue?'<div class="clearance-row warn">两个扣件轮廓相交或净距不足4u，需调整。</div>':'')+'<p class="editor-note">4u 是绘图筛查裕度，非毫米。人工读点误差约 ±4u 或更多；R 是端点参考弦，对原曲线局部偏离可约10–15u。绿色不代表缝制／受力或量产验证。</p>';
  let note=scheme.limitations;
  if(scheme.id==='A'){const desired=[1/(G.phi*G.phi),1/G.phi],error=Math.max(...items.map((c,i)=>G.distance(c,G.atBoundary(desired[i]))));note+=` 当前中点距精确黄金站位的最大偏差 ${fmt(error)}u。`;}
  if(scheme.id==='B'){const sp=G.spiral,error=Math.max(...items.map((c,i)=>G.distance(c,sp.pointAt(i?sp.delta:0))));note+=` 当前中点距螺线两站最大偏差 ${fmt(error)}u，扣轴对预设法线偏角 ${items.map((c,i)=>fmt(c.angle-sp.normalAngle(i?sp.delta:0))+'°').join(' / ')}；90°半径比 φ，15°站位半径比 ${fmt(Math.exp(sp.b*sp.delta),5)}。`;}
  if(scheme.id==='C')note+=` 当前中点距原交点偏差 ${items.map((c,i)=>fmt(G.distance(c,scheme.clasps[i]))+'u').join(' / ')}；当前扣轴对 S 的偏角 ${items.map(c=>fmt(c.angle-G.seamAngle)+'°').join(' / ')}。`;
  if(scheme.id==='D')note+=' 当前方向以实际坐标为准，不主张黄金分割或“客观最美”。';
  $('constraint-note').textContent=note;
 }
 function render(){
  $('design-svg').innerHTML=`<defs><style>${style}</style></defs>${svgContent({interactive:true})}`;
  $('scheme-code').textContent='方案 '+scheme.id;$('scheme-title').textContent=scheme.name;$('scheme-explanation').textContent=scheme.rationale;
  $('formula-list').innerHTML=[scheme.formula,...scheme.construction].map(s=>`<code>${esc(s)}</code>`).join('');
  $('edit-badge').textContent=modified()?'存在手动调整':'原始方案';
  document.querySelectorAll('#scheme-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.scheme===scheme.id)));
  renderEditor();metricsRender();$('story-board').innerHTML=storySvg();
 }
 function remember(){history.push(clone(items));if(history.length>50)history.shift();}
 function choose(id){const p=G.presets.find(p=>p.id===id);if(!p)return;scheme=p;items=clone(p.clasps);history=[];selected=0;render();}
 function move(item,p){
  if($('snap-boundary').checked){const d=G.boundaryVector,t=Math.max(0,Math.min(1,G.dot(G.sub(p,G.boundaryStart),d)/G.dot(d,d)));p=G.atBoundary(t);}
  item.x=Math.max(60,Math.min(1170,p.x));item.y=Math.max(185,Math.min(775,p.y));
 }
 $('scheme-tabs').innerHTML=G.presets.map(p=>`<button type="button" role="tab" aria-selected="${p.id===scheme.id}" data-scheme="${p.id}"><span class="letter">${p.id}</span><span>${esc(p.shortName)}<small>${{A:'GOLDEN DIVISION',B:'SPIRAL & NORMALS',C:'STRUCTURAL EXTENSIONS',D:'FREE GEOMETRY'}[p.id]}</small></span></button>`).join('');
 $('scheme-tabs').setAttribute('role','tablist');$('scheme-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-scheme]');if(b)choose(b.dataset.scheme);});
 [['angle','角度 α · 顺时针 °',-90,90,.5],['length','锚点距 L · u',80,220,1],['width','扣身宽 W · u',10,36,.5],['headRadius','圆头半径 r · u',7,24,.5]].forEach(([k,label,min,max,step])=>{
  $('dimension-controls').insertAdjacentHTML('beforeend',`<div class="dimension-field"><label for="${k}">${label}</label><input id="${k}-range" type="range" min="${min}" max="${max}" step="${step}" aria-label="${label}"><input id="${k}" type="number" min="${k==='angle'?-180:min}" max="${k==='angle'?180:max}" step="${step}" aria-label="${label}数值"></div>`);
 });
 ['x','y','angle','length','width','headRadius'].forEach(k=>{const input=$(k),range=$(k+'-range');input.addEventListener('change',()=>{const v=Number(input.value);if(!Number.isFinite(v)||input.value===''){renderEditor();return;}remember();items[selected][k]=Math.max(Number(input.min),Math.min(Number(input.max),v));render();});if(range){range.addEventListener('pointerdown',remember);range.addEventListener('input',()=>{items[selected][k]=Number(range.value);render();});}});
 [0,1].forEach(i=>$('select-'+i).addEventListener('click',()=>setSelection(i)));
 $('undo').addEventListener('click',()=>{if(history.length){items=history.pop();render();}});$('reset').addEventListener('click',()=>{remember();items=clone(scheme.clasps);render();});
 [['show-guides','guides'],['show-clasps','clasps'],['show-points','points'],['show-source','source']].forEach(([id,key])=>$(id).addEventListener('change',()=>{opts[key]=$(id).checked;render();}));
 $('show-compare').addEventListener('change',()=>{$('original-sheet').hidden=!$('show-compare').checked;$('canvas-pair').classList.toggle('comparing',$('show-compare').checked);});
 let drag=null;const svg=$('design-svg');
 const svgPoint=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
 svg.addEventListener('pointerdown',e=>{const b=e.target.closest('.buckle-group');if(!b)return;e.preventDefault();selected=Number(b.dataset.index);remember();const p=svgPoint(e);drag={id:e.pointerId,dx:items[selected].x-p.x,dy:items[selected].y-p.y};svg.setPointerCapture(e.pointerId);setSelection(selected);});
 svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const p=svgPoint(e);move(items[selected],{x:p.x+drag.dx,y:p.y+drag.dy});render();});
 const stop=e=>{if(!drag)return;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);drag=null;};svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);
 svg.addEventListener('keydown',e=>{const b=e.target.closest('.buckle-group');if(!b)return;const shifts={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!shifts[e.key])return;e.preventDefault();selected=Number(b.dataset.index);remember();const m=e.shiftKey?5:1,[dx,dy]=shifts[e.key];move(items[selected],{x:items[selected].x+dx*m,y:items[selected].y+dy*m});render();svg.querySelector(`[data-index="${selected}"]`).focus();});
 function storySvg(){
  const captions=[['01 / 原始结构','保留手绘鞋型、翻筒分割、斜眼片和鞋底。'],['02 / 几何推导',scheme.shortName+'；参考线是设计方法，不是鞋型天然定律。'],['03 / 两端定位','每扣 P 在翻筒、Q 在鞋身；坐标仅为二维定位参考。'],['04 / 当前结果',modified()?'已手调：原公式作参考，当前坐标和偏差优先。':(['A','D'].includes(scheme.id)?'当前有靠缝警告，先在真实纸样复核；不是生产定稿。':'预设方案：先比较纸样与实物，再确认最终布局。')]];
  const panels=captions.map(([title,caption],i)=>{const x=i%2?740:40,y=i<2?130:625;let content=shoe('story-'+i);if(i===1)content+=guideMarkup();if(i>=2)content+=items.map((c,j)=>buckleMarkup(c,j)).join('');if(i===2)content+=items.map((c,j)=>{const e=G.anchors(c);return line(e.cuff,e.body)+text(G.add(e.cuff,{x:-5,y:-18}),`P${j+1}`)+text(G.add(e.body,{x:8,y:20}),`Q${j+1}`);}).join('');return `<g><rect x="${x}" y="${y}" width="660" height="450" fill="#fff" stroke="#d8d7cf"/><text x="${x+20}" y="${y+28}" font-size="14" fill="#294e50">${esc(title)}</text><g transform="translate(${x+18} ${y+53}) scale(.562)"><g transform="translate(-60 -185)">${content}</g></g><text x="${x+20}" y="${y+408}" font-size="11" fill="#697574">${esc(caption)}</text></g>`;}).join('');
  const formula=scheme.formula.match(/.{1,110}/gu)||[];
  const formulaText=formula.map((s,i)=>`<text x="40" y="${1145+i*20}" font-size="10" fill="#294e50">${esc(s)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1290" width="1440" height="1290"><title>SoulGrain ONWARD — ${scheme.id} 设计故事</title><metadata>${esc(JSON.stringify(metadata()))}</metadata><defs><style>${style}</style></defs><rect width="1440" height="1290" fill="#f5f3ed"/><text x="40" y="54" font-size="29" fill="#26383a">SoulGrain / ONWARD — 前进</text><text x="40" y="87" font-size="14" fill="#697574">${scheme.id} · ${esc(scheme.name)} · 设计研究，候选而非定稿</text>${panels}<text x="40" y="1117" font-size="11" fill="#26383a">M₁=(${fmt(items[0].x)},${fmt(items[0].y)}) α₁=${fmt(items[0].angle)}°　 M₂=(${fmt(items[1].x)},${fmt(items[1].y)}) α₂=${fmt(items[1].angle)}°</text>${formulaText}<text x="40" y="1210" font-size="11" fill="#697574">原图坐标 u，非毫米；未校正透视、布料展开、缝份、受力和活动量。数学方法不代表传统文化历史中的黄金定律。</text><text x="40" y="1241" font-size="11" fill="#697574">文化灵感：蒙古族传统服饰结构与蒙古扣的矩形扣身／圆形扣头。未指定最终材料和固定工艺。</text></svg>`;
 }
 function save(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();$('export-status').innerHTML=`已生成 ${esc(name)}。<a href="${u}" target="_blank" rel="noopener">若未下载，点此查看／保存原文件</a>`;setTimeout(()=>URL.revokeObjectURL(u),300000);}
 async function pngBlob(source,width=3840){
  const blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'}),u=URL.createObjectURL(blob),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=u;});const doc=new DOMParser().parseFromString(source,'image/svg+xml'),vb=doc.documentElement.getAttribute('viewBox').split(/\s+/).map(Number),canvas=document.createElement('canvas');canvas.width=width;canvas.height=Math.round(width*vb[3]/vb[2]);const c=canvas.getContext('2d');if(!c)throw Error('Canvas unavailable');c.fillStyle='#fff';c.fillRect(0,0,canvas.width,canvas.height);c.drawImage(img,0,0,canvas.width,canvas.height);const out=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!out)throw Error('PNG unavailable');return out;}finally{URL.revokeObjectURL(u);}
 }
 $('export-svg').addEventListener('click',()=>save(new Blob([drawingSvg()],{type:'image/svg+xml;charset=utf-8'}),`SoulGrain-ONWARD-${scheme.id}-layout.svg`));
 $('export-png').addEventListener('click',async()=>{const b=$('export-png');b.disabled=true;$('export-status').textContent='正在生成高清 PNG…';try{save(await pngBlob(drawingSvg()),`SoulGrain-ONWARD-${scheme.id}-layout.png`);}catch{$('export-status').textContent='此浏览器未完成PNG生成，请先保存SVG或在Safari中重试。';}finally{b.disabled=false;}});
 $('export-json').addEventListener('click',()=>save(new Blob([JSON.stringify(metadata(),null,2)],{type:'application/json'}),`SoulGrain-ONWARD-${scheme.id}-coordinates.json`));
 $('export-story').addEventListener('click',()=>save(new Blob([storySvg()],{type:'image/svg+xml;charset=utf-8'}),`SoulGrain-ONWARD-${scheme.id}-story.svg`));
 $('export-structure').addEventListener('click',()=>save(new Blob([A.structureSvg],{type:'image/svg+xml;charset=utf-8'}),'SoulGrain-ONWARD-structure-analysis.svg'));
 $('structure-diagram').innerHTML=A.structureSvg;
 const angle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 const e=angle({x:490,y:242},{x:322,y:619}),s=G.seamAngle,l=angle({x:115,y:432},{x:346,y:555});
 $('structure-data').innerHTML=[['鞋眼片后缘弦 E','E₀=(490,242)，E₁=(322,619)',`方向 ${fmt(e)}°`],['分割缝弦 S / T','S:(148,344)→(398,459)',`上缝 ${fmt(s)}°；下缝 ${fmt(l)}°`],['夹角来自拟合，不是强制直角','上缝与 E：'+fmt(Math.abs(e-s))+'°','下缝与 E：'+fmt(Math.abs(e-l))+'°']].map(([a,b,c])=>`<div><h3>${a}</h3><p>${b}<br>${c}</p></div>`).join('');
 const evaluations={
  A:['黄金分点仅用于R上两中点；角度和扣长独立选择。','站位节奏明确，但两扣不同倾角需结合实物审查。','以双扣跨接翻筒与鞋身表达服饰结构灵感，不假设黄金文化史。','需从R两端定位；上扣完整圆头至缝仅0.763u，必须复核；不能直接下生产。','可讲“黄金分点是设计起点”，不可讲鞋型本来黄金。'],
  B:['严格对数螺线拟合两站；另列Fibonacci圆弧近似，扣轴为法线。','方向逐步展开；曲线存在自由拟合参数，不保证比平行布局更美。','文化形与当代几何并置，不把公式追溯为传统知识。','两个不同角度、拟合极点难作直接车缝基准，优先留作表达研究。','推导故事较丰富，但必须披露站位、15°间隔及人为拟合。'],
  C:['孔间中点作分割缝平行线，与R相交；方向和位置均可重算。','两扣同向、呼应缝线，减少新的视觉竞争；留白仍需样鞋确认。','扣件跨接两层布，优先回应服饰连接结构。','同规格同倾角有利于定位模板；真实孔距、缝份与回折需复核。','适合讲“从原结构长出的秩序”，不借用黄金口号。'],
  D:['扣轴平行鞋底弦，同长同宽同圆头；不强求黄金。','短扣身保留鞋身留白，方向与斜眼片形成受控对照。','保留矩形与圆头的双扣节奏，避免堆叠未确认的文化符号。','较短零件、统一方向便于模板化；上扣圆头靠缝，仅2.439u图上净空，必须先复核。','可讲克制留白与当代服饰语言，叙事以实际构图为准。']
 };
 const dimensions=['数学与几何逻辑','视觉美感与协调','文化元素融合','缝制与量产可行性','品牌故事潜力'];
 $('evaluation-cards').innerHTML=G.presets.map(p=>`<article class="evaluation-card"><h3>${p.id} / ${esc(p.shortName)}</h3><dl>${evaluations[p.id].map((v,i)=>`<dt>${dimensions[i]}</dt><dd>${v}</dd>`).join('')}</dl></article>`).join('');
 globalThis.ClaspStudy={choose,getState:()=>metadata(),drawingSvg,storySvg,pngBlob,structureSvg:()=>A.structureSvg,setClasp:(i,values)=>{Object.assign(items[i],values);render();},reset:()=>choose(scheme.id)};
 render();
})();
