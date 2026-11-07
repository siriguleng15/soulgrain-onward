#!/usr/bin/env python3
"""Validate local preview links and Safari-oriented video packaging, not a device test."""
import argparse
import json
from pathlib import Path
import struct
import subprocess
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/tongue-motion-lab/verification'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', default='http://127.0.0.1:4551')
    args = parser.parse_args()
    base = args.url.rstrip('/')
    for route in ['/tongue-motion-lab.html', '/tongue-motion-lab/review.html']:
        with urlopen(base + route, timeout=10) as response:
            assert response.status == 200 and 'text/html' in response.headers.get('Content-Type', '')
            assert b'tongue-motion' in response.read()
    videos = []
    for name in ['tongue-motion-v1-review.mp4', 'tongue-motion-v1-interaction.mp4']:
        file = OUT / name
        probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,pix_fmt,width,height,avg_frame_rate,duration,color_range',
            '-of', 'json', str(file)]))['streams'][0]
        assert probe['codec_name'] == 'h264' and probe['pix_fmt'] == 'yuv420p', probe
        assert probe['width'] % 2 == 0 and probe['height'] % 2 == 0 and float(probe['duration']) >= 19
        atoms = {}
        with file.open('rb') as source:
            while source.tell() < file.stat().st_size:
                offset = source.tell()
                size, kind = struct.unpack('>I4s', source.read(8))
                if size == 1:
                    size = struct.unpack('>Q', source.read(8))[0]
                elif size == 0:
                    size = file.stat().st_size - offset
                assert size >= 8
                atoms[kind.decode('ascii')] = offset
                source.seek(offset + size)
        assert atoms['moov'] < atoms['mdat'], 'Video metadata must precede media for progressive playback'
        request = Request(base + '/tongue-motion-lab/verification/' + name, headers={'Range': 'bytes=0-1023'})
        with urlopen(request, timeout=10) as response:
            assert response.status == 206 and 'video/mp4' in response.headers.get('Content-Type', '')
            assert len(response.read()) == 1024
        videos.append({'file': name, **probe, 'faststart': True, 'httpRange206': True})
    report = {'passed': True, 'localPreview': base, 'entryAndReviewHTTP200': True, 'videos': videos,
        'note': 'Codec/container/HTTP verification only. Physical iPad Safari and public HTTPS deployment are not claimed.'}
    (OUT / 'delivery-validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
