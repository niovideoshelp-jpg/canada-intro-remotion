"""Baixa arquivos com User-Agent proprio, novas tentativas e verificacao de tipo.

Uso:
  python fetch.py URL DESTINO            -> baixa um arquivo
  python fetch.py --contact SAIDA.jpg A.jpg B.jpg ...  -> monta folha de contato (grade 2 colunas)
"""
import sys
import time
import urllib.error
import urllib.request

UA = "CanadaIntroVideo/1.0 (Remotion documentary project; contact via project owner)"


def fetch(url: str, dest: str, tries: int = 6) -> None:
    delay = 2.0
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                ctype = r.headers.get("Content-Type", "")
                data = r.read()
            if "text/html" in ctype:
                raise RuntimeError(f"HTML returned ({len(data)} bytes)")
            with open(dest, "wb") as f:
                f.write(data)
            print(f"ok {len(data)} bytes {ctype} -> {dest}")
            return
        except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError, TimeoutError) as e:
            print(f"attempt {attempt + 1} failed: {e}", file=sys.stderr)
            time.sleep(delay)
            delay *= 1.8
    raise SystemExit(f"FAILED: {url}")


def contact(out: str, files: list[str], cell_w: int = 520, cell_h: int = 360) -> None:
    from PIL import Image, ImageDraw

    cols = 2
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell_w, rows * cell_h), (30, 30, 30))
    draw = ImageDraw.Draw(sheet)
    for i, fp in enumerate(files):
        im = Image.open(fp).convert("RGB")
        im.thumbnail((cell_w - 10, cell_h - 30))
        x = (i % cols) * cell_w + 5
        y = (i // cols) * cell_h + 5
        sheet.paste(im, (x, y))
        draw.text((x + 4, y + cell_h - 28), f"[{i + 1}] {fp.split('/')[-1].split(chr(92))[-1][:60]}", fill=(255, 220, 0))
    sheet.save(out, quality=88)
    print(f"contact sheet -> {out}")


if __name__ == "__main__":
    if sys.argv[1] == "--contact":
        contact(sys.argv[2], sys.argv[3:])
    else:
        fetch(sys.argv[1], sys.argv[2])
