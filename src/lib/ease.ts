// Curvas de easing deterministicas (sem molas que oscilam: nada de "tremedeira").
export type Ease = (t: number) => number;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const linear: Ease = (t) => t;
export const inOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const inOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const inOutQuint: Ease = (t) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2);
export const outCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const outQuart: Ease = (t) => 1 - Math.pow(1 - t, 4);
export const outExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const inCubic: Ease = (t) => t * t * t;

/** Progresso 0..1 de t entre a e b, com easing. */
export const ramp = (t: number, a: number, b: number, ease: Ease = linear) => ease(clamp01((t - a) / (b - a)));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
