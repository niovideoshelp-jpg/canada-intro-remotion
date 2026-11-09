#!/usr/bin/env bash
# Converte os recortes exportados do Canva (assets-src/canva) nos arquivos usados pelo video (public/img).
# Uso: PY=caminho/do/python bash scripts/prep_all.sh
set -e
cd "$(dirname "$0")/.."
PY="${PY:-python}"
C=assets-src/canva
O=public/img
# recorte mais reparado primeiro: final (correcoes pontuais, scripts/fix_cutouts.py) > fixed (reparo generico,
# scripts/repair_cutout.py: buracos pretos e borda magenta do export) > export cru do Canva
pick() { for d in "$C/final" "$C/fixed" "$C"; do [ -f "$d/$1_cutout.png" ] && { echo "$d/$1_cutout.png"; return; }; done; }
sticker() { src="$(pick "$1")"; [ -n "$src" ] && "$PY" -I scripts/prep_images.py sticker "$src" "$O/$1.png" --long "$2" --border "${3:-10}" --sat "${4:-0.72}" || echo "skip $1 (sem recorte)"; }
sticker polar-bear 1100 9
sticker moose 1100 9
sticker people 1000 9 0.55
sticker cf18 1300 10
sticker dewolf 1500 11
sticker soldiers 1100 10
# camadas de parallax: o recorte do Canva vira a camada proxima; a placa distante e refeita com
# preenchimento espelhado (scripts/fill_rows.py), que nao deixa "fantasma" quando as camadas se movem
for k in arctic wild; do
  sat=0.72; [ "$k" = wild ] && sat=0.6
  lay="$(pick "$k-fg")"
  if [ -n "$lay" ] && [ -f assets-src/photos/$k.jpg ]; then
    # o buraco da placa sai do MESMO alfa da camada proxima: o que o reparo tirou da camada continua original
    "$PY" -I scripts/fill_rows.py assets-src/photos/$k.jpg "$lay" assets-src/canva/$k-bg_rows.jpg 2400 16
    # Artico: o contorno do morro continua por tras do pico do iceberg (sem a "fumaca" do espelhamento)
    if [ "$k" = arctic ]; then "$PY" -I scripts/fix_plate.py assets-src/canva/$k-bg_rows.jpg "$lay"; fi
    "$PY" -I scripts/prep_images.py layer "$lay" "$O/$k-fg.png" --width 2400 --sat $sat
    "$PY" -I scripts/prep_images.py plate assets-src/canva/$k-bg_rows.jpg "$O/$k-bg.jpg" --width 2400 --sat $sat
  else
    echo "skip $k (sem camadas)"
  fi
done
