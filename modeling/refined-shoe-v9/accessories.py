"""Surface-conformed V9 details on the user's already.glb geometry.

Blender module, invoked by finish_v9.py: add_accessories(base_objects).
All positions are in the source's normalized 0.30 m shoe coordinates, X toe -,
Y outer -, Z up. Never changes a source vertex, UV or source topology.
Dimensions/placements are visual estimates from the supplied finished shoe.
"""
from pathlib import Path
import math
import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[2]
REF = ROOT / 'modeling/finished-shoe-v8/references'
TAU = math.tau


def _linear(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4


def _material(name, color='ffffff', rough=.7, metal=0):
    existing = bpy.data.materials.get(name)
    if existing:
        return existing
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    c = tuple(_linear(int(color[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1,)
    m.diffuse_color = c
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = c
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    m.use_backface_culling = False
    return m


def _artwork(material, filename):
    """Uses unchanged supplied artwork. The mesh UVs select the usable crop."""
    path = REF / filename
    image = bpy.data.images.load(str(path), check_existing=True)
    image.colorspace_settings.name = 'sRGB'
    if not image.packed_file:
        image.pack()
    p = material.node_tree.nodes.get('Principled BSDF')
    for link in list(p.inputs['Base Color'].links):
        material.node_tree.links.remove(link)
    tex = material.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = image
    tex.label = 'Unchanged user artwork; surface UV crop'
    tex.extension = 'REPEAT'
    material.node_tree.links.new(tex.outputs['Color'], p.inputs['Base Color'])


class Builder:
    def __init__(self, name, materials):
        self.name, self.materials = name, materials
        self.vertices, self.faces, self.uvs, self.material_indices, self.smooth = [], [], [], [], []

    def add(self, vertices, faces, uvs=None, material=0, smooth=True):
        offset = len(self.vertices)
        self.vertices.extend(vertices)
        for i, face in enumerate(faces):
            self.faces.append(tuple(offset + n for n in face))
            self.uvs.append(uvs[i] if uvs else [(0, 0)] * len(face))
            self.material_indices.append(material)
            self.smooth.append(smooth)

    def finish(self):
        mesh = bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.vertices, [], self.faces)
        mesh.update()
        obj = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        for material in self.materials:
            mesh.materials.append(material)
        uv = mesh.uv_layers.new(name='AccessoryUV')
        for face, coords, mi, smooth in zip(mesh.polygons, self.uvs, self.material_indices, self.smooth):
            face.material_index = mi
            face.use_smooth = smooth
            for li, co in zip(face.loop_indices, coords):
                uv.data[li].uv = co
        # Recalculate only the new accessory mesh. Source winding is untouched.
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        bm.to_mesh(mesh)
        bm.free()
        obj['v9_accessory'] = True
        obj['part'] = self.name
        obj['source'] = 'Surface fitted to already.glb, no inherited shoe geometry'
        return obj


def _tube(points, radius, sides=10):
    vs, fs, uv = [], [], []
    for j, p in enumerate(points):
        tangent = (points[min(j + 1, len(points) - 1)] - points[max(0, j - 1)]).normalized()
        ref = Vector((0, 0, 1)) if abs(tangent.z) < .95 else Vector((1, 0, 0))
        a = tangent.cross(ref).normalized()
        b = tangent.cross(a).normalized()
        for k in range(sides):
            angle = k * TAU / sides
            vs.append(p + radius * (math.cos(angle) * a + math.sin(angle) * b))
    for j in range(len(points) - 1):
        for k in range(sides):
            fs.append((j * sides + k, j * sides + (k + 1) % sides, (j + 1) * sides + (k + 1) % sides, (j + 1) * sides + k))
            uv.append([(k / sides, j / (len(points) - 1)), ((k + 1) / sides, j / (len(points) - 1)), ((k + 1) / sides, (j + 1) / (len(points) - 1)), (k / sides, (j + 1) / (len(points) - 1))])
    fs.extend([tuple(reversed(range(sides))), tuple((len(points) - 1) * sides + k for k in range(sides))])
    uv.extend([[(0, 0)] * sides, [(0, 0)] * sides])
    return vs, fs, uv


class SourceSurface:
    def __init__(self, objects):
        vertices, faces = [], []
        for obj in objects:
            if obj.type != 'MESH':
                continue
            mesh = obj.data
            mesh.calc_loop_triangles()
            offset = len(vertices)
            vertices.extend(obj.matrix_world @ v.co for v in mesh.vertices)
            faces.extend(tuple(offset + n for n in t.vertices) for t in mesh.loop_triangles)
        if not faces:
            raise ValueError('V9 accessories require the actual source base meshes.')
        self.tree = BVHTree.FromPolygons(vertices, faces, all_triangles=True)
        self.fallbacks = 0

    def hit(self, origin, direction, near):
        p, n, _, _ = self.tree.ray_cast(Vector(origin), Vector(direction), 2)
        if p is None:
            p, n, _, distance = self.tree.find_nearest(Vector(near))
            if p is None or distance > .010:
                raise ValueError(f'No source surface near accessory anchor {near}')
            self.fallbacks += 1
        if n.dot(Vector(direction)) > 0:
            n = -n
        return p, n.normalized()

    def side(self, x, z, offset=0):
        p, n = self.hit((x, -.5, z), (0, 1, 0), (x, -.045, z))
        return p + n * offset, n

    def heel(self, y, z, offset=0):
        p, n = self.hit((.5, y, z), (-1, 0, 0), (.142, y, z))
        return p + n * offset, n

    def top(self, x, y, offset=0):
        p, n = self.hit((x, y, .5), (0, 0, -1), (x, y, .05))
        return p + n * offset, n


def _grid(builder, rows, columns, sample, uv, thickness=0, material=0):
    """A conformed patch, optionally with closed sides and actual thickness."""
    positions, normals, faces, coords = [], [], [], []
    for j in range(rows + 1):
        for i in range(columns + 1):
            p, n = sample(i / columns, j / rows)
            positions.append(p)
            normals.append(n)
    count = len(positions)
    for j in range(rows):
        for i in range(columns):
            f = (j * (columns + 1) + i, j * (columns + 1) + i + 1, (j + 1) * (columns + 1) + i + 1, (j + 1) * (columns + 1) + i)
            faces.append(f)
            coords.append([uv((v % (columns + 1)) / columns, (v // (columns + 1)) / rows) for v in f])
    if thickness:
        positions.extend(p - n * thickness for p, n in zip(positions[:], normals))
        original = faces[:]
        original_uv = coords[:]
        for f, co in zip(original, original_uv):
            faces.append(tuple(count + v for v in reversed(f)))
            coords.append(list(reversed(co)))
        perimeter = list(range(columns + 1)) + [j * (columns + 1) + columns for j in range(1, rows + 1)] + [rows * (columns + 1) + i for i in range(columns - 1, -1, -1)] + [j * (columns + 1) for j in range(rows - 1, 0, -1)]
        for a, b in zip(perimeter, perimeter[1:] + perimeter[:1]):
            faces.append((a, b, b + count, a + count))
            coords.append([(0, 0)] * 4)
    builder.add(positions, faces, coords, material)


def _bezier(points, count=49):
    a, b, c, d = points
    return [a * (1 - t) ** 3 + b * (3 * (1 - t) ** 2 * t) + c * (3 * (1 - t) * t * t) + d * t ** 3 for t in (i / (count - 1) for i in range(count))]


def add_accessories(base_objects):
    """Return new objects, leaving every base object and base vertex untouched."""
    for obj in list(bpy.data.objects):
        if obj.get('v9_accessory'):
            bpy.data.objects.remove(obj, do_unlink=True)
    source = SourceSurface(base_objects)
    created = []
    leather = _material('Heel_Strip', rough=.46)
    _artwork(leather, '04-heel-leather.jpg')
    stitch = _material('Stitching', 'e5dcc7', .88)
    badge = _material('Heel_Logo', rough=.71)
    _artwork(badge, '09-heel-logo.jpg')
    aglet = _material('Aglet_Artwork', rough=.37)
    _artwork(aglet, '06-aglet-artwork.jpg')
    silver = _material('Hardware_Silver', 'b9b7b0', .24, .88)
    cord = _material('Clasp_Cream_Cord', 'e9dfc9', .83)
    lace = _material('Laces', 'e9dfc9', .91)
    head = _material('Clasp_Engraved_Head', rough=.31, metal=.73)
    _artwork(head, '01-overall.jpg')
    navy = _material('Foxing_Navy_Stripe', '122b42', .68)

    # 14-mm leather strip on the true posterior quarter, stopping underneath
    # the cuff instead of projecting the strip onto the back of the cuff.
    heel = Builder('V9_Heel_Leather', [leather])
    def heel_sample(a, b):
        return source.heel((a - .5) * .014, .034 + b * .0365, .00065)
    _grid(heel, 36, 12, heel_sample, lambda a, b: ((86 + a * 454) / 590, 1 - (1054 - b * 832) / 1280), .00055)
    obj = heel.finish()
    obj['estimated'] = '14 mm width at a 300 mm normalization; lower quarter only, photo-estimated'
    created.append(obj)
    sewing = Builder('V9_Heel_Leather_Stitching', [stitch])
    for a in [.045, .955]:
        for j in range(16):
            points = []
            for t in [.12, .67]:
                p, n = heel_sample(a, (j + t) / 16)
                points.append(p + n * .00018)
            sewing.add(*_tube(points, .00013, 6))
    created.append(sewing.finish())

    # The badge conforms to the moulded rear rubber; the actual supplied
    # black-on-ivory label is cropped in UV, with no retyped brand lettering.
    label = Builder('V9_Heel_Logo', [badge])
    _grid(label, 10, 48, lambda a, b: source.heel((a - .5) * .045, .0100 + b * .0155, .00065), lambda a, b: ((14 + a * 1252) / 1280, 1 - (543 - b * 399) / 640), .00025)
    created.append(label.finish())

    # Two cloth-fastened clasp pairs cross the source cuff's measured front
    # edge. Their coordinated tilts avoid the actual cuff and ventilation eyes.
    clasps = [((.018, .083), (.072, .107)), ((.032, .057), (.090, .078))]
    loops = Builder('V9_Mongolian_Clasp_Loops', [cord, stitch])
    heads = Builder('V9_Mongolian_Clasp_Heads', [head, silver])
    for index, ((ax, az), (bx, bz)) in enumerate(clasps):
        A, normal_a = source.side(ax, az, .00155)
        B, normal_b = source.side(bx, bz, .00110)
        along = Vector((bx - ax, 0, bz - az)).normalized()
        across = Vector((-along.z, 0, along.x))
        for sign in [-1, 1]:
            points = []
            for j in range(65):
                t = j / 64
                x = ax * (1 - t) + bx * t + across.x * sign * .0017
                z = az * (1 - t) + bz * t + across.z * sign * .0017 - (.0016 if index else .00035) * math.sin(math.pi * t)
                p, n = source.side(x, z, .00120)
                points.append(p)
            loops.add(*_tube(points, .00078, 10))
        def tab_sample(a, b):
            q = Vector((bx, 0, bz)) + along * ((b - .3) * .0090) + across * ((a - .5) * .0070)
            return source.side(q.x, q.z, .00175)
        _grid(loops, 12, 8, tab_sample, lambda a, b: (a, b), .00062)
        for a in [.09, .91]:
            for j in range(5):
                line = []
                for t in [.12, .68]:
                    p, n = tab_sample(a, (j + t) / 5)
                    line.append(p + n * .00018)
                loops.add(*_tube(line, .00012, 6), material=1)
        # A shallow domed lens, with a rolled metal rim and a real underside.
        radius = .00475
        right = Vector((1, 0, 0))
        right = (right - normal_a * right.dot(normal_a)).normalized()
        up = normal_a.cross(right).normalized()
        verts, faces, uvs = [], [], []
        ring_count, segments = 10, 48
        for row in range(ring_count + 1):
            rr = radius * max(.000001, row / ring_count)
            h = .00135 * (1 - (row / ring_count) ** 2)
            for k in range(segments):
                a = k * TAU / segments
                verts.append(A + right * (rr * math.cos(a)) + up * (rr * math.sin(a)) + normal_a * h)
        for row in range(ring_count):
            for k in range(segments):
                f = (row * segments + k, row * segments + (k + 1) % segments, (row + 1) * segments + (k + 1) % segments, (row + 1) * segments + k)
                faces.append(f)
                co = []
                for v in f:
                    r = (v // segments) / ring_count
                    angle = (v % segments) * TAU / segments
                    co.append(((833 + r * 21 * math.cos(angle)) / 1280, 1 - (446 - r * 21 * math.sin(angle)) / 895))
                uvs.append(co)
        faces.append(tuple(reversed(range(ring_count * segments, (ring_count + 1) * segments))))
        uvs.append([(833 / 1280, 1 - 446 / 895)] * segments)
        heads.add(verts, faces, uvs)
        ring = [A + right * (radius * math.cos(k * TAU / 64)) + up * (radius * math.sin(k * TAU / 64)) for k in range(65)]
        heads.add(*_tube(ring, .00032, 8), material=1)
    created.append(loops.finish())
    head_obj = heads.finish()
    head_obj['head_centers_xz'] = str([p[0] for p in clasps])
    head_obj['artwork_source'] = 'Supplied overall photo buckle crop; not invented engraving artwork'
    created.append(head_obj)

    # Two hanging tips live on the same visible quarter, as in the finished
    # reference. Their cream tails originate at an actual exposed lace and
    # curve around the quarter; no unsupported floating aglet cylinders.
    tips = Builder('V9_Lace_Aglets', [aglet, silver])
    tails = Builder('V9_Lace_Tails', [lace])
    for index, base_x in enumerate([-.061, -.047]):
        length, base_z, radius = .025, .032 + index * .0014, .0025
        axis = Vector((.0030, 0, length)).normalized()
        ys = [source.side(base_x + axis.x * length * t, base_z + axis.z * length * t)[0].y for t in [j / 8 for j in range(9)]]
        base = Vector((base_x, min(ys) - .0034, base_z))
        a = Vector((0, -1, 0))
        b = axis.cross(a).normalized()
        vs, fs, uv = [], [], []
        rows, columns = 20, 32
        for j in range(rows + 1):
            for k in range(columns + 1):
                ang = k * TAU / columns
                vs.append(base + axis * (length * j / rows) + radius * (a * math.cos(ang) + b * math.sin(ang)))
        for j in range(rows):
            for k in range(columns):
                f = (j * (columns + 1) + k, j * (columns + 1) + k + 1, (j + 1) * (columns + 1) + k + 1, (j + 1) * (columns + 1) + k)
                fs.append(f)
                uv.append([(((q % (columns + 1)) / columns + .25) % 1, 1 - (1212 - (q // (columns + 1)) / rows * 1190) / 1280) for q in f])
        tips.add(vs, fs, uv)
        for lo, hi in [(.96, 1.015), (.225, .263)]:
            tips.add(*_tube([base + axis * length * lo, base + axis * length * hi], .00258, 32), material=1)
        vs, fs = [], []
        for row in range(9):
            theta = row / 8 * math.pi / 2
            r = radius * math.cos(theta)
            h = -radius * math.sin(theta)
            for k in range(32):
                ang = k * TAU / 32
                vs.append(base + axis * h + r * (a * math.cos(ang) + b * math.sin(ang)))
        for row in range(8):
            for k in range(32):
                fs.append((row * 32 + k, row * 32 + (k + 1) % 32, (row + 1) * 32 + (k + 1) % 32, (row + 1) * 32 + k))
        tips.add(vs, fs, material=1)
        end = base + axis * length * 1.005
        # Attach on the visible, actual front lace, not on the tongue flap.
        anchor, normal = source.top(-.088 + index * .004, -.009 - index * .008, .0010)
        controls = [anchor, anchor + Vector((.006, -.018, .006)), end + Vector((-.007, -.006, .014)), end]
        path = _bezier(controls)
        # Keep the hanging tail outside the fused shoe shell. This modifies
        # only the newly created cord, never the supplied source surface.
        safe = []
        for j, p in enumerate(path):
            q, n, _, distance = source.tree.find_nearest(p)
            if q is not None and (p - q).dot(n) < .0012 and distance < .015:
                p = q + n.normalized() * .0014
            safe.append(p)
        tails.add(*_tube(safe, .00125, 12))
    created.append(tails.finish())
    created.append(tips.finish())

    # Narrow navy rubber line follows measured radial sections of the real
    # sole wall. Do not draw it across the moulded diamond toe bumper.
    stripe = Builder('V9_Foxing_Navy_Stripe', [navy])
    vertices, normals = [], []
    rows, columns = 8, 960
    for j in range(rows + 1):
        z = .0121 + .0030 * j / rows
        for i in range(columns + 1):
            angle = i * TAU / columns
            direction = Vector((math.cos(angle), math.sin(angle), 0))
            p, n, _, _ = source.tree.ray_cast(Vector((0, 0, z)) + direction * .5, -direction, 1)
            if p is None:
                raise ValueError('Source sole ray missed while fitting navy stripe')
            if n.dot(direction) < 0:
                n = -n
            vertices.append(p + n.normalized() * .00062)
            normals.append(n)
    faces, uvs = [], []
    for j in range(rows):
        for i in range(columns):
            f = (j * (columns + 1) + i, j * (columns + 1) + i + 1, (j + 1) * (columns + 1) + i + 1, (j + 1) * (columns + 1) + i)
            faces.append(f)
            uvs.append([(vertices[v].x, vertices[v].z) for v in f])
    stripe.add(vertices, faces, uvs)
    stripe_obj = stripe.finish()
    # Precisely cut only the new ribbon at the toe/foxing seam, rather than
    # leaving a stair-step contour from a face-centroid discard.
    bm = bmesh.new()
    bm.from_mesh(stripe_obj.data)
    bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), dist=.000001, plane_co=Vector((-.060, 0, 0)), plane_no=Vector((1, 0, 0)), clear_inner=True)
    bm.to_mesh(stripe_obj.data)
    bm.free()
    created.append(stripe_obj)
    created.extend(_add_edge_ribbons(source))

    for obj in created:
        obj['normalization'] = '0.30 m shoe length for consistent preview, not measured production dimensions'
        obj['placement'] = 'Estimated from supplied finished-shoe references, source-surface conformed'
    bpy.context.scene['v9_accessory_surface_fallbacks'] = source.fallbacks
    print('V9_ACCESSORIES_READY', len(created), 'source-nearest-fallbacks', source.fallbacks, flush=True)
    return created


def _add_edge_ribbons(source):
    """Real 3D trim follows the source silhouette and its measured lower hem.

    The source does not contain factory paper-pattern boundaries. These narrow
    strips use the same measured spatial hem as the semantic colour masks.
    Missing rays invalidate a cell instead of connecting unrelated surfaces.
    """
    border_material = _material('Cuff_Border', rough=.78)
    _artwork(border_material, '01-overall.jpg')
    red = _material('Red_Rubber_Piping', 'bd152b', .57)
    border = Builder('V9_Cuff_Artwork_Borders', [border_material])
    red_lips = Builder('V9_Red_Contour_Piping', [red])
    cx = .074
    hem_x = [.014, .025, .038, .050, .061, .067, .080, .100, .125, .153]
    hem_z = [.126, .111, .093, .074, .055, .051, .055, .064, .070, .074]
    def hem(x):
        for i in range(len(hem_x) - 1):
            if hem_x[i] <= x <= hem_x[i + 1]:
                t = (x - hem_x[i]) / (hem_x[i + 1] - hem_x[i])
                return hem_z[i] * (1 - t) + hem_z[i + 1] * t
        return hem_z[0] if x < hem_x[0] else hem_z[-1]
    def radial(theta, z, center_x=cx):
        d = Vector((math.cos(theta), math.sin(theta), 0))
        p, n, _, _ = source.tree.ray_cast(Vector((center_x, 0, z)) + d * .4, -d, 1)
        if p is None:
            return None
        if n.dot(d) < 0:
            n = -n
        return p, n.normalized()
    def highest(theta):
        lo, hi = .105, .148
        if radial(theta, lo) is None:
            return None
        for _ in range(13):
            z = (lo + hi) / 2
            hit = radial(theta, z)
            if hit is not None and hit[0].x > .012:
                lo = z
            else:
                hi = z
        return lo
    def lower(theta):
        lo, hi = .045, .141
        for _ in range(14):
            z = (lo + hi) / 2
            hit = radial(theta, z)
            if hit is None:
                hi = z
                continue
            p, _ = hit
            if z < hem(p.x) + .0043:
                lo = z
            else:
                hi = z
        hit = radial(theta, (lo + hi) / 2)
        if hit is None or hit[0].x < .013:
            return None
        return (lo + hi) / 2
    count, rows = 320, 3
    angles = [-2.57 + i / count * 5.14 for i in range(count + 1)]
    for which in ['upper', 'lower']:
        heights = [highest(a) if which == 'upper' else lower(a) for a in angles]
        positions, valid = [], []
        for j in range(rows + 1):
            for i, a in enumerate(angles):
                h = heights[i]
                z = (h - .0047 if which == 'upper' else h) + (j / rows - .5) * .0028 if h else .1
                hit = radial(a, z) if h is not None else None
                okay = hit is not None and hit[0].x > .012
                positions.append(hit[0] + hit[1] * .00032 if okay else Vector((0, 0, 0)))
                valid.append(okay)
        faces, uvs = [], []
        for j in range(rows):
            for i in range(count):
                f = (j * (count + 1) + i, j * (count + 1) + i + 1, (j + 1) * (count + 1) + i + 1, (j + 1) * (count + 1) + i)
                if not all(valid[k] for k in f):
                    continue
                if max((positions[b] - positions[a]).length for a, b in zip(f, f[1:] + f[:1])) > .005:
                    continue
                faces.append(f)
                coordinates = []
                for k in f:
                    u = ((k % (count + 1)) / count * 2.2) % 1
                    v = k // (count + 1) / rows
                    x = 828 + u * 333 + (v - .5) * 2
                    y = 230 - u * 77 + (v - .5) * 10
                    coordinates.append((x / 1280, 1 - y / 895))
                uvs.append(coordinates)
        border.add(positions, faces, uvs)
        # The extra red roll at the cuff's top is intentionally omitted.
        # The fused source's near-tangent crown has disconnected external
        # paths; a partial roll would draw red fragments inside the opening.
        # Both verified Greek ribbons and the source lower red hem remain.
    # Red moulded lip along the actual foxing/canvas boundary. The height
    # follows the source toe rise, rather than drawing a horizontal torus.
    points = []
    for i in range(641):
        theta = i / 640 * TAU
        lo, hi = .028, .048
        for _ in range(13):
            z = (lo + hi) / 2
            hit = radial(theta, z, 0)
            if hit is None:
                hi = z
                continue
            x = hit[0].x
            target = .0325 + .012 * max(0, min(1, (-.057 - x) / .09))
            if z < target:
                lo = z
            else:
                hi = z
        hit = radial(theta, (lo + hi) / 2, 0)
        if hit is None:
            raise ValueError('Source foxing top ray missed; cannot invent piping')
        points.append(hit[0] + hit[1] * .00035)
    red_lips.add(*_tube(points, .00052, 8))
    border_obj = border.finish()
    red_obj = red_lips.finish()
    red_obj['upper_cuff_roll_omitted'] = True
    red_obj['upper_roll_reason'] = 'Near-tangent fused source crown cannot supply one reliable full external path; no interior or detached red fragments retained.'
    return [border_obj, red_obj]
