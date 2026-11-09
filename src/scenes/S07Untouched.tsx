// 34.30–38.10  "leaving the rest of this enormous country virtually untouched."
// Natureza intocada em camadas (placa distante + primeiro plano recortado no Canva):
// a camera avanca devagar e "sobe" — parallax entre as camadas da sensacao de profundidade.
// Sem legenda de lugar: a foto (Marvel Lake, Mount Assiniboine Provincial Park) fala sozinha.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Depth, Plate} from '../components/Sticker';
import {inOutSine, lerp, ramp} from '../lib/ease';
import {useGlobalSec} from '../lib/scene';
import {ASSETS} from '../assets';

export const S07Untouched: React.FC = () => {
  const t = useGlobalSec();

  const p = ramp(t, 34.05, 38.4, inOutSine);
  const zoom = lerp(1.0, 1.13, p);
  const py = lerp(34, -26, p);
  const px = lerp(-18, 18, p);

  return (
    <AbsoluteFill style={{backgroundColor: '#20201f'}}>
      <Depth depth={0.35} px={px} py={py} zoom={zoom}>
        <Plate src={ASSETS.wildBg} w={2240} />
      </Depth>
      <Depth depth={0.85} px={px} py={py} zoom={zoom}>
        <Plate src={ASSETS.wildFg} w={2240} />
      </Depth>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,10,0.25) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 70%, rgba(10,10,10,0.3) 100%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.45}}>
        <Img src={staticFile('bg/grid.jpg')} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
