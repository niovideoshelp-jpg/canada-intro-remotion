// 203.15–221.61  "The Coast Guard complements that work with icebreakers, search and rescue, navigation support, and
// information about conditions at sea. Although responsibility for it shifted to the Defense Department in September
// 2025, it remains a civilian organization. That administrative change didn't turn its ships into combat vessels."
// O quebra-gelo da Guarda Costeira (CCGS Amundsen, casco vermelho) entra; CANADIAN COAST GUARD e quatro discos nas
// palavras (quebra-gelo, resgate, navegacao, condicoes do mar). Organograma: a caixa COAST GUARD vai para baixo de
// DEPARTMENT OF NATIONAL DEFENCE, carimbo SEPT 2025, e a etiqueta CIVILIAN fica nela. No fim o navio volta e uma arma
// sobre ele leva um X vermelho.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Icon, IconBadge, Stamp, SvgLayer} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, fadeIn, marker, slideIn, wipeText} from '../../../lib/tl';
import {popIn, popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s15');

const ROLES = [
  {cls: 'p2s15-ice', word: 'icebreakers', icon: 'icebreaker', label: 'Icebreaking', x: 420},
  {cls: 'p2s15-sar', word: 'rescue', icon: 'lifebuoy', label: 'Search & rescue', x: 780},
  {cls: 'p2s15-nav', word: 'navigation', icon: 'buoy', label: 'Navigation', x: 1140},
  {cls: 'p2s15-sea', word: 'conditions', icon: 'wave', label: 'Sea conditions', x: 1500},
] as const;
const DND = {x: 960, y: 300, w: 860, h: 120};
const CG0 = {x: 1480, y: 700};
const CG1 = {x: 960, y: 640};
const CG = {w: 520, h: 110};

export const P2S15: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s15-ccg', L(T('coast') - 0.45), 1500, 0, 0.8);
    wipeText(tl, q, '.p2s15-name', L(T('guard') - 0.1), 0.5);
    ROLES.forEach((r) => popIn(tl, q, r.cls, L(T(r.word) - 0.15)));
    // organograma
    fadeIn(tl, q, '.p2s15-dnd', L(T('responsibility') - 0.2), 0.4);
    fadeIn(tl, q, '.p2s15-cg', L(T('responsibility') - 0.05), 0.4);
    draw(tl, q, '.p2s15-link', L(T('department') - 0.1), 0.5, 'power2.out');
    stampIn(tl, q, 'p2s15-sep', L(T('september') - STAMP_HIT));
    marker(tl, q, 'p2s15-civ', L(T('civilian') - 0.1));
    // o navio volta, a arma leva um X
    slideIn(tl, q, '.p2s15-ccg2', L(T('administrative') - 0.3), 1500, 0, 0.75);
    popSvg(tl, q, '.p2s15-gun', L(T('turn') - 0.1));
    popSvg(tl, q, '.p2s15-x', L(T('combat') - 0.05), 0, 0.36);
  });

  const aOut = ramp(t, T('although') - 0.5, T('although') - 0.05, inOutSine);
  const move = ramp(t, T('shifted') - 0.2, T('department') + 0.1, inOutCubic);
  const cgx = lerp(CG0.x, CG1.x, move);
  const cgy = lerp(CG0.y, CG1.y, move);
  const bOut = ramp(t, T('administrative') - 0.7, T('administrative') - 0.25, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- A ---------------- */}
      <AbsoluteFill style={{opacity: 1 - aOut}}>
        <Sticker cls="p2s15-ccg" src="img/ccg-icebreaker.png" x={960} y={430} w={1060} />
        <div style={at(960, 92)}>
          <div className="p2s15-name" style={{fontFamily: ANTON, fontSize: 70, color: C.ink, letterSpacing: '0.06em', marginRight: '-0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
            Canadian Coast Guard
          </div>
        </div>
        {ROLES.map((r) => (
          <IconBadge key={r.cls} cls={r.cls} x={r.x} y={860} icon={r.icon} size={138} label={r.label} labelSize={32} />
        ))}
      </AbsoluteFill>

      {/* ---------------- B: organograma ---------------- */}
      <AbsoluteFill style={{opacity: aOut * (1 - bOut)}}>
        <SvgLayer>
          <path className="p2s15-link" d={`M${DND.x} ${DND.y + DND.h / 2} L${CG1.x} ${CG1.y - CG.h / 2}`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        </SvgLayer>
        <Box cls="p2s15-dnd" x={DND.x} y={DND.y} w={DND.w} h={DND.h} text="Department of National Defence" size={46} />
        <Box cls="p2s15-cg" x={cgx} y={cgy} w={CG.w} h={CG.h} text="Coast Guard" size={56} accent />
        <MarkerLabel cls="p2s15-civ" x={cgx} y={cgy + 120} text="Civilian" size={58} barColor={C.ink} textColor={C.black} />
        <Stamp cls="p2s15-sep" x={1520} y={430} text="Sept 2025" size={74} />
      </AbsoluteFill>

      {/* ---------------- C: nao virou navio de combate ---------------- */}
      <AbsoluteFill style={{opacity: bOut}}>
        <Sticker cls="p2s15-ccg2" src="img/ccg-icebreaker.png" x={960} y={560} w={1100} />
        <SvgLayer>
          <g className="p2s15-gun" style={{visibility: 'hidden'}}>
            <Icon name="missile" x={960} y={170} size={260} color={C.black} fill={C.ink} shadow />
          </g>
          <g className="p2s15-x" style={{visibility: 'hidden'}}>
            <Icon name="cross" x={960} y={170} size={200} color={C.red} strokeW={12} />
          </g>
        </SvgLayer>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Caixa de organograma em giz. */
const Box: React.FC<{cls: string; x: number; y: number; w: number; h: number; text: string; size: number; accent?: boolean}> = ({cls, x, y, w, h, text, size, accent}) => (
  <div style={{...at(x, y), width: w, height: h}}>
    <div
      className={cls}
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        border: `4px solid ${accent ? C.red : C.ink}`,
        borderRadius: 10,
        backgroundColor: 'rgba(17,17,17,0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: ANTON,
        fontSize: size,
        color: C.ink,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        visibility: 'hidden',
      }}
    >
      {text}
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: T('coast') - 0.45, file: 'ship_horn', vol: 0.07, dur: 1.8, fadeIn: 0.2, fadeOut: 0.7},
  {at: T('guard') - 0.1, file: 'marker_swipe', vol: 0.14, dur: 0.6},
  ...ROLES.map((r, k) => ({at: T(r.word) - 0.15, file: k % 2 ? 'pop2' : 'pop', vol: 0.15, dur: 0.3})),
  {at: T('although') - 0.5, file: 'whoosh_soft', vol: 0.12, dur: 1.0},
  {at: T('shifted') - 0.2, file: 'paper_slide2', vol: 0.12, dur: 0.7},
  {at: T('september') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('civilian') - 0.15, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('administrative') - 0.3, file: 'whoosh_soft2', vol: 0.12, dur: 0.9},
  {at: T('combat') - 0.05, file: 'pop2', vol: 0.18, dur: 0.3},
];
