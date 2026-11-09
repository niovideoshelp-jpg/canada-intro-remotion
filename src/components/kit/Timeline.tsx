import React from 'react';
import {ANTON} from '../../fonts';
import {at} from '../../lib/pos';
import {C} from '../../theme';

export type TimelineMark = {
  /** ano (fracao permitida: dezembro de 2029 = 2029.92) */
  at: number;
  label: string;
  sub?: string;
  accent?: boolean;
  side?: 'top' | 'bottom';
  /** altura da haste em px (padrao 64 em cima, 96 embaixo) */
  stem?: number;
};
export type TimelineBand = {
  from: number;
  to: number;
  label?: string;
  sub?: string;
  accent?: boolean;
  /** fill = faixa sobre o eixo; bracket = colchete acima do eixo (ex. "YEARS AWAY") */
  style?: 'fill' | 'bracket';
  /** altura (px acima do eixo) do colchete / rotulo */
  lift?: number;
};

const lbl = (size: number, color: string, spacing = '0.05em'): React.CSSProperties => ({
  fontFamily: ANTON,
  fontSize: size,
  lineHeight: 1.05,
  color,
  letterSpacing: spacing,
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  textAlign: 'center',
  textShadow: `0 2px 10px ${C.shadow}`,
});

/**
 * Eixo horizontal de anos (`from`..`to`) com ticks, rotulos de ano, marcos, faixas e o marcador HOJE.
 * (x, y) = centro do eixo; `w` = largura. Classes: `${cls}-axis`/`${cls}-arw`/`${cls}-tk`/`${cls}-yr`
 * (timelineIn), `${cls}-m{i}-dot|stem|lbl` (timelineMark), `${cls}-b{i}-rect|brk|lbl` (timelineBand),
 * `${cls}-today` (timelineToday). Use `yearX(...)` para posicionar outras coisas sobre um ano.
 */
export const Timeline: React.FC<{
  cls: string;
  x: number;
  y: number;
  w?: number;
  from: number;
  to: number;
  marks?: TimelineMark[];
  bands?: TimelineBand[];
  today?: number;
  todayLabel?: string;
  /** 'all' | 'ends' | n (de n em n anos). Padrao: automatico pelo intervalo */
  labels?: 'all' | 'ends' | number;
  yearSize?: number;
  markSize?: number;
  color?: string;
  arrow?: boolean;
  opacity?: number;
}> = ({cls, x, y, w = 1400, from, to, marks = [], bands = [], today, todayLabel = 'TODAY', labels, yearSize = 30, markSize = 40, color = C.ink, arrow = true, opacity}) => {
  const X = (yr: number) => yearX(yr, from, to, w);
  const span = to - from;
  const every = labels === 'all' ? 1 : labels === 'ends' ? Infinity : typeof labels === 'number' ? labels : span <= 12 ? 1 : span <= 30 ? 5 : 10;
  const years = Array.from({length: Math.floor(span) + 1}, (_, i) => from + i);
  const bottomX = marks.filter((m) => m.side === 'bottom').map((m) => X(m.at));
  const labeled = (yr: number) => yr === from || yr === to || (every !== Infinity && (yr - from) % every === 0);
  // rotulo de ano escondido quando um marco de baixo cai em cima dele
  const showYear = (yr: number) => labeled(yr) && !bottomX.some((mx) => Math.abs(mx - X(yr)) < markSize * 1.7);
  const minorEvery = span > 40 ? 2 : 1;
  const sw = 3;
  return (
    <div style={{...at(x, y, '-50%', '0%'), width: w, height: 0, opacity}}>
      <svg width={w} height={600} viewBox={`0 -300 ${w} 600`} style={{position: 'absolute', left: 0, top: -300, overflow: 'visible'}}>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {bands.map((b, i) => {
            const x1 = X(b.from);
            const x2 = X(b.to);
            const col = b.accent ? C.red : color;
            if (b.style === 'bracket') {
              const h = b.lift ?? 70;
              return (
                <path
                  key={i}
                  className={`${cls}-b${i}-brk`}
                  d={`M${x1},${-h + 16} L${x1},${-h} L${x2},${-h} L${x2},${-h + 16}`}
                  stroke={col}
                  strokeWidth={4}
                />
              );
            }
            return <rect key={i} className={`${cls}-b${i}-rect`} x={x1} y={-9} width={x2 - x1} height={18} fill={col} fillOpacity={b.accent ? 0.9 : 0.38} rx={3} />;
          })}
          <path className={`${cls}-axis`} d={`M0,0 L${w},0`} stroke={color} strokeWidth={sw} />
          {arrow ? <path className={`${cls}-arw`} d={`M${w - 15},-11 L${w + 1},0 L${w - 15},11`} stroke={color} strokeWidth={sw} /> : null}
          {years.filter((yr) => labeled(yr) || (yr - from) % minorEvery === 0).map((yr) => {
            const big = labeled(yr);
            const t = big ? 11 : 6;
            return <path key={yr} className={`${cls}-tk`} d={`M${X(yr)},${-t} L${X(yr)},${t}`} stroke={color} strokeOpacity={big ? 0.95 : 0.6} strokeWidth={big ? sw : 2} />;
          })}
          {marks.map((m, i) => {
            const mx = X(m.at);
            const down = m.side === 'bottom';
            const st = m.stem ?? (down ? 96 : 64);
            return (
              <path
                key={i}
                className={`${cls}-m${i}-stem`}
                d={down ? `M${mx},14 L${mx},${st}` : `M${mx},-14 L${mx},${-st}`}
                stroke={m.accent ? C.red : color}
                strokeWidth={3}
              />
            );
          })}
          {marks.map((m, i) => (
            <circle key={i} className={`${cls}-m${i}-dot`} cx={X(m.at)} cy={0} r={9} fill={m.accent ? C.red : color} stroke={C.black} strokeWidth={3} />
          ))}
        </g>
      </svg>
      {years.filter(showYear).map((yr) => (
        <div key={yr} style={at(X(yr), 26, '-50%', '0%')}>
          <div className={`${cls}-yr`} style={lbl(yearSize, C.inkSoft, '0.03em')}>
            {yr}
          </div>
        </div>
      ))}
      {bands.map((b, i) =>
        b.label || b.sub ? (
          <div key={i} style={at((X(b.from) + X(b.to)) / 2, -(b.lift ?? (b.style === 'bracket' ? 70 : 24)) - 12, '-50%', '-100%')}>
            <div className={`${cls}-b${i}-lbl`} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              {b.label ? <div style={lbl(markSize * 0.85, b.accent ? C.red : color)}>{b.label}</div> : null}
              {b.sub ? <div style={{...lbl(markSize * 0.55, C.inkSoft, '0.1em'), marginTop: 4}}>{b.sub}</div> : null}
            </div>
          </div>
        ) : null,
      )}
      {marks.map((m, i) => {
        const down = m.side === 'bottom';
        const st = m.stem ?? (down ? 96 : 64);
        return (
          <div key={i} style={at(X(m.at), down ? st + 10 : -st - 10, '-50%', down ? '0%' : '-100%')}>
            <div className={`${cls}-m${i}-lbl`} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={lbl(markSize, m.accent ? C.red : color)}>{m.label}</div>
              {m.sub ? <div style={{...lbl(markSize * 0.55, C.inkSoft, '0.1em'), marginTop: 4}}>{m.sub}</div> : null}
            </div>
          </div>
        );
      })}
      {today !== undefined ? (
        <div style={at(X(today), 26, '-50%', '-100%')}>
          <div className={`${cls}-today`} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{backgroundColor: C.red, padding: '5px 12px 3px', boxShadow: `0 4px 14px ${C.shadow}`}}>
              <div style={{...lbl(30, C.ink, '0.08em'), textShadow: 'none', marginRight: '-0.08em'}}>{todayLabel}</div>
            </div>
            <div style={{width: 5, height: 74, backgroundColor: C.red, borderRadius: 2}} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** x local (0..w) de um ano dentro de um Timeline (para alinhar outras pecas; some x - w/2 para tela). */
export const yearX = (yr: number, from: number, to: number, w: number) => {
  const pad = w * 0.045;
  return pad + ((yr - from) / (to - from)) * (w - pad * 2);
};
