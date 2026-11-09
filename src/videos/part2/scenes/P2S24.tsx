// 352.12–390.50  (storyboard P2S24 + P2S25, uma cena so; o fim da Parte 2)
// "Canada is also planning a network of support hubs in the north, with investment projected at 2.67 billion Canadian
// dollars between 2024 and 2044. In March 2026, the government also announced a package worth 32 billion Canadian dollars
// for NORAD-related infrastructure in Yellowknife, Inuvik, Iqaluit, and Goose Bay. That includes runways, hangars, fuel
// facilities, and ammunition storage. As those projects are completed, the goal is to bring forces into the region and
// support longer missions, with maintenance, storage, and medical care closer to where personnel need to operate."
// Mapa do norte: os pontos da rede de apoio se ligam com giz; C$2.67 BILLION e 2024–2044. Carimbo MARCH 2026 e C$32
// BILLION (vermelho). Quatro pinos vermelhos com os nomes, um por palavra; pista, hangar, combustivel e municao numa linha.
// No fim: setas vermelhas sobem do sul ate os quatro, lacos tracejados mais longos saem deles para o Artico, e cada um
// ganha manutencao, deposito e atendimento medico. A camera recua devagar e segura a rede acesa.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw, HandArrow} from '../../../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, countAt, Icon, IconBadge, IconHtml, Stamp, Timeline} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {CA} from '../../../data/maps';
import {caPlace} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, pop, wipeText} from '../../../lib/tl';
import {popIn, popSvg, STAMP_HIT, stampIn, timelineIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s23');

type P = [number, number];
// a rede de apoio (pontos do norte) e as ligacoes
const HUB_NAMES = ['Whitehorse', 'Inuvik', 'Yellowknife', 'Kugluktuk', 'Cambridge Bay', 'Resolute', 'Rankin Inlet', 'Hall Beach', 'Iqaluit', 'Kuujjuaq', 'Goose Bay'] as const;
const HUBS = HUB_NAMES.map((n) => caPlace(n) as P);
const LINKS: [number, number][] = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 6], [4, 6], [6, 7], [5, 7], [7, 8], [6, 8], [8, 9], [9, 10], [8, 10],
];
// os quatro do pacote NORAD, na ordem da fala
const FOUR = [
  {name: 'Yellowknife', word: 'yellowknife', p: caPlace('Yellowknife') as P, dx: -20, dy: 64},
  {name: 'Inuvik', word: 'inuvik', p: caPlace('Inuvik') as P, dx: -10, dy: -70},
  {name: 'Iqaluit', word: 'iqaluit', p: caPlace('Iqaluit') as P, dx: 40, dy: -70},
  {name: 'Goose Bay', word: 'goose', p: caPlace('Goose Bay') as P, dx: 60, dy: 66},
];
// "longer missions": um laco tracejado de cada base para dentro do Artico
const LOOPS: string[] = FOUR.map(({p}, i) => {
  const tgt: P[] = [[700, 210], [600, 250], [1060, 250], [1240, 420]];
  const [tx, ty] = tgt[i];
  const c1: P = [p[0] + (tx - p[0]) * 0.2 - 90, p[1] + (ty - p[1]) * 0.6];
  const c2: P = [tx - 60, ty + 30];
  const c3: P = [tx + 70, ty - 10];
  const c4: P = [p[0] + (tx - p[0]) * 0.3 + 90, p[1] + (ty - p[1]) * 0.4];
  return `M${p[0]},${p[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${tx},${ty} C${c3[0]},${c3[1]} ${c4[0]},${c4[1]} ${p[0]},${p[1]}`;
});
// ("storage" aparece duas vezes: "ammunition storage" e depois "maintenance, storage")
const NEEDS = [
  {word: 'maintenance', n: 1, icon: 'wrench'},
  {word: 'storage', n: 2, icon: 'cargo'},
  {word: 'medical', n: 1, icon: 'medical'},
] as const;
const ROW = [
  {cls: 'p2s24-rw', word: 'runways', icon: 'runway', label: 'Runways', x: 560},
  {cls: 'p2s24-hg', word: 'hangars', icon: 'hangar', label: 'Hangars', x: 830},
  {cls: 'p2s24-fu', word: 'fuel', icon: 'fuel', label: 'Fuel', x: 1100},
  {cls: 'p2s24-am', word: 'ammunition', icon: 'ammo', label: 'Ammunition', x: 1370},
] as const;

const KEYS: CamKey[] = [
  {t: 351.9, x: 900, y: 470, s: 1.25, r: 0},
  {t: 361.9, x: 905, y: 470, s: 1.3, r: 0, ease: inOutSine},
  {t: 370.0, x: 930, y: 470, s: 1.25, r: 0, ease: inOutSine},
  {t: 378.6, x: 930, y: 480, s: 1.2, r: 0, ease: inOutSine},
  {t: 390.8, x: 935, y: 500, s: 1.04, r: 0, ease: inOutSine}, // recua devagar no fim
];

export const P2S24: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    HUBS.forEach((_, i) => popSvg(tl, q, `.p2s24-h${i}`, L(T('network') - 0.2 + i * 0.07), 0, 0.3));
    LINKS.forEach((_, i) => draw(tl, q, `.p2s24-l${i}`, L(T('hubs') - 0.25 + i * 0.05), 0.35, 'power2.out'));
    fadeIn(tl, q, '.p2s24-c1', L(T('2') - 0.2), 0.25);
    wipeText(tl, q, '.p2s24-c1-unit', L(T('billion') - 0.1), 0.4);
    timelineIn(tl, q, 'p2s24-tl', L(T('2024') - 0.3), 0.8);
    tl.to(q('.p2s24-c1, .p2s24-c1-unit'), {autoAlpha: 0.35, duration: 0.4, ease: 'power1.inOut'}, L(T('march') - 0.3));
    tl.to(q('.p2s24-tlw'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('march') - 0.3));
    stampIn(tl, q, 'p2s24-mar', L(T('march') - STAMP_HIT));
    fadeIn(tl, q, '.p2s24-c2', L(T('32') - 0.2), 0.25);
    wipeText(tl, q, '.p2s24-c2-unit', L(T('billion', 2) - 0.1), 0.4);
    FOUR.forEach((f, i) => {
      pop(tl, q, `.p2s24-pin${i}`, L(T(f.word) - 0.12));
      wipeText(tl, q, `.p2s24-n${i}`, L(T(f.word)), 0.4);
    });
    ROW.forEach((r) => popIn(tl, q, r.cls, L(T(r.word) - 0.12)));
    // "bring forces into the region"
    tl.to(q('.p2s24-rw, .p2s24-hg, .p2s24-fu, .p2s24-am, .p2s24-rw-lbl, .p2s24-hg-lbl, .p2s24-fu-lbl, .p2s24-am-lbl, .p2s24-c1, .p2s24-c1-unit, .p2s24-c2, .p2s24-c2-unit, .p2s24-mar'), {autoAlpha: 0, duration: 0.5, ease: 'power1.in'}, L(T('projects') - 0.3));
    FOUR.forEach((_, i) => {
      draw(tl, q, `.p2s24-up${i}-c`, L(T('bring') - 0.25 + i * 0.12), 0.6, 'power2.out');
      draw(tl, q, `.p2s24-up${i}-h`, L(T('bring') + 0.3 + i * 0.12), 0.14, 'none');
      draw(tl, q, `.p2s24-lp${i}-rev`, L(T('longer') - 0.3 + i * 0.14), 1.2, 'power1.inOut');
    });
    NEEDS.forEach((n, k) => FOUR.forEach((_, i) => popSvg(tl, q, `.p2s24-nd${k}-${i}`, L(T(n.word, n.n) - 0.12 + i * 0.05))));
  });

  const c1 = countAt(t, T('2') - 0.2, T('billion') + 0.2, 0, 2.67);
  const c2 = countAt(t, T('32') - 0.2, T('billion', 2) + 0.2, 0, 32);
  const screen = FOUR.map((f) => toScreen(f.p, cam));

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Network />
      </MapSvg>

      {/* os quatro do pacote NORAD */}
      {FOUR.map((f, i) => {
        const [x, y] = screen[i];
        return (
          <React.Fragment key={f.name}>
            <div style={at(x, y - 38)}>
              <div className={`p2s24-pin${i}`}>
                <IconHtml name="pin" x={0} y={0} size={84} color={C.black} fill={C.red} />
              </div>
            </div>
            <MapLabel cls={`p2s24-n${i}`} x={x + f.dx} y={y + f.dy} text={f.name} size={40} color={C.ink} />
          </React.Fragment>
        );
      })}

      {/* dinheiro e prazos */}
      <Counter cls="p2s24-c1" x={250} y={190} value={c1} decimals={2} digits={1} size={120} prefix="C$" anchor="left" unit="Billion" unitSize={36} />
      <div className="p2s24-tlw" style={{position: 'absolute', inset: 0}}>
        <Timeline cls="p2s24-tl" x={460} y={330} w={460} from={2024} to={2044} labels="ends" yearSize={30} />
      </div>
      <Stamp cls="p2s24-mar" x={1560} y={150} text="March 2026" size={64} />
      <Counter cls="p2s24-c2" x={1430} y={300} value={c2} digits={2} size={170} prefix="C$" anchor="left" unit="Billion" unitSize={40} color={C.red} />

      {ROW.map((r) => (
        <IconBadge key={r.cls} cls={r.cls} x={r.x} y={930} icon={r.icon} size={120} label={r.label} labelSize={30} />
      ))}
    </AbsoluteFill>
  );
};

const Network: React.FC = () => {
  const px = usePx();
  return (
    <g>
      {LINKS.map(([a, b], i) => (
        <path key={i} className={`p2s24-l${i}`} d={`M${HUBS[a][0]},${HUBS[a][1]} L${HUBS[b][0]},${HUBS[b][1]}`} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={px(2.2)} strokeLinecap="round" />
      ))}
      {HUBS.map(([x, y], i) => (
        <g key={i} className={`p2s24-h${i}`} style={{visibility: 'hidden'}}>
          <circle cx={x} cy={y} r={px(9)} fill={C.ink} stroke={C.black} strokeWidth={px(2)} />
        </g>
      ))}
      {/* "bring forces": setas vermelhas do sul ate os quatro */}
      {FOUR.map(({p}, i) => (
        <HandArrow key={`u${i}`} cls={`p2s24-up${i}`} from={[p[0] + (i % 2 ? 40 : -30), p[1] + 250]} to={[p[0], p[1] + 26]} bow={i % 2 ? 0.12 : -0.12} color={C.red} width={px(4.5)} />
      ))}
      {/* "longer missions": lacos tracejados */}
      {LOOPS.map((d, i) => (
        <DashedDraw key={`l${i}`} id={`p2s24-lp${i}`} d={d} color={C.ink} opacity={0.85} width={2.6} dash={[px(9), px(7)]} />
      ))}
      {/* manutencao, deposito, atendimento medico junto de cada base */}
      {NEEDS.map((n, k) =>
        FOUR.map(({p, dy}, i) => {
          // do lado oposto ao nome da cidade (nome em cima -> icones embaixo, e vice-versa)
          const ang = ((dy < 0 ? 30 : -150) + k * 60) * (Math.PI / 180);
          const x = p[0] + Math.cos(ang) * px(70);
          const y = p[1] + Math.sin(ang) * px(70);
          return (
            <g key={`${k}-${i}`} className={`p2s24-nd${k}-${i}`} style={{visibility: 'hidden'}}>
              <circle cx={x} cy={y} r={px(22)} fill={C.black} stroke={C.ink} strokeWidth={px(2.4)} />
              <Icon name={n.icon} x={x} y={y} size={px(30)} color={C.ink} />
            </g>
          );
        }),
      )}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('network') - 0.2, file: 'pen_scribble', vol: 0.12, dur: 1.4, fadeOut: 0.4},
  {at: T('2') - 0.2, file: 'riser', vol: 0.05, dur: 1.2, fadeOut: 0.4},
  {at: T('march') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('32') - 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  ...FOUR.map((f, i) => ({at: T(f.word) - 0.12, file: i % 2 ? 'pop2' : 'pop', vol: 0.16, dur: 0.3})),
  ...ROW.map((r, i) => ({at: T(r.word) - 0.12, file: i % 2 ? 'pop2' : 'pop', vol: 0.13, dur: 0.3})),
  {at: T('bring') - 0.25, file: 'whoosh_big', vol: 0.14, dur: 1.5},
  {at: T('longer') - 0.3, file: 'whoosh_soft', vol: 0.12, dur: 1.2},
  ...NEEDS.map((n) => ({at: T(n.word, n.n) - 0.12, file: 'pop', vol: 0.1, dur: 0.3})),
  {at: 386.0, file: 'wind_arctic', vol: 0.1, dur: 4.5, fadeIn: 1.2, fadeOut: 1.5},
];
