// 34.30–38.10  "leaving the rest of this enormous country virtually untouched."
// Natureza intocada em camadas (placa distante + primeiro plano recortado no Canva):
// a camera avanca devagar e "sobe" — parallax entre as camadas da sensacao de profundidade.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {MapLabel} from '../components/Labels';
import {Depth, Plate} from '../components/Sticker';
import '../gsap';
import {inOutSine, lerp, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {wipeText} from '../lib/tl';
import {C} from '../theme';
import {W as T} from '../timing';
import {ASSETS, WILD_PLACE} from '../assets';

export const S07Untouched: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    tl.fromTo(q('.s07-dot'), {scale: 0}, {scale: 1, duration: 0.3, ease: 'back.out(2)'}, L(T.enormous - 0.2));
    wipeText(tl, q, '.s07-place', L(T.enormous - 0.1), 0.5);
  });

  const p = ramp(t, 34.05, 38.4, inOutSine);
  const zoom = lerp(1.0, 1.13, p);
  const py = lerp(34, -26, p);
  const px = lerp(-18, 18, p);

  return (
    <AbsoluteFill ref={scope} style={{backgroundColor: '#20201f'}}>
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
      {/* identificacao do lugar (texto so para identificar o local) */}
      <div style={{position: 'absolute', left: 170, top: 168, width: 18, height: 18}}>
        <div className="s07-dot" style={{width: 18, height: 18, borderRadius: '50%', backgroundColor: C.red, boxShadow: '0 0 0 4px rgba(0,0,0,0.35)'}} />
      </div>
      <MapLabel cls="s07-place" x={204} y={177} anchor="left" text={WILD_PLACE.name} size={34} color={C.ink} spacing="0.16em" />
    </AbsoluteFill>
  );
};
