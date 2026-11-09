import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';

export type CheckMark = 'check' | 'cross' | 'none';

/**
 * Lista de itens em Anton, cada um com uma caixa a giz e uma marca vermelha desenhada a mao
 * (check que passa da caixa, ou X). (x, y) = borda ESQUERDA da lista, centro vertical do bloco.
 * Classes por linha i: `${cls}-box-${i}`, `${cls}-row-${i}` (texto), `${cls}-ck-${i}` (marca).
 * Entrada: checkIn(tl, q, cls, i, at) (caixa + texto + marca) ou checkMark(tl, q, cls, i, at) (so a marca).
 */
export const Checklist: React.FC<{
  cls: string;
  x: number;
  y: number;
  items: string[];
  size?: number;
  gap?: number;
  marks?: CheckMark[];
  box?: boolean;
  color?: string;
  markColor?: string;
  opacity?: number;
}> = ({cls, x, y, items, size = 60, gap, marks, box = true, color = C.ink, markColor = C.red, opacity}) => {
  const bs = Math.round(size * 0.82);
  const g = gap ?? size * 0.5;
  const mw = Math.max(5, bs * 0.15);
  return (
    <div style={{...at(x, y, '0%', '-50%'), display: 'flex', flexDirection: 'column', gap: g, opacity}}>
      {items.map((it, i) => {
        const m = marks?.[i] ?? 'check';
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', height: size * 1.1}}>
            <svg width={bs} height={bs} style={{overflow: 'visible', flex: 'none', filter: `drop-shadow(0px 2px 6px ${C.shadow})`}}>
              {box ? (
                <path className={`${cls}-box-${i}`} d={`M2,2 L${bs - 2},2 L${bs - 2},${bs - 2} L2,${bs - 2} Z`} fill="none" stroke={C.inkSoft} strokeWidth={3} strokeLinejoin="round" />
              ) : null}
              <g fill="none" stroke={markColor} strokeWidth={mw} strokeLinecap="round" strokeLinejoin="round">
                {m === 'check' ? (
                  <path className={`${cls}-ck-${i}`} d={`M${bs * 0.14},${bs * 0.5} Q${bs * 0.3},${bs * 0.63} ${bs * 0.42},${bs * 0.84} Q${bs * 0.62},${bs * 0.3} ${bs * 1.14},${-bs * 0.18}`} />
                ) : m === 'cross' ? (
                  <>
                    <path className={`${cls}-ck-${i}`} d={`M${bs * 0.08},${bs * 0.06} Q${bs * 0.5},${bs * 0.46} ${bs * 0.94},${bs * 0.94}`} />
                    <path className={`${cls}-ck-${i}`} d={`M${bs * 0.92},${bs * 0.08} Q${bs * 0.48},${bs * 0.52} ${bs * 0.06},${bs * 0.92}`} />
                  </>
                ) : null}
              </g>
            </svg>
            <div style={{marginLeft: size * 0.5}}>
              <div
                className={`${cls}-row-${i}`}
                style={{
                  fontFamily: ANTON,
                  fontSize: size,
                  lineHeight: 1.05,
                  color,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                  textShadow: `0 3px 14px ${C.shadow}`,
                }}
              >
                {it}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
