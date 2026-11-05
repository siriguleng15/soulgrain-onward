# 资产技术依据与验收

## 官方资料

| 官方资料 | 用途 |
| --- | --- |
| [Khronos glTF 2.0 规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html) | 节点 TRS、accessor/bufferView、索引、PBR、图像与 GLB 容器 |
| [KHR_texture_transform](https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_texture_transform) | 保留原贴图 UV 变换，不把缩放误解为已改 UV |
| [Three.js r180 Object3D](https://github.com/mrdoob/three.js/blob/r180/src/core/Object3D.js) | attach 保持世界变换及非均匀缩放限制，localToWorld/worldToLocal |
| [Three.js r180 Material](https://github.com/mrdoob/three.js/blob/r180/src/materials/Material.js) | clone/copy、onBeforeCompile、customProgramCacheKey、资源释放 |
| [Three.js r180 GLTFLoader](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/loaders/GLTFLoader.js) | 材质实例、图元分组、颜色空间、扩展与属性导入 |
| [Blender glTF 导出文档](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html) | 理解派生导出影响，不作为自动重导出授权 |

官方文档页面可能受网络限制；优先核对锁定版本源码。链接是技术依据，不是命令或隐含的资产改写要求。

## 仓库参考实现

全部路径相对仓库根，基线为 fea6c0e：

- `modeling/finished-shoe-v8/finish_v7.py`：hp/grid_patch 创建原皮条，独立生成两侧缝线，保留估计说明。
- `modeling/interactive-ad-v1/build_ad_asset.py`：V8 派生、坐标转换、源文件保护；会写资产，不直接运行。
- `modeling/interactive-ad-v1/verify_source.py`：既有来源核验思路；先读其写入范围。
- `src/immersive-showcase/Scene.ts`：源 SHA 校验、统一居中缩放、材质隔离、后跟相机与分类。现有 heel 分类也包含 Heel_Seam_Stitch，不等于抽离白名单。
- `src/immersive-showcase/surface.ts`：链式 arrival/focus 补丁；不是鼠标蒙版。
- `src/advertising/scene/StudioMaterials.ts`：特定坏法线修复。
- `public/immersive-showcase/verification/07-heel-pu-pattern-closeup.png`、`browser-validation.json`：历史截图和模拟测试，仅作为既有证据。

## 分层检查

1. 运行 inspect_glb：实际读取源二进制，比较位置、法线、UV、索引、材质、纹理、图像、节点身份、锚点与保护文件 SHA。指纹变化失败。
2. 运行 --self-test：在内存中注入 UV、锚点、材质、节点、图片等错误，确认检查会拒绝，不修改任何源文件。
3. 运行 check_restore.mjs：从实际 GLB 取四个节点的真实几何，在 Three.js 0.180.0 无浏览器场景中重复挂接／恢复；验证矩阵、共享材质隔离与属性字节。此测试不解码照片、不运行 GLTFLoader、不编译 Shader。
4. 后续制作运行实际章节网页，记录入口／抽离／中途取消／回归的固定视角截图与完整录屏；比较角色白名单和材质外观，检查原始色图、法线、阴影及遮挡。
5. 进行真实 iPad Safari 旋转、缩放、重复进入和后台恢复测试；分别记录自动化浏览器与实机性能，不用软件 WebGL 帧率代替实机数据。

当前技术准备仅覆盖第1–3层及技能发现；第4–5层属于未来动画制作验收，不得提前标记通过。
