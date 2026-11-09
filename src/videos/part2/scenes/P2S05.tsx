// 47.67–66.88  "Getting all these systems to work together is another challenge. A 2022 federal audit found gaps in
// maritime traffic information, problems sharing data between agencies and delays in replacing equipment. The report
// showed that surveillance depended as much on getting information to the people who needed it as it did on the
// sensors themselves."
// 1) Radar, satelites e AIS ligados por linhas de giz a um no central; no "challenge" cada linha QUEBRA no meio.
// 2) O documento da auditoria (carimbo 2022 FEDERAL AUDIT) e a lista dos tres problemas, cada um com um X vermelho.
// 3) Uma balanca: SENSORS de um lado; a informacao viaja ate PEOPLE do outro e a balanca se nivela no "themselves".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../../../components/Bits';
import {Balance, Checklist, DocCard, Icon, IconBadge, Stamp, stepsAt, SvgLayer} from '../../../components/kit';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, lerp, outCubic, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, wipeText} from '../../../lib/tl';
import {balanceIn, checkIn, docIn, dropIn, popIn, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s05');

type P = [number, number];
const SYS = [
  {cls: 'p2s05-rad', icon: 'radarDome', label: 'Radar', y: 300},
  {cls: 'p2s05-sat', icon: 'satellite', label: 'Satellites', y: 540},
  {cls: 'p2s05-ais', icon: 'shipTop', label: 'AIS', y: 780},
] as const;
const SX = 420;
const NODE: P = [1220, 540];
const lineAt = (y: number, f: number): P => [lerp(SX + 92, NODE[0] - 100, f), lerp(y, NODE[1], f)];
const CUT = [0.44, 0.56];

const BAL = {x: 960, y: 470, w: 900};

export const P2S05: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // 1
    SYS.forEach((s, k) => popIn(tl, q, s.cls, L(T('all') - 0.15 + k * 0.16)));
    SYS.forEach((_, k) => {
      const a = L(T('work') - 0.25 + k * 0.1);
      draw(tl, q, `.p2s05-l${k}a`, a, 0.32, 'none');
      draw(tl, q, `.p2s05-l${k}m`, a + 0.32, 0.09, 'none');
      draw(tl, q, `.p2s05-l${k}b`, a + 0.41, 0.32, 'power2.out');
    });
    popIn(tl, q, 'p2s05-node', L(T('together') - 0.05));
    SYS.forEach((_, k) => {
      tl.to(q(`.p2s05-l${k}m`), {autoAlpha: 0, duration: 0.18, ease: 'power1.in'}, L(T('challenge') - 0.2 + k * 0.07));
      tl.fromTo(q(`.p2s05-x${k}`), {autoAlpha: 0, scale: 0.4, transformOrigin: '50% 50%'}, {autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)'}, L(T('challenge') - 0.15 + k * 0.07));
    });
    // 2
    docIn(tl, q, 'p2s05-doc', L(T('2022') - 0.6), -900);
    stampIn(tl, q, 'p2s05-st', L(T('federal') - STAMP_HIT));
    checkIn(tl, q, 'p2s05-ck', 0, L(T('gaps') - 0.1));
    checkIn(tl, q, 'p2s05-ck', 1, L(T('sharing') - 0.1));
    checkIn(tl, q, 'p2s05-ck', 2, L(T('delays') - 0.1));
    // 3
    balanceIn(tl, q, 'p2s05-bal', L(T('report') - 0.15));
    dropIn(tl, q, '.p2s05-sen', L(T('surveillance') - 0.2));
    draw(tl, q, '.p2s05-info-c', L(T('getting', 2) - 0.1), 0.55, 'power2.out');
    draw(tl, q, '.p2s05-info-h', L(T('getting', 2) + 0.42), 0.14, 'none');
    [0, 1, 2].forEach((k) => dropIn(tl, q, `.p2s05-pp${k}`, L(T('people') - 0.25 + k * 0.1)));
    wipeText(tl, q, '.p2s05-eq', L(T('themselves') - 0.05), 0.35);
  });

  // trocas de bloco
  const aOut = ramp(t, T('a') - 0.35, T('2022') - 0.5, inOutCubic);
  const bOut = ramp(t, T('report') - 0.5, T('report') - 0.1, inOutCubic);
  // balanca: so os sensores -> pesa a esquerda; as pessoas chegam -> nivela no "themselves"
  const tilt = stepsAt(
    t,
    -13,
    [
      {at: T('people') + 0.2, to: -4},
      {at: T('sensors') - 0.1, to: -6},
      {at: T('themselves') - 0.1, to: 0},
    ],
    0.6,
    outCubic,
  );

  return (
    <AbsoluteFill ref={scope}>
      {/* ---------------- 1 ---------------- */}
      {aOut < 1 ? (
        <AbsoluteFill style={{opacity: 1 - aOut, transform: `translate(${-260 * aOut}px, 0px) rotate(0.03deg)`}}>
          <SvgLayer>
            {SYS.map((s, k) => {
              const p0 = lineAt(s.y, 0);
              const pa = lineAt(s.y, CUT[0]);
              const pb = lineAt(s.y, CUT[1]);
              const p1 = lineAt(s.y, 1);
              const ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
              const nx = -Math.sin(ang) * 20;
              const ny = Math.cos(ang) * 20;
              return (
                <g key={k} fill="none" stroke={C.ink} strokeWidth={4} strokeLinecap="round">
                  <path className={`p2s05-l${k}a`} d={`M${p0[0]} ${p0[1]} L${pa[0]} ${pa[1]}`} />
                  <path className={`p2s05-l${k}m`} d={`M${pa[0]} ${pa[1]} L${pb[0]} ${pb[1]}`} />
                  <path className={`p2s05-l${k}b`} d={`M${pb[0]} ${pb[1]} L${p1[0]} ${p1[1]}`} />
                  {/* as pontas quebradas */}
                  <g className={`p2s05-x${k}`} stroke={C.red} strokeWidth={5}>
                    <path d={`M${pa[0] - nx} ${pa[1] - ny} L${pa[0] + nx} ${pa[1] + ny}`} />
                    <path d={`M${pb[0] - nx} ${pb[1] - ny} L${pb[0] + nx} ${pb[1] + ny}`} />
                  </g>
                </g>
              );
            })}
          </SvgLayer>
          {SYS.map((s) => (
            <IconBadge key={s.cls} cls={s.cls} x={SX} y={s.y} icon={s.icon} size={150} label={s.label} labelSize={34} />
          ))}
          <IconBadge cls="p2s05-node" x={NODE[0]} y={NODE[1]} icon="cyber" size={190} ring="red" iconColor={C.ink} />
        </AbsoluteFill>
      ) : null}

      {/* ---------------- 2 ---------------- */}
      {/* blocos 2 e 3 ficam sempre montados (o GSAP so anima o que existe quando a cena monta) */}
      <AbsoluteFill style={{opacity: aOut > 0 ? 1 - bOut : 0, transform: `translate(0px, ${-120 * bOut}px) rotate(0.03deg)`}}>
          <DocCard cls="p2s05-doc" x={560} y={560} w={480} rot={-3} lines={11} seed={7} />
          <Stamp cls="p2s05-st" x={560} y={330} text="2022 Federal Audit" size={58} />
          <Checklist cls="p2s05-ck" x={930} y={560} items={['Gaps in traffic data', 'Data sharing', 'Equipment delays']} marks={['cross', 'cross', 'cross']} size={58} />
      </AbsoluteFill>

      {/* ---------------- 3 ---------------- */}
      <AbsoluteFill style={{opacity: bOut > 0 ? 1 : 0}}>
          <SvgLayer>
            <Balance
              cls="p2s05-bal"
              x={BAL.x}
              y={BAL.y}
              w={BAL.w}
              tilt={tilt}
              leftLabel="Sensors"
              rightLabel="People"
              rightAccent
              labelSize={44}
              left={
                <g className="p2s05-sen">
                  <Icon name="radarDome" x={-48} y={-40} size={84} color={C.black} fill={C.ink} />
                  <Icon name="satellite" x={52} y={-44} size={78} color={C.black} fill={C.ink} />
                </g>
              }
              right={
                <g>
                  {[-62, 0, 62].map((dx, k) => (
                    <g key={k} className={`p2s05-pp${k}`}>
                      <Icon name="person" x={dx} y={-40} size={80} color={C.black} fill={C.ink} />
                    </g>
                  ))}
                </g>
              }
            />
            {/* a informacao vai dos sensores ate as pessoas */}
            <HandArrow cls="p2s05-info" from={[BAL.x - BAL.w / 2 + 40, 250]} to={[BAL.x + BAL.w / 2 - 40, 250]} bow={-0.16} color={C.red} width={6} />
          </SvgLayer>
          <div style={at(BAL.x, 985)}>
            <div className="p2s05-eq" style={{fontFamily: ANTON, fontSize: 64, color: C.ink, letterSpacing: '0.08em', marginRight: '-0.08em', textTransform: 'uppercase', textShadow: `0 3px 14px ${C.shadow}`}}>
              As much as
            </div>
          </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  ...SYS.map((_, k) => ({at: T('all') - 0.15 + k * 0.16, file: k % 2 ? 'pop2' : 'pop', vol: 0.14, dur: 0.3})),
  {at: T('work') - 0.25, file: 'pen_scribble', vol: 0.1, dur: 0.9, fadeOut: 0.3},
  {at: T('challenge') - 0.2, file: 'ice_crack', vol: 0.14, dur: 1.0, fadeOut: 0.4},
  {at: T('2022') - 0.6 + 0.25, file: 'paper_slide', vol: 0.18, dur: 0.8},
  {at: T('federal') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('gaps') + 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('sharing') + 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('delays') + 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('surveillance') - 0.2 + 0.42 - 0.008, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('getting', 2) - 0.1, file: 'whoosh_soft', vol: 0.12, dur: 1.0},
  {at: T('people') - 0.25 + 0.42 - 0.008, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('themselves') - 0.1 + 0.5, file: 'tick', vol: 0.1, dur: 0.3},
];
