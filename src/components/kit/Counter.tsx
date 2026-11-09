import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';
import {Anchor, txOf} from './common';

type Cell = {ch: string; ghost: boolean; w: number};

/** Celulas de largura fixa (em em) do numero formatado: digitos 0,5em, separadores 0,24em. */
const cellsOf = (value: number, decimals: number, digits: number, sep: string): Cell[] => {
  const fixed = Math.abs(value).toFixed(decimals);
  const [ip, fp] = fixed.split('.');
  const n = Math.max(digits, ip.length);
  const padded = ip.padStart(n, '0');
  const first = n - ip.length; // antes disso: digitos "fantasmas" (largura reservada, invisiveis)
  const out: Cell[] = [];
  for (let i = 0; i < n; i++) {
    out.push({ch: padded[i], ghost: i < first, w: 0.5});
    if (sep && i < n - 1 && (n - 1 - i) % 3 === 0) out.push({ch: sep, ghost: i < first, w: 0.24});
  }
  if (decimals > 0 && fp) {
    out.push({ch: '.', ghost: false, w: 0.24});
    for (const ch of fp) out.push({ch, ghost: false, w: 0.5});
  }
  return out;
};

/**
 * Numero que conta, com separador de milhar ("162,000"), prefixo ("C$"), sufixo ("KM", "+", "M") e uma linha
 * de unidade embaixo ("BILLION", "PASSES A DAY"). Cada digito tem largura FIXA e `digits` reserva as casas
 * do valor final => nada se desloca enquanto conta. `value` vem do frame: countAt(t, t0, t1, 0, 162000).
 * (x, y) = ponto de ancoragem da linha do numero (centro vertical dos algarismos).
 * Classes: `${cls}` (linha do numero) e `${cls}-unit` (linha de unidade): counterIn(tl, q, cls, at).
 */
export const Counter: React.FC<{
  cls?: string;
  x: number;
  y: number;
  value: number;
  size?: number;
  decimals?: number;
  /** casas inteiras reservadas (use as do valor final: 162000 -> 6) */
  digits?: number;
  sep?: string;
  prefix?: string;
  suffix?: string;
  prefixScale?: number;
  suffixScale?: number;
  unit?: string;
  unitSize?: number;
  color?: string;
  unitColor?: string;
  anchor?: Anchor;
  opacity?: number;
}> = ({
  cls,
  x,
  y,
  value,
  size = 160,
  decimals = 0,
  digits = 1,
  sep = ',',
  prefix = '',
  suffix = '',
  prefixScale = 0.62,
  suffixScale,
  unit,
  unitSize,
  color = C.ink,
  unitColor = C.inkSoft,
  anchor = 'center',
  opacity,
}) => {
  const cells = cellsOf(value, decimals, digits, sep);
  const sfx = suffixScale ?? (suffix.trim().length <= 1 ? 1 : 0.55);
  const us = unitSize ?? Math.max(24, Math.round(size * 0.19));
  const align = anchor === 'center' ? 'center' : anchor === 'right' ? 'flex-end' : 'flex-start';
  return (
    // o topo da caixa fica 0,5*size acima de y: (x, y) cai no meio da linha do numero
    <div style={{...at(x, y - size * 0.5, txOf(anchor), '0%'), display: 'flex', flexDirection: 'column', alignItems: align, opacity}}>
      <div
        className={cls}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          fontFamily: ANTON,
          fontSize: size,
          lineHeight: 1,
          color,
          whiteSpace: 'nowrap',
          textShadow: `0 4px 24px ${C.shadow}`,
        }}
      >
        {prefix ? <span style={{fontSize: size * prefixScale, marginRight: size * 0.035, letterSpacing: '0.02em'}}>{prefix}</span> : null}
        {cells.map((c, i) => (
          <span key={i} style={{display: 'inline-block', width: `${c.w}em`, textAlign: 'center', opacity: c.ghost ? 0 : 1}}>
            {c.ch}
          </span>
        ))}
        {suffix ? <span style={{fontSize: size * sfx, marginLeft: size * (sfx < 1 ? 0.07 : 0.02), letterSpacing: '0.03em'}}>{suffix}</span> : null}
      </div>
      {unit ? (
        <div
          className={cls ? `${cls}-unit` : undefined}
          style={{
            marginTop: size * 0.06,
            fontFamily: ANTON,
            fontSize: us,
            lineHeight: 1,
            letterSpacing: '0.18em',
            marginRight: anchor === 'center' ? '-0.18em' : undefined,
            color: unitColor,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            textShadow: `0 2px 10px ${C.shadow}`,
          }}
        >
          {unit}
        </div>
      ) : null}
    </div>
  );
};
