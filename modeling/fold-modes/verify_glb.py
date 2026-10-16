"""Read-only, stdlib verification of the exported two-state shoe.

Run: python3 modeling/fold-modes/verify_glb.py [optional.glb]
Checks the actual GLB buffers, not Blender-side object counts. Endpoint bounds
are in glTF metres (Y up). This validates delivery integrity, not resemblance to
the photographs or collision-free cloth motion between the two endpoints.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess


ROOT = Path(__file__).resolve().parents[2]
ORIGINAL = Path('/workspace/onward-readonly-inspection-20261017/source/generic_converse_style_sneakers.glb')
SOURCE_SHA = 'af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
TARGET = 'Shaft_Upright'
MATERIALS = {
    'Body_Canvas', 'Body_Inner_Canvas', 'Collar_Canvas', 'Tongue_Canvas',
    'Rubber_Toe', 'Rubber_Foxing', 'Rubber_Outsole', 'Laces', 'Eyelets',
    'Heel_Strip', 'Canvas_Trim', 'Stitching', 'Inner_Lining',
}
VARIABLE = {'Convertible_Shaft', 'Convertible_Tongue', 'Garment_Binding',
            'Garment_Stitching'} | {f'Shaft_Eyelet_{i:02}' for i in range(1, 9)} | {
                f'Tongue_Eyelet_{i:02}' for i in range(1, 3)}


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


class GLB:
    FORMATS = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}
    SHAPES = {'SCALAR': (1, 1), 'VEC2': (1, 2), 'VEC3': (1, 3),
              'VEC4': (1, 4), 'MAT2': (2, 2), 'MAT3': (3, 3), 'MAT4': (4, 4)}

    def __init__(self, path):
        data = path.read_bytes()
        assert len(data) >= 20 and struct.unpack_from('<III', data) == (0x46546C67, 2, len(data)), 'Invalid GLB header'
        chunks = {}
        offset = 12
        while offset < len(data):
            length, kind = struct.unpack_from('<II', data, offset)
            offset += 8
            assert length % 4 == 0 and offset + length <= len(data), 'Invalid GLB chunk'
            assert kind not in chunks, 'Duplicate GLB chunk'
            chunks[kind] = data[offset:offset + length]
            offset += length
        self.doc = json.loads(chunks[0x4E4F534A])
        self.binary = chunks[0x004E4942]
        assert len(self.doc['buffers']) == 1 and 'uri' not in self.doc['buffers'][0], 'Model must be self-contained'
        assert self.doc['buffers'][0]['byteLength'] <= len(self.binary)
        self.cache = {}

    def read_view(self, view_id, byte_offset, count, component_type, shape):
        view = self.doc['bufferViews'][view_id]
        assert view['buffer'] == 0
        code = self.FORMATS[component_type]
        size = struct.calcsize('<' + code)
        columns, rows = self.SHAPES[shape]
        # Matrix columns with byte/short values require 4-byte alignment.
        column_stride = ((rows * size + 3) // 4) * 4 if columns > 1 else rows * size
        span = column_stride * columns
        stride = view.get('byteStride', span)
        assert stride >= span
        assert byte_offset + (count - 1) * stride + span <= view['byteLength'] if count else True
        base = view.get('byteOffset', 0) + byte_offset
        assert base + (count - 1) * stride + span <= len(self.binary) if count else True
        result = []
        for i in range(count):
            result.append(tuple(struct.unpack_from('<' + code, self.binary,
                                base + i * stride + column * column_stride + row * size)[0]
                                for column in range(columns) for row in range(rows)))
        return result

    def accessor(self, index):
        if index in self.cache:
            return self.cache[index]
        spec = self.doc['accessors'][index]
        columns, rows = self.SHAPES[spec['type']]
        result = (self.read_view(spec['bufferView'], spec.get('byteOffset', 0), spec['count'],
                                spec['componentType'], spec['type']) if 'bufferView' in spec else
                  [(0,) * (columns * rows) for _ in range(spec['count'])])
        if 'sparse' in spec:
            sparse = spec['sparse']
            indices = sparse['indices']
            values = sparse['values']
            sparse_indices = self.read_view(indices['bufferView'], indices.get('byteOffset', 0), sparse['count'],
                                            indices['componentType'], 'SCALAR')
            sparse_values = self.read_view(values['bufferView'], values.get('byteOffset', 0), sparse['count'],
                                           spec['componentType'], spec['type'])
            assert [x[0] for x in sparse_indices] == sorted({x[0] for x in sparse_indices})
            for (destination,), value in zip(sparse_indices, sparse_values):
                assert 0 <= destination < spec['count']
                result[destination] = value
        if spec.get('normalized'):
            kind = spec['componentType']
            divisor = {5120: 127, 5121: 255, 5122: 32767, 5123: 65535}[kind]
            result = [tuple(max(-1.0, value / divisor) for value in row) for row in result]
        assert all(math.isfinite(value) for row in result for value in row), f'Non-finite accessor {index}'
        self.cache[index] = result
        return result


def identity():
    return (1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)


def multiply(a, b):
    return tuple(sum(a[k * 4 + row] * b[column * 4 + k] for k in range(4))
                 for column in range(4) for row in range(4))


def node_matrix(node):
    if 'matrix' in node:
        return node['matrix']
    x, y, z, w = node.get('rotation', (0, 0, 0, 1))
    sx, sy, sz = node.get('scale', (1, 1, 1))
    tx, ty, tz = node.get('translation', (0, 0, 0))
    return ((1 - 2 * (y*y + z*z))*sx, 2*(x*y + z*w)*sx, 2*(x*z - y*w)*sx, 0,
            2*(x*y - z*w)*sy, (1 - 2*(x*x + z*z))*sy, 2*(y*z + x*w)*sy, 0,
            2*(x*z + y*w)*sz, 2*(y*z - x*w)*sz, (1 - 2*(x*x + y*y))*sz, 0,
            tx, ty, tz, 1)


def transform(matrix, point):
    return tuple(sum(matrix[column * 4 + row] * point[column] for column in range(3)) + matrix[12 + row]
                 for row in range(3))


def bounds(points):
    low = [min(point[axis] for point in points) for axis in range(3)]
    high = [max(point[axis] for point in points) for axis in range(3)]
    return {'min': low, 'max': high, 'dimensions': [b-a for a, b in zip(low, high)]}


def verify(path, source):
    assert source.is_file(), f'Original source missing: {source}'
    assert sha256(source) == SOURCE_SHA, 'Original source SHA-256 differs'
    glb = GLB(path)
    doc = glb.doc
    assert {material['name'] for material in doc['materials']} == MATERIALS, 'The 13 editable materials changed'
    assert len(doc['materials']) == 13
    scene = doc['scenes'][doc.get('scene', 0)]
    seen_nodes, parts, moving, used_materials = set(), {}, set(), set()
    points = [[], []]
    triangles = 0
    primitives = 0

    def visit(index, parent):
        nonlocal triangles, primitives
        assert index not in seen_nodes, 'Repeated/cyclic scene node'
        seen_nodes.add(index)
        node = doc['nodes'][index]
        matrix = multiply(parent, node_matrix(node))
        if 'mesh' in node:
            mesh = doc['meshes'][node['mesh']]
            name = node.get('name', mesh.get('name', str(index)))
            assert name not in parts, f'Duplicate shoe part: {name}'
            target_names = mesh.get('extras', {}).get('targetNames', [])
            variable = name in VARIABLE
            if variable:
                assert target_names == [TARGET], f'{name}: missing named morph'
                moving.add(name)
            else:
                assert not target_names, f'Unexpected variable lower-shoe part {name}'
            vertex_count = 0
            part_triangles = 0
            max_delta = 0.0
            part_points = [[], []]
            for primitive in mesh['primitives']:
                primitives += 1
                attributes = primitive['attributes']
                assert primitive.get('mode', 4) == 4, f'{name}: expected triangles'
                assert 'POSITION' in attributes and 'NORMAL' in attributes and 'TEXCOORD_0' in attributes, f'{name}: missing position/normal/UV'
                positions = glb.accessor(attributes['POSITION'])
                count = len(positions)
                assert count > 0
                vertex_count += count
                normals = glb.accessor(attributes['NORMAL'])
                uv = glb.accessor(attributes['TEXCOORD_0'])
                assert len(normals) == len(uv) == count
                assert all(len(row) == 3 for row in positions + normals)
                assert all(len(row) == 2 for row in uv)
                assert any(max(row[axis] for row in uv) - min(row[axis] for row in uv) > 1e-7 for axis in range(2)), f'{name}: constant UVs'
                indices = glb.accessor(primitive['indices']) if 'indices' in primitive else [(i,) for i in range(count)]
                assert len(indices) % 3 == 0 and all(len(i) == 1 and 0 <= i[0] < count for i in indices), f'{name}: invalid triangle index'
                part_triangles += len(indices) // 3
                used_materials.add(doc['materials'][primitive['material']]['name'])
                targets = primitive.get('targets', [])
                if variable:
                    assert len(targets) == 1 and 'POSITION' in targets[0], f'{name}: missing vertex deltas'
                    delta = glb.accessor(targets[0]['POSITION'])
                    assert len(delta) == count and all(len(row) == 3 for row in delta)
                    for semantic, accessor in targets[0].items():
                        assert len(glb.accessor(accessor)) == count, f'{name}: mismatched morph {semantic}'
                    max_delta = max(max_delta, max(math.sqrt(sum(v*v for v in row)) for row in delta))
                else:
                    assert not targets, f'{name}: unwanted morph in fixed lower shoe'
                    delta = [(0, 0, 0)] * count
                # One shared base index buffer / UV accessor defines both states.
                # No replacement meshes or visibility swaps are required.
                for position, offset in zip(positions, delta):
                    for mode in (0, 1):
                        world = transform(matrix, tuple(a + mode*b for a, b in zip(position, offset)))
                        points[mode].append(world)
                        part_points[mode].append(world)
            assert not variable or max_delta > 0.005, f'{name}: morph exists but does not unfold'
            triangles += part_triangles
            parts[name] = {'vertices': vertex_count, 'triangles': part_triangles,
                           'target': TARGET if variable else None, 'max_vertex_delta_m': max_delta,
                           'folded_bounds_m': bounds(part_points[0]), 'upright_bounds_m': bounds(part_points[1])}
        for child in node.get('children', []):
            visit(child, matrix)

    for root in scene['nodes']:
        visit(root, identity())
    assert moving == VARIABLE, 'Missing convertible parts'
    assert used_materials == MATERIALS, 'Editable material not used'
    assert len(parts) == 21 and 'Shoe_Body' in parts and 'Original_Lower_Laces' in parts, 'Expected exactly one shoe assembly'
    end_bounds = [bounds(p) for p in points]
    for mode, box in enumerate(end_bounds):
        length, height, width = box['dimensions']
        assert 0.25 < length < 0.30 and 0.075 < width < 0.12, f'Mode {mode}: unexpected shoe size / duplicate shoe'
        assert (0.12 < height < 0.18) if mode == 0 else (0.18 < height < 0.30), f'Mode {mode}: unexpected shaft height'
    assert end_bounds[1]['max'][1] > end_bounds[0]['max'][1] + 0.045, 'Upright shaft did not become taller'
    assert parts['Shoe_Body']['folded_bounds_m'] == parts['Shoe_Body']['upright_bounds_m'], 'Lower shoe moved'

    changed = subprocess.run(['git', 'diff', '--name-only', 'HEAD', '--'], cwd=ROOT,
                             check=True, text=True, capture_output=True).stdout.splitlines()
    protected_changes = [name for name in changed if (name.endswith(('.glb', '.blend')) or '.glb.part' in name)
                         and name != 'public/assets/soulgrain_onward_fold_modes_v6.glb'
                         and not name.startswith('modeling/fold-modes/')]
    assert not protected_changes, f'Old model files changed: {protected_changes}'
    return {'status': 'PASS', 'file': str(path), 'bytes': path.stat().st_size,
            'sha256': sha256(path), 'original_source_sha256': SOURCE_SHA,
            'mesh_objects': len(parts), 'primitives': primitives, 'triangles': triangles,
            'editable_materials': len(MATERIALS), 'morph_objects': len(moving),
            'folded_bounds_m': end_bounds[0], 'upright_bounds_m': end_bounds[1],
            'old_model_files_modified': protected_changes, 'parts': parts,
            'scope': 'Buffer integrity and two endpoints; not an appearance or cloth-motion validation.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('glb', nargs='?', type=Path,
                        default=ROOT / 'public/assets/soulgrain_onward_fold_modes_v6.glb')
    parser.add_argument('--source', type=Path, default=ORIGINAL)
    args = parser.parse_args()
    print(json.dumps(verify(args.glb, args.source), indent=2))
