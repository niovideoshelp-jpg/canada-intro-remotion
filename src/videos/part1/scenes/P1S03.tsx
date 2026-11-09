// 39.39–50.61  "Canada has the equipment to patrol its Arctic region, monitor foreign activity and carry out military
// operations, but its defense against larger threats has been built around a partnership with the United States."
// As ancoras da Intro voltam, cada uma no seu verbo: o navio (patrol), o radar (monitor), os soldados (operations).
// No "but" elas saem e o mapa sobe: Canada e EUA pintam juntos A PARTIR DA FRONTEIRA na "partnership".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {IconBadge} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {paint, pop, slideIn, wipeText} from '../../../lib/tl';
import {popIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s02');

const pairs = (d: string): [number, number][] => {
  const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};
const BORDER = pairs(CA.southBorder + CA.alaskaBorder).filter((_, i) => i % 4 === 0);
// tinta nasce na fronteira e corre para os dois lados
const SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  for (let x = 220; x <= 1700; x += 95) {
    for (let y = 60; y <= 1500; y += 95) {
      const d = Math.min(...BORDER.map(([bx, by]) => Math.hypot(bx - x, by - y)));
      s.push({x, y, r: 96, delay: Math.min(d, 800) * 0.0011});
    }
  }
  return s;
})();

const KEYS: CamKey[] = [
  {t: 39.1, x: 960, y: 660, s: 0.84},
  {t: 50.9, x: 958, y: 640, s: 0.8, ease: inOutSine},
];

export const P1S03: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p1s03-ship', L(T('canada') - 0.15), -1100, 0, 0.8);
    popIn(tl, q, 'p1s03-radar', L(T('monitor') - 0.1));
    pop(tl, q, '.p1s03-troops', L(T('military') - 0.15), 2);
    // "but": as tres saem para baixo e o mapa fica sozinho
    tl.to(q('.p1s03-cards'), {y: 1100, duration: 0.7, ease: 'power2.in'}, L(T('but') - 0.1));
    paint(tl, q, 'p1s03-pt', SEEDS, L(T('partnership') - 0.15), 0.8);
    wipeText(tl, q, '.p1s03-l-ca', L(T('partnership') + 0.1), 0.4);
    wipeText(tl, q, '.p1s03-l-us', L(T('united') - 0.05), 0.4);
  });

  const paintP = ramp(t, T('partnership') - 0.15, T('partnership') + 1.6);
  const mapIn = ramp(t, T('but') - 0.1, T('but') + 0.7, inOutCubic);
  const [cx, cy] = toScreen([880, 520], cam);
  const [ux, uy] = toScreen([880, 1010], cam);

  return (
    <AbsoluteFill ref={scope}>
      <div style={{position: 'absolute', inset: 0, opacity: lerp(0.32, 1, mapIn)}}>
        <MapSvg cam={cam} defs={<PaintDefs id="p1s03-pt" seeds={SEEDS} rough={40} />}>
          <Graticule d={CA.graticule} />
          <Neighbours />
          <path d={CA.canada} fill={C.land} />
          <PaintPath id="p1s03-pt" d={CA.canada + CA.usa} settled={paintP >= 1} />
          <CanadaOutline width={1.2} opacity={0.6} />
        </MapSvg>
      </div>
      <MapLabel cls="p1s03-l-ca" x={cx} y={cy} text="Canada" size={58} color={C.ink} />
      <MapLabel cls="p1s03-l-us" x={ux} y={uy} text="United States" size={52} color={C.ink} />

      <div className="p1s03-cards" style={{position: 'absolute', inset: 0}}>
        <Sticker cls="p1s03-ship" src="img/dewolf.png" x={600} y={560} w={820} />
        <IconBadge cls="p1s03-radar" x={1450} y={330} icon="radarDome" size={250} label="" />
        <Sticker cls="p1s03-troops" src="img/soldiers.png" x={1430} y={770} w={380} />
      </div>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('patrol') - 0.35 - 0.184 + 0.3, file: 'paper_slide', vol: 0.18, dur: 0.8},
  {at: T('monitor') - 0.1 - 0.004, file: 'pop', vol: 0.2, dur: 0.3},
  {at: T('military') - 0.15 - 0.008, file: 'pop2', vol: 0.2, dur: 0.3},
  {at: T('but') - 0.2, file: 'whoosh_soft', vol: 0.18, dur: 1.0},
  {at: T('partnership') - 0.15, file: 'marker_swipe', vol: 0.18, dur: 0.6},
];
