// 80.30–89.95  "The people who live there are part of this discussion too. Local communities, governments, and
// indigenous peoples have interests of their own, and they know the region's challenges firsthand."
// Ancora fotografica: Iqaluit (Nunavut) em duas camadas (placa ao fundo + primeiro plano recortado). A camera avanca
// devagar e sobe; o parallax entre as camadas da profundidade. So o nome do lugar no "communities"; a foto fala sozinha.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {MapLabel} from '../../../components/Labels';
import {Depth, Plate} from '../../../components/Sticker';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {wipeText} from '../../../lib/tl';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s06');

export const P1S07: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.p1s07-place', L(T('communities') - 0.1), 0.55);
  });

  const p = ramp(t, 80.05, 90.2, inOutSine);
  const zoom = lerp(1.0, 1.12, p);
  const py = lerp(30, -22, p);
  const px = lerp(-22, 16, p);

  return (
    <AbsoluteFill ref={scope} style={{backgroundColor: '#20201f'}}>
      <Depth depth={0.35} px={px} py={py} zoom={zoom}>
        <Plate src="img/community-bg.jpg" w={2240} />
      </Depth>
      <Depth depth={0.85} px={px} py={py} zoom={zoom}>
        <Plate src="img/community-fg.png" w={2240} />
      </Depth>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,10,10,0.22) 0%, rgba(10,10,10,0) 30%, rgba(10,10,10,0) 62%, rgba(10,10,10,0.42) 100%)'}} />
      <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.45}}>
        <Img src={staticFile('bg/grid.jpg')} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      <MapLabel cls="p1s07-place" x={330} y={968} text="Iqaluit, Nunavut" size={46} color={C.ink} />
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [{at: 80.1, file: 'wind_arctic', vol: 0.16, dur: 10.0, fadeIn: 1.0, fadeOut: 1.4}];
