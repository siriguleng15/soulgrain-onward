#!/usr/bin/env python3
"""Build the dependency-free, offline research page. Does not touch site/models."""
import base64
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def data_uri(name):
    return "data:image/jpeg;base64," + base64.b64encode(
        (ROOT / "references" / name).read_bytes()
    ).decode("ascii")


def script(text):
    # An HTML script element terminates at </script even inside JS strings.
    return text.replace("</", "<\\/")


def main():
    shoe = data_uri("shoe-sketch-original.jpg")
    golden = data_uri("golden-reference-original.jpg")
    assets = {"shoeImage": shoe, "structureSvg": (ROOT / "structure-analysis.svg").read_text()}
    replacements = {
        "__STYLE__": (ROOT / "style.css").read_text(),
        "__SHOE_IMAGE__": shoe,
        "__GOLDEN_IMAGE__": golden,
        "__ASSETS__": script(json.dumps(assets, ensure_ascii=False)),
        "__TRACE__": script((ROOT / "shoe-trace.js").read_text()),
        "__GEOMETRY__": script((ROOT / "geometry-data.js").read_text()),
        "__ADVANCED__": script((ROOT / "advanced-geometry.js").read_text()),
        "__APP__": script((ROOT / "app.js").read_text()),
    }
    output = (ROOT / "index.template.html").read_text()
    for key, value in replacements.items():
        if key not in output:
            raise ValueError(f"Missing placeholder: {key}")
        output = output.replace(key, value)
    (ROOT / "index.html").write_text(output)
    print(f"Built {ROOT / 'index.html'} ({len(output.encode()):,} bytes)")


if __name__ == "__main__":
    main()
