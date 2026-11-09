"""Recorte final = ALFA do Canva + RGB da foto original.

O "separate-image-layers" do Canva redesenha letras e detalhes da foto (o "Canada" do CF-18 virou "CAFE"), entao
dele so se aproveita o alfa. Este script monta o recorte final a partir da foto enviada ao Canva:
- alfa do PNG exportado (redimensionado para o tamanho da foto, se preciso);
- descarta pedacos soltos menores que --min-frac do maior pedaco;
- fecha furos internos menores que --fill-holes px (manchas onde o Canva "furou" o objeto);
- --decontam: borda semitransparente recebe a cor do interior (sem halo do fundo antigo) — use em camadas de
  parallax, que nao tem a borda branca de adesivo.

Uso: python -I scripts/alpha_cutout.py FOTO.jpg CANVA.png SAIDA.png [--min-frac 0.02] [--fill-holes 400] [--decontam]
Depende so de numpy + opencv.
"""
import argparse

import cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("photo")
ap.add_argument("canva")
ap.add_argument("out")
ap.add_argument("--min-frac", type=float, default=0.02)
ap.add_argument("--fill-holes", type=int, default=400)
ap.add_argument("--decontam", action="store_true")
a = ap.parse_args()

src = cv2.imread(a.photo, cv2.IMREAD_COLOR)
cut = cv2.imread(a.canva, cv2.IMREAD_UNCHANGED)
if src is None or cut is None:
    raise SystemExit("cannot read inputs")
if cut.ndim != 3 or cut.shape[2] != 4:
    raise SystemExit("the Canva export must be an RGBA PNG")
alpha = cut[:, :, 3]
if alpha.shape != src.shape[:2]:
    print(f"note: resizing alpha {alpha.shape[1]}x{alpha.shape[0]} -> {src.shape[1]}x{src.shape[0]}")
    alpha = cv2.resize(alpha, (src.shape[1], src.shape[0]), interpolation=cv2.INTER_LINEAR)
alpha = alpha.copy()

# 1) so os pedacos relevantes (descarta ciscos)
solid = (alpha > 64).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(solid, connectivity=8)
dropped = 0
if n > 1:
    areas = st[1:, cv2.CC_STAT_AREA]
    keep = np.zeros(n, bool)
    keep[1:] = areas >= max(200, a.min_frac * areas.max())
    dropped = int((~keep[1:]).sum())
    kept = cv2.dilate(keep[lab].astype(np.uint8), np.ones((7, 7), np.uint8))
    alpha = (alpha.astype(np.float32) * kept).astype(np.uint8)

# 2) furos pequenos dentro do objeto viram objeto
filled = 0
if a.fill_holes > 0:
    inv = (alpha <= 128).astype(np.uint8)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv, connectivity=4)
    touch = np.zeros(n2, bool)
    for edge in (lab2[0, :], lab2[-1, :], lab2[:, 0], lab2[:, -1]):
        touch[np.unique(edge)] = True
    small = np.zeros(n2, bool)
    small[1:] = st2[1:, cv2.CC_STAT_AREA] < a.fill_holes
    holes = small & ~touch
    holes[0] = False
    hm = holes[lab2] & (inv == 1)
    filled = int(hm.sum())
    alpha[hm] = 255

rgb = src.copy()
# 3) borda sem halo: cor do pixel solido mais proximo (>= 3 px para dentro)
if a.decontam:
    core = cv2.erode((alpha > 250).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=3).astype(bool)
    if core.any():
        _, labels = cv2.distanceTransformWithLabels((~core).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
        ys, xs = np.nonzero(core)
        ly = np.zeros(labels.max() + 1, np.int64)
        lx = np.zeros(labels.max() + 1, np.int64)
        ly[labels[ys, xs]] = ys
        lx[labels[ys, xs]] = xs
        edge = (alpha > 0) & ~core
        rgb[edge] = src[ly[labels], lx[labels]][edge]

cv2.imwrite(a.out, np.dstack([rgb, alpha]), [cv2.IMWRITE_PNG_COMPRESSION, 6])
ys, xs = np.nonzero(alpha > 127)
bbox = f"{xs.max() - xs.min() + 1}x{ys.max() - ys.min() + 1}" if len(xs) else "empty"
print(f"cutout -> {a.out}: {src.shape[1]}x{src.shape[0]}, subject bbox {bbox}, dropped {dropped} specks, filled {filled} hole px")
