"""Fetch the exact user-provided source outside the Git repository."""
from pathlib import Path
from urllib.request import urlopen
import hashlib, sys

URL = 'https://raw.githubusercontent.com/siriguleng15/soulgrain-onward/682cf319ffe5dc4169fc28a95fc527f77b6a7e35/already.glb'
SHA256 = '43653b568a738b04513ca34dd0a23025f6f03072e7c20aa962581e4d400e2d80'
out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/onward-new-source/already.glb')
out.parent.mkdir(parents=True, exist_ok=True)
if out.exists() and hashlib.sha256(out.read_bytes()).hexdigest() == SHA256:
    print('Existing source verified:', out)
else:
    with urlopen(URL, timeout=60) as response:
        data = response.read()
    actual = hashlib.sha256(data).hexdigest()
    if actual != SHA256:
        raise RuntimeError(f'Source hash mismatch: {actual}; no model generated.')
    out.write_bytes(data)
    print('Downloaded and verified:', out, len(data), 'bytes')
