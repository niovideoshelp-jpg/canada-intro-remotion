// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: Depends on the threat.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const F07: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      F07 · Depends on the threat
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
