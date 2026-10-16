"""Extract six structure references and build approximate-view review sheets.
No reference image is loaded by the modeling script or used as model texture.
"""
from pathlib import Path
from zipfile import ZipFile
from PIL import Image,ImageOps,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[2]; O=Path(__file__).resolve().parent
refs=Path('/tmp/onward-original/references');refs.mkdir(parents=True,exist_ok=True)
with ZipFile(R/'SoulGrain_ONWARD_shape_references_6views.zip') as z:
 for item in z.infolist():
  if item.filename.lower().endswith(('.jpg','.jpeg','.png')) and '__MACOSX' not in item.filename:
   (refs/Path(item.filename).name).write_bytes(z.read(item))
views=['01_side_left','02_side_right','03_three_quarter','03_three_quarter','05_top_front','06_rear']
photos=sorted(refs.glob('*.jpg')); assert len(photos)==6
out=O/'comparisons';out.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',19)
thumbs=[]
for i,(photo,view) in enumerate(zip(photos,views),1):
 board=Image.new('RGB',(1600,760),'white');draw=ImageDraw.Draw(board)
 for x,path in [(0,photo),(800,O/'previews'/(view+'.png'))]:
  img=ImageOps.contain(Image.open(path).convert('RGB'),(780,650));board.paste(img,(x+(800-img.width)//2,65+(650-img.height)//2))
 draw.text((20,20),f'{i:02} | Photo shape reference only',font=font,fill='black')
 draw.text((820,20),'V4 candidate - NOT shape approved',font=font,fill='black')
 note='Approximate camera / not calibrated. Photo 04: compare foreground folded shoe.'
 draw.text((20,727),note,font=font,fill='#444444')
 board.save(out/f'{i:02}_comparison.jpg',quality=92)
 thumbs.append(board.resize((800,380)))
contact=Image.new('RGB',(1600,1140),'white')
for i,img in enumerate(thumbs):contact.paste(img,((i%2)*800,(i//2)*380))
contact.save(out/'overview.jpg',quality=93)
print('Six comparisons and overview written. Approximate views only.')
