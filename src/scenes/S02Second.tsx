// 10.85–13.20  "It's the second largest country on the planet,"
// A camera sai do Canada e revela o globo visto de cima (projecao de areas iguais: tamanhos reais).
// Canada = 2, Russia = 1.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Badge} from '../components/Bits';
import {MapLabel} from '../components/Labels';
import {MapSvg, usePx} from '../components/MapSvg';
import {PolarBase} from '../components/PolarBase';
import {POLAR, polarCountry} from '../data/maps';
import '../gsap';
import {CamKey, camAt, toScreen} from '../lib/camera';
import {inOutCubic, inOutSine, linear} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, pop, wipeText} from '../lib/tl';
import {C} from '../theme';
import {W as T} from '../timing';

const KEYS: CamKey[] = [
  {t: 10.6, x: 944, y: 760, s: 1.6, r: 0},
  {t: 10.95, x: 944, y: 758, s: 1.58, r: 0, ease: linear},
  {t: 12.15, x: 960, y: 550, s: 1.05, r: -2, ease: inOutCubic},
  {t: 13.5, x: 960, y: 548, s: 1.08, r: -4, ease: inOutSine},
];

const russia = polarCountry(POLAR.ids.russia)!;

const RussiaOutline: React.FC = () => {
  const px = usePx();
  return <path className="s02-rus" d={russia.d} fill="none" stroke={C.ink} strokeWidth={px(1.8)} strokeLinejoin="round" />;
};

export const S02Second: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    pop(tl, q, '.s02-b2', L(T.second - 0.02), 0, 0.45);
    wipeText(tl, q, '.s02-l2', L(T.second + 0.12));
    draw(tl, q, '.s02-rus', L(T.largest - 0.05), 0.8, 'power1.inOut', POLAR.russiaDrawFrac);
    pop(tl, q, '.s02-b1', L(T.largest + 0.1), 0, 0.42);
    wipeText(tl, q, '.s02-l1', L(T.largest + 0.22));
  });

  const [cx, cy] = toScreen(POLAR.labels.canada, cam);
  const [rx, ry] = toScreen(POLAR.labels.russia, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <PolarBase highlight={{[POLAR.ids.russia]: '#4B4945'}} />
        <RussiaOutline />
      </MapSvg>
      <Badge cls="s02-b2" x={cx} y={cy - 18} n="2" size={128} ring={C.ink} />
      <MapLabel cls="s02-l2" x={cx} y={cy + 76} text="Canada" size={40} color={C.ink} />
      <Badge cls="s02-b1" x={rx} y={ry - 10} n="1" size={104} ring={C.inkDim} color={C.inkSoft} />
      <MapLabel cls="s02-l1" x={rx} y={ry + 64} text="Russia" size={34} color={C.inkSoft} />
    </AbsoluteFill>
  );
};
