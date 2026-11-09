// 0.00–23.42  "The United States and Canada work together to defend the continent, but they disagree over the
// Northwest Passage. Ottawa considers its various routes to be Canadian internal waters. And yes, Ottawa is Canada's
// capital, in case you were thinking Vancouver. Washington, meanwhile, considers those waters a strait used for
// international navigation, with a right of transit for ships from other countries."
// Um plano continuo: o bloco NORAD (EUA + Canada em vermelho) -> os EUA "escorrem" no "disagree" -> a camera mergulha
// no arquipelago, as rotas se desenham e a AGUA entre as ilhas vira vermelha (aguas internas) -> chicote para o sul
// (OTTAWA ★, VANCOUVER ✕) -> volta ao norte: a rota principal vira "estrada" internacional, com navios em comboio.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw} from '../../../components/Bits';
import {CanadaOutline, Graticule, Neighbours, ProvinceLines} from '../../../components/CanadaLayers';
import {Icon, MovingTrack} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {CA} from '../../../data/maps';
import {CA2, caPlace, nwpRoute} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, outCubic, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, marker, markerOut, paint, wipeText} from '../../../lib/tl';
import {popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s01');

// ---------------------------------------------------------------- geometria (calculada uma vez)
const pairs = (d: string): [number, number][] => {
  const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};
const BORDER_D = CA.southBorder + CA.alaskaBorder;
const BORDER_PTS = pairs(BORDER_D).filter((_, i) => i % 3 === 0);
const distToBorder = (x: number, y: number) => Math.min(...BORDER_PTS.map(([bx, by]) => Math.hypot(bx - x, by - y)));

// "escorrer" dos EUA: sementes cheias que encolhem, primeiro junto a fronteira
const US_SEEDS: Seed[] = (() => {
  const pts = pairs(CA.usa);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const seeds: Seed[] = [];
  for (let x = x0; x <= x1 + 60; x += 110) {
    for (let y = y0; y <= y1 + 60; y += 110) {
      seeds.push({x, y, r: 104, delay: Math.min(1, distToBorder(x, y) / 700) * 0.6});
    }
  }
  return seeds;
})();

// tinta das aguas internas: nasce ao longo das rotas e corre para os canais
const ROUTES = CA2.nwpRoutes;
// As rotas compartilham trechos (ex.: Amundsen Gulf -> Beaufort). Tracejados sobrepostos fora de fase parecem uma
// linha cheia, entao cada rota desenha so o que ainda nao foi desenhado pelas anteriores.
const ROUTE_D: string[] = ROUTES.map((r, k) => {
  if (k === 0) return r.d;
  const prev = ROUTES.slice(0, k).flatMap((p) => p.pts.filter((_, i) => i % 2 === 0));
  const own = r.pts.map(([x, y]) => Math.min(...prev.map(([px, py]) => Math.hypot(px - x, py - y))) > 2.2);
  let d = '';
  let open = false;
  r.pts.forEach(([x, y], i) => {
    // inclui 1 ponto de sobreposicao em cada ponta para o trecho encostar na rota anterior
    const keep = own[i] || own[i - 1] || own[i + 1];
    if (keep) {
      d += `${open ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
      open = true;
    } else open = false;
  });
  return d;
});
const IW_SEEDS: Seed[] = (() => {
  const along: Seed[] = [];
  ROUTES.forEach((r, k) => {
    for (let i = 0; i < r.pts.length; i += 26) {
      const [x, y] = r.pts[i];
      along.push({x, y, r: 64, delay: 0.05 * k + (1 - i / r.pts.length) * 0.35});
    }
  });
  const grid: Seed[] = [];
  for (let x = 650; x <= 1010; x += 52) {
    for (let y = 85; y <= 480; y += 52) {
      const d = Math.min(...along.map((s) => Math.hypot(s.x - x, s.y - y)));
      grid.push({x, y, r: 60, delay: 0.35 + Math.min(d, 260) * 0.0026});
    }
  }
  return [...along, ...grid];
})();

const MAIN = nwpRoute('northern');
const OTTAWA = caPlace('Ottawa');
const VANCOUVER = caPlace('Vancouver');
const WASHINGTON = caPlace('Washington DC');

// ---------------------------------------------------------------- camera
const NORTH = {x: 828, y: 292, s: 2.75};
const SOUTH = {x: 862, y: 860, s: 1.42};
const KEYS: CamKey[] = [
  {t: 0, x: 960, y: 640, s: 0.8},
  {t: 5.4, x: 958, y: 628, s: 0.84, ease: inOutSine},
  {t: 7.35, ...NORTH, ease: inOutCubic}, // "Northwest Passage"
  {t: 11.2, x: NORTH.x + 6, y: NORTH.y + 4, s: NORTH.s * 1.04, ease: inOutSine},
  {t: 12.1, ...SOUTH, ease: inOutCubic}, // "And yes, Ottawa..." (chicote para o sul)
  {t: 15.95, x: SOUTH.x - 4, y: SOUTH.y - 6, s: SOUTH.s * 1.03, ease: inOutSine},
  {t: 16.95, ...NORTH, ease: inOutCubic}, // "Washington, meanwhile..." (volta ao norte)
  {t: 23.7, x: NORTH.x - 18, y: NORTH.y + 2, s: NORTH.s * 1.06, ease: inOutSine},
];

const SHIP_TONES = [C.ink, 'rgba(238,233,223,0.82)', 'rgba(238,233,223,0.66)', 'rgba(238,233,223,0.9)'];

export const F01: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // juntos: a costura de tinta na fronteira
    draw(tl, q, '.f01-stitch', L(T('together') - 0.1), 0.9, 'power1.inOut');
    // "but they disagree": os EUA escorrem, comecando pela fronteira
    tl.fromTo(
      q('.f01-us-seed'),
      {attr: {r: (i: number) => US_SEEDS[i].r}},
      {attr: {r: 0}, duration: 0.5, ease: 'power1.in', stagger: (i: number) => US_SEEDS[i].delay},
      L(T('disagree') - 0.15),
    );
    // a costura cumpriu seu papel: sai quando a camera mergulha no arquipelago
    tl.to(q('.f01-stitch-g'), {autoAlpha: 0, duration: 0.6, ease: 'power1.inOut'}, L(T('northwest') - 0.1));
    // Passagem do Noroeste
    ROUTES.forEach((_, k) => draw(tl, q, `.f01-r${k}-rev`, L(T('northwest') + 0.15 + k * 0.22), 1.2, 'power1.inOut'));
    marker(tl, q, 'f01-nwp', L(T('passage') + 0.05));
    markerOut(tl, q, 'f01-nwp', L(T('internal') - 0.45));
    // Ottawa (quem fala) + aguas internas
    marker(tl, q, 'f01-ott', L(T('ottawa') - 0.05));
    paint(tl, q, 'f01-iw', IW_SEEDS, L(T('internal') - 0.15), 0.8);
    marker(tl, q, 'f01-iwl', L(T('waters') + 0.05));
    markerOut(tl, q, 'f01-iwl', L(T('yes') - 0.3));
    markerOut(tl, q, 'f01-ott', L(T('yes') - 0.25));
    // a piada: Ottawa e a capital (nao Vancouver)
    popSvg(tl, q, '.f01-ott-dot', L(T('ottawa', 2) + 0.05));
    wipeText(tl, q, '.f01-ott-lbl', L(T('ottawa', 2) + 0.12), 0.35);
    popSvg(tl, q, '.f01-ott-star', L(T('capital') - 0.08), 0, 0.5);
    popSvg(tl, q, '.f01-van-dot', L(T('vancouver') - 0.05));
    wipeText(tl, q, '.f01-van-lbl', L(T('vancouver') + 0.02), 0.35);
    popSvg(tl, q, '.f01-van-x', L(T('vancouver') + 0.42), 0, 0.36);
    // Washington: estreito internacional, direito de passagem
    popSvg(tl, q, '.f01-was-dot', L(T('washington') + 0.05));
    wipeText(tl, q, '.f01-was-lbl', L(T('washington') + 0.12), 0.35);
    marker(tl, q, 'f01-wash', L(T('washington') + 0.1));
    draw(tl, q, '.f01-hw', L(T('strait') - 0.15), 1.1, 'power2.inOut');
    marker(tl, q, 'f01-intl', L(T('international') + 0.02));
    fadeIn(tl, q, '.f01-convoy', L(T('transit') - 0.2), 0.35);
  });

  const usVisible = t < T('disagree') + 1.7;
  const usMasked = t > T('disagree') - 0.1;
  const canRed = 1 - ramp(t, T('northwest') - 0.1, T('passage') + 0.9, inOutSine);
  const iwSettled = t > T('internal') + 1.7;
  const routeBold = ramp(t, T('routes') - 0.1, T('routes') + 0.45, outCubic);
  const shipsP = ramp(t, T('transit') - 0.5, 23.9, inOutSine);

  const lbl = (p: readonly [number, number]) => toScreen(p, cam);
  const [ox, oy] = lbl(OTTAWA);
  const [vx, vy] = lbl(VANCOUVER);
  const [wx, wy] = lbl(WASHINGTON);
  const intlLift = ramp(t, T('international') - 0.2, T('international') + 0.3, outCubic);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <PaintDefs id="f01-us" seeds={US_SEEDS} rough={46} />
            <PaintDefs id="f01-iw" seeds={IW_SEEDS} rough={22} />
          </>
        }
      >
        <Graticule d={CA.graticule} />
        <Neighbours />
        <path d={CA.canada} fill={C.land} />
        <path d={CA.canada} fill={C.red} opacity={canRed} />
        {usVisible ? <PaintPath id="f01-us" d={CA.usa} settled={!usMasked} /> : null}
        <ProvinceLines color={C.black} opacity={0.28 * canRed + 0.14} width={0.8} />
        <PaintPath id="f01-iw" d={CA2.channels} settled={iwSettled} />
        <CanadaOutline width={1.3} opacity={0.75} />
        <Stitch />
        <Routes bold={routeBold} />
        <Highway />
        <g className="f01-convoy">
          {SHIP_TONES.map((tone, k) => (
            <MovingTrack
              key={k}
              cls={`f01-ship${k}`}
              pts={MAIN.pts}
              progress={Math.max(0, shipsP * 0.5 - k * 0.065)}
              color={tone}
              dash={null}
              tail={0.001}
              trailOpacity={0}
              icon="shipTop"
              iconSize={46}
              iconColor={tone}
              iconFill="#161615"
              orient="rotate"
            />
          ))}
        </g>
        <Pins />
      </MapSvg>

      {/* rotulos de lugar (HTML, acompanham a camera) */}
      <MapLabel cls="f01-ott-lbl" x={ox + 30} y={oy + 2} text="Ottawa" size={40} color={C.ink} anchor="left" />
      <MapLabel cls="f01-van-lbl" x={vx - 26} y={vy + 2} text="Vancouver" size={40} color={C.ink} anchor="right" />
      <MapLabel cls="f01-was-lbl" x={wx + 26} y={wy + 2} text="Washington" size={34} color={C.inkSoft} anchor="left" />

      {/* quem fala: Ottawa (esquerda) x Washington (direita) */}
      <MarkerLabel cls="f01-ott" x={140} y={120} text="Ottawa" size={46} anchor="left" barColor={C.red} />
      <MarkerLabel cls="f01-wash" x={1780} y={120} text="Washington" size={46} anchor="right" barColor={C.ink} textColor={C.black} />

      <MarkerLabel cls="f01-nwp" x={960} y={150} text="Northwest Passage" size={78} />
      <MarkerLabel cls="f01-iwl" x={960} y={930} text="Internal waters" size={70} />
      <div style={{position: 'absolute', inset: 0, transform: `translate(0px, ${lerp(16, 0, intlLift)}px) rotate(0.03deg)`}}>
        <MarkerLabel cls="f01-intl" x={960} y={930} text="International strait" size={70} barColor={C.ink} textColor={C.black} />
      </div>
    </AbsoluteFill>
  );
};

const Stitch: React.FC = () => {
  const px = usePx();
  return (
    <g className="f01-stitch-g" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path className="f01-stitch" d={BORDER_D} stroke={C.ink} strokeWidth={px(3.2)} />
    </g>
  );
};

const Routes: React.FC<{bold: number}> = ({bold}) => (
  <g>
    {ROUTES.map((r, k) => (
      <DashedDraw key={r.id} id={`f01-r${k}`} d={ROUTE_D[k]} color={C.ink} width={lerp(2, 3.4, bold)} dash={[4.2, 3.2]} opacity={0.95} />
    ))}
  </g>
);

const Highway: React.FC = () => {
  const px = usePx();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path className="f01-hw" d={MAIN.d} stroke="rgba(0,0,0,0.45)" strokeWidth={px(12)} transform="translate(0.6 0.9)" />
      <path className="f01-hw" d={MAIN.d} stroke={C.ink} strokeWidth={px(7)} />
    </g>
  );
};

const Pins: React.FC = () => {
  const px = usePx();
  const dot = (cls: string, [x, y]: readonly [number, number], color: string) => (
    <g className={cls}>
      <circle cx={x} cy={y} r={px(11)} fill="none" stroke={color} strokeWidth={px(2.5)} />
      <circle cx={x} cy={y} r={px(5.5)} fill={color} />
    </g>
  );
  return (
    <g>
      {dot('f01-ott-dot', OTTAWA, C.ink)}
      <g className="f01-ott-star">
        <Icon name="star" x={OTTAWA[0]} y={OTTAWA[1]} size={px(46)} color={C.red} fill={C.red} />
      </g>
      {dot('f01-van-dot', VANCOUVER, C.inkSoft)}
      <g className="f01-van-x">
        <Icon name="cross" x={VANCOUVER[0]} y={VANCOUVER[1]} size={px(62)} color={C.red} strokeW={7} />
      </g>
      {dot('f01-was-dot', WASHINGTON, C.inkSoft)}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('together') - 0.26, file: 'pen_scribble', vol: 0.14, dur: 1.0, fadeOut: 0.3},
  {at: T('disagree') - 0.136, file: 'paper_slide2', vol: 0.16, dur: 0.7},
  {at: T('northwest') - 0.36, file: 'whoosh_soft', vol: 0.22, dur: 1.0},
  {at: T('northwest') + 0.05, file: 'pen_scribble', vol: 0.15, dur: 1.15, fadeOut: 0.3},
  {at: T('internal') - 0.2, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: 11.2 - 0.418 + 0.25, file: 'whoosh_soft2', vol: 0.26, dur: 1.0},
  {at: T('ottawa', 2) + 0.05 - 0.004, file: 'pop', vol: 0.24, dur: 0.3},
  {at: T('capital') - 0.08 - 0.008, file: 'pop2', vol: 0.26, dur: 0.3},
  {at: T('vancouver') - 0.05 - 0.004, file: 'pop', vol: 0.2, dur: 0.3},
  {at: T('vancouver') + 0.42 - 0.07, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: 16.05 - 0.418 + 0.25, file: 'whoosh_soft2', vol: 0.24, dur: 1.0},
  {at: T('strait') - 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('transit') - 0.1, file: 'ship_horn', vol: 0.1, dur: 2.2, fadeIn: 0.3, fadeOut: 0.8},
];
