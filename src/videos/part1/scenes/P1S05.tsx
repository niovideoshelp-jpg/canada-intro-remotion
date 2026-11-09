// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: 162,000 km of coast.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const P1S05: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      P1S05 · 162,000 km of coast
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
