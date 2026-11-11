# Soulgrain Repair Studio V3.0 — 鞋底修补 MVP

面向真实 SOUL 鞋模的 Blender 插件。原始网格和标签只读，几何修改在独立、可编辑、必须明确确认的修复层内进行。本分支只提供工具与独立检查资产，不修改网站或部署。

先阅读 [Mac 中文教程](docs/01_先读我_下载与使用.md)。

- [完整 V3 单文件插件](delivery/soulgrain_repair_studio_v3.py)
- [Blender 插件安装 ZIP](delivery/Soulgrain_Repair_Studio_V3_Addon.zip)
- [脚本、教程、真实测试与对比包](delivery/Soulgrain_Repair_Studio_V3_Toolkit.zip)
- [真实 SOUL 演示工作台](delivery/Soulgrain_REPAIR_STUDIO_V3_DEMO.blend) — 两个未确认候选，没有替用户批准补面。
- [C 阶段语义兼容检查工程](delivery/Soulgrain_C_SEMANTIC_V2_3_CHECK.blend) — 保留旧 C 几何，恢复经过验证的语义来源与管理能力。
- [C 新版本语义 JSON](delivery/Soulgrain_C_V2_3.semantics.json)
- [A/B/C 只读审计与迁移证据](docs/02_A_B_C_审计与可靠迁移.md)
- [真实测试、性能和限制](docs/03_真实模型测试与限制.md)
- [修复层格式、边界约束和后续路线](docs/04_修复层格式与后续路线.md)
- [下载文件 SHA-256](delivery/SHA256SUMS.txt)

下载大文件请在 GitHub 文件页使用 **Download raw file / 下载原始文件**。插件安装包与工具教程包不同；教程包先解压，Mac 不需要 Codex。

实际测试：Linux Blender 5.2.2 LTS。Mac 5.2.3 交互需用户实机验收。仅一个 Soulgrain 插件启用；V3 已包含 V2.3 兼容层。

后跟候选为一个可靠的小子区，未自动完成整个后跟。包头双轮廓提案与源表面冲突，被质量检查拒绝；它是待人工调整案例，不是成功修复成品。内衬、四层剖切与纹样烘焙尚未实现。
