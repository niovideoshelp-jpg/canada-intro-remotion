// 96.08–105.00  "If you found this video helpful, give it a like and subscribe to the channel. Thanks for sticking with
// me to the end, and I'll see you in the next one."
// Fecho calmo, sem interface falsa: o globo polar (ancora #1) com o Canada em vermelho gira e se afasta devagar, o navio
// (ancora #3) deriva no terco inferior, e no ultimo segundo tudo baixa para a textura do fundo.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {MapSvg} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec} from '../../../lib/scene';

const KEYS: CamKey[] = [
  {t: 95.8, x: 948, y: 640, s: 1.5, r: -8},
  {t: 105.2, x: 958, y: 560, s: 0.98, r: -2, ease: inOutSine},
];

export const F11: React.FC = () => {
  const t = useGlobalSec();
  const cam = camAt(t, KEYS);
  const fade = 1 - 0.78 * ramp(t, 103.6, 104.95, inOutSine);
  const shipX = lerp(1180, 1080, ramp(t, 95.8, 105.2, inOutSine));
  const shipIn = ramp(t, 96.1, 97.4, inOutSine);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <MapSvg cam={cam}>
        <PolarBase />
      </MapSvg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 55% at 50% 48%, rgba(0,0,0,0) 40%, rgba(12,12,11,0.55) 100%)'}} />
      <div style={{...at(shipX, lerp(1010, 905, shipIn)), width: 620, opacity: shipIn}}>
        <Img src={staticFile('img/dewolf.png')} style={{width: '100%', display: 'block'}} />
      </div>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [{at: 96.2, file: 'wind_arctic', vol: 0.14, dur: 8.8, fadeIn: 1.2, fadeOut: 2.4}];
