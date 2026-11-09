// 59.48–66.86  "But its ability to respond depends on the threat, and its air defense has relied on NORAD's binational
// structure for decades."
// Globo polar (ancora #1): tres ameacas diferentes em volta do Canada — navio, os bombardeiros (ancora #2), submarino
// sob o gelo —, cada uma com o seu anel. "air defense" foca os bombardeiros; NORAD volta, os EUA pintam de vermelho e
// uma linha do tempo 1958 -> hoje sustenta o "for decades".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Icon, MovingTrack, RangeRing, Timeline} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR, polarCountry} from '../../../data/maps';
import {POLAR2, polarPoint} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, marker, paint} from '../../../lib/tl';
import {popSvg, ringIn, timelineBand, timelineIn, timelineMark} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s05');

const USA = polarCountry(POLAR.ids.usa)!;
const US_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  const [cx, cy] = polarPoint('Colorado Springs');
  for (let x = cx - 330; x <= cx + 330; x += 60) {
    for (let y = cy - 380; y <= cy + 200; y += 60) {
      s.push({x, y, r: 58, delay: Math.max(0, (y - (cy - 380)) / 600) * 0.5});
    }
  }
  return s;
})();

const IQ = polarPoint('Iqaluit');
const SHIP: [number, number] = [IQ[0] + 62, IQ[1] - 36];
const SUB: [number, number] = [944, 588];
const BOMB = POLAR2.bomberTracks.map((b) => b.pts);
const BOMB_C: [number, number] = (() => {
  const p = BOMB[0][Math.floor(BOMB[0].length * 0.55)];
  return [p[0], p[1]];
})();

const KEYS: CamKey[] = [
  {t: 59.2, x: 935, y: 662, s: 1.95, r: -4},
  {t: T('air') - 0.2, x: 930, y: 660, s: 2.0, r: -5, ease: inOutSine},
  {t: T('norads') + 0.2, x: 918, y: 700, s: 1.62, r: -5, ease: inOutSine},
  {t: 67.1, x: 920, y: 704, s: 1.58, r: -5, ease: inOutSine},
];

export const F07: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    popSvg(tl, q, '.f07-ship', L(T('respond') - 0.05));
    ringIn(tl, q, 'f07-r-ship', L(T('respond') + 0.1), 0.6);
    fadeIn(tl, q, '.f07-bombers', L(T('depends') - 0.1), 0.35);
    ringIn(tl, q, 'f07-r-air', L(T('depends') + 0.05), 0.7);
    popSvg(tl, q, '.f07-sub', L(T('threat') - 0.2));
    ringIn(tl, q, 'f07-r-sub', L(T('threat') - 0.05), 0.6);
    // "air defense": o foco fica nos bombardeiros
    tl.to(q('.f07-sea'), {autoAlpha: 0.28, duration: 0.5, ease: 'power1.inOut'}, L(T('air') - 0.15));
    marker(tl, q, 'f07-norad', L(T('norads') - 0.05));
    paint(tl, q, 'f07-us', US_SEEDS, L(T('norads') + 0.05), 0.7);
    timelineIn(tl, q, 'f07-tl', L(T('binational') + 0.1), 0.7);
    timelineMark(tl, q, 'f07-tl', 0, L(T('structure') + 0.05));
    timelineBand(tl, q, 'f07-tl', 0, L(T('for') - 0.1), 0.6);
  });

  const usSettled = t > T('norads') + 1.4;
  const bombP = lerp(0.62, 0.7, ramp(t, 59.2, 67.1, inOutSine));

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam} defs={<PaintDefs id="f07-us" seeds={US_SEEDS} rough={26} />}>
        <PolarBase />
        <PaintPath id="f07-us" d={USA.d} settled={usSettled} />
        <Threats bombP={bombP} />
      </MapSvg>
      <MarkerLabel cls="f07-norad" x={960} y={140} text="NORAD" size={92} />
      <Timeline
        cls="f07-tl"
        x={960}
        y={930}
        w={1240}
        from={1958}
        to={2026}
        labels="ends"
        marks={[{at: 1958, label: '1958', sub: 'NORAD', accent: true}]}
        bands={[{from: 1962, to: 2024, label: 'For decades', style: 'bracket'}]}
      />
    </AbsoluteFill>
  );
};

const Threats: React.FC<{bombP: number}> = ({bombP}) => {
  const px = usePx();
  return (
    <g>
      <g className="f07-sea">
        <g className="f07-ship">
          <Icon name="ship" x={SHIP[0]} y={SHIP[1]} size={px(58)} color={C.ink} fill="#1b1b1a" />
        </g>
        <RangeRing cls="f07-r-ship" cx={SHIP[0]} cy={SHIP[1]} r={26} color={C.ink} width={2.4} dash={[3.4, 2.6]} fill={C.ink} fillOpacity={0.06} />
        <g className="f07-sub">
          <Icon name="submarine" x={SUB[0]} y={SUB[1]} size={px(58)} color={C.ink} dashed />
        </g>
        <RangeRing cls="f07-r-sub" cx={SUB[0]} cy={SUB[1]} r={30} color={C.ink} width={2.4} dash={[3.4, 2.6]} fill={C.ink} fillOpacity={0.06} />
      </g>
      <g className="f07-bombers">
        {BOMB.map((pts, k) => (
          <MovingTrack key={k} cls={`f07-b${k}`} pts={pts} progress={bombP} color={C.red} width={2.4} dash={[5, 4]} icon="bomber" iconSize={30} iconColor={C.red} iconFill={C.red} />
        ))}
      </g>
      <RangeRing cls="f07-r-air" cx={BOMB_C[0]} cy={BOMB_C[1]} r={62} color={C.red} width={3} dash={[4.5, 3.5]} fill={C.red} fillOpacity={0.08} />
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('respond') - 0.05, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('depends') - 0.1, file: 'tick', vol: 0.16, dur: 0.3},
  {at: T('threat') - 0.2, file: 'pop2', vol: 0.18, dur: 0.3},
  {at: T('norads') - 0.12, file: 'marker_swipe', vol: 0.2, dur: 0.6},
];
