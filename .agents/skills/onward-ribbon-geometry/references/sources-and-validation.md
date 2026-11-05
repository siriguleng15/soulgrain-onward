# 带状几何技术依据与验收

## 官方资料及仓库参考

| 来源 | 应借鉴的内容／限制 |
| --- | --- |
| [Three.js r180 Curve](https://github.com/mrdoob/three.js/blob/r180/src/extras/core/Curve.js) | 弧长采样、缓存、坐标架；显式处理开放路径与尖点 |
| [Three.js r180 BufferGeometry](https://github.com/mrdoob/three.js/blob/r180/src/core/BufferGeometry.js) | 索引、动态属性、包围体、法线与 drawRange；drawRange 本身不是连续生长 |
| [Three.js r180 CurveModifier](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/modifiers/CurveModifier.js) | 曲线纹理和帧采样参考；其 Shader 回调和闭合参数不能直接覆盖项目材质 |
| [Three.js r180 LineBasicMaterial](https://github.com/mrdoob/three.js/blob/r180/src/materials/LineBasicMaterial.js) | WebGL 线宽限制，矩形轮廓需要可控面状边框时不能依赖 linewidth |
| [Khronos glTF 2.0](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | 保留原 accessor、UV、法线和材质含义 |
| [Blender glTF 文档](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) | 若未来确需独立派生 GLB，核对导出、坐标、法线及贴图，不覆盖源文件 |

仓库路径相对根目录：

- `src/advertising/geometry/CuffCurve.ts`：曲线数据及连续更新，只借鉴机制。
- `src/advertising/geometry/CuffMaterial.ts`：对应法线、深度与阴影补丁；不是通用后跟变形器。
- `src/immersive-showcase/CameraDirector.ts`：相机唯一控制、从当前姿态开始。
- `src/immersive-showcase/Scene.ts`：统一缩放、DPR、活动／停留帧率；未来需登记本章活动状态。
- `modeling/finished-shoe-v8/finish_v7.py`：真实源皮条生成参数与独立缝线。

版本依据：package-lock.json 锁定 Three.js 0.180.0。官方页面不能访问时核对 r180 源码，不声称已阅读不可访问的内容。

## 技术准备可执行验证

check_spec.py 使用标准库，默认读取 ribbon-spec.json 并检查源资产、两种模式、矩形截面、四边轮廓、独立宽厚、正交初始帧、连续前沿与回归约束。

--self-test 注入圆管／蛇／图片、错误源 SHA、排除节点、负厚度、无单位、零路径、平行坐标轴、错误生长方式及缺失模式，必须拒绝。检查只在内存中进行，不写 GLB，不输出动画。

## 制作阶段必须另验

| 场景 | 方法 | 验收 |
| --- | --- | --- |
| 直线、空间 S 曲线、拐点、近零曲率、反向 | 数值采样及轴向可视化 | 帧正交／单位误差≤1e-6，反向有显式处理，无突然翻面 |
| 两种视觉模式 | 同一参数与相机对照 | 四边轮廓闭合，实体边界重合，宽厚独立，无圆管替代 |
| 生长 | 采样相邻 g 值并录屏 | 前沿与端盖连续，无图元跳步及边框断裂 |
| 回归 | 对照 P_rest 和源数组 | 最大位置误差≤1e-6模型单位，源 UV／几何不变，缝线吻合 |
| 暂停、seek、取消、30次重播 | 同一参数重算对照 | 无累计漂移、旧回调、重复 actor 或相机冲突 |
| 冲刺与 GPU 形变 | 实际渲染截图及完整录屏 | 无 near-plane 截断、阴影脱位、错误裁剪或拾取穿透 |
| 性能及触控 | 固定设备比较源页与本章 | 记录 draw calls、三角形、DPR、帧时间和内存；实机 Safari 单列，不以模拟代替 |

这些门槛是未来制作验收条件，技术准备不将其标记为已通过，也不宣称制造精度。
