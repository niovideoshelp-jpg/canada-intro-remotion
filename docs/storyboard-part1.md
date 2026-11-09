# Storyboard: Part 1 (`CanadaPart1`, 190.75 s narration, DURATION 192.0 s)

Read `docs/bible.md` first. Times are global seconds, and cuts sit in speech pauses (they are already in
`src/videos/part1/timing.ts`). `T('word')` gives word times. Scene files go in `src/videos/part1/scenes/`.

Arc: **cold open on a real event** (the 24 July 2024 interception), then the bridge (NORAD and partnership), then
the two things to examine (equipment + support network), then geography (coast, distances, sustainment), the people,
climate, the threat assessment (no immediate threat, yet Russia is the main threat), strike routes, dual-use ships,
and finally "different jobs need different sensors, forces and partners", which leads straight into Part 2.

---

## P1S01: The intercept (0.00 → 17.59)
> "On July 24th, 2024, Canadian and American fighter jets intercepted two Russian Tu-95 bombers and two Chinese H-6
> bombers in Alaska's air defense identification zone. All four remained in international airspace. None entered
> Canadian or U.S. airspace."

**Anchor #2 is born here.** This is one continuous polar-map shot (POLAR projection, `PolarBase` with Canada in red)
whose camera moves from wide to the Bering Sea.
- 0.0: the polar map is already on screen (first frame = anchor; no fade-in from black, the map can be drawing
  its graticule). The camera is wide on the pole, tilted so Alaska and Chukotka are upper-centre. Stamp
  **`JULY 24, 2024`** hits on "twenty-fourth" (`T('july')`→`T('2024')`), top-left safe area, with the stamp SFX.
- `T('canadian')`…`T('jets')`: white jet icons appear at Anchorage and Fairbanks (Alaska), small rings pulse once.
- `T('russian')`: **Russia paints red** (ink spread from Chukotka outward, `paint()`), and two bomber icons appear
  near Anadyr with the label **`TU-95`**.
- `T('chinese')`: two more bomber icons join them with the label **`H-6`**. China is outside this framing, so no paint;
  the label is enough. Alternatively show a small **`CHINA`** label at the frame edge.
- `T('intercepted')` falls before the bombers in the sentence. Order it so the bombers' dashed red tracks are
  already advancing east over the Bering Sea when the jet tracks (ink) launch toward them; the two groups meet
  inside the ADIZ by ~`T('zone')`.
- `T('alaska')`→`T('zone')`: the **ADIZ outline draws** (dashed ink, `POLAR2.adiz`) around Alaska, plus the label
  **`AIR DEFENSE IDENTIFICATION ZONE`** (small Anton, ink) along its edge.
- Camera push-in over this sentence: from wide to the Bering Sea, ending with Alaska plus the tracks filling the frame.
- `T('all')`→14.5: the four tracks curve and run parallel to the coast, never crossing it. The label
  **`INTERNATIONAL AIRSPACE`** sits beside them.
- `T('none')`→17.4: Alaska's coast and the Canadian border glow (a solid ink line slightly offset seaward) as
  sovereign airspace. The bomber tracks turn back west; the jets shadow them.
- Optional photo anchor (if `public/img/h6.png` / `tu95.png` exist): between `T('russian')` and `T('zone')` a
  sticker of the real bomber slides in from the right edge (w≈520) and slides out by `T('zone')`. Do not cover the
  tracks.
- SFX: stamp on the date; whoosh_soft on the camera push; jet_flyby (vol 0.22) as the jets launch; radar_ping low
  when the ADIZ closes.

## P1S02: NORAD (17.59 → 39.39)
> "The operation was carried out by NORAD, the North American Aerospace Defense Command, which brings the United
> States and Canada together under a bi-national command. NORAD itself said the activity wasn't considered a threat.
> Even so, the aircraft were tracked and intercepted. It was a practical example of how the two countries work
> together to keep an eye on who's approaching North America."

The same polar map continues; the camera starts where P1S01 ended and pulls back.
- `T('norad')`: a red marker label **`NORAD`** (MarkerLabel, size ~92) top-centre. At
  `T('north',1)`…`T('command',1)` its full name appears underneath in small ink Anton:
  **`NORTH AMERICAN AEROSPACE DEFENSE COMMAND`**.
- `T('united')`: the **US paints red**. `T('canada')`: Canada is already red. A bright ink stitch line draws along
  the US-Canada border ("together"). By `T('bi')` both read as one block.
- `T('norad',2)`→`T('threat')`: the NORAD label stays; a smaller ink marker **`NOT CONSIDERED A THREAT`** appears
  under it. Use an ink bar with dark text, not red, so red stays for the threat itself.
- `T('tracked')`: zoom back toward Alaska. A `RadarSweep` centred on Alaska catches the four bomber blips (they light
  up as the sweep passes). `T('intercepted')`: the jet icons tuck in beside the bombers.
- `T('practical')`→39.2: pull back to the whole polar view of North America. A thick translucent ink **watch-arc**
  draws across the Arctic from Alaska over northern Canada to Greenland. Small arrows from over the pole point at
  it ("who's approaching North America").
- SFX: marker_swipe (NORAD), radar_ping (tracked), whoosh_soft on each pull-back.

## P1S03: Equipment, then the partnership (39.39 → 50.61)
> "Canada has the equipment to patrol its Arctic region, monitor foreign activity and carry out military
> operations, but its defense against larger threats has been built around a partnership with the United States."

Anchor return: the Intro's stickers, laid out differently from the Intro's S09.
- `T('patrol')`: the **DeWolf** sticker slides in from the left (centre-left, w≈760).
- `T('monitor')`: a **radar dome** (photo sticker `nws-radar.png` if it exists; otherwise a big `Icon radarDome` in a
  disc) pops upper-right.
- `T('military')`/`T('operations')`: the **soldiers** sticker pops lower-right (w≈360).
- `T('but')`: all three slide down and away as the CA (Lambert) map rises behind: Canada in graphite. At
  `T('partnership')`, Canada and the US both paint red **from the shared border outward** ("built around a partnership").
- SFX: paper_slide2 per sticker (low), whoosh_soft at "but".

## P1S04: Two things to look at (50.61 → 57.44)
> "To understand what the Canadians can do, we need to look at both their equipment and the support network that
> lets them use it up north."

A split-frame diagram (`SplitPanel`).
- `T('equipment')`: left half, three small stickers (cf18, dewolf, soldiers) stacked like a hand of cards, with the
  label **`EQUIPMENT`**.
- `T('support')`/`T('network')`: right half, the north of the CA map with ~10 points (Iqaluit, Inuvik, Yellowknife,
  Resolute, Alert, Cambridge Bay, Goose Bay, Rankin Inlet, Pond Inlet) linked by drawn chalk lines into a web,
  labelled **`SUPPORT NETWORK`**.
- `T('north')`: the right half nudges up (the camera tilts toward the north).

## P1S05: 162,000 km of coast (57.44 → 68.25)
> "Canada's Arctic coastline alone stretches for roughly 162,000 kilometers. Patrolling it means covering enormous
> distances in a region with very little infrastructure."

- 57.5: CA map framed on the Arctic archipelago (camera s≈1.6 over the islands); the land is graphite.
- `T('coastline')`→`T('kilometers')`: **`CA2.arcticCoast` draws in chalk** (it is intricate, so let it race west
  to east over ~2.8 s) while `Counter` **`162,000 KM`** counts up (outCubic) to land on `T('kilometers')`.
  Place it over the open sea (Beaufort/Arctic Ocean), not over land.
- `T('patrolling')`: slow pull-back; a red dashed **patrol route** loops through the archipelago (long, winding).
- `T('enormous')`/`T('distances')`: the route keeps drawing; the camera keeps receding to show the vast empty land.
- `T('little')`/`T('infrastructure')`: only ~8 tiny infrastructure dots appear, sparse and lonely in all that space.
- SFX: pen_scribble (coast draw), ticks under the counter (`ticks()`), whoosh_soft on the pull-back.

## P1S06: Range is not the problem, sustainment is (68.25 → 80.30)
> "An aircraft might have the range to get somewhere, but keeping an operation going there takes fuel,
> maintenance, communications and support for the people on the ground. All of that has to be available where the
> mission is taking place."

CA map, same graphite look.
- `T('aircraft')`: a jet icon (or a small cf18 sticker) leaves Cold Lake (Alberta) on a dashed route to a pin on
  the archipelago (e.g. near Resolute). A `RangeRing` from Cold Lake shows it can reach (`T('range')`).
- `T('fuel')`, `T('maintenance')`, `T('communications')`, `T('support')`: four `IconBadge`s pop around the
  destination pin, one per word: **fuel**, **wrench**, **antenna**, **people/medical**. Each has a one-word label
  (`FUEL`, `MAINTENANCE`, `COMMS`, `SUPPORT`).
- `T('available')`→`T('place')`: the four badges pull chalk lines into the pin, which becomes a red ring
  (`T('mission')`).
- SFX: jet_flyby (low) on departure, pop ×4, a soft radio_beep on comms.

## P1S07: The people of the north (80.30 → 89.95)
> "The people who live there are part of this discussion too. Local communities, governments, and indigenous peoples
> have interests of their own, and they know the region's challenges firsthand."

Photo anchor: a 2-layer parallax plate of a **Canadian Arctic community** (`community-bg.jpg` + `community-fg.png`,
e.g. Iqaluit or Pond Inlet). It must show the place (houses, shore, inuksuk), not identifiable faces.
- Slow push-in with parallax for the whole scene.
- If the photo is a named place, show a MapLabel with the place name (e.g. **`IQALUIT, NUNAVUT`**) at `T('communities')`.
- No other text. Let the photo breathe.
- SFX: wind_arctic bed (vol 0.18, fade in/out).

## P1S08: Their security is national security, and dual use (89.95 → 101.97)
> "Canadian policy recognizes their security as part of national security. An airstrip, a communications network,
> or a refueling site can serve the military while also making life better for people living in the north."

- 90.0: CA map with ~15 northern community dots (red, small).
- `T('national')`: red ink spreads **from those dots outward until all of Canada is painted** (seeds at the
  community points, `paint()`): local becomes national.
- `T('airstrip')`, `T('communications')`, `T('refueling')`: the map dims; three `IconBadge`s (runway, antenna, fuel)
  pop in a row, centred.
- `T('military')`: a chalk arrow to the left ends at a jet icon labelled `MILITARY`. `T('life')`/`T('people')`:
  an arrow to the right ends at a house icon labelled `COMMUNITIES`. The same three icons serve both.
- SFX: pop ×3, marker_swipe.

## P1S09: A warming Arctic (101.97 → 112.98)
> "A warming Arctic adds another concern. Access to the region is changing. But those changes aren't happening
> evenly. Less ice doesn't mean every route will be open and safe all year."

Polar map (anchor #1), with sea ice as a white, slightly translucent shape over the Arctic Ocean, drawn procedurally:
a smooth closed blob, static noise, no flicker.
- `T('warming')`: the ice cap is large (winter-like).
- `T('access')`/`T('changing')`: the ice shrinks over ~2 s and three routes draw in ink dashes (`POLAR2.seaRoutes`:
  Northern Sea Route, NW Passage, Transpolar).
- `T('evenly')`: the shrink is visibly **uneven**. The Russian side opens wide while ice stays packed in the Canadian
  archipelago (keep a white mass over the islands' channels).
- `T('less')`→`T('year')`: on the NW Passage route, two or three choke points get red `✕` marks (Icon cross) where
  ice remains, and a small chalk "calendar" bar shows open only in late summer (Aug-Sep highlighted). No text except
  the month initials if used.
- SFX: ice_crack (low) on the shrink, marker_swipe on the ✕ marks.

## P1S10: Geography matters (112.98 → 125.20)
> "Researchers Ryan Dean and P. Whitney Lackenbauer stress how much geography matters when assessing threats.
> Applying the same assumptions to the Canadian Arctic that you'd use for Northern Europe can lead you to the wrong
> conclusions."

- 113.0: polar map dimmed; names in Anton on a clean area: **`RYAN DEAN`** (`T('ryan')`) and
  **`P. WHITNEY LACKENBAUER`** (`T('whitney')`), riseLine reveals, ink colour.
- `T('geography')`: the names slide up and small; the camera starts to move.
- `T('canadian')`: the camera swings to the Canadian archipelago (ice, islands) with the label `CANADIAN ARCTIC`.
- `T('northern')`/`T('europe')`: the camera swings to Norway and the Barents Sea. Norway paints in graphite-light,
  not red. Label `NORTHERN EUROPE`, plus a warm-current arrow (red, North Atlantic Drift) running up the Norwegian
  coast to show ice-free water.
- `T('wrong')`: split view of both regions with a big ink **`≠`** between them.

## P1S11: Two assessments (125.20 → 141.11)
> "In documents prepared for Parliament in June 2026, the Canadian government said it saw no immediate military threat
> to its Arctic territory. At the same time, it identified Russia as the main military threat in the region. Those two
> assessments can both be true."

- `T('documents')`: a `DocCard` slides in (centre-left, slight rotation) with a Stamp **`JUNE 2026`**
  (`T('june')`). Optional: a Parliament photo plate behind it, if `parliament.jpg` exists.
- `T('immediate')`: on the card, the highlighted phrase **`NO IMMEDIATE MILITARY THREAT`** reveals with a red marker swipe.
- `T('russia')`: the card slides left and small; the polar map rises and **Russia paints red**. A marker label
  **`MAIN MILITARY THREAT`** lands on Russia at `T('main')`.
- `T('both')`/`T('true')`: the two statements side by side (card left, Russia right) with a chalk `+` between,
  both held.
- SFX: paper_slide, stamp, marker_swipe, a low boom (vol 0.18) on Russia.

## P1S12: Strike without invasion (141.11 → 157.56)
> "A country can have the ability to strike Canada without being in the middle of planning an invasion of its
> islands. The main concern is aircraft and naval forces capable of launching long-range weapons. In a wider war, the
> Arctic could become a route for attacks on other parts of North America."

Polar map, Russia red, Canada red.
- `T('strike')`: red dashed arcs (`POLAR2.strikeArcs`) draw from the Russian Arctic over the pole to Canada.
- `T('invasion')`: a chalk "landing" arrow toward the archipelago islands draws, then gets a red ✕ at `T('islands')`.
- `T('aircraft')`: bomber icons (Tu-95 silhouettes, anchor #2) on the Russian side. `T('naval')`: ship and
  submarine icons in the Barents/Arctic Ocean. `T('long')`→`T('weapons')`: each launches a short arc that ends
  short of Canada (launch from a distance).
- `T('route')`: the arcs extend past Canada's north into the US and southern Canada (Chicago, New York, Washington).
  A broad translucent red **corridor** band across the Canadian Arctic shows "the route".
- SFX: whoosh_big (strike arcs), boom (low) at "route".

## P1S13: Espionage, cyber, dual-use ships (157.56 → 172.84)
> "Canada's foreign policy also warns about espionage, cyber operations, and intelligence gathering by platforms with
> both civilian and military uses. That includes Chinese ships that can collect data useful for scientific research
> as well as military applications."

- `T('espionage')`, `T('cyber')`, `T('intelligence')`: three `IconBadge`s (eye, cyber, antenna) pop left to right,
  each with a one-word label: `ESPIONAGE`, `CYBER`, `INTELLIGENCE`.
- `T('civilian')`/`T('military')`: a ship silhouette drawn half ink (civilian) and half red (military), split by a
  vertical line.
- `T('chinese')`: the photo sticker of a **Chinese research vessel** (`china-research-ship.png`) slides in. **China
  paints red** on a small polar inset (or label `CHINA`).
- `T('data')`: chalk sonar lines fan down from the hull to a seafloor line. `T('scientific')`: an arrow to a `RESEARCH`
  label; `T('military',2)`: an arrow to a `MILITARY` label (red).
- SFX: pop ×3, sonar_ping (low) on the sonar lines.

## P1S14: Different jobs (172.84 → 192.00 end)
> "So counting how many troops are stationed in the far north only tells you part of the story. Responding to an
> emergency in a remote community and detecting an air attack coming across the Arctic are very different jobs. The
> sensors, the forces needed to respond, and even the partners involved will vary depending on the threat."

- `T('counting')`: a `PictogramGrid` of soldier pictograms fills in over the dim northern map, counting.
- `T('part')`/`T('story')`: the camera pulls back; the pictograms are only one small tile in a wider grid of empty
  outlined tiles (the rest of the story).
- `T('responding')`: `SplitPanel`. Left: an emergency in a remote community (a helicopter icon over a community dot,
  or the Rangers sticker if it exists). Right, at `T('detecting')`: the **polar map with the bombers' tracks
  returning** (anchor #2) and a RadarSweep.
- `T('sensors')`, `T('forces')`, `T('partners')`: three columns, each an icon plus an Anton word (**`SENSORS`**,
  **`FORCES`**, **`PARTNERS`**: radarDish; jet + ship; handshake). Under each, two small variants swap as the threat
  flips (emergency becomes air attack) at `T('threat')`.
- End: hold the three columns; this is the bridge into Part 2, which starts with sensors.
- SFX: tick (low) on the count, whoosh_soft on the pull-back.
