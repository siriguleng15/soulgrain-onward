import bpy,sys,json,importlib.util,numpy as np
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');OLD=Path('/workspace/artifacts/soulgrain-geometry-repair-01-03-20261111');spec=importlib.util.spec_from_file_location('studio_demo',R/'delivery/soulgrain_repair_studio_v3.py');a=importlib.util.module_from_spec(spec);sys.modules[spec.name]=a;spec.loader.exec_module(a);a.register();bpy.ops.wm.open_mainfile(filepath=str(OLD/'inputs/SOUL.NEW.blend'),load_ui=False,use_scripts=False);OUTPUT=R/'delivery/Soulgrain_REPAIR_STUDIO_V3_DEMO.blend';a.sr3_initialize(OUTPUT);a.preview(True);sc=bpy.context.scene;sc.sgo_target='20';proxy=a.sr3_scope();proxy.update_from_editmode();co=a.array(proxy.data.vertices,'co',3,'f4');edges=a.array(proxy.data.edges,'vertices',2);edgekeys={tuple(sorted((co[x].tobytes(),co[y].tobytes()))):i for i,(x,y) in enumerate(edges)}
paths=json.loads((OLD/'reports/notch-paths.json').read_text());options=[]
for path in paths:
 pts=np.asarray(path['coordinates'],'f4');valid=[tuple(sorted((x.tobytes(),y.tobytes()))) in edgekeys for x,y in zip(pts[:-1],pts[1:])]
 for start in range(len(pts)-3):
  end=start+1
  while end<len(pts) and valid[end-1] and pts[end,0]>=pts[end-1,0]-1e-8:end+=1
  if end-start>=4:options.append((end-start,path['sign'],pts[start:end]))
assert options,'No real HUMAN sole chain';_,sign,points=max(options,key=lambda x:x[0]);bm=__import__('bmesh').from_edit_mesh(proxy.data);bm.edges.ensure_lookup_table()
for e in bm.edges:e.select_set(False)
selected=[edgekeys[tuple(sorted((x.tobytes(),y.tobytes())))] for x,y in zip(points[:-1],points[1:])]
for i in selected:bm.edges[i].select_set(True)
__import__('bmesh').update_edit_mesh(proxy.data,loop_triangles=False,destructive=False);detect=a.sr3_detect();data,task=a.sr3_task();task['demo']='Real HUMAN sole rear-corner edge chain; smaller unambiguous subregion. Not a whole-notch automatic closure.';task['normal']=[0,-1 if sign<0 else 1,0];a.sr3_put(data);sc.sr3_guide_height=.018;guide=a.sr3_make_guide();sc.sr3_algorithm='EXTEND';sc.sr3_rows=6;sc.sr3_bulge=.001;patch=a.sr3_generate();qa=a.sr3_check();rearid=task['uuid'];(R/'reports/rear-debug.json').write_text(json.dumps(qa,indent=2));print('REAR_REAL_CASE',len(points),qa['geometry_pass'],len(qa['source_crossings']),qa['seconds'],flush=True)
# A second task: two user-adjustable contour proposals anchored to actual HUMAN cap vertices.
if bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
root=next((uid,o) for uid,o in a.sr3_objects().items() if o.name=='Shoe_TEST_V3');uid,src=root;v=a.array(src.data.vertices,'co',3,'f4');f=a.array(src.data.loops,'vertex_index').reshape(-1,3);p,s,c,i=a.read_labels(src.data);used=np.unique(f[(p==23)&(s==2)]);cv=v[used];domain=np.load(OLD/'reports/A_cap_band_domain.npz');origin=domain['origin'];ax=float(domain['ax']);by=float(domain['by']);theta=np.arctan2((cv[:,1]-origin[1])/by,-(cv[:,0]-origin[0])/ax);us=np.linspace(-.75,.15,13);bounds=[]
for mode in ['lower','upper']:
 indices=[]
 for u in us:
  z=float(np.interp(u,domain['u'],domain['zlo' if mode=='lower' else 'zhi']));angle=np.abs(theta-u);score=angle**2*3+(cv[:,2]-z)**2*90;indices.append(int(used[np.argmin(score)]))
 if len(set(indices))<8:raise AssertionError('insufficient distinct real cap anchors')
 bounds.append({'uuid':str(__import__('uuid').uuid4()),'closed':False,'points':v[indices].tolist(),'vertex_references':[{'source_object_id':uid,'source_vertex_id':x} for x in indices],'kind':'HUMAN_VERTEX_ANCHOR_GUIDE','intent':'Proposed contour between verified vertex anchors; not certified physical boundary edges'})
data=a.sr3_meta();task=a.sr3_add_task(data,23,'DEMO_CAP_BRIDGE');task.update(boundaries=bounds,normal=[-1,0,0],demo='Real HUMAN cap anchors, adjustable paired contours; no source faces moved or removed.');a.sr3_put(data);sc.sr3_algorithm='BRIDGE';sc.sr3_rows=6;sc.sr3_bulge=.003;cap=a.sr3_generate();capqa=a.sr3_check();print('CAP_REAL_CASE',capqa['geometry_pass'],len(capqa['source_crossings']),capqa['seconds'],flush=True)
# Deliver only UNCONFIRMED editable previews. Automated confirmation tests use another file.
sc.sr3_user_confirm=False;sc.sr3_boundary_reviewed=False;sc.sr3_accept_pending_uv=False;data=a.sr3_meta();data['demo_tasks']={'rear':rearid,'cap':task['uuid']};a.sr3_put(data);a.sr3_guard();sc.sr3_message='演示工程只含两个未确认预览。后跟为可靠小子区；包头为真实 HUMAN 顶点约束的双轮廓提案，须人工复核。';
if bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
for o in sc.objects:
 if o.get('sr3_role') in ['SELECTOR','GUIDE']:o.hide_set(True)
# Start at rear preview for easy manual control-point inspection.
sc.sr3_task=rearid;a.sr3_activate(a.sr3_find(data['tasks'][rearid]['active_preview']),False)
bpy.data.texts.new('V3_先读我').write('原始源模型、标签、UV/PBR 冻结。几何修复工作台含后跟和包头两个真实模型未确认预览；未经点击“确认本次修复”不会加入正式输出。源对象不可选，圈选使用只读范围副本；橙色才是可编辑补片。包头双曲线只是 HUMAN 顶点约束提案，不表示它一定是真实开口；查看质量报告，必要时补充边界。复杂内衬、四层剖切与纹样烘焙不在首版 MVP。')
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT),check_existing=False,compress=True);a.sr3_guard();report={'rear':qa,'cap':capqa,'rear_real_source_vertices':len(points),'unconfirmed_previews_only':True,'source_frozen':True,'demo_file':OUTPUT.name};(R/'reports/studio-demo.json').write_text(json.dumps(report,indent=2));print('REAL_STUDIO_DEMO_PASS',OUTPUT.stat().st_size,flush=True)
