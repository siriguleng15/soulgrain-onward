#!/usr/bin/env python3
"""Record actual, real-time lab playback; no synthetic motion/interpolated frames."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import playwright
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/heel-motion-lab/verification'


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url',default='http://127.0.0.1:4537/heel-motion-lab.html');args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise RuntimeError('System FFmpeg is required for the review MP4')
    with tempfile.TemporaryDirectory(prefix='heel-lab-recording-') as folder:
        scratch=Path(folder)
        # Use the already installed encoder in a task-local cache; do not install
        # into HOME or change the project dependency manifest.
        registry=json.loads((Path(playwright.__file__).parent/'driver/package/browsers.json').read_text())
        revision=next(x['revision'] for x in registry['browsers'] if x['name']=='ffmpeg')
        cache=scratch/'browser-tools';encoder=cache/('ffmpeg-'+revision)/'ffmpeg-linux';encoder.parent.mkdir(parents=True);encoder.symlink_to(ffmpeg)
        os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(cache)
        errors=[]
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            context=browser.new_context(viewport={'width':1280,'height':800},device_scale_factor=1,record_video_dir=str(scratch/'video'),record_video_size={'width':1280,'height':800})
            page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(args.url,wait_until='domcontentloaded',timeout=90000);page.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
            page.locator('[data-action="play"]').click();started=time.monotonic()
            page.wait_for_function('window.__heelLab.getState().progress>=1&&!window.__heelLab.getState().playing',timeout=180000)
            seconds=time.monotonic()-started;page.wait_for_timeout(700);final=page.evaluate('window.__heelLab.getState()');video=page.video
            context.close();recorded=Path(video.path());browser.close()
        if not final['actor']['originalPanelVisible'] or final['actor']['derivedVisible'] or errors:raise RuntimeError('Recorded scene did not restore cleanly: '+str(errors))
        subprocess.run([ffmpeg,'-y','-i',str(recorded),'-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'heel-motion-lab-v1.mp4')],check=True,capture_output=True)
        result={'passed':True,'file':'heel-motion-lab-v1.mp4','method':'Playwright actual viewport recording of button-triggered real-time WebGL playback; H.264 conversion, no synthetic/interpolated animation frames','environment':'Linux Chromium + SwiftShader, not hardware-GPU or iPad Safari','playbackWallSeconds':seconds,'finalState':final,'errors':errors}
        (OUT/'recording.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({'passed':True,'file':str(OUT/'heel-motion-lab-v1.mp4'),'playbackWallSeconds':seconds},ensure_ascii=False),flush=True)


if __name__=='__main__':main()
