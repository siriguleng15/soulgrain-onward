#!/usr/bin/env python3
"""Record the real browser and actual controls; never replace the live WebGL scene."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

import playwright
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/tongue-motion-lab/verification'


def main():
    ffmpeg = shutil.which('ffmpeg')
    assert ffmpeg, 'ffmpeg is required for a Safari-compatible H.264 export'
    with tempfile.TemporaryDirectory(prefix='tongue-motion-live-') as folder:
        scratch = Path(folder)
        registry = json.loads((Path(playwright.__file__).parent / 'driver/package/browsers.json').read_text())
        revision = next(x['revision'] for x in registry['browsers'] if x['name'] == 'ffmpeg')
        encoder = scratch / 'tools' / ('ffmpeg-' + revision) / 'ffmpeg-linux'
        encoder.parent.mkdir(parents=True)
        encoder.symlink_to(ffmpeg)
        os.environ['PLAYWRIGHT_BROWSERS_PATH'] = str(scratch / 'tools')
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=[
                '--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1,
                record_video_dir=str(scratch / 'video'), record_video_size={'width': 1440, 'height': 1000})
            recording_started = time.monotonic()
            page = context.new_page()
            page.set_default_timeout(45000)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto('http://127.0.0.1:4553/tongue-motion-lab.html?autoplay=0', wait_until='domcontentloaded')
            page.wait_for_function('window.__tongueMotion?.state().ready', timeout=180000)
            print('Live capture ready: V1.1', flush=True)
            # Warm the real renderer, then use only visible controls for the recording.
            page.locator('[data-shot="09"]').click()
            page.wait_for_timeout(500)
            page.locator('#reset').click()
            page.wait_for_timeout(500)
            # Exercise rapid replay/cancel and the visibility pause before the
            # review recording begins. Visibility is a synthetic lifecycle test.
            page.locator('#replay').click()
            page.locator('#replay').click()
            page.locator('#reset').click()
            assert page.evaluate('window.__tongueMotion.state().time') == 0
            background_paused = page.evaluate('''()=>{
                const a=window.__tongueMotion;a.play();
                Object.defineProperty(document,'hidden',{configurable:true,value:true});
                document.dispatchEvent(new Event('visibilitychange'));
                const paused=!a.state().playing;delete document.hidden;a.reset();return paused;
            }''')
            assert background_paused
            cut_in = time.monotonic() - recording_started
            page.wait_for_timeout(800)
            start = time.monotonic()
            page.locator('#play').click()
            page.wait_for_function('window.__tongueMotion.state().time===19 && !window.__tongueMotion.state().playing')
            forward_seconds = time.monotonic() - start
            print('Forward playback and end hold complete', flush=True)
            page.wait_for_timeout(1200)
            page.select_option('#speed', '3')
            page.locator('#reverse').click()
            page.wait_for_function('window.__tongueMotion.state().time===0 && !window.__tongueMotion.state().playing')
            print('Independent reverse complete', flush=True)
            page.wait_for_timeout(500)
            slider = page.locator('#timeline')
            slider.focus()
            slider.press('Home')
            for _ in range(7):
                slider.press('PageUp')
            page.wait_for_timeout(500)
            page.locator('#pause').click()
            box = page.locator('canvas').bounding_box()
            x, y = box['x'] + box['width'] * .65, box['y'] + box['height'] * .5
            page.mouse.move(x, y)
            page.mouse.down()
            page.mouse.move(x + 80, y + 25, steps=12)
            page.mouse.up()
            page.wait_for_timeout(600)
            assert page.evaluate('window.__tongueMotion.state().cameraOwner') == 'user'
            page.locator('#director').click()
            page.wait_for_function('window.__tongueMotion.state().cameraOwner==="director"')
            page.locator('[data-shot="09"]').click()
            page.wait_for_timeout(1800)
            state = page.evaluate('window.__tongueMotion.state()')
            assert state['time'] == 19 and not state['playing'] and state['crystalFront'] == 1
            video = page.video
            context.close()
            recorded = video.path()
            browser.close()
            assert not errors, errors
        output = OUT / 'tongue-motion-v1-1-interaction.mp4'
        subprocess.run([ffmpeg, '-y', '-ss', str(cut_in), '-i', str(recorded), '-an', '-c:v', 'libx264',
            '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output)],
            check=True, capture_output=True)
    report = {
        'passed': True, 'file': output.name, 'environment': 'Linux Chromium / SwiftShader; not physical iPad Safari',
        'method': 'Real-time browser recording of visible playback, reverse, timeline, orbit and director controls; H.264. Loading trimmed; no synthesized or interpolated motion frames.',
        'forwardPlaybackWallSeconds': forward_seconds, 'storyDuration': 19,
        'controlsRecorded': ['play at 1x', 'terminal hold', 'explicit reverse at 3x', 'timeline keyboard seek', 'pause', 'drag orbit', 'restore director', 'final frame'],
        'terminalHeld': True, 'rapidReplayCancel': True, 'syntheticVisibilityPause': background_paused,
        'silverInstances': state['silverCount'], 'errors': errors}
    (OUT / 'interaction-recording.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
