import { ShapeUtils, Vector2 } from 'three';
import type { PatternData, PatternMesh, Vec2 } from './types.ts';

const distanceSquared = (a: Vec2, b: Vec2) => (a[0]-b[0])**2+(a[1]-b[1])**2;
const edgeKey = (a: number, b: number) => a < b ? `${a}:${b}` : `${b}:${a}`;
const cross=(a:Vec2,b:Vec2,c:Vec2)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const CLEANUP_MM=1e-7;

function cleanRing(points: readonly Vec2[]) {
  const result: [number,number][]=[];
  for (const p of points) {
    if (!p.every(Number.isFinite)) throw Error('Pattern boundary contains a non-finite coordinate.');
    if (!result.length || distanceSquared(result[result.length-1],p)>1e-16) result.push([p[0],p[1]]);
  }
  if (result.length>1&&distanceSquared(result[0],result[result.length-1])<1e-16) result.pop();
  if (result.length<3) throw Error('A calibrated, nonempty real pattern boundary is required.');
  return result;
}

/** Pixel samples collinear under a projective calibration can differ by
 * ~1e-14 mm numerically. Do not turn those straight stations into zero-area
 * ear triangles. The original measured polylines remain in pattern data. */
function simplifyCollinear(points:[number,number][]) {
  let current=points;
  for(let round=0;round<8;round++){
    const next=current.filter((p,i)=>{
      const a=current[(i+current.length-1)%current.length],b=current[(i+1)%current.length];
      const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
      if(!length)return false;
      const t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length;
      return !(t>0&&t<1&&Math.abs(cross(a,b,p))/Math.sqrt(length)<CLEANUP_MM);
    });
    if(next.length<3)throw Error('A measured contour collapsed during numerical straight-station cleanup.');
    if(next.length===current.length)return next;
    current=next;
  }
  return current;
}

function isSimpleRing(ring:readonly Vec2[]) {
  const eps=1e-9;
  for(let i=0;i<ring.length;i++)for(let j=i+1;j<ring.length;j++){
    if(j===i+1||(i===0&&j===ring.length-1))continue;
    const a=ring[i],b=ring[(i+1)%ring.length],c=ring[j],d=ring[(j+1)%ring.length];
    const on=(p:Vec2,q:Vec2,r:Vec2)=>Math.abs(cross(p,q,r))<eps&&r[0]>=Math.min(p[0],q[0])-eps&&r[0]<=Math.max(p[0],q[0])+eps&&r[1]>=Math.min(p[1],q[1])-eps&&r[1]<=Math.max(p[1],q[1])+eps;
    if((cross(a,b,c)*cross(a,b,d)<-eps&&cross(c,d,a)*cross(c,d,b)<-eps)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b))return false;
  }
  return true;
}

function triangleQuality(a:Vec2,b:Vec2,c:Vec2){
  const ab=distanceSquared(a,b),bc=distanceSquared(b,c),ca=distanceSquared(c,a),twiceArea=cross(a,b,c);
  return twiceArea*twiceArea/Math.max(ab*bc,bc*ca,ca*ab,1e-30);
}

/** Lawson-style max-min-angle flips. Only an interior diagonal of a convex
 * quadrilateral can move; all real outline and hole segments stay fixed. */
function improveQuality(triangles:number[][],vertices:Vec2[],passes=12){
  let flips=0;
  for(let pass=0;pass<passes;pass++){
    const edges=new Map<string,[number,number,number][]>();
    triangles.forEach((t,i)=>{for(let e=0;e<3;e++){const a=t[e],b=t[(e+1)%3],key=edgeKey(a,b),entry=edges.get(key)??[];entry.push([i,a,b]);edges.set(key,entry);}});
    let changed=0;
    for(const entries of edges.values()){
      if(entries.length!==2)continue;
      const [i,a,b]=entries[0],j=entries[1][0],t1=triangles[i],t2=triangles[j];
      if(!t1.includes(a)||!t1.includes(b)||!t2.includes(a)||!t2.includes(b))continue;
      const c=t1.find(id=>id!==a&&id!==b)!,d=t2.find(id=>id!==a&&id!==b)!;
      if(c===d)continue;
      const A=vertices[a],B=vertices[b],C=vertices[c],D=vertices[d];
      if(cross(A,B,C)*cross(A,B,D)>1e-18||cross(C,D,A)*cross(C,D,B)>=-1e-20)continue;
      const before=Math.min(triangleQuality(A,B,C),triangleQuality(A,B,D));
      const after=Math.min(triangleQuality(C,D,A),triangleQuality(C,D,B));
      if(after<=before*(1+1e-6)+1e-14)continue;
      const n1=[c,d,a],n2=[d,c,b];
      if(cross(vertices[n1[0]],vertices[n1[1]],vertices[n1[2]])<0)[n1[1],n1[2]]=[n1[2],n1[1]];
      if(cross(vertices[n2[0]],vertices[n2[1]],vertices[n2[2]])<0)[n2[1],n2[2]]=[n2[2],n2[1]];
      triangles[i]=n1;triangles[j]=n2;changed++;
    }
    flips+=changed;if(!changed)break;
  }
  return flips;
}

/** Relax interior sampling stations without moving any cut/hole boundary.
 * A proposed move must improve its local minimum angle and retain every
 * incident triangle orientation. These are sampling locations, not measured
 * garment landmarks; identities become immutable after buildPatternMesh. */
function relaxInterior(triangles:number[][],vertices:[number,number][],passes=2){
  const edges=new Map<string,number>(),near=new Map<number,Set<number>>(),incident=new Map<number,number[]>();
  triangles.forEach((t,i)=>t.forEach((a,e)=>{const b=t[(e+1)%3],key=edgeKey(a,b);edges.set(key,(edges.get(key)??0)+1);const n=near.get(a)??new Set<number>();n.add(b);n.add(t[(e+2)%3]);near.set(a,n);const f=incident.get(a)??[];f.push(i);incident.set(a,f);}));
  const fixed=new Set<number>();for(const [key,count]of edges)if(count===1)key.split(':').forEach(v=>fixed.add(Number(v)));
  for(let pass=0;pass<passes;pass++)for(const [id,neighbors]of near){
    if(fixed.has(id))continue;
    const old=vertices[id],mean=[0,0];for(const jof of neighbors){mean[0]+=vertices[jof][0]/neighbors.size;mean[1]+=vertices[jof][1]/neighbors.size;}
    const faces=incident.get(id)!;const before=Math.min(...faces.map(i=>triangleQuality(vertices[triangles[i][0]],vertices[triangles[i][1]],vertices[triangles[i][2]])));
    for(const fraction of [.75,.35,.1]){
      vertices[id]=[old[0]+(mean[0]-old[0])*fraction,old[1]+(mean[1]-old[1])*fraction];
      const after=Math.min(...faces.map(i=>{const t=triangles[i];return cross(vertices[t[0]],vertices[t[1]],vertices[t[2]])>1e-12?triangleQuality(vertices[t[0]],vertices[t[1]],vertices[t[2]]):-1;}));
      if(after>before*(1+1e-5)){break;}
      vertices[id]=old;
    }
  }
}

export function pointInPolygon(point: Vec2, polygon: readonly Vec2[]) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[i],b=polygon[j];
    if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}

/** Triangulate the real outline, then split shared edges conformingly.
 * Midpoints lie exactly on their original edge; no new outline is invented. */
export function buildPatternMesh(pattern: PatternData, options: {maxEdgeMm?:number;holeSegments?:number}={}): PatternMesh {
  if(pattern.units!=='mm') throw Error('Only calibrated millimetre patterns are accepted.');
  if(!(pattern.bounds.width>0&&pattern.bounds.height>0))throw Error('Calibrated pattern bounds must have positive millimetre extents.');
  const maxEdgeMm=Math.max(3,Math.min(20,options.maxEdgeMm??8));
  const holeSegments=Math.max(12,Math.min(64,Math.round(options.holeSegments??24)));
  const contour=simplifyCollinear(cleanRing(pattern.boundary));
  const holes: [number,number][][]=[];
  const holeIds:string[]=[];
  const warnings:string[]=[];
  let holeChordErrorMm=0;
  for(const hole of pattern.holes) {
    if(hole.role!=='eyelet'&&!hole.throughHole) continue;
    if(!Number.isFinite(hole.radiusMm)||hole.radiusMm<=0) {warnings.push(`${hole.id}: hole radius is not established; retained only as a mark.`);continue;}
    const measuredRing=hole.boundary&&hole.boundary.length>=3?simplifyCollinear(cleanRing(hole.boundary)):null;
    const measured=measuredRing!==null&&isSimpleRing(measuredRing);
    if(measuredRing&&!measured)warnings.push(`${hole.id}: photograph aperture contour self-touches or crosses itself (interrupted aperture). Mesh uses the calibrated observed centre/radius circle; original measured contour is preserved in the paper data, NOT certified as the cut-hole shape.`);
    const ring=measured?measuredRing!:Array.from({length:holeSegments},(_,i):[number,number]=>[hole.center[0]+hole.radiusMm*Math.cos(i*Math.PI*2/holeSegments),hole.center[1]+hole.radiusMm*Math.sin(i*Math.PI*2/holeSegments)]);
    if(!ring.every(p=>pointInPolygon(p,contour))) {warnings.push(`${hole.id}: proposed hole is not entirely inside the cut boundary; retained only as a mark.`);continue;}
    holes.push(ring);holeIds.push(hole.id);
    if(!measured){holeChordErrorMm=Math.max(holeChordErrorMm,hole.radiusMm*(1-Math.cos(Math.PI/holeSegments)));warnings.push(`${hole.id}: no usable simple measured hole contour; a ${holeSegments}-segment observed-radius approximation is used.`);}
  }
  const vertices:[number,number][]=[...contour,...holes.flat()];
  const boundaryVertexIds=Uint32Array.from(contour.map((_,i)=>i));
  const boundarySourceIndices=Uint32Array.from(contour.map(p=>pattern.boundary.findIndex(q=>q[0]===p[0]&&q[1]===p[1])));
  let offset=contour.length;
  const holeVertexIds=holes.map((ring,i)=>{const ids=Uint32Array.from(ring.map((_,j)=>offset+j));offset+=ring.length;return{id:holeIds[i],indices:ids};});
  let triangles=ShapeUtils.triangulateShape(contour.map(p=>new Vector2(...p)),holes.map(r=>r.map(p=>new Vector2(...p))));
  if(!triangles.length) throw Error('The supplied real outline could not be triangulated.');
  // Earcut may omit an exactly collinear contour station. Reinsert it on its
  // containing edge so every original outline station keeps an indexed vertex
  // identity, including after a nonlinear fold.
  const used=new Set(triangles.flat());
  for(let id=0;id<vertices.length;id++) {
    if(used.has(id))continue;
    const p=vertices[id];let found:[number,number]|null=null;
    for(const t of triangles){
      for(let e=0;e<3;e++){
        const a=vertices[t[e]],b=vertices[t[(e+1)%3]],dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
        const along=length?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/length:-1;
        if(along>1e-10&&along<1-1e-10&&Math.abs(dx*(p[1]-a[1])-dy*(p[0]-a[0]))/Math.sqrt(length)<1e-8){found=[t[e],t[(e+1)%3]];break;}
      }
      if(found)break;
    }
    if(!found)throw Error(`A source boundary station ${id} at ${p.join(',')} could not be retained in the indexed mesh; inspect the outline for self-intersections.`);
    const key=edgeKey(...found),next:number[][]=[];
    for(const t of triangles){
      const e=[0,1,2].find(e=>edgeKey(t[e],t[(e+1)%3])===key);
      if(e===undefined)next.push(t);
      else{const a=t[e],b=t[(e+1)%3],c=t[(e+2)%3];next.push([a,id,c],[id,b,c]);}
    }
    triangles=next;used.add(id);
  }
  // Normalize orientation once. Vertex identity never changes after this build.
  triangles=triangles.map(([a,b,c])=>{
    const p=vertices[a],q=vertices[b],r=vertices[c];
    return (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0])>=0?[a,b,c]:[a,c,b];
  });
  let qualityEdgeFlips=improveQuality(triangles,vertices,18);
  let refinementRounds=0;
  for(;refinementRounds<16;refinementRounds++) {
    const split=new Map<string,number>();
    for(const t of triangles) for(let i=0;i<3;i++) {
      const a=t[i],b=t[(i+1)%3],key=edgeKey(a,b);
      if(!split.has(key)&&distanceSquared(vertices[a],vertices[b])>maxEdgeMm**2*(1+1e-12)) {
        split.set(key,vertices.length);vertices.push([(vertices[a][0]+vertices[b][0])/2,(vertices[a][1]+vertices[b][1])/2]);
      }
    }
    if(!split.size) break;
    const next:number[][]=[];
    for(const [a,b,c] of triangles) {
      const ab=split.get(edgeKey(a,b)),bc=split.get(edgeKey(b,c)),ca=split.get(edgeKey(c,a));
      const count=Number(ab!==undefined)+Number(bc!==undefined)+Number(ca!==undefined);
      if(count===0) next.push([a,b,c]);
      else if(count===3) next.push([a,ab!,ca!],[ab!,b,bc!],[ca!,bc!,c],[ab!,bc!,ca!]);
      else if(count===1) {
        if(ab!==undefined) next.push([a,ab,c],[ab,b,c]);
        else if(bc!==undefined) next.push([b,bc,a],[bc,c,a]);
        else next.push([c,ca!,b],[ca!,a,b]);
      } else {
        if(ab===undefined) next.push([c,ca!,bc!],[ca!,a,b],[ca!,b,bc!]);
        else if(bc===undefined) next.push([a,ab,ca!],[ab,b,c],[ab,c,ca!]);
        else next.push([b,bc,ab],[bc,c,a],[bc,a,ab]);
      }
    }
    triangles=next;
    qualityEdgeFlips+=improveQuality(triangles,vertices,8);
    relaxInterior(triangles,vertices,2);
    qualityEdgeFlips+=improveQuality(triangles,vertices,4);
    if(vertices.length>150_000) throw Error('Pattern refinement exceeds the mobile review budget. Increase maxEdgeMm.');
  }
  if(refinementRounds===16) warnings.push('Maximum refinement rounds reached; inspect remaining long edges.');
  return {flatMm:Float64Array.from(vertices.flat()),indices:Uint32Array.from(triangles.flat()),vertexIds:Uint32Array.from(vertices.map((_,i)=>i)),boundaryVertexIds,boundarySourceIndices,holeVertexIds,pattern,bounds:pattern.bounds,
    construction:{method:'Measured cut contours; observed-hole contours or disclosed interrupted-hole circle approximation; constrained triangulation, interior quality relaxation, conforming refinement',maxEdgeMm,refinementRounds,holeChordErrorMm,collinearCleanupToleranceMm:CLEANUP_MM,qualityEdgeFlips,warnings}};
}
