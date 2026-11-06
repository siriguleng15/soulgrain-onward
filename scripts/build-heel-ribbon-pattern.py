#!/usr/bin/env python3
"""Vector trace of the user's inline artwork, not a recovered original file.

Orthogonal landmarks are measured from the 573 x 2048 conversation image.
Only writes new resources inside the independent heel-lab artwork directory.
"""
import hashlib,json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/heel-motion-lab/artwork'
WIDTH=573;PERIOD=756;RED='#A00F18'

def svg(height):
 # The same path crosses both ends of each repeat at identical x positions.
 # Keep one extra cycle on each side for continuous joins and raster filtering.
 path=['M 177 -756']
 for i in range(-1,4):
  y=i*PERIOD
  path.append(f'V {512.5+y} H 286.5 V {232+y} H 396.5 V {890.5+y} H 286.5 V {610+y} H 177')
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{height}" viewBox="0 0 {WIDTH} {height}">
 <title>Soulgrain heel ribbon — trace of user-supplied inline artwork</title>
 <desc>Editable orthogonal trace. Approximate color from the displayed image, not original source pixels. Period 756 in a 573-wide coordinate system.</desc>
 <defs><pattern id="meander" patternUnits="userSpaceOnUse" width="573" height="756">
  <rect width="573" height="756" fill="{RED}"/>
  <rect x="86.5" width="400.5" height="756" fill="#FFFFFF"/>
  <path d="{' '.join(path)}" fill="none" stroke="{RED}" stroke-width="38.5" stroke-linejoin="miter" stroke-linecap="butt"/>
 </pattern></defs>
 <rect width="573" height="{height}" fill="url(#meander)"/>
</svg>
'''

def main():
 OUT.mkdir(parents=True,exist_ok=True);files={}
 for name,height in [('heel-meander-trace.svg',2048),('heel-meander-tile.svg',PERIOD)]:
  data=svg(height).encode();(OUT/name).write_bytes(data);files[name]={'sha256':hashlib.sha256(data).hexdigest(),'width':WIDTH,'height':height}
 report={'kind':'vector-reconstruction-from-user-inline-image','authorization':'User explicitly approved using only the displayed image and continuing development.','sourceDescription':'573 x 2048 red/white meander image in the conversation; original encoded image file was unavailable.','sourceFileRecovered':False,'sourcePixelsCompared':False,'redApproximation':RED,'repeatPeriod':PERIOD,'landmarks':{'outerWhiteLeft':86.5,'outerWhiteRight':487,'redStrokeWidth':38.5,'redCenterlines':[177,286.5,396.5]},'files':files,'scope':'New performance ribbon artwork only; source GLB, embedded textures and UV unchanged.'}
 (OUT/'provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
