# ONWARD 广告开发规范与第一批 Skills

日期：2026-11-05（Asia/Shanghai）。阶段：技术准备；没有制作章节动画。

## 隔离与交付位置

- 基线：`feat/onward-immersive-showcase-v1` 的 `fea6c0e753ca0b4ba6b2e32b52ae57ff57a3b1e6`。
- 本轮分支：`chore/onward-ad-skills-v1`；工作目录：`/workspace/onward-ad-skills-v1`。
- 原工作区 `/workspace/soulgrain-onward` 仍在原分支，原有未提交及未跟踪文件未移入新 worktree。开始前记录 HEAD、分支、索引差异、工作区差异及 28 个脏／未跟踪文件的内容哈希，结束后逐项比较。
- 新增内容仅为根 AGENTS.md、两个仓库级 Skills、检查脚本和本报告／验证记录；没有修改源模型、Blender、UV、图片、生产代码、网页或既有动画；没有部署。

## 文件与职责

| 文件／目录 | 职责 |
| --- | --- |
| `AGENTS.md` | 产品保护、worktree 隔离、章节生命周期、相机唯一控制、验证及发布边界 |
| `.agents/skills/onward-asset-contract/SKILL.md` | GLB 节点、材质、UV、锚点、隔离和无损复位工作流 |
| 同 Skill 的 `agents/openai.yaml` | 原生技能列表中的中文名称、简述及显式调用提示 |
| 同 Skill 的 `references/asset-contract.json` | 从实际未改动 GLB 建立的4节点访问器／图像指纹、材质关系、锚点和6项保护文件 SHA |
| 同 Skill 的 `references/heel-contract.md`、`sources-and-validation.md` | 后跟归属、坐标、官方资料、已有实现及分层验收 |
| 同 Skill 的 `scripts/inspect_glb.py`、`check_restore.mjs` | 标准库只读二进制核验、负例拦截、真实坐标挂接与复位测试 |
| `.agents/skills/onward-ribbon-geometry/SKILL.md` | 矩形轮廓／实体带状的共同参数域、稳定帧、宽厚、扭转、生长和回归工作流 |
| 同 Skill 的 `agents/openai.yaml` | 技能列表与调用提示 |
| 同 Skill 的 `references/geometry-method.md`、`sources-and-validation.md` | 两种模式的构造方法、技术选择与未来运行时验收；不是动画实现 |
| 同 Skill 的 `references/ribbon-spec.json`、`scripts/check_spec.py` | 可执行规格与错误输入检查；直线路径只作为合法性测试夹具，不是演出路径 |
| `scripts/check-development-skills.py` | 技能格式、路径、范围、源资产、复位与两种模式的综合检查 |
| `scripts/check-codex-skill-discovery.py` | 用真实 Codex app-server 的 skills/list 检查仓库级发现；不启动模型回合 |
| 本目录 `verification.json`、`skill-creator-provenance.json` | 实际执行结果及 skill-creator 来源／版本记录 |

## 调用方式

先在包含这些文件的新分支／worktree 中开启或刷新 Codex 会话。原分支不包含这些新增文件，不会仅因新分支存在而自动获得它们。

```text
使用 $onward-asset-contract 只读检查后跟皮条与缝线，列出不得随 actor 移动的节点，运行资产与复位验证，不修改模型。

使用 $onward-ribbon-geometry 检查红色矩形轮廓和红色实体带状两种模式的规格，说明稳定坐标架与回归约束；本轮不制作动画。
```

两项均保留默认的隐式选择能力，没有设为 explicit-only；description 包含中英文项目触发词。显式调用是最确定的用法。当前已验证原生发现、调用元数据及按工作流实际运行检查；没有把“发现成功”冒称为所有自然语言请求都必然自动选中。

## 本轮实际使用 skill-creator 的方式

初始会话未挂载该内置目录。先检索本地与技能目录，再读取 OpenAI 官方固定版本 `skills/.system/skill-creator`，使用其 init_skill.py 初始化两个目录及 agents/openai.yaml。

启动本机 Codex CLI 0.159.2 的隔离 app-server 后，CLI 自动提供了其真正内置 `.system/skill-creator`。随后读取内置 SKILL.md 与 openai_yaml.md，使用内置生成器复核元数据，并运行内置 quick_validate.py；两个技能均通过。没有把下载副本伪称为初始已挂载的内置工具，也没有把第三方工具源码放入本仓库。

## 重复验证

Python 只读辅助脚本使用标准库；综合元数据检查及官方 skill-creator 需要 PyYAML。数值挂接检查需要 Node.js 与 Three.js **0.180.0**。不要为此更改产品 package.json 或锁文件。

正常已安装仓库依赖时：

```bash
python3 -B scripts/check-development-skills.py
python3 -B scripts/check-codex-skill-discovery.py
```

隔离 worktree 可只读复用其他位置的同版本 Three.js；本轮实际命令：

```bash
python3 -B scripts/check-development-skills.py --three-root /workspace/soulgrain-onward/node_modules/three --skill-creator /tmp/onward-skills-prep/codex-home/skills/.system/skill-creator
python3 -B scripts/check-codex-skill-discovery.py
```

临时 skill-creator 路径是本次环境路径；其他机器可改为自己的内置目录，或省略 --skill-creator（此时仅运行仓库元数据检查，不声称运行了官方检查器）。综合脚本的新增文件范围限制针对这次准备交付；未来动画开发应运行各 Skill 的针对性检查及该章浏览器验收，而非把准备阶段的“只能新增文档”限制套到已授权制作。

Codex 发现测试使用临时 CODEX_HOME 和本机 stdio 协议，不修改全局配置、不上传资产、不发起模型任务。缺少 CLI 或依赖时返回失败／未验证，不用静态字符串扫描假装原生测试通过。

## 验证结果与边界

- 两个内置 skill-creator 格式检查通过，入口链接和仓库资源路径均存在。
- 原生 skills/list 返回两项 scope=repo、enabled=true，路径及默认提示正确。
- 实际源 GLB 的位置、法线、UV、索引、材质、图片和锚点契约通过；6项保护文件哈希一致。
- 7种资产错误与16种带状规格错误被拒绝，包括错误节点归属、圆管／蛇／图片替代、缺失轮廓模式、零路径、平行帧、台阶生长和近似平面回归。
- 使用真实源几何在 Three.js 中进行30次挂接／恢复，最大矩阵误差约 `3.55e-15`；源属性字节、父级、材质、显隐与兄弟顺序保持一致。
- 两种模式仅完成规格验证，没有生成表演网格、播放动画、编译新 Shader、测试新页面或进行 Safari 实机测试。

详细结果以 verification.json 为准。未运行会写既有交付物的旧构建、建模和发布脚本。

## 进入动画制作前的剩余工作

1. 明确本章分镜、节奏、长路径、两种模式切换及镜头安全区；当前直线路径仅用于规格验证。
2. 在隔离章节实现真正的带状表演几何、稳定帧传播、连续生长、厚度／端盖、缝线对应及精确回归；这些尚未实现。
3. 接入章节状态机、单一相机所有权与取消／暂停／返回，避免与现有滚动和翻筒争用。
4. 在明确节点范围内开发黑膜、局部揭示及成功完成后解锁，保留原 PBR 和 Shader 补丁。
5. 选择微距范围；如果需要超出现有照片分辨率的真实皮革和热压细节，再补充实拍或明确标注的派生材质资产。普通几何演示不必先做独立 GLB。
6. 完成实际网页截图、连续录屏和 iPad Safari 实机验证；数值检查不能替代这些视觉与性能验收。
