// 101.97–112.98  "A warming Arctic adds another concern. Access to the region is changing. But those changes aren't
// happening evenly. Less ice doesn't mean every route will be open and safe all year."
// Globo polar com o gelo marinho (forma procedural, mascarada so no oceano). O gelo recua DESIGUAL: abre do lado russo,
// continua apertado no arquipelago canadense. As rotas se desenham; na Passagem do Noroeste os gargalos levam um X e a
// tira de meses mostra que ela so abre num pedaco do ano.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DashedDraw} from '../../../components/Bits';
import {Icon, trackHead, trackPoly} from '../../../components/kit';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {POLAR} from '../../../data/maps';
import {POLAR2} from '../../../data/maps2';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw} from '../../../lib/tl';
import {popSvg} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s08');

const POLE = POLAR.pole;
const R0 = 255; // extensao "de inverno" (px de mapa)
// gelo: raio por angulo; no verao recua muito do lado russo (topo, y < polo) e pouco do lado canadense (baixo)
const icePath = (shrink: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const a = (i / 180) * Math.PI * 2;
    const canadaSide = 0.5 + 0.5 * Math.sin(a); // 1 = para baixo (Canada), 0 = para cima (Russia)
    const summer = R0 * (0.34 + 0.46 * Math.pow(canadaSide, 1.4));
    const wobble = 1 + 0.045 * Math.sin(7 * a + 0.6) + 0.03 * Math.sin(11 * a + 2.1) + 0.02 * Math.sin(17 * a);
    const r = lerp(R0, summer, shrink) * wobble;
    pts.push(`${i ? 'L' : 'M'}${(POLE[0] + r * Math.cos(a)).toFixed(1)},${(POLE[1] + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join('') + 'Z';
};

const NWP = POLAR2.seaRoutes.nwp;
const NWP_POLY = trackPoly(NWP.pts);
const CHOKES = [0.32, 0.5, 0.66].map((f) => trackHead(NWP_POLY, f).p);
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const KEYS: CamKey[] = [
  {t: 101.7, x: 955, y: 560, s: 1.32, r: -6},
  {t: 108.3, x: 950, y: 575, s: 1.4, r: -7, ease: inOutSine},
  {t: 113.3, x: 945, y: 600, s: 1.62, r: -8, ease: inOutCubic}, // aproxima da Passagem do Noroeste
];

export const P1S09: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    draw(tl, q, '.p1s09-nsr-rev', L(T('access') - 0.1), 1.2, 'power1.inOut');
    draw(tl, q, '.p1s09-tp-rev', L(T('access') + 0.25), 1.2, 'power1.inOut');
    draw(tl, q, '.p1s09-nwp-rev', L(T('changing') - 0.3), 1.2, 'power1.inOut');
    CHOKES.forEach((_, i) => popSvg(tl, q, `.p1s09-x${i}`, L(T('every') - 0.2 + i * 0.18), 0, 0.36));
    tl.fromTo(q('.p1s09-cal'), {autoAlpha: 0, y: 20}, {autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out'}, L(T('less') - 0.1));
  });

  const shrink = ramp(t, T('access') - 0.2, T('evenly') - 0.1, inOutSine);
  const calHi = ramp(t, T('route') - 0.2, T('open') + 0.1, inOutSine);

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <mask id="p1s09-ocean" maskUnits="userSpaceOnUse" x={-200} y={-500} width={2400} height={2100}>
            <path d={POLAR.sphere} fill="#fff" />
            {POLAR.countries.map((c) => (
              <path key={c.id + c.name} d={c.d} fill="#000" />
            ))}
          </mask>
        }
      >
        <PolarBase />
        <path d={icePath(shrink)} fill="#E9EEF1" fillOpacity={0.82} mask="url(#p1s09-ocean)" />
        <path d={icePath(shrink)} fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={2} mask="url(#p1s09-ocean)" />
        <Routes />
      </MapSvg>
      {/* a temporada: so um pedaco do ano */}
      <div style={at(960, 975)}>
        <div className="p1s09-cal" style={{display: 'flex', gap: 10, fontFamily: ANTON, fontSize: 34, textShadow: '0 2px 8px rgba(0,0,0,0.6)', backgroundColor: 'rgba(14,14,13,0.92)', padding: '12px 16px', borderRadius: 8}}>
          {MONTHS.map((m, i) => {
            const open = i === 7 || i === 8;
            return (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  color: open ? C.ink : C.inkDim,
                  backgroundColor: open ? `rgba(227,38,43,${0.25 + 0.75 * calHi})` : 'rgba(20,20,19,0.75)',
                  border: `2px solid ${open ? C.red : 'rgba(238,233,223,0.25)'}`,
                }}
              >
                {m}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Routes: React.FC = () => {
  const px = usePx();
  const r = POLAR2.seaRoutes;
  return (
    <g fill="none" strokeLinecap="round">
      <DashedDraw id="p1s09-nsr" d={r.nsr.d} color={C.ink} width={2.6} dash={[px(10), px(7)]} />
      <DashedDraw id="p1s09-tp" d={r.transpolar.d} color={C.ink} opacity={0.7} width={2.2} dash={[px(10), px(7)]} />
      <DashedDraw id="p1s09-nwp" d={r.nwp.d} color={C.red} width={3} dash={[px(10), px(7)]} />
      {CHOKES.map(([x, y], i) => (
        <g key={i} className={`p1s09-x${i}`}>
          <circle cx={x} cy={y} r={px(24)} fill={C.black} stroke={C.ink} strokeWidth={px(2)} />
          <Icon name="cross" x={x} y={y} size={px(34)} color={C.red} strokeW={6} />
        </g>
      ))}
    </g>
  );
};

export const cues: Cue[] = [
  {at: T('warming') - 0.2, file: 'wind_arctic', vol: 0.14, dur: 10.8, fadeIn: 1.0, fadeOut: 1.4},
  {at: T('access') - 0.3, file: 'ice_crack', vol: 0.18, dur: 1.4, fadeOut: 0.4},
  {at: T('access') - 0.1, file: 'pen_scribble', vol: 0.12, dur: 1.15, fadeOut: 0.3},
  {at: T('every') - 0.25, file: 'marker_swipe', vol: 0.16, dur: 0.6},
];
