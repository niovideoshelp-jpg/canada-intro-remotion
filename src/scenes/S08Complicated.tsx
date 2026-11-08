// 38.10–41.00  "But that's where things get complicated."
// Volta a ancora visual do globo polar: o Artico e uma vizinhanca disputada. A camera gira e
// mergulha no arquipelago enquanto a rota da Passagem do Noroeste e tracada em vermelho.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw} from '../components/Bits';
import {MapLabel} from '../components/Labels';
import {MapSvg} from '../components/MapSvg';
import {PolarBase} from '../components/PolarBase';
import {POLAR} from '../data/maps';
import '../gsap';
import {CamKey, camAt, toScreen} from '../lib/camera';
import {inOutCubic} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, wipeText} from '../lib/tl';
import {C} from '../theme';
import {W as T} from '../timing';

const KEYS: CamKey[] = [
  {t: 37.85, x: 960, y: 556, s: 0.98, r: -4},
  {t: 41.25, x: 948, y: 628, s: 1.62, r: -16, ease: inOutCubic},
];

export const S08Complicated: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.s08-l-rus', L(T.but + 0.1), 0.4);
    wipeText(tl, q, '.s08-l-usa', L(T.but + 0.25), 0.4);
    wipeText(tl, q, '.s08-l-grl', L(T.but + 0.4), 0.4);
    draw(tl, q, '.s08-nwp-rev', L(38.95), 1.5, 'power1.inOut');
    wipeText(tl, q, '.s08-l-nwp', L(T.complicated - 0.1), 0.45);
  });

  const [rx, ry] = toScreen(POLAR.labels.russia, cam);
  const [ux, uy] = toScreen(POLAR.labels.usa, cam);
  const [gx, gy] = toScreen(POLAR.labels.greenland, cam);
  const [nx, ny] = toScreen(POLAR.labels.nwPassage, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <PolarBase />
        <DashedDraw id="s08-nwp" d={POLAR.nwPassage} color={C.ink} width={3.2} dash={[7, 6]} />
      </MapSvg>
      <MapLabel cls="s08-l-rus" x={rx} y={ry} text="Russia" size={36} color={C.inkSoft} />
      <MapLabel cls="s08-l-usa" x={ux} y={uy} text="USA" size={32} color={C.inkSoft} />
      <MapLabel cls="s08-l-grl" x={gx} y={gy} text="Greenland" size={30} color={C.inkSoft} />
      <MapLabel cls="s08-l-nwp" x={nx} y={ny - 30} text="Northwest Passage" size={30} color={C.ink} spacing="0.16em" />
    </AbsoluteFill>
  );
};
