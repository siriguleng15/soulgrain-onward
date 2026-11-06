#!/usr/bin/env python3
"""Exercise the real PBR texture path with a synthetic calibration chart only.

No product artwork is generated, and no public gallery files are overwritten.
"""
import argparse,hashlib,io,json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright

SNAPSHOT='''()=>{const l=window.__heelLab.lab;function hash(a){const b=new Uint8Array(a.buffer,a.byteOffset,a.byteLength);let h=2166136261;for(const v of b)h=Math.imul(h^v,16777619);return h>>>0;}return{shoe:l.shoe.matrix.toArray(),camera:l.camera.matrixWorld.toArray(),position:hash(l.ribbon.geometry.getAttribute('position').array),uv:hash(l.ribbon.geometry.getAttribute('uv').array),path:l.path.points.map(p=>p.toArray())};}'''

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--url',default='http://127.0.0.1:4538/heel-motion-lab.html')
 parser.add_argument('--out',default='/tmp/heel-motion-correction/artwork-preflight.json')
 args=parser.parse_args();checks=[]
 def check(name,ok,detail=None):
  checks.append({'name':name,'passed':bool(ok),'detail':detail})
  print(('PASS ' if ok else 'FAIL ')+name,flush=True)
  assert ok,(name,detail)
 chart=Image.new('RGB',(128,512),'white');draw=ImageDraw.Draw(chart)
 draw.rectangle((0,0,31,511),fill='#a00f18')
 draw.rectangle((80,0,127,255),fill='#a00f18')
 draw.rectangle((32,256,79,511),fill='#a00f18')
 buffer=io.BytesIO();chart.save(buffer,format='PNG');data=buffer.getvalue()
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
  for device,size,touch in [('desktop',(1440,950),False),('tablet',(1194,834),True)]:
   page=browser.new_page(viewport={'width':size[0],'height':size[1]},has_touch=touch,device_scale_factor=1);errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.route('**/qa-ribbon-artwork.png',lambda r:r.fulfill(status=200,content_type='image/png',body=data))
   page.route('**/qa-ribbon-missing.png',lambda r:r.fulfill(status=404,body='not found'))
   page.route('**/qa-ribbon-invalid.png',lambda r:r.fulfill(status=200,content_type='image/png',body=b'invalid-image'))
   page.goto(args.url,wait_until='domcontentloaded',timeout=90000)
   page.wait_for_function('window.__heelLab?.getState().ready',timeout=90000)
   production=page.evaluate('window.__heelLab.getState().artwork')
   artwork_dir=Path(__file__).resolve().parents[1]/'public/heel-motion-lab/artwork'
   expected_sha=hashlib.sha256((artwork_dir/'heel-meander-tile.svg').read_bytes()).hexdigest()
   check(device+': actual reconstructed meander is the default loaded material',production['status']=='ready' and production['sha256']==expected_sha and production['width']==573 and production['height']==756,production)
   pixels=page.evaluate('''async()=>{const source=new Image(),tile=new Image();source.src=new URL('heel-motion-lab/artwork/heel-meander-trace.svg',location.href).href;tile.src=new URL('heel-motion-lab/artwork/heel-meander-tile.svg',location.href).href;await Promise.all([source.decode(),tile.decode()]);function raster(im){const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);return x.getImageData(0,0,c.width,c.height).data;}const a=raster(source),b=raster(tile);let seam=0,repeat=0,sourceDifference=0;for(let x=0;x<573;x++)for(let c=0;c<4;c++)seam=Math.max(seam,Math.abs(b[x*4+c]-b[((755*573+x)*4)+c]));for(let y=0;y<2048;y++)for(let x=0;x<573;x++)for(let c=0;c<4;c++){const v=a[(y*573+x)*4+c];sourceDifference=Math.max(sourceDifference,Math.abs(v-b[((y%756)*573+x)*4+c]));if(y+756<2048)repeat=Math.max(repeat,Math.abs(v-a[((y+756)*573+x)*4+c]));}return{seamMaximum:seam,repeatedPeriodMaximum:repeat,fullTraceTileMaximum:sourceDifference,red:Array.from(b.slice(0,3)),white:Array.from(b.slice(120*4,120*4+3))};}''')
   check(device+': rasterized SVG period and both tile edges match without a join',pixels['seamMaximum']==pixels['repeatedPeriodMaximum']==pixels['fullTraceTileMaximum']==0 and pixels['red']==[160,15,24] and pixels['white']==[255,255,255],pixels)
   page.evaluate('()=>{const l=window.__heelLab.lab;cancelAnimationFrame(l.frame);l.frame=0;window.originalMaps=[];l.asset.traverse(m=>{if(m.isMesh)for(const v of(Array.isArray(m.material)?m.material:[m.material]))window.originalMaps.push([v,v.map]);});}')
   before=[]
   for progress in [.14,.35,.65,1]:
    page.evaluate('(p)=>window.__heelLab.renderAt(p)',progress);before.append(page.evaluate(SNAPSHOT))
   source=page.evaluate('async()=>{await window.__heelLab.loadRibbonArtwork(new URL("qa-ribbon-artwork.png",location.href).href);const l=window.__heelLab.lab,m=l.ribbon.material;window.firstMap=m.map;window.mapVersion=m.version;return{state:l.ribbonArtwork.getState(),color:m.color.toArray(),roughness:m.roughness,metalness:m.metalness,repeat:m.map.repeat.toArray(),colorSpace:m.map.colorSpace,flipY:m.map.flipY};}')
   check(device+': exact file bytes identified; PBR and source aspect retained',source['state']['sha256']==hashlib.sha256(data).hexdigest() and source['repeat']==[1,.25] and source['color']==[1,1,1] and source['roughness']==.36 and source['metalness']==.06 and source['colorSpace']=='srgb' and not source['flipY'],source)
   after=[]
   for progress in [.14,.35,.65,1]:
    page.evaluate('(p)=>window.__heelLab.renderAt(p)',progress);after.append(page.evaluate(SNAPSHOT))
   check(device+': artwork does not alter V1.7 position, UV, path or camera',before==after)
   check(device+': seeking never recompiles the artwork material',page.evaluate('window.mapVersion===window.__heelLab.lab.ribbon.material.version'))
   for suffix in ['missing','invalid']:
    outcome=page.evaluate('''async suffix=>{try{await window.__heelLab.loadRibbonArtwork(new URL('qa-ribbon-'+suffix+'.png',location.href).href);}catch{}const l=window.__heelLab.lab;return{error:l.ribbonArtwork.getState().error,same:l.ribbon.material.map===window.firstMap};}''',suffix)
    check(device+': '+suffix+' image preserves the last valid texture',outcome['same'] and bool(outcome['error']),outcome)
   result=page.evaluate('''async()=>{const l=window.__heelLab.lab;window.mapDisposals=0;window.firstMap.addEventListener('dispose',()=>window.mapDisposals++);await window.__heelLab.loadRibbonArtwork(new URL('qa-ribbon-artwork.png',location.href).href);return{disposals:window.mapDisposals,sameProgramVersion:window.mapVersion===l.ribbon.material.version,isolated:window.originalMaps.every(([m,map])=>m.map===map)};}''')
   check(device+': replacing disposes only the owned texture, without shader churn',result=={'disposals':1,'sameProgramVersion':True,'isolated':True},result)
   page.evaluate('window.__heelLab.setMode("rectangular-outline");window.__heelLab.renderAt(1)')
   check(device+': both display modes share the artwork and position buffers',page.evaluate('()=>{const r=window.__heelLab.lab.ribbon;return r.solid.material===r.outline.material&&r.geometry.getAttribute("position")===r.outlineGeometry.getAttribute("position");}'))
   page.evaluate('window.__heelLab.setMode("solid-ribbon");window.__heelLab.reverse();window.__heelLab.advance(30)')
   check(device+': manual reverse remains complete and source geometry is intact',page.evaluate('()=>window.__heelLab.getState().progress===0&&window.__heelLab.integrity().every(x=>x.geometryUnchanged&&x.localMatrixUnchanged)'))
   page.evaluate('window.__heelLab.clearRibbonArtwork();window.__heelLab.renderAt(1)')
   check(device+': clear restores original ribbon color and removes the owned map',page.evaluate('()=>{const l=window.__heelLab.lab;return l.ribbonArtwork.getState().status==="unassigned"&&l.ribbon.material.map===null&&l.ribbon.material.color.getHex()===0xb8192c&&window.originalMaps.every(([m,map])=>m.map===map);}'))
   check(device+': no JavaScript errors',not errors,errors);page.close()
  browser.close()
 root=Path(__file__).resolve().parents[1];baseline='f0a7756952910f0eeb3cbfc708cd4640c3d09cdb';unchanged=[]
 for name in ['motion','CameraFrame','DirectorShot','Trajectory','TerminalShot','Feed','Path','Reaction','HeelActor','Surface']:
  relative=f'src/heel-motion-lab/{name}.ts';prior=subprocess.check_output(['git','show',f'{baseline}:{relative}'],cwd=root)
  check('approved V1.7 module byte identity: '+name,prior==(root/relative).read_bytes());unchanged.append(relative)
 report={'passed':True,'revision':'heel-pattern-ribbon-v10','baseline':baseline,'unchangedMotionModules':unchanged,'scope':'Actual default reconstructed meander and rasterized repeat tested; synthetic calibration chart used separately for generic texture lifecycle checks; no physical iPad Safari test','checks':checks}
 path=Path(args.out);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print('Report:',path)

if __name__=='__main__':main()
