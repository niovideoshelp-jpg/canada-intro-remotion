// 36.78–46.25  "For Canada, being able to monitor the region and operate there independently also means having more
// information and resources to back up its position in that relationship."
// A balanca da relacao: o prato dos EUA comeca mais pesado. Os sensores (monitor) e os meios (operate) caem no prato
// do Canada, aparecem INFORMATION e RESOURCES, e o travessao nivela em "position".
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Balance, Icon, SvgLayer, stepsAt} from '../../../components/kit';
import {ANTON} from '../../../fonts';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {outCubic} from '../../../lib/ease';
import {at} from '../../../lib/pos';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {wipeText} from '../../../lib/tl';
import {balanceIn, dropIn} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s03');

const BX = 960;
const BY = 360;
const BW = 980;
const HANG = 170;
const PAN = 300;
const LABEL = 50;

const DROPS = [
  {cls: 'f05-d0', icon: 'radarDome' as const, x: -96, at: () => T('monitor')},
  {cls: 'f05-d1', icon: 'satellite' as const, x: -32, at: () => T('monitor') + 0.32},
  {cls: 'f05-d2', icon: 'icebreaker' as const, x: 34, at: () => T('operate')},
  {cls: 'f05-d3', icon: 'jet' as const, x: 98, at: () => T('operate') + 0.32},
];

export const F05: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    balanceIn(tl, q, 'f05-bal', L(T('canada') - 0.35));
    DROPS.forEach((d) => dropIn(tl, q, `.${d.cls}`, L(d.at())));
    wipeText(tl, q, '.f05-info', L(T('information') - 0.12), 0.4);
    wipeText(tl, q, '.f05-res', L(T('resources') - 0.12), 0.4);
  });

  // EUA mais pesados no comeco; cada leva de itens do Canada equilibra um pouco; nivela em "position"
  const tilt = stepsAt(
    t,
    11,
    [
      {at: T('monitor') + 0.42, to: 6.5},
      {at: T('operate') + 0.42, to: 2.6},
      {at: T('position') - 0.1, to: 0},
    ],
    0.7,
    outCubic,
  );
  const a = (tilt * Math.PI) / 180;
  const leftEndY = BY - (BW / 2) * Math.sin(a);
  const leftEndX = BX - (BW / 2) * Math.cos(a);
  const textY = leftEndY + HANG + PAN * 0.26 + LABEL * 1.05 + 74;

  return (
    <AbsoluteFill ref={scope}>
      <SvgLayer>
        <Balance
          cls="f05-bal"
          x={BX}
          y={BY}
          w={BW}
          tilt={tilt}
          post={420}
          hang={HANG}
          pan={PAN}
          labelSize={LABEL}
          leftLabel="Canada"
          leftAccent
          rightLabel="United States"
          left={
            <g>
              {DROPS.map((d) => (
                <g key={d.cls} className={d.cls}>
                  <Icon name={d.icon} x={d.x} y={-34} size={62} color={C.red} />
                </g>
              ))}
            </g>
          }
          right={
            <g>
              <Icon name="jet" x={-90} y={-34} size={60} />
              <Icon name="warship" x={-28} y={-34} size={60} />
              <Icon name="satellite" x={34} y={-34} size={60} />
              <Icon name="submarine" x={96} y={-34} size={60} />
              <Icon name="radarDome" x={-58} y={-96} size={60} />
              <Icon name="bomber" x={4} y={-96} size={60} />
              <Icon name="icebreaker" x={66} y={-96} size={60} />
            </g>
          }
        />
      </SvgLayer>
      <div style={at(leftEndX, textY)}>
        <div style={{fontFamily: ANTON, fontSize: 38, color: C.inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.25}}>
          <div className="f05-info">+ Information</div>
          <div className="f05-res">+ Resources</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  ...DROPS.map((d) => ({at: d.at() + 0.42 - 0.008, file: 'pop2', vol: 0.22, dur: 0.3})),
  {at: T('position') + 0.5, file: 'tick', vol: 0.16, dur: 0.3},
];
