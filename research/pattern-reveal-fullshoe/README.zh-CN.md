# ONWARD / UNVEIL — 整鞋纹样揭示 V2

增量分支 `feat/onward-pattern-reveal-fullshoe`，基于已发布的 `feat/onward-pattern-reveal-v1` / `da7888397fcd9f3564a78cefaee7e0d8ef1946e5`。保留之前的鞋身版、原 Nightfall 页面及其在线地址；本版发布到单独的 `onward-pattern-reveal-fullshoe/`。不合并 main。

## 范围与操作

用户已将 V1「仅鞋身」的范围扩大到整鞋。本版覆盖 **全部 16 个带颜色贴图的图元，以及鞋舌立体烫钻图元**，共 17 个；全鞋 42 个 Mesh 都能激活同一个窗口。无图案的鞋带、鞋眼、橡胶、包边和缝线保留本身的结构与颜色，鼠标经过这些部件时窗口继续工作，不再因离开鞋身白名单而中断。

| 部位 | 处理 |
|---|---|
| 鞋身两侧、鞋头布面、固定鞋筒、鞋舌上的帆布 | 藏蓝底色 ↔ 原蒙古印花 |
| 翻筒内外布面、回纹边 | 蓝色织物及三段鼓起结构 ↔ 原织物纹样与边饰 |
| 鞋舌文字 | 原资产中已有的无字紫绒采样 ↔ 原文字图稿 |
| 鞋舌 785 颗烫钻组成的圆形纹样 | 原网格片元覆盖显隐，原紫绒在下方；颜色和阴影同步处理 |
| 扣头 | 素金属底色 ↔ 原扣头纹样，保留原 metalness / roughness |
| 鞋带头 | 保留深蓝、金属色隔带和奶油色分段 ↔ 原纹样 |
| 后跟皮条及旧接缝皮条 | 红色底层 ↔ 原回纹图稿 |
| 后跟 Logo | 奶油色底层 ↔ 原 Soulgrain 标识 |

桌面默认隐藏上述纹样。软圆窗随鼠标移动，保留约 38ms 惯性时间常数、14 CSS px 最大跟随间距及移出后的缩小淡出。`UNVEIL ALL` 显示整鞋完整图稿，再次点击恢复探索。参数不是设备输入延迟或帧率承诺。

iPad / 手机 / 无精细悬停设备保持整鞋完整展示，沿用单指旋转与双指缩放。触屏冷启动不构建揭示专用 BVH、不逐帧执行揭示射线；完整显示时 Shader 跳过局部蒙版及干净布面的计算。没有把尚未实现的触摸揭示伪装成已完成。

## 资产与非破坏性处理

仍使用 `public/assets/onward-ad-v1/onward-ad-v1.glb`，23,873,476 字节，SHA-256：

`1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4`

GLB 的全部 9 张嵌入图像、UV、POSITION、索引、形变属性不变。材质在原有运行时克隆上添加 Shader hook，没有修改纹样图稿。17 个材质保留 `sgArrival`、`sgFocus` 与 CuffMaterial 的既有处理链，保留法线、粗糙度、金属度、深度和灯光。

各材质的干净底层采用自己的颜色，而非把整鞋都涂成藏蓝。帆布基色仍为 sRGB `#0D2740`；翻筒采用蓝色底层，红皮条保留红色。无字紫绒复用已经嵌入 GLB 的 `tongue-velvet-reconstructed`，未添加纹理请求。干净帆布含轻微、随像素足迹抗锯齿的程序化纤维明暗，并继续使用既有修复后的织物法线；它是展示底层，不是实物材料扫描。揭示层始终是原始图稿，完全显示时直接经过原 PBR 颜色采样。

烫钻是实际凸起几何，不能仅用颜色混合隐藏。只对它使用不透明覆盖抖动，在羽化边缘显示部分片元，同时隐藏其阴影片元；顶点和索引不动。阴影 Shader 投影到当前主相机，避免从灯光视角计算一个错误的圆窗。全部显示时恢复完整覆盖。全显切换和窗口靠近烫钻时会刷新既有阴影贴图，其他区域探索不因此额外刷新静态阴影。主绘制没有增加模型副本、透明壳或合成 RenderTarget。

## 定位与动画

仍为「当前 3D 最近命中 + CSS 屏幕软窗 + 原 PBR 内混合」。BVH 使用 `indirect:true`，不重排源索引。每个实际显示帧重验当前相机与模型姿态，普通不透明深度测试处理前景遮挡，命中深度带限制邻近表面。与 V1 不同，不再以 `outer / inner / vamp` 限定其他部件；纹样可在同一个圆窗中跨越鞋身、翻筒、扣件等部件边界，而非各自一套蒙版。

原粒子开场、七个部位、自由观察和翻筒展开不变。局部揭示在开场、相机转场、拖动和翻筒展开期间暂停；`UNVEIL ALL` / 触屏完整纹样仍可在展开状态显示。CPU 射线不追踪 GPU 展开后的翻筒，所以没有声称支持任意变形状态下的精确 hover。

## 构建与审核

```bash
npm ci
npx tsc --noEmit
node scripts/build-pattern-reveal-fullshoe.mjs /tmp/onward-fullshoe-local ./
python3 -m http.server 4742 --bind 127.0.0.1 --directory /tmp/onward-fullshoe-local
node scripts/check-pattern-reveal-fullshoe.mjs http://127.0.0.1:4742/pattern-reveal.html
node scripts/record-pattern-reveal-fullshoe.mjs http://127.0.0.1:4742/pattern-reveal.html
```

访问者直接使用 HTTPS 预览，不需要上述命令。审核入口 `pattern-reveal/review.html` 提供默认、局部、全显、各部位三态对照、触屏截图、MP4 和 JSON 报告。验证会比较实际截图像素，检查每个部位确实发生显隐，以及圆窗外是否出现明显的非局部变化；不仅检查 uniform 数值。全部 42 个网格的 POSITION、UV、索引都与源 GLB 缓冲哈希比较。

视频以真实 CDP 鼠标移动、导航点击和 UNVEIL ALL 点击驱动同一个生产控制器与 Scene.loop，在连续、可重复的动画时间点逐帧记录。H.264 / yuv420p / faststart 供 Safari 查看；编码帧率不等于实时性能。最终结果见 `verification/fullshoe-validation.json` 和 `verification/video-validation.json`，公网另行验证。

测试环境是 Linux Chromium / SwiftShader 与 CDP 触控模拟，**没有进行实体 iPad Safari 测试**，不报告虚构的实机帧率。源模型仍为既有 V8 广告派生的绳扣版本，不冒充后来扁平 PU 工程模型。基础鞋模来源 theunclerulez / Generic “Converse style” Sneakers，CC BY 4.0；保留原有署名。
