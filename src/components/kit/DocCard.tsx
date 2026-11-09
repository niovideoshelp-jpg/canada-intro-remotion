import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';
import {hash01} from './common';

/**
 * Documento abstrato (sem texto falso): papel com barras cinza no lugar das linhas, titulo REAL opcional
 * e uma frase destacada (`highlight`) numa linha propria, revelada pela passada do marcador vermelho.
 * (x, y) = centro. `rot` = inclinacao fixa do papel.
 * `highlight` aceita uma linha ou varias (['NO IMMEDIATE', 'MILITARY THREAT']): cada linha ganha sua passada.
 * Classes: `${cls}` (papel: docIn/slideIn/pop), `${cls}-ttl`, `${cls}-ln` (barras), `${cls}-hl-base` (frase
 * impressa), `${cls}-hl{i}-bar` + `${cls}-hl{i}-txt` (marcador da linha i: docHighlight(tl, q, cls, at)).
 */
export const DocCard: React.FC<{
  cls: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  title?: string;
  highlight?: string | readonly string[];
  /** numero de barras cinza (padrao 9) */
  lines?: number;
  /** a frase destacada entra depois desta barra (padrao 3) */
  hlAfter?: number;
  seed?: number;
  titleSize?: number;
  hlSize?: number;
  opacity?: number;
}> = ({cls, x, y, w = 560, h, rot = -3, title, highlight, lines = 9, hlAfter = 3, seed = 1, titleSize, hlSize, opacity}) => {
  const hh = h ?? Math.round(w * 1.3);
  const pad = w * 0.095;
  const innerW = w - pad * 2;
  const ts = titleSize ?? Math.round(w * 0.066);
  const hl = highlight === undefined ? [] : typeof highlight === 'string' ? [highlight] : highlight;
  const longest = Math.max(1, ...hl.map((s) => s.length));
  const hs = hlSize ?? Math.min(Math.round(w * 0.074), Math.floor(innerW / (longest * 0.5 + 0.6)));
  const fold = Math.round(w * 0.085);
  const bh = Math.max(8, Math.round(w * 0.019));
  const bgap = Math.round(w * 0.034);
  const bar = (i: number) => {
    const r = hash01(seed * 97 + i * 13.7);
    const endOfPara = (i + 1) % 4 === 0;
    const frac = endOfPara ? 0.42 + 0.22 * r : 0.84 + 0.16 * r;
    return <div key={`b${i}`} className={`${cls}-ln`} style={{width: innerW * frac, height: bh, marginTop: bgap, backgroundColor: C.land, opacity: 0.3, borderRadius: bh / 2}} />;
  };
  const hlText = (color: string): React.CSSProperties => ({
    fontFamily: ANTON,
    fontSize: hs,
    lineHeight: 1.06,
    color,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  });
  const hpx = hs * 0.26;
  const hpt = hs * 0.1;
  return (
    <div style={{...at(x, y), width: w, height: hh, opacity}}>
      <div style={{width: w, height: hh, transform: `rotate(${rot}deg)`}}>
        <div className={cls} style={{width: w, height: hh, filter: `drop-shadow(0px 18px 26px ${C.shadow}) drop-shadow(0px 2px 3px ${C.shadow})`}}>
          <div
            style={{
              position: 'relative',
              width: w,
              height: hh,
              backgroundColor: C.ink,
              borderRadius: 4,
              clipPath: `polygon(0 0, ${w - fold}px 0, ${w}px ${fold}px, ${w}px ${hh}px, 0 ${hh}px)`,
              padding: `${pad}px ${pad}px`,
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* orelha dobrada no canto */}
            <div style={{position: 'absolute', right: 0, top: 0, width: fold, height: fold, background: `linear-gradient(225deg, transparent 50%, ${C.inkSoft} 50%)`}} />
            <div style={{position: 'absolute', right: 0, top: 0, width: fold, height: fold, background: `linear-gradient(225deg, transparent 50%, ${C.land} 50%)`, opacity: 0.25}} />
            {title ? (
              <>
                <div style={{width: innerW, display: 'flex', justifyContent: 'center'}}>
                  <div
                    className={`${cls}-ttl`}
                    style={{
                      fontFamily: ANTON,
                      fontSize: ts,
                      lineHeight: 1.08,
                      color: C.black,
                      letterSpacing: '0.04em',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                      maxWidth: innerW,
                    }}
                  >
                    {title}
                  </div>
                </div>
                <div style={{width: innerW, height: 3, marginTop: w * 0.035, backgroundColor: C.black, opacity: 0.8}} />
                <div style={{width: innerW, height: 1.5, marginTop: 4, backgroundColor: C.black, opacity: 0.6}} />
              </>
            ) : (
              <div style={{width: innerW * 0.46, height: bh * 1.8, backgroundColor: C.land, opacity: 0.5, borderRadius: 2}} />
            )}
            {Array.from({length: Math.min(lines, hlAfter)}, (_, i) => bar(i))}
            {hl.map((line, i) => (
              <div
                key={`h${i}`}
                style={{
                  position: 'relative',
                  marginTop: i === 0 ? bgap * 1.4 : hs * 0.14,
                  marginBottom: i === hl.length - 1 ? bgap * 0.4 : 0,
                  marginLeft: -hpx,
                  padding: `${hpt}px ${hpx}px ${hs * 0.06}px`,
                }}
              >
                <div className={`${cls}-hl-base`} style={hlText(C.black)}>
                  {line}
                </div>
                <div className={`${cls}-hl${i}-bar`} style={{position: 'absolute', inset: 0, backgroundColor: C.red}} />
                <div style={{position: 'absolute', left: hpx, top: hpt}}>
                  <div className={`${cls}-hl${i}-txt`} style={hlText(C.ink)}>
                    {line}
                  </div>
                </div>
              </div>
            ))}
            {Array.from({length: Math.max(0, lines - hlAfter)}, (_, i) => bar(i + hlAfter))}
          </div>
        </div>
      </div>
    </div>
  );
};
