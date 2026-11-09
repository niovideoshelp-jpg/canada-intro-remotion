# Storyboard: Final (`CanadaFinal`, 103.63 s narration, DURATION 105.0 s)

Read `docs/bible.md` first. Cuts sit in speech pauses (already in `src/videos/final/timing.ts`). Scene files go in
`src/videos/final/scenes/`.

Arc: the allies' disagreement (Northwest Passage), a light joke (Ottawa vs Vancouver), how they manage it (1988),
why independence matters, then **the payoff**: the Intro's question card returns, the verdict (presence ✓ patrols ✓
missions ✓ … but alone in a long war against a major power: **NO**), why, and what's coming. It ends calm on the polar
map (anchor #1) without fake UI. The narrator's like/subscribe line plays over that calm ending.

---

## F01: Allies who disagree (0.00 → 6.83)
> "The United States and Canada work together to defend the continent, but they disagree over the Northwest
> Passage."

- 0.0: CA map, with **the US and Canada both painted red** (the NORAD block from Part 1). A bright ink stitch on their
  border.
- `T('disagree')`: the US paint drains back to graphite (from the border outward, the reverse of an ink spread). A
  thin red crack line runs along the border.
- `T('northwest')`/`T('passage')`: the camera pushes north into the archipelago. The NW Passage routes
  (`CA2.nwpRoutes`) draw in ink dashes, with the label **`NORTHWEST PASSAGE`** (MarkerLabel).
- SFX: whoosh_soft on the push.

## F02: Ottawa says internal waters, and the joke (6.83 → 15.52)
> "Ottawa considers its various routes to be Canadian internal waters. And yes, Ottawa is Canada's capital, in case you
> were thinking Vancouver."

- `T('ottawa')`: a small `OTTAWA` tag appears top-left (the speaker of this position).
- `T('routes')`: the routes re-draw boldly. `T('internal')`/`T('waters')`: **the inter-island waters (`CA2.channels`)
  fill red** with an ink spread from the routes outward, with the label **`INTERNAL WATERS`** (red MarkerLabel).
- `T('yes')`: a quick, playful camera whip south (≈0.5 s, inOutCubic, no shake) to southern Canada. At
  `T('vancouver')` a pin **`VANCOUVER`** pops on the west coast and immediately gets a red ✕. At `T('capital')` (which is
  said before "Vancouver") a pin **`OTTAWA`** with a star (★, Icon star) pops first. Order it to the speech: OTTAWA ★
  on "capital", VANCOUVER ✕ on "Vancouver".
- SFX: whoosh_soft (whip), pop (Ottawa), a light pop2 with the ✕.

## F03: Washington says international strait (15.52 → 23.42)
> "Washington, meanwhile, considers those waters a strait used for international navigation, with a right of transit
> for ships from other countries."

- `T('washington')`: the camera returns north (whip back). A tag **`WASHINGTON`** appears top-right, mirroring
  OTTAWA.
- `T('strait')`/`T('international')`: over the red waters, the main route turns into a bright ink "highway" (solid,
  thicker) with the label **`INTERNATIONAL STRAIT`** (ink MarkerLabel, so the two positions read as opposed colours).
- `T('transit')`/`T('ships')`: four ship icons sail the route east to west in a convoy (`MovingTrack`), each a
  slightly different shade of ink (other countries; no flags).
- SFX: ship_horn (very low, distant).

## F04: The 1988 agreement, partners with their own interests (23.42 → 36.78)
> "The two countries manage that disagreement through diplomacy, including the 1988 Arctic Cooperation Agreement,
> which preserved each side's legal position. The partnership continues, with each country looking out for its own
> interests."

- `T('diplomacy')`: a `DocCard` slides in centre with the real title **`ARCTIC COOPERATION AGREEMENT`** and Stamp
  **`1988`** at `T('1988')`.
- `T('preserved')`/`T('position')`: two columns appear under the card: left **`CANADA`** / `INTERNAL WATERS` (red),
  right **`UNITED STATES`** / `INTERNATIONAL STRAIT` (ink). A chalk bracket joins both under the card ("both
  preserved").
- `T('partnership')`: the card slides away; the CA map again with the US and Canada linked by the NORAD stitch
  (no paint). `T('own')`/`T('interests')`: one chalk arrow from Canada curls to the archipelago and one from the US
  curls to the passage route.
- SFX: paper_slide, stamp.

## F05: Independence is leverage (36.78 → 46.25)
> "For Canada, being able to monitor the region and operate there independently also means having more information and
> resources to back up its position in that relationship."

A `Balance` scale, **`CANADA`** on the left pan and **`UNITED STATES`** on the right; the US side starts lower.
- `T('monitor')`: icons drop onto Canada's pan: radarDome, satellite (these are Part 2's sensors).
- `T('operate')`: then ship and jet icons drop on.
- `T('information')`, `T('resources')`: Anton labels under Canada's pan, `INFORMATION` and `RESOURCES`.
- `T('position')`/`T('relationship')`: the beam rises to level (a stronger position), with a smooth settle and no
  bounce.
- SFX: pop2 per icon drop (low), a soft tick when level.

## F06: Back to the original question (46.25 → 59.48)
> "So, back to the original question. In my view, Canada can maintain a military presence, conduct patrols, and carry
> out defense missions in its Arctic. It has equipment and service and forces that know the region."

**Payoff: anchors #4 and #3 return.**
- `T('back')`: the **Intro's question card**, rebuilt with the same layout, fonts and colours as Intro
  `src/scenes/S11Question.tsx`: kicker *The question*, Playfair lines **Can Canada defend** / **the Arctic**, red marker
  **ON ITS OWN?**, with the polar anchor and the **dewolf** sticker at the bottom. Reveal it quickly (≤0.8 s) since the
  viewer already knows it.
- `T('presence')`: the card shrinks to the top-left and a `Checklist` builds on the right:
  **`MILITARY PRESENCE`** ✓ (`T('presence')`), **`PATROLS`** ✓ (`T('patrols')`), **`DEFENSE MISSIONS`** ✓ (`T('missions')`).
- `T('equipment')`/`T('forces')`: three small stickers (dewolf, cf18, rangers if it exists, else soldiers) slide in under
  the checklist.
- SFX: riser (low) into the card, marker_swipe per check.

## F07: It depends on the threat, and on NORAD (59.48 → 66.86)
> "But its ability to respond depends on the threat, and its air defense has relied on NORAD's binational structure
> for decades."

- `T('depends')`: polar map; three threat glyphs appear around the pole: a ship (sea), the bombers' tracks
  (anchor #2, air) and a submarine (under ice). Each gets a differently sized response ring from Canada, small or
  large.
- `T('norad')`: the NORAD red marker label returns (as in Part 1). The US and Canada are linked by the stitch;
  the US paints red again ("binational").
- `T('decades')`: a slim `Timeline` 1958 → 2026 under it. **`1958`** is NORAD's founding and supports "for decades".

## F08: My answer is no (66.86 → 73.86)
> "Now, in a prolonged war against a major power with no outside help? My answer is no."

The strongest beat of the episode. Hold back motion before it.
- `T('prolonged')`/`T('war')`: polar map. **Russia (major power) is red** and its strike arcs (Part 1) faintly return.
- `T('outside')`/`T('help')`: the US paint drains away and the NORAD stitch line breaks. Canada is alone in red.
- ~0.3 s of near-stillness after "help?" (the narrator pauses 71.70 → 71.88). Lower the SFX.
- `T('no')` (the word "no." near 73.3): a huge red **`NO`** stamp (Anton ~360 px, slight rotation) lands centre with the
  stamp SFX plus a low boom (vol 0.24).

## F09: Why, the four weights (73.86 → 89.47)
> "Based on the capabilities we've looked at, I don't see Canada having enough in place today to sustain the defense
> of that entire region on its own. The distances involved, equipment availability, and shortages in personnel and
> infrastructure all weigh heavily in that assessment."

- `T('capabilities')`: CA map of the whole Arctic region outlined in red chalk ("that entire region"). A `StatBar`
  **`IN PLACE TODAY`** fills only part-way against a target tick `NEEDED`. No numbers.
- `T('distances')`, `T('equipment')`, `T('personnel')`, `T('infrastructure')`: a `Balance` (or four weights) where four
  Anton weight blocks drop onto one pan, one per word: **`DISTANCES`**, **`EQUIPMENT`**, **`PERSONNEL`**,
  **`INFRASTRUCTURE`**. The pan sinks with each ("weigh heavily").
- SFX: a pop2 thud per weight (low), increasing slightly.

## F10: Years away (89.47 → 96.08)
> "Modernization projects could improve the situation, but several of them are still years away from entering
> service."

A `Timeline` **2026 → 2035** with **TODAY** at 2026 and the projects from Part 2 as marks (callbacks, dates only from the
narration):
**`OTH RADAR · DEC 2029`**, **`F-35 · 2029–30`** (band), **`SUBMARINES · 2034`**. At `T('years')`, a red bracket spans
TODAY to the marks, labelled **`YEARS AWAY`**.

## F11: Outro (96.08 → 105.00 end)
> "If you found this video helpful, give it a like and subscribe to the channel. Thanks for sticking with me to the end,
> and I'll see you in the next one."

Calm closing, with no fake UI, buttons or footers. The polar map (anchor #1) with Canada red, very slowly rotating
(r +6° over the scene) and pulling back, with the dewolf sticker drifting in the lower third. The grid and vignette
remain. In the last ~1.0 s the map and sticker ease to dim (opacity 0.25) so the film ends on the textured ground.
Optional, very subtle: the channel name **`NIO500`** in small Anton at centre for the last 2 s. Only if it looks
intentional.
