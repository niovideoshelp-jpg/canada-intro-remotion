import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

/**
 * O "papel" do filme: a textura de grade escura enviada pelo usuario, reconstruida em 1920x1080.
 * E ESTATICA de proposito: nenhuma camada de grao/poeira muda entre frames, entao nada treme.
 */
export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#1c1c1b'}}>
    <Img src={staticFile('bg/grid.jpg')} style={{width: '100%', height: '100%', display: 'block'}} />
  </AbsoluteFill>
);

/**
 * Vidro da tela: vinheta + brilho sutil. A curvatura real (barril) e a aberracao cromatica
 * sao aplicadas na pos (scripts/crt-post.mjs). Sem moldura de TV.
 */
export const ScreenFX: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 72% 68% at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.38) 88%, rgba(0,0,0,0.6) 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        background: 'linear-gradient(158deg, rgba(255,250,240,0.045) 0%, rgba(255,250,240,0) 34%)',
      }}
    />
  </AbsoluteFill>
);
