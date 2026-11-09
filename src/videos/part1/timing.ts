// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = 192.00;
export const T = makeT(words as Word[]);

export const SCENES = {
  s01: [0, 17.59],
  s02: [17.59, 39.39],
  s03: [39.39, 50.61],
  s04: [50.61, 57.44],
  s05: [57.44, 68.25],
  s06: [68.25, 80.3],
  s07: [80.3, 89.95],
  s08: [89.95, 101.97],
  s09: [101.97, 112.98],
  s10: [112.98, 125.2],
  s11: [125.2, 141.11],
  s12: [141.11, 157.56],
  s13: [157.56, 172.84],
  s14: [172.84, 192],
} as const;
