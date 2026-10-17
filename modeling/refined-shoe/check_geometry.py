"""Read-only validation of the two V7 garment poses.

blender --background --threads 2 --python-exit-code 1 --python check_geometry.py

Only the new shaft/tongue cloth and the listed neighbouring parts are tested.
This is not a photogrammetry score, cloth simulation or manufacturing check.
The .blend and source files are never saved. JSON results are printed to stdout.
An optional .blend path can follow ``--``. Default: the sibling V7 project.
"""
import json
import math
import sys
from collections import Counter
from pathlib import Path

import bpy
from mathutils.bvhtree import BVHTree


def sub(a, b):
    return tuple(x - y for x, y in zip(a, b))


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def segment_enters_triangle(p, q, a, b, c):
    """Proper interior crossing; shared edges/coplanar contact are excluded."""
    direction, e1, e2 = sub(q, p), sub(b, a), sub(c, a)
    h = cross(direction, e2)
    det = dot(e1, h)
    if abs(det) < 1e-19:
        return False
    inverse = 1.0 / det
    s = sub(p, a)
    u = inverse * dot(s, h)
    if not 1e-5 < u < 1 - 1e-5:
        return False
    r = cross(s, e1)
    v = inverse * dot(direction, r)
    if v < 1e-5 or u + v > 1 - 1e-5:
        return False
    t = inverse * dot(e2, r)
    return 1e-5 < t < 1 - 1e-5


def triangles_cross(a, b):
    return any(segment_enters_triangle(a[k], a[(k + 1) % 3], *b)
               for k in range(3)) or any(
        segment_enters_triangle(b[k], b[(k + 1) % 3], *a)
        for k in range(3))


def snapshot(name, depsgraph):
    obj = bpy.data.objects[name]
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    points = [tuple(obj.matrix_world @ v.co) for v in mesh.vertices]
    triangles = [tuple(t.vertices) for t in mesh.loop_triangles]
    layer = mesh.uv_layers.active
    uvs = [tuple(tuple(layer.data[i].uv) for i in t.loops)
           for t in mesh.loop_triangles] if layer else []
    edges = Counter()
    for polygon in mesh.polygons:
        ids = list(polygon.vertices)
        for a, b in zip(ids, ids[1:] + ids[:1]):
            edges[tuple(sorted((a, b)))] += 1
    tree = BVHTree.FromPolygons(points, triangles, all_triangles=True,
                               epsilon=1e-10)
    evaluated.to_mesh_clear()
    return {"points": points, "triangles": triangles, "uvs": uvs,
            "edges": edges, "tree": tree}


def triangle(data, index):
    return [data["points"][i] for i in data["triangles"][index]]


def bounds(points):
    return [[min(p[k] for p in points), max(p[k] for p in points)]
            for k in range(len(points[0]))] if points else None


def self_check(data):
    areas = []
    for ids in data["triangles"]:
        a, b, c = [data["points"][i] for i in ids]
        normal = cross(sub(b, a), sub(c, a))
        areas.append(0.5 * math.sqrt(dot(normal, normal)))
    broad = proper = 0
    crossing_uvs = []
    crossing_xyz = []
    samples = []
    for i, j in data["tree"].overlap(data["tree"]):
        if i >= j or not set(data["triangles"][i]).isdisjoint(
                data["triangles"][j]):
            continue
        broad += 1
        if triangles_cross(triangle(data, i), triangle(data, j)):
            proper += 1
            if data["uvs"]:
                crossing_uvs.extend(data["uvs"][i] + data["uvs"][j])
            crossing_xyz.extend(triangle(data, i) + triangle(data, j))
            if len(samples) < 8:
                samples.append({"triangles": [i, j],
                                "first_xyz_m": triangle(data, i),
                                "second_xyz_m": triangle(data, j),
                                "first_uv": data["uvs"][i] if data["uvs"] else (),
                                "second_uv": data["uvs"][j] if data["uvs"] else ()})
    return {"vertices": len(data["points"]),
            "triangles": len(data["triangles"]),
            "boundary_edges": sum(n == 1 for n in data["edges"].values()),
            "nonmanifold_edges": sum(n != 2 for n in data["edges"].values()),
            "zero_area_triangles": sum(a < 1e-14 for a in areas),
            "minimum_triangle_area_m2": min(areas),
            "nonadjacent_bvh_contacts": broad,
            "proper_self_crossings": proper,
            "self_crossing_uv_bounds": bounds(crossing_uvs),
            "self_crossing_xyz_bounds_m": bounds(crossing_xyz),
            "self_crossing_samples": samples}


def pair_check(a, b, root_t_max=None):
    """Only an explicitly named attachment can use the tiny t=0 seam band.

    Every corner of a cloth triangle must lie in that band. An intersection
    merely close to a seam in XYZ is not silently discarded.
    """
    counts = {"attachment": 0, "non_attachment": 0}
    uv_points = {key: [] for key in counts}
    xyz_points = {key: [] for key in counts}
    samples = []
    for i, j in a["tree"].overlap(b["tree"]):
        ta, tb = triangle(a, i), triangle(b, j)
        if not triangles_cross(ta, tb):
            continue
        uvs = a["uvs"][i] if a["uvs"] else ()
        at_root = (root_t_max is not None and uvs and
                   all(-1e-6 <= uv[1] <= root_t_max for uv in uvs))
        bucket = "attachment" if at_root else "non_attachment"
        counts[bucket] += 1
        uv_points[bucket].extend(uvs)
        # These bounds encompass whole intersecting triangles, not just the
        # intersection segment. Large source triangles can extend below roots.
        xyz_points[bucket].extend(ta + tb)
        if bucket == "non_attachment" and len(samples) < 12:
            samples.append({"cloth_triangle": i, "other_triangle": j,
                            "cloth_uv": uvs,
                            "cloth_triangle_xyz_m": ta,
                            "other_triangle_xyz_m": tb})
    return {"allowed_root_t_max": root_t_max,
            "attachment_crossing_triangle_pairs": counts["attachment"],
            "non_attachment_crossing_triangle_pairs": counts["non_attachment"],
            "attachment_cloth_uv_bounds": bounds(uv_points["attachment"]),
            "non_attachment_cloth_uv_bounds": bounds(uv_points["non_attachment"]),
            "attachment_triangle_xyz_bounds_m": bounds(xyz_points["attachment"]),
            "non_attachment_triangle_xyz_bounds_m": bounds(xyz_points["non_attachment"]),
            "non_attachment_samples": samples}


project = Path(__file__).resolve().with_name("soulgrain_onward_refined_v7.blend")
if "--" in sys.argv and sys.argv.index("--") + 1 < len(sys.argv):
    project = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
bpy.ops.wm.open_mainfile(filepath=str(project))
panels = ["Convertible_Shaft", "Convertible_Tongue"]
# 0.012 is the first 1.2% of the shared garment UV length, at the attached
# t=0 root only. The free tongue/shaft and tongue/laces never get an exemption.
pairs = [("Convertible_Shaft", "Convertible_Tongue", None),
         ("Convertible_Tongue", "Original_Lower_Laces", None),
         ("Convertible_Tongue", "Draped_Lace_Ends", None),
         ("Convertible_Shaft", "Original_Lower_Laces", None),
         ("Convertible_Shaft", "Draped_Lace_Ends", None),
         ("Convertible_Tongue", "Shoe_Body", 0.012),
         ("Convertible_Tongue", "Original_Vamp", 0.012),
         ("Convertible_Tongue", "Inner_Lining", 0.012),
         ("Convertible_Shaft", "Shoe_Body", 0.012),
         ("Convertible_Shaft", "Inner_Lining", 0.012),
         ("Convertible_Shaft", "Original_Vamp", 0.012)]
names = set(panels + [name for a, b, _ in pairs for name in (a, b)])
missing = names - set(bpy.data.objects.keys())
assert not missing, f"Required V7 parts are missing: {sorted(missing)}"
result = {"project": str(project), "blender": bpy.app.version_string,
          "scope": "Two discrete endpoint poses; no intermediate cloth simulation.",
          "excluded": "Hardware, binding, stitches and original-source self intersections are outside this cloth clearance check.",
          "modes": {}}
failures = []
for weight, mode in [(0, "folded"), (1, "upright")]:
    for obj in bpy.data.objects:
        if obj.type == "MESH" and obj.data.shape_keys:
            for key in obj.data.shape_keys.key_blocks:
                if key.name != "Basis":
                    key.value = weight
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    meshes = {name: snapshot(name, depsgraph) for name in names}
    checks = {"cloth": {}, "neighbours": {}}
    for name in panels:
        check = self_check(meshes[name])
        checks["cloth"][name] = check
        if any(check[k] for k in ("boundary_edges", "nonmanifold_edges",
                                 "zero_area_triangles", "proper_self_crossings")):
            failures.append(f"{mode}: cloth topology/self-crossing: {name}")
    for a, b, root_t in pairs:
        check = pair_check(meshes[a], meshes[b], root_t)
        checks["neighbours"][f"{a} / {b}"] = check
        if check["non_attachment_crossing_triangle_pairs"]:
            failures.append(f"{mode}: non-attachment crossing: {a} / {b}")
    result["modes"][mode] = checks
result["passed"] = not failures
result["failures"] = failures
print(json.dumps(result, ensure_ascii=False, indent=2), flush=True)
assert not failures, "Geometry checks failed; inspect the explicitly reported contacts."
