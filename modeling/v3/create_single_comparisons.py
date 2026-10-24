"""Read reference ZIP without publishing photos as website assets; compare renders.
Run: python3 modeling/v3/create_single_comparisons.py  (requires Pillow)
No camera calibration or numerical shape-accuracy claim is implied.
"""
from pathlib import Path
from io import BytesIO
import zipfile, hashlib, json
from PIL import Image, ImageOps, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'modeling/v3/single'
DEST=OUT/'comparisons';DEST.mkdir(exist_ok=True)
FONT=Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
def font(size):return ImageFont.truetype(str(FONT),size) if FONT.exists() else ImageFont.load_default()
pairs=[
 ('01_side_toe_left.jpg','01_side_toe_left.png','Side / toe left','Cuff is still too regular; toe and quarter curvature remain approximate.'),
 ('02_side_toe_right.jpg','02_side_toe_right.png','Opposite side','Judge the same single shoe from its opposite side; not a second model.'),
 ('03_front_three_quarter.jpg','03_front_three_quarter.png','Front three-quarter','Compare the foreground folded shoe; cloth contact still idealized.'),
 ('04_extended_tongue.jpg','03_front_three_quarter.png','Folded foreground shoe','The extended background shoe explains construction, not the delivered pose.'),
 ('05_top_front_view.jpg','05_top_front.png','Top / front','Opening, seam routing and tongue outline are fitted estimates.'),
 ('06_rear_heels.jpg','06_rear.png','Rear','Rear fabric creases and asymmetric collapse still differ visibly.'),
]
archive=ROOT/'SoulGrain_ONWARD_shape_references_6views.zip'
report={'status':'NOT_APPROVED_FOR_PHOTO_FIDELITY','reference_zip_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'model_sha256':hashlib.sha256((ROOT/'public/assets/soulgrain_onward_v3_single_review.glb').read_bytes()).hexdigest(),'camera_alignment':'Approximate viewing directions only; no calibrated matching or error percentage.','views':[]}
with zipfile.ZipFile(archive) as z:
 for index,(reference,render,title,note) in enumerate(pairs,1):
  photo=Image.open(BytesIO(z.read(reference))).convert('RGB')
  model=Image.open(OUT/'previews'/render).convert('RGB')
  assert model.size==(1200,900),'Draft or stale render: '+render
  canvas=Image.new('RGB',(1440,810),'#f5f5f5');draw=ImageDraw.Draw(canvas)
  draw.text((24,16),f'{index:02} / {title}',font=font(24),fill='#151820')
  draw.text((24,60),'REFERENCE - SHAPE ONLY',font=font(16),fill='#333333')
  draw.text((744,60),'SINGLE-SHOE CANDIDATE - NOT APPROVED',font=font(16),fill='#713d25')
  for im,x in [(photo,0),(model,720)]:
   im=ImageOps.contain(im,(700,620));canvas.paste(im,(x+(720-im.width)//2,100+(620-im.height)//2))
  draw.text((24,746),'Approximate angle comparison; cameras and folding poses are not calibrated.',font=font(17),fill='#333333')
  draw.text((24,777),note,font=font(15),fill='#713d25')
  name=f'{index:02}_comparison.jpg';canvas.save(DEST/name,quality=95)
  report['views'].append({'reference':reference,'render':render,'comparison':name,'note':note,'comparison_sha256':hashlib.sha256((DEST/name).read_bytes()).hexdigest()})
contact=Image.new('RGB',(1440,810),'#eeeeee')
for i in range(6):
 im=Image.open(DEST/f'{i+1:02}_comparison.jpg');im.thumbnail((480,270));contact.paste(im,(i%3*480,i//3*405+60))
contact.save(DEST/'overview.jpg',quality=94)
contact=Image.new('RGB',(1440,800),'#23272d');draw=ImageDraw.Draw(contact)
for i,p in enumerate(sorted((OUT/'previews').glob('[0-9][0-9]_*.png'))):
 im=Image.open(p);assert im.size==(1200,900);im.thumbnail((480,360));x=i%3*480;y=i//3*400;contact.paste(im,(x,y));draw.text((x+12,y+370),p.stem,font=font(14),fill='white')
contact.save(OUT/'previews/overview.jpg',quality=94)
(OUT/'visual-review.json').write_text(json.dumps(report,indent=2))
print('Six approximate-angle comparisons saved; visual acceptance explicitly NOT APPROVED.')
