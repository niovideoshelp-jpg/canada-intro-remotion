"""Rastreia um elemento (template do 1o quadro) com precisao subpixel e mede a suavidade.
Uso: python track.py "glob" x0 y0 x1 y1  [margem=180]"""
import glob, sys
import cv2, numpy as np
files = sorted(glob.glob(sys.argv[1])); x0, y0, x1, y1 = map(int, sys.argv[2:6]); m = int(sys.argv[6]) if len(sys.argv) > 6 else 180
f0 = cv2.imread(files[0], cv2.IMREAD_GRAYSCALE).astype(np.float32); tpl = f0[y0:y1, x0:x1]
def sub(r):
    _, _, _, (x, y) = cv2.minMaxLoc(r)
    p = lambda a, b, c: 0 if (a - 2*b + c) == 0 else 0.5*(a - c)/(a - 2*b + c)
    return x + (p(r[y, x-1], r[y, x], r[y, x+1]) if 0 < x < r.shape[1]-1 else 0), y + (p(r[y-1, x], r[y, x], r[y+1, x]) if 0 < y < r.shape[0]-1 else 0)
pos = []
for f in files:
    im = cv2.imread(f, cv2.IMREAD_GRAYSCALE).astype(np.float32)
    sx0, sy0 = max(0, x0 - m), max(0, y0 - m)
    r = cv2.matchTemplate(im[sy0:min(im.shape[0], y1 + m), sx0:min(im.shape[1], x1 + m)], tpl, cv2.TM_CCOEFF_NORMED)
    x, y = sub(r); pos.append((x + sx0, y + sy0))
pos = np.array(pos); d1 = np.diff(pos, axis=0); d2 = np.diff(pos, n=2, axis=0)
print('dy:', ' '.join('%+.2f' % v for v in d1[:, 1])); print('dx:', ' '.join('%+.2f' % v for v in d1[:, 0]))
print('max|d2| x=%.3f y=%.3f px  (suave < ~0.3)' % (np.abs(d2[:, 0]).max(), np.abs(d2[:, 1]).max()))
