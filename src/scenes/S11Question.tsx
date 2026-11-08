// 51.10–57.50  "Which brings us to the question, folks. Can Canada defend the Arctic on its own?"
// Payoff: o globo polar volta (ancora do video), a camera mergulha no Artico canadense e o titulo
// se monta como na referencia — serifada grande + faixa (agora vermelha) + recorte com linhas
// tecnicas de prancheta por tras.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MarkerLabel} from '../components/Labels';
import {MapSvg} from '../components/MapSvg';
import {PolarBase} from '../components/PolarBase';
import {Sticker} from '../components/Sticker';
import {PLAYFAIR} from '../fonts';
import '../gsap';
import {CamKey, camAt} from '../lib/camera';
import {inOutCubic, inOutSine, lerp, linear, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, marker, riseLine, slideIn, wipeText} from '../lib/tl';
import {C, H, W} from '../theme';
import {W as T} from '../timing';
import {ASSETS} from '../assets';

const KEYS: CamKey[] = [
  {t: 50.85, x: 958, y: 606, s: 1.16, r: -6},
  {t: 53.1, x: 950, y: 646, s: 1.42, r: -12, ease: inOutCubic},
  {t: 57.7, x: 946, y: 656, s: 1.55, r: -15, ease: linear},
];

const titleStyle: React.CSSProperties = {
  fontFamily: PLAYFAIR,
  fontWeight: 900,
  fontSize: 112,
  lineHeight: 1.0,
  letterSpacing: '-0.012em',
  color: C.ink,
  whiteSpace: 'nowrap',
  textShadow: '0 4px 28px rgba(0,0,0,0.55)',
};

const Line: React.FC<{cls: string; y: number; children: React.ReactNode}> = ({cls, y, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
    <div style={{overflow: 'hidden', padding: '0 24px 10px'}}>
      <div className={cls} style={titleStyle}>
        {children}
      </div>
    </div>
  </div>
);

export const S11Question: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    wipeText(tl, q, '.s11-kicker', L(T.question - 0.1), 0.5);
    riseLine(tl, q, '.s11-l1', L(T.can - 0.06), 0.6);
    riseLine(tl, q, '.s11-l2', L(T.theArctic - 0.04), 0.55);
    marker(tl, q, 's11-own', L(T.onItsOwn - 0.08));
    slideIn(tl, q, '.s11-ship', L(T.can + 0.1), 1100, 0, 1.4);
    draw(tl, q, '.s11-bp-a', L(T.canada2), 0.9, 'power1.inOut');
    draw(tl, q, '.s11-bp-b', L(T.canada2 + 0.25), 0.9, 'power1.inOut');
    draw(tl, q, '.s11-bp-c', L(T.defend + 0.1), 0.6);
  });

  const dim = 0.66 * ramp(t, T.can - 0.4, T.can + 0.35, inOutSine);
  const shipDrift = lerp(0, -46, ramp(t, 54.6, 57.6, linear));

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <PolarBase />
      </MapSvg>
      <AbsoluteFill style={{backgroundColor: `rgba(14,14,13,${dim})`}} />

      {/* linhas tecnicas de prancheta atras do navio (eco da referencia) */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g fill="none" stroke={C.ink} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round">
          <circle className="s11-bp-a" cx={760} cy={845} r={150} />
          <circle className="s11-bp-b" cx={1255} cy={830} r={95} />
          <path className="s11-bp-c" d="M440 985 L1500 975 M440 971 L440 999 M1500 961 L1500 989" />
        </g>
      </svg>

      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translate3d(${shipDrift}px, 0px, 0px) rotate(0.03deg)`, willChange: 'transform'}}>
        <Sticker cls="s11-ship" src={ASSETS.dewolf} x={985} y={858} w={900} />
      </div>

      <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
        <div
          className="s11-kicker"
          style={{fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: C.inkSoft, letterSpacing: '0.02em'}}
        >
          The question
        </div>
      </div>
      <Line cls="s11-l1" y={222}>
        Can Canada defend
      </Line>
      <Line cls="s11-l2" y={340}>
        the Arctic
      </Line>
      <MarkerLabel cls="s11-own" x={W / 2} y={548} text="on its own?" size={92} />
    </AbsoluteFill>
  );
};
