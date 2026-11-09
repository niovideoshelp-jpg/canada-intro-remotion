// 46.25–59.48  "So, back to the original question. In my view, Canada can maintain a military presence, conduct patrols,
// and carry out defense missions in its Arctic. It has equipment and service and forces that know the region."
// PAYOFF (ancoras #4 e #3): o cartao da pergunta da Intro volta identico (globo polar, serifada, ON ITS OWN?, o navio)
// e, no "maintain", encolhe para um quadro a esquerda; a direita, a lista: presenca, patrulhas, missoes (marcadas).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Checklist} from '../../../components/kit';
import {MarkerLabel} from '../../../components/Labels';
import {MapSvg} from '../../../components/MapSvg';
import {PolarBase} from '../../../components/PolarBase';
import {Sticker} from '../../../components/Sticker';
import {PLAYFAIR} from '../../../fonts';
import '../../../gsap';
import {CamKey, camAt} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutCubic, inOutSine, lerp, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, marker, riseLine, slideIn, wipeText} from '../../../lib/tl';
import {checkIn} from '../../../lib/tl2';
import {C, H, W} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s04');

const KEYS: CamKey[] = [
  {t: 46.0, x: 952, y: 640, s: 1.4, r: -11},
  {t: 59.8, x: 946, y: 652, s: 1.5, r: -14, ease: inOutSine},
];

// encolhe para um quadro a esquerda (mesma proporcao 16:9)
const CARD = {x: 76, y: 292, s: 0.47};

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

const ITEMS = ['Military presence', 'Patrols', 'Defense missions'];

export const F06: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    // a pergunta volta rapido (o espectador ja a conhece)
    wipeText(tl, q, '.f06-kicker', L(T('back') - 0.2), 0.4);
    riseLine(tl, q, '.f06-l1', L(T('back') - 0.05), 0.5);
    riseLine(tl, q, '.f06-l2', L(T('back') + 0.15), 0.5);
    marker(tl, q, 'f06-own', L(T('original') - 0.05));
    slideIn(tl, q, '.f06-ship', L(T('back') - 0.1), 1100, 0, 1.1);
    draw(tl, q, '.f06-bp-a', L(T('back') + 0.3), 0.8, 'power1.inOut');
    draw(tl, q, '.f06-bp-b', L(T('back') + 0.5), 0.8, 'power1.inOut');
    // a lista: cada marca cai na sua palavra
    checkIn(tl, q, 'f06-ck', 0, L(T('presence') - 0.38));
    checkIn(tl, q, 'f06-ck', 1, L(T('patrols') - 0.36));
    checkIn(tl, q, 'f06-ck', 2, L(T('missions') - 0.34));
    slideIn(tl, q, '.f06-st-jet', L(T('equipment') - 0.15), 700, -3, 0.75);
    slideIn(tl, q, '.f06-st-troops', L(T('forces') - 0.25), 700, 2, 0.75);
  });

  const k = ramp(t, T('maintain') - 0.1, T('maintain') + 0.6, inOutCubic);
  const s = lerp(1, CARD.s, k);
  const tx = lerp(0, CARD.x, k);
  const ty = lerp(0, CARD.y, k);

  return (
    <AbsoluteFill ref={scope}>
      {/* o cartao da pergunta (identico ao da Intro), que encolhe para um quadro */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          overflow: 'hidden',
          transformOrigin: '0px 0px',
          transform: `translate(${tx}px, ${ty}px) scale(${s}) rotate(0.03deg)`,
          boxShadow: k > 0 ? `0 0 0 ${lerp(0, 6, k)}px ${C.ink}, 0 24px 70px rgba(0,0,0,${0.6 * k})` : undefined,
          backgroundColor: '#1c1c1b',
        }}
      >
        <MapSvg cam={cam}>
          <PolarBase />
        </MapSvg>
        <AbsoluteFill style={{backgroundColor: 'rgba(14,14,13,0.62)'}} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g fill="none" stroke={C.ink} strokeOpacity={0.3} strokeWidth={2} strokeLinecap="round">
            <circle className="f06-bp-a" cx={760} cy={845} r={150} />
            <circle className="f06-bp-b" cx={1255} cy={830} r={95} />
          </g>
        </svg>
        <Sticker cls="f06-ship" src="img/dewolf.png" x={985} y={895} w={900} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center'}}>
          <div className="f06-kicker" style={{fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 700, fontSize: 44, color: C.inkSoft, letterSpacing: '0.02em'}}>
            The question
          </div>
        </div>
        <Line cls="f06-l1" y={222}>
          Can Canada defend
        </Line>
        <Line cls="f06-l2" y={340}>
          the Arctic
        </Line>
        <MarkerLabel cls="f06-own" x={W / 2} y={548} text="on its own?" size={92} />
      </div>

      {/* a resposta, item por item */}
      <Checklist cls="f06-ck" x={1060} y={430} items={ITEMS} size={70} />
      <Sticker cls="f06-st-jet" src="img/cf18.png" x={1290} y={790} w={430} />
      <Sticker cls="f06-st-troops" src="img/soldiers.png" x={1660} y={835} w={250} />
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('back') - 0.3 - 0.116, file: 'whoosh_soft', vol: 0.2, dur: 1.0},
  {at: T('back') - 0.1, file: 'paper_slide2', vol: 0.16, dur: 0.7},
  {at: T('original') - 0.05, file: 'marker_swipe', vol: 0.2, dur: 0.6},
  {at: T('maintain') - 0.2, file: 'whoosh_soft2', vol: 0.14, dur: 1.0},
  {at: T('presence') - 0.08 - 0.07, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('patrols') - 0.06 - 0.07, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('missions') - 0.04 - 0.07, file: 'marker_swipe', vol: 0.18, dur: 0.6},
  {at: T('equipment') - 0.15, file: 'paper_slide', vol: 0.16, dur: 0.8},
  {at: T('forces') - 0.25, file: 'paper_slide2', vol: 0.16, dur: 0.7},
];
