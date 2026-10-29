/** Real-pattern/full-panel acceptance checks. Chromium emulation is not Safari. */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const repo=process.cwd(),asset=path.join(repo,'public/detachable-side-panel');
const out=asset+'/verification',scratch='/tmp/onward-detachable-qa-'+Date.now(),downloads=scratch+'/downloads';
const url=process.argv.find(a=>a.startsWith('http'))??'http://127.0.0.1:4330/soulgrain-onward/onward-side-unfold/detachable-side.html';
const checks=[],errors=[],failedRequests=[],badResponses=[],downloadEvents=[];
const check=(name,passed,detail)=>{checks.push({name,passed,detail:structuredClone(detail)});if(!passed)throw Error(name+': '+JSON.stringify(detail));console.log('PASS',name);};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const close=(a,b,epsilon=1e-10)=>Math.abs(a-b)<=epsilon;
await mkdir(out,{recursive:true});await mkdir(downloads,{recursive:true});

/** Independent least-squares affine plane fit. Orthogonal equal-length axes
 * establish a single uniform scale; this catches a sheared/anisotropic flat
 * endpoint even if its own declared matrix incorrectly claims exactness. */
function planeFit(flat,world){
 const n=flat.length/2,meanQ=[0,0],meanP=[0,0,0];
 for(let i=0;i<n;i++){for(let k=0;k<2;k++)meanQ[k]+=flat[i*2+k]/n;for(let k=0;k<3;k++)meanP[k]+=world[i*3+k]/n;}
 let xx=0,xy=0,yy=0;const xp=[0,0,0],yp=[0,0,0];
 for(let i=0;i<n;i++){const x=flat[i*2]-meanQ[0],y=flat[i*2+1]-meanQ[1];xx+=x*x;xy+=x*y;yy+=y*y;for(let k=0;k<3;k++){xp[k]+=x*(world[i*3+k]-meanP[k]);yp[k]+=y*(world[i*3+k]-meanP[k]);}}
 const det=xx*yy-xy*xy;assert.ok(Math.abs(det)>1e-9);
 const a=xp.map((x,k)=>(x*yy-yp[k]*xy)/det),b=yp.map((y,k)=>(y*xx-xp[k]*xy)/det);
 const length=v=>Math.hypot(...v),scale=(length(a)+length(b))/2;
 let maxResidual=0;
 for(let i=0;i<n;i++){const q=[flat[i*2]-meanQ[0],flat[i*2+1]-meanQ[1]],r=[0,1,2].map(k=>world[i*3+k]-(meanP[k]+a[k]*q[0]+b[k]*q[1]));maxResidual=Math.max(maxResidual,length(r));}
 return{scale,xAxis:a,yAxis:b,axisLengthDifference:Math.abs(length(a)-length(b)),orthogonality:Math.abs(a.reduce((s,x,k)=>s+x*b[k],0))/(scale*scale),maxResidualModelUnits:maxResidual,maxResidualMm:maxResidual/scale};
}
function edgeAudit(indices){const edges=new Map();for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++){const a=indices[i+j],b=indices[i+(j+1)%3],key=a<b?a+':'+b:b+':'+a;edges.set(key,(edges.get(key)??0)+1);}const boundary=[...edges.entries()].filter(([,n])=>n===1).map(([k])=>k.split(':').map(Number)),adj=new Map();for(const[a,b]of boundary){for(const[u,v]of[[a,b],[b,a]]){const list=adj.get(u)??[];list.push(v);adj.set(u,list);}}let loops=0;const visited=new Set();for(const vertex of adj.keys()){if(visited.has(vertex))continue;loops++;const queue=[vertex];while(queue.length){const id=queue.pop();if(visited.has(id))continue;visited.add(id);for(const jof of adj.get(id)??[])queue.push(jof);}}return{boundaryEdges:boundary.length,boundaryComponents:loops,branchedBoundaryVertices:[...adj.values()].filter(x=>x.length!==2).length,nonManifoldEdges:[...edges.values()].filter(x=>x>2).length};}
function minimumArea(positions,indices){let minimum=Infinity,zero=0;for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3,u=[0,1,2].map(k=>positions[b+k]-positions[a+k]),v=[0,1,2].map(k=>positions[c+k]-positions[a+k]),area=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2;minimum=Math.min(minimum,area);if(area<1e-14)zero++;}return{minimumAreaModelUnitsSquared:minimum,degenerateTriangles:zero};}

// Static actual-product and browser checks are added below once the shared
// generated schema is finalized. Never substitute a synthetic panel fixture.
const dataBytes=await readFile(asset+'/panel-data.json');
const data=JSON.parse(dataBytes),projectBytes=await readFile('public/pattern-engineering/exports/ONWARD-project.json');
const project=JSON.parse(projectBytes),pattern=JSON.parse(await readFile('public/pattern-engineering/data/pattern-mm.json','utf8'));
const source=project.vertexIdentity,originalCount=source.flatMm.length/2,n=data.flatMm.length/2;
const modelBytes=await readFile('public/reference-model-v10/corrected.glb');
check('Real source paper and corrected model hashes match generated panel',data.source.paperProjectSha256===digest(projectBytes)&&data.source.correctedModelSha256===digest(modelBytes),{paperSha256:digest(projectBytes),modelSha256:digest(modelBytes),panelDataSha256:digest(dataBytes)});
check('Every original paper vertex and triangle identity is retained',JSON.stringify(data.flatMm.slice(0,source.flatMm.length))===JSON.stringify(source.flatMm)&&JSON.stringify(data.vertexIds.slice(0,originalCount))===JSON.stringify(source.vertexIds)&&JSON.stringify(data.source.originalTriangleIndices)===JSON.stringify(source.triangleIndices),{originalVertices:originalCount,originalTriangles:source.triangleIndices.length/3,totalVertices:n,appendedTrimAndConformityVertices:n-originalCount});
check('Full independent panel has a finite formed position for every vertex',data.formedPositions.length===n*3&&data.formedPositions.every(Number.isFinite)&&data.flatDisplayPositions.length===n*3&&data.flatDisplayPositions.every(Number.isFinite),{fullVertices:n,observed:data.observedMask.filter(Boolean).length,inferredOrDerived:data.observedMask.filter(x=>!x).length});
let maxProvenanceError=0;
for(let i=0;i<n;i++){
 const p=data.provenance[i];let expected;
 if(p.sourceVertex!==undefined)expected=source.flatMm.slice(p.sourceVertex*2,p.sourceVertex*2+2);
 else{assert.ok(Number.isInteger(p.sourceTriangle));const ids=source.triangleIndices.slice(p.sourceTriangle*3,p.sourceTriangle*3+3);assert.deepEqual(p.sourceVertexIndices,ids);assert.ok(p.barycentric.every(v=>Number.isFinite(v)&&v>=-1e-10&&v<=1+1e-10));assert.ok(close(p.barycentric.reduce((a,b)=>a+b,0),1));expected=[0,1].map(k=>ids.reduce((s,id,j)=>s+source.flatMm[id*2+k]*p.barycentric[j],0));}
 maxProvenanceError=Math.max(maxProvenanceError,Math.hypot(...expected.map((v,k)=>v-data.flatMm[i*2+k])));
}
check('Exact trim and conformity-refinement vertices retain original-triangle barycentric provenance',maxProvenanceError<1e-8,{verticesChecked:n,maximumFlatProvenanceErrorMm:maxProvenanceError});
const flatFit=planeFit(data.flatMm,data.flatDisplayPositions);
check('Flat endpoint independently fits the original paper with one uniform rigid display scale',flatFit.maxResidualMm<1e-8&&flatFit.axisLengthDifference<1e-10&&flatFit.orthogonality<1e-10&&close(flatFit.scale,data.display.mmToModelScale,1e-10),flatFit);
const area2D=(flat,indices)=>{let sum=0;for(let i=0;i<indices.length;i+=3){const a=indices[i]*2,b=indices[i+1]*2,c=indices[i+2]*2;sum+=Math.abs((flat[b]-flat[a])*(flat[c+1]-flat[a+1])-(flat[b+1]-flat[a+1])*(flat[c]-flat[a]))/2;}return sum;};
const sourceArea=area2D(source.flatMm,source.triangleIndices);
function boundaryEdges(indices){const edges=new Map();for(let i=0;i<indices.length;i+=3)for(let k=0;k<3;k++){const a=indices[i+k],b=indices[i+(k+1)%3],key=a<b?a+':'+b:b+':'+a;const e=edges.get(key);if(e)e.count++;else edges.set(key,{a,b,count:1});}return[...edges.values()].filter(e=>e.count===1).map(e=>[e.a,e.b]);}
const originalBoundary=boundaryEdges(source.triangleIndices).map(([a,b])=>[source.flatMm.slice(a*2,a*2+2),source.flatMm.slice(b*2,b*2+2)]);
function distanceToSegment(q,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy,t=length?Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/length)):0;return Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy);}
for(const variant of data.trimVariants){
 const visibleArea=area2D(data.flatMm,variant.indices),excludedArea=area2D(data.flatMm,variant.excludedIndices),audit=edgeAudit(variant.indices),line=variant.lineFlatMm;
 let maxBoundaryError=0;
 for(const[a,b]of boundaryEdges(variant.indices)){
  const q=[(data.flatMm[a*2]+data.flatMm[b*2])/2,(data.flatMm[a*2+1]+data.flatMm[b*2+1])/2];
  const distances=originalBoundary.map(([u,v])=>distanceToSegment(q,u,v));for(let i=1;i<line.length;i++)distances.push(distanceToSegment(q,line[i-1],line[i]));maxBoundaryError=Math.max(maxBoundaryError,Math.min(...distances));
 }
 check('Exact sole clipping preserves original cut/hole edges: '+variant.id,maxBoundaryError<1e-7&&Math.abs(visibleArea+excludedArea-sourceArea)<1e-6&&audit.nonManifoldEdges===0&&audit.branchedBoundaryVertices===0,{...audit,sourceAreaMm2:sourceArea,visibleAreaMm2:visibleArea,excludedAreaMm2:excludedArea,excludedAreaPercent:100*excludedArea/sourceArea,partitionAreaErrorMm2:visibleArea+excludedArea-sourceArea,maximumBoundaryOffReferenceMm:maxBoundaryError,physicalSoleBoundaryValidated:variant.validatedPhysicalSoleBoundary});
}
check('Unverified formation and sole-boundary hypotheses remain explicit',data.productionReady===false&&data.validation.trimPhysicalBoundaryValidated===false&&Array.isArray(data.assumptions)&&data.assumptions.length>=3,{defaultTrimId:data.defaultTrimId,assumptions:data.assumptions});
const {PanelEvaluator}=await import('../src/detachable-side-panel/timeline.ts');
const evaluator=new PanelEvaluator(data),start=Array.from(evaluator.evaluate(0).canonicalPositions),end=Array.from(evaluator.evaluate(1).canonicalPositions);
check('Actual evaluator returns exact canonical paper endpoint',JSON.stringify(end)===JSON.stringify(data.flatDisplayPositions),{vertices:n});
let minimum=Infinity,degenerate=0;
for(const sample of data.unfoldSamples){assert.equal(sample.positions.length,n*3);assert.ok(sample.positions.every(Number.isFinite));const audit=minimumArea(sample.positions,data.trimmedIndices);minimum=Math.min(minimum,audit.minimumAreaModelUnitsSquared);degenerate+=audit.degenerateTriangles;}
check('All same-topology unfold key poses are finite and nondegenerate',degenerate===0,{poses:data.unfoldSamples.length,minimumAreaModelUnitsSquared:minimum,degenerateTriangles:degenerate,attachedMetric:data.validation.attachedMetric});
// Inspect actual surface Jacobians, including linear intervals between stored
// poses. A merely finite triangle can still collapse or stretch dramatically.
function jacobianSetup(indices){const q=data.flatMm,rows=[];for(let t=0;t<indices.length;t+=3){const[a,b,c]=indices.slice(t,t+3),x1=q[b*2]-q[a*2],y1=q[b*2+1]-q[a*2+1],x2=q[c*2]-q[a*2],y2=q[c*2+1]-q[a*2+1],det=x1*y2-x2*y1;assert.ok(Math.abs(det)>1e-12);rows.push([a*3,b*3,c*3,x1,y1,x2,y2,1/(det*data.display.mmToModelScale)]);}return rows;}
function jacobianField(world,rows){const field=new Float64Array(rows.length*6);for(let t=0;t<rows.length;t++){const[a,b,c,x1,y1,x2,y2,reciprocal]=rows[t];for(let k=0;k<3;k++){const u=world[b+k]-world[a+k],v=world[c+k]-world[a+k];field[t*6+k]=(u*y2-v*y1)*reciprocal;field[t*6+3+k]=(v*x1-u*x2)*reciprocal;}}return field;}
function singularAt(field,i){let aa=0,bb=0,ab=0;for(let k=0;k<3;k++){const a=field[i+k],b=field[i+3+k];aa+=a*a;bb+=b*b;ab+=a*b;}const disc=Math.sqrt(Math.max(0,(aa-bb)**2+4*ab*ab));return[Math.sqrt(Math.max(0,(aa+bb-disc)/2)),Math.sqrt(Math.max(0,(aa+bb+disc)/2))];}
function stretchBounds(field){let minimumPrincipalStretch=Infinity,maximumPrincipalStretch=0;for(let i=0;i<field.length;i+=6){const[low,high]=singularAt(field,i);minimumPrincipalStretch=Math.min(minimumPrincipalStretch,low);maximumPrincipalStretch=Math.max(maximumPrincipalStretch,high);}return{minimumPrincipalStretch,maximumPrincipalStretch};}
const ordered=[...data.unfoldSamples].sort((a,b)=>a.formedAmount-b.formedAmount),variantMetricReports=[];
for(const variant of data.trimVariants){
 const rows=jacobianSetup(variant.indices),fields=ordered.map(p=>jacobianField(p.positions,rows)),samples=ordered.map((p,i)=>({formedAmount:p.formedAmount,...stretchBounds(fields[i])}));
 let continuousLower=Infinity,continuousUpper=0;
 for(let interval=0;interval+1<fields.length;interval++){
  const a=fields[interval],b=fields[interval+1],delta=b.map((v,k)=>v-a[k]),localFields=[a];
  for(const t of [.25,.5,.75]){const field=a.map((v,k)=>v+delta[k]*t);localFields.push(field);samples.push({formedAmount:ordered[interval].formedAmount+(ordered[interval+1].formedAmount-ordered[interval].formedAmount)*t,interpolated:true,...stretchBounds(field)});}localFields.push(b);
  // A 3x2 Jacobian is affine in the viewer's actual interpolation parameter.
  // Every point of [0,1] is within 1/8 of a sampled quarter. Weyl's bound
  // therefore certifies positive rank over the entire interval, per triangle.
  for(let i=0;i<a.length;i+=6){const speed=singularAt(delta,i)[1];let sampledLow=Infinity,sampledHigh=0;for(const field of localFields){const[lo,hi]=singularAt(field,i);sampledLow=Math.min(sampledLow,lo);sampledHigh=Math.max(sampledHigh,hi);}continuousLower=Math.min(continuousLower,sampledLow-speed/8);continuousUpper=Math.max(continuousUpper,sampledHigh+speed/8);}
 }
 const low=Math.min(...samples.map(p=>p.minimumPrincipalStretch)),high=Math.max(...samples.map(p=>p.maximumPrincipalStretch));
 const report={trimId:variant.id,triangles:rows.length,samples:samples.length,minimumPrincipalStretch:low,maximumPrincipalStretch:high,continuousMinimumSingularValueLowerBound:continuousLower,continuousMaximumSingularValueUpperBound:continuousUpper,poseStretch:samples,physicalClothValidation:false,doesNotTestContactOrSelfIntersections:true};variantMetricReports.push(report);
 check('Every visible triangle and interpolation interval avoids rank collapse: '+variant.id,low>.65&&high<1.5&&continuousLower>0,report);
}

for(let cycle=0;cycle<100;cycle++){evaluator.evaluate(.57);evaluator.evaluate(1);assert.deepEqual(Array.from(evaluator.evaluate(0).canonicalPositions),start);assert.deepEqual(Array.from(evaluator.evaluate(1).canonicalPositions),end);}
check('100 detach/flat/reassembly evaluations have no cumulative drift',true,{cycles:100,canonicalEndpointUnchanged:true,originalFlatIdsUnchanged:true});
const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
const loaded=await new GLTFLoader().parseAsync(modelBytes.buffer.slice(modelBytes.byteOffset,modelBytes.byteOffset+modelBytes.byteLength),'');
const sourceMeshes=new Map();function collect(o,p){if(o.isMesh)sourceMeshes.set(p,o);o.children.forEach((c,i)=>collect(c,p+'/'+i));}collect(loaded.scene,'root');
let expectedRemoved=0;
for(const mask of data.replacementMask){const mesh=sourceMeshes.get(mask.meshPath);assert.ok(mesh,'Source replacement path '+mask.meshPath);const count=mesh.geometry.index.count/3;assert.equal(count,mask.triangleCount);assert.equal(new Set(mask.removedTriangles).size,mask.removedTriangles.length);assert.ok(mask.removedTriangles.every(i=>Number.isInteger(i)&&i>=0&&i<count));expectedRemoved+=mask.removedTriangles.length;}
check('Replacement mask points at real source triangles and removes a substantial independent side',expectedRemoved>10000,{actualRemovedTriangles:expectedRemoved,originalRuntimeTriangles:[...sourceMeshes.values()].reduce((s,m)=>s+m.geometry.index.count/3,0)});
const staticReport={testedAt:new Date().toISOString(),panelDataSha256:digest(dataBytes),sourcePaperSha256:digest(projectBytes),sourceModelSha256:digest(modelBytes),checks:[...checks],productionReady:false,limitations:['A numerically exact rest endpoint does not prove a physical isometric cloth reconstruction.','Sole exclusion and hidden shape remain explicit unverified hypotheses.','No cloth material/contact or self-intersection certification is performed.']};
await writeFile(out+'/acceptance-geometry.json',JSON.stringify(staticReport,null,2)+'\n');
if(process.argv.includes('--static-only')){console.log(JSON.stringify({checks:checks.length,passed:true,staticOnly:true},null,2));process.exit(0);}

// Verify the actual editable animation, not only its download URL. Paper and
// source-model hashes alone cannot distinguish different reconstructed poses.
const exportReport=JSON.parse(await readFile(asset+'/editable-export-validation.json','utf8'));
const animationBytes=await readFile(asset+'/detachable-side.glb');
for(const file of ['detachable-side.glb','detachable-side-editable.blend']){const bytes=file.endsWith('.glb')?animationBytes:await readFile(asset+'/'+file),entry=exportReport.files[file];check('Editable asset bytes match its export manifest: '+file,bytes.length===entry.bytes&&digest(bytes)===entry.sha256,{bytes:bytes.length,sha256:digest(bytes)});}
const animationGltf=await new GLTFLoader().parseAsync(animationBytes.buffer.slice(animationBytes.byteOffset,animationBytes.byteOffset+animationBytes.byteLength),'');
animationGltf.scene.updateMatrixWorld(true);
const exportedPanelMeshes=[];animationGltf.scene.traverse(o=>{if(o.isMesh&&o.name.includes('Detachable_Real_Pattern_Side'))exportedPanelMeshes.push(o);});
check('Actual editable animation is tied to this exact full panel data',exportReport.panelDataSha256===digest(dataBytes)&&exportedPanelMeshes.length>0&&exportedPanelMeshes.every(o=>o.userData.panel_data_sha256===digest(dataBytes)),{panelDataSha256:digest(dataBytes),declaredExportPanelSha256:exportReport.panelDataSha256,exportedPanelMeshes:exportedPanelMeshes.length,animations:animationGltf.animations.length});
const {Vector3}=await import('three');
let checkedMorphVertices=0,maxMorphError=0,morphPoseCount=0;
for(const mesh of exportedPanelMeshes){
 const attrs=mesh.geometry.attributes,key=Object.keys(attrs).find(k=>k.toUpperCase()==='_PAPER_VERTEX_INDEX'),paperIndex=key&&attrs[key],position=attrs.position;
 assert.ok(paperIndex,'GLB must retain explicit canonical paper vertex identity');
 const dictionary=mesh.morphTargetDictionary??{},targets=mesh.geometry.morphAttributes.position??[];assert.ok(targets.length>=16);
 const entries=Object.entries(dictionary).filter(([name])=>/^Unfold_f/.test(name));morphPoseCount+=entries.length;
 const vertexStep=1;
 for(const[name,targetId]of entries){const f=Number.parseFloat(name.slice('Unfold_f'.length)),expected=data.unfoldSamples.find(p=>Math.abs(p.formedAmount-f)<1e-8);assert.ok(expected,'Unexpected exported morph '+name);const target=targets[targetId];
  for(let i=0;i<position.count;i+=vertexStep){const canonical=paperIndex.getX(i);assert.ok(Number.isInteger(canonical)&&canonical>=0&&canonical<n);const p=new Vector3().fromBufferAttribute(target,i);if(mesh.geometry.morphTargetsRelative)p.add(new Vector3().fromBufferAttribute(position,i));p.applyMatrix4(mesh.matrixWorld);const error=Math.hypot(p.x-expected.positions[canonical*3],p.y-expected.positions[canonical*3+1],p.z-expected.positions[canonical*3+2]);maxMorphError=Math.max(maxMorphError,error);checkedMorphVertices++;}
 }
}
check('Actual GLB morph buffers preserve paper IDs and the same analytic unfold poses',morphPoseCount>=16&&maxMorphError<3e-6&&animationGltf.animations.length>0,{morphPoseCount,checkedMorphVertices,maximumMorphErrorModelUnits:maxMorphError,physicalAccuracy:false});

const port=9257;
const browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+scratch+'/profile','about:blank'],{stdio:['ignore','ignore','ignore']});
let ws;
try{
 let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}
 if(!pages)throw Error('Chromium CDP did not start');
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let sequence=0;const pending=new Map();
 ws.onmessage=message=>{const d=JSON.parse(message.data);if(d.id){const p=pending.get(d.id);if(p){pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);else if(d.method==='Network.loadingFailed')failedRequests.push(d.params);else if(d.method==='Network.responseReceived'&&d.params.response.status>=400)badResponses.push({url:d.params.response.url,status:d.params.response.status});else if(d.method?.startsWith('Browser.download'))downloadEvents.push(d);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 const waitFor=async(expression,label,timeout=30000)=>{const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await run(expression))return;await pause(150);}throw Error('Timed out: '+label+' / '+await run('document.body.innerText.slice(0,1200)'));};
 const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
 const settle=()=>run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const shot=async name=>{await run('scrollTo(0,0)');await settle();const result=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(result.data,'base64'));};
 const tap=async(x,y)=>{await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(100);};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');
 await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await cdp('Page.navigate',{url});
 await waitFor('Boolean(window.__detachableSide?.getState().ready)','real detachable panel and corrected GLB',60000);
 await settle();
 const boot=await run('window.__detachableSide.getState()');
 const browserPanelHash=await run("(async()=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(window.__detachableSide.data))))).map(b=>b.toString(16).padStart(2,'0')).join(''))()");
 check('Browser uses this exact generated full panel data, not a stale build',browserPanelHash===digest(Buffer.from(JSON.stringify(data))),{canonicalPanelSha256:browserPanelHash});
 check('Actual full detachable panel and corrected model boot together',boot.ready&&boot.progress===0&&boot.scene.loaded&&boot.vertexCount===n&&boot.indexCount===data.trimmedIndices.length&&boot.modelSha256===digest(modelBytes),boot);
 const visibility=JSON.parse(await readFile(asset+'/hardware-visibility.json','utf8'));
 check('Actual connector layer uses only the first-visible source triangle selection',visibility.sourceModelSha256===digest(modelBytes)&&visibility.retainedCount>0&&visibility.retainedCount<visibility.candidateCount&&boot.hardware?.sourceTriangles===visibility.retainedCount,{candidateTriangles:visibility.candidateCount,retainedFirstVisibleTriangles:visibility.retainedCount,actualRenderedConnectorTriangles:boot.hardware?.sourceTriangles,sourceModelSha256:visibility.sourceModelSha256});
 const baseIndices=await run(`(()=>{const lab=window.__detachableSide,result=[];function visit(o,p){if(o.isMesh){const index=o.geometry.index;result.push({path:p,name:o.name,index:index?Array.from(index.array):null});}o.children.forEach((c,i)=>visit(c,p+'/'+i));}visit(lab.view.base.asset,'root');return result;})()`);
 let browserRemoved=0;
 for(const mask of data.replacementMask){const actual=baseIndices.find(m=>m.path===mask.meshPath),original=sourceMeshes.get(mask.meshPath);assert.ok(actual&&original);const drop=new Set(mask.removedTriangles),sourceIndex=original.geometry.index,expected=[];for(let i=0;i<sourceIndex.count/3;i++)if(!drop.has(i))for(let k=0;k<3;k++)expected.push(sourceIndex.getX(i*3+k));assert.deepEqual(actual.index,expected,'Actual draw indices must omit selected cloth, not draw an intact source side behind detached panel');browserRemoved+=drop.size;}
 check('Actual base draw buffers omit the declared original side triangles',browserRemoved===expectedRemoved&&boot.removedTriangles===expectedRemoved,{removedTriangles:browserRemoved,expectedRemovedTriangles:expectedRemoved});
 await run('window.__qaPanelGeometry=window.__detachableSide.view.panel.geometry;window.__qaPanelIndex=window.__qaPanelGeometry.index;');
 const stageGeometry=[];
 for(const[p,name]of[[0,'01-attached'],[.24,'02-detached'],[.57,'03-unfolding'],[.84,'04-flat'],[1,'05-paper-overlay']]){
  await run(`window.__detachableSide.setProgress(${p})`);await settle();
  const state=await run('(()=>{const l=window.__detachableSide,s=l.getGeometryState();return{progress:s.progress,geometryUUID:s.geometryUUID,indexCount:s.indexCount,vertexCount:s.vertexIds.length,sameGeometry:l.view.panel.geometry===window.__qaPanelGeometry,sameIndex:l.view.panel.geometry.index===window.__qaPanelIndex,panelVisible:l.view.panel.visible,flatErrorMm:l.getState().flatErrorMm};})()');
  stageGeometry.push(state);await shot(name);
 }
 check('All detach/unfold/overlay stages use the same actual geometry object and index buffer',stageGeometry.every(s=>s.geometryUUID===boot.geometryUUID&&s.sameGeometry&&s.sameIndex&&s.panelVisible&&s.vertexCount===n&&s.indexCount===data.trimmedIndices.length),stageGeometry);
 const renderedFlat=await run('window.__detachableSide.getGeometryState()'),renderFit=planeFit(data.flatMm,renderedFlat.positions);
 check('Rendered Float32 flat plane agrees with the same real millimetre pattern',renderFit.maxResidualMm<.0002&&renderFit.axisLengthDifference<1e-8&&renderFit.orthogonality<1e-6,{...renderFit,canonicalExactErrorMm:await run('window.__detachableSide.getState().flatErrorMm')});
 const drift=await run(`(()=>{const l=window.__detachableSide,initial=JSON.stringify(l.data.flatMm),ids=JSON.stringify(l.data.vertexIds),index=l.view.panel.geometry.index;for(let i=0;i<100;i++){l.view.evaluator.evaluate(.57);l.view.evaluator.evaluate(1);l.view.evaluator.evaluate(0);}l.setProgress(1);return{paperUnchanged:JSON.stringify(l.data.flatMm)===initial,idsUnchanged:JSON.stringify(l.data.vertexIds)===ids,indexSame:index===l.view.panel.geometry.index,flatErrorMm:l.getState().flatErrorMm};})()`);
 check('100 actual evaluator cycles leave source identities and rendered flat endpoint unchanged',drift.paperUnchanged&&drift.idsUnchanged&&drift.indexSame&&drift.flatErrorMm===0,drift);
 const rejected=await run('(()=>{const l=window.__detachableSide,before=l.getState().progress,result=l.setProgress(NaN);return{before,after:l.getState().progress,result};})()');
 check('Invalid progress input cannot corrupt panel state',rejected.result===false&&rejected.before===rejected.after,rejected);
 await run('window.__detachableSide.setProgress(0);void window.__detachableSide.play(1,2400);');await pause(350);await click('pause');
 const paused=await run('window.__detachableSide.getState()');await pause(300);const pausedAfter=await run('window.__detachableSide.getState()');
 check('User pause stops the one-time unfolding narrative',paused.progress>0&&paused.progress<1&&!paused.playing&&pausedAfter.progress===paused.progress,{paused:paused.progress,after:pausedAfter.progress});
 await run('window.__detachableSide.play(1,1800);window.__detachableSide.play(0,1800);window.__detachableSide.play(.57,500);');
 await waitFor('!window.__detachableSide.getState().playing','rapid narrative last target',8000);
 const interrupted=await run('window.__detachableSide.getState()');check('Rapid forward/reverse/seek interruption keeps the last requested state',close(interrupted.progress,.57,1e-10)&&interrupted.geometryUUID===boot.geometryUUID,interrupted);
 const timing=await run(`(async()=>{const l=window.__detachableSide;l.setProgress(0);let stamps=[],last=performance.now(),live=true;const frame=t=>{stamps.push(t-last);last=t;if(live)requestAnimationFrame(frame);};requestAnimationFrame(frame);const start=performance.now();await l.play(1,1200);live=false;stamps.sort((a,b)=>a-b);return{elapsedMs:performance.now()-start,frames:stamps.length,medianFrameMs:stamps[Math.floor(stamps.length/2)],p95FrameMs:stamps[Math.floor(stamps.length*.95)],progress:l.getState().progress};})()`);
 check('Complete staged animation reaches and retains the exact flat comparison state',timing.progress===1&&await run('window.__detachableSide.getState().flatErrorMm===0'),timing);
 await run('window.__detachableSide.play(0,900)');await waitFor('!window.__detachableSide.getState().playing','reverse reassembly');
 check('Reverse narrative returns the same actual panel to the attached shoe',await run('window.__detachableSide.getState().progress===0&&window.__detachableSide.getState().geometryUUID===window.__qaPanelGeometry.uuid'),null);
 // Actual emulated finger gestures on the WebGL canvas.
 await cdp('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false});await settle();
 await run('document.querySelector("[data-camera=side]").click();scrollTo(0,0)');await settle();
 const canvas=await run('(()=>{const r=window.__detachableSide.view.base.canvas().getBoundingClientRect();return{x:r.left+r.width*.5,y:Math.min(innerHeight-30,r.top+r.height*.45)};})()');
 const orbitBefore=await run('window.__detachableSide.view.base.camera.position.toArray()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x,y:canvas.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x+60,y:canvas.y+12,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(200);
 const orbitAfter=await run('window.__detachableSide.view.base.camera.position.toArray()');check('Actual single-finger touch rotates the model and independent side',JSON.stringify(orbitBefore)!==JSON.stringify(orbitAfter),{before:orbitBefore,after:orbitAfter});
 const zoomBefore=await run('window.__detachableSide.view.base.camera.zoom');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x-28,y:canvas.y,id:1},{x:canvas.x+28,y:canvas.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x-62,y:canvas.y,id:1},{x:canvas.x+62,y:canvas.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(200);
 const zoomAfter=await run('window.__detachableSide.view.base.camera.zoom');check('Actual two-finger pinch changes model zoom',zoomAfter!==zoomBefore,{before:zoomBefore,after:zoomAfter});
 await run('document.getElementById("progress").scrollIntoView({block:"center"});');await pause(80);
 const slider=await run('(()=>{const r=document.getElementById("progress").getBoundingClientRect();return{x:r.x+r.width*.3,targetX:r.x+r.width*.68,y:r.y+r.height/2};})()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:slider.x,y:slider.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:slider.targetX,y:slider.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);
 const scrub=await run('window.__detachableSide.getState()');check('Actual touch dragging the timeline seeks the same panel',scrub.progress>.55&&scrub.progress<.8&&!scrub.playing,{progress:scrub.progress,geometryUUID:scrub.geometryUUID});
 // Flat comparison is the clearest unobstructed state for reciprocal taps.
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await run('document.getElementById("auto-camera").checked=true;window.__detachableSide.view.setAutoCamera(true);window.__detachableSide.setProgress(1);scrollTo(0,0)');await settle();
 const candidate=await run(`(()=>{const l=window.__detachableSide,d=l.data,ids=d.trimmedIndices;let best,dist=Infinity;for(let t=0;t<ids.length;t+=3){const q=[0,1].map(k=>(d.flatMm[ids[t]*2+k]+d.flatMm[ids[t+1]*2+k]+d.flatMm[ids[t+2]*2+k])/3),r=(q[0]-180)**2+(q[1]-110)**2;if(r<dist){dist=r;best=q;}}return best;})()`);
 const svgPoint=await run(`(()=>{const l=window.__detachableSide,p=new DOMPoint(${candidate[0]},${pattern.bounds.height-candidate[1]}).matrixTransform(l.paperView.svg.getScreenCTM());return{x:p.x,y:p.y};})()`);
 await tap(svgPoint.x,svgPoint.y);const selection=await run('window.__detachableSide.getState().selection');
 check('Actual paper touch selects a corresponding triangle of the detachable panel',selection&&Math.hypot(selection.flatMm[0]-candidate[0],selection.flatMm[1]-candidate[1])<.3&&selection.vertexIds.length===3,selection);
 const surfacePoint=await run(`(()=>{const l=window.__detachableSide,s=l.getState().selection,index=l.view.panel.geometry.index,p=l.view.panel.geometry.getAttribute('position'),q=l.view.base.camera.position.clone().set(0,0,0);for(let i=0;i<3;i++){const id=index.getX(s.triangle*3+i);q.x+=p.getX(id)*s.barycentric[i];q.y+=p.getY(id)*s.barycentric[i];q.z+=p.getZ(id)*s.barycentric[i];}q.applyMatrix4(l.view.panel.matrixWorld).project(l.view.base.camera);const r=l.view.base.canvas().getBoundingClientRect();return{x:r.left+(q.x*.5+.5)*r.width,y:r.top+(.5-q.y*.5)*r.height};})()`);
 await tap(surfacePoint.x,surfacePoint.y);const reverseSelection=await run('window.__detachableSide.getState().selection');
 check('Actual detached panel touch maps back to the same millimetre paper location',reverseSelection&&Math.hypot(...reverseSelection.flatMm.map((v,k)=>v-selection.flatMm[k]))<.3,{before:selection.flatMm,after:reverseSelection?.flatMm});
 for(const id of ['wire','confidence','seams','paper-image','wrapped-band']){await click(id);await click(id);}
 check('Overlay, seam, confidence and wire switches preserve the same side geometry',await run('window.__detachableSide.view.panel.geometry===window.__qaPanelGeometry&&window.__detachableSide.view.panel.geometry.index===window.__qaPanelIndex'),null);
 const confidenceDisplay=await run('(()=>{const l=window.__detachableSide;l.view.setConfidence(true);const a=l.view.panel.geometry.getAttribute("color"),palette=new Set();for(let i=0;i<a.count;i++)palette.add([a.getX(i),a.getY(i),a.getZ(i)].map(v=>v.toFixed(5)).join(","));const result={colors:palette.size,vertexColorsEnabled:l.view.panel.material.vertexColors,observed:l.data.observedMask.filter(Boolean).length,inferred:l.data.observedMask.filter(v=>!v).length};l.view.setConfidence(false);return result;})()');
 check('Observed and inferred cloth regions are visibly distinguished when enabled',confidenceDisplay.vertexColorsEnabled&&confidenceDisplay.observed>0&&confidenceDisplay.inferred>0&&confidenceDisplay.colors>=2,confidenceDisplay);
 await shot('06-linked-flat-paper-selection');
 await run('document.querySelector("[data-camera=paper]").click()');await settle();
 const paperCamera=await run('(()=>{const l=window.__detachableSide,c=l.view.base.camera,t=l.view.base.controls.target,m=l.data.flatDisplayMatrix,n=[m[8],m[9],m[10]],v=c.position.clone().sub(t).normalize(),d=Math.hypot(...n);return{alignment:(v.x*n[0]+v.y*n[1]+v.z*n[2])/d,sameGeometry:l.view.panel.geometry===window.__qaPanelGeometry,flatErrorMm:l.getState().flatErrorMm};})()');
 check('Paper-facing camera preserves geometry and exact flat correspondence',paperCamera.alignment>.999999&&paperCamera.sameGeometry&&paperCamera.flatErrorMm===0,paperCamera);
 await shot('07-paper-facing-flat-comparison');
 await run('document.getElementById("auto-camera").checked=true;window.__detachableSide.view.setAutoCamera(true)');await settle();
 await click('export-json');await click('export-svg');
 await waitFor(`document.getElementById('export-json')!==null`,'export action');await pause(600);
 let files=await readdir(downloads);for(let i=0;i<30&&(!files.includes('ONWARD-detachable-side-project.json')||!files.includes('ONWARD-detachable-side-flat.svg'));i++){await pause(150);files=await readdir(downloads);}
 check('Full panel project JSON and actual flat boundary SVG download',files.includes('ONWARD-detachable-side-project.json')&&files.includes('ONWARD-detachable-side-flat.svg'),files);
 const exported=JSON.parse(await readFile(downloads+'/ONWARD-detachable-side-project.json','utf8')),svg=await readFile(downloads+'/ONWARD-detachable-side-flat.svg','utf8');
 check('Export JSON retains exact full identity, trim provenance and unverified status',exported.productionReady===false&&JSON.stringify(exported.flatMm)===JSON.stringify(data.flatMm)&&JSON.stringify(exported.indices)===JSON.stringify(data.indices)&&JSON.stringify(exported.provenance)===JSON.stringify(data.provenance),{vertices:exported.vertexIds.length,triangles:exported.indices.length/3,productionReady:exported.productionReady,coordinateSystems:exported.coordinateSystems});
 await writeFile(asset+'/ONWARD-detachable-side-flat.svg',svg);
 check('Export SVG has canonical millimetre dimensions and an actual flat-panel outline',/width="[\d.]+mm"/.test(svg)&&/height="[\d.]+mm"/.test(svg)&&svg.includes('同一侧片平铺')&&svg.includes('#144d70'),{bytes:svg.length,viewBox:svg.match(/viewBox="([^"]+)"/)?.[1]});
 const links=await run('Array.from(document.querySelectorAll(".exports a[download]")).map(a=>({href:a.href,label:a.textContent}))');
 for(const link of links){const response=await fetch(link.href,{method:'HEAD'});check('Actual editable animation asset is downloadable: '+link.label,response.ok,{url:link.href,status:response.status,bytes:response.headers.get('content-length')});}
 // Trim changes are configuration changes; each subsequent narrative must
 // keep the new fixed index buffer and the same geometry object.
 const variantStates=[];
 for(const variant of data.trimVariants){
  const state=await run(`(()=>{const l=window.__detachableSide;const result=l.setTrimVariant(${JSON.stringify(variant.id)});l.setProgress(1);const exported=JSON.parse(l.exportJSON());return{result,...l.getState(),actualIndices:Array.from(l.view.panel.geometry.index.array),exported:{indices:exported.indices,trimmedIndices:exported.trimmedIndices,excludedIndices:exported.excludedIndices,sourceTriangleIds:exported.sourceTriangleIds,defaultTrimId:exported.defaultTrimId}};})()`);
  assert.deepEqual(state.actualIndices,variant.indices);assert.deepEqual(state.exported.indices,variant.indices);assert.deepEqual(state.exported.trimmedIndices,variant.indices);assert.deepEqual(state.exported.excludedIndices,variant.excludedIndices);assert.deepEqual(state.exported.sourceTriangleIds,variant.sourceTriangleIds);assert.equal(state.exported.defaultTrimId,variant.id);assert.equal(state.geometryUUID,boot.geometryUUID);assert.equal(state.flatErrorMm,0);variantStates.push({id:variant.id,indexCount:state.indexCount,vertexCount:state.vertexCount,geometryUUID:state.geometryUUID,flatErrorMm:state.flatErrorMm});
 }
 await run(`window.__detachableSide.setTrimVariant(${JSON.stringify(data.defaultTrimId)});window.__detachableSide.setProgress(1);`);
 check('All sole-boundary configurations preserve the paper endpoint and export their active indices',variantStates.length===data.trimVariants.length,variantStates);
 check('Actual application assets load without failed requests',failedRequests.length===0&&badResponses.filter(r=>!r.url.endsWith('/favicon.ico')).length===0,{failedRequests,badResponses});
 check('No uncaught browser exceptions',errors.length===0,errors);
 const report={testedAt:new Date().toISOString(),url,environment:'Linux Chromium headless with SwiftShader software WebGL;1280×900 and1024×768 emulated touch. NOT real iPad or Safari.',panelDataSha256:digest(dataBytes),sourceModelSha256:digest(modelBytes),checks,errors,failedRequests,badResponses,downloadEvents,productionReady:false,limitations:['Physical sole-wrap boundary, hidden folds, model scale and material strain are unverified.','An exact numerical paper endpoint is not a certified real-world flattening result.','Software WebGL timing does not establish physical iPad GPU performance.']};
 if(process.argv.includes('--video')){
  const videoFrames=scratch+'/video-frames';await mkdir(videoFrames,{recursive:true});
  await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
  await run('(()=>{const l=window.__detachableSide;l.pause();document.getElementById("auto-camera").checked=true;l.view.setAutoCamera(true);l.view.marker=undefined;l.view.base.markers([]);l.paperView.setSelection();scrollTo(0,0);})()');
  const count=96;
  for(let i=0;i<count;i++){await run(`window.__detachableSide.setProgress(${i/(count-1)})`);await settle();const frame=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(videoFrames+'/'+String(i).padStart(4,'0')+'.png',Buffer.from(frame.data,'base64'));}
  const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','12','-i',videoFrames+'/%04d.png','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out+'/unfold-process.mp4'],{encoding:'utf8'});assert.equal(encoded.status,0,encoded.stderr);
  const poster=await readFile(videoFrames+'/0054.png');await writeFile(out+'/unfold-process-poster.png',poster);
  report.video={file:'unfold-process.mp4',frames:count,inputFps:12,durationSeconds:count/12,method:'Deterministic screenshots of the actual interactive mesh at increasing progress; no image morph or substituted mesh. Encoded at12fps; not a real-time performance measurement.'};
  console.log('PASS actual mesh process video',report.video);
 }
 await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({checks:checks.length,passed:true,errors:errors.length,screenshots:out,panelDataSha256:digest(dataBytes)},null,2));
}catch(error){await writeFile(out+'/browser-validation-failure.json',JSON.stringify({testedAt:new Date().toISOString(),url,error:String(error),checks,errors,failedRequests,badResponses},null,2)+'\n');throw error;}
finally{ws?.close();browser.kill('SIGTERM');}
