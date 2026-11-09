// Atalhos GSAP do kit (src/components/kit). Mesma filosofia de lib/tl.ts: tempos e curvas iguais no
// filme todo, nada de callbacks/repeat, so tweens de elementos (useGsapTimeline + useLocal()).
// Cada helper define o estado inicial (escondido) do que ele anima; o que nao for animado fica visivel.
import {draw, fadeIn, marker, pop, slideIn, wipeText} from './tl';

type TL = gsap.core.Timeline;
type Q = gsap.utils.SelectorFunc;

/** Tempo (s) entre o inicio do stampIn e o impacto. SFX: {at: inicio + STAMP_HIT - 0.008, file: 'stamp'}. */
export const STAMP_HIT = 0.14;

/** Carimbo: cai de 1,5x ate 1x acelerando, bate, comprime 3% e volta (um unico overshoot, sem oscilar). */
export const stampIn = (tl: TL, q: Q, cls: string, at: number, from = 1.5) => {
  const el = q(`.${cls}`);
  if (!el.length) return;
  tl.fromTo(el, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.05, ease: 'none'}, at);
  tl.fromTo(el, {scale: from}, {scale: 1, duration: STAMP_HIT, ease: 'power2.in'}, at);
  tl.to(el, {scale: 0.97, duration: 0.07, ease: 'power1.out'}, at + STAMP_HIT);
  tl.to(el, {scale: 1, duration: 0.16, ease: 'power1.inOut'}, at + STAMP_HIT + 0.07);
};

/**
 * Icone que se desenha: os tracos `${cls}-p` (DrawSVG, com um leve escalonamento) e depois os
 * preenchimentos `${cls}-f` acendem. Para IconBadge use `${cls}-ic`.
 */
export const drawIcon = (tl: TL, q: Q, cls: string, at: number, dur = 0.7) => {
  const all = q(`.${cls}-p`);
  // icone tracejado: o DrawSVG apagaria o tracejado, entao ele so aparece (fade)
  const dashed = all.filter((el) => el.getAttribute('stroke-dasharray'));
  const strokes = all.filter((el) => !el.getAttribute('stroke-dasharray'));
  const n = strokes.length;
  if (n) {
    const each = n > 1 ? Math.min(0.06, (dur * 0.35) / (n - 1)) : 0;
    tl.fromTo(strokes, {drawSVG: '0% 0%'}, {drawSVG: '0% 100%', duration: dur - each * (n - 1), ease: 'power2.inOut', stagger: each}, at);
  }
  if (dashed.length) tl.fromTo(dashed, {autoAlpha: 0}, {autoAlpha: 1, duration: dur * 0.6, ease: 'power1.inOut'}, at);
  const fills = q(`.${cls}-f`);
  // acende ate a opacidade propria de cada preenchimento (ex. fillOpacity 0.14 da "vaga vazia")
  const own = (_: number, el: Element) => Number(el.getAttribute('fill-opacity') ?? 1);
  if (fills.length) tl.fromTo(fills, {fillOpacity: 0}, {fillOpacity: own, duration: 0.3, ease: 'power1.inOut'}, at + dur * 0.7);
};

/** IconBadge: o disco salta (pop), o icone se desenha por dentro e o rotulo e revelado. */
export const popIn = (tl: TL, q: Q, cls: string, at: number, opts: {rot?: number; drawIcon?: boolean} = {}) => {
  const {rot = 0, drawIcon: drawIt = true} = opts;
  pop(tl, q, `.${cls}`, at, rot, 0.42);
  if (drawIt) drawIcon(tl, q, `${cls}-ic`, at + 0.1, 0.55);
  wipeText(tl, q, `.${cls}-lbl`, at + 0.2, 0.35);
};

/** pop() para elementos SVG (Icon, grupos): mesma entrada, mas com origem no centro do proprio elemento. */
export const popSvg = (tl: TL, q: Q, sel: string, at: number, rot = 0, dur = 0.42) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(
    els,
    {scale: 0.55, rotation: rot - 7, autoAlpha: 0, transformOrigin: '50% 50%'},
    {scale: 1, rotation: rot, autoAlpha: 1, duration: dur, ease: 'back.out(1.5)'},
    at,
  );
};

/** Saida rapida (encolhe + some, pelo centro; serve para HTML e SVG). */
export const popOut = (tl: TL, q: Q, sel: string, at: number, dur = 0.3) => {
  const els = q(sel);
  if (!els.length) return;
  tl.to(els, {scale: 0.6, autoAlpha: 0, transformOrigin: '50% 50%', duration: dur, ease: 'power2.in'}, at);
};

/** "Desdesenha" tracos (o traco recolhe para o fim). */
export const drawOut = (tl: TL, q: Q, sel: string, at: number, dur = 0.4) => {
  const els = q(sel);
  if (!els.length) return;
  tl.to(els, {drawSVG: '100% 100%', duration: dur, ease: 'power2.in'}, at);
};

/** Counter: o numero e revelado por mascara e a linha de unidade logo depois. */
export const counterIn = (tl: TL, q: Q, cls: string, at: number) => {
  wipeText(tl, q, `.${cls}`, at, 0.4);
  wipeText(tl, q, `.${cls}-unit`, at + 0.18, 0.4);
};

/** DocCard: o papel desliza para dentro, o titulo aparece e as linhas cinza se "digitam". */
export const docIn = (tl: TL, q: Q, cls: string, at: number, fromX = -760) => {
  slideIn(tl, q, `.${cls}`, at, fromX, 0, 0.7);
  wipeText(tl, q, `.${cls}-ttl`, at + 0.3, 0.45);
  const lines = q(`.${cls}-ln`);
  if (lines.length) tl.fromTo(lines, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: 0.22, ease: 'power2.out', stagger: 0.035}, at + 0.4);
  fadeIn(tl, q, `.${cls}-hl-base`, at + 0.55, 0.3);
};

/** DocCard: cada linha destacada recebe a passada do marcador vermelho (uma depois da outra, +0.28 s). */
export const docHighlight = (tl: TL, q: Q, cls: string, at: number, each = 0.28) => {
  for (let i = 0; q(`.${cls}-hl${i}-bar`).length; i++) marker(tl, q, `${cls}-hl${i}`, at + i * each);
};

/** Checklist: caixa + texto da linha i, e (se mark) o check vermelho logo depois. */
export const checkIn = (tl: TL, q: Q, cls: string, i: number, at: number, mark = true) => {
  draw(tl, q, `.${cls}-box-${i}`, at, 0.3, 'power1.inOut');
  wipeText(tl, q, `.${cls}-row-${i}`, at + 0.05, 0.4);
  if (mark) checkMark(tl, q, cls, i, at + 0.3);
};

/** Checklist: so a marca (check ou x) da linha i se desenha. */
export const checkMark = (tl: TL, q: Q, cls: string, i: number, at: number, dur = 0.34) => {
  const els = q(`.${cls}-ck-${i}`);
  if (!els.length) return;
  tl.fromTo(els, {drawSVG: '0% 0%'}, {drawSVG: '0% 100%', duration: dur, ease: 'power2.in', stagger: dur * 0.7}, at);
};

/** PictogramGrid: as celulas brotam de baixo, uma depois da outra (each = intervalo em s). */
export const gridIn = (tl: TL, q: Q, cls: string, at: number, each = 0.03) => {
  const els = q(`.${cls}-c`);
  if (!els.length) return;
  tl.fromTo(els, {scale: 0, transformOrigin: '50% 100%'}, {scale: 1, duration: 0.3, ease: 'back.out(1.8)', stagger: each}, at);
};

/** Timeline: eixo se desenha, ticks e anos acompanham da esquerda para a direita. */
export const timelineIn = (tl: TL, q: Q, cls: string, at: number, dur = 0.9) => {
  draw(tl, q, `.${cls}-axis`, at, dur, 'power2.inOut');
  draw(tl, q, `.${cls}-arw`, at + dur - 0.06, 0.16, 'power1.out');
  const tk = q(`.${cls}-tk`);
  if (tk.length) {
    tl.fromTo(tk, {drawSVG: '0% 0%'}, {drawSVG: '0% 100%', duration: 0.14, ease: 'none', stagger: (dur * 0.8) / Math.max(1, tk.length - 1)}, at + dur * 0.1);
  }
  const yr = q(`.${cls}-yr`);
  if (yr.length) {
    tl.fromTo(yr, {autoAlpha: 0, y: 10}, {autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: (dur * 0.8) / Math.max(1, yr.length - 1)}, at + dur * 0.15);
  }
};

/** Timeline: marco i (ponto salta, haste sobe, rotulo aparece). */
export const timelineMark = (tl: TL, q: Q, cls: string, i: number, at: number) => {
  const dot = q(`.${cls}-m${i}-dot`);
  if (dot.length) tl.fromTo(dot, {scale: 0, transformOrigin: '50% 50%'}, {scale: 1, duration: 0.3, ease: 'back.out(2.2)'}, at);
  draw(tl, q, `.${cls}-m${i}-stem`, at + 0.08, 0.25, 'power2.out');
  wipeText(tl, q, `.${cls}-m${i}-lbl`, at + 0.22, 0.35);
};

/** Timeline: faixa i (preenchimento cresce da esquerda, ou colchete se desenha) + rotulo. */
export const timelineBand = (tl: TL, q: Q, cls: string, i: number, at: number, dur = 0.6) => {
  const rect = q(`.${cls}-b${i}-rect`);
  if (rect.length) tl.fromTo(rect, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: dur, ease: 'power2.inOut'}, at);
  draw(tl, q, `.${cls}-b${i}-brk`, at, dur, 'power2.inOut');
  wipeText(tl, q, `.${cls}-b${i}-lbl`, at + dur * 0.6, 0.35);
};

/** Timeline: o marcador HOJE cai no eixo como um carimbo (mesmo STAMP_HIT). */
export const timelineToday = (tl: TL, q: Q, cls: string, at: number) => {
  const el = q(`.${cls}-today`);
  if (!el.length) return;
  tl.fromTo(el, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.05, ease: 'none'}, at);
  tl.fromTo(el, {y: -48}, {y: 0, duration: STAMP_HIT, ease: 'power2.in'}, at);
  tl.to(el, {y: 3, duration: 0.07, ease: 'power1.out'}, at + STAMP_HIT);
  tl.to(el, {y: 0, duration: 0.16, ease: 'power1.inOut'}, at + STAMP_HIT + 0.07);
};

/** StatBar: rotulo, trilho, preenchimento crescendo da esquerda, alvo e valor. */
export const barIn = (tl: TL, q: Q, cls: string, at: number, dur = 0.9) => {
  wipeText(tl, q, `.${cls}-lbl`, at, 0.4);
  fadeIn(tl, q, `.${cls}-track`, at, 0.3);
  const fill = q(`.${cls}-fill`);
  if (fill.length) tl.fromTo(fill, {scaleX: 0, transformOrigin: '0% 50%'}, {scaleX: 1, duration: dur, ease: 'power2.inOut'}, at + 0.15);
  const tgt = q(`.${cls}-tgt`);
  if (tgt.length) tl.fromTo(tgt, {autoAlpha: 0, scaleY: 0, transformOrigin: '50% 50%'}, {autoAlpha: 1, scaleY: 1, duration: 0.3, ease: 'power2.out'}, at + 0.1);
  wipeText(tl, q, `.${cls}-tgl`, at + 0.25, 0.35);
  wipeText(tl, q, `.${cls}-val`, at + 0.15 + dur * 0.85, 0.35);
};

/** Dimension: a linha se desenha, os ticks das pontas fecham e o rotulo aparece (como as cotas da Intro). */
export const dimIn = (tl: TL, q: Q, cls: string, at: number, dur = 0.45) => {
  draw(tl, q, `.${cls}-l`, at, dur);
  draw(tl, q, `.${cls}-t`, at + dur - 0.02, 0.12, 'none');
  wipeText(tl, q, `.${cls}-lbl`, at + dur * 0.55, 0.35);
};

/** Callout: o circulo a mao se desenha, a linha guia sai dele e o rotulo aparece. */
export const calloutIn = (tl: TL, q: Q, cls: string, at: number) => {
  draw(tl, q, `.${cls}-ring`, at, 0.5, 'power2.inOut');
  draw(tl, q, `.${cls}-lead`, at + 0.42, 0.28, 'power2.out');
  wipeText(tl, q, `.${cls}-lbl`, at + 0.62, 0.35);
};

/** RangeRing: o anel (tracejado ou solido) se desenha em volta do centro; o miolo acende. */
export const ringIn = (tl: TL, q: Q, cls: string, at: number, dur = 0.9) => {
  draw(tl, q, `.${cls}-rev, .${cls}-ring`, at, dur, 'power2.inOut');
  fadeIn(tl, q, `.${cls}-fill`, at + dur * 0.3, dur * 0.7);
  const dot = q(`.${cls}-dot`);
  if (dot.length) tl.fromTo(dot, {scale: 0, transformOrigin: '50% 50%'}, {scale: 1, duration: 0.25, ease: 'back.out(2)'}, at);
};

/** Pulse: o anel aparece em `at`, cresce de data-r0 ate data-r1 (traco constante) e some. Uma vez so. */
export const pulseOnce = (tl: TL, q: Q, cls: string, at: number, dur = 0.9) => {
  const g = q(`.${cls}`);
  const c = q(`.${cls}-c`);
  if (!g.length || !c.length) return;
  tl.fromTo(g, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.01, ease: 'none'}, at);
  tl.fromTo(
    c,
    {attr: {r: (_: number, el: Element) => Number(el.getAttribute('data-r0'))}, opacity: 0.95},
    {attr: {r: (_: number, el: Element) => Number(el.getAttribute('data-r1'))}, opacity: 0, duration: dur, ease: 'power2.out'},
    at,
  );
};

/** Balance: base e coluna, travessao e pratos se desenham; rotulos aparecem. */
export const balanceIn = (tl: TL, q: Q, cls: string, at: number) => {
  draw(tl, q, `.${cls}-st`, at, 0.5);
  draw(tl, q, `.${cls}-bm`, at + 0.3, 0.45);
  draw(tl, q, `.${cls}-pn`, at + 0.55, 0.45);
  wipeText(tl, q, `.${cls}-lb`, at + 0.8, 0.35);
};

/** Algo que cai (em um prato da Balance, por exemplo): queda com gravidade e uma unica compressao ao pousar. */
export const dropIn = (tl: TL, q: Q, sel: string, at: number, dist = 220, dur = 0.42) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.1, ease: 'none'}, at);
  tl.fromTo(els, {y: -dist}, {y: 0, duration: dur, ease: 'power2.in'}, at);
  tl.fromTo(els, {scaleY: 1}, {scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.06, ease: 'power1.out', immediateRender: false}, at + dur);
  tl.to(els, {scaleY: 1, duration: 0.16, ease: 'power1.inOut'}, at + dur + 0.06);
};
