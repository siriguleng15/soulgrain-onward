import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {goldenQuarterArcs,templatePointToPhoto,photoPointToTemplate,claspOverlaySvg,claspProcessOverlaySvg,CLASP_PROCESS_STEPS,cutPlan} from '../../src/pattern-engineering/clasp-geometry.ts';
const data=JSON.parse(await readFile(new URL('../../public/pattern-engineering/data/clasp-design.json',import.meta.url),'utf8'));
const arcs=goldenQuarterArcs();
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(let i=0;i<arcs.length;i++){
 assert.ok(Math.abs(distance(arcs[i].start,arcs[i].center)-arcs[i].radius)<1e-12);
 if(i)assert.ok(distance(arcs[i-1].end,arcs[i].start)<1e-12,'Adjacent quarter circles must be continuous');
}
assert.ok(distance(arcs[3].end,arcs[4].center)>.14);
assert.ok(Math.abs(distance(arcs[3].end,arcs[4].center)-arcs[4].radius)<1e-12,'Fourth endpoint is on fifth supporting circle, not its center');
for(const template of data.golden.templates){
 for(const q of [[0,0],[1,1],[1.618,.25],[-.2,1.3]])assert.ok(distance(q,photoPointToTemplate(template,templatePointToPhoto(template,q)))<1e-10);
 assert.ok(template.observedCenterToFifthCircleCenterPx<4);
 assert.ok(template.observedCenterToFourthEndPx>20);
 assert.ok(Math.abs(template.observedAspect-(1+Math.sqrt(5))/2)<.005);
}
assert.equal(data.defaultLayout,'observed');assert.equal(data.constraintCandidate.enabledByDefault,false);
assert.equal(data.golden.centerDefinition.userConfirmed,true);
assert.equal(data.golden.centerDefinition.confirmedDefinition,'fifth-arc-supporting-circle-center');
assert.equal(data.golden.centerDefinition.defaultCenterSource,'observed-blue-circle');
for(const clasp of data.observed.clasps){assert.equal(clasp.physical.snapAppearanceDiameterMm,12);assert.equal(clasp.physical.puWidthMm,null);assert.ok(clasp.circleToStripMidpointErrorPx>4);}
for(const clasp of data.constraintCandidate.clasps){const midpoint=clasp.bodyFixedEndPhoto.map((v,i)=>(v+clasp.cuffFixedEndPhoto[i])/2);assert.ok(distance(midpoint,clasp.centerPhoto)<1e-6);}
const empty=cutPlan({bodyAnchorToSnapArcMm:null,cuffAnchorToSnapArcMm:null,puWidthMm:null,overlapMm:null,bodySeamAllowanceMm:null,cuffSeamAllowanceMm:null,symmetricOverlapConfirmed:false,surfaceAssumptionsVerified:false});
assert.equal(empty.bodyPieceCutMm,null);assert.equal(empty.productionReady,false);
const specified=cutPlan({bodyAnchorToSnapArcMm:52,cuffAnchorToSnapArcMm:70,puWidthMm:9,overlapMm:10,bodySeamAllowanceMm:6,cuffSeamAllowanceMm:8,symmetricOverlapConfirmed:true,surfaceAssumptionsVerified:false});
assert.equal(specified.bodyPieceCutMm,63);assert.equal(specified.cuffPieceCutMm,83);assert.equal(specified.productionReady,false);
assert.ok(claspOverlaySvg(data).includes('data-preset-diameter-mm="12"'));
assert.ok(claspOverlaySvg(data,{candidate:true}).includes('未经定稿'));
assert.equal(CLASP_PROCESS_STEPS.length,9);
for (const item of CLASP_PROCESS_STEPS) {
 assert.ok(claspProcessOverlaySvg(data,item.step).length>0);
 assert.equal(item.reference.slice(0,2),String(item.step+3).padStart(2,'0'));
}
const countClasps=step=>(claspProcessOverlaySvg(data,step).match(/data-preset-diameter-mm/g)||[]).length;
assert.equal(countClasps(4),0); assert.equal(countClasps(5),1);assert.equal(countClasps(6),1);assert.equal(countClasps(7),2);assert.equal(countClasps(8),2);
assert.ok(!claspProcessOverlaySvg(data,8).includes('fill="#f4f1e7"'));
assert.ok(claspProcessOverlaySvg(data,9).includes('fill="#f4f1e7"'));
console.log('PASS actual photo fits, continuous quarter-circle construction, invertible template transform, source-preserving default, physical-input export guards');
