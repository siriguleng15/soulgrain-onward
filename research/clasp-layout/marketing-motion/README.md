# 让连接，自成风格。

这是一段 **24秒、1080p、30fps 的宣传动效样稿**，用现有手绘矢量鞋型和 C 方案示范新的表达方向：从轮廓、孔间节奏与缝线方向，逐步揭示双扣。没有新增几何方案，没有改变任何原研究参数或3D鞋型。当前为无配乐样稿。

**直接查看：[MP4](onward-connection-study.mp4)** · [带播放与分段跳转的页面](../connection-preview.html) · [封面](poster.jpg)

视频可直接下载到 iPad 后播放、暂停和拖动进度，无需开发环境。HTML 播放页需要普通静态 HTTP/HTTPS 服务；GitHub 源码页不是已部署网页。

## 叙事

| 时间 | 画面 |
| --- | --- |
| 0–4秒 | 原鞋轮廓和缝线逐步显影 |
| 4–8秒 | 推近鞋眼，点亮三颗孔缘，寻找孔间点 |
| 8–12秒 | 沿分割缝方向延伸，到达交界弦上的扣位 |
| 12–18秒 | 两条轴线生长为扣身与圆头，呈现可调尺度 |
| 18–24秒 | 收去辅助线，拉回完整鞋型，出现品牌收束 |

位置来自既有 C 方案选择的构图规则。长度160u、宽18u、圆头半径12u为设计选择；L指两端定位点中心距，不是整个扣件总长。u为手绘描图单位，不是毫米。原图无法给出真实鞋眼内外径，本片没有虚构测量。这里演示设计如何被看见，没有声称数学定律、历史来源或唯一美学答案。

## 可编辑源文件

- `build.mjs`：读取 `../shoe-trace.js` 与 `../geometry-data.js`，生成完整视频构图及 GSAP 时间线；可调整镜头、节奏、文字。
- `index.html`：HyperFrames 视频构图，时间线同步注册到 `window.__timelines['onward-connection']`。`?static` 为最终静态画面检查模式。
- `assets/gsap.min.js`：仓库当前依赖的 GSAP 3.15.0，保留原版权声明；[GSAP 标准许可](https://gsap.com/standard-license/)。无运行时 CDN 请求。
- `DESIGN.md`：视觉依据及可声称的边界。

从完整仓库生成源码，需要主项目依赖中已有的 GSAP；播放成片不需要依赖。影片采用官网已有的深蓝黑、银白、淡紫色系；字体使用本地字体回退，跨设备编辑预览的字形可能略有差异，MP4字形已固定。

## 重建与验证

在本目录执行：

```sh
npm run build:source
npm run check
npm run render
```

固定渲染器为 `hyperframes@0.8.174`，需要 Node、Chromium 与 FFmpeg。当前云环境需指定可写缓存：

```sh
export npm_config_cache=/tmp/onward-hf-npm
export XDG_STATE_HOME=/tmp/onward-hf-state
export XDG_CACHE_HOME=/tmp/onward-hf-cache
export HYPERFRAMES_BROWSER_PATH=/usr/bin/chromium
npm run check
npm run render -- --no-browser-gpu
```

本轮实际执行了静态检查、浏览器运行/布局/文字对比度检查、720帧渲染、H.264成片解码及浏览器播放/定位检查。没有真实 iPad 设备测试。检查只针对新增动效，不以官网构建代替视觉检查。

官网、设计工作台、V7鞋模、A–I方案、原SVG/PNG导出及研究ZIP保持原样。本样稿单独保存在研究分支，未部署到正式网站。
