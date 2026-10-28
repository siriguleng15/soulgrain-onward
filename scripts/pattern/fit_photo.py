#!/usr/bin/env python3
"""Reproduce the provisional eyelet-only camera/fold fit.
Needs NumPy + SciPy; reads existing paper-mm coordinates without changing them.
The observations are explicitly ASSUMED correspondence identities, not factory
measurements. This is in-sample fitting, not independent physical validation.
"""
from pathlib import Path
import json
import numpy as np
from scipy.optimize import least_squares

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'public/pattern-engineering/data'
pattern = json.loads((DATA / 'pattern-mm.json').read_text())
xy = np.array([h['center'] for h in pattern['holes'] if h['role'] == 'eyelet'])
observed = np.array([[877,540],[846,469],[818,400],[785,330],[760,259],
                     [719,209],[679,273],[641,331],[577,384],[517,428],
                     [459,466],[399,487],[359,511]], dtype=float)
weights = np.ones(13)
weights[5] = 0  # E06 identity/visibility ambiguous; excluded rather than forced.


def predict(v):
    hy, ha, theta, width, sx, sy, ox, oy = v
    hx = 100.0
    alpha = np.deg2rad(ha)
    ca, sa = np.cos(alpha), np.sin(alpha)
    dx, dy = xy[:, 0] - hx, xy[:, 1] - hy
    along, distance = dx * ca + dy * sa, -dx * sa + dy * ca
    angle = np.deg2rad(theta)
    radius = width / angle
    q = np.clip(distance, 0, width)
    crossed = radius * np.sin(angle * q / width) + np.maximum(0, distance - width) * np.cos(angle)
    fx = np.where(distance > 0, hx + along * ca - crossed * sa, xy[:, 0])
    fy = np.where(distance > 0, hy + along * sa + crossed * ca, xy[:, 1])
    return np.stack([ox - sx * fx, oy - sy * fy], axis=1)


fit = least_squares(
    lambda v: ((predict(v) - observed) * weights[:, None]).ravel(),
    [138, 5, 180, 10, 4, 4, 1280, 760],
    bounds=([110,-25,140,3,2,2,900,600], [170,25,210,25,6,6,1700,1100]),
)
predicted = predict(fit.x)
errors = np.linalg.norm(predicted - observed, axis=1)
rms = float(np.sqrt(np.mean(errors[weights > 0] ** 2)))
hy, ha, theta, width, sx, sy, ox, oy = fit.x.tolist()
output = {
    'productionReady': False,
    'method': 'Bounded least-squares circular-band fold plus independent photo X/Y display scales; no shape correction and no source-paper coordinate alteration.',
    'units': {'paper': 'mm', 'photo': 'px'},
    'parameters': {
        'hingeXmm': 100, 'hingeYmm': hy, 'hingeAngleDeg': ha,
        # The mirrored side camera is at -Z; negative angle puts cuff in front.
        'foldAngleDeg': -theta, 'bendWidthMm': width, 'heelWrapDeg': 0,
        'sideDepthMm': 0, 'landmarkStrength': 0,
    },
    'registration': {'originXPx': ox, 'originYPx': oy, 'pixelsPerMmX': sx, 'pixelsPerMmY': sy, 'widthPx': 1280, 'heightPx': 894},
    'eyeletAssumptions': [
        {'id': f'E{i+1:02}', 'photoPx': observed[i].tolist(), 'enabled': bool(weights[i]),
         'predictedPhotoPx': predicted[i].tolist(), 'residualPx': float(errors[i]),
         'confidence': 'assumed', 'referenceOnly': True}
        for i in range(13)
    ],
    'inSampleRmsPx': rms,
    'inSampleMaxPx': float(errors[weights > 0].max()),
    'limitations': [
        'Eyelet correspondence identities are visually assumed, not physically confirmed.',
        'Independent axis display scales absorb camera projection mismatch; they are not measured photo millimetre scales.',
        'Only eyelet references are fitted; full shoe silhouette and paper lower lasting edge are not fitted or verified.',
        'Fold axis, hidden geometry, sewing, layer contact and lasting process remain unverified.',
        'No hold-out photograph exists, so fit residuals are not independent reconstruction errors.',
    ],
}
(DATA / 'photo-fit-optimization.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'Provisional in-sample eyelet RMS {rms:.6f} px, max {output["inSampleMaxPx"]:.6f} px')
print('WARNING: NOT full-silhouette reconstruction or production validation.')
