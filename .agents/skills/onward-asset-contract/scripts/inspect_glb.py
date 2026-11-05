#!/usr/bin/env python3
"""Read-only, standard-library GLB contract check. Never exports or updates assets."""
import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
import struct
import sys

BASELINE = "fea6c0e753ca0b4ba6b2e32b52ae57ff57a3b1e6"
SOURCE = "public/assets/onward-ad-v1/onward-ad-v1.glb"
ROLES = {
    "Finished_Heel_Leather": "move-with-heel",
    "Heel_Leather_Stitching": "move-with-heel",
    "Heel_Seam_Stitch": "stay-on-shoe",
    "Finished_Heel_Logo": "separate-logo",
}
SKILL = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[4]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load_glb(data):
    if len(data) < 28:
        raise ValueError("Truncated GLB")
    magic, version, length = struct.unpack_from("<III", data)
    if (magic, version, length) != (0x46546C67, 2, len(data)):
        raise ValueError("Invalid GLB header/version/length")
    chunks = {}
    offset = 12
    while offset < length:
        size, kind = struct.unpack_from("<II", data, offset)
        offset += 8
        if size % 4 or offset + size > length or kind in chunks:
            raise ValueError("Invalid GLB chunk")
        chunks[kind] = data[offset:offset + size]
        offset += size
    return json.loads(chunks[0x4E4F534A]), chunks[0x004E4942]


def accessor(doc, binary, index):
    a = doc["accessors"][index]
    if "sparse" in a:
        raise ValueError("Sparse accessor requires a new audited decoder")
    v = doc["bufferViews"][a["bufferView"]]
    if v.get("buffer", 0) != 0:
        raise ValueError("External buffer not supported by this source contract")
    dims = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}[a["type"]]
    code = {5121: "B", 5123: "H", 5125: "I", 5126: "f"}[a["componentType"]]
    fmt = "<" + code * dims
    size = struct.calcsize(fmt)
    stride = v.get("byteStride", size)
    start = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    if stride < size or (a["count"] and start + stride * (a["count"] - 1) + size > v.get("byteOffset", 0) + v["byteLength"]):
        raise ValueError("Accessor out of bounds")
    rows = [struct.unpack_from(fmt, binary, start + i * stride) for i in range(a["count"])]
    if any(not math.isfinite(x) for row in rows for x in row):
        raise ValueError("Non-finite accessor")
    canonical = b"".join(struct.pack(fmt, *row) for row in rows)
    return rows, {"componentType": a["componentType"], "type": a["type"],
                  "count": a["count"], "normalized": a.get("normalized", False), "sha256": sha(canonical)}


def bounds(points):
    return {"min": [min(p[k] for p in points) for k in range(3)],
            "max": [max(p[k] for p in points) for k in range(3)]}


def build_report(repo):
    data = (repo / SOURCE).read_bytes()
    doc, binary = load_glb(data)
    primitives = [p for m in doc["meshes"] for p in m["primitives"]]
    all_points = [row for p in primitives for row in accessor(doc, binary, p["attributes"]["POSITION"])[0]]
    b = bounds(all_points)
    center = [(x + y) / 2 for x, y in zip(b["min"], b["max"])]
    report = {"source": SOURCE, "sha256": sha(data), "bytes": len(data),
              "counts": {"nodes": len(doc["nodes"]), "primitives": len(primitives),
                         "triangles": sum(doc["accessors"][p["indices"]]["count"] // 3 for p in primitives),
                         "skins": len(doc.get("skins", [])), "animations": len(doc.get("animations", []))},
              "sourceBounds": b, "displayNormalization": {"center": center, "scale": 3.4 / (b["max"][0] - b["min"][0])},
              "nodes": {}}
    parents = {child: i for i, node in enumerate(doc["nodes"]) for child in node.get("children", [])}
    for name, role in ROLES.items():
        matches = [(i, n) for i, n in enumerate(doc["nodes"]) if n.get("name") == name]
        if len(matches) != 1:
            raise ValueError("Missing or duplicate target node: " + name)
        ni, node = matches[0]
        if ni in parents or any(k in node for k in ("matrix", "translation", "rotation", "scale", "skin")):
            raise ValueError("Source hierarchy/transform changed; re-audit before using local=world")
        mesh = doc["meshes"][node["mesh"]]
        if len(mesh["primitives"]) != 1:
            raise ValueError("Target primitive partition changed")
        p = mesh["primitives"][0]
        decoded = {key: accessor(doc, binary, idx) for key, idx in p["attributes"].items()}
        indices, index_info = accessor(doc, binary, p["indices"])
        pos = decoded["POSITION"][0]
        mid = p["material"]
        material = doc["materials"][mid]
        entry = {"role": role, "nodeIndex": ni, "meshIndex": node["mesh"], "localEqualsGLTFWorld": True,
                 "primitiveMode": p.get("mode", 4), "morphTargets": len(p.get("targets", [])),
                 "attributes": {key: val[1] for key, val in decoded.items()}, "indices": index_info,
                 "bounds": bounds(pos), "materialIndex": mid, "material": material,
                 "materialUsers": sorted(n["name"] for n in doc["nodes"] if "mesh" in n and
                                          any(q.get("material") == mid for q in doc["meshes"][n["mesh"]]["primitives"]))}
        if name == "Finished_Heel_Leather":
            uv = decoded["TEXCOORD_0"][0]
            u0, u1 = min(x[0] for x in uv), max(x[0] for x in uv)
            v0, v1 = min(x[1] for x in uv), max(x[1] for x in uv)
            anchors = {}
            for label, v in (("lower", v1), ("middle", (v0 + v1) / 2), ("upper", v0)):
                i = min(range(len(uv)), key=lambda k: (uv[k][0] - (u0 + u1) / 2) ** 2 + (uv[k][1] - v) ** 2)
                anchors[label] = {"vertex": i, "uv": list(uv[i]), "position": list(pos[i]), "normal": list(decoded["NORMAL"][0][i])}
            entry.update(anchors=anchors, uvGrid=[len(set(x[0] for x in uv)), len(set(x[1] for x in uv))])
        report["nodes"][name] = entry
    images = []
    for im in doc["images"]:
        view = doc["bufferViews"][im["bufferView"]]
        start = view.get("byteOffset", 0)
        payload = binary[start:start + view["byteLength"]]
        images.append({"name": im["name"], "mimeType": im["mimeType"], "bytes": len(payload), "sha256": sha(payload)})
    report["images"] = images
    report["textures"] = doc["textures"]
    return report


def compare(actual, contract, repo):
    errors = []
    if actual != contract["expected"]:
        errors.append("GLB geometry/UV/material/image/anchor contract changed; do not auto-update the baseline")
    for p, digest in contract["protectedFiles"].items():
        if not (repo / p).is_file() or sha((repo / p).read_bytes()) != digest:
            errors.append("Protected file changed or missing: " + p)
    return errors


def self_test(actual, contract, repo):
    cases = []
    for label, mutate in [
        ("uv-drift", lambda r: r["nodes"]["Finished_Heel_Leather"]["attributes"]["TEXCOORD_0"].update(sha256="changed")),
        ("wrong-material", lambda r: r["nodes"]["Heel_Leather_Stitching"].update(materialIndex=13)),
        ("missing-logo", lambda r: r["nodes"].pop("Finished_Heel_Logo")),
        ("wrong-role", lambda r: r["nodes"]["Heel_Seam_Stitch"].update(role="move-with-heel")),
        ("anchor-drift", lambda r: r["nodes"]["Finished_Heel_Leather"]["anchors"]["middle"].update(position=[0, 0, 0])),
        ("image-replaced", lambda r: r["images"][6].update(sha256="changed")),
    ]:
        changed = copy.deepcopy(actual)
        mutate(changed)
        cases.append({"name": label, "rejected": bool(compare(changed, contract, repo))})
    try:
        load_glb(b"not-a-glb")
        rejected = False
    except (ValueError, KeyError, struct.error):
        rejected = True
    cases.append({"name": "invalid-header", "rejected": rejected})
    return cases


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=REPO)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    contract = json.loads((SKILL / "references/asset-contract.json").read_text())
    try:
        actual = build_report(args.repo.resolve())
        errors = compare(actual, contract, args.repo.resolve())
        result = {"passed": not errors, "checks": ["source identity", "accessor bytes", "materials and images", "node roles", "anchors", "protected files"],
                  "errors": errors, "actual": actual, "scope": "Read-only binary audit; no render, export or manufacturing certification"}
        if args.self_test:
            result["negativeTests"] = self_test(actual, contract, args.repo.resolve())
            result["passed"] &= all(x["rejected"] for x in result["negativeTests"])
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 0 if result["passed"] else 1
    except (ValueError, KeyError, OSError, struct.error, IndexError) as error:
        print(json.dumps({"passed": False, "error": str(error)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())
