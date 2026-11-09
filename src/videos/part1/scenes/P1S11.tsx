// 125.20–141.11  "In documents prepared for Parliament in June 2026, the Canadian government said it saw no immediate
// military threat to its Arctic territory. At the same time, it identified Russia as the main military threat in the
// region. Those two assessments can both be true."
// O documento (sem texto falso) com o carimbo JUNE 2026 e a frase marcada em vermelho; ele vai para a esquerda e o globo
// sobe: a Russia pinta de vermelho — MAIN MILITARY THREAT. No "both true", as duas avaliacoes ganham o seu check.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DocCard, Stamp} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR, polarCountry} from '../../../data/maps';
import {polarPoint} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {marker, paint} from '../../../lib/tl';
import {STAMP_HIT, docHighlight, docIn, popIn, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s10');

const RUS = polarCountry(POLAR.ids.russia)!;
const RU_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  const [ox, oy] = polarPoint('Severomorsk');
  for (let x = 560; x <= 1460; x += 66) for (let y = 60; y <= 620; y += 66) s.push({x, y, r: 66, delay: Math.min(Math.hypot(x - ox, y - oy), 700) * 0.001});
  return s;
})();
const RU_LABEL = polarPoint('Kara Sea');

const KEYS: CamKey[] = [
  {t: 124.9, x: 700, y: 430, s: 1.12, r: 0},
  {t: 141.4, x: 690, y: 420, s: 1.18, r: 0, ease: inOutSine},
];

export const P1S11: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    docIn(tl, q, 'p1s11-doc', L(T('documents') - 0.35), -900, L(T('immediate') - 0.3));
    stampIn(tl, q, 'p1s11-date', L(T('june') - STAMP_HIT + 0.1));
    docHighlight(tl, q, 'p1s11-doc', L(T('immediate') - 0.25));
    paint(tl, q, 'p1s11-ru', RU_SEEDS, L(T('russia') - 0.1), 0.8);
    marker(tl, q, 'p1s11-main', L(T('main') - 0.1));
    popIn(tl, q, 'p1s11-ck1', L(T('those') - 0.05));
    popIn(tl, q, 'p1s11-ck2', L(T('assessments') + 0.05));
  });

  // o documento vai para a esquerda quando a Russia entra; o mapa so ganha forca depois
  const side = ramp(t, T('russia') - 0.5, T('russia') + 0.3, inOutCubic);
  const mapLight = ramp(t, T('russia') - 0.6, T('russia') + 0.2, inOutSine);
  const docX = lerp(960, 470, side);
  const docS = lerp(1, 0.82, side);
  const [rx, ry] = toScreen(RU_LABEL, cam);
  const lx = Math.min(Math.max(rx, 1060), 1460);
  const ruSettled = t > T('russia') + 1.6;

  return (
    <AbsoluteFill ref={scope}>
      <div style={{position: 'absolute', inset: 0, opacity: lerp(0.35, 1, mapLight)}}>
        <MapSvg cam={cam} defs={<PaintDefs id="p1s11-ru" seeds={RU_SEEDS} rough={34} />}>
          <PolarBase />
          <PaintPath id="p1s11-ru" d={RUS.d} settled={ruSettled} />
        </MapSvg>
      </div>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${0.55 * (1 - mapLight)})`}} />
      <MarkerLabel cls="p1s11-main" x={lx} y={ry + 40} text="Main military threat" size={58} />
      <CheckDisc cls="p1s11-ck2" x={lx + 345} y={ry + 40} size={104} />

      <div style={{position: 'absolute', inset: 0, transformOrigin: `${docX}px 520px`, transform: `translate(${docX - 960}px, 0px) scale(${docS}) rotate(0.03deg)`}}>
        <DocCard cls="p1s11-doc" x={960} y={520} w={540} highlight={['No immediate', 'military threat']} seed={3} />
        <Stamp cls="p1s11-date" x={1130} y={820} text="June 2026" size={58} backing={false} />
        <CheckDisc cls="p1s11-ck1" x={1218} y={212} size={128} />
      </div>
    </AbsoluteFill>
  );
};

/** Disco vermelho com o check em giz (le bem em qualquer fundo). Anima com popIn(cls). */
const CheckDisc: React.FC<{cls: string; x: number; y: number; size: number}> = ({cls, x, y, size}) => (
  <div style={{...at(x, y), width: size, height: size}}>
    <div className={cls} style={{width: size, height: size, borderRadius: '50%', backgroundColor: C.red, boxShadow: `0 0 0 ${Math.round(size * 0.045)}px ${C.ink}, 0 12px 30px ${C.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100" style={{display: 'block', overflow: 'visible'}}>
        <path className={`${cls}-ic`} d="M18 54 L41 76 L84 26" fill="none" stroke={C.ink} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: T('documents') - 0.35 - 0.184 + 0.25, file: 'paper_slide', vol: 0.2, dur: 0.8},
  {at: T('june') + 0.1 - 0.008, file: 'stamp', vol: 0.28, dur: 0.6},
  {at: T('immediate') - 0.3, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: T('russia') - 0.1, file: 'boom', vol: 0.14, dur: 2.2, fadeOut: 0.8},
  {at: T('main') - 0.17, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('those') - 0.05 - 0.004, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('assessments') + 0.05 - 0.004, file: 'pop', vol: 0.18, dur: 0.3},
];
