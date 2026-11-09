// 0.00–39.39  "On July 24th, 2024, Canadian and American fighter jets intercepted two Russian Tu-95 bombers and two Chinese
// H-6 bombers in Alaska's air defense identification zone. All four remained in international airspace. None entered
// Canadian or U.S. airspace. The operation was carried out by NORAD, the North American Aerospace Defense Command, which
// brings the United States and Canada together under a bi-national command. NORAD itself said the activity wasn't
// considered a threat. Even so, the aircraft were tracked and intercepted. It was a practical example of how the two
// countries work together to keep an eye on who's approaching North America."
// ANCORA #2 nasce aqui (cold open num fato real). Um plano continuo no globo polar: data carimbada -> a Russia pinta
// de vermelho, os bombardeiros saem de Anadyr (fotos reais entram de lado) -> a ADIZ se desenha em volta do Alasca e os
// cacas vao ao encontro -> trajetos paralelos a costa (espaco aereo internacional) -> a costa acende (ninguem entrou).
// Depois recua: NORAD, EUA + Canada pintados juntos, "not a threat"; volta ao Alasca: o radar varre e pega os 4; recua
// de novo: o arco de vigilancia sobre o Artico.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow, DashedDraw} from '../../../components/Bits';
import {MovingTrack, RadarSweep, Stamp, sweepAngle, trackHead, trackPoly} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {PolarBase} from '../../../components/PolarBase';
import {Sticker} from '../../../components/Sticker';
import {POLAR, polarCountry} from '../../../data/maps';
import {POLAR2, polarPoint, polarProject} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, marker, paint, slideIn, wipeText} from '../../../lib/tl';
import {STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s01');

const RUS = polarCountry(POLAR.ids.russia)!;
const USA = polarCountry(POLAR.ids.usa)!;
const CAN = polarCountry(POLAR.ids.canada)!;

const grid = (x0: number, x1: number, y0: number, y1: number, step: number, r: number, origin: [number, number], k: number): Seed[] => {
  const s: Seed[] = [];
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) s.push({x, y, r, delay: Math.min(Math.hypot(x - origin[0], y - origin[1]), 700) * k});
  return s;
};
const RU_SEEDS = grid(560, 1460, 60, 620, 64, 64, polarPoint('Chukotka'), 0.0011);
const NA_SEEDS = grid(560, 1300, 560, 1010, 64, 64, polarPoint('Alaska'), 0.0009);

// bombardeiros (2 Tu-95 + 2 H-6 em formacao) e os dois cacas que vao ao encontro
const BOMBERS = POLAR2.bomberTracks;
const JETS = POLAR2.interceptTracks;
const JOIN = JETS[0].bomberFrac; // fracao da trajetoria do bombardeiro no encontro
const SHADOW_END = JETS[0].bomberEndFrac;
const POLYS = BOMBERS.map((b) => trackPoly(b.pts));

// arco de vigilancia: ~67°N do Alasca a Groenlandia
const WATCH: [number, number][] = Array.from({length: 61}, (_, i) => polarProject(-168 + i * 2.1, 66.5 + 2.4 * Math.sin((i / 60) * Math.PI)));
const WATCH_D = WATCH.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');
const POLE = polarPoint('North Pole');

const BERING = {x: 744, y: 628, s: 3.55};
const KEYS: CamKey[] = [
  {t: 0, x: 905, y: 575, s: 1.22, r: -4},
  {t: 3.7, x: 880, y: 590, s: 1.34, r: -5, ease: inOutSine},
  {t: 9.6, ...BERING, r: -8, ease: inOutCubic}, // mergulho no mar de Bering ate a ADIZ fechar
  {t: 17.3, x: BERING.x + 8, y: BERING.y + 6, s: BERING.s * 1.05, r: -8, ease: inOutSine},
  {t: 19.9, x: 905, y: 690, s: 1.6, r: -5, ease: inOutCubic}, // NORAD: America do Norte
  {t: 29.9, x: 900, y: 684, s: 1.66, r: -5, ease: inOutSine},
  {t: 31.6, x: 760, y: 640, s: 3.0, r: -8, ease: inOutCubic}, // "tracked and intercepted"
  {t: 33.6, x: 762, y: 636, s: 3.08, r: -8, ease: inOutSine},
  {t: 36.0, x: 925, y: 610, s: 1.18, r: -4, ease: inOutCubic}, // quem se aproxima da America do Norte
  {t: 39.7, x: 928, y: 606, s: 1.13, r: -4, ease: inOutSine},
];

export const P1S01: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    stampIn(tl, q, 'p1s01-date', L(T('july') + 0.2 - STAMP_HIT));
    paint(tl, q, 'p1s01-ru', RU_SEEDS, L(T('russian') - 0.1), 0.8);
    fadeIn(tl, q, '.p1s01-tu', L(T('russian') + 0.05), 0.3);
    fadeIn(tl, q, '.p1s01-h6', L(T('chinese') + 0.05), 0.3);
    fadeIn(tl, q, '.p1s01-jets', L(T('jets') - 0.1), 0.3);
    wipeText(tl, q, '.p1s01-l-tu', L(T('tu') + 0.05), 0.35);
    wipeText(tl, q, '.p1s01-l-h6', L(T('h') + 0.05), 0.35);
    // "Canadian and American fighter jets": CF-18 e F-35 (o F-35A do recorte e do Alasca) entram pela esquerda
    slideIn(tl, q, '.p1s01-ph-cf', L(T('canadian') - 0.15), -820, 2, 0.6);
    slideIn(tl, q, '.p1s01-ph-f35', L(T('american') - 0.15), -820, -2, 0.6);
    tl.to(q('.p1s01-ph-cf, .p1s01-ph-f35'), {x: -900, autoAlpha: 0, duration: 0.5, ease: 'power2.in'}, L(T('intercepted') + 0.3));
    slideIn(tl, q, '.p1s01-ph-tu', L(T('russian') - 0.15), 820, -2, 0.7);
    slideIn(tl, q, '.p1s01-ph-h6', L(T('chinese') - 0.15), 820, 2, 0.7);
    tl.to(q('.p1s01-ph-tu, .p1s01-ph-h6'), {x: 900, autoAlpha: 0, duration: 0.55, ease: 'power2.in'}, L(T('alaskas') - 0.1));
    draw(tl, q, '.p1s01-adiz-rev', L(T('alaskas') - 0.15), 1.4, 'power1.inOut');
    wipeText(tl, q, '.p1s01-adiz-lbl', L(T('identification') - 0.1), 0.6);
    wipeText(tl, q, '.p1s01-l-ak', L(T('alaskas') + 0.1), 0.4);
    // o rotulo da ADIZ cumpriu o papel: sai antes do 'international airspace' ocupar o mesmo lado
    tl.to(q('.p1s01-adiz-lbl'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('all') - 0.3));
    wipeText(tl, q, '.p1s01-intl', L(T('international') - 0.2), 0.45);
    draw(tl, q, '.p1s01-coast', L(T('none') - 0.05), 1.2, 'power1.inOut');
    // NORAD
    tl.to(q('.p1s01-intl, .p1s01-l-ak, .p1s01-adiz-lbl'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(17.5));
    tl.to(q('.p1s01-date'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(17.5));
    marker(tl, q, 'p1s01-norad', L(T('norad') - 0.05));
    wipeText(tl, q, '.p1s01-full', L(T('north') - 0.05), 1.3);
    paint(tl, q, 'p1s01-na', NA_SEEDS, L(T('united') - 0.1), 0.8);
    marker(tl, q, 'p1s01-threat', L(T('considered') - 0.1));
    tl.to(q('.p1s01-full'), {autoAlpha: 0, duration: 0.35, ease: 'power1.in'}, L(T('considered') - 0.35));
    // "tracked": o radar varre o Alasca
    fadeIn(tl, q, '.p1s01-radar', L(T('tracked') - 0.6), 0.4);
    tl.to(q('.p1s01-norad-bar, .p1s01-norad-txt, .p1s01-threat-bar, .p1s01-threat-txt'), {autoAlpha: 0, duration: 0.35}, L(T('even') - 0.1));
    tl.to(q('.p1s01-radar'), {autoAlpha: 0, duration: 0.4}, L(T('practical') - 0.1));
    tl.to(q('.p1s01-l-tu, .p1s01-l-h6'), {autoAlpha: 0, duration: 0.4}, L(T('practical') - 0.1));
    // vigilancia sobre o Artico
    draw(tl, q, '.p1s01-watch, .p1s01-watchd-rev', L(T('keep') - 0.4), 1.4, 'power1.inOut');
    [0, 1, 2].forEach((k) => {
      draw(tl, q, `.p1s01-ar${k}-c`, L(T('approaching') - 0.3 + k * 0.12), 0.6, 'power2.out');
      draw(tl, q, `.p1s01-ar${k}-h`, L(T('approaching') + 0.3 + k * 0.12), 0.16, 'none');
    });
  });

  // progresso dos bombardeiros: saem de Anadyr, entram na ADIZ, os cacas chegam (JOIN), sombra, retorno
  const pb =
    t < T('zone')
      ? lerp(0, JOIN, ramp(t, T('russian') + 0.2, T('zone'), inOutSine))
      : t < 17.4
        ? lerp(JOIN, SHADOW_END, ramp(t, T('zone'), 17.4, inOutSine))
        : lerp(SHADOW_END, 0.86, ramp(t, 17.4, 33.4, inOutSine));
  const pj =
    t < T('zone')
      ? lerp(0, JETS[0].joinFrac, ramp(t, T('jets'), T('zone'), inOutSine))
      : lerp(JETS[0].joinFrac, 1, ramp(t, T('zone'), 17.4, inOutSine));
  const jetsOn = t < 18.2;

  const ruSettled = t > T('russian') + 1.6;
  const naSettled = t > T('united') + 1.6;
  const heads = POLYS.map((p) => trackHead(p, pb).p);
  const [tuX, tuY] = toScreen(heads[0], cam);
  const [h6X, h6Y] = toScreen(heads[2], cam);
  const [akX, akY] = toScreen(polarPoint('Alaska'), cam);
  const [ix, iy] = toScreen([684, 640], cam);
  const anc = polarPoint('Anchorage');

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <PaintDefs id="p1s01-ru" seeds={RU_SEEDS} rough={34} />
            <PaintDefs id="p1s01-na" seeds={NA_SEEDS} rough={30} />
          </>
        }
      >
        <PolarBase canadaFill={C.land} />
        {/* com a NORAD em cena, o foco passa para a America do Norte: a Russia fica num vermelho contido */}
        <PaintPath id="p1s01-ru" d={RUS.d} settled={ruSettled} opacity={1 - 0.55 * ramp(t, T('norad') - 0.3, T('norad') + 0.7, inOutSine)} />
        <PaintPath id="p1s01-na" d={USA.d + CAN.d} settled={naSettled} />
        <Overlays pb={pb} pj={pj} jetsOn={jetsOn} />
        <g className="p1s01-radar">
          <RadarSweep cx={anc[0]} cy={anc[1]} r={118} angle={sweepAngle(t, T('tracked') - 0.6, 2.4)} start={0} strength={0.2} blips={heads.map(([x, y]) => ({x, y}))} cls="p1s01-rs" />
        </g>
        <Watch />
      </MapSvg>

      {/* rotulos que acompanham o mapa */}
      <MapLabel cls="p1s01-l-tu" x={tuX + 44} y={tuY - 46} text="Tu-95" size={40} color={C.red} anchor="left" />
      <MapLabel cls="p1s01-l-h6" x={h6X + 44} y={h6Y + 40} text="H-6" size={40} color={C.red} anchor="left" />
      <MapLabel cls="p1s01-l-ak" x={akX + 60} y={akY + 70} text="Alaska" size={46} color={C.ink} />
      <div style={at(ix, iy)}>
        <div className="p1s01-intl" style={{fontFamily: ANTON, fontSize: 34, color: C.ink, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>
          International
          <br />
          airspace
        </div>
      </div>

      {/* os cacas que interceptaram (CF-18 canadense, F-35A americano) */}
      <Sticker cls="p1s01-ph-cf" src="img/cf18.png" x={420} y={360} w={560} />
      <Sticker cls="p1s01-ph-f35" src="img/f35.png" x={430} y={700} w={580} />

      {/* as fotos reais dos dois bombardeiros */}
      <Sticker cls="p1s01-ph-tu" src="img/tu95.png" x={1520} y={330} w={560} />
      <Sticker cls="p1s01-ph-h6" src="img/h6.png" x={1540} y={730} w={540} />

      <Stamp cls="p1s01-date" x={330} y={140} text="July 24, 2024" size={62} />
      <MarkerLabel cls="p1s01-norad" x={960} y={150} text="NORAD" size={96} />
      <div style={at(960, 238)}>
        <div className="p1s01-full" style={{fontFamily: ANTON, fontSize: 36, color: C.ink, letterSpacing: '0.16em', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.7)'}}>
          North American Aerospace Defense Command
        </div>
      </div>
      <MarkerLabel cls="p1s01-threat" x={960} y={250} text="Not considered a threat" size={52} barColor={C.ink} textColor={C.black} />
    </AbsoluteFill>
  );
};

const Overlays: React.FC<{pb: number; pj: number; jetsOn: boolean}> = ({pb, pj, jetsOn}) => {
  const px = usePx();
  return (
    <g>
      <DashedDraw id="p1s01-adiz" d={POLAR2.adiz} color={C.ink} opacity={0.8} width={2.6} dash={[px(12), px(8)]} />
      <text className="p1s01-adiz-lbl" fontFamily={ANTON} fontSize={px(17)} letterSpacing={px(2.2)} fill={C.inkSoft}>
        <textPath href="#p1s01-adiz-path" startOffset="50%" textAnchor="middle" dominantBaseline="middle">
          AIR DEFENSE IDENTIFICATION ZONE
        </textPath>
      </text>
      <path id="p1s01-adiz-path" d={POLAR2.adizLabelPath} fill="none" stroke="none" />
      <path className="p1s01-coast" d={POLAR2.alaskaCoast} fill="none" stroke={C.ink} strokeWidth={px(2.4)} strokeLinejoin="round" />
      {BOMBERS.map((b, k) => (
        <g key={b.id} className={k < 2 ? 'p1s01-tu' : 'p1s01-h6'}>
          <MovingTrack cls={`p1s01-b${k}`} pts={b.pts} progress={pb} color={C.red} width={2.2} dash={[3, 2.4]} tail={60} icon="bomber" iconSize={30} iconColor={C.red} iconFill={C.red} />
        </g>
      ))}
      {jetsOn ? (
        <g className="p1s01-jets">
          {JETS.map((j, k) => (
            <MovingTrack key={j.id} cls={`p1s01-j${k}`} pts={j.pts} progress={pj} color={C.ink} width={2} dash={[3, 2.4]} tail={45} icon="jet" iconSize={26} iconColor={C.ink} iconFill={C.ink} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

const Watch: React.FC = () => {
  const px = usePx();
  const tips = [WATCH[10], WATCH[30], WATCH[50]];
  return (
    <g fill="none" strokeLinecap="round">
      <path className="p1s01-watch" d={WATCH_D} stroke={C.ink} strokeOpacity={0.16} strokeWidth={px(30)} />
      <DashedDraw id="p1s01-watchd" d={WATCH_D} color={C.ink} opacity={0.85} width={2.4} dash={[px(10), px(7)]} />
      {tips.map((p, k) => {
        const from: [number, number] = [POLE[0] + (p[0] - POLE[0]) * 0.18, POLE[1] + (p[1] - POLE[1]) * 0.18];
        const to: [number, number] = [POLE[0] + (p[0] - POLE[0]) * 0.78, POLE[1] + (p[1] - POLE[1]) * 0.78];
        return <HandArrow key={k} cls={`p1s01-ar${k}`} from={from} to={to} bow={0.08} color={C.red} width={px(3.4)} />;
      })}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('canadian') - 0.25, file: 'jet_flyby', vol: 0.16, dur: 2.4, fadeOut: 0.8},
  {at: T('july') + 0.2 - 0.008, file: 'stamp', vol: 0.3, dur: 0.6},
  {at: T('jets') - 0.2, file: 'jet_flyby', vol: 0.2, dur: 3.2, fadeOut: 0.8},
  {at: 3.7 - 0.116, file: 'whoosh_soft', vol: 0.18, dur: 1.0},
  {at: T('russian') - 0.1, file: 'boom', vol: 0.12, dur: 2.0, fadeOut: 0.8},
  {at: T('russian') - 0.15, file: 'paper_slide', vol: 0.16, dur: 0.8},
  {at: T('chinese') - 0.15, file: 'paper_slide2', vol: 0.16, dur: 0.7},
  {at: T('alaskas') - 0.2, file: 'pen_scribble', vol: 0.14, dur: 1.15, fadeOut: 0.3},
  {at: T('none') - 0.1, file: 'marker_swipe', vol: 0.14, dur: 0.6},
  {at: 17.5 - 0.418 + 0.2, file: 'whoosh_soft2', vol: 0.2, dur: 1.0},
  {at: T('norad') - 0.12, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: T('considered') - 0.17, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('tracked') - 0.6, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('tracked') + 0.25, file: 'tick', vol: 0.16, dur: 0.3},
  {at: T('practical') - 0.2, file: 'whoosh_soft2', vol: 0.18, dur: 1.0},
];
