"""Retoque da placa do Artico depois do scripts/fill_rows.py: tira a "fumaca" cinza junto ao pico do iceberg.

Nas linhas em que o buraco do iceberg tem o morro escuro de um lado e a nevoa clara do outro, o
preenchimento espelhado mistura os dois e sobra um borrao cinza no anel que o parallax revela (ele ja
aparece em repouso, logo acima do pico). Aqui o contorno do morro continua por tras do iceberg com a
mesma inclinacao. Acima dele so entra nevoa/horizonte espelhados da DIREITA; abaixo, na metade esquerda
do buraco, so o morro espelhado da ESQUERDA; abaixo, na metade direita, o morro distante e a praia da
DIREITA. A troca entre os lados fica no meio do buraco, sempre escondida pelo iceberg.

Uso: python -I scripts/fix_plate.py PLACA.jpg RECORTE.png   (reescreve PLACA.jpg; placa de 2400 px)
"""
import sys

import cv2
import numpy as np

# contorno do morro na placa de 2400 px (medido na foto ate o encontro com o iceberg em ~(1175, 655)),
# prolongado com a mesma inclinacao (~0.49) por tras dele
SKYLINE = np.float32([(1000, 572), (1100, 618), (1175, 655), (1300, 716), (1420, 775)])
ROWS = (600, 790)
XWIN = (1040, 1420)
DIL = 16  # mesma dilatacao do fill_rows (px da foto)

plate_p, cut_p = sys.argv[1], sys.argv[2]
P = cv2.imread(plate_p, cv2.IMREAD_COLOR).astype(np.float32)
H, W = P.shape[:2]
cut = cv2.imread(cut_p, cv2.IMREAD_UNCHANGED)
m = cv2.dilate((cut[:, :, 3] > 10).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * DIL + 1, 2 * DIL + 1)))
hole = cv2.resize(m, (W, H), interpolation=cv2.INTER_NEAREST)
hole = cv2.dilate(hole, np.ones((5, 5), np.uint8)).astype(bool)  # cobre a borda suavizada do fill_rows

new = P.copy()
changed = 0
for y in range(*ROWS):
    row = hole[y]
    x = XWIN[0]
    while x < XWIN[1]:
        if not row[x]:
            x += 1
            continue
        a = x
        while x < W and row[x]:
            x += 1
        xl, xr = a - 1, x  # vizinhos fora do buraco
        if xl < 0 or xr >= W:
            continue
        xs = np.arange(a, x)
        ml = np.clip(xl - (xs - xl), 0, W - 1)
        mr = np.clip(xr + (xr - xs), 0, W - 1)
        ml[row[ml]] = xl  # amostra caiu em outro pedaco de gelo: usa a borda
        mr[row[mr]] = xr
        above = np.clip((np.interp(xs, SKYLINE[:, 0], SKYLINE[:, 1]) - y) / 1.5 + 0.5, 0, 1)  # borda suave (~1.5 px)
        right = ((xs - xl) > (xr - xs)).astype(np.float32)
        wf = np.maximum(above, right)[:, None]
        new[y, a:x] = P[y, mr] * wf + P[y, ml] * (1 - wf)
        changed += len(xs)

cv2.imwrite(plate_p, np.clip(new, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
print(f"plate fix -> {plate_p}: {changed} px refeitos com o contorno do morro")
