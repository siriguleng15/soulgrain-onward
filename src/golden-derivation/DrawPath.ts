import { Color, Group, Vector3 } from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import type { Path } from './construction.ts';
import { clamp } from './construction.ts';

/** Antialiased real 3D polyline, with a continuously interpolated leading edge.
 * Its preallocated instance buffer is edited only at the growing segment. No
 * material recompilation, TubeGeometry reconstruction or CSS drawing. */
export class DrawPath {
 readonly line:Line2;private readonly ends:number[];
 private previous=-1;private lastCount=0;
 constructor(readonly path:Path,color:string,width=2.1){
  const geometry=new LineGeometry();geometry.setPositions(path.points.flatMap(p=>p.toArray()));
  const material=new LineMaterial({color:new Color(color),linewidth:width,worldUnits:false,transparent:true,opacity:1,depthTest:true,depthWrite:false,alphaToCoverage:true});
  this.line=new Line2(geometry,material);this.line.frustumCulled=false;this.line.renderOrder=5;
  this.ends=path.points.slice(1).flatMap(p=>p.toArray());
  this.set(0);
 }
 attach(group:Group){group.add(this.line);return this;}
 set(p:number,opacity=1){
  p=clamp(p);this.line.visible=p>0&&opacity>0;this.line.material.opacity=opacity;
  if(p===this.previous)return;this.previous=p;
  const geometry=this.line.geometry,attr=geometry.getAttribute('instanceEnd');
  if(this.lastCount>0){const j=this.lastCount-1;attr.setXYZ(j,this.ends[j*3],this.ends[j*3+1],this.ends[j*3+2]);}
  const d=p*this.path.length;let i=1;while(i<this.path.lengths.length-1&&this.path.lengths[i]<d)i++;
  const j=i-1,a=this.path.points[j],b=this.path.points[i];
  const q=(d-this.path.lengths[j])/Math.max(1e-12,this.path.lengths[i]-this.path.lengths[j]);
  attr.setXYZ(j,a.x+(b.x-a.x)*q,a.y+(b.y-a.y)*q,a.z+(b.z-a.z)*q);attr.needsUpdate=true;
  geometry.instanceCount=p<=0?0:i;this.lastCount=i;
 }
 resize(w:number,h:number){this.line.material.resolution.set(w,h);}
 endpoint(){const i=this.lastCount-1;if(i<0)return new Vector3();const attr=this.line.geometry.getAttribute('instanceEnd');return new Vector3(attr.getX(i),attr.getY(i),attr.getZ(i));}
 dispose(){this.line.geometry.dispose();this.line.material.dispose();}
}
