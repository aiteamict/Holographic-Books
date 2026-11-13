// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, appendix or example in brackets.
export const BOOK = {
  title: 'Design with the Tables',
  subtitle: 'IRC : 38-1988 · chapter 8 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 8 Design with the Tables',
  cover: {
    title: ['Design with', 'the Tables'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  8  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · Tables 10–17, Appendices 2–5'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'The tables, recomputed.',
    lede: 'More than three hundred pages of IRC : 38 are design tables. Here each table is a calculator: pick the curve, read the row, and see it set beside the exact geometry.',
    paras: [
      'Tables 10 to 12 give Ts and Es, set-out data and the unit spiral; Table 13 curves transitional throughout; Table 14 polar-deflection coefficients; Table 15 shifts; Tables 16 and 17 circular curves.',
      'Where the book’s printed value is wrong, and the cell has been read on the page to be sure, the card shows it in red.',
    ],
    notes: ['Lengths in metres, angles in degrees. Every value is computed from the curve’s geometry, not copied.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'The tables, recomputed.',
    lede: 'Chapter 8 of 8 in the IRC : 38 series: the design tables and Examples 11.7–11.9.',
    paras: [
      '**Source.** IRC : 38-1988, Indian Roads Congress, 1989. cl. 7.6–7.9, Tables 10–17, Appendices 2–5, Examples 11.7–11.9.',
      '**Misprints, read on the page** (printed → right). Table 11.1 (Ex. 11.3) Es 155/40 21.305 → 21.035, 170/15 21.599 → 22.599, 170/20 22.685 → 22.648. Table 11.2 Es 54.720 → 54.726, 67.694 → 67.643. Table 11.3 s tan 28° 0.3550 → 0.3507. Table 13: 60° Ts 107.124 → 107.174; 99° Es 42.430 → 42.034; 82°, 119°, 137°, 138°; 130°/131° Es swapped. Table 14: 14 coefficients. Table 15: 25H R100 0.944 → 0.094; 30P R100 0.289 → 0.260; 40H R50, R55; 40P R60; 35H R40; 80P R500. Table 16: 14°, 16°, 55°, 78°, 86°, 88°, 91°, 92°, 106°, 109°, 116°, 117°, 118°, 120°. Table 17: R 40, 55, 100, 300, 400, 500, 600, 900.',
    ],
    notes: ['Tables 10–12 are too long to set here whole; their spreads compute any cell and check those the text quotes. IRC : 73 and other codes revised since 1988 also set some of these values. Not a substitute for the standard.'],
  },
};

export const LESSONS = [null,
  {
    id: 'table10', title: 'Table 10: Ts and Es', prompt: 'Step Δ, Rc and Ls; find the pairs Example 11.7 lists.',
    left: {
      kicker: 'Spread 1 · cl. 7.6.2, 7.7.2–7.7.3 · Table 10', title: 'Ts and Es',
      lede: 'In practice the terrain fixes the tangent distance, the apex distance, or both, and many radius and transition pairs fit (cl. 7.6.2).',
      paras: [
        'Table 10 gives Ts and Es for radii **14 to 2500 m**, transitions **15 to 140 m** and deviations **6° to 120°**. Thick zig-zag lines mark the design speeds: values right of or above a line suit that speed (cl. 7.7.2).',
        'Below 6° the apex distance changes little even for large changes of radius, so a curve of over 1000 m radius fits easily (cl. 7.7.3).',
        'The card computes any cell and sets beside it the cells the book quotes in Examples 11.3 to 11.9.',
      ],
    },
    right: { kicker: 'Table 10', title: 'Any radius, any transition' },
  },
  {
    id: 'table11', title: 'Tables 11 and 12: set-out data', prompt: 'Step Rc and Ls; read the ten chord points.',
    left: {
      kicker: 'Spread 2 · cl. 7.6.1, 7.8.6, 7.9.2 · Tables 11–12', title: 'Set-out data',
      lede: 'Table 11 gives, for standard radii and lengths, everything needed to peg a transition: X and Y offsets and polar deflections to the chord points, with L.T., S.T., L.C., s and K (cl. 7.8.6).',
      paras: [
        'Ten chords for 30 m and longer, five for 15 m and 20 m. Table 12 gives the same functions for a spiral of **unit length** against θs, in steps of 0.1° up to 50°; multiply by Ls (cl. 7.6.1).',
        'For a length or radius not in Table 11, θs = 28.65 Ls / Rc and the offsets are worked individually (cl. 7.9.2). The card does exactly that for every pair.',
      ],
    },
    right: { kicker: 'Tables 11 and 12', title: 'Ten chords from T.P.' },
  },
  {
    id: 'table13', title: 'Table 13: transitional throughout', prompt: 'Step Δ, or jump to the next misprint.',
    left: {
      kicker: 'Spread 3 · cl. 7.7.4 · Table 13', title: 'Transitional throughout',
      lede: 'With no circular arc, each transition takes half the deviation: θs = Δ/2, and innumerable radius and length pairs fit (cl. 7.7.4).',
      paras: [
        'Table 13 gives Ts and Es for Δ **6° to 138°** with **Ls = 100 m**. For another length every value scales in proportion: for 120 m multiply by 1.2.',
        'Eight printed cells are wrong; at 130° and 131° the two apex distances have changed places.',
      ],
    },
    right: { kicker: 'Table 13', title: 'Two spirals, no circle' },
  },
  {
    id: 'table14', title: 'Table 14: polar deflections', prompt: 'Move the instrument from station to station.',
    left: {
      kicker: 'Spread 4 · cl. 7.8.7, 7.9.4 · Table 14', title: 'From any station',
      lede: 'For a non-standard spiral, Table 14 gives coefficients for the polar deflection from any chord point to any other of a ten-chord spiral; multiply by θs (cl. 7.8.7).',
      paras: [
        'Forward, from a to b: **(b − a)(b + 2a) / 300**; backward: **(a − b)(2a + b) / 300**. From T.P. to point 8 with θs = 30°: 0.2133 × 30° = 6.399° (note 2).',
        'Above 20° a small correction C, in minutes, is subtracted forward and added backward (Table 14-2). Fourteen printed coefficients break the rule; the text cites the table as “Table 15” (cl. 7.9.4).',
      ],
    },
    right: { kicker: 'Table 14', title: 'Instrument at any peg' },
  },
  {
    id: 'table15', title: 'Table 15: shifts', prompt: 'Step through the speeds and radii, or jump to the next misprint.',
    left: {
      kicker: 'Spread 5 · cl. 7.10.2 · Table 15', title: 'How far the curve moves in',
      lede: 'To make room for its transitions a circular curve moves in by the shift. Table 15 gives it for the Table 9 length at each radius and design speed.',
      paras: [
        'It is close to **Ls² / 24Rc**. A 55 m transition at 80 m radius needs **1.567 m**, usually possible without new land (cl. 7.10.2); the same sentence then prints “7.367 m”.',
        'Seven printed shifts are wrong, one by a slipped decimal point: 0.944 for 0.094.',
      ],
    },
    right: { kicker: 'Table 15', title: 'The shift for each length' },
  },
  {
    id: 'table16', title: 'Table 16: circular curves', prompt: 'Step Δ, or jump to the next misprint.',
    left: {
      kicker: 'Spread 6 · Appendix 2 · Table 16', title: 'The circle of 100 m',
      lede: 'For a curve circular throughout, Table 16 gives the tangent length, apex distance and arc length for a radius of 100 m; multiply by Rc / 100 (Appendix 2).',
      paras: [
        '**T = R tan Δ/2, E = R (sec Δ/2 − 1), L = R Δ**, Δ in radians, to five decimals for Δ 1° to 120°.',
        'Fifteen printed values are wrong beyond the last digit: at 16° the tangent is printed 13.05408 for 14.05408.',
      ],
    },
    right: { kicker: 'Table 16', title: 'Scale it to any radius' },
  },
  {
    id: 'table17', title: 'Table 17: deflections', prompt: 'Step the radius; peg the curve every 10, 20 or 50 m.',
    left: {
      kicker: 'Spread 7 · Appendix 2 · Table 17', title: 'Pegging a circle',
      lede: 'Table 17 gives, for each radius, the deflection angle for arcs of 1, 10, 20 and 50 m, chord lengths for those arcs, and the deflection for chords of 10, 20 and 50 m (Appendix 2).',
      paras: [
        'For an arc l the deflection from the tangent is **l / 2R** radians; the chord is **2R sin (l / 2R)**; for a chord C the deflection is **sin⁻¹ (C / 2R)**.',
        'Ten printed cells, read on the page, are wrong; most slip one digit.',
      ],
    },
    right: { kicker: 'Table 17', title: 'Theodolite at T.P.' },
  },
  {
    id: 'examples', title: 'Tangent distance governs', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 8 · Examples 11.7–11.9', title: 'When Ts is fixed',
      lede: 'A level crossing, a bridge or a building can fix the tangent distance. Table 10 then gives the curve.',
      paras: [
        '**11.7:** Δ 56°, Ts between 300 and 322 m on an NH: the largest radius that fits is 500 m with Ls 110 m.',
        '**11.8:** the same with Δ 55° 42′, by interpolating Table 10. **11.9:** Ts exactly 350 m: Ls 95 m from Table 9, and Rc = 568.29 m.',
      ],
    },
    right: { kicker: 'Examples 11.7–11.9 · Fig. 28', title: 'Fixed by a level crossing' },
  },
];

export const QUIZ = [];
