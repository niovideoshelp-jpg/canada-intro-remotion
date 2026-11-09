// 23.42–36.78  "The two countries manage that disagreement through diplomacy, including the 1988 Arctic Cooperation
// Agreement, which preserved each side's legal position. The partnership continues, with each country looking out for
// its own interests."
// O documento real (titulo verdadeiro, sem texto falso) + carimbo 1988; dele descem os dois ramos: cada lado mantem a
// sua posicao. Depois o mapa volta: Alasca + Canada de novo no vermelho da parceria e duas setas, cada pais mirando
// o proprio interesse na passagem.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {CanadaOutline, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {DocCard, Stamp, SvgLayer} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PaintDefs, PaintPath, Seed} from '../../../components/Paint';
import {CA} from '../../../data/maps';
import {CA2, nwpRoute} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, paint, wipeText} from '../../../lib/tl';
import {docIn, stampIn, STAMP_HIT} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s02');

const MAIN = nwpRoute('northern');

// parceria: tinta nasce na fronteira Alasca-Yukon e corre para os dois lados
const PART_SEEDS: Seed[] = (() => {
  const s: Seed[] = [];
  for (let x = 200; x <= 1100; x += 90) {
    for (let y = 80; y <= 700; y += 90) {
      const d = Math.hypot(x - 560, (y - 330) * 0.8);
      s.push({x, y, r: 92, delay: Math.min(d, 600) * 0.0011});
    }
  }
  return s;
})();

const NORTH = {x: 828, y: 292, s: 2.75};
const KEYS: CamKey[] = [
  {t: 23.1, x: NORTH.x - 18, y: NORTH.y + 2, s: NORTH.s * 1.06},
  {t: 32.5, x: NORTH.x - 30, y: NORTH.y + 6, s: NORTH.s * 1.1, ease: inOutSine},
  {t: 33.7, x: 700, y: 330, s: 1.62, ease: inOutCubic}, // "The partnership continues"
  {t: 37.1, x: 712, y: 326, s: 1.7, ease: inOutSine},
];

const Column: React.FC<{cls: string; x: number; title: string; sub: string; red?: boolean}> = ({cls, x, title, sub, red}) => (
  <div style={at(x, 860)}>
    <div className={cls} style={{textAlign: 'center', fontFamily: ANTON, textTransform: 'uppercase', lineHeight: 1.05}}>
      <div style={{fontSize: 54, color: red ? C.red : C.ink, letterSpacing: '0.04em', textShadow: '0 3px 14px rgba(0,0,0,0.6)'}}>{title}</div>
      <div style={{fontSize: 34, color: C.inkSoft, letterSpacing: '0.08em', marginTop: 6}}>{sub}</div>
    </div>
  </div>
);

export const F04: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    docIn(tl, q, 'f04-doc', L(T('diplomacy') - 0.55), -900);
    stampIn(tl, q, 'f04-1988', L(T('1988') - STAMP_HIT));
    // "which preserved each side's legal position": o documento sobe e os dois ramos descem dele
    draw(tl, q, '.f04-br-stem', L(T('preserved') - 0.15), 0.35, 'power2.out');
    draw(tl, q, '.f04-br-arms', L(T('preserved') + 0.15), 0.5, 'power2.inOut');
    wipeText(tl, q, '.f04-col-ca', L(T('each') - 0.05), 0.45);
    wipeText(tl, q, '.f04-col-us', L(T('sides') + 0.15), 0.45);
    // "The partnership continues": o diagrama sai, o mapa volta
    tl.to(q('.f04-diagram'), {autoAlpha: 0, duration: 0.45, ease: 'power1.in'}, L(T('partnership') - 0.35));
    paint(tl, q, 'f04-pt', PART_SEEDS, L(T('partnership') + 0.1), 0.75);
    draw(tl, q, '.f04-stitch', L(T('continues') - 0.1), 0.6, 'power1.inOut');
    // "each country looking out for its own interests"
    draw(tl, q, '.f04-ar-us-c', L(T('looking') - 0.05), 0.55, 'power2.out');
    draw(tl, q, '.f04-ar-us-h', L(T('looking') + 0.45), 0.16, 'none');
    draw(tl, q, '.f04-ar-ca-c', L(T('own') - 0.12), 0.55, 'power2.out');
    draw(tl, q, '.f04-ar-ca-h', L(T('own') + 0.38), 0.16, 'none');
  });

  const docLift = ramp(t, T('preserved') - 0.35, T('preserved') + 0.25, inOutCubic);
  const dim = 0.74 - 0.5 * ramp(t, T('partnership') - 0.35, T('partnership') + 0.4, inOutSine);
  const partSettled = t > T('partnership') + 1.6;

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam} defs={<PaintDefs id="f04-pt" seeds={PART_SEEDS} rough={30} />}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <path d={CA.canada} fill={C.land} />
        {/* vermelho da parceria mais contido na terra: as aguas internas (o interesse do Canada) continuam brilhando */}
        <PaintPath id="f04-pt" d={CA.canada + CA.usa} settled={partSettled} opacity={0.58} />
        <path d={CA2.channels} fill={C.red} fillRule="evenodd" />
        <CanadaOutline width={1.3} opacity={0.75} />
        <MapStrokes />
      </MapSvg>

      {/* o documento vem sobre o mapa escurecido */}
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />

      <div className="f04-diagram" style={{position: 'absolute', inset: 0}}>
        <div style={{position: 'absolute', inset: 0, transform: `translate(0px, ${-120 * docLift}px) scale(${1 - 0.16 * docLift}) rotate(0.03deg)`, transformOrigin: '960px 420px'}}>
          <DocCard cls="f04-doc" x={960} y={430} w={470} title="Arctic Cooperation Agreement" seed={7} />
          <Stamp cls="f04-1988" x={1090} y={640} text="1988" size={78} backing={false} />
        </div>
        <SvgLayer>
          <g fill="none" stroke={C.ink} strokeOpacity={0.85} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path className="f04-br-stem" d="M960 690 L960 742" />
            <path className="f04-br-arms" d="M960 742 L960 742 M960 742 C 900 742, 640 742, 600 790 M960 742 C 1020 742, 1280 742, 1320 790" />
          </g>
        </SvgLayer>
        <Column cls="f04-col-ca" x={600} title="Canada" sub="Internal waters" red />
        <Column cls="f04-col-us" x={1320} title="United States" sub="International strait" />
      </div>
    </AbsoluteFill>
  );
};

const MapStrokes: React.FC = () => {
  const px = usePx();
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={MAIN.d} stroke={C.ink} strokeWidth={px(6)} strokeOpacity={0.9} />
      <path className="f04-stitch" d={CA.alaskaBorder} stroke={C.ink} strokeWidth={px(3.4)} />
      {/* EUA (Alasca) -> entrada oeste da passagem; Canada -> aguas internas */}
      <g strokeWidth={px(4.2)}>
        <HandArrow cls="f04-ar-us" from={[455, 312]} to={[600, 262]} bow={-0.32} color={C.ink} width={px(4.2)} />
        <HandArrow cls="f04-ar-ca" from={[792, 470]} to={[830, 352]} bow={0.3} color={C.ink} width={px(4.2)} />
      </g>
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('diplomacy') - 0.55 - 0.184 + 0.25, file: 'paper_slide', vol: 0.22, dur: 0.8},
  {at: T('1988') - 0.008, file: 'stamp', vol: 0.3, dur: 0.6},
  {at: T('preserved') - 0.2, file: 'pen_scribble', vol: 0.13, dur: 0.9, fadeOut: 0.3},
  {at: T('partnership') - 0.45, file: 'whoosh_soft', vol: 0.2, dur: 1.0},
  {at: T('looking') - 0.1, file: 'marker_swipe', vol: 0.16, dur: 0.6},
];
