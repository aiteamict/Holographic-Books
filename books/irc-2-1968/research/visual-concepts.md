# Visualising IRC 2-1968 the way a highway engineer would

The current spreads show the *numbers*. Engineers understand a standard through the *artefacts* they produce and check
with it. Each spread below is rebuilt around one such artefact, one question the engineer is answering, and one thing
the reader does. "Overview first": the default camera shows the whole scene; close-ups only on ▶ Watch.

| # | Clause | The engineer's artefact | The question | What the reader does |
|---|---|---|---|---|
| 1 | cl. 2.1, Plate 1 | **Fabrication drawing on the sign-shop bench** | "Can any shop in India make the identical plate from these numbers?" | Drags a steel rule along the plate; the rule reads the band heights live. "Make it" shows the shop sequence: blank 450 × 600 sheet → corner radius → yellow coat → border mask → letter stencils → numerals. A "wrong plate" toggle (450 × 500) shows the proportions break. |
| 2 | Fig. 1, Plate 5 | **Sign-writer's layout board** | "Why not space the numerals evenly?" | Numeral stencil tiles the reader slides; between tiles a physical **spacer slug** of 47 / 38 / 13 mm snaps in, chosen from Plate 5's tables (lit cells). A split view shows the same number with *even* spacing on the left and *Plate 5* spacing on the right, viewed from 100 m: the even one looks uneven. |
| 3 | cl. 2.2, 6, 7, 3.3 | **Specification swatch board + night check** | "Will this sign be seen, day and night, against any background?" | IS 309 and IS 630 swatches beside the sign; a **day/night** toggle; at night the headlamp and the mirror ray (law of reflection) with the slight turn-away; a **background slider** (sky / trees / buildings) behind the post that shows why alternating black-and-white bands stay visible when either colour alone would vanish; enamelled vs painted as two plate samples. |
| 4 | cl. 3, Plate 2 | **Setting-out plan + sight-distance check** | "Will the driver read it in time to act?" | Plan with chainage and the 100–150 m window; a **speed picker** (50 / 65 / 80 km/h) turning distance into seconds; the long section with the driver's eye at 1.2 m, sign top at 2.25 m and the sight line; legibility distance for 200 mm numerals (rule of thumb, labelled as such); kerb / no-kerb cross-section; the "turned slightly away" angle on plan. The drive stays. |
| 5 | cl. 4, Plate 3 | **Junction-type picker → plate template** | "Which arrow tells the truth about this junction?" | Choose the junction (T, Y, cross, staggered) and which arm is the NH; the correct arrow assembles on the plate from the Plate 3 template (45 shaft, 90 × 100 head) and the car drives the move. A wrong-arrow toggle shows the car taking the wrong arm. |
| 6 | cl. 5, Plate 4 | **Signing plan with a schedule of signs** | "What goes on every post, and where?" | True-scale plan plus a **schedule table** (post no. · chainage · side · shields · plates), the way a signing scheme is delivered. Clicking a row highlights the post on the plan and shows its assembly large; the car drives the approach; a completeness check greys any approach that still lacks its pair. |
| 7 | all | **Site inspection** | "Does the installed sign comply?" | The surveyor walks up to an installed sign with defects planted (wrong band order, 60 mm from the kerb, 90 m from the junction, lemon yellow…). The reader ticks a **checklist** item by item; each tick cites the clause and the hologram points at the measurement. The quiz becomes an audit. |

## Rules carried over
One scale per scene · one focal artefact · overview camera by default · ≤ 6 tags, all anchored · captions top-centre ·
every number keeps its clause · anything that is a rule of thumb and not IRC 2 is labelled as such.

## Build order
6 (signing schedule) and 4 (sight-distance + speed) first — they are the most "engineer" and reuse the most existing
code; then 7 (inspection), 2 (spacer slugs), 3 (background slider), 1 (steel rule), 5 (junction picker).

## Learnability pass (5 November 2026, after the learner walkthrough)
Bugs fixed: spread 1's lesson page is now the inside of the cover; the back page (about + sources) is page 8; spreads 4
and 6 cameras no longer crop the left page; captions are scoped per spread so none leaks. Mechanism: `engine/guide.js`,
a three-step guided sequence per spread with a persistent card on the hologram, a one-tap reasoning check, hidden
controls until "Explore", and a step strip in the UI. Lessons split: spread 3 is colour only, the headlamp law (cl. 3.3)
is spread 4's third inset; spread 6 opens on the schedule with the plan hidden until step 2; spread 2 opens on NH 744;
the spread 4 drive runs at half real time (it does not pause at the legibility point: a deliberate simplification).

## Status (5 November 2026)
Done: 6 schedule · 4 setting-out plan + speed picker + driver's view · 7 site inspection · 2 spacer slugs + 100 m strip
+ even-spacing toggle · 3 colour schedule + backdrop + plate samples + night check · 1 steel rule + cursor + shop
sequence + wrong plate · 5 junction picker + wrong arrow.
Also done: spread 4 long section (third inset: junction at the right, sign at its chainage, driver's eye at 1.2 m, sight
line to the 2.25 m shield top with its angle, the 100–150 m window and the ≈ 90 m legibility tick; heights exaggerated and
labelled). Tour shots re-aimed where layouts moved (1, 2, 3, 5); note that shot `look` points are **world** coordinates
and the hologram root sits at world (13, 1.34, 0).
Also: the T-junction's closed arm carries a kerb (`props.kerb`) across its mouth; the procedural hero (`props.figure`) is
now a solid stylised surveyor (work blues, hi-vis band, white helmet, capsule limbs) instead of wire cylinders, and is
still replaced automatically by `public/models/surveyor.glb` when that file is supplied.
