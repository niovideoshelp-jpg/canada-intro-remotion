import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';

// Textura de tinta gasta: ruido ESTATICO (semente fixa) usado como mascara => nada treme.
const WORN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n' x='0' y='0' width='100%' height='100%'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2' seed='4' stitchTiles='stitch'/>" +
    "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -6 4.45'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#n)'/></svg>",
)}")`;

/**
 * Carimbo de data ou palavra curta: Anton dentro de uma moldura vermelha dupla, girado (-4 graus).
 * (x, y) = centro. Classe `${cls}` no elemento interno: stampIn(tl, q, cls, at) (1,5x -> 1x, um overshoot).
 * SFX: {at: inicio + STAMP_HIT - 0.008, file: 'stamp'}.
 */
export const Stamp: React.FC<{
  cls: string;
  x: number;
  y: number;
  text: string;
  /** corpo da fonte em px (padrao 64; o "NO" final usa ~360) */
  size?: number;
  rot?: number;
  color?: string;
  /** caixa cheia (fundo vermelho, texto tinta) em vez de so a moldura */
  solid?: boolean;
  /** fundo escuro translucido atras do carimbo (legibilidade sobre mapas). Use false sobre papel. */
  backing?: boolean;
  /** textura de tinta gasta (padrao true) */
  worn?: boolean;
  opacity?: number;
}> = ({cls, x, y, text, size = 64, rot = -4, color = C.red, solid, backing = true, worn = true, opacity}) => {
  const b = Math.max(4, Math.round(size * 0.075));
  const inner = Math.max(2, Math.round(size * 0.028));
  const gap = Math.round(size * 0.075);
  const mask: React.CSSProperties = worn ? {WebkitMaskImage: WORN, maskImage: WORN, WebkitMaskSize: '240px 240px', maskSize: '240px 240px'} : {};
  return (
    <div style={{...at(x, y), opacity}}>
      <div style={{transform: `rotate(${rot}deg)`}}>
        <div className={cls} style={{position: 'relative'}}>
          {backing && !solid ? <div style={{position: 'absolute', inset: -b, backgroundColor: C.black, opacity: 0.38, borderRadius: b}} /> : null}
          <div
            style={{
              position: 'relative',
              border: `${b}px solid ${color}`,
              borderRadius: b * 0.8,
              backgroundColor: solid ? color : undefined,
              padding: `${size * 0.2}px ${size * 0.34}px ${size * 0.13}px`,
              ...mask,
            }}
          >
            <div style={{position: 'absolute', inset: gap, border: `${inner}px solid ${solid ? C.ink : color}`, borderRadius: b * 0.4, opacity: 0.9}} />
            <div
              style={{
                position: 'relative',
                fontFamily: ANTON,
                fontSize: size,
                lineHeight: 1.0,
                color: solid ? C.ink : color,
                letterSpacing: '0.05em',
                marginRight: '-0.05em',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
              }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
