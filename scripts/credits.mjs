// Gera CREDITS.md a partir de assets-src/credits/*.json (fotos e efeitos sonoros).
import fs from 'node:fs';
import path from 'node:path';

const dir = 'assets-src/credits';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const photos = [];
const sounds = [];
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (Array.isArray(data)) sounds.push(...data);
  else photos.push(data);
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
let md = `# Créditos

## Fotografias (recortadas no Canva)

| Uso no vídeo | Arquivo original | Autor | Licença |
|---|---|---|---|
`;
for (const p of photos.sort((a, b) => a.name.localeCompare(b.name))) {
  md += `| ${esc(p.name)} | [${esc(p.title)}](${p.source_page}) | ${esc(p.author)} | ${esc(p.license)} |\n`;
}
md += `
## Efeitos sonoros — [Freesound](https://freesound.org) (todos Creative Commons 0)

| Arquivo | Som | Autor | Link |
|---|---|---|---|
`;
for (const s of sounds.sort((a, b) => a.name.localeCompare(b.name))) {
  md += `| ${esc(s.name)} | ${esc(s.title)} | ${esc(s.author)} | ${s.url} |\n`;
}
md += `
## Outros

- Mapas: [Natural Earth](https://www.naturalearthdata.com) 1:50m (domínio público), via \`world-atlas\`.
- Fontes: Anton e Playfair Display — [Google Fonts](https://fonts.google.com) (SIL Open Font License).
- Animação: [Remotion](https://www.remotion.dev) e [GSAP](https://gsap.com).
- Textura de fundo: imagem fornecida pelo autor do canal, reconstruída em 1080p.
`;
fs.writeFileSync('CREDITS.md', md);
console.log(`CREDITS.md: ${photos.length} fotos, ${sounds.length} sons`);
