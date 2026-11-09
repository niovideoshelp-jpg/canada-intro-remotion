// 66.88–79.69  "One of the projects meant to improve detection is an over-the-horizon radar system using Australian
// technology. Canada moved forward with agreements involving Australia and BAE Systems Australia in June 2026."
// Mapa-mundi (Equal Earth) em grafite, camera perto do Canada. OVER-THE-HORIZON RADAR. No "Australian" a camera abre ate
// enquadrar os dois paises e a Australia pinta de vermelho; no "Canada" o Canada tambem. No "agreements" um arco de giz
// liga Ottawa a Canberra (aperto de maos no meio); BAE SYSTEMS AUSTRALIA sob a Australia e o carimbo JUNE 2026.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconBadge, Stamp} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {WorldBase} from '../../../components/WorldBase';
import {WORLD, worldCountry, worldPlace} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, paint, wipeText} from '../../../lib/tl';
import {popIn, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s06');

const AUS = worldCountry('australia');
const CAN = worldCountry('canada');
const LINK = WORLD.links.canadaAustralia;
const seeds = (x0: number, x1: number, y0: number, y1: number, o: [number, number], k: number): Seed[] => {
  const s: Seed[] = [];
  for (let x = x0; x <= x1; x += 34) for (let y = y0; y <= y1; y += 34) s.push({x, y, r: 36, delay: Math.hypot(x - o[0], y - o[1]) * k});
  return s;
};
const AU_SEEDS = seeds(1480, 1700, 600, 880, [1500, 690], 0.0025);
const CA_SEEDS = seeds(420, 790, 100, 280, worldPlace('Ottawa') as [number, number], 0.0018);

const KEYS: CamKey[] = [
  {t: 66.6, x: 600, y: 236, s: 2.35, r: 0},
  {t: 70.9, x: 612, y: 244, s: 2.25, r: 0, ease: inOutSine},
  {t: 72.7, x: 1062, y: 486, s: 1.14, r: 0, ease: inOutCubic}, // enquadra Canada e Australia
  {t: 79.95, x: 1066, y: 490, s: 1.18, r: 0, ease: inOutSine},
];

export const P2S06: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    marker(tl, q, 'p2s06-oth', L(T('over') - 0.12));
    paint(tl, q, 'p2s06-au', AU_SEEDS, L(T('australian') + 0.1), 0.8);
    paint(tl, q, 'p2s06-ca', CA_SEEDS, L(T('canada') - 0.1), 0.8);
    draw(tl, q, '.p2s06-link', L(T('agreements') - 0.35), 1.1, 'power1.inOut');
    popIn(tl, q, 'p2s06-hand', L(T('agreements') + 0.35));
    wipeText(tl, q, '.p2s06-bae', L(T('bae') - 0.1), 0.45);
    stampIn(tl, q, 'p2s06-june', L(T('june') - STAMP_HIT));
  });

  const auSettled = t > T('australian') + 2;
  const caSettled = t > T('canada') + 2;
  const [hx, hy] = toScreen(LINK.mid, cam);
  const [bx, by] = toScreen([1474, 742], cam); // a oeste da Australia (oceano Indico)

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <PaintDefs id="p2s06-au" seeds={AU_SEEDS} rough={16} />
            <PaintDefs id="p2s06-ca" seeds={CA_SEEDS} rough={16} />
          </>
        }
      >
        <WorldBase />
        <CanadaEdge />
        <PaintPath id="p2s06-au" d={AUS.d} settled={auSettled} />
        <PaintPath id="p2s06-ca" d={CAN.d} settled={caSettled} />
        <Link />
      </MapSvg>
      <MarkerLabel cls="p2s06-oth" x={960} y={118} text="Over-the-horizon radar" size={70} />
      <IconBadge cls="p2s06-hand" x={hx} y={hy} icon="handshake" size={128} />
      <MapLabel cls="p2s06-bae" x={bx} y={by} text="BAE Systems Australia" size={40} color={C.ink} anchor="right" />
      <Stamp cls="p2s06-june" x={hx + 20} y={hy + 150} text="June 2026" size={64} />
    </AbsoluteFill>
  );
};

/** Contorno de giz do Canada enquanto ele ainda e grafite. */
const CanadaEdge: React.FC = () => {
  const px = usePx();
  return <path d={CAN.d} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={px(1.6)} strokeLinejoin="round" />;
};

const Link: React.FC = () => {
  const px = usePx();
  return <path className="p2s06-link" d={LINK.d} fill="none" stroke={C.ink} strokeWidth={px(3.4)} strokeLinecap="round" />;
};

export const cues: Cue[] = [
  {at: T('over') - 0.17, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: T('system') - 0.1, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('australian') + 0.1, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('canada') - 0.1, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('agreements') - 0.35, file: 'pen_scribble', vol: 0.12, dur: 1.1, fadeOut: 0.3},
  {at: T('agreements') + 0.35, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('june') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
];
