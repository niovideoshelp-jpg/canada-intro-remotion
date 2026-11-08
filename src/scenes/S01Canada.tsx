// 0.00–10.85  "This is Canada. A big country. A really big country. A ridiculously big country.
//              Okay, I think we've established that it's big."
// O contorno do Canada e desenhado a giz, a tinta vermelha se espalha, e a camera "exagera" junto
// com o narrador: cada "big" e um empurrao de zoom; no "ridiculously" o pais nao cabe mais na tela;
// no "Okay..." a camera volta, calma.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Graticule, Neighbours, ProvinceLines} from '../components/CanadaLayers';
import {MapSvg, usePx} from '../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../components/Paint';
import {CA} from '../data/maps';
import {ANTON} from '../fonts';
import '../gsap';
import {CamKey, camAt} from '../lib/camera';
import {inOutCubic, inOutQuint, inOutSine, outQuart} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, fadeIn, paint} from '../lib/tl';
import {C} from '../theme';
import {W as T} from '../timing';

const PAINT = 's01p';
const [[bx0, by0], [bx1, by1]] = CA.canadaBounds;
const ORIGIN: [number, number] = [800, 600];

// grade de sementes cobrindo o pais; a tinta nasce no centro e corre para as bordas
const SEEDS: Seed[] = [];
for (let x = bx0 + 20; x <= bx1 + 40; x += 150) {
  for (let y = by0 + 10; y <= by1 + 40; y += 150) {
    const d = Math.hypot(x - ORIGIN[0], y - ORIGIN[1]);
    SEEDS.push({x, y, r: 165, delay: (d / 760) * 0.62});
  }
}

const LABEL: [number, number] = [790, 640];
const ZOOM_TARGET: [number, number] = [705, 590];

const KEYS: CamKey[] = [
  {t: 0, x: 960, y: 548, s: 0.86},
  {t: 1.95, x: 960, y: 548, s: 0.9, ease: inOutSine},
  {t: 2.5, x: 925, y: 572, s: 1.2, ease: outQuart}, // "big"
  {t: 4.02, x: 920, y: 576, s: 1.25, ease: inOutSine},
  {t: 4.6, x: 880, y: 588, s: 1.68, ease: outQuart}, // "really big"
  {t: 5.42, x: 872, y: 590, s: 1.74, ease: inOutSine},
  {t: 6.75, x: ZOOM_TARGET[0], y: ZOOM_TARGET[1], s: 3.7, ease: inOutCubic}, // "ridiculously big"
  {t: 7.85, x: ZOOM_TARGET[0] + 6, y: ZOOM_TARGET[1], s: 3.84, ease: inOutSine},
  {t: 9.25, x: 960, y: 548, s: 0.9, ease: inOutQuint}, // "Okay..."
  {t: 11.1, x: 960, y: 545, s: 0.93, ease: inOutSine},
];

// linhas de cota (medicao) — levemente fora do eixo, como feitas a mao
const DIM_H = `M${bx0} ${by1 + 32} L${bx1} ${by1 + 36}`;
const DIM_H_TICKS = `M${bx0} ${by1 + 18} L${bx0} ${by1 + 46} M${bx1} ${by1 + 22} L${bx1} ${by1 + 50}`;
const DIM_V = `M${bx0 - 36} ${by0} L${bx0 - 33} ${by1}`;
const DIM_V_TICKS = `M${bx0 - 50} ${by0} L${bx0 - 22} ${by0} M${bx0 - 47} ${by1} L${bx0 - 19} ${by1}`;

const Dims: React.FC = () => {
  const px = usePx();
  const common = {fill: 'none', stroke: C.ink, strokeOpacity: 0.85, strokeWidth: px(2), strokeLinecap: 'round' as const};
  return (
    <g>
      <path className="s01-dimh" d={DIM_H} {...common} />
      <path className="s01-dimh-t" d={DIM_H_TICKS} {...common} />
      <path className="s01-dimv" d={DIM_V} {...common} />
      <path className="s01-dimv-t" d={DIM_V_TICKS} {...common} />
    </g>
  );
};

const CanadaOutlineDraw: React.FC = () => {
  const px = usePx();
  return (
    <path className="s01-outline" d={CA.canada} fill="none" stroke={C.ink} strokeWidth={px(2.2)} strokeLinejoin="round" strokeLinecap="round" />
  );
};

export const S01Canada: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);
  const settled = t > 2.1;

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    fadeIn(tl, q, '.s01-neigh', L(0), 0.6);
    fadeIn(tl, q, '.s01-grat', L(0), 0.8);
    draw(tl, q, '.s01-outline', L(0.04), 1.15, 'power1.inOut', CA.canadaDrawFrac);
    paint(tl, q, PAINT, SEEDS, L(0.42), 0.75);
    fadeIn(tl, q, '.s01-prov', L(1.0), 0.6);
    tl.fromTo(q('.s01-label-clip'), {attr: {width: 0}}, {attr: {width: 900}, duration: 0.45, ease: 'power2.out'}, L(T.canada - 0.04));
    // cotas medidas ANTES do primeiro empurrao de zoom (1.95 s), com o pais inteiro no quadro
    draw(tl, q, '.s01-dimh', L(0.95), 0.5);
    draw(tl, q, '.s01-dimh-t', L(1.42), 0.14, 'none');
    draw(tl, q, '.s01-dimv', L(1.3), 0.5);
    draw(tl, q, '.s01-dimv-t', L(1.77), 0.14, 'none');
  });

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <PaintDefs id={PAINT} seeds={SEEDS} rough={44} />
            <clipPath id="s01-label-clip" clipPathUnits="userSpaceOnUse">
              <rect className="s01-label-clip" x={LABEL[0] - 450} y={LABEL[1] - 120} width={0} height={200} />
            </clipPath>
          </>
        }
      >
        <g className="s01-grat" style={{visibility: 'hidden'}}>
          <Graticule d={CA.graticule} />
        </g>
        <g className="s01-neigh" style={{visibility: 'hidden'}}>
          <Neighbours />
        </g>
        <PaintPath id={PAINT} d={CA.canada} settled={settled} />
        <g className="s01-prov" style={{visibility: 'hidden'}}>
          <ProvinceLines color={C.black} opacity={0.32} width={1} />
        </g>
        <CanadaOutlineDraw />
        <Dims />
        <g clipPath="url(#s01-label-clip)">
          <text
            x={LABEL[0] + 3}
            y={LABEL[1] + 4}
            textAnchor="middle"
            fontFamily={ANTON}
            fontSize={112}
            letterSpacing={14}
            fill="#000"
            fillOpacity={0.28}
          >
            CANADA
          </text>
          <text x={LABEL[0]} y={LABEL[1]} textAnchor="middle" fontFamily={ANTON} fontSize={112} letterSpacing={14} fill={C.ink}>
            CANADA
          </text>
        </g>
      </MapSvg>
    </AbsoluteFill>
  );
};
