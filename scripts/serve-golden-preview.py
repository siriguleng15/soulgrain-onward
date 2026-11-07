"""Local-only static preview with HTTP byte ranges for native video seeking."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re

class RangeHandler(SimpleHTTPRequestHandler):
    byte_range = None

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self.byte_range = None
        path = Path(self.translate_path(self.path))
        value = self.headers.get('Range')
        if not value or not path.is_file():
            return super().send_head()
        size = path.stat().st_size
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', value.strip())
        if not match or not any(match.groups()):
            self.send_error(400, 'One byte range is supported')
            return None
        a, b = match.groups()
        if a:
            start, end = int(a), min(size-1, int(b) if b else size-1)
        else:
            start, end = max(0, size-int(b)), size-1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        stream = path.open('rb')
        self.byte_range = start, end
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(end-start+1))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Last-Modified', self.date_time_string(path.stat().st_mtime))
        self.end_headers()
        return stream

    def copyfile(self, source, target):
        if self.byte_range is None:
            return super().copyfile(source, target)
        start, end = self.byte_range
        source.seek(start)
        remaining = end-start+1
        while remaining:
            block = source.read(min(65536, remaining))
            if not block:
                break
            target.write(block)
            remaining -= len(block)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, default=Path('/tmp/xiezitu-golden-v1-build'))
    parser.add_argument('--port', type=int, default=4563)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()
    root = args.directory.resolve()
    if not root.is_dir():
        parser.error('Preview directory does not exist')
    server = ThreadingHTTPServer((args.host, args.port), partial(RangeHandler, directory=str(root)))
    print(f'Local preview: http://{args.host}:{args.port}/golden-derivation.html', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
