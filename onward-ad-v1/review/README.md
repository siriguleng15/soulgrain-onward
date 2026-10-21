# ONWARD 广告 V1｜画面与交互审核

[打开独立三维广告](https://siriguleng15.github.io/soulgrain-onward/onward-ad-v1/onward-ad.html) · [完整交互动画重放](full-path-review.mp4) · [可编辑工程与运行说明](../../modeling/interactive-ad-v1/README.zh-CN.md)

| 实际网页场景 | 截图 |
|---|---|
| ROOT / 原 V8 Nightfall 鞋模 | [整鞋](01-root.png) |
| A1 / 翻筒聚焦 | [聚焦](02-cuff-focus.png) |
| A1.1 / 连续周向展开终态 | [横向展开](03-cuff-unfolded.png) |
| A1.1.1 / 陶脑与乌尼连接 | [杆件连接](04-toono-and-uni.png) |
| A1.1.1 / 扣袢抬起 | [扣袢动作](05-clasp-lift.png) |
| A1.1.1 / 围合与原鞋复位同步进行 | [组合中间帧](06-ger-assembly.png) |
| A1.1.1 / 原鞋与白色蒙古包 | [双主角](07-shoe-and-ger.png) |
| A1.1.1.1 / 用户触发文化注释 | [文化与设计](08-cultural-notes.png) |

截图由真实 Three.js 页面渲染，无 AI 生成替代图。MP4 通过点击真实页面的下一步按钮进入各节点，并对同一 GSAP/WebGL 时间线逐帧采样；它用于检查动作连续性，**不代表实时设备帧率**。录制参数见 `recording.json`。

`verification.json` 为 Chromium 集成检查；`source-verification.json` 为 Blender 对 V8 与派生资产的只读比较。当前没有物理 iPad/Safari 测试结果。软件渲染环境及自动化命令会显著拉长帧间隔，CPU 提交耗时也不能替代 GPU 帧率。

后续需真机复核：首次加载、长时间温度/电量、触控与 Safari 地址栏、后台恢复、内存压力下的 WebGL 恢复。当前为广告交互样片，织物采用几何驱动的结构展开，尚非材料标定的布料物理模拟。
