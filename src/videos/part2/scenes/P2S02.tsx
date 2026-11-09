// 13.35–19.90  "It's still operating, but more advanced cruise missiles and hypersonic weapons are already testing its
// limits."
// Diagrama de perfil sobre a grade: a curva da Terra (giz), um radar a esquerda e o leque de cobertura dele, que so
// enxerga ate o horizonte (a borda de baixo do leque e a tangente a Terra). O missil de cruzeiro passa rente ao chao,
// POR BAIXO do leque; a arma hipersonica risca alto e rapido. No "limits" a borda do leque pisca vermelha uma vez.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Icon, MovingTrack, SvgLayer} from '../../../components/kit';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutSine, outCubic, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {wipeText} from '../../../lib/tl';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s02');

type P = [number, number];
// Terra: circulo enorme, topo em y = 780 no centro da tela
const O: P = [960, 3780];
const R = 3000;
const surf = (x: number) => O[1] - Math.sqrt(R * R - (x - O[0]) ** 2);
const EARTH_D = (() => {
  const pts = Array.from({length: 61}, (_, i) => -60 + i * 34).map((x) => `${x},${surf(x).toFixed(1)}`);
  return `M${pts.join(' L')}`;
})();

// radar e o leque: borda de baixo = tangente a Terra saindo da antena
const A: P = [300, surf(300) - 70];
const dOA = Math.hypot(O[0] - A[0], O[1] - A[1]);
const LOW = Math.atan2(O[1] - A[1], O[0] - A[0]) - Math.asin(R / dOA); // rad, ~ -2 graus (sobe um pouco)
const HIGH = (-24 * Math.PI) / 180;
const FAN_R = 1750;
const dir = (a: number, r: number): P => [A[0] + r * Math.cos(a), A[1] + r * Math.sin(a)];
const FAN_D = (() => {
  const [x0, y0] = dir(LOW, FAN_R);
  const [x1, y1] = dir(HIGH, FAN_R);
  return `M${A[0]},${A[1]} L${x0.toFixed(1)},${y0.toFixed(1)} A${FAN_R},${FAN_R} 0 0 0 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
})();
const EDGE_D = (() => {
  const [x0, y0] = dir(LOW, FAN_R);
  return `M${A[0]},${A[1]} L${x0.toFixed(1)},${y0.toFixed(1)}`;
})();

// trajetorias (da direita para a esquerda)
const CRUISE: P[] = Array.from({length: 70}, (_, i) => 1990 - i * 30).map((x) => [x, surf(x) - 26]);
const HYPER: P[] = (() => {
  const p0: P = [2010, 150];
  const c: P = [1250, 160];
  const p1: P = [-80, 700];
  return Array.from({length: 61}, (_, i) => {
    const u = i / 60;
    return [(1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]];
  });
})();

export const P2S02: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.p2s02-l1', L(T('missiles') - 0.1), 0.4);
    wipeText(tl, q, '.p2s02-l2', L(T('weapons') - 0.15), 0.4);
  });

  // o leque abre no "still operating"
  const fan = ramp(t, T('still') - 0.3, T('operating') + 0.2, outCubic);
  const pc = ramp(t, T('cruise') - 0.25, T('cruise') + 3.6, (x) => x); // devagar e constante
  const ph = ramp(t, T('hypersonic') - 0.05, T('hypersonic') + 0.95, inOutSine); // rapido
  const flash = Math.sin(Math.PI * ramp(t, T('limits') - 0.15, T('limits') + 0.55));
  const edge = flash > 0.01 ? C.red : C.ink;
  const live = (p: number) => p > 0.002 && p < 0.995;
  // ondas do radar (deterministicas pelo tempo)
  const waves = [0, 1, 2].map((k) => {
    const u = (t - (T('still') - 0.2)) / 1.6 - k / 3;
    if (u < 0) return null;
    return u - Math.floor(u);
  });

  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        <defs>
          <clipPath id="p2s02-fan">
            <path d={FAN_D} />
          </clipPath>
        </defs>
        {/* Terra */}
        <path d={`${EARTH_D} L2000,1200 L-80,1200 Z`} fill={C.landDark} />
        <path d={EARTH_D} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        {/* leque de cobertura */}
        <g transform={`translate(${A[0]} ${A[1]}) scale(${fan}) translate(${-A[0]} ${-A[1]})`} opacity={fan > 0.001 ? 1 : 0}>
          <path d={FAN_D} fill={C.ink} fillOpacity={0.1 + 0.08 * flash} stroke={edge} strokeOpacity={0.45 + 0.55 * flash} strokeWidth={2.5 + 3 * flash} strokeLinejoin="round" />
          <g clipPath="url(#p2s02-fan)">
            {waves.map((w, k) =>
              w === null ? null : <circle key={k} cx={A[0]} cy={A[1]} r={40 + w * (FAN_R - 40)} fill="none" stroke={C.ink} strokeOpacity={(1 - w) * 0.5} strokeWidth={3} strokeDasharray="12 10" />,
            )}
          </g>
          <path d={EDGE_D} fill="none" stroke={edge} strokeOpacity={0.6 + 0.4 * flash} strokeWidth={3 + 3 * flash} strokeDasharray="14 10" />
        </g>
        {/* o radar */}
        <Icon name="radarDome" x={A[0]} y={surf(A[0]) - 60} size={150} color={C.black} fill={C.ink} shadow />
        {/* missil de cruzeiro: rente ao chao, por baixo do leque */}
        <MovingTrack pts={CRUISE} smooth={false} progress={pc} color={C.red} width={3.4} dash={[12, 9]} icon="missile" iconSize={70} iconColor={C.black} iconFill={C.red} orient="rotate" head={live(pc)} />
        {/* hipersonico: alto, rapido, cauda curta */}
        <MovingTrack pts={HYPER} smooth={false} progress={ph} color={C.red} width={4} dash={null} tail={520} icon="missile" iconSize={70} iconColor={C.black} iconFill={C.ink} orient="rotate" head={live(ph)} />
      </SvgLayer>
      <Lbl cls="p2s02-l1" x={1330} y={890} text="Cruise missiles" />
      <Lbl cls="p2s02-l2" x={1420} y={110} text="Hypersonic weapons" />
    </AbsoluteFill>
  );
};

const Lbl: React.FC<{cls: string; x: number; y: number; text: string}> = ({cls, x, y, text}) => (
  <div style={at(x, y)}>
    <div className={cls} style={{fontFamily: ANTON, fontSize: 50, color: C.ink, letterSpacing: '0.07em', marginRight: '-0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
      {text}
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: T('still') - 0.3, file: 'whoosh_soft2', vol: 0.12, dur: 1.0},
  {at: T('cruise') - 0.25, file: 'whoosh_soft', vol: 0.16, dur: 1.2},
  {at: T('hypersonic') - 0.05, file: 'whoosh_big', vol: 0.22, dur: 1.4},
  {at: T('limits') - 0.15, file: 'marker_swipe', vol: 0.12, dur: 0.6},
];
