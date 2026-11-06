// The words on the pages. Numbers are quoted from IRC : 2-1968 with the clause in brackets.
export const BOOK = {
  title: 'The Route Marker',
  subtitle: 'IRC : 2-1968 · a holographic chapter',
  credit: 'built from IRC : 2-1968',
  foot: 'IRC : 2-1968 · Route Marker Signs for National Highways',
  cover: {
    title: ['The Route', 'Marker'],
    kicker: 'I R C : 2 - 1 9 6 8   ·   A  H O L O G R A P H I C  C H A P T E R',
    foot: ['ROUTE MARKER SIGNS FOR NATIONAL HIGHWAYS', 'Indian Roads Congress · first published 1953 · first revision 1968'],
  },
};

export const COVER = {
  insideCover: {
    side: 'left', kicker: 'About this chapter', title: 'One sign, seven spreads.',
    lede: 'Every National Highway in India carried the same yellow shield. This chapter builds it the way the 1968 standard does: by the millimetre.',
    paras: [
      'The route marker was first drawn in the Roads Wing of the Ministry of Transport and discussed at the Chief Engineers’ meeting of **April 1952**. It became an Indian Roads Congress standard in **1953** (cl. 1.1).',
      'When the country went metric, the standard had to follow. The Specifications and Standards Committee reworked it through 1967; the Executive Committee approved the revision on **24 September 1968** and the Council adopted it at Bombay on **2 November 1968** (cl. 1.2).',
      'Turn the pages in order. Each right-hand page projects a hologram you can take apart, measure, repaint or plant beside a road.',
    ],
    notes: ['Dimensions in this book are in millimetres unless a metre sign says otherwise. Where the scan and the text disagree (one clause says 60 mm where the plate says 60 cm) the book follows the plate.'],
    foot: 'The Route Marker',
  },
  insideBack: {
    side: 'left', kicker: 'About this chapter · Sources', title: 'One sign, seven spreads.',
    lede: 'Every National Highway in India carried the same yellow shield. This chapter built it the way the 1968 standard does: by the millimetre.',
    paras: [
      'The route marker was first drawn in the Roads Wing of the Ministry of Transport and discussed at the Chief Engineers’ meeting of **April 1952**; it became an Indian Roads Congress standard in **1953**. The metric revision was approved on **24 September 1968** and adopted at Bombay on **2 November 1968** (cl. 1.1, 1.2).',
      '**Source.** IRC : 2-1968, Route Marker Signs for National Highways (First Revision), Indian Roads Congress, New Delhi. First published December 1953, revised December 1968, reprinted July 1985. Clauses 1–7, Fig. 1 and Plates 1–5.',
      'Colour hexes shown here stand in for Indian Standard colour numbers 309 (Canary Yellow) and 630 (grey); the standard specifies the numbers, not the shades on a screen. The numerals are set in a bold grotesque at the Plate 5 height and spacing, not the plate’s constructed letterforms.',
    ],
    notes: ['Where the scan and the text disagree (one clause says 60 mm where the plate says 60 cm) the book follows the plate. Built with three.js. Nothing here is a substitute for the standard itself.'],
    foot: 'The Route Marker',
  },
};

// Spreads 1..7. `left` is the reading page; `right` carries the hologram and a short caption.
export const LESSONS = [null,
  {
    id: 'shield', title: 'Drawing the shield', prompt: 'Follow the three steps. Then explore.',
    left: {
      kicker: 'Spread 1 · Design', title: 'Drawing the shield',
      lede: 'A National Highway route marker is a **shield painted on a rectangular plate 450 mm by 600 mm** (cl. 2.1).',
      paras: [
        'The plate has **12 mm** corners. Inside it, a **10 mm** black border traces the shield, set **12 mm** in from the edge, with a small notch at the top centre (Plate 1).',
        'From the top down, the plate is divided into bands: **75 mm** of breathing space, **100 mm** for the letters N H, **75 mm** more, **200 mm** for the route number, and **126 mm** to the point of the shield. With the two 12 mm margins that is exactly **600 mm**.',
        'The sides run straight for **360 mm** below the top strip; the bottom **215 mm** is a curve struck with **R 318** arcs and a central **R 132**, joined to the sides with **R 120** fillets.',
      ],
      notes: ['Why a shield? It was the one outline a driver could tell from every other sign at a glance, long before colour was reliable at night.'],
    },
    right: { kicker: 'Plate 1', title: 'The fabrication drawing', paras: ['A 600 mm steel rule runs down the left. Drag the amber cursor across the plate to read the height from the top and the band it is in. **Make it** paints the plate in shop order; **Wrong plate** shows what a 450 × 500 sheet does to it.'] },
  },
  {
    id: 'numerals', title: 'Letters and numbers', prompt: 'Follow the three steps. Then type any route number.',
    left: {
      kicker: 'Spread 2 · Lettering', title: 'Letters and numbers',
      lede: 'The letters **N** and **H** are **100 mm** high with a **16 mm** stroke, each **67 mm** wide and **45 mm** apart (Fig. 1).',
      paras: [
        'The route number is set in **20 cm** numerals (Plate 5). Each numeral is drawn with a **31 mm** stroke and most are **134 mm** wide.',
        'Numerals are not spaced evenly. Plate 5 gives a **code number** for every pair, from the preceding numeral and the following one, and a second table turns the code into millimetres: **code 1 → 47 mm, code 2 → 38 mm, code 4 → 13 mm**.',
        'So a 1 followed by a 1 gets 47 mm of air, while a 4 followed by a 7, two open shapes, are pulled to within 13 mm. The eye sees even spacing; the ruler does not.',
      ],
      notes: ['Spacing is measured horizontally from the extreme right edge of the preceding numeral to the extreme left edge of the following one (Plate 5, note).'],
    },
    right: { kicker: 'Fig. 1 and Plate 5', title: 'The layout board', paras: ['Type digits (up to three) or pick a route. A spacer slug drops in between each pair, cut to the millimetres Plate 5 gives it. The strip below shows the same number from 100 m with even gaps and with Plate 5 gaps; tap it to try even spacing on the sign.'] },
  },
  {
    id: 'paint', title: 'Paint it right', prompt: 'Follow the three steps. Then explore.',
    left: {
      kicker: 'Spread 3 · Colour and materials', title: 'Paint it right',
      lede: 'The background is yellow, the lettering and border black (cl. 2.2). Not any yellow: **Canary Yellow, Indian Standard Colour No. 309**.',
      paras: [
        'The back of the sign is painted an **unobtrusive grey, IS Colour No. 630**, like every other traffic sign (cl. 6).',
        'The post wears **25 cm bands, alternately black and white, with the lowest band next to the ground black** (cl. 6). The post itself is a **75 × 75 × 10 mm T-iron** or any other suitable arrangement (Plate 2).',
        'The sign may be of either **enamelled or painted steel plate** (cl. 7), with paint to Indian Standards Institution requirements.',
        'Why two colours on the post? Against a bright sky a white post vanishes; against trees a black one does. Alternating bands always leave something to see.',
      ],
      notes: ['The 1968 text predates retro-reflective sheeting: the colours do the work by day. What a glossy face does under a headlamp at night belongs with the location rules, on the next spread.'],
    },
    right: { kicker: 'Clauses 2.2, 6 and 7', title: 'The colour schedule', paras: ['The schedule names every shade by its Indian Standard number. Tap the backdrop to change what stands behind the post, compare the plain posts with the banded one, and tap a plate sample for its finish. The headlamp test waits on the next spread, with the location rules.'] },
  },
  {
    id: 'place', title: 'Where it stands', prompt: 'Follow the three steps. Then explore.',
    left: {
      kicker: 'Spread 4 · Location', title: 'Where it stands',
      lede: 'The sign goes up **ahead of intersections** with other important roads, **immediately after** them as a confirmatory marker, through built-up areas, and wherever through traffic needs guiding (cl. 3.1).',
      paras: [
        'Ahead of a junction the marker stands **100 to 150 m** before it, **on the left-hand side** as one approaches (cl. 3.4). After the junction the confirmatory marker stands **15 to 30 m** past it (Plate 2).',
        'On a road without kerbs, leave **2 to 3 m** clear between the post and the edge of the carriageway. With kerbs, keep the post **not less than 60 cm** from the kerb edge (cl. 3.3, Plate 2).',
        'The top of the shield is **2250 mm** above the crown of the road: a 600 mm shield, a 150 mm gap, a 250 mm definition plate and 1250 mm of post (Plate 2).',
        'The same clause turns the face **slightly away from the road** (cl. 3.3): angle in equals angle out, so a square face sends a headlamp straight back into the driver’s eye. The standard fixes the distance; the speed decides the time: 100 m is six seconds at 60 km/h, four and a half at 80.',
      ],
      notes: ['Clause 3.3 as printed says 60 mm from the kerb. Plate 2 says 60 cm, and 60 mm would put the post in the gutter.'],
    },
    right: { kicker: 'Plate 2 and cl. 3.3', title: 'Arrangement for erection', paras: ['Drag the post along the approach; the readout turns green inside 100–150 m. Three insets above: what the driver sees, the roadside section, and the plan of the face turned slightly away so the headlamp does not come straight back. The long section below carries the sight line.'] },
  },
  {
    id: 'arrows', title: 'Which way now?', prompt: 'Follow the three steps. Then explore.',
    left: {
      kicker: 'Spread 5 · Definition plate', title: 'Which way now?',
      lede: 'Ahead of a junction the shield alone is not enough. The direction the National Highway takes is shown on a **definition plate, 300 mm by 250 mm, fixed below the shield** (cl. 4.1).',
      paras: [
        'The plate is the same Canary Yellow; its **10 mm** border and the arrow are black (cl. 4.2). Plate 3 draws six typical arrows: straight ahead, a turn, a fork, a double-headed arrow for a route that may be followed both ways.',
        'Every arrow is built from the same parts: a **45 mm** shaft and a head **90 mm** long and **100 mm** across. The straight-ahead arrow stands on a short bar, the road it leaves.',
        'The six are examples only. For other situations, the standard says, arrows **could be suitably evolved on similar lines** (Plate 3, note 3).',
      ],
      notes: ['The definition plate hangs 150 mm below the shield and its bottom edge sits 1250 mm above the road (Plate 2).'],
    },
    right: { kicker: 'Plate 3', title: 'One arrow per junction', paras: ['Choose the junction type and the arm the National Highway takes. The plate gets the arrow for that move, built from Plate 3’s parts, and the car drives it. **Wrong arrow** hangs a plate that lies, and the car follows the lie.'] },
  },
  {
    id: 'junction', title: 'Two routes, one post', prompt: 'Start with the schedule. Then the plan.',
    left: {
      kicker: 'Spread 6 · Assemblies', title: 'Two routes, one post',
      lede: 'Where a numbered route crosses or leaves a National Highway, its marker goes up **on the same post** as the marker of the highway being travelled (cl. 5.1).',
      paras: [
        'Each shield gets its own definition plate: a **single arrow** for the route that carries on, a **double-headed arrow** for the route that may be followed either way.',
        'Plate 4 works two examples. At the crossroads of **NH 6 and NH 7**, every approach carries the pair 100 to 150 m before the junction, and every exit carries a single confirmatory shield 15 to 30 m after it.',
        'Where **NH 26** forks off **NH 7**, the pair on the approach shows NH 7 straight on and NH 26 bearing away; the confirmatory shields after the fork name only the road you are now on.',
      ],
      notes: ['When the intersecting route is a State route the assembly is the same; only the shield changes (Plate 4, note).'],
    },
    right: { kicker: 'Plate 4', title: 'Route marker assembly at junctions', paras: ['Tap a marker on the plan to lift its assembly off the page. Switch between the crossroads and the fork.'] },
  },
  {
    id: 'review', title: 'Site inspection', prompt: 'Five things are wrong with this sign. Find them.',
    left: {
      kicker: 'Spread 7 · Review', title: 'Site inspection',
      lede: 'Seven clauses, five plates, one shield. Here is the whole standard on one post, as an inspector would check it: seven items, one from each part of the standard.',
      paras: [
        '**Design.** 450 × 600 mm plate, 10 mm black border, Canary Yellow IS 309, letters 100 mm, numerals 200 mm (cl. 2, Plates 1, 5).',
        '**Location.** 100–150 m ahead of a junction on the left, 15–30 m after it; 2–3 m from an unkerbed carriageway, 60 cm from a kerb; turned slightly away from the road (cl. 3, Plate 2).',
        '**Definition plate.** 300 × 250 mm under the shield, black arrow (cl. 4, Plate 3). **Assemblies.** Two routes share a post, each with its own arrow (cl. 5, Plate 4).',
        '**Back and post.** Grey IS 630; 25 cm black-and-white bands, lowest black (cl. 6). **Material.** Enamelled or painted steel (cl. 7).',
      ],
    },
    right: { kicker: 'Inspection', title: 'As found on site', paras: ['Tap each check. A failed item names the clause and is corrected on the sign as you watch.'] },
  },
];

export const QUIZ = [
  { q: 'A route marker is 450 mm wide. How tall is it?', a: '600 mm. The shield is painted on a 450 × 600 mm plate (cl. 2.1).' },
  { q: 'NH 44: how far apart are the two 4s?', a: '13 mm. A 4 followed by a 4 is code 4 in Table 1, and code 4 is 13 mm in Table 2 (Plate 5).' },
  { q: 'Which band of the post touches the ground?', a: 'A black one. 25 cm bands, alternately black and white, lowest band black (cl. 6).' },
  { q: 'How far before a junction does the marker stand, and on which side?', a: '100 to 150 m before it, on the left-hand side as you approach (cl. 3.4).' },
];
