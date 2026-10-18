# SoulGrain ONWARD — 蒙古扣几何研究页

本目录是独立二维研究，不改变官网、V7 设计工作台、鞋模、材质或动画。仅依据用户本轮提供的两张截图制作；鞋型由第一张手绘人工逐段描摹。C、D 为待确认候选，未定稿。

[四方案总览](exports/overview.png) · [结构图](exports/structure-analysis.png) · [C 设计故事](exports/story-C.png) · [D 设计故事](exports/story-D.png) · [完整文件包](SoulGrain-ONWARD-clasp-study.zip)

## 打开页面

`index.html` 是完整的单文件页面，内嵌脚本、样式、两张原图及结构图，无 CDN、字体或运行时依赖。下载该文件即可保留全部功能。推荐通过任意静态 HTTP 服务打开；iPad Safari 推荐使用 HTTP/HTTPS 地址，系统“文件”的 HTML 快速预览可能不运行脚本。

在本目录运行：

```sh
python3 -m http.server 4180 --bind 0.0.0.0
```

电脑打开 `http://localhost:4180/`。iPad 与电脑处于同一局域网时，打开 `http://电脑的局域网IP:4180/`。若从仓库根目录启动服务，则路径为 `/research/clasp-layout/index.html`。云环境的 localhost 不是 iPad 地址，需要环境自身提供的端口预览地址或单独静态托管。

GitHub 文件页和 raw HTML 是代码查看／下载地址，不是已经部署的交互网页。本轮未更改部署配置、没有发布到正式网站。

## 页面功能

- A 黄金分割、B 螺线映射、C 结构延伸、D 自由几何四套起始布局。
- 切换数学辅助线、蒙古扣、关键点、原图并排对照及手绘叠加。
- 拖动两枚扣件，或分别输入中点 x/y、旋转角、锚点距离、宽度、圆头半径；支持 R 弦吸附、方向键微调、撤销和恢复。
- 显示两端坐标、间距、比例、当前约束偏差、鞋眼／缝线／区域边界和扣件之间的二维净空。
- 导出当前 SVG、3840 px 宽 PNG、坐标与公式 JSON、当前方案故事 SVG，以及结构图 SVG。导出的设计图保持矢量，PNG 按需栅格化；原图叠加仅作观察，不混入设计 SVG。
- Safari 下载未自动开始时，导出状态区提供生成文件的查看／保存链接。

切换方案会恢复该方案的起始参数。离开或刷新页面前请导出 JSON／SVG；当前编辑不自动保存，也没有 JSON 导入界面。

## 文件索引

| 文件 | 用途 |
| --- | --- |
| `index.html` | 可独立运行的完整交互页 |
| `index.template.html`、`style.css`、`app.js` | 页面源文件 |
| `shoe-trace.js` | 鞋型矢量轮廓、结构路径、关键点与鞋眼 |
| `geometry-data.js` | 坐标、公式、四套预设、净空筛查 |
| `structure-analysis.svg` | 鞋面结构分析矢量图 |
| `exports/overview.svg` / `.png` | 四方案总览；PNG 宽 3840 px |
| `exports/scheme-A.svg` 至 `scheme-D.svg` / `.png` | 含推导辅助线的四套布局 |
| `exports/scheme-*-clean.svg` | 隐藏数学辅助线的四套布局 |
| `exports/story-C.svg` / `.png`、`story-D.svg` / `.png` | 两候选的四步设计故事板 |
| `exports/structure-analysis.png` | 高清结构图 |
| `exports/presets.json` | 四套初始坐标、锚点、公式与筛查结果 |
| `DESIGN.zh-CN.md` | 结构、公式、方案评价、文化叙事和工厂打样问题清单 |
| `references/` | 两张原始截图的逐字节副本 |

SVG 可在浏览器、Illustrator、Inkscape 等工具继续编辑；不是不可编辑的单张图片。

## 重建与检查

无需 npm 安装。修改源文件后重新生成单文件页面：

```sh
python3 build_study.py
node verify_geometry.mjs
```

已提交的 SVG 可选用 Inkscape 重新生成高清 PNG：

```sh
python3 render_exports.py
```

`verify_geometry.mjs` 验证黄金站位、螺线半径增长和法线、C/D 方向、两端分区、鞋眼净空、扣件互撞、反向及越界负例，并核对描图与计算的鞋眼坐标。它不能评价审美或证明工艺可行。

本轮实测：Chromium 中四方案、显示开关、输入参数、撤销恢复、真实触控事件拖动、3840×2041 PNG 导出；1024×1366 / 1366×1024 平板及 390×844 手机视口。没有 iPad Safari 真机测试条件，不将触屏模拟等同真机验证。`file://` 在当前受管理 Chromium 中被环境策略拦截；实际页面通过静态 HTTP 服务验证，无外部请求依赖。

## 如何理解结果

原图左上为 `(0,0)`，x 向右、y 向下；单位 **u 是图像坐标，不是毫米**。角度以 +x 轴顺时针计。`L` 是两端定位中心的距离，不是符号总长；`M` 是两定位中心中点，不是视觉或质量重心。

R 是参考弦，局部可偏离原弯曲布边约 10–15u，人工读点误差约 ±4u 或更多；4u 是绘图筛查裕度。A 上扣完整圆头到关键缝线仅约 0.763u，D 上扣约 2.439u，页面与图稿均保留警告。不能将这些坐标直接用于生产定位。

A 只采用黄金站位；B 明确区分精确黄金对数螺线与斐波那契四分之一圆弧；C 使用现有分割缝方向；D 不主张黄金比例。数学方法是本轮设计选择，不冒称传统蒙古服饰具有这些公式。五维比较使用解释性判断，不提供虚构的客观美学评分。
