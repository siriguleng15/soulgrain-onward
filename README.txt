Soulgrain Onward V5.1 — 鞋舌结构重建测试版

先看 SOULGRAIN-V5.1-structure-report.pdf（含同机位 V4/V5.1 对比）。
快速看结构：images/acceptance-six-views.jpg。

output/SOULGRAIN-V5.1-tongue-structure-test.glb = 完整鞋子测试资产，约 92 MB。
output/SOULGRAIN-V5.1-tongue-only.glb = 相同鞋舌单独提取，约 5.4 MB，便于先下载检查。
两个 GLB 均内嵌所需图片。

viewer/index.html = 独立调试工具，JS 已内嵌，无 CDN。
功能：鞋舌高亮、显隐、仅鞋舌、鞋带遮挡分组显隐、移出/复位、正/背/侧/全鞋视角。
可在支持本地 HTML 脚本的浏览器打开后选择 GLB。
若浏览器限制本地 HTML，请从本目录运行本地服务，例如：
  python -m http.server 8893 --bind 127.0.0.1
然后访问 http://127.0.0.1:8893/viewer/index.html 。
这是本地调试方式，不是已经部署的公开网站。iPad Safari 实机性能尚未测试。

新鞋舌有正面、背面、厚度围边、连续带下主体和根部锚点，保留原有两孔。
根缝位置和背面布料为待确认项目；未制作展开动画或生产级绑定。
新拓扑鞋舌使用原 V4 材质采样的独立 UV；其他受保护部位保持原坐标、法线、UV、纹理。
原有 18 张图片和 10 个材质定义保留；源 V4 没有覆盖。
鞋带仅作可见性分组，不是制造级物理拆解，可能包含融合遮挡面。
V4 其他未确认白面未被猜测为鞋舌后全部删除，详见报告限制。

reports/validation.json = 几何、UV、改动范围、原始图片等验证。
reports/viewer-validation.json = 交互与 20 次原位复装结果。
data/tongue-rebuilt.npz = 新结构、区域、折线、根锚点和源面对应数据。
scripts/ = 本轮实现和检查脚本；保留本次工作区路径，需要原 V4 及原审计数据才能重新运行。

没有修改原始 A/B、V4、网站、相机、动画；没有提交、推送、合并、部署。
