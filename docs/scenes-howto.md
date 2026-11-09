# How to build a scene (Parts 1, 2 and Final)

Reference implementations are the Intro scenes in `src/scenes/` (S01Canada for maps, camera and paint; S03Arctic for
counter, paint and toScreen labels; S09Military and S11Question for stickers, labels and dimension lines). Match their
quality. Read `docs/bible.md` first, then your storyboard section, then the kit API (`src/components/kit/README.md`)
and the map data API (`src/data/maps2.ts`).

## Template

```tsx
// 57.44–68.25  "Canada's Arctic coastline alone stretches for roughly 162,000 kilometers. …"
// One line about the visual idea (what the viewer must notice first, what is revealed next).
import {useGsapTimeline} from '@remotion/gsap';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CanadaFill, Graticule, Neighbours} from '../../../components/CanadaLayers';
import {MapSvg, usePx} from '../../../components/MapSvg';
import {Counter} from '../../../components/kit';
import {CA} from '../../../data/maps';
import {CA2} from '../../../data/maps2';
import '../../../gsap';
import {CamKey, camAt, toScreen} from '../../../lib/camera';
import type {Cue} from '../../../lib/cues';
import {inOutSine, outCubic, ramp} from '../../../lib/ease';
import {useGlobalSec, useLocal} from '../../../lib/scene';
import {draw, wipeText} from '../../../lib/tl';
import {C} from '../../../theme';
import {TS} from '../timing';

// word times ONLY inside this scene: common words repeat in the narration ("for", "back", "canada", "position"...)
const T = TS('s04'); // the SCENES key of this file in ../timing.ts (P1S05 = 's04' after the merges, check it!)

const KEYS: CamKey[] = [
  {t: 57.2, x: 900, y: 300, s: 1.6},
  {t: T('patrolling'), x: 900, y: 300, s: 1.6},
  {t: 68.5, x: 940, y: 420, s: 1.05, ease: inOutSine},
];

export const P1S05: React.FC = () => {
  const t = useGlobalSec(); // global seconds
  const L = useLocal(); // global seconds -> this scene's GSAP time
  const cam = camAt(t, KEYS);

  const scope = useGsapTimeline<HTMLDivElement>(({timeline: tl, selector: q}) => {
    draw(tl, q, '.p1s05-coast', L(T('coastline') - 0.1), 2.8, 'power1.inOut', CA2.arcticCoastDrawFrac);
    wipeText(tl, q, '.p1s05-num', L(T('162') - 0.15), 0.3);
  });

  const km = 162000 * ramp(t, T('162') - 0.6, T.end('kilometers'), outCubic);
  const [nx, ny] = toScreen([1180, 210], cam); // map point -> screen point (labels follow the camera)

  return (
    <AbsoluteFill ref={scope}>
      <MapSvg cam={cam}>
        <Graticule d={CA.graticule} />
        <Neighbours />
        <CanadaFill />
        <Coast />
      </MapSvg>
      <Counter cls="p1s05-num" value={km} suffix=" KM" x={nx} y={ny} size={190} />
    </AbsoluteFill>
  );
};

const Coast: React.FC = () => {
  const px = usePx(); // screen-constant stroke width while the camera zooms
  return <path className="p1s05-coast" d={CA2.arcticCoast} fill="none" stroke={C.ink} strokeWidth={px(2)} />;
};

export const cues: Cue[] = [
  {at: T('coastline') - 0.262, file: 'pen_scribble', vol: 0.2, dur: 1.15, fadeOut: 0.3},
];
```

## Rules and traps

1. **Times are global seconds.** ALWAYS use `const T = TS('sNN')` (word search limited to your scene; the plain
   `T` from timing.ts searches the whole video and returns the FIRST "for"/"back"/"canada"... which is a bug that
   fires your animation at the wrong time). Find your scene's key `sNN` in `../timing.ts` (the file names keep the
   storyboard ids, the keys are sequential). Take times from `T('word', n)` / `T.end('word', n)`; check the token spelling in
   `src/videos/<video>/words.json` ("Tu-95" is `tu` + `95`, "162,000" is `162` + `000`, "U.S." is `u` + `s`, "2025-26"
   is `2025` + `26`, "1,500" is `1` + `500`, "6,800" is `6` + `800`, "2.67" is `2` + `67`; possessives keep the s:
   "NORAD's" is `norads`, "side's" is `sides`, "Canada's" is `canadas`). `T()` throws if the word is missing, so the
   frame fails to render and you find out at once.
2. **The scene is mounted from `start - 7` to `end + 7` frames** and the neighbour scene overlaps you during that
   time (the slanted curtain). Keep your content on screen until `end + 7f`, and have it ready at `start - 7f`.
   Camera keys may start a little before `start`.
3. **Unique ids.** Every SVG `id` (mask, clipPath, filter, PaintDefs id) must start with your scene id
   (`p1s05-…`), because two scenes are mounted at once during transitions. Prefix GSAP class names too.
4. **Map layers:** neutral first (graticule, neighbours, Canada fill), then highlights. Introduce a country with ink
   spread (`PaintDefs` + `PaintPath` + `paint()`, with `settled` to drop the mask once painted), never a fade. Draw
   chalk lines with `draw()`. Use `usePx()` for stroke widths inside `MapSvg`.
5. **Labels that sit on the map** are HTML positioned with `toScreen(mapPoint, cam)` (they follow the camera).
   Anton uppercase. Sizes: place labels 28-46 px, MarkerLabel 56-96 px, counters 160-240 px. Keep text inside the safe
   area x 120-1800, y 90-990 unless it is deliberately bleeding.
6. **Stickers** (`Sticker` from `src/components/Sticker.tsx`, files in `public/img`): they start hidden. Bring them in
   with `pop()` or `slideIn()`. Typical widths: 360-950 px. Parallax plates: `Depth` + `Plate` (see Intro
   S04Population / S07Untouched).
7. **Hold** after each reveal so it can be read; do not exit elements before the narration moves on. One idea at a
   time: when a new block comes in, the previous one moves or dims.
8. **No jitter:** no Math.random, CSS animation, springs or shake. HTML movement uses `at()` / 2D transform plus
   `rotate(0.03deg)`; no translate3d or will-change. Counters use fixed-width cells (`Counter`/`BigNumber`).
9. **Sound:** export `cues` with global times and onset compensation (bible §7). One effect per strong event.
   Volumes 0.15-0.32. Loops and beds: fadeIn/fadeOut.
10. **Check your work:** `npx tsc --noEmit`, then
    `COMP=CanadaPart1 node scripts/stills.mjs p1s05 0.5 <frames>` (frame = round(seconds × 30)). Look at every key
    beat plus one frame in each transition (cut ± 3 frames). At most ~6 frames per call; the PC is weak, so one render
    at a time.
11. **Dashed lines that draw:** `draw()` uses DrawSVG, which OVERWRITES `strokeDasharray`, so a dashed path drawn
    with `draw()` turns solid. For a dashed line that draws itself use `DashedDraw` from `components/Bits.tsx`
    (`<DashedDraw id="p2s04-r1" d={...} dash={[px(10), px(7)]} />`, then `draw(tl, q, '.p2s04-r1-rev', ...)`).
    `MovingTrack` handles its own dashes. Plain `draw()` is for solid strokes only.
12. **SVG vs HTML entrances:** SVG elements (`Icon`, `<g>`, `<circle>`) enter with `popSvg()`; HTML badges
    (`IconBadge`, `IconHtml`) with `popIn(tl, q, cls, at)` (pops the disc and draws the icon); text with
    `wipeText()`/`riseLine()`; stickers with `slideIn()`/`pop()`.
13. **Contrast:** never red on red. A red line or icon over red Canada/Russia disappears. Over red areas use chalk
    (`C.ink`) with a dark outline (`color={C.black} fill={C.ink}` for silhouettes); keep red for the one thing the
    narration is about. A red arrow reads as a military movement in these videos: only use one when it is.
14. **Things that only exist while moving** (missile/aircraft heads on a `MovingTrack`) must be hidden before they
    start and after they arrive: `head={p > 0.002 && p < 0.995}`. A head at progress 0 sits at its origin as a
    stray mark on screen.
15. **Sizes that read at 1080p:** map icons `size={px(48..84)}` (screen-constant), stroke widths `px(2..5)`,
    `IconBadge` 110-220, labels >= 28 px. Thin glyphs (a font "≠", a thin check) vanish: use `NotEqual` from
    `components/Bits.tsx` and a red disc with a chalk check (see `CheckDisc` in P1S11).
16. **Text never clipped:** when a title block has to make room, slide or fade it out; do not shrink it into the top
    edge. Check every label at every key frame against the camera move (labels from `toScreen` move with the map).
17. **SFX files must exist** in `public/sfx` (a missing file fails the render). Current names: bear_growl boom drone
    ice_crack jet_flyby marker_swipe moose_call paper_slide paper_slide2 paper_unfold pen_scribble pop pop2 riser
    ship_horn snow_steps stamp tick whoosh_big whoosh_soft whoosh_soft2 wind_arctic radar_ping (1.0 s) sonar_ping (2.6 s)
    radio_beep (0.25 s) shutter_click (0.29 s) keyboard_tick (0.2 s) heli_flyby (4.0 s).
18. **Never mount GSAP-animated elements later in the scene.** `useGsapTimeline` builds the timeline ONCE, when the
    scene mounts; an element rendered later (`{t > x ? <Badge cls=…/> : null}`) is not in the timeline, so in the
    real (sequential) render it pops in fully visible with no entrance, while single-frame stills look right. Keep
    every animated element mounted for the whole scene and hide whole blocks with `opacity` on a wrapper (not
    `display: none`, which breaks SVG bounding boxes; not `visibility`, which children can override). A block that is
    mounted at the start and unmounted later is fine.
