#!/usr/bin/env python3
"""Pair independent real-paper and actual-GLB anchors through the user's photo.

No mesh is modified. A null cloth hit stays null. Model coordinates are never
labelled as millimetres without an independent measured model scale.

python3 modeling/reference-model-v10/build_bridge.py [--model path] [--meta path]
"""
from __future__ import annotations
import argparse, hashlib, json, math, struct
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
DTYPE = {5120: '<i1', 5121: '<u1', 5122: '<i2', 5123: '<u2', 5125: '<u4', 5126: '<f4'}
WIDTH = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read_glb(path: Path):
    raw = path.read_bytes()
    if raw[:4] != b'glTF' or struct.unpack_from('<I', raw, 4)[0] != 2:
        raise ValueError('Expected a GLB 2.0 model')
    doc, binary, offset = None, None, 12
    while offset < len(raw):
        size, kind = struct.unpack_from('<II', raw, offset)
        chunk = raw[offset+8:offset+8+size]
        if kind == 0x4E4F534A:
            doc = json.loads(chunk)
        elif kind == 0x004E4942:
            binary = chunk
        offset += size+8
    if doc is None or binary is None:
        raise ValueError('GLB must contain JSON and embedded binary buffers')
    return raw, doc, binary


def accessor(doc, binary, index):
    a = doc['accessors'][index]
    if 'sparse' in a:
        raise ValueError('Sparse accessors are not supported by this read-only audit')
    view = doc['bufferViews'][a['bufferView']]
    if view.get('buffer', 0) != 0:
        raise ValueError('External buffers are not supported by this audit')
    dtype = np.dtype(DTYPE[a['componentType']])
    width = WIDTH[a['type']]
    start = view.get('byteOffset', 0)+a.get('byteOffset', 0)
    stride = view.get('byteStride', dtype.itemsize*width)
    return np.ndarray((a['count'], width), dtype=dtype, buffer=binary,
                      offset=start, strides=(stride, dtype.itemsize)).copy()


def node_matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix'], dtype=float).reshape((4, 4), order='F')
    t = np.eye(4); t[:3, 3] = node.get('translation', [0, 0, 0])
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    r = np.eye(4)
    r[:3, :3] = [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                 [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                 [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]]
    s = np.diag([*node.get('scale', [1, 1, 1]), 1])
    return t@r@s


def cloth_role(node, material, mesh):
    import re
    for entry in [node.get('extras', {}), material.get('extras', {}), mesh.get('extras', {})]:
        value = entry.get('bridgeRole', entry.get('bridge_role', entry.get('clothRole')))
        if value in ['body', 'cuff', 'excluded']:
            return value
    name = (node.get('name', '')+' '+material.get('name', '')+' '+mesh.get('name', '')).lower()
    if re.search(r'tongue|lace|eyelet|snap|buckle|strap|pu[_ -]|sole|rubber|lining|binding|stitch|piping|hardware', name):
        return 'excluded'
    if re.search(r'cuff.*(canvas|cloth|shell)|(?:canvas|cloth|shell).*cuff|翻筒面料', name):
        return 'cuff'
    if re.search(r'(?:body|upper|quarter).*(?:canvas|cloth|shell)|(?:canvas|cloth|shell).*(?:body|upper|quarter)|鞋身面料', name):
        return 'body'
    return 'unknown'


def primitives(doc, binary):
    result = []
    def signature(positions, indices):
        # Matches bridge.ts / Three.js BufferAttribute bytes. The supplied
        # export has plain, uncompressed POSITION and index accessors.
        h = 2166136261
        for value in positions.tobytes(order='C') + indices.tobytes(order='C'):
            h = ((h ^ value) * 16777619) & 0xffffffff
        return f'{len(positions)}:{indices.size if indices.size else len(positions)}:{h:08x}'
    def visit(index, parent, node_path):
        node = doc['nodes'][index]
        matrix = parent@node_matrix(node)
        if 'mesh' in node:
            mesh_index = node['mesh']; mesh = doc['meshes'][mesh_index]
            for primitive_index, p in enumerate(mesh['primitives']):
                if p.get('mode', 4) != 4:
                    continue
                material = doc.get('materials', [])[p['material']] if 'material' in p else {}
                role = cloth_role(node, material, mesh)
                source_positions = accessor(doc, binary, p['attributes']['POSITION'])
                local = source_positions.astype(float)
                world = np.c_[local, np.ones(len(local))]@matrix.T
                source_indices = accessor(doc, binary, p['indices']).ravel() if 'indices' in p else np.arange(len(local), dtype=np.uint32)
                ids = source_indices.astype(np.int64)
                if len(ids) % 3:
                    raise ValueError('Nontriangle primitive index count')
                result.append({'node': index, 'mesh': mesh_index, 'primitive': primitive_index,
                    'name': node.get('name', mesh.get('name', '')), 'role': role,
                    'meshPath': node_path+(f'/{primitive_index}' if len(mesh['primitives']) > 1 else ''),
                    'geometrySignature': signature(source_positions, source_indices) if 'indices' in p else signature(source_positions, np.array([], dtype=np.uint32)),
                    'doubleSided': material.get('doubleSided', False), 'positions': world[:, :3],
                    'indices': ids.reshape((-1, 3))})
        # GLTFLoader adds primitive children before child nodes for a
        # multiprimitive mesh. Cameras/skins/attachments are not accepted by
        # this editable product export; node path is validated in the actual
        # GLTFLoader test before publishing any static anchor.
        offset = len(doc['meshes'][node['mesh']]['primitives']) if 'mesh' in node and len(doc['meshes'][node['mesh']]['primitives']) > 1 else 0
        for child_number, child in enumerate(node.get('children', [])):
            visit(child, matrix, f'{node_path}/{offset+child_number}')
    roots = doc.get('scenes', [{}])[doc.get('scene', 0)].get('nodes', [])
    if not roots:
        children = {child for node in doc['nodes'] for child in node.get('children', [])}
        roots = [i for i in range(len(doc['nodes'])) if i not in children]
    for root_number, root in enumerate(roots):
        visit(root, np.eye(4), f'root/{root_number}')
    return result


def registration(meta):
    r = meta.get('photoRegistration', meta.get('registration', meta))
    fields = ['widthPx', 'heightPx', 'originXPx', 'originYPx', 'pixelsPerUnitX', 'pixelsPerUnitY',
              'rightWorld', 'upWorld', 'viewDirectionWorld']
    if any(field not in r for field in fields):
        raise ValueError('model-data.json must contain photoRegistration with '+', '.join(fields))
    right, up, forward = (np.array(r[key], dtype=float) for key in ['rightWorld', 'upWorld', 'viewDirectionWorld'])
    basis = np.array([right, up, forward])
    if not np.all(np.isfinite(basis)) or not np.allclose(basis@basis.T, np.eye(3), atol=1e-5):
        raise ValueError('Registration directions must be orthonormal')
    scalars = [r[key] for key in ['widthPx', 'heightPx', 'originXPx', 'originYPx', 'pixelsPerUnitX', 'pixelsPerUnitY']]
    if not np.all(np.isfinite(scalars)) or r['widthPx'] <= 0 or r['heightPx'] <= 0 or r['pixelsPerUnitX'] <= 0 or r['pixelsPerUnitY'] <= 0:
        raise ValueError('Registration scales/image dimensions must be finite and positive')
    return r, right, up, forward


def project(point, r, right, up):
    p = np.asarray(point)
    return np.stack((r['originXPx']+p@right*r['pixelsPerUnitX'],
                     r['originYPx']-p@up*r['pixelsPerUnitY']), axis=-1)


def prepare(parts, r, right, up, forward):
    for part in parts:
        # Excluded geometry remains an occlusion blocker. Removing it from
        # the ray query would invent visibility through a PU strip or eyelet.
        vertices = part['positions'][part['indices']]
        px = project(vertices, r, right, up)
        a, b, c = px[:, 0], px[:, 1], px[:, 2]
        den = (b[:, 1]-c[:, 1])*(a[:, 0]-c[:, 0])+(c[:, 0]-b[:, 0])*(a[:, 1]-c[:, 1])
        normal = np.cross(vertices[:, 1]-vertices[:, 0], vertices[:, 2]-vertices[:, 0])
        front = normal@forward < -1e-15
        grid = {}
        # Projected 32 px tiles make the optional 8k-vertex shell audit bounded;
        # this is only an acceleration index and never a nearest-face fallback.
        for face, corners in enumerate(px):
            if abs(den[face]) <= 1e-14 or not part['doubleSided'] and not front[face]:
                continue
            low = np.maximum(0, np.floor(np.min(corners, axis=0)/32).astype(int))
            high = np.minimum(np.floor(np.array([r['widthPx'], r['heightPx']])/32).astype(int), np.floor(np.max(corners, axis=0)/32).astype(int))
            if np.any(high < low):
                continue
            for gx in range(low[0], high[0]+1):
                for gy in range(low[1], high[1]+1):
                    grid.setdefault((gx, gy), []).append(face)
        part.update(vertices=vertices, px=px, den=den, front=front, photoGrid=grid)


def hit_photo(pixel, layer, parts, r, right, up, forward, diagnostic=None):
    candidates = []
    x, y = pixel
    for part in parts:
        if 'px' not in part:
            continue
        px, den = part['px'], part['den']
        a, b, c = px[:, 0], px[:, 1], px[:, 2]
        eligible = np.asarray(part['photoGrid'].get((math.floor(x/32), math.floor(y/32)), []), dtype=int)
        if not len(eligible):
            continue
        w0 = ((b[eligible, 1]-c[eligible, 1])*(x-c[eligible, 0])+(c[eligible, 0]-b[eligible, 0])*(y-c[eligible, 1]))/den[eligible]
        w1 = ((c[eligible, 1]-a[eligible, 1])*(x-c[eligible, 0])+(a[eligible, 0]-c[eligible, 0])*(y-c[eligible, 1]))/den[eligible]
        weights = np.stack((w0, w1, 1-w0-w1), axis=-1)
        inside = np.flatnonzero(np.all(weights >= -1e-8, axis=-1) & np.all(weights <= 1+1e-8, axis=-1))
        for item in inside:
            face = int(eligible[item]); bary = np.clip(weights[item], 0, 1); bary /= np.sum(bary)
            point = np.sum(part['vertices'][face]*bary[:, None], axis=0)
            if any(part['node'] == candidate['gltfNode'] and part['primitive'] == candidate['primitive'] and np.linalg.norm(point-np.asarray(candidate['modelPosition'])) < 1e-8 for candidate in candidates):
                continue
            reprojection = project(point, r, right, up)
            candidates.append({'gltfNode': part['node'], 'gltfMesh': part['mesh'], 'primitive': part['primitive'],
                'meshName': part['name'], 'triangle': face, 'geometryVertexIndices': part['indices'][face].tolist(),
                'meshPath': part['meshPath'], 'geometrySignature': part['geometrySignature'],
                'barycentric': bary.tolist(), 'modelPosition': point.tolist(), 'units': 'model-unit', 'role': part['role'],
                'projectionResidualPx': float(np.linalg.norm(reprojection-np.asarray(pixel))),
                '_depth': float(point@forward)})
    candidates.sort(key=lambda c: c['_depth'])
    if diagnostic is not None:
        diagnostic.update({'firstSurfaceRole': candidates[0]['role'] if candidates else None,
            'firstSurfaceMesh': candidates[0]['meshName'] if candidates else None,
            'raySurfaceCandidates': len(candidates),
            'blockedByForegroundSurface': bool(candidates and candidates[0]['role'] != layer)})
    if not candidates or candidates[0]['role'] != layer:
        return []
    candidates = [candidate for candidate in candidates if candidate['role'] == layer]
    for candidate in candidates:
        del candidate['_depth']
    return candidates


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model', type=Path, default=ROOT/'public/reference-model-v10/corrected.glb')
    parser.add_argument('--meta', type=Path, default=ROOT/'public/reference-model-v10/model-data.json')
    parser.add_argument('--paper-project', type=Path, default=ROOT/'public/pattern-engineering/exports/ONWARD-project.json')
    parser.add_argument('--out', type=Path, default=ROOT/'public/reference-model-v10/bridge-data.json')
    parser.add_argument('--shell', action='store_true', help='Also project the same real-paper vertices to explicit cloth, keeping a non-hit mask')
    args = parser.parse_args()
    raw, doc, binary = read_glb(args.model)
    meta = json.loads(args.meta.read_text()); r, right, up, forward = registration(meta)
    parts = primitives(doc, binary); prepare(parts, r, right, up, forward)
    paper = json.loads(args.paper_project.read_text())
    pairs = []
    for source in paper['points']:
        pixel = source.get('photoPixel'); layer = source.get('layer')
        visibility = {}
        candidates = hit_photo(pixel, layer, parts, r, right, up, forward, visibility) if pixel and layer in ['body', 'cuff'] else []
        actual = candidates[0] if candidates else None
        warnings = ['This photo bridge depends on an unverified paper fold and independently assumed model/photo registration.',
                    'AI model coordinates are not calibrated millimetres.',
                    'A zero reprojection residual is numerical self-consistency, not physical registration accuracy.',
                    'The real paper and AI model preserve separate triangle identities; their topologies are not interchangeable.',
                    'Foreground hardware, tongue, unknown surfaces and another cloth layer block hidden cloth; the camera does not see through them.']
        if len(candidates) > 1:
            warnings.append(f'{len(candidates)} cloth surfaces share this photo pixel; nearest requested-layer surface selected.')
        if not candidates:
            warnings.append('No explicitly labelled requested cloth layer was hit; position stays unmapped and is not snapped to hardware or a nearby point.')
        if visibility.get('blockedByForegroundSurface'):
            warnings.append(f'The first actual surface is {visibility["firstSurfaceRole"]} in {visibility["firstSurfaceMesh"]}; cloth behind it is not photo-visible evidence.')
        pairs.append({'schemaVersion': 1, 'id': source['id'], 'label': source['label'], 'layer': layer, 'kind': source['kind'],
            'paper': source.get('anchor'), 'photoPixel': pixel, 'actual': actual,
            'candidateCount': len(candidates), 'ambiguous': len(candidates) > 1, 'visibility': visibility,
            'projectionResidualPx': actual['projectionResidualPx'] if actual else None,
            'registrationFitResidualPx': r.get('fitResidualPx'),
            'confidence': 'unverified-photo-bridge', 'productionReady': False, 'warnings': warnings})
    cloth = [part for part in parts if part['role'] in ['body', 'cuff']]
    validation = {'clothClassificationAvailable': bool(cloth), 'mappedPointsAvailable': any(pair['actual'] for pair in pairs), 'identityChecksApplyOnlyToMappedPoints': True, 'finiteMappedCoordinates': all(np.all(np.isfinite(pair['actual']['modelPosition'])) for pair in pairs if pair['actual']),
        'barycentricWeightsValid': all(abs(sum(pair['actual']['barycentric'])-1) < 1e-7 and min(pair['actual']['barycentric']) >= -1e-8 for pair in pairs if pair['actual']),
        'actualTriangleIdsInRange': all(any(part['node'] == pair['actual']['gltfNode'] and part['primitive'] == pair['actual']['primitive'] and pair['actual']['triangle'] < len(part['indices']) for part in cloth) for pair in pairs if pair['actual']),
        'maxNumericalProjectionResidualPx': max((pair['projectionResidualPx'] for pair in pairs if pair['actual']), default=None),
        'modelUnmodifiedByThisScript': hashlib.sha256(args.model.read_bytes()).hexdigest() == hashlib.sha256(raw).hexdigest()}
    if not all(validation[key] for key in ['finiteMappedCoordinates', 'barycentricWeightsValid', 'actualTriangleIdsInRange', 'modelUnmodifiedByThisScript']):
        raise AssertionError('Bridge identity check failed')
    report = {'schemaVersion': 1, 'project': 'SoulGrain ONWARD photo-mediated paper-to-actual-model bridge',
        'productionReady': False, 'modelSha256': hashlib.sha256(raw).hexdigest(),
        'paperProjectSha256': hashlib.sha256(args.paper_project.read_bytes()).hexdigest(),
        'registration': r, 'paperUnits': 'mm', 'actualModelUnits': 'model-unit', 'points': pairs,
        'occlusionPolicy': 'First actual surface must be explicitly classified requested cloth; no ray-through-hardware or hidden-layer installation assumption.',
        'mappedCount': sum(pair['actual'] is not None for pair in pairs), 'totalPoints': len(pairs),
        'status': 'unmapped-classification-required' if not cloth else 'partial-reference-bridge' if any(pair['actual'] for pair in pairs) else 'visible-cloth-bridge-installation-points-unmapped',
        'primitiveSummary': [{key: part[key] for key in ['node', 'mesh', 'primitive', 'name', 'role']} | {'triangles': len(part['indices'])} for part in parts],
        'validation': validation, 'limitations': ['The supplied AI mesh is independent of the real cutting-pattern topology.',
            'Only explicit body/cuff cloth primitives can receive an anchor; tongue, hardware, straps, unknown primitives and other foreground layers block hidden hits.',
            'No real sewing/lasting inverse, absolute model-size calibration, collision/contact validation or certified factory location is established.']}
    if args.shell:
        source = paper['vertexIdentity']
        flat = np.asarray(source['flatMm'], dtype=float).reshape((-1, 2))
        formed = np.asarray(source['formedMm'], dtype=float).reshape((-1, 3))
        original_indices = np.asarray(source['triangleIndices'], dtype=int).reshape((-1, 3))
        if len(flat) != len(formed) or len(flat) != len(source['vertexIds']) or not np.all(np.isfinite(flat)) or not np.all(np.isfinite(formed)) or np.any(original_indices < 0) or np.any(original_indices >= len(flat)):
            raise ValueError('Paper snapshot does not preserve a valid fixed vertex identity')
        pr = paper['registration']; fold = paper['deformation']
        alpha = math.radians(fold['hingeAngleDeg'])
        hinge = np.array([fold['hingeXmm'], fold['hingeYmm']])
        signed = -(flat[:, 0]-hinge[0])*math.sin(alpha)+(flat[:, 1]-hinge[1])*math.cos(alpha)
        photo_pixels = np.stack((pr['originXPx']-pr['pixelsPerMmX']*formed[:, 0], pr['originYPx']-pr['pixelsPerMmY']*formed[:, 1]), axis=-1)
        shell_anchors = []
        for vertex, pixel in enumerate(photo_pixels):
            candidates = hit_photo(pixel, 'cuff' if signed[vertex] > 0 else 'body', parts, r, right, up, forward) if 0 <= pixel[0] <= r['widthPx'] and 0 <= pixel[1] <= r['heightPx'] else []
            shell_anchors.append(candidates[0] if candidates else None)
        mask = np.array([anchor is not None for anchor in shell_anchors])
        all_hit = np.all(mask[original_indices], axis=-1)
        # This affine flat display frame is not a new physical scale for paper.
        flat_pixels = np.stack((pr['originXPx']-pr['pixelsPerMmX']*flat[:, 0], pr['originYPx']-pr['pixelsPerMmY']*flat[:, 1]), axis=-1)
        flat_display = ((flat_pixels[:, 0]-r['originXPx'])/r['pixelsPerUnitX'])[:, None]*right+((r['originYPx']-flat_pixels[:, 1])/r['pixelsPerUnitY'])[:, None]*up
        # Surface ray hits can jump at a fold or an occlusion boundary. Do not
        # connect unrelated model patches just because three vertices hit.
        # This is a drawing guard, not a material strain tolerance.
        actual_positions = np.asarray([anchor['modelPosition'] if anchor else flat_display[i] for i, anchor in enumerate(shell_anchors)])
        role_number = np.asarray([1 if anchor and anchor['role'] == 'body' else 2 if anchor else 0 for anchor in shell_anchors])
        same_role = np.all(role_number[original_indices] == role_number[original_indices[:, :1]], axis=-1)
        maximum_drawing_edge_ratio = 4.0
        continuous = np.ones(len(original_indices), dtype=bool)
        for edge_a, edge_b in [(0, 1), (1, 2), (2, 0)]:
            source_edge = flat_display[original_indices[:, edge_b]]-flat_display[original_indices[:, edge_a]]
            target_edge = actual_positions[original_indices[:, edge_b]]-actual_positions[original_indices[:, edge_a]]
            continuous &= np.linalg.norm(target_edge, axis=-1) <= maximum_drawing_edge_ratio*np.linalg.norm(source_edge, axis=-1)+1e-6
        keep = all_hit & same_role & continuous
        report['fittedPaperShell'] = {
            'sourceVertexIds': source['vertexIds'], 'sourceFlatMm': source['flatMm'],
            'sourceTriangleIndices': source['triangleIndices'],
            'flatDisplayModelUnits': flat_display.ravel().tolist(),
            'actualAnchors': shell_anchors,
            'actualPositionsModelUnits': [anchor['modelPosition'] if anchor else None for anchor in shell_anchors],
            'mappedVertexMask': mask.tolist(), 'mappedVertexCount': int(np.sum(mask)),
            'visibleOriginalTriangleIds': np.flatnonzero(keep).tolist(),
            'visibleTriangleIndices': original_indices[keep].ravel().tolist(),
            'sourceVertexCount': len(flat), 'sourceTriangleCount': len(original_indices),
            'mappedBodyVertices': int(np.sum(mask & (signed <= 0))),
            'mappedCuffVertices': int(np.sum(mask & (signed > 0))),
            'drawingContinuityGuard': {'maximumEdgeRatioToFlatDisplay': maximum_drawing_edge_ratio,
                'notAMaterialTolerance': True,
                'crossLayerTrianglesNotDrawn': int(np.sum(all_hit & ~same_role)),
                'largeJumpTrianglesNotDrawn': int(np.sum(all_hit & same_role & ~continuous))},
            'warnings': ['Only photo-visible, explicitly labelled cloth hits are fitted; missing and hidden regions stay unmapped.',
                'The full original paper vertices and triangles remain authoritative. visibleTriangleIndices is a drawing subset with explicit original triangle IDs, not a replacement cutting pattern.',
                'The flat display in model units is an assumed camera registration transform, not an absolute millimetre scale or a verified physical deformation.',
                'Triangles crossing different cloth roles or a large model-space ray-hit jump are withheld from the drawing; their original paper indices remain unchanged.',
                'Straight interpolation of this display frame to the fitted shell is only a correspondence visualization; it is not a recovered sewing/lasting process.']}
        # Supply reviewable examples of the working visible bridge. These are
        # kept separate from the user's eight installation references and can
        # never substitute for a hidden PU or snap installation point.
        examples = []
        for wanted_role, code, label in [('body', 'B', '鞋身'), ('cuff', 'C', '翻筒')]:
            eligible = [i for i in np.flatnonzero(keep) if shell_anchors[original_indices[i, 0]]['role'] == wanted_role]
            step = max(1, len(eligible)//160)
            pool = []
            for triangle in eligible[::step]:
                vertex_ids = original_indices[triangle]
                pixel = np.mean(photo_pixels[vertex_ids], axis=0)
                hits = hit_photo(pixel, wanted_role, parts, r, right, up, forward)
                if not hits:
                    continue
                pool.append((int(triangle), vertex_ids, pixel, hits))
            if not pool:
                continue
            center = np.mean([candidate[2] for candidate in pool], axis=0)
            first = int(np.argmin([np.linalg.norm(candidate[2]-center) for candidate in pool]))
            chosen = [pool.pop(first)]
            while pool and len(chosen) < 4:
                distance = [min(np.linalg.norm(candidate[2]-selected[2]) for selected in chosen) for candidate in pool]
                chosen.append(pool.pop(int(np.argmax(distance))))
            for sample_number, (triangle, vertex_ids, pixel, hits) in enumerate(chosen, 1):
                source_anchor = {'triangle': triangle, 'barycentric': [1/3, 1/3, 1/3],
                    'flatMm': np.mean(flat[vertex_ids], axis=0).tolist(),
                    'formedMm': np.mean(formed[vertex_ids], axis=0).tolist()}
                actual_anchor = hits[0]
                examples.append({'schemaVersion': 1, 'id': f'VIS-{code}{sample_number}',
                    'label': f'可见{label}取样 {sample_number} · 非扣件定位',
                    'kind': 'visible-cloth-example-not-installation', 'layer': wanted_role,
                    'paper': source_anchor, 'photoPixel': pixel.tolist(), 'actual': actual_anchor,
                    'projectionResidualPx': actual_anchor['projectionResidualPx'],
                    'registrationFitResidualPx': r.get('fitResidualPx'),
                    'confidence': 'unverified-photo-bridge', 'productionReady': False,
                    'warnings': ['可见面料的数值对应演示取样，不是扣件位置、钻孔或生产定位点。',
                        '取样不替代原有八个安装参考点；被皮条或硬件遮挡的安装点仍保持未映射。',
                        '照片配准、模型尺度及隐藏结构尚未通过实物验证。']})
        report['visibleClothExamples'] = examples
        validation['visibleClothExampleCount'] = len(examples)
        print(f'Fitted same-identity paper shell: {int(np.sum(mask))}/{len(flat)} vertices, {int(np.sum(keep))}/{len(original_indices)} fully mapped source triangles')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print(f'Photo bridge: {report["mappedCount"]}/{report["totalPoints"]} explicitly labelled cloth hits; productionReady=false')
    print(json.dumps(validation, indent=2))


if __name__ == '__main__':
    main()
