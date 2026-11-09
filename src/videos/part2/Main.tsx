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
import {P2S01} from './scenes/P2S01';
import {P2S02} from './scenes/P2S02';
import {P2S03} from './scenes/P2S03';
import {P2S04} from './scenes/P2S04';
import {P2S05} from './scenes/P2S05';
import {P2S06} from './scenes/P2S06';
import {P2S07} from './scenes/P2S07';
import {P2S08} from './scenes/P2S08';
import {P2S09} from './scenes/P2S09';
import {P2S10} from './scenes/P2S10';
import {P2S11} from './scenes/P2S11';
import {P2S12} from './scenes/P2S12';
import {P2S13} from './scenes/P2S13';
import {P2S14} from './scenes/P2S14';
import {P2S15} from './scenes/P2S15';
import {P2S16} from './scenes/P2S16';
import {P2S17} from './scenes/P2S17';
import {P2S18} from './scenes/P2S18';
import {P2S19} from './scenes/P2S19';
import {P2S20} from './scenes/P2S20';
import {P2S21} from './scenes/P2S21';
import {P2S22} from './scenes/P2S22';
import {P2S23} from './scenes/P2S23';
import {P2S24} from './scenes/P2S24';
import {P2S25} from './scenes/P2S25';

export const Part2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
    <Scene range={SCENES.s01} first name="P2S01 North Warning System">
      <P2S01 />
    </Scene>
    <Scene range={SCENES.s02} name="P2S02 Testing its limits">
      <P2S02 />
    </Scene>
    <Scene range={SCENES.s03} name="P2S03 RADARSAT">
      <P2S03 />
    </Scene>
    <Scene range={SCENES.s04} name="P2S04 AIS and gaps">
      <P2S04 />
    </Scene>
    <Scene range={SCENES.s05} name="P2S05 2022 audit">
      <P2S05 />
    </Scene>
    <Scene range={SCENES.s06} name="P2S06 OTH radar, Australia">
      <P2S06 />
    </Scene>
    <Scene range={SCENES.s07} name="P2S07 How OTH works">
      <P2S07 />
    </Scene>
    <Scene range={SCENES.s08} name="P2S08 CF-18 responds">
      <P2S08 />
    </Scene>
    <Scene range={SCENES.s09} name="P2S09 First F-35s">
      <P2S09 />
    </Scene>
    <Scene range={SCENES.s10} name="P2S10 Not a fleet for today">
      <P2S10 />
    </Scene>
    <Scene range={SCENES.s11} name="P2S11 Transition problems">
      <P2S11 />
    </Scene>
    <Scene range={SCENES.s12} name="P2S12 Six DeWolf ships">
      <P2S12 />
    </Scene>
    <Scene range={SCENES.s13} name="P2S13 What one ship can do">
      <P2S13 />
    </Scene>
    <Scene range={SCENES.s14} name="P2S14 Limits">
      <P2S14 />
    </Scene>
    <Scene range={SCENES.s15} name="P2S15 Coast Guard">
      <P2S15 />
    </Scene>
    <Scene range={SCENES.s16} name="P2S16 Victoria class">
      <P2S16 />
    </Scene>
    <Scene range={SCENES.s17} name="P2S17 Open water vs under ice">
      <P2S17 />
    </Scene>
    <Scene range={SCENES.s18} name="P2S18 12 submarines">
      <P2S18 />
    </Scene>
    <Scene range={SCENES.s19} name="P2S19 Aurora to Poseidon">
      <P2S19 />
    </Scene>
    <Scene range={SCENES.s20} name="P2S20 Alert and Rangers">
      <P2S20 />
    </Scene>
    <Scene range={SCENES.s21} name="P2S21 Terrain and Nanook">
      <P2S21 />
    </Scene>
    <Scene range={SCENES.s22} name="P2S22 Nanisivik">
      <P2S22 />
    </Scene>
    <Scene range={SCENES.s23} name="P2S23 Range instead of a base">
      <P2S23 />
    </Scene>
    <Scene range={SCENES.s24} name="P2S24 Hubs and NORAD package">
      <P2S24 />
    </Scene>
    <Scene range={SCENES.s25} last name="P2S25 Closer to where they operate">
      <P2S25 />
    </Scene>
    <WipeEdges cuts={cutsOf(SCENES)} />
    <ScreenFX />
    <Audio src={staticFile('audio/part2.mp3')} />
    <SoundDesign cues={CUES} />
  </AbsoluteFill>
);
