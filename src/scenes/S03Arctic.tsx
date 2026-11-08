// 13.20–15.80  "and 40% of its territory is in the Arctic,"
// O Canada fica neutro e os tres territorios do norte (Yukon, NWT, Nunavut = 39% da area)
// recebem a tinta vermelha, do norte para o sul, enquanto o numero conta ate 40%.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours, ProvinceLines} from '../components/CanadaLayers';
import {BigNumber, MapLabel} from '../components/Labels';
import {MapSvg} from '../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../components/Paint';
import {CA} from '../data/maps';
import '../gsap';
import {CamKey, camAt, toScreen} from '../lib/camera';
import {inOutSine, outCubic, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {paint, wipeText} from '../lib/tl';
import {C} from '../theme';
import {W as T} from '../timing';

const PAINT = 's03p';
const TERR_D = CA.provinces
  .filter((p) => p.territory)
  .map((p) => p.d)
  .join('');

const SEEDS: Seed[] = [];
for (let x = 440; x <= 1180; x += 120) {
  for (let y = 90; y <= 760; y += 120) {
    SEEDS.push({x, y, r: 140, delay: ((y - 90) / 550) * 0.5 + ((x - 440) / 740) * 0.12});
  }
}

const KEYS: CamKey[] = [
  {t: 12.9, x: 960, y: 548, s: 0.9},
  {t: 13.25, x: 960, y: 548, s: 0.9},
  {t: 16.1, x: 905, y: 455, s: 1.07, ease: inOutSine},
];

export const S03Arctic: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);
  const settled = t > T.forty + 1.2;

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    paint(tl, q, PAINT, SEEDS, L(T.forty - 0.08), 0.7);
    wipeText(tl, q, '.s03-arctic', L(T.arctic1 - 0.3), 0.45);
    wipeText(tl, q, '.s03-num', L(T.forty - 0.12), 0.3);
  });

  const value = 40 * ramp(t, T.forty, T.forty + 0.85, outCubic);
  const [nx, ny] = toScreen([1205, 350], cam);
  const [ax, ay] = toScreen([800, 300], cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam} defs={<PaintDefs id={PAINT} seeds={SEEDS} rough={40} />}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill fill="#4A4742" />
        <PaintPath id={PAINT} d={TERR_D} settled={settled} />
        <ProvinceLines color={C.ink} opacity={0.3} width={1} />
        <CanadaOutline width={1.6} opacity={0.9} />
      </MapSvg>
      <MapLabel cls="s03-arctic" x={ax} y={ay} text="Arctic" size={58} color={C.ink} spacing="0.42em" />
      <BigNumber cls="s03-num" value={value} suffix="%" minDigits={2} x={nx} y={ny} size={210} />
    </AbsoluteFill>
  );
};
