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

## 可扩展的代码位置

| 模块 | 责任 |
|---|---|
| `src/advertising/tree.ts` | 节点、父子关系、目录、未开发分支 |
| `narrative/Narrative.ts` | 单次叙事、并行动画、取消令牌、回放与状态复位 |
| `scene/AdScene.ts` | 资产、PBR 光照、阴影、原鞋与副本 |
| `scene/CameraRig.ts` | 当前镜头接续、构图、触控轨道、缩放界限 |
| `geometry/CuffCurve.ts` | 原周向 → 矩形 → 圆周的曲率场 |
| `geometry/CuffMaterial.ts` | GPU 几何、法线、阴影与材质转译 |
| `geometry/Structure.ts` | 陶脑、屋顶杆件、格架与围合后的屋顶 |
| `interaction/PartInteraction.ts` | 拖动与点选区分、多指过滤、部件射线检测 |
| `ui/AdUI.ts` | 克制的目录、路径、节点提示及文化注释 |

新增部位应先给出独立对象选择规则、节点终态和叙事轨道，再复用镜头/取消/导航机制。不要给未确认的文化叙事填入虚构内容。

## 性能与审核

触控分辨率上限 1.25 DPR，桌面 1.5；慢帧自动降至最低 0.85。触控操作/叙事目标 30 fps、闲置 20 fps，桌面叙事上限 60 fps；环境贴图 256、阴影 1024、静止节点不重算阴影。共享副本几何和贴图，使用实例化杆件；页面隐藏暂停叙事和绘制。系统减少动态效果设置停止闲置转动/浮动并缩短叙事，静止后按需重绘。WebGL 不支持、模型失败、上下文丢失会给出恢复提示。

`node scripts/check-onward-ad.mjs http://127.0.0.1:4195` 执行 Chromium CDP 集成检查。需系统 Chromium，可用 `CHROME_PATH` 指定；自动创建临时浏览器资料，不动鞋模。结果在 `previews/interactive-ad-v1/verification.json`。

**测试边界**：当前是 Linux Chromium / SwiftShader 软件图形环境，触控通过 CDP 模拟；不是 iPad Safari 实机，也不能用 CPU 提交耗时当成真实 GPU 帧率。iPad 仍需检验持续运行温度、首次加载、Safari 回后台恢复及各尺寸横竖屏触控。

演示 MP4 由真实网页时间线逐帧采样重放，便于审查动作连续性；不是实机帧率录像。截图和视频在 `previews/interactive-ad-v1/`，可重复录制脚本在 `scripts/`。

仍可打磨：真实织物碰撞/阻尼、展开局部应变、扣袢更细的弯曲、门框与束带的细节、毛毡织物微表面，以及基于实机 GPU 的画质档位。此 V1 应作为可体验的广告样片审核，不能宣称已达到最终商业投放或真机性能认证。

## 署名

基础鞋模改编自 theunclerulez 的 [Generic “Converse style” Sneakers](https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。此前 SoulGrain 版本已修改几何与材质。本广告派生资产继续沿用其来源，新增部件分组、变形数据及结构演示；来源许可同时保留在页面目录署名入口。
