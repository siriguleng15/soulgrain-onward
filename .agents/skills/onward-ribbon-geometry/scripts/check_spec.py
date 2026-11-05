#!/usr/bin/env python3
"""Validate a ribbon specification, not a geometry/animation implementation."""
import argparse
import copy
import importlib.util
import json
import math
from pathlib import Path
import sys

SKILL = Path(__file__).resolve().parents[1]
REPO = Path(__file__).resolve().parents[4]
MODES = {"rectangular-outline", "solid-ribbon"}


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def vector(value):
    return isinstance(value, list) and len(value) == 3 and all(number(x) for x in value)


def validate(spec, source_sha):
    errors = []
    def require(ok, message):
        if not ok:
            errors.append(message)
    require(spec.get("schemaVersion") == 1, "Unknown specification version")
    require(spec.get("sourceSHA256") == source_sha, "Source identity mismatch")
    require(spec.get("targetNodes") == ["Finished_Heel_Leather", "Heel_Leather_Stitching"], "Only heel panel and its sewing may return with this actor")
    require(spec.get("modes") and set(spec["modes"]) == MODES, "Both rectangular-outline and solid-ribbon modes are required")
    require(spec.get("crossSection") == "rectangle", "Use rectangular, not circular, cross section")
    require(spec.get("representation") == "parametric-surface", "No tube, snake anatomy, billboard or static spiral substitute")
    require(spec.get("units") == "glTF-model-units", "Declare model units; do not imply certified manufacturing dimensions")
    for key in ("width", "thickness", "outlineWidth"):
        require(number(spec.get(key)) and spec[key] > 0, key + " must be finite and positive")
    if all(number(spec.get(k)) for k in ("width", "thickness", "outlineWidth")):
        require(0 < spec["thickness"] < spec["width"], "Keep width and thickness distinct; this specification describes a thin ribbon")
        require(0 < spec["outlineWidth"] < spec["width"] / 2, "Outline width must leave an open interior")
    require(spec.get("dimensionsAre") == "advertising-assumptions-not-measured", "Mark unmeasured width/thickness as assumptions")
    require(set(spec.get("outlineEdges", [])) == {"left", "right", "start", "growth-tip"}, "Outline must include all four edges")
    require(set(spec.get("solidFaces", [])) == {"front", "back", "left", "right", "start-cap", "growth-cap"}, "Solid mode needs sides and caps")
    frame = spec.get("frame", {})
    require(frame.get("method") in {"parallel-transport", "rotation-minimizing"}, "Use a stable moving frame")
    require(frame.get("handedness") == "T-cross-B", "Declare a consistent frame handedness")
    t, b = frame.get("initialTangent"), frame.get("initialWidth")
    if vector(t) and vector(b):
        require(abs(sum(x*x for x in t)-1) <= 1e-6 and abs(sum(x*x for x in b)-1) <= 1e-6, "Initial frame axes must be unit length")
        require(abs(sum(x*y for x,y in zip(t,b))) <= 1e-6, "Initial tangent/width must be orthogonal")
    else:
        require(False, "Initial frame axes must be finite 3D vectors")
    require(frame.get("explicitTwist") is True and frame.get("closed") is False, "Explicit twist on an open ribbon is required for this chapter")
    require(frame.get("reverseTangentPolicy") == "split-or-controlled-transition", "Specify how to handle a reverse tangent")
    path = spec.get("path", {})
    require(path.get("editable") is True and path.get("sampling") == "arc-length", "Path must be editable and arc-length sampled")
    points = path.get("controlPoints", [])
    if isinstance(points,list) and len(points) >= 2 and all(vector(p) for p in points):
        lengths = [math.dist(a,b) for a,b in zip(points,points[1:])]
        require(all(x>1e-12 for x in lengths), "Zero consecutive path segments are invalid")
        require(sum(lengths)>1e-9, "Path must have nonzero length")
    else:
        require(False, "Supply finite 3D path control points")
    growth = spec.get("growth", {})
    require(growth.get("method") == "interpolated-tip" and growth.get("parameterRange") == [0,1], "Growth must interpolate a continuous tip, not only setDrawRange")
    require(growth.get("zeroState") == "hidden" and growth.get("sharedAcrossModes") is True, "Define zero growth and share it between both modes")
    ret = spec.get("return", {})
    require(ret.get("target") == "exact-source-surface" and ret.get("mapping") == "source-uv-or-barycentric", "Return to original parameterized surface, not an approximate plane")
    require(ret.get("sewing") == "same-surface-field" and ret.get("restoreOriginalUV") is True, "Restore sewing and original UVs")
    require(number(ret.get("positionTolerance")) and 0 < ret["positionTolerance"] <= 1e-6, "Return numerical tolerance must be explicit")
    camera = spec.get("camera", {})
    require(camera.get("owner") == "chapter-director" and camera.get("nearPlaneCheckRequired") is True, "Require one camera owner and near-plane checks")
    require(spec.get("gpu", {}).get("normalAndShadowAndBoundsAndPickingRequired") is True, "GPU deformation must account for normals, shadows, bounds and picking")
    return errors


def negative_tests(spec, source_sha):
    tests = []
    mutations = [
        ("round-tube", lambda x: x.update(crossSection="circle", representation="TubeGeometry")),
        ("snake", lambda x: x.update(representation="snake-anatomy")),
        ("spiral-image", lambda x: x.update(representation="spiral-image")),
        ("missing-outline-mode", lambda x: x.update(modes=["solid-ribbon"])),
        ("wrong-source", lambda x: x.update(sourceSHA256="wrong")),
        ("moves-logo", lambda x: x["targetNodes"].append("Finished_Heel_Logo")),
        ("moves-seam", lambda x: x["targetNodes"].append("Heel_Seam_Stitch")),
        ("negative-thickness", lambda x: x.update(thickness=-1)),
        ("nan-width", lambda x: x.update(width=float("nan"))),
        ("missing-units", lambda x: x.pop("units")),
        ("zero-path", lambda x: x["path"].update(controlPoints=[[0,0,0],[0,0,0]])),
        ("parallel-frame", lambda x: x["frame"].update(initialWidth=[0,1,0])),
        ("three-edge-outline", lambda x: x["outlineEdges"].pop()),
        ("stepped-growth", lambda x: x["growth"].update(method="setDrawRange-only")),
        ("approximate-return", lambda x: x["return"].update(target="plane")),
        ("loose-return", lambda x: x["return"].update(positionTolerance=.1)),
    ]
    for label, mutate in mutations:
        bad = copy.deepcopy(spec)
        mutate(bad)
        tests.append({"name": label, "rejected": bool(validate(bad, source_sha))})
    return tests


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--repo", type=Path, default=REPO)
    p.add_argument("--spec", type=Path, default=SKILL / "references/ribbon-spec.json")
    p.add_argument("--mode", choices=sorted(MODES))
    p.add_argument("--self-test", action="store_true")
    args = p.parse_args()
    try:
        asset_script = REPO / ".agents/skills/onward-asset-contract/scripts/inspect_glb.py"
        module_spec = importlib.util.spec_from_file_location("onward_asset_contract",asset_script)
        module = importlib.util.module_from_spec(module_spec)
        module_spec.loader.exec_module(module)
        contract = json.loads((asset_script.parent.parent / "references/asset-contract.json").read_text())
        actual = module.build_report(args.repo.resolve())
        errors = module.compare(actual,contract,args.repo.resolve())
        spec = json.loads(args.spec.read_text())
        errors.extend(validate(spec,actual["sha256"]))
        result = {"passed": not errors,"sourceSHA": actual["sha256"],"modes": sorted(MODES),"selectedMode": args.mode or "both", "errors": errors,
                  "scope": "Specification and source-contract validation only; no authored geometry, animation, render or Safari verification"}
        if args.self_test:
            result["negativeTests"] = negative_tests(spec,actual["sha256"])
            result["passed"] &= all(x["rejected"] for x in result["negativeTests"])
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 0 if result["passed"] else 1
    except (ValueError,KeyError,OSError,TypeError,AttributeError) as error:
        print(json.dumps({"passed": False,"error":str(error)},ensure_ascii=False))
        return 1


if __name__ == "__main__":
    sys.exit(main())
