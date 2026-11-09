// 124.42–137.99  "The first aircraft are due to arrive in Canada in 2028, with initial operational capability expected
// between 2029 and 2030. So those 88 fighters aren't a fleet Canada can call on to defend the Arctic today."
// A grade dos 88 (agora cheia, o plano) fica no alto e a linha do tempo 2026 -> 2031 se desenha embaixo: FIRST TWO
// (Luke AFB) em 2026, IN CANADA em 2028, a faixa 2029–2030 da capacidade operacional inicial. No "aren't" os 88 viram
// contorno tracejado e no "today" o marcador TODAY cai em 2026, longe de tudo isso.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Counter, PictogramGrid, SvgLayer, Timeline} from '../../../components/kit';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {fadeIn} from '../../../lib/tl';
import {gridIn, timelineBand, timelineIn, timelineMark, timelineToday} from '../../../lib/tl2';
import {TS} from '../timing';

const T = TS('s10');

const GRID = {x: 1080, y: 285, n: 88, cols: 11, size: 32, cellW: 38, cellH: 34, gap: 6};

export const P2S10: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    gridIn(tl, q, 'p2s10-g', L(T('first') - 0.3), 0.006);
    fadeIn(tl, q, '.p2s10-num, .p2s10-num-unit', L(T('first') - 0.2), 0.4);
    timelineIn(tl, q, 'p2s10-tl', L(T('first') - 0.1), 0.9);
    timelineMark(tl, q, 'p2s10-tl', 0, L(T('first') + 0.6));
    timelineMark(tl, q, 'p2s10-tl', 1, L(T('2028') - 0.15));
    timelineBand(tl, q, 'p2s10-tl', 0, L(T('2029') - 0.2), 0.8);
    timelineToday(tl, q, 'p2s10-tl', L(T('today') - 0.2));
  });

  // "aren't a fleet ... today": os 88 viram contorno (nao estao disponiveis)
  const gone = (i: number) => t > T('arent') - 0.1 + (i % 11) * 0.03;

  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        <PictogramGrid cls="p2s10-g" {...GRID} icon="jet" state={(i) => (gone(i) ? 'off' : 'on')} />
      </SvgLayer>
      <Counter cls="p2s10-num" x={560} y={270} value={88} digits={2} size={170} unit="Aircraft" unitSize={38} />
      <Timeline
        cls="p2s10-tl"
        x={960}
        y={760}
        w={1500}
        from={2026}
        to={2031}
        today={2026}
        marks={[
          {at: 2026, label: 'First two', sub: 'Luke AFB', side: 'bottom'},
          {at: 2028, label: 'In Canada', side: 'top'},
        ]}
        bands={[{from: 2029, to: 2030, label: '2029–2030', sub: 'Initial operational capability', accent: true}]}
      />
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('first') - 0.1, file: 'pen_scribble', vol: 0.1, dur: 0.9, fadeOut: 0.3},
  {at: T('2028') - 0.15, file: 'pop', vol: 0.14, dur: 0.3},
  {at: T('2029') - 0.2, file: 'marker_swipe', vol: 0.16, dur: 0.6},
  {at: T('arent') - 0.1, file: 'paper_slide2', vol: 0.1, dur: 0.7},
  {at: T('today') - 0.2 + 0.14 - 0.008, file: 'stamp', vol: 0.26, dur: 0.6},
];
