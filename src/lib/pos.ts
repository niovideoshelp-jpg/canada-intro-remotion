import type React from 'react';

/**
 * Posicionamento ANTI-TREMEDEIRA para elementos HTML que se movem.
 * O Chrome encaixa texto em pixel inteiro na vertical quando o elemento e posicionado com
 * left/top (medimos: y pulava 939 -> 938 -> 937). A micro-rotacao abaixo faz o Skia desenhar o texto
 * com precisao subpixel nos dois eixos. Sem will-change/translate3d de proposito: camadas compostas
 * congelam a escala de raster e a nitidez poderia variar entre abas de render.
 */
export const at = (x: number, y: number, ax = '-50%', ay = '-50%'): React.CSSProperties => ({
  position: 'absolute',
  left: 0,
  top: 0,
  // rotate(0.03deg): matriz "nao alinhada aos eixos" => o Skia desenha os glifos como vetores,
  // sem encaixar a linha de base no pixel. Invisivel (~0,2 px em 400 px). Abaixo de ~0,016 graus o Skia ainda trata como "alinhado".
  transform: `translate(${x}px, ${y}px) translate(${ax}, ${ay}) rotate(0.03deg)`,
});
