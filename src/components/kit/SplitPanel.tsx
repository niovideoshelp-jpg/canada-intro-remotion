import React from 'react';
import {AbsoluteFill} from 'remotion';
import {lerp} from '../../lib/ease';
import {WIPE_SLANT} from '../../lib/scene';
import {C, H, W} from '../../theme';

/** Centros (x) das duas metades para um divisor em `x`. */
export const splitCenters = (x = W / 2) => ({left: x / 2, right: (x + W) / 2});

/**
 * Tela dividida em duas metades pela borda inclinada vermelha (a mesma linguagem da cortina entre cenas).
 * `left`/`right` sao camadas de tela cheia (coordenadas 1920x1080), recortadas por cada lado do divisor.
 * `progress` (0..1, por frame) traz o divisor da borda direita (0 = so a esquerda) ate `x` (1):
 * progress={ramp(t, T('detecting') - 0.3, T('detecting') + 0.3, inOutCubic)}.
 */
export const SplitPanel: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  /** posicao do divisor (no meio da altura) */
  x?: number;
  slant?: number;
  progress?: number;
  /** escurecimento de cada metade (0..1) para separar os dois lados */
  tintLeft?: number;
  tintRight?: number;
  edge?: boolean;
}> = ({left, right, x = W / 2, slant = WIPE_SLANT, progress = 1, tintLeft = 0, tintRight = 0, edge = true}) => {
  const e = lerp(W + slant + 30, x, Math.max(0, Math.min(1, progress)));
  const top = e + slant;
  const bottom = e - slant;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: `polygon(-400px 0px, ${top}px 0px, ${bottom}px ${H}px, -400px ${H}px)`}}>
        {left}
        {tintLeft > 0 ? <AbsoluteFill style={{backgroundColor: C.black, opacity: tintLeft}} /> : null}
      </AbsoluteFill>
      {/* sempre montado: com progress 0 o recorte fica todo fora da tela */}
        <AbsoluteFill style={{clipPath: `polygon(${top}px 0px, ${W + 400}px 0px, ${W + 400}px ${H}px, ${bottom}px ${H}px)`}}>
          {right}
          {tintRight > 0 ? <AbsoluteFill style={{backgroundColor: C.black, opacity: tintRight}} /> : null}
        </AbsoluteFill>
      
      {edge && progress > 0 ? (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          <line x1={top + 9} y1={-10} x2={bottom + 9} y2={H + 10} stroke={C.shadow} strokeOpacity={0.65} strokeWidth={14} />
          <line x1={top} y1={-10} x2={bottom} y2={H + 10} stroke={C.red} strokeWidth={10} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
