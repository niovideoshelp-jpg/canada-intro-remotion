// Gera o esqueleto de cada video novo: words.json, timing.ts, Main.tsx, sfx.ts e cenas-placeholder.
// Uso: node scripts/scaffold-videos.mjs   (nunca sobrescreve uma cena ja implementada)
import fs from 'node:fs';
import path from 'node:path';

const VIDEOS = [
  {
    dir: 'part1', comp: 'Part1', prefix: 'P1S', audio: 'part1.mp3', transcript: '1', duration: 192.0,
    scenes: [
      [0, 17.59, 'The intercept'], [17.59, 39.39, 'NORAD'], [39.39, 50.61, 'Equipment and partnership'],
      [50.61, 57.44, 'Equipment and support network'], [57.44, 68.25, '162,000 km of coast'], [68.25, 80.3, 'Sustainment'],
      [80.3, 89.95, 'People of the north'], [89.95, 101.97, 'National security, dual use'], [101.97, 112.98, 'Warming Arctic'],
      [112.98, 125.2, 'Geography matters'], [125.2, 141.11, 'Two assessments'], [141.11, 157.56, 'Strike without invasion'],
      [157.56, 172.84, 'Espionage and dual-use ships'], [172.84, 192.0, 'Different jobs'],
    ],
  },
  {
    dir: 'part2', comp: 'Part2', prefix: 'P2S', audio: 'part2.mp3', transcript: '2', duration: 390.5,
    scenes: [
      [0, 13.35, 'North Warning System'], [13.35, 19.9, 'Testing its limits'], [19.9, 33.08, 'RADARSAT'],
      [33.08, 47.67, 'AIS and gaps'], [47.67, 66.88, '2022 audit'], [66.88, 79.69, 'OTH radar, Australia'],
      [79.69, 96.72, 'How OTH works'], [96.72, 107.56, 'CF-18 responds'], [107.56, 124.42, 'First F-35s'],
      [124.42, 137.99, 'Not a fleet for today'], [137.99, 151.64, 'Transition problems'], [151.64, 165.86, 'Six DeWolf ships'],
      [165.86, 182.13, 'What one ship can do'], [182.13, 203.15, 'Limits'], [203.15, 221.61, 'Coast Guard'],
      [221.61, 238.93, 'Victoria class'], [238.93, 247.27, 'Open water vs under ice'], [247.27, 270.2, '12 submarines'],
      [270.2, 282.09, 'Aurora to Poseidon'], [282.09, 302.8, 'Alert and Rangers'], [302.8, 317.83, 'Terrain and Nanook'],
      [317.83, 337.86, 'Nanisivik'], [337.86, 352.12, 'Range instead of a base'], [352.12, 378.32, 'Hubs and NORAD package'],
      [378.32, 390.5, 'Closer to where they operate'],
    ],
  },
  {
    dir: 'final', comp: 'Final', prefix: 'F', audio: 'final.mp3', transcript: 'Final', duration: 105.0,
    scenes: [
      [0, 6.83, 'Allies who disagree'], [6.83, 15.52, 'Internal waters, Ottawa'], [15.52, 23.42, 'International strait'],
      [23.42, 36.78, '1988 agreement'], [36.78, 46.25, 'Independence is leverage'], [46.25, 59.48, 'Back to the question'],
      [59.48, 66.86, 'Depends on the threat'], [66.86, 73.86, 'My answer is no'], [73.86, 89.47, 'The four weights'],
      [89.47, 96.08, 'Years away'], [96.08, 105.0, 'Outro'],
    ],
  },
];

const pad = (n) => String(n).padStart(2, '0');
for (const v of VIDEOS) {
  const base = path.join('src', 'videos', v.dir);
  fs.mkdirSync(path.join(base, 'scenes'), {recursive: true});

  const tr = JSON.parse(fs.readFileSync(`assets-src/transcripts/${v.transcript}.json`, 'utf8'));
  const words = tr.segments.flatMap((s) => s.words.map((w) => ({w: w.w, s: w.s, e: w.e})));
  fs.writeFileSync(path.join(base, 'words.json'), JSON.stringify(words) + '\n');

  const ids = v.scenes.map((_, i) => `${v.prefix}${pad(i + 1)}`);
  const keys = v.scenes.map((_, i) => `s${pad(i + 1)}`);

  fs.writeFileSync(
    path.join(base, 'timing.ts'),
    `// GERADO por scripts/scaffold-videos.mjs. Cortes nas pausas da fala (segundos globais).
import {makeT, Word} from '../words';
import words from './words.json';

export const DURATION_S = ${v.duration.toFixed(2)};
export const T = makeT(words as Word[]);

export const SCENES = {
${v.scenes.map(([a, b], i) => `  ${keys[i]}: [${a}, ${b}],`).join('\n')}
} as const;
`,
  );

  fs.writeFileSync(
    path.join(base, 'Main.tsx'),
    `// GERADO por scripts/scaffold-videos.mjs (cenas em ./scenes, roteiro em docs/storyboard-*.md).
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
${ids.map((id) => `import {${id}} from './scenes/${id}';`).join('\n')}

export const ${v.comp}: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Backdrop />
${ids
  .map((id, i) => {
    const flags = i === 0 ? ' first' : i === ids.length - 1 ? ' last' : '';
    return `    <Scene range={SCENES.${keys[i]}}${flags} name="${id} ${v.scenes[i][2]}">\n      <${id} />\n    </Scene>`;
  })
  .join('\n')}
    <WipeEdges cuts={cutsOf(SCENES)} />
    <ScreenFX />
    <Audio src={staticFile('audio/${v.audio}')} />
    <SoundDesign cues={CUES} />
  </AbsoluteFill>
);
`,
  );

  fs.writeFileSync(
    path.join(base, 'sfx.ts'),
    `// GERADO por scripts/scaffold-videos.mjs: cada cena exporta suas proprias deixas (\`cues\`, segundos globais).
import type {Cue} from '../../lib/cues';
${ids.map((id, i) => `import {cues as c${pad(i + 1)}} from './scenes/${id}';`).join('\n')}

export const CUES: Cue[] = [${ids.map((_, i) => `...c${pad(i + 1)}`).join(', ')}];
`,
  );

  ids.forEach((id, i) => {
    const file = path.join(base, 'scenes', `${id}.tsx`);
    if (fs.existsSync(file)) return;
    fs.writeFileSync(
      file,
      `// PLACEHOLDER (scripts/scaffold-videos.mjs) — substituir pela cena do roteiro: ${v.scenes[i][2]}.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ANTON} from '../../../fonts';
import type {Cue} from '../../../lib/cues';
import {C} from '../../../theme';

export const ${id}: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: ANTON, fontSize: 64, color: C.inkDim, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
      ${id} · ${v.scenes[i][2]}
    </div>
  </AbsoluteFill>
);

export const cues: Cue[] = [];
`,
    );
  });
  console.log(`${v.dir}: ${ids.length} scenes, ${words.length} words, ${v.duration}s`);
}
