// 151.64–165.86  "At sea, all six Harry DeWolf-class patrol ships have been delivered, and the program reached full
// operational capability in October 2026. They've been operating in the Arctic between June and October, expanding
// Canada's presence during the navigation season."
// Ancora #3 (a ultima imagem da Intro): o recorte do HMCS Harry DeWolf entra; SEIS navios em pictograma, HARRY DEWOLF
// CLASS, carimbo OCT 2026 (capacidade operacional plena). Depois o mapa: os seis navios nas aguas do Artico, cada um com
// o seu anel de presenca, e a tira de meses com JUN–OUT pintada de vermelho.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, Icon, PictogramGrid, RangeRing, Stamp, SvgLayer} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import {caLabel} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, slideIn, wipeText} from '../../../lib/tl';
import {gridIn, popSvg, ringIn, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s12');

const SHIPS = [
  {p: caLabel('Beaufort Sea'), rot: 80},
  {p: caLabel('Amundsen Gulf'), rot: 70},
  {p: caLabel('Viscount Melville Sound'), rot: 90},
  {p: caLabel('Lancaster Sound'), rot: 95},
  {p: caLabel('Baffin Bay'), rot: 140},
  {p: caLabel('Davis Strait'), rot: 150},
] as const;
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const SIX = {x: 960, y: 880, n: 6, cols: 6, size: 92, cellW: 112, cellH: 70, gap: 18};

const KEYS: CamKey[] = [
  {t: 159.6, x: 905, y: 318, s: 1.55, r: 0},
  {t: 166.2, x: 912, y: 322, s: 1.68, r: 0, ease: inOutSine},
];

export const P2S12: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s12-dw', L(T('sea') - 0.4), -1500, 0, 0.85);
    gridIn(tl, q, 'p2s12-six', L(T('six') - 0.15), 0.08);
    fadeIn(tl, q, '.p2s12-num', L(T('six') - 0.15), 0.25);
    wipeText(tl, q, '.p2s12-lbl', L(T('harry') - 0.05), 0.45);
    stampIn(tl, q, 'p2s12-oct', L(T('october') - STAMP_HIT));
    wipeText(tl, q, '.p2s12-foc', L(T('full') - 0.1), 0.5);
    SHIPS.forEach((_, i) => popSvg(tl, q, `.p2s12-s${i}`, L(T('operating') - 0.1 + i * 0.1)));
    fadeIn(tl, q, '.p2s12-cal', L(T('between') - 0.3), 0.4);
    SHIPS.forEach((_, i) => ringIn(tl, q, `p2s12-r${i}`, L(T('expanding') - 0.2 + i * 0.07), 0.7));
  });

  // a foto da lugar ao mapa no "They've been operating"
  const aOut = ramp(t, T('theyve') - 0.5, T('theyve') + 0.05, inOutCubic);
  const months = (i: number) => ramp(t, T('june') - 0.15 + (i - 5) * 0.12, T('june') + (i - 5) * 0.12 + 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      {/* ---- o mapa (sempre montado; aparece no "operating") ---- */}
      <AbsoluteFill style={{opacity: aOut}}>
        <MapSvg cam={cam}>
          <Graticule d={CA.graticule} />
          <Neighbours />
          <CanadaFill />
          <CanadaOutline width={1.2} opacity={0.6} />
          <Ships />
        </MapSvg>
        {/* navegacao: so de junho a outubro */}
        <div style={at(960, 975)}>
          <div className="p2s12-cal" style={{display: 'flex', gap: 10, fontFamily: ANTON, fontSize: 34, visibility: 'hidden'}}>
            {MONTHS.map((m, i) => {
              const k = i >= 5 && i <= 9 ? months(i) : 0;
              return (
                <div
                  key={i}
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    color: k > 0.5 ? C.ink : C.inkDim,
                    backgroundColor: k > 0 ? `rgba(227,38,43,${0.15 + 0.85 * k})` : 'rgba(20,20,19,0.8)',
                    border: `2px solid ${k > 0.3 ? C.red : 'rgba(238,233,223,0.25)'}`,
                  }}
                >
                  {m}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>

      {/* ---- o navio, os seis e a data ---- */}
      <AbsoluteFill style={{opacity: 1 - aOut, transform: `translate(${-200 * aOut}px, 0px) rotate(0.03deg)`}}>
        <Sticker cls="p2s12-dw" src="img/dewolf.png" x={760} y={420} w={1080} />
        <div style={at(760, 92)}>
          <div className="p2s12-lbl" style={{fontFamily: ANTON, fontSize: 70, color: C.ink, letterSpacing: '0.06em', marginRight: '-0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
            Harry DeWolf class
          </div>
        </div>
        <SvgLayer>
          <PictogramGrid cls="p2s12-six" {...SIX} icon="ship" state="on" />
        </SvgLayer>
        <Counter cls="p2s12-num" x={SIX.x - 470} y={SIX.y} value={6} digits={1} size={150} />
        <Stamp cls="p2s12-oct" x={1550} y={430} text="Oct 2026" size={80} />
        <MapLabel cls="p2s12-foc" x={1550} y={540} text="Full operational capability" size={32} color={C.ink} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Ships: React.FC = () => {
  const px = usePx();
  return (
    <g>
      {SHIPS.map((s, i) => (
        <g key={i}>
          <RangeRing cls={`p2s12-r${i}`} cx={s.p[0]} cy={s.p[1]} r={30} color={C.ink} width={2.4} dash={[4, 3]} fill={C.ink} fillOpacity={0.1} start={0} />
          <g className={`p2s12-s${i}`}>
            <Icon name="shipTop" x={s.p[0]} y={s.p[1]} size={px(64)} rot={s.rot} color={C.black} fill={C.red} shadow />
          </g>
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('sea') - 0.4, file: 'ship_horn', vol: 0.05, dur: 2.0, fadeIn: 0.2, fadeOut: 0.8}, // (pico do audio da Parte 2 era aqui)
  {at: T('six') - 0.15, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('harry') - 0.1, file: 'marker_swipe', vol: 0.14, dur: 0.6},
  {at: T('october') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('theyve') - 0.5, file: 'whoosh_soft', vol: 0.14, dur: 1.0},
  {at: T('operating') - 0.1, file: 'pop2', vol: 0.12, dur: 0.3},
  {at: T('june') - 0.15, file: 'marker_swipe', vol: 0.14, dur: 0.6},
];
