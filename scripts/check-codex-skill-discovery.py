#!/usr/bin/env python3
"""Exercise Codex's native skills/list API without starting an agent/model turn."""
import argparse
import asyncio
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

NAMES = {"onward-asset-contract", "onward-ribbon-geometry"}


async def inspect(repo, binary):
    with tempfile.TemporaryDirectory(prefix="onward-codex-skills-") as home:
        env = dict(os.environ, CODEX_HOME=home)
        process = await asyncio.create_subprocess_exec(binary, "app-server", "--stdio", cwd=repo, env=env,
                    stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL)
        async def request(request_id, method, params):
            process.stdin.write((json.dumps({"jsonrpc":"2.0","id":request_id,"method":method,"params":params})+"\n").encode())
            await process.stdin.drain()
            for _ in range(100):
                line = await asyncio.wait_for(process.stdout.readline(), timeout=20)
                if not line:
                    raise RuntimeError("Codex app-server exited before replying")
                message = json.loads(line)
                if message.get("id") == request_id:
                    if "error" in message:
                        raise RuntimeError(json.dumps(message["error"]))
                    return message["result"]
            raise RuntimeError("No matching RPC response")
        try:
            init = await request(1,"initialize",{"clientInfo":{"name":"onward-skill-verification","version":"1.0"},"capabilities":{"experimentalApi":True}})
            process.stdin.write(b'{"jsonrpc":"2.0","method":"initialized"}\n')
            await process.stdin.drain()
            response = await request(2,"skills/list",{"cwds":[str(repo)],"forceReload":True})
            items = [x for entry in response.get("data",[]) for x in entry.get("skills",[]) if x.get("name") in NAMES]
            errors = [x for entry in response.get("data",[]) for x in entry.get("errors",[])]
            checks = []
            for name in sorted(NAMES):
                matches = [x for x in items if x["name"] == name]
                expected = repo / ".agents/skills" / name / "SKILL.md"
                valid = len(matches)==1 and matches[0].get("enabled") is True and matches[0].get("scope")=="repo" and Path(matches[0]["path"]).resolve()==expected
                if valid:
                    valid = "$"+name in matches[0].get("interface",{}).get("defaultPrompt","")
                checks.append({"name":name,"passed":valid,"scope":matches[0].get("scope") if matches else None,
                               "path":str(expected.relative_to(repo)),"enabled":matches[0].get("enabled") if matches else False})
            return {"passed":all(x["passed"] for x in checks) and not errors,"client":init.get("userAgent"),
                    "method":"initialize + skills/list(forceReload=true)","checks":checks,"errors":errors,
                    "scope":"Native repository discovery and invocation metadata only. No model turn; natural-language implicit selection is not certified."}
        finally:
            if process.returncode is None:
                process.terminate()
            try:
                await asyncio.wait_for(process.wait(),timeout=5)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo",type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument("--codex",default=shutil.which("codex"))
    args=parser.parse_args()
    if not args.codex:
        print(json.dumps({"passed":False,"error":"Codex CLI not installed; native discovery is unverified"}))
        return 1
    try:
        report=asyncio.run(inspect(args.repo.resolve(),args.codex))
    except (OSError,RuntimeError,TimeoutError,ValueError) as error:
        report={"passed":False,"error":str(error)}
    print(json.dumps(report,ensure_ascii=False,indent=2))
    return 0 if report["passed"] else 1


if __name__=="__main__":
    sys.exit(main())
