// 282.09–302.80  "On land, Canada's permanent presence includes the station at Alert, along with command and support
// facilities. There are also the Canadian Rangers, reservists who live in remote communities and help with patrols,
// observation, and search and rescue. The 2025-26 results report lists more than 1,500 Rangers in the Arctic and the North."
// 1) Mapa: a camera voa ate a ponta da ilha de Ellesmere e o pino vermelho ALERT cai; recua e dois quadrados marcam
//    comando e apoio (Yellowknife e Iqaluit). 2) O mapa vai para a direita; o recorte dos Rangers (moletons vermelhos)
//    entra a esquerda, CANADIAN RANGERS; as comunidades remotas acendem no mapa; tres discos: patrulhas, observacao,
//    busca e salvamento. 3) Carimbo 2025–26 REPORT e o contador 1,500+ RANGERS enquanto bonecos vermelhos se espalham
//    pelas comunidades do norte.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, countAt, Icon, IconBadge, IconHtml, Stamp} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import {CA2, caPlace} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {ticks} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {pop, slideIn, wipeText} from '../../../lib/tl';
import {popIn, popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s20');

// o recorte dos Rangers (public/img/rangers.png, 1174x1076). null = cena sem a foto (so pictogramas).
const RANGERS_IMG: string | null = 'img/rangers.png';

const ALERT = caPlace('Alert');
const FACILITIES = [caPlace('Yellowknife'), caPlace('Iqaluit')];
// comunidades com Rangers: as do norte bem espacadas (sem as cidades e sem os quadrados de Yellowknife/Iqaluit)
const SKIP = new Set(['Whitehorse', 'Yellowknife', 'Iqaluit']);
const PEOPLE = (() => {
  const kept: [number, number][] = [];
  for (const c of CA2.communities) {
    if (SKIP.has(c.name)) continue;
    if (kept.every((k) => Math.hypot(k[0] - c.p[0], k[1] - c.p[1]) >= 30)) kept.push([c.p[0], c.p[1]]);
  }
  // onda de oeste para leste
  return kept.sort((a, b) => a[0] - b[0]);
})();

const KEYS: CamKey[] = [
  {t: 281.8, x: 905, y: 430, s: 1.1, r: 0},
  {t: 282.45, x: 905, y: 425, s: 1.12, r: 0, ease: inOutSine},
  {t: 285.75, x: 978, y: 128, s: 3.4, r: 0, ease: inOutCubic}, // ponta de Ellesmere: Alert
  {t: 286.35, x: 978, y: 130, s: 3.48, r: 0, ease: inOutSine},
  {t: 288.1, x: 915, y: 330, s: 1.55, r: 0, ease: inOutCubic}, // recua: Alert, Yellowknife, Iqaluit
  {t: 288.75, x: 915, y: 332, s: 1.53, r: 0, ease: inOutSine},
  {t: 290.0, x: 463, y: 489, s: 1.0, r: 0, ease: inOutCubic}, // o norte vai para a metade direita (embaixo: o numero)
  {t: 303.1, x: 468, y: 486, s: 1.03, r: 0, ease: inOutSine},
];

const STICK = {x: 450, y: 500, w: 520};
const BADGES = [
  {cls: 'p2s20-pat', word: 'patrols', icon: 'route', label: 'Patrols', x: 230},
  {cls: 'p2s20-obs', word: 'observation', icon: 'eye', label: 'Observation', x: 460},
  {cls: 'p2s20-sar', word: 'search', icon: 'lifebuoy', label: 'Search & rescue', x: 720},
] as const;
const BADGE_Y = 885;
const NUM = {x: 1560, y: 860};

export const P2S20: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    pop(tl, q, '.p2s20-pin', L(T('alert') - 0.1));
    wipeText(tl, q, '.p2s20-alert', L(T('alert') + 0.05), 0.45);
    popSvg(tl, q, '.p2s20-f0', L(T('command') - 0.05), 0, 0.35);
    popSvg(tl, q, '.p2s20-f1', L(T('support') - 0.05), 0, 0.35);
    // 2
    slideIn(tl, q, '.p2s20-rng', L(T('canadian') - 0.4), -1100, 0, 0.8);
    wipeText(tl, q, '.p2s20-rng-l', L(T('rangers') - 0.05), 0.45);
    tl.fromTo(q('.p2s20-dot'), {autoAlpha: 0, scale: 0, transformOrigin: '50% 50%'}, {autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.022}, L(T('communities') - 0.2));
    BADGES.forEach((b) => popIn(tl, q, b.cls, L(T(b.word) - 0.12)));
    // 3
    stampIn(tl, q, 'p2s20-rep', L(T('2025') - STAMP_HIT + 0.04));
    wipeText(tl, q, '.p2s20-num', L(T('1') - 0.15), 0.35);
    wipeText(tl, q, '.p2s20-num-unit', L(T('rangers', 2) - 0.05), 0.4);
    PEOPLE.forEach((_, i) => popSvg(tl, q, `.p2s20-pp${i}`, L(T('1') - 0.1 + i * 0.06), 0, 0.35));
  });

  const split = ramp(t, T('canadian') - 0.8, T('canadian') + 0.4, inOutCubic);
  const n = countAt(t, T('1') - 0.1, T.end('500') + 0.1, 0, 1500);
  const [ax, ay] = toScreen(ALERT, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <CanadaOutline width={1.2} opacity={0.6} />
        <Marks />
      </MapSvg>
      {/* a metade esquerda escurece para a foto */}
      <AbsoluteFill style={{opacity: split, background: 'linear-gradient(90deg, rgba(17,17,17,0.82) 0%, rgba(17,17,17,0.7) 38%, rgba(17,17,17,0) 52%)'}} />

      {/* Alert */}
      <div style={at(ax, ay - 0.406 * 84)}>
        <div className="p2s20-pin" style={{visibility: 'hidden'}}>
          <IconHtml name="pin" x={0} y={0} size={84} color={C.black} fill={C.red} />
        </div>
      </div>
      <MapLabel cls="p2s20-alert" x={ax + 40} y={ay - 30} text="Alert" size={46} color={C.ink} anchor="left" spacing="0.16em" />

      {/* os Rangers */}
      {RANGERS_IMG ? <Sticker cls="p2s20-rng" src={RANGERS_IMG} x={STICK.x} y={STICK.y} w={STICK.w} /> : null}
      <div style={at(STICK.x, 172)}>
        <div className="p2s20-rng-l" style={{fontFamily: ANTON, fontSize: 60, color: C.ink, letterSpacing: '0.06em', marginRight: '-0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
          Canadian Rangers
        </div>
      </div>
      {BADGES.map((b) => (
        <IconBadge key={b.cls} cls={b.cls} x={b.x} y={BADGE_Y} icon={b.icon} size={136} label={b.label} labelSize={34} />
      ))}

      {/* o relatorio e o numero */}
      <Stamp cls="p2s20-rep" x={NUM.x - 60} y={NUM.y - 165} text="2025–26 Report" size={50} />
      <Counter cls="p2s20-num" x={NUM.x} y={NUM.y} value={n} digits={4} size={150} suffix="+" color={C.ink} unit="Rangers" unitSize={40} />
    </AbsoluteFill>
  );
};

/** No mapa: quadrados de comando/apoio, pontos das comunidades e os bonecos vermelhos (Rangers). */
const Marks: React.FC = () => {
  const px = usePx();
  return (
    <g>
      {FACILITIES.map((p, i) => (
        <g key={i} className={`p2s20-f${i}`} style={{visibility: 'hidden'}}>
          <rect x={p[0] - px(15)} y={p[1] - px(15)} width={px(30)} height={px(30)} fill={C.ink} stroke={C.black} strokeWidth={px(3)} />
        </g>
      ))}
      {CA2.communities
        .filter((c) => !SKIP.has(c.name))
        .map((c, i) => (
          <circle key={i} className="p2s20-dot" cx={c.p[0]} cy={c.p[1]} r={px(5.5)} fill={C.ink} stroke={C.black} strokeWidth={px(1.5)} style={{visibility: 'hidden'}} />
        ))}
      {PEOPLE.map((p, i) => (
        <g key={i} className={`p2s20-pp${i}`} style={{visibility: 'hidden'}}>
          <Icon name="person" x={p[0]} y={p[1] - px(19)} size={px(40)} color={C.black} fill={C.red} strokeW={px(1.8)} shadow />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('land') - 0.15, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('alert') - 0.1, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('command') - 0.05, file: 'tick', vol: 0.1, dur: 0.3},
  {at: T('support') - 0.05, file: 'tick', vol: 0.1, dur: 0.3},
  {at: T('canadian') - 0.8, file: 'whoosh_soft2', vol: 0.12, dur: 1.0},
  {at: T('canadian') - 0.4 + 0.1, file: 'paper_slide', vol: 0.16, dur: 0.8},
  {at: T('communities') - 0.2, file: 'pop2', vol: 0.1, dur: 0.3},
  {at: T('patrols') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('observation') - 0.12, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('search') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('2025') + 0.04 - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  ...ticks(T('1') - 0.1, T.end('500') + 0.1, 6, 0.05, 'out'),
  {at: T('1') - 0.1, file: 'snow_steps', vol: 0.08, dur: 1.6, fadeIn: 0.2, fadeOut: 0.6},
];
