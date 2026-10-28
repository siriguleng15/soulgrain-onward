"""Seat the existing tongue snap's closed cap on the photo-visible inner face.

The normal is fitted from source cloth outside its ring, not from the ring's
recess wall. The visible ring centre is read from the orthographic source
audit; its raised lip requires a separate seat offset toward that camera. Coordinates are uncalibrated source units, not physical sizes.
"""
import math
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

REFERENCE = np.array([-.40268743,-.04069797,.08036959])

def fit_frame(source):
    right=np.array([1.,0.,0.])
    up=np.array([0.,.12,1.]);up/=np.linalg.norm(up)
    forward=np.array([0.,1.,-.12]);forward/=np.linalg.norm(forward)
    u0,v0=REFERENCE@right,REFERENCE@up
    hidden=source.hide_get();source.hide_set(False)
    bpy.context.view_layer.update()
    tree=BVHTree.FromObject(source,bpy.context.evaluated_depsgraph_get())
    rows=[];depths=[]
    for radius_px in [22,26,30]:
        radius=radius_px*2.1869443/1000
        for j in range(20):
            a=j/20*math.tau;du=radius*math.cos(a);dv=radius*math.sin(a)
            origin=right*(u0+du)+up*(v0+dv)-forward*5
            hit,normal,face,distance=tree.ray_cast(Vector(origin),Vector(forward))
            if hit is None:continue
            p=np.asarray(hit)
            # Only the local tongue panel, not a ray through to lower laces.
            if np.linalg.norm(p-REFERENCE)>.15:continue
            rows.append([1,du,dv,du*du,du*dv,dv*dv]);depths.append(p@forward)
    source.hide_set(hidden)
    if len(rows)<20:raise RuntimeError('Insufficient visible source cloth around tongue snap.')
    A=np.array(rows);z=np.array(depths)
    coef=np.linalg.lstsq(A,z,rcond=None)[0]
    residual=z-A@coef
    keep=np.abs(residual)<max(.004,np.quantile(np.abs(residual),.8))
    coef=np.linalg.lstsq(A[keep],z[keep],rcond=None)[0]
    normal=np.cross(right+forward*coef[1],up+forward*coef[2]);normal/=np.linalg.norm(normal)
    if normal@(-forward)<0:normal=-normal
    center=right*u0+up*v0+forward*coef[0]+normal*.0015
    # Measured source-side ring centre is 6.40 px right and 2.74 px up
    # from the original provisional mark, at 1000 px / 2.1869443 units.
    # Ray inspection found the raised lip about .0333 units in front of the
    # provisional cloth seat. .031 along-view advances the closed lens onto
    # that lip; it is an uncalibrated visual repair, not a snap dimension.
    center += right*.014+up*.006-forward*.031
    return center,normal,{'sourceReference':REFERENCE.tolist(),'visibleClothSamples':int(keep.sum()),'fitRmsModelUnits':float(np.sqrt(np.mean((z[keep]-A[keep]@coef)**2))),'fitView':'Same orthographic side as original photo audit; source inner tongue face','physicalDiameterMm':None,'sourceSideCentreOffsetModelUnits':[.014,.006],'raisedLipSeatAlongViewModelUnits':.031,'seatBasis':'Source orthographic ring silhouette and local first-surface depth; visual repair, not measured hardware manufacture.'}
