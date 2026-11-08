// 45.55–51.10  "Its population is simply too small to support a massive, truly powerful military."
// Cada boneco = 10 milhoes de pessoas. Canada (41 mi) contra os dois gigantes do Artico:
// Russia (144 mi) e EUA (340 mi). Um circulo a mao marca o quao pequeno e o Canada.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Person} from '../components/Icons';
import {ANTON} from '../fonts';
import '../gsap';
import {inOutSine, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, wipeText} from '../lib/tl';
import {C, H, W} from '../theme';
import {W as T} from '../timing';

const ICON_H = 60;
const ICON_W = ICON_H * 0.4;
const STEP = ICON_W + 6;
const X0 = 520;

type Row = {key: string; name: string; millions: number; y: number; color: string; at: number; each: number};
const ROWS: Row[] = [
  {key: 'can', name: 'Canada', millions: 41, y: 330, color: C.red, at: T.itsPopulation + 0.05, each: 0.07},
  {key: 'rus', name: 'Russia', millions: 144, y: 540, color: C.ink, at: 46.55, each: 0.035},
  {key: 'usa', name: 'USA', millions: 340, y: 750, color: C.ink, at: 46.95, each: 0.024},
];

const icons = (r: Row) => {
  const full = Math.floor(r.millions / 10);
  const frac = r.millions / 10 - full;
  return {full, frac};
};

export const S10Population: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    for (const r of ROWS) {
      wipeText(tl, q, `.s10-name-${r.key}`, L(r.at - 0.12), 0.4);
      const els = q(`.s10-ic-${r.key}`);
      tl.fromTo(els, {scale: 0, transformOrigin: '50% 100%'}, {scale: 1, duration: 0.3, ease: 'back.out(1.8)', stagger: r.each}, L(r.at));
      const end = r.at + r.each * els.length + 0.1;
      wipeText(tl, q, `.s10-num-${r.key}`, L(end), 0.35);
    }
    draw(tl, q, '.s10-circle', L(T.small - 0.1), 0.55, 'power2.inOut');
  });

  // empurrao lento de camera em direcao ao Canada no "massive, truly powerful military"
  const s = 1 + 0.11 * ramp(t, 45.4, 51.3, inOutSine); // uma rampa so: sem parada brusca no meio
  const can = ROWS[0];
  const canW = (Math.floor(can.millions / 10) + 1) * STEP;

  return (
    <AbsoluteFill ref={scope} style={{transform: `scale(${s}) rotate(0.03deg)`, transformOrigin: '36% 36%'}}>
      {ROWS.map((r) => (
        <div
          key={r.key}
          className={`s10-name-${r.key}`}
          style={{
            position: 'absolute',
            left: X0 - 40,
            top: r.y + ICON_H / 2,
            transform: 'translate(-100%, -50%)',
            fontFamily: ANTON,
            fontSize: 58,
            letterSpacing: '0.06em',
            color: r.key === 'can' ? C.ink : C.inkSoft,
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {r.name}
        </div>
      ))}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {ROWS.map((r) => {
          const {full, frac} = icons(r);
          const n = full + (frac > 0.05 ? 1 : 0);
          return (
            <g key={r.key}>
              {Array.from({length: n}, (_, i) => (
                <g key={i} className={`s10-ic-${r.key}`}>
                  <Person x={X0 + i * STEP} y={r.y} h={ICON_H} fill={r.color} clipW={i === full ? frac : undefined} />
                </g>
              ))}
            </g>
          );
        })}
        <ellipse
          className="s10-circle"
          cx={X0 + canW / 2 - 4}
          cy={can.y + ICON_H / 2}
          rx={canW / 2 + 26}
          ry={ICON_H / 2 + 34}
          fill="none"
          stroke={C.red}
          strokeWidth={5}
          strokeLinecap="round"
          transform={`rotate(-4 ${X0 + canW / 2} ${can.y + ICON_H / 2})`}
        />
      </svg>
      {ROWS.map((r) => {
        const n = Math.ceil(r.millions / 10 - 0.05);
        return (
          <div
            key={r.key}
            className={`s10-num-${r.key}`}
            style={{
              position: 'absolute',
              left: X0 + n * STEP + 26 + (r.key === 'can' ? 52 : 0),
              top: r.y + ICON_H / 2,
              transform: 'translate(0, -50%)',
              fontFamily: ANTON,
              fontSize: 64,
              color: r.key === 'can' ? C.red : C.ink,
              lineHeight: 1,
              textShadow: '0 3px 14px rgba(0,0,0,0.5)',
            }}
          >
            {r.millions}M
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
