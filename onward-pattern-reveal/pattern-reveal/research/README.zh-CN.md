# ONWARD / NIGHTFALL · Cursor-following Mask Reveal V1

独立分支 `feat/onward-pattern-reveal-v1`，基于 `feat/onward-immersive-showcase-v1` 的 `fea6c0e753ca0b4ba6b2e32b52ae57ff57a3b1e6`。新入口 `pattern-reveal.html`，预览路径 `onward-pattern-reveal/`。原 Nightfall 在线页面、官网、工作台、模型、UV 与纹理文件不覆盖，不合并 main。

## 操作与视觉

桌面默认仅隐藏已审计鞋身图元的印花，显示 sRGB `#0D2740` 的帆布底色。鼠标接触允许的可见鞋面后，屏幕空间软圆窗恢复原始 JPEG 图稿；移动带约 38ms 时间常数的轻微惯性，显示中心与鼠标间距限制在 14 CSS px 内。离开后约按 95ms 时间常数缩小、淡出。上述是动画参数，不是设备输入延迟或实时帧率保证。

`UNVEIL ALL` 显示完整原始印花，再次点击回到探索。iPad、手机及无精细悬停设备默认完整印花，保留原触控；iPadOS 的桌面 UA／外接指针也保持完整展示。移动设备不构建揭示专用空间索引，也不逐帧执行揭示射线。

原粒子开场、七个真实部位、自由观察、滚动运镜、翻筒展开及恢复继续可用；未新增粒子、发光圈、透明鞋壳或屏幕图片覆盖。鼠标拖动、镜头转场、开场及翻筒展开期间暂停局部窗口，避免与操作和 GPU 形变遮挡冲突；全部显露模式仍保持完整印花。

默认隐藏范围是下表三个图元，其他部位（包括固定鞋筒和鞋舌上原有的同款印花）保持原样。

| 节点 | 材质 | 原三角形数 |
|---|---|---:|
| Shoe_Body primitive 0 | Body_Canvas | 2209 |
| Shoe_Body primitive 1 | Body_Inner_Canvas | 2036 |
| Original_Vamp primitive 0 | Body_Canvas | 262 |

## 非破坏性材质

原 `onward-ad-v1.glb` SHA-256：`1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4`。

原 `02-body-print.jpg` SHA-256：`8d4e2348bc93c09a2fa16b1178fff32f7e4dbba490073d5c7e8e439104952d90`；它与 GLB 的嵌入 JPEG 逐字节相同。本轮不重绘、不去色、不反推 alpha，不生成替代图稿，也不改动材质原 UV。

无印花层使用线性空间的底色参数，织物起伏继续由原有 `StudioMaterials` 法线修复与原 roughness 0.7、metalness 0、灯光和几何提供。屏幕颜色仍经过 PBR、曝光和 ACES，不会恒等于未受光照的十六进制色值。实际干净鞋面近景与原印花近景用于检查布面质感，不能将其称为材料扫描。

新 Shader 只替换原 PBR `map_fragment` 中的颜色混合，接续既有 `sgArrival`、`sgFocus` 链；不改 opacity、depthWrite、阴影、法线或顶点。线性采样后混合，保留原图抗锯齿和 JPEG 边缘；移动只更新 uniform，稳定缓存键避免反复编译。

## 定位、遮挡与性能

屏幕圆窗按 CSS 像素定义，以实际 drawing buffer 尺寸换算 `gl_FragCoord`，不直接使用设备标称 DPR。射线在当前相机、OrbitControls 与模型矩阵更新后，每个实际显示帧最多求交一次，检测全鞋 42 个 Mesh 的最近交点，包括鞋带、扣件、鞋眼和橡胶。只允许白名单图元激活。

原图稿仍按原 UV 采样。局部窗口另有限定侧面的材质 gate 和命中深度带；共享／重复 UV 不会把蒙版画到另一侧。普通深度测试继续遮挡圆窗内的其他前景物体。GPU 展开的翻筒与 CPU 静止几何不一致，因此局部窗口在展开期间暂停，不伪称已经解决任意形变的 GPU picking。

采用已在项目依赖树中的 `three-mesh-bvh@0.8.3` 并显式声明依赖。只在本页实例上使用 `indirect:true` 的空间索引，不修改全局 Mesh 原型，不重排原索引。浏览器检查将三个目标的 position、UV、index 缓冲哈希与原 GLB 访问器逐一比较。触屏冷启动跳过索引构建。

本效果不增加鞋子副本、额外绘制通道、RenderTarget 或颜色贴图请求。原整鞋仍为 43 次主绘制、463514 个三角形（含地面）。CPU 求交样本和材质编译次数见报告；Linux SwiftShader 的绘制间隔不代表真实 GPU、iPad 温升或 Safari 流畅度。尚未进行 iPad Safari 实机测试。

## 代码位置

- `src/pattern-reveal/CursorReveal.ts`：白名单、材质组合、精确射线、软窗、输入状态与索引生命周期。
- `src/pattern-reveal/RevealControl.ts`／`style.css`：UNVEIL ALL 和触屏提示。
- `src/pattern-reveal/main.ts`：复用原 ShowcaseUI、镜头和交互的独立入口。
- 原 `Scene.ts` 只增加可选生命周期扩展接口；原入口不传扩展，保持原行为。
- 原 `surface.ts`、`CuffMaterial.ts`、CameraDirector、广告 GSAP 叙事、模型与图稿均不改。

## 构建与验证

```bash
npm ci
npx tsc --noEmit
node scripts/build-pattern-reveal.mjs /tmp/onward-reveal-local ./
python3 -m http.server 4740 --bind 127.0.0.1 --directory /tmp/onward-reveal-local
```

浏览器打开 `http://127.0.0.1:4740/pattern-reveal.html`。访问者使用已部署 HTTPS 地址，不需要运行这些命令。

```bash
node scripts/check-pattern-reveal.mjs http://127.0.0.1:4740/pattern-reveal.html
node scripts/record-pattern-reveal.mjs http://127.0.0.1:4740/pattern-reveal.html
```

`check-pattern-reveal-edgecases.mjs` 另接收原 Nightfall 独立构建 URL，验证另一侧、冷启动触控、双指缩放和原入口兼容。测试以真实 CDP 鼠标／触控事件操作，普通相机和翻筒动画等待自然到位；不是用 seek 强制完成。Headless 环境没有实体鼠标，桌面测试通过 Blink 的鼠标能力配置模拟精细悬停；不是 Safari 实机。

操作视频使用同一个生产控制器与 `Scene.loop`，真实输入事件驱动，在可重复的 15fps 时间点逐帧取景，输出 H.264／yuv420p／faststart MP4，方便 Safari 观看；编码帧率不是实时性能。原始测试数据、三态截图、材质近景、触屏视图与视频放在 `public/pattern-reveal/verification/`。

2026-10-30 验证结果：TypeScript 与独立 Vite 构建通过；主体交互 28 项、另一侧／触屏冷启动／原入口兼容 13 项、真实输入视频 4 项通过。主体组记录的本环境射线耗时中位约 0.1ms、P95 约 0.2ms，鼠标移动及按钮切换期间三个目标材质均保持一次编译。实际显示帧率仍需目标设备实测。视频 176 帧、15fps、11.733 秒，包含局部移动、移出淡出、全部显露及返回探索；不把编码速度作为性能测试。

本地检查使用相对路径构建；HTTPS 发布使用独立 Pages base 路径，并另做公网三态操作检查。公网记录随最终预览提供。原 Nightfall 路径不重新部署，Pages 提交仅允许新增 `onward-pattern-reveal/`。

## 参考与来源

实际尝试访问用户指定 `https://260511.com/lithos/`，当前环境代理 CONNECT 返回 403，未取得原站 HTML 或画面。实现依据已确认的交互方案与 Soulgrain 自有资产，没有声称使用或复制 Lithos 的具体源码、视觉资产或技术栈。

当前彩色资产仍为 V8 广告派生的绳状扣袢版本，不冒充后续扁平 PU 工程模型。基础鞋模来源 theunclerulez / Generic “Converse style” Sneakers，CC BY 4.0；原页面的来源署名和品牌原图稿保留。
