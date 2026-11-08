// GSAP + DrawSVG (tracos que se desenham). As timelines sao controladas pelo frame do Remotion
// via @remotion/gsap (useGsapTimeline) — nada roda no relogio do navegador.
import {gsap} from 'gsap';
import {DrawSVGPlugin} from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(DrawSVGPlugin);

export {gsap};
