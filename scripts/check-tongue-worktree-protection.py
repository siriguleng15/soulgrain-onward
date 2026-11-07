#!/usr/bin/env python3
"""Verify the protected, unrelated dirty worktree against the saved session snapshot.
Does not reset, checkout, stash, clean or edit anything in that worktree.
"""
from pathlib import Path
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1];PROTECTED=Path('/workspace/soulgrain-onward');SNAPSHOT=Path('/tmp/heel-motion-correction/original-worktree.json')
def run(*args):return subprocess.check_output(['git','-C',str(PROTECTED),*args])
def digest(b):return hashlib.sha256(b).hexdigest()
def main():
 expected=json.loads(SNAPSHOT.read_text());checks={'head':run('rev-parse','HEAD').decode().strip()==expected['head'],'branch':run('branch','--show-current').decode().strip()==expected['branch'],'status':run('status','--short','-z').hex()==expected['status'],'diff':digest(run('diff','--binary'))==expected['diff'],'cached':digest(run('diff','--cached','--binary'))==expected['cached']}
 for name,value in expected['files'].items():checks['file:'+name]=digest((PROTECTED/name).read_bytes())==value
 assert all(checks.values()),checks
 report={'passed':True,'checks':len(checks),'protectedWorktree':str(PROTECTED),'protectedHEAD':expected['head'],'branch':expected['branch'],'uncommittedWorktreeAndIndexUnchanged':True,'sourceWorktreeHEAD':subprocess.check_output(['git','-C','/workspace/heel-motion-lab-v1','rev-parse','HEAD']).decode().strip(),'note':'All task edits and derivative exports are confined to the independent tongue worktree.'}
 (ROOT/'public/tongue-sleeve-lab/verification/worktree-protection.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
