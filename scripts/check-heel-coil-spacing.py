#!/usr/bin/env python3
"""Verify the micro-adjustment against V1.8 in actual projected 3D geometry."""
import argparse,json,math
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'public/heel-motion-lab/verification'
MEASURE='''()=>{const l=window.__heelLab.lab;const project=p=>{const v=p.clone().project(l.camera),r=l.renderer.domElement.getBoundingClientRect();return[(v.x+1)*r.width/2,(1-v.y)*r.height/2];};const sample=(a,b)=>Array.from({length:97},(_,i)=>project(l.path.curve.getPoint((a+(b-a)*i/96)/(l.path.points.length-1))));const upper=sample(29,34),toe=sample(44,48);let gap=Infinity;for(const a of upper)for(const b of toe)gap=Math.min(gap,Math.hypot(a[0]-b[0],a[1]-b[1]));const s=l.getState();return{shoe:s.shoe,camera:s.camera,target:s.target,reaction:s.reaction,points:s.path.controlPoints,first:project(l.path.points[20]),second:project(l.path.points[31]),gap,frameError:s.path.frameError,minimumFrameDot:s.path.minimumFrameDot,artwork:s.artwork,shoeLength:l.sourceBox.max.x-l.sourceBox.min.x};}'''

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--url',default='http://127.0.0.1:4538/heel-motion-lab.html');args=parser.parse_args();checks=[];devices=[]
 def check(name,ok,detail=None):
  checks.append({'name':name,'passed':bool(ok),'detail':detail});print(('PASS ' if ok else 'FAIL ')+name,flush=True);assert ok,(name,detail)
 fixture=json.loads((ROOT/'research/heel-motion-lab/v18-spacing-baseline.json').read_text())
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for name,size in [('desktop',(1280,860)),('tablet',(1194,834))]:
   page=browser.new_page(viewport={'width':size[0],'height':size[1]},device_scale_factor=1);page.goto(args.url,wait_until='domcontentloaded',timeout=90000);page.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
   page.evaluate('()=>{const l=window.__heelLab.lab;cancelAnimationFrame(l.frame);l.frame=0;l.path.spacingScale=0;l.renderAt(1);}')
   baseline=page.evaluate(MEASURE)
   check(name+': neutral spacing reproduces actual V1.8 coil positions',max(math.dist(a,b) for a,b in zip(baseline['points'][:49],fixture['controlPoints'][:49]))<1e-12)
   page.evaluate('()=>{const l=window.__heelLab.lab;l.path.spacingScale=1;l.renderAt(1);}')
   after=page.evaluate(MEASURE);deltas=[math.dist(a,b) for a,b in zip(baseline['points'],after['points'])]
   first=after['first'][1]-baseline['first'][1];second=after['second'][1]-baseline['second'][1];gap=after['gap']-baseline['gap']
   detail={'firstDownPixels':first,'secondDownPixels':second,'upperGapBeforePixels':baseline['gap'],'upperGapAfterPixels':after['gap'],'maximumWorldOffset':max(deltas),'fractionOfShoeLength':max(deltas)/after['shoeLength']};devices.append({'device':name,**detail})
   check(name+': lower first coil moves only a little downward',3<first<12,detail)
   check(name+': adjacent upper paths gain a small visible gap',5<gap<20 and first<second<18,detail)
   check(name+': adjustment stays below five percent of shoe length',max(deltas)<.166 and max(deltas)/after['shoeLength']<.05,detail)
   check(name+': shoe response and director camera remain identical',all(baseline[k]==after[k] for k in ['shoe','camera','target','reaction']))
   check(name+': heel lead, toe wrap and complete foreground flight are untouched',all(deltas[i]<1e-12 for i in [*range(9),*range(40,len(deltas))]))
   check(name+': artwork bytes and material settings are unchanged',baseline['artwork']==after['artwork'] and after['artwork']['sha256']=='276e7c1bf844875bfc0507d16f1771140898fbb20dca7a2c1c41644d36f83fe5')
   page.screenshot(path=str(OUT/('27-spacing-after.png' if name=='desktop' else '28-spacing-tablet.png')))
   stable=True;stationary=True
   for progress in [0,.15,.3,.5,.7,.9,1]:
    page.evaluate('(p)=>{const l=window.__heelLab.lab;l.path.spacingScale=0;l.renderAt(p);}',progress);before=page.evaluate(MEASURE)
    page.evaluate('(p)=>{const l=window.__heelLab.lab;l.path.spacingScale=1;l.renderAt(p);}',progress);current=page.evaluate(MEASURE)
    stationary=stationary and all(before[k]==current[k] for k in ['shoe','camera','target','reaction'])
    stable=stable and current['frameError']<1e-6 and current['minimumFrameDot']>0
   check(name+': the correction never changes motion timing or shoe rotation',stationary)
   check(name+': transported frames stay stable during the whole sequence',stable)
   page.evaluate('window.__heelLab.returnToHeel();window.__heelLab.advance(30)')
   check(name+': independent reverse still restores the source asset',page.evaluate('()=>window.__heelLab.getState().progress===0&&window.__heelLab.integrity().every(x=>x.geometryUnchanged&&x.localMatrixUnchanged)'))
   page.close()
  browser.close()
 report={'passed':True,'revision':'heel-coil-spacing-v11','baseline':fixture['sourceCommit'],'devices':devices,'checks':checks,'environment':'Linux Chromium + SwiftShader; viewport simulation, not physical iPad Safari'}
 (OUT/'coil-spacing.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'passed':True,'checks':len(checks),'devices':devices}))

if __name__=='__main__':main()
