/** Publication-only smoke: the full interaction suite lives in check-golden-world-browser.cjs. */
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.argv[2],out=process.argv[3];
if(!base||!out)throw Error('Usage: node script BASE_URL NEW_REPORT_PATH');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  // This container's Chromium does not include the execution proxy CA; urllib's
  // system-trust download separately verifies the public bytes and SHA-256.
  // This affects this test context only, never the published application.
  const page=await browser.newPage({viewport:{width:1194,height:834},deviceScaleFactor:1,ignoreHTTPSErrors:true}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const responses=[];page.on('response',r=>{if(r.url().endsWith('soul-new-web.glb'))responses.push({url:r.url(),status:r.status()})});
  await page.goto(base+'/golden-derivation.html?autoplay=0',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__goldenLab?.state().ready||window.__goldenLab?.state().rejected,null,{timeout:180000});
  const state=()=>page.evaluate(()=>window.__goldenLab.state());let s=await state();
  assert.equal(s.ready,true);assert.equal(s.constructionVersion,'1.3');assert.equal(s.wireframe.sourceTriangles,1499039);assert.equal(s.wireframe.amount,0);assert.equal(s.duration,76.6);assert.ok(s.sourceBlendSha256.startsWith('7257569'));
  assert.equal(responses.length,1);assert.equal(responses[0].status,200);assert.ok(responses[0].url.includes('1cbfefa63b031df6a801d2954cb4529d6ad59f01'));
  const stages=[];
  for(const t of [1.52,2.8,26,39.6,64.6,76.6]){
   await page.evaluate(t=>window.__goldenLab.seek(t),t);await page.waitForFunction(()=>window.__goldenLab.state().revision===window.__goldenLab.state().drawRevision);
   s=await state();if(t>=2.8)assert.equal(s.wireframe.amount,1);if(t===26)assert.equal(s.proof.stage,'compass');if(t===76.6)assert.equal(s.playing,false);
   stages.push({time:t,shot:s.shot,proof:s.proof.stage,wire:s.wireframe.amount});
  }
  await page.locator('#reset').click();assert.equal((await state()).wireframe.amount,0);
  await page.goto(base+'/golden-derivation/soul-v1-3/review.html',{waitUntil:'domcontentloaded'});
  const imgs=await page.locator('img').evaluateAll(async images=>Promise.all(images.map(async im=>{im.loading='eager';try{await im.decode()}catch{}return{src:im.src,width:im.naturalWidth}})));
  assert.equal(imgs.length,10);assert.ok(imgs.every(i=>i.width>0));assert.deepEqual(errors,[]);
  const report={passed:true,base,version:'1.3',sourceBlendSha256:s.sourceBlendSha256,model:responses[0],stages,reviewImages:imgs.length,errors,environment:'Linux Chromium / SwiftShader, iPad viewport. Physical iPad Safari untested.',tlsNote:'Test context ignores HTTPS certificate errors because Chromium lacks execution proxy CA. Separate system-trust HTTPS download verified model bytes and SHA-256. Published application has no TLS bypass.'};
  fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
