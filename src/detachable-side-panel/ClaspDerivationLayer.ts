/** Vector construction and surface-attached clasp study.
 * Every drawn point is evaluated from the accepted panel's triangle identity.
 * The PU free tips lift to a common closure before the panel unfastens; this
 * illustrative free span is separate from the recorded projection footprints.
 */
import {
 BufferAttribute,BufferGeometry,CanvasTexture,CylinderGeometry,DoubleSide,
 DynamicDrawUsage,FrontSide,Group,LineBasicMaterial,LineSegments,Mesh,
 MeshBasicMaterial,MeshStandardMaterial,Quaternion,SphereGeometry,Sprite,
 SpriteMaterial,TorusGeometry,Vector3,
} from 'three';
import type {PanelData} from './data.ts';
import type {
 ClaspAssembly,ClaspCoverage,ClaspDerivationData,ClaspDerivationPath,
 ClaspKeypoint,ClaspSurfaceSample,
} from './clasp-types.ts';
import {
 CLASP_STAGES,claspCoverageReveal,claspGuideOpacity,claspHardwareReveal,
 claspPathReveal,claspPointReveal,claspSmooth,claspStageAt,
 validateClaspDerivationData,
} from './clasp-types.ts';
export {CLASP_STAGES};

interface DrawnPath {data:ClaspDerivationPath;line:LineSegments<BufferGeometry,LineBasicMaterial>;pairs:[number,number][];}
interface DrawnCoverage {data:ClaspCoverage;mesh:Mesh<BufferGeometry,MeshBasicMaterial>;pu?:Mesh<BufferGeometry,MeshStandardMaterial>;assembly?:ClaspAssembly;}
interface DrawnPoint {data:ClaspKeypoint;group:Group;dot:Mesh;label?:Sprite;}
interface SnapPart {assembly:ClaspAssembly;surface:ClaspSurfaceSample;half:'body'|'cuff';group:Group;}
const bounded=(p:number)=>Math.max(0,Math.min(1,p));
const Y=new Vector3(0,1,0);
const SOURCE_SIDE_NOTE='materialSide +1 body/front, -1 cuff/back; renderer offset uses normalSign=-materialSide against immutable source face winding.';

export class ClaspDerivationLayer {
 readonly group=new Group();
 readonly data:ClaspDerivationData;
 readonly panelData:PanelData;
 readonly panelGeometry:BufferGeometry;
 private positions:ArrayLike<number>;
 private derivationProgress=0;private unfoldProgress=0;
 private guidesShown=true;private coverageShown=true;private annotationsShown=true;private hardwareShown=true;
 private readonly paths:DrawnPath[]=[];private readonly coverage:DrawnCoverage[]=[];
 private readonly points:DrawnPoint[]=[];private readonly snaps:SnapPart[]=[];
 private readonly textures:CanvasTexture[]=[];
 private readonly a=new Vector3();private readonly b=new Vector3();private readonly c=new Vector3();
 private readonly edge=new Vector3();private readonly normal=new Vector3();
 private readonly p=new Vector3();private readonly closure=new Vector3();private readonly support=new Vector3();
 private readonly cuffNormal=new Vector3();private readonly displayNormal=new Vector3();
 private readonly rotation=new Quaternion();
 private readonly scale:number;private readonly normalOffset:number;

 constructor(data:ClaspDerivationData,panelData:PanelData,panelGeometry:BufferGeometry){
  validateClaspDerivationData(data,panelData);this.data=data;this.panelData=panelData;this.panelGeometry=panelGeometry;
  this.positions=panelGeometry.getAttribute('position').array;
  this.scale=panelData.display.mmToModelScale;this.normalOffset=this.scale*.55;
  this.group.name='ONWARD_Vector_Clasp_Derivation_And_Paper_Anchors';
  this.group.userData={source:'User construction digitisation; current accepted paper mesh',surfaceIdentity:'original triangle IDs and barycentric coordinates',materialSideConvention:SOURCE_SIDE_NOTE};
  for(const path of data.paths){
   const pairs=path.segments??path.points.slice(1).map((_,i)=>[i,i+1]as[number,number]);
   const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(pairs.length*6),3).setUsage(DynamicDrawUsage));geometry.setDrawRange(0,0);
   const type=path.type,color=/support-circle|center/.test(type)?0x75d5ff:/opposite/.test(type)?0xf2a16d:/spiral|golden|rectangle/.test(type)?0xf3cd70:/region/.test(type)?0x53c6e2:/guide/.test(type)?0xa6d8d8:0x52e1bd;
   const material=new LineBasicMaterial({color,transparent:true,opacity:1,depthTest:true,depthWrite:false});
   const line=new LineSegments(geometry,material);line.name='Derivation_'+path.id;line.frustumCulled=false;line.renderOrder=5;
   this.group.add(line);this.paths.push({data:path,line,pairs});
  }
  for(const coverage of data.coverage){
   const geometry=this.surfaceGeometry(coverage),isCuff=coverage.materialSide===-1;
   const material=new MeshBasicMaterial({color:isCuff?0xe8aa56:0x55d9e2,transparent:true,opacity:.22,side:FrontSide,depthTest:true,depthWrite:false});
   const mesh=new Mesh(geometry,material);mesh.name='Material_Coverage_'+coverage.id;mesh.frustumCulled=false;mesh.renderOrder=3;mesh.userData={coverageId:coverage.id,materialSide:coverage.materialSide,normalSign:coverage.vertices[0]?.normalSign??-coverage.materialSide};this.group.add(mesh);
   const item:DrawnCoverage={data:coverage,mesh,assembly:data.clasps.find(c=>c.id===coverage.clasp)};
   if(coverage.half==='body'||coverage.half==='cuff'){
    const puGeometry=this.surfaceGeometry(coverage);puGeometry.setAttribute('normal',new BufferAttribute(new Float32Array(coverage.vertices.length*3),3).setUsage(DynamicDrawUsage));
    const pu=new Mesh(puGeometry,new MeshStandardMaterial({color:0xeee7d3,roughness:.67,metalness:0,side:DoubleSide,transparent:true,opacity:0,depthTest:true,depthWrite:true}));
    pu.name='PU_'+coverage.clasp+'_'+coverage.half;pu.frustumCulled=false;pu.renderOrder=4;
    pu.userData={materialSide:coverage.materialSide,contactStatus:'Surface projection footprint; PU free span/overlap remains illustrative, not a factory cutting length.'};
    item.pu=pu;this.group.add(pu);
   }
   this.coverage.push(item);
  }
  for(const point of data.keypoints){
   const group=new Group();group.name='Keypoint_'+point.id;group.userData={keypointId:point.id,materialSide:point.surface.materialSide};
   const dot=new Mesh(new SphereGeometry(this.scale*.83,12,8),new MeshBasicMaterial({color:/center|snap|C[12]/i.test(point.role+' '+point.label)?0x71d4fa:0xf0c77c,depthTest:true}));
   group.add(dot);const label=this.label(point.id);if(label){
    const centre=/^C[12](B)?$/.test(point.id);label.position.set(this.scale*(centre?7.4:3.4),this.scale*(centre?4.5:3.7),0);group.add(label);
    if(centre){const leaderGeometry=new BufferGeometry();leaderGeometry.setAttribute('position',new BufferAttribute(new Float32Array([0,0,0,label.position.x,label.position.y,0]),3));group.add(new LineSegments(leaderGeometry,new LineBasicMaterial({color:0xc5e9ee,transparent:true,opacity:.78,depthTest:true,depthWrite:false})));}
   }
   this.group.add(group);this.points.push({data:point,group,dot,label});
  }
  for(const assembly of data.clasps)for(const half of ['body','cuff']as const){
   const radius=assembly.radiusModelUnits>0?assembly.radiusModelUnits:assembly.snapAppearanceDiameterMm*this.scale/2;
   const group=new Group(),surface=half==='body'?assembly.bodySurface:assembly.cuffSurface;
   group.name=`Snap_${assembly.id}_${half}_${half==='body'?'male':'female'}`;
   const material=new MeshStandardMaterial({color:half==='body'?0xaab7bd:0xc4c9c8,roughness:.30,metalness:.8});
   const body=new Mesh(new CylinderGeometry(radius*(half==='body'?.78:1),radius*(half==='body'?.78:1),this.scale*(half==='body'?.75:1.3),48),material);group.add(body);
   const ring=new Mesh(new TorusGeometry(radius*.69,radius*.055,8,48),new MeshStandardMaterial({color:0x68777e,roughness:.37,metalness:.85}));
   ring.rotation.x=-Math.PI/2;ring.position.y=this.scale*.72;group.add(ring);
   if(half==='body'){
    const peg=new Mesh(new CylinderGeometry(radius*.21,radius*.23,this.scale*1.2,24),material.clone());peg.position.y=this.scale*.65;group.add(peg);
   }
   group.userData={snapAppearanceDiameterMm:assembly.snapAppearanceDiameterMm,diameterMeaning:'Preset appearance, not a global calibration or PU width',overlapMm:null,part:half==='body'?'illustrative male fitting':'illustrative female fitting'};
   this.group.add(group);this.snaps.push({assembly,surface,half,group});
  }
  this.updateSurface(this.positions,0);this.setDerivationProgress(0);
 }

 private surfaceGeometry(coverage:ClaspCoverage){
  const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(coverage.vertices.length*3),3).setUsage(DynamicDrawUsage));
  const sign=coverage.vertices[0]?.normalSign??-coverage.materialSide;
  geometry.setIndex(sign<0?coverage.indices.flatMap((_,i,a)=>i%3===0?[a[i],a[i+2],a[i+1]]:[]):coverage.indices);
  return geometry;
 }
 private label(text:string){
  if(typeof document==='undefined')return undefined;
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const ctx=canvas.getContext('2d');if(!ctx)return undefined;
  ctx.clearRect(0,0,256,96);ctx.fillStyle='rgba(12,36,52,.93)';ctx.beginPath();if(ctx.roundRect)ctx.roundRect(5,8,246,80,18);else ctx.rect(5,8,246,80);ctx.fill();
  ctx.strokeStyle='rgba(191,220,227,.8)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#f8f1df';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 42px Arial, sans-serif';ctx.fillText(text,128,50,226);
  const texture=new CanvasTexture(canvas);this.textures.push(texture);
  const sprite=new Sprite(new SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false}));sprite.scale.set(this.scale*12.5,this.scale*4.7,1);sprite.renderOrder=7;return sprite;
 }
 /** Writes actual current model-space positions, including the panel's rigid
  * detachment translation. Offset follows the physical material face. */
 private evaluate(sample:ClaspSurfaceSample,out:Vector3,offset=0){
  out.set(0,0,0);const q=this.positions;
  for(let k=0;k<3;k++){const i=sample.ids[k]*3,w=sample.barycentric[k];out.x+=q[i]*w;out.y+=q[i+1]*w;out.z+=q[i+2]*w;}
  if(offset){this.evaluateNormal(sample,this.normal);out.addScaledVector(this.normal,offset);}
  return out;
 }
 private evaluateNormal(sample:ClaspSurfaceSample,out:Vector3){
  const q=this.positions,ids=sample.ids;this.a.fromArray(q,ids[0]*3);this.b.fromArray(q,ids[1]*3);this.c.fromArray(q,ids[2]*3);
  out.copy(this.b).sub(this.a);this.edge.copy(this.c).sub(this.a);out.cross(this.edge).normalize().multiplyScalar(sample.normalSign??-sample.materialSide);return out;
 }
 private smoothNormal(sample:ClaspSurfaceSample,out:Vector3){
  const normals=this.panelGeometry.getAttribute('normal');
  if(!normals)return this.evaluateNormal(sample,out);
  out.set(0,0,0);for(let k=0;k<3;k++){const i=sample.ids[k],w=sample.barycentric[k];out.x+=normals.getX(i)*w;out.y+=normals.getY(i)*w;out.z+=normals.getZ(i)*w;}
  if(out.lengthSq()<1e-12)return this.evaluateNormal(sample,out);
  return out.normalize().multiplyScalar(sample.normalSign??-sample.materialSide);
 }
 private pointOffset(point:ClaspKeypoint){return this.scale*(/^C[12](B)?$/.test(point.id)?4.5:1.9);}
 private closureFor(assembly:ClaspAssembly,out:Vector3){
  this.evaluate(assembly.cuffSurface,out,this.scale*1.5);return out;
 }
 private freeTipWeight(sample:ClaspSurfaceSample,coverage:ClaspCoverage,assembly:ClaspAssembly){
  if(!sample.photoPx)return 0;const end=coverage.half==='body'?assembly.bodyEndPhoto:assembly.cuffEndPhoto,c=assembly.centerPhoto;
  const dx=c[0]-end[0],dy=c[1]-end[1],den=dx*dx+dy*dy;if(den<1e-8)return 0;
  return claspSmooth(((sample.photoPx[0]-end[0])*dx+(sample.photoPx[1]-end[1])*dy)/den);
 }
 updateSurface(positions:ArrayLike<number>,unfoldProgress=0){
  this.positions=positions;this.unfoldProgress=bounded(unfoldProgress);
  const closed=1-claspSmooth(this.unfoldProgress/.24);
  for(const item of this.paths){const attr=item.line.geometry.getAttribute('position')as BufferAttribute;
   for(let i=0;i<item.pairs.length;i++)for(let k=0;k<2;k++){this.evaluate(item.data.points[item.pairs[i][k]],this.p,this.normalOffset);attr.setXYZ(i*2+k,this.p.x,this.p.y,this.p.z);}attr.needsUpdate=true;
  }
  for(const item of this.coverage){
   const attr=item.mesh.geometry.getAttribute('position')as BufferAttribute,pu=item.pu?.geometry.getAttribute('position')as BufferAttribute|undefined,puNormals=item.pu?.geometry.getAttribute('normal')as BufferAttribute|undefined;
   let liftX=0,liftY=0,liftZ=0;
   if(item.assembly&&pu){
    this.closureFor(item.assembly,this.closure);
    this.evaluate(item.data.half==='body'?item.assembly.bodySurface:item.assembly.cuffSurface,this.support,this.scale*1.0);
    liftX=(this.closure.x-this.support.x)*closed;liftY=(this.closure.y-this.support.y)*closed;liftZ=(this.closure.z-this.support.z)*closed;
   }
   for(let i=0;i<item.data.vertices.length;i++){
    const sample=item.data.vertices[i];this.evaluate(sample,this.p,this.normalOffset*.68);attr.setXYZ(i,this.p.x,this.p.y,this.p.z);
    if(pu){
     // Adjacent clipped triangles duplicate their boundary vertices. Their
     // displacement must use the same interpolated paper-vertex normal;
     // per-face offsets open tiny cracks and create dark raster speckles.
     this.evaluate(sample,this.p);this.smoothNormal(sample,this.normal);this.p.addScaledVector(this.normal,this.scale);
     const weight=item.assembly?this.freeTipWeight(sample,item.data,item.assembly):0;pu.setXYZ(i,this.p.x+liftX*weight,this.p.y+liftY*weight,this.p.z+liftZ*weight);
     puNormals?.setXYZ(i,this.normal.x,this.normal.y,this.normal.z);
    }
   }
   attr.needsUpdate=true;if(pu)pu.needsUpdate=true;if(puNormals)puNormals.needsUpdate=true;
  }
  for(const item of this.points){this.evaluate(item.data.surface,item.group.position,this.pointOffset(item.data));}
  for(const snap of this.snaps){
   this.evaluate(snap.surface,this.support,this.scale*1.0);this.closureFor(snap.assembly,this.closure);
   snap.group.position.copy(this.support).lerp(this.closure,closed);
   this.evaluateNormal(snap.surface,this.displayNormal);this.evaluateNormal(snap.assembly.cuffSurface,this.cuffNormal);this.displayNormal.lerp(this.cuffNormal,closed).normalize();
   // Small opposite offsets distinguish the public/private fitting rather
   // than pretending their mounting planes are the same material point.
   snap.group.position.addScaledVector(this.displayNormal,this.scale*(snap.half==='cuff'?.8:-.1));
   this.rotation.setFromUnitVectors(Y,this.displayNormal);snap.group.quaternion.copy(this.rotation);
  }
  this.applyReveal();
 }
 setDerivationProgress(progress:number){if(!Number.isFinite(progress))return;this.derivationProgress=bounded(progress);this.applyReveal();}
 setVisible(show:boolean){this.group.visible=show;}
 setCoverage(show:boolean){this.coverageShown=show;this.applyReveal();}
 setHardware(show:boolean){this.hardwareShown=show;this.applyReveal();}
 setAnnotations(show:boolean){this.annotationsShown=show;this.applyReveal();}
 setGuides(show:boolean){this.guidesShown=show;this.applyReveal();}
 private applyReveal(){
  const p=this.derivationProgress,coverage=claspCoverageReveal(p),hardware=claspHardwareReveal(p);
  for(const path of this.paths){const f=claspPathReveal(p,path.data),count=Math.min(path.pairs.length,Math.floor(f*path.pairs.length));path.line.geometry.setDrawRange(0,count*2);path.line.visible=this.guidesShown&&count>0;path.line.material.opacity=claspGuideOpacity(p)*(1-claspSmooth(this.unfoldProgress/.18));}
  for(const item of this.coverage){item.mesh.visible=this.coverageShown&&coverage>0;item.mesh.material.opacity=.28*coverage;if(item.pu){item.pu.visible=this.hardwareShown&&hardware>0;item.pu.material.opacity=hardware;item.pu.material.depthWrite=hardware>.95;}}
  for(const item of this.points){const f=claspPointReveal(p,item.data);item.group.visible=this.annotationsShown&&f>0;item.group.scale.setScalar(.75+.25*f);if(item.label)item.label.material.opacity=f;}
  for(const snap of this.snaps){snap.group.visible=this.hardwareShown&&hardware>0;snap.group.scale.setScalar(Math.max(.001,hardware));}
 }
 getState(){
  const keypoints=this.points.map(item=>{
   const surface=this.evaluate(item.data.surface,new Vector3()),normal=this.evaluateNormal(item.data.surface,new Vector3());
   return{id:item.data.id,label:item.data.label,position:item.group.position.toArray(),surfacePosition:surface.toArray(),normal:normal.toArray(),offset:this.pointOffset(item.data),materialSide:item.data.surface.materialSide,normalSign:item.data.surface.normalSign??-item.data.surface.materialSide,visible:this.group.visible&&item.group.visible,flatMm:item.data.surface.flatMm};
  });
  const coverage=this.coverage.map(item=>{
   const attr=item.mesh.geometry.getAttribute('position'),pu=item.pu?.geometry.getAttribute('position');
   return{id:item.data.id,clasp:item.data.clasp,half:item.data.half,materialSide:item.data.materialSide,normalSign:item.data.vertices[0]?.normalSign??-item.data.materialSide,vertexCount:attr.count,indexCount:item.mesh.geometry.index?.count??0,visible:this.group.visible&&item.mesh.visible,puVisible:this.group.visible&&Boolean(item.pu?.visible),areaFlatMm2:item.data.areaFlatMm2,offset:this.normalOffset*.68,
    vertexSamples:Array.from({length:Math.min(6,attr.count)},(_,i)=>({index:i,position:[attr.getX(i),attr.getY(i),attr.getZ(i)],surfacePosition:this.evaluate(item.data.vertices[i],new Vector3()).toArray(),normal:this.evaluateNormal(item.data.vertices[i],new Vector3()).toArray(),flatMm:item.data.vertices[i].flatMm,ids:item.data.vertices[i].ids,barycentric:item.data.vertices[i].barycentric,puPosition:pu?[pu.getX(i),pu.getY(i),pu.getZ(i)]:null})),
   };
  });
  const derivedPaths=this.paths.map(item=>({id:item.data.id,type:item.data.type,stage:item.data.stage,drawCount:item.line.geometry.drawRange.count,totalCount:item.pairs.length*2,visible:this.group.visible&&item.line.visible}));
  return{visible:this.group.visible,progress:this.derivationProgress,unfoldProgress:this.unfoldProgress,stage:claspStageAt(this.derivationProgress).id,pathCount:this.paths.length,drawnPathVertices:derivedPaths.reduce((s,p)=>s+p.drawCount,0),keypoints,coverage,derivedPaths,snaps:this.snaps.map(s=>({clasp:s.assembly.id,half:s.half,position:s.group.position.toArray(),normal:new Vector3().copy(Y).applyQuaternion(s.group.quaternion).toArray(),visible:this.group.visible&&s.group.visible,snapAppearanceDiameterMm:s.assembly.snapAppearanceDiameterMm})),closedBlend:1-claspSmooth(this.unfoldProgress/.24),materialSideConvention:SOURCE_SIDE_NOTE};
 }
 getDiagnostics(){return this.getState();}
 dispose(){
  const geometries=new Set<BufferGeometry>(),materials=new Set<{dispose:()=>void}>();
  this.group.traverse(object=>{if(object instanceof Mesh||object instanceof LineSegments){geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}else if(object instanceof Sprite)materials.add(object.material);});
  for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();for(const texture of this.textures)texture.dispose();this.group.removeFromParent();
 }
}
