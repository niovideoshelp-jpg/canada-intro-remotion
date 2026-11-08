"""Busca imagens no Wikimedia Commons com licenca livre e mostra candidatos.

Uso: python commons_search.py "termo de busca" [limite]
Imprime: titulo, licenca, resolucao, autor e URL original/miniatura.
"""
import json
import re
import sys
import urllib.parse
import urllib.request

UA = "CanadaIntroVideo/1.0 (Remotion documentary project; local research script)"
API = "https://commons.wikimedia.org/w/api.php"
FREE = re.compile(r"(public domain|^pd|cc0|cc[- ]by(?![- ]?nc)(?![- ]?nd))", re.I)


def search(term: str, limit: int = 20):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": f"{term} filetype:bitmap",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiextmetadatafilter": "LicenseShortName|Artist|Credit|UsageTerms",
        "iiurlwidth": "960",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    pages = (data.get("query") or {}).get("pages") or {}
    out = []
    for p in sorted(pages.values(), key=lambda x: x.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        meta = ii.get("extmetadata") or {}
        lic = (meta.get("LicenseShortName") or {}).get("value", "?")
        artist = re.sub(r"<[^>]+>", "", (meta.get("Artist") or {}).get("value", "?")).strip()
        out.append(
            {
                "title": p.get("title"),
                "license": lic,
                "free": bool(FREE.search(lic)),
                "w": ii.get("width"),
                "h": ii.get("height"),
                "mime": ii.get("mime"),
                "artist": artist[:80],
                "url": ii.get("url"),
                "thumb": ii.get("thumburl"),
                "page": ii.get("descriptionurl"),
            }
        )
    return out


if __name__ == "__main__":
    term = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    for c in search(term, limit):
        flag = "FREE" if c["free"] else "----"
        print(f"{flag} {c['w']}x{c['h']} [{c['license']}] {c['title']} | {c['artist']}\n     {c['url']}")
