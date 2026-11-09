// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = 390.50;
export const T = makeT(words as Word[]);

export const SCENES = {
  s01: [0, 13.35],
  s02: [13.35, 19.9],
  s03: [19.9, 33.08],
  s04: [33.08, 47.67],
  s05: [47.67, 66.88],
  s06: [66.88, 79.69],
  s07: [79.69, 96.72],
  s08: [96.72, 107.56],
  s09: [107.56, 124.42],
  s10: [124.42, 137.99],
  s11: [137.99, 151.64],
  s12: [151.64, 165.86],
  s13: [165.86, 182.13],
  s14: [182.13, 203.15],
  s15: [203.15, 221.61],
  s16: [221.61, 238.93],
  s17: [238.93, 247.27],
  s18: [247.27, 270.2],
  s19: [270.2, 282.09],
  s20: [282.09, 302.8],
  s21: [302.8, 317.83],
  s22: [317.83, 337.86],
  s23: [337.86, 352.12],
  s24: [352.12, 378.32],
  s25: [378.32, 390.5],
} as const;
