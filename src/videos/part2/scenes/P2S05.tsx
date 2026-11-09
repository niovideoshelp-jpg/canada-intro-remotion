// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: 2022 audit.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const P2S05: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      P2S05 · 2022 audit
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
