#!/usr/bin/env python3
"""Read-only comparison of source worktrees and all pre-existing tracked files."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = '4c0bd8a36d8cf714821b9e2cb36c2eb5407e71f4'


def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args])


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', type=Path, default=Path('/tmp/heel-motion-correction/original-worktree.json'))
    parser.add_argument('--protected', type=Path, default=Path('/workspace/soulgrain-onward'))
    args = parser.parse_args()
    checks = {}
    # Compare every tracked baseline file against its Git blob, including models,
    # UV-bearing GLBs, original textures, existing pages and prepared hand assets.
    files = git(ROOT, 'ls-tree', '-r', '--name-only', '-z', BASE).split(b'\0')
    compared = 0
    for encoded in files:
        if not encoded:
            continue
        name = encoded.decode()
        path = ROOT / name
        expected = git(ROOT, 'show', BASE + ':' + name)
        assert path.is_file() and path.read_bytes() == expected, 'Pre-existing source changed: ' + name
        compared += 1
    checks['allBaselineFilesUnchanged'] = True
    checks['baselineFileCount'] = compared
    if args.snapshot.exists() and args.protected.is_dir():
        expected = json.loads(args.snapshot.read_text())
        protected = args.protected
        tests = {
            'head': git(protected, 'rev-parse', 'HEAD').decode().strip() == expected['head'],
            'branch': git(protected, 'branch', '--show-current').decode().strip() == expected['branch'],
            'status': git(protected, 'status', '--short', '-z').hex() == expected['status'],
            'diff': digest(git(protected, 'diff', '--binary')) == expected['diff'],
            'cached': digest(git(protected, 'diff', '--cached', '--binary')) == expected['cached']}
        for name, value in expected['files'].items():
            tests['file:' + name] = digest((protected / name).read_bytes()) == value
        assert all(tests.values()), tests
        checks['protectedDirtyWorktreeChecks'] = tests
        checks['protectedDirtyWorktreeUnchanged'] = True
    else:
        checks['protectedDirtyWorktreeUnchanged'] = None
        checks['snapshotNote'] = 'Session-specific external snapshot unavailable; baseline asset comparison still ran.'
    heel = Path('/workspace/heel-motion-lab-v1')
    if heel.is_dir():
        checks['heelWorktreeHEADUnchanged'] = git(heel, 'rev-parse', 'HEAD').decode().strip() == '0bbbc8245ef574b73be3e7a7f842190e5af9277a'
        assert checks['heelWorktreeHEADUnchanged']
    previous = Path('/workspace/tongue-sleeve-lab-v1')
    if previous.is_dir() and previous.resolve() != ROOT.resolve():
        checks['previousAnimationHEADUnchanged'] = git(previous, 'rev-parse', 'HEAD').decode().strip() == '0e6c566a84fd2ec51848679338fb743b7d8fde6e'
        checks['previousAnimationWorktreeClean'] = git(previous, 'status', '--porcelain') == b''
        checks['previousAnimationCacheSHA256'] = digest((previous / 'public/tongue-motion-lab/assets/tongue-cuff-morphs.f16').read_bytes())
        assert checks['previousAnimationHEADUnchanged'] and checks['previousAnimationWorktreeClean']
        assert checks['previousAnimationCacheSHA256'] == '0831086fe9066b08ddd8e3b91c3ac56ac4126f16ec5efc955254ed5d57fe39db'
    report = {'passed': True, 'baseCommit': BASE, 'scope': 'Only new tongue-motion-lab files; no original asset or existing page edits.', **checks}
    output = ROOT / 'public/tongue-motion-lab/verification/worktree-protection.json'
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
