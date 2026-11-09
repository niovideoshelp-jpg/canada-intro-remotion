// Deixas sonoras (segundos globais do video). `at` ja desconta o tempo ate o transiente de cada
// arquivo (onset medido), para o pico cair exatamente no acontecimento visual.
export type Cue = {at: number; file: string; vol: number; dur?: number; fadeIn?: number; fadeOut?: number};

/**
 * "Ticks" para numeros contando: um tick a cada passo IGUAL de valor, no instante em que o contador
 * passa por ele. 'out' = contador outCubic (rapido -> lento), 'in' = contador inCubic (lento -> rapido).
 */
export const ticks = (from: number, to: number, n: number, vol: number, curve: 'out' | 'in'): Cue[] =>
  Array.from({length: n}, (_, i) => {
    const v = (i + 1) / n;
    const u = curve === 'out' ? 1 - Math.cbrt(1 - v) : Math.cbrt(v);
    return {at: from + (to - from) * u - 0.008, file: 'tick', vol, dur: 0.3};
  });
