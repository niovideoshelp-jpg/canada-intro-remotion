// 50.61–57.44  "To understand what the Canadians can do, we need to look at both their equipment and the support network
// that lets them use it up north."
// A tela se divide (a borda vermelha da cortina): a esquerda os meios (os adesivos da Intro, EQUIPMENT); a direita o
// norte do mapa, onde a rede de apoio acende e se liga (SUPPORT NETWORK). Planta a estrutura da Parte 2.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {SplitPanel} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import {CaPlaceName, caPlace} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, pop} from '../../../lib/tl';
import {popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s03');

const HUBS: CaPlaceName[] = ['Inuvik', 'Yellowknife', 'Cambridge Bay', 'Resolute', 'Alert', 'Pond Inlet', 'Iqaluit', 'Rankin Inlet', 'Kuujjuaq', 'Goose Bay', 'Whitehorse', 'Hall Beach'];
const P = Object.fromEntries(HUBS.map((n) => [n, caPlace(n)])) as Record<CaPlaceName, [number, number]>;
const LINKS: [CaPlaceName, CaPlaceName][] = [
  ['Whitehorse', 'Inuvik'],
  ['Inuvik', 'Yellowknife'],
  ['Yellowknife', 'Cambridge Bay'],
  ['Inuvik', 'Cambridge Bay'],
  ['Cambridge Bay', 'Resolute'],
  ['Resolute', 'Alert'],
  ['Resolute', 'Pond Inlet'],
  ['Cambridge Bay', 'Hall Beach'],
  ['Yellowknife', 'Rankin Inlet'],
  ['Rankin Inlet', 'Hall Beach'],
  ['Hall Beach', 'Pond Inlet'],
  ['Hall Beach', 'Iqaluit'],
  ['Pond Inlet', 'Iqaluit'],
  ['Iqaluit', 'Kuujjuaq'],
  ['Kuujjuaq', 'Goose Bay'],
  ['Rankin Inlet', 'Kuujjuaq'],
];
// curva suave de mao (arco leve entre os pontos)
const linkD = ([a, b]: [CaPlaceName, CaPlaceName]) => {
  const [x1, y1] = P[a];
  const [x2, y2] = P[b];
  const mx = (x1 + x2) / 2 - (y2 - y1) * 0.12;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.12;
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
};

// o mapa fica na metade direita: a camera desloca o centro do norte para x = 1440 na tela
const S = 1.22;
const KEYS: CamKey[] = [
  {t: 50.4, x: 905 - 480 / S, y: 430, s: S},
  {t: 56.7, x: 905 - 480 / S, y: 430, s: S, ease: inOutSine},
  {t: 57.7, x: 905 - 480 / (S * 1.06), y: 360, s: S * 1.06, ease: inOutCubic}, // "up north"
];

export const P1S04: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    pop(tl, q, '.p1s04-jet', L(T('canadians') - 0.1), -4);
    pop(tl, q, '.p1s04-ship', L(T('can') + 0.05), 2);
    pop(tl, q, '.p1s04-troops', L(T('do') + 0.05), -2);
    marker(tl, q, 'p1s04-eq', L(T('equipment') - 0.05));
    HUBS.forEach((_, i) => popSvg(tl, q, `.p1s04-h${i}`, L(T('support') - 0.2 + i * 0.04)));
    LINKS.forEach((_, i) => draw(tl, q, `.p1s04-k${i}`, L(T('network') - 0.15 + i * 0.05), 0.5, 'power1.inOut'));
    marker(tl, q, 'p1s04-net', L(T('network') + 0.1));
  });

  const split = ramp(t, T('both') - 0.2, T('both') + 0.45, inOutCubic);
  const leftX = lerp(960, 480, split);

  return (
    <AbsoluteFill ref={scope}>
      <SplitPanel
        progress={split}
        tintRight={0.25}
        left={
          <AbsoluteFill>
            <div style={{position: 'absolute', inset: 0, transform: `translate(${leftX - 480}px, 0px) rotate(0.03deg)`}}>
              <Sticker cls="p1s04-jet" src="img/cf18.png" x={470} y={330} w={560} />
              <Sticker cls="p1s04-ship" src="img/dewolf.png" x={500} y={600} w={620} />
              <Sticker cls="p1s04-troops" src="img/soldiers.png" x={450} y={840} w={250} />
              <MarkerLabel cls="p1s04-eq" x={480} y={140} text="Equipment" size={64} />
            </div>
          </AbsoluteFill>
        }
        right={
          <AbsoluteFill>
            <MapSvg cam={cam}>
              <Graticule d={CA.graticule} />
              <Neighbours />
              <CanadaFill />
              <CanadaOutline width={1.2} opacity={0.6} />
              <Network />
            </MapSvg>
            <MarkerLabel cls="p1s04-net" x={1440} y={140} text="Support network" size={64} />
          </AbsoluteFill>
        }
      />
    </AbsoluteFill>
  );
};

const Network: React.FC = () => {
  const px = usePx();
  return (
    <g>
      <g fill="none" stroke={C.ink} strokeOpacity={0.75} strokeWidth={px(2.2)} strokeLinecap="round">
        {LINKS.map((l, i) => (
          <path key={i} className={`p1s04-k${i}`} d={linkD(l)} />
        ))}
      </g>
      {HUBS.map((h, i) => (
        <g key={h} className={`p1s04-h${i}`}>
          <circle cx={P[h][0]} cy={P[h][1]} r={px(13)} fill="none" stroke={C.red} strokeWidth={px(2.5)} />
          <circle cx={P[h][0]} cy={P[h][1]} r={px(6)} fill={C.red} />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('canadians') - 0.1 - 0.004, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('can') + 0.05 - 0.008, file: 'pop2', vol: 0.18, dur: 0.3},
  {at: T('do') + 0.05 - 0.004, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('both') - 0.3, file: 'whoosh_soft2', vol: 0.18, dur: 1.0},
  {at: T('equipment') - 0.12, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('network') - 0.2, file: 'pen_scribble', vol: 0.15, dur: 1.15, fadeOut: 0.3},
];
