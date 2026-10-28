# SoulGrain ONWARD V10 · 鞋舌修正与裁片对应

本轮以用户上传的 `xiezitu.glb` 为基础，先修正鞋舌，再以最终皮条效果图校准可见侧面，最后建立“真实裁片 → 同一效果图 → 修正模型”的对应。**这里的实际模型指可操作的三维表面，不代表实物扫描或已验证的制造结构。**

独立分支：`feat/onward-reference-model-v10`。独立入口：`reference-model.html`。预览路径为 [V10 模型审核页](https://siriguleng15.github.io/soulgrain-onward/onward-model-v10/reference-model.html)；是否已发布应以实际部署记录为准。

## 输入与保留范围

上传原文件含 **696,427 顶点、1,393,074 三角形**，是一个连通、闭合的网格；没有独立鞋舌对象、UV、纹理或顶点色。其 SHA-256 为：

```text
b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897
```

本轮形状依据是 `public/pattern-engineering/references/03-shoe-side-original.jpg` 与 `12-design-final-straps.jpg`：深蓝原鞋及白色 PU 皮条最终效果图。它们共用一张鞋照底图，不采用更早 V8 的印花或烫钻鞋舌设计。模型没有原生外观纹理，因此使用中性材质检查几何，不将其描述为已经完成成品配色。

原始 GLB 不覆盖。官网、工作台、广告页、V7／V8／V9 模型及原裁片研究页均不是本轮编辑对象。新模型、脚本与页面集中在本目录、`public/reference-model-v10/` 和 `src/reference-model/`。

## 修正思路

1. **鞋舌局部修补。** 去除远侧三处 AI 额外生成的鞋眼孔和圈边，保留前方扣件所在的既有圈座、真实鞋带孔及外翻关系。前方按参考照片补上独立、可编辑的闭合银色扣帽；依据可见圈座和凸缘测量修正座面与侧面中心，不把最初粗选的中心当作不可变坐标。用局部补面和受限平顺恢复连续布面；只在修补邻域内调整，邻域外的源几何保持原位。最终范围、移动量与拓扑检查以 `tongue-repair.json` 为准，不能仅凭补孔成功认定表面质量合格。
2. **最终效果图校准。** `photo-calibration.json` 保存模型审计视图与效果图的人工对应。初始全局配准 RMS 约 **19 px**，这是单张图的手工拟合残差，不是实物尺寸误差。`calibrate_model.py` 对可见外侧鞋面应用限幅位移场，单点位移上限为 **0.055 模型单位**；鞋底保护区 `glTF Y ≤ −0.23` 不移动。当前拟合、保护权重与位移量见 `profile-correction.json`。
3. **保留高模，另做展示网格。** `finish_model.py` 输出高精度修正版和目标约 24 万三角形的网页 LOD。实际面数及 LOD 采样误差见 `model-validation.json`。采样误差使用模型单位，不能换称毫米或完整 Hausdorff 误差。
4. **保守面料分类。** 模型将可见鞋身、翻筒参考区域分开标记，硬件、鞋舌及用途不明区域排除。分区只为限制对应射线，不是工厂物料分层；语义分区边界也不是新增缝线。

## 怎样审核

- **鞋舌与模型：** 在同一相机下切换上传原版和修正版，重点看“鞋舌俯视”和修补区高亮，再旋转检查扣件、鞋带及外翻形态。原版网页展示也使用 LOD；原文件可单独下载。
- **最终效果图对照：** 固定照片相机，调节照片与模型透明度，检查翻筒轮廓、鞋眼和皮条。配准参数可调；模型单位没有实测尺度，不会因此变成毫米。
- **裁片与模型桥接：** 轻点真实裁片或明确分类的模型面料，查看两套三角形／重心坐标。可保存对应并导出 JSON。原裁片毫米轮廓、顶点 ID 和三角索引保持不变。

可选的裁片映射壳层只绘制全部顶点均成功命中的原裁片三角形，并显示命中数量。平面到壳层的连续插值用于解释对应关系，**不是已经恢复的真实缝合、绷帮或布料物理解算**。旧模型哈希、旧配准或不同裁片身份不能继续套用。详细公式与遮挡规则见 [BRIDGE-NOTES.md](BRIDGE-NOTES.md)。

## 文件与复算

`public/reference-model-v10/` 的生成资产包括：

| 文件 | 用途 |
|---|---|
| `xiezitu-original.glb` | 用户原始字节备份 |
| `source-preview.glb` | 原版展示 LOD |
| `corrected.glb` | 网页修正版 LOD，作为当前桥接身份依据 |
| `corrected-high.glb` | 高精度修正版下载 |
| `onward-model-v10-editable.blend` | 保留原高模、修正高模与展示部件的可编辑工程 |
| `model-data.json` | 文件名、来源哈希、照片配准与修正说明 |
| `bridge-data.json` | 实际模型对应、缺失掩码及可选壳层 |
| `verification/` | 实际运行后的截图与检查记录 |

上述资产与检查记录已在本轮生成；它们是几何审核与照片桥接成果，尚不是生产验收文件。

使用 Blender 5.2 与系统 Python／NumPy／SciPy 重算；先把用户原始文件放在可读位置：

```bash
blender -b --python modeling/reference-model-v10/prepare_source.py -- --source /path/to/xiezitu.glb
blender -b --python modeling/reference-model-v10/repair_tongue.py
python3 modeling/reference-model-v10/calibrate_model.py
blender -b --python modeling/reference-model-v10/finish_model.py -- --source /path/to/xiezitu.glb
python3 modeling/reference-model-v10/build_bridge.py --shell
node modeling/reference-model-v10/check_bridge.mjs --actual
node modeling/reference-model-v10/check_tongue_snap.mjs
npx tsc --noEmit
node scripts/build-reference-model-preview.mjs /tmp/onward-reference-model-preview /soulgrain-onward/onward-model-v10/
```

当前修补脚本使用 `/tmp` 中间数据；`prepare_source.py` 与 `finish_model.py` 的 `--source` 应指向同一原始 GLB，哈希校验必须通过。省略后者的 `--source` 时，优先使用本轮资产目录中保留的原始 GLB。`npm run dev` 可在仓库内打开 `/reference-model.html`。独立构建只复制 V10 资产及所需的五份既有裁片／参考资料，不替换原网站入口。

## 当前验证结果

- **局部补面：** 三处额外孔洞修复后，闭合主体网格为零边界边、零非流形边、零退化三角形；局部平顺移动 12,630 个原顶点，修补邻域外位移为零。照片侧面校准之后主体拓扑不变、零退化面、没有相对输入翻转超过 90° 的三角形；未完成自相交、布料接触或力学验证。
- **鞋舌扣帽：** `verification/tongue-snap-validation.json` 对实际导出的 GLB 检查参考侧视方向的 25 条内部射线，首个命中均为新增扣帽；扣帽几何边检查为零边界边、零非流形边。该检查证明闭合帽面在该视角可见，不证明背面母件、扣合或缝制工艺已还原。当前扣帽半径为 0.045 模型单位，未经实物尺度标定，不能称为 12 mm。
- **照片桥接：** 保留全部 8,453 个原裁片顶点和 16,125 个原三角形身份；其中 1,670 个顶点（19.8%）命中明确可见面料，绘制 2,720 个完整命中三角形。原八个皮条固定端／扣心参考点在当前 AI 表面上均被硬件或其他排除结构阻挡，保持 `actual: null`。八个可见面料演示点另列为“非扣件定位”。
- **实际 GLB 验证：** 使用 GLTFLoader 对实际模型核对对象路径、缓冲指纹和重心坐标，114 个已存锚点一致；完成 101 次壳层选点及 100 次显示展开／复位，原裁片坐标与身份不漂移。数值一致不等于实物精度。
- **浏览器功能：** `verification/browser-validation.json` 记录 Linux Chromium／SwiftShader 下 38 项检查通过，包括加载、同相机前后对照、触控旋转／双指缩放、照片叠加、双向选点、遮挡留空、动画中断、实际 JSON／SVG 下载，以及故障重试。重试检查主动拦截一次模型请求，报告中的该条失败请求属于预期测试。
- **性能与设备范围：** 壳层插值的实际帧数与帧间隔记录在浏览器报告中，来自软件 WebGL 环境，不代表 iPad GPU 性能，也不构成流畅性通过。尚无真实 iPad Safari 测试记录。

检查基于 2026-10-28 生成的实际文件。运行时模型、源照片配准或纸样身份变化后，必须重建桥接并重新生成相关报告；旧报告不能直接继承。

## 验证边界

拓扑检查、视觉修补质量、照片配准和制造精度是不同结论。应结合最终生成的修补报告、实际 GLB 桥接检查、截图及浏览器记录逐项判断，不能用算法样例替代产品数据。

AI 闭合表面可能没有皮条后方、翻筒下面独立的布面。射线先命中皮条、扣件、其他层或未知区域时，对应保持 `null`，不穿透并假装找到了安装面。12 mm 扣头外观直径不自动提供 PU 宽、搭接量、公母扣安装孔或真实模型尺度。

目前不能仅靠这张侧照确认隐藏深度、真实缝合、绝对鞋子尺寸和工厂定位精度。浏览器触控模拟也不等于真实 iPad Safari 验收；没有对应实机记录时，不声明已验证实机流畅性。
