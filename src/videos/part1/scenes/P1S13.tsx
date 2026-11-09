// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: Espionage and dual-use ships.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const P1S13: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      P1S13 · Espionage and dual-use ships
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
