import React, {createContext, useContext} from 'react';
import {Cam, camTransform} from '../lib/camera';
import {H, W} from '../theme';

const CamCtx = createContext<Cam>({x: W / 2, y: H / 2, s: 1, r: 0});

/** Camera atual do mapa (para compensar espessura de traco durante o zoom). */
export const useMapCam = () => useContext(CamCtx);

/** Espessura de traco constante na tela, independente do zoom. */
export const usePx = () => {
  const cam = useMapCam();
  return (px: number) => px / cam.s;
};

/** SVG em tela cheia com um grupo de camera (zoom/pan/rotacao) — vetor redesenhado a cada frame: nitido. */
export const MapSvg: React.FC<{cam: Cam; children: React.ReactNode; defs?: React.ReactNode}> = ({cam, children, defs}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    {defs ? <defs>{defs}</defs> : null}
    <CamCtx.Provider value={cam}>
      <g transform={camTransform(cam)}>{children}</g>
    </CamCtx.Provider>
  </svg>
);
