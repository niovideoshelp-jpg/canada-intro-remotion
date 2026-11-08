// Dados de mapa pre-projetados (gerados por scripts/build-maps.mjs a partir do Natural Earth).
import raw from './maps.json';

export type Pt = [number, number];

export type Province = {
  id: string;
  name: string;
  territory: boolean;
  d: string;
  c: Pt;
  areaKm2: number;
};

export type Dot = {x0: number; y0: number; x1: number; y1: number; r: number};

export type CanadaMap = {
  canada: string;
  canadaRaw: string;
  canadaCentroid: Pt;
  canadaBounds: [Pt, Pt];
  lakes: string;
  usa: string;
  greenland: string;
  otherLand: string;
  provinces: Province[];
  territoriesShare: number;
  southBorder: string;
  alaskaBorder: string;
  band300Px: number;
  arcticCircle: string;
  parallel60: string;
  graticule: string;
  labels: Record<'usa' | 'alaska' | 'greenland' | 'arctic' | 'border' | 'hudsonBay', Pt>;
  cities: {name: string; pop: number; p: Pt}[];
  dots: Dot[];
};

export type PolarMap = {
  radius: number;
  center: Pt;
  sphere: string;
  countries: {id: string; name: string; d: string; c: Pt}[];
  graticule: string;
  arcticCircle: string;
  nwPassage: string;
  pole: Pt;
  labels: Record<'canada' | 'russia' | 'usa' | 'greenland' | 'nwPassage', Pt>;
  ids: Record<string, string>;
};

const data = raw as unknown as {ca: CanadaMap; polar: PolarMap};

export const CA = data.ca;
export const POLAR = data.polar;

export const polarCountry = (id: string) => POLAR.countries.find((c) => c.id === id);
export const province = (id: string) => CA.provinces.find((p) => p.id === id)!;
