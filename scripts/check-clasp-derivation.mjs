/** Independent geometry + real-browser checks for reference-led clasp drawing.
 * Never substitutes image overlays or reports emulated Chromium as Safari.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const repo=process.cwd(),asset=repo+'/public/detachable-side-panel',out=asset+'/clasp-verification';
const scratch='/tmp/onward-clasp-qa-'+Date.now(),downloads=scratch+'/downloads';
const url=process.argv.find(s=>s.startsWith('http'))??'http://127.0.0.1:4391/soulgrain-onward/onward-clasp-derivation/detachable-side.html';
const ACCEPTED_PANEL_SHA='c7409caba44e6b1ee42abd905e0d2933e88bf15f597096ee89f8f1ec9e8a6b2a';
const digest=b=>createHash('sha256').update(b).digest('hex'),pause=ms=>new Promise(r=>setTimeout(r,ms));
const checks=[],errors=[],failedRequests=[],badResponses=[];
const check=(name,passed,detail)=>{checks.push({name,passed,detail:structuredClone(detail)});if(!passed)throw Error(name+': '+JSON.stringify(detail));console.log('PASS',name);};
const close=(a,b,e=1e-7)=>Math.abs(a-b)<e,dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
await mkdir(out,{recursive:true});await mkdir(downloads,{recursive:true});
const panelBytes=await readFile(asset+'/panel-data.json'),panel=JSON.parse(panelBytes);
const designBytes=await readFile(repo+'/public/pattern-engineering/data/clasp-design.json'),design=JSON.parse(designBytes);
const modelMeta=JSON.parse(await readFile(repo+'/public/reference-model-v10/model-data.json','utf8'));
const derivationBytes=await readFile(asset+'/clasp-derivation.json'),data=JSON.parse(derivationBytes);
check('Accepted paper-driven side geometry remains byte-for-byte unchanged',digest(panelBytes)===ACCEPTED_PANEL_SHA,{panelDataSha256:digest(panelBytes)});
const referenceHashes=[];for(const[file,expected]of Object.entries(design.sourceFiles)){const actual=digest(await readFile(repo+'/public/pattern-engineering/references/'+file));assert.equal(actual,expected,file);referenceHashes.push({file,sha256:actual});}
check('Original construction and final-strip reference bytes match preserved source manifest',referenceHashes.length>=8,referenceHashes);
check('User confirmed photographed blue centers remain placement authority',design.defaultLayout==='observed'&&design.golden.centerDefinition.userConfirmed===true&&design.golden.centerDefinition.confirmedDefinition==='fifth-arc-supporting-circle-center'&&design.golden.centerDefinition.defaultCenterSource==='observed-blue-circle',design.golden.centerDefinition);
const phi=(1+Math.sqrt(5))/2;
function canonicalPhoto(template,q){const y=template.mirroredY?1-q[1]:q[1];return[template.origin[0]+template.scalePxPerUnit*(template.axisX[0]*q[0]+template.axisY[0]*y),template.origin[1]+template.scalePxPerUnit*(template.axisX[1]*q[0]+template.axisY[1]*y)];}
const golden=[];
for(const [i,t]of design.golden.templates.entries()){
 let maximumRadiusError=0,maximumEndpointError=0;
 for(const arc of t.canonicalArcs.slice(0,5)){
  maximumRadiusError=Math.max(maximumRadiusError,Math.abs(arc.radius-phi**(1-arc.index)));
  const a=[arc.center[0]+arc.radius*Math.cos(arc.startAngle),arc.center[1]+arc.radius*Math.sin(arc.startAngle)],b=[arc.center[0]+arc.radius*Math.cos(arc.endAngle),arc.center[1]+arc.radius*Math.sin(arc.endAngle)];maximumEndpointError=Math.max(maximumEndpointError,dist(a,arc.start),dist(b,arc.end));
 }
 const fifth=t.canonicalArcs[4],fourth=t.canonicalArcs[3],center=canonicalPhoto(t,fifth.center),observed=design.observed.clasps[i].centerPhoto;
 check('Five quarter circles preserve true recursive golden-square relations: '+t.id,maximumRadiusError<2e-6&&maximumEndpointError<2e-6&&close(dist(fourth.end,fifth.center),fifth.radius,2e-6)&&dist(center,t.fifthArcFullCircleCenterPhoto)<.001,{maximumRadiusError,maximumEndpointError,observedCenterResidualPx:dist(observed,center),observedFourthEndDistancePx:dist(observed,canonicalPhoto(t,fourth.end)),isExactLogarithmicSpiral:false});
 golden.push({template:t.id,mirrored:t.mirroredY,fittedCenterPhoto:center,observedBlueCenterPhoto:observed,remainingResidualPx:dist(observed,center)});
}
check('Hand-drawn template residuals and nonparallel observed strips are not erased',golden.every(t=>t.remainingResidualPx>1&&t.remainingResidualPx<5)&&design.observed.axisDifferenceDeg>3&&design.observed.axisDifferenceDeg<4&&!design.constraintCandidate.enabledByDefault,{golden,observedAxisDifferenceDeg:design.observed.axisDifferenceDeg});

const originalFaces=panel.source.originalTriangleIndices,flat=panel.flatMm,n=flat.length/2;
const reg=modelMeta.photoRegistration;
const samplePosition=(s,positions)=>[0,1,2].map(k=>s.ids.reduce((sum,id,j)=>sum+positions[id*3+k]*s.barycentric[j],0));
const project=p=>[reg.originXPx+reg.pixelsPerUnitX*p.reduce((s,v,k)=>s+v*reg.rightWorld[k],0),reg.originYPx-reg.pixelsPerUnitY*p.reduce((s,v,k)=>s+v*reg.upWorld[k],0)];
const samples=[];
function collect(value,where='root'){
 if(!value||typeof value!=='object')return;
 if(Array.isArray(value.ids)&&Array.isArray(value.barycentric)&&Array.isArray(value.flatMm)){samples.push({sample:value,where});return;}
 if(Array.isArray(value))for(let i=0;i<value.length;i++)collect(value[i],where+'['+i+']');else for(const[k,v]of Object.entries(value))collect(v,where+'.'+k);
}
collect(data);
check('Derivation contains dense actual-surface anchors rather than a photo plane',samples.length>100,{mappedSamples:samples.length,paths:data.paths?.length,coverage:data.coverage?.length,keypoints:data.keypoints?.length});
let maxFlatError=0,maxProjectionConsistencyError=0,maxResidual=0,nearestCount=0;
for(const{sample:s,where}of samples){
 assert.equal(s.ids.length,3,where);assert.equal(s.barycentric.length,3,where);assert.ok(s.ids.every(id=>Number.isInteger(id)&&id>=0&&id<n),where);assert.ok(s.barycentric.every(v=>Number.isFinite(v)&&v>=-1e-7&&v<=1+1e-7),where);assert.ok(close(s.barycentric.reduce((a,b)=>a+b,0),1),where);
 assert.ok(Number.isInteger(s.triangle)&&s.triangle>=0&&s.triangle<originalFaces.length/3,where);assert.deepEqual(s.ids,originalFaces.slice(s.triangle*3,s.triangle*3+3),where);
 const q=[0,1].map(k=>s.ids.reduce((sum,id,j)=>sum+flat[id*2+k]*s.barycentric[j],0));maxFlatError=Math.max(maxFlatError,dist(q,s.flatMm));
 assert.ok(['body','cuff'].includes(s.region),where);assert.equal(s.materialSide,s.region==='body'?1:-1,where);assert.equal(s.normalSign,-s.materialSide,where);
 const actualPhoto=project(samplePosition(s,panel.formedPositions)),residual=dist(actualPhoto,s.requestedPhotoPx??s.photoPx);maxResidual=Math.max(maxResidual,residual);if(residual>.01)nearestCount++;
 assert.ok(Number.isFinite(s.projectionResidualPx),where);maxProjectionConsistencyError=Math.max(maxProjectionConsistencyError,Math.abs(s.projectionResidualPx-residual));
}
check('Every drawing, keypoint and coverage vertex has original-triangle identity and exact flat provenance',maxFlatError<1e-7,{samples:samples.length,maximumFlatErrorMm:maxFlatError});
check('Attached projection residuals are reproducible from actual formed mesh',maxProjectionConsistencyError<.005,{maximumResidualConsistencyErrorPx:maxProjectionConsistencyError,maximumPhotoResidualPx:maxResidual,nonzeroProjectionResidualSamples:nearestCount,doesNotMeasurePhysicalAccuracy:true});

check('Generated derivation is bound to the accepted panel and original observed design',data.source.panelDataSha256===digest(panelBytes)&&data.source.claspDesignSha256===digest(designBytes)&&data.source.correctedModelSha256===panel.source.correctedModelSha256&&data.source.paperProjectSha256===panel.source.paperProjectSha256,data.source);
const expectedKeypoints={P:design.frame.toeConnectionPoint,T:design.frame.tangentIntersection,G1:design.frame.boundaryIntersections.upperStrapGuide,G2:design.frame.boundaryIntersections.lowerStrapGuide};
for(const[i,c]of design.observed.clasps.entries()){const k=i+1;expectedKeypoints['C'+k]=c.centerPhoto;expectedKeypoints['C'+k+'B']=c.centerPhoto;expectedKeypoints['B'+k]=c.bodyFixedEndPhoto;expectedKeypoints['F'+k]=c.cuffFixedEndPhoto;}
for(const[id,photo]of Object.entries(expectedKeypoints)){const point=data.keypoints.find(p=>p.id===id);assert.ok(point,'Missing keypoint '+id);assert.ok(dist(point.surface.requestedPhotoPx??point.surface.photoPx,photo)<1e-5,id);}
check('Twelve numbered surface references retain photographed construction, observed centers and fixed ends',data.keypoints.length===12,{points:data.keypoints.map(p=>({id:p.id,materialSide:p.surface.materialSide,flatMm:p.surface.flatMm,requestedPhotoPx:p.surface.requestedPhotoPx}))});
for(let i=1;i<=2;i++){const body=data.keypoints.find(p=>p.id==='C'+i+'B').surface,cuff=data.keypoints.find(p=>p.id==='C'+i).surface;check('One visible snap center retains two distinct material installation references: '+i,body.region==='body'&&cuff.region==='cuff'&&dist(body.photoPx,cuff.photoPx)<1e-5&&dist(body.flatMm,cuff.flatMm)>10,{bodyFlatMm:body.flatMm,cuffFlatMm:cuff.flatMm,samePhotoPixel:true,physicalInstallationValidated:false});}
let maxCurveErrorPx=0;
for(const t of design.golden.templates){for(const a of t.canonicalArcs.slice(0,5)){const path=data.paths.find(p=>p.id==='spiral-'+t.id+'-'+a.index);assert.ok(path&&path.points.length>3);const center=canonicalPhoto(t,a.center),radius=a.radius*t.scalePxPerUnit;for(const p of path.points)maxCurveErrorPx=Math.max(maxCurveErrorPx,Math.abs(dist(p.requestedPhotoPx??p.photoPx,center)-radius));}}
check('Actual mapped spiral path samples follow the preserved first and mirrored quarter-circle constructions',maxCurveErrorPx<.001,{maximumRadialErrorPx:maxCurveErrorPx,templateCount:2,arcsPerTemplate:5});
function polygonArea(points){let a=0;for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.abs(a)/2;}
const coverageReports=[];
for(const c of data.coverage){
 assert.ok(c.vertices.length>2&&c.indices.length>2&&c.indices.length%3===0);assert.ok(c.indices.every(i=>Number.isInteger(i)&&i>=0&&i<c.vertices.length));
 assert.equal(c.materialSide,c.region==='body'?1:-1);assert.equal(c.normalSign,-c.materialSide);assert.equal(c.productionReady,false);
 let area=0,photoArea=0,minArea=Infinity;
 for(let i=0;i<c.indices.length;i+=3){const v=c.indices.slice(i,i+3).map(id=>c.vertices[id]),a=polygonArea(v.map(p=>p.flatMm));area+=a;minArea=Math.min(minArea,a);photoArea+=polygonArea(v.map(p=>project(samplePosition(p,panel.formedPositions))));}
 assert.ok(minArea>1e-12,c.id+' contains degenerate coverage triangle');assert.ok(close(area,c.areaFlatMm2,1e-6),c.id+' area provenance');assert.ok(close(photoArea,c.mappedPhotoAreaPx2,1e-5),c.id+' photo area');assert.ok(close(polygonArea(c.photoPolygon),c.photoPolygonAreaPx2,1e-5));assert.ok(photoArea<=c.photoPolygonAreaPx2+1e-5,c.id+' overlapping photo regions');
 for(const s of c.vertices){assert.equal(s.region,c.region);assert.equal(s.materialSide,c.materialSide);}
 coverageReports.push({id:c.id,half:c.half,materialSide:c.materialSide,triangles:c.indices.length/3,areaFlatMm2:area,mappedPhotoCoverageFraction:photoArea/c.photoPolygonAreaPx2,uncoveredPhotoAreaPx2:Math.max(0,c.photoPolygonAreaPx2-photoArea)});
}
check('Eight PU and snap footprints have independently computed paper areas with actual clipped source surfaces',data.coverage.length===8&&data.coverage.filter(c=>c.half==='body'||c.half==='cuff').length===4,coverageReports);
check('Missing region paths and incomplete footprints remain reported instead of extrapolated',data.validation.nearestSurfaceClampingUsed===false&&data.validation.unmappedPathSamples>0&&data.validation.pathsWithGaps.length>0&&coverageReports.some(c=>c.mappedPhotoCoverageFraction<.999),{unmappedPathSamples:data.validation.unmappedPathSamples,pathsWithGaps:data.validation.pathsWithGaps,incompleteCoverage:coverageReports.filter(c=>c.mappedPhotoCoverageFraction<.999)});
check('12 mm appearance preset does not manufacture PU width, overlap or cut lengths',data.productionReady===false&&data.clasps.length===2&&data.clasps.every(c=>c.snapAppearanceDiameterMm===12&&c.puWidthMm===null&&c.overlapMm===null&&c.actualCutLengthsKnown===false),data.clasps.map(c=>({id:c.id,snapAppearanceDiameterMm:c.snapAppearanceDiameterMm,puWidthMm:c.puWidthMm,overlapMm:c.overlapMm,actualCutLengthsKnown:c.actualCutLengthsKnown})));
// Instantiate the actual renderer without a DOM: label sprites are omitted,
// while the production path/coverage/hardware buffers are identical.
const {BufferGeometry,BufferAttribute,Mesh,MeshBasicMaterial,DoubleSide,FrontSide,Vector3,Raycaster}=await import('three');
const {PanelEvaluator}=await import('../src/detachable-side-panel/timeline.ts');
const {ClaspDerivationLayer}=await import('../src/detachable-side-panel/ClaspDerivationLayer.ts');
const evaluator=new PanelEvaluator(panel),geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array(panel.formedPositions),3));geometry.setIndex(panel.trimmedIndices);
const actualLayer=new ClaspDerivationLayer(data,panel,geometry);actualLayer.setDerivationProgress(1);
const drawStages=[];for(const p of[0,.08,.15,.27,.35,.46,.50,.60,.68,.74,1]){actualLayer.setDerivationProgress(p);const state=actualLayer.getState();drawStages.push({progress:p,stage:state.stage,drawnVertices:state.drawnPathVertices,paths:state.derivedPaths.filter(p=>p.drawCount>0).map(p=>({id:p.id,drawCount:p.drawCount,totalCount:p.totalCount}))});}
const firstComplete=drawStages.find(s=>s.progress===.46),oppositeComplete=drawStages.find(s=>s.progress===.68);
check('Actual path draw ranges reveal geometry progressively, including all five arcs in both directions',drawStages[0].drawnVertices===0&&new Set(drawStages.map(s=>s.drawnVertices)).size>=7&&firstComplete.paths.filter(p=>/^spiral-first-/.test(p.id)&&p.drawCount===p.totalCount).length===5&&oppositeComplete.paths.filter(p=>/^spiral-opposite-/.test(p.id)&&p.drawCount===p.totalCount).length===5,drawStages);
actualLayer.setDerivationProgress(1);let maximumActualSurfaceError=0,maximumOffsetError=0;
const posedChecks=[];
for(const unfold of[0,.24,.57,1]){
 const positions=evaluator.evaluate(unfold).positions;geometry.getAttribute('position').array.set(positions);actualLayer.updateSurface(positions,unfold);const state=actualLayer.getDiagnostics();
 for(const p of state.keypoints){const source=data.keypoints.find(s=>s.id===p.id).surface,expected=samplePosition(source,positions);maximumActualSurfaceError=Math.max(maximumActualSurfaceError,dist(expected,p.surfacePosition));const expectedOffset=expected.map((v,k)=>v+p.normal[k]*p.offset);maximumOffsetError=Math.max(maximumOffsetError,dist(expectedOffset,p.position));}
 for(const c of state.coverage){const source=data.coverage.find(s=>s.id===c.id);for(const v of c.vertexSamples){const expected=samplePosition(source.vertices[v.index],positions);maximumActualSurfaceError=Math.max(maximumActualSurfaceError,dist(expected,v.surfacePosition));maximumOffsetError=Math.max(maximumOffsetError,dist(v.position,expected.map((n,k)=>n+v.normal[k]*c.offset)));}}
 posedChecks.push({unfoldProgress:unfold,keypoints:state.keypoints.length,coverage:state.coverage.length,closedBlend:state.closedBlend,positionsFinite:state.keypoints.every(p=>p.position.every(Number.isFinite))});
}
check('Actual renderer buffers follow the same original anchors through detachment and flattening',maximumActualSurfaceError<1e-7&&maximumOffsetError<3e-7,{maximumActualSurfaceErrorModelUnits:maximumActualSurfaceError,maximumSignedFaceOffsetErrorModelUnits:maximumOffsetError,poses:posedChecks});
// At the exact flat endpoint, the immutable source normal is M's third axis.
// The material-front exterior points opposite that normal; cuff installs on back.
const sourceNormal=new Vector3(panel.flatDisplayMatrix[8],panel.flatDisplayMatrix[9],panel.flatDisplayMatrix[10]).normalize(),flatFaceChecks=[];
actualLayer.setHardware(false);const panelMesh=new Mesh(geometry,new MeshBasicMaterial({side:DoubleSide}));panelMesh.updateMatrixWorld(true);actualLayer.group.updateMatrixWorld(true);
actualLayer.group.traverse(o=>{if(!o.isMesh||!o.userData.coverageId)return;const c=data.coverage.find(c=>c.id===o.userData.coverageId),attr=o.geometry.getAttribute('position'),index=o.geometry.index;let minNormalAgreement=Infinity;for(let t=0;t<index.count;t+=3){const a=new Vector3().fromBufferAttribute(attr,index.getX(t)),b=new Vector3().fromBufferAttribute(attr,index.getX(t+1)),cc=new Vector3().fromBufferAttribute(attr,index.getX(t+2)),normal=b.sub(a).cross(cc.sub(a)).normalize();minNormalAgreement=Math.min(minNormalAgreement,normal.dot(sourceNormal)*c.normalSign);}flatFaceChecks.push({id:c.id,materialSide:c.materialSide,minNormalAgreement,frontSide:o.material.side===FrontSide,depthTest:o.material.depthTest});});
check('Actual coverage winding and depth tests preserve body front and folded-cuff back at flat endpoint',flatFaceChecks.length===8&&flatFaceChecks.every(c=>c.minNormalAgreement>.999&&c.frontSide&&c.depthTest),flatFaceChecks);
const occlusionChecks=[];actualLayer.group.traverse(o=>{if(!o.isMesh||!o.userData.coverageId)return;const c=data.coverage.find(c=>c.id===o.userData.coverageId),attr=o.geometry.getAttribute('position'),index=o.geometry.index,center=new Vector3();for(let k=0;k<3;k++)center.add(new Vector3().fromBufferAttribute(attr,index.getX(k)));center.multiplyScalar(1/3);for(const face of[1,-1]){const exterior=sourceNormal.clone().multiplyScalar(-face),ray=new Raycaster(center.clone().addScaledVector(exterior,.3),exterior.clone().negate(),0,1),hit=ray.intersectObjects([panelMesh,o],false)[0];occlusionChecks.push({id:c.id,observedMaterialSide:face,expectedVisible:c.materialSide===face,firstHit:hit?.object===o?'coverage':hit?.object===panelMesh?'paper':'none'});}});
check('Actual mesh ray occlusion hides cuff coverage from front and reveals it from back',occlusionChecks.length===16&&occlusionChecks.every(c=>c.firstHit===(c.expectedVisible?'coverage':'paper')),occlusionChecks);
actualLayer.dispose();geometry.dispose();panelMesh.material.dispose();
const staticReport={testedAt:new Date().toISOString(),panelDataSha256:digest(panelBytes),claspDerivationSha256:digest(derivationBytes),claspDesignSha256:digest(designBytes),checks:[...checks],productionReady:false,limitations:['Exact attached photograph projection is conditioned on the accepted approximate formed panel, not independent physical fit.','Footprints are digital projected coverage, not finalized PU cut pieces or installed snap hardware.','Material side is preserved; actual material/contact, scale and sewing remain unverified.']};
await writeFile(out+'/geometry-validation.json',JSON.stringify(staticReport,null,2)+'\n');
if(process.argv.includes('--static-only')){console.log(JSON.stringify({passed:true,checks:checks.length,staticOnly:true}));process.exit(0);}

const port=9367;
const browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--remote-debugging-port='+port,'--user-data-dir='+scratch+'/profile','about:blank'],{stdio:'ignore'});
let ws;
try{
 let pages;for(let i=0;i<100;i++){try{pages=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await pause(100);}}
 if(!pages)throw Error('Chromium remote debugger unavailable');
 ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let seq=0;const pending=new Map();ws.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);else if(d.method==='Network.loadingFailed')failedRequests.push(d.params);else if(d.method==='Network.responseReceived'&&d.params.response.status>=400)badResponses.push({url:d.params.response.url,status:d.params.response.status});};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;};
 const settle=()=>run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const waitFor=async(expression,label,timeout=45000)=>{const stop=Date.now()+timeout;while(Date.now()<stop){if(await run(expression))return;await pause(150);}throw Error('Timed out '+label+': '+await run('document.body.innerText.slice(0,1500)'));};
 const click=id=>run(`document.getElementById(${JSON.stringify(id)}).click()`);
 const shot=async name=>{await run('scrollTo(0,0)');await settle();const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(out+'/'+name+'.png',Buffer.from(r.data,'base64'));};
 const tap=async(x,y)=>{await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(80);};
 await cdp('Page.enable');await cdp('Runtime.enable');await cdp('Network.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await cdp('Page.navigate',{url});
 await waitFor('Boolean(window.__detachableSide?.getState().ready&&window.__detachableSide?.derivation)','accepted side and actual clasp layer');await settle();
 const boot=await run('window.__detachableSide.getState()');
 const browserHash=await run("(async()=>{const d=window.__detachableSide.derivation.data;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(d))))).map(n=>n.toString(16).padStart(2,'0')).join('')})()");
 check('Browser boots actual accepted side and exact current derivation data',boot.ready&&boot.progress===0&&boot.derivationProgress===0&&boot.removedTriangles===68356&&browserHash===digest(Buffer.from(JSON.stringify(data))),{boot,browserCanonicalDerivationSha256:browserHash});
 await run('window.__qaPanelGeometry=window.__detachableSide.view.panel.geometry;window.__qaPanelIndex=window.__qaPanelGeometry.index;');
 const actualDrawStages=[];
 for(const[p,name]of[[.08,'01-regions'],[.27,'02-framework'],[.41,'03-first-spiral-drawing'],[.50,'04-first-support-circle'],[.63,'05-opposite-spiral-drawing'],[.78,'06-both-centres'],[1,'07-straps-and-snaps']]){
  await run(`window.__detachableSide.derivation.setProgress(${p})`);await settle();const state=await run('window.__detachableSide.derivation.getState()');
  const actual=await run(`(()=>{const d=window.__detachableSide.derivation.layer,result=[];d.group.traverse(o=>{if(o.isLineSegments)result.push({name:o.name,count:o.geometry.drawRange.count,total:o.geometry.getAttribute('position').count,depthTest:o.material.depthTest,visible:o.visible});});return result;})()`);
  assert.equal(state.drawnPathVertices,actual.reduce((s,p)=>s+p.count,0));assert.ok(actual.every(p=>p.count>=0&&p.count<=p.total&&p.depthTest));actualDrawStages.push({progress:p,stage:state.stage,drawnPathVertices:state.drawnPathVertices,visiblePoints:state.keypoints.filter(p=>p.visible).length,actualGeometryRanges:actual});await shot(name);
 }
 check('Actual WebGL line buffers draw in multiple stages rather than switching reference pictures',new Set(actualDrawStages.map(s=>s.drawnPathVertices)).size>=5&&actualDrawStages.at(-1).visiblePoints===12,actualDrawStages);
 const imagePlanes=await run(`(()=>{const list=[];window.__detachableSide.derivation.layer.group.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.map)list.push({name:o.name,mapType:m.map.type,url:m.map.image?.src??null});}});return list;})()`);
 check('Construction layer contains no textured reference-image meshes',imagePlanes.length===0,imagePlanes);
 // A paused one-shot narrative must retain its state; seeking cancels both flows.
 await run('window.__detachableSide.derivation.setProgress(0);void window.__detachableSide.derivation.play(1,2400)');await pause(300);await click('derive-pause');const paused=await run('window.__detachableSide.derivation.getState()');await pause(250);const afterPause=await run('window.__detachableSide.derivation.getState()');
 check('Pause retains the current drawn geometry and prevents automatic next-node playback',paused.progress>0&&paused.progress<1&&!paused.playing&&afterPause.progress===paused.progress&&afterPause.drawnPathVertices===paused.drawnPathVertices,{paused:paused.progress,after:afterPause.progress,drawn:paused.drawnPathVertices});
 await run('window.__detachableSide.derivation.play(1,1400);window.__detachableSide.derivation.play(0,1400);void window.__detachableSide.derivation.play(.63,700)');await waitFor('!window.__detachableSide.derivation.getState().playing','rapid derivation interruption');
 const last=await run('window.__detachableSide.derivation.getState()');check('Rapid draw/reverse/seek requests keep the final requested derivation state',close(last.progress,.63)&&await run('window.__detachableSide.view.panel.geometry===window.__qaPanelGeometry&&window.__detachableSide.view.panel.geometry.index===window.__qaPanelIndex'),{progress:last.progress,stage:last.stage});
 const timing=await run(`(async()=>{const l=window.__detachableSide;l.derivation.setProgress(0);let stamps=[],last=performance.now(),live=true;const tick=t=>{stamps.push(t-last);last=t;if(live)requestAnimationFrame(tick);};requestAnimationFrame(tick);const start=performance.now();await l.derivation.play(1,1400);live=false;stamps.sort((a,b)=>a-b);return{elapsedMs:performance.now()-start,frames:stamps.length,medianFrameMs:stamps[Math.floor(stamps.length/2)],p95FrameMs:stamps[Math.floor(stamps.length*.95)],progress:l.derivation.getState().progress};})()`);
 check('One-time derivation completes and retains final hardware/footprints',timing.progress===1&&await run('window.__detachableSide.derivation.getState().coverage.every(c=>c.visible)&&window.__detachableSide.derivation.getState().snaps.every(s=>s.visible)'),timing);
 // Real emulated finger interaction on both the range and the 3D canvas.
 await run('document.getElementById("derive-progress").scrollIntoView({block:"center"})');await pause(80);const slider=await run('(()=>{const r=document.getElementById("derive-progress").getBoundingClientRect();return{x:r.x+r.width*.25,y:r.y+r.height/2,end:r.x+r.width*.57};})()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:slider.x,y:slider.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:slider.end,y:slider.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(120);const touchScrub=await run('window.__detachableSide.derivation.getState()');
 check('Actual touch dragging seeks construction geometry without replacing the panel',touchScrub.progress>.45&&touchScrub.progress<.68&&!touchScrub.playing&&await run('window.__detachableSide.view.panel.geometry===window.__qaPanelGeometry'),{progress:touchScrub.progress,stage:touchScrub.stage});
 await run('window.__detachableSide.derivation.setProgress(1);document.querySelector("[data-camera=side]").click();scrollTo(0,0)');await settle();const canvas=await run('(()=>{const r=window.__detachableSide.view.base.canvas().getBoundingClientRect();return{x:r.x+r.width*.5,y:r.y+r.height*.45};})()');const orbit=await run('window.__detachableSide.view.base.camera.position.toArray()');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x,y:canvas.y,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x+50,y:canvas.y+15,id:1}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);const orbited=await run('window.__detachableSide.view.base.camera.position.toArray()');check('Single-finger rotation continues to work with construction and hardware present',JSON.stringify(orbit)!==JSON.stringify(orbited),{before:orbit,after:orbited});
 const zoom=await run('window.__detachableSide.view.base.camera.zoom');await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:canvas.x-25,y:canvas.y,id:1},{x:canvas.x+25,y:canvas.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:canvas.x-55,y:canvas.y,id:1},{x:canvas.x+55,y:canvas.y,id:2}]});await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(150);check('Two-finger pinch continues to zoom the actual 3D scene',await run('window.__detachableSide.view.base.camera.zoom')!==zoom,{before:zoom,after:await run('window.__detachableSide.view.base.camera.zoom')});
 await run('window.__detachableSide.view.setAutoCamera(true);document.getElementById("auto-camera").checked=true;window.__detachableSide.derivation.setProgress(1)');
 const followStates=[];
 for(const p of[0,.24,.57,1]){
  await run(`window.__detachableSide.setProgress(${p})`);await settle();const state=await run('({panel:window.__detachableSide.getGeometryState(),clasp:window.__detachableSide.derivation.layer.getDiagnostics(),sameGeometry:window.__detachableSide.view.panel.geometry===window.__qaPanelGeometry,sameIndex:window.__detachableSide.view.panel.geometry.index===window.__qaPanelIndex})');
  let surfaceError=0,offsetError=0;
  for(const k of state.clasp.keypoints){const s=data.keypoints.find(kp=>kp.id===k.id).surface,expected=samplePosition(s,state.panel.positions);surfaceError=Math.max(surfaceError,dist(expected,k.surfacePosition));offsetError=Math.max(offsetError,dist(k.position,expected.map((v,i)=>v+k.normal[i]*k.offset)));}
  for(const c of state.clasp.coverage){const original=data.coverage.find(cc=>cc.id===c.id);for(const v of c.vertexSamples){const expected=samplePosition(original.vertices[v.index],state.panel.positions);surfaceError=Math.max(surfaceError,dist(expected,v.surfacePosition));offsetError=Math.max(offsetError,dist(v.position,expected.map((n,i)=>n+v.normal[i]*c.offset)));}}
  followStates.push({progress:p,sameGeometry:state.sameGeometry,sameIndex:state.sameIndex,surfaceErrorModelUnits:surfaceError,signedFaceOffsetErrorModelUnits:offsetError,flatErrorMm:await run('window.__detachableSide.getState().flatErrorMm'),closedBlend:state.clasp.closedBlend});if(p===.57)await shot('08-unfolding-with-clasps');
 }
 check('Actual browser coverage and numbered points follow the unchanged panel through full unfold',followStates.every(s=>s.sameGeometry&&s.sameIndex&&s.surfaceErrorModelUnits<1e-7&&s.signedFaceOffsetErrorModelUnits<3e-7)&&followStates.at(-1).flatErrorMm===0,followStates);
 const faceStates=[];
 for(const face of['front','back','both']){
  await run(`window.__detachableSide.derivation.setPaperFace(${JSON.stringify(face)})`);await settle();const state=await run('(()=>{const l=window.__detachableSide,s=l.derivation.paper.getState(),c=l.view.base.camera,t=l.view.base.controls.target,m=l.data.flatDisplayMatrix,n=c.position.clone().sub(t).normalize();return{...s,cameraDotSourceNormal:(n.x*m[8]+n.y*m[9]+n.z*m[10])/Math.hypot(m[8],m[9],m[10]),actualCoverage:Array.from(document.querySelectorAll("[data-layer=clasp-paper-coverage] [data-coverage-id]")).filter(g=>g.style.display!=="none").map(g=>({id:g.dataset.coverageId,materialSide:Number(g.dataset.materialSide)}))};})()');
  const expected=data.coverage.filter(c=>face==='both'||c.materialSide===(face==='front'?1:-1)).map(c=>c.id).sort();assert.deepEqual(state.visibleCoverageIds.slice().sort(),expected);assert.deepEqual(state.actualCoverage.map(c=>c.id).sort(),expected);if(face!=='both')assert.ok(state.cameraDotSourceNormal*(face==='front'?-1:1)>.999,'Selected material face camera direction is reversed: '+face);faceStates.push({face,...state});if(face!=='both')await shot(face==='front'?'09-flat-front-body-coverage':'10-flat-back-cuff-coverage');
 }
 check('Front/back controls separate paper footprints and orient the real flat material correctly',faceStates.length===3,faceStates);
 await run('window.__detachableSide.derivation.setPaperFace("both")');
 for(const id of['B1','F1','C2','C2B']){const result=await run(`(()=>{const l=window.__detachableSide,result=l.derivation.selectKeypoint(${JSON.stringify(id)});return{result,state:l.getState()};})()`),expected=data.keypoints.find(p=>p.id===id);assert.ok(result.result);assert.ok(dist(result.state.selection.flatMm,expected.surface.flatMm)<1e-7);assert.equal(result.state.paperFace,expected.surface.materialSide===1?'front':'back');}
 check('Numbered point selections choose the matching original paper coordinate and material face',true,{tested:['B1','F1','C2','C2B']});
 for(const id of['B1','F1']){await run(`document.querySelector('[data-keypoint="${id}"]').scrollIntoView({block:"center"})`);await pause(80);const r=await run(`(()=>{const r=document.querySelector('[data-keypoint="${id}"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);await tap(r.x,r.y);const selected=await run('window.__detachableSide.getState()'),expected=data.keypoints.find(k=>k.id===id);assert.ok(dist(selected.selection.flatMm,expected.surface.flatMm)<1e-7);assert.equal(selected.paperFace,expected.surface.materialSide===1?'front':'back');}
 check('Actual emulated finger taps select body and cuff numbered records on their correct material faces',true,{tested:['B1','F1']});

 await run('window.__detachableSide.derivation.setPaperFace("both");window.__detachableSide.setProgress(0);window.__detachableSide.derivation.setProgress(1)');
 const before=await run('JSON.stringify(window.__detachableSide.derivation.getState())');for(let i=0;i<15;i++)await run('window.__detachableSide.setProgress(.57);window.__detachableSide.setProgress(1);window.__detachableSide.setProgress(0)');const after=await run('JSON.stringify(window.__detachableSide.derivation.getState())');check('Repeated attached/unfold/flat cycles do not accumulate clasp or numbered-point drift',before===after,{cycles:15,diagnosticsUnchanged:true});
 for(const id of['derive-guides','derive-coverage','derive-hardware','derive-labels']){await click(id);await click(id);}check('Guide, coverage, hardware and annotation switches preserve original panel identity',await run('window.__detachableSide.view.panel.geometry===window.__qaPanelGeometry&&window.__detachableSide.view.panel.geometry.index===window.__qaPanelIndex'),null);
 await click('export-clasp-svg');await click('export-clasp-json');let files=[];for(let i=0;i<40;i++){files=await readdir(downloads);if(files.includes('ONWARD-clasp-front-back.svg')&&files.includes('ONWARD-clasp-correspondence.json'))break;await pause(150);}
 check('Actual front/back SVG and full clasp correspondence JSON download',files.includes('ONWARD-clasp-front-back.svg')&&files.includes('ONWARD-clasp-correspondence.json'),files);
 const exportedSvg=await readFile(downloads+'/ONWARD-clasp-front-back.svg','utf8'),exportedJson=JSON.parse(await readFile(downloads+'/ONWARD-clasp-correspondence.json','utf8'));
 check('Downloaded SVG contains real millimetre areas, numbered points and separate material sides',exportedSvg.includes('width="')&&/width="[\d.]+mm"/.test(exportedSvg)&&exportedSvg.includes('data-material-side="1"')&&exportedSvg.includes('data-material-side="-1"')&&data.keypoints.every(p=>exportedSvg.includes('data-keypoint-id="'+p.id+'"'))&&data.coverage.every(c=>exportedSvg.includes('data-coverage-id="'+c.id+'"')), {bytes:exportedSvg.length,keypoints:data.keypoints.length,coverage:data.coverage.length});
 const xmlMetadata=exportedSvg.match(/<metadata>([\s\S]*?)<\/metadata>/)?.[1];assert.ok(xmlMetadata,'SVG missing geometry metadata');const decodedMetadata=JSON.parse(xmlMetadata.replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'));
 for(const c of decodedMetadata.coverage){const expected=data.coverage.find(e=>e.id===c.id);assert.ok(expected);assert.deepEqual(c.indices,expected.indices);assert.equal(c.materialSide,expected.materialSide);assert.ok(close(c.areaFlatMm2,expected.areaFlatMm2));for(let i=0;i<c.vertices.length;i++){assert.deepEqual(c.vertices[i].ids,expected.vertices[i].ids);assert.deepEqual(c.vertices[i].barycentric,expected.vertices[i].barycentric);assert.deepEqual(c.vertices[i].flatMm,expected.vertices[i].flatMm);}}
 check('Downloaded SVG embeds complete original-triangle correspondence for both physical material sides',decodedMetadata.source.panelDataSha256===ACCEPTED_PANEL_SHA&&decodedMetadata.face==='both'&&decodedMetadata.coverage.length===8&&decodedMetadata.keypoints.length===12&&decodedMetadata.productionReady===false,{coverage:decodedMetadata.coverage.length,keypoints:decodedMetadata.keypoints.length,sourcePanelSha256:decodedMetadata.source.panelDataSha256,productionReady:decodedMetadata.productionReady});
 check('Downloaded JSON preserves source paper identities and all exact clasp mapping data',JSON.stringify(exportedJson.derivation)===JSON.stringify(data)&&JSON.stringify(exportedJson.paperIdentity.flatMm)===JSON.stringify(panel.flatMm)&&JSON.stringify(exportedJson.paperIdentity.vertexIds)===JSON.stringify(panel.vertexIds)&&exportedJson.productionReady===false,{points:exportedJson.derivation.keypoints.length,coverage:exportedJson.derivation.coverage.length,productionReady:exportedJson.productionReady});
 await writeFile(asset+'/ONWARD-clasp-front-back.svg',exportedSvg);await writeFile(asset+'/ONWARD-clasp-correspondence.json',JSON.stringify(exportedJson)+'\n');
 check('No application assets failed to load',failedRequests.length===0&&badResponses.filter(r=>!r.url.endsWith('/favicon.ico')).length===0,{failedRequests,badResponses});check('No uncaught browser exceptions',errors.length===0,errors);
 const report={testedAt:new Date().toISOString(),url,environment:'Linux Chromium headless / SwiftShader software WebGL with emulated touch. NOT real iPad Safari.',panelDataSha256:digest(panelBytes),claspDerivationSha256:digest(derivationBytes),checks,errors,failedRequests,badResponses,productionReady:false,limitations:['12mm appearance does not calibrate the model or physical PU width/overlap.','Coverage is a projection on the current assumed formed side, not validated contact or final factory cuts.','Recorded deterministic frames are not real-time rendering performance.','Material front/back mapping is validated digitally; physical manufacturing remains unverified.']};
 if(process.argv.includes('--video')){
  const frameDir=scratch+'/video-frames';await mkdir(frameDir,{recursive:true});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
  await run('(()=>{const l=window.__detachableSide;l.derivation.pause();l.derivation.setPaperFace("both");l.view.setAutoCamera(true);document.getElementById("auto-camera").checked=true;l.paperView.setSelection();l.view.clearSelection();scrollTo(0,0);})()');
  const narrativeFrames=180,orbitFrames=36,holdFrames=12,frames=narrativeFrames+orbitFrames+holdFrames;
  for(let i=0;i<narrativeFrames;i++){
   const t=i/(narrativeFrames-1);if(t<.67)await run(`window.__detachableSide.setProgress(0);window.__detachableSide.derivation.setProgress(${t/.67});scrollTo(0,0)`);else await run(`window.__detachableSide.derivation.setProgress(1,false,false);window.__detachableSide.setProgress(${(t-.67)/.33});scrollTo(0,0)`);
   await settle();const frame=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(frameDir+'/'+String(i).padStart(4,'0')+'.png',Buffer.from(frame.data,'base64'));
  }
  await run(`(()=>{const l=window.__detachableSide;l.derivation.setPaperFace('front');const c=l.view.base.camera,target=l.view.base.controls.target.clone();window.__claspVideoOrbit={offset:c.position.clone().sub(target),up:c.up.clone().normalize(),target};scrollTo(0,0);})()`);await settle();
  for(let j=0;j<orbitFrames;j++){
   const t=(j+1)/orbitFrames,angle=Math.PI*t*t*(3-2*t);
   await run(`(()=>{const l=window.__detachableSide,o=window.__claspVideoOrbit,c=l.view.base.camera;c.position.copy(o.offset).applyAxisAngle(o.up,${angle}).add(o.target);c.lookAt(o.target);l.view.base.controls.target.copy(o.target);l.view.base.controls.update();l.view.base.invalidate();})()`);await settle();
   const frame=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(frameDir+'/'+String(narrativeFrames+j).padStart(4,'0')+'.png',Buffer.from(frame.data,'base64'));
  }
  await run('window.__detachableSide.derivation.setPaperFace("back")');await settle();
  for(let j=0;j<holdFrames;j++){const frame=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(frameDir+'/'+String(narrativeFrames+orbitFrames+j).padStart(4,'0')+'.png',Buffer.from(frame.data,'base64'));}
  const result=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate','12','-i',frameDir+'/%04d.png','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out+'/clasp-derivation-and-unfold.mp4'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);await writeFile(out+'/clasp-process-poster.png',await readFile(frameDir+'/0110.png'));
  report.video={file:'clasp-derivation-and-unfold.mp4',frames,inputFps:12,durationSeconds:frames/12,method:'Actual browser vector drawing, same-mesh unfolding, then a continuous 180-degree camera orbit revealing the cuff on the paper back. Deterministic sampling; not image overlay and not measured real-time FPS.',narrativeFrames,orbitFrames,holdFrames};
 }
 await writeFile(out+'/browser-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,checks:checks.length,errors:errors.length,out},null,2));
}catch(e){await writeFile(out+'/browser-validation-failure.json',JSON.stringify({testedAt:new Date().toISOString(),url,error:String(e),checks,errors,failedRequests,badResponses},null,2)+'\n');throw e;}
finally{ws?.close();browser.kill('SIGTERM');}
