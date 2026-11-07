#!/usr/bin/env python3
"""Arrange actual fixed-camera screenshots; never retouch product geometry."""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--before', type=Path, default=Path('/workspace/tongue-sleeve-lab-v1/public/tongue-motion-lab/verification'))
    args = parser.parse_args()
    after = ROOT / 'public/tongue-motion-lab/verification'
    canvas = Image.new('RGB', (1440, 1300), '#0b1420')
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
    for row, (name, label) in enumerate([('01-plain-shoe.png', 'Initial blank tongue'), ('05-sleeve-flip.png', 'Sleeve turning / 9.3 s')]):
        for column, (folder, tag) in enumerate([(args.before, 'V1 / previous'), (after, 'V1.1 / refined')]):
            source = Image.open(folder / name).convert('RGB')
            assert source.size == (1440, 1000), 'Comparison requires the same capture viewport'
            scene = source.crop((0, 80, 1110, 1000)).resize((700, 580), Image.Resampling.LANCZOS)
            x, y = 10 + column * 720, 10 + row * 650
            draw.text((x + 10, y + 7), tag + ' - ' + label, font=font, fill='#cddfe8')
            canvas.paste(scene, (x, y + 45))
    destination = after / 'v1-v1-1-comparison.jpg'
    canvas.save(destination, quality=94)
    print(destination)


if __name__ == '__main__':
    main()
