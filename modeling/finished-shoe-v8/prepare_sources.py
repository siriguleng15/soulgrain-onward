"""Copy the supplied artwork unchanged, and read rhinestone positions.

This is feature measurement, not generation of a replacement ornament.
Usage: python3 prepare_sources.py --attachments /path/to/nine-images
"""
import argparse, hashlib, json, shutil
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

P=Path(__file__).resolve().parent
names=['overall','body-print','cuff-fabric','heel-leather','aglet-reference','aglet-artwork','tongue-front-back','rhinestone-layout','heel-logo']
a=argparse.ArgumentParser();a.add_argument('--attachments',type=Path,required=True);a.add_argument('--cuff-tile',type=Path,required=True);a.add_argument('--tongue-tile',type=Path);args=a.parse_args()
(P/'references').mkdir(parents=True,exist_ok=True);(P/'textures').mkdir(exist_ok=True)
manifest=[]
for i,name in enumerate(names,1):
 source=args.attachments/f'{i}-照片-{i}.jpg';target=P/'references'/f'{i:02}-{name}.jpg'
 shutil.copyfile(source,target)
 manifest.append({'file':str(target.relative_to(P)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'size':list(Image.open(target).size),'source':'User-supplied reference, copied byte-for-byte'})
shutil.copyfile(args.cuff_tile,P/'textures/cuff-reconstructed.png')
manifest.append({'file':'textures/cuff-reconstructed.png','source':'Image generation from supplied fabric photograph: reconstructed repeat, not exact extracted factory artwork','sha256':hashlib.sha256((P/'textures/cuff-reconstructed.png').read_bytes()).hexdigest()})
if args.tongue_tile:
 shutil.copyfile(args.tongue_tile,P/'textures/tongue-velvet-reconstructed.png')
 manifest.append({'file':'textures/tongue-velvet-reconstructed.png','source':'Image generation from tongue reference: blank purple velvet repeat, no text or stones; reconstructed material only','sha256':hashlib.sha256((P/'textures/tongue-velvet-reconstructed.png').read_bytes()).hexdigest()})
# Close narrow breaks in circular rims, then read one distance-transform peak
# per stone. Measurements are pixels in the supplied layout, never millimetres.
gray=np.array(Image.open(P/'references/08-rhinestone-layout.jpg').convert('L'))
mask=ndimage.binary_fill_holes(gray<240)
distance=ndimage.distance_transform_edt(mask)
peaks=(distance==ndimage.maximum_filter(distance,size=21))&(distance>7)&(distance<20)
label,count=ndimage.label(peaks)
centres=ndimage.center_of_mass(peaks,label,range(1,count+1))
stones=[]
for y,x in centres:
 if not(40<x<1210 and 40<y<1210):continue
 stones.append({'x':round(float(x),3),'y':round(float(y),3),'radius_px':round(float(distance[round(y),round(x)]),3)})
stones.sort(key=lambda p:(p['y'],p['x']))
(P/'rhinestone-points.json').write_text(json.dumps({'source':'references/08-rhinestone-layout.jpg','method':'Local maxima of filled-rim distance transform; positions are approximate raster readings. Original artwork is authoritative.','image_size':[gray.shape[1],gray.shape[0]],'stones':stones},indent=2))
(P/'sources.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Prepared references; detected rhinestone centres:',len(stones))
