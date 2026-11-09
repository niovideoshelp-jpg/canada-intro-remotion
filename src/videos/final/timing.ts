// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = 105.00;
export const T = makeT(words as Word[]);

export const SCENES = {
  s01: [0, 6.83],
  s02: [6.83, 15.52],
  s03: [15.52, 23.42],
  s04: [23.42, 36.78],
  s05: [36.78, 46.25],
  s06: [46.25, 59.48],
  s07: [59.48, 66.86],
  s08: [66.86, 73.86],
  s09: [73.86, 89.47],
  s10: [89.47, 96.08],
  s11: [96.08, 105],
} as const;
