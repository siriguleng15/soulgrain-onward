/** Checks real-pattern projection identities. Photo-fit residuals are in-sample
 * agreement with assumed eyelets, not independent engineering validation. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {buildPatternMesh} from '../../src/pattern-engineering/mesh.ts';
import {deformMesh} from '../../src/pattern-engineering/deformation.ts';
import {anchorAtTriangle,mapAnchor} from '../../src/pattern-engineering/mapping.ts';
import {DEFAULT_PHOTO_REGISTRATION as reg,PHOTO_DEFORMATION_HYPOTHESIS as params,worldToPhoto,photoToWorld,photoProjectionFrame,projectPhotoToSurface,eyeletResiduals} from '../../src/pattern-engineering/photo-fit.ts';
const pattern=JSON.parse(await readFile('public/pattern-engineering/data/pattern-mm.json','utf8'));
const mesh=buildPatternMesh(pattern,{maxEdgeMm:4}),positions=deformMesh(mesh,1,params),flat=deformMesh(mesh,0,params),checks=[];
function pass(name,detail){checks.push({name,passed:true,detail});console.log('PASS',name);}
let maxInverseErrorMm=0;
for(let i=0;i<100;i++){const p=[i*2.1,i*1.4];const q=photoToWorld(worldToPhoto(p,reg),reg);maxInverseErrorMm=Math.max(maxInverseErrorMm,Math.hypot(q[0]-p[0],q[1]-p[1]));}
assert.ok(maxInverseErrorMm<1e-10);pass('Axis camera registration round-trip', {maxInverseErrorMm});
let maxAnchorErrorMm=0;
for(let i=0;i<100;i++){
 const triangle=Math.floor((mesh.indices.length/3-1)*i/100),source=anchorAtTriangle(mesh,positions,triangle,[.2,.3,.5]),pixel=worldToPhoto(source.formedMm,reg);
 const hits=projectPhotoToSurface(mesh,positions,pixel,reg,params,'any');
 assert.ok(hits.candidates.length>0);
 const same=hits.candidates.reduce((best,h)=>Math.hypot(h.anchor.flatMm[0]-source.flatMm[0],h.anchor.flatMm[1]-source.flatMm[1])<Math.hypot(best.anchor.flatMm[0]-source.flatMm[0],best.anchor.flatMm[1]-source.flatMm[1])?h:best);
 maxAnchorErrorMm=Math.max(maxAnchorErrorMm,Math.hypot(same.anchor.flatMm[0]-source.flatMm[0],same.anchor.flatMm[1]-source.flatMm[1]));
 const returned=mapAnchor(mesh,flat,same.anchor);assert.ok(Math.hypot(returned.formedMm[0]-same.anchor.flatMm[0],returned.formedMm[1]-same.anchor.flatMm[1],returned.formedMm[2])<1e-10);
}
assert.ok(maxAnchorErrorMm<1e-6);pass('100 real-pattern triangle points survive photo projection and exact flat remapping',{maxAnchorErrorMm});
const nohit=projectPhotoToSurface(mesh,positions,[-10000,-10000],reg,params,'any');assert.equal(nohit.anchor,null);pass('Unmapped photograph pixels remain null; no nearest fabric fallback');
const design=JSON.parse(await readFile('public/pattern-engineering/data/clasp-design.json','utf8'));
const fixed=[];
for(const clasp of design.observed.clasps){
 for(const [layer,pixel] of [['body',clasp.bodyFixedEndPhoto],['cuff',clasp.cuffFixedEndPhoto]]){
  const hit=projectPhotoToSurface(mesh,positions,pixel,reg,params,layer);
  fixed.push({id:clasp.id,layer,photoPx:pixel,mapped:!!hit.anchor,triangle:hit.anchor?.triangle??null,flatMm:hit.anchor?.flatMm??null,ambiguity:hit.ambiguous,warnings:hit.warnings});
 }
 for(const layer of ['body','cuff']){
  const hit=projectPhotoToSurface(mesh,positions,clasp.centerPhoto,reg,params,layer);
  fixed.push({id:clasp.id,layer,kind:'snap-projection',photoPx:clasp.centerPhoto,mapped:!!hit.anchor,flatMm:hit.anchor?.flatMm??null,ambiguity:hit.ambiguous,warnings:hit.warnings});
 }
}
pass('Observed clasp points keep explicit layer identity and projection status',{points:fixed});
const residuals=eyeletResiduals(mesh,params,reg);assert.equal(residuals.count,12);assert.ok(residuals.rmsPx<11&&residuals.rmsPx>10);pass('Provisional photograph fit discloses 12 assumed eyelet matches and in-sample residuals',residuals);
const output={schemaVersion:1,productionReady:false,source:'03-shoe-side-original.jpg',method:'A provisional circular-band fold and separate X/Y display scales were fitted to 12 manually assumed eyelet correspondences. E06 was excluded. This is not a solved inverse sewing/lasting process.',params,registration:reg,frameMm:photoProjectionFrame(reg),checks,residuals,claspProjections:fixed,limitations:['Single oblique photograph does not uniquely determine hidden fold geometry.','Paper lower lasting edge and complete shoe silhouette were not fitted or validated.','Eyelet match identities are assumptions and require physical confirmation.','Inverse-projected surface coordinates depend on the current hypothesis and are not certified factory installation coordinates.','This is in-sample camera/fold fitting; there is no independent hold-out photograph.']};
await writeFile('public/pattern-engineering/data/photo-fit-validation.json',JSON.stringify(output,null,2)+'\n');
