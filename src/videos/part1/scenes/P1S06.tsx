// 68.25–80.30  "An aircraft might have the range to get somewhere, but keeping an operation going there takes fuel,
// maintenance, communications and support for the people on the ground. All of that has to be available where the
// mission is taking place."
// O alcance nao e o problema: um caca sai de Cold Lake e o anel mostra que chega. O problema e manter: combustivel,
// manutencao, comunicacoes e apoio aparecem em volta do destino, cada um na sua palavra, e convergem para o ponto.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {IconBadge, MovingTrack, Pulse, RangeRing, SvgLayer} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {caPlace} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, wipeText} from '../../../lib/tl';
import {popIn, pulseOnce, ringIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s05');

const BASE = caPlace('Cold Lake');
const DEST: [number, number] = [880, 300]; // arquipelago, perto de Resolute
const ROUTE: [number, number][] = [BASE, [BASE[0] + 40, BASE[1] - 170], [DEST[0] - 30, DEST[1] + 120], DEST];
const RANGE = Math.hypot(DEST[0] - BASE[0], DEST[1] - BASE[1]) * 1.18;

const KEYS: CamKey[] = [
  {t: 68.0, x: 860, y: 520, s: 1.0},
  {t: 71.4, x: 870, y: 470, s: 1.08, ease: inOutSine},
  {t: 80.6, x: 880, y: 360, s: 1.42, ease: inOutSine}, // aproxima do destino enquanto as necessidades se juntam
];

// as quatro necessidades, em volta do destino (deslocamento em px de tela)
const NEEDS = [
  {cls: 'p1s06-fuel', icon: 'fuel' as const, label: 'Fuel', dx: -330, dy: -170, word: 'fuel'},
  {cls: 'p1s06-mnt', icon: 'wrench' as const, label: 'Maintenance', dx: 330, dy: -170, word: 'maintenance'},
  {cls: 'p1s06-com', icon: 'antenna' as const, label: 'Comms', dx: -330, dy: 190, word: 'communications'},
  {cls: 'p1s06-sup', icon: 'people' as const, label: 'Support', dx: 330, dy: 190, word: 'support'},
];

export const P1S06: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.p1s06-base', L(T('aircraft') - 0.2), 0.4);
    ringIn(tl, q, 'p1s06-rr', L(T('range') - 0.1), 1.0);
    NEEDS.forEach((n) => popIn(tl, q, n.cls, L(T(n.word) - 0.12)));
    NEEDS.forEach((_, i) => draw(tl, q, `.p1s06-ln${i}`, L(T('available') - 0.2 + i * 0.08), 0.55, 'power2.inOut'));
    pulseOnce(tl, q, 'p1s06-pulse', L(T('mission') - 0.1), 1.1);
  });

  const fly = ramp(t, T('aircraft') - 0.1, T('somewhere') + 0.5, inOutSine);
  const [dx, dy] = toScreen(DEST, cam);
  const [bx, by] = toScreen(BASE, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <RangeRing cls="p1s06-rr" cx={BASE[0]} cy={BASE[1]} r={RANGE} dash={[10, 8]} color={C.ink} fill={C.ink} fillOpacity={0.05} dot start={0} />
        <MovingTrack cls="p1s06-jet" pts={ROUTE} progress={fly} color={C.ink} width={2.4} dash={[9, 7]} icon="jet" iconSize={44} iconColor={C.ink} iconFill={C.ink} />
        <Dest />
        <Pulse cls="p1s06-pulse" cx={DEST[0]} cy={DEST[1]} r0={6} r1={70} color={C.red} />
      </MapSvg>
      <MapLabel cls="p1s06-base" x={bx + 24} y={by + 34} text="Cold Lake" size={34} color={C.inkSoft} anchor="left" />
      <SvgLayer>
        <g fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="10 8">
          {NEEDS.map((n, i) => (
            <path key={n.cls} className={`p1s06-ln${i}`} d={`M${dx + n.dx * 0.78} ${dy + n.dy * 0.7} L${dx + n.dx * 0.12} ${dy + n.dy * 0.12}`} />
          ))}
        </g>
      </SvgLayer>
      {NEEDS.map((n) => (
        <IconBadge key={n.cls} cls={n.cls} x={dx + n.dx} y={dy + n.dy} icon={n.icon} size={150} label={n.label} labelSize={34} />
      ))}
    </AbsoluteFill>
  );
};

const Dest: React.FC = () => {
  const px = usePx();
  return (
    <g>
      <circle cx={DEST[0]} cy={DEST[1]} r={px(16)} fill="none" stroke={C.red} strokeWidth={px(3.2)} />
      <circle cx={DEST[0]} cy={DEST[1]} r={px(7)} fill={C.red} />
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('aircraft') - 0.3, file: 'jet_flyby', vol: 0.16, dur: 2.6, fadeOut: 0.8},
  {at: T('range') - 0.1, file: 'pen_scribble', vol: 0.12, dur: 0.9, fadeOut: 0.3},
  ...NEEDS.map((n) => ({at: T(n.word) - 0.12 - 0.004, file: 'pop', vol: 0.2, dur: 0.3})),
  {at: T('available') - 0.2, file: 'marker_swipe', vol: 0.14, dur: 0.6},
];
