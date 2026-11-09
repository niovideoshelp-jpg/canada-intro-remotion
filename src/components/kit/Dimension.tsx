import React from 'react';
import {C} from '../../theme';
import {SvgText} from './common';

type P = readonly [number, number];

/**
 * Linha de cota (prancheta, como as cotas da Intro): linha + ticks nas pontas + rotulo Anton ("103 M").
 * SVG. `side` = lado do rotulo (-1: acima de uma linha da esquerda para a direita). O rotulo segue o angulo
 * da linha (sempre legivel). Classes: `${cls}-l` (linha), `${cls}-t` (ticks), `${cls}-lbl`. Entrada: dimIn.
 */
export const Dimension: React.FC<{
  cls: string;
  from: P;
  to: P;
  label?: string;
  size?: number;
  side?: 1 | -1;
  tick?: number;
  color?: string;
  labelColor?: string;
  opacity?: number;
  width?: number;
  /** distancia extra do rotulo ate a linha (px) */
  labelGap?: number;
}> = ({cls, from, to, label, size = 40, side = -1, tick = 28, color = C.ink, labelColor = C.ink, opacity = 0.85, width = 2.5, labelGap = 0}) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const t = tick / 2;
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (ang > 90) ang -= 180;
  if (ang <= -90) ang += 180;
  const off = (size * 0.62 + 6 + labelGap) * side;
  const mx = (from[0] + to[0]) / 2 + nx * off;
  const my = (from[1] + to[1]) / 2 + ny * off;
  return (
    <g>
      <g fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={width} strokeLinecap="round">
        <path className={`${cls}-l`} d={`M${from[0]},${from[1]} L${to[0]},${to[1]}`} />
        <path
          className={`${cls}-t`}
          d={`M${from[0] - nx * t},${from[1] - ny * t} L${from[0] + nx * t},${from[1] + ny * t} M${to[0] - nx * t},${to[1] - ny * t} L${to[0] + nx * t},${to[1] + ny * t}`}
        />
      </g>
      {label ? <SvgText cls={`${cls}-lbl`} x={mx} y={my} rot={ang} text={label} size={size} color={labelColor} /> : null}
    </g>
  );
};
