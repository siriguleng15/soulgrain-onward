# Soulgrain Semantic V2.1 Hotfix — 2.1.1

独立工具下载分支，仅含脚本、文档及测试证据，不含模型或网站代码。

- [完整下载包](Soulgrain_Semantic_V2_1_Hotfix.zip)
- [完整 Python 工具](soulgrain_semantic_v2_1.py)
- [中文 PDF 操作指南与修复报告](Guide_V2_1_Hotfix_zh_CN.pdf)
- [可选 Blender 插件 ZIP](Soulgrain_Semantic_V2_1_Addon.zip)
- [根因与修复报告](热修复报告.md)
- [测试结果](测试结果.md)

修复普通按钮继承 UNKNOWN 参数、多对象残留选区被写入、检查快照不刷新等缺陷。仅写明确的编辑对象，真实回读校验，失败回滚。包含候选修剪/补选、自动面数、越界提示及保护校验。

打开现有 V2 工作文件，运行新版脚本，确认版本 2.1.1，另存 V2.1 新副本。不要同时运行旧 V2。

185 项检查通过，使用实际 149.9 万三角面鞋模。测试为 Linux Blender 5.2.2 LTS；Mac Blender 5.2.3 的物理 GUI 交互仍待用户验证。未改原始几何/UV/PBR/面 ID，未覆盖旧 V1/V2，未拆分或部署。
