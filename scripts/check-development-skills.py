#!/usr/bin/env python3
"""Check Skill metadata, actual assets, restoration and specifications without building the site."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

BASELINE="fea6c0e753ca0b4ba6b2e32b52ae57ff57a3b1e6"
NAMES=("onward-asset-contract","onward-ribbon-geometry")
ALLOWED_FILES={"AGENTS.md","scripts/check-development-skills.py","scripts/check-codex-skill-discovery.py"}


def allowed(path):
    return path in ALLOWED_FILES or path.startswith(".agents/skills/") or path.startswith("research/development-skills/")


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--three-root",type=Path)
    parser.add_argument("--skill-creator",type=Path,help="Optional real skill-creator directory containing scripts/quick_validate.py")
    args=parser.parse_args();root=args.repo.resolve();checks=[]
    def check(name,passed,detail=None):
        checks.append({"name":name,"passed":bool(passed),"detail":detail})
    def run_json(name,command):
        r=subprocess.run(command,cwd=root,capture_output=True,text=True)
        try:report=json.loads(r.stdout)
        except ValueError:report={"passed":False,"error":r.stderr.strip() or r.stdout[:500]}
        # Do not duplicate the large GLB snapshot in every validation result.
        actual=report.pop("actual",None)
        if actual:report["sourceSummary"]={"sha256":actual["sha256"],"counts":actual["counts"],"nodes":list(actual["nodes"])}
        check(name,r.returncode==0 and report.get("passed") is True,report)
    def git(*command):return subprocess.check_output(["git",*command],cwd=root,text=True).strip()
    try:
        baseline_paths=set(git("ls-tree","-r","--name-only",BASELINE).splitlines())
        changes=git("diff","--name-only",BASELINE,"--").splitlines()
        untracked=git("ls-files","--others","--exclude-standard").splitlines()
        unexpected=sorted(p for p in changes+untracked if not allowed(p))
        existing_changes=sorted(set(changes)&baseline_paths)
        check("only-new-preparation-files",not unexpected and not existing_changes,{"unexpected":unexpected,"modifiedBaselinePaths":existing_changes})
        check("AGENTS-present",(root/"AGENTS.md").is_file())
        try:import yaml
        except ImportError:
            check("skill-metadata",False,"PyYAML is required (also used by official skill-creator). Install it outside the product dependency manifest.")
            yaml=None
        for name in NAMES:
            folder=root/".agents/skills"/name;text=(folder/"SKILL.md").read_text();match=re.match(r"^---\n(.*?)\n---\n",text,re.S)
            if yaml and match:
                metadata=yaml.safe_load(match.group(1));interface=yaml.safe_load((folder/"agents/openai.yaml").read_text())
                desc=metadata.get("description","");ui=interface.get("interface",{});policy=interface.get("policy",{})
                check(name+":metadata",metadata.get("name")==name and isinstance(desc,str) and 0<len(desc)<=1024 and not desc.startswith("[TODO:") and 25<=len(ui.get("short_description",""))<=64 and "$"+name in ui.get("default_prompt","") and policy.get("allow_implicit_invocation",True) is True)
            else:check(name+":metadata",False,"Invalid frontmatter or YAML parser missing")
            links=re.findall(r"\]\(([^)]+)\)",text)
            missing=[p for p in links if not p.startswith(("http:","https:","#")) and not (folder/p.split('#')[0]).is_file()]
            check(name+":resource-links",not missing,missing)
            if args.skill_creator:
                r=subprocess.run([sys.executable,"-B",str(args.skill_creator/"scripts/quick_validate.py"),str(folder)],capture_output=True,text=True)
                check(name+":official-skill-creator",r.returncode==0,r.stdout.strip() or r.stderr.strip())
        run_json("asset-contract-positive-and-negative",[sys.executable,"-B",".agents/skills/onward-asset-contract/scripts/inspect_glb.py","--self-test"])
        command=["node",".agents/skills/onward-asset-contract/scripts/check_restore.mjs"]
        if args.three_root:command.extend(["--three-root",str(args.three_root.resolve())])
        run_json("real-source-headless-restoration",command)
        run_json("ribbon-spec-positive-and-negative",[sys.executable,"-B",".agents/skills/onward-ribbon-geometry/scripts/check_spec.py","--self-test"])
        for mode in ("rectangular-outline","solid-ribbon"):
            run_json("ribbon-mode:"+mode,[sys.executable,"-B",".agents/skills/onward-ribbon-geometry/scripts/check_spec.py","--mode",mode])
        # Ensure cited source code is actually present without running exporters.
        required=["src/immersive-showcase/Scene.ts","src/immersive-showcase/CameraDirector.ts","src/immersive-showcase/surface.ts","src/advertising/geometry/CuffCurve.ts","src/advertising/geometry/CuffMaterial.ts","src/advertising/scene/StudioMaterials.ts","modeling/finished-shoe-v8/finish_v7.py","modeling/interactive-ad-v1/build_ad_asset.py","modeling/interactive-ad-v1/verify_source.py"]
        check("repository-reference-paths",all((root/p).is_file() for p in required),required)
    except (OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError) as error:
        check("validation-completed",False,str(error))
    passed=bool(checks) and all(x["passed"] for x in checks)
    print(json.dumps({"passed":passed,"baselineCommit":BASELINE,"checks":checks,
                      "scope":"Preparation-only checks. Does not render an animation, compile shaders, test Safari or certify implicit model selection."},ensure_ascii=False,indent=2))
    return 0 if passed else 1


if __name__=="__main__":
    sys.exit(main())
