import type { Barycentric, PatternMesh, SurfaceAnchor, Vec2, Vec3 } from './types.ts';

export function barycentric2D(point:Vec2,a:Vec2,b:Vec2,c:Vec2):[number,number,number]|null {
  const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
  if(Math.abs(den)<1e-14)return null;
  const u=((b[1]-c[1])*(point[0]-c[0])+(c[0]-b[0])*(point[1]-c[1]))/den;
  const v=((c[1]-a[1])*(point[0]-c[0])+(a[0]-c[0])*(point[1]-c[1]))/den;
  return [u,v,1-u-v];
}

export function anchorAtTriangle(mesh:PatternMesh,positionsMm:ArrayLike<number>,triangle:number,barycentric:Barycentric):SurfaceAnchor {
  if(!Number.isInteger(triangle)||triangle<0||triangle*3+2>=mesh.indices.length)throw Error('Unknown triangle identity.');
  if(positionsMm.length!==mesh.flatMm.length/2*3)throw Error('Deformed vertex buffer does not share the reference topology.');
  const sum=barycentric[0]+barycentric[1]+barycentric[2];
  if(!Number.isFinite(sum)||Math.abs(sum-1)>1e-7||barycentric.some(v=>v<-.000001||v>1.000001))throw Error('Barycentric anchor is outside this triangle.');
  const flatMm:[number,number]=[0,0],formedMm:[number,number,number]=[0,0,0];
  for(let j=0;j<3;j++) {
    const id=mesh.indices[triangle*3+j],w=barycentric[j];
    flatMm[0]+=mesh.flatMm[id*2]*w;flatMm[1]+=mesh.flatMm[id*2+1]*w;
    for(let k=0;k<3;k++)formedMm[k]+=positionsMm[id*3+k]*w;
  }
  return {triangle,barycentric:[...barycentric],flatMm,formedMm};
}

export function mapFlatToSurface(mesh:PatternMesh,positionsMm:ArrayLike<number>,point:Vec2):SurfaceAnchor|null {
  for(let i=0;i<mesh.indices.length;i+=3) {
    const a=mesh.indices[i]*2,b=mesh.indices[i+1]*2,c=mesh.indices[i+2]*2;
    const bary=barycentric2D(point,[mesh.flatMm[a],mesh.flatMm[a+1]],[mesh.flatMm[b],mesh.flatMm[b+1]],[mesh.flatMm[c],mesh.flatMm[c+1]]);
    if(bary&&bary.every(v=>v>=-1e-9&&v<=1+1e-9)) {
      const clamped=bary.map(v=>Math.max(0,Math.min(1,v)));const sum=clamped.reduce((x,y)=>x+y,0);
      return anchorAtTriangle(mesh,positionsMm,i/3,clamped.map(v=>v/sum) as [number,number,number]);
    }
  }
  return null;
}

/** A raycast must supply triangle identity. Position alone is ambiguous when
 * the cuff overlaps the body; identity is retained through the fold. */
export function anchorFrom3D(mesh:PatternMesh,positionsMm:ArrayLike<number>,triangle:number,point:Vec3):SurfaceAnchor|null {
  const ids=[0,1,2].map(i=>mesh.indices[triangle*3+i]);
  if(ids.some(id=>id===undefined))return null;
  const a=ids.map(id=>[positionsMm[id*3],positionsMm[id*3+1],positionsMm[id*3+2]]);
  const v0=a[1].map((x,k)=>x-a[0][k]),v1=a[2].map((x,k)=>x-a[0][k]),v2=point.map((x,k)=>x-a[0][k]);
  const dot=(u:number[],v:number[])=>u.reduce((sum,x,k)=>sum+x*v[k],0);
  const d00=dot(v0,v0),d01=dot(v0,v1),d11=dot(v1,v1),d20=dot(v2,v0),d21=dot(v2,v1),den=d00*d11-d01*d01;
  if(Math.abs(den)<1e-16)return null;
  const v=(d11*d20-d01*d21)/den,w=(d00*d21-d01*d20)/den;
  const weights=[1-v-w,v,w];if(weights.some(x=>x<-.00001||x>1.00001))return null;
  const clamped=weights.map(x=>Math.max(0,Math.min(1,x))),sum=clamped.reduce((x,y)=>x+y,0);
  return anchorAtTriangle(mesh,positionsMm,triangle,clamped.map(x=>x/sum) as [number,number,number]);
}

/** Re-evaluate an already selected material point in any state. */
export function mapAnchor(mesh:PatternMesh,positionsMm:ArrayLike<number>,anchor:Pick<SurfaceAnchor,'triangle'|'barycentric'>) {
  return anchorAtTriangle(mesh,positionsMm,anchor.triangle,anchor.barycentric);
}

export function distanceToPatternEdge(mesh:PatternMesh,point:Vec2) {
  let distance=Infinity;
  const p=mesh.pattern.boundary;
  for(let i=0;i<p.length;i++) {
    const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
    const t=den?Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/den)):0;
    distance=Math.min(distance,Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy));
  }
  return distance;
}
