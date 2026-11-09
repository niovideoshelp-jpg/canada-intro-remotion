// 221.61–238.93  "Underwater, the situation is more difficult. Canada has four Victoria-class submarines, but in July
// 2026, Prime Minister Mark Carney himself said only one was able to go to sea. Low availability aside, the class also
// has limitations when it comes to operating under ice."
// O quadro "mergulha": a superficie com placas de gelo sobe e fica como teto; abaixo, agua escura com linhas de
// profundidade. O recorte do submarino classe Victoria (HMCS Corner Brook) e quatro icones, VICTORIA CLASS, contador 4.
// JULY 2026 / PRIME MINISTER MARK CARNEY: tres icones apagam, um fica aceso com anel vermelho e o contador vira 1. No
// fim o submarino sobe ate o teto de gelo e para: X vermelho no gelo.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Counter, gridCellCenter, Icon, PictogramGrid, Stamp, stepsAt, SvgLayer} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, slideIn, wipeText} from '../../../lib/tl';
import {gridIn, popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s16');

const SURF0 = 700; // superficie antes do mergulho
const SURF1 = 120; // depois (teto de gelo no alto do quadro)
const SLABS = Array.from({length: 12}, (_, i) => ({x: -40 + i * 168, w: 150 + (i % 3) * 12, h: 26 + ((i * 7) % 5) * 5}));
const SUBS = {x: 960, y: 900, n: 4, cols: 4, size: 120, cellW: 150, cellH: 64, gap: 40};
const LIT = 1; // o que continua disponivel
const SUB = {x: 960, y: 520, w: 1000};

export const P2S16: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s16-sub', L(T('difficult') - 0.35), -1600, 0, 1.0);
    wipeText(tl, q, '.p2s16-name', L(T('victoria') - 0.05), 0.5);
    gridIn(tl, q, 'p2s16-four', L(T('four') - 0.1), 0.1);
    fadeIn(tl, q, '.p2s16-num', L(T('four') - 0.1), 0.25);
    stampIn(tl, q, 'p2s16-jul', L(T('july') - STAMP_HIT));
    wipeText(tl, q, '.p2s16-pm', L(T('prime') - 0.05), 0.55);
    popSvg(tl, q, '.p2s16-ring', L(T('one') - 0.1));
    popSvg(tl, q, '.p2s16-x', L(T('under') - 0.05), 0, 0.36);
  });

  // o mergulho
  const dive = ramp(t, T('underwater') - 0.35, T('situation') + 0.3, inOutCubic);
  const surf = lerp(SURF0, SURF1, dive);
  // "only one": tres apagam
  const dimmed = (i: number) => i !== LIT && t > T('one') - 0.15 + i * 0.05;
  const n = stepsAt(t, 4, [{at: T('one') - 0.1, to: 1}], 0.35);
  // "operating under ice": as informacoes saem e o submarino sobe ate o teto
  const infoOut = ramp(t, T('limitations') - 0.6, T('limitations') - 0.1, inOutSine);
  const rise = ramp(t, T('limitations') - 0.3, T('under') - 0.05, inOutCubic);
  const subS = lerp(1, 0.62, rise);
  const subY = lerp(SUB.y, SURF1 + 130, rise);
  const [lx, ly] = gridCellCenter(LIT, SUBS);

  return (
    <AbsoluteFill ref={scope}>
      {/* agua, linhas de profundidade, superficie com gelo */}
      <SvgLayer>
        <defs>
          <linearGradient id="p2s16-deep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b0b0a" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0b0b0a" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <rect x={-40} y={surf} width={2000} height={1400} fill="url(#p2s16-deep)" />
        {[260, 520, 780, 1040].map((d, i) => (
          <path key={i} d={`M-40 ${surf + d} L1960 ${surf + d}`} stroke={C.ink} strokeOpacity={0.12} strokeWidth={2} strokeDasharray="18 14" />
        ))}
        <path d={`M-40 ${surf} L1960 ${surf}`} stroke={C.ink} strokeOpacity={0.7} strokeWidth={3} />
        {SLABS.map((s, i) => (
          <rect key={i} x={s.x} y={surf - s.h * 0.35} width={s.w} height={s.h} rx={3} fill="#E9EEF1" fillOpacity={0.92} stroke={C.black} strokeOpacity={0.35} strokeWidth={2} />
        ))}
      </SvgLayer>

      {/* o submarino */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${SUB.x}px ${SUB.y}px`, transform: `translate(0px, ${subY - SUB.y}px) scale(${subS}) rotate(0.03deg)`}}>
        <Sticker cls="p2s16-sub" src="img/victoria-sub.png" x={SUB.x} y={SUB.y} w={SUB.w} />
      </div>
      <SvgLayer>
        <g className="p2s16-x" style={{visibility: 'hidden'}}>
          <Icon name="cross" x={SUB.x + 60} y={SURF1 + 16} size={150} color={C.red} strokeW={12} />
        </g>
      </SvgLayer>

      {/* os quatro, a data e o nome */}
      <AbsoluteFill style={{opacity: 1 - infoOut}}>
        <div style={at(960, 300)}>
          <div className="p2s16-name" style={{fontFamily: ANTON, fontSize: 66, color: C.ink, letterSpacing: '0.06em', marginRight: '-0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
            Victoria class
          </div>
        </div>
        <SvgLayer>
          <PictogramGrid cls="p2s16-four" {...SUBS} icon="submarine" state={(i) => (dimmed(i) ? 'off' : 'on')} />
          <g className="p2s16-ring" style={{visibility: 'hidden'}}>
            <circle cx={lx} cy={ly} r={92} fill="none" stroke={C.red} strokeWidth={6} />
          </g>
        </SvgLayer>
        <Counter cls="p2s16-num" x={420} y={SUBS.y} value={n} digits={1} size={170} />
        <Stamp cls="p2s16-jul" x={1590} y={300} text="July 2026" size={70} />
        <MapLabel cls="p2s16-pm" x={1590} y={385} text="Prime Minister Mark Carney" size={36} color={C.ink} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('underwater') - 0.35, file: 'whoosh_big', vol: 0.16, dur: 1.4},
  {at: T('underwater') + 0.2, file: 'sonar_ping', vol: 0.1, dur: 2.6},
  {at: T('difficult') - 0.35, file: 'whoosh_soft2', vol: 0.12, dur: 1.0},
  {at: T('four') - 0.1, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('july') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('prime') - 0.1, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('one') - 0.1, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('limitations') - 0.3, file: 'sonar_ping', vol: 0.08, dur: 2.0, fadeOut: 0.6},
  {at: T('under') - 0.05, file: 'ice_crack', vol: 0.14, dur: 1.0, fadeOut: 0.4},
];
