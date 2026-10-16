"""Reassemble exactly the verified original; never use a preview/V3 fallback."""
import hashlib,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
EXPECTED='af09c38e980c87a0f78469ce43aa2ea3f4841a4b4a8500b01a979a2a84da6e65'
manifest=json.loads((ROOT/'manifest.json').read_text())
assert manifest['original_sha256']==EXPECTED
out=Path('/tmp/onward-original');out.mkdir(parents=True,exist_ok=True)
target=out/'generic_converse_style_sneakers.glb'
temporary=out/'restoring.glb'
try:
 with temporary.open('wb') as destination:
  for part in manifest['parts']:
   path=ROOT/part['name'];data=path.read_bytes()
   assert len(data)==part['bytes'],f'Part size mismatch: {path.name}'
   assert hashlib.sha256(data).hexdigest()==part['sha256'],f'Part hash mismatch: {path.name}'
   destination.write(data)
 assert temporary.stat().st_size==manifest['original_bytes']
 assert hashlib.sha256(temporary.read_bytes()).hexdigest()==EXPECTED
 os.replace(temporary,target)
 print(f'VERIFIED {target} {manifest["original_bytes"]} bytes SHA256 {EXPECTED}')
except BaseException:
 temporary.unlink(missing_ok=True)
 raise
