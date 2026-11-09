// 317.83–352.12  (storyboard P2S22 + P2S23, uma cena so)
// "The difficulty of sustaining these operations is clear at Nanisivik, the naval facility on northern Baffin Island.
// In May 2026, the Defense Department announced that it was taking the site out of operational use. Its very short
// seasonal operating window, construction problems, delays and expensive dock repairs had reduced its usefulness. The
// government said the range of the Harry DeWolf-class ships, together with other refueling options, would allow
// operations to continue without any loss of capability. Even so, the case shows how an Arctic construction project can
// fall short of expectations."
// Mapa: a camera mergulha no norte da ilha de Baffin; pino NANISIVIK, BAFFIN ISLAND; carimbo MAY 2026 e o pino fica cinza
// com um X ("out of operational use"). A tira de meses mostra so uma fresta no fim do verao; tres discos: obra, atrasos,
// reparos do cais. Depois a camera recua: um DeWolf (ancora #3) faz o caminho Halifax -> arquipelago e volta, sem
// passar pelo pino cinza, com dois pontos de combustivel; check no "capability". No fim, duas barras: EXPECTED x DELIVERED.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Icon, IconBadge, IconHtml, MovingTrack, StatBar, Stamp} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import {CA2, caLabel, caPlace} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, outCubic, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, pop, slideIn, wipeText} from '../../../lib/tl';
import {popIn, popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s22');

type P = [number, number];
const NAN = caPlace('Nanisivik');
const BAFFIN = caLabel('Baffin Island');
// o caminho do DeWolf: Halifax -> Lancaster Sound e de volta (a rota nao entra no Admiralty Inlet de Nanisivik)
const LANE = CA2.seaLanes.halifaxToResolute.pts as readonly P[];
const LOOP: P[] = [...LANE.slice(0, Math.floor(LANE.length * 0.92)), ...[...LANE.slice(0, Math.floor(LANE.length * 0.92))].reverse().map(([x, y]) => [x + 10, y + 8] as P)];
const FUEL: P[] = [caPlace('Iqaluit') as P, [1196, 408]];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const ISSUES = [
  {cls: 'p2s22-con', word: 'construction', icon: 'crane', label: 'Construction', y: 300},
  {cls: 'p2s22-del', word: 'delays', icon: 'clock', label: 'Delays', y: 520},
  {cls: 'p2s22-rep', word: 'repairs', icon: 'money', label: 'Dock repairs', y: 740},
] as const;

const KEYS: CamKey[] = [
  {t: 317.6, x: 1010, y: 430, s: 1.3, r: 0},
  {t: 320.6, x: 1000, y: 420, s: 1.36, r: 0, ease: inOutSine},
  {t: 322.4, x: 958, y: 340, s: 3.3, r: 0, ease: inOutCubic}, // mergulha em Nanisivik
  {t: 330.2, x: 962, y: 342, s: 3.45, r: 0, ease: inOutSine},
  {t: 331.4, x: 900, y: 352, s: 2.7, r: 0, ease: inOutCubic}, // abre espaco para os discos a direita
  {t: 337.8, x: 902, y: 354, s: 2.75, r: 0, ease: inOutSine},
  {t: 339.6, x: 1160, y: 560, s: 1.2, r: 0, ease: inOutCubic}, // "range": Halifax -> arquipelago
  {t: 352.4, x: 1150, y: 552, s: 1.26, r: 0, ease: inOutSine},
];

export const P2S22: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    pop(tl, q, '.p2s22-pin', L(T('nanicevic') - 0.1));
    wipeText(tl, q, '.p2s22-nan', L(T('nanicevic') + 0.05), 0.5);
    wipeText(tl, q, '.p2s22-baf', L(T('baffin') - 0.05), 0.45);
    tl.to(q('.p2s22-baf'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('short') - 0.4)); // abre espaco para os discos
    stampIn(tl, q, 'p2s22-may', L(T('may') - STAMP_HIT));
    pop(tl, q, '.p2s22-x', L(T('operational') - 0.1));
    fadeIn(tl, q, '.p2s22-cal', L(T('short') - 0.2), 0.4);
    ISSUES.forEach((it) => popIn(tl, q, it.cls, L(T(it.word) - 0.12)));
    // "range": o painel de problemas sai, o navio entra
    tl.to(q('.p2s22-cal, .p2s22-may, .p2s22-con, .p2s22-del, .p2s22-rep, .p2s22-con-lbl, .p2s22-del-lbl, .p2s22-rep-lbl'), {autoAlpha: 0, duration: 0.45, ease: 'power1.in'}, L(T('government') - 0.3));
    slideIn(tl, q, '.p2s22-dw', L(T('harry') - 0.3), -900, 0, 0.7);
    FUEL.forEach((_, i) => popSvg(tl, q, `.p2s22-f${i}`, L(T('refueling') - 0.1 + i * 0.15)));
    popSvg(tl, q, '.p2s22-ok', L(T('capability') - 0.1));
    // "fall short of expectations"
    fadeIn(tl, q, '.p2s22-bars', L(T('case') - 0.3), 0.4);
    tl.to(q('.p2s22-dw'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('case') - 0.3));
  });

  const closed = t > T('operational') - 0.1;
  const run = ramp(t, T('range') - 0.2, T('capability') + 0.2, inOutSine);
  const live = (p: number) => p > 0.002 && p < 0.995;
  const months = ramp(t, T('short') - 0.1, T('window') + 0.1, inOutSine);
  const dim = 0.6 * ramp(t, T('case') - 0.4, T('case') + 0.1, inOutSine);
  const exp = ramp(t, T('construction', 2) - 0.3, T('project') + 0.2, outCubic);
  const got = 0.32 * ramp(t, T('fall') - 0.2, T('short', 2) + 0.4, outCubic);
  const [nx, ny] = toScreen(NAN, cam);
  const [bx, by] = toScreen(BAFFIN, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <MovingTrack pts={LOOP} smooth={false} progress={run} color={C.ink} width={3} dash={[6, 4.5]} icon="shipTop" iconSize={64} iconColor={C.black} iconFill={C.red} head={live(run)} />
        <MapMarks />
      </MapSvg>

      {/* o pino de Nanisivik: vermelho, depois cinza com um X */}
      <div style={at(nx, ny - 40)}>
        <div className="p2s22-pin">
          <IconHtml name="pin" x={0} y={0} size={96} color={C.black} fill={closed ? '#77736c' : C.red} />
        </div>
      </div>
      <div style={at(nx, ny - 46)}>
        <div className="p2s22-x" style={{visibility: 'hidden'}}>
          <IconHtml name="cross" x={0} y={0} size={150} color={C.red} strokeW={12} shadow />
        </div>
      </div>
      <MapLabel cls="p2s22-nan" x={nx} y={ny + 46} text="Nanisivik" size={52} color={C.ink} />
      <MapLabel cls="p2s22-baf" x={bx + 40} y={by + 60} text="Baffin Island" size={40} color={C.inkSoft} />
      <Stamp cls="p2s22-may" x={560} y={190} text="May 2026" size={72} />

      {/* a janela de operacao: so uma fresta no fim do verao */}
      <div style={at(760, 975)}>
        <div className="p2s22-cal" style={{display: 'flex', gap: 10, fontFamily: ANTON, fontSize: 34, visibility: 'hidden'}}>
          {MONTHS.map((m, i) => {
            const k = i === 7 ? months : i === 8 ? months * 0.55 : 0;
            return (
              <div
                key={i}
                style={{
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  color: k > 0.5 ? C.ink : C.inkDim,
                  backgroundColor: k > 0 ? `rgba(227,38,43,${0.15 + 0.85 * k})` : 'rgba(20,20,19,0.8)',
                  border: `2px solid ${k > 0.3 ? C.red : 'rgba(238,233,223,0.25)'}`,
                }}
              >
                {m}
              </div>
            );
          })}
        </div>
      </div>
      {ISSUES.map((it) => (
        <IconBadge key={it.cls} cls={it.cls} x={1600} y={it.y} icon={it.icon} size={140} ring="red" label={it.label} labelSize={34} />
      ))}

      {/* "range": o DeWolf (ancora #3) */}
      <Sticker cls="p2s22-dw" src="img/dewolf.png" x={330} y={880} w={480} />

      {/* "fall short of expectations" */}
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />
      <div className="p2s22-bars" style={{position: 'absolute', inset: 0, visibility: 'hidden'}}>
        <StatBar cls="p2s22-b1" x={700} y={470} w={900} h={42} value={exp} label="Expected" labelPos="left" labelSize={46} color={C.ink} />
        <StatBar cls="p2s22-b2" x={700} y={590} w={900} h={42} value={got} label="Delivered" labelPos="left" labelSize={46} />
      </div>
    </AbsoluteFill>
  );
};

const MapMarks: React.FC = () => {
  const px = usePx();
  return (
    <g>
      {FUEL.map((p, i) => (
        <g key={i} className={`p2s22-f${i}`} style={{visibility: 'hidden'}}>
          <circle cx={p[0]} cy={p[1]} r={px(34)} fill={C.black} stroke={C.ink} strokeWidth={px(3)} />
          <Icon name="fuel" x={p[0]} y={p[1]} size={px(42)} color={C.ink} />
        </g>
      ))}
      <g className="p2s22-ok" style={{visibility: 'hidden'}}>
        <circle cx={1260} cy={330} r={px(46)} fill={C.red} stroke={C.ink} strokeWidth={px(4)} />
        <path d={`M${1260 - px(22)} ${330 + px(2)} L${1260 - px(6)} ${330 + px(18)} L${1260 + px(23)} ${330 - px(16)}`} fill="none" stroke={C.ink} strokeWidth={px(9)} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('nanicevic') - 0.6, file: 'whoosh_soft', vol: 0.15, dur: 1.0},
  {at: T('nanicevic') - 0.1, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('may') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('operational') - 0.1, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('short') - 0.2, file: 'paper_slide2', vol: 0.1, dur: 0.7},
  ...ISSUES.map((it, k) => ({at: T(it.word) - 0.12, file: k % 2 ? 'pop2' : 'pop', vol: 0.15, dur: 0.3})),
  {at: T('government') - 0.3, file: 'whoosh_soft2', vol: 0.14, dur: 1.0},
  {at: T('harry') - 0.3, file: 'ship_horn', vol: 0.06, dur: 1.8, fadeIn: 0.2, fadeOut: 0.8},
  {at: T('refueling') - 0.1, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('capability') - 0.1, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('case') - 0.3, file: 'paper_slide', vol: 0.12, dur: 0.8},
  {at: T('fall') - 0.2, file: 'marker_swipe', vol: 0.12, dur: 0.6},
];
