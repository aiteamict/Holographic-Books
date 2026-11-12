// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'Widening and Sight',
  subtitle: 'IRC : 38-1988 · chapter 4 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 4 Widening and Sight',
  cover: {
    title: ['Widening', 'and Sight'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  4  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · section 6'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Room to turn, room to see.',
    lede: 'On a curve a vehicle needs more width than on the straight, and the driver needs to see round the bend.',
    paras: [
      'Section 6 works out the extra width of pavement on curves, how it is built in, and how far back from the road an obstruction on the inside of a curve must be kept so the driver can see far enough ahead.',
      'Turn the pages in order. Each right-hand page is a live site model: drive the truck, widen the road, move the wall.',
    ],
    notes: ['Widths and distances in metres. Vehicles are drawn larger than the road so they can be seen.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Room to turn, room to see.',
    lede: 'Chapter 4 of 8 in the IRC : 38 series: section 6 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Guidelines for Design of Horizontal Curves for Highways and Design Tables (First Revision), Indian Roads Congress, 1989. Section 6, Tables 7, 7A and 8, equations (8), (14) and (15), Figs. 14–19, Examples 11.29–11.32.',
      '**Coverage.** cl. 6.1.1–6.1.3: spread 1 · cl. 6.2.1–6.2.3, eq. (8), Fig. 14: spread 2 · cl. 6.2.4, Table 7: spread 3 · cl. 6.2.5–6.2.7, 6.3.1–6.3.4, Figs. 15–16: spread 4 · cl. 6.3.5–6.3.7, Table 7A: spread 5 · cl. 6.4.1–6.4.3, eq. (14)–(15), Table 8, Figs. 17–19: spread 6 · cl. 6.4.4–6.4.6: spread 7 · Examples 11.29, 11.30, 11.32: spread 8.',
      '**Misprints, checked on the page and by the book’s own formulae.** Table 8 prints 2.3 m for R 150 m, S 60 m (eq. 14 gives 2.99 m) and 3.7 m for R 33 m, S 30 m (eq. 14 gives 3.35 m). Example 11.32 prints the outer apex distance as 23.96 m; its own working gives 22.956 m.',
    ],
    notes: ['Vehicle swept paths use a simple pursuit model of the axles; they illustrate cl. 6.1, they are not a design tool. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'why', title: 'Why widen', prompt: 'Drive the truck and the truck-trailer round the bend. Watch the rear wheels.',
    left: {
      kicker: 'Spread 1 · cl. 6.1', title: 'Why curves are widened',
      lede: 'On a curve the rear wheels do not follow the track of the front wheels (cl. 6.1.1).',
      paras: [
        'On a curve without superelevation the rear wheels track **inside** the front ones. On a superelevated curve their position depends on the speed; at excessive speed they may track outside. The pavement is widened to allow for this change in the overall track width (cl. 6.1.1).',
        'Drivers also find it hard to keep to the centre line on curves, and when passing they keep **greater clearances** than on straights; the front overhang of a vehicle reduces the clearance (cl. 6.1.2).',
        'A truck-trailer swings wider still: its trailer tracks inside at balanced speeds, farther out at higher speeds, and rough pavements or jerks whip it from the centre of the lane (cl. 6.1.3).',
      ],
    },
    right: { kicker: 'cl. 6.1.1–6.1.3', title: 'Off-tracking' },
  },
  {
    id: 'amount', title: 'How much extra width', prompt: 'Drag the radius and pick a speed. Watch both parts of the widening.',
    left: {
      kicker: 'Spread 2 · cl. 6.2 · eq. (8)', title: 'How much extra width',
      lede: 'The extra width has two parts: mechanical and psychological (cl. 6.2.1–6.2.2).',
      paras: [
        '**Mechanical widening**: a vehicle of wheel base l on a curve of radius R occupies an extra width of **l²/2R** (Fig. 14); with 11 m as a representative wheel base, 121/2R (cl. 6.2.1).',
        '**Psychological widening**, found empirically: **V/(9.5√R)**. The total is **We = l²/2R + V/(9.5√R)** (eq. 8, cl. 6.2.2).',
        'Two-lane and wider roads need both parts to keep the clearances of the straight. On single-lane roads the outer wheels run on the shoulder when vehicles cross anyway, so only the mechanical part is needed (cl. 6.2.3).',
      ],
    },
    right: { kicker: 'eq. (8) · Fig. 14', title: 'Mechanical plus psychological' },
  },
  {
    id: 'table7', title: 'Table 7', prompt: 'Pick a radius and the number of lanes. Compare Table 7 with eq. (8).',
    left: {
      kicker: 'Spread 3 · cl. 6.2.4 · Table 7', title: 'Table 7',
      lede: 'Table 7 gives the extra width of carriageway for single-lane and two-lane roads (cl. 6.2.4).',
      paras: [
        'Two-lane: **1.5 m** up to 40 m radius, **1.2 m** from 41 to 60 m, **0.9 m** from 61 to 100 m, **0.6 m** from 101 to 300 m. Single-lane: **0.9 m** up to 20 m, **0.6 m** from 21 to 60 m, nil beyond (Table 7).',
        'Multi-lane roads add **half the two-lane widening to each lane** (cl. 6.2.4).',
      ],
    },
    right: { kicker: 'Table 7', title: 'Extra width by radius' },
  },
  {
    id: 'apply', title: 'Building the width in', prompt: 'Drive through the curve. Put the widening on the inside or on both sides.',
    left: {
      kicker: 'Spread 4 · cl. 6.2.5–6.3.4 · Figs. 15–16', title: 'Building the width in',
      lede: 'Widening, like superelevation, builds up from the tangent point to its full value at the end of the transition and continues round the circular curve (cl. 6.3.2, Fig. 15).',
      paras: [
        'It is applied at an approximately uniform rate along the transition. On a curve without transition, two-thirds is attained on the straight before the curve and one-third on the curve (cl. 6.2.5).',
        'It is applied **equally on both sides**, except on hill roads, where it is preferably all **on the inside**, and on circular curves without transition, where it goes only on the inside. Single-lane roads on sharp curves under 150 m are widened on the inside (cl. 6.2.6, 6.3.1).',
        'Widening is set out by offsets radial to the centre line, proportional to the distance from the start of the curve. The edges must be smooth with no kink; when it is split, the outer edge is carried along the straight until the curve falls inside it (cl. 6.2.7, 6.3.4, Fig. 16).',
      ],
    },
    right: { kicker: 'Figs. 15–16', title: 'Inside or both sides' },
  },
  {
    id: 'edges', title: 'Laying out the edges', prompt: 'Pick the deviation angle. Compare same-radius edges with concentric ones.',
    left: {
      kicker: 'Spread 5 · cl. 6.3.5–6.3.7 · Table 7A', title: 'Laying out the edges',
      lede: 'The edges can be laid out with the same radius and transition length as the centre line, simply moved out (cl. 6.3.5).',
      paras: [
        'Then the widening depends on the deviation angle alone: it is **W (sec Δ/2 − 1)**, W being the width on the straight, and may be more or less than required. Table 7A gives the angles: 0.30 m at 33° 55′, 0.60 m at 47° 08′, 0.90 m at 56° 44′, 1.20 m at 64° 24′, 1.50 m at 70° 51′ (cl. 6.3.6).',
        'In these layouts the widening grows from nothing to its full value only at the middle of the circular curve, but full widening is needed at its start. The ideal is **concentric circular curves** with suitable transitions, reaching full widening at the start of the curve (cl. 6.3.7, Example 11.32).',
      ],
    },
    right: { kicker: 'Table 7A · cl. 6.3.7', title: 'Same radius or concentric' },
  },
  {
    id: 'setback', title: 'Set-back distance', prompt: 'Drag the wall on the inside of the curve. Keep it outside the sight line.',
    left: {
      kicker: 'Spread 6 · cl. 6.4.1–6.4.3 · eq. (14)–(15)', title: 'Set-back distance',
      lede: 'The sight distance needed must be available across the inside of horizontal curves (cl. 6.4.1).',
      paras: [
        'Walls, cut slopes, buildings, woods and high crops can block it. They are cleared back to the **set-back distance** m from the centre line: **m = R − (R − n) cos θ** with **θ = S / 2(R − n)** radians (eq. 14–15), R the radius at the centre line, n the distance from the centre line to the middle of the inside lane, S the sight distance (cl. 6.4.2, Fig. 17).',
        'Table 8 gives set-backs for single-lane hill roads, from S = 20 m at 20 km/h to S = 60 m at 50 km/h. It assumes circular curves longer than the sight distance; values are somewhat high for shorter curves (cl. 6.4.3).',
      ],
    },
    right: { kicker: 'eq. (14)–(15) · Table 8 · Fig. 17', title: 'Keep the wall back' },
  },
  {
    id: 'cut', title: 'Cut slopes and summits', prompt: 'Switch between stopping and overtaking sight. Cut the slope back until the line clears.',
    left: {
      kicker: 'Spread 7 · cl. 6.4.4–6.4.6', title: 'Cut slopes and summits',
      lede: 'Set-backs for overtaking or intermediate sight distance are computed the same way but are usually too large to be economical except on very flat curves (cl. 6.4.4).',
      paras: [
        'With a **cut slope** on the inside of the curve, an average height of the sight line can be used: **0.7 m** for stopping sight distance, the bare minimum; **1.2 m** above the ground for intermediate or overtaking sight distance. The slope is kept below this height at the set-back line, by cutting back or benching (cl. 6.4.5).',
        'Where horizontal and summit vertical curves overlap, the design must provide the sight distance both vertically along the pavement and horizontally on the inside of the curve (cl. 6.4.6).',
      ],
    },
    right: { kicker: 'cl. 6.4.4–6.4.6', title: 'Sight over the cutting' },
  },
  {
    id: 'examples', title: 'Worked examples', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 8 · Examples 11.29–11.32', title: 'Worked examples',
      lede: 'Section 11 lays out the widened edges of a curve and builds widening into the run-off.',
      paras: [
        '**Example 11.29**: widening proportional to the distance from the start of the curve, R 175 m, Ls 30 m, 40 km/h: 0.6 m from Table 7.',
        '**Example 11.30**: edges with the same radius and transition as the centre line (R 155 m, Ls 80 m, Δ 56°): the width at the middle becomes 7 sec 28° = 7.928 m.',
        '**Example 11.32**: a concentric layout with 1.2 m on the inside: inner edge R 150.3 m, outer edge R 158.5 m, each with its own transition.',
      ],
      notes: ['Example 11.32 prints the outer apex distance as 23.96 m; its own working gives 22.956 m. Example 11.31, edges that are not concentric, follows in a later update.'],
    },
    right: { kicker: 'Examples 11.29–11.32', title: 'Edges, worked' },
  },
];

export const QUIZ = [];
