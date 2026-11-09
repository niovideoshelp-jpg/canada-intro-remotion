import React from 'react';
import {WORLD} from '../data/maps2';
import {C} from '../theme';
import {usePx} from './MapSvg';

/**
 * Mapa-mundi (Equal Earth) no mesmo vocabulario do PolarBase: oceano escuro, graticula de giz, paises em grafite.
 * `highlight` pinta paises por id (WORLD.ids) com uma cor fixa; para "pintar" com tinta use PaintPath por cima.
 */
export const WorldBase: React.FC<{highlight?: Record<string, string>; dimOthers?: number}> = ({highlight = {}, dimOthers = 1}) => {
  const px = usePx();
  return (
    <g>
      <path d={WORLD.sphere} fill="rgba(8,8,8,0.42)" />
      <path d={WORLD.graticule} fill="none" stroke={C.ink} strokeOpacity={0.12} strokeWidth={px(1)} />
      {WORLD.countries.map((c) => (
        <path
          key={c.id + c.name}
          d={c.d}
          fill={highlight[c.id] ?? C.land}
          fillOpacity={highlight[c.id] ? 1 : dimOthers}
          stroke={C.landEdge}
          strokeOpacity={0.35}
          strokeWidth={px(0.7)}
        />
      ))}
      <path d={WORLD.sphere} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={px(1.6)} />
    </g>
  );
};
