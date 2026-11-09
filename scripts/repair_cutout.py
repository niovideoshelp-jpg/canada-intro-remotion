"""(Escrito pelo agente verificador; adaptado: mantem todas as partes grandes do recorte.)
Conservative repair for Canva cut-outs whose RGB is blacked out where the alpha still claims coverage.
Usage: python -I repair_cutout.py <project_root> <name> <out_png>
Reads assets-src/canva/<name>_cutout.png and assets-src/photos/<name>.jpg (same size, pixel-aligned; verified shift ~0 px).
Writes only <out_png>; never touches the inputs.
1) alpha -> 0 where Canva kept coverage but painted the pixel near-black although the source there is much brighter
   (background gaps filled with opaque black, plus the darkest 1 px of the edge fringe);
2) erase hand-checked leftover background polygons; 3) restore subject pixels Canva blacked out;
4) drop detached specks; 5) re-hue edge pixels from the nearest interior pixel (kills the magenta cast, keeps
   Canva's edge brightness). Tested on moose/people only; hair edges can look slightly stepped over LIGHT
   backgrounds, fine on the dark grid. Polygons are moose-specific, check at 4x after any change."""
import sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import cv2

root, name, out_png = sys.argv[1], sys.argv[2], sys.argv[3]
ERASE = {
    "moose": [
        [(1044, 1879), (1063, 1879), (1086, 1884), (1101, 1893), (1099, 1903), (1086, 1911), (1071, 1907), (1058, 1898), (1046, 1891)],  # rock fused to near-hind hoof heel
        [(1551, 1700), (1574, 1700), (1574, 1714), (1564, 1721), (1562, 1749), (1551, 1749)],  # gravel sliver at raised-front-hoof junction
        [(1447, 243), (1473, 243), (1473, 263), (1466, 262), (1458, 256), (1452, 253), (1447, 250)],  # gravel sliver in far-antler tip notch
    ],
    "people": [],
}
RESTORE = {"moose": [(2645, 696, 8, 7)], "people": []}  # (cx, cy, rx, ry): snow lump on near-antler lower tine

C = np.asarray(Image.open(os.path.join(root, f"assets-src/canva/{name}_cutout.png")).convert("RGBA")).astype(np.float32)
S = np.asarray(Image.open(os.path.join(root, f"assets-src/photos/{name}.jpg")).convert("RGB")).astype(np.float32)
assert C.shape[:2] == S.shape[:2]
rgb = C[:, :, :3].copy()
a = C[:, :, 3] / 255.0
cl, sl = rgb.mean(2), S.mean(2)
blackfill = (a > 0) & (cl < 35) & (sl > cl + 60)
blackfill = ndimage.binary_dilation(blackfill, iterations=1) & (cl < 60) & (sl > cl + 40)
soft = np.maximum(blackfill.astype(np.float32), cv2.GaussianBlur(blackfill.astype(np.float32), (0, 0), 0.8))
a2 = a * (1.0 - soft)  # soft edge so the choke does not alias
yy, xx = np.ogrid[:a.shape[0], :a.shape[1]]
for cx, cy, rx, ry in RESTORE.get(name, []):
    disk = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0
    a2[disk] = 1.0
    rgb[disk] = S[disk]
m = Image.new("L", (C.shape[1], C.shape[0]), 0)
for poly in ERASE.get(name, []):
    ImageDraw.Draw(m).polygon(poly, fill=255)
m = cv2.GaussianBlur(np.asarray(m).astype(np.float32) / 255.0, (0, 0), 0.7)
a2 = a2 * (1 - m)
lab, n = ndimage.label(a2 > 0.25, structure=np.ones((3, 3)))
if n > 1:
    # mantem TODAS as partes relevantes (icebergs em pedacos, 3 soldados...), descarta so os ciscos
    sizes = ndimage.sum(np.ones_like(a2), lab, index=np.arange(1, n + 1))
    small = np.flatnonzero(sizes < max(400, 0.02 * sizes.max())) + 1
    a2[np.isin(lab, small)] = 0
a2[(a2 > 0) & (a2 < 8 / 255) & ~ndimage.binary_dilation(a2 > 0.25, iterations=2)] = 0
# 5) remove the magenta cast of Canva's edge pixels (their G channel is crushed): keep Canva's edge brightness,
#    take the hue from the nearest solid interior pixel (>= 2 px inside)
solid = ndimage.binary_erosion(a2 > 0.999, iterations=2)
idx = ndimage.distance_transform_edt(~solid, return_distances=False, return_indices=True)
edge = (a2 > 0) & ~solid
ref = rgb[idx[0], idx[1]]
gain = np.clip(rgb.mean(2) / np.maximum(ref.mean(2), 1), 0, 1.15)[..., None]
rgb[edge] = (ref * gain)[edge]
Image.fromarray(np.dstack([rgb, a2 * 255]).clip(0, 255).astype(np.uint8), "RGBA").save(out_png)
print("wrote", out_png, "| alpha>0 px:", int((a2 > 0).sum()), "orig", int((a > 0).sum()), "| blackfill px cleared:", int(blackfill.sum()))
