// 247.27–270.20  "The replacement program calls for up to 12 conventionally-powered submarines capable of operating under
// ice. In July 2026, Germany's TKMS was selected as the preferred supplier for negotiations on the project, with the first
// four submarines expected in 2034. That's progress on the planning side, but the Navy still has to get through the coming
// years with the equipment it has."
// 1) Sob um teto de gelo, 12 submarinos em contorno tracejado (o plano) brotam enquanto o contador chega a 12; UNDER ICE.
// 2) Mapa-mundi na Europa: carimbo JULY 2026, a Alemanha pinta de vermelho, TKMS; a camera recua ate o Canada e um arco
//    tracejado vai do fornecedor (Kiel) ao Canada.
// 3) De volta a grade: os quatro primeiros ficam vermelhos e descem para 2034 numa linha do tempo; check no plano.
// 4) TODAY em 2026 com o unico Victoria disponivel; o colchete THE COMING YEARS cobre o intervalo ate 2034.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw} from '../../../components/Bits';
import {Counter, countAt, gridCellCenter, hash01, Icon, PictogramGrid, Pulse, Stamp, SvgLayer, Timeline, yearX} from '../../../components/kit';
import {MapLabel, MarkerLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {WorldBase} from '../../../components/WorldBase';
import {ptsToD, WORLD, worldCountry} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, paint, wipeText} from '../../../lib/tl';
import {gridIn, popIn, popSvg, pulseOnce, STAMP_HIT, stampIn, timelineBand, timelineIn, timelineMark, timelineToday} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s18');

// ------------------------------------------------------------------ 1 e 3: a grade dos 12 (o plano)
const GRID = {x: 1130, y: 600, n: 12, cols: 6, size: 150, cellW: 170, cellH: 96, gap: 34};
const NUM = {x: 330, y: 600};
// grupo da grade: origem da escala no centro da grade; na fase 4 encolhe e sobe
const G_O: [number, number] = [GRID.x, GRID.y];
const G_SMALL = {k: 0.74, dx: -130, dy: -210};

// ------------------------------------------------------------------ 4: linha do tempo 2026 -> 2034
const TL = {x: 950, y: 860, w: 1400, from: 2026, to: 2034};
const tlX = (yr: number) => TL.x - TL.w / 2 + yearX(yr, TL.from, TL.to, TL.w);
const FOUR_Y = TL.y - 64;
const fourSlot = (i: number): [number, number] => [tlX(2034) + (i - 1.5) * 96, FOUR_Y];
const VIC: [number, number] = [tlX(2026), TL.y - 132];

// ------------------------------------------------------------------ 2: mapa-mundi
const GER = worldCountry('germany');
const CAN = worldCountry('canada');
const LINK_D = ptsToD([...WORLD.links.canadaGermany.pts].reverse()); // Kiel -> Ottawa
const GER_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  for (let x = 980; x <= 1025; x += 5) for (let y = 197; y <= 245; y += 5) s.push({x, y, r: 6.5, delay: Math.hypot(x - 1000, y - 205) * 0.011});
  return s;
})();

const KEYS: CamKey[] = [
  {t: 253.4, x: 1000, y: 224, s: 3.0, r: 0},
  {t: 257.3, x: 1003, y: 224, s: 3.35, r: 0, ease: inOutSine},
  {t: 259.5, x: 762, y: 206, s: 2.5, r: 0, ease: inOutCubic}, // recua ate enquadrar o Canada e a Alemanha
  {t: 261.2, x: 756, y: 206, s: 2.45, r: 0, ease: inOutSine},
];

export const P2S18: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  // trocas de bloco
  const toMap = ramp(t, T('in') - 0.35, T('in') + 0.2, inOutCubic);
  const toGrid = ramp(t, T('project') - 0.15, T('with') + 0.15, inOutCubic);
  const aOut = toMap - toGrid; // 0 = grade na tela, 1 = grade fora (mapa)
  const mapOp = toMap * (1 - toGrid);
  // fase 4: a grade encolhe e sobe para dar lugar a linha do tempo
  const g = ramp(t, T('expected') - 0.15, T('expected') + 0.55, inOutCubic);
  const rise = -26 * ramp(t, T('under') - 0.2, T('ice') + 0.2, inOutSine) * (1 - g);
  const gk = lerp(1, G_SMALL.k, g);
  const gdx = lerp(0, G_SMALL.dx, g) - 320 * aOut;
  const gdy = lerp(0, G_SMALL.dy, g) + rise;
  const toGroup = (p: [number, number]): [number, number] => [G_O[0] + gdx + gk * (p[0] - G_O[0]), G_O[1] + gdy + gk * (p[1] - G_O[1])];

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    gridIn(tl, q, 'p2s18-g', L(T('program') - 0.15), (T('12') - T('program') - 0.05) / 11);
    wipeText(tl, q, '.p2s18-num', L(T('program') - 0.15), 0.35);
    wipeText(tl, q, '.p2s18-num-unit', L(T('submarines') - 0.05), 0.4);
    marker(tl, q, 'p2s18-ui', L(T('ice') - 0.12));
    // 2
    stampIn(tl, q, 'p2s18-july', L(T('july') + 0.04 - STAMP_HIT));
    paint(tl, q, 'p2s18-de', GER_SEEDS, L(T('germanys') - 0.05), 0.6);
    wipeText(tl, q, '.p2s18-tkms', L(T('tkms') - 0.05), 0.45);
    draw(tl, q, '.p2s18-link-rev', L(T('supplier') - 0.15), 1.3, 'power1.inOut');
    popSvg(tl, q, '.p2s18-ott', L(T('supplier') + 1.05), 0, 0.3);
    // 3 e 4
    timelineIn(tl, q, 'p2s18-tl', L(T('expected') - 0.05), 0.8);
    timelineMark(tl, q, 'p2s18-tl', 0, L(T('2034') + 0.45));
    popIn(tl, q, 'p2s18-ck', L(T('progress') - 0.05));
    timelineToday(tl, q, 'p2s18-tl', L(T('navy') - 0.15));
    popSvg(tl, q, '.p2s18-vic', L(T('still') - 0.05));
    timelineBand(tl, q, 'p2s18-tl', 0, L(T('coming') - 0.2), 0.7);
    pulseOnce(tl, q, 'p2s18-vp', L(T('equipment') - 0.1), 1.0);
  });

  const n = Math.round(countAt(t, T('program') - 0.1, T('12') + 0.25, 0, 12, (x) => x));
  // "first four": os quatro primeiros ficam vermelhos (onda) e no "2034" descem para a linha do tempo
  const red = (i: number) => i < 4 && t > T('four') - 0.15 + i * 0.09;
  const fly = (i: number) => ramp(t, T('2034') - 0.2 + i * 0.07, T('2034') + 0.5 + i * 0.07, inOutCubic);
  const deSettled = t > T('germanys') + 1.4;
  const iceOut = ramp(t, T('in') - 0.35, T('in') + 0.2, inOutCubic);

  const [tkx, tky] = toScreen([1029, 214], cam);
  const [jx, jy] = toScreen([985, 263], cam);

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- 2: o mapa-mundi (sempre montado; aparece no "In July") ---------------- */}
      <AbsoluteFill style={{opacity: mapOp}}>
        <MapSvg cam={cam} defs={<PaintDefs id="p2s18-de" seeds={GER_SEEDS} rough={5} />}>
          <WorldBase />
          <Edge d={CAN.d} />
          <Edge d={GER.d} />
          <PaintPath id="p2s18-de" d={GER.d} settled={deSettled} />
          <LinkLine />
        </MapSvg>
        <MapLabel cls="p2s18-tkms" x={tkx} y={tky} text="TKMS" size={76} color={C.ink} anchor="left" spacing="0.1em" />
        <Stamp cls="p2s18-july" x={jx} y={jy + 40} text="July 2026" size={60} />
      </AbsoluteFill>

      {/* ---------------- 1: teto de gelo ---------------- */}
      <AbsoluteFill style={{opacity: 1 - iceOut, transform: `translate(0px, ${-280 * iceOut}px) rotate(0.03deg)`}}>
        <IceCeiling />
        <MarkerLabel cls="p2s18-ui" x={960} y={300} text="Under ice" size={62} />
      </AbsoluteFill>

      {/* ---------------- 1 e 3: a grade dos 12 + o contador ---------------- */}
      <AbsoluteFill
        style={{
          opacity: 1 - aOut,
          transformOrigin: `${G_O[0]}px ${G_O[1]}px`,
          transform: `translate(${gdx}px, ${gdy}px) scale(${gk}) rotate(0.03deg)`,
        }}
      >
        <SvgLayer>
          <PictogramGrid
            cls="p2s18-g"
            {...GRID}
            icon="submarine"
            strokeW={4}
            state={(i) => (red(i) && fly(i) <= 0.02 ? 'red' : 'off')}
          />
        </SvgLayer>
        <Counter cls="p2s18-num" x={NUM.x} y={NUM.y} value={n} digits={2} size={230} unit="Submarines" unitSize={42} />
      </AbsoluteFill>
      <CheckDisc cls="p2s18-ck" x={toGroup([GRID.x + 595 + 120, GRID.y])[0]} y={toGroup([GRID.x, GRID.y])[1]} size={112} />

      {/* ---------------- 4: linha do tempo ---------------- */}
      <Timeline
        cls="p2s18-tl"
        x={TL.x}
        y={TL.y}
        w={TL.w}
        from={TL.from}
        to={TL.to}
        today={2026}
        markSize={46}
        marks={[{at: 2034, label: '2034', accent: true, side: 'bottom', stem: 40}]}
        bands={[{from: 2026, to: 2034, label: 'The coming years', style: 'bracket', lift: 196}]}
      />
      <SvgLayer>
        {/* o unico Victoria disponivel, em TODAY */}
        <Pulse cls="p2s18-vp" cx={VIC[0]} cy={VIC[1]} r0={40} r1={120} color={C.ink} width={3} />
        <g className="p2s18-vic">
          <Icon name="submarine" x={VIC[0]} y={VIC[1]} size={116} color={C.black} fill={C.ink} strokeW={2.6} shadow />
        </g>
        {/* os quatro primeiros descem da grade ate 2034 */}
        {[0, 1, 2, 3].map((i) => {
          const f = fly(i);
          if (f <= 0.02) return null;
          const [x0, y0] = toGroup(gridCellCenter(i, GRID));
          const [x1, y1] = fourSlot(i);
          const s = lerp(GRID.size * gk, 92, f);
          return <Icon key={i} name="submarine" x={lerp(x0, x1, f)} y={lerp(y0, y1, f) - 90 * Math.sin(Math.PI * f)} size={s} color={C.black} fill={C.red} strokeW={2.4} shadow />;
        })}
      </SvgLayer>
    </AbsoluteFill>
  );
};

/** Contorno de giz (paises no mapa-mundi). */
const Edge: React.FC<{d: string}> = ({d}) => {
  const px = usePx();
  return <path d={d} fill="none" stroke={C.ink} strokeOpacity={0.75} strokeWidth={px(1.5)} strokeLinejoin="round" />;
};

/** Kiel -> Ottawa: arco tracejado (negociacao em andamento) que se desenha; ponto de chegada no Canada. */
const LinkLine: React.FC = () => {
  const px = usePx();
  const end = WORLD.links.canadaGermany.pts[0];
  return (
    <g>
      <DashedDraw id="p2s18-link" d={LINK_D} color={C.ink} width={3.4} dash={[4.6, 3.4]} />
      <g className="p2s18-ott" style={{visibility: 'hidden'}}>
        <circle cx={end[0]} cy={end[1]} r={px(9)} fill={C.ink} stroke={C.black} strokeWidth={px(2.5)} />
      </g>
    </g>
  );
};

// teto de gelo visto de baixo: blocos (placas) com a face inferior em degraus e duas cristas de pressao (quilhas)
const KEELS = [
  {x: 330, y: 136},
  {x: 1570, y: 132},
];
const KEEL_PROFILE: [number, number][] = [[-86, 0], [-58, 30], [-36, 44], [-18, 86], [4, 104], [24, 78], [44, 64], [64, 26], [90, 0]];
const ICE_FLOES = (() => {
  const out: {x0: number; x1: number; y0: number; y1: number}[] = [];
  let x = -60;
  for (let k = 0; x < 1990; k++) {
    const w = 96 + Math.round(hash01(k * 3.1 + 7) * 118);
    const y = 116 + Math.round(hash01(k * 5.7 + 2) * 30);
    const tilt = Math.round((hash01(k * 2.3 + 11) - 0.5) * 12);
    out.push({x0: x, x1: x + w, y0: y - tilt / 2, y1: y + tilt / 2});
    x += w;
  }
  return out;
})();
const ICE_EDGE: [number, number][] = (() => {
  const inKeel = (x: number) => KEELS.some((k) => x > k.x - 92 && x < k.x + 96);
  const pts: [number, number][] = [];
  for (const f of ICE_FLOES) {
    if (!inKeel(f.x0 + 5)) pts.push([f.x0 + 5, f.y0]);
    if (!inKeel(f.x1 - 5)) pts.push([f.x1 - 5, f.y1]);
  }
  for (const k of KEELS) for (const [dx, dy] of KEEL_PROFILE) pts.push([k.x + dx, k.y + dy]);
  return pts.sort((p, q) => p[0] - q[0]);
})();
const ICE_D = `M-60,-40 ${ICE_EDGE.map(([x, y]) => `L${x},${y}`).join(' ')} L1990,-40 Z`;
const ICE_EDGE_D = ptsToD(ICE_EDGE);
// juntas entre os blocos (sobem da face de baixo)
const ICE_SEAMS = ICE_FLOES.slice(1)
  .filter((f) => !KEELS.some((k) => Math.abs(f.x0 - k.x) < 110))
  .map((f, i) => `M${f.x0} ${f.y0 - 2} L${f.x0 + (i % 2 ? 9 : -8)} ${f.y0 - 46} L${f.x0 + (i % 2 ? 2 : -3)} ${f.y0 - 82}`);
// linhas de profundidade (bem fracas) na agua
const DEPTHS = [470, 700, 930];

const IceCeiling: React.FC = () => (
  <SvgLayer>
    <defs>
      <linearGradient id="p2s18-ice-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.ink} stopOpacity={0.96} />
        <stop offset="1" stopColor={C.ink} stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="p2s18-sea-g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.black} stopOpacity={0.05} />
        <stop offset="1" stopColor={C.black} stopOpacity={0.42} />
      </linearGradient>
      <clipPath id="p2s18-ice-clip">
        <path d={ICE_D} />
      </clipPath>
    </defs>
    {/* agua escura sob o gelo, com linhas de profundidade */}
    <rect x={-40} y={100} width={2000} height={1020} fill="url(#p2s18-sea-g)" />
    <g stroke={C.ink} strokeOpacity={0.08} strokeWidth={2} strokeDasharray="14 12">
      {DEPTHS.map((y) => (
        <path key={y} d={`M-20 ${y} L1940 ${y}`} />
      ))}
    </g>
    <g style={{filter: `drop-shadow(0px 12px 20px ${C.shadow})`}}>
      <path d={ICE_D} fill="url(#p2s18-ice-g)" />
    </g>
    <g clipPath="url(#p2s18-ice-clip)" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* espessura: faixa mais escura logo acima da face de baixo */}
      <path d={ICE_EDGE_D} stroke={C.black} strokeOpacity={0.16} strokeWidth={30} />
      <g stroke={C.black} strokeOpacity={0.2} strokeWidth={2.5}>
        {ICE_SEAMS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
    <path d={ICE_EDGE_D} fill="none" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
  </SvgLayer>
);

/** Disco vermelho com check em giz (o plano avancou). popIn(cls): o disco salta e o check se desenha. */
const CheckDisc: React.FC<{cls: string; x: number; y: number; size: number}> = ({cls, x, y, size}) => (
  <div style={{...at(x, y), width: size, height: size}}>
    <div className={cls} style={{width: size, height: size, borderRadius: '50%', backgroundColor: C.red, boxShadow: `0 0 0 ${Math.round(size * 0.045)}px ${C.ink}, 0 12px 30px ${C.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
        <path className={`${cls}-ic-p`} d="M18 54 L41 76 L84 26" fill="none" stroke={C.ink} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: T('replacement') - 0.3, file: 'sonar_ping', vol: 0.1, dur: 2.6},
  ...[1, 3, 5, 7, 9, 11].map((i) => ({at: T('program') - 0.15 + i * ((T('12') - T('program') - 0.05) / 11) - 0.008, file: 'tick', vol: 0.05, dur: 0.3})),
  {at: T('ice') - 0.19, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('in') - 0.4, file: 'whoosh_soft', vol: 0.15, dur: 1.0},
  {at: T('july') + 0.04 - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('germanys') - 0.05, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('supplier') - 0.15, file: 'pen_scribble', vol: 0.1, dur: 1.3, fadeOut: 0.4},
  {at: T('project') - 0.25, file: 'whoosh_soft2', vol: 0.14, dur: 1.0},
  {at: T('four') - 0.15, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('2034') - 0.25, file: 'whoosh_soft', vol: 0.12, dur: 1.0},
  {at: T('2034') + 0.45, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('progress') - 0.05, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('navy') - 0.15 + STAMP_HIT - 0.008, file: 'stamp', vol: 0.22, dur: 0.6},
  {at: T('coming') - 0.2, file: 'pen_scribble', vol: 0.09, dur: 0.8, fadeOut: 0.3},
  {at: T('equipment') - 0.1, file: 'sonar_ping', vol: 0.08, dur: 2.0, fadeOut: 0.6},
];
