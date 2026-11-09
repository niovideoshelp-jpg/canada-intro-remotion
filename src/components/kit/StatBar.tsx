import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';

/**
 * Barra horizontal: rotulo Anton, trilho a giz, preenchimento (fracao `value` 0..1) e um alvo opcional
 * (`target` 0..1 com `targetLabel`, ex. NEEDED). (x, y) = borda ESQUERDA do trilho, centro vertical.
 * O preenchimento cresce com barIn(tl, q, cls, at, dur) (escala da esquerda) ou com `value` por frame.
 * Classes: `${cls}-lbl`, `${cls}-track`, `${cls}-fill`, `${cls}-tgt`, `${cls}-tgl`, `${cls}-val`.
 */
export const StatBar: React.FC<{
  cls: string;
  x: number;
  y: number;
  value: number;
  w?: number;
  h?: number;
  label?: string;
  /** 'left' = rotulo a esquerda do trilho (alinhado a direita); 'top' = acima, alinhado ao inicio */
  labelPos?: 'left' | 'top';
  labelSize?: number;
  labelColor?: string;
  color?: string;
  target?: number;
  targetLabel?: string;
  /** texto no fim do preenchimento (so se for um numero REAL da narracao) */
  valueText?: string;
  opacity?: number;
}> = ({cls, x, y, value, w = 760, h = 36, label, labelPos = 'left', labelSize, labelColor = C.ink, color = C.red, target, targetLabel, valueText, opacity}) => {
  const ls = labelSize ?? Math.max(28, Math.round(h * 1.05));
  const inset = Math.max(4, Math.round(h * 0.16));
  const fw = Math.max(0, Math.min(1, value)) * (w - inset * 2);
  const text: React.CSSProperties = {
    fontFamily: ANTON,
    lineHeight: 1.05,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    textShadow: `0 2px 10px ${C.shadow}`,
  };
  return (
    <div style={{...at(x, y, '0%', '-50%'), width: w, height: h, opacity}}>
      {label ? (
        <div style={labelPos === 'left' ? at(-ls * 0.6, h / 2, '-100%', '-50%') : at(0, -ls * 0.32, '0%', '-100%')}>
          <div className={`${cls}-lbl`} style={{...text, fontSize: ls, color: labelColor}}>
            {label}
          </div>
        </div>
      ) : null}
      <div
        className={`${cls}-track`}
        style={{position: 'absolute', inset: 0, border: `2.5px solid ${C.inkSoft}`, borderRadius: 3, backgroundColor: C.black, boxShadow: `0 6px 18px ${C.shadow}`}}
      />
      <div className={`${cls}-fill`} style={{position: 'absolute', left: inset, top: inset, width: fw, height: h - inset * 2, backgroundColor: color, borderRadius: 1}} />
      {target !== undefined ? (
        <>
          <div
            className={`${cls}-tgt`}
            style={{position: 'absolute', left: inset + target * (w - inset * 2) - 2.5, top: -h * 0.45, width: 5, height: h * 1.9, backgroundColor: C.ink, borderRadius: 2}}
          />
          {targetLabel ? (
            <div style={at(inset + target * (w - inset * 2), -h * 0.45 - 8, '-50%', '-100%')}>
              <div className={`${cls}-tgl`} style={{...text, fontSize: Math.round(ls * 0.62), color: C.ink, letterSpacing: '0.1em'}}>
                {targetLabel}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {valueText ? (
        <div style={at(inset + fw + h * 0.5, h / 2, '0%', '-50%')}>
          <div className={`${cls}-val`} style={{...text, fontSize: ls, color}}>
            {valueText}
          </div>
        </div>
      ) : null}
    </div>
  );
};
