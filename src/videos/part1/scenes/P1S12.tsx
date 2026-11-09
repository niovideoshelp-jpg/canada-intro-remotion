// 141.11–157.56  "A country can have the ability to strike Canada without being in the middle of planning an invasion of
// its islands. The main concern is aircraft and naval forces capable of launching long-range weapons. In a wider war,
// the Arctic could become a route for attacks on other parts of North America."
// A Russia segue pintada (vem da cena anterior). Dois misseis (giz) cruzam o Artico e atingem Ottawa e Toronto; a seta
// de "invasao" das ilhas leva um X. Bombardeiros, navio e submarino aparecem FORA do Canada, sobre o oceano, e disparam
// de longe. Na "route" a camera abre ate os EUA: o corredor do Artico acende e novos misseis seguem para o sul.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {Icon, MovingTrack, Pulse} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintPath} from '../../../components/Paint';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR, polarCountry} from '../../../data/maps';
import {POLAR2, polarPoint, polarProject} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw} from '../../../lib/tl';
import {popSvg, pulseOnce} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s11');

type P = [number, number];
const RUS = polarCountry(POLAR.ids.russia)!;
const ARCS = POLAR2.strikeArcs;
const arc = (to: string) => ARCS.find((a) => a.to === to)!;
const quad = (a: P, b: P, bow: number, n = 48): P[] => {
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bow;
  const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow;
  return Array.from({length: n + 1}, (_, i) => {
    const u = i / n;
    return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]];
  });
};

// 1) "strike Canada": do litoral russo ate Ottawa e Toronto
const HIT_CA = [arc('Ottawa'), arc('Toronto')];
// 2) plataformas sobre o oceano (fora do Canada) e os seus alvos
const PLATFORMS: {icon: 'bomber' | 'ship' | 'submarine'; p: P; to: P; bow: number; rot: number}[] = [
  {icon: 'bomber', p: polarProject(40, 84.5) as P, to: polarPoint('Yellowknife') as P, bow: 0.08, rot: 205},
  {icon: 'bomber', p: polarProject(95, 83) as P, to: polarPoint('Inuvik') as P, bow: 0.06, rot: 230},
  {icon: 'ship', p: polarProject(3, 71) as P, to: polarPoint('Goose Bay') as P, bow: -0.1, rot: 0},
  {icon: 'submarine', p: polarProject(-2, 76.5) as P, to: polarPoint('Iqaluit') as P, bow: -0.08, rot: 0},
];
const LONG = PLATFORMS.map((pl) => quad(pl.p, pl.to, pl.bow));
// 3) "route": o resto da America do Norte
const HIT_US = [arc('Washington'), arc('New York'), arc('Chicago')];
const CORRIDOR = arc('Ottawa').d;
const RESOLUTE = polarPoint('Resolute');
const INV_FROM: P = [RESOLUTE[0] - 70, RESOLUTE[1] - 185];
const INV_TO: P = [RESOLUTE[0] - 6, RESOLUTE[1] - 50];

const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

const KEYS: CamKey[] = [
  {t: 140.8, x: 1010, y: 650, s: 1.28, r: -6},
  {t: 145.0, x: 990, y: 630, s: 1.36, r: -6, ease: inOutSine},
  {t: 146.6, x: 975, y: 600, s: 1.55, r: -7, ease: inOutCubic}, // "invasion of its islands"
  {t: 148.3, x: 1000, y: 590, s: 1.3, r: -6, ease: inOutCubic}, // plataformas
  {t: 152.6, x: 1005, y: 610, s: 1.32, r: -6, ease: inOutSine},
  {t: 155.0, x: 1010, y: 680, s: 1.04, r: -5, ease: inOutCubic}, // "route ... North America"
  {t: 157.9, x: 1012, y: 685, s: 1.0, r: -5, ease: inOutSine},
];

// tempos (s globais) de cada voo
const FLY_CA = [T('strike') - 0.25, T('strike') + 0.05];
const FLY_LONG = PLATFORMS.map((_, k) => T('long') - 0.25 + k * 0.14);
const FLY_US = [0, 1, 2].map((k) => T('route') - 0.2 + k * 0.16);
const DUR = 1.3;

export const P1S12: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    FLY_CA.forEach((s, k) => pulseOnce(tl, q, `p1s12-hc${k}`, L(s + DUR - 0.05), 0.9));
    draw(tl, q, '.p1s12-inv-c', L(T('invasion') - 0.4), 0.55, 'power2.out');
    draw(tl, q, '.p1s12-inv-h', L(T('invasion') + 0.12), 0.16, 'none');
    popSvg(tl, q, '.p1s12-x', L(T('islands') - 0.05), 0, 0.36);
    PLATFORMS.forEach((pl, k) => popSvg(tl, q, `.p1s12-pl${k}`, L((pl.icon === 'bomber' ? T('aircraft') : T('naval')) - 0.12 + (k % 2) * 0.16)));
    FLY_LONG.forEach((s, k) => pulseOnce(tl, q, `p1s12-hl${k}`, L(s + DUR - 0.05), 0.8));
    draw(tl, q, '.p1s12-corr', L(T('route') - 0.35), 1.1, 'power1.inOut');
    FLY_US.forEach((s, k) => pulseOnce(tl, q, `p1s12-hu${k}`, L(s + DUR - 0.05), 0.9));
  });

  const fly = (s: number) => ramp(t, s, s + DUR, inOutSine);
  // a ogiva so existe em voo (antes do disparo ela ficaria parada na origem)
  const live = (p: number) => p > 0.002 && p < 0.995;
  // o Canada atingido fica um pouco mais escuro enquanto o resto da America do Norte acende
  const usHi = ramp(t, T('north') - 0.4, T('america') + 0.3, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <PolarBase highlight={{[POLAR.ids.usa]: mix('#3B3A37', '#8E8981', usHi)}} />
        <PaintPath id="p1s12-ru" d={RUS.d} settled />
        <Layers />
        {HIT_CA.map((a, k) => (
          <MovingTrack key={`ca${k}`} pts={a.pts} progress={fly(FLY_CA[k])} color={C.ink} width={3.2} dash={[10, 7]} icon="missile" iconSize={56} iconColor={C.black} iconFill={C.ink} orient="rotate" head={live(fly(FLY_CA[k]))} />
        ))}
        {LONG.map((pts, k) => (
          <MovingTrack key={`l${k}`} pts={pts} smooth={false} progress={fly(FLY_LONG[k])} color={C.ink} width={2.6} dash={[7, 6]} icon="missile" iconSize={48} iconColor={C.black} iconFill={C.ink} orient="rotate" head={live(fly(FLY_LONG[k]))} />
        ))}
        {HIT_US.map((a, k) => (
          <MovingTrack key={`us${k}`} pts={a.pts} progress={fly(FLY_US[k])} color={C.ink} width={3.2} dash={[10, 7]} icon="missile" iconSize={56} iconColor={C.black} iconFill={C.ink} orient="rotate" head={live(fly(FLY_US[k]))} />
        ))}
        {HIT_CA.map((a, k) => (
          <Pulse key={`pc${k}`} cls={`p1s12-hc${k}`} cx={a.pts[a.pts.length - 1][0]} cy={a.pts[a.pts.length - 1][1]} r0={4} r1={38} color={C.ink} width={3} />
        ))}
        {LONG.map((pts, k) => (
          <Pulse key={`pl${k}`} cls={`p1s12-hl${k}`} cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r0={4} r1={32} color={C.ink} width={2.6} />
        ))}
        {HIT_US.map((a, k) => (
          <Pulse key={`pu${k}`} cls={`p1s12-hu${k}`} cx={a.pts[a.pts.length - 1][0]} cy={a.pts[a.pts.length - 1][1]} r0={4} r1={38} color={C.ink} width={3} />
        ))}
      </MapSvg>
    </AbsoluteFill>
  );
};

const Layers: React.FC = () => {
  const px = usePx();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* o Artico como corredor: faixa larga (unidades do mapa) por baixo das trajetorias */}
      <path className="p1s12-corr" d={CORRIDOR} stroke={C.red} strokeOpacity={0.22} strokeWidth={120} />
      {/* "invasao" das ilhas: seta de giz + X */}
      <HandArrow cls="p1s12-inv" from={INV_FROM} to={INV_TO} bow={0.14} color={C.ink} width={px(5)} />
      <g className="p1s12-x">
        <Icon name="cross" x={(INV_FROM[0] + INV_TO[0]) / 2 + 10} y={(INV_FROM[1] + INV_TO[1]) / 2} size={px(84)} color={C.red} strokeW={9} />
      </g>
      {PLATFORMS.map((pl, k) => (
        <g key={k} className={`p1s12-pl${k}`}>
          <Icon name={pl.icon} x={pl.p[0]} y={pl.p[1]} size={px(pl.icon === 'bomber' ? 74 : 84)} color={C.black} fill={C.ink} rot={pl.rot} shadow />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: FLY_CA[0], file: 'whoosh_big', vol: 0.2, dur: 1.5},
  {at: FLY_CA[0] + DUR - 0.05, file: 'boom', vol: 0.16, dur: 1.8, fadeOut: 0.7},
  {at: T('invasion') - 0.4, file: 'pen_scribble', vol: 0.12, dur: 0.9, fadeOut: 0.3},
  {at: T('islands') - 0.05 - 0.07, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('aircraft') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('naval') - 0.12, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: FLY_LONG[0], file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: FLY_LONG[0] + DUR, file: 'boom', vol: 0.12, dur: 1.6, fadeOut: 0.6},
  {at: T('route') - 0.35, file: 'whoosh_big', vol: 0.18, dur: 1.5},
  {at: FLY_US[0] + DUR - 0.05, file: 'boom', vol: 0.16, dur: 2.4, fadeOut: 1.0},
];
