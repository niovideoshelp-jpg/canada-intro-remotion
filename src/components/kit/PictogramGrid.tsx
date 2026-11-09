import React from 'react';
import {C} from '../../theme';
import {Icon, IconName} from './Icon';

/** on = tinta cheia, red = vermelho cheio, dim = apagado, off = contorno tracejado (planejado/indisponivel),
 *  empty = vaga vazia (contorno tracejado vermelho, como a fileira da Intro), none = nao desenha. */
export type CellState = 'on' | 'red' | 'dim' | 'off' | 'empty' | 'none';

/**
 * Grade de n pictogramas (SVG: use dentro de um <svg>/SvgLayer ou MapSvg). (x, y) = centro da grade.
 * `state` pode ser fixo ou uma funcao do indice (calculada por frame: mudar de estado e um corte seco;
 * para uma "onda", escalone no tempo: i => t > t0 + i * 0.04 ? 'red' : 'on').
 * Classes: `${cls}-c` (todas as celulas) e `${cls}-c-${i}`. Entrada: gridIn(tl, q, cls, at, each).
 */
export const PictogramGrid: React.FC<{
  cls: string;
  x: number;
  y: number;
  n: number;
  cols: number;
  icon: IconName;
  size?: number;
  gap?: number;
  /** largura/altura da celula (padrao = size; pessoas: cellW = size * 0.45) */
  cellW?: number;
  cellH?: number;
  state?: CellState | ((i: number) => CellState);
  /** rotacao dos icones (ex. jatos apontando para a direita: 90) */
  rot?: number;
  strokeW?: number;
  shadow?: boolean;
  opacity?: number;
}> = ({cls, x, y, n, cols, icon, size = 48, gap, cellW, cellH, state = 'on', rot = 0, strokeW, shadow = true, opacity}) => {
  const cw = cellW ?? size;
  const ch = cellH ?? size;
  const g = gap ?? size * 0.22;
  const rows = Math.ceil(n / cols);
  const gw = cols * cw + (cols - 1) * g;
  const gh = rows * ch + (rows - 1) * g;
  const x0 = x - gw / 2 + cw / 2;
  const y0 = y - gh / 2 + ch / 2;
  const sw = strokeW ?? Math.max(1.6, (2.5 * size) / 64);
  return (
    <g style={shadow ? {filter: `drop-shadow(0px 2px 5px ${C.shadow})`} : undefined} opacity={opacity}>
      {Array.from({length: n}, (_, i) => {
        const s = typeof state === 'function' ? state(i) : state;
        if (s === 'none') return null;
        const cx = x0 + (i % cols) * (cw + g);
        const cy = y0 + Math.floor(i / cols) * (ch + g);
        const look =
          s === 'on'
            ? {color: C.ink, fill: C.ink}
            : s === 'red'
              ? {color: C.red, fill: C.red}
              : s === 'dim'
                ? {color: C.ink, fill: C.ink, opacity: 0.22}
                : s === 'off'
                  ? {color: C.inkSoft, dashed: true}
                  : {color: C.red, fill: C.red, fillOpacity: 0.14, dashed: true};
        return (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <g className={`${cls}-c ${cls}-c-${i}`}>
              <Icon name={icon} size={size} rot={rot} strokeW={sw} {...look} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** Centro da celula i de uma PictogramGrid com os mesmos parametros (para ligar linhas, contadores...). */
export const gridCellCenter = (i: number, p: {x: number; y: number; n: number; cols: number; size?: number; gap?: number; cellW?: number; cellH?: number}) => {
  const size = p.size ?? 48;
  const cw = p.cellW ?? size;
  const ch = p.cellH ?? size;
  const g = p.gap ?? size * 0.22;
  const rows = Math.ceil(p.n / p.cols);
  const gw = p.cols * cw + (p.cols - 1) * g;
  const gh = rows * ch + (rows - 1) * g;
  return [p.x - gw / 2 + cw / 2 + (i % p.cols) * (cw + g), p.y - gh / 2 + ch / 2 + Math.floor(i / p.cols) * (ch + g)] as [number, number];
};
