// 157.56–172.84  "Canada's foreign policy also warns about espionage, cyber operations, and intelligence gathering by
// platforms with both civilian and military uses. That includes Chinese ships that can collect data useful for
// scientific research as well as military applications."
// O documento real (Canada's Arctic Foreign Policy) entra com um alerta; tres discos nas palavras (ESPIONAGE, CYBER,
// INTELLIGENCE). Em "platforms" eles sobem e um navio aparece partido ao meio: giz (civil) | vermelho (militar).
// Em "Chinese ships" entra o recorte do quebra-gelo de pesquisa chines JI DI (foto da Guarda Costeira dos EUA, 2025),
// o sonar varre o fundo do mar ("data") e os dados seguem para RESEARCH e para MILITARY.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {DocCard, Icon, IconBadge} from '../../../components/kit';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, slideIn, wipeText} from '../../../lib/tl';
import {docIn, popIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s12');

const BADGES = [
  {cls: 'p1s13-esp', word: 'espionage', icon: 'eye', label: 'Espionage', x: 900},
  {cls: 'p1s13-cyb', word: 'cyber', icon: 'cyber', label: 'Cyber', x: 1230},
  {cls: 'p1s13-int', word: 'intelligence', icon: 'antenna', label: 'Intelligence', x: 1560},
] as const;
const ROW_Y = 470;

// fase B: o navio e o mar
const SHIP = {x: 960, y: 352, w: 1000};
const SHIP_H = (SHIP.w * 607) / 1496;
const SEA_Y = Math.round(SHIP.y - SHIP_H / 2 + 0.9 * SHIP_H); // linha d'agua do casco
const SONAR: [number, number] = [930, SEA_Y + 10];
const floorY = (x: number) => 915 + 20 * Math.sin(x / 130) + 11 * Math.sin(x / 57 + 1.3);
const FLOOR_PTS = Array.from({length: 85}, (_, i) => 100 + i * 20).map((x) => [x, floorY(x)] as const);
const FLOOR_D = FLOOR_PTS.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y.toFixed(1)}`).join('');
const DOTS = Array.from({length: 9}, (_, i) => 650 + i * 70).map((x) => [x, floorY(x) - 2] as const);

export const P1S13: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    docIn(tl, q, 'p1s13-doc', L(157.35), -900); // ja na cortina
    popIn(tl, q, 'p1s13-warn', L(T('warns') - 0.1));
    BADGES.forEach((b) => popIn(tl, q, b.cls, L(T(b.word) - 0.12)));
    popSvg(tl, q, '.p1s13-dual', L(T('platforms') - 0.05));
    draw(tl, q, '.p1s13-div', L(T('both') - 0.15), 0.45, 'power2.out');
    wipeText(tl, q, '.p1s13-civ', L(T('civilian') - 0.05), 0.4);
    wipeText(tl, q, '.p1s13-mil', L(T('military') - 0.05), 0.4);
    // fase B
    slideIn(tl, q, '.p1s13-jidi', L(T('chinese') - 0.35), 1500, 0, 0.85);
    draw(tl, q, '.p1s13-sea', L(T('chinese') - 0.1), 0.9, 'power2.out');
    fadeIn(tl, q, '.p1s13-water', L(T('chinese') - 0.1), 0.8);
    draw(tl, q, '.p1s13-floor', L(T('collect') - 0.15), 1.0, 'power1.inOut');
    fadeIn(tl, q, '.p1s13-bed', L(T('collect') + 0.2), 0.8);
    DOTS.forEach((_, k) => popSvg(tl, q, `.p1s13-dot${k}`, L(T('data') + 0.1 + k * 0.06), 0, 0.3));
    draw(tl, q, '.p1s13-a1-c', L(T('scientific') - 0.35), 0.45, 'power2.out');
    draw(tl, q, '.p1s13-a1-h', L(T('scientific') + 0.08), 0.14, 'none');
    popIn(tl, q, 'p1s13-res', L(T('research') - 0.15));
    draw(tl, q, '.p1s13-a2-c', L(T('military', 2) - 0.35), 0.45, 'power2.out');
    draw(tl, q, '.p1s13-a2-h', L(T('military', 2) + 0.08), 0.14, 'none');
    popIn(tl, q, 'p1s13-mil2', L(T('military', 2) - 0.05));
  });

  // "platforms": o documento sai pela esquerda e os tres discos sobem para uma linha no topo
  const up = ramp(t, T('platforms') - 0.4, T('platforms') + 0.2, inOutCubic);
  // o documento entra no centro e abre espaco para os discos no "warns"
  const shift = ramp(t, T('warns') - 0.35, T('warns') + 0.25, inOutCubic);
  // "Chinese ships": a fase A sai, a foto entra
  const aOut = 1 - ramp(t, T('chinese') - 0.6, T('chinese') - 0.15, inOutSine);
  const redW = 480 * ramp(t, T('military') - 0.3, T('military') + 0.15, inOutCubic);
  const bob = 5 * Math.sin((t - T('chinese')) * 1.7);
  const sonarOn = t > T('collect') - 0.1;

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- fase A ---------------- */}
      {aOut > 0 ? (
        <AbsoluteFill style={{opacity: aOut}}>
          <div style={{position: 'absolute', inset: 0, transform: `translate(${lerp(560, 0, shift) + lerp(0, -760, up)}px, 0px) rotate(0.03deg)`}}>
            <DocCard cls="p1s13-doc" x={400} y={530} w={430} rot={-4} title="Canada's Arctic Foreign Policy" lines={10} seed={5} />
            <IconBadge cls="p1s13-warn" x={585} y={300} icon="warning" size={118} ring="red" iconColor={C.red} />
          </div>
          <div style={{position: 'absolute', inset: 0, transformOrigin: `1230px ${ROW_Y}px`, transform: `translate(${lerp(0, -270, up)}px, ${lerp(0, -300, up)}px) scale(${lerp(1, 0.62, up)}) rotate(0.03deg)`}}>
            {BADGES.map((b) => (
              <IconBadge key={b.cls} cls={b.cls} x={b.x} y={ROW_Y} icon={b.icon} size={184} label={b.label} labelSize={42} />
            ))}
          </div>
          <DualShip redW={redW} />
          <Word cls="p1s13-civ" x={700} y={900} text="Civilian" color={C.ink} />
          <Word cls="p1s13-mil" x={1220} y={900} text="Military" color={C.red} />
        </AbsoluteFill>
      ) : null}

      {/* ---------------- fase B ---------------- */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <rect className="p1s13-water" x={0} y={SEA_Y} width={1920} height={1080 - SEA_Y} fill={C.black} opacity={0} fillOpacity={0.3} />
        <path className="p1s13-bed" d={`${FLOOR_D}L1780,1080L100,1080Z`} fill={C.landDark} opacity={0} />
        <path className="p1s13-sea" d={`M-20 ${SEA_Y}L1940 ${SEA_Y}`} stroke={C.ink} strokeOpacity={0.7} strokeWidth={3} fill="none" />
        {sonarOn ? <Sonar t={t - (T('collect') - 0.1)} /> : null}
        <path className="p1s13-floor" d={FLOOR_D} stroke={C.ink} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
        {DOTS.map(([x, y], k) => (
          <circle key={k} className={`p1s13-dot${k}`} cx={x} cy={y} r={8} fill={C.red} stroke={C.ink} strokeWidth={2} style={{visibility: 'hidden'}} />
        ))}
        <HandArrow cls="p1s13-a1" from={[760, 760]} to={[470, 712]} bow={-0.12} color={C.ink} width={5} />
        <HandArrow cls="p1s13-a2" from={[1120, 760]} to={[1440, 712]} bow={0.12} color={C.red} width={5} />
      </svg>
      <div style={{position: 'absolute', inset: 0, transform: `translate(0px, ${bob}px) rotate(0.03deg)`}}>
        <Sticker cls="p1s13-jidi" src="img/china-research-ship.png" x={SHIP.x} y={SHIP.y} w={SHIP.w} />
      </div>
      <IconBadge cls="p1s13-res" x={330} y={700} icon="magnifier" size={150} label="Research" labelSize={42} />
      <IconBadge cls="p1s13-mil2" x={1590} y={700} icon="submarine" size={150} ring="red" iconColor={C.red} label="Military" labelSize={42} labelColor={C.red} />
    </AbsoluteFill>
  );
};

/** Um navio so, metade giz (uso civil) e metade vermelha (uso militar), separado por um traco. */
const DualShip: React.FC<{redW: number}> = ({redW}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
    <defs>
      <clipPath id="p1s13-red">
        <rect x={960} y={300} width={redW} height={600} />
      </clipPath>
    </defs>
    <g className="p1s13-dual" style={{visibility: 'hidden'}}>
      <Icon name="ship" x={960} y={660} size={560} color={C.black} fill={C.ink} cut={C.black} strokeW={7} shadow />
      <g clipPath="url(#p1s13-red)">
        <Icon name="ship" x={960} y={660} size={560} color={C.black} fill={C.red} cut={C.black} strokeW={7} />
      </g>
    </g>
    <path className="p1s13-div" d="M960 470 L960 850" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />
  </svg>
);

const Word: React.FC<{cls: string; x: number; y: number; text: string; color: string}> = ({cls, x, y, text, color}) => (
  <div style={at(x, y)}>
    <div className={cls} style={{fontFamily: ANTON, fontSize: 64, color, letterSpacing: '0.08em', marginRight: '-0.08em', textTransform: 'uppercase', textShadow: `0 3px 14px ${C.shadow}`}}>
      {text}
    </div>
  </div>
);

/** Ondas de sonar: semi-elipses que descem do casco ate o fundo, em ciclo (deterministico pelo tempo). */
const Sonar: React.FC<{t: number}> = ({t}) => {
  const [cx, cy] = SONAR;
  const rings = [0, 1, 2].map((k) => {
    const u = t / 1.25 - k / 3;
    if (u < 0) return null;
    const ph = u - Math.floor(u);
    const r = 30 + ph * 400;
    return {r, o: (1 - ph) * 0.85};
  });
  return (
    <g fill="none" stroke={C.ink} strokeLinecap="round">
      <path d={`M${cx} ${cy} L${cx - 330} ${cy + 380} L${cx + 330} ${cy + 380} Z`} fill={C.ink} fillOpacity={0.05} stroke="none" />
      {rings.map((g, k) =>
        g ? <path key={k} d={`M${cx - g.r} ${cy} A${g.r} ${g.r * 0.95} 0 0 0 ${cx + g.r} ${cy}`} strokeWidth={3} strokeOpacity={g.o} strokeDasharray="10 8" /> : null,
      )}
    </g>
  );
};

export const cues: Cue[] = [
  {at: 157.35 + 0.25, file: 'paper_slide', vol: 0.18, dur: 0.8},
  {at: T('warns') - 0.1, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('espionage') - 0.12, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('cyber') - 0.12, file: 'pop2', vol: 0.18, dur: 0.3},
  {at: T('intelligence') - 0.12, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('platforms') - 0.4, file: 'whoosh_soft', vol: 0.14, dur: 1.0},
  {at: T('military') - 0.3, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('chinese') - 0.4, file: 'whoosh_soft2', vol: 0.18, dur: 1.0},
  {at: T('chinese') + 0.2, file: 'ship_horn', vol: 0.07, dur: 2.2, fadeIn: 0.3, fadeOut: 1.0},
  {at: T('collect') - 0.15, file: 'pen_scribble', vol: 0.08, dur: 1.0, fadeOut: 0.3},
  {at: T('collect') - 0.1, file: 'sonar_ping', vol: 0.13, dur: 2.6},
  {at: T('collect') + 2.4, file: 'sonar_ping', vol: 0.09, dur: 2.0, fadeOut: 0.6},
  {at: T('research') - 0.15, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('military', 2) - 0.05, file: 'pop2', vol: 0.16, dur: 0.3},
];
