// 89.47–96.08  "Modernization projects could improve the situation, but several of them are still years away from
// entering service."
// Linha do tempo com o HOJE em 2026 e os projetos da Parte 2 (so datas ditas na narracao): radar OTH dez/2029, F-35
// 2029–2030, submarinos 2034. No "years away", o colchete vermelho mede a distancia.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconHtml, Timeline, yearX} from '../../../components/kit';
import '../../../gsap';
import type {Cue} from '../../../lib/cues';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {pop} from '../../../lib/tl';
import {timelineBand, timelineIn, timelineMark, timelineToday} from '../../../lib/tl2';
import {C} from '../../../theme';
import {TS} from '../timing';

// tempos de palavra so dentro desta cena (palavras comuns se repetem na narracao)
const T = TS('s08');

const X = 960;
const Y = 610;
const TW = 1560;
const FROM = 2025;
const TO = 2035;
const xOf = (year: number) => X - TW / 2 + yearX(year, FROM, TO, TW);

// radar OTH abaixo do eixo (nao disputa espaco com a faixa do F-35, que fica acima)
const MARKS = [
  {at: 2029.92, label: 'OTH radar', sub: 'Dec 2029', side: 'bottom' as const},
  {at: 2034, label: 'Submarines', sub: '2034', accent: true},
];
const ICONS = [
  {cls: 'f10-ic-oth', name: 'radarDish' as const, year: 2029.92, y: Y + 215},
  {cls: 'f10-ic-f35', name: 'jet' as const, year: 2029.5, y: Y - 190},
  {cls: 'f10-ic-sub', name: 'submarine' as const, year: 2034, y: Y - 190},
];

export const F10: React.FC = () => {
  useGlobalSec();
  const L = useLocal();

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    timelineIn(tl, q, 'f10-tl', L(T('modernization') - 0.25), 0.9);
    timelineToday(tl, q, 'f10-tl', L(T('modernization') + 0.35));
    timelineMark(tl, q, 'f10-tl', 0, L(T('projects') + 0.05));
    pop(tl, q, '.f10-ic-oth', L(T('projects') + 0.05));
    timelineBand(tl, q, 'f10-tl', 0, L(T('could') + 0.05));
    pop(tl, q, '.f10-ic-f35', L(T('could') + 0.05));
    timelineMark(tl, q, 'f10-tl', 1, L(T('improve') + 0.05));
    pop(tl, q, '.f10-ic-sub', L(T('improve') + 0.05));
    timelineBand(tl, q, 'f10-tl', 1, L(T('years') - 0.15), 0.7);
  });

  return (
    <AbsoluteFill ref={scope}>
      <Timeline
        cls="f10-tl"
        x={X}
        y={Y}
        w={TW}
        from={FROM}
        to={TO}
        labels="all"
        today={2026}
        marks={MARKS}
        bands={[
          {from: 2029, to: 2030, label: 'F-35', sub: '2029–2030'},
          {from: 2026.05, to: 2033.95, label: 'Years away', style: 'bracket', accent: true, lift: 320},
        ]}
      />
      {ICONS.map((ic) => (
        <IconHtml key={ic.cls} cls={ic.cls} name={ic.name} x={xOf(ic.year)} y={ic.y} size={86} color={ic.name === 'submarine' ? C.red : C.ink} />
      ))}
    </AbsoluteFill>
  );
};

export const cues: Cue[] = [
  {at: T('modernization') - 0.25, file: 'pen_scribble', vol: 0.12, dur: 0.9, fadeOut: 0.3},
  {at: T('modernization') + 0.35 + 0.14 - 0.008, file: 'stamp', vol: 0.22, dur: 0.6},
  {at: T('projects') + 0.05, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('could') + 0.05, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('improve') + 0.05, file: 'pop', vol: 0.18, dur: 0.3},
  {at: T('years') - 0.15, file: 'marker_swipe', vol: 0.2, dur: 0.6},
];
