import React from 'react';
import {POLAR} from '../data/maps';
import {C} from '../theme';
import {usePx} from './MapSvg';

/**
 * Vista polar (azimutal de AREAS IGUAIS centrada no Polo Norte): compara tamanhos reais.
 * Canada em vermelho; os outros paises em grafite.
 */
export const PolarBase: React.FC<{
  canadaFill?: string;
  highlight?: Record<string, string>;
  dimOthers?: number;
}> = ({canadaFill = C.red, highlight = {}, dimOthers = 1}) => {
  const px = usePx();
  return (
    <g>
      <path d={POLAR.sphere} fill="rgba(8,8,8,0.42)" />
      <path d={POLAR.graticule} fill="none" stroke={C.ink} strokeOpacity={0.12} strokeWidth={px(1)} />
      {POLAR.countries.map((c) => {
        const isCanada = c.id === POLAR.ids.canada;
        const fill = isCanada ? canadaFill : highlight[c.id] ?? C.land;
        return (
          <path
            key={c.id + c.name}
            d={c.d}
            fill={fill}
            fillOpacity={isCanada || highlight[c.id] ? 1 : dimOthers}
            stroke={isCanada ? 'none' : C.landEdge}
            strokeOpacity={0.35}
            strokeWidth={px(0.7)}
          />
        );
      })}
      <path d={POLAR.sphere} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={px(1.6)} />
    </g>
  );
};
