// 33.08–47.67  "At sea, those images are cross-referenced with data from AIS, the Vessel Identification System, to help
// identify ships and track maritime traffic. It's a useful tool, though it doesn't provide continuous coverage of every
// point in the country."
// Mapa do Canada fechado nas aguas do leste do Artico (Baia de Baffin, Estreito de Davis, Lancaster Sound). Ecos de radar
// (quadradinhos) aparecem na agua; cada um ganha uma linha ate o seu navio AIS (o cruzamento); um eco fica SEM par e
// acende em vermelho (e o que precisa ser identificado). Os rastros do trafego se desenham. No "continuous coverage" a
// camera recua: a rota Halifax -> Resolute aparece com buracos, cada lacuna marcada por um anel vermelho tracejado.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw} from '../../../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Icon, RangeRing} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {CA2, pointAlong, subTrackD} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker} from '../../../lib/tl';
import {popSvg, ringIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s04');

type P = [number, number];
// ecos de radar (agua) e o deslocamento ate o navio AIS correspondente; o ultimo nao tem AIS
const BLIPS: {p: P; ship?: P}[] = [
  {p: [1052, 262], ship: [1080, 236]},
  {p: [1112, 322], ship: [1142, 300]},
  {p: [1003, 296], ship: [1028, 270]},
  {p: [1182, 392], ship: [1212, 368]},
  {p: [1238, 452], ship: [1270, 430]},
  {p: [1100, 268]},
];
const HEADING = -45; // rumo noroeste (rotacao do icone visto de cima)
const UNMATCHED = BLIPS.length - 1;

const LANE = CA2.seaLanes.halifaxToResolute.pts;
const GAPS: [number, number][] = [
  [0.2, 0.31],
  [0.47, 0.58],
  [0.73, 0.82],
];
const SEGS: [number, number][] = [
  [0, GAPS[0][0]],
  [GAPS[0][1], GAPS[1][0]],
  [GAPS[1][1], GAPS[2][0]],
  [GAPS[2][1], 1],
];

const KEYS: CamKey[] = [
  {t: 32.8, x: 1135, y: 342, s: 2.8, r: 0},
  {t: 44.9, x: 1142, y: 350, s: 2.95, r: 0, ease: inOutSine},
  {t: 46.6, x: 1172, y: 560, s: 1.45, r: 0, ease: inOutCubic}, // "continuous coverage": recua
  {t: 47.9, x: 1172, y: 562, s: 1.42, r: 0, ease: inOutSine},
];

export const P2S04: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    BLIPS.forEach((_, i) => popSvg(tl, q, `.p2s04-b${i}`, L(T('sea') - 0.1 + i * 0.13), 0, 0.3));
    BLIPS.forEach((b, i) => (b.ship ? draw(tl, q, `.p2s04-cn${i}`, L(T('cross') - 0.1 + i * 0.12), 0.4, 'power2.out') : null));
    marker(tl, q, 'p2s04-ais', L(T('ais') - 0.12));
    BLIPS.forEach((b, i) => (b.ship ? popSvg(tl, q, `.p2s04-s${i}`, L(T('ais') - 0.05 + i * 0.1)) : null));
    ringIn(tl, q, 'p2s04-unk', L(T('identify') - 0.15), 0.6);
    BLIPS.forEach((b, i) => (b.ship ? draw(tl, q, `.p2s04-tr${i}-rev`, L(T('track') - 0.2 + i * 0.08), 0.9, 'power1.inOut') : null));
    tl.to(q('.p2s04-ais-bar, .p2s04-ais-txt'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('continuous') - 0.7));
    SEGS.forEach((_, k) => draw(tl, q, `.p2s04-lane${k}`, L(T('continuous') - 0.4 + k * 0.32), 0.45, 'none'));
    GAPS.forEach((_, k) => ringIn(tl, q, `p2s04-gap${k}`, L(T('coverage') - 0.2 + k * 0.32), 0.6));
  });

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Lane />
        <Traffic unk={t > T('identify') - 0.15} />
        <RangeRing cls="p2s04-unk" cx={BLIPS[UNMATCHED].p[0]} cy={BLIPS[UNMATCHED].p[1]} r={22} color={C.red} width={3.4} dash={[4, 3]} start={0} />
        {GAPS.map(([a, b], k) => {
          const c = pointAlong(LANE, (a + b) / 2);
          return <RangeRing key={k} cls={`p2s04-gap${k}`} cx={c.x} cy={c.y} r={40} color={C.red} width={3.4} dash={[6, 4.5]} start={0} />;
        })}
      </MapSvg>
      <MarkerLabel cls="p2s04-ais" x={960} y={124} text="AIS" size={84} />
    </AbsoluteFill>
  );
};

const Lane: React.FC = () => {
  const px = usePx();
  return (
    <g fill="none" stroke={C.ink} strokeWidth={px(3)} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.85}>
      {SEGS.map(([a, b], k) => (
        <path key={k} className={`p2s04-lane${k}`} d={subTrackD(LANE, a, b)} />
      ))}
    </g>
  );
};

const Traffic: React.FC<{unk: boolean}> = ({unk}) => {
  const px = usePx();
  return (
    <g>
      {BLIPS.map((b, i) =>
        b.ship ? (
          <g key={`l${i}`} fill="none" stroke={C.ink} strokeLinecap="round">
            {/* rastro AIS: vem de sudeste ate o navio */}
            <DashedDraw id={`p2s04-tr${i}`} d={`M${b.ship[0] + 46} ${b.ship[1] + 44} L${b.ship[0]} ${b.ship[1]}`} color={C.ink} opacity={0.75} width={2.6} dash={[px(9), px(7)]} />
            {/* o cruzamento: eco -> navio */}
            <path className={`p2s04-cn${i}`} d={`M${b.p[0]} ${b.p[1]} L${b.ship[0]} ${b.ship[1]}`} strokeOpacity={0.9} strokeWidth={px(2.4)} />
          </g>
        ) : null,
      )}
      {BLIPS.map((b, i) => (
        <g key={`b${i}`} className={`p2s04-b${i}`}>
          <rect x={b.p[0] - px(12)} y={b.p[1] - px(12)} width={px(24)} height={px(24)} fill={unk && i === UNMATCHED ? C.red : C.ink} stroke={C.black} strokeWidth={px(2)} />
        </g>
      ))}
      {BLIPS.map((b, i) =>
        b.ship ? (
          <g key={`s${i}`} className={`p2s04-s${i}`}>
            <Icon name="shipTop" x={b.ship[0]} y={b.ship[1]} size={px(74)} rot={HEADING} color={C.black} fill={C.ink} shadow />
          </g>
        ) : null,
      )}
    </g>
  );
};

export const cues: Cue[] = [
  ...BLIPS.map((_, i) => ({at: T('sea') - 0.1 + i * 0.13, file: 'tick', vol: 0.07, dur: 0.3})),
  {at: T('ais') - 0.17, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  ...BLIPS.filter((b) => b.ship).map((_, i) => ({at: T('ais') - 0.05 + i * 0.1, file: 'radio_beep', vol: 0.05, dur: 0.25})),
  {at: T('identify') - 0.15, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('continuous') - 0.5, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('coverage') - 0.2, file: 'pen_scribble', vol: 0.12, dur: 1.0, fadeOut: 0.3},
];
