// Icones de linha do kit (caixa 64x64, traco 2,5 a 64 px, pontas e juncoes redondas), no mesmo peso
// "giz" dos mapas. Cada primitiva recebe a classe `${cls}-p` (DrawSVG) e, se tiver preenchimento,
// `${cls}-f` (o drawIcon() acende o preenchimento depois do traco).
//
// Papeis das primitivas:
//   body   silhueta fechada: sempre com traco; preenchida quando o icone recebe `fill`
//   line   traco aberto (mastro, rotor, ondas): sempre na cor do traco
//   detail detalhe interno (janelas, ponteiros): na cor do traco no contorno; "entalhado" (cor `cut`)
//          quando o icone e preenchido, para continuar legivel
//   dot    pontinho cheio na cor do traco
import React from 'react';
import {at} from '../../lib/pos';
import {C} from '../../theme';
import {annularSectorD, polyD, starD} from './geom';

type Role = 'body' | 'line' | 'detail' | 'dot';
type Prim = {
  d?: string;
  c?: readonly [number, number, number];
  role: Role;
  /** body: no modo contorno, preenche com `cut` para esconder o que esta atras (figuras sobrepostas). */
  occlude?: boolean;
  /** detail: cheio na cor do traco no modo contorno, cheio com `cut` no modo preenchido (furo do pino). */
  cutFill?: boolean;
  /** so preenchimento (aparece apenas quando o icone e preenchido). */
  noStroke?: boolean;
  rule?: 'evenodd';
};
/** top = visto de cima, nariz para CIMA; side = de lado, proa/nariz para a DIREITA; flat = simbolo. */
export type IconView = 'top' | 'side' | 'flat';
type IconDef = {view: IconView; tf?: string; prims: Prim[]};

const B = (d: string, extra: Partial<Prim> = {}): Prim => ({d, role: 'body', ...extra});
const Ln = (d: string): Prim => ({d, role: 'line'});
const Dt = (d: string, extra: Partial<Prim> = {}): Prim => ({d, role: 'detail', ...extra});
const circ = (cx: number, cy: number, r: number, role: Role, extra: Partial<Prim> = {}): Prim => ({c: [cx, cy, r], role, ...extra});

const rays = (cx: number, cy: number, r0: number, r1: number, n: number, rot = 0) =>
  Array.from({length: n}, (_, k) => {
    const a = ((rot + (k * 360) / n) * Math.PI) / 180;
    return Ln(polyD([
      [cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)],
      [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)],
    ]));
  });

const snowflake = (): Prim[] => {
  const out: Prim[] = [];
  const cx = 32;
  const cy = 32;
  for (let k = 0; k < 6; k++) {
    const a = ((k * 60 - 90) * Math.PI) / 180;
    const P = (r: number, da = 0): [number, number] => {
      const b = a + da;
      return [cx + r * Math.cos(b), cy + r * Math.sin(b)];
    };
    const arm = (r: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
    out.push(Ln(polyD([P(0), P(26)])));
    // ramos em "V" voltados para fora
    const v = (r: number, len: number) => {
      const base = arm(r);
      const l = (s: number) => {
        const b = a + s * 0.75;
        return [base[0] + len * Math.cos(b), base[1] + len * Math.sin(b)] as [number, number];
      };
      return Ln(polyD([l(1), base, l(-1)]));
    };
    out.push(v(13, 8.5));
  }
  return out;
};

const ammo = (): Prim[] =>
  [19, 32, 45].flatMap((cx) => [
    B(`M${cx - 4.5},54 L${cx - 4.5},28 Q${cx - 4.5},16 ${cx},10 Q${cx + 4.5},16 ${cx + 4.5},28 L${cx + 4.5},54 Z`),
    Dt(`M${cx - 4.5},29.5 L${cx + 4.5},29.5`),
    Dt(`M${cx - 4.5},49.5 L${cx + 4.5},49.5`),
  ]);

const calendarDays = (): Prim[] => {
  const out: Prim[] = [];
  for (const y of [30, 42]) for (const x of [15, 28, 41]) out.push(Dt(`M${x},${y} L${x + 8},${y} L${x + 8},${y + 7} L${x},${y + 7} Z`));
  return out;
};

export const ICONS = {
  // ---------- aeronaves (vistas de cima, nariz para cima) ----------
  jet: {
    view: 'top',
    prims: [
      B('M32,4 Q35.5,9 35.5,21 L58,37 L58,42.5 L35.5,40 L35,49 L44,55.5 L44,59 L34,57.6 L33.2,60.5 L30.8,60.5 L30,57.6 L20,59 L20,55.5 L29,49 L28.5,40 L6,42.5 L6,37 L28.5,21 Q28.5,9 32,4 Z'),
      Dt('M32,11.5 Q33.7,14 33.7,18 Q33.7,21 32,21.6 Q30.3,21 30.3,18 Q30.3,14 32,11.5 Z'),
    ],
  },
  bomber: {
    view: 'top',
    prims: [
      B('M32,3 Q34.6,6.5 34.6,13 L34.6,24 L61,36 L61,39.5 L34.6,33.5 L34.2,50 L45,55.5 L45,58.5 L33.6,57.5 L32.8,61 L31.2,61 L30.4,57.5 L19,58.5 L19,55.5 L29.8,50 L29.4,33.5 L3,39.5 L3,36 L29.4,24 L29.4,13 Q29.4,6.5 32,3 Z'),
      Ln('M41.5,29.5 L41.5,22'),
      Ln('M50.5,33.5 L50.5,26.8'),
      Ln('M22.5,29.5 L22.5,22'),
      Ln('M13.5,33.5 L13.5,26.8'),
    ],
  },
  // ---------- aeronaves de lado (nariz para a direita) ----------
  jetSide: {
    view: 'side',
    prims: [
      B('M9.5,31.8 L5.5,19 L11,19 L18.5,31.3 Z'),
      B('M5,35.5 L11,31.5 L40,30.5 Q53,30.5 60,35 Q53,38.5 40,38.5 L9,39 Z'),
      B('M23.5,37 L37.5,37 L29.5,45 L21.5,45 Z'),
      Ln('M40.5,30.8 Q45,25.8 51.5,31.5'),
    ],
  },
  bomberSide: {
    view: 'side',
    prims: [
      B('M8,31.4 L4,17 L10,17 L17,30.8 Z'),
      B('M4,34.5 L10,31 L47,30 Q57,30 61,34 Q57,37.5 47,37.5 L9,37.5 Z'),
      B('M25,36.5 L41,36.5 L33,42.5 L23,42.5 Z'),
      B('M29.5,42.5 L36,42.5 Q38,42.5 38,44.5 Q38,46.5 36,46.5 L29.5,46.5 Q27.5,46.5 27.5,44.5 Q27.5,42.5 29.5,42.5 Z'),
      Dt('M49,32.2 L54.5,32.2'),
    ],
  },
  helicopter: {
    view: 'side',
    prims: [
      B('M25,28.6 L9,29.6 L6.5,22.5 L3.6,22.5 L5,33.8 L25,35 Z'),
      B('M27,25 L41,25 Q50,25 53,32 Q55,39 47,39 L29,39 Q25,39 25,35 L25,27 Q25,25 27,25 Z'),
      Dt('M43,27.6 Q48.6,28.6 50.6,33 L43,33 Z'),
      Ln('M10,19 L56,19'),
      Ln('M38,19 L38,25'),
      Ln('M31,39 L30,46'),
      Ln('M45,39 L46,46'),
      Ln('M26,46 L50,46 Q53,46 54.5,43.5'),
    ],
  },
  // ---------- navios (de lado, proa para a direita) ----------
  ship: {
    view: 'side',
    prims: [
      B('M5,37 L60,35 L53.5,47 L9.5,47 Z'),
      B('M29,36.1 L29,25 L41,25 L47,30.5 L47,35.5 Z'),
      B('M14,36.7 L14,31.5 L24,31.5 L24,36.3 Z'),
      Dt('M31.5,28.5 L43.5,28.5'),
      Ln('M35,25 L35,12'),
      Ln('M31,17 L39,17'),
    ],
  },
  icebreaker: {
    view: 'side',
    prims: [
      B('M4,35 L57.5,34 Q54.5,44 46,49.5 L9,49.5 Z'),
      B('M18,34.7 L18,23 L22,19 L37,19 L39,23 L39,34.3 Z'),
      Dt('M22,24.5 L35.5,24.5'),
      Ln('M29,19 L29,9'),
      Ln('M25.5,12.5 L32.5,12.5'),
      Ln('M44.5,53.5 L48,49.8 L56.5,48.6 L61.5,51.6 L57,55 L47.5,55.6 Z'),
      Ln('M53,49.2 L54.6,52.2 L52.8,55.3'),
    ],
  },
  warship: {
    view: 'side',
    prims: [
      B('M4,41 L60,39 L53,50 L8,50 Z'),
      B('M20,40.4 L20,31 L28,31 L30,25 L39,25 L41,31 L45,31 L45,39.6 Z'),
      B('M9,40.7 L10.5,36 L16.5,34 L16.5,40.4 Z'),
      Dt('M22.5,34.5 L42,34.5'),
      Ln('M34.5,25 L34.5,12'),
      Ln('M31,16.5 L38,16.5'),
      B('M48,39.3 L49,35.5 L53.5,35.5 L54.5,39.1 Z'),
      Ln('M53,36.5 L59.5,34'),
    ],
  },
  submarine: {
    view: 'side',
    prims: [
      B('M7.5,37.2 L4.5,29.5 L9,29.5 L12.5,34.6'),
      B('M3,40 L11,35 Q15,33 21,33 L47,33 Q61,33 61,40 Q61,47 47,47 L21,47 Q15,47 11,45 Z'),
      B('M28,33.2 L30.5,23.5 L40,23.5 L42.5,33.2 Z'),
      Ln('M25.5,28.5 L45,28.5'),
      Ln('M35.5,23.5 L35.5,17.5'),
    ],
  },
  boat: {
    view: 'side',
    prims: [
      B('M4,33 L60,31 Q57,42 48,44 L11,44 Z'),
      Dt('M8,37.3 L56.5,35.6'),
      B('M29,31.9 L31.5,23.5 L38.5,23.5 L38.5,31.6 Z'),
      Ln('M5.5,33 L4,40.5'),
    ],
  },
  /** navio visto de cima (proa para cima): para trilhas orientadas no mapa */
  shipTop: {
    view: 'top',
    prims: [
      B('M32,3 Q40.5,12 41,28 L41,56 Q41,61 36.5,61 L27.5,61 Q23,61 23,56 L23,28 Q23.5,12 32,3 Z'),
      Dt('M27.5,22 L36.5,22 L36.5,37 L27.5,37 Z'),
      Dt('M23,49 L41,49'),
    ],
  },
  missile: {
    view: 'side',
    prims: [
      B('M10,29 L45,29 Q55,29 60,32 Q55,35 45,35 L10,35 Z'),
      Dt('M44,29 L44,35'),
      Ln('M18.5,29 L12.5,22 L6,22 L10,29'),
      Ln('M18.5,35 L12.5,42 L6,42 L10,35'),
    ],
  },
  // ---------- sensores e comunicacao ----------
  satellite: {
    view: 'flat',
    tf: 'rotate(-35 32 32)',
    prims: [
      B('M5,27 L23,27 L23,37 L5,37 Z'),
      B('M41,27 L59,27 L59,37 L41,37 Z'),
      B('M27,24 L37,24 L37,40 L27,40 Z'),
      Dt('M11,27 L11,37'),
      Dt('M17,27 L17,37'),
      Dt('M47,27 L47,37'),
      Dt('M53,27 L53,37'),
      Ln('M23,32 L27,32'),
      Ln('M37,32 L41,32'),
      Ln('M32,24 L32,19.5'),
      Ln('M26,15.5 Q32,22 38,15.5'),
    ],
  },
  radarDish: {
    view: 'flat',
    prims: [
      Ln('M21,39.5 L28,51'),
      Ln('M28,51 L21,58'),
      Ln('M28,51 L35,58'),
      Ln('M15,58 L41,58'),
      B('M14,12 Q14,46 48,46 Z'),
      Ln('M22.5,37.5 L40,20'),
      circ(41.8, 18.2, 2.6, 'dot'),
    ],
  },
  radarDome: {
    view: 'flat',
    prims: [
      B('M14,54 L14,40 L50,40 L50,54 Z'),
      B('M15,40 A18,18 0 1 1 49,40 Z'),
      Dt('M14.8,29 Q32,35.5 49.2,29'),
      Dt('M32,16.2 Q25,27 26.5,40'),
      Dt('M32,16.2 Q39,27 37.5,40'),
      Dt('M28.5,54 L28.5,46.5 L35.5,46.5 L35.5,54'),
      Ln('M6,54 L58,54'),
    ],
  },
  antenna: {
    view: 'flat',
    prims: [
      Ln('M21,58 L32,15 L43,58'),
      Ln('M28.2,30 L35.8,30'),
      Ln('M24.6,44 L39.4,44'),
      Ln('M28.2,30 L39.4,44'),
      Ln('M35.8,30 L24.6,44'),
      circ(32, 12, 2.8, 'dot'),
      Ln('M25.5,6 Q21,12 25.5,18'),
      Ln('M38.5,6 Q43,12 38.5,18'),
      Ln('M20.5,2.5 Q13,12 20.5,21.5'),
      Ln('M43.5,2.5 Q51,12 43.5,21.5'),
    ],
  },
  eye: {
    view: 'flat',
    prims: [B('M4,32 Q32,5 60,32 Q32,59 4,32 Z'), Dt('M32,22 A10,10 0 1 1 31.99,22 Z'), circ(32, 32, 4.2, 'detail', {cutFill: true})],
  },
  cyber: {
    view: 'flat',
    prims: [
      B('M6,13 Q6,9 10,9 L54,9 Q58,9 58,13 L58,41 Q58,45 54,45 L10,45 Q6,45 6,41 Z'),
      Ln('M27,45 L25,54.5'),
      Ln('M37,45 L39,54.5'),
      Ln('M19,55 L45,55'),
      Dt('M21,20 L14.5,27 L21,34'),
      Dt('M43,20 L49.5,27 L43,34'),
      Dt('M35.5,18 L28.5,36'),
    ],
  },
  // ---------- apoio e logistica ----------
  fuel: {
    view: 'flat',
    prims: [
      B('M14,57 L14,12 Q14,7 19,7 L35,7 Q40,7 40,12 L40,57 Z'),
      Dt('M27,14.5 Q21,22.5 21,26 A6,6 0 0 0 33,26 Q33,22.5 27,14.5 Z', {cutFill: true}),
      Ln('M9,57 L45,57'),
      Ln('M40,41 L44.5,41 Q48.5,41 48.5,37 L48.5,20 L43.5,14.5'),
    ],
  },
  wrench: {
    view: 'flat',
    tf: 'rotate(-45 33 32)',
    prims: [B('M12,28 L38.83,28 A10,10 0 0 1 57.37,28.5 L47,28.5 L47,35.5 L57.37,35.5 A10,10 0 0 1 38.83,36 L12,36 A4,4 0 0 1 12,28 Z')],
  },
  medical: {
    view: 'flat',
    prims: [
      Ln('M24,17 L24,11.5 Q24,8.5 27,8.5 L37,8.5 Q40,8.5 40,11.5 L40,17'),
      B('M8,22 Q8,17 13,17 L51,17 Q56,17 56,22 L56,52 Q56,57 51,57 L13,57 Q8,57 8,52 Z'),
      Dt('M28.5,25 L35.5,25 L35.5,33.5 L44,33.5 L44,40.5 L35.5,40.5 L35.5,49 L28.5,49 L28.5,40.5 L20,40.5 L20,33.5 L28.5,33.5 Z', {cutFill: true}),
    ],
  },
  runway: {
    view: 'flat',
    prims: [
      B('M17,58 L28,7 L36,7 L47,58 Z'),
      Dt('M32,11.5 L32,15.5'),
      Dt('M32,20.5 L32,26.5'),
      Dt('M32,32 L32,40'),
      Dt('M32,45.5 L32,54.5'),
    ],
  },
  hangar: {
    view: 'flat',
    prims: [
      B('M6,54 L6,34 Q6,14 32,14 Q58,14 58,34 L58,54 Z'),
      Dt('M17,54 L17,32 L47,32 L47,54'),
      Dt('M27,32 L27,54'),
      Dt('M37,32 L37,54'),
      Ln('M2,54 L62,54'),
    ],
  },
  ammo: {view: 'flat', prims: ammo()},
  cargo: {
    view: 'flat',
    prims: [
      B('M5,49 L5,19 L59,19 L59,49 Z'),
      ...[14, 23, 32, 41, 50].map((x) => Dt(`M${x},24 L${x},44`)),
    ],
  },
  truck: {
    view: 'side',
    prims: [
      B('M4,15 L36,15 L36,43 L4,43 Z'),
      B('M36,43 L36,24 L49,24 L58,34.5 L58,43 Z'),
      Dt('M40,28 L47.5,28 L53,34.5 L40,34.5 Z'),
      circ(14, 46, 6, 'body', {occlude: true}),
      circ(47, 46, 6, 'body', {occlude: true}),
      circ(14, 46, 1.8, 'detail', {cutFill: true}),
      circ(47, 46, 1.8, 'detail', {cutFill: true}),
    ],
  },
  crane: {
    view: 'flat',
    prims: [
      Ln('M18,58 L18,13'),
      Ln('M25,58 L25,13'),
      Ln('M18,52 L25,45 L18,38 L25,31 L18,24 L25,17'),
      Ln('M8,13 L60,13'),
      Ln('M25,18 L60,13'),
      Ln('M21.5,13 L21.5,5'),
      Ln('M8,13 L21.5,5 L60,13'),
      B('M8,13 L15,13 L15,20 L8,20 Z'),
      Ln('M47,13 L47,36 Q47,40.5 43.5,40.5 Q40.5,40.5 40.5,37'),
      Ln('M11,58 L32,58'),
    ],
  },
  money: {
    view: 'flat',
    prims: [
      circ(32, 32, 25, 'body'),
      Dt('M40.5,23.5 Q38.5,18.5 32,18.5 Q23.5,18.5 23.5,25.2 Q23.5,31 32,32 Q40.5,33 40.5,39 Q40.5,45.5 32,45.5 Q25,45.5 23,40.5'),
      Dt('M32,13 L32,51'),
    ],
  },
  document: {
    view: 'flat',
    prims: [
      B('M14,6 L40,6 L52,18 L52,58 L14,58 Z'),
      Dt('M40,6 L40,18 L52,18'),
      Dt('M20,28 L46,28'),
      Dt('M20,36 L46,36'),
      Dt('M20,44 L38,44'),
    ],
  },
  clock: {
    view: 'flat',
    prims: [
      circ(32, 32, 25, 'body'),
      Dt('M32,9.5 L32,13'),
      Dt('M54.5,32 L51,32'),
      Dt('M32,54.5 L32,51'),
      Dt('M9.5,32 L13,32'),
      Dt('M32,32 L32,17.5'),
      Dt('M32,32 L42,38'),
      circ(32, 32, 2.2, 'detail', {cutFill: true}),
    ],
  },
  calendar: {
    view: 'flat',
    prims: [
      B('M8,14 Q8,11 11,11 L53,11 Q56,11 56,14 L56,55 Q56,58 53,58 L11,58 Q8,58 8,55 Z'),
      Dt('M8,23 L56,23'),
      ...calendarDays(),
      Ln('M20,6 L20,15'),
      Ln('M44,6 L44,15'),
    ],
  },
  lifebuoy: {
    view: 'flat',
    prims: [
      B('M8,32 A24,24 0 1 0 56,32 A24,24 0 1 0 8,32 Z M21,32 A11,11 0 1 0 43,32 A11,11 0 1 0 21,32 Z', {noStroke: true, rule: 'evenodd'}),
      circ(32, 32, 24, 'line'),
      circ(32, 32, 11, 'line'),
      ...[45, 135, 225, 315].map((a) => Dt(annularSectorD(32, 32, 11, 24, a - 11, a + 11), {cutFill: true})),
    ],
  },
  buoy: {
    view: 'flat',
    prims: [
      B('M23,46 L27,22 L37,22 L41,46 Z'),
      Dt('M25,34 L39,34'),
      Ln('M32,22 L32,18.5'),
      circ(32, 15.5, 3, 'body'),
      Ln('M17,46 L47,46'),
      Ln('M5,53 Q11.5,48.5 18,53 T31,53 T44,53 T57,53'),
    ],
  },
  // ---------- pessoas e lugares ----------
  person: {
    view: 'flat',
    prims: [
      circ(32, 8.6, 6, 'body'),
      B('M23.6,18.2 Q23.6,15.2 26.6,15.2 H37.4 Q40.4,15.2 40.4,18.2 V36.8 Q40.4,38.9 38.3,38.9 H37.4 V59 Q37.4,61.4 35.3,61.4 H34.1 Q32.6,61.4 32.6,59 V41 H31.4 V59 Q31.4,61.4 29.9,61.4 H28.7 Q26.6,61.4 26.6,59 V38.9 H25.7 Q23.6,38.9 23.6,36.8 Z'),
    ],
  },
  people: {
    view: 'flat',
    prims: [
      circ(10.5, 28, 5, 'body'),
      B('M3,53 L3,48.5 Q3,39 10.5,39 Q18,39 18,48.5 L18,53 Z'),
      circ(53.5, 28, 5, 'body'),
      B('M61,53 L61,48.5 Q61,39 53.5,39 Q46,39 46,48.5 L46,53 Z'),
      circ(32, 19.5, 7, 'body'),
      B('M21.5,53 L21.5,46 Q21.5,33 32,33 Q42.5,33 42.5,46 L42.5,53 Z'),
    ],
  },
  house: {
    view: 'flat',
    prims: [
      B('M15,56 L15,29 L32,14 L49,29 L49,56 Z'),
      Ln('M9,33 L32,11 L55,33'),
      Ln('M41,19.6 L41,13 L46,13 L46,24.4'),
      Dt('M27.5,56 L27.5,42 L36.5,42 L36.5,56'),
    ],
  },
  handshake: {
    view: 'flat',
    prims: [
      B('M2,23 L11,23 L11,45 L2,45 Z'),
      B('M62,23 L53,23 L53,45 L62,45 Z'),
      // mao A (da esquerda, por baixo)
      B('M11,26 L22,23.5 Q26,22.5 30,23.5 L36,26 L36,40 L24,45 L11,42 Z'),
      // mao B (da direita, por cima): quatro dedos dobrados sobre a mao A
      B('M53,26 L43,23.5 Q39,22.5 35.5,24.5 L29,28.5 Q25,31 27,34.2 Q29,36.5 32,34.8 L29.5,37.5 Q27.5,40.5 30.2,42.3 Q32.6,43.6 35,41.6 L33.4,44 Q31.8,47 34.5,48.4 Q37,49.4 39,47.2 L45,42 L53,42 Z', {occlude: true}),
      // polegar de A por cima da mao B
      B('M29.5,26.2 Q33,21.5 38,21.8 L44,22.6 Q47,23.2 46.4,25.8 Q45.6,28 42.8,27.6 L36,26.8 Q32.5,26.6 29.5,26.2 Z', {occlude: true}),
    ],
  },
  // ---------- tempo e natureza ----------
  sun: {view: 'flat', prims: [circ(32, 32, 11, 'body'), ...rays(32, 32, 17, 26, 8, 0)]},
  moon: {view: 'flat', prims: [B('M33,8 A24,24 0 1 0 55.16,41.24 A20,20 0 0 1 33,8 Z')]},
  cloud: {view: 'flat', prims: [B('M16.3,48 A9.6,9.6 0 0 1 16.29,28.8 A14.4,14.4 0 0 1 43.5,22.24 A13.2,13.2 0 1 1 47.5,48 Z')]},
  snowflake: {view: 'flat', prims: snowflake()},
  wave: {
    view: 'flat',
    prims: [
      Ln('M4,21 Q11,14 18,21 T32,21 T46,21 T60,21'),
      Ln('M4,33 Q11,26 18,33 T32,33 T46,33 T60,33'),
      Ln('M4,45 Q11,38 18,45 T32,45 T46,45 T60,45'),
    ],
  },
  // ---------- simbolos ----------
  magnifier: {
    view: 'flat',
    prims: [
      Ln('M37,37 L52,52'),
      circ(27, 27, 15, 'line'),
      Dt('M19.5,22 Q21,17.5 25.5,16.5'),
      Ln('M40.97,36.03 L56.47,51.53 A3.5,3.5 0 0 1 51.53,56.47 L36.03,40.97'),
    ],
  },
  check: {view: 'flat', prims: [Ln('M12,33 L26,47 L52,17')]},
  cross: {view: 'flat', prims: [Ln('M15,15 L49,49'), Ln('M49,15 L15,49')]},
  star: {view: 'flat', prims: [B(starD(32, 34, 27, 11.2))]},
  pin: {
    view: 'flat',
    prims: [B('M32,58 C27,51 13,38 13,25 A19,19 0 0 1 51,25 C51,38 37,51 32,58 Z'), circ(32, 25, 7, 'detail', {cutFill: true})],
  },
  warning: {
    view: 'flat',
    prims: [B('M32,7 L59,55 L5,55 Z'), Dt('M32,23 L32,39'), circ(32, 46.5, 2.3, 'detail', {cutFill: true})],
  },
  route: {
    view: 'flat',
    prims: [
      circ(12, 52, 3.4, 'dot'),
      Ln('M16,51.5 C31,49 17,35 32,34 C44,33 46,31 47.2,27.5'),
      B('M48,27 C46,23.5 41,18.5 41,13.5 A7,7 0 0 1 55,13.5 C55,18.5 50,23.5 48,27 Z'),
      circ(48, 13.5, 2.6, 'detail', {cutFill: true}),
    ],
  },
  shield: {view: 'flat', prims: [B('M32,6 L53,13.5 L53,30 Q53,47 32,58 Q11,47 11,30 L11,13.5 Z')]},
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof ICONS | 'fighter';
export const ICON_NAMES = Object.keys(ICONS) as (keyof typeof ICONS)[];

const def = (name: IconName): IconDef => (name === 'fighter' ? ICONS.jet : ICONS[name]);
/** Como o desenho esta orientado (para MovingTrack decidir entre girar ou espelhar). */
export const iconView = (name: IconName): IconView => def(name).view;

export type IconStyle = {
  /** cor do traco (padrao: tinta) */
  color?: string;
  /** cor de preenchimento das silhuetas (variante solida, ex. C.red) */
  fill?: string;
  /** opacidade do preenchimento das silhuetas (ex. 0.14 para "vaga vazia") */
  fillOpacity?: number;
  /** cor dos detalhes "entalhados" quando preenchido (padrao: preto do tema) */
  cut?: string;
  /** espessura do traco em px NA TELA para o tamanho dado (padrao: 2,5 * size/64) */
  strokeW?: number;
  /** contorno tracejado (vaga vazia / planejado) */
  dashed?: boolean;
  opacity?: number;
};

/** Primitivas do icone no espaco 64x64 (uso interno: Icon, IconHtml, PictogramGrid). */
export const IconPrims: React.FC<IconStyle & {name: IconName; k: number; cls?: string}> = ({
  name,
  k,
  cls,
  color = C.ink,
  fill,
  fillOpacity,
  cut = C.black,
  strokeW,
  dashed,
}) => {
  const d = def(name);
  const sw = strokeW === undefined ? 2.5 : strokeW / k;
  const filled = fill !== undefined && fill !== 'none';
  const dash = dashed ? `${sw * 1.7} ${sw * 1.5}` : undefined;
  return (
    <g transform={d.tf}>
      {d.prims.map((p, i) => {
        let stroke = color;
        let f = 'none';
        let fo: number | undefined;
        if (p.role === 'body') {
          f = filled ? (fill as string) : p.occlude ? cut : 'none';
          if (filled) fo = fillOpacity;
        }
        else if (p.role === 'detail') {
          stroke = filled ? cut : color;
          if (p.cutFill) f = filled ? cut : color;
        } else if (p.role === 'dot') f = color;
        if (p.noStroke) {
          if (!filled) return null;
          stroke = 'none';
        }
        const classes = [cls && stroke !== 'none' ? `${cls}-p` : '', cls && f !== 'none' ? `${cls}-f` : ''].filter(Boolean).join(' ') || undefined;
        const common = {
          className: classes,
          fill: f,
          fillOpacity: fo,
          fillRule: p.rule,
          stroke,
          strokeWidth: stroke === 'none' ? undefined : sw,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
          strokeDasharray: stroke === 'none' ? undefined : dash,
        };
        return p.c ? <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} {...common} /> : <path key={i} d={p.d} {...common} />;
      })}
    </g>
  );
};

const SHADOW = `drop-shadow(0px 3px 6px ${C.shadow})`;

/**
 * Icone dentro de um <svg> (inclusive no MapSvg: use size={px(48)} para tamanho constante na tela).
 * (x, y) = centro. O <g className={cls}> interno e o alvo das animacoes (pop, escala); as primitivas
 * recebem `${cls}-p` / `${cls}-f`.
 */
export const Icon: React.FC<
  IconStyle & {
    name: IconName;
    x?: number;
    y?: number;
    size?: number;
    /** rotacao em graus em torno do centro */
    rot?: number;
    /** espelha na horizontal (navio indo para a esquerda) */
    flip?: boolean;
    cls?: string;
    shadow?: boolean;
  }
> = ({name, x = 0, y = 0, size = 64, rot = 0, flip, cls, shadow, opacity, ...style}) => {
  const k = size / 64;
  return (
    <g style={shadow ? {filter: SHADOW} : undefined} opacity={opacity}>
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -k : k} ${k}) translate(-32 -32)`}>
        <g className={cls}>
          <IconPrims name={name} k={k} cls={cls} {...style} />
        </g>
      </g>
    </g>
  );
};

/** O mesmo icone em HTML (posicionado com at(): sem tremedeira). (x, y) = centro. */
export const IconHtml: React.FC<
  IconStyle & {name: IconName; x: number; y: number; size?: number; rot?: number; flip?: boolean; cls?: string; shadow?: boolean}
> = ({name, x, y, size = 96, rot = 0, flip, cls, shadow = true, opacity, ...style}) => {
  const k = size / 64;
  return (
    <div style={{...at(x, y), width: size, height: size, opacity}}>
      <div className={cls} style={{width: size, height: size}}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          style={{display: 'block', overflow: 'visible', filter: shadow ? SHADOW : undefined, transform: rot || flip ? `rotate(${rot}deg) scaleX(${flip ? -1 : 1})` : undefined}}
        >
          <IconPrims name={name} k={k} cls={cls} {...style} />
        </svg>
      </div>
    </div>
  );
};
