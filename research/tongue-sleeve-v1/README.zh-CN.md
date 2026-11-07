# 鞋舌 × 马蹄袖：用户新手模资产准备 V0.1

当前完成的是用户最新指令要求优先处理的资产阶段：清理原鞋舌翻面、拆出马蹄袖且保留袍袖、在马蹄袖外表面中间绑定银色纹样。增加了可操作检查台、用户手模的手指骨骼与表面绑定验证。**没有把这些测试称为已经完成19秒鞋舌章节。**

## 隔离范围与来源

- 新工作区 `/workspace/tongue-sleeve-lab-v1`，分支 `feat/tongue-horseshoe-sleeve-v1`，基线 `0bbbc8245ef574b73be3e7a7f842190e5af9277a`。既有后跟实验室保留。
- 原鞋模 `public/assets/onward-ad-v1/onward-ad-v1.glb`，SHA-256 `1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4`。
- 用户本次提供 `hand modle.glb`，原样保存在 `public/tongue-sleeve-lab/assets/user-hand-original.glb`，SHA-256 `9608397f034b054b914c78f7bbf2a01404496045f2fc37d55efadf027c3b7637`。
- 保护的其他任务工作区 `/workspace/soulgrain-onward`：原未提交修改、index、分支和9项文件指纹，共14项检查未变。报告见 `public/tongue-sleeve-lab/verification/worktree-protection.json`。
- 未推送、未部署、未修改正式页、原 GLB、原 UV、原纹理、旧后跟动画和源 Blender 工程。

## 当前可审核结果

1. **鞋舌仍在，清理只针对翻面颜色。** `Convertible_Tongue` 的第0图元 `Tongue_Reverse_Canvas` 独立换成素布材质。此节点还包括另两种图元，因此不能整节点删除。源鞋的所有顶点、法线、UV、索引和图片 BIN 数据逐字节保留。原银钻／旧边饰仅从章节初始显示场景移入参考场景，节点和几何仍在派生 GLB 内。
2. **用户手模分为手、袍袖、马蹄袖。** 输入是103,488顶点、206,972三角面的连通闭合静态表面，无骨骼、UV和动画。沿袖口几何曲率拟合切口，只细分跨切口三角面；三个外表面部分共同覆盖原表面。导出Float32后的逐源三角面面积覆盖相对误差约 `1.58e-6`。这是数值核验，不是工厂裁缝精度。
3. **拆袖后保持穿袍。** 原模型没有记录被马蹄袖遮住的独立袍袖内层。新建 `Robe_UnderCuff` 布面连接两侧切口，明确标为重建遮挡区域，未把它误做裸皮肤。其褶皱和真实缝制结构仍需动作时检查。
4. **完整圆形纹样已贴在真实袖面。** 复用与用户本次银色图案视觉一致的仓库参考08及其785个已读取钻位，含内部几何图案，校准约75mm外径。每颗为独立实例的切面几何，有持久ID和实际三角面重心坐标，不是白底图片方片。785是图像读取数量，不宣称实物工厂数量。位置按用户“大概对应”图放在袖子外表面中间，后续装鞋时仍需调位。
5. **手指骨骼是给用户原手建立的。** 新建22关节，手部 POSITION 与索引和拆分后的原手逐字节相同。使用沿网格的测地距离分指与关节平滑权重，不用另一裸手替换。可检查五指弯曲、复位和重复操作；这尚不是已验收的真实捏取、摊掌或响指动作。
6. **同一套银钻可跟随袖面实际弯曲。** 检查台提供有限幅度弯曲，用来验证位置、法线、钻石大小、偏移与复位；没有把该测试当作完整翻袖。修复了场景归一化缩放后钻石在更新时缩小的问题。袖面actor限定统一缩放，布料形变必须修改真实几何。
7. 用户新图已记录在 `final-tongue-design.json`：约158×103mm、银钻约75mm、上下水晶区域。`final-tongue-outline.svg` 是人工视觉描摹，用于后续对齐，**不是原始生产矢量，也不是已完成的装鞋建模**。未把红色辅助线、尖形标记、网格或尺寸线加到产品上。

## 文件与使用

- `tongue-sleeve-lab.html`：独立 Three.js 检查台，可旋转、缩放、切换原始／组装／拆袖／单独袖面、调整手指和袖面测试。
- `public/tongue-sleeve-lab/review.html`：实际截图、H.264操作录屏与派生GLB下载。
- `public/tongue-sleeve-lab/assets/shoe-tongue-blank.glb`：保留原鞋舌几何、清空翻面颜色的派生鞋模，约24MB。
- `public/tongue-sleeve-lab/assets/user-hand-cuff-prepared.glb`：便于单独审阅的手、袍袖、独立马蹄袖、银钻与22关节骨骼。银钻作为马蹄袖子对象；运行时弯曲绑定以专用JSON为准。
- `modeling/tongue-sleeve-lab/user-hand-cuff-prepared.blend`：可编辑分离网格、用户手蒙皮、银钻对象，保留未蒙皮手作为隐藏参考。
- `user-hand-parts.glb` + `user-hand-rig.glb` + `cuff-medallion-bindings.json`：检查台实际加载的派生组件。不得把Blender重新导出后的重排索引直接配旧绑定JSON，需重新绑定和验证SHA。
- `src/tongue-sleeve-lab/SurfaceBinding.ts`：稳定三角面绑定，支持 Three.js 的 CPU morph/skin 顶点求值；拓扑身份变化会报错。
- `src/tongue-sleeve-lab/ChapterContract.ts`：19秒分镜与14.5秒水晶触发的纯时间契约，**当前未连接成品演出**。

本地运行（依赖为仓库锁定的 Three.js 0.180.0、Vite、TypeScript；已有依赖时无需安装）：

```bash
cd /workspace/tongue-sleeve-lab-v1
node scripts/build-tongue-sleeve-lab.mjs
node node_modules/vite/bin/vite.js preview --config vite.tongue-sleeve-lab.config.ts --host 0.0.0.0 --port 4543 --strictPort
```

打开 `http://localhost:4543/tongue-sleeve-lab/review.html` 或 `http://localhost:4543/tongue-sleeve-lab.html`。这只是本机地址，**不是iPad可远程访问的HTTPS发布链接**；本轮遵守不部署要求。输出目录独立为 `/tmp/tongue-sleeve-lab-v1-build`，不会重建原正式站。

## 可重复制作与验证

所有制作脚本只读取源文件，写入本章节派生路径。Python制作／几何检查依赖numpy/scipy；GLB源审计只需标准库。

```bash
python3 -B scripts/audit-tongue-sleeve-assets.py
python3 -B modeling/tongue-sleeve-lab/build_parts.py
python3 -B modeling/tongue-sleeve-lab/bind_medallion.py
python3 -B modeling/tongue-sleeve-lab/build_hand_rig.py
python3 -B modeling/tongue-sleeve-lab/build_blank_shoe.py
python3 -B scripts/check-tongue-sleeve-assets.py
node scripts/check-tongue-sleeve-contracts.mjs
node scripts/check-tongue-prepared-hand.mjs
node scripts/build-tongue-sleeve-lab.mjs
node scripts/check-tongue-sleeve-browser.cjs
python3 -B scripts/record-tongue-sleeve-assets.py
```

编辑工程重建（仅保存新派生项目）：

```bash
/workspace/blender-install/blender-5.2.2-linux-x64/blender --background --factory-startup --disable-autoexec --python modeling/tongue-sleeve-lab/save_editable_blend.py
```

实际检查结果在 `public/tongue-sleeve-lab/verification/`：源二进制与逐面覆盖、手指重复30次复位、袖面正反拖动的钻石身份／尺寸／贴合、WebGL上下文恢复、单画布、加载失败提示、iPad模拟触控拖转、移动布局。**不是iPad Safari实机测试，不是已经完成的抓取接触动画验收。** 弯曲测试CPU更新在Linux记录中最高约27–28ms，后续完整布料动画应考虑预烘焙形变或GPU驱动，不能据此保证iPad上的完整章节帧率。

## 后续动画仍需完成

- 新参考轮廓在装鞋／抬平两种状态中的贴合与尺寸校准；本轮按用户最新优先级保留原鞋舌，只清图。
- 捏取、摊掌、抽手、响指的接触姿态和拇指精修；现有FK权重未等同真实接触。
- 适合原马蹄袖结构的连续翻折／展平形变。现有扫描式高密度三角面可以做有限弯曲，但未制作能穿过手背又保持图案朝向的翻袖缓存或Shape Keys。需要新建派生形变／必要的局部重拓扑，不能仅绕轴旋转或淡入淡出交差。
- 同一套银钻随同一袖面留下，再在14.5秒之后只改变非银钻布面；当前并未生成蓝色晶体布，也不会以普通金属蓝代替。
- 章节相机、19秒可逆时间轴、手指与鞋舌双向约束、最终状态保持和七个实际分镜验证画面。

没有需要用户再次上传的原手模或已收到参考图。上述缺项是后续制作工作，不把它们归因于用户缺少文件。

## 技术依据

- Three.js r180：[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)、[SkinnedMesh](https://threejs.org/docs/#api/en/objects/SkinnedMesh)、[InstancedMesh](https://threejs.org/docs/#api/en/objects/InstancedMesh)、[MeshStandardMaterial](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)、[OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)。实际代码使用库内`Mesh.getVertexPosition()`以包含morph/skinning。
- Khronos [glTF 2.0规范](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)：多图元、skin、逆绑定矩阵、访问器与二进制分离。
- Blender [glTF导入导出](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)、[Armatures](https://docs.blender.org/manual/en/latest/animation/armatures/index.html)、[Shape Keys](https://docs.blender.org/manual/en/latest/animation/shape_keys/index.html)。本轮只导入／保存独立新工程，无源项目覆盖。
- 仓库已验证的 `src/advertising/scene/StudioMaterials.ts`：只在运行时修复已知黑色法线图，素布保留正常PBR响应。
