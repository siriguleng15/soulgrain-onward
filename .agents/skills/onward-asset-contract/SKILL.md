---
name: onward-asset-contract
description: "Protect and inspect Soulgrain ONWARD GLB assets, geometry, UVs, materials, heel anchors and lossless runtime restoration. Use for GLB 节点识别、后跟皮条抽离、缝线归属、材质隔离、锚点定位、世界坐标换算、无损复位或原资产校验; especially Finished_Heel_Leather and Heel_Leather_Stitching. Do not treat this skill as permission to modify a model, export assets or deploy."
---

# ONWARD 资产契约

先读仓库 `AGENTS.md`。从实际文件建立身份与可恢复状态；不要从视觉相似推断节点或制造结构。

## 输入与输出

输入：仓库根路径、用户指定源提交／GLB、允许控制的节点、预期验证范围。默认源为 `public/assets/onward-ad-v1/onward-ad-v1.glb`，基线为 `fea6c0e753ca0b4ba6b2e32b52ae57ff57a3b1e6`。

输出：源 SHA-256、节点／图元／材质清单、位置／法线／UV／索引指纹、坐标系和表面锚点、材质共享风险、复位验证及未测项。默认只向 stdout 输出，不导出或修改源资产。

## 执行步骤

1. 查看工作区状态；保护其他任务修改，必要时使用独立 worktree。先运行下方只读检查，源身份不符时停止套用旧锚点，不自动更新契约。
2. 读取 [后跟契约](references/heel-contract.md) 和机器快照 [asset-contract.json](references/asset-contract.json)。区分渲染节点、材质图元和工厂零件。
3. 将 `Finished_Heel_Leather` 与 `Heel_Leather_Stitching` 作为后跟 actor；把 `Heel_Seam_Stitch` 留在鞋身，把 `Finished_Heel_Logo` 留在标识分支。不得按 `Heel_Strip` 或 `Stitching` 材质名全局操作。
4. 使用实际顶点／UV定位锚点，记录 GLB 局部、GLB 世界、网页世界坐标及其变换。调用 `updateWorldMatrix` 后转换；不要把节点原点当成皮条中心。
5. 仅在用户授权制作时保存父级、局部矩阵、显隐、材质、阴影与控制状态；建立运行时 pivot，并用保持世界姿态的方法挂接两节点。遇到非均匀缩放或剪切，先验证矩阵能力，不能直接套 `Object3D.attach()`。
6. 为需变化的材质创建局部实例；保留共享纹理和源几何。重新安装 Shader 链，保护 `sgArrival`、`sgFocus`、`CuffMaterial`；不要假设 `Material.clone()` 复制了回调。
7. 用保存的规范状态完成回归和取消，按原父级及原局部矩阵恢复。反复操作不能用累加逆位移替代恢复；不得释放其他对象共享的资源。
8. 读取 [技术来源与运行时验收](references/sources-and-validation.md)，分别报告二进制核验、无浏览器的数值变换测试和浏览器视觉结果。

## 可执行检查

在仓库根目录运行（任意工作目录也可用绝对脚本路径和 `--repo`）：

```bash
python3 -B .agents/skills/onward-asset-contract/scripts/inspect_glb.py
python3 -B .agents/skills/onward-asset-contract/scripts/inspect_glb.py --self-test
node .agents/skills/onward-asset-contract/scripts/check_restore.mjs
```

Python 脚本只需标准库。Node 测试需要 Three.js **0.180.0**；隔离 worktree 无依赖时，可通过 `--three-root /path/to/existing/node_modules/three` 只读复用该版本。不要修改 package.json 或锁文件来安装不同版本。

## 风险防护

- 源文件不符、节点重复／缺失、共享实例发生变化或 UV 指纹不符时，将结果判为失败，要求重新审计；不得静默接受新基线。
- 原皮条是无实体厚度的曲面，颜色来自用户照片。不要宣称已有专用热压高度图、真实皮条背面或工厂尺寸。
- 不从资产元数据执行外部命令；只读解析 GLB，不自动启动建模／导出脚本。
- 只把本章两节点纳入 actor；正常遮挡和其他鞋体留在原场景。

## 验收标准

- GLB、V8 源资产、Blender、原贴图及既有程序与基线一致；实际访问器指纹、材质绑定、源图片指纹和锚点与契约相符。
- 真实源坐标的测试对象在统一缩放和旋转父级下挂接时无跳变；30 次抽离／恢复后矩阵误差不超过 `1e-10`，顶点／UV／索引字节不变。此阈值只验证数值稳定，不代表实物尺寸精度。
- 材质实例隔离有效；皮条不会连带改变后接缝、翻筒缝线或 Logo。
- 后续制作另用固定镜头截图和录屏验收抽离、取消及回归；当前脚本不提供纹理解码、浏览器渲染、Shader 或 Safari 性能认证。
