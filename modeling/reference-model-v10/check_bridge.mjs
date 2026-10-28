/** Synthetic actual-surface fixture + real paper; not physical product validation. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const {Group,Mesh,PlaneGeometry,MeshBasicMaterial,DoubleSide}=await import('three');
const {createModelBridge,interpolateFittedShell,shellPickToPaper}=await import('../../src/reference-model/bridge.ts');
const pattern=JSON.parse(await readFile('public/pattern-engineering/data/pattern-mm.json','utf8'));
const group=new Group();
for(const [name,role,x,y,z,w,h] of [['body','body',150,50,0,400,100],['cuff','cuff',150,150,0,400,100],['strap','excluded',250,50,-2,10,10]]){const m=new Mesh(new PlaneGeometry(w,h,2,2),new MeshBasicMaterial({side:DoubleSide}));m.name=name;m.position.set(x,y,z);m.userData.bridgeRole=role;group.add(m);}
const reg={widthPx:1280,heightPx:894,originXPx:1194.51801232,originYPx:794.9725273,pixelsPerUnitX:3.62713332,pixelsPerUnitY:4.13137166,rightWorld:[-1,0,0],upWorld:[0,1,0],viewDirectionWorld:[0,0,1],units:'model-unit',assumption:'Explicit synthetic two-plane algorithm fixture, NOT product geometry.'};
const bridge=createModelBridge(pattern,group,reg);
for(const [point,layer] of [[[164.38,79.16],'body'],[[77.2,189],'cuff']]){const pair=bridge.paperToModel(point);assert.ok(pair.paper&&pair.actual);assert.equal(pair.actual.role,layer);assert.ok(pair.projectionResidualPx<1e-7);const back=bridge.modelToPaper(pair.actual);assert.ok(back.paper);assert.ok(Math.hypot(...back.paper.flatMm.map((x,i)=>x-point[i]))<1e-7);assert.ok(bridge.mapModelAnchor(pair.actual));assert.equal(bridge.mapModelAnchor({...pair.actual,geometrySignature:'wrong'}),null);}
const invalid=bridge.paperToModel([-100,-100]);assert.equal(invalid.actual,null);assert.equal(invalid.photoPixel,null);
const pixel=[600,470];assert.equal(bridge.photoToModel(pixel,'body').anchor.meshName,'body');assert.equal(bridge.photoToModel(pixel,'cuff').anchor,null);
const cuffPixel=[reg.originXPx-80*reg.pixelsPerUnitX,reg.originYPx-150*reg.pixelsPerUnitY];assert.equal(bridge.photoToModel(cuffPixel,'cuff').anchor.meshName,'cuff');
const blockedPixel=[reg.originXPx-250*reg.pixelsPerUnitX,reg.originYPx-50*reg.pixelsPerUnitY];const blocked=bridge.photoToModel(blockedPixel,'body');assert.equal(blocked.anchor,null);assert.ok(blocked.warnings.some(w=>w.includes('不可见面料')));
const unknownRoot=new Group();const unknown=new Mesh(new PlaneGeometry(400,400),new MeshBasicMaterial({side:DoubleSide}));unknown.position.set(150,100,0);unknownRoot.add(unknown);const strict=createModelBridge(pattern,unknownRoot,reg,{paperMesh:bridge.paperMesh});assert.equal(strict.photoToModel(pixel).anchor,null);
bridge.dispose();strict.dispose();
console.log('PASS actual bridge algorithm fixture: independent identities, visible body/cuff filtering, foreground hardware blocks hidden cloth, unknown stays null, exact numerical roundtrip, invalid source/anchor rejected. NOT physical validation.');

if(process.argv.includes('--actual')){
  const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
  const root='public/reference-model-v10/';
  const model=await readFile(root+'corrected.glb');
  const metadata=JSON.parse(await readFile(root+'model-data.json','utf8'));
  const report=JSON.parse(await readFile(root+'bridge-data.json','utf8'));
  const sourceProject=JSON.parse(await readFile('public/pattern-engineering/exports/ONWARD-project.json','utf8'));
  const digest=createHash('sha256').update(model).digest('hex');
  assert.equal(report.modelSha256,digest);
  const loaded=await new GLTFLoader().parseAsync(model.buffer.slice(model.byteOffset,model.byteOffset+model.byteLength),'');
  // Match the review renderer's material sidedness without changing geometry.
  loaded.scene.traverse(node=>{if(node.isMesh)for(const material of Array.isArray(node.material)?node.material:[node.material])material.side=DoubleSide;});
  const actualBridge=createModelBridge(pattern,loaded.scene,metadata.photoRegistration);
  const checks=[];const pass=(name,detail)=>{checks.push({name,passed:true,detail});console.log('PASS actual product:',name);};
  let checkedAnchors=0,maxStaticAnchorDifference=0,maxRuntimeHitDifference=0;
  const shell=report.fittedPaperShell;
  assert.ok(shell&&shell.mappedVertexCount>0,'Actual cloth coverage is required; fixture coverage cannot replace it.');
  const examples=report.visibleClothExamples??[];
  const anchors=[...report.points.map(p=>p.actual),...examples.map(p=>p.actual),...shell.actualAnchors.filter((_,i)=>i%17===0)].filter(Boolean);
  for(const anchor of anchors){
    const current=actualBridge.mapModelAnchor(anchor);
    assert.ok(current,`Static GLTF identity must resolve through the real loader: ${anchor.meshPath} ${anchor.meshName}`);
    maxStaticAnchorDifference=Math.max(maxStaticAnchorDifference,Math.hypot(...current.modelPosition.map((x,i)=>x-anchor.modelPosition[i])));
    checkedAnchors++;
  }
  assert.ok(maxStaticAnchorDifference<1e-6);
  pass('Static object paths, exact vertex/index fingerprints and barycentric anchors match actual GLTFLoader',{checkedAnchors,maxStaticAnchorDifferenceModelUnits:maxStaticAnchorDifference});
  for(const point of [...report.points,...examples]){
    const hit=actualBridge.photoToModel(point.photoPixel,point.layer);
    assert.equal(!!hit.anchor,!!point.actual,`Static/runtime visibility differs for ${point.id}`);
    if(hit.anchor)maxRuntimeHitDifference=Math.max(maxRuntimeHitDifference,Math.hypot(...hit.anchor.modelPosition.map((x,i)=>x-point.actual.modelPosition[i])));
  }
  assert.ok(maxRuntimeHitDifference<1e-6);
  pass('Actual reference-point visibility and ray hits agree; occluded points remain null',{mapped:report.mappedCount,total:report.totalPoints,maxRuntimeHitDifferenceModelUnits:maxRuntimeHitDifference});
  assert.ok(examples.length>0&&examples.every(p=>p.kind==='visible-cloth-example-not-installation'&&p.label.includes('非扣件定位')));
  pass('Visible-cloth demonstration samples are explicitly separate from the eight installation references',{exampleCount:examples.length,installationCount:report.points.length,exampleKinds:[...new Set(examples.map(p=>p.kind))]});
  assert.deepEqual(shell.sourceFlatMm,sourceProject.vertexIdentity.flatMm);
  assert.deepEqual(shell.sourceVertexIds,sourceProject.vertexIdentity.vertexIds);
  assert.deepEqual(shell.sourceTriangleIndices,sourceProject.vertexIdentity.triangleIndices);
  assert.equal(shell.sourceVertexCount,8453);
  let pickChecks=0;
  for(let i=0;i<shell.visibleOriginalTriangleIds.length;i+=Math.max(1,Math.floor(shell.visibleOriginalTriangleIds.length/100))){
    const sourceTriangle=shell.visibleOriginalTriangleIds[i];
    assert.deepEqual(shell.visibleTriangleIndices.slice(i*3,i*3+3),shell.sourceTriangleIndices.slice(sourceTriangle*3,sourceTriangle*3+3));
    assert.ok(shell.visibleTriangleIndices.slice(i*3,i*3+3).every(id=>shell.mappedVertexMask[id]));
    const pick=shellPickToPaper(shell,i,[.2,.3,.5]);assert.ok(pick);assert.equal(pick.triangle,sourceTriangle);pickChecks++;
  }
  const t0=interpolateFittedShell(shell,0),t1=interpolateFittedShell(shell,1);
  assert.ok(t0.every(Number.isFinite)&&t1.every(Number.isFinite));
  for(let cycle=0;cycle<100;cycle++){interpolateFittedShell(shell,1);assert.deepEqual(interpolateFittedShell(shell,0),t0);}
  assert.deepEqual(shell.sourceFlatMm,sourceProject.vertexIdentity.flatMm);
  pass('Actual visible-shell subset retains original paper topology and restores flat display without drift',{vertices:shell.sourceVertexCount,mappedVertices:shell.mappedVertexCount,drawnSourceTriangles:shell.visibleOriginalTriangleIds.length,totalSourceTriangles:shell.sourceTriangleCount,pickChecks,cycles:100,sourceFlatMmUnchanged:true});
  const validation={schemaVersion:1,testedAt:new Date().toISOString(),environment:'Node.js GLTFLoader + actual corrected GLB and real calibrated paper; not physical shoe or Safari testing',modelSha256:digest,paperProjectSha256:report.paperProjectSha256,checks,productionReady:false,limitations:['Photo registration and paper forming remain assumptions; numerical identity does not establish physical accuracy.','Only visible explicitly labelled cloth receives anchors; no hidden support cloth is fabricated.','Model units are not independently calibrated millimetres.','Linear shell interpolation is correspondence display, not a reconstructed sewing process.']};
  await writeFile(root+'bridge-validation.json',JSON.stringify(validation,null,2)+'\n');
  actualBridge.dispose();
}
