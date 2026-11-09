// Geometria pura do kit (sem React, sem DOM): curvas suaves, amostragem de caminhos SVG,
// comprimento de arco e o "circulo feito a mao". Tudo deterministico (nada de Math.random).

export type XY = readonly [number, number];

const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Rumo (0 = para cima/norte, sentido horario, graus) -> ponto no circulo. */
export const bearingPt = (cx: number, cy: number, r: number, bearing: number): [number, number] => {
  const a = ((bearing - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

/** Circulo como caminho que comeca no rumo `start` e gira no sentido horario (para DrawSVG). */
export const circleD = (cx: number, cy: number, r: number, start = 0) => {
  const p = [0, 120, 240, 360].map((k) => bearingPt(cx, cy, r, start + k));
  return `M${r2(p[0][0])},${r2(p[0][1])}` + p.slice(1).map(([x, y]) => ` A${r2(r)},${r2(r)} 0 0 1 ${r2(x)},${r2(y)}`).join('');
};

/** Polilinha -> "M x,y L x,y ..." */
export const polyD = (pts: readonly XY[], closed = false) =>
  pts.length ? `M${pts.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' L')}${closed ? ' Z' : ''}` : '';

/** Catmull-Rom (centripeta simplificada, tensao 0.5) -> pontos densos que passam por todos os pts. */
export const smoothPts = (pts: readonly XY[], perSeg = 10, closed = false): [number, number][] => {
  const n = pts.length;
  if (n < 3) return pts.map((p) => [p[0], p[1]]);
  const get = (i: number): XY => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const out: [number, number][] = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    for (let k = 0; k < perSeg; k++) {
      const t = k / perSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const last = closed ? pts[0] : pts[n - 1];
  out.push([last[0], last[1]]);
  return out;
};

/** Caminho suave (Bezier cubicas) passando por todos os pontos. */
export const smoothD = (pts: readonly XY[], closed = false) => {
  const n = pts.length;
  if (n < 3) return polyD(pts, closed);
  const get = (i: number): XY => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r2(c1[0])},${r2(c1[1])} ${r2(c2[0])},${r2(c2[1])} ${r2(p2[0])},${r2(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
};

/**
 * Amostra um atributo `d` (M L H V C S Q T Z, absolutos e relativos; arcos A viram reta) em polilinhas.
 * Uma polilinha por subcaminho.
 */
export const sampleD = (d: string, perCurve = 14): [number, number][][] => {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
  const subs: [number, number][][] = [];
  let cur: [number, number][] = [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = '';
  let lastC: [number, number] | null = null; // ultimo controle cubico (para S)
  let lastQ: [number, number] | null = null; // ultimo controle quadratico (para T)
  let i = 0;
  const num = () => Number(tokens[i++]);
  const isNum = (s: string | undefined) => s !== undefined && !/^[A-Za-z]$/.test(s);
  const push = (px: number, py: number) => cur.push([px, py]);
  const cubic = (x1: number, y1: number, x2: number, y2: number, ex: number, ey: number) => {
    for (let k = 1; k <= perCurve; k++) {
      const t = k / perCurve;
      const u = 1 - t;
      push(u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey);
    }
  };
  const quad = (x1: number, y1: number, ex: number, ey: number) => {
    for (let k = 1; k <= perCurve; k++) {
      const t = k / perCurve;
      const u = 1 - t;
      push(u * u * x + 2 * u * t * x1 + t * t * ex, u * u * y + 2 * u * t * y1 + t * t * ey);
    }
  };
  while (i < tokens.length) {
    if (!isNum(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    if (C === 'Z') {
      if (cur.length) push(sx, sy);
      x = sx;
      y = sy;
      lastC = lastQ = null;
      continue;
    }
    if (C === 'M') {
      if (cur.length > 1) subs.push(cur);
      x = ox + num();
      y = oy + num();
      sx = x;
      sy = y;
      cur = [[x, y]];
      cmd = rel ? 'l' : 'L';
      lastC = lastQ = null;
      continue;
    }
    if (C === 'L') {
      x = ox + num();
      y = oy + num();
      push(x, y);
      lastC = lastQ = null;
    } else if (C === 'H') {
      x = (rel ? x : 0) + num();
      push(x, y);
      lastC = lastQ = null;
    } else if (C === 'V') {
      y = (rel ? y : 0) + num();
      push(x, y);
      lastC = lastQ = null;
    } else if (C === 'C') {
      const x1 = ox + num();
      const y1 = oy + num();
      const x2 = ox + num();
      const y2 = oy + num();
      const ex = ox + num();
      const ey = oy + num();
      cubic(x1, y1, x2, y2, ex, ey);
      lastC = [x2, y2];
      lastQ = null;
      x = ex;
      y = ey;
    } else if (C === 'S') {
      const x1: number = lastC ? 2 * x - lastC[0] : x;
      const y1: number = lastC ? 2 * y - lastC[1] : y;
      const x2 = ox + num();
      const y2 = oy + num();
      const ex = ox + num();
      const ey = oy + num();
      cubic(x1, y1, x2, y2, ex, ey);
      lastC = [x2, y2];
      lastQ = null;
      x = ex;
      y = ey;
    } else if (C === 'Q') {
      const x1 = ox + num();
      const y1 = oy + num();
      const ex = ox + num();
      const ey = oy + num();
      quad(x1, y1, ex, ey);
      lastQ = [x1, y1];
      lastC = null;
      x = ex;
      y = ey;
    } else if (C === 'T') {
      const x1: number = lastQ ? 2 * x - lastQ[0] : x;
      const y1: number = lastQ ? 2 * y - lastQ[1] : y;
      const ex = ox + num();
      const ey = oy + num();
      quad(x1, y1, ex, ey);
      lastQ = [x1, y1];
      lastC = null;
      x = ex;
      y = ey;
    } else if (C === 'A') {
      // arco aproximado por reta (raro nos dados de mapa; d3-geo so gera M/L/Z)
      i += 5;
      x = ox + num();
      y = oy + num();
      push(x, y);
      lastC = lastQ = null;
    } else {
      i++; // token inesperado: ignora
    }
  }
  if (cur.length > 1) subs.push(cur);
  return subs;
};

/** Comprimentos acumulados de uma polilinha. */
export const cumLen = (pts: readonly XY[]) => {
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return cum;
};

/** Ponto na distancia s ao longo da polilinha (s em unidades do desenho) + indice do segmento. */
export const pointAt = (pts: readonly XY[], cum: readonly number[], s: number): {p: [number, number]; seg: number} => {
  const total = cum[cum.length - 1];
  const ss = Math.max(0, Math.min(total, s));
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= ss) lo = mid;
    else hi = mid;
  }
  const segLen = cum[hi] - cum[lo] || 1;
  const f = (ss - cum[lo]) / segLen;
  return {p: [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f], seg: lo};
};

/** Trecho da polilinha de 0 ate s (para trilhas que crescem: o tracejado fica ancorado no inicio). */
export const sliceTo = (pts: readonly XY[], cum: readonly number[], s: number): [number, number][] => {
  if (pts.length < 2 || s <= 0) return [];
  const {p, seg} = pointAt(pts, cum, s);
  const out: [number, number][] = pts.slice(0, seg + 1).map((q) => [q[0], q[1]]);
  out.push(p);
  return out;
};

/** Direcao (graus, 0 = +x, sentido horario na tela) suavizada numa janela de +-w unidades. */
export const headingAt = (pts: readonly XY[], cum: readonly number[], s: number, w: number) => {
  const total = cum[cum.length - 1];
  const a = pointAt(pts, cum, Math.max(0, Math.min(total - w * 2, s - w))).p;
  const b = pointAt(pts, cum, Math.min(total, Math.max(w * 2, s + w))).p;
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
};

/**
 * "Circulo feito a mao": volta e meia de caneta (passa um pouco do ponto inicial), raio que cresce de leve
 * e uma ondulacao fixa. Deterministico; `seed` muda a fase da ondulacao.
 */
export const handCircleD = (cx: number, cy: number, rx: number, ry = rx, opts: {turns?: number; start?: number; seed?: number; tilt?: number} = {}) => {
  const {turns = 1.12, start = -120, seed = 1, tilt = -6} = opts;
  const n = Math.max(24, Math.round(48 * turns));
  const pts: [number, number][] = [];
  const t0 = (start * Math.PI) / 180;
  const tl = (tilt * Math.PI) / 180;
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const a = t0 + u * turns * TAU;
    const grow = 0.965 + 0.07 * u; // a caneta termina um pouco por fora do inicio
    const wob = 1 + 0.018 * Math.sin(2 * a + seed * 1.7) + 0.012 * Math.sin(3 * a + seed * 0.6);
    const x = Math.cos(a) * rx * grow * wob;
    const y = Math.sin(a) * ry * grow * wob;
    pts.push([cx + x * Math.cos(tl) - y * Math.sin(tl), cy + x * Math.sin(tl) + y * Math.cos(tl)]);
  }
  return smoothD(pts);
};

/** Setor de coroa circular (para icones: faixas da boia salva-vidas). Angulos em graus (0 = +x, horario). */
export const annularSectorD = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, a: number) => {
    const t = (a * Math.PI) / 180;
    return `${r2(cx + r * Math.cos(t))},${r2(cy + r * Math.sin(t))}`;
  };
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p(r1, a0)} A${r1},${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
};

/** Estrela de n pontas (para icones). */
export const starD = (cx: number, cy: number, R: number, r: number, n = 5, rot = -90) => {
  const pts: [number, number][] = [];
  for (let k = 0; k < n * 2; k++) {
    const a = ((rot + (k * 180) / n) * Math.PI) / 180;
    const rr = k % 2 === 0 ? R : r;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return polyD(pts, true);
};
