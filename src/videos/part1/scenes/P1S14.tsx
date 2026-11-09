// 172.84–192.00  "So counting how many troops are stationed in the far north only tells you part of the story.
// Responding to an emergency in a remote community and detecting an air attack coming across the Arctic are very
// different jobs. The sensors, the forces needed to respond, and even the partners involved will vary depending on
// the threat."
// 1) Bonecos de soldado sao contados um a um num quadro; a camera recua e o quadro e so 1 de 9 (os outros, vazios:
//    "the rest of the story"). 2) Tela dividida: emergencia numa comunidade remota | bombardeiros cruzando o Artico com
//    o radar varrendo (ancora da abertura). "≠" no meio. 3) A AMEACA no topo e tres colunas (SENSORS, FORCES, PARTNERS);
//    quando a ameaca vira de emergencia para ataque aereo, as tres viram junto. Ponte para a Parte 2 (sensores).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NotEqual} from '../../../components/Bits';
import {Icon, IconBadge, MovingTrack, PictogramGrid, RadarSweep, SplitPanel, sweepAngle, trackHead, trackPoly} from '../../../components/kit';
import type {IconName} from '../../../components/kit';
import {MapSvg} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR2, polarProject} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {ticks} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, wipeText} from '../../../lib/tl';
import {gridIn, popIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s13');

// ---- 1) o quadro das tropas e os outros 8 quadros
const TW = 470;
const TH = 270;
const GAP = 36;
const TILES = Array.from({length: 9}, (_, i) => ({c: i % 3, r: Math.floor(i / 3)}))
  .map(({c, r}) => ({x: 960 + (c - 1) * (TW + GAP), y: 540 + (r - 1) * (TH + GAP), center: c === 1 && r === 1}));
const OTHER_ICONS: IconName[] = ['radarDish', 'satellite', 'ship', 'jet', 'handshake', 'house', 'medical', 'submarine'];
const N_TROOPS = 24;

// ---- 2) a tela dividida
const BOMBERS = POLAR2.bomberTracks;
const POLYS = BOMBERS.map((b) => trackPoly(b.pts));
// radar de longo alcance da NORAD em Cape Romanzof (oeste do Alasca), de frente para o mar de Bering
const ANC = polarProject(-166.0, 61.8);
const KEYS: CamKey[] = [
  {t: 180.4, x: 548, y: 598, s: 2.6, r: -6},
  {t: 184.8, x: 554, y: 602, s: 2.8, r: -6, ease: inOutSine},
];
const HOUSES = [-170, -85, 0, 85, 170];
const groundY = (x: number) => 770 + 7 * Math.sin(x / 70) + 4 * Math.sin(x / 23);
const GROUND_D = Array.from({length: 49}, (_, i) => 540 + i * 18)
  .map((x, i) => `${i ? 'L' : 'M'}${x},${groundY(x).toFixed(1)}`)
  .join('');

// ---- 3) ameaca + tres colunas (variante A = emergencia, B = ataque aereo)
const COLS: {x: number; word: string; label: string; a: IconName; b: IconName}[] = [
  {x: 560, word: 'sensors', label: 'Sensors', a: 'satellite', b: 'radarDish'},
  {x: 960, word: 'forces', label: 'Forces', a: 'people', b: 'jet'},
  {x: 1360, word: 'partners', label: 'Partners', a: 'house', b: 'handshake'},
];
const COL_Y = 540;
const THREAT = {x: 960, y: 205};

export const P1S14: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    gridIn(tl, q, 'p1s14-tr', L(T('counting') - 0.05), 0.085);
    // 2
    draw(tl, q, '.p1s14-ground', L(T('responding') - 0.25), 0.8, 'power2.out');
    draw(tl, q, '.p1s14-path', L(T('responding') - 0.05), 1.1, 'power1.inOut');
    popIn(tl, q, 'p1s14-er', L(T('emergency') - 0.12));
    HOUSES.forEach((_, k) => popSvg(tl, q, `.p1s14-h${k}`, L(T('community') - 0.3 + k * 0.06)));
    tl.fromTo(q('.p1s14-ne'), {autoAlpha: 0, scale: 1.6}, {autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out'}, L(T('different') - 0.1));
    // 3
    popIn(tl, q, 'p1s14-thA', L(T('sensors') - 0.5));
    COLS.forEach((c, k) => {
      draw(tl, q, `.p1s14-cn${k}`, L(T(c.word) - 0.35), 0.35, 'power2.out');
      popIn(tl, q, `p1s14-c${k}A`, L(T(c.word) - 0.12));
      wipeText(tl, q, `.p1s14-l${k}`, L(T(c.word) + 0.05), 0.4);
    });
  });

  // 1) zoom no quadro das tropas -> recua em "part of the story"
  const back = ramp(t, T('only') - 0.15, T('story') + 0.15, inOutCubic);
  const z = lerp(2.5, 1, back);
  const others = ramp(t, T('part') - 0.35, T('story') + 0.35, inOutSine);
  const tilesOut = 1 - ramp(t, T('responding') - 0.45, T('responding') - 0.05, inOutSine);

  // 2) a divisao entra no "detecting"; o lado esquerdo corre para a esquerda
  const split = ramp(t, T('detecting') - 0.4, T('detecting') + 0.3, inOutCubic);
  const splitOut = 1 - ramp(t, T('jobs') + 0.3, T('sensors') - 0.55, inOutSine);
  const walk = ramp(t, T('responding') - 0.05, T('community') + 0.2, inOutSine);
  // so a ida (ate o mar de Bering), dentro do alcance do radar
  const pb = 0.5 * ramp(t, T('detecting') - 0.9, T('jobs') + 0.6, inOutSine);
  const heads = POLYS.map((p) => trackHead(p, pb).p);

  // 3) a virada: primeiro a ameaca, depois as colunas
  const F0 = T('depending') - 0.15;
  const flip = (k: number) => ramp(t, F0 + k * 0.16, F0 + k * 0.16 + 0.34, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- 1 ---------------- */}
      {tilesOut > 0 ? (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: tilesOut}}>
          <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
            {TILES.map((tile, i) =>
              tile.center ? (
                <rect key={i} x={tile.x - TW / 2} y={tile.y - TH / 2} width={TW} height={TH} rx={12} fill={C.black} fillOpacity={0.45} stroke={C.ink} strokeWidth={3 / z} />
              ) : (
                <g key={i} opacity={others}>
                  <rect x={tile.x - TW / 2} y={tile.y - TH / 2} width={TW} height={TH} rx={12} fill="none" stroke={C.ink} strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="14 10" />
                  <Icon name={OTHER_ICONS[i > 4 ? i - 1 : i]} x={tile.x} y={tile.y} size={110} color={C.ink} opacity={0.32} />
                </g>
              ),
            )}
            <PictogramGrid cls="p1s14-tr" x={960} y={540} n={N_TROOPS} cols={8} icon="person" size={44} cellW={52} cellH={70} state="on" />
          </g>
        </svg>
      ) : null}

      {/* ---------------- 2 ---------------- */}
      {/* sempre montado (o GSAP so anima o que existe quando a cena monta); escondido por opacidade */}
      <AbsoluteFill style={{opacity: t > T('responding') - 0.5 ? splitOut : 0}}>
          <SplitPanel
            progress={split}
            tintLeft={0}
            tintRight={0}
            left={
              <AbsoluteFill style={{transform: `translate(${lerp(0, -470, split)}px, 0px) rotate(0.03deg)`}}>
                <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
                  <path className="p1s14-ground" d={GROUND_D} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
                  <path className="p1s14-path" d={`M560 ${groundY(560) - 18} L${960 - 230} ${groundY(730) - 18}`} fill="none" stroke={C.ink} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
                  {HOUSES.map((dx, k) => (
                    <g key={k} className={`p1s14-h${k}`}>
                      <Icon name="house" x={960 + 80 + dx * 0.9} y={groundY(1040 + dx) - 42} size={86} color={C.black} fill={C.ink} />
                    </g>
                  ))}
                  {walk > 0.01 ? <Icon name="people" x={lerp(600, 700, walk)} y={groundY(650) - 58} size={110} color={C.black} fill={C.ink} /> : null}
                </svg>
                <IconBadge cls="p1s14-er" x={1040} y={470} icon="medical" size={190} ring="red" iconColor={C.red} />
              </AbsoluteFill>
            }
            right={
              <AbsoluteFill>
                <MapSvg cam={cam}>
                  <PolarBase />
                  <RadarSweep cx={ANC[0]} cy={ANC[1]} r={105} angle={sweepAngle(t, T('detecting') - 0.4, 2.4)} start={0} strength={0.26} blips={heads.map(([x, y]) => ({x, y}))} cls="p1s14-rs" />
                  {BOMBERS.map((b) => (
                    <MovingTrack key={b.id} pts={b.pts} progress={pb} color={C.red} width={3} dash={[3, 2.4]} tail={70} icon="bomber" iconSize={54} iconColor={C.black} iconFill={C.red} />
                  ))}
                </MapSvg>
              </AbsoluteFill>
            }
          />
          <NotEqual cls="p1s14-ne" x={960} y={540} size={150} />
      </AbsoluteFill>

      {/* ---------------- 3 ---------------- */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {COLS.map((c, k) => (
          <path key={k} className={`p1s14-cn${k}`} d={`M${THREAT.x} ${THREAT.y + 82} L${c.x} ${COL_Y - 120}`} fill="none" stroke={C.ink} strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
        ))}
      </svg>
      <Flip x={THREAT.x} y={THREAT.y} f={flip(0)} a={<IconBadge cls="p1s14-thA" x={THREAT.x} y={THREAT.y} icon="medical" size={140} ring="red" iconColor={C.red} />} b={<IconBadge cls="p1s14-thB" x={THREAT.x} y={THREAT.y} icon="bomber" size={140} ring="red" iconColor={C.red} iconFill={C.red} />} />
      {COLS.map((c, k) => (
        <React.Fragment key={k}>
          <Flip x={c.x} y={COL_Y} f={flip(k + 1)} a={<IconBadge cls={`p1s14-c${k}A`} x={c.x} y={COL_Y} icon={c.a} size={200} />} b={<IconBadge cls={`p1s14-c${k}B`} x={c.x} y={COL_Y} icon={c.b} size={200} ring="red" iconColor={C.red} />} />
          <div style={at(c.x, COL_Y + 160)}>
            <div className={`p1s14-l${k}`} style={{fontFamily: ANTON, fontSize: 58, color: C.ink, letterSpacing: '0.08em', marginRight: '-0.08em', textTransform: 'uppercase', textShadow: `0 3px 14px ${C.shadow}`}}>
              {c.label}
            </div>
          </div>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

/** Vira um disco como uma moeda: `a` encolhe na horizontal ate sumir e `b` abre no lugar. f = 0..1. */
const Flip: React.FC<{x: number; y: number; f: number; a: React.ReactNode; b: React.ReactNode}> = ({x, y, f, a, b}) => {
  const sa = f < 0.5 ? 1 - 2 * f : 0;
  const sb = f >= 0.5 ? 2 * f - 1 : 0;
  return (
    <>
      {sa > 0.001 ? <div style={{position: 'absolute', inset: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${Math.max(sa, 0.001)}, 1) rotate(0.03deg)`}}>{a}</div> : null}
      {sb > 0.001 ? <div style={{position: 'absolute', inset: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${sb}, 1) rotate(0.03deg)`}}>{b}</div> : null}
    </>
  );
};

export const cues: Cue[] = [
  ...ticks(T('counting') - 0.05, T('counting') - 0.05 + N_TROOPS * 0.085, 12, 0.05, 'in'),
  {at: T('only') - 0.15, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('responding') - 0.25, file: 'snow_steps', vol: 0.08, dur: 1.8, fadeIn: 0.2, fadeOut: 0.6},
  {at: T('emergency') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('detecting') - 0.4, file: 'whoosh_soft2', vol: 0.16, dur: 1.0},
  {at: T('air') - 0.1, file: 'radar_ping', vol: 0.11, dur: 1.0},
  {at: T('different') - 0.1, file: 'stamp', vol: 0.18, dur: 0.6},
  {at: T('sensors') - 0.5, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('sensors') - 0.12, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('forces') - 0.12, file: 'pop2', vol: 0.18, dur: 0.3},
  {at: T('partners') - 0.12, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('depending') - 0.15, file: 'paper_slide2', vol: 0.12, dur: 0.7},
  {at: T('threat') - 0.05, file: 'boom', vol: 0.13, dur: 2.0, fadeOut: 1.0},
];
