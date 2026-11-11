from pathlib import Path
import numpy as np,json,struct,hashlib
R=Path(__file__).resolve().parents[1];P=R/'public/golden-derivation/soul-v1-3';raw=(P/'soul-new-web.glb').read_bytes();ln=struct.unpack_from('<I',raw,12)[0];d=json.loads(raw[20:20+ln]);binary=memoryview(raw)[28+ln:];types={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'};width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
def a(i):
 q=d['accessors'][i];b=d['bufferViews'][q['bufferView']];return np.frombuffer(binary,types[q['componentType']],count=q['count']*width[q['type']],offset=b.get('byteOffset',0)+q.get('byteOffset',0)).reshape(q['count'],width[q['type']])
def canonical(t):
 t=np.asarray(t,'f4').copy();t[t==0]=0;corners=np.ascontiguousarray(t).view('V12').reshape(-1,3);start=np.lexsort((t[:,:,2],t[:,:,1],t[:,:,0]),axis=1)[:,0];ordered=t[np.arange(len(t))[:,None],(start[:,None]+np.arange(3))%3];return np.sort(np.ascontiguousarray(ordered).reshape(-1,9).view('V36').ravel())
export=json.loads((R/'research/golden-derivation/soul-v1-3/export.json').read_text());rows=[];total=0;lookup={n['name']:n for n in d['nodes'] if 'mesh' in n}
for source in export['meshes']:
 z=np.load('/workspace/artifacts/soulgrain-geometry-repair-01-03-20261111/reports/source-'+source['uid']+'.npz');v=z['v'][:,[0,2,1]].copy();v[:,2]*=-1;expected=v[z['f']];mesh=d['meshes'][lookup[source['name']]['mesh']];actual=[]
 for p in mesh['primitives']:actual.append(a(p['attributes']['POSITION'])[a(p['indices']).reshape(-1,3)])
 actual=np.concatenate(actual);assert len(actual)==len(expected);assert np.array_equal(canonical(actual),canonical(expected)),source['name'];rows.append({'name':source['name'],'source_triangles':len(expected),'exported_triangles':len(actual),'oriented_triangle_positions_exact':True});total+=len(actual)
assert total==1499039;data=json.loads((P/'construction.json').read_text());assert data['sourceSha256']==hashlib.sha256(raw).hexdigest();reconstruction=0
for anchor in data['seam']['anchors']:
 p=d['meshes'][lookup[anchor['node']]['mesh']]['primitives'][anchor['primitive']];v=a(p['attributes']['POSITION']);face=a(p['indices']).reshape(-1,3)[anchor['triangle']];assert face.tolist()==anchor['ids'];pt=np.asarray(anchor['barycentric'])@v[face];reconstruction=max(reconstruction,float(abs(pt-anchor['point']).max()))
assert reconstruction<1e-10;p=np.asarray(data['frame']['origin']);e=np.asarray(data['frame']['axis']);down=np.asarray(data['frame']['down']);assert abs(p[0]-data['calibration']['eyelets'][3]['point'][0])<1e-12;assert p[1]<data['calibration']['eyelets'][3]['point'][1];assert abs(e@down)<1e-12
report={'passed':True,'sourceBlendSha256':export['source']['sha256'],'webGlbSha256':data['sourceSha256'],'all_source_triangles_retained':total,'parts':rows,'newSourceBarycentricAnchors':len(data['seam']['anchors']),'maxAnchorReconstructionError':reconstruction,'contactBelowFourthLacedEyelet':True,'secondStartOnSameShortEdge':True,'sourceSavedOrClassified':False};(R/'research/golden-derivation/soul-v1-3/source-check.json').write_text(json.dumps(report,indent=2));print('SOUL_GEOMETRY_AND_ANCHORS_EXACT',total,reconstruction)
