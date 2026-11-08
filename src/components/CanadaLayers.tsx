import React from 'react';
import {CA} from '../data/maps';
import {C} from '../theme';
import {usePx} from './MapSvg';

/** Vizinhos (EUA/Alasca, Groenlandia...) em grafite neutro. */
export const Neighbours: React.FC<{cls?: string; fill?: string}> = ({cls, fill = C.land}) => {
  const px = usePx();
  return (
    <g className={cls}>
      <path d={CA.usa} fill={fill} stroke={C.landEdge} strokeWidth={px(1)} strokeOpacity={0.5} />
      <path d={CA.greenland} fill={fill} stroke={C.landEdge} strokeWidth={px(1)} strokeOpacity={0.5} />
      <path d={CA.otherLand} fill={fill} stroke={C.landEdge} strokeWidth={px(1)} strokeOpacity={0.5} />
    </g>
  );
};

/** Meridianos/paralelos bem discretos: le "mapa", sem competir. */
export const Graticule: React.FC<{d: string; cls?: string; opacity?: number}> = ({d, cls, opacity = 0.13}) => {
  const px = usePx();
  return <path className={cls} d={d} fill="none" stroke={C.ink} strokeOpacity={opacity} strokeWidth={px(1)} />;
};

export const CanadaFill: React.FC<{fill?: string; cls?: string}> = ({fill = C.land, cls}) => (
  <path className={cls} d={CA.canada} fill={fill} />
);

/** Contorno do Canada em "giz" (classe para DrawSVG). */
export const CanadaOutline: React.FC<{cls?: string; color?: string; width?: number; opacity?: number}> = ({
  cls,
  color = C.ink,
  width = 2,
  opacity = 1,
}) => {
  const px = usePx();
  return (
    <path
      className={cls}
      d={CA.canada}
      fill="none"
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={px(width)}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
};

/** Limites provinciais (tracos finos). */
export const ProvinceLines: React.FC<{cls?: string; color?: string; width?: number; opacity?: number; only?: (id: string) => boolean}> = ({
  cls,
  color = C.ink,
  width = 1,
  opacity = 0.35,
  only,
}) => {
  const px = usePx();
  return (
    <g className={cls}>
      {CA.provinces
        .filter((p) => (only ? only(p.id) : true))
        .map((p) => (
          <path key={p.id} d={p.d} fill="none" stroke={color} strokeOpacity={opacity} strokeWidth={px(width)} strokeLinejoin="round" />
        ))}
    </g>
  );
};
