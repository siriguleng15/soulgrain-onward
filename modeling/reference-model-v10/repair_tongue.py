#!/usr/bin/env python3
"""Locally heal three AI-invented tongue eyelets, preserving the source shoe.

Run with Blender's Python:
  blender -b -t 2 --python modeling/reference-model-v10/repair_tongue.py

The three ROIs are measured against the unedited source top render, not the
shoe's real lacing eyelets. Only faces inside each tangent-plane cylinder are
replaced. Original source vertex IDs are retained; a bounded adjacency band is faired.
The front snap and geometry outside the documented repair band are retained.
"""
from pathlib import Path
import json
import hashlib
import numpy as np
import bpy
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'previews/reference-model-v10'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE_BLEND = Path('/tmp/xiezitu-inspection.blend')
SOURCE_V = Path('/tmp/xiezitu-v.npy')
SOURCE_F = Path('/tmp/xiezitu-f.npy')

# Centers/normals come from a robust quadratic fit to unoccluded cloth sampled
# in 16/20/24-pixel annuli around the confirmed false holes in source-top.png.
# The top camera is orthographic; these are source Blender-world units, NOT mm.
PATCHES = [
    dict(id='tongue-false-eyelet-1', sourceTopPixel=[388, 294],
         center=[-.2452274616, .1714355883, .06614784],
         normal=[-.50700650, .66680217, .54618612],
         u=[.73279379, 0., .68045078], radius=.046, minimumDepth=-.030),
    dict(id='tongue-false-eyelet-2', sourceTopPixel=[480, 247],
         center=[-.044028586, .2742219704, .11451284],
         normal=[-.43925250, .78055022, .44474554],
         u=[.71148709, 0., .70269834], radius=.060, minimumDepth=-.030),
    dict(id='tongue-false-eyelet-3', sourceTopPixel=[484, 290],
         center=[-.0352808088, .1801833655, .26603902],
         normal=[-.48200396, .68286625, .54896800],
         u=[.75126150, 0., .66000524], radius=.055, minimumDepth=-.040),
]


def face_components(triangles):
    """Split the candidate ROI so a nearby lace is never healed as cloth."""
    parent = np.arange(len(triangles))
    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    ids = triangles.ravel()
    owner = np.repeat(np.arange(len(triangles)), 3)
    order = np.argsort(ids)
    same = np.flatnonzero(np.diff(ids[order]) == 0)
    for position in same:
        a, b = find(owner[order[position]]), find(owner[order[position+1]])
        if a != b:
            parent[b] = a
    labels = np.asarray([find(i) for i in range(len(triangles))])
    return [np.flatnonzero(labels == label) for label in np.unique(labels)]


def oriented_boundary_loops(triangles):
    directed = np.concatenate((triangles[:, [0, 1]], triangles[:, [1, 2]], triangles[:, [2, 0]]))
    sorted_edges = np.sort(directed, axis=1)
    _, inverse, counts = np.unique(sorted_edges, axis=0, return_inverse=True, return_counts=True)
    boundary = directed[counts[inverse] == 1]
    next_vertex = {}
    previous = {}
    for a, b in boundary:
        a, b = int(a), int(b)
        if a in next_vertex or b in previous:
            raise RuntimeError('ROI boundary branches; reject the local repair.')
        next_vertex[a] = b
        previous[b] = a
    if set(next_vertex) != set(previous):
        raise RuntimeError('ROI does not produce closed boundary loops.')
    loops = []
    unused = set(next_vertex)
    while unused:
        start = min(unused)
        loop = [start]
        unused.remove(start)
        cursor = next_vertex[start]
        while cursor != start:
            if cursor not in unused:
                raise RuntimeError('ROI boundary is not a simple closed loop.')
            loop.append(cursor)
            unused.remove(cursor)
            cursor = next_vertex[cursor]
        loops.append(np.asarray(loop, dtype=np.int64))
    return loops


def cap_loop(loop, source, center, normal, u, v, vertex_output, outside_normals):
    points = source[loop]
    midpoint = points.mean(axis=0)
    normals = outside_normals[loop].copy()
    normals /= np.maximum(1e-12, np.linalg.norm(normals, axis=1))[:, None]
    inward = midpoint-points
    # Use the tangent of the unchanged adjacent cloth. The loops can turn
    # around the cloth edge, so a planar height field would create pinches.
    derivative = inward-normals*np.sum(normals*inward, axis=1)[:, None]
    depth = (points-center)@normal
    rings = [loop.tolist()]
    for fraction in [.875, .75, .625, .5, .375, .25, .125]:
        t = 1-fraction
        h00 = 2*t**3-3*t*t+1
        h10 = t**3-2*t*t+t
        h01 = -2*t**3+3*t*t
        new = h00*points+h10*derivative+h01*midpoint
        ids = []
        for point in new:
            ids.append(len(vertex_output))
            vertex_output.append(point.tolist())
        rings.append(ids)
    faces = []
    for outside, inside in zip(rings, rings[1:]):
        for j in range(len(loop)):
            k = (j+1) % len(loop)
            faces.extend([[outside[j], outside[k], inside[k]],
                          [outside[j], inside[k], inside[j]]])
    final_center = len(vertex_output)
    vertex_output.append(midpoint.tolist())
    for j in range(len(loop)):
        faces.append([rings[-1][j], rings[-1][(j+1) % len(loop)], final_center])
    return faces, {'boundaryVertices': len(loop), 'boundaryDepthMean': float(depth.mean()),
                   'method': '3D Hermite cap with unchanged adjacent-cloth tangents',
                   'newVertices': 7*len(loop)+1, 'newFaces': len(faces)}


source = np.load(SOURCE_V).astype(np.float64)
faces = np.load(SOURCE_F).astype(np.int64)
centroids = source[faces].mean(axis=1)
source_cross = np.cross(source[faces[:, 1]]-source[faces[:, 0]], source[faces[:, 2]]-source[faces[:, 0]])
source_normal_sum = np.zeros_like(source)
for corner in range(3):
    np.add.at(source_normal_sum, faces[:, corner], source_cross)
vertices = source.tolist()
deleted = np.zeros(len(faces), dtype=bool)
caps = []
reports = []
for patch in PATCHES:
    center = np.asarray(patch['center'], dtype=float)
    normal = np.asarray(patch['normal'], dtype=float)
    normal /= np.linalg.norm(normal)
    u = np.asarray(patch['u'], dtype=float)
    u -= normal*(u@normal)
    u /= np.linalg.norm(u)
    v = np.cross(normal, u)
    delta = centroids-center
    radius = np.hypot(delta@u, delta@v)
    depth = delta@normal
    selected = (radius < patch['radius']) & (depth > patch['minimumDepth']) & (depth < .060)
    selected_ids = np.flatnonzero(selected)
    components = face_components(faces[selected_ids])
    if len(components) > 1:
        # The nearby laces can enter the tangent cylinder but form a separate
        # disk. Only the largest annular tongue component is eligible.
        largest = max(components, key=len)
        selected[:] = False
        selected[selected_ids[largest]] = True
    discarded = int(len(selected_ids)-selected.sum())
    if np.any(selected & deleted):
        raise RuntimeError('Two local repair ROIs overlap.')
    loops = oriented_boundary_loops(faces[selected])
    if len(loops) != 2:
        raise RuntimeError(f"{patch['id']}: expected two cloth skin loops, got {len(loops)}")
    cap_details = []
    cap_start = len(caps)
    outside_normals = source_normal_sum.copy()
    for corner in range(3):
        np.add.at(outside_normals, faces[selected, corner], -source_cross[selected])
    for loop in loops:
        new_faces, detail = cap_loop(loop, source, center, normal, u, v, vertices, outside_normals)
        caps.extend(new_faces)
        cap_details.append(detail)
    deleted |= selected
    reports.append({**patch, 'normal': normal.tolist(), 'u': u.tolist(), 'v': v.tolist(),
                    'removedFaces': int(selected.sum()), 'nearbyFacesExcluded': discarded, 'capFaceStartWithinCaps': cap_start,
                    'capFaceCount': len(caps)-cap_start, 'loops': cap_details})

retained = faces[~deleted]
new_faces = np.r_[retained, np.asarray(caps, dtype=np.int64)]
new_vertices = np.asarray(vertices, dtype=np.float64)
assert np.array_equal(new_vertices[:len(source)], source)

# Fair a geodesic band so nearby laces cannot enter by spatial proximity.
# Only local cloth can move; the faded outer band and every other vertex stay
# fixed. The explicit movement bound is in uncalibrated source units.
unfaired = new_vertices.copy()
distance = np.full(len(new_vertices), -1, dtype=np.int16)
frontier = np.arange(len(source), len(new_vertices), dtype=np.int64)
distance[frontier] = 0
for ring in range(1, 16):
    is_front = np.zeros(len(new_vertices), dtype=bool)
    is_front[frontier] = True
    neighboring_faces = new_faces[np.any(is_front[new_faces], axis=1)]
    adjacent = np.unique(neighboring_faces)
    frontier = adjacent[distance[adjacent] < 0]
    distance[frontier] = ring
    if not len(frontier):
        break
active = np.flatnonzero((distance >= 0) & (distance < 15))
local = np.full(len(new_vertices), -1, dtype=np.int64)
local[active] = np.arange(len(active))
nearby = new_faces[np.any(local[new_faces] >= 0, axis=1)]
edges_local = np.unique(np.sort(np.concatenate((nearby[:, [0, 1]], nearby[:, [1, 2]], nearby[:, [2, 0]])), axis=1), axis=0)
directed = np.r_[edges_local, edges_local[:, ::-1]]
directed = directed[local[directed[:, 0]] >= 0]
owner = local[directed[:, 0]]
neighbors = directed[:, 1]
degree = np.bincount(owner, minlength=len(active)).astype(float)
t = distance[active]/15
weight = 1-t*t*(3-2*t)
for iteration in range(35):
    for coefficient in [.45, -.47]:
        mean = np.zeros((len(active), 3))
        for axis in range(3):
            mean[:, axis] = np.bincount(owner, weights=new_vertices[neighbors, axis], minlength=len(active))/degree
        new_vertices[active] += coefficient*weight[:, None]*(mean-new_vertices[active])
        movement = new_vertices[active]-unfaired[active]
        length = np.linalg.norm(movement, axis=1)
        maximum = np.where(active < len(source), .015, .025)
        new_vertices[active] = unfaired[active]+movement*np.minimum(1, maximum/np.maximum(1e-15, length))[:, None]
movement = np.linalg.norm(new_vertices[:len(source)]-source, axis=1)
source_moved = np.flatnonzero(movement > 1e-12)
outside = (distance[:len(source)] < 0) | (distance[:len(source)] >= 15)
assert np.array_equal(new_vertices[:len(source)][outside], source[outside])
fairing_report = {
    'method': '35 bounded Taubin pairs on cap plus 15 adjacency rings, faded and pinned at outer band',
    'affectedUsedVertices': int(len(active)),
    'movedOriginalVertices': int(len(source_moved)),
    'maximumOriginalVertexDisplacement': float(movement.max()),
    'maximumOutsideRepairBandDisplacement': float(movement[outside].max()),
    'maxDisplacementRelativeToShoeLength': float(movement.max()/1.90169072),
    'boundSourceUnits': .015,
}

# Verify the repaired USED surface. Unused original source vertices are retained
# intentionally so parent processing can preserve original vertex identities.
edges = np.concatenate((new_faces[:, [0, 1]], new_faces[:, [1, 2]], new_faces[:, [2, 0]]))
edge_sign = np.where(edges[:, 0] < edges[:, 1], 1, -1)
key = np.minimum(edges[:, 0], edges[:, 1])*len(new_vertices)+np.maximum(edges[:, 0], edges[:, 1])
order = np.argsort(key)
starts = np.r_[0, np.flatnonzero(np.diff(key[order]))+1]
counts = np.diff(np.r_[starts, len(order)])
winding = np.add.reduceat(edge_sign[order], starts)
if np.any(counts != 2) or np.any(winding != 0):
    raise RuntimeError('Repair did not produce a closed consistently wound two-manifold.')
a = new_vertices[new_faces[:, 0]]
b = new_vertices[new_faces[:, 1]]
c = new_vertices[new_faces[:, 2]]
areas = np.linalg.norm(np.cross(b-a, c-a), axis=1)/2
if np.any(areas < 1e-13):
    raise RuntimeError('Repair introduced degenerate triangles.')
used = np.unique(new_faces)
chi = int(len(used)-len(starts)+len(new_faces))
if chi != -104:
    raise RuntimeError(f'Expected genus reduction by three handles; actual Euler={chi}')

np.save('/tmp/repaired-positions.npy', new_vertices)
np.save('/tmp/repaired-faces.npy', new_faces)
np.save('/tmp/repaired-retained-source-face-ids.npy', np.flatnonzero(~deleted))
np.save('/tmp/repaired-removed-source-face-ids.npy', np.flatnonzero(deleted))
report = {
    'operation': 'Remove three AI-invented ring/holes from broad folded tongue; retain actual front snap.',
    'sourceBlend': str(SOURCE_BLEND), 'coordinateSpace': 'Blender world X-length Y-side Z-up; source units, not millimetres',
    'sourceVertices': len(source), 'sourceFaces': len(faces),
    'originalVertexIndicesPreserved': True, 'maximumOriginalVertexDisplacement': float(movement.max()),
    'maximumOutsideRepairBandDisplacement': 0., 'fairing': fairing_report,
    'retainedOriginalFaces': len(retained), 'removedOriginalFaces': int(deleted.sum()),
    'repairedVerticesIncludingOriginalUnused': len(new_vertices),
    'usedVertices': len(used), 'unusedOriginalVerticesRetainedForIdentity': len(new_vertices)-len(used),
    'repairedFaces': len(new_faces), 'capFaceStart': len(retained), 'capFaceCount': len(caps),
    'newVertexStart': len(source), 'newVertexCount': len(new_vertices)-len(source),
    'boundaryEdges': int(np.sum(counts == 1)), 'nonManifoldEdges': int(np.sum(counts > 2)),
    'inconsistentSharedEdgeWinding': int(np.sum(winding != 0)),
    'degenerateTriangles': int(np.sum(areas < 1e-13)), 'usedSurfaceEulerCharacteristic': chi,
    'patches': reports,
    'preserved': ['Tongue front snap at source-top pixel 316,391',
                  'Actual laced-body and cuff eyelets', 'Shoe laces, cuff, straps, sole and all source positions outside the documented local repair band'],
    'limitations': ['Repair is based on supplied single-side reference and clearly invented tongue rings.',
                    'No UV or print exists in the uploaded source.',
                    'Smooth caps approximate missing cloth locally; they are not recovered factory topology.',
                    'No new real-world dimensional precision is asserted.'],
}
report_path = ROOT / 'modeling/reference-model-v10/tongue-repair.json'
report_path.write_text(json.dumps(report, indent=2)+'\n')
Path('/tmp/tongue-repair-report.json').write_text(json.dumps(report, indent=2)+'\n')

bpy.ops.wm.open_mainfile(filepath=str(SOURCE_BLEND))
o = next(o for o in bpy.data.objects if o.type == 'MESH' and len(o.data.vertices) > 100000)
materials = list(o.data.materials)
mesh = bpy.data.meshes.new('ONWARD_Tongue_LocalThreeHoleRepair')
mesh.vertices.add(len(new_vertices))
mesh.vertices.foreach_set('co', new_vertices.astype(np.float32).ravel())
mesh.loops.add(len(new_faces)*3)
mesh.loops.foreach_set('vertex_index', new_faces.astype(np.int32).ravel())
mesh.polygons.add(len(new_faces))
mesh.polygons.foreach_set('loop_start', (np.arange(len(new_faces), dtype=np.int32)*3))
mesh.polygons.foreach_set('loop_total', np.full(len(new_faces), 3, dtype=np.int32))
mesh.polygons.foreach_set('use_smooth', np.ones(len(new_faces), dtype=bool))
mesh.update(calc_edges=True, calc_edges_loose=True)
for material in materials:
    mesh.materials.append(material)
old = o.data
o.data = mesh
o.matrix_world = Matrix.Identity(4)
o.name = 'ONWARD_SourceWithLocalTongueRepair'
o['repair_report'] = json.dumps(report)
if old.users == 0:
    bpy.data.meshes.remove(old)
bpy.ops.wm.save_as_mainfile(filepath='/tmp/xiezitu-tongue-repaired.blend')

scene = bpy.context.scene
scene.cycles.samples = 12
points = [o.matrix_world@Vector(p) for p in o.bound_box]
center = sum(points, Vector())/8
camera = scene.camera
for name, direction in [('tongue-repair-top', (0, 0, 1)),
                        ('tongue-repair-quarter', (-.9, -1, .65))]:
    camera.location = center+Vector(direction).normalized()*5
    camera.rotation_euler = (center-camera.location).to_track_quat('-Z', 'Y').to_euler()
    rotation = camera.rotation_euler.to_matrix().transposed()
    projected = [rotation@(p-center) for p in points]
    width = max(p.x for p in projected)-min(p.x for p in projected)
    height = max(p.y for p in projected)-min(p.y for p in projected)
    camera.data.ortho_scale = max(width, height*1000/750)*1.15
    scene.render.filepath = str(OUT / (name+'.png'))
    bpy.ops.render.render(write_still=True)
print(json.dumps({'report': str(report_path), 'removedFaces': int(deleted.sum()),
                  'newFaces': len(new_faces), 'euler': chi}, indent=2))
