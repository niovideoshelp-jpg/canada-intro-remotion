// Tempo do filme, igual em todos os videos: segundos -> frames e a cortina de transicao entre cenas.
import {FPS} from '../theme';

export const sec = (s: number) => Math.round(s * FPS);

/** Meia-duracao da transicao (cortina com borda vermelha), em frames. */
export const WIPE_HALF = 7;

/** Inicio (s) de cada cena depois da primeira: onde ha cortina com borda vermelha. */
export const cutsOf = (scenes: Record<string, readonly [number, number]>) =>
  Object.values(scenes)
    .slice(1)
    .map(([s]) => s);
