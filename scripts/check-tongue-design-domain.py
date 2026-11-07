#!/usr/bin/env python3
"""Check baked geometry against the SVG reference, independent of pose history."""
import json
import os
from pathlib import Path
import sys

import numpy as np
os.environ.setdefault('MPLCONFIGDIR', '/tmp/onward-tongue-matplotlib')
from matplotlib.path import Path as PolygonPath

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'modeling/tongue-motion-lab'))
from design_surface import DesignSurface
from build_motion import load, tongue_st


def distance_to_polygon(points, polygon):
    a = polygon
    edge = np.roll(polygon, -1, axis=0) - polygon
    lengths = np.maximum(np.sum(edge * edge, axis=1), 1e-20)
    output = []
    for begin in range(0, len(points), 256):
        delta = points[begin:begin + 256, None, :] - a
        along = np.clip(np.sum(delta * edge, axis=2) / lengths, 0, 1)
        distance = np.linalg.norm(delta - along[:, :, None] * edge, axis=2).min(1)
        output.extend(distance)
    return np.asarray(output)


def main():
    assets = ROOT / 'public/tongue-motion-lab/assets'
    meta = json.loads((assets / 'motion-contract.json').read_text())
    data = (assets / 'tongue-cuff-morphs.f16').read_bytes()
    def read(name):
        s = meta['sections'][name]
        return np.frombuffer(data, s['type'], count=s['bytes'] // np.dtype(s['type']).itemsize, offset=s['offset']).astype(float).reshape(s['shape'])
    design = DesignSurface(ROOT / meta['sharedDesign']['referencePath'])
    assert design.reference_sha256 == meta['sharedDesign']['referenceSHA256']
    shoe, accessor, _ = load(ROOT / 'public/assets/onward-ad-v1/onward-ad-v1.glb')
    errors, widths, boundary_draw = [], [], []
    for index, primitive in enumerate(shoe['meshes'][shoe['nodes'][4]['mesh']]['primitives'][:2]):
        uv = accessor(primitive['attributes']['TEXCOORD_0'])
        s, t = tongue_st(shoe['materials'][primitive['material']]['name'], uv)
        xy = read(f'tongue-{index}-design-xy')
        boundary = (t > .50) & ((s < 1e-5) | (s > 1 - 1e-5) | (t > 1 - 1e-5))
        error = distance_to_polygon(xy[boundary], design.free_polygon)
        assert len(error) > 50 and error.max() < .0002, (index, error.max())
        errors.extend(error)
        if index == 0:
            faces = accessor(primitive['indices']).reshape(-1, 3)
            edges = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
            unique, count = np.unique(edges, axis=0, return_counts=True)
            for a, b in unique[count == 1]:
                if t[a] > .50 and t[b] > .50:
                    boundary_draw.append((xy[a], xy[b]))
        lifted = read(f'tongue-{index}-lift-p')
        fitted = read(f'tongue-{index}-installed-p')
        lifted_width = np.ptp(lifted[t > .50, 2])
        fitted_width = np.ptp(fitted[t > .50, 2])
        assert abs(lifted_width - fitted_width) < .0005, (lifted_width, fitted_width)
        assert .101 < lifted_width < .105
        widths.append({'primitive': index, 'liftedWidthMm': lifted_width * 1000, 'fittedWidthMm': fitted_width * 1000})
    cuff = read('cuff-design-xy')
    outside = ~PolygonPath(design.polygon).contains_points(cuff)
    outside_distance = distance_to_polygon(cuff[outside], design.polygon)
    assert len(outside_distance) == 0 or outside_distance.max() < .0002
    assert meta['sharedDesign']['restIsInstalledShape']
    def screen(point):
        return f'{(design.WIDTH / 2 - point[0]) * 1000:.4f},{point[1] * 1000:.4f}'
    outline = ' '.join(screen(p) for p in design.polygon)
    line_segments = ''.join(f'<polyline points="{screen(a)} {screen(b)}"/>' for a, b in boundary_draw)
    dots = ''.join(f'<circle cx="{(design.WIDTH / 2 - p[0]) * 1000:.4f}" cy="{p[1] * 1000:.4f}" r=".13"/>' for p in cuff[::59])
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 119 182" width="595" height="910"><rect x="-8" y="-8" width="119" height="182" fill="#0b1420"/><title>Reference contour and shared material domain</title><polygon points="{outline}" fill="#293642" stroke="#acb6be" stroke-width=".5"/><g stroke="#67d5ff" fill="none" stroke-width=".22">{line_segments}</g><g fill="#e9b6ee" opacity=".45">{dots}</g><text x="0" y="166" fill="#dce5ee" font-family="sans-serif" font-size="2.7">103 × 158 mm / reference trace, not factory measurement</text><text x="0" y="171" fill="#67d5ff" font-family="sans-serif" font-size="2.7">Cyan: free tongue boundary / dots: fitted cuff</text></svg>'''
    (ROOT / 'public/tongue-motion-lab/verification/tongue-outline-comparison.svg').write_text(svg)
    baked = json.loads((ROOT / 'modeling/tongue-motion-lab/bake-report.json').read_text())
    assert baked['sameExistingBindingIDs'] == 785 and baked['finalFlatMedallionMaxCenterErrorMetres'] < .0001
    report = {'passed': True, 'referenceSHA256': design.reference_sha256,
        'freeSectionBoundaryMaxErrorMm': float(max(errors) * 1000),
        'cuffOutsideReferenceMaxErrorMm': float(outside_distance.max() * 1000) if len(outside_distance) else 0,
        'poseWidths': widths, 'protectedArtworkDiameterMm': 79,
        'medallionBindingCount': 785, 'medallionMaxCenterErrorMm': baked['finalFlatMedallionMaxCenterErrorMetres'] * 1000,
        'note': 'Design-space fitting to the recorded approximate SVG. The original attached root remains protected; this is not factory measurement.'}
    (ROOT / 'public/tongue-motion-lab/verification/geometry-consistency.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
