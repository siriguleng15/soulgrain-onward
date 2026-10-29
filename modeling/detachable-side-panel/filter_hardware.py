#!/usr/bin/env python3
"""Retain only first-visible original triangles from the connector candidates.

This is source-model visibility selection, not a reconstruction of hidden PU
layers. It reuses the V10 32-pixel orthographic ray acceleration unchanged.
Run before exporting the filtered hardware layer. To repeat against the same
original selection after hardware-data.json has been overwritten, pass this
script's own hardware-visibility.json via --candidates; its embedded original
candidate list is retained for reproducibility.
"""
from pathlib import Path
import argparse, hashlib, importlib.util, json, time
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
DEFAULT=ROOT/'public/detachable-side-panel'
parser=argparse.ArgumentParser()
parser.add_argument('--candidates',type=Path,default=DEFAULT/'hardware-data.json')
parser.add_argument('--out',type=Path,default=DEFAULT/'hardware-visibility.json')
args=parser.parse_args()
raw=args.candidates.read_bytes();source=json.loads(raw)
candidates=source.get('candidateTriangles',source.get('sourceTriangles'))
if not isinstance(candidates,list) or not candidates:
    raise RuntimeError('Actual source triangle candidates are required; no synthetic connector is accepted.')
MODEL=ROOT/'public/reference-model-v10/corrected.glb'
META=ROOT/'public/reference-model-v10/model-data.json'
spec=importlib.util.spec_from_file_location('v10_source_visibility',ROOT/'modeling/reference-model-v10/build_bridge.py')
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
modelraw,doc,binary=helper.read_glb(MODEL)
sha=hashlib.sha256(modelraw).hexdigest()
if source.get('sourceModelSha256')!=sha:raise RuntimeError('Hardware candidates belong to a different model.')
meta=json.loads(META.read_text());reg,right,up,forward=helper.registration(meta)
parts=helper.primitives(doc,binary);helper.prepare(parts,reg,right,up,forward)
by_name={}
for part in parts:
    if part['name']in by_name:raise RuntimeError('Ambiguous source mesh name '+part['name'])
    by_name[part['name']]=part
cache={};retained=[];rejected=[];counts={};max_centroid_error=0.;start=time.time()
for candidate in candidates:
    mesh=candidate['mesh'];tri=candidate['triangle'];key=(mesh,tri)
    if key not in cache:
        part=by_name.get(mesh)
        if part is None or not isinstance(tri,int) or not 0<=tri<len(part['indices']):raise RuntimeError('Invalid actual source triangle '+str(key))
        center=part['vertices'][tri].mean(axis=0);pixel=helper.project(center,reg,right,up)
        diagnostic={};hits=helper.hit_photo(pixel,'excluded',parts,reg,right,up,forward,diagnostic)
        first=hits[0]if hits else None
        visible=bool(first and first['meshName']==mesh and first['triangle']==tri)
        error=float(np.linalg.norm(np.asarray(first['modelPosition'])-center))if visible else None
        if visible and error>1e-7:raise RuntimeError('Visible centroid did not resolve to its exact source point.')
        cache[key]={'visible':visible,'firstMesh':first['meshName']if first else diagnostic.get('firstSurfaceMesh'),'firstTriangle':first['triangle']if first else None,'firstRole':diagnostic.get('firstSurfaceRole'),'error':error}
    result=cache[key]
    group=candidate['clasp']+'/'+candidate['part'];entry=counts.setdefault(group,{'candidates':0,'retained':0});entry['candidates']+=1
    if result['visible']:
        retained.append(candidate);entry['retained']+=1;max_centroid_error=max(max_centroid_error,result['error'])
    else:rejected.append({**candidate,'firstMesh':result['firstMesh'],'firstTriangle':result['firstTriangle'],'firstRole':result['firstRole']})
meshes=[]
for mesh in sorted({x['mesh']for x in candidates}):
    selected=sorted({c['triangle']for c in retained if c['mesh']==mesh})
    meshes.append({'meshName':mesh,'visibleTriangles':selected})
report={'schemaVersion':1,'sourceModelSha256':sha,'sourceCandidatesFile':str(args.candidates.relative_to(ROOT))if args.candidates.is_relative_to(ROOT)else str(args.candidates),'sourceCandidatesSha256':hashlib.sha256(raw).hexdigest(),'method':'Actual corrected GLB, source photograph orthographic camera, 32px tile ray acceleration. A candidate is retained only when its centroid ray first hits the exact same source mesh and triangle.','candidateCount':len(candidates),'uniqueCandidateCount':len(cache),'retainedCount':len(retained),'rejectedCount':len(rejected),'maximumVisibleCentroidReconstructionErrorModelUnits':max_centroid_error,'countsByClaspPart':counts,'meshes':meshes,'sourceTriangles':retained,'candidateTriangles':candidates,'rejectedTriangles':rejected,'productionReady':False,'limitations':['This tests first visibility at each candidate triangle centroid, not an exact full-triangle occlusion clip.','ROI membership and visibility do not certify the source AI triangle as an actual manufactured PU layer.','Unobserved connector backs and factory joining structure are not reconstructed.']}
args.out.parent.mkdir(parents=True,exist_ok=True)
args.out.write_text(json.dumps(report,separators=(',',':'))+'\n')
print(json.dumps({'candidates':len(candidates),'retained':len(retained),'rejected':len(rejected),'seconds':time.time()-start,'byPart':counts,'out':str(args.out)},indent=2),flush=True)
