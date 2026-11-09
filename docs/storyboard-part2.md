# Storyboard: Part 2 (`CanadaPart2`, 389.41 s narration, DURATION 390.5 s)

Read `docs/bible.md` first. Cuts sit in speech pauses (already in `src/videos/part2/timing.ts`). Scene files go in
`src/videos/part2/scenes/`.

Arc: Part 1 ended on "sensors, forces, partners". Part 2 walks the toolbox in that order: **see** (radar line,
satellites, AIS, the audit, OTH radar), **respond** (CF-18 → F-35), **at sea** (DeWolf, Coast Guard), **under the ice**
(Victoria subs, replacement), **from the air** (Aurora → Poseidon), **on land** (Alert, Rangers, Nanook) and the
**support network** (Nanisivik's failure, hubs, the NORAD infrastructure package), ending with forces moving north.
Visual variety: alternate map, photo/sticker, diagram, timeline and document so no two consecutive scenes share the
same layout.

---

## P2S01: The North Warning System (0.00 → 13.35)
> "To see what's approaching from the north, Canada relies on the North Warning System, a network of 47 radar sites
> stretching from Yukon to Labrador. The problem is that it was built between 1986 and 1992."

- 0.0: CA map, camera on the northern mainland coast. Canada is graphite with a thin ink outline, and the north
  (top) is lit.
- `T('north',1)`: soft chalk arrows come down from the top edge ("approaching from the north").
- `T('warning')`: label **`NORTH WARNING SYSTEM`** (MarkerLabel, red bar) top-centre.
- `T('47')`→`T('labrador')`: the **47 `CA2.nws` sites** pop west to east in sequence (11 bigger rings for long-range)
  and a thin chalk chain links them. `Counter` **`47`** next to the label counts with the pops. `T('yukon')`: label
  `YUKON` at the western end; `T('labrador')`: label `LABRADOR` at the eastern end. The camera pans with the wave.
- `T('built')`: Stamp **`1986–1992`** (en dash) over the chain; the site rings desaturate slightly ("old").
- Optional: if `nws-radar.png` exists, a radar dome sticker pops at `T('radar')` (top-right, w≈380).
- SFX: radar_ping (low) at the start of the wave, tick per ~6 sites, stamp on the dates.

## P2S02: Testing its limits (13.35 → 19.90)
> "It's still operating, but more advanced cruise missiles and hypersonic weapons are already testing its limits."

A side-view diagram on the dark grid.
- A curved Earth surface line (chalk) runs across the lower third. A radar dome icon on the left emits its coverage
  fan (translucent ink wedge) that stops at the horizon.
- `T('cruise')`: a small missile glyph flies very low along the surface **under** the fan (red dashed track),
  label `CRUISE MISSILES`.
- `T('hypersonic')`: a second glyph streaks along a high, fast, depressed trajectory, clipping the fan's edge, label
  `HYPERSONIC WEAPONS`.
- `T('limits')`: the fan's edge flashes red once (a single, smooth pulse).
- SFX: whoosh_soft (cruise), whoosh_big (hypersonic).

## P2S03: Eyes in space, RADARSAT (19.90 → 33.08)
> "Surveillance also comes from space. The three satellites in the Radarsat Constellation mission can capture images
> during the day, at night, and through cloud cover. Some areas of the far north can get up to four passes a day."

Polar map (anchor #1), seen from high above with the camera pulled back.
- `T('space')`: the camera rises (zoom out), the sphere edge shows, and three satellite icons appear on one polar orbit
  line.
- `T('three')`: label **`RADARSAT CONSTELLATION MISSION`** (MarkerLabel).
- `T('day')`, `T('night')`, `T('cloud')`: three `IconBadge`s (sun, moon, cloud) pop on the left, one per word. Under the
  satellites, a radar swath (translucent ink band) sweeps the Canadian Arctic; for "cloud cover" a soft cloud layer
  passes over without hiding the swath.
- `T('four')`: four ground-track swaths (`POLAR2.rcmTracks`) cross the far north one after another, plus `Counter`
  **`4`** with the unit line **`PASSES A DAY`**.
- SFX: shutter_click (very low) per swath, whoosh_soft on the rise.

## P2S04: AIS and the gaps (33.08 → 47.67)
> "At sea, those images are cross-referenced with data from AIS, the Vessel Identification System, to help identify
> ships and track maritime traffic. It's a useful tool, though it doesn't provide continuous coverage of every point
> in the country."

CA map zoomed on the eastern Arctic waters (Baffin Bay / Lancaster Sound / Davis Strait).
- `T('sea')`: radar blips (small white squares) appear on the water.
- `T('ais')`: label **`AIS`**. Ship icons with short ink track lines appear; each blip gets a thin connector to a ship
  icon ("cross-referenced"), matched pairs.
- `T('identify')`/`T('track')`: tracks extend along their headings.
- `T('useful')`: hold. `T('continuous')`→`T('country')`: the camera pulls back over the whole Arctic; the swath
  coverage areas show as lit patches and the **gaps between them as dark areas with dashed red outlines**.
- SFX: radio_beep (very low) on matches, whoosh_soft on the pull-back.

## P2S05: The 2022 audit (47.67 → 66.88)
> "Getting all these systems to work together is another challenge. A 2022 federal audit found gaps in maritime
> traffic information, problems sharing data between agencies and delays in replacing equipment. The report showed
> that surveillance depended as much on getting information to the people who needed it as it did on the sensors
> themselves."

A diagram, then a document.
- `T('systems')`: three `IconBadge`s (radarDome, satellite, ship+AIS) on the left, linked by chalk lines to a centre
  node. The lines draw but stay **broken** (gaps in the dashes) by `T('challenge')`.
- `T('audit')`: a `DocCard` slides in, Stamp **`2022 FEDERAL AUDIT`** (`T('2022')`).
- `T('gaps')`, `T('sharing')`, `T('delays')`: three short Anton items appear one per word as a list on the card's
  right: **`GAPS IN TRAFFIC DATA`**, **`DATA SHARING`**, **`EQUIPMENT DELAYS`**.
- `T('report')`→`T('themselves')`: a `Balance` with **sensors** (radarDome icon) on one pan and **people** (person icons
  + an arrow of information to them) on the other, settling **level** at `T('themselves')` ("as much as").
- SFX: paper_slide, stamp, pop ×3, a soft tick when the balance settles.

## P2S06: Over-the-horizon radar, Australian technology (66.88 → 79.69)
> "One of the projects meant to improve detection is an over-the-horizon radar system using Australian technology.
> Canada moved forward with agreements involving Australia and BAE Systems Australia in June 2026."

`WORLD` map (Equal Earth), graphite.
- `T('over')`: the label **`OVER-THE-HORIZON RADAR`** appears.
- `T('australian')`: **Australia paints red**; the camera eases to frame both Australia and Canada.
- `T('canada')`: Canada is red too. `T('agreements')`: a chalk great-circle arc links Australia and Canada (a handshake
  `Icon` at its midpoint).
- `T('bae')`: name label **`BAE SYSTEMS AUSTRALIA`** under Australia. `T('june')`: Stamp **`JUNE 2026`**.
- SFX: whoosh_soft, marker_swipe, stamp.

## P2S07: How OTH works, and when (79.69 → 96.72)
> "The system uses refraction in the ionosphere to bend radar signals, allowing it to see beyond the range of
> conventional radar and provide more time to react. But its initial capability isn't expected until December 2029.
> For now, it's an improvement still in the works."

Side-view diagram: Earth's curve (chalk arc), the **ionosphere** as a band high above (label `IONOSPHERE`), a
transmitter on the left.
- `T('refraction')`: the beam (red) goes up, **bends** off the ionosphere and comes down far beyond the horizon.
- `T('conventional')`: a second, ink beam goes straight and is cut by the horizon; label `CONVENTIONAL RADAR` on it.
- `T('beyond')`: a target (bomber icon, anchor #2) far out is lit by the OTH beam only.
- `T('time')`/`T('react')`: two `StatBar`s, warning time conventional (short) vs OTH (long), labels `CONVENTIONAL` and
  `OVER-THE-HORIZON`. No invented numbers: bars only.
- `T('december')`: the diagram shrinks up; a `Timeline` 2026 → 2030 draws with TODAY at 2026 and the mark
  **`DEC 2029`** (red) labelled `INITIAL CAPABILITY`.
- `T('works')`: the OTH beam turns to dashes (in progress).
- SFX: whoosh_soft (beam), stamp (Dec 2029).

## P2S08: Someone has to respond, the CF-18 (96.72 → 107.56)
> "Once a threat is detected, someone has to respond. Canada's CF-18s are still doing that job through NORAD alongside
> U.S. forces as the country prepares to replace its fighter fleet."

- `T('detected')`: polar map, the bombers' tracks (anchor #2) blink into a red detection ring.
- `T('respond')`: cut-in by camera push; the **cf18** sticker slides in large from the left. Label **`CF-18`**.
- `T('norad')`: the NORAD red marker label (same as Part 1) plus a chalk link to a small US jet sticker or icon on the
  right (`T('u')`/`T('forces')`).
- `T('replace')`: the CF-18 sticker slides out; a dashed outline of a jet remains where it was ("the fleet to be
  replaced").
- SFX: radar_ping, jet_flyby (vol 0.24) as the CF-18 enters.

## P2S09: The first F-35s (107.56 → 124.42)
> "Canada received its first two F-35s in October 2026 at Luke Air Force Base in Arizona. But by the end of that
> month, the government was still reviewing its plan to buy 88 aircraft. The plan calls for the first eight F-35s to
> be based in the United States for training."

- `T('f',1)`/`T('35s',1)`: the **F-35 sticker** (`f35.png`) fills the dashed outline from P2S08 (match cut feel), with
  the label **`F-35`**. Two jet icons beside it ("first two").
- `T('october')`: Stamp **`OCT 2026`**. `T('luke')`: CA map, camera pans down to Arizona; pin label
  **`LUKE AFB, ARIZONA`**.
- `T('reviewing')`→`T('88')`: `PictogramGrid` of **88 jets** (11×8) fills in fast with `Counter` **`88`**. While
  "reviewing", the grid draws in dashed outline (not committed) and a `magnifier` icon passes over it.
- `T('eight')`: the first 8 jets turn red and fly into a small box over the US map labelled **`TRAINING IN THE U.S.`**.
- SFX: stamp, ticks for the 88 (few), whoosh_soft.

## P2S10: Not a fleet for today (124.42 → 137.99)
> "The first aircraft are due to arrive in Canada in 2028, with initial operational capability expected between 2029
> and 2030. So those 88 fighters aren't a fleet Canada can call on to defend the Arctic today."

- `T('arrive')`: a `Timeline` 2026 → 2031 draws. Marks: **`2026`** (first two, at Luke), **`2028`** (`IN CANADA`) at
  `T('2028')`, and a band **`2029–2030`** (`INITIAL OPERATIONAL CAPABILITY`) at `T('2029')`.
- `T('today')`: a red **`TODAY`** marker lands on 2026; the 88-jet grid (small, above the timeline) dims to outlines.
- SFX: marker_swipe, stamp on TODAY.

## P2S11: Transition problems (137.99 → 151.64)
> "And the transition has other problems. A 2025 audit found delays in facilities and shortages of qualified pilots and
> engineering personnel. When the aircraft arrive, they need trained people and bases that can keep them flying."

- `T('audit')`: Stamp **`2025 AUDIT`**.
- `T('facilities')`: `IconBadge` hangar + clock (delay).
- `T('pilots')`: a row of pilot (person) icons with empty dashed slots. `T('engineering')`: a row of wrench icons with
  empty slots. Counts are illustrative, so no numbers.
- `T('arrive')`→`T('flying')`: an F-35 icon lands on a runway icon and the people/wrench icons connect to it with
  chalk lines; empty slots stay empty and visible.

## P2S12: Six DeWolf-class ships (151.64 → 165.86)
> "At sea, all six Harry DeWolf-class patrol ships have been delivered, and the program reached full operational
> capability in October 2026. They've been operating in the Arctic between June and October, expanding Canada's
> presence during the navigation season."

**Anchor #3 returns**, the Intro's last image.
- `T('sea')`: the **dewolf** sticker slides in (w≈900). Label **`HARRY DEWOLF CLASS`** at `T('harry')`.
- `T('six')`: `PictogramGrid` of 6 ship icons with `Counter` **`6`**.
- `T('october')`: Stamp **`OCT 2026`**.
- `T('operating')`: CA map; six ship icons sit in Arctic waters (Lancaster Sound, Baffin Bay, NW Passage, Beaufort).
  A 12-month strip (`J F M A M J J A S O N D`) with **JUN–OCT painted red** at `T('june')`→`T('october',2)`.
- SFX: ship_horn (low, short), stamp.

## P2S13: What one ship can do (165.86 → 182.13)
> "At 103 meters long, with a stated range of 6,800 nautical miles, they can carry cargo, vehicles, and smaller
> boats, as well as accommodate helicopters depending on the mission. That allows them to support teams ashore,
> conduct patrols, and take part in rescues."

- dewolf sticker large, centre. `T('103')`: a `Dimension` along the hull, **`103 M`**.
- `T('6')`/`T('800')`: `Counter` **`6,800`**, unit **`NAUTICAL MILES`**.
- `T('cargo')`, `T('vehicles')`, `T('boats')`, `T('helicopters')`: four icons pop above the deck (cargo, truck, boat,
  helicopter), with the helicopter on the stern helideck.
- `T('ashore')`, `T('patrols')`, `T('rescues')`: three small `IconBadge`s in a row below (boat to shore, route,
  lifebuoy).

## P2S14: Limits (182.13 → 203.15)
> "But these ships have limits too. They're rated to operate in up to 1 meter of first-year ice, which doesn't mean
> they can get through any ice conditions. Their 25mm armament fits their patrol and enforcement role. In my view, they
> do a lot to strengthen Canada's presence, but their combat power is limited if they're facing a naval force
> equipped for high-intensity warfare."

- `T('1')`/`T('meter')`: side-view diagram, a ship bow (simple silhouette) in a 1 m first-year ice layer with a
  `Dimension` **`1 M`**; it breaks through (✓).
- `T('any')`: ahead, thick multi-year ice and ridges; the bow stops, red ✕.
- `T('25mm')`: the dewolf sticker returns with a `Callout` ring on the bow gun, **`25 MM`**.
- `T('combat')`/`T('warfare')`: comparison. The DeWolf icon on the left; on the right a naval force (three warship
  icons with missile cells). Two `StatBar`s, combat power: the DeWolf short, the naval force long. No numbers.

## P2S15: The Coast Guard (203.15 → 221.61)
> "The Coast Guard complements that work with icebreakers, search and rescue, navigation support, and information
> about conditions at sea. Although responsibility for it shifted to the Defense Department in September 2025, it
> remains a civilian organization. That administrative change didn't turn its ships into combat vessels."

- `T('coast')`: the **Coast Guard icebreaker sticker** (`ccg-icebreaker.png`, red hull) slides in. Label
  **`CANADIAN COAST GUARD`**.
- `T('icebreakers')`, `T('rescue')`, `T('navigation')`, `T('conditions')`: four `IconBadge`s pop (icebreaker, lifebuoy,
  buoy, wave).
- `T('defense')`: org diagram, a box **`COAST GUARD`** moves under a box **`DEPARTMENT OF NATIONAL DEFENCE`**. Stamp
  **`SEPT 2025`**. `T('civilian')`: the label **`CIVILIAN`** stays on the Coast Guard box (ink marker).
- `T('combat')`: a weapon icon above the icebreaker gets a red ✕.

## P2S16: Underwater, the Victoria class (221.61 → 238.93)
> "Underwater, the situation is more difficult. Canada has four Victoria-class submarines, but in July 2026, Prime
> Minister Mark Carney himself said only one was able to go to sea. Low availability aside, the class also has
> limitations when it comes to operating under ice."

- `T('underwater')`: the frame "dives". A waterline with ice slabs on top scrolls up; below is dark water with
  faint depth lines.
- `T('four')`: **Victoria-class sticker** (`victoria-sub.png`) plus 4 submarine icons, with the label
  **`VICTORIA CLASS`** and `Counter` **`4`**.
- `T('carney')`: name label **`PRIME MINISTER MARK CARNEY`** + Stamp **`JULY 2026`**. `T('one')`: 3 icons dim to
  outlines and 1 stays lit (red ring), with **`1`** next to it.
- `T('ice')`: the lit submarine moves up toward the ice ceiling and stops below it, red ✕ at the ice.

## P2S17: Open water is not under the ice (238.93 → 247.27)
> "Using these submarines in the northern approaches during the open water season isn't the same as being able to
> carry out extended patrols beneath the ice of the high Arctic."

CA map. The **northern approaches** (Beaufort, Davis Strait/Labrador Sea) are outlined and labelled
`NORTHERN APPROACHES`; a submarine track runs there (✓, ink). The **high Arctic** ice region (white) is labelled
`HIGH ARCTIC`; a dashed track under it ends in a red ✕. A large **`≠`** between the two labels lands at `T('same')`.

## P2S18: Replacement, 12 submarines (247.27 → 270.20)
> "The replacement program calls for up to 12 conventionally-powered submarines capable of operating under ice. In
> July 2026, Germany's TKMS was selected as the preferred supplier for negotiations on the project, with the first four
> submarines expected in 2034. That's progress on the planning side, but the Navy still has to get through the coming
> years with the equipment it has."

- `T('12')`: `PictogramGrid` of **12 submarines** (6×2) with `Counter` **`12`** and the word **`UNDER ICE`** at `T('ice')`.
- `T('germany')`: `WORLD`/Europe framing, **Germany paints red**, label **`TKMS`**, Stamp **`JULY 2026`**.
- `T('four')`: back on the grid, the first 4 turn red with the mark **`2034`** (`T('2034')`).
- `T('progress')`→`T('has')`: a `Timeline` 2026 → 2034 with a long stretch labelled `THE COMING YEARS`; at its left
  end (TODAY) sits the 1 available Victoria (icon).

## P2S19: Aurora → Poseidon (270.20 → 282.09)
> "In maritime patrol aviation, work is also underway to replace the CP-140 Aurora with the P-8A Poseidon, which is
> designed for surveillance and operations against submarines and surface ships."

- `T('aurora')`: the **CP-140 sticker** (`cp140.png`) on the left, label **`CP-140 AURORA`**.
- `T('poseidon')`: a chalk arrow → the **P-8A sticker** (`p8.png`) on the right, label **`P-8A POSEIDON`**; the Aurora
  dims.
- `T('surveillance')`, `T('submarines')`, `T('ships')`: three `IconBadge`s under the P-8 (eye, submarine, ship).

## P2S20: On land, Alert and the Rangers (282.09 → 302.80)
> "On land, Canada's permanent presence includes the station at Alert, along with command and support facilities.
> There are also the Canadian Rangers, reservists who live in remote communities and help with patrols, observation,
> and search and rescue. The 2025-26 results report lists more than 1,500 Rangers in the Arctic and the North."

- `T('land')`: CA map, camera flies to the tip of Ellesmere Island; red pin **`ALERT`** at `T('alert')`.
- `T('command')`: two small square markers (Yellowknife and Iqaluit), unlabelled except for the anchor pins.
- `T('rangers')`: the **Rangers sticker** (`rangers.png`; their red sweatshirts are a natural accent), label
  **`CANADIAN RANGERS`**.
- `T('patrols')`, `T('observation')`, `T('rescue')`: three `IconBadge`s (route, eye, lifebuoy).
- `T('1')`/`T('500')`: `Counter` **`1,500+`**, while person icons scatter over ~25 northern communities on the map.

## P2S21: Terrain, then Operation Nanook (302.80 → 317.83)
> "Their knowledge of the terrain helps other units operate in a region where just getting there and moving around
> takes considerable preparation. Operation Nanook exercises train forces for situations such as casualty
> evacuations, aircraft crashes and ice reconnaissance."

- `T('terrain')`: a parallax plate of the Arctic terrain (`terrain-bg.jpg` + `terrain-fg.png`). A dashed red route
  winds across it (a Ranger-led trek).
- `T('nanook')`: label **`OPERATION NANOOK`** (MarkerLabel).
- `T('casualty')`, `T('crashes')`, `T('reconnaissance')`: three small photo stickers (if they exist:
  `nanook-medevac.png`, `nanook-crash.png`, `nanook-ice.png`) or `IconBadge`s (medical, jet+warning, magnifier+snowflake),
  one per word.

## P2S22: Nanisivik (317.83 → 337.86)
> "The difficulty of sustaining these operations is clear at Nanisivik, the naval facility on northern Baffin Island.
> In May 2026, the Defense Department announced that it was taking the site out of operational use. Its very short
> seasonal operating window, construction problems, delays and expensive dock repairs had reduced its usefulness."

- `T('nanisivik')`: CA map, the camera dives to northern Baffin Island; red pin **`NANISIVIK`** and the label
  `BAFFIN ISLAND` at `T('baffin')`.
- `T('may')`: Stamp **`MAY 2026`**; the pin turns grey with a red ✕ at `T('operational')`.
- `T('window')`: a 12-month strip with only a sliver (late summer) open in red. `T('construction')`, `T('delays')`,
  `T('repairs')`: three `IconBadge`s (crane, clock, money).

## P2S23: Range instead of a base (337.86 → 352.12)
> "The government said the range of the Harry DeWolf-class ships, together with other refueling options, would allow
> operations to continue without any loss of capability. Even so, the case shows how an Arctic construction project can
> fall short of expectations."

- `T('range')`: on the same map, a DeWolf icon (anchor #3) sails a long dashed loop from Halifax to the archipelago
  and back, bypassing the greyed Nanisivik pin. `T('refueling')`: fuel icons at two alternative points.
- `T('expectations')`: two `StatBar`s, **`EXPECTED`** (full) vs **`DELIVERED`** (short).

## P2S24: Hubs and the NORAD infrastructure package (352.12 → 378.32)
> "Canada is also planning a network of support hubs in the north, with investment projected at 2.67 billion Canadian
> dollars between 2024 and 2044. In March 2026, the government also announced a package worth 32 billion Canadian
> dollars for NORAD-related infrastructure in Yellowknife, Inuvik, Iqaluit, and Goose Bay. That includes runways,
> hangars, fuel facilities, and ammunition storage."

- `T('hubs')`: CA map of the north; hub dots link into a network (chalk lines). `Counter` **`C$2.67`** with unit
  **`BILLION`** at `T('2')`, and a mini `Timeline` **`2024–2044`**.
- `T('march')`: Stamp **`MARCH 2026`**; `Counter` **`C$32`** unit **`BILLION`** (bigger, red) at `T('32')`.
- `T('yellowknife')`, `T('inuvik')`, `T('iqaluit')`, `T('goose')`: four red pins with their names, one per word.
- `T('runways')`, `T('hangars')`, `T('fuel')`, `T('ammunition')`: icons (runway, hangar, fuel, ammo) pop in a row under
  the map, one per word.

## P2S25: Closer to where they operate (378.32 → 390.50 end)
> "As those projects are completed, the goal is to bring forces into the region and support longer missions, with
> maintenance, storage, and medical care closer to where personnel need to operate."

- `T('bring')`: red chalk arrows run from the south up into the four hubs (forces moving north).
- `T('longer')`: from each hub, a longer dashed loop reaches out into the Arctic (longer missions).
- `T('maintenance')`, `T('storage')`, `T('medical')`: small icons (wrench, cargo, medical) attach to the hubs.
- End: the camera pulls back slowly to hold the whole lit northern network (calm ending).
