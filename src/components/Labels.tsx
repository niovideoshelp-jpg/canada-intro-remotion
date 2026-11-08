import React from 'react';
import {ANTON} from '../fonts';
import {at} from '../lib/pos';
import {C} from '../theme';

type Anchor = 'left' | 'center' | 'right';
const tx = (a: Anchor) => (a === 'center' ? '-50%' : a === 'right' ? '-100%' : '0%');

/**
 * Rotulo com marcador vermelho (a "faixa" da referencia, agora vermelha).
 * Animado via GSAP: classes `${cls}-bar` e `${cls}-txt` (ver lib/tl.ts -> marker()).
 */
export const MarkerLabel: React.FC<{
  cls: string;
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: Anchor;
  textColor?: string;
  barColor?: string;
  spacing?: string;
}> = ({cls, x, y, text, size = 56, anchor = 'center', textColor = C.ink, barColor = C.red, spacing = '0.03em'}) => (
  <div style={at(x, y, tx(anchor))}>
    <div style={{position: 'relative', padding: `${size * 0.1}px ${size * 0.3}px ${size * 0.06}px`}}>
      <div className={`${cls}-bar`} style={{position: 'absolute', inset: 0, backgroundColor: barColor}} />
      <div
        className={`${cls}-txt`}
        style={{
          position: 'relative',
          fontFamily: ANTON,
          fontSize: size,
          lineHeight: 1.06,
          color: textColor,
          letterSpacing: spacing,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </div>
    </div>
  </div>
);

/** Rotulo simples de mapa (nome de lugar), revelado por mascara: classe `${cls}`. */
export const MapLabel: React.FC<{
  cls: string;
  x: number;
  y: number;
  text: string;
  size?: number;
  color?: string;
  anchor?: Anchor;
  spacing?: string;
  shadow?: boolean;
}> = ({cls, x, y, text, size = 30, color = C.inkSoft, anchor = 'center', spacing = '0.22em', shadow = true}) => (
  <div style={at(x, y, tx(anchor))}>
    <div
      className={cls}
      style={{
        fontFamily: ANTON,
        fontSize: size,
        color,
        letterSpacing: spacing,
        // compensa o espaco extra da ultima letra para centralizar de verdade
        marginRight: anchor === 'center' ? `-${spacing}` : undefined,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        lineHeight: 1,
        textShadow: shadow ? '0 2px 10px rgba(0,0,0,0.55)' : undefined,
      }}
    >
      {text}
    </div>
  </div>
);

/**
 * Numero com contagem. Cada caractere tem largura FIXA => o numero nao "dança" enquanto conta.
 */
export const BigNumber: React.FC<{
  value: number;
  x: number;
  y: number;
  size?: number;
  prefix?: string;
  prefixOpacity?: number;
  suffix?: string;
  minDigits?: number;
  color?: string;
  anchor?: Anchor;
  cls?: string;
}> = ({value, x, y, size = 200, prefix = '', prefixOpacity = 1, suffix = '', minDigits = 1, color = C.ink, anchor = 'center', cls}) => {
  const raw = String(Math.abs(Math.round(value)));
  // casas fixas: digitos "fantasmas" a esquerda mantem a largura constante durante a contagem
  const ghosts = Math.max(0, minDigits - raw.length);
  const cells: {ch: string; ghost?: boolean; prefix?: boolean}[] = [
    ...[...prefix].map((ch) => ({ch, prefix: true})),
    ...Array.from({length: ghosts}, () => ({ch: '0', ghost: true})),
    ...[...raw].map((ch) => ({ch})),
    ...[...suffix].map((ch) => ({ch})),
  ];
  const widthOf = (ch: string) => (/[0-9]/.test(ch) ? 0.5 : ch === '%' ? 0.66 : ch === '°' ? 0.36 : ch === '−' ? 0.42 : ch === 'M' ? 0.6 : 0.4);
  return (
    <div style={at(x, y, tx(anchor))}>
      <div className={cls} style={{display: 'flex', fontFamily: ANTON, fontSize: size, lineHeight: 1, color, textShadow: '0 4px 24px rgba(0,0,0,0.45)'}}>
        {cells.map((c, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: `${widthOf(c.ch)}em`,
              textAlign: 'center',
              opacity: c.ghost ? 0 : c.prefix ? prefixOpacity : 1,
            }}
          >
            {c.ch}
          </span>
        ))}
      </div>
    </div>
  );
};
