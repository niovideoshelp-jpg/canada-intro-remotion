// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = 192.00;
export const T = makeT(words as Word[]);

export const SCENES = {
  s01: [0, 39.39],
  s02: [39.39, 50.61],
  s03: [50.61, 57.44],
  s04: [57.44, 68.25],
  s05: [68.25, 80.3],
  s06: [80.3, 89.95],
  s07: [89.95, 101.97],
  s08: [101.97, 112.98],
  s09: [112.98, 125.2],
  s10: [125.2, 141.11],
  s11: [141.11, 157.56],
  s12: [157.56, 172.84],
  s13: [172.84, 192],
} as const;

/** Tempos de palavra SO dentro da cena (palavras comuns se repetem na narracao): const T = TS('s05'). */
export const TS = (k: keyof typeof SCENES) => T.within(SCENES[k]);
