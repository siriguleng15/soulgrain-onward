from pathlib import Path
from PIL import Image,ImageStat
import json
p=Path(__file__).resolve().parents[1]/'public/verification-v5'
def green(name):
    image=Image.open(p/(name+'.jpg')).convert('RGB').crop((0,50,1030,500))
    data=image.tobytes()
    return sum(g-r>40 and g-b>35 and g>70 for r,g,b in zip(data[0::3],data[1::3],data[2::3]))
def luminance(name):
    image=Image.open(p/(name+'.jpg')).convert('RGB').crop((30,60,240,145))
    r,g,b=ImageStat.Stat(image).mean
    return .2126*r+.7152*g+.0722*b
full,mist,emergence=green('cursor-hand'),green('mist'),green('emergence')
early,late=luminance('held-night'),luminance('held-charge')
checks=[{'name':'Rendered green hand has visible area','passed':full>1000},
        {'name':'White-mist frame conceals most saturated green surface','passed':mist<full*.45},
        {'name':'Emergence restores more saturated surface than mist','passed':emergence>mist*1.2},
        {'name':'Continued hold visibly darkens background','passed':late<early*.92}]
report={'method':'Pixel statistics from actual production-controller review frames, not reference-site matching or hardware FPS evidence',
        'saturatedGreenPixels':{'full':full,'mist':mist,'emergence':emergence},'backgroundLuminance':{'earlyHold':early,'lateHold':late},'checks':checks}
(p/'image-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
assert all(c['passed'] for c in checks)
