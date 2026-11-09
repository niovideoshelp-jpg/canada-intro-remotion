// Gera os dados de mapa das Partes 1, 2 e Final (ja projetados em coordenadas 1920x1080).
// Fonte: Natural Earth 1:50m (dominio publico) via world-atlas.
// Saida: src/data/maps2.json  (tipos e helpers em src/data/maps2.ts)
//
// As projecoes CA (conica conforme) e POLAR (azimutal de areas iguais) sao COPIADAS LITERALMENTE de
// scripts/build-maps.mjs: as camadas novas alinham pixel a pixel com src/data/maps.json (o script confere
// e aborta se divergir). Nova: WORLD (Equal Earth) para a escala mundial.
//
// Uso: node scripts/build-maps2.mjs        (DEBUG_MAPS2=1 grava dados de conferencia em assets-src/tmp-maps2/)
import fs from 'node:fs';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import polygonClipping from 'polygon-clipping';

const W = 1920;
const H = 1080;
const R = (n) => Math.round(n * 10) / 10;
const range = (a, b, step) => Array.from({length: Math.ceil((b - a) / step)}, (_, i) => a + i * step);
const DEBUG = !!process.env.DEBUG_MAPS2;
const t00 = Date.now();

const world = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json', 'utf8'));
const countries = topojson.feature(world, world.objects.countries).features;
const byId = (id) => countries.find((f) => f.id === id);
const CAN = byId('124');
const USA = byId('840');
const RUS = byId('643');
const GRL = byId('304');
if (!CAN || !USA || !RUS || !GRL) throw new Error('country ids not found');

// ======================================================================================
// Projecoes. CA e POLAR: copia literal de scripts/build-maps.mjs (NAO alterar).
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

// WORLD: Equal Earth (areas reais, aparencia "natural"), o globo inteiro com ~60 px de margem.
const WORLD_MARGIN = 60;
const projW = d3.geoEqualEarth().precision(0.2);
projW.fitExtent(
  [
    [WORLD_MARGIN, WORLD_MARGIN],
    [W - WORLD_MARGIN, H - WORLD_MARGIN],
  ],
  {type: 'Sphere'},
);
const pathW = d3.geoPath(projW).digits(1);

// Conferencia: as mesmas projecoes produzem exatamente as mesmas strings de src/data/maps.json.
const maps1 = JSON.parse(fs.readFileSync('src/data/maps.json', 'utf8'));
if (pathCA(CAN) !== maps1.ca.canadaRaw) throw new Error('CA projection differs from src/data/maps.json');
if (pathP(RUS) !== maps1.polar.countries.find((c) => c.id === '643')?.d) throw new Error('POLAR projection differs from src/data/maps.json');
console.log('alignment with maps.json: OK (CA canadaRaw and POLAR russia identical)');

// ======================================================================================
// Utilidades de geometria (coordenadas de tela)
// ======================================================================================
/** Pontos projetados (depois do recorte e da reamostragem do d3), um item por linha/anel. */
const capture = (proj, geo) => {
  const out = [];
  let cur = null;
  let poly = false;
  const sink = {
    point(x, y) {
      cur.push([x, y]);
    },
    lineStart() {
      cur = [];
    },
    lineEnd() {
      if (cur && cur.length > 1) out.push({pts: cur, closed: poly});
      cur = null;
    },
    polygonStart() {
      poly = true;
    },
    polygonEnd() {
      poly = false;
    },
    sphere() {},
  };
  d3.geoStream(geo, proj.stream(sink));
  return out;
};

const fmt = (n) => {
  const r = Math.round(n * 10) / 10;
  return r === 0 ? '0' : String(r);
};
const rp = (p) => [R(p[0]), R(p[1])];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Polilinha -> path SVG ("M x,yLx,y...", mesma convencao do d3), sem pontos repetidos apos arredondar. */
const ptsD = (pts, closed = false) => {
  let s = '';
  let last = '';
  for (const p of pts) {
    const c = fmt(p[0]) + ',' + fmt(p[1]);
    if (c === last) continue;
    s += (s ? 'L' : 'M') + c;
    last = c;
  }
  return s + (closed ? 'Z' : '');
};
const ringsD = (rings) => rings.map((r) => ptsD(r.pts, r.closed)).join('');

const polyLen = (pts, closed = false) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += dist(pts[i], pts[i - 1]);
  if (closed && pts.length > 2) L += dist(pts[pts.length - 1], pts[0]);
  return L;
};

/** Douglas-Peucker em px. */
const dpSimplify = (pts, tol) => {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a];
    const dx = pts[b][0] - ax;
    const dy = pts[b][1] - ay;
    const L2 = dx * dx + dy * dy;
    let maxD = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0] - ax;
      const py = pts[i][1] - ay;
      let d;
      if (L2 === 0) d = Math.hypot(px, py);
      else {
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L2));
        d = Math.hypot(px - t * dx, py - t * dy);
      }
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
};
const simplifyLine = (pts, tol, closed) => {
  if (!closed) return dpSimplify(pts, tol);
  let far = 0;
  let fd = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i], pts[0]);
    if (d > fd) {
      fd = d;
      far = i;
    }
  }
  const a = dpSimplify(pts.slice(0, far + 1), tol);
  const b = dpSimplify([...pts.slice(far), pts[0]], tol);
  return [...a, ...b.slice(1, -1)];
};

const cumLen = (pts) => {
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + dist(pts[i], pts[i - 1]));
  return s;
};
/** Reamostra uma polilinha com passo uniforme (px). */
const resample = (pts, step) => {
  const s = cumLen(pts);
  const L = s[s.length - 1];
  const n = Math.max(1, Math.round(L / step));
  const out = [];
  let k = 0;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * L;
    while (k < pts.length - 2 && s[k + 1] < t) k++;
    const u = (t - s[k]) / (s[k + 1] - s[k] || 1);
    out.push([pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u]);
  }
  return out;
};

/** Catmull-Rom centripeta pelos pontos de controle (curva suave que passa por eles). */
const crSpline = (P, closed = false, n = 24) => {
  const ext = (a, b) => [2 * a[0] - b[0], 2 * a[1] - b[1]];
  const Q = closed ? [P[P.length - 1], ...P, P[0], P[1]] : [ext(P[0], P[1]), ...P, ext(P[P.length - 1], P[P.length - 2])];
  const out = [];
  const lerp2 = (a, b, ta, tb, t) => {
    const u = tb === ta ? 0 : (t - ta) / (tb - ta);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  };
  for (let i = 1; i < Q.length - 2; i++) {
    const [p0, p1, p2, p3] = [Q[i - 1], Q[i], Q[i + 1], Q[i + 2]];
    const t0 = 0;
    const t1 = t0 + Math.max(1e-6, Math.sqrt(dist(p0, p1)));
    const t2 = t1 + Math.max(1e-6, Math.sqrt(dist(p1, p2)));
    const t3 = t2 + Math.max(1e-6, Math.sqrt(dist(p2, p3)));
    for (let k = 0; k < n; k++) {
      const t = t1 + ((t2 - t1) * k) / n;
      const A1 = lerp2(p0, p1, t0, t1, t);
      const A2 = lerp2(p1, p2, t1, t2, t);
      const A3 = lerp2(p2, p3, t2, t3, t);
      const B1 = lerp2(A1, A2, t0, t2, t);
      const B2 = lerp2(A2, A3, t1, t3, t);
      out.push(lerp2(B1, B2, t1, t2, t));
    }
  }
  out.push(closed ? [...out[0]] : [...P[P.length - 1]]);
  return out;
};

/** Desloca uma polilinha suave perpendicularmente (px; positivo = a direita do sentido de marcha). */
const offsetLine = (pts, off) =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    return [p[0] - (dy / L) * off, p[1] + (dx / L) * off];
  });

/** Fracao do comprimento total ocupada pelo MAIOR subcaminho (o Chrome reinicia o tracejado a cada "M";
 * desenhar com DrawSVG ate essa fracao faz o maior contorno terminar no fim da animacao). Igual a do Intro. */
const longestFrac = (lens) => {
  const total = lens.reduce((a, b) => a + b, 0);
  return Math.round((Math.max(...lens) / total) * 10000) / 10000;
};

/** Track (rota/trajetoria): path + polilinha para mover icones ao longo dela. */
const track = (pts, extra = {}) => {
  const rpts = [];
  for (const p of pts) {
    const q = rp(p);
    const last = rpts[rpts.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) rpts.push(q);
  }
  return {...extra, d: ptsD(rpts), pts: rpts};
};

// ======================================================================================
// Roteador de canais: menor caminho "pelo meio da agua" num raster de terra (para rotas que nao
// cruzam terra na resolucao 1:50m), depois suavizado de forma adaptativa (mais suave em mar aberto,
// fiel ao canal nos estreitos).
// ======================================================================================
const makeField = (rings, x0, y0, x1, y1, res) => {
  const w = Math.ceil((x1 - x0) * res);
  const h = Math.ceil((y1 - y0) * res);
  const land = new Uint8Array(w * h);
  const rows = Array.from({length: h}, () => []);
  const cx = (x) => (x - x0) * res - 0.5;
  const cy = (y) => (y - y0) * res - 0.5;
  for (const ring of rings) {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      const ya = cy(a[1]);
      const yb = cy(b[1]);
      if (ya === yb) continue;
      const lo = Math.max(0, Math.ceil(Math.min(ya, yb)));
      const hi = Math.min(h - 1, Math.ceil(Math.max(ya, yb)) - 1);
      const xa = cx(a[0]);
      const xb = cx(b[0]);
      for (let j = lo; j <= hi; j++) rows[j].push(xa + ((j - ya) / (yb - ya)) * (xb - xa));
    }
  }
  for (let j = 0; j < h; j++) {
    const xs = rows[j].sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const lo = Math.max(0, Math.ceil(xs[k]));
      const hi = Math.min(w - 1, Math.floor(xs[k + 1]));
      for (let i = lo; i <= hi; i++) land[j * w + i] ^= 1;
    }
  }
  // transformada de distancia euclidiana exata (Felzenszwalb & Huttenlocher)
  const INF = 1e20;
  const N = Math.max(w, h);
  const f = new Float64Array(N);
  const dd = new Float64Array(N);
  const v = new Int32Array(N);
  const z = new Float64Array(N + 1);
  const edt1 = (n) => {
    let k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) {
        k--;
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      }
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) {
      while (z[k + 1] < q) k++;
      dd[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
    }
  };
  const d2 = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) d2[i] = land[i] ? 0 : INF;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) f[j] = d2[j * w + i];
    edt1(h);
    for (let j = 0; j < h; j++) d2[j * w + i] = dd[j];
  }
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) f[i] = d2[j * w + i];
    edt1(w);
    for (let i = 0; i < w; i++) d2[j * w + i] = dd[i];
  }
  const clear = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) clear[i] = land[i] ? -0.5 / res : (Math.sqrt(d2[i]) - 0.5) / res;
  /** folga (px) ate a terra mais proxima, interpolada; negativa = terra */
  const at = (x, y) => {
    const fx = cx(x);
    const fy = cy(y);
    const i = Math.max(0, Math.min(w - 2, Math.floor(fx)));
    const j = Math.max(0, Math.min(h - 2, Math.floor(fy)));
    const tx = Math.min(1, Math.max(0, fx - i));
    const ty = Math.min(1, Math.max(0, fy - j));
    const c = (ii, jj) => clear[jj * w + ii];
    return (c(i, j) * (1 - tx) + c(i + 1, j) * tx) * (1 - ty) + (c(i, j + 1) * (1 - tx) + c(i + 1, j + 1) * tx) * ty;
  };
  return {w, h, x0, y0, res, clear, at};
};

const astar = (F, from, to, costOf) => {
  const {w, h, res, x0, y0} = F;
  const cell = (p) => [Math.max(0, Math.min(w - 1, Math.round((p[0] - x0) * res - 0.5))), Math.max(0, Math.min(h - 1, Math.round((p[1] - y0) * res - 0.5)))];
  const [si, sj] = cell(from);
  const [ti, tj] = cell(to);
  const NN = w * h;
  const g = new Float64Array(NN).fill(Infinity);
  const prev = new Int32Array(NN).fill(-1);
  const closed = new Uint8Array(NN);
  let hf = new Float64Array(1 << 16);
  let hi = new Int32Array(1 << 16);
  let hn = 0;
  const push = (fv, idx) => {
    if (hn >= hf.length) {
      const nf = new Float64Array(hf.length * 2);
      nf.set(hf);
      hf = nf;
      const ni = new Int32Array(hi.length * 2);
      ni.set(hi);
      hi = ni;
    }
    let k = hn++;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (hf[p] <= fv) break;
      hf[k] = hf[p];
      hi[k] = hi[p];
      k = p;
    }
    hf[k] = fv;
    hi[k] = idx;
  };
  const pop = () => {
    const top = hi[0];
    const lf = hf[--hn];
    const li = hi[hn];
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= hn) break;
      if (c + 1 < hn && hf[c + 1] < hf[c]) c++;
      if (hf[c] >= lf) break;
      hf[k] = hf[c];
      hi[k] = hi[c];
      k = c;
    }
    hf[k] = lf;
    hi[k] = li;
    return top;
  };
  const hcost = (i, j) => Math.hypot(i - ti, j - tj) / res;
  const s = sj * w + si;
  const target = tj * w + ti;
  g[s] = 0;
  push(hcost(si, sj), s);
  const nb = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
  ];
  while (hn > 0) {
    const cur = pop();
    if (closed[cur]) continue;
    closed[cur] = 1;
    if (cur === target) break;
    const ci = cur % w;
    const cj = (cur - ci) / w;
    const cc = costOf(F.clear[cur]);
    for (const [di, dj, len] of nb) {
      const ni = ci + di;
      const nj = cj + dj;
      if (ni < 0 || nj < 0 || ni >= w || nj >= h) continue;
      const n = nj * w + ni;
      if (closed[n]) continue;
      const ng = g[cur] + (len / res) * 0.5 * (cc + costOf(F.clear[n]));
      if (ng < g[n]) {
        g[n] = ng;
        prev[n] = cur;
        push(ng + hcost(ni, nj), n);
      }
    }
  }
  const out = [];
  for (let c = target; c !== -1; c = prev[c]) {
    const i = c % w;
    out.push([x0 + (i + 0.5) / res, y0 + ((c - i) / w + 0.5) / res]);
  }
  out.reverse();
  out[0] = [...from];
  out[out.length - 1] = [...to];
  return out;
};

/** Suavizacao gaussiana com sigma proporcional a largura local do canal (folga). */
const smoothAdaptive = (F, raw, {gain = 0.9, maxSigma = 14, minSigma = 0.4, step = 0.5} = {}) => {
  const pts = resample(raw, step);
  const s = cumLen(pts);
  const L = s[s.length - 1];
  const scale = new Float64Array(pts.length).fill(1);
  for (let pass = 0; pass < 10; pass++) {
    const sig = pts.map((p, i) => Math.max(minSigma, Math.min(maxSigma, gain * Math.max(0, F.at(p[0], p[1])), s[i] / 2.5, (L - s[i]) / 2.5)) * scale[i]);
    const out = pts.map((p, i) => {
      const sg = sig[i];
      if (sg < step * 0.5) return p;
      const span = Math.ceil((3 * sg) / step);
      let ax = 0;
      let ay = 0;
      let aw = 0;
      for (let j = Math.max(0, i - span); j <= Math.min(pts.length - 1, i + span); j++) {
        const q = s[j] - s[i];
        const wt = Math.exp(-(q * q) / (2 * sg * sg));
        ax += wt * pts[j][0];
        ay += wt * pts[j][1];
        aw += wt;
      }
      return [ax / aw, ay / aw];
    });
    let bad = 0;
    out.forEach((p, i) => {
      if (F.at(p[0], p[1]) < Math.min(0.35, F.at(pts[i][0], pts[i][1]) * 0.6)) {
        bad++;
        for (let j = Math.max(0, i - 40); j <= Math.min(pts.length - 1, i + 40); j++) scale[j] *= 0.6;
      }
    });
    if (!bad) return out;
  }
  return pts;
};

/** Ponto de maior folga num raio r (px) em volta de p (coloca o "portao" no meio do canal). */
const snapToChannel = (F, p, r) => {
  if (!r) return p;
  let best = p;
  let bc = F.at(p[0], p[1]);
  for (let dy = -r; dy <= r; dy += 0.25) {
    for (let dx = -r; dx <= r; dx += 0.25) {
      if (dx * dx + dy * dy > r * r) continue;
      const c = F.at(p[0] + dx, p[1] + dy);
      if (c > bc + 1e-6) {
        bc = c;
        best = [p[0] + dx, p[1] + dy];
      }
    }
  }
  return best;
};

const channelCost = (c) => (c < 0 ? 4000 : 1 + 10 / (c + 0.6));

/** Rota pela agua passando pelos portoes [ [lon,lat], raioDeAjuste ] em sequencia. */
const waterRoute = (F, proj, gates, name) => {
  const gp = gates.map(([ll, r]) => snapToChannel(F, proj(ll), r));
  gp.forEach((p, i) => {
    if (F.at(p[0], p[1]) < 0) throw new Error(`${name}: gate ${i} ${gates[i][0]} is on land`);
  });
  let raw = [];
  for (let i = 0; i + 1 < gp.length; i++) {
    const seg = astar(F, gp[i], gp[i + 1], channelCost);
    raw = raw.concat(i ? seg.slice(1) : seg);
  }
  const sm = smoothAdaptive(F, raw);
  let minC = Infinity;
  let at = null;
  for (const p of resample(sm, 0.25)) {
    const c = F.at(p[0], p[1]);
    if (c < minC) {
      minC = c;
      at = p;
    }
  }
  if (minC < 0) throw new Error(`${name}: route touches land at ${at.map(R)}`);
  console.log(`  route ${name}: ${R(polyLen(sm))} px, min clearance ${minC.toFixed(2)} px at ${at.map(R).join(',')}`);
  return {pts: resample(sm, 2), raw, minClear: minC};
};

// Rings projetados de terra (para rasters de agua)
const landRings = (proj, feats) => feats.flatMap((f) => capture(proj, f)).map((r) => r.pts);

// ======================================================================================
// 1) CA2 — sobre o mapa do Canada (mesma projecao/enquadramento de CA)
// ======================================================================================
console.log('CA2');
const ll2ca = (ll) => projCA(ll);

// ---- 1a) Costa artica (sem fronteiras terrestres): arcos exteriores do Canada ao norte de 60N
const ARCTIC_LAT = 60;
const coastMesh = topojson.mesh(world, world.objects.countries, (a, b) => a === b && a.id === '124');
const coastLines = coastMesh.type === 'MultiLineString' ? coastMesh.coordinates : [coastMesh.coordinates];
const cutNorth = (lines, lat0) => {
  const out = [];
  for (let line of lines) {
    const closedRing = line.length > 3 && line[0][0] === line[line.length - 1][0] && line[0][1] === line[line.length - 1][1];
    if (closedRing && line.every((p) => p[1] >= lat0)) {
      out.push({pts: line, ring: true});
      continue;
    }
    if (closedRing) {
      // comeca num ponto ao sul do corte para nao partir um trecho ao meio
      const k = line.findIndex((p) => p[1] < lat0);
      if (k < 0) continue;
      line = [...line.slice(k, -1), ...line.slice(0, k + 1)];
    }
    let cur = [];
    for (let i = 0; i < line.length; i++) {
      const p = line[i];
      const inside = p[1] >= lat0;
      if (i > 0) {
        const q = line[i - 1];
        if (inside !== q[1] >= lat0) {
          const t = (lat0 - q[1]) / (p[1] - q[1]);
          const x = [q[0] + t * (p[0] - q[0]), lat0];
          if (inside) cur = [x];
          else {
            cur.push(x);
            out.push({pts: cur, ring: false});
            cur = [];
          }
        }
      }
      if (inside) cur.push(p);
    }
    if (cur.length > 1) out.push({pts: cur, ring: false});
  }
  return out;
};
const arcticPieces = cutNorth(coastLines, ARCTIC_LAT)
  .map((piece) => {
    const geo = {type: 'LineString', coordinates: piece.pts};
    const got = capture(projCA, geo);
    const pts = got.flatMap((g, i) => (i ? g.pts.slice(1) : g.pts));
    if (piece.ring && pts.length > 2 && dist(pts[0], pts[pts.length - 1]) < 0.05) pts.pop();
    return {pts, closed: piece.ring};
  })
  .filter((r) => r.pts.length > 1 && polyLen(r.pts, r.closed) >= 1.2);
// costa continental (o maior trecho aberto) desenhada de oeste para leste
arcticPieces.sort((a, b) => polyLen(b.pts, b.closed) - polyLen(a.pts, a.closed));
for (const r of arcticPieces) {
  if (!r.closed && r.pts[0][0] > r.pts[r.pts.length - 1][0]) r.pts.reverse();
}
// arredonda (0,1 px) e remove pontos repetidos ANTES de medir (comprimentos iguais aos do path)
const arcticRounded = arcticPieces.map((r) => {
  let pts = [];
  for (const p of r.pts) {
    const q = rp(p);
    const last = pts[pts.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) pts.push(q);
  }
  if (r.closed) {
    // ilhas: o traco comeca no ponto mais a oeste (a costa "corre" de oeste para leste)
    if (dist(pts[0], pts[pts.length - 1]) < 0.05) pts.pop();
    let k = 0;
    pts.forEach((q, i) => {
      if (q[0] < pts[k][0]) k = i;
    });
    pts = [...pts.slice(k), ...pts.slice(0, k)];
  }
  return {pts, closed: r.closed};
});
const arcticCoast = ringsD(arcticRounded);
const arcticLens = arcticRounded.map((r) => polyLen(r.pts, r.closed));
const arcticBounds = (() => {
  const xs = arcticRounded.flatMap((r) => r.pts.map((p) => p[0]));
  const ys = arcticRounded.flatMap((r) => r.pts.map((p) => p[1]));
  return [
    [R(Math.min(...xs)), R(Math.min(...ys))],
    [R(Math.max(...xs)), R(Math.max(...ys))],
  ];
})();
console.log(`  arcticCoast: ${arcticRounded.length} subpaths, ${R(arcticLens.reduce((a, b) => a + b, 0))} px, drawFrac ${longestFrac(arcticLens)}, ${Math.round(arcticCoast.length / 1024)} KB`);

// ---- Terra projetada (Canada + vizinhos) para rasters e "encaixe" de pontos no litoral
const caLandRings = landRings(projCA, [CAN, USA, GRL]);
const canRingsCA = capture(projCA, CAN).map((r) => r.pts);
const onLandCAN = (ll) => d3.geoContains(CAN, ll);
/** Leva um ponto (lon,lat) para a terra do Canada na resolucao 1:50m (ponto mais proximo da costa + ~0,7 px para dentro). */
const snapToCanadaLand = (ll, inland = 0.7) => {
  const p = ll2ca(ll);
  if (onLandCAN(ll)) return {p, moved: 0};
  let best = null;
  let bd = Infinity;
  for (const ring of canRingsCA) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const L2 = dx * dx + dy * dy || 1e-9;
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2));
      const q = [a[0] + t * dx, a[1] + t * dy];
      const d = dist(p, q);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
  }
  const ux = (best[0] - p[0]) / (bd || 1);
  const uy = (best[1] - p[1]) / (bd || 1);
  for (let k = 1; k <= 12; k++) {
    const q = [best[0] + ux * inland * (k / 3), best[1] + uy * inland * (k / 3)];
    if (onLandCAN(projCA.invert(q)) && k >= 3) return {p: q, moved: bd};
  }
  return {p: best, moved: bd};
};

// ---- 1b) North Warning System: 47 sitios (11 de longo alcance), oeste -> leste
// Locais conhecidos (DEW/NWS); os demais sao distribuidos ao longo da linha nos maiores vazios.
const NWS_KNOWN = [
  ['Komakuk Beach', -140.18, 69.59, true],
  ['Stokes Point', -138.74, 69.33, false],
  ['Shingle Point', -137.25, 68.93, false],
  ['Tuktoyaktuk', -133.03, 69.44, true],
  ['Nicholson Peninsula', -128.97, 69.93, false],
  ['Cape Parry', -124.69, 70.17, true],
  ['Clinton Point', -120.8, 69.58, false],
  ['Cape Young', -116.92, 68.94, false],
  ['Lady Franklin Point', -113.22, 68.48, true],
  ['Byron Bay', -109.07, 68.75, false],
  ['Cambridge Bay', -105.12, 69.11, true],
  ['Jenny Lind Island', -101.73, 68.65, false],
  ['Gladman Point', -97.8, 68.67, false],
  ['Shepherd Bay', -93.43, 68.82, true],
  ['Pelly Bay', -89.8, 68.53, false],
  ['Mackar Inlet', -85.67, 68.3, false],
  ['Hall Beach', -81.24, 68.78, true],
  ['Longstaff Bluff', -75.14, 68.9, false],
  ['Dewar Lakes', -71.17, 68.65, true],
  ['Cape Hooper', -66.82, 68.47, false],
  ['Broughton Island', -64.03, 67.54, false],
  ['Cape Dyer', -61.35, 66.66, true],
  ['Brevoort Island', -64.15, 63.33, true],
  ['Resolution Island', -64.65, 61.6, false],
  ['Cape Kakkiviak', -64.17, 59.98, false],
  ['Saglek', -62.65, 58.48, true],
  ['Cape Kiglapait', -61.4, 57.1, false],
  ['', -57.05, 53.72, false], // fim da linha na latitude de Goose Bay (costa de Cartwright)
];
const NWS_TOTAL = 47;
if (NWS_KNOWN.filter((s) => s[3]).length !== 11) throw new Error('NWS: expected 11 long-range sites');
// insere os pontos que faltam: sempre no vao (em km) mais longo entre vizinhos
const nwsList = NWS_KNOWN.map(([name, lon, lat, lrr]) => ({name, ll: [lon, lat], lrr, fill: !name}));
const gapKm = (a, b) => d3.geoDistance(a.ll, b.ll) * 6371;
while (nwsList.length < NWS_TOTAL) {
  // o maior vao atual (em km) recebe um ponto no meio; repete ate completar 47
  let bi = 0;
  let bv = -1;
  for (let i = 0; i + 1 < nwsList.length; i++) {
    const v = gapKm(nwsList[i], nwsList[i + 1]);
    if (v > bv) {
      bv = v;
      bi = i;
    }
  }
  const mid = d3.geoInterpolate(nwsList[bi].ll, nwsList[bi + 1].ll)(0.5);
  nwsList.splice(bi + 1, 0, {name: '', ll: mid, lrr: false, fill: true});
}
const nws = nwsList.map((s) => {
  const {p, moved} = snapToCanadaLand(s.ll);
  if (moved > 6) console.log(`  NWS #${nwsList.indexOf(s) + 1} ${s.name || "(fill)"} moved ${R(moved)} px to reach land`);
  const out = {p: rp(p), lrr: s.lrr};
  if (s.name) out.name = s.name;
  return out;
});
console.log(`  nws: ${nws.length} sites, ${nws.filter((s) => s.lrr).length} long-range`);
const nwsLine = ptsD(nws.map((s) => s.p));

// ---- 1c) Lugares (pontos projetados; podem cair fora de 0..1920 x 0..1080)
const PLACES = [
  ['Alert', -62.35, 82.5],
  ['Eureka', -85.94, 79.99],
  ['Resolute', -94.83, 74.7],
  ['Nanisivik', -84.55, 73.07],
  ['Arctic Bay', -85.15, 73.04],
  ['Pond Inlet', -77.96, 72.7],
  ['Iqaluit', -68.52, 63.75],
  ['Rankin Inlet', -92.08, 62.81],
  ['Cambridge Bay', -105.06, 69.12],
  ['Kugluktuk', -115.1, 67.83],
  ['Inuvik', -133.72, 68.36],
  ['Tuktoyaktuk', -133.03, 69.44],
  ['Yellowknife', -114.37, 62.45],
  ['Whitehorse', -135.06, 60.72],
  ['Goose Bay', -60.42, 53.32],
  ['Kuujjuaq', -68.4, 58.1],
  ['Hall Beach', -81.24, 68.78],
  ['Igloolik', -81.8, 69.38],
  ['Ottawa', -75.7, 45.42],
  ['Vancouver', -123.12, 49.28],
  ['Halifax', -63.57, 44.65],
  ['Esquimalt', -123.42, 48.43],
  ['Greenwood', -64.92, 44.98],
  ['Comox', -124.89, 49.71],
  ['Cold Lake', -110.28, 54.41],
  ['Bagotville', -71.0, 48.33],
  ['Winnipeg', -97.14, 49.9],
  ['Edmonton', -113.49, 53.55],
  ['Washington DC', -77.04, 38.91],
  ['Colorado Springs', -104.82, 38.83],
  ['Luke AFB', -112.38, 33.54],
  ['Anchorage', -149.81, 61.25],
  ['Fairbanks', -147.1, 64.67],
];
const place = ([name, lon, lat]) => ({name, p: rp(ll2ca([lon, lat])), ll: [lon, lat]});
const places = PLACES.map(place);

// Comunidades do norte (para "pessoas espalhadas por ~25 comunidades", nuvens de pontos etc.)
const COMMUNITIES = [
  ['Old Crow', -139.83, 67.57],
  ['Aklavik', -135.01, 68.22],
  ['Inuvik', -133.72, 68.36],
  ['Tuktoyaktuk', -133.03, 69.44],
  ['Sachs Harbour', -125.25, 71.99],
  ['Paulatuk', -124.07, 69.35],
  ['Ulukhaktok', -117.77, 70.74],
  ['Norman Wells', -126.83, 65.28],
  ['Kugluktuk', -115.1, 67.83],
  ['Cambridge Bay', -105.06, 69.12],
  ['Gjoa Haven', -95.88, 68.63],
  ['Taloyoak', -93.53, 69.54],
  ['Kugaaruk', -89.82, 68.53],
  ['Baker Lake', -96.03, 64.32],
  ['Rankin Inlet', -92.08, 62.81],
  ['Arviat', -94.06, 61.11],
  ['Chesterfield Inlet', -90.71, 63.34],
  ['Naujaat', -86.23, 66.52],
  ['Coral Harbour', -83.17, 64.14],
  ['Igloolik', -81.8, 69.38],
  ['Hall Beach', -81.24, 68.78],
  ['Arctic Bay', -85.15, 73.04],
  ['Resolute', -94.83, 74.7],
  ['Grise Fiord', -82.9, 76.42],
  ['Pond Inlet', -77.96, 72.7],
  ['Clyde River', -68.59, 70.47],
  ['Qikiqtarjuaq', -64.03, 67.55],
  ['Pangnirtung', -65.71, 66.15],
  ['Iqaluit', -68.52, 63.75],
  ['Kimmirut', -69.88, 62.85],
  ['Kinngait', -76.54, 64.23],
  ['Salluit', -75.64, 62.2],
  ['Kuujjuaq', -68.4, 58.1],
  ['Nain', -61.69, 56.54],
  ['Yellowknife', -114.37, 62.45],
  ['Whitehorse', -135.06, 60.72],
];
const communities = COMMUNITIES.map(place);

// Rotulos de mares, estreitos e terras (pontos de ancoragem; texto a criterio da cena)
const LABELS = [
  ['Beaufort Sea', -139, 72.6],
  ['Arctic Ocean', -110, 81.2],
  ['Baffin Bay', -66.5, 73.6],
  ['Davis Strait', -58.5, 66.6],
  ['Labrador Sea', -55.5, 59.5],
  ['Hudson Bay', -86, 59.5],
  ['Hudson Strait', -70.5, 62.0],
  ['Foxe Basin', -78.5, 67.0],
  ['Lancaster Sound', -84.5, 74.15],
  ['Viscount Melville Sound', -108, 74.0],
  ["M'Clure Strait", -119, 74.75],
  ['Amundsen Gulf', -123.6, 70.6],
  ['Queen Maud Gulf', -101.5, 68.35],
  ['Nares Strait', -68.5, 80.0],
  ['Baffin Island', -71, 69.5],
  ['Ellesmere Island', -79, 80.0],
  ['Victoria Island', -110, 71.0],
  ['Banks Island', -121.5, 73.0],
  ['Devon Island', -87.5, 75.3],
  ['Yukon', -136, 63.5],
  ['Northwest Territories', -119, 64.5],
  ['Nunavut', -95, 66.0],
  ['Labrador', -61.5, 53.8],
  ['Nunavik', -73.5, 58.0],
];
const caLabels = LABELS.map(([name, lon, lat]) => ({name, p: rp(ll2ca([lon, lat]))}));

// ---- 1d) Rotas da Passagem do Noroeste (pela agua, na resolucao 1:50m)
const caField = makeField(caLandRings, 570, 215, 1080, 465, 4);
const G = {
  baffin: [[-68.5, 74.0], 0],
  lancaster: [[-84, 74.15], 5],
  barrow: [[-93.5, 74.3], 4],
  viscount: [[-107, 73.9], 6],
  mclure: [[-118, 74.8], 4],
  mclureW: [[-128.3, 73.65], 3],
  princeWales: [[-118.164, 72.763], 1],
  amundsen: [[-123, 70.6], 5],
  peel: [[-96.5, 73.0], 2],
  franklin: [[-97.087, 71.603], 2],
  jamesRoss: [[-96.6, 69.75], 2],
  rae: [[-95.4, 68.9], 1.5],
  simpson: [[-97.586, 68.519], 0.6],
  queenMaud: [[-101.5, 68.3], 5],
  beaufort: [[-139, 71.2], 0],
};
const NWP_DEFS = [
  {
    id: 'northern',
    name: "Northern route (Lancaster Sound - Barrow Strait - Viscount Melville Sound - M'Clure Strait)",
    gates: ['baffin', 'lancaster', 'barrow', 'viscount', 'mclure', 'mclureW', 'beaufort'],
  },
  {
    id: 'princeOfWales',
    name: 'Prince of Wales Strait variant (Viscount Melville Sound - Prince of Wales Strait - Amundsen Gulf)',
    gates: ['baffin', 'lancaster', 'barrow', 'viscount', 'princeWales', 'amundsen', 'beaufort'],
  },
  {
    id: 'southern',
    name: 'Southern / Amundsen route (Peel Sound - Franklin Strait - James Ross and Rae straits - Simpson Strait - Queen Maud Gulf - Dease Strait - Coronation Gulf - Dolphin and Union Strait - Amundsen Gulf)',
    gates: ['baffin', 'lancaster', 'barrow', 'peel', 'franklin', 'jamesRoss', 'rae', 'simpson', 'queenMaud', 'amundsen', 'beaufort'],
  },
];
const nwpRoutes = NWP_DEFS.map((r) => {
  const res = waterRoute(caField, ll2ca, r.gates.map((k) => G[k]), r.id);
  return track(res.pts, {id: r.id, name: r.name});
});

// ---- 1d') Rota maritima Halifax -> arquipelago (navios que usam o alcance em vez de uma base): pelo
// Atlantico a leste da Terra Nova, mar do Labrador, estreito de Davis, baia de Baffin e Lancaster Sound.
const eastField = makeField(landRings(projCA, countries.filter((f) => ['124', '840', '304', '666'].includes(f.id))), 860, 255, 1545, 845, 2);
const halifaxRes = waterRoute(
  eastField,
  ll2ca,
  [
    [[-63.5, 44.55], 0], // porto de Halifax
    [[-60.5, 44.0], 3],
    [[-52.3, 46.3], 3], // ao largo do cabo Race
    [[-50.5, 50.0], 4],
    [[-54.5, 55.5], 5], // mar do Labrador
    [[-58.5, 63.0], 5], // estreito de Davis
    [[-63.0, 70.5], 5], // baia de Baffin
    [[-72.0, 74.0], 4],
    [[-84.0, 74.15], 5], // Lancaster Sound
    [[-94.5, 74.45], 2], // Barrow Strait, ao largo de Resolute
  ],
  'halifaxToResolute',
);
const seaLanes = {
  halifaxToResolute: track(halifaxRes.pts, {
    id: 'halifaxToResolute',
    name: 'Halifax - Atlantic (east of Newfoundland) - Labrador Sea - Davis Strait - Baffin Bay - Lancaster Sound - Resolute',
  }),
};

// ---- 1e) Aguas entre as ilhas ("aguas internas"): area das linhas de base retas de 1986, menos a terra.
// Vertices aproximados nos cabos externos do arquipelago; o lado sul passa POR TERRA (continente,
// peninsula de Melville, ilha de Baffin), entao so a agua dentro das linhas de base fica.
const BASELINE = [
  [-128.1, 70.62], // Cape Bathurst (continente)
  [-122.8, 71.08], // Nelson Head (Banks)
  [-125.9, 71.97], // Cape Kellett
  [-125.6, 73.2],
  [-124.75, 74.35], // NW de Banks
  [-122.95, 76.35], // Land's End (Prince Patrick)
  [-119.6, 77.35],
  [-114.4, 77.97], // Brock
  [-110.6, 78.85], // Borden
  [-102.3, 79.45], // Ellef Ringnes
  [-99.3, 80.2], // Meighen
  [-93.8, 81.42], // Cape Stallworthy (Axel Heiberg)
  [-86.0, 82.35],
  [-77.5, 83.1],
  [-70.0, 83.15], // Cape Columbia (Ellesmere)
  [-62.5, 82.75],
  [-60.8, 82.3], // perto de Alert
  [-64.0, 81.65],
  [-68.5, 80.85],
  [-71.2, 79.85],
  [-73.8, 78.85],
  [-75.1, 78.15], // Smith Sound
  [-76.6, 77.05],
  [-78.6, 76.25],
  [-79.4, 75.9], // Coburg
  [-80.1, 75.6], // NE de Devon
  [-80.25, 74.6], // Cape Sherard (Devon)
  [-77.95, 73.65], // Bylot (boca do Lancaster Sound)
  // daqui em diante por terra: Bylot -> Baffin -> estreito de Fury e Hecla -> Melville -> istmo de Rae -> continente
  [-79.0, 72.9],
  [-80.5, 71.6],
  [-82.4, 70.4],
  [-82.7, 69.6],
  [-84.6, 68.2],
  [-86.6, 67.3],
  [-90.0, 67.0],
  [-95.0, 66.7],
  [-100.0, 66.6],
  [-106.0, 66.3],
  [-112.0, 67.0],
  [-117.5, 67.6],
  [-121.5, 68.6],
  [-125.6, 69.0],
  [-127.7, 69.9],
];
const closeRing = (ring) => [...ring, ring[0]];
const landMP = [CAN, GRL].flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates));
const ringArea = (ring) => {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return a / 2;
};
// d3-geo: anel externo em sentido horario (area < 0 com y=latitude para cima), buracos anti-horario
const toD3 = (mp) => ({
  type: 'MultiPolygon',
  coordinates: mp.map((poly) =>
    poly.map((ring, k) => {
      const a = ringArea(ring);
      return (k === 0 ? a > 0 : a < 0) ? [...ring].reverse() : ring;
    }),
  ),
});
const channelsGeo = toD3(polygonClipping.difference([[closeRing(BASELINE)]], landMP));
if (d3.geoArea(channelsGeo) > 2 * Math.PI) throw new Error('channels: winding inverted');
const channels = pathCA(channelsGeo);
console.log(`  channels: ${channelsGeo.coordinates.length} water polygons, ${Math.round(d3.geoArea(channelsGeo) * 6371 * 6371)} km2, ${Math.round(channels.length / 1024)} KB`);
const channelsLabel = rp(ll2ca([-104, 74.4]));

// ---- 1f) Regioes: "northern approaches" (Beaufort, Baffin Bay, Davis Strait/Labrador Sea) e "high Arctic"
const softRegion = (name, ctrl, c) => {
  const pts = crSpline(ctrl.map(ll2ca), true, 16);
  // conferencia: quanto do contorno passa sobre terra (deve ser ~0 para os mares)
  const samples = resample(pts, 3);
  const onLand = samples.filter((p) => [CAN, USA, GRL].some((f) => d3.geoContains(f, projCA.invert(p))));
  const eg = onLand.slice(0, 4).map((p) => projCA.invert(p).map((n) => n.toFixed(1)).join(','));
  console.log(`  region ${name}: ${onLand.length}/${samples.length} outline samples over land${eg.length ? ' e.g. ' + eg.join(' | ') : ''}`);
  return {name, c: rp(ll2ca(c)), d: ptsD(pts.slice(0, -1), true)};
};
const northernApproaches = [
  softRegion(
    'Beaufort Sea',
    [
      [-154.5, 72.4],
      [-150, 71.5],
      [-144, 70.75],
      [-138, 70.15],
      [-133.2, 70.2],
      [-129.4, 71.0],
      [-126.6, 72.0],
      [-126.7, 73.6],
      [-130, 74.9],
      [-140, 75.4],
      [-149.5, 74.7],
      [-154.5, 73.5],
    ],
    [-140, 72.7],
  ),
  softRegion(
    'Baffin Bay',
    [
      [-76.6, 74.25],
      [-75.0, 75.65],
      [-71.6, 76.1],
      [-67.2, 75.45],
      [-62.6, 74.45],
      [-59.6, 72.7],
      [-59.2, 70.6],
      [-62.3, 69.7],
      [-66.0, 70.4],
      [-69.6, 71.8],
      [-73.3, 73.2],
    ],
    [-66.5, 73.4],
  ),
  softRegion(
    'Davis Strait / Labrador Sea',
    [
      [-60.3, 67.6],
      [-57.2, 66.9],
      [-55.0, 64.5],
      [-52.3, 61.6],
      [-50.6, 58.6],
      [-51.6, 55.8],
      [-54.6, 54.7],
      [-57.6, 55.6],
      [-59.6, 57.7],
      [-61.4, 60.2],
      [-62.4, 62.4],
      [-61.6, 64.8],
    ],
    [-56.2, 61.2],
  ),
];
const highArctic = softRegion(
  'High Arctic',
  [
    [-150.0, 88.6],
    [-151.0, 82.5],
    [-147.0, 77.9],
    [-138.0, 76.9],
    [-129.0, 77.1],
    [-121.5, 78.5],
    [-113.5, 79.7],
    [-104.5, 80.7],
    [-96.0, 82.0],
    [-87.0, 83.05],
    [-76.0, 83.75],
    [-63.0, 84.15],
    [-50.0, 84.45],
    [-40.0, 85.2],
    [-38.0, 88.4],
    [-95.0, 89.7],
  ],
  [-100, 85.0],
);

// ======================================================================================
// 2) POLAR2 — sobre a vista polar (mesma projecao/enquadramento de POLAR)
// ======================================================================================
console.log('POLAR2');
const ll2p = (ll) => projP(ll);

const POLAR_POINTS = [
  ['Anadyr', 177.51, 64.73],
  ['Anchorage', -149.81, 61.25],
  ['Fairbanks', -147.1, 64.67],
  ['Alert', -62.35, 82.5],
  ['Murmansk', 33.08, 68.97],
  ['Olenya', 33.46, 68.15],
  ['Severomorsk', 33.42, 69.07],
  ['Novaya Zemlya', 56.0, 73.8],
  ['Norilsk', 88.2, 69.35],
  ['Moscow', 37.62, 55.76],
  ['Beijing', 116.4, 39.9],
  ['Ottawa', -75.7, 45.42],
  ['Washington', -77.04, 38.91],
  ['New York', -74.01, 40.71],
  ['Chicago', -87.63, 41.88],
  ['Toronto', -79.38, 43.65],
  ['Colorado Springs', -104.82, 38.83],
  ['Oslo', 10.75, 59.91],
  ['Reykjavik', -21.94, 64.15],
  ['Pituffik', -68.7, 76.53],
  ['Iqaluit', -68.52, 63.75],
  ['Resolute', -94.83, 74.7],
  ['Inuvik', -133.72, 68.36],
  ['Yellowknife', -114.37, 62.45],
  ['Goose Bay', -60.42, 53.32],
  ['Vancouver', -123.12, 49.28],
  ['Halifax', -63.57, 44.65],
  ['North Pole', 0, 90],
  // pontos de rotulo (centro visual de cada regiao)
  ['Barents Sea', 41.0, 74.2],
  ['Kara Sea', 70.0, 76.5],
  ['Bering Sea', -178.5, 58.6],
  ['Chukotka', 172.0, 66.6],
  ['Alaska', -152.0, 64.5],
  ['Canadian Arctic', -98.0, 74.5],
  ['Northern Europe', 17.0, 64.0],
  ['Greenland', -41.0, 74.0],
  ['Arctic Ocean', 150.0, 84.0],
];
const polarPoints = POLAR_POINTS.map(([name, lon, lat]) => ({name, p: rp(ll2p([lon, lat])), ll: [lon, lat]}));
const pp = (name) => polarPoints.find((p) => p.name === name).ll;

// ---- 2a) ADIZ do Alasca (contorno publico aproximado): mar de Beaufort/Chukchi ao norte, a linha
// maritima EUA-Russia (168°58'W e a linha da Convencao de 1867) a oeste, ao sul das Aleutas e do golfo
// do Alasca, e a fronteira terrestre com o Canada (Yukon/Colombia Britanica) a leste.
const borderMesh = topojson.mesh(world, world.objects.countries, (a, b) => (a.id === '124' && b.id === '840') || (a.id === '840' && b.id === '124'));
const borderLines = borderMesh.type === 'MultiLineString' ? borderMesh.coordinates : [borderMesh.coordinates];
const alaskaBorderLines = borderLines.filter((line) => line.some(([lon, lat]) => lon < -129 && lat > 54.5));
// une os trechos da fronteira do Alasca num unico caminho de sul (Dixon Entrance) para norte (Beaufort)
const chainLines = (lines) => {
  const rest = lines.map((l) => [...l]);
  rest.sort((a, b) => Math.min(...a.map((p) => p[1])) - Math.min(...b.map((p) => p[1])));
  let chain = rest.shift();
  if (chain[0][1] > chain[chain.length - 1][1]) chain.reverse();
  while (rest.length) {
    const end = chain[chain.length - 1];
    let bi = 0;
    let bd = Infinity;
    let rev = false;
    rest.forEach((l, i) => {
      const d0 = d3.geoDistance(end, l[0]);
      const d1 = d3.geoDistance(end, l[l.length - 1]);
      if (d0 < bd) {
        bd = d0;
        bi = i;
        rev = false;
      }
      if (d1 < bd) {
        bd = d1;
        bi = i;
        rev = true;
      }
    });
    const l = rest.splice(bi, 1)[0];
    chain = chain.concat(rev ? l.reverse() : l);
  }
  return chain;
};
const alaskaBorder = chainLines(alaskaBorderLines);
const ADIZ_SEA = [
  [-141.0, 72.6],
  [-150.0, 72.9],
  [-160.0, 73.0],
  [-168.97, 72.6],
  [-168.97, 65.6], // linha de 168°58'W ate o estreito de Bering
  [-171.0, 64.65],
  [-172.6, 64.0], // entre a ilha de Sao Lourenco e o cabo Chukotsky
  [-175.0, 62.5],
  [-178.6, 60.4],
  [177.0, 58.0],
  [172.6, 55.8],
  [170.0, 53.6], // entre Attu e as ilhas do Comandante
  [170.0, 51.0],
  [175.0, 50.0],
  [-180.0, 49.8],
  [-170.0, 50.0],
  [-160.0, 50.2],
  [-155.0, 53.4],
  [-145.0, 57.0],
  [-144.0, 56.95],
  [-136.0, 54.0],
  [-133.6, 54.35],
];
const adizRing = [...ADIZ_SEA, ...alaskaBorder];
const adizLine = {type: 'LineString', coordinates: [...adizRing, adizRing[0]]};
const adizPts = capture(projP, adizLine).flatMap((g, i) => (i ? g.pts.slice(1) : g.pts));
if (dist(adizPts[0], adizPts[adizPts.length - 1]) < 0.2) adizPts.pop();
const adiz = ptsD(adizPts, true);
let adizPoly = {type: 'Polygon', coordinates: [[...adizRing, adizRing[0]]]};
if (d3.geoArea(adizPoly) > 2 * Math.PI) adizPoly = {type: 'Polygon', coordinates: [[...adizRing, adizRing[0]].reverse()]};
const inAdiz = (ll) => d3.geoContains(adizPoly, ll);
const nearestIdxPlain = (pts, p) => {
  let bi = 0;
  let bd = Infinity;
  pts.forEach((q, i) => {
    const d = dist(p, q);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  });
  return bi;
};
// rotulo ao longo da borda sul (ao sul das Aleutas), por dentro da ADIZ; angulo em graus no espaco do mapa
const ADIZ_LABEL_EDGE = [
  [-180.0, 49.8],
  [-160.0, 50.2],
];
const adizEdgePts = capture(projP, {type: 'LineString', coordinates: ADIZ_LABEL_EDGE})[0].pts;
const adizEdgeMid = resample(adizEdgePts, polyLen(adizEdgePts) / 2)[1];
const adizEdgeDir = (() => {
  const a = resample(adizEdgePts, 2);
  const i = nearestIdxPlain(a, adizEdgeMid);
  const p0 = a[Math.max(0, i - 1)];
  const p1 = a[Math.min(a.length - 1, i + 1)];
  return [p1[0] - p0[0], p1[1] - p0[1]];
})();
let adizLabelAngle = (Math.atan2(adizEdgeDir[1], adizEdgeDir[0]) * 180) / Math.PI;
if (adizLabelAngle > 90) adizLabelAngle -= 180;
if (adizLabelAngle < -90) adizLabelAngle += 180;
adizLabelAngle = Math.round(adizLabelAngle * 10) / 10;
const adizLabel = (() => {
  const L = Math.hypot(adizEdgeDir[0], adizEdgeDir[1]);
  const n = [-adizEdgeDir[1] / L, adizEdgeDir[0] / L];
  const a = [adizEdgeMid[0] + n[0] * 3.2, adizEdgeMid[1] + n[1] * 3.2];
  const b = [adizEdgeMid[0] - n[0] * 3.2, adizEdgeMid[1] - n[1] * 3.2];
  return rp(inAdiz(projP.invert(a)) ? a : b);
})();
// o mesmo trecho da borda como caminho ~3,6 px por dentro, no sentido de leitura (para <textPath>)
const adizLabelPath = (() => {
  const base = resample(adizEdgePts, 1);
  const testIn = offsetLine(base, 3.6)[Math.floor(base.length / 2)];
  const path = offsetLine(base, inAdiz(projP.invert(testIn)) ? 3.6 : -3.6);
  if (Math.abs(Math.atan2(path[path.length - 1][1] - path[0][1], path[path.length - 1][0] - path[0][0])) > Math.PI / 2) path.reverse();
  const n = path.length;
  return ptsD(path.slice(Math.floor(n * 0.06), Math.ceil(n * 0.94)));
})();

// Costa do Alasca (EUA, arcos sem fronteira), para o brilho do "espaco aereo soberano"
const usCoast = topojson.mesh(world, world.objects.countries, (a, b) => a === b && a.id === '840');
const usCoastLines = usCoast.type === 'MultiLineString' ? usCoast.coordinates : [usCoast.coordinates];
const alaskaCoastLines = usCoastLines.filter((l) => l.some(([lon, lat]) => (lon < -129 || lon > 170) && lat > 50));
const alaskaCoastRings = capture(projP, {type: 'MultiLineString', coordinates: alaskaCoastLines}).filter((r) => polyLen(r.pts) > 0.6);
const alaskaCoast = ringsD(alaskaCoastRings.map((r) => ({pts: r.pts, closed: false})));
const alaskaBorderP = pathP({type: 'LineString', coordinates: alaskaBorder});

// distancia minima (km) de um ponto a costa dos EUA no Alasca (vertices 1:50m)
const usCoastVerts = alaskaCoastLines.flat();
const kmToUS = (ll) => {
  let m = Infinity;
  for (const v of usCoastVerts) {
    const d = d3.geoDistance(ll, v);
    if (d < m) m = d;
  }
  return m * 6371;
};

// ---- 2b) Bombardeiros (24/07/2024): 2 Tu-95 + 2 H-6 juntos, de Anadyr para leste sobre o mar de Bering,
// entram na ADIZ, correm paralelos a costa (bem longe do mar territorial) e voltam para oeste.
const BOMBER_WP = [
  [177.74, 64.73], // Anadyr (Ugolny)
  [179.7, 63.85],
  [-176.4, 62.95],
  [-172.4, 62.45],
  [-169.95, 61.7], // ja dentro da ADIZ: vira para o sul
  [-169.35, 60.4], // paralelo a costa (Nunivak a ~100 km a leste)
  [-169.45, 58.85],
  [-171.2, 57.95], // volta para oeste (Pribilof a ~95 km ao sul)
  [-174.9, 58.35],
  [-178.6, 59.85],
  [179.0, 61.65],
  [178.0, 63.45],
];
const bomberBase = resample(crSpline(BOMBER_WP.map(ll2p), false, 32), 0.5);
const BOMBERS = [
  {id: 'tu95-1', kind: 'tu95', off: -2.6},
  {id: 'tu95-2', kind: 'tu95', off: -1.0},
  {id: 'h6-1', kind: 'h6', off: 1.0},
  {id: 'h6-2', kind: 'h6', off: 2.6},
];
const bomberTracks = BOMBERS.map((b) => {
  const pts = resample(offsetLine(bomberBase, b.off), 1);
  let minKm = Infinity;
  let minAt = null;
  let inside = 0;
  for (const p of pts) {
    const ll = projP.invert(p);
    const km = kmToUS(ll);
    if (km < minKm) {
      minKm = km;
      minAt = ll;
    }
    if (inAdiz(ll)) inside++;
  }
  console.log(`  bomber ${b.id}: ${R(polyLen(pts))} px, min distance to US land ${Math.round(minKm)} km at ${minAt.map((n) => n.toFixed(2))}, ${Math.round((inside / pts.length) * 100)}% inside ADIZ`);
  if (minKm < 40) console.log(`  !! bomber ${b.id} comes within ${Math.round(minKm)} km of US land`);
  return track(pts, {id: b.id, kind: b.kind});
});
// fracao (0..1) do primeiro ponto dentro da ADIZ, e do ponto de volta (saida)
const bomberLead = bomberTracks[0].pts;
const adizFlags = bomberLead.map((p) => inAdiz(projP.invert(p)));
const bomberCum = cumLen(bomberLead);
const fracAt = (cum, i) => Math.round((cum[i] / cum[cum.length - 1]) * 1000) / 1000;
const bomberAdizIn = fracAt(bomberCum, adizFlags.indexOf(true));
const bomberAdizOut = fracAt(bomberCum, adizFlags.lastIndexOf(true));

// ---- 2c) Interceptacao: caças de Elmendorf (Anchorage) e Eielson (Fairbanks) ate os bombardeiros,
// depois "sombra" ao lado deles (do lado da costa) no trecho paralelo.
const nearestIdx = (pts, p) => {
  let bi = 0;
  let bd = Infinity;
  pts.forEach((q, i) => {
    const d = dist(p, q);
    if (d < bd) {
      bd = d;
      bi = i;
    }
  });
  return bi;
};
const INTERCEPTS = [
  {id: 'jber', from: 'Anchorage', wp: [[-149.81, 61.25], [-154.0, 60.7], [-159.2, 60.75], [-164.0, 61.05]], join: [-169.25, 60.95], shadowTo: [-169.35, 59.2], side: 3.6},
  {id: 'eielson', from: 'Fairbanks', wp: [[-147.1, 64.67], [-152.4, 64.4], [-157.8, 63.85], [-163.0, 62.95]], join: [-169.7, 61.45], shadowTo: [-169.4, 59.75], side: 5.8},
];
const interceptTracks = INTERCEPTS.map((it) => {
  const jIdx = nearestIdx(bomberBase, ll2p(it.join));
  const sIdx = nearestIdx(bomberBase, ll2p(it.shadowTo));
  const shadow = offsetLine(bomberBase, -it.side).slice(jIdx, sIdx + 1);
  const approach = crSpline([...it.wp.map(ll2p), shadow[0]], false, 32);
  // emenda suave: os ultimos pontos de aproximacao sao trocados pela sombra
  const pts = resample([...approach.slice(0, -1), ...shadow], 1);
  const cum = cumLen(pts);
  const joinI = nearestIdx(pts, shadow[0]);
  const leadI = nearestIdx(bomberLead, bomberBase[jIdx]);
  const leadEnd = nearestIdx(bomberLead, bomberBase[sIdx]);
  console.log(`  intercept ${it.id}: ${R(polyLen(pts))} px, joins at ${fracAt(cum, joinI)} of its track / ${fracAt(bomberCum, leadI)} of tu95-1 (shadow until ${fracAt(bomberCum, leadEnd)})`);
  return track(pts, {id: it.id, from: it.from, joinFrac: fracAt(cum, joinI), bomberFrac: fracAt(bomberCum, leadI), bomberEndFrac: fracAt(bomberCum, leadEnd)});
});

// ---- 2d) Arcos de ataque (circulos maximos) do Artico russo ate a America do Norte
const STRIKES = [
  ['Olenya', 'Washington'],
  ['Severomorsk', 'New York'],
  ['Barents Sea', 'Ottawa'],
  ['Novaya Zemlya', 'Toronto'],
  ['Kara Sea', 'Chicago'],
];
const strikeArcs = STRIKES.map(([from, to]) => {
  const interp = d3.geoInterpolate(pp(from), pp(to));
  const pts = resample(
    range(0, 1.0001, 1 / 160).map((t) => ll2p(interp(Math.min(1, t)))),
    1.5,
  );
  const maxLat = Math.max(...range(0, 1.0001, 1 / 160).map((t) => interp(Math.min(1, t))[1]));
  console.log(`  strike ${from} -> ${to}: ${R(polyLen(pts))} px, max lat ${maxLat.toFixed(1)}`);
  return track(pts, {from, to});
});

// ---- 2e) Rotas maritimas na escala polar (pela agua, 1:50m)
const polarLandRings = landRings(projP, countries.filter((f) => f.id !== '010'));
const polarField = makeField(polarLandRings, 690, 250, 1230, 790, 2);
const nsrRes = waterRoute(
  polarField,
  ll2p,
  [
    [[35.5, 70.3], 0], // Murmansk (mar de Barents)
    [[48.0, 71.6], 4],
    [[58.2, 70.45], 1], // Portao de Kara
    [[69.0, 73.6], 4], // mar de Kara
    [[86.0, 76.0], 4],
    [[104.5, 77.95], 1.5], // estreito de Vilkitsky
    [[123.0, 76.0], 4], // mar de Laptev
    [[139.5, 74.55], 1.5], // estreito de Sannikov
    [[160.0, 72.4], 4], // mar da Sibéria Oriental
    [[178.0, 70.2], 2], // estreito de Long
    [[-171.0, 67.6], 3], // mar de Chukchi
    [[-168.9, 65.85], 0], // estreito de Bering
  ],
  'nsr',
);
const nwpRes = waterRoute(
  polarField,
  ll2p,
  [
    [[-58.0, 67.0], 0], // Davis Strait
    [[-63.5, 72.0], 4], // Baffin Bay
    [[-75.0, 74.0], 3],
    [[-84, 74.15], 2], // Lancaster Sound
    [[-93.5, 74.3], 2], // Barrow Strait
    [[-107, 73.9], 3], // Viscount Melville Sound
    [[-118, 74.8], 2], // M'Clure Strait
    [[-128.3, 73.65], 2],
    [[-145.0, 71.4], 3], // mar de Beaufort
    [[-157.0, 71.75], 1.5], // Point Barrow
    [[-167.0, 69.0], 3], // mar de Chukchi
    [[-168.9, 65.85], 0], // estreito de Bering
  ],
  'nwp',
);
const transpolarPts = resample(
  crSpline(
    [
      [4.0, 70.5], // mar da Noruega
      [2.5, 74.5],
      [1.5, 79.0], // estreito de Fram
      [1.5, 84.5],
      [0, 90], // Polo Norte
      [-169.5, 84.5],
      [-168.8, 76.0],
      [-168.7, 70.5],
      [-168.9, 65.85], // estreito de Bering
    ].map(ll2p),
    false,
    32,
  ),
  2,
);
{
  let minC = Infinity;
  for (const p of resample(transpolarPts, 0.5)) minC = Math.min(minC, polarField.at(p[0], p[1]));
  console.log(`  route transpolar: ${R(polyLen(transpolarPts))} px, min clearance ${minC.toFixed(2)} px`);
  if (minC < 0) throw new Error('transpolar route touches land');
}
const seaRoutes = {nsr: track(nsrRes.pts), nwp: track(nwpRes.pts), transpolar: track(transpolarPts)};

// ---- 2f) RADARSAT Constellation: 4 tracos de solo de uma orbita polar heliossincrona (~600 km, 97,74°).
// Cada passagem e a mesma curva girada pela rotacao da Terra entre orbitas (~24°), com o ponto mais ao
// norte (82,3N) sobre o setor canadense: as faixas se cruzam sobre o Alto Artico ("ate 4 passagens por dia").
const RE = 6371;
const MU = 398600.4418;
const INC = (97.74 * Math.PI) / 180;
const ALT = 600;
const A = RE + ALT;
const PERIOD = 2 * Math.PI * Math.sqrt((A * A * A) / MU); // s
const OMEGA_REL = -(7.2921159e-5 - 1.991e-7); // rad/s: rotacao da Terra menos a precessao heliossincrona
const groundTrack = (lonApex, latMin = 50) => {
  const pts = [];
  // u = argumento da latitude (0 no nodo ascendente); o apice (lat maxima) fica em u = 90°
  for (let k = 0; k <= 720; k++) {
    const u = (k / 720) * Math.PI;
    const t = (u / (2 * Math.PI)) * PERIOD;
    const lat = Math.asin(Math.sin(INC) * Math.sin(u));
    const dl = Math.atan2(Math.cos(INC) * Math.sin(u), Math.cos(u)) + OMEGA_REL * t;
    pts.push({lat: (lat * 180) / Math.PI, dl: (dl * 180) / Math.PI});
  }
  const apex = pts[360].dl;
  return pts.filter((q) => q.lat >= latMin).map((q) => [lonApex + q.dl - apex, q.lat]);
};
const kmToPx = (ll, km, bearing) => {
  // largura em px de um deslocamento de `km` a partir de ll (media de duas direcoes perpendiculares)
  const p0 = ll2p(ll);
  const a = ((km / RE) * 180) / Math.PI;
  const off = (b) => {
    const q = d3.geoRotation([-ll[0], -ll[1]]).invert(
      d3.geoRotation([0, 0])([a * Math.sin((b * Math.PI) / 180), a * Math.cos((b * Math.PI) / 180)]),
    );
    return dist(p0, ll2p(q));
  };
  return (off(bearing) + off(bearing + 90)) / 2;
};
const ORBIT_SHIFT = ((-OMEGA_REL * PERIOD) * 180) / Math.PI; // ~24,2° por orbita
const rcmTracks = [-58, -58 - ORBIT_SHIFT, -58 - 2 * ORBIT_SHIFT, -58 - 3 * ORBIT_SHIFT].map((lonApex, i) => {
  const lls = groundTrack(lonApex);
  const pts = resample(lls.map(ll2p), 2);
  const half = kmToPx([lonApex, 80], 350, 0);
  return track(pts, {id: `pass-${i + 1}`, apexLon: Math.round(lonApex * 10) / 10, swathHalfWidthPx: R(half)});
});
console.log(`  rcm: period ${(PERIOD / 60).toFixed(1)} min, shift per orbit ${ORBIT_SHIFT.toFixed(2)} deg, swath half-width ${rcmTracks[0].swathHalfWidthPx} px`);

// ======================================================================================
// 3) WORLD — Equal Earth, mundo inteiro
// ======================================================================================
console.log('WORLD');
const WORLD_TOL = 0.18; // px: simplificacao invisivel (mesmo com zoom 3x) que mantem o JSON leve
const worldCountries = countries
  .map((f) => {
    const rings = capture(projW, f)
      .map((r) => ({pts: simplifyLine(r.pts, WORLD_TOL, r.closed), closed: r.closed}))
      .filter((r) => r.pts.length > 2 && polyLen(r.pts, true) > 0.8);
    return {id: f.id ?? f.properties.name, name: f.properties.name, d: ringsD(rings), c: pathW.centroid(f).map(R)};
  })
  .filter((c) => c.d.length > 0);
const worldIds = {
  canada: '124',
  usa: '840',
  australia: '036',
  germany: '276',
  russia: '643',
  china: '156',
  uk: '826',
  norway: '578',
  denmark: '208',
  greenland: '304',
  france: '250',
  japan: '392',
  iceland: '352',
  finland: '246',
  sweden: '752',
};
for (const [k, id] of Object.entries(worldIds)) if (!worldCountries.find((c) => c.id === id)) throw new Error(`WORLD: ${k} ${id} not found`);
// pontos de rotulo (o centroide de EUA/Russia/Noruega cai mal por causa de Alasca/ilhas)
const worldLabels = Object.fromEntries(
  Object.entries({
    canada: [-102, 58],
    usa: [-99, 39.5],
    australia: [134, -25.5],
    germany: [10.4, 51.1],
    russia: [97, 62],
    china: [104, 34.5],
    uk: [-2, 53.5],
    norway: [9.5, 61.5],
    greenland: [-41, 74],
    france: [2.4, 46.6],
    japan: [138.5, 36.5],
  }).map(([k, ll]) => [k, rp(projW(ll))]),
);
const WORLD_PLACES = [
  ['Ottawa', -75.7, 45.42],
  ['Washington', -77.04, 38.91],
  ['Canberra', 149.13, -35.28],
  ['Adelaide', 138.6, -34.93], // BAE Systems Australia
  ['Kiel', 10.14, 54.32], // TKMS
  ['Berlin', 13.4, 52.52],
  ['Moscow', 37.62, 55.76],
  ['Beijing', 116.4, 39.9],
];
const worldPlaces = WORLD_PLACES.map(([name, lon, lat]) => ({name, p: rp(projW([lon, lat])), ll: [lon, lat]}));
const wp = (name) => worldPlaces.find((q) => q.name === name).p;
// ligacoes: Canada-Alemanha por circulo maximo; Canada-Australia como arco de TELA (o circulo maximo
// cruzaria o Pacifico e seria cortado na borda do mapa)
const gcWorld = (a, b) => {
  const interp = d3.geoInterpolate(a, b);
  return resample(range(0, 1.0001, 1 / 120).map((t) => projW(interp(Math.min(1, t)))), 2);
};
const screenArc = (a, b, bow) => {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const L = dist(a, b);
  const c = [mx + ((b[1] - a[1]) / L) * bow * L, my - ((b[0] - a[0]) / L) * bow * L];
  const q = range(0, 1.0001, 1 / 120).map((t0) => {
    const t = Math.min(1, t0);
    return [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  });
  return resample(q, 2);
};
const withMid = (pts, extra) => {
  const t = track(pts, extra);
  return {...t, mid: rp(resample(pts, polyLen(pts) / 2)[1])};
};
const worldLinks = {
  canadaAustralia: withMid(screenArc(wp('Ottawa'), wp('Canberra'), 0.22), {from: 'Ottawa', to: 'Canberra', kind: 'screen'}),
  canadaGermany: withMid(gcWorld(pp('Ottawa'), [10.14, 54.32]), {from: 'Ottawa', to: 'Kiel', kind: 'greatCircle'}),
};

const WORLD_DATA = {
  scale: R(projW.scale()),
  sphere: pathW({type: 'Sphere'}),
  graticule: pathW(d3.geoGraticule().step([30, 30])()),
  countries: worldCountries,
  ids: worldIds,
  labels: worldLabels,
  places: worldPlaces,
  links: worldLinks,
};

// Parametros das 3 projecoes (escala/translacao ja ajustadas): src/data/maps2.ts recria as funcoes de
// projecao com eles (caProject, polarProject, worldProject). Conferencia: devem coincidir com as daqui.
const PROJ = {
  ca: {scale: projCA.scale(), translate: projCA.translate()},
  polar: {scale: projP.scale(), translate: projP.translate()},
  world: {scale: projW.scale(), translate: projW.translate()},
};
{
  const rebuilt = {
    ca: d3.geoConicConformal().parallels([49, 77]).rotate([96, 0]).scale(PROJ.ca.scale).translate(PROJ.ca.translate),
    polar: d3.geoAzimuthalEqualArea().rotate([96, -90, 0]).scale(PROJ.polar.scale).translate(PROJ.polar.translate),
    world: d3.geoEqualEarth().scale(PROJ.world.scale).translate(PROJ.world.translate),
  };
  const orig = {ca: projCA, polar: projP, world: projW};
  for (const k of Object.keys(orig)) {
    for (const ll of [[-62.35, 82.5], [-77.04, 38.91], [177.5, 64.7], [134, -25]]) {
      const a = orig[k](ll);
      const b = rebuilt[k](ll);
      if (a && b && dist(a, b) > 1e-6) throw new Error(`projection params for ${k} do not reproduce the projection`);
    }
  }
}

// ======================================================================================
// Saida
// ======================================================================================
const out = {
  proj: PROJ,
  ca2: {
    arcticCoast,
    arcticCoastDrawFrac: longestFrac(arcticLens),
    arcticCoastBounds: arcticBounds,
    nws,
    nwsLine,
    places,
    communities,
    labels: caLabels,
    nwpRoutes,
    seaLanes,
    channels,
    channelsLabel,
    regions: {northernApproaches, highArctic: {c: highArctic.c, d: highArctic.d}},
  },
  polar2: {
    points: polarPoints,
    adiz,
    adizLabel,
    adizLabelAngle,
    adizLabelPath,
    adizBounds: [
      [R(Math.min(...adizPts.map((p) => p[0]))), R(Math.min(...adizPts.map((p) => p[1])))],
      [R(Math.max(...adizPts.map((p) => p[0]))), R(Math.max(...adizPts.map((p) => p[1])))],
    ],
    alaskaCoast,
    alaskaBorder: alaskaBorderP,
    bomberTracks,
    bomberAdiz: {inFrac: bomberAdizIn, outFrac: bomberAdizOut},
    interceptTracks,
    strikeArcs,
    seaRoutes,
    rcmTracks,
  },
  world: WORLD_DATA,
};

const json = JSON.stringify(out);
fs.writeFileSync('src/data/maps2.json', json);
const kb = (s) => Math.round(Buffer.byteLength(typeof s === 'string' ? s : JSON.stringify(s)) / 1024);
console.log(`maps2.json ${kb(json)} KB  (ca2 ${kb(out.ca2)} KB, polar2 ${kb(out.polar2)} KB, world ${kb(out.world)} KB)  in ${Date.now() - t00} ms`);

if (DEBUG) {
  fs.mkdirSync('assets-src/tmp-maps2', {recursive: true});
  const r2 = (rings) => rings.map((r) => r.map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]));
  fs.writeFileSync('assets-src/tmp-maps2/debug_ca.json', JSON.stringify({land: r2(caLandRings), routes: Object.fromEntries(nwpRoutes.map((r) => [r.id, r.pts])), nws: nws.map((s) => s.p)}));
  fs.writeFileSync('assets-src/tmp-maps2/debug_polar.json', JSON.stringify({land: r2(polarLandRings), routes: {nsr: seaRoutes.nsr.pts, nwp: seaRoutes.nwp.pts, transpolar: seaRoutes.transpolar.pts, ...Object.fromEntries(bomberTracks.map((b) => [b.id, b.pts])), ...Object.fromEntries(interceptTracks.map((b) => [b.id, b.pts])), adiz: adizPts}}));
}
