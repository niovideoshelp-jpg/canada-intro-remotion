import React from 'react';
import {C} from '../../theme';
import {SvgText} from './common';

/**
 * Balanca de pratos (SVG): base, coluna, travessao que inclina `tilt` graus (positivo = lado DIREITO desce)
 * e dois pratos que ficam sempre na horizontal. (x, y) = pivo do travessao.
 * `left`/`right` = conteudo SVG de cada prato, em coordenadas locais: (0, 0) = centro da borda do prato,
 * y negativo = para cima (ex.: <Icon name="radarDome" y={-34} size={64} />).
 * A inclinacao vem do frame: tilt={stepsAt(t, -10, [{at: T('monitor'), to: -5}, ...], 0.6, outCubic)}.
 * Classes: `${cls}-st` (base), `${cls}-bm` (travessao), `${cls}-pn` (pratos), `${cls}-lb` (rotulos): balanceIn.
 * Itens que caem nos pratos: de a cada item uma classe e use dropIn(tl, q, '.minha-classe', at).
 */
export const Balance: React.FC<{
  cls: string;
  x: number;
  y: number;
  w?: number;
  tilt?: number;
  /** altura da coluna abaixo do pivo */
  post?: number;
  /** comprimento das cordas */
  hang?: number;
  /** largura dos pratos */
  pan?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  leftAccent?: boolean;
  rightAccent?: boolean;
  labelSize?: number;
  color?: string;
  width?: number;
  opacity?: number;
}> = ({
  cls,
  x,
  y,
  w = 760,
  tilt = 0,
  post = 330,
  hang = 160,
  pan = 240,
  left,
  right,
  leftLabel,
  rightLabel,
  leftAccent,
  rightAccent,
  labelSize = 40,
  color = C.ink,
  width = 4,
  opacity,
}) => {
  const a = (tilt * Math.PI) / 180;
  const depth = pan * 0.26;
  const side = (s: -1 | 1, content: React.ReactNode, label: string | undefined, accent: boolean | undefined) => {
    const ex = x + s * (w / 2) * Math.cos(a);
    const ey = y + s * (w / 2) * Math.sin(a);
    return (
      <g transform={`translate(${ex} ${ey})`}>
        <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
          <path className={`${cls}-pn`} d={`M0,0 L${-pan / 2},${hang}`} strokeOpacity={0.8} strokeWidth={width * 0.6} />
          <path className={`${cls}-pn`} d={`M0,0 L${pan / 2},${hang}`} strokeOpacity={0.8} strokeWidth={width * 0.6} />
          <path className={`${cls}-pn`} d={`M${-pan / 2},${hang} Q0,${hang + depth * 2} ${pan / 2},${hang} Z`} fill={C.ink} fillOpacity={0.1} />
        </g>
        <g transform={`translate(0 ${hang})`}>{content}</g>
        {label ? <SvgText cls={`${cls}-lb`} x={0} y={hang + depth + labelSize * 1.05} text={label} size={labelSize} color={accent ? C.red : color} /> : null}
      </g>
    );
  };
  return (
    <g opacity={opacity} style={{filter: `drop-shadow(0px 3px 8px ${C.shadow})`}}>
      <g fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
        <path className={`${cls}-st`} d={`M${x - 140},${y + post} L${x + 140},${y + post}`} />
        <path className={`${cls}-st`} d={`M${x - 72},${y + post} L${x - 26},${y + post - 32} L${x + 26},${y + post - 32} L${x + 72},${y + post}`} />
        <path className={`${cls}-st`} d={`M${x},${y + post - 32} L${x},${y + 22}`} />
        <path className={`${cls}-st`} d={`M${x - 20},${y + 26} L${x},${y - 2} L${x + 20},${y + 26} Z`} fill={C.black} />
      </g>
      <g transform={`rotate(${tilt} ${x} ${y})`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round">
        <path className={`${cls}-bm`} d={`M${x - w / 2},${y} L${x + w / 2},${y}`} />
        <circle className={`${cls}-bm`} cx={x - w / 2} cy={y} r={7} fill={C.black} />
        <circle className={`${cls}-bm`} cx={x + w / 2} cy={y} r={7} fill={C.black} />
        <circle className={`${cls}-bm`} cx={x} cy={y} r={9} fill={C.black} />
      </g>
      {side(-1, left, leftLabel, leftAccent)}
      {side(1, right, rightLabel, rightAccent)}
    </g>
  );
};
