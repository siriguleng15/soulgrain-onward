"""A shared, reference-derived material domain for the tongue and cuff.

The SVG is the previously recorded visual trace, not a factory drawing. A
radial cage preserves every point in the 79 mm artwork protection disk. Only
the non-artwork margins adapt to the silhouette. All animation poses use the
same resulting 2-D material coordinates; changing pose cannot change width.
"""
from pathlib import Path
import hashlib
import re

import numpy as np
from PIL import Image, ImageDraw


class DesignSurface:
    WIDTH = .103
    HEIGHT = .158
    SEAM = .0505
    CENTER = np.array([.001, .0991])  # across-shoe coordinate, from SVG left
    PROTECTED_RADIUS = .0395

    def __init__(self, svg: Path):
        self.reference_sha256 = hashlib.sha256(svg.read_bytes()).hexdigest()
        path = re.search(r'id="tongue-outline" d="([^"]+)"', svg.read_text()).group(1)
        tokens = re.findall(r'[MQCZ]|[-+]?(?:\d*\.\d+|\d+)', path)
        points, cursor, first, i = [], None, None, 0
        while i < len(tokens):
            command = tokens[i]
            i += 1
            count = {'M': 2, 'Q': 4, 'C': 6, 'Z': 0}[command]
            values = np.asarray([float(x) for x in tokens[i:i + count]]).reshape(-1, 2)
            i += count
            if command == 'M':
                cursor = first = values[0]
                points.append(cursor)
            elif command == 'Z':
                cursor = first
            else:
                t = np.linspace(0, 1, 97)[1:, None]
                if command == 'Q':
                    segment = (1 - t) ** 2 * cursor + 2 * (1 - t) * t * values[0] + t ** 2 * values[1]
                else:
                    segment = (1 - t) ** 3 * cursor + 3 * (1 - t) ** 2 * t * values[0] + 3 * (1 - t) * t ** 2 * values[1] + t ** 3 * values[2]
                points.extend(segment)
                cursor = values[-1]
        polygon = np.asarray(points)
        lo, hi = polygon.min(0), polygon.max(0)
        polygon = (polygon - lo) / (hi - lo) * [self.WIDTH, self.HEIGHT]
        polygon[:, 0] = self.WIDTH / 2 - polygon[:, 0]
        self.polygon = polygon
        # Clip the visible free tongue at the original foot-connected seam.
        clipped = []
        for a, b in zip(polygon, np.roll(polygon, -1, axis=0)):
            inside_a, inside_b = a[1] >= self.SEAM, b[1] >= self.SEAM
            if inside_a:
                clipped.append(a)
            if inside_a != inside_b:
                clipped.append(a + (b - a) * ((self.SEAM - a[1]) / (b[1] - a[1])))
        self.free_polygon = np.asarray(clipped)
        self.angles = np.arange(8192) / 8192 * np.pi * 2
        self.radii = self._radial_boundary(polygon)
        self.free_radii = self._radial_boundary(self.free_polygon)
        assert self.radii.min() > self.PROTECTED_RADIUS
        assert self.free_radii.min() > self.PROTECTED_RADIUS

    def _radial_boundary(self, polygon):
        a = polygon - self.CENTER
        edge = np.roll(polygon, -1, axis=0) - polygon
        output = []
        for start in range(0, len(self.angles), 256):
            phi = self.angles[start:start + 256]
            direction = np.column_stack([np.cos(phi), np.sin(phi)])
            denominator = direction[:, None, 0] * edge[None, :, 1] - direction[:, None, 1] * edge[None, :, 0]
            valid = abs(denominator) > 1e-15
            ray = np.divide(a[None, :, 0] * edge[None, :, 1] - a[None, :, 1] * edge[None, :, 0], denominator, out=np.full_like(denominator, np.inf), where=valid)
            along = np.divide(a[None, :, 0] * direction[:, None, 1] - a[None, :, 1] * direction[:, None, 0], denominator, out=np.full_like(denominator, np.inf), where=valid)
            hit = valid & (ray > 0) & (along >= -1e-9) & (along <= 1 + 1e-9)
            radius = np.where(hit, ray, np.inf).min(1)
            assert np.isfinite(radius).all(), 'Reference must be star-shaped about the protected artwork'
            output.extend(radius)
        return np.asarray(output)

    def lookup(self, radii, angle):
        return np.interp(np.mod(angle, np.pi * 2), self.angles, radii, period=np.pi * 2)

    def _warp(self, points, source_radius, target_radius):
        delta = points - self.CENTER
        radius = np.linalg.norm(delta, axis=1)
        target = self.PROTECTED_RADIUS + (radius - self.PROTECTED_RADIUS) * (target_radius - self.PROTECTED_RADIUS) / np.maximum(source_radius - self.PROTECTED_RADIUS, .001)
        target = np.minimum(target, target_radius)
        scale = np.where(radius <= self.PROTECTED_RADIUS, 1, target / np.maximum(radius, 1e-15))
        return self.CENTER + delta * scale[:, None]

    def tongue(self, across, length):
        """Rectangle UV domain to exact free-section reference silhouette."""
        points = np.column_stack([across, length])
        delta = points - self.CENTER
        phi = np.arctan2(delta[:, 1], delta[:, 0])
        direction = delta / np.maximum(np.linalg.norm(delta, axis=1, keepdims=True), 1e-15)
        x_distance = np.where(direction[:, 0] >= 0, self.WIDTH / 2 - self.CENTER[0], self.WIDTH / 2 + self.CENTER[0])
        y_distance = np.where(direction[:, 1] >= 0, self.HEIGHT - self.CENTER[1], self.CENTER[1] - self.SEAM)
        source = np.minimum(x_distance / np.maximum(abs(direction[:, 0]), 1e-15), y_distance / np.maximum(abs(direction[:, 1]), 1e-15))
        result = self._warp(points, source, self.lookup(self.free_radii, phi))
        result[length < self.SEAM] = points[length < self.SEAM]
        return result

    def cuff(self, points, faces):
        """Fit the existing cuff margins, keeping its original artwork disk."""
        pixel = .00012
        lo = points.min(0) - pixel * 4
        hi = points.max(0) + pixel * 4
        size = np.ceil((hi - lo) / pixel).astype(int) + 1
        mask = Image.new('1', tuple(size), 0)
        draw = ImageDraw.Draw(mask)
        coords = np.rint((points - lo) / pixel).astype(int)
        for face in faces:
            draw.polygon([tuple(p) for p in coords[face]], fill=1)
        bitmap = np.asarray(mask)
        distances = np.arange(self.PROTECTED_RADIUS, .21, pixel)
        source = []
        for start in range(0, len(self.angles), 256):
            phi = self.angles[start:start + 256]
            direction = np.column_stack([np.cos(phi), np.sin(phi)])
            rays = self.CENTER + direction[:, None, :] * distances[None, :, None]
            indices = np.rint((rays - lo) / pixel).astype(int)
            valid = (indices[:, :, 0] >= 0) & (indices[:, :, 1] >= 0) & (indices[:, :, 0] < size[0]) & (indices[:, :, 1] < size[1])
            present = bitmap[np.clip(indices[:, :, 1], 0, size[1] - 1), np.clip(indices[:, :, 0], 0, size[0] - 1)] & valid
            radius = np.where(present, distances, 0).max(1) + pixel * .5
            assert (radius > self.PROTECTED_RADIUS).all()
            source.extend(radius)
        phi = np.arctan2(points[:, 1] - self.CENTER[1], points[:, 0] - self.CENTER[0])
        result = self._warp(points, self.lookup(np.asarray(source), phi), self.lookup(self.radii, phi))
        protected = np.linalg.norm(points - self.CENTER, axis=1) <= self.PROTECTED_RADIUS
        assert np.max(np.abs(result[protected] - points[protected])) < 1e-14
        return result
