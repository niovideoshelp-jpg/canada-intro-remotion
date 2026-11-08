// Pos-processamento "tela curva" (sem moldura de TV):
//  - distorcao de barril com interpolacao BILINEAR (mapa fixo => nada treme)
//  - aberracao cromatica radial sutil (vermelho/azul com curvaturas levemente diferentes)
//  - leve zoom para a imagem preencher o quadro; so os cantos ficam arredondados/escuros
// Uso: node scripts/crt-post.mjs entrada.(mp4|png|jpg) saida.(mp4|png|jpg)
// Variaveis opcionais: CRT_K1 (curvatura, padrao 0.045), CRT_CA (aberracao, padrao 0.004)
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node scripts/crt-post.mjs <input> <output>');
  process.exit(1);
}

const K1 = Number(process.env.CRT_K1 ?? 0.045);
const K2 = Number(process.env.CRT_K2 ?? 0.01);
const CA = Number(process.env.CRT_CA ?? 0.004);
// zoom minimo para nao sobrar preto nas bordas laterais (borda lateral: r^2 = 16^2/(16^2+9^2))
const r2edge = (16 * 16) / (16 * 16 + 9 * 9);
const Z = Number((1 + (K1 + CA) * r2edge + K2 * r2edge * r2edge + 0.004).toFixed(4));

const lens = (k1) => `lenscorrection=k1=${k1.toFixed(4)}:k2=${K2}:i=bilinear:fc=black`;
const graph = [
  `[0:v]format=gbrp,split=3[a][b][c]`,
  `[a]extractplanes=r,${lens(K1 + CA)}[R]`,
  `[b]extractplanes=g,${lens(K1)}[G]`,
  `[c]extractplanes=b,${lens(K1 - CA)}[B]`,
  `[G][B][R]mergeplanes=mapping=0x001020:format=gbrp,scale=w=trunc(iw*${Z}/2)*2:h=trunc(ih*${Z}/2)*2:flags=lanczos,crop=1920:1080,format=yuv444p[v]`,
].join(';');

const isVideo = /\.(mp4|mov|mkv)$/i.test(input);
const args = ['-hide_banner', '-y', '-i', input, '-filter_complex', graph, '-map', '[v]'];
if (isVideo) {
  args.push('-map', '0:a?', '-c:a', 'aac', '-b:a', '320k');
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-tune', 'film', '-movflags', '+faststart');
} else {
  args.push('-frames:v', '1');
  if (/\.jpe?g$/i.test(output)) args.push('-q:v', '2');
}
args.push(output);

console.log(`CRT post: k1=${K1} k2=${K2} ca=${CA} zoom=${Z}`);
const ffmpeg = process.env.FFMPEG_BIN ?? 'ffmpeg';
const res = spawnSync(ffmpeg, args, {stdio: ['ignore', 'inherit', 'inherit']});
if (res.status !== 0) {
  console.error(`ffmpeg failed (${res.status})`);
  process.exit(res.status ?? 1);
}
console.log(`done -> ${path.resolve(output)}`);
