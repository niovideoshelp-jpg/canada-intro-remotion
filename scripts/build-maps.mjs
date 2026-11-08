// Gera os dados de mapa (ja projetados em coordenadas 1920x1080) usados pelo video.
// Fonte: Natural Earth 1:50m (dominio publico) via world-atlas + admin-1 + lagos.
// Saida: src/data/maps.json  (strings de path SVG estaticas => render rapido e deterministico)
import fs from 'node:fs';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import polygonClipping from 'polygon-clipping';

const W = 1920;
const H = 1080;
const R = (n) => Math.round(n * 10) / 10;
const range = (a, b, step) => Array.from({length: Math.ceil((b - a) / step)}, (_, i) => a + i * step);

const world = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const countries = topojson.feature(world, world.objects.countries).features;
const byId = (id) => countries.find((f) => f.id === id);
const CAN = byId('124');
const USA = byId('840');
const RUS = byId('643');
const GRL = byId('304');
if (!CAN || !USA || !RUS || !GRL) throw new Error('country ids not found');

const admin1 = JSON.parse(fs.readFileSync('assets-src/maps/ne_50m_admin_1.geojson', 'utf8'));
const provinces = admin1.features.filter((f) => f.properties.adm0_a3 === 'CAN');
const lakesAll = JSON.parse(fs.readFileSync('assets-src/maps/ne_50m_lakes.geojson', 'utf8')).features;

// --------------------------------------------------------------------------------------
// Pseudo-aleatorio deterministico (mulberry32)
const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const gauss = (rand) => {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ======================================================================================
// 1) CANADA — Lambert conforme conica (padrao do governo canadense: paralelos 49 e 77)
// ======================================================================================
const projCA = d3.geoConicConformal().parallels([49, 77]).rotate([96, 0]).precision(0.2);
projCA.fitExtent(
  [
    [250, 95],
    [1670, 985],
  ],
  CAN,
);
projCA.clipExtent([
  [-700, -500],
  [W + 700, H + 500],
]);
const pathCA = d3.geoPath(projCA).digits(1);

const MAJOR_LAKES = /^(Lake Superior|Lake Michigan|Lake Huron|Lake Erie|Lake Ontario|Great Bear Lake|Great Slave Lake|Lake Winnipeg|Lake Winnipegosis|Lake Manitoba|Lake Athabasca|Reindeer Lake|Lake Nipigon|Lake of the Woods|Lake Mistassini|Nettilling Lake|Smallwood Reservoir|Lake Champlain|Dubawnt Lake)$/;
const lakeFeats = lakesAll.filter((f) => {
  const [lon, lat] = d3.geoCentroid(f);
  return lon > -142 && lon < -52 && lat > 41 && lat < 84 && MAJOR_LAKES.test(f.properties.name ?? '');
});
const lakesD = lakeFeats.map((f) => pathCA(f)).join('');

// Recorta os lagos de dentro dos poligonos (Grandes Lagos, Great Bear, Great Slave...) para que
// apareca agua de verdade — inclusive dentro da tinta vermelha.
const ringArea = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return a / 2;
};
// d3-geo: anel externo em sentido horario (area < 0 com y=latitude para cima), buracos anti-horario.
const toD3 = (mp) => ({
  type: 'MultiPolygon',
  coordinates: mp.map((poly) =>
    poly.map((ring, k) => {
      const a = ringArea(ring);
      return (k === 0 ? a > 0 : a < 0) ? [...ring].reverse() : ring;
    }),
  ),
});
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const lakeMP = lakeFeats.flatMap((f) => polysOf(f.geometry));
const minusLakes = (feature) => {
  const geom = toD3(polygonClipping.difference(polysOf(feature.geometry), lakeMP));
  const area = d3.geoArea(geom);
  if (area > 2 * Math.PI) throw new Error('winding inverted for ' + (feature.properties?.name ?? feature.id));
  return geom;
};
const CAN_LAND = minusLakes(CAN);
const USA_LAND = minusLakes(USA);
console.log('canada area (km2, minus lakes)', Math.round(d3.geoArea(CAN_LAND) * 6371 * 6371));

const neighbours = countries.filter((f) => ['840', '304', '643', '352', '578'].includes(f.id));

const provOut = provinces.map((f) => {
  const p = f.properties;
  const name = p.name_en || p.name;
  return {
    id: p.postal || p.iso_3166_2,
    name,
    territory: ['Yukon', 'Northwest Territories', 'Nunavut'].includes(name),
    d: pathCA(minusLakes(f)),
    c: pathCA.centroid(f).map(R),
    areaKm2: Math.round(d3.geoArea(f) * 6371 * 6371),
  };
});
const terrArea = provOut.filter((p) => p.territory).reduce((a, p) => a + p.areaKm2, 0);
const allArea = provOut.reduce((a, p) => a + p.areaKm2, 0);

// Fronteira Canada–EUA (malha compartilhada). Separa o trecho sul (paralelo 49 / Grandes Lagos)
// do trecho do Alasca.
const border = topojson.mesh(world, world.objects.countries, (a, b) => (a.id === '124' && b.id === '840') || (a.id === '840' && b.id === '124'));
const lines = border.type === 'MultiLineString' ? border.coordinates : [border.coordinates];
const isAlaska = (line) => line.some(([lon, lat]) => lon < -129 && lat > 54.5);
const southLines = lines.filter((l) => !isAlaska(l));
const alaskaLines = lines.filter(isAlaska);
const southBorder = {type: 'MultiLineString', coordinates: southLines};
const alaskaBorder = {type: 'MultiLineString', coordinates: alaskaLines};

// largura da faixa de ~300 km (em px na projecao) — usada como traco grosso recortado pelo Canada
const pA = projCA([-96, 49]);
const pB = projCA([-96, 49 + 300 / 111.2]);
const band300Px = Math.hypot(pB[0] - pA[0], pB[1] - pA[1]);

// Circulo polar artico
const arcticCircle = {type: 'LineString', coordinates: range(-175, -5, 1).map((lon) => [lon, 66.5636])};
const parallel60 = {type: 'LineString', coordinates: range(-141, -60, 1).map((lon) => [lon, 60])};
const graticuleCA = d3.geoGraticule().step([10, 10]).extentMajor([
  [-170, 35],
  [-20, 80.01],
]);

// Cidades (para a populacao concentrada no sul)
const citiesSouth = [
  ['Vancouver', -123.12, 49.28, 2.6],
  ['Victoria', -123.37, 48.43, 0.4],
  ['Kelowna', -119.5, 49.89, 0.22],
  ['Calgary', -114.07, 51.05, 1.6],
  ['Edmonton', -113.49, 53.55, 1.5],
  ['Saskatoon', -106.67, 52.13, 0.33],
  ['Regina', -104.62, 50.45, 0.26],
  ['Winnipeg', -97.14, 49.9, 0.85],
  ['Thunder Bay', -89.25, 48.38, 0.12],
  ['Windsor', -83.03, 42.31, 0.42],
  ['London', -81.25, 42.98, 0.55],
  ['Kitchener', -80.49, 43.45, 0.6],
  ['Hamilton', -79.87, 43.26, 0.8],
  ['Toronto', -79.38, 43.65, 6.4],
  ['Sudbury', -80.99, 46.49, 0.17],
  ['Ottawa', -75.7, 45.42, 1.5],
  ['Montreal', -73.57, 45.5, 4.3],
  ['Sherbrooke', -71.89, 45.4, 0.22],
  ['Quebec City', -71.21, 46.81, 0.84],
  ['Saint John', -66.06, 45.27, 0.13],
  ['Moncton', -64.78, 46.09, 0.17],
  ['Halifax', -63.57, 44.65, 0.48],
  ['Charlottetown', -63.13, 46.24, 0.08],
  ["St. John's", -52.71, 47.56, 0.21],
];
const citiesNorth = [
  ['Whitehorse', -135.06, 60.72],
  ['Yellowknife', -114.37, 62.45],
  ['Iqaluit', -68.52, 63.75],
  ['Fort McMurray', -111.38, 56.73],
  ['Prince George', -122.75, 53.92],
  ['Thompson', -97.86, 55.74],
  ['Rankin Inlet', -92.08, 62.81],
  ['Inuvik', -133.72, 68.36],
  ['Cambridge Bay', -105.05, 69.12],
  ['Chibougamau', -74.37, 49.91],
  ['Kuujjuaq', -68.4, 58.1],
  ['Happy Valley-Goose Bay', -60.42, 53.3],
];

// Pontos de populacao: posicao inicial espalhada pelo pais, final concentrada no sul (90%).
const N_DOTS = 240;
const N_SOUTH = Math.round(N_DOTS * 0.9);
const rand = rng(20261108);
const inCanada = (lonlat) => d3.geoContains(CAN, lonlat);
const bbox = d3.geoBounds(CAN);
const dots = [];
const randomCanadaPoint = () => {
  for (let i = 0; i < 5000; i++) {
    const x = 250 + rand() * (1670 - 250);
    const y = 95 + rand() * (985 - 95);
    const ll = projCA.invert([x, y]);
    if (ll && ll[0] > bbox[0][0] && ll[0] < bbox[1][0] && inCanada(ll)) return [x, y];
  }
  throw new Error('no point');
};
const totalPop = citiesSouth.reduce((a, c) => a + Math.sqrt(c[3]), 0);
let assigned = 0;
const southTargets = [];
citiesSouth.forEach((c, i) => {
  const share = Math.sqrt(c[3]) / totalPop;
  const n = i === citiesSouth.length - 1 ? N_SOUTH - assigned : Math.max(1, Math.round(share * N_SOUTH));
  assigned += n;
  const spread = 0.35 + 0.25 * Math.sqrt(c[3]);
  for (let k = 0; k < n; k++) {
    for (let tries = 0; tries < 200; tries++) {
      const lon = c[1] + gauss(rand) * spread * 1.6;
      const lat = c[2] + gauss(rand) * spread * 0.55;
      if (inCanada([lon, lat])) {
        southTargets.push(projCA([lon, lat]));
        break;
      }
      if (tries === 199) southTargets.push(projCA([c[1], c[2]]));
    }
  }
});
const northTargets = [];
for (let k = 0; k < N_DOTS - N_SOUTH; k++) {
  const c = citiesNorth[k % citiesNorth.length];
  for (let tries = 0; tries < 200; tries++) {
    const lon = c[1] + gauss(rand) * 0.6;
    const lat = c[2] + gauss(rand) * 0.3;
    if (inCanada([lon, lat])) {
      northTargets.push(projCA([lon, lat]));
      break;
    }
    if (tries === 199) northTargets.push(projCA([c[1], c[2]]));
  }
}
const targets = [...southTargets.slice(0, N_SOUTH), ...northTargets];
// mistura deterministica para nao ter todos os "do norte" no fim
for (let i = targets.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [targets[i], targets[j]] = [targets[j], targets[i]];
}
for (let i = 0; i < N_DOTS; i++) {
  const start = randomCanadaPoint();
  const end = targets[i];
  dots.push({x0: R(start[0]), y0: R(start[1]), x1: R(end[0]), y1: R(end[1]), r: R(2.6 + rand() * 1.8)});
}

const ca = {
  canada: pathCA(CAN_LAND),
  canadaRaw: pathCA(CAN),
  canadaCentroid: pathCA.centroid(CAN).map(R),
  canadaBounds: pathCA.bounds(CAN).map((p) => p.map(R)),
  lakes: lakesD,
  usa: pathCA(USA_LAND),
  greenland: pathCA(GRL),
  otherLand: neighbours
    .filter((f) => !['840', '304'].includes(f.id))
    .map((f) => pathCA(f))
    .filter(Boolean)
    .join(''),
  provinces: provOut,
  territoriesShare: Math.round((terrArea / allArea) * 1000) / 10,
  southBorder: pathCA(southBorder),
  alaskaBorder: pathCA(alaskaBorder),
  band300Px: R(band300Px),
  arcticCircle: pathCA(arcticCircle),
  parallel60: pathCA(parallel60),
  graticule: pathCA(graticuleCA()),
  labels: {
    usa: projCA([-100, 41]).map(R),
    alaska: projCA([-152, 64.5]).map(R),
    greenland: projCA([-41, 73]).map(R),
    arctic: projCA([-96, 71.5]).map(R),
    border: projCA([-104, 49]).map(R),
    hudsonBay: projCA([-86, 59.5]).map(R),
  },
  cities: citiesSouth.map(([name, lon, lat, pop]) => ({name, pop, p: projCA([lon, lat]).map(R)})),
  dots,
};

// ======================================================================================
// 2) VISTA POLAR — Azimutal de areas iguais centrada no Polo Norte (compara areas reais)
// ======================================================================================
const POLAR_R = 500;
const projP = d3.geoAzimuthalEqualArea().rotate([96, -90, 0]).clipAngle(64).precision(0.2);
projP.fitExtent(
  [
    [W / 2 - POLAR_R, H / 2 - POLAR_R],
    [W / 2 + POLAR_R, H / 2 + POLAR_R],
  ],
  {type: 'Sphere'},
);
const pathP = d3.geoPath(projP).digits(1);
const polarCountries = countries
  .map((f) => ({id: f.id, name: f.properties.name, d: pathP(f), c: pathP.centroid(f).map(R)}))
  .filter((c) => c.d && c.d.length > 0);

// Passagem do Noroeste (rota principal aproximada: Baia de Baffin -> Lancaster Sound -> Barrow Strait
// -> Viscount Melville Sound -> M'Clure Strait -> Mar de Beaufort -> Ponta Barrow -> Estreito de Bering)
const nwPassage = {
  type: 'LineString',
  coordinates: [
    [-58.5, 69.5],
    [-66, 72.6],
    [-74, 73.9],
    [-80.5, 74.25],
    [-87, 74.35],
    [-92.5, 74.45],
    [-98.5, 74.35],
    [-104.5, 74.3],
    [-110, 74.4],
    [-115.5, 74.45],
    [-120.5, 74.2],
    [-125, 72.9],
    [-129.5, 71.9],
    [-136, 71.2],
    [-143, 70.7],
    [-150, 71.15],
    [-156.6, 71.6],
    [-162.5, 70.2],
    [-166.8, 68.3],
    [-168.6, 65.9],
  ],
};

const polar = {
  radius: POLAR_R,
  center: [W / 2, H / 2],
  sphere: pathP({type: 'Sphere'}),
  countries: polarCountries,
  graticule: pathP(d3.geoGraticule().step([30, 10])()),
  arcticCircle: pathP({type: 'LineString', coordinates: range(-180, 181, 1).map((lon) => [lon, 66.5636])}),
  nwPassage: pathP(nwPassage),
  pole: projP([0, 90]).map(R),
  labels: {
    canada: projP([-100, 62]).map(R),
    russia: projP([95, 64]).map(R),
    usa: projP([-152, 64]).map(R),
    greenland: projP([-41, 74]).map(R),
    nwPassage: projP([-104, 76.8]).map(R),
  },
  ids: {canada: '124', russia: '643', usa: '840', greenland: '304', norway: '578', denmark: '208', iceland: '352'},
};

fs.mkdirSync('src/data', {recursive: true});
fs.writeFileSync('src/data/maps.json', JSON.stringify({ca, polar}));
const kb = (s) => Math.round(Buffer.byteLength(s) / 1024);
console.log('maps.json', kb(JSON.stringify({ca, polar})), 'KB');
console.log('canada bounds', ca.canadaBounds, 'centroid', ca.canadaCentroid);
console.log('territories share of area', ca.territoriesShare, '%');
console.log('south border lines', southLines.length, 'alaska lines', alaskaLines.length, 'band300Px', ca.band300Px);
console.log('provinces', provOut.map((p) => `${p.id}:${p.name}`).join(', '));
console.log('polar canada label', polar.labels.canada, 'russia', polar.labels.russia, 'pole', polar.pole);
console.log('lakes', lakeFeats.map((f) => f.properties.name).filter(Boolean).join(', '));
