"""Read-only checks on the delivered V7 GLB, using Python's standard library.

    python3 modeling/refined-shoe/verify_glb.py [model.glb] [--source original.glb]

The reusable GLB reader lives in ../fold-modes/verify_glb.py, so keep those
repository folders together. No Blender, npm package, model mutation, or
network request is involved. --baseline can identify the pre-V7 Git commit
when checking that earlier model assets have not changed.

This checks buffers, editable surface roles and the two endpoint poses. It
does not assess photograph similarity, self-intersections or intermediate
cloth motion; the geometric checker and visual review serve those purposes.
"""
import argparse
import importlib.util
import json
import math
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[2]
HELPER = ROOT / 'modeling/fold-modes/verify_glb.py'
if not HELPER.is_file():
    raise FileNotFoundError(f'Keep the repository GLB reader alongside V7: {HELPER}')
_spec = importlib.util.spec_from_file_location('onward_glb_reader', HELPER)
_reader = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_reader)
GLB = _reader.GLB
sha256 = _reader.sha256
bounds = _reader.bounds
identity = _reader.identity
multiply = _reader.multiply
node_matrix = _reader.node_matrix
transform = _reader.transform
SOURCE_SHA = _reader.SOURCE_SHA
TARGET = _reader.TARGET
MATERIALS = _reader.MATERIALS | {'Collar_Outer_Canvas', 'Tongue_Reverse_Canvas'}

# Semantic names are part of the editing interface. Counts are deliberately
# derived from the actual export instead of inheriting the V6 object counts.
MOVING = {
    'Convertible_Shaft', 'Convertible_Tongue', 'Convertible_Upper_Eyelets',
    'Convertible_Tongue_Eyelets', 'Garment_Binding', 'Garment_Stitching',
    'Quilt_Seam_Channels',
}
REQUIRED_FIXED = {
    'Shoe_Body', 'Original_Vamp', 'Original_Lower_Laces', 'Inner_Lining',
    'Lower_Shoe_Eyelets', 'Draped_Lace_Ends', 'Rubber_Toe_Bumper_Relief',
    'Rubber_Foxing_Moulded_Lip', 'Heel_Seam_Stitch',
}
FIXED_NAMED_TARGET = {'Heel_Seam_Stitch'}
DEFAULT_MODEL = ROOT / 'public/assets/soulgrain_onward_refined_v7.glb'


def source_path():
    candidates = [
        _reader.ORIGINAL,
        Path('/tmp/onward-editable-original.glb'),
        Path('/tmp/onward-original/generic_converse_style_sneakers.glb'),
    ]
    return next((path for path in candidates if path.is_file()), candidates[0])


def old_model_changes(baseline):
    result = subprocess.run(
        ['git', 'diff', '--name-only', '--diff-filter=ACDMRTUXB', baseline, '--'],
        cwd=ROOT, check=True, text=True, capture_output=True,
    )
    return [name for name in result.stdout.splitlines()
            if (name.endswith(('.glb', '.blend')) or '.glb.part' in name)
            and name != 'public/assets/soulgrain_onward_refined_v7.glb'
            and not name.startswith('modeling/refined-shoe/')]


def verify(path, source, baseline='HEAD'):
    assert source.is_file(), f'Original source missing; pass --source: {source}'
    assert sha256(source) == SOURCE_SHA, 'Original source SHA-256 differs'
    glb = GLB(path)
    doc = glb.doc
    assert doc.get('asset', {}).get('version') == '2.0', 'Expected glTF 2.0'
    assert len(doc.get('materials', [])) == len(MATERIALS)
    assert {m.get('name') for m in doc['materials']} == MATERIALS, 'Missing/duplicate editable material role'
    for material in doc['materials']:
        color = material.get('pbrMetallicRoughness', {}).get('baseColorFactor', [1, 1, 1, 1])
        assert len(color) == 4 and all(math.isfinite(value) for value in color)
        assert max(color[:3]) - min(color[:3]) < .1, f'{material["name"]}: unexpected colored source artwork'
    for image in doc.get('images', []):
        assert 'bufferView' in image and 'uri' not in image, 'Texture must be embedded in GLB'
        assert image.get('mimeType') in {'image/png', 'image/jpeg', 'image/webp'}
        view = doc['bufferViews'][image['bufferView']]
        assert view['buffer'] == 0 and view['byteLength'] > 0
        assert view.get('byteOffset', 0) + view['byteLength'] <= len(glb.binary)
    # Decode every accessor, including unreferenced ones, to detect invalid or
    # non-finite binary data rather than trusting exporter-side object counts.
    for accessor in range(len(doc.get('accessors', []))):
        glb.accessor(accessor)
    assert not doc.get('skins'), 'This delivery uses shared-topology endpoint morphs, not a skeleton'
    scene = doc['scenes'][doc.get('scene', 0)]
    assert scene.get('extras', {}).get('source_sha256') == SOURCE_SHA, 'Export lost original-source provenance'
    seen_nodes, seen_meshes, parts = set(), set(), {}
    moving, named_targets, used_materials = set(), set(), set()
    all_points = [[], []]
    primitive_count = triangle_count = vertex_count = 0

    def visit(index, parent):
        nonlocal primitive_count, triangle_count, vertex_count
        assert 0 <= index < len(doc['nodes']) and index not in seen_nodes, 'Repeated/invalid/cyclic node'
        seen_nodes.add(index)
        node = doc['nodes'][index]
        matrix = multiply(parent, node_matrix(node))
        if 'mesh' in node:
            seen_meshes.add(node['mesh'])
            mesh = doc['meshes'][node['mesh']]
            name = node.get('name', mesh.get('name', str(index)))
            assert name not in parts, f'Duplicate shoe part: {name}'
            target_names = mesh.get('extras', {}).get('targetNames', [])
            expects_target = name in MOVING or name in FIXED_NAMED_TARGET
            if expects_target:
                assert target_names == [TARGET], f'{name}: missing named endpoint morph'
                assert mesh.get('weights', [0]) == [0], f'{name}: delivery must default to folded state'
                assert node.get('weights', [0]) == [0], f'{name}: unexpected default node weight'
                named_targets.add(name)
            else:
                assert not target_names, f'Unexpected morph on fixed part {name}'
            part_points = [[], []]
            part_vertices = part_triangles = 0
            max_delta = 0.0
            material_names = set()
            assert mesh.get('primitives'), f'{name}: empty mesh'
            for primitive in mesh['primitives']:
                primitive_count += 1
                assert primitive.get('mode', 4) == 4, f'{name}: expected triangle mesh'
                attributes = primitive['attributes']
                assert {'POSITION', 'NORMAL', 'TEXCOORD_0'} <= attributes.keys(), f'{name}: missing position/normal/UV'
                positions = glb.accessor(attributes['POSITION'])
                normals = glb.accessor(attributes['NORMAL'])
                uv = glb.accessor(attributes['TEXCOORD_0'])
                count = len(positions)
                assert count and len(normals) == len(uv) == count, f'{name}: mismatched vertex attributes'
                for semantic, accessor in attributes.items():
                    assert len(glb.accessor(accessor)) == count, f'{name}: mismatched {semantic} attribute'
                assert all(len(p) == len(n) == 3 and len(t) == 2 for p, n, t in zip(positions, normals, uv))
                assert all(.95 < sum(v*v for v in n) < 1.05 for n in normals), f'{name}: invalid base normals'
                assert any(max(t[a] for t in uv) - min(t[a] for t in uv) > 1e-7 for a in range(2)), f'{name}: constant UVs'
                indices = glb.accessor(primitive['indices']) if 'indices' in primitive else [(i,) for i in range(count)]
                assert len(indices) % 3 == 0 and all(len(i) == 1 and 0 <= i[0] < count for i in indices), f'{name}: invalid triangle indices'
                assert 'material' in primitive and 0 <= primitive['material'] < len(doc['materials']), f'{name}: missing material'
                material_name = doc['materials'][primitive['material']]['name']
                used_materials.add(material_name)
                material_names.add(material_name)
                targets = primitive.get('targets', [])
                if expects_target:
                    assert len(targets) == 1 and 'POSITION' in targets[0], f'{name}: missing endpoint vertex deltas'
                    delta = glb.accessor(targets[0]['POSITION'])
                    assert len(delta) == count and all(len(row) == 3 for row in delta)
                    for semantic, accessor in targets[0].items():
                        assert semantic in {'POSITION', 'NORMAL', 'TANGENT'}
                        assert len(glb.accessor(accessor)) == count, f'{name}: mismatched morph {semantic}'
                    max_delta = max(max_delta, max(math.sqrt(sum(value*value for value in row)) for row in delta))
                else:
                    assert not targets, f'{name}: unexpected deformation of fixed lower shoe'
                    delta = [(0, 0, 0)] * count
                # Shared UVs and triangle indices serve both poses: only
                # positions/normals change, preserving a user's print layout.
                for position, offset in zip(positions, delta):
                    for mode in (0, 1):
                        world = transform(matrix, tuple(a + mode*b for a, b in zip(position, offset)))
                        all_points[mode].append(world)
                        part_points[mode].append(world)
                part_vertices += count
                part_triangles += len(indices) // 3
            if name in MOVING:
                assert max_delta > .005, f'{name}: endpoint morph does not unfold'
                moving.add(name)
            else:
                # Heel seam has a named target for uniform UI state handling,
                # but lies wholly on the fixed lower quarter. It must NOT move.
                assert max_delta <= 1e-7, f'{name}: fixed lower part moved'
            vertex_count += part_vertices
            triangle_count += part_triangles
            parts[name] = {
                'vertices': part_vertices, 'triangles': part_triangles,
                'materials': sorted(material_names),
                'named_target': TARGET if expects_target else None,
                'moves_between_endpoints': name in moving,
                'max_vertex_delta_m': max_delta,
                'folded_bounds_m': bounds(part_points[0]),
                'upright_bounds_m': bounds(part_points[1]),
            }
        for child in node.get('children', []):
            visit(child, matrix)

    for root in scene['nodes']:
        visit(root, identity())
    assert moving == MOVING, 'Convertible garment/detail part missing'
    assert REQUIRED_FIXED <= parts.keys(), 'Original lower-shoe / detail part missing'
    assert seen_meshes == set(range(len(doc['meshes']))), 'GLB contains unused or hidden extra mesh data'
    assert used_materials == MATERIALS, 'Unused or missing editing surface role'
    end_bounds = [bounds(points) for points in all_points]
    for mode, box in enumerate(end_bounds):
        length, height, width = box['dimensions']  # glTF uses Y-up metres.
        assert .25 < length < .30 and .070 < width < .15, f'Pose {mode}: wrong units/size or multiple shoes'
        assert (.12 < height < .18) if mode == 0 else (.20 < height < .30), f'Pose {mode}: unexpected garment height'
    assert end_bounds[1]['max'][1] > end_bounds[0]['max'][1] + .045, 'Shaft did not rise'
    protected_changes = old_model_changes(baseline)
    assert not protected_changes, f'Existing model/source files changed since {baseline}: {protected_changes}'
    return {
        'status': 'PASS', 'file': str(path), 'bytes': path.stat().st_size,
        'sha256': sha256(path), 'original_source': str(source),
        'original_source_sha256': SOURCE_SHA,
        'mesh_objects': len(parts), 'primitives': primitive_count,
        'primitive_vertices': vertex_count, 'triangles': triangle_count,
        'editable_materials': len(MATERIALS),
        'named_morph_objects': len(named_targets), 'moving_morph_objects': len(moving),
        'fixed_named_morph_objects': sorted(named_targets - moving),
        'embedded_images': len(doc.get('images', [])),
        'folded_bounds_m': end_bounds[0], 'upright_bounds_m': end_bounds[1],
        'old_model_comparison_baseline': baseline,
        'old_model_files_modified': protected_changes, 'parts': parts,
        'scope': 'GLB buffers, shared UV/material layout and two endpoint poses; not photograph similarity, collision or intermediate motion validation.',
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('glb', nargs='?', type=Path, default=DEFAULT_MODEL)
    parser.add_argument('--source', type=Path, default=source_path())
    parser.add_argument('--baseline', default='HEAD', help='Pre-V7 Git revision for existing model protection checks')
    args = parser.parse_args()
    print(json.dumps(verify(args.glb, args.source, args.baseline), indent=2))
