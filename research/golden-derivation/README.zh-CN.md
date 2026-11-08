# xiezitu 黄金比例推导 · 独立动画 V1

用户新上传的 `xiezitu.glb` 与 12 张分镜是本章依据。本章不沿用鞋舌／后跟脚本，不替换成彩色成品鞋或 V10 修正版。入口为仓库根的 `golden-derivation.html`。

## 资源身份与隔离

- 分支：`feat/xiezitu-golden-derivation-v1`，独立 worktree `/workspace/xiezitu-golden-derivation-v1`。
- 起点提交：`1fc22816b0fd180a80ddef8a316be4acadaa26fb`，复用已建立的仓库规范与 Three.js 0.180 工具链。本章只新增文件，既有展示页面、动画和资产不改。
- 新附件原始字节备份：`public/golden-derivation/xiezitu.glb`，33,432,084 字节；SHA-256 `b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897`。
- 实际加载原 GLB 的 696,427 顶点、1,393,074 三角形；没有用旧网页 LOD 替换它。原文件本身不含 UV 或纹理。本章仅赋予中性检查材质，原几何和原始文件不变。
- 原鞋体、运行时变换父级与独立三维构图层分开。重复播放从规范时间求值，不对源顶点叠加位移。

## 实现与编辑位置

| 文件 | 内容 |
|---|---|
| `src/golden-derivation/construction.ts` | 黄金矩形、8 段递归四分之一圆弧、反向模板、弧长采样、分镜时间 |
| `src/golden-derivation/DrawPath.ts` | 抗锯齿 Three.js Line2；预分配线段实例，仅修改生长段端点和数量 |
| `src/golden-derivation/CameraDirector.ts` | 分镜运镜、生长端居中、切线保持画面竖直、微距范围与结尾拉回 |
| `src/golden-derivation/Scene.ts` | 原模型校验／加载、三维图层、唯一相机所有者、按需渲染、上下文恢复 |
| `src/golden-derivation/main.ts`、`style.css` | 播放／暂停／重播／倒放／复位、进度、0.25–3×、分镜跳转、图层、触控布局 |
| `scripts/prepare-golden-construction.py` | 只读解析源 GLB，把人工缝线观测转换成原三角形与重心坐标；只写独立定位 JSON |
| `research/golden-derivation/seam-observations.json` | 从原模型实际渲染近景读取的缝线与后跟观测；可校准重算 |
| `public/golden-derivation/construction.json` | 241 个源表面锚点、构图坐标架与来源说明 |
| `research/golden-derivation/STORYBOARD.zh-CN.md` | 12 张分镜的逐项记录 |

当前数学曲线是黄金矩形递归正方形中的四分之一圆弧，具有相邻端点和切线连续性；不是严格的对数螺旋。V1.1 的第二组对同一模板作纵向镜像（x 不变，y → 1−y），从青色短边下端 Q 出发；V1 的 180° 旋转误读已修正。

导演模式采用正交相机，避免鞋面深度与构图平面之间的透视视差，使主线的末端对准后跟顶端。仍是真实三维几何、PBR 光照和可自由旋转的 WebGL 场景。推近／拉远连续改变相机位置及正交取景范围；自由观察支持单指／鼠标旋转、双指／滚轮缩放。

## 运行、构建与验证

```bash
# 复用仓库现有依赖；常规新克隆可先 npm ci
npx vite --config vite.golden-derivation.config.ts --host 0.0.0.0 --port 4561
# http://localhost:4561/golden-derivation.html

npx tsc --project tsconfig.golden-derivation.json
node scripts/check-golden-construction.mjs
node scripts/check-golden-browser.cjs
node scripts/build-golden-derivation.mjs /tmp/xiezitu-golden-v1-build ./
python3 scripts/serve-golden-preview.py --port 4563 --directory /tmp/xiezitu-golden-v1-build
# http://localhost:4563/golden-derivation.html
# 对构建页复查与录屏（串行执行，避免软件 GPU 争用）
GOLDEN_URL=http://127.0.0.1:4563/golden-derivation.html node scripts/check-golden-browser.cjs
GOLDEN_URL=http://127.0.0.1:4563/golden-derivation.html node scripts/record-golden-derivation.cjs
# 如已保存完整 861 帧，可仅重新编码，无须重新渲染：
GOLDEN_ENCODE_ONLY=1 node scripts/record-golden-derivation.cjs
```

定位数据重算需要 Python、NumPy、SciPy：`python3 -B scripts/prepare-golden-construction.py`。它核验同一来源 SHA 后仅读源数据，不保存 GLB 或 Blender。

浏览器检查脚本通过 `PLAYWRIGHT_MODULE`、`CHROMIUM_PATH` 和 `GOLDEN_URL` 覆盖本机工具与预览地址。当前仅针对独立入口运行类型检查；工作区现有精简依赖没有安装正式 React 展示页的全部包，不将这个章节的检查冒称全仓库构建通过。

运行时使用 Web Crypto 校验 33 MB 原文件，须通过 HTTPS 或本机 localhost 打开。局域网的普通 HTTP 地址和直接双击本地 HTML 都不是 iPad 可用的正式预览方式。

本地审核服务器支持视频 HTTP Range 请求。普通 `python -m http.server` 可用于打开 3D 入口，但部分浏览器无法在该服务上拖动视频进度，因此录屏审核请使用上面的 Range 服务器。

`public/golden-derivation/verification/` 保存实际渲染截图、几何检查和浏览器检查；`review.html` 集中显示。录屏使用相同 WebGL 场景按固定进度逐帧录制，方便审核全部运镜；它不作为实时设备帧率证据，交互入口也不播放视频冒充 3D。

## 验证范围与仍需艺术审核的地方

1. **缝线定位是人工解释。** 原 AI 模型没有独立缝线节点；目前用近景手工观测拟合，切点附近有局部 C2 修正以满足构图相切，改的是独立描线，不是鞋体。定位 JSON 记录实际改变量；不称为原网格中的解析缝线或已获用户确认的精确位置。
2. **区分表面与构图平面。** 红色缝线沿原表面三角形锚点；主线、青色短线、翻筒延长线与黄金矩形属于鞋子正面的独立侧向构图平面。它们会随鞋子变换并遵守深度测试，但不伪称为曲面内蕴黄金比例或布料上的测地线。自由观察的大侧角下可以看到该图层与鞋体的距离，这是本版明确的技术选择。
3. **翻筒分区线需结合艺术审核微调。** 它们按分区方向作平行构图与延长，尚不是自动提取的真实针脚中心线。实际针脚起伏、后跟曲率及手画参考存在差异。
4. **细段运镜会旋转较多。** 按用户要求以端点为中心、切线保持竖直，会随内圈转向连续转动画面；需由用户确认内圈节奏与微距程度。未增加眩光、粒子或其他表演效果。
5. **设备性能未获实机认证。** 完整原模约 139 万三角形。本版限制 DPR／像素数、暂停时停止渲染；保留原精度，也意味着较老 iPad 仍需实机评估。Chromium 模拟触控不等于 iPad Safari 测试。

用户于 2026-11-08 批准发布后，独立预览已上线：[打开实时动画](https://siriguleng15.github.io/soulgrain-onward/xiezitu-golden-v1/golden-derivation.html?autoplay=0) · [查看录屏与关键帧](https://siriguleng15.github.io/soulgrain-onward/xiezitu-golden-v1/golden-derivation/review.html)。部署记录见 `public-preview.json`。main 未合并，原页面未覆盖。

## 本版检查结果

- 章节类型检查与独立 Vite 构建通过。
- 在实际构建页面运行桌面浏览器与 iPad／手机模拟检查，通过播放、暂停、进度拖动、倒放、三次重播与复位、终态保持、相机交接、触控旋转／缩放、模型失败重试和 WebGL 上下文恢复。
- 两组螺旋共 42 个采样时刻，生长端距屏幕中心的最大 NDC 误差为 `3.52e-16`；切线水平方向分量比例上限 `5.16e-13`。这是数值检查，不替代运镜的艺术审核。
- 241 个实际源面锚点重构最大误差 `5.55e-17` 模型单位；外框宽高比 `1.618033988749895`。
- 原上传文件、章节副本及历史原件备份的 SHA 一致；其他三个工作区的 HEAD、未提交 diff 与暂存区未变。
- 仍需用户审核切点解释与分区线贴合，并在真实 iPad Safari 上检查性能和手感。

- 完整审核片为 43.067 秒、1280×670、H.264/yuv420p、30 fps 封装（20 fps 原始 WebGL 采样），带 faststart；完成原生 Chromium 播放和 24.5 秒跳转检查。源画布为 1280×669，编码仅补齐一行以满足 4:2:0 格式要求。
- 原始交付包包含独立静态构建与本地 Range 服务器；公网 iPad 预览请使用上面的 HTTPS 链接，localhost 是本机运行方式。

## V1.1 · 按用户原图修正两个定位错误

- V1 切点错误来自按拟合曲线候选交点选择位置，未锁定第四鞋眼。现在用 `user-anchors-v1-1.json` 中从鞋头往鞋口编号的六个穿带鞋眼，强制 P 的 X 与第 4 孔一致，Y 位于其下方的原主轴。局部拟合仅作用于独立红色描线，不移动源模型。
- V1 把第二起点误读为矩形对角顶点。现在 S2=Q=P+H·V，在第一起点斜下方、同一条青色短边上；两组圆弧按 y → 1−y 镜像。没有只把起点标记挪走、保留错误轨迹。
- 原鞋头起点、后跟顶端、主轴、翻筒辅助线方向与间距、43 秒分镜及播放控制保留。P 沿既有主轴移动；跟随镜头按修正后的实际路径重新求值。
- `scripts/check-golden-placement.cjs` 输出两张带编号的实际 WebGL 校准图：`15-fourth-eyelet-contact.png`、`16-same-short-edge-starts.png`。图中编号是审核标注，不会叠加到正常产品界面。
- V1.1 独立构建目录 `/tmp/xiezitu-golden-v1-1-build`，本地入口 `http://localhost:4566/golden-derivation.html`；使用 `serve-golden-preview.py --directory /tmp/xiezitu-golden-v1-1-build --port 4566`。

V1.1 已完成发布：[打开修正后的交互动画](https://siriguleng15.github.io/soulgrain-onward/xiezitu-golden-v1-1/golden-derivation.html?autoplay=0) · [编号校准图与更新录屏](https://siriguleng15.github.io/soulgrain-onward/xiezitu-golden-v1-1/golden-derivation/review.html?release=1.1-final)。网站实际加载、模拟触控及原生视频播放／拖动检查通过；记录见 `public-preview-v1-1.json`。原始 GLB 和 V1 归档均保留。
