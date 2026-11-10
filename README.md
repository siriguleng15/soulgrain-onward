# 赛罕：音频修复与 AI 分离试验下载

经用户授权公开上传的成品、派生同响度参考、试听包和报告。未上传原始 MP3 文件，没有网站代码或部署文件。

- [先听三组40秒同响度对照（约22 MB）](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/Saihan_Listen_First_MP3.zip)
- [全长 A/B/被削弱声 MP3 合集（约32 MB）](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/Saihan_Full_Length_MP3.zip)
- [完整报告 PDF](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/Saihan_Audio_Report.pdf)
- [参数、脚本、验证及可选 SAM GPU 路线](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/Saihan_Reports_Parameters_and_GPU_Route.zip)

| 全曲 | MP3 | WAV |
| --- | --- | --- |
| A：保守修复（建议先听） | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/A_Conservative_Matched.mp3) | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/A_Conservative_Matched.wav) |
| B：真实 AI 近似器乐提取试验 | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/B_AI_Other_Approximation_Matched.mp3) | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/B_AI_Other_Approximation_Matched.wav) |
| 被削弱声：检查是否误删乐器 | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/B_Removed_Check_For_Lost_Strings_Matched.mp3) | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/B_Removed_Check_For_Lost_Strings_Matched.wav) |
| 同响度原音参考（派生文件） | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/Original_Matched.mp3) | [下载](https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/refs/heads/artifacts/saihan-audio-20261110/full/Original_Matched.wav) |

A 保留整场演奏，做保守去直流和轻微降噪。B 实际运行 Hybrid Demucs，但不是已确认的三弦/胡尔独立纯轨；被削弱声可能含乐器，不能当作纯噪声直接丢弃。SAM 与 RoFormer 本轮未实际运行，原因见报告。

全曲四版本匹配至 −27.1 LUFS；三组40秒试听每组内均为 −23 LUFS。请以相同设备音量比较同一组，不用增大某个版本冒充质量改善。全曲 WAV 为 44.1 kHz / 双声道 / 24-bit，MP3 为 320 kbps。

iPad 可直接下载 ZIP 后在“文件”App 解压。MP3 若打开播放器，可长按链接选择“下载链接文件”，或使用分享菜单保存到“文件”。WAV 每个约65 MB。
