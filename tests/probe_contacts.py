import bpy,sys,json,importlib.util,numpy as np
from pathlib import Path
R=Path('/workspace/artifacts/soulgrain-semantic-repair-bridge-20261111');sp=importlib.util.spec_from_file_location('contact',R/'delivery/soulgrain_repair_studio_v3.py');a=importlib.util.module_from_spec(sp);sys.modules[sp.name]=a;sp.loader.exec_module(a);a.register();bpy.ops.wm.open_mainfile(filepath=str(R/'delivery/Soulgrain_REPAIR_STUDIO_V3_DEMO.blend'),load_ui=False,use_scripts=False);D=a.sr3_meta();bpy.context.scene.sr3_task=D['demo_tasks']['rear'];d,t,o=a.sr3_preview();v,f,_=a.sr3_geometry(o);output=[]
for rec in t['quality']['source_crossings']:
 src=a.sr3_objects()[rec['source_object_id']];sv,sf,sp=a.sr3_geometry(src);AA=v[f[rec['preview_triangle']]];BB=sv[sf[np.flatnonzero(a.face_ids(src.data)==rec['source_face_id'])[0]]]
 for A,B in [(AA,BB),(BB,AA)]:
  for j in range(3):
   x=A[j];y=A[(j+1)%3];delta=y-x;e1=B[1]-B[0];e2=B[2]-B[0];h=np.cross(delta,e2);det=np.dot(e1,h)
   if abs(det)<1e-22:continue
   inv=1/det;s=x-B[0];u=inv*np.dot(s,h);q=np.cross(s,e1);w=inv*np.dot(e2,q);vb=inv*np.dot(delta,q)
   if 0<u<1 and 0<vb<1 and u+vb<1 and 0<w<1:
    cross=np.linalg.norm(np.cross(e1,e2));margins=[u*cross/np.linalg.norm(e2),vb*cross/np.linalg.norm(e1),(1-u-vb)*cross/np.linalg.norm(e2-e1),min(w,1-w)*np.linalg.norm(delta)];output.append({'record':rec,'minimum_geometric_margin':min(margins),'margins':margins})
(R/'reports/contact-tolerance-probe.json').write_text(json.dumps(output,indent=2,default=float));print(output,flush=True)
