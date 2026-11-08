import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {at} from '../lib/pos';

/**
 * Recorte fotografico tipo "adesivo" (borda branca + sombra ja embutidas no PNG pelo
 * scripts/prep_images.py). A animacao de entrada fica no elemento interno (classe `cls`),
 * o posicionamento no externo — React e GSAP nunca disputam o mesmo transform.
 */
export const Sticker: React.FC<{
  cls: string;
  src: string;
  x: number;
  y: number;
  w: number;
  origin?: string;
  flip?: boolean;
}> = ({cls, src, x, y, w, origin = '50% 75%', flip}) => (
  <div style={{...at(x, y), width: w}}>
    <div className={cls} style={{transformOrigin: origin, visibility: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', display: 'block', transform: flip ? 'scaleX(-1)' : undefined}} />
    </div>
  </div>
);

/** Camada de profundidade para parallax: desloca/escala proporcionalmente a `depth`. */
export const Depth: React.FC<{depth: number; px: number; py: number; zoom: number; children: React.ReactNode}> = ({
  depth,
  px,
  py,
  zoom,
  children,
}) => (
  <AbsoluteFill
    style={{
      transform: `translate(${px * depth}px, ${py * depth}px) scale(${1 + (zoom - 1) * depth}) rotate(0.03deg)`,
      transformOrigin: '50% 50%',
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Placa fotografica centralizada cobrindo o quadro (com margem para o parallax). */
export const Plate: React.FC<{src: string; w: number; x?: number; y?: number}> = ({src, w, x = 0, y = 0}) => (
  <div style={{position: 'absolute', left: '50%', top: '50%', width: w, transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`}}>
    <Img src={staticFile(src)} style={{width: '100%', display: 'block'}} />
  </div>
);
