from pathlib import Path
import hashlib
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');source=Path('/workspace/artifacts/soulgrain-semantic-v2-2/scripts/soulgrain_semantic_v2_2.py');s=source.read_text();assert s.endswith("if __name__=='__main__':register()\n");s=s.rsplit("if __name__=='__main__':register()",1)[0]
s=s.replace('"name": "Soulgrain 语义标注 V2.2 动态分解工作台"','"name": "Soulgrain Semantic V2.3 修复资产兼容版"').replace('"version": (2, 2, 0)','"version": (2, 3, 0)')
old="if not np.array_equal(before['fids'],ix):raise ValueError('当前源面 ID 与固定拓扑不匹配，未写入')";assert s.count(old)==1;s=s.replace(old,"_repair_require_selection_identity(o,ix,before['fids'])")
old="if not np.array_equal(face_ids(o.data),np.arange(rec['faces'],dtype='i4')):raise ValueError('源面 ID 已改变')";assert s.count(old)==1;s=s.replace(old,'_repair_require_identity(o)')
old="if not np.array_equal(face_ids(me),np.arange(len(me.polygons),dtype='i4')):raise ValueError('稳定面 ID 失效')";assert s.count(old)==1;s=s.replace(old,'_repair_require_identity(o)')
# Runtime triangle caches use local polygon indices, never pretend those are
# original source IDs after physical topology repair.
start=s.index('# ---------- V2.2: runtime-only');s=s[:start]+s[start:].replace("'source_face_ids'","'polygon_indices'")
s+='\n'+(R/'scripts/repair_extension.py').read_text();s=s.replace("('人工确认' if detail['status']==HUMAN else '自动候选' if detail['status']==AUTO else '未指定')","('人工确认' if detail['status']==HUMAN else '自动候选' if detail['status']==AUTO else '修复待验收' if detail['status']==3 else '未指定')")
path=R/'delivery/soulgrain_semantic_v2_3_repair.py';path.write_text(s);compile(s,str(path),'exec');(R/'reports/original-plugin-sha256.txt').write_text(hashlib.sha256(source.read_bytes()).hexdigest());print('BUILT',len(s.splitlines()),'lines',path)
