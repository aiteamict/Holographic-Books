// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'Superelevation',
  subtitle: 'IRC : 38-1988 · chapter 3 of 8',
  credit: 'built from IRC : 38-1988',
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 3 Superelevation',
  cover: {
    title: ['Super-', 'elevation'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  3  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · section 5'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Tilting the road.',
    lede: 'On a curve the road is tilted inward, so the weight of the vehicle helps friction hold it against the outward push.',
    paras: [
      'Section 5 says why a curve is superelevated, how much, when the ordinary camber is enough, and how the tilt is built into the road, stage by stage, along the transition.',
      'Turn the pages in order. Each right-hand page is a live site model or cross-section you can drive, tilt and rebuild.',
    ],
    notes: ['Superelevation e and camber as decimals or per cent (0.07 = 7 per cent). Tilts in the models are drawn steeper than true so they can be seen.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Tilting the road.',
    lede: 'Chapter 3 of 8 in the IRC : 38 series: section 5 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Guidelines for Design of Horizontal Curves for Highways and Design Tables (First Revision), Indian Roads Congress, 1989. Section 5, Tables 4–6, equation (7), Figs. 10–13, Example 11.1 and Fig. 26.',
      '**Coverage.** cl. 5.1: spread 1 · cl. 5.2.1–5.2.3, eq. (7): spread 2 · Table 4, Fig. 10: spread 3 · cl. 5.3.1–5.3.3, Tables 5–6: spread 4 · cl. 5.4.1, Figs. 11, 13: spread 5 · cl. 5.4.2, Fig. 12: spread 6 · Example 11.1, Fig. 26: spread 7.',
      '**Misprints, checked on the page.** Table 6 prints 110 m for 25 km/h at 2 per cent camber; its own formula R = V²/225e gives 139 m. Example 11.1 states a radius of 260 m but works with 250 m (the result, e = 0.07, is the same).',
    ],
    notes: ['Table 4 values in spread 3 are computed by e = V²/225Rc, as Table 4’s own note says they were. Vehicles are drawn larger than the road. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'why', title: 'Why tilt the road', prompt: 'Change the speed. Compare the level road with the tilted one.',
    left: {
      kicker: 'Spread 1 · cl. 5.1', title: 'Why tilt the road',
      lede: 'The centrifugal force on a curve is resisted by superelevation and friction (cl. 5.1).',
      paras: [
        'On a laterally level road, **friction alone** must hold the vehicle; if it is not enough, the vehicle skids outward. So the surface is given an inward tilt, the **superelevation**: the component of the vehicle’s weight along the tilted surface then helps friction (cl. 5.1).',
        'Superelevation also **saves maintenance**: skidding and unequal wheel pressures from high sideways forces make pot-holes and need frequent attention to the surface (cl. 5.1).',
      ],
    },
    right: { kicker: 'cl. 5.1', title: 'Level and tilted, side by side' },
  },
  {
    id: 'amount', title: 'How much tilt', prompt: 'Pick a design method and drag the radius. Watch who needs friction.',
    left: {
      kicker: 'Spread 2 · cl. 5.2 · eq. (7)', title: 'How much tilt',
      lede: 'Two methods are in use: superelevation to counteract the centrifugal force fully, or to counteract a fixed per cent of it (cl. 5.2.1).',
      paras: [
        'Counteracting it fully would need more than 7 per cent on sharp curves, inconvenient to slow vehicles; with 7 per cent as the limit, sharp curves would use the maximum friction and flat ones none: not a balanced design (cl. 5.2.2).',
        'Counteracting only 32 per cent would leave flatter curves with too little; most vehicles travel below the design speed. So superelevation **fully counteracts the centrifugal force at three-fourths of the design speed**: **e = (0.75V)²/127R = V²/225R** (eq. 7, cl. 5.2.3).',
        'A National Highway curve designed for 80 km/h is superelevated to balance a vehicle at 60 km/h. Faster vehicles call on friction; slower ones are helped (cl. 5.2.3).',
      ],
    },
    right: { kicker: 'cl. 5.2.1–5.2.3 · eq. (7)', title: 'Balanced at ¾ of the design speed' },
  },
  {
    id: 'table4', title: 'Table 4', prompt: 'Pick a speed and terrain, then drag the radius along the chart.',
    left: {
      kicker: 'Spread 3 · Table 4 · Fig. 10', title: 'Superelevation for each curve',
      lede: 'Table 4 and Fig. 10 give e = V²/225R for every design speed and radius, cut off at the maximum allowed.',
      paras: [
        'The maximum is **0.07** in plain and rolling terrain and in snow-bound hills, and **0.10** in hills not bound by snow (cl. 4.3, Table 4).',
        'No superelevation is provided where the value is less than the normal camber of the pavement (Table 4, note ii); and for a given design speed the largest possible radius should be adopted (note iii).',
      ],
    },
    right: { kicker: 'Table 4 · Fig. 10', title: 'e against radius' },
  },
  {
    id: 'camber', title: 'When camber is enough', prompt: 'Pick a surface and a speed, then drag the radius past Table 6.',
    left: {
      kicker: 'Spread 4 · cl. 5.3 · Tables 5–6', title: 'When camber is enough',
      lede: 'Where eq. (7) gives less than the camber needed for drainage, the normal cambered profile may continue round the curve (cl. 5.3.1).',
      paras: [
        'Camber on straights depends on the surface (Table 5): **1.7–2.0 per cent** for high type bituminous or concrete, **2.0–2.5** thin bituminous, **2.5–3.0** water bound macadam or gravel, **3.0–4.0** earth; steeper where rainfall is heavy (cl. 5.3.2).',
        'Curves with radius greater than **R = V²/225e**, e being the camber, need less superelevation than the camber and need not be superelevated (Table 6, cl. 5.3.2).',
        'The outer half then slopes outward, a negative superelevation of at most 0.03. On a 1500 m curve with camber 0.03 at 100 km/h the centrifugal ratio is 0.052 and the friction needed only **0.082**, far below the safe value (cl. 5.3.3).',
      ],
    },
    right: { kicker: 'Tables 5–6 · cl. 5.3.3', title: 'Camber round the curve' },
  },
  {
    id: 'build', title: 'Building the tilt in', prompt: 'Drive through the run-off. Pick the line the road rotates about.',
    left: {
      kicker: 'Spread 5 · cl. 5.4.1 · Figs. 11, 13', title: 'Building the tilt in',
      lede: 'The cambered straight is changed into a superelevated curve in **two stages** (cl. 5.4.1).',
      paras: [
        'First the **outer half is raised until it is level**, then until it is in line with the inner half. The first stage is finished **before the tangent point**: negative superelevation, however slight, is objectionable on a curve. Raising the outer half should not produce a slope of more than **1 in 200** (cl. 5.4.1).',
        'In the second stage the surface is rotated either **about the centre line**, lowering the inner edge and raising the outer, the centre line level unchanged; or **about the inner edge**, raising the centre and the outer edge and the height of the embankment on the outer side (cl. 5.4.1, Fig. 11). Fig. 11 (f) and Fig. 13 also show rotation about the outer edge.',
        'The edges should rise against the centre line no faster than **1 in 150** in plain and rolling terrain and **1 in 60** in mountainous and steep terrain (Fig. 13).',
      ],
    },
    right: { kicker: 'Figs. 11, 13', title: 'Stage by stage' },
  },
  {
    id: 'where', title: 'Where it is reached', prompt: 'Drive along the transition. Compare the two cases.',
    left: {
      kicker: 'Spread 6 · cl. 5.4.2 · Fig. 12', title: 'Where full superelevation is reached',
      lede: 'With e = V²/225R, 7 per cent is reached where the radius falls to **0.06349 V²**, while the minimum radius is **0.0358 V²** (cl. 5.4.2).',
      paras: [
        'On a sharp curve the maximum could be reached partway along the transition, where R = 0.06349 V² (case i, point B of Fig. 12), or only at the end of the transition (case ii).',
        'At three-fourths of the design speed, case (i) needs no friction up to B and then up to 0.15 at C; case (ii) needs friction rising steadily from nothing at A to 0.15 at C. Case (i) gives no definite advantage and is complicated to set out, so the full superelevation is attained **at the end of the transition** (cl. 5.4.2).',
      ],
    },
    right: { kicker: 'cl. 5.4.2 · Fig. 12', title: 'Along the transition' },
  },
  {
    id: 'example', title: 'Example 11.1', prompt: 'Drive through the curve. The cross-section changes at each section A to G.',
    left: {
      kicker: 'Spread 7 · Example 11.1 · Fig. 26', title: 'Example 11.1: superelevation',
      lede: 'A Major District Road in very flat country, curve radius 250 m, embankment 0.3 m, bituminous surface, gradient 1 in 100 (Example 11.1).',
      paras: [
        'Design speed 80 km/h; minimum radius 230 m; camber 2 per cent. **e = V²/225R = 80²/(225 × 250) = 0.1137**, more than the 7 per cent allowed, so **e = 0.07**. Widening 0.6 m; transition **90 m**, the full superelevation reached at its end.',
        'Across 7.6 m (7 m plus 0.6 m widening) the outer edge rises **0.532 m** above the inner, **0.266 m** above the centre line; over 90 m that is a grade of **0.0029**. Rotating about the centre line, the inner edge drops 0.266 − 0.02 × 3.8 = **0.19 m**, safe on a 0.3 m embankment.',
      ],
      notes: ['The example’s data line prints the radius as 260 m; the working and Fig. 26 use 250 m.'],
    },
    right: { kicker: 'Example 11.1 · Fig. 26', title: 'Sections A to G' },
  },
];

export const QUIZ = [];
