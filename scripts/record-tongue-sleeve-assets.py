#!/usr/bin/env python3
"""Record actual asset-workbench interaction, not a simulated chapter film."""
import json,os,shutil,subprocess,tempfile,time
from pathlib import Path
import playwright
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/tongue-sleeve-lab/verification'
def main():
 ffmpeg=shutil.which('ffmpeg');assert ffmpeg
 with tempfile.TemporaryDirectory(prefix='tongue-assets-recording-') as folder:
  scratch=Path(folder);registry=json.loads((Path(playwright.__file__).parent/'driver/package/browsers.json').read_text());rev=next(x['revision'] for x in registry['browsers'] if x['name']=='ffmpeg');encoder=scratch/'tools'/('ffmpeg-'+rev)/'ffmpeg-linux';encoder.parent.mkdir(parents=True);encoder.symlink_to(ffmpeg);os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(scratch/'tools')
  with sync_playwright() as p:
   browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']);context=browser.new_context(viewport={'width':1440,'height':1000},device_scale_factor=1,record_video_dir=str(scratch/'video'),record_video_size={'width':1440,'height':1000});page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto('http://127.0.0.1:4543/tongue-sleeve-lab.html');page.wait_for_function('window.__tongueAssets?.state().ready',timeout=90000);start=time.monotonic();page.wait_for_timeout(1000)
   page.locator('[data-kind="hand"]').click();page.locator('[data-view="top"]').click();page.wait_for_timeout(1600)
   page.select_option('#hand-view','without-cuff');page.locator('[data-view="top"]').click();page.wait_for_timeout(1500)
   page.select_option('#hand-view','cuff-only');page.locator('[data-view="quarter"]').click();page.wait_for_timeout(600)
   page.evaluate('''async()=>{const a=window.__tongueAssets.lab,t0=performance.now();await new Promise(resolve=>{function frame(now){const t=(now-t0)/3600;a.setBend(Math.sin(Math.min(1,t)*Math.PI)*.7);document.getElementById('cuff-bend').value=String(a.cuffActor.deformation);if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});a.setBend(0);}''');page.wait_for_timeout(600)
   page.select_option('#hand-view','assembled');page.locator('[data-view="quarter"]').click();page.evaluate('''async()=>{const a=window.__tongueAssets.lab,t0=performance.now();await new Promise(resolve=>{function frame(now){const t=(now-t0)/2000,v=Math.sin(Math.min(1,t)*Math.PI)*.35;for(const f of ['thumb','index-finger','middle-finger','ring-finger','pinky-finger']){a.setCurl(f,v);document.querySelector('[data-finger="'+f+'"]').value=String(v);}if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});a.resetHand();}''');page.wait_for_timeout(800)
   page.locator('[data-view="top"]').click();page.wait_for_timeout(1500);state=page.evaluate('window.__tongueAssets.state()');seconds=time.monotonic()-start;video=page.video;context.close();recorded=video.path();browser.close();assert not errors,errors
  output=OUT/'asset-preparation-interaction.mp4';subprocess.run([ffmpeg,'-y','-i',str(recorded),'-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',str(output)],check=True,capture_output=True)
 report={'passed':True,'file':output.name,'purpose':'Actual asset-preparation workbench: blank tongue, removable cuff, remaining robe, stable silver, authored finger joints. Not the completed 19s tongue chapter.','method':'Real-time Playwright browser recording, H.264 encode; no pre-rendered or interpolated geometry frames','environment':'Linux Chromium / SwiftShader, not physical iPad Safari','interactionWallSeconds':seconds,'silverCount':state['cuff']['stoneCount'],'sourceGeometryUnchanged':state['sourceGeometryUnchanged'],'errors':errors};(OUT/'recording.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
