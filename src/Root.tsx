import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {DURATION_FRAMES, FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="CanadaIntro" component={Main} durationInFrames={DURATION_FRAMES} fps={FPS} width={W} height={H} />
);
