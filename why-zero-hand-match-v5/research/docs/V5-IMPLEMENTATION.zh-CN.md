# V5：解剖手模、深度光学与录屏对照

本轮继续维护独立研究分支 `research/why-zero-hand-match-v5` 和预览目录 `why-zero-hand-match-v5/`。Soulgrain 鞋子模型、正式网站、工作台、main 与 V1–V4 的既有预览不被覆盖。

## 本轮处理的主要差距

V4 的手掌、手指和前臂来自简化的交互手模型。继续调整高光或关节角度，无法补出它缺少的真实手掌比例、指甲和皮肤。V5 因此增加具有明确开放许可的解剖手资产，同时保留真实骨骼交互。

- 新手模：Elena FF 的 **Rigged hand**，按 CC BY-SA 4.0 使用并制作衍生资产。
- 由原模型的展开动画姿态建立新的可编辑绑定，保留原顶点对应、皮肤权重和真实 UV。
- 27 个骨骼包含腕部、独立前臂和手指关节。增加的 `thumb-terminal` 保留原拇指末端权重，不假装是新的测量关节。
- 统一模型方向：glTF 中前臂沿 +Y，手指大致沿 −Y，手掌厚度沿 X，宽度沿 Z；再由展示层调整空间姿态。
- 新增前臂继续到画面之外，使用从原腕部颜色衍生的独立环绕纹理，避免把原图集的指甲区域拉到前臂。
- 运行时使用原模型的手部分辨率与新增前臂；Blender 工程保留可选细分，不把编辑细分直接变成过重的实时网格。

### UV 校验

原 glTF 的 V 坐标与 Blender 的约定不同。生成脚本在建立 Blender UV 时使用 `1−V`，导出 glTF 时由导出器恢复。忽略这一步会把指甲图块错误地放到掌面；V5 的原生 GLB 纹理检查确认指甲位于指尖，掌背皮肤与原图集对应。该校验不代表已经匹配参考网站的皮肤资产。

## 材质与光学

`HandMaterialV5.ts` 保留 PBR 的法线、粗糙度、镜面反射与环境光照。原模型的颜色贴图按 sRGB 解码，粗糙度使用原打包贴图的 G 通道；没有把镜面贴图误当成法线。有限的包裹漫反射用于近似浅层散射，不称为测量的皮下散射。

`HandStudioEnvironment.ts` 构建独立软箱环境，配合下方青色补光。`CinematicDiffusion.ts` 使用缩小的 HDR 目标进行两次可分离模糊；合成层同时读取真实场景深度，按焦点距离控制景深。前景花瓣可柔化，手部焦点保留细节。高光扩散来自实际渲染结果，没有用光圈贴图或视频替换手。

Shader 中的雾面揭示、景深和长按折射会增加采样开销。实际设备性能需要独立测量，审核视频的编码帧率不是设备帧率。

## 场景与交互

新 `landscape-v5.webp` 是独立生成的环境图，调整低地平线、花田、水面、双柱位置与右上方光线。默认仍是 **2.5D 背景**：手、圆牌、花瓣和命中目标实时三维渲染，环境图通过实时合成产生空气感与轻微运动，不称为完整三维地形。

绿色手继续跟随鼠标或手指；按下/释放改变真实指骨。滚轮和竖向滑动同步推进雾中露出、圆牌、文字与双手构图。双手场景的长按具有连续阶段：手靠近并改变姿态，环境变暗；继续长按时，实际场景出现折射与充能变化。释放、移出、取消与窗口失焦需要恢复稳定状态，不自动进入录屏范围之外的故事。

## 文件与复建

- [可编辑 Blender 工程](https://github.com/siriguleng15/soulgrain-onward/blob/research/why-zero-hand-match-v5/studies/why-zero-intro/assets-src/hand-anatomical-v5.blend)
- [模型生成脚本](https://github.com/siriguleng15/soulgrain-onward/blob/research/why-zero-hand-match-v5/studies/why-zero-intro/assets-src/convert_anatomical_v5.py)
- [骨骼、映射、单位及哈希报告](https://github.com/siriguleng15/soulgrain-onward/blob/research/why-zero-hand-match-v5/studies/why-zero-intro/assets-src/hand-anatomical-v5-report.json)
- [原始输入与许可说明](https://github.com/siriguleng15/soulgrain-onward/blob/research/why-zero-hand-match-v5/studies/why-zero-intro/assets-src/anatomical-v5-source/README.md)
- [公开资产许可文件](https://github.com/siriguleng15/soulgrain-onward/blob/research/why-zero-hand-match-v5/studies/why-zero-intro/public/assets/ANATOMICAL-HAND-LICENSE.txt)

在项目目录使用 Blender 5.2：

```bash
blender -b --python assets-src/convert_anatomical_v5.py
```

源包保留用于重建的模型数据、纹理、脚本与许可，不需要从用户录屏提取资产，也没有将用户私下提供的视频帧发布为纹理或审核图片。

## 许可与署名

This work is based on **“Rigged hand”**
(https://sketchfab.com/3d-models/rigged-hand-eae97cc2a742413cb5338ab942b12c1e)
by **Elena FF** (https://sketchfab.com/elenaferfor), licensed under
**CC BY-SA 4.0** (https://creativecommons.org/licenses/by-sa/4.0/).

本项目改编的模型、源几何与纹理衍生资产继续遵循 CC BY-SA 4.0。再分发修改后的模型或纹理时，需要保留作者署名和相同许可。独立编写的交互代码与这些模型资产分开；不能将此第三方模型笼统标为本项目原创或 MIT 资产。旧版 MIT WebXR 手模仍按原许可保留。

## 验证边界

实际测试结论以 `public/verification-v5/` 中生成的报告、截图和操作视频为准，不在检查运行前预填通过数量。需要覆盖鼠标跟随、单指拖动、收握、雾面推进、长按两个阶段、取消、复位、移动布局以及资源和 Shader 错误。

测试环境若为 Linux Chromium / SwiftShader 与 CDP 模拟触控，应明确标注，不能称为 iPad Safari 实机测试。录屏若以固定审核时钟取帧，也不能用其流畅度代替硬件性能数据。

本轮仍是根据录屏独立重建：原站模型、场景、相机轨迹、字体和光学参数没有直接取得。不能用代码构建成功或测试数量，替代对实际画面的逐帧判断，也不宣称像素完全一致。

## 绿色手套表面清理

绿色演员使用独立的 `green-glove-v5.glb`，真人手继续使用保留原 UV 的解剖资产。对绿色演员将原始表面做 0.7mm 体素并集、平滑和轻微厚度整理，移除指甲重叠及重复表面，再从原绑定转移骨骼权重。新表面共 16,613 顶点、33,222 三角形，27 骨骼；边界与非流形边均为 0，权重归一误差小于 5e-8。运行时不再叠加顶点法线膨胀，以避免二次挤压和闪烁。

可编辑 `assets-src/green-glove-v5.blend` 与 `assets-src/create_green_glove_v5.py` 均包含在源包中；该衍生模型同样保留 Elena FF 署名与 CC BY-SA 4.0。
