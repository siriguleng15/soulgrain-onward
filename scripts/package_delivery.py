from pathlib import Path
import json,hashlib,sys,zipfile,os,subprocess
import numpy as np
R=Path(__file__).resolve().parents[1];sys.path.insert(0,'/workspace/artifacts/glb-transfer-01-audit');from audit_glb import GLB
old=json.loads(Path('/workspace/artifacts/onward-structure-audit-20261109/reports/integrity-before.json').read_text());sources=[]
for name,v in old.items():
 p=Path(v['path']);s=hashlib.sha256(p.read_bytes()).hexdigest();assert s==v['sha256'];sources.append({'name':name,'path':str(p),'sha256':s,'unchanged':True})
v=json.loads((R/'reports/validation.json').read_text());q=json.loads((R/'reports/viewer-validation.json').read_text());assert q['restorationError']==0 and not q['errors'];assert all(x['zeroAreaUV']==0 for x in v['uv']);assert v['geometry']['normalRaySampling']['shorterThan0_001']==0
full=GLB(R/'output/SOULGRAIN-V5.1-tongue-structure-test.glb');only=GLB(R/'output/SOULGRAIN-V5.1-tongue-only.glb');fm=full.doc['meshes'][full.doc['nodes'][full.doc['extras']['tongueMeshNode']]['mesh']];om=only.doc['meshes'][0]
assert len(fm['primitives'])==len(om['primitives'])
for a,b in zip(fm['primitives'],om['primitives']):
 assert np.array_equal(full.accessor(a['indices']),only.accessor(b['indices']))
 for k in a['attributes']:assert np.array_equal(full.accessor(a['attributes'][k]),only.accessor(b['attributes'][k]))
currentHash=hashlib.sha256(full.raw).hexdigest();assert currentHash==v['sha256'];assert only.doc['extras']['sourceFullAssetSHA256']==currentHash
for kind,count in [('V4',6),('V51',8)]:
 log=json.loads((R/'reports'/f'render-{kind}.json').read_text());assert len(log)==count
 for row in log:assert (R/'images'/row['file']).is_file()
from PIL import Image
assert np.array_equal(np.asarray(Image.open(R/'images/V51-assembled.png')),np.asarray(Image.open(R/'images/V51-restored.png'))), 'Restored pixels differ from assembled render'
status=subprocess.run(['git','-C','/workspace/soulgrain-onward','status','--porcelain','-uno'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},capture_output=True,text=True).stdout;baseline=Path('/workspace/artifacts/onward-structure-audit-20261109/reports/site-status-after.txt').read_text();assert status==baseline
proof={'sourceFiles':sources,'fullGLBSHA256':currentHash,'isolatedTongueSHA256':hashlib.sha256(only.raw).hexdigest(),'isolatedTongueGeometryIdenticalToFullTongue':True,'originalSiteGitStatusUnchanged':True,'assembledAndRestoredRenderPixelsIdentical':True,'noCommitPushMergeDeployment':True,'writesConfinedToIndependentWorkspace':str(R),'pending':['Factory root seam position','Back cloth specification','Future unfolding animation and collision validation']};(R/'reports/delivery-verification.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2))
reports=['input-manifest.json','construction.json','export.json','validation.json','viewer-validation.json','render-V4.json','render-V51.json','report-layout.json','delivery-verification.json']
files=[R/'README.txt',R/'SOULGRAIN-V5.1-structure-report.pdf',R/'structure-report.zh-CN.md',R/'report.html',R/'viewer/index.html',R/'viewer/app.js',R/'data/tongue-rebuilt.npz']+list((R/'output').glob('*.glb'))+[R/'reports'/x for x in reports]+list((R/'scripts').glob('*.py'))+list((R/'scripts').glob('*.mjs'))+list((R/'images').glob('compare-*.jpg'))+[R/'images/acceptance-six-views.jpg',R/'images/uv-inspection.png',R/'images/continuous-section.png',R/'images/viewer-ipad-portrait.png']+list((R/'images').glob('V4-*.png'))+list((R/'images').glob('V51-*.png'))
files=sorted(set(files));manifest=[{'path':str(p.relative_to(R)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files];(R/'reports/file-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));files.append(R/'reports/file-manifest.json');out=R/'SOULGRAIN-V5.1-delivery.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,'SOULGRAIN-V5.1/'+str(p.relative_to(R)))
with zipfile.ZipFile(out) as z:assert z.testzip() is None
result={'archive':out.name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(files),'verificationPassed':True};(R/'reports/package.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
