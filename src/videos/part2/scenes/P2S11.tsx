// 137.99–151.64  "And the transition has other problems. A 2025 audit found delays in facilities and shortages of
// qualified pilots and engineering personnel. When the aircraft arrive, they need trained people and bases that can
// keep them flying."
// O F-35 (recorte) a direita ganha um alerta vermelho; carimbo 2025 AUDIT. A esquerda, tres linhas do que falta:
// instalacoes (hangar + relogio = atraso), pilotos e pessoal de engenharia (bonecos e chaves com vagas vazias em
// vermelho tracejado, sem numeros). No "arrive" o F-35 pousa numa pista e cada linha se liga a ele com giz; as vagas
// vazias continuam visiveis.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconBadge, PictogramGrid, Stamp, SvgLayer} from '../../../components/kit';
import {Sticker} from '../../../components/Sticker';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, lerp, ramp} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, slideIn, wipeText} from '../../../lib/tl';
import {gridIn, popIn, STAMP_HIT, stampIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

const T = TS('s11');

const ROWS_X = 470; // inicio das fileiras de bonecos
const PILOTS = {x: ROWS_X + 300, y: 640, n: 8, cols: 8, size: 64, cellW: 64, cellH: 76, gap: 14};
const ENG = {x: ROWS_X + 300, y: 850, n: 8, cols: 8, size: 64, cellW: 64, cellH: 76, gap: 14};
const RUNWAY = {x: 1460, y: 860, w: 700};
const JET_A = {x: 1420, y: 400, w: 760};
const JET_B = {x: 1470, y: 760, w: 600};

export const P2S11: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.p2s11-jet', L(137.78), 1200, 0, 0.8); // ja na cortina
    popIn(tl, q, 'p2s11-warn', L(T('problems') - 0.12));
    stampIn(tl, q, 'p2s11-audit', L(T('audit') - STAMP_HIT));
    popIn(tl, q, 'p2s11-clock', L(T('delays') - 0.1));
    popIn(tl, q, 'p2s11-hangar', L(T('facilities') - 0.1));
    wipeText(tl, q, '.p2s11-l0', L(T('facilities') + 0.1), 0.4);
    gridIn(tl, q, 'p2s11-pil', L(T('pilots') - 0.35), 0.05);
    wipeText(tl, q, '.p2s11-l1', L(T('pilots') - 0.1), 0.4);
    gridIn(tl, q, 'p2s11-eng', L(T('engineering') - 0.2), 0.05);
    wipeText(tl, q, '.p2s11-l2', L(T('engineering') + 0.05), 0.4);
    draw(tl, q, '.p2s11-rw', L(T('aircraft') - 0.3), 0.7, 'power2.out');
    tl.to(q('.p2s11-warn'), {autoAlpha: 0, duration: 0.3, ease: 'power1.in'}, L(T('aircraft') - 0.3));
    draw(tl, q, '.p2s11-cn1', L(T('trained') - 0.15), 0.55, 'power2.out');
    draw(tl, q, '.p2s11-cn2', L(T('people') - 0.05), 0.55, 'power2.out');
    draw(tl, q, '.p2s11-cn0', L(T('bases') - 0.1), 0.55, 'power2.out');
  });

  // "arrive": o F-35 desce e pousa na pista
  const land = ramp(t, T('aircraft') - 0.2, T('arrive') + 0.6, inOutCubic);
  const jx = lerp(JET_A.x, JET_B.x, land);
  const jy = lerp(JET_A.y, JET_B.y, land);
  const js = lerp(1, JET_B.w / JET_A.w, land);

  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        {/* pista */}
        <g className="p2s11-rw" fill="none" stroke={C.ink} strokeLinecap="round">
          <path d={`M${RUNWAY.x - RUNWAY.w / 2} ${RUNWAY.y} L${RUNWAY.x + RUNWAY.w / 2} ${RUNWAY.y}`} strokeWidth={5} />
        </g>
        <path d={`M${RUNWAY.x - RUNWAY.w / 2 + 40} ${RUNWAY.y + 26} L${RUNWAY.x + RUNWAY.w / 2 - 40} ${RUNWAY.y + 26}`} className="p2s11-rw" stroke={C.ink} strokeOpacity={0.6} strokeWidth={4} fill="none" />
        {/* ligacoes: cada necessidade ate o aviao */}
        <path className="p2s11-cn0" d={`M${390} ${400} C ${800} ${400}, ${1080} ${520}, ${RUNWAY.x - 300} ${RUNWAY.y - 40}`} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
        <path className="p2s11-cn1" d={`M${PILOTS.x + 300} ${PILOTS.y} C ${1120} ${PILOTS.y}, ${1130} ${RUNWAY.y - 30}, ${RUNWAY.x - 300} ${RUNWAY.y - 20}`} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
        <path className="p2s11-cn2" d={`M${ENG.x + 300} ${ENG.y} C ${1100} ${ENG.y}, ${1100} ${RUNWAY.y}, ${RUNWAY.x - 300} ${RUNWAY.y - 4}`} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />
        {/* pilotos e engenharia: vagas vazias em vermelho tracejado */}
        <PictogramGrid cls="p2s11-pil" {...PILOTS} icon="person" state={(i) => (i < 5 ? 'on' : 'empty')} />
        <PictogramGrid cls="p2s11-eng" {...ENG} icon="wrench" state={(i) => (i < 4 ? 'on' : 'empty')} />
      </SvgLayer>

      {/* instalacoes: hangar + relogio (atraso) */}
      <IconBadge cls="p2s11-hangar" x={300} y={400} icon="hangar" size={170} />
      <IconBadge cls="p2s11-clock" x={385} y={322} icon="clock" size={92} ring="red" iconColor={C.red} />
      <RowLabel cls="p2s11-l0" x={300} y={530} text="Facilities" />
      <RowLabel cls="p2s11-l1" x={ROWS_X - 160} y={PILOTS.y} text="Pilots" />
      <RowLabel cls="p2s11-l2" x={ROWS_X - 160} y={ENG.y} text="Engineering" />

      {/* o F-35 */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${JET_A.x}px ${JET_A.y}px`, transform: `translate(${jx - JET_A.x}px, ${jy - JET_A.y}px) scale(${js}) rotate(0.03deg)`}}>
        <Sticker cls="p2s11-jet" src="img/f35.png" x={JET_A.x} y={JET_A.y} w={JET_A.w} />
      </div>
      <IconBadge cls="p2s11-warn" x={1110} y={250} icon="warning" size={130} ring="red" iconColor={C.red} />
      <Stamp cls="p2s11-audit" x={960} y={140} text="2025 Audit" size={80} />
    </AbsoluteFill>
  );
};

const RowLabel: React.FC<{cls: string; x: number; y: number; text: string}> = ({cls, x, y, text}) => (
  <div style={at(x, y)}>
    <div className={cls} style={{fontFamily: ANTON, fontSize: 44, color: C.ink, letterSpacing: '0.07em', marginRight: '-0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', textShadow: `0 3px 14px ${C.shadow}`}}>
      {text}
    </div>
  </div>
);

export const cues: Cue[] = [
  {at: 137.78, file: 'whoosh_soft', vol: 0.14, dur: 1.0},
  {at: T('problems') - 0.12, file: 'pop2', vol: 0.16, dur: 0.3},
  {at: T('audit') - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
  {at: T('delays') - 0.1, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('facilities') - 0.1, file: 'pop2', vol: 0.14, dur: 0.3},
  {at: T('pilots') - 0.35, file: 'tick', vol: 0.08, dur: 0.3},
  {at: T('engineering') - 0.2, file: 'tick', vol: 0.08, dur: 0.3},
  {at: T('aircraft') - 0.2, file: 'jet_flyby', vol: 0.14, dur: 2.0, fadeOut: 0.8},
  {at: T('trained') - 0.15, file: 'pen_scribble', vol: 0.1, dur: 1.4, fadeOut: 0.4},
];
