"""Synthetic topology tests supplement, never replace, the real shoe tests."""
import bpy,importlib.util,sys,json,time,math
from pathlib import Path
import numpy as np
R=Path('/workspace/artifacts/soulgrain-semantic-v2-2');spec=importlib.util.spec_from_file_location('sgo2',R/'scripts/soulgrain_semantic_v2_2.py');a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)
report={'blender':bpy.app.version_string,'fixture_type':'Synthetic test graphs only. Not delivered as shoe partitions.','checks':[]}
def check(name,ok):
 report['checks'].append({'name':name,'passed':bool(ok)});print('PASS' if ok else 'FAIL',name,flush=True);assert ok,name
def graph(n=5,edges=None):
 g=a.FaceGraph();g.n=n;g.diagonal=100.;g.valid_normals=np.ones(n,bool);g.normals=np.tile([0,0,1.],(n,1));g.mat=np.zeros(n,'i4');g.centers=np.column_stack([np.arange(n),np.zeros(n),np.zeros(n)])
 if edges is None:edges=[(i,i+1) for i in range(n-1)]
 pairs=sorted([(u,v) for u,v in edges]+[(v,u) for u,v in edges]);row=np.array([u for u,v in pairs]);g.neighbors=np.array([v for u,v in pairs],'i4');g.offset=np.r_[0,np.cumsum(np.bincount(row,minlength=n))];g.dot=np.ones(len(pairs),'f4');g.length=np.ones(len(pairs),'f4');return g
params=dict(angle=20.,seed_angle=45.,radius_percent=100.,max_faces=100,max_seconds=3.,cross_material=False,respect_semantics=True,exact_seams=True)
def run(g=None,p=None,s=None,issues=None,locked=(),visible=None,seeds=(0,),**updates):
 g=g or graph();n=g.n;return a.GrowStepper(g,seeds,np.zeros(n,'i4') if p is None else np.array(p,'i4'),np.ones(n,'i4') if s is None else np.array(s,'i4'),np.zeros(n,'i4') if issues is None else np.array(issues,'i4'),11,set(locked),np.ones(n,bool) if visible is None else np.array(visible,bool),{10,11},dict(params,**updates))
check('connected coplanar region grows',set(run().finish())==set(range(5)))
check('manual other-part boundary never crossed',set(run(p=[0,0,12,0,0],s=[1,1,2,1,1]).finish())=={0,1})
check('manual UNKNOWN is protected too',set(run(s=[1,1,2,1,1]).finish())=={0,1})
check('manual same-part can be traversed',len(run(p=[11]*5,s=[2]*5).finish())==5)
check('locked source class blocks frontier',set(run(p=[0,0,12,0,0],locked=[12]).finish())=={0,1})
check('unresolved issue blocks frontier',set(run(issues=[0,0,1,0,0]).finish())=={0,1})
check('hidden faces block frontier',set(run(visible=[1,1,0,1,1]).finish())=={0,1})
check('automatic other-part candidate blocks by default',set(run(p=[0,0,12,0,0]).finish())=={0,1})
check('automatic semantic gate is explicitly adjustable',len(run(p=[0,0,12,0,0],respect_semantics=False).finish())==5)
g=graph();g.mat[2:]=1;check('material boundary blocks by default',set(run(g).finish())=={0,1});check('cross material explicit option',len(run(g,cross_material=True).finish())==5)
g=graph();g.dot[3]=0.;g.dot[4]=0.;check('sharp normal adjacency stops growth',len(run(g).finish())<5)
g=graph();g.normals[2:]=[1,0,0];check('global seed-normal envelope prevents accumulated drift',set(run(g).finish())=={0,1})
check('disconnected faces are not reached',set(run(graph(edges=[(0,1),(2,3),(3,4)])).finish())=={0,1})
check('geodesic distance limit',set(run(radius_percent=1.5).finish())=={0,1})
engine=run(max_faces=3);check('face cap enforced',len(engine.finish())==3 and '面数上限' in engine.reason)
engine=run();engine.cancel_requested=True;check('cancellation honored before writes',len(engine.finish())==0 and engine.cancelled)
engine=run(max_seconds=.001);engine.started-=1;check('wall time cap enforced',len(engine.finish())==0 and '时间上限' in engine.reason)
try:run(p=[12,0,0,0,0],s=[2,1,1,1,1]);bad=False
except ValueError:bad=True
check('protected seed is rejected rather than overwritten',bad)
# Geometry-only graph building fixtures, with source guards bypassed only in this test process.
a.quick_guard=lambda o:None
def mesh(name,coords,faces):
 me=bpy.data.meshes.new(name);me.from_pydata(coords,[],faces);me.update();o=bpy.data.objects.new(name,me);o['_sgo_object_id']=name;return o
o=mesh('uv-seam-fixture',[(0,0,0),(1,0,0),(0,1,0),(1,0,0),(1,1,0),(0,1,0)],[(0,1,2),(3,4,5)])
g=a.FaceGraph.from_mesh(o,True);g0=a.FaceGraph.from_mesh(o,False)
check('complete exact coincident edge bridges split indices',g.info['adjacentUndirectedEdges']==1 and g.info['exactCoincidentSeamBridges']==1 and g0.info['adjacentUndirectedEdges']==0)
o2=mesh('near-seam-fixture',[(0,0,0),(1,0,0),(0,1,0),(1,0,.000001),(1,1,.000001),(0,1,.000001)],[(0,1,2),(3,4,5)])
check('nearby but noncoincident surfaces never bridged',a.FaceGraph.from_mesh(o2,True).info['adjacentUndirectedEdges']==0)
o3=mesh('nonmanifold-fixture',[(0,0,0),(1,0,0),(0,1,0),(0,-1,0),(0,0,1)],[(0,1,2),(1,0,3),(0,1,4)])
check('nonmanifold edge is conservatively blocked',a.FaceGraph.from_mesh(o3,True).info['blockedNonmanifoldEdgeGroups']==1)
report['status']='passed';(R/'reports/growth-boundaries.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('BOUNDARY_TEST_COMPLETE',flush=True)
