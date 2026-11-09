import React from 'react';
import {C} from '../../theme';
import {SvgText} from './common';
import {handCircleD} from './geom';

/**
 * Destaque de um ponto: circulo feito a mao em volta de (x, y) + linha guia ate `to` + rotulo ("25 MM").
 * SVG. O rotulo fica depois da ponta da guia (a direita ou a esquerda, conforme o lado de `to`).
 * Classes: `${cls}-ring`, `${cls}-lead`, `${cls}-lbl`. Entrada: calloutIn(tl, q, cls, at).
 */
export const Callout: React.FC<{
  cls: string;
  x: number;
  y: number;
  r?: number;
  to: readonly [number, number];
  label: string;
  size?: number;
  color?: string;
  labelColor?: string;
  width?: number;
  seed?: number;
}> = ({cls, x, y, r = 44, to, label, size = 44, color = C.red, labelColor = C.ink, width = 4, seed = 1}) => {
  const a = Math.atan2(to[1] - y, to[0] - x);
  const s: [number, number] = [x + Math.cos(a) * r * 1.12, y + Math.sin(a) * r * 1.12];
  const right = to[0] >= x;
  return (
    <g>
      <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0px 2px 5px ${C.shadow})`}}>
        <path className={`${cls}-ring`} d={handCircleD(x, y, r, r * 0.92, {seed})} />
        <path className={`${cls}-lead`} d={`M${s[0]},${s[1]} L${to[0]},${to[1]}`} />
      </g>
      <SvgText cls={`${cls}-lbl`} x={to[0] + (right ? 14 : -14)} y={to[1]} text={label} size={size} color={labelColor} anchor={right ? 'start' : 'end'} />
    </g>
  );
};
