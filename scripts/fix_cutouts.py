"""Correcoes pontuais nos recortes do Canva, aplicadas DEPOIS do reparo generico (scripts/repair_cutout.py).

Cada correcao responde a um achado concreto dos agentes verificadores (relatorios em assets-src/tmp-verify-*):
  cf18       O "separate-image-layers" do Canva re-digitou as marcas do caca ('Canada' virou 'CAFE', o '930'
             foi redesenhado) e apagou a bandeira e o serial do leme: o RGB da foto volta nessas tres areas
             (o alfa do Canva fica). Sai tambem a lasca de ceu opaca entre a fuselagem e o tanque.
  dewolf     O ceu cinza ficou opaco entre mastros e antenas (uma "teia" cheia de furos que a borda branca do
             adesivo contornava): o alfa e refeito nessas zonas por chave de diferenca contra o ceu ajustado
             (polinomio cubico 2D por canal). A baia do bote fica fechada (o ceu visto atraves do casco vira
             parte da foto, sem furos contornados de branco) e saem os restos escuros do rebocador na proa.
  soldiers   Neve azulada presa sob a bota direita (passava da ponta da bota). Foto escura e fria demais para
             combinar com os outros adesivos: exposicao e balanco de branco pelo macacao de camuflagem.
  arctic-fg  Dois pontinhos pretos viraram furos na emenda entre o iceberg e o bloco da frente: alfa do Canva e
             cor da foto nessa caixa. Contorno escuro/rosado do export: a cor da borda vem do gelo interno.
  wild-fg    Tocos escuros de tronco presos na crista direita.

Entrada: assets-src/canva/fixed/<nome>_cutout.png (reparo generico; o export cru se nao houver),
         assets-src/canva/<nome>_cutout.png (export cru do Canva, para o alfa original) e
         assets-src/photos/<foto>.jpg (mesmo tamanho, alinhada ao pixel com o recorte).
Saida:   assets-src/canva/final/<nome>_cutout.png  (scripts/prep_all.sh usa final > fixed > cru)
Uso:     python -I scripts/fix_cutouts.py [nome ...]
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, "..", "assets-src"))
PHOTO = {"arctic-fg": "arctic", "wild-fg": "wild"}
LUMA = np.float32([0.2126, 0.7152, 0.0722])
SQ3 = np.ones((3, 3), np.uint8)


# --- morfologia so com OpenCV (mesmas dependencias do prep_images.py: numpy + opencv) ---
def erode(mask, it):
    return cv2.erode(mask.astype(np.uint8), SQ3, iterations=it).astype(bool)


def dilate(mask, it):
    return cv2.dilate(mask.astype(np.uint8), SQ3, iterations=it).astype(bool)


def components(mask):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    return n, lab, stats[:, cv2.CC_STAT_AREA]


def fill_holes(mask):
    """Fecha os buracos (fundo que nao alcanca a borda da imagem)."""
    inv = np.pad((~mask).astype(np.uint8), 1, constant_values=1)
    cv2.floodFill(inv, np.zeros((inv.shape[0] + 2, inv.shape[1] + 2), np.uint8), (0, 0), 2)
    return mask | (inv[1:-1, 1:-1] == 1)


def nearest_inside(core):
    """(y, x) do pixel de `core` mais proximo, para cada pixel da imagem."""
    _, labels = cv2.distanceTransformWithLabels((~core).astype(np.uint8), cv2.DIST_L2, 5,
                                                labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(core)
    ly = np.zeros(labels.max() + 1, np.int64)
    lx = np.zeros(labels.max() + 1, np.int64)
    ly[labels[ys, xs]] = ys
    lx[labels[ys, xs]] = xs
    return ly[labels], lx[labels]


def read_rgba(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise SystemExit(f"cannot read {path}")
    return cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA).astype(np.float32)


def load(name):
    raw_p = os.path.join(ASSETS, "canva", f"{name}_cutout.png")
    fix_p = os.path.join(ASSETS, "canva", "fixed", f"{name}_cutout.png")
    cur = read_rgba(fix_p if os.path.exists(fix_p) else raw_p)
    raw = read_rgba(raw_p)
    src = cv2.imread(os.path.join(ASSETS, "photos", f"{PHOTO.get(name, name)}.jpg"), cv2.IMREAD_COLOR)
    src = cv2.cvtColor(src, cv2.COLOR_BGR2RGB).astype(np.float32)
    assert cur.shape[:2] == raw.shape[:2] == src.shape[:2], f"{name}: tamanhos diferentes"
    return cur[..., :3], cur[..., 3] / 255.0, raw[..., 3] / 255.0, src


def boxes(shape, rects, pad=0):
    m = np.zeros(shape, bool)
    for x0, y0, x1, y1 in rects:
        m[max(0, y0 - pad) : y1 + pad, max(0, x0 - pad) : x1 + pad] = True
    return m


def feather(mask, sigma):
    return np.clip(cv2.GaussianBlur(mask.astype(np.float32), (0, 0), sigma), 0, 1)


def erase(a, mask, sigma=0.8):
    """alfa -> 0 dentro da mascara, com borda suave (sem serrilhado)."""
    return a * (1 - np.maximum(mask.astype(np.float32), feather(mask, sigma)))


def touching_outside(cand, a):
    """So os componentes de `cand` que encostam no fundo transparente (o que esta cercado pelo objeto fica)."""
    n, lab, _ = components(cand)
    if n <= 1:
        return cand
    hit = np.zeros(n, bool)
    hit[np.unique(lab[dilate(a < 0.1, 2) & cand])] = True
    hit[0] = False
    return hit[lab]


def drop_specks(a, frac=0.02, floor=400):
    n, lab, area = components(a > 0.25)
    if n <= 2:
        return a
    small = np.flatnonzero(area[1:] < max(floor, frac * area[1:].max())) + 1
    a = a.copy()
    a[np.isin(lab, small)] = 0
    return a


def fix_cf18(rgb, a, raw_a, src):
    # 1) marcas originais: bandeira + '188930' no leme, 'Canada' na fuselagem, '930' no nariz
    marks = boxes(a.shape, [(815, 435, 925, 550), (1620, 445, 1775, 505), (2555, 465, 2675, 535)])
    marks &= erode(a > 0.999, 3)
    w = (feather(marks, 1.5) * (a > 0.999))[..., None]
    rgb = rgb * (1 - w) + src * w
    # 2) lasca de ceu opaca entre a fuselagem e o tanque, a esquerda do pilone
    clear = boxes(a.shape, [(1850, 600, 2250, 950)]) & erode(raw_a < 0.01, 4)
    assert clear.sum() > 1000, "cf18: sem ceu de referencia"
    sky = np.median(src[clear], axis=0)
    dist = np.linalg.norm(src - sky, axis=-1)
    zone = boxes(a.shape, [(2003, 737, 2067, 747)], pad=3)
    a = np.where(zone, np.minimum(a, np.clip((dist - 12) / 14, 0, 1)), a)
    print(f"  cf18: marcas restauradas em {int(marks.sum())} px; ceu ref {np.round(sky).astype(int)}")
    return rgb, a


def fix_dewolf(rgb, a, raw_a, src):
    H, W = a.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # 1) ceu ajustado: pixels transparentes longe do navio, acima da linha da costa
    samp = erode(raw_a < 0.01, 8) & (yy < 1300)
    idx = np.flatnonzero(samp.ravel())[::7]
    xn, yn = xx / W, yy / H

    def terms(X, Y):
        return [np.ones_like(X), X, Y, X * X, X * Y, Y * Y, X**3, Y**3, X * X * Y, X * Y * Y]

    A = np.stack(terms(xn.ravel()[idx], yn.ravel()[idx]), 1)
    B = np.stack(terms(xn, yn), -1)
    sky = np.zeros_like(src)
    for k in range(3):
        coef, *_ = np.linalg.lstsq(A, src[..., k].ravel()[idx], rcond=None)
        sky[..., k] = B @ coef
    del B
    resid = (src - sky)[samp].std(0)
    dist = np.sqrt(((src - sky) ** 2).sum(-1))
    key = np.clip((dist - 7.0) / 11.0, 0, 1)
    # 2) zonas da "teia": mastros/antenas, guarda-corpo do turco do bote, guarda-corpo do guindaste de popa
    zone = boxes((H, W), [(950, 0, 2250, 760), (2230, 780, 2440, 960), (2880, 1180, 3100, 1320)])
    solid = np.where(zone, key, a) > 0.5
    n, lab, area = components(solid)
    ship = dilate(lab == (1 + np.argmax(area[1:])), 2)
    keyed = key * ship
    # A chave so ACRESCENTA o que o Canva perdeu (antenas, hastes) e so TIRA o opaco cor-de-ceu que encosta
    # em transparencia: a teia e ceu cheio de furos, colado no ceu. Tinta cinza-clara cercada pela estrutura
    # (topo de plataforma iluminado, mesma cor do ceu) continua inteira.
    cand = zone & (a > 0.5) & (keyed < 0.5)
    web = touching_outside(cand, a)
    a = np.where(zone & ((a <= 0.5) | web), keyed, a)
    # ruido da chave: furinhos fechados (< 60 px) viram foto, nao papel branco do adesivo
    body = a > 0.5
    n, lab, area = components(fill_holes(body) & ~body)
    tiny = zone & np.isin(lab, np.flatnonzero(area[1:] < 60) + 1)
    a = np.where(tiny, 1.0, a)
    rgb = np.where(zone[..., None], src, rgb)
    # 3) baia do bote salva-vidas: os vaos (ceu visto atraves do casco) viram parte da foto
    bay = boxes((H, W), [(2140, 965, 2372, 1108)])
    body = a > 0.5
    holes = fill_holes(body) & ~body & bay
    fillm = dilate(holes, 2) & bay
    a = np.where(fillm, 1.0, a)
    rgb = np.where(fillm[..., None], src, rgb)
    # 4) restos escuros do rebocador colados na roda de proa. O casco ali esta na sombra (luma ~96-110) e o ceu
    #    atras e mais claro (~146): so sai o que e bem escuro (< 88) E encosta no fundo transparente.
    L = src @ LUMA
    bow = touching_outside(boxes((H, W), [(222, 1350, 265, 1400)]) & (L < 88) & (a > 0), a)
    a = erase(a, bow, 0.8)
    print(f"  dewolf: residuo do ceu (dp por canal) {np.round(resid, 2)}; teia removida {int(web.sum())} px;"
          f" furinhos fechados {int(tiny.sum())} px; furos da baia fechados {int(holes.sum())} px; proa {int(bow.sum())} px")
    return rgb, a


def fix_soldiers(rgb, a, raw_a, src):
    L = src @ LUMA
    # 1) neve azulada sob o calcanhar e alem da ponta da bota direita (so a neve clara ligada ao fundo:
    #    os pontinhos de neve presos na sola, cercados pela bota, ficam)
    under = np.zeros(a.shape, np.uint8)
    cv2.fillPoly(under, [np.int32([(1452, 1626), (1582, 1633), (1582, 1664), (1452, 1664)])], 1)
    cv2.rectangle(under, (1690, 1568), (1765, 1665), 1, -1)
    snow = touching_outside(under.astype(bool) & (L > 100) & (a > 0), a)
    a = drop_specks(erase(a, snow, 0.8))
    # 2) exposicao + balanco de branco pelas partes claras do macacao (fica abaixo do papel do adesivo,
    #    senao o contorno some na borda branca)
    body = erode(a > 0.99, 3)
    lum = rgb @ LUMA
    hi = body & (lum >= np.percentile(lum[body], 70))
    ref = rgb[hi].mean(0)
    tint = np.float32([1.0, 0.985, 0.95])
    target = 186.0 * tint / float(tint @ LUMA)
    gain = target / ref
    x = rgb * gain
    x = np.where(x > 215, 215 + (x - 215) * 0.45, x)
    print(f"  soldiers: neve removida {int(snow.sum())} px; macacao {np.round(ref).astype(int)} -> ganho {np.round(gain, 3)}")
    return x, a


def fix_arctic_fg(rgb, a, raw_a, src):
    # 1) emenda iceberg/bloco da frente: alfa do Canva (sem os furinhos do reparo) + cor da foto
    seam = boxes(a.shape, [(1585, 1110, 1645, 1150)]) & (raw_a > 0.999)
    a = np.where(seam, 1.0, a)
    rgb = np.where(seam[..., None], src, rgb)
    # 2) aperta 1 px e tira o contorno escuro/rosado: borda com a cor do gelo >= 4 px para dentro
    a = cv2.erode(a.astype(np.float32), SQ3)
    core = erode(a > 0.98, 4)
    iy, ix = nearest_inside(core)
    edge = (a > 0) & (a < 0.98)
    rgb = np.where(edge[..., None], rgb[iy, ix], rgb)
    print(f"  arctic-fg: emenda {int(seam.sum())} px; borda recolorida {int(edge.sum())} px")
    return rgb, a


def fix_wild_fg(rgb, a, raw_a, src):
    L = src @ LUMA
    stubs = boxes(a.shape, [(2280, 1755, 2303, 1772), (2383, 1782, 2397, 1794), (2470, 1822, 2487, 1835),
                            (2630, 1882, 2650, 1905)], pad=3) & (L < 105)
    a = erase(a, stubs, 0.8)
    print(f"  wild-fg: tocos removidos {int(stubs.sum())} px")
    return rgb, a


FIXES = {"cf18": fix_cf18, "dewolf": fix_dewolf, "soldiers": fix_soldiers, "arctic-fg": fix_arctic_fg,
         "wild-fg": fix_wild_fg}


def main():
    names = sys.argv[1:] or list(FIXES)
    out_dir = os.path.join(ASSETS, "canva", "final")
    os.makedirs(out_dir, exist_ok=True)
    for name in names:
        rgb, a, raw_a, src = load(name)
        rgb, a = FIXES[name](rgb, a, raw_a, src)
        out = np.dstack([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)]).round().astype(np.uint8)
        path = os.path.join(out_dir, f"{name}_cutout.png")
        cv2.imwrite(path, cv2.cvtColor(out, cv2.COLOR_RGBA2BGRA), [cv2.IMWRITE_PNG_COMPRESSION, 6])
        print(f"{name} -> {path}")


if __name__ == "__main__":
    main()
