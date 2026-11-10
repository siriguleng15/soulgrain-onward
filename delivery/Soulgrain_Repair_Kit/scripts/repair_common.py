"""Read source, preserve a complete source scene, build auditable real repair meshes."""
import bpy,bmesh,json,hashlib,sys,importlib.util,os
from pathlib import Path
import numpy as np
from mathutils import Vector
R=Path(__file__).resolve().parents[1]
def load_reader():
 spec=importlib.util.spec_from_file_location('source_reader',str(R/'scripts/source_reader.py'));a=importlib.util.module_from_spec(spec);sys.modules['source_reader']=a;spec.loader.exec_module(a);return a

def create_base():
 bpy.ops.wm.open_mainfile(filepath=str(R/'inputs/SOUL.NEW.blend'),use_scripts=False,load_ui=False)
 if bpy.context.object and bpy.context.object.mode!='OBJECT':bpy.ops.object.mode_set(mode='OBJECT')
 a=load_reader();source_scene=bpy.context.scene;source_scene.name='SOURCE_UNCHANGED__ORIGINAL_LABELS';meta=a.meta(source_scene);sources=a.objects(meta);source_records={uid:{'mesh':a.mesh_signature(o.data),'object':a.object_signature(o),'labels':[a.digest(x) for x in a.read_labels(o.data)],'fid':a.digest(a.face_ids(o.data))} for uid,o in sources.items()};resources=a.resource_signature()
 scene=bpy.data.scenes.new('REPAIR_A__REAL_GEOMETRY');scene.unit_settings.system=source_scene.unit_settings.system;scene.unit_settings.scale_length=source_scene.unit_settings.scale_length;bpy.context.window.scene=scene
 copies={}
 for ob in source_scene.objects:
  clone=ob.copy();clone.name='WORK_'+ob.name
  if ob.type=='MESH':clone.data=ob.data.copy()
  clone.hide_select=False;scene.collection.objects.link(clone);copies[ob]=clone
 for ob,clone in copies.items():
  clone.parent=copies.get(ob.parent);clone.matrix_world=ob.matrix_world.copy();clone.hide_set(False)
  if clone.type=='MESH':
   clone['repair_source_object_id']=ob.get('_sgo_object_id','');clone.pop('_sgo_object_id',None);clone.data.polygons.foreach_set('hide',np.zeros(len(clone.data.polygons),bool));clone.data.polygons.foreach_set('select',np.zeros(len(clone.data.polygons),bool))
 scene.world=source_scene.world;scene.camera=copies.get(source_scene.camera)
 for ob in source_scene.objects:ob.hide_select=True
 scene['REPAIR_NOTICE']='真实几何修复副本；源场景与原人工标注完整保留。不得在本修复场景运行旧语义工具的拓扑校验/自动归类。'
 scene['repair_input_sha256']=hashlib.sha256((R/'inputs/SOUL.NEW.blend').read_bytes()).hexdigest()
 scene['repair_source_records']=json.dumps(source_records);scene['repair_source_resources']=json.dumps(resources)
 return a,source_scene,scene,sources,{uid:copies[ob] for uid,ob in sources.items()}

def sources_and_work(a):
 source_scene=bpy.data.scenes['SOURCE_UNCHANGED__ORIGINAL_LABELS'];meta=a.meta(source_scene)
 sources={o.get('_sgo_object_id'):o for o in source_scene.objects if o.type=='MESH'}
 work={o.get('repair_source_object_id'):o for o in bpy.context.scene.objects if o.type=='MESH' and o.get('repair_source_object_id')}
 return source_scene,sources,work

def verify_source(a,scene,sources):
 records=json.loads(scene['repair_source_records']);problems=[]
 for uid,o in sources.items():
  old=records[uid]
  if a.mesh_signature(o.data)!=old['mesh']:problems.append(o.name+' source mesh/UV/normals changed')
  # hide_select is deliberately view-only; parents/transforms/materials stay exact.
  if a.object_signature(o)!=old['object']:problems.append(o.name+' source transforms/material slots changed')
  if [a.digest(x) for x in a.read_labels(o.data)]!=old['labels']:problems.append(o.name+' source semantic labels changed')
  if a.digest(a.face_ids(o.data))!=old['fid']:problems.append(o.name+' source face IDs changed')
 saved=json.loads(scene['repair_source_resources']);current=a.resource_signature()
 for typ in ['materials','images']:
  for name,value in saved[typ].items():
   if current[typ].get(name)!=value:problems.append('source '+typ+' changed '+name)
 assert not problems,problems
 return {'original_source_objects':len(sources),'all_source_geometry_uv_normals_labels_ids_exact':True,'original_materials_and_images_exact':True,'unknown_source_reclassified':0}

def delete_source_faces(work,sources,global_indices,reason):
 # Global face numbering used by combined.npz is debug followed by main body.
 names=['DEBUG_LACES_VISIBILITY_ONLY','Shoe_TEST_V3'];start=0;records=[]
 for name in names:
  uid=next(u for u,o in sources.items() if o.name==name);src=sources[uid];n=len(src.data.polygons);ids=np.asarray(global_indices,dtype='i4');ids=ids[(ids>=start)&(ids<start+n)]-start;start+=n
  if not len(ids):continue
  a=load_reader();parts,states,conf,issues=a.read_labels(src.data)
  assert np.all(parts[ids]!=0),'Never remove or reclassify UNKNOWN source faces'
  ob=work[uid];bm=bmesh.new();bm.from_mesh(ob.data);bm.faces.ensure_lookup_table();fid=bm.faces.layers.int.get('sgo_source_face');wanted=set(ids.tolist());faces=[f for f in bm.faces if f[fid] in wanted];assert len(faces)==len(ids),(name,len(faces),len(ids));bmesh.ops.delete(bm,geom=faces,context='FACES');bm.to_mesh(ob.data);bm.free();ob.data.update()
  records.append({'object_id':uid,'source_object':name,'source_face_ids':ids.tolist(),'faces':len(ids),'reason':reason,'source_original_preserved':True,'human':int((states[ids]==2).sum()),'reviewed_auto':int((states[ids]==1).sum())})
 return records

def material(name,color,rough=.65):
 m=bpy.data.materials.get(name)
 if m:return m
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1);n=m.node_tree.nodes['Principled BSDF'];n.inputs['Base Color'].default_value=(*color,1);n.inputs['Roughness'].default_value=rough;return m

def new_patch(name,filename=None,color=(.83,.81,.75)):
 z=np.load(R/'reports'/((filename or name)+'.npz'));v=z['v'];f=z['f'];me=bpy.data.meshes.new(name);me.from_pydata(v.tolist(),[],f.tolist());me.update();ob=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(ob);me.materials.append(material('MAT_REPAIR_RUBBER_UNTEXTURED',color));
 for p in me.polygons:p.use_smooth=True
 ob['repair_geometry']='real editable mesh; not a display proxy';ob['repair_added_faces']=len(f);ob['repair_uv_status']='NEW UV only: local construction coordinates; not certified atlas-continuous'
 uv=me.uv_layers.new(name='REPAIR_LOCAL_UV');span=np.maximum(v.max(0)-v.min(0),1e-8);coords=(v[f.ravel()][:,[0,2]]-v.min(0)[[0,2]])/span[[0,2]];uv.data.foreach_set('uv',coords.astype('f4').ravel())
 a=me.attributes.new(name='repair_is_new',type='INT',domain='FACE');a.data.foreach_set('value',np.ones(len(f),'i4'));return ob

def save_stage(stage,report):
 scene=bpy.context.scene;scene.name='REPAIR_'+stage+'__REAL_GEOMETRY';scene['repair_stage']=stage;scene['repair_change_record']=json.dumps(report)
 for screen in bpy.data.screens:
  for area in screen.areas:
   if area.type=='VIEW_3D':
    space=area.spaces.active;space.shading.type='SOLID';space.shading.color_type='MATERIAL';space.region_3d.view_location=(0,0,-.04);space.region_3d.view_distance=3.1
 bpy.ops.object.select_all(action='DESELECT');ob=bpy.data.objects.get('REPAIR_TOECAP_SOLID')
 if ob and ob.name in scene.objects:ob.select_set(True);bpy.context.view_layer.objects.active=ob
 file=Path(os.environ.get('SOULGRAIN_REPAIR_OUTPUT',str(R/'stages')))/('Soulgrain_Stage_'+stage+'.blend');assert not file.exists(),file
 bpy.ops.wm.save_as_mainfile(filepath=str(file),check_existing=False,compress=True,relative_remap=False)
 report['file']=str(file);report['bytes']=file.stat().st_size;report['sha256']=hashlib.sha256(file.read_bytes()).hexdigest();(R/'reports'/('stage-'+stage+'-result.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2));print('STAGE_SAVED',stage,report['bytes'],flush=True)

def verify_remaining_work(a,sources,work):
 result=[]
 for uid,ob in work.items():
  src=sources[uid];fid=a.face_ids(ob.data);srcv=a.array(src.data.vertices,'co',3,'f4');srcf=a.array(src.data.loops,'vertex_index').reshape(-1,3);wv=a.array(ob.data.vertices,'co',3,'f4');wf=a.array(ob.data.loops,'vertex_index').reshape(-1,3)
  geometry=np.array_equal(wv[wf],srcv[srcf[fid]])
  uvs=True
  for layer in src.data.uv_layers:
   if layer.name not in ob.data.uv_layers:uvs=False;continue
   su=a.array(layer.data,'uv',2,'f4').reshape(-1,3,2);wu=a.array(ob.data.uv_layers[layer.name].data,'uv',2,'f4').reshape(-1,3,2);uvs &= np.array_equal(wu,su[fid])
  labels=all(np.array_equal(x,y[fid]) for x,y in zip(a.read_labels(ob.data),a.read_labels(src.data)))
  materials=np.array_equal(a.array(ob.data.polygons,'material_index'),a.array(src.data.polygons,'material_index')[fid]);sp=a.read_labels(src.data)[0];unknown=np.flatnonzero(sp==0);unknown_preserved=np.isin(unknown,fid).all()
  row={'source':src.name,'remaining_faces':len(fid),'geometry_exact_by_source_face_id':bool(geometry),'uv_exact_by_source_face_id':bool(uvs),'labels_exact_by_source_face_id':bool(labels),'material_indices_exact':bool(materials),'all_original_unknown_faces_retained':bool(unknown_preserved)};assert all(row[k] for k in row if k not in ['source','remaining_faces']),row;result.append(row)
 return result
