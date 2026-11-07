"""Original microfacet textile atlases, authored from the supplied appearance brief.
No illustration, red guides, layout or third-party photograph is overwritten.
"""
from pathlib import Path
import numpy as np,json
from PIL import Image
from scipy.spatial import cKDTree
OUT=Path(__file__).resolve().parents[2]/'public/tongue-motion-lab/assets';OUT.mkdir(exist_ok=True,parents=True)
rng=np.random.default_rng(4419);size=1024;nx,ny=58,90;cx=(np.arange(nx)+.5)*size/nx;cy=(np.arange(ny)+.5)*size/ny;x,y=np.meshgrid(cx,cy);centers=np.column_stack([x.ravel(),y.ravel()]);centers+=rng.uniform(-.38,.38,centers.shape)*[size/nx,size/ny];grid=np.indices((size,size));pixels=np.column_stack([grid[1].ravel(),grid[0].ravel()]);aspect=np.array([1,158/103]);tree=cKDTree(centers*aspect);dist,ids=tree.query(pixels*aspect,k=2);nearest=ids[:,0];delta=(pixels-centers[nearest])*aspect;angle=np.arctan2(delta[:,1],delta[:,0]);facet=((angle+np.pi)/(np.pi/3)).astype(int)%6;seed=rng.random((len(centers),6,4));f=seed[nearest,facet];rad=np.linalg.norm(delta,axis=1)/(size/nx*.50);edge=np.clip((dist[:,1]-dist[:,0])*1.6,0,1);crystal=rng.random(len(centers));tone=crystal[nearest]
# Deep lapis, sapphire and turquoise; rare pale facets remain restrained.
palette=np.array([[2,9,20],[3,25,56],[3,58,98],[0,104,151],[1,65,110],[8,130,163],[55,178,193],[156,220,226]],float)
pick=np.minimum((tone**1.7*7).astype(int),7);color=palette[pick]*(.30+1.15*f[:,0,None]);color*=edge[:,None]*(.5+.5*np.clip(rad,0,1))[:,None];color+=np.array([1,3,8]);bright=(f[:,1]>.955)&(rad<.55)&(edge>.8);color[bright]=np.array([130,216,234])*(.65+.35*f[bright,0,None]);color[rad>1.0]=[1,4,9];color=np.clip(color,0,255).astype(np.uint8)
# Each cut face has a coherent tilted normal, giving actual moving reflections.
a=(facet+.5)*np.pi/3+rng.uniform(-.1,.1,len(centers))[nearest];slope=.32+.5*f[:,2];normal=np.column_stack([np.cos(a)*slope,np.sin(a)*slope,np.sqrt(np.maximum(1-slope*slope,.05))]);normal[(edge<.2)|(rad>1.0)]=[0,0,1];normal=(normal*.5+.5)*255;rough=np.clip(.20+.18*f[:,3]+.12*(edge<.2),0,1);rough=np.repeat((rough*255).astype(np.uint8)[:,None],3,axis=1)
for name,data in [('crystal-color',color),('crystal-normal',normal.astype(np.uint8)),('crystal-roughness',rough)]:Image.fromarray(data.reshape(size,size,3)).save(OUT/(name+'.png'),optimize=True)
(OUT/'crystal-textile.json').write_text(json.dumps({'source':'Original procedural microfacet textile, matched to user blue-crystal appearance reference; no source art edited','size':size,'crystalCells':len(centers),'normalMap':'tangent-space RGB','colorSpace':'sRGB for color, linear for normal/roughness','seed':4419},indent=2)+'\n');print('Authored',len(centers),'microfacet cells in three PBR atlases.')
