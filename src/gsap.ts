// GSAP + DrawSVG (tracos que se desenham). As timelines sao controladas pelo frame do Remotion
// via @remotion/gsap (useGsapTimeline) — nada roda no relogio do navegador.
import {gsap} from 'gsap';
import {DrawSVGPlugin} from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);
// 2D sempre: com translate3d o Chrome promove camadas e congela a escala de raster delas
// (nitidez variando entre quadros renderizados em abas diferentes). Ver lib/pos.ts.
gsap.config({force3D: false});

export {gsap};
