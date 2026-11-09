// 66.86–81.87  "Now, in a prolonged war against a major power with no outside help? My answer is no. Based on the
// capabilities we've looked at, I don't see Canada having enough in place today to sustain the defense of that entire
// region on its own."
// O golpe do episodio. Arcos de ataque voltam, a Russia (grande potencia) pinta de vermelho, os EUA escorrem e a costura
// da NORAD some (sem ajuda de fora): o Canada fica sozinho. Um instante de quietude e o NAO carimba o centro. Ele sobe
// enquanto a barra "in place today" fica curta e a regiao inteira e circulada.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {RangeRing, Stamp, StatBar} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR, polarCountry} from '../../../data/maps';
import {POLAR2, polarPoint} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, outCubic, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, paint} from '../../../lib/tl';
import {barIn, ringIn, stampIn, STAMP_HIT} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s06');

const USA = polarCountry(POLAR.ids.usa)!;
const RUS = polarCountry(POLAR.ids.russia)!;

const US_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  const [cx, cy] = polarPoint('Colorado Springs');
  for (let x = cx - 330; x <= cx + 330; x += 60) {
    for (let y = cy - 380; y <= cy + 200; y += 60) {
      s.push({x, y, r: 58, delay: Math.max(0, (y - (cy - 380)) / 600) * 0.45});
    }
  }
  return s;
})();
const RU_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  const [ox, oy] = polarPoint('Severomorsk');
  for (let x = 560; x <= 1460; x += 70) {
    for (let y = 60; y <= 620; y += 70) {
      s.push({x, y, r: 72, delay: Math.min(Math.hypot(x - ox, y - oy), 700) * 0.0009});
    }
  }
  return s;
})();

const REGION = polarPoint('Canadian Arctic');
const NO_X = 960;

const KEYS: CamKey[] = [
  {t: 66.6, x: 940, y: 600, s: 1.08, r: -4},
  {t: T('help') + 0.2, x: 944, y: 618, s: 1.22, r: -5, ease: inOutSine},
  {t: T('no', 2) - 0.1, x: 950, y: 650, s: 1.42, r: -6, ease: inOutSine},
  {t: 82.2, x: 952, y: 664, s: 1.6, r: -7, ease: inOutSine},
];

export const F08: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    POLAR2.strikeArcs.forEach((_, k) => draw(tl, q, `.f08-arc${k}`, L(T('war') - 0.1 + k * 0.12), 1.1, 'power1.inOut'));
    paint(tl, q, 'f08-ru', RU_SEEDS, L(T('major') - 0.1), 0.8);
    // "no outside help": os EUA escorrem e a costura da NORAD some
    tl.fromTo(
      q('.f08-us-seed'),
      {attr: {r: (i: number) => US_SEEDS[i].r}},
      {attr: {r: 0}, duration: 0.5, ease: 'power1.in', stagger: (i: number) => (0.45 - US_SEEDS[i].delay) * 0.9},
      L(T('outside') - 0.1),
    );
    tl.to(q('.f08-stitch'), {autoAlpha: 0, duration: 0.5, ease: 'power1.in'}, L(T('outside') - 0.1));
    stampIn(tl, q, 'f08-no', L(T('no', 2) - STAMP_HIT));
    barIn(tl, q, 'f08-bar', L(T('enough') - 0.15), 1.0);
    ringIn(tl, q, 'f08-reg', L(T('entire') - 0.2), 1.0);
  });

  const usVisible = t < T('outside') + 1.4;
  const usMasked = t > T('outside') - 0.15;
  const ruSettled = t > T('major') + 1.5;
  // depois do NAO: ele sobe e encolhe para dar lugar a explicacao
  const up = ramp(t, T('capabilities') - 0.2, T('capabilities') + 0.6, inOutCubic);
  const noY = lerp(520, 300, up);
  const noS = lerp(1, 0.48, up);
  const barVal = 0.4 * ramp(t, T('enough') - 0.15, T('today') + 0.2, outCubic);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <PaintDefs id="f08-us" seeds={US_SEEDS} rough={26} />
            <PaintDefs id="f08-ru" seeds={RU_SEEDS} rough={34} />
          </>
        }
      >
        <PolarBase />
        <PaintPath id="f08-ru" d={RUS.d} settled={ruSettled} />
        {usVisible ? <PaintPath id="f08-us" d={USA.d} settled={!usMasked} /> : null}
        <MapStrokes />
        <RangeRing cls="f08-reg" cx={REGION[0]} cy={REGION[1] - 18} r={128} color={C.red} width={3.4} dash={[7, 5]} start={200} />
      </MapSvg>
      {/* escurece levemente a cada passo, para o NAO e a barra lerem bem */}
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${0.18 + 0.22 * ramp(t, T('help'), T('no', 2), inOutSine)})`}} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${NO_X}px ${noY}px`, transform: `translate(0px, ${noY - 520}px) scale(${noS}) rotate(0.03deg)`}}>
        <Stamp cls="f08-no" x={NO_X} y={520} text="No" size={360} rot={-5} />
      </div>
      <StatBar cls="f08-bar" x={560} y={930} w={800} value={barVal} label="In place today" labelPos="top" target={0.92} targetLabel="Needed" />
    </AbsoluteFill>
  );
};

const MapStrokes: React.FC = () => {
  const px = usePx();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {POLAR2.strikeArcs.map((a, k) => (
        <path key={k} className={`f08-arc${k}`} d={a.d} stroke={C.red} strokeOpacity={0.55} strokeWidth={px(2.4)} strokeDasharray={`${px(9)} ${px(7)}`} />
      ))}
      <path className="f08-stitch" d={POLAR2.alaskaBorder} stroke={C.ink} strokeWidth={px(3)} />
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('war') - 0.1, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('major') - 0.1, file: 'boom', vol: 0.14, dur: 2.2, fadeOut: 0.8},
  {at: T('outside') - 0.15, file: 'paper_slide2', vol: 0.14, dur: 0.7},
  {at: T('no', 2) - 0.008, file: 'stamp', vol: 0.34, dur: 0.6},
  {at: T('no', 2) - 0.02, file: 'boom', vol: 0.24, dur: 3.0, fadeOut: 1.2},
  {at: T('enough') - 0.1, file: 'marker_swipe', vol: 0.14, dur: 0.6},
  {at: T('entire') - 0.25, file: 'pen_scribble', vol: 0.14, dur: 1.0, fadeOut: 0.3},
];
