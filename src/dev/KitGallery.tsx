// Galeria do kit (composicao DevKit, 900 frames): cada componente de src/components/kit em cena, animado
// em sequencia, com legendas pequenas. So para conferencia local (a nuvem nao renderiza Dev*).
// Usa <Scene> de verdade (cortina com borda vermelha), entao os tempos sao GLOBAIS, como nos videos.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ASSETS} from '../assets';
import {Backdrop, ScreenFX} from '../components/Backdrop';
import {MapSvg} from '../components/MapSvg';
import {PolarBase} from '../components/PolarBase';
import {POLAR2, polarPoint} from '../data/maps2';
import {Sticker} from '../components/Sticker';
import {WipeEdges} from '../components/WipeEdges';
import {
  Balance,
  Callout,
  Checklist,
  Counter,
  Dimension,
  DocCard,
  ICON_NAMES,
  Icon,
  IconBadge,
  IconHtml,
  MovingTrack,
  PictogramGrid,
  Pulse,
  RadarSweep,
  RangeRing,
  SplitPanel,
  Stamp,
  StatBar,
  SvgLayer,
  Timeline,
  countAt,
  stepsAt,
  sweepAngle,
  trackHead,
  trackPoly,
} from '../components/kit';
import {ANTON} from '../fonts';
import '../gsap';
import {CamKey, camAt} from '../lib/camera';
import {inOutCubic, inOutSine, outCubic, ramp} from '../lib/ease';
import {at as pos} from '../lib/pos';
import {Scene, useGlobalSec, useLocal} from '../lib/scene';
import {cutsOf} from '../lib/time';
import {pop, slideIn} from '../lib/tl';
import {
  STAMP_HIT,
  balanceIn,
  barIn,
  calloutIn,
  checkIn,
  counterIn,
  dimIn,
  docHighlight,
  docIn,
  drawIcon,
  dropIn,
  gridIn,
  popIn,
  pulseOnce,
  ringIn,
  stampIn,
  timelineBand,
  timelineIn,
  timelineMark,
  timelineToday,
} from '../lib/tl2';
import {C, W} from '../theme';

const SCENES = {
  icons: [0, 5],
  badges: [5, 10],
  docs: [10, 15],
  time: [15, 20],
  grids: [20, 25],
  maps: [25, 30],
} as const;

/** Legenda minuscula (nome do componente / helper). */
const Cap: React.FC<{x: number; y: number; text: string; anchor?: 'left' | 'center'}> = ({x, y, text, anchor = 'center'}) => (
  <div style={pos(x, y, anchor === 'center' ? '-50%' : '0%', '0%')}>
    <div style={{fontFamily: ANTON, fontSize: 17, letterSpacing: '0.14em', color: C.inkDim, whiteSpace: 'nowrap', textTransform: 'uppercase'}}>{text}</div>
  </div>
);

// ---------------------------------------------------------------------------------------------
// 1) Icones: todos se desenhando + variantes (cheio, vermelho, tracejado, vaga vazia, HTML)
// ---------------------------------------------------------------------------------------------
const COLS = 13;
const CW = 138;
const CH = 150;
const IX0 = (W - (COLS - 1) * CW) / 2;
const VARS: {name: (typeof ICON_NAMES)[number]; cap: string; props: Record<string, unknown>}[] = [
  {name: 'jet', cap: 'fill ink', props: {fill: C.ink}},
  {name: 'bomber', cap: 'fill red', props: {fill: C.red, color: C.red}},
  {name: 'ship', cap: 'red + ink line', props: {fill: C.red}},
  {name: 'submarine', cap: 'dashed', props: {dashed: true, color: C.inkSoft}},
  {name: 'person', cap: 'empty slot', props: {dashed: true, color: C.red, fill: C.red, fillOpacity: 0.14}},
  {name: 'shipTop', cap: 'rot 45', props: {rot: 45}},
  {name: 'helicopter', cap: 'flip', props: {flip: true}},
  {name: 'radarDome', cap: 'cut details', props: {fill: C.ink}},
];

const IconsPage: React.FC = () => {
  const L = useLocal();
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    ICON_NAMES.forEach((_, i) => drawIcon(tl, q, `g1-i${i}`, L(0.2 + i * 0.03), 0.6));
    VARS.forEach((_, i) => drawIcon(tl, q, `g1-v${i}`, L(2.2 + i * 0.08), 0.6));
    pop(tl, q, '.g1-h40', L(2.9));
    pop(tl, q, '.g1-h64', L(3.0));
    pop(tl, q, '.g1-h140', L(3.1));
  });
  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        {ICON_NAMES.map((n, i) => (
          <Icon key={n} name={n} cls={`g1-i${i}`} x={IX0 + (i % COLS) * CW} y={96 + Math.floor(i / COLS) * CH} size={76} shadow />
        ))}
        {VARS.map((v, i) => (
          <Icon key={v.name} name={v.name} cls={`g1-v${i}`} x={170 + i * 150} y={860} size={84} shadow {...v.props} />
        ))}
      </SvgLayer>
      {ICON_NAMES.map((n, i) => (
        <Cap key={n} x={IX0 + (i % COLS) * CW} y={96 + Math.floor(i / COLS) * CH + 46} text={n} />
      ))}
      {VARS.map((v, i) => (
        <Cap key={v.name} x={170 + i * 150} y={916} text={v.cap} />
      ))}
      <IconHtml cls="g1-h40" name="radarDish" x={1440} y={860} size={40} />
      <IconHtml cls="g1-h64" name="radarDish" x={1530} y={860} size={64} />
      <IconHtml cls="g1-h140" name="radarDish" x={1690} y={860} size={140} color={C.red} />
      <Cap x={1560} y={950} text="IconHtml 40 / 64 / 140" />
      <Cap x={60} y={1010} text="Icon (SVG) + drawIcon  ·  props: size color fill cut strokeW rot flip dashed" anchor="left" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// 2) IconBadge + popIn, Stamp + stampIn, Counter + countAt
// ---------------------------------------------------------------------------------------------
const BadgesPage: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    popIn(tl, q, 'g2-b0', L(5.3));
    popIn(tl, q, 'g2-b1', L(5.55));
    popIn(tl, q, 'g2-b2', L(5.8));
    popIn(tl, q, 'g2-b3', L(6.05));
    stampIn(tl, q, 'g2-st', L(6.5));
    stampIn(tl, q, 'g2-no', L(7.3));
    counterIn(tl, q, 'g2-c0', L(5.5));
    counterIn(tl, q, 'g2-c1', L(6.2));
    counterIn(tl, q, 'g2-c2', L(6.6));
    counterIn(tl, q, 'g2-c3', L(7.0));
  });
  return (
    <AbsoluteFill ref={scope}>
      <IconBadge cls="g2-b0" x={230} y={260} icon="fuel" label="Fuel" />
      <IconBadge cls="g2-b1" x={470} y={260} icon="wrench" label="Maintenance" />
      <IconBadge cls="g2-b2" x={710} y={260} icon="antenna" label="Comms" />
      <IconBadge cls="g2-b3" x={950} y={260} icon="people" label="Support" ring="red" />
      <Cap x={590} y={420} text="IconBadge + popIn  (ring ink / red)" />
      <Stamp cls="g2-st" x={1450} y={200} text="July 24, 2024" size={58} />
      <Cap x={1450} y={262} text={`Stamp + stampIn  (impact at +${STAMP_HIT}s)`} />
      <Stamp cls="g2-no" x={1480} y={455} text="No" size={170} rot={-6} />
      <Counter cls="g2-c0" x={330} y={700} value={countAt(t, 5.6, 7.8, 0, 162000)} digits={6} size={120} suffix="KM" unit="Kilometers" />
      <Counter cls="g2-c1" x={850} y={700} value={countAt(t, 6.3, 7.9, 0, 2.67)} decimals={2} prefix="C$" size={120} unit="Billion" color={C.red} />
      <Counter cls="g2-c2" x={1280} y={700} value={countAt(t, 6.7, 8.3, 0, 1500)} digits={4} suffix="+" size={120} unit="Rangers" />
      <Counter cls="g2-c3" x={1650} y={700} value={Math.round(countAt(t, 7.1, 8.2, 0, 4))} size={120} unit="Passes a day" />
      <Cap x={960} y={870} text="Counter  ·  fixed-width digits, prefix / suffix / unit  ·  value = countAt(t, t0, t1, from, to)" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// 3) DocCard + docIn/docHighlight (+ Stamp sobre o papel), Checklist + checkIn
// ---------------------------------------------------------------------------------------------
const DocsPage: React.FC = () => {
  const L = useLocal();
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    docIn(tl, q, 'g3-doc', L(10.2));
    stampIn(tl, q, 'g3-st', L(11.1));
    docHighlight(tl, q, 'g3-doc', L(11.7));
    checkIn(tl, q, 'g3-ck', 0, L(11.2));
    checkIn(tl, q, 'g3-ck', 1, L(11.9));
    checkIn(tl, q, 'g3-ck', 2, L(12.6));
    checkIn(tl, q, 'g3-ck', 3, L(13.3));
  });
  return (
    <AbsoluteFill ref={scope}>
      <DocCard cls="g3-doc" x={560} y={520} w={540} title="Arctic Cooperation Agreement" highlight={['No immediate', 'military threat']} />
      <Stamp cls="g3-st" x={690} y={735} text="1988" size={64} backing={false} rot={-8} />
      <Cap x={560} y={940} text="DocCard + docIn / docHighlight  ·  Stamp backing={false}" />
      <Checklist cls="g3-ck" x={1060} y={500} items={['Military presence', 'Patrols', 'Defense missions', 'Alone, long war']} marks={['check', 'check', 'check', 'cross']} size={62} />
      <Cap x={1060} y={800} text="Checklist + checkIn (check / cross)" anchor="left" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// 4) Timeline (marcos, faixas, colchete, HOJE) + StatBar
// ---------------------------------------------------------------------------------------------
const TimePage: React.FC = () => {
  const L = useLocal();
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    timelineIn(tl, q, 'g4-a', L(15.25));
    timelineMark(tl, q, 'g4-a', 0, L(16.0));
    timelineMark(tl, q, 'g4-a', 1, L(16.4));
    timelineBand(tl, q, 'g4-a', 0, L(16.8));
    timelineToday(tl, q, 'g4-a', L(17.3));
    timelineIn(tl, q, 'g4-b', L(15.6), 0.8);
    timelineMark(tl, q, 'g4-b', 0, L(16.5));
    timelineBand(tl, q, 'g4-b', 0, L(17.0));
    barIn(tl, q, 'g4-s0', L(17.6));
    barIn(tl, q, 'g4-s1', L(17.85));
    barIn(tl, q, 'g4-s2', L(18.1));
  });
  return (
    <AbsoluteFill ref={scope}>
      <Timeline
        cls="g4-a"
        x={960}
        y={250}
        w={1500}
        from={2026}
        to={2031}
        today={2026}
        marks={[
          {at: 2028, label: '2028', sub: 'In Canada'},
          {at: 2029.92, label: 'Dec 2029', sub: 'Initial capability', accent: true, side: 'bottom'},
        ]}
        bands={[{from: 2029, to: 2030, label: '2029–2030', sub: 'Initial operational capability', lift: 26}]}
      />
      <Cap x={960} y={440} text="Timeline + timelineIn / timelineMark / timelineBand / timelineToday" />
      <Timeline
        cls="g4-b"
        x={960}
        y={590}
        w={1300}
        from={1958}
        to={2026}
        markSize={34}
        yearSize={26}
        marks={[{at: 1958, label: '1958', sub: 'NORAD', accent: true}]}
        bands={[{from: 1962, to: 2026, label: 'For decades', style: 'bracket', lift: 52}]}
      />
      <StatBar cls="g4-s0" x={560} y={780} w={900} value={0.24} label="Conventional" color={C.inkSoft} />
      <StatBar cls="g4-s1" x={560} y={850} w={900} value={0.88} label="Over-the-horizon" />
      <StatBar cls="g4-s2" x={560} y={960} w={900} value={0.38} label="In place today" target={0.92} targetLabel="Needed" />
      <Cap x={1640} y={850} text="StatBar + barIn" anchor="left" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// 5) PictogramGrid (estados on/red/dim/off/empty) + Balance (stepsAt + dropIn)
// ---------------------------------------------------------------------------------------------
const GridsPage: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    gridIn(tl, q, 'g5-jets', L(20.2), 0.016);
    gridIn(tl, q, 'g5-subs', L(20.6), 0.05);
    gridIn(tl, q, 'g5-ppl', L(21.0), 0.05);
    balanceIn(tl, q, 'g5-bal', L(20.3));
    dropIn(tl, q, '.g5-d0', L(21.2));
    dropIn(tl, q, '.g5-d1', L(21.8));
    dropIn(tl, q, '.g5-d2', L(22.4));
    dropIn(tl, q, '.g5-d3', L(23.0));
  });
  const tilt = stepsAt(t, 12, [
    {at: 21.62, to: 8.5},
    {at: 22.22, to: 5},
    {at: 22.82, to: 2},
    {at: 23.42, to: 0},
  ], 0.55, outCubic);
  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        <PictogramGrid
          cls="g5-jets"
          x={480}
          y={330}
          n={88}
          cols={11}
          icon="jet"
          size={44}
          gap={10}
          state={(i) => (t > 22.0 + i * 0.03 && i < 8 ? 'red' : t > 23.2 && i >= 64 ? 'off' : 'on')}
        />
        <PictogramGrid cls="g5-subs" x={480} y={700} n={12} cols={6} icon="submarine" size={70} gap={8} state={(i) => (i < 4 ? 'red' : i === 4 ? 'on' : 'dim')} />
        <PictogramGrid cls="g5-ppl" x={480} y={900} n={12} cols={12} icon="person" size={78} cellW={34} gap={8} state={(i) => (i >= 10 ? 'empty' : 'on')} />
        <Balance
          cls="g5-bal"
          x={1400}
          y={430}
          w={640}
          tilt={tilt}
          leftLabel="Canada"
          leftAccent
          rightLabel="United States"
          left={
            <>
              <g className="g5-d0">
                <Icon name="radarDome" x={-62} y={-30} size={60} />
              </g>
              <g className="g5-d1">
                <Icon name="satellite" x={-14} y={-34} size={60} />
              </g>
              <g className="g5-d2">
                <Icon name="ship" x={40} y={-24} size={62} />
              </g>
              <g className="g5-d3">
                <Icon name="jet" x={8} y={-80} size={54} rot={90} />
              </g>
            </>
          }
        />
      </SvgLayer>
      <Cap x={480} y={540} text="PictogramGrid 88 · state(i): on / red / off" />
      <Cap x={480} y={790} text="dim" />
      <Cap x={480} y={964} text="empty slots" />
      <Cap x={1400} y={1000} text="Balance + balanceIn · tilt = stepsAt(...) · dropIn" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// 6) SplitPanel: Dimension + Callout no adesivo  |  mapa polar: RangeRing, Pulse, RadarSweep, MovingTrack
// ---------------------------------------------------------------------------------------------
const MAP_KEYS: CamKey[] = [
  {t: 25.0, x: 556, y: 612, s: 2.45},
  {t: 30.2, x: 580, y: 614, s: 2.85, ease: inOutSine},
];
// trajetorias reais (src/data/maps2): 1 Tu-95 + 1 H-6 e os dois interceptadores
const BOMBERS = [POLAR2.bomberTracks[0], POLAR2.bomberTracks[2]].map((tr) => trackPoly(tr.pts));
const JETS = POLAR2.interceptTracks.map((tr) => trackPoly(tr.pts));
const ANC = polarPoint('Anchorage');
const FAI = polarPoint('Fairbanks');

const MapsPage: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, MAP_KEYS);
  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.g6-ship', L(25.0), -900, 0, 0.7);
    dimIn(tl, q, 'g6-dim', L(25.9));
    calloutIn(tl, q, 'g6-co', L(26.5));
    ringIn(tl, q, 'g6-rr', L(26.3));
    pulseOnce(tl, q, 'g6-p0', L(26.1));
    pulseOnce(tl, q, 'g6-p1', L(27.6));
  });
  const split = ramp(t, 25.35, 25.95, inOutCubic);
  const bp = ramp(t, 25.8, 29.8, inOutSine);
  const jp = ramp(t, 26.6, 29.9, inOutSine);
  const blips = BOMBERS.map((poly) => trackHead(poly, bp).p).map(([x, y]) => ({x, y}));
  return (
    <AbsoluteFill ref={scope}>
      <SplitPanel
        progress={split}
        tintRight={0}
        left={
          <AbsoluteFill>
            <Sticker cls="g6-ship" src={ASSETS.dewolf} x={470} y={540} w={720} />
            <SvgLayer>
              <Dimension cls="g6-dim" from={[124, 770]} to={[812, 770]} label="103 M" side={1} />
              <Callout cls="g6-co" x={259} y={556} r={30} to={[170, 420]} label="25 MM" />
            </SvgLayer>
            <Cap x={470} y={900} text="Dimension + dimIn · Callout + calloutIn" />
          </AbsoluteFill>
        }
        right={
          <AbsoluteFill>
            <MapSvg cam={cam}>
              <PolarBase />
              <RangeRing cls="g6-rr" cx={ANC[0]} cy={ANC[1]} r={24} dash={[3.2, 2.6]} fill={C.ink} fillOpacity={0.07} dot />
              <Pulse cls="g6-p0" cx={FAI[0]} cy={FAI[1]} r0={2} r1={20} />
              <Pulse cls="g6-p1" cx={FAI[0]} cy={FAI[1]} r0={2} r1={20} />
              <RadarSweep cx={742} cy={606} r={58} angle={sweepAngle(t, 25.6, 2.4)} start={0} blips={blips} rings={3} />
              {BOMBERS.map((poly, k) => (
                <MovingTrack key={k} pts={poly} progress={bp} icon="bomber" iconSize={34} iconColor={C.red} iconFill={C.red} color={C.red} dash={[3.2, 2.6]} width={2.4} ghost={0.2} />
              ))}
              {JETS.map((poly, k) => (
                <MovingTrack key={k} pts={poly} progress={jp} icon="jet" iconSize={30} iconFill={C.ink} color={C.ink} dash={[3.2, 2.6]} width={2} />
              ))}
            </MapSvg>
            <Cap x={1450} y={940} text="RangeRing · Pulse · RadarSweep · MovingTrack (inside MapSvg, zooming)" />
          </AbsoluteFill>
        }
      />
      <Cap x={960} y={1010} text="SplitPanel (progress 0 -> 1)" />
    </AbsoluteFill>
  );
};

export const KitGallery: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
    <Scene range={SCENES.icons} first name="Icons">
      <IconsPage />
    </Scene>
    <Scene range={SCENES.badges} name="Badges, stamp, counter">
      <BadgesPage />
    </Scene>
    <Scene range={SCENES.docs} name="Doc, checklist">
      <DocsPage />
    </Scene>
    <Scene range={SCENES.time} name="Timeline, statbar">
      <TimePage />
    </Scene>
    <Scene range={SCENES.grids} name="Grids, balance">
      <GridsPage />
    </Scene>
    <Scene range={SCENES.maps} last name="Split, map kit">
      <MapsPage />
    </Scene>
    <WipeEdges cuts={cutsOf(SCENES)} />
    <ScreenFX />
  </AbsoluteFill>
);
