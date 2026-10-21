import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { NarrativeState } from '../types';

export class CameraRig {
  readonly camera = new PerspectiveCamera(33, 1, .001, 20);
  readonly controls: OrbitControls;
  width = 1; height = 1;
  constructor(canvas: HTMLCanvasElement) {
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;this.controls.dampingFactor = .10;
    this.controls.enablePan = false;this.controls.rotateSpeed = .48;this.controls.zoomSpeed = .65;
    this.controls.minDistance = .10;this.controls.maxDistance = 1.6;
    this.controls.minPolarAngle = .10;this.controls.maxPolarAngle = Math.PI * .85;
    this.camera.position.set(-.24,.18,.48);this.controls.target.set(0,.065,0);this.controls.update();
  }
  resize(width: number, height: number, framing: number) {
    this.width=width;this.height=height;this.camera.aspect=width/height;this.camera.zoom=Math.min(1,this.camera.aspect/1.25);
    this.frame(framing);this.camera.updateProjectionMatrix();
  }
  frame(amount: number) { this.camera.setViewOffset(this.width,this.height,-amount*this.width,0,this.width,this.height); }
  apply(state: NarrativeState) {
    this.camera.position.set(state.cameraX,state.cameraY,state.cameraZ);
    this.controls.target.set(state.targetX,state.targetY,state.targetZ);
    this.frame(state.framing);const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;
  }
  capture(state: NarrativeState) {
    [state.cameraX,state.cameraY,state.cameraZ]=this.camera.position.toArray();
    [state.targetX,state.targetY,state.targetZ]=this.controls.target.toArray();
  }
  project(point: Vector3) {
    const p=point.clone().project(this.camera);
    return { x:(p.x*.5+.5)*this.width,y:(-.5*p.y+.5)*this.height, visible:p.z>-1&&p.z<1 };
  }
  dispose(){this.controls.dispose();}
}
