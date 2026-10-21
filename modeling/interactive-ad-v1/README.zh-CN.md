# ONWARD｜树状交互广告 V1

独立入口：`/onward-ad.html`。代码分支：`feat/onward-interactive-ad-v1`。

以确认的 V8 提交 `b169dde54caf700d2557dcfbafad6024c6ffe50b` 为唯一鞋模来源。官网、设计工作台、V7/V8 模型和工程均不覆盖。广告页面没有自动推进的叙事节点；每个动作结束后等待下一次选择。

## 本版可以体验什么

`ROOT → A1 → A1.1 → A1.1.1 → A1.1.1.1`：整鞋缓转与触控 → 翻筒摄影特写 → 周向展开 → 陶脑显现、乌尼逐根延伸、扣袢抬起、右侧副本围合，同时原鞋复位 → 主动打开四项文化注释。

可拖动旋转、双指/滚轮缩放、点选真实翻筒网格或提示进入；支持上一级、路径导航、回到整鞋和回放。动画中可以返回，最后一次导航接管当前三维状态。B–H 是目录中的待拓展数据，不声称已有演出。

## 启动与构建

```sh
npm ci
npm run dev -- --port 4195
# http://localhost:4195/onward-ad.html
npm run build
npm run preview
```

同一局域网的 iPad 可访问开发机 IP 与端口。在线审核使用独立预览目录或 Vercel Preview，不能提升为 Production。源码只增加广告入口，不给原官网插入新界面。

## 资产与来源保护

- `public/assets/onward-ad-v1/onward-ad-v1.glb`：广告专用派生 GLB，约 23.9 MB，内嵌 V8 原贴图、原静止网格，以及变形参数。
- `public/assets/onward-ad-v1/cuff-structure.json`：256 个周向采样点、真实弧长、原缝线采样、部件角色与 V8 文件 SHA256。
- `onward_ad_v1_editable.blend`：Z 向上可编辑工程，保留原材质与打包贴图；广告部件分离，另有 33/67/100% 展开审核形态键。网页使用连续曲率场，不是在三张形态键间切换。
- `build_ad_asset.py`：从 V8 `.blend` 读取，不调用旧鞋型重建脚本；只输出上述广告目录。
- `verify_source.py`：只读比较源工程和派生工程的静止面片位置、UV、材质名称及打包贴图哈希。

```sh
/workspace/blender-install/bin/blender-5.2.2 --background --factory-startup --threads 4 --python modeling/interactive-ad-v1/build_ad_asset.py
/workspace/blender-install/bin/blender-5.2.2 --background --factory-startup --threads 4 --python modeling/interactive-ad-v1/verify_source.py
```

原 V8 GLB SHA256：`9d28c469089cb039fd17393db7e84d7c46def77db4eeb04aa05deed8a32c6f63`。静止对比验证保存在 `previews/interactive-ad-v1/source-verification.json`：原 26 个网格对象分为 29 个，235040 个原面片保持一致；对象分离会复制边界顶点，不代表鞋型被重建。

## 几何如何连续展开

1. 从 V8 翻筒 UV 逆推出原裁片参数；原静止坐标、法线、贴图与 UV 保留。
2. 沿真实周向中心线计算弧长（约 0.231952 模型单位），通过曲率逐步释放，把原背侧布面转到前方。不是图片拉伸，也不是直接替换静态网格。
3. 原两道绗缝线定义展开后的三个横向分区。保留布面内外层、红边、鞋眼、刺绣边饰，并保留浅鼓起截面。
4. 蒙古扣头留在鞋身；扣袢跟随翻筒，围绕缝接端抬起再回落。材质与阴影使用相同变形场。
5. 副本复用同一套网格和 UV，连续由直线围成圆周；蓝色逐步转为浅白色，补充体积格架、屋顶、顶部圆环、横向束带与门框。

**边界说明**：翻折缝处的分离是广告中的构成分析，不表示实物翻筒可以拆卸。展开使用可编辑的几何曲率场与截面插值，不是经过材料实验标定的布料物理模拟，也未声称每个中间帧无任何局部拉伸。右侧围合时周长渐变至 1.7 倍、整体高度至 0.75 倍，用于从服饰比例转译为建筑比例；不能当成实物一比一工艺。

屋顶连接位置从现有布面两组交叉纹线与上沿的交点推导，另以相邻区间中点补充连接位，共 28 根乌尼。其规则在 `Structure.structureSeats()` 可追溯。这是本次设计转译的构图依据，不是声称布料纹理就是传统蒙古包的工程纸样。

白色蒙古包是可读的结构演示，提供陶脑、乌尼、格架、围墙、束带及门口；不是建筑施工模型。文化表述限于部件结构与本款设计联系，不附会未经验证的历史或数学结论。

## 本轮画面改进：实体感与清晰度

本轮继续维护同一广告页面与 ROOT → 翻筒分支，不改已确认的 V8 鞋型、网格、UV 或彩色图案，不重新生成鞋模，也没有覆盖 V8 GLB、Blender 工程、官网或设计工作台。

- **鞋面光照修复**：确认 V8 内嵌的 `Neutral_canvas_weave` 法线贴图为全黑图，解码后会把表面法线错误地指向内侧。`scene/StudioMaterials.ts` 仅在广告运行时替换这一张已确认异常的法线图，实际覆盖 9 个材质；使用经过法线方向校验的 128 × 128 织物法线，保留原来的 UV、颜色图案和法线强度。原文件未写回。鞋头原有的几何起伏仍然保留，本轮没有重塑或抹平这些起伏。
- **实体围墙**：演示副本在出现过程中使用写入深度的覆盖渐显，完成后是不透明、偏暖的浅白色布面。光照、变形、门洞裁切与阴影使用对应逻辑，避免最终画面仍透出背侧格架或漂浮的阴影。
- **实体屋顶与收边**：将原半透明屋面改为闭合的内外双层毡面，增加檐口叠层、真实截面厚度与克制的毛毡微表面；叙事终态的 `cover = 0.93` 在几何内部映射为完整覆盖。杆件在构成阶段仍可见，覆盖完成后被不透明屋面自然遮挡。
- **建筑结构收敛**：缩小顶部圆环，乌尼与哈那使用有截面的木构件；格架随围合退入墙体内侧。门框改为具有厚度的门柱、门楣、门槛与内凹门板，并依据实际墙脚定位。两道束带保持实际截面尺寸，绕过门口，不横穿入口。新增内侧地面让围墙、门口与屋顶形成完整体积。
- **摄影棚与采样**：重新平衡主光、补光、轮廓光和环境反射，保留藏青布料的颜色、缝线与扣具高光；同时提高触屏像素采样下限，避免软件降档后画面长期模糊。这是渲染调整，不是修改鞋子的纹样设计。

当前网页渲染证据在 [`previews/interactive-ad-v1-polish/`](../../previews/interactive-ad-v1-polish/)：包含 [ROOT](../../previews/interactive-ad-v1-polish/root-after.png)、[翻筒特写](../../previews/interactive-ad-v1-polish/cuff-after.png)、[结构连接](../../previews/interactive-ad-v1-polish/structure-after.png)、[围合过程](../../previews/interactive-ad-v1-polish/assembly-after.png)、[整鞋与实体蒙古包](../../previews/interactive-ad-v1-polish/pair-after.png)及[文化注释](../../previews/interactive-ad-v1-polish/notes-after.png)。这些是浏览器真实渲染截图，不是重绘效果图；应结合交互过程审核，不能把静态截图作为实机流畅性的证明。

## 可扩展的代码位置

| 模块 | 责任 |
|---|---|
| `src/advertising/tree.ts` | 节点、父子关系、目录、未开发分支 |
| `narrative/Narrative.ts` | 单次叙事、并行动画、取消令牌、回放与状态复位 |
| `scene/AdScene.ts` | 资产、PBR 光照、阴影、原鞋与副本 |
| `scene/StudioMaterials.ts` | 广告运行时的异常法线贴图修复与法线方向校验 |
| `scene/CameraRig.ts` | 当前镜头接续、构图、触控轨道、缩放界限 |
| `geometry/CuffCurve.ts` | 原周向 → 矩形 → 圆周的曲率场 |
| `geometry/CuffMaterial.ts` | GPU 几何、法线、阴影与材质转译 |
| `geometry/Structure.ts` | 陶脑、屋顶杆件、格架与围合后的屋顶 |
| `interaction/PartInteraction.ts` | 拖动与点选区分、多指过滤、部件射线检测 |
| `ui/AdUI.ts` | 克制的目录、路径、节点提示及文化注释 |

新增部位应先给出独立对象选择规则、节点终态和叙事轨道，再复用镜头/取消/导航机制。不要给未确认的文化叙事填入虚构内容。

## 性能与审核

当前触控分辨率上限为 1.5 DPR，桌面为 1.75；触控绘制缓冲预算约 280 万像素，桌面约 380 万像素，按视口面积约束采样倍率。慢帧时逐步降档，但最低保持 1 DPR，不再使用旧版的 0.85。若 CSS 视口本身超过像素预算，仍以 1 DPR 为下限。触控操作/叙事目标 30 fps、闲置 20 fps，桌面叙事上限 60 fps；这些是调度目标，不是实测保证。环境贴图 256，触屏阴影 1024、桌面 1536，静止节点不重算阴影。共享副本几何和贴图，使用实例化杆件与小尺寸微表面图；页面隐藏暂停叙事和绘制。系统减少动态效果设置停止闲置转动/浮动并缩短叙事，静止后按需重绘。WebGL 不支持、模型失败、上下文丢失会给出恢复提示。

`node scripts/check-onward-ad.mjs http://127.0.0.1:4195` 执行 Chromium CDP 集成检查。需系统 Chromium，可用 `CHROME_PATH` 指定；自动创建临时浏览器资料，不动鞋模。初次 V1 的检查结果保留在 `previews/interactive-ad-v1/verification.json`，仅代表当次版本；本轮的截图与复核记录使用 `previews/interactive-ad-v1-polish/`，不覆盖历史证据。

**测试边界**：当前是 Linux Chromium / SwiftShader 软件图形环境，触控通过 CDP 模拟；不是 iPad Safari 实机，也不能用 CPU 提交耗时当成真实 GPU 帧率。iPad 仍需检验持续运行温度、首次加载、Safari 回后台恢复及各尺寸横竖屏触控。

**旧版档案**：`previews/interactive-ad-v1/` 内的八张截图、`full-path-review.mp4`、`recording.json` 和检查结果是首次 V1 的交付记录，保留用于追溯，不代表本轮更新后的画面。其代码与证据可追溯至提交 `f47c2efe3ab4ea430cfe574bc57dca0f928f3212` 和 `14e09b0aa8b08e834e9a20090c66971956003981`。旧 MP4 由真实网页时间线逐帧采样重放，便于审查动作连续性；不是实机帧率录像。可重复录制脚本在 `scripts/`。

仍可打磨：真实织物碰撞/阻尼、展开局部应变、扣袢更细的弯曲、建筑细部与布面微表面，以及基于实机 GPU 的画质档位。实体屋顶、门框和束带已经改善，不表示建筑结构已达到施工模型精度。此 V1 应作为可体验的广告样片审核，不能宣称已达到最终商业投放或 iPad Safari 真机性能认证。

## 署名

基础鞋模改编自 theunclerulez 的 [Generic “Converse style” Sneakers](https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。此前 SoulGrain 版本已修改几何与材质。本广告派生资产继续沿用其来源，新增部件分组、变形数据及结构演示；来源许可同时保留在页面目录署名入口。
