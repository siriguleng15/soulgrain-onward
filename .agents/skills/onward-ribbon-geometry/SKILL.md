---
name: onward-ribbon-geometry
description: "Plan and validate Soulgrain ONWARD parametric ribbon geometry: red 3D rectangular-outline and solid-ribbon modes, spatial curves, stable moving frames, width/thickness, explicit twist, continuous growth and return to the exact heel surface. Use for 红色带状表演体、矩形轮廓线条、丝带几何、三维螺旋、扭转、生长或回归原表面; not for round tubes, snake anatomy, static spiral images or permission to animate during preparation-only tasks."
---

# ONWARD 三维矩形带状几何

先读仓库 `AGENTS.md`。先验证资产与几何约束，再按用户本轮授权决定只准备、制作或运行演出。技能存在不表示已经实现动画。

## 输入与输出

输入：源模型契约、可恢复原表面、视觉模式、宽厚及单位、可编辑空间路径、扭转轨道、生长与回归参数、相机安全区、设备预算。

输出：可复查的带状几何规格、原表面对应关系、采样与坐标架方案、检查结果和待验证项。技术准备阶段只输出规格与验证，不新增生产几何、时间线或页面。

## 两种必须支持的视觉模式

- `rectangular-outline`：显示同一带状参数域的矩形边界——两条长边与两个端边；随空间曲线弯曲和扭转。轮廓具有真实三维位置，不能用固定螺旋图片或屏幕装饰线替代。需要可控线宽时，用窄条面或矩形截面边框，而非圆管。
- `solid-ribbon`：填充同一参数域，生成前后面、按厚度构建的侧边与端盖；宽度和厚度独立设置，保留矩形带状感。

让两种模式共用 `s,v` 参数、中心线、坐标架、显式扭转、生长端点及原表面回归映射。改变模式只改变表面／边界呈现，不重设路径和姿态。

## 执行步骤

1. 运行 `$onward-asset-contract` 的只读检查；取得正确皮条节点、锚点、UV 与来源 SHA。读取 [几何方法](references/geometry-method.md)。
2. 明确模式和单位；参考 [有效规格](references/ribbon-spec.json)，填写每项输入。不要把 12mm 四合扣或历史纸样尺寸套到本章皮条。
3. 从原 UV 网格建立可追踪的 `P_rest(s,v)`。保留源网格；需要细分时建立派生对应关系，不改原 GLB。把背面和厚度的广告假设写明。
4. 以弧长采样三维中心线；传播稳定正交坐标架，处理零切向、反向切线和高曲率，显式指定初始宽向。沿帧传播施加可编辑滚转角，不能靠随机旋转制造扭转。
5. 用生长参数连续推进前沿，插值当前端边，并同步侧边／端盖和矩形轮廓。禁止仅用 `setDrawRange` 台阶式增长冒充连续生长。
6. 用明确的空间曲线设计螺旋或冲刺；不得默认把曲线变成 TubeGeometry、蛇头、鳞片、骨骼爬行或预渲染图片。
7. 让回归权重连续收敛到 `P_rest`，使端点、宽向、法线及缝线同时归位；在完全匹配后交回原 actor。暂停／seek 从规范参数重算，不累积顶点位移。
8. 如使用 GPU 形变，同步法线、阴影／深度、包围体和拾取；不要直接复制会覆盖既有 `onBeforeCompile` 的 CurveModifier。
9. 读取 [来源与验收](references/sources-and-validation.md)，按设备实测决定细分与 CPU／GPU；记录相机 near-plane 安全及屏幕覆盖风险。

## 可执行规格检查

```bash
python3 -B .agents/skills/onward-ribbon-geometry/scripts/check_spec.py
python3 -B .agents/skills/onward-ribbon-geometry/scripts/check_spec.py --mode rectangular-outline
python3 -B .agents/skills/onward-ribbon-geometry/scripts/check_spec.py --mode solid-ribbon
python3 -B .agents/skills/onward-ribbon-geometry/scripts/check_spec.py --self-test
```

脚本只校验规格及源资产契约，不创建几何或播放动画。具体运行时网格验收必须在制作阶段另做。

## 风险防护

- 宽度、厚度、边框线宽相互独立；尺寸不足、NaN、无单位、零路径、源 SHA 不符、目标节点不符均失败。
- 防止框架翻面、自穿插、边框开裂、UV 拉伸和端点跳变。开放路径不能强行按闭合环修正帧。
- 保留原始纹样，不无限拉长或补画回纹。长距离演出可用同源纯红，终态恢复原 UV 和原 PBR。
- 不将曲线演出称为真实布料／皮革仿真。没有实测时，厚度和背面是明确标记的广告参数。
- 不争抢相机，不改既有翻筒；进入、取消和返回遵守章节状态机。

## 验收标准

- 两种模式使用同一空间路径及参数域；轮廓包含全部四条边，实体有独立宽厚控制，不以圆管或图片替代。
- 在直线、三维弯曲、拐点、低曲率和显式反向处检查坐标架；轴长与正交误差目标 `1e-6`，无未解释的翻面。
- 生长前沿随参数连续变化；暂停、恢复、seek、重复进入不漂移；轮廓与实体的对应边保持一致。
- 回归原表面最大位置误差目标 `1e-6` 模型单位，UV 和源对象字节不变；该门槛不代表工厂精度。
- 制作阶段提供两种模式及关键中间态的实际截图／录屏，测试快速取消、遮挡、阴影和近裁剪。规格检查通过不等于动画／视觉／性能已通过。
