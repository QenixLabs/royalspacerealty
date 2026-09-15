#!/usr/bin/env python3
"""Resize + compress extracted property images into public/.

Picks the largest images per property (by pixel area), resizes to a
max dimension, converts to JPEG, and writes to public/properties/<folder>/.
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PROPS = ROOT / "properties"
OUT = ROOT / "public" / "properties"

# Property-N folder -> URL slug (must match lib/properties.ts)
SLUGS = {
    "Property-1": "ocean-breeze",
    "Property-2": "gold-crest",
    "Property-3": "rashmi-manorath",
    "Property-4": "nakshatra-heights",
    "Property-5": "hum-gs-heights",
    "Property-6": "jaswanti-jewel",
    "Property-7": "shree-ascend-towers",
    "Property-8": "tsaaya",
    "Property-9": "empire-fairmont",
    "Property-10": "rajgruha",
    "Property-11": "shreeji-eternity",
    "Property-12": "np-harmony",
    "Property-13": "sukoon",
}

MAX_IMAGES = 8          # per property
MAX_DIM = 1600          # px, longest side
JPEG_QUALITY = 82
MIN_AREA = 400 * 300    # skip tiny crops


def pick_images(folder: Path, limit: int) -> list[Path]:
    files = [p for p in folder.glob("img-*") if p.suffix.lower() in {".png", ".jpg", ".jpeg"}]
    scored = []
    for f in files:
        try:
            with Image.open(f) as im:
                w, h = im.size
        except Exception:
            continue
        area = w * h
        if area < MIN_AREA:
            continue
        scored.append((area, f))
    scored.sort(key=lambda t: t[0], reverse=True)
    return [f for _, f in scored[:limit]]


def convert(src: Path, dst: Path) -> int:
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        scale = MAX_DIM / max(w, h)
        if scale < 1:
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        im.save(dst, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    return dst.stat().st_size


def main() -> int:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    total_bytes = 0
    for prop_dir in sorted(PROPS.glob("Property-*")):
        slug = SLUGS.get(prop_dir.name)
        if not slug:
            print(f"-- {prop_dir.name}: no slug mapping, skip")
            continue
        img_dir = prop_dir / "images"
        if not img_dir.is_dir():
            print(f"-- {prop_dir.name}: no images, skip")
            continue
        picks = pick_images(img_dir, MAX_IMAGES)
        if not picks:
            print(f"-- {prop_dir.name}: no usable images, skip")
            continue
        out_dir = OUT / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        for i, src in enumerate(picks, 1):
            dst = out_dir / f"{i:02d}.jpg"
            total_bytes += convert(src, dst)
        print(f">> {prop_dir.name}: {len(picks)} images -> {out_dir.relative_to(ROOT)}")

    mb = total_bytes / 1024 / 1024
    print(f"\ndone. total size: {mb:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
