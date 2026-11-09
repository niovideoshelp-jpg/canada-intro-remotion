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
import {P1S01} from './scenes/P1S01';
import {P1S03} from './scenes/P1S03';
import {P1S04} from './scenes/P1S04';
import {P1S05} from './scenes/P1S05';
import {P1S06} from './scenes/P1S06';
import {P1S07} from './scenes/P1S07';
import {P1S08} from './scenes/P1S08';
import {P1S09} from './scenes/P1S09';
import {P1S10} from './scenes/P1S10';
import {P1S11} from './scenes/P1S11';
import {P1S12} from './scenes/P1S12';
import {P1S13} from './scenes/P1S13';
import {P1S14} from './scenes/P1S14';

export const Part1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
    <Scene range={SCENES.s01} first name="P1S01 The intercept and NORAD">
      <P1S01 />
    </Scene>
    <Scene range={SCENES.s02} name="P1S03 Equipment and partnership">
      <P1S03 />
    </Scene>
    <Scene range={SCENES.s03} name="P1S04 Equipment and support network">
      <P1S04 />
    </Scene>
    <Scene range={SCENES.s04} name="P1S05 162,000 km of coast">
      <P1S05 />
    </Scene>
    <Scene range={SCENES.s05} name="P1S06 Sustainment">
      <P1S06 />
    </Scene>
    <Scene range={SCENES.s06} name="P1S07 People of the north">
      <P1S07 />
    </Scene>
    <Scene range={SCENES.s07} name="P1S08 National security, dual use">
      <P1S08 />
    </Scene>
    <Scene range={SCENES.s08} name="P1S09 Warming Arctic">
      <P1S09 />
    </Scene>
    <Scene range={SCENES.s09} name="P1S10 Geography matters">
      <P1S10 />
    </Scene>
    <Scene range={SCENES.s10} name="P1S11 Two assessments">
      <P1S11 />
    </Scene>
    <Scene range={SCENES.s11} name="P1S12 Strike without invasion">
      <P1S12 />
    </Scene>
    <Scene range={SCENES.s12} name="P1S13 Espionage and dual-use ships">
      <P1S13 />
    </Scene>
    <Scene range={SCENES.s13} last name="P1S14 Different jobs">
      <P1S14 />
    </Scene>
    <WipeEdges cuts={cutsOf(SCENES)} />
    <ScreenFX />
    <Audio src={staticFile('audio/part1.mp3')} />
    <SoundDesign cues={CUES} />
  </AbsoluteFill>
);
