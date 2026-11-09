import React from 'react';
import {C} from '../../theme';
import {usePx} from '../MapSvg';
import {bearingPt} from './geom';

/** Angulo da varredura (graus, rumo: 0 = norte, horario) no tempo global t: uma volta a cada `period` s. */
export const sweepAngle = (t: number, t0: number, period = 3, start = 0) => start + (Math.max(0, t - t0) / period) * 360;

/**
 * Varredura de radar em coordenadas do mapa (SVG; tracos constantes na tela via usePx).
 * O angulo vem do frame (deterministico): angle={sweepAngle(t, T('tracked'), 2.6)}. A esteira e feita
 * de cunhas sobrepostas (sem costuras). Os `blips` acendem quando a varredura passa e apagam ao longo
 * de `decay` graus; com `start` (o angulo inicial), quem ainda nao foi varrido fica apagado.
 * Classe opcional `cls` no grupo (para fadeIn/fadeOut).
 */
export const RadarSweep: React.FC<{
  cx: number;
  cy: number;
  r: number;
  angle: number;
  /** abertura da esteira (graus) */
  trail?: number;
  color?: string;
  /** opacidade maxima da esteira junto da linha de varredura */
  strength?: number;
  rings?: number;
  outline?: boolean;
  blips?: readonly {x: number; y: number}[];
  blipColor?: string;
  /** raio do blip em px de tela */
  blipSize?: number;
  /** brilho minimo do blip apagado (0..1) */
  blipBase?: number;
  start?: number;
  decay?: number;
  width?: number;
  cls?: string;
  opacity?: number;
}> = ({
  cx,
  cy,
  r,
  angle,
  trail = 80,
  color = C.ink,
  strength = 0.34,
  rings = 3,
  outline = true,
  blips = [],
  blipColor = C.red,
  blipSize = 6,
  blipBase = 0.25,
  start,
  decay = 300,
  width = 1.6,
  cls,
  opacity,
}) => {
  const px = usePx();
  const N = 20;
  const each = 1 - Math.pow(1 - strength, 1 / N);
  const [ex, ey] = bearingPt(cx, cy, r, angle);
  const wedge = (span: number) => {
    const [ax, ay] = bearingPt(cx, cy, r, angle - span);
    return `M${cx},${cy} L${ax},${ay} A${r},${r} 0 ${span > 180 ? 1 : 0} 1 ${ex},${ey} Z`;
  };
  return (
    <g className={cls} opacity={opacity}>
      {Array.from({length: rings}, (_, k) => (
        <circle key={k} cx={cx} cy={cy} r={(r * (k + 1)) / (rings + (outline ? 0 : 1))} fill="none" stroke={color} strokeOpacity={k === rings - 1 && outline ? 0.38 : 0.16} strokeWidth={px(width)} />
      ))}
      {Array.from({length: N}, (_, k) => (
        <path key={k} d={wedge((trail * (k + 1)) / N)} fill={color} fillOpacity={each} />
      ))}
      <path d={`M${cx},${cy} L${ex},${ey}`} stroke={color} strokeOpacity={0.9} strokeWidth={px(width * 1.5)} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={px(4)} fill={color} />
      {blips.map((b, i) => {
        const dist = Math.hypot(b.x - cx, b.y - cy);
        const bearing = (((Math.atan2(b.x - cx, -(b.y - cy)) * 180) / Math.PI) % 360 + 360) % 360;
        let bright = blipBase;
        const swept = start === undefined || angle - start >= (((bearing - start) % 360) + 360) % 360;
        if (dist <= r && swept) {
          const since = (((angle - bearing) % 360) + 360) % 360;
          const f = Math.max(0, 1 - since / decay);
          bright = blipBase + (1 - blipBase) * f * f;
        }
        return (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={px(blipSize * 2.3)} fill={blipColor} fillOpacity={0.3 * Math.max(0, (bright - blipBase) / (1 - blipBase))} />
            <circle cx={b.x} cy={b.y} r={px(blipSize * (0.85 + 0.3 * bright))} fill={blipColor} fillOpacity={bright} />
          </g>
        );
      })}
    </g>
  );
};
