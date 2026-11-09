// Galeria de desenvolvimento (composicao DevMaps, 30 s; nao renderizada na nuvem).
// Folha de conferencia de src/data/maps2.ts: cada conjunto de dados sobre o seu mapa-base.
//   0-3,5 s  CA: lugares (33), North Warning System (47, 11 LRR), costa artica
//   3,5-6 s  CA (zoom no norte): nomes dos sitios do NWS
//   6-8,8 s  CA (zoom no arquipelago): rotas da Passagem do Noroeste + aguas internas (channels)
//   8,8-10 s CA (zoom 10x): estreitos da ilha King William e de Prince of Wales (rotas pela agua)
//   10-12 s  CA (recuo): regioes (northern approaches, high Arctic), rota Halifax -> Resolute, mares
//   (cruzes finas = caProject/polarProject/worldProject de lon,lat: devem cair no centro dos pontos)
//   12-16 s  POLAR: pontos, arcos de ataque, rotas maritimas, passagens RCM, ADIZ
//   16-20 s  POLAR (zoom no mar de Bering): ADIZ, bombardeiros, interceptacao, costa do Alasca
//   20-25 s  WORLD: mundo inteiro, paises-chave e ligacoes
//   25-30 s  WORLD (zoom na Europa): detalhe do litoral, Alemanha, ligacao ate Kiel
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, ScreenFX} from '../components/Backdrop';
import {CanadaFill, CanadaOutline, Graticule, Neighbours} from '../components/CanadaLayers';
import {MapLabel} from '../components/Labels';
import {MapSvg, usePx} from '../components/MapSvg';
import {PolarBase} from '../components/PolarBase';
import {CA, POLAR} from '../data/maps';
import {CA2, POLAR2, Pt, WORLD, caLabel, caProject, nwpRoute, pointAlong, polarProject, worldCountry, worldProject} from '../data/maps2';
import {ANTON} from '../fonts';
import {Cam, CamKey, camAt, toScreen} from '../lib/camera';
import {inOutCubic} from '../lib/ease';
import {at} from '../lib/pos';
import {useGlobalSec} from '../lib/scene';
import {C} from '../theme';

type Anchor = 'left' | 'center' | 'right';
type Lab = {p: Pt; text: string; dx?: number; dy?: number; anchor?: Anchor; size?: number; color?: string};

/** Cruz de conferencia: caProject/polarProject/worldProject(lon,lat) deve cair no centro do ponto do JSON. */
const Cross: React.FC<{p: Pt}> = ({p}) => {
  const px = usePx();
  const r = px(7);
  return <path d={`M${p[0] - r},${p[1]}L${p[0] + r},${p[1]}M${p[0]},${p[1] - r}L${p[0]},${p[1] + r}`} stroke={C.ink} strokeWidth={px(1)} fill="none" />;
};

/** Ponto na fracao f do comprimento de uma polilinha. */
const along = (pts: readonly Pt[], f: number): Pt => {
  const q = pointAlong(pts, f);
  return [q.x, q.y];
};

/** Rotulos HTML posicionados pela camera (o texto nao escala com o zoom). */
const Labels: React.FC<{cam: Cam; items: Lab[]}> = ({cam, items}) => (
  <>
    {items.map((l, i) => {
      const [x, y] = toScreen(l.p, cam);
      return (
        <MapLabel
          key={i}
          cls="dm-l"
          x={x + (l.dx ?? 9)}
          y={y + (l.dy ?? 0)}
          text={l.text}
          size={l.size ?? 15}
          color={l.color ?? C.ink}
          anchor={l.anchor ?? 'left'}
          spacing="0.08em"
        />
      );
    })}
  </>
);

const Title: React.FC<{text: string}> = ({text}) => (
  <div style={{...at(56, 44, '0%', '0%'), fontFamily: ANTON, fontSize: 24, letterSpacing: '0.06em', color: C.inkSoft, whiteSpace: 'nowrap', textTransform: 'uppercase'}}>
    {text}
  </div>
);

// ============================================================================== CA: lugares + NWS
const PLACE_OFF: Record<string, [number, number, Anchor]> = {
  'Arctic Bay': [-9, 2, 'right'],
  Nanisivik: [0, -15, 'center'],
  Igloolik: [-9, -6, 'right'],
  'Hall Beach': [9, 6, 'left'],
  Inuvik: [-9, 6, 'right'],
  Tuktoyaktuk: [9, -8, 'left'],
  Esquimalt: [-9, 10, 'right'],
  Vancouver: [9, 6, 'left'],
  Comox: [-9, -6, 'right'],
  Greenwood: [-9, 0, 'right'],
  Halifax: [9, 6, 'left'],
  Edmonton: [-9, 0, 'right'],
  Anchorage: [-9, 6, 'right'],
  Fairbanks: [-9, -8, 'right'],
  'Cambridge Bay': [9, 9, 'left'],
  Kugluktuk: [-9, 4, 'right'],
  'Pond Inlet': [9, -6, 'left'],
};

const CaPoints: React.FC<{names?: boolean}> = ({names}) => {
  const px = usePx();
  return (
    <g>
      <path d={CA2.arcticCoast} fill="none" stroke={C.ink} strokeWidth={px(1.5)} strokeLinejoin="round" strokeLinecap="round" />
      <path d={CA2.nwsLine} fill="none" stroke={C.inkSoft} strokeWidth={px(1.2)} strokeDasharray={`${px(4)} ${px(4)}`} />
      {CA2.nws.map((s, i) =>
        s.lrr ? (
          <circle key={i} cx={s.p[0]} cy={s.p[1]} r={px(names ? 8 : 6.5)} fill={C.black} fillOpacity={0.5} stroke={C.red} strokeWidth={px(2.4)} />
        ) : (
          <circle key={i} cx={s.p[0]} cy={s.p[1]} r={px(names ? 4 : 3.2)} fill={C.ink} stroke={C.black} strokeWidth={px(0.8)} />
        ),
      )}
      {names
        ? null
        : CA2.places.map((q) => (
            <g key={q.name}>
              <circle cx={q.p[0]} cy={q.p[1]} r={px(4.4)} fill={C.red} stroke={C.black} strokeWidth={px(1)} />
              <Cross p={caProject(q.ll[0], q.ll[1])} />
            </g>
          ))}
    </g>
  );
};

const CaBase: React.FC<{outline?: number}> = ({outline = 0.45}) => (
  <>
    <Graticule d={CA.graticule} />
    <Neighbours />
    <CanadaFill />
    <CanadaOutline width={1} opacity={outline} />
  </>
);

const CA_KEYS: CamKey[] = [
  {t: 0, x: 930, y: 628, s: 0.84},
  {t: 3.3, x: 930, y: 628, s: 0.84},
  {t: 3.9, x: 1000, y: 395, s: 1.55, ease: inOutCubic},
];

const CaPlacesView: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, CA_KEYS);
  const zoomed = t > 3.6;
  const labels: Lab[] = zoomed
    ? CA2.nws.map((s, i) => ({
        p: s.p,
        text: `${i + 1}${s.name ? ' ' + s.name : ''}`,
        size: 13,
        color: s.lrr ? C.red : C.inkSoft,
        dx: 0,
        dy: i % 2 ? 16 : -16,
        anchor: 'center' as Anchor,
      }))
    : CA2.places.map((q) => {
        const o = PLACE_OFF[q.name] ?? [9, 0, 'left'];
        return {p: q.p, text: q.name, dx: o[0], dy: o[1], anchor: o[2]};
      });
  return (
    <AbsoluteFill>
      <MapSvg cam={cam}>
        <CaBase />
        <CaPoints names={zoomed} />
      </MapSvg>
      <Labels cam={cam} items={labels} />
      <Title text={zoomed ? 'CA2.nws · 47 North Warning System sites (red ring = 11 long-range)' : 'CA2.places (33, red) · CA2.nws (47) · CA2.arcticCoast'} />
    </AbsoluteFill>
  );
};

// ======================================================================= CA: rotas, canais, regioes
const ROUTE_STYLE: Record<string, {dash?: [number, number]; width: number}> = {
  northern: {width: 2.6},
  princeOfWales: {width: 2.4, dash: [9, 6]},
  southern: {width: 2.4, dash: [2, 5]},
};

const CaWaters: React.FC<{regions: boolean}> = ({regions}) => {
  const px = usePx();
  return (
    <g>
      <path d={CA2.channels} fill={C.red} fillOpacity={regions ? 0.35 : 0.55} fillRule="evenodd" />
      <CanadaOutline width={1} opacity={0.6} />
      {regions ? (
        <g>
          {CA2.regions.northernApproaches.map((r) => (
            <path key={r.name} d={r.d} fill={C.ink} fillOpacity={0.08} stroke={C.ink} strokeWidth={px(1.8)} strokeDasharray={`${px(8)} ${px(6)}`} />
          ))}
          <path d={CA2.regions.highArctic.d} fill={C.ink} fillOpacity={0.22} stroke={C.ink} strokeOpacity={0.8} strokeWidth={px(1.8)} />
          <path d={CA2.seaLanes.halifaxToResolute.d} fill="none" stroke={C.red} strokeWidth={px(2.2)} strokeDasharray={`${px(7)} ${px(5)}`} />
        </g>
      ) : null}
      {CA2.nwpRoutes.map((r) => {
        const st = ROUTE_STYLE[r.id];
        return (
          <path
            key={r.id}
            d={r.d}
            fill="none"
            stroke={C.ink}
            strokeOpacity={regions ? 0.55 : 1}
            strokeWidth={px(st.width)}
            strokeDasharray={st.dash ? `${px(st.dash[0])} ${px(st.dash[1])}` : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      {regions ? null : (
        <g>
          {[CA2.nwpRoutes[0].pts[0], CA2.nwpRoutes[0].pts[CA2.nwpRoutes[0].pts.length - 1]].map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={px(6)} fill={C.black} stroke={C.ink} strokeWidth={px(2)} />
          ))}
          {CA2.nwpRoutes.map((r) => {
            const m = pointAlong(r.pts, 0.5);
            return <circle key={r.id} cx={m.x} cy={m.y} r={px(4)} fill={C.ink} />;
          })}
        </g>
      )}
    </g>
  );
};

// 8,8-9,95 s: zooms de conferencia (10x) nos estreitos mais estreitos (rotas pela agua?)
const ARCH_KEYS: CamKey[] = [
  {t: 6, x: 930, y: 628, s: 0.84},
  {t: 6.7, x: 835, y: 345, s: 2.15, ease: inOutCubic},
  {t: 8.8, x: 835, y: 345, s: 2.15},
  {t: 9.0, x: 876, y: 421, s: 10, ease: inOutCubic}, // ilha King William: James Ross, Rae, Simpson
  {t: 9.4, x: 876, y: 421, s: 10},
  {t: 9.55, x: 752, y: 312, s: 10, ease: inOutCubic}, // estreito Prince of Wales
  {t: 9.95, x: 752, y: 312, s: 10},
  {t: 10.6, x: 960, y: 300, s: 0.95, ease: inOutCubic},
];

const CaWatersView: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, ARCH_KEYS);
  const regions = t > 10.2;
  const strait = t > 8.9 && t < 10.1;
  const labels: Lab[] = regions
    ? [
        ...CA2.regions.northernApproaches.map((r) => ({p: r.c, text: r.name, anchor: 'center' as Anchor, dx: 0, size: 18})),
        {p: CA2.regions.highArctic.c, text: 'High Arctic', anchor: 'center', dx: 0, size: 20},
        {p: CA2.channelsLabel, text: 'Internal waters', anchor: 'center', dx: 0, size: 16, color: C.ink},
        ...(['Hudson Bay', 'Foxe Basin', 'Hudson Strait', 'Arctic Ocean', 'Nares Strait'] as const).map((n) => ({p: caLabel(n), text: n, anchor: 'center' as Anchor, dx: 0, size: 14, color: C.inkSoft})),
      ]
    : [
        {p: along(nwpRoute('northern').pts, 0.5), text: 'northern', dy: -14},
        {p: along(nwpRoute('princeOfWales').pts, 0.62), text: 'prince of wales', dy: 14},
        {p: along(nwpRoute('southern').pts, 0.52), text: 'southern / amundsen', dy: 16},
        {p: CA2.nwpRoutes[0].pts[0], text: 'Baffin Bay (start)', dy: -16},
        {p: CA2.nwpRoutes[0].pts[CA2.nwpRoutes[0].pts.length - 1], text: 'Beaufort Sea (end)', anchor: 'right', dx: -10, dy: -16},
        ...(['Lancaster Sound', 'Viscount Melville Sound', "M'Clure Strait", 'Amundsen Gulf', 'Queen Maud Gulf', 'Banks Island', 'Victoria Island', 'Devon Island'] as const).map((n) => ({
          p: caLabel(n),
          text: n,
          anchor: 'center' as Anchor,
          dx: 0,
          size: 13,
          color: C.inkSoft,
        })),
      ];
  return (
    <AbsoluteFill>
      <MapSvg cam={cam}>
        <CaBase outline={0} />
        <CaWaters regions={regions} />
      </MapSvg>
      <Labels cam={cam} items={labels} />
      <Title
        text={
          regions
            ? 'CA2.regions · northernApproaches (dashed) · highArctic (white) · channels · seaLanes.halifaxToResolute (red)'
            : strait
              ? `zoom 10x · ${t < 9.47 ? 'King William Island (James Ross, Rae, Simpson straits)' : 'Prince of Wales Strait'} · routes must stay in water`
              : 'CA2.nwpRoutes (solid / dashed / dotted) · CA2.channels (red, evenodd)'
        }
      />
    </AbsoluteFill>
  );
};

// =================================================================================== POLAR
const PolarOverlays: React.FC<{zoom: boolean}> = ({zoom}) => {
  const px = usePx();
  return (
    <g>
      {zoom
        ? null
        : POLAR2.rcmTracks.map((r) => (
            <g key={r.id}>
              <path d={r.d} fill="none" stroke={C.ink} strokeOpacity={0.1} strokeWidth={2 * r.swathHalfWidthPx} strokeLinecap="butt" />
              <path d={r.d} fill="none" stroke={C.ink} strokeOpacity={0.5} strokeWidth={px(1)} strokeDasharray={`${px(2)} ${px(4)}`} />
            </g>
          ))}
      {zoom ? null : (
        <g>
          <path d={POLAR2.seaRoutes.nsr.d} fill="none" stroke={C.ink} strokeWidth={px(2)} strokeDasharray={`${px(7)} ${px(5)}`} />
          <path d={POLAR2.seaRoutes.nwp.d} fill="none" stroke={C.ink} strokeWidth={px(2)} />
          <path d={POLAR2.seaRoutes.transpolar.d} fill="none" stroke={C.ink} strokeWidth={px(2)} strokeDasharray={`${px(2)} ${px(5)}`} strokeLinecap="round" />
          {POLAR2.strikeArcs.map((a) => (
            <path key={a.to} d={a.d} fill="none" stroke={C.red} strokeWidth={px(2)} strokeDasharray={`${px(9)} ${px(6)}`} />
          ))}
        </g>
      )}
      {zoom ? <path d={POLAR2.alaskaCoast} fill="none" stroke={C.ink} strokeOpacity={0.7} strokeWidth={px(2)} strokeLinejoin="round" /> : null}
      {zoom ? <path d={POLAR2.alaskaBorder} fill="none" stroke={C.ink} strokeOpacity={0.9} strokeWidth={px(2)} /> : null}
      <path d={POLAR2.adiz} fill={C.ink} fillOpacity={0.05} stroke={C.ink} strokeWidth={px(zoom ? 2 : 1.4)} strokeDasharray={`${px(8)} ${px(6)}`} />
      {POLAR2.bomberTracks.map((b) => (
        <path
          key={b.id}
          d={b.d}
          fill="none"
          stroke={C.red}
          strokeWidth={px(zoom ? 1.8 : 1)}
          strokeDasharray={b.kind === 'h6' ? `${px(5)} ${px(4)}` : undefined}
        />
      ))}
      {POLAR2.interceptTracks.map((b) => (
        <path key={b.id} d={b.d} fill="none" stroke={C.ink} strokeWidth={px(zoom ? 1.8 : 1)} strokeDasharray={`${px(3)} ${px(4)}`} />
      ))}
      {zoom
        ? [...POLAR2.bomberTracks.map((b) => ({pts: b.pts, f: 0.45, red: true})), ...POLAR2.interceptTracks.map((b) => ({pts: b.pts, f: b.joinFrac, red: false}))].map((m, i) => {
            const q = pointAlong(m.pts, m.f);
            // marcador triangular orientado (testa pointAlong)
            return (
              <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.angle})`}>
                <path d={`M${px(7)},0L${px(-5)},${px(-4.5)}L${px(-5)},${px(4.5)}Z`} fill={m.red ? C.red : C.ink} stroke={C.black} strokeWidth={px(0.8)} />
              </g>
            );
          })
        : null}
      {POLAR2.points.map((q) => (
        <g key={q.name}>
          <circle cx={q.p[0]} cy={q.p[1]} r={px(3.4)} fill={C.ink} stroke={C.black} strokeWidth={px(0.8)} />
          <Cross p={polarProject(q.ll[0], q.ll[1])} />
        </g>
      ))}
      {zoom ? (
        <g>
          <defs>
            <path id="dm-adiz-label" d={POLAR2.adizLabelPath} />
          </defs>
          <text dominantBaseline="middle" fontFamily={ANTON} fontSize={px(17)} letterSpacing={px(2)} fill={C.ink}>
            <textPath href="#dm-adiz-label" startOffset="50%" textAnchor="middle">
              AIR DEFENSE IDENTIFICATION ZONE
            </textPath>
          </text>
        </g>
      ) : null}
    </g>
  );
};

const POLAR_KEYS: CamKey[] = [
  {t: 12, x: 960, y: 548, s: 0.97, r: 0},
  {t: 15.6, x: 960, y: 548, s: 0.97, r: 0},
  {t: 16.6, x: 742, y: 612, s: 4.3, r: -54, ease: inOutCubic},
];

const PolarView: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, POLAR_KEYS);
  const zoom = t > 16.1;
  const zoomNames = ['Anadyr', 'Anchorage', 'Fairbanks', 'Bering Sea', 'Chukotka', 'Alaska'];
  const pts = POLAR2.points.filter((q) => (zoom ? zoomNames.includes(q.name) : true));
  const labels: Lab[] = [
    ...pts.map((q) => ({p: q.p, text: q.name, size: zoom ? 20 : 13})),
    ...(zoom
      ? []
      : [
          {p: along(POLAR2.seaRoutes.nsr.pts, 0.55), text: 'NSR', size: 16},
          {p: along(POLAR2.seaRoutes.nwp.pts, 0.45), text: 'NWP', size: 16},
          {p: along(POLAR2.seaRoutes.transpolar.pts, 0.3), text: 'TRANSPOLAR', size: 16},
        ]),
  ];
  return (
    <AbsoluteFill>
      <MapSvg cam={cam}>
        <PolarBase />
        <path d={POLAR.arcticCircle} fill="none" stroke={C.ink} strokeOpacity={0.2} strokeWidth={1 / cam.s} />
        <PolarOverlays zoom={zoom} />
      </MapSvg>
      <Labels cam={cam} items={labels} />
      <Title
        text={
          zoom
            ? 'POLAR2.adiz · bomberTracks (red: tu95 solid, h6 dashed) · interceptTracks · alaskaCoast'
            : 'POLAR2 · strikeArcs (red) · seaRoutes · rcmTracks (swaths) · adiz · points'
        }
      />
    </AbsoluteFill>
  );
};

// =================================================================================== WORLD
const WORLD_RED = new Set([WORLD.ids.canada, WORLD.ids.australia, WORLD.ids.germany]);

const WorldBase: React.FC = () => {
  const px = usePx();
  return (
    <g>
      <path d={WORLD.sphere} fill="rgba(8,8,8,0.42)" />
      <path d={WORLD.graticule} fill="none" stroke={C.ink} strokeOpacity={0.12} strokeWidth={px(1)} />
      {WORLD.countries.map((c) => (
        <path key={c.id + c.name} d={c.d} fill={WORLD_RED.has(c.id) ? C.red : C.land} stroke={C.landEdge} strokeOpacity={0.35} strokeWidth={px(0.6)} />
      ))}
      <path d={worldCountry('usa').d} fill="none" stroke={C.ink} strokeOpacity={0.8} strokeWidth={px(1.2)} />
      <path d={WORLD.sphere} fill="none" stroke={C.ink} strokeOpacity={0.55} strokeWidth={px(1.6)} />
      {Object.values(WORLD.links).map((l) => (
        <g key={l.to}>
          <path d={l.d} fill="none" stroke={C.ink} strokeWidth={px(2.2)} strokeDasharray={`${px(8)} ${px(6)}`} />
          <circle cx={l.mid[0]} cy={l.mid[1]} r={px(6)} fill={C.black} stroke={C.ink} strokeWidth={px(2)} />
        </g>
      ))}
      {WORLD.places.map((q) => (
        <g key={q.name}>
          <circle cx={q.p[0]} cy={q.p[1]} r={px(3.4)} fill={C.ink} stroke={C.black} strokeWidth={px(0.8)} />
          <Cross p={worldProject(q.ll[0], q.ll[1])} />
        </g>
      ))}
    </g>
  );
};

const WORLD_KEYS: CamKey[] = [
  {t: 20, x: 960, y: 540, s: 1},
  {t: 24.6, x: 960, y: 540, s: 1},
  {t: 25.6, x: 985, y: 215, s: 3.4, ease: inOutCubic},
];

const WorldView: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t, WORLD_KEYS);
  const zoom = t > 25.1;
  const keys = ['canada', 'usa', 'australia', 'germany', 'china', 'russia'] as const;
  const labels: Lab[] = [
    ...keys.map((k) => ({p: WORLD.labels[k], text: k === 'usa' ? 'United States' : k, anchor: 'center' as Anchor, dx: 0, size: zoom ? 26 : 22})),
    ...WORLD.places.map((q) => ({p: q.p, text: q.name, size: 13, color: C.inkSoft, dy: q.name === 'Berlin' ? 10 : q.name === 'Kiel' ? -8 : 0})),
  ];
  return (
    <AbsoluteFill>
      <MapSvg cam={cam}>
        <WorldBase />
      </MapSvg>
      <Labels cam={cam} items={labels} />
      <Title text={zoom ? 'WORLD · zoom 3.4x on Europe (coast detail, Kiel link)' : 'WORLD · Equal Earth · countries, ids, labels, places, links'} />
    </AbsoluteFill>
  );
};

// ===================================================================================
export const MapsGallery: React.FC = () => {
  const t = useGlobalSec();
  return (
    <AbsoluteFill>
      <Backdrop />
      {t < 6 ? <CaPlacesView t={t} /> : t < 12 ? <CaWatersView t={t} /> : t < 20 ? <PolarView t={t} /> : <WorldView t={t} />}
      <ScreenFX />
    </AbsoluteFill>
  );
};
