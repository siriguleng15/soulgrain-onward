from common import *
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
q=np.load('/workspace/artifacts/onward-tongue-v5-1/data/source-body.npz');p=q['positions'];f=q['faces'];m=q['material'];c=p[f].mean(1);a=np.load('/workspace/artifacts/onward-structure-audit-20261109/data/inspection-mesh.npz');rgb=a['centroidRGB'][:len(f)];mr=np.load(R/'data/metal-mask.npz')['mr'];z=np.load(R/'data/cleanup.npz');keep=~z['laces']&~z['oldTongue'];scope=keep&(c[:,0]>-.65)&(c[:,0]<.21)&(c[:,1]>-.22)&(abs(c[:,2])<.34)&np.isin(m,[0,9]);ids=np.where(scope)[0];fig,ax=plt.subplots(1,2,figsize=(14,6))
for j,sign in enumerate([-1,1]):
 t=ids[sign*c[ids,2]>0];ax[j].scatter(c[t,0],c[t,1],c=rgb[t]/255,s=1);metal=t[mr[t,2]>75];ax[j].scatter(c[metal,0],c[metal,1],s=1,c='red');ax[j].set_title(str(sign)+' original retained; red=MR metal');ax[j].set_aspect('equal');ax[j].grid();ax[j].set_xlim(-.67,.22);ax[j].set_ylim(-.25,.5)
fig.savefig(R/'images/retained-map.png',dpi=150)
