# Why Zero · 完整绿色手交互序列 V3

本轮按用户最新澄清修正范围：重点为两段录屏中的绿色手与鼠标互动，以及后面类似《创造亚当》的双手、花园和长按反馈，**不再止于画零解锁**。

- 直接操作绿色手：<https://siriguleng15.github.io/soulgrain-onward/why-zero-hand-narrative-v3/?stage=hands>
- 直接进入双手与长按：<https://siriguleng15.github.io/soulgrain-onward/why-zero-hand-narrative-v3/?stage=creation>
- 从首次加载开始的完整路径：<https://siriguleng15.github.io/soulgrain-onward/why-zero-hand-narrative-v3/>
- 实际截图、录屏、源码包和验证：<https://siriguleng15.github.io/soulgrain-onward/why-zero-hand-narrative-v3/review.html>

独立分支：`research/why-zero-hand-narrative-v3`。继续扩展原研究工程，保留前两版预览；没有修改 Soulgrain 鞋模、原始 GLB、纹理、工作台、正式网站或 main。

## 覆盖的连续路径

1. 99 倒数、顶部向下结霜、左下数字破裂。
2. 冰后绿色手、鼠标/单指画零、晶体白边、解锁白闪。
3. You Believed 的白场转场。
4. 绿色手跟随鼠标/手指移动和转动；按下时手指收握，松开恢复。白色圆牌绕手作三维运动，青绿雾面窗口随指针变化。
5. 滚动或竖向滑动，连续进入 College / would / land / You，再进入 a JOB 构图。绿色手在同一骨骼模型上调整姿态，旋转为横向伸出。
6. 花园、双柱、水面背景逐渐显现，立体花瓣持续飘动，另一只肤色手进入构图。
7. 双手间出现 TAP HOLD 提示。长按中央三维目标，绿色手转为录屏中竖起中指的姿态，光线和环境转为暗红；松开、取消或离开目标后，恢复日光与伸手姿态。

末尾保持在双手场景；没有加入录屏之外的玻璃破碎、燃烧或地图。

## 桌面与 iPad 的操作

| 操作 | 实际响应 |
|---|---|
| 鼠标移动 / 手指拖动 | 三维手的位置、朝向和雾面揭示随输入变化，带少量惯性 |
| 手部场景按下 / 松开 | 实际指骨收握、恢复，不是替换手势图片 |
| 滚轮 / 竖向滑动 | 连续推进和回退手部空间构图、文字、环境及圆牌状态 |
| Continue Exploring | 前往下一段，供不便滚动的设备操作 |
| 右下章节菜单 | 返回白场、手部或双手段落 |
| 双手间中央光圈内长按 | Raycaster 命中真实三维目标，改变手势及环境 |
| 松开、移出目标、多指中断、窗口失焦、旋转屏幕 | 取消长按，恢复白天，不留下卡住状态 |
| 左上重新开始 | 重置开场、轨迹、章节和长按状态 |

若从完整入口打开，画零后继续滚动或点 Continue Exploring。也可直接用前面的手部/双手入口审核重点效果。

## 真实三维与素材边界

`SkinnedHand.ts` 使用同一套网格和骨骼插值手势；绿色手从悬浮、收握到横向伸出保持同一对象。肤色手是同一合法基础资产的独立骨骼实例。没有把视频、录屏截图或不同手势图片作为主角动画。

花园使用本项目新生成的环境图，在 Shader 中实现景深式边缘雾、轻微视差、水面扰动和光色变化；它属于 **2.5D 背景**，不声称完整重建了原站的三维地形。前景的双手、圆牌、花瓣和命中目标均为实时三维对象。

仍不能称为像素完全一致：原站手模拓扑、皮肤纹理、花园图、字体文件和原始相机参数未取得。当前为独立衍生手模、原创生成材质/背景、合法字体及自行绘制的符号和字形。手部比例、光泽、具体花瓣轨迹、图案和节奏仍与原作有差异。参考网页和官方文章仍被代理拦截；动作依据来自用户录屏，不把独立实现归因于官方源码。

用户录屏和其中的浏览器界面只用于私有分析，没有被发布到网页。

## 工程结构

- `HandNarrative.ts`：连续章节状态、滚动/触控推进、Raycaster 目标、长按与释放、灯光和合成控制。
- `SkinnedHand.ts`：骨骼父子链、手指姿态插值、指尖约束定位、皮肤/PBR 材质、模型法线平滑。
- `CoinOrbit.ts`：真实三维圆牌与独立绘制的简单符号。
- `PetalField.ts`：实例化弯曲花瓣、空间轨迹和翻转。
- `handSceneShaders.ts`：雾面揭示、场景混合、视差、水面扰动和接触光圈。
- `GuideHand.ts`：保留原冰面引导，新增实际指针响应。
- `FrostPipeline.ts`、`Narrative.ts`、`gesture.ts`：保留并复用结霜、动态热量场、可取消时间线和几何识别。

可编辑资产：`assets-src/hand-long-v3.blend`、原始生成 PNG、字体及来源许可。长前臂 GLB 可通过以下命令重建：

```bash
blender -b --python assets-src/refine_hand.py -- --long-arm
```

MIT 手部基础：immersive-web/webxr-input-profiles；本地保留完整 MIT 许可。字体为 SIL OFL，运行子集重新命名并保留原件与许可。背景和皮肤材质为本项目独立生成，不是原站资产。

## 运行与验证

```bash
cd studies/why-zero-intro
npm ci
npm test
npm run dev
npm run build
```

```bash
node scripts/build.mjs /workspace/why-zero-preview-v3-local ./
node scripts/verify-v3.mjs /workspace/why-zero-preview-v3-local --film
```

手部专项验证使用真实鼠标/触控、滚轮或滑动、按下/松开及可见章节按钮；不通过设置章节值或 Shader uniform 来冒充交互。审核录屏由实际输入驱动生产控制器，以 24 fps 的审核时钟取帧。编码帧率不代表实际设备性能。

验证环境为 Linux Chromium / SwiftShader；触控为 CDP 模拟，**尚未进行实体 iPad Safari 测试**。性能面板可在真实设备采样。后半段激活后停止绘制已被覆盖的冰面后处理，只保留当前三维场景及合成；使用像素预算、DPR 上限、单份几何及花瓣实例化控制开销。
