# Production bible: Canada episode, Parts 1, 2 and Final

Same film as the Intro (`src/` root, composition `CanadaIntro`). New compositions: `CanadaPart1`
(narration `public/audio/part1.mp3`, 190.75 s), `CanadaPart2` (`part2.mp3`, 389.41 s) and `CanadaFinal`
(`final.mp3`, 103.63 s). All are 1920x1080 at 30 fps and rendered on GitHub Actions. Storyboards are in
`docs/storyboard-part1.md`, `-part2.md` and `-final.md`. Word-level transcripts with timings are in
`src/videos/<video>/words.json`; use the `T()` helper and never hand-type a word time.

The user's own rules are binding. They live in `C:/Users/ELCO/Desktop/NIO500/claude_code_vox_remotion_prompt.md` and
`guia-metodo-johnny-harris.md`; the summary below is enough to work from.

## 1. Look and feel (identical to the Intro)

- **Ground:** the static dark grid `public/bg/grid.jpg` (Backdrop), with ScreenFX vignette and sheen on top. The
  curved screen and chromatic aberration are added after the render by `scripts/crt-post.mjs` (do not add them in React).
- **Palette:** only `C` from `src/theme.ts`. Ink off-white `#EEE9DF` is for chalk lines and text. **Red `#E3262B` is
  the only accent** and replaces every Vox yellow. Graphite `C.land` is for neutral land. Use red selectively for the
  country or element the narration is about *now*, numbers that matter, and the route or threat in focus.
- **Type:** Anton (`ANTON` from `src/fonts.ts`), uppercase, for labels, numbers, names and dates. Playfair Display
  (`PLAYFAIR`) is reserved for the big question card, which is the Intro's S11 look.
- **Text only to identify** places, names, dates, key numbers or one essential word. No sentences on screen, no
  subtitles, no decorative footers, no fake metadata, coordinates, codes, HUD or UI bars. Negative space is fine.
- **Maps explain geography.** Introduce a country with the **red ink-spread paint** (`PaintDefs`/`PaintPath` + the
  `paint()` helper), never with a plain fade. Chalk outlines draw with DrawSVG (`draw()`). The camera (`camAt` keys)
  anticipates the next piece of information and holds when the viewer needs to read.
- **Photos** are Canva cut-outs in the "sticker" style (white paper border plus contact shadow, `Sticker`) or 2-layer
  parallax plates (`Depth` + `Plate`). Movement is subtle: slides, pops, slow push-ins, parallax.
- **Pacing:** a scene evolves (map, then country, then route, then number, then consequence) instead of cutting every
  second. Use entrance, hold, exit, and keep every element on screen long enough to read.

## 2. NO JITTER (hard rule, the user calls it "tremedeira")

- No `Math.random`, no CSS animations or transitions, no animated grain, no camera shake, no oscillating springs.
- Every HTML element that moves uses a **2D** transform plus `rotate(0.03deg)` (`at()` in `src/lib/pos.ts` does this).
  SVG camera groups get it from `camTransform` (MICRO_ROT). GSAP is configured with `force3D:false` (import `../gsap`
  or the right relative path). Never use `translate3d` or `will-change`.
- Numbers that count use fixed-width cells (`BigNumber`, `Counter`) so digits never shift sideways.
- GSAP only through `useGsapTimeline` from `@remotion/gsap`: a paused timeline seeked by the frame. Times come from
  `useLocal()` (global seconds to local timeline seconds). No callbacks, no `repeat: -1`.
- Anything driven by React per frame uses `useGlobalSec()` plus `ramp()`/`lerp()` from `src/lib/ease.ts`.

## 3. Structure of a video

```
src/videos/<video>/
  timing.ts        DURATION_S, SCENES (cut times in global seconds, at speech pauses), T() word-time helper
  words.json       transcript words {w, s, e} (generated, do not edit)
  Main.tsx         Backdrop, <Scene> list, WipeEdges, ScreenFX, narration Audio, SoundDesign
  sfx.ts           concatenates the `cues` exported by every scene file
  scenes/<Id>.tsx  one file per scene: `export const <Id>: React.FC` and `export const cues: Cue[]`
```

- `<Scene range first|last name>` (`src/lib/scene.tsx`) wraps every scene. It runs from `start - 7f` to `end + 7f` and
  enters/exits through the slanted curtain with a red edge. That is the only scene-to-scene transition; it is
  consistent across the film. Inside a scene, use camera continuity and masks. **Content must fill the frame during the
  14 transition frames at both ends**, because the next scene wipes over it, so do not empty the screen before `end`.
- All times are **global seconds**. In GSAP: `tl.to(..., L(T('word')))`. In React: `const t = useGlobalSec()`.
- `T('word', n = 1)` returns the start (s) of the n-th occurrence of that word (case- and punctuation-insensitive);
  `T.end('word', n)` returns its end. Fire visuals on the word they illustrate, or 0.1-0.25 s before it for a
  draw-on so it completes on the word.
- Sound: each scene exports `cues` (type `Cue` from `src/lib/cues.ts`) with **global** times. One effect per strong
  event, never one per cut. Volumes are 0.15-0.32 under the narration; the voice always dominates. Files are in
  `public/sfx/*.wav`; the list and onsets are in §7.

## 4. Recurring anchors (Johnny Harris method)

These return across the episode with a new layer of meaning each time:

1. **The polar map** (`PolarBase`, Canada in red, seen from above the North Pole): Part 1 cold open, the
   strike-route and warming scenes, Part 2 satellites, Final verdict and outro.
2. **The bombers' tracks near Alaska** (Part 1 cold open, 24 July 2024): they return in Part 1 scene 14 (air
   attack across the Arctic), Part 2 scenes 02 and 08 (detect, respond) and Final scene 07.
3. **HMCS Harry DeWolf** (`public/img/dewolf.png`, the Intro's last image): Part 2 scenes 12-13 (the class) and 23
   (range instead of Nanisivik), and the Final payoff with the question card.
4. **The question card** (Intro S11: "The question / Can Canada defend / the Arctic / ON ITS OWN?"): it returns in
   Final scene 06, "So, back to the original question", with the same layout so viewers recognise it.

## 5. Shared kit (build once in `src/components/kit/`; do NOT modify the Intro's components)

Each kit component is pure React/SVG, deterministic, animated with GSAP via class names (like `MarkerLabel`) or by
props computed per frame. Line icons use 2.5 px ink strokes, round caps and joins, and a 64x64 viewBox, in the same
hand-drawn editorial weight as the chalk maps.

| Component | Purpose |
|---|---|
| `Icon` | `name` in: jet, bomber, ship, icebreaker, submarine, helicopter, satellite, radarDish, radarDome, antenna, fuel, wrench, medical, person, house, runway, hangar, ammo, cargo, truck, boat, lifebuoy, buoy, eye, cyber, document, clock, crane, money, sun, moon, cloud, magnifier, check, cross, star, pin, warning, handshake, calendar, snowflake, wave, people. Props: `size`, `color`, `strokeW`, `fill?`, `cls` (paths get `${cls}-p` for DrawSVG). Usable inside SVG (`<g>`) and HTML (`IconHtml`). |
| `IconBadge` | Icon in a dark disc with an ink or red ring, plus an optional Anton label under it. It enters with `pop()`. |
| `Stamp` | Date or short-word stamp: Anton in a red-bordered box, rotated -4°. Helper `stampIn(tl,q,cls,at)` scales it 1.5 to 1 with one tiny overshoot. Pair it with the `stamp` SFX. |
| `Counter` | Like `BigNumber` but formats thousands (`162,000`) and supports `prefix` (`C$`), `suffix` (`KM`, `+`, `M`) and a small `unit` line under it (`BILLION`, `PASSES A DAY`). Fixed-width cells. |
| `DocCard` | Abstract paper document (no fake text): grey text-line bars plus an optional real `title` (e.g. `ARCTIC COOPERATION AGREEMENT`) and a `highlight` phrase on its own line, revealed by a red marker swipe (`${cls}-hl`). |
| `Timeline` | Horizontal year axis (`from`..`to`) with ticks; `marks` [{year, label, accent}] and `bands` [{from, to, label}]; optional TODAY marker. Classes allow draw-on of axis, marks and bands. |
| `Checklist` | Rows of Anton items, each with a red check mark that draws (`${cls}-ck-i`). |
| `PictogramGrid` | n icons in a grid (`cols`, `size`, `gap`). `state(i)` returns `'on' \| 'dim' \| 'off' \| 'red'`. Used for 88 jets, 12 and 4 submarines, 6 ships, people. |
| `Dimension` | Dimension line with end ticks and an Anton label (`103 M`), drawn on like the Intro's S01 dims. |
| `Callout` | Ring around a point plus a leader line plus a label (`25 MM`). |
| `RangeRing` | SVG dashed circle (map coords, screen-constant stroke via `usePx`) that draws on. |
| `RadarSweep` | SVG rotating sweep wedge with fading trail, angle from the frame (deterministic). Blips light up as the sweep passes. |
| `MovingTrack` | Polyline (map coords) plus `progress` 0..1: dashed trail up to progress and an icon at the head, oriented along the path. Screen-constant strokes. |
| `Balance` | A scale (beam, posts, two pans) with `tilt` degrees and slots for items on each pan. |
| `StatBar` | Horizontal bar with label, fill fraction (animated) and optional target tick. |
| `SplitPanel` | Two halves separated by the slanted red edge (the curtain look), each with its own content. |

GSAP helpers in `src/lib/tl.ts` (draw, paint, marker, markerOut, wipeText, riseLine, pop, slideIn, fadeIn, fadeOut)
plus new ones in `src/lib/tl2.ts` (stampIn, drawIcon, popIn, countTo if useful).

## 6. Map data (build once into `src/data/maps2.json` + `src/data/maps2.ts`; Intro data untouched)

Same projections as the Intro so the new layers align with `CA` and `POLAR`: CA uses the conic conformal fit from
`scripts/build-maps.mjs`, POLAR the azimuthal equal-area polar view. The builder goes in `scripts/build-maps2.mjs`.

- `CA2.arcticCoast`: Canada's coastline north of ~60°N (the Arctic archipelago plus the northern mainland), without
  the land borders, as one drawable path, plus `arcticCoastDrawFrac`.
- `CA2.nws`: the **47 North Warning System sites**, west to east from northern Yukon to Labrador. 11 are long-range
  (`lrr: true`) and the rest short-range, placed along the real DEW/NWS line: Komakuk Beach, Shingle Point,
  Tuktoyaktuk, Cape Parry, Cape Young, Lady Franklin Point, Cambridge Bay, Jenny Lind Island, Gladman Point,
  Shepherd Bay, Pelly Bay, Hall Beach, Longstaff Bluff, Dewar Lakes, Cape Hooper, Cape Dyer, Brevoort Island,
  Resolution Island, Saglek, Cape Kiglapait and the coast down to Goose Bay's latitude.
- `CA2.places`: projected points {name, p}. Alert, Eureka, Resolute, Nanisivik, Arctic Bay, Pond Inlet, Iqaluit,
  Rankin Inlet, Cambridge Bay, Kugluktuk, Inuvik, Tuktoyaktuk, Yellowknife, Whitehorse, Goose Bay, Kuujjuaq, Hall
  Beach, Igloolik, Ottawa, Vancouver, Halifax, Esquimalt, Greenwood, Comox, Cold Lake, Bagotville, Winnipeg, Edmonton,
  Washington DC, Colorado Springs, Luke AFB (Arizona), Anchorage, Fairbanks. Include the projected points even if
  they fall outside 0..1920 x 0..1080 (the camera can pan there).
- `CA2.nwpRoutes`: the main Northwest Passage routes as smooth paths through the water, never crossing land at the
  50m resolution. Northern route: Lancaster Sound, Barrow Strait, Viscount Melville Sound, McClure Strait.
  Prince of Wales Strait variant. Southern (Amundsen) route: Peel Sound, Franklin Strait, James Ross/Rae Strait,
  Simpson Strait, Queen Maud Gulf, Dease Strait, Coronation Gulf, Dolphin and Union Strait, Amundsen Gulf. All run
  from Baffin Bay to the Beaufort Sea.
- `CA2.channels`: the inter-island water of the archipelago as a filled shape (for the "internal waters" red fill),
  e.g. the archipelago bounding area minus land.
- `CA2.regions`: label points and soft outline paths for "northern approaches" (Beaufort Sea, Davis Strait/Labrador
  Sea, Baffin Bay) and "high Arctic" (polar basin north of the archipelago).
- `POLAR2.points`: Anadyr, Anchorage (JBER), Fairbanks (Eielson), Alert, Murmansk, Olenya (Kola), Norilsk, Moscow,
  Beijing, Ottawa, Washington, New York, Chicago, Colorado Springs, Oslo, Reykjavik, North Pole.
- `POLAR2.adiz`: the Alaska ADIZ as a closed path (approximate outline around Alaska including the Bering Sea side to
  ~169°W and the Aleutians).
- `POLAR2.bomberTracks`: four paths, 2 Tu-95 + 2 H-6 flying together, from near Anadyr east over the Bering Sea
  into the ADIZ and back, staying outside US airspace (12 NM from the coast).
- `POLAR2.interceptTracks`: from Anchorage/Fairbanks to meet them.
- `POLAR2.strikeArcs`: great-circle arcs from the Kola peninsula / Barents Sea / Russian Arctic to Ottawa, Toronto,
  Chicago, New York and Washington (over the pole and the Canadian Arctic).
- `POLAR2.seaRoutes`: Northern Sea Route, Northwest Passage (simplified at polar scale) and the Transpolar route.
- `POLAR2.rcmTracks`: four satellite ground-track swaths of a ~600 km sun-synchronous polar orbit (inclination
  97.74°) crossing the Canadian Arctic, as path centerlines plus a swath half-width in px.
- `WORLD`: a new Equal Earth (or Natural Earth I) world map fitted to the frame: countries {id, name, d, c}, sphere
  outline and graticule, for Australia (OTH radar), Germany (TKMS) and the Canada/US partnership at world scale.

## 7. Sound library (`public/sfx/*.wav`, Freesound CC0, onsets in `assets-src/credits/sfx-*.json`)

Existing: whoosh_soft (onset 0.116 s), whoosh_soft2 (0.418), whoosh_big (0.45), paper_slide (0.184), paper_slide2
(0.136), pop (0.004), pop2 (0.008), marker_swipe (0.07), pen_scribble (0.262), stamp (0.008), tick (0.008),
paper_unfold (0.574), wind_arctic (0), ice_crack, jet_flyby, ship_horn, snow_steps, riser, boom, drone, bear_growl,
moose_call. New (sourced for these parts, see credits): radar_ping, sonar_ping, heli_flyby, radio_beep,
shutter_click, keyboard_tick (if found).

Rule: `at = visual event time - onset` so the transient hits the event.

## 8. Photos (`public/img/*.png`, Canva cut-outs)

Existing stickers: cf18, dewolf, soldiers, polar-bear, moose, people, plus the parallax layers arctic-bg/fg and
wild-bg/fg. New ones are listed with their file names in `assets-src/credits/*.json`. Check `public/img` before
using a name. Canva lesson: **use only Canva's alpha and keep the photo's own RGB** (`scripts/fix_cutouts.py`
pattern), because Canva's layer separation re-types lettering.

## 9. QA checklist (every scene, before calling it done)

- `npx tsc --noEmit` passes.
- Render stills at the scene's key beats (`node scripts/stills.mjs <prefix> 0.5 <frames...>`), plus one frame
  inside each transition, and look at them.
- Nothing is cropped or touching the edges by accident; labels sit on the right territory; routes are
  geographically right; text is readable and on screen long enough.
- Everything on screen explains what the narration says at that moment. If not, remove it.
- No jitter sources (§2). No decorative footers or fake data.
