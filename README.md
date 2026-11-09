# Canada — Intro (NIO500)

Documentário animado estilo Vox, editado em **Remotion** e renderizado **na nuvem (GitHub Actions)**.
Narração: `public/audio/intro.mp3` (56 s). Vídeo final: 1920×1080, 30 fps, 57,5 s.

## Como funciona

| Etapa | Ferramenta |
|---|---|
| Animação, câmera, mapas, tipografia | Remotion 4 + React |
| Traços que se desenham, pops, máscaras | GSAP + DrawSVG via `@remotion/gsap` (timeline presa ao frame) |
| Fontes | Google Fonts (`@remotion/google-fonts`): **Anton** e **Playfair Display** |
| Recortes e camadas de parallax | Canva (remoção de fundo + separação em camadas) → reparo local → `scripts/prep_all.sh` |
| Efeitos sonoros | Freesound (somente CC0) |
| Mapas | Natural Earth 1:50m (domínio público), projetados com d3-geo |
| Tela curva + aberração cromática | ffmpeg (`scripts/crt-post.mjs`), sem moldura de TV |

## Renderizar na nuvem

- **Automático:** todo `git push` na branch `main` que altere o vídeo dispara o render.
- **Manual:** GitHub → *Actions* → *Render video* → *Run workflow* (campo opcional `frames`, ex. `0-300`, para um teste rápido).
- O MP4 fica em *Actions* → execução → **Artifacts** → `canada-intro`.

## Editar localmente

```bash
npm install
npm run studio        # pré-visualização no navegador
npm run typecheck
node scripts/stills.mjs teste 0.5 30 300 900   # renderiza quadros soltos em out/stills
```

- Tempos da narração (palavra por palavra): `src/timing.ts`
- Cenas: `src/scenes/S01…S11`
- Efeitos sonoros e volumes: `src/sfx.ts`
- Curvatura da tela: variáveis `CRT_K1` (padrão 0.045) e `CRT_CA` (padrão 0.004) no `scripts/crt-post.mjs`

## Imagens (recortes do Canva → `public/img`)

`assets-src/` (fora do git) guarda as fotos originais e os exports do Canva. Para refazer `public/img`:

```bash
py -3 -I scripts/fix_cutouts.py                 # correções pontuais nos recortes (numpy + opencv)
PY=python bash scripts/prep_all.sh              # adesivos, camadas de parallax e placas de fundo
node scripts/credits.mjs                        # atualiza CREDITS.md
```

Ordem dos recortes: `canva/final` (correções pontuais) > `canva/fixed` (reparo genérico, `scripts/repair_cutout.py`) > export cru.
**Atenção:** o "separate-image-layers" do Canva redesenha letras e números da foto (o "Canada" do CF-18 virou "CAFE"
e a bandeira do leme sumiu). Use dele só o alfa e mantenha as cores da foto original.

## Sem tremedeira

- Nada usa `Math.random()`, molas que oscilam, grão animado ou "camera shake".
- O Chrome encaixa texto em pixel inteiro na vertical quando ele se move devagar (medido: y pulava 939→938→937).
  Todo elemento que se move usa transform 2D + uma micro-rotação de **0,03°** (invisível), o que força desenho
  subpixel nos dois eixos. Verificado com `scripts/track.py` (rastreamento subpixel quadro a quadro).
- Sem `translate3d`/`will-change` (e GSAP com `force3D: false`): camadas promovidas congelam a escala de raster e a
  nitidez variava entre os quadros renderizados em abas diferentes.
- A curvatura é um mapa fixo com interpolação bilinear — não "dança".

## Créditos

Veja [CREDITS.md](CREDITS.md).
