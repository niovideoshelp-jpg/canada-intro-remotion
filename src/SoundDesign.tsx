// Efeitos sonoros (Freesound, licenca CC0 — ver assets-src/credits/sfx-*.json).
// Regra: um efeito por acontecimento forte, nunca um por corte. Volumes baixos sob a narracao.
import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, staticFile} from 'remotion';
import {FPS} from './theme';
import {SFX_CUES} from './sfx';

export const SoundDesign: React.FC = () => (
  <>
    {SFX_CUES.map((c, i) => (
      <Sequence key={i} from={Math.round(c.at * FPS)} durationInFrames={Math.round((c.dur ?? 6) * FPS)} name={`sfx ${c.file}`} layout="none">
        <Audio
          src={staticFile(`sfx/${c.file}.wav`)}
          volume={(f) => {
            const tSec = f / FPS;
            const fadeIn = c.fadeIn ? Math.min(1, tSec / c.fadeIn) : 1;
            const len = c.dur ?? 6;
            const fadeOut = c.fadeOut ? Math.min(1, Math.max(0, (len - tSec) / c.fadeOut)) : 1;
            return c.vol * fadeIn * fadeOut;
          }}
        />
      </Sequence>
    ))}
  </>
);
