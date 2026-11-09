import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {wipeEdge} from '../lib/scene';
import {WIPE_HALF, sec} from '../lib/time';
import {C, H, W} from '../theme';

/** A borda vermelha da cortina de transicao (mesma linguagem do marcador vermelho). `cuts` em segundos. */
export const WipeEdges: React.FC<{cuts: readonly number[]}> = ({cuts}) => {
  const g = useCurrentFrame();
  const active = cuts.map(sec).find((c) => g >= c - WIPE_HALF && g < c + WIPE_HALF);
  if (active === undefined) return null;
  const e = wipeEdge(g, active);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={e.top + 9} y1={-10} x2={e.bottom + 9} y2={H + 10} stroke="rgba(0,0,0,0.35)" strokeWidth={14} />
        <line x1={e.top} y1={-10} x2={e.bottom} y2={H + 10} stroke={C.red} strokeWidth={10} />
      </svg>
    </AbsoluteFill>
  );
};
