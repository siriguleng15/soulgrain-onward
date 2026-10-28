"""Bounded, reproducible upper-profile correction in uncalibrated model units.

The target is the user's final photo, not a generic shoe or ideal ratio. The
source paper is never edited. Thin-plate displacement is explicitly a visual
registration hypothesis, not a reconstruction of sewing or material strain.
"""
from pathlib import Path
import json
import numpy as np
from scipy.interpolate import RBFInterpolator

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
data = json.loads((HERE / 'photo-calibration.json').read_text())
r = data['registration']; c = data['sourceAuditCamera']
v = np.load('/tmp/repaired-positions.npy').astype(float)
f = np.load('/tmp/repaired-faces.npy')
# Blender world to glTF world. The uploaded model's original normalization is
# retained; no paper millimetres are silently applied to these coordinates.
g = np.c_[v[:, 0], v[:, 2], -v[:, 1]]
right, up = np.asarray(r['rightWorld']), np.asarray(r['upWorld'])
scale = 1000 / c['orthoScale']; center = np.asarray(c['centerGLTF'])
source = []; target = []
for pair in data['pairs'][:13]:
    x, y = pair['sourceAuditPixel']; u, w = pair['targetPhotoPixel']
    source.append([(x-500)/scale+center@right, (375-y)/scale+center@up])
    target.append([(u-r['originXPx'])/r['pixelsPerUnitX'], (r['originYPx']-w)/r['pixelsPerUnitY']])
source = np.asarray(source); target = np.asarray(target)
guard = np.array([[-.94, -.35], [.90, -.35], [-.90, -.10], [.92, -.10]])
field = RBFInterpolator(np.r_[source, guard], np.r_[target-source, np.zeros((4, 2))], kernel='thin_plate_spline', smoothing=.0015)
uv = np.c_[g@right, g@up]
delta = np.zeros_like(uv)
for a in range(0, len(g), 30000):
    delta[a:a+30000] = field(uv[a:a+30000])
length = np.linalg.norm(delta, axis=1)
limit = .055
delta *= np.minimum(1, limit / np.maximum(1e-12, length))[:, None]
def smooth(x):
    t = np.clip(x, 0, 1)
    return t*t*(3-2*t)
# Sole and toe remain the supplied geometry. Only the photographed outer
# upper is adjusted; the unobserved rear side is not forced into this view.
weight = smooth((g[:, 1]+.23)/.23) * smooth((g[:, 0]+.75)/.18) * smooth((g[:, 2]+.04)/.18)
# Preserve the tongue flap whose local repair is an independent operation.
tongue = smooth((g[:, 1]-(.62*g[:, 0]+.30)+.01)/.06) * (1-smooth((g[:, 0]+.04)/.12))
weight *= 1-tongue
displacement = (delta[:, :1]*right + delta[:, 1:]*up) * weight[:, None]
result = g + displacement
out = np.c_[result[:, 0], -result[:, 2], result[:, 1]]
np.save('/tmp/xiezitu-final-v.npy', out)
np.save('/tmp/xiezitu-final-f.npy', f)
dist = np.linalg.norm(displacement, axis=1)
fit = field(source)
pred = source + fit
residual = np.c_[(pred[:, 0]-target[:, 0])*r['pixelsPerUnitX'], (pred[:, 1]-target[:, 1])*r['pixelsPerUnitY']]
report = {
    'units': 'model-unit', 'productionReady': False,
    'purpose': 'Conservative visible-upper correction against user final photograph.',
    'sourceImage': '12-design-final-straps.jpg',
    'maximumDisplacementModelUnits': float(dist.max()),
    'meanDisplacementModelUnits': float(dist.mean()),
    'maximumDisplacementRelativeToShoeLength': float(dist.max()/1.90169072),
    'soleVerticesUnchanged': bool(np.all(displacement[g[:, 1] <= -.23] == 0)),
    'manualAuditReadUncertaintyPx': 5,
    'globalRegistrationBeforeCorrectionRmsPx': r['fitResidualPx'],
    'twoDimensionalFieldControlResidualRmsPx': float(np.sqrt(np.mean(np.sum(residual**2, axis=1)))),
    'controlResidualCaveat': 'In-sample displacement-field diagnostic before 3D protection weights. Not an independent photo or physical accuracy test.',
    'warnings': ['Photo correspondences and hidden depth remain uncertain.', 'No real millimetre scale is inferred from the uploaded AI model.', 'The real paper outline and its calibration are unchanged.'],
}
(HERE/'profile-correction.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
