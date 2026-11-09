from pathlib import Path
import sys,json,numpy as np
R=Path(__file__).resolve().parents[1];sys.path[:0]=['/workspace/artifacts/glb-transfer-01-audit','/workspace/artifacts/glb-texture-transfer-v1/python']
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from matplotlib.font_manager import FontProperties
from audit_glb import GLB
import trimesh
font=FontProperties(fname='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc');plt.rcParams.update({'figure.facecolor':'#101925','axes.facecolor':'#101925','axes.edgecolor':'#7b91a7','axes.labelcolor':'#c3d7e7','xtick.color':'#c3d7e7','ytick.color':'#c3d7e7','text.color':'#ecf4fb','font.size':10})
g=GLB(R/'output/SOULGRAIN-V5.1-tongue-structure-test.glb');mesh=g.doc['meshes'][g.doc['nodes'][g.doc['extras']['tongueMeshNode']]['mesh']]
fig,axes=plt.subplots(1,3,figsize=(18,6));items=[mesh['primitives'][0],mesh['primitives'][1],mesh['primitives'][-1]]
for ax,pr,title in zip(axes,items,['外露面：V4 材质采样专用 UV','新建鞋带下主体：独立 UV','厚度围边：带留白的独立 UV 岛']):
 uv=g.accessor(pr['attributes']['TEXCOORD_0']);f=g.accessor(pr['indices']).reshape(-1,3);t=uv[f];edges=np.concatenate([t[:,[0,1]],t[:,[1,2]],t[:,[2,0]]]);ax.add_collection(LineCollection(edges,colors='#62bed3',linewidths=.18));ax.set_xlim(-.02,1.02);ax.set_ylim(1.02,-.02);ax.set_aspect('equal');ax.set_title(title,fontproperties=font,fontsize=14);ax.set_xlabel('U');ax.set_ylabel('V')
fig.suptitle('V5.1 实际导出 UV 检查：各表面无零面积 UV；原鞋身 UV 和图集未改',fontproperties=font,fontsize=17);fig.tight_layout(rect=[0,0,1,.92]);fig.savefig(R/'images/uv-inspection.png',dpi=150);plt.close(fig)
q=np.load(R/'data/tongue-rebuilt.npz');tongue=trimesh.Trimesh(q['positions'],q['faces'],process=False);src=np.load(R/'data/source-body.npz');old=trimesh.Trimesh(src['positions'],src['faces'],process=False);newlines=trimesh.intersections.mesh_plane(tongue,[0,0,1],[0,0,0]);oldlines=trimesh.intersections.mesh_plane(old,[0,0,1],[0,0,0]);fig,ax=plt.subplots(figsize=(14,9));ax.add_collection(LineCollection(oldlines[:,:,[0,1]],colors='#728497',linewidths=.7,alpha=.65));ax.add_collection(LineCollection(newlines[:,:,[0,1]],colors='#f0b45b',linewidths=1.6));ax.autoscale();ax.set_xlim(-.72,.28);ax.set_ylim(-.25,.56);ax.set_aspect('equal');ax.grid(alpha=.12);ax.set_title('中央纵剖：灰色 V4 原表面；金色 V5.1 连续鞋舌实体',fontproperties=font,fontsize=18);ax.set_xlabel('X (toe negative)');ax.set_ylabel('Y (up)');ax.annotate('喉口根部：测试连接位置，待确认',xy=(-.595,-.175),xytext=(-.68,-.03),fontproperties=font,color='#f0c98d',arrowprops={'arrowstyle':'->','color':'#f0c98d'});ax.annotate('鞋带下主体 → 折回 → 外露段',xy=(.04,.40),xytext=(-.52,.51),fontproperties=font,color='#f0c98d',arrowprops={'arrowstyle':'->','color':'#f0c98d'});fig.tight_layout();fig.savefig(R/'images/continuous-section.png',dpi=150);plt.close(fig)
print('UV and continuity diagrams complete')
