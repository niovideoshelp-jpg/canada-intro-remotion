// 57.44–68.25  "Canada's Arctic coastline alone stretches for roughly 162,000 kilometers. Patrolling it means covering
// enormous distances in a region with very little infrastructure."
// A costa artica inteira se desenha a giz enquanto o numero conta ate 162,000 KM; no "patrolling" a camera recua
// devagar, um navio percorre uma rota longa pelo arquipelago e so poucos pontinhos de infraestrutura acendem no vazio.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, MovingTrack, countAt} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {CA2, caCommunity, nwpRoute} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import {Cue, ticks} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw} from '../../../lib/tl';
import {counterIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s04');

// rota de patrulha: vai pela rota sul e volta pela norte (uma volta longa pelo arquipelago)
const SOUTH = nwpRoute('southern').pts;
const NORTH = nwpRoute('northern').pts;
const PATROL: [number, number][] = [...SOUTH, ...[...NORTH].reverse()].filter((_, i) => i % 2 === 0).map(([x, y]) => [x, y]);
const DOTS = ['Resolute', 'Cambridge Bay', 'Pond Inlet', 'Grise Fiord', 'Gjoa Haven', 'Arctic Bay', 'Sachs Harbour', 'Taloyoak'].map((n) => caCommunity(n));

const KEYS: CamKey[] = [
  {t: 57.2, x: 892, y: 352, s: 1.78},
  {t: 63.3, x: 890, y: 356, s: 1.72, ease: inOutSine},
  {t: 68.5, x: 905, y: 420, s: 1.12, ease: inOutCubic}, // "enormous distances": recua
];

export const P1S05: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    draw(tl, q, '.p1s05-coast', L(T('coastline') - 0.15), 2.9, 'power1.inOut', CA2.arcticCoastDrawFrac);
    counterIn(tl, q, 'p1s05-km', L(T('roughly') - 0.1));
    DOTS.forEach((_, i) => popSvg(tl, q, `.p1s05-d${i}`, L(T('little') - 0.1 + i * 0.07)));
  });

  const km = countAt(t, T('roughly'), T('kilometers') + 0.1, 0, 162000);
  const patrol = ramp(t, T('patrolling') - 0.1, 68.6, inOutSine);
  // o numero sobe e encolhe quando a camera recua, para nao competir com a rota
  const settle = ramp(t, T('patrolling') - 0.2, T('patrolling') + 0.6, inOutCubic);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <Coast />
        <MovingTrack cls="p1s05-patrol" pts={PATROL} progress={patrol} color={C.red} width={2.6} dash={[6, 5]} icon="shipTop" iconSize={34} iconColor={C.ink} iconFill="#161615" />
        <Dots />
      </MapSvg>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '560px 220px', transform: `scale(${1 - 0.3 * settle}) translate(0px, ${-30 * settle}px) rotate(0.03deg)`}}>
        <Counter cls="p1s05-km" x={560} y={230} value={km} digits={6} size={170} suffix="KM" suffixScale={0.5} />
      </div>
    </AbsoluteFill>
  );
};

const Coast: React.FC = () => {
  const px = usePx();
  return <path className="p1s05-coast" d={CA2.arcticCoast} fill="none" stroke={C.ink} strokeWidth={px(2)} strokeLinejoin="round" strokeLinecap="round" />;
};

const Dots: React.FC = () => {
  const px = usePx();
  return (
    <g>
      {DOTS.map(([x, y], i) => (
        <g key={i} className={`p1s05-d${i}`}>
          <circle cx={x} cy={y} r={px(9)} fill="none" stroke={C.ink} strokeOpacity={0.8} strokeWidth={px(2)} />
          <circle cx={x} cy={y} r={px(4)} fill={C.ink} />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('coastline') - 0.4, file: 'pen_scribble', vol: 0.16, dur: 1.15, fadeOut: 0.2},
  {at: T('coastline') + 0.75, file: 'pen_scribble', vol: 0.14, dur: 1.15, fadeOut: 0.3},
  ...ticks(T('roughly'), T('kilometers') + 0.1, 9, 0.1, 'out'),
  {at: T('patrolling') - 0.3, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('little') - 0.1, file: 'pop', vol: 0.12, dur: 0.3},
];
