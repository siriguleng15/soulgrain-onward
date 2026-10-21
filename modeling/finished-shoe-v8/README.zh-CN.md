# ONWARD · V8 成品参考模型

在已认可的 V7 上完成外观与独立饰件。**一只鞋、可旋转缩放、外翻／展开两种形态、可继续分区换色与替换图片。**未覆盖 V7 GLB、Blender 工程或其生成脚本。

- [成品双形态 GLB](../../public/assets/soulgrain_onward_finished_v8.glb)
- [可编辑 Blender 工程](soulgrain_onward_finished_v8.blend)
- [实际45°效果](../../previews/v8-finished-reference/folded-three-quarter.png)
- [侧面](../../previews/v8-finished-reference/folded-side.png) · [后跟](../../previews/v8-finished-reference/folded-rear.png) · [高帮展开](../../previews/v8-finished-reference/upright-three-quarter.png)

工作台默认加载 V8；`/design-lab.html?model=v7` 可查看原 V7。原有15个区域保留，新增10个饰件材质区域，共25个。鞋筒、鞋舌及相应饰件随同一 `Shaft_Upright` 目标切换；展开时扣袢呈解开状态，圆头留在鞋身，不把扣绳拉长成橡皮筋。这是两个端点造型，不是布料或扣件物理模拟。

## 本轮做了什么

- 鞋身和鞋面前部使用提供的藏蓝／米白原图案，调整铺排与局部UV方向；保留后续替换图片和调色能力。
- 翻筒加入根据布料照片重建的织物重复纹理；上下饰边使用整体参考图里的原回纹局部映射。红色包边、藏蓝鞋底围线沿真实鞋面／鞋底曲面布置。
- 新增贴合后跟的皮条、独立缝线及原图 Logo 标签；鞋带头使用展开图，另建金属圈和圆端帽。
- 鞋舌正面直接映射所提供的文字图，不重写或猜写文字。背面依专门细节图暂用紫色，空白织物为重建纹理；785个近似石位从排钻图读取，生成贴合曲面的独立切面颗粒并合并为一个可编辑对象。边缘饰钉另成对象。
- 两枚蒙古扣依据整体侧图估计扣位，具有双绳袢、布袢、缝线、立体圆头与金属边；圆头可见纹样使用原照片局部映射，不虚构清晰雕刻原稿。

`references/` 的九张图均按原始字节保存；`sources.json` 记录尺寸、来源和SHA-256。两张重建织物在 `textures/` 中单独标注，**不冒充准确提取的工厂花稿**。

## 当前仍需实物确认

这是第一轮成品外观匹配，**不是与实物逐点一致的扫描件**。整体图的鞋舌是蓝色，专门鞋舌图为紫色，本轮暂以后者为准。印花缩放和裁片落位为视觉铺排，不能据此裁布。布料组织、扣头雕刻、背面结构、扣件／皮条尺寸、钻径和石数仍需原始花稿、近照或实物尺寸校正。

当前保留 V7 的鞋带走向与两根鞋带尾的位置；不是整体侧图中“两尾在同一可见侧”的精确复制。原V7鞋底纹理、鞋头和鞋帮轮廓也没有为匹配照片而重建。未提供的一侧沿用同一套外观逻辑。后续若要进一步贴近实物，这些需要单独确认。

25个材质区可以继续编辑；烫钻等小五金没有可用印花UV时只支持改色。恢复外观会回到本轮成品贴图。上传印花仅在设备本地处理，导出后嵌入 GLB。

## 重复生成

需要 Blender 5.2.2 LTS。当前绝对路径：

```sh
/workspace/blender-install/bin/blender-5.2.2 --background --threads 4 \
  --python modeling/finished-shoe-v8/finish_v7.py
```

脚本只读取 V7 `.blend`，不运行过去的重建脚本。开始及结束均检查源工程SHA-256；另比较所有原有对象的顶点、面连接和全部形态键坐标，结果保存在 `geometry-preservation.json`。只修改原对象的UV／材质并添加新对象。

重新渲染（不保存或改变模型工程）：

```sh
/workspace/blender-install/bin/blender-5.2.2 --background --threads 4 \
  --python modeling/finished-shoe-v8/render_finished.py -- \
  folded-side folded-three-quarter folded-rear upright-three-quarter
```

`prepare_sources.py` 仅用于首次导入原图及读取石位，需系统 Python 的 Pillow、NumPy、SciPy；已有成果重建不需要再执行它。两张重建纹理作为固定输入保存，建模脚本不调用图像生成服务。

网页沿用项目启动／构建命令：`npm ci`、`npm run dev`、`npm run build`。仅工作台增加版本选择和新素材，官网保持原样；未合并 main，未部署或替换 Vercel 正式站。

本轮实际通过 `npm run build`（包含 TypeScript 检查）、GLB 二进制与双形态数据检查，以及浏览器中的触控旋转、双指缩放、改色、上传印花、重复／旋转调整、恢复外观、GLB下载和V7独立加载。下载文件再次解析，确认颜色、图片变换与20个变形图元仍存在。见 `validation.json`、`interaction-check.json`。这些是 Chromium 触控模拟检查，真实 iPad Safari 仍待实机体验。`verify_glb.py` 可再次只读检查实际GLB；这些结构检查不代替外观审核。

## 来源

V7 的原始基础模型：theunclerulez，[Generic “Converse style” Sneakers](https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。原结构已在 V7 加工；本轮保留该结构，修改UV／材质并新增饰件。品牌图案及成品参考为用户提供。
