import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {FPS, H, W} from '../theme';
import {WIPE_HALF, sec} from './time';
import {inOutCubic, ramp} from './ease';

type SceneInfo = {fromFrame: number};
const SceneCtx = createContext<SceneInfo>({fromFrame: 0});

/** Tempo global (segundos) do frame atual, mesmo dentro de uma <Sequence>. */
export const useGlobalSec = () => {
  const frame = useCurrentFrame();
  const {fromFrame} = useContext(SceneCtx);
  return (frame + fromFrame) / FPS;
};

/** Converte segundos globais -> segundos locais da timeline GSAP da cena. */
export const useLocal = () => {
  const {fromFrame} = useContext(SceneCtx);
  return (globalSec: number) => Math.max(0, globalSec - fromFrame / FPS);
};

/** Inclinacao da borda da cortina (px). */
export const WIPE_SLANT = 70;

/** Posicao da borda da cortina no frame global g para um corte no frame `cut`. */
export const wipeEdge = (g: number, cut: number) => {
  const p = ramp(g, cut - WIPE_HALF, cut + WIPE_HALF, inOutCubic);
  const e = W + WIPE_SLANT - p * (W + 2 * WIPE_SLANT);
  return {p, top: e + WIPE_SLANT, bottom: e - WIPE_SLANT};
};

/**
 * Uma cena na linha do tempo. Entra e sai por uma cortina com borda inclinada (o fundo de
 * grade nunca corta — so o conteudo troca por cima dele).
 */
export const Scene: React.FC<{
  range: readonly [number, number];
  first?: boolean;
  last?: boolean;
  name: string;
  children: React.ReactNode;
}> = ({range, first, last, name, children}) => {
  const start = sec(range[0]);
  const end = sec(range[1]);
  const from = first ? 0 : start - WIPE_HALF;
  const to = last ? end : end + WIPE_HALF;
  return (
    <Sequence from={from} durationInFrames={to - from} name={name}>
      <SceneCtx.Provider value={{fromFrame: from}}>
        <WipeClip cutIn={first ? null : start} cutOut={last ? null : end} fromFrame={from}>
          {children}
        </WipeClip>
      </SceneCtx.Provider>
    </Sequence>
  );
};

const WipeClip: React.FC<{cutIn: number | null; cutOut: number | null; fromFrame: number; children: React.ReactNode}> = ({
  cutIn,
  cutOut,
  fromFrame,
  children,
}) => {
  const g = useCurrentFrame() + fromFrame;
  let clipPath: string | undefined;
  if (cutIn !== null && g < cutIn + WIPE_HALF) {
    const e = wipeEdge(g, cutIn);
    clipPath = `polygon(${e.top}px 0px, ${W + 400}px 0px, ${W + 400}px ${H}px, ${e.bottom}px ${H}px)`;
  } else if (cutOut !== null && g >= cutOut - WIPE_HALF) {
    const e = wipeEdge(g, cutOut);
    clipPath = `polygon(-400px 0px, ${e.top}px 0px, ${e.bottom}px ${H}px, -400px ${H}px)`;
  }
  return <AbsoluteFill style={{clipPath}}>{children}</AbsoluteFill>;
};
