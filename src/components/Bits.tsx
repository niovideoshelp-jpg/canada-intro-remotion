import React from 'react';
import {ANTON} from '../fonts';
import {at} from '../lib/pos';
import {C} from '../theme';
import {usePx} from './MapSvg';

/**
 * Linha tracejada que "se desenha": o tracejado fica fixo no mapa e um traco solido dentro de um
 * mask e revelado com DrawSVG (classe `${id}-rev`). Assim o tracejado nunca "anda".
 */
export const DashedDraw: React.FC<{id: string; d: string; color?: string; width?: number; dash?: [number, number]; opacity?: number}> = ({
  id,
  d,
  color = C.ink,
  width = 2,
  dash = [10, 8],
  opacity = 1,
}) => {
  const px = usePx();
  return (
    <g>
      <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={10000} height={10000}>
        <path className={`${id}-rev`} d={d} fill="none" stroke="#fff" strokeWidth={px(width + 8)} strokeLinecap="round" strokeLinejoin="round" />
      </mask>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth={px(width)}
        strokeDasharray={`${dash[0]} ${dash[1]}`}
        strokeLinecap="round"
        mask={`url(#${id}-m)`}
      />
    </g>
  );
};

/** Disco com numero (ranking). Entrada via pop() na classe `cls`. */
export const Badge: React.FC<{cls: string; x: number; y: number; n: string; size?: number; ring?: string; color?: string}> = ({
  cls,
  x,
  y,
  n,
  size = 120,
  ring = C.red,
  color = C.ink,
}) => (
  <div style={{...at(x, y), width: size, height: size}}>
    <div
      className={cls}
      style={{
        visibility: 'hidden',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#141414',
        boxShadow: `0 0 0 ${Math.round(size * 0.05)}px ${ring}, 0 10px 30px rgba(0,0,0,0.5)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: ANTON,
        fontSize: size * 0.62,
        lineHeight: 1,
        color,
        paddingTop: size * 0.02,
      }}
    >
      {n}
    </div>
  </div>
);

/** Seta desenhada a mao (curva + ponta, a ponta entra depois). Classes `${cls}-c` e `${cls}-h`. */
export const HandArrow: React.FC<{cls: string; from: [number, number]; to: [number, number]; bow?: number; color?: string; width?: number}> = ({
  cls,
  from,
  to,
  bow = 0.25,
  color = C.ink,
  width = 4,
}) => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2 - (y2 - y1) * bow;
  const my = (y1 + y2) / 2 + (x2 - x1) * bow;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const hl = 26;
  const hx = (a: number) => x2 - hl * Math.cos(ang + a);
  const hy = (a: number) => y2 - hl * Math.sin(ang + a);
  return (
    <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <path className={`${cls}-c`} d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} />
      <path className={`${cls}-h`} d={`M${hx(0.55)} ${hy(0.55)} L${x2} ${y2} L${hx(-0.55)} ${hy(-0.55)}`} />
    </g>
  );
};
