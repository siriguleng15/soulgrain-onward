from pathlib import Path
import json,hashlib,zipfile
R=Path(__file__).resolve().parents[1];demo=json.loads((R/'reports/studio-demo.json').read_text());test=json.loads((R/'reports/studio-tests.json').read_text());bridge=json.loads((R/'reports/bridge-tests.json').read_text());history=json.loads((R/'reports/native-history-tests.json').read_text());integration=json.loads((R/'reports/C-Studio-integration.json').read_text());rear=demo['rear'];cap=demo['cap']
assert test.get('resume_via_UI_operator_requires_new_confirmation'), 'Final regression test has not finished'
text=f'''# 真实模型测试与交付状态

实际环境为 Linux Blender 5.2.2 LTS，目标 Mac Blender 5.2.3。本报告没有把 Linux 脚本运行当作 Mac 鼠标交互验收。

## 测试对象

- V3：真正的 SOUL.NEW 全鞋，{test['real_source_faces']:,} 三角面；{test['HUMAN_faces']:,} HUMAN、{test['UNKNOWN_faces']:,} UNKNOWN 全部冻结。
- C：保留 1,281,758 原面 + 79,892 新施工面；新面为 REPAIR_PENDING，不伪装原 HUMAN。
- C 兼容版在完整 V3 插件中也已验证可读，并成功创建独立 C 修复工作副本。

## 实际结果

| 测试 | 结果 |
|---|---|
| 真实 HUMAN 鞋底范围副本、实际源边链检测 | 通过，原面/顶点映射可追溯 |
| 后跟局部缺角预览 | {rear['triangles']} 三角面 / {rear['quads']} 四边面，通过局部检查；只是可靠小子区 |
| 后跟边界覆盖 / 自交 / 已确认源穿插 | 缺段 0，自交 0，穿插 {rear['known_source_crossing_count']} |
| 拖点、局部平滑、局部加密 | 通过，真实预览数据改变，源几何不变 |
| 锁定边界被移动后的恢复 | 通过 |
| 原生删除预览内部面造成新破洞 | 检测到第二边界环并拒绝确认；源不变 |
| 生成新候选保留旧手改候选 | 通过，以实际旧网格指纹核对 |
| 确认、撤回、转回预览重新编辑 | 通过，必须再次确认，来源保持 NEW |
| 未确认预览禁止正式导出 | 通过 |
| 包头双轮廓桥接 | 138 四边面提案；存在已确认表面冲突，检查预算内未全部完成；**正确拒绝确认** |
| 源坐标 / 语义改动、陌生额外 Mesh | 全部拒绝，不留下源标签写入 |
| 保存并重新打开 | 源几何/UV/标签/ID/变换/PBR 和修复状态校验通过 |
| 独立正式导出并重开 | 只含源与已确认补片；无范围副本、引导、未确认候选 |
| 删除补片 | 只删除独立修复对象，源数据不变 |
| Blender 原生 ed.undo / ed.redo | 真鞋撤回任务已验证撤销/重做；Mac 键盘鼠标交互尚未实测 |
| C 零件管理器、隐藏、单独显示、UNKNOWN、动态分解 | 通过 |
| C 原面身份 / 几何或来源 ID 篡改 | 校验拒绝 |
| C JSON 往返 | P/S/C/I 实值逐数组完全相等，含 float32 置信值 |
| C 新面显式验收 | 当前状态可确认；NEW 来源和源面 ID=-1 不变 |

自动化脚本实际读取并比较面级数组，不以操作返回 FINISHED 作为唯一成功标准。

## 实际耗时与上限

- 后跟局部检查：本次 {rear['seconds']:.2f} 秒；检查 54 个局部参考三角面。
- 包头检查：本次 {cap['seconds']:.2f} 秒触及预算；已检测到至少 {cap['known_source_crossing_count']} 个已确认源穿插记录，尚未完成全量检查，因此不能确认。
- V3 完整操作回归：{test['seconds']:.2f} 秒，包含文件保存、独立 Blender 子进程导出及重开。
- C 兼容完整回归：{bridge['seconds']:.2f} 秒，含动态分解缓存和 JSON 往返。缓存 949,138 个展示三角面，CPU 缓存约 130.6 MiB。
- V3 只读几何参考数组缓存约 {rear['reference_cache_bytes']/1024**2:.1f} MiB，上限 256 MiB；不是 Blender 总进程内存。头less测试进程曾约 2.5 GiB，Mac 耗时/内存需实机测量。
- 交叉检查流式候选上限 100,000 对、8 秒预算；局部三角面和邻域规模另有限制。超限返回未完成并拦截确认。

## 接触容差验证

更保守的流式候选检查暴露出五条接缝接触记录。逐一计算交点到边/端点的几何余量，仅约 2.6e-11–7.9e-11 模型单位，属于 float32 边界舍入，不是真正穿插。最终使用 1e-7 **模型单位**的几何接触容差，并保留原始探针数据；不按具体源面 ID 排除、不隐藏冲突面。包头的大尺度真正穿插仍被拒绝。

## 原始文件保护

交付前重新计算 SOUL.NEW、原语义 JSON、A/B/C REVIEW 与旧 V2.2 插件 SHA-256，与只读审计输入一致。详见 `reports/input-integrity-final.json`。只在新的派生目录及独立分支交付，无网站、动画、主分支或部署修改。

## 尚未实现及实机待验收

1. 不是全鞋缺陷自动识别器；正常鞋口/鞋眼/布料边必须人工核实，融合边界仍可能需要额外轮廓约束。
2. 双层内衬、足部空间、四层交互剖切、完整纹理投射/烘焙尚未实现。
3. 新增补面独立，不自动焊接原鞋；源 UNKNOWN 不删除，不宣称整鞋水密。
4. 新面只支持施工 UV，原蒙古纹样不会凭空正确出现；UV 待处理必须明确确认。
5. 新 V3 补片由修复任务列表管理，未加入旧动态分解缓存。C 已迁移修复与源语义管理/动态分解可用。
6. 有界短任务同步运行；无复杂长任务可随时取消的模态界面。正式导出有独立子进程 90 秒上限。
7. 源对象默认不可选。若通过 Blender 原生方式强制解锁修改，校验会拦截施工/导出，需要撤销该误操作；Python 工具不能阻止用户绕开界面使用 Blender 任意编辑源数据。
8. Mac 插件安装、侧栏布局、触控板操作、键盘撤销及导出子进程需在 Blender 5.2.3 验收。没有宣称已经做了 Mac 实机测试。

## 对比图说明

`renders/rear_same_camera_comparison.jpg` 与 `cap_same_camera_comparison.jpg` 均使用真实网格、相同相机和光照。蓝灰为源，粉红为 UNKNOWN，橙色为未确认预览；诊断颜色只在未保存的渲染副本上使用，没有覆盖源 PBR。包头图显示冲突候选，不能当作成功修复图。

测试日志中的 PulseAudio/缩略图缓存写入提示来自云端只读 home 目录，不影响已核验的模型保存、图像导出或面级数据。一次 libraries.write(Scene) 路线崩溃已停止使用；交付的隔离副本导出路线已通过实际回读测试。
'''
(R/'docs/03_真实模型测试与限制.md').write_text(text)
# Verify immutable originals and earlier artifacts against the known audited inputs.
OLD=R.parent/'soulgrain-geometry-repair-01-03-20261111';paths={OLD/'inputs/SOUL.NEW.blend':'725756904a0c71ee9c927b3e39332655c4cd175d3b9d55d0272ae70adb105183',OLD/'inputs/soul_SGO_V2_1_1_WORK_V2_2_WORK.semantics.2.json':'90974d192fe73a0b698669df41b7a849fd61e86438a33f6235adc85bd224959d',OLD/'delivery/Soulgrain_Stage_A_REVIEW.blend':'1fb32e9ab66be765d87d2e394aeba164e4a17814fdc78e3ed1091428ef7b0b24',OLD/'delivery/Soulgrain_Stage_B_REVIEW.blend':'845722c412db909ba556d7d880c18f3a6b215608c5ebc2c350c1687fb040218b',OLD/'delivery/Soulgrain_Stage_C_REVIEW.blend':'3e91b772b242dc6d02867f8a524c9e16841636a5bc946e57509d877a800f1449',R.parent/'soulgrain-semantic-v2-2/scripts/soulgrain_semantic_v2_2.py':'1b7f4da45c81cb09c7f3b204c1a52887ec3dbd27b9f14ff96ecff46baa4fe0d3'};rows=[]
for p,expected in paths.items():
 actual=hashlib.sha256(p.read_bytes()).hexdigest();assert actual==expected,p;rows.append({'file':p.name,'bytes':p.stat().st_size,'sha256':actual,'matches_readonly_input':True})
(R/'reports/input-integrity-final.json').write_text(json.dumps(rows,indent=2))
# Installable legacy add-on archive contains one real module, not the whole toolkit.
addon=R/'delivery/Soulgrain_Repair_Studio_V3_Addon.zip'
with zipfile.ZipFile(addon,'w',zipfile.ZIP_DEFLATED) as z:z.write(R/'delivery/soulgrain_repair_studio_v3.py','soulgrain_repair_studio_v3/__init__.py')
files=[*sorted((R/'docs').glob('*.md')),*sorted((R/'renders').glob('*.jpg')),*sorted((R/'reports').glob('*.json')),*sorted((R/'tests').glob('test_*.py')),R/'tests/check_C_with_Studio.py',R/'delivery/soulgrain_repair_studio_v3.py',R/'delivery/soulgrain_semantic_v2_3_repair.py',R/'delivery/Soulgrain_C_V2_3.semantics.json',addon]
# Include actual successful logs, no old failed snapshots or private source files.
files += [R/'reports'/n for n in ['bridge-tests.log','studio-tests.log','native-history.log','C-Studio-integration.log']]
with zipfile.ZipFile(R/'delivery/Soulgrain_Repair_Studio_V3_Toolkit.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:z.write(p,p.relative_to(R))
manifest=[]
for p in sorted((R/'delivery').iterdir()):
 if p.is_file() and p.suffix in ['.py','.zip','.blend','.json']:manifest.append({'file':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(R/'delivery/SHA256SUMS.json').write_text(json.dumps(manifest,indent=2));(R/'delivery/SHA256SUMS.txt').write_text(''.join(x['sha256']+'  '+x['file']+'\n' for x in manifest))
for p in (R/'delivery').glob('*.zip'):
 with zipfile.ZipFile(p) as z:assert z.testzip() is None
print('REPORTS_PACKAGES_SOURCE_INTEGRITY_PASS')
