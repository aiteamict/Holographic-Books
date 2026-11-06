# The Route Marker · IRC : 2-1968 as a 3D holographic book

A seven-spread interactive book built from *IRC : 2-1968, Route Marker Signs for National Highways (First Revision)*.
Every number on the pages and in the holograms is quoted from the standard with its clause or plate.

Scroll or use ←/→ to turn pages; drag the holograms and the amber **handles** on the page; the chips bottom-right are
the experiments on each spread; **Again** resets a spread; **▶ Watch** replays the spread's camera tour (it plays once
on the first visit; any input or Esc stops it). `#spread-N` deep-links. On phones the page text opens as a bottom
sheet ("Read the page"); every drag/tap-only interaction also exists as a hidden button for keyboard and screen-reader
users; `prefers-reduced-motion` disables tours and the page curl.

**Quality tiers.** After Enter the cover is measured for about a second and the book locks into high / medium / low
(pixel ratio, N8AO occlusion, shadow-map size, thick `Line2` strokes vs 1 px lines, depth of field on the cover,
liquid-glass UI). Force one with `?tier=high|medium|low`; `?fx=noao,nodof,noglass` disables passes for debugging.
N8AO and depth-of-field share the composer's depth texture and never run in the same frame.

**The hero.** A surveyor with a levelling staff appears on the cover and spreads 1, 3, 4 and 7. He is procedural
until `public/irc-2-1968/models/surveyor.glb` exists (see `public/irc-2-1968/models/README.md` for the Tripo/Meshy prompt and the Blender
export steps); the loader normalises any model to 1.7 m with its feet at the origin.

**Sound.** Procedural Web Audio cues (page turn, riffle, handle tick, tour ping, hologram pop), no files; the speaker
button top-right and "Enter without sound" mute it, remembered in `localStorage`.

## The spreads

| # | Spread | Source | What the reader does |
|---|---|---|---|
| 1 | Drawing the shield | cl. 2.1, Plate 1 | Replays the construction; hovers the 75/100/75/200/126 bands; shows the R 318 / R 132 / R 120 radii |
| 2 | Letters and numbers | Fig. 1, Plate 5 | Types a route number; sees the Table 1 code and Table 2 millimetres for every numeral pair |
| 3 | Paint it right | cl. 2.2, 3.3, 6, 7 | Spins the sign (IS 309 face, IS 630 back, banded post); headlamp glare vs turn angle; two deliberate mistakes |
| 4 | Where it stands | cl. 3, Plate 2 | Drags the marker along the approach (100–150 m, left side) and the confirmatory marker (15–30 m); kerb toggle |
| 5 | Which way now? | cl. 4, Plate 3 | Picks the junction move; the matching definition-plate arrow drops under the shield |
| 6 | Two routes, one post | cl. 5, Plate 4 | Taps approaches and exits of the NH 6 × NH 7 crossroads and the NH 26 fork to see each assembly |
| 7 | The finished sign | all | Four quiz cards with the clause behind each answer |

## Layout

```
research/irc2-1968.md     everything extracted from the scan, clause by clause (the source of truth)
sign/spec.js              the numbers, with refs            sign/face.js       paints the face and arrows (canvas, mm)
sign/geometry.js          shield outline, letters N/H       sign/mesh.js       the sign as a 3D object (cm)
../../engine/            stage (lights, post chain), book (leaves, curling page turns), page (typesetting), holo (Line2 strokes, glass,
                          labels, handles), liquidglass (UI pass),
                          quality (tiers), sound (cues), ui (DOM layer, mirror buttons, bottom sheet)
content/lessons.js        page text and quiz                 spreads/NN-*.js one module per spread
props.js, hero.js         car, figure, kerb, road, T-iron; the surveyor + glb loader
main.js                   cover art + runBook(); the runtime itself is ../../engine/run.js
```

A spread is `{ cam?, build(ctx) → { group, targets, actions, press/drag/release/tap/hover/key, update, reset, debug } }`.
To add a concept, add a file to `spreads/`, its text to `lessons.js`, and list it in `spreads/index.js`.

## Notes on fidelity

- Clause 3.3 prints "60 mm" from the kerb; Plate 2 says 60 cm. The book follows the plate and says so on the page.
- IS colour numbers 309 and 630 are shown as approximate hexes; the standard specifies numbers, not screen shades.
- Numerals are a bold grotesque set to the Plate 5 height and spacing, not the plate's constructed glyphs. The scan
  cuts off the numeral 1 and the left edge of 2 and 7 on Plate 5.
- The shield's lower curve is drawn to match Plate 1 visually; the construction radii are labelled, not reproduced
  as tangent arcs.

`window.__book` exposes `goTo`, the `Book`, the built spreads (each with a `debug` getter) and the camera, so the
whole thing can be driven and asserted from DevTools.

