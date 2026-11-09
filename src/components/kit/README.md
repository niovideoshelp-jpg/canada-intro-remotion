# Kit: shared components for Parts 1, 2 and Final

`import {...} from '../../../components/kit'` (from `src/videos/<video>/scenes/`) and the GSAP helpers from
`src/lib/tl2.ts` (plus the old ones in `src/lib/tl.ts`). Live demo of everything: composition **DevKit**
(`src/dev/KitGallery.tsx`, `COMP=DevKit node scripts/stills.mjs kit 0.5 135 270 429 579 729 885`).

## Rules that apply to every component

- **`cls` must be unique in the whole video**: prefix it with the scene id (`p1s06-fuel`). Masks and clip ids are
  built from it, and two scenes are mounted at the same time during the curtain.
- **Everything is visible by default** (except `Pulse`, which stays hidden until `pulseOnce`). A helper (`popIn`, `drawIcon`, `timelineIn`...) sets the hidden starting
  state of what it animates, so call the helper for each part you want to animate in and leave the rest static.
- **Times:** GSAP helpers take *local* timeline seconds: `stampIn(tl, q, 'x', L(T('july')))`. Per-frame props
  (`value`, `progress`, `angle`, `tilt`) take values computed from *global* seconds: `const t = useGlobalSec()`.
- **No jitter:** HTML components are positioned with `at()` (2D + `rotate(0.03deg)`), and GSAP only animates
  inner elements, so React and GSAP never fight over the same transform. No randomness: the noise and line
  widths are seeded.
- **SVG or HTML?** SVG components go inside an `<svg>`: use `<SvgLayer>` (full-frame 1920x1080 svg) or `<MapSvg>`.
  Inside `MapSvg` the map components (`RangeRing`, `Pulse`, `RadarSweep`, `MovingTrack`) keep a constant
  on-screen stroke while the camera zooms (they call `usePx`). For a constant-size `Icon` on a map, pass
  `size={px(48)}`.
  - SVG: `Icon`, `PictogramGrid`, `Dimension`, `Callout`, `RangeRing`, `Pulse`, `RadarSweep`, `MovingTrack`, `Balance`, `SvgText`.
  - HTML: `IconHtml`, `IconBadge`, `Stamp`, `Counter`, `DocCard`, `Timeline`, `Checklist`, `StatBar`, `SplitPanel`.
- Colours only from `C`. Red is the accent: use it for the element the narration is about.

```tsx
const t = useGlobalSec();
const L = useLocal();
const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
  popIn(tl, q, 'p1s06-fuel', L(T('fuel') - 0.05));
  stampIn(tl, q, 'p1s01-date', L(T('july')));
});
return <AbsoluteFill ref={scope}>...</AbsoluteFill>;
```

---

## Icon / IconHtml

Line icons in a 64x64 box with a 2.5 px stroke at 64 px (the stroke scales with `size`), round caps and joins.
Names: `jet` (=`fighter`), `bomber`, `jetSide`, `bomberSide`, `helicopter`, `ship`, `icebreaker`, `warship`,
`submarine`, `boat`, `shipTop`, `missile`, `satellite`, `radarDish`, `radarDome`, `antenna`, `eye`, `cyber`, `fuel`,
`wrench`, `medical`, `runway`, `hangar`, `ammo`, `cargo`, `truck`, `crane`, `money`, `document`, `clock`, `calendar`,
`lifebuoy`, `buoy`, `person`, `people`, `house`, `handshake`, `sun`, `moon`, `cloud`, `snowflake`, `wave`,
`magnifier`, `check`, `cross`, `star`, `pin`, `warning`, `route`, `shield`.

Orientation (`iconView(name)`): **top** views point their nose UP (`jet`, `bomber`, `shipTop`). Use them on maps
and rotate them along a route. **Side** views face RIGHT (`ship`, `icebreaker`, `warship`, `submarine`, `boat`,
`helicopter`, `truck`, `missile`, `jetSide`, `bomberSide`). Use `flip` for leftward motion and use them in diagrams.

Props (both): `name`, `size` (px, default 64 SVG / 96 HTML), `color` (stroke, default ink), `fill` (solid
variant: silhouettes filled, interior details "engraved" in `cut`), `fillOpacity`, `cut` (default `C.black`; it is also
the colour that hides overlapped lines in `people`/`handshake`/`truck` wheels, so set it to the colour behind
when the icon sits bare on a lighter area), `strokeW` (on-screen px), `rot` (deg), `flip`, `dashed`, `opacity`,
`shadow` (SVG default false, HTML default true), `cls`. SVG `Icon` takes `x, y` (centre, default 0,0).
Classes: `${cls}` on the inner group (pop/scale), `${cls}-p` on every stroke, `${cls}-f` on every fill.

```tsx
<SvgLayer>
  <Icon cls="p1s12-b1" name="bomber" x={700} y={420} size={56} color={C.red} fill={C.red} />
  <Icon cls="p2s16-sub" name="submarine" x={960} y={600} size={140} dashed color={C.inkSoft} />
</SvgLayer>
<IconHtml cls="p1s03-dome" name="radarDome" x={1500} y={300} size={180} />
// GSAP: drawIcon(tl, q, 'p1s12-b1', L(T('aircraft')));  popSvg(tl, q, '.p1s12-b1', at);  pop(tl, q, '.p1s03-dome', at)
```

## IconBadge  (HTML)

An icon in a dark disc with an ink or red ring, plus an optional Anton label underneath. `(x, y)` = disc centre.
Props: `cls, x, y, icon, size=132, ring='ink'|'red'|colour, label, labelSize, labelColor, iconColor, iconFill,
iconScale=0.6, dashed, opacity`. Classes: `${cls}` (disc), `${cls}-ic-p/-f` (icon), `${cls}-lbl`.

```tsx
<IconBadge cls="p1s06-fuel" x={560} y={300} icon="fuel" label="Fuel" />
<IconBadge cls="p1s06-sup" x={1360} y={300} icon="people" label="Support" ring="red" />
// popIn(tl, q, 'p1s06-fuel', L(T('fuel')))   -> the disc pops, the icon draws inside, the label wipes in. SFX pop at the same time.
```

## Stamp + stampIn  (HTML)

A date or short word in Anton inside a red double frame, rotated -4°, with a static worn-ink texture.
`(x, y)` = centre. Props: `cls, x, y, text, size=64 (font px; the big "NO" ≈ 360), rot=-4, color=C.red,
solid (red box, ink text), backing=true (dark translucent plate for legibility on maps; use false on a DocCard),
worn=true, opacity`.

```tsx
<Stamp cls="p1s01-date" x={330} y={130} text="July 24, 2024" />
// stampIn(tl, q, 'p1s01-date', L(at)): 1.5x to 1x accelerating, hit at at + STAMP_HIT (0.14 s), then one 3% overshoot.
// cues: {at: at + STAMP_HIT - 0.008, file: 'stamp', vol: 0.28}
```

## Counter + countAt  (HTML)

A counting number with thousands separators, fixed-width digit cells (0.5em; separators 0.24em), a prefix, a suffix and a
unit line underneath. **Pass `digits` = the number of integer digits of the final value** so the width never changes.
`(x, y)` = anchor point at the vertical middle of the digits. Props: `cls, x, y, value, size=160, decimals=0, digits=1,
sep=',', prefix, suffix, prefixScale=0.62, suffixScale (1 for one character like `+`/`M`, 0.55 for `KM`),
unit, unitSize, color, unitColor, anchor='center'|'left'|'right', opacity`. Classes: `${cls}`, `${cls}-unit`.

```tsx
<Counter cls="p1s05-km" x={1300} y={300} value={countAt(t, T('coastline'), T('kilometers'), 0, 162000)} digits={6} suffix="KM" />
<Counter cls="p2s24-c" x={600} y={260} value={countAt(t, T('2'), T('2') + 0.8, 0, 2.67)} decimals={2} prefix="C$" unit="Billion" color={C.red} />
<Counter cls="p2s20-r" x={1500} y={300} value={countAt(t, a, b, 0, 1500)} digits={4} suffix="+" unit="Rangers" />
// counterIn(tl, q, 'p1s05-km', L(at)): the number and then the unit wipe in. Tick SFX: ticks(t0, t1, n, vol, 'out') from lib/cues.
```
`countAt(t, t0, t1, from, to, ease = outCubic)` counts between global times. `stepsAt(t, initial, [{at, to}...], dur = 0.5, ease)`
moves in smooth steps (for example a counter that rises with each pop).

## DocCard  (HTML)

An abstract paper document with no fake text: grey bars stand in for the lines, an optional REAL `title`, and a `highlight` phrase
(one line or several) that a red marker swipe reveals. It has a folded corner and a soft shadow. `(x, y)` = centre.
Props: `cls, x, y, w=560, h=1.3w, rot=-3, title, highlight (string | string[]), lines=9, hlAfter=3, seed=1, titleSize, hlSize,
opacity`. Classes: `${cls}` (paper), `${cls}-ttl`, `${cls}-ln`, `${cls}-hl-base` (printed phrase), `${cls}-hl{i}-bar/-txt`.

```tsx
<DocCard cls="p1s11-doc" x={620} y={540} highlight={['No immediate', 'military threat']} />
<DocCard cls="f04-doc" x={960} y={500} title="Arctic Cooperation Agreement" />
<Stamp cls="f04-st" x={1080} y={720} text="1988" backing={false} />
// docIn(tl, q, 'p1s11-doc', L(T('documents')))         paper slides in from the left (fromX=-760), title and bars type in
// docHighlight(tl, q, 'p1s11-doc', L(T('immediate')))   red marker swipe, one line after another (+0.28 s)
```

## Timeline  (HTML)

A horizontal year axis with ticks, year labels, marks, bands, brackets and a TODAY marker. `(x, y)` = centre of the axis, `w` =
width. Props: `cls, x, y, w=1400, from, to, marks, bands, today, todayLabel='TODAY', labels ('all'|'ends'|n; automatic by
default), yearSize=30, markSize=40, color, arrow=true, opacity`.
- `marks: {at, label, sub?, accent?, side?: 'top'|'bottom', stem?}[]`. `at` may be fractional: Dec 2029 = 2029.92. A bottom mark
  hides the year label it would cover.
- `bands: {from, to, label?, sub?, accent?, style?: 'fill'|'bracket', lift?}[]`. `fill` = a strip on the axis. `bracket` = a bracket
  above it ("YEARS AWAY", "THE COMING YEARS").
- `yearX(year, from, to, w)` gives the local x of a year. Add `x - w/2` for the screen x, to put an icon on a year.

```tsx
<Timeline cls="p2s10-tl" x={960} y={760} w={1500} from={2026} to={2031} today={2026}
  marks={[{at: 2026, label: 'First two', sub: 'Luke AFB', side: 'bottom'}, {at: 2028, label: '2028', sub: 'In Canada'}]}
  bands={[{from: 2029, to: 2030, label: '2029–2030', sub: 'Initial operational capability', accent: true}]} />
// timelineIn(tl, q, 'p2s10-tl', L(T('arrive')), 0.9)  axis, ticks and years left to right
// timelineMark(tl, q, 'p2s10-tl', 1, L(T('2028')))   timelineBand(tl, q, 'p2s10-tl', 0, L(T('2029')))
// timelineToday(tl, q, 'p2s10-tl', L(T('today')))    drops like a stamp (hit at + STAMP_HIT)
```

## Checklist  (HTML)

Anton rows, each with a chalk box and a hand-drawn red mark (`check` overshoots the box, or `cross`).
`(x, y)` = LEFT edge, vertical centre of the block. Props: `cls, x, y, items, size=60, gap, marks ('check'|'cross'|'none')[],
box=true, color, markColor=C.red, opacity`. Classes per row i: `${cls}-box-${i}`, `${cls}-row-${i}`, `${cls}-ck-${i}`.

```tsx
<Checklist cls="f06-ck" x={1060} y={520} items={['Military presence', 'Patrols', 'Defense missions']} />
// checkIn(tl, q, 'f06-ck', 0, L(T('presence')))   box + text, then the check 0.3 s later (marker_swipe SFX there)
// checkMark(tl, q, 'f06-ck', 2, at)                only the mark (when the rows are already on screen)
```

## PictogramGrid  (SVG)

`n` pictograms in a grid, centred on `(x, y)`. Props: `cls, x, y, n, cols, icon, size=48, gap, cellW, cellH, state, rot, strokeW,
shadow=true, opacity`. `state` is fixed or `(i) => 'on'|'red'|'dim'|'off'|'empty'|'none'`: `on` = solid ink, `red` = solid red,
`dim` = faded, `off` = dashed outline (planned / unavailable), `empty` = red dashed empty slot (as in the Intro's soldiers row),
`none` = no cell. A state change is a cut, so stagger it in time to get a wave. `gridCellCenter(i, sameProps)` gives a cell centre.

```tsx
<SvgLayer>
  <PictogramGrid cls="p2s09-88" x={960} y={480} n={88} cols={11} icon="jet" size={44}
    state={(i) => (t > T('eight') + i * 0.03 && i < 8 ? 'red' : t < T('88') ? 'off' : 'on')} />
  <PictogramGrid cls="p2s11-pil" x={700} y={800} n={10} cols={10} icon="person" size={80} cellW={34} state={(i) => (i > 6 ? 'empty' : 'on')} />
</SvgLayer>
// gridIn(tl, q, 'p2s09-88', L(T('reviewing')), 0.016)   cells sprout from the bottom one after another
```

## Dimension  (SVG)

A dimension line with end ticks and an Anton label, like the Intro's dims. Props: `cls, from, to, label, size=40, side=-1
(-1 = above a left-to-right line), tick=28, color, labelColor, opacity=0.85, width=2.5, labelGap`. The label follows the line
angle. Classes: `${cls}-l`, `${cls}-t`, `${cls}-lbl`.

```tsx
<Dimension cls="p2s13-len" from={[124, 770]} to={[812, 770]} label="103 M" side={1} />
// dimIn(tl, q, 'p2s13-len', L(T('103') - 0.2))   line, then the end ticks, then the label
```

## Callout  (SVG)

A hand-drawn circle around a point, a leader line to `to`, and a label after its end. Props: `cls, x, y, r=44, to, label, size=44,
color=C.red, labelColor, width=4, seed`. Classes: `${cls}-ring`, `${cls}-lead`, `${cls}-lbl`.

```tsx
<Callout cls="p2s14-gun" x={259} y={556} r={30} to={[170, 420]} label="25 MM" />
// calloutIn(tl, q, 'p2s14-gun', L(T('25mm')))
```

## RangeRing + Pulse  (SVG, map coordinates)

`RangeRing`: a dashed circle drawn on by a mask, so the dashes stay fixed on the map and never crawl. `dash` is in MAP units:
choose it for the zoom where the ring is mostly seen. The stroke `width` is in on-screen px. Props: `cls, cx, cy, r, color,
width=2.4, dash=[10,8] | null (solid), fill, fillOpacity=0.08, start=0 (bearing where the draw starts, clockwise), dot, opacity`.
Classes: `${cls}-rev` (or `${cls}-ring` when solid), `${cls}-fill`, `${cls}-dot`.
`Pulse`: a ring that grows from `r0` to `r1` and fades ONCE, hidden until then. Use one element per pulse.

```tsx
<MapSvg cam={cam}>
  <RangeRing cls="p1s06-rr" cx={coldLake[0]} cy={coldLake[1]} r={420} dash={[12, 9]} fill={C.ink} dot />
  <Pulse cls="p1s01-pa" cx={anc[0]} cy={anc[1]} r0={3} r1={26} />
</MapSvg>
// ringIn(tl, q, 'p1s06-rr', L(T('range')), 0.9)      pulseOnce(tl, q, 'p1s01-pa', L(T('jets')), 0.9)
```

## RadarSweep + sweepAngle  (SVG, map coordinates)

A rotating sweep wedge with a fading trail, built from overlapping wedges so it has no seams. The angle comes from the frame:
`sweepAngle(t, t0, period = 3, start = 0)` (a bearing: 0 = north, clockwise). Blips light up when the sweep passes and fade over
`decay` degrees. With `start`, blips the sweep has not reached yet stay dim. Props: `cx, cy, r, angle, trail=80, color, strength=0.34,
rings=3, outline, blips {x,y}[], blipColor=C.red, blipSize=6 (screen px), blipBase=0.25, start, decay=300, width=1.6, cls, opacity`.

```tsx
<RadarSweep cx={ak[0]} cy={ak[1]} r={90} angle={sweepAngle(t, T('tracked'), 2.6)} start={0} blips={bombers.map(([x, y]) => ({x, y}))} cls="p1s02-rad" />
// fadeIn(tl, q, '.p1s02-rad', L(T('tracked') - 0.3))
```

## MovingTrack + trackPoly + trackHead  (SVG, map coordinates)

A route that advances: `progress` 0..1 (from the frame) draws a dashed trail up to there and carries an icon at the head, oriented
along the path. Top views rotate, side views flip, symbols stay upright (`orient='auto'|'rotate'|'flip'|'none'`). Strokes and the
icon keep a constant on-screen size. The dashes are in map units and anchored at the start, so they never crawl. Give `pts`
(sparse control points, 24 or fewer, are smoothed by Catmull-Rom; dense data such as `POLAR2.*.pts` passes through as it is; `smooth`
forces either way) or a single-subpath `d`. Props: `cls, pts | d, smooth (auto), progress,
color=C.red, width=3, dash=[12,9] | null, trailOpacity, tail (show only the last N map units), ghost (opacity of the whole planned
route), icon, iconSize=44, iconColor, iconFill, iconStrokeW, orient, head=true, shadow=true, opacity`. The head icon class is
`${cls}-head` (`popSvg` / `popOut`).

```tsx
<MovingTrack cls="p1s01-tu1" pts={POLAR2.bomberTracks[0].pts} progress={ramp(t, T('russian'), T('zone'), inOutSine)}
  icon="bomber" iconSize={40} iconColor={C.red} iconFill={C.red} />
<MovingTrack cls="f03-c1" pts={route} progress={ramp(t, a, b)} icon="ship" iconColor={C.ink} color={C.ink} ghost={0.25} />
// Convoy: several MovingTracks on the same route with offset progress (p - 0.06 * k).
// trackHead(trackPoly(pts), progress) -> {p, heading}: where the icon is (radar blips, a label that follows it).
```

## Balance  (SVG)

A two-pan scale: base, post, a beam that tilts `tilt` degrees (POSITIVE = the RIGHT side goes down) and pans that always hang level.
`(x, y)` = the beam pivot. `left`/`right` = SVG content in pan-local coordinates: (0,0) is the centre of the pan rim and negative y
points up. Props: `cls, x, y, w=760, tilt, post=330, hang=160, pan=240, left, right, leftLabel, rightLabel, leftAccent, rightAccent,
labelSize=40, color, width=4, opacity`. Classes: `${cls}-st`, `${cls}-bm`, `${cls}-pn`, `${cls}-lb`.

```tsx
const tilt = stepsAt(t, 12, [{at: T('monitor') + 0.4, to: 8}, {at: T('operate') + 0.4, to: 3}, {at: T('position'), to: 0}], 0.6, outCubic);
<SvgLayer>
  <Balance cls="f05-bal" x={960} y={420} tilt={tilt} leftLabel="Canada" leftAccent rightLabel="United States"
    left={<g className="f05-d0"><Icon name="radarDome" y={-32} size={64} /></g>} />
</SvgLayer>
// balanceIn(tl, q, 'f05-bal', L(at))    dropIn(tl, q, '.f05-d0', L(T('monitor')))
// dropIn: falls 220 px in 0.42 s and lands with a single squash -> cue pop2 at T('monitor') + 0.42 - 0.008
```

## StatBar  (HTML)

A label, a chalk-framed track, a fill (`value` 0..1) and an optional target tick. `(x, y)` = LEFT edge of the track, vertical
centre. Props: `cls, x, y, value, w=760, h=36, label, labelPos='left'|'top', labelSize, labelColor, color=C.red, target,
targetLabel, valueText (only a real number from the narration), opacity`. Classes: `${cls}-lbl`, `-track`, `-fill`, `-tgt`,
`-tgl`, `-val`.

```tsx
<StatBar cls="f09-bar" x={620} y={860} w={900} value={0.4} label="In place today" target={0.92} targetLabel="Needed" />
// barIn(tl, q, 'f09-bar', L(T('capabilities')), 0.9)   or drive `value` per frame and skip barIn
```

## SplitPanel  (HTML, full frame)

Two halves split by the slanted red edge (the scene-curtain look). `left`/`right` are full-frame layers in 1920x1080
coordinates, clipped to their side. Centre the content with `splitCenters(x)`. `progress` (per frame) brings the divider in from
the right edge (0 = only the left half shows, 1 = the divider at `x`). Props: `left, right, x=960, slant=70, progress=1, tintLeft,
tintRight, edge=true`.

```tsx
<SplitPanel progress={ramp(t, T('detecting') - 0.3, T('detecting') + 0.3, inOutCubic)}
  left={<AbsoluteFill>...emergency...</AbsoluteFill>}
  right={<AbsoluteFill><MapSvg cam={cam}>...</MapSvg></AbsoluteFill>} />
```

## Small pieces

- `SvgLayer`: a full-frame `<svg>` (1920x1080, overflow visible) for SVG components outside a MapSvg.
- `SvgText`: an Anton label in SVG, vertically centred on the caps, with a soft shadow. `wipeText` works on its `cls`. Props:
  `x, y, text, size=40, color, anchor='start'|'middle'|'end', spacing (em), rot, cls, shadow=true, opacity`.
- Geometry (`geom.tsx`): `smoothD/smoothPts` (Catmull-Rom), `sampleD` (path to polyline), `cumLen/pointAt/sliceTo/headingAt`,
  `circleD` (a circle that starts at a bearing), `handCircleD` (pen circle), `bearingPt`, `polyD`, `starD`, `annularSectorD`.
- `hash01(n)`: deterministic pseudo-random in [0, 1).

## GSAP helpers (`src/lib/tl2.ts`) at a glance

| helper | what it does |
|---|---|
| `stampIn(tl,q,cls,at,from=1.5)` | stamp slam; `STAMP_HIT` = 0.14 s to impact |
| `drawIcon(tl,q,cls,at,dur=0.7)` | strokes `${cls}-p` draw (DrawSVG, staggered), then fills `${cls}-f` fade in. Dashed icons fade instead |
| `popIn(tl,q,cls,at,{rot,drawIcon})` | IconBadge entrance |
| `popSvg(tl,q,sel,at,rot)` | `pop()` for SVG elements (origin at the element centre) |
| `popOut(tl,q,sel,at)` / `drawOut(tl,q,sel,at)` | exits |
| `counterIn(tl,q,cls,at)` | Counter number + unit wipe |
| `docIn(tl,q,cls,at,fromX)` / `docHighlight(tl,q,cls,at,each)` | DocCard |
| `checkIn(tl,q,cls,i,at,mark=true)` / `checkMark(tl,q,cls,i,at)` | Checklist row / mark |
| `gridIn(tl,q,cls,at,each=0.03)` | PictogramGrid cells sprout |
| `timelineIn` / `timelineMark` / `timelineBand` / `timelineToday` | Timeline parts |
| `barIn(tl,q,cls,at,dur=0.9)` | StatBar |
| `dimIn(tl,q,cls,at,dur=0.45)` | Dimension |
| `calloutIn(tl,q,cls,at)` | Callout |
| `ringIn(tl,q,cls,at,dur=0.9)` / `pulseOnce(tl,q,cls,at,dur=0.9)` | RangeRing / Pulse |
| `balanceIn(tl,q,cls,at)` / `dropIn(tl,q,sel,at,dist=220,dur=0.42)` | Balance / falling items |

Per-frame helpers (from the kit): `countAt`, `stepsAt`, `sweepAngle`, plus `ramp`/`lerp` from `lib/ease`.
