#!/usr/bin/env bash
# Converte os recortes exportados do Canva (assets-src/canva) nos arquivos usados pelo video (public/img).
# Uso: PY=caminho/do/python bash scripts/prep_all.sh
set -e
cd "$(dirname "$0")/.."
PY="${PY:-python}"
C=assets-src/canva
O=public/img
sticker() { [ -f "$C/$1_cutout.png" ] && "$PY" -I scripts/prep_images.py sticker "$C/$1_cutout.png" "$O/$1.png" --long "$2" --border "${3:-10}" --sat "${4:-0.72}" || echo "skip $1 (sem recorte)"; }
sticker polar-bear 1100 9
sticker moose 1100 9
sticker people 1000 9 0.55
sticker cf18 1300 10
sticker dewolf 1500 11
sticker soldiers 1100 10
for k in arctic wild; do
  if [ -f "$C/$k-fg_cutout.png" ] && [ -f "$C/$k-bg_plate.jpg" ]; then
    "$PY" -I scripts/prep_images.py layer "$C/$k-fg_cutout.png" "$O/$k-fg.png" --width 2400
    "$PY" -I scripts/prep_images.py plate "$C/$k-bg_plate.jpg" "$O/$k-bg.jpg" --width 2400
  else
    echo "skip $k (sem camadas)"
  fi
done
