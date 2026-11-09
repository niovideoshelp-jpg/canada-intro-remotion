// 165.86–182.13  "At 103 meters long, with a stated range of 6,800 nautical miles, they can carry cargo, vehicles, and
// smaller boats, as well as accommodate helicopters depending on the mission. That allows them to support teams ashore,
// conduct patrols, and take part in rescues."
// O recorte do DeWolf grande no centro (proa a esquerda). Cota 103 M ao longo do casco; contador 6,800 NAUTICAL MILES.
// Carga, veiculos e botes aparecem sobre o navio e o helicoptero pousa no convoo da popa. Depois o navio sobe e tres
// discos em linha: equipes em terra, patrulhas e resgates.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Counter, countAt, Dimension, Icon, IconBadge, SvgLayer} from '../../../components/kit';
import {Sticker} from '../../../components/Sticker';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, slideIn, wipeText} from '../../../lib/tl';
import {dimIn, popIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s13');

// o recorte (1575 x 834 px) e pontos dele, em px do recorte
const SH = {x: 860, y: 450, w: 1240};
const K = SH.w / 1575;
const sx = (px: number) => SH.x - SH.w / 2 + px * K;
const sy = (py: number) => SH.y - (834 * K) / 2 + py * K;
const BOW: [number, number] = [sx(168), sy(788)];
const STERN: [number, number] = [sx(1522), sy(788)];
const HELIDECK: [number, number] = [sx(1330), sy(500)];
const ITEMS = [
  {cls: 'p2s13-cargo', word: 'cargo', icon: 'cargo', x: sx(250), y: sy(330)},
  {cls: 'p2s13-truck', word: 'vehicles', icon: 'truck', x: sx(560), y: sy(110)},
  {cls: 'p2s13-boat', word: 'boats', icon: 'boat', x: sx(830), y: sy(570)},
] as const;
const ROW = [
  {cls: 'p2s13-ashore', word: 'ashore', icon: 'people', label: 'Teams ashore', x: 520},
  {cls: 'p2s13-patrol', word: 'patrols', icon: 'route', label: 'Patrols', x: 960},
  {cls: 'p2s13-rescue', word: 'rescues', icon: 'lifebuoy', label: 'Rescues', x: 1400},
] as const;

export const P2S13: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s13-dw', L(165.66), -1600, 0, 0.7);
    dimIn(tl, q, 'p2s13-len', L(T('103') - 0.2));
    fadeIn(tl, q, '.p2s13-nm', L(T('6') - 0.25), 0.25);
    wipeText(tl, q, '.p2s13-nm-unit', L(T('nautical') - 0.1), 0.45);
    ITEMS.forEach((it) => popIn(tl, q, it.cls, L(T(it.word) - 0.12)));
    popSvg(tl, q, '.p2s13-heli', L(T('helicopters') - 0.3));
    ROW.forEach((r) => popIn(tl, q, r.cls, L(T(r.word) - 0.15)));
  });

  const nm = countAt(t, T('6') - 0.25, T('800') + 0.4, 0, 6800);
  // o helicoptero desce do alto ate o convoo
  const heli = ramp(t, T('helicopters') - 0.3, T('helicopters') + 0.8, inOutSine);
  const hy = lerp(HELIDECK[1] - 260, HELIDECK[1] - 52, heli);
  // "That allows them...": o navio sobe e encolhe para a linha de discos
  const up = ramp(t, T('allows') - 0.5, T('allows') + 0.2, inOutCubic);
  const infoOut = ramp(t, T('cargo') - 0.5, T('cargo') - 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${SH.x}px 60px`, transform: `translate(${lerp(0, 100, up)}px, ${lerp(0, -10, up)}px) scale(${lerp(1, 0.66, up)}) rotate(0.03deg)`}}>
        <Sticker cls="p2s13-dw" src="img/dewolf.png" x={SH.x} y={SH.y} w={SH.w} />
        <SvgLayer>
          <g opacity={1 - infoOut * 0.6}>
            <Dimension cls="p2s13-len" from={[BOW[0], BOW[1] + 40]} to={[STERN[0], STERN[1] + 40]} label="103 M" side={1} size={54} />
          </g>
          <g className="p2s13-heli" style={{visibility: 'hidden'}}>
            <Icon name="helicopter" x={HELIDECK[0]} y={hy} size={150} color={C.black} fill={C.ink} shadow />
          </g>
        </SvgLayer>
        {ITEMS.map((it) => (
          <IconBadge key={it.cls} cls={it.cls} x={it.x} y={it.y} icon={it.icon} size={128} ring="red" />
        ))}
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - infoOut}}>
        <Counter cls="p2s13-nm" x={1560} y={150} value={nm} digits={4} size={120} unit="Nautical miles" unitSize={36} />
      </div>
      {ROW.map((r) => (
        <IconBadge key={r.cls} cls={r.cls} x={r.x} y={860} icon={r.icon} size={160} label={r.label} labelSize={40} />
      ))}
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: 165.66, file: 'whoosh_soft2', vol: 0.12, dur: 0.9},
  {at: T('103') - 0.2, file: 'pen_scribble', vol: 0.12, dur: 0.8, fadeOut: 0.3},
  {at: T('6') - 0.25, file: 'riser', vol: 0.05, dur: 1.2, fadeOut: 0.4},
  {at: T('cargo') - 0.12, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('vehicles') - 0.12, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('boats') - 0.12, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('helicopters') - 0.4, file: 'heli_flyby', vol: 0.14, dur: 2.2, fadeIn: 0.3, fadeOut: 0.9},
  {at: T('ashore') - 0.15, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('patrols') - 0.15, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('rescues') - 0.15, file: 'pop2', vol: 0.16, dur: 0.3},
];
