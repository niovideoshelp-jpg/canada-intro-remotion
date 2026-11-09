// 89.95–101.97  "Canadian policy recognizes their security as part of national security. An airstrip, a communications
// network, or a refueling site can serve the military while also making life better for people living in the north."
// As comunidades do norte acendem; no "national" a tinta vermelha nasce DELAS e corre ate pintar o Canada inteiro (o
// local vira nacional). Depois: pista, comunicacoes e combustivel servem os dois lados — militar e comunidades.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {IconBadge, SvgLayer} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {CA} from '../../../data/maps';
import {CA2} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, paint} from '../../../lib/tl';
import {popIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s07');

const COMM = CA2.communities.map((c) => c.p);
// sementes: nas comunidades (primeiro) e numa grade que cobre o resto do pais (pela distancia ate a comunidade mais perto)
const SEEDS: Seed[] = (() => {
  const s: Seed[] = COMM.map(([x, y]) => ({x, y, r: 70, delay: 0}));
  for (let x = 430; x <= 1500; x += 80) {
    for (let y = 90; y <= 1000; y += 80) {
      const d = Math.min(...COMM.map(([cx, cy]) => Math.hypot(cx - x, cy - y)));
      s.push({x, y, r: 82, delay: Math.min(d, 600) * 0.0014});
    }
  }
  return s;
})();

const KEYS: CamKey[] = [
  {t: 89.7, x: 930, y: 470, s: 0.98},
  {t: 94.2, x: 940, y: 500, s: 0.9, ease: inOutSine},
  {t: 102.2, x: 944, y: 506, s: 0.88, ease: inOutSine},
];

const ROW = [
  {cls: 'p1s08-air', icon: 'runway' as const, label: 'Airstrip', x: 640, word: 'airstrip'},
  {cls: 'p1s08-com', icon: 'antenna' as const, label: 'Comms', x: 960, word: 'communications'},
  {cls: 'p1s08-fuel', icon: 'fuel' as const, label: 'Refueling', x: 1280, word: 'refueling'},
];

export const P1S08: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    COMM.forEach((_, i) => popSvg(tl, q, `.p1s08-c${i}`, L(T('canadian') - 0.1 + i * 0.03)));
    paint(tl, q, 'p1s08-p', SEEDS, L(T('national') - 0.1), 0.75);
    ROW.forEach((r) => popIn(tl, q, r.cls, L(T(r.word) - 0.12)));
    draw(tl, q, '.p1s08-am-c', L(T('military') - 0.25), 0.5, 'power2.out');
    draw(tl, q, '.p1s08-am-h', L(T('military') + 0.22), 0.16, 'none');
    popIn(tl, q, 'p1s08-mil', L(T('military') + 0.05));
    draw(tl, q, '.p1s08-ac-c', L(T('life') - 0.3), 0.5, 'power2.out');
    draw(tl, q, '.p1s08-ac-h', L(T('life') + 0.17), 0.16, 'none');
    popIn(tl, q, 'p1s08-home', L(T('life') + 0.05));
  });

  const settled = t > T('national') + 1.6;
  const dim = 0.66 * ramp(t, T('airstrip') - 0.5, T('airstrip') + 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam} defs={<PaintDefs id="p1s08-p" seeds={SEEDS} rough={30} />}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <PaintPath id="p1s08-p" d={CA.canada} settled={settled} />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Communities />
      </MapSvg>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />
      <SvgLayer>
        <g fill="none">
          <HandArrow cls="p1s08-am" from={[880, 560]} to={[690, 740]} bow={0.12} color={C.ink} width={4} />
          <HandArrow cls="p1s08-ac" from={[1040, 560]} to={[1230, 740]} bow={-0.12} color={C.ink} width={4} />
        </g>
      </SvgLayer>
      {ROW.map((r) => (
        <IconBadge key={r.cls} cls={r.cls} x={r.x} y={400} icon={r.icon} size={150} label={r.label} labelSize={36} />
      ))}
      <IconBadge cls="p1s08-mil" x={620} y={840} icon="jet" size={150} label="Military" labelSize={38} ring="red" />
      <IconBadge cls="p1s08-home" x={1300} y={840} icon="house" size={150} label="Communities" labelSize={38} ring="red" />
    </AbsoluteFill>
  );
};

const Communities: React.FC = () => {
  const px = usePx();
  const fade = 1;
  return (
    <g opacity={lerp(1, fade, 0)}>
      {COMM.map(([x, y], i) => (
        <g key={i} className={`p1s08-c${i}`}>
          <circle cx={x} cy={y} r={px(9)} fill="none" stroke={C.ink} strokeWidth={px(2)} />
          <circle cx={x} cy={y} r={px(4.5)} fill={C.red} />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('canadian') - 0.1, file: 'pop', vol: 0.12, dur: 0.3},
  {at: T('national') - 0.15, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  ...ROW.map((r) => ({at: T(r.word) - 0.12 - 0.004, file: 'pop', vol: 0.2, dur: 0.3})),
  {at: T('military') + 0.05 - 0.008, file: 'pop2', vol: 0.18, dur: 0.3},
  {at: T('life') + 0.05 - 0.008, file: 'pop2', vol: 0.18, dur: 0.3},
];
