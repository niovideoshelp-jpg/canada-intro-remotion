import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';
import {IconName, IconPrims} from './Icon';

/**
 * Icone num disco escuro com anel (tinta ou vermelho) e rotulo Anton opcional embaixo.
 * (x, y) = centro do disco. Classes: `${cls}` (disco: pop), `${cls}-ic-p`/`${cls}-ic-f` (icone: drawIcon),
 * `${cls}-lbl` (rotulo: wipeText). Entrada pronta: popIn(tl, q, cls, at).
 */
export const IconBadge: React.FC<{
  cls: string;
  x: number;
  y: number;
  icon: IconName;
  /** diametro do disco em px (padrao 132) */
  size?: number;
  /** 'ink' | 'red' ou uma cor de C */
  ring?: 'ink' | 'red' | string;
  label?: string;
  labelSize?: number;
  labelColor?: string;
  iconColor?: string;
  /** preenchimento do icone (variante solida) */
  iconFill?: string;
  /** fracao do disco ocupada pelo icone (padrao 0.6) */
  iconScale?: number;
  dashed?: boolean;
  opacity?: number;
}> = ({cls, x, y, icon, size = 132, ring = 'ink', label, labelSize, labelColor = C.ink, iconColor = C.ink, iconFill, iconScale = 0.6, dashed, opacity}) => {
  const ringColor = ring === 'ink' ? C.ink : ring === 'red' ? C.red : ring;
  const rw = Math.max(3, Math.round(size * 0.045));
  const is = size * iconScale;
  const k = is / 64;
  const ls = labelSize ?? Math.max(24, Math.round(size * 0.21));
  return (
    <div style={{...at(x, y), width: size, height: size, opacity}}>
      <div
        className={cls}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: C.black,
          boxShadow: `0 0 0 ${rw}px ${ringColor}, 0 12px 30px ${C.shadow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={is} height={is} viewBox="0 0 64 64" style={{display: 'block', overflow: 'visible'}}>
          <IconPrims name={icon} k={k} cls={`${cls}-ic`} color={iconColor} fill={iconFill} dashed={dashed} />
        </svg>
      </div>
      {label ? (
        <div style={{position: 'absolute', left: '50%', top: size + rw + ls * 0.45, transform: 'translateX(-50%)'}}>
          <div
            className={`${cls}-lbl`}
            style={{
              fontFamily: ANTON,
              fontSize: ls,
              lineHeight: 1.05,
              color: labelColor,
              letterSpacing: '0.07em',
              marginRight: '-0.07em',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              textShadow: `0 2px 10px ${C.shadow}`,
            }}
          >
            {label}
          </div>
        </div>
      ) : null}
    </div>
  );
};
