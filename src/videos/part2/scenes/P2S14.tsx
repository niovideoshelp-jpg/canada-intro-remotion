// 182.13–203.15  "But these ships have limits too. They're rated to operate in up to 1 meter of first-year ice, which
// doesn't mean they can get through any ice conditions. Their 25mm armament fits their patrol and enforcement role. In
// my view, they do a lot to strengthen Canada's presence, but their combat power is limited if they're facing a naval
// force equipped for high-intensity warfare."
// 1) Perfil: o DeWolf (proa para a direita) avanca e quebra o gelo de primeiro ano (cota 1 M, check vermelho); mais a
//    frente o gelo plurianual com cristas: o navio para e ganha um X. 2) O recorte volta com um anel no canhao de proa,
//    25 MM, e a lista PATROL / ENFORCEMENT / PRESENCE com checks. 3) Poder de combate: o DeWolf contra uma forca naval
//    (tres navios de guerra) e duas barras, curta x longa. Sem numeros.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Callout, Checklist, Icon, StatBar, SvgLayer} from '../../../components/kit';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, outCubic, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, slideIn, wipeText} from '../../../lib/tl';
import {calloutIn, checkIn, popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s14');

// ---- 1) o gelo (perfil)
const WATER = 640;
const W1 = 1100; // largura do recorte no perfil
const K1 = W1 / 1575;
const H1 = 834 * K1;
const CY1 = WATER - (788 / 834 - 0.5) * H1; // linha d'agua do casco na agua
const BOW_OFF = -W1 / 2 + 168 * K1; // proa (a esquerda) em relacao ao centro do recorte
const FY0 = 680; // gelo de primeiro ano: de FY0 ate FY1
const FY1 = 1160;
const MY1 = 680; // gelo plurianual: da borda esquerda ate MY1
const RIDGE_D = (() => {
  const pts: string[] = [];
  for (let x = -40; x <= MY1; x += 20) {
    const h = 34 + 26 * Math.abs(Math.sin(x / 47)) + 18 * Math.abs(Math.sin(x / 19 + 1));
    pts.push(`${x},${(WATER - h).toFixed(1)}`);
  }
  return `M-40,${WATER + 70} L${pts.join(' L')} L${MY1},${WATER + 70} Z`;
})();
const CRACKS = [
  'M1110 612 L1095 640 L1104 668',
  'M1030 612 L1042 637 L1028 668',
  'M950 612 L934 641 L944 668',
  'M870 612 L882 642 L868 668',
];
const BOW0 = 1330; // proa parada a direita
const BOW1 = 930; // depois de quebrar o gelo fino
const BOW2 = MY1 + 26; // parada no gelo grosso

// ---- 2) o recorte de frente (proa a esquerda) e o canhao
const SH = {x: 760, y: 470, w: 1180};
const K2 = SH.w / 1575;
const GUN: [number, number] = [SH.x - SH.w / 2 + 348 * K2, SH.y - (834 * K2) / 2 + 457 * K2];

export const P2S14: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    slideIn(tl, q, '.p2s14-ice-dw', L(182.0), 1400, 0, 0.8);
    draw(tl, q, '.p2s14-1m-l', L(T('1') - 0.25), 0.35, 'power2.out');
    wipeText(tl, q, '.p2s14-1m-lbl', L(T('1') - 0.05), 0.35);
    tl.to(q('.p2s14-1m-l, .p2s14-1m-lbl'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('first') + 0.15));
    CRACKS.forEach((_, i) => draw(tl, q, `.p2s14-ck${i}`, L(T('first') - 0.2 + i * 0.12), 0.25, 'none'));
    popSvg(tl, q, '.p2s14-ok', L(T('ice') - 0.05));
    tl.to(q('.p2s14-ok'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('which') - 0.1));
    popSvg(tl, q, '.p2s14-no', L(T('any') + 0.15));
    // 2
    slideIn(tl, q, '.p2s14-dw', L(T('their') - 0.45), -1500, 0, 0.75);
    calloutIn(tl, q, 'p2s14-gun', L(T('25mm') - 0.1));
    checkIn(tl, q, 'p2s14-ck', 0, L(T('patrol') - 0.15));
    checkIn(tl, q, 'p2s14-ck', 1, L(T('enforcement') - 0.15));
    checkIn(tl, q, 'p2s14-ck', 2, L(T('presence') - 0.25));
    // 3
    slideIn(tl, q, '.p2s14-dw3', L(T('combat') - 0.5), -1200, 0, 0.6);
    [0, 1, 2].forEach((k) => popSvg(tl, q, `.p2s14-w${k}`, L(T('naval') - 0.15 + k * 0.12)));
    wipeText(tl, q, '.p2s14-cp', L(T('combat') - 0.05), 0.45);
  });

  // 1: avanca, quebra o gelo fino, para no grosso
  const go1 = ramp(t, T('first') - 0.25, T('ice') + 0.5, inOutSine);
  const go2 = ramp(t, T('through') - 0.2, T('any') + 0.1, outCubic);
  const cx = lerp(BOW0, BOW1, go1) + lerp(0, BOW2 - BOW1, go2) - BOW_OFF;
  const aOut = ramp(t, T('their') - 0.6, T('their') - 0.15, inOutSine);
  const bOut = ramp(t, T('combat') - 0.7, T('combat') - 0.25, inOutSine);
  const b1 = 0.2 * ramp(t, T('limited') - 0.2, T('limited') + 0.5, outCubic);
  const b2 = 0.92 * ramp(t, T('high') - 0.3, T('warfare') + 0.2, outCubic);
  // o gelo fino quebrado fica para tras (as placas se afastam da proa)
  const broken = ramp(t, T('first') - 0.1, T('ice') + 0.5, inOutCubic);

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- 1: perfil no gelo ---------------- */}
      <AbsoluteFill style={{opacity: 1 - aOut}}>
        <SvgLayer>
          {/* agua */}
          <rect x={-40} y={WATER} width={2000} height={500} fill={C.black} fillOpacity={0.35} />
          <path d={`M-40 ${WATER} L1960 ${WATER}`} stroke={C.ink} strokeOpacity={0.6} strokeWidth={3} />
          {/* gelo de primeiro ano (1 m): placas que se separam quando a proa passa */}
          {[0, 1, 2, 3, 4].map((i) => {
            const x0 = FY0 + i * 96;
            const dx = broken * (i % 2 ? -16 : 10) * (5 - i) * 0.5;
            const rot = broken * (i % 2 ? 6 : -5);
            return (
              <rect key={i} x={x0 + dx} y={WATER - 22} width={92} height={70} rx={3} fill="#E9EEF1" fillOpacity={0.9} stroke={C.black} strokeOpacity={0.4} strokeWidth={2} transform={`rotate(${rot} ${x0 + 46} ${WATER + 10})`} />
            );
          })}
          {CRACKS.map((d, i) => (
            <path key={i} className={`p2s14-ck${i}`} d={d} fill="none" stroke={C.black} strokeWidth={3} strokeLinecap="round" />
          ))}
          {/* gelo plurianual com cristas */}
          <path d={RIDGE_D} fill="#DCE3E8" stroke={C.black} strokeOpacity={0.35} strokeWidth={2} />
          {/* espessura do gelo fino: colchete vertical + rotulo horizontal */}
          <path className="p2s14-1m-l" d={`M${FY1 + 26} ${WATER - 22} L${FY1 + 26} ${WATER + 48} M${FY1 + 14} ${WATER - 22} L${FY1 + 38} ${WATER - 22} M${FY1 + 14} ${WATER + 48} L${FY1 + 38} ${WATER + 48}`} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </SvgLayer>
        <div style={at(FY1 + 50, WATER + 13, '0%', '-50%')}>
          <div className="p2s14-1m-lbl" style={{fontFamily: ANTON, fontSize: 60, color: C.ink, letterSpacing: '0.04em', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
            1 M
          </div>
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${cx}px, 0px) rotate(0.03deg)`}}>
          <Sticker cls="p2s14-ice-dw" src="img/dewolf.png" x={0} y={CY1} w={W1} />
        </div>
        <SvgLayer>
          <g className="p2s14-ok" style={{visibility: 'hidden'}}>
            <Disc x={BOW1 - 70} y={430} color={C.red} mark="check" />
          </g>
          <g className="p2s14-no" style={{visibility: 'hidden'}}>
            <Disc x={BOW2 - 90} y={430} color={C.red} mark="cross" />
          </g>
        </SvgLayer>
      </AbsoluteFill>

      {/* ---------------- 2: o canhao e o papel ---------------- */}
      <AbsoluteFill style={{opacity: aOut * (1 - bOut)}}>
        <Sticker cls="p2s14-dw" src="img/dewolf.png" x={SH.x} y={SH.y} w={SH.w} />
        <SvgLayer>
          <Callout cls="p2s14-gun" x={GUN[0]} y={GUN[1]} r={42} to={[GUN[0] - 120, GUN[1] - 190]} label="25 MM" size={64} />
        </SvgLayer>
        <Checklist cls="p2s14-ck" x={1430} y={470} items={['Patrol', 'Enforcement', 'Presence']} marks={['check', 'check', 'check']} size={62} />
      </AbsoluteFill>

      {/* ---------------- 3: poder de combate ---------------- */}
      <AbsoluteFill style={{opacity: bOut}}>
        <Sticker cls="p2s14-dw3" src="img/dewolf.png" x={520} y={360} w={640} />
        <SvgLayer>
          {[0, 1, 2].map((k) => (
            <g key={k} className={`p2s14-w${k}`}>
              <Icon name="warship" x={1220 + k * 230} y={350 + (k % 2) * 46} size={240} color={C.black} fill={C.red} flip shadow />
            </g>
          ))}
        </SvgLayer>
        <div style={at(960, 650)}>
          <div className="p2s14-cp" style={{fontFamily: ANTON, fontSize: 52, color: C.ink, letterSpacing: '0.08em', marginRight: '-0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
            Combat power
          </div>
        </div>
        <StatBar cls="p2s14-b1" x={700} y={770} w={900} h={38} value={b1} label="DeWolf" labelPos="left" labelSize={40} color={C.ink} />
        <StatBar cls="p2s14-b2" x={700} y={860} w={900} h={38} value={b2} label="Naval force" labelPos="left" labelSize={40} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Disco com check ou X em giz. */
const Disc: React.FC<{x: number; y: number; color: string; mark: 'check' | 'cross'}> = ({x, y, color, mark}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={58} fill={color} stroke={C.ink} strokeWidth={5} />
    <path d={mark === 'check' ? 'M-28 2 L-8 22 L28 -20' : 'M-22 -22 L22 22 M22 -22 L-22 22'} fill="none" stroke={C.ink} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const cues: Cue[] = [
  {at: T('rated') - 0.3, file: 'ice_crack', vol: 0.12, dur: 1.4, fadeOut: 0.5},
  {at: T('1') - 0.2, file: 'pen_scribble', vol: 0.08, dur: 0.6},
  {at: T('ice') - 0.05, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('any') + 0.1, file: 'boom', vol: 0.12, dur: 1.4, fadeOut: 0.6},
  {at: T('any') + 0.15, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('their') - 0.45, file: 'whoosh_soft2', vol: 0.12, dur: 0.9},
  {at: T('25mm') - 0.1, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('patrol') + 0.15, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('enforcement') + 0.15, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('presence') + 0.05, file: 'marker_swipe', vol: 0.12, dur: 0.6},
  {at: T('naval') - 0.15, file: 'boom', vol: 0.12, dur: 2.0, fadeOut: 0.8},
];
