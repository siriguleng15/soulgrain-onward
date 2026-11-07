# 鞋舌 · 马蹄袖动画实验室 V1.1

本轮从动画 V1 提交 `0e6c566a84fd2ec51848679338fb743b7d8fde6e` 建立独立 worktree `/workspace/tongue-motion-refinement-v1-1` 和分支 `feat/tongue-motion-refinement-v1-1`。原 V1 工作区、缓存与预览均保留。根据用户五张粗分镜制作实际可操作的 19 秒 Three.js 动画。分镜中的旧紫色图只参考动作；完成状态使用最新蓝色晶体设计。没有修改原展示网站或后跟动画。用户随后明确要求可在 iPad 操作的链接，本轮仅发布独立 HTTPS 预览，不推送开发源分支，不合并 main。

## 本轮具体改善

- 初态不再从旧窄鞋舌逐渐变宽。初态／终态基面一致，抬平／覆袖基面一致；浏览器验证对实际采样顶点作逐项比较。
- 可见鞋舌与袖面都依据已记录的 `final-tongue-outline.svg` 拟合；原 75 mm 图案及内部排布不变。79 mm 只是保护原图案的区域直径，不是新的烫钻尺寸。
- 袖口在翻转前连续压薄，减少中段的大环形鼓包；滚翻采样由 17 个增加到 25 个，保留同一袖面和同一套银钻。
- 减少过曝与过重的地面影子，让白布和银钻之间更容易辨认；夹取姿态增加轻微食指内收。
- 本地新版使用 4553；旧版 4551 与旧提交保持原样。公开预览只在 gh-pages 新增独立目录，正式入口和后跟实验室保持不变。

轮廓比对图：`public/tongue-motion-lab/verification/tongue-outline-comparison.svg`。几何检查：`geometry-consistency.json`。这些是与近似参考描边的数值比对，不是工厂尺寸认证。

## iPad Safari 公开预览

- [进入真实 3D 交互页面](https://siriguleng15.github.io/soulgrain-onward/tongue-motion-lab-v1-1/?autoplay=0&v=1.1)
- [动作审片与关键帧](https://siriguleng15.github.io/soulgrain-onward/tongue-motion-lab-v1-1/tongue-motion-lab/review.html)

公开 HTTPS 页面已通过模型 SHA 校验、播放／暂停、进度定位、旋转与双指缩放模拟检查，见 `public-preview.json`。测试使用 Chromium 的 iPad 设备模拟，不冒称 Safari 实机验收。

首次打开需要加载模型，等待顶部显示 LIVE 3D 后点击播放。支持单指旋转、双指缩放、时间轴、暂停、重播及独立倒放。公开交互页面的代码版本为 `ce58404`，静态发布提交为 `cd07922`，没有更改正式展示页。

发布使用固定版本地址读取四个二进制资产，运行时仍核对相同 SHA-256。原始资产归档在 `a6e060a`，由标签 `onward-tongue-assets-a6e060a` 保留；仅调整传输位置，模型、UV、纹样和动画数据没有变化。预览页面本身约 13 MB，首次运行仍需加载约 66 MB 的原始模型与形变数据。


## 本地预览

在本 worktree 根目录、已有项目依赖可用时运行：

```bash
node scripts/build-tongue-motion-lab.mjs
node node_modules/vite/bin/vite.js preview --config vite.tongue-motion-lab.config.ts --host 0.0.0.0 --port 4553 --strictPort
```

- 实时交互：`http://localhost:4553/tongue-motion-lab.html`
- 审片、录屏及九张关键画面：`http://localhost:4553/tongue-motion-lab/review.html`
- 禁用自动播放：入口后加 `?autoplay=0`；系统减少动态偏好同样不自动播放。
- 本地构建只写 `/tmp/tongue-motion-lab-v1-1-build`，不运行旧站点的发布脚本。这些地址是本机地址，不能作为外部 iPad 可访问的 HTTPS 发布链接。

## 已实现的动作

| 时间 / 秒 | 实际行为 |
| --- | --- |
| 0–1.8 | 章节专属素帆布鞋、无钻无晶体的空白鞋舌，镜头推进。 |
| 1.8–3.6 | 用户手模及保留的袍袖进入；马蹄袖已佩戴同一套银钻。 |
| 3.6–6 | 拇指与食指夹住鞋舌真实三角形锚点；根部保持连接，鞋舌弯曲抬平，包边、缝线与鞋眼跟随。 |
| 6–7.8 | 手松开并依次舒展五指，沿空间弧线转为掌面贴合；镜头连续转入鞋头朝上的俯视。 |
| 7.8–10.8 | 原马蹄袖网格发生分布式滚翻和展平；没有透明度替换或第二套袖子。 |
| 10.8–13 | 手与剩余袍袖向后跟抽离，袖面按手部释放位置逐段落下；银钻继续绑定同一组三角形。 |
| 13–14 | 白布与银钻留在鞋舌，短暂魔术停顿。 |
| 14–14.5 | 拇指、中指准备及释放响指，带克制的腕部动作。 |
| 14.5–16.8 | 同一布面 PBR 颜色、法线、粗糙度与反射响应沿纵向变化；银钻身份、位置与材质不变。 |
| 16.8–19 | 手退场，袖面贴回安装姿态，相机连续回到原三分之四机位并定格。 |

提供播放、暂停、重播、独立倒放、0–19 秒任意进度、0.25× / 0.5× / 1× / 2× / 3×、分镜跳转、网格检查、自由旋转与缩放、恢复导演镜头。动画不会自行倒放。手进入自由观察时暂停；用户可以再播放并保留当前观察角度。没有加入可选的拖袖手势、点手响指或声音，以完整时间轴为核心。

## 资产身份与非破坏性边界

| 复用源文件 | SHA-256 |
| --- | --- |
| `public/assets/onward-ad-v1/onward-ad-v1.glb` | `1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4` |
| `public/tongue-sleeve-lab/assets/user-hand-parts.glb` | `4322c0c2b1f613ba152ee742f3ca9d69f98c97c6a71cab3eaf4fabebbad53798` |
| `public/tongue-sleeve-lab/assets/user-hand-rig.glb` | `e4cd583aaa210418653954734a9696dd64e2bac8a2830278535fafc1c46f3116` |

以上源均只读复用。原始上传手模、准备阶段 Blender、银钻绑定 JSON、源图与已有页面未变更。新数据位于 `public/tongue-motion-lab/assets/`，加载时验证源与缓存 SHA，构建时也检查。浏览器非安全源无法使用 WebCrypto 时，界面记录构建核验来源，不能冒称完成浏览器散列验证。

鞋子节点 `Convertible_Tongue` 的两个自由面采用运行时派生几何；其连接脚面的第三图元原顶点精确保留。`Garment_Binding_Fixed`、`Garment_Stitching_Fixed` 只选中与鞋舌相关的连接分量跟随，其他顶点不变。旧鞋舌装饰节点仅在本章隐藏。普通帆布使用独立的颜色与细织纹法线，未擦写任何原贴图。

手仍为用户提供的手部、袍袖与拆出的真实马蹄袖，使用准备阶段的 22 骨骼派生手模；没有换成第三方手。袖面拓扑与原来的 61,535 顶点保持一致。785 颗银钻只创建一次，沿同一组持久三角形重心坐标运动。

设计映射沿用约 158 × 103 mm 的平面轮廓与 75 mm 银钻外径，上下分段约位于距顶端 50.5 mm。安装时弯曲贴合，非二维图板；这些是设计目标及模型单位推算，不是工厂实测。最终投影、轮廓与晶体观感仍需用户艺术审核。

## 可编辑源码与重建

| 文件 | 职责 |
| --- | --- |
| `src/tongue-motion-lab/MotionScene.ts` | 绝对时间重建动作、接触锚点、模型隔离、相机所有权与生命周期。 |
| `CameraDirector.ts` | 相机位置、目标、朝上方向及自由观察交接；每帧只有一个系统拥有相机。 |
| `HandPoses.ts` | 绝对骨骼姿态、逐指释放及真实蒙皮指腹定位。 |
| `MorphCache.ts` | 形变数据解码、GPU morph 插值。 |
| `SilverSurfaceBatch.ts` | 无循环临时对象分配的银钻绑定求值；与准备阶段通用 `SurfaceBinding` 独立比对。 |
| `CrystalCloth.ts` | 布面内部 PBR 混合及固定材质程序，时间变化仅更新 uniform。 |
| `PlainCanvas.ts` | 章节专属素帆布与细织纹法线。 |
| `modeling/tongue-motion-lab/design_surface.py` | SVG 参考轮廓、原图案保护区与共用材质坐标。 |
| `modeling/tongue-motion-lab/build_motion.py` | 鞋舌轮廓、真实源 UV 对应、滚翻形变、真实手表面支撑与落布姿态烘焙。 |
| `modeling/tongue-motion-lab/build_crystal.py` | 独立生成 1024² 色彩、切面法线与粗糙度贴图，5,220 个细晶胞。 |
| `scripts/bake-tongue-hand-poses.mjs` | 在实际用户手模上制作抓取与响指姿态，CCD 接触拟合，输出固定骨骼四元数。 |

需要修改动作时，先编辑相应源，再按下列命令重建本章派生文件；这些脚本只写新章节目录，不保存或覆盖原 GLB / Blender。

作者环境为 Python 3.12、NumPy 2.3.5、SciPy 1.17.0、Pillow 12.3.0、Matplotlib 3.10.8，以及仓库既有的 Three.js 0.180.0。Python 作者工具版本列于 `modeling/tongue-motion-lab/requirements.txt`。浏览器验证与录制需要 Playwright、Chromium 和 FFmpeg；重建页面本身不需要 Blender。

```bash
python3 -B modeling/tongue-motion-lab/build_motion.py
python3 -B modeling/tongue-motion-lab/build_crystal.py
node scripts/bake-tongue-hand-poses.mjs
node scripts/build-tongue-motion-lab.mjs
```

分镜语义复用 `src/tongue-sleeve-lab/ChapterContract.ts`，未更改准备阶段契约。袖面共 38 个预制姿态：25 个滚翻、12 个逐段落布、1 个最终安装姿态。38 个位置与法线目标通过 GPU 插值，不在每个动画帧重算六万多个顶点，也不进行实时布料模拟。缓存约 32.9 MB，传输为半浮点混合固定根部 float32，运行时解码 float32；当前仍为完整研究资产，尚未制作轻量 LOD。

## 可重复检查

构建后先启动预览服务器，再运行：

```bash
python3 -B scripts/check-tongue-motion-assets.py
python3 -B scripts/check-tongue-design-domain.py
node scripts/check-tongue-sleeve-contracts.mjs
node scripts/check-tongue-motion-browser.cjs
python3 -B scripts/compare-tongue-revisions.py
python3 -B scripts/check-tongue-motion-protection.py
node scripts/record-tongue-motion.cjs
python3 -B scripts/record-tongue-motion-live.py
node scripts/build-tongue-motion-lab.mjs
python3 -B scripts/check-tongue-motion-delivery.py
```

验证与实际画面位于 `public/tongue-motion-lab/verification/`。几何检查包括源 SHA、拓扑一致、根部固定、无关包边与缝线顶点不动、有限数值、非刚体形变、实际手面支撑、手指接触误差。采样袖面相对手上表面的最小间隙约 0.375 mm；有些布面桥接区间隙可达约 13 mm，不等于全面贴紧。抓取模型指腹到鞋舌锚点约 1 mm。以上只验证模型数据及采样，不代替完整扫掠碰撞检查。

浏览器检查包括九个分镜、13.8 / 16.8 秒同姿态银钻矩阵完全相等、响指前水晶进度严格为零、确定性正反向定位、多次重播、各阶段取消、终态保持、独立倒放、相机交接不跳、旋转时不争夺控制、WebGL 上下文恢复、加载失败显示、单画布及桌面／平板／手机布局。操作录屏还执行快速重播／取消与模拟页面隐藏暂停检查。触控使用 Chromium iPad 设备模拟；尚无 iPad Safari 实机结论。

V1.1 审片 MP4 为 24 fps 固定时间步捕捉真实 WebGL 各帧，使用 DPR 0.8、1024 阴影，输出 888 × 736，用于看动作；真实操作 MP4 则为软件渲染浏览器的实时录制，用于检查按钮与交互。均为 H.264 / yuv420p / faststart，不能拿审片帧率作为实时性能证明。运行时统计的 render submission 时间也不等于 GPU 实际呈现帧率。

## 当前视觉问题与下一步条件

1. 滚翻是真实连续网格变形，但依然为艺术控制的烘焙。大环状折口已压薄，局部褶皱、根部拉伸及边缘收口仍需细修，自由视角会暴露源 AI 拓扑不均匀。
2. 夹取锚点已接触；整根指头的碰撞体积、指节形态、响指关节速度和手掌接触仍需动画师级润饰。没有用隐藏手部或淡入淡出掩饰这些问题。
3. 蓝色晶体为独立程序 PBR 纹理，保留深蓝／宝蓝／青蓝细晶体反光；与最终图的密度、颜色、银钻高光仍有差距，需要下一轮艺术比对。
4. 部分源鞋舌背面与根部在翻平时仍有可见边界与皱褶；数值根部固定并不代表整段连接形态已经最终精修。
   V1.1 已让初态和最终状态使用同一安装基面，抬平与覆盖阶段使用同一展开基面；可见游离段和袖面共享 SVG 参考材质坐标，宽度约 103 mm。连接鞋身的根部仍精确保留原顶点，因此该隐藏连接段没有强行改成裁片轮廓。
5. 完整资产初次加载约 59 MB 加晶体贴图，显存中还有 float32 形变；桌面 DPR ≤ 1.5、触控 DPR ≤ 1.15，阴影分别 2048 / 1024。已避免逐帧重编译与大量银钻对象分配，仍需真实 iPad 的 Safari 设备测试后决定 LOD／缓存压缩。
6. 本轮是独立动画实验室。正式接入既有鞋舌章节、网页滚动导航与跨章节状态，需要艺术确认后的集成步骤，不把独立实验说成已经替换生产页面。

本轮优先完成动作逻辑、单一袖面与银钻连续性、可复位交互及实际验证。它是可审查的第一版，不宣称已达到最终电影级画面。
