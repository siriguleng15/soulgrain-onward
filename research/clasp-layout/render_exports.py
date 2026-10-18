#!/usr/bin/env python3
"""Optional: render the committed vector artwork at 3840px with Inkscape."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent


def render(job):
    source, destination = job
    subprocess.run([
        "inkscape", str(source), "--export-type=png", "--export-width=3840",
        f"--export-filename={destination}",
    ], check=True, capture_output=True)
    return f"{destination.name}: {destination.stat().st_size:,} bytes"


def main():
    if not shutil.which("inkscape"):
        raise SystemExit("Inkscape is optional and was not found. Use the page's PNG export instead.")
    exports = ROOT / "exports"
    jobs = [(ROOT / "structure-analysis.svg", exports / "structure-analysis.png")]
    jobs += [(p, p.with_suffix(".png")) for p in sorted(exports.glob("*.svg")) if "-clean" not in p.stem]
    with ThreadPoolExecutor(max_workers=2) as pool:
        for result in pool.map(render, jobs):
            print(result)


if __name__ == "__main__":
    main()
