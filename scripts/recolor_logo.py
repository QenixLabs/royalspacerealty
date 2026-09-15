"""Recolor the two side buildings in the Royal Space Realty logo to gold.

Selects the left/right house shapes via flood fill from seed points, keeping
alpha untouched so anti-aliased edges stay smooth. Backs up the original.
"""

from collections import deque

import numpy as np
from PIL import Image

SRC = "public/royalspacerealty_white.png"
BACKUP = "/tmp/royalspacerealty_white_orig.png"
GOLD = (234, 196, 108)  # #EAC46C

im = Image.open(SRC).convert("RGBA")
im.save(BACKUP)
a = np.array(im)
h, w = a.shape[:2]
alpha = a[..., 3]
mask = alpha > 40


def find_seed(x0, x1, y0, y1):
    region = mask[int(y0):int(y1), int(x0):int(x1)]
    ys, xs = np.nonzero(region)
    if len(ys) == 0:
        raise SystemExit(f"no pixels in seed region {x0},{y0}-{x1},{y1}")
    cy, cx = int(ys.mean()), int(xs.mean())
    return cy + int(y0), cx + int(x0)


def flood_fill(seed):
    sy, sx = seed
    visited = np.zeros_like(mask)
    q = deque([(sy, sx)])
    visited[sy, sx] = True
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))
    return visited


targets = {
    "left": find_seed(w * 0.05, w * 0.35, h * 0.20, h * 0.75),
    "right": find_seed(w * 0.65, w * 0.95, h * 0.20, h * 0.75),
}

for name, seed in targets.items():
    comp = flood_fill(seed)
    ys, xs = np.nonzero(comp)
    n = len(ys)
    cx, cy = xs.mean() / w, ys.mean() / h
    bw, bh = (xs.max() - xs.min()) / w, (ys.max() - ys.min()) / h
    print(f"{name}: seed={seed} px={n} centroid=({cx:.2f},{cy:.2f}) bbox=({bw:.2f}x{bh:.2f})")
    if bw > 0.5:
        raise SystemExit(f"{name} component spans {bw:.0%} of width — connected to other shapes, aborting")
    a[..., 0][comp] = GOLD[0]
    a[..., 1][comp] = GOLD[1]
    a[..., 2][comp] = GOLD[2]

Image.fromarray(a).save(SRC)
print("saved", SRC, "backup at", BACKUP)
