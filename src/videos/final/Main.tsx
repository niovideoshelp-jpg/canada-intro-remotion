// GERADO por scripts/scaffold-videos.mjs (cenas em ./scenes, roteiro em docs/storyboard-*.md).
import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Backdrop, ScreenFX} from '../../components/Backdrop';
import {WipeEdges} from '../../components/WipeEdges';
import '../../fonts';
import {Scene} from '../../lib/scene';
import {cutsOf} from '../../lib/time';
import {SoundDesign} from '../../SoundDesign';
import {CUES} from './sfx';
import {SCENES} from './timing';
import {F01} from './scenes/F01';
import {F02} from './scenes/F02';
import {F03} from './scenes/F03';
import {F04} from './scenes/F04';
import {F05} from './scenes/F05';
import {F06} from './scenes/F06';
import {F07} from './scenes/F07';
import {F08} from './scenes/F08';
import {F09} from './scenes/F09';
import {F10} from './scenes/F10';
import {F11} from './scenes/F11';

export const Final: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
    <Scene range={SCENES.s01} first name="F01 Allies who disagree">
      <F01 />
    </Scene>
    <Scene range={SCENES.s02} name="F02 Internal waters, Ottawa">
      <F02 />
    </Scene>
    <Scene range={SCENES.s03} name="F03 International strait">
      <F03 />
    </Scene>
    <Scene range={SCENES.s04} name="F04 1988 agreement">
      <F04 />
    </Scene>
    <Scene range={SCENES.s05} name="F05 Independence is leverage">
      <F05 />
    </Scene>
    <Scene range={SCENES.s06} name="F06 Back to the question">
      <F06 />
    </Scene>
    <Scene range={SCENES.s07} name="F07 Depends on the threat">
      <F07 />
    </Scene>
    <Scene range={SCENES.s08} name="F08 My answer is no">
      <F08 />
    </Scene>
    <Scene range={SCENES.s09} name="F09 The four weights">
      <F09 />
    </Scene>
    <Scene range={SCENES.s10} name="F10 Years away">
      <F10 />
    </Scene>
    <Scene range={SCENES.s11} last name="F11 Outro">
      <F11 />
    </Scene>
    <WipeEdges cuts={cutsOf(SCENES)} />
    <ScreenFX />
    <Audio src={staticFile('audio/final.mp3')} />
    <SoundDesign cues={CUES} />
  </AbsoluteFill>
);
