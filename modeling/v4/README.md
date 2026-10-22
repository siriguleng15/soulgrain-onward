# ONWARD V4 — 原始源文件重建候选（未通过外形验收）

本轮从 `main` 的五个原始分片重组源文件，重新编写脚本，没有读取或继承 V3 模型、工程或建模脚本。现有网站源码、布局、动画、V2/V3 历史素材均未修改；检查页独立于正式网站，不会自动替换产品模型。

**本成果是可旋转审阅的中间候选，不是已完成的高精度复刻。** 自动布料尝试产生不可接受的收缩，已排除出默认结果。最终候选仍有鞋舌自交，翻筒折痕过于规则、鞋舌贴合不佳。`validate_v4.py` 会因此以非零状态退出，不能将文件可加载解释成结构或外形验收通过。具体数值见 [validation.json](validation.json)。

## 原始模型核验与旧白模比较

重组路径：`/tmp/onward-original/generic_converse_style_sneakers.glb`。

- 字节数：82,944,572（约 79.10 MiB）。
- SHA-256：`af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65`，与上传清单一致；Blender 4.3.2 成功读取。
- 原始文件只在临时目录使用，没有再次提交整体原始 GLB。

| 项目 | 原始 GLB | 旧白模 |
| --- | --- | --- |
| 文件字节数 | 82,944,572 | 2,569,956 |
| 网格数（双鞋） | 4 | 4 |
| 顶点数 / 三角面数 | 38,662 / 58,848 | 38,662 / 58,848 |
| POSITION、NORMAL、TANGENT、UV、索引 | 所有 accessor 字节均与旧版相同 | 相同 |
| 节点变换及层级 | 与旧版相同，名称有变化 | 相同 |
| 材质 | 2 | 1 |
| 嵌入图片 | 6 张 4096×4096 PNG | 无 |

**原始文件更大不代表网格更精细。** 差异主要来自贴图和材质。`source-audit.json` 保存逐 primitive 的属性及索引哈希、材质/图片/节点信息。

原始每只鞋由鞋身和鞋带/硬件两个主要网格对象组成。焊接位置重合的 UV 分裂顶点后，可进一步分出鞋舌和内衬；橡胶鞋头、鞋底与鞋身原本连接在主网格中，并非原生独立对象。原模型有开口边，不是封闭的制造用 CAD。烘焙世界变换后采用 Blender Z 向上，鞋头朝 -X，鞋长约 262 mm；尺寸为建模尺度，并非目标照片的实测尺寸。

## 本轮实际几何修改

1. 选取原始模型的一只鞋，保留原始橡胶鞋头、鞋身下部、鞋底、下部鞋带的真实网格，移除另一只鞋；统一中性浅灰材质，不携带原贴图。
2. 仅焊接约 0.0002 mm 范围内的重合顶点，消除 UV 接缝分裂；鞋底负 Z 区域增厚约 22%，属于照片估计。
3. 在 88 mm 高度截取原鞋帮，沿实际开口 U 形边界（77 个原始采样顶点）建立外翻鞋筒；控制网格根部采样与原边界重合，仍是独立可编辑对象，并非焊接成连续单网格。
4. 翻筒采用非圆形原生边界、上翻曲率、不对称下垂边及局部折痕，厚度 1.6 mm；目前折痕仍过于规律，需要人工雕刻。
5. 变形原始鞋舌网格，保留下端鞋面连接，展宽并弯折上部；增加厚度。保留隐藏的 `CONTROL_NativeTongue` 编辑控制网格。局部 0.6 mm 体素修复未彻底消除自交，不应视为修复成功。
6. 降低内衬并裁去冲突的上段鞋带；增加八个浅灰眼圈及翻筒实际开孔。位置、开孔和下垂曲线均为估计，不是照片标定结果。

脚本内 `--experimental-relax` 是失败实验的复现入口，**不用于默认交付**。默认没有重力求解结果，不能宣称具备物理准确的布料褶皱。

## 文件与部件

- [`../../public/assets/soulgrain_onward_v4_original_review.glb`](../../public/assets/soulgrain_onward_v4_original_review.glb)：约 10.63 MiB、13 个网格、无纹理的单鞋候选。为避免薄层穿插，没有继续强行简化；iPad 加载、内存与温度仍需真机验证。
- [`soulgrain_onward_v4_original_review.blend`](soulgrain_onward_v4_original_review.blend)：可编辑工程，含独立部件、控制网格和渲染场景。
- [`parts.json`](parts.json)：各部件尺寸、顶点/三角面及开口边清单。
- 独立对象：`NativeShoeBody`（含鞋头/鞋底/后跟）、`NativeLacesAndHardware`、`NativeInnerLining`、`ReshapedNativeTongue`、`SourceSeamFoldedCuff`、`GreyEyelet_A_1..4`、`GreyEyelet_B_1..4`。
- [`previews/`](previews/)：六视角渲染及浏览器截图。
- [`comparisons/`](comparisons/)：每张参考与相近视角模型并排。不是相机标定叠图；参考 04 的后方展开鞋仅用于理解结构，主要对照前方折下状态。

## 复现

已使用 Blender 4.3.2。无需重新配置云环境，无新 npm 依赖。

```sh
python3 modeling/v4/restore_original.py
blender -b -t 4 --python-exit-code 1 --python modeling/v4/audit_source.py
blender -b -t 4 --python-exit-code 1 --python modeling/v4/build_from_original.py -- --skip-render
blender -b -t 4 --python-exit-code 1 --python modeling/v4/render_views.py
python3 modeling/v4/make_comparisons.py
blender -b -t 2 --python-exit-code 1 --python modeling/v4/validate_v4.py
```

恢复脚本核对每个分片及整体 SHA，失败即停止，无旧白模回退。最后一条目前预期失败，报告鞋舌自交。根部零位移检查仅针对未细分的控制网格，不能证明最终导出曲面与鞋身完全无缝。验证只覆盖指定的网格条件，不替代跨部件接触审核或相似度审核。重新渲染为 1200×900、Cycles 64 samples；CPU 无降噪，仍可见采样噪点。

## 360° 检查

```sh
npm run dev -- --host 0.0.0.0
```

电脑打开 `http://localhost:5173/modeling/v4/inspect.html`。iPad 与电脑处于同一网络时，在 Safari 打开 `http://电脑局域网IP:5173/modeling/v4/inspect.html`；云工作区需要使用其转发的 5173 端口 URL，再追加 `/modeling/v4/inspect.html`。此检查页走 Vite 开发服务器，不包含在正式网站生产入口中，也没有部署到 Vercel。

鼠标/单指旋转、滚轮/双指缩放、按钮恢复默认视角；无自动旋转，按需渲染，DPR 上限 1.5，画布触控禁用页面滚动。Chromium 软件 WebGL 实际加载和拖动结果见 `browser-check.json`。未宣称通过 iPad Safari 真机测试。WebGL 创建失败和上下文丢失显示提示。

## 外观审核与必须继续打磨的部分

- 侧面鞋筒应更贴合鞋身且边缘不规则；当前两道近似平行折痕仍有规则套筒感，达不到照片的自然堆叠。
- 鞋舌的拱起、末端轮廓和向下贴合不足；存在检查检出的自交。其余部件之间也尚未做完整碰撞检查，不能保证所有接触无穿插。
- 脚背高度、后跟体积、鞋口位置及鞋底厚度需要在六视角间共同调整；照片没有精确尺寸、焦距和正交视图，这些均为估计。
- 建议人工 Blender 流程：用照片相机匹配轮廓 → Lattice/比例编辑修整鞋楦 → 按实际布片重拓扑翻筒/鞋舌 → Grab/Cloth 雕刻不对称折叠 → 建立封闭碰撞代理再做局部模拟 → 逐视角纠正接触 → 手工重拓扑薄层并烘焙微细节。单靠本轮自动化尚不能达到要求的形似精度。

## 来源与许可

原始模型：theunclerulez，**Generic “Converse style” Sneakers**：
https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244

许可：[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。本衍生文件删除原始纹理/材质并使用中性灰，进行了上述几何修改，与原作者无背书关系。参考黑鞋照片仅用于结构分析/审阅对照，不作为模型纹理，不复制其文字、图案或配色；原照片权利仍归原权利人。

浏览器检查脚本 `browser_check.cjs` 使用外部 Playwright（当前环境已有缓存，未加入网站依赖）；可用 `PLAYWRIGHT_MODULE=/path/to/playwright node modeling/v4/browser_check.cjs` 复测，默认检查 localhost:5173。
