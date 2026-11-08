"""Prepara as imagens (recortes do Canva e placas de parallax) com UM tratamento consistente.

Comandos:
  sticker IN.png OUT.png [--long 1300] [--border 10] [--sat 0.72]
      recorte -> corta a transparencia, reduz, trata a cor, borda branca de "adesivo" + sombra
  layer   IN.png OUT.png [--width 2400] [--sat 0.72]
      camada de parallax com alfa (sem borda), so tratamento de cor e tamanho
  plate   IN.jpg OUT.jpg [--width 2400] [--sat 0.72]
      placa de fundo (sem alfa)

Tratamento de cor: dessatura levemente, contraste suave, sombras um pouco mais frias — as fotos
convivem com o fundo grafite e o vermelho continua sendo a unica cor que "grita".
"""
import argparse

import cv2
import numpy as np


def grade(rgb: np.ndarray, sat: float, contrast: float = 1.08) -> np.ndarray:
    x = rgb.astype(np.float32) / 255.0
    lum = (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2])[..., None]
    x = lum + (x - lum) * sat
    x = (x - 0.5) * contrast + 0.5
    # sombras levemente frias, luzes levemente quentes (bem sutil)
    shadow = np.clip(1 - lum * 2, 0, 1)
    x[..., 2] += 0.018 * shadow[..., 0]
    x[..., 0] += 0.012 * np.clip(lum[..., 0] * 2 - 1, 0, 1)
    return (np.clip(x, 0, 1) * 255).astype(np.uint8)


def read_rgba(path: str) -> np.ndarray:
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise SystemExit(f"cannot read {path}")
    if im.shape[2] == 3:
        im = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA)
    return cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA)


def write_rgba(path: str, rgba: np.ndarray) -> None:
    cv2.imwrite(path, cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 6])


def trim(rgba: np.ndarray, thr: int = 8) -> np.ndarray:
    ys, xs = np.where(rgba[..., 3] > thr)
    if len(xs) == 0:
        raise SystemExit("empty alpha")
    return rgba[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def resize_long(img: np.ndarray, long: int) -> np.ndarray:
    h, w = img.shape[:2]
    k = long / max(h, w)
    if k >= 1:
        return img
    return cv2.resize(img, (int(round(w * k)), int(round(h * k))), interpolation=cv2.INTER_AREA)


def resize_width(img: np.ndarray, width: int) -> np.ndarray:
    h, w = img.shape[:2]
    return cv2.resize(img, (width, int(round(h * width / w))), interpolation=cv2.INTER_AREA if width < w else cv2.INTER_CUBIC)


def clean_alpha(a: np.ndarray) -> np.ndarray:
    """Remove franja/halo: aperta 1px a borda e suaviza."""
    a = cv2.erode(a, np.ones((3, 3), np.uint8), iterations=1)
    a = cv2.GaussianBlur(a, (0, 0), 0.7)
    return a


def sticker(args) -> None:
    rgba = trim(read_rgba(args.inp))
    rgba = resize_long(rgba, args.long)
    rgb = grade(rgba[..., :3], args.sat)
    a = clean_alpha(rgba[..., 3])

    pad = args.border + 40
    h, w = a.shape
    H, W = h + 2 * pad, w + 2 * pad
    A = np.zeros((H, W), np.uint8)
    A[pad : pad + h, pad : pad + w] = a
    RGB = np.zeros((H, W, 3), np.uint8)
    RGB[pad : pad + h, pad : pad + w] = rgb

    # borda branca: dilata o alfa (bordas arredondadas) e suaviza
    k = 2 * args.border + 1
    border = cv2.dilate((A > 110).astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    border = cv2.GaussianBlur(border, (0, 0), 1.1)
    # papel levemente quente (nao branco puro)
    paper = np.array([241, 236, 226], np.float32)

    # sombra de contato (curta, suave)
    shadow = cv2.GaussianBlur(border.astype(np.float32), (0, 0), 14) / 255.0
    M = np.float32([[1, 0, 7], [0, 1, 12]])
    shadow = cv2.warpAffine(shadow, M, (W, H)) * 0.55

    a_f = A.astype(np.float32)[..., None] / 255.0
    b_f = border.astype(np.float32)[..., None] / 255.0
    out_rgb = paper[None, None, :] * (1 - a_f) + RGB.astype(np.float32) * a_f
    out_a = np.maximum(b_f[..., 0], a_f[..., 0])
    # compoe sombra por baixo (preto)
    total_a = out_a + shadow * (1 - out_a)
    out_rgb = np.where(total_a[..., None] > 1e-4, out_rgb * out_a[..., None] / np.maximum(total_a[..., None], 1e-4), 0)
    rgba_out = np.dstack([np.clip(out_rgb, 0, 255).astype(np.uint8), (np.clip(total_a, 0, 1) * 255).astype(np.uint8)])
    rgba_out = trim(rgba_out, 2)
    write_rgba(args.out, rgba_out)
    print(f"sticker -> {args.out} {rgba_out.shape[1]}x{rgba_out.shape[0]}")


def layer(args) -> None:
    rgba = read_rgba(args.inp)
    rgba = resize_width(rgba, args.width)
    rgb = grade(rgba[..., :3], args.sat)
    a = clean_alpha(rgba[..., 3])
    write_rgba(args.out, np.dstack([rgb, a]))
    print(f"layer -> {args.out} {rgba.shape[1]}x{rgba.shape[0]}")


def plate(args) -> None:
    im = cv2.imread(args.inp, cv2.IMREAD_COLOR)
    rgb = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    rgb = resize_width(rgb, args.width)
    rgb = grade(rgb, args.sat, 1.04)
    cv2.imwrite(args.out, cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(f"plate -> {args.out} {rgb.shape[1]}x{rgb.shape[0]}")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["sticker", "layer", "plate"])
    p.add_argument("inp")
    p.add_argument("out")
    p.add_argument("--long", type=int, default=1300)
    p.add_argument("--width", type=int, default=2400)
    p.add_argument("--border", type=int, default=10)
    p.add_argument("--sat", type=float, default=0.72)
    a = p.parse_args()
    {"sticker": sticker, "layer": layer, "plate": plate}[a.cmd](a)
