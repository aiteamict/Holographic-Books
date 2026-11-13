// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'Compound, Reverse and Hair-pin',
  subtitle: 'IRC : 38-1988 · chapter 7 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 7 Compound, Reverse and Hair-pin',
  cover: {
    title: ['Compound,', 'Reverse and', 'Hair-pin'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  7  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · sections 8–10'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Curves that meet curves.',
    lede: 'Where one curve runs into another, of a different radius, of the opposite hand, or doubling back on a hillside, the transition between them matters most.',
    paras: [
      'Section 8 joins two curves of different radius with a compound transition and shows how to set it out; section 9 adds transitions to reverse curves; section 10 designs hair-pin bends.',
      'Each right-hand page is a site model. The cards set what the book prints beside the exact geometry, worked from the curvature of the road.',
    ],
    notes: ['Lengths in metres, angles in degrees. Some offsets are drawn several times true so they can be seen; each card says how much.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Curves that meet curves.',
    lede: 'Chapter 7 of 8 in the IRC : 38 series: sections 8 to 10 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Indian Roads Congress, 1989. Sections 8–10, Figs. 25, 50–54, Examples 11.33–11.40.',
      '**Coverage.** Spread 1: cl. 8.1–8.2 · 2–5: cl. 8.3–8.6, Ex. 11.33–11.37 · 6: cl. 9.1, Ex. 11.38–11.39 · 7: cl. 10.1–10.7, Ex. 11.40 · 8: Ex. 11.33–11.40 worked line by line.',
      '**Misprints, checked on the page** (printed → right). cl. 8.2 “C = 250 m =”. 11.33 Pa 0.03156 → 0.3157, carried into AB, AI, BI, T1 33.252 → 31.49 and T2 −21.855 → 23.63. 11.34 offsets on the wrong Pa; a 60 m column. 11.35 point 2: 489, 0.0210056, 1.071487 → 484, 0.210056, 1.260536. 11.37 “3.3/55” → 33/55. 11.38 FC Es 9.874 → 9.094; Fig. 52 62.820, 73.219 → 62.825, 73.319. 11.39 0.27227 → 0.272727; cos Δ2 0.9667612 → 0.970267; 0°26′18″ → 0°26′28″; O1O2 tan Δ2 for the common tangent (sin): straight 25.448 → 19.05 m. 11.40 coefficient 0.9287 → 0.9207; 24.312 → 24.28; Fig. 54 arc 11.32 → 13.47 m.',
    ],
    notes: ['Method, not misprint: 11.37 lets the radius vary with length (384 m at point 6; the spiral gives 316 m); 11.38 takes only K off the straight (24.545 m left, not 25.062). IRC : 73 and other codes revised since 1988 also set some of these values. Not a substitute for the standard.'],
  },
};

export const LESSONS = [null,
  {
    id: 'between', title: 'Between two curves', prompt: 'Drive from the 600 m curve into the 250 m one, with and without a transition.',
    left: {
      kicker: 'Spread 1 · cl. 8.1–8.2', title: 'Transitions between curves',
      lede: 'Where the tangents can be moved, a transition between curves of different radii gives a gradual change of motion and of superelevation; the sharper curve lies inside the flatter (cl. 8.1).',
      paras: [
        'Its length follows from eq. (16) for the difference of curvatures: **Ls = (0.0215 V³ / C)(1/R2 − 1/R1) = 0.0215 V³ / (C Ra)**, and the edges should change no faster than 1 in 150: at least 150 times the change in edge height (cl. 8.1).',
        'Curves whose radii differ by **more than 50 per cent** of the smaller need a transition **at least 30 m** long. Below 50 per cent, if the computed length is under 30 m, the transition may be left out and the superelevation changed on the flatter curve (cl. 8.1).',
        'Example: 600 m and 250 m at 80 km/h: C = 0.5161, 1/Ra = 0.00233, Ls = 49.69 m, say 50 m; the edge check, 150 × 0.08 = 12 m, is less (cl. 8.2).',
      ],
    },
    right: { kicker: 'cl. 8.1–8.2', title: 'From 600 m to 250 m' },
  },
  {
    id: 'geometry', title: 'The compound transition', prompt: 'Look at the two circles produced past each other, and the spiral between.',
    left: {
      kicker: 'Spread 2 · cl. 8.3–8.4 · Fig. 50 · Example 11.33', title: 'The compound transition',
      lede: 'A transition between two curves behaves like one from a tangent to a curve whose degree is the difference of the two degrees (cl. 8.4).',
      paras: [
        'Its “equivalent” spiral angle is **θa = 28.65 La (1/R2 − 1/R1)**, and the common radius bisects it: Δ1 = 28.65 La / R1, Δ2 = 28.65 La / R2. θa in Table 12 gives **Pa**, the offset between the two circles produced at the common radius (cl. 8.3–8.4).',
        'The tangents at C.S.1 and C.S.2 meet at I: AB = R2 exsec Δ2 − R1 exsec Δ1 − Pa; AI = AB cos Δ2 / sin (Δ1 + Δ2); BI = AB cos Δ1 / sin (Δ1 + Δ2); **T1 = R1 tan Δ1 + AI, T2 = R2 tan Δ2 − BI** (cl. 8.4).',
        'Example 11.33: R1 600 m, R2 240 m, La 55 m: θa = 3.939°. The book’s Pa slips by a factor of ten; the card carries the right one through.',
      ],
    },
    right: { kicker: 'Example 11.33 · Fig. 50', title: 'Pa, T1 and T2' },
  },
  {
    id: 'offsets', title: 'Offsets from the circles', prompt: 'Press Set out. Each peg is offset from the nearer circle.',
    left: {
      kicker: 'Spread 3 · cl. 8.6 method 1 · Example 11.34', title: 'Offsets from the circles',
      lede: 'With both circular curves located first, the compound transition is set out by offsets from them (cl. 8.6, method 1).',
      paras: [
        'At the middle of the spiral the offset is **Pa / 2**; elsewhere **Pa/2 × (distance from the nearer C.S. / half the length)³**, measured outward from the sharper curve and inward from the flatter one (cl. 8.6).',
        'Example 11.34 tabulates offsets at 10 m and 20 m from each end; built on Example 11.33’s Pa, they are ten times too small.',
      ],
    },
    right: { kicker: 'Example 11.34', title: 'In from 600 m, out from 240 m' },
  },
  {
    id: 'deflect', title: 'Deflections from C.S.1', prompt: 'Press Set out. Each angle is a circular part plus a spiral part.',
    left: {
      kicker: 'Spread 4 · cl. 8.6 methods 2–3 · Examples 11.35–11.36', title: 'Deflections from C.S.1',
      lede: 'From the instrument at C.S.1, each deflection is the circular-curve deflection for the radius there, R1, plus the spiral deflection of the equivalent angle, added towards the sharper curve (cl. 8.6, method 2).',
      paras: [
        'Method 2: the spiral term is L² × θa / 3La² (Example 11.35, five 11 m chords). Method 3: the ten-chord spiral uses the first column of Table 14, i²/300 × θa, wherever the instrument stands (Example 11.36, ten 5.5 m chords).',
        'The circular part for a chord C from a set-up on radius R is sin⁻¹ (C / 2R).',
      ],
    },
    right: { kicker: 'Examples 11.35–11.36', title: 'Circle plus spiral' },
  },
  {
    id: 'station', title: 'Moving to point 6', prompt: 'Press Set out. From point 6, compare the book with the spiral.',
    left: {
      kicker: 'Spread 5 · cl. 8.6 · Example 11.37', title: 'Moving to point 6',
      lede: 'When the far end cannot be seen from C.S.1 the instrument moves along the spiral, and the circular part then uses the radius at the new set-up (cl. 8.6).',
      paras: [
        'The book writes the radius at a point as varying directly with the length: R = R1 + (L / La)(R2 − R1). At point 6 that is 600 − (33/55)(600 − 240) = **384 m** (Example 11.37).',
        'On a spiral it is the curvature, 1/R, that varies with length (L R = constant, cl. 7.5.2): at point 6, **R = 316 m**, and the forward deflections are about a fifth larger than the book’s.',
      ],
    },
    right: { kicker: 'Example 11.37', title: 'Which radius at point 6?' },
  },
  {
    id: 'reverse', title: 'Reverse curves', prompt: 'Compare the existing reverse curve with transitions added two ways.',
    left: {
      kicker: 'Spread 6 · cl. 9.1 · Figs. 51–53 · Examples 11.38–11.39', title: 'Reverse curves',
      lede: 'Transitions are very important when two curves of opposite direction are close together (cl. 9.1).',
      paras: [
        '**Case I:** the circular curves can move, the tangents are fixed (Example 11.38). Each curve takes its own spirals, 45 m on 150 m and 55 m on 125 m (Table 9, 50 km/h, plain), and the straight between them shrinks.',
        '**Case II:** the circular curves are fixed, the tangents can move (Example 11.39). The middle tangent swings to touch circles enlarged by the shifts, about the same centres.',
      ],
    },
    right: { kicker: 'Examples 11.38–11.39 · Figs. 51–53', title: 'Move the curves, or the tangent' },
  },
  {
    id: 'hairpin', title: 'Hair-pin bends', prompt: 'Look at the three concentric lines, then steepen the grades to see the climb.',
    left: {
      kicker: 'Spread 7 · section 10 · Fig. 54 · Example 11.40', title: 'Hair-pin bends',
      lede: 'A hair-pin bend is a circular curve with a transition at each end, or compound circular curves (cl. 10.1).',
      paras: [
        'Normal criteria: design speed at least **20 km/h**; roadway at the apex 11.5 m (NH and SH, double lane), 9.0 m (single lane), 7.5 m (MDR and ODR), 6.5 m (village roads); inner radius at least **14 m**; transition at least **15 m**; gradient at most **1 in 40** and at least 1 in 200; superelevation **1 in 10** (cl. 10.2).',
        'The edges are concentric with the centre line (cl. 10.3); successive bends need **at least 60 m** between them (cl. 10.4). Widening later is difficult and costly, so plan for it, and surface the full width at the bend (cl. 10.5–10.6).',
        'Example 11.40: Δ 165°, 25 km/h. The inner edge is fully transitional on 20 m (Ls 57.587 m); centre line 23.75 m (Ls 54.921 m) and outer edge 27.5 m (Ls 49.964 m), each with its own spiral.',
      ],
    },
    right: { kicker: 'Example 11.40 · Fig. 54', title: 'Doubling back on a hillside' },
  },
  {
    id: 'examples', title: 'Worked examples', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 8 · Examples 11.33–11.40', title: 'The working, line by line',
      lede: 'Each example as the book works it, one line at a time, on the alignment it describes.',
      paras: [
        '**11.33–11.37:** the compound transition between 600 m and 240 m: Pa, T1 and T2, offsets from the circles, deflections for five and ten chords, and the move to point 6.',
        '**11.38–11.39:** the reverse curve with the curves moved, then with the tangent moved. **11.40:** the three concentric lines of the hair-pin.',
        'The card sets each printed result beside the exact geometry. A red result is a slip, and the line that causes it says why.',
      ],
    },
    right: { kicker: 'Examples 11.33–11.40', title: 'Follow the book' },
  },
];

export const QUIZ = [];
