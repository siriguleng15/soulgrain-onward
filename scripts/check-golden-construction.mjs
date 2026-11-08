import{readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import ts from'typescript';
import{pathToFileURL}from'node:url';
import path from'node:path';
import assert from'node:assert/strict';
const input=await readFile('src/golden-derivation/construction.ts','utf8');
const compiled=ts.transpileModule(input,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace(/from 'three'/g,`from '${pathToFileURL(path.resolve('node_modules/three/build/three.module.js')).href}'`);
await writeFile('/tmp/golden-construction-test.mjs',compiled);
const{Construction,goldenArcs,PHI,SOURCE_SHA,spiralProgress,pathSample,proofState,PROOF_STARTS,ARC_START,ARC_END,ANIMATION_VERSION,DURATION}=await import('file:///tmp/golden-construction-test.mjs?'+Date.now());
const data=JSON.parse(await readFile('public/golden-derivation/construction.json','utf8')),raw=await readFile('public/golden-derivation/xiezitu.glb');
assert.equal(createHash('sha256').update(raw).digest('hex'),SOURCE_SHA);assert.equal(data.sourceSha256,SOURCE_SHA);assert.equal(raw.length,33432084);
const jsonSize=raw.readUInt32LE(12),doc=JSON.parse(raw.subarray(20,20+jsonSize)),bin=raw.subarray(28+jsonSize);
const primitive=doc.meshes[0].primitives[0],pa=doc.accessors[primitive.attributes.POSITION],pv=doc.bufferViews[pa.bufferView];
const positions=new Float32Array(bin.buffer,bin.byteOffset+(pv.byteOffset??0)+(pa.byteOffset??0),pa.count*3);
let error=0;
for(const a of data.seam.anchors){
 assert.ok(a.barycentric.every(v=>v>=-1e-7&&v<=1+1e-7));assert.ok(Math.abs(a.barycentric.reduce((a,b)=>a+b,0)-1)<1e-8);
 for(let k=0;k<3;k++){const p=a.ids.reduce((s,id,i)=>s+positions[id*3+k]*a.barycentric[i],0);error=Math.max(error,Math.abs(p-a.point[k]));}
}assert.ok(error<1e-10);
const c=new Construction(data),r=c.rectangle();
const width=r.points[0].distanceTo(r.points[1]),height=r.points[1].distanceTo(r.points[2]);
assert.ok(Math.abs(width/height-PHI)<1e-12);assert.ok(Math.abs(c.e.dot(c.v))<1e-12);
assert.equal(data.revision,'1.1');assert.equal(data.calibration.contactEyeletNumber,4);
const eye4=data.calibration.eyelets.find(e=>e.numberFromToe===4).point;
assert.ok(Math.abs(c.p.x-eye4[0])<1e-12);assert.ok(c.p.y<eye4[1]);
assert.ok(c.golden[0].points[0].distanceTo(c.p)<1e-10);assert.ok(c.golden[1].points[0].distanceTo(c.q)<1e-10);
const startDelta=c.golden[1].points[0].clone().sub(c.p);
assert.ok(Math.abs(startDelta.dot(c.e))<1e-12);assert.ok(Math.abs(startDelta.dot(c.v)-height)<1e-12);
for(let i=0;i<c.golden[0].points.length;i++){
 const a=c.golden[0].points[i].clone().sub(c.p),b=c.golden[1].points[i].clone().sub(c.p);
 assert.ok(Math.abs(a.dot(c.e)-b.dot(c.e))<1e-12);
 assert.ok(Math.abs(a.dot(c.v)+b.dot(c.v)-height)<1e-12);
}
let seamJoin=0,tangentJoin=0;
const arcs=goldenArcs();for(let i=1;i<arcs.length;i++){
 const a=arcs[i-1],b=arcs[i];
 const end=[a.center.x+Math.cos(a.b)*a.radius,a.center.y+Math.sin(a.b)*a.radius],start=[b.center.x+Math.cos(b.a)*b.radius,b.center.y+Math.sin(b.a)*b.radius];
 seamJoin=Math.max(seamJoin,Math.hypot(end[0]-start[0],end[1]-start[1]));tangentJoin=Math.max(tangentJoin,Math.abs(Math.cos(a.b)-Math.cos(b.a)),Math.abs(Math.sin(a.b)-Math.sin(b.a)));
}assert.ok(seamJoin<1e-10);assert.ok(tangentJoin<1e-10);
let last=-1;for(let i=0;i<=1000;i++){const t=spiralProgress(i/1000);assert.ok(t>=last);last=t;for(const p of c.golden){const s=pathSample(p,t);assert.ok([...s.point.toArray(),...s.tangent.toArray()].every(Number.isFinite));}}
// Independent ruler/compass and recursive-rectangle identities.
const midpoint=.5,diagonal=Math.hypot(1,.5),constructedWidth=midpoint+diagonal;
assert.ok(Math.abs(constructedWidth-PHI)<1e-14);
assert.ok(Math.abs(PHI-1-1/PHI)<1e-14);
let rectangle=[0,0,PHI,1],squareArea=0;
for(let i=0;i<arcs.length;i++){
 const a=arcs[i],[sx,sy,side]=a.square,[x,y,w,h]=rectangle;
 assert.ok(Math.abs(side-Math.min(w,h))<1e-12);
 assert.ok(Math.abs(side-PHI**-i)<1e-12);
 assert.ok(sx>=x-1e-12&&sy>=y-1e-12&&sx+side<=x+w+1e-12&&sy+side<=y+h+1e-12);
 assert.ok(Math.abs(a.a-a.b-Math.PI/2)<1e-12);
 assert.ok([sx,sx+side].some(v=>Math.abs(v-a.center.x)<1e-12));
 assert.ok([sy,sy+side].some(v=>Math.abs(v-a.center.y)<1e-12));
 if(i%4===0)rectangle=[x+side,y,w-side,h];
 if(i%4===1)rectangle=[x,y,w,h-side];
 if(i%4===2)rectangle=[x,y,w-side,h];
 if(i%4===3)rectangle=[x,y+side,w,h-side];
 squareArea+=side*side;
 assert.ok(Math.abs(Math.max(rectangle[2],rectangle[3])/Math.min(rectangle[2],rectangle[3])-PHI)<1e-10);
 assert.ok(Math.abs(squareArea+rectangle[2]*rectangle[3]-PHI)<1e-12);
}
for(const start of PROOF_STARTS){
 for(const [at,stage]of[[.4,'unit'],[1.2,'midpoint'],[2.2,'compass'],[4,'ratio'],[6,'partition'],[13.5,'prepare'],[18,'arc'],[23.9,'complete']])assert.equal(proofState(start+at).stage,stage);
 let previous=0;
 for(let i=0;i<=200;i++){
  const t=start+ARC_START+(ARC_END-ARC_START)*i/200,state=proofState(t);
  assert.ok(state.progress>=previous);previous=state.progress;
  const a=arcs[state.arcIndex];assert.ok(state.arcFraction>=0&&state.arcFraction<=1);
  assert.ok(Math.abs((a.a+(a.b-a.a)*state.arcFraction)-a.a)<=Math.PI/2+1e-10);
 }
 assert.ok(Math.abs(proofState(start+ARC_END).progress-1)<1e-12);
}
assert.equal(DURATION,73);
const report={passed:true,revision:ANIMATION_VERSION,geometryRevision:data.revision,standardConstruction:{passed:true,unitSquareMidpoint:true,compassRadius:diagonal,constructedWidth,recursivelySimilarGoldenRectangles:8,quarterCircleRadii:arcs.map(a=>a.radius),degreesPerArc:90,constructionBeforeArcs:true,deterministicTimeline:true},contactEyeletNumber:4,contactBelowFourthEyelet:true,firstStart:c.p.toArray(),secondStart:c.q.toArray(),secondStartOnCyanLowerEnd:true,mirroredAcrossMidline:true,sourceSha256:SOURCE_SHA,sourceBytes:raw.length,sourceVertices:pa.count,sourceTriangles:doc.accessors[primitive.indices].count/3,surfaceAnchors:data.seam.anchors.length,surfaceReconstructionMaxError:error,rectangleAspect:width/height,phi:PHI,frameOrthogonalityError:Math.abs(c.e.dot(c.v)),arcEndpointContinuityError:seamJoin,arcTangentContinuityError:tangentJoin,tangencyFit:data.validation,notes:data.notes};
await mkdir('public/golden-derivation/verification',{recursive:true});await writeFile('public/golden-derivation/verification/geometry-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
