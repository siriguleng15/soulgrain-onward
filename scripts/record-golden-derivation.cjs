/** Frame-stepped actual WebGL capture. A review movie, never a runtime asset. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const dir='/tmp/xiezitu-golden-canvas-frames',fps=20,duration=43;
fs.mkdirSync(dir,{recursive:true});
let browser;
(async()=>{
 if(process.env.GOLDEN_ENCODE_ONLY!=='1'){
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:1024},deviceScaleFactor:1});
 await page.goto(process.env.GOLDEN_URL||'http://127.0.0.1:4561/golden-derivation.html');
 await page.waitForFunction(()=>window.__goldenLab?.state().ready,null,{timeout:120000});
 for(let n=0;n<=fps*duration;n++){
  // Read pixels synchronously immediately after the actual WebGL draw. This
  // avoids a second software-GPU browser compositing pass per captured frame.
  const image=await page.evaluate(t=>{const l=window.__goldenLab.lab;l.seek(t);l.renderer.render(l.scene,l.camera);l.drawRevision=l.revision;l.dirty=false;return l.renderer.domElement.toDataURL('image/jpeg',.94);},n/fps);
  fs.writeFileSync(dir+'/'+String(n).padStart(5,'0')+'.jpg',Buffer.from(image.split(',')[1],'base64'));
  if(n%80===0)console.log('WebGL review frame',n,'/',fps*duration);
 }
 await browser.close();browser=undefined;
 }
 if(!fs.existsSync(dir+'/00860.jpg'))throw Error('Incomplete frame sequence');
 const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',dir+'/00000.jpg'],{encoding:'utf8'});
 const dimensions=JSON.parse(probe.stdout).streams[0];
 const out='public/golden-derivation/verification/motion-review.mp4';
 const r=spawnSync('ffmpeg',['-y','-loglevel','warning','-framerate',String(fps),'-i',dir+'/%05d.jpg','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p,pad=ceil(iw/2)*2:ceil(ih/2)*2,fps=30','-c:v','libx264','-crf','20','-preset','medium','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',out],{stdio:'inherit'});if(r.status)throw Error('ffmpeg failed');
 fs.writeFileSync('public/golden-derivation/verification/recording.json',JSON.stringify({source:'Actual WebGL canvas, deterministic frame stepping and synchronous pixel readback',fpsSource:fps,fpsEncoded:30,duration:43,frames:861,canvas:[dimensions.width,dimensions.height],codec:'H.264/yuv420p',softwareRenderer:'Chromium / SwiftShader',runtimeVideoUsed:false,performanceEvidence:false},null,2)+'\n');console.log(out);
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
