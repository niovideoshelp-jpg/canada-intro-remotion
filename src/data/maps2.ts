// Dados de mapa das Partes 1, 2 e Final, pre-projetados em px de design (1920x1080).
// Gerados por scripts/build-maps2.mjs (Natural Earth 1:50m). NAO editar o JSON a mao: rode o script.
//
// Espacos de coordenadas:
//  - CA2.*    : MESMA projecao e enquadramento de CA (src/data/maps.ts). Desenhe no mesmo <MapSvg> que
//               CanadaFill/Neighbours/CanadaOutline e use a mesma camera (camAt + toScreen).
//  - POLAR2.* : MESMA projecao de POLAR (PolarBase): polo em (960,540), raio 500 px ate 26°N.
//  - WORLD    : projecao propria (Equal Earth), globo inteiro em [60..1860] x [101..979].
// Valores em px de MAPA: dentro do <MapSvg> use usePx() para tracos de espessura constante na tela.
import {geoAzimuthalEqualArea, geoConicConformal, geoEqualEarth, geoInterpolate} from 'd3-geo';
import type {GeoProjection} from 'd3-geo';
import raw from './maps2.json';
import type {Pt} from './maps';

export type {Pt};

/** Caminho com a polilinha correspondente (pts, ~1-2 px entre pontos) para mover icones ao longo dele. */
export type Track = {d: string; pts: Pt[]};
export type NamedPoint = {name: string; p: Pt; ll: Pt};
export type LabelPoint = {name: string; p: Pt};

// ------------------------------------------------------------------------------------------- CA2
export type CaPlaceName =
  | 'Alert'
  | 'Eureka'
  | 'Resolute'
  | 'Nanisivik'
  | 'Arctic Bay'
  | 'Pond Inlet'
  | 'Iqaluit'
  | 'Rankin Inlet'
  | 'Cambridge Bay'
  | 'Kugluktuk'
  | 'Inuvik'
  | 'Tuktoyaktuk'
  | 'Yellowknife'
  | 'Whitehorse'
  | 'Goose Bay'
  | 'Kuujjuaq'
  | 'Hall Beach'
  | 'Igloolik'
  | 'Ottawa'
  | 'Vancouver'
  | 'Halifax'
  | 'Esquimalt'
  | 'Greenwood'
  | 'Comox'
  | 'Cold Lake'
  | 'Bagotville'
  | 'Winnipeg'
  | 'Edmonton'
  | 'Washington DC'
  | 'Colorado Springs'
  | 'Luke AFB'
  | 'Anchorage'
  | 'Fairbanks';

export type CaLabelName =
  | 'Beaufort Sea'
  | 'Arctic Ocean'
  | 'Baffin Bay'
  | 'Davis Strait'
  | 'Labrador Sea'
  | 'Hudson Bay'
  | 'Hudson Strait'
  | 'Foxe Basin'
  | 'Lancaster Sound'
  | 'Viscount Melville Sound'
  | "M'Clure Strait"
  | 'Amundsen Gulf'
  | 'Queen Maud Gulf'
  | 'Nares Strait'
  | 'Baffin Island'
  | 'Ellesmere Island'
  | 'Victoria Island'
  | 'Banks Island'
  | 'Devon Island'
  | 'Yukon'
  | 'Northwest Territories'
  | 'Nunavut'
  | 'Labrador'
  | 'Nunavik';

/** Sitio do North Warning System. `lrr` = radar de longo alcance (11 de 47). */
export type NwsSite = {p: Pt; lrr: boolean; name?: string};
export type NwpRouteId = 'northern' | 'princeOfWales' | 'southern';
export type NwpRoute = Track & {id: NwpRouteId; name: string};
export type Region = {name: string; c: Pt; d: string};

export type Canada2Map = {
  /** Costa artica do Canada ao norte de 60°N (arquipelago + costa continental), SEM fronteiras terrestres. */
  arcticCoast: string;
  /** Fracao para draw(..., toFrac): o maior subcaminho (costa continental, oeste->leste) termina no fim. */
  arcticCoastDrawFrac: number;
  /** Caixa [[x0,y0],[x1,y1]] da costa artica (para uma mascara que varre de oeste para leste). */
  arcticCoastBounds: [Pt, Pt];
  /** 47 sitios do NWS, de oeste (Komakuk Beach, Yukon) para leste/sul (costa do Labrador, ~53.7°N). */
  nws: NwsSite[];
  /** Polilinha ligando os 47 sitios na ordem (a "corrente"). */
  nwsLine: string;
  places: NamedPoint[];
  /** ~36 comunidades do norte (inclui Inuvik, Iqaluit, Resolute etc.). */
  communities: NamedPoint[];
  /** Pontos de rotulo de mares, estreitos e terras (o texto fica a criterio da cena). */
  labels: LabelPoint[];
  /** Rotas da Passagem do Noroeste, todas da baia de Baffin (leste) ao mar de Beaufort (oeste), pela agua. */
  nwpRoutes: NwpRoute[];
  /** Rota maritima pela agua de Halifax (porto) ate Barrow Strait ao largo de Resolute, pelo Atlantico a leste
   * da Terra Nova, mar do Labrador, Davis, baia de Baffin e Lancaster Sound (passa ao norte de Nanisivik). */
  seaLanes: {halifaxToResolute: Track & {id: 'halifaxToResolute'; name: string}};
  /** Agua entre as ilhas dentro das linhas de base retas (as "aguas internas"), com as ilhas como furos:
   * use fillRule="evenodd". */
  channels: string;
  channelsLabel: Pt;
  regions: {
    /** Contornos suaves e fechados (sobre o mar) para "northern approaches". */
    northernApproaches: Region[];
    /** Bacia polar ao norte do arquipelago (cunha ate o polo; o topo fica acima do quadro, y < 0). */
    highArctic: {c: Pt; d: string};
  };
};

// ----------------------------------------------------------------------------------------- POLAR2
export type PolarPointName =
  | 'Anadyr'
  | 'Anchorage'
  | 'Fairbanks'
  | 'Alert'
  | 'Murmansk'
  | 'Olenya'
  | 'Severomorsk'
  | 'Novaya Zemlya'
  | 'Norilsk'
  | 'Moscow'
  | 'Beijing'
  | 'Ottawa'
  | 'Washington'
  | 'New York'
  | 'Chicago'
  | 'Toronto'
  | 'Colorado Springs'
  | 'Oslo'
  | 'Reykjavik'
  | 'Pituffik'
  | 'Iqaluit'
  | 'Resolute'
  | 'Inuvik'
  | 'Yellowknife'
  | 'Goose Bay'
  | 'Vancouver'
  | 'Halifax'
  | 'North Pole'
  | 'Barents Sea'
  | 'Kara Sea'
  | 'Bering Sea'
  | 'Chukotka'
  | 'Alaska'
  | 'Canadian Arctic'
  | 'Northern Europe'
  | 'Greenland'
  | 'Arctic Ocean';

export type BomberTrack = Track & {id: 'tu95-1' | 'tu95-2' | 'h6-1' | 'h6-2'; kind: 'tu95' | 'h6'};
/** joinFrac: fracao DESTA trajetoria em que o caca chega ao lado dos bombardeiros (depois disso ele
 * voa em "sombra", paralelo a eles, do lado da costa, ate o fim da trajetoria);
 * bomberFrac / bomberEndFrac: fracoes da trajetoria 'tu95-1' no encontro e no fim da sombra. */
export type InterceptTrack = Track & {
  id: 'jber' | 'eielson';
  from: 'Anchorage' | 'Fairbanks';
  joinFrac: number;
  bomberFrac: number;
  bomberEndFrac: number;
};
export type StrikeArc = Track & {from: PolarPointName; to: PolarPointName};
/** Traco de solo de uma passagem (lat >= 50°N); a faixa imageada tem meia-largura swathHalfWidthPx (px de mapa). */
export type RcmTrack = Track & {id: string; apexLon: number; swathHalfWidthPx: number};

export type Polar2Map = {
  points: NamedPoint[];
  /** ADIZ do Alasca (contorno publico aproximado), path fechado. */
  adiz: string;
  /** Ponto para o rotulo "AIR DEFENSE IDENTIFICATION ZONE" ao longo da borda sul (ao sul das Aleutas),
   * por dentro; adizLabelAngle = rotacao do texto em graus no espaco do mapa (some cam.r na tela). */
  adizLabel: Pt;
  adizLabelAngle: number;
  /** O mesmo trecho da borda sul como path ~3,6 px por dentro, no sentido de leitura: use com
   * <textPath startOffset="50%" textAnchor="middle"> e dominantBaseline="middle" (texto acompanha a curva). */
  adizLabelPath: string;
  adizBounds: [Pt, Pt];
  /** Costa do Alasca (EUA), sem fronteiras: para o brilho do espaco aereo soberano. */
  alaskaCoast: string;
  /** Fronteira terrestre Alasca-Canada (141°W + panhandle). */
  alaskaBorder: string;
  /** 2 Tu-95 + 2 H-6 em formacao (mesma curva deslocada), de Anadyr, volta pela ADIZ e retorno. */
  bomberTracks: BomberTrack[];
  /** Fracoes da trajetoria 'tu95-1' em que ela entra e sai da ADIZ. */
  bomberAdiz: {inFrac: number; outFrac: number};
  interceptTracks: InterceptTrack[];
  strikeArcs: StrikeArc[];
  /** Rotas maritimas simplificadas, todas do lado Atlantico ate o estreito de Bering. */
  seaRoutes: {nsr: Track; nwp: Track; transpolar: Track};
  rcmTracks: RcmTrack[];
};

// ------------------------------------------------------------------------------------------ WORLD
export type WorldKey =
  | 'canada'
  | 'usa'
  | 'australia'
  | 'germany'
  | 'russia'
  | 'china'
  | 'uk'
  | 'norway'
  | 'denmark'
  | 'greenland'
  | 'france'
  | 'japan'
  | 'iceland'
  | 'finland'
  | 'sweden';
export type WorldLabelKey = Exclude<WorldKey, 'denmark' | 'iceland' | 'finland' | 'sweden'>;
export type WorldPlaceName = 'Ottawa' | 'Washington' | 'Canberra' | 'Adelaide' | 'Kiel' | 'Berlin' | 'Moscow' | 'Beijing';
export type WorldCountry = {id: string; name: string; d: string; c: Pt};
/** kind 'screen': arco de tela (nao geodesico); 'greatCircle': circulo maximo. mid = ponto medio (icone). */
export type WorldLink = Track & {from: string; to: string; kind: 'screen' | 'greatCircle'; mid: Pt};
export type WorldMap = {
  /** escala da projecao (px por raio da Terra) */
  scale: number;
  sphere: string;
  graticule: string;
  countries: WorldCountry[];
  ids: Record<WorldKey, string>;
  labels: Record<WorldLabelKey, Pt>;
  places: NamedPoint[];
  links: {canadaAustralia: WorldLink; canadaGermany: WorldLink};
};

type ProjParams = {scale: number; translate: [number, number]};

const data = raw as unknown as {
  proj: {ca: ProjParams; polar: ProjParams; world: ProjParams};
  ca2: Canada2Map;
  polar2: Polar2Map;
  world: WorldMap;
};

export const CA2 = data.ca2;
export const POLAR2 = data.polar2;
export const WORLD = data.world;

// --------------------------------------------------------------------- projecoes (lon,lat -> px)
// Exatamente as projecoes de CA / POLAR / WORLD (mesmos parametros ajustados pelo script), para posicionar
// qualquer ponto que nao esteja nos dados (navios, blips, setas...). Sem recorte: pontos fora do
// quadro (ou alem da borda do disco polar) tambem sao projetados.
const projCA = geoConicConformal().parallels([49, 77]).rotate([96, 0]).scale(data.proj.ca.scale).translate(data.proj.ca.translate);
const projPolar = geoAzimuthalEqualArea().rotate([96, -90, 0]).scale(data.proj.polar.scale).translate(data.proj.polar.translate);
const projWorld = geoEqualEarth().scale(data.proj.world.scale).translate(data.proj.world.translate);
const PROJS: Record<'ca' | 'polar' | 'world', GeoProjection> = {ca: projCA, polar: projPolar, world: projWorld};
const projector = (p: GeoProjection) => (lon: number, lat: number): Pt => {
  const q = p([lon, lat]);
  return q ? [q[0], q[1]] : [NaN, NaN];
};
/** lon,lat -> px no espaco de CA/CA2. */
export const caProject = projector(projCA);
/** lon,lat -> px no espaco de POLAR/POLAR2. */
export const polarProject = projector(projPolar);
/** lon,lat -> px no espaco de WORLD. */
export const worldProject = projector(projWorld);
/** px -> [lon, lat] (inverso), para cada espaco. */
export const unproject = (space: 'ca' | 'polar' | 'world', p: Pt): Pt => {
  const q = PROJS[space].invert?.(p);
  return q ? [q[0], q[1]] : [NaN, NaN];
};
/** Arco de circulo maximo entre dois [lon, lat], projetado como polilinha densa (n segmentos).
 * Em WORLD, nao use para pares que cruzam o antimeridiano (a polilinha atravessaria o mapa). */
export const greatCircle = (space: 'ca' | 'polar' | 'world', a: Pt, b: Pt, n = 96): Pt[] => {
  const f = geoInterpolate(a, b);
  const p = PROJS[space];
  return Array.from({length: n + 1}, (_, i) => {
    const q = p(f(i / n));
    return (q ? [q[0], q[1]] : [NaN, NaN]) as Pt;
  });
};

// ---------------------------------------------------------------------------------------- helpers
const need = <T,>(v: T | undefined, what: string): T => {
  if (v === undefined) throw new Error(`maps2: ${what} not found`);
  return v;
};

/** Ponto projetado (CA) de um lugar de CA2.places. */
export const caPlace = (name: CaPlaceName): Pt => need(CA2.places.find((q) => q.name === name), name).p;
/** Ponto projetado (CA) de uma comunidade de CA2.communities (nome livre; erro se nao existir). */
export const caCommunity = (name: string): Pt => need(CA2.communities.find((q) => q.name === name), name).p;
/** Ponto de rotulo (CA) de um mar/estreito/terra. */
export const caLabel = (name: CaLabelName): Pt => need(CA2.labels.find((q) => q.name === name), name).p;
export const nwpRoute = (id: NwpRouteId): NwpRoute => need(CA2.nwpRoutes.find((r) => r.id === id), id);
/** Ponto projetado (POLAR) de POLAR2.points. */
export const polarPoint = (name: PolarPointName): Pt => need(POLAR2.points.find((q) => q.name === name), name).p;
export const worldCountry = (key: WorldKey): WorldCountry => need(WORLD.countries.find((c) => c.id === WORLD.ids[key]), key);
export const worldPlace = (name: WorldPlaceName): Pt => need(WORLD.places.find((q) => q.name === name), name).p;

// ------------------------------------------------------------------------ movimento ao longo de pts
const cumCache = new WeakMap<readonly Pt[], number[]>();
const cumOf = (pts: readonly Pt[]) => {
  let c = cumCache.get(pts);
  if (!c) {
    c = [0];
    for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    cumCache.set(pts, c);
  }
  return c;
};

/** Comprimento (px de mapa) de uma polilinha. */
export const trackLength = (pts: readonly Pt[]) => {
  const c = cumOf(pts);
  return c[c.length - 1];
};

/** Posicao no comprimento de arco t (px de mapa), interpolada entre os vertices. */
const posAt = (pts: readonly Pt[], c: readonly number[], t: number): [number, number] => {
  if (pts.length < 2) return pts.length ? [pts[0][0], pts[0][1]] : [NaN, NaN];
  let lo = 0;
  let hi = c.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (c[mid] <= t) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const u = Math.min(1, Math.max(0, (t - c[lo]) / (c[hi] - c[lo] || 1)));
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
};

/**
 * Posicao e direcao na fracao f (0..1) do comprimento. angle em graus (0 = +x, positivo = sentido
 * horario na tela), medido entre os pontos a `look` px antes e depois: varia de forma CONTINUA com f
 * (o icone gira suave nas curvas, sem saltos de vertice em vertice).
 */
export const pointAlong = (pts: readonly Pt[], f: number, look = 4): {x: number; y: number; angle: number} => {
  const c = cumOf(pts);
  const L = c[c.length - 1];
  const t = Math.min(1, Math.max(0, f)) * L;
  const [x, y] = posAt(pts, c, t);
  const [x0, y0] = posAt(pts, c, Math.max(0, t - look));
  const [x1, y1] = posAt(pts, c, Math.min(L, t + look));
  return {x, y, angle: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI};
};

/** Path SVG ("M..L..") de uma polilinha (pontos ja em px de mapa). */
export const ptsToD = (pts: readonly (readonly [number, number])[]) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${Math.round(p[0] * 10) / 10},${Math.round(p[1] * 10) / 10}`).join('');

/** Trecho [f0, f1] (fracoes do comprimento) de uma polilinha, como path SVG. */
export const subTrackD = (pts: readonly Pt[], f0: number, f1: number) => {
  const c = cumOf(pts);
  const L = c[c.length - 1];
  const t0 = Math.min(1, Math.max(0, f0)) * L;
  const t1 = Math.min(1, Math.max(0, f1)) * L;
  if (t1 <= t0) return '';
  const a = pointAlong(pts, f0);
  const b = pointAlong(pts, f1);
  const inner = pts.filter((_, i) => c[i] > t0 && c[i] < t1);
  return ptsToD([[a.x, a.y], ...inner, [b.x, b.y]]);
};
