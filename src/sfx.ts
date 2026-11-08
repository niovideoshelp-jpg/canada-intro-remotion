// Deixas sonoras (segundos globais). Efeitos do Freesound, todos CC0 (ver assets-src/credits).
// `at` ja desconta o tempo ate o transiente de cada arquivo (onset medido), para o pico cair
// exatamente no acontecimento visual.
export type Cue = {at: number; file: string; vol: number; dur?: number; fadeIn?: number; fadeOut?: number};

/**
 * "Ticks" para numeros contando: um tick a cada passo IGUAL de valor, no instante em que o contador
 * passa por ele. 'out' = contador outCubic (rapido -> lento), 'in' = contador inCubic (lento -> rapido).
 */
const ticks = (from: number, to: number, n: number, vol: number, curve: 'out' | 'in'): Cue[] =>
  Array.from({length: n}, (_, i) => {
    const v = (i + 1) / n;
    const u = curve === 'out' ? 1 - Math.cbrt(1 - v) : Math.cbrt(v);
    return {at: from + (to - from) * u - 0.008, file: 'tick', vol, dur: 0.3};
  });

export const SFX_CUES: Cue[] = [
  // 01 — "This is Canada... ridiculously big country. Okay..."
  {at: 0.0, file: 'paper_unfold', vol: 0.3, dur: 1.6},
  {at: 0.04, file: 'pen_scribble', vol: 0.2, dur: 1.15, fadeOut: 0.3},
  {at: 0.36, file: 'marker_swipe', vol: 0.22, dur: 0.8},
  {at: 1.88, file: 'whoosh_soft', vol: 0.26, dur: 1.0},
  {at: 3.6, file: 'whoosh_soft2', vol: 0.28, dur: 1.1},
  {at: 5.63, file: 'whoosh_big', vol: 0.32, dur: 1.5},
  {at: 8.43, file: 'whoosh_soft', vol: 0.2, dur: 1.0},

  // 02 — "second largest country on the planet"
  {at: 10.72, file: 'paper_slide2', vol: 0.22, dur: 0.8},
  {at: 11.41, file: 'stamp', vol: 0.3, dur: 0.6},
  {at: 11.87, file: 'pop', vol: 0.3, dur: 0.4},

  // 03 — "40% ... in the Arctic"
  {at: 13.37, file: 'marker_swipe', vol: 0.22, dur: 0.8},
  ...ticks(13.52, 14.37, 7, 0.12, 'out'),
  {at: 14.36, file: 'stamp', vol: 0.32, dur: 0.6},
  {at: 15.27, file: 'ice_crack', vol: 0.22, dur: 1.4, fadeOut: 0.4},

  // 04 — "polar bears, moose, and a handful of brave souls"
  {at: 15.91, file: 'paper_slide2', vol: 0.22, dur: 0.8},
  {at: 15.85, file: 'wind_arctic', vol: 0.26, dur: 6.6, fadeIn: 0.9, fadeOut: 0.9},
  {at: 17.69, file: 'pop', vol: 0.34, dur: 0.4},
  {at: 17.42, file: 'bear_growl', vol: 0.2, dur: 1.25, fadeOut: 0.4},
  {at: 18.73, file: 'pop2', vol: 0.36, dur: 0.4},
  {at: 20.24, file: 'pop', vol: 0.32, dur: 0.4},
  {at: 20.36, file: 'snow_steps', vol: 0.24, dur: 2.2, fadeOut: 0.6},

  // 05 — "It gets so cold up there"
  {at: 21.81, file: 'paper_slide2', vol: 0.22, dur: 0.8},
  {at: 21.98, file: 'pen_scribble', vol: 0.16, dur: 0.7, fadeOut: 0.25},
  {at: 22.9, file: 'ice_crack', vol: 0.34, dur: 1.4, fadeOut: 0.4},
  ...ticks(22.6, 23.6, 6, 0.11, 'in'),
  {at: 23.6, file: 'stamp', vol: 0.28, dur: 0.6},

  // 06 — "Squeeze into the South... 90%... narrow strip"
  {at: 24.05, file: 'pop2', vol: 0.18, dur: 0.4},
  {at: 26.05, file: 'whoosh_soft2', vol: 0.26, dur: 1.2},
  {at: 28.05, file: 'marker_swipe', vol: 0.22, dur: 0.8},
  {at: 30.15, file: 'whoosh_soft', vol: 0.22, dur: 1.0},
  ...ticks(30.6, 31.45, 7, 0.12, 'out'),
  {at: 31.46, file: 'stamp', vol: 0.28, dur: 0.6},
  {at: 32.83, file: 'marker_swipe', vol: 0.24, dur: 0.8},
  {at: 33.32, file: 'pen_scribble', vol: 0.18, dur: 0.6, fadeOut: 0.2},

  // 07 — "virtually untouched"
  {at: 34.16, file: 'paper_slide2', vol: 0.22, dur: 0.8},
  {at: 34.2, file: 'wind_arctic', vol: 0.2, dur: 4.2, fadeIn: 0.8, fadeOut: 0.9},

  // 08 — "But that's where things get complicated."
  {at: 38.27, file: 'boom', vol: 0.26, dur: 2.6, fadeOut: 1.3},
  {at: 38.3, file: 'drone', vol: 0.18, dur: 19.2, fadeIn: 1.6, fadeOut: 1.4},
  {at: 38.93, file: 'pen_scribble', vol: 0.16, dur: 1.15, fadeOut: 0.3},

  // 09 — "modern, well-equipped military, but it's short on personnel"
  {at: 40.86, file: 'paper_slide2', vol: 0.22, dur: 0.8},
  {at: 40.98, file: 'jet_flyby', vol: 0.2, dur: 4.4, fadeOut: 1.4},
  {at: 42.42, file: 'ship_horn', vol: 0.16, dur: 3.0, fadeOut: 1.0},
  {at: 42.95, file: 'pop', vol: 0.3, dur: 0.4},
  {at: 44.0, file: 'pop2', vol: 0.18, dur: 0.4},
  {at: 44.37, file: 'pop2', vol: 0.3, dur: 0.4},
  {at: 44.46, file: 'pop2', vol: 0.3, dur: 0.4},

  // 10 — "population is simply too small"
  {at: 45.37, file: 'paper_slide', vol: 0.22, dur: 0.9},
  {at: 45.72, file: 'pop', vol: 0.26, dur: 0.4},
  {at: 46.54, file: 'pop2', vol: 0.2, dur: 0.4},
  {at: 46.94, file: 'pop', vol: 0.2, dur: 0.4},
  {at: 47.13, file: 'marker_swipe', vol: 0.24, dur: 0.8},
  {at: 50.32, file: 'riser', vol: 0.28, dur: 3.2},

  // 11 — "Can Canada defend the Arctic on its own?"
  {at: 53.21, file: 'boom', vol: 0.22, dur: 2.6, fadeOut: 1.4},
  {at: 55.22, file: 'marker_swipe', vol: 0.24, dur: 0.8},
];
