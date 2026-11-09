from common import *
from scipy.interpolate import PchipInterpolator
NSEAM=65
u=np.linspace(-1,1,NSEAM)
front_seam=np.column_stack([u*4.45,23.30-.42*(1-u*u)])
# Outline traced from the supplied front-pattern photograph. Internal drafting cuts are not finished openings.
pixels=np.array([[617,1124],[632,952],[640,784],[641,672],[625,625],[586,590],[498,543],[518,494],[460,470],[495,405],[562,328],[650,269],[727,231],[790,219],[851,225],[915,253],[982,292],[1035,342],[1083,405],[1110,463],[1060,488],[1075,540],[977,588],[934,643],[929,705],[936,836],[960,1094],[963,1124]],dtype='f8')
front=np.column_stack([(pixels[:,0]-790)/(346/8.9),(pixels[:,1]-218)/(346/8.9)])
front[0]=front_seam[0];front[-1]=front_seam[-1];front=np.vstack([front,front_seam[-2:0:-1]])
back_seam=np.column_stack([u*4.45,.40*(1-u*u)])
back_side=np.array([[4.45,0],[4.65,2.8],[4.85,6.2],[5.10,9.5],[5.15,12.0],[4.95,13.55],[4.45,14.6],[3.50,15.3],[2.1,15.7],[0,15.8],[-2.1,15.7],[-3.50,15.3],[-4.45,14.6],[-4.95,13.55],[-5.15,12.0],[-5.10,9.5],[-4.85,6.2],[-4.65,2.8],[-4.45,0]])
back=np.vstack([back_seam,back_side[1:-1]])
holes=np.array([[-2.05,12.85],[2.05,12.85]])
patterns={'front':front.tolist(),'back':back.tolist(),'frontSeam':front_seam.tolist(),'backSeam':back_seam.tolist(),'holes':holes.tolist(),'holeRadiusCm':.275,'basis':'photo traced proportions; front fan toward toe; narrow end sewn to back top, confirmed by user','frontDraftCuts':'closed in finished cloth; drafting marks are not decorative holes','nominalFinishedBackCm':[10.3,15.8],'scaleQualification':'Photo perspective and seam allowance are not certified manufacturing measurements.'}
(R/'data/patterns.json').write_text(json.dumps(patterns,ensure_ascii=False,indent=2))
if __name__=='__main__':
 import matplotlib
 matplotlib.use('Agg')
 import matplotlib.pyplot as plt
 from matplotlib.font_manager import FontProperties
 font=FontProperties(fname='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc');fig,axs=plt.subplots(1,2,figsize=(12,10))
 for ax,outline,seam,title in [(axs[0],front,front_seam,'图二：前片，扇形端朝鞋头'),(axs[1],back,back_seam,'图三：后片，圆角与两孔')]:
  q=np.vstack([outline,outline[0]]);ax.fill(q[:,0],q[:,1],color='#d4dfeb');ax.plot(q[:,0],q[:,1],color='#284763');ax.plot(seam[:,0],seam[:,1],color='#d25938',lw=3);ax.set_aspect('equal');ax.invert_yaxis();ax.grid(alpha=.2);ax.set_title(title,fontproperties=font,fontsize=15)
 for x,y in holes:axs[1].add_patch(plt.Circle((x,y),.275,fill=False,color='#305568'))
 fig.suptitle('两片纸样关系：红色边相缝；剪口与定位线不直接保留为成品破洞',fontproperties=font,fontsize=15);fig.tight_layout(rect=[0,0,1,.94]);fig.savefig(R/'images/pattern-layout.png',dpi=160)
