// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: Independence is leverage.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const F05: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      F05 · Independence is leverage
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
