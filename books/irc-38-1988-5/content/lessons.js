// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'The Transition Curve',
  subtitle: 'IRC : 38-1988 · chapter 5 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 5 The Transition Curve',
  cover: {
    title: ['The', 'Transition Curve'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  5  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · sections 7.1–7.7'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'Easing into the bend.',
    lede: 'Between the straight and the circle lies a curve whose radius falls gradually from infinity to the radius of the circle.',
    paras: [
      'Sections 7.1 to 7.7 say why the transition is needed, why the spiral is the curve used in India, how long it must be, when it can be left out, how it fits the circular curve, and how curves with transitions are designed from the tables.',
      'Turn the pages in order. Each right-hand page is a live site model or plan: drive into the bend, stretch the spiral, read Table 9.',
    ],
    notes: ['Lengths in metres, speeds V in km/h, angles in degrees unless marked radians. Vehicles are drawn larger than the road.'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'Easing into the bend.',
    lede: 'Chapter 5 of 8 in the IRC : 38 series: sections 7.1 to 7.7 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Guidelines for Design of Horizontal Curves for Highways and Design Tables (First Revision), Indian Roads Congress, 1989. Sections 7.1–7.7, equations (16)–(28), Table 9, Fig. 20, Examples 11.10–11.16.',
      '**Coverage.** cl. 7.1.1–7.1.3: spread 1 · cl. 7.2.1–7.2.4: spread 2 · cl. 7.3.1–7.3.2, eq. (16)–(17): spread 3 · cl. 7.3.3, eq. (18)–(19): spread 4 · cl. 7.3.4, 7.4.1–7.4.3, Table 9: spread 5 · cl. 7.5.1, 7.5.2, 7.5.4, eq. (20)–(24): spread 6 · cl. 7.5.3, 7.5.5, 7.5.6, eq. (25)–(28), Fig. 20: spread 7 · cl. 7.6, 7.7, Examples 11.10, 11.11, 11.15: spread 8 · Examples 11.12–11.14, 11.16: spread 9.',
      '**Misprints, checked against the book’s own working.** Example 11.13 prints LT = 49.84 m; 0.6673 × 67.195 = 44.84 m. Example 11.11 writes (199.92/100) × 106.153 for (119.92/100) × 106.153; its result, 127.298 m, is right. cl. 7.4.1 gives the shift of a 14.4 m transition on 1200 m as 0.043 m; L²/24R = 0.0072 m. cl. 7.7.3 says 1,000 m where cl. 7.4.3 and Table 9 say 1200 m.',
    ],
    notes: ['Table 9 is set beside eq. (16)–(19); cells that differ do so by 5 m, rounded by judgement. IRC : 73 and other codes revised since 1988 also set some of these values. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'why', title: 'Why a transition', prompt: 'Drive into the bend with and without a transition. Watch the push and the lane.',
    left: {
      kicker: 'Spread 1 · cl. 7.1', title: 'Why a transition',
      lede: 'Entering a curve of finite radius straight from a tangent applies the centrifugal force suddenly: a shock and a sway (cl. 7.1.1).',
      paras: [
        'Drivers steer gradually, making a natural transition of their own. At speed the steering takes a long path, and the vehicle **cuts the corner into the adjacent lane**; a transition kept within the lane must be very short, the shorter the less spare width between lane and vehicle, and buses are up to 2.5 m wide (cl. 7.1.1).',
        'The shock can be reduced by slowing down, by a path of greater radius, or by both, or by **designing the alignment with a radius that changes gradually from infinity to the design radius**. Only the last lets vehicles keep the same speed on the curve as on the straight (cl. 7.1.2).',
        'Transitions also let superelevation be applied gradually, and remove the optical illusion of a bulge where a circular curve joins a straight (cl. 7.1.3).',
      ],
    },
    right: { kicker: 'cl. 7.1.1–7.1.3', title: 'Sudden or gradual' },
  },
  {
    id: 'types', title: 'Types of transition', prompt: 'Open the three curves to wider deflections. Watch the curvature.',
    left: {
      kicker: 'Spread 2 · cl. 7.2', title: 'Types of transition',
      lede: 'A transition must reduce the radius gradually from infinity to the minimum, at a rate of change of centrifugal acceleration that causes no discomfort (cl. 7.2.1).',
      paras: [
        'Radial acceleration varies as 1/R, so the radius of curvature should be **inversely proportional to the length** from the start. The spiral does exactly this (cl. 7.2.1).',
        'In the **lemniscate** the radius does not fall directly with length, so the rate of gain of acceleration falls off slightly; beyond deflections of 30° it is no longer uniform (cl. 7.2.2). The **cubic parabola** has no transitional properties for polar deflections greater than 9° (cl. 7.2.3).',
        'The **spiral** is specified for road transitions in India: uniform rate of change of acceleration, an instrument that can be shifted in setting out, and a rate set by choosing the length (cl. 7.2.4).',
      ],
    },
    right: { kicker: 'cl. 7.2.1–7.2.4', title: 'Spiral, lemniscate, cubic parabola' },
  },
  {
    id: 'comfort', title: 'Length for comfort', prompt: 'Pick a speed and a radius. The transition stretches to keep the rate of change C.',
    left: {
      kicker: 'Spread 3 · cl. 7.3.1–7.3.2 · eq. (16)–(17)', title: 'Length for comfort',
      lede: 'The transition is the greater of two lengths: one from the rate of change of centrifugal acceleration, one from the rate of change of superelevation (cl. 7.3.1).',
      paras: [
        'For comfort: **Ls = 0.0215 V³ / (C R)** (eq. 16), Ls and R in metres, V in km/h. The centrifugal acceleration v²/R grows from nothing to its full value along the transition, at the rate C in m/s³ (cl. 7.3.2).',
        '**C = 80 / (75 + V)**, at most 0.8 and at least 0.5 (eq. 17): faster roads are allowed a gentler rate of change.',
      ],
    },
    right: { kicker: 'eq. (16)–(17)', title: 'The rate of change of the push' },
  },
  {
    id: 'super', title: 'Length for superelevation', prompt: 'Switch between plain and hill roads. Watch the outer edge climb along the transition.',
    left: {
      kicker: 'Spread 4 · cl. 7.3.3 · eq. (18)–(19)', title: 'Length for superelevation',
      lede: 'The edge of the pavement should rise against the centre line no faster than **1 in 150** in plain and rolling terrain and **1 in 60** in mountainous and steep terrain (cl. 7.3.3).',
      paras: [
        'On a two-lane road in plain country with 0.9 m widening, the outer edge rises 7.9/2 × 7/100 m, which at 1 in 150 takes 42 m. Along a spiral R L is constant, and full superelevation is reached at a radius of 0.0635 V², so **Ls = 2.7 V² / R** (eq. 18); on hill roads at 1 in 60, **Ls = V² / R** (eq. 19).',
        'Derived for two-lane roads, they serve single-lane and four-lane divided highways too; for four-lane undivided and six-lane divided roads they are better increased by 50 per cent (cl. 7.3.3).',
      ],
    },
    right: { kicker: 'eq. (18)–(19)', title: 'The edge climbs' },
  },
  {
    id: 'table9', title: 'Table 9', prompt: 'Pick a speed and terrain, then step the radius. Compare Table 9 with the equations.',
    left: {
      kicker: 'Spread 5 · cl. 7.3.4, 7.4 · Table 9', title: 'Table 9, and when none is needed',
      lede: 'Table 9 gives minimum transition lengths for each speed and radius, and the radii beyond which no transition is needed. In practice Ls is a whole multiple of 5 m, the standard chord (cl. 7.3.4).',
      paras: [
        'On a 1200 m National Highway curve at 80 km/h the centrifugal ratio is only **0.042**: entering it suddenly gives no real shock and drivers make their own transition (cl. 7.4.1). With a camber of 1.7 per cent the friction needed is 0.025 on the inside and 0.059 on the outside, both within limits (cl. 7.4.2).',
        'So curves of **more than 1200 m radius need not have transitions**, though they may be given them for a graceful alignment (cl. 7.4.3).',
      ],
    },
    right: { kicker: 'Table 9 · cl. 7.4', title: 'Minimum transition lengths' },
  },
  {
    id: 'spiral', title: 'The spiral', prompt: 'Drag the point along the spiral. Its circle shrinks as it goes.',
    left: {
      kicker: 'Spread 6 · cl. 7.5.1–7.5.2, 7.5.4 · eq. (20)–(24)', title: 'The spiral',
      lede: 'A horizontal curve should be a circular curve with a spiral at each end, or two spirals meeting (cl. 7.5.1).',
      paras: [
        'Along the spiral **L R = Ls Rc = A²**, a constant. The angle turned is **θ = L² / (2 Rc Ls)** (eq. 21A); at its end **θs = Ls / 2Rc** radians, or **28.65 Ls / Rc** degrees (eq. 21B).',
        'The offset from the tangent is **y ≈ L³ / (6 Rc Ls)** (eq. 22) and the distance along it x ≈ L (1 − θ²/10) (eq. 23). The polar deflection from the tangent point is **α ≈ θ/3** (eq. 24).',
        'For the same θs, Ls varies as Rc; with the same radius a longer spiral turns through more; with the same length a smaller radius turns through more (cl. 7.5.4).',
      ],
    },
    right: { kicker: 'eq. (20)–(24)', title: 'L R = A²' },
  },
  {
    id: 'shift', title: 'Spiral and circle', prompt: 'Lengthen the transition. The circle moves in by the shift.',
    left: {
      kicker: 'Spread 7 · cl. 7.5.3, 7.5.5–7.5.6 · eq. (25)–(28)', title: 'The spiral and the main curve',
      lede: 'With transitions, the circle’s centre moves away from the apex along the bisector and the circle moves in from the tangents by the **shift** s (cl. 7.5.3).',
      paras: [
        '**Ts = K + (Rc + s) tan Δ/2** (eq. 25) and **Es = (Rc + s) sec Δ/2 − Rc** (eq. 26), with s ≈ Ls²/24Rc (eq. 27) and K ≈ Ls/2 (eq. 28).',
        'The spiral leaves its osculating circle at any point at the same rate as it leaves the tangent at its start, so the instrument can be shifted while setting out (cl. 7.5.5).',
        'For small deviations: K is about half the transition; **the shift is bisected by the transition**; and Ts is about half the curve length plus (Rc + s) tan Δ/2 (cl. 7.5.6).',
      ],
    },
    right: { kicker: 'eq. (25)–(28) · cl. 7.5.6', title: 'The shift' },
  },
  {
    id: 'design', title: 'Designing with the tables', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 8 · cl. 7.6, 7.7 · Examples 11.10, 11.11, 11.15', title: 'Designing with the tables',
      lede: 'With no restrictions, take the largest radius possible and Ls from Table 9; the circular arc then turns through Δ − 2θs (cl. 7.6.1).',
      paras: [
        'In practice terrain or buildings make Ts or Es govern, and many radius and length pairs fit. Table 10 gives Ts and Es for radii 14 to 2500 m, transitions 15 to 140 m and Δ 6° to 120°; Table 12 gives the spiral functions for a unit length (cl. 7.6.2, 7.7.2).',
        'In a curve **transitional throughout**, each spiral takes half the deviation. Table 13 gives Ts and Es for Ls = 100 m; other lengths scale in proportion (cl. 7.7.4).',
      ],
      notes: ['Example 11.11 writes 199.92 where it means 119.92; its result is right.'],
    },
    right: { kicker: 'Examples 11.10, 11.11, 11.15', title: 'When the apex distance governs' },
  },
  {
    id: 'table12', title: 'Spirals from Table 12', prompt: 'Pick an example and press Next step.',
    left: {
      kicker: 'Spread 9 · Examples 11.12–11.14, 11.16', title: 'Spirals from Table 12',
      lede: 'Table 12 lists, for a unit transition, every function of the spiral against θs, so a spiral can be found from whichever quantity the site fixes.',
      paras: [
        '**11.12**: Rc and the shift s. **11.13**: Rc and the offset Yc at the end. **11.14**: Rc and the short tangent ST. **11.16**: Rc and a point the spiral must pass through, 2.5 m from the tangent at 80 m.',
        'Each is solved by finding θs in Table 12 and scaling by Ls; the card checks every printed value against the exact spiral.',
      ],
      notes: ['Example 11.13 prints LT = 49.84 m; its own working gives 0.6673 × 67.195 = 44.84 m.'],
    },
    right: { kicker: 'Table 12 · Examples 11.12–11.16', title: 'One known quantity' },
  },
];

export const QUIZ = [];
