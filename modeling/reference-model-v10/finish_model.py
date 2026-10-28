"""Build independent corrected/editable and iPad review assets.

Run repair_tongue.py, then system Python calibrate_model.py, then this file in
Blender. Uploaded source and all older assets are read-only. Coordinate units
remain the upload's normalization; the paper calibration is never rescaled.
"""
from pathlib import Path
import sys, json, hashlib, shutil, math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = ROOT/'public/reference-model-v10'
OUT.mkdir(parents=True, exist_ok=True)
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
SOURCE=(Path(args[args.index('--source')+1]) if '--source' in args else
        OUT/'xiezitu-original.glb' if (OUT/'xiezitu-original.glb').exists() else
        Path('/workspace/attachments/76bb384e-7fe8-4abc-b336-1eab6ec2157d/xiezitu.glb'))
SOURCE_HASH = 'b890baa9f1f6e9e04110d2dffa2e422e6c444f1b7e49c3ae6d57cc7659a02897'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == SOURCE_HASH
v0, f0 = np.load('/tmp/xiezitu-v.npy'), np.load('/tmp/xiezitu-f.npy')
v, f = np.load('/tmp/xiezitu-final-v.npy'), np.load('/tmp/xiezitu-final-f.npy')
repair = json.loads((HERE/'tongue-repair.json').read_text())
profile = json.loads((HERE/'profile-correction.json').read_text())
calibration = json.loads((HERE/'photo-calibration.json').read_text())
reg = calibration['registration']

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.meshes):
    if block.users == 0:
        bpy.data.meshes.remove(block)
scene = bpy.context.scene

def mesh_object(name, vertices, triangles, collection=None):
    mesh = bpy.data.meshes.new(name+'_Geometry')
    mesh.vertices.add(len(vertices))
    mesh.vertices.foreach_set('co', np.asarray(vertices, dtype=np.float32).ravel())
    mesh.loops.add(len(triangles)*3)
    mesh.loops.foreach_set('vertex_index', np.asarray(triangles, dtype=np.int32).ravel())
    mesh.polygons.add(len(triangles))
    mesh.polygons.foreach_set('loop_start', np.arange(len(triangles), dtype=np.int32)*3)
    mesh.polygons.foreach_set('loop_total', np.full(len(triangles), 3, dtype=np.int32))
    mesh.polygons.foreach_set('use_smooth', np.ones(len(triangles), dtype=bool))
    mesh.update(calc_edges=True)
    obj = bpy.data.objects.new(name, mesh)
    (collection or scene.collection).objects.link(obj)
    return obj

def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = .68
    bs.inputs['Specular IOR Level'].default_value = .24
    mat.diffuse_color = (*color, 1)
    return mat

clay = material('Neutral_Geometry_Review', (.43, .48, .53))
source_collection = bpy.data.collections.new('01_Uploaded_Source_Preserved')
scene.collection.children.link(source_collection)
source = mesh_object('Uploaded_Xiezitu_Original_HQ', v0, f0, source_collection)
source.data.materials.append(clay)
source['source_sha256'] = SOURCE_HASH
source['units_note'] = 'Uncalibrated source normalization, NOT physical millimetres.'
source['bridgeRole'] = 'excluded'
corrected_collection = bpy.data.collections.new('02_Corrected_Editable_HighResolution')
scene.collection.children.link(corrected_collection)
corrected = mesh_object('ONWARD_Corrected_HighResolution', v, f, corrected_collection)
corrected.data.materials.append(clay)
corrected['bridgeRole'] = 'excluded'
corrected['tongue_repair'] = json.dumps(repair)
corrected['profile_correction'] = json.dumps(profile)

# The real reference shows a closed shallow silver tongue snap. The source
# retained its location but rendered it as a recessed ring. Add a separate,
# editable cap seated on that original ring; this is not a new decoration.
sys.path.insert(0,str(HERE))
from fit_tongue_snap import fit_frame,REFERENCE
snap_reference=REFERENCE
snap_center,snap_normal,snap_fit=fit_frame(source)
snap_u = np.cross(snap_normal, np.array([0.,0.,1.]))
snap_u /= np.linalg.norm(snap_u)
snap_v = np.cross(snap_normal,snap_u)
cap_vertices = []; cap_faces = []; segments=48; snap_radius=.045
ring_profile = [(0.,.005),(.5,.0045),(.86,.003),(1.,0.),(1.,-.003),(.86,-.004),(0.,-.0045)]
cap_rings=[]
for fraction,height in ring_profile:
    if fraction==0:
        cap_rings.append([len(cap_vertices)])
        cap_vertices.append((snap_center+snap_normal*height).tolist())
    else:
        ring=[]
        for j in range(segments):
            a=j/segments*math.tau
            ring.append(len(cap_vertices))
            cap_vertices.append((snap_center+snap_u*(snap_radius*fraction*math.cos(a))+snap_v*(snap_radius*fraction*math.sin(a))+snap_normal*height).tolist())
        cap_rings.append(ring)
for a,b in zip(cap_rings,cap_rings[1:]):
    for j in range(segments):
        k=(j+1)%segments
        if len(a)==1:cap_faces.append([a[0],b[j],b[k]])
        elif len(b)==1:cap_faces.append([a[j],b[0],a[k]])
        else:cap_faces.extend([[a[j],b[j],b[k]],[a[j],b[k],a[k]]])
cap=mesh_object('Tongue_Original_Position_Snap_Cap',cap_vertices,cap_faces)
metal=material('Tongue_Snap_Silver',(.6,.65,.68))
bs=metal.node_tree.nodes.get('Principled BSDF');bs.inputs['Metallic'].default_value=.8;bs.inputs['Roughness'].default_value=.3
cap.data.materials.append(metal)
cap['bridgeRole']='excluded'
cap['reference']='Closed shallow silver snap visible on the exposed tongue in source photo03; original snap location retained.'

def selected_export(objects, file):
    for o in scene.objects:
        o.select_set(False)
    for o in objects:
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(filepath=str(file), export_format='GLB', use_selection=True,
        export_extras=True, export_texcoords=False, export_normals=True, export_materials='EXPORT')

def lod_of(obj, name, target=240000):
    copy = obj.copy()
    copy.data = obj.data.copy()
    copy.name = name
    scene.collection.objects.link(copy)
    for o in scene.objects:
        o.select_set(False)
    copy.select_set(True)
    bpy.context.view_layer.objects.active = copy
    mod = copy.modifiers.new('Review_LOD_Editable_Collapse', 'DECIMATE')
    mod.ratio = min(1, target/len(copy.data.polygons))
    mod.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in copy.data.polygons:
        p.use_smooth = True
    print('LOD', name, len(copy.data.vertices), len(copy.data.polygons), flush=True)
    return copy

source_lod = lod_of(source, 'Uploaded_Source_Review_LOD')
selected_export([source_lod], OUT/'source-preview.glb')
source_lod.hide_set(True)
source_lod.hide_render = True
source.hide_set(True)
source.hide_render = True
selected_export([corrected,cap], OUT/'corrected-high.glb')
review = lod_of(corrected, 'Corrected_Review_LOD')
corrected.hide_set(True)
corrected.hide_render = True

# Separate explicitly photo-estimated surface ROIs, retaining each existing
# triangle's actual geometry. Unclassified/occluded parts stay excluded.
positions = np.empty((len(review.data.vertices), 3), dtype=np.float64)
review.data.vertices.foreach_get('co', positions.ravel())
indices = np.empty(len(review.data.loops), dtype=np.int32)
review.data.loops.foreach_get('vertex_index', indices)
triangles = indices.reshape((-1, 3))
g = np.c_[positions[:, 0], positions[:, 2], -positions[:, 1]]
centers = g[triangles].mean(axis=1)
normal = np.cross(g[triangles[:, 1]]-g[triangles[:, 0]], g[triangles[:, 2]]-g[triangles[:, 0]])
normal /= np.maximum(np.linalg.norm(normal, axis=1)[:, None], 1e-15)
right, up = np.asarray(reg['rightWorld']), np.asarray(reg['upWorld'])
pixel = np.c_[reg['originXPx']+centers@right*reg['pixelsPerUnitX'], reg['originYPx']-centers@up*reg['pixelsPerUnitY']]

def inside(points, polygon):
    result = np.zeros(len(points), dtype=bool)
    x, y = points[:, 0], points[:, 1]
    for a, b in zip(polygon, np.roll(polygon, 1, axis=0)):
        result ^= ((a[1] > y) != (b[1] > y)) & (x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1]+1e-30)+a[0])
    return result

body_polygon = np.array([[333,561],[355,512],[430,482],[518,452],[589,408],[661,346],[713,277],[741,376],[766,458],[815,555]])
cuff_polygon = np.array([[703,218],[1113,130],[1207,413],[871,590]])
front = (normal@np.asarray(reg['viewDirectionWorld']) < -.22) & (centers[:, 2] > .015)
hardware = np.zeros(len(centers), dtype=bool)
for x, y, radius in [(765,258,26),(791,331,26),(818,400,26),(847,469,26),(876,542,26),(897,321,31),(729,505,29)]:
    hardware |= np.sum((pixel-[x,y])**2, axis=1) < radius*radius
design = json.loads((ROOT/'public/pattern-engineering/data/clasp-design.json').read_text())
for clasp in design['observed']['clasps']:
    corners = np.asarray(clasp['strip']['corners'])
    midpoint = corners.mean(axis=0)
    # A narrow safety margin avoids pretending a fused PU surface is cloth.
    hardware |= inside(pixel, midpoint+(corners-midpoint)*1.05)
    hardware |= np.sum((pixel-np.asarray(clasp['centerPhoto']))**2, axis=1) < (clasp['radiusPhotoPx']+3)**2
body = inside(pixel, body_polygon) & front & ~hardware
cuff = inside(pixel, cuff_polygon) & front & ~hardware & ~body

# Highlight the locally repaired tongue surfaces plus the visible front flap.
blender_centers = positions[triangles].mean(axis=1)
tongue = ((blender_centers[:,0] < .14) & (blender_centers[:,0] > -.68) &
          (blender_centers[:,1] > -.29) & (blender_centers[:,1] < .36) &
          (blender_centers[:,2] > .62*blender_centers[:,0]+.30))
for patch in repair['patches']:
    d = blender_centers-np.asarray(patch['center'])
    nn, uu, vv = (np.asarray(patch[k]) for k in ['normal','u','v'])
    tongue |= (np.hypot(d@uu,d@vv) < patch['radius']*1.15) & (np.abs(d@nn) < .075)
body &= ~tongue
cuff &= ~tongue
masks = [('Upper_Body_Cloth','body',body), ('Cuff_Cloth','cuff',cuff),
         ('Tongue_Flap_And_Local_Repairs','excluded',tongue),
         ('Footwear_Details_Unclassified','excluded',~(body|cuff|tongue))]
review_parts = []
# Share normals from the unsplit mesh; semantic partition borders are not seams.
vertex_normals = np.array([n.vector[:] for n in review.data.vertex_normals])
for name, role, mask in masks:
    subset = triangles[mask]
    if not len(subset):
        continue
    ids, inverse = np.unique(subset, return_inverse=True)
    part = mesh_object(name, positions[ids], inverse.reshape((-1,3)))
    part.data.materials.append(clay)
    part.data.normals_split_custom_set_from_vertices(vertex_normals[ids].tolist())
    part['bridgeRole'] = role
    part['classification'] = 'Photo-estimated visible cloth ROI; hardware and unobserved surfaces excluded.'
    part['units'] = 'uncalibrated-model-unit'
    review_parts.append(part)
selected_export(review_parts+[cap], OUT/'corrected.glb')
review.hide_set(True)
review.hide_render = True
for part in review_parts:
    part.hide_set(False)
    part.hide_render = False

# Deterministic geometry diagnostics for presentation reduction.
bpy.context.view_layer.update()
high_tree = BVHTree.FromObject(corrected, bpy.context.evaluated_depsgraph_get())
sample = positions[np.linspace(0, len(positions)-1, min(2000,len(positions)), dtype=int)]
errors = [high_tree.find_nearest(Vector(p))[3] for p in sample]
report = {
 'sourceSha256': SOURCE_HASH, 'units':'model-unit', 'productionReady':False,
 'sourceTriangles':int(len(f0)), 'correctedHighTriangles':int(len(f)+len(cap_faces)),
 'sourceReviewTriangles':len(source_lod.data.polygons),
 'correctedReviewTriangles':int(len(triangles)+len(cap_faces)),
 'semanticParts':[{'name':name,'bridgeRole':role,'triangles':int(mask.sum())} for name,role,mask in masks]+[{'name':cap.name,'bridgeRole':'excluded','triangles':len(cap_faces)}],
 'tongueSnapCap':{'sourcePositionReference':snap_reference.tolist(),'center':snap_center.tolist(),'normal':snap_normal.tolist(),'radiusModelUnits':snap_radius,'physicalDiameterMm':None,'visibleFaceFit':snap_fit},
 'reviewLodToHighSampleCount':len(errors),
 'reviewLodToHighMeanDistanceModelUnits':float(np.mean(errors)),
 'reviewLodToHighMaximumDistanceModelUnits':float(np.max(errors)),
 'lodErrorCaveat':'One-way sampled geometric reduction check, not a full Hausdorff distance or real-world dimension error.',
 'classificationCaveat':'Single-view estimated surface regions. No claim that fused AI hardware hides a recovered cloth layer.',
}
(HERE/'model-validation.json').write_text(json.dumps(report,indent=2)+'\n')
if SOURCE.resolve() != (OUT/'xiezitu-original.glb').resolve():
    shutil.copy2(SOURCE, OUT/'xiezitu-original.glb')
shutil.copy2(HERE/'tongue-repair.json', OUT/'tongue-repair.json')
shutil.copy2(HERE/'profile-correction.json', OUT/'profile-correction.json')
shutil.copy2(HERE/'model-validation.json', OUT/'model-validation.json')

# The editable project preserves original HQ, repaired HQ and review parts.
scene['source_upload_sha256'] = SOURCE_HASH
scene['engineering_units_note'] = 'Paper millimetres and uploaded-model coordinates remain separate.'
scene['profile_registration'] = json.dumps(reg)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'onward-model-v10-editable.blend'), compress=True)

metadata = {
 'schemaVersion':1, 'sourcePreviewFile':'source-preview.glb', 'sourceFile':'xiezitu-original.glb',
 'correctedFile':'corrected.glb', 'highResolutionFile':'corrected-high.glb', 'correctedDownloadFile':'corrected-high.glb',
 'blenderFile':'onward-model-v10-editable.blend', 'units':'uncalibrated-model-unit',
 'scaleNote':'上传模型未标定真实长度。模型坐标不当作毫米；裁片保持原来的毫米坐标与原始轮廓。',
 'sourceSha256':SOURCE_HASH, 'correctedSha256':hashlib.sha256((OUT/'corrected.glb').read_bytes()).hexdigest(),
 'tongueObjectNames':['Tongue_Flap_And_Local_Repairs',cap.name], 'photoRegistration':reg,
 'corrections':['移除 AI 在鞋舌远侧额外生成的三处鞋眼孔及局部圈边，补回连续布面；保留前方扣件位置并补为参考图中的浅凸银色闭合扣帽。',
   '局部补面与小范围平顺处理保留修补邻域外的源几何；闭合边、面绕序和退化面单独检查。',
   '以最终白色皮条效果图约束翻筒与皮条的可见关系，进行限幅的外侧鞋面轮廓校准；鞋底保护区保持不变。',
   '单独保留上传原版、高精度修正版、展示网格及可编辑 Blender 工程。'],
 'notes':['模型原文件没有 UV 或纹理，本轮保留中性几何材质。',
   '外翻鞋舌的隐藏面和背面仅由当前模型与单张照片约束，尚未经实物核验。',
   '布面分类来自照片中的可见区域，遮挡处不会强行绑定到皮条或扣具。'],
}
(OUT/'model-data.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
manifest={'schemaVersion':1,'units':'uncalibrated-model-unit','productionReady':False,'files':{name:{'bytes':(OUT/name).stat().st_size,'sha256':hashlib.sha256((OUT/name).read_bytes()).hexdigest()} for name in ['xiezitu-original.glb','source-preview.glb','corrected.glb','corrected-high.glb','onward-model-v10-editable.blend']}}
(OUT/'asset-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('FINISHED_MODEL',json.dumps(report),flush=True)
