import React from 'react';
import {C} from '../theme';

export type Seed = {x: number; y: number; r: number; delay: number};

/**
 * Defs da "tinta vermelha que se espalha": circulos que crescem dentro de um mask, com borda
 * organica (ruido ESTATICO + leve desfoque). O ruido nao muda entre frames => sem tremedeira.
 * Coloque dentro de um <defs> do mesmo documento; as coordenadas sao as do mapa.
 */
export const PaintDefs: React.FC<{id: string; seeds: Seed[]; rough?: number}> = ({id, seeds, rough = 40}) => (
  <>
    <filter id={`${id}-ink`} x="-40%" y="-40%" width="180%" height="180%">
      <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves={2} seed={11} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={rough} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation={1.8} />
    </filter>
    <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={10000} height={10000}>
      <g filter={`url(#${id}-ink)`}>
        {seeds.map((s, i) => (
          <circle key={i} className={`${id}-seed`} cx={s.x} cy={s.y} r={0} fill="#fff" />
        ))}
      </g>
    </mask>
  </>
);

/** O preenchimento em si. Depois que a pintura termina, `settled` remove o mask (render mais leve). */
export const PaintPath: React.FC<{id: string; d: string; settled: boolean; color?: string; opacity?: number}> = ({
  id,
  d,
  settled,
  color = C.red,
  opacity = 1,
}) => <path d={d} fill={color} fillRule="evenodd" opacity={opacity} mask={settled ? undefined : `url(#${id}-mask)`} />;

/** Sementes deterministicas a partir de pontos (ex.: centroides de provincias), espalhando a partir de `origin`. */
export const seedsFrom = (
  pts: readonly (readonly [number, number])[],
  origin: readonly [number, number],
  radius: number,
  spread = 0.55,
): Seed[] => {
  const dists = pts.map((p) => Math.hypot(p[0] - origin[0], p[1] - origin[1]));
  const max = Math.max(...dists, 1);
  return pts.map((p, i) => ({x: p[0], y: p[1], r: radius, delay: (dists[i] / max) * spread}));
};
