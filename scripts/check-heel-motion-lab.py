#!/usr/bin/env python3
"""Actual Chromium/SwiftShader lab interaction, geometry, touch and recording checks.
Not a physical iPad Safari test. Writes only the new lab verification directory.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import subprocess
import time
from datetime import datetime
from zoneinfo import ZoneInfo
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/heel-motion-lab/verification'
SHA='1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4'
HASH_JS="""() => {const a=window.__heelLab.lab.ribbon.geometry.getAttribute('position').array;let h=2166136261;const bytes=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);for(const v of bytes)h=Math.imul(h^v,16777619);return (h>>>0).toString(16)}"""
JOIN_JS="""() => {const l=window.__heelLab.lab,a=l.actor;if(!a.group.visible||!l.ribbon.group.visible)return 0;const source=a.panel.geometry.getAttribute('uv'),p=a.group.children[0].geometry.getAttribute('position'),r=l.ribbon.geometry.getAttribute('position');let error=0;for(let i=0;i<source.count;i++){if(source.getY(i)<.823437)continue;const j=Math.round((source.getX(i)-.14576271176338196)/(.9152542352676392-.14576271176338196)*12);error=Math.max(error,Math.hypot(p.getX(i)-r.getX(j),p.getY(i)-r.getY(j),p.getZ(i)-r.getZ(j)));}return error;}"""


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url',default='http://127.0.0.1:4537/heel-motion-lab.html')
    parser.add_argument('--record',action='store_true')
    args=parser.parse_args();OUT.mkdir(parents=True,exist_ok=True)
    checks=[];errors=[];bad_responses=[];keyframes=[]
    def check(name,ok,detail=None):
        checks.append({'name':name,'passed':bool(ok),'detail':detail})
        print(('PASS ' if ok else 'FAIL ')+name,flush=True)
        assert ok,(name,detail)
    source=ROOT/'public/assets/onward-ad-v1/onward-ad-v1.glb'
    check('original GLB byte integrity',hashlib.sha256(source.read_bytes()).hexdigest()==SHA)
    r=subprocess.run(['python3','-B','.agents/skills/onward-asset-contract/scripts/inspect_glb.py'],cwd=ROOT,capture_output=True,text=True)
    asset=json.loads(r.stdout);check('asset Skill verifies all protected source contracts',r.returncode==0 and asset['passed'],{'checks':asset.get('checks')})
    report={'testedAt':datetime.now(ZoneInfo('Asia/Shanghai')).isoformat(),'url':args.url,'environment':'Linux Chromium + SwiftShader software WebGL; desktop and emulated touch. NOT physical iPad Safari.','checks':checks,'errors':errors,'badResponses':bad_responses,'keyframes':keyframes,'limitations':['Bounding-box warnings are conservative candidates, not a triangle collision proof.','No physical iPad Safari or hardware-GPU performance certification.','This is the V1 motion study, not final advertising quality.']}
    browser=None
    try:
      with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        context=browser.new_context(viewport={'width':1440,'height':950},device_scale_factor=1)
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'favicon' not in m.text else None)
        page.on('response',lambda r:bad_responses.append({'url':r.url,'status':r.status}) if r.status>=400 and 'favicon' not in r.url else None)
        page.goto(args.url,wait_until='domcontentloaded',timeout=90000);page.wait_for_function('window.__heelLab && (window.__heelLab.getState().ready||window.__heelLab.getState().error)',timeout=90000)
        state=lambda:page.evaluate('window.__heelLab.getState()')
        check('real colored GLB loaded and SHA verified in browser',state()['ready'] and state()['browserVerifiedSHA']==SHA)
        initial=state();check('source UV surface correspondence',initial['actor']['exactRestSurfaceError']<1e-6,initial['actor'])
        check('one live WebGL canvas',page.locator('#stage canvas').count()==1)
        def story(value):return .10+.90*value
        def seek(value):return page.evaluate('(p)=>{window.__heelLab.seek(p);return window.__heelLab.getState();}',story(value))
        def view(name):
            page.evaluate('(v)=>window.__heelLab.setView(v)',name)
            page.wait_for_function('!window.__heelLab.getState().directorMoving',timeout=20000)
        def shot(name,progress,view_name,raw=False):
            page.evaluate('(p)=>window.__heelLab.seek(p)',progress if raw else story(progress));view(view_name);page.wait_for_timeout(120);page.screenshot(path=str(OUT/(name+'.png')))
            s=state();keyframes.append({'image':name+'.png','progress':progress if raw else story(progress),'view':view_name,'state':s,'joinError':page.evaluate(JOIN_JS)})
        # Regression for the art review: inspect actual rendered vertices in the
        # shoe's coordinates, not screen arrows or the curve's intended controls.
        exit_samples=[]
        for progress in [.025,.045,.07,.10,.13]:
            seek(progress)
            result=page.evaluate('''() => {const l=window.__heelLab.lab,inv=l.pose.matrix.clone().invert(),p=l.ribbon.geometry.getAttribute('position'),cols=l.ribbon.across+1;let maxY=-Infinity;const first=l.ribbon.centers[0].clone().applyMatrix4(inv);let last=first,arc=0;for(let i=0;i<l.ribbon.centers.length;i++){const point=l.ribbon.centers[i].clone().applyMatrix4(inv);if(i)arc+=point.distanceTo(last);if(arc>.55)break;for(const j of[0,6,12]){const v=l.path.points[0].clone().fromBufferAttribute(p,i*cols+j).applyMatrix4(inv);maxY=Math.max(maxY,v.y);}last=point;}const cuff=l.asset.getObjectByName('AD_Cuff_Shell');const cuffBox=l.sourceBox.clone().makeEmpty();cuff.traverse(m=>{if(!m.isMesh)return;m.geometry.computeBoundingBox();cuffBox.union(m.geometry.boundingBox.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld)));});return{edge:l.getState().path.sourceEdge,down:last.y-first.y,outward:last.x-first.x,maxY,cuffMinY:cuffBox.min.y,sourceLowerY:l.actor.surface.lower.y};}''')
            exit_samples.append({'progress':story(progress),'actionProgress':progress,**result})
        check('red ribbon feeds from lower edge downward and outward',all(x['edge']=='lower' and x['down']<-.03 and x['outward']>0 for x in exit_samples),exit_samples)
        check('initial red lead stays below the actual folded cuff',all(x['maxY']<x['cuffMinY']-.02 for x in exit_samples),exit_samples)
        seek(.012);early=state();reaction_samples=[]
        for value in [.08,.15,.23,.33,.44,.56,.68]:
            sample=seek(value);reaction_samples.append({'progress':story(value),'actionProgress':value,**sample['reaction'],'shoe':sample['shoe']})
        check('shoe rotates only around its longitudinal X axis with delay',math.dist(early['shoe']['quaternion'],[0,0,0,1])<1e-9 and max(abs(s['angularVelocity'][0]) for s in reaction_samples)>.08 and all(abs(s['angularVelocity'][1])+abs(s['angularVelocity'][2])+abs(s['shoe']['quaternion'][1])+abs(s['shoe']['quaternion'][2])<1e-12 for s in reaction_samples),reaction_samples)
        seek(.32);before=state()['shoe']['quaternion'];page.evaluate('window.__heelLab.setParameter("direction",30)');changed=state()['shoe']['quaternion']
        check('diagonal ribbon orientation preserves longitudinal-only shoe rotation',math.dist(before,changed)<1e-12,{'before':before,'after':changed})
        page.evaluate('window.__heelLab.lab.resetPath()');seek(.44);before=state()['shoe']['quaternion'];page.evaluate('window.__heelLab.lab.selectPoint(10);window.__heelLab.lab.editPoint("z",.6)')
        check('edited 3D path preserves the shoe rotation axis',math.dist(before,state()['shoe']['quaternion'])<1e-12)
        page.evaluate('window.__heelLab.lab.resetPath()');seek(.44);before=state()['shoe']['quaternion'];page.evaluate('window.__heelLab.setParameter("turns",3)')
        check('winding count still controls longitudinal rotation',math.dist(before,state()['shoe']['quaternion'])>.1)
        page.evaluate('window.__heelLab.lab.resetPath()')
        report['lowerExitSamples']=exit_samples;report['reactionSamples']=reaction_samples
        camera_samples=[]
        for progress in [0,.045,.09,.105,.145,.22,.32,.43]:
            sample=page.evaluate('(p)=>window.__heelLab.renderAt(p)',progress)
            frame=page.evaluate('''() => {const l=window.__heelLab.lab,a=l.actor,upper=a.surface.upper.clone().applyMatrix4(l.pose.matrix).project(l.camera),lower=a.surface.lower.clone().applyMatrix4(l.pose.matrix).project(l.camera);return{distance:l.camera.position.distanceTo(l.controls.target),heelScreenHeight:Math.abs(upper.y-lower.y)/2,sourceError:a.maxRestError,rootError:l.path.points[2].clone().applyMatrix4(l.pose.matrix.clone().invert()).distanceTo(a.surface.lower)};}''')
            camera_samples.append({'progress':progress,'ribbonVisible':sample['ribbon']['tip'] is not None,**frame})
        check('camera reaches the heel before any ribbon emerges',all(not s['ribbonVisible'] for s in camera_samples[:3]) and camera_samples[2]['distance']<camera_samples[0]['distance']*.4,camera_samples[:4])
        check('heel closeup occupies more than half the viewport height',camera_samples[2]['heelScreenHeight']>.5,camera_samples[2])
        check('camera pulls back gradually after ribbon emergence',camera_samples[4]['ribbonVisible'] and all(camera_samples[i+1]['distance']>camera_samples[i]['distance'] for i in range(3,len(camera_samples)-1)),camera_samples)
        check('source leather and lower anchor do not hinge outward',all(s['sourceError']<1e-6 and s['rootError']<1e-8 for s in camera_samples),camera_samples)
        # Inspect the actual cap, not just the animation easing function.
        cap_samples=[]
        for value in [.003,.006,.012]:
            seek(value)
            cap_samples.append(page.evaluate('''() => {const l=window.__heelLab.lab,r=l.ribbon,a=r.geometry.getAttribute('position'),layer=(r.segments+1)*(r.across+1),i=r.segments*(r.across+1)+r.across/2,p=l.path.points[0].clone().fromBufferAttribute(a,i),q=l.path.points[0].clone().fromBufferAttribute(a,i+layer);return{length:l.path.tipLength-l.path.restLength,thickness:p.distanceTo(q),maximum:l.params.thickness};}'''))
        check('emerging cap thickness grows with actual fed length',all(s['thickness']<s['maximum']*.9 for s in cap_samples[:2]) and cap_samples[0]['thickness']<cap_samples[-1]['thickness'],cap_samples)
        # Returning during the introductory camera move must also be continuous.
        page.evaluate('window.__heelLab.renderAt(.075)');before=state();page.locator('[data-action="return"]').click();immediate=state()
        check('return from camera introduction starts without a jump',math.dist(before['camera'],immediate['camera'])<1e-8 and math.dist(before['target'],immediate['target'])<1e-8)
        page.evaluate('window.__heelLab.lab.advance(5);window.__heelLab.pause()');page.wait_for_function('Math.hypot(...window.__heelLab.getState().camera.map((v,i)=>v-[4.9,2.65,8][i]))<.001',timeout=30000)
        check('intro return restores the whole-shoe director camera',state()['actor']['originalPanelVisible'] and state()['progress']==1)
        page.evaluate('window.__heelLab.lab.cancel()')
        report['cameraSamples']=camera_samples;report['capSamples']=cap_samples
        shot('01-original-director',0,'director',raw=True)
        shot('15-heel-camera-closeup',.095,'director',raw=True)
        shot('16-tangent-feed-closeup',.145,'director',raw=True)
        # Actual range drag, not a call to the scene API.
        slider=page.locator('[data-ui="progress"]');box=slider.bounding_box();x=box['x']+box['width']*.43;y=box['y']+box['height']/2
        page.mouse.move(box['x']+8,y);page.mouse.down();page.mouse.move(x,y,steps=12);page.mouse.up()
        check('progress slider drag changes actual motion',.35<state()['progress']<.5 and not state()['playing'],state()['progress'])
        page.locator('[data-action="play"]').click();page.wait_for_timeout(350);page.locator('[data-action="pause"]').click();paused=state()['progress'];page.wait_for_timeout(350)
        check('pause holds exact scene progress',state()['progress']==paused and not state()['playing'],paused)
        seek(.56);forward=page.evaluate(HASH_JS);pose=state()['shoe'];seek(.18);seek(.56)
        check('reverse seek returns identical geometry and pose',page.evaluate(HASH_JS)==forward and state()['shoe']==pose)
        for speed in [.25,.5,1]:
            page.locator('[data-ui="speed"]').select_option(str(speed) if speed!=1 else '1')
            delta=page.evaluate('''() => {const l=window.__heelLab.lab;l.seek(.2);l.play();l.advance(1);l.pause();return l.progress-.2;}''')
            check('actual playback rate '+str(speed),abs(delta-speed/30)<1e-10,delta)
        seek(.56);before=page.evaluate(HASH_JS);page.locator('[data-mode="rectangular-outline"]').click();after=page.evaluate(HASH_JS)
        check('two modes share positions and center path',before==after and state()['mode']=='rectangular-outline' and state()['ribbon']['sharedVertexBuffers'])
        shot('09-outline-above',.56,'above');page.locator('[data-mode="solid-ribbon"]').click()
        # Every exposed geometry parameter must change real vertex data.
        for key,value in [('radius',1.4),('turns',2.6),('pitch',1.2),('width',.28),('thickness',.03),('twist',260),('direction',25)]:
            seek(.5);before=page.evaluate(HASH_JS)
            page.locator('[data-param="'+key+'"]').evaluate('(el,v)=>{el.value=String(v);el.dispatchEvent(new Event("input",{bubbles:true}));}',value)
            check('parameter affects geometry: '+key,page.evaluate(HASH_JS)!=before,{'value':state()['parameters'][key]})
        page.locator('[data-action="reset-path"]').click();seek(.5)
        page.locator('[data-ui="guides"]').check();page.locator('[data-ui="point"]').select_option('10');before=page.evaluate(HASH_JS)
        page.locator('[data-axis="x"]').fill('0.35')
        check('path point editor changes real geometry',before!=page.evaluate(HASH_JS) and len(state()['path']['offsets'])==1,state()['path']['offsets'])
        shot('10-editable-path-above',.5,'above');page.locator('[data-action="reset-path"]').click();page.locator('[data-ui="guides"]').uncheck()
        shot('02-extraction-rear',.08,'rear');shot('13-lower-exit-director',.07,'director');shot('14-longitudinal-roll-director',.20,'director');shot('03-first-coil-side',.33,'side');shot('04-second-coil-above',.56,'above');shot('05-second-coil-director',.56,'director');shot('06-sprint-director',.745,'director');shot('07-return-director',.91,'director');shot('08-restored-director',1,'director')
        check('five phases and three observation angles rendered',{'rear','side','above'}.issubset({k['view'] for k in keyframes}) and len(keyframes)>=9)
        samples=[]
        for value in [.0001,.01,.04,.08,.11,.2,.35,.5,.59,.68,.74,.82,.9,.96,.99,.9999]:
            s=seek(value);gap=page.evaluate(JOIN_JS);samples.append({'progress':story(value),'actionProgress':value,'gap':gap,'frameError':s['path']['frameError'],'minimumFrameDot':s['path']['minimumFrameDot'],'reversals':s['path']['reversals'],'risk':s['risk']})
        check('connected source edge throughout release and return',max(x['gap'] for x in samples)<1e-6,max(x['gap'] for x in samples))
        check('stable orthonormal moving frames in all five stages',all(x['frameError']<1e-6 and x['minimumFrameDot']>0 and x['reversals']==0 for x in samples),{'maximumError':max(x['frameError'] for x in samples),'minimumDot':min(x['minimumFrameDot'] for x in samples)})
        report['geometrySamples']=samples
        view('director');seek(.72);before=state();page.locator('[data-action="return"]').click();immediate=state()
        check('return starts from the current continuous state',math.dist(before['shoe']['position'],immediate['shoe']['position'])<.03)
        page.evaluate('''() => {const l=window.__heelLab.lab;l.advance(5);l.pause();}''')
        check('manual return restores source nodes and whole shoe',state()['actor']['originalPanelVisible'] and state()['actor']['originalSewingVisible'] and math.dist(state()['shoe']['position'],[0,0,0])<1e-8 and not state()['actor']['derivedVisible'])
        for value in [.08,.33,.56,.72,.91]:
            seek(value);page.locator('[data-action="cancel"]').click();s=state()
            check('cancel restores from '+str(value),s['progress']==0 and s['actor']['originalPanelVisible'] and not s['ribbon']['tip'] and math.dist(s['shoe']['position'],[0,0,0])<1e-8)
        repetitions=page.evaluate('''() => {const l=window.__heelLab.lab;for(let i=0;i<30;i++){l.replay();l.advance(30);if(l.progress!==1||l.playing||!l.actor.panel.visible)return false;l.cancel();}return window.__heelLab.integrity();}''')
        check('30 repeated play/cancel cycles preserve source identity',isinstance(repetitions,list) and all(x['geometryUnchanged'] and x['localMatrixUnchanged'] and x['visible']==x['expectedVisible'] for x in repetitions),repetitions)
        seek(.42);view('director');bounds=page.locator('#stage').bounding_box();cx=bounds['x']+bounds['width']*.5;cy=bounds['y']+bounds['height']*.5;old=state()['camera']
        page.mouse.move(cx,cy);page.mouse.down();page.mouse.move(cx+120,cy+35,steps=12);page.mouse.up();page.wait_for_timeout(180)
        check('free orbit takes camera ownership',state()['cameraOwner']=='free' and math.dist(old,state()['camera'])>.05)
        page.locator('[data-view="director"]').click();page.wait_for_function('!window.__heelLab.getState().directorMoving',timeout=20000)
        check('one-click director restore releases orbit ownership',state()['cameraOwner']=='director' and not page.evaluate('window.__heelLab.lab.controls.enabled'))
        # Returning to the director while the close-up is moving must not chase
        # a stale target. Its short camera handoff holds narrative time.
        seek(.055);view('side');page.evaluate('window.__heelLab.play()')
        held=page.locator('[data-view="director"]').evaluate('''el => {el.click();const l=window.__heelLab.lab,before=l.progress;l.advance(.25);return{before,after:l.progress};}''')
        page.wait_for_function('!window.__heelLab.getState().directorMoving',timeout=30000);page.locator('[data-action="pause"]').click()
        match=page.evaluate('''() => {const l=window.__heelLab.lab,p=l.directorPose();return l.camera.position.distanceTo(p.position)+l.controls.target.distanceTo(p.target);}''')
        check('active playback hands off to the current director shot without endpoint drift',held['before']==held['after'] and match<1e-6,{'held':held,'cameraError':match})
        report['performanceSample']=state();context.close()
        # Isolate GPU contexts between test groups. Touch is emulated, not Safari.
        tablet=browser.new_context(viewport={'width':1024,'height':768},device_scale_factor=1,has_touch=True,is_mobile=True)
        touch=tablet.new_page();touch.on('pageerror',lambda e:errors.append('touch: '+str(e)));touch.goto(args.url,wait_until='domcontentloaded',timeout=90000);touch.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
        touch.locator('[data-action="play"]').tap();touch.wait_for_timeout(250);touch.locator('[data-action="pause"]').tap();check('touch transport controls are interactive',touch.evaluate('window.__heelLab.getState().progress')>0)
        cdp=tablet.new_cdp_session(touch);bb=touch.locator('#stage').bounding_box();tx=bb['x']+bb['width']/2;ty=bb['y']+bb['height']/2;old=touch.evaluate('window.__heelLab.getState().camera')
        cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':tx,'y':ty,'id':1}]})
        for i in range(1,9):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':tx+i*10,'y':ty+i*2,'id':1}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});touch.wait_for_timeout(200)
        check('tablet single-finger orbit',touch.evaluate('window.__heelLab.getState().cameraOwner')=='free' and math.dist(old,touch.evaluate('window.__heelLab.getState().camera'))>.05)
        distance=lambda:touch.evaluate('window.__heelLab.lab.camera.position.distanceTo(window.__heelLab.lab.controls.target)')
        old_distance=distance();cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':tx-35,'y':ty,'id':1},{'x':tx+35,'y':ty,'id':2}]})
        for i in range(1,9):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':tx-35-i*6,'y':ty,'id':1},{'x':tx+35+i*6,'y':ty,'id':2}]})
        cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});touch.wait_for_timeout(200);check('tablet two-finger pinch zoom',abs(distance()-old_distance)>.1)
        touch.evaluate('window.__heelLab.seek(.33);window.__heelLab.setView("side")');touch.wait_for_function('!window.__heelLab.getState().directorMoving');touch.screenshot(path=str(OUT/'11-tablet-touch.png'));check('tablet layout has no horizontal overflow',touch.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        touch.set_viewport_size({'width':390,'height':844});touch.wait_for_timeout(300);touch.screenshot(path=str(OUT/'12-phone-layout.png'));check('portrait touch layout has no horizontal overflow',touch.evaluate('document.documentElement.scrollWidth<=innerWidth'));tablet.close()
        # Deliberate failure tests run in a separate context and are not mixed into normal-request errors.
        failure=browser.new_context(viewport={'width':1100,'height':800});fault=failure.new_page()
        fault.route('**/assets/onward-ad-v1/onward-ad-v1.glb',lambda route:route.fulfill(status=503,body='Deliberate test failure'))
        fault.goto(args.url,wait_until='domcontentloaded',timeout=90000);fault.wait_for_function('window.__heelLab?.getState().error',timeout=30000)
        check('model load failure stops with explicit error',not fault.evaluate('window.__heelLab.getState().ready') and fault.locator('#error').is_visible())
        fault.unroute('**/assets/onward-ad-v1/onward-ad-v1.glb');fault.reload(wait_until='domcontentloaded',timeout=90000);fault.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
        check('reload recovers one real source canvas',fault.locator('#stage canvas').count()==1)
        fault.evaluate('window.__heelLab.play();window.__heelLab.lab.renderer.getContext().getExtension("WEBGL_lose_context").loseContext()')
        fault.wait_for_function('window.__heelLab.getState().contextLost')
        check('WebGL loss pauses and exposes recovery guidance',not fault.evaluate('window.__heelLab.getState().playing') and fault.locator('#error').is_visible())
        failure.close()
        check('no JavaScript or Shader errors',not errors,errors);check('all normal application requests loaded',not bad_responses,bad_responses)
        if args.record:
            browser.close();browser=None
            subprocess.run(['python3','-B','scripts/record-heel-motion-lab.py','--url',args.url],cwd=ROOT,check=True)
            report['recording']=json.loads((OUT/'recording.json').read_text())
            check('recorded real-time playback reaches complete restoration',report['recording']['passed'])
        if browser:browser.close();browser=None
        report['passed']=all(c['passed'] for c in checks)
    except Exception as error:
        report['passed']=False;report['failure']=str(error)
        raise
    finally:
        (OUT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        if browser:
            try:browser.close()
            except Exception:pass
    print(json.dumps({'passed':report['passed'],'checks':len(checks),'screenshots':len(keyframes),'report':str(OUT/'validation.json')},ensure_ascii=False),flush=True)


if __name__=='__main__':main()
