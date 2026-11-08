// 41.00–45.55  "Canada has a modern, well-equipped military, but it's short on personnel."
// Colagem tecnica: caca CF-18, navio de patrulha artica e soldados entram como recortes com
// linhas de cota (ar de prancheta). No "short on personnel" a colagem sobe e aparece uma fileira
// de soldados — os ultimos lugares ficam vazios (contorno tracejado vermelho).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PERSON_BODY, PERSON_HEAD} from '../components/Icons';
import {Sticker} from '../components/Sticker';
import '../gsap';
import {inOutCubic, lerp, linear, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, pop, slideIn} from '../lib/tl';
import {C, H, W} from '../theme';
import {W as T} from '../timing';
import {ASSETS} from '../assets';

const N = 12;
const EMPTY = 2; // ~1 em cada 6 vagas sem gente
const IH = 104;
const IW = IH * 0.4;
const STEP = IW + 22;
const ROW_X = W / 2 - ((N - 1) * STEP + IW) / 2;
const ROW_Y = 840;

export const S09Military: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    slideIn(tl, q, '.s09-jet', L(T.canadaHas + 0.25), -950, -5, 0.75);
    draw(tl, q, '.s09-dim-jet', L(T.modern + 0.15), 0.45);
    draw(tl, q, '.s09-dim-jet-t', L(T.modern + 0.58), 0.12, 'none');
    slideIn(tl, q, '.s09-ship', L(T.wellEquipped - 0.12), 980, 1.5, 0.75);
    draw(tl, q, '.s09-dim-ship', L(T.wellEquipped + 0.35), 0.45);
    draw(tl, q, '.s09-dim-ship-t', L(T.wellEquipped + 0.78), 0.12, 'none');
    pop(tl, q, '.s09-troops', L(T.military1 - 0.02), -2);
    const full = q('.s09-p-full');
    tl.fromTo(full, {scale: 0, transformOrigin: '50% 100%'}, {scale: 1, duration: 0.28, ease: 'back.out(1.8)', stagger: 0.035}, L(44.0));
    // as vagas vazias (contorno tracejado vermelho) entram exatamente no "short"
    tl.fromTo(q('.s09-p-empty-wrap'), {scale: 0, transformOrigin: '50% 100%'}, {scale: 1, duration: 0.3, ease: 'back.out(1.8)', stagger: 0.09}, L(T.short - 0.04));
  });

  // no "but it's short..." a colagem sobe e diminui para abrir espaco para a fileira
  const lift = ramp(t, 43.55, 44.35, inOutCubic);
  const drift = ramp(t, 40.8, 45.8, linear);
  const collage = `translate(0px, ${lerp(0, -120, lift)}px) scale(${lerp(1.0, 0.86, lift) * (1 + 0.025 * drift)}) rotate(0.03deg)`;

  return (
    <AbsoluteFill ref={scope}>
      <AbsoluteFill style={{transform: collage, transformOrigin: '50% 30%'}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <g fill="none" stroke={C.ink} strokeOpacity={0.75} strokeWidth={2.5} strokeLinecap="round">
            <path className="s09-dim-jet" d="M300 520 L905 528" />
            <path className="s09-dim-jet-t" d="M300 506 L300 534 M905 514 L905 542" />
            <path className="s09-dim-ship" d="M925 836 L1755 828" />
            <path className="s09-dim-ship-t" d="M925 822 L925 850 M1755 814 L1755 842" />
          </g>
        </svg>
        <Sticker cls="s09-jet" src={ASSETS.cf18} x={600} y={350} w={700} />
        <Sticker cls="s09-ship" src={ASSETS.dewolf} x={1340} y={575} w={860} />
        <Sticker cls="s09-troops" src={ASSETS.soldiers} x={640} y={760} w={380} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {Array.from({length: N}, (_, i) => {
          const x = ROW_X + i * STEP;
          const empty = i >= N - EMPTY;
          const k = IH / 100;
          return (
            <g key={i} transform={`translate(${x} ${ROW_Y - IH / 2}) scale(${k})`}>
              {empty ? (
                <g fill={C.red} fillOpacity={0.14} stroke={C.red} strokeWidth={4.5 / k} strokeDasharray={`${9 / k} ${7 / k}`} strokeLinejoin="round">
                  <g className="s09-p-empty-wrap">
                    <circle cx={PERSON_HEAD.cx} cy={PERSON_HEAD.cy} r={PERSON_HEAD.r} />
                    <path d={PERSON_BODY} />
                  </g>
                </g>
              ) : (
                <g className="s09-p-full">
                  <circle cx={PERSON_HEAD.cx} cy={PERSON_HEAD.cy} r={PERSON_HEAD.r} fill={C.ink} />
                  <path d={PERSON_BODY} fill={C.ink} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
