// 96.72–107.56  "Once a threat is detected, someone has to respond. Canada's CF-18s are still doing that job through NORAD
// alongside U.S. forces as the country prepares to replace its fighter fleet."
// Mapa polar no mar de Bering: os bombardeiros (ancora #2) entram no anel vermelho de deteccao. No "respond" o mapa
// escurece e o CF-18 (recorte) entra grande pela esquerda. NORAD: um colchete de giz liga o CF-18 ao F-22 americano.
// No "replace" o CF-18 sai e fica so o contorno tracejado de um caca no lugar dele (a vaga que o F-35 vai ocupar).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Icon, MovingTrack, Pulse, RadarSweep, RangeRing, SvgLayer, sweepAngle, trackHead, trackPoly} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {Sticker} from '../../../components/Sticker';
import {POLAR2, polarProject} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, slideIn, wipeText} from '../../../lib/tl';
import {pulseOnce, ringIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';
import {JET_SLOT} from './shared';

const T = TS('s08');

const BOMBERS = POLAR2.bomberTracks;
const POLYS = BOMBERS.map((b) => trackPoly(b.pts));
const RADAR = polarProject(-166.0, 61.8); // Cape Romanzof (NORAD, oeste do Alasca)
const DET_F = 0.36; // fracao da trajetoria quando sao detectados
const DET = trackHead(POLYS[0], DET_F).p;

const KEYS: CamKey[] = [
  {t: 96.4, x: 728, y: 590, s: 2.7, r: -6},
  {t: 99.0, x: 724, y: 596, s: 3.0, r: -6, ease: inOutSine},
  {t: 100.6, x: 720, y: 600, s: 3.9, r: -7, ease: inOutCubic}, // "respond": empurra
  {t: 107.9, x: 718, y: 602, s: 4.1, r: -7, ease: inOutSine},
];

export const P2S08: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    ringIn(tl, q, 'p2s08-det', L(T('detected') - 0.2), 0.6);
    pulseOnce(tl, q, 'p2s08-pls', L(T('detected') - 0.05), 1.0);
    slideIn(tl, q, '.p2s08-cf', L(T('respond') - 0.25), -1500, 0, 0.8);
    wipeText(tl, q, '.p2s08-cf-l', L(T('cf') - 0.1), 0.4);
    draw(tl, q, '.p2s08-br', L(T('norad') - 0.3), 0.7, 'power2.inOut');
    marker(tl, q, 'p2s08-norad', L(T('norad') - 0.05));
    slideIn(tl, q, '.p2s08-us', L(T('u') - 0.35), 1300, 0, 0.75);
    // "replace": o CF-18 sai pela esquerda, o resto se apaga, fica o contorno
    tl.to(q('.p2s08-cf'), {x: -1500, autoAlpha: 0, duration: 0.6, ease: 'power3.in'}, L(T('replace') - 0.2));
    tl.to(q('.p2s08-cf-l, .p2s08-us, .p2s08-br, .p2s08-norad-bar, .p2s08-norad-txt'), {autoAlpha: 0, duration: 0.45, ease: 'power1.in'}, L(T('replace') - 0.1));
    tl.fromTo(q('.p2s08-slot'), {autoAlpha: 0}, {autoAlpha: 1, duration: 0.4, ease: 'power1.out'}, L(T('replace') + 0.1));
  });

  const pb = 0.5 * ramp(t, 96.0, T('respond') + 0.6, inOutSine);
  const heads = POLYS.map((p) => trackHead(p, pb).p);
  const dim = 0.62 * ramp(t, T('respond') - 0.4, T('respond') + 0.2, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <PolarBase />
        <RadarSweep cx={RADAR[0]} cy={RADAR[1]} r={105} angle={sweepAngle(t, 96.0, 2.4)} start={0} strength={0.24} blips={heads.map(([x, y]) => ({x, y}))} cls="p2s08-rs" />
        {BOMBERS.map((b) => (
          <MovingTrack key={b.id} pts={b.pts} progress={pb} color={C.red} width={3} dash={[3, 2.4]} tail={70} icon="bomber" iconSize={52} iconColor={C.black} iconFill={C.red} />
        ))}
        <RangeRing cls="p2s08-det" cx={DET[0]} cy={DET[1]} r={26} color={C.red} width={4} dash={null} start={0} />
        <Pulse cls="p2s08-pls" cx={DET[0]} cy={DET[1]} r0={10} r1={70} color={C.red} width={4} />
      </MapSvg>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />

      {/* NORAD: um colchete sob os dois cacas */}
      <SvgLayer>
        <path className="p2s08-br" d={`M${JET_SLOT.x} ${JET_SLOT.y + 150} L${JET_SLOT.x} ${JET_SLOT.y + 260} L1450 ${JET_SLOT.y + 260} L1450 ${JET_SLOT.y + 130}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {/* a vaga: contorno tracejado de um caca */}
        <g className="p2s08-slot">
          <Icon name="jetSide" x={JET_SLOT.x} y={JET_SLOT.y} size={JET_SLOT.w * 0.86} color={C.ink} dashed strokeW={5} />
        </g>
      </SvgLayer>
      <Sticker cls="p2s08-us" src="img/usjet.png" x={1450} y={JET_SLOT.y - 10} w={600} />
      <Sticker cls="p2s08-cf" src="img/cf18.png" x={JET_SLOT.x} y={JET_SLOT.y} w={JET_SLOT.w} />
      <MapLabel cls="p2s08-cf-l" x={JET_SLOT.x} y={JET_SLOT.y - 230} text="CF-18" size={88} color={C.ink} />
      <MarkerLabel cls="p2s08-norad" x={(JET_SLOT.x + 1450) / 2} y={JET_SLOT.y + 260} text="NORAD" size={64} />
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('detected') - 0.25, file: 'radar_ping', vol: 0.14, dur: 1.0},
  {at: T('respond') - 0.3, file: 'jet_flyby', vol: 0.24, dur: 2.4, fadeOut: 0.8},
  {at: T('norad') - 0.1, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('u') - 0.35, file: 'whoosh_soft2', vol: 0.14, dur: 1.0},
  {at: T('replace') - 0.2, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
];
