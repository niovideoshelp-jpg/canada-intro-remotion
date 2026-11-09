import React from 'react';
import {Composition} from 'remotion';
import {KitGallery} from './dev/KitGallery';
import {MapsGallery} from './dev/MapsGallery';
import {Main} from './Main';
import {DURATION_FRAMES, FPS, H, W} from './theme';
import {Final} from './videos/final/Main';
import {DURATION_S as FINAL_S} from './videos/final/timing';
import {Part1} from './videos/part1/Main';
import {DURATION_S as PART1_S} from './videos/part1/timing';
import {Part2} from './videos/part2/Main';
import {DURATION_S as PART2_S} from './videos/part2/timing';

const frames = (s: number) => Math.round(s * FPS);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CanadaIntro" component={Main} durationInFrames={DURATION_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="CanadaPart1" component={Part1} durationInFrames={frames(PART1_S)} fps={FPS} width={W} height={H} />
    <Composition id="CanadaPart2" component={Part2} durationInFrames={frames(PART2_S)} fps={FPS} width={W} height={H} />
    <Composition id="CanadaFinal" component={Final} durationInFrames={frames(FINAL_S)} fps={FPS} width={W} height={H} />
    {/* galerias de teste (so para conferencia local; a nuvem nao renderiza) */}
    <Composition id="DevMaps" component={MapsGallery} durationInFrames={900} fps={FPS} width={W} height={H} />
    <Composition id="DevKit" component={KitGallery} durationInFrames={900} fps={FPS} width={W} height={H} />
  </>
);
