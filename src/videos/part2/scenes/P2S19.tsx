// 270.20–282.09  "In maritime patrol aviation, work is also underway to replace the CP-140 Aurora with the P-8A Poseidon,
// which is designed for surveillance and operations against submarines and surface ships."
// MARITIME PATROL. O CP-140 Aurora (recorte, nariz para a esquerda) a esquerda; no "replace" uma seta de giz leva a uma vaga
// tracejada com a silhueta exata do substituto, e no "P-8A Poseidon" o recorte do P-8 ocupa a vaga (nariz para a direita);
// o Aurora apaga. O palco sobe e tres discos entram sob o P-8: vigilancia, submarinos e navios de superficie.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw, HandArrow} from '../../../components/Bits';
import {IconBadge, SvgLayer} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, markerOut, slideIn, wipeText} from '../../../lib/tl';
import {popIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s19');

const CP = {x: 480, y: 520, w: 720}; // cp140.png 1471x437
const P8 = {x: 1420, y: 520, w: 760}; // p8.png 1470x506
const P8_H = (P8.w * 506) / 1470;
const LIFT = 190; // o palco sobe para os discos

// contorno do recorte do P-8 (alpha > 140, simplificado), em fracoes da LARGURA da imagem: a vaga tracejada
const P8_OUTLINE: [number, number][] = [
  [0.019, 0.0211], [0.019, 0.0313], [0.0871, 0.1939], [0.0272, 0.1844], [0.015, 0.1878], [0.0116, 0.1986], [0.0633, 0.2299],
  [0.0707, 0.2442], [0.083, 0.2469], [0.0694, 0.2619], [0.0721, 0.2707], [0.0946, 0.2728], [0.1014, 0.2803], [0.115, 0.2844],
  [0.1422, 0.2762], [0.1578, 0.2782], [0.1878, 0.2905], [0.2177, 0.2857], [0.2918, 0.2918], [0.3653, 0.2918], [0.4857, 0.2735],
  [0.5354, 0.2884], [0.5469, 0.285], [0.5585, 0.2714], [0.568, 0.2789], [0.5639, 0.2878], [0.5667, 0.3034], [0.585, 0.3163],
  [0.598, 0.3184], [0.6068, 0.315], [0.615, 0.3048], [0.615, 0.283], [0.6435, 0.2782], [0.6605, 0.2816], [0.6728, 0.2898],
  [0.6871, 0.2912], [0.7401, 0.2823], [0.7667, 0.2735], [0.7755, 0.2585], [0.7728, 0.2265], [0.8741, 0.2102], [0.8735, 0.232],
  [0.8796, 0.2374], [0.8966, 0.2395], [0.9061, 0.2293], [0.9041, 0.2129], [0.9299, 0.2048], [0.9367, 0.1918], [0.966, 0.1728],
  [0.9769, 0.1599], [0.9769, 0.149], [0.968, 0.1395], [0.9429, 0.1293], [0.9259, 0.117], [0.8844, 0.1082], [0.8, 0.1116],
  [0.7891, 0.1054], [0.7769, 0.115], [0.7415, 0.1197], [0.732, 0.117], [0.7218, 0.1224], [0.683, 0.1279], [0.6714, 0.1238],
  [0.6592, 0.1313], [0.5823, 0.1422], [0.5707, 0.1388], [0.5612, 0.1449], [0.5204, 0.151], [0.5082, 0.1469], [0.4986, 0.1537],
  [0.4803, 0.1565], [0.4333, 0.1463], [0.3456, 0.119], [0.2789, 0.1102], [0.2694, 0.117], [0.2735, 0.1279], [0.3156, 0.1381],
  [0.3796, 0.1694], [0.3673, 0.1667], [0.3544, 0.1748], [0.3293, 0.1769], [0.2612, 0.1673], [0.2259, 0.1524], [0.0905, 0.0272],
  [0.0871, 0.0143], [0.0592, 0.0109], [0.0245, 0.0156],
];
const SLOT_D = (() => {
  const x0 = P8.x - P8.w / 2;
  const y0 = P8.y - P8_H / 2;
  const p = P8_OUTLINE.map(([u, v]) => `${(x0 + u * P8.w).toFixed(1)},${(y0 + v * P8.w).toFixed(1)}`);
  return `M${p.join(' L')} Z`;
})();

const BADGES = [
  {cls: 'p2s19-eye', word: 'surveillance', icon: 'eye', label: 'Surveillance', x: 1130},
  {cls: 'p2s19-sub', word: 'submarines', icon: 'submarine', label: 'Submarines', x: 1400},
  {cls: 'p2s19-shp', word: 'surface', icon: 'ship', label: 'Surface ships', x: 1670},
] as const;
const BADGE_Y = 815;

export const P2S19: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s19-cp', L(269.9), -1100, 0, 0.8);
    marker(tl, q, 'p2s19-mp', L(T('maritime') - 0.12));
    draw(tl, q, '.p2s19-slot-rev', L(T('underway') - 0.1), 1.0, 'power1.inOut');
    draw(tl, q, '.p2s19-arw-c', L(T('replace') - 0.15), 0.45, 'power2.out');
    draw(tl, q, '.p2s19-arw-h', L(T('replace') + 0.3), 0.14, 'none');
    wipeText(tl, q, '.p2s19-cp-l', L(T('cp') - 0.05), 0.45);
    tl.fromTo(q('.p2s19-p8'), {autoAlpha: 0, scale: 0.94}, {autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power2.out'}, L(T('p') - 0.12));
    tl.to(q('.p2s19-slot'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('p') + 0.12));
    wipeText(tl, q, '.p2s19-p8-l', L(T('poseidon') - 0.05), 0.45);
    markerOut(tl, q, 'p2s19-mp', L(T('which') - 0.35));
    BADGES.forEach((b) => popIn(tl, q, b.cls, L(T(b.word) - 0.12)));
  });

  // o Aurora apaga quando o P-8 chega; depois o palco sobe para os discos
  const dim = ramp(t, T('poseidon') - 0.1, T('poseidon') + 0.5, inOutSine);
  const up = LIFT * ramp(t, T('which') - 0.3, T('designed') + 0.25, inOutCubic);

  return (
    <AbsoluteFill ref={scope}>
      <MarkerLabel cls="p2s19-mp" x={960} y={165} text="Maritime patrol" size={66} />

      <AbsoluteFill style={{transform: `translate(0px, ${-up}px) rotate(0.03deg)`}}>
        {/* o atual: CP-140 Aurora */}
        <div style={{position: 'absolute', inset: 0, opacity: lerp(1, 0.42, dim), filter: `grayscale(${0.7 * dim})`}}>
          <Sticker cls="p2s19-cp" src="img/cp140.png" x={CP.x} y={CP.y} w={CP.w} />
          <Lbl cls="p2s19-cp-l" x={CP.x} y={CP.y + 175} text="CP-140 Aurora" />
        </div>
        {/* a seta e a vaga do substituto */}
        <SvgLayer>
          <HandArrow cls="p2s19-arw" from={[CP.x + CP.w / 2 + 30, CP.y - 10]} to={[P8.x - P8.w / 2 - 20, P8.y - 30]} bow={-0.28} color={C.ink} width={6} />
          <g className="p2s19-slot">
            <DashedDraw id="p2s19-slot" d={SLOT_D} color={C.ink} width={3.4} dash={[13, 10]} opacity={0.85} />
          </g>
        </SvgLayer>
        {/* o substituto: P-8A Poseidon */}
        <Sticker cls="p2s19-p8" src="img/p8.png" x={P8.x} y={P8.y} w={P8.w} origin="50% 50%" />
        <Lbl cls="p2s19-p8-l" x={P8.x} y={P8.y + 195} text="P-8A Poseidon" color={C.ink} />
      </AbsoluteFill>

      {BADGES.map((b) => (
        <IconBadge key={b.cls} cls={b.cls} x={b.x} y={BADGE_Y} icon={b.icon} size={150} label={b.label} labelSize={36} />
      ))}
    </AbsoluteFill>
  );
};

const Lbl: React.FC<{cls: string; x: number; y: number; text: string; color?: string}> = ({cls, x, y, text, color = C.ink}) => (
  <div style={at(x, y)}>
    <div className={cls} style={{fontFamily: ANTON, fontSize: 58, color, letterSpacing: '0.06em', marginRight: '-0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
      {text}
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: 269.9, file: 'whoosh_soft2', vol: 0.14, dur: 1.0},
  {at: T('maritime') - 0.19, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('replace') - 0.15, file: 'pen_scribble', vol: 0.1, dur: 0.9, fadeOut: 0.3},
  {at: T('p') - 0.2, file: 'jet_flyby', vol: 0.14, dur: 2.2, fadeOut: 0.9},
  {at: T('surveillance') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
  {at: T('submarines') - 0.12, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('surface') - 0.12, file: 'pop', vol: 0.16, dur: 0.3},
];
