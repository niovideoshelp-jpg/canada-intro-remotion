"""Reconstroi em alta resolucao (1920x1080) a textura de grade enviada pelo usuario.

A imagem original tem so 750x740 px. Ampliar direto deixaria a grade borrada.
Aqui separamos a imagem em camadas e recompomos em 1080p:
  - manchas de luz (baixa frequencia) -> ampliadas da original (nao perdem nada)
  - linhas da grade -> detectadas na original e redesenhadas nitidas nas mesmas posicoes
  - poeira / riscos -> extraidos da original e ampliados
  - grao fino -> gerado ESTATICO (nao muda entre frames: sem tremedeira)

Uso: python build_background.py ORIGINAL.jpg SAIDA.jpg
"""
import sys

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter
from scipy.signal import find_peaks

W, H = 1920, 1080
src = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.0
out_path = sys.argv[2]

h0, w0 = src.shape
crop_h = int(round(w0 * H / W))
y0 = (h0 - crop_h) // 2
orig = src[y0 : y0 + crop_h, :]
scale = W / w0

# 1) baixa frequencia (manchas)
low = gaussian_filter(orig, 4.0)
low_up = cv2.resize(low, (W, H), interpolation=cv2.INTER_CUBIC)

# 2) grade: perfil de colunas/linhas do detalhe
detail = orig - gaussian_filter(orig, 2.0)
col = detail.mean(axis=0)
row = detail.mean(axis=1)


def peaks(profile: np.ndarray) -> np.ndarray:
    p, _ = find_peaks(profile, distance=18, prominence=np.std(profile) * 0.8)
    return p


cols = peaks(col)
rows = peaks(row)
spacing_c = np.median(np.diff(cols)) if len(cols) > 2 else 0
spacing_r = np.median(np.diff(rows)) if len(rows) > 2 else 0
print(f"grid columns={len(cols)} spacing={spacing_c:.1f}px rows={len(rows)} spacing={spacing_r:.1f}px (original scale)")

lines = np.zeros((H, W), np.float32)


def draw_line_profile(positions: np.ndarray, profile: np.ndarray, vertical: bool) -> None:
    strength = profile[positions]
    strength = (strength - strength.min()) / (np.ptp(strength) + 1e-6)
    for pos, s in zip(positions, strength):
        x = (pos + 0.5) * scale - 0.5
        a = 0.050 + 0.055 * s  # intensidade da linha (cinza claro sobre grafite)
        if vertical:
            xi = np.arange(W, dtype=np.float32)
            prof = np.exp(-0.5 * ((xi - x) / 0.75) ** 2)
            lines[:, :] = np.maximum(lines, a * prof[None, :])
        else:
            yi = np.arange(H, dtype=np.float32)
            prof = np.exp(-0.5 * ((yi - x) / 0.75) ** 2)
            lines[:, :] = np.maximum(lines, a * prof[:, None])


draw_line_profile(cols, col, vertical=True)
draw_line_profile(rows, row, vertical=False)

# A grade da foto original nao e uniforme: modula a intensidade pelas manchas e por ruido suave.
rng = np.random.default_rng(7)
mod = gaussian_filter(rng.standard_normal((H // 8, W // 8)).astype(np.float32), 6)
mod = cv2.resize(mod, (W, H), interpolation=cv2.INTER_CUBIC)
mod = 0.75 + 0.5 * (mod - mod.min()) / (np.ptp(mod) + 1e-6)
lines *= mod * (0.7 + 1.8 * low_up)

# 3) poeira e riscos (pontos claros que nao sao grade)
fine = orig - gaussian_filter(orig, 1.4)
grid_mask = np.zeros_like(orig, dtype=bool)
for c in cols:
    grid_mask[:, max(0, c - 1) : c + 2] = True
for r in rows:
    grid_mask[max(0, r - 1) : r + 2, :] = True
specks = np.where((fine > 0.06) & (~grid_mask), fine, 0.0).astype(np.float32)
specks_up = cv2.resize(specks, (W, H), interpolation=cv2.INTER_LANCZOS4)
specks_up = np.clip(specks_up, 0, None)
specks_up = gaussian_filter(specks_up, 0.6) * 1.15

# poeira nova, fina, na resolucao final (estatica)
dust = np.zeros((H, W), np.float32)
n = 260
xs = rng.uniform(0, W, n)
ys = rng.uniform(0, H, n)
for x, y in zip(xs, ys):
    r = rng.uniform(0.6, 1.6)
    v = rng.uniform(0.08, 0.30)
    cv2.circle(dust, (int(x), int(y)), int(max(1, round(r))), float(v), -1, lineType=cv2.LINE_AA)
for _ in range(26):  # riscos finos
    x, y = rng.uniform(0, W), rng.uniform(0, H)
    ang = rng.uniform(0, np.pi)
    ln = rng.uniform(8, 38)
    x2, y2 = x + np.cos(ang) * ln, y + np.sin(ang) * ln
    cv2.line(dust, (int(x), int(y)), (int(x2), int(y2)), float(rng.uniform(0.05, 0.14)), 1, lineType=cv2.LINE_AA)
dust = gaussian_filter(dust, 0.5)

# 4) grao fino estatico
grain = rng.standard_normal((H, W)).astype(np.float32)
grain = gaussian_filter(grain, 0.7) * 0.016

base = low_up * 0.92 + 0.008
img = base + lines + specks_up * 0.9 + dust * 0.8 + grain
img = np.clip(img, 0, 1)

# leve tom grafite (quase neutro, um toque quente) para combinar com o vermelho
rgb = np.stack([img * 1.0, img * 0.985, img * 0.965], axis=-1)
cv2.imwrite(out_path, cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 93])
print(f"saved {out_path} {W}x{H}; mean luminance {img.mean():.3f}")
