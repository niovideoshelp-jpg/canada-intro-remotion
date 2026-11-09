// Renderiza varios frames de uma vez (bundle uma unica vez) para revisao visual.
// Uso: node scripts/stills.mjs <prefixo> <escala> <frame> [frame...]
//   ex: node scripts/stills.mjs s01 0.5 30 75 140 205 285
//       COMP=CanadaPart1 node scripts/stills.mjs p1s05 0.5 1800 1900
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const [prefix = 'still', scaleArg = '0.5', ...frameArgs] = process.argv.slice(2);
const scale = Number(scaleArg);
const frames = frameArgs.map(Number);
const outDir = path.resolve('out/stills');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => undefined});
// COMP=CanadaPart1|CanadaPart2|CanadaFinal escolhe outro video (padrao: a Intro)
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'CanadaIntro', chromiumOptions: {gl: 'angle'}});
for (const frame of frames) {
  const output = path.join(outDir, `${prefix}_f${String(frame).padStart(4, '0')}.jpg`);
  const t0 = Date.now();
  await renderStill({composition, serveUrl, output, frame, imageFormat: 'jpeg', jpegQuality: 90, scale, chromiumOptions: {gl: 'angle'}, overwrite: true});
  console.log(`frame ${frame} -> ${path.relative(process.cwd(), output)} (${Date.now() - t0} ms)`);
}
