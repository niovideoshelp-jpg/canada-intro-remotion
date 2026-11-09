// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = 105.00;
export const T = makeT(words as Word[]);

export const SCENES = {
  s01: [0, 23.42],
  s02: [23.42, 36.78],
  s03: [36.78, 46.25],
  s04: [46.25, 59.48],
  s05: [59.48, 66.86],
  s06: [66.86, 81.87],
  s07: [81.87, 89.47],
  s08: [89.47, 96.08],
  s09: [96.08, 105],
} as const;

/** Tempos de palavra SO dentro da cena (palavras comuns se repetem na narracao): const T = TS('s05'). */
export const TS = (k: keyof typeof SCENES) => T.within(SCENES[k]);
