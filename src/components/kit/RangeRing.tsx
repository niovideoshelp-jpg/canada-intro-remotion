import React from 'react';
import {C} from '../../theme';
import {usePx} from '../MapSvg';
import {circleD} from './geom';

/**
 * Anel de alcance em coordenadas do mapa (SVG; dentro do MapSvg o traco fica constante na tela via usePx).
 * Tracejado por padrao: o tracejado fica FIXO no mapa (em unidades do mapa, nunca "anda") e um traco solido
 * num mask se desenha por cima (classe `${cls}-rev`). Solido (dash = null): classe `${cls}-ring`.
 * Miolo opcional `${cls}-fill`, ponto central `${cls}-dot`. Entrada: ringIn(tl, q, cls, at, dur).
 */
export const RangeRing: React.FC<{
  cls: string;
  cx: number;
  cy: number;
  r: number;
  color?: string;
  /** espessura em px de tela */
  width?: number;
  /** tracejado em unidades do mapa; null = solido */
  dash?: readonly [number, number] | null;
  fill?: string;
  fillOpacity?: number;
  /** rumo (graus, 0 = topo) onde o desenho comeca; gira no sentido horario */
  start?: number;
  dot?: boolean;
  opacity?: number;
}> = ({cls, cx, cy, r, color = C.ink, width = 2.4, dash = [10, 8], fill, fillOpacity = 0.08, start = 0, dot, opacity}) => {
  const px = usePx();
  const d = circleD(cx, cy, r, start);
  return (
    <g opacity={opacity}>
      {fill ? <circle className={`${cls}-fill`} cx={cx} cy={cy} r={r} fill={fill} fillOpacity={fillOpacity} /> : null}
      {dash ? (
        <>
          <mask id={`${cls}-m`} maskUnits="userSpaceOnUse" x={cx - r * 2 - 100} y={cy - r * 2 - 100} width={r * 4 + 200} height={r * 4 + 200}>
            <path className={`${cls}-rev`} d={d} fill="none" stroke="#fff" strokeWidth={px(width + 8)} strokeLinecap="round" />
          </mask>
          <path d={d} fill="none" stroke={color} strokeWidth={px(width)} strokeDasharray={`${dash[0]} ${dash[1]}`} strokeLinecap="round" mask={`url(#${cls}-m)`} />
        </>
      ) : (
        <path className={`${cls}-ring`} d={d} fill="none" stroke={color} strokeWidth={px(width)} strokeLinecap="round" />
      )}
      {dot ? <circle className={`${cls}-dot`} cx={cx} cy={cy} r={px(6)} fill={color} stroke={C.black} strokeWidth={px(2)} /> : null}
    </g>
  );
};

/**
 * Anel que pulsa UMA vez (cresce de r0 ate r1 e some, traco constante). Escondido ate o pulseOnce().
 * SVG, coordenadas do mapa. Classes: `${cls}` (grupo) e `${cls}-c` (circulo).
 */
export const Pulse: React.FC<{cls: string; cx: number; cy: number; r0?: number; r1?: number; color?: string; width?: number}> = ({
  cls,
  cx,
  cy,
  r0 = 8,
  r1 = 48,
  color = C.ink,
  width = 2.5,
}) => {
  const px = usePx();
  return (
    <g className={cls} style={{visibility: 'hidden'}}>
      <circle className={`${cls}-c`} data-r0={r0} data-r1={r1} cx={cx} cy={cy} r={r0} fill="none" stroke={color} strokeWidth={px(width)} />
    </g>
  );
};
