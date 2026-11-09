// 112.98–125.20  "Researchers Ryan Dean and P. Whitney Lackenbauer stress how much geography matters when assessing
// threats. Applying the same assumptions to the Canadian Arctic that you'd use for Northern Europe can lead you to the
// wrong conclusions."
// Os nomes sobre o globo escurecido; no "geography" o mapa acorda e a camera vai do arquipelago canadense (ilhas presas
// no gelo) ao norte da Europa (que clareia; mar aberto) — e termina com os dois lados e um "≠".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NotEqual} from '../../../components/Bits';
import {MapLabel} from '../../../components/Labels';
import {MapSvg} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR} from '../../../data/maps';
import {polarPoint} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {riseLine, wipeText} from '../../../lib/tl';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s09');

// gelo de verao: mais apertado do lado canadense (mesma logica da cena anterior)
const POLE = POLAR.pole;
const ICE = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    const canadaSide = 0.5 + 0.5 * Math.sin(a);
    const r = 255 * (0.34 + 0.46 * Math.pow(canadaSide, 1.4)) * (1 + 0.045 * Math.sin(7 * a + 0.6) + 0.03 * Math.sin(11 * a + 2.1));
    pts.push(`${i ? 'L' : 'M'}${(POLE[0] + r * Math.cos(a)).toFixed(1)},${(POLE[1] + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join('') + 'Z';
})();
// o norte da Europa (Noruega, Suecia, Finlandia) clareia quando e citado
const NORDIC = [POLAR.ids.norway, '752', '246'];
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

const CAN = polarPoint('Canadian Arctic');
const EUR = polarPoint('Northern Europe');
const MID: [number, number] = [(CAN[0] + EUR[0]) / 2, (CAN[1] + EUR[1]) / 2];

const KEYS: CamKey[] = [
  {t: 112.7, x: 960, y: 560, s: 1.2, r: -4},
  {t: 116.5, x: 960, y: 560, s: 1.24, r: -4, ease: inOutSine},
  {t: 121.6, x: CAN[0], y: CAN[1] - 30, s: 2.3, r: -10, ease: inOutCubic}, // "the Canadian Arctic"
  {t: 123.0, x: EUR[0] - 20, y: EUR[1] + 20, s: 2.3, r: 4, ease: inOutCubic}, // "Northern Europe"
  {t: 124.2, x: MID[0], y: MID[1] - 10, s: 1.45, r: -3, ease: inOutCubic}, // os dois lados
];

export const P1S10: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.p1s10-kick', L(T('researchers') - 0.1), 0.4);
    riseLine(tl, q, '.p1s10-n1', L(T('ryan') - 0.08), 0.5);
    riseLine(tl, q, '.p1s10-n2', L(T('whitney') - 0.1), 0.5);
    wipeText(tl, q, '.p1s10-l-can', L(T('canadian') + 0.05), 0.4);
    wipeText(tl, q, '.p1s10-l-eur', L(T('europe') - 0.05), 0.4);
    tl.fromTo(q('.p1s10-ne'), {autoAlpha: 0, scale: 1.6}, {autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out'}, L(T('wrong') - 0.1));
  });

  const dim = 0.6 * (1 - ramp(t, T('geography') - 0.2, T('geography') + 0.5, inOutSine));
  const lift = ramp(t, T('geography') - 0.2, T('geography') + 0.5, inOutCubic);
  const nordic = mix('#3B3A37', '#8E8981', ramp(t, T('northern') - 0.3, T('europe') + 0.3, inOutSine));
  const [cx, cy] = toScreen(CAN, cam);
  const [ex, ey] = toScreen(EUR, cam);
  const [mx, my] = toScreen(MID, cam);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <mask id="p1s10-ocean" maskUnits="userSpaceOnUse" x={-200} y={-500} width={2400} height={2100}>
            <path d={POLAR.sphere} fill="#fff" />
            {POLAR.countries.map((c) => (
              <path key={c.id + c.name} d={c.d} fill="#000" />
            ))}
          </mask>
        }
      >
        <PolarBase highlight={NORDIC.reduce((o, id) => ({...o, [id]: nordic}), {} as Record<string, string>)} />
        <path d={ICE} fill="#E9EEF1" fillOpacity={0.78} mask="url(#p1s10-ocean)" />
      </MapSvg>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />

      <MapLabel cls="p1s10-l-can" x={cx} y={cy + 150} text="Canadian Arctic" size={48} color={C.ink} />
      <MapLabel cls="p1s10-l-eur" x={ex} y={ey - 130} text="Northern Europe" size={48} color={C.ink} />
      <NotEqual cls="p1s10-ne" x={mx} y={my} />

      {/* os nomes: centrados; no "geography" sobem e saem para dar o palco ao mapa */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 440px', transform: `translate(0px, ${lerp(0, -150, lift)}px) scale(${lerp(1, 0.9, lift)}) rotate(0.03deg)`, opacity: 1 - lift}}>
        <div style={at(960, 330)}>
          <div className="p1s10-kick" style={{fontFamily: ANTON, fontSize: 36, color: C.inkSoft, letterSpacing: '0.3em', textTransform: 'uppercase'}}>
            Researchers
          </div>
        </div>
        {[
          {cls: 'p1s10-n1', y: 440, text: 'Ryan Dean'},
          {cls: 'p1s10-n2', y: 560, text: 'P. Whitney Lackenbauer'},
        ].map((n) => (
          <div key={n.cls} style={{position: 'absolute', left: 0, right: 0, top: n.y - 60, display: 'flex', justifyContent: 'center'}}>
            <div style={{overflow: 'hidden', padding: '0 20px 8px'}}>
              <div className={n.cls} style={{fontFamily: ANTON, fontSize: 104, color: C.ink, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.05, textShadow: '0 4px 24px rgba(0,0,0,0.55)'}}>
                {n.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};


export const cues: Cue[] = [
  {at: T('ryan') - 0.12, file: 'paper_slide2', vol: 0.14, dur: 0.7},
  {at: T('geography') - 0.3, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('canadian') - 0.5, file: 'whoosh_soft2', vol: 0.16, dur: 1.0},
  {at: T('northern') - 0.4, file: 'whoosh_soft', vol: 0.16, dur: 1.0},
  {at: T('wrong') - 0.1, file: 'stamp', vol: 0.2, dur: 0.6},
];
