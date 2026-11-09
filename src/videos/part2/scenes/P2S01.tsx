// 0.00–13.35  "To see what's approaching from the north, Canada relies on the North Warning System, a network of 47 radar
// sites stretching from Yukon to Labrador. The problem is that it was built between 1986 and 1992."
// Mapa do Canada (grafite). Setas de giz descem do topo ("from the north"); o rotulo NORTH WARNING SYSTEM entra e os 47
// radares acendem de oeste para leste enquanto a camera acompanha a onda, de YUKON a LABRADOR, ligados por uma corrente
// de giz. Nas datas, o carimbo 1986–1992 e os pontos perdem a cor ("velho").
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, countAt, Stamp, SvgLayer} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {CA2} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {ticks} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, wipeText} from '../../../lib/tl';
import {popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s01');

// os 47 sitios, ja em ordem oeste -> leste
const SITES = [...CA2.nws].sort((a, b) => a.p[0] - b.p[0]);
const W0 = T('47') - 0.15; // a onda comeca
const W1 = T('labrador') + 0.1; // e termina
const popAt = (i: number) => W0 + ((W1 - W0) * i) / (SITES.length - 1);
const FIRST = SITES[0].p;
const LAST = SITES[SITES.length - 1].p;

const KEYS: CamKey[] = [
  {t: -0.3, x: 930, y: 380, s: 1.3, r: 0},
  {t: 2.6, x: 900, y: 395, s: 1.42, r: 0, ease: inOutSine},
  {t: W0 + 0.2, x: 720, y: 380, s: 2.05, r: -2, ease: inOutCubic}, // comeca no Yukon
  {t: W1 - 0.2, x: 1230, y: 500, s: 2.05, r: 2, ease: inOutSine}, // termina no Labrador
  {t: T('problem') + 0.3, x: 965, y: 452, s: 1.62, r: 0, ease: inOutCubic}, // a corrente inteira
  {t: 13.7, x: 968, y: 456, s: 1.7, r: 0, ease: inOutSine},
];

export const P2S01: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    [0, 1, 2].forEach((k) => {
      draw(tl, q, `.p2s01-a${k}-c`, L(T('approaching') - 0.15 + k * 0.12), 0.6, 'power2.out');
      draw(tl, q, `.p2s01-a${k}-h`, L(T('approaching') + 0.45 + k * 0.12), 0.14, 'none');
    });
    tl.to(q('.p2s01-arrows'), {autoAlpha: 0, duration: 0.5, ease: 'power1.in'}, L(T('warning') - 0.3));
    marker(tl, q, 'p2s01-nws', L(T('north', 2) - 0.1));
    SITES.forEach((_, i) => popSvg(tl, q, `.p2s01-s${i}`, L(popAt(i)), 0, 0.32));
    draw(tl, q, '.p2s01-chain', L(W0), W1 - W0 + 0.15, 'none');
    wipeText(tl, q, '.p2s01-num', L(W0 - 0.05), 0.3);
    wipeText(tl, q, '.p2s01-num-unit', L(T('radar') - 0.1), 0.4);
    wipeText(tl, q, '.p2s01-yk', L(T('yukon') - 0.1), 0.4);
    wipeText(tl, q, '.p2s01-lb', L(T('labrador') - 0.05), 0.4);
    stampIn(tl, q, 'p2s01-date', L(T('1986') - STAMP_HIT));
  });

  // "built between...": os pontos perdem o vermelho
  const old = ramp(t, T('built') - 0.1, T('1992') + 0.2, inOutSine);
  const n = countAt(t, W0, W1, 0, 47, (x) => x); // linear: acompanha os pontos
  const [fx, fy] = toScreen(FIRST, cam);
  const [lx, ly] = toScreen(LAST, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Sites old={old} />
      </MapSvg>

      {/* "approaching from the north" */}
      <SvgLayer>
        <g className="p2s01-arrows" fill="none">
          {[620, 960, 1300].map((x, k) => (
            <HandArrow key={k} cls={`p2s01-a${k}`} from={[x + (k - 1) * 30, -30]} to={[x, 210]} bow={k === 1 ? 0.04 : (k - 1) * -0.1} color={C.ink} width={5} />
          ))}
        </g>
      </SvgLayer>

      <MapLabel cls="p2s01-yk" x={fx - 20} y={fy - 70} text="Yukon" size={44} color={C.ink} />
      <MapLabel cls="p2s01-lb" x={lx + 30} y={ly + 80} text="Labrador" size={44} color={C.ink} />
      <MarkerLabel cls="p2s01-nws" x={960} y={130} text="North Warning System" size={72} />
      <Counter cls="p2s01-num" x={250} y={830} value={n} digits={2} size={200} anchor="left" unit="Radar sites" unitSize={46} />
      <Stamp cls="p2s01-date" x={980} y={720} text="1986–1992" size={96} />
    </AbsoluteFill>
  );
};

const Sites: React.FC<{old: number}> = ({old}) => {
  const px = usePx();
  // vermelho -> cinza quente (o sistema envelhece)
  const red = `rgb(${Math.round(227 - 80 * old)},${Math.round(38 + 80 * old)},${Math.round(43 + 72 * old)})`;
  return (
    <g>
      <path className="p2s01-chain" d={CA2.nwsLine} fill="none" stroke={C.ink} strokeOpacity={0.75} strokeWidth={px(2)} strokeLinejoin="round" />
      {SITES.map((s, i) => (
        <g key={i} className={`p2s01-s${i}`}>
          {s.lrr ? <circle cx={s.p[0]} cy={s.p[1]} r={px(15)} fill="none" stroke={C.ink} strokeWidth={px(2.6)} /> : null}
          <circle cx={s.p[0]} cy={s.p[1]} r={px(s.lrr ? 7.5 : 6)} fill={red} stroke={C.ink} strokeWidth={px(1.6)} />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('approaching') - 0.15, file: 'whoosh_soft', vol: 0.14, dur: 1.0},
  {at: T('north', 2) - 0.15, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: W0 - 0.05, file: 'radar_ping', vol: 0.12, dur: 1.0},
  ...ticks(W0 + 0.4, W1, 8, 0.06, 'out'),
  {at: T('1986') - 0.008, file: 'stamp', vol: 0.28, dur: 0.6},
];
