// Camera 2D por keyframes (em segundos globais). Movimentos suaves, sem shake.
// x,y = ponto do "mundo" (coordenadas de design 1920x1080) que fica no centro da tela.
import {H, W} from '../theme';
import {Ease, clamp01, inOutCubic} from './ease';

export type Cam = {x: number; y: number; s: number; r: number};
export type CamKey = {t: number; x: number; y: number; s: number; r?: number; ease?: Ease};

export const camAt = (t: number, keys: CamKey[]): Cam => {
  const first = keys[0];
  if (t <= first.t) return {x: first.x, y: first.y, s: first.s, r: first.r ?? 0};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const p = (b.ease ?? inOutCubic)(clamp01((t - a.t) / (b.t - a.t)));
      return {
        x: a.x + (b.x - a.x) * p,
        y: a.y + (b.y - a.y) * p,
        // zoom geometrico: velocidade de zoom perceptualmente constante
        s: a.s * Math.pow(b.s / a.s, p),
        r: (a.r ?? 0) + ((b.r ?? 0) - (a.r ?? 0)) * p,
      };
    }
  }
  const last = keys[keys.length - 1];
  return {x: last.x, y: last.y, s: last.s, r: last.r ?? 0};
};

// Micro-rotacao invisivel: impede o Chrome de encaixar texto/imagens em pixel inteiro (anti-tremedeira).
export const MICRO_ROT = 0.03;

export const camTransform = (c: Cam) =>
  `translate(${W / 2} ${H / 2}) rotate(${c.r + MICRO_ROT}) scale(${c.s}) translate(${-c.x} ${-c.y})`;

export const toScreen = (p: readonly [number, number] | readonly number[], c: Cam): [number, number] => {
  const dx = (p[0] - c.x) * c.s;
  const dy = (p[1] - c.y) * c.s;
  const a = ((c.r + MICRO_ROT) * Math.PI) / 180;
  return [W / 2 + dx * Math.cos(a) - dy * Math.sin(a), H / 2 + dx * Math.sin(a) + dy * Math.cos(a)];
};
