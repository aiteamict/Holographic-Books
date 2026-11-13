// The words on the pages. Quoted from IRC : 38-1988 with the clause, table, equation (eq.) or figure in brackets.
export const BOOK = {
  title: 'Speed and Radius',
  subtitle: 'IRC : 38-1988 · chapter 2 of 8',
  credit: 'built from IRC : 38-1988',
  home: { href: '../irc-38-1988/', label: 'All IRC 38 chapters' },
  foot: 'IRC : 38-1988 · Design of Horizontal Curves · 2 Speed and Radius',
  cover: {
    title: ['Speed', 'and Radius'],
    kicker: 'I R C : 3 8 - 1 9 8 8   ·   C H A P T E R  2  O F  8',
    foot: ['GUIDELINES FOR DESIGN OF HORIZONTAL CURVES FOR HIGHWAYS AND DESIGN TABLES', 'Indian Roads Congress · sections 3 and 4'],
    colors: { board: ['#c3cfdb', '#97a9ba'], ink: '#14202b', cyan: '#24557a', dim: '#3b4d5e', frame: 'rgba(20,32,43,.25)' },
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'How sharp may a curve be?',
    lede: 'That depends on how fast the road is meant to be driven, and on what holds a vehicle on the curve: friction and the tilt of the road.',
    paras: [
      'Section 3 fixes the **design speed** for each class of road in each kind of terrain. Section 4 works out the forces on a vehicle going round a curve and from them the **minimum radius** for each speed.',
      'Turn the pages in order. Each right-hand page is a live site model: drive the cars, tilt the road, tighten the curve until it fails.',
    ],
    notes: ['Speeds in km/h, radii in metres, superelevation and friction as decimals (0.07 = 7 per cent).'],
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'How sharp may a curve be?',
    lede: 'Chapter 2 of 8 in the IRC : 38 series: sections 3 and 4 of the standard.',
    paras: [
      '**Source.** IRC : 38-1988, Guidelines for Design of Horizontal Curves for Highways and Design Tables (First Revision), Indian Roads Congress, 1989. Sections 3 and 4, Tables 1–3, equations (1)–(6), Figs. 4–9; the radius steps of Examples 11.1 and 11.2.',
      '**Coverage.** cl. 3.1–3.3: spread 1 · cl. 3.4, Table 1: spread 2 · cl. 3.4–3.6, Table 2: spread 3 · cl. 4.1, eq. (1)–(2), Figs. 4–5: spread 4 · cl. 4.1–4.3, eq. (3)–(5), Figs. 6–8: spread 5 · cl. 4.4.1–4.4.4, eq. (6), Table 3: spread 6 · cl. 4.4.5, Fig. 9: spread 7 · Examples 11.1, 11.2 (radius steps): spread 8.',
      '**Misprints, checked on the page.** cl. 4.3 says bullock carts find "a transverse slope of more than 70 per cent" inconvenient, then sets the maximum at 7 per cent: 70 should read 7. Example 11.1 states a radius of 260 m but works with 250 m.',
    ],
    notes: ['Spread 1’s traffic speeds are illustrative; vehicles and people are drawn larger. IRC : 73 and other codes revised since 1988 also set some of these values. Nothing here is a substitute for the standard itself.'],
  },
};

export const LESSONS = [null,
  {
    id: 'speed', title: 'The design speed', prompt: 'Watch the traffic, then move the design speed with the − and + buttons.',
    left: {
      kicker: 'Spread 1 · cl. 3.1–3.3', title: 'The design speed',
      lede: 'Some drivers choose higher speeds than others; the speed actually driven is seldom the most the vehicle can do (cl. 3.1).',
      paras: [
        'Speeds are higher in flat country than in hills with steep gradients, and lower in towns with traffic control and frequent intersections. A road cannot be designed for every need, so the aim is a **constant design speed** within any one section: drivers can then anticipate each other (cl. 3.1).',
        'An important highway with heavy traffic justifies a higher design speed than a minor road in similar country; but alignment beyond a certain standard costs more than it saves (cl. 3.2).',
        'The design speed is "**the maximum approximately uniform speed that will probably be adopted by the faster group of drivers but not necessarily by a small percentage of the reckless ones**" (cl. 3.3).',
      ],
    },
    right: { kicker: 'cl. 3.1–3.3', title: 'The faster group, not the reckless few' },
  },
  {
    id: 'terrain', title: 'Terrain', prompt: 'Drag the slope of the country. The class changes with it.',
    left: {
      kicker: 'Spread 2 · cl. 3.4 · Table 1', title: 'Terrain',
      lede: 'Choice of design speed depends on the function of the road and on the terrain (cl. 3.4).',
      paras: [
        'Terrain is classified by the **general cross slope of the country** across the alignment (Table 1): **plain** 0–10 per cent, **rolling** 10–25, **mountainous** 25–60, **steep** over 60.',
        'Short isolated stretches of a different terrain are not taken into account. Terrain is the basic parameter that decides all the other geometric design features (cl. 3.4).',
      ],
    },
    right: { kicker: 'Table 1', title: 'Cross slope of the country' },
  },
  {
    id: 'speeds', title: 'Design speeds', prompt: 'Pick a class of road and a terrain to read its design speeds.',
    left: {
      kicker: 'Spread 3 · cl. 3.4–3.6 · Table 2', title: 'Design speeds',
      lede: 'Table 2 gives two design speeds for each class of road in each terrain.',
      paras: [
        'The **ruling design speed** is the guiding criterion. The **minimum design speed** may be adopted where site conditions, including costs, do not permit the ruling speed (cl. 3.5).',
        'National and State Highways: 100 and 80 km/h in plain country, 80 and 65 rolling, 50 and 40 mountainous, 40 and 30 steep (Table 2).',
        'Design speed should preferably be uniform. Where terrain forces a change, change it **gradually**, through successive sections; where an adequate design is impossible or too costly, put up a **warning sign** well ahead of the danger (cl. 3.6).',
      ],
    },
    right: { kicker: 'Table 2', title: 'Ruling and minimum' },
  },
  {
    id: 'force', title: 'The outward push', prompt: 'Change the speed or drag the curve tighter. Watch the arrow and the tyres.',
    left: {
      kicker: 'Spread 4 · cl. 4.1 · eq. (1)–(2)', title: 'The outward push',
      lede: 'Round a curve of constant radius at constant speed, a vehicle exerts an outward force, the **centrifugal force** (cl. 4.1).',
      paras: [
        '**P = Wv² / gR** (eq. 1), or with V in km/h, **P = WV² / 127 R** (eq. 2). It acts horizontally at the centre of gravity of the vehicle and its load.',
        'The forces on the vehicle are the centrifugal force outward, its weight downward and the upward reaction of the road.',
        'On a level road friction alone holds the vehicle and the wheels are unequally loaded, the **outer wheel taking more** (Fig. 4). When superelevation exactly balances the centrifugal force, the pressures are equal and no friction is needed (Fig. 5).',
      ],
    },
    right: { kicker: 'eq. (1)–(2) · Figs. 4–5', title: 'Centrifugal force' },
  },
  {
    id: 'balance', title: 'Friction and superelevation', prompt: 'Tilt the road and change the speed. The car holds while V²/127R ≤ e + f.',
    left: {
      kicker: 'Spread 5 · cl. 4.1–4.3 · eq. (3)–(5)', title: 'Friction and superelevation',
      lede: 'The centrifugal ratio **B = P/W = V²/127R = tan (A + φ) ≈ e + f** (eq. 3–5).',
      paras: [
        'Lateral friction depends on speed, surface, tyres, weather and temperature. It is **as low as 0.2** on a pavement covered with mud; with a factor of safety of 1⅓ the design value is **f = 0.15** (cl. 4.2).',
        'Slow bullock carts loaded high with hay find a steep cross slope inconvenient, so the **maximum superelevation is 7 per cent**; in hills not affected by snow **10 per cent** is recommended; where snow makes the road slippery the limit stays 7 per cent (cl. 4.3).',
      ],
      notes: ['e is the superelevation, tan A; f the coefficient of lateral friction, tan φ (def. 15, 37). Figs. 6–8 show the forces for friction alone, superelevation alone, and both.'],
    },
    right: { kicker: 'eq. (3)–(5) · Figs. 6–8', title: 'B = e + f' },
  },
  {
    id: 'radius', title: 'Minimum radius', prompt: 'Pick a speed and drag the curve tighter until the car cannot hold it.',
    left: {
      kicker: 'Spread 6 · cl. 4.4.1–4.4.4 · eq. (6)', title: 'Minimum radius',
      lede: 'The minimum radius is governed by the design speed with the allowable superelevation and friction, and by the turning radius of the design vehicle (cl. 4.4.1).',
      paras: [
        'With e = 0.07 to 0.1 and f = 0.15, the centrifugal ratio V²/127R is limited to **0.22 to 0.25**, so the absolute minimum radius is **V² / ((0.22 to 0.25) × 127), or 0.0358 V² to 0.0315 V²** (eq. 6, cl. 4.4.2).',
        'Table 3 gives the desirable minimum radii: for plain and rolling terrain **360 m at 100 km/h, 230 m at 80, 155 at 65, 90 at 50** (cl. 4.4.3).',
        'These are minima: the engineer should design curves with **the largest radius possible** (cl. 4.4.4).',
      ],
    },
    right: { kicker: 'eq. (6) · Table 3', title: 'How tight at this speed?' },
  },
  {
    id: 'turning', title: 'Turning circles', prompt: 'Run each vehicle round its tightest turn and compare the strip it sweeps.',
    left: {
      kicker: 'Spread 7 · cl. 4.4.5 · Fig. 9', title: 'Turning circles',
      lede: 'The minimum radius is also governed by the minimum turning circle of a vehicle (cl. 4.4.5).',
      paras: [
        'Public service vehicles sweep circles of at most **19.812 m** diameter up to 8.230 m long, **21.641 m** up to 10.973 m long and **23.774 m** beyond. Commercial vehicles range from 9 to over 26 m, mostly 12 to 21 m. Cars, 1.4 to 1.9 m wide and 3 to 5.5 m long, turn in 7.6 to 13.7 m (cl. 4.4.5).',
        'A vehicle cannot go from straight to full lock at once, and the rear wheels of long articulated vehicles cut the corner, so a **minimum radius of 26 m** is desirable where trucks ply (cl. 4.4.5, Table 3).',
      ],
    },
    right: { kicker: 'cl. 4.4.5 · Fig. 9', title: 'Swept paths' },
  },
  {
    id: 'check', title: 'Design check', prompt: 'Pick an example, then drag the radius and check it against Table 3.',
    left: {
      kicker: 'Spread 8 · Examples 11.1, 11.2', title: 'Design check',
      lede: 'Every curve design in Section 11 starts the same way: class and terrain give the design speed, and the speed gives the minimum radius.',
      paras: [
        '**Example 11.1**: a Major District Road in very flat country. Ruling design speed 80 km/h (Table 2); minimum radius 230 m (Table 3); the curve of 250 m is OK.',
        '**Example 11.2**: a National Highway in plain country. 100 km/h (Table 2); minimum desirable radius 360 m (Table 3); Rc = 400 m is chosen.',
      ],
      notes: ['Example 11.1 states a radius of 260 m in its data but works with 250 m throughout; the check holds either way.'],
    },
    right: { kicker: 'Examples 11.1, 11.2', title: 'Speed, then radius' },
  },
];

export const QUIZ = [];
