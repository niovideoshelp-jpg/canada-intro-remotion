// Pecas comuns do kit: camada SVG de tela cheia, rotulo Anton em SVG e helpers por frame
// (valores calculados a partir do tempo global, sem GSAP: contadores, degraus suaves).
import React from 'react';
import {ANTON} from '../../fonts';
import {Ease, inOutCubic, lerp, outCubic, ramp} from '../../lib/ease';
import {C, H, W} from '../../theme';

export type Anchor = 'left' | 'center' | 'right';
export const txOf = (a: Anchor) => (a === 'center' ? '-50%' : a === 'right' ? '-100%' : '0%');

/** <svg> de tela cheia (1920x1080) para componentes SVG fora de um MapSvg. */
export const SvgLayer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

export const LABEL_SHADOW = `drop-shadow(0px 2px 7px ${C.shadow})`;

/**
 * Rotulo Anton em SVG (maiusculas), centrado verticalmente nas maiusculas em (x, y).
 * A classe `cls` fica no <text> (wipeText funciona nele); a sombra fica no <g> de fora.
 */
export const SvgText: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  spacing?: number;
  rot?: number;
  cls?: string;
  shadow?: boolean;
  opacity?: number;
}> = ({x, y, text, size = 40, color = C.ink, anchor = 'middle', spacing = 0.05, rot = 0, cls, shadow = true, opacity}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} style={shadow ? {filter: LABEL_SHADOW} : undefined} opacity={opacity}>
    <text
      className={cls}
      x={anchor === 'middle' ? (size * spacing) / 2 : 0}
      y={size * 0.43}
      textAnchor={anchor}
      fontFamily={ANTON}
      fontSize={size}
      letterSpacing={size * spacing}
      fill={color}
    >
      {text.toUpperCase()}
    </text>
  </g>
);

/** Valor que conta de `from` ate `to` entre t0 e t1 (segundos globais). Padrao outCubic (rapido -> lento). */
export const countAt = (t: number, t0: number, t1: number, from: number, to: number, ease: Ease = outCubic) => lerp(from, to, ramp(t, t0, t1, ease));

/**
 * Valor em degraus suaves: comeca em `initial` e, em cada passo {at, to}, vai ate `to` em `dur` s.
 * Ex.: inclinacao da Balance a cada peso que cai; contador que sobe a cada "pop".
 */
export const stepsAt = (t: number, initial: number, steps: readonly {at: number; to: number}[], dur = 0.5, ease: Ease = inOutCubic) => {
  let v = initial;
  for (const s of steps) {
    if (t <= s.at) break;
    v = lerp(v, s.to, ramp(t, s.at, s.at + dur, ease));
  }
  return v;
};

/** Pseudo-aleatorio deterministico em [0,1) (para larguras de linhas, variacoes). */
export const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
