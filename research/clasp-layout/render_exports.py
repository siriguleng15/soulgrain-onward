#!/usr/bin/env python3
"""Optional: render new artwork at 3840px (overview 5760px) with Inkscape."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent


def render(job):
    source, destination = job
    width = 5760 if source.name == "overview.svg" else 3840
    subprocess.run([
        "inkscape", str(source), "--export-type=png", f"--export-width={width}",
        f"--export-filename={destination}",
    ], check=True, capture_output=True)
    return f"{destination.name}: {destination.stat().st_size:,} bytes"


def main():
    if not shutil.which("inkscape"):
        raise SystemExit("Inkscape is optional and was not found. Use the page's PNG export instead.")
    exports = ROOT / "exports"
    # Preserve the first-round PNGs by default; --all is an explicit rerender.
    all_artwork = "--all" in sys.argv[1:]
    jobs = [(ROOT / "structure-analysis.svg", exports / "structure-analysis.png")] if all_artwork else []
    new_names = {f"{prefix}-{letter}" for prefix in ["scheme", "story"] for letter in "EFGHI"} | {"overview"}
    jobs += [(p, p.with_suffix(".png")) for p in sorted(exports.glob("*.svg"))
             if "-clean" not in p.stem and (all_artwork or p.stem in new_names)]
    with ThreadPoolExecutor(max_workers=2) as pool:
        for result in pool.map(render, jobs):
            print(result)


if __name__ == "__main__":
    main()
