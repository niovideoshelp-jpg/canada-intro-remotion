"""Placa de fundo por preenchimento horizontal ESPELHADO (para paisagens: mar, gelo, horizonte).

Em vez de "borrar" o buraco (inpainting), cada pixel escondido pelo recorte recebe a textura
espelhada da agua/gelo que existe logo a esquerda e logo a direita dele (pulando outras partes
mascaradas), misturadas pela distancia. Agua e horizonte tem textura horizontal, entao a borda que
o parallax revela fica nitida e com o mesmo tom — sem "fantasma" nem halo claro.

Uso: python fill_rows.py ORIGINAL.jpg RECORTE.png SAIDA.jpg [LARGURA=2400] [DILATACAO_PX=18]
"""
import sys

import cv2
import numpy as np

orig = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
cut = cv2.imread(sys.argv[2], cv2.IMREAD_UNCHANGED)
out = sys.argv[3]
width = int(sys.argv[4]) if len(sys.argv) > 4 else 2400
dil = int(sys.argv[5]) if len(sys.argv) > 5 else 18

if cut.shape[:2] != orig.shape[:2]:
    cut = cv2.resize(cut, (orig.shape[1], orig.shape[0]), interpolation=cv2.INTER_AREA)
mask = (cut[:, :, 3] > 10).astype(np.uint8)
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dil + 1, 2 * dil + 1)))

H, W = mask.shape
src = orig.astype(np.float32)
fill = src.copy()
for y in range(H):
    row = mask[y].astype(bool)
    if not row.any():
        continue
    free = np.flatnonzero(~row)
    if len(free) < 4:
        continue
    for x in np.flatnonzero(row):
        k = np.searchsorted(free, x)
        xl = free[k - 1] if k > 0 else None
        xr = free[k] if k < len(free) else None
        samples, weights = [], []
        if xl is not None:
            d = x - xl
            m = xl - d  # espelho em torno da borda esquerda
            m = m if (m >= 0 and not row[m]) else xl
            samples.append(src[y, m])
            weights.append(1.0 / d)
        if xr is not None:
            d = xr - x
            m = xr + d  # espelho em torno da borda direita
            m = m if (m < W and not row[m]) else xr
            samples.append(src[y, m])
            weights.append(1.0 / d)
        wsum = sum(weights)
        fill[y, x] = sum(s * w for s, w in zip(samples, weights)) / wsum

# suaviza levemente na vertical dentro da area preenchida (evita "listras" entre linhas)
soft = cv2.GaussianBlur(fill, (0, 0), sigmaX=0.8, sigmaY=1.8)
m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 2.0)[..., None]
plate = src * (1 - m) + soft * m
plate = np.clip(plate, 0, 255).astype(np.uint8)
h = int(round(H * width / W))
plate = cv2.resize(plate, (width, h), interpolation=cv2.INTER_AREA)
cv2.imwrite(out, plate, [cv2.IMWRITE_JPEG_QUALITY, 92])
print(f"plate -> {out} ({width}x{h}); filled {mask.mean() * 100:.1f}% (espelhamento horizontal)")
