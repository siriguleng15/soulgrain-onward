/** Deterministic real-pattern mesh / reversible mapping checks.
 * node scripts/pattern/check_mesh.mjs [path-to-pattern-mm.json]
 * --unit-only uses an explicitly synthetic concave fixture, never product data.
 */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildPatternMesh} from '../../src/pattern-engineering/mesh.ts';
import {deformMesh,RecommendedDeformationParams,getMeshValidation,getReferencePointPosition,getConstraintResiduals} from '../../src/pattern-engineering/deformation.ts';
import {anchorAtTriangle,anchorFrom3D,mapFlatToSurface,mapAnchor} from '../../src/pattern-engineering/mapping.ts';
import {PHOTO_DEFORMATION_HYPOTHESIS} from '../../src/pattern-engineering/photo-fit.ts';

const unit=process.argv.includes('--unit-only');
const fixture={schemaVersion:1,units:'mm',bounds:{min:[0,0],max:[220,240],width:220,height:240},boundary:[[0,0],[110,0],[220,0],[220,70],[130,70],[110,150],[100,240],[0,240],[8,120],[0,0]],holes:[{id:'unit-through-hole',center:[90,180],radiusMm:2,role:'eyelet'},{id:'unit-mark',center:[40,50],radiusMm:1.5,role:'internal-mark'}],structureLines:[]};
const input=unit?null:(process.argv[2]??'public/pattern-engineering/data/pattern-mm.json');
const pattern=unit?fixture:JSON.parse(await readFile(input,'utf8'));
const mesh=buildPatternMesh(pattern,{maxEdgeMm:unit?8:4});
const params=RecommendedDeformationParams(pattern);
const result={input:input??'Synthetic concave algorithm fixture; NOT a product outline',units:'mm',checks:[]};
function pass(name,detail){result.checks.push({name,passed:true,...(detail?{detail}:{})});console.log('PASS',name);}
const digest=(a)=>createHash('sha256').update(new Uint8Array(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
const initialFlat=digest(mesh.flatMm),initialIndices=digest(mesh.indices),initialIds=digest(mesh.vertexIds);
assert.equal(mesh.vertexIds.length,mesh.flatMm.length/2);for(let i=0;i<mesh.vertexIds.length;i++)assert.equal(mesh.vertexIds[i],i);
pass('Fixed original planar vertex identities and one indexed topology');

const area=points=>Math.abs(points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p[0]*q[1]-p[1]*q[0];},0))/2;
let meshArea=0,maxEdge=0;
const edges=new Map();
for(let i=0;i<mesh.indices.length;i+=3){
 const p=[0,1,2].map(j=>[mesh.flatMm[mesh.indices[i+j]*2],mesh.flatMm[mesh.indices[i+j]*2+1]]);
 const a=area(p);assert.ok(a>1e-12);meshArea+=a;
 for(let j=0;j<3;j++){const a=mesh.indices[i+j],b=mesh.indices[i+(j+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`;edges.set(key,(edges.get(key)??0)+1);maxEdge=Math.max(maxEdge,Math.hypot(p[j][0]-p[(j+1)%3][0],p[j][1]-p[(j+1)%3][1]));}
}
const holeArea=mesh.holeVertexIds.reduce((s,h)=>s+area([...h.indices].map(id=>[mesh.flatMm[id*2],mesh.flatMm[id*2+1]])),0);
const expectedArea=area(pattern.boundary)-holeArea;
assert.ok(Math.abs(meshArea-expectedArea)<expectedArea*1e-9);
assert.ok(maxEdge<=mesh.construction.maxEdgeMm*(1+1e-9));
assert.ok([...edges.values()].every(n=>n===1||n===2));
const usedVertices=new Set(mesh.indices);
assert.equal(usedVertices.size,mesh.vertexIds.length);
assert.equal(usedVertices.size-edges.size+mesh.indices.length/3,1-mesh.holeVertexIds.length);
pass('Real cut outline minus disclosed measured/approximated apertures, conforming edges, no orphan mesh stations',{areaMm2:meshArea,maxEdgeMm:maxEdge,holes:mesh.holeVertexIds.length});

const flat=deformMesh(mesh,0,params),flatValidation=getMeshValidation(mesh,flat);
assert.equal(flatValidation.flatReturnErrorMm,0);assert.equal(flatValidation.referenceBoundaryErrorMm,0);assert.ok(flatValidation.maximumPrincipalStrain<1e-6);
assert.equal(flatValidation.degenerateTriangles,0);assert.equal(flatValidation.finite,true);
pass('Exact flat return, source outline identity, and zero flat strain',flatValidation);

const folded=deformMesh(mesh,1,params),half=deformMesh(mesh,.5,params);
assert.ok(folded.every(Number.isFinite)&&half.every(Number.isFinite));assert.notEqual(digest(folded),digest(flat));
assert.equal(folded.length,flat.length);assert.equal(initialIndices,digest(mesh.indices));
pass('Flat, intermediate and folded states share identical vertex and triangle identities');

for(let i=0;i<100;i++){deformMesh(mesh,1,params);const back=deformMesh(mesh,0,params);assert.equal(digest(back),digest(flat));}
assert.equal(digest(mesh.flatMm),initialFlat);assert.equal(digest(mesh.indices),initialIndices);assert.equal(digest(mesh.vertexIds),initialIds);
pass('100 complete fold/expand cycles have exactly zero accumulated coordinate drift');

let seed=0x6f6e7761;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
let maxRoundtripMm=0;
for(let i=0;i<300;i++){
 const triangle=Math.floor(random()*mesh.indices.length/3);const a=random(),b=random(),weights=a+b>1?[1-a,1-b,a+b-1]:[a,b,1-a-b];
 const anchor=anchorAtTriangle(mesh,folded,triangle,weights);const back=anchorFrom3D(mesh,folded,triangle,anchor.formedMm);assert.ok(back);
 maxRoundtripMm=Math.max(maxRoundtripMm,Math.hypot(...back.flatMm.map((v,k)=>v-anchor.flatMm[k])));
 const other=mapAnchor(mesh,half,anchor);assert.equal(other.triangle,triangle);assert.deepEqual(other.barycentric,anchor.barycentric);
 const fromFlat=mapFlatToSurface(mesh,folded,anchor.flatMm);assert.ok(fromFlat);assert.ok(Math.hypot(...fromFlat.formedMm.map((v,k)=>v-anchor.formedMm[k]))<1e-5);
}
assert.ok(maxRoundtripMm<1e-5);
pass('300 seeded triangle/barycentric picks map 3-D → original 2-D → 3-D without model switching',{maxRoundtripMm});

const through=mesh.holeVertexIds[0];
if(through){
 const hole=pattern.holes.find(h=>h.id===through.id);assert.equal(mapFlatToSurface(mesh,folded,hole.center),null);
 const reference=getReferencePointPosition(mesh,hole.center,1,params);assert.ok(reference.every(Number.isFinite));
 const residual=getConstraintResiduals(mesh,folded,[{id:'hole-reference',flatMm:hole.center,formedMm:reference,radiusMm:25,enabled:false}],params)[0];
 assert.equal(residual.referenceOnly,true);assert.equal(residual.onSurface,false);assert.ok(residual.residualMm<1e-8);
 pass('Empty eyelet centres remain non-installable while reference features still follow the fold');
}

const centreTriangle=Math.floor(mesh.indices.length/6),source=anchorAtTriangle(mesh,folded,centreTriangle,[.2,.3,.5]);
const constraints=[{id:'unit-explicit-photo-hypothesis',flatMm:source.flatMm,formedMm:source.formedMm.map((v,k)=>v+[5,-3,2][k]),radiusMm:25,weight:1,enabled:true,confidence:'photo-estimated'}];
const adjusted=deformMesh(mesh,1,{...params,landmarkStrength:1},constraints);
const adjustedFlat=deformMesh(mesh,0,{...params,landmarkStrength:1},constraints);
assert.equal(digest(adjustedFlat),digest(flat));assert.equal(digest(mesh.flatMm),initialFlat);assert.equal(digest(mesh.indices),initialIndices);
assert.notEqual(digest(adjusted),digest(folded));
const residual=getConstraintResiduals(mesh,adjusted,constraints,{...params,landmarkStrength:1});
assert.ok(residual[0].residualMm<Math.hypot(5,3,2));
pass('Explicit photo constraint layer changes only formed state, preserves exact flat, and reports residual',{residualMm:residual[0].residualMm});

const diagnostic=getMeshValidation(mesh,folded);assert.equal(diagnostic.selfIntersectionCheck,'not-performed');assert.equal(diagnostic.finite,true);
pass('Deformation metrics disclose strain, projection reversals and unperformed collision analysis',diagnostic);
if(!unit){
 const photoParams={...PHOTO_DEFORMATION_HYPOTHESIS};
 const photoFold=deformMesh(mesh,1,photoParams),photoValidation=getMeshValidation(mesh,photoFold);
 assert.ok(photoValidation.finite);assert.equal(photoValidation.degenerateTriangles,0);
 assert.ok(photoValidation.maximumPrincipalStrain<.05,'Current photo folding hypothesis exceeds its disclosed 5% discrete strain bound.');
 for(let i=0;i<=20;i++)assert.ok(deformMesh(mesh,i/20,photoParams).every(Number.isFinite));
 pass('Photo-default hypothesis is finite throughout 21 fold states; no collapsed final triangles; strain remains explicitly bounded',photoValidation);
 result.photoHypothesis={parameters:photoParams,validation:photoValidation,scope:'Discrete surface metric only. A <5% numerical bound is NOT evidence of recoverable manufacturing folds or installable coordinates.'};
}
result.mesh={vertices:mesh.vertexIds.length,triangles:mesh.indices.length/3,flatSHA256:initialFlat,indexSHA256:initialIndices,parameters:params,validation:diagnostic};
result.geometryPrecisionNote='These checks validate indexed mapping and deterministic coordinates. They do NOT establish the correctness of the assumed manufacturing fold or the photograph registration.';
const output=unit?'/tmp/onward-pattern-mesh-unit.json':'public/pattern-engineering/data/mesh-validation.json';
await mkdir(output.slice(0,output.lastIndexOf('/')),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:result.checks.length,output,vertices:mesh.vertexIds.length,triangles:mesh.indices.length/3},null,2));
