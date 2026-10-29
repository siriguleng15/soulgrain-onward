# ONWARD · 独立鞋侧拆离与裁片平铺

本轮沿用 V10 修正鞋模、真实纸样数字化数据和既有照片配准，增加一块从成鞋状态就实际参与显示的独立鞋侧。它依次拆离、解除翻筒和底部弯折、平铺，再将自身的平铺轮廓与原纸样叠合。此前 V10 页面、官网、设计工作台和旧模型保留。

## 纸样与鞋模分别决定什么

- **真实纸样决定平铺形状。** 复用 `public/pattern-engineering/exports/ONWARD-project.json` 的原毫米坐标、顶点 ID、孔位和三角形。原裁片边界不为匹配成鞋而移动；底部排除另行记录。
- **照片和 V10 鞋模约束装回位置。** AI 原网格没有真实裁片身份。本轮在独立衍生模型中移除相应的原鞋侧三角形，以纸样驱动的部件替换。没有把 AI 密集表面直接称为可等距展开的实物面料。
- **隐藏区使用明确假设。** 翻折深度、鞋底内的弯入半径、不可见表面及真实包覆边界尚未由实物测定。照片和原模型提供外观参考，不能单独证明缝制、绷帮或材料伸长过程。

因此，“平铺后与数字裁片一致”是静止坐标约束的结果；“成鞋贴合准确”“实物可以这样制作”是另外的验证问题。

## 连续动画与对应关系

`PanelScene` 创建一块侧片 `BufferGeometry`。在一次固定底部配置的拆展过程中，只更新同一位置缓冲与刚体位移，不更换侧片、顶点身份或三角形索引。

1. **成鞋：** 深蓝独立侧片装在衍生鞋模中，替代区域的旧侧面不再继续绘制。
2. **拆离：** 侧片向外移出，保留鞋体出现对应缺口。
3. **展开：** 翻筒和底部弯折连续解除，曲面回到原始裁片平面。
4. **平铺：** 保留区域回到原纸样毫米坐标的统一刚体显示变换。
5. **比对：** 从实际侧片的平铺顶点反算轮廓，再与原纸样叠合。

展开过程使用同拓扑构形样本及相邻样本线性插值。成鞋拟合在鞋眼、鞋底接触参考和翻筒轮廓附近使用不同强度的位置约束，再进行局部刚性几何正则化。材料方向参考约束用于避免相邻姿态选取相反的局部法线分支；它是几何稳定措施，不是实测面料法线或物理布料模拟。

每次拖动或播放都从存储构形重新计算坐标，不在上一帧坐标上累计变形。暂停、逆向装回、快速跳转和重复播放共用同一求值器。

三维点击使用当前三角形的重心坐标，映射到该三角形原二维坐标；二维选择则回到同一三角形和权重。裁切新增点保存原纸样三角形、原顶点索引与重心来源，不伪装成新的原始测量点。

## 鞋底包裹范围仍需确认

默认使用纸样下方长铅笔参考线作为**暂定排除边界**。该线的实际工艺含义尚未确认，不能称为已测得的包覆线。页面保留三种配置，供核对差异：

| 配置 | 用途 | 限制 |
| --- | --- | --- |
| 纸样下方铅笔参考线 | 默认演示保留区与底部排除带 | 参考线是否就是实际包覆边界，待实物确认 |
| 完整原裁片／不排除鞋底区域 | 核对全部原始纸样身份、轮廓及孔位 | 含实际成鞋中可能被鞋底遮挡的材料 |
| 照片推断鞋底包裹线 | 诊断旧照片配准对边界的影响 | 不是工厂测得的裁切或绷帮尺寸，不作为生产依据 |

底部排除精确裁切网格，不移动原纸样顶点。排除区以单独参考带保留。切换配置会重置播放并更换可见索引集合；一次动画内部索引不变。

## 页面操作与导出

入口为 `detachable-side.html`，独立预览目录为 `onward-side-unfold/`。

- 播放、暂停、拖动过程条，或逆向装回；阶段按钮可直接检查拆离、展开和平铺状态。
- 单指旋转、双指缩放，二维与三维轻点对应选点；“纸样朝向”用于从纸样一侧观察三维面片，不镜像或剪切真实几何。
- 可显示校正纸样照片、结构线、三角网格、观测／推定区域和底部排除带。
- “原连接件参考”默认关闭。它只是从原 AI 鞋模选择的可见表面片，用于对照原位置，不证明 PU 公母扣、背面或裁切结构已恢复。
- 网页 SVG 和 JSON 导出使用当前选择的底部配置。预生成 GLB 与 Blender 工程固定为生成时的默认配置，下载标签已标明；不能将其他配置的网页状态误认作该 GLB 的状态。

## 文件与可追溯性

| 文件或目录 | 内容 |
| --- | --- |
| `src/detachable-side-panel/` | 独立 Three.js 场景、构形求值、播放、选点与页面控件 |
| `modeling/detachable-side-panel/` | 构形生成、方向稳定、原模型表面筛选与可编辑工程导出源码 |
| `public/detachable-side-panel/panel-data.json` | 原始身份、毫米坐标、构形样本、裁切来源、替换遮罩及假设 |
| `public/detachable-side-panel/panel-validation.json` | 当前生成构形的数字诊断 |
| `public/detachable-side-panel/verification/` | 独立验收报告、实际网页截图与过程记录 |
| `public/detachable-side-panel/detachable-side.glb` | 保留鞋体、独立侧片和连续形态键动画；默认底部配置 |
| `public/detachable-side-panel/detachable-side-editable.blend` | 可编辑网格、形态键、动画与内嵌 JSON 源数据 |
| `public/detachable-side-panel/editable-export-validation.json` | 可编辑资产大小、哈希、来源及导出记录 |

GLB 的 `_PAPER_VERTEX_INDEX` 自定义顶点属性用于把法线分裂后的导出顶点映射回 `panel-data.json`；`_PAPER_X_MM`、`_PAPER_Y_MM` 保存二维参考。鞋模坐标仍是未独立标定的模型单位，毫米纸样到模型的比例只用于统一显示。它不构成成鞋实测尺寸。

源纸样、V10 模型、生成数据和导出资产各有 SHA-256。判断报告是否适用于当前资产，应核对其 `panelDataSha256` 与实际 JSON 文件；不能用旧构形的通过记录替代新构形验收。

## 重新生成与运行

在仓库根目录执行。需要项目 Node 依赖、含 NumPy／SciPy 的 Python，以及支持 glTF 导出的 Blender。`blender` 不在 PATH 时换成实际可执行文件路径。

```bash
python3 modeling/detachable-side-panel/build_panel.py

# 可单独重跑构形方向稳定；身份与输出哈希匹配时跳过重复处理。
python3 modeling/detachable-side-panel/stabilize_crease.py

# 用已保存的原始候选表重复可见性筛选，再导出可选连接件参考。
python3 modeling/detachable-side-panel/filter_hardware.py --candidates public/detachable-side-panel/hardware-visibility.json
node modeling/detachable-side-panel/export_hardware.mjs

blender -b -t 4 --python modeling/detachable-side-panel/export_blender.py
npx tsc --noEmit
node scripts/build-detachable-side-preview.mjs /tmp/onward-detachable-side-preview ./
```

`build_panel.py` 会调用方向稳定阶段；其失败时应先处理几何问题，不继续把失败构形打包交付。`filter_hardware.py` 的候选列表保存在已提交的 `hardware-visibility.json` 中，便于重复筛选；它不生成隐藏扣件。

在另一个终端启动静态服务器：

```bash
python3 -m http.server 4330 --bind 127.0.0.1 --directory /tmp/onward-detachable-side-preview
```

然后检查实际构建页面：

```bash
node scripts/check-detachable-side.mjs http://127.0.0.1:4330/detachable-side.html
```

`--static-only` 只运行静态几何检查；`--video` 在完整检查后记录真实网页网格的过程帧并编码视频，依赖 FFmpeg。过程视频逐帧采样，不代表实机实时帧率。

发布到已有仓库的独立 Pages 前缀时，将构建命令最后一个参数改为 `/soulgrain-onward/onward-side-unfold/`，只追加该目录；不覆盖已有预览，不合并 main。

## 验收结论的范围

验收分别检查原坐标与 ID、裁切边界和面积守恒、统一平面变换、同一网格与索引、重复往返漂移、相邻姿态的局部塌陷、源模型移除遮罩、双向选点、触控及真实下载文件。最终数量与误差以同哈希报告为准，避免文档保留过期数字。

平铺终点可以与当前数字化纸样数值一致，但原纸样仍有照片标定和描边误差。主伸长范围是相对暂定显示比例的几何诊断，不是实物材料应变；连续区间的无秩塌陷判据也不证明没有自相交或穿透。

当前未完成真实材料定律、接触／自相交、缝制／绷帮及实际包覆边界验证。Linux Chromium 的软件 WebGL、触控模拟和录制结果不等同于 iPad Safari 实机测试，也不能保证 iPad GPU 帧率。本成果用于构形及定位研究，未达到可直接生产的工程确认状态。
