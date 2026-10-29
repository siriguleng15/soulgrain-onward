# Soulgrain ONWARD / NIGHTFALL · 沉浸展示 V1

本轮只新增独立展示页面 `immersive-showcase.html` 和 `src/immersive-showcase/`，复用既有彩色 Nightfall 广告资产、翻筒曲率动画及织物法线修复。原网站、工作台、所有已确认模型和裁片研究均保留，不合并 main。

## 画面与交互

视觉主线是夜色、真实鞋体与克制的冷白光。开场从空间星场、原创菱形星座过渡到真实鞋面采样，再显露原有 PBR 模型。粒子不是第三方作品的标志，也不是用图片拼出的鞋轮廓。约 5.2 秒，可跳过；系统减少动态时直接显示产品。

主场景使用同一双真实三维鞋子。滚动驱动连续相机路径，缓慢转动及微小浮动提供停留动态；进入自由模式后，相机由用户接管。点击真实网格或底部导航，可进入翻筒、鞋舌排钻、鞋身印花、双扣、后跟回纹、鞋带头及后跟标识。七个区域均有现有模型中的命名部件，不把未实现的效果显示成可用。

特写通过镜头、摄影棚光照、环境反射与轻度周边压暗呈现原材质。翻筒复用已有的周向曲率释放动画，保留原 UV、横向结构线与包边。没有为材质切换捏造 Daytime，没有为爆炸图任意拆散鞋体，也没有以预渲染视频替代交互。

## 使用的资产与边界

- 彩色资产来自已确认 V8 的广告派生 GLB：`public/assets/onward-ad-v1/onward-ad-v1.glb`。原始字节保持不变。
- 该彩色版本仍包含双绳扣袢，**不是**最近裁片研究中的扁平 PU 皮条。页面目录内明确版本区别，并链接到独立扣件与裁片研究；没有把两套资产悄悄混合。
- 后跟 PU 回纹、原有印花、鞋舌紫色及排钻均复用既有资产。材质细节受原贴图约 1280px 分辨率与已有几何限制，不能称为扫描级微距或实测水晶折射。
- 翻筒展开是既有广告几何动画，不代表已经恢复布料碰撞、缝制或工厂工艺。其他部位本轮采用真实镜头观察，没有虚构部件爆炸动画。
- 代理阻断了八个 Awwwards 地址，未取得原站画面或可核实技术栈。详见两份逐项访问记录；本轮表现方案依据用户给出的参考重点与原创实现，不宣称已经深度观察或复制那些作品。

资产细节与来源哈希见 [ASSET-AUDIT.zh-CN.md](ASSET-AUDIT.zh-CN.md)，参考访问记录见 [1–4](REFERENCES-1-4.zh-CN.md)、[5–8](REFERENCES-5-8.zh-CN.md) 和 [公开演示／开发者资料替代检索](REFERENCE-FALLBACK.zh-CN.md)。替代检索也被代理连接阻断，未取得可作为作品分析依据的页面。

## 工程架构

| 文件 | 责任 |
|---|---|
| `Scene.ts` | GLB 校验／加载、PBR 灯光、真实部件选择、翻筒、输入与性能调度 |
| `CameraDirector.ts` | 从实时相机姿态发起过渡；新指令接管、取消与可追溯时间线 |
| `ParticleArrival.ts` | GPU 星场—星座—鞋面采样过渡与三档数量 |
| `surface.ts` | 原三角形面积加权采样、重心来源记录、实体显现 Shader |
| `ui.ts` / `style.css` | 三章节、部位目录、特写、开场跳过、质量／动态设置及可访问界面 |
| `main.ts` | 连接滚动、统一状态、场景生命周期与调试入口 |

复用既有 `advertising/geometry/CuffCurve.ts`、`CuffMaterial.ts` 和 `scene/StudioMaterials.ts`；没有改动这些源文件。织物原法线图中已验证的全黑图只在本页运行时修复，原 UV、颜色图案与原 GLB 不变。

技术核对使用项目已安装 Three.js 0.180 的实际源码：`OrbitControls.js` 的触控状态与默认 `touchAction=none`；`MeshSurfaceSampler.js` 的面积累计分布；`GLTFLoader.js` 的 GLB 解析与 Safari 图片加载兼容路径。当前页面自行实现带来源记录的采样器和单一镜头控制器。上述核对是可靠库源码依据，不是把某个第三方作品的技术栈当成已验证事实。

## 性能与操作

完整／均衡／轻量三档粒子预算为 9000／2800／1200；开场结束后粒子完全退出绘制。像素比设上限并按像素预算约束，环境反射 256，阴影为 1536／1024／512，轻量档关闭阴影但保留产品、所有部位及操作。页面隐藏时停止动画调度；减少动态关闭缓转与环境变化，缩短镜头转场。

桌面可拖动进入自由观察，滚轮在篇章模式滚动页面、自由模式缩放。触屏篇章模式保留单指竖向滚动；自由观察后单指旋转、双指缩放。两个手指也可直接接管自由模式。返回篇章或整鞋从当前相机位置接续，不突然重置模型。

画质预算和目标调度不是实机帧率承诺。实际记录在验证报告中，Linux Chromium／SwiftShader 触控模拟不是 iPad Safari 实机测试。原始资产约 24MB，首次进入仍需下载；微距贴图精度、真机温升／帧率和更精细材质属于后续打磨。

## 构建与验证

```bash
npx tsc --noEmit
node scripts/build-immersive-showcase.mjs /tmp/onward-immersive-preview ./
python3 -m http.server 4521 --bind 127.0.0.1 --directory /tmp/onward-immersive-preview
```

另一个终端：

```bash
node scripts/check-immersive-showcase.mjs http://127.0.0.1:4521/immersive-showcase.html
```

`--static-only` 验证来源与真实部件；完整测试核对运行时 PBR、实际粒子来源、镜头、原网格、触控、画质、减少动态及错误恢复。过程截图与视频记录真实页面，逐帧采样视频不能充当实时性能证明。证据放在 `public/immersive-showcase/verification/`，最终检查数量以同版本报告为准。

独立预览目录：`onward-immersive/`，入口 `immersive-showcase.html`。正式网站不替换，开发分支单独提交。

## 本轮交付与验证记录

- [实时三维预览](https://siriguleng15.github.io/soulgrain-onward/onward-immersive/immersive-showcase.html)
- [实际截图、过程视频与审核记录](https://siriguleng15.github.io/soulgrain-onward/onward-immersive/immersive-showcase/review.html)
- [可编辑源码与必要资产包](https://siriguleng15.github.io/soulgrain-onward/onward-immersive/ONWARD-immersive-v1-source.zip)
- [独立开发分支](https://github.com/siriguleng15/soulgrain-onward/tree/feat/onward-immersive-showcase-v1)

2026-10-30（Asia/Shanghai）：TypeScript 检查、独立 Vite 构建通过。完整浏览器功能组 34 项通过，覆盖真实表面粒子来源、七个真实部位、镜头中断与接管、原网格连续展开、重播触控复位、实际单指与双指事件、三档画质、减少动态、上下文中断及缺失模型重试。正常操作阶段未记录未捕获异常、Shader 错误或失败资源请求；故意注入的失败单独记录。

基准功能组之后，收紧翻筒聚焦镜头、提高特写文字背景对比度，并将上下布局的断点与镜头统一为宽高比 1.12，修正平板竖屏说明板仍在右侧的问题。录屏还发现初次进入自由模式时，滚动条隐藏引起 ResizeObserver 中断镜头；原先的时间线跳转检查未覆盖此问题。已修复为忽略滚动条带来的小变化、真实布局变化时从当前姿态接续镜头，并增加不调用 seek 的自然完成及中途改变视口回归检查。最终镜头、窄屏和视频以补充报告的 bundle 哈希为准，34 项基准组单独保留。没有把这些检查说成同一次运行。

基准组结束后的跨文件系统旧失败日志归档曾出现 EXDEV，验证 JSON 已在归档前成功写出；归档程序改为复制后删除，不属于产品运行失败。

正常整鞋采样为 43 次绘制、463,514 个渲染三角形（含地面），均衡档开场结束后粒子绘制为零。Linux SwiftShader 逐帧间隔约为秒级，不能代表目标设备的实时性能；没有宣称已经达到桌面或 iPad 的某个帧率。过程视频由真实页面确定性渲染编码，只用于审核构图及连续性。

验证原始数据在在线审核页的 `verification/` 内：`browser-validation.json`（完整功能组）、`detail-review-validation.json`（细节构图及横屏视频）、`final-layout-validation.json`（最终竖屏断点与 bundle 哈希）、`source-validation.json`（原资产哈希）。公网发布后另运行 `scripts/check-immersive-public.mjs`，核对正式预览 URL 的实际响应、GLB 字节、源码包、真实浏览器渲染与翻筒往返。

源码包仅含可编辑展示代码和必要资产，不是双击运行的离线网页，不重复打包所有截图。打包命令为 `node scripts/package-immersive-showcase.mjs /tmp/onward-immersive-preview`；包内提供运行说明、逐文件哈希和来源提交。访客直接使用上方 HTTPS 预览，不需要安装环境。

基础模型继承 theunclerulez 的 Generic “Converse style” Sneakers，CC BY 4.0；Soulgrain 几何、外观、原图稿与新增展示代码的来源在现有资产说明及页面署名中保留。未使用参考网站受保护模型、源码、品牌或图像资产。
