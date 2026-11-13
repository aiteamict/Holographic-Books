// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'Setting Out in the Field',
  subtitle: 'IRC : 38-1988 · chapter 6 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 6 Setting Out in the Field',
  cover: {
    title: ['Setting Out', 'in the Field'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  6  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · sections 7.8–7.10'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Pegs in the ground.',
    lede: 'A designed curve becomes a road only when its centre line is pegged out on the site, point by point.',
    paras: [
      'Sections 7.8 to 7.10 give four ways of setting out a transition (offsets from the tangent, offsets to quarter points, offsets from the tangent and the circle, and polar deflections), how to use the tables for them, how to fit a curve into a tight place, and how to add transitions to old curves.',
      'Each right-hand page is a site before the road is built: a survey crew pegs the centre line while you watch, and the field book fills in.',
    ],
    notes: ['Distances in metres, angles in degrees, minutes and seconds. The ten-chord spiral of the examples: pegs at every tenth of the transition.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Pegs in the ground.',
    lede: 'Chapter 6 of 8 in the IRC : 38 series: sections 7.8 to 7.10 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Indian Roads Congress, 1989. Sections 7.8–7.10, Tables 11, 12, 14, Figs. 21–24, 30–42, Examples 11.17–11.28.',
      '**Coverage.** Spreads 1–5: cl. 7.8–7.9, Ex. 11.17–11.24 · 6: cl. 7.10.1, Ex. 11.25 · 7: cl. 7.10.2–7.10.3, Figs. 21–24, Ex. 11.26–11.28 · 8: worked examples.',
      '**Misprints, checked on the page** (printed → right). 11.18 chord 27.59 → 27.47 m. 11.19 Table 11.5 point 8: 0.0469, 2.1963 → 0.0499, 2.330; point 9: 3.236 → 3.326. 11.20 ¼-point X 19.536 → 14.536. 11.22 Fig. 35 BA8 3°51′ → 2°51′. 11.23 points 5, 3, 2 (4°5′, 6°14′49″, 6°9′ → 4°50′, 6°14′11″, 6°49′); T.P. uses θs 11.6° for 11.62°. 11.24 point 7: 0.0663 → 0.0633; Table 14 col. 9: 0.0533, 0.0367 → 0.0633, 0.0567. cl. 7.10.2: 7.367 → 1.567 m. 11.25: 18.626 → 78.626; 83.870 → 83.876; Ls 100 → 80 m; 92.9692 → 92.9638. 11.27 Fig. 41: 27.746° → 24.746°. 11.28: “+ 3.93”, 23.395 → 23.348.',
    ],
    notes: ['Computed values come from the exact spiral. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'tangent', title: 'Offsets from the tangent', prompt: 'Press Set out. The crew measures along the tangent and offsets each peg.',
    left: {
      kicker: 'Spread 1 · cl. 7.8.1–7.8.2, 7.9.1 (a) · Example 11.17', title: 'Offsets from the tangent',
      lede: 'With Ts, Es, Ls, Rc and θs known, T.P. is fixed by measuring Ts back from the apex. The transition is then divided into 10 or 20 chords, each taken equal to its arc (cl. 7.8.1).',
      paras: [
        'From the main tangent, distances **X1 … X10** are measured along it and offsets **Y1 … Y10** set out square to it, from Table 11. No angle instrument is needed, so staff unfamiliar with theodolites can do it; offsets over 15 m need care to keep them square (cl. 7.8.2, 7.9.1).',
        '**Check:** the long chord L.C. from C.T. back to T.P.; and the triangle L.T., S.T., L.C. must close. S.T. is the base for the circular curve (cl. 7.8.2, 7.9.1).',
        'Example 11.17: Rc 170 m, Ls 55 m: X10 = 54.856 m, Y10 = 2.96 m, L.C. 54.936 m, L.T. 36.717 m, S.T. 18.379 m.',
      ],
    },
    right: { kicker: 'Example 11.17 · Fig. 30', title: 'Measure along, offset across' },
  },
  {
    id: 'parallel', title: 'When the tangent is blocked', prompt: 'Press Set out. Beyond point 5 the crew works from a line through P.C.',
    left: {
      kicker: 'Spread 2 · cl. 7.8.4, 7.9.1 (b) · Example 11.18', title: 'When the tangent is blocked',
      lede: 'Where offsets beyond the first five points cannot be taken from the main tangent, P.C. is fixed by K along the tangent and the shift s square to it (cl. 7.9.1 b).',
      paras: [
        'A line through P.C. parallel to the main tangent becomes the new base: X6 … X10 are reduced by K and Y6 … Y10 by s, minus towards the main tangent, plus away from it (cl. 7.9.1 b).',
        'Or the circular curve is laid from P.C. to C.T. first and the spiral set out from it: offsets from the circle, measured along it from C.T., equal the offsets from the tangent (cl. 7.5.5, 7.8.4). The offsets are smaller, but the method is too involved for lower field staff (cl. 7.8.4).',
        'Example 11.18: K = 27.476 m, s = 0.741 m; X′6 = 5.513 m, Y′6 = −0.101 m … X′10 = 27.38 m, Y′10 = 2.219 m (Table 11.4).',
      ],
    },
    right: { kicker: 'Example 11.18 · Fig. 31', title: 'A new base through P.C.' },
  },
  {
    id: 'quarter', title: 'Quarter points', prompt: 'Press Set out. Three pegs at the quarter points, then compare with the true spiral.',
    left: {
      kicker: 'Spread 3 · cl. 7.8.3, 7.9.2–7.9.3 · Examples 11.19, 11.20', title: 'Quarter points',
      lede: 'Offsets to quarter points need fewer pegs, for work where accuracy is not essential, such as embankments (cl. 7.8.3).',
      paras: [
        'Offsets grow nearly as the cube of the distance: **Y = (X / Xc)³ × Yc**, so at the ¼, ½ and ¾ points they are **Yc/64, Yc/8 and 27 Yc/64** (cl. 7.9.3).',
        'A length or radius not in Table 11 needs its own calculation: θs = 28.65 Ls / Rc, then X and Y from the Table 12 coefficients for each chord point (cl. 7.9.2, Example 11.19). For Ls 58.468 m on Rc 125 m, θs = 13.4°, Xc = 58.146 m, Yc = 4.543 m (Example 11.20).',
      ],
    },
    right: { kicker: 'Examples 11.19, 11.20 · Figs. 32–33', title: 'Three pegs for the earthwork' },
  },
  {
    id: 'polar', title: 'Polar deflections', prompt: 'Press Set out. The theodolite turns each angle; the chain swings each chord onto its line.',
    left: {
      kicker: 'Spread 4 · cl. 7.8.5–7.8.7, 7.9.4–7.9.6 · Examples 11.21, 11.22', title: 'Polar deflections',
      lede: 'Polar deflection suits all conditions and is accurate (cl. 7.8.5).',
      paras: [
        'The theodolite at T.P. sights the apex at zero and turns **α1**; one chord Ls/10 is measured to the line for point 1; from point 1 the next chord is swung onto the line **α2**, and so on (cl. 7.9.6). Table 11 gives the deflections for standard curves (cl. 7.8.6, 7.9.5).',
        'For other lengths and radii, θs = 28.65 Ls / Rc and the deflection to point i is θs × the Table 14 coefficient, **i² / 300** from T.P., with a correction only above 20° (cl. 7.8.7, 7.9.4).',
        '**Check:** set up on the main tangent at L.T., sight the apex at zero and turn θs: the line must pass through C.T. at distance S.T. (cl. 7.9.6).',
      ],
    },
    right: { kicker: 'Examples 11.21, 11.22 · Figs. 34–35', title: 'Turn the angle, swing the chord' },
  },
  {
    id: 'station', title: 'Moving the instrument', prompt: 'Set out from C.T. backwards, or move the theodolite to point 6 and carry on.',
    left: {
      kicker: 'Spread 5 · cl. 7.5.5, 7.9.4 · Examples 11.23, 11.24', title: 'Moving the instrument',
      lede: 'The spiral leaves its osculating circle at any point as it leaves the tangent at its start, so the instrument can be moved along it (cl. 7.5.5).',
      paras: [
        'From an intermediate point, Table 14 gives the deflections forward and backward: from point 4, forward to 5, 6, 7 … take 0.0433, 0.0933 …; backward to 3, 2, 1, 0 take 0.0367, 0.0667 …, each times θs (cl. 7.9.4).',
        'Example 11.23 sets the spiral of Example 11.5 out from C.T.: the instrument turns 0.6667 θs to sight T.P., which gives the short tangent. Example 11.24 cannot see point 7 from T.P., so the instrument moves to point 6, sights T.P. at 0.24 θs and turns on to 7, 8, 9 and 10.',
      ],
      notes: ['From point b to point a (fractions of Ls) the coefficient is (a − b)(a + 2b)/3 forward and (b − a)(2b + a)/3 backward; it reproduces Table 14 except two misprinted cells.'],
    },
    right: { kicker: 'Examples 11.23, 11.24 · Figs. 36–37', title: 'From C.T., or from point 6' },
  },
  {
    id: 'tight', title: 'Tight locations', prompt: 'Try equal and unequal transitions. Keep the tangent inside its limit.',
    left: {
      kicker: 'Spread 6 · cl. 7.10.1 · Example 11.25', title: 'Curves in tight locations',
      lede: 'The controls are Δ, Ts and Es; the requirements are the minimum radius and transition for the design speed (cl. 7.10.1).',
      paras: [
        'Usually a range of Ts or Es allows a standard curve from Tables 10 and 11, but sometimes a tangent must not exceed a given length, the curve must pass a given point, or the shift must have a given value. Unequal transitions are one answer (cl. 7.10.1).',
        'Example 11.25: a National Highway in hills, Δ 56°, R 100 m. The next apex is 180 m away, so the tangent on that side can be at most 90 m. Equal 80 m spirals give Ts = 94.368 m: too long. A 60 m spiral on the short side and 80 m on the other gives 85.27 m and 92.97 m.',
      ],
    },
    right: { kicker: 'Example 11.25 · Figs. 38–39', title: 'Unequal transitions' },
  },
  {
    id: 'existing', title: 'Transitions for old curves', prompt: 'Pick a method. The old curve is dashed; the new road follows the transitions.',
    left: {
      kicker: 'Spread 7 · cl. 7.10.2–7.10.3 · Figs. 21–24 · Examples 11.26–11.28', title: 'Transitions for old curves',
      lede: 'Old roads have no transitions. Adding them eases the change of direction, lets drivers slow down and gives length for superelevation, an advantage even below standard; it is a palliative, the real cure being a larger radius (cl. 7.10.2).',
      paras: [
        '**Four methods** (cl. 7.10.3): (1) reduce the radius by the shift, straights and centre unchanged (Fig. 21, Ex. 11.26); (2) keep the radius and move the centre by s / cos Δ/2 (Fig. 22, Ex. 11.27); (3) keep the curve and move the straights out by the shift (Fig. 23); (4) put sharper curves with transitions at the ends, keeping as much of the old curve as possible (Fig. 24, Ex. 11.28).',
        'Shifts are small: 100 m of transition on 250 m radius needs 1.664 m, 30 m on 100 m needs 0.375 m, usually within the road land by widening the embankment (cl. 7.10.3).',
      ],
    },
    right: { kicker: 'Figs. 21–24 · Examples 11.26–11.28', title: 'Four ways to fit a spiral' },
  },
  {
    id: 'examples', title: 'Worked examples', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 8 · Examples 11.19, 11.26–11.28', title: 'Worked examples',
      lede: 'The odd-length spiral and the three old-curve examples, worked one line at a time and checked against the exact spiral.',
      paras: [
        '**11.19**: Ls 58.468 m on Rc 125 m, set out by Table 12. **11.26**: an old 200 m curve given 1 m of shift by reducing its radius to 199 m. **11.27**: an old 165 m curve kept, its centre moved. **11.28**: an old 400 m curve kept in the middle, 375 m curves and 122 m transitions at the ends.',
      ],
      notes: ['Example 11.19’s point 8 is misprinted in Table 11.5; the card flags it.'],
    },
    right: { kicker: 'Examples 11.19, 11.26–11.28', title: 'Checked line by line' },
  },
];

export const QUIZ = [];
