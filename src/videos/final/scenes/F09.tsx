// 81.87–89.47  "The distances involved, equipment availability, and shortages in personnel and infrastructure all weigh
// heavily in that assessment."
// A balanca da avaliacao: de um lado o que o Canada tem; do outro caem, uma por palavra, as quatro cargas. O travessao
// afunda a cada uma e assenta pesado em "weigh heavily".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Balance, Icon, SvgLayer, SvgText, stepsAt} from '../../../components/kit';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {outCubic} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {balanceIn, dropIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s07');

const WEIGHTS = [
  {cls: 'f09-w0', text: 'Distances', at: () => T('distances') - 0.42},
  {cls: 'f09-w1', text: 'Equipment', at: () => T('equipment') - 0.42},
  {cls: 'f09-w2', text: 'Personnel', at: () => T('personnel') - 0.42},
  {cls: 'f09-w3', text: 'Infrastructure', at: () => T('infrastructure') - 0.2},
];
const BW = 300;
const BH = 64;

const Weight: React.FC<{cls: string; text: string; y: number}> = ({cls, text, y}) => (
  <g className={cls}>
    <rect x={-BW / 2} y={y - BH} width={BW} height={BH} rx={6} fill="#151514" stroke={C.ink} strokeWidth={3} />
    <SvgText x={0} y={y - BH / 2} text={text} size={38} color={C.ink} anchor="middle" spacing={0.06} />
  </g>
);

export const F09: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    balanceIn(tl, q, 'f09-bal', L(81.95));
    WEIGHTS.forEach((w) => dropIn(tl, q, `.${w.cls}`, L(w.at()), 260, 0.42));
  });

  const tilt = stepsAt(
    t,
    -4,
    [
      ...WEIGHTS.map((w, i) => ({at: w.at() + 0.42, to: 2 + i * 4.2})),
      {at: T('weigh') - 0.05, to: 19},
    ],
    0.55,
    outCubic,
  );

  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        <Balance
          cls="f09-bal"
          x={960}
          y={420}
          w={960}
          tilt={tilt}
          post={470}
          hang={170}
          pan={340}
          labelSize={48}
          leftLabel="Canada"
          leftAccent
          left={
            <g>
              <Icon name="icebreaker" x={-80} y={-34} size={64} color={C.red} />
              <Icon name="jet" x={0} y={-34} size={64} color={C.red} />
              <Icon name="radarDome" x={80} y={-34} size={64} color={C.red} />
            </g>
          }
          right={
            <g>
              {WEIGHTS.map((w, i) => (
                <Weight key={w.cls} cls={w.cls} text={w.text} y={-4 - i * (BH + 6)} />
              ))}
            </g>
          }
        />
      </SvgLayer>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = WEIGHTS.map((w, i) => ({at: w.at() + 0.42 - 0.008, file: 'pop2', vol: 0.2 + i * 0.03, dur: 0.3}));
