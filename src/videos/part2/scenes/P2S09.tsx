// 107.56–124.42  "Canada received its first two F-35s in October 2026 at Luke Air Force Base in Arizona. But by the end of
// that month, the government was still reviewing its plan to buy 88 aircraft. The plan calls for the first eight F-35s to
// be based in the United States for training."
// 1) O F-35 (recorte) ocupa a vaga tracejada que o CF-18 deixou (corte casado com a P2S08); "first two" = dois cacas;
//    carimbo OCT 2026. 2) Mapa: a camera desce do Canada ate o Arizona, pino LUKE AFB, ARIZONA. 3) Grade de 88 cacas
//    em contorno tracejado (plano ainda em revisao) com a lupa passando; contador 88. 4) Os oito primeiros ficam
//    vermelhos e voam para a caixa TRAINING IN THE U.S. sobre o mapa.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {Counter, countAt, gridCellCenter, Icon, IconHtml, PictogramGrid, Stamp, SvgLayer} from '../../../components/kit';
import {MapLabel} from '../../../components/Labels';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Sticker} from '../../../components/Sticker';
import {CA} from '../../../data/maps';
import {caPlace} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {ticks} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn, pop, wipeText} from '../../../lib/tl';
import {gridIn, popSvg, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';
import {JET_SLOT} from './shared';

const T = TS('s09');

const LUKE = caPlace('Luke AFB');
const GRID = {x: 1150, y: 450, n: 88, cols: 11, size: 50, cellW: 58, cellH: 54, gap: 8};
const BOX = {x: 470, y: 880, w: 420, h: 150};
const boxSlot = (i: number): [number, number] => [BOX.x - 135 + (i % 4) * 90, BOX.y - 30 + Math.floor(i / 4) * 62];

const KEYS: CamKey[] = [
  {t: 107.2, x: 900, y: 700, s: 1.05, r: 0},
  {t: 111.7, x: 900, y: 700, s: 1.05, r: 0},
  {t: 113.4, x: 610, y: 1108, s: 2.2, r: 0, ease: inOutCubic}, // desce ate o Arizona
  {t: 124.8, x: 618, y: 1112, s: 2.3, r: 0, ease: inOutSine},
];

export const P2S09: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    [0, 1].forEach((k) => popSvg(tl, q, `.p2s09-two${k}`, L(T('two') - 0.08 + k * 0.12)));
    tl.fromTo(q('.p2s09-f35'), {autoAlpha: 0, scale: 0.94}, {autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power2.out'}, L(T('f') - 0.12));
    tl.to(q('.p2s09-slot'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('f') + 0.1));
    wipeText(tl, q, '.p2s09-f35-l', L(T('35s') - 0.05), 0.4);
    stampIn(tl, q, 'p2s09-oct', L(T('october') - STAMP_HIT + 0.05));
    // 2
    pop(tl, q, '.p2s09-pin', L(T('luke') - 0.05));
    wipeText(tl, q, '.p2s09-pin-l', L(T('luke') + 0.1), 0.5);
    // 3
    tl.to(q('.p2s09-pin, .p2s09-pin-l'), {autoAlpha: 0, duration: 0.4, ease: 'power1.in'}, L(T('government') - 0.2));
    gridIn(tl, q, 'p2s09-g', L(T('reviewing') - 0.25), 0.011);
    fadeIn(tl, q, '.p2s09-mag', L(T('reviewing') - 0.3), 0.3);
    tl.to(q('.p2s09-mag'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('88') + 0.2));
    wipeText(tl, q, '.p2s09-num', L(T('88') - 0.3), 0.3);
    wipeText(tl, q, '.p2s09-num-unit', L(T('aircraft') - 0.1), 0.4);
    // 4
    fadeIn(tl, q, '.p2s09-box', L(T('united') - 0.45), 0.4);
    wipeText(tl, q, '.p2s09-box-l', L(T('training') - 0.15), 0.45);
  });

  // trocas de bloco
  const aOut = ramp(t, T('luke') - 0.7, T('luke') - 0.2, inOutCubic);
  const mapIn = ramp(t, T('luke') - 0.8, T('luke') - 0.2, inOutSine);
  const dim = 0.62 * ramp(t, T('government') - 0.2, T('reviewing') - 0.2, inOutSine);
  const n = countAt(t, T('88') - 0.3, T('88') + 0.35, 0, 88);
  // a lupa passa sobre a grade enquanto "reviewing"
  const mag = ramp(t, T('reviewing') - 0.3, T('88') + 0.3, inOutSine);
  // os oito primeiros: vermelhos no "eight", voam no "based"
  const red8 = t > T('eight') - 0.1;
  const fly = (i: number) => ramp(t, T('based') - 0.7 + i * 0.06, T('based') + 0.45 + i * 0.06, inOutCubic);
  const [px0, py0] = toScreen(LUKE, cam);

  return (
    <AbsoluteFill ref={scope}>
      {/* 2: o mapa */}
      <AbsoluteFill style={{opacity: mapIn}}>
        <MapSvg cam={cam}>
          <Graticule d={CA.graticule} />
          <Neighbours />
          <CanadaFill />
          <CanadaOutline width={1.2} opacity={0.6} />
          <Jets2 luke={LUKE} on={t > T('arizona') - 0.2} />
        </MapSvg>
        <div style={at(px0, py0 - 34)}>
          <div className="p2s09-pin">
            <IconHtml name="pin" x={0} y={0} size={86} color={C.black} fill={C.red} />
          </div>
        </div>
        <MapLabel cls="p2s09-pin-l" x={px0} y={py0 + 52} text="Luke AFB, Arizona" size={46} color={C.ink} />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />

      {/* 1: a vaga e o F-35 */}
      <AbsoluteFill style={{opacity: 1 - aOut, transform: `translate(${-300 * aOut}px, 0px) rotate(0.03deg)`}}>
        <SvgLayer>
          <g className="p2s09-slot">
            <Icon name="jetSide" x={JET_SLOT.x} y={JET_SLOT.y} size={JET_SLOT.w * 0.86} color={C.ink} dashed strokeW={5} />
          </g>
          {[0, 1].map((k) => (
            <g key={k} className={`p2s09-two${k}`}>
              <Icon name="jetSide" x={JET_SLOT.x + 190 + k * 110} y={JET_SLOT.y - 232} size={96} color={C.black} fill={C.red} />
            </g>
          ))}
        </SvgLayer>
        <Sticker cls="p2s09-f35" src="img/f35.png" x={JET_SLOT.x} y={JET_SLOT.y} w={JET_SLOT.w} />
        <MapLabel cls="p2s09-f35-l" x={JET_SLOT.x - 40} y={JET_SLOT.y - 230} text="F-35" size={88} color={C.ink} />
        <Stamp cls="p2s09-oct" x={1480} y={700} text="Oct 2026" size={76} />
      </AbsoluteFill>

      {/* 3 e 4: a grade dos 88 */}
      <SvgLayer>
        <PictogramGrid
          cls="p2s09-g"
          {...GRID}
          icon="jet"
          state={(i) => (i < 8 && red8 ? (fly(i) > 0.02 ? 'off' : 'red') : 'off')}
        />
        <g className="p2s09-box" style={{visibility: 'hidden'}}>
          <rect x={BOX.x - BOX.w / 2} y={BOX.y - BOX.h / 2} width={BOX.w} height={BOX.h} rx={10} fill={C.black} fillOpacity={0.55} stroke={C.ink} strokeWidth={3} strokeDasharray="12 9" />
        </g>
        {Array.from({length: 8}, (_, i) => {
          const f = fly(i);
          if (f <= 0.02) return null;
          const [x0, y0] = gridCellCenter(i, GRID);
          const [x1, y1] = boxSlot(i);
          const x = lerp(x0, x1, f);
          const y = lerp(y0, y1, f) - 120 * Math.sin(Math.PI * f);
          const rot = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
          return <Icon key={i} name="jet" x={x} y={y} size={GRID.size} rot={f < 0.98 ? rot : 0} color={C.black} fill={C.red} />;
        })}
      </SvgLayer>
      <div style={{...at(lerp(760, 1520, mag), GRID.y + 40 * Math.sin(mag * Math.PI * 2))}}>
        <div className="p2s09-mag" style={{visibility: 'hidden'}}>
          <IconHtml name="magnifier" x={0} y={0} size={200} color={C.ink} strokeW={7} />
        </div>
      </div>
      <Counter cls="p2s09-num" x={420} y={400} value={n} digits={2} size={230} unit="Aircraft" unitSize={46} />
      <div style={at(BOX.x, BOX.y - BOX.h / 2 - 44)}>
        <div className="p2s09-box-l" style={{fontFamily: ANTON, fontSize: 42, color: C.ink, letterSpacing: '0.07em', marginRight: '-0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
          Training in the U.S.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Os dois primeiros F-35 estacionados em Luke. */
const Jets2: React.FC<{luke: readonly number[]; on: boolean}> = ({luke, on}) => {
  const px = usePx();
  if (!on) return null;
  return (
    <g>
      {[-1, 1].map((k) => (
        <Icon key={k} name="jet" x={luke[0] + k * px(64) + px(130)} y={luke[1] - px(6)} size={px(58)} rot={-35} color={C.black} fill={C.ink} />
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('two') - 0.08, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('f') - 0.12, file: 'jet_flyby', vol: 0.16, dur: 2.0, fadeOut: 0.8},
  {at: T('october') + 0.05 - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('luke') - 0.8, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('luke') - 0.05, file: 'pop2', vol: 0.16, dur: 0.3},
  ...ticks(T('reviewing') - 0.25, T('reviewing') - 0.25 + 88 * 0.011, 10, 0.05, 'out'),
  {at: T('88') - 0.3, file: 'marker_swipe', vol: 0.14, dur: 0.6},
  {at: T('based') - 0.7, file: 'whoosh_soft2', vol: 0.16, dur: 1.2},
];
