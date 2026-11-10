# Soulgrain Semantic V2

独立工具与文档下载分支。没有模型、网站代码或部署文件。

- [完整下载包（推荐）](Soulgrain_Semantic_V2.zip)
- [中文 PDF 操作指南](Guide_zh_CN.pdf)
- [独立 Python 工具](soulgrain_semantic_v2.py)
- [可选插件 ZIP](Soulgrain_Semantic_V2_Addon.zip)
- [迁移说明](迁移说明.md)
- [真实模型测试结果](测试结果.md)

先打开已有的 `soul_SGO_V1_WORK.blend`，运行工具，点击“另存 V2 工作副本并升级”。不要重新从原始模型建立空标注，不要同时启用 V1 和 V2。详见 PDF。

包含零件树、多部件隐藏/单独查看/选择/锁定、选中面检查、种子扩展预览与确认/取消、人工标签保护及 V1 JSON 兼容。

115 项回归检查通过，另已实测插件 ZIP 安装/启用/停用。云端环境为 Linux Blender 5.2.2 LTS；Mac Blender 5.2.3 LTS 图形交互仍待用户验证。首次百万面建图同步，约几秒，扩展循环可取消。

不执行正式拆分、不改几何/UV/PBR、不覆盖 V1 或原始工程、不修改网站或动画。
