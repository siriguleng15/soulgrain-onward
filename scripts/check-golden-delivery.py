"""Read-only static delivery checks for the V1.2 interactive construction."""
from pathlib import Path
import argparse, hashlib, json, re

parser=argparse.ArgumentParser();parser.add_argument('--build',default='/tmp/xiezitu-golden-v1-2-build');args=parser.parse_args()
root=Path(__file__).resolve().parents[1];build=Path(args.build).resolve()
assets=build/'golden-derivation';verification=assets/'verification'
entry=build/'golden-derivation.html';assert entry.is_file()
for html in [entry,assets/'review.html']:
 for url in re.findall(r'(?:src|href)="([^"]+)"',html.read_text()):
  if url.startswith(('http:','https:','#')):continue
  target=(html.parent/url.split('?')[0]).resolve()
  assert target.is_relative_to(build) and target.is_file(),(html,url)
source=assets/'xiezitu.glb';sha=hashlib.sha256(source.read_bytes()).hexdigest()
assert sha=='b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897'
for name in ['browser-check.json','geometry-check.json','protection-check.json']:
 assert json.loads((verification/name).read_text())['passed'],name
for name in ['proof-check.json','placement-check.json']:
 assert json.loads((verification/name).read_text())['passed'],name
assert 'V1.2' in entry.read_text()
assert '73 秒' in (assets/'review.html').read_text()
assert '<video' not in (assets/'review.html').read_text(), 'Do not present the previous V1.1 movie as V1.2'
report={'passed':True,'animationVersion':'1.2','buildEntry':str(entry),'localReferencesResolve':True,'originalModelSha256':sha,'unchangedGeometryVersion':'1.1','duration':73,'review':'Actual WebGL interaction and current keyframes','deviceScope':'Chromium touch emulation, not physical iPad Safari testing.','published':False}
(root/'public/golden-derivation/verification/delivery-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
