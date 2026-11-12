// The words on the pages. Quoted from IRC : 38-1988 with the clause, definition (def.) or figure in brackets.
export const BOOK = {
  title: 'The Curve and its Parts',
  subtitle: 'IRC : 38-1988 · chapter 1 of 8',
  credit: 'built from IRC : 38-1988',
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 1 The Curve and its Parts',
  cover: {
    title: ['The Curve', 'and its Parts'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  1  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · first published 1970 · metric revision 1988'],
    // the series look: survey slate blue
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Where the road turns.',
    lede: 'A road changes direction because it must: around hills, rivers, monuments, places of worship, structures and the land that is available (cl. 1.2).',
    paras: [
      'IRC : 38 tells the engineer how to make that turn safe and pleasant: a **circular curve**, eased in and out by **transition curves**, with ready-reckoner tables so the field engineer is spared the "tedious and laborious calculation" (cl. 1.2).',
      'This chapter names every part of a horizontal curve, the way the standard does in section 2 and Figs. 2 and 3. Later chapters use these words for speed, superelevation, widening, transitions and setting out.',
      'Turn the pages in order. Each right-hand page projects a curve you can drag and measure.',
    ],
    notes: ['Lengths in metres, angles in degrees. Every value on the holograms is computed from the standard’s geometry and checked against its printed Table 10 and Examples 11.2–11.4.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Where the road turns.',
    lede: 'Chapter 1 of 8 in the IRC : 38 series: sections 1 and 2 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Guidelines for Design of Horizontal Curves for Highways and Design Tables (First Revision), Indian Roads Congress, New Delhi, published 1989. Section 1 Introduction, section 2 Definitions and Notations, Figs. 1–3, Example 11.3.',
      'First brought out in 1970 in FPS units as "Design Tables for Horizontal Curves for Highways". The metric revision was taken up by **J. B. Mathur** in August 1985, approved by the Specifications and Standards Committee and the Executive Committee on **28 August 1986** and by the Council at Srinagar on **19 September 1986** (Foreword).',
      'Example 11.2 prints the long tangent as 95.48 m; its own working, 0.66773 × 140, gives **93.48 m**, which this book uses.',
    ],
    notes: ['The transition is drawn as the spiral (clothoid) of cl. 7.5. Terrain, buildings and vehicles in the holograms are illustrative; cars and the survey party are drawn two to four times larger than the road so they can be seen, and the crest of spread 2 is three times higher than true. Built with three.js. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'why', title: 'Why the road must turn', prompt: 'Drag the hill or the temple onto the road. It finds its way round.',
    left: {
      kicker: 'Spread 1 · Introduction', title: 'Why the road must turn',
      lede: 'In a road alignment, changes in direction are often necessary (cl. 1.2).',
      paras: [
        'They are imposed by **topography**, by the environmental and ecological qualities of an area, by **monuments, places of worship**, sites of structures, and by the land that is available (cl. 1.2).',
        'For convenient, safe and pleasant travel the change of direction is made with **horizontal curves and transition curves** (cl. 1.2).',
        'The aim today is **gentle slopes and mild curves** that fit the natural terrain and are more aesthetic: the highway as "an aesthetic whole blending with the landscape" (cl. 1.1).',
      ],
      notes: ['The road is felt as well as seen: the driver has a kinesthetic sense of tilting, turning, dropping and climbing (cl. 1.1).'],
    },
    right: { kicker: 'cl. 1.1, 1.2', title: 'Around the obstacle' },
  },
  {
    id: 'coord', title: 'Plan and profile together', prompt: 'Slide the crest along the road and watch the driver’s view.',
    left: {
      kicker: 'Spread 2 · Coordination', title: 'Plan and profile together',
      lede: 'Coordinate the horizontal and the vertical alignment (cl. 1.3).',
      paras: [
        '**Sharp horizontal curves should be avoided at or near the apex of pronounced summit or sag curves**, for safety (cl. 1.3 (1)).',
        'Vertical curvature over horizontal curvature gives a pleasing effect: the two should **coincide** as far as possible, with lengths more or less equal. If not, the horizontal curve should be somewhat **longer** (cl. 1.3 (2)).',
        'Curvature should balance the gradients. Straight alignment or flat curves bought with steep or long grades, or excessive curvature on flat grades, are not balanced designs (cl. 1.3 (3)).',
      ],
      notes: ['Fig. 1 shows the cases: a horizontal curve hidden behind a summit, a vertical curve that makes the bend look like a sharp kink, and the good forms where the vertices coincide.'],
    },
    right: { kicker: 'cl. 1.3 · Fig. 1', title: 'The driver’s view' },
  },
  {
    id: 'circle', title: 'The circular curve', prompt: 'Drag the deviation angle Δ and the radius. Every distance follows.',
    left: {
      kicker: 'Spread 3 · Definitions', title: 'The circular curve',
      lede: 'Two straights meet at the **apex**, P.I. (def. 1). The curve joining them turns the road through the **total deviation angle Δ** (def. 11).',
      paras: [
        'The **tangent point** T.P. is where the straight ends and curvature begins (def. 10). The **tangent distance** Ts is the length of straight from the apex to the tangent point (def. 9).',
        'The **apex distance** Es is the shortest distance from the apex to the curve (def. 2). The **intersection angle** between the tangents is **180° − Δ** (def. 4).',
        'For a simple circular curve of radius R: **Ts = R tan Δ/2**, **Es = R (sec Δ/2 − 1)** and the curve is **R·Δ** long (Δ in radians).',
      ],
      notes: ['Δ is also the central angle of the whole curve (def. 11). Ts and Es fix the curve on the ground: one is measured along the straight, the other towards the centre.'],
    },
    right: { kicker: 'def. 1–4, 9–11', title: 'Apex, tangent and apex distance' },
  },
  {
    id: 'transition', title: 'Adding transitions', prompt: 'Switch the transitions on, then drag their length Ls.',
    left: {
      kicker: 'Spread 4 · Fig. 2', title: 'Adding transitions',
      lede: 'A **transition curve** connects the straight with the circular curve (def. 12). To make room for it, the circle moves inward.',
      paras: [
        'That move is the **shift S**: the displacement of the circular curve from the straight (def. 7). For a gentle spiral S ≈ **Ls² / 24 R**.',
        '**C.T.** is where the transition changes to the circular arc; **T.C.** is where it leaves it (def. 14). The arc between them, **Lc**, turns through **Δc = Δ − 2θs** (def. 19, 40).',
        '**θs** is the tangent deflection at the end of the transition: the angle between the straight and the tangent at C.T. (def. 39). For the spiral **θs = Ls / 2R** radians.',
      ],
      notes: ['P.C. is the point on the circular curve produced, nearest the straight (def. 23); K is the distance along the straight from T.P. to P.C. (def. 17). The tangent distance grows to Ts = (R + S) tan Δ/2 + K.'],
    },
    right: { kicker: 'def. 7, 12, 14, 39, 40 · Fig. 2', title: 'Circular curve with transition' },
  },
  {
    id: 'throughout', title: 'Transitional throughout', prompt: 'Lengthen the transitions until the circle is used up.',
    left: {
      kicker: 'Spread 5 · Fig. 3', title: 'Transitional throughout',
      lede: 'Lengthen the transitions far enough and the circular arc disappears.',
      paras: [
        'The whole deviation is then made by **two transition curves with no circular arc between them** (def. 13, Fig. 3).',
        'They meet at **C.C.T.**, the mid point of the curve transitional throughout (def. 13). Each spiral turns through exactly half the deviation: **θs = Δ/2**.',
        'Such a curve has no length at constant radius: the steering wheel never rests. The design tables give it separately (Table 13).',
      ],
      notes: ['With Δc = 0 the arc length Lc is zero and the curve is 2 Ls long.'],
    },
    right: { kicker: 'def. 13 · Fig. 3', title: 'Two spirals, one point' },
  },
  {
    id: 'setout', title: 'Words for setting out', prompt: 'Drag “any point” along the transition. Read its coordinates and angles.',
    left: {
      kicker: 'Spread 6 · Notation', title: 'Words for setting out',
      lede: 'A surveyor at the tangent point locates every peg on the transition with a few named quantities.',
      paras: [
        '**X, Y** are the coordinates of any point, with T.P. as origin, X along the straight and Y at right angles (def. 30). **Xc, Yc** are those of C.T. (def. 31).',
        'The **polar ray ρ** runs from T.P. to the point (def. 36); its angle from the straight is the **polar deflection α** (def. 32). **θ** is the angle between the tangent at the point and the straight (def. 38), and **β** is the angle between the polar ray and that tangent (def. 34): **β = θ − α**.',
        'The **long chord** joins T.P. to C.T. (def. 5). The **long tangent** L.T. runs along the straight from T.P. to where the tangent at C.T. meets it; the **short tangent** S.T. runs from C.T. back to that point (def. 6, 8).',
      ],
      notes: ['Close to T.P., α is very nearly θ/3: the polar ray turns a third as fast as the tangent.'],
    },
    right: { kicker: 'def. 5, 6, 8, 30–38', title: 'Any point on the transition' },
  },
  {
    id: 'example', title: 'Fit the curve', prompt: 'Name the points, then fit the curve between the rock and the buildings.',
    left: {
      kicker: 'Spread 7 · Example 11.3', title: 'Fit the curve',
      lede: 'Design speed 40 km/h, plain country, deviation angle **56°**. High rocky ground on one side and buildings on the other limit the **apex distance to between 20 m and 23.5 m** (Example 11.3, Fig. 27).',
      paras: [
        'Table 10 offers several radius and transition pairs that fit. "Since it is better to have the largest possible radius", the book chooses **Rc = 170 m with Ls = 55 m** (Example 11.3).',
        'That gives **Ts = 118.260 m** and **Es = 23.376 m**, with θs = 9.269° (9° 16′ 8.8″), shift 0.741 m, L.T. 36.718 m and S.T. 18.381 m (Example 11.3).',
      ],
      notes: ['Try a smaller radius: the curve swings closer to the apex and Es drops toward the rock. Try a larger one: Es grows into the buildings.'],
    },
    right: { kicker: 'Example 11.3 · Fig. 27', title: 'Between the rock and the buildings' },
  },
  {
    id: 'examples', title: 'Worked examples', prompt: 'Pick an example, then press Next step to follow the book’s working.',
    left: {
      kicker: 'Spread 8 · Section 11', title: 'Worked examples',
      lede: 'Section 11 works the design through with the tables. These are the examples built on the parts of the curve.',
      paras: [
        '**Example 11.2**: a transition curve for a National Highway, from the design speed to every part: radius, Ls, θs, shift, Ts, Es, L.T. and S.T.',
        '**Example 11.3**: the apex distance controls the design; the largest radius that fits is chosen.',
        '**Example 11.4**: the same site with a deviation of 55° 42′, found by interpolating Table 10 between 55° and 56°.',
        '**Example 11.5**: the apex distance must equal 21.75 m exactly; a family of radius and transition pairs satisfies it.',
        'Each answer the book prints is set beside the value computed from the geometry of the spiral and the circle.',
      ],
      notes: ['Two misprints, both confirmed by the book’s own arithmetic and the geometry: Example 11.2 prints L.T. 95.48 m for 93.48 m, and Example 11.4 prints Ts 107.689 m for 117.689 m.'],
    },
    right: { kicker: 'Examples 11.2–11.5', title: 'Book and geometry, side by side' },
  },
];

export const QUIZ = [];
