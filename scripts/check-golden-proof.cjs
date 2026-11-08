/** Inspect the actual ruler/compass geometry and deterministic reverse seeks. */
const {chromium,devices}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({...devices['iPad Pro 11'],browserName:undefined,viewport:{width:1194,height:834}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(process.env.GOLDEN_URL||'http://127.0.0.1:4568/golden-derivation.html');await p.waitForFunction(()=>window.__goldenLab?.state().ready,null,{timeout:120000});
 async function seek(t){await p.evaluate(t=>window.__goldenLab.seek(t),t);await p.waitForFunction(()=>window.__goldenLab.state().drawRevision===window.__goldenLab.state().revision);return p.evaluate(()=>window.__goldenLab.state());}
 for(const start of[20,44])for(const[dt,stage]of[[.5,'unit'],[1.3,'midpoint'],[2.4,'compass'],[4.5,'ratio'],[8.9,'partition'],[13.5,'prepare'],[16,'arc'],[23.9,'complete']]){
  const s=await seek(start+dt);assert.equal(s.proof.stage,stage);assert.ok(await p.locator('#proof-card').isVisible());
  if(stage==='ratio')assert.ok((await p.locator('#proof-detail').textContent()).includes('√5'));
 }
 for(const t of[22.4,35.5,59.5,66]){
  await seek(t);const radius=await p.evaluate(()=>{const l=window.__goldenLab.lab,s=l.snapshot(),g=l.proof.groups[s.proof.group],a=g.radius.geometry.getAttribute('position');return{visible:g.radius.visible,length:Math.hypot(a.getX(0)-a.getX(1),a.getY(0)-a.getY(1),a.getZ(0)-a.getZ(1)),sweep:s.proof.stage==='compass',arcIndex:s.proof.arcIndex,height:l.construction.height};});
  assert.ok(radius.visible);const expected=radius.height*(radius.sweep?Math.sqrt(5)/2:((1+Math.sqrt(5))/2)**-radius.arcIndex);assert.ok(Math.abs(radius.length-expected)<1e-7);
 }
 const times=[20.7,21.6,22.4,24.5,25.9,28.9,32.9,36,49,53.9,61,73];const expected=[];
 for(const t of times){const s=await seek(t);expected.push({proof:s.proof,counts:s.proofCounts,camera:s.camera,quaternion:s.quaternion});}
 for(let i=times.length-1;i>=0;i--){const s=await seek(times[i]);assert.deepEqual({proof:s.proof,counts:s.proofCounts,camera:s.camera,quaternion:s.quaternion},expected[i]);}
 await seek(28.9);await p.screenshot({path:'public/golden-derivation/verification/25-ipad-proof.png',fullPage:true});
 await p.setViewportSize({width:390,height:844});await seek(24.5);const labelBounds=await p.evaluate(()=>{const l=window.__goldenLab.lab;return l.proof.groups[0].labels.slice(0,4).flatMap(m=>{m.updateWorldMatrix(true,false);const a=m.geometry.getAttribute('position');return Array.from({length:a.count},(_,i)=>m.position.clone().fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(l.camera).toArray());});});assert.ok(labelBounds.every(v=>Math.abs(v[0])<.96&&Math.abs(v[1])<.96));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:'public/golden-derivation/verification/26-phone-proof.png',fullPage:true});
 await p.evaluate(()=>window.__goldenLab.dispose());assert.equal(await p.locator('canvas').count(),0);assert.deepEqual(errors,[]);
 const report={passed:true,version:'1.2',actualWebGL:true,bothGroupsAllConstructionStages:true,compassAndArcRadiusLengthVerified:true,forwardReverseExactState:true,proofCountsAndCameraDeterministic:true,ipadAndPhoneConstructionScreenshots:true,disposeRemovedCanvas:true,errors,environment:'Chromium / SwiftShader with touch emulation, not physical Safari'};fs.writeFileSync('public/golden-derivation/verification/proof-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
