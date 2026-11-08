// 15.80–21.95  "where the population is basically polar bears, moose, and a handful of brave souls."
// Paisagem do Artico em camadas (placa distante + gelo proximo recortado no Canva) com parallax
// lateral; os "habitantes" entram como adesivos recortados, cada um na sua palavra.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Depth, Plate, Sticker} from '../components/Sticker';
import '../gsap';
import {inOutSine, lerp, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {pop} from '../lib/tl';
import {W as T} from '../timing';
import {ASSETS} from '../assets';

export const S04Population: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    pop(tl, q, '.s04-bear', L(T.polar - 0.06), -3);
    pop(tl, q, '.s04-moose', L(T.moose - 0.04), 2.5);
    pop(tl, q, '.s04-people', L(T.handful - 0.05), -2);
  });

  // camera: travelling lateral lento + leve aproximacao (parallax por profundidade)
  const p = ramp(t, 15.55, 22.2, inOutSine);
  const px = lerp(80, -80, p);
  const py = lerp(6, -8, p);
  const zoom = lerp(1.0, 1.06, p);

  return (
    <AbsoluteFill ref={scope} style={{backgroundColor: '#20201f'}}>
      <Depth depth={0.3} px={px} py={py} zoom={zoom}>
        <Plate src={ASSETS.arcticBg} w={2280} />
      </Depth>
      <Depth depth={0.5} px={px} py={py} zoom={zoom}>
        <Plate src={ASSETS.arcticFg} w={2280} />
      </Depth>
      {/* escurece um pouco a foto para os adesivos e o vermelho se destacarem */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,10,0.18) 0%, rgba(10,10,10,0.05) 45%, rgba(10,10,10,0.38) 100%)'}} />
      <Depth depth={1} px={px} py={py} zoom={zoom}>
        <Sticker cls="s04-bear" src={ASSETS.polarBear} x={545} y={655} w={460} />
        <Sticker cls="s04-moose" src={ASSETS.moose} x={1120} y={610} w={600} />
        <Sticker cls="s04-people" src={ASSETS.people} x={1555} y={705} w={330} />
      </Depth>
      {/* a mesma textura do papel por cima, bem leve, para a foto pertencer ao filme */}
      <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.5}}>
        <Img src={staticFile('bg/grid.jpg')} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
