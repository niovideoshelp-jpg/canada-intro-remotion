// 302.80–317.83  "Their knowledge of the terrain helps other units operate in a region where just getting there and moving
// around takes considerable preparation. Operation Nanook exercises train forces for situations such as casualty
// evacuations, aircraft crashes and ice reconnaissance."
// Paisagem do Artico em camadas (Victor Bay, Nunavut) com parallax lento. No "terrain" uma trilha vermelha tracejada sobe
// e atravessa os morros, com o Ranger (boneco vermelho) na frente. Tres vagas tracejadas no "situations" e
// cada disco entra na sua palavra: evacuacao de feridos, queda de aeronave, reconhecimento do gelo.
// Placa: terrain-bg/fg nao existem (ainda); se chegarem, troque PLATE e redesenhe ROUTE sobre o relevo novo.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {IconBadge, MovingTrack, SvgLayer} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {Depth, Plate} from '../../../components/Sticker';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {marker} from '../../../lib/tl';
import {popIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s21');

const PLATE = {bg: 'img/arctic-bg.jpg', fg: 'img/arctic-fg.png', w: 2280};
const D_BG = 0.35;
const D_FG = 0.6;

// trilha (coordenadas de tela da camada distante, zoom 1): sai da praia a esquerda, sobe a encosta iluminada, passa
// abaixo dos dois picos e desce ate o promontorio
const ROUTE: [number, number][] = [
  [70, 492], [180, 488], [270, 476], [340, 456], [400, 446], [452, 424], [500, 410], [540, 384], [570, 360], [600, 336],
  [640, 348], [690, 356], [740, 350], [785, 346], [830, 362], [878, 384], [920, 404],
];

const ROW_Y = 805;
const SIT = [
  {cls: 'p2s21-cas', icon: 'medical', label: 'Casualty evacuation', x: 520, small: null},
  {cls: 'p2s21-crash', icon: 'jet', label: 'Aircraft crashes', x: 960, small: {icon: 'warning', ring: 'red'}},
  {cls: 'p2s21-ice', icon: 'magnifier', label: 'Ice reconnaissance', x: 1400, small: {icon: 'snowflake', ring: 'ink'}},
] as const;
const BADGE = 168;

export const P2S21: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const at3 = [T('casualty') - 0.12, T('aircraft') - 0.08, T('ice') - 0.12];

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    marker(tl, q, 'p2s21-nk', L(T('operation') - 0.1));
    tl.fromTo(q('.p2s21-slot'), {autoAlpha: 0, scale: 0.7, transformOrigin: '50% 50%'}, {autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)', stagger: 0.1}, L(T('situations') - 0.15));
    SIT.forEach((s, k) => {
      popIn(tl, q, s.cls, L(at3[k]));
      tl.to(q(`.p2s21-slot${k}`), {autoAlpha: 0, duration: 0.2, ease: 'power1.in'}, L(at3[k] + 0.1));
      if (s.small) popIn(tl, q, `${s.cls}-s`, L(at3[k] + 0.2));
    });
  });

  // camera: avanco lento com parallax entre as camadas
  const p = ramp(t, 302.5, 318.1, inOutSine);
  const px = lerp(40, -40, p);
  const py = lerp(14, -10, p);
  const zoom = lerp(1.0, 1.1, p);
  // a trilha do Ranger: comeca no "terrain"; apaga um pouco quando a Operation Nanook entra
  const prog = ramp(t, T('terrain') - 0.25, T('around') + 0.3, inOutSine);
  const routeOp = lerp(1, 0.55, ramp(t, T('operation') - 0.5, T('operation') + 0.2, inOutCubic));
  const shade = ramp(t, T('operation') - 0.5, T('operation') + 0.3, inOutCubic);

  return (
    <AbsoluteFill ref={scope} style={{backgroundColor: '#20201f'}}>
      <Depth depth={D_BG} px={px} py={py} zoom={zoom}>
        <Plate src={PLATE.bg} w={PLATE.w} />
        <SvgLayer style={{opacity: routeOp}}>
          {/* halo escuro sob a trilha (le sobre o morro escuro e sobre o ceu) */}
          <MovingTrack pts={ROUTE} progress={prog} color={C.black} width={11} dash={null} trailOpacity={0.4} head={false} />
          <MovingTrack
            cls="p2s21-rt"
            pts={ROUTE}
            progress={prog}
            color={C.red}
            width={6}
            dash={[15, 10]}
            icon="person"
            iconSize={60}
            iconColor={C.black}
            iconFill={C.red}
            iconStrokeW={2}
            orient="none"
            head={prog > 0.002}
          />
        </SvgLayer>
      </Depth>
      <Depth depth={D_FG} px={px} py={py} zoom={zoom}>
        <Plate src={PLATE.fg} w={PLATE.w} />
      </Depth>
      {/* escurece o ceu e a agua de leve para os rotulos; mais embaixo quando entram os discos */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(10,10,10,0.22) 0%, rgba(10,10,10,0.04) 40%, rgba(10,10,10,${0.18 + 0.32 * shade}) 100%)`}} />

      {/* a mesma textura do papel sobre a foto, bem leve, para a foto pertencer ao filme */}
      <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.4}}>
        <Img src={staticFile('bg/grid.jpg')} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>

      <MarkerLabel cls="p2s21-nk" x={960} y={140} text="Operation Nanook" size={72} />
      <SvgLayer>
        {SIT.map((s, k) => (
          <g key={k} className={`p2s21-slot p2s21-slot${k}`} style={{visibility: 'hidden'}}>
            <circle cx={s.x} cy={ROW_Y} r={BADGE / 2} fill={C.black} fillOpacity={0.35} stroke={C.ink} strokeOpacity={0.8} strokeWidth={4} strokeDasharray="14 10" />
          </g>
        ))}
      </SvgLayer>
      {SIT.map((s) => (
        <React.Fragment key={s.cls}>
          <IconBadge cls={s.cls} x={s.x} y={ROW_Y} icon={s.icon} size={BADGE} label={s.label} labelSize={38} />
          {s.small ? (
            <IconBadge
              cls={`${s.cls}-s`}
              x={s.x + BADGE * 0.4}
              y={ROW_Y - BADGE * 0.4}
              icon={s.small.icon}
              size={80}
              ring={s.small.ring}
              iconColor={s.small.ring === 'red' ? C.red : C.ink}
            />
          ) : null}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: 302.6, file: 'wind_arctic', vol: 0.1, dur: 8.0, fadeIn: 0.6, fadeOut: 1.6},
  {at: T('terrain') - 0.25, file: 'snow_steps', vol: 0.09, dur: 2.6, fadeIn: 0.2, fadeOut: 0.8},
  {at: T('operation') - 0.17, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('situations') - 0.15, file: 'tick', vol: 0.07, dur: 0.3},
  {at: T('casualty') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('aircraft') - 0.08, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('ice') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
];
