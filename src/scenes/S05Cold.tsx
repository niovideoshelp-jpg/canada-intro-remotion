// 21.95–24.00  "It gets so cold up there..."
// Um termometro desenhado a giz; o mercurio vermelho despenca e o numero desce ate -40°
// (-40 e a mesma temperatura em °C e °F — por isso sem unidade).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BigNumber} from '../components/Labels';
import '../gsap';
import {inCubic, linear, outCubic, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, wipeText} from '../lib/tl';
import {C, H, W} from '../theme';
import {W as T} from '../timing';

const TX = 770; // eixo do termometro
const TOP = 180;
const JUNCTION = 850 - Math.sqrt(72 * 72 - 30 * 30); // onde o tubo encontra o bulbo
const OUTLINE = `M${TX - 30} ${JUNCTION} V${TOP + 30} A30 30 0 0 1 ${TX + 30} ${TOP + 30} V${JUNCTION} A72 72 0 1 1 ${TX - 30} ${JUNCTION} Z`;
const TICKS = Array.from({length: 11}, (_, i) => {
  const y = 250 + i * 50;
  const long = i % 5 === 0;
  return `M${TX - 46} ${y} H${TX - 46 - (long ? 34 : 18)}`;
}).join(' ');

// cristais de gelo (6 bracos) desenhados a giz
const crystal = (cx: number, cy: number, r: number) =>
  Array.from({length: 3}, (_, i) => {
    const a = (i * Math.PI) / 3 + 0.2;
    const dx = Math.cos(a) * r;
    const dy = Math.sin(a) * r;
    const bx = Math.cos(a) * r * 0.55;
    const by = Math.sin(a) * r * 0.55;
    const b = r * 0.28;
    return `M${cx - dx} ${cy - dy} L${cx + dx} ${cy + dy} M${cx + bx} ${cy + by} l${Math.cos(a + 0.6) * b} ${Math.sin(a + 0.6) * b} M${cx + bx} ${cy + by} l${Math.cos(a - 0.6) * b} ${Math.sin(a - 0.6) * b} M${cx - bx} ${cy - by} l${-Math.cos(a + 0.6) * b} ${-Math.sin(a + 0.6) * b} M${cx - bx} ${cy - by} l${-Math.cos(a - 0.6) * b} ${-Math.sin(a - 0.6) * b}`;
  }).join(' ');

export const S05Cold: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    draw(tl, q, '.s05-outline', L(22.0), 0.55, 'power1.inOut');
    draw(tl, q, '.s05-ticks', L(22.25), 0.4);
    wipeText(tl, q, '.s05-num', L(22.35), 0.3);
    draw(tl, q, '.s05-c1', L(T.cold - 0.05), 0.45);
    draw(tl, q, '.s05-c2', L(T.cold + 0.12), 0.45);
    draw(tl, q, '.s05-c3', L(T.cold + 0.26), 0.45);
  });

  // mercurio: sobe rapido no inicio (quente) e despenca no "so cold"
  const fill = ramp(t, 22.15, 22.5, outCubic) * (1 - 0.86 * ramp(t, 22.55, 23.6, inCubic));
  const level = JUNCTION + 10 - fill * (JUNCTION + 10 - (TOP + 40));
  const value = -40 * ramp(t, 22.6, 23.6, inCubic);
  const push = 1 + 0.035 * ramp(t, 21.8, 24.3, linear);

  return (
    <AbsoluteFill ref={scope} style={{transform: `scale(${push}) rotate(0.03deg)`, willChange: 'transform'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <circle cx={TX} cy={850} r={56} fill={C.red} />
        <rect x={TX - 15} y={level} width={30} height={Math.max(0, 850 - level)} fill={C.red} />
        <path className="s05-outline" d={OUTLINE} fill="none" stroke={C.ink} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        <path className="s05-ticks" d={TICKS} fill="none" stroke={C.ink} strokeOpacity={0.8} strokeWidth={3} strokeLinecap="round" />
        <g fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.85}>
          <path className="s05-c1" d={crystal(1040, 300, 46)} />
          <path className="s05-c2" d={crystal(1580, 820, 38)} />
          <path className="s05-c3" d={crystal(520, 360, 30)} />
        </g>
      </svg>
      <BigNumber cls="s05-num" value={value} prefix="−" prefixOpacity={value <= -0.5 ? 1 : 0} minDigits={2} suffix="°" x={1290} y={560} size={250} />
    </AbsoluteFill>
  );
};
