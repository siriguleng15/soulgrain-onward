/** Verify real chapter playback, contact, persistence and camera ownership. */
const { chromium, devices } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'public/tongue-motion-lab/verification'), url = process.env.TONGUE_MOTION_URL || 'http://127.0.0.1:4551/tongue-motion-lab.html?autoplay=0';
const launch = { executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
async function ready(p) { p.setDefaultTimeout(45000); console.log('QA loading page'); await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForFunction(() => window.__tongueMotion?.state().ready, undefined, { timeout: 180000 }); await p.evaluate(() => window.__tongueMotion.pause()); }
async function seek(p, t, force = true) { const revision = await p.evaluate(([t, f]) => window.__tongueMotion.renderAt(t, f), [t, force]); await p.waitForFunction(r => window.__tongueMotion.state().drawRevision >= r, revision, { timeout: 30000 }); return p.evaluate(() => window.__tongueMotion.state()); }
let browser;
(async () => {
    fs.mkdirSync(out, { recursive: true });
    const b = browser = await chromium.launch(launch), p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 }), errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    p.on('console', m => { if (m.type() === 'error')
        errors.push(m.text()); });
    await ready(p);
    await seek(p, 9.3);
    console.log('QA warm complete');
    const programBaseline = await p.evaluate(() => window.__tongueMotion.lab.renderer.info.programs.length);
    const initial = await seek(p, 0);
    assert.equal(initial.silverCount, 785);
    assert.equal(initial.crystalFront, 0);
    assert.equal(initial.handVisible, false);
    assert.equal(await p.locator('canvas').count(), 1);
    const frames = [[0, '01-plain-shoe'], [2.9, '02-cuff-enters'], [5.8, '03-real-pinch'], [7.8, '04-palm-contact'], [9.3, '05-sleeve-flip'], [13.3, '06-white-sleeve-left'], [14.43, '07-snap'], [15.6, '08-crystal-front'], [19, '09-final-shoe']], states = [];
    for (const [t, name] of frames) {
        const s = await seek(p, t);
        assert.equal(s.silverIdentity, initial.silverIdentity);
        assert.equal(s.silverMaterial, initial.silverMaterial);
        assert.equal(s.cuffIdentity, initial.cuffIdentity);
        if (t < 14.5)
            assert.equal(s.crystalFront, 0);
        if (t === 19) {
            assert.equal(s.crystalFront, 1);
            assert.equal(s.handVisible, false);
        }
        if (t === 5.8) {
            assert.ok(s.gripContactMm.indexGripMm < 1.2);
            assert.ok(s.gripContactMm.thumbGripMm < 1.3);
        }
        await p.screenshot({ path: path.join(out, name + '.png') });
        states.push(s);
    }
    await seek(p, 13.8);
    const beforeSilver = await p.evaluate(() => Array.from(window.__tongueMotion.lab.actor.stones.instanceMatrix.array));
    await p.screenshot({ path: path.join(out, 'material-before-snap.png') });
    await seek(p, 16.8);
    const afterSilver = await p.evaluate(() => Array.from(window.__tongueMotion.lab.actor.stones.instanceMatrix.array));
    assert.deepEqual(beforeSilver, afterSilver, 'Crystal change altered silver geometry');
    await p.screenshot({ path: path.join(out, 'material-after-snap.png') });
    console.log('QA keyframes and material pair complete');
    const framing = await p.evaluate(() => { const a = window.__tongueMotion, l = a.lab; const sample = t => { a.renderAt(t, true); const camera = l.camera, g = l.actor.stones; g.updateWorldMatrix(true, false); let visible = 0; const m = g.matrixWorld.clone(), point = camera.position.clone(), positions = []; for (let i = 0; i < 785; i += 5) {
        g.getMatrixAt(i, m);
        point.setFromMatrixPosition(m).applyMatrix4(g.matrixWorld).project(camera);
        positions.push(point.toArray());
        if (Math.abs(point.x) < .97 && Math.abs(point.y) < .97 && point.z > -1 && point.z < 1)
            visible++;
    } const forward = camera.position.clone().set(0, 0, -1).applyQuaternion(camera.quaternion), target = l.director.target.clone().sub(camera.position).normalize(); const palm = l.hand.bones.get('palm').getWorldPosition(point).project(camera); return { time: t, visibleRatio: visible / positions.length, aimError: forward.angleTo(target), palmNdc: palm.toArray() }; }; return [sample(2.9), sample(4.8), sample(7.8), sample(14.35)]; });
    assert.ok(framing[2].visibleRatio > .85, 'Cuff medallion is cropped before flipping');
    assert.ok(framing[0].visibleRatio > .7, 'Cuff medallion is cropped during entry');
    assert.ok(framing.every(x => x.aimError < 1e-6), 'Director lost the subject');
    assert.ok(Math.abs(framing[3].palmNdc[1]) < .96, 'Snap palm is outside frame');
    const batchError = await p.evaluate(() => { const a = window.__tongueMotion, l = a.lab; let error = 0; const m = l.camera.matrix.clone(), v = l.camera.position.clone(); for (const t of [2.9, 5.8, 9.3, 10.8, 11.8, 13.8, 19]) {
        a.renderAt(t, true);
        for (let i = 0; i < 785; i += 23) {
            l.actor.stones.getMatrixAt(i, m);
            v.setFromMatrixPosition(m).applyMatrix4(l.actor.stones.matrixWorld);
            error = Math.max(error, v.distanceTo(l.actor.stoneFrame(i).position));
        }
    } return error; });
    assert.ok(batchError < 1e-5, 'Fast silver evaluation differs from source surface bindings');
    // Seeking must reconstruct identical vertices, bones, uniforms and transforms.
    console.log('QA framing complete');
    const repeat = await p.evaluate(() => { const a = window.__tongueMotion, l = a.lab; function snap(t) { a.renderAt(t, true); const v = l.actor.cuff.geometry.getAttribute('position'), index = 2000, p = l.actor.cuff.getVertexPosition(index, l.camera.position.clone()); return JSON.stringify({ hand: l.handGroup.matrix.toArray(), cloth: l.clothGroup.matrix.toArray(), p: p.toArray(), bones: [...l.hand.bones.values()].map(b => b.quaternion.toArray()), weights: l.actor.cuff.morphTargetInfluences, uv: v.count, crystal: l.crystal.front.value }); } const first = snap(9.3); for (let i = 0; i < 15; i++) {
        snap(19);
        snap(0);
        snap(4.8);
    } const same = first === snap(9.3); const staticRoot = l.tongues[2], position = staticRoot.geometry.getAttribute('position'), q = l.camera.position.clone(); let error = 0; for (let i = 0; i < position.count; i += 97)
        error = Math.max(error, staticRoot.getVertexPosition(i, q).distanceTo(q.clone().fromBufferAttribute(position, i))); return { deterministic: same, rootError: error, programs: l.renderer.info.programs.length, silverIdentity: l.actor.stones.uuid }; });
    assert.equal(repeat.deterministic, true);
    assert.ok(repeat.rootError < 1e-8);
    assert.ok(repeat.programs <= programBaseline + 1, 'Seeking compiled new shaders');
    console.log('QA deterministic seeks complete');
    for (const t of [2.9, 5.8, 7.8, 9.3, 11.8, 14.4, 15.6, 19]) {
        await seek(p, t);
        await p.locator('#reset').click();
        assert.equal((await p.evaluate(() => window.__tongueMotion.state())).time, 0);
        assert.equal((await p.evaluate(() => window.__tongueMotion.state())).crystalFront, 0);
    }
    console.log('QA cancels complete');
    await seek(p, 18.8);
    await p.selectOption('#speed', '3');
    await p.locator('#play').click();
    await p.waitForFunction(() => window.__tongueMotion.state().time === 19 && !window.__tongueMotion.state().playing);
    await p.waitForTimeout(650);
    assert.equal((await p.evaluate(() => window.__tongueMotion.state())).time, 19);
    console.log('QA forward held');
    await p.locator('#reverse').click();
    await p.waitForFunction(() => window.__tongueMotion.state().time === 0 && !window.__tongueMotion.state().playing, undefined, { timeout: 45000 });
    console.log('QA reverse complete');
    await p.locator('#play').click();
    await p.waitForFunction(() => window.__tongueMotion.state().time > .1);
    await p.locator('#pause').click();
    const paused = await p.evaluate(() => window.__tongueMotion.state().time);
    await p.waitForTimeout(250);
    assert.equal(await p.evaluate(() => window.__tongueMotion.state().time), paused);
    console.log('QA pause complete');
    await seek(p, 7.8);
    const before = await p.evaluate(() => window.__tongueMotion.lab.camera.quaternion.toArray());
    const rect = await p.locator('canvas').boundingBox();
    const x = rect.x + rect.width * .68, y = rect.y + rect.height * .48;
    await p.mouse.move(x, y);
    await p.mouse.down();
    const afterDown = await p.evaluate(() => window.__tongueMotion.lab.camera.quaternion.toArray());
    const dot = Math.abs(before.reduce((s, n, i) => s + n * afterDown[i], 0));
    assert.ok(dot > .99999, 'Camera jumped on ownership transfer');
    await p.mouse.move(x + 100, y + 20, { steps: 8 });
    await p.mouse.up();
    assert.equal((await p.evaluate(() => window.__tongueMotion.state())).cameraOwner, 'user');
    const userStable = await p.evaluate(() => { const a = window.__tongueMotion, c = a.lab.camera, before = c.position.toArray(); a.renderAt(15.6, false); return before.every((v, i) => Math.abs(v - c.position.toArray()[i]) < 1e-9); });
    assert.ok(userStable, 'Timeline fought user camera');
    await p.locator('#director').click();
    await p.waitForFunction(() => window.__tongueMotion.state().cameraOwner === 'director');
    console.log('QA camera ownership complete');
    const context = await p.evaluate(() => { const l = window.__tongueMotion.lab, e = l.renderer.getContext().getExtension('WEBGL_lose_context'); if (!e)
        return false; window.__restoreMotionGL = () => e.restoreContext(); e.loseContext(); return true; });
    if (context) {
        await p.waitForFunction(() => window.__tongueMotion.state().contextLost);
        await p.waitForTimeout(200);
        await p.evaluate(() => window.__restoreMotionGL());
        await p.waitForFunction(() => !window.__tongueMotion.state().contextLost);
        await seek(p, 13.3);
    }
    console.log('QA context complete');
    assert.deepEqual(errors, []);
    await p.close();
    console.log('QA tablet');
    const tablet = await b.newContext({ ...devices['iPad Pro 11'], browserName: undefined }), tp = await tablet.newPage();
    await ready(tp);
    await seek(tp, 13.3);
    assert.equal(await tp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const tr = await tp.locator('canvas').boundingBox(), cdp = await tablet.newCDPSession(tp);
    const tx = tr.x + tr.width * .7, ty = tr.y + tr.height * .55;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] });
    for (let i = 1; i <= 6; i++)
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx + i * 9, y: ty + i * 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal((await tp.evaluate(() => window.__tongueMotion.state())).cameraOwner, 'user');
    await tp.screenshot({ path: path.join(out, '10-tablet-touch.png') });
    await tablet.close();
    console.log('QA phone');
    const phone = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ready(phone);
    await seek(phone, 19);
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await phone.screenshot({ path: path.join(out, '11-phone-layout.png'), fullPage: true });
    await phone.close();
    const fail = await b.newPage();
    await fail.route('**/tongue-cuff-morphs.f16', r => r.abort());
    await fail.goto(url);
    await fail.locator('#error').waitFor({ state: 'visible', timeout: 60000 });
    assert.equal(await fail.locator('canvas').count(), 1);
    assert.deepEqual(errors, []);
    const report = { passed: true, environment: 'Linux Chromium / SwiftShader; touch is device emulation, not physical iPad Safari', sameSilverAndCuffThroughout: true, silverGeometryExactlyEqualAcrossMaterialChange: true, preSnapCrystalAlwaysZero: true, frames: states, framing, repeat, fastSilverBindingMaxError: batchError, cancelEachPhase: true, forwardHeld: true, independentReverseRestored: true, pauseStable: true, cameraOwnershipNoJump: true, timelineRetainsUserCamera: true, contextRestored: context, touchDrag: true, mobileNoOverflow: true, loadFailureVisible: true, singleCanvas: true, errors };
    fs.writeFileSync(path.join(out, 'browser-validation.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ passed: true, framing, repeat, errors }, null, 2));
    await b.close();
})().catch(async (e) => { console.error(e); await browser?.close(); process.exitCode = 1; });
