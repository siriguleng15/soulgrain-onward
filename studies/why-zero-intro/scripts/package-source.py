"""Package the standalone runtime and editable assets; never include user recordings."""
import sys,subprocess,zipfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve()
if not (str(out).startswith('/tmp/') or str(out).startswith('/workspace/why-zero-preview-')):
    raise ValueError('Use an isolated build directory')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for name in ['src','scripts','assets-src','public/assets','docs','README.zh-CN.md','package.json','package-lock.json','tsconfig.json','index.html','.gitignore']:
        p=root/name
        paths=[p] if p.is_file() else p.rglob('*')
        for f in paths:
            if f.is_file() and f.suffix not in ['.blend1','.blend2'] and '__pycache__' not in f.parts:
                archive.write(f,'zero-hand-polish-v4/'+str(f.relative_to(root)))
    try:
        commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True,stderr=subprocess.DEVNULL).strip()
    except subprocess.CalledProcessError:
        metadata=root/'SOURCE-COMMIT.txt'
        commit=metadata.read_text().strip() if metadata.exists() else 'working-copy'
    archive.writestr('zero-hand-polish-v4/SOURCE-COMMIT.txt',commit+'\n')
    archive.writestr('zero-hand-polish-v4/VERIFICATION.txt','Runtime sources and editable assets are included. Screenshot/video evidence is at https://siriguleng15.github.io/soulgrain-onward/why-zero-hand-polish-v4/review.html and in the GitHub source branch. Run scripts/verify-v4.mjs to regenerate it.\n')
print('Source archive:',out.stat().st_size,'bytes')
