const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.GOLDEN_REVIEW_URL||'http://127.0.0.1:4563/golden-derivation/review.html');
 await page.locator('video').evaluate(async v=>{v.muted=true;await v.play();});await page.waitForFunction(()=>document.querySelector('video').currentTime>1);
 await page.locator('video').evaluate(v=>{v.pause();v.currentTime=24.5;});await page.waitForFunction(()=>{const v=document.querySelector('video');return !v.seeking&&v.readyState>=2;});
 const video=await page.locator('video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,duration:v.duration,time:v.currentTime}));
 assert.equal(video.width,1280);assert.equal(video.height,670);assert.ok(Math.abs(video.time-24.5)<.1);assert.deepEqual(errors,[]);
 await page.screenshot({path:'public/golden-derivation/verification/14-review-browser.png'});
 const report={passed:true,nativeVideoPlayed:true,nativeVideoSeeked:true,video,errors,environment:'Linux Chromium native H.264 decoder; not physical iPad Safari.'};fs.writeFileSync('public/golden-derivation/verification/media-browser-check.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
