# SoulGrain — ONWARD

融合蒙古族传统元素与现代街头表达的运动鞋展示网站。第一阶段包含五个叙事场景、GSAP 滚动入场、昼夜氛围切换，以及 React Three Fiber 产品展示入口。无实物素材时明确展示占位，不绘制或生成替代鞋型。设计切面中的几何图形仅为抽象材质研究，不代表最终纹样或实物。

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

保留 `null` 以继续使用占位。支持 GLB / GLTF，优先使用嵌入纹理的 GLB；GLTF 的外部纹理和 bin 文件须保持正确相对路径。模型优先于图片；不支持 WebGL 时使用图片或占位。加载失败时显示提示，不自动生成替代产品。

模型以原点居中，当前镜头在 `[3,2,5]`，建议模型最长边归一化为约 2–3 个场景单位；根据实物比例在 `src/components/ProductStage.tsx` 调整镜头、距离和灯光。当前支持鼠标/单指旋转、滚轮/双指缩放，禁止平移，不自动旋转。请在 3D 画布之外滚动页面。

细节数据位于 `src/App.tsx` 的 `details`；后续可换为带真实图片、独立模型部件和热点的组件。建议每个部件保留稳定命名（鞋舌、后跟皮条、水晶饰布、鞋带头等），以支持后续爆炸分解与镜头聚焦。

## 兼容与性能

响应式布局覆盖手机、iPad 和桌面，使用安全的系统字体回退、动态视口高度及不低于 44px 的切换控件。遵循 `prefers-reduced-motion`：关闭滚动动画、粒子动画、平滑滚动及主题转场。3D 模块按需分包，DPR 上限 1.5；无模型时不创建 WebGL 渲染器。真实模型接入后需在 iPad Safari 真机测试纹理内存、上下文恢复与触屏手势，推荐移动端 GLB 小于 10 MB、纹理不超过 2048px。字体通过 Google Fonts 获取；离线时回退至本机字体，可在发布前自托管字体。

## 部署

使用任意静态托管平台（Vercel / Netlify / Cloudflare Pages / GitHub Pages）。构建命令 `npm ci && npm run build`，发布目录 `dist`，无需后端或密钥。部署至子目录时，在 `vite.config.ts` 设置对应 `base`（如 `/soulgrain-onward/`）；素材路径会使用该 base。仓库目前不含自动部署工作流。

## 下一阶段素材

- 正面、侧面、背面、俯视及三分之四角度的真实鞋款照片；Nightfall / Daylight 分别提供。
- 准确的 GLB 模型，PBR 纹理，正确 UV 和比例；如需设计解构，应分离并命名各部件。
- 蒙古纹样原稿、Logo 矢量文件、字体授权及品牌色规范。
- 鞋舌、水晶饰布、后跟皮条、鞋带头的高清特写与确认后的材质说明。
- 最终品牌文案、配色命名与动画参考；如使用音乐或音效，提供授权文件。

第一阶段不包含真实鞋型、购物支付、最终设计解构或已发布线上站点。
