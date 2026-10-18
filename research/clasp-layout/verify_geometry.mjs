// Mathematical invariants and negative interference cases; no site/model writes.
import assert from 'node:assert/strict';
import './geometry-data.js';
import './shoe-trace.js';
const G=globalThis.ClaspGeometry, T=globalThis.ShoeTrace;
const near=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e, `${a} ≠ ${b}`);
for(const p of G.presets){
 const v=G.validateLayout(p.clasps);
 assert.ok(v.valid, `${p.id}: ${v.errors.join('; ')}`);
 assert.equal(v.warnings.length, ['A','D'].includes(p.id)?1:0, `${p.id}: ${v.warnings}`);
 assert.equal(p.clasps.length,2);
 for(const [i,c] of p.clasps.entries()){
  const a=G.anchors(c),check=v.results[i];
  assert.ok(Number.isFinite(check.clearances.footprintSeam));
  near(G.distance(a.cuff,a.body),c.length);
  assert.ok(check.cuffSigned<0 && check.bodySigned>0,'Anchors must bridge R');
  assert.ok(G.insidePolygon(a.cuff,G.regions.cuff));
  assert.ok(G.insidePolygon(a.body,G.regions.body));
  assert.ok(check.clearances.nearestEye.clearance>=4);
 }
}
const [a,b,c,d]=G.presets;
near(G.metrics(a.clasps).stationT[0],G.phi**-2);
near(G.metrics(a.clasps).stationT[1],G.phi**-1);
const sp=G.spiral;
near(G.distance(sp.pointAt(Math.PI/2),sp.center)/G.distance(sp.pointAt(0),sp.center),G.phi);
for(let i=0;i<2;i++){
 near(G.distance(sp.pointAt(i?sp.delta:0),b.clasps[i]),0);
 near(b.clasps[i].angle,sp.normalAngle(i?sp.delta:0));
 near(c.clasps[i].angle,G.seamAngle);
 const v=G.sub(c.clasps[i],c.guides.gaps[i]);
 near(G.cross(v,c.guides.direction),0,1e-6);
 near(d.clasps[i].angle,G.soleAngle);
}
// Never accept a two-clasp stack, placement inside a hole, reversed anchors,
// or an out-of-garment placement as a successful layout.
assert.equal(G.validateLayout([c.clasps[0],{...c.clasps[0]}]).valid,false);
assert.equal(G.validate({...c.clasps[0],x:475,y:368}).valid,false);
assert.equal(G.validate({...c.clasps[0],angle:c.clasps[0].angle+180}).valid,false);
assert.equal(G.validate({...c.clasps[0],x:1050,y:700}).valid,false);
assert.equal(G.validate({...c.clasps[0],length:0}).valid,false);
// Finite seam segments must not be treated as infinite lines, and the round
// head must participate in clearance checks rather than only its anchor.
const probe={x:0,y:0,angle:0,length:100,width:20,headRadius:12};
near(G.segmentRectangleDistance({x:-20,y:20},{x:20,y:20},probe),10);
near(G.segmentRectangleDistance({x:-100,y:0},{x:100,y:0},probe),0);
near(G.segmentRectangleDistance({x:100,y:30},{x:150,y:30},probe),Math.hypot(50,20));
near(G.segmentRectangleDistance({x:0,y:30},{x:0,y:30},probe),20);
near(G.segmentClaspDistance({x:50,y:5},{x:80,y:5},probe),-7);
assert.equal(T.source.width,G.referenceSize.width);
assert.equal(T.source.height,G.referenceSize.height);
assert.equal(T.eyelets.length,G.eyelets.length);
T.eyelets.forEach((eye,i)=>{near(eye.x,G.eyelets[i].x);near(eye.y,G.eyelets[i].y);});
assert.ok(G.validate(a.clasps[0]).clearances.footprintSeam<4);
assert.ok(G.validate(d.clasps[0]).clearances.footprintSeam<4);
console.log('PASS: four presets; anchor/region/eyelet checks; golden stations; exact spiral; seam/sole alignment; five invalid cases; finite-segment and round-head distances; trace-coordinate agreement.');
