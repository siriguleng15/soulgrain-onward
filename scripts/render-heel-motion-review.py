#!/usr/bin/env python3
"""Supplementary deterministic WebGL frame review, explicitly NOT a real-time FPS benchmark."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/heel-motion-lab/verification'


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url',default='http://127.0.0.1:4537/heel-motion-lab.html');parser.add_argument('--fps',type=int,choices=[12,24],default=12);args=parser.parse_args()
    started=time.monotonic();fps=args.fps;count=0;max_error=0;minimum_dot=1;phases=set();filename=f'heel-motion-lab-v1-{fps}fps.mp4'
    with tempfile.TemporaryDirectory(prefix='heel-motion-frames-') as folder:
      with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        page=browser.new_page(viewport={'width':1100,'height':760},device_scale_factor=1);page.goto(args.url,wait_until='domcontentloaded',timeout=90000);page.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
        duration=page.evaluate('window.__heelLab.getState().duration');count=round(duration*fps)
        page.evaluate('''() => {const l=window.__heelLab.lab;l.pause();cancelAnimationFrame(l.frame);l.frame=0;l.cameraOwner='director';}''')
        hold_frames=round(1.5*fps)
        for i in range(count+hold_frames+1):
            result=page.evaluate('(p)=>window.__heelLab.renderAt(p)',min(1,i/count))
            max_error=max(max_error,result['path']['frameError']);minimum_dot=min(minimum_dot,result['path']['minimumFrameDot']);phases.add(result['phase'])
            page.screenshot(path=str(Path(folder)/f'{i:04}.png'))
            if i%48==0:print(f'Actual WebGL review frames: {i}/{count+hold_frames}',flush=True)
        final=page.evaluate('window.__heelLab.getState()');assert final['progress']==1 and final['actor']['derivedVisible'] and not final['playing'];browser.close()
      # Validate before replacing a previous review movie.
      assert max_error<1e-6 and minimum_dot>0, (max_error,minimum_dot)
      subprocess.run(['ffmpeg','-y','-framerate',str(fps),'-i',str(Path(folder)/'%04d.png'),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/filename)],check=True,capture_output=True)
    result={'revision':final['revision'],'motionSourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'passed':True,'file':filename,'frames':count+hold_frames+1,'fps':fps,'duration':duration,'samplingWallSeconds':time.monotonic()-started,'maximumFrameError':max_error,'minimumFrameDot':minimum_dot,'phases':sorted(phases),'finalHeld':True,'holdSeconds':hold_frames/fps,'automaticReverse':False,
            'method':f'Every frame is a fresh screenshot of the actual WebGL lab at a deterministic 1/{fps}-second animation time. No generated/interpolated image frames. This is a sampled motion review, NOT real-time device performance; see the separate real-time recording.'}
    result['videoSHA256']=hashlib.sha256((OUT/filename).read_bytes()).hexdigest()
    result['artwork']=final.get('artwork')
    (OUT/'frame-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False),flush=True)


if __name__=='__main__':main()
