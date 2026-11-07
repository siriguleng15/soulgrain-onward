/** Capture original WebGL frames for a smooth action review. This is not
 * labelled as a real-time performance recording; the lab remains interactive. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'public/tongue-motion-lab/verification'), fps = 24, captureDpr = .8, dir = process.env.TONGUE_REVIEW_FRAMES || fs.mkdtempSync(path.join(os.tmpdir(), 'tongue-motion-v1-1-frames-'));
let browser;
if (path.dirname(fs.realpathSync(dir)) !== fs.realpathSync(os.tmpdir()) || !path.basename(dir).startsWith('tongue-motion-v1-1-frames-') || fs.readdirSync(dir).some(n => n !== 'capture-manifest.json' && !/^frame-\d{5}\.jpg$/.test(n)))
    throw Error('Review frames must be an isolated task-owned temporary directory');
(async () => {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 }), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error')
        errors.push(m.text()); });
    await page.goto('http://127.0.0.1:4553/tongue-motion-lab.html?autoplay=0', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForFunction(() => window.__tongueMotion?.state().ready, undefined, { timeout: 180000 });
    const total = 19 * fps, started = Date.now();
    const quality = await page.evaluate(dpr => {
        const l = window.__tongueMotion.lab;
        l.renderer.setPixelRatio(dpr);
        l.scene.traverse(o => { if (o.isDirectionalLight && o.castShadow) {
            o.shadow.mapSize.setScalar(1024);o.shadow.map?.dispose();o.shadow.map=null;o.shadow.needsUpdate=true;
        } });
        l.renderer.shadowMap.needsUpdate=true;
        return {dpr,width:l.renderer.domElement.width,height:l.renderer.domElement.height,shadowSize:1024};
    },captureDpr);
    const {createHash}=require('node:crypto'), fingerprint=createHash('sha256');
    for(const name of fs.readdirSync(path.join(root,'src/tongue-motion-lab')).sort())fingerprint.update(fs.readFileSync(path.join(root,'src/tongue-motion-lab',name)));
    fingerprint.update(fs.readFileSync(path.join(root,'public/tongue-motion-lab/assets/motion-contract.json')));
    fingerprint.update(fs.readFileSync(path.join(root,'public/tongue-motion-lab/assets/hand-contact-poses.json')));
    const manifest=JSON.stringify({revision:'1.1',fps,quality,sourceHash:fingerprint.digest('hex')}),manifestFile=path.join(dir,'capture-manifest.json');
    if(fs.existsSync(manifestFile)&&fs.readFileSync(manifestFile,'utf8')!==manifest)throw Error('Cannot resume frames from another animation revision');
    fs.writeFileSync(manifestFile,manifest);
    await page.evaluate(() => window.__tongueMotion.renderAt(19, true));
    await page.waitForTimeout(250);
    // Read the actual WebGL canvas immediately after drawing in the same JS task.
    // This avoids compositor screenshot stalls without interpolating any image.
    const times = [];
    for (let i = 0; i <= total; i++) {
        const t = i / fps, file = path.join(dir, 'frame-' + String(i).padStart(5, '0') + '.jpg');
        if (!fs.existsSync(file)) {
            const frame = await page.evaluate(t => { const a = window.__tongueMotion, l = a.lab; a.renderAt(t, true); l.renderer.render(l.scene, l.camera); l.drawRevision = l.revision; l.dirty = false; return l.renderer.domElement.toDataURL('image/jpeg', .93).split(',')[1]; }, t);
            fs.writeFileSync(file, Buffer.from(frame, 'base64'));
        }
        times.push(t);
        if (i % 48 === 0)
            console.log('Captured WebGL review', i, '/', total, 'time', t);
    }
    await page.evaluate(() => window.__tongueMotion.renderAt(19, true));
    const state = await page.evaluate(() => window.__tongueMotion.state());
    if (state.time !== 19 || state.playing || errors.length)
        throw Error('Review did not hold terminal state: ' + errors.join('\n'));
    await browser.close();
    browser = undefined;
    cp.execFileSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', path.join(dir, 'frame-%05d.jpg'), '-vf', 'scale=in_range=full:out_range=limited:out_color_matrix=bt709', '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', path.join(out, 'tongue-motion-v1-1-review.mp4')], { stdio: 'pipe' });
    const report = { passed: true, file: 'tongue-motion-v1-1-review.mp4', fps, quality, frames: times.length, storyDuration: 19, captureWallSeconds: (Date.now() - started) / 1000, method: 'Fixed-timestep captures of the actual browser WebGL scene, encoded H.264. Not a real-time performance claim. No synthetic image interpolation or pre-rendered substitute in the live lab.', environment: 'Linux Chromium / SwiftShader', terminalHeld: true, silverInstances: state.silverCount, errors };
    fs.writeFileSync(path.join(out, 'review-recording.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    // All files in this temporary directory were created by this capture only.
    for (const name of fs.readdirSync(dir))
        fs.unlinkSync(path.join(dir, name));
    fs.rmdirSync(dir);
})().catch(async (e) => { console.error(e); await browser?.close(); process.exitCode = 1; });
