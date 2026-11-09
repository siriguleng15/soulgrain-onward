from pathlib import Path
import shutil,json,hashlib,zipfile
R=Path(__file__).resolve().parents[1];dest=R/'download-publication/SOULGRAIN-V5.2';dest.mkdir(parents=True,exist_ok=True)
files=['README.md','report.html','SOULGRAIN-V5.2-structure-report.pdf','output/SOULGRAIN-V5.2-no-laces-two-panel-tongue.glb','output/SOULGRAIN-V5.2-tongue-only.glb','viewer/index.html','viewer/app.js','viewer/index.template.html','data/cleanup.npz','data/two-panels.npz','data/patterns.json','data/metal-mask.npz']
files += ['reports/'+n for n in ['validation.json','viewer-validation.json','render-V52.json','render-V4.json','cleanup.json','export.json','panels.json','report-layout.json','front-eyelet-candidates.json']]
files += ['images/'+n for n in ['compare-quarter.jpg','compare-front.jpg','compare-opening.jpg','compare-opposite.jpg','pattern-layout.png','mesh-uv-layout.png','viewer-assembled.png','viewer-isolated-back.png','viewer-deck-without-fold.png','viewer-tablet-portrait.png']]
frames=json.loads((R/'reports/render-V52.json').read_text());files += ['images/'+d['file'] for d in frames];files += ['images/V4-'+n+'.png' for n in ['quarter','front','opening','opposite']]
files += [str(p.relative_to(R)) for p in (R/'scripts').glob('*') if p.is_file() and p.suffix in ['.py','.mjs']]
manifest=[]
for rel in sorted(set(files)):
 p=R/rel;o=dest/rel;o.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,o);manifest.append({'path':rel,'bytes':o.stat().st_size,'sha256':hashlib.sha256(o.read_bytes()).hexdigest()})
(dest/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(dest/'SHA256SUMS.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in manifest))
zipout=R/'SOULGRAIN-V5.2-structural-test.zip'
with zipfile.ZipFile(zipout,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(dest.rglob('*')):
  if p.is_file() and '.git' not in p.parts:z.write(p,'SOULGRAIN-V5.2/'+str(p.relative_to(dest)))
print(json.dumps({'directory':str(dest),'files':len(manifest),'zipBytes':zipout.stat().st_size,'zipSHA256':hashlib.sha256(zipout.read_bytes()).hexdigest()}))
