"""Keep the licensed originals; ship renamed, ASCII subsets with the same outlines."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import string, json

ROOT=Path(__file__).resolve().parents[1]
files=[('space-grotesk.ttf','zero-sans-subset.ttf','Zero Study Sans','Regular'),('cormorant-garamond.ttf','zero-serif-subset.ttf','Zero Study Serif','Regular'),('cormorant-garamond-italic.ttf','zero-serif-italic-subset.ttf','Zero Study Serif','Italic')]
report=[]
for source,target,family,style in files:
    font=TTFont(ROOT/'assets-src/fonts'/source)
    options=subset.Options()
    options.name_IDs=['*']
    options.name_legacy=True
    sub=subset.Subsetter(options=options)
    sub.populate(text=string.printable)
    sub.subset(font)
    names={1:family,2:style,3:family+' '+style+' / opening study subset',4:family+' '+style,6:family.replace(' ','')+'-'+style,16:family,17:style}
    for name in font['name'].names:
        if name.nameID in names:
            name.string=names[name.nameID].encode(name.getEncoding(),errors='replace')
    out=ROOT/'public/assets'/target
    font.save(out)
    report.append({'original':source,'runtimeSubset':target,'bytes':out.stat().st_size,'license':'SIL OFL; original notices retained; modified family renamed'})
(ROOT/'assets-src/font-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
