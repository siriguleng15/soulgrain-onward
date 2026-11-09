from pathlib import Path
import sys,json,hashlib,numpy as np
sys.path[:0]=['/workspace/artifacts/glb-transfer-01-audit','/workspace/artifacts/glb-texture-transfer-v1/python']
from audit_glb import GLB
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
R=Path(__file__).resolve().parents[1];A=Path('/workspace/artifacts/onward-structure-audit-20261109');SRC=Path('/workspace/artifacts/glb-material-finish-v4/output/soulgrain-B-style-sole-toe-tongue-test-v4.glb')
inputs=[SRC,A/'SOULGRAIN-structure-audit.pdf',A/'audit-report.zh-CN.md',A/'reports/semantic-candidates.json',A/'reports/topology-issue-locations.json']
(R/'reports/input-manifest.json').write_text(json.dumps([{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in inputs],indent=2))
q=np.load(A/'data/inspection-mesh.npz');p=q['positions'];f=q['faces'];mat=q['materials'];lab=q['labels'];mid=q['meshids'];c=p[f].mean(1);origin=np.array([-.093695171,.306194395,-.045260295]);normal=np.array([-.689745963,.674733758,-.262649626]);t=np.array([.630564083,.738061226,.240113649]);w=np.array([-.355864290,0,.934537624]);coords=(p-origin)@np.column_stack([t,w,normal]);cc=(c-origin)@np.column_stack([t,w,normal]);sel=lab==6
pts,inv=np.unique(p,axis=0,return_inverse=True);ff=inv[f[sel]];edges=np.concatenate([ff[:,[0,1]],ff[:,[1,2]],ff[:,[2,0]]]);edges.sort(1);ue,count=np.unique(edges,axis=0,return_counts=True);bed=ue[count==1];np.savez_compressed(R/'data/candidate.npz',positions=p,faces=f,materials=mat,labels=lab,selected=sel,coords=coords,origin=origin,normal=normal,t=t,w=w)
fig,axs=plt.subplots(1,2,figsize=(16,8));z=cc[sel];axs[0].scatter(z[:,1],z[:,0],c=z[:,2],s=.15,cmap='viridis',vmin=-.1,vmax=.05);axs[0].set_title('Material9 tongue candidate: W / T, color H');axs[0].set_aspect('equal');axs[1].scatter(c[sel,0],c[sel,1],c=c[sel,2],s=.2);axs[1].set_title('Candidate sagittal X/Y, color Z');axs[1].set_aspect('equal');fig.savefig(R/'images/candidate-projections.png',dpi=150)
print('Selected',sel.sum(),'boundary',len(bed),'coords',np.quantile(z,[0,.01,.5,.99,1],axis=0));print('material9 tongue original bounds',c[sel].min(0),c[sel].max(0))
