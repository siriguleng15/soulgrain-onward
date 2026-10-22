# ONWARD V9 · 新底模成品外观审核

本轮以用户提供的 [`already.glb`](https://github.com/siriguleng15/soulgrain-onward/blob/682cf319ffe5dc4169fc28a95fc527f77b6a7e35/already.glb) 为唯一鞋体几何来源。保留其鞋楦、三段外翻鞋筒、长鞋舌、鞋头压纹和鞋底纹理，再分区展 UV、铺设成品图案与添加独立饰件。没有将旧 V7/V8 鞋体拼回新模型。

- [直接旋转查看与编辑](https://siriguleng15.github.io/soulgrain-onward/onward-v9/model-review.html)
- [完整 GLB](../../public/assets/soulgrain_onward_refined_v9.glb)
- [可编辑 Blender 工程](soulgrain_onward_refined_v9.blend)
- [45°实际渲染](../../previews/v9-refined-source/three-quarter.png) · [侧面](../../previews/v9-refined-source/side.png) · [后跟](../../previews/v9-refined-source/rear.png)

独立审核页支持单指旋转、双指缩放、恢复视角、原始白模对照、分区改色、上传及旋转／重复印花、恢复原样和 GLB 导出。印花处理仅在当前浏览器内进行；导出文件可继续在 Blender 中编辑。旧官网、设计工作台、V8 模型和交互广告未替换。

**本轮交付为外翻折下形态。** 新源文件没有展开形态、骨骼或动画。本轮没有伪造展开开关，也没有把旧展开形态强套到不同拓扑上。后续要恢复翻帮演示，需要对新鞋筒与鞋舌制作并审核真正连续的展开变形。

## 保留了什么，增加了什么

原文件 18,373,004 bytes，SHA256 `43653b568a738b04513ca34dd0a23025f6f03072e7c20aa962581e4d400e2d80`。包含 382,667 个顶点、765,646 个三角面，单一封闭焊接壳体，没有 UV、材质或独立部件。密集网格不等于扫描精度，源文件也没有足以证明扫描方式或真实尺码的元数据。

`segment_base.py` 将其划分为 14 个可编辑表面区域。为避免材质边界出现明显三角锯齿，局部细分跨边界三角面至 961,999 面；新点始终位于原三角面，原有表面和顶点位置不变。这是保形分区，**没有新增鞋型细节**。每个原面的覆盖面积误差及来源索引见 `segmentation-validation.json`。各区域切口重合，保留原插值平滑法线。这些区域是从融合壳体划出的设计表面，并非恢复出的工厂裁片或原始独立零件。

鞋体按 300 mm 鞋长归一，方便编辑与定位；这不是实物尺码。布面使用原成品印花、既有重建布料纹理；后跟皮条、鞋带头、Logo 与扣头使用已有原参考图及局部 UV。增加独立绳袢、金属端帽、缝线、回纹条和红色包边；舌背排钻使用原排钻图读出的石位，逐颗形成真实切面网格并投射到新鞋舌上。

`finish_v9.py` 在加工前后比较所有新底模区域的顶点／面索引哈希，确认材质和饰件阶段没有改变底模。新增织物法线贴图为经过校验的向外切线法线，不使用黑色高度图冒充法线。GLB 嵌入图片和 UV；实际导出数据见 `validation.json`。

## 再次生成

使用已验证的 Blender 5.2.2 LTS；当前运行路径 `/workspace/blender-install/bin/blender-5.2.2`。没有把安装文件提交到 Git。

```sh
python3 modeling/refined-shoe-v9/download_source.py

/workspace/blender-install/bin/blender-5.2.2 --background --factory-startup --threads 6 \
  --python modeling/refined-shoe-v9/segment_base.py -- \
  --source /tmp/onward-new-source/already.glb --output /tmp/onward-new-source/segmented.blend

/workspace/blender-install/bin/blender-5.2.2 --background --factory-startup --threads 6 \
  --python modeling/refined-shoe-v9/finish_v9.py

/workspace/blender-install/bin/blender-5.2.2 --background --factory-startup --threads 6 \
  --python modeling/refined-shoe-v9/render_v9.py -- --quick side three-quarter rear

npm ci --cache /tmp/onward-npm-cache
npm run build
node scripts/build-model-review-preview.mjs /tmp/onward-v9-preview /soulgrain-onward/onward-v9/
```

建模脚本复用 V8 的饰件网格构造小工具和用户原参考素材，不读取或重建 V8 鞋体。只输出本 V9 目录和新 V9 GLB。原始 `already.glb` 保存在仓库 main，下载缓存位于 `/tmp`，本分支不重复提交源文件。

## 仍需外观确认

印花铺排、扣件落点、饰边宽度、石位与饰件尺寸是参考照片的视觉估计，未标定为实物打版数据。源融合模型的部分鞋带、鞋眼和接缝本身仍有柔化或融合细节；本轮没有以重新光滑或简化整鞋的方式抹掉原细节。顶部新增红管在视觉检查中出现断续，已移除；保留上下回纹、翻筒下缘及鞋底红边，完整顶部红包边仍需沿真实边界进一步制作。未提供的另一侧仍沿用同一外观逻辑。

当前网页测试环境为 Linux Chromium／SwiftShader，触控由 CDP 模拟；Cycles 图由 Blender 5.2.2 渲染。它们不能代替 iPad Safari 实机帧率、温度、后台恢复和大文件下载验证。GLB 约 46 MB，首次打开需要下载完整模型，网页使用受限分辨率和按需渲染。

新鞋体来源是用户提供的 `already.glb`，其来源许可未嵌入文件；不能擅自将旧 Sketchfab 模型作者记为新几何作者。品牌印花、成品照片及图案参考沿用用户提供的素材；布料重建纹理的原说明仍保留在 V8 `sources.json`。
