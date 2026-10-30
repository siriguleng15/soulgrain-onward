# SoulGrain ONWARD · 沉浸展示资产核验

核验日期：2026-10-29。只读取现有 GLB、Blender 工程说明、Three.js 代码及历史实际渲染截图；没有改写模型、UV、纹理或 Blender 工程。

## 可直接用于 Nightfall 的资产

| 资产 | 文件大小 | GLB 实际三角形 | 节点／图元 | 纹理与动画 | 用途判断 |
| --- | ---: | ---: | --- | --- | --- |
| `public/assets/soulgrain_onward_finished_v8.glb` | 26,661,468 B | 463,512 | 26 节点，40 个材质图元 | 25 材质，20 纹理引用／9 张嵌入图片；20 图元有 `Shaft_Upright`，无动画剪辑 | 已确认的彩色成品外观，适合整鞋、材质及部位聚焦；保留既有形态端点 |
| `public/assets/onward-ad-v1/onward-ad-v1.glb` | 23,873,476 B | 463,512 | 29 节点，42 个材质图元 | 25 材质，20 纹理引用／同 9 张图片；无 glTF 形态键／剪辑，另带周向形变参数 | 以 V8 原表面为基础的广告派生，适合复用已完成的连续翻筒演示 |
| `public/assets/soulgrain_onward_refined_v9.glb` | 45,653,900 B | 1,046,119 | 26 节点，29 材质图元 | 17 纹理引用，9 图片，无形态键／剪辑 | 换底模后的外观研究，负载明显更高，不能把旧 V8 展开形态套上去 |
| `public/reference-model-v10/corrected.glb` | 5,659,668 B | 240,480 | 5 节点／图元 | 2 中性材质，无 UV 图片、形态键或剪辑 | 最新工程几何参考，不是已经恢复 Nightfall 外观的成品资产 |
| `public/detachable-side-panel/detachable-side.glb` | 7,579,632 B | 187,157 | 6 节点，5 实际网格图元 | 无贴图；独立侧片 16 个展开目标，有 1 个动画剪辑 | 已确认的真实纸样工程研究；适合定位／展开审核，不替代彩色产品展示 |

图元数量来自 GLB `meshes[].primitives[]`，三角形由实际索引访问器计数。旧说明中的“原面片 235,040”属于生成／源工程计数，不能当作当前导出 GLB 的绘制三角形预算。节点、材质图元与独立工厂零件也不是同一概念。

V8 SHA-256：`9d28c469089cb039fd17393db7e84d7c46def77db4eeb04aa05deed8a32c6f63`。

广告派生 SHA-256：`1d8b8433fffe61a57be644d50270c935b4ffcd2f26776105540ec05c078121c4`。

V9 SHA-256：`91aba2e587c694f9cee14e340e45eabf808507b9182c380b963a71d1ffdae843`。

V10 SHA-256：`39c1c014975b983df9489e1d4a5b1bbe872eb829d5848e3970b47e04ab8ea142`。

已确认拆片工程 SHA-256：`b3a8a509ea68b81385b72880bc43c0d07d7dbdc8332451cfd53e0e595b9fd34e`。

推荐主展示使用已确认 V8 外观或其广告派生，在新运行时升级灯光、镜头、粒子和界面。不能因为 V10 更新，就把其白模默认为已有完整商业材质；也不能无提示地把 V8 材质强套到不同拓扑。

## 坐标与部位定位

V8 和广告派生均为 glTF Y 向上，现有节点没有额外平移／旋转／缩放。静止边界约为：

- X：`-0.1297524 … 0.13589324`，长度约 `0.26564564`。
- Y：`-0.02056128 … 0.11721765`。
- Z：`-0.05804039 … 0.04504696`。

这是模型单位及显示尺度，不构成实物鞋号认证。旧广告镜头起点 `(-0.24,0.18,0.48)`，观察目标 `(0,0.065,0)` 可作为坐标调试参考；商业画面应在实际屏幕中重新构图。

建议按节点 `userData.part` 或广告节点 `userData.adActor` 选择部位，避免只用重复的 mesh primitive 名称。

| 产品部位 | 可用节点／材料 | 可直接支持 | 需要避免的表述 |
| --- | --- | --- | --- |
| 翻筒 | V8 `Convertible_Shaft`；广告 `AD_Cuff_Shell`、`AD_Garment_Binding`、`AD_Garment_Stitching`；`Collar_Canvas`、`Collar_Outer_Canvas` | 布料特写、绗缝、原纹样、广告已有连续展开 | 不把广告曲率释放称作已标定布料物理／真实裁片制造过程 |
| 鞋舌 | `Convertible_Tongue`，`Tongue_Canvas`／`Tongue_Reverse_Canvas` | 原正反贴图、绒面特写、V8 原形态端点 | 广告派生没有独立鞋舌铰链／现成翻舌动画，不能声称已有真实独立拆舌结构 |
| 蒙古纹样鞋身 | `Shoe_Body`、`Original_Vamp`；`Body_Canvas`／`Body_Inner_Canvas` | 原图案与帆布特写，灯光／镜头强调 | 不重绘图案、不虚构未知印花工艺或材质测量 |
| 双扣连接 | `Mongolian_Clasp_Heads`、`Mongolian_Clasp_Loops`；`Clasp_Engraved_Head`／`Clasp_Cream_Cord` | 原扣头特写、现有扣袢形变、局部高光 | 当前彩色 V8 是双绳扣袢与布端，不等同于之后工程研究的两段扁平 PU 四合扣；不得混称 |
| 后跟皮条 | `Finished_Heel_Leather`、`Heel_Leather_Stitching`；`Heel_Strip` | 原红白回纹、缝线及反射扫描 | 回纹主要来自照片纹理，不冒称微距精雕／实测热压凹凸 |
| 鞋带头 | `Finished_Lace_Aglets`；`Aglet_Artwork`／`Hardware_Silver` | 已有展开图映射、金属端帽与圈、高光旋转 | 纹理精度受原图和 UV 限制，不能捏造新雕刻图案 |
| 后跟标识 | `Finished_Heel_Logo`；`Heel_Logo` | 原 Logo 图片及实网格聚焦 | 不替换品牌图形、不重写未知蒙文 |
| 烫钻 | `Tongue_Rhinestone_Medallion`、`Tongue_Border_Studs` | 真实切面网格、已有 785 近似石位、克制闪点 | 材质为金属／粗糙度近似，不是已测水晶 IOR／色散；石位来自原排钻图，不是制造检测 |

## 真实材质条件与已知缺陷

现有彩色 GLB 使用标准 metallic/roughness PBR、`KHR_texture_transform`，V9 另有 IOR／specular 扩展；V8 没有现成的 transmission、clearcoat 或 anisotropy 测量材质。可通过摄影棚环境与特写改善感受，不应以参数名称冒充真实材料测试。

| 嵌入图片 | 尺寸 | 文件内大小 | 事实 |
| --- | --- | ---: | --- |
| `Neutral_canvas_weave` | 128×128 RGB PNG | 473 B | 所有像素通道均为 0；不是合法的中性切线法线 |
| `02-body-print` | 1254×1254 JPEG | 306,127 B | 用户提供鞋身印花 |
| `cuff-reconstructed` | 1254×1254 PNG | 4,657,266 B | 既有照片重建的重复织物，非原工厂花稿 |
| `tongue-velvet-reconstructed` | 1254×1254 PNG | 3,300,265 B | 既有绒面重建纹理，非材料扫描 |
| `07-tongue-front-back` | 1280×853 JPEG | 233,316 B | 鞋舌文字与正反面参考图 |
| `01-overall` | 1280×895 JPEG | 232,016 B | 原整体图，部分饰边与扣头局部映射来源 |
| `04-heel-leather` | 590×1280 JPEG | 148,964 B | 后跟红白回纹及纹理参考 |
| `09-heel-logo` | 1280×640 JPEG | 93,150 B | 原鞋底后跟 Logo |
| `06-aglet-artwork` | 703×1280 JPEG | 120,823 B | 鞋带头展开图 |

已核对 `src/advertising/scene/StudioMaterials.ts`：运行时仅替换名称及尺寸匹配的坏法线图片，生成 128×128 向外织物法线，保留颜色图、UV、纹理变换和原文件。新展示必须复用这个缺陷修复；增加亮光无法纠正法线翻入造成的布面发黑问题。它影响 9 个现有材质，不应无条件替换所有贴图。

建议不改原图片和原 GLB：保留原色与图案；渲染运行时可克制地使用光照、环境反射、局部粗糙度或已有金属参数突出材料。若升级为 MeshPhysicalMaterial，sheen／clearcoat／IOR 只能标为呈现参数，不得宣称工厂实测。微距需要尊重源图 1280px 左右的细节上限，不用虚假的超细浮雕替代原稿。

## 可以复用的工程

| 代码 | 可复用内容 |
| --- | --- |
| `src/advertising/scene/AdScene.ts` | GLTFLoader、环境反射、PBR 灯光、原资产保护、阴影、画质档位、WebGL 上下文恢复 |
| `src/advertising/scene/StudioMaterials.ts` | 已验证的黑法线修复及方向校验 |
| `src/advertising/scene/CameraRig.ts` | 透视相机、轨道控制、缩放边界、当前状态捕获、构图偏移 |
| `src/advertising/narrative/Narrative.ts` | GSAP 单次叙事、取消令牌、最后请求接管、返回父节点／整体 |
| `src/advertising/interaction/PartInteraction.ts` | 点选和拖动区分、多指过滤、真实射线交互 |
| `src/advertising/geometry/CuffCurve.ts`／`CuffMaterial.ts` | 广告派生的原周向→展开曲率场、对应法线与深度／阴影变形 |
| `src/advertising/tree.ts`／`ui/AdUI.ts` | 既有 ROOT→翻筒完整分支与扩展目录；B–H 尚非完整演出 |
| `src/model-review/ReviewScene.ts`／`src/design-lab.ts` | 原 V8 `Shaft_Upright` 驱动与材料区选择 |

广告数据 `public/assets/onward-ad-v1/cuff-structure.json` 保存 256 个周向采样、原弧长、缝线、角色、V8 提交与 SHA。其 `adActor` 将外翻翻筒／边饰／上鞋眼／绗缝与固定鞋体分开，`Mongolian_Clasp_Loops` 是扣袢 actor。这个变形分区是广告表达，不是工厂可拆卸件认证。

## 新展示的性能取舍

- 主展示只保留一只鞋；静止场景实际约 46 万三角形、40–42 个材质图元，不为粒子复制整套模型。
- 粒子可离线或加载后只抽样现有表面顶点／三角形，保留原几何不变；着色器仅让点在空间聚散。
- 9 张图片的压缩尺寸与运行时 GPU 内存不同；小于 27MB 下载不代表只有 27MB 显存。多数图片约 1.6M 像素，mipmap／纹理变换克隆会增加开销，应关注实际纹理对象与共享。
- 当前没有 KTX2／Draco／Meshopt 压缩扩展；压缩应另做派生展示资产并逐项比较几何／UV，而不是覆盖确认源文件。
- 先复用受限 DPR、按需阴影、后台暂停、减少动态偏好和低性能档位。粒子与后期效果可降档，部位点击和触控不能因降档失效。
- 从实际软件 WebGL 截图确认材质和构图；软件环境不代表真实桌面 GPU 或 iPad Safari 帧率。

## 外观与来源边界

已查看历史 V8 Blender 三分之四渲染与广告修订版浏览器 ROOT 截图：两者均有深蓝白色蒙古纹样鞋身、蓝色翻筒、紫色鞋舌背／钻饰、米白鞋底及红边。它们是现有彩色资产的证据，不是本轮新网页的效果证明。

V8 基础鞋体历史来源为 theunclerulez 的 [Generic “Converse style” Sneakers](https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244)，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。SoulGrain 图案和产品参考由用户提供；保留此前署名入口。V9 用户新底模的来源不能沿用旧基础鞋体作者作不实归属。

可追溯的既有说明：`modeling/finished-shoe-v8/README.zh-CN.md`、`modeling/interactive-ad-v1/README.zh-CN.md`、`modeling/refined-shoe-v9/README.zh-CN.md`。当前审计的原始二进制读取和图片像素统计保存在执行环境 `/tmp/onward-showcase-assets-audit.json`，不把临时缓存当作版本库交付。
