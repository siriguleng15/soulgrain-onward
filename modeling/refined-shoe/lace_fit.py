"""Small, thickness-preserving fitting of the original lace returns.

The imported source has intersecting/missing faces at some lace turns already;
this is not a watertight-lace repair. The central woven crossing mesh, vertex
order, UVs and topology are retained. Only the two side returns move, using a
continuous, piecewise affine spatial shear rather than nearest-face snapping
(which would flatten the ribbon thickness).

Dimensions are metres in the original world-baked first-foot frame: +Z up,
shoe centre Y=.0065. Call once after native eye anchors have been captured.
"""
from mathutils import Vector


def fit_native_lace_returns(laces, *, amount=.004, toe_shift=0.0,
                            centre_y=.0065, locked_half_width=.011,
                            transition_width=.006):
    """Move side returns just beyond the newly lofted quarter's front edge.

    The central 22 mm of the original crossing ribbons is exactly unchanged.
    The whole thickness at a given XY receives the same displacement; there is
    no independent projection of front/back ribbon vertices onto one surface.
    ``amount=.004`` cleared the new V7 quarter in both endpoint poses with a
    maximum displacement below 4 mm. Remaining source foot/lace intersections
    must be reported separately; this function does not claim to remove them.
    ``toe_shift`` optionally nudges the two lowest returns toward the toe.
    """
    if amount < 0 or transition_width <= 0:
        raise ValueError('Expected nonnegative fitting and positive transition')
    if laces.data.shape_keys:
        raise ValueError('Fit native lace geometry before adding shape keys')
    before = [v.co.copy() for v in laces.data.vertices]
    for vertex, point in zip(laces.data.vertices, before):
        dy = point.y - centre_y
        weight = max(0., min(1., (abs(dy)-locked_half_width)/transition_width))
        sign = 1. if dy >= 0 else -1.
        # A sideways/upwards textile return, not an exaggerated vertical lift.
        offset = Vector((-.20, sign*.82, .53)) * (amount*weight)
        front = max(0., min(1., (-.015-point.x)/.025))
        offset.x -= toe_shift*weight*front
        vertex.co = point + offset
    laces.data.update()
    maximum = max((v.co-p).length for v, p in zip(laces.data.vertices, before))
    untouched = sum(abs(p.y-centre_y) <= locked_half_width for p in before)
    laces['construction'] = ('Original crossing ribbons and mesh retained; '
                             'side returns fitted by a thickness-preserving '
                             'piecewise affine shear, not surface projection')
    laces['lace_return_fit_m'] = amount
    laces['source_lace_limit'] = ('Source lace has pre-existing self/foot '
                                 'intersections and open cropped ends; fitting '
                                 'is not a watertight reconstruction')
    return {'vertices': len(before), 'central_vertices_unchanged': untouched,
            'maximum_displacement_m': maximum, 'fit_m': amount,
            'toe_shift_m': toe_shift}
