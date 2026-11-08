// Atalhos para montar timelines GSAP de forma consistente (mesmos tempos/curvas no video todo).
import type {Seed} from '../components/Paint';

type TL = gsap.core.Timeline;
type Q = gsap.utils.SelectorFunc;

/** Traco que se desenha (DrawSVG). */
export const draw = (tl: TL, q: Q, sel: string, at: number, dur = 0.6, ease = 'power2.inOut') => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {drawSVG: '0% 0%'}, {drawSVG: '0% 100%', duration: dur, ease}, at);
};

/** Pintura vermelha que se espalha (sementes do mask crescem). */
export const paint = (tl: TL, q: Q, id: string, seeds: Seed[], at: number, dur = 0.9) => {
  const els = q(`.${id}-seed`);
  if (!els.length) return;
  tl.fromTo(
    els,
    {attr: {r: 0}},
    {
      attr: {r: (i: number) => seeds[i].r},
      duration: dur,
      ease: 'power2.out',
      stagger: (i: number) => seeds[i].delay,
    },
    at,
  );
};

/** Marcador vermelho estilo Vox: a barra cresce da esquerda, o texto e revelado logo atras. */
export const marker = (tl: TL, q: Q, cls: string, at: number) => {
  const bar = q(`.${cls}-bar`);
  const txt = q(`.${cls}-txt`);
  if (bar.length) {
    tl.set(bar, {transformOrigin: '0% 50%', rotation: -0.7}, 0);
    tl.fromTo(bar, {scaleX: 0}, {scaleX: 1, duration: 0.3, ease: 'power2.out'}, at);
  }
  if (txt.length) {
    tl.fromTo(
      txt,
      {clipPath: 'inset(-20% 100% -20% 0%)'},
      {clipPath: 'inset(-20% 0% -20% 0%)', duration: 0.38, ease: 'power2.out'},
      at + (bar.length ? 0.09 : 0),
    );
  }
};

/** Saida do marcador: a barra sai 3 frames antes do texto (o "desencontro" da linguagem Vox). */
export const markerOut = (tl: TL, q: Q, cls: string, at: number) => {
  const bar = q(`.${cls}-bar`);
  const txt = q(`.${cls}-txt`);
  if (bar.length) tl.to(bar, {scaleX: 0, transformOrigin: '100% 50%', duration: 0.25, ease: 'power2.in'}, at);
  if (txt.length) tl.to(txt, {clipPath: 'inset(-20% 0% -20% 100%)', duration: 0.28, ease: 'power2.in'}, at + 0.1);
};

/** Revelacao de texto por mascara (da esquerda para a direita). */
export const wipeText = (tl: TL, q: Q, sel: string, at: number, dur = 0.4) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {clipPath: 'inset(-25% 100% -25% 0%)'}, {clipPath: 'inset(-25% 0% -25% 0%)', duration: dur, ease: 'power2.out'}, at);
};

/** Linha de titulo que sobe por tras de uma mascara. */
export const riseLine = (tl: TL, q: Q, sel: string, at: number, dur = 0.5) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {yPercent: 105}, {yPercent: 0, duration: dur, ease: 'power3.out'}, at);
};

/** Recorte/adesivo entrando com um unico overshoot (sem oscilar). */
export const pop = (tl: TL, q: Q, sel: string, at: number, rot = 0, dur = 0.42) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(
    els,
    {scale: 0.55, rotation: rot - 7, autoAlpha: 0},
    {scale: 1, rotation: rot, autoAlpha: 1, duration: dur, ease: 'back.out(1.5)'},
    at,
  );
};

/** Recorte deslizando para dentro (papel arrastado sobre a mesa). */
export const slideIn = (tl: TL, q: Q, sel: string, at: number, fromX: number, rot = 0, dur = 0.7) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {x: fromX, rotation: rot + (fromX > 0 ? 4 : -4), autoAlpha: 0}, {x: 0, rotation: rot, autoAlpha: 1, duration: dur, ease: 'power3.out'}, at);
};

/** Aparecimento simples (para preenchimentos de contexto, nunca para tracos). */
export const fadeIn = (tl: TL, q: Q, sel: string, at: number, dur = 0.5, to = 1) => {
  const els = q(sel);
  if (!els.length) return;
  tl.fromTo(els, {autoAlpha: 0}, {autoAlpha: to, duration: dur, ease: 'power1.inOut'}, at);
};

export const fadeOut = (tl: TL, q: Q, sel: string, at: number, dur = 0.4) => {
  const els = q(sel);
  if (!els.length) return;
  tl.to(els, {autoAlpha: 0, duration: dur, ease: 'power1.inOut'}, at);
};
