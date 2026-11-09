import React from 'react';
import {C} from '../../theme';
import {usePx} from '../MapSvg';
import {XY, cumLen, headingAt, pointAt, polyD, sampleD, smoothPts} from './geom';
import {Icon, IconName, iconView} from './Icon';

/**
 * Polilinha do trajeto: `pts` ou `d` amostrado. Suaviza (Catmull-Rom) por padrao so quando ha poucos pontos de
 * controle (<= 24); trajetos ja densos (ex. POLAR2.bomberTracks[i].pts) passam direto.
 */
export const trackPoly = (pts?: readonly XY[], d?: string, smooth?: boolean): [number, number][] => {
  if (pts) return (smooth ?? pts.length <= 24) ? smoothPts(pts, 12) : pts.map((p) => [p[0], p[1]] as [number, number]);
  if (d) return sampleD(d).flat();
  return [];
};

/** Ponta de um trajeto em `progress` (0..1): ponto e direcao em graus (0 = +x). Para blips, rotulos que seguem o icone. */
export const trackHead = (poly: readonly XY[], progress: number) => {
  const cum = cumLen(poly);
  const total = cum[cum.length - 1];
  const s = Math.max(0, Math.min(1, progress)) * total;
  return {p: pointAt(poly, cum, s).p, heading: headingAt(poly, cum, s, Math.max(total * 0.012, 1))};
};

/** Trecho [s0, s1] (comprimento de arco) de uma polilinha. */
const sliceRange = (poly: readonly XY[], cum: readonly number[], s0: number, s1: number): [number, number][] => {
  if (s1 <= s0) return [];
  const a = pointAt(poly, cum, s0);
  const b = pointAt(poly, cum, s1);
  const out: [number, number][] = [a.p];
  for (let k = a.seg + 1; k <= b.seg; k++) out.push([poly[k][0], poly[k][1]]);
  out.push(b.p);
  return out;
};

/**
 * Trajeto que avanca: `progress` 0..1 (calculado por frame) desenha a trilha tracejada ate ali e leva um
 * icone na ponta, orientado pelo caminho (vista de cima: gira; de lado: espelha). Coordenadas do mapa;
 * tracos e icone com tamanho constante na tela (usePx). O tracejado e ancorado no inicio do caminho
 * (em unidades do mapa), entao nunca "anda". Entre com `pts` (suavizados por Catmull-Rom) ou `d`.
 * Classe do icone: `${cls}-head` (pop/popOut), tracos dele `${cls}-head-p`.
 */
export const MovingTrack: React.FC<{
  cls?: string;
  pts?: readonly XY[];
  d?: string;
  /** suaviza `pts` (Catmull-Rom)? padrao: so quando ha <= 24 pontos */
  smooth?: boolean;
  progress: number;
  color?: string;
  /** px de tela */
  width?: number;
  /** tracejado em unidades do mapa; null = solido */
  dash?: readonly [number, number] | null;
  trailOpacity?: number;
  /** so os ultimos `tail` (unidades do mapa) da trilha ficam visiveis (cauda de cometa) */
  tail?: number;
  /** opacidade do caminho inteiro "planejado" por baixo (0 = nao mostra) */
  ghost?: number;
  icon?: IconName;
  /** px de tela */
  iconSize?: number;
  iconColor?: string;
  iconFill?: string;
  iconStrokeW?: number;
  orient?: 'auto' | 'rotate' | 'flip' | 'none';
  head?: boolean;
  shadow?: boolean;
  opacity?: number;
}> = ({
  cls,
  pts,
  d,
  smooth,
  progress,
  color = C.red,
  width = 3,
  dash = [12, 9],
  trailOpacity = 1,
  tail,
  ghost = 0,
  icon,
  iconSize = 44,
  iconColor = C.ink,
  iconFill,
  iconStrokeW,
  orient = 'auto',
  head = true,
  shadow = true,
  opacity,
}) => {
  const px = usePx();
  const poly = trackPoly(pts, d, smooth);
  if (poly.length < 2) return null;
  const cum = cumLen(poly);
  const total = cum[cum.length - 1];
  const s = Math.max(0, Math.min(1, progress)) * total;
  const s0 = tail !== undefined ? Math.max(0, s - tail) : 0;
  const trail = sliceRange(poly, cum, s0, s);
  const dashArr = dash ? `${dash[0]} ${dash[1]}` : undefined;
  const lineProps = {
    fill: 'none',
    stroke: color,
    strokeWidth: px(width),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeDasharray: dashArr,
  };

  let rot = 0;
  let flip = false;
  let hx = 0;
  let hy = 0;
  if (icon && head) {
    [hx, hy] = pointAt(poly, cum, s).p;
    const hd = headingAt(poly, cum, s, Math.max(total * 0.012, 1));
    const view = iconView(icon);
    const mode = orient === 'auto' ? (view === 'top' ? 'rotate' : view === 'side' ? 'flip' : 'none') : orient;
    const left = Math.cos((hd * Math.PI) / 180) < 0;
    if (mode === 'rotate') {
      if (view === 'top') rot = hd + 90;
      else {
        flip = left;
        rot = left ? hd - 180 : hd;
      }
    } else if (mode === 'flip') flip = left;
  }

  return (
    <g className={cls} opacity={opacity}>
      {ghost > 0 ? <path d={polyD(poly)} {...lineProps} strokeOpacity={ghost} /> : null}
      {trail.length > 1 ? <path d={polyD(trail)} {...lineProps} strokeOpacity={trailOpacity} strokeDashoffset={dash ? s0 : undefined} /> : null}
      {icon && head ? (
        <Icon
          name={icon}
          x={hx}
          y={hy}
          size={px(iconSize)}
          rot={rot}
          flip={flip}
          color={iconColor}
          fill={iconFill}
          strokeW={iconStrokeW !== undefined ? px(iconStrokeW) : undefined}
          cls={cls ? `${cls}-head` : undefined}
          shadow={shadow}
        />
      ) : null}
    </g>
  );
};
