#!/usr/bin/env bash
# Extract embedded images from every property PDF into an `images/` subfolder
# inside each Property-N directory. Uses poppler's pdfimages (same job as
# iLovePDF's "extract images" — but local, free, no API key).
#
# Usage:
#   ./scripts/extract-pdf-images.sh           # all properties
#   ./scripts/extract-pdf-images.sh Property-1 Property-5
#
# Flags:
#   -p  also render each PDF page to PNG via pdftoppm (for pages where the
#       "image" is actually vector artwork / full-page scans come out blank)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROPS_DIR="$ROOT/properties"
RENDER_PAGES=0

while getopts "p" opt; do
  case "$opt" in
    p) RENDER_PAGES=1 ;;
    *) echo "usage: $0 [-p] [Property-N ...]" >&2; exit 2 ;;
  esac
done
shift $((OPTIND - 1))

if [ "$#" -gt 0 ]; then
  dirs=("$@")
else
  mapfile -t dirs < <(find "$PROPS_DIR" -maxdepth 1 -mindepth 1 -type d -name 'Property-*' | sort -V)
fi

total_extracted=0

for d in "${dirs[@]}"; do
  # allow passing either "Property-1" or full path
  d="${d%/}"
  name="$(basename "$d")"
  dir="$PROPS_DIR/$name"
  [ -d "$dir" ] || { echo "!! skip $name (no dir)"; continue; }

  pdf="$(find "$dir" -maxdepth 1 -type f -iname '*.pdf' | head -1)"
  if [ -z "$pdf" ]; then
    echo "-- $name: no PDF, skip"
    continue
  fi

  out="$dir/images"
  mkdir -p "$out"

  # wipe previous extraction so reruns are idempotent
  rm -f "$out"/img-* "$out"/page-* 2>/dev/null || true

  echo ">> $name  ($(basename "$pdf"))"

  # -png: convert everything to PNG (jpg inputs stay lossless)
  # -p:   page-number prefixed filenames, so ordering is obvious
  if pdfimages -png -p "$pdf" "$out/img" 2>/dev/null; then
    extracted=$(find "$out" -name 'img-*' | wc -l)
  else
    extracted=0
  fi

  # drop tiny artifacts (logos, bullet dots) — < 30KB and smaller than 400px
  # on the short side are not usable property photos
  removed=0
  while IFS= read -r f; do
    # file(1) reports PNG dims: "PNG image data, 1200 x 800, ..."
    dims=$(file -b "$f" | sed -n 's/.*PNG image data, \([0-9]*\) x \([0-9]*\).*/\1 \2/p')
    read -r w h <<< "$dims"
    size=$(stat -c%s "$f")
    if [ "$size" -lt 30720 ] || [ "${w:-0}" -lt 400 ] || [ "${h:-0}" -lt 400 ]; then
      rm -f "$f"
      removed=$((removed + 1))
    fi
  done < <(find "$out" -name 'img-*' -type f)

  kept=$((extracted - removed))
  total_extracted=$((total_extracted + kept))
  echo "   extracted $extracted, dropped $removed (small), kept $kept"

  if [ "$RENDER_PAGES" -eq 1 ]; then
    pdftoppm -png -r 150 "$pdf" "$out/page"
    echo "   rendered $(find "$out" -name 'page-*' | wc -l) pages"
  fi
done

echo
echo "done. total images kept: $total_extracted"
