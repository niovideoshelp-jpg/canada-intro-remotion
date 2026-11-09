// 19.90–33.08  "Surveillance also comes from space. The three satellites in the Radarsat Constellation mission can capture
// images during the day, at night, and through cloud cover. Some areas of the far north can get up to four passes a
// day."
// Globo polar (ancora #1). No "space" a camera sobe e tres satelites aparecem numa linha de orbita polar; RADARSAT
// CONSTELLATION MISSION. Um satelite corre a orbita e deixa a faixa de imagem (giz translucido) sobre o Artico. Dia,
// noite (o globo escurece) e nuvens (passam por cima sem apagar a faixa). No "four passes" as quatro passagens do dia
// cruzam o extremo norte e se somam onde se sobrepoem; contador 4.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Counter, Icon, IconBadge, RangeRing, stepsAt, trackHead, trackPoly} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR} from '../../../data/maps';
import {POLAR2} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, marker, wipeText} from '../../../lib/tl';
import {popIn, popSvg, ringIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s03');

const PASSES = POLAR2.rcmTracks;
const MAIN = 1; // pass-2: a primeira faixa, desenhada pelo satelite
const MAIN_POLY = trackPoly(PASSES[MAIN].pts);
const ORDER = [0, 2, 3]; // as outras tres no "four passes"
// a linha de orbita (prolonga a passagem principal alem do globo) e os tres satelites sobre ela
const ORBIT = (() => {
  const p = PASSES[MAIN].pts;
  const a = p[0];
  const b = p[p.length - 1];
  const ext = (q: readonly number[], r: readonly number[], k: number) => [q[0] + (q[0] - r[0]) * k, q[1] + (q[1] - r[1]) * k];
  const a2 = ext(a, p[12], 9);
  const b2 = ext(b, p[p.length - 13], 9);
  return `M${a2[0].toFixed(1)},${a2[1].toFixed(1)} L${p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L')} L${b2[0].toFixed(1)},${b2[1].toFixed(1)}`;
})();
const SAT_F = [0.06, 0.5, 0.94]; // posicoes dos 3 satelites na passagem principal (antes de correr)
const CONV: [number, number] = [962, 600]; // onde as passagens convergem (extremo norte)

// nuvens: manchas suaves que atravessam o Artico (gradiente radial, sem blur)
const CLOUDS = [
  {x: 1260, y: 470, rx: 150, ry: 70},
  {x: 1180, y: 620, rx: 120, ry: 60},
  {x: 1330, y: 700, rx: 170, ry: 80},
  {x: 1120, y: 540, rx: 100, ry: 50},
];

const KEYS: CamKey[] = [
  {t: 19.6, x: 960, y: 600, s: 1.32, r: -4},
  {t: 21.0, x: 960, y: 590, s: 1.3, r: -4, ease: inOutSine},
  {t: 22.6, x: 960, y: 560, s: 0.94, r: -4, ease: inOutCubic}, // "from space": sobe
  {t: 25.5, x: 960, y: 570, s: 0.98, r: -4, ease: inOutSine},
  {t: 27.0, x: 960, y: 610, s: 1.3, r: -5, ease: inOutCubic}, // a faixa sobre o Artico
  {t: 30.6, x: 962, y: 610, s: 1.36, r: -5, ease: inOutSine},
  {t: 32.0, x: 962, y: 606, s: 1.62, r: -6, ease: inOutCubic}, // "far north"
  {t: 33.4, x: 962, y: 604, s: 1.68, r: -6, ease: inOutSine},
];

export const P2S03: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    draw(tl, q, '.p2s03-orbit', L(T('space') - 0.35), 0.9, 'power2.inOut');
    SAT_F.forEach((_, k) => popSvg(tl, q, `.p2s03-sat${k}`, L(T('three') - 0.1 + k * 0.12)));
    marker(tl, q, 'p2s03-rcm', L(T('radarsat') - 0.1));
    draw(tl, q, `.p2s03-sw${MAIN}`, L(T('capture') - 0.2), 2.6, 'none');
    popIn(tl, q, 'p2s03-day', L(T('day') - 0.12));
    popIn(tl, q, 'p2s03-night', L(T('night') - 0.12));
    popIn(tl, q, 'p2s03-cloud', L(T('cloud') - 0.12));
    ringIn(tl, q, 'p2s03-far', L(T('far') - 0.15), 0.8);
    ORDER.forEach((i, k) => draw(tl, q, `.p2s03-sw${i}`, L(T('four') - 0.3 + k * 0.28), 0.9, 'power1.inOut'));
    fadeIn(tl, q, '.p2s03-num', L(T('far') - 0.1), 0.3);
    wipeText(tl, q, '.p2s03-num-unit', L(T('passes') - 0.15), 0.4);
  });

  // o satelite principal corre a orbita no "capture images" (os outros dois somem)
  const run = ramp(t, T('capture') - 0.2, T('capture') + 2.4, (x) => x);
  const night = 0.5 * Math.sin(Math.PI * ramp(t, T('night') - 0.35, T('cloud') - 0.15));
  const cloudK = ramp(t, T('cloud') - 0.6, T('cloud') + 1.7, (x) => x);
  const cloudA = Math.sin(Math.PI * cloudK);
  const n = stepsAt(t, 1, [0, 1, 2].map((k) => ({at: T('four') - 0.25 + k * 0.28, to: k + 2})), 0.15);
  const others = 1 - ramp(t, T('capture') - 0.4, T('capture') - 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <radialGradient id="p2s03-cl">
            <stop offset="0%" stopColor={C.ink} stopOpacity={0.55} />
            <stop offset="65%" stopColor={C.ink} stopOpacity={0.22} />
            <stop offset="100%" stopColor={C.ink} stopOpacity={0} />
          </radialGradient>
        }
      >
        <PolarBase />
        <path d={POLAR.sphere} fill="#000" opacity={night} />
        <Swaths />
        {/* nuvens passam por cima da faixa sem apaga-la (sao translucidas) */}
        {cloudA > 0.01 ? (
          <g opacity={cloudA}>
            {CLOUDS.map((c, k) => (
              <ellipse key={k} cx={c.x - 420 * cloudK} cy={c.y + 40 * cloudK} rx={c.rx} ry={c.ry} fill="url(#p2s03-cl)" />
            ))}
          </g>
        ) : null}
        <RangeRing cls="p2s03-far" cx={CONV[0]} cy={CONV[1]} r={92} color={C.red} width={3.2} dash={[8, 6]} start={300} />
        <Orbit run={run} others={others} />
      </MapSvg>

      <MarkerLabel cls="p2s03-rcm" x={960} y={118} text="Radarsat Constellation Mission" size={64} />
      <IconBadge cls="p2s03-day" x={200} y={390} icon="sun" size={128} />
      <IconBadge cls="p2s03-night" x={200} y={560} icon="moon" size={128} />
      <IconBadge cls="p2s03-cloud" x={200} y={730} icon="cloud" size={128} />
      <Counter cls="p2s03-num" x={1640} y={520} value={n} digits={1} size={230} unit="Passes a day" unitSize={44} />
    </AbsoluteFill>
  );
};

const Swaths: React.FC = () => (
  <g fill="none" strokeLinecap="butt" strokeLinejoin="round">
    {PASSES.map((p, i) => (
      <path key={p.id} className={`p2s03-sw${i}`} d={p.d} stroke={C.ink} strokeOpacity={0.2} strokeWidth={p.swathHalfWidthPx * 2} />
    ))}
  </g>
);

const Orbit: React.FC<{run: number; others: number}> = ({run, others}) => {
  const px = usePx();
  const head = trackHead(MAIN_POLY, SAT_F[0] + (1 - SAT_F[0]) * run);
  return (
    <g>
      <path className="p2s03-orbit" d={ORBIT} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={px(2)} />
      {SAT_F.map((f, k) => {
        const p = k === 0 ? head.p : trackHead(MAIN_POLY, f).p;
        return (
          <g key={k} opacity={k === 0 ? 1 : others}>
            <g className={`p2s03-sat${k}`}>
              <Icon name="satellite" x={p[0]} y={p[1]} size={px(118)} color={C.black} fill={C.ink} shadow />
            </g>
          </g>
        );
      })}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('space') - 0.4, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('three') - 0.1, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('radarsat') - 0.15, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('capture') - 0.2, file: 'shutter_click', vol: 0.1, dur: 0.3},
  {at: T('day') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('night') - 0.12, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('cloud') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  ...[0, 1, 2].map((k) => ({at: T('four') - 0.3 + k * 0.28, file: 'shutter_click', vol: 0.09, dur: 0.3})),
];
