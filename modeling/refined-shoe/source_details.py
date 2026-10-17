"""Geometric eyelets, flat laces and rubber detail for the original-source foot.

This module receives already world-baked, warped, neutralized original meshes.
It does not read a generated shoe, alter the upper garment or write any assets.
All dimensions are metres; toe is -X, top is +Z, foot centre is Y=.0065.
"""
import math
import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree


def clean_lace_scraps(laces):
    """Retain the continuous five-cross native lace, discard cut-off tails.

    A horizontal crop of the source also leaves six remote loose islands:
    those are the stiff antenna-like original ends, not part of the crosses.
    """
    bm=bmesh.new();bm.from_mesh(laces.data);seen=set();components=[]
    for vertex in bm.verts:
        if vertex in seen:continue
        stack=[vertex];seen.add(vertex);component=[]
        while stack:
            v=stack.pop();component.append(v)
            for edge in v.link_edges:
                other=edge.other_vert(v)
                if other not in seen:seen.add(other);stack.append(other)
        components.append(component)
    keep=set(max(components,key=len));remove=[v for v in bm.verts if v not in keep]
    bmesh.ops.delete(bm,geom=remove,context='VERTS');bm.to_mesh(laces.data);bm.free()
    return len(remove)


def native_lace_anchors(body, laces, rows=(-.050,-.035,-.020,-.005,.010)):
    """Project each native cross's outer turn onto the original cloth.

    Call before cropping/replacing the original canvas quarter. These anchors
    derive from the actual lace ends, not an evenly divided throat outline.
    The row's outermost .65 mm band is averaged to avoid a corner-vertex bias.
    """
    tree=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[tuple(p.vertices) for p in body.data.polygons])
    locations=[]
    for x in rows:
        vs=[v.co for v in laces.data.vertices if abs(v.co.x-x)<.005]
        if not vs:raise ValueError(f'No original lace vertices near row {x}')
        for sign in [-1,1]:
            extreme=max(vs,key=lambda p:sign*(p.y-.0065))
            end=[p for p in vs if sign*(extreme.y-p.y)<.00065]
            target=sum(end,Vector())/len(end)
            point,normal,_,_=tree.find_nearest(target)
            if point is None:raise ValueError('Original quarter surface missing beneath lace end')
            if normal.z<0:normal=-normal
            locations.append((point,normal.normalized(),.00198))
    return locations


def _new_mesh(name, verts, faces, mat, uvs=None):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(mat)
    uv = mesh.uv_layers.new(name='SurfaceUV')
    for poly in mesh.polygons:
        poly.use_smooth = True
        for j, li in enumerate(poly.loop_indices):
            co = mesh.vertices[mesh.loops[li].vertex_index].co
            uv.data[li].uv = uvs[poly.index][j] if uvs else ((co.x+.13)/.265, (co.z+.023)/.17)
    obj['source'] = 'SoulGrain reconstructed neutral eyelet/lace/rubber detail'
    return obj


def _sample(points, subdivisions=10):
    result=[]
    for i in range(len(points)-1):
        a,b,c,d=[Vector(points[max(0,min(len(points)-1,k))]) for k in [i-1,i,i+1,i+2]]
        for j in range(subdivisions):
            t=j/subdivisions
            result.append(.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    result.append(Vector(points[-1]))
    return result


def _flat_laces(name, paths, material, collision_tree=None):
    """Rounded rectangular ribbon, not a round bevelled curve."""
    verts=[];faces=[];uvs=[]
    for control,width,thickness,twist in paths:
        points=_sample(control,10)
        if collision_tree:
            # Low dangling ends rest outside the genuine toe/foxing wall;
            # translating a tied bow forward must not bury its ends in it.
            for p in points:
                if p.z<.034 and abs(p.y-.0065)>.012:
                    sign=1 if p.y>.0065 else -1
                    hit,_,_,_=collision_tree.ray_cast(Vector((p.x,.0065+sign*.12,p.z)),Vector((0,-sign,0)),.24)
                    if hit is not None and sign*(p.y-hit.y)<width*.55:
                        p.y=hit.y+sign*width*.55
        length=[0.0]
        for a,b in zip(points,points[1:]):length.append(length[-1]+(b-a).length)
        # Four gently rounded corners, four points each. Parallel face spans
        # the full width, and the narrow edge remains visibly thinner.
        hw=width/2;ht=thickness/2;rad=min(ht*.65,.00022)
        shape=[]
        for x,z,angle in [(hw-rad,ht-rad,0),(-hw+rad,ht-rad,90),(-hw+rad,-ht+rad,180),(hw-rad,-ht+rad,270)]:
            for k in range(4):
                a=math.radians(angle+k*30)
                shape.append((x+rad*math.cos(a),z+rad*math.sin(a)))
        offset=len(verts);sides=len(shape)
        for i,p in enumerate(points):
            tangent=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
            ref=Vector((0,0,1)) if abs(tangent.z)<.93 else Vector((1,0,0))
            across=tangent.cross(ref).normalized();normal=across.cross(tangent).normalized()
            angle=twist*math.sin(math.pi*i/(len(points)-1))
            side=across*math.cos(angle)+normal*math.sin(angle)
            up=-across*math.sin(angle)+normal*math.cos(angle)
            verts.extend(p+side*x+up*z for x,z in shape)
        for i in range(len(points)-1):
            for k in range(sides):
                faces.append(tuple(offset+n for n in (i*sides+k,i*sides+(k+1)%sides,(i+1)*sides+(k+1)%sides,(i+1)*sides+k)))
                uvs.append(((k/sides,length[i]/.01),((k+1)/sides,length[i]/.01),((k+1)/sides,length[i+1]/.01),(k/sides,length[i+1]/.01)))
        faces.extend([tuple(offset+k for k in range(sides-1,-1,-1)),tuple(offset+(len(points)-1)*sides+k for k in range(sides))])
        uvs.extend([[(k/sides,0) for k in range(sides)],[(k/sides,length[-1]/.01) for k in range(sides)]])
    obj=_new_mesh(name,verts,faces,material,uvs)
    # Ribbon winding is geometric and independent of its material.
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    return obj


def _split_poly(poly, center, normal):
    """Split a convex 3-D polygon along a plane; interpolate its UVs."""
    positive=[];negative=[]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        da=(a[0]-center).dot(normal);db=(b[0]-center).dot(normal)
        if da>=-1e-10:positive.append(a)
        if da<=1e-10:negative.append(a)
        if (da>1e-10 and db<-1e-10) or (da<-1e-10 and db>1e-10):
            f=da/(da-db);q=(a[0].lerp(b[0],f),a[1].lerp(b[1],f))
            positive.append(q);negative.append(q)
    return positive,negative


def _cut_eyelet_holes(body, locations):
    """Subtract convex 24-gon discs only from each local cloth surface.

    The source is an open cloth surface: a solid boolean would be unreliable.
    Local plane clipping instead retains its existing faces/UVs outside each
    tiny hole, producing genuine open apertures below the metal barrels.
    """
    mesh=body.data;uv=mesh.uv_layers.active
    polygons=[]
    for p in mesh.polygons:
        polygons.append(([(mesh.vertices[mesh.loops[li].vertex_index].co.copy(),uv.data[li].uv.copy() if uv else Vector((0,0))) for li in p.loop_indices],p.material_index))
    for center,normal,radius in locations:
        x=normal.cross(Vector((0,0,1)))
        if x.length<.01:x=normal.cross(Vector((0,1,0)))
        x.normalize();y=normal.cross(x).normalized()
        updated=[]
        for points,mi in polygons:
            mid=sum((p for p,_ in points),Vector())/len(points)
            if (mid-center).length>.024 or abs((mid-center).dot(normal))>.008:
                updated.append((points,mi));continue
            inside=points
            for i in range(24):
                direction=x*math.cos(math.tau*(i+.5)/24)+y*math.sin(math.tau*(i+.5)/24)
                plane=center+direction*(radius*math.cos(math.pi/24))
                outside,inside=_split_poly(inside,plane,direction)
                if len(outside)>=3:updated.append((outside,mi))
                if len(inside)<3:break
            # Remaining polygon lies inside all 24 radial planes: remove it.
        polygons=updated
    vertices=[];faces=[];uvs=[];mis=[]
    for points,mi in polygons:
        off=len(vertices);vertices.extend(p for p,_ in points);faces.append(tuple(range(off,off+len(points))));uvs.append([uv for _,uv in points]);mis.append(mi)
    new=bpy.data.meshes.new(mesh.name+'_EyeletApertures');new.from_pydata(vertices,[],faces);new.update()
    for mat in mesh.materials:new.materials.append(mat)
    layer=new.uv_layers.new(name='SurfaceUV')
    for poly,coords,mi in zip(new.polygons,uvs,mis):
        poly.material_index=mi;poly.use_smooth=True
        for li,co in zip(poly.loop_indices,coords):layer.data[li].uv=co
    bm=bmesh.new();bm.from_mesh(new);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=2e-7)
    # Subtraction boundaries may leave T junctions on adjacent source faces;
    # merge collinear crossing points without moving the original cloth.
    bmesh.ops.dissolve_degenerate(bm,dist=1e-8,edges=list(bm.edges))
    bm.to_mesh(new);bm.free();body.data=new
    if mesh.users==0:bpy.data.meshes.remove(mesh)


def _eyelet_mesh(locations, material):
    verts=[];faces=[]
    # Closed rolled-lip barrel: both lips and the actual central bore.
    profile=[(.00195,-.00085),(.00275,-.00085),(.00310,-.00055),(.00318,-.0001),(.00305,.0003),(.0027,.00052),(.00203,.00052),(.00188,.00024)]
    for center,normal,hole_radius in locations:
        radial_scale=hole_radius/.00198
        x=normal.cross(Vector((0,0,1)))
        if x.length<.01:x=normal.cross(Vector((0,1,0)))
        x.normalize();y=normal.cross(x).normalized();off=len(verts)
        for r,z in profile:
            for i in range(40):
                # Both rolled lips must stand beyond the layered cloth.
                # The old 1.37mm barrel buried its upright outer lip.
                a=math.tau*i/40;verts.append(center+normal*(z*1.8)+r*radial_scale*(x*math.cos(a)+y*math.sin(a)))
        for j in range(len(profile)):
            for k in range(40):faces.append(tuple(off+n for n in (j*40+k,j*40+(k+1)%40,((j+1)%len(profile))*40+(k+1)%40,((j+1)%len(profile))*40+k)))
    obj=_new_mesh('Lower_Shoe_Eyelets',verts,faces,material)
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    obj['construction']='Rolled-lip metal barrels through matching cloth apertures'
    return obj


def _bumper(body, material):
    """Subtle diamond relief fitted directly to the original rubber toe wall."""
    tree=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[tuple(p.vertices) for p in body.data.polygons])
    verts=[];faces=[];uvs=[];columns=144;rows=28
    for j in range(rows+1):
        t=j/rows;z=-.0117+t*.0165
        for i in range(columns+1):
            s=i/columns;y=.0065+(s-.5)*.069
            hit,normal,_,_=tree.ray_cast(Vector((-.22,y,z)),Vector((1,0,0)),.15)
            if hit is None:return None
            # True sub-millimetre moulded rubber relief, no applied artwork.
            taper=math.sin(math.pi*s)**.25*math.sin(math.pi*t)**.25
            diamond=abs(math.sin(math.pi*(s*24+t*5)))*abs(math.sin(math.pi*(s*24-t*5)))
            hit.x-=.00010+.00026*diamond*taper;verts.append(hit)
    for j in range(rows):
        for i in range(columns):
            a=j*(columns+1)+i;faces.append((a,a+columns+1,a+columns+2,a+1));uvs.append(((i/columns,j/rows),(i/columns,(j+1)/rows),((i+1)/columns,(j+1)/rows),((i+1)/columns,j/rows)))
    return _new_mesh('Rubber_Toe_Bumper_Relief',verts,faces,material,uvs)


def _foxing_lip(body, material):
    """Small moulded top lip, following the native foot wall exactly."""
    tree=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[tuple(p.vertices) for p in body.data.polygons])
    points=[];normals=[];columns=224;sides=8;radius=.00042
    center=Vector((.002,.0065,.0068))
    for i in range(columns):
        angle=math.tau*i/columns;direction=Vector((math.cos(angle),math.sin(angle),0))
        hit,normal,_,_=tree.ray_cast(center+direction*.24,-direction,.48)
        if hit is None:return None
        points.append(hit+direction*.00018);normals.append(direction)
    verts=[];faces=[];uvs=[]
    for p,n in zip(points,normals):
        for j in range(sides):
            angle=math.tau*j/sides;verts.append(p+radius*(n*math.cos(angle)+Vector((0,0,1))*math.sin(angle)))
    for i in range(columns):
        for j in range(sides):
            faces.append((i*sides+j,((i+1)%columns)*sides+j,((i+1)%columns)*sides+(j+1)%sides,i*sides+(j+1)%sides))
            uvs.append(((i/columns,j/sides),((i+1)/columns,j/sides),((i+1)/columns,(j+1)/sides),(i/columns,(j+1)/sides)))
    obj=_new_mesh('Rubber_Foxing_Moulded_Lip',verts,faces,material,uvs)
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
    return obj


def create_eyelets(locations, material, name='Lower_Shoe_Eyelets'):
    """Create only hardware at supplied (centre, outward normal, hole radius).

    Caller must reserve matching holes before baking shape keys. For animated
    hardware the caller may apply shape keys to this deterministic vertex
    order using the same ordered anchors in the other endpoint pose.
    """
    obj=_eyelet_mesh([(Vector(p),Vector(n).normalized(),r) for p,n,r in locations],material)
    obj.name=name
    return obj


def create_draped_lace_ends(locations, material, body):
    """Loose flat lace ends following the reference, outside the tongue.

    They emerge at the last native eyelet pair. No large invented bow is
    placed through the returning tongue. Both ends have a closed, rounded
    ribbon section and drape beside the instep, rather than down its centre.
    """
    paths=[]
    for index,sign in [(-2,-1),(-1,1)]:
        p,n,_=locations[index]
        points=[p+n*.0012,
                p+n*.006+Vector((-.003,0,.001)),
                p+n*.012+Vector((-.010,0,-.005)),
                Vector((-.027 if sign<0 else -.036,.0065+sign*.041,.039)),
                Vector((-.035 if sign<0 else -.044,.0065+sign*.045,.021)),
                Vector((-.036 if sign<0 else -.045,.0065+sign*.045,.013 if sign<0 else .019))]
        paths.append((points,.0045,.00075,.15*sign))
    tree=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[tuple(p.vertices) for p in body.data.polygons])
    obj=_flat_laces('Draped_Lace_Ends',paths,material,tree)
    obj['construction']='Two loose flat lace ends from the real upper lacing eyes; reference-style lateral drape'
    return obj


def enhance_source_details(body, laces, materials, add_bow=True, add_bumper=True,
                           add_eyelets=True, eyelet_locations=None,
                           cut_eyelet_holes=True, bow_origin=(-.055,.0065,.046),
                           bow_scale=.80, add_rubber_lip=True):
    """Call after source warp, lower-lace trim and body material partition.

    Returns newly created objects. It touches only the passed native quarter
    (ten tiny holes) and adds detail meshes. Does not modify upper pose keys.
    Omit the old four-point ``Lace_Tip`` objects in the calling build script.
    New garment builds should set add_eyelets=False and create their own
    matching parameter-space apertures/hardware before baking shape keys.
    """
    objects=[];locations=[]
    # These anchors align with the five original-source lower lace crosses.
    if add_eyelets:
        if eyelet_locations is not None:
            locations=[(Vector(p),Vector(n).normalized(),r) for p,n,r in eyelet_locations]
        else:
            locations=native_lace_anchors(body,laces)
            if len(locations)!=10:raise RuntimeError(f'Expected ten native lower eyelet anchors, got {len(locations)}')
        if cut_eyelet_holes:
            if body.data.shape_keys:raise ValueError('Reserve apertures before creating garment shape keys')
            _cut_eyelet_holes(body,locations)
        objects.append(create_eyelets(locations,materials['Eyelets']))
    if add_bow:
        k=(-.006,.0065,.073)
        paths=[
            ([k,(-.013,.028,.076),(-.026,.045,.069),(-.033,.036,.062),(-.026,.018,.065),(-.007,.007,.071)],.0055,.00085,.24),
            ([(-.005,.007,.074),(-.008,-.014,.078),(-.021,-.035,.071),(-.028,-.027,.064),(-.020,-.008,.067),(-.006,.007,.072)],.0055,.00085,-.36),
            ([(-.005,.006,.072),(-.017,-.010,.066),(-.035,-.028,.053),(-.049,-.038,.035),(-.054,-.041,.015)],.0052,.0008,.35),
            ([(-.005,.008,.072),(-.021,.035,.067),(-.043,.045,.056),(-.062,.049,.040),(-.080,.052,.025)],.0052,.0008,-.22),
            ([(-.012,.001,.072),(-.009,.006,.077),(-.003,.011,.076),(.000,.012,.072),(-.004,.009,.069),(-.010,.003,.069),(-.012,.001,.072)],.0056,.00095,.18)
        ]
        # Retarget the knot to the finished front throat. Tail Z is scaled
        # relative to the floor, rather than translated below the outsole.
        origin=Vector(bow_origin);baseline=Vector(k);adjusted=[]
        for points,width,thickness,twist in paths:
            out=[]
            for p in points:
                p=Vector(p);p.x=origin.x+(p.x-baseline.x)*bow_scale;p.y=origin.y+(p.y-baseline.y)*bow_scale
                p.z=p.z*(origin.z/baseline.z)
                out.append(p)
            adjusted.append((out,width*bow_scale,thickness,twist))
        collision=BVHTree.FromPolygons([v.co.copy() for v in body.data.vertices],[tuple(p.vertices) for p in body.data.polygons])
        bow=_flat_laces('Lace_Bow_and_Tails',adjusted,materials['Laces'],collision);bow['construction']='Five rounded rectangular canvas ribbons; two loop lobes, two draped tails and a central overhand knot'
        objects.append(bow)
    if add_bumper:
        bumper=_bumper(body,materials['Rubber_Foxing'])
        if bumper:objects.append(bumper)
    if add_rubber_lip:
        lip=_foxing_lip(body,materials['Rubber_Foxing'])
        if lip:objects.append(lip)
    return objects
