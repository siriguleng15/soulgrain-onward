// Meaningful geometry invariants and truthful failure cases for E–I.
// Read-only: no website/model changes, no dependencies or network access.
import assert from 'node:assert/strict';
import './geometry-data.js';
const G = globalThis.ClaspGeometry;
const original = JSON.stringify(G.presets);
await import('./advanced-geometry.js');
const A = globalThis.ClaspAdvanced;
const near = (a,b,e=1e-7) => assert.ok(Math.abs(a-b)<=e, `${a} != ${b}`);
const pointNear = (a,b,e=1e-7) => near(G.distance(a,b),0,e);
const get = (id) => G.presets.find((p)=>p.id===id);
assert.equal(JSON.stringify(G.presets.slice(0,4)), original, 'A–D must not change');
assert.deepEqual(G.presets.map((p)=>p.id),['A','B','C','D','E','F','G','H','I']);
for(const p of A.presets){
  assert.equal(p.clasps.length,2);
  assert.equal(p.evaluation.length,5);
  for(const key of ['intent','decision','manufacturing','marketing'])assert.equal(typeof p[key],'string');
  const analysis=A.analysis(p,p.clasps);
  assert.ok(analysis.relationSatisfied, `${p.id}: initial geometry should hold`);
  const svg=A.renderGuides(p);
  assert.ok(svg.includes('advanced-construction'));
  assert.ok(!/NaN|undefined|Infinity/.test(svg),`${p.id}: invalid SVG number`);
  // Merely moving a real part must not leave a false "exact relation" claim.
  const moved=p.clasps.map((c)=>({...c}));moved[0].x+=7;
  assert.equal(A.analysis(p,moved).relationSatisfied,false,`${p.id}: moved constraint`);
  const rotated=p.clasps.map((c)=>({...c}));rotated[0].angle+=3;
  assert.equal(A.analysis(p,rotated).relationSatisfied,false,`${p.id}: rotated constraint`);
}

// E: three genuinely different root rectangles use one origin and width.
const roots=A.constructions.rootRectangles;
for(const r of roots){
  near(r.width/r.height,Math.sqrt(r.root));
  pointNear(r.origin,A.constructions.gaps[0]);
  near(G.dot(r.e,r.n),0);
  near(G.dot(G.sub(r.corners[1],r.perpendicularFoot),r.diagonal),0,1e-6);
  near(r.footParameter,r.root/(r.root+1));
  for(let i=0;i<2;i++){
    near(A.helpers.lineDistance(r.centers[i],i?r.corners[3]:r.origin,r.e),0);
    near(A.helpers.lineDistance(r.centers[i],G.boundaryStart,G.boundaryVector),0);
  }
}
assert.equal(roots[0].screening.valid,true);
assert.ok(roots[0].screening.warnings.some((s)=>s.includes('净距')),'√2 near-eye risk must stay visible');
assert.equal(roots[1].screening.valid,false,'√3 collision is a retained result');
assert.equal(roots[2].screening.valid,false,'√5 collision is a retained result');

// F: real 36/72/72 triangle and real 36/36/108 gnomon, not arbitrary labels.
const tr=A.constructions.triangle;
const angleBetween=(a,b)=>Math.acos(Math.max(-1,Math.min(1,G.dot(a,b)/(Math.hypot(a.x,a.y)*Math.hypot(b.x,b.y)))))*180/Math.PI;
near(angleBetween(G.sub(tr.B,tr.A),G.sub(tr.C,tr.A)),36);
near(angleBetween(G.sub(tr.A,tr.B),G.sub(tr.C,tr.B)),72);
near(angleBetween(G.sub(tr.A,tr.C),G.sub(tr.B,tr.C)),72);
near(G.distance(tr.A,tr.B)/G.distance(tr.B,tr.C),G.phi);
near(angleBetween(G.sub(tr.A,tr.D),G.sub(tr.B,tr.D)),108);
near(G.distance(tr.A,tr.B)/G.distance(tr.A,tr.D),G.phi);
const fCheck=G.validateLayout(get('F').clasps);
assert.equal(fCheck.valid,false,'Mathematical triangle is not a successful manufacturing layout');
assert.ok(fCheck.errors.some((s)=>s.includes('鞋身孔2')));
assert.ok(fCheck.warnings.some((s)=>s.includes('相交')));

// G: two auxiliary-circle intersections really are on both circles, whose
// centres are the ACTUAL small heads; small heads themselves are separated.
const v=A.constructions.vesica;
pointNear(v.heads[0],G.anchors(get('G').clasps[0]).body);
pointNear(v.heads[1],G.anchors(get('G').clasps[1]).body);
near(v.radius,G.distance(v.heads[0],v.heads[1]));
for(const j of v.intersections)for(const h of v.heads)near(G.distance(j,h),v.radius);
near(G.dot(G.sub(v.heads[1],v.heads[0]),G.sub(v.intersections[0],v.intersections[1])),0,1e-5);
assert.ok(v.physicalGap>0,'Entity heads are not a Vesica overlap');
for(const c of get('G').clasps)near(A.helpers.angleDelta(c.angle,v.chordAngle),0);

// H: verify the actual end-to-end legs, angle, and source-seed lines.
for(const [i,c]of get('H').clasps.entries()){
  const e=G.anchors(c),delta=G.sub(e.body,e.cuff),k=c.length/5;
  near(delta.x,4*k);near(delta.y,3*k);near(G.distance(e.body,e.cuff),5*k);
  near(c.angle,Math.atan2(3,4)*180/Math.PI);
  near(A.helpers.lineDistance(c,A.constructions.gaps[i],A.constructions.eH),0);
}

// I: reference lines were seeded before solving length; actual head circles
// are tangent to them. They are auxiliary offsets, not the original finite S.
for(const [i,t]of A.constructions.tangentGuides.entries()){
  const c=get('I').clasps[i],e=G.anchors(c);
  pointNear(e.cuff,t.seed);
  near(G.dot(G.sub(t.referencePoint,t.seed),A.constructions.nS),t.delta);
  near(c.length,(t.delta+c.headRadius)/G.dot(A.constructions.eH,A.constructions.nS));
  near(G.pointSegmentDistance(e.body,...t.segment),c.headRadius);
  near(G.distance(e.body,t.touch),c.headRadius);
  near(A.helpers.lineParameter(t.touch,t.segment[0],G.sub(t.segment[1],t.segment[0])),.5);
  assert.ok(t.originalSeamHeadClearance>4,'Actual finite source S is not the tangent line');
}
const resized=get('I').clasps.map((c)=>({...c}));resized[0].headRadius+=2;
assert.equal(A.analysis(get('I'),resized).relationSatisfied,false,'Changing actual head size breaks fixed tangency');
for(const id of ['G','H','I']){const check=G.validateLayout(get(id).clasps);assert.equal(check.valid,true,id);assert.equal(check.warnings.length,0,id);}
console.log('PASS: A–D unchanged; E root ratios/intersections and retained near-hole/collision cases; F true golden triangles plus rejected structural collision; G actual-head-centred auxiliary Vesica; H real endpoint 3:4:5; I seeded-offset tangency; 11 manual-constraint-break checks; finite SVG output.');
for(const p of A.presets){const q=A.analysis(p,p.clasps);console.log(`${p.id}: geometry=${q.relationSatisfied}; valid=${q.screening.valid}; errors=${q.screening.errors.length}; warnings=${q.screening.warnings.length}`);}
