// 238.93–247.27  "Using these submarines in the northern approaches during the open water season isn't the same as being
// able to carry out extended patrols beneath the ice of the high Arctic."
// Mapa do Canada. As aproximacoes do norte (Beaufort, Baia de Baffin, Estreito de Davis / Mar do Labrador) se contornam
// e um submarino patrulha ali na agua aberta (check). Um "≠" grande cai no "same". A bacia do Alto Artico fica branca de
// gelo e a trilha tracejada vermelha por baixo dele termina num X.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw, NotEqual} from '../../../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Icon, MovingTrack} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {CA2} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, wipeText} from '../../../lib/tl';
import {popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s17');

type P = [number, number];
const APPR = CA2.regions.northernApproaches;
const HIGH = CA2.regions.highArctic;
const OPEN_TRACK: P[] = [
  [1338, 548],
  [1290, 488],
  [1222, 420],
  [1160, 360],
  [1092, 300],
];
const ICE_TRACK: P[] = [
  [1040, 262],
  [1000, 205],
  [950, 150],
  [880, 108],
  [800, 82],
];

const KEYS: CamKey[] = [
  {t: 238.6, x: 968, y: 262, s: 1.5, r: 0},
  {t: 247.6, x: 958, y: 250, s: 1.58, r: 0, ease: inOutSine},
];

export const P2S17: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    APPR.forEach((_, i) => draw(tl, q, `.p2s17-ap${i}-rev`, L(T('northern') - 0.25 + i * 0.12), 0.7, 'power1.inOut'));
    fadeIn(tl, q, '.p2s17-apf', L(T('northern') - 0.1), 0.5);
    wipeText(tl, q, '.p2s17-l-ap', L(T('approaches') - 0.05), 0.45);
    popSvg(tl, q, '.p2s17-ok', L(T('season') - 0.1));
    tl.fromTo(q('.p2s17-ne'), {autoAlpha: 0, scale: 1.6}, {autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out'}, L(T('same') - 0.12));
    fadeIn(tl, q, '.p2s17-ice', L(T('extended') - 0.3), 0.6);
    wipeText(tl, q, '.p2s17-l-hi', L(T('high') - 0.1), 0.4);
    popSvg(tl, q, '.p2s17-x', L(T('high') - 0.05), 0, 0.36);
  });

  const po = ramp(t, T('open') - 0.6, T('season') + 0.1, inOutSine);
  const pi = ramp(t, T('extended') - 0.2, T('beneath') + 0.45, inOutSine); // (o 'ice' do fim da cena anterior cai na janela)
  const live = (p: number) => p > 0.002 && p < 0.995;
  const [ax, ay] = toScreen([1262, 470], cam);
  const [hx, hy] = toScreen(HIGH.c, cam);
  const [nx, ny] = toScreen([1192, 262], cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Regions />
        <MovingTrack pts={OPEN_TRACK} progress={po} color={C.ink} width={3} dash={[6, 4.5]} icon="submarine" iconSize={66} iconColor={C.black} iconFill={C.ink} head={po > 0.002} />
        <MovingTrack pts={ICE_TRACK} progress={pi} color={C.red} width={3.4} dash={[6, 4.5]} icon="submarine" iconSize={66} iconColor={C.black} iconFill={C.red} head={live(pi)} />
        <Marks />
      </MapSvg>
      <MapLabel cls="p2s17-l-ap" x={ax} y={ay + 40} text="Northern approaches" size={46} color={C.ink} />
      <MapLabel cls="p2s17-l-hi" x={hx - 40} y={hy + 30} text="High Arctic" size={52} color={C.black} />
      <NotEqual cls="p2s17-ne" x={nx} y={ny} size={150} />
    </AbsoluteFill>
  );
};

const Regions: React.FC = () => {
  const px = usePx();
  return (
    <g>
      <g className="p2s17-ice" style={{visibility: 'hidden'}}>
        <path d={HIGH.d} fill="#E9EEF1" fillOpacity={0.82} stroke={C.ink} strokeWidth={px(2)} />
      </g>
      <g className="p2s17-apf" style={{visibility: 'hidden'}}>
        {APPR.map((r, i) => (
          <path key={i} d={r.d} fill={C.ink} fillOpacity={0.1} stroke="none" />
        ))}
      </g>
      {APPR.map((r, i) => (
        <DashedDraw key={i} id={`p2s17-ap${i}`} d={r.d} color={C.ink} width={2.6} dash={[px(9), px(7)]} />
      ))}
    </g>
  );
};

const Marks: React.FC = () => {
  const px = usePx();
  const end = OPEN_TRACK[OPEN_TRACK.length - 1];
  const iceEnd = ICE_TRACK[ICE_TRACK.length - 1];
  return (
    <g>
      <g className="p2s17-ok" style={{visibility: 'hidden'}}>
        <circle cx={end[0] - px(60)} cy={end[1] - px(50)} r={px(34)} fill={C.red} stroke={C.ink} strokeWidth={px(3)} />
        <path d={`M${end[0] - px(76)} ${end[1] - px(50)} L${end[0] - px(64)} ${end[1] - px(38)} L${end[0] - px(43)} ${end[1] - px(62)}`} fill="none" stroke={C.ink} strokeWidth={px(6.5)} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="p2s17-x" style={{visibility: 'hidden'}}>
        <Icon name="cross" x={iceEnd[0] - px(10)} y={iceEnd[1]} size={px(110)} color={C.red} strokeW={10} />
      </g>
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('northern') - 0.25, file: 'pen_scribble', vol: 0.12, dur: 1.0, fadeOut: 0.3},
  {at: T('open') - 0.6, file: 'sonar_ping', vol: 0.08, dur: 2.0, fadeOut: 0.6},
  {at: T('season') - 0.1, file: 'pop', vol: 0.15, dur: 0.3},
  {at: T('same') - 0.12, file: 'stamp', vol: 0.18, dur: 0.6},
  {at: T('extended') - 0.3, file: 'ice_crack', vol: 0.1, dur: 1.2, fadeOut: 0.4},
  {at: T('high') - 0.05, file: 'pop2', vol: 0.16, dur: 0.3},
];
