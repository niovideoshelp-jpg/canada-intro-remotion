// 24.00–34.30  "...most Canadians decided to do the sensible thing. Squeeze into the South, right along
//              the U.S. border. Seriously, nearly 90% of the population lives in that narrow strip down there,"
// Pontos = canadenses. Primeiro espalhados; no "Squeeze" eles descem e se espremem junto a fronteira
// (90% no sul). A fronteira com os EUA e desenhada em vermelho, a camera desce para a faixa, o 90%
// conta e uma seta aponta para a faixa estreita.
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HandArrow} from '../components/Bits';
import {CanadaFill, CanadaOutline, Graticule, Neighbours, ProvinceLines} from '../components/CanadaLayers';
import {BigNumber, MapLabel} from '../components/Labels';
import {MapSvg, usePx} from '../components/MapSvg';
import {CA} from '../data/maps';
import '../gsap';
import {CamKey, camAt, toScreen} from '../lib/camera';
import {inOutCubic, inOutSine, outCubic, ramp} from '../lib/ease';
import {useGlobalSec, useLocal} from '../lib/scene';
import {draw, wipeText} from '../lib/tl';
import {C, H, W} from '../theme';
import {W as T} from '../timing';

const KEYS: CamKey[] = [
  {t: 23.75, x: 960, y: 548, s: 0.9},
  {t: 29.55, x: 960, y: 552, s: 0.93, ease: inOutSine},
  {t: 31.0, x: 985, y: 772, s: 1.42, ease: inOutCubic},
  {t: 34.6, x: 990, y: 782, s: 1.5, ease: inOutSine},
];

const Border: React.FC = () => {
  const px = usePx();
  return (
    <path className="s06-border" d={CA.southBorder} fill="none" stroke={C.red} strokeWidth={px(3.2)} strokeLinecap="round" strokeLinejoin="round" />
  );
};

const Band: React.FC = () => (
  <g clipPath="url(#s06-clip)">
    <path
      className="s06-band"
      d={CA.southBorder}
      fill="none"
      stroke={C.red}
      strokeOpacity={0.62}
      strokeWidth={CA.band300Px * 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#s06-soft)"
    />
  </g>
);

const Dots: React.FC = () => (
  <g>
    {CA.dots.map((d, i) => (
      <circle key={i} className="s06-dot" cx={d.x0} cy={d.y0} r={0} fill={C.ink} fillOpacity={0.95} />
    ))}
  </g>
);

export const S06Squeeze: React.FC = () => {
  const t = useGlobalSec();
  const L = useLocal();
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    const dots = q('.s06-dot');
    // aparecem espalhados ("most Canadians")
    tl.fromTo(dots, {attr: {r: 0}}, {attr: {r: (i: number) => CA.dots[i].r}, duration: 0.35, ease: 'back.out(2)', stagger: {each: 0.0036}}, L(24.05));
    // "Squeeze into the South": descem ate a faixa da fronteira
    tl.to(
      dots,
      {
        attr: {cx: (i: number) => CA.dots[i].x1, cy: (i: number) => CA.dots[i].y1},
        duration: 1.35,
        ease: 'power2.inOut',
        stagger: {each: 0.0028},
      },
      L(T.squeeze - 0.08),
    );
    draw(tl, q, '.s06-border', L(T.along - 0.05), 0.85, 'power1.inOut');
    wipeText(tl, q, '.s06-usa', L(T.usBorder + 0.05), 0.45);
    draw(tl, q, '.s06-band', L(T.narrow - 0.1), 0.9, 'power1.inOut');
    wipeText(tl, q, '.s06-num', L(T.ninety - 0.22), 0.3);
    draw(tl, q, '.s06-arrow-c', L(T.strip), 0.45, 'power2.out');
    draw(tl, q, '.s06-arrow-h', L(T.strip + 0.42), 0.16, 'none');
  });

  const value = 90 * ramp(t, T.ninety - 0.1, T.ninety + 0.75, outCubic);
  const [ux, uy] = toScreen(CA.labels.usa, cam);
  const nx = 1440;
  const ny = 285;
  // a seta sai do numero e aponta para a faixa (perto de Ottawa/Montreal)
  const target = toScreen([1150, 860], camAt(T.strip, KEYS)); // estatico: o traco nao muda de forma

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg
        cam={cam}
        defs={
          <>
            <clipPath id="s06-clip" clipPathUnits="userSpaceOnUse">
              <path d={CA.canada} />
            </clipPath>
            <filter id="s06-soft" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation={9} />
            </filter>
          </>
        }
      >
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill fill="#4A4742" />
        <Band />
        <ProvinceLines color={C.ink} opacity={0.28} width={1} />
        <CanadaOutline width={1.6} opacity={0.9} />
        <Border />
        <Dots />
      </MapSvg>
      <MapLabel cls="s06-usa" x={ux} y={uy} text="United States" size={44} color={C.inkSoft} spacing="0.3em" />
      <BigNumber cls="s06-num" value={value} suffix="%" minDigits={2} x={nx} y={ny} size={230} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <HandArrow cls="s06-arrow" from={[nx - 40, ny + 150]} to={[target[0] + 40, target[1] - 70]} bow={-0.18} color={C.ink} width={5} />
      </svg>
    </AbsoluteFill>
  );
};
