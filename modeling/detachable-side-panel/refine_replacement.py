#!/usr/bin/env python3
"""Make the derived rest-shoe opening with anatomical rather than broad labels.

V10's Tongue_Flap_And_Local_Repairs was a highlight region, not a manufacturing
part. Its front-body islands may be removed outside the actual tongue flap.
No source GLB or paper coordinate is edited by this helper.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,default=ROOT/'public/detachable-side-panel/replacement-mask.json');args=parser.parse_args()
spec=importlib.util.spec_from_file_location('v10_source_audit',ROOT/'modeling/reference-model-v10/build_bridge.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
raw,doc,binary=helper.read_glb(ROOT/'public/reference-model-v10/corrected.glb')
meta=json.loads((ROOT/'public/reference-model-v10/model-data.json').read_text())
reg,right,up,forward=helper.registration(meta);parts=helper.primitives(doc,binary)
seamOnlyBody=np.array([[270,553],[333,511],[430,482],[518,452],[589,408],[661,346],[713,277],[741,376],[766,458],[815,563]],float)
# The complete paper includes the eyelet bank above the old decorative/body
# seam ROI. Shift only that bank's upper chain, preserving toe and sole joins.
body=seamOnlyBody.copy();body[1:7]+=np.array([-10.,-35.])
cuff=np.array([[700,218],[1115,127],[1214,416],[870,596]],float)
# Parent-reviewed reference-image flap protection, not the broad V10 ID band.
tongue=np.array([[300,355],[331,291],[430,220],[625,132],[698,164],[650,235],[540,300],[465,365],[360,414]],float)
expandedBody=body.mean(0)+(body-body.mean(0))*1.055
expandedCuff=cuff.mean(0)+(cuff-cuff.mean(0))*1.055

def inside(points,polygon):
    x,y=points[:,0],points[:,1];result=np.zeros(len(points),dtype=bool)
    for a,b in zip(polygon,np.roll(polygon,1,axis=0)):
        result^=((a[1]>y)!=(b[1]>y))&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1]+1e-30)+a[0])
    return result

meshes=[];summary=[]
for part in parts:
    vertices=part['positions'][part['indices']];centers=vertices.mean(axis=1);pixel=helper.project(centers,reg,right,up)
    sameSide=(centers[:,2]>-.055)&(centers[:,1]>-.235)
    bodyRegion=inside(pixel,expandedBody);cuffRegion=inside(pixel,expandedCuff);flap=inside(pixel,tongue)
    if part['role']in ['body','cuff']:mask=sameSide
    elif part['name']=='Footwear_Details_Unclassified':mask=(bodyRegion|cuffRegion)&sameSide
    elif part['name']=='Tongue_Flap_And_Local_Repairs':mask=(bodyRegion|cuffRegion)&sameSide&~flap
    else:mask=np.zeros(len(centers),bool)
    # Explicit invariant: the actual reference flap is never cut from the
    # broad tongue-highlight mesh by this anatomical refinement.
    if part['name']=='Tongue_Flap_And_Local_Repairs':assert not np.any(mask&flap)
    assert not np.any(mask&~sameSide)
    entry={'meshPath':part['meshPath'],'meshName':part['name'],'geometrySignature':part['geometrySignature'],'triangleCount':len(centers),'removedTriangles':np.flatnonzero(mask).tolist(),'keptTriangles':np.flatnonzero(~mask).tolist(),'purpose':'Derived outer-side replacement opening. Broad V10 highlight labels are refined anatomically; true reference tongue flap, sole and opposite side protected.'}
    meshes.append(entry);summary.append({'meshName':part['name'],'sourceTriangles':len(centers),'removedTriangles':int(mask.sum()),'retainedTriangles':int((~mask).sum()),'protectedTongueFlapTriangles':int((flap&sameSide).sum())if part['name']=='Tongue_Flap_And_Local_Repairs'else 0})
report={'schemaVersion':1,'modelSha256':hashlib.sha256(raw).hexdigest(),'meshes':meshes,'summary':summary,'anatomicalPhotoRegions':{'body':body.tolist(),'legacySeamOnlyBody':seamOnlyBody.tolist(),'eyeletBankUpperChainOffsetPx':[-10,-35],'cuff':cuff.tolist(),'expansion':1.055,'protectedTongueFlap':tongue.tolist()},'frontDepthGuardModelUnits':-.055,'soleHeightGuardModelUnits':-.235,'originalModelUnmodified':True,'productionReady':False,'limitations':['Single-reference anatomical selection is not recovered factory segmentation.','Triangle-centroid ROI decisions preserve the fixed original source triangle IDs, without claiming exact sewn cut boundaries.','Only the derived context mesh loses selected triangles; real paper rest geometry remains separate and unchanged.']}
args.out.parent.mkdir(parents=True,exist_ok=True);args.out.write_text(json.dumps(report,separators=(',',':'))+'\n')
print(json.dumps({'out':str(args.out),'removedTotal':sum(x['removedTriangles']for x in summary),'summary':summary},indent=2),flush=True)
