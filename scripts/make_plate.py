"""Cria a placa de fundo (camada distante) para o parallax.

Pega a foto original e o recorte do primeiro plano (PNG com alfa exportado do Canva),
remove o primeiro plano da foto por inpainting e salva a placa de fundo limpa.
Assim, quando o primeiro plano se desloca no parallax, nao aparece "fantasma" atras dele.

Uso: python make_plate.py ORIGINAL.jpg RECORTE.png SAIDA.jpg [LARGURA=2400]
"""
import sys

import cv2
import numpy as np

orig = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
cut = cv2.imread(sys.argv[2], cv2.IMREAD_UNCHANGED)
out = sys.argv[3]
width = int(sys.argv[4]) if len(sys.argv) > 4 else 2400

if orig is None or cut is None:
    raise SystemExit("could not read inputs")
if cut.shape[2] != 4:
    raise SystemExit("cutout has no alpha channel")
if cut.shape[:2] != orig.shape[:2]:
    cut = cv2.resize(cut, (orig.shape[1], orig.shape[0]), interpolation=cv2.INTER_AREA)

alpha = cut[:, :, 3]
mask = (alpha > 20).astype(np.uint8) * 255
k = max(5, int(orig.shape[1] * 0.012)) | 1
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))

# Inpainting em escala reduzida (preenchimento amplo e suave), depois volta ao tamanho original.
scale = 900.0 / orig.shape[1]
small = cv2.resize(orig, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
msmall = cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
filled = cv2.inpaint(small, msmall, 9, cv2.INPAINT_TELEA)
filled = cv2.GaussianBlur(filled, (0, 0), 1.2)
filled_up = cv2.resize(filled, (orig.shape[1], orig.shape[0]), interpolation=cv2.INTER_CUBIC)

soft = cv2.GaussianBlur(mask, (0, 0), k * 0.35).astype(np.float32) / 255.0
soft = soft[:, :, None]
plate = (orig.astype(np.float32) * (1 - soft) + filled_up.astype(np.float32) * soft).clip(0, 255).astype(np.uint8)

h = int(round(plate.shape[0] * width / plate.shape[1]))
plate = cv2.resize(plate, (width, h), interpolation=cv2.INTER_AREA)
cv2.imwrite(out, plate, [cv2.IMWRITE_JPEG_QUALITY, 92])
print(f"plate -> {out} ({width}x{h}); masked {float((mask > 0).mean()) * 100:.1f}% of the frame")
