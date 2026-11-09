from pathlib import Path
import json,hashlib,base64,io,html,re
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1];V=json.loads((R/'reports/validation.json').read_text());C=json.loads((R/'reports/construction.json').read_text());Q=json.loads((R/'reports/viewer-validation.json').read_text());E=json.loads((R/'reports/export.json').read_text());fontfile='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(n):return ImageFont.truetype(fontfile,n)
comparisons=[('assembled','全鞋：外露鞋舌与 V4 同机位对照'),('tongue-front-in-shoe','鞋舌正面：保持两孔与既有包边排版'),('laces-hidden','鞋带遮挡分组隐藏：检查下部主体'),('isolated-front','独立正面：V4 为检查提取，并非原有独立部件'),('isolated-back','独立背面：V5.1 新建连续布面'),('isolated-side-thickness','侧面与厚度：根部 → 带下段 → 折回 → 外露段')]
for label,title in comparisons:
 out=Image.new('RGB',(2000,860),'#111b29');d=ImageDraw.Draw(out);d.text((25,14),title,font=font(27),fill='white')
 for col,(kind,caption) in enumerate([('V4','V4 原始外观 / 检查提取'),('V51','V5.1 连续鞋舌测试')]):
  im=Image.open(R/'images'/f'{kind}-{label}.png').convert('RGB');im=im.resize((1000,733));out.paste(im,(col*1000,62));d.text((col*1000+22,808),caption,font=font(26),fill='#d4e2ee')
 out.save(R/'images'/f'compare-{label}.jpg',quality=91)
# A compact six-view acceptance sheet (actual final V5.1 only).
items=[('V51-isolated-front.png','1 完整鞋舌正面'),('V51-laces-hidden.png','2 隐藏鞋带遮挡分组'),('V51-isolated-back.png','3 鞋舌背面'),('V51-isolated-side-thickness.png','4 侧面及厚度'),('V51-exploded.png','5 移出后的连续结构'),('V51-restored.png','6 复位后的完整鞋子')]
sheet=Image.new('RGB',(2000,2470),'#111b29');d=ImageDraw.Draw(sheet);d.text((25,12),'V5.1 六项结构验收图｜最终测试 GLB 实际渲染',font=font(30),fill='white')
for i,(name,caption) in enumerate(items):
 im=Image.open(R/'images'/name).convert('RGB').resize((1000,733));x=i%2*1000;y=68+i//2*790;sheet.paste(im,(x,y));d.text((x+20,y+742),caption,font=font(25),fill='#dce8f5')
sheet.save(R/'images/acceptance-six-views.jpg',quality=92)
geo=V['geometry'];scope=V['scope'];sections=[]
def h(t):sections.append(('h',t))
def p(t):sections.append(('p',t))
def table(rows):sections.append(('table',rows))
def img(name,caption):sections.append(('img',(name,caption)))
h('Soulgrain Onward — V5.1 鞋舌结构重建测试报告')
p('日期：2026-11-09（Asia/Shanghai）。本阶段只制作独立测试资产及本地调试工具；没有覆盖 V4，没有修改线上网站、现有动画或原始贴图，没有提交、推送、合并、部署。')
h('1. 本轮交付与状态')
p('已建立一个从喉口连接根部、鞋带下方主体，到上部折回与外露翻折段连续相连的鞋舌实体。正面、背面和厚度围边实际建模，两处 V4 既有孔保留。新鞋舌可作为完整部件高亮、显隐、移出及原位复装。')
p('这是供确认的 V5.1 结构测试版。根缝的最终位置、背面布料规格仍有待确认；当前没有制作鞋舌展开动画或生产级骨骼绑定。现有鞋舌外露面使用重拓扑和原材质采样保留外观，不能描述为与 V4 每个三角面、每个外露 UV 坐标完全相同。')
table([['项目','文件 / 结果'],['完整测试鞋模','output/SOULGRAIN-V5.1-tongue-structure-test.glb'],['轻量单独鞋舌','output/SOULGRAIN-V5.1-tongue-only.glb（约 5.4 MB，同一鞋舌几何）'],['完整资产字节数',str(E['bytes'])],['完整资产 SHA-256',V['sha256']],['只读 V4 SHA-256','64a95f4d579dc5bd221cbb50d06ebf5b89be2f1ec69eb18394ac9175a65f160d'],['调试页','viewer/index.html：JS 已内嵌，无需 CDN；可以选择本地 GLB']])
p('已完整阅读上一轮 18 页审计报告对应 Markdown，提取 PDF 正文作复核，并核对问题坐标、语义候选数据、射线/剖面与相关分析脚本。原始审计区域仅用于定位，未把候选颜色边界直接当成制造裁片切线。输入哈希见 reports/input-manifest.json。')
img('acceptance-six-views.jpg','六项验收图，来自实际最终 V5.1 GLB；鞋舌移出与复位均为同一部件。')
h('2. 鞋类结构与实际建模')
table([['结构区域','本轮实现','确认状态'],['喉口根部','以现有鞋面前部的真实三角面为测试支撑，保存面 ID、重心坐标及连接点；布片根部与源面间距约 0.0003 模型单位','有几何贴合依据；工厂根缝位置待确认'],['鞋带下方主体','新建连续布面，向鞋口延伸；不使用一块独立三角板代替整条鞋舌','已建立'],['上部折回','在原外露段上边缘背后形成连续折回；折线约束在原轮廓内侧，避免额外抬高轮廓','测试折回，未来展开姿态仍需纠正形态'],['外露段','依据 V4 表面采样重建轮廓与曲面，保留两孔、蓝色及包边纹理分布','近似保留；微观包边形状需按对比图确认'],['正面与背面','同一个闭合壳体的两面，面朝向相反，围边连接','已建立'],['布料厚度','主体名义厚度 0.0055 模型单位；外露边线起伏附近局部较厚','未校准实际尺码，不擅自声称毫米值']])
p('根部是鞋舌与鞋面之间的装配/缝接锚定，不是把整条鞋舌焊成鞋身不可分离的一部分。独立移出属于调试演示；回到装配位后使用同一套连接坐标。未新增外露缝线或重画装饰。')
img('continuous-section.png','中央纵剖：灰色为 V4 参考表面，金色为新连续鞋舌。')
h('3. 几何、法线与 UV 验证')
table([['检查','结果'],['鞋舌顶点 / 三角面',f"{geo['vertices']:,} / {geo['triangles']:,}"],['连通实体',str(geo['components'])],['闭合 / 绕序一致',f"{geo['watertight']} / {geo['windingConsistent']}"],['边界边 / 非流形边 / 零面积面',f"{geo['boundaryEdges']} / {geo['nonmanifoldEdges']} / {geo['zeroAreaTriangles']}"],['保留孔数 / 拓扑属',f"2 / {geo['genus']}（两处既有贯穿孔）"],['有限位置、法线、UV',str(geo['finitePositionsNormalsUV'])],['每个实际导出 Primitive 的零面积 UV',', '.join(f"{x['role']}: {x['zeroAreaUV']}" for x in V['uv'])],['厚度内向射线采样',f"{geo['normalRaySampling']['samples']} 点；小于 0.001 的短命中：{geo['normalRaySampling']['shorterThan0_001']}"],['20 次移出 / 复位误差',str(Q['restorationError'])]])
p('上述拓扑检测与射线采样是实际测试数据，但不是穷举所有三角面对的自相交证书。正背面、侧面和剖面均有截图；结构合格不能只靠“闭合网格”一项判断。源鞋身在鞋舌之外的旧退化面、内衬融合等问题保留，不在本轮顺带修复。')
img('uv-inspection.png','实际导出的外露面、带下布面和厚度围边 UV。围边另建带留白的 UV 岛。')
h('4. 原外观、图集和其他部件保护')
table([['保护项','实测'],['保留 V4 三角面、坐标、法线、原 UV',str(scope['retainedV4SpatialTrianglesNormalsUVExact'])],['鞋身两侧、翻筒、底部等保护区删除面数',str(scope['protectedSemanticRegionsTrianglesRemoved'])],['原始 18 张图片字节完全一致',str(scope['original18ImagesByteIdentical'])],['原始 10 个材质定义一致',str(scope['original10MaterialsIdentical'])],['10 个独立翻筒鞋眼未动',str(scope['tenIndependentEyeletsUntouched'])],['鞋带造型改动',str(scope['laceShapeChanged'])],['旧鞋舌及必要局部移除面数',str(scope['removedOldTongueFaces'])]])
p('外露鞋舌采用了新拓扑，因此建立独立 UV 图，并从 V4 颜色和金属度/粗糙度贴图逐点采样到鞋舌专用图集；不是对渲染画面拍照，也没有把光照烘进颜色，更没有复制鞋身或翻筒的纹样。原图集文件及 GLB 内原始图片全部保留。未改部位继续使用原始 UV；本报告不声称重建外露鞋舌仍逐顶点使用旧 UV。')
p('新增隐藏主体与背面使用与 V4 蓝布相匹配的基础布材质及独立 UV，未杜撰新纹样。背面用料最终规格另列为待确认。原有包边的极细几何与采样后的表面可能有细微差异，应以同机位对比图检查。')
for label,title in comparisons:img(f'compare-{label}.jpg',title+'；左 V4，右 V5.1。')
h('5. 独立层级与调试操作')
p('完整资产节点：Shoe_TEST_V3 / TONGUE_ASSEMBLY_V5_1 / GEO_TONGUE_CONTINUOUS_FRONT_BACK。鞋舌实体使用多个材质 Primitive 表达正面、隐藏主体、背面及围边，空间位置焊接分析仍为一个连续实体。ROOT 锚点：ANCHOR_TONGUE_ROOT_PROVISIONAL。')
p('viewer/index.html 可进行鞋舌高亮、显示/隐藏、仅显示鞋舌、鞋带遮挡分组显隐、移出滑块和复位，以及正面、背面、侧面和全鞋视角。整页 JS 已内嵌，可使用本地文件选择器，不上传模型。若浏览器限制本地 HTML，使用本地 HTTP 服务打开本目录。该工具未接入正式网站，也没有公开部署。')
p('鞋带开关是可见性调试分组，不是对原鞋带制造结构的完整拆解；与鞋带融合的局部遮挡面可能同时隐藏。分组只重排原三角面的显示归属，正常装配视图下形状、坐标、UV 不变。V4 下方仍存在未确认归属的旧融合白面，本轮没有把这些面全部猜作鞋舌并删除；独立鞋舌视图用于清楚验证新实体。')
p('Chromium WebGL 软件渲染环境中，触摸/平板尺寸布局、显隐、高亮和 20 次移出复位测试已通过，无页面脚本错误。此结果不是实体 iPad Safari GPU 性能测试，不能据此承诺真实设备帧率。')
img('viewer-ipad-portrait.png','独立调试页的平板纵向布局检查。')
h('6. 后续绑定准备与待确认项')
p('新建带下布面使用有序纵横采样，根部和折线环、延伸参数及对应顶点保存在 data/tongue-rebuilt.npz；可据此制作骨骼权重和形态纠正。当前仅实现整体部件调试变换，没有声称已经完成展开/翻折动画。原孔位和包边附近仍需在后续绑定中做局部刚度及碰撞纠正。')
table([['待确认事项','当前处理'],['最终根缝位置','当前连接点贴合真实鞋面，但根线按现有喉口推定；保留 PROVISIONAL 标记'],['背面布料颜色、层数','暂用匹配 V4 的基础蓝布，无新装饰；不是工厂确认稿'],['包边细节','保留 V4 排版及原材质采样；重拓扑的微形状差异以对比图确认'],['旧鞋带/鞋口融合白面','保留未可靠归类部分；未把本轮扩大成内衬/鞋带重建'],['动态展开净空','本轮未实现展开动画；不能以当前终态代替所有中间姿态验证']])
h('7. 文件与复核')
p('output/ 为独立测试 GLB；images/ 为同灯光实际渲染与 UV/剖面图；reports/validation.json 包含几何、UV、保护范围与源哈希验证；reports/viewer-validation.json 包含交互状态和 20 次复位结果；data/tongue-rebuilt.npz 保存规则主体、折线、根部锚点及源面对应；scripts/ 为本轮实现与检查脚本。')
p('完整测试文件和单独鞋舌文件都内嵌所需贴图。原始 V4 与 A/B 不作为输出覆盖。本轮没有提交、推送、合并、部署；线上模型、相机、动画没有修改。')
def datauri(name):
 im=Image.open(R/'images'/name).convert('RGB');im.thumbnail((1900,2700));b=io.BytesIO();im.save(b,'JPEG',quality=86);return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
out=[];md=[]
for kind,item in sections:
 if kind=='h':out.append('<h1>'+html.escape(item)+'</h1>' if not md else '<h2>'+html.escape(item)+'</h2>');md.extend([('# ' if not md else '## ')+item,''])
 elif kind=='p':out.append('<p>'+html.escape(item)+'</p>');md.extend([item,''])
 elif kind=='img':name,caption=item;out.append('<figure><img src="'+datauri(name)+'"><figcaption>'+html.escape(caption)+'</figcaption></figure>');md.extend([f'![{caption}](images/{name})',''])
 elif kind=='table':
  out.append('<div class="table"><table>'+''.join('<tr>'+''.join(('<th>' if i==0 else '<td>')+html.escape(c)+('</th>' if i==0 else '</td>') for c in row)+'</tr>' for i,row in enumerate(item))+'</table></div>');md.append('| '+' | '.join(item[0])+' |');md.append('| '+' | '.join(['---']*len(item[0]))+' |');md.extend('| '+' | '.join(row)+' |' for row in item[1:]);md.append('')
css='body{margin:0;background:#101925;color:#edf3fa;font:16px/1.8 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{max-width:1150px;margin:auto;padding:30px 24px}h1{font-size:28px}h2{font-size:22px;border-top:1px solid #40546b;padding-top:24px;margin-top:38px}p,td{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #53667a;padding:10px;text-align:left;vertical-align:top}th{background:#22364d}.table{overflow:auto}figure{margin:24px 0;break-inside:avoid}img{width:100%;height:auto}figcaption{font-size:13px;color:#b8cde0}a{color:#95cced}@media print{body{background:white;color:#14283a;font-size:10pt}main{padding:0}table{font-size:8pt}td,th{padding:6px}th{background:#edf2f6}figcaption{color:#425c72}figure img{max-height:235mm;object-fit:contain}}'
page='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SOULGRAIN V5.1 鞋舌结构测试报告</title><style>'+css+'</style><main>'+''.join(out)+'</main></html>'
(R/'report.html').write_text(page);(R/'structure-report.zh-CN.md').write_text('\n'.join(md));print('Report and comparison images generated',len(page.encode()))
