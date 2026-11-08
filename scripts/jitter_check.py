"""Mede a suavidade do movimento (anti-"tremedeira") em quadros consecutivos.

Para cada quadro, calcula o centroide subpixel dos pixels claros dentro de uma regiao (ROI).
Movimento suave => a 2a diferenca (aceleracao) da posicao e pequena e regular.
Encaixe em pixel inteiro / tremor => picos de ~1 px na 2a diferenca.

Uso: python jitter_check.py "pasta/prefixo_f*.jpg" x0 y0 x1 y1 [limiar=170]
"""
import glob
import sys

import cv2
import numpy as np

pattern = sys.argv[1]
x0, y0, x1, y1 = map(int, sys.argv[2:6])
thr = int(sys.argv[6]) if len(sys.argv) > 6 else 170
files = sorted(glob.glob(pattern))
pos = []
for f in files:
    im = cv2.imread(f, cv2.IMREAD_GRAYSCALE)[y0:y1, x0:x1].astype(np.float32)
    w = np.clip(im - thr, 0, None)
    if w.sum() < 1:
        pos.append((np.nan, np.nan))
        continue
    ys, xs = np.mgrid[0 : im.shape[0], 0 : im.shape[1]]
    pos.append(((w * xs).sum() / w.sum() + x0, (w * ys).sum() / w.sum() + y0))
pos = np.array(pos)
d1 = np.diff(pos, axis=0)
d2 = np.diff(pos, n=2, axis=0)
print(f"{len(files)} frames, ROI=({x0},{y0})-({x1},{y1}), thr={thr}")
for i, f in enumerate(files):
    v = f"  dx={d1[i - 1][0]:+.3f} dy={d1[i - 1][1]:+.3f}" if i > 0 else ""
    print(f"{f.split('_f')[-1]}: x={pos[i][0]:.3f} y={pos[i][1]:.3f}{v}")
print(f"max |2nd diff| x={np.nanmax(np.abs(d2[:, 0])):.3f}px y={np.nanmax(np.abs(d2[:, 1])):.3f}px  (suave: < ~0.25 px)")
