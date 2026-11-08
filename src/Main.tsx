import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Backdrop, ScreenFX} from './components/Backdrop';
import {WipeEdges} from './components/WipeEdges';
import './fonts';
import {Scene} from './lib/scene';
import {S01Canada} from './scenes/S01Canada';
import {S02Second} from './scenes/S02Second';
import {S03Arctic} from './scenes/S03Arctic';
import {S04Population} from './scenes/S04Population';
import {S05Cold} from './scenes/S05Cold';
import {S06Squeeze} from './scenes/S06Squeeze';
import {S07Untouched} from './scenes/S07Untouched';
import {S08Complicated} from './scenes/S08Complicated';
import {S09Military} from './scenes/S09Military';
import {S10Population} from './scenes/S10Population';
import {S11Question} from './scenes/S11Question';
import {SoundDesign} from './SoundDesign';
import {SCENES} from './timing';

export const Main: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
    <Scene range={SCENES.s01} first name="01 This is Canada">
      <S01Canada />
    </Scene>
    <Scene range={SCENES.s02} name="02 Second largest">
      <S02Second />
    </Scene>
    <Scene range={SCENES.s03} name="03 40% Arctic">
      <S03Arctic />
    </Scene>
    <Scene range={SCENES.s04} name="04 Polar bears, moose, souls">
      <S04Population />
    </Scene>
    <Scene range={SCENES.s05} name="05 So cold">
      <S05Cold />
    </Scene>
    <Scene range={SCENES.s06} name="06 Squeeze south / 90%">
      <S06Squeeze />
    </Scene>
    <Scene range={SCENES.s07} name="07 Untouched">
      <S07Untouched />
    </Scene>
    <Scene range={SCENES.s08} name="08 Complicated">
      <S08Complicated />
    </Scene>
    <Scene range={SCENES.s09} name="09 Military">
      <S09Military />
    </Scene>
    <Scene range={SCENES.s10} name="10 Population too small">
      <S10Population />
    </Scene>
    <Scene range={SCENES.s11} last name="11 The question">
      <S11Question />
    </Scene>
    <WipeEdges />
    <ScreenFX />
    <Audio src={staticFile('audio/intro.mp3')} />
    <SoundDesign />
  </AbsoluteFill>
);
