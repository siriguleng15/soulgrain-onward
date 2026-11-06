#!/usr/bin/env python3
"""Toe-directed feed and a real camera-facing band surface; no physical Safari claim."""
import argparse,json,math
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/heel-motion-lab/verification'
MEASURE='''()=>{const l=window.__heelLab.lab,r=l.ribbon,geo=r.geometry,p=geo.getAttribute('position'),n=geo.getAttribute('normal'),cols=r.across+1,layer=(r.segments+1)*cols;const view=l.camera.matrixWorldInverse,vec=()=>l.path.points[0].clone();let minDepth=Infinity,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,area=0,width=0;const front=[];for(let i=0;i<p.count;i++)minDepth=Math.min(minDepth,-vec().fromBufferAttribute(p,i).applyMatrix4(view).z);const length=l.path.tipLength-l.path.restLength;for(let i=0;i<=r.segments;i++){if(l.path.restLength+length*i/r.segments<l.path.presentationLength+.015)continue;const a=vec().fromBufferAttribute(p,layer+i*cols),b=vec().fromBufferAttribute(p,layer+i*cols+r.across);width=Math.max(width,a.distanceTo(b));a.project(l.camera);b.project(l.camera);front.push([a,b]);for(const v of[a,b]){minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}}for(let i=1;i<front.length;i++){const polygon=[front[i-1][0],front[i-1][1],front[i][1],front[i][0]];let signed=0;for(let k=0;k<4;k++){const a=polygon[k],b=polygon[(k+1)%4];signed+=a.x*b.y-a.y*b.x;}area+=Math.abs(signed)/8;}const index=layer+(r.segments-2)*cols+6,point=vec().fromBufferAttribute(p,index),normal=vec().fromBufferAttribute(n,index).normalize(),viewer=l.camera.position.clone().sub(point).normalize();return{aspect:l.camera.aspect,normalFacing:normal.dot(viewer),minimumDepth:minDepth,width,expectedWidth:l.params.width,screenWidth:(maxX-minX)/2,screenHeight:(maxY-minY)/2,screenArea:area,bounds:[minX,maxX,minY,maxY],uvFinite:Array.from(geo.getAttribute('uv').array).every(Number.isFinite),revision:l.getState().revision};}'''

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url',default='http://127.0.0.1:4538/heel-motion-lab.html');args=parser.parse_args();OUT.mkdir(parents=True,exist_ok=True);checks=[];devices=[]
 def check(name,ok,detail):
  checks.append({'name':name,'passed':bool(ok),'detail':detail});print(('PASS ' if ok else 'FAIL ')+name,flush=True);assert ok,(name,detail)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for name,size in [('desktop',(1440,950)),('tablet',(1194,834)),('phone',(390,844))]:
   page=browser.new_page(viewport={'width':size[0],'height':size[1]},device_scale_factor=1);page.goto(args.url,wait_until='domcontentloaded',timeout=90000);page.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
   page.evaluate('()=>{const l=window.__heelLab.lab;cancelAnimationFrame(l.frame);l.frame=0;}');page.evaluate('window.__heelLab.renderAt(.837)');result=page.evaluate(MEASURE);devices.append({'device':name,**result})
   check(name+': broad face presented toward viewer',result['normalFacing']>.90 and result['screenWidth']>.18 and result['screenHeight']>.35 and result['screenArea']>.045,result)
   check(name+': face stays in frame and clear of near plane',min(result['bounds'])>-1.03 and max(result['bounds'])<1.03 and result['minimumDepth']>.15,result)
   check(name+': perspective enlargement preserves physical width and derived UVs',abs(result['width']-result['expectedWidth'])<1e-6 and result['uvFinite'],result)
   page.screenshot(path=str(OUT/('23-face-'+name+'.png')))
   if name=='desktop':
    temporal=page.evaluate('''()=>{const l=window.__heelLab.lab;let last=null,minimum=1,spatial=1;for(let i=0;i<=120;i++){l.seek(.766+(.837-.766)*i/120);const path=l.path,frame=path.at(path.tipLength).b;if(last)minimum=Math.min(minimum,last.dot(frame));last=frame;spatial=Math.min(spatial,path.minimumFrameDot);}return{samples:121,minimumTemporalWidthDot:minimum,minimumSpatialWidthDot:spatial};}''');check('no visible roll reversal during approach and surface reveal',temporal['minimumTemporalWidthDot']>.90 and temporal['minimumSpatialWidthDot']>0,temporal)
    page.evaluate('window.__heelLab.renderAt(.262)');feed=page.evaluate('''()=>{const l=window.__heelLab.lab,p=l.ribbon.centers.at(-1).clone().applyMatrix4(l.pose.matrix.clone().invert());return{rootX:l.actor.surface.lower.x,tipX:p.x,advancement:l.actor.surface.lower.x-p.x};}''');check('actual ribbon tip advances toward toe by the marked 26.2% stage',feed['advancement']>.5,feed);page.screenshot(path=str(OUT/'22-prompt-toe-feed.png'))
    page.evaluate('window.__heelLab.renderAt(.837)');before=page.evaluate('Array.from(window.__heelLab.lab.ribbon.geometry.getAttribute("position").array)');page.evaluate('''()=>{const l=window.__heelLab.lab;l.setView('above');l.director.cancel();l.camera.position.set(5,7,7);l.camera.lookAt(0,0,0);l.render();}''');after=page.evaluate('Array.from(window.__heelLab.lab.ribbon.geometry.getAttribute("position").array)');check('free inspection does not billboard or reshape the band',before==after,{'sharedGeometryUnchanged':before==after});page.screenshot(path=str(OUT/'24-face-free-inspection.png'))
   page.close()
  browser.close()
 report={'testedAt':datetime.now(ZoneInfo('Asia/Shanghai')).isoformat(),'passed':True,'revision':devices[0]['revision'],'checks':checks,'devices':devices,'environment':'Linux Chromium + SwiftShader; device viewport layouts only; NOT physical iPad Safari','meaning':'The red derived band keeps its real width. Its final 3D path and transported frames present the broad surface toward the authored director camera, independently of OrbitControls.'};(OUT/'presentation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':True,'checks':len(checks)}))
if __name__=='__main__':main()
