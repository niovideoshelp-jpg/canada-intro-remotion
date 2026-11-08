// Sistema visual do video (tokens). Nada de cor "solta" fora daqui.
// Paleta: grafite (fundo do usuario) + tinta off-white (giz) + VERMELHO como unico acento
// (o vermelho substitui todo o amarelo da referencia estilo Vox).

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DURATION_S = 57.5;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

export const C = {
  ink: '#EEE9DF', // giz / papel claro: tracos, texto principal
  inkSoft: 'rgba(238,233,223,0.72)',
  inkDim: 'rgba(238,233,223,0.42)',
  inkFaint: 'rgba(238,233,223,0.16)',
  red: '#E3262B', // o acento (marcador, pais em destaque, numeros importantes)
  redDeep: '#A3161B',
  redSoft: 'rgba(227,38,43,0.55)',
  land: '#3B3A37', // terra neutra (paises sem destaque)
  landDark: '#2C2B29',
  landEdge: 'rgba(238,233,223,0.55)',
  shadow: 'rgba(0,0,0,0.55)',
  black: '#111111',
} as const;

export const CENTER = {x: W / 2, y: H / 2};
