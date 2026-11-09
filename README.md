# Canada — Intro, Parte 1, Parte 2 e Final (NIO500)

Documentário animado estilo Vox, editado em **Remotion** e renderizado **na nuvem (GitHub Actions)**.
Todos em 1920×1080, 30 fps:

| Vídeo | Composição | Narração | Duração |
|---|---|---|---|
| Intro | `CanadaIntro` | `public/audio/intro.mp3` | 57,5 s |
| Parte 1 | `CanadaPart1` | `public/audio/part1.mp3` | 3:12 |
| Parte 2 | `CanadaPart2` | `public/audio/part2.mp3` | 6:30 |
| Final | `CanadaFinal` | `public/audio/final.mp3` | 1:45 |

Roteiro visual cena a cena: `docs/storyboard-part1.md`, `docs/storyboard-part2.md`, `docs/storyboard-final.md`
(regras gerais em `docs/bible.md`, como montar uma cena em `docs/scenes-howto.md`).

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

- **Automático:** todo `git push` na branch `main` que altere os vídeos dispara o render dos quatro, em paralelo.
- **Manual:** GitHub → *Actions* → *Render video* → *Run workflow* → escolha o vídeo (`todos`, `intro`, `part1`,
  `part2`, `final`); o campo opcional `frames` (ex. `0-300`) faz um teste rápido.
- Cada MP4 fica em *Actions* → execução → **Artifacts** → `canada-intro`, `canada-part1`, `canada-part2`, `canada-final`.

## Editar localmente

```bash
npm install
npm run studio        # pré-visualização no navegador
npm run typecheck
node scripts/stills.mjs teste 0.5 30 300 900   # renderiza quadros soltos da Intro em out/stills
COMP=CanadaPart1 node scripts/stills.mjs p1 0.5 300 900   # idem para outro vídeo
```

- Intro: tempos em `src/timing.ts`, cenas em `src/scenes/S01…S11`, efeitos em `src/sfx.ts`
- Partes 1, 2 e Final: `src/videos/<video>/` — `timing.ts` (cortes + `T('palavra')` com o tempo de cada
  palavra da narração), `scenes/` (uma cena por arquivo, cada uma com seus efeitos sonoros) e `Main.tsx`
- Componentes compartilhados das partes novas: `src/components/kit/`; dados de mapa: `src/data/maps2.ts`
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
