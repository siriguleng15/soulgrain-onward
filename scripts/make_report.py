from common import *
import base64,html,hashlib,io
from PIL import Image,ImageDraw,ImageFont
v=json.loads((R/'reports/validation.json').read_text());geo=v['tongue'];scope=v['scope'];qa=json.loads((R/'reports/viewer-validation.json').read_text())
fontpath='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
font=ImageFont.truetype(fontpath,30)
for view,title in [('quarter','全鞋装配'),('front','正面'),('opening','上方检查'),('opposite','另一侧')]:
 im=Image.new('RGB',(2000,800),'#eef1f3');d=ImageDraw.Draw(im)
 for x,prefix,label in [(0,'V4','V4 原始参考'),(1000,'V52','V5.2 两片鞋舌测试')]:
  pic=Image.open(R/f'images/{prefix}-{view}.png').convert('RGB');pic.thumbnail((1000,733));im.paste(pic,(x+(1000-pic.width)//2,64));d.text((x+26,12),label+' · '+title,font=font,fill='#142a40')
 im.save(R/f'images/compare-{view}.jpg',quality=92)
q=np.load(R/'data/two-panels.npz')
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.font_manager import FontProperties
fp=FontProperties(fname=fontpath);fig,axs=plt.subplots(1,2,figsize=(9,10))
for ax,xy,tri,title in [(axs[0],q['frontPattern'],q['frontTriangles'],'前片：连续覆盖面'),(axs[1],q['backPattern'],q['backTriangles'],'后片：翻折段及两孔')]:
 ax.triplot(xy[:,0],xy[:,1],tri,lw=.18,color='#47749a');ax.set_aspect('equal');ax.invert_yaxis();ax.set_title(title,fontproperties=fp);ax.set_xlabel('纸样坐标；照片比例，非生产尺寸',fontproperties=fp);ax.grid(alpha=.15)
fig.tight_layout();fig.savefig(R/'images/mesh-uv-layout.png',dpi=160);plt.close(fig)
# This inspection SVG annotates the actual rendered frame without altering the GLB or concealing defects.
def dataimg(name):
 path=R/'images'/name;im=Image.open(path).convert('RGB');im.thumbnail((1500,1200));buf=io.BytesIO();im.save(buf,format='JPEG',quality=88);return 'data:image/jpeg;base64,'+base64.b64encode(buf.getvalue()).decode()
def image(name,caption='',cls=''):
 return f'<figure class="{cls}"><img src="{dataimg(name)}"><figcaption>{html.escape(caption)}</figcaption></figure>'
def page(title,content):return '<section class="page"><h1>'+title+'</h1>'+content+'</section>'
def table(rows):return '<table>'+''.join('<tr>'+''.join('<td>'+html.escape(str(x))+'</td>' for x in row)+'</tr>' for row in rows)+'</table>'
pages=[]
pages.append(page('V5.2 · 按实物两片纸样重建鞋舌', '<p class="kicker">SOULGRAIN / ONWARD · 独立结构试件 · 2026-11-10</p><p class="notice">本版可供结构复核，尚未通过最终验收。横跨开口的已识别鞋带面已实际删除；原鞋眼与鞋带融合的交界仍有残缺及切割边界，不能称为鞋带清理完全完成。</p>'+image('compare-quarter.jpg','同一相机、灯光与渲染设置；V4 原始参考与当前测试模型。','wide')+'<p>基于 V4 原始模型重新处理，未使用被否决的 V5.1 新鞋舌几何。V4、原始纹理及正式网站均不覆盖。这里只验证两片纸样的组装、开口覆盖、正反面和独立控制。</p>'+table([['项目','当前结果'],['两片缝合关系','用户已确认：图二扇形端朝鞋头，窄端接图三上边'],['连续布面 / 双面 / 厚度','已建立，壳体检查通过'],['原鞋眼与鞋带的融合交界','仍需人工确认和局部重建'],['最终外观、展开动画和布料碰撞','本试件尚未完成验收']])) )
pages.append(page('01 / 纸样关系与覆盖逻辑',image('pattern-layout.png','红边相缝；两片沿长度方向组合，不是正面与里布两层。','pattern')+'<p>前片的大扇形端朝鞋头并收进鞋头/前帮内部，中段覆盖原鞋带开口；窄端与后片上边连接。后片从缝合处继续向鞋口上升，再向前翻折，圆角端带两孔与白色锁边。</p><p>纸样的剪口、中心定位线和纸面开槽没有直接当作成品破洞。孔径、缝份和尺寸仅按照片比例拟合，未声称还原工厂纸样或得到真实厘米标定。</p>'))
pages.append(page('02 / 原鞋带开口的连续布面',image('V52-flat-front-panel-on-shoe.png','仅为检查临时隐藏后片、锁边和新孔圈，前片仍在装配位置。','tall')+'<p class="notice">开口中部已有连续覆盖面。两侧原始鞋眼座仍能看到破损、薄片和锯齿边缘：这是未完成的问题，不是有意设计的边缘。</p>'))
pages.append(page('03 / 独立部件、背面与厚度', '<div class="grid">'+image('V52-isolated-whole.png','两片缝合后的完整鞋舌')+image('V52-isolated-back.png','独立鞋舌另一侧')+image('V52-side-thickness.png','侧面 / 翻折 / 厚度')+image('V52-exploded.png','调试移出；复位使用原始变换')+'</div><p>父节点 TONGUE_TWO_SEWN_PATTERNS_V5_2，含前片、后片、厚度/孔壁、两个孔圈和白色锁边。独立 GLB 与全鞋中的鞋舌使用相同几何。当前为静态试件，没有把显示/隐藏当成展开动画。</p>'+table([['检查项','结果'],['壳体三角面',geo['triangles']],['连通布料壳体 / 穿孔',str(geo['connectedComponents'])+' / '+str(geo['holeCount'])],['边界边 / 非流形边 / 零面积面','0 / 0 / 0'],['共用缝边顶点',geo['sewnSharedVertices']],['厚度','约 0.0048 模型单位；未换算为毫米']])) )
svg=f'<svg viewBox="0 0 1500 1100" xmlns="http://www.w3.org/2000/svg"><image href="{dataimg("V52-flat-front-panel-on-shoe.png")}" width="1500" height="1100"/><rect x="430" y="320" width="190" height="655" rx="35" fill="none" stroke="#ffb96c" stroke-width="9"/><rect x="815" y="320" width="180" height="650" rx="35" fill="none" stroke="#ffb96c" stroke-width="9"/></svg>'
pages.append(page('04 / 未完成区域与验收缺口','<div class="annotated">'+svg+'</div><p class="notice">橙框：原鞋眼与鞋带融合区域。当前只保护可识别的金属表面及其邻域，不能据此保证全部鞋眼拓扑完全无损，也不能保证所有融合鞋带残根已删除。这一项仍未达到用户要求。</p><p>厚度检查：从 1600 个面心向布料内部发射射线，1599 条命中，2 条短于 0.001 模型单位，其中 1 条碰到侧壁，1 条回到前片表面。位置与面号记录在 validation.json，应检查隐藏扇形翼部折入和局部偏移壳体；闭合网格不等于无自交。</p><p>最低成本的后续修复：在保留鞋眼孔位、数量和侧面印花的前提下，人工确认每个孔座的保留边界，对眼片条带与鞋带融合处局部重拓扑，再与新鞋舌做间隙检查。不能继续仅凭颜色阈值删除，否则可能误伤孔座与缝线。未授权重设计鞋带或其他部位。</p>'))
pages.append(page('05 / UV、数据保护与调试验证', '<div class="uv">'+image('mesh-uv-layout.png','规则化三角网格及两个孔的边界；平纹布 UV 以原布料片重复铺设。')+'</div>'+table([['验证项','结果'],['保留的原模型位置 / 法线 / UV','原始属性流逐项一致'],['保留的原三角面','索引与顺序逐项一致'],['原始贴图 / 材质','18 张贴图字节一致；原 10 个材质一致'],['10 个独立翻筒鞋眼','原节点、网格与位置一致'],['原模型局部删除','鞋带/开口面 '+str(scope['deletedKnownLaceCorridorFaces'])+'；旧鞋舌面 '+str(scope['replacedOldTongueFaces'])],['注意','约 5.24 万个删除面被旧空间候选分区归到鞋身；均在开口交界，不能宣称整鞋几何与 V4 完全一致'],['新增 UV','所有使用面 UV 有限，零面积 UV 面为 0；可见鞋舌改用独立 UV，并非原 UV 原样保留'],['调试操作','显示/隐藏、高亮、前后片开关、单独查看、移出复位'],['回放复位','20 次绝对位置移出/复位，数值误差 0'],['浏览器验证','Chromium / WebGL / 平板触摸视口；未进行实机 iPad Safari 性能认证']])+'<p>完整 GLB：'+str(v['bytes'])+' 字节。SHA-256：</p><code>'+v['sha256']+'</code><p>V4 SHA-256：</p><code>'+scope['sourceV4SHA256']+'</code>'))
css='''@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:11px/1.55 "Noto Sans CJK SC",sans-serif;color:#16324b;background:white;margin:0}.page{break-after:page;min-height:265mm;padding:0 1mm}.page:last-child{break-after:auto}h1{font-size:21px;margin:0 0 12px;border-bottom:2px solid #32637d;padding:0 0 8px}.kicker{color:#647d91;font-size:11px}.notice{background:#fff0df;border-left:4px solid #c47927;padding:9px 12px}figure{margin:8px 0}img{display:block;width:100%;object-fit:contain}figcaption{color:#657a8c;font-size:9px;margin:4px 0}.wide img{max-height:105mm}.pattern img{max-height:192mm}.tall img{max-height:210mm}.grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 12px}.grid img{height:61mm}.annotated svg{display:block;width:100%;height:155mm}.uv img{max-height:110mm}table{border-collapse:collapse;width:100%;font-size:10px;margin-top:8px}td{border-bottom:1px solid #d3dfe7;padding:5px 7px;vertical-align:top}tr:first-child{background:#e8eff3;font-weight:bold}td:first-child{width:31%}code{display:block;overflow-wrap:anywhere;font-size:9px;background:#eff3f6;padding:6px}p{margin:8px 0}'''
(R/'report.html').write_text('<!doctype html><meta charset="utf-8"><title>SOULGRAIN V5.2 结构试件报告</title><style>'+css+'</style>'+''.join(pages))
md='''# SOULGRAIN V5.2 两片鞋舌结构试件

2026-11-10。**试件，不是最终验收版本。**

用户确认：图二扇形端朝鞋头，图二窄端缝接图三上边。两片沿长度方向连接，后片向前翻折；不是把两张纸样当作外布和里布。

## 已输出

- `output/SOULGRAIN-V5.2-no-laces-two-panel-tongue.glb`：独立全鞋测试资产。
- `output/SOULGRAIN-V5.2-tongue-only.glb`：相同鞋舌独立提取，适合快速检查。
- `SOULGRAIN-V5.2-structure-report.pdf`、`report.html`：6 页报告，含同机位 V4 对比、完整覆盖面、独立部件和未完成区域。
- `images/`：无修图的实际 Blender 渲染；`compare-*.jpg` 只并排排版。
- `viewer/index.html`：独立调试页，可选择 GLB、高亮、显示隐藏、前后片开关、移出/原位复装。
- `reports/validation.json`：几何、UV、原始数据保护和未解决问题的机器检查结果。

## 未通过的验收项

1. 原始 AI 网格中，鞋带与鞋眼座融合。横跨开口的已识别鞋带已实际删除，但孔座残缺与融合残根仍需人工确认和局部重拓扑。不能把这版称为鞋带全部无损清除完成。
2. 纸样由透视照片描出比例，缝份、实际尺寸与落位尚未得到工厂尺度标定。
3. 两处隐藏扇形翼部的厚度射线异常需要复核；闭合不是无自交证明。
4. 尚未制作生产骨架、展开/翻折动画、碰撞修正或布料烘焙。

## 数据边界

从 V4 重新生成。没有采用被否决的 V5.1 新鞋舌几何。保留面的顶点、法线、UV 和面索引一致；原 18 张图片字节一致，原 10 个材质一致，10 个独立翻筒鞋眼节点/网格一致。开口交界有局部删除，不能声称整鞋几何完全不变。新鞋舌独立 UV 复用原布料片，不声称可见鞋舌的旧 UV 原样保留。

没有覆盖 V4、正式网站、动画或原始纹理；下载文件仅放独立制品目录/下载分支。

## 调试

通过本地 HTTP 服务打开 `viewer/index.html`，或在支持本地 HTML/WebGL 的浏览器打开后选择随附 GLB。网页查看器也可导入两个 GLB。全鞋约 83 MB，独立鞋舌约 1 MB。平板界面、触摸旋转和 20 次复位经 Chromium 检查；不代表实机 iPad Safari 性能结论。

## 复现与后续

`scripts/remove_laces.py` 保存原面删除与孔座保护掩码；`patterns.py` 是用户确认方向的纸样；`build_panels.py` 构建连续布壳；`export_v52.py` 从 V4 追加新部件；`validate.py` 比较保留数据。脚本引用原工作区审计/依赖路径，随包不含重复的原始 GLB，复现时需提供相同路径或重定向。

下一步应人工确认每个原生鞋眼座的保留边界，再局部修复眼片条带与融合部位，不继续靠颜色阈值扩大删除范围。之后再校准实物尺寸、隐藏翼部间隙和最终外观。
'''
(R/'README.md').write_text(md)
print('Report HTML and Markdown generated')
