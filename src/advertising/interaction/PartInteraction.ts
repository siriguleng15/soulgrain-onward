import { Raycaster, Vector2 } from 'three';
import type { AdScene } from '../scene/AdScene';

export class PartInteraction {
  private readonly ray=new Raycaster();private readonly point=new Vector2();
  private start={x:0,y:0,id:-1};private multi=false;private pointers=new Set<number>();
  constructor(readonly scene:AdScene,readonly enabled:()=>boolean,readonly selected:()=>void){
    const canvas=scene.renderer.domElement;
    canvas.addEventListener('pointerdown',e=>{this.pointers.add(e.pointerId);if(this.pointers.size>1)this.multi=true;else{this.multi=false;this.start={x:e.clientX,y:e.clientY,id:e.pointerId};}});
    canvas.addEventListener('pointercancel',e=>{this.pointers.delete(e.pointerId);this.multi=true;});
    canvas.addEventListener('pointerup',e=>{
      this.pointers.delete(e.pointerId);
      if(this.multi||e.pointerId!==this.start.id||Math.hypot(e.clientX-this.start.x,e.clientY-this.start.y)>7||!enabled())return;
      const box=canvas.getBoundingClientRect();this.point.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);
      this.ray.setFromCamera(this.point,scene.rig.camera);
      if(this.ray.intersectObjects(scene.hitTargets,false).length)selected();
    });
  }
}
