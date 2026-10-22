"""Finish the user-supplied high-resolution folded shoe, without remeshing it.

Run segment_base.py first, then Blender --background --python finish_v9.py.
Only this V9 directory and the new V9 GLB are written. V7/V8/ad assets are read-only.
"""
import bpy, math, sys, json, hashlib, struct
from array import array
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

P = Path(__file__).resolve().parent
R = P.parents[1]
V8 = R / 'modeling/finished-shoe-v8'
SOURCE_SHA256 = '43653b568a738b04513ca34dd0a23025f6f03072e7c20aa962581e4d400e2d80'
TMP = Path('/tmp/onward-new-source')
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def option(name, default):
    return Path(args[args.index(name) + 1]) if name in args else Path(default)

def linear(v):
    return v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4

def rgba(hexvalue):
    return tuple(linear(int(hexvalue[i:i+2], 16) / 255) for i in (0, 2, 4)) + (1,)

def material(name, color, roughness=.75, metalness=0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes.clear()
    out = m.node_tree.nodes.new('ShaderNodeOutputMaterial')
    bs = m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
    m.node_tree.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    bs.inputs['Base Color'].default_value = rgba(color)
    bs.inputs['Roughness'].default_value = roughness
    bs.inputs['Metallic'].default_value = metalness
    if 'Canvas' in name or name in {'Laces', 'Inner_Lining'}:
        # Cloth keeps a restrained dielectric response; broad white glints
        # otherwise wash navy and velvet into pale plastic under studio lights.
        bs.inputs['Specular IOR Level'].default_value = .22
        bs.inputs['IOR'].default_value = 1.46
    m.diffuse_color = rgba(color)
    m['v9_editable_region'] = True
    return m

def image_texture(m, relative):
    im = bpy.data.images.load(str(V8 / relative), check_existing=True)
    im.colorspace_settings.name = 'sRGB'
    im.pack()
    tex = m.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image = im
    tex.extension = 'REPEAT'
    m.node_tree.links.new(tex.outputs['Color'], next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Base Color'])
    m['artwork_source'] = str((V8 / relative).relative_to(R))
    return im

def weave_image():
    """Valid outward tangent normals, never a black height image as normals."""
    name = 'V9_Canvas_Tangent_Normal'
    im = bpy.data.images.new(name, width=128, height=128, alpha=True)
    pixels = []
    minimum_z = 1
    for y in range(128):
        for x in range(128):
            u = (x + .5) / 128 * math.tau * 8
            v = (y + .5) / 128 * math.tau * 8
            nx = math.sin(u) * (.10 + .025 * math.cos(v))
            ny = math.sin(v) * (.10 + .025 * math.cos(u))
            inv = 1 / math.sqrt(nx * nx + ny * ny + 1)
            minimum_z = min(minimum_z, inv)
            pixels.extend((nx * inv * .5 + .5, ny * inv * .5 + .5, inv * .5 + .5, 1))
    im.colorspace_settings.name = 'Non-Color'
    im.pixels.foreach_set(pixels)
    im.update()
    im.pack()
    im['minimum_decoded_z'] = minimum_z
    assert minimum_z > .98
    return im

def add_weave(m, im, scale=20, strength=.18):
    nodes = m.node_tree.nodes
    uv = nodes.new('ShaderNodeTexCoord')
    mapping = nodes.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value = (scale, scale, 1)
    tex = nodes.new('ShaderNodeTexImage')
    tex.image = im
    tex.extension = 'REPEAT'
    normal = nodes.new('ShaderNodeNormalMap')
    normal.inputs['Strength'].default_value = strength
    links = m.node_tree.links
    links.new(uv.outputs['UV'], mapping.inputs['Vector'])
    links.new(mapping.outputs['Vector'], tex.inputs['Vector'])
    links.new(tex.outputs['Color'], normal.inputs['Color'])
    links.new(normal.outputs['Normal'], next(n for n in nodes if n.type == 'BSDF_PRINCIPLED').inputs['Normal'])

def geometry_fingerprint(obj):
    positions = array('f', [0]) * (len(obj.data.vertices) * 3)
    faces = array('i', [0]) * len(obj.data.loops)
    obj.data.vertices.foreach_get('co', positions)
    obj.data.loops.foreach_get('vertex_index', faces)
    return hashlib.sha256(positions.tobytes() + faces.tobytes()).hexdigest()

def apply_materials():
    specs = {
        'Body_Canvas': ('102b43', .84, 0, 'references/02-body-print.jpg'),
        'Body_Inner_Canvas': ('102b43', .87, 0, 'references/02-body-print.jpg'),
        'Collar_Canvas': ('12316c', .67, 0, 'textures/cuff-reconstructed.png'),
        'Collar_Outer_Canvas': ('12316c', .67, 0, 'textures/cuff-reconstructed.png'),
        'Tongue_Canvas': ('281049', .83, 0, 'references/07-tongue-front-back.jpg'),
        'Tongue_Reverse_Canvas': ('281049', .76, 0, 'textures/tongue-velvet-reconstructed.png'),
        'Rubber_Toe': ('eee7d8', .68, 0, None),
        'Rubber_Foxing': ('eee7d8', .72, 0, None),
        'Rubber_Outsole': ('c5b8a1', .86, 0, None),
        'Laces': ('e9dfc9', .88, 0, None),
        'Eyelets': ('b5b5af', .25, .85, None),
        'Eyelet_Canvas': ('102b43', .81, 0, None),
        'Canvas_Trim': ('122a46', .85, 0, None),
        'Inner_Lining': ('15243c', .91, 0, None),
        'Stitching': ('ddd1b9', .88, 0, None),
        'Red_Rubber_Piping': ('be162b', .58, 0, None),
        'Foxing_Navy_Stripe': ('10283f', .67, 0, None),
        'Hardware_Silver': ('b9b8b1', .24, .88, None),
        'Clasp_Cream_Cord': ('e9dfc9', .83, 0, None),
        'Rhinestone_Silver': ('f3f1ea', .18, .70, None),
        'Border_Studs': ('f1eadb', .24, .35, None),
    }
    weave = weave_image()
    for name, (color, rough, metal, art) in specs.items():
        m = material(name, color, rough, metal)
        if art:
            image_texture(m, art)
        if name in {'Body_Canvas','Body_Inner_Canvas','Collar_Canvas','Collar_Outer_Canvas','Eyelet_Canvas','Tongue_Canvas','Tongue_Reverse_Canvas','Laces'}:
            add_weave(m, weave, 20 if 'Body' in name else 12, .12 if 'Tongue' in name else .18)
    return weave

def main():
    segmented = option('--segmented', TMP / 'segmented.blend')
    source = option('--source', TMP / 'already.glb')
    assert hashlib.sha256(source.read_bytes()).hexdigest() == SOURCE_SHA256
    bpy.ops.wm.open_mainfile(filepath=str(segmented))
    bpy.context.preferences.filepaths.save_version = 0
    base = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    before = {o.name: geometry_fingerprint(o) for o in base}
    for o in base:
        if o.data.uv_layers:
            first = o.data.uv_layers[0]
            original_uv = o.data.uv_layers.new(name='SourceSurfaceUV')
            for source_loop, copy_loop in zip(first.data, original_uv.data):
                copy_loop.uv = source_loop.uv
            o.data.uv_layers.active_index = 0
            first.active_render = True
    weave = apply_materials()
    # Semantic surface UV finishing and accessories are added below, after the
    # source-preserving segmentation's actual regions have been inspected.
    finish_regions(base)
    add_tongue_stones(base)
    sys.path.insert(0, str(P))
    from accessories import add_accessories
    additions = add_accessories(base)
    assert before == {o.name: geometry_fingerprint(o) for o in base}, 'Finishing changed the new source surface geometry'
    models = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    for o in models:
        o['version'] = 'V9 new user-supplied high resolution source'
        o['source_sha256'] = SOURCE_SHA256
    scene = bpy.context.scene
    scene['source'] = 'User-provided already.glb; new geometry source, not V7/V8 shoe geometry'
    scene['status'] = 'Folded finished-appearance review; no upright shape supplied by source'
    for im in bpy.data.images:
        if im.size[0] > 0 and not im.packed_file:
            try: im.pack()
            except RuntimeError: pass
    bpy.ops.object.select_all(action='DESELECT')
    for o in models: o.select_set(True)
    bpy.context.view_layer.objects.active = base[0]
    out = R / 'public/assets/soulgrain_onward_refined_v9.glb'
    bpy.ops.export_scene.gltf(filepath=str(out), export_format='GLB', use_selection=True,
        export_apply=False, export_extras=True, export_texcoords=True, export_morph=False)
    bpy.ops.wm.save_as_mainfile(filepath=str(P / 'soulgrain_onward_refined_v9.blend'), compress=True)
    stats = {'source_sha256': SOURCE_SHA256, 'source_bytes': source.stat().st_size,
        'blender': bpy.app.version_string, 'output_glb_bytes': out.stat().st_size,
        'objects': [{'name': o.name, 'vertices': len(o.data.vertices), 'faces': len(o.data.polygons),
            'materials': [m.name for m in o.data.materials], 'uv': bool(o.data.uv_layers)} for o in models],
        'new_accessory_objects': len(additions), 'normal_minimum_z': weave.get('minimum_decoded_z'),
        'upright_available': False, 'finishing_did_not_change_base_geometry': True,
        'base_surface_sha256': before,
        'source_surface_note': 'Semantic boundaries subdivide original triangles without moving the original surface; see segmentation validation.'}
    (P / 'validation.json').write_text(json.dumps(stats, indent=2) + '\n')
    assert hashlib.sha256(source.read_bytes()).hexdigest() == SOURCE_SHA256
    print('V9_READY', out.stat().st_size, 'bytes', len(models), 'objects', flush=True)

def finish_regions(base):
    aliases = {
        'Rubber_Midsole': 'Rubber_Foxing', 'Toe_Cap': 'Rubber_Toe',
        'Sole_Stripe': 'Rubber_Foxing', 'Outsole': 'Rubber_Outsole',
        'Eyestay_Canvas': 'Eyelet_Canvas', 'Collar_Lining': 'Collar_Canvas',
        'Collar_Red_Piping': 'Red_Rubber_Piping',
        'Metal_Eyelets': 'Eyelets', 'Vent_Eyelets': 'Eyelets',
    }
    for o in base:
        for i, current in enumerate(o.data.materials):
            name = aliases.get(current.name, current.name)
            if name in bpy.data.materials:
                o.data.materials[i] = bpy.data.materials[name]
        uv = o.data.uv_layers.active
        if not uv:
            continue
        # Printed canvas uses a physical repeat, not a stretched full-sheet
        # screenshot. Each side reads in its own orientation.
        for poly in o.data.polygons:
            name = o.data.materials[poly.material_index].name
            side = -1 if poly.center.y < 0 else 1
            vamp = poly.center.x < -.048 and abs(poly.center.y) < .045 and poly.normal.z > .18
            for li in poly.loop_indices:
                v = o.data.vertices[o.data.loops[li].vertex_index].co
                old = uv.data[li].uv.copy()
                if name in {'Body_Canvas', 'Body_Inner_Canvas'}:
                    if vamp:
                        # The forefoot is a separately cut, mostly horizontal
                        # canvas panel. Side projection compressed its print
                        # and made white motifs merge with the rubber seam.
                        uv.data[li].uv = ((v.x+.105)/.24+.46, v.y/.24+.60)
                    else:
                        uv.data[li].uv = ((v.x * -side + .025) / .205, v.z / .205 + .15)
                elif name in {'Collar_Canvas', 'Collar_Outer_Canvas'}:
                    # Existing repeat reconstructed from the supplied cloth
                    # photograph; three-dimensional bulges belong to source.
                    uv.data[li].uv = (old.x * 2.2, old.y * 1.05)
                elif name == 'Tongue_Reverse_Canvas':
                    # Original surface UV remains available through its named
                    # source copy for stone placement and future artwork.
                    uv.data[li].uv = (old.x * .9, old.y * 1.8)
                elif name == 'Tongue_Canvas':
                    q = max(0, min(1, old.y))
                    xleft = 280 - 70 * q
                    xright = 500 + 62 * q
                    uv.data[li].uv = ((xleft + 15 + (1-old.x) * (xright-xleft-30))/1280,
                        1 - (766 - q * 628)/853)

def add_tongue_stones(base):
    """Project individually faceted stones onto the NEW tongue's actual skin."""
    sys.path.insert(0, str(V8))
    from surface_tools import Builder, stone
    from mathutils.geometry import barycentric_transform
    obj = next((o for o in base if o.name == 'Tongue_Reverse_Canvas'), None)
    if not obj:
        raise RuntimeError('New source tongue not segmented; do not place floating medallion.')
    mesh = obj.data
    mesh.calc_loop_triangles()
    uv = mesh.uv_layers.get('SourceSurfaceUV') or mesh.uv_layers.active
    triangles = []
    coords = []
    uvpoints = []
    for tr in mesh.loop_triangles:
        uvs = [Vector((*uv.data[li].uv, 0)) for li in tr.loops]
        if (uvs[1]-uvs[0]).cross(uvs[2]-uvs[0]).length < 1e-10:
            continue
        triangles.append(tuple(tr.vertices))
        coords.append(uvs)
        uvpoints.extend(uvs)
    tree = BVHTree.FromPolygons(uvpoints, [tuple(range(i*3, i*3+3)) for i in range(len(triangles))], all_triangles=True)
    def frame(s, t):
        q, _, idx, distance = tree.find_nearest(Vector((s,t,0)))
        if q is None or distance > .04:
            return None
        xyz = [mesh.vertices[i].co for i in triangles[idx]]
        p = barycentric_transform(q, *coords[idx], *xyz)
        n = (xyz[1]-xyz[0]).cross(xyz[2]-xyz[0]).normalized()
        if n.dot(Vector((-.6,0,.8))) < 0:
            n = -n
        a = Vector((0,1,0))
        a = (a - n*a.dot(n)).normalized()
        b = n.cross(a).normalized()
        return p+n*.00018, a, b, n
    points = json.loads((V8/'rhinestone-points.json').read_text())['stones']
    gems = Builder('V9_Tongue_Rhinestone_Medallion', [bpy.data.materials['Rhinestone_Silver']])
    placed = 0
    # Forty-one millimetre medallion, centred inside the exposed folded flap.
    # These are visual placement dimensions, not a factory drilling template.
    for rec in points:
        s = .5 + (rec['x']-627)/1254*.72
        t = .43 + (627-rec['y'])/1254*.47
        f = frame(s,t)
        if f is None:
            continue
        radius = max(.00029, min(.00049, rec['radius_px']*.000034))
        v, faces = stone(f, radius, .00037, 8)
        gems.add(v, faces, smooth=False)
        placed += 1
    gem = gems.finish()
    gem['stone_count'] = placed
    gem['layout_source'] = 'V8 supplied rhinestone layout, projected onto new source tongue'
    studs = Builder('V9_Tongue_Edge_Studs', [bpy.data.materials['Border_Studs']])
    stations = [(.08,.14+i*.041) for i in range(15)] + [(.92,.14+i*.041) for i in range(15)]
    stations += [(.13+i*.062,.11) for i in range(13)]
    for s,t in stations:
        f = frame(s,t)
        if f:
            v,faces = stone(f,.00064,.00047,10)
            studs.add(v,faces,smooth=True)
    studs.finish()

if __name__ == '__main__':
    main()
