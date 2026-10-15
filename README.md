# SoulGrain — ONWARD

融合蒙古族传统元素与现代街头表达的运动鞋展示网站。V2 保留五个叙事场景、GSAP 滚动入场、昼夜氛围切换，并在 React Three Fiber 舞台加载仓库内真实三维测试白模（含两只鞋）。两个模式共用同一模型，仅改变环境灯光和背景，不代表最终配色。设计切面中的几何图形仅为抽象材质研究，不代表最终纹样或实物。

## 本地开发

需要 Node.js 22.12+（当前验证环境为 Node.js 24）与 npm。

```sh
npm ci
npm run dev
```

开发服务器默认端口 5173。受限环境如无法写入默认 npm 缓存，可用 `npm ci --cache /tmp/soulgrain-npm-cache`。

```sh
npm run build    # TypeScript 严格检查并生成 dist/
npm run preview # 检查生产产物，默认端口 4173
```

## 导入真实素材

将已获授权的文件放入 `public/assets/`，编辑 `src/product.ts`：

```ts
night: { model: 'assets/onward-night.glb', image: 'assets/onward-night.webp' },
day: { model: 'assets/onward-day.glb', image: 'assets/onward-day.webp' },
```

V2 当前两种模式均指向 `assets/soulgrain_onward_template_white_preview.glb`（约 2.5 MB，无外部纹理）。支持 GLB / GLTF，优先使用嵌入纹理的 GLB；GLTF 的外部纹理和 bin 文件须保持正确相对路径。模型为空、加载失败或不支持 WebGL 2 时显示明确状态，不生成替代产品。`image` 字段暂保留作后续静态预览扩展，V2 不会将图片伪装成 3D。

组件读取整个模型的世界坐标边界，通过父组平移与统一缩放将其居中、最长边规范到 3 个场景单位，不修改 GLB 文件或任何顶点。镜头根据包围球与横纵视场角计算安全观察距离，窗口变化后重新适配；默认三分之四视角可在 `MODEL_DIRECTION` 调整。旋转中心为完整双鞋模型的边界中心。

鼠标/单指旋转、滚轮/双指缩放，禁止平移并限制缩放距离；“恢复默认视角”重置位置和观察中心。3D 画布使用 `touch-action: none`，手指在画布外滚动网页。模型加载中有状态提示，网络/格式错误可重试；WebGL 上下文丢失后停止展示并提供手动恢复。无 WebGL 2 时显示兼容性提示与重试按钮。

细节数据位于 `src/App.tsx` 的 `details`；后续可换为带真实图片、独立模型部件和热点的组件。建议每个部件保留稳定命名（鞋舌、后跟皮条、水晶饰布、鞋带头等），以支持后续爆炸分解与镜头聚焦。

## 兼容与性能

响应式布局覆盖手机、iPad 和桌面，使用安全的系统字体回退、动态视口高度及不低于 44px 的切换控件。遵循 `prefers-reduced-motion`：关闭滚动动画、粒子动画、平滑滚动及主题转场。3D 模块单独分包，DPR 上限 1.5，使用按需渲染而非持续动画循环，低功耗 GPU 偏好，无自动旋转；柔和接触阴影仅烘焙一次（昼夜切换时刷新），分辨率 256。减少动态效果时关闭交互阻尼。需要在 iPad Safari 真机测试持续触屏、双指手势、发热和上下文恢复，推荐移动端 GLB 小于 10 MB、纹理不超过 2048px。字体通过 Google Fonts 获取；离线时回退至本机字体，可在发布前自托管字体。

## 部署

使用任意静态托管平台（Vercel / Netlify / Cloudflare Pages / GitHub Pages）。构建命令 `npm ci && npm run build`，发布目录 `dist`，无需后端或密钥。部署至子目录时，在 `vite.config.ts` 设置对应 `base`（如 `/soulgrain-onward/`）；素材路径会使用该 base。仓库目前不含自动部署工作流。

## 下一阶段素材

- 正面、侧面、背面、俯视及三分之四角度的真实鞋款照片；Nightfall / Daylight 分别提供。
- 准确的 GLB 模型，PBR 纹理，正确 UV 和比例；如需设计解构，应分离并命名各部件。
- 蒙古纹样原稿、Logo 矢量文件、字体授权及品牌色规范。
- 鞋舌、水晶饰布、后跟皮条、鞋带头的高清特写与确认后的材质说明。
- 最终品牌文案、配色命名与动画参考；如使用音乐或音效，提供授权文件。

V2 不含最终原创鞋款配色与纹样、购物支付或最终设计解构。本次不修改部署配置，不合并 main，也不主动重新部署现有 Vercel 网站。


## 模型来源与许可

测试白模改编自 **theunclerulez** 在 Sketchfab 发布的 [Generic “Converse style” Sneakers](https://sketchfab.com/3d-models/generic-converse-style-sneakers-f7858a5612504c4193ca4c61125d6244)，采用 [Creative Commons Attribution 4.0 International（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/) 许可。

仓库提供的版本已修改模型材质为无最终配色和纹样的测试白模。本次展示集成不再修改原始几何结构或材质；仅调整场景中的统一缩放、居中、镜头和灯光。原作者不代表对 SoulGrain 品牌的认可，白模不代表 SoulGrain 最终原创鞋型。网站产品舞台下方保留相同署名与许可链接。

## V2 验证与真机检查

`npm run build` 包含 TypeScript 严格检查；也可独立执行 `npx tsc --noEmit`。3D 分包仍有体积警告，GLB 文件独立加载，未增加额外依赖或高密度生成几何。

在 iPad Safari 真机打开经审核的分支预览地址后，确认两只鞋可见、单指旋转、双指缩放及距离限制、恢复视角、画布外滚动和昼夜灯光切换。继续检查横竖屏、系统减少动态效果、后台切换与长时间操作温度。桌面 Chromium 软件 WebGL 预览不能替代 Safari 真机测试。

已在本轮 Chromium 软件 WebGL 环境验证：GLB HTTP 200，原始 4 个模型网格共 38,662 个顶点实际进入场景并可见；静止渲染帧数归零。鼠标旋转、视角重置、模拟单指旋转、双指缩放、距离限制、触控不带动页面滚动、昼夜背景变化、手机尺寸适配、加载失败重试、WebGL 不支持提示、上下文丢失后手动恢复均通过。以上不等同于 iPad Safari 真机验证。
