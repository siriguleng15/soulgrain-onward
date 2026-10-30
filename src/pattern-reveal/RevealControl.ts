import type {CursorReveal} from './CursorReveal.ts';
export class RevealControl {
 private readonly root:HTMLElement;private readonly button:HTMLButtonElement;private readonly hint:HTMLElement;
 private previous='';
 constructor(host:HTMLElement,getReveal:()=>CursorReveal|undefined){
  this.root=document.createElement('div');this.root.className='sgp-control';
  this.root.innerHTML='<button type="button" data-reveal="all" aria-pressed="false" aria-label="显示全部蒙古纹样"><span>UNVEIL ALL</span><i aria-hidden="true">＋</i></button><p data-reveal="hint">移动鼠标，发现隐藏的纹样</p>';
  host.append(this.root);this.button=this.root.querySelector('button')!;this.hint=this.root.querySelector('p')!;
  this.button.onclick=()=>{getReveal()?.toggleAll();this.update(getReveal());};
 }
 update(reveal?:CursorReveal){
  if(!reveal)return;const state=`${reveal.touchFallback}:${reveal.unveilAll}`;if(state===this.previous)return;this.previous=state;
  this.root.dataset.touch=String(reveal.touchFallback);this.button.hidden=reveal.touchFallback;
  this.button.setAttribute('aria-pressed',String(reveal.unveilAll));this.button.setAttribute('aria-label',reveal.unveilAll?'恢复鼠标探索':'显示全部蒙古纹样');
  this.button.querySelector('i')!.textContent=reveal.unveilAll?'−':'＋';
  this.hint.textContent=reveal.touchFallback?'FULL PATTERN / 触屏完整展示':reveal.unveilAll?'完整印花 · 点击返回鼠标探索':'移动鼠标，发现隐藏的纹样';
 }
}
