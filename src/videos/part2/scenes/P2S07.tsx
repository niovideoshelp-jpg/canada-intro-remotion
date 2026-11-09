// 79.69–96.72  "The system uses refraction in the ionosphere to bend radar signals, allowing it to see beyond the range of
// conventional radar and provide more time to react. But its initial capability isn't expected until December 2029.
// For now, it's an improvement still in the works."
// Diagrama de perfil: a curva da Terra (giz), a IONOSFERA como faixa la no alto, o transmissor a esquerda. O feixe
// vermelho sobe, dobra na ionosfera e desce muito alem do horizonte, onde um bombardeiro (ancora #2) acende. O radar
// convencional (giz) sai reto e passa por cima dele. Duas barras: tempo para reagir (curto x longo). No "December" o
// diagrama sobe e encolhe e uma linha do tempo marca DEC 2029; no "works" o feixe vira tracejado (ainda em obra).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Icon, Pulse, StatBar, SvgLayer, Timeline} from '../../../components/kit';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, outCubic, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, wipeText} from '../../../lib/tl';
import {popSvg, pulseOnce, timelineIn, timelineMark, timelineToday} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s07');

type P = [number, number];
// Terra mais curva que na cena 2, para o horizonte ficar evidente
const O: P = [960, 2600];
const R = 1800;
const surf = (x: number) => O[1] - Math.sqrt(R * R - (x - O[0]) ** 2);
const EARTH_D = `M${Array.from({length: 61}, (_, i) => -60 + i * 34)
  .map((x) => `${x},${surf(x).toFixed(1)}`)
  .join(' L')}`;
const A: P = [250, surf(250) - 62]; // antena
const dOA = Math.hypot(O[0] - A[0], O[1] - A[1]);
const TAN = Math.atan2(O[1] - A[1], O[0] - A[0]) - Math.asin(R / dOA); // direcao tangente (horizonte)
const CONV_END: P = [A[0] + 1900 * Math.cos(TAN), A[1] + 1900 * Math.sin(TAN)];
// alvo alem do horizonte, voando baixo
const TGT: P = [1560, surf(1560) - 74];
// feixe OTH: sobe, dobra na ionosfera, desce no alvo
const ION_Y = 205;
const BEND: P = [930, ION_Y + 6];
const OTH_D = `M${A[0]},${A[1]} L${BEND[0] - 120},${BEND[1] + 34} Q${BEND[0]},${BEND[1] - 22} ${BEND[0] + 120},${BEND[1] + 36} L${TGT[0]},${TGT[1] - 18}`;

export const P2S07: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    fadeIn(tl, q, '.p2s07-ion', L(T('ionosphere') - 0.4), 0.6);
    wipeText(tl, q, '.p2s07-ion-l', L(T('ionosphere') - 0.1), 0.45);
    draw(tl, q, '.p2s07-oth', L(T('refraction') - 0.1), 1.9, 'power1.inOut');
    popSvg(tl, q, '.p2s07-tgt', L(T('beyond') - 0.25));
    pulseOnce(tl, q, 'p2s07-hit', L(T('beyond') - 0.05), 1.0);
    draw(tl, q, '.p2s07-conv', L(T('conventional') - 0.25), 0.9, 'power2.out');
    wipeText(tl, q, '.p2s07-conv-l', L(T('conventional') + 0.15), 0.45);
    timelineIn(tl, q, 'p2s07-tl', L(T('december') - 0.45), 0.8);
    timelineToday(tl, q, 'p2s07-tl', L(T('december') + 0.1));
    timelineMark(tl, q, 'p2s07-tl', 0, L(T('2029') - 0.1));
  });

  // tempo para reagir: barras crescem no "more time to react"
  const bars = ramp(t, T('provide') - 0.1, T('react') + 0.2, outCubic);
  const barsIn = ramp(t, T('provide') - 0.45, T('provide') - 0.05, inOutSine);
  const barsOut = ramp(t, T('december') - 0.8, T('december') - 0.3, inOutSine);
  // o diagrama sobe e encolhe para a linha do tempo
  const up = ramp(t, T('december') - 0.8, T('december') + 0.1, inOutCubic);
  // "still in the works": o feixe solido da lugar ao tracejado
  const works = ramp(t, T('works') - 0.45, T('works') + 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 40px', transform: `translate(0px, ${lerp(0, 10, up)}px) scale(${lerp(1, 0.6, up)}) rotate(0.03deg)`}}>
        <SvgLayer>
          {/* ionosfera */}
          <g className="p2s07-ion">
            <rect x={-80} y={ION_Y - 50} width={2080} height={64} fill={C.ink} fillOpacity={0.07} />
            <path d={`M-80 ${ION_Y - 50} L2000 ${ION_Y - 50} M-80 ${ION_Y + 14} L2000 ${ION_Y + 14}`} stroke={C.ink} strokeOpacity={0.4} strokeWidth={2} strokeDasharray="14 10" fill="none" />
          </g>
          {/* Terra */}
          <path d={`${EARTH_D} L2000,1900 L-80,1900 Z`} fill={C.landDark} />
          <path d={EARTH_D} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          {/* radar convencional: reto, passa por cima do alvo */}
          <path className="p2s07-conv" d={`M${A[0]},${A[1]} L${CONV_END[0].toFixed(1)},${CONV_END[1].toFixed(1)}`} fill="none" stroke={C.ink} strokeOpacity={0.85} strokeWidth={5} strokeLinecap="round" />
          {/* feixe OTH: solido, e tracejado no fim ("em obra") */}
          <g opacity={1 - works}>
            <path d={OTH_D} fill="none" stroke={C.red} strokeOpacity={0.25} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" className="p2s07-oth" />
            <path d={OTH_D} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" className="p2s07-oth" />
          </g>
          <path d={OTH_D} opacity={works} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20 16" />
          {/* alvo */}
          <Pulse cls="p2s07-hit" cx={TGT[0]} cy={TGT[1]} r0={20} r1={120} color={C.red} width={4} />
          <g className="p2s07-tgt">
            <Icon name="bomberSide" x={TGT[0]} y={TGT[1]} size={120} color={C.black} fill={C.red} flip shadow />
          </g>
          {/* transmissor */}
          <Icon name="antenna" x={A[0]} y={A[1] + 4} size={130} color={C.black} fill={C.ink} shadow />
        </SvgLayer>
        <Lbl cls="p2s07-ion-l" x={1560} y={ION_Y - 92} text="Ionosphere" size={48} color={C.ink} />
        <Lbl cls="p2s07-conv-l" x={1160} y={A[1] + Math.tan(TAN) * (1160 - A[0]) - 46} text="Conventional radar" size={40} color={C.ink} rot={(TAN * 180) / Math.PI} />
      </div>

      {/* tempo para reagir */}
      <div style={{position: 'absolute', inset: 0, opacity: barsIn * (1 - barsOut)}}>
        <StatBar cls="p2s07-b1" x={760} y={930} w={760} h={30} value={0.24 * bars} label="Conventional" labelPos="left" labelSize={36} color={C.ink} />
        <StatBar cls="p2s07-b2" x={760} y={1000} w={760} h={30} value={0.88 * bars} label="Over-the-horizon" labelPos="left" labelSize={36} />
      </div>

      <Timeline
        cls="p2s07-tl"
        x={960}
        y={830}
        w={1440}
        from={2026}
        to={2030}
        today={2026}
        labels="all"
        marks={[{at: 2029.92, label: 'Dec 2029', sub: 'Initial capability', accent: true, side: 'top'}]}
      />
    </AbsoluteFill>
  );
};

const Lbl: React.FC<{cls: string; x: number; y: number; text: string; size: number; color: string; rot?: number}> = ({cls, x, y, text, size, color, rot = 0}) => (
  <div style={{...at(x, y), transform: `${at(x, y).transform} rotate(${rot}deg)`}}>
    <div className={cls} style={{fontFamily: ANTON, fontSize: size, color, letterSpacing: '0.08em', marginRight: '-0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
      {text}
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: T('refraction') - 0.1, file: 'whoosh_soft', vol: 0.16, dur: 1.2},
  {at: T('beyond') - 0.05, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('conventional') - 0.25, file: 'whoosh_soft2', vol: 0.12, dur: 1.0},
  {at: T('provide') - 0.1, file: 'riser', vol: 0.06, dur: 1.4, fadeIn: 0.2, fadeOut: 0.5},
  {at: T('december') - 0.45, file: 'pen_scribble', vol: 0.1, dur: 0.8, fadeOut: 0.3},
  {at: T('december') + 0.1 + 0.14 - 0.008, file: 'stamp', vol: 0.22, dur: 0.6},
  {at: T('2029') - 0.1, file: 'marker_swipe', vol: 0.16, dur: 0.6},
];
