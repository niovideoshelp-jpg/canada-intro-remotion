// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: Victoria class.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const P2S16: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      P2S16 · Victoria class
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
